(function(){
'use strict';
const BG=window.BirdsGame;
const $=s=>document.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t); if(c) e.className=c; if(h!==undefined) e.innerHTML=h; return e;};
const FAMC={Academy:'#2f7fd8',Legion:'#d23c32',Court:'#e2a800',Guild:'#3f9a45',Circle:'#7b4fc9'};
const FAMI={Academy:'♫',Legion:'⚑',Court:'♛',Guild:'❦',Circle:'☾'};
const PAY={blue:'n\'importe quelle nourriture',red:'vers uniquement',yellow:'vers (1) + graines (2)',green:'vers (1) + fruits (2)',purple:'vers + cartes défaussées'};
const TREEC={grey:'#7d7d7d',yellow:'#e8b923',green:'#3d9a3d'};
const BON_FR={rune:'Amulette',reveal3:'Révéler 3',reveal2:'Révéler 2',seagull:'Mouette',worm:'1 ver',chick:'1 Poussin',dragonscale:'1 Écaille',elders:'Anciens +1',grow:'Éclore 1 Œuf',draw:'Piocher 1',seedOrFruit:'Graine ou fruit',buildAny:'Construire (toute île)',gatherAny:'Récolter (toute île)',expandAny:'S\'étendre (toute île)',ruinChick:'Poussin sur Ruine',brood:'Couvée',play1:'Jouer 1 carte',removeCheapest:'Retirer bâtiment'};
let G=null, pending=null, aiSpeed=500, viewer=0, filterTarget=null;

const IC=(t,c)=>`url(icons/${t}${String(c).toLowerCase()==='#ffffff'?'_k':''}.png)`;
const wt=(d,c)=>{if(String(c).toLowerCase()==='#ffffff') d.classList.add('wt'); return d;};
const STAR=(sz,c)=>`<span class="st3" style="width:${sz}px;height:${sz}px"><i style="${c?`--sc:${c}`:''}"></i></span>`;
function esc(s){return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);}
const IMG=new Set(['B','G','P','R'].flatMap(f=>Array.from({length:16},(_,i)=>f+(i+1))));
function cardHTML(id,cls){const c=G.card(id); if(!c) return '';
  if(true) return `<div class="card img ${cls||''}" data-card="${id}"><img src="cards/${id}.jpg" alt="${esc(c.name)}" draggable="false"></div>`;
  const fam=FAMC[c.family];
  const fx=[c.instant&&`<div class="fx"><b>⚡</b> ${esc(c.instant)}</div>`,c.dragonscale&&`<div class="fx"><b>◈</b> ${esc(c.dragonscale)}</div>`,c.brood&&`<div class="fx"><b>↻</b> ${esc(c.brood)}</div>`].filter(Boolean).join('');
  return `<div class="card ${cls||''}" style="--fam:${fam}" data-card="${id}"><div class="ch"><span class="cost">${c.cost}</span><span class="cn">${esc(c.name)}</span></div><div class="ctag">${FAMI[c.family].repeat(c.tags)} <span>${c.family}</span></div><div class="cfx">${fx}</div><div class="cpay">${PAY[c.color]}</div></div>`;}

const io={
  aiDelay:500,
  sleep:ms=>new Promise(r=>setTimeout(r,ms)),
  log:m=>{const L=$('#log'); if(!L) return; const d=el('div','',esc(m).replace(/★/g,STAR(13))); if(m.startsWith('—')) d.className='turn'; if(m.startsWith('★')) d.className='star'; L.prepend(d);},
  render:()=>render(),
  ask:(p,q)=>new Promise(res=>{pending={p,q,res}; viewer=p.i; filterTarget=null; render();}),
  gameOver:r=>showEnd(r)
};
function answer(v){const r=pending.res; pending=null; filterTarget=null; render(); r(v);}

