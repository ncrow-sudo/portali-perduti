// ================= Personaggi glTF (KayKit Adventurers 1.0, CC0, Kay Lousberg) =================
// I modelli sono in src/assets (preparati con tools/prepara_modelli.mjs). Se non si caricano, si usa il personaggio procedurale.
// Interfaccia uguale a makeHumanoid: root, head, torso, armL/armR.hand, mats, bw. In più: gltf=true e lo stato del mixer.
const GLB={on:store.get('pp_gltf',true),src:{},clips:null,ready:false,failed:false,cbs:[],
  has(c){return this.on&&this.ready&&!!this.src[c]},whenReady(f){if(this.ready||this.failed)f();else this.cbs.push(f)}};
try{if(/[?&]classico\b/.test(location.search))GLB.on=false}catch(e){}
// un file per classe (solo mesh e scheletro) e uno con le animazioni, condivise perché lo scheletro è lo stesso
const GLB_CLASSES=['cavaliere','mago','arciere','assassino','fabbro'];
const GLB_H=2.0; // altezza in unità del procedurale (prima della scala .93)
// i modelli KayKit hanno la testa grande quasi metà dell'altezza: dall'alto testa e cappello coprivano il corpo.
// Rimpiccioliamo la testa (con elmo e cappelli) e scaliamo il resto, così il corpo è più grande e visibile.
const GLB_HEAD=.68;
const GLB_UPPER=new Set(['spine','chest','head','upperarml','lowerarml','wristl','handl','handslotl','upperarmr','lowerarmr','wristr','handr','handslotr']);
function glbDone(){const c=GLB.cbs;GLB.cbs=[];c.forEach(f=>{try{f()}catch(e){console.warn(e)}})}
function glbFetch(ld,f){return new Promise(res=>{const ko=e=>{console.warn('glb',f,e);res(null)};
  const emb=window.PP_GLB&&window.PP_GLB[f];
  if(emb){try{const s=atob(emb),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);ld.parse(u.buffer,'',res,ko)}catch(e){ko(e)}}
  else ld.load('assets/'+f+'.glb',res,undefined,ko)})}
// prima animazioni e classi che servono subito (sblocca il menu), poi le altre in sottofondo
function glbLoad(){
  if(!GLB.on||!window.THREE||!THREE.GLTFLoader||!THREE.SkeletonUtils){GLB.failed=true;glbDone();return}
  const ld=new THREE.GLTFLoader(),sv=store.get('pp5_save',null);
  // subito: la classe salvata, quelle dei compagni salvati, e cavaliere e mago (giocatore e compagno di una partita nuova)
  const need=[sv&&sv.cls,...((sv&&Array.isArray(sv.army))?sv.army.map(d=>d&&d.cls):[]),'cavaliere','mago'].filter((c,i,a)=>GLB_CLASSES.includes(c)&&a.indexOf(c)===i);
  const one=c=>glbFetch(ld,c).then(g=>{if(g)try{glbPrep(c,g)}catch(e){console.warn('glb',c,e)}});
  const to=setTimeout(()=>{if(!GLB.ready){GLB.failed=true;glbDone()}},10000);
  glbFetch(ld,'animazioni').then(g=>{if(!g)throw 0;glbClips(g.animations);return Promise.all(need.map(one))})
    .then(()=>{clearTimeout(to);GLB.ready=true;glbDone();return Promise.all(GLB_CLASSES.filter(c=>!GLB.src[c]).map(one))})
    .catch(()=>{clearTimeout(to);GLB.failed=true;glbDone()})}
function glbClips(list){const clips={};
  for(const c of list){clips[c.name]=c;const up=c.tracks.filter(t=>GLB_UPPER.has(t.name.split('.')[0]));clips[c.name+'#up']=new THREE.AnimationClip(c.name+'#up',c.duration,up)}
  GLB.clips=clips}
function glbPrep(cls,g){
  const scene=g.scene;scene.updateMatrixWorld(true);let top=0;
  scene.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;if(!n.geometry.boundingBox)n.geometry.computeBoundingBox();top=Math.max(top,n.geometry.boundingBox.max.y)}});
  const hb=scene.getObjectByName('head'),hy=hb?hb.getWorldPosition(new THREE.Vector3()).y:top*.55;
  GLB.src[cls]={scene,k:GLB_H/Math.max(1,hy+(top-hy)*GLB_HEAD)}}

// socket: gruppo figlio di un osso, con gli assi del modello in posa di riposo e misure in metri come il procedurale
function glbSock(bone,k,rot){const g=new THREE.Group();bone.add(g);
  if(rot)g.rotation.set(rot[0],rot[1],rot[2]);else{const q=new THREE.Quaternion();bone.getWorldQuaternion(q);g.quaternion.copy(q.invert())}
  g.scale.setScalar(1/k);return g}

