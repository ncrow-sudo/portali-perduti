
// ================= Models =================
function mesh(geo,mat,x=0,y=0,z=0,shadow=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=shadow;m.receiveShadow=true;return m}
const cyl=(rt,rb,h,s=10)=>new THREE.CylinderGeometry(rt,rb,h,s),sph=(r,w=14,h=10)=>new THREE.SphereGeometry(r,w,h),box=(w,h,d)=>new THREE.BoxGeometry(w,h,d),cone=(r,h,s=10)=>new THREE.ConeGeometry(r,h,s);
const LOOK={skin:['#f4d3b4','#e2b38c','#c98c5c','#a2683c','#7c4c2c','#50321e'],hair:['#2a1a10','#5a3a1a','#a8642a','#e8c878','#c8c8c8','#c83a2a','#3a5ac8'],
  shirt:['#6a8a4a','#3a6aa8','#a83a2a','#c8a050','#6a3a8a','#2e2e2e','#e8e0d0'],pants:['#5a4632','#2a3040','#6a6a5a','#3a2a1a','#8a7a5a'],shield:['#a83a2a','#3a6aa8','#c8a050','#2a7a4a','#6a3a8a']};
const BUILDS=['snello','normale','robusto'],HAIRS=['corti','lunghi','coda','cresta','calvo'],HATS=['nessuno','esploratore','bandana','elmo','cappuccio'];
function randLook(){return{build:pick(BUILDS),skin:ri(0,5),hairStyle:pick(HAIRS),hair:ri(0,6),hat:pick(HATS),shirt:ri(0,6),pants:ri(0,4),shield:ri(0,4)}}
const EYE_W=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.3}),EYE_H=new THREE.MeshBasicMaterial({color:0xffffff}),MOUTH_M=new THREE.MeshStandardMaterial({color:0x7a2a24,roughness:.6}),CHEEK_M=new THREE.MeshStandardMaterial({color:0xe88a80,roughness:.8}),BTN_M=new THREE.MeshStandardMaterial({color:0xe8d8a0,roughness:.4,metalness:.4}),SOLE_M=new THREE.MeshStandardMaterial({color:0x1e140c,roughness:.9});
function makeHumanoid(L,scale=1,o={}){
  const bw={snello:.86,normale:1,robusto:1.2}[L.build]||1,mats=[];const sm=(c,r=.8)=>{const m=std({color:c,roughness:r});mats.push(m);return m};
  const skin=sm(o.skinC||LOOK.skin[L.skin],.7),shirt=sm(o.shirtC||LOOK.shirt[L.shirt],.85),pants=sm(o.pantsC||LOOK.pants[L.pants],.9),boots=sm('#3a2616'),hairM=sm(LOOK.hair[L.hair]),belt=sm('#4a2e16',.6);
  const root=new THREE.Group(),hips=new THREE.Group();hips.position.y=.98;root.add(hips);const torso=new THREE.Group();hips.add(torso);
  torso.add(mesh(cyl(.2*bw,.16*bw,.5,12),shirt,0,.32,0));const ch=mesh(sph(.22*bw,14,10),shirt,0,.52,0);ch.scale.set(1,.5,.72);torso.add(ch);
  torso.add(mesh(cyl(.17*bw,.16*bw,.16,12),pants,0,.04,0));torso.add(mesh(cyl(.178*bw,.178*bw,.05,12),belt,0,.12,0));torso.add(mesh(box(.06,.05,.02),M.gold,0,.12,.17*bw));
  torso.add(mesh(cyl(.06,.07,.1,8),skin,0,.66,0));{const co=mesh(new THREE.TorusGeometry(.085,.025,6,14),shirt,0,.62,0);co.rotation.x=Math.PI/2;torso.add(co)}for(let b=0;b<3;b++)torso.add(mesh(sph(.014,6,4),BTN_M,0,.48-b*.11,.2*bw-.01*b,false));torso.add(mesh(box(.07,.07,.05),belt,.15*bw,.1,.08*bw));
  const head=new THREE.Group();head.position.y=.8;torso.add(head);const hd=mesh(sph(.15,16,12),skin);hd.scale.set(1,1.12,1.05);head.add(hd);
  const eyeM=std({color:0x1a120c,roughness:.3}),whiteM=EYE_W,hiM=EYE_H;for(const s of[-1,1]){const ew=mesh(sph(.032,10,8),whiteM,s*.056,.02,.128,false);ew.scale.set(1,1.1,.55);head.add(ew);head.add(mesh(sph(.02,8,6),eyeM,s*.056,.018,.142,false));head.add(mesh(sph(.007,6,4),hiM,s*.051,.026,.152,false));head.add(mesh(box(.05,.012,.02),hairM,s*.055,.06,.135,false));head.add(mesh(sph(.03,8,6),skin,s*.15,0,0,false))}
  {const n_=mesh(sph(.028,8,6),skin,0,-.015,.155,false);n_.scale.set(.9,1,1.1);head.add(n_)}{const mo=mesh(new THREE.TorusGeometry(.032,.008,4,10,Math.PI),MOUTH_M,0,-.06,.142,false);mo.rotation.z=Math.PI;head.add(mo)}for(const s of[-1,1]){const ck=mesh(sph(.024,8,6),CHEEK_M,s*.088,-.035,.118,false);ck.scale.set(1,.7,.4);head.add(ck)}
  const hs=L.hairStyle;if(hs!=='calvo'){const cap=mesh(new THREE.SphereGeometry(.165,16,10,0,Math.PI*2,0,Math.PI*.55),hairM,0,.03,-.005);cap.scale.set(1.02,1.12,1.08);head.add(cap);
    if(hs==='lunghi')head.add(mesh(box(.3,.32,.1),hairM,0,-.12,-.1));if(hs==='coda'){const c=mesh(cyl(.035,.02,.28,6),hairM,0,-.05,-.2);c.rotation.x=.5;head.add(c)}if(hs==='cresta'){const c=mesh(box(.05,.12,.3),hairM,0,.2,-.02);head.add(c)}}
  const hat=L.hat;if(hat==='esploratore'){const hm=sm('#7a5a34');head.add(mesh(cyl(.27,.27,.02,18),hm,0,.12,0));head.add(mesh(cyl(.15,.17,.13,14),hm,0,.19,0));head.add(mesh(cyl(.172,.172,.03,14),sm('#3a2416'),0,.15,0))}
  if(hat==='bandana')head.add(mesh(cyl(.168,.168,.06,14),sm('#c83a2a'),0,.08,0));if(hat==='elmo'){const h=mesh(new THREE.SphereGeometry(.18,16,10,0,Math.PI*2,0,Math.PI*.55),M.iron,0,.03,0);head.add(h);head.add(mesh(box(.03,.12,.06),M.iron,0,.02,.17))}
  if(hat==='cappuccio'){const c=mesh(cone(.21,.36,12),sm(LOOK.shirt[L.shirt]),0,.12,-.04);c.rotation.x=-.35;head.add(c)}
  const arm=s=>{const sh=new THREE.Group();sh.position.set(s*.25*bw,.56,0);torso.add(sh);sh.add(mesh(sph(.075*bw,10,8),shirt));sh.add(mesh(cyl(.068*bw,.056*bw,.3,8),shirt,0,-.15,0));
    const el=new THREE.Group();el.position.y=-.3;sh.add(el);el.add(mesh(cyl(.055,.046,.28,8),o.sleeves?shirt:skin,0,-.14,0));const hand=new THREE.Group();hand.position.y=-.3;el.add(hand);hand.add(mesh(box(.075,.09,.06),skin,0,-.02,0));hand.add(mesh(box(.025,.05,.03),skin,s*-.045,0,.02));return{sh,el,hand}};
  const leg=s=>{const hip=new THREE.Group();hip.position.set(s*.1*bw,0,0);hips.add(hip);hip.add(mesh(cyl(.088*bw,.07*bw,.44,8),pants,0,-.22,0));const knee=new THREE.Group();knee.position.y=-.44;hip.add(knee);
    knee.add(mesh(cyl(.066,.056,.4,8),pants,0,-.2,0));knee.add(mesh(box(.13,.12,.24),boots,0,-.43,.04));knee.add(mesh(box(.14,.03,.26),SOLE_M,0,-.5,.045));knee.add(mesh(cyl(.07,.07,.07,8),boots,0,-.35,0));return{hip,knee}};
  const H={root,hips,torso,head,armL:arm(1),armR:arm(-1),legL:leg(1),legR:leg(-1),mats,ph:Math.random()*6,bw};if(o.cls)try{addClassGear(H,o.cls,L)}catch(e){}root.scale.setScalar(.93*scale);return H}