function start(opts){ $('#setup').style.display='none'; $('#game').style.display='flex'; $('#log').innerHTML='';
  G=new BG.Game(opts,io); io.aiDelay=aiSpeed; $('#boardimg').src=G.boardKey==='p2'?'board2p.jpg':'board34p.jpg';
  viewer=G.players.findIndex(p=>!p.ai); if(viewer<0) viewer=0; render(); G.run();}

function targetKey(t){return t?`${t.kind}:${t.rid??''}:${t.sid??''}:${t.k??''}`:'';}
function render(){ if(!G) return; renderBoard(); renderPlayers(); renderPrompt(); renderHand(); renderElders();}
function renderBoard(){const L=$('#overlay'); L.innerHTML=''; const add=(x,y,cls,html,title)=>{const d=el('div','tok '+cls,html||''); d.style.left=x+'%'; d.style.top=y+'%'; if(title) d.title=title; L.appendChild(d); return d;};
  const pc=o=>o==='N'?BG.NEUTRAL:G.players[o].color;
  G.B.regions.forEach(r=>{ if(G.trees[r.id]) add(r.tree.x,r.tree.y,'tree','',`Arbre (${r.tree.color})`).style.setProperty('--c',TREEC[G.trees[r.id]]);
    else add(r.tree.x,r.tree.y,'treeinfo','',`Emplacement d'arbre ${r.tree.color} — bonus : ${r.tree.bonus.map(b=>BON_FR[b]).join(' + ')}`);
    r.slots.forEach((s,k)=>{const o=G.slots[r.id][k]; if(o!==null){const d=wt(add(s.x,s.y,'chick'),pc(o)); d.style.setProperty('--c',pc(o)); d.style.setProperty('--ico',IC('chick',pc(o)));}});
    r.ruins.forEach((s,k)=>{const o=G.ruins[r.id][k]; if(o!==null){const d=wt(add(s.x,s.y,'chick ruin'),pc(o)); d.style.setProperty('--c',pc(o)); d.style.setProperty('--ico',IC('chick',pc(o)));}});});
  G.B.nests.forEach(s=>{const b=G.nestOwner[s.id]; if(b) {const d=add(s.x,s.y,'bld wood','',BG.BUILD_FR[b.type]); wt(d,pc(b.owner)); d.style.setProperty('--c',pc(b.owner)); d.style.setProperty('--ico',IC(b.type,pc(b.owner)));}});
  G.B.flock.forEach((f,k)=>{const isl=BG.ISLANDS[k]; const st=G.settled[isl];
    if(st===undefined) add(f.x+2.35,f.y-3.3,'settle',STAR(26),`Étoile de Colonie (${BG.ISL_FR[isl]}) : 6 de présence`); else add(f.x+2.35,f.y-3.3,'settle taken',STAR(26),`Colonie de ${G.players[st].name}`).style.setProperty('--c',G.players[st].color);
    const here=G.players.filter(p=>p.flock===k); here.forEach((p,j)=>{{const d=wt(add(f.x-1.6+j*1.6,f.y+(j%2?0.9:-0.9),'flock wood','',`Vol de ${p.name}`),p.color); d.style.setProperty('--c',p.color); d.style.setProperty('--ico',IC('flock',p.color));}});
    const pres=G.players.map(p=>G.presence(isl,p.i)); const d=add(f.x,f.y+4.3,'pres',pres.map((v,i)=>`<i style="background:${G.players[i].color}${G.players[i].color==='#ffffff'?';color:#222;border-color:#999':''}">${v}</i>`).join('')); d.title='Présence (6 = Colonie)';});
  G.B.cards.forEach((c,k)=>{const id=G.row[k]; if(!id) return; const d=add(c.x,c.y,'rowcard',cardHTML(id,'mini'));});
  {const cur=G.players[G.current]; let reach=null;
    if(pending&&!pending.p.ai){const fl=pending.q.options.filter(o=>o.target&&o.target.kind==='flock'&&pending.q.title.startsWith('Où va')); if(fl.length) reach=new Set(fl.map(o=>o.target.k));}
    if(!reach&&cur&&!cur.ai&&!G.over){reach=new Set(); G.adjacentRowSlots(cur.flock).filter(k=>G.row[k]).forEach(k=>G.moveDests(cur,G.card(G.row[k]).cost).forEach(d=>reach.add(d)));}
    if(reach){const SH=window.SHADES[G.boardKey]; BG.ISLANDS.forEach((isl,k)=>{ if(reach.has(k)) return; const r=SH[isl]; const d=el('div','shade'); d.style.cssText=`left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%;background-image:url(icons/shade_${G.boardKey}_${isl}.png)`; d.title=`${BG.ISL_FR[isl]} : hors de portée de votre Vol ce tour-ci`; L.prepend(d);});}}
  if(G.B.parch){const P=G.B.parch; G.objs.forEach(O=>{const k=O.color==='red'?'red':'blue'; const t=P[k].tile;
      const d=add(t.x,t.y,'objtile',`<img src="obj/${O.d.id}_${G.boardKey==='p2'?'2':'34'}.jpg">`,`${O.d.name} : ${O.d.fr}`); d.style.width=P.tileW+'%';
      P[k].stars.forEach((s,i)=>{ if(i>=O.th.length) return; if(i<O.claims.length){const q=G.players[O.claims[i]]; const x=add(s.x,s.y,'settle taken','',`Étoile prise par ${q.name}`); x.style.setProperty('--c',q.color);} else add(s.x,s.y,'pstar',STAR(30),`Seuil ${O.th[i]}`);});});}
  // cibles
  if(pending&&!pending.p.ai){const seen={}; pending.q.options.forEach(o=>{ if(!o.target) return; const key=targetKey(o.target); if(seen[key]) return; seen[key]=1; const t=o.target; let x,y,cls='target';
      if(t.kind==='region'){const r=G.regions[t.rid]; x=r.tree.x; y=r.tree.y; cls+=' big';}
      else if(t.kind==='nest'){const s=G.nestById[t.sid]; x=s.x; y=s.y;}
      else if(t.kind==='flock'){const f=G.B.flock[t.k]; x=f.x; y=f.y; cls+=' big';}
      else if(t.kind==='row'){const c=G.B.cards[t.k]; x=c.x; y=c.y; cls+=' rowt';}
      else if(t.kind==='ruin'){const r=G.regions[t.rid].ruins[t.k]; x=r.x; y=r.y;}
      const d=add(x,y,cls); if(filterTarget===key) d.classList.add('sel');
      d.onclick=()=>{const same=pending.q.options.filter(o=>targetKey(o.target)===key); if(same.length===1) answer(same[0].value); else {filterTarget=key; render();}};});}
}
const FI=(t,h)=>`<img class="fdi" src="icons/${t}.png" style="height:${h||17}px" alt="${t}">`;
function food(f){return `<span class="fd" title="Vers">${FI('worm')} ${f.worm}</span><span class="fd" title="Graines">${FI('seed')} ${f.seed}</span><span class="fd" title="Fruits">${FI('fruit')} ${f.fruit}</span>`;}
function renderPlayers(){const P=$('#players'); P.innerHTML='';
  G.players.forEach(p=>{const d=el('div','pl'+(G.current===p.i?' cur':'')); d.style.setProperty('--c',p.color);
    const t=G.tags(p);
    d.innerHTML=`<div class="pn"><span class="dot"></span>${esc(p.name)}${p.ai?' <small>IA</small>':''}<span class="stars" title="${p.stars} Étoile(s)">${p.stars?STAR(15).repeat(p.stars):'<small>0 ★</small>'}</span></div>
    <div class="pr">${food(p.food)}<span title="Poussins disponibles"><i class="ico" style="--i:${IC('chick',p.color)};--c:${p.color}"></i> ${p.chicks}</span><span title="Œufs / capacité des Nids"><i class="ico" style="--i:${IC('egg',p.color)};--c:${p.color}"></i> ${p.eggs}/${G.nestCap(p)}</span><span title="Réserve">◌ ${p.supply}</span><span title="Cartes en main">🂠 ${p.hand.length}</span></div>
    <div class="pr small"><span title="Mouettes (niveaux : ${p.seagulls.join(', ')||'—'})"><img src="icons/seagull.png" style="height:13px;vertical-align:-2px"> ${p.seagulls.length}</span><span title="Amulettes : ${p.runes.map(k=>BG.RUNES[k]).join(' ; ')||'aucune'}"><img src="icons/amulet.png" style="height:14px;vertical-align:-3px;border-radius:3px"> ${p.runes.length}</span><span title="Chemin des Anciens : case ${p.elders||(p.eldersTotal?12:0)}${p.eldersTotal>=12?` (tour ${Math.floor(p.eldersTotal/12)+(p.elders?1:0)})`:''}"><img src="icons/elders.png" style="height:14px;vertical-align:-3px"> ${p.elders||(p.eldersTotal?12:0)}</span></div>
    ${p.pobj?`<div class="pr small">Objectif perso : <b>${esc(p.pobj.name)}</b> (${p.pobj.tags.join(' + ')}) : ${G.persoValue(p)} / ${BG.PERSO_TH[Math.min(p.pClaims,1)]}${p.pClaims?` · ★${p.pClaims}`:''}</div>`:''}<div class="pr small tags">${BG.FAMS.map(f=>`<span title="${f}" class="tagc"><img src="icons/tag_${f}.png"> ${t[f]}</span>`).join('')}</div>`;
    d.onclick=()=>{viewer=p.i; render();}; P.appendChild(d);});
  $('#round').textContent=`Manche ${G.round}${G.endTriggered?' — dernière manche':''} · Pioche ${G.deck.length}`;
  $('#objs').innerHTML=G.objs.map(O=>{const o=O.d; return `<div><b style="color:${O.color==='red'?'#c0392b':'#2f6fb5'}">Objectif ${O.color==='red'?'rouge':'bleu'} — ${esc(o.name)}</b> : ${esc(o.fr)}. Seuils : ${O.th.map((t,k)=>k<O.claims.length?`<s>${t}</s> <span class="dot" style="background:${G.players[O.claims[k]].color}"></span>`:(k===O.claims.length?`<b>${t}</b>`:t)).join(' · ')} ${STAR(12).repeat(O.th.length-O.claims.length)}<br><small>${G.players.map(p=>`<span style="color:${p.color}">${esc(p.name)} : ${o.m(G,p)}</span>`).join(' · ')}</small></div>`;}).join('<div style="height:4px"></div>');}
