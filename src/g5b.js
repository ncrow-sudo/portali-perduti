// ================= v2: boss con fasi e attacchi da schivare =================
// Ogni boss ha tre fasi (100-66-33%): al cambio di fase diventa invulnerabile un attimo, chiama rinforzi
// e sblocca attacchi nuovi. Gli attacchi pericolosi sono sempre annunciati (cerchi rossi, linea della carica).
const BOSS_MOVES={
  scimmione:[['hit','slam','carica','summon'],['hit','slam','carica','volley','carica'],['carica','slam','meteore','carica','summon']],
  idra:[['hit','volley','meteore','summon'],['volley','meteore','spirale','hit'],['spirale','meteore','volley','spirale','summon']],
  rePortali:[['volley','meteore','summon','hit'],['spirale','volley','carica','meteore'],['spirale','meteore','carica','spirale','summon']]};
const BOSS_HP={scimmione:760,idra:900,rePortali:2200},BOSS_DMG={scimmione:21,idra:19,rePortali:23};
for(const k in BOSS_HP){if(MDEF[k]){MDEF[k].hp=BOSS_HP[k];MDEF[k].dmg=BOSS_DMG[k]}}
if(MDEF.golemAntico){MDEF.golemAntico.hp=380;MDEF.golemAntico.dmg=24}
const TELE_G=new THREE.RingGeometry(.86,1,40),TELE_F=new THREE.CircleGeometry(1,40);
// cerchio rosso a terra che si riempie: quando è pieno esplode
function teleCircle(x,z,r,t,onDone){const y=groundH(x,z)<50?groundH(x,z)+.06:.06,g=new THREE.Group(),mr=new THREE.MeshBasicMaterial({color:0xff3020,transparent:true,opacity:.85,depthWrite:false}),mf=new THREE.MeshBasicMaterial({color:0xff5030,transparent:true,opacity:.35,depthWrite:false});
  const ring=new THREE.Mesh(TELE_G,mr),fill=new THREE.Mesh(TELE_F,mf);ring.rotation.x=fill.rotation.x=-Math.PI/2;g.add(ring,fill);g.position.set(x,y,z);g.scale.setScalar(r);fill.scale.setScalar(.01);world.add(g);let a=0;
  ANIM.push(dt=>{a+=dt;const k=Math.min(1,a/t);fill.scale.setScalar(.05+.95*k);mr.opacity=.6+.4*Math.sin(a*18);if(k<1)return true;world.remove(g);onDone&&onDone();return false})}
function bossAoe(e,x,z,r,dmg){burst(x,groundH(x,z)+.3,z,'#ff7a2a',18,5);burst(x,groundH(x,z)+.3,z,'#fff0a0',8,3);sfx('boom');shake=Math.max(shake,.25);
  if(Math.hypot(P.x-x,P.z-z)<r)hurtPlayer(dmg,null);for(const a of allies)if(!a.down&&Math.hypot(a.x-x,a.z-z)<r)hitEnt(a,dmg*.5,{});for(const rm of mpFoes())if(Math.hypot(rm.x-x,rm.z-z)<r)mpHurtRemote(rm,dmg)}
