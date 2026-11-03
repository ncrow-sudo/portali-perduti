"use strict";
// ================= Basics =================
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,k)=>a+(b-a)*k,rr=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let srng=Math.random;const sr=()=>srng(),sri=(a,b)=>a+Math.floor(sr()*(b-a+1)),spick=a=>a[Math.floor(sr()*a.length)];
function sshuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(sr()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const store={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const angDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
const IS_MOBILE=matchMedia('(pointer:coarse)').matches;
const TS=1.5,WALLH=4.6;
function hash(x,y,s){let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296}
function vn(x,y,sc,s,p){const pp=p/sc;x/=sc;y/=sc;const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,w=v=>((v%pp)+pp)%pp;
  const a=hash(w(x0),w(y0),s),b=hash(w(x0+1),w(y0),s),c=hash(w(x0),w(y0+1),s),d=hash(w(x0+1),w(y0+1),s),sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy);return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}
const fbm=(x,y,s,p)=>vn(x,y,p/4,s,p)*.5+vn(x,y,p/8,s+1,p)*.3+vn(x,y,p/16,s+2,p)*.2;

// ================= Renderer =================
const glc=$('gl'),uic=$('ui'),ux=uic.getContext('2d');
const renderer=new THREE.WebGLRenderer({canvas:glc,antialias:!IS_MOBILE,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,IS_MOBILE?1:1.5));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=IS_MOBILE?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;
renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(62,1,.1,500);
const hemi=new THREE.HemisphereLight(0xcfe6ff,0x40502a,.6);scene.add(hemi);
const amb=new THREE.AmbientLight(0xffffff,.05);scene.add(amb);
const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.castShadow=true;const SM=IS_MOBILE?1024:2048;sun.shadow.mapSize.set(SM,SM);
Object.assign(sun.shadow.camera,{left:-24,right:24,top:24,bottom:-24,near:1,far:120});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
scene.fog=new THREE.FogExp2(0xa8c4a8,.018);
const playerLight=new THREE.PointLight(0xffb060,0,14,1.6);scene.add(playerLight);
const torchLights=(IS_MOBILE?[0,1]:[0,1,2,3]).map(()=>{const l=new THREE.PointLight(0xff9040,0,11,1.8);scene.add(l);return l});
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();uic.width=innerWidth;uic.height=innerHeight}
addEventListener('resize',resize);resize();

// ================= Procedural textures =================
function texFromCanvas(c,srgb=true,rep=1){const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep,rep);if(srgb)t.encoding=THREE.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy?Math.min(8,renderer.capabilities.getMaxAnisotropy()):4;return t}
function pixTex(size,fn){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d'),id=g.createImageData(size,size),d=id.data,b=document.createElement('canvas');b.width=b.height=size;const bg=b.getContext('2d'),bid=bg.createImageData(size,size),bd=bid.data;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=fn(x,y),i=(y*size+x)*4;d[i]=clamp(r[0],0,255);d[i+1]=clamp(r[1],0,255);d[i+2]=clamp(r[2],0,255);d[i+3]=r[3]==null?255:r[3];const h=clamp(r[4]==null?(r[0]+r[1]+r[2])/3:r[4],0,255);bd[i]=bd[i+1]=bd[i+2]=h;bd[i+3]=255}
  g.putImageData(id,0,0);bg.putImageData(bid,0,0);return{c,b}}
