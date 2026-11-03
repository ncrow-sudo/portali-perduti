// Collega il gioco al server delle stanze (al posto del collegamento di claude.ai).
(function () {
  if (window.claude && window.claude.use) return;
  const S = { ws: null, id: null, peers: new Map(), mine: {}, hs: [], cs: [], connected: false, snap: Object.freeze([]), pending: null, timer: null, retry: 600 };
  function rebuild() {
    const arr = [Object.freeze({ peer: S.id || 'me', presence: Object.freeze({ ...S.mine }), isMe: true, sameTab: true, kind: 'viewer', by: null, guest: false, updatedAt: Date.now() })];
    for (const v of S.peers.values()) arr.push(v);
    S.snap = Object.freeze(arr);
  }
  function notify(j, l, u) { rebuild(); const ch = { peers: S.snap, joined: j || [], left: l || [], updated: u || [] }; for (const h of S.hs) { try { h(ch); } catch (e) {} } }
  function setPeer(k, pres) {
    const rec = Object.freeze({ peer: k, presence: Object.freeze(pres || {}), isMe: false, sameTab: false, kind: 'viewer', by: null, guest: false, updatedAt: Date.now() });
    const had = S.peers.has(k); S.peers.set(k, rec); return [had, rec];
  }
  function flush(full) {
    if (!S.ws || S.ws.readyState !== 1) return;
    const patch = full ? { ...S.mine } : S.pending; S.pending = null;
    if (patch && Object.keys(patch).length) S.ws.send(JSON.stringify({ t: 'pres', patch }));
  }
  function connect() {
    let ws;
    try { ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/ws'); } catch (e) { setTimeout(connect, S.retry); return; }
    S.ws = ws;
    ws.onopen = () => { S.retry = 600; S.connected = true; for (const h of S.cs) { try { h(true); } catch (e) {} } };
    ws.onmessage = ev => {
      let m; try { m = JSON.parse(ev.data); } catch (e) { return; }
      if (m.t === 'hello') { S.id = m.id; S.peers.clear(); notify(); flush(true); }
      else if (m.t === 'reset') { const left = [...S.peers.values()]; S.peers.clear(); const joined = []; for (const p of m.peers || []) joined.push(setPeer(p.peer, p.presence)[1]); notify(joined, left); }
      else if (m.t === 'pres') { const [had, rec] = setPeer(m.peer, m.presence); notify(had ? [] : [rec], [], had ? [rec] : []); }
      else if (m.t === 'leave') { const rec = S.peers.get(m.peer); S.peers.delete(m.peer); notify([], rec ? [rec] : []); }
    };
    ws.onclose = () => {
      S.connected = false; for (const h of S.cs) { try { h(false); } catch (e) {} }
      const left = [...S.peers.values()]; S.peers.clear(); notify([], left);
      S.retry = Math.min(8000, S.retry * 1.6); setTimeout(connect, S.retry);
    };
  }
  const room = {
    presence(patch) {
      for (const k in patch) { if (patch[k] === null) delete S.mine[k]; else S.mine[k] = patch[k]; }
      S.pending = Object.assign(S.pending || {}, patch);
      if (!S.timer) S.timer = setTimeout(() => { S.timer = null; flush(false); }, 66);
      rebuild(); return Promise.resolve();
    },
    peers: () => S.snap,
    onPeers(h) { S.hs.push(h); setTimeout(() => h({ peers: S.snap, joined: S.snap, left: [], updated: [] }), 0); return () => { S.hs = S.hs.filter(x => x !== h); }; },
    onConnection(h) { S.cs.push(h); setTimeout(() => h(S.connected), 0); return () => { S.cs = S.cs.filter(x => x !== h); }; },
    connected: () => S.connected,
    emit: () => Promise.resolve(), on: () => () => {}, join() { return Promise.resolve(room); }
  };
  window.PP_SITE = true;
  window.claude = { use: n => Promise.resolve(n === 'room' ? room : null) };
  connect();
})();
