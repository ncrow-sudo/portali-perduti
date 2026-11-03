
// ================= Floor styles (biomes) & extra materials =================
const STYLES=[{n:'Giungla',stone:[118,116,100],moss:[58,104,42],mossK:.62,floor:[134,128,108],fog:0x9fbfa0},
  {n:'Tempio d\'Oro',stone:[176,146,98],moss:[110,120,60],mossK:.9,floor:[184,158,112],fog:0xd8c8a0,gold:true},
  {n:'Caverna dei Funghi',stone:[92,88,108],moss:[86,118,112],mossK:.74,floor:[70,68,92],fog:0x5a5a8a},
  {n:'Deserto',stone:[196,160,108],moss:[232,200,146],mossK:.66,floor:[214,182,128],fog:0xf0d098},
  {n:'Isole',stone:[208,200,180],moss:[80,150,140],mossK:.7,floor:[226,210,170],fog:0xa8d8e8},
  {n:'Montagne',stone:[122,126,136],moss:[236,240,246],mossK:.58,floor:[152,154,162],fog:0xc8d4e4},
  {n:'Città',stone:[164,86,62],moss:[96,96,86],mossK:.86,floor:[132,128,122],fog:0xc0b4a8,brick:true,cobble:true}];
function styleWall(st,seed){const S=256,BW=st.brick?64:128,BH=st.brick?32:64;return pixTex(S,(x,y)=>{const row=Math.floor(y/BH),ox=row%2?BW/2:0,bx=(x+ox)%BW,by=y%BH,edge=Math.min(bx,BW-1-bx,by,BH-1-by);
  const n=fbm(x,y,3+seed,S),c0=st.stone.map(v=>v*(.75+n*.45)*(.88+hash(Math.floor((x+ox)/BW),row,9+seed)*.24));if(edge<(st.brick?2:3))return st.brick?[190,180,160,255,40]:[38,36,30,255,30];
  let c=c0,h=150+n*80-(edge<8?(8-edge)*8:0);if(st.gold&&by>28&&by<34&&bx%32<20)c=[200,160,60],h+=30;
  const m=fbm(x+50,y,7+seed,S)+(y/S)*.35;if(m>st.mossK){const k=clamp((m-st.mossK)*5,0,1);c=c.map((v,i)=>lerp(v,st.moss[i]*(.8+n*.4),k));h-=k*20}
  if(Math.abs(fbm(x,y,11+seed,S)-.5)<.008)c=c.map(v=>v*.7),h-=30;return[...c,255,h]})}
function styleFloor(st,seed){const S=256,T=st.cobble?42:128;return pixTex(S,(x,y)=>{const cx=Math.floor(x/T),cy=Math.floor(y/T),jx=(x+(cy%2)*T/2)%T,jy=y%T,edge=Math.min(jx,T-1-jx,jy,T-1-jy),n=fbm(x,y,21+seed,S);
  if(edge<(st.cobble?2:3)){const g=vn(x,y,8,22,S);return g>.5?[...st.moss.map(v=>v*.9),255,60]:[46,40,32,255,30]}const v=(.75+n*.4)*(.86+hash(cx,cy,5+seed)*.28);return[st.floor[0]*v,st.floor[1]*v,st.floor[2]*v,255,140+n*90]})}
const STYLE_M=[];
function styleMat(i){if(STYLE_M[i])return STYLE_M[i];const st=STYLES[i],w=styleWall(st,i*13),f=styleFloor(st,i*7);
  const o={w:std({map:texFromCanvas(w.c),bumpMap:texFromCanvas(w.b,false),bumpScale:.06,roughness:.92}),f:std({map:texFromCanvas(f.c),bumpMap:texFromCanvas(f.b,false),bumpScale:.04,roughness:.9})};
  o.w.userData.wall=true;M.weatherMats.push(o.w,o.f);STYLE_M[i]=o;return o}
