
// ================= Biome props, final boss, avatar details =================
const PM={palmT:std({color:0x9a7a50,roughness:.9}),palmL:std({color:0x3e9a3a,roughness:.75,side:THREE.DoubleSide}),cactus:std({color:0x4a8a3c,roughness:.8}),pine:std({color:0x2e5a3a,roughness:.85}),
  snowCap:std({color:0xf4f8ff,roughness:.7}),wallW:std({color:0xe8dcc0,roughness:.9}),roofR:std({color:0xa84a32,roughness:.8}),roofB:std({color:0x4a5a7a,roughness:.8}),win:std({color:0xffd890,emissive:0x664400,roughness:.4}),rock:std({color:0x8a8478,roughness:.95})};
function makePalm(s=1){const g=new THREE.Group();let x=0,y=0;const lean=rr(-.25,.25);for(let i=0;i<7;i++){const seg=mesh(cyl(.13-i*.008,.15-i*.008,.62,8),PM.palmT,x,y+.31,0);seg.rotation.z=lean*(i/7);g.add(seg);x+=Math.sin(lean*(i/7))*-.62;y+=.6}
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2,lf=mesh(new THREE.PlaneGeometry(.5,2.2),PM.palmL,x,y,0,false);lf.geometry.translate(0,1.1,0);lf.rotation.set(1.15,a,0,'YXZ');g.add(lf)}
  for(let i=0;i<3;i++)g.add(mesh(sph(.1,8,6),PM.palmT,x+Math.cos(i*2)*.15,y-.1,Math.sin(i*2)*.15));g.scale.setScalar(s);return g}
function makeCactus(s=1){const g=new THREE.Group();g.add(mesh(cyl(.28,.32,2.6,10),PM.cactus,0,1.3,0));g.add(mesh(sph(.28,10,8),PM.cactus,0,2.6,0));
  for(const sd of[-1,1]){if(Math.random()<.25)continue;const h=rr(.9,1.5);const a=mesh(cyl(.16,.16,.6,8),PM.cactus,sd*.42,h,0);a.rotation.z=Math.PI/2;g.add(a);g.add(mesh(cyl(.16,.16,.8,8),PM.cactus,sd*.7,h+.4,0));g.add(mesh(sph(.16,8,6),PM.cactus,sd*.7,h+.8,0))}
  if(Math.random()<.5)g.add(mesh(sph(.12,8,6),std({color:0xff6a8a,roughness:.6}),0,2.85,0));g.scale.setScalar(s);return g}
function makePine(s=1){const g=new THREE.Group();g.add(mesh(cyl(.14,.2,1.2,8),M.bark,0,.6,0));for(let i=0;i<4;i++){const r=1.4-i*.3,h=1.4-i*.15;g.add(mesh(cone(r,h,9),PM.pine,0,1.1+i*.75,0));const sc=mesh(cone(r*.82,h*.35,9),PM.snowCap,0,1.1+i*.75+h*.33,0);g.add(sc)}g.scale.setScalar(s);return g}
function makeBuilding(s=1){const g=new THREE.Group(),w=rr(2.6,4),d=rr(2.6,4),h=rr(3.5,7);g.add(mesh(box(w,h,d),PM.wallW,0,h/2,0));const roof=mesh(cone(Math.max(w,d)*.78,rr(1.4,2.4),4),Math.random()<.5?PM.roofR:PM.roofB,0,h+.9,0);roof.rotation.y=Math.PI/4;g.add(roof);
  for(let f=1;f*1.7<h-.6;f++)for(const sd of[-1,1]){g.add(mesh(box(.5,.7,.05),PM.win,sd*w*.25,f*1.7,d/2+.03,false));g.add(mesh(box(.05,.7,.5),PM.win,w/2+.03,f*1.7,sd*d*.25,false))}
  g.add(mesh(box(.8,1.4,.06),M.wood,0,.7,d/2+.03));g.scale.setScalar(s);return g}