function renderElders(){const E=$('#elders'); E.innerHTML='<div class="eh">Chemin des Anciens</div>'; const row=el('div','etrack');
  for(let k=0;k<BG.ELDERS_LEN;k++){const c=el('div','esp'); const b=BG.ELDERS_BONUS[k]; c.innerHTML=`<span class="en">${k===0?'0 / 12':k}</span>${b?`<span class="eb" title="${BG.ELDERS_FR[b]}">${({anyFood:'<img src="icons/anyfood.png" style="height:15px;vertical-align:-3px">',seagull:'<img src="icons/seagull.png" style="height:15px;vertical-align:-3px">',rune:'<img src="icons/amulet.png" style="width:14px;vertical-align:-2px">',chickOr2ds:'<img src="icons/chickicon.png" style="height:14px;vertical-align:-2px">/<img src="icons/scale.png" style="height:13px;vertical-align:-2px">',star:STAR(15)})[b]}</span>`:''}`;
    G.players.filter(p=>p.elders===k).forEach(p=>{const m=wt(el('i','em wood'),p.color); m.style.setProperty('--c',p.color); c.appendChild(m);}); row.appendChild(c);}
  E.appendChild(row);}
function renderPersonal(){let M=$('#pchoice'); const show=pending&&!pending.p.ai&&pending.q.personal;
  if(!show){if(M) M.remove(); return false;}
  if(!M){M=el('div',''); M.id='pchoice'; $('#boardwrap').appendChild(M);}
  const {p,q}=pending; M.innerHTML=`<div class="pcbox"><div class="pct"><span class="dot" style="background:${p.color}"></span> ${esc(p.name)} — choisissez votre objectif personnel</div><div class="pcsub">L'autre est défaussé. 1 Étoile quand le total des deux tags atteint 5, puis 1 autre à 9. Les ressources du bas sont gagnées tout de suite.</div><div class="pcards"></div><div class="pchint">Votre main est visible plus bas : faites défiler si besoin.</div></div>`;
  q.options.forEach(o=>{const b=el('button','pcard',`<img src="perso/${o.value.id}.jpg" alt="${esc(o.value.name)}"><span>${esc(o.value.name)}<small>${o.value.tags.join(' + ')}</small></span>`); b.onclick=()=>answer(o.value); M.querySelector('.pcards').appendChild(b);});
  return true;}
