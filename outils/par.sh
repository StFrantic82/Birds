#!/bin/bash
# par.sh '<cfg>' [procs]  -> agrège
P=${2:-4}; for i in $(seq $P); do node bench.js "$1" & done | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const R=s.trim().split("\n").map(JSON.parse);const G=R.reduce((a,r)=>a+r.G,0),w=R.reduce((a,r)=>a+r.w,0);const m=k=>(R.reduce((a,r)=>a+r[k]*r.G,0)/G).toFixed(2);const p=w/G;console.log(`win ${(100*p).toFixed(1)}% ±${(196*Math.sqrt(p*(1-p)/G)).toFixed(1)} (G=${G}) rounds ${m("rounds")} starsA ${m("sa")} starsB ${m("sb")} err ${R.reduce((a,r)=>a+r.err,0)} sec ${Math.max(...R.map(r=>r.sec))}`)})'
