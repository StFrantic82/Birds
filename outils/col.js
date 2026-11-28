// collecte de parties avec la vraie IA : node col.js <n joueurs> <N parties> <fichier> [json opts]
global.window=global;const fs=require('fs');const dir=process.env.BDIR||__dirname+'/../';
for(const f of ['data.js','content.js','engine.js','cards.js']) eval(fs.readFileSync(dir+f,'utf8'));
const n=+process.argv[2], N=+process.argv[3], out=process.argv[4], extra=JSON.parse(process.argv[5]||'{}'); const LA=process.env.NOLA?null:BirdsGame.AI_LA;
(async()=>{ for(let k=0;k<N;k++){const io={sim:true,aiDelay:0,lookahead:LA,sleep:()=>Promise.resolve(),log:()=>{},render:()=>{},ask:()=>{throw new Error('human')},gameOver:()=>{}};
 const opts=Object.assign({players:Array.from({length:n},(_,i)=>({name:'p'+i,ai:true})),persoSet:'new'},extra); if(extra.blues) opts.blue=extra.blues[k%extra.blues.length]; if(extra.forceAll){const ids=['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10']; for(let i=ids.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [ids[i],ids[j]]=[ids[j],ids[i]];} opts.forcePerso={}; for(let i=0;i<n;i++) opts.forcePerso[i]=ids[i];} if(extra.neutral){opts.persoRes={}; for(let i=1;i<=10;i++) opts.persoRes['A'+String(i).padStart(2,'0')]=extra.neutral;} if(extra.force){const f=extra.force[k%extra.force.length]; opts.forcePerso={[k%n]:f};}
 const g=new BirdsGame.Game(opts,io); if(extra.res) g.players.forEach(p=>{}); 
 try{await g.run();}catch(e){console.error(e.stack.split("\n").slice(0,4).join(" | ")); continue;}
 const r=g.statRecord(g.ranking); r.bth=g.objs[1].th; fs.appendFileSync(out,JSON.stringify(r)+'\n'); } })();
