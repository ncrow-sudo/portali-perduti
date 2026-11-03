
// ================= Fantasy creatures =================
const glowM=c=>new THREE.MeshBasicMaterial({color:c,toneMapped:false});
function makeFungo(){const g=new THREE.Group(),cap=std({color:pick([0xd03a3a,0x8a4ad0,0xe0802a]),roughness:.5,emissive:0x000000}),stem=std({color:0xf0e6d0,roughness:.7}),mats=[cap,stem];
  const st=mesh(cyl(.22,.28,.5,12),stem,0,.3,0);g.add(st);const c=mesh(new THREE.SphereGeometry(.48,16,10,0,Math.PI*2,0,Math.PI*.55),cap,0,.5,0);c.scale.set(1,.8,1);g.add(c);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+rr(0,.4),h=rr(.15,.5);g.add(mesh(sph(.06,8,6),glowM(0xfff6e0),Math.cos(a)*.42*Math.cos(h),.55+Math.sin(h)*.32,Math.sin(a)*.42*Math.cos(h),false))}
  for(const s of[-1,1]){g.add(mesh(sph(.06,8,6),std({color:0xffffff}),s*.09,.38,.22,false));g.add(mesh(sph(.032,6,5),M.dark,s*.09,.38,.27,false));g.add(mesh(sph(.08,8,6),stem,s*.14,.06,.05))}
  g.add(mesh(box(.08,.025,.02),M.dark,0,.27,.26,false));return{g,mats,cap:c}}
function makeFatuo(){const g=new THREE.Group(),col=pick([0x60e8ff,0xb080ff,0x80ffb0]);const core=mesh(sph(.22,14,10),glowM(col),0,1.3,0,false);g.add(core);
  const halo=mesh(sph(.42,14,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}),0,1.3,0,false);g.add(halo);
  for(const s of[-1,1])g.add(mesh(sph(.04,6,5),M.dark,s*.08,1.34,.19,false));return{g,mats:[],core,halo,col}}
function makeGolem(big){const g=new THREE.Group(),st=std({map:TEX.wall,color:0xa8a898,roughness:.95}),mo=std({color:0x4a8a3a,roughness:.9}),rune=glowM(0x60f0ff),mats=[st,mo];
  g.add(mesh(box(.9,.8,.6),st,0,1.25,0));g.add(mesh(box(.92,.18,.62),mo,0,1.68,0));g.add(mesh(box(.5,.42,.46),st,0,1.95,.05));for(const s of[-1,1])g.add(mesh(box(.1,.06,.02),rune,s*.12,2,.29,false));
  g.add(mesh(box(.3,.3,.02),rune,0,1.3,.31,false));const arms=[];for(const s of[-1,1]){const a=new THREE.Group();a.position.set(s*.62,1.55,0);g.add(a);a.add(mesh(box(.32,.75,.32),st,0,-.4,0));a.add(mesh(box(.38,.32,.38),st,0,-.85,0));arms.push(a);
    g.add(mesh(box(.32,.85,.36),st,s*.25,.42,0))}g.scale.setScalar(big?1.7:1);return{g,mats,arms}}
function makeDraghetto(){const g=new THREE.Group(),sk=std({color:0xd0502a,roughness:.5}),be=std({color:0xf0c060,roughness:.6}),mats=[sk,be];const b=mesh(sph(.38,14,10),sk,0,.55,0);b.scale.set(.9,.8,1.35);g.add(b);
  const bl=mesh(sph(.28,12,8),be,0,.48,.12);bl.scale.set(.8,.7,1.2);g.add(bl);const hd=new THREE.Group();hd.position.set(0,.85,.45);g.add(hd);hd.add(mesh(sph(.22,12,8),sk));const sn=mesh(box(.22,.16,.26),sk,0,-.04,.2);hd.add(sn);
  for(const s of[-1,1]){hd.add(mesh(sph(.05,8,6),glowM(0xffe040),s*.11,.06,.14,false));const h=mesh(cone(.04,.2,6),be,s*.1,.18,-.05);h.rotation.x=-.6;hd.add(h);for(const z of[.15,-.3]){g.add(mesh(cyl(.06,.05,.4,6),sk,s*.22,.2,z))}}
  const wings=[];for(const s of[-1,1]){const w=new THREE.Group();w.position.set(s*.25,.8,0);g.add(w);const wm=mesh(new THREE.ConeGeometry(.45,.05,3),std({color:0xa02a1a,side:THREE.DoubleSide}),s*.35,0,0);wm.rotation.z=s*Math.PI/2;wm.scale.set(1,1,1.6);w.add(wm);wings.push(w)}
  const tail=mesh(cone(.14,.8,8),sk,0,.45,-.75);tail.rotation.x=-Math.PI/2+.3;g.add(tail);return{g,mats,head:hd,wings}}