function renderPrompt(){const Q=$('#prompt'); Q.innerHTML=''; if(renderPersonal()){Q.innerHTML=`<div class="qt">Choisissez votre objectif personnel sur le plateau.</div>`; return;}
  if(G.over){Q.innerHTML='<div class="qt">Partie terminée</div>'; return;}
  if(!pending){const p=G.players[G.current]; Q.innerHTML=`<div class="qt wait" style="--c:${p.color}">${esc(p.name)} réfléchit…</div>`; return;}
  const {p,q}=pending; const h=el('div','qt',`<span class="dot" style="background:${p.color}"></span> ${esc(p.name)} — <span>${esc(q.title)}</span>`); Q.appendChild(h);
  let opts=q.options; if(filterTarget) opts=opts.filter(o=>targetKey(o.target)===filterTarget);
  const box=el('div','opts');
  const ACT=l=>/^Déplacer le Vol/.test(l)?'flockmove':/^Jouer jusqu/.test(l)?'play':/^Couvée/.test(l)?'brood':/^S'étendre/.test(l)?'expand':/^Récolter/.test(l)?'gather':/^Construire/.test(l)?'build':null;
  if(q.main){box.className='opts main'; opts.forEach(o=>{const a=o.value&&o.value.ds?null:ACT(o.label); const ic=a==='flockmove'?`<span class="mvic" style="--c:${p.color}"><img src="${IC('flock',p.color).slice(4,-1)}"></span>`:(a?`<img src="icons/act_${a}.png">`:(o.card?`<img src="cards/${o.card}.jpg" class="dsic">`:''));
      const b=el('button','actb'+(o.disabled?' off':''),`${ic}<span>${esc(o.label)}</span>${o.disabled&&o.why?`<small>${esc(o.why)}</small>`:''}`); if(!o.disabled) b.onclick=()=>answer(o.value); else b.title=o.why||''; box.appendChild(b);}); Q.appendChild(box); return;}
  opts.forEach(o=>{let b; if(o.card&&q.cards){b=el('button','ob cardbtn',cardHTML(o.card,'mid'));} else {{const a=ACT(o.label); b=el('button','ob',(a&&a!=='flockmove'?`<img class="obi" src="icons/act_${a}.png">`:'')+esc(o.label));} if(o.card) b.title=G.card(o.card).name;}
    b.onclick=()=>answer(o.value); box.appendChild(b);});
  if(filterTarget){const b=el('button','ob ghost','← Autres choix'); b.onclick=()=>{filterTarget=null; render();}; box.appendChild(b);}
  if(q.cancel){const b=el('button','ob ghost','Annuler'); b.onclick=()=>answer(null); box.appendChild(b);}
  Q.appendChild(box);
  if(q.options.some(o=>o.target)&&!filterTarget) Q.appendChild(el('div','hint','Astuce : vous pouvez aussi cliquer directement sur les cibles en surbrillance sur le plateau.'));}
