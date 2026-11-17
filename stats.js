// Birds — statistiques de parties (stockées dans le navigateur) + simulations IA
(function(){
'use strict';
const KEY='birds_stats_v1', MAX=5000;
const EN=()=>window.I18N&&I18N.lang==='en';
const L=(fr,en)=>EN()?en:fr;
let mem=null;
function load(){ if(mem) return mem; try{mem=JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){mem=[];} return mem;}
function save(){ try{localStorage.setItem(KEY,JSON.stringify(mem.slice(-MAX)));}catch(e){ try{mem=mem.slice(-Math.floor(MAX/2)); localStorage.setItem(KEY,JSON.stringify(mem));}catch(e2){} } }
const S={add(rec){load().push(rec); if(mem.length>MAX) mem=mem.slice(-MAX); if(!S.batch) save();}, all:()=>load(), clear(){mem=[]; save();}};
window.BirdsStats=S;

// ---------- simulations ----------
let running=false, stopReq=false;
async function simulate(n,np,onProgress){ running=true; stopReq=false; S.batch=true; const BG=window.BirdsGame;
  for(let k=0;k<n&&!stopReq;k++){ const N=np==='mix'?2+(k%3):+np;
    const io={sim:true,aiDelay:0,sleep:()=>Promise.resolve(),log(){},render(){},ask(){throw new Error('no human');},gameOver(){}};
    try{ const g=new BG.Game({players:Array.from({length:N},(_,i)=>({name:'IA '+(i+1),ai:true}))},io); let t=0; const o=g.takeTurn.bind(g); g.takeTurn=async()=>{ if(++t>500) throw new Error('long'); return o(); }; await g.run(); }catch(e){ console.warn('sim',e); }
    if(k%5===4){ save(); onProgress(k+1,n); await new Promise(r=>setTimeout(r,0)); } }
  S.batch=false; save(); running=false; onProgress(n,n,true);}

// ---------- calculs ----------
const pct=(a,b)=>b?Math.round(100*a/b):0;
function cardInfo(id){const c=window.BIRDS.find(x=>x.id===id)||window.ALLIES.find(x=>x.id===id)||window.RELICS.find(x=>x.id===id); return c||{name:id,cost:'?'};}
function cardType(id){return /^A\d/.test(id)?'ally':/^O/.test(id)?'relic':'bird';}
function famOf(id){const c=window.BIRDS.find(x=>x.id===id); return c?c.family:(cardType(id)==='ally'?'Ally':'Relic');}
function compute(f){
  let G=load().filter(g=>(f.src==='all'||(f.src==='sim'?g.sim:!g.sim))&&(f.n==='all'||g.n===+f.n));
  const res={games:G.length}; if(!G.length) return res;
  const P=[]; G.forEach(g=>g.players.forEach(p=>P.push(Object.assign({g},p))));
  res.players=P.length; res.baseWin=P.filter(p=>p.win).length/P.length;
  res.rounds=G.reduce((a,g)=>a+g.rounds,0)/G.length;
  res.roundsBy={}; [2,3,4].forEach(n=>{const x=G.filter(g=>g.n===n); if(x.length) res.roundsBy[n]=(x.reduce((a,g)=>a+g.rounds,0)/x.length).toFixed(1);});
  res.seatWin=[0,1,2,3].map(i=>{const x=P.filter(p=>p.i===i); return x.length?{n:x.length,w:pct(x.filter(p=>p.win).length,x.length)}:null;});
  // étoiles par source
  const src={}; let starTot=0; P.forEach(p=>(p.starRounds||[]).forEach(s=>{const k=/^Colonie/.test(s.why)?'colony':/^Objectif personnel/.test(s.why)?'perso':/^Objectif rouge/.test(s.why)?'red':/^Objectif bleu/.test(s.why)?'blue':/Chemin des Anciens/.test(s.why)?'elders':'cards'; src[k]=(src[k]||0)+1; starTot++;}));
  res.starSrc=Object.entries(src).map(([k,v])=>({k,v,p:pct(v,starTot)})).sort((a,b)=>b.v-a.v);
  // cartes
  const C={}; P.forEach(p=>{ const seen=new Set(p.played||[]); seen.forEach(id=>{const c=C[id]||(C[id]={id,games:0,wins:0,plays:0}); c.games++; if(p.win) c.wins++;}); (p.played||[]).forEach(id=>{C[id].plays++;}); });
  res.cards=Object.values(C).map(c=>Object.assign(c,{info:cardInfo(c.id),type:cardType(c.id),fam:famOf(c.id),rate:c.games/P.length,wr:c.wins/c.games,delta:c.wins/c.games-res.baseWin}));
  // familles (tags) : % de cartes jouées par les gagnants vs tous
  const fam={}; P.forEach(p=>(p.played||[]).forEach(id=>{const f=famOf(id); const o=fam[f]||(fam[f]={f,all:0,win:0}); o.all++; if(p.win) o.win++;}));
  const totAll=Object.values(fam).reduce((a,o)=>a+o.all,0), totWin=Object.values(fam).reduce((a,o)=>a+o.win,0);
  res.fams=Object.values(fam).map(o=>({f:o.f,all:pct(o.all,totAll),win:pct(o.win,totWin)}));
  // objectifs
  const obj=(key,claimsKey,list)=>list.map(d=>{const x=G.filter(g=>g[key]===d.id); if(!x.length) return {d,games:0};
      const slots=x.reduce((a,g)=>a+g[claimsKey].length,0), tot=x.reduce((a,g)=>a+(g.n===2?2:g.n),0);
      const firsts=[]; x.forEach(g=>g.players.forEach(p=>(p.starRounds||[]).forEach(s=>{ if(s.why.indexOf(d.name)>=0) firsts.push(s.round);})));
      const wr=x.reduce((a,g)=>a+g[claimsKey].filter(i=>g.players[i].win).length,0);
      return {d,games:x.length,fill:pct(slots,tot),avgRound:firsts.length?(firsts.reduce((a,b)=>a+b,0)/firsts.length).toFixed(1):'—',claimWin:slots?pct(wr,slots):0};});
  res.red=obj('red','redClaims',window.BirdsGame.RED_OBJ); res.blue=obj('blue','blueClaims',window.BirdsGame.BLUE_OBJ);
  res.perso=window.BirdsGame.PERSONAL.map(d=>{const x=P.filter(p=>p.pobj===d.id), off=P.filter(p=>(p.pOffer||[]).includes(d.id));
      return {d,offered:off.length,picked:pct(x.length,off.length),one:pct(x.filter(p=>p.pClaims>=1).length,x.length),two:pct(x.filter(p=>p.pClaims>=2).length,x.length),wr:pct(x.filter(p=>p.win).length,x.length),n:x.length};});
  // bâtiments
  const bt=['nest','shrine','workshop']; res.build=bt.map(t=>{const w=P.filter(p=>p.win), l=P.filter(p=>!p.win);
      const avg=a=>a.length?(a.reduce((s,p)=>s+p.built[t],0)/a.length).toFixed(2):'—';
      const lv=[0,1,2,3].map(k=>pct(P.filter(p=>p.builtLv[t].includes(k)).length,P.length));
      return {t,all:avg(P),win:avg(w),lose:avg(l),lv};});
  // amulettes
  res.runes=[0,1,2,3,4].map(k=>{const x=P.filter(p=>p.runes.includes(k)); return {k,pct:pct(x.length,P.length),wr:pct(x.filter(p=>p.win).length,x.length)};});
  // mouettes, anciens, colonies
  const avg=(arr,f)=>arr.length?(arr.reduce((a,p)=>a+f(p),0)/arr.length).toFixed(2):'—';
  const W=P.filter(p=>p.win), Lo=P.filter(p=>!p.win);
  res.misc=[[L('Cartes jouées','Cards played'),p=>(p.played||[]).length],[L('Mouettes','Seagulls'),p=>p.seagulls.length],[L('Niveau total des Mouettes','Total Seagull level'),p=>p.seagulls.reduce((a,b)=>a+b,0)],
    [L('Amulettes','Amulets'),p=>p.runes.length],[L('Cases du Chemin des Anciens','Elders\' Path spaces'),p=>p.elders],[L('Étoiles','Stars'),p=>p.stars]].map(([l,f])=>({l,w:avg(W,f),lo:avg(Lo,f)}));
  const isl={}; G.forEach(g=>Object.keys(g.settled).forEach(k=>isl[k]=(isl[k]||0)+1)); res.islands=Object.entries(isl).map(([k,v])=>({k,p:pct(v,G.length)})).sort((a,b)=>b.p-a.p);
  return res;}

// ---------- affichage ----------
const ISL={meadow:['Prairie','Meadow'],jungle:['Jungle','Jungle'],desert:['Désert','Desert'],mountain:['Montagne','Mountain'],tundra:['Toundra','Tundra'],marsh:['Marais','Marsh']};
const FAMC={Academy:'#1f80b0',Legion:'#d23c32',Court:'#e2a800',Guild:'#4f9a3a',Circle:'#6c3a8e',Ally:'#8a6a3a',Relic:'#7a7a7a'};
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
const bar=(v,max,col)=>`<span class="sbar"><i style="width:${Math.max(0,Math.min(100,100*v/(max||1)))}%;background:${col||'#1f8a8a'}"></i></span>`;
const dcol=d=>d>0.04?'#2e8b3e':d<-0.04?'#c0392b':'#8a7a5f';
let filt={src:'all',n:'all',ctype:'all',sort:'wr',minG:5};
function render(){ const B=document.getElementById('statsbody'); const r=compute(filt);
  const hdr=`<div class="sfilters">
    <span>${L('Parties','Games')} :</span>${seg('src',[['all',L('Toutes','All')],['human',L('Avec humains','With humans')],['sim',L('Simulations IA','AI simulations')]])}
    <span>${L('Joueurs','Players')} :</span>${seg('n',[['all',L('Tous','All')],['2','2'],['3','3'],['4','4']])}</div>`;
  if(!r.games){B.innerHTML=hdr+`<div class="sempty">${L('Aucune partie enregistrée pour ces filtres. Jouez une partie ou lancez des simulations ci-dessus.','No game recorded for these filters. Play a game or run simulations above.')}</div>`; wire(); return;}
  const starL={colony:L('Colonies','Colonies'),perso:L('Objectifs personnels','Personal objectives'),red:L('Objectifs rouges','Red objectives'),blue:L('Objectifs bleus','Blue objectives'),elders:L('Chemin des Anciens',"Elders' Path"),cards:L('Cartes (Reliques, Alliés…)','Cards (Relics, Allies…)')};
  let cards=r.cards.filter(c=>(filt.ctype==='all'||c.type===filt.ctype)&&c.games>=filt.minG);
  const sorters={wr:(a,b)=>b.wr-a.wr,rate:(a,b)=>b.rate-a.rate,plays:(a,b)=>b.plays-a.plays,cost:(a,b)=>(a.info.cost-b.info.cost)};
  cards.sort(sorters[filt.sort]);
  const maxRate=Math.max(...cards.map(c=>c.rate),0.01);
  B.innerHTML=hdr+`
  <div class="sgrid">
   <div class="scard"><b>${r.games}</b><span>${L('parties','games')}</span></div>
   <div class="scard"><b>${r.rounds.toFixed(1)}</b><span>${L('manches en moyenne','rounds on average')}${Object.keys(r.roundsBy).length>1?'<br>'+Object.entries(r.roundsBy).map(([n,v])=>`${n}j : ${v}`).join(' · '):''}</span></div>
   <div class="scard"><b>${Math.round(r.baseWin*100)}%</b><span>${L('taux de victoire de référence (1 / nb joueurs)','baseline win rate (1 / player count)')}</span></div>
   <div class="scard"><span>${L('Victoires par place','Wins by seat')}</span>${r.seatWin.map((s,i)=>s?`<div class="sline">${i+1}${L('er','st').replace('er',i?'e':'er')} ${bar(s.w,100)} ${s.w}%</div>`:'').join('')}</div>
  </div>
  <h3>${L('D\'où viennent les Étoiles','Where Stars come from')}</h3>
  <table class="stab">${r.starSrc.map(s=>`<tr><td>${starL[s.k]}</td><td class="w">${bar(s.p,100,'#e0a400')}</td><td>${s.p}%</td></tr>`).join('')}</table>
  <h3>${L('Objectifs rouges','Red objectives')}</h3>${objTable(r.red)}
  <h3>${L('Objectifs bleus','Blue objectives')}</h3>${objTable(r.blue)}
  <h3>${L('Objectifs personnels','Personal objectives')}</h3>
  <table class="stab"><tr><th></th><th>${L('Choisi quand proposé','Picked when offered')}</th><th>${L('1re Étoile (5)','1st Star (5)')}</th><th>${L('2e Étoile (9)','2nd Star (9)')}</th><th>${L('Victoires','Wins')}</th></tr>
   ${r.perso.map(o=>`<tr><td><b>${o.d.name}</b> <small>${o.d.tags.join(' + ')}</small></td><td>${o.offered?o.picked+'%':'—'}</td><td>${o.n?o.one+'%':'—'}</td><td>${o.n?o.two+'%':'—'}</td><td style="color:${dcol(o.wr/100-r.baseWin)}">${o.n?o.wr+'%':'—'} <small>(${o.n})</small></td></tr>`).join('')}</table>
  <h3>${L('Bâtiments','Buildings')}</h3>
  <table class="stab"><tr><th></th><th>${L('Moyenne construite','Average built')}</th><th>${L('Gagnants','Winners')}</th><th>${L('Perdants','Losers')}</th><th>${L('Niv. 1 / 2 / 3 / 4 construits','Lvl 1 / 2 / 3 / 4 built')}</th></tr>
   ${r.build.map(b=>`<tr><td><b>${({nest:L('Nids','Nests'),shrine:L('Sanctuaires','Shrines'),workshop:L('Ateliers','Workshops')})[b.t]}</b>${b.t==='nest'?` <small>${L('(hors Nid de départ)','(excluding starting nest)')}</small>`:''}</td><td>${b.all}</td><td style="color:${+b.win>+b.lose?'#2e8b3e':'#c0392b'}">${b.win}</td><td>${b.lose}</td><td>${(b.t==='nest'?b.lv.slice(1):b.lv).map(v=>v+'%').join(' / ')}</td></tr>`).join('')}</table>
  <h3>${L('Gagnants vs perdants','Winners vs losers')}</h3>
  <table class="stab"><tr><th></th><th>${L('Gagnants','Winners')}</th><th>${L('Perdants','Losers')}</th></tr>${r.misc.map(m=>`<tr><td>${m.l}</td><td style="color:${+m.w>+m.lo?'#2e8b3e':'#c0392b'}"><b>${m.w}</b></td><td>${m.lo}</td></tr>`).join('')}</table>
  <h3>${L('Amulettes','Amulets')}</h3>
  <table class="stab"><tr><th></th><th>${L('Prise par','Taken by')}</th><th>${L('Victoires','Wins')}</th></tr>${r.runes.map(a=>`<tr><td>${esc(window.BirdsGame.RUNES[a.k])}</td><td class="w">${bar(a.pct,100,'#7a4fa0')} ${a.pct}%</td><td style="color:${dcol(a.wr/100-r.baseWin)}">${a.wr}%</td></tr>`).join('')}</table>
  <h3>${L('Colonies fondées','Colonies founded')}</h3>
  <table class="stab">${r.islands.map(i=>`<tr><td>${ISL[i.k][EN()?1:0]}</td><td class="w">${bar(i.p,100,'#3a8f6a')}</td><td>${i.p}% ${L('des parties','of games')}</td></tr>`).join('')}</table>
  <h3>${L('Tags des cartes jouées','Tags of cards played')}</h3>
  <table class="stab"><tr><th></th><th>${L('Toutes les cartes jouées','All cards played')}</th><th>${L('Cartes jouées par les gagnants','Cards played by winners')}</th></tr>${r.fams.sort((a,b)=>b.win-a.win).map(f=>`<tr><td><span class="dot" style="background:${FAMC[f.f]}"></span> ${f.f}</td><td>${f.all}%</td><td style="color:${dcol((f.win-f.all)/100)}"><b>${f.win}%</b></td></tr>`).join('')}</table>
  <h3>${L('Cartes','Cards')}</h3>
  <div class="sfilters">${seg('ctype',[['all',L('Toutes','All')],['bird',L('Oiseaux','Birds')],['ally',L('Alliés','Allies')],['relic',L('Reliques','Relics')]])}
   <span>${L('Trier par','Sort by')} :</span>${seg('sort',[['wr',L('Victoires','Win rate')],['rate',L('Fréquence','Frequency')],['plays',L('Nb de poses','Times played')],['cost',L('Coût','Cost')]])}
   <span>${L('Min. parties','Min. games')} :</span>${seg('minG',[['1','1'],['5','5'],['20','20'],['50','50']])}</div>
  <p class="snote">${L('« Joueurs qui l\'ont posée » : part des joueurs ayant joué la carte au moins une fois. « Victoires » : taux de victoire de ces joueurs ; en vert au-dessus de la référence, en rouge en dessous. Une carte peut gagner souvent parce qu\'elle arrive tard chez un joueur déjà en tête : à lire comme une tendance.','"Players who played it": share of players who played the card at least once. "Win rate": win rate of those players; green above baseline, red below. A card may win often because it lands late with a player already ahead: read it as a trend.')}</p>
  <table class="stab cards"><tr><th>${L('Carte','Card')}</th><th>${L('Coût','Cost')}</th><th>${L('Joueurs qui l\'ont posée','Players who played it')}</th><th>${L('Victoires','Win rate')}</th><th>${L('Écart','Delta')}</th></tr>
   ${cards.map(c=>`<tr data-card="${c.id}" class="crow"><td><span class="dot" style="background:${FAMC[c.fam]}"></span> ${esc(c.info.name)} <small>${c.id}</small></td><td>${c.info.cost}</td><td class="w">${bar(c.rate,maxRate)} ${(c.rate*100).toFixed(1)}% <small>(${c.games})</small></td><td style="color:${dcol(c.delta)}"><b>${Math.round(c.wr*100)}%</b></td><td style="color:${dcol(c.delta)}">${c.delta>0?'+':''}${Math.round(c.delta*100)}</td></tr>`).join('')}</table>`;
  wire();}
function objTable(list){return `<table class="stab"><tr><th></th><th>${L('Parties','Games')}</th><th>${L('Étoiles prises','Stars taken')}</th><th>${L('Manche moyenne','Average round')}</th><th>${L('Preneurs gagnants','Takers who won')}</th></tr>${list.map(o=>`<tr><td><b>${o.d.name}</b> <small>${esc(EN()?tr(o.d.fr):o.d.fr)}</small></td><td>${o.games}</td><td class="w">${o.games?bar(o.fill,100,'#c0392b')+' '+o.fill+'%':'—'}</td><td>${o.games?o.avgRound:'—'}</td><td>${o.games?o.claimWin+'%':'—'}</td></tr>`).join('')}</table>`;}
const tr=s=>window.I18N?I18N.tr(s):s;
function seg(k,opts){return `<span class="seg sseg" data-k="${k}">${opts.map(([v,l])=>`<button data-v="${v}" class="${String(filt[k])===v?'on':''}">${l}</button>`).join('')}</span>`;}
function wire(){document.querySelectorAll('#statsbody .sseg').forEach(sg=>sg.querySelectorAll('button').forEach(b=>b.onclick=()=>{const k=sg.dataset.k; filt[k]=k==='minG'?+b.dataset.v:b.dataset.v; render();}));}
function open(){ let M=document.getElementById('stats'); if(!M){ M=document.createElement('div'); M.id='stats'; document.body.appendChild(M); }
  M.innerHTML=`<div class="sbox2"><div class="shead"><h2>${L('Statistiques','Statistics')}</h2><button class="sclose" title="${L('Fermer','Close')}">✕</button></div>
   <div class="ssim"><b>${L('Simuler des parties entre IA','Simulate AI games')}</b> : <select id="simN"><option>20</option><option selected>100</option><option>300</option><option>1000</option></select>
    ${L('parties à','games with')} <select id="simP"><option value="mix">2-4</option><option>2</option><option selected>3</option><option>4</option></select> ${L('joueurs','players')}
    <button id="simGo" class="ob">${L('Lancer','Run')}</button><span id="simMsg"></span>
    <span class="sright"><button id="sExp" class="ob ghost">${L('Copier les données (JSON)','Copy data (JSON)')}</button><button id="sClr" class="ob ghost">${L('Effacer','Clear')}</button></span></div>
   <p class="snote">${L('Chaque partie terminée sur cet appareil est enregistrée dans ce navigateur. Les simulations utilisent les IA du prototype : elles montrent des tendances, pas le jeu de vrais joueurs.','Every game finished on this device is saved in this browser. Simulations use the prototype AIs: they show trends, not how real players play.')}</p>
   <div id="statsbody"></div></div>`;
  M.style.display='flex'; M.querySelector('.sclose').onclick=()=>{M.style.display='none';};
  M.querySelector('#simGo').onclick=()=>{ if(running){stopReq=true; return;} const b=M.querySelector('#simGo'); b.textContent=L('Arrêter','Stop');
    simulate(+M.querySelector('#simN').value,M.querySelector('#simP').value,(k,n,done)=>{M.querySelector('#simMsg').textContent=done?` ${L('Terminé','Done')} (${k})`:` ${k} / ${n}…`; if(done){b.textContent=L('Lancer','Run'); render();} else if(k%25===0) render();});};
  M.querySelector('#sClr').onclick=()=>{ const b=M.querySelector('#sClr'); if(b.dataset.c){S.clear(); b.dataset.c=''; b.textContent=L('Effacer','Clear'); render();} else {b.dataset.c='1'; b.textContent=L('Confirmer l\'effacement','Confirm clear');}};
  M.querySelector('#sExp').onclick=async()=>{ try{await navigator.clipboard.writeText(JSON.stringify(load())); M.querySelector('#simMsg').textContent=' '+L('Données copiées','Data copied');}catch(e){M.querySelector('#simMsg').textContent=' '+L('Copie impossible ici','Copy not available here');}};
  render();}
window.BirdsStatsUI={open};
})();