const qTmp=new THREE.Quaternion(),qTmp2=new THREE.Quaternion(),eTmp=new THREE.Euler();
function orientChild(obj,ownerRoot,yaw,pitch,roll){obj.parent.updateWorldMatrix(true,false);obj.parent.getWorldQuaternion(qTmp).invert();eTmp.set(pitch,yaw,roll,'YXZ');qTmp2.setFromEuler(eTmp);ownerRoot.getWorldQuaternion(eQ);eQ.multiply(qTmp2);obj.quaternion.copy(qTmp.multiply(eQ))}
const eQ=new THREE.Quaternion();
// pose: {speed, atk:0..1|-1, atkKind, block:0..1, draw:0..1, cast:0..1, air, dance, dead, sit}
function animHuman(H,p,dt){const sp=clamp(p.speed/4,0,1.4);H.ph+=dt*(4+p.speed*2.2);const s=Math.sin(H.ph)*sp,c=Math.cos(H.ph);
  const L=(o,k)=>{const f=Math.min(1,dt*14);o.x=lerp(o.x,k.x||0,f);o.y=lerp(o.y,k.y||0,f);o.z=lerp(o.z,k.z||0,f)};
  if(p.dead){H.root.rotation.x=lerp(H.root.rotation.x,-Math.PI/2,Math.min(1,dt*6));H.hips.position.y=lerp(H.hips.position.y,.25,Math.min(1,dt*6));return}H.root.rotation.x=lerp(H.root.rotation.x,0,Math.min(1,dt*8));
  let lh={x:s*.7},rh={x:-s*.7},lk={x:Math.max(0,-Math.sin(H.ph))*sp*1.1},rk={x:Math.max(0,Math.sin(H.ph))*sp*1.1};
  let al={x:-s*.6,z:.08},ar={x:s*.6,z:-.08},el={x:-.25-sp*.2},er={x:-.25-sp*.2},tor={y:0,x:sp*.08,z:0},hy=.98+Math.abs(c)*.04*sp+Math.sin(H.ph*.5)*.008;
  if(p.sit){lh={x:-1.5};rh={x:-1.5};lk={x:1.5};rk={x:1.5};hy=.5}
  if(p.air){lh={x:-.6};rh={x:.3};lk={x:.9};rk={x:.3};al={x:-.4,z:.5};ar={x:-.4,z:-.5}}
  if(p.fp){ar={x:-1.05,z:-.2};er={x:-1.15};al={x:-.95,z:.35};el={x:-1}}
  if(p.block>0){al=p.fp?{x:-1.35,z:-.1}:{x:-1.25,z:-.45};el={x:p.fp?-.6:-.9}}
  if(p.draw>0){al={x:-1.5,z:-.05};el={x:0};ar={x:-1.5,z:.25};er={x:-1.7-p.draw*.4};tor={y:.35,x:0}}
  if(p.cast>0){ar={x:-1.6,z:.1};er={x:-.1}}
  if(p.atk>=0){const k=p.atk;if(p.atkKind==='spin'){tor={y:-k*Math.PI*2};ar={x:-1.5,z:-1.2};er={x:-.2}}
    else if(p.atkKind==='thrust'){ar={x:-1.5+(k<.4?.4:0),z:.05};er={x:k<.4?-1.4:-.05}}
    else{if(k<.35){const q=k/.35;ar={x:-2.5*q,z:-.6*q};er={x:-1.1*q};tor={y:.5*q}}else{const q=Math.min(1,(k-.35)/.3);ar={x:lerp(-2.5,.5,q),z:lerp(-.6,.5,q)};er={x:lerp(-1.1,-.1,q)};tor={y:lerp(.5,-.6,q)}}}}
  let hr=null;
  if(p.dance){const t=performance.now()/1000+H.ph*.3,mv=Math.floor(t/1.6)%4,b=Math.sin(t*9);
    if(mv===0){lh={x:-.3+Math.max(0,b)*.7,z:.15};rh={x:-.3+Math.max(0,-b)*.7,z:-.15};lk={x:Math.max(0,b)*.9};rk={x:Math.max(0,-b)*.9};al={x:-.6+b*.5,z:.6};ar={x:-.6-b*.5,z:-.6};el={x:-1.4};er={x:-1.4};tor={y:b*.5,x:.15};hy=.95+Math.abs(b)*.05}
    else if(mv===1){const w=Math.sin(t*7),q=Math.cos(t*7);hy=.5;al={x:-1.3,z:.3};el={x:-.2};ar={x:-.5,z:-1};er={x:-.4};lh={x:-1.4+w*.9,z:.3+q*.4};rh={x:-1.2-w*.9,z:-.3};lk={x:1.6};rk={x:1+q*.5};tor={y:w*.6,x:.6}}
    else if(mv===2){hr={x:Math.PI,y:t*14,z:0,spin:1};hy=1.02;lh={x:0,z:.75+Math.sin(t*14)*.15};rh={x:0,z:-.75-Math.sin(t*14)*.15};lk={x:.1};rk={x:.1};al={x:0,z:2.2};ar={x:0,z:-2.2};el={x:0};er={x:0};tor={y:0,x:0}}
    else{hr={x:0,y:.3,z:1.15};hy=.62;ar={x:0,z:-2.9};er={x:0};al={x:-1.2,z:.5};el={x:-1.6};lh={x:-1.3,z:.6};rh={x:-.6,z:.2};lk={x:1.5};rk={x:2};tor={y:.2,x:-.2,z:-.1}}}
  if(p.twist&&!p.dance&&!p.dead){tor={...tor,y:(tor.y||0)+p.twist*.65}}
  H.head.rotation.y=lerp(H.head.rotation.y,p.dance||p.dead?0:(p.twist||0)*.35,Math.min(1,dt*12));
  L(H.legL.hip.rotation,lh);L(H.legR.hip.rotation,rh);L(H.legL.knee.rotation,lk);L(H.legR.knee.rotation,rk);L(H.armL.sh.rotation,al);L(H.armR.sh.rotation,ar);L(H.armL.el.rotation,el);L(H.armR.el.rotation,er);L(H.torso.rotation,tor);
  {const f=Math.min(1,dt*10),hrot=H.hips.rotation;if(hr){hrot.x=lerp(hrot.x,hr.x,f);hrot.z=lerp(hrot.z,hr.z,f);if(hr.spin)hrot.y=hr.y;else hrot.y=lerp(hrot.y,hr.y,f)}else if(hrot.x||hrot.y||hrot.z){hrot.y=((hrot.y%6.2832)+9.4248)%6.2832-3.1416;hrot.x=lerp(hrot.x,0,f);hrot.y=lerp(hrot.y,0,f);hrot.z=lerp(hrot.z,0,f);if(Math.abs(hrot.x)+Math.abs(hrot.y)+Math.abs(hrot.z)<.002)hrot.set(0,0,0)}}
  H.hips.position.y=lerp(H.hips.position.y,hy,Math.min(1,dt*12))}
