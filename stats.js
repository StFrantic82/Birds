// Birds — statistiques de parties (stockées dans le navigateur) + simulations IA
(function(){
'use strict';
const KEY='birds_stats_v1', MAX=5000;
const LG=()=>window.I18N?I18N.lang:'fr', EN=()=>LG()==='en';
const IT={'Cartes jouées':'Carte giocate','Mouettes':'Gabbiani','Niveau total des Mouettes':'Livello totale dei Gabbiani','Runes':'Rune','Cases du Chemin des Anciens':'Caselle del Sentiero degli Antichi','Étoiles':'Stelle',
 'Parties':'Partite','Toutes':'Tutte','Avec humains':'Con umani','Simulations IA':'Simulazioni IA','Reçues des joueurs':'Ricevute dai giocatori','Joueurs':'Giocatori','Tous':'Tutti',
 'Aucune partie enregistrée pour ces filtres. Jouez une partie ou lancez des simulations ci-dessus.':'Nessuna partita registrata per questi filtri. Gioca una partita o avvia delle simulazioni qui sopra.',
 'Colonies':'Colonie','Objectifs personnels':'Obiettivi personali','Objectifs rouges':'Obiettivi rossi','Objectifs bleus':'Obiettivi blu','Chemin des Anciens':'Sentiero degli Antichi','Cartes (Reliques, Alliés…)':'Carte (Reliquie, Alleati…)',
 'parties':'partite','manches en moyenne':'round in media','taux de victoire de référence (1 / nb joueurs)':'percentuale di vittoria di riferimento (1 / n. giocatori)','Victoires par place':'Vittorie per posto','er':'º',
 "D'où viennent les Étoiles":'Da dove vengono le Stelle','Choisi quand proposé':'Scelto quando proposto','1re Étoile (5)':'1ª Stella (5)','2e Étoile (9)':'2ª Stella (9)','Victoires':'Vittorie','Bâtiments':'Edifici',
 'Moyenne construite':'Media costruita','Gagnants':'Vincitori','Perdants':'Perdenti','Niv. 1 / 2 / 3 / 4 construits':'Liv. 1 / 2 / 3 / 4 costruiti','Nids':'Nidi','Sanctuaires':'Santuari','Ateliers':'Laboratori',
 '(hors Nid de départ)':'(escluso il Nido iniziale)','Gagnants vs perdants':'Vincitori vs perdenti','Prise par':'Preso da','Colonies fondées':'Colonie fondate','des parties':'delle partite',
 'Tags des cartes jouées':'Tag delle carte giocate','Toutes les cartes jouées':'Tutte le carte giocate','Cartes jouées par les gagnants':'Carte giocate dai vincitori','Cartes':'Carte','Oiseaux':'Uccelli','Alliés':'Alleati','Reliques':'Reliquie',
 'Trier par':'Ordina per','Fréquence':'Frequenza','Nb de poses':'N. di giocate','Coût':'Costo','Min. parties':'Min. partite',
 "« Joueurs qui l'ont posée » : part des joueurs ayant joué la carte au moins une fois. « Victoires » : taux de victoire de ces joueurs ; en vert au-dessus de la référence, en rouge en dessous. Une carte peut gagner souvent parce qu'elle arrive tard chez un joueur déjà en tête : à lire comme une tendance.":"«Giocatori che l'hanno giocata»: quota di giocatori che hanno giocato la carta almeno una volta. «Vittorie»: percentuale di vittoria di questi giocatori; in verde sopra il riferimento, in rosso sotto. Una carta può vincere spesso perché arriva tardi a un giocatore già in testa: da leggere come una tendenza.",
 'Carte':'Carta',"Joueurs qui l'ont posée":"Giocatori che l'hanno giocata",'Écart':'Scarto','Étoiles prises':'Stelle prese','Manche moyenne':'Round medio','Preneurs gagnants':'Chi la prende e vince',
 'Statistiques':'Statistiche','Fermer':'Chiudi','Simuler des parties entre IA':'Simula partite tra IA','parties à':'partite a','joueurs':'giocatori','Lancer':'Avvia','Enregistrer en image':'Salva come immagine',
 'Copier les données (JSON)':'Copia i dati (JSON)','Effacer':'Cancella',
 'Chaque partie terminée sur cet appareil est enregistrée dans ce navigateur. Les simulations utilisent les IA du prototype : elles montrent des tendances, pas le jeu de vrais joueurs.':'Ogni partita terminata su questo dispositivo viene salvata in questo browser. Le simulazioni usano le IA del prototipo: mostrano tendenze, non il gioco di giocatori reali.',
 'Arrêter':'Ferma','Terminé':'Finito',"Confirmer l'effacement":'Conferma la cancellazione','Données copiées':'Dati copiati','Copie impossible ici':'Copia impossibile qui',
 'Parties envoyées par les joueurs':'Partite inviate dai giocatori','chargement…':'caricamento…','partie(s)':'partita/e','Filtre « Reçues des joueurs » ci-dessous.':'Filtro «Ricevute dai giocatori» qui sotto.',
 "aucune pour l'instant.":'ancora nessuna.',"impossible de les lire pour l'instant.":'impossibile leggerle per ora.',"Envoyer mes parties à l'auteur":"Invia le mie partite all'autore",'Votre nom':'Il tuo nome','Tout est envoyé':'Tutto inviato','Envoi…':'Invio…',
 "Envoi refusé : votre accès à l'appli ne le permet pas. Utilisez « Copier les données (JSON) ».":"Invio rifiutato: il tuo accesso all'app non lo permette. Usa «Copia i dati (JSON)».",
 "Création de l'image…":"Creazione dell'immagine…",'Image des statistiques':'Immagine delle statistiche',"si le téléchargement n'a pas démarré : clic droit sur l'image › « Enregistrer l'image sous… »":"se il download non è partito: clic destro sull'immagine › «Salva immagine con nome…»",
 'Image prête':'Immagine pronta',"Impossible de créer l'image ici":"Impossibile creare l'immagine qui",
 'Résumé par tag':'Riepilogo per tag',"Entraînement de l'IA":"Allenamento dell'IA",'Générations':'Generazioni','Parties par génération':'Partite per generazione',"Revenir aux réglages d'origine":"Torna alle impostazioni originali",
 "À chaque génération, une IA « challenger » aux réglages légèrement modifiés affronte l'IA actuelle. Ses réglages sont adoptés et utilisés dans toutes les parties si elle gagne nettement plus que sa part attendue, ou si, aussi forte, elle atteint ses 6 étoiles plus vite : c'est le but du jeu.":"A ogni generazione, un'IA «sfidante» con impostazioni leggermente modificate affronta l'IA attuale. Le sue impostazioni vengono adottate e usate in tutte le partite se vince nettamente più della sua quota attesa, oppure se, altrettanto forte, raggiunge le 6 stelle più in fretta: è lo scopo del gioco.",
 'IA actuelle':'IA attuale',"réglages d'origine":'impostazioni originali','partagés avec tous les joueurs':'condivise con tutti i giocatori','enregistrés dans ce navigateur':'salvate in questo browser','Génération':'Generazione','Victoires du challenger':'Vittorie dello sfidante','Part attendue':'Quota attesa','Manches':'Round','6 étoiles : challenger / actuelle':'6 stelle: sfidante / attuale','adopté':'adottato','Arrêt demandé…':'Arresto richiesto…',"L'IA utilise de nouveau ses réglages d'origine.":"L'IA usa di nuovo le impostazioni originali.","Entraînement impossible ici (ouvrez l'appli depuis un serveur, pas en double-cliquant le fichier).":"Allenamento impossibile qui (apri l'app da un server, non con doppio clic sul file).",'Démarrage…':'Avvio…',' (partagés avec tous les joueurs).':' (condivise con tutti i giocatori).',' (enregistrés dans ce navigateur).':' (salvate in questo browser).',"Erreur pendant l'entraînement.":"Errore durante l'allenamento.",'Objectifs perso':'Obiettivi personali','Classiques':'Classici','Recommandés':'Consigliati','Sans tag':'Senza tag','Cartes du tag':'Carte del tag','Poses':'Giocate','Écart moyen des cartes':'Scarto medio delle carte','Joueurs qui en ont posé':'Giocatori che ne hanno giocate',
 "« Écart moyen des cartes » : moyenne des écarts de victoire des cartes de ce tag, pondérée par le nombre de parties où chaque carte a été posée. « Sans tag » : Alliés et Reliques sans tag.":"«Scarto medio delle carte»: media degli scarti di vittoria delle carte di questo tag, ponderata per il numero di partite in cui ogni carta è stata giocata. «Senza tag»: Alleati e Reliquie senza tag."};
const L=(fr,en)=>LG()==='en'?en:LG()==='it'?(IT[fr]!==undefined?IT[fr]:fr):fr;
const L3=(fr,en,it)=>LG()==='en'?en:LG()==='it'?it:fr;
let mem=null;
function load(){ if(mem) return mem; try{mem=JSON.parse(localStorage.getItem(KEY)||'[]');}catch(e){mem=[];} return mem;}
function save(){ try{localStorage.setItem(KEY,JSON.stringify(mem.slice(-MAX)));}catch(e){ try{mem=mem.slice(-Math.floor(MAX/2)); localStorage.setItem(KEY,JSON.stringify(mem));}catch(e2){} } }
const newId=()=>'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
const S={add(rec){ if(!rec.id) rec.id=newId(); load().push(rec); if(mem.length>MAX) mem=mem.slice(-MAX); if(!S.batch) save();}, all:()=>load(), clear(){mem=[]; save();}};
window.BirdsStats=S;
// ---------- partage : envoyer ses parties à l'auteur (base de l'artefact) ----------
const SENT='birds_sent_v1';
function sentSet(){ try{return new Set(JSON.parse(localStorage.getItem(SENT)||'[]'));}catch(e){return new Set();} }
function markSent(ids){ const s=sentSet(); ids.forEach(i=>s.add(i)); try{localStorage.setItem(SENT,JSON.stringify([...s].slice(-20000)));}catch(e){} }
function ensureIds(){ let ch=false; load().forEach(g=>{ if(!g.id){g.id=newId(); ch=true;} }); if(ch) save(); }
S.net=()=>window.BirdsNet&&window.BirdsNet.db?window.BirdsNet:null;
S.unsent=()=>{ ensureIds(); const s=sentSet(); return load().filter(g=>!g.sim&&!s.has(g.id)); };
S.isSent=id=>sentSet().has(id);
S.send=async(recs,from)=>{ const N=S.net(); if(!N) throw new Error('offline'); let n=0;
  for(const rec of recs){ if(!rec||rec.sim) continue; if(!rec.id){rec.id=newId(); save();} await N.db.doc('sharedstats/'+rec.id).set({from:String(from||'').slice(0,30),t:Date.now(),rec}); n++; markSent([rec.id]); }
  return n; };
let recv=null;
S.fetchShared=async()=>{ const N=S.net(); if(!N) return null; const sn=await N.db.collection('sharedstats').limit(1000).get(); recv=sn.docs.map(d=>{const x=d.data()||{}; return Object.assign({},x.rec,{shared:true,from:x.from||''});}).filter(r=>r&&r.players); return recv; };

// ---------- simulations ----------
let running=false, stopReq=false;
async function simulate(n,np,onProgress){ running=true; stopReq=false; S.batch=true; const BG=window.BirdsGame;
  for(let k=0;k<n&&!stopReq;k++){ const N=np==='mix'?2+(k%3):+np;
    const io={sim:true,aiDelay:0,sleep:()=>Promise.resolve(),log(){},render(){},ask(){throw new Error('no human');},gameOver(){}};
    try{ const g=new BG.Game({players:Array.from({length:N},(_,i)=>({name:'IA '+(i+1),ai:true})),persoSet:window.BirdsPersoSet||'new'},io); let t=0; const o=g.takeTurn.bind(g); g.takeTurn=async()=>{ if(++t>500) throw new Error('long'); return o(); }; await g.run(); }catch(e){ console.warn('sim',e); }
    if(k%5===4){ save(); onProgress(k+1,n); await new Promise(r=>setTimeout(r,0)); } }
  S.batch=false; save(); running=false; onProgress(n,n,true);}

// ---------- calculs ----------
const pct=(a,b)=>b?Math.round(100*a/b):0;
function cardInfo(id){const c=window.BIRDS.find(x=>x.id===id)||window.ALLIES.find(x=>x.id===id)||window.RELICS.find(x=>x.id===id); return c||{name:id,cost:'?'};}
function cardType(id){return /^A\d/.test(id)?'ally':/^O/.test(id)?'relic':'bird';}
function famOf(id){const c=window.BIRDS.find(x=>x.id===id); return c?c.family:(cardType(id)==='ally'?'Ally':'Relic');}
function compute(f){
  const own=load(), ids=new Set(own.map(g=>g.id)); const base=f.src==='shared'?(recv||[]):f.src==='all'?own.concat((recv||[]).filter(g=>!ids.has(g.id))):own;
  let G=base.filter(g=>(f.src==='all'||f.src==='shared'||(f.src==='sim'?g.sim:!g.sim))&&(f.n==='all'||g.n===+f.n)&&(!f.ps||f.ps==='all'||(g.pset||'classic')===f.ps));
  const res={games:G.length}; if(!G.length) return res;
  const P=[]; G.forEach(g=>g.players.forEach(p=>P.push(Object.assign({g},p))));
  res.players=P.length; res.baseWin=P.filter(p=>p.win).length/P.length;
  res.rounds=G.reduce((a,g)=>a+g.rounds,0)/G.length;
  res.roundsBy={}; [2,3,4].forEach(n=>{const x=G.filter(g=>g.n===n); if(x.length) res.roundsBy[n]=(x.reduce((a,g)=>a+g.rounds,0)/x.length).toFixed(1);});
  res.seatWin=[0,1,2,3].map(i=>{const x=P.filter(p=>p.i===i); return x.length?{n:x.length,w:pct(x.filter(p=>p.win).length,x.length)}:null;});
  // étoiles par source
  const src={}; let starTot=0; P.forEach(p=>(p.starRounds||[]).forEach(s=>{const k=/^Colonie/.test(s.why)?'settlement':/^Objectif personnel/.test(s.why)?'perso':/^Objectif rouge/.test(s.why)?'red':/^Objectif bleu/.test(s.why)?'blue':/Chemin des Anciens/.test(s.why)?'elders':'cards'; src[k]=(src[k]||0)+1; starTot++;}));
  res.starSrc=Object.entries(src).map(([k,v])=>({k,v,p:pct(v,starTot)})).sort((a,b)=>b.v-a.v);
  // cartes
  const C={}; P.forEach(p=>{ const seen=new Set(p.played||[]); seen.forEach(id=>{const c=C[id]||(C[id]={id,games:0,wins:0,plays:0}); c.games++; if(p.win) c.wins++;}); (p.played||[]).forEach(id=>{C[id].plays++;}); });
  res.cards=Object.values(C).map(c=>Object.assign(c,{info:cardInfo(c.id),type:cardType(c.id),fam:famOf(c.id),rate:c.games/P.length,wr:c.wins/c.games,delta:c.wins/c.games-res.baseWin}));
  // familles (tags) : % de cartes jouées par les gagnants vs tous
  const fam={}; P.forEach(p=>(p.played||[]).forEach(id=>{const f=famOf(id); const o=fam[f]||(fam[f]={f,all:0,win:0}); o.all++; if(p.win) o.win++;}));
  const totAll=Object.values(fam).reduce((a,o)=>a+o.all,0), totWin=Object.values(fam).reduce((a,o)=>a+o.win,0);
  res.fams=Object.values(fam).map(o=>({f:o.f,all:pct(o.all,totAll),win:pct(o.win,totWin)}));
  // résumé par tag : moyenne des écarts des cartes du tag (pondérée par le nb de parties où la carte a été posée)
  const tagsOf=id=>{const c=cardInfo(id); if(cardType(id)==='bird') return c.family?[c.family]:[]; return Object.keys(c.tagMap||{}).filter(k=>c.tagMap[k]>0);};
  res.tags=['Academy','Legion','Circle','Court','Guild','none'].map(t=>{ const cs=res.cards.filter(c=>{const ts=tagsOf(c.id); return t==='none'?(!ts.length&&!(cardInfo(c.id).wild>0)):ts.includes(t);});
      const g=cs.reduce((a,c)=>a+c.games,0); const pl=P.filter(p=>(p.played||[]).some(id=>{const ts=tagsOf(id); return t==='none'?(!ts.length&&!(cardInfo(id).wild>0)):ts.includes(t);}));
      return {t,cards:cs.length,plays:cs.reduce((a,c)=>a+c.plays,0),delta:g?cs.reduce((a,c)=>a+c.delta*c.games,0)/g:0,players:pct(pl.length,P.length),pdelta:pl.length?pl.filter(p=>p.win).length/pl.length-res.baseWin:0};});
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
    [L('Runes','Runes'),p=>p.runes.length],[L('Cases du Chemin des Anciens','Elders\' Path spaces'),p=>p.elders],[L('Étoiles','Stars'),p=>p.stars]].map(([l,f])=>({l,w:avg(W,f),lo:avg(Lo,f)}));
  // durées
  const rc={}; G.forEach(g=>rc[g.rounds]=(rc[g.rounds]||0)+1); const rs=G.map(g=>g.rounds).sort((a,b)=>a-b);
  res.dur={hist:rc,min:rs[0],max:rs[rs.length-1],med:rs[Math.floor(rs.length/2)],fast:pct(rs.filter(x=>x<=18).length,rs.length)};
  // rythme des étoiles : manche moyenne de la k-ième étoile
  const sr=(arr,k)=>{const x=arr.map(p=>(p.starRounds||[])[k]).filter(Boolean); return {n:x.length,avg:x.length?x.reduce((a,s)=>a+s.round,0)/x.length:null,pct:pct(x.length,arr.length)};};
  const PW=P.filter(p=>p.win), PL=P.filter(p=>!p.win);
  res.pace=[0,1,2,3,4,5].map(k=>({k:k+1,all:sr(P,k),win:sr(PW,k),lose:sr(PL,k)}));
  // boule de neige : leader à mi-partie, écart final
  let lead=0, leadW=0, behindW=0, tiedMid=0; const margin={0:0,1:0,2:0,3:0};
  G.forEach(g=>{ const mid=Math.floor(g.rounds/2); const at=g.players.map(p=>(p.starRounds||[]).filter(s=>s.round<=mid).length); const mx=Math.max(...at);
    const top=at.filter(v=>v===mx).length; const w=g.players.findIndex(p=>p.win);
    if(top===1&&mx>0){ lead++; if(at[w]===mx) leadW++; else behindW++; } else tiedMid++;
    const st=g.players.map(p=>p.stars).sort((a,b)=>b-a); const m=Math.min(3,Math.max(0,st[0]-(st[1]||0))); margin[m]++; });
  res.snow={lead,leadW:pct(leadW,lead),comeback:pct(behindW,lead),tiedMid:pct(tiedMid,G.length),margin:[0,1,2,3].map(k=>({k,p:pct(margin[k],G.length)}))};
  // ouverture : objectifs personnels (vitesse des étoiles), premières actions
  res.persoPace=window.BirdsGame.PERSONAL.map(d=>{const x=P.filter(p=>p.pobj===d.id); return {d,n:x.length,s1:sr(x,0).avg,s3:sr(x,2).avg,s6:sr(x,5).avg,s6p:sr(x,5).pct,wr:pct(x.filter(p=>p.win).length,x.length)};}).filter(o=>o.n);
  const PS=P.filter(p=>p.acts&&p.acts.seq&&p.acts.seq.length);
  const grp=(f)=>{const m={}; PS.forEach(p=>{const k=f(p); if(!k) return; const o=m[k]||(m[k]={k,n:0,w:0,six:0,sixN:0}); o.n++; if(p.win) o.w++; const r=(p.starRounds||[])[5]; if(r){o.six+=r.round; o.sixN++;}}); return Object.values(m).map(o=>({k:o.k,n:o.n,share:pct(o.n,PS.length),wr:o.w/o.n,six:o.sixN?o.six/o.sixN:null})).sort((a,b)=>b.n-a.n);};
  res.open1=grp(p=>p.acts.seq[0]); res.open2=grp(p=>p.acts.seq.length>=2?p.acts.seq.slice(0,2).join(''):null).slice(0,10); res.openN=PS.length;
  // économie
  const PE=P.filter(p=>p.eco); const ea=(arr,f)=>arr.length?arr.reduce((a,p)=>a+f(p),0)/arr.length:null;
  const EW=PE.filter(p=>p.win), EL=PE.filter(p=>!p.win);
  res.ecoN=new Set(PE.map(p=>p.g)).size;
  res.eco=[['start',p=>p.eco.start||0],['harvest',p=>p.eco.harvest||0],['gain',p=>p.eco.gain||0],['spent',p=>p.eco.spent||0],['left',p=>p.eco.left||0],['chicks',p=>p.chicks||0],['supply',p=>p.supply||0],['eggs',p=>p.eggs||0]]
    .map(([k,f])=>({k,all:ea(PE,f),win:ea(EW,f),lose:ea(EL,f)}));
  // actions effectuées (parties enregistrées depuis l'ajout du compteur)
  const PA=P.filter(p=>p.acts), WA=PA.filter(p=>p.win), LA=PA.filter(p=>!p.win);
  const am=(arr,k)=>arr.length?arr.reduce((a,p)=>a+(p.acts[k]||0),0)/arr.length:null;
  res.actsN=PA.length; res.actsG=new Set(PA.map(p=>p.g)).size;
  res.acts=['turns','move','expand','gather','build','play','cards','brood','ds'].map(k=>{const all=am(PA,k), t=am(PA,'turns'); return {k,all,win:am(WA,k),lose:am(LA,k),share:t&&['move','play','brood'].includes(k)?Math.round(100*all/t):null};});
  const isl={}; G.forEach(g=>Object.keys(g.settled).forEach(k=>isl[k]=(isl[k]||0)+1)); res.islands=Object.entries(isl).map(([k,v])=>({k,p:pct(v,G.length)})).sort((a,b)=>b.p-a.p);
  return res;}

// ---------- affichage ----------
const f1=v=>v===null||v===undefined?'—':v.toFixed(1);
const wl=(w,l)=>w!==null&&l!==null&&f1(w)!==f1(l)?(w>l?'#2e8b3e':'#c0392b'):'';
function durTable(r){ const D=r.dur, ks=Object.keys(D.hist).map(Number); const lo=Math.min(...ks), hi=Math.max(...ks); const mx=Math.max(...Object.values(D.hist));
  let cols=''; for(let k=lo;k<=hi;k++){ const v=D.hist[k]||0; cols+=`<div class="hcol" title="${k} ${L('manches','rounds')} : ${v} ${L('parties','games')} (${pct(v,r.games)}%)"><span>${v?pct(v,r.games)+'%':''}</span><i style="height:${Math.round(100*v/mx)}%;background:${k<=18?'#e0a400':'#4a7fb5'}"></i><b>${k}</b></div>`; }
  return `<h3>${L3('Durée des parties','Game length','Durata delle partite')}</h3>
  <div class="hist">${cols}</div>
  <p class="snote">${L3(`En manches. <b style="color:#b88400">${D.fast}%</b> des parties finies en 18 manches ou moins (en jaune). Médiane : ${D.med} · plus courte : ${D.min} · plus longue : ${D.max}.`,
   `In rounds. <b style="color:#b88400">${D.fast}%</b> of games ended in 18 rounds or fewer (yellow). Median: ${D.med} · shortest: ${D.min} · longest: ${D.max}.`,
   `In round. <b style="color:#b88400">${D.fast}%</b> delle partite finite in 18 round o meno (in giallo). Mediana: ${D.med} · più breve: ${D.min} · più lunga: ${D.max}.`)}</p>`;}
function paceTable(r){ const S='<img class="acti" src="icons/star.png" alt="">';
  return `<h3>${L3('Rythme des étoiles','Star pace','Ritmo delle stelle')}</h3>
  <table class="stab"><tr><th></th><th>${L3('Manche moyenne','Average round','Round medio')}</th><th>${L('Gagnants','Winners')}</th><th>${L('Perdants','Losers')}</th><th>${L3('Écart avec la précédente','Gap from previous','Scarto dalla precedente')}</th><th>${L3('Atteinte par','Reached by','Raggiunta da')}</th></tr>
   ${r.pace.map((x,i)=>{const prev=i?r.pace[i-1].all.avg:null; const gap=prev!==null&&x.all.avg!==null?x.all.avg-prev:x.all.avg; return `<tr><td>${S}<b>${x.k}${L3(x.k===1?'re':'e',x.k===1?'st':x.k===2?'nd':x.k===3?'rd':'th','ª')} ${L3('étoile','star','stella')}</b></td><td><b>${f1(x.all.avg)}</b></td><td style="color:${wl(-(x.win.avg||0),-(x.lose.avg||0))}">${f1(x.win.avg)}</td><td>${f1(x.lose.avg)}</td><td>${gap!==null?bar(gap,8,'#e0a400')+' +'+f1(gap):''}</td><td>${x.all.pct}%</td></tr>`;}).join('')}</table>
  <p class="snote">${L3("Manche moyenne où les joueurs obtiennent leur 1re, 2e… 6e étoile (parmi ceux qui l'obtiennent). « Écart » : nombre de manches entre deux étoiles, pour voir où la partie ralentit.","Average round in which players get their 1st, 2nd… 6th star (among those who get it). “Gap”: rounds between two stars, to see where the game slows down.","Round medio in cui i giocatori ottengono la 1ª, 2ª… 6ª stella (tra chi la ottiene). «Scarto»: round tra due stelle, per vedere dove la partita rallenta.")}</p>`;}
function snowTable(r){ const S=r.snow; const ML=[L3('Égalité (départagée)','Tie (broken)','Parità (spareggio)'),L3("1 étoile d'écart",'1 star ahead','1 stella di scarto'),L3("2 étoiles d'écart",'2 stars ahead','2 stelle di scarto'),L3('3 étoiles ou plus','3 stars or more','3 stelle o più')];
  return `<h3>${L3('Effet boule de neige','Snowball effect','Effetto valanga')}</h3>
  <div class="sgrid"><div class="scard"><b>${S.leadW}%</b><span>${L3('des parties gagnées par le joueur seul en tête à mi-partie','of games won by the sole leader at mid-game','delle partite vinte dal giocatore da solo in testa a metà partita')}</span></div>
   <div class="scard"><b>${S.comeback}%</b><span>${L3('de remontées (parties avec un leader à mi-partie, gagnées par un autre joueur)','comebacks (games with a mid-game leader, won by another player)','di rimonte (partite con un leader a metà partita, vinte da un altro giocatore)')}</span></div>
   <div class="scard"><b>${S.tiedMid}%</b><span>${L3('des parties sans leader unique à mi-partie','of games with no sole leader at mid-game','delle partite senza un leader unico a metà partita')}</span></div></div>
  <table class="stab"><tr><th>${L3('Écart final entre le 1er et le 2e','Final gap between 1st and 2nd','Scarto finale tra 1° e 2°')}</th><th></th><th></th></tr>${S.margin.map(m=>`<tr><td>${ML[m.k]}</td><td class="w">${bar(m.p,100,'#7a4fa0')}</td><td>${m.p}%</td></tr>`).join('')}</table>`;}
function openTable(r){ const A={E:['expand',L3("S'étendre",'Expand','Espandersi')],G:['gather',L3('Récolter','Gather','Raccogliere')],B:['build',L3('Construire','Build','Costruire')],N:[null,L3('Nuée sans action','Flock, no action','Stormo senza azione')],P:['play',L3('Jouer des cartes','Play cards','Giocare carte')],C:['brood',L3('Couvée','Brood','Covata')]};
  const ic=c=>A[c]&&A[c][0]?`<img class="acti" src="icons/act_${A[c][0]}.png" alt="" title="${A[c][1]}">`:'';
  const row=o=>`<tr><td>${o.k.length===1?ic(o.k)+A[o.k][1]:o.k.split('').map(c=>ic(c)||A[c][1]).join(' → ')}</td><td>${bar(o.share,100,'#4a7fb5')} ${o.share}%</td><td style="color:${dcol(o.wr-r.baseWin)}"><b>${Math.round(o.wr*100)}%</b> <small>(${o.n})</small></td><td>${f1(o.six)}</td></tr>`;
  const hd=`<tr><th></th><th>${L3('Choisie','Chosen','Scelta')}</th><th>${L('Victoires','Wins')}</th><th>${L3('6e étoile (manche)','6th star (round)','6ª stella (round)')}</th></tr>`;
  let h=`<h3>${L3('Ouverture','Opening','Apertura')}</h3>
  <h4>${L3('Objectifs personnels : vitesse des étoiles','Personal objectives: star speed','Obiettivi personali: velocità delle stelle')}</h4>
  <table class="stab"><tr><th></th><th>${L3('1re étoile','1st star','1ª stella')}</th><th>${L3('3e étoile','3rd star','3ª stella')}</th><th>${L3('6e étoile','6th star','6ª stella')}</th><th>${L3('6 étoiles atteintes','6 stars reached','6 stelle raggiunte')}</th><th>${L('Victoires','Wins')}</th></tr>
   ${r.persoPace.map(o=>`<tr><td><b>${o.d.name}</b> <span class="stags">${o.d.tags.map(t=>`<img src="icons/tag_${t}.png" alt="${t}">`).join('+')}</span></td><td>${f1(o.s1)}</td><td>${f1(o.s3)}</td><td><b>${f1(o.s6)}</b></td><td>${o.s6p}%</td><td style="color:${dcol(o.wr/100-r.baseWin)}">${o.wr}% <small>(${o.n})</small></td></tr>`).join('')}</table>
  <p class="snote">${L3('Manche moyenne de la 1re, 3e et 6e étoile des joueurs ayant choisi cet objectif (ressources de départ comprises).','Average round of the 1st, 3rd and 6th star of players who chose this objective (starting resources included).',"Round medio della 1ª, 3ª e 6ª stella dei giocatori che hanno scelto questo obiettivo (risorse iniziali comprese).")}</p>`;
  if(!r.openN) return h+`<p class="snote">${L3("Premières actions : pas encore de données (comptées dans les parties jouées ou simulées à partir de maintenant).","First actions: no data yet (counted in games played or simulated from now on).","Prime azioni: ancora nessun dato (contate nelle partite giocate o simulate da ora in poi).")}</p>`;
  return h+`<h4>${L3('Première action','First action','Prima azione')}</h4><table class="stab">${hd}${r.open1.map(row).join('')}</table>
  <h4>${L3('Deux premières actions (les plus fréquentes)','First two actions (most common)','Prime due azioni (le più frequenti)')}</h4><table class="stab">${hd}${r.open2.map(row).join('')}</table>`;}
function ecoTable(r){ const T=L3('Économie (moyenne par joueur et par partie)','Economy (average per player per game)','Economia (media per giocatore e per partita)');
  if(!r.ecoN) return `<h3>${T}</h3><p class="snote">${L3("Pas encore de données : l'économie est comptée dans les parties jouées ou simulées à partir de maintenant.","No data yet: the economy is counted in games played or simulated from now on.","Ancora nessun dato: l'economia viene contata nelle partite giocate o simulate da ora in poi.")}</p>`;
  const N={start:L3("Nourritures de départ (objectif perso)",'Starting food (personal objective)','Cibo iniziale (obiettivo personale)'),harvest:L3('Nourritures récoltées (Récolter)','Food gathered (Gather)','Cibo raccolto (Raccogliere)'),gain:L3('Autres nourritures gagnées (bonus, cartes…)','Other food gained (bonuses, cards…)','Altro cibo ottenuto (bonus, carte…)'),
    spent:L3('Nourritures dépensées','Food spent','Cibo speso'),left:L3('Nourritures restantes en fin de partie','Food left at game end','Cibo rimasto a fine partita'),chicks:L3('Poussins disponibles en fin de partie','Chicks available at game end','Pulcini disponibili a fine partita'),supply:L3('Poussins encore en réserve','Chicks still in reserve','Pulcini ancora in riserva'),eggs:L3('Œufs restants','Eggs left','Uova rimaste')};
  const I={start:'anyfood',harvest:'anyfood',gain:'anyfood',spent:'anyfood',left:'anyfood',chicks:'chickicon',supply:'chickicon',eggs:'egg_k'};
  return `<h3>${T}</h3><table class="stab"><tr><th></th><th>${L('Tous','All')}</th><th>${L('Gagnants','Winners')}</th><th>${L('Perdants','Losers')}</th></tr>
   ${r.eco.map(e=>`<tr><td><img class="acti" src="icons/${I[e.k]}.png" alt="">${N[e.k]}</td><td><b>${f1(e.all)}</b></td><td style="color:${wl(e.win,e.lose)}">${f1(e.win)}</td><td>${f1(e.lose)}</td></tr>`).join('')}</table>
  <p class="snote">${L3(`Calculé sur ${r.ecoN} partie(s) enregistrée(s) avec le compteur d'économie. Nourritures = vers + graines + fruits.`,`Based on ${r.ecoN} game(s) recorded with the economy counter. Food = worms + seeds + fruits.`,`Calcolato su ${r.ecoN} partita/e registrata/e con il contatore di economia. Cibo = vermi + semi + frutti.`)}</p>`;}
function actsTable(r){
  const T=L3('Actions effectuées (moyenne par joueur et par partie)','Actions taken (average per player per game)','Azioni effettuate (media per giocatore e per partita)');
  if(!r.actsN) return `<h3>${T}</h3><p class="snote">${L3("Pas encore de données : le compteur d'actions s'applique aux parties jouées ou simulées à partir de maintenant.","No data yet: actions are counted in games played or simulated from now on.","Ancora nessun dato: le azioni vengono contate nelle partite giocate o simulate da ora in poi.")}</p>`;
  const N={turns:L3('Tours joués','Turns played','Turni giocati'),move:L3('Déplacer la Nuée puis agir','Move Flock then act','Muovi lo Stormo poi agisci'),
    expand:L3("S'étendre",'Expand','Espandersi'),gather:L3('Récolter','Gather','Raccogliere'),build:L3('Construire','Build','Costruire'),none:L3('Aucune action','No action','Nessuna azione'),
    play:L3("Jouer jusqu'à 2 cartes",'Play up to 2 cards','Gioca fino a 2 carte'),cards:L3('cartes posées','cards played','carte giocate'),brood:L3('Couvée','Brood','Covata'),ds:L3('Capacités Écaille','Dragonscale abilities','Abilità Scaglia')};
  const sub=k=>['expand','gather','build','none','cards'].includes(k);
  const ICO={move:'<span class="acti mv"><img src="icons/flock.png" alt=""></span>',expand:'<img class="acti" src="icons/act_expand.png" alt="">',gather:'<img class="acti" src="icons/act_gather.png" alt="">',
    build:'<img class="acti" src="icons/act_build.png" alt="">',play:'<img class="acti" src="icons/act_play.png" alt="">',brood:'<img class="acti" src="icons/act_brood.png" alt="">',ds:'<img class="acti ds" src="icons/scale.png" alt="">'};
  const f=v=>v===null?'—':v.toFixed(1);
  return `<h3>${T}</h3>
  <table class="stab"><tr><th></th><th>${L('Tous','All')}</th><th>${L('Gagnants','Winners')}</th><th>${L('Perdants','Losers')}</th><th>${L3('% des tours','% of turns','% dei turni')}</th></tr>
   ${r.acts.map(a=>`<tr><td>${sub(a.k)?'&nbsp;&nbsp;&nbsp;↳ ':''}${ICO[a.k]||''}${a.k==='turns'||sub(a.k)?N[a.k]:'<b>'+N[a.k]+'</b>'}</td><td><b>${f(a.all)}</b></td><td style="color:${a.win!==null&&a.lose!==null&&f(a.win)!==f(a.lose)?(a.win>a.lose?'#2e8b3e':'#c0392b'):''}">${f(a.win)}</td><td>${f(a.lose)}</td><td>${a.share!==null?bar(a.share,100,'#4a7fb5')+' '+a.share+'%':''}</td></tr>`).join('')}</table>
  <p class="snote">${L3(`Calculé sur ${r.actsG} partie(s) enregistrée(s) avec le compteur d'actions. « Tours joués » : tours de ce joueur. Les « ↳ » détaillent l'action au-dessus (action faite après le déplacement de la Nuée ; cartes posées avec « Jouer jusqu'à 2 cartes »).`,
    `Based on ${r.actsG} game(s) recorded with the action counter. “Turns played”: that player's turns. “↳” rows detail the action above (action taken after moving the Flock; cards played with “Play up to 2 cards”).`,
    `Calcolato su ${r.actsG} partita/e registrata/e con il contatore di azioni. «Turni giocati»: turni di quel giocatore. Le righe «↳» dettagliano l'azione sopra (azione dopo lo spostamento dello Stormo; carte giocate con «Gioca fino a 2 carte»).`)}</p>`;}
const ISL={meadow:['Prairie','Meadow','Prateria'],jungle:['Jungle','Jungle','Giungla'],desert:['Désert','Desert','Deserto'],mountain:['Montagne','Mountain','Montagna'],tundra:['Toundra','Tundra','Tundra'],marsh:['Marais','Marsh','Palude']};
const FAMC={Academy:'#1f80b0',Legion:'#d23c32',Court:'#e2a800',Guild:'#4f9a3a',Circle:'#6c3a8e',Ally:'#8a6a3a',Relic:'#7a7a7a'};
const FAMI=f=>/^(Academy|Legion|Court|Guild|Circle)$/.test(f)?`<img class="ftag" src="icons/tag_${f}.png" alt="${f}" title="${f}">`:`<span class="dot" style="background:${FAMC[f]}" title="${f}"></span>`;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
const bar=(v,max,col)=>`<span class="sbar"><i style="width:${Math.max(0,Math.min(100,100*v/(max||1)))}%;background:${col||'#1f8a8a'}"></i></span>`;
const dcol=d=>d>0.04?'#2e8b3e':d<-0.04?'#c0392b':'#8a7a5f';
let filt={src:'all',n:'all',ps:'all',ctype:'all',sort:'wr',minG:5};
function render(){ const B=document.getElementById('statsbody'); const r=compute(filt);
  const hdr=`<div class="sfilters">
    <span>${L('Parties','Games')} :</span>${seg('src',[['all',L('Toutes','All')],['human',L('Avec humains','With humans')],['sim',L('Simulations IA','AI simulations')]].concat(recv&&recv.length?[['shared',L('Reçues des joueurs','Sent by players')+' ('+recv.length+')']]:[]))}
    <span>${L('Joueurs','Players')} :</span>${seg('n',[['all',L('Tous','All')],['2','2'],['3','3'],['4','4']])}<span>${L('Objectifs perso','Personal objectives')} :</span>${seg('ps',[['all',L('Tous','All')],['classic',L('Classiques','Classic')],['new',L('Recommandés','Recommended')]])}</div>`;
  if(!r.games){B.innerHTML=hdr+`<div class="sempty">${L('Aucune partie enregistrée pour ces filtres. Jouez une partie ou lancez des simulations ci-dessus.','No game recorded for these filters. Play a game or run simulations above.')}</div>`; wire(); return;}
  const starL={settlement:L('Colonies','Settlements'),perso:L('Objectifs personnels','Personal objectives'),red:L('Objectifs rouges','Red objectives'),blue:L('Objectifs bleus','Blue objectives'),elders:L('Chemin des Anciens',"Elders' Path"),cards:L('Cartes (Reliques, Alliés…)','Cards (Relics, Allies…)')};
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
  ${durTable(r)}
  ${paceTable(r)}
  ${snowTable(r)}
  <h3>${L('D\'où viennent les Étoiles','Where Stars come from')}</h3>
  <table class="stab">${r.starSrc.map(s=>`<tr><td>${starL[s.k]}</td><td class="w">${bar(s.p,100,'#e0a400')}</td><td>${s.p}%</td></tr>`).join('')}</table>
  <h3>${L('Objectifs rouges','Red objectives')}</h3>${objTable(r.red)}
  <h3>${L('Objectifs bleus','Blue objectives')}</h3>${objTable(r.blue)}
  <h3>${L('Objectifs personnels','Personal objectives')}</h3>
  <table class="stab"><tr><th></th><th>${L('Choisi quand proposé','Picked when offered')}</th><th>${L('1re Étoile (5)','1st Star (5)')}</th><th>${L('2e Étoile (9)','2nd Star (9)')}</th><th>${L('Victoires','Wins')}</th></tr>
   ${r.perso.map(o=>`<tr><td><b>${o.d.name}</b> <span class="stags" title="${o.d.tags.join(' + ')}">${o.d.tags.map(t=>`<img src="icons/tag_${t}.png" alt="${t}">`).join('+')}</span></td><td>${o.offered?o.picked+'%':'—'}</td><td>${o.n?o.one+'%':'—'}</td><td>${o.n?o.two+'%':'—'}</td><td style="color:${dcol(o.wr/100-r.baseWin)}">${o.n?o.wr+'%':'—'} <small>(${o.n})</small></td></tr>`).join('')}</table>
  ${actsTable(r)}
  ${openTable(r)}
  ${ecoTable(r)}
  <h3>${L('Bâtiments','Buildings')}</h3>
  <table class="stab"><tr><th></th><th>${L('Moyenne construite','Average built')}</th><th>${L('Gagnants','Winners')}</th><th>${L('Perdants','Losers')}</th><th>${L('Niv. 1 / 2 / 3 / 4 construits','Lvl 1 / 2 / 3 / 4 built')}</th></tr>
   ${r.build.map(b=>`<tr><td><i class="bico wood" style="--c:#8a8a8a;--ico:url(icons/${b.t}.png)"></i><b>${({nest:L('Nids','Nests'),shrine:L('Sanctuaires','Shrines'),workshop:L('Ateliers','Workshops')})[b.t]}</b>${b.t==='nest'?` <small>${L('(hors Nid de départ)','(excluding starting nest)')}</small>`:''}</td><td>${b.all}</td><td style="color:${+b.win>+b.lose?'#2e8b3e':'#c0392b'}">${b.win}</td><td>${b.lose}</td><td>${(b.t==='nest'?b.lv.slice(1):b.lv).map(v=>v+'%').join(' / ')}</td></tr>`).join('')}</table>
  <h3>${L('Gagnants vs perdants','Winners vs losers')}</h3>
  <table class="stab"><tr><th></th><th>${L('Gagnants','Winners')}</th><th>${L('Perdants','Losers')}</th></tr>${r.misc.map(m=>`<tr><td>${m.l}</td><td style="color:${+m.w>+m.lo?'#2e8b3e':'#c0392b'}"><b>${m.w}</b></td><td>${m.lo}</td></tr>`).join('')}</table>
  <h3>${L('Runes','Runes')}</h3>
  <table class="stab"><tr><th></th><th>${L('Prise par','Taken by')}</th><th>${L('Victoires','Wins')}</th></tr>${r.runes.map(a=>`<tr><td>${esc(window.BirdsGame.RUNES[a.k])}</td><td class="w">${bar(a.pct,100,'#7a4fa0')} ${a.pct}%</td><td style="color:${dcol(a.wr/100-r.baseWin)}">${a.wr}%</td></tr>`).join('')}</table>
  <h3>${L('Colonies fondées','Settlements founded')}</h3>
  <table class="stab">${r.islands.map(i=>`<tr><td><img class="islic" src="icons/isl_${i.k}.png" alt=""> ${ISL[i.k][LG()==='en'?1:LG()==='it'?2:0]}</td><td class="w">${bar(i.p,100,'#3a8f6a')}</td><td>${i.p}% ${L('des parties','of games')}</td></tr>`).join('')}</table>
  <h3>${L('Tags des cartes jouées','Tags of cards played')}</h3>
  <table class="stab"><tr><th></th><th>${L('Toutes les cartes jouées','All cards played')}</th><th>${L('Cartes jouées par les gagnants','Cards played by winners')}</th></tr>${r.fams.sort((a,b)=>b.win-a.win).map(f=>`<tr><td>${FAMI(f.f)} ${f.f}</td><td>${f.all}%</td><td style="color:${dcol((f.win-f.all)/100)}"><b>${f.win}%</b></td></tr>`).join('')}</table>
  <h3>${L('Résumé par tag','Summary by tag')}</h3>
  <table class="stab"><tr><th></th><th>${L('Cartes du tag','Cards with the tag')}</th><th>${L('Poses','Plays')}</th><th>${L('Joueurs qui en ont posé','Players who played some')}</th><th>${L('Écart moyen des cartes','Average card delta')}</th></tr>
   ${r.tags.map(t=>`<tr><td>${t.t==='none'?`<span class="notag">∅</span> ${L('Sans tag','No tag')}`:`<img class="ftag big" src="icons/tag_${t.t}.png" alt="${t.t}" title="${t.t}">`}</td><td>${t.cards}</td><td>${t.plays}</td><td>${t.players}% <small style="color:${dcol(t.pdelta)}">(${t.pdelta>=0?'+':''}${Math.round(t.pdelta*100)} pts)</small></td><td style="color:${dcol(t.delta)}"><b>${t.delta>=0?'+':''}${(t.delta*100).toFixed(1)} pts</b></td></tr>`).join('')}</table>
  <p class="snote">${L("« Écart moyen des cartes » : moyenne des écarts de victoire des cartes de ce tag, pondérée par le nombre de parties où chaque carte a été posée. « Sans tag » : Alliés et Reliques sans tag.","“Average card delta”: average win-rate delta of the cards with this tag, weighted by the number of games each card was played in. “No tag”: Allies and Relics without a tag.")}</p>
  <h3>${L('Cartes','Cards')}</h3>
  <div class="sfilters">${seg('ctype',[['all',L('Toutes','All')],['bird',L('Oiseaux','Birds')],['ally',L('Alliés','Allies')],['relic',L('Reliques','Relics')]])}
   <span>${L('Trier par','Sort by')} :</span>${seg('sort',[['wr',L('Victoires','Win rate')],['rate',L('Fréquence','Frequency')],['plays',L('Nb de poses','Times played')],['cost',L('Coût','Cost')]])}
   <span>${L('Min. parties','Min. games')} :</span>${seg('minG',[['1','1'],['5','5'],['20','20'],['50','50']])}</div>
  <p class="snote">${L('« Joueurs qui l\'ont posée » : part des joueurs ayant joué la carte au moins une fois. « Victoires » : taux de victoire de ces joueurs ; en vert au-dessus de la référence, en rouge en dessous. Une carte peut gagner souvent parce qu\'elle arrive tard chez un joueur déjà en tête : à lire comme une tendance.','"Players who played it": share of players who played the card at least once. "Win rate": win rate of those players; green above baseline, red below. A card may win often because it lands late with a player already ahead: read it as a trend.')}</p>
  <table class="stab cards"><tr><th>${L('Carte','Card')}</th><th>${L('Coût','Cost')}</th><th>${L('Joueurs qui l\'ont posée','Players who played it')}</th><th>${L('Victoires','Win rate')}</th><th>${L('Écart','Delta')}</th></tr>
   ${cards.map(c=>`<tr data-card="${c.id}" class="crow"><td>${FAMI(c.fam)} ${esc(c.info.name)} <small>${c.id}</small></td><td>${c.info.cost}</td><td class="w">${bar(c.rate,maxRate)} ${(c.rate*100).toFixed(1)}% <small>(${c.games})</small></td><td style="color:${dcol(c.delta)}"><b>${Math.round(c.wr*100)}%</b></td><td style="color:${dcol(c.delta)}">${c.delta>0?'+':''}${Math.round(c.delta*100)}</td></tr>`).join('')}</table>`;
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
    <span class="sright"><button id="sImg" class="ob ghost">🖼 ${L('Enregistrer en image','Save as image')}</button><button id="sExp" class="ob ghost">${L('Copier les données (JSON)','Copy data (JSON)')}</button><button id="sClr" class="ob ghost">${L('Effacer','Clear')}</button></span></div>
   <p class="snote">${L('Chaque partie terminée sur cet appareil est enregistrée dans ce navigateur. Les simulations utilisent les IA du prototype : elles montrent des tendances, pas le jeu de vrais joueurs.','Every game finished on this device is saved in this browser. Simulations use the prototype AIs: they show trends, not how real players play.')}</p>
   <div id="sshare" class="ssim" hidden></div>
   <div id="strain" class="ssim strain"></div>
   <div id="statsbody"></div></div>`;
  M.style.display='flex'; M.querySelector('.sclose').onclick=()=>{M.style.display='none';};
  M.querySelector('#simGo').onclick=()=>{ if(running){stopReq=true; return;} const b=M.querySelector('#simGo'); b.textContent=L('Arrêter','Stop');
    simulate(+M.querySelector('#simN').value,M.querySelector('#simP').value,(k,n,done)=>{M.querySelector('#simMsg').textContent=done?` ${L('Terminé','Done')} (${k})`:` ${k} / ${n}…`; if(done){b.textContent=L('Lancer','Run'); render();} else if(k%25===0) render();});};
  M.querySelector('#sClr').onclick=()=>{ const b=M.querySelector('#sClr'); if(b.dataset.c){S.clear(); b.dataset.c=''; b.textContent=L('Effacer','Clear'); render();} else {b.dataset.c='1'; b.textContent=L('Confirmer l\'effacement','Confirm clear');}};
  M.querySelector('#sImg').onclick=()=>saveImage(M);
  M.querySelector('#sExp').onclick=async()=>{ try{await navigator.clipboard.writeText(JSON.stringify(load())); M.querySelector('#simMsg').textContent=' '+L('Données copiées','Data copied');}catch(e){M.querySelector('#simMsg').textContent=' '+L('Copie impossible ici','Copy not available here');}};
  shareBar(M); trainBar(M); render();}

// ---------- entraînement de l'IA (train-worker.js) ----------
const AIW_V=1; let TR={running:false,log:[],best:null,worker:null,msg:'',accepted:0,cfg:{gens:20,perGen:100,players:2}};
S.aiwInfo=()=>{ try{ return JSON.parse(localStorage.getItem('birds_aiw')||'null'); }catch(e){ return null; } };
S.applyAIW=o=>{ if(o&&o.v===AIW_V&&o.w){ window.AIW=o.w; S.curAIW=o; } };
S.loadAIW=async()=>{ S.applyAIW(S.aiwInfo()); const N=S.net(); if(N){ try{ const d=await N.db.doc('ai/best').get(); if(d.exists){ const o=d.data(); if(o&&o.v===AIW_V&&o.w) S.applyAIW(o); else if(o&&o.reset){ window.AIW=null; S.curAIW=null; } } }catch(e){} } };
async function saveAIW(w){ const o={v:AIW_V,w,t:Date.now(),gens:TR.accepted}; window.AIW=w; S.curAIW=o; try{localStorage.setItem('birds_aiw',JSON.stringify(o));}catch(e){}
  const N=S.net(); if(N){ try{ await N.db.doc('ai/best').set(o); return 'shared'; }catch(e){} } return 'local'; }
async function resetAIW(){ window.AIW=null; S.curAIW=null; try{localStorage.removeItem('birds_aiw');}catch(e){} const N=S.net(); if(N){ try{ await N.db.doc('ai/best').set({v:AIW_V,reset:true,t:Date.now()}); }catch(e){} } }
function trainBar(M){ const B=M.querySelector('#strain'); if(!B) return; const c=TR.cfg, cur=S.curAIW;
  const opt=(id,vals,v)=>`<select id="${id}">${vals.map(x=>`<option ${String(x)===String(v)?'selected':''}>${x}</option>`).join('')}</select>`;
  B.innerHTML=`<div class="trow"><b>🧠 ${L("Entraînement de l'IA","AI training")}</b>
     ${L('Générations','Generations')} ${opt('tGen',[5,10,20,50,100],c.gens)} · ${L('Parties par génération','Games per generation')} ${opt('tPer',[40,100,200,400],c.perGen)} · ${L('Joueurs','Players')} ${opt('tPl',[2,3,4],c.players)}
     <button id="tGo" class="ob">${TR.running?L('Arrêter','Stop'):L('Lancer','Run')}</button>${cur?`<button id="tReset" class="ob ghost">${L("Revenir aux réglages d'origine",'Back to original settings')}</button>`:''}</div>
   <p class="snote">${L("À chaque génération, une IA « challenger » aux réglages légèrement modifiés affronte l'IA actuelle. Ses réglages sont adoptés et utilisés dans toutes les parties si elle gagne nettement plus que sa part attendue, ou si, aussi forte, elle atteint ses 6 étoiles plus vite : c'est le but du jeu.","Each generation, a “challenger” AI with slightly changed settings plays the current AI. Its settings are adopted and used in every game if it wins clearly more than its expected share, or if, just as strong, it reaches 6 stars faster: that is the goal of the game.")}</p>
   <div class="tstat">${L('IA actuelle','Current AI')} : ${cur?L3(`réglages entraînés le ${new Date(cur.t).toLocaleDateString()} (${cur.gens||0} génération(s) adoptée(s))`,`trained settings from ${new Date(cur.t).toLocaleDateString()} (${cur.gens||0} generation(s) adopted)`,`impostazioni allenate il ${new Date(cur.t).toLocaleDateString()} (${cur.gens||0} generazione/i adottata/e)`):L("réglages d'origine","original settings")}${S.net()?' · '+L('partagés avec tous les joueurs','shared with all players'):' · '+L('enregistrés dans ce navigateur','saved in this browser')}</div>
   <div class="tmsg">${TR.msg||''}</div>
   ${TR.log.length?`<table class="stab tlog"><tr><th>${L('Génération','Generation')}</th><th>${L('Victoires du challenger','Challenger wins')}</th><th>${L('Part attendue','Expected share')}</th><th>${L('Manches','Rounds')}</th><th>${L('6 étoiles : challenger / actuelle','6 stars: challenger / current')}</th><th></th></tr>${TR.log.slice(-12).reverse().map(g=>`<tr><td>${g.gen}</td><td>${Math.round(g.rate*100)} %</td><td>${Math.round(g.expected*100)} %</td><td>${g.rounds.toFixed(1)}</td><td>${g.six?g.six.toFixed(1):'–'} / ${g.sixBest?g.sixBest.toFixed(1):'–'}</td><td>${g.accepted?'✓ '+L('adopté','adopted'):''}</td></tr>`).join('')}</table>`:''}`;
  const get=()=>{ c.gens=+B.querySelector('#tGen').value; c.perGen=+B.querySelector('#tPer').value; c.players=+B.querySelector('#tPl').value; };
  ['tGen','tPer','tPl'].forEach(id=>B.querySelector('#'+id).onchange=get);
  B.querySelector('#tGo').onclick=()=>{ if(TR.running){ TR.worker&&TR.worker.postMessage({cmd:'stop'}); TR.msg=L('Arrêt demandé…','Stopping…'); trainBar(M); return; } get(); startTrain(M); };
  const rb=B.querySelector('#tReset'); if(rb) rb.onclick=async()=>{ await resetAIW(); TR.msg=L("L'IA utilise de nouveau ses réglages d'origine.",'The AI uses its original settings again.'); trainBar(M); };}
function startTrain(M){ let w; try{ w=new Worker('train-worker.js'); }catch(e){ TR.msg=L("Entraînement impossible ici (ouvrez l'appli depuis un serveur, pas en double-cliquant le fichier).",'Training is not possible here (open the app from a server).'); trainBar(M); return; }
  const c=TR.cfg; Object.assign(TR,{running:true,log:[],worker:w,accepted:0,best:null,msg:L('Démarrage…','Starting…')}); const t0=Date.now();
  w.onmessage=async ev=>{ const m=ev.data; const B=document.getElementById('strain');
    if(m.type==='tgame'){ TR.msg=L3(`Génération ${m.gen} / ${c.gens} : partie ${m.g} / ${c.perGen}`,`Generation ${m.gen} / ${c.gens}: game ${m.g} / ${c.perGen}`,`Generazione ${m.gen} / ${c.gens}: partita ${m.g} / ${c.perGen}`); const x=B&&B.querySelector('.tmsg'); if(x) x.textContent=TR.msg; return; }
    if(m.type==='gen'){ TR.log.push(m); if(m.accepted){ TR.accepted++; TR.best=m.best; } if(B) trainBar(M); return; }
    if(m.type==='done'){ TR.running=false; w.terminate(); TR.worker=null; const mins=Math.round((Date.now()-t0)/60000);
      if(TR.accepted){ const where=await saveAIW(TR.best); TR.msg=L3(`Terminé : ${TR.accepted} génération(s) adoptée(s) sur ${TR.log.length}. Les nouveaux réglages sont utilisés dans toutes les parties`,`Done: ${TR.accepted} generation(s) adopted out of ${TR.log.length}. The new settings are used in every game`,`Finito: ${TR.accepted} generazione/i adottata/e su ${TR.log.length}. Le nuove impostazioni sono usate in tutte le partite`)+(where==='shared'?L(' (partagés avec tous les joueurs).',' (shared with all players).'):L(' (enregistrés dans ce navigateur).',' (saved in this browser).')); }
      else TR.msg=L3(`Terminé : aucun challenger n'a fait nettement mieux sur ${TR.log.length} génération(s). L'IA reste inchangée.`,`Done: no challenger did clearly better over ${TR.log.length} generation(s). The AI is unchanged.`,`Finito: nessuno sfidante ha fatto nettamente meglio su ${TR.log.length} generazione/i. L'IA resta invariata.`);
      if(document.getElementById('strain')) trainBar(M); } };
  w.onerror=e=>{ TR.running=false; TR.msg=L("Erreur pendant l'entraînement.",'Error during training.'); console.warn(e); trainBar(M); };
  w.postMessage({cmd:'train',gens:c.gens,perGen:c.perGen,players:c.players,weights:window.AIW||null,persoSet:window.BirdsPersoSet||'new'});
  trainBar(M); }
