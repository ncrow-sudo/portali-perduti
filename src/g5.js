
// ================= Interactables & traps =================
function addInter(o){INTER.push(o);if(o.obj&&!o.obj.parent)world.add(o.obj);return o}
function openChest(c){if(c.used)return;c.used=true;stats.chests++;sfx('chest');c.anim=0;ANIM.push(dt=>{c.anim=Math.min(1,c.anim+dt*3);c.lid.rotation.x=-c.anim*1.9;return c.anim<1});burst(c.x,c.y+.8,c.z,'#ffc53d',18,3);mission&&mission.on('chest');
  if(!c.bonus&&!MP.client&&Math.random()<.12){const n=ri(1,2);for(let i=0;i<n;i++)spawnMon(pick(['fungo','ragno','crab','fatuo']),c.x+rr(-1.2,1.2),c.z+rr(-1.2,1.2),floor).aggro=true;banner('Cassa trappola!',n>1?n+' MOSTRI LIBERATI':'UN MOSTRO LIBERATO');sfx('trap');return}
  if(Math.random()<(c.bonus?.3:.2))dropItem(c.x,c.z,'armor',makeArmor(rollArmorTier(floor,c.bonus?1:0)));else if(Math.random()<.78||c.bonus)dropItem(c.x,c.z,'weapon',makeWeapon(floor,rollRarity(floor,c.bonus?1:0)));if(Math.random()<.45)dropItem(c.x,c.z,'potion');dropGold(c.x,c.z,ri(8,16)*floor)}
function openBasket(b){if(b.used)return;b.used=true;if(b.crab&&!b.safe){world.remove(b.obj);const e=spawnMon('crab',b.x,b.z,Math.max(1,floor));e.aggro=true;e.stun=.5;e.yaw=Math.atan2(P.x-b.x,P.z-b.z);sfx('trap');sfx('chicken');banner('È un paguro!','LA CESTA HA LE CHELE',1600);return}
  sfx('chest');b.lid.position.y=.95;b.lid.rotation.z=.5;burst(b.x,b.y+.8,b.z,'#ffc53d',10,2.5);dropGold(b.x,b.z,ri(6,12)*Math.max(1,floor));if(b.safe||Math.random()<.45)dropItem(b.x,b.z,'potion');if(Math.random()<.25)dropItem(b.x,b.z,'weapon',makeWeapon(floor,rollRarity(floor)))}
function pullLever(l){if(l.used)return;l.used=true;sfx('lever');if(MP.on)MP.myGates.add(l.gate);l.a=0;ANIM.push(dt=>{l.a=Math.min(1,l.a+dt*3);l.piv.rotation.x=lerp(.6,-.9,l.a);return l.a<1});const g=GATES[l.gate];setTimeout(()=>{sfx('gate');g.lifting=true;banner('La grata si alza!','STANZA DEL TESORO APERTA',1800)},350)}
function joinArmy(d,onAccept){d.squad=true;if(P.army.length>=squadCap()){openSwap(d,onAccept);return false}if(onAccept&&onAccept()===false)return false;P.army.push(d);spawnAllyFor(d);stats.allies++;music.stinger('recruit');saveGame();return true}
function freeCage(c){if(c.used)return;c.used=true;sfx('gate');world.remove(c.prisoner.root);c.bars.visible=false;const d=newRecruit(c.cls,Math.max(1,P.lvl-2),c.rar|0);d.look=c.look;d.name=c.name;mission&&mission.on('cage');
  if(joinArmy(d))banner(`${d.name} si unisce a te!`,botLabel(d).toUpperCase())}
function takeIdol(i){if(i.used)return;i.used=true;i.idol.visible=false;sfx('secret');dropGold(P.x,P.z,80*floor);banner('SCAPPA!','HAI PRESO L\'IDOLO D\'ORO');mission&&mission.on('idol');setTimeout(()=>{if(mode==='play')spawnBoulderBehind()},600)}
function spawnBoulderBehind(){computePD();let best=null;for(let k=0;k<LV.gw*LV.gh;k++){if(PD[k]>=6&&PD[k]<=10){const x=(k%LV.gw+.5)*TS,z=(((k/LV.gw)|0)+.5)*TS;const back=Math.cos(angDiff(Math.atan2(x-P.x,z-P.z),cam.yaw))<0;if(!best||back&&!best.back)best={x,z,back}}}
  if(!best)return;const m=makeBoulder();world.add(m);BOULDERS.push({x:best.x,z:best.z,y:groundH(best.x,best.z),obj:m,life:14,tx:best.x,tz:best.z,rum:0});shake=.5;sfx('rumble');banner('SCAPPA!','UN MASSO ROTOLA VERSO DI TE',1600)}
function breakBoulder(b,byP){if(b.dead)return;b.dead=true;world.remove(b.obj);sfx('boom');shake=.4;burst(b.x,b.y+1,b.z,'#a89a80',40,6,1);if(byP){banner('Masso distrutto!','',1200);dropGold(b.x,b.z,ri(15,30)*Math.max(1,floor))}}
function pressPlate(p){p.used=true;p.obj.position.y-=.05;sfx('lever');const r=Math.random();
  if(r<.4){banner('Attento!','UN MASSO CADE DALL\'ALTO',1200);const x=P.x,z=P.z,y=groundH(x,z);const ring=mesh(new THREE.RingGeometry(.9,1.15,24),new THREE.MeshBasicMaterial({color:0xff3030,transparent:true,opacity:.8,side:THREE.DoubleSide,toneMapped:false}),x,y+.05,z,false);ring.rotation.x=-Math.PI/2;world.add(ring);
    const rock=makeBoulder();rock.scale.setScalar(.8);rock.position.set(x,y+14,z);world.add(rock);ROCKS.push({x,z,y:y+14,vy:0,wait:.9,obj:rock,ring,gy:y})}
  else if(r<.65)spawnBoulderBehind();else{banner('Dardi!','SALTA O SCHIVA',1200);for(let v=0;v<3;v++)setTimeout(()=>{if(mode==='play')dartVolley()},v*350)}}
function dartVolley(){for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){if(Math.random()<.45)continue;let x=P.x,z=P.z,n=0;while(groundH(x+dx*TS,z+dz*TS)<50&&n<10){x+=dx*TS;z+=dz*TS;n++}const y=groundH(P.x,P.z)+1.1;
  const m=mesh(arrowGeo,M.wood);m.lookAt(new THREE.Vector3(-dx,0,-dz));shoot({mesh:m,pos:new THREE.Vector3(x+dx*.6,y,z+dz*.6),vel:new THREE.Vector3(-dx*16,0,-dz*16),team:'trap',dmg:Math.round((8+2*floor)*DIFF.dmg),life:2})}sfx('arrow')}

// ================= Missions =================
let mission=null;
function makeMission(n){const opts=[{k:'kill',need:Math.min(12,5+n*2),t:c=>`Sconfiggi ${c} mostri`},{k:'chest',need:3,t:c=>`Apri ${c} casse`},{k:'cage',need:1,t:()=>'Libera il prigioniero'},{k:'idol',need:1,t:()=>'Prendi l\'idolo d\'oro'},{k:'elite',need:1,t:()=>LV.boss?'Sconfiggi il boss':'Sconfiggi il Golem Antico'}];
  const has=k=>INTER.filter(i=>i.kind===k).length;const o=pick(opts.filter(o=>(o.k!=='cage'||has('cage'))&&(o.k!=='idol'||has('idol'))&&(o.k!=='chest'||has('chest')>=3)));const m={...o,have:0,done:false,reward:{gold:40*n,xp:30+n*15,potion:1},
    on(k,e){if(this.done)return;if(k==='kill'&&this.k==='elite'&&e&&(e.elite||e.boss))this.have++;else if(k===this.k)this.have++;if(this.have>=this.need){this.done=true;P.gold+=this.reward.gold;P.potions+=this.reward.potion;gainXP(this.reward.xp);sfx('secret');banner('Missione compiuta!',`+${this.reward.gold} ORO · +${this.reward.xp} XP · +1 POZIONE`,2600)}updMission()}};return m}
function updMission(){const el=$('mission');if(MP.on&&floor===0){el.hidden=false;el.classList.remove('done');el.textContent=mpStatus();if(window.PP_SITE){el.style.pointerEvents='auto';el.style.cursor='pointer';el.onclick=showQR}return}el.style.pointerEvents='';el.onclick=null;if(!mission||floor===0){el.hidden=true;return}el.hidden=false;el.textContent=mission.done?'Missione compiuta ✓':`${mission.t(mission.need)} (${Math.min(mission.have,mission.need)}/${mission.need})`;el.classList.toggle('done',mission.done)}

