
// ================= Level =================
let LV=null;const world=new THREE.Group();scene.add(world);
let GATES=[],INTER=[],TORCHES=[],WATERS=[],FALLS=[],PLATES=[],ANIM=[];
const RS=8;
function tIdx(i,j){return j*LV.gw+i}
function tileAt(x,z){const i=Math.floor(x/TS),j=Math.floor(z/TS);if(!LV||i<0||j<0||i>=LV.gw||j>=LV.gh)return-1;return tIdx(i,j)}
function groundH(x,z){if(!LV)return 0;const k=tileAt(x,z);if(k<0)return 99;const t=LV.tile[k];if(t===1)return 99;if(t===2)return-12;const g=LV.gate[k];if(g>=0&&!GATES[g].open)return 99;
  let h=LV.h[k];const r=LV.ramp[k];if(r){const fx=x/TS-Math.floor(x/TS),fz=z/TS-Math.floor(z/TS),f=r===1?fx:r===2?1-fx:r===3?fz:1-fz;h+=f*LV.rh[k]}return h}
function walkable(k){return k>=0&&LV.tile[k]!==1&&LV.tile[k]!==2&&!(LV.gate[k]>=0&&!GATES[LV.gate[k]].open)}
function clearWorld(){while(world.children.length)world.children.pop();INTER=[];TORCHES=[];WATERS=[];FALLS=[];PLATES=[];ANIM=[]}
function newLV(gw,gh){GATES=[];LV={gw,gh,tile:new Uint8Array(gw*gh).fill(1),h:new Float32Array(gw*gh),ramp:new Int8Array(gw*gh),rh:new Float32Array(gw*gh),gate:new Int16Array(gw*gh).fill(-1),flow:new Int8Array(gw*gh*2),seen:new Uint8Array(gw*gh),rooms:[],plate:new Int8Array(gw*gh),
  room:new Int16Array(gw*gh).fill(-1),fmat:new Uint8Array(gw*gh),style:0}}
