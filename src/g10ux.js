
// ================= Mobile UX: ideas borrowed from games kids already know =================
// Brawl Stars / Archero: tap attack aims by itself at the closest enemy.
// Brawl Stars: the special ability fills a ring and glows when ready.
// Genshin Impact: the "use" button appears only next to something you can use, and the prompt itself is tappable.
// Soul Knight: one button shows your weapon, tap it to switch; potion has its own button with a counter.
// Clash Royale / Roblox: one pause button with big, clear choices instead of many small ones.
const UX={lastLook:-9,wepKey:'',potN:-1,abReady:null,coachStep:-1,rotSkip:false};
try{UX.rotSkip=localStorage.getItem('pp_rot')==='1'}catch(e){}
function vib(p){try{if(navigator.vibrate&&isTouch)navigator.vibrate(p)}catch(e){}}
function bestTarget(range){let best=null,bs=1e9;for(const e of ENT){if(e.dead||e.team!=='enemy'||e.poly>0)continue;const dx=e.x-P.x,dz=e.z-P.z,d=Math.hypot(dx,dz);if(d>range||Math.abs(e.y-P.y)>3||!losClear(P.x,P.z,e.x,e.z))continue;
  const s=d+Math.abs(angDiff(Math.atan2(dx,dz),P.yaw))*1.5-(e.boss?2:0);if(s<bs){bs=s;best=e}}return best}
function autoAim(w){if(!w||(P.lock&&!P.autoLock))return;const b=WT[w.base],range=b.kind==='melee'?(b.range||2.3)+3.5:16,t=bestTarget(range);if(t){P.lock=t;P.autoLock=true;P.autoLockT=1.6}}
function autoAimTick(dt){if(!P.autoLock)return;if(atkDown||P.drawT>0)P.autoLockT=1.6;P.autoLockT-=dt;if(P.autoLockT<=0||!P.lock||P.lock.dead){P.lock=null;P.autoLock=false}}
// HUD bits for the touch buttons
function weaponIconTo(cv,w){const g=cv.getContext('2d');g.clearRect(0,0,80,80);if(w)g.drawImage(slotIcon(w),0,0)}
function uxTick(){if(!isTouch)return;const c=pcl(),k=c.cd?P.abCd/c.cd:0,ab=$('bAbi');ab.style.setProperty('--p',Math.round((1-k)*100));const ready=k<=0;if(ready!==UX.abReady){UX.abReady=ready;ab.classList.toggle('ready',ready);if(ready&&mode==='play')vib(15)}
  if(UX.potN!==P.potions){UX.potN=P.potions;$('bPotN').textContent=P.potions;$('bPot').classList.toggle('empty',P.potions<=0)}
  const w=P.inv[P.eq],key=(w?w.id:'')+'|'+P.inv.length;if(key!==UX.wepKey){UX.wepKey=key;weaponIconTo($('bWepC'),w);$('bWepN').textContent=P.inv.length>1?`${P.eq+1}/${P.inv.length}`:'1';$('bWep').hidden=P.inv.length<1}}
function setUse(on){const b=$('bUse');if(b.classList.contains('show')!==!!on)b.classList.toggle('show',!!on)}
// buttons
function tapBtn(id,fn){const b=$(id);if(!b)return;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();audioInit();b.classList.add('down');fn()});['pointerup','pointercancel','pointerleave'].forEach(v=>b.addEventListener(v,()=>b.classList.remove('down')))}
tapBtn('bPot',()=>{if(drink())vib(20)});
tapBtn('bWep',()=>{if(P.inv.length<2){toast('Hai una sola arma: le altre le trovi nelle casse');return}equip((P.eq+1)%P.inv.length)});
$('prompt').addEventListener('click',()=>interact());
// pause menu
function openPause(){if(mode!=='play')return;$('pView').textContent=cam.fp?'Visuale: prima persona':'Visuale: terza persona';$('pOrd').textContent='Compagni: '+ORD[order];$('pOrd').hidden=MP.on||!allies.length;
  $('pInvite').hidden=!(MP.on&&window.PP_SITE);$('pLeave').hidden=!MP.on;$('pMap').hidden=floor===0;$('pauseTitle').textContent=MP.on?'Menu (il gioco continua per gli amici)':'Il gioco è in pausa';openScreen('scPause')}
