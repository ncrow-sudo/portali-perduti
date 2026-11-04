// ================= v2: draghi da scegliere che crescono =================
// P.drago = {t: tipo, xp: punti crescita}. Cresce con i mostri sconfitti: Cucciolo, Giovane, Adulto, Antico.
const DRAGHI={
  fuoco:{n:'Fuoco',d:'Soffia fuoco: i nemici bruciano.',body:0xd8452a,belly:0xffd27a,wing:0xff9a3a,fx:'#ff9a30'},
  ghiaccio:{n:'Ghiaccio',d:'Soffia ghiaccio: i nemici rallentano e da grande li congela.',body:0x5ab8e8,belly:0xeaf8ff,wing:0xb0e8ff,fx:'#bfe8ff'},
  fulmine:{n:'Fulmine',d:'Lancia fulmini che saltano da un nemico all\'altro.',body:0xf0c030,belly:0xfff4c0,wing:0x8a60d0,fx:'#fff36b'},
  natura:{n:'Natura',d:'Spore velenose sui nemici e un po\' di vita per te.',body:0x4aa860,belly:0xe8f0a0,wing:0x9ad060,fx:'#8dff5a'}};
const DSTAGE=[{n:'Cucciolo',xp:0,s:.8,dm:1,cd:3,hit:1},{n:'Giovane',xp:40,s:1.15,dm:1.7,cd:2.6,hit:2},{n:'Adulto',xp:150,s:1.6,dm:2.6,cd:2.1,hit:3},{n:'Antico',xp:400,s:2.2,dm:3.8,cd:1.7,hit:4}];
function dragoT(){return DRAGHI[P.drago&&P.drago.t]?P.drago.t:'fuoco'}
function dragoStage(){const xp=P.drago?P.drago.xp|0:0;let s=0;DSTAGE.forEach((st,i)=>{if(xp>=st.xp)s=i});return s}
function makePet(tipo,stage){tipo=DRAGHI[tipo]?tipo:dragoT();stage=stage==null?dragoStage():stage;const D=DRAGHI[tipo],g=new THREE.Group(),sk=std({color:D.body,roughness:.4}),be=std({color:D.belly,roughness:.6});
  const b=mesh(sph(.22,12,8),sk);b.scale.set(.9,.9,1.3);g.add(b);g.add(mesh(sph(.16,10,8),be,0,-.04,.08));
  const hd=mesh(sph(.16,12,8),sk,0,.18,.24);g.add(hd);
  for(const s of[-1,1]){g.add(mesh(sph(.05,8,6),std({color:0xffffff}),s*.07,.24,.37,false));g.add(mesh(sph(.025,6,5),M.dark,s*.07,.24,.41,false));const h=mesh(cone(.03,.1+stage*.05,5),be,s*.06,.33+stage*.02,.2);h.rotation.x=-.5;g.add(h)}
  // da Giovane: punte sulla schiena; da Adulto: più punte e coda più lunga; Antico: occhi che brillano
  for(let q=0;q<(stage>=1?2+stage:0);q++){const sp=mesh(cone(.035,.09,4),be,0,.2-q*.015,.1-q*.11);sp.rotation.x=-.3;g.add(sp)}
  if(stage>=3)for(const s of[-1,1])g.add(mesh(sph(.028,6,5),glowM(D.fx),s*.07,.24,.42,false));
  const wings=[];for(const s of[-1,1]){const w=new THREE.Group();w.position.set(s*.12,.12,0);g.add(w);const wm=mesh(new THREE.ConeGeometry(.22,.02,3),std({color:D.wing,side:THREE.DoubleSide}),s*.18,0,0);wm.rotation.z=s*Math.PI/2;wm.scale.set(1,1,1.4+stage*.15);w.add(wm);wings.push(w)}
  const t=mesh(cone(.07,.35+stage*.08,6),sk,0,-.02,-.32-stage*.04);t.rotation.x=-Math.PI/2;g.add(t);
  if(stage>=3){const au=makeAura(D.fx);au.position.y=-.3;au.scale.setScalar(.6);g.add(au)}
  return{g,wings}}
function spawnPet(){if(pet&&pet.obj.parent)pet.obj.parent.remove(pet.obj);const st=dragoStage(),m=makePet(dragoT(),st);world.add(m.g);pet={obj:m.g,wings:m.wings,x:P.x-1,z:P.z,y:P.y+1.8,cd:3,stage:st,n:0};pet.obj.scale.setScalar(DSTAGE[st].s)}
function dragoXP(v){if(!P.drago)P.drago={t:'fuoco',xp:0};const before=dragoStage();P.drago.xp=(P.drago.xp|0)+v;const after=dragoStage();
  if(after>before){const x=pet?pet.x:P.x,y=pet?pet.y:P.y+2,z=pet?pet.z:P.z;spawnPet();if(pet){pet.x=x;pet.y=y;pet.z=z}burst(x,y,z,DRAGHI[dragoT()].fx,40,4);sfx('ability');banner('Il tuo drago è cresciuto!',DSTAGE[after].n.toUpperCase()+' · PIÙ FORTE',2600)}}
