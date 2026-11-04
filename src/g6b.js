
// ================= HUD & overlay =================
function updHud(){$('hpFill').style.transform=`scaleX(${Math.max(0,P.hp)/P.maxHp})`;$('mpFill').style.transform=`scaleX(${P.mp/P.maxMp})`;$('xpFill').style.transform=`scaleX(${P.lvl>=50?1:P.xp/xpNeed(P.lvl)})`;$('goldTxt').textContent=P.gold;$('potTxt').textContent=P.potions;
  $('floorTxt').textContent=floor===0?'Accampamento':`Piano ${floor}`+(MP.on?` · gruppo ${MP.count}`:'');$('qPot').classList.toggle('low',P.hp<P.maxHp*.35&&P.potions>0);$('pname').textContent=P.name;$('bOrd').textContent='Ordine: '+ORD[order];
  const rk=RANKS[rankIdx(P.lvl)],bd=$('lvlBadge');bd.textContent=`Liv ${P.lvl} · ${rk[0]}`;bd.style.color=rk[2];
  const c=pcl(),k=c.cd?P.abCd/c.cd:0;$('abCdv').style.transform=`scaleY(${k})`;$('bAbiCdv').style.transform=`scaleY(${k})`;
  uxTick();if((updHud.t||0)%15===0)rotTick();
  if((updHud.t=(updHud.t||0)+1)%10===0){updClock();renderParty(true);drawMM()}}
function renderParty(onlyBars){const el=$('party');if(MP.on){renderMPParty();return}if(!onlyBars||el.children.length!==allies.length+(allies.length?1:0)){el.innerHTML='';for(const a of allies){const d=document.createElement('div');d.className='pm';d.innerHTML=`<span></span><div class="bar hp"><i></i></div>`;d.firstChild.textContent=`${a.name} · ${PCLASS[a.cls].n} ${a.lvl}`;d.firstChild.style.color=BRAR[a.rar|0].c;el.appendChild(d)}
    if(allies.length){const o=document.createElement('div');o.className='ord';el.appendChild(o)}}
  allies.forEach((a,i)=>{const b=el.children[i]&&el.children[i].querySelector('i');if(b)b.style.transform=`scaleX(${a.down?0:a.hp/a.maxHp})`});const o=el.querySelector('.ord');if(o)o.textContent=ORD[order]+(P.army.length>allies.length?` · ${P.army.length-allies.length} in riserva`:'')}
function drawMap(c,S,full){const g=c.getContext('2d');g.clearRect(0,0,S,S);if(!LV)return;const sc=Math.min(S/LV.gw,S/LV.gh)*(full?.96:1),ox=(S-LV.gw*sc)/2,oy=(S-LV.gh*sc)/2;
  for(let j=0;j<LV.gh;j++)for(let i=0;i<LV.gw;i++){const k=tIdx(i,j);if(!LV.seen[k]||LV.camp)continue;const t=LV.tile[k];if(t===1)continue;g.fillStyle=t===2?'#000':t===3?'#3a8ad0':LV.gate[k]>=0&&!GATES[LV.gate[k]].open?'#c04030':LV.h[k]>.5||LV.ramp[k]?'#8a8270':'#5a5848';g.fillRect(ox+i*sc,oy+j*sc,sc+.5,sc+.5)}
  if(LV.camp){g.fillStyle='#3a5a2a';g.beginPath();g.arc(S/2,S/2,9.6*sc,0,7);g.fill()}
  const ds=full?9:4;for(const o of INTER){if(o.used&&o.kind!=='portal')continue;const k=tileAt(o.x,o.z);if(k<0||!LV.seen[k]&&!LV.camp)continue;g.fillStyle={portal:'#b07aff',merchant:'#ffc53d',cage:'#7be36b',idol:'#fff09a',chest:'#e6b53a',basket:'#c8a060',lever:'#ff6050',board:'#ffffff'}[o.kind]||'#fff';g.fillRect(ox+o.x/TS*sc-ds/2,oy+o.z/TS*sc-ds/2,ds,ds)}
  for(const e of ENT)if(!e.dead&&e.team==='enemy'&&(e.aggro||full&&LV.seen[tileAt(e.x,e.z)])){g.fillStyle=e.boss?'#ff2020':'#ff6050';const r=full?(e.boss?8:5):3;g.fillRect(ox+e.x/TS*sc-r/2,oy+e.z/TS*sc-r/2,r,r)}
  for(const a of allies){g.fillStyle=a.down?'#ff9a8a':'#7fe3ff';const r=full?6:3;g.fillRect(ox+a.x/TS*sc-r/2,oy+a.z/TS*sc-r/2,r,r)}
  const px=ox+P.x/TS*sc,py=oy+P.z/TS*sc,s=full?14:6;g.fillStyle='#fff';g.beginPath();g.moveTo(px+Math.sin(cam.yaw)*s,py+Math.cos(cam.yaw)*s);g.lineTo(px+Math.sin(cam.yaw+2.5)*s*.66,py+Math.cos(cam.yaw+2.5)*s*.66);g.lineTo(px+Math.sin(cam.yaw-2.5)*s*.66,py+Math.cos(cam.yaw-2.5)*s*.66);g.fill();
  if(full){g.font='800 18px Nunito,system-ui,sans-serif';g.fillStyle='#f4ead6';g.textAlign='left';g.fillText(floor===0?'Accampamento':`Piano ${floor} · ${STYLES[LV.style].n}`,16,28);
    const leg=[['#b07aff','Portale'],['#ffc53d','Mercante'],['#e6b53a','Cassa'],['#7be36b','Prigioniero'],['#ff6050','Leva / nemico'],['#7fe3ff','Compagni']];g.font='700 13px Nunito,system-ui,sans-serif';leg.forEach(([c_,l],i)=>{g.fillStyle=c_;g.fillRect(16,S-20-i*18,10,10);g.fillStyle='#d8ccb0';g.fillText(l,32,S-11-i*18)})}}