// ================= Floors & camp =================
function resetRun(){if(MP.on)mpFloorReset();for(const t of TURRETS)world.remove(t.obj);ENT=[];PROJ=[];DROPS=[];RINGS=[];BOULDERS=[];ROCKS=[];FLOATS=[];SOLIDS=[];TURRETS=[];METEORS=[];P.lock=null;if(P.shadowT>0)endShadow()}
function respawnAllies(){allies=MP.on?[]:P.army.filter(d=>d.squad).slice(0,squadCap()).map(d=>makeAlly(d));allies.forEach((a,i)=>{const ang=P.yaw+Math.PI+(i-(allies.length-1)/2)*.5;a.x=P.x+Math.sin(ang)*2.2;a.z=P.z+Math.cos(ang)*2.2;a.y=groundH(a.x,a.z)});renderParty()}
function placeP(x,z,yaw){P.x=x;P.z=z;P.y=groundH(x,z);P.vy=0;P.yaw=yaw;cam.yaw=yaw;P.safe=[x,z];P.onGround=true}
function placePet(){if(!pet)spawnPet();else world.add(pet.obj);pet.x=P.x-1;pet.z=P.z-1;pet.y=P.y+1.8}
function startCamp(){resetRun();floor=0;genCampLevel();buildLevel();const cx=11*TS,cz=11*TS;mission=null;
  const fire=makeCampfire();fire.position.set(cx,0,cz);world.add(fire);ANIM.push(()=>{fire.userData.f.scale.y=1+Math.sin(performance.now()/90)*.15;fire.userData.pl.intensity=1.4+Math.sin(performance.now()/70)*.3;return true});SOLIDS.push({x:cx,z:cz,r:.9});
  const pt=makePortal();pt.position.set(cx,0,cz-11);world.add(pt);addInter({kind:'portal',x:cx,z:cz-10.5,y:0,portal:pt});ANIM.push(dt=>{pt.userData.sw.rotation.z+=dt*1.5;return true});
  const stall=makeStall();stall.position.set(cx-8,0,cz);stall.rotation.y=Math.PI/2;world.add(stall);SOLIDS.push({x:cx-8,z:cz,r:1.1});
  const mh=makeHumanoid({build:'robusto',skin:2,hairStyle:'calvo',hair:4,hat:'cappuccio',shirt:4,pants:3,shield:0});mh.root.position.set(cx-9,0,cz);mh.root.rotation.y=Math.PI/2;world.add(mh.root);addInter({kind:'merchant',x:cx-7,z:cz,y:0,camp:true});
  const board=new THREE.Group();board.add(mesh(box(1.6,1.1,.08),M.wood,0,1.5,0));for(const x of[-.7,.7])board.add(mesh(cyl(.05,.05,2,6),M.wood,x,1,-.05));for(let i=0;i<3;i++)board.add(mesh(box(.35,.45,.01),std({color:0xf0e2b8}),-.45+i*.45,1.5,.05));
  board.position.set(cx+7,0,cz-5);board.rotation.y=-Math.PI/2.5;world.add(board);addInter({kind:'board',x:cx+6.4,z:cz-4.6,y:0});
  const tents=[[cx-4,cz-6,.4],[cx+4,cz+7,-2.6]];if(P.camp.tenda)tents.push([cx-6,cz+6,-.8]);if(P.camp.caserma){tents.push([cx+8,cz+2,-1.6]);const b=makeBanner('#a83a2a');b.position.set(cx+6.5,0,cz+3.6);world.add(b)}if(P.camp.caserma>1){const b=makeBanner('#3a6aa8');b.position.set(cx+9,0,cz-.2);world.add(b)}
  tents.forEach(([x,z,r],i)=>{const t=makeTent(i,i===2?1.4:1);t.position.set(x,0,z);t.rotation.y=r;world.add(t);SOLIDS.push({x,z,r:1.5})});
  if(P.camp.fucina){const a=makeAnvil();a.position.set(cx+3,0,cz-7);world.add(a);SOLIDS.push({x:cx+3,z:cz-7,r:.6});const f=makeCampfire();f.scale.setScalar(.6);f.position.set(cx+4.4,0,cz-7.6);world.add(f)}
  const dm=makeDummy();dm.position.set(cx+5,0,cz+2);world.add(dm);ENT.push({kind:'mon',team:'dummy',type:'dummy',n:'Manichino',x:cx+5,z:cz+2,y:0,r:.5,hp:1,maxHp:1,obj:dm,mats:[],flash:0,yaw:0});SOLIDS.push({x:cx+5,z:cz+2,r:.5});
  const bk=makeBasket();bk.g.position.set(cx-3,0,cz+3);world.add(bk.g);addInter({kind:'basket',x:cx-3,z:cz+3,y:0,lid:bk.lid,safe:true,crab:false,obj:bk.g});
  const reserve=P.army.filter(d=>!d.squad);reserve.slice(0,8).forEach((d,i)=>{const h=makeHumanoid(d.look,1,{cls:d.cls});const a=i/8*Math.PI*2;h.root.position.set(cx+Math.cos(a)*4.2,0,cz+Math.sin(a)*4.2);h.root.rotation.y=Math.atan2(-Math.cos(a),-Math.sin(a));world.add(h.root);ANIM.push(dt=>{animHuman(h,{speed:0,sit:true},dt);return true})});
  (MP.on?(()=>{const a_=Math.random()*6.28;placeP(cx+Math.cos(a_)*2.4,cz+5+Math.sin(a_)*1.6,Math.PI)})():placeP(cx,cz+5,Math.PI));respawnAllies();placePet();computePD();music.setMood('camp');updClock();updHud();updMission()}
function startFloor(n,node){resetRun();floor=n;node=node||curNode()||{biome:'giungla',type:'battaglia',id:'x'+n,L:n};genDungeon(n,node);buildLevel();const R=LV.R,BI=BIOMES[LV.biome]||BIOMES.giungla;LV.curBiome=(LV.path&&LV.path[0]&&LV.path[0].biome)||LV.biome;LV.lastRid=-1;LV.locked=null;LV.cleared={};setWeather(chooseWeather(),true);
  const tilesOf=r=>{const t=[];for(let j=r.z0;j<r.z0+7;j++)for(let i=r.x0;i<r.x0+7;i++){const k=tIdx(i,j);if(LV.tile[k]===0&&!LV.ramp[k]&&!LV.plate[k])t.push([i,j])}return t};
  const POOL={funghi:['fungo','fungo','fatuo','ragno'],rovine:['fungo','draghetto','ragno','golem'],tempio:['golem','ragno','fatuo'],villaggio:['fungo','draghetto','fungo'],giardino:['pianta','fungo','fatuo'],lago:['fatuo','draghetto'],ponte:['fatuo','ragno']};
  for(const r of R){const c=W2(r.x0+3,r.z0+3),tl=sshuffle(tilesOf(r).filter(([i,j])=>Math.abs(i-r.x0-3)+Math.abs(j-r.z0-3)>1));
    if(r.type==='start'){const o_=mpSpawnOffset();placeP(c.x+o_[0],c.z+o_[1],0)}
    if(r.type==='portal'){const pt=makePortal();pt.position.set(c.x,0,c.z);world.add(pt);addInter({kind:'portal',x:c.x,z:c.z,y:0,portal:pt});ANIM.push(dt=>{pt.userData.sw.rotation.z+=dt*1.5;return true});
      if(LV.boss)spawnMon(LV.bossType,c.x,c.z+3,n);else if(n>1||node.type==='elite')spawnMon('golemAntico',c.x+2,c.z+2,n)}
    if(r.type==='merchant'){const st=makeStall();st.position.set(c.x,0,c.z-1);world.add(st);SOLIDS.push({x:c.x,z:c.z-1,r:1.1});const mh=makeHumanoid({build:'robusto',skin:2,hairStyle:'calvo',hair:4,hat:'cappuccio',shirt:4,pants:3,shield:0});mh.root.position.set(c.x,0,c.z-2);world.add(mh.root);addInter({kind:'merchant',x:c.x,z:c.z,y:0})}
    if(r.type==='cage'){const cg=makeCage();cg.g.position.set(c.x,0,c.z);world.add(cg.g);const look=randLook(),cls=pick(Object.keys(PCLASS));const ph=makeHumanoid(look,1,{cls});ph.root.position.set(c.x,0,c.z);ph.root.rotation.y=Math.PI;world.add(ph.root);
      const crar=rollBotRarity(n,.5);addBotAura(ph,crar);const it=addInter({kind:'cage',x:c.x,z:c.z,y:0,bars:cg.bars,prisoner:ph,look,cls,rar:crar,name:pick(NAMES)});ANIM.push(dt=>{if(it.used)return false;animHuman(ph,{speed:0,dance:Math.sin(performance.now()/600)>.6},dt);return true});SOLIDS.push({x:c.x,z:c.z,r:.95})}
    if(r.type==='treasure'){const id=makeIdol();id.g.position.set(c.x,0,c.z);world.add(id.g);addInter({kind:'idol',x:c.x,z:c.z,y:0,idol:id.idol});SOLIDS.push({x:c.x,z:c.z,r:.55});ANIM.push(dt=>{id.idol.rotation.y+=dt;return true})}
    if(r.type==='vault'){for(const[a,b]of[[1,1],[5,1]]){const p=W2(r.x0+a,r.z0+b);mkChest(p.x,p.z,true)}const p=W2(r.x0+3,r.z0+5);mkBasket(p.x,p.z,!MP.client&&Math.random()<.5)}
    if(r.type==='stairs'&&r.chestAt)mkChest(r.chestAt.x,r.chestAt.z,true);
    if(r.type==='lago')mkChest(c.x,c.z,true);
    if(r.type==='tree'){const t=makeTree(1.6);t.position.set(c.x,0,c.z);world.add(t);SOLIDS.push({x:c.x,z:c.z,r:.6})}
    // theme props
    if(r.type==='normal'||r.type==='start'){if(r.theme==='funghi')for(let q=0;q<4&&tl.length;q++){const[i,j]=tl.pop(),p=W2(i,j),s=rr(.9,1.8);const m=makeMushroomProp(s);m.position.set(p.x,LV.h[tIdx(i,j)],p.z);world.add(m);SOLIDS.push({x:p.x,z:p.z,r:.2*s})}
      if(r.theme==='villaggio'){for(const[a,b]of[[1,1],[5,5]]){const p=W2(r.x0+a,r.z0+b);const h=makeHut();h.position.set(p.x,0,p.z);h.rotation.y=rr(0,6);h.scale.setScalar(.75);world.add(h);SOLIDS.push({x:p.x,z:p.z,r:1.15})}for(let q=0;q<2&&tl.length;q++){const[i,j]=tl.pop(),p=W2(i,j);const b=makeBarrel();b.position.set(p.x,0,p.z);world.add(b);SOLIDS.push({x:p.x,z:p.z,r:.35})}}
      if(r.theme==='giardino'&&r.type!=='start'){const f=makeFountain();f.position.set(c.x,0,c.z);world.add(f);SOLIDS.push({x:c.x,z:c.z,r:1.7})}
      if(r.theme==='giardino'){const im=new THREE.InstancedMesh(flowerGeo,std({color:0xffffff,roughness:.6}),30);const cols=[0xff6080,0xffd040,0xa070ff,0xffffff,0xff9030].map(h=>new THREE.Color(h));const d=new THREE.Object3D();for(let q=0;q<30;q++){d.position.set((r.x0+rr(0,7))*TS,0,(r.z0+rr(0,7))*TS);d.updateMatrix();im.setMatrixAt(q,d.matrix);im.setColorAt(q,pick(cols))}world.add(im)}
      if(r.theme==='tempio'&&tl.length){const[i,j]=tl.pop(),p=W2(i,j);const s=makeStatue();s.position.set(p.x,0,p.z);s.rotation.y=rr(0,6);world.add(s);SOLIDS.push({x:p.x,z:p.z,r:.7})}}
    if(r.type==='normal'&&Math.random()<.3&&tl.length){const[i,j]=tl.pop(),p=W2(i,j);mkChest(p.x,p.z,false)}
    if(r.leverFor!=null){const g=GATES[r.leverFor],k=g.tiles[0],i=k%LV.gw,j=(k/LV.gw)|0;const lv=makeLever();let x,z,ry;if(g.dx){x=(i+.5+g.dx*.55)*TS;z=(j-1+.5)*TS;ry=g.dx>0?Math.PI/2:-Math.PI/2}else{x=(i-1+.5)*TS;z=(j+.5+g.dz*.55)*TS;ry=g.dz>0?0:Math.PI}
      lv.g.position.set(x,1.5,z);lv.g.rotation.y=ry;world.add(lv.g);addInter({kind:'lever',x:x+(g.dx||0)*.6,z:z+(g.dz||0)*.6,y:0,piv:lv.piv,gate:r.leverFor})}
    if(!['start','merchant','vault','portal'].includes(r.type)){const quiet=Math.random()<(n<=2?.3:.18);let cnt=quiet?0:Math.round(((n<=2?ri(1,2):ri(2,3)+Math.floor(n/5))+(night()>.5&&Math.random()<.4?1:0))*DIFF.cnt);cnt=Math.min(Math.round(2+DIFF.cnt*1.5),Math.round(cnt*(node.type==='tesoro'?.5:node.type==='mercante'?.6:1)));
      const pool=Math.random()<.65?(BIOMES[r.biome]||BI).pool:(POOL[r.theme]||POOL.rovine);for(let q=0;q<cnt&&tl.length;q++){const[i,j]=tl.pop(),p=W2(i,j);spawnMon(pick(pool),p.x,p.z,n)}}}
  const rooms=sshuffle(R.filter(r=>!['start','portal','vault','ponte'].includes(r.type)));for(let i=0;i<Math.min(rooms.length,3+Math.floor(n/2));i++){const t=tilesOf(rooms[i]);if(!t.length)continue;const[a,b]=pick(t),p=W2(a,b);mkBasket(p.x,p.z,!MP.client&&Math.random()<.55)}
  {const mid=(LV.path||[]).slice(1,-1);if(node.type==='elite'&&mid.length){const r=pick(mid),p=W2(r.x0+2,r.z0+2);spawnMon('golemAntico',p.x,p.z,n)}
    if(node.type==='tesoro')for(let q=0;q<3&&mid.length;q++){const r=pick(mid),t=tilesOf(r);if(t.length){const[a,b]=pick(t),p=W2(a,b);mkChest(p.x,p.z,true)}}
    if(node.type==='mercante'){P.hp=P.maxHp;P.mp=P.maxMp}}
  respawnAllies();placePet();computePD();if(n>best){best=n;store.set('pp5_best',best)}const isCp=n>checkpoint;checkpoint=Math.max(checkpoint,n);mission=makeMission(n);saveGame();
  banner(`Piano ${n} · ${BI.n}`,node.type==='final'?'IL RE DEI PORTALI TI ASPETTA':LV.boss?'UN BOSS TI ASPETTA':node.type==='tesoro'?'TANTE CASSE, POCHI MOSTRI':node.type==='mercante'?'MERCANTE E VITA PIENA':node.type==='elite'?'UN GOLEM ANTICO IN PIÙ':isCp&&n>1?'CHECKPOINT SALVATO':'SEGUI LE FRECCE D\'ORO',2600);setTimeout(()=>{if(mode==='play'&&mission)toast('Missione: '+mission.t(mission.need))},2700);
  music.setMood('explore');if(isCp&&n>1)music.stinger('checkpoint');updHud();updClock();updMission()}
