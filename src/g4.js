
// ================= Weapons =================
const WT={
  sword:{n:'Spada',kind:'melee',min:10,max:14,cd:.5,range:2.3,arc:.9,charge:'spin',kb:4,tip:'Tieni premuto: colpo rotante'},
  hammer:{n:'Martello del Tuono',kind:'melee',min:18,max:26,cd:.9,range:2.3,arc:1,cleave:1,charge:'quake',kb:8,tip:'Tieni premuto: terremoto che spacca i massi'},
  daggers:{n:'Pugnale Rapido',kind:'melee',min:6,max:9,cd:.26,range:1.9,arc:.8,critB:.15,kb:2,tip:'Velocissimo, tanti critici'},
  fish:{n:'Pesce Spada',kind:'melee',min:11,max:16,cd:.55,range:2.5,arc:.9,kb:11,fun:'SCIAF!',tip:'Schiaffi di pesce che lanciano lontano'},
  spring:{n:'Guantone a Molla',kind:'melee',min:10,max:14,cd:.65,range:3.4,arc:.45,kb:13,stun:.6,fun:'BOING!',tip:'Pugno a molla che arriva lontano',thrust:1},
  bow:{n:'Arco',kind:'bow',min:12,max:18,cd:.25,tip:'Tieni premuto per tendere: a piena carica trapassa'},
  wand:{n:'Bacchetta',kind:'magic',min:9,max:13,cd:.35,mana:6,tip:'Raffica magica'},
  staff:{n:'Bastone del Caos',kind:'magic',min:15,max:22,cd:.75,mana:14,aoe:2.4,tip:'Sfera che esplode'},
  bubble:{n:'Bacchetta Bolle',kind:'magic',min:6,max:9,cd:.6,mana:11,bubble:1,tip:'Chiude i nemici in bolle volanti'},
  chicken:{n:'Bacchetta Coccodè',kind:'magic',min:3,max:5,cd:.6,mana:10,poly:1,tip:'Trasforma i nemici in polli'},
};
const FUN=['fish','spring','bubble','chicken'],EPI=['Ruggito','Alba Nera','Mordiluna','Stella Cadente','Fauci del Drago','Cuore di Brace','Coccodrillo Felice'];
let uid=1;
function rollRarity(fl,b=0){const r=Math.random(),l=.02+fl*.006+b*.06,e=.09+fl*.012+b*.18,ra=.32+b*.2;return r<l?3:r<l+e?2:r<l+e+ra?1:0}
function makeWeapon(fl,rar,base){fl=Math.max(1,fl);const id=base||(Math.random()<.14?pick(FUN):pick(['sword','sword','hammer','daggers','bow','bow','wand','staff'])),b=WT[id],sc=(1+.2*(fl-1))*RAR[rar].m;
  let el=null;if(id==='wand'||id==='staff')el=pick(Object.keys(ELEM));else if(!FUN.includes(id)&&Math.random()<[0,.4,.7,.95][rar])el=pick(Object.keys(ELEM));
  return{id:uid++,base:id,name:b.n+(el?' '+ELEM[el].n:'')+(rar===3?' «'+pick(EPI)+'»':''),kind:b.kind,min:Math.round(b.min*sc),max:Math.round(b.max*sc),cd:b.cd,mana:b.mana||0,el,rar,value:Math.round((b.min+b.max)*sc*2.4)}}
function wStats(w){const b=WT[w.base];return`Danno ${w.min}–${w.max}${w.mana?' · '+w.mana+' mana':''}${w.el?' · '+ELEM[w.el].d:''}. ${b.tip}`}

// ================= Classes, levels, difficulty =================
const PCLASS={
  cavaliere:{n:'Cavaliere',hp:150,mp:40,spd:1,start:['sword'],shield:1,ab:'carica',abN:'Carica',cd:8,range:2.2,d:'Spada e scudo, tanta vita. Abilità: carica con lo scudo che travolge i nemici.'},
  arciere:{n:'Arciere',hp:110,mp:50,spd:1.1,start:['bow','daggers'],ab:'pioggia',abN:'Pioggia di frecce',cd:10,range:12,d:'Veloce e preciso da lontano. Abilità: una pioggia di frecce su un\'area.'},
  mago:{n:'Mago',hp:95,mp:110,spd:1,start:['staff','wand'],ab:'meteora',abN:'Meteora',cd:10,range:11,d:'Tanto mana e magie potenti. Abilità: una meteora che esplode al suolo.'},
  assassino:{n:'Assassino',hp:105,mp:50,spd:1.18,start:['daggers'],critB:.15,ab:'ombra',abN:'Ombra',cd:12,range:1.9,d:'Rapidissimo, critici altissimi. Abilità: diventa invisibile e il primo colpo fa il triplo.'},
  fabbro:{n:'Fabbro',hp:135,mp:50,spd:.95,start:['hammer'],shield:1,ab:'torretta',abN:'Torretta',cd:18,range:2.2,gold:1.25,d:'Martello e scudo. Abilità: costruisce una balestra automatica. Trova più oro e forgia a metà prezzo.'}};
