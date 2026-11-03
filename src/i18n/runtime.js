
// ================= Languages: Italiano / English / Dansk =================
// The game is written in Italian; this layer translates every text that reaches the screen (page text and canvas text).
const LANGS={it:'Italiano',en:'English',da:'Dansk'};
let LANG=(()=>{try{const s=localStorage.getItem('pp_lang');if(s&&LANGS[s])return s}catch(e){}const n=String(navigator.language||'it').slice(0,2).toLowerCase();return n==='da'||n==='nb'||n==='no'?'da':n==='it'?'it':'en'})();
const I18N=(()=>{const D=new Map(),U=new Map();for(const[it,en,da]of I18N_D){D.set(it,[en,da]);const up=it.toUpperCase();if(!D.has(up))U.set(up,[en.toUpperCase(),da.toUpperCase()])}
  const esc=s=>s.replace(/[.*+?^$()|[\]\\]/g,'\\$&');
  const P=I18N_T.map(([it,en,da])=>{const parts=it.split('{}');return{re:new RegExp('^'+parts.map(esc).join('(.*?)')+'$','s'),n:parts.length-1,en,da,len:it.replace(/\{\}/g,'').length}}).sort((a,b)=>b.len-a.len);
  const WB=['Martello del Tuono','Pugnale Rapido','Pesce Spada','Guantone a Molla','Bastone del Caos','Bacchetta Bolle','Bacchetta Coccodè','Bacchetta','Spada','Arco'],WE=['di Fuoco','di Ghiaccio','del Fulmine','del Veleno'];
  const WRE=new RegExp('^('+WB.map(esc).join('|')+')(?: ('+WE.map(esc).join('|')+'))?(?: «(.+)»)?$');
  return{D,U,P,WRE}})();
const TC=new Map();
function T(s){if(LANG==='it'||typeof s!=='string'||!/[A-Za-zÀ-ÿ]{2}/.test(s))return s;const k=LANG+'|'+s;let r=TC.get(k);if(r!==undefined)return r;r=tr(s);if(TC.size>6000)TC.clear();TC.set(k,r);return r}
function trCore(core,li){let v=I18N.D.get(core);if(v)return v[li];v=I18N.U.get(core);if(v)return v[li];
  for(const p of I18N.P){const mm=core.match(p.re);if(!mm)continue;const g=mm.slice(1).map(x=>T(x));let tpl=li?p.da:p.en,i=0;return tpl.replace(/\{(\d*)\}/g,(_,n)=>{const v_=n===''?g[i++]:g[+n];return v_==null?'':v_})}
  return null}
function tr(s){const li=LANG==='en'?0:1;let r=trCore(s,li);if(r!=null)return r;
  const m=s.match(/^([\s·:\-–(]*)([\s\S]*?)([\s·:).!]*)$/);const pre=m[1],core=m[2],suf=m[3];if(!core)return s;
  if(core!==s){r=trCore(core,li);if(r!=null)return pre+r+suf;r=trCore(core+suf.trim(),li);if(r!=null)return pre+r+(suf.match(/\s*$/)[0])}
  const w=core.match(I18N.WRE);if(w)return pre+T(w[1])+(w[2]?' '+T(w[2]):'')+(w[3]?' «'+T(w[3])+'»':'')+suf;
  if(core.includes(' · ')){const segs=core.split(' · ');const out=segs.map(x=>T(x));if(out.some((x,i)=>x!==segs[i]))return pre+out.join(' · ')+suf}
  const par=s.match(/^([\s\S]*?)(\s*\([\d/+\-%. ]+\))$/);if(par){const h=T(par[1]);if(h!==par[1])return h+par[2]}
  const num=core.match(/^([\s\S]*?[A-Za-zÀ-ÿ!?.])(\s+[\d/+\-%.,×]+)$/);if(num){const h=T(num[1]);if(h!==num[1])return pre+h+num[2]+suf}
  const num2=core.match(/^([+\-]?[\d.,%×/]+\s+)([\s\S]+)$/);if(num2){const h=T(num2[2]+suf.trim());if(h!==num2[2]+suf.trim())return pre+num2[1]+h}
  return s}
// page text
const I18N_ORIG=new WeakMap(),I18N_SET=new WeakMap();
function trNode(n){const v=n.nodeValue;if(I18N_SET.get(n)===v)return;I18N_ORIG.set(n,v);const t=T(v);I18N_SET.set(n,t);if(t!==v)n.nodeValue=t}
function trTree(root){if(!root)return;if(root.nodeType===3){const p=root.parentNode;if(p&&p.nodeName!=='SCRIPT'&&p.nodeName!=='STYLE')trNode(root);return}
  if(root.nodeType!==1||root.nodeName==='SCRIPT'||root.nodeName==='STYLE')return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode;return p&&(p.nodeName==='SCRIPT'||p.nodeName==='STYLE')?2:1}});let n;while(n=w.nextNode())trNode(n)}
function retranslateAll(){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;const list=[];while(n=w.nextNode())list.push(n);
  for(const t of list){const o=I18N_ORIG.get(t);if(o!=null&&I18N_SET.get(t)===t.nodeValue){t.nodeValue=o}I18N_SET.delete(t)}trTree(document.body);document.title=T('Portali Perduti')==='Portali Perduti'?(LANG==='en'?'Lost Portals':LANG==='da'?'De Tabte Portaler':'Portali Perduti'):T('Portali Perduti')}
try{new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')trTree(m.target);else for(const a of m.addedNodes)trTree(a)}}).observe(document.body,{subtree:true,childList:true,characterData:true})}catch(e){}
// canvas text
(()=>{const C=CanvasRenderingContext2D.prototype,f=C.fillText,s=C.strokeText,mt=C.measureText;C.fillText=function(t,...a){return f.call(this,typeof t==='string'?T(t):t,...a)};C.strokeText=function(t,...a){return s.call(this,typeof t==='string'?T(t):t,...a)};C.measureText=function(t){return mt.call(this,typeof t==='string'?T(t):t)}})();
function setLang(l){if(!LANGS[l])return;LANG=l;try{localStorage.setItem('pp_lang',l)}catch(e){}TC.clear();retranslateAll();document.querySelectorAll('.langPills').forEach(drawLangPills);document.documentElement.lang=l}
function drawLangPills(el){el.innerHTML='';for(const k in LANGS){const b=document.createElement('button');b.type='button';b.textContent=LANGS[k];b.className=LANG===k?'on':'';b.onclick=()=>setLang(k);el.appendChild(b)}}
document.querySelectorAll('.langPills').forEach(drawLangPills);document.documentElement.lang=LANG;retranslateAll();