function makeRock(s=1){const m=mesh(new THREE.DodecahedronGeometry(1,0),PM.rock,0,.5,0);m.scale.set(rr(.8,1.4),rr(.6,1),rr(.8,1.4));const g=new THREE.Group();g.add(m);g.scale.setScalar(s);return g}
function makeOuterProp(kind,s){if(kind==='cactus')return Math.random()<.35?makeRock(s*.8):makeCactus(s);if(kind==='palm')return makePalm(s);if(kind==='pine')return Math.random()<.25?makeRock(s):makePine(s);if(kind==='house')return makeBuilding(s);return makeTree(s)}
// floor arrow showing the main path
const ARROW_GEO=(()=>{const sh=new THREE.Shape();sh.moveTo(0,.7);sh.lineTo(.5,0);sh.lineTo(.18,0);sh.lineTo(.18,-.6);sh.lineTo(-.18,-.6);sh.lineTo(-.18,0);sh.lineTo(-.5,0);sh.lineTo(0,.7);const g=new THREE.ShapeGeometry(sh);g.rotateX(-Math.PI/2);return g})();
const ARROW_M=new THREE.MeshBasicMaterial({color:0xffd060,transparent:true,opacity:.55,toneMapped:false,depthWrite:false});
function makeArrow(){const m=new THREE.Mesh(ARROW_GEO,ARROW_M);return m}
// final boss: the King of Portals
function makeRePortali(){const g=new THREE.Group(),st=std({color:0x4a4060,roughness:.6,metalness:.3}),cr=std({color:0x9a6aff,emissive:0x5a2ab0,emissiveIntensity:.8,roughness:.3}),gold=M.gold,mats=[st];
  const body=new THREE.Group();g.add(body);const t=mesh(box(1.9,2,1.2),st,0,2.6,0);body.add(t);body.add(mesh(box(2.4,.6,1.4),st,0,3.5,0));
  const ring=mesh(new THREE.TorusGeometry(.55,.1,8,24),cr,0,2.7,.62,false);body.add(ring);const core=mesh(new THREE.CircleGeometry(.48,24),new THREE.MeshBasicMaterial({color:0xb080ff,toneMapped:false}),0,2.7,.61,false);body.add(core);
  const head=new THREE.Group();head.position.set(0,4.2,0);body.add(head);head.add(mesh(box(.9,.8,.8),st));for(const s of[-1,1])head.add(mesh(box(.18,.08,.05),new THREE.MeshBasicMaterial({color:0xffe060,toneMapped:false}),s*.2,.05,.41,false));
  const crown=new THREE.Group();crown.position.y=.5;head.add(crown);crown.add(mesh(cyl(.5,.5,.18,12),gold));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;crown.add(mesh(cone(.1,.35,4),gold,Math.cos(a)*.45,.25,Math.sin(a)*.45))}crown.add(mesh(sph(.1,8,6),cr,0,.12,.5));
  const arms=[];for(const s of[-1,1]){const sh=new THREE.Group();sh.position.set(s*1.35,3.4,0);body.add(sh);sh.add(mesh(sph(.45,10,8),st));sh.add(mesh(box(.55,1.4,.55),st,0,-.8,0));const fist=mesh(box(.8,.8,.8),st,0,-1.75,0);sh.add(fist);sh.add(mesh(box(.82,.2,.82),cr,0,-1.5,0));arms.push(sh)}
  for(const s of[-1,1]){g.add(mesh(box(.6,1.6,.6),st,s*.5,.8,0));}
  const cape=mesh(new THREE.PlaneGeometry(2.2,3),std({color:0x5a1a3a,roughness:.8,side:THREE.DoubleSide}),0,2.2,-.66);body.add(cape);
  const rocks=new THREE.Group();g.add(rocks);for(let i=0;i<6;i++){const r=mesh(new THREE.DodecahedronGeometry(.28,0),cr,0,0,0,false);r.userData.a=i/6*Math.PI*2;rocks.add(r)}
  return{g,mats,arms,ring,rocks,crown,body}}