const RANKS=[['Legno',1,'#b08860'],['Bronzo',10,'#d08a40'],['Argento',20,'#dfe6ee'],['Oro',30,'#ffc53d'],['Platino',40,'#7fe8e0'],['Diamante',50,'#b0e4ff']];
const xpNeed=l=>Math.round(30+l*l*1.5+l*12);
const rankIdx=l=>{let r=0;RANKS.forEach((k,i)=>{if(l>=k[1])r=i});return r};
const DIFFS={facile:{n:'Facile',hp:.7,dmg:.65,cnt:.9,tok:1},normale:{n:'Normale',hp:1.15,dmg:1.05,cnt:1.5,tok:3},eroico:{n:'Eroico',hp:1.6,dmg:1.5,cnt:1.9,tok:4}};
let DIFF=DIFFS.normale;

// ================= State =================
let mode='title',floor=0,seedBase=1,checkpoint=0,best=store.get('pp5_best',0);
const P={x:0,z:0,y:0,r:.4,vy:0,yaw:0,hp:150,maxHp:150,mp:60,maxMp:60,gold:40,potions:3,inv:[],eq:0,look:null,name:'Esploratore',cls:'cavaliere',lvl:1,xp:0,dmgM:1,onGround:true,
  atkT:-1,atkKind:'swing',atkHit:false,cd:0,chargeT:0,drawT:0,castT:0,block:false,blockT:0,dashT:0,dashCd:0,iT:0,dance:0,combo:0,comboT:0,safe:[0,0],lock:null,falling:0,abCd:0,shadowT:0,chargeRun:0,
  camp:{tenda:0,fucina:0,caserma:0},army:[],diff:'normale',view:'terza'};
const cam={yaw:0,pitch:.62,dist:7.5,fp:false,fpPitch:0};
let H=null,weaponObj=null,weapon2=null,shieldObj=null,auraObj=null,pRoot=new THREE.Group();scene.add(pRoot);
const stats={kills:0,chests:0,bosses:0,allies:0};
let ENT=[],PROJ=[],FLOATS=[],RINGS=[],BOULDERS=[],ROCKS=[],TURRETS=[],METEORS=[];
let order='segui';const ORD={segui:'seguimi',attacca:'attaccate',fermi:'fermi qui'};
const NAMES=['Lia','Teo','Mira','Bruno','Nina','Ugo','Zoe','Ivo','Greta','Leo','Ada','Rocco','Sofi','Dario','Elio','Vera','Tito','Bea','Gino','Luna'];
const squadCap=()=>3;
let allies=[];
const pcl=()=>PCLASS[P.cls];
function recalcStats(){const c=pcl(),l=P.lvl;P.maxHp=Math.round(c.hp*(1+.06*(l-1))+P.camp.tenda*20+armorHp());P.maxMp=Math.round(c.mp*(1+.03*(l-1)));P.dmgM=1+.05*(l-1)+.08*rankIdx(l)}
function buildPlayer(){pRoot.clear();setTimeout(()=>{const a=armorEq();applyArmorVisual(H,a?a.t:-1)},0);H=makeHumanoid(P.look,1,{cls:P.cls});pRoot.add(H.root);shieldObj=makeShield(P.look.shield);H.armL.hand.add(shieldObj);auraObj=null;equipVisual();setAura()}
function setAura(){if(auraObj)pRoot.remove(auraObj);const ri_=rankIdx(P.lvl);if(ri_<1){auraObj=null;return}auraObj=makeAura(RANKS[ri_][2]);pRoot.add(auraObj)}
function equipVisual(){if(!H)return;for(const o of[weaponObj,weapon2])if(o&&o.parent)o.parent.remove(o);weapon2=null;const w=P.inv[P.eq];shieldObj.visible=!!pcl().shield;if(!w)return;weaponObj=makeWeaponMesh(w);
  if(w.base==='bow'){H.armL.hand.add(weaponObj);shieldObj.visible=false}else{H.armR.hand.add(weaponObj);weaponObj.rotation.x=-.25;if(w.base==='daggers'&&!pcl().shield){weapon2=makeWeaponMesh(w);weapon2.rotation.x=-.25;H.armL.hand.add(weapon2)}}}