function flashMats(e,col){if(!e.mats)return;for(const m of e.mats){if(!m.emissive)continue;m.emissive.set(col)}}

// weapon meshes (handle at origin, pointing +z)
const RAR=[{n:'Comune',c:'#d8cfbf',m:1},{n:'Raro',c:'#4aa8ff',m:1.35},{n:'Epico',c:'#c06bff',m:1.8},{n:'Leggendario',c:'#ffb52e',m:2.5}];
const ELEM={fire:{n:'di Fuoco',c:'#ff6a2b',d:'brucia'},ice:{n:'di Ghiaccio',c:'#7fe3ff',d:'congela'},shock:{n:'del Fulmine',c:'#fff36b',d:'salta sui vicini'},poison:{n:'del Veleno',c:'#8dff5a',d:'avvelena'}};
function makeWeaponMesh(w){const g=new THREE.Group(),rc=RAR[w.rar].c,el=w.el?ELEM[w.el].c:null;const glow=el?new THREE.MeshStandardMaterial({color:el,emissive:el,emissiveIntensity:.8,metalness:.6,roughness:.3}):null;
  const blade=glow||M.steel,grip=M.wood,gem=new THREE.MeshStandardMaterial({color:rc,emissive:rc,emissiveIntensity:.5,roughness:.3});
  const z=(geo,mat,zz,x=0,y=0)=>{const m=mesh(geo,mat,x,y,zz);g.add(m);return m};const along=geo=>{geo.rotateX(Math.PI/2);return geo};
  switch(w.base){
    case'sword':z(along(cyl(.022,.025,.2,8)),grip,0);z(box(.22,.04,.04),M.gold,.11);z(sph(.03),gem,.11,0,.03);z(box(.06,.012,.82),blade,.53);z(along(cone(.03,.12,4)),blade,1);z(sph(.03),gem,-.11);break;
    case'daggers':z(along(cyl(.02,.022,.14,8)),grip,0);z(box(.12,.03,.03),M.gold,.08);z(box(.045,.01,.38),blade,.28);z(along(cone(.023,.08,4)),blade,.5);break;
    case'hammer':z(along(cyl(.026,.03,.95,8)),grip,.3);const hh=z(box(.22,.2,.36),glow||M.iron,.78);z(box(.1,.21,.37),gem,.78);break;
    case'whip':z(along(cyl(.025,.03,.24,8)),M.dark,0);for(let i=0;i<5;i++){const t=mesh(new THREE.TorusGeometry(.08-i*.008,.012,5,14),std({color:el||'#8a5a2a'}),0,0,.2+i*.012);g.add(t)}break;
    case'fish':{const b=z(sph(.12,14,10),std({color:0x4a8ad8,roughness:.4,metalness:.2}),.45);b.scale.set(.7,1,3.2);z(along(cone(.03,.5,8)),M.steel,1.05);const tail=z(cone(.12,.2,4),std({color:rc}),.05);tail.rotation.x=Math.PI/2;z(sph(.03),std({color:0xffffff}),.75,.06,.05);break}
    case'spring':z(along(cyl(.025,.03,.18,8)),grip,0);for(let i=0;i<7;i++)z(new THREE.TorusGeometry(.05,.01,5,12),M.steel,.12+i*.045);z(sph(.15,14,10),std({color:0xe0302a,roughness:.5}),.55).scale.set(1,1,1.2);z(cyl(.12,.12,.06,12),gem,.4).rotation.x=Math.PI/2;break;
    case'bow':{const arc=mesh(new THREE.TorusGeometry(.55,.028,6,24,Math.PI*1.15),std({color:0x8a5a2a,roughness:.6}));arc.rotation.z=Math.PI/2-Math.PI*.575;arc.position.x=-.42;g.add(arc);
      const str=mesh(cyl(.006,.006,1.04,4),std({color:0xf0f0f0}),-.04);g.add(str);g.userData.string=str;z(box(.06,.14,.06),gem,0);g.userData.bow=true;break}
    case'boomer':{const a=z(box(.06,.02,.4),std({color:el||'#e0a040'}),.18,.1);a.rotation.y=.6;const b=z(box(.06,.02,.4),std({color:el||'#e0a040'}),.18,-.1);b.rotation.y=-.6;break}
    case'wand':z(along(cyl(.014,.02,.5,6)),M.dark,.2);z(sph(.06),new THREE.MeshBasicMaterial({color:el||rc}),.47);break;
    case'staff':z(along(cyl(.022,.028,1.4,8)),M.wood,.3);z(sph(.1),new THREE.MeshBasicMaterial({color:el||rc}),1.05);z(new THREE.TorusGeometry(.11,.015,6,14),M.gold,1.05);break;
    case'bubble':z(along(cyl(.014,.02,.5,6)),std({color:0xe8c0e0}),.2);z(new THREE.TorusGeometry(.1,.015,6,18),gem,.55).rotation.y=Math.PI/2;break;
    case'chicken':z(along(cyl(.014,.02,.5,6)),std({color:0xe8e0d0}),.2);const ck=z(sph(.08),std({color:0xffd23a}),.52);ck.scale.set(1,.9,1.3);z(sph(.05),std({color:0xffd23a}),.6,0,.07);z(box(.03,.04,.04),M.red,.6,0,.13);break;
    case'gauntlet':z(box(.18,.16,.22),M.iron,.05);z(sph(.05),new THREE.MeshBasicMaterial({color:0xb06bff}),.05,0,.09);break;
    case'blaster':z(box(.08,.14,.3),M.iron,.12);z(along(cyl(.03,.03,.25,8)),std({color:0x9aa4b8,metalness:.8,roughness:.3}),.35,0,.04);z(box(.09,.04,.1),new THREE.MeshBasicMaterial({color:el||0x3bf0ff}),.12,0,.07);break;
  }g.traverse(m=>{if(m.isMesh)m.castShadow=true});return g}