// class outfit on top of the humanoid (more detail per class)
function addClassGear(H,cls,L){const T=H.torso,bw=H.bw,hd=H.head;const leather=std({color:0x6a4426,roughness:.75}),dark=std({color:0x22222a,roughness:.8}),cloth=c=>std({color:c,roughness:.85});
  if(cls==='cavaliere'){for(const a of[H.armL,H.armR]){const p=mesh(new THREE.SphereGeometry(.11*bw,10,8,0,Math.PI*2,0,Math.PI/2),M.iron,0,.03,0);p.scale.set(1.15,.8,1.1);a.sh.add(p);a.sh.add(mesh(cyl(.075*bw,.075*bw,.05,10),M.gold,0,-.02,0))}
    const pl=mesh(box(.32*bw,.3,.06),M.iron,0,.42,.17*bw);T.add(pl);T.add(mesh(box(.04,.26,.065),M.gold,0,.42,.175*bw));const tab=mesh(box(.24*bw,.32,.03),cloth(LOOK.shield[L.shield|0]),0,.02,.18*bw);T.add(tab)}
  if(cls==='arciere'){const q=new THREE.Group();q.position.set(.08,.42,-.2*bw);q.rotation.z=-.4;T.add(q);q.add(mesh(cyl(.07,.06,.5,10),leather));for(let i=0;i<4;i++){q.add(mesh(cyl(.008,.008,.25,4),M.wood,(i%2-.5)*.06,.33,(i>>1)*.05-.02));q.add(mesh(box(.04,.07,.005),cloth('#e8e0d0'),(i%2-.5)*.06,.46,(i>>1)*.05-.02))}
    const strap=mesh(box(.04,.62,.03),leather,0,.36,0);strap.rotation.z=.75;strap.position.z=.18*bw;T.add(strap);const cape=mesh(new THREE.PlaneGeometry(.4*bw,.6),std({color:0x3a6a2e,roughness:.85,side:THREE.DoubleSide}),0,.28,-.19*bw);T.add(cape)}
  if(cls==='mago'){const robe=mesh(cyl(.19*bw,.34*bw,.62,14,1,true),cloth(LOOK.shirt[L.shirt|0]),0,-.25,0);robe.material.side=THREE.DoubleSide;T.add(robe);T.add(mesh(cyl(.185*bw,.185*bw,.05,12),M.gold,0,.08,0));
    if(L.hat==='nessuno'||L.hat==='cappuccio'){const hc=cloth('#4a3a8a');hd.add(mesh(cyl(.24,.24,.02,16),hc,0,.12,0));const c=mesh(cone(.15,.42,12),hc,0,.33,-.02);c.rotation.x=-.18;hd.add(c);hd.add(mesh(sph(.035,8,6),new THREE.MeshBasicMaterial({color:0xffe060,toneMapped:false}),0,.22,.13,false))}}
  if(cls==='assassino'){const mk=mesh(new THREE.CylinderGeometry(.158,.158,.1,14,1,true,-Math.PI/2,Math.PI),dark,0,-.07,0);mk.material.side=THREE.DoubleSide;hd.add(mk);
    for(const s of[-1,1]){const tl=mesh(box(.05,.34,.012),cloth('#9a1a2a'),s*.05,.5,-.16*bw);tl.rotation.x=.25;T.add(tl)}{const sc=mesh(new THREE.TorusGeometry(.12,.04,6,14),cloth('#9a1a2a'),0,.66,0);sc.rotation.x=Math.PI/2;T.add(sc)}
    const sash=mesh(box(.04,.5,.03),dark,0,.3,.17*bw);sash.rotation.z=-.7;T.add(sash);for(const a of[H.armL,H.armR])a.el.add(mesh(cyl(.05,.05,.14,8),dark,0,-.18,0))}
  if(cls==='fabbro'){const ap=mesh(box(.3*bw,.62,.03),leather,0,.15,.18*bw);T.add(ap);T.add(mesh(box(.12,.08,.02),leather,0,.08,.2*bw));
    for(const a of[H.armL,H.armR]){a.hand.add(mesh(box(.1,.1,.085),leather,0,-.01,0));a.el.add(mesh(cyl(.06,.055,.1,8),leather,0,-.24,0))}
    const band=mesh(new THREE.TorusGeometry(.158,.015,6,18),dark,0,.07,0);band.rotation.x=Math.PI/2;hd.add(band);for(const s of[-1,1]){const lz=mesh(cyl(.04,.04,.03,10),std({color:0x8adfff,metalness:.6,roughness:.15}),s*.055,.1,.145,false);lz.rotation.x=Math.PI/2;hd.add(lz)}}}
