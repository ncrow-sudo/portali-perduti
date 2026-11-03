
// ================= The great map: routes through biomes to the King of Portals =================
const ROUTE_L=12,LANES=['deserto','montagne','giungla','citta','isole'];
const NODE_T={battaglia:{n:'Battaglia',d:'Mostri, casse e sorprese',ic:'⚔️'},tesoro:{n:'Tesoro',d:'Meno mostri, tante casse',ic:'💰'},mercante:{n:'Mercante',d:'Un mercante sicuro e vita piena',ic:'🛒'},
  elite:{n:'Élite',d:'Un Golem Antico in più, bottino migliore',ic:'⭐'},boss:{n:'Boss',d:'Un boss! Il bottino è leggendario',ic:'👹'},final:{n:'Re dei Portali',d:'La battaglia finale del viaggio',ic:'👑'}};
function genRoute(seed){const rnd=mulberry32((seed|0)*31+7),layers=[];
  for(let L=1;L<=ROUTE_L;L++){let lanes;if(L===ROUTE_L)lanes=[2];else if(L===1)lanes=[0,1,2,3,4];else{lanes=[0,1,2,3,4].filter(()=>rnd()<.75);if(lanes.length<3)lanes=[0,2,4]}
    layers.push(lanes.map(ln=>{let biome=LANES[ln];if(rnd()<.18)biome=LANES[clamp(ln+(rnd()<.5?-1:1),0,4)];if(L>1&&L<ROUTE_L&&rnd()<.09)biome=rnd()<.5?'tempio':'caverna';
      let type='battaglia';if(L===ROUTE_L){type='final';biome='tempio'}else if(L===4||L===8)type='boss';else{const r=rnd();if(L>=3&&r<.17)type='elite';else if(L>=2&&r<.31)type='mercante';else if(r<.45)type='tesoro'}
      return{id:L+'-'+ln,L,lane:ln,biome,type,next:[]}}))}
  for(let i=0;i<layers.length-1;i++){const A=layers[i],Bl=layers[i+1];for(const a of A){let c=Bl.filter(b=>Math.abs(b.lane-a.lane)<=1);if(!c.length)c=[Bl.reduce((p,b)=>Math.abs(b.lane-a.lane)<Math.abs(p.lane-a.lane)?b:p)];a.next=c.map(b=>b.id)}
    for(const b of Bl)if(!A.some(a=>a.next.includes(b.id))){const a=A.reduce((p,x)=>Math.abs(x.lane-b.lane)<Math.abs(p.lane-b.lane)?x:p);a.next.push(b.id)}}
  const nodes={};layers.flat().forEach(n=>nodes[n.id]=n);return{seed,layers,nodes}}
let ROUTE=null;
function soloRoute(){if(!P.route||!P.route.seed)P.route={seed:(Math.random()*1e9)|0,cur:null,hist:[]};if(!ROUTE||ROUTE.seed!==P.route.seed)ROUTE=genRoute(P.route.seed);return ROUTE}
function curRoute(){return MP.on&&MP.route?MP.route:soloRoute()}
function curNode(){const R=curRoute(),id=MP.on?MP.rcur:P.route&&P.route.cur;return id?R.nodes[id]:null}
function routeHist(){return MP.on?(MP.rhist||[]):(P.route.hist||[])}

// ---------- map screen ----------
let RM={choices:[],sel:null,onPick:null,pos:{},t0:0,open:false};
function openRouteMap(o){const R=curRoute();RM={...o,sel:o.choices.length===1?o.choices[0]:null,pos:{},open:true,R};mode='menu';try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}
  $('scRoute').hidden=false;$('routeClose').hidden=!o.canClose;$('routeTitle').textContent=o.title||'La grande mappa';showTouch();drawRoute();routeInfo();
  const sc=$('routeScroll'),focus=o.choices.map(id=>RM.pos[id]).filter(Boolean);if(focus.length){const y=focus.reduce((a,p)=>a+p[1],0)/focus.length;sc.scrollTop=Math.max(0,y-sc.clientHeight/2)}
  if(MP.on&&MP.host)mpSend(true)}
