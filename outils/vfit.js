const fs=require('fs');const {FN}=require('./feats.js');
const tr=JSON.parse(fs.readFileSync('vd1.json')), va=JSON.parse(fs.readFileSync('vd2.json'));
const F=FN.length, D=2*F;
const x=(f,ph)=>{const v=new Array(D); for(let i=0;i<F;i++){v[i]=f[i]; v[F+i]=f[i]*ph;} return v;};
function loss(w,data,grad,mask){let L=0; for(const [win,c,ph,fs_] of data){ const xs=fs_.map(f=>x(f,ph)); const s=xs.map(v=>{let a=0; for(let i=0;i<D;i++) if(!mask||mask[i]) a+=w[i]*v[i]; return a;}); const m=Math.max(...s); const e=s.map(a=>Math.exp(a-m)); const Z=e.reduce((a,b)=>a+b,0);
   L-=Math.log(e[win]/Z); if(grad) for(let j=0;j<xs.length;j++){const g=e[j]/Z-(j===win?1:0); for(let i=0;i<D;i++) grad[i]+=g*xs[j][i];} } return L/data.length;}
function fit(mask,iters=300){ const w=new Array(D).fill(0), m=new Array(D).fill(0), v=new Array(D).fill(0);
  for(let t=1;t<=iters;t++){ const g=new Array(D).fill(0); loss(w,tr,g,mask); for(let i=0;i<D;i++){ if(mask&&!mask[i]) continue; const gi=g[i]/tr.length+1e-4*w[i]; m[i]=0.9*m[i]+0.1*gi; v[i]=0.999*v[i]+0.001*gi*gi; w[i]-=0.05*(m[i]/(1-0.9**t))/(Math.sqrt(v[i]/(1-0.999**t))+1e-8);} } return w;}
const ms=new Array(D).fill(0); ms[0]=1; ms[F]=1; const w0=fit(ms,150); console.log('stars only  train',loss(w0,tr,null,ms).toFixed(4),'val',loss(w0,va,null,ms).toFixed(4));
const w=fit(null,300); console.log('full        train',loss(w,tr).toFixed(4),'val',loss(w,va).toFixed(4));
FN.forEach((n,i)=>console.log(n.padEnd(10),w[i].toFixed(2).padStart(7),w[F+i].toFixed(2).padStart(7)));
fs.writeFileSync('vw.json',JSON.stringify(w.map(a=>+a.toFixed(3))));
// par phase
for(const [lo,hi] of [[0,0.2],[0.2,0.5],[0.5,0.8],[0.8,1.1]]){const d=va.filter(r=>r[2]>=lo&&r[2]<hi); console.log('phase',lo,hi,'n',d.length,'stars',loss(w0,d,null,ms).toFixed(3),'full',loss(w,d).toFixed(3));}