function makePianta(){const g=new THREE.Group(),gr=std({color:0x3a8a2a,roughness:.6}),rd=std({color:0xc02a3a,roughness:.5}),mats=[gr,rd];
  for(let i=0;i<5;i++){const l=mesh(sph(.35,8,6),gr,Math.cos(i*1.26)*.4,.06,Math.sin(i*1.26)*.4);l.scale.set(1,.15,.5);l.rotation.y=i*1.26;g.add(l)}
  const stem=mesh(cyl(.08,.12,1.1,8),gr,0,.55,0);g.add(stem);const head=new THREE.Group();head.position.y=1.2;g.add(head);
  const top=new THREE.Group(),bot=new THREE.Group();head.add(top,bot);const t=mesh(new THREE.SphereGeometry(.38,14,8,0,Math.PI*2,0,Math.PI/2),gr);t.scale.set(1,.7,1.1);top.add(t);const ti=mesh(new THREE.CircleGeometry(.37,14),rd,0,.005,0);ti.rotation.x=Math.PI/2;top.add(ti);
  const b=mesh(new THREE.SphereGeometry(.38,14,8,0,Math.PI*2,Math.PI/2,Math.PI/2),gr);b.scale.set(1,.7,1.1);bot.add(b);const bi=mesh(new THREE.CircleGeometry(.37,14),rd,0,-.005,0);bi.rotation.x=-Math.PI/2;bot.add(bi);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const tt=mesh(cone(.035,.12,4),std({color:0xfff8e0}),Math.cos(a)*.32,-.02,Math.sin(a)*.34);tt.rotation.x=Math.PI;top.add(tt);const tb=mesh(cone(.035,.12,4),std({color:0xfff8e0}),Math.cos(a)*.32,.02,Math.sin(a)*.34);bot.add(tb)}
  for(let i=0;i<5;i++)top.add(mesh(sph(.05,6,5),std({color:0xf0e040}),rr(-.2,.2),.2,rr(-.2,.2),false));return{g,mats,top,bot,head}}
function makeRagno(){const g=new THREE.Group(),cr=std({color:0x8a60ff,emissive:0x3a1a8a,roughness:.2,metalness:.3,flatShading:true}),dk=std({color:0x2a2040,roughness:.6}),mats=[cr,dk];
  const ab=mesh(new THREE.OctahedronGeometry(.42,0),cr,0,.6,-.3);ab.scale.set(1,.8,1.3);g.add(ab);g.add(mesh(sph(.22,10,8),dk,0,.55,.2));for(const s of[-1,1])for(const e of[0,.07])g.add(mesh(sph(.035,6,5),glowM(0xff4060),s*(.06+e),.62,.38,false));
  const legs=[];for(const s of[-1,1])for(let i=0;i<4;i++){const l=new THREE.Group();l.position.set(s*.15,.55,.25-i*.17);g.add(l);const u=mesh(cyl(.03,.03,.5,5),dk,s*.22,.15,0);u.rotation.z=-s*1.1;l.add(u);const d=mesh(cyl(.025,.015,.6,5),cr,s*.48,-.12,0);d.rotation.z=s*.35;l.add(d);legs.push(l)}
  return{g,mats,legs}}
function makeIdra(){const g=new THREE.Group(),sk=std({color:0x2a7a5a,roughness:.45}),be=std({color:0xc8d070,roughness:.6}),mats=[sk,be];const b=mesh(sph(1.3,18,12),sk,0,1.2,0);b.scale.set(1.2,.9,1.4);g.add(b);
  g.add(mesh(sph(1,16,10),be,0,1,.5));for(let i=0;i<6;i++)g.add(mesh(cone(.18,.5,6),be,0,2.2-i*.05,-.8+i*.3));for(const s of[-1,1])for(const z of[.8,-.8])g.add(mesh(cyl(.3,.25,1,8),sk,s*1.1,.4,z));
  const tail=mesh(cone(.45,2.2,10),sk,0,.8,-2.2);tail.rotation.x=-Math.PI/2+.2;g.add(tail);
  const necks=[];for(let k=0;k<3;k++){const segs=[];for(let i=0;i<7;i++){const s=mesh(sph(.32-i*.02,10,8),sk,0,0,0);g.add(s);segs.push(s)}const hd=new THREE.Group();g.add(hd);const h=mesh(sph(.42,12,8),sk);h.scale.set(.9,.75,1.3);hd.add(h);
    hd.add(mesh(box(.4,.16,.5),be,0,-.18,.3));for(const s of[-1,1]){hd.add(mesh(sph(.07,8,6),glowM(0xffd020),s*.2,.12,.32,false));const hn=mesh(cone(.06,.35,6),be,s*.18,.3,-.2);hn.rotation.x=-.8;hd.add(hn)}necks.push({segs,hd,k})}return{g,mats,necks}}