const TEX={};
function buildTextures(){
  const S=256;
  // mossy temple blocks
  let r=pixTex(S,(x,y)=>{const row=Math.floor(y/64),ox=row%2?64:0,bx=(x+ox)%128,by=y%64;const edge=Math.min(bx,127-bx,by,63-by);
    const n=fbm(x,y,3,S),stone=[118,116,100].map(v=>v*(.75+n*.45)*(.9+hash(Math.floor((x+ox)/128),row,9)*.2));
    if(edge<3)return[38,36,30,255,30];let c=stone,h=150+n*80-(edge<8?(8-edge)*8:0);
    const m=fbm(x+50,y,7,S)+(y/S)*.35;if(m>.62){const k=clamp((m-.62)*5,0,1);c=c.map((v,i)=>lerp(v,[58,104,42][i]*(.8+n*.4),k));h-=k*20}
    if(Math.abs(fbm(x,y,11,S)-.5)<.008)c=c.map(v=>v*.7),h-=30;return[...c,255,h]});
  TEX.wall=texFromCanvas(r.c,true);TEX.wallB=texFromCanvas(r.b,false);
  r=pixTex(S,(x,y)=>{const cx=Math.floor(x/128),cy=Math.floor(y/128),jx=(x+(cy%2)*64)%128,jy=y%128,edge=Math.min(jx,127-jx,jy,127-jy),n=fbm(x,y,21,S);
    if(edge<3){const g=vn(x,y,8,22,S);return g>.5?[52,98,40,255,60]:[46,40,32,255,30]}const v=(.75+n*.4)*(.88+hash(cx,cy,5)*.24);return[134*v,128*v,108*v,255,140+n*90]});
  TEX.floor=texFromCanvas(r.c,true);TEX.floorB=texFromCanvas(r.b,false);
  r=pixTex(S,(x,y)=>{const n=fbm(x,y,31,S),g=vn(x,y,32,32,S)*.6+vn(x,y,8,33,S)*.4,bl=hash(x,y,34);const k=clamp((g-.35)*3,0,1);const gr=[58+n*30+bl*25,96+n*40+bl*30,36+n*14],di=[96+n*30,76+n*24,52+n*16];const c=gr.map((v,i)=>lerp(di[i],v,k));return[...c,255,80+n*90+bl*40]});
  TEX.grass=texFromCanvas(r.c,true,1);TEX.grassB=texFromCanvas(r.b,false,1);
  r=pixTex(128,(x,y)=>{const n=vn(x,y*.25,4,41,128);const v=.6+n*.5+Math.sin(x*.4)*.06;return[96*v,66*v,40*v,255,120*v]});TEX.bark=texFromCanvas(r.c,true);
  r=pixTex(128,(x,y)=>{const n=vn(x,y,8,42,128),wx=(x+Math.floor(y/16)*8)%16,wv=Math.abs(wx-8)<6;const v=(.7+n*.4)*(wv?1:.75)*((y%16<2)?.6:1);return[210*v,160*v,80*v,255,v*200]});TEX.wicker=texFromCanvas(r.c,true);
  r=pixTex(128,(x,y)=>{const n=vn(x,y,4,43,128),pl=Math.floor(x/32);const v=(.7+n*.3)*(.85+hash(pl,0,44)*.3)*(x%32<2?.5:1);return[150*v,104*v,62*v,255,v*180]});TEX.wood=texFromCanvas(r.c,true);
  r=pixTex(128,(x,y)=>{const n=fbm(x,y,51,128),s=Math.sin((x+n*30)*.2+y*.05);return[60+s*20+n*30,120+s*30+n*40,160+n*40,255]});TEX.water=texFromCanvas(r.c,true);
  r=pixTex(128,(x,y)=>{const n=vn(x,y*.3,6,61,128),s=Math.sin(x*.5+n*6);return[200+s*40,230+s*20,255,170+s*60]});TEX.fall=texFromCanvas(r.c,true);
  // fern / vine sprites drawn with paths
  const fc=document.createElement('canvas');fc.width=fc.height=128;const fg=fc.getContext('2d');
  for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*.32,L=40+Math.random()*20;fg.save();fg.translate(64,124);fg.rotate(a+Math.PI/2);fg.strokeStyle='#2f6a24';fg.lineWidth=2;fg.beginPath();fg.moveTo(0,0);fg.quadraticCurveTo(6,-L*.5,0,-L*1.6);fg.stroke();
    for(let k=1;k<12;k++){const yy=-k*L*.13,w=10*(1-k/13);fg.fillStyle=k%2?'#4f9a3a':'#3f8a30';fg.beginPath();fg.ellipse(-w*.6,yy,w*.6,2.2,-.5,0,7);fg.ellipse(w*.6,yy,w*.6,2.2,.5,0,7);fg.fill()}fg.restore()}
  TEX.fern=new THREE.CanvasTexture(fc);TEX.fern.encoding=THREE.sRGBEncoding;
  const vc=document.createElement('canvas');vc.width=64;vc.height=256;const vg=vc.getContext('2d');for(let s=0;s<3;s++){let x=10+s*20;vg.strokeStyle='#2a5a1e';vg.lineWidth=2;vg.beginPath();vg.moveTo(x,0);for(let y=0;y<256;y+=8){x+=Math.sin(y*.05+s)*2;vg.lineTo(x,y)}vg.stroke();
    for(let y=6;y<256;y+=10){vg.fillStyle=['#3c7a2c','#4f9a3a','#2f6a24'][(y/10|0)%3];vg.beginPath();vg.ellipse(10+s*20+Math.sin(y*.05+s)*6+(y%20?5:-5),y,5,3,y%20?.6:-.6,0,7);vg.fill()}}
  TEX.vine=new THREE.CanvasTexture(vc);TEX.vine.encoding=THREE.sRGBEncoding;
  const dc=document.createElement('canvas');dc.width=dc.height=64;const dg=dc.getContext('2d');const grd=dg.createRadialGradient(32,32,0,32,32,32);grd.addColorStop(0,'#fff');grd.addColorStop(.4,'#fffb');grd.addColorStop(1,'#fff0');dg.fillStyle=grd;dg.fillRect(0,0,64,64);TEX.dot=new THREE.CanvasTexture(dc);
  const pc=document.createElement('canvas');pc.width=pc.height=128;const pg=pc.getContext('2d');for(let i=0;i<120;i++){const a=i*.35,rr_=i*.45;pg.fillStyle=`hsla(${270+i%40},90%,${50+(i%3)*12}%,.7)`;pg.beginPath();pg.arc(64+Math.cos(a)*rr_,64+Math.sin(a)*rr_,6,0,7);pg.fill()}TEX.portal=new THREE.CanvasTexture(pc);TEX.portal.encoding=THREE.sRGBEncoding;
}
buildTextures();
const M={};
function std(o){return new THREE.MeshStandardMaterial(o)}
function buildMaterials(){
  M.wall=std({map:TEX.wall,bumpMap:TEX.wallB,bumpScale:.06,roughness:.92});
  M.floor=std({map:TEX.floor,bumpMap:TEX.floorB,bumpScale:.04,roughness:.9});
  M.grass=std({map:TEX.grass,bumpMap:TEX.grassB,bumpScale:.05,roughness:.95});TEX.grass.repeat.set(140,140);TEX.grassB.repeat.set(140,140);
  M.bark=std({map:TEX.bark,roughness:.95});M.leaf=std({color:0x3a7a2e,roughness:.8});M.leaf2=std({color:0x2c6424,roughness:.8});M.leaf3=std({color:0x4c8a34,roughness:.8});
  M.wicker=std({map:TEX.wicker,roughness:.9});M.wood=std({map:TEX.wood,roughness:.85});M.dark=std({color:0x1a1612,roughness:.9});
  M.gold=std({color:0xffc54a,metalness:.85,roughness:.3,emissive:0x3a2600});M.iron=std({color:0x6a6e76,metalness:.8,roughness:.45});M.steel=std({color:0xd8dee6,metalness:.9,roughness:.22});
  M.water=std({map:TEX.water,color:0x6fb6d8,transparent:true,opacity:.78,roughness:.08,metalness:.25});
  M.fall=new THREE.MeshBasicMaterial({map:TEX.fall,transparent:true,opacity:.85,color:0xd8f0ff});
  M.fern=std({map:TEX.fern,alphaTest:.5,side:THREE.DoubleSide,roughness:.9});M.vine=std({map:TEX.vine,alphaTest:.5,side:THREE.DoubleSide,roughness:.9});
  M.flame=new THREE.MeshBasicMaterial({color:0xff7a10,toneMapped:false,transparent:true,opacity:.92});M.flame2=new THREE.MeshBasicMaterial({color:0xffe060,toneMapped:false});
  M.pit=new THREE.MeshBasicMaterial({color:0x050404});M.portal=new THREE.MeshBasicMaterial({map:TEX.portal,transparent:true,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
  M.red=std({color:0xd03a2a,roughness:.6});M.stone=std({map:TEX.wall,roughness:.95,color:0xcfc8b8});
  M.cloth=[0xc8483a,0x3a78c8,0xd8b04a,0x4aa060].map(c=>std({color:c,roughness:.95,side:THREE.DoubleSide}));
}
buildMaterials();

// ================= Sky, day/night, weather =================
const skyU={top:{value:new THREE.Color()},hor:{value:new THREE.Color()},sunDir:{value:new THREE.Vector3(0,1,0)},sunCol:{value:new THREE.Color()},stars:{value:0},cloud:{value:0},time:{value:0},flash:{value:0}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(400,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:skyU,
  vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform vec3 top,hor,sunCol,sunDir;uniform float stars,cloud,time,flash;varying vec3 vD;
  float h(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,45.164)))*43758.5453);}
  float n3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
  void main(){vec3 d=normalize(vD);float y=max(d.y,0.);vec3 c=mix(hor,top,pow(y,.45));
   float s=max(dot(d,normalize(sunDir)),0.);c+=sunCol*(pow(s,900.)*6.+pow(s,10.)*.3);
   float st=step(.9975,h(floor(d*260.)));c+=vec3(st)*stars*smoothstep(0.,.15,y);
   vec3 q=d/(d.y+.25);float cl=n3(q*vec3(1.6,1.,1.6)+vec3(time*.012,0.,time*.004))*.6+n3(q*4.+vec3(time*.02))*.4;
   cl=smoothstep(.62-cloud*.42,.95,cl)*smoothstep(0.,.18,y);vec3 cc=mix(vec3(1.),vec3(.45,.48,.52),cloud)*(.25+.75*clamp(length(sunCol),0.,1.4));
   c=mix(c,cc,cl*(.55+cloud*.45));c=mix(c,hor*.85,step(d.y,0.));c+=vec3(.7,.75,1.)*flash;gl_FragColor=vec4(c,1.);}`}));
sky.renderOrder=-1;scene.add(sky);
let dayT=.3;const DAYLEN=420;
const WEATHER={sereno:{cloud:.05,rain:0,snow:0,fog:0,storm:0,n:'Sereno'},nuvoloso:{cloud:.6,rain:0,snow:0,fog:.15,storm:0,n:'Nuvoloso'},pioggia:{cloud:.85,rain:1,snow:0,fog:.25,storm:0,n:'Pioggia'},
  temporale:{cloud:1,rain:1,snow:0,fog:.3,storm:1,n:'Temporale'},nebbia:{cloud:.5,rain:0,snow:0,fog:1,storm:0,n:'Nebbia'},neve:{cloud:.65,rain:0,snow:1,fog:.3,storm:0,n:'Neve'}};
const Wc={cloud:.05,rain:0,snow:0,fog:0,storm:0};let wName='sereno',wTimer=50,snowCover=0,wetness=0,flashT=0,nextBolt=8;
function setWeather(n,instant){wName=n;if(instant)Object.assign(Wc,WEATHER[n]);wTimer=rr(70,120);$('clock')&&updClock()}
function chooseWeather(){const bw=typeof LV!=='undefined'&&LV&&!LV.camp&&LV.biome&&BIOMES[LV.biome]?BIOMES[LV.biome].wx:null;let opts=(bw||[['sereno',4],['nuvoloso',2.2],['pioggia',1.1],['temporale',.6],['nebbia',1.3],['neve',1]]).filter(o=>o[0]!==wName);if(!opts.length)opts=[['sereno',1]];let s=opts.reduce((a,o)=>a+o[1],0)*Math.random();for(const o of opts){s-=o[1];if(s<=0)return o[0]}return'sereno'}
const night=()=>{const e=Math.sin((dayT-.25)*Math.PI*2);return clamp(-e*4+.3,0,1)};
function phaseName(){const e=Math.sin((dayT-.25)*Math.PI*2);if(e>.25)return'Giorno';if(e>-.08)return dayT<.5?'Alba':'Tramonto';return'Notte'}
function updClock(){$('clock').textContent=`${phaseName()} · ${WEATHER[wName].n}`}
const C3=(h)=>new THREE.Color(h);
const SKYC={dayTop:C3(0x3d82d6),dayHor:C3(0xcfe8d0),setTop:C3(0x4a4e8e),setHor:C3(0xff9a60),nightTop:C3(0x04060f),nightHor:C3(0x16203a),grayTop:C3(0x5a6470),grayHor:C3(0x9aa2a6)};
const tmpC=new THREE.Color(),tmpC2=new THREE.Color();
function updSky(dt,focus){dayT=(dayT+dt/DAYLEN)%1;skyU.time.value+=dt;
  wTimer-=dt;if(wTimer<=0){setWeather(chooseWeather());if(mode==='play')toast(`Il tempo cambia: ${WEATHER[wName].n.toLowerCase()}`)}
  const tg=WEATHER[wName],k=Math.min(1,dt*.18);for(const key of['cloud','rain','snow','fog','storm'])Wc[key]=lerp(Wc[key],tg[key],k);
  snowCover=clamp(snowCover+(Wc.snow>.5?dt*.03:-dt*.05),0,1);wetness=clamp(wetness+(Wc.rain>.5?dt*.08:-dt*.03),0,1);
  const ang=(dayT-.25)*Math.PI*2,el=Math.sin(ang),dayK=clamp(el*3+.2,0,1),setK=clamp(1-Math.abs(el)*5,0,1)*(el>-.2?1:0),nk=night();
  const sd=new THREE.Vector3(Math.cos(ang)*.85,el,.4).normalize();skyU.sunDir.value.copy(sd);
  const top=tmpC.copy(SKYC.nightTop).lerp(SKYC.dayTop,dayK).lerp(SKYC.setTop,setK*.6),hor=tmpC2.copy(SKYC.nightHor).lerp(SKYC.dayHor,dayK).lerp(SKYC.setHor,setK*.75);
  top.lerp(SKYC.grayTop,Wc.cloud*.7*dayK);hor.lerp(SKYC.grayHor,Wc.cloud*.6*dayK);hor.lerp(C3(0xbfc8c0),Wc.fog*.5*(1-nk*.8));if(typeof LV!=='undefined'&&LV&&LV.fogTint&&mode==='play')hor.lerp(C3(LV.fogTint),.35*dayK);
  skyU.top.value.copy(top);skyU.hor.value.copy(hor);skyU.sunCol.value.setRGB(1.6,1.3+dayK*.2-setK*.4,1-setK*.5).multiplyScalar(dayK*(1-Wc.cloud*.8));
  skyU.stars.value=nk*(1-Wc.cloud);skyU.cloud.value=Wc.cloud;
  // lights
  const moon=el<0;const ld=moon?sd.clone().negate():sd;sun.position.copy(focus).addScaledVector(ld,60);sun.target.position.copy(focus);
  sun.intensity=moon?.22*(1-Wc.cloud*.6):(1.5*dayK*(1-Wc.cloud*.65));sun.color.setRGB(moon?.6:1,moon?.7:.92-setK*.25,moon?1:.82-setK*.45);
  hemi.intensity=.18+.5*dayK*(1-Wc.cloud*.3);hemi.color.copy(hor).lerp(C3(0xffffff),.3);hemi.groundColor.setRGB(.2+.15*dayK,.24+.15*dayK,.14);
  const fogBase=.012+Wc.fog*.055+Wc.rain*.01+nk*.006;scene.fog.density=fogBase;scene.fog.color.copy(hor).multiplyScalar(.9);
  renderer.toneMappingExposure=.85+.35*dayK;
  // lightning
  flashT=Math.max(0,flashT-dt*3);amb.intensity=.05+flashT*2.5;skyU.flash.value=flashT*.6;
  if(Wc.storm>.5&&mode==='play'){nextBolt-=dt;if(nextBolt<=0){nextBolt=rr(6,14);lightning()}}
  // wet / snow look
  for(const m of(M.weatherMats||[M.floor,M.wall,M.grass])){const w_=!!m.userData.wall;m.roughness=lerp(.92,.35,wetness*(w_?.6:1));m.emissive.setScalar(snowCover*(w_?.18:.42));m.color.setScalar(1-wetness*.25)}
  sky.position.copy(camera.position)}
// precipitation
const RAIN_N=IS_MOBILE?700:1400,SNOW_N=IS_MOBILE?600:1200;
const rainGeo=new THREE.BufferGeometry(),rainPos=new Float32Array(RAIN_N*6);rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));
const rain=new THREE.LineSegments(rainGeo,new THREE.LineBasicMaterial({color:0xaabbcc,transparent:true,opacity:.5}));rain.frustumCulled=false;scene.add(rain);
const snowGeo=new THREE.BufferGeometry(),snowPos=new Float32Array(SNOW_N*3);snowGeo.setAttribute('position',new THREE.BufferAttribute(snowPos,3));
const snow=new THREE.Points(snowGeo,new THREE.PointsMaterial({color:0xffffff,size:.16,map:TEX.dot,transparent:true,depthWrite:false,opacity:.9}));snow.frustumCulled=false;scene.add(snow);
for(let i=0;i<RAIN_N;i++){const x=rr(-18,18),y=rr(0,20),z=rr(-18,18);rainPos.set([x,y,z,x,y-.6,z],i*6)}for(let i=0;i<SNOW_N;i++)snowPos.set([rr(-18,18),rr(0,16),rr(-18,18)],i*3);
function updPrecip(dt,c){rain.visible=Wc.rain>.03;snow.visible=Wc.snow>.03;rain.material.opacity=.45*Wc.rain;snow.material.opacity=.95*Wc.snow;
  if(rain.visible){for(let i=0;i<RAIN_N;i++){const o=i*6;let y=rainPos[o+1]-dt*26;if(y<-1){y=rr(14,22);rainPos[o]=rr(-18,18);rainPos[o+2]=rr(-18,18)}rainPos[o+1]=y;rainPos[o+3]=rainPos[o]+.08;rainPos[o+4]=y-.7;rainPos[o+5]=rainPos[o+2]}rainGeo.attributes.position.needsUpdate=true;rain.position.set(c.x,c.y-6,c.z)}
  if(snow.visible){const tt=skyU.time.value;for(let i=0;i<SNOW_N;i++){const o=i*3;let y=snowPos[o+1]-dt*(1.2+(i%5)*.15);snowPos[o]+=Math.sin(tt*.8+i)*dt*.4;if(y<-1){y=rr(12,16);snowPos[o]=rr(-18,18);snowPos[o+2]=rr(-18,18)}snowPos[o+1]=y}snowGeo.attributes.position.needsUpdate=true;snow.position.set(c.x,c.y-5,c.z)}}

// ================= Particles =================
const PN=900,pGeo=new THREE.BufferGeometry(),pPos=new Float32Array(PN*3),pCol=new Float32Array(PN*3);pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));
const pts=new THREE.Points(pGeo,new THREE.PointsMaterial({size:.22,map:TEX.dot,vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));pts.frustumCulled=false;scene.add(pts);
const PA=[];let pIdx=0;
function burst(x,y,z,col,n=10,sp=3,life=.6,grav=6){const c=new THREE.Color(col);for(let i=0;i<n;i++){const p={x,y,z,vx:rr(-1,1)*sp,vy:rr(.2,1.2)*sp,vz:rr(-1,1)*sp,r:c.r,g:c.g,b:c.b,life:life*rr(.6,1.2),ml:life,grav};PA[pIdx]=p;pIdx=(pIdx+1)%PN}}
function updParts(dt){for(let i=0;i<PN;i++){const p=PA[i],o=i*3;if(!p||p.life<=0){pPos[o+1]=-999;continue}p.life-=dt;p.vy-=p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;const g=groundH(p.x,p.z);if(p.y<g){p.y=g;p.vy*=-.3;p.vx*=.6;p.vz*=.6}
  pPos[o]=p.x;pPos[o+1]=p.y;pPos[o+2]=p.z;const k=clamp(p.life/p.ml,0,1);pCol[o]=p.r*k;pCol[o+1]=p.g*k;pCol[o+2]=p.b*k}pGeo.attributes.position.needsUpdate=true;pGeo.attributes.color.needsUpdate=true}
