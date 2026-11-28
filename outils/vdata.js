global.window=global;const fs=require('fs');for(const f of ['data.js','content.js','engine.js','cards.js']) eval(fs.readFileSync((process.env.BDIR||__dirname+'/../')+f,'utf8'));
const {feats}=require('./feats.js'); const N=+(process.argv[2]||500), out=process.argv[3]||'vd.json';
(async()=>{const rows=[];
for(let k=0;k<N;k++){const n=2+(k%3===2?1:0)+(k%7===6?1:0); const io={aiDelay:0,sleep:()=>Promise.resolve(),log:()=>{},render:()=>{},ask:()=>{throw 1},gameOver(){}};
 const g=new BirdsGame.Game({players:Array.from({length:n},(_,i)=>({name:'p'+i,ai:true}))},io); const st=[];
 const orig=g.takeTurn.bind(g); g.takeTurn=async()=>{ st.push({c:g.current,ph:Math.max(...g.players.map(p=>p.stars))/6,f:g.players.map(p=>feats(g,p))}); return orig(); };
 try{await g.run();}catch(e){continue;}
 const w=g.ranking[0].i; st.forEach(s=>{ if(Math.random()<0.5) rows.push([w,s.c,+s.ph.toFixed(2),s.f.map(f=>f.map(x=>+x.toFixed(3)))]); });}
fs.writeFileSync(out,JSON.stringify(rows));})();