function mkChest(x,z,bonus){const c=makeChest();c.g.position.set(x,groundH(x,z),z);c.g.rotation.y=rr(-.4,.4);world.add(c.g);addInter({kind:'chest',x,z,y:groundH(x,z),lid:c.lid,bonus})}
function mkBasket(x,z,crab){const b=makeBasket();b.g.position.set(x,groundH(x,z),z);world.add(b.g);const it=addInter({kind:'basket',x,z,y:groundH(x,z),lid:b.lid,crab,obj:b.g,t:rr(0,4)});if(crab)ANIM.push(dt=>{if(it.used)return false;it.t+=dt;b.g.rotation.z=(it.t%4)<.3?Math.sin(it.t*60)*.06:0;return true})}

// ================= Chambers: every room a new world, doors lock until it's cleared =================
function enemiesIn(rid){return ENT.filter(e=>!e.dead&&e.team==='enemy'&&!e.ghost&&LV.room[tileAt(e.x,e.z)]===rid)}
function enterBiome(b){LV.curBiome=b;const B=BIOMES[b];if(!B)return;LV.fogTint=STYLES[B.style].fog;const w=chooseWeather();if(w!==wName){setWeather(w);wFast=6}}
function chamberTick(dt){if(!LV||LV.camp||!LV.path)return;const k=tileAt(P.x,P.z),rid=k>=0?LV.room[k]:-1;
  if(LV.locked!=null){if(!enemiesIn(LV.locked).length)openChamber(LV.locked);
    // senza porte si può scappare: entrando in un'altra zona la battaglia resta aperta, senza ricompensa
    else if(LV.nat&&rid>=0&&rid!==LV.locked){LV.locked=null;LV.lastRid=-1}
    return}
  if(rid<0){LV.lastRid=-1;return}if(rid===LV.lastRid)return;LV.lastRid=rid;const r=LV.R[rid];if(!r)return;
  const newWorld=r.biome&&r.biome!==LV.curBiome;if(newWorld)enterBiome(r.biome);
  LV.cleared=LV.cleared||{};const onPath=LV.path.includes(r);const foes=onPath&&!LV.cleared[rid]&&!MP.on?enemiesIn(rid):[];
  if(!foes.length){if(onPath)LV.cleared[rid]=1;if(newWorld)banner(BIOMES[r.biome].n,THEMES[r.theme]?THEMES[r.theme].toUpperCase():'',1500);return}
  LV.locked=rid;for(const g of GATES)if(g.door&&(g.ra===rid||g.rb===rid)&&(g.open||g.lifting)){g.open=false;g.lifting=false;g.lowering=true}
  for(const e of foes)e.aggro=true;vib(25);if(!LV.nat)for(const a of allies)if(LV.room[tileAt(a.x,a.z)]!==rid){a.x=P.x+rr(-1,1);a.z=P.z+rr(-1,1);a.y=groundH(a.x,a.z)}
  computePD();sfx(LV.nat?'beep':'gate');shake=Math.max(shake,.15);banner('Sconfiggi tutti i mostri!',(BIOMES[r.biome]?BIOMES[r.biome].n:'').toUpperCase(),1700)}
function openChamber(rid){LV.locked=null;LV.cleared[rid]=1;for(const g of GATES)if(g.door&&(g.ra===rid||g.rb===rid)&&!g.open){g.lowering=false;g.lifting=true}
  sfx('secret');banner(LV.nat?'Zona liberata!':'Stanza completata!',LV.nat?'BOTTINO E MANA PIENO':'LE PORTE SI APRONO',1500);dropGold(P.x,P.z,8+floor*4);if(Math.random()<.3)dropItem(P.x,P.z,'potion');P.mp=P.maxMp}

// ================= Update =================
const inp={f:0,s:0};let atkDown=false,atkPrev=false,blockDown=false,joy={x:0,y:0};
function nearestInter(){for(const a of allies)if(a.down&&Math.hypot(a.x-P.x,a.z-P.z)<2.2)return{kind:'revive',a};if(MP.on)for(const r of MP.remotes.values())if(r.inGame&&r.hp<=0&&Math.hypot(r.x-P.x,r.z-P.z)<2.4)return{kind:'mprevive',r};let best=null,bd=2.5;for(const o of INTER){if(o.used&&!['portal','merchant','board'].includes(o.kind))continue;const d=Math.hypot(o.x-P.x,o.z-P.z);if(d<bd&&Math.abs((o.y||0)-P.y)<1.6){bd=d;best=o}}return best}
function interact(){if(mode!=='play')return;const o=nearestInter();if(!o)return;
  if(o.kind==='chest')openChest(o);else if(o.kind==='basket')openBasket(o);else if(o.kind==='lever')pullLever(o);else if(o.kind==='cage')freeCage(o);else if(o.kind==='idol')takeIdol(o);
  else if(o.kind==='merchant')openShop(o);else if(o.kind==='board')openBoard();else if(o.kind==='revive'){reviveAlly(o.a)}else if(o.kind==='mprevive'){MP.rvC=(MP.rvC|0)+1;MP.rvP=o.r.peer;mpSend(true);sfx('heal');burst(o.r.x,o.r.y+1,o.r.z,'#7be36b',20,3);toast(`Rialzi ${o.r.name}!`)}
  else if(o.kind==='portal'){if(MP.on){mpPortal();return}portalSolo()}}
