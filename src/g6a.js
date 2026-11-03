
// ================= Audio: adaptive music + ambience =================
let AC=null,master,musBus,sfxBus,ambBus,verbIn,noiseBuf,muted=false,VOL=Object.assign({mus:60,sfx:80,amb:45},store.get('pp5_vol',{}));const LAY={};
function audioInit(){if(AC){AC.resume&&AC.resume();return}try{AC=new(window.AudioContext||window.webkitAudioContext)();const comp=AC.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;master=AC.createGain();master.gain.value=muted?0:1;master.connect(comp);comp.connect(AC.destination);
  const verb=AC.createConvolver();const len=AC.sampleRate*2.6,ib=AC.createBuffer(2,len,AC.sampleRate);for(let c=0;c<2;c++){const d=ib.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.4)}verb.buffer=ib;const vg=AC.createGain();vg.gain.value=.5;verb.connect(vg);vg.connect(master);verbIn=verb;
  musBus=AC.createGain();musBus.gain.value=.85*VOL.mus/100;musBus.connect(master);const ms=AC.createGain();ms.gain.value=.35;musBus.connect(ms);ms.connect(verb);
  sfxBus=AC.createGain();sfxBus.gain.value=VOL.sfx/100;sfxBus.connect(master);const ss=AC.createGain();ss.gain.value=.12;sfxBus.connect(ss);ss.connect(verb);ambBus=AC.createGain();ambBus.gain.value=VOL.amb/100;ambBus.connect(master);
  for(const k of['pad','arp','mel','bass','perc','tribal']){LAY[k]=AC.createGain();LAY[k].gain.value=0;LAY[k].connect(musBus)}
  noiseBuf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const nd=noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
  ambInit();music.next=AC.currentTime+.1;setInterval(musTick,25);setInterval(ambTick,120)}catch(e){AC=null}}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function env(g,t,a,d,v,sus=0){g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+a);if(sus){g.gain.setValueAtTime(v,t+a+sus)}g.gain.exponentialRampToValueAtTime(.0001,t+a+sus+d)}
function osc(type,f,t,dur,dest){const o=AC.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);o.connect(dest);o.start(t);o.stop(t+dur+.05);return o}
function nz(t,dur,v,dest,fc,type='highpass',q=1){const s=AC.createBufferSource();s.buffer=noiseBuf;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=fc;f.Q.value=q;const g=AC.createGain();env(g,t,.003,dur,v);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random());s.stop(t+dur+.05)}
const INST={
  marimba(t,m,d,v,dest){const g=AC.createGain();env(g,t,.004,Math.min(.9,d+.3),v);g.connect(dest);osc('sine',mtof(m),t,1,g);const g2=AC.createGain();env(g2,t,.002,.12,v*.35);g2.connect(dest);osc('sine',mtof(m)*4,t,.2,g2)},
  kalimba(t,m,d,v,dest){const g=AC.createGain();env(g,t,.003,1.2,v);g.connect(dest);osc('sine',mtof(m),t,1.3,g);const g2=AC.createGain();env(g2,t,.002,.3,v*.25);g2.connect(dest);osc('triangle',mtof(m)*2.01,t,.35,g2)},
  flute(t,m,d,v,dest){const g=AC.createGain();env(g,t,.07,.18,v,Math.max(.02,d-.1));g.connect(dest);const o=osc('sine',mtof(m),t,d+.35,g);const l=AC.createOscillator();l.frequency.value=5.2;const lg=AC.createGain();lg.gain.value=mtof(m)*.006;l.connect(lg);lg.connect(o.frequency);l.start(t+.15);l.stop(t+d+.35);
    const g3=AC.createGain();env(g3,t,.06,d+.1,v*.25);g3.connect(dest);osc('triangle',mtof(m),t,d+.3,g3);nz(t,.08,v*.25,dest,3500,'bandpass',2)},
  pad(t,m,d,v,dest){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900;const g=AC.createGain();env(g,t,1.2,1.4,v,Math.max(0,d-1.2));f.connect(g);g.connect(dest);for(const det of[-7,7]){const o=osc('sawtooth',mtof(m),t,d+2.8,f);o.detune.value=det}},
  bass(t,m,d,v,dest){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=700;const g=AC.createGain();env(g,t,.01,d*.9+.1,v);f.connect(g);g.connect(dest);osc('triangle',mtof(m),t,d+.2,f);osc('sine',mtof(m-12),t,d+.2,f)},
  strings(t,m,d,v,dest){const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=2200;const g=AC.createGain();env(g,t,.02,.18,v,d*.3);f.connect(g);g.connect(dest);for(const det of[-9,0,9]){const o=osc('sawtooth',mtof(m),t,d+.4,f);o.detune.value=det}},
};
const DR={kick(t,v,d){const g=AC.createGain();env(g,t,.002,.35,v);g.connect(d);const o=osc('sine',150,t,.4,g);o.frequency.exponentialRampToValueAtTime(42,t+.3)},
  tom(t,v,d,f=130){const g=AC.createGain();env(g,t,.002,.3,v);g.connect(d);const o=osc('sine',f,t,.35,g);o.frequency.exponentialRampToValueAtTime(f*.6,t+.25)},
  conga(t,v,d,f=320){const g=AC.createGain();env(g,t,.001,.16,v);g.connect(d);const o=osc('sine',f,t,.2,g);o.frequency.exponentialRampToValueAtTime(f*.75,t+.1)},
  shaker(t,v,d){nz(t,.06,v,d,6500)},snare(t,v,d){nz(t,.18,v,d,1800,'bandpass',.8);const g=AC.createGain();env(g,t,.001,.08,v*.5);g.connect(d);osc('triangle',190,t,.1,g)},crash(t,v,d){nz(t,1.4,v,d,5000)}};