const W2=(i,j)=>new THREE.Vector3((i+.5)*TS,0,(j+.5)*TS);
const THEMES={rovine:'Rovine nella giungla',funghi:'Caverna dei funghi',villaggio:'Villaggio abbandonato',giardino:'Giardino sacro',tempio:'Sala del tempio',ponte:'Ponte sul burrone',lago:'Lago nascosto'};
function strHash(s){let h=7;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)}
function genDungeon(n,node){node=node||{biome:'giungla',type:'battaglia',id:'x'};const B=BIOMES[node.biome]||BIOMES.giungla;
  srng=mulberry32(seedBase*7919+n*1013+strHash(node.id||''));
  const len=n<=1?4:n<=3?5:Math.min(7,5+Math.floor(n/4)),cols=Math.min(7,len),rows=3;newLV(cols*RS+1,rows*RS+1);LV.style=B.style;LV.biome=node.biome;LV.node=node;
  const G=[];for(let cj=0;cj<rows;cj++)for(let ci=0;ci<cols;ci++)G.push({ci,cj,id:-1,nb:[],type:'normal',x0:ci*RS+1,z0:cj*RS+1,doors:{}});const at=(ci,cj)=>G.find(o=>o.ci===ci&&o.cj===cj);
  // the main path: walks forward with a few turns, so every floor reads as a clear route
  let cur=at(0,1);const path=[cur];cur.used=1;let vert=0;
  while(path.length<len){const opts=[];const fw=at(cur.ci+1,cur.cj);if(fw&&!fw.used)opts.push([fw,3]);if(vert<0)for(const dj of[-1,1]){const o=at(cur.ci,cur.cj+dj);if(o&&!o.used)opts.push([o,1.7])}
    if(!opts.length)break;let s=opts.reduce((a,o)=>a+o[1],0)*sr(),nx=opts[0][0];for(const o of opts){s-=o[1];if(s<=0){nx=o[0];break}}vert=nx.ci===cur.ci?vert+1:0;nx.used=1;path.push(nx);cur=nx}
  const sides=[],nSide=n<=1?1:n<=4?2:3;for(const pr of sshuffle(path.slice(1,-1))){if(sides.length>=nSide)break;const nb=sshuffle([[1,0],[-1,0],[0,1],[0,-1]].map(([a,b])=>at(pr.ci+a,pr.cj+b)).filter(o=>o&&!o.used));if(!nb.length)continue;nb[0].used=1;nb[0].parent=pr;sides.push(nb[0])}
  const R=[...path,...sides];R.forEach((r,i)=>r.id=i);LV.rooms=R;LV.path=path;
  // v2: un solo bioma per piano, mappa naturale (radure dal contorno irregolare unite da sentieri, niente muri né cancelli)
  LV.nat=true;for(const r of R)r.biome=node.biome;
  for(const r of R)natClearing(r);
  const link=(a,b)=>{if(b.ci<a.ci||b.cj<a.cj){const t_=a;a=b;b=t_}if(a.nb.includes(b.id))return;a.nb.push(b.id);b.nb.push(a.id);
    if(b.ci>a.ci){a.doors.e=1;b.doors.w=1}else{a.doors.s=1;b.doors.n=1}natTrail(a,b)};
  for(let i=0;i<path.length-1;i++)link(path[i],path[i+1]);for(const sd of sides)link(sd.parent,sd);
  LV.doors=[];
  const far=path[path.length-1];path[0].type='start';far.type='portal';
  let vault=null;const sq=sshuffle(sides.slice());if(sq.length&&n>1){vault=sq.shift();vault.type='vault'}
  const sideT=['cage','treasure','merchant'];if(node.type==='tesoro')sideT.unshift('treasure');for(const sd of sq){sd.type=sideT.shift()||'treasure'}
  if(!R.some(r=>r.type==='cage')){const m=path.slice(1,-1).find(r=>r.type==='normal');if(m&&n<=2)m.type='cage'}
  const mids=sshuffle(path.slice(1,-1).filter(r=>r.type==='normal'));if(node.type==='mercante'&&!R.some(r=>r.type==='merchant')&&mids.length)mids.shift().type='merchant';
  // niente burroni né buche: in una mappa naturale sembrerebbero buchi nel prato
  const noHole=t=>t!=='pits'&&t!=='ponte',pool=[...B.want,'traps','pillars','river','lago','stairs','tree','river'].filter(noHole);
  for(const r of mids){if(sr()<.25)continue;const RB=BIOMES[r.biome]||B,want=RB.want.filter(noHole);let ty=spick(sr()<.65&&want.length?want:pool);if(ty==='stairs'){const side=['n','s','e','w'].find(s=>!r.doors[s]);if(!side)ty='pillars';else r.side=side}r.type=ty}
  LV.boss=node.type==='boss'||node.type==='final';LV.bossType=node.type==='final'?'rePortali':n%8===4?'scimmione':'idra';
  const TH={start:spick(B.themes),portal:'tempio',merchant:'villaggio',cage:'tempio',treasure:'tempio',vault:'tempio',stairs:'tempio',traps:'tempio',pillars:'tempio',river:'rovine',tree:'rovine',pits:'funghi',ponte:'ponte',lago:'lago'};
  for(const r of R){r.theme=(r.type==='normal'?null:TH[r.type])||spick((BIOMES[r.biome]||B).themes);const fm=r.theme==='funghi'?2:['rovine','villaggio','giardino','lago'].includes(r.theme)?1:0;
    for(let j=r.z0;j<r.z0+7;j++)for(let i=r.x0;i<r.x0+7;i++)LV.fmat[tIdx(i,j)]=fm;
    if(!LV.nat&&['rovine','funghi','giardino','villaggio'].includes(r.theme)&&r.type==='normal'&&sr()<.45){r.round=1;for(const[a,b]of[[0,0],[1,0],[0,1],[6,0],[5,0],[6,1],[0,6],[1,6],[0,5],[6,6],[5,6],[6,5]])LV.tile[tIdx(r.x0+a,r.z0+b)]=1}}
  for(const r of R){const cx=r.x0+3,cz=r.z0+3;
    if(r.type==='stairs'){const s=r.side;for(let a=0;a<7;a++)for(let b=0;b<3;b++){const[i,j]=s==='n'?[r.x0+a,r.z0+b]:s==='s'?[r.x0+a,r.z0+6-b]:s==='w'?[r.x0+b,r.z0+a]:[r.x0+6-b,r.z0+a];const k=tIdx(i,j);LV.h[k]=1.5;
        if(b===2&&a>=2&&a<=4){LV.h[k]=0;LV.rh[k]=1.5;LV.ramp[k]=s==='n'?4:s==='s'?3:s==='w'?2:1}}
      const[i,j]=s==='n'?[cx,r.z0]:s==='s'?[cx,r.z0+6]:s==='w'?[r.x0,cz]:[r.x0+6,cz];r.chestAt=W2(i,j)}
    if(r.type==='river'){const hor=sr()<.5,rows_=sr()<.5?[0,1]:[5,6],dir=sr()<.5?1:-1;for(let a=0;a<7;a++)for(const b of rows_){const[i,j]=hor?[r.x0+a,r.z0+b]:[r.x0+b,r.z0+a];const k=tIdx(i,j);LV.tile[k]=3;LV.h[k]=-.9;LV.flow[k*2]=hor?dir:0;LV.flow[k*2+1]=hor?0:dir}r.river={hor,rows:rows_,dir}}
    if(r.type==='lago'){for(let j=r.z0;j<r.z0+7;j++)for(let i=r.x0;i<r.x0+7;i++){const k=tIdx(i,j),di=Math.abs(i-cx),dj=Math.abs(j-cz);if(di<=1&&dj<=1){LV.h[k]=.25;continue}if((di===3||dj===3)&&(di<=1||dj<=1))continue;LV.tile[k]=3;LV.h[k]=-.9}r.lake=1}
    if(r.type==='ponte'){for(let j=r.z0;j<r.z0+7;j++)for(let i=r.x0;i<r.x0+7;i++){const k=tIdx(i,j),di=i-cx,dj=j-cz;const plat=Math.abs(di)<=1&&Math.abs(dj)<=1;
        const path=(di===0&&((dj<0&&r.doors.n)||(dj>0&&r.doors.s)))||(dj===0&&((di<0&&r.doors.w)||(di>0&&r.doors.e)));if(plat||path)LV.fmat[k]=3;else LV.tile[k]=2}}
    if(r.type==='pits'){let made=0;for(let t=0;t<20&&made<3;t++){const a=sri(1,5),b=sri(1,5);if(a===3||b===3)continue;const k=tIdx(r.x0+a,r.z0+b),k2=tIdx(r.x0+a+(sr()<.5?1:0),r.z0+b+1);if(LV.tile[k]||LV.tile[k2])continue;LV.tile[k]=2;LV.tile[k2]=2;made++}}
    if(r.type==='pillars')for(const[a,b]of[[1,1],[5,1],[1,5],[5,5]])LV.tile[tIdx(r.x0+a,r.z0+b)]=1;
    if(r.type==='traps')for(let t=0;t<3;t++){const a=sri(1,5),b=sri(1,5);LV.plate[tIdx(r.x0+a,r.z0+b)]=1}}
  if(vault&&!LV.nat){const p=R[vault.nb[0]],dx=p.ci-vault.ci,dz=p.cj-vault.cj,tiles=[];if(dx){const x=Math.max(p.ci,vault.ci)*RS;for(let j=vault.z0+2;j<=vault.z0+4;j++)tiles.push(tIdx(x,j))}else{const z=Math.max(p.cj,vault.cj)*RS;for(let i=vault.x0+2;i<=vault.x0+4;i++)tiles.push(tIdx(i,z))}
    const gid=GATES.length;tiles.forEach(k=>LV.gate[k]=gid);GATES.push({open:false,tiles,dx,dz,lift:0});vault.gate=gid;p.leverFor=gid}
  LV.R=R;LV.far=far;return R}
