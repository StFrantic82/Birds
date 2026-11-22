// Birds — entraînement de l'IA en arrière-plan (Web Worker)
// À chaque génération, une IA « challenger » aux réglages légèrement modifiés affronte l'IA actuelle.
// Si elle gagne nettement plus que sa part attendue, ses réglages deviennent la nouvelle référence.
self.window=self;
importScripts('data.js','content.js','engine.js','cards.js');
const BG=self.BirdsGame;
const KEYS=Object.keys(BG.AIW_CLASSIC);
let stop=false;
const gauss=()=>{let u=0; while(!u) u=Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*Math.random());};
function mutate(w,sigma){ const o=Object.assign({},w); const n=1+Math.floor(Math.random()*4);
  for(let i=0;i<n;i++){ const k=KEYS[Math.floor(Math.random()*KEYS.length)]; const v=o[k];
    o[k]= Math.abs(v)<0.05 ? Math.round(gauss()*0.8*1000)/1000 : Math.round((v*Math.exp(gauss()*sigma)+gauss()*0.1)*1000)/1000; }
  return o; }
async function play(ws,persoSet){
  const io={aiDelay:0,sim:true,sleep:()=>Promise.resolve(),log(){},render(){},ask(){},gameOver(){}};
  const g=new BG.Game({players:ws.map((w,i)=>({name:'IA '+(i+1),ai:true})),persoSet},io);
  ws.forEach((w,i)=>{ g.players[i].aiw=w; });
  await g.run(); return g; }
self.onmessage=async ev=>{ const m=ev.data;
  if(m.cmd==='stop'){ stop=true; return; }
  if(m.cmd!=='train') return;
  stop=false;
  const n=m.players||2;
  let best=Object.assign({},BG.AIW_CLASSIC,BG.AIW_TRAINED,m.weights||{}), bestRounds=null;
  for(let gen=1; gen<=m.gens && !stop; gen++){
    const ch=mutate(best,m.sigma||0.4);
    let share=0, games=0, rounds=0, six=0, sixN=0;
    for(let g=0; g<m.perGen && !stop; g++){
      // le challenger occupe une place sur deux, en alternant
      const ws=[...Array(n)].map((_,k)=>((k+g)%2===0)?ch:best);
      const s=await play(ws,m.persoSet);
      const chSeats=ws.map((w,k)=>w===ch?k:-1).filter(k=>k>=0);
      games++; rounds+=s.round; if(chSeats.includes(s.ranking[0].i)) share++;
      chSeats.forEach(k=>{ const r=(s.players[k].starRounds||[])[5]; if(r){ six+=r.round; sixN++; } });
      if(g%5===4) self.postMessage({type:'tgame',gen,g:g+1});
    }
    if(!games) break;
    const expected=Math.ceil(n/2)/n, rate=share/games, r=rounds/games;
    const se=Math.sqrt(expected*(1-expected)/games);
    if(bestRounds===null) bestRounds=r;
    // gagne nettement plus que sa part attendue ; ou, en mode « parties rapides », aussi fort mais plus rapide
    const accepted= rate>expected+Math.max(0.04,1.6*se) || (m.rush && rate>=expected-0.02 && r<bestRounds-0.3);
    if(accepted){ best=ch; bestRounds=r; }
    self.postMessage({type:'gen',gen,rate,expected,accepted,rounds:r,six:sixN?six/sixN:null,best});
  }
  self.postMessage({type:'done',best});
};