const A2=45;const ch=(r,q='m')=>q==='m'?[r,r+3,r+7]:[r,r+4,r+7];
const SONGS={
  explore:{tempo:92,prog:[ch(57),ch(53,'M'),ch(48,'M'),ch(55,'M')],scale:[0,2,3,5,7,8,10],root:57,arp:'marimba',mel:'flute',gains:{pad:.5,arp:.55,mel:.5,bass:.6,perc:.35,tribal:0}},
  night:{tempo:70,prog:[ch(57),ch(52),ch(53,'M'),ch(52)],scale:[0,2,3,5,7,8,10],root:57,arp:'kalimba',mel:'flute',gains:{pad:.7,arp:.4,mel:.3,bass:.35,perc:0,tribal:0}},
  combat:{tempo:116,prog:[ch(57),ch(53,'M'),ch(55,'M'),ch(52)],scale:[0,2,3,5,7,8,10],root:57,arp:'marimba',mel:'flute',gains:{pad:.35,arp:.5,mel:.45,bass:.75,perc:.8,tribal:.7}},
  boss:{tempo:132,prog:[ch(57),ch(55,'M'),ch(53,'M'),ch(52,'M')],scale:[0,1,4,5,7,8,10],root:57,arp:'marimba',mel:'strings',gains:{pad:.4,arp:.45,mel:.6,bass:.85,perc:.9,tribal:.8}},
  camp:{tempo:84,prog:[ch(60,'M'),ch(57),ch(53,'M'),ch(55,'M')],scale:[0,2,4,5,7,9,11],root:60,arp:'kalimba',mel:'flute',gains:{pad:.5,arp:.6,mel:.5,bass:.45,perc:.25,tribal:0}},
};
function makeMelody(sg){const rh=[[1,0,0,1,0,0,1,0,1,0,0,0,1,0,0,0],[1,0,1,0,1,0,0,1,0,0,1,0,0,0,0,0],[1,0,0,0,1,0,1,1,0,0,1,0,1,0,0,0]],ph=[];let d=4;
  for(let bar=0;bar<4;bar++){const r=pick(rh),notes=[];for(let s=0;s<16;s++){if(!r[s])continue;d=clamp(d+pick([-2,-1,-1,1,1,2,0]),0,9);let len=1;while(s+len<16&&!r[s+len])len++;notes.push([s,d,Math.min(len,6)])}ph.push(notes)}
  return[ph[0],ph[1],ph[0],ph[2],ph[0],ph[1],ph[3],ph[2]]}