function closeRouteMap(){RM.open=false;$('scRoute').hidden=true;if(mode==='menu'){mode='play';showTouch()}}
function routeInfo(){const n=RM.sel&&RM.R.nodes[RM.sel],b=$('routeGo');if(!n){$('routeInfo').textContent=RM.choices.length?'Tocca uno dei cerchi che brillano per scegliere la strada.':'';b.disabled=true;b.textContent='Vai';return}
  const B=BIOMES[n.biome],T=NODE_T[n.type];$('routeInfo').textContent=`Piano ${n.L} · ${B.n} · ${T.n}: ${T.d}.`;b.disabled=false;b.textContent=RM.goLabel||`Vai: ${B.n}`}
function drawRoute(){const R=RM.R,cv=$('routeCv'),sc=$('routeScroll'),W=Math.max(300,sc.clientWidth),Hh=ROUTE_L*66+96,dpr=Math.min(2,devicePixelRatio||1);
  cv.style.width=W+'px';cv.style.height=Hh+'px';cv.width=W*dpr;cv.height=Hh*dpr;const g=cv.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const pad=Math.min(54,W*.11),lx=ln=>pad+ln*(W-2*pad)/4,ly=L=>Hh-48-(L-1)*66;
  g.fillStyle='#16140f';g.fillRect(0,0,W,Hh);
  LANES.forEach((b,ln)=>{const x=lx(ln),bw=(W-2*pad)/4;const gr=g.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,BIOMES[b].col+'10');gr.addColorStop(1,BIOMES[b].col+'30');g.fillStyle=gr;g.fillRect(x-bw/2,0,bw,Hh);
    g.font='800 11px Nunito,system-ui,sans-serif';g.textAlign='center';g.fillStyle=BIOMES[b].col;g.fillText(BIOMES[b].n.toUpperCase(),x,Hh-12)});
  const hist=routeHist(),cur=curNode(),now=performance.now()/1000;
  for(const row of R.layers)for(const n of row)RM.pos[n.id]=[n.type==='final'?W/2:lx(n.lane),ly(n.L)];
  for(const row of R.layers)for(const n of row)for(const id of n.next){const a=RM.pos[n.id],b=RM.pos[id];const walked=hist.includes(n.id)&&hist.includes(id);const open=cur&&n.id===cur.id&&RM.choices.includes(id);
    g.strokeStyle=walked?'#ffc53d':open?'#ffffffcc':'#ffffff22';g.lineWidth=walked?4:open?3:1.5;g.setLineDash(walked||open?[]:[4,5]);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke()}g.setLineDash([]);
  for(const row of R.layers)for(const n of row){const[x,y]=RM.pos[n.id],B=BIOMES[n.biome],ch=RM.choices.includes(n.id),vis=hist.includes(n.id),isCur=cur&&cur.id===n.id,r=n.type==='final'?26:n.type==='boss'?19:15;
    g.globalAlpha=ch||vis||isCur?1:.5;if(ch){g.fillStyle='#ffffff30';g.beginPath();g.arc(x,y,r+8+Math.sin(now*4)*2,0,7);g.fill()}
    g.fillStyle=B.col;g.beginPath();g.arc(x,y,r,0,7);g.fill();g.lineWidth=RM.sel===n.id?4:2.5;g.strokeStyle=RM.sel===n.id?'#ffffff':isCur?'#ffc53d':vis?'#ffc53d':'#000a';g.stroke();
    g.font=`${n.type==='final'?24:15}px system-ui,"Apple Color Emoji","Segoe UI Emoji",sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(NODE_T[n.type].ic,x,y+1);g.textBaseline='alphabetic';
    if(n.type==='final'){g.font='800 13px Cinzel,Georgia,serif';g.fillStyle='#ffd27a';g.fillText('IL RE DEI PORTALI',x,y-r-8)}
    if(isCur){g.font='800 10px Nunito,system-ui,sans-serif';g.fillStyle='#ffc53d';g.fillText('SEI QUI',x,y+r+12)}g.globalAlpha=1}
  g.font='800 11px Nunito,system-ui,sans-serif';g.textAlign='left';g.fillStyle='#b8aa8c';for(let L=1;L<=ROUTE_L;L++)g.fillText(L,6,ly(L)+4)}
$('routeCv').addEventListener('click',e=>{if(!RM.open)return;const r=$('routeCv').getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=null,bd=30;
  for(const id of RM.choices){const p=RM.pos[id];if(!p)continue;const d=Math.hypot(p[0]-x,p[1]-y);if(d<bd){bd=d;best=id}}if(best){RM.sel=best;sfx('beep');drawRoute();routeInfo()}});
$('routeGo').onclick=()=>{if(!RM.sel)return;const n=RM.R.nodes[RM.sel],fn=RM.onPick;closeRouteMap();if(fn)fn(n)};
$('routeClose').onclick=()=>closeRouteMap();
setInterval(()=>{if(RM.open&&!$('scRoute').hidden)drawRoute()},120);

// ---------- solo flow ----------
function pickNodeSolo(n){P.route.cur=n.id;P.route.hist=P.route.hist||[];if(!P.route.hist.includes(n.id))P.route.hist.push(n.id);fadeTo(()=>startFloor(n.L,n))}
function portalSolo(){const R=soloRoute(),cur=curNode();
  if(floor===0){if(cur)openRouteMap({choices:[cur.id],canClose:true,title:'La grande mappa',goLabel:`Riprendi dal piano ${cur.L}`,onPick:n=>fadeTo(()=>startFloor(n.L,n))});
    else openRouteMap({choices:R.layers[0].map(n=>n.id),canClose:true,title:'Scegli da dove partire',onPick:pickNodeSolo});return}
  if(!cur||!cur.next.length){fadeTo(()=>startCamp());return}openRouteMap({choices:cur.next,canClose:true,title:'Scegli la prossima strada',onPick:pickNodeSolo})}
function retryNode(){const n=curNode();if(n)startFloor(n.L,n);else startFloor(Math.max(1,checkpoint))}

// ---------- multiplayer flow (host picks, everyone follows) ----------
function mpPickNode(n){MP.rcur=n.id;MP.rhist=MP.rhist||[];if(!MP.rhist.includes(n.id))MP.rhist.push(n.id);MP.loading=true;fadeTo(()=>{startFloor(n.L,n);mpSend(true)})}
function mpHostPortal(){if(RM.open||!MP.route)return;if(floor===0){const cur=curNode();openRouteMap({choices:cur?[cur.id]:MP.route.layers[0].map(n=>n.id),canClose:true,title:'Scegli dove inizia il gruppo',goLabel:cur?`Riprendi dal piano ${cur.L}`:null,onPick:mpPickNode});return}
  const cur=curNode();if(!cur||!cur.next.length)return;openRouteMap({choices:cur.next,canClose:true,title:'Scegli la strada per il gruppo',onPick:mpPickNode})}
// ---------- victory ----------
function showVictory(){if(mode==='win')return;mode='win';try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}music.stinger('victory');P.dance=8;
  const ng=(P.ng||0)+1,ds=$('winStats');ds.innerHTML='';[[`${P.lvl}`,`livello · ${RANKS[rankIdx(P.lvl)][0]}`],[stats.kills,'mostri battuti'],[stats.bosses,'boss sconfitti'],[routeHist().length,'piani attraversati']].forEach(([v,l])=>{const d=document.createElement('div');d.innerHTML='<b></b><span></span>';d.firstChild.textContent=v;d.lastChild.textContent=l;ds.appendChild(d)});
  const path=routeHist().map(id=>{const n=curRoute().nodes[id];return n?BIOMES[n.biome].n:''}).filter((b,i,a)=>b&&a[i-1]!==b).join(' → ');
  $('winPath').textContent=path?`La tua strada: ${path}`:'';$('winShare').textContent=`PORTALI PERDUTI · ${P.name} il ${pcl().n}\nHo sconfitto il Re dei Portali!\nStrada: ${path}\nRango ${RANKS[rankIdx(P.lvl)][0]}, livello ${P.lvl}\nTu che strada sceglieresti?`;
  $('btnWinNew').textContent=`Nuovo viaggio (difficoltà +${ng})`;$('scWin').hidden=false;$('hud').hidden=true;$('touch').hidden=true}
$('btnWinNew').onclick=()=>{P.ng=(P.ng||0)+1;P.route={seed:(Math.random()*1e9)|0,cur:null,hist:[]};ROUTE=null;checkpoint=0;$('scWin').hidden=true;mode='play';if(MP.on)mpLeave();else startCamp();saveGame();showTouch();banner('Un nuovo viaggio!','I MOSTRI SONO PIÙ FORTI',2600)};
$('btnWinShare').onclick=()=>{const t=$('winShare').textContent;try{navigator.clipboard.writeText(t).then(()=>$('btnWinShare').textContent='Copiato')}catch(e){}};