function makeShield(ci){const g=new THREE.Group(),col=LOOK.shield[ci];const disc=mesh(cyl(.33,.33,.05,20),std({color:col,roughness:.7}));disc.rotation.x=Math.PI/2;g.add(disc);
  const rim=mesh(new THREE.TorusGeometry(.33,.025,6,24),M.iron);g.add(rim);g.add(mesh(sph(.07,10,8),M.gold,0,0,.03));const cr=mesh(box(.06,.4,.02),M.gold,0,0,.03);g.add(cr);const cr2=mesh(box(.4,.06,.02),M.gold,0,0,.03);g.add(cr2);return g}

// ================= Creatures =================
function makeFrog(){const g=new THREE.Group(),mats=[std({color:0x2fb3ff,roughness:.35}),std({color:0xffd23a,roughness:.5})];const b=mesh(sph(.38,16,12),mats[0],0,.35,0);b.scale.set(1,.72,1.15);g.add(b);const be=mesh(sph(.3,14,10),mats[1],0,.27,.12);be.scale.set(1,.7,1.1);g.add(be);
  for(const s of[-1,1]){g.add(mesh(sph(.12),std({color:0xffffff}),s*.18,.6,.2));g.add(mesh(sph(.06),M.dark,s*.19,.62,.3));const l=mesh(sph(.14),mats[0],s*.32,.12,-.15);l.scale.set(.8,.6,1.4);g.add(l);g.add(mesh(sph(.08),mats[0],s*.25,.08,.3))}
  for(let i=0;i<5;i++)g.add(mesh(sph(.05),M.dark,rr(-.25,.25),.55,rr(-.3,.1)));return{g,mats}}
