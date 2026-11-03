# Portali Perduti (De Tabte Portaler / Lost Portals)

Browser game for kids, deployed on Render (https://portali-perduti.onrender.com) from this repo: every push to `main` redeploys.

- Sources live in `src/`. Never edit `public/index.html` or `dist/claude.html` by hand: change `src/` and run `python3 src/build.py`.
- `src/p1.html`: HTML + CSS of every screen. `src/g*.js`: game code, concatenated in the order listed in `src/build.py` (one global script; later function declarations override earlier ones).
- Languages: the game text is written in Italian; `src/i18n/dict.py` holds Italian → English/Danish strings and `{}` templates, `src/i18n/runtime.js` translates page and canvas text at runtime. New on-screen text needs a line in `dict.py`.
- Multiplayer: `server.js` keeps code rooms in memory over WebSocket; `src/shim.js` gives the game the same `room` API it uses on claude.ai (presence + peers, room = presence field `rc`).
- `dist/claude.html` is the claude.ai Artifact version (no server; uses the Artifact `room` capability).
- Players are children: keep no chat, no accounts, no personal data beyond a nickname; rooms only via code/QR.
- Replies to the owner in Italian, concise, no em dashes.
