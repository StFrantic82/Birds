(function(){
'use strict';
const BG=window.BirdsGame;
const $=s=>document.querySelector(s);
const el=(t,c,h)=>{const e=document.createElement(t); if(c) e.className=c; if(h!==undefined) e.innerHTML=h; return e;};
const FAMC={Academy:'#2f7fd8',Legion:'#d23c32',Court:'#e2a800',Guild:'#3f9a45',Circle:'#7b4fc9'};
const FAMI={Academy:'♫',Legion:'⚑',Court:'♛',Guild:'❦',Circle:'☾'};
const PAY={blue:'n\'importe quelle nourriture',red:'vers uniquement',yellow:'vers (1) + graines (2)',green:'vers (1) + fruits (2)',purple:'vers + cartes défaussées'};
const TREEC={grey:'#7d7d7d',yellow:'#e8b923',green:'#3d9a3d'};
const BON_FR={rune:'Rune',reveal3:'Révéler 3',reveal2:'Révéler 2',seagull:'Mouette',worm:'1 ver',chick:'1 Poussin',dragonscale:'1 Écaille',elders:'Anciens +1',grow:'Éclore 1 Œuf',draw:'Piocher 1',seedOrFruit:'Graine ou fruit',buildAny:'Construire (toute île)',gatherAny:'Récolter (toute île)',expandAny:'S\'étendre (toute île)',ruinChick:'Poussin sur Ruine',brood:'Couvée',play1:'Jouer 1 carte',removeCheapest:'Retirer bâtiment'};
let persoSet='new'; try{persoSet=localStorage.getItem('birds_pset')||'new';}catch(e){} window.BirdsPersoSet=persoSet;
let G=null, pending=null, aiSpeed=0, viewer=0, filterTarget=null, lastHuman=null;
// Partie en ligne : role 'host' (fait tourner le moteur) ou 'guest' (affiche l'état reçu et envoie ses choix)
const NET={role:null,db:null,user:null,uid:null,code:null,seat:-1,seats:[],gref:null,qid:0,status:'lobby',ranking:null,writing:false,dirty:false,timer:null,lastAct:{},unsub:[],canWrite:null};
const mine=p=>!!p&&(NET.role==='guest'?p.i===NET.seat:(!p.ai&&!p.remote));

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

// texte du jeu : traduit, puis îles et ressources remplacées par leurs icônes
const ISLW={fr:{Prairie:'meadow',Jungle:'jungle','Désert':'desert',Montagne:'mountain',Toundra:'tundra',Marais:'marsh'},en:{Meadow:'meadow',Jungle:'jungle',Desert:'desert',Mountain:'mountain',Tundra:'tundra',Marsh:'marsh'},it:{Prateria:'meadow',Giungla:'jungle',Deserto:'desert',Montagna:'mountain',Tundra:'tundra',Palude:'marsh'}};
const FOODW=[[/^(vers?|worms?|verm[ei])$/i,'worm'],[/^(graines?|seeds?|sem[ei])$/i,'seed'],[/^(fruits?|frutt[oi])$/i,'fruit'],[/^(poussins?|chicks?|pulcin[oi])$/i,'chickicon'],[/^(œufs?|eggs?|uov[oa])$/i,'egg_k']];
function iconify(h){ const lg=window.I18N?I18N.lang:'fr'; const W=ISLW[lg]||ISLW.fr;
  h=h.replace(new RegExp('(^|[^\\wÀ-ÿ])('+Object.keys(W).join('|')+')(?![\\wÀ-ÿ])','g'),(m,a,n)=>`${a}<img class="isli" src="icons/isl_${W[n]}.png" alt="${n}" title="${n}">`);
  h=h.replace(/(\d+)\s+([A-Za-zÀ-ÿœŒ]+)(?![\wÀ-ÿ])/g,(m,n,w)=>{ const f=FOODW.find(([re])=>re.test(w)); return f?`${n}<img class="fdi" src="icons/${f[1]}.png" alt="${w}" title="${w}">`:m; });
  h=h.replace(/1 (nourriture au choix|food of your choice|cibo a scelta)/g,'1<img class="fdi" src="icons/anyfood.png" alt="$1" title="$1">');
  return h; }
const FMT=s=>`<span class="notr">${iconify(esc(window.I18N?I18N.tr(String(s)):String(s)))}</span>`;
const TOFF=(q,o)=>!!(window.BirdsTuto&&window.BirdsTuto.off(q,o));
const io={
  aiDelay:0,
  sleep:ms=>new Promise(r=>setTimeout(r,ms)),
  log:m=>{ if(window.BirdsTuto) BirdsTuto.log(m); const L=$('#log'); if(!L) return; const d=el('div','',`<span class="notr">${iconify(esc(window.I18N?I18N.tr(m):m)).replace(/★/g,STAR(13))}</span>`); if(m.startsWith('—')) d.className='turn'; if(m.startsWith('★')) d.className='star'; L.prepend(d);},
  render:()=>render(),
  ask:(p,q)=>{ if(!p.ai&&U.queue&&U.queue.length){const a=U.queue.shift(); U.hist.push(a); return Promise.resolve(a.c?null:q.options[a.i].value);}
    return new Promise((res,rej)=>{pending={p,q,res,rej}; if(p.remote) NET.qid++; else viewer=p.i; filterTarget=null; render(); if(p.remote) netPublish(true);});},
  gameOver:r=>{ if(NET.role==='host'){NET.status='over'; NET.rec=window.BirdsStats?window.BirdsStats.all().slice(-1)[0]:null; NET.ranking=r.map(p=>({name:p.name,color:p.color,stars:p.stars,starLog:p.starLog})); netPublish(true);} showEnd(r);},
  // annulation (voir Game.takeTurnUndoable)
  undoable:true,
  beginTurn:(replay,first)=>{ if(first){U.log=$('#log').innerHTML; return;} U.hist=[]; U.queue=replay.slice(); U.active=true;},
  endTurn:()=>{U.active=false; U.hist=[]; U.queue=null;},
  undone:()=>{$('#log').innerHTML=U.log;}
};
const U={hist:[],queue:null,active:false,log:''};
function hostCanUndo(){return U.active&&U.hist.length>0&&pending&&!pending.p.ai;}
function canUndo(){ if(NET.role==='guest') return !!(pending&&pending.q.undo); return hostCanUndo()&&mine(pending.p);}
function undo(){ if(NET.role==='guest'){ if(canUndo()) netAct({undo:1}); return;} if(!hostCanUndo()) return; const rej=pending.rej; const replay=U.hist.slice(0,-1); pending=null; filterTarget=null; rej({undo:true,replay});}
function answer(v){ if(NET.role==='guest'){ netAct(v===null||v===undefined?{c:1}:{i:v}); pending=null; filterTarget=null; render(); return;}
  const q=pending.q, r=pending.res; if(window.BirdsTuto) BirdsTuto.answered(q,v); if(U.active&&!pending.p.ai){const i=q.options.findIndex(o=>o.value===v); U.hist.push(i>=0?{i}:{c:1});} pending=null; filterTarget=null; render(); r(v);}

function start(opts,before){ opts.persoSet=opts.persoSet||persoSet; $('#setup').style.display='none'; $('#game').style.display='flex'; $('#log').innerHTML='';
  G=new BG.Game(opts,io); io.aiDelay=aiSpeed;
  io.lookahead={k:6,r:3,yield:true}; // IA la plus forte : poids appris + anticipation par simulations
  $('#boardimg').src=G.boardKey==='p2'?'board2p.jpg':'board34p.jpg'; if(before) before(G);
  viewer=G.players.findIndex(p=>mine(p)); if(viewer<0) viewer=0; lastHuman=null; render(); G.run();}

function targetKey(t){return t?`${t.kind}:${t.rid??''}:${t.sid??''}:${t.k??''}`:'';}
function render(){ if(!G) return; renderBoard(); renderPlayers(); renderPrompt(); renderHand(); renderElders(); if(NET.role==='host') netPublish(false); if(window.BirdsTuto) BirdsTuto.draw();}
function renderBoard(){const L=$('#overlay'); L.innerHTML=''; const add=(x,y,cls,html,title)=>{const d=el('div','tok '+cls,html||''); d.style.left=x+'%'; d.style.top=y+'%'; if(title) d.title=title; L.appendChild(d); return d;};
  const pc=o=>o==='N'?BG.NEUTRAL:G.players[o].color;
  G.B.regions.forEach(r=>{ if(G.trees[r.id]) add(r.tree.x,r.tree.y,'tree','',`Arbre (${r.tree.color})`).style.setProperty('--c',TREEC[G.trees[r.id]]);
    else add(r.tree.x,r.tree.y,'treeinfo','',`Emplacement d'arbre ${r.tree.color} — bonus : ${r.tree.bonus.map(b=>BON_FR[b]).join(' + ')}`);
    r.slots.forEach((s,k)=>{const o=G.slots[r.id][k]; if(o!==null){const d=wt(add(s.x,s.y,'chick'),pc(o)); d.style.setProperty('--c',pc(o)); d.style.setProperty('--ico',IC('chick',pc(o)));}});
    r.ruins.forEach((s,k)=>{const o=G.ruins[r.id][k]; if(o!==null){const d=wt(add(s.x,s.y,'chick ruin'),pc(o)); d.style.setProperty('--c',pc(o)); d.style.setProperty('--ico',IC('chick',pc(o)));}});});
  G.B.nests.forEach(s=>{const b=G.nestOwner[s.id]; if(b) {const d=add(s.x,s.y,'bld wood','',BG.BUILD_FR[b.type]); wt(d,pc(b.owner)); d.style.setProperty('--c',pc(b.owner)); d.style.setProperty('--ico',IC(b.type,pc(b.owner)));}});
  G.B.flock.forEach((f,k)=>{const isl=BG.ISLANDS[k]; const st=G.settled[isl];
    if(st===undefined) add(f.x+2.35,f.y-3.3,'settle',STAR(26),`Étoile de Colonie (${BG.ISL_FR[isl]}) : 6 de présence`); else add(f.x+2.35,f.y-3.3,'settle taken',STAR(26),`Colonie de ${G.players[st].name}`).style.setProperty('--c',G.players[st].color);
    const here=G.players.filter(p=>p.flock===k); here.forEach((p,j)=>{{const d=wt(add(f.x-1.6+j*1.6,f.y+(j%2?0.9:-0.9),'flock wood','',`Nuée de ${p.name}`),p.color); d.style.setProperty('--c',p.color); d.style.setProperty('--ico',IC('flock',p.color));}});
    const pres=G.players.map(p=>G.presence(isl,p.i)); const d=add(f.x,f.y+4.3,'pres',pres.map((v,i)=>`<i style="background:${G.players[i].color}${G.players[i].color==='#ffffff'?';color:#222;border-color:#999':''}">${v}</i>`).join('')); d.title='Présence (6 = Colonie)';});
  G.B.cards.forEach((c,k)=>{const id=G.row[k]; if(!id) return; const d=add(c.x,c.y,'rowcard',cardHTML(id,'mini'));});
  {const cur=G.players[G.current]; let reach=null;
    if(pending&&mine(pending.p)){const fl=pending.q.options.filter(o=>o.target&&o.target.kind==='flock'&&pending.q.title.startsWith('Où va')); if(fl.length) reach=new Set(fl.map(o=>o.target.k));}
    if(!reach&&cur&&mine(cur)&&!G.over){reach=new Set(); G.adjacentRowSlots(cur.flock).filter(k=>G.row[k]).forEach(k=>G.moveDests(cur,G.card(G.row[k]).cost).forEach(d=>reach.add(d)));}
    if(reach){const SH=window.SHADES[G.boardKey]; BG.ISLANDS.forEach((isl,k)=>{ if(reach.has(k)) return; const r=SH[isl]; const d=el('div','shade'); d.style.cssText=`left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%;background-image:url(icons/shade_${G.boardKey}_${isl}.png)`; d.title=`${BG.ISL_FR[isl]} : hors de portée de votre Nuée ce tour-ci`; L.prepend(d);});}}
  if(G.B.parch){const P=G.B.parch; G.objs.forEach(O=>{const k=O.color==='red'?'red':'blue'; const t=P[k].tile;
      const d=add(t.x,t.y,'objtile',`<img src="obj/${O.d.id}_${G.boardKey==='p2'?'2':'34'}.jpg">`,`${O.d.name} : ${O.d.fr}`); d.style.width=P.tileW+'%';
      P[k].stars.forEach((s,i)=>{ if(i>=O.th.length) return; if(i<O.claims.length){const q=G.players[O.claims[i]]; const x=add(s.x,s.y,'settle taken','',`Étoile prise par ${q.name}`); x.style.setProperty('--c',q.color);} else add(s.x,s.y,'pstar',STAR(30),`Seuil ${O.th[i]}`);});});}
  // cibles
  if(pending&&mine(pending.p)){const seen={}; pending.q.options.forEach(o=>{ if(!o.target||TOFF(pending.q,o)) return; const key=targetKey(o.target); if(seen[key]) return; seen[key]=1; const t=o.target; let x,y,cls='target';
      if(t.kind==='region'){const r=G.regions[t.rid]; x=r.tree.x; y=r.tree.y; cls+=' big';}
      else if(t.kind==='nest'){const s=G.nestById[t.sid]; x=s.x; y=s.y;}
      else if(t.kind==='flock'){const f=G.B.flock[t.k]; x=f.x; y=f.y; cls+=' big';}
      else if(t.kind==='row'){const c=G.B.cards[t.k]; x=c.x; y=c.y; cls+=' rowt';}
      else if(t.kind==='ruin'){const r=G.regions[t.rid].ruins[t.k]; x=r.x; y=r.y;}
      const d=add(x,y,cls); if(filterTarget===key) d.classList.add('sel');
      d.onclick=()=>{const same=pending.q.options.filter(o=>targetKey(o.target)===key&&!TOFF(pending.q,o)); if(same.length===1) answer(same[0].value); else {filterTarget=key; render();}};});}
}
const FI=(t,h)=>`<img class="fdi" src="icons/${t}.png" style="height:${h||17}px" alt="${t}">`;
function food(f){return `<span class="fd" title="Vers">${FI('worm')} ${f.worm}</span><span class="fd" title="Graines">${FI('seed')} ${f.seed}</span><span class="fd" title="Fruits">${FI('fruit')} ${f.fruit}</span>`;}
function renderPlayers(){const P=$('#players'); P.innerHTML='';
  G.players.forEach(p=>{const d=el('div','pl'+(G.current===p.i?' cur':'')); d.style.setProperty('--c',p.color);
    const t=G.tags(p);
    d.innerHTML=`<div class="pn"><span class="dot"></span>${esc(p.name)}${p.ai?' <small>IA</small>':''}${p.remote?' <small class="onl">en ligne</small>':''}<span class="stars" title="${p.stars} Étoile(s)">${p.stars?STAR(15).repeat(p.stars):'<small>0 ★</small>'}</span></div>
    <div class="pr">${food(p.food)}<span title="Poussins disponibles"><i class="ico" style="--i:${IC('chick',p.color)};--c:${p.color}"></i> ${p.chicks}</span><span title="Œufs / capacité des Nids"><i class="ico" style="--i:${IC('egg',p.color)};--c:${p.color}"></i> ${p.eggs}/${G.nestCap(p)}</span></div>
    <div class="pr small"><span title="Mouettes (niveaux : ${p.seagulls.join(', ')||'—'})"><img src="icons/seagull.png" style="height:13px;vertical-align:-2px"> ${p.seagulls.length}</span><span title="Runes : ${p.runes.map(k=>BG.RUNES[k]).join(' ; ')||'aucune'}"><img src="icons/amulet.png" style="height:14px;vertical-align:-3px;border-radius:3px"> ${p.runes.length}</span><span title="Chemin des Anciens : case ${p.elders||(p.eldersTotal?12:0)}${p.eldersTotal>=12?` (tour ${Math.floor(p.eldersTotal/12)+(p.elders?1:0)})`:''}"><img src="icons/elders.png" style="height:14px;vertical-align:-3px"> ${p.elders||(p.eldersTotal?12:0)}</span></div>
    ${p.pobj?`<div class="pr small">Objectif perso : <b>${esc(p.pobj.name)}</b> ${p.pobj.tags.map(t=>`<img class="ptag" src="icons/tag_${t}.png" title="${t}" alt="${t}">`).join('+')} : ${G.persoValue(p)} / ${BG.PERSO_TH[Math.min(p.pClaims,1)]}${p.pClaims?` · ★${p.pClaims}`:''}</div>`:''}<div class="pr small tags">${BG.FAMS.map(f=>`<span title="${f}" class="tagc"><img src="icons/tag_${f}.png"> ${t[f]}</span>`).join('')}</div>`;
    d.onclick=()=>{viewer=p.i; render(); $('#hand').scrollIntoView({behavior:'smooth',block:'start'});}; d.title='Voir le plateau de '+p.name; P.appendChild(d);});
  $('#round').textContent=`Manche ${G.round}${G.endTriggered?' — dernière manche':''} · Pioche ${G.deck.length}`;
  $('#objs').innerHTML=G.objs.map(O=>{const o=O.d; return `<div class="objrow"><img class="objimg" src="obj/${o.id}_${G.boardKey==='p2'?'2':'34'}.jpg" alt="" title="Objectif ${O.color==='red'?'rouge':'bleu'}" style="border-color:${O.color==='red'?'#c0392b':'#2f6fb5'}"><div><b style="color:${O.color==='red'?'#c0392b':'#2f6fb5'}">${esc(o.name)}</b> : ${esc(o.fr)}. Seuils : ${O.th.map((t,k)=>k<O.claims.length?`<s>${t}</s> <span class="dot" style="background:${G.players[O.claims[k]].color}"></span>`:(k===O.claims.length?`<b>${t}</b>`:t)).join(' · ')} ${STAR(12).repeat(O.th.length-O.claims.length)}<br><small>${G.players.map(p=>`<span style="color:${p.color}">${esc(p.name)} : ${o.m(G,p)}</span>`).join(' · ')}</small></div></div>`;}).join('<div style="height:4px"></div>');}
function renderElders(){const E=$('#elders'); E.innerHTML='<div class="eh">Chemin des Anciens</div>'; const row=el('div','etrack');
  for(let k=0;k<BG.ELDERS_LEN;k++){const c=el('div','esp'); const b=BG.ELDERS_BONUS[k]; c.innerHTML=`<span class="en">${k===0?'0 / 12':k}</span>${b?`<span class="eb" title="${BG.ELDERS_FR[b]}">${({anyFood:'<img src="icons/anyfood.png" style="height:15px;vertical-align:-3px">',seagull:'<img src="icons/seagull.png" style="height:15px;vertical-align:-3px">',rune:'<img src="icons/amulet.png" style="width:14px;vertical-align:-2px">',chickOr2ds:'<img src="icons/chickicon.png" style="height:14px;vertical-align:-2px">/<img src="icons/scale.png" style="height:13px;vertical-align:-2px">',star:STAR(15)})[b]}</span>`:''}`;
    G.players.filter(p=>p.elders===k).forEach(p=>{const m=wt(el('i','em wood'),p.color); m.style.setProperty('--c',p.color); c.appendChild(m);}); row.appendChild(c);}
  E.appendChild(row);}
function renderPersonal(){let M=$('#pchoice'); const show=pending&&mine(pending.p)&&pending.q.personal;
  if(!show){if(M) M.remove(); return false;}
  if(!M){M=el('div',''); M.id='pchoice'; $('#boardwrap').appendChild(M);}
  const {p,q}=pending; M.innerHTML=`<div class="pcbox"><div class="pct"><span class="dot" style="background:${p.color}"></span> ${esc(p.name)} — choisissez votre objectif personnel</div><div class="pcsub">L'autre est défaussé. 1 Étoile quand le total des deux tags atteint 5, puis 1 autre à 9. Les ressources du bas sont gagnées tout de suite.</div><div class="pcards"></div><div class="pchint">Votre main est visible plus bas : faites défiler si besoin.</div></div>`;
  q.options.forEach(o=>{const v=o.pv||o.value; const b=el('button','pcard',`<img src="${G.persoSet==='new'?'perso2':'perso'}/${v.id}.jpg" alt="${esc(v.name)}"><span>${esc(v.name)}<small>${v.tags.join(' + ')}</small><small class="pres">Départ : ${esc(BG.resLabel?BG.resLabel(G.pres?G.pres(v):(v.res||{})):'')}</small></span>`); if(TOFF(q,o)) b.disabled=true; else b.onclick=()=>answer(o.value); M.querySelector('.pcards').appendChild(b);});
  return true;}
const BTYPE=l=>{const m=/\b(Nid|Sanctuaire|Atelier)\b/.exec(l||''); return m?{Nid:'nest',Sanctuaire:'shrine',Atelier:'workshop'}[m[1]]:null;};
const bico=(t,c)=>`<i class="bico wood${String(c).toLowerCase()==='#ffffff'?' wt':''}" style="--c:${c};--ico:${IC(t,c)}"></i>`;
function undoBtn(Q){ if(!canUndo()) return; const b=el('button','ob undo','↶ Annuler mon dernier choix'); b.title='Revenir au choix précédent (Ctrl+Z)'; b.onclick=undo; const h=Q.querySelector('.qt'); h.appendChild(b);}
function renderPrompt(){const Q=$('#prompt'); Q.innerHTML=''; if(renderPersonal()){Q.innerHTML=`<div class="qt">Choisissez votre objectif personnel sur le plateau.</div>`; return;}
  if(G.over){Q.innerHTML='<div class="qt">Partie terminée</div>'; return;}
  if(!pending||!mine(pending.p)){const p=pending?pending.p:G.players[G.current]; Q.innerHTML=`<div class="qt wait" style="--c:${p.color}">${esc(p.name)} réfléchit…${p.remote?' <small class="onl">en ligne</small>':''}</div>`; return;}
  const {p,q}=pending; const h=el('div','qt',`<span class="dot" style="background:${p.color}"></span> ${esc(p.name)} — <span>${FMT(q.title)}</span>`); Q.appendChild(h);
  let opts=q.options; if(filterTarget) opts=opts.filter(o=>targetKey(o.target)===filterTarget);
  const box=el('div','opts');
  const ACT=l=>/^Déplacer la Nuée/.test(l)?'flockmove':/^Jouer jusqu/.test(l)?'play':/^Couvée/.test(l)?'brood':/^S'étendre/.test(l)?'expand':/^Récolter/.test(l)?'gather':/^Construire/.test(l)?'build':null;
  if(q.main){box.className='opts main'; opts.forEach(o=>{const a=o.value&&o.value.ds?null:ACT(o.label); const ic=a==='flockmove'?`<span class="mvic" style="--c:${p.color}"><img src="${IC('flock',p.color).slice(4,-1)}"></span>`:(a?`<img src="icons/act_${a}.png">`:(o.card?`<img src="cards/${o.card}.jpg" class="dsic">`:''));
      const tof=TOFF(q,o); const b=el('button','actb'+(o.disabled||tof?' off':''),`${ic}<span>${esc(o.label)}</span>${o.disabled&&o.why?`<small>${esc(o.why)}</small>`:''}`); if(!o.disabled&&!tof) b.onclick=()=>answer(o.value); else b.title=o.why||''; box.appendChild(b);}); Q.appendChild(box); undoBtn(Q); return;}
  const pick=handPick(); if(pick) opts=opts.filter(o=>!pick.includes(o));
  opts.forEach(o=>{let b; if(o.card){b=el('button','ob cardbtn',cardHTML(o.card,'mid'));} else {{const a=ACT(o.label); const bt=BTYPE(o.label); b=el('button','ob',(bt?bico(bt,p.color):(a&&a!=='flockmove'?`<img class="obi" src="icons/act_${a}.png">`:''))+FMT(o.label));} if(o.card) b.title=G.card(o.card).name;}
    if(TOFF(q,o)){b.disabled=true; b.classList.add('off');} else b.onclick=()=>answer(o.value); box.appendChild(b);});
  if(filterTarget){const b=el('button','ob ghost','← Autres choix'); b.onclick=()=>{filterTarget=null; render();}; box.appendChild(b);}
  if(q.cancel){const b=el('button','ob ghost','Retour'); b.onclick=()=>answer(null); box.appendChild(b);}
  if(pick) Q.insertBefore(el('div','pickhint','👉 Cliquez directement sur une carte en surbrillance dans votre main.'),null);
  Q.appendChild(box); undoBtn(Q);
  if(q.options.some(o=>o.target)&&!filterTarget) Q.appendChild(el('div','hint','Astuce : vous pouvez aussi cliquer directement sur les cibles en surbrillance sur le plateau.'));}
const PB={"amu": [[1.25, 12.31], [1.25, 31.36], [1.25, 50.61], [1.25, 69.66], [1.25, 88.9]], "pstar": [[21.25, 7.4], [27.08, 7.4]], "rstar": [[42.5, 7.4]], "bstar": [[56.67, 7.4]], "cstar": [[72.33, 7.8], [77.5, 7.8], [82.5, 7.8], [87.5, 7.8], [92.67, 7.8]], "wk": [[29.58, 53.55], [38.5, 53.55], [47.33, 53.55], [56.17, 53.55]], "sh": [[19.58, 93.22], [40.83, 93.22], [62.08, 93.22], [83.33, 93.22]], "nest": [[70.0, 31.95], [92.5, 31.95], [92.5, 62.39], [70.0, 62.39]], "chick": [81.25, 46.68]};
function pboard(p){const W=el('div','pboard'); W.innerHTML='<img src="pboard.png" class="pbimg" alt="Plateau joueur">'; const add=(xy,cls,html,title,dx=0,dy=0)=>{const d=el('div','pbt '+cls,html||''); d.style.left=(xy[0]+dx)+'%'; d.style.top=(xy[1]+dy)+'%'; if(title) d.title=title; W.appendChild(d); return d;};
  if(p.pobj){const c=el('div','pbobj'); c.innerHTML=`<img src="${G.persoSet==='new'?'perso2':'perso'}/${p.pobj.id}.jpg" alt="${esc(p.pobj.name)}">`; c.title=`Objectif personnel : ${p.pobj.name} (${p.pobj.tags.join(' + ')}) — ${G.persoValue(p)} / ${BG.PERSO_TH[Math.min(p.pClaims,1)]}`; W.appendChild(c); W.classList.add('hasobj');}
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
  // Poussins disponibles : grille sans chevauchement dans le cercle central (4 par rangée, 12 affichés au plus)
  const n=p.chicks, shown=Math.min(n,12), perRow=shown>4?4:Math.max(shown,1), rows=Math.ceil(shown/perRow), DX=3.15, DY=7.4;
  for(let k=0;k<shown;k++){const r=Math.floor(k/perRow), inRow=Math.min(perRow,shown-r*perRow), c=k%perRow;
    const dx=(c-(inRow-1)/2)*DX, dy=-2.5+(r-(rows-1)/2)*DY;
    const d=wt(add(PB.chick,'pbchick','',`${n} Poussin${n>1?'s':''} disponible${n>1?'s':''}`,dx,dy),p.color); d.style.setProperty('--c',p.color); d.style.setProperty('--ico',IC('chick',p.color));}
  add(PB.chick,'pbn',n>shown?`${n} (+${n-shown})`:`${n}`,'Poussins disponibles',0,rows>2?14.5:12);
  let anyRel=false;
  p.built.shrine.forEach(l=>{const rel=p.tableau.filter(e=>e.shrine===l); const free=(G.shrineFree(p).find(s=>s.l===l)||{}).free;
    const z=el('div','pbrel'); z.style.left=PB.sh[l][0]+'%';
    z.innerHTML=rel.map(e=>`<div class="relc" data-card="${e.id}" title="${esc(G.card(e.id).name)}"><img src="cards/${e.id}.jpg">${window.COND_STARS[e.id]&&!e.starTaken?`<span class="cstar" title="Étoile en attente : condition non remplie">${STAR(26)}</span>`:''}${e.ds?`<div class="ds" title="${e.ds} Écaille${e.ds>1?'s':''} de dragon"><img src="icons/scale.png"><b>${e.ds}</b></div>`:''}</div>`).join('')+`<div class="relfree">Sanctuaire ${l+1} · ${free} place${free>1?'s':''} libre${free>1?'s':''}</div>`;
    if(rel.length) anyRel=true; W.appendChild(z);});
  if(p.built.shrine.length) W.classList.add('hasrel');
  return W;}
function gullHTML(l){const L=Math.max(1,Math.min(4,l)); return `<div class="card img mid gullc" data-card="S${L}" title="Mouette de niveau ${l} — améliorable jusqu'au niveau 4"><img src="cards/S${L}.jpg" alt="Mouette niveau ${l}" draggable="false"></div>`;}
function dockPlayer(){ if(NET.role==='guest') return G.players[NET.seat]||null; if(pending&&mine(pending.p)) return pending.p; const c=G.players[G.current]; if(c&&mine(c)) return c;
  if(lastHuman!==null) return G.players[lastHuman]; const h=G.players.find(q=>mine(q)); return h||null;}
function handPick(){ if(!pending||!mine(pending.p)) return null; const p=pending.p; const o=pending.q.options.filter(o=>o.card&&(o.h||o.value===o.card)&&p.hand.includes(o.card)&&!TOFF(pending.q,o)); return o.length?o:null;}
function renderMyHand(){const M=$('#myhand'); M.innerHTML=''; const p=dockPlayer(); if(!p) return; lastHuman=p.i;
  const pick=pending&&pending.p===p?handPick():null; M.classList.toggle('picking',!!pick);
  M.appendChild(el('div','mh',`<span class="dot" style="background:${p.color}"></span>${esc(p.name)} — main (${p.hand.length})<small>${pick?'cliquez une carte':'survol = zoom'}</small>`));
  const hr=el('div','cards'); if(p.hand.length) p.hand.forEach(id=>{hr.insertAdjacentHTML('beforeend',cardHTML(id,'mid')); const c=hr.lastElementChild;
      if(pick){const o=pick.find(o=>o.card===id); if(o){c.classList.add('pick'); c.title='Choisir '+G.card(id).name; c.onclick=()=>answer(o.value);} else c.classList.add('nopick');}});
    else hr.appendChild(el('div','empty','Aucune carte en main'));
  M.appendChild(hr);}
function renderHand(){renderMyHand(); const H=$('#hand'); H.innerHTML=''; const p=G.players[viewer]; if(!p) return;
  const tabs=el('div','ptabs'); G.players.forEach(q=>{const t=el('button','ptab'+(q.i===viewer?' on':'')+(G.current===q.i&&!G.over?' turn':''),`<span class="dot"></span>${esc(q.name)}${q.ai?' <span class="tn">IA</span>':''}${q.stars?` <span class="tn">${q.stars} ★</span>`:''}`); t.style.setProperty('--c',q.color); t.title=G.current===q.i?'Joue en ce moment':''; t.onclick=()=>{viewer=q.i; render();}; tabs.appendChild(t);}); H.appendChild(tabs);
  const allAI=G.players.every(q=>q.ai), inDock=lastHuman===p.i&&!allAI;
  if(!inDock){const sec=el('div','psec'); const own=mine(p)||allAI; sec.innerHTML=`<h4>Main <small>${p.hand.length} carte${p.hand.length>1?'s':''}${own?'':' · cachée'}</small></h4>`; const hr=el('div','tcards'); if(own) p.hand.forEach(id=>hr.insertAdjacentHTML('beforeend',cardHTML(id,'mid'))); sec.appendChild(hr); H.appendChild(sec);}
  const free=p.tableau.filter(e=>e.shrine===undefined);
  const sec=el('div','psec'); const n=free.length+p.seagulls.length;
  sec.innerHTML=`<h4>Cartes en jeu <small>${free.length} carte${free.length>1?'s':''}${p.seagulls.length?` · ${p.seagulls.length} Mouette${p.seagulls.length>1?'s':''}`:''}${p.runes.length?` · Runes : ${p.runes.map(k=>BG.RUNES[k]).join(' ; ')}`:''}</small></h4>`;
  const tr=el('div','tcards'); free.forEach(e=>{tr.insertAdjacentHTML('beforeend',cardHTML(e.id,'mid'+(e.ds?' hasds':''))); if(e.ds){const last=tr.lastElementChild; last.insertAdjacentHTML('beforeend',`<div class="ds" title="${e.ds} Écaille${e.ds>1?'s':''} de dragon"><img src="icons/scale.png"><b>${e.ds}</b></div>`);}});
  p.seagulls.forEach(l=>tr.insertAdjacentHTML('beforeend',gullHTML(l)));
  if(!n) tr.appendChild(el('div','pnone','Aucune carte en jeu pour l\'instant.'));
  sec.appendChild(tr); H.appendChild(sec);
  const ps=el('div','psec pboardsec'); ps.innerHTML=`<h4>Plateau joueur${p.built.shrine.length?` <small>Sanctuaires : ${p.built.shrine.map(l=>{const f=G.shrineFree(p).find(s=>s.l===l); return 'S'+(l+1)+' ('+f.free+' libre'+(f.free>1?'s':'')+')';}).join(', ')}</small>`:''}</h4>`; ps.appendChild(pboard(p)); H.appendChild(ps);
  }
function showEnd(r){const M=$('#modal'); M.style.display='flex'; M.innerHTML=`<div class="mbox"><h2>Fin de partie</h2>${r.map((p,i)=>`<div class="rk"><b>${i+1}.</b> <span class="dot" style="background:${p.color}"></span> ${esc(p.name)} — ${p.stars} ${STAR(16)} <small>(${p.starLog.join(', ')||'—'})</small></div>`).join('')}<button class="ob" onclick="location.reload()">Nouvelle partie</button></div>`; endShare();}
function endShare(){ const S=window.BirdsStats, M=$('#modal .mbox'); if(!S||!S.net()||!M) return; const rec=(NET.role==='guest'&&NET.rec)?NET.rec:S.all().slice(-1)[0]; if(!rec||rec.sim) return;
  const owner=NET.isOwner; if(owner) return;
  const box=el('div','eshare'); const done=S.isSent(rec.id); box.innerHTML=`<button class="ob" ${done?'disabled':''}>📤 ${done?'Stats envoyées':'Envoyer les stats de cette partie'}</button><span></span>`; M.insertBefore(box,M.querySelector('button.ob'));
  const b=box.querySelector('button'), msg=box.querySelector('span');
  b.onclick=async()=>{ b.disabled=true; msg.textContent=' Envoi…'; let from=''; try{from=localStorage.getItem('birds_from')||'';}catch(e){} if(!from&&G) from=G.players.filter(p=>mine(p)).map(p=>p.name).join(', ');
    try{ await S.send([rec],from); b.textContent='📤 Stats envoyées'; msg.textContent=' ✓ Merci !'; }catch(e){ b.disabled=false; msg.textContent=' Envoi refusé : votre accès à l\'appli ne le permet pas.'; } };}

document.addEventListener('keydown',e=>{ if(!pending||!mine(pending.p)||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||'')) return;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault(); undo();}
  else if(e.key==='Enter'&&pending.q.endTurn&&!pending.q.options.some(o=>TOFF(pending.q,o))&&!(window.BirdsTuto&&BirdsTuto.on&&BirdsTuto.off(pending.q,{}))){e.preventDefault(); answer(null);} });