function makeTurret(){const g=new THREE.Group();for(let i=0;i<3;i++){const l=mesh(cyl(.04,.05,1.1,6),M.wood,Math.cos(i*2.1)*.3,.5,Math.sin(i*2.1)*.3);l.rotation.z=Math.cos(i*2.1)*.3;l.rotation.x=-Math.sin(i*2.1)*.3;g.add(l)}
  const head=new THREE.Group();head.position.y=1.05;g.add(head);head.add(mesh(box(.16,.14,.9),M.wood,0,0,.1));const bow=mesh(new THREE.TorusGeometry(.42,.03,6,16,Math.PI),M.iron,0,0,.4);bow.rotation.x=Math.PI/2;bow.rotation.z=Math.PI;head.add(bow);head.add(mesh(cyl(.02,.02,.7,4),M.steel,0,.06,.25).rotateX(Math.PI/2));return{g,head}}
function makePet(){const g=new THREE.Group(),sk=std({color:0x5ab0a0,roughness:.4}),be=std({color:0xf0e0a0,roughness:.6});const b=mesh(sph(.22,12,8),sk);b.scale.set(.9,.9,1.3);g.add(b);g.add(mesh(sph(.16,10,8),be,0,-.04,.08));
  const hd=mesh(sph(.16,12,8),sk,0,.18,.24);g.add(hd);for(const s of[-1,1]){g.add(mesh(sph(.05,8,6),std({color:0xffffff}),s*.07,.24,.37,false));g.add(mesh(sph(.025,6,5),M.dark,s*.07,.24,.41,false));const h=mesh(cone(.03,.1,5),be,s*.06,.33,.2);h.rotation.x=-.5;g.add(h)}
  const wings=[];for(const s of[-1,1]){const w=new THREE.Group();w.position.set(s*.12,.12,0);g.add(w);const wm=mesh(new THREE.ConeGeometry(.22,.02,3),std({color:0x8a60d0,side:THREE.DoubleSide}),s*.18,0,0);wm.rotation.z=s*Math.PI/2;wm.scale.set(1,1,1.4);w.add(wm);wings.push(w)}
  const t=mesh(cone(.07,.35,6),sk,0,-.02,-.32);t.rotation.x=-Math.PI/2;g.add(t);return{g,wings}}
// ================= Props =================
function makeMushroomProp(s=1){const g=new THREE.Group(),cm=pick(M.capGlow);g.add(mesh(cyl(.12,.18,1.4,8),M.stem,0,.7,0));const c=mesh(new THREE.SphereGeometry(.75,14,8,0,Math.PI*2,0,Math.PI*.5),cm,0,1.35,0,false);c.scale.set(1,.55,1);g.add(c);g.scale.setScalar(s);return g}
function makeHut(){const g=new THREE.Group();g.add(mesh(cyl(1.4,1.5,1.8,12),M.mud,0,.9,0));const r=mesh(cone(2,1.6,12),M.thatch,0,2.55,0);g.add(r);g.add(mesh(box(.7,1.2,.1),M.dark,0,.6,1.45));return g}
function makeFountain(){const g=new THREE.Group();g.add(mesh(cyl(1.6,1.7,.5,20),M.stone,0,.25,0));const w=mesh(cyl(1.45,1.45,.05,20),M.water,0,.47,0,false);g.add(w);g.add(mesh(cyl(.25,.35,1.4,10),M.stone,0,1,0));g.add(mesh(sph(.35,12,8),M.gold,0,1.85,0));return g}
function makeStatue(){const g=new THREE.Group();g.add(mesh(box(1,.8,1),M.stone,0,.4,0));const h=mesh(sph(.55,12,8),M.stone,0,1.35,0);h.scale.set(1,1.15,.9);g.add(h);g.add(mesh(box(.5,.12,.1),M.dark,0,1.3,.47));for(const s of[-1,1])g.add(mesh(box(.14,.08,.05),glowM(0x60f0ff),s*.18,1.5,.48,false));return g}
function makeBarrel(){const g=new THREE.Group();g.add(mesh(cyl(.35,.35,.8,12),M.wood,0,.4,0));for(const y of[.15,.65])g.add(mesh(cyl(.36,.36,.06,12),M.iron,0,y,0));return g}
const flowerGeo=(()=>{const g=new THREE.SphereGeometry(.09,6,4);g.translate(0,.25,0);return g})();
function makeAura(col){const m=mesh(new THREE.RingGeometry(.55,.8,32),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}),0,.04,0,false);m.rotation.x=-Math.PI/2;return m}
