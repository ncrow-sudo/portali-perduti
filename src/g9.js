
// ================= Armor, companion rarity, swap dialog, main menu =================
const ARM=[{n:'Rame',a:'di Rame',c:0xc0703a,mt:.7,ro:.4,def:.06,hp:5},{n:'Bronzo',a:'di Bronzo',c:0xb08a48,mt:.75,ro:.38,def:.1,hp:10},{n:'Metallo',a:'di Metallo',c:0x7a7f88,mt:.8,ro:.45,def:.15,hp:20},
  {n:'Acciaio',a:'d\'Acciaio',c:0xc8d0da,mt:.9,ro:.25,def:.2,hp:30},{n:'Argento',a:'d\'Argento',c:0xf0f4fa,mt:.95,ro:.15,def:.26,hp:42},{n:'Oro',a:'d\'Oro',c:0xffc54a,mt:.95,ro:.22,def:.32,hp:56,em:0x3a2600},
  {n:'Diamante',a:'di Diamante',c:0x9ae8ff,mt:.3,ro:.05,def:.4,hp:75,em:0x1a6a8a},{n:'Superduper',a:'Superduper',c:0xff60c0,mt:.6,ro:.2,def:.5,hp:100,rainbow:1}];
const ARM_HEX=t=>'#'+ARM[t].c.toString(16).padStart(6,'0');
const RAINBOW=[],ARM_M=[];
function armorMat(t){if(ARM_M[t])return ARM_M[t];const a=ARM[t],m=std({color:a.c,metalness:a.mt,roughness:a.ro,emissive:a.em||0});if(a.rainbow)RAINBOW.push(m);ARM_M[t]=m;return m}
function makeArmor(t){t=clamp(t|0,0,7);return{id:uid++,t,name:'Armatura '+ARM[t].a,value:Math.round(40*Math.pow(1.8,t))}}
function rollArmorTier(fl,b=0){let t=Math.floor(fl*.45+rr(-1.2,1.4)+b);t=clamp(t,0,7);if(t===7&&Math.random()>.2+b*.1)t=6;return t}
function armorEq(){return P.armors&&P.armors.find(a=>a.id===P.armorEq)||null}
function armorDef(){const a=armorEq();return a?ARM[a.t].def:0}
function armorHp(){const a=armorEq();return a?ARM[a.t].hp:0}
function applyArmorVisual(Hh,t){if(!Hh)return;const rm=[];Hh.root.traverse(o=>{if(o.userData.armor)rm.push(o)});rm.forEach(o=>o.parent&&o.parent.remove(o));if(t==null||t<0)return;if(Hh.gltf){applyArmorGltf(Hh,t);return}
  const m=armorMat(t),bw=Hh.bw||1,add=(par,o)=>{o.userData.armor=1;par.add(o);return o};
  add(Hh.torso,mesh(box(.38*bw,.32,.07),m,0,.42,.165*bw));add(Hh.torso,mesh(box(.36*bw,.3,.06),m,0,.42,-.165*bw));add(Hh.torso,mesh(cyl(.19*bw,.18*bw,.08,12),m,0,.22,0));
  for(const a of[Hh.armL,Hh.armR]){const p=add(a.sh,mesh(new THREE.SphereGeometry(.12*bw,10,8,0,Math.PI*2,0,Math.PI/2),m,0,.04,0));p.scale.set(1.2,.85,1.15);add(a.el,mesh(cyl(.062,.058,.15,8),m,0,-.17,0))}
  for(const l of[Hh.legL,Hh.legR]){add(l.knee,mesh(cyl(.075,.068,.22,8),m,0,-.22,0));add(l.knee,mesh(sph(.06,8,6),m,0,-.02,.05))}
  if(t>=4){const ci=add(Hh.head,mesh(new THREE.TorusGeometry(.162,.018,6,18),m,0,.1,0));ci.rotation.x=Math.PI/2;add(Hh.head,mesh(sph(.03,8,6),t>=6?new THREE.MeshBasicMaterial({color:0xffffff}):M.gold,0,.11,.16,false))}
  if(t>=6)add(Hh.torso,mesh(new THREE.OctahedronGeometry(.05),new THREE.MeshBasicMaterial({color:t===7?0xff80ff:0xbff4ff,toneMapped:false}),0,.42,.21*bw,false))}
function armorIcon(t){const c=document.createElement('canvas');c.width=c.height=40;const g=c.getContext('2d');g.fillStyle=ARM_HEX(t);g.beginPath();g.moveTo(8,8);g.lineTo(32,8);g.lineTo(35,16);g.lineTo(28,18);g.lineTo(28,34);g.lineTo(12,34);g.lineTo(12,18);g.lineTo(5,16);g.closePath();g.fill();
  if(t===7){const gr=g.createLinearGradient(0,0,40,40);['#ff5050','#ffd040','#50ff80','#50a0ff','#c060ff'].forEach((h,i)=>gr.addColorStop(i/4,h));g.globalCompositeOperation='source-atop';g.fillStyle=gr;g.fillRect(0,0,40,40);g.globalCompositeOperation='source-over'}
  g.fillStyle='#ffffff66';g.fillRect(14,12,4,18);return c}