function makeGltfHuman(L,scale,o){
  const S=GLB.src[o.cls];if(!S)return null;
  const model=THREE.SkeletonUtils.clone(S.scene),root=new THREE.Group(),inner=new THREE.Group();
  inner.scale.setScalar(S.k);inner.add(model);root.add(inner);root.scale.setScalar(.93*scale);
  const mats=[],headMeshes=[],fpHide=[];
  model.traverse(n=>{if(!n.isMesh)return;n.material=n.material.clone();mats.push(n.material);n.frustumCulled=false;
    if(/_Head(_Hooded)?$/.test(n.name)){headMeshes.push(n);
      // tinta della pelle scelta nell'avatar, relativa alla pelle più chiara (quella della texture)
      if(L&&LOOK.skin[L.skin]){const a=new THREE.Color(LOOK.skin[L.skin]),b=new THREE.Color(LOOK.skin[0]);n.material.color.setRGB(Math.min(1,a.r/b.r),Math.min(1,a.g/b.g),Math.min(1,a.b/b.b))}}
    if(/_(Cape|ArmLeft|ArmRight)$/.test(n.name))fpHide.push(n);
    if(/_Cape$/.test(n.name)&&L&&LOOK.shirt[L.shirt]!=null){n.material.map=null;n.material.color.set(LOOK.shirt[L.shirt]);n.material.roughness=.85}});
  const B=nm=>model.getObjectByName(nm);
  const head=B('head'),chest=B('chest'),spine=B('spine');head.scale.setScalar(GLB_HEAD);
  root.updateMatrixWorld(true);
  // in prima persona la testa sparisce: l'osso nasconde i figli (elmo), la mesh della testa va nascosta a parte
  let hv=true;Object.defineProperty(head,'visible',{get(){return hv},set(v){hv=v;for(const m of headMeshes)m.visible=v}});
  const handR=glbSock(B('handslotr'),S.k,[-Math.PI/2,0,0]),handL=glbSock(B('handslotl'),S.k,[-Math.PI/2,0,0]),shieldL=glbSock(B('handslotl'),S.k,[0,0,0]);
  shieldL.position.set(0,.02,.16);
  const sock={chest:glbSock(chest,S.k),head:glbSock(head,S.k),shL:glbSock(B('upperarml'),S.k),shR:glbSock(B('upperarmr'),S.k),knL:glbSock(B('lowerlegl'),S.k),knR:glbSock(B('lowerlegr'),S.k)};
  // punto degli occhi per la prima persona (la testa del modello è grande, l'osso è al collo)
  const eye=new THREE.Object3D();eye.position.set(0,.42,.12);sock.head.add(eye);
  const mixer=new THREE.AnimationMixer(model),acts={};
  const act=n=>{if(acts[n])return acts[n];const c=GLB.clips[n];if(!c)return null;const a=mixer.clipAction(c);a.enabled=true;a.setEffectiveWeight(0);a.play();acts[n]=a;a.userData={w:0};return a};
  const H={gltf:true,cls:o.cls,root,inner,model,hips:B('hips'),torso:chest,spine,head,
    armL:{hand:handL,shield:shieldL},armR:{hand:handR},eye,fpHide,mats,bw:1,ph:Math.random()*6,mixer,act,acts,sock,k:S.k,t:Math.random()*5,lastAtk:-1,castOn:0};
  for(const n of['Idle','Walking_A','Running_A'])act(n);
  acts.Idle.time=Math.random()*acts.Idle.getClip().duration;
  return H}