function dragoBreath(foe,targets){const D=DRAGHI[dragoT()],st=DSTAGE[pet.stage],tp=dragoT(),base=Math.round((5+P.lvl*.9)*(1+.2*rankIdx(P.lvl))*st.dm);
  for(const[k,e]of targets.entries()){const d=Math.round(base*(k?.7:1));
    for(let i=0;i<10;i++)setTimeout(()=>{if(pet)burst(lerp(pet.x,e.x,i/10),pet.y-i*.05,lerp(pet.z,e.z,i/10),D.fx,3,1,.4,0)},i*25+k*60);
    hitEnt(e,d,{});if(e.dead)continue;
    if(tp==='fuoco')e.burn=Math.max(e.burn||0,2+pet.stage);
    if(tp==='ghiaccio'){e.slow=Math.max(e.slow||0,2+pet.stage*.5);if(pet.stage>=3&&!e.boss)e.stun=Math.max(e.stun||0,.8)}
    if(tp==='fulmine'&&!e.boss)e.stun=Math.max(e.stun||0,.3);
    if(tp==='natura')e.poison=Math.max(e.poison||0,2.5+pet.stage)}
  if(tp==='natura'){const h=Math.round(P.maxHp*(.02+.01*pet.stage));if(P.hp<P.maxHp){P.hp=Math.min(P.maxHp,P.hp+h);float(P.x,P.y+2.2,P.z,'+'+h,'#7be36b')}}
  sfx(tp==='fulmine'?'thunder':tp==='ghiaccio'?'magic':'fire',.45)}
function updPet(dt){if(!pet||floor<0)return;const t=performance.now()/1000,st=DSTAGE[pet.stage]||DSTAGE[0],tx=P.x+Math.sin(P.yaw+2.2)*(1.6+pet.stage*.4),tz=P.z+Math.cos(P.yaw+2.2)*(1.6+pet.stage*.4);pet.cd-=dt;
  let goal=[tx,tz];const gold=DROPS.find(d=>d.what==='gold'&&Math.hypot(d.x-P.x,d.z-P.z)<9&&d.t>.4);if(gold)goal=[gold.x,gold.z];
  pet.x=lerp(pet.x,goal[0],Math.min(1,dt*(gold?4:2.5)));pet.z=lerp(pet.z,goal[1],Math.min(1,dt*(gold?4:2.5)));pet.y=lerp(pet.y,Math.max(0,groundH(pet.x,pet.z)<50?groundH(pet.x,pet.z):0)+1.6+pet.stage*.35+Math.sin(t*3)*.2,Math.min(1,dt*4));
  if(gold&&Math.hypot(gold.x-pet.x,gold.z-pet.z)<.8){gold.x=P.x;gold.z=P.z}
  const range=6+pet.stage*1.5,foes=ENT.filter(e=>!e.dead&&e.team==='enemy'&&Math.hypot(e.x-pet.x,e.z-pet.z)<range).sort((a,b)=>Math.hypot(a.x-pet.x,a.z-pet.z)-Math.hypot(b.x-pet.x,b.z-pet.z));let yaw=Math.atan2(goal[0]-pet.x,goal[1]-pet.z);
  if(foes.length){const foe=foes[0];yaw=Math.atan2(foe.x-pet.x,foe.z-pet.z);if(pet.cd<=0){pet.cd=st.cd;pet.n++;
    // Antico: ogni quarto soffio colpisce tutti i nemici vicini
    const all=pet.stage>=3&&pet.n%4===0,ch=dragoT()==='fulmine',tg=all?foes.filter(e=>Math.hypot(e.x-foe.x,e.z-foe.z)<6):foes.filter(e=>Math.hypot(e.x-foe.x,e.z-foe.z)<(ch?6.5:4)).slice(0,st.hit+(ch?1:0));
    if(all)float(pet.x,pet.y+.8,pet.z,'SUPER SOFFIO!',DRAGHI[dragoT()].fx,1);dragoBreath(foe,tg)}}
  pet.obj.position.set(pet.x,pet.y,pet.z);pet.obj.rotation.y=yaw;pet.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(t*(16-pet.stage*2))*.6)}