// zoom sur une carte au survol
document.addEventListener('mouseover',e=>{const c=e.target.closest('.card,.relc,.crow'); const Z=$('#zoom'); if(!c||!c.dataset.card){Z.style.display='none';return;} Z.innerHTML=`<div class="card img big"><img src="cards/${c.dataset.card}.jpg"></div>`; Z.style.display='block';});
document.addEventListener('mousemove',e=>{const Z=$('#zoom'); if(Z.style.display!=='block') return; const w=240; let x=e.clientX+18, y=e.clientY+18; if(x+w>innerWidth) x=e.clientX-w-18; if(y+330>innerHeight) y=innerHeight-340; Z.style.left=x+'px'; Z.style.top=Math.max(4,y)+'px';});

// ================= Partie en ligne =================
const CODE_ABC='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function netSnap(){const sn=G.snapshot(); sn.objs=sn.objs.map(o=>Object.assign({},o,{d:o.d.id})); delete sn.redObj; delete sn.redThresholds; delete sn.redClaims; return JSON.stringify(sn);}
function serQ(q){return {title:q.title,main:!!q.main,cards:!!q.cards,cancel:!!q.cancel,personal:!!q.personal,endTurn:!!q.endTurn,
  options:q.options.map(o=>({label:o.label||'',card:o.card||null,target:o.target||null,disabled:!!o.disabled,why:o.why||'',h:(o.card&&o.value===o.card)?1:0,pv:q.personal&&o.value?{id:o.value.id,name:o.value.name,tags:o.value.tags,res:G.pres(o.value)}:null}))};}