// ================= Monsters =================
const MDEF={
  fungo:{n:'Funghetto Saltellante',hp:20,dmg:6,spd:2.6,r:.45,beh:'melee',xp:8,gold:[3,7],mk:makeFungo},
  fatuo:{n:'Fuoco Fatuo',hp:16,dmg:7,spd:3,r:.35,beh:'ranged',fly:1,xp:10,gold:[3,8],mk:makeFatuo},
  golem:{n:'Golem di Muschio',hp:70,dmg:13,spd:1.7,r:.75,beh:'melee',xp:22,gold:[8,15],mk:()=>makeGolem(false)},
  draghetto:{n:'Draghetto di Fuoco',hp:32,dmg:8,spd:2.6,r:.55,beh:'ranged',fire:1,xp:15,gold:[6,12],mk:makeDraghetto},
  pianta:{n:'Pianta Carnivora',hp:40,dmg:11,spd:0,r:.6,beh:'plant',xp:12,gold:[4,9],mk:makePianta},
  ragno:{n:'Ragno di Cristallo',hp:26,dmg:9,spd:3.4,r:.5,beh:'charger',xp:13,gold:[5,10],mk:makeRagno},
  crab:{n:'Paguro Mimic',hp:50,dmg:11,spd:3.4,r:.5,beh:'crab',xp:20,gold:[20,35],mimic:1,mk:()=>{const m=makeCrab();m.crab.visible=true;m.lid.position.y=.95;return m}},
  monkey:{n:'Scimmietta',hp:22,dmg:6,spd:4.2,r:.35,beh:'melee',xp:6,gold:[2,5],mk:()=>{const h=makeHumanoid({build:'snello',skin:0,hairStyle:'calvo',hair:0,hat:'nessuno',shirt:0,pants:0,shield:0},.68,{skinC:'#8a6a4a',shirtC:'#5a3a1e',pantsC:'#5a3a1e'});return{g:h.root,H:h,mats:h.mats}}},
  golemAntico:{n:'Golem Antico',hp:220,dmg:20,spd:1.5,r:1.2,beh:'melee',elite:1,xp:70,gold:[40,60],mk:()=>makeGolem(true)},
  scimmione:{n:'Re Scimmione',hp:420,dmg:20,spd:2.8,r:1.1,beh:'boss',boss:1,xp:220,gold:[90,140],mk:()=>{const m=makeGorilla();m.g.scale.setScalar(1.25);return m}},
  rePortali:{n:'Il Re dei Portali',hp:1500,dmg:22,spd:1.7,r:2.2,beh:'boss',boss:1,xp:900,gold:[300,420],mk:makeRePortali},
  idra:{n:'Idra a Tre Teste',hp:520,dmg:18,spd:1.3,r:1.9,beh:'boss',boss:1,xp:280,gold:[110,160],mk:makeIdra}};
function addEnt(e){ENT.push(e);world.add(e.obj);e.y=groundH(e.x,e.z);return e}
function spawnMon(type,x,z,lvl){if(MP.client&&!MP.allowSpawn)return{dead:true,obj:new THREE.Group(),x,z,m:{}};const d=MDEF[type],m=d.mk(),k=(1+.25*(lvl-1))*DIFF.hp*(MP.on?1+.35*(MP.count-1):1)*(1+.5*(P.ng||0)),kd=(1+.18*(lvl-1))*DIFF.dmg*(1+.3*(P.ng||0));
  const e={kind:'mon',team:'enemy',type,n:d.n,x,z,y:0,vy:0,yaw:rr(0,6),cd:rr(.8,2),wind:0,flash:0,stun:0,poly:0,bubble:0,burn:0,poison:0,slow:0,dot:0,kx:0,kz:0,aggro:false,hpShow:0,ph:rr(0,6),
    hp:Math.round(d.hp*k),dmg:Math.round(d.dmg*kd),spd:d.spd,r:d.r,beh:d.beh,fly:!!d.fly,fire:d.fire,xp:Math.round(d.xp*(1+.15*(lvl-1))),gold:d.gold,boss:!!d.boss,elite:!!d.elite,mimic:!!d.mimic,obj:m.g,mats:m.mats,m,H:m.H,special:3,orbit:Math.random()<.5?1:-1};
  if(type==='monkey'){const tail=mesh(new THREE.TorusGeometry(.25,.04,6,12,Math.PI*1.4),std({color:0x5a3a1e}),0,.9,-.25);tail.rotation.y=Math.PI/2;m.g.add(tail)}
  e.maxHp=e.hp;e.mid=++MP.midC;e.obj.position.set(x,0,z);return addEnt(e)}

// ================= Allies =================
function makeAlly(d){const cl=PCLASS[d.cls],h=makeHumanoid(d.look,1,{cls:d.cls}),wb=cl.start[0],w=makeWeaponMesh({base:wb,rar:Math.min(3,Math.floor((d.lvl||1)/12)),el:null});
  if(wb==='bow')h.armL.hand.add(w);else{h.armR.hand.add(w);w.rotation.x=-.25}let sh=null;if(cl.shield){sh=makeShield(d.look.shield);h.armL.hand.add(sh)}
  const lvl=d.lvl||1,rk_=BRAR[d.rar|0]||BRAR[0],mh=Math.round(cl.hp*.7*(1+.07*(lvl-1))*rk_.m);
  const e={kind:'ally',team:'ally',cls:d.cls,name:d.name,look:d.look,data:d,x:P.x+rr(-1,1),z:P.z+rr(-1,1),y:0,vy:0,yaw:0,hp:mh,maxHp:mh,dmg:(cl.range>3?8:10)*(1+.08*(lvl-1))*rk_.m,rar:d.rar|0,spd:5.4*cl.spd,r:.4,obj:h.root,H:h,mats:h.mats,shield:sh,weapon:w,
    cd:rr(0,1),atkT:-1,flash:0,stun:0,poly:0,bubble:0,burn:0,poison:0,slow:0,dot:0,kx:0,kz:0,down:0,abCd:rr(3,8),lvl,drawT:0,dodge:0,say:null,sayCd:rr(2,6)};
  addBotAura(h,d.rar|0);e.obj.position.set(e.x,0,e.z);return addEnt(e)}