function makeSnake(big){const g=new THREE.Group(),m=std({color:big?0x8a3a2a:0x5aa83a,roughness:.45}),m2=std({color:0xe8e060}),segs=[];const n=10;
  for(let i=0;i<n;i++){const r=.16*(1-i/n*.6)*(big?1.6:1);const s=mesh(sph(r,10,8),i%3===1?m2:m,0,r,-i*r*1.5);g.add(s);segs.push(s)}const hd=segs[0];hd.scale.set(1.2,.9,1.4);
  for(const sd of[-1,1]){const e=mesh(sph(.04*(big?1.6:1)),std({color:0xffe14a,emissive:0x504000}),sd*.1*(big?1.6:1),.22*(big?1.6:1),.12*(big?1.6:1));g.add(e)}return{g,mats:[m,m2],segs}}
function makeCrab(){const g=new THREE.Group(),wk=M.wicker.clone(),cm=std({color:0xff7a3a,roughness:.45});const bk=mesh(cyl(.42,.34,.55,16),wk,0,.32,0);g.add(bk);const lid=mesh(cyl(.45,.45,.08,16),wk,0,.66,0);g.add(lid);
  const crab=new THREE.Group();g.add(crab);crab.add(mesh(sph(.3,12,8),cm,0,.62,.05));for(const s of[-1,1]){const st=mesh(cyl(.02,.02,.25,6),cm,s*.1,.85,.2);crab.add(st);crab.add(mesh(sph(.05),M.dark,s*.1,.98,.2));
    const cl=mesh(sph(.14,10,8),std({color:0xe0402a}),s*.55,.45,.25);cl.scale.set(1,.8,1.4);crab.add(cl);crab.add(mesh(box(.06,.06,.2),std({color:0xe0402a}),s*.6,.52,.4));for(let k=0;k<3;k++){const lg=mesh(cyl(.025,.02,.45,5),cm,s*.45,.2,-.15+k*.15);lg.rotation.z=s*.9;crab.add(lg)}}
  crab.visible=false;return{g,mats:[cm,wk],lid,crab}}