function drawMM(){drawMap($('mm'),120,false)}
function openMap(){if(mode!=='play')return;mode='menu';$('mapWrap').hidden=false;drawMap($('bigmap'),640,true);showTouch()}
function closeMap(){$('mapWrap').hidden=true;mode='play';showTouch()}
$('mapWrap').onclick=closeMap;$('bMap').onclick=openMap;$('mm').onclick=openMap;
const vTmp=new THREE.Vector3();
function proj(x,y,z){vTmp.set(x,y,z).project(camera);if(vTmp.z>1)return null;return[(vTmp.x+1)/2*uic.width,(1-vTmp.y)/2*uic.height]}
function bubble(p,txt){ux.font='800 13px Nunito,system-ui,sans-serif';const w=ux.measureText(txt).width+14,h=22,x=p[0]-w/2,y=p[1]-h;ux.fillStyle='#fffbeee8';ux.beginPath();ux.roundRect?ux.roundRect(x,y,w,h,8):ux.rect(x,y,w,h);ux.fill();ux.beginPath();ux.moveTo(p[0]-5,y+h);ux.lineTo(p[0]+5,y+h);ux.lineTo(p[0],y+h+6);ux.fill();ux.fillStyle='#2a1a08';ux.fillText(txt,p[0],y+15)}
function drawOverlay(){ux.clearRect(0,0,uic.width,uic.height);if(mode!=='play')return;ux.textAlign='center';ux.lineJoin='round';
  for(const e of ENT){if(e.dead||e.team!=='enemy'||e.boss||e.hpShow<=0&&!e.elite)continue;e.hpShow-=1/60;const p=proj(e.x,e.y+1.6+e.r+(e.fly?1:0),e.z);if(!p)continue;const w=e.elite?70:46;ux.fillStyle='#000a';ux.fillRect(p[0]-w/2-1,p[1]-1,w+2,6);ux.fillStyle=e.elite?'#ff9a2a':'#e0473a';ux.fillRect(p[0]-w/2,p[1],w*Math.max(0,e.hp/e.maxHp),4);
    if(e.elite){ux.font='800 12px Nunito,system-ui,sans-serif';ux.lineWidth=3;ux.strokeStyle='#000';ux.strokeText(e.n,p[0],p[1]-5);ux.fillStyle='#ffd0a0';ux.fillText(e.n,p[0],p[1]-5)}}
  for(const a of allies){if(a.down){const p=proj(a.x,a.y+1.4,a.z);if(p){ux.font='800 14px Nunito,system-ui,sans-serif';ux.lineWidth=4;ux.strokeStyle='#000';ux.strokeText('A TERRA',p[0],p[1]);ux.fillStyle='#ff8a7a';ux.fillText('A TERRA',p[0],p[1])}continue}
    if(a.say){const p=proj(a.x,a.y+2.5,a.z);if(p&&Math.hypot(a.x-P.x,a.z-P.z)<20)bubble(p,a.say.txt)}}
  if(MP.on)mpOverlay();
  for(const q of FLOATS){const p=proj(q.x,q.y,q.z);if(!p)continue;ux.globalAlpha=clamp(q.life*2,0,1);ux.font=`800 ${q.big?24:18}px Nunito,system-ui,sans-serif`;ux.lineWidth=4;ux.strokeStyle='#000';ux.strokeText(q.txt,p[0],p[1]);ux.fillStyle=q.col;ux.fillText(q.txt,p[0],p[1])}ux.globalAlpha=1;
  if(P.lock&&!P.lock.dead){const p=proj(P.lock.x,P.lock.y+1+P.lock.r*.5+(P.lock.fly?1:0),P.lock.z);if(p){ux.strokeStyle='#ffe14a';ux.lineWidth=2.5;const r=18+Math.sin(performance.now()/150)*3;for(let i=0;i<4;i++){const a=i*Math.PI/2+performance.now()/600;ux.beginPath();ux.arc(p[0],p[1],r,a,a+.8);ux.stroke()}}}
  const w=P.inv[P.eq];if(cam.fp||w&&(w.kind==='bow'||w.kind==='magic')){const cx=uic.width/2,cy=uic.height/2;ux.strokeStyle='#ffffffcc';ux.lineWidth=2;ux.beginPath();ux.arc(cx,cy,P.drawT>0?14-P.drawT*8:5,0,7);ux.stroke();if(P.drawT>=1){ux.fillStyle='#ffe14a';ux.beginPath();ux.arc(cx,cy,3,0,7);ux.fill()}}
  if(P.chargeT>.15){const p=proj(P.x,P.y+2.3,P.z);if(p){const k=Math.min(1,P.chargeT/.6);ux.strokeStyle=k>=1?'#fff':'#ffe14a';ux.lineWidth=4;ux.beginPath();ux.arc(cam.fp?uic.width/2:p[0],cam.fp?uic.height/2+40:p[1],14,-Math.PI/2,-Math.PI/2+k*Math.PI*2);ux.stroke()}}
  if(P.shadowT>0){ux.fillStyle='#2a1040';ux.globalAlpha=.25;ux.fillRect(0,0,uic.width,uic.height);ux.globalAlpha=1}
  for(const e of ENT){if(e.dead||e.team!=='enemy'||!(e.wind>0))continue;const p=proj(e.x,e.y+1,e.z);if(p&&p[0]>0&&p[0]<uic.width&&p[1]>0&&p[1]<uic.height)continue;const a=Math.atan2(e.x-P.x,e.z-P.z)-cam.yaw;const cx=uic.width/2-Math.sin(a)*Math.min(uic.width,uic.height)*.32,cy=uic.height/2-Math.cos(a)*Math.min(uic.width,uic.height)*.28;
    ux.save();ux.translate(cx,cy);ux.rotate(-a);ux.fillStyle='#ff3030';ux.beginPath();ux.moveTo(0,-12);ux.lineTo(9,6);ux.lineTo(-9,6);ux.fill();ux.restore()}}
function slotIcon(w){const c=document.createElement('canvas');c.width=c.height=80;const g=c.getContext('2d');g.translate(40,40);g.rotate(-Math.PI/4);const col=w.el?ELEM[w.el].c:'#dfe6ee',rc=RAR[w.rar].c;g.lineCap='round';
  const L=(x1,y1,x2,y2,c_,wd)=>{g.strokeStyle=c_;g.lineWidth=wd;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()};
  switch(w.base){case'sword':L(0,30,0,-32,col,7);L(-11,18,11,18,'#c8a040',5);L(0,22,0,34,'#6a4a2a',5);break;case'daggers':L(0,20,0,-20,col,6);L(-8,12,8,12,'#c8a040',4);break;case'hammer':L(0,32,0,-14,'#7a5030',5);g.fillStyle=col;g.fillRect(-16,-30,32,18);break;
    case'bow':g.rotate(Math.PI/4);g.strokeStyle='#8a5a2a';g.lineWidth=5;g.beginPath();g.arc(-14,0,30,-1.1,1.1);g.stroke();L(0,-26,0,26,'#eee',1.5);L(-22,0,24,0,'#c8a070',3);break;case'wand':L(0,30,0,-20,'#4a2c18',4);g.fillStyle=col;g.beginPath();g.arc(0,-24,8,0,7);g.fill();break;
    case'staff':L(0,34,0,-22,'#5a3a20',5);g.fillStyle=col;g.beginPath();g.arc(0,-28,10,0,7);g.fill();break;case'fish':g.fillStyle='#4a8ad8';g.beginPath();g.ellipse(0,6,10,22,0,0,7);g.fill();L(0,-14,0,-36,'#ccc',3);break;
    case'spring':L(0,34,0,10,'#aaa',3);g.fillStyle='#e0302a';g.beginPath();g.arc(0,-10,16,0,7);g.fill();break;case'bubble':L(0,34,0,-6,'#e8c0e0',4);g.strokeStyle=rc;g.lineWidth=4;g.beginPath();g.arc(0,-18,12,0,7);g.stroke();break;
    case'chicken':L(0,34,0,-6,'#e8e0d0',4);g.fillStyle='#ffd23a';g.beginPath();g.ellipse(0,-16,13,10,0,0,7);g.fill();g.fillStyle='#ff3030';g.fillRect(-3,-30,6,6);break}
  g.setTransform(1,0,0,1,0,0);g.fillStyle=rc;g.fillRect(0,74,80,6);return c}