function newRecruit(cls,lvl,rar){return{rar:rar==null?rollBotRarity(Math.max(1,checkpoint)):rar,cls:cls||pick(Object.keys(PCLASS)),look:randLook(),name:pick(NAMES.filter(x=>!P.army.some(d=>d.name===x)))||pick(NAMES),lvl:lvl||1,xp:0,squad:true,id:uid++}}
const SAY={engage:['Ci penso io!','All\'attacco!','Eccone uno!','Copritemi!'],low:['Aiuto!','Sono ferito!','Mi serve una cura!'],heal:['Ti curo!','Tieni duro!'],kill:['Preso!','Uno in meno!','Facile!'],level:['Sono più forte!','Livello su!'],dodge:['Attento!','Di qua!'],revive:['Su, in piedi!','Ti rialzo!']};
function say(e,k){if(e.sayCd>0&&k!=='level')return;e.say={txt:pick(SAY[k]),t:2.2};e.sayCd=rr(5,9)}

// ================= Movement / collision =================
function canStand(x,z,y,r){for(const[a,b]of[[0,0],[r,0],[-r,0],[0,r],[0,-r]]){if(groundH(x+a,z+b)>y+.6)return false}return true}
let SOLIDS=[];
function moveEnt(e,dx,dz,isP){let hit=false;const y=e.y;if(dx&&canStand(e.x+dx,e.z,y,e.r))e.x+=dx;else if(dx)hit=true;if(dz&&canStand(e.x,e.z+dz,y,e.r))e.z+=dz;else if(dz)hit=true;
  for(const s of SOLIDS){const ddx=e.x-s.x,ddz=e.z-s.z,d=Math.hypot(ddx,ddz),m=s.r+e.r;if(d<m&&d>.001){e.x+=ddx/d*(m-d);e.z+=ddz/d*(m-d)}}return hit}
function losClear(x0,z0,x1,z1){const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/.4);for(let i=1;i<n;i++){const k=i/n;if(groundH(x0+(x1-x0)*k,z0+(z1-z0)*k)>50)return false}return true}
let PD=null,pdT=0;
function computePD(){if(!LV)return;PD=new Int16Array(LV.gw*LV.gh).fill(-1);const s=tileAt(P.x,P.z);if(s<0)return;PD[s]=0;const q=[s];for(let h=0;h<q.length;h++){const c=q[h],ci=c%LV.gw,cj=(c/LV.gw)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=ci+di,jj=cj+dj;if(ii<0||jj<0||ii>=LV.gw||jj>=LV.gh)continue;const nc=tIdx(ii,jj);if(PD[nc]>=0||!walkable(nc))continue;
  const hc=LV.h[c]+(LV.ramp[c]?LV.rh[c]/2:0),hn=LV.h[nc]+(LV.ramp[nc]?LV.rh[nc]/2:0);if(hc-hn>.9)continue;PD[nc]=PD[c]+1;q.push(nc)}}}
function stepToward(e,tx,tz,s){const dx=tx-e.x,dz=tz-e.z,d=Math.hypot(dx,dz);if(d<.05)return;if(losClear(e.x,e.z,tx,tz)&&Math.abs(groundH(tx,tz)-e.y)<1){moveEnt(e,dx/d*s,dz/d*s);return}
  if(!PD)return;const c=tileAt(e.x,e.z);if(c<0)return;let bc=-1,bv=1e9;const ci=c%LV.gw,cj=(c/LV.gw)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const nc=tIdx(ci+di,cj+dj);const v=PD[nc];if(v>=0&&v<bv){bv=v;bc=nc}}
  if(bc<0){moveEnt(e,dx/d*s,dz/d*s);return}const nx=(bc%LV.gw+.5)*TS,nz=(((bc/LV.gw)|0)+.5)*TS,mx=nx-e.x,mz=nz-e.z,m=Math.hypot(mx,mz)||1;moveEnt(e,mx/m*s,mz/m*s)}
function gravity(e,dt){if(e.fly){const g=Math.max(0,groundH(e.x,e.z));e.y=lerp(e.y,g,Math.min(1,dt*4));return}const g=groundH(e.x,e.z);if(e.y>g+.02||e.vy>0){e.vy-=20*dt;e.y+=e.vy*dt;if(e.y<=g){e.y=g;e.vy=0}}else{e.y=lerp(e.y,g,Math.min(1,dt*15));e.vy=0}}

// ================= Feedback =================
function float(x,y,z,txt,col,big){FLOATS.push({x,y,z,txt,col,life:1,big})}
function toast(t){const m=$('msg');m.textContent=t;m.style.opacity=1;clearTimeout(toast.tm);toast.tm=setTimeout(()=>m.style.opacity=0,2800)}
function banner(big,small,ms=2200){const b=$('banner');b.innerHTML='';const s=document.createElement('small');s.textContent=small||'';b.append(s,document.createTextNode(big));b.style.opacity=1;clearTimeout(banner.tm);banner.tm=setTimeout(()=>b.style.opacity=0,ms)}
function showCombo(){const c=$('combo');if(P.combo>=3){c.innerHTML='';const s=document.createElement('small');s.textContent='COMBO';c.append(s,document.createTextNode('x'+P.combo));c.style.opacity=1}else c.style.opacity=0}
let freeze=0,shake=0,hurtT=0;
function gainXP(n){if(P.lvl>=50)return;P.xp+=n;let up=false,rankUp=false;while(P.lvl<50&&P.xp>=xpNeed(P.lvl)){P.xp-=xpNeed(P.lvl);const r0=rankIdx(P.lvl);P.lvl++;up=true;if(rankIdx(P.lvl)>r0)rankUp=true}
  if(up){recalcStats();P.hp=P.maxHp;P.mp=P.maxMp;burst(P.x,P.y+1,P.z,RANKS[rankIdx(P.lvl)][2],40,5,1.2,2);if(rankUp){setAura();banner(`Rango ${RANKS[rankIdx(P.lvl)][0]}!`,`LIVELLO ${P.lvl} · ABILITÀ POTENZIATA`,3200);music.stinger('rank')}else{banner(`Livello ${P.lvl}!`,'PIÙ VITA E PIÙ DANNO',1800);music.stinger('level')}if(pet)pet.obj.scale.setScalar(.8+rankIdx(P.lvl)*.15);saveGame()}}