// velocità "naturali" delle animazioni (m/s nella scala del gioco, misurate sui piedi): gambe corte,
// quindi oltre una certa velocità accettiamo un po' di scivolamento invece di animazioni frenetiche
const GLB_WALK=1.1,GLB_RUN=2.9;
const _qa=new THREE.Quaternion(),_qb=new THREE.Quaternion(),_ax=new THREE.Vector3();
function glbTwist(bone,ang){if(!bone||!ang)return;bone.parent.getWorldQuaternion(_qa);_ax.set(0,1,0).applyQuaternion(_qa.invert());_qb.setFromAxisAngle(_ax,ang);bone.quaternion.premultiply(_qb)}
// pose: {speed, atk:0..1|-1, atkKind, block, draw, cast, air, dance, dead, sit, fp, twist}
function animGltf(H,p,dt){
  const W={},sp=p.speed||0;
  // locomozione: fermo, cammina, corre, pesi che sommano a 1
  const run=clamp((sp-1)/1,0,1),mov=clamp((sp-.25)/.5,0,1);
  W.Idle=1-mov;W.Walking_A=mov*(1-run);W.Running_A=mov*run;
  H.acts.Walking_A.timeScale=clamp(sp/GLB_WALK,.6,2);H.acts.Running_A.timeScale=clamp(sp/GLB_RUN,.7,2.2);
  // sovrapposizioni: la parte alta se si muove, tutto il corpo se è fermo
  const moving=sp>.6,U=n=>moving?n+'#up':n;let over=null,overF=0,drive=-1;
  if(p.dead){over='Death_A';overF=1}
  else if(p.sit){over='Sit_Floor_Idle';overF=1}
  else if(p.dance){over='Cheer';overF=1}
  else if(p.atk>=0){over=p.atkKind==='spin'?'2H_Melee_Attack_Spin':U(p.atkKind==='thrust'?'1H_Melee_Attack_Stab':'1H_Melee_Attack_Slice_Diagonal');overF=1;drive=p.atk}
  else if(p.air){over='Jump_Idle';overF=1}
  else if(p.draw>0){over=U('2H_Ranged_Aiming');overF=1}
  else if(p.cast>0){over=U('Spellcast_Shoot');overF=1;if(!H.castOn){H.castOn=1;const a=H.act(over);if(a)a.time=0}}
  else if(p.block>0){over=U('Blocking');overF=1}
  if(!(p.cast>0))H.castOn=0;
  if(over){const a=H.act(over);if(a){W[over]=1;
    if(drive>=0){a.paused=true;a.time=Math.min(.999,drive*.85)*a.getClip().duration;a.userData.w=1}
    else{a.paused=false;if(over==='Death_A'){a.setLoop(THREE.LoopOnce);a.clampWhenFinished=true}}}}
  // pesi smussati; la sovrapposizione domina con peso f/(1-f) (il mixer normalizza)
  for(const n in H.acts){const a=H.acts[n],t=W[n]||0;a.userData.w+=(t-a.userData.w)*Math.min(1,dt*(n===over?14:10));
    if(a.userData.w<.002&&!t){a.userData.w=0;if(n!=='Idle'&&n!=='Walking_A'&&n!=='Running_A'){a.setEffectiveWeight(0);if(n!==over&&a.loop===THREE.LoopOnce)a.reset();continue}}
    const isOver=!['Idle','Walking_A','Running_A'].includes(n),f=a.userData.w;a.setEffectiveWeight(isOver?(f>=.999?999:f/(1-f)):f)}
  H.mixer.update(dt);
  // in prima persona petto e spalle (con l'armatura) coprirebbero la visuale
  const fpv=!p.fp;if(H.fpv!==fpv){H.fpv=fpv;for(const k of['chest','shL','shR'])H.sock[k].visible=fpv;for(const m of H.fpHide)m.visible=fpv}
  // busto e testa verso il bersaglio
  const tw=p.twist&&!p.dead&&!p.dance?p.twist:0;H.tw=lerp(H.tw||0,tw,Math.min(1,dt*12));
  if(Math.abs(H.tw)>.001){glbTwist(H.spine,H.tw*.35);glbTwist(H.torso,H.tw*.3);glbTwist(H.head,H.tw*.35)}}

// armatura sul modello glTF: piastra sul petto, spallacci, ginocchiere, corona dal tier 4, gemma dal 6
function applyArmorGltf(Hh,t){const m=armorMat(t),s=Hh.sock,add=(par,o)=>{o.userData.armor=1;par.add(o);return o};
  add(s.chest,mesh(box(.42,.3,.07),m,0,.12,.22));add(s.chest,mesh(box(.4,.28,.06),m,0,.12,-.2));
  for(const sh of[s.shL,s.shR]){const p=add(sh,mesh(new THREE.SphereGeometry(.13,10,8,0,Math.PI*2,0,Math.PI/2),m,0,.06,0));p.scale.set(1.2,.8,1.15)}
  for(const kn of[s.knL,s.knR])add(kn,mesh(sph(.07,8,6),m,0,.02,.08));
  if(t>=4){const ci=add(s.head,mesh(new THREE.TorusGeometry(.25,.025,6,18),m,0,.62,0));ci.rotation.x=Math.PI/2;add(s.head,mesh(sph(.04,8,6),t>=6?new THREE.MeshBasicMaterial({color:0xffffff}):M.gold,0,.64,.25,false))}
  if(t>=6)add(s.chest,mesh(new THREE.OctahedronGeometry(.06),new THREE.MeshBasicMaterial({color:t===7?0xff80ff:0xbff4ff,toneMapped:false}),0,.14,.27,false))}