function reviveAlly(a){a.down=0;a.hp=Math.round(a.maxHp*.5);burst(a.x,a.y+1,a.z,'#7be36b',20,3);sfx('heal');toast(`${a.name} è di nuovo in piedi!`)}
function fadeTo(fn){$('fade').style.opacity=1;sfx('portal');setTimeout(()=>{fn();setTimeout(()=>$('fade').style.opacity=0,80)},280)}
function drink(){if(P.potions<=0){toast('Nessuna pozione. Il mercante le vende');return false}if(P.hp>=P.maxHp){toast('Vita già piena');return false}P.potions--;const h=Math.round(P.maxHp*.5);P.hp=Math.min(P.maxHp,P.hp+h);sfx('drink');burst(P.x,P.y+1.2,P.z,'#ff7070',16,2.5);float(P.x,P.y+2.2,P.z,'+'+h,'#7be36b');return true}
function jump(){if(mode!=='play'||!P.onGround||P.falling>0)return;P.vy=8;P.onGround=false;sfx('jump')}
function dash(){if(mode!=='play'||P.dashCd>0)return;const f=[Math.sin(cam.yaw),Math.cos(cam.yaw)],R=[-Math.cos(cam.yaw),Math.sin(cam.yaw)];let dx=f[0]*inp.f+R[0]*inp.s,dz=f[1]*inp.f+R[1]*inp.s;const m=Math.hypot(dx,dz);if(m<.1){dx=Math.sin(P.yaw);dz=Math.cos(P.yaw)}else{dx/=m;dz/=m}P.dd=[dx,dz];P.dashT=.24;P.dashCd=.8;sfx('dash');burst(P.x,P.y+.3,P.z,'#ffffff',8,2)}
function toggleLock(){if(P.lock){P.lock=null;return}const f=new THREE.Vector3();camera.getWorldDirection(f);let best=null,bs=1e9;for(const e of ENT){if(e.dead||e.team!=='enemy')continue;const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d>20||!losClear(P.x,P.z,e.x,e.z))continue;const a=Math.abs(angDiff(Math.atan2(dx,dz),cam.yaw));const s=a*8+d;if(a<1.4&&s<bs){bs=s;best=e}}P.lock=best;if(best)sfx('beep')}
function attackersOn(t){let n=0;for(const e of ENT)if(!e.dead&&e.team==='enemy'&&e.tgt===t&&(e.wind>0||e.dashT>0))n++;return n}
function update(dt){
  inp.f=clamp((keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y,-1,1);inp.s=clamp((keys.KeyD||keys.ArrowRight?1:0)-(keys.KeyA||keys.ArrowLeft?1:0)+joy.x,-1,1);
  if(P.mpDown>0){inp.f=inp.s=0;mouseAtk=touchAtk=false}
  const w=P.inv[P.eq],b=w?WT[w.base]:null,now=performance.now()/1000;
  const f=[Math.sin(cam.yaw),Math.cos(cam.yaw)],R=[-Math.cos(cam.yaw),Math.sin(cam.yaw)];let dx=f[0]*inp.f+R[0]*inp.s,dz=f[1]*inp.f+R[1]*inp.s;const ml=Math.hypot(dx,dz);if(ml>1){dx/=ml;dz/=ml}
  const k=tileAt(P.x,P.z),inWater=k>=0&&LV.tile[k]===3&&P.y<-.4;
  let sp=5.4*pcl().spd*(P.block?.5:1)*(inWater?.6:1)*(1-.12*Wc.snow)*(P.drawT>0?.55:1)*(P.atkT>=0?.45:1)*(P.shadowT>0?1.3:1);
  if(P.falling>0){P.moving=P.mvx=P.mvz=0;P.falling-=dt;P.vy-=22*dt;P.y+=P.vy*dt;if(P.falling<=0){placeP(P.safe[0],P.safe[1],P.yaw);P.iT=1;hurtPlayer(Math.round(P.maxHp*.1),null,true);toast('Che volo! Torni sul bordo');$('fade').style.opacity=0}}
  else{if(P.chargeRun>0){P.chargeRun-=dt;dx=Math.sin(P.yaw);dz=Math.cos(P.yaw);sp=16;for(const e of ENT){if(e.dead||e.team!=='enemy'||P.chargeHit.has(e))continue;if(Math.hypot(e.x-P.x,e.z-P.z)<e.r+1.1){P.chargeHit.add(e);hitEnt(e,P.chargeDmg,{fromP:true,kx:dx,kz:dz,kb:12,stun:1.2});shake=.3}}if(Math.random()<.6)burst(P.x,P.y+.4,P.z,'#ffe0a0',3,2)}
    else if(P.dashT>0){P.dashT-=dt;dx=P.dd[0];dz=P.dd[1];sp=14}const ox=P.x,oz=P.z;moveEnt(P,dx*sp*dt,dz*sp*dt,true);
    {const vx=(P.x-ox)/Math.max(dt,1e-3),vz=(P.z-oz)/Math.max(dt,1e-3),f=Math.min(1,dt*15);P.mvx=lerp(P.mvx||0,vx,f);P.mvz=lerp(P.mvz||0,vz,f);P.moving=Math.hypot(P.mvx,P.mvz)}
    if(inWater){moveEnt(P,LV.flow[k*2]*2.2*dt,LV.flow[k*2+1]*2.2*dt,true);if(Math.random()<dt*8&&P.moving>.5)burst(P.x,-.32,P.z,'#cfe8ff',3,1.5,.4)}
    const g=groundH(P.x,P.z);if(P.onGround){if(g<P.y-.6)P.onGround=false;else P.y=lerp(P.y,g,Math.min(1,dt*18))}
    if(!P.onGround){P.vy-=22*dt;P.y+=P.vy*dt;if(P.y<=g&&P.vy<=0){P.y=g;P.vy=0;P.onGround=true;sfx('land')}if(P.y<-2.5){P.falling=.6;$('fade').style.opacity=1;P.combo=0}}
    if(P.onGround&&k>=0&&LV.tile[k]===0&&!LV.plate[k]&&Math.hypot(P.x/TS%1-.5,P.z/TS%1-.5)<.3)P.safe=[P.x,P.z];
    if(P.onGround&&k>=0&&LV.plate[k]){const pl=PLATES.find(p=>p.k===k&&!p.used);if(pl)pressPlate(pl)}}
  if(P.lock&&(P.lock.dead||Math.hypot(P.lock.x-P.x,P.lock.z-P.z)>24))P.lock=null;
  // il corpo guarda dove cammina; solo mischia e parata (e la prima persona) lo girano verso il bersaglio. Arco, magia e mira agganciata ruotano il busto.
  const melee=P.atkT>=0||P.block,ranged=P.drawT>0||P.castT>0||(P.lock&&!P.lock.dead),ay=aimYaw(),turn=Math.min(1,dt*12);
  if(P.chargeRun<=0){if(melee||cam.fp)faceAim();else if(P.moving>.3)P.yaw+=angDiff(Math.atan2(P.mvx,P.mvz),P.yaw)*turn;else if(ml>.1&&P.falling<=0)P.yaw+=angDiff(Math.atan2(dx,dz),P.yaw)*turn;else if(ranged)P.yaw+=angDiff(ay,P.yaw)*turn}
  P.twist=ranged&&!melee&&!cam.fp&&P.chargeRun<=0?clamp(angDiff(ay,P.yaw),-1.3,1.3):0;
  P.block=blockDown&&!P.drawT&&P.dashT<=0;if(blockDown&&!P.wasBlock)P.blockT=now;P.wasBlock=blockDown;
  atkDown=(mouseAtk||touchAtk)&&!P.block;
  if(atkDown&&!atkPrev&&touchAtk)autoAim(w);autoAimTick(dt);
  if(w){if(atkDown&&!atkPrev){if(b.kind==='bow')P.drawT=.001;else if(b.kind==='melee'){if(P.cd<=0&&P.atkT<0)startAttack(w);if(b.charge)P.chargeT=.001}else if(b.kind==='magic'&&P.cd<=0)castMagic(w)}
    if(atkDown){if(b.kind==='bow'){P.drawT=Math.min(1,P.drawT+dt/.8)}else if(b.kind==='melee'){if(b.charge){if(P.chargeT>0)P.chargeT+=dt}else if(P.cd<=0&&P.atkT<0)startAttack(w)}else if(b.kind==='magic'&&P.cd<=0)castMagic(w)}
    if(!atkDown&&atkPrev){if(b.kind==='bow'&&P.drawT>.05)fireBow(w,P.drawT);P.drawT=0;if(b.charge&&P.chargeT>.6){if(w.base==='sword'){startAttack(w,'spin');float(P.x,P.y+2.4,P.z,'ROTANTE!','#fff',1)}else{startAttack(w);quake(w)}}P.chargeT=0}}
  atkPrev=atkDown;
  if(P.atkT>=0){P.atkT+=dt/P.atkDur;if(!P.atkHit&&P.atkT>=.45){P.atkHit=true;applyMelee(w,P.atkKind==='spin'?2:1)}if(P.atkT>=1)P.atkT=-1}
  P.cd-=dt;P.castT=Math.max(0,P.castT-dt);P.dashCd-=dt;P.iT-=dt;P.abCd=Math.max(0,P.abCd-dt);P.mp=Math.min(P.maxMp,P.mp+8*dt);P.dance=Math.max(0,P.dance-dt);if(floor===0)P.hp=Math.min(P.maxHp,P.hp+25*dt);
  if(P.shadowT>0){P.shadowT-=dt;if(P.shadowT<=0)endShadow()}
  P.comboT-=dt;if(P.comboT<=0&&P.combo){P.combo=0;showCombo()}
  pdT-=dt;if(pdT<=0){pdT=.3;computePD()}
  let aggro=0,boss=null;for(const e of ENT){if(e.dead)continue;updEnt(e,dt);if(e.team==='enemy'&&e.aggro&&Math.hypot(e.x-P.x,e.z-P.z)<16)aggro++;if(e.boss&&e.aggro)boss=e}
  for(let i=0;i<ENT.length;i++){const a=ENT[i];if(a.dead||a.ghost||a.type==='dummy'||a.beh==='plant')continue;for(let j=i+1;j<ENT.length;j++){const c=ENT[j];if(c.dead||c.ghost||c.type==='dummy'||c.beh==='plant')continue;const ddx=c.x-a.x,ddz=c.z-a.z,d=Math.hypot(ddx,ddz),m=a.r+c.r;if(d<m&&d>.001){const p=(m-d)/2/d;moveEnt(a,-ddx*p,-ddz*p);moveEnt(c,ddx*p,ddz*p)}}}
  if(ENT.length>140)ENT=ENT.filter(e=>!e.dead);
  updProj(dt);updDrops(dt);updTraps(dt);updTurrets(dt);updMeteors(dt);updPet(dt);
  for(let i=ANIM.length-1;i>=0;i--)if(!ANIM[i](dt))ANIM.splice(i,1);
  for(const g of GATES){if(g.lifting&&!g.open){g.lift+=dt*(g.door?4:1.6);g.obj.position.y=g.lift;if(g.lift>=WALLH-.6){g.lift=WALLH-.6;g.open=true;g.lifting=false;computePD()}}else if(g.lowering){g.lift=Math.max(0,g.lift-dt*7);g.obj.position.y=g.lift;if(g.lift<=0)g.lowering=false}}
  chamberTick(dt);
  for(let i=FLOATS.length-1;i>=0;i--){const q=FLOATS[i];q.y+=dt*.9;q.life-=dt;if(q.life<=0)FLOATS.splice(i,1)}
  music.setMood(floor===0?'camp':boss?'boss':aggro>0||BOULDERS.length?'combat':'explore');
  if(boss){$('bossBar').hidden=false;$('bossName').textContent=boss.n;$('bossFill').style.transform=`scaleX(${Math.max(0,boss.hp/boss.maxHp)})`}else $('bossBar').hidden=true;
  const o=nearestInter(),pr=$('prompt');if(o){const t={chest:'Apri la cassa',basket:'Apri la cesta',lever:'Tira la leva',cage:'Libera il prigioniero',idol:'Prendi l\'idolo d\'oro',merchant:'Parla con il mercante',board:'Bacheca: costruisci e recluta',revive:'Rialza il compagno',mprevive:o.r?`Rialza ${o.r.name}`:'Rialza',portal:floor===0?'Portale: apri la grande mappa':(curNode()&&curNode().type==='final'?'Portale':'Portale: scegli la prossima strada')}[o.kind];
    pr.innerHTML=`<kbd>${isTouch?'USA':'E'}</kbd>`;pr.appendChild(document.createTextNode(t));pr.hidden=false;setUse(1)}else{pr.hidden=true;setUse(0)}
  hurtT=Math.max(0,hurtT-dt);$('hurt').style.opacity=hurtT*2.2;shake=Math.max(0,shake-dt);
  if(LV){const ti=Math.floor(P.x/TS),tj=Math.floor(P.z/TS);for(let j=tj-6;j<=tj+6;j++)for(let i=ti-6;i<=ti+6;i++)if(i>=0&&j>=0&&i<LV.gw&&j<LV.gh)LV.seen[tIdx(i,j)]=1}
  updHud()}
function updEnt(e,dt){if(e.dance>0)e.dance-=dt;if(e.ghost){mpGhost(e,dt);return}if(e.type==='dummy'){e.flash-=dt;flashMats(e,e.flash>0?0x606060:0);return}
  e.flash-=dt;if(e.mats)for(const m of e.mats)m.emissive&&m.emissive.setHex(e.flash>0?0x803020:(e.wind>0&&Math.sin(performance.now()/40)>0?0x601010:0));
  if(e.say){e.say.t-=dt;if(e.say.t<=0)e.say=null}if(e.sayCd>0)e.sayCd-=dt;
  if(Math.abs(e.kx)+Math.abs(e.kz)>.05){const sp=Math.hypot(e.kx,e.kz),hit=moveEnt(e,e.kx*dt,e.kz*dt);if(hit&&sp>5&&e.team==='enemy'){hitEnt(e,Math.round(sp*2),{chain:1});float(e.x,e.y+2,e.z,'SBAM!','#ff9a2a',1);e.kx=e.kz=0}const k=Math.pow(.03,dt);e.kx*=k;e.kz*=k}
  gravity(e,dt);if(e.y<-2.5){if(e.team==='enemy'){e.dead=true;stats.kills++;float(e.x,0,e.z,'GIÙ!','#ffe14a',1);gainXP(e.xp);dropGold(P.x+Math.sin(P.yaw),P.z+Math.cos(P.yaw),ri(e.gold[0],e.gold[1]));mission&&mission.on('kill',e);world.remove(e.obj)}else{e.x=P.x;e.z=P.z;e.y=P.y}return}
  if(e.burn>0||e.poison>0){e.dot+=dt;if(e.dot>.5){e.dot=0;const v=Math.max(1,Math.round(e.maxHp*(e.burn>0?.03:.025)));e.hp-=v;float(e.x,e.y+1.6,e.z,''+v,e.burn>0?'#ff8a3d':'#8dff5a');if(e.hp<=0&&e.team==='enemy'){killEnt(e);return}}e.burn-=dt;e.poison-=dt}
  e.slow-=dt;let lift=0;
  if(e.bubble>0){e.bubble-=dt;lift=Math.min(1.6,(3-e.bubble)*1.6);if(e.bubble<=0){const d=Math.round(e.maxHp*.18);e.hp-=d;float(e.x,e.y+1,e.z,'PLOP! '+d,'#bfe8ff',1);sfx('pop');if(e.hp<=0){killEnt(e);return}}}
  else if(e.poly>0){e.poly-=dt;if(!e.chick){e.chick=mesh(sph(.25),std({color:0xfff4e0}),0,.3,0);const hd=mesh(sph(.15),std({color:0xfff4e0}),0,.55,.18);hd.add(mesh(box(.06,.08,.08),M.red,0,.14,0));e.chick.add(hd);world.add(e.chick);e.obj.visible=false}
    e.yaw+=Math.sin(performance.now()/300+e.ph)*dt*3;moveEnt(e,Math.sin(e.yaw)*2*dt,Math.cos(e.yaw)*2*dt);e.chick.position.set(e.x,e.y+Math.abs(Math.sin(performance.now()/120))*.2,e.z);e.chick.rotation.y=e.yaw;if(Math.random()<.008)sfx('chicken');
    if(e.poly<=0){world.remove(e.chick);e.chick=null;e.obj.visible=true;burst(e.x,e.y+.5,e.z,'#ffffff',12,2)}return}
  else if(e.stun>0){e.stun-=dt}
  else if(e.kind==='ally')allyAI(e,dt);else monAI(e,dt);
  e.obj.position.set(e.x,e.y+lift,e.z);e.obj.rotation.y=e.yaw;animMon(e,dt);e.mv=0}
function animMon(e,dt){const t=performance.now()/1000,m=e.m||{};
  if(e.H)animHuman(e.H,{speed:e.mv||0,atk:e.atkT!=null&&e.atkT>=0?e.atkT:-1,atkKind:'swing',draw:e.drawT||0,cast:e.castT||0,dead:!!e.down,dance:e.dance>0},dt);
  if(e.type==='fungo'){e.obj.position.y+=Math.abs(Math.sin(t*(e.mv>.2?9:3)+e.ph))*(e.mv>.2?.35:.06);if(m.cap)m.cap.scale.y=.8+(e.wind>0?Math.sin(t*30)*.1:0)}
  if(e.type==='fatuo'){m.core.position.y=1.3+Math.sin(t*2+e.ph)*.25;m.halo.position.y=m.core.position.y;m.halo.scale.setScalar(1+Math.sin(t*5)*.12);if(Math.random()<dt*10)burst(e.x,e.y+m.core.position.y,e.z,'#'+m.col.toString(16).padStart(6,'0'),1,.4,.6,-1)}
  if(e.type==='golem'||e.type==='golemAntico'||e.type==='scimmione')(m.arms||[]).forEach((a,i)=>{a.rotation.x=e.wind>0?-2.4:Math.sin(t*3+i*3)*.4*(e.mv>.2?1:.2)});
  if(e.type==='draghetto'){m.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(t*14)*.5);m.head.rotation.x=e.wind>0?-.4:Math.sin(t*2)*.1}
  if(e.type==='pianta'){const open=e.wind>0?.9:.15+Math.abs(Math.sin(t*2+e.ph))*.15;m.top.rotation.x=-open;m.bot.rotation.x=open*.4;m.head.rotation.z=Math.sin(t+e.ph)*.15}
  if(e.type==='ragno')m.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*(e.mv>.2?16:2)+i*1.3)*.35);
  if(e.type==='crab'&&m.crab)m.crab.children.forEach((c,i)=>{if(i>4)c.rotation.x=Math.sin(t*12+i)*.4});
  if(e.type==='rePortali'){m.rocks.children.forEach((r,i)=>{const a=t*1.2+r.userData.a;r.position.set(Math.cos(a)*2.8,3.2+Math.sin(t*2+i)*.4,Math.sin(a)*2.8);r.rotation.x+=dt*2});m.ring.rotation.z+=dt*2;m.crown.rotation.y+=dt*.5;m.arms.forEach((a,i)=>a.rotation.x=e.wind>0?-2.6:Math.sin(t*2+i*3)*.3*(e.mv>.2?1:.3))}
  if(e.type==='idra')m.necks.forEach((nk,k)=>{const base=new THREE.Vector3((k-1)*.9,1.9,.8),a=t*1.3+k*2;const tip=new THREE.Vector3((k-1)*1.6+Math.sin(a)*.4,3.6+Math.sin(a*1.3)*.4+(e.wind>0&&k===e.biteHead?-1.2:0),2.2+Math.cos(a)*.3);
    nk.segs.forEach((s,i)=>{const q=i/7;s.position.lerpVectors(base,tip,q);s.position.y+=Math.sin(q*Math.PI)*.6});nk.hd.position.copy(tip);nk.hd.rotation.x=.3})}
