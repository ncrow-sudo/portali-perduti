// ================= Statistiche anonime (solo sul sito, non su claude.ai) =================
// Il telefono manda piccoli segnali solo al server del gioco (/s); il server li passa a PostHog se è configurato.
// Niente nomi, niente identificativi che restano sul dispositivo: solo un numero casuale per questa apertura della pagina.
const STAT={sid:Math.random().toString(36).slice(2,12)+Date.now().toString(36).slice(-4),on:!!window.PP_SITE,t:0};
function statDev(){const w=Math.min(screen.width,screen.height);return !isTouch?'computer':w>=700?'tablet':'telefono'}
function stat(e,p){if(!STAT.on)return;try{const body=JSON.stringify({s:STAT.sid,e,p:Object.assign({disp:statDev(),lingua:typeof LANG==='string'?LANG:'it'},p||{})});
  if(navigator.sendBeacon&&navigator.sendBeacon('/s',new Blob([body],{type:'text/plain'})))return;fetch('/s',{method:'POST',body,keepalive:true}).catch(()=>{})}catch(err){}}
// un segnale al minuto mentre si gioca davvero (pagina visibile, partita in corso): minuti giocati = numero di segnali
setInterval(()=>{if(mode!=='play'||document.hidden)return;stat('pp_gioca',{piano:floor|0,mp:!!MP.on,classe:P.cls,diff:P.diff,livello:P.lvl|0})},60000);