function allyXP(n){for(const a of allies){const d=a.data;d.xp=(d.xp||0)+n;if(d.xp>=xpNeed(d.lvl)*.8&&d.lvl<50){d.xp=0;d.lvl++;a.lvl=d.lvl;a.maxHp=Math.round(PCLASS[a.cls].hp*.7*(1+.07*(d.lvl-1))*(BRAR[d.rar|0]||BRAR[0]).m);a.hp=a.maxHp;a.dmg*=1.08;float(a.x,a.y+2.3,a.z,`${a.name} liv. ${d.lvl}`,'#7be36b');say(a,'level')}}}

// ================= Combat =================
function dmgMult(w){let m=1;if(w&&w.el==='fire')m*=1-.3*Wc.rain;if(w&&w.el==='shock')m*=1+.3*Wc.rain;return m}
function hitEnt(e,dmg,o={}){if(e.dead||e.down)return;const fromP=o.fromP;let crit=false;
  if(fromP){crit=Math.random()<(.1+(o.w&&WT[o.w.base].critB||0)+(pcl().critB||0));dmg*=(crit?1.8:1)*(1+Math.min(.5,P.combo*.04))*dmgMult(o.w)*P.dmgM;if(P.shadowT>0){dmg*=3;crit=true;endShadow()}P.combo++;P.comboT=2.5;showCombo();freeze=Math.max(freeze,crit?.07:.035)}
  dmg=Math.max(1,Math.round(dmg));
  if(e.team==='ally'){e.hp-=dmg;e.flash=.15;float(e.x,e.y+2,e.z,''+dmg,'#ff9a8a');if(e.hp<e.maxHp*.3)say(e,'low');if(e.hp<=0){e.hp=0;e.down=14;toast(`${e.name} è a terra! Avvicinati e premi Usa`)}return}
  if(e.type==='dummy'){e.flash=.12;float(e.x,e.y+2,e.z,(crit?'CRIT ':'')+dmg,crit?'#ffe14a':'#ffffff',crit);if(o.w&&WT[o.w.base].fun)float(e.x,e.y+2.5,e.z,WT[o.w.base].fun,'#7fe3ff',1);sfx(crit?'crit':'hit');return}
  e.hp-=dmg;e.flash=.12;e.aggro=true;e.hpShow=3;sfx(crit?'crit':'hit');float(e.x,e.y+1.2+e.r,e.z,(crit?'CRIT ':'')+dmg,crit?'#ffe14a':'#ffffff',crit);burst(e.x,e.y+1,e.z,o.w&&o.w.el?ELEM[o.w.el].c:'#ffffff',crit?14:7,3);
  if(e.ghost){mpDmg(e,dmg);return}
  if(o.src&&o.src.team==='ally')e.tgt=o.src;
  if(o.w){const b=WT[o.w.base];if(b.fun){float(e.x,e.y+2+e.r,e.z,b.fun,'#7fe3ff',1);sfx(o.w.base==='fish'?'slap':'boing')}if(o.w.el==='fire')e.burn=3;if(o.w.el==='ice')e.slow=2.5;if(o.w.el==='poison')e.poison=4;
    if(o.w.el==='shock'&&!o.chain){const n=ENT.find(k=>k!==e&&k.team==='enemy'&&!k.dead&&Math.hypot(k.x-e.x,k.z-e.z)<4);if(n){hitEnt(n,dmg*.5,{w:o.w,chain:1});burst((e.x+n.x)/2,e.y+1,(e.z+n.z)/2,'#fff36b',8,2)}}
    if(b.poly&&!e.boss&&!e.poly){e.poly=6;sfx('chicken');float(e.x,e.y+2,e.z,'COCCODÈ!','#ffd23a',1)}if(b.bubble&&!e.boss&&!e.bubble&&e.hp>0){e.bubble=3;sfx('pop');float(e.x,e.y+2,e.z,'BOLLA!','#bfe8ff',1)}}
  if(o.kb&&e.beh!=='plant'){const k=e.boss?.12:1/Math.max(.6,e.r*1.5);e.kx+=o.kx*o.kb*k;e.kz+=o.kz*o.kb*k}if(o.stun&&!e.boss)e.stun=Math.max(e.stun,o.stun);
  if(e.hp<=0)killEnt(e,o.w,o.src)}