const music={mood:'explore',cur:null,next:0,step:0,bar:0,mel:{},want:'explore',
  setMood(m){if(m==='explore'&&night()>.6)m='night';this.want=m},
  stinger(k){if(!AC||muted)return;const t=AC.currentTime+.02,d=sfxBus;
    if(k==='victory'){[60,64,67,72,76,79].forEach((m,i)=>INST.flute(t+i*.11,m+12,.3,.12,d));DR.crash(t,.12,d)}
    if(k==='checkpoint')[72,76,79].forEach((m,i)=>INST.kalimba(t+i*.12,m,.4,.2,d));
    if(k==='recruit'){[60,67,72,79].forEach((m,i)=>INST.flute(t+i*.14,m,.25,.12,d));DR.tom(t,.25,d)}
    if(k==='boss'){DR.tom(t,.45,d,90);DR.tom(t+.25,.45,d,80);INST.strings(t+.4,45,1.2,.1,d);INST.strings(t+.4,52,1.2,.08,d)}
    if(k==='level'){[67,71,74,79].forEach((m,i)=>INST.kalimba(t+i*.08,m+12,.3,.14,d));DR.tom(t,.2,d,200)}
    if(k==='rank'){[60,64,67,72,76,79,84].forEach((m,i)=>INST.flute(t+i*.09,m+12,.35,.12,d));[48,55,60].forEach(m=>INST.pad(t,m+12,2,.06,d));DR.crash(t,.15,d)}
    if(k==='death')[69,65,62,57].forEach((m,i)=>INST.flute(t+i*.28,m,.5,.12,d))}};
function musTick(){if(!AC)return;const now=AC.currentTime;if(music.next<now-.3)music.next=now+.05;
  while(music.next<now+.15){const m=music;if(m.step%16===0){m.cur=m.want;const sg=SONGS[m.cur];if(!m.mel[m.cur])m.mel[m.cur]=makeMelody(sg);for(const k in LAY)LAY[k].gain.setTargetAtTime(muted?0:sg.gains[k],now,1.2)}
    const sg=SONGS[m.cur],spb=60/sg.tempo/4;playStep(sg,m.step,m.next,spb);m.next+=spb;m.step++}}
function playStep(sg,s,t,spb){const bar=Math.floor(s/16),st=s%16,chord=sg.prog[bar%4],mood=music.cur,deg=d=>{const n=sg.scale.length;return sg.root+sg.scale[((d%n)+n)%n]+12*Math.floor(d/n)};
  const on=k=>SONGS[mood].gains[k]>0;
  if(st===0&&on('pad'))for(const n of chord)INST.pad(t,n,spb*16,.05,LAY.pad);
  if(on('bass')){const pat=mood==='boss'?[0,2,4,6,8,10,12,14]:mood==='combat'?[0,3,6,8,11,14]:[0,6,8];if(pat.includes(st))INST.bass(t,chord[0]-24+(mood==='boss'&&st%4===2?12:0)+(mood!=='boss'&&st===8?7:0),spb*(mood==='boss'?1.6:3),.22,LAY.bass)}
  if(on('arp')){const fast=mood==='combat'||mood==='boss';if(mood==='night'||mood==='camp'){if(st%4===0&&Math.random()<.75)INST[sg.arp](t,chord[Math.floor(Math.random()*3)]+12,spb*4,.11,LAY.arp)}
    else if(fast||st%2===0){const seq=[0,1,2,1,0,2,1,2],n=chord[seq[(st>>(fast?0:1))%8]]+12+(st>=8&&fast?12:0);INST[sg.arp](t,n,spb*2,fast?.07:.1,LAY.arp)}}
  if(on('mel')){const ph=music.mel[mood][bar%8];for(const[ns,d,len]of ph)if(ns===st)INST[sg.mel](t,deg(d)+12,spb*len*.95,mood==='boss'?.05:.09,LAY.mel)}
  if(on('perc')){if(mood==='explore'||mood==='camp'){if(st%4===2)DR.shaker(t,.08,LAY.perc);if(st===0&&bar%2===0)DR.tom(t,.18,LAY.perc,110)}
    else{if(st%4===0)DR.kick(t,.55,LAY.perc);if(st%2===1)DR.shaker(t,.07,LAY.perc);if(st===4||st===12)DR.snare(t,mood==='boss'?.25:.15,LAY.perc);if(mood==='boss'&&st>=12&&bar%4===3)DR.tom(t,.3,LAY.perc,140-st*4)}}
  if(on('tribal')){if([0,3,6,10,12].includes(st))DR.conga(t,.22,LAY.tribal,st%6===0?260:340);if(st===8||st===14)DR.tom(t,.25,LAY.tribal,100)}}