function netDoc(){const d={v:1,host:NET.uid,status:NET.status,seats:NET.seats,t:Date.now(),pend:null,ranking:NET.ranking||null,rec:NET.status==='over'&&NET.rec?NET.rec:null};
  if(G){d.state=netSnap(); if(pending&&pending.p.remote) d.pend={seat:pending.p.i,qid:NET.qid,q:serQ(pending.q),undo:hostCanUndo()};}
  return d;}
async function netWrite(){ if(!NET.gref) return; if(NET.writing){NET.dirty=true; return;} NET.writing=true;
  try{ do{ NET.dirty=false; try{ await NET.gref.set(netDoc()); }catch(e){ console.warn('Birds en ligne : écriture refusée',e); if(e&&e.code==='unavailable') await new Promise(r=>setTimeout(r,800+Math.random()*800)); } } while(NET.dirty); }
  finally{ NET.writing=false; }}
function netPublish(now){ if(NET.role!=='host') return; if(now){ clearTimeout(NET.timer); NET.timer=null; netWrite(); return;} if(NET.timer) return; NET.timer=setTimeout(()=>{NET.timer=null; netWrite();},450);}
function netAct(a){ if(!NET.db||!pending) return; a.qid=pending.qid; a.k=Math.random().toString(36).slice(2); a.t=Date.now();
  NET.db.doc(`games/${NET.code}/acts/${NET.uid}`).set(a).catch(e=>{console.warn(e); setStatus('Votre choix n\'a pas pu être envoyé. Réessayez.');});}