function killEnt(e,w,src){if(e.dead||e.ghost)return;e.dead=true;stats.kills++;burst(e.x,e.y+1,e.z,'#ffffff',16,4);burst(e.x,e.y+1,e.z,pick(['#ffc53d','#6cc070','#4aa8ff','#ff6bf0']),16,4);
  dropGold(e.x,e.z,Math.round(ri(e.gold[0],e.gold[1])*(pcl().gold||1))+(e.stolen?e.stolen*2:0));gainXP(e.xp);allyXP(Math.round(e.xp*.5));float(e.x,e.y+2.6+e.r,e.z,`+${e.xp} XP`,'#b0e4ff');
  if(src&&src.kind==='ally')say(src,'kill');mission&&mission.on('kill',e);if(MP.host)mpKill(e);
  if(Math.random()<.1)dropItem(e.x,e.z,'potion');if(e.mimic||e.elite)dropItem(e.x,e.z,'weapon',makeWeapon(floor,Math.max(1,rollRarity(floor,1))));if(e.elite&&Math.random()<.45)dropItem(e.x+.5,e.z,'armor',makeArmor(rollArmorTier(floor,1)));
  if(e.boss){stats.bosses++;banner('Boss sconfitto!',e.n.toUpperCase(),3000);dropItem(e.x-1,e.z,'armor',makeArmor(rollArmorTier(floor,e.type==='rePortali'?3:2)));dropItem(e.x,e.z,'weapon',makeWeapon(floor,Math.max(2,rollRarity(floor,1))));dropItem(e.x+1,e.z,'potion');P.dance=3;for(const a of allies)a.dance=3;music.stinger('victory');if(e.type==='rePortali'){MP.fin=1;setTimeout(showVictory,2600)}}
  if(e.chick){world.remove(e.chick);e.chick=null}world.remove(e.obj)}
function hurtPlayer(d,src,force){if(mode!=='play'||P.falling>0||P.mpDown>0)return false;if(!force&&(P.iT>0||P.dashT>0||P.chargeRun>0))return false;
  if(P.block&&src&&!force){const ang=Math.atan2(src.x-P.x,src.z-P.z),diff=Math.abs(angDiff(ang,P.yaw)),sh=!!pcl().shield;if(diff<1.25){if(sh&&performance.now()/1000-P.blockT<.28){sfx('parry');float(P.x,P.y+2.2,P.z,'PARATA!','#7fe3ff',1);if(src.kind==='mon'&&!src.boss)src.stun=1.4;burst(P.x+Math.sin(P.yaw)*.6,P.y+1.2,P.z+Math.cos(P.yaw)*.6,'#ffffff',14,3);freeze=.08;return false}
    d*=sh?.15:.5;sfx('block');burst(P.x+Math.sin(P.yaw)*.6,P.y+1.2,P.z+Math.cos(P.yaw)*.6,'#ffe0a0',6,2)}}
  d=Math.max(1,Math.round(d*(1-armorDef())));P.hp-=d;P.iT=.4;hurtT=.35;shake=Math.max(shake,.25);sfx('hurt');P.combo=0;showCombo();float(P.x,P.y+2.1,P.z,'-'+d,'#ff6b5a');if(P.hp<=0)die();return true}
function hurtTarget(t,d,src){if(t===P)return hurtPlayer(d,src);if(t.kind==='remote')return mpHurtRemote(t,d);if(t.kind==='turret'){t.hp-=d;return true}hitEnt(t,d,{});return true}
let DROPS=[];const coinGeo=cyl(.12,.12,.04,10);coinGeo.rotateX(Math.PI/2);
function dropGold(x,z,n){const per=Math.max(1,Math.ceil(n/4));for(let i=0;i<Math.min(4,n);i++)DROPS.push(makeDrop(x,z,'gold',per))}
function dropItem(x,z,what,w){DROPS.push(makeDrop(x,z,what,0,w))}
function makeDrop(x,z,what,amt,w){let o;if(what==='gold')o=mesh(coinGeo,M.gold);else if(what==='potion'){o=new THREE.Group();o.add(mesh(sph(.13),std({color:0xe5333a,emissive:0x400000,roughness:.2})));o.add(mesh(cyl(.04,.05,.1,6),M.wood,0,.15,0))}
  else if(what==='armor'){o=new THREE.Group();const am=armorMat(w.t);o.add(mesh(box(.42,.4,.12),am));for(const s of[-1,1])o.add(mesh(sph(.11,8,6),am,s*.24,.16,0));o.scale.setScalar(.9)}else{o=makeWeaponMesh(w);o.scale.setScalar(.8)}const y=groundH(x,z);o.position.set(x,y+.5,z);world.add(o);const a=rr(0,6);return{o,x,z,y:y+.5,vy:rr(3,5),vx:Math.cos(a)*rr(1,2.5),vz:Math.sin(a)*rr(1,2.5),what,amt,w,t:0}}
function meleeTargets(range,arc,yaw){const out=[];for(const e of ENT){if(e.dead||e.team!=='enemy'&&e.type!=='dummy')continue;const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d>range+e.r||Math.abs(e.y-P.y)>2.2)continue;if(Math.abs(angDiff(Math.atan2(dx,dz),yaw))>arc)continue;out.push([d,e])}
  for(const b of INTER)if(b.kind==='basket'&&!b.used&&Math.hypot(b.x-P.x,b.z-P.z)<range+.4&&Math.abs(angDiff(Math.atan2(b.x-P.x,b.z-P.z),yaw))<arc)out.push([0,b]);
  return out.sort((a,b)=>a[0]-b[0]).map(v=>v[1])}