// radura: contorno irregolare dentro la cella 7x7 della stanza (il centro è sempre libero)
function natClearing(r){const cx=r.x0+3,cz=r.z0+3,ph=[sr()*6.28,sr()*6.28,sr()*6.28],big=r.type==='start'||r.type==='portal'?.35:0;
  for(let j=r.z0;j<r.z0+7;j++)for(let i=r.x0;i<r.x0+7;i++){const dx=i-cx,dz=j-cz,a=Math.atan2(dz,dx),d=Math.hypot(dx,dz);
    const rad=2.95+big+.42*Math.sin(a*2+ph[0])+.28*Math.sin(a*3+ph[1])+.18*Math.sin(a*5+ph[2]);
    if(d<=Math.max(1.6,rad)){const k=tIdx(i,j);LV.tile[k]=0;LV.room[k]=r.id}}}
// sentiero tra due radure vicine: largo 2-3 caselle, leggermente ondulato
function natTrail(a,b){const ax=a.x0+3,az=a.z0+3,bx=b.x0+3,bz=b.z0+3,len=Math.hypot(bx-ax,bz-az),nx=-(bz-az)/len,nz=(bx-ax)/len,amp=(sr()-.5)*2.2,w=sr()<.5?1.15:1.45;
  for(let s=0;s<=len*3;s++){const t=s/(len*3),off=Math.sin(t*Math.PI)*amp,px=ax+(bx-ax)*t+nx*off,pz=az+(bz-az)*t+nz*off;
    for(let j=Math.floor(pz-w);j<=Math.ceil(pz+w);j++)for(let i=Math.floor(px-w);i<=Math.ceil(px+w);i++){if(i<1||j<1||i>=LV.gw-1||j>=LV.gh-1)continue;if(Math.hypot(i-px,j-pz)>w)continue;const k=tIdx(i,j);
      if(LV.tile[k]===1){LV.tile[k]=0;const ins=i>=a.x0&&i<a.x0+7&&j>=a.z0&&j<a.z0+7?a:i>=b.x0&&i<b.x0+7&&j>=b.z0&&j<b.z0+7?b:null;if(ins)LV.room[k]=ins.id;LV.trail=LV.trail||new Uint8Array(LV.gw*LV.gh);LV.trail[k]=1}}}}