function makeGorilla(){const g=new THREE.Group(),fur=std({color:0x3a2a20,roughness:.9}),face=std({color:0x6a5040,roughness:.7}),mats=[fur,face];const t=mesh(sph(.6,16,12),fur,0,1.25,0);t.scale.set(1.2,1,.9);g.add(t);
  const hd=new THREE.Group();hd.position.set(0,1.85,.25);g.add(hd);hd.add(mesh(sph(.32),fur));hd.add(mesh(sph(.22),face,0,-.05,.18));for(const s of[-1,1])hd.add(mesh(sph(.045),std({color:0xffd23a,emissive:0x604000}),s*.11,.06,.32));
  const crown=new THREE.Group();crown.position.y=.3;hd.add(crown);crown.add(mesh(cyl(.2,.22,.12,10),M.gold));for(let i=0;i<5;i++){const a=i/5*Math.PI*2;crown.add(mesh(cone(.05,.14,4),M.gold,Math.cos(a)*.18,.12,Math.sin(a)*.18))}
  const arms=[];for(const s of[-1,1]){const sh=new THREE.Group();sh.position.set(s*.75,1.55,0);g.add(sh);sh.add(mesh(cyl(.2,.16,1,10),fur,0,-.5,0));sh.add(mesh(sph(.22),face,0,-1.05,0));arms.push(sh);
    g.add(mesh(cyl(.2,.16,.7,10),fur,s*.35,.35,0))}return{g,mats,arms,head:hd}}