function aimDir(from){if(P.lock&&!P.lock.dead){const t=new THREE.Vector3(P.lock.x,P.lock.y+1,P.lock.z);return t.sub(from).normalize()}const f=new THREE.Vector3();camera.getWorldDirection(f);const tgt=camera.position.clone().addScaledVector(f,30);return tgt.sub(from).normalize()}
function aimPoint(dist){if(P.lock&&!P.lock.dead)return[P.lock.x,P.lock.z];return[P.x+Math.sin(P.yaw)*dist,P.z+Math.cos(P.yaw)*dist]}
function faceAim(){if(P.lock&&!P.lock.dead)P.yaw=Math.atan2(P.lock.x-P.x,P.lock.z-P.z);else P.yaw=cam.yaw}
function startAttack(w,kind){MP.atC=(MP.atC|0)+1;const b=WT[w.base];P.atkT=0;P.atkKind=kind||(b.thrust?'thrust':'swing');P.atkHit=false;P.atkDur=kind==='spin'?.55:w.base==='daggers'?.26:.42;P.cd=kind==='spin'?.6:w.cd;faceAim();sfx('swing')}
function applyMelee(w,mult){const b=WT[w.base];const spin=P.atkKind==='spin';const tg=meleeTargets(b.range,spin?Math.PI:b.arc,P.yaw);const list=b.cleave||spin?tg:tg.slice(0,1);
  for(const e of list){if(e.kind==='basket'){openBasket(e);continue}const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz)||1;hitEnt(e,ri(w.min,w.max)*mult,{w,fromP:true,kx:dx/d,kz:dz/d,kb:(b.kb||3)*(spin?1.2:1),stun:b.stun})}
  for(const bo of BOULDERS)if(w.base==='hammer'&&Math.hypot(bo.x-P.x,bo.z-P.z)<3)breakBoulder(bo,true)}
function quake(w){P.cd=1;shake=.45;sfx('boom');float(P.x,P.y+2.4,P.z,'TERREMOTO!','#ffe14a',1);RINGS.push({x:P.x,z:P.z,y:P.y,r:.3,max:6,spd:12,from:'p',w,hit:new Set()})}
function shoot(o){const m=o.mesh;m.position.copy(o.pos);world.add(m);PROJ.push(Object.assign({life:3,hits:new Set(),grav:0},o))}
const arrowGeo=cyl(.02,.02,.9,5);arrowGeo.rotateX(Math.PI/2);
function arrowMesh(el){const m=new THREE.Group();m.add(mesh(arrowGeo,M.wood,0,0,0,false));const tip=mesh(cone(.05,.14,4),el?glowM(ELEM[el].c):M.steel,0,0,.5,false);tip.rotateX(Math.PI/2);m.add(tip);return m}
function fireBow(w,p){MP.shC=(MP.shC|0)+1;const from=new THREE.Vector3(P.x,P.y+1.45,P.z),dir=aimDir(from);const m=arrowMesh(w.el);m.lookAt(from.clone().add(dir));shoot({mesh:m,pos:from.addScaledVector(dir,.6),vel:dir.multiplyScalar(22+16*p),team:'ally',dmg:ri(w.min,w.max)*(.45+1.3*p),w,pierce:p>=1,grav:4,arrow:1,fromP:1});P.cd=w.cd;sfx('arrow')}
function castMagic(w){const b=WT[w.base];if(P.mp<w.mana){P.cd=.3;toast('Mana esaurito, aspetta che si ricarichi');return}P.mp-=w.mana;P.cd=w.cd;P.castT=.25;faceAim();MP.shC=(MP.shC|0)+1;
  const from=new THREE.Vector3(P.x+Math.sin(P.yaw)*.5,P.y+1.4,P.z+Math.cos(P.yaw)*.5),dir=aimDir(from),col=w.el?ELEM[w.el].c:b.poly?'#ffd23a':b.bubble?'#bfe8ff':'#ffffff';
  const m=mesh(sph(b.aoe?.22:b.bubble?.3:.14,12,10),new THREE.MeshBasicMaterial({color:col,transparent:!!b.bubble,opacity:b.bubble?.5:1,toneMapped:false}),0,0,0,false);
  shoot({mesh:m,pos:from,vel:dir.multiplyScalar(b.bubble?9:16),team:'ally',dmg:ri(w.min,w.max),w,aoe:b.aoe,orb:col,fromP:1});sfx(b.poly?'chicken':b.bubble?'pop':'magic')}
function explode(x,y,z,r,dmg,hurtsP,w,fromP){sfx('boom');shake=Math.max(shake,.3);burst(x,y,z,'#ff9a2a',30,6);burst(x,y,z,'#fff3a0',14,4);for(const e of ENT){if(e.dead||e.team!=='enemy')continue;const d=Math.hypot(e.x-x,e.z-z);if(d<r){const m=d||1;hitEnt(e,dmg,{w,chain:1,kx:(e.x-x)/m,kz:(e.z-z)/m,kb:6,fromP})}}
  for(const b of INTER)if(b.kind==='basket'&&!b.used&&Math.hypot(b.x-x,b.z-z)<r)openBasket(b);if(hurtsP&&Math.hypot(P.x-x,P.z-z)<r)hurtPlayer(dmg,null,true)}