function netOnAct(uid,a){ if(NET.role!=='host'||!a||!pending||!pending.p.remote) return; if(pending.p.remote!==uid||a.qid!==NET.qid||NET.lastAct[uid]===a.k) return; NET.lastAct[uid]=a.k;
  if(a.undo){ if(hostCanUndo()) undo(); return;}
  const o=a.c?null:pending.q.options[a.i]; if(!a.c&&(!o||o.disabled)) return; answer(a.c?null:o.value);}
// --- hôte
async function netCreate(cfg){ let code='', tries=0;
  do{ code=Array.from({length:4},()=>CODE_ABC[Math.floor(Math.random()*CODE_ABC.length)]).join('');
    if(NET.peerMode){ try{ NET.db=await window.BirdsPeer.host(code); break; }catch(e){ if(e&&e.code==='taken') continue; throw e; } }
    const g=await NET.db.doc('games/'+code).get(); if(!g.exists||(g.data()||{}).status==='over') break; }while(++tries<8);
  NET.role='host'; NET.code=code; NET.status='lobby'; NET.seats=cfg; NET.gref=NET.db.doc('games/'+code);
  await NET.gref.set(netDoc()); try{localStorage.setItem('birds_code',code);}catch(e){}
  NET.unsub.push(NET.db.collection(`games/${code}/joins`).onSnapshot(sn=>{ if(NET.status!=='lobby') return; let ch=false;
      sn.docs.forEach(d=>{const uid=d.id, j=d.data()||{}; if(NET.seats.some(x=>x.uid===uid)) return; const k=NET.seats.findIndex(x=>x.kind==='net'&&!x.uid); if(k<0) return;
        NET.seats[k].uid=uid; NET.seats[k].name=String(j.name||'Ami').slice(0,16); ch=true;});
      if(ch){ netWrite(); renderLobby(); }},e=>setStatus('Connexion perdue avec la partie en ligne.')));
  NET.unsub.push(NET.db.collection(`games/${code}/acts`).onSnapshot(sn=>sn.docChanges().forEach(c=>{ if(c.type!=='removed') netOnAct(c.doc.id,c.doc.data());}),e=>setStatus('Connexion perdue avec la partie en ligne.')));
  renderLobby();}