const PB={"amu": [[1.25, 12.31], [1.25, 31.36], [1.25, 50.61], [1.25, 69.66], [1.25, 88.9]], "pstar": [[21.25, 7.4], [27.08, 7.4]], "rstar": [[42.5, 7.4]], "bstar": [[56.67, 7.4]], "cstar": [[72.33, 7.8], [77.5, 7.8], [82.5, 7.8], [87.5, 7.8], [92.67, 7.8]], "wk": [[29.58, 53.55], [38.5, 53.55], [47.33, 53.55], [56.17, 53.55]], "sh": [[19.58, 93.22], [40.83, 93.22], [62.08, 93.22], [83.33, 93.22]], "nest": [[70.0, 31.95], [92.5, 31.95], [92.5, 62.39], [70.0, 62.39]], "chick": [81.25, 46.68]};
function pboard(p){const W=el('div','pboard'); W.innerHTML='<img src="pboard.png" class="pbimg" alt="Plateau joueur">'; const add=(xy,cls,html,title,dx=0,dy=0)=>{const d=el('div','pbt '+cls,html||''); d.style.left=(xy[0]+dx)+'%'; d.style.top=(xy[1]+dy)+'%'; if(title) d.title=title; W.appendChild(d); return d;};
  if(p.pobj){const c=el('div','pbobj'); c.innerHTML=`<img src="perso/${p.pobj.id}.jpg" alt="${esc(p.pobj.name)}">`; c.title=`Objectif personnel : ${p.pobj.name} (${p.pobj.tags.join(' + ')}) — ${G.persoValue(p)} / ${BG.PERSO_TH[Math.min(p.pClaims,1)]}`; W.appendChild(c); W.classList.add('hasobj');}
  const wood=(xy,type,title)=>{const d=wt(add(xy,'wood pbw','',title),p.color); d.style.setProperty('--c',p.color); d.style.setProperty('--ico',IC(type,p.color));};
  p.left.nest.forEach(l=>wood(PB.nest[l],'nest',`Nid ${l} (pas encore construit)`));
  p.left.shrine.forEach(l=>wood(PB.sh[l],'shrine',`Sanctuaire ${l+1} (pas encore construit)`));
  p.left.workshop.forEach(l=>wood(PB.wk[l],'workshop',`Atelier ${l+1} (pas encore construit)`));
  const built=[0,...p.built.nest.slice().sort()]; const per=G.nestCap(p)/p.nests; let left=p.eggs;
  built.forEach(l=>{for(let j=0;j<per&&left>0;j++,left--){const off=per<=2?(j?2.3:-2.3):(-3+j*2.2); const d=wt(add(PB.nest[l],'pbegg','','Œuf',off,1),p.color); d.style.setProperty('--c',p.color); d.style.setProperty('--i',IC('egg',p.color));}});
  p.runes.forEach(k=>add(PB.amu[k],'pbamu','<img src="icons/amulet.png">',BG.RUNES[k]));
  const red=G.objs[0].claims.includes(p.i)?1:0, blue=G.objs[1].claims.includes(p.i)?1:0;
  for(let k=0;k<Math.min(2,p.pClaims);k++) add(PB.pstar[k],'pbstar',STAR(30),'Objectif personnel');
  if(red) add(PB.rstar[0],'pbstar',STAR(30),'Objectif rouge'); if(blue) add(PB.bstar[0],'pbstar',STAR(30),'Objectif bleu');
  const other=Math.max(0,p.stars-Math.min(2,p.pClaims)-red-blue); for(let k=0;k<Math.min(5,other);k++) add(PB.cstar[k],'pbstar',STAR(30),'Colonie, Chemin des Anciens ou carte');
  const n=p.chicks; for(let k=0;k<Math.min(n,10);k++){const a=k*2.399, r=1.3*Math.sqrt(k); const d=wt(add(PB.chick,'pbchick','',`${n} Poussin(s) disponible(s)`,r*Math.cos(a)*1.1,r*Math.sin(a)*2-2),p.color); d.style.setProperty('--c',p.color); d.style.setProperty('--ico',IC('chick',p.color));}
  add(PB.chick,'pbn',`${n}`,'Poussins disponibles',0,9);
  let anyRel=false;
  p.built.shrine.forEach(l=>{const rel=p.tableau.filter(e=>e.shrine===l); const free=(G.shrineFree(p).find(s=>s.l===l)||{}).free;
    const z=el('div','pbrel'); z.style.left=PB.sh[l][0]+'%';
    z.innerHTML=rel.map(e=>`<div class="relc" data-card="${e.id}" title="${esc(G.card(e.id).name)}"><img src="cards/${e.id}.jpg">${window.COND_STARS[e.id]&&!e.starTaken?`<span class="cstar" title="Étoile en attente : condition non remplie">${STAR(26)}</span>`:''}${e.ds?`<div class="ds">${'<img src="icons/scale.png">'.repeat(Math.min(e.ds,4))}</div>`:''}</div>`).join('')+`<div class="relfree">Sanctuaire ${l+1} · ${free} place${free>1?'s':''} libre${free>1?'s':''}</div>`;
    if(rel.length) anyRel=true; W.appendChild(z);});
  if(p.built.shrine.length) W.classList.add('hasrel');
  return W;}
