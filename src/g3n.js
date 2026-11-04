// ================= v2: mappe naturali =================
// Niente muri: le caselle piene (tile 1) diventano bosco, rocce, case o mare a seconda del bioma.
// Oggetti da src/assets/natura.glb (KayKit Medieval Hexagon, CC0), disegnati come InstancedMesh (pochi draw call).
// Se il file non è pronto si usano gli oggetti procedurali (makeTree, makeRock, makeBuilding...).
const NAT={ready:false,lib:{},inst:{}};
function natLoad(){if(!window.THREE||!THREE.GLTFLoader)return;
  glbFetch(new THREE.GLTFLoader(),'natura').then(g=>{if(!g)return;for(const grp of g.scene.children.slice()){try{const e=natPrep(grp);if(e)NAT.lib[grp.name]=e}catch(err){console.warn('natura',grp.name,err)}}NAT.ready=true})}
// attributi quantizzati (Int16/Uint16 normalizzati) -> Float32, così si possono trasformare e unire
function natF(a){const n=a.count,s=a.itemSize,o=new Float32Array(n*s),il=!!a.isInterleavedBufferAttribute,arr=il?a.data.array:a.array,st=il?a.data.stride:s,off=il?a.offset:0;
  const k=!a.normalized?1:arr instanceof Int8Array?127:arr instanceof Uint8Array?255:arr instanceof Int16Array?32767:arr instanceof Uint16Array?65535:1;
  for(let i=0;i<n;i++)for(let c=0;c<s;c++){const v=arr[i*st+off+c];o[i*s+c]=k===1?v:Math.max(v/k,-1)}return new THREE.BufferAttribute(o,s)}
// un oggetto = una geometria per materiale, appoggiata a terra (y=0) e centrata
function natPrep(grp){grp.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(grp.matrixWorld).invert(),byM=new Map();
  grp.traverse(m=>{if(!m.isMesh)return;const g=m.geometry,mat=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld),nm=new THREE.Matrix3().getNormalMatrix(mat);
    const pos=natF(g.attributes.position).applyMatrix4(mat),nor=g.attributes.normal?natF(g.attributes.normal).applyNormalMatrix(nm):null,uv=g.attributes.uv?natF(g.attributes.uv):null;
    const idx=g.index?Array.from(g.index.array):[...Array(pos.count).keys()];const L=byM.get(m.material)||{p:[],n:[],u:[],i:[],c:0};
    for(let q=0;q<pos.count;q++){L.p.push(pos.getX(q),pos.getY(q),pos.getZ(q));if(nor)L.n.push(nor.getX(q),nor.getY(q),nor.getZ(q));else L.n.push(0,1,0);if(uv)L.u.push(uv.getX(q),uv.getY(q));else L.u.push(0,0)}
    for(const v of idx)L.i.push(v+L.c);L.c+=pos.count;byM.set(m.material,L)});
  if(!byM.size)return null;let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];
  for(const L of byM.values())for(let q=0;q<L.p.length;q+=3)for(let c=0;c<3;c++){mn[c]=Math.min(mn[c],L.p[q+c]);mx[c]=Math.max(mx[c],L.p[q+c])}
  const cx=(mn[0]+mx[0])/2,cz=(mn[2]+mx[2])/2,parts=[];
  for(const[mat,L]of byM){for(let q=0;q<L.p.length;q+=3){L.p[q]-=cx;L.p[q+1]-=mn[1];L.p[q+2]-=cz}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(L.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(L.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(L.u,2));g.setIndex(L.i);g.computeBoundingSphere();
    if(mat.map)mat.map.anisotropy=4;parts.push({g,mat})}
  return{parts,h:mx[1]-mn[1],w:Math.max(mx[0]-mn[0],mx[2]-mn[2])}}
