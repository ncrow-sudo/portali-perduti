
// ================= Multiplayer (co-op) via the artifact `room` capability =================
// Host-authoritative: the host simulates monsters and sends a compact snapshot in its presence;
// clients render "ghost" monsters, send their own player state plus cumulative damage per monster.
// Everything travels through presence (anyone may set it), so no event-topic permissions are needed.
const MP={diag:{},room:null,ready:false,r:null,code:'',on:false,host:false,get client(){return this.on&&!this.host},allowSpawn:false,midC:0,t:0,sendT:0,
  me:'',hostPeer:'',hb:null,remotes:new Map(),ghosts:new Map(),dmTot:{},dmTime:{},myGates:new Set(),myPt:0,loading:false,noHostT:0,
  base:{},hd:{},xpT:0,gdT:0,kcT:0,keT:0,bkT:0,count:1,lastHostPres:null,lobT:0,epT:0,fx:[],ringFx:[]};
const MT=Object.keys(MDEF);
MP.autoJoin=(()=>{try{const s=new URLSearchParams(location.search).get('stanza');return s&&/^[a-z0-9]{3,8}$/i.test(s)?s.toLowerCase():null}catch(e){return null}})();
if(MP.autoJoin)MP.after=true;
setTimeout(()=>{if(MP.autoJoin){$('btnCont').hidden=true;$('btnMP').textContent=`Entra nella stanza ${MP.autoJoin.toUpperCase()}`;$('btnMP').className='btn green';$('btnNew').textContent='Crea il tuo personaggio';document.querySelector('#scTitle .tag').textContent=`Invito alla stanza ${MP.autoJoin.toUpperCase()}`}},0);
function tryAutoJoin(){if(MP.autoJoin&&MP.room&&!MP.r){const c=MP.autoJoin;MP.autoJoin=null;mpJoin(c,false)}}
function inviteUrl(){return location.origin+location.pathname+'?stanza='+MP.code}
function showQR(){if(!MP.code)return;$('qrWrap').hidden=false;const box=$('qrBox');box.innerHTML='';const url=inviteUrl();
  try{if(typeof qrcode==='function'){const q=qrcode(0,'M');q.addData(url);q.make();const n=q.getModuleCount(),cs=Math.max(4,Math.floor(240/n)),cv=document.createElement('canvas');cv.width=cv.height=n*cs;const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#000';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))g.fillRect(c*cs,r*cs,cs,cs);cv.style.width=cv.style.height='240px';cv.style.imageRendering='pixelated';box.appendChild(cv)}else box.textContent=url}catch(e){box.textContent=url}
  $('qrCode').textContent=MP.code.toUpperCase();$('qrUrl').textContent=url}
$('qrClose').onclick=()=>{$('qrWrap').hidden=true};$('bInvite').onclick=showQR;
try{MP.roomP=(window.claude&&typeof claude.use==='function')?claude.use('room'):Promise.resolve(null)}catch(e){MP.roomP=Promise.resolve(null)}
MP.roomP.then(r=>{MP.room=r;MP.ready=true;if(r){try{r.onPeers(()=>{if(mode==='lobby')drawLobby()},e=>{MP.lobErr=e&&e.code})}catch(e){}try{r.onConnection(c=>{MP.lobConn=c;if(mode==='lobby')drawLobby()},e=>{MP.lobErr=e&&e.code})}catch(e){}}if(mode==='lobby'){lobbyPresence();drawLobby();tryAutoJoin()}}).catch(()=>{MP.ready=true;if(mode==='lobby')drawLobby()});
// A "code room" lives inside the page's shared room (everyone who has this game open right now): players tag their presence with the code and only see each other.
function codeRoom(code){const R=MP.room,mine=p=>p.sameTab||(p.presence&&p.presence.rc===code);let cache=null,src=null;
  return{name:code,presence:patch=>R.presence(Object.assign({},patch,{rc:code})),peers(){const all=R.peers();if(all!==src){src=all;cache=Object.freeze(all.filter(mine))}return cache},
    onPeers:(h,e)=>R.onPeers(ch=>h({peers:ch.peers.filter(mine),joined:ch.joined.filter(mine),left:ch.left,updated:ch.updated.filter(mine)}),e),
    onConnection:(h,e)=>R.onConnection(h,e),connected:()=>R.connected(),
    leave:()=>R.presence({rc:null,st:'lobby',host:0,m:null,pr:null,rg:null,hd:null,dm:null,gt:null,nd:null,rs:null,seed:null,fin:null})}}
const CODECH='abcdefghjkmnpqrstuvwxyz23456789';
const newCode=()=>Array.from({length:4},()=>CODECH[Math.floor(Math.random()*CODECH.length)]).join('');

// ---------- lobby UI ----------
function openLobby(){mode='lobby';$('scTitle').hidden=true;$('scAvatar').hidden=true;$('scLobby').hidden=false;$('hud').hidden=true;$('touch').hidden=true;lobbyPresence();drawLobby();tryAutoJoin()}
function closeLobby(){$('scLobby').hidden=true}
function lobbyPeers(){return MP.r?MP.r.peers().filter(p=>p.presence&&p.presence.n):[]}
function drawLobby(){const st=$('lobStatus');$('lobJoin').hidden=false;$('lobRoom').hidden=true;const L=$('lobOnline');L.innerHTML='';$('lobOnlineWrap').hidden=!!window.PP_SITE;
  if(!MP.ready){st.textContent='Collegamento in corso…';$('lobCreate').disabled=$('lobEnter').disabled=true;$('lobDiag').textContent='';return}
  if(!MP.room){st.textContent='Qui il gioco con amici non è disponibile: questa schermata non riceve il collegamento di claude.ai. Apri il gioco dalla pagina di claude.ai (nel browser, collegato al tuo account).';$('lobCreate').disabled=$('lobEnter').disabled=true;$('lobDiag').textContent='Diagnosi: collegamento stanze assente su questo dispositivo.';return}
  $('lobCreate').disabled=$('lobEnter').disabled=false;st.textContent=`Giochi come ${P.name}, ${pcl().n} livello ${P.lvl}. Crea una stanza e dai il codice agli amici, oppure entra nella stanza di un amico qui sotto.`;
  let ps=[];try{ps=MP.room.peers()}catch(e){}const others=ps.filter(p=>!p.sameTab);const conn=(()=>{try{return MP.room.connected()}catch(e){return false}})();
  const rooms={};for(const p of others){const pr=p.presence||{};if(pr.rc&&pr.host)rooms[pr.rc]=pr}
  if(!others.length)L.appendChild(Object.assign(document.createElement('div'),{className:'st',textContent:'Nessun altro ha il gioco aperto in questo momento.'}));
  for(const p of others){const pr=p.presence||{},d=document.createElement('div');d.className='item';const mid=document.createElement('div');const nm=document.createElement('div');nm.className='nm';nm.textContent=String(pr.n||'Qualcuno').slice(0,14)+(p.isMe?' (tuo altro dispositivo)':'');
    const s=document.createElement('div');s.className='st';s.textContent=pr.rc?`${pr.host?'Admin della':'Nella'} stanza ${String(pr.rc).toUpperCase()}`:'Nel menu';mid.append(nm,s);const acts=document.createElement('div');acts.className='acts';
    if(pr.rc){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='Entra';b.onclick=()=>{audioInit();mpJoin(String(pr.rc),false)};acts.appendChild(b)}d.append(iconBox(LOOK.shirt[(pr.lk&&pr.lk.shirt)|0]||'#888'),mid,acts);L.appendChild(d)}
  if(window.PP_SITE){$('lobDiag').textContent=conn?'Collegato al server del gioco.':'Collegamento al server in corso…';return}$('lobDiag').textContent=`Diagnosi: collegato ${conn?'sì':'no'} · persone con il gioco aperto adesso: ${others.length+1}${MP.lobErr?' · errore '+MP.lobErr:''}`}
function lobbyPresence(){if(!MP.room)return;MP.room.presence({n:P.name,c:P.cls,lv:P.lvl,lk:P.look,st:'lobby',rc:null,host:0}).catch(e=>{MP.lobErr=e&&e.code})}
async function mpJoin(code,asHost){if(!MP.room)return;code=code.toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,8);if(code.length<3){$('lobStatus').textContent='Il codice ha 4 caratteri.';return}
  MP.r=codeRoom(code);MP.code=code;MP.host=!!asHost;MP.diag={t0:performance.now()};try{MP.r.onPeers(()=>{if(MP.on)renderParty()},e=>{MP.diag.connErr=e&&e.code})}catch(e){}try{MP.r.onConnection(c=>{MP.diag.conn=c},e=>{MP.diag.connErr=e&&e.code})}catch(e){}mpEnterRoomCamp()}
$('lobCreate').onclick=()=>{audioInit();mpJoin(newCode(),true)};
$('lobEnter').onclick=()=>{audioInit();mpJoin($('lobCode').value,false)};
$('lobCode').addEventListener('keydown',e=>{if(e.key==='Enter')$('lobEnter').click()});
$('lobStart').onclick=()=>{audioInit();mpStartHost()};
$('lobBack').onclick=()=>{mpLeaveRoom();$('scLobby').hidden=true;$('scTitle').hidden=false;mode='title';refreshTitle()};
$('btnMP').onclick=()=>{audioInit();if(store.get('pp5_save',null)&&loadGame()){equipVisual();renderSlots();setAbilityUI();openLobby()}else{MP.after=true;$('btnNew').onclick()}};
$('bLeave').onclick=()=>{if(confirmLeave())mpLeave()};
function confirmLeave(){return true}

// ---------- game start / leave ----------
// Everyone in the room lands together at the camp (the waiting area): they see each other, then the admin enters the portal and picks the road.
function mpEnterRoomCamp(){MP.on=true;MP.remotes.forEach(r=>r.root.parent&&r.root.parent.remove(r.root));MP.remotes.clear();MP.ghosts.clear();MP.hb=null;MP.dmTot={};MP.dmTime={};MP.myGates.clear();MP.pq=0;MP.pqSeen={};MP.noHostT=0;MP.aloneT=0;MP.fin=0;MP.finShown=0;
  if(MP.host){seedBase=(Math.random()*1e9)|0;MP.route=genRoute((Math.random()*1e9)|0);MP.rcur=null;MP.rhist=[];MP.xpT=MP.gdT=MP.kcT=MP.keT=MP.bkT=0;MP.hd={};MP.base={}}else{MP.route=null;MP.rcur=null;MP.rhist=[]}
  closeLobby();P.hp=P.maxHp;P.mp=P.maxMp;P.mpDown=0;mode='play';startCamp();showTouch();renderSlots();setAbilityUI();$('bLeave').hidden=false;$('bInvite').hidden=!window.PP_SITE;mpSend(true);renderParty();if(MP.host&&window.PP_SITE)setTimeout(showQR,900);
  banner(`Stanza ${MP.code.toUpperCase()}`,MP.host?'SEI L\'ADMIN · QUANDO ARRIVANO GLI AMICI, ENTRA NEL PORTALE':'ASPETTA L\'ADMIN · LUI SCEGLIE LA STRADA',3400);
  setTimeout(()=>{if(MP.on&&floor===0)toast(MP.host?`Manda il codice ${MP.code.toUpperCase()} ai tuoi amici`:'Sei nella stanza: cerca il tuo amico nell\'accampamento')},3600)}
function mpCommonStart(){MP.on=true;MP.remotes.forEach(r=>r.root.parent&&r.root.parent.remove(r.root));MP.remotes.clear();MP.ghosts.clear();MP.hb=null;MP.dmTot={};MP.dmTime={};MP.myGates.clear();MP.myPt=0;MP.noHostT=0;
  closeLobby();P.hp=P.maxHp;P.mp=P.maxMp;P.mpDown=0;mode='play';showTouch();renderSlots();setAbilityUI();$('bLeave').hidden=false}
function mpStartHost(){MP.host=true;seedBase=(Math.random()*1e9)|0;MP.xpT=MP.gdT=MP.kcT=MP.keT=MP.bkT=0;MP.hd={};MP.base={};MP.fin=0;MP.route=genRoute((Math.random()*1e9)|0);MP.rcur=null;MP.rhist=[];mpCommonStart();
  openRouteMap({choices:MP.route.layers[0].map(n=>n.id),canClose:false,title:'Scegli dove inizia il gruppo',onPick:n=>{MP.rcur=n.id;MP.rhist=[n.id];startFloor(1,n);mpSend(true);banner('Partita con amici!',`STANZA ${MP.code.toUpperCase()}`,2400)}})}
function mpEnterAsClient(h){const pr=h.presence;MP.host=false;MP.hostPeer=h.peer;seedBase=pr.seed|0;MP.fin=0;MP.finShown=0;MP.route=genRoute(pr.rs|0);MP.rcur=pr.nd;MP.rhist=[pr.nd];mpCommonStart();startFloor(pr.fl|0||1,MP.route.nodes[pr.nd]);mpSend(true);banner('Sei nella partita!',`STANZA ${MP.code.toUpperCase()}`,2400)}
function mpLeaveRoom(){if(MP.r){try{MP.r.leave()}catch(e){}}MP.r=null;MP.on=false;MP.host=false;MP.remotes.forEach(r=>r.root.parent&&r.root.parent.remove(r.root));MP.remotes.clear();MP.ghosts.clear()}
function mpLeave(){mpLeaveRoom();$('bInvite').hidden=true;$('qrWrap').hidden=true;P.mpDown=0;$('bLeave').hidden=true;P.hp=P.maxHp;startCamp();toast('Hai lasciato il gruppo');renderParty()}
function mpSpawnOffset(){if(!MP.on||!MP.r)return[0,0];const ids=MP.r.peers().filter(p=>p.sameTab||p.presence.st==='play').map(p=>p.peer).sort();const i=Math.max(0,ids.indexOf(MP.me));return[[0,0],[1.3,0],[-1.3,0],[0,1.3],[0,-1.3],[1.3,1.3]][i%6]}
function mpFloorReset(){MP.dmTot={};MP.dmTime={};MP.myGates.clear();MP.myPt=0;MP.ghosts.clear();MP.base={};MP.remotes.forEach(r=>{r.root.parent&&r.root.parent.remove(r.root)});MP.fx.forEach(f=>f.m.parent&&f.m.parent.remove(f.m));MP.fx=[];MP.loading=false}

// ---------- hooks used by the solo code ----------
function mpFoes(){if(!MP.host)return[];const out=[];MP.remotes.forEach(r=>{if(r.inGame&&!r.down&&!r.dead)out.push(r)});return out}
function mpHurtRemote(r,d){if(r.down)return false;d=Math.max(1,Math.round(d));MP.hd[r.peer]=(MP.hd[r.peer]||0)+d;float(r.x,r.y+2.1,r.z,'-'+d,'#ff9a8a');return true}
function mpDmg(e,d){const k=e.mid;MP.dmTot[k]=(MP.dmTot[k]||0)+Math.max(1,Math.round(d));MP.dmTime[k]=MP.t}
function mpKill(e){MP.xpT+=e.xp;MP.gdT+=Math.round((e.gold[0]+e.gold[1])/2*.7);MP.kcT++;if(e.elite||e.mimic)MP.keT++;if(e.boss)MP.bkT++}
function mpPortal(){if(MP.host){mpHostPortal()}else{MP.pq=(MP.pq|0)+1;mpSend(true);toast('L\'admin della stanza sceglie la strada sulla mappa: gliel\'ho chiesto')}}
function mpDie(){if(P.mpDown>0)return;P.hp=0;P.mpDown=6;const lost=Math.floor(P.gold*.1);P.gold-=lost;if(P.shadowT>0)endShadow();sfx('hurt');music.stinger('death');banner('Sei a terra!',`RIENTRI TRA POCO · -${lost} ORO`,2200)}
function mpGhost(e,dt){e.flash-=dt;if(e.mats)for(const m of e.mats)m.emissive&&m.emissive.setHex(e.flash>0?0x803020:(e.wind>0&&Math.sin(performance.now()/40)>0?0x601010:0));
  const ox=e.x,oz=e.z,k=Math.min(1,dt*8);e.x=lerp(e.x,e.tx,k);e.z=lerp(e.z,e.tz,k);e.mv=Math.hypot(e.x-ox,e.z-oz)/Math.max(dt,1e-3);gravity(e,dt);e.yaw+=angDiff(e.tyaw,e.yaw)*Math.min(1,dt*10);
  e.obj.position.set(e.x,e.y,e.z);e.obj.rotation.y=e.yaw;animMon(e,dt);e.mv=0}

// ---------- remote players ----------
function remoteRec(p){let r=MP.remotes.get(p.peer);const pr=p.presence;
  if(!r){const look=pr.lk&&typeof pr.lk==='object'?pr.lk:randLook();let H_;try{H_=makeHumanoid(look,1,{cls:PCLASS[pr.c]?pr.c:null})}catch(e){H_=makeHumanoid(randLook())}
    r={peer:p.peer,kind:'remote',team:'ally',H:H_,root:H_.root,x:0,z:0,y:0,yaw:0,tx:0,tz:0,ty:0,tyaw:0,r:.4,hp:100,maxHp:100,at:pr.at|0,atkT:-1,sh:pr.sh|0,ab:pr.ab|0,w:null,wObj:null,sObj:null,first:true,inGame:false,down:false,dead:false,name:'',cls:'cavaliere',lv:1};
    MP.remotes.set(p.peer,r)}
  r.name=String(pr.n||'Amico').slice(0,14);r.cls=PCLASS[pr.c]?pr.c:'cavaliere';r.lv=pr.lv|0;
  if(pr.w!==r.w&&WT[pr.w]){if(r.wObj&&r.wObj.parent)r.wObj.parent.remove(r.wObj);r.w=pr.w;r.wObj=makeWeaponMesh({base:pr.w,rar:1,el:ELEM[pr.el]?pr.el:null});if(pr.w==='bow')r.H.armL.hand.add(r.wObj);else{r.H.armR.hand.add(r.wObj);r.wObj.rotation.x=-.25}
    if(!r.sObj&&PCLASS[r.cls].shield){r.sObj=makeShield((pr.lk&&pr.lk.shield)|0);r.H.armL.hand.add(r.sObj)}if(r.sObj)r.sObj.visible=pr.w!=='bow'}
  const pp=Array.isArray(pr.p)?pr.p:[0,0,0,0];r.tx=pp[0]/100;r.ty=pp[1]/100;r.tz=pp[2]/100;r.tyaw=pp[3]/100;if(r.first){r.x=r.tx;r.y=r.ty;r.z=r.tz;r.yaw=r.tyaw;r.first=false}
  const hp=Array.isArray(pr.hp)?pr.hp:[1,1];r.hp=+hp[0]||0;r.maxHp=Math.max(1,+hp[1]||1);r.down=r.hp<=0||!!pr.sd;r.mvS=+pr.mv||0;r.air=!!pr.ag;r.block=!!pr.bl;r.draw=(+pr.dr||0)/10;r.cast=!!pr.cs;r.dance=!!pr.dn;r.dead=false;r.ay=typeof pr.ay==='number'?pr.ay/100:null;
  if((pr.at|0)!==r.at){r.at=pr.at|0;r.atkT=0;r.atkKind=pr.ak==='t'?'thrust':pr.ak==='s'?'spin':'swing'}
  if((pr.sh|0)!==r.sh){r.sh=pr.sh|0;if(r.inGame&&r.w)remoteShot(r,+pr.pi||0,pr.el)}
  if(pr.rvp&&MP.me&&pr.rvp===MP.me&&(pr.rv|0)>(r.rvSeen|0)){if(P.mpDown>0)MP.revived=1}r.rvSeen=pr.rv|0;
  if((pr.ab|0)!==r.ab){r.ab=pr.ab|0;if(r.inGame){burst(r.x,r.y+1,r.z,'#c88aff',24,3);float(r.x,r.y+2.6,r.z,PCLASS[r.cls].abN+'!','#e0c0ff',1)}}
  return r}
function remoteShot(r,pitch,el){const b=WT[r.w];if(!b||b.kind==='melee')return;const yw=r.ay!=null?r.ay:r.yaw,dir=new THREE.Vector3(Math.sin(yw)*Math.cos(pitch),-Math.sin(pitch),Math.cos(yw)*Math.cos(pitch));const from=new THREE.Vector3(r.x,r.y+1.45,r.z).addScaledVector(dir,.6);
  if(b.kind==='bow'){const m=arrowMesh(ELEM[el]?el:null);m.lookAt(from.clone().add(dir));shoot({mesh:m,pos:from,vel:dir.multiplyScalar(30),team:'fx',grav:4,arrow:1,life:1.5});sfx('arrow',.3)}
  else{const col=ELEM[el]?ELEM[el].c:'#ffffff';shoot({mesh:mesh(sph(.15,10,8),new THREE.MeshBasicMaterial({color:col,toneMapped:false}),0,0,0,false),pos:from,vel:dir.multiplyScalar(16),team:'fx',orb:col,life:1.5});sfx('magic',.3)}}
function updRemotes(dt){MP.remotes.forEach(r=>{if(!r.inGame){if(r.root.parent)r.root.parent.remove(r.root);return}if(r.root.parent!==world)world.add(r.root);
  const k=Math.min(1,dt*12);r.x=lerp(r.x,r.tx,k);r.z=lerp(r.z,r.tz,k);r.y=lerp(r.y,r.ty,k);r.yaw+=angDiff(r.tyaw,r.yaw)*k;if(Math.hypot(r.tx-r.x,r.tz-r.z)>8){r.x=r.tx;r.z=r.tz;r.y=r.ty}
  if(r.atkT>=0){r.atkT+=dt/.42;if(r.atkT>=1)r.atkT=-1}r.root.position.set(r.x,r.y,r.z);r.root.rotation.y=r.yaw;
  animHuman(r.H,{speed:r.down?0:r.mvS,air:r.air,atk:r.atkT,atkKind:r.atkKind,block:r.block?1:0,draw:r.draw,cast:r.cast?1:0,dance:r.dance,dead:r.hp<=0,twist:(r.draw>0||r.cast)&&r.ay!=null&&r.atkT<0&&!r.block?clamp(angDiff(r.ay,r.yaw),-1.3,1.3):0},dt)})}

// ---------- presence out ----------
function mpSend(force){if(!MP.r)return;MP.sendT-=1;if(!force&&MP.sendT>0)return;MP.sendT=6;const w=P.inv[P.eq];
  const o={n:P.name,c:P.cls,lv:P.lvl,lk:P.look,st:'play',fl:floor,host:MP.host?1:0,p:[Math.round(P.x*100),Math.round(P.y*100),Math.round(P.z*100),Math.round(P.yaw*100)],
    hp:[Math.max(0,Math.round(P.hp)),P.maxHp],mv:Math.round(P.moving||0),ag:P.onGround?0:1,bl:P.block?1:0,dr:Math.round((P.drawT||0)*10),cs:P.castT>0?1:0,dn:P.dance>0?1:0,sd:P.shadowT>0?1:0,
    w:w?w.base:null,el:w&&w.el||null,at:MP.atC|0,ak:P.atkKind==='thrust'?'t':P.atkKind==='spin'?'s':'w',sh:MP.shC|0,pi:Math.round((cam.fp?cam.fpPitch:0)*100)/100,ay:Math.round(aimYaw()*100),ab:MP.abC|0};
  if(MP.host){o.seed=seedBase;o.rs=MP.route?MP.route.seed:0;o.nd=MP.rcur||null;o.ch=RM.open?1:0;o.fin=MP.fin|0;o.xp=MP.xpT;o.gd=MP.gdT;o.kc=MP.kcT;o.ke=MP.keT;o.bk=MP.bkT;o.hd={};MP.remotes.forEach(r=>{if(r.inGame&&MP.hd[r.peer])o.hd['p'+r.peer.replace(/[^A-Za-z0-9_-]/g,'')]=MP.hd[r.peer]});
    o.gt=GATES.map((g,i)=>g.open||g.lifting?i:-1).filter(i=>i>=0);
    const pts=[[P.x,P.z]];MP.remotes.forEach(r=>{if(r.inGame)pts.push([r.x,r.z])});const near=e=>Math.min(...pts.map(q=>Math.hypot(e.x-q[0],e.z-q[1])));
    const mons=ENT.filter(e=>!e.dead&&e.team==='enemy'&&e.kind==='mon').map(e=>[near(e),e]).filter(a=>a[0]<38).sort((a,b)=>a[0]-b[0]).slice(0,48).map(a=>a[1]);
    o.m=mons.map(e=>[e.mid,MT.indexOf(e.type),Math.round(e.x*10),Math.round(e.z*10),Math.max(0,Math.round(e.hp/e.maxHp*100)),Math.round(((e.yaw*180/Math.PI)%360+360)%360/2),(e.wind>0?1:0)|(e.aggro?2:0)|(e.dashT>0?4:0)]);
    o.pr=PROJ.filter(p=>p.team==='enemy').slice(0,12).map(p=>[Math.round(p.pos.x*10),Math.round(p.pos.y*10),Math.round(p.pos.z*10),Math.round(p.vel.x*10),Math.round(p.vel.y*10),Math.round(p.vel.z*10),p.grav?1:0]);
    o.rg=RINGS.filter(r=>r.from==='b').slice(0,4).map(r=>[Math.round(r.x*10),Math.round(r.z*10),Math.round(r.r*10),r.spd]);
  }else{const dm={};let n=0;for(const k in MP.dmTot){if(MP.t-MP.dmTime[k]<8&&n<24){dm['m'+k]=MP.dmTot[k];n++}}o.dm=dm;o.gt=[...MP.myGates];o.pq=MP.pq|0}
  o.rv=MP.rvC|0;o.rvp=MP.rvP||'';
  let js=JSON.stringify(o);while(js.length>3900&&o.m&&o.m.length){o.m.length=Math.floor(o.m.length*.7);js=JSON.stringify(o)}
  MP.r.presence(o).then(()=>{MP.diag.presOk=(MP.diag.presOk|0)+1;MP.diag.presErr=null},e=>{MP.diag.presErr=(e&&e.code)||'errore';MP.diag.presMsg=e&&e.message})}

// ---------- per-frame tick ----------
function mpTick(dt){MP.t+=dt;const peers=MP.r.peers();const meP=peers.find(p=>p.sameTab);if(meP)MP.me=meP.peer;
  if(mode==='lobby'){if(!MP.on){const h=peers.find(p=>!p.sameTab&&p.presence&&p.presence.host&&p.presence.st==='play'&&p.presence.nd&&p.presence.rs);if(h)mpEnterAsClient(h)}MP.lobT-=dt;if(MP.lobT<=0){MP.lobT=1;drawLobby()}return}
  if(!MP.on)return;
  // remotes in game on my floor
  const seen=new Set();let host=null;
  for(const p of peers){if(p.sameTab||!p.presence||p.presence.st!=='play')continue;seen.add(p.peer);const r=remoteRec(p);r.inGame=(p.presence.fl|0)===floor;if(p.presence.host&&(!host||p.peer<host.peer))host=p}
  MP.remotes.forEach((r,k)=>{if(!seen.has(k)){r.dead=true;r.inGame=false;if(r.root.parent)r.root.parent.remove(r.root);MP.remotes.delete(k);toast(`${r.name} ha lasciato la partita`);renderParty()}});
  MP.count=1+[...MP.remotes.values()].filter(r=>r.inGame).length;updRemotes(dt);if(seen.size===0){MP.aloneT=(MP.aloneT||0)+dt;if(MP.aloneT>14&&!MP.aloneHint){MP.aloneHint=1;banner('Sei ancora solo nella stanza',`CODICE ${MP.code.toUpperCase()}`,3000);toast(window.PP_SITE?'Fai inquadrare il QR code ai tuoi amici: pulsante Invita o tocca la scritta della stanza':'Prova: apri il gioco in un\'altra scheda o sul telefono con il TUO account ed entra con lo stesso codice. Se lì vi vedete, il gioco funziona e al tuo amico manca l\'accesso')}}else MP.aloneT=0;
  MP.stT=(MP.stT||0)-dt;if(MP.stT<=0){MP.stT=1;renderParty();updMission()}
  if(MP.host){if(host&&host.peer<MP.me&&host.presence.fl===floor){MP.host=false;MP.hostPeer=host.peer;MP.hb=null;for(const e of ENT)if(e.team==='enemy'&&e.kind==='mon'&&!e.dead){e.dead=true;world.remove(e.obj)}}
    else mpHostTick(peers)}
  if(!MP.host)mpClientTick(host,dt);
  if(P.mpDown>0){P.mpDown-=dt;P.hp=0;if(MP.revived){MP.revived=0;P.mpDown=0;P.hp=Math.round(P.maxHp*.5);P.iT=2;burst(P.x,P.y+1,P.z,'#7be36b',24,3);toast('Un amico ti ha rialzato!')}else if(P.mpDown<=0){const mate=[...MP.remotes.values()].find(r=>r.inGame&&!r.down);if(mate)placeP(mate.x+.8,mate.z+.8,P.yaw);else{const s=LV.rooms.find(r=>r.type==='start');if(s){const c=W2(s.x0+3,s.z0+3);placeP(c.x,c.z,0)}}
    P.hp=Math.round(P.maxHp*.6);P.iT=2.5;burst(P.x,P.y+1,P.z,'#7be36b',24,3);toast('Sei di nuovo in piedi!')}}
  updFx(dt);mpSend(false)}
function mpHostTick(peers){for(const p of peers){if(p.sameTab||!p.presence||p.presence.st!=='play'||(p.presence.fl|0)!==floor)continue;const pr=p.presence,r=MP.remotes.get(p.peer);if(!r)continue;
    if(pr.dm&&typeof pr.dm==='object'){const b=MP.base[p.peer]||(MP.base[p.peer]={});for(const kk in pr.dm){const k=kk.replace(/^m/,''),v=+pr.dm[kk]||0,d=v-(b[k]||0);if(d>0&&d<5000){const e=ENT.find(x=>x.mid===+k&&!x.dead&&x.team==='enemy');if(e)hitEnt(e,d,{src:r})}if(v>(b[k]||0))b[k]=v}}
    if(Array.isArray(pr.gt))for(const gi of pr.gt){const g=GATES[gi|0];if(g&&!g.open&&!g.lifting){g.lifting=true;sfx('gate');toast(`${r.name} ha aperto una grata`)}}
    MP.pqSeen=MP.pqSeen||{};if((pr.pq|0)>(MP.pqSeen[p.peer]|0)){MP.pqSeen[p.peer]=pr.pq|0;if(!RM.open){toast(`${r.name} è al portale: scegli la strada`);mpHostPortal()}}}}
function mpBecomeHost(){MP.host=true;MP.hostPeer=MP.me;let mx=0;for(const e of ENT)if(e.ghost){e.ghost=false;e.aggro=true;e.cd=rr(.6,1.6);e.wind=0;mx=Math.max(mx,e.mid|0)}MP.midC=Math.max(MP.midC,mx)+1000;
  MP.xpT=MP.gdT=MP.kcT=MP.keT=MP.bkT=0;MP.hd={};MP.base={};MP.r.peers().forEach(p=>{if(!p.sameTab&&p.presence&&p.presence.dm){const b={};for(const kk in p.presence.dm)b[kk.replace(/^m/,'')]=p.presence.dm[kk];MP.base[p.peer]=b}});MP.ghosts.clear();banner('Ora sei tu l\'host','L\'HOST PRECEDENTE È USCITO',2200)}
function mpClientTick(host,dt){if(!host){MP.noHostT+=dt;if(MP.noHostT>4){const ids=[MP.me,...[...MP.remotes.values()].filter(r=>r.inGame).map(r=>r.peer)].sort();if(ids[0]===MP.me)mpBecomeHost()}return}MP.noHostT=0;
  const pr=host.presence;if(host.peer!==MP.hostPeer){MP.hostPeer=host.peer;MP.hb=null}if(pr.rs&&(!MP.route||MP.route.seed!==(pr.rs|0)))MP.route=genRoute(pr.rs|0);if(pr.seed&&floor===0)seedBase=pr.seed|0;
  if(pr.fin&&!MP.finShown){MP.finShown=1;setTimeout(showVictory,1500)}
  if(pr.ch&&!MP.chT){MP.chT=1;toast('L\'host sta scegliendo la strada sulla mappa')}if(!pr.ch)MP.chT=0;
  if(pr.nd&&((pr.fl|0)!==floor||pr.nd!==MP.rcur)){if(!MP.loading&&(pr.fl|0)>0){MP.loading=true;if((pr.seed|0)!==seedBase)seedBase=pr.seed|0;if(!MP.route||MP.route.seed!==(pr.rs|0))MP.route=genRoute(pr.rs|0);MP.rcur=pr.nd;MP.rhist=MP.rhist||[];if(!MP.rhist.includes(pr.nd))MP.rhist.push(pr.nd);const nd=MP.route.nodes[pr.nd];fadeTo(()=>startFloor(pr.fl|0,nd))}return}
  if(pr===MP.lastHostPres)return;MP.lastHostPres=pr;
  const hdMe=(pr.hd&&+pr.hd['p'+MP.me.replace(/[^A-Za-z0-9_-]/g,'')])||0;
  if(!MP.hb){MP.hb={xp:pr.xp|0,gd:pr.gd|0,kc:pr.kc|0,ke:pr.ke|0,bk:pr.bk|0,hd:hdMe}}else{const b=MP.hb;
    const dHd=hdMe-b.hd;if(dHd>0&&P.mpDown<=0){let src=null,bd=4;for(const e of MP.ghosts.values()){const d=Math.hypot(e.x-P.x,e.z-P.z);if(d<bd){bd=d;src=e}}hurtPlayer(dHd,src)}b.hd=Math.max(b.hd,hdMe);
    const dXp=(pr.xp|0)-b.xp;if(dXp>0){gainXP(dXp);float(P.x,P.y+2.6,P.z,`+${dXp} XP`,'#b0e4ff')}b.xp=Math.max(b.xp,pr.xp|0);
    const dGd=(pr.gd|0)-b.gd;if(dGd>0){P.gold+=dGd;sfx('coin');float(P.x,P.y+2.2,P.z,'+'+dGd,'#ffc53d')}b.gd=Math.max(b.gd,pr.gd|0);
    const dKc=(pr.kc|0)-b.kc;for(let i=0;i<dKc&&i<10;i++){stats.kills++;mission&&mission.on('kill',{})}b.kc=Math.max(b.kc,pr.kc|0);
    const dKe=(pr.ke|0)-b.ke;for(let i=0;i<dKe&&i<3;i++){dropItem(P.x,P.z,'weapon',makeWeapon(floor,Math.max(1,rollRarity(floor,1))));mission&&mission.on('kill',{elite:true})}b.ke=Math.max(b.ke,pr.ke|0);
    const dBk=(pr.bk|0)-b.bk;if(dBk>0){stats.bosses++;banner('Boss sconfitto!','IL GRUPPO HA VINTO',3000);music.stinger('victory');dropItem(P.x,P.z,'weapon',makeWeapon(floor,Math.max(2,rollRarity(floor,1))));dropItem(P.x+1,P.z,'potion');P.dance=3}b.bk=Math.max(b.bk,pr.bk|0)}
  if(Array.isArray(pr.gt))for(const gi of pr.gt){const g=GATES[gi|0];if(g&&!g.open&&!g.lifting)g.lifting=true}
  // ghosts
  const seenM=new Set();if(Array.isArray(pr.m))for(const row of pr.m){if(!Array.isArray(row))continue;const[mid,ti,x,z,hp,yw,fl]=row;const type=MT[ti|0];if(!type)continue;let e=MP.ghosts.get(mid);
    if(!e||e.dead){MP.allowSpawn=true;try{e=spawnMon(type,x/10,z/10,Math.max(1,floor))}finally{MP.allowSpawn=false}e.ghost=true;e.mid=mid;e.tx=x/10;e.tz=z/10;e.tyaw=0;MP.ghosts.set(mid,e)}
    e.tx=x/10;e.tz=z/10;e.lastPct=hp;e.hp=Math.max(0,hp/100*e.maxHp);e.tyaw=(yw|0)*2*Math.PI/180;e.wind=fl&1?.3:0;e.dashT=fl&4?.1:0;if(fl&2&&!e.aggro){e.aggro=true;if(e.boss){banner(e.n,'BOSS',2200);music.stinger('boss')}}seenM.add(mid)}
  MP.ghosts.forEach((e,mid)=>{if(seenM.has(mid))return;if(!e.dead){e.dead=true;if(e.lastPct<40&&Math.hypot(e.x-P.x,e.z-P.z)<30){burst(e.x,e.y+1,e.z,'#ffffff',16,4);burst(e.x,e.y+1,e.z,'#ffc53d',12,4)}world.remove(e.obj)}MP.ghosts.delete(mid)});
  // enemy projectile and shockwave visuals
  MP.fx.forEach(f=>f.m.parent&&f.m.parent.remove(f.m));MP.fx=[];if(Array.isArray(pr.pr))for(const q of pr.pr){if(!Array.isArray(q))continue;const m=mesh(sph(.2,8,6),glowM(0xff7a2a),q[0]/10,q[1]/10,q[2]/10,false);world.add(m);MP.fx.push({m,vx:q[3]/10,vy:q[4]/10,vz:q[5]/10,g:q[6]?11:0})}
  MP.ringFx=Array.isArray(pr.rg)?pr.rg.filter(Array.isArray).map(q=>({x:q[0]/10,z:q[1]/10,r:q[2]/10,spd:+q[3]||8})):[];
  // let the shockwave hurt me only through the host; show a jump hint
  if(MP.ringFx.length&&!MP.ringHint){MP.ringHint=1;toast('Onda d\'urto: salta!')}}
function updFx(dt){for(const f of MP.fx){f.vy-=f.g*dt;f.m.position.x+=f.vx*dt;f.m.position.y+=f.vy*dt;f.m.position.z+=f.vz*dt}
  for(const r of MP.ringFx){r.r+=r.spd*dt;for(let q=0;q<8;q++){const a=rr(0,6.28),x=r.x+Math.cos(a)*r.r,z=r.z+Math.sin(a)*r.r;PA[pIdx]={x,y:groundH(x,z)+.1,z,vx:0,vy:2,vz:0,r:1,g:.5,b:.2,life:.3,ml:.3,grav:4};pIdx=(pIdx+1)%PN}}}

// ---------- HUD bits ----------
function mpStatus(){const ps=MP.r?MP.r.peers():[],others=ps.filter(p=>!p.sameTab),withGame=others.filter(p=>p.presence&&p.presence.st==='play'),d=MP.diag||{},conn=MP.r&&MP.r.connected?MP.r.connected():false;
  let t=`Stanza ${MP.code.toUpperCase()} · ${MP.host?'admin':'giocatore'} · `;
  if(d.connErr==='not_granted'||d.presErr==='not_granted'||d.connErr==='revoked')return t+'il tuo account non può collegarsi alle stanze (apri la pagina dall\'invito email, collegato a claude.ai)';
  if(!conn)return t+'collegamento in corso…';
  if(d.presErr)return t+`errore di invio (${d.presErr})`;
  if(!others.length&&window.PP_SITE)return t+'nessun amico ancora · tocca qui per il QR code';
  if(!others.length){let all=1;try{all=MP.room.peers().length}catch(e){}return t+(all>1?`nessuno con questo codice (${all-1} altri hanno il gioco aperto)`:'collegato · nessun altro ha il gioco aperto adesso')}
  if(withGame.length<others.length)return t+`${others.length} persone collegate, ${others.length-withGame.length} non ancora nel gioco`;
  return t+`${others.length+1} giocatori insieme`}
function renderMPParty(){const el=$('party');el.innerHTML='';
  const me=document.createElement('div');me.className='ord';me.style.textTransform='none';me.style.whiteSpace='normal';me.textContent=mpStatus();el.appendChild(me);
  let n=0;MP.remotes.forEach(r=>{n++;const d=document.createElement('div');d.className='pm';d.innerHTML='<span></span><div class="bar hp"><i></i></div>';d.firstChild.textContent=`${r.name} · ${PCLASS[r.cls].n} ${r.lv}${r.inGame?'':' · altro piano'}`;d.querySelector('i').style.transform=`scaleX(${Math.max(0,r.hp/r.maxHp)})`;el.appendChild(d)});
  if(!n){const d=document.createElement('div');d.className='pm';d.textContent='In attesa di amici…';el.appendChild(d)}}
function mpOverlay(){MP.remotes.forEach(r=>{if(!r.inGame)return;const p=proj(r.x,r.y+2.35,r.z);if(!p)return;ux.font='800 13px Nunito,system-ui,sans-serif';ux.lineWidth=4;ux.strokeStyle='#000';const t=r.hp<=0?`${r.name} · a terra`:r.name;ux.strokeText(t,p[0],p[1]);ux.fillStyle=r.hp<=0?'#ff8a7a':'#9fe8ff';ux.fillText(t,p[0],p[1]);
  const w=44;ux.fillStyle='#000a';ux.fillRect(p[0]-w/2-1,p[1]+4,w+2,6);ux.fillStyle='#6cc070';ux.fillRect(p[0]-w/2,p[1]+5,w*Math.max(0,r.hp/r.maxHp),4)});
  if(P.mpDown>0){ux.font='800 22px Nunito,system-ui,sans-serif';ux.lineWidth=5;ux.strokeStyle='#000';const t=`Rientri tra ${Math.ceil(P.mpDown)}…`;ux.strokeText(t,uic.width/2,uic.height*.62);ux.fillStyle='#ffd0c0';ux.fillText(t,uic.width/2,uic.height*.62)}}
function refreshTitle(){const sv=store.get('pp5_save',null);if(sv&&sv.look){$('btnCont').hidden=false;$('btnCont').textContent=`Continua · ${sv.name||'Esploratore'} · liv ${sv.lvl||1} · piano ${Math.max(1,sv.cp||1)}`}}