function renderHand(){const H=$('#hand'); H.innerHTML=''; const p=G.players[viewer]; if(!p) return;
  const own=!p.ai||G.players.every(q=>q.ai);
  H.appendChild(el('div','hh',`<span class="dot" style="background:${p.color}"></span> ${esc(p.name)} — main (${p.hand.length})${own?'':' : cachée'}`));
  const hr=el('div','cards'); if(own) p.hand.forEach(id=>hr.insertAdjacentHTML('beforeend',cardHTML(id,'mid'))); H.appendChild(hr);
  H.appendChild(el('div','hh',`Cartes en jeu (${p.tableau.filter(e=>e.shrine===undefined).length})${p.tableau.some(e=>e.shrine!==undefined)?` · Sanctuaires : ${p.built.shrine.map(l=>{const f=G.shrineFree(p).find(s=>s.l===l); return 'S'+(l+1)+' ('+f.free+' libre)';}).join(', ')}`:''}${p.seagulls.length?` · Mouettes : ${p.seagulls.map(s=>'niveau '+s).join(', ')}`:''}${p.runes.length?` · Amulettes : ${p.runes.map(k=>BG.RUNES[k]).join(' ; ')}`:''}`));
  const tr=el('div','cards'); p.tableau.filter(e=>e.shrine===undefined).forEach(e=>{tr.insertAdjacentHTML('beforeend',cardHTML(e.id,'mid'+(e.ds?' hasds':''))); if(e.ds){const last=tr.lastElementChild; last.insertAdjacentHTML('beforeend',`<div class="ds" title="${e.ds} Écaille${e.ds>1?'s':''} de dragon">${'<img src="icons/scale.png">'.repeat(Math.min(e.ds,6))}${e.ds>6?`<b>×${e.ds}</b>`:''}</div>`);}}); H.appendChild(tr);
  H.appendChild(pboard(p));
  }