const _nd=new THREE.Object3D();
function natPut(name,x,y,z,ry,s){(NAT.inst[name]=NAT.inst[name]||[]).push([x,y,z,ry,s])}
// istanze divise in blocchi di 16 caselle: three r128 decide se disegnare un InstancedMesh guardando solo la sfera
// della geometria, quindi ogni blocco ha una geometria (che condivide i dati) con la sfera giusta
const NAT_CH=16*TS;
function natFlush(){for(const name in NAT.inst){const e=NAT.lib[name];if(!e)continue;const ch={};
    for(const it of NAT.inst[name]){const key=Math.floor(it[0]/NAT_CH)+','+Math.floor(it[2]/NAT_CH);(ch[key]=ch[key]||[]).push(it)}
    for(const key in ch){const L=ch[key];let mx=-1e9,mn=1e9,Mx=-1e9,Mn=1e9,top=0;for(const[x,y,z,ry,s]of L){mn=Math.min(mn,x);mx=Math.max(mx,x);Mn=Math.min(Mn,z);Mx=Math.max(Mx,z);top=Math.max(top,e.h*s)}
      const c=new THREE.Vector3((mn+mx)/2,top/2,(Mn+Mx)/2),rad=Math.hypot(mx-mn,Mx-Mn,top)/2+e.w*3;
      for(const pt of e.parts){const g=new THREE.BufferGeometry();for(const a in pt.g.attributes)g.setAttribute(a,pt.g.attributes[a]);g.setIndex(pt.g.index);g.boundingSphere=new THREE.Sphere(c,rad);
        const im=new THREE.InstancedMesh(g,pt.mat,L.length);L.forEach(([x,y,z,ry,s],n)=>{_nd.position.set(x,y,z);_nd.rotation.set(0,ry,0);_nd.scale.setScalar(s);_nd.updateMatrix();im.setMatrixAt(n,_nd.matrix)});
        im.castShadow=name.indexOf('rock')<0&&e.h*L[0][4]>1.5;im.receiveShadow=true;world.add(im)}}}
  NAT.inst={}}

// cosa cresce ai bordi, per bioma. edge: prima fila (deve coprire la vista); fill: più in là; big: lontano; deco: piccoli oggetti nelle radure
// [nome, altezza minima, altezza massima] (metri); house: case che guardano il sentiero
const NATSET={
  giungla:{edge:[['tree_single_B',4.5,6.5],['tree_single_B',4,6],['trees_A_medium',4.5,6],['trees_B_small',4,5.5],['tree_single_A',4,5.5]],fill:[['tree_single_B',5,7],['tree_single_A',5,6.5],['trees_A_small',4.5,6]],big:[['mountain_A_grass_trees',9,14],['tree_single_A',7,9]],rock:[['rock_single_A',.7,1.4],['rock_single_C',.8,1.6],['rock_single_E',.9,1.8]],deco:[['rock_single_B',.3,.6],['waterplant_A',.4,.7]],proc:'jungle'},
  deserto:{edge:[['rock_single_E',2.2,3.6],['rock_single_C',2,3.2],['mountain_B',3,5],['rock_single_A',1.8,3]],fill:[['mountain_B',4,7],['rock_single_E',3,4.5]],big:[['mountain_B',8,13]],rock:[['rock_single_D',.8,1.6]],deco:[['rock_single_B',.3,.6]],proc:'cactus',procP:.25},
  isole:{edge:[['rock_single_E',1.4,2.4],['rock_single_C',1.2,2]],fill:[],big:[],rock:[['rock_single_A',.6,1.2]],deco:[['waterlily_A',.15,.25]],proc:'palm',procP:.45,sea:1},
  montagne:{edge:[['mountain_B',3.5,6],['rock_single_E',2.5,3.8],['tree_single_A',5,7],['trees_A_small',4.5,6]],fill:[['mountain_B',5,8],['tree_single_A',6,8]],big:[['mountain_B',10,16]],rock:[['rock_single_D',.8,1.5]],deco:[['rock_single_B',.3,.6]],proc:'pine',procP:.2},
  citta:{house:[['building_home_A_red',4.5,5.5],['building_home_B_red',5,6],['building_home_A_blue',4.5,5.5],['building_home_B_blue',5,6],['building_tavern_red',6,7],['building_church_red',7,8.5],['building_blacksmith_red',5,6],['building_market_red',4.5,5.5]],
    edge:[['tree_single_B',4,5.5],['trees_A_small',4,5],['building_well_red',2.5,3],['crate_A_big',1,1.3],['tent',2,2.6]],fill:[['tree_single_A',5,7],['tree_single_B',4,6]],big:[['tree_single_A',6,8]],rock:[['barrel',.9,1.1],['crate_B_small',.6,.8],['sack',.5,.7],['wheelbarrow',.8,1],['resource_lumber',.6,.9]],deco:[['sack',.4,.6]]},
  tempio:{edge:[['rock_single_E',2,3.4],['mountain_B',3,5],['rock_single_C',1.8,3]],fill:[['mountain_B',5,8]],big:[['mountain_B',9,14]],rock:[['rock_single_A',.7,1.3]],deco:[['rock_single_B',.3,.6]],proc:'palm',procP:.35},
  caverna:{edge:[['mountain_B',3,5],['rock_single_E',2.4,3.8],['rock_single_C',2,3.2]],fill:[['mountain_B',5,9]],big:[['mountain_B',10,16]],rock:[['rock_single_D',.8,1.6]],deco:[['rock_single_B',.3,.6]],proc:'mushroom',procP:.3}};