function nearestFoe(e,range){let best=null,bd=range;const cands=[...(P.shadowT>0||P.mpDown>0?[]:[P]),...allies.filter(a=>!a.down&&!a.dead),...TURRETS,...mpFoes()];for(const t of cands){const d=Math.hypot(t.x-e.x,t.z-e.z);if(d<bd){bd=d;best=t}}return best}
function monAI(e,dt){const aggroR=(e.boss?14:8)*(1-.45*Wc.fog)+night()*2;
  if(e.tgt&&(e.tgt.dead||e.tgt.down||(e.tgt===P&&P.shadowT>0)||(e.tgt.life!=null&&e.tgt.life<=0)))e.tgt=null;
  let t=e.tgt||nearestFoe(e,e.aggro?30:aggroR);if(!e.aggro){if(t&&losClear(e.x,e.z,t.x,t.z)){e.aggro=true;if(e.boss){banner(e.n,'BOSS',2200);music.stinger('boss')}}else{if(e.fly)e.yaw+=dt*.5;return}}if(!t)return;e.tgt=t;
  const dx=t.x-e.x,dz=t.z-e.z,d=Math.hypot(dx,dz)||1,s=e.spd*(e.slow>0?.45:1)*dt,ya=Math.atan2(dx,dz),reach=e.r+.9;e.cd-=dt;
  const chase=sp=>{stepToward(e,t.x,t.z,sp);e.mv=sp/dt;e.yaw+=angDiff(ya,e.yaw)*Math.min(1,dt*8)};const can=()=>t!==P||attackersOn(P)<DIFF.tok;
  switch(e.beh){
    case'ranged':if(e.wind>0){e.wind-=dt;e.yaw=ya;if(e.wind<=0){e.cd=rr(2,3)*(DIFF.agg||1);const n=e.fire?3:1;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*.18,from=new THREE.Vector3(e.x,e.y+(e.fly?1.3:.8),e.z),dir=new THREE.Vector3(dx*Math.cos(a)+dz*Math.sin(a),0,-dx*Math.sin(a)+dz*Math.cos(a)).normalize();dir.y=((t.y||0)+1-from.y)/d;dir.normalize();
        shoot({mesh:mesh(sph(e.fire?.18:.14),glowM(e.fire?0xff7a2a:(e.m.col||0x7dff4a)),0,0,0,false),pos:from,vel:dir.multiplyScalar(10),team:'enemy',dmg:e.dmg,src:e})}sfx(e.fire?'fire':'spit')}}
      else{if(d<4){moveEnt(e,-dx/d*s,-dz/d*s);e.mv=s/dt}else if(d>8||!losClear(e.x,e.z,t.x,t.z))chase(s);e.yaw+=angDiff(ya,e.yaw)*Math.min(1,dt*6);if(e.cd<=0&&d<11&&losClear(e.x,e.z,t.x,t.z)&&can())e.wind=.6}break;
    case'plant':e.yaw+=angDiff(ya,e.yaw)*Math.min(1,dt*4);if(e.wind>0){e.wind-=dt;if(e.wind<=0){e.cd=1.6*(DIFF.agg||1);if(d<2.8){hurtTarget(t,e.dmg,e);sfx('bite')}}}else if(e.cd<=0&&d<2.6&&can())e.wind=.6;break;
    case'charger':if(e.dashT>0){e.dashT-=dt;const hit=moveEnt(e,e.cdx*9*dt,e.cdz*9*dt);e.mv=9;if(d<reach+.3){hurtTarget(t,e.dmg,e);e.dashT=0}else if(hit){e.dashT=0;e.stun=1.2;float(e.x,e.y+1.5,e.z,'BONK!','#ffe14a',1);sfx('land')}}
      else if(e.wind>0){e.wind-=dt;e.yaw=ya;if(e.wind<=0){e.dashT=.55;e.cdx=dx/d;e.cdz=dz/d;e.vy=3}}else if(e.cd<=0&&d<7&&losClear(e.x,e.z,t.x,t.z)&&can()){e.wind=.7;e.cd=rr(2.6,3.4)*(DIFF.agg||1)}else if(d>reach)chase(s*.8);break;
    case'crab':if(e.wind>0){e.wind-=dt;e.yaw=ya;if(e.wind<=0){e.cd=1.3*(DIFF.agg||1);if(d<reach+.5){hurtTarget(t,e.dmg,e);float(t.x,t.y+2,t.z,'PIZZICO!','#ff6b5a')}}}
      else if(d>2)chase(s);else{const px=-dz/d*e.orbit,pz=dx/d*e.orbit;if(moveEnt(e,px*s+(d>1.4?dx/d*s*.4:-dx/d*s*.3),pz*s+(d>1.4?dz/d*s*.4:-dz/d*s*.3)))e.orbit*=-1;e.mv=4;e.yaw=ya;if(e.cd<=0&&d<1.8&&can())e.wind=.45}break;
    case'boss':bossAI(e,t,dt,{d,dx,dz,s,reach,ya,chase});break;
    default:if(e.wind>0){e.wind-=dt;if(e.wind<=0){e.cd=rr(1.3,1.9)*(DIFF.agg||1);if(d<reach+.5)hurtTarget(t,e.dmg,e)}}else if(d>reach)chase(s);else if(e.cd<=0&&can())e.wind=.5;else e.yaw+=angDiff(ya,e.yaw)*Math.min(1,dt*6)}}