function showEnd(r){const M=$('#modal'); M.style.display='flex'; M.innerHTML=`<div class="mbox"><h2>Fin de partie</h2>${r.map((p,i)=>`<div class="rk"><b>${i+1}.</b> <span class="dot" style="background:${p.color}"></span> ${esc(p.name)} — ${p.stars} ${STAR(16)} <small>(${p.starLog.join(', ')||'—'})</small></div>`).join('')}<button class="ob" onclick="location.reload()">Nouvelle partie</button></div>`;}

// zoom sur une carte au survol
document.addEventListener('mouseover',e=>{const c=e.target.closest('.card,.relc,.crow'); const Z=$('#zoom'); if(!c||!G){Z.style.display='none';return;} Z.innerHTML=cardHTML(c.dataset.card,'big'); Z.style.display='block';});
document.addEventListener('mousemove',e=>{const Z=$('#zoom'); if(Z.style.display!=='block') return; const w=240; let x=e.clientX+18, y=e.clientY+18; if(x+w>innerWidth) x=e.clientX-w-18; if(y+330>innerHeight) y=innerHeight-340; Z.style.left=x+'px'; Z.style.top=Math.max(4,y)+'px';});

// écran de configuration
function setup(){const EN=window.I18N&&I18N.lang==='en'; $('#langseg').querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.v===(EN?'en':'fr')); b.onclick=()=>{ if(b.dataset.v!==I18N.lang){I18N.set(b.dataset.v); location.reload();}};});
  const n=$('#np'), seats=$('#seats'); const types=['h','ai','ai','ai']; const cols=BG.COLORS.slice(); const CN=['Rouge','Bleu','Blanc','Violet'];
  const seg=(id,fn)=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); fn(b.dataset.v);});
  const draw=()=>{const names=[...seats.querySelectorAll('input')].map(i=>i.value); seats.innerHTML='';
    for(let i=0;i<+n.value;i++){const c=cols[i]; const r=el('div','seat');
      r.innerHTML=`<span class="stok" style="--c:${c}" title="Changer de couleur (${CN[BG.COLORS.indexOf(c)]})" data-i="${i}"><img src="${String(c).toLowerCase()==='#ffffff'?'icons/flock_k.png':'icons/flock.png'}"></span><input id="nm${i}" value="${esc(names[i]||(types[i]==='h'?(i===0?(EN?'You':'Vous'):(EN?'Player ':'Joueur ')+(i+1)):(EN?'AI ':'IA ')+i))}" maxlength="16"><select id="ty${i}" hidden><option value="h">h</option><option value="ai">ai</option></select><div class="seg" id="tseg${i}"><button data-v="h">Humain</button><button data-v="ai">IA</button></div>`;
      seats.appendChild(r); r.querySelector('.stok').onclick=()=>{const k=(BG.COLORS.indexOf(cols[i])+1)%4, nc=BG.COLORS[k], j=cols.indexOf(nc); cols[j]=cols[i]; cols[i]=nc; draw();}; $('#ty'+i).value=types[i]; r.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.v===types[i]));
      seg('#tseg'+i,v=>{types[i]=v; $('#ty'+i).value=v; const inp=$('#nm'+i); if(/^(IA \d|AI \d|Joueur \d|Player \d|Vous|You)$/.test(inp.value)) inp.value=v==='h'?(i===0?(EN?'You':'Vous'):(EN?'Player ':'Joueur ')+(i+1)):(EN?'AI ':'IA ')+i;});}};
  seg('#npseg',v=>{n.value=v; draw();}); n.onchange=()=>{$('#npseg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.v===n.value)); draw();};
  seg('#spseg',v=>{$('#speed').value=v; aiSpeed=+v; io.aiDelay=aiSpeed;}); $('#speed').onchange=e=>{aiSpeed=+e.target.value; io.aiDelay=aiSpeed;};
  for(let i=0;i<4;i++){} draw();
  // keep hidden selects usable by scripts
  seats.addEventListener('change',e=>{const m=e.target.id.match(/^ty(\d)$/); if(m){types[+m[1]]=e.target.value;}});
  $('#go').onclick=()=>{const players=[]; for(let i=0;i<+n.value;i++) players.push({name:$('#nm'+i).value||('Joueur '+(i+1)),ai:$('#ty'+i).value==='ai',color:cols[i]}); start({players});};
  if(window.I18N) I18N.start();}
window.addEventListener('DOMContentLoaded',setup);
})();