function renderSlots(){const el=$('slots');el.innerHTML='';for(let i=0;i<6;i++){const w=P.inv[i],b=document.createElement('button');b.type='button';b.className='slot'+(i===P.eq?' on':'')+(w?'':' empty');const k=document.createElement('span');k.className='k';k.textContent=i+1;b.appendChild(k);
  if(w){b.appendChild(slotIcon(w));b.title=w.name;b.onclick=()=>equip(i)}el.appendChild(b)}}
function equip(i){if(!P.inv[i]||i===P.eq)return;P.eq=i;P.chargeT=0;P.drawT=0;equipVisual();renderSlots();const w=P.inv[i];toast(`${w.name}: ${WT[w.base].tip}`)}
function setAbilityUI(){const c=pcl();$('abName').textContent=c.abN;$('bAbiTxt').textContent=c.abN.split(' ')[0].toUpperCase()}

// ================= Screens =================
function openScreen(id){mode=id==='scDead'?'dead':'menu';try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}$(id).hidden=false;showTouch()}
function closeScreens(){for(const id of['scBag','scShop','scSet','scPause'])$(id).hidden=true;$('mapWrap').hidden=true;mode='play';showTouch()}
function row(icon,name,col,st,acts,on){const d=document.createElement('div');d.className='item'+(on?' on':'');const mid=document.createElement('div');mid.style.minWidth=0;const nm=document.createElement('div');nm.className='nm';nm.textContent=name;if(col)nm.style.color=col;const s=document.createElement('div');s.className='st';s.textContent=st;mid.append(nm,s);
  const a=document.createElement('div');a.className='acts';for(const[l,fn,dis,alt]of acts){const b=document.createElement('button');b.type='button';b.className='btn'+(alt?' alt':'');b.textContent=l;b.disabled=!!dis;b.onclick=fn;a.appendChild(b)}d.append(icon||document.createElement('canvas'),mid,a);return d}
function iconBox(col){const c=document.createElement('canvas');c.width=c.height=40;const g=c.getContext('2d');g.fillStyle=col;g.beginPath();g.arc(20,22,12,0,7);g.fill();g.fillStyle='#fff8';g.beginPath();g.arc(16,18,4,0,7);g.fill();return c}
function openBag(){if(mode!=='play')return;$('bagMsg').textContent='';drawBag();openScreen('scBag')}
function drawBag(){$('bagGold').textContent=`Oro: ${P.gold}`;const I=$('bagItems'),Wl=$('bagWeapons'),Al=$('bagArmors'),m=$('bagMsg');I.innerHTML='';Wl.innerHTML='';Al.innerHTML='';
  I.appendChild(row(iconBox('#e5333a'),`Pozioni di cura × ${P.potions}`,'#ff8a80',`Ridà metà della vita. Vita: ${Math.ceil(P.hp)} / ${P.maxHp}`,[['Bevi',()=>{const ok=drink();m.textContent=ok?'Ti senti meglio.':'Non serve ora.';drawBag()},P.potions<=0]]));
  const rk=RANKS[rankIdx(P.lvl)],nx=RANKS[rankIdx(P.lvl)+1];I.appendChild(row(iconBox(rk[2]),`${pcl().n} · livello ${P.lvl} · rango ${rk[0]}`,rk[2],nx?`XP ${P.xp} / ${xpNeed(P.lvl)}. Prossimo rango: ${nx[0]} al livello ${nx[1]}.`:'Rango massimo raggiunto!',[]));
  P.inv.forEach((w,i)=>Wl.appendChild(row(slotIcon(w),`${i+1}. ${w.name}`,RAR[w.rar].c,`${RAR[w.rar].n} · ${wStats(w)}`,i===P.eq?[['In mano',()=>{},true,true]]:[['Impugna',()=>{equip(i);drawBag()}],['Butta',()=>{P.inv.splice(i,1);if(P.eq>i)P.eq--;equipVisual();renderSlots();drawBag()},false,true]],i===P.eq)));
  const arms=(P.armors||[]).slice().sort((a,b)=>b.t-a.t);if(!arms.length)Al.appendChild(Object.assign(document.createElement('div'),{className:'st',textContent:'Nessuna armatura. Le trovi nelle casse, dai boss e dal mercante: Rame, Bronzo, Metallo, Acciaio, Argento, Oro, Diamante e Superduper.'}));
  for(const a of arms){const on=a.id===P.armorEq;Al.appendChild(row(armorIcon(a.t),a.name,a.t===7?'#ff8ad8':ARM_HEX(a.t),`Protezione ${Math.round(ARM[a.t].def*100)}% · vita +${ARM[a.t].hp}`,on?[['Indossata',()=>{},true,true],['Togli',()=>{equipArmor(null);drawBag()},false,true]]:[['Indossa',()=>{equipArmor(a.id);drawBag()}],['Butta',()=>{P.armors.splice(P.armors.indexOf(a),1);drawBag()},false,true]],on))}}
let curShop=null,shopTab='buy';
function openShop(o){curShop=o;$('btnCloseShop').textContent='Chiudi (Esc)';if(!o.stock){const fl=Math.max(1,checkpoint||floor);o.stock=[{t:'potion',price:20+6*fl}];for(let i=0;i<3;i++){const w=makeWeapon(fl,Math.max(i===0?1:0,rollRarity(fl,.4)),i===0?pick(FUN):undefined);o.stock.push({t:'weapon',w,price:Math.round(w.value*1.2)})}
    const a=makeArmor(rollArmorTier(fl,.3));o.stock.push({t:'armor',a,price:Math.round(a.value*1.3)})}
  shopTab='buy';$('shopMsg').textContent='';drawShop();openScreen('scShop')}