async function shareBar(M){ const B=M.querySelector('#sshare'); const N=S.net(); if(!N){ B.hidden=true; return; }
  let owner=false; try{ owner=N.user?await N.user.isOwner():false; }catch(e){}
  if(owner){ B.hidden=false; B.innerHTML=`<b>📥 ${L('Parties envoyées par les joueurs','Games sent by players')}</b> : <span id="srecv">${L('chargement…','loading…')}</span>`;
    try{ const r=await S.fetchShared(); const who=new Set(r.map(x=>x.from).filter(Boolean)); M.querySelector('#srecv').textContent=r.length?`${r.length} ${L('partie(s)','game(s)')}${who.size?` — ${[...who].join(', ')}`:''}. ${L('Filtre « Reçues des joueurs » ci-dessous.','Use the “Sent by players” filter below.')}`:L('aucune pour l\'instant.','none yet.'); render(); }
    catch(e){ M.querySelector('#srecv').textContent=L('impossible de les lire pour l\'instant.','could not be read right now.'); }
    return; }
  const u=S.unsent(); let nm=''; try{nm=localStorage.getItem('birds_from')||'';}catch(e){}
  B.hidden=false; B.innerHTML=`<b>📤 ${L('Envoyer mes parties à l\'auteur','Send my games to the author')}</b> : <input id="sfrom" class="sfrom" maxlength="30" placeholder="${L('Votre nom','Your name')}"> <button id="ssend" class="ob" ${u.length?'':'disabled'}>${u.length?L3(`Envoyer ${u.length} partie(s)`,`Send ${u.length} game(s)`,`Invia ${u.length} partita/e`):L('Tout est envoyé','All sent')}</button><span id="ssmsg"></span>`;
  const inp=M.querySelector('#sfrom'); inp.value=nm;
  M.querySelector('#ssend').onclick=async()=>{ const b=M.querySelector('#ssend'), msg=M.querySelector('#ssmsg'); b.disabled=true; try{localStorage.setItem('birds_from',inp.value.trim());}catch(e){}
    msg.textContent=' '+L('Envoi…','Sending…');
    try{ const n=await S.send(S.unsent(),inp.value.trim()); msg.textContent=' ✓ '+L3(`${n} partie(s) envoyée(s). Merci !`,`${n} game(s) sent. Thank you!`,`${n} partita/e inviata/e. Grazie!`); b.textContent=L('Tout est envoyé','All sent'); }
    catch(e){ console.warn(e); b.disabled=false; msg.textContent=' '+L('Envoi refusé : votre accès à l\'appli ne le permet pas. Utilisez « Copier les données (JSON) ».','Sending refused: your access to the app does not allow it. Use “Copy data (JSON)”.'); } };}