function bossMove(e,t,ux,uz){if(e.next==='hit'){const d=Math.hypot(t.x-e.x,t.z-e.z);shake=.3;sfx('boom');if(d<e.r+1.8)hurtTarget(t,e.dmg,e)}
  else if(e.next==='slam'){RINGS.push({x:e.x,z:e.z,y:e.y,r:.5,max:12,spd:8,from:'b',dmg:Math.round(e.dmg*1.1),hit:new Set()});shake=.5;sfx('boom')}
  else if(e.next==='volley'&&e.type==='rePortali'){const from=new THREE.Vector3(e.x+Math.sin(e.yaw)*.8,e.y+2.7,e.z+Math.cos(e.yaw)*.8),base=Math.atan2(ux,uz);for(let i=-3;i<=3;i++){const a=base+i*.2;shoot({mesh:mesh(sph(.28,10,8),glowM(0xb070ff),0,0,0,false),pos:from.clone(),vel:new THREE.Vector3(Math.sin(a)*11,-.9,Math.cos(a)*11),team:'enemy',dmg:Math.round(e.dmg*.6),src:e,life:3})}sfx('magic')}
  else if(e.next==='volley'){const idra=e.type==='idra';for(let i=-1;i<=1;i++){const a=Math.atan2(ux,uz)+i*.25,dist=Math.hypot(t.x-e.x,t.z-e.z);let from,v;
      if(idra){const hd=e.m.necks[i+1].hd;from=hd.getWorldPosition(new THREE.Vector3());v=new THREE.Vector3(t.x-from.x,(t.y+1)-from.y,t.z-from.z).normalize().multiplyScalar(12);v.x+=Math.cos(a)*i;shoot({mesh:mesh(sph(.3),glowM(0x60ff80),0,0,0,false),pos:from,vel:v,team:'enemy',dmg:Math.round(e.dmg*.7),src:e});continue}
      from=new THREE.Vector3(e.x,e.y+3,e.z);v=new THREE.Vector3(Math.sin(a)*dist/1.1,6,Math.cos(a)*dist/1.1);shoot({mesh:mesh(sph(.28),std({color:0x8a5a2a,roughness:.8}),0,0,0),pos:from,vel:v,team:'enemy',dmg:Math.round(e.dmg*.8),grav:11,src:e,aoe2:1.6})}sfx(idra?'fire':'swing')}
  else{const king=e.type==='rePortali';for(let i=0;i<(king?3:2);i++){const m=spawnMon(king?pick((BIOMES[LV.biome]||BIOMES.giungla).pool.concat(['fatuo','fungo'])):e.type==='idra'?'fatuo':'monkey',e.x+rr(-3,3),e.z+rr(-3,3),floor);m.aggro=true}if(king){banner('Il Re apre i portali!','ARRIVANO MOSTRI DA TUTTI I MONDI',1600);burst(e.x,e.y+2,e.z,'#b070ff',40,6);return}banner(e.type==='idra'?'Fuochi fatui in arrivo!':'Arrivano le scimmiette!','',1400)}}
// ---------- smarter allies ----------
function allyTarget(e){if(P.lock&&!P.lock.dead&&Math.hypot(P.lock.x-e.x,P.lock.z-e.z)<20)return P.lock;let best=null,bs=1e9;const base=order==='fermi'?e:P,range=order==='attacca'?18:11;
  for(const m of ENT){if(m.dead||m.team!=='enemy')continue;const d=Math.hypot(m.x-base.x,m.z-base.z);if(d>range)continue;let s=Math.hypot(m.x-e.x,m.z-e.z);if(m.tgt===P)s-=6;if(m.tgt===e)s-=3;if(m.boss)s-=2;if(s<bs&&losClear(e.x,e.z,m.x,m.z)){bs=s;best=m}}return best}
function allyAbility(e,tgt){const c=e.cls,d=tgt?Math.hypot(tgt.x-e.x,tgt.z-e.z):99;e.abCd=rr(9,13);
  if(c==='cavaliere'&&tgt&&d<8){e.dashTo=.35;e.dashDir=[(tgt.x-e.x)/d,(tgt.z-e.z)/d];for(const m of ENT)if(m.team==='enemy'&&!m.dead&&!m.boss&&Math.hypot(m.x-e.x,m.z-e.z)<7)m.tgt=e;float(e.x,e.y+2.4,e.z,'A ME!','#ffe14a');return true}
  if(c==='arciere'&&tgt){rainArrows(tgt.x,tgt.z,9,e.dmg*.8,false);float(e.x,e.y+2.4,e.z,'Pioggia!','#ffe14a');e.abCd=rr(13,16);return true}
  if(c==='mago'){const hurt=[P,...allies].filter(a=>!a.down&&a.hp<a.maxHp*.6).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];if(hurt){const h=Math.round(hurt.maxHp*.28);hurt.hp=Math.min(hurt.maxHp,hurt.hp+h);burst(hurt.x,hurt.y+1.2,hurt.z,'#7be36b',22,3);float(hurt.x,hurt.y+2.3,hurt.z,'+'+h,'#7be36b');sfx('heal');say(e,'heal');e.castT=.4;e.abCd=7;return true}
    if(tgt){meteor(tgt.x,tgt.z,e.dmg*2.2,2.6,false);e.abCd=16;return true}}
  if(c==='assassino'&&tgt&&!tgt.boss){const bx=tgt.x-Math.sin(tgt.yaw)*1.2,bz=tgt.z-Math.cos(tgt.yaw)*1.2;if(groundH(bx,bz)<50){burst(e.x,e.y+1,e.z,'#6a4a9a',14,2);e.x=bx;e.z=bz;e.y=groundH(bx,bz);hitEnt(tgt,e.dmg*2.5,{src:e,kx:0,kz:0});burst(e.x,e.y+1,e.z,'#6a4a9a',14,2);float(e.x,e.y+2.4,e.z,'Alle spalle!','#c8a0ff');return true}}
  if(c==='fabbro'&&tgt){spawnTurret(e.x+Math.sin(e.yaw)*1.2,e.z+Math.cos(e.yaw)*1.2,10,e.dmg*.8,true);e.abCd=24;return true}return false}
function allyAI(e,dt){if(e.down>0){e.down-=dt;if(e.down<=0){e.hp=Math.round(e.maxHp*.3);toast(`${e.name} si rialza`)}return}
  const cl=PCLASS[e.cls];e.cd-=dt;e.abCd-=dt;if(e.atkT>=0){e.atkT+=dt/.4;if(e.atkT>=1)e.atkT=-1}e.castT=Math.max(0,(e.castT||0)-dt);
  if(e.dashTo>0){e.dashTo-=dt;moveEnt(e,e.dashDir[0]*14*dt,e.dashDir[1]*14*dt);e.mv=12;for(const m of ENT)if(m.team==='enemy'&&!m.dead&&Math.hypot(m.x-e.x,m.z-e.z)<m.r+.9&&!m.hitByDash){m.hitByDash=1;hitEnt(m,e.dmg*1.8,{src:e,kx:e.dashDir[0],kz:e.dashDir[1],kb:9,stun:1});setTimeout(()=>m.hitByDash=0,500)}return}
  // dodge telegraphed attacks
  if(e.dodge>0){e.dodge-=dt;moveEnt(e,e.dodgeDir[0]*7*dt,e.dodgeDir[1]*7*dt);e.mv=7;return}
  for(const m of ENT){if(m.dead||m.team!=='enemy'||m.tgt!==e||!(m.wind>0&&m.wind<.35))continue;const d=Math.hypot(m.x-e.x,m.z-e.z);if(d<m.r+2.6&&Math.random()<.6){const px=-(m.z-e.z)/d,pz=(m.x-e.x)/d;e.dodge=.3;e.dodgeDir=[px*(Math.random()<.5?1:-1)-(m.x-e.x)/d*.5,pz-(m.z-e.z)/d*.5];say(e,'dodge');break}}
  // revive fallen friends when safe
  const fallen=allies.find(a=>a!==e&&a.down>0&&Math.hypot(a.x-e.x,a.z-e.z)<12);if(fallen&&!ENT.some(m=>!m.dead&&m.team==='enemy'&&Math.hypot(m.x-fallen.x,m.z-fallen.z)<5)){const d=Math.hypot(fallen.x-e.x,fallen.z-e.z);if(d>1.3){stepToward(e,fallen.x,fallen.z,e.spd*dt);e.mv=e.spd}else{e.revT=(e.revT||0)+dt;if(e.revT>1.4){e.revT=0;reviveAlly(fallen);say(e,'revive')}}return}
  const tgt=allyTarget(e);if(e.abCd<=0&&(tgt||(e.cls==='mago'&&[P,...allies].some(a=>a.hp<a.maxHp*.6)))){if(allyAbility(e,tgt)){e.abCd*=1-.12*(e.rar||0);return}}
  if(tgt){if(!e.engaged){e.engaged=1;say(e,'engage')}const dx=tgt.x-e.x,dz=tgt.z-e.z,d=Math.hypot(dx,dz)||1,ya=Math.atan2(dx,dz);e.yaw+=angDiff(ya,e.yaw)*Math.min(1,dt*10);
    if(cl.range<3){const i=allies.indexOf(e),ang=Math.atan2(e.x-tgt.x,e.z-tgt.z)+(i%3-1)*.6,sx=tgt.x+Math.sin(ang)*(tgt.r+1.1),sz=tgt.z+Math.cos(ang)*(tgt.r+1.1),sd=Math.hypot(sx-e.x,sz-e.z);
      if(d>cl.range+tgt.r-.2||sd>1.2){stepToward(e,d>cl.range+tgt.r+1?tgt.x:sx,d>cl.range+tgt.r+1?tgt.z:sz,e.spd*1.1*dt);e.mv=e.spd}
      if(d<cl.range+tgt.r+.3&&e.cd<=0&&e.atkT<0){e.atkT=0;e.cd=e.cls==='assassino'?.55:.85;setTimeout(()=>{if(!tgt.dead&&Math.hypot(tgt.x-e.x,tgt.z-e.z)<cl.range+tgt.r+.6){hitEnt(tgt,e.dmg*(e.cls==='assassino'&&Math.random()<.3?2:1),{src:e,kx:dx/d,kz:dz/d,kb:3});sfx('hit',.6)}},160)}}
    else{if(d<5){moveEnt(e,-dx/d*e.spd*.8*dt,-dz/d*e.spd*.8*dt);e.mv=4}else if(d>cl.range||!losClear(e.x,e.z,tgt.x,tgt.z)){stepToward(e,tgt.x,tgt.z,e.spd*dt);e.mv=e.spd}
      if(e.cd<=0){if(e.cls==='arciere'){e.drawT=Math.min(1,(e.drawT||0)+dt*2);if(e.drawT>=1){e.drawT=0;e.cd=.9;const from=new THREE.Vector3(e.x,e.y+1.4,e.z),dir=new THREE.Vector3(dx,(tgt.y+1)-(e.y+1.4),dz).normalize();const m=arrowMesh(null);m.lookAt(dir);shoot({mesh:m,pos:from,vel:dir.multiplyScalar(26),team:'ally',dmg:e.dmg,grav:2,arrow:1,src:e});sfx('arrow',.4)}}
        else{e.cd=1.1;e.castT=.3;const from=new THREE.Vector3(e.x,e.y+1.5,e.z),dir=new THREE.Vector3(dx,(tgt.y+1)-(e.y+1.5),dz).normalize();shoot({mesh:mesh(sph(.16),glowM(0xb06bff),0,0,0,false),pos:from,vel:dir.multiplyScalar(15),team:'ally',dmg:e.dmg,orb:'#b06bff',src:e});sfx('magic',.4)}}}
    return}
  e.engaged=0;e.drawT=0;
  for(const dr of DROPS)if(dr.what==='gold'&&Math.hypot(dr.x-e.x,dr.z-e.z)<5&&Math.hypot(dr.x-P.x,dr.z-P.z)>3){stepToward(e,dr.x,dr.z,e.spd*dt);e.mv=e.spd;return}
  if(order==='fermi')return;
  const i=allies.indexOf(e),n=allies.length,row=Math.floor(i/4),col=i%4-1.5,ang=P.yaw+Math.PI+col*.45,dist=2.2+row*1.4,tx=P.x+Math.sin(ang)*dist,tz=P.z+Math.cos(ang)*dist,d=Math.hypot(tx-e.x,tz-e.z);
  if(Math.hypot(P.x-e.x,P.z-e.z)>24){e.x=tx;e.z=tz;e.y=groundH(tx,tz);return}
  if(d>1){const sp=(d>5?7:4.8)*dt;stepToward(e,tx,tz,sp);e.mv=sp/dt;e.yaw+=angDiff(Math.atan2(tx-e.x,tz-e.z),e.yaw)*Math.min(1,dt*8)}else{e.yaw+=angDiff(P.yaw,e.yaw)*Math.min(1,dt*3);if(P.dance>0)e.dance=.2}}
