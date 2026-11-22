// Jeu en ligne hors de claude.ai (ex. GitHub Pages) : connexion directe entre navigateurs (WebRTC, via PeerJS).
// Imite la petite partie de l'API « db » de l'artefact utilisée par ui.js : doc(chemin).get/set/onSnapshot et collection(chemin).onSnapshot.
// L'appareil de l'hôte garde l'état ; les invités en reçoivent une copie et lui envoient leurs écritures.
(function(){
const PREFIX='birds-v1-';
const CDN='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
let loading=null;
function loadPeerJS(){ if(window.Peer) return Promise.resolve(true); if(loading) return loading;
  loading=new Promise(res=>{ const s=document.createElement('script'); s.src=CDN; s.async=true; s.onload=()=>res(!!window.Peer); s.onerror=()=>res(false); document.head.appendChild(s); setTimeout(()=>res(!!window.Peer),12000); });
  return loading; }
const parent=p=>p.split('/').slice(0,-1).join('/');
function makeStore(sendWrite){
  const data=new Map(), docL=new Map(), colL=new Map(); let ready=true, readyWaiters=[];
  const snapDoc=p=>{const d=data.get(p); return {id:p.split('/').pop(),exists:d!==undefined,data:()=>d,metadata:{fromCache:false,hasPendingWrites:false}};};
  function notify(p,old){ (docL.get(p)||[]).forEach(f=>f(snapDoc(p)));
    const c=parent(p); const ls=colL.get(c); if(ls&&ls.length){ const docs=[...data.keys()].filter(k=>parent(k)===c).sort().map(snapDoc);
      const type=data.get(p)===undefined?'removed':old===undefined?'added':'modified'; const ch=[{type,doc:snapDoc(p)}];
      ls.forEach(f=>f({docs,size:docs.length,empty:!docs.length,docChanges:()=>ch,metadata:{fromCache:false}})); } }
  function apply(p,d){ const old=data.get(p); if(d===null) data.delete(p); else data.set(p,d); notify(p,old); }
  const api={
    _apply:apply, _all:()=>Object.fromEntries(data), _setReady(v){ready=v; if(v){readyWaiters.forEach(f=>f()); readyWaiters=[];}},
    _whenReady:()=>ready?Promise.resolve():new Promise(r=>readyWaiters.push(r)),
    doc(p){ return {id:p.split('/').pop(),path:p,
      get:async()=>{ await api._whenReady(); return snapDoc(p); },
      set:async d=>{ const v=JSON.parse(JSON.stringify(d)); apply(p,v); sendWrite(p,v); },
      update:async d=>{ const v=Object.assign({},data.get(p)||{},JSON.parse(JSON.stringify(d))); apply(p,v); sendWrite(p,v); },
      delete:async()=>{ apply(p,null); sendWrite(p,null); },
      onSnapshot:(next)=>{ const a=docL.get(p)||[]; a.push(next); docL.set(p,a); api._whenReady().then(()=>next(snapDoc(p))); return ()=>{const b=docL.get(p)||[]; docL.set(p,b.filter(f=>f!==next));}; } }; },
    collection(c){ return { path:c, doc:id=>api.doc(c+'/'+id), limit(){return this;},
      get:async()=>{ await api._whenReady(); const docs=[...data.keys()].filter(k=>parent(k)===c).sort().map(snapDoc); return {docs,size:docs.length,empty:!docs.length}; },
      onSnapshot:(next)=>{ const a=colL.get(c)||[]; a.push(next); colL.set(c,a);
        api._whenReady().then(()=>{ const docs=[...data.keys()].filter(k=>parent(k)===c).sort().map(snapDoc); next({docs,size:docs.length,empty:!docs.length,docChanges:()=>docs.map(d=>({type:'added',doc:d})),metadata:{fromCache:false}}); });
        return ()=>{const b=colL.get(c)||[]; colL.set(c,b.filter(f=>f!==next));}; } }; }
  };
  return api; }
// Hôte : ouvre l'adresse « birds-v1-CODE » ; rejette 'taken' si un autre hôte l'utilise déjà.
async function host(code){ if(!(await loadPeerJS())) throw {code:'nolib'};
  const conns=new Set(); const store=makeStore((p,d)=>{ conns.forEach(c=>{ try{c.send({t:'set',p,d});}catch(e){} }); });
  const peer=new window.Peer(PREFIX+code);
  await new Promise((res,rej)=>{ peer.on('open',res); peer.on('error',e=>rej({code:e&&e.type==='unavailable-id'?'taken':'net',err:e})); setTimeout(()=>rej({code:'net'}),15000); });
  peer.on('connection',c=>{ c.on('open',()=>{ conns.add(c); c.send({t:'full',all:store._all()}); });
    c.on('data',m=>{ if(m&&m.t==='hello'){ try{c.send({t:'full',all:store._all()});}catch(e){} return; } if(m&&m.t==='set'&&typeof m.p==='string'&&/^games\/[A-Z0-9]{4}\/(joins|acts)\/[\w-]{1,40}$/.test(m.p)){ store._apply(m.p,m.d); conns.forEach(o=>{ try{o.send({t:'set',p:m.p,d:m.d});}catch(e){} }); } });
    c.on('close',()=>conns.delete(c)); c.on('error',()=>conns.delete(c)); });
  peer.on('disconnected',()=>{ try{peer.reconnect();}catch(e){} });
  store.peer=peer; store.kind='peer'; return store; }
// Invité : se connecte à l'hôte du code ; rejette 'notfound' si personne n'héberge ce code.
async function join(code){ if(!(await loadPeerJS())) throw {code:'nolib'};
  let conn=null; const store=makeStore((p,d)=>{ if(conn&&conn.open) conn.send({t:'set',p,d}); }); store._setReady(false);
  const peer=new window.Peer();
  await new Promise((res,rej)=>{ peer.on('open',res); peer.on('error',e=>rej({code:'net',err:e})); setTimeout(()=>rej({code:'net'}),15000); });
  await new Promise((res,rej)=>{ conn=peer.connect(PREFIX+code,{reliable:true});
    conn.on('data',m=>{ if(!m) return; if(m.t==='full'){ Object.entries(m.all||{}).forEach(([p,d])=>store._apply(p,d)); store._setReady(true);} else if(m.t==='set') store._apply(m.p,m.d); });
    peer.on('error',e=>rej({code:e&&e.type==='peer-unavailable'?'notfound':'net',err:e}));
    conn.on('open',()=>{ try{conn.send({t:'hello'});}catch(e){} res(); }); setTimeout(()=>rej({code:'notfound'}),15000); });
  conn.on('close',()=>{ store.onLost&&store.onLost(); });
  store.peer=peer; store.kind='peer'; return store; }
window.BirdsPeer={loadPeerJS,host,join};
})();
