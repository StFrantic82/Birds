global.window=global;const fs=require('fs');for(const f of ['data.js','content.js','engine.js','cards.js']) eval(fs.readFileSync((process.env.BDIR||__dirname+'/../')+f,'utf8'));
const g0=new BirdsGame.Game({players:[0,1].map(i=>({name:'p'+i,ai:true}))},{aiDelay:0,sleep:()=>Promise.resolve(),log(){},render(){},ask(){throw 1},gameOver(){}});
const files=process.argv.slice(2); let R=[]; for(const f of files) R=R.concat(fs.readFileSync(f,'utf8').trim().split('\n').map(JSON.parse));
const FAMS=['Academy','Legion','Court','Guild','Circle']; const P=R.flatMap(r=>r.players.map(p=>Object.assign({n:r.n},p))); const base=P.filter(p=>p.win).length/P.length;
const pc=x=>(100*x).toFixed(1).padStart(5)+'%';
console.log('parties',R.length,'joueurs',P.length);
// offre de tags dans le paquet
console.log('\nFamille   cartes tags  coût moyen/tag | jouées/joueur  victoires si jouée (écart)  ');
const ids=Object.keys(g0.cardById); const st={};
FAMS.forEach(f=>{const cs=ids.filter(id=>(g0.card(id).tagMap||{})[f]); const tags=cs.reduce((a,id)=>a+g0.card(id).tagMap[f],0); const cost=cs.reduce((a,id)=>a+g0.card(id).cost,0);
  let plays=0,wins=0; P.forEach(p=>p.played.forEach(id=>{const t=(g0.card(id).tagMap||{})[f]; if(t){plays++; if(p.win)wins++;}}));
  st[f]={tags,cs:cs.length}; console.log(f.padEnd(9),String(cs.length).padStart(5),String(tags).padStart(5),(cost/tags).toFixed(2).padStart(10),'     |',(plays/P.length).toFixed(2).padStart(8),'      ',pc(wins/plays),'('+((wins/plays-base)*100).toFixed(1)+')');});
const wild=ids.filter(id=>g0.card(id).wild); console.log('cartes à tag joker :',wild.length);
// par objectif
const PO=BirdsGame.PERSONAL; console.log('\nObjectif      tags                 n   victoires   ±   étoiles  ét.perso  manche 1re ét.perso  %avec≥1  %avec 2');
const rows=[]; PO.forEach(o=>{const ps=P.filter(p=>p.pobj===o.id); if(!ps.length) return; const w=ps.filter(p=>p.win).length/ps.length; const fr=[]; ps.forEach(p=>{const s=p.starRounds.find(s=>/Objectif personnel/.test(s.why)); if(s) fr.push(s.round);});
  rows.push({o,w,n:ps.length}); console.log(o.id,o.name.padEnd(12),o.tags.join('+').padEnd(16),String(ps.length).padStart(5),pc(w),('±'+(196*Math.sqrt(w*(1-w)/ps.length)).toFixed(1)).padStart(6),(ps.reduce((a,p)=>a+p.stars,0)/ps.length).toFixed(2).padStart(7),(ps.reduce((a,p)=>a+p.pClaims,0)/ps.length).toFixed(2).padStart(8),(fr.reduce((a,b)=>a+b,0)/fr.length).toFixed(1).padStart(12),pc(ps.filter(p=>p.pClaims>=1).length/ps.length).padStart(14),pc(ps.filter(p=>p.pClaims>=2).length/ps.length));});
// ajustement : victoire = base + eff(fam1)+eff(fam2)  (moindres carrés, somme des effets = 0)
const eff={}; FAMS.forEach(f=>eff[f]=0); for(let it=0;it<2000;it++){ FAMS.forEach(f=>{let num=0,den=0; rows.forEach(r=>{ if(r.o.tags.includes(f)){const other=r.o.tags.find(t=>t!==f); num+=r.n*(r.w-base-eff[other]); den+=r.n;} }); eff[f]=num/den;}); }
console.log('\nEffet par famille (points de victoire) :',FAMS.map(f=>f+' '+(100*eff[f]).toFixed(1)).join(' · '));
console.log('Objectif : mesuré / prédit par les 2 familles'); rows.forEach(r=>console.log(' ',r.o.id,r.o.name.padEnd(12),pc(r.w),pc(base+eff[r.o.tags[0]]+eff[r.o.tags[1]])));
fs.writeFileSync('fam_out.json',JSON.stringify({base,eff,rows:rows.map(r=>({id:r.o.id,w:r.w,n:r.n}))}));