function netStartHost(){ const players=NET.seats.map(x=>({name:x.name,ai:x.kind==='ai',color:x.color})); NET.status='playing';
  start({players},g=>NET.seats.forEach((x,i)=>{ if(x.kind==='net') g.players[i].remote=x.uid;})); netPublish(true);}
// --- invité
async function netJoin(code,name){ code=code.toUpperCase().replace(/[^A-Z0-9]/g,''); if(code.length!==4){setStatus('Le code fait 4 caractères.'); return;}
  if(NET.peerMode){ setStatus('Connexion à la partie…'); try{ NET.db=await window.BirdsPeer.join(code); setStatus(''); }catch(e){ setStatus(e&&e.code==='notfound'?'Partie introuvable. Vérifiez le code, et que l\'hôte a bien la partie ouverte.':'Connexion impossible pour l\'instant. Réessayez.'); return; }
    NET.db.onLost=()=>setStatus('Connexion perdue avec la partie en ligne.'); }
  const g=await NET.db.doc('games/'+code).get(); if(!g.exists){setStatus('Partie introuvable. Vérifiez le code.'); return;}
  const d=g.data(); const seated=(d.seats||[]).some(x=>x.uid===NET.uid);
  if(d.host===NET.uid){setStatus('C\'est votre propre partie : elle n\'existe plus sur cet appareil.'); return;}
  if(!seated&&d.status!=='lobby'){setStatus('Cette partie a déjà commencé.'); return;}
  if(!seated&&!(d.seats||[]).some(x=>x.kind==='net'&&!x.uid)){setStatus('Cette partie est complète.'); return;}
  NET.role='guest'; NET.code=code; NET.gref=NET.db.doc('games/'+code); try{localStorage.setItem('birds_code',code);}catch(e){}
  if(!seated){ try{ await NET.db.doc(`games/${code}/joins/${NET.uid}`).set({name:String(name||'Ami').slice(0,16),t:Date.now()}); }catch(e){ NET.role=null; setStatus('Impossible de rejoindre : votre accès à l\'appli ne permet pas de jouer (il faut être Contributeur ou Éditeur).'); return;} }
  let timer=setTimeout(()=>setStatus('La partie ne répond pas encore…'),10000);
  NET.unsub.push(NET.gref.onSnapshot(sn=>{ if(!sn.metadata.fromCache){clearTimeout(timer);} if(!sn.exists) return; guestApply(sn.data());},e=>{clearTimeout(timer); setStatus('Connexion perdue avec la partie en ligne.');}));
  renderLobby();}