function lightning(){const cands=ENT.filter(e=>!e.dead&&e.team==='enemy'&&Math.hypot(e.x-P.x,e.z-P.z)<22);let x,z,t=null;if(cands.length&&Math.random()<.65){t=pick(cands);x=t.x;z=t.z}else{const a=rr(0,6),d=rr(8,18);x=P.x+Math.cos(a)*d;z=P.z+Math.sin(a)*d}
  flashT=1;const y=Math.max(0,groundH(x,z));const bolt=mesh(cyl(.08,.08,40,4),glowM(0xeef4ff),x,y+20,z,false);world.add(bolt);setTimeout(()=>world.remove(bolt),140);burst(x,y+.5,z,'#e8f0ff',30,7);
  setTimeout(()=>sfx('thunder'),rr(150,600));if(t){hitEnt(t,Math.round(t.maxHp*.4),{});float(t.x,t.y+2.5,t.z,'FULMINE!','#fff36b',1);toast(`Un fulmine colpisce: ${t.n}!`)}}

// ================= Abilities =================
function abilityPower(){return 1+.25*rankIdx(P.lvl)}
function useAbility(){if(mode!=='play'||P.abCd>0||P.falling>0)return;const c=pcl(),w=P.inv[P.eq],avg=w?(w.min+w.max)/2:12,pw=abilityPower();P.abCd=c.cd;sfx('ability');MP.abC=(MP.abC|0)+1;
  if(c.ab==='carica'){faceAim();P.chargeRun=.45;P.chargeHit=new Set();P.chargeDmg=avg*2*pw;banner('Carica!','',900)}
  if(c.ab==='pioggia'){const[x,z]=aimPoint(9);rainArrows(x,z,Math.round(22*pw),avg*.9*pw,true);banner('Pioggia di frecce!','',900)}
  if(c.ab==='meteora'){const[x,z]=aimPoint(9);meteor(x,z,avg*3*pw,3.6,true);banner('Meteora!','',900)}
  if(c.ab==='ombra'){P.shadowT=4+rankIdx(P.lvl);for(const e of ENT)if(e.team==='enemy'&&e.tgt===P)e.tgt=null;setPlayerAlpha(.28);banner('Ombra','IL PROSSIMO COLPO FA IL TRIPLO',1200);burst(P.x,P.y+1,P.z,'#6a4a9a',30,3)}
  if(c.ab==='torretta'){const x=P.x+Math.sin(P.yaw)*1.6,z=P.z+Math.cos(P.yaw)*1.6;spawnTurret(x,z,15+rankIdx(P.lvl)*3,(7+P.lvl*.9)*pw);banner('Torretta!','',900)}}
function endShadow(){P.shadowT=0;setPlayerAlpha(1)}
function setPlayerAlpha(a){pRoot.traverse(o=>{if(o.isMesh){if(!o.userData.ownMat){o.material=o.material.clone();o.userData.ownMat=1}o.material.transparent=a<1;o.material.opacity=a}})}
function rainArrows(x,z,n,dmg,fromP){for(let i=0;i<n;i++)setTimeout(()=>{if(mode!=='play')return;const a=rr(0,6.28),d=Math.sqrt(Math.random())*3,px=x+Math.cos(a)*d,pz=z+Math.sin(a)*d,gy=groundH(px,pz);if(gy>50)return;
  const m=arrowMesh(null);const pos=new THREE.Vector3(px+rr(-1,1),gy+12,pz+rr(-1,1)),vel=new THREE.Vector3(px-pos.x,-12,pz-pos.z).normalize().multiplyScalar(26);m.lookAt(pos.clone().add(vel));shoot({mesh:m,pos,vel,team:'ally',dmg,arrow:1,splash:.9,life:2,fromP})},i*55+200)}
function meteor(x,z,dmg,r,fromP){const gy=groundH(x,z);const ring=mesh(new THREE.RingGeometry(r-.25,r,32),new THREE.MeshBasicMaterial({color:0xff7030,transparent:true,opacity:.8,side:THREE.DoubleSide,toneMapped:false}),x,gy+.06,z,false);ring.rotation.x=-Math.PI/2;world.add(ring);
  const rock=mesh(sph(.7,12,10),glowM(0xff8a30),x+6,gy+22,z-4,false);world.add(rock);METEORS.push({x,z,gy,t:0,dur:1,rock,ring,dmg,r,fromP,sx:x+6,sz:z-4})}
function spawnTurret(x,z,life,dmg,ally){if(groundH(x,z)>50){x=P.x;z=P.z}const m=makeTurret();m.g.position.set(x,groundH(x,z),z);world.add(m.g);TURRETS.push({kind:'turret',team:'ally',x,z,y:groundH(x,z),obj:m.g,head:m.head,life,dmg,cd:.4,hp:60,r:.5});burst(x,groundH(x,z)+.5,z,'#c8a070',16,2)}
let pet=null;
function spawnPet(){const m=makePet();world.add(m.g);pet={obj:m.g,wings:m.wings,x:P.x-1,z:P.z,y:P.y+1.8,cd:3};pet.obj.scale.setScalar(.8+rankIdx(P.lvl)*.15)}