function updTurrets(dt){for(let i=TURRETS.length-1;i>=0;i--){const t=TURRETS[i];t.life-=dt;t.cd-=dt;if(t.life<=0||t.hp<=0){world.remove(t.obj);burst(t.x,t.y+.8,t.z,'#c8a070',14,2);TURRETS.splice(i,1);continue}
  let best=null,bd=14;for(const e of ENT){if(e.dead||e.team!=='enemy')continue;const d=Math.hypot(e.x-t.x,e.z-t.z);if(d<bd&&losClear(t.x,t.z,e.x,e.z)){bd=d;best=e}}
  if(best){const ya=Math.atan2(best.x-t.x,best.z-t.z);t.head.rotation.y=ya;if(t.cd<=0){t.cd=.6;const from=new THREE.Vector3(t.x,t.y+1.1,t.z),dir=new THREE.Vector3(best.x-t.x,(best.y+1)-(t.y+1.1),best.z-t.z).normalize();const m=arrowMesh(null);m.lookAt(dir);shoot({mesh:m,pos:from,vel:dir.multiplyScalar(28),team:'ally',dmg:t.dmg,arrow:1});sfx('arrow',.35)}}}}
function updMeteors(dt){for(let i=METEORS.length-1;i>=0;i--){const m=METEORS[i];m.t+=dt;const k=Math.min(1,m.t/m.dur);m.rock.position.set(lerp(m.sx,m.x,k),lerp(m.gy+22,m.gy+.4,k),lerp(m.sz,m.z,k));m.ring.material.opacity=.4+.4*Math.sin(m.t*20);if(Math.random()<.8)burst(m.rock.position.x,m.rock.position.y,m.rock.position.z,'#ff8a30',2,1,.5,-2);
  if(k>=1){world.remove(m.rock);world.remove(m.ring);explode(m.x,m.gy+.5,m.z,m.r,m.dmg,false,null,m.fromP);shake=.5;METEORS.splice(i,1)}}}
function updPet(dt){if(!pet||floor<0)return;const t=performance.now()/1000,tx=P.x+Math.sin(P.yaw+2.2)*1.6,tz=P.z+Math.cos(P.yaw+2.2)*1.6;pet.cd-=dt;
  let goal=[tx,tz];const gold=DROPS.find(d=>d.what==='gold'&&Math.hypot(d.x-P.x,d.z-P.z)<9&&d.t>.4);if(gold)goal=[gold.x,gold.z];
  pet.x=lerp(pet.x,goal[0],Math.min(1,dt*(gold?4:2.5)));pet.z=lerp(pet.z,goal[1],Math.min(1,dt*(gold?4:2.5)));pet.y=lerp(pet.y,Math.max(0,groundH(pet.x,pet.z))+1.6+Math.sin(t*3)*.2,Math.min(1,dt*4));
  if(gold&&Math.hypot(gold.x-pet.x,gold.z-pet.z)<.8){gold.x=P.x;gold.z=P.z}
  const foe=ENT.find(e=>!e.dead&&e.team==='enemy'&&Math.hypot(e.x-pet.x,e.z-pet.z)<6);let yaw=Math.atan2(goal[0]-pet.x,goal[1]-pet.z);
  if(foe){yaw=Math.atan2(foe.x-pet.x,foe.z-pet.z);if(pet.cd<=0){pet.cd=3;const d=Math.round((5+P.lvl*.9)*(1+.2*rankIdx(P.lvl)));for(let i=0;i<10;i++)setTimeout(()=>burst(lerp(pet.x,foe.x,i/10),pet.y-i*.05,lerp(pet.z,foe.z,i/10),'#ff9a30',3,1,.4,0),i*25);hitEnt(foe,d,{});sfx('fire',.5)}}
  pet.obj.position.set(pet.x,pet.y,pet.z);pet.obj.rotation.y=yaw;pet.wings.forEach((w,i)=>w.rotation.z=(i?-1:1)*Math.sin(t*16)*.6)}
function updProj(dt){for(let i=PROJ.length-1;i>=0;i--){const p=PROJ[i];p.life-=dt;p.vel.y-=(p.grav||0)*dt;p.pos.addScaledVector(p.vel,dt);p.mesh.position.copy(p.pos);if(p.arrow)p.mesh.lookAt(p.pos.clone().add(p.vel));
  let dead=p.life<=0;const g=groundH(p.pos.x,p.pos.z);if(p.pos.y<g){dead=true;if(p.aoe)explode(p.pos.x,p.pos.y,p.pos.z,p.aoe,Math.round(p.dmg*.8),false,p.w,p.fromP);else if(p.aoe2){burst(p.pos.x,g+.2,p.pos.z,'#a07040',14,3);if(Math.hypot(P.x-p.pos.x,P.z-p.pos.z)<p.aoe2)hurtPlayer(p.dmg,null,true)}
    else if(p.splash){burst(p.pos.x,g+.1,p.pos.z,'#e0d0b0',4,1.5);for(const e of ENT)if(!e.dead&&e.team==='enemy'&&Math.hypot(e.x-p.pos.x,e.z-p.pos.z)<p.splash)hitEnt(e,p.dmg,{fromP:p.fromP})}else burst(p.pos.x,p.pos.y,p.pos.z,p.orb||'#ffffff',5,2)}
  if(!dead&&(p.team==='ally'||p.team==='trap')&&!p.splash){for(const e of ENT){if(e.dead||p.hits.has(e)||e.down)continue;if(p.team==='ally'&&e.team==='ally')continue;if(e.team==='dummy'&&p.team!=='ally')continue;const ey=e.y+(e.fly?.9:0);if(Math.hypot(e.x-p.pos.x,e.z-p.pos.z)<e.r+.35&&p.pos.y>ey-.2&&p.pos.y<ey+2.4){p.hits.add(e);const v=p.vel.clone().setY(0).normalize();
      if(e.team==='ally')hitEnt(e,p.dmg,{});else hitEnt(e,p.dmg,{w:p.w,fromP:!!p.fromP,src:p.src,kx:v.x,kz:v.z,kb:2});if(p.aoe){explode(p.pos.x,p.pos.y,p.pos.z,p.aoe,Math.round(p.dmg*.8),false,p.w,p.fromP);dead=true;break}if(!p.pierce){dead=true;break}}}
    if(p.team==='ally')for(const b of INTER)if(b.kind==='basket'&&!b.used&&Math.hypot(b.x-p.pos.x,b.z-p.pos.z)<.7){openBasket(b);dead=true}}
  if(!dead&&(p.team==='enemy'||p.team==='trap')){if(P.shadowT<=0&&Math.hypot(P.x-p.pos.x,P.z-p.pos.z)<.6&&p.pos.y>P.y&&p.pos.y<P.y+1.9){hurtPlayer(p.dmg,p.src||{x:p.pos.x-p.vel.x,z:p.pos.z-p.vel.z});dead=true}
    else{for(const a of allies)if(!a.down&&Math.hypot(a.x-p.pos.x,a.z-p.pos.z)<.6&&p.pos.y>a.y&&p.pos.y<a.y+1.9){hitEnt(a,p.dmg,{});dead=true;break}for(const t of TURRETS)if(Math.hypot(t.x-p.pos.x,t.z-p.pos.z)<.6){t.hp-=p.dmg;dead=true}if(!dead)for(const rm of mpFoes())if(Math.hypot(rm.x-p.pos.x,rm.z-p.pos.z)<.6&&p.pos.y>rm.y&&p.pos.y<rm.y+1.9){mpHurtRemote(rm,p.dmg);dead=true;break}}}
  if(dead){world.remove(p.mesh);PROJ.splice(i,1)}}}
function updDrops(dt){for(let i=DROPS.length-1;i>=0;i--){const d=DROPS[i];d.t+=dt;const g=groundH(d.x,d.z);if(d.vy!==0||d.y>g+.3){d.vy-=18*dt;d.y+=d.vy*dt;const nx=d.x+d.vx*dt,nz=d.z+d.vz*dt;if(groundH(nx,nz)<d.y){d.x=nx;d.z=nz}if(d.y<g+.3){d.y=g+.3;d.vy=0;d.vx=d.vz=0}}
  if(g<-2&&d.what!=='weapon'){world.remove(d.o);DROPS.splice(i,1);continue}const dist=Math.hypot(d.x-P.x,d.z-P.z);if(d.what==='gold'&&dist<3&&d.t>.4){d.x+=(P.x-d.x)*dt*7;d.z+=(P.z-d.z)*dt*7}
  d.o.position.set(d.x,d.y+Math.sin(d.t*3)*.08,d.z);d.o.rotation.y+=dt*2.5;let got=dist<1&&d.t>.4&&Math.abs(d.y-P.y)<2;
  if(!got&&d.what==='gold'&&d.t>.4)for(const a of allies)if(Math.hypot(d.x-a.x,d.z-a.z)<.9){got=true;break}
  if(got){world.remove(d.o);DROPS.splice(i,1);if(d.what==='gold'){P.gold+=d.amt;sfx('coin');float(d.x,d.y+1,d.z,'+'+d.amt,'#ffc53d')}else if(d.what==='potion'){P.potions++;sfx('buy');toast('Pozione nello zaino (R per berla)')}else if(d.what==='armor')addArmor(d.w);else addWeapon(d.w)}}}
