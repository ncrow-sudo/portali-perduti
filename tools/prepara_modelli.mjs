// Prepara i modelli 3D dei personaggi (KayKit Adventurers 1.0, licenza CC0, Kay Lousberg).
// Uso (non serve al server, solo a chi aggiorna i modelli):
//   git clone --depth 1 https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 /tmp/kaykit
//   npm i --no-save @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1
//   node tools/prepara_modelli.mjs /tmp/kaykit [cartella di uscita, di default src/assets]
// Scrive src/assets/<classe>.glb: mesh, scheletro e solo le animazioni usate dal gioco.
import { NodeIO } from '@gltf-transform/core';
import { prune, resample, dedup } from '@gltf-transform/functions';
import path from 'path';

const SRC = path.join(process.argv[2] || '/tmp/kaykit', 'addons/kaykit_character_pack_adventures/Characters/gltf');
const OUT = process.argv[3] || path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'assets');
const CLASSES = { cavaliere: 'Knight' };
const KEEP = new Set(['Idle', 'Walking_A', 'Running_A', 'Jump_Idle', 'Jump_Land', 'Dodge_Forward', 'Hit_A', 'Death_A', 'Cheer', 'Sit_Floor_Idle',
  '1H_Melee_Attack_Slice_Diagonal', '1H_Melee_Attack_Stab', '1H_Melee_Attack_Chop', '2H_Melee_Attack_Spin', 'Dualwield_Melee_Attack_Slice',
  'Blocking', '2H_Ranged_Aiming', 'Spellcast_Shoot']);
// ossa di controllo/IK: non deformano la mesh, le loro tracce sono inutili
const isCtl = n => /^(control|IK|heelIK|kneeIK|elbowIK|handIK)/.test(n);

const io = new NodeIO();
for (const [cls, file] of Object.entries(CLASSES)) {
  const doc = await io.read(path.join(SRC, file + '.glb'));
  const root = doc.getRoot();
  // armi e scudi del pacchetto: il gioco usa i suoi (rarità, elementi), quindi li togliamo
  for (const n of root.listNodes()) if (/^handslot\./.test(n.getName())) for (const c of n.listChildren()) { c.getMesh() && c.getMesh().dispose(); c.dispose(); }
  for (const a of root.listAnimations()) {
    if (!KEEP.has(a.getName())) { a.dispose(); continue; }
    for (const ch of a.listChannels()) {
      const n = ch.getTargetNode(), p = ch.getTargetPath();
      // teniamo solo le rotazioni (e la traslazione dei fianchi per il molleggio)
      if (!n || isCtl(n.getName()) || p === 'scale' || (p === 'translation' && n.getName() !== 'hips')) { const s = ch.getSampler(); ch.dispose(); s.dispose(); }
    }
  }
  await doc.transform(resample({ tolerance: 1e-3 }), dedup(), prune());
  const out = path.join(OUT, cls + '.glb');
  await io.write(out, doc);
  // seconda passata: rilette dal file, le tracce scartate lasciano accessori orfani da togliere
  const d2 = await io.read(out), r2 = d2.getRoot();
  for (const acc of r2.listAccessors()) if (acc.listParents().every(p => p === r2)) acc.dispose();
  await io.write(out, d2);
  console.log(out, root.listAnimations().length, 'animazioni');
}
