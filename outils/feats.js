// caractéristiques d'un joueur pour la fonction de valeur
function feats(g,p){ const BG=window.BirdsGame; const C=id=>g.card(id); let birds=0,allies=0,relics=0,brood=0,cond=0,dsc=0;
  p.tableau.forEach(e=>{const c=C(e.id); if(c.type==='bird')birds++; else if(c.type==='ally')allies++; else relics++; const fx=window.CARD_FX[e.id]||{}; if(fx.b)brood++; if(fx.d)dsc++;
    if(window.COND_STARS[e.id]&&!e.starTaken){const gp=g.condGap(p,e.id); cond+=gp===null?0.3:Math.max(0,1-gp/4);} });
  let best=0,tot=0; BG.ISLANDS.forEach(isl=>{ if(g.settled[isl]!==undefined) return; const m=g.presence(isl,p.i); tot+=m; if(m>best)best=m; });
  const perso=p.pobj&&p.pClaims<2?Math.min(1,g.persoValue(p)/BG.PERSO_TH[p.pClaims]):0;
  const o=g.objs[0]; const red=(!o.claims.includes(p.i)&&o.th[o.claims.length]!==undefined)?Math.min(1,o.d.m(g,p)/o.th[o.claims.length]):0;
  const food=p.food.worm+p.food.seed+p.food.fruit;
  return [p.stars,Math.min(p.chicks,6)/3,Math.min(p.eggs,6)/3,p.nests/2,p.built.workshop.length/2,p.built.shrine.length/2,Math.min(p.hand.length,8)/4,Math.min(food,10)/5,
    birds/4,allies/2,relics/3,brood/2,p.seagulls.length/2,p.seagulls.reduce((a,b)=>a+b,0)/4,p.runes.length/2,(p.elders||0)/BG.ELDERS_LEN,perso,best/6,tot/8,cond,red,dsc/2];
}
const FN=['stars','chicks','eggs','nests','workshops','shrines','hand','food','birds','allies','relics','brood','gulls','gullLv','runes','elders','perso','presBest','presTot','cond','red','ds'];
module.exports={feats,FN};