function addArmor(a){P.armors=P.armors||[];const cur=armorEq();
  if(P.armors.length>=6){const worst=P.armors.filter(x=>x.id!==P.armorEq).sort((x,y)=>x.t-y.t)[0];if(worst&&worst.t<a.t){P.armors.splice(P.armors.indexOf(worst),1);P.gold+=Math.round(worst.value*.5)}else{P.gold+=Math.round(a.value*.5);toast(`Zaino pieno: ${a.name} venduta`);return}}
  P.armors.push(a);sfx('chest');if(!cur||a.t>cur.t){equipArmor(a.id);banner(a.name+'!',`INDOSSATA · PROTEZIONE ${Math.round(ARM[a.t].def*100)}%`,2000)}else toast(`Trovata: ${a.name}. È nello zaino`)}
function equipArmor(id){P.armorEq=id;const k=P.hp/P.maxHp;recalcStats();P.hp=Math.max(1,Math.round(P.maxHp*k));const a=armorEq();applyArmorVisual(H,a?a.t:-1);if(MP.r)mpSend(true);saveGame()}
// companion rarity
const BRAR=[{n:'Comune',c:'#d8cfbf',m:1},{n:'Raro',c:'#4aa8ff',m:1.3},{n:'Epico',c:'#c06bff',m:1.7},{n:'Leggendario',c:'#ffb52e',m:2.2},{n:'Superduper',c:'#ff60c0',m:3}];
function rollBotRarity(fl,b=0){const r=Math.random()*100-fl*1.2-b*12;return r<1?4:r<6?3:r<18?2:r<45?1:0}
function botPrice(d){return[60,130,240,450,900][d.rar|0]+(d.lvl|0)*10}
function addBotAura(h,rar){if(!rar)return null;const au=makeAura(BRAR[rar].c);h.root.add(au);if(rar===4)RAINBOW.push(au.material);return au}
function botLabel(d){return`${BRAR[d.rar|0].n} · ${PCLASS[d.cls].n} · liv ${d.lvl|0}`}
// swap dialog: max 3 companions, a new one can replace an old one
let swapNew=null;
function openSwap(d,onAccept){swapNew={d,onAccept};mode='menu';try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}drawSwap();$('scShop').hidden=false;showTouch()}
function drawSwap(){const d=swapNew.d,R=BRAR[d.rar|0];$('shopTabs').innerHTML='';$('shopTitle').textContent='Nuovo compagno!';$('shopGold').textContent=`Oro: ${P.gold}`;const L=$('shopList');L.innerHTML='';$('shopMsg').textContent='';
  L.appendChild(row(iconBox(R.c),`${d.name}`,R.c,`${botLabel(d)}. ${PCLASS[d.cls].d.split('.')[0]}.`,[],true));
  L.appendChild(Object.assign(document.createElement('div'),{className:'st',textContent:`Hai già ${squadCap()} compagni. Vuoi scambiarne uno con ${d.name}?`}));
  P.army.forEach((o,i)=>{L.appendChild(row(iconBox(BRAR[o.rar|0].c),o.name,BRAR[o.rar|0].c,botLabel(o),[['Scambia',()=>{if(swapNew.onAccept&&swapNew.onAccept()===false)return;const old=P.army[i];P.army[i]=d;d.squad=true;
    const a=allies.find(x=>x.data===old);if(a){world.remove(a.obj);a.dead=true;allies.splice(allies.indexOf(a),1)}spawnAllyFor(d);music.stinger('recruit');banner(`${d.name} si unisce a te!`,`${R.n.toUpperCase()} · ${old.name.toUpperCase()} TORNA A CASA`,2400);swapNew=null;closeScreens();saveGame()}]]))});
  $('btnCloseShop').textContent=`Lascia andare ${d.name}`}
function spawnAllyFor(d){if(MP.on)return;const a=makeAlly(d);a.x=P.x+rr(-1.5,1.5);a.z=P.z+rr(-1.5,1.5);a.y=groundH(a.x,a.z);allies.push(a);renderParty()}
// main menu
function goTitle(){if(MP.r||MP.on)mpLeaveRoom();P.mpDown=0;$('bLeave').hidden=true;$('bInvite').hidden=true;$('qrWrap').hidden=true;if(mode!=='dead'&&mode!=='win')saveGame();for(const id of['scBag','scShop','scSet','scDead','scRoute','scWin','scLobby','scAvatar'])$(id).hidden=true;$('mapWrap').hidden=true;RM.open=false;swapNew=null;
  try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}if(P.shadowT>0)endShadow();P.hp=P.maxHp;P.dance=0;startCamp();mode='title';$('hud').hidden=true;$('touch').hidden=true;$('scTitle').hidden=false;refreshTitle()}