function loadH2C(){return window.html2canvas?Promise.resolve():new Promise((res,rej)=>{const sc=document.createElement('script'); sc.src='https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; sc.onload=res; sc.onerror=rej; document.head.appendChild(sc);});}
async function saveImage(M){const msg=M.querySelector('#simMsg'); msg.textContent=' '+L('Création de l\'image…','Creating image…');
  try{ await loadH2C(); const box=M.querySelector('.sbox2'); const bar=M.querySelector('.ssim'); bar.style.visibility='hidden';
    const cv=await html2canvas(box,{backgroundColor:'#fffaf0',scale:2,useCORS:true,windowWidth:box.scrollWidth,height:box.scrollHeight}); bar.style.visibility='';
    const name='birds-statistiques-'+new Date().toISOString().slice(0,10)+'.png';
    cv.toBlob(b=>{const url=URL.createObjectURL(b); let ok=false; try{const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); ok=true;}catch(e){}
      // aperçu de secours : clic droit > Enregistrer l'image
      const V=document.createElement('div'); V.className='imgprev'; V.innerHTML=`<div class="ipbox"><div class="iph"><b>${L('Image des statistiques','Statistics image')}</b> — ${L('si le téléchargement n\'a pas démarré : clic droit sur l\'image › « Enregistrer l\'image sous… »','if the download did not start: right-click the image › "Save image as…"')} <button class="ob">✕</button></div><img src="${url}"></div>`;
      V.querySelector('button').onclick=()=>V.remove(); document.body.appendChild(V); msg.textContent=' '+L('Image prête','Image ready');},'image/png');
  }catch(e){ console.error(e); M.querySelector('.ssim').style.visibility=''; msg.textContent=' '+L('Impossible de créer l\'image ici','Could not create the image here'); }}
window.BirdsStatsUI={open};
})();