// ambience
let AMB={};function loopNoise(fc,type,q){const s=AC.createBufferSource();s.buffer=noiseBuf;s.loop=true;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=fc;f.Q.value=q||1;const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(ambBus);s.start();return g}
function ambInit(){AMB.rain=loopNoise(1100,'lowpass',.5);AMB.rainLow=loopNoise(260,'lowpass');AMB.wind=loopNoise(500,'lowpass');AMB.fall=loopNoise(900,'bandpass',.8);AMB.fire=loopNoise(2000,'highpass')}
let birdT=0,cricketT=0;
function ambTick(){if(!AC||muted){for(const k in AMB)AMB[k].gain.value=0;return}const t=AC.currentTime,nk=night(),act=mode!=='dead';
  AMB.rain.gain.setTargetAtTime(act?Wc.rain*.055:0,t,1.5);AMB.rainLow.gain.setTargetAtTime(act?Wc.rain*.06+Wc.storm*.05:0,t,1.5);AMB.wind.gain.setTargetAtTime(act?(Wc.fog*.08+Wc.snow*.12+Wc.cloud*.03)*(1+Math.sin(t*.3)*.5):0,t,.8);
  let fd=99;for(const f of FALLS)fd=Math.min(fd,Math.hypot(f.x-P.x,f.z-P.z));AMB.fall.gain.setTargetAtTime(act?clamp(1-fd/16,0,1)*.25:0,t,.3);AMB.fire.gain.setTargetAtTime(floor===0&&act?clamp(1-Math.hypot(11*TS-P.x,11*TS-P.z)/10,0,1)*.05:0,t,.3);
  if(!act)return;birdT-=.12;if(Wc.rain>.3&&Math.random()<Wc.rain*.25){const g=AC.createGain();env(g,t,.002,.06,.012*Wc.rain);g.connect(ambBus);osc('sine',rr(1400,2600),t,.08,g)}cricketT-=.12;
  if(birdT<=0&&nk<.4&&Wc.rain<.4){birdT=rr(1.5,4.5);const f=rr(1800,3200),n=ri(2,5);for(let i=0;i<n;i++){const g=AC.createGain();env(g,t+i*.09,.005,.07,.025);g.connect(ambBus);const o=osc('sine',f,t+i*.09,.1,g);o.frequency.exponentialRampToValueAtTime(f*rr(1.1,1.4),t+i*.09+.06)}}
  if(cricketT<=0&&nk>.5&&Wc.rain<.5){cricketT=rr(.3,.9);for(let i=0;i<3;i++){const g=AC.createGain();env(g,t+i*.045,.002,.025,.018);g.connect(ambBus);osc('square',4300+rr(-80,80),t+i*.045,.04,g)}}}