function drawShop(){const T=$('shopTabs');T.innerHTML='';for(const[k,l]of[['buy','Compra'],['sell','Vendi']]){const b=document.createElement('button');b.type='button';b.textContent=l;b.className=shopTab===k?'on':'';b.onclick=()=>{shopTab=k;drawShop()};T.appendChild(b)}
  $('shopTitle').textContent=floor===0?'Il Mercante dell\'Accampamento':'Mercante';$('shopGold').textContent=`Oro: ${P.gold}`;const L=$('shopList'),M_=$('shopMsg');L.innerHTML='';
  if(shopTab==='buy'){for(const it of curShop.stock){if(it.sold)continue;if(it.t==='potion')L.appendChild(row(iconBox('#e5333a'),`Pozione di cura (ne hai ${P.potions})`,'#ff8a80','Ridà metà della vita',[[`${it.price} oro`,()=>{P.gold-=it.price;P.potions++;sfx('buy');M_.textContent='Pozione nello zaino.';drawShop()},P.gold<it.price]]));
    else if(it.t==='armor'){const a=it.a;L.appendChild(row(armorIcon(a.t),a.name,a.t===7?'#ff8ad8':ARM_HEX(a.t),`Protezione ${Math.round(ARM[a.t].def*100)}% · vita +${ARM[a.t].hp}`,[[`${it.price} oro`,()=>{P.gold-=it.price;it.sold=true;addArmor(a);M_.textContent=`Comprata: ${a.name}.`;drawShop()},P.gold<it.price]]))}
    else{const w=it.w;L.appendChild(row(slotIcon(w),w.name,RAR[w.rar].c,`${RAR[w.rar].n} · ${wStats(w)}`,[[`${it.price} oro`,()=>{P.gold-=it.price;it.sold=true;P.inv.push(w);renderSlots();sfx('buy');M_.textContent=`Comprata: ${w.name}. Tasto ${P.inv.length}.`;drawShop()},P.gold<it.price||P.inv.length>=6]]))}}}
  else{let any=false;P.inv.forEach((w,i)=>{if(i===P.eq)return;any=true;const pr=Math.round(w.value*.5);L.appendChild(row(slotIcon(w),w.name,RAR[w.rar].c,RAR[w.rar].n,[[`+${pr} oro`,()=>{P.inv.splice(i,1);if(P.eq>i)P.eq--;P.gold+=pr;sfx('coin');equipVisual();renderSlots();drawShop()}]]))});
    (P.armors||[]).forEach(a=>{if(a.id===P.armorEq)return;any=true;const pr=Math.round(a.value*.5);L.appendChild(row(armorIcon(a.t),a.name,ARM_HEX(a.t),'Armatura',[[`+${pr} oro`,()=>{P.armors.splice(P.armors.indexOf(a),1);P.gold+=pr;sfx('coin');drawShop()}]]))});
    if(!any)L.textContent='Non hai niente da vendere oltre a quello che usi.'}}
$('btnCloseShop').onclick=()=>{if(swapNew){toast(`${swapNew.d.name} ti saluta e prosegue da solo`);swapNew=null}closeScreens();saveGame()};$('btnCloseBag').onclick=closeScreens;
const UPG={tenda:{n:'Tenda Grande',d:'+20 vita massima per sempre',cost:[150],max:1},fucina:{n:'Fucina',d:'Migliora la rarità dell\'arma che impugni (metà prezzo per il Fabbro)',cost:[200],max:1},caserma:{n:'Caserma',d:'Addestra l\'esercito: ogni compagno sale di 2 livelli',cost:[180,400],max:2}};
let boardTab='build',recruits=null;
function newOffers(){recruits=[0,1,2].map(()=>newRecruit(null,Math.max(1,Math.floor(P.lvl*.6))))}
function openBoard(){$('btnCloseShop').textContent='Chiudi (Esc)';boardTab='build';if(!recruits)newOffers();drawBoard();openScreen('scShop')}
function resetSquad(){for(const a of allies){world.remove(a.obj);a.dead=true}respawnAllies()}
function drawBoard(){const T=$('shopTabs');T.innerHTML='';for(const[k,l]of[['build','Costruisci'],['hire','Recluta'],['army',`Compagni (${P.army.length}/${squadCap()})`]]){const b=document.createElement('button');b.type='button';b.textContent=l;b.className=boardTab===k?'on':'';b.onclick=()=>{boardTab=k;drawBoard()};T.appendChild(b)}
  $('shopTitle').textContent='Bacheca dell\'Accampamento';$('shopGold').textContent=`Oro: ${P.gold}`;const L=$('shopList'),M_=$('shopMsg');L.innerHTML='';
  if(boardTab==='build'){for(const k in UPG){const u=UPG[k],lv=P.camp[k],done=lv>=u.max,cost=u.cost[lv]||0;L.appendChild(row(iconBox(done?'#7be36b':'#c08a4a'),`${u.n}${u.max>1?` (${lv}/${u.max})`:''}`,done?'#7be36b':null,u.d,[[done?'Costruita':`${cost} oro`,()=>{P.gold-=cost;P.camp[k]++;if(k==='caserma')P.army.forEach(d=>d.lvl=Math.min(50,(d.lvl||1)+2));recalcStats();P.hp=P.maxHp;sfx('secret');M_.textContent=`${u.n} costruita!`;saveGame();startCamp();drawBoard()},done||P.gold<cost]]))}
    const w=P.inv[P.eq];if(P.camp.fucina&&w){const cost=Math.round((100+w.rar*120)*(P.cls==='fabbro'?.5:1));L.appendChild(row(slotIcon(w),`Forgia: ${w.name}`,RAR[w.rar].c,w.rar>=3?'Già leggendaria':`Diventa ${RAR[w.rar+1].n.toLowerCase()} e più forte`,[[w.rar>=3?'Massimo':`${cost} oro`,()=>{P.gold-=cost;w.rar++;const m=RAR[w.rar].m/RAR[w.rar-1].m;w.min=Math.round(w.min*m);w.max=Math.round(w.max*m);w.value=Math.round(w.value*m);sfx('boom');equipVisual();renderSlots();M_.textContent='Clang! Arma migliorata.';drawBoard()},w.rar>=3||P.gold<cost]]))}
    const ar=armorEq();if(P.camp.fucina&&ar){const cost=Math.round((150+ar.t*140)*(P.cls==='fabbro'?.5:1));L.appendChild(row(armorIcon(ar.t),`Forgia: ${ar.name}`,ARM_HEX(ar.t),ar.t>=7?'Già Superduper':`Diventa Armatura ${ARM[ar.t+1].a}`,[[ar.t>=7?'Massimo':`${cost} oro`,()=>{P.gold-=cost;ar.t++;ar.name='Armatura '+ARM[ar.t].a;ar.value=Math.round(40*Math.pow(1.8,ar.t));sfx('boom');equipArmor(ar.id);M_.textContent='Clang! Armatura migliorata.';drawBoard()},ar.t>=7||P.gold<cost]]))}}
  else if(boardTab==='hire'){L.appendChild(Object.assign(document.createElement('div'),{className:'st',textContent:`Puoi avere al massimo ${squadCap()} compagni. Se sei al completo, scegli chi scambiare. Rarità: Comune, Raro, Epico, Leggendario, Superduper.`}));
    recruits.forEach((r,i)=>{const pr=botPrice(r),R=BRAR[r.rar|0];L.appendChild(row(iconBox(R.c),r.name,R.c,botLabel(r),[[`${pr} oro`,()=>{const pay=()=>{if(P.gold<pr)return false;P.gold-=pr;recruits.splice(i,1,newRecruit(null,Math.max(1,Math.floor(P.lvl*.6))));return true};
      if(joinArmy(r,pay)){M_.textContent=`${r.name} si unisce a te!`;drawBoard()}},P.gold<pr]]))})}
  else{L.appendChild(Object.assign(document.createElement('div'),{className:'st',textContent:`Compagni: ${P.army.length} / ${squadCap()}. I compagni più rari hanno più vita, più danno e usano più spesso la loro abilità.`}));if(!P.army.length)L.appendChild(Object.assign(document.createElement('div'),{textContent:'Ancora nessun compagno.'}));
    P.army.forEach((d,i)=>{const a=allies.find(x=>x.data===d),R=BRAR[d.rar|0];L.appendChild(row(iconBox(R.c),d.name,R.c,botLabel(d)+(a?` · vita ${Math.ceil(a.hp)} / ${a.maxHp}`:''),[['Congeda',()=>{P.army.splice(i,1);resetSquad();saveGame();drawBoard()},false,true]]))})}}