M.wall.userData.wall=true;
{const g=pixTex(256,(x,y)=>{const n=fbm(x,y,61,256),b=hash(x,y,62);return[56+n*30+b*20,92+n*40+b*24,34+n*12,255,90+n*80+b*40]});M.grassT=std({map:texFromCanvas(g.c),bumpMap:texFromCanvas(g.b,false),bumpScale:.05,roughness:.95})}
{const g=pixTex(256,(x,y)=>{const n=fbm(x,y,71,256),sp=hash(x>>2,y>>2,72)>.985;return sp?[120,220,255,255,200]:[40+n*20,38+n*18,58+n*24,255,60+n*60]});M.caveF=std({map:texFromCanvas(g.c),roughness:.9,emissiveMap:texFromCanvas(g.c),emissive:0x223344})}
{const g=pixTex(128,(x,y)=>{const pl=Math.floor(y/16),n=vn(x,y*.3,4,81,128);const v=(.65+n*.35)*(.85+hash(pl,0,82)*.3)*(y%16<2?.45:1);return[150*v,108*v,64*v,255,v*180]});M.plank=std({map:texFromCanvas(g.c),roughness:.85})}
M.rope=std({color:0xc8a870,roughness:.9});M.thatch=std({color:0xb89048,roughness:1});M.mud=std({color:0x8a6a48,roughness:.95});
M.capGlow=[0x48e0ff,0xff60d0,0x90ff60].map(c=>std({color:c,emissive:c,emissiveIntensity:.9,roughness:.5}));M.stem=std({color:0xe8e0d0,roughness:.8});
M.weatherMats=[M.grass,M.grassT];
// ground for the world outside the walls, per biome (lazy)
const GROUND_M={};
function groundMat(kind){if(GROUND_M[kind])return GROUND_M[kind];let m;
  if(kind==='grass')m=M.grass;
  else if(kind==='sea'){const t=TEX.water.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(40,40);m=std({map:t,color:0x3a9ac8,roughness:.12,metalness:.2})}
  else{const pal={sand:[[226,196,140],[200,166,112]],snow:[[236,240,246],[200,210,226]],cobble:[[128,124,118],[96,92,88]],ash:[[60,56,70],[40,38,50]]}[kind];
    const g=pixTex(256,(x,y)=>{const n=fbm(x,y,91+kind.length,256),r=vn(x,y*(kind==='sand'?3:1),6,92,256);const c=pal[0].map((v,i)=>lerp(pal[1][i],v,n*.7+r*.3));return[...c,255,80+n*120]});
    m=std({map:texFromCanvas(g.c),bumpMap:texFromCanvas(g.b,false),bumpScale:.05,roughness:.95});m.map.repeat.set(30,30);m.bumpMap.repeat.set(30,30);M.weatherMats.push(m)}
  GROUND_M[kind]=m;return m}
const FERN_M={};function fernMat(tint){if(!tint)return M.fern;if(!FERN_M[tint]){FERN_M[tint]=M.fern.clone();FERN_M[tint].color=new THREE.Color(tint)}return FERN_M[tint]}
// biomes: what the route map offers
const BIOMES={
  giungla:{n:'Giungla',style:0,col:'#4f9a3a',ground:'grass',tree:'jungle',pool:['fungo','pianta','ragno','monkey','fatuo'],wx:[['sereno',3],['nuvoloso',2],['pioggia',2],['temporale',.8],['nebbia',1.5]],themes:['rovine','rovine','giardino','funghi','villaggio','tempio'],want:['river','lago','tree','ponte','stairs']},
  deserto:{n:'Deserto',style:3,col:'#e0a850',ground:'sand',tree:'cactus',fern:'#c8a860',pool:['ragno','draghetto','golem','fatuo'],wx:[['sereno',7],['nuvoloso',1],['nebbia',.5]],themes:['rovine','tempio','tempio','villaggio'],want:['pits','traps','pillars','stairs']},
  isole:{n:'Isole',style:4,col:'#36a6cc',ground:'sea',tree:'palm',pool:['crab','pianta','draghetto','fungo'],wx:[['sereno',4],['nuvoloso',2],['pioggia',1.5],['temporale',.8]],themes:['giardino','villaggio','rovine'],want:['lago','ponte','river','lago','ponte']},
  montagne:{n:'Montagne',style:5,col:'#8f9fbc',ground:'snow',tree:'pine',fern:'#9ab0a0',pool:['golem','ragno','fatuo','draghetto'],wx:[['neve',4],['nuvoloso',2],['sereno',2],['nebbia',1.5]],themes:['rovine','tempio','funghi'],want:['stairs','pits','ponte','stairs']},
  citta:{n:'Città',style:6,col:'#c4684e',ground:'cobble',tree:'house',fern:'#7a9a5a',pool:['monkey','fungo','draghetto','golem'],wx:[['sereno',3],['nuvoloso',2],['pioggia',1.2],['nebbia',1]],themes:['villaggio','villaggio','giardino','tempio'],want:['pillars','traps','tree','river']},
  tempio:{n:'Tempio d\'Oro',style:1,col:'#d8b040',ground:'sand',tree:'palm',pool:['golem','ragno','fatuo','crab'],wx:[['sereno',4],['nuvoloso',2],['nebbia',1]],themes:['tempio','tempio','rovine'],want:['traps','pillars','stairs','pits']},
  caverna:{n:'Caverna dei Funghi',style:2,col:'#7a5ac8',ground:'ash',tree:'pine',fern:'#6a8aa0',pool:['fungo','fatuo','ragno','pianta'],wx:[['nebbia',3],['nuvoloso',2],['pioggia',1]],themes:['funghi','funghi','rovine'],want:['pits','river','lago','ponte']}};