function genCampLevel(){newLV(22,22);for(let j=1;j<21;j++)for(let i=1;i<21;i++){const d=Math.hypot(i-10.5,j-10.5);if(d<9.6)LV.tile[tIdx(i,j)]=0}LV.camp=true;LV.R=[];return LV}
function roomThemeAt(k){const r=LV.room[k];return r>=0?LV.R[r].theme:null}

// ---------- build meshes ----------
function wallGeo(){const g=box(TS,WALLH,TS),uv=g.attributes.uv;for(let f=0;f<6;f++){if(f===2||f===3)continue;for(let v=0;v<4;v++){const i=f*4+v;uv.setY(i,uv.getY(i)*WALLH/TS*.5)}}g.translate(0,WALLH/2,0);return g}
const WG=wallGeo(),FG=box(TS,1,TS);
function buildLevel(){clearWorld();const dummy=new THREE.Object3D(),gw=LV.gw,gh=LV.gh,BI=LV.camp?BIOMES.giungla:(BIOMES[LV.biome]||BIOMES.giungla),SM=styleMat(LV.style);
  const ground=mesh(new THREE.PlaneGeometry(400,400),groundMat(BI.ground),gw*TS/2,BI.ground==='sea'?-.35:LV.nat?-1.15:-.02,gh*TS/2,false);ground.rotation.x=-Math.PI/2;world.add(ground);
  const walls=[],fl={},RBI=k=>{const r=LV.room[k];return r>=0&&LV.R[r]&&LV.R[r].biome?LV.R[r].biome:LV.biome},bOf=k=>{let r=LV.room[k];if(r<0){const i=k%gw,j=(k/gw)|0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const kk=tIdx(i+a,j+b);if(kk>=0&&LV.room[kk]>=0){r=LV.room[kk];break}}}return r>=0&&LV.R[r]&&LV.R[r].biome?LV.R[r].biome:LV.biome};LV.bOf=bOf;
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const k=tIdx(i,j),t=LV.tile[k];
    if(t===1){if(LV.camp||LV.nat)continue;let near=false,ruin=false,wb=null;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii>=0&&jj>=0&&ii<gw&&jj<gh){const kk=tIdx(ii,jj);if(LV.tile[kk]!==1){near=true;if(!wb&&LV.room[kk]>=0)wb=RBI(kk);if(roomThemeAt(kk)==='rovine'||roomThemeAt(kk)==='giardino'||RBI(kk)==='isole')ruin=true}}}if(near)walls.push([i,j,ruin,(BIOMES[wb||LV.biome]||BI).style])}
    else if(t!==2&&!(LV.nat&&LV.h[k]<.1)){const bb=BIOMES[bOf(k)]||BI,key=bb.style+'|'+LV.fmat[k]+'|'+bb.ground;(fl[key]=fl[key]||[]).push(k)}}
  for(const sty of[...new Set(walls.map(w=>w[3]))]){const ws=walls.filter(w=>w[3]===sty);const im=new THREE.InstancedMesh(WG,styleMat(sty).w,ws.length);ws.forEach(([i,j,ruin],n)=>{dummy.position.set((i+.5)*TS,0,(j+.5)*TS);dummy.rotation.set(0,0,0);dummy.scale.set(1,ruin?.38+hash(i,j,3)*.35:1+hash(i,j,3)*.12,1);dummy.updateMatrix();im.setMatrixAt(n,dummy.matrix)});im.castShadow=im.receiveShadow=true;world.add(im)}
  if(!LV.camp){for(const key in fl){const list=fl[key],[sty,mis,gk]=key.split('|'),mi=+mis,sm=styleMat(+sty),mat=[sm.f,gk==='sand'||gk==='snow'||gk==='cobble'?sm.f:M.grassT,M.caveF,M.plank][mi];const im=new THREE.InstancedMesh(FG,mat,list.length);list.forEach((k,n)=>{const i=k%gw,j=(k/gw)|0,top=LV.h[k],bot=mi===3?top-.25:-12;dummy.position.set((i+.5)*TS,(top+bot)/2,(j+.5)*TS);dummy.rotation.set(0,0,0);dummy.scale.set(mi===3?.96:1,top-bot,mi===3?.96:1);dummy.updateMatrix();im.setMatrixAt(n,dummy.matrix)});im.receiveShadow=true;im.castShadow=true;world.add(im)}
    const pit=mesh(new THREE.PlaneGeometry(gw*TS,gh*TS),M.pit,gw*TS/2,-11.5,gh*TS/2,false);pit.rotation.x=-Math.PI/2;world.add(pit);
    for(const k of Object.keys(fl).filter(q=>q.split('|')[1]==='3').flatMap(q=>fl[q])){const i=k%gw,j=(k/gw)|0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const nk=tIdx(i+di,j+dj);if(LV.tile[nk]!==2)continue;const px=(i+.5+di*.45)*TS,pz=(j+.5+dj*.45)*TS;
      const post=mesh(cyl(.05,.05,1,6),M.wood,px,.5,pz);world.add(post);const rope=mesh(box(dj?TS:.04,.04,di?TS:.04),M.rope,px,.9,pz);world.add(rope)}}}
  for(let k=0;k<gw*gh;k++){if(!LV.ramp[k])continue;const i=k%gw,j=(k/gw)|0,r=LV.ramp[k],h0=LV.h[k],rh=LV.rh[k];for(let s=0;s<4;s++){const top=h0+rh*(s+1)/4;const st=mesh(box(r<=2?TS/4:TS,top-h0+.01,r<=2?TS:TS/4),styleMat((BIOMES[bOf(k)]||BI).style).f);
    const off=(s+.5)/4*TS-TS/2,sgn=(r===1||r===3)?1:-1;st.position.set((i+.5)*TS+(r<=2?off*sgn:0),h0+(top-h0)/2,(j+.5)*TS+(r>2?off*sgn:0));world.add(st)}}
  for(const r of LV.R||[]){if(r.lake){const wt=mesh(new THREE.PlaneGeometry(7*TS,7*TS),M.water,(r.x0+3.5)*TS,-.32,(r.z0+3.5)*TS,false);wt.rotation.x=-Math.PI/2;world.add(wt);continue}
    if(!r.river)continue;const{hor,rows,dir}=r.river;const x0=r.x0*TS,z0=r.z0*TS;let w,d,cx,cz;if(hor){w=7*TS;d=2*TS;cx=x0+3.5*TS;cz=z0+(rows[0]+1)*TS}else{w=2*TS;d=7*TS;cx=x0+(rows[0]+1)*TS;cz=z0+3.5*TS}
    const wt=mesh(new THREE.PlaneGeometry(w,d),M.water,cx,-.32,cz,false);wt.rotation.x=-Math.PI/2;world.add(wt);WATERS.push(wt);
    const fh=WALLH+.9;const fall=mesh(new THREE.PlaneGeometry(2*TS,fh),M.fall,0,0,0,false);const up=-dir;
    if(hor){fall.position.set(cx+up*(3.5*TS-.02),fh/2-.9,cz);fall.rotation.y=up>0?-Math.PI/2:Math.PI/2}else{fall.position.set(cx,fh/2-.9,cz+up*(3.5*TS-.02));fall.rotation.y=up>0?Math.PI:0}world.add(fall);
    FALLS.push({x:fall.position.x,z:fall.position.z})}
  if(!LV.camp&&!LV.nat)for(const r of LV.R){if(r.theme==='rovine'||r.theme==='giardino')continue;for(const[a,b,dx,dz]of[[r.x0+1,r.z0-1,0,1],[r.x0+5,r.z0+7,0,-1],[r.x0-1,r.z0+5,1,0],[r.x0+7,r.z0+1,-1,0]]){const k=tIdx(a,b);if(k<0||LV.tile[k]!==1||sr()<.3)continue;
    const t=makeTorch();t.position.set((a+.5+dx*.55)*TS,2.4,(b+.5+dz*.55)*TS);t.rotation.y=Math.atan2(dx,dz);world.add(t);TORCHES.push(t)}}
  if(!LV.camp){const fI=[];for(let j=1;j<gh-1;j++)for(let i=1;i<gw-1;i++){const k=tIdx(i,j);if(LV.tile[k]!==0||LV.ramp[k]||LV.fmat[k]===3)continue;let nearW=0;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]])if(LV.tile[tIdx(i+di,j+dj)]===1)nearW++;if((nearW||LV.fmat[k]===1)&&hash(i,j,77)<(LV.fmat[k]===1?.6:.45))fI.push([i,j,LV.h[k]])}
    const byT={};for(const f of fI){const t_=(BIOMES[bOf(tIdx(f[0],f[1]))]||BI).fern||'';(byT[t_]=byT[t_]||[]).push(f)}for(const t_ in byT){const FL=byT[t_];const fm=new THREE.InstancedMesh(fernGeo,fernMat(t_||null),FL.length*2);let n=0;for(const[i,j,h]of FL)for(let q=0;q<2;q++){dummy.position.set((i+rr(.1,.9))*TS,h,(j+rr(.1,.9))*TS);dummy.rotation.set(0,rr(0,6),0);const s=rr(.7,1.4);dummy.scale.set(s,s,s);dummy.updateMatrix();fm.setMatrixAt(n++,dummy.matrix)}fm.count=n;world.add(fm)}
    if(!LV.nat)for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){if(LV.tile[tIdx(i,j)]!==1||hash(i,j,88)>.12)continue;if(!['giungla','isole','tempio','caverna'].includes(bOf(tIdx(i,j))))continue;for(const[di,dj]of[[1,0],[-1,0],[0,1],[0,-1]]){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=gw||jj>=gh||LV.tile[tIdx(ii,jj)]===1)continue;
      const v=mesh(new THREE.PlaneGeometry(TS*.9,WALLH*.8),M.vine,(i+.5+di*.51)*TS,WALLH*.6,(j+.5+dj*.51)*TS,false);v.rotation.y=Math.atan2(di,dj);world.add(v);break}}}
  const cx=gw*TS/2,cz=gh*TS/2;
  if(LV.camp){for(let a=0;a<26;a++){const ang=a/26*Math.PI*2+rr(-.05,.05),d=rr(13.5,17);const t=makeTree(rr(1,1.6));t.position.set(cx+Math.cos(ang)*d,0,cz+Math.sin(ang)*d);t.rotation.y=rr(0,6);world.add(t)}}
  else if(LV.nat)buildNature(BI);
  else{const W=RS*TS,bAtX=x=>{const ci=clamp(Math.floor(x/W),0,(LV.path||[]).length-1);const r=(LV.path||[])[ci];return BIOMES[r&&r.biome||LV.biome]||BI};
    for(const r of LV.path||[]){const rb=BIOMES[r.biome]||BI;if(rb.ground===BI.ground)continue;const st=mesh(new THREE.PlaneGeometry(W,220),groundMat(rb.ground),(r.ci+.5)*W,rb.ground==='sea'?-.01:-.015,cz,false);st.rotation.x=-Math.PI/2;world.add(st)}
    for(let x=-12;x<gw*TS+12;x+=rr(3.5,6))for(const side of[-1,1]){const bb=bAtX(x),house=bb.tree==='house';const z=side<0?-rr(house?5:2.5,house?16:13):gh*TS+rr(house?5:2.5,house?16:13);const t=makeOuterProp(bb.tree,rr(1,1.6));t.position.set(x,bb.ground==='sea'?-.1:0,z);t.rotation.y=rr(0,6);world.add(t);
      if(bb.ground==='sea'){const isl=mesh(cyl(rr(1.6,2.4),rr(2.2,3),.5,12),groundMat('sand'),x,-.3,z,false);world.add(isl)}}
    for(const side of[-1,1])for(let q=0;q<5;q++){const bb=bAtX(side<0?0:gw*TS),z=rr(-6,gh*TS+6),x=side<0?-rr(4,14):gw*TS+rr(4,14);const t=makeOuterProp(bb.tree,rr(1,1.6));t.position.set(x,0,z);world.add(t)}}
  if(!LV.camp&&LV.path)for(let i=0;i<LV.path.length-1;i++){const a=LV.path[i],b=LV.path[i+1],dx=Math.sign(b.ci-a.ci),dz=Math.sign(b.cj-a.cj),ti=a.x0+3+dx*3,tj=a.z0+3+dz*3,k=tIdx(ti,tj);if(LV.tile[k]===2)continue;const ar=makeArrow();ar.position.set((ti+.5)*TS,(LV.tile[k]===3?-.3:LV.h[k])+.04,(tj+.5)*TS);ar.rotation.y=Math.atan2(-dx,-dz);world.add(ar)}
  if(LV.camp){const fm=new THREE.InstancedMesh(fernGeo,M.fern,140);for(let n=0;n<140;n++){const ang=rr(0,6.28),d=rr(10,14);dummy.position.set(cx+Math.cos(ang)*d,0,cz+Math.sin(ang)*d);dummy.rotation.set(0,rr(0,6),0);const s=rr(.8,1.6);dummy.scale.set(s,s,s);dummy.updateMatrix();fm.setMatrixAt(n,dummy.matrix)}world.add(fm)}
  for(const g of GATES){const ks=g.tiles,i0=ks[0]%gw,j0=(ks[0]/gw)|0,i2=ks[2]%gw,j2=(ks[2]/gw)|0;const gm=makeGate(3*TS);gm.position.set(((i0+i2)/2+.5)*TS,g.open?g.lift:0,((j0+j2)/2+.5)*TS);if(g.dx)gm.rotation.y=Math.PI/2;world.add(gm);g.obj=gm}
  for(let k=0;k<gw*gh;k++)if(LV.plate[k]){const i=k%gw,j=(k/gw)|0;const p=mesh(box(TS*.7,.08,TS*.7),M.stone,(i+.5)*TS,LV.h[k]+.04,(j+.5)*TS);world.add(p);PLATES.push({k,obj:p,used:false})}
  const st=STYLES[LV.style];LV.fogTint=LV.camp?null:st.fog}
