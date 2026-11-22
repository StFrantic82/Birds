// Birds — moteur de jeu (prototype v1)
(function(){
'use strict';
const ISLANDS=['meadow','jungle','desert','mountain','tundra','marsh'];
const ISL_FR={meadow:'Prairie',jungle:'Jungle',desert:'Désert',mountain:'Montagne',tundra:'Toundra',marsh:'Marais'};
const FAM={Academy:'blue',Legion:'red',Court:'yellow',Guild:'green',Circle:'purple'};
const FAMS=Object.keys(FAM);
const TREE_FOOD={grey:'worm',yellow:'seed',green:'fruit'};
const FOOD_FR={worm:'ver',seed:'graine',fruit:'fruit'};
const COLORS=['#ff1000','#00a1ff','#ffffff','#9300ff'];
const COLOR_NAMES=['Rouge','Bleu','Blanc','Violet'];
const NEUTRAL='#8a8a8a';
const BUILD={
  nest:[null,{chicks:3,food:{seed:1}},{chicks:3,food:{seed:2}},{chicks:3,food:{seed:3}}],
  shrine:[{chicks:2,food:{worm:2},cap:2},{chicks:3,food:{worm:2},cap:3},{chicks:4,food:{worm:2},cap:4},{chicks:5,food:{worm:2},cap:5}],
  workshop:[{chicks:3,food:{}},{chicks:3,food:{fruit:1}},{chicks:3,food:{fruit:2}},{chicks:3,food:{fruit:3}}]
};
const BUILD_FR={nest:'Nid',shrine:'Sanctuaire',workshop:'Atelier'};
const RUNES=['Tag supplémentaire au choix (coût : 1 graine ou 1 fruit)','La Nuée peut avancer d\'1 île de plus','Couvée : relancer l\'effet d\'un Atelier construit','Vos Nids ont +1 capacité','Vos Sanctuaires ont +1 capacité'];
// Chemin des Anciens : piste infinie de 12 cases (la case 12 = case de départ), bonus regagnés à chaque tour
const ELDERS_LEN=12;
const ELDERS_BONUS={3:'anyFood',5:'seagull',7:'rune',9:'chickOr2ds',0:'star'};
const ELDERS_FR={anyFood:'1 nourriture au choix',seagull:'gagner ou améliorer une Mouette',rune:'1 Rune',chickOr2ds:'1 Poussin ou jusqu\'à 2 Écailles',star:'1 Étoile'};
const BON_FR={rune:'Rune',reveal3:'révéler 3 cartes',reveal2:'révéler 2 cartes',seagull:'Mouette',worm:'1 ver',chick:'1 Poussin',dragonscale:'1 Écaille',elders:'Anciens +1',grow:'éclore 1 Œuf',draw:'piocher 1',seedOrFruit:'graine ou fruit',buildAny:'construire sur toute île',gatherAny:'récolter sur toute île',expandAny:'s\'étendre sur toute île',ruinChick:'Poussin sur Ruine',brood:'Couvée',play1:'jouer 1 carte',removeCheapest:'retirer un bâtiment'};
const RED_OBJ=[
  {id:'B01',name:'Tiny Flock',fr:'Cartes de coût 1-2',p2:[6,7],p34:[6,7,7,8],m:(g,p)=>g.sizeCount(p,1,2)},
  {id:'B02',name:'Average Flock',fr:'Cartes de coût 3',p2:[4,5],p34:[4,5,5,6],m:(g,p)=>g.sizeCount(p,3,3)},
  {id:'B03',name:'Sky Giants',fr:'Cartes de coût 4-5',p2:[4,5],p34:[4,5,5,6],m:(g,p)=>g.sizeCount(p,4,9)},
  {id:'B04',name:'Passionate Collectors',fr:'Reliques',p2:[4,5],p34:[4,5,5,6],m:(g,p)=>g.relicCount(p)},
  {id:'B05',name:'Brooding Skilled',fr:'Œufs dans vos Nids',p2:[5,6],p34:[5,6,7,7],m:(g,p)=>p.eggs},
  {id:'B06',name:'Feather Sellers',fr:'Cartes avec capacité Écaille',p2:[3,4],p34:[3,4,5,5],m:(g,p)=>p.tableau.filter(e=>g.card(e.id).dragonscale).length},
];
const BLUE_OBJ=[
  {id:'C01',name:'Keen Builders',fr:'Îles avec au moins 1 de vos bâtiments',p2:[3,4],p34:[3,3,3,3],m:(g,p)=>ISLANDS.filter(i=>g.islandNests(i).some(s=>{const b=g.nestOwner[s.id]; return b&&b.owner===p.i;})).length},
  {id:'C02',name:'Fruit Lovers',fr:'Poussins dans des régions à arbre vert',p2:[4,5],p34:[4,4,4,4],m:(g,p)=>g.chicksByTree(p,'green')},
  {id:'C03',name:'Seeds Lovers',fr:'Poussins dans des régions à arbre jaune',p2:[4,5],p34:[4,4,4,4],m:(g,p)=>g.chicksByTree(p,'yellow')},
  {id:'C04',name:'Worm Eaters',fr:'Poussins dans des régions à arbre gris',p2:[5,6],p34:[5,5,5,5],m:(g,p)=>g.chicksByTree(p,'grey')},
  {id:'C05',name:'Natural Explorers',fr:'Îles où vous avez au moins 2 Poussins',p2:[4,5],p34:[4,4,4,4],m:(g,p)=>ISLANDS.filter(i=>g.islandRegions(i).reduce((n,r)=>n+g.chicksIn(r.id,p.i),0)>=2).length},
  {id:'C06',name:'Experienced Watchers',fr:'Poussins dans des régions avec Ruine',p2:[5,6],p34:[5,5,5,5],m:(g,p)=>g.B.regions.filter(r=>r.ruins.length).reduce((n,r)=>n+g.chicksIn(r.id,p.i),0)},
];
const PERSONAL=[
  {id:'A01',name:'Robins',tags:['Academy','Legion'],res:{worm:1,seed:1,fruit:1},resNew:{chick:1,elders:1,worm:1,fruit:1}},
  {id:'A02',name:'Swans',tags:['Academy','Court'],res:{seagull:1,worm:3},resNew:{seagull:1,chick:-1,worm:1}},
  {id:'A03',name:'Storks',tags:['Academy','Guild'],res:{worm:2,seed:1},resNew:{chick:-1,seed:2,elders:1,worm:1,rune:1}},
  {id:'A04',name:'Ravens',tags:['Academy','Circle'],res:{elders:1,worm:1,fruit:1},resNew:{seed:1,worm:1,fruit:1,rune:1}},
  {id:'A05',name:'Eagles',tags:['Legion','Court'],res:{seagull:1,worm:1,fruit:1},resNew:{seagull:1,chick:-1,fruit:1,worm:1}},
  {id:'A06',name:'Kingfishers',tags:['Legion','Guild'],res:{elders:1,worm:1,seed:1},resNew:{elders:1,worm:2,seed:1,fruit:1}},
  {id:'A07',name:'Falcons',tags:['Legion','Circle'],res:{worm:1,seed:1,fruit:1},resNew:{chick:1,seed:1,worm:1,rune:1}},
  {id:'A08',name:'Woodpeckers',tags:['Court','Guild'],res:{elders:1,worm:3},resNew:{elders:2,worm:2,fruit:1}},
  {id:'A09',name:'Owls',tags:['Court','Circle'],res:{worm:2,fruit:1},resNew:{worm:2,seed:1,fruit:1}},
  {id:'A10',name:'Magpies',tags:['Guild','Circle'],res:{seagull:1,worm:1,seed:1},resNew:{chick:1,elders:1,worm:3}},
];
const PERSO_TH=[5,9];
function resLabel(r){return Object.entries(r).filter(([k,v])=>v).map(([k,v])=>k==='chick'?(v>0?'+':'')+v+' Poussin'+(Math.abs(v)>1?'s':''):v+' '+({worm:'ver',seed:'graine',fruit:'fruit',seagull:'Mouette',elders:'Anciens',rune:'Rune'})[k]+(v>1&&k!=='elders'?'s':'')).join(' + ');}
const NEST_CAP=2; // provisoire
const CHICKS_TOTAL=25;
const TREES_TOTAL={grey:14,yellow:8,green:8};

function rnd(n){return Math.floor(Math.random()*n);}
// Poids de l'IA : réglage d'origine, et réglage appris par auto-apprentissage (parties IA contre IA)
const AIW_CLASSIC={play:0,play2:0.7,fx:0,pres:1.5,colDone:11,gp:1.5,blue:1,red:1,gull:1.5,shr:2,gctx:1,brood:0,bmode:2,b3:1.5,amu:1,lvl:1,tempo:1};
const AIW_TRAINED={"play":0,"play2":0.7,"fx":-0.224,"pres":1.5,"colDone":11,"gp":0.935,"blue":2.145,"red":0.641,"gull":2.399,"shr":1.167,"gctx":1,"brood":-0.277,"bmode":2.047,"b3":1.5,"amu":0.464,"lvl":1,"tempo":1.211};
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=rnd(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function clone(o){return JSON.parse(JSON.stringify(o));}

class Game{
  constructor(opts,io){
    this.io=io; // {ask(p,q)->Promise, render(), log(msg), sleep(ms)}
    const n=opts.players.length;
    this.boardKey=n===2?'p2':'p34';
    this.B=window.BOARDS[this.boardKey];
    this.regions={}; this.B.regions.forEach(r=>this.regions[r.id]=r);
    this.nestById={}; this.B.nests.forEach(s=>{this.nestById[s.id]=s; s.island=this.regions[s.adj[0]].island;});
    this.cardById={}; window.BIRDS.forEach(c=>{c.type='bird'; c.tagMap={[c.family]:c.tags}; this.cardById[c.id]=c;}); window.ALLIES.forEach(c=>this.cardById[c.id]=c); window.RELICS.forEach(c=>this.cardById[c.id]=c);
    this.persoSet=opts.persoSet==='new'?'new':'classic';
    this.players=opts.players.map((o,i)=>({
      i,name:o.name,ai:!!o.ai,color:o.color||COLORS[i],colorName:COLOR_NAMES[Math.max(0,COLORS.indexOf(o.color||COLORS[i]))],
      food:{worm:0,seed:0,fruit:0},hand:[],pobj:null,pClaims:0,tableau:[],chicks:3,eggs:2,supply:CHICKS_TOTAL-3-2-1,
      nests:1,left:{nest:[1,2,3],shrine:[0,1,2,3],workshop:[0,1,2,3]},built:{nest:[],shrine:[],workshop:[]},
      elders:0,stars:0,starLog:[],seagulls:[],runes:[],flock:0,dsUsed:false
    }));
    this.trees={}; this.treeSupply=clone(TREES_TOTAL);
    this.slots={}; this.ruins={}; this.nestOwner={};
    this.B.regions.forEach(r=>{this.slots[r.id]=r.slots.map(()=>null); this.ruins[r.id]=r.ruins.map(()=>null);
      if(r.tree.start){this.trees[r.id]=r.tree.color; this.treeSupply[r.tree.color]--;}});
    this.deck=shuffle(Object.keys(this.cardById)); this.discardPile=[];
    this.row=[]; for(let k=0;k<6;k++) this.row.push(this.drawFromDeck());
    this.objs=[RED_OBJ[rnd(6)],BLUE_OBJ[rnd(6)]].map((d,k)=>({d,color:k?'blue':'red',th:n===2?d.p2:d.p34.slice(0,n),claims:[]})); this.redObj=this.objs[0].d; this.redThresholds=this.objs[0].th; this.redClaims=this.objs[0].claims;
    this.settled={}; this.current=0; this.round=1; this.endTriggered=false; this.over=false; this.logs=[];
    // îles de départ
    const starts=shuffle(['marsh','jungle','desert','tundra']); // 4 tuiles de départ : Marais (A), Jungle (C), Désert (D), Toundra (F)
    this.players.forEach((p,i)=>{p.flock=ISLANDS.indexOf(starts[i]); this.placeChickStart(p.i,starts[i]);});
    if(n===2){ this.placeChickStart('N','mountain'); this.placeChickStart('N','meadow'); } // 2 joueurs : Poussins neutres en Montagne et Prairie
    this.players.forEach(p=>{for(let k=0;k<5;k++) p.hand.push(this.drawFromDeck());});
    const pd=shuffle(PERSONAL.slice()); this.players.forEach(p=>{p.pOffer=[pd.pop(),pd.pop()];});
  }
  // ---------- utilitaires ----------
  log(m){this.logs.push(m); if(this.logs.length>200) this.logs.shift(); this.io.log&&this.io.log(m);}
  card(id){return this.cardById[id];}
  has(p,id){return p.tableau.some(e=>e.id===id);}
  wild(p){return this.rm(p,0)+p.seagulls.filter(l=>l>=3).length+p.tableau.filter(e=>this.card(e.id).wild).length;}
  diffTags(p){const t=this.tags(p); return Math.min(5,FAMS.filter(f=>t[f]>0).length+this.wild(p));}
  sameTag(p){const t=this.tags(p); return Math.max(...FAMS.map(f=>t[f]))+this.wild(p);}
  allyCount(p){return p.tableau.filter(e=>this.card(e.id).type==='ally').length+(this.has(p,'OG2')?1:0);}
  relicCount(p){return p.tableau.filter(e=>this.card(e.id).type==='relic').length;}
  dropSeagull(p){const k=p.seagulls.indexOf(Math.min(...p.seagulls)); if(k>=0) p.seagulls.splice(k,1);}
  relicSpace(p,c){return Math.max(1,c.cost-(this.has(p,'OY8')?1:0));}
  shrineFree(p){const cap=l=>[2,3,4,5][l]+this.rm(p,4); return p.built.shrine.map(l=>({l,free:cap(l)-p.tableau.filter(e=>e.shrine===l).reduce((s,e)=>s+this.relicSpace(p,this.card(e.id)),0)}));}
  allyOK(p,c){const miss=c.req.filter(r=>!r.f(this,p)).length; return miss<=(p.allyDiscount||0);}
  birdCost(p,c){let n=c.cost; const m1=x=>Math.max(1,x);
    if(c.family==='Academy'&&this.has(p,'OB4')) n=m1(n-2); if(c.family==='Legion'&&this.has(p,'OR4')) n=m1(n-2); if(c.family==='Circle'&&this.has(p,'OP1')) n=m1(n-1);
    if(c.cost>=4&&this.has(p,'OY5')) n=Math.max(0,n-1); return n;}
  async anyAction(p){const isl=ISLANDS[p.flock]; const acts=this.boardActionOptions(p,isl,null);
    const o=await this.ask(p,{title:'Action au choix',options:[...acts,{label:'Jouer 1 carte',value:'play',score:1.5},{label:'Couvée',value:'brood',score:2}]});
    if(o==='play') await this.playOne(p,{}); else if(o==='brood') await this.brood(p); else if(o) await this.applyBoardAction(p,o);}
  async antStar(p){const covered=new Set(); const pick=[]; const tagsOf=id=>Object.keys(this.card(id).tagMap||{});
    const can=()=>{const s=new Set(); p.hand.forEach(id=>tagsOf(id).forEach(t=>s.add(t))); return FAMS.every(f=>s.has(f));};
    if(!can()||!await this.ask(p,{title:'Ant : défausser des cartes couvrant les 5 tags pour 1 Étoile ?',options:[{label:'Oui',value:true,score:3},{label:'Non',value:false,score:0}]})) return;
    while(FAMS.some(f=>!covered.has(f))){const opts=p.hand.filter(id=>tagsOf(id).some(t=>!covered.has(t))); if(!opts.length) return;
      const id=await this.ask(p,{title:'Défaussez une carte apportant un tag manquant',options:opts.map(id=>({label:this.card(id).name,value:id,card:id,score:tagsOf(id).filter(t=>!covered.has(t)).length}))});
      p.hand.splice(p.hand.indexOf(id),1); this.discardPile.push(id); tagsOf(id).forEach(t=>covered.add(t));}
    await this.gainStar(p,'Ant');}
  sizeCount(p,a,b){return p.tableau.filter(e=>{const c=this.card(e.id).cost; return c>=a&&c<=b;}).length+p.seagulls.filter(l=>l>=a&&l<=b).length;}
  redNext(){return this.redThresholds[this.redClaims.length];}
  chicksIn(rid,o){return this.slots[rid].filter(x=>x===o).length+this.ruins[rid].filter(x=>x===o).length;}
  chicksByTree(p,c){return this.B.regions.filter(r=>this.trees[r.id]===c).reduce((n,r)=>n+this.chicksIn(r.id,p.i),0);}
  persoValue(p){if(!p.pobj) return 0; const t=this.tags(p); return t[p.pobj.tags[0]]+t[p.pobj.tags[1]]+this.wild(p);}
  async choosePersonal(p){const t={}; FAMS.forEach(f=>t[f]=0); p.hand.forEach(id=>{const c=this.card(id); for(const f in (c.tagMap||{})) t[f]+=c.tagMap[f];});
    const o=await this.ask(p,{personal:true,title:'Choisissez votre objectif personnel (l\'autre est défaussé)',options:p.pOffer.map(o=>({label:`${o.name} — total ${o.tags.join(' + ')} : 5 puis 9 (1 Étoile chacun) · départ : ${resLabel(this.pres(o))}`,value:o,score:t[o.tags[0]]+t[o.tags[1]]+Math.random()}))});
    p.pobj=o; this.log(`${p.name} choisit l'objectif personnel ${o.name} (${o.tags.join(' + ')}).`);
    await this.giveStart(p,this.pres(o));
    this.io.render();}
  // jeu d'objectifs personnels : 'classic' (règle d'origine) ou 'new' (ressources recommandées)
  pres(o){return this.persoSet==='new'&&o.resNew?o.resNew:o.res;}
  async giveStart(p,res){ for(const [k,v] of Object.entries(res)){ if(!v) continue; if(k==='seagull'){for(let i=0;i<v;i++){p.seagulls.push(1);} this.log(`${p.name} gagne une Mouette (niveau 1).`);} else if(k==='elders') await this.elders(p,v); else if(k==='rune'){ for(let i=0;i<v;i++) await this.rune1(p);} else if(k==='chick'){ const d=Math.max(-p.chicks,Math.min(v,p.supply)); p.chicks+=d; p.supply-=d; if(d>0) this.log(`${p.name} gagne ${d} Poussin${d>1?'s':''}.`);} else p.food[k]+=v; } }
  async checkObjectives(p){ while(p.pobj&&p.pClaims<PERSO_TH.length&&this.persoValue(p)>=PERSO_TH[p.pClaims]){p.pClaims++; await this.gainStar(p,`Objectif personnel ${p.pobj.name} (${PERSO_TH[p.pClaims-1]})`);}
    for(const o of this.objs){ const next=o.th[o.claims.length]; if(o.claims.includes(p.i)||next===undefined) continue;
    if(o.d.m(this,p)>=next){o.claims.push(p.i); await this.gainStar(p,`Objectif ${o.color==='red'?'rouge':'bleu'} ${o.d.name}`);}}}
  async checkCondStars(p){await this.checkObjectives(p); for(const e of p.tableau){const f=window.COND_STARS[e.id]; if(f&&!e.starTaken&&f(this,p)){e.starTaken=true; await this.gainStar(p,this.card(e.id).name);}}}
  async onPlayed(p,c){const tags=Object.keys(c.tagMap||{}).filter(t=>c.tagMap[t]>0);
    const hook=async(id,fam,title,fn,sc)=>{ if(this.has(p,id)&&(fam===null?(!tags.length&&!c.wild):tags.includes(fam))&&p.hand.length&&await this.discardCards(p,1,title,sc)) await fn();};
    await hook('OB3','Academy','Songbook : défausser 1 carte pour piocher 1 ?',()=>this.draw(p,1),0.4);
    await hook('OG1','Guild','Guild Contract : défausser 1 carte pour 1 Écaille ?',()=>{const e=p.tableau.find(x=>x.id==='OG1'); return this.placeDSthis(p,e,1);},0.6);
    await hook('OP3','Circle','Whispering Totem : défausser 1 carte pour un Poussin sur une Ruine ?',()=>this.ruinChick(p,1),1.2);
    await hook('OR5','Legion','War Drum : défausser 1 carte pour 1 Mouette ?',()=>this.seagull(p,1),0.8);
    await hook('OY2','Court','Royal Decree : défausser 1 carte pour jouer 1 carte ?',()=>this.playOne(p,{}),1);
    await hook('ON6',null,'Forager\'s Basket : défausser 1 carte pour 1 ver + 1 graine + 1 fruit ?',async()=>{p.food.worm++;p.food.seed++;p.food.fruit++; this.log(`${p.name} gagne 1 ver, 1 graine et 1 fruit.`);},2);}
  extras(p){const out=[];
    if(this.has(p,'ON3')&&!p.tableau.find(e=>e.id==='ON3').starTaken&&p.food.worm>=2&&p.food.seed>=2&&p.food.fruit>=2) out.push({label:'Provision Cache : payer 2/2/2 pour 1 Étoile',value:{x:'ON3'},card:'ON3',score:5});
    if(this.has(p,'OP8')) out.push({label:'Soul Reliquary : sacrifier pour 1 Étoile',value:{x:'OP8'},card:'OP8',score:5});
    if(this.has(p,'OP7')&&!p.tableau.find(e=>e.id==='OP7').starTaken&&FAMS.some(f=>p.hand.filter(id=>(this.card(id).tagMap||{})[f]).length>=4)) out.push({label:'Black Codex : défausser 4 cartes du même tag pour 1 Étoile',value:{x:'OP7'},card:'OP7',score:4});
    return out;}
  async doExtra(p,x){const e=p.tableau.find(e=>e.id===x);
    if(x==='ON3'){p.food.worm-=2;p.food.seed-=2;p.food.fruit-=2; e.starTaken=true; await this.gainStar(p,'Provision Cache');}
    else if(x==='OP8'){p.tableau.splice(p.tableau.indexOf(e),1); this.discardPile.push(x); this.log(`${p.name} sacrifie Soul Reliquary.`); await this.gainStar(p,'Soul Reliquary');}
    else if(x==='OP7'){const f=FAMS.find(f=>p.hand.filter(id=>(this.card(id).tagMap||{})[f]).length>=4); for(let i=0;i<4;i++){const opts=p.hand.filter(id=>(this.card(id).tagMap||{})[f]); const id=await this.ask(p,{title:`Défaussez une carte ${f} (${i+1}/4)`,options:opts.map(id=>({label:this.card(id).name,value:id,card:id,score:0}))}); p.hand.splice(p.hand.indexOf(id),1); this.discardPile.push(id);} e.starTaken=true; await this.gainStar(p,'Black Codex');}
    this.io.render();}
  drawFromDeck(){ if(!this.deck.length){ if(!this.discardPile.length) return null; this.deck=shuffle(this.discardPile); this.discardPile=[]; this.log('La défausse est remélangée dans la pioche.'); } return this.deck.pop(); }
  startRegion(isl){return this.B.regions.find(r=>r.island===isl&&r.tree.start);}
  placeChickStart(owner,isl){const r=this.startRegion(isl); const k=this.slots[r.id].indexOf(null); if(k>=0) this.slots[r.id][k]=owner;}
  islandRegions(isl){return this.B.regions.filter(r=>r.island===isl);}
  islandNests(isl){return this.B.nests.filter(s=>s.island===isl);}
  freeSlot(rid){return this.slots[rid].indexOf(null);}
  islandFull(isl){return this.islandRegions(isl).every(r=>this.freeSlot(r.id)<0) && this.islandNests(isl).every(s=>!this.nestOwner[s.id]);}
  presence(isl,owner){let n=0; const P=typeof owner==='number'?this.players[owner]:null; const cv=P&&this.has(P,'ON4')?2:1; const bv={nest:P&&this.has(P,'OB5')?3:2,workshop:P&&this.has(P,'OR3')?3:2,shrine:P&&this.has(P,'OY3')?3:2}; this.islandRegions(isl).forEach(r=>{this.slots[r.id].forEach(o=>{if(o===owner)n+=cv;}); this.ruins[r.id].forEach(o=>{if(o===owner)n+=cv;});});
    this.islandNests(isl).forEach(s=>{const b=this.nestOwner[s.id]; if(b&&b.owner===owner) n+=bv[b.type];}); return n;}
  regionHasTree(rid){return !!this.trees[rid];}
  treesOnIsland(isl){return this.islandRegions(isl).filter(r=>this.trees[r.id]);}
  chicksAdjacentNest(sid){const out=[]; this.nestById[sid].adj.forEach(rid=>{this.slots[rid].forEach(o=>{if(o!==null)out.push(o);}); this.ruins[rid].forEach(o=>{if(o!==null)out.push(o);});}); return out;}
  tags(p){const t={}; FAMS.forEach(f=>t[f]=0); p.tableau.forEach(e=>{const c=this.card(e.id); for(const f in (c.tagMap||{})) t[f]+=c.tagMap[f];}); return t;}
  hasEachTag(p){const t=this.tags(p); let missing=FAMS.filter(f=>t[f]<1).length; return missing<=this.wild(p);}
  birds4(p){return p.tableau.filter(e=>this.card(e.id).type==='bird'&&this.card(e.id).cost>=4).length+p.seagulls.filter(l=>l>=4).length;}
  birds3(p){return p.tableau.filter(e=>this.card(e.id).type==='bird'&&this.card(e.id).cost<=3).length+p.seagulls.filter(l=>l<=3).length;}
  nestCap(p){return p.nests*(NEST_CAP+this.rm(p,3));}
  builtCount(p,type){return p.built[type].length+(type==='nest'?1:0);}
  canHoldDS(e){const c=this.card(e.id); return !!c.dragonscale;}
  foodTotal(p){return p.food.worm+p.food.seed+p.food.fruit;}
  // ---------- gains élémentaires ----------
  async layEgg(p,n=1){let k=0; for(let i=0;i<n;i++){ if(p.supply<=0||p.eggs>=this.nestCap(p)) break; p.supply--; p.eggs++; k++;} if(k){this.log(`${p.name} pond ${k} Œuf${k>1?'s':''}.`); await this.checkObjectives(p);} else if(n>0) this.log(`${p.name} ne peut pas pondre (Nids pleins ou réserve vide).`);}
  async gainChick(p,n=1){let k=Math.min(n,p.supply); p.supply-=k; p.chicks+=k; if(k) this.log(`${p.name} gagne ${k} Poussin${k>1?'s':''}.`);}
  async growEgg(p,n=1){let k=Math.min(n,p.eggs); p.eggs-=k; p.chicks+=k; if(k) this.log(`${p.name} fait éclore ${k} Œuf${k>1?'s':''}.`);}
  async gainFood(p,type,n=1){if(n<=0)return; p.food[type]+=n; this.log(`${p.name} gagne ${n} ${FOOD_FR[type]}${n>1&&type!=='fruit'?'s':''}${n>1&&type==='fruit'?'s':''}.`);}
  async gainAnyFood(p,n=1,types=['worm','seed','fruit']){for(let i=0;i<n;i++){const t=await this.ask(p,{title:'Choisissez une nourriture',options:types.map(x=>({label:'+1 '+FOOD_FR[x],value:x,score:x==='worm'?1.2:1}))}); await this.gainFood(p,t,1);}}
  async draw(p,n=1){let k=0; for(let i=0;i<n;i++){const c=this.drawFromDeck(); if(c){p.hand.push(c);k++;}} if(k) this.log(`${p.name} pioche ${k} carte${k>1?'s':''}.`);}
  async search(p,x){x+=this.has(p,'OB8')?2:0; const rev=[]; for(let i=0;i<x;i++){const c=this.drawFromDeck(); if(c) rev.push(c);} if(!rev.length) return;
    const pick=await this.ask(p,{title:`Révélez ${x} cartes : gardez-en 1`,cards:true,options:rev.map(id=>({label:this.card(id).name,value:id,card:id,score:this.cardValue(p,id)}))});
    p.hand.push(pick); rev.filter(c=>c!==pick).forEach(c=>this.discardPile.push(c)); this.log(`${p.name} révèle ${rev.length} cartes et en garde 1.`);}
  async seagull(p,n=1){for(let i=0;i<n;i++){ const up=p.seagulls.map((l,k)=>({l,k})).filter(x=>x.l<4);
      const opts=[{label:'Gagner une Mouette (niveau 1)',value:-1,score:1.3+this.gullGainBonus(p)}];
      up.forEach(x=>opts.push({label:`Améliorer une Mouette : niveau ${x.l} → ${x.l+1}`,value:x.k,score:[0,1.1,1.2,1.6][x.l]+(this.goal(p,'OR7')?0.8:0)+this.W(p).gull}));
      const k=opts.length>1?await this.ask(p,{title:'Mouette',options:opts}):-1;
      if(k===-1){p.seagulls.push(1); this.log(`${p.name} gagne une Mouette (niveau 1).`);}
      else {p.seagulls[k]++; this.log(`${p.name} améliore une Mouette au niveau ${p.seagulls[k]}.`); if(p.seagulls[k]===4) await this.removeCheapest(p,null);} }}
  async rune(p){await this.rune1(p);}
  rm(p,k){return p.runes.includes(k)?(this.has(p,'OP2')?2:1):0;}
  async rune1(p){const free=[0,1,2,3,4].filter(k=>!p.runes.includes(k)&&(k!==0||p.food.seed+p.food.fruit>0)); if(!free.length){this.log(`${p.name} n'a plus de place pour une Rune.`);return;}
    const k=await this.ask(p,{title:'Placez votre Rune',options:free.map(k=>({label:RUNES[k],value:k,score:this.amuletScore(p,k)}))});
    if(k===0){const t=p.food.seed>0&&p.food.fruit>0?await this.ask(p,{title:'Payer la Rune',options:[{label:'1 graine',value:'seed',score:1},{label:'1 fruit',value:'fruit',score:1}]}):(p.food.seed>0?'seed':'fruit'); p.food[t]--;}
    p.runes.push(k); this.log(`${p.name} gagne une Rune : ${RUNES[k]}.`);}
  async gainStar(p,why){p.stars++; p.starLog.push(why); (p.starRounds=p.starRounds||[]).push({why,round:this.round}); this.log(`★ ${p.name} gagne une Étoile (${why}) — ${p.stars}/6.`); if(p.stars>=6&&!this.endTriggered){this.endTriggered=true; this.log(`${p.name} atteint 6 Étoiles : la fin de partie est déclenchée, on termine le tour.`);}
    if(this.has(p,'OB2')) await this.layEgg(p,1); if(this.has(p,'OG4')) await this.placeDSany(p,1); if(this.has(p,'ON5')) await this.draw(p,2);
    if(this.has(p,'OP4')) await this.gainAnyFood(p,1); if(this.has(p,'OR2')) await this.gainChick(p,1); if(this.has(p,'OY1')) await this.elders(p,1);}
  async elders(p,n=1){for(let i=0;i<n;i++){p.elders=(p.elders+1)%ELDERS_LEN; p.eldersTotal=(p.eldersTotal||0)+1; const b=ELDERS_BONUS[p.elders];
      if(b){this.log(`${p.name} atteint un bonus du Chemin des Anciens : ${ELDERS_FR[b]}.`);
        if(b==='anyFood') await this.gainAnyFood(p,1); else if(b==='seagull') await this.seagull(p,1); else if(b==='rune') await this.rune(p); else if(b==='star') await this.gainStar(p,'Chemin des Anciens');
        else if(b==='chickOr2ds'){const c=await this.ask(p,{title:'Bonus des Anciens',options:[{label:'Gagner 1 Poussin',value:'c',score:1.5},{label:'Placer 2 Écailles',value:'d',score:this.dsTargets(p).length?1.2:0}]}); if(c==='c') await this.gainChick(p,1); else await this.placeDSany(p,2);} } }
    if(n>0) this.log(`${p.name} avance de ${n} sur le Chemin des Anciens.`);}
  dsTargets(p){return p.tableau.filter(e=>this.canHoldDS(e));}
  async placeDSthis(p,e,n){if(n<=0)return; e.ds+=n; this.log(`${p.name} place ${n} Écaille${n>1?'s':''} sur ${this.card(e.id).name}.`);}
  async placeDSany(p,n=1){for(let i=0;i<n;i++){const t=this.dsTargets(p); if(!t.length){this.log('Aucune carte ne peut recevoir d\'Écaille.');return;}
      const e=await this.ask(p,{title:'Placer 1 Écaille sur…',options:t.map(e=>({label:this.card(e.id).name+` (${e.ds})`,value:e,card:e.id,score:1}))}); e.ds++; this.log(`${p.name} place 1 Écaille sur ${this.card(e.id).name}.`);}}
  async moveDS(p,n=2){for(let i=0;i<n;i++){const src=p.tableau.filter(e=>e.ds>0), dst=this.dsTargets(p); if(!src.length||dst.length<2) return;
      const s=await this.ask(p,{title:`Déplacer une Écaille (${i+1}/${n}) depuis…`,options:[{label:'Arrêter',value:null,score:0.5},...src.map(e=>({label:this.card(e.id).name+` (${e.ds})`,value:e,card:e.id,score:0}))]}); if(!s) return;
      const d=await this.ask(p,{title:'…vers',options:dst.filter(e=>e!==s).map(e=>({label:this.card(e.id).name+` (${e.ds})`,value:e,card:e.id,score:1}))}); s.ds--; d.ds++;}}
  async discardCards(p,n,title,optional){ if(p.hand.length<n) return false;
    if(optional){const ok=await this.ask(p,{title:title||`Défausser ${n} carte(s) ?`,options:[{label:'Oui',value:true,score:optional===true?0.5:optional},{label:'Non',value:false,score:0.6}]}); if(!ok) return false;}
    for(let i=0;i<n;i++){const c=await this.ask(p,{title:`Défaussez une carte (${i+1}/${n})`,options:p.hand.map(id=>({label:this.card(id).name,value:id,card:id,score:-this.cardValue(p,id)}))}); p.hand.splice(p.hand.indexOf(c),1); this.discardPile.push(c);}
    this.log(`${p.name} défausse ${n} carte${n>1?'s':''}.`); return true;}
  async sacrifice(p,title,value){const opts=p.tableau.filter(e=>!e.justPlayed).map(e=>({label:this.card(e.id).name,value:{e},card:e.id,score:-this.keepValue(p,{e})}));
    p.seagulls.forEach((l,k)=>opts.push({label:`Mouette (niveau ${l})`,value:{gull:k},score:-this.keepValue(p,{gull:k})}));
    if(!opts.length) return false;
    const ok=await this.ask(p,{title:title||'Sacrifier une de vos cartes en jeu ?',options:[{label:'Oui',value:true,score:value||0},{label:'Non',value:false,score:0.5}]}); if(!ok) return false;
    const v=await this.ask(p,{title:'Que sacrifiez-vous ?',options:opts});
    if(v.e){p.tableau.splice(p.tableau.indexOf(v.e),1); this.discardPile.push(v.e.id); this.log(`${p.name} sacrifie ${this.card(v.e.id).name}.`); const fx=window.CARD_FX[v.e.id]; if(this.has(p,'OP5')&&fx&&fx.i&&v.e.id!=='OP5'){this.log('Sacrificial Dagger : son effet ⚡ est résolu.'); await fx.i(this,p,{id:v.e.id,ds:0});}} else {p.seagulls.splice(v.gull,1); this.log(`${p.name} sacrifie une Mouette.`);}
    return true;}
  async exchangeFood(p,n=1){for(let i=0;i<n;i++){const have=['worm','seed','fruit'].filter(t=>p.food[t]>0); if(!have.length) return;
      const g=await this.ask(p,{title:'Échanger : donner…',options:[{label:'Ne pas échanger',value:null,score:0.3},...have.map(t=>({label:'1 '+FOOD_FR[t],value:t,score:t==='worm'?0:0.4}))]}); if(!g) return;
      const t=await this.ask(p,{title:'…contre',options:['worm','seed','fruit'].filter(x=>x!==g).map(x=>({label:'1 '+FOOD_FR[x],value:x,score:x==='fruit'?1:0.9}))}); p.food[g]--; p.food[t]++; this.log(`${p.name} échange 1 ${FOOD_FR[g]} contre 1 ${FOOD_FR[t]}.`);}}
  // ---------- Présence & Colonies ----------
  async checkSettlements(){for(const q of this.players) await this.checkObjectives(q); for(const isl of ISLANDS){ if(this.settled[isl]!==undefined) continue;
      const order=[]; for(let k=0;k<this.players.length;k++) order.push((this.current+k)%this.players.length);
      const winner=order.find(i=>this.presence(isl,i)>=(this.has(this.players[i],'ON4')?7:6)); if(winner===undefined) continue;
      const p=this.players[winner]; this.settled[isl]=winner; this.log(`${p.name} établit une Colonie en ${ISL_FR[isl]} !`); await this.gainStar(p,'Colonie '+ISL_FR[isl]);
      const others=this.players.filter(q=>q!==p).map(q=>({q,v:this.presence(isl,q.i)})).filter(o=>o.v>0); if(!others.length) continue;
      const best=Math.max(...others.map(o=>o.v)); const tied=others.filter(o=>o.v===best);
      for(const o of tied) await this.draw(o.q,tied.length>1?1:2);
    }}
  // ---------- Actions de plateau ----------
  expandTargets(isl){return this.islandRegions(isl).filter(r=>!this.trees[r.id]&&this.freeSlot(r.id)>=0&&this.treeSupply[r.tree.color]>0&&r.adj.some(a=>this.trees[a]));}
  gatherTargets(isl){return this.islandRegions(isl).filter(r=>this.trees[r.id]&&this.freeSlot(r.id)>=0);}
  buildTargets(isl){return this.islandNests(isl).filter(s=>!this.nestOwner[s.id]&&s.adj.some(a=>this.trees[a]));}
  buildOptions(p,sid,free){const out=[]; const adj=this.chicksAdjacentNest(sid).length;
    for(const type of ['nest','shrine','workshop']){ if(!p.left[type].length) continue;
      const lvls=free?[p.left[type][0]]:p.left[type]; // construction gratuite = le moins cher ; sinon n'importe lequel
      for(const lvl of lvls){ const c=BUILD[type][lvl];
        const chicks=free?0:Math.max(1,c.chicks-adj); const food=free?{}:c.food; const ok=p.chicks>=chicks&&Object.keys(food).every(t=>p.food[t]>=food[t]);
        out.push({type,lvl,chicks,food,ok});}}
    return out;}
  async doExpand(p,r){const k=this.freeSlot(r.id); this.slots[r.id][k]=p.i; p.chicks--; this.trees[r.id]=r.tree.color; this.treeSupply[r.tree.color]--;
    this.log(`${p.name} s'étend en ${ISL_FR[r.island]} et plante un arbre ${({grey:'gris',yellow:'jaune',green:'vert'})[r.tree.color]}.`);
    this.io.render(); await this.treeBonus(p,r.tree.bonus); if(this.has(p,'OG5')) await this.treeBonus(p,r.tree.bonus); await this.checkSettlements();}
  async doGather(p,r){const k=this.freeSlot(r.id); this.slots[r.id][k]=p.i; p.chicks--; const f=TREE_FOOD[this.trees[r.id]];
    const gain={worm:0,seed:0,fruit:0}; gain[f]+=2; this.treesOnIsland(r.island).forEach(o=>{if(o.id!==r.id) gain[TREE_FOOD[this.trees[o.id]]]++;});
    this.log(`${p.name} récolte en ${ISL_FR[r.island]} : ${Object.entries(gain).filter(x=>x[1]).map(([t,n])=>n+' '+FOOD_FR[t]).join(', ')}.`);
    for(const t in gain) p.food[t]+=gain[t]; this.io.render(); await this.checkSettlements();}
  async doBuild(p,sid,type,free,lvl){const opt=this.buildOptions(p,sid,free).find(o=>o.type===type&&(lvl===undefined||o.lvl===lvl)); if(!opt||!opt.ok) return false;
    p.chicks-=opt.chicks; p.supply+=opt.chicks; for(const t in opt.food) p.food[t]-=opt.food[t];
    p.left[type].splice(p.left[type].indexOf(opt.lvl),1); p.built[type].push(opt.lvl); this.nestOwner[sid]={owner:p.i,type,lvl:opt.lvl}; if(type==='nest') p.nests++;
    const s=this.nestById[sid]; this.log(`${p.name} construit ${type==='nest'?'un':'un'} ${BUILD_FR[type]} en ${ISL_FR[s.island]}${free?' (gratuitement)':''}.`);
    this.io.render(); await this.buildingImmediate(p,type,opt.lvl); if(type==='workshop'&&this.has(p,'OR1')) await this.workshopEffect(p,opt.lvl);
    // bonus passifs des adversaires
    const adj=this.chicksAdjacentNest(sid); const counts={}; adj.forEach(o=>{if(o!==p.i&&o!=='N') counts[o]=(counts[o]||0)+1;});
    for(let k=1;k<=this.players.length;k++){const i=(p.i+k)%this.players.length; let n=counts[i]; if(!n) continue; if(this.has(this.players[i],'ON1')) n*=2; const q=this.players[i];
      if(type==='nest') await this.draw(q,n); else if(type==='shrine') await this.elders(q,n); else await this.gainFood(q,'worm',n);}
    await this.checkSettlements(); return true;}
  async buildingImmediate(p,type,lvl){ if(type==='nest'){ if(lvl===1) await this.layEgg(p,1); else if(lvl===2) await this.rune(p); else if(lvl===3) await this.removeCheapest(p,null);} }
  async removeCheapest(p,type){let types=type?[type]:['nest','shrine','workshop']; types=types.filter(t=>p.left[t].length); if(!types.length) return;
    let t=types[0]; if(types.length>1) t=await this.ask(p,{title:'Retirer de votre plateau le bâtiment le moins cher de quel type ?',options:types.map(x=>({label:`${BUILD_FR[x]} ${p.left[x][0]+(x==='nest'?0:1)}`,value:x,score:x==='workshop'?2:x==='nest'?1.5:0.5}))});
    const lvl=p.left[t].shift(); p.built[t].push(lvl); if(t==='nest') p.nests++; this.log(`${p.name} retire ${BUILD_FR[t]} de son plateau (compte comme construit).`); await this.buildingImmediate(p,t,lvl);}
  async workshopEffect(p,lvl){ if(lvl===0) await this.draw(p,1); else if(lvl===1) await this.placeDSany(p,1); else if(lvl===2) await this.elders(p,1); else if(lvl===3) await this.ruinChick(p,1);}
  async triggerWorkshop(p){for(let t=0;t<(this.has(p,'OR8')?2:1);t++) await this.triggerWorkshop1(p);}
  async triggerWorkshop1(p){const w=p.built.workshop; if(!w.length){this.log('Aucun Atelier construit.');return;}
    const lvl=w.length===1?w[0]:await this.ask(p,{title:'Déclencher quel Atelier ?',options:w.map(l=>({label:'Atelier '+(l+1)+' : '+['piocher 1 carte','placer 1 Écaille','avancer d\'1 case sur le Chemin des Anciens','poussin sur une Ruine'][l],value:l,score:l}))});
    await this.workshopEffect(p,lvl);}
  ruinTargets(){const out=[]; this.B.regions.forEach(r=>{ if(!this.trees[r.id]) return; this.ruins[r.id].forEach((o,k)=>{if(o===null) out.push({r,k});});}); return out;}
  async ruinChick(p,n=1){for(let i=0;i<n;i++){ if(p.supply<=0) return; const t=this.ruinTargets(); if(!t.length){this.log('Aucune Ruine disponible.');return;}
      const c=await this.ask(p,{title:'Placez un Poussin de votre réserve sur une Ruine',options:t.map(x=>({label:`Ruine — ${ISL_FR[x.r.island]}`,value:x,target:{kind:'ruin',rid:x.r.id,k:x.k},score:this.presenceScore(p,x.r.island,1)}))});
      this.ruins[c.r.id][c.k]=p.i; p.supply--; this.log(`${p.name} place un Poussin sur une Ruine en ${ISL_FR[c.r.island]}.`); this.io.render(); await this.checkSettlements();}}
  async actionAnyIsland(p,kind){ if(p.chicks<1&&kind!=='build'){this.log(`${p.name} n'a pas de Poussin disponible.`);return;}
    const opts=[]; ISLANDS.forEach(isl=>{ this.boardActionOptions(p,isl,kind).forEach(o=>opts.push(o)); });
    if(!opts.length){this.log('Aucune cible possible.');return;}
    const o=await this.ask(p,{title:({expand:'S\'étendre',gather:'Récolter',build:'Construire'})[kind]+' sur n\'importe quelle île',options:[...opts,{label:'Passer',value:null,score:-1}]});
    if(o) await this.applyBoardAction(p,o,false);}
  async buildFreeHere(p,type){const isl=ISLANDS[p.flock]; const t=this.buildTargets(isl);
    if(!t.length||!p.left[type].length){this.log('Construction gratuite impossible ici.');return;}
    const s=await this.ask(p,{title:`Où construire ${BUILD_FR[type]} (gratuit) ?`,options:t.map(s=>({label:'Emplacement',value:s,target:{kind:'nest',sid:s.id},score:this.presenceScore(p,isl,2)}))});
    await this.doBuild(p,s.id,type,true);}
  async moveFlockAny(p){const opts=ISLANDS.map((isl,k)=>({label:ISL_FR[isl],value:k,target:{kind:'flock',k},score:this.islandScore(p,isl)})).filter(o=>!this.islandFull(ISLANDS[o.value]));
    const k=await this.ask(p,{title:'Déplacez votre Nuée sur n\'importe quelle île',options:opts}); p.flock=k; this.log(`${p.name} déplace sa Nuée en ${ISL_FR[ISLANDS[k]]}.`);}
  boardActionOptions(p,isl,kind){const out=[];
    if((kind==='expand'||!kind)&&p.chicks>0) this.expandTargets(isl).forEach(r=>out.push({label:`S'étendre — ${ISL_FR[isl]} (arbre ${({grey:'gris',yellow:'jaune',green:'vert'})[r.tree.color]}, bonus : ${r.tree.bonus.map(b=>BON_FR[b]).join(' + ')})`,value:{kind:'expand',r},target:{kind:'region',rid:r.id},score:this.expandScore(p,r)}));
    if((kind==='gather'||!kind)&&p.chicks>0) this.gatherTargets(isl).forEach(r=>out.push({label:`Récolter — ${ISL_FR[isl]} (${this.gatherPreview(r)})`,value:{kind:'gather',r},target:{kind:'region',rid:r.id},score:this.gatherScore(p,r)}));
    if(kind==='build'||!kind) this.buildTargets(isl).forEach(s=>this.buildOptions(p,s.id,false).filter(b=>b.ok).forEach(b=>out.push({label:`Construire ${BUILD_FR[b.type]} ${b.type==='nest'?b.lvl:b.lvl+1} — ${ISL_FR[isl]}, emplacement ${this.islandNests(isl).indexOf(s)+1} (${b.chicks} poussin${b.chicks>1?'s':''}${Object.entries(b.food).map(([k,v])=>' + '+v+' '+FOOD_FR[k]).join('')})`,value:{kind:'build',s,type:b.type,lvl:b.lvl},target:{kind:'nest',sid:s.id},score:this.buildScore(p,s,b)})));
    return out;}
  gatherPreview(r){const gain={worm:0,seed:0,fruit:0}; gain[TREE_FOOD[this.trees[r.id]]]+=2; this.treesOnIsland(r.island).forEach(o=>{if(o.id!==r.id) gain[TREE_FOOD[this.trees[o.id]]]++;}); return Object.entries(gain).filter(x=>x[1]).map(([t,n])=>'+'+n+' '+FOOD_FR[t]).join(', ');}
  async applyBoardAction(p,o){ if(o.kind==='expand') await this.doExpand(p,o.r); else if(o.kind==='gather') await this.doGather(p,o.r); else if(o.kind==='build') await this.doBuild(p,o.s.id,o.type,false,o.lvl);}
  async treeBonus(p,list){for(const b of list){ switch(b){
      case 'rune': await this.rune(p); break; case 'reveal3': await this.search(p,3); break; case 'reveal2': await this.search(p,2); break;
      case 'seagull': await this.seagull(p,1); break; case 'worm': await this.gainFood(p,'worm',1); break; case 'chick': await this.gainChick(p,1); break;
      case 'dragonscale': await this.placeDSany(p,1); break; case 'elders': await this.elders(p,1); break; case 'grow': await this.growEgg(p,1); break;
      case 'draw': await this.draw(p,1); break; case 'seedOrFruit': await this.gainAnyFood(p,1,['seed','fruit']); break;
      case 'buildAny': await this.actionAnyIsland(p,'build'); break; case 'gatherAny': await this.actionAnyIsland(p,'gather'); break; case 'expandAny': await this.actionAnyIsland(p,'expand'); break;
      case 'ruinChick': await this.ruinChick(p,1); break; case 'brood': await this.brood(p); break; case 'play1': await this.playOne(p,{}); break;
      case 'removeCheapest': await this.removeCheapest(p,null); break; } this.io.render(); }}
  // ---------- Paiement ----------
  payments(p,id,maxOpts=12){const c=this.card(id);
    if(c.type==='ally') return this.allyOK(p,c)?[{worm:0,seed:0,fruit:0,cards:0,cost:0}]:[];
    if(c.type==='relic'){return this.shrineFree(p).filter(s=>s.free>=this.relicSpace(p,c)).length?[{worm:0,seed:0,fruit:0,cards:0,cost:0}]:[];}
    let res=this.paymentsN(p,c,this.birdCost(p,c),0);
    if(this.has(p,'ON7')&&p.hand.length>1){const n2=Math.max(0,this.birdCost(p,c)-2); res=res.concat(this.paymentsN(p,c,n2,1));}
    if(this.has(p,'OG3')) for(const t of ['seed','fruit']){ if(p.food[t]<1) continue; p.food[t]--; try{ this.paymentsN(p,c,Math.max(0,this.birdCost(p,c)-2),0).forEach(o=>{o.crate=t; o.cost+=1.1; res.push(o);}); } finally { p.food[t]++; } }
    res.sort((a,b)=>a.cost-b.cost); return res.slice(0,maxOpts);}
  paymentsN(p,c,n,extra){const f=p.food, out=[];
    const push=(w,s,fr,cards)=>out.push({worm:w,seed:s,fruit:fr,cards:cards||0});
    if(n===0){push(0,0,0,0);} else if(c.color==='blue'){for(let w=0;w<=Math.min(n,f.worm);w++)for(let s=0;s<=Math.min(n-w,f.seed);s++){const fr=n-w-s; if(fr<=f.fruit) push(w,s,fr);}}
    else if(c.color==='red'){ if(f.worm>=n) push(n,0,0);}
    else if(c.color==='green'||c.color==='yellow'){const two=c.color==='green'?'fruit':'seed'; for(let k=0;k<=Math.min(f[two],Math.ceil(n/2));k++){const w=Math.max(0,n-2*k); if(w<=f.worm&&!(w>0&&2*k>n)&&!(k>0&&2*(k-1)+w>=n)) {const o={worm:w,seed:0,fruit:0,cards:0}; o[two]=k; out.push(o);}}}
    else if(c.color==='purple'){const others=p.hand.length-1; for(let w=0;w<=Math.min(n,f.worm);w++){const k=n-w; if(k<=others) push(w,0,0,k);}}
    if(n===0&&!out.length) push(0,0,0,0); out.forEach(o=>{o.cards+=extra; o.extra=extra; o.cost=o.worm*1+o.seed*1.1+o.fruit*1.2+o.cards*1.1;}); return out.filter(o=>o.cards<=p.hand.length-1);}
  payLabel(o){const parts=[]; if(o.crate) parts.push(`Supply Crate (1 ${FOOD_FR[o.crate]})`); if(o.worm)parts.push(o.worm+' ver'+(o.worm>1?'s':'')); if(o.seed)parts.push(o.seed+' graine'+(o.seed>1?'s':'')); if(o.fruit)parts.push(o.fruit+' fruit'+(o.fruit>1?'s':'')); if(o.cards)parts.push(o.cards+' carte'+(o.cards>1?'s':'')+' défaussée'+(o.cards>1?'s':'')); return parts.join(' + ')||'gratuit';}
  // ---------- Jouer des cartes ----------
  playable(p,filter){return p.hand.filter(id=>(!filter||filter(this.card(id))));}
  async playOne(p,{free,filter,title}){const cands=this.playable(p,filter).filter(id=>free||this.payments(p,id,1).length);
    if(!cands.length){this.log(`${p.name} n'a aucune carte jouable.`);return false;}
    const id=await this.ask(p,{title:title||'Jouer une carte',cards:true,options:[...cands.map(id=>({label:this.card(id).name,value:id,card:id,score:this.playScore(p,id,free)})),{label:'Ne rien jouer',value:null,score:0}]});
    if(!id) return false; await this.playCard(p,id,free); return true;}
  async playCard(p,id,free){const c=this.card(id);
    if(!free){const pays=this.payments(p,id); if(!pays.length) return false;
      const pay=pays.length===1?pays[0]:await this.ask(p,{title:`Payer ${c.name} (coût ${c.type==='bird'?this.birdCost(p,c):c.cost})`,options:pays.map(o=>({label:this.payLabel(o),value:o,score:-o.cost}))});
      p.hand.splice(p.hand.indexOf(id),1); p.food.worm-=pay.worm; p.food.seed-=pay.seed; p.food.fruit-=pay.fruit;
      for(let i=0;i<pay.cards;i++){const d=await this.ask(p,{title:`Défaussez une carte pour payer (${i+1}/${pay.cards})`,options:p.hand.map(h=>({label:this.card(h).name,value:h,card:h,score:-this.cardValue(p,h)}))}); p.hand.splice(p.hand.indexOf(d),1); this.discardPile.push(d);}
      if(pay.crate){p.food[pay.crate]--;} if(c.type==='ally'&&!c.req.every(r=>r.f(this,p))) p.allyDiscount=Math.max(0,(p.allyDiscount||0)-1); this.log(`${p.name} joue ${c.name}${c.type==='bird'?` (${this.payLabel(pay)})`:''}.`);
    } else { p.hand.splice(p.hand.indexOf(id),1); this.log(`${p.name} joue ${c.name} gratuitement.`);}
    const e={id,ds:0,justPlayed:true}; (p.played=p.played||[]).push({id,round:this.round,free:!!free});
    if(c.type==='relic'){const sh=this.shrineFree(p).filter(s=>s.free>=this.relicSpace(p,c)); const l=sh.length===1?sh[0].l:await this.ask(p,{title:`Dans quel Sanctuaire ranger ${c.name} ?`,options:sh.map(s=>({label:`Sanctuaire ${s.l+1} (${s.free} place${s.free>1?'s':''} libre${s.free>1?'s':''})`,value:s.l,score:-s.free}))}); e.shrine=l;}
    p.tableau.push(e); this.io.render();
    const fx=window.CARD_FX[id]; if(fx&&fx.i) await fx.i(this,p,e); delete e.justPlayed; this.io.render(); await this.onPlayed(p,c); await this.checkCondStars(p); return true;}
  // ---------- Couvée ----------
  async brood(p){this.log(`${p.name} fait une Couvée.`); await this.growEgg(p,p.eggs);
    await this.layEgg(p,p.nests);
    if(p.hand.length){const ok=await this.discardCards(p,1,'Atelier : défausser 1 carte pour avancer d\'1 case sur le Chemin des Anciens (et déclencher vos Ateliers) ?',1.2);
      if(ok){ await this.elders(p,1); for(const l of p.built.workshop.slice()) await this.workshopEffect(p,l); for(let t=0;t<this.rm(p,2)&&p.built.workshop.length;t++) await this.triggerWorkshop(p);} }
    for(const l of p.seagulls.slice()){ this.log(`Couvée — Mouette niveau ${l}`); await this.layEgg(p,1); if(l>=2) await this.elders(p,1);}
    for(const e of p.tableau.slice()){const fx=window.CARD_FX[e.id]; if(fx&&fx.b&&p.tableau.includes(e)){ this.log(`Couvée — ${this.card(e.id).name}`); await fx.b(this,p,e); this.io.render();}}
    const lim=6+(this.has(p,'OB1')?1:0); while(p.hand.length>lim){const c=await this.ask(p,{title:`Limite de main : défaussez jusqu'à ${lim} cartes`,options:p.hand.map(id=>({label:this.card(id).name,value:id,card:id,score:-this.cardValue(p,id)}))}); p.hand.splice(p.hand.indexOf(c),1); this.discardPile.push(c);}
  }
  // ---------- Capacité Écaille ----------
  dsReady(p){ if((p.dsUsed||0)>=1+(this.has(p,'OG8')?1:0)) return []; return p.tableau.filter(e=>{const fx=window.CARD_FX[e.id]; return fx&&fx.d&&e.ds>=fx.dc&&(!fx.dok||fx.dok(this,p));});}
  async useDS(p,e){const fx=window.CARD_FX[e.id]; e.ds-=fx.dc; p.dsUsed=(p.dsUsed||0)+1; this.log(`${p.name} active la capacité Écaille de ${this.card(e.id).name}.`); await fx.d(this,p,e); this.io.render();}
  // Entre deux cartes jouées : capacités Écaille et actions annexes
  async midPlay(p,k,N){ for(;;){ const r=this.dsReady(p), x=this.extras(p); if(!r.length&&!x.length) return true;
      const can=p.hand.some(id=>this.payments(p,id,1).length);
      const ch=await this.ask(p,{title:`Entre deux cartes (${k}/${N} jouée${k>1?'s':''})`,options:[{label:can?`Jouer la carte suivante (${k+1}/${N})`:'Continuer (aucune carte payable)',value:'next',score:0},{label:'Arrêter de jouer des cartes',value:'stop',score:0},...r.map(e=>({label:'Capacité Écaille : '+this.card(e.id).name,value:{ds:e},card:e.id,score:0})),...x]});
      if(ch==='next') return true; if(ch==='stop'||!ch) return false; if(ch.x) await this.doExtra(p,ch.x); else await this.useDS(p,ch.ds); }}
  // ---------- Annulation : instantané de l'état au début du tour ----------
  static deepClone(v,memo){ if(v===null||typeof v!=='object') return v; if(memo.has(v)) return memo.get(v);
    if(Array.isArray(v)){const a=[]; memo.set(v,a); v.forEach((x,i)=>a[i]=Game.deepClone(x,memo)); return a;}
    if(Object.getPrototypeOf(v)!==Object.prototype) return v;
    if(Object.values(v).some(x=>typeof x==='function')) return v; // données statiques (objectifs…) : par référence
    const o={}; memo.set(v,o); for(const k in v) o[k]=Game.deepClone(v[k],memo); return o;}
  snapshot(){const keep=new Set(['io','B','regions','nestById','cardById']); const src={}; for(const k of Object.keys(this)) if(!keep.has(k)) src[k]=this[k]; return Game.deepClone(src,new Map());}
  restore(snap){const keep=new Set(['io','B','regions','nestById','cardById']); for(const k of Object.keys(this)) if(!keep.has(k)&&!(k in snap)) delete this[k]; Object.assign(this,Game.deepClone(snap,new Map()));}
  async takeTurnUndoable(){const p=this.players[this.current]; if(p.ai||!this.io.undoable) return this.takeTurn();
    const snap=this.snapshot(); const seed=(Math.random()*4294967296)>>>0; const orig=Math.random; let replay=[];
    const rng=()=>{let a=seed; return ()=>{a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296;};};
    this.io.beginTurn&&this.io.beginTurn(null,true);
    for(;;){ Math.random=rng(); this.io.beginTurn&&this.io.beginTurn(replay,false);
      try{ await this.takeTurn(); Math.random=orig; this.io.endTurn&&this.io.endTurn(); return; }
      catch(err){ Math.random=orig; if(!err||!err.undo) throw err; replay=err.replay; this.restore(snap); this.io.undone&&this.io.undone(); }}}
  // ---------- Tour ----------
  adjacentRowSlots(k){return [(k+5)%6,k];}
  moveDests(p,cost){const out=[]; let pos=p.flock, steps=0; const max=cost+this.rm(p,1)+(this.has(p,'ON8')?1:0); let guard=0;
    while(steps<max&&guard<12){guard++; pos=(pos+1)%6; if(this.islandFull(ISLANDS[pos])) continue; steps++; out.push(pos);} return out;}
  async takeTurn(){const p=this.players[this.current]; p.dsUsed=0; p.crateUsed=false; this.log(`— Tour de ${p.name} —`); this.io.render();
    let done=false;
    while(!done){ const opts=[];
      opts.push({label:'Déplacer la Nuée puis agir',value:'move',score:0,disabled:p.chicks<=0,why:p.chicks<=0?'Vous n\'avez plus de Poussin disponible':''});
      {const can=p.hand.some(id=>this.payments(p,id,1).length); opts.push({label:'Jouer jusqu\'à '+(2+(this.has(p,'OY4')?1:0))+' cartes',value:'play',score:0,disabled:!can,why:can?'':(p.hand.length?'Aucune carte de votre main n\'est payable pour l\'instant':'Votre main est vide')});}
      opts.push({label:'Couvée',value:'brood',score:0});
      this.dsReady(p).forEach(e=>opts.push({label:'Capacité Écaille : '+this.card(e.id).name,value:{ds:e},card:e.id,score:0})); this.extras(p).forEach(o=>opts.push(o));
      const ch=await this.ask(p,{title:'Votre tour : que faites-vous ?',main:true,options:opts});
      if(ch&&ch.ds){await this.useDS(p,ch.ds); continue;} if(ch&&ch.x){await this.doExtra(p,ch.x); continue;}
      if(ch==='move'){ const ok=await this.turnMove(p); if(ok===false) continue; }
      else if(ch==='play'){ const N=2+(this.has(p,'OY4')?1:0); for(let k=0;k<N;k++){ if(k>0&&!p.ai&&!(await this.midPlay(p,k,N))) break; if(k>0&&!p.hand.some(id=>this.payments(p,id,1).length)) break; const ok=await this.playOne(p,{title:`Jouer une carte (${k+1}/${N})`}); if(!ok) break; } }
      else if(ch==='brood') await this.brood(p);
      done=true;}
    // capacité Écaille après l'action
    while(this.dsReady(p).length||this.extras(p).length||(!p.ai&&this.io.undoable)){const r=this.dsReady(p); const more=r.length||this.extras(p).length; const ch=await this.ask(p,{title:more?'Autre chose avant de finir ?':'Fin de votre tour',endTurn:true,options:[{label:'Finir le tour',value:null,score:0.3},...r.map(e=>({label:'Capacité Écaille : '+this.card(e.id).name,value:{ds:e},card:e.id,score:this.dsScore(p,e)})),...this.extras(p)]}); if(!ch) break; if(ch.x) await this.doExtra(p,ch.x); else await this.useDS(p,ch.ds);}
    await this.checkCondStars(p);
    await this.checkSettlements(); p.plan=[];
    this.io.render();}
  async turnMove(p){const slots=this.adjacentRowSlots(p.flock).filter(k=>this.row[k]);
    if(!slots.length) return false;
    const k=await this.ask(p,{title:'Choisissez une carte adjacente à votre Nuée',cancel:true,options:slots.map(k=>({label:this.card(this.row[k]).name+' (déplacement '+this.card(this.row[k]).cost+')',value:k,card:this.row[k],target:{kind:'row',k},score:0}))});
    if(k===undefined||k===null) return false;
    const id=this.row[k]; const dests=this.moveDests(p,this.card(id).cost);
    const d=await this.ask(p,{title:'Où va votre Nuée ?',cancel:true,options:dests.map(x=>({label:ISL_FR[ISLANDS[x]],value:x,target:{kind:'flock',k:x},score:0}))});
    if(d===undefined||d===null) return false;
    const acts=this.boardActionOptions(p,ISLANDS[d],null);
    const a=await this.ask(p,{title:`Action en ${ISL_FR[ISLANDS[d]]} : cliquez une région (S'étendre / Récolter) ou un emplacement (Construire)`,cancel:true,options:[...acts,{label:'Aucune action',value:'none',score:-5}]});
    if(a===undefined||a===null) return false;
    p.hand.push(id); this.row[k]=null; p.flock=d; this.log(`${p.name} prend ${this.card(id).name} et déplace sa Nuée en ${ISL_FR[ISLANDS[d]]}.`); this.io.render();
    if(a!=='none') await this.applyBoardAction(p,a);
    this.row[k]=this.drawFromDeck(); this.io.render(); return true;}
  async run(){ for(const p of this.players) await this.choosePersonal(p);
    while(!this.over){ await this.takeTurnUndoable();
      this.current=(this.current+1)%this.players.length;
      if(this.current===0){ if(this.endTriggered){this.over=true; break;} this.round++; }
      await this.io.sleep(50);}
    this.finish();}
  statRecord(r){const w=r[0];
    return {v:1,t:Date.now(),pset:this.persoSet,n:this.players.length,rounds:this.round,sim:!!this.io.sim,red:this.objs[0].d.id,blue:this.objs[1].d.id,
      redClaims:this.objs[0].claims.slice(),blueClaims:this.objs[1].claims.slice(),settled:Object.assign({},this.settled),
      players:this.players.map(p=>({i:p.i,ai:p.ai,win:p===w,rank:r.indexOf(p)+1,stars:p.stars,starRounds:p.starRounds||[],
        pobj:p.pobj&&p.pobj.id,pClaims:p.pClaims,pOffer:(p.pOffer||[]).map(o=>o.id),played:(p.played||[]).map(x=>x.id),
        tableau:p.tableau.map(e=>e.id),built:{nest:p.built.nest.length,shrine:p.built.shrine.length,workshop:p.built.workshop.length},
        builtLv:{nest:p.built.nest.slice(),shrine:p.built.shrine.slice(),workshop:p.built.workshop.slice()},
        runes:p.runes.slice(),seagulls:p.seagulls.slice(),elders:p.eldersTotal||0,chicks:p.chicks,eggs:p.eggs,hand:p.hand.length}))};}
  finish(){const r=this.players.slice().sort((a,b)=>b.stars-a.stars||b.chicks-a.chicks||b.eggs-a.eggs);
    try{ if(window.BirdsStats) window.BirdsStats.add(this.statRecord(r)); }catch(e){console.error(e);}
    this.ranking=r; this.log(`Fin de partie ! Vainqueur : ${r[0].name} avec ${r[0].stars} Étoiles.`); this.io.render(); this.io.gameOver&&this.io.gameOver(r);}
  // ---------- Décisions ----------
  async ask(p,q){ q.options=q.options.filter(o=>o); if(!q.options.length) return null;
    if(p.ai){ const t0=Date.now(); if(q.main&&this.io.lookahead&&!this.io.rollout&&(!this.io.lookahead.seats||this.io.lookahead.seats.includes(p.i))){ const v=await this.aiMainLookahead(p,q); if(v!==undefined){ const left=(this.io.aiDelay||0)-(Date.now()-t0); if(left>0) await this.io.sleep(left); return v;} }
      await this.io.sleep(this.io.aiDelay||0); return this.aiPick(p,q);} return await this.io.ask(p,q);}
  aiPick(p,q){ if(q.main) return this.aiMain(p,q); if(p.plan&&p.plan.length){const want=p.plan[0]; const o=q.options.find(o=>o.value===want||(o.value&&want&&typeof want==='object'&&o.value.kind===want.kind&&o.value.r===want.r&&o.value.s===want.s&&o.value.type===want.type&&o.value.lvl===want.lvl)); if(o){p.plan.shift(); return o.value;}}
    let best=null,bs=-1e9; q.options.forEach(o=>{const s=(o.score||0)+Math.random()*0.3; if(s>bs){bs=s;best=o;}}); return best.value;}
  // ---------- Heuristiques IA ----------
  cardValue(p,id){const c=this.card(id); const pays=this.payments(p,id,1); return 1+(pays.length?0.6:0)+(c.brood?0.5:0)+(c.cost>=4?0.3:0);}
  presenceScore(p,isl,gain){if(this.settled[isl]!==undefined) return 0.3*gain; const mine=this.presence(isl,p.i);
    const others=Math.max(0,...this.players.filter(q=>q!==p).map(q=>this.presence(isl,q.i)));
    const W=this.W(p); if(mine+gain>=6&&others<6) return W.colDone; if(!W.pres) return gain*(0.7+0.15*mine-(others>mine+2?0.4:0)); const race=others>=mine+3?-0.5:(mine>=others?0.4:0); return gain*(0.8+W.pres*0.3*mine+race);}
  islandScore(p,isl){return this.expandTargets(isl).length*0.6+this.gatherTargets(isl).length*0.4+this.presence(isl,p.i)*0.2;}
  bonusValue(b){return ({rune:1.8,reveal3:1.6,reveal2:1.4,seagull:0.8,worm:1,chick:1.6,dragonscale:0.6,elders:1.1,grow:1.3,draw:1.2,seedOrFruit:1.1,buildAny:2,gatherAny:2,expandAny:2,ruinChick:1.5,brood:2.5,play1:1.5,removeCheapest:1.8})[b]||1;}
  expandScore(p,r){return this.blueBonus(p,r)*this.W(p).blue+1+r.tree.bonus.reduce((s,b)=>s+this.bonusValue(b),0)+this.presenceScore(p,r.island,1)-0.6;}
  gatherUnlock(p,r){const W=this.W(p); if(!W.gp) return 0; const before=p.hand.filter(id=>this.payments(p,id,1).length).length; const g={worm:0,seed:0,fruit:0}; g[TREE_FOOD[this.trees[r.id]]]+=2; this.treesOnIsland(r.island).forEach(o=>{if(o.id!==r.id) g[TREE_FOOD[this.trees[o.id]]]++;});
    for(const t in g) p.food[t]+=g[t]; let after=0; try{after=p.hand.filter(id=>this.payments(p,id,1).length).length;} finally {for(const t in g) p.food[t]-=g[t];} return (after-before)*W.gp;}
  gatherScore(p,r){const bb=this.blueBonus(p,r)*this.W(p).blue+this.gatherUnlock(p,r); const n=2+this.treesOnIsland(r.island).length-1; const need=this.foodNeed(p,TREE_FOOD[this.trees[r.id]]); return bb+n*0.9+need+this.presenceScore(p,r.island,1)-0.6;}
  objNear(o,p,gain){ if(o.claims.includes(p.i)) return 0; const th=o.th[o.claims.length]; if(th===undefined) return 0; return o.d.m(this,p)+gain>=th?1:0;}
  blueBonus(p,r){ const W=this.W(p); if(W.tempo){ const o=this.objs[1], id=o.d.id, tc=this.trees[r.id]||r.tree.color;
      const g=((id==='C02'&&tc==='green')||(id==='C03'&&tc==='yellow')||(id==='C04'&&tc==='grey')||(id==='C06'&&r.ruins.length))?1:(id==='C05'&&this.islandRegions(r.island).reduce((n,x)=>n+this.chicksIn(x.id,p.i),0)===1?1:0);
      if(g&&this.objNear(o,p,1)) return W.tempo*8+this.blueBonus0(p,r); }
    return this.blueBonus0(p,r);}
  blueBonus0(p,r){const o=this.objs[1]; if(o.claims.includes(p.i)||o.th[o.claims.length]===undefined) return 0; const id=o.d.id, tc=this.trees[r.id]||r.tree.color;
    if((id==='C02'&&tc==='green')||(id==='C03'&&tc==='yellow')||(id==='C04'&&tc==='grey')||(id==='C06'&&r.ruins.length)) return 1.4;
    if(id==='C05'&&this.islandRegions(r.island).reduce((n,x)=>n+this.chicksIn(x.id,p.i),0)<2) return 1.2; return 0;}
  foodNeed(p,t){let need=0; p.hand.forEach(id=>{const c=this.card(id); if(c.color==='red'&&t==='worm') need+=0.2; if(c.color==='yellow'&&t==='seed') need+=0.15; if(c.color==='green'&&t==='fruit') need+=0.15;}); return need-(p.food[t]>4?0.6:0);}
  buildScore(p,s,b){const o=this.objs[1]; const bb=(o.d.id==='C01'&&!o.claims.includes(p.i)&&!this.islandNests(s.island).some(x=>{const q=this.nestOwner[x.id]; return q&&q.owner===p.i;}))?2:0; return bb+this.buildScore0(p,s,b);}
  goal(p,id){const e=p.tableau.find(x=>x.id===id); return e&&!e.starTaken;}
  // valeur de conserver un élément en jeu (pour choisir quoi sacrifier) : on mesure ce qu'on perdrait
  keepValue(p,it){ const was=p.tableau.slice(), wasG=p.seagulls.slice(); let item=null;
    const snap=()=>({tags:this.tags(p),each:this.hasEachTag(p),wild:this.wild(p),perso:this.persoValue(p),b3:this.birds3(p),b4:this.birds4(p),
      red:this.objs[0].claims.includes(p.i)||this.objs[0].th[this.objs[0].claims.length]===undefined?null:this.objs[0].d.m(this,p),allies:this.allyCount(p),rel:this.relicCount(p)});
    const A=snap();
    if(it.e){item=this.card(it.e.id); p.tableau=p.tableau.filter(x=>x!==it.e);} else p.seagulls=p.seagulls.filter((_,k)=>k!==it.gull);
    const B=snap(); p.tableau=was; p.seagulls=wasG;
    let v=0;
    if(p.pobj&&p.pClaims<2){const th=PERSO_TH[p.pClaims]; v+=(A.perso-B.perso)*(A.perso>=th-2?1.6:0.9);}
    if(A.red!==null){const th=this.objs[0].th[this.objs[0].claims.length]; v+=(A.red-B.red)*(A.red>=th-2?1.8:0.8);}
    if(A.each&&!B.each) v+=1.2; v+=(A.wild-B.wild)*0.6;
    if(it.e){ const fx=window.CARD_FX[it.e.id]||{}; if(fx.b) v+=1.6; if(fx.d) v+=0.4+0.5*(it.e.ds||0); if(item.type==='relic'){v+=0.6; if(window.COND_STARS[it.e.id]&&!it.e.starTaken) v+=3.5;} if(item.type==='ally') v+=0.5+(this.goal(p,'OG7')?2:0);
      v+=0.15*(item.cost||0); if(this.goal(p,'OY6')&&item.type==='bird') v+=0.25*item.cost; }
    else { const l=p.seagulls[it.gull]; v+=0.9+(l>=2?0.9:0)+(this.goal(p,'OR7')?l*0.5:0); }
    // cartes en jeu qui comptent les Oiseaux 3- / 4+, les Alliés, les Reliques
    v+=Math.max(0,A.b3-B.b3)*0.25+Math.max(0,A.b4-B.b4)*0.35;
    return v;}
  amuletScore(p,k){ if(!this.W(p).amu) return [1.5,2,1.5,2.5,0.5][k];
    if(k===0){ let v=2.6; const t=this.tags(p); const miss=FAMS.filter(f=>t[f]<1).length-this.wild(p); if(miss===1) v+=1;      // tag joker
      if(p.pobj&&p.pClaims<2) v+=0.8; if([...p.hand,...p.tableau.map(e=>e.id)].some(id=>/1 tag of each/.test(this.card(id).instant||''))) v+=0.6; return v; }
    if(k===1) return 1.3+(this.endTriggered?0:0.2);                                                          // Nuée +1 île
    if(k===2) return 0.6+0.9*p.built.workshop.length+(p.left.workshop.length?0.3:0);                          // relance d'Atelier
    if(k===3){ let v=0.4+0.5*Math.min(p.nests,3); if(this.redOn(p,'B05')) v+=1.5; if(p.left.nest.length&&p.nests<2) v-=0.3; return v; } // +1 Œuf par Nid
    if(k===4){ let v=0.4+0.6*p.built.shrine.length+0.5*p.hand.filter(id=>this.card(id).type==='relic').length; if(this.redOn(p,'B04')) v+=1.2; return v; } // +1 place Sanctuaire
    return 1;}
  gullGainBonus(p){ if(!this.W(p).gctx) return 0; if(!p.seagulls.length) return 0.5; let b=0;
    if(this.redOn(p,'B01')) b+=2.5;                       // une Mouette niv. 1 compte comme carte de coût 1
    const prod=p.nests+p.seagulls.length; if(prod<3&&p.supply>2) b+=1.6; // peu de production d'Œufs
    const SAC=/sacrifi/i; const needSac=[...p.hand,...p.tableau.map(e=>e.id)].some(id=>{const c=this.card(id); return SAC.test([c.instant,c.brood,c.dragonscale,c.text].join(' '));});
    if(needSac&&!p.seagulls.some(l=>l===1)) b+=1.8; return b;}
  redOn(p,id){const o=this.objs[0]; return o.d.id===id&&!o.claims.includes(p.i)&&o.th[o.claims.length]!==undefined;}
  buildScore0(p,s,b){ const rb0=0; const rb=(b.type==='nest'&&this.goal(p,'OB7')?2:0)+(b.type==='workshop'&&this.goal(p,'OR6')?2:0)+(b.type==='shrine'&&this.goal(p,'OY7')?2:0)+(b.type==='nest'&&this.redOn(p,'B05')?2.2:0)+(b.type==='shrine'&&this.redOn(p,'B04')?2.6:0)+(b.type==='shrine'?this.W(p).shr*p.hand.filter(id=>this.card(id).type==='relic'&&!this.payments(p,id,1).length).length:0);const lvB=this.W(p).lvl?({nest:[0,0.4,1.2,1.3],shrine:[0,0.3,0.6,0.9],workshop:[0,0.2,0.6,0.7]})[b.type][b.lvl]:0; const relNeed=b.type==='shrine'?(this.redOn(p,'B04')?1:0)+p.hand.filter(id=>this.card(id).type==='relic'&&!this.payments(p,id,1).length).length*0.5:0; const lvB2=lvB+relNeed*0.6*b.lvl; const base={nest:3.2+lvB,shrine:1.2+lvB2,workshop:2.8+lvB}[b.type]; const cost=b.chicks*0.45+Object.values(b.food).reduce((a,x)=>a+x,0)*0.9; return rb+base-cost+this.presenceScore(p,s.island,2)+(b.type==='nest'&&p.eggs>=this.nestCap(p)?1:0);}
  W(p){return Object.assign({},AIW_CLASSIC,AIW_TRAINED,p.aiw||window.AIW||{});}
  fxValue(p,c){const t=[c.instant,c.brood,c.dragonscale,c.text].filter(Boolean).join(' '); let v=0;
    const K=[[/Elders|Anciens/g,0.9+(p.elders>=8?0.8:0)],[/Chick|Poussin/g,0.8],[/Lay|Pondre|Pond/g,0.5],[/Grow|éclore/g,0.5],[/Search|Révéler|reveal/gi,0.6],[/Seagull|Mouette/g,0.5],[/Amulet|Rune|Rune/g,0.7],[/Build|Construire/g,1.0],[/Expand|étendre/g,0.9],[/Gather|Récolter/g,0.7],[/Play 1|Jouer 1/g,0.9],[/Star|Étoile/g,1.2]];
    K.forEach(([re,w])=>{const m=t.match(re); if(m) v+=w*Math.min(2,m.length);}); if(c.brood) v+=0.5; return v*this.W(p).fx;}
  playScore(p,id,free){const c=this.card(id); const ob=this.redObj; let objB=(!this.redClaims.includes(p.i)&&this.redNext()!==undefined)?(({B01:c.cost<=2,B02:c.cost===3,B03:c.cost>=4,B04:c.type==='relic',B06:!!c.dragonscale})[ob.id]?1.8:0):0; objB*=this.W(p).red; const cs=window.COND_STARS&&window.COND_STARS[id]?2.5:0; const persoB=p.pobj&&p.pClaims<2&&p.pobj.tags.some(f=>(c.tagMap||{})[f])?1.6+0.4*(c.tagMap[p.pobj.tags[0]]||0)+0.4*(c.tagMap[p.pobj.tags[1]]||0):0; const gb=(c.type==='ally'&&this.goal(p,'OG7')?1.5:0)+(c.type==='bird'&&this.goal(p,'OY6')?c.cost*0.3:0);
    if(c.type!=='bird'){ let t2=0; const W2=this.W(p); if(W2.tempo){const o=this.objs[0]; if(o.d.id==='B04'&&c.type==='relic'&&this.objNear(o,p,1)) t2+=7; if(p.pobj&&p.pClaims<2){const a2=((c.tagMap||{})[p.pobj.tags[0]]||0)+((c.tagMap||{})[p.pobj.tags[1]]||0)+(c.wild||0); if(a2&&this.persoValue(p)+a2>=PERSO_TH[p.pClaims]) t2+=7;} t2*=W2.tempo;} return this.payments(p,id,1).length||free?2.2+c.cost*0.6+objB+cs+persoB+gb+t2:-9;} const pays=free?[{cost:0}]:this.payments(p,id,1); if(!pays.length) return -9; const t=this.tags(p);
    const W1=this.W(p); let tempoB=0; if(W1.tempo){ const o=this.objs[0]; const add=({B01:c.cost<=2,B02:c.cost===3,B03:c.cost>=4,B04:c.type==='relic',B06:!!c.dragonscale})[o.d.id]?1:0; if(add&&this.objNear(o,p,1)) tempoB+=7;
      if(p.pobj&&p.pClaims<2){const add2=(c.tagMap[p.pobj.tags[0]]||0)+(c.tagMap[p.pobj.tags[1]]||0); if(add2&&this.persoValue(p)+add2>=PERSO_TH[p.pClaims]) tempoB+=7;} tempoB*=W1.tempo;}
    let v=tempoB+this.fxValue(p,c)+gb+(this.redOn(p,'B05')&&/Lay/.test(c.instant||'')?1.6:0)+objB+persoB+1.6+c.cost*0.9-pays[0].cost*0.85+(c.brood?1.2:0)+(c.dragonscale?0.6:0); if(t[c.family]===0) v+=0.6; return v;}
  dsScore(p,e){return 1.2;}
  // ---------- IA : anticipation par simulations (Monte-Carlo) ----------
  async aiMainLookahead(p,q){ const L=this.io.lookahead; const K=L.k||6, R=L.r||3;
    const all=this.aiMain(p,q,true); if(!all) return undefined; // capacité Écaille prioritaire : comportement habituel
    const seen=new Set(), cands=[]; all.slice().sort((a,b)=>b.s-a.s).forEach(c=>{const key=c.v+':'+JSON.stringify(c.plan); if(!seen.has(key)){seen.add(key); cands.push(c);}});
    const pick=[]; for(const c of cands){ if(pick.length>=K) break; pick.push(c);} ['play','brood','move'].forEach(v=>{ if(!pick.some(c=>c.v===v)){const c=cands.find(c=>c.v===v); if(c) pick.push(c);} });
    if(pick.length<=1) return undefined;
    const snap=this.snapshot(); let best=null, bs=-1e9;
    for(const c of pick){ let tot=0; for(let r=0;r<R;r++){ tot+=await this.rollout(snap,p.i,c); if(L.yield) await new Promise(res=>setTimeout(res,0)); }
      const sc=tot/R+c.s*0.02; if(sc>bs){bs=sc; best=c;} }
    p.broodStreak=best.v==='brood'?(p.broodStreak||0)+1:0; p.plan=best.plan.slice(); return best.v;}
  async rollout(snap,mi,cand){ const rio={aiDelay:0,sim:true,rollout:true,sleep:()=>Promise.resolve(),log(){},render(){},ask(){throw new Error('rollout');},gameOver(){}};
    const g=Object.create(Game.prototype); g.io=rio; g.B=this.B; g.regions=this.regions; g.nestById=this.nestById; g.cardById=this.cardById; g.restore(snap);
    g.players.forEach(x=>{x.ai=true; delete x.remote;});
    // les cartes cachées (mains adverses, pioche) sont redistribuées au hasard
    const pool=g.deck.slice(); g.players.forEach(x=>{ if(x.i!==mi) pool.push(...x.hand);}); shuffle(pool);
    g.players.forEach(x=>{ if(x.i!==mi){ const n=x.hand.length; x.hand=pool.splice(0,n);} }); g.deck=pool;
    g.players[mi].forced=cand; const r0=g.round, n=g.players.length; let guard=0;
    try{ while(!g.over&&guard++<400){ await g.takeTurn(); g.current=(g.current+1)%n; if(g.current===0){ if(g.endTriggered){g.over=true; break;} g.round++; if(g.round-r0>40) break; } } }catch(e){ return 0; }
    const me=g.players[mi], opp=Math.max(...g.players.filter(x=>x.i!==mi).map(x=>x.stars));
    const win=me.stars>opp||(me.stars===opp&&g.players.filter(x=>x.i!==mi).every(x=>me.chicks>x.chicks||(me.chicks===x.chicks&&me.eggs>=x.eggs)));
    return (win?4:0)+(me.stars-opp)-(win?0.12*(g.round-r0):0);}
  aiMain(p,q,all){ // évalue globalement les options principales
    if(p.forced&&!all){const f=p.forced; p.forced=null; p.broodStreak=f.v==='brood'?(p.broodStreak||0)+1:0; p.plan=f.plan.slice(); return f.v;}
    const cands=[]; p.plan=[];
    if(q.options.some(o=>o.value==='move'&&!o.disabled)){ this.adjacentRowSlots(p.flock).filter(k=>this.row[k]).forEach(k=>{const id=this.row[k]; const cv=this.cardValue(p,id)+0.2;
        this.moveDests(p,this.card(id).cost).forEach(d=>{ this.boardActionOptions(p,ISLANDS[d],null).forEach(a=>cands.push({s:cv+a.score,plan:[k,d,a.value],v:'move'})); cands.push({s:cv-1.5,plan:[k,d,'none'],v:'move'}); });});}
    const playable=p.hand.filter(id=>this.payments(p,id,1).length);
    if(playable.length){const sc=playable.map(id=>this.playScore(p,id)).sort((a,b)=>b-a); const W=this.W(p); cands.push({s:W.play+sc[0]+(sc[1]>0?sc[1]*W.play2:0)+(p.chicks===0?1:0),plan:[],v:'play'});}
    const W0=this.W(p); const canLay=Math.max(0,Math.min(p.supply,this.nestCap(p)-0));
    const layN=Math.min(canLay,p.nests+p.seagulls.length);
    const bv=p.eggs*1.4*(W0.bmode&&p.chicks>=2?0.35:1)+layN*0.8*(W0.bmode&&p.chicks>=2?0.5:1)+p.seagulls.filter(l=>l>=2).length*0.6+p.tableau.filter(e=>window.CARD_FX[e.id]&&window.CARD_FX[e.id].b).length*0.9+(p.hand.length?0.8:0)+(p.chicks===0?2.5:0)-(p.eggs===0&&p.chicks>2?1.5:0)-(p.broodStreak||0)*1.2;
    const eggHold=this.redOn(p,'B05')&&p.eggs>=2&&p.chicks>0?-2.5:0; const W=this.W(p); let bAdj=W.brood;
    if(W.bmode){ const steps=(p.hand.length?1:0)+p.seagulls.filter(l=>l>=2).length+p.tableau.filter(e=>/Elders/.test(this.card(e.id).brood||'')).length;
      const starNow=p.elders>0&&p.elders+steps>=ELDERS_LEN, late=this.endTriggered||this.players.some(q=>q.stars>=5)||p.stars>=5;
      if(p.chicks===0) bAdj+=3; else if(p.chicks===1) bAdj+=0.5; else bAdj-=W.bmode*(p.chicks>=3?W.b3:1);
      if(starNow) bAdj+=late?6:3; }
    cands.push({s:bv+eggHold+bAdj,plan:[],v:'brood'});
    const ds=q.options.find(o=>o.value&&o.value.ds); if(ds) return all?null:ds.value;
    if(all) return cands;
    cands.forEach(c=>c.s+=Math.random()*0.5); cands.sort((a,b)=>b.s-a.s); const best=cands[0]; p.broodStreak=best.v==='brood'?(p.broodStreak||0)+1:0; p.plan=best.plan.slice(); return best.v;}
}
window.BirdsGame={Game,resLabel,AIW_CLASSIC,AIW_TRAINED,PERSONAL,PERSO_TH,RED_OBJ,BLUE_OBJ,ISLANDS,ISL_FR,FOOD_FR,BUILD,BUILD_FR,RUNES,ELDERS_LEN,ELDERS_BONUS,ELDERS_FR,COLORS,FAM,FAMS,TREE_FOOD,NEUTRAL};
})();
