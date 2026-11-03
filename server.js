// Portali Perduti: piccolo server per giocare insieme.
// Serve il gioco (cartella public) e tiene le stanze in memoria: ogni giocatore vede solo chi ha il suo stesso codice stanza.
// Non salva niente su disco e non chiede account: quando tutti escono, la stanza sparisce.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0]);
  if (p === '/health') { res.end('ok'); return; }
  if (p === '/' || p === '') p = '/index.html';
  const f = path.join(PUB, path.normalize(p));
  if (!f.startsWith(PUB)) { res.writeHead(403); res.end(); return; }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); res.end('Non trovato'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(d);
  });
});

const wss = new WebSocketServer({ server, maxPayload: 16 * 1024 });
const peers = new Map(); // id -> { ws, pres, rc, last, cnt }
let nid = 0;
const newId = () => 'p' + Date.now().toString(36).slice(-5) + (nid++).toString(36) + Math.random().toString(36).slice(2, 6);
const send = (ws, o) => { if (ws.readyState === 1) ws.send(JSON.stringify(o)); };
const inRoom = (rc, except) => [...peers].filter(([k, p]) => k !== except && rc && p.rc === rc);

wss.on('connection', ws => {
  if (peers.size > 400) { ws.close(1013, 'pieno'); return; }
  const id = newId();
  const me = { ws, pres: {}, rc: null, last: 0, cnt: 0 };
  peers.set(id, me);
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  send(ws, { t: 'hello', id });

  ws.on('message', buf => {
    const now = Date.now();
    if (now - me.last > 1000) { me.last = now; me.cnt = 0; }
    if (++me.cnt > 45) return; // limite: circa 45 aggiornamenti al secondo
    let m; try { m = JSON.parse(buf); } catch (e) { return; }
    if (!m || m.t !== 'pres' || !m.patch || typeof m.patch !== 'object') return;
    const next = { ...me.pres };
    for (const k in m.patch) {
      if (!/^[A-Za-z_][A-Za-z0-9_-]{0,40}$/.test(k)) continue;
      if (m.patch[k] === null) delete next[k]; else next[k] = m.patch[k];
    }
    if (JSON.stringify(next).length > 6000) return;
    me.pres = next;
    const oldRc = me.rc;
    me.rc = typeof next.rc === 'string' && /^[a-z0-9]{3,12}$/.test(next.rc) ? next.rc : null;
    if (oldRc !== me.rc) {
      for (const [, p] of inRoom(oldRc, id)) send(p.ws, { t: 'leave', peer: id });
      for (const [, p] of inRoom(me.rc, id)) send(p.ws, { t: 'pres', peer: id, presence: me.pres });
      send(ws, { t: 'reset', peers: inRoom(me.rc, id).map(([k, p]) => ({ peer: k, presence: p.pres })) });
    } else if (me.rc) {
      for (const [, p] of inRoom(me.rc, id)) send(p.ws, { t: 'pres', peer: id, presence: me.pres });
    }
  });

  ws.on('close', () => {
    peers.delete(id);
    for (const [, p] of inRoom(me.rc, id)) send(p.ws, { t: 'leave', peer: id });
  });
});

setInterval(() => {
  for (const [, p] of peers) {
    if (!p.ws.isAlive) { p.ws.terminate(); continue; }
    p.ws.isAlive = false;
    try { p.ws.ping(); } catch (e) {}
  }
}, 30000);

server.listen(PORT, () => console.log('Portali Perduti attivo sulla porta ' + PORT));