// ================= Props =================
function makeChest(){const g=new THREE.Group();g.add(mesh(box(.8,.45,.55),M.wood,0,.23,0));const lid=new THREE.Group();lid.position.set(0,.46,-.27);g.add(lid);const l=mesh(box(.82,.18,.57),M.wood,0,.09,.27);lid.add(l);
  for(const x of[-.3,.3]){g.add(mesh(box(.06,.47,.57),M.gold,x,.23,0));lid.add(mesh(box(.06,.19,.59),M.gold,x,.09,.27))}g.add(mesh(box(.12,.12,.04),M.gold,0,.38,.29));return{g,lid}}
function makeBasket(){const c=makeCrab();return c}
function makeCage(){const g=new THREE.Group();g.add(mesh(cyl(.9,.9,.12,16),M.iron,0,.06,0));g.add(mesh(cyl(.9,.9,.1,16),M.iron,0,2.3,0));const bars=new THREE.Group();g.add(bars);
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;bars.add(mesh(cyl(.03,.03,2.2,5),M.iron,Math.cos(a)*.88,1.18,Math.sin(a)*.88))}g.add(mesh(cone(.2,.4,8),M.iron,0,2.55,0));return{g,bars}}
function makeLever(){const g=new THREE.Group();g.add(mesh(box(.5,.7,.12),M.iron,0,0,0));g.add(mesh(box(.3,.4,.05),M.dark,0,0,.07));const piv=new THREE.Group();piv.position.z=.1;g.add(piv);
  const arm=mesh(cyl(.035,.035,.55,8),M.steel,0,.27,0);piv.add(arm);piv.add(mesh(sph(.08),M.red,0,.55,0));piv.rotation.x=.6;g.add(mesh(sph(.06),M.gold,0,0,.12));return{g,piv}}
function makeGate(w){const g=new THREE.Group();for(let i=0;i<=8;i++)g.add(mesh(cyl(.04,.04,WALLH-.4,6),M.iron,-w/2+i*w/8,(WALLH-.4)/2,0));for(const y of[.6,1.8,3])g.add(mesh(box(w,.08,.08),M.iron,0,y,0));
  for(let i=0;i<=8;i++){const sp=mesh(cone(.06,.2,4),M.iron,-w/2+i*w/8,-.05,0);sp.rotation.x=Math.PI;g.add(sp)}return g}
function makeIdol(){const g=new THREE.Group();g.add(mesh(cyl(.4,.5,.9,8),M.stone,0,.45,0));const id=new THREE.Group();id.position.y=.9;g.add(id);id.add(mesh(sph(.16),M.gold,0,.45,0));id.add(mesh(cyl(.13,.17,.35,8),M.gold,0,.18,0));
  for(const s of[-1,1])id.add(mesh(sph(.035),new THREE.MeshBasicMaterial({color:0xff3030}),s*.06,.48,.14));return{g,idol:id}}
const boulderGeo=new THREE.IcosahedronGeometry(1.15,1);
function makeBoulder(){const m=mesh(boulderGeo,std({map:TEX.wall,color:0xb0a890,roughness:.95,flatShading:true}));return m}
function makePortal(){const g=new THREE.Group();const arch=mesh(new THREE.TorusGeometry(1.5,.28,8,20,Math.PI),M.stone,0,1.2,0);g.add(arch);for(const s of[-1,1])g.add(mesh(box(.56,1.3,.56),M.stone,s*1.5,.6,0));
  const sw=mesh(new THREE.CircleGeometry(1.25,32),M.portal,0,1.25,0,false);g.add(sw);g.userData.sw=sw;const pl=new THREE.PointLight(0xa070ff,1.2,8,2);pl.position.set(0,1.3,.6);g.add(pl);return g}
function makeTorch(){const g=new THREE.Group();g.add(mesh(box(.12,.3,.12),M.iron,0,0,0));const st=mesh(cyl(.04,.05,.5,6),M.wood,0,.2,.1);st.rotation.x=-.4;g.add(st);
  const f=mesh(cone(.1,.32,6),M.flame,0,.55,.2,false);g.add(f);const f2=mesh(cone(.05,.2,6),M.flame2,0,.5,.2,false);g.add(f2);g.userData.f=f;return g}