// distanza (in caselle, 8 vicini) di ogni casella piena dalla radura più vicina
function natDist(){const gw=LV.gw,gh=LV.gh,d=new Uint8Array(gw*gh).fill(255),q=[];
  for(let k=0;k<gw*gh;k++)if(LV.tile[k]!==1){d[k]=0;q.push(k)}
  for(let h=0;h<q.length;h++){const k=q[h],i=k%gw,j=(k/gw)|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const ii=i+di,jj=j+dj;if(ii<0||jj<0||ii>=gw||jj>=gh)continue;const kk=jj*gw+ii;if(d[kk]>d[k]+1){d[kk]=d[k]+1;q.push(kk)}}}
  return d}
const nrr=(i,j,s,a,b)=>a+hash(i,j,s)*(b-a),npick=(arr,i,j,s)=>arr[Math.min(arr.length-1,Math.floor(hash(i,j,s)*arr.length))];
// scala dall'altezza voluta, ma senza superare una larghezza massima (le chiome non devono invadere le radure)
function natScale(name,a,b,i,j,maxW){const e=NAT.lib[name];if(!e)return 1;const s=nrr(i,j,5,a,b)/Math.max(.05,e.h);return maxW?Math.min(s,maxW/Math.max(.05,e.w)):s}

// terreno unico: radure, sentieri, sponde in pendenza verso l'acqua; ben oltre la mappa per l'orizzonte
function natTerrain(BI,set,d){const gw=LV.gw,gh=LV.gh,MG=26,W=gw+2*MG,Hh=gh+2*MG,cx=gw*TS/2,cz=gh*TS/2,sea=!!set.sea;
  const th=(i,j)=>{if(i<0||j<0||i>=gw||j>=gh)return sea?-1:0;const k=j*gw+i,t=LV.tile[k];if(t===3)return-.75;if(t===1){if(sea&&d[k]>=2)return-1;if(d[k]>=3)return(hash(i,j,41)-.3)*.5}return 0};
  const tint=(i,j)=>{if(i<0||j<0||i>=gw||j>=gh)return sea?[.8,.75,.6]:[.82,.88,.8];const k=j*gw+i,t=LV.tile[k];if(t===3)return[.55,.6,.5];if(t===1)return d[k]<=1?[.78,.84,.74]:[.72,.8,.7];if(LV.trail&&LV.trail[k])return BI.ground==='grass'?[1.05,.92,.72]:[1.06,1.02,.96];return[1,1,1]};
  const pos=[],col=[],uv=[],idx=[];
  for(let vj=0;vj<=Hh;vj++)for(let vi=0;vi<=W;vi++){const i=vi-MG,j=vj-MG;let h=0,c=[0,0,0];
    for(const[a,b]of[[-1,-1],[0,-1],[-1,0],[0,0]]){h+=th(i+a,j+b);const t=tint(i+a,j+b);c[0]+=t[0];c[1]+=t[1];c[2]+=t[2]}
    h/=4;if(vi===0||vj===0||vi===W||vj===Hh)h=-1.2;const x=i*TS,z=j*TS;pos.push(x,h,z);col.push(c[0]/4,c[1]/4,c[2]/4);uv.push((x-cx+200)/400,(cz+200-z)/400)}
  for(let vj=0;vj<Hh;vj++)for(let vi=0;vi<W;vi++){const a=vj*(W+1)+vi,b=a+1,c=a+W+1,e=c+1;idx.push(a,c,b,b,c,e)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const base=groundMat(sea?'sand':BI.ground),m=base.clone();m.vertexColors=true;if(M.weatherMats.includes(base))M.weatherMats.push(m);
  const t=new THREE.Mesh(g,m);t.receiveShadow=true;world.add(t);return t}

function natProc(kind,x,y,z,ry,s){const o=kind==='mushroom'?makeMushroomProp(s*1.6):makeOuterProp(kind,s);o.position.set(x,y,z);o.rotation.y=ry;world.add(o)}
function buildNature(BI){const gw=LV.gw,gh=LV.gh,set=NATSET[LV.biome]||NATSET.giungla,d=natDist(),lib=NAT.ready,used=new Uint8Array(gw*gh);LV.natD=d;
  natTerrain(BI,set,d);
  const put=(list,i,j,s,jit,maxW)=>{const[nm,a,b]=npick(list,i,j,s),x=(i+.5+(hash(i,j,s+1)-.5)*jit)*TS,z=(j+.5+(hash(i,j,s+2)-.5)*jit)*TS,ry=hash(i,j,s+3)*6.28;
    if(lib&&NAT.lib[nm]){natPut(nm,x,0,z,ry,natScale(nm,a,b,i,j,maxW));return true}return false};
  let procN=0;const PROC_MAX=90;
  const proc=(i,j,s)=>{if(!set.proc||procN>=PROC_MAX)return false;procN++;natProc(set.proc,(i+.5+(hash(i,j,s)-.5)*.5)*TS,0,(j+.5+(hash(i,j,s+1)-.5)*.5)*TS,hash(i,j,s+2)*6.28,nrr(i,j,s+3,1,1.5));return true};
  // case: al secondo anello, girate verso la radura più vicina, senza sovrapporsi
  if(set.house&&lib){for(let j=2;j<gh-2;j++)for(let i=2;i<gw-2;i++){const k=j*gw+i;if(d[k]!==2||hash(i,j,61)>.55)continue;let free=true;for(let b=-1;b<=1&&free;b++)for(let a=-1;a<=1;a++){const kk=(j+b)*gw+i+a;if(used[kk]||LV.tile[kk]!==1){free=false;break}}if(!free)continue;
    let bx=0,bz=0;for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){const ii=i+a,jj=j+b;if(ii<0||jj<0||ii>=gw||jj>=gh)continue;if(LV.tile[jj*gw+ii]!==1){bx+=a;bz+=b}}if(!bx&&!bz)continue;
    const[nm,a_,b_]=npick(set.house,i,j,62),e=NAT.lib[nm];if(!e)continue;const s=4.3/Math.max(.1,e.w);natPut(nm,(i+.5)*TS,0,(j+.5)*TS,Math.round(Math.atan2(bx,bz)/(Math.PI/2))*Math.PI/2,s);
    for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++)used[(j+b)*gw+i+a]=1}}
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const k=j*gw+i;if(LV.tile[k]!==1||used[k])continue;const dk=d[k];
    if(dk===1){ // prima fila: deve sempre nascondere il bordo
      if(set.sea){if(hash(i,j,71)<(set.procP||.4))proc(i,j,72);else put(set.edge,i,j,73,.5,1.8*TS);continue}
      if(set.proc&&hash(i,j,74)<(set.procP||0)&&proc(i,j,75))continue;
      if(!put(set.edge,i,j,76,.3,2.3*TS)){if(!proc(i,j,77)&&procN<PROC_MAX){natProc(BI.tree==='house'?'jungle':BI.tree,(i+.5)*TS,0,(j+.5)*TS,hash(i,j,78)*6,1.3);procN++}}
      if(hash(i,j,79)<.35)put(set.rock,i,j,80,.9,1.2*TS)}
    else if(dk<=3&&!set.sea){if(hash(i,j,81)<(dk===2?.5:.3)&&set.fill.length)put(set.fill,i,j,82,.7,(dk+.6)*TS)}
    else if(dk<=8&&!set.sea&&(i+j*3)%4===0&&hash(i,j,83)<.45&&set.big.length)put(set.big,i,j,84,.8,dk*1.6*TS)}
  // piccoli oggetti nelle radure (non bloccano)
  for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const k=j*gw+i;if(LV.tile[k]!==0||LV.ramp[k]||LV.h[k]>.1||hash(i,j,91)>.06||!set.deco.length)continue;put(set.deco,i,j,92,.8)}
  // lanterne lungo i sentieri (luce di notte)
  if(LV.trail)for(let j=1;j<gh-1;j++)for(let i=1;i<gw-1;i++){const k=j*gw+i;if(!LV.trail[k]||hash(i,j,95)>.05)continue;let si=0,sj=0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])if(LV.tile[(j+b)*gw+i+a]===1){si=a;sj=b;break}if(!si&&!sj)continue;
    const x=(i+.5+si*.45)*TS,z=(j+.5+sj*.45)*TS,post=mesh(cyl(.06,.08,1.9,6),M.wood,x,.95,z);world.add(post);const t=makeTorch();t.position.set(x,1.9,z);t.rotation.y=Math.atan2(-si,-sj);world.add(t);TORCHES.push(t)}
  natFlush()}