let lastQid=null;
function guestApply(d){ NET.seats=d.seats||[]; NET.status=d.status; NET.seat=NET.seats.findIndex(x=>x.uid===NET.uid);
  if(d.status==='lobby'||!d.state){ renderLobby(); return; }
  if(NET.seat<0){ setStatus('Vous n\'avez pas de place dans cette partie.'); return; }
  if(!G){ $('#setup').style.display='none'; $('#game').style.display='flex';
    G=new BG.Game({players:NET.seats.map(x=>({name:x.name,ai:x.kind==='ai',color:x.color}))},io); $('#boardimg').src=G.boardKey==='p2'?'board2p.jpg':'board34p.jpg'; viewer=NET.seat; }
  const sn=JSON.parse(d.state); const OBJ=[...BG.RED_OBJ,...BG.BLUE_OBJ]; sn.objs.forEach(o=>{o.d=OBJ.find(x=>x.id===o.d)||o.d;});
  G.restore(sn); G.redObj=G.objs[0].d; G.redThresholds=G.objs[0].th; G.redClaims=G.objs[0].claims;
  const L=$('#log'); L.innerHTML=''; (G.logs||[]).forEach(m=>io.log(m));
  const pd=d.pend; if(pd&&pd.seat===NET.seat){ const q=Object.assign({},pd.q,{undo:!!pd.undo,options:pd.q.options.map((o,i)=>Object.assign({},o,{value:i}))});
      if(lastQid!==pd.qid){filterTarget=null; viewer=NET.seat;} lastQid=pd.qid; pending={p:G.players[NET.seat],q,qid:pd.qid}; }
  else pending=null;
  if(d.status==='over'&&d.rec&&window.BirdsStats){ NET.rec=d.rec; if(!window.BirdsStats.all().some(g=>g.id===d.rec.id)) window.BirdsStats.add(Object.assign({},d.rec,{online:true})); }
  render(); if(d.status==='over'&&d.ranking&&$('#modal').style.display!=='flex') showEnd(d.ranking);}