function cycleOrder(){order=order==='segui'?'attacca':order==='attacca'?'fermi':'segui';toast(`Ordine all'esercito: ${ORD[order]}`);sfx('beep');renderParty()}
// settings
function openSet(){if(mode!=='play')return;for(const k of['mus','sfx','amb']){const id='vol'+k[0].toUpperCase()+k.slice(1);$(id).value=VOL[k];$(id+'V').textContent=VOL[k]}drawModelPills();drawDragoPills();openScreen('scSet')}
function drawDragoPills(){pills($('optDragoSet'),Object.entries(DRAGHI).map(([k,d])=>[k,d.n]),dragoT(),v=>{P.drago=P.drago||{t:v,xp:0};P.drago.t=v;const x=pet&&pet.x,y=pet&&pet.y,z=pet&&pet.z;spawnPet();if(x!=null){pet.x=x;pet.y=y;pet.z=z}saveGame();drawDragoPills()});$('dragoSetTxt').textContent=DRAGHI[dragoT()].d}
function drawModelPills(){pills($('optModels'),[['nuovi','Nuovi'],['classici','Classici']],GLB.on?'nuovi':'classici',v=>{GLB.on=v==='nuovi';store.set('pp_gltf',GLB.on);buildPlayer();drawModelPills()})}
for(const k of['mus','sfx','amb']){const id='vol'+k[0].toUpperCase()+k.slice(1);$(id).addEventListener('input',e=>{VOL[k]=+e.target.value;$(id+'V').textContent=VOL[k];store.set('pp5_vol',VOL);setVol();if(k==='sfx')sfx('coin')})}
$('btnCloseSet').onclick=closeScreens;$('bSet').onclick=openSet;

// ================= Save / death =================
function saveGame(){if(mode==='title'||mode==='avatar'||mode==='lobby')return;store.set('pp5_save',{look:P.look,name:P.name,cls:P.cls,lvl:P.lvl,xp:P.xp,diff:P.diff,view:cam.fp?'prima':'terza',cp:checkpoint,seed:seedBase,gold:P.gold,potions:P.potions,inv:P.inv,eq:P.eq,camp:P.camp,army:P.army,route:P.route,ng:P.ng||0,armors:P.armors||[],armorEq:P.armorEq||null,drago:P.drago||{t:'fuoco',xp:0}})}
function loadGame(){const s=store.get('pp5_save',null);if(!s||!s.look)return false;Object.assign(P,{look:s.look,name:s.name||'Esploratore',cls:PCLASS[s.cls]?s.cls:'cavaliere',lvl:s.lvl||1,xp:s.xp|0,diff:DIFFS[s.diff]?s.diff:'normale',gold:s.gold|0,potions:s.potions|0,eq:s.eq|0,camp:s.camp||{tenda:0,fucina:0,caserma:0},army:s.army||[],route:s.route&&s.route.seed?s.route:{seed:(Math.random()*1e9)|0,cur:null,hist:[]},ng:s.ng|0,armors:Array.isArray(s.armors)?s.armors:[],armorEq:s.armorEq||null,drago:s.drago&&DRAGHI[s.drago.t]?{t:s.drago.t,xp:s.drago.xp|0}:{t:'fuoco',xp:0}});pet=null;ROUTE=null;P.army.forEach(d=>{d.rar=d.rar|0;d.squad=true});P.army.sort((a,b)=>(b.rar-a.rar)||(b.lvl-a.lvl));P.army.length=Math.min(P.army.length,squadCap());
  P.inv=s.inv&&s.inv.length?s.inv:[makeWeapon(1,1,PCLASS[P.cls].start[0])];if(P.eq>=P.inv.length)P.eq=0;DIFF=DIFFS[P.diff];cam.fp=s.view==='prima';checkpoint=s.cp|0;seedBase=s.seed||1;uid=Math.max(1,...P.inv.map(w=>w.id||0),...P.army.map(d=>d.id||0))+1;recalcStats();P.hp=P.maxHp;P.mp=P.maxMp;buildPlayer();return true}
function die(){if(MP.on){mpDie();return}mode='dead';P.hp=0;music.stinger('death');if(P.shadowT>0)endShadow();try{document.exitPointerLock&&document.exitPointerLock()}catch(e){}const lost=Math.floor(P.gold*.25);P.gold-=lost;saveGame();
  $('deadTitle').textContent=floor>=best&&floor>1?`Nuovo record: piano ${floor}!`:`Caduto al piano ${floor}`;$('deadLine').textContent=`Hai perso ${lost} oro. Livello, zaino, armi ed esercito restano con te. Riparti dal piano ${Math.max(1,checkpoint)}.`;
  const rk=RANKS[rankIdx(P.lvl)][0],ds=$('deadStats');ds.innerHTML='';[[floor,'piano raggiunto'],[`${P.lvl}`,`livello · ${rk}`],[stats.kills,'mostri battuti'],[stats.bosses,'boss sconfitti'],[P.army.length,'compagni']].forEach(([v,l])=>{const d=document.createElement('div');d.innerHTML='<b></b><span></span>';d.firstChild.textContent=v;d.lastChild.textContent=l;ds.appendChild(d)});
  const w=P.inv[P.eq];$('shareTxt').textContent=`PORTALI PERDUTI · ${P.name} il ${pcl().n}\nRango ${rk}, livello ${P.lvl}\nPiano ${floor} del Tempio Perduto\n${stats.kills} mostri · ${stats.bosses} boss · ${P.army.length} compagni\nArma: ${w?w.name:'nessuna'}\nRiesci a fare meglio?`;
  $('btnRetry').textContent=`Riparti dal piano ${curNode()?curNode().L:Math.max(1,checkpoint)}`;openScreen('scDead')}
