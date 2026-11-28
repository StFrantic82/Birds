// usage: node bench.js '<json cfg>'  cfg={n:3,N:60,A:{aiw:{},la:{k,r}|null},B:{...}}  A = 1 siège (tournant), B = les autres
global.window=global;const fs=require('fs');const dir=process.env.BDIR||__dirname+'/../';
for(const f of ['data.js','content.js','engine.js','cards.js']) eval(fs.readFileSync(dir+f,'utf8'));
if(process.env.LAS) window.LAS={};
const cfg=JSON.parse(process.argv[2]); const n=cfg.n||3, N=cfg.N||60;
(async()=>{let w=0,G=0,rounds=0,sa=0,sb=0,t0=Date.now(),err=0;
for(let k=0;k<N;k++){const io={aiDelay:0,sleep:()=>Promise.resolve(),log:()=>{},render:()=>{},ask:()=>{throw new Error('human')},gameOver:()=>{}};
 const g=new BirdsGame.Game({players:Array.from({length:n},(_,i)=>({name:'p'+i,ai:true}))},io); const seat=k%n;
 g.players.forEach(p=>{const c=p.i===seat?cfg.A:cfg.B; if(c&&c.aiw) p.aiw=c.aiw; p.la=(c&&c.la)||null; if(p.la&&p.la.skip) p.la=Object.assign({},p.la,{skip:new RegExp(p.la.skip)});});
 try{await g.run();}catch(e){err++; if(err<3) console.error(e.stack.split('\n').slice(0,3).join('|')); continue;}
 G++; if(process.env.DBG) console.error(g.players.map(p=>p.stars),g.round); if(g.ranking[0].i===seat) w++; rounds+=g.round; sa+=g.players[seat].stars; sb+=g.players.filter(p=>p.i!==seat).reduce((a,p)=>a+p.stars,0)/(n-1);}
if(process.env.LAS) console.error(JSON.stringify(window.LAS,null,1));
console.log(JSON.stringify({w,G,rounds:+(rounds/G).toFixed(1),sa:+(sa/G).toFixed(2),sb:+(sb/G).toFixed(2),err,sec:Math.round((Date.now()-t0)/1000)}));})();