function addWeapon(w){if(P.inv.length>=6){const g=Math.round(w.value*.5);P.gold+=g;toast(`Zaino pieno: ${w.name} venduta per ${g} oro`);return}P.inv.push(w);sfx('chest');renderSlots();toast(`Trovata: ${w.name} (${RAR[w.rar].n}). Tasto ${P.inv.length}`);if(w.rar>=2||FUN.includes(w.base))banner(w.name,RAR[w.rar].n.toUpperCase(),1800)}
function updTraps(dt){for(let i=BOULDERS.length-1;i>=0;i--){const b=BOULDERS[i];if(b.dead){BOULDERS.splice(i,1);continue}b.life-=dt;b.rum-=dt;const d=Math.hypot(P.x-b.x,P.z-b.z);if(b.rum<=0){b.rum=.3;sfx('rumble',clamp(1-d/16,.1,1))}shake=Math.max(shake,clamp(.35-d*.025,0,.35));
    if(b.life<=0){breakBoulder(b,false);continue}const mx=b.tx-b.x,mz=b.tz-b.z,m=Math.hypot(mx,mz),sp=4.4*dt;
    if(m<=sp){b.x=b.tx;b.z=b.tz;const c=tileAt(b.x,b.z);let bc=-1,bv=1e9;if(PD&&c>=0){const ci=c%LV.gw,cj=(c/LV.gw)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=tIdx(ci+di,cj+dj),v=PD[nc];if(v>=0&&v<bv){bv=v;bc=nc}}}if(bc>=0){b.tx=(bc%LV.gw+.5)*TS;b.tz=(((bc/LV.gw)|0)+.5)*TS}}
    else{b.x+=mx/m*sp;b.z+=mz/m*sp;b.obj.rotateOnWorldAxis(new THREE.Vector3(mz/m,0,-mx/m),sp/1.15)}
    const g=groundH(b.x,b.z);b.y=lerp(b.y,g,Math.min(1,dt*10));if(g<-2){b.y-=dt*12;if(b.y<-6){b.dead=true;world.remove(b.obj);banner('Il masso è precipitato!','',1400)}}b.obj.position.set(b.x,b.y+1.15,b.z);
    for(const e of ENT)if(!e.dead&&e.team==='enemy'&&!e.boss&&Math.hypot(e.x-b.x,e.z-b.z)<1.5){e.hp=0;float(e.x,e.y+1.5,e.z,'SPLAT!','#ffe14a',1);killEnt(e)}
    if(d<1.5&&Math.abs(P.y-b.y)<1.5){if(hurtPlayer(Math.round(P.maxHp*.3),null,true))banner('Schiacciato!','',1000);breakBoulder(b,false)}}
  for(let i=ROCKS.length-1;i>=0;i--){const r=ROCKS[i];if(r.wait>0){r.wait-=dt;r.ring.material.opacity=.4+.4*Math.sin(performance.now()/60);continue}r.vy-=30*dt;r.y+=r.vy*dt;r.obj.position.y=r.y;
    if(r.y<=r.gy+.9){world.remove(r.obj);world.remove(r.ring);ROCKS.splice(i,1);shake=.5;sfx('boom');burst(r.x,r.gy+.5,r.z,'#a89a80',30,6,1);if(Math.hypot(P.x-r.x,P.z-r.z)<1.3)hurtPlayer(Math.round(P.maxHp*.25),null,true);for(const e of ENT)if(!e.dead&&e.team==='enemy'&&Math.hypot(e.x-r.x,e.z-r.z)<1.4)hitEnt(e,999,{})}}
  for(let i=RINGS.length-1;i>=0;i--){const r=RINGS[i];r.r+=r.spd*dt;for(let q=0;q<10;q++){const a=rr(0,6.28),x=r.x+Math.cos(a)*r.r,z=r.z+Math.sin(a)*r.r;PA[pIdx]={x,y:groundH(x,z)+.1,z,vx:0,vy:2,vz:0,r:1,g:r.from==='b'?.5:.9,b:r.from==='b'?.2:.4,life:.3,ml:.3,grav:4};pIdx=(pIdx+1)%PN}
    if(r.from==='b'){const d=Math.hypot(P.x-r.x,P.z-r.z);if(!r.hit.has(P)&&Math.abs(d-r.r)<.6){r.hit.add(P);if(P.onGround&&Math.abs(P.y-r.y)<1)hurtPlayer(r.dmg,null,true);else float(P.x,P.y+2.3,P.z,'SCHIVATA!','#7be36b',1)}
      for(const rm of mpFoes())if(!r.hit.has(rm)&&Math.abs(Math.hypot(rm.x-r.x,rm.z-r.z)-r.r)<.6){r.hit.add(rm);if(!rm.air)mpHurtRemote(rm,r.dmg)}
      for(const a of allies)if(!r.hit.has(a)&&!a.down&&Math.abs(Math.hypot(a.x-r.x,a.z-r.z)-r.r)<.6){r.hit.add(a);if(Math.random()<.5){a.vy=7;float(a.x,a.y+2.3,a.z,'Hop!','#7be36b')}else hitEnt(a,r.dmg*.6,{})}}
    else for(const e of ENT){if(e.dead||r.hit.has(e)||e.team!=='enemy')continue;const d=Math.hypot(e.x-r.x,e.z-r.z);if(d<r.r){r.hit.add(e);const m=d||1;hitEnt(e,ri(r.w.min,r.w.max)*1.6,{w:r.w,fromP:true,kx:(e.x-r.x)/m,kz:(e.z-r.z)/m,kb:9})}}
    if(r.from==='p')for(const b of BOULDERS)if(Math.hypot(b.x-r.x,b.z-r.z)<r.r)breakBoulder(b,true);if(r.r>=r.max)RINGS.splice(i,1)}}

// ================= Camera & player visual =================
const camPos=new THREE.Vector3(),camTgt=new THREE.Vector3(),hv=new THREE.Vector3();
function updCamera(dt){if(P.lock&&!P.lock.dead&&!P.autoLock)cam.yaw+=angDiff(Math.atan2(P.lock.x-P.x,P.lock.z-P.z),cam.yaw)*Math.min(1,dt*5);
  else if(isTouch&&!cam.fp&&(P.moving||0)>1&&performance.now()/1000-UX.lastLook>1.2&&!P.lock&&P.chargeRun<=0){const d=angDiff(P.yaw,cam.yaw);if(Math.abs(d)<1.9)cam.yaw+=d*Math.min(1,dt*.9)}
  const f=new THREE.Vector3(Math.sin(cam.yaw),0,Math.cos(cam.yaw)),R=new THREE.Vector3(-Math.cos(cam.yaw),0,Math.sin(cam.yaw));
  if(cam.fp){camera.near=.05;camera.updateProjectionMatrix();H.head.visible=false;(H.eye||H.head).getWorldPosition(hv);const p=cam.fpPitch;camera.position.set(hv.x+f.x*.12,hv.y+.06,hv.z+f.z*.12);if(shake>0)camera.position.add(new THREE.Vector3(rr(-1,1),rr(-1,1),0).multiplyScalar(shake*.08));
    camTgt.copy(camera.position).add(new THREE.Vector3(f.x*Math.cos(p),-Math.sin(p),f.z*Math.cos(p)));camera.lookAt(camTgt);return}
  camera.near=.1;camera.updateProjectionMatrix();H.head.visible=true;const tgt=new THREE.Vector3(P.x,P.y+1.55,P.z).addScaledVector(R,.55);const back=cam.dist*Math.cos(cam.pitch),up=cam.dist*Math.sin(cam.pitch);
  const want=tgt.clone().addScaledVector(f,-back).add(new THREE.Vector3(0,up,0));let tt=1;for(let s=1;s<=20;s++){const k=s/20,x=lerp(tgt.x,want.x,k),y=lerp(tgt.y,want.y,k),z=lerp(tgt.z,want.z,k);const gh_=groundH(x,z),top=gh_>50?WALLH:gh_;if(top>y-.3){tt=Math.max(.15,(s-1)/20);break}}
  camPos.copy(tgt).lerp(want,tt);camera.position.lerp(camPos,Math.min(1,dt*14));if(shake>0)camera.position.add(new THREE.Vector3(rr(-1,1),rr(-1,1),rr(-1,1)).multiplyScalar(shake*.25));
  camera.lookAt(tgt.clone().addScaledVector(f,2))}
function updPlayerVisual(dt){pRoot.position.set(P.x,P.y,P.z);pRoot.rotation.y=P.yaw;pRoot.visible=!(P.falling>0&&P.y<-4);const w=P.inv[P.eq];
  animHuman(H,{speed:P.onGround?P.moving||0:0,air:!P.onGround,atk:P.atkT,atkKind:P.atkKind,block:P.block||P.chargeRun>0?1:0,draw:P.drawT,cast:P.castT>0?1:0,dance:P.dance>0&&!cam.fp,fp:cam.fp,dead:P.mpDown>0,twist:P.twist||0},dt);
  if(P.iT>0&&!cam.fp)pRoot.visible=Math.sin(performance.now()/40)>-.3;
  if(shieldObj&&shieldObj.visible){const blk=P.block||P.chargeRun>0;orientChild(shieldObj,pRoot,blk?0:Math.PI/2,0,0);shieldObj.position.set(blk?-.05:.06,-.05,blk?.12:0)}
  if(weaponObj&&w&&w.base==='bow'){orientChild(weaponObj,pRoot,0,cam.fp?-cam.fpPitch:0,0);weaponObj.position.set(0,0,.05);const s=weaponObj.userData.string;if(s)s.position.x=-.04-P.drawT*.3}
  if(auraObj){auraObj.rotation.z+=dt;auraObj.material.opacity=.35+.2*Math.sin(performance.now()/300);auraObj.visible=!cam.fp;if(Math.random()<dt*6&&!cam.fp)burst(P.x+rr(-.5,.5),P.y+.1,P.z+rr(-.5,.5),RANKS[rankIdx(P.lvl)][2],1,.6,.8,-1.5)}
  if(weaponObj&&w&&w.base!=='bow'&&P.chargeT>.6)burst(P.x+Math.sin(P.yaw)*.8,P.y+1.4,P.z+Math.cos(P.yaw)*.8,'#ffe14a',1,.5,.3,0)}