function revive(){$('scDead').hidden=true;P.hp=P.maxHp;P.mp=P.maxMp;P.iT=1.5;mode='play';showTouch()}
$('btnRetry').onclick=()=>{revive();retryNode()};$('btnCamp').onclick=()=>{revive();startCamp()};
$('btnShare').onclick=()=>{const t=$('shareTxt').textContent;try{navigator.clipboard.writeText(t).then(()=>$('btnShare').textContent='Copiato',sel)}catch(e){sel()}};
function sel(){const r=document.createRange();r.selectNodeContents($('shareTxt'));const s=getSelection();s.removeAllRanges();s.addRange(r);$('btnShare').textContent='Testo selezionato'}

// ================= Input =================
const keys={};let mouseAtk=false,touchAtk=false,locked=false,isTouch=IS_MOBILE;
addEventListener('keydown',e=>{if(e.target&&e.target.tagName==='INPUT')return;keys[e.code]=true;if(['Space','Tab'].includes(e.code)&&mode==='play')e.preventDefault();if(e.repeat)return;
  if(mode==='play'){if(e.code==='Space')jump();if(e.code==='ShiftLeft'||e.code==='ShiftRight')dash();if(e.code==='KeyE')interact();if(e.code==='KeyR')drink();if(e.code==='KeyI')openBag();if(e.code==='Tab')toggleLock();if(e.code==='KeyX')useAbility();if(e.code==='KeyM')openMap();
    if(e.code==='KeyQ')blockDown=true;if(e.code==='KeyV')toggleView();if(e.code==='KeyG')dance();if(e.code==='KeyF')cycleOrder();if(/^Digit[1-6]$/.test(e.code))equip(+e.code[5]-1)}
  else if(mode==='menu'&&(e.code==='Escape'||e.code==='KeyI'||e.code==='KeyM')){closeScreens();saveGame()}});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyQ')blockDown=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false;mouseAtk=false;blockDown=false});
glc.addEventListener('mousedown',e=>{if(mode!=='play')return;audioInit();if(!locked&&!isTouch){try{const p=glc.requestPointerLock&&glc.requestPointerLock();if(p&&p.catch)p.catch(()=>{})}catch(err){}}if(e.button===0)mouseAtk=true;if(e.button===2)blockDown=true});
addEventListener('mouseup',e=>{if(e.button===0)mouseAtk=false;if(e.button===2)blockDown=false});glc.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===glc});
function lookBy(dx,dy,k){UX.lastLook=performance.now()/1000;cam.yaw-=dx*k;if(cam.fp)cam.fpPitch=clamp(cam.fpPitch+dy*k*.8,-1.2,1.2);else cam.pitch=clamp(cam.pitch+dy*k*.8,-.15,1.15)}
addEventListener('mousemove',e=>{if(mode!=='play'||!locked)return;lookBy(e.movementX,e.movementY,.0028)});
glc.addEventListener('wheel',e=>{if(mode!=='play')return;e.preventDefault();if(cam.fp){if(e.deltaY>0)toggleView();return}if(e.deltaY<0&&cam.dist<=2.7){toggleView();return}cam.dist=clamp(cam.dist+e.deltaY*.006,2.6,12)},{passive:false});
function toggleView(){cam.fp=!cam.fp;P.view=cam.fp?'prima':'terza';if(cam.fp){cam.fpPitch=0;cam.yaw=P.yaw}else{H.head.visible=true;if(cam.dist<3.5)cam.dist=6}toast(cam.fp?'Visuale in prima persona':'Visuale in terza persona');saveGame()}
function dance(){P.dance=6.4;for(const a of allies)a.dance=6.4;breakBeat();float(P.x,P.y+2.4,P.z,'BREAKDANCE!','#ffe14a',1)}
function breakBeat(){if(!AC||muted)return;const t0=AC.currentTime+.05,d=sfxBus;nz(t0,.35,.12,d,1800,'bandpass',3);for(let i=0;i<26;i++){const t=t0+.3+i*.24;if(i%4===0||i%8===5)DR.kick(t,.45,d);if(i%4===2)DR.snare(t,.22,d);DR.shaker(t,.05,d);if(i%8===7)DR.conga(t,.18,d,420)}}
function showTouch(){document.body.classList.toggle('touchmode',isTouch);$('touch').hidden=!(isTouch&&mode==='play');$('hud').hidden=!(mode==='play'||mode==='menu'||mode==='dead')}
addEventListener('touchstart',()=>{if(!isTouch){isTouch=true;showTouch()}},{passive:true});
const jz=$('joyZone'),joyEl=$('joy'),knob=$('knob');let joyId=null,jc=[0,0],jr=55;
function joyPlace(){const zr=jz.getBoundingClientRect();joyEl.style.left=(jc[0]-zr.left)+'px';joyEl.style.top=(jc[1]-zr.top)+'px';joyEl.style.bottom='auto'}
jz.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();if(joyId!==null)return;joyId=e.pointerId;try{jz.setPointerCapture(e.pointerId)}catch(_){}
  const zr=jz.getBoundingClientRect();jr=Math.max(40,joyEl.offsetWidth/2*.8);jc=[clamp(e.clientX,zr.left+jr+6,zr.right-jr-6),clamp(e.clientY,zr.top+jr+6,zr.bottom-jr-6)];joyPlace();joyEl.classList.add('on');mj(e)});
jz.addEventListener('pointermove',e=>{if(e.pointerId===joyId)mj(e)});
const ej=e=>{if(e.pointerId!==joyId)return;joyId=null;joy={x:0,y:0};knob.style.transform='';joyEl.classList.remove('on');joyEl.style.left=joyEl.style.top=joyEl.style.bottom='';joyEl.style.setProperty('--jm',0)};
jz.addEventListener('pointerup',ej);jz.addEventListener('pointercancel',ej);jz.addEventListener('lostpointercapture',ej);
function mj(e){let dx=e.clientX-jc[0],dy=e.clientY-jc[1];const d=Math.hypot(dx,dy);
  if(d>jr*1.5){const k=(d-jr*1.5)/d;jc[0]+=dx*k;jc[1]+=dy*k;joyPlace();dx=e.clientX-jc[0];dy=e.clientY-jc[1]}
  const m=Math.hypot(dx,dy),cl=Math.min(m,jr),nx=m?dx/m:0,ny=m?dy/m:0;knob.style.transform=`translate(${nx*cl}px,${ny*cl}px)`;
  const n=cl/jr,dz=.14,v=n<dz?0:Math.min(1,(n-dz)/(1-dz)*1.1);joy={x:nx*v,y:ny*v};
  joyEl.style.setProperty('--ja',(Math.atan2(dx,-dy)*180/Math.PI)+'deg');joyEl.style.setProperty('--jm',v>0?.9:0)}