// --- salle d'attente
function setStatus(m){const S=$('#netstatus'); if(S){S.textContent=m; S.hidden=!m;} if(G&&m){io.log('⚠ '+m);}}
function renderLobby(){const B=$('#lobby'); if(!B) return; $('#cfg').hidden=true; $('#onlpick').hidden=true; $('#modeseg').hidden=true; document.querySelectorAll('#setup .sect').forEach(e=>{ if(!e.closest('#cfg')&&!e.closest('#onljoin')) e.hidden=true;}); $('#onljoin').hidden=true; B.hidden=false; $('#go').hidden=true;
  const host=NET.role==='host'; const waiting=NET.seats.filter(x=>x.kind==='net'&&!x.uid).length;
  B.innerHTML=`<div class="lcode"><span>Code de la partie</span><b>${esc(NET.code||'')}</b><small>${host?'Donnez ce code à vos amis : ils le saisissent dans « En ligne → Rejoindre ».':'Vous êtes dans la salle d\'attente.'}</small></div>
    <div class="lseats">${NET.seats.map((x,i)=>`<div class="lseat"><span class="dot" style="background:${x.color}"></span><span class="ln"></span><small>${x.kind==='ai'?'IA':x.kind==='host'?'hôte':(x.uid?(x.uid===NET.uid?'vous':'en ligne'):'en attente…')}</small></div>`).join('')}</div>
    ${host?`<button id="lgo" class="lgo" ${waiting?'disabled':''}>${waiting?`En attente de ${waiting} joueur${waiting>1?'s':''}…`:'Lancer la partie'}</button>`:`<div class="lwait">${NET.seat>=0?'En attente du lancement par l\'hôte…':'Demande envoyée, en attente d\'une place…'}</div>`}`;
  B.querySelectorAll('.lseat .ln').forEach((e,i)=>e.textContent=NET.seats[i].uid||NET.seats[i].kind!=='net'?NET.seats[i].name:'Place libre');
  const g=$('#lgo'); if(g) g.onclick=()=>{ if(!NET.seats.some(x=>x.kind==='net'&&!x.uid)) netStartHost(); };}
function netPid(){ try{ NET.uid=localStorage.getItem('birds_pid'); if(!NET.uid){ NET.uid='p'+Math.random().toString(36).slice(2,12)+Date.now().toString(36); localStorage.setItem('birds_pid',NET.uid);} }catch(e){ NET.uid=NET.uid||('p'+Math.random().toString(36).slice(2,12)); } }
function netReady(){ const box=$('#onlnote'); if(box) box.textContent=''; $('#modeseg').querySelector('[data-v="online"]').disabled=false; try{const c=localStorage.getItem('birds_code'); if(c) $('#jcode').value=c;}catch(e){} }
// hors de claude.ai (ex. GitHub Pages) : connexion directe entre navigateurs (peerdb.js)
async function netInitPeer(){ const box=$('#onlnote'); netPid();
  if(!window.BirdsPeer){ if(box) box.textContent='Mode en ligne indisponible ici.'; return;}
  const ok=await window.BirdsPeer.loadPeerJS(); if(!ok){ if(box) box.textContent='Mode en ligne indisponible : la connexion directe n\'a pas pu être chargée (vérifiez votre connexion Internet).'; return;}
  NET.peerMode=true; netReady(); }
async function netInit(){ const box=$('#onlnote'); if(!window.claude||!window.claude.use){ return netInitPeer(); }
  try{ NET.db=await claude.use('db'); }catch(e){ NET.db=null; }
  try{ NET.user=await claude.use('user'); NET.canWrite=NET.user?await NET.user.can('data.write'):null; }catch(e){ NET.canWrite=null; }
  netPid();
  if(!NET.db){ if(box) box.textContent='Mode en ligne indisponible : connectez-vous à votre compte Claude pour jouer en ligne.'; return;}
  try{ NET.isOwner=NET.user?await NET.user.isOwner():false; }catch(e){ NET.isOwner=false; }
  window.BirdsNet={db:NET.db,user:NET.user}; if(window.BirdsStats&&BirdsStats.loadAIW) BirdsStats.loadAIW();
  if(NET.canWrite===false){ if(box) box.textContent='Votre accès à l\'appli est en lecture seule : demandez au propriétaire de vous la partager en Contributeur (ou Éditeur) pour jouer en ligne.'; return;}
  netReady(); }