function sfx(type,vol=1){if(muted||!AC)return;try{const t=AC.currentTime,v=vol,d=sfxBus;switch(type){
  case'swing':nz(t,.14,.18*v,d,1400,'bandpass',.7);break;case'hit':nz(t,.08,.3*v,d,900,'lowpass');DR.kick(t,.25*v,d);break;case'crit':nz(t,.12,.35,d,2500,'bandpass');DR.tom(t,.3,d,220);break;
  case'hurt':{const g=AC.createGain();env(g,t,.005,.25,.15);g.connect(d);const o=osc('sawtooth',180,t,.3,g);o.frequency.exponentialRampToValueAtTime(70,t+.25);break}
  case'coin':INST.kalimba(t,88,.1,.06*v,d);INST.kalimba(t+.06,95,.1,.05*v,d);break;case'chest':[64,68,71,76].forEach((m,i)=>INST.kalimba(t+i*.06,m+12,.2,.08,d));nz(t,.2,.06,d,600,'lowpass');break;
  case'magic':{const g=AC.createGain();env(g,t,.01,.25,.08*v);g.connect(d);const o=osc('sine',500,t,.3,g);o.frequency.exponentialRampToValueAtTime(1400,t+.2);break}
  case'arrow':nz(t,.15,.12*v,d,3000,'bandpass',2);{const g=AC.createGain();env(g,t,.002,.15,.08*v);g.connect(d);osc('triangle',220,t,.2,g)}break;
  case'boom':nz(t,.8,.5*v,d,500,'lowpass');DR.kick(t,.7*v,d);break;case'jump':nz(t,.1,.06,d,1200,'bandpass');break;case'land':nz(t,.08,.12,d,300,'lowpass');break;case'dash':nz(t,.22,.15,d,1000,'bandpass',.6);break;
  case'rumble':nz(t,.35,.35*v,d,140,'lowpass');break;case'lever':nz(t,.06,.2,d,2500,'bandpass',3);DR.conga(t,.2,d,180);break;case'gate':for(let i=0;i<8;i++)nz(t+i*.1,.07,.1,d,2200,'bandpass',4);nz(t,1,.12,d,200,'lowpass');break;
  case'secret':[69,73,76,81].forEach((m,i)=>INST.kalimba(t+i*.1,m,.4,.1,d));break;case'portal':{const g=AC.createGain();env(g,t,.05,.6,.12);g.connect(d);const o=osc('sine',200,t,.7,g);o.frequency.exponentialRampToValueAtTime(900,t+.5)}break;
  case'chicken':{const g=AC.createGain();env(g,t,.005,.12,.08);g.connect(d);const o=osc('square',900,t,.3,g);o.frequency.setValueAtTime(1200,t+.06);o.frequency.setValueAtTime(800,t+.12)}break;
  case'pop':{const g=AC.createGain();env(g,t,.002,.08,.12);g.connect(d);const o=osc('sine',500,t,.1,g);o.frequency.exponentialRampToValueAtTime(1400,t+.06)}break;
  case'slap':nz(t,.12,.35,d,1600,'bandpass',.8);break;case'boing':{const g=AC.createGain();env(g,t,.005,.4,.12);g.connect(d);const o=osc('triangle',160,t,.45,g);o.frequency.exponentialRampToValueAtTime(700,t+.15);o.frequency.exponentialRampToValueAtTime(250,t+.4)}break;
  case'parry':{for(const f of[1250,1870,2650]){const g=AC.createGain();env(g,t,.001,.6,.07);g.connect(d);osc('sine',f,t,.65,g)}nz(t,.05,.2,d,4000)}break;case'block':nz(t,.1,.25,d,600,'lowpass');DR.tom(t,.2,d,160);break;
  case'drink':[0,.12,.24].forEach((o,i)=>{const g=AC.createGain();env(g,t+o,.01,.1,.07);g.connect(d);const q=osc('sine',400+i*120,t+o,.15,g);q.frequency.exponentialRampToValueAtTime(700+i*200,t+o+.1)});break;case'heal':[72,76,79,84].forEach((m,i)=>INST.kalimba(t+i*.07,m,.3,.06,d));break;
  case'steal':[0,3,6].forEach((k,i)=>INST.marimba(t+i*.07,84+k,.1,.08,d));break;case'beep':INST.kalimba(t,90,.1,.05,d);break;case'spit':nz(t,.1,.15,d,1200,'bandpass',2);break;case'buy':INST.kalimba(t,79,.2,.08,d);INST.kalimba(t+.08,84,.2,.08,d);break;
  case'trap':DR.tom(t,.35,d,90);nz(t,.3,.15,d,800,'lowpass');break;case'thunder':nz(t,2.6,.6,d,240,'lowpass');nz(t,.4,.4,d,1200,'lowpass');DR.kick(t,.6,d);break;
  case'ability':{const g=AC.createGain();env(g,t,.01,.5,.12);g.connect(d);const o=osc('triangle',300,t,.55,g);o.frequency.exponentialRampToValueAtTime(1200,t+.35);nz(t,.4,.1,d,2500,'bandpass',1)}break;case'fire':nz(t,.3,.18*v,d,900,'bandpass',.7);break;case'bite':nz(t,.08,.25,d,700,'lowpass');DR.conga(t,.25,d,140);break;case'step':nz(t,.05,.03*v,d,500,'lowpass');break}}catch(e){}}

function setVol(){if(!AC)return;musBus.gain.value=.85*VOL.mus/100;sfxBus.gain.value=VOL.sfx/100;ambBus.gain.value=VOL.amb/100}