const lookEl=$('look'),lp=new Map();let pinch0=0,dist0=0;
lookEl.addEventListener('pointerdown',e=>{e.preventDefault();audioInit();lp.set(e.pointerId,[e.clientX,e.clientY]);try{lookEl.setPointerCapture(e.pointerId)}catch(_){}if(lp.size===2){const[a,b]=[...lp.values()];pinch0=Math.hypot(a[0]-b[0],a[1]-b[1]);dist0=cam.dist}});
lookEl.addEventListener('pointermove',e=>{const p=lp.get(e.pointerId);if(!p)return;if(lp.size===2){lp.set(e.pointerId,[e.clientX,e.clientY]);const[a,b]=[...lp.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);if(pinch0&&!cam.fp)cam.dist=clamp(dist0*pinch0/d,2.6,12);return}
  lookBy(e.clientX-p[0],e.clientY-p[1],.007);lp.set(e.pointerId,[e.clientX,e.clientY])});
const lup=e=>{lp.delete(e.pointerId);if(lp.size<2)pinch0=0};lookEl.addEventListener('pointerup',lup);lookEl.addEventListener('pointercancel',lup);
const hold=(id,on,off)=>{const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();audioInit();on()});if(off)['pointerup','pointercancel','pointerleave'].forEach(v=>b.addEventListener(v,off))};
hold('bAtk',()=>touchAtk=true,()=>touchAtk=false);hold('bShd',()=>blockDown=true,()=>blockDown=false);hold('bJmp',jump);hold('bDash',dash);hold('bUse',interact);hold('bLock',toggleLock);hold('bAbi',useAbility);
$('bMenu').onclick=goTitle;$('bagMenu').onclick=goTitle;$('qPot').onclick=()=>drink();$('qBag').onclick=()=>openBag();$('abil').onclick=()=>useAbility();$('bOrd').onclick=cycleOrder;$('bView').onclick=toggleView;$('bDance').onclick=dance;

// ================= Title & avatar creator =================
const AVOPT={build:BUILDS.map(b=>[b,b]),skin:LOOK.skin.map((c,i)=>[i,c]),hairStyle:HAIRS.map(h=>[h,h]),hair:LOOK.hair.map((c,i)=>[i,c]),hat:HATS.map(h=>[h,h]),shirt:LOOK.shirt.map((c,i)=>[i,c]),pants:LOOK.pants.map((c,i)=>[i,c]),shield:LOOK.shield.map((c,i)=>[i,c])};
let avStep=0,avView='terza',avDiff='normale',avDrago='fuoco';
function setClassPreview(){P.inv=PCLASS[P.cls].start.map((b,i)=>makeWeapon(1,i===0?1:0,b));P.eq=0;equipVisual()}
function pills(el,opts,cur,fn){el.innerHTML='';for(const[v,l]of opts){const b=document.createElement('button');b.type='button';b.textContent=l;b.className=cur===v?'on':'';b.onclick=()=>fn(v);el.appendChild(b)}}
function drawAvatarUI(){for(let i=0;i<3;i++)$('av'+i).hidden=i!==avStep;document.querySelectorAll('#scAvatar .dots i').forEach((d,i)=>d.classList.toggle('on',i<=avStep));
  $('avGo').textContent=avStep<2?'Avanti':'Parti all\'avventura';$('avRand').hidden=avStep!==0;
  document.querySelectorAll('#scAvatar .pills[data-k]').forEach(el=>{const k=el.dataset.k;el.innerHTML='';for(const[v,l]of AVOPT[k]){const b=document.createElement('button');b.type='button';const isCol=typeof l==='string'&&l[0]==='#';
    if(isCol){b.className='sw'+(P.look[k]===v?' on':'');b.style.background=l;b.setAttribute('aria-label',k+' '+v)}else{b.textContent=l;b.className=P.look[k]===v?'on':''}b.onclick=()=>{P.look[k]=v;buildPlayer();drawAvatarUI()};el.appendChild(b)}});
  const cl=$('clsList');cl.innerHTML='';for(const k in PCLASS){const c=PCLASS[k],b=document.createElement('button');b.type='button';b.className='cls'+(P.cls===k?' on':'');const t=document.createElement('b');t.textContent=c.n;const d=document.createElement('span');d.textContent=c.d;const st=document.createElement('span');st.textContent=`Vita ${c.hp} · Mana ${c.mp} · Velocità ${Math.round(c.spd*100)}%`;b.append(t,d,st);b.onclick=()=>{P.cls=k;buildPlayer();setClassPreview();drawAvatarUI()};cl.appendChild(b)}
  pills($('optView'),[['terza','Terza persona'],['prima','Prima persona']],avView,v=>{avView=v;drawAvatarUI()});
  pills($('optDiff'),Object.entries(DIFFS).map(([k,d])=>[k,d.n]),avDiff,v=>{avDiff=v;drawAvatarUI()});
  pills($('optDrago'),Object.entries(DRAGHI).map(([k,d])=>[k,d.n]),avDrago,v=>{avDrago=v;drawAvatarUI()});$('dragoTxt').textContent=DRAGHI[avDrago].d;
  $('diffTxt').textContent={facile:'Pochi mostri, colpi leggeri, un nemico alla volta ti attacca. Perfetto per i più piccoli.',normale:'Una vera sfida: tanti mostri, fino a quattro ti attaccano insieme, e ogni tanto un campione dorato.',eroico:'Orde di mostri fortissimi, fino a cinque insieme e tanti campioni. Solo per veri eroi.'}[avDiff]}