const trunkGeo=cyl(.22,.35,4,8);
const leafGeo=new THREE.IcosahedronGeometry(1,1);
function makeTree(s=1){const g=new THREE.Group();g.add(mesh(trunkGeo,M.bark,0,2,0));const lm=pick([M.leaf,M.leaf2,M.leaf3]);for(let i=0;i<9;i++){const r=rr(.7,1.3);const l=mesh(leafGeo,i%3?lm:pick([M.leaf,M.leaf2,M.leaf3]),rr(-1.3,1.3),rr(3.4,5.2),rr(-1.3,1.3));l.scale.set(r*rr(.9,1.3),r*rr(.6,.9),r*rr(.9,1.3));l.rotation.set(rr(0,3),rr(0,3),0);g.add(l)}for(let i=0;i<2;i++){const b=mesh(cyl(.06,.1,1.6,5),M.bark,rr(-.5,.5),3.2,rr(-.5,.5));b.rotation.z=rr(-.8,.8);g.add(b)}g.scale.setScalar(s);return g}
function makeFernGeo(){const a=new THREE.PlaneGeometry(1,1);a.translate(0,.5,0);const b=a.clone();b.rotateY(Math.PI/2);const g=new THREE.BufferGeometry();const pa=[...a.attributes.position.array,...b.attributes.position.array],ua=[...a.attributes.uv.array,...b.attributes.uv.array],na=[...a.attributes.normal.array,...b.attributes.normal.array];
  g.setAttribute('position',new THREE.Float32BufferAttribute(pa,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(ua,2));g.setAttribute('normal',new THREE.Float32BufferAttribute(na,3));g.setIndex([0,2,1,2,3,1,4,6,5,6,7,5]);return g}
const fernGeo=makeFernGeo();
function makeCampfire(){const g=new THREE.Group();for(let i=0;i<5;i++){const l=mesh(cyl(.07,.07,.8,6),M.bark,0,.1,0);l.rotation.set(Math.PI/2,i/5*Math.PI*2,0.2);g.add(l)}for(let i=0;i<8;i++){const a=i/8*Math.PI*2;g.add(mesh(sph(.14,6,5),M.stone,Math.cos(a)*.55,.06,Math.sin(a)*.55))}
  const f=mesh(cone(.3,.8,7),M.flame,0,.45,0,false);g.add(f);const f2=mesh(cone(.16,.5,7),M.flame2,0,.35,0,false);g.add(f2);const pl=new THREE.PointLight(0xff9040,1.6,12,1.6);pl.position.y=1;g.add(pl);g.userData.f=f;g.userData.pl=pl;return g}
function makeTent(ci,s=1){const g=new THREE.Group();const t=mesh(cone(1.6,2.2,4),M.cloth[ci%4],0,1.1,0);t.rotation.y=Math.PI/4;g.add(t);g.add(mesh(box(.5,.9,.05),M.dark,0,.45,1.05));g.scale.setScalar(s);return g}
function makeDummy(){const g=new THREE.Group();g.add(mesh(cyl(.06,.06,1.6,6),M.wood,0,.8,0));g.add(mesh(box(1,.1,.1),M.wood,0,1.2,0));const b=mesh(sph(.32),std({color:0xd8b060}),0,1.15,0);b.scale.set(1,1.3,.8);g.add(b);g.add(mesh(sph(.2),std({color:0xd8b060}),0,1.7,0));
  const tg=mesh(cyl(.16,.16,.02,14),M.red,0,1.2,.25);tg.rotation.x=Math.PI/2;g.add(tg);return g}
function makeStall(){const g=new THREE.Group();g.add(mesh(box(2,.9,.8),M.wood,0,.45,0));for(const x of[-.95,.95])g.add(mesh(cyl(.05,.05,2.2,6),M.wood,x,1.1,-.35));const aw=mesh(box(2.3,.06,1.2),M.cloth[0],0,2.2,-.05);aw.rotation.x=.25;g.add(aw);
  for(let i=0;i<4;i++)g.add(mesh(sph(.1),new THREE.MeshBasicMaterial({color:['#ff6060','#60b0ff','#ffd040','#80ff80'][i]}),-.6+i*.4,1,0));return g}
function makeAnvil(){const g=new THREE.Group();g.add(mesh(box(.5,.5,.4),M.iron,0,.25,0));g.add(mesh(box(.9,.2,.35),M.iron,0,.6,0));const hn=mesh(cone(.12,.3,4),M.iron,.55,.6,0);hn.rotation.z=-Math.PI/2;g.add(hn);return g}
function makeBanner(col){const g=new THREE.Group();g.add(mesh(cyl(.05,.05,3,6),M.wood,0,1.5,0));g.add(mesh(box(.8,1,.03),std({color:col,side:THREE.DoubleSide}),.42,2.4,0));return g}