function closePause(){$('scPause').hidden=true;if(mode==='menu'){mode='play';showTouch()}}
$('bPause').onclick=openPause;$('pResume').onclick=closePause;
$('pBag').onclick=()=>{closePause();openBag()};$('pMap').onclick=()=>{closePause();openMap()};$('pView').onclick=()=>{toggleView();$('pView').textContent=cam.fp?'Visuale: prima persona':'Visuale: terza persona'};
$('pOrd').onclick=()=>{cycleOrder();$('pOrd').textContent='Compagni: '+ORD[order]};$('pDance').onclick=()=>{closePause();dance()};$('pSet').onclick=()=>{closePause();openSet()};
$('pInvite').onclick=()=>{closePause();showQR()};$('pLeave').onclick=()=>{closePause();mpLeave()};$('pMenu').onclick=()=>{$('scPause').hidden=true;goTitle()};
addEventListener('keydown',e=>{if(e.code==='Escape'&&mode==='play'&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();openPause()}},true);
// rotate-your-phone overlay (most mobile action games play in landscape)
function rotTick(){const port=isTouch&&innerHeight>innerWidth*1.1&&(mode==='play'||mode==='menu')&&!UX.rotSkip;const el=$('rotate');if(el.hidden===port)el.hidden=!port}
$('rotSkip').onclick=()=>{UX.rotSkip=true;try{localStorage.setItem('pp_rot','1')}catch(e){}$('rotate').hidden=true};
addEventListener('resize',rotTick);
// first-time coach marks
const COACH=[{el:'joyZone',t:'Muoviti',d:'Appoggia il pollice in questa zona e trascinalo: il personaggio cammina.',pt:'left'},
  {el:'bAtk',t:'Attacca',d:'Tocca qui: il personaggio mira da solo il mostro più vicino. Tieni premuto per caricare o tendere l\'arco.'},
  {el:'bAbi',t:'Abilità speciale',d:'Quando il cerchio viola è pieno, toccalo per il tuo colpo speciale.'},
  {el:'bPause',t:'Menu',d:'Qui trovi zaino, mappa, audio e lingua.'}];
function coachStart(){if(!isTouch)return;try{if(localStorage.getItem('pp_coach')==='1')return}catch(e){}UX.coachStep=0;$('coach').hidden=false;coachShow()}
function coachShow(){const s=COACH[UX.coachStep];if(!s){$('coach').hidden=true;UX.coachStep=-1;try{localStorage.setItem('pp_coach','1')}catch(e){}return}
  const el=$(s.el),r=el.getBoundingClientRect(),ring=$('coachRing'),tip=$('coachTip');let x,y,rad;
  if(s.pt==='left'){x=r.left+r.width*.5;y=r.top+r.height*.6;rad=Math.min(r.width,r.height)*.45}else{x=r.left+r.width/2;y=r.top+r.height/2;rad=Math.max(r.width,r.height)/2+10}
  Object.assign(ring.style,{left:(x-rad)+'px',top:(y-rad)+'px',width:rad*2+'px',height:rad*2+'px'});$('coachT').textContent=s.t;$('coachD').textContent=s.d;
  const tw=Math.min(300,innerWidth*.7);let tx=x<innerWidth/2?x+rad+16:x-rad-16-tw,ty=Math.max(12,Math.min(innerHeight-170,y-60));if(tx<12)tx=12;Object.assign(tip.style,{left:tx+'px',top:ty+'px',width:tw+'px'})}
$('coachNext').onclick=()=>{UX.coachStep++;coachShow()};