window.BirdsUI={get G(){return G;},render:()=>render()};
function startTuto(){ const IT=window.I18N&&I18N.lang==='it', EN=window.I18N&&I18N.lang==='en';
  start({players:[{name:IT?'Tu':EN?'You':'Vous',ai:false,color:BG.COLORS[0]},{name:'IA',ai:true,color:BG.COLORS[1]}],persoSet:'new'},g=>{ g.noStats=true; io.lookahead=null; io.aiDelay=650; });
  window.BirdsTuto.start({get G(){return G;},get pending(){return pending;},render});}
// écran de configuration
function setup(){ try{ window.BirdsStats&&BirdsStats.applyAIW&&BirdsStats.applyAIW(BirdsStats.aiwInfo()); }catch(e){}
const LG=window.I18N?I18N.lang:'fr', EN=LG==='en', IT=LG==='it'; const L3=(fr,en,it)=>IT?it:EN?en:fr; $('#langseg').querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.v===LG); b.onclick=()=>{ if(b.dataset.v!==I18N.lang){I18N.set(b.dataset.v); location.reload();}};});
  let MODE='local', SUB='create'; const ONL=()=>MODE==='online'&&SUB==='create';
  const n=$('#np'), seats=$('#seats'); const types=['h','ai','ai','ai']; const cols=BG.COLORS.slice(); const CN=['Rouge','Bleu','Blanc','Violet'];
  const seg=(id,fn)=>$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{$(id).querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b)); fn(b.dataset.v);});
  const draw=()=>{const names=[...seats.querySelectorAll('input')].map(i=>i.value); seats.innerHTML='';
    for(let i=0;i<+n.value;i++){const c=cols[i]; const r=el('div','seat');
      r.innerHTML=`<span class="stok" style="--c:${c}" title="Changer de couleur (${CN[BG.COLORS.indexOf(c)]})" data-i="${i}"><img src="${String(c).toLowerCase()==='#ffffff'?'icons/flock_k.png':'icons/flock.png'}"></span><input id="nm${i}" value="${esc(names[i]||(types[i]==='h'?(i===0?L3('Vous','You','Tu'):L3('Joueur ','Player ','Giocatore ')+(i+1)):L3('IA ','AI ','IA ')+i))}" maxlength="16"><select id="ty${i}" hidden><option value="h">h</option><option value="ai">ai</option></select>${ONL()&&i===0?'<span class="htag">Vous (hôte)</span>':`<div class="seg" id="tseg${i}"><button data-v="h">${ONL()?'En ligne':'Humain'}</button><button data-v="ai">IA</button></div>`}`;
      seats.appendChild(r); r.querySelector('.stok').onclick=()=>{const k=(BG.COLORS.indexOf(cols[i])+1)%4, nc=BG.COLORS[k], j=cols.indexOf(nc); cols[j]=cols[i]; cols[i]=nc; draw();}; $('#ty'+i).value=types[i]; r.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.v===types[i]));
      if(ONL()&&i>0&&types[i]==='h'){const inp=r.querySelector('input'); inp.value=''; inp.placeholder='Nom choisi par votre ami'; inp.disabled=true;}
      if(ONL()&&i===0){types[0]='h';} else seg('#tseg'+i,v=>{types[i]=v; if(ONL()){draw(); return;} $('#ty'+i).value=v; const inp=$('#nm'+i); if(/^(IA \d|AI \d|Joueur \d|Player \d|Giocatore \d|Vous|You|Tu)$/.test(inp.value)) inp.value=v==='h'?(i===0?L3('Vous','You','Tu'):L3('Joueur ','Player ','Giocatore ')+(i+1)):L3('IA ','AI ','IA ')+i;});}};
  seg('#npseg',v=>{n.value=v; draw();}); n.onchange=()=>{$('#npseg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x.dataset.v===n.value)); draw();};
  for(let i=0;i<4;i++){} draw();
  // keep hidden selects usable by scripts
  seats.addEventListener('change',e=>{const m=e.target.id.match(/^ty(\d)$/); if(m){types[+m[1]]=e.target.value;}});
  let autoNet=false;
  const applyMode=()=>{ const on=MODE==='online'; if(ONL()&&types.slice(1,+n.value).every(t=>t==='ai')){types[1]='h'; autoNet=true;} else if(!on&&autoNet){ if(types[1]==='h') types[1]='ai'; autoNet=false; } $('#onlpick').hidden=!on; $('#onljoin').hidden=!(on&&SUB==='join'); $('#cfg').hidden=on&&SUB==='join'; $('#go').hidden=on&&SUB==='join';
    $('#go').textContent=ONL()?'Créer la partie en ligne':'Lancer la partie'; draw();};
  $('#psseg').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===persoSet)); seg('#psseg',v=>{persoSet=v; window.BirdsPersoSet=v; try{localStorage.setItem('birds_pset',v);}catch(e){}});
  seg('#modeseg',v=>{MODE=v; applyMode();}); seg('#onlseg',v=>{SUB=v; applyMode();});
  $('#jgo').onclick=async()=>{ $('#jgo').disabled=true; setStatus(''); try{ await netJoin($('#jcode').value,$('#jname').value.trim()); } finally{ $('#jgo').disabled=false; } };
  netInit();
  {const tb=$('#tutobtn'); if(tb){ tb.innerHTML='🎓 '+L3('Tutoriel : apprendre à jouer','Tutorial: learn to play','Tutorial: impara a giocare'); tb.onclick=startTuto; }}
  $('#go').onclick=async()=>{ if(ONL()){ if(!NET.db&&!NET.peerMode) return; $('#go').disabled=true; setStatus('');
      const cfg=[]; for(let i=0;i<+n.value;i++) cfg.push({kind:i===0?'host':(types[i]==='h'?'net':'ai'),name:i===0?((/^(Vous|You|Tu)$/.test($('#nm0').value.trim())?'':$('#nm0').value.trim())||'Hôte'):(types[i]==='h'?'':($('#nm'+i).value||('IA '+i))),color:cols[i],uid:i===0?NET.uid:null});
      try{ await netCreate(cfg); }catch(e){ console.warn(e); setStatus(NET.peerMode?'Impossible de joindre le service de connexion pour l\'instant. Réessayez.':'Impossible de créer la partie en ligne (accès en écriture refusé ?).'); } finally{ $('#go').disabled=false; } return; }
    const players=[]; for(let i=0;i<+n.value;i++) players.push({name:$('#nm'+i).value||('Joueur '+(i+1)),ai:$('#ty'+i).value==='ai',color:cols[i]}); start({players});};
  if(window.I18N) I18N.start();}
window.addEventListener('DOMContentLoaded',setup);
})();