function bossPhase(e){const f=e.hp/e.maxHp;return f>.66?0:f>.33?1:2}
function bossAI(e,t,dt,o){const{d,dx,dz,s,reach,ya,chase}=o,ph=bossPhase(e);
  if(e.ph2==null)e.ph2=0;
  // cambio di fase: scudo, rinforzi, onda d'urto
  if(ph>e.ph2){e.ph2=ph;e.shield=2;e.wind=0;e.chargeT=0;banner(ph===1?'Il boss si arrabbia!':'Ultima fase!',ph===1?'NUOVI ATTACCHI':'ATTENTO: È FURIOSO',1800);music.stinger&&music.stinger('boss');shake=.6;sfx('boom');
    RINGS.push({x:e.x,z:e.z,y:e.y,r:.5,max:10,spd:9,from:'b',dmg:Math.round(e.dmg*.8),hit:new Set()});e.next='summon';bossMove(e,t,dx/d,dz/d);e.special=2.5;return}
  if(e.shield>0){e.shield-=dt;if(Math.random()<dt*20)burst(e.x+rr(-1,1)*e.r,e.y+rr(.5,2.5),e.z+rr(-1,1)*e.r,'#9adfff',2,1.5);return}
  // carica in corso
  if(e.chargeT>0){e.chargeT-=dt;const sp=15*dt,hit=moveEnt(e,e.cdx*sp,e.cdz*sp);e.mv=15;if(Math.random()<.5)burst(e.x,e.y+.3,e.z,'#c8b090',3,2);
    for(const tg of[P,...allies]){if(tg.down||e.chHit.has(tg))continue;if(Math.hypot(tg.x-e.x,tg.z-e.z)<e.r+.7){e.chHit.add(tg);hurtTarget(tg,Math.round(e.dmg*1.3),e);if(tg===P){shake=.5}}}
    if(hit){e.chargeT=0;e.stun=2.4;shake=.6;sfx('boom');float(e.x,e.y+e.r*2+1,e.z,'STORDITO!','#ffe14a',1);if(!e.toldStun){e.toldStun=1;toast('Il boss ha sbattuto: colpiscilo adesso, fa danno doppio!')}}
    else if(e.chargeT<=0)e.cd=.6;return}
  // spirale in corso: raffiche che ruotano
  if(e.spiralT>0){e.spiralT-=dt;e.spiralCd-=dt;e.yaw+=dt*1.2;if(e.spiralCd<=0){e.spiralCd=ph>=2?.11:.15;const n=e.type==='rePortali'?4:3,base=e.spiralA=(e.spiralA||0)+.33,col=e.type==='idra'?0x60ff80:0xb070ff;
      for(let i=0;i<n;i++){const a=base+i*Math.PI*2/n;shoot({mesh:mesh(sph(.24,8,6),glowM(col),0,0,0,false),pos:new THREE.Vector3(e.x+Math.sin(a)*e.r,e.y+1.2,e.z+Math.cos(a)*e.r),vel:new THREE.Vector3(Math.sin(a)*7.5,0,Math.cos(a)*7.5),team:'enemy',dmg:Math.round(e.dmg*.45),src:e,life:2.6})}sfx('magic',.25)}
    return}
  if(e.wind>0){e.wind-=dt;e.yaw=e.next==='carica'?e.yaw:ya;if(e.wind<=0)bossMove(e,t,dx/d,dz/d);return}
  const enr=ph>=2;if(d>reach+.6)chase(s*(enr?1.45:ph?1.2:1));else if(e.cd<=0){e.next='hit';e.wind=ph?.45:.55;e.cd=ph?1.3:1.7;e.biteHead=ri(0,2)}
  e.special-=dt;if(e.special<=0&&d<18){const L=(BOSS_MOVES[e.type]||BOSS_MOVES.scimmione)[ph];e.next=L[e.mi=((e.mi||0)+1)%L.length];if(e.next==='hit'){e.special=.5;return}
    e.special=(ph===0?4.2:ph===1?3.4:2.6)*(DIFF.agg||1);e.wind=.85;
    if(e.next==='slam'){float(e.x,e.y+4,e.z,'SALTA!','#ffe14a',1);if(!e.told){e.told=1;toast('Quando arriva l\'onda d\'urto, salta!')}}
    if(e.next==='carica'){e.wind=1;e.yaw=ya;e.cdx=dx/d;e.cdz=dz/d;float(e.x,e.y+4,e.z,'CARICA!','#ff6b5a',1);if(!e.toldCh){e.toldCh=1;toast('Spostati di lato quando il boss carica!')}
      const len=14,mid=new THREE.Vector3(e.x+e.cdx*len/2,0,e.z+e.cdz*len/2),ln=mesh(new THREE.PlaneGeometry(e.r*1.6,len),new THREE.MeshBasicMaterial({color:0xff3020,transparent:true,opacity:.4,depthWrite:false}),mid.x,groundH(mid.x,mid.z)<50?groundH(mid.x,mid.z)+.07:.07,mid.z,false);
      ln.rotation.x=-Math.PI/2;ln.rotation.z=-Math.atan2(e.cdx,e.cdz)+Math.PI;world.add(ln);let a=0;ANIM.push(dt=>{a+=dt;ln.material.opacity=.25+.25*Math.sin(a*20);if(a<1.05)return true;world.remove(ln);return false})}
    if(e.next==='meteore'){float(e.x,e.y+4,e.z,'ATTENTO AI CERCHI!','#ff6b5a',1);if(!e.toldM){e.toldM=1;toast('Esci dai cerchi rossi prima che si riempiano!')}}
    if(e.next==='spirale'){float(e.x,e.y+4,e.z,'SPIRALE!','#c88aff',1)}}}
// mosse nuove; le vecchie (hit, slam, volley, summon) restano in bossMove
const _bossMoveOld=bossMove;
bossMove=function(e,t,ux,uz){
  if(e.next==='carica'){e.chargeT=1.15;e.chHit=new Set();sfx('dash');shake=.2;return}
  if(e.next==='spirale'){e.spiralT=e.bossPh2Long?3:2.4;e.spiralCd=0;return}
  if(e.next==='meteore'){const n=e.ph2>=2?7:e.ph2?5:4,dmg=Math.round(e.dmg*1.1),targets=[P,...allies.filter(a=>!a.down)].slice(0,3);
    targets.forEach((tg,i)=>setTimeout(()=>teleCircle(tg.x,tg.z,2.1,1.35,()=>bossAoe(e,tg.x,tg.z,2.1,dmg)),i*180));
    for(let i=0;i<n-targets.length;i++){const a=rr(0,6.28),r=rr(3,9),x=t.x+Math.cos(a)*r,z=t.z+Math.sin(a)*r;if(groundH(x,z)>50)continue;setTimeout(()=>teleCircle(x,z,rr(1.8,2.6),1.5,()=>bossAoe(e,x,z,2.2,dmg)),300+i*140)}
    sfx('magic');return}
  return _bossMoveOld(e,t,ux,uz)};