$('avRand').onclick=()=>{P.look=randLook();buildPlayer();drawAvatarUI()};
$('avBack').onclick=()=>{if(avStep>0){avStep--;drawAvatarUI();$('scAvatar').scrollTop=0}else{$('scAvatar').hidden=true;$('scTitle').hidden=false;mode='title'}};
$('btnNew').onclick=()=>{audioInit();P.look=randLook();P.look.hat='esploratore';P.cls='cavaliere';P.lvl=1;buildPlayer();setClassPreview();pRoot.rotation.y=0;avStep=0;$('scTitle').hidden=true;$('scAvatar').hidden=false;mode='avatar';drawAvatarUI()};
function startNew(){P.name=($('avName').value||'Esploratore').trim().slice(0,14)||'Esploratore';$('scAvatar').hidden=true;seedBase=(Math.random()*1e9)|0;checkpoint=0;
  P.diff=avDiff;DIFF=DIFFS[avDiff];P.drago={t:avDrago,xp:0};pet=null;cam.fp=avView==='prima';cam.fpPitch=0;P.view=avView;
  Object.assign(P,{lvl:1,xp:0,gold:40,potions:3,camp:{tenda:0,fucina:0,caserma:0},army:[],abCd:0,armors:[],armorEq:null,route:{seed:(Math.random()*1e9)|0,cur:null,hist:[]},ng:0});ROUTE=null;recalcStats();P.hp=P.maxHp;P.mp=P.maxMp;setClassPreview();buildPlayer();
  const buddy=newRecruit(P.cls==='mago'?'cavaliere':'mago',1,0);buddy.name=pick(NAMES.filter(n=>n!==P.name));P.army.push(buddy);recruits=null;
  renderSlots();setAbilityUI();if(MP.after){MP.after=false;mode='menu';saveGame();openLobby();return}mode='play';startCamp();saveGame();showTouch();
  banner(`Benvenuto, ${P.name}`,`${pcl().n.toUpperCase()} · RANGO LEGNO`,2600);setTimeout(coachStart,3200);setTimeout(()=>toast(`${buddy.name} il ${PCLASS[buddy.cls].n} viaggerà con te. Prova l'abilità ${pcl().abN} (${isTouch?'tasto viola':'X'}) sul manichino`),2800)}
$('avGo').onclick=()=>{audioInit();if(avStep<2){avStep++;drawAvatarUI();$('scAvatar').scrollTop=0;return}startNew()};
$('btnCont').onclick=()=>{if(!GLB.ready&&!GLB.failed){GLB.whenReady(()=>$('btnCont').click());return}audioInit();if(!loadGame())return;$('scTitle').hidden=true;mode='play';equipVisual();renderSlots();setAbilityUI();startCamp();showTouch();banner(`Bentornato, ${P.name}`,'IL PORTALE TI PORTA AL PIANO '+Math.max(1,checkpoint),2600)};
const sv=store.get('pp5_save',null);if(sv&&sv.look){$('btnCont').hidden=false;$('btnCont').textContent=`Continua · ${sv.name||'Esploratore'} · liv ${sv.lvl||1} · piano ${Math.max(1,sv.cp||1)}`}
$('recTxt').textContent=best?`Record: piano ${best}`:'Nessun record ancora';

// ================= Main loop =================
P.look=randLook();P.look.hat='esploratore';recalcStats();buildPlayer();setClassPreview();startCamp();mode='title';$('hud').hidden=true;
let last=performance.now(),torchT=0,perfT=0,perfN=0,perfS=0,pr=renderer.getPixelRatio();
function autoQuality(dt){if(mode!=='play')return;perfS+=dt;perfN++;perfT+=dt;if(perfT<3)return;const avg=perfS/perfN;perfT=perfS=perfN=0;
  if(avg>.038){if(pr>.65){pr=Math.max(.6,pr-.15);renderer.setPixelRatio(pr);resize()}else if(sun.castShadow){sun.castShadow=false}}}
function frame(now){let dt=Math.min(.05,(now-last)/1000);last=now;autoQuality(dt);if(freeze>0){freeze-=dt;dt*=.1}
  if(mode==='play'||(MP.on&&mode==='menu'))update(dt);
  const focus=new THREE.Vector3(P.x,P.y,P.z);updSky(dt,focus);updPrecip(dt,camera.position);updParts(dt);
  if(mode==='play'){updCamera(dt);updPlayerVisual(dt)}
  else if(mode==='menu'||mode==='dead'){updPlayerVisual(dt)}
  else{for(let i=ANIM.length-1;i>=0;i--)if(!ANIM[i](dt))ANIM.splice(i,1);pRoot.position.set(P.x,P.y,P.z);H.head.visible=true;camera.near=.1;camera.updateProjectionMatrix();
    if(mode==='avatar'){pRoot.rotation.y+=dt*.6;animHuman(H,{speed:0},dt);const wide=innerWidth>innerHeight;camera.position.set(P.x+(wide?-.6:0),P.y+1.4,P.z+3.6);camera.lookAt(P.x+(wide?-1.5:0),P.y+(wide?1.05:.7),P.z)}
    else{animHuman(H,{speed:0,dance:Math.sin(now/2000)>.7},dt);const a=now/1000*.06+2.4;camera.position.set(P.x+Math.sin(a)*8,P.y+3,P.z+Math.cos(a)*8);camera.lookAt(P.x,P.y+1.3,P.z)}}
  torchT-=dt;if(torchT<=0){torchT=.4;const nk=night(),srt=TORCHES.map(t=>[t,t.position.distanceTo(focus)]).sort((a,b)=>a[1]-b[1]);torchLights.forEach((l,i)=>{const t=srt[i];if(t&&t[1]<24){l.position.copy(t[0].position).add(new THREE.Vector3(0,.6,0));l.intensity=(.35+nk*1.6)*(1-Wc.rain*.3)}else l.intensity=0})}
  for(const t of TORCHES)t.userData.f.scale.y=1+Math.sin(now/80+t.position.x)*.15;
  const nk=night();playerLight.intensity=nk*1.5+Wc.fog*.3;playerLight.position.set(P.x+Math.sin(P.yaw)*.6,P.y+2.2,P.z+Math.cos(P.yaw)*.6);
  TEX.water.offset.x+=dt*.05;if(GROUND_M.sea){GROUND_M.sea.map.offset.x+=dt*.01;GROUND_M.sea.map.offset.y+=dt*.006}TEX.water.offset.y+=dt*.03;TEX.fall.offset.y-=dt*1.4;
  if(MP.r)mpTick(dt);
  if(RAINBOW.length){const hh=(now/2500)%1;for(const m of RAINBOW){m.color.setHSL(hh,.9,.62);if(m.emissive)m.emissive.setHSL(hh,.9,.2)}}
  renderer.render(scene,camera);drawOverlay();requestAnimationFrame(frame)}
requestAnimationFrame(frame);
glbLoad();natLoad();GLB.whenReady(()=>{window.__ready=true;const b=$('btnNew');b.disabled=false;b.textContent='Nuova avventura';
  // se il giocatore era già stato costruito col modello vecchio (ingresso veloce da QR), lo ricostruiamo
  if(typeof H!=='undefined'&&H&&!H.gltf&&P.look&&GLB.has(P.cls))buildPlayer()});
