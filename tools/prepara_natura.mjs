// Prepara src/assets/natura.glb: alberi, rocce, case e oggetti per le mappe naturali.
// Da "KayKit: Medieval Hexagon Pack 1.0" di Kay Lousberg, licenza CC0.
// Uso (non serve al server):
//   git clone --depth 1 https://github.com/KayKit-Game-Assets/KayKit-Medieval-Hexagon-Pack-1.0 /tmp/hex
//   npm i --no-save @gltf-transform/core@4.1.1 @gltf-transform/functions@4.1.1
//   node tools/prepara_natura.mjs /tmp/hex [cartella di uscita, di default src/assets]
// Ogni oggetto diventa un nodo di primo livello col suo nome (es. "tree_single_A", "building_home_A_red").
import { NodeIO, Document } from '@gltf-transform/core';
import { mergeDocuments, dedup, prune, weld, quantize } from '@gltf-transform/functions';
import fs from 'fs';
import path from 'path';

const SRC = path.join(process.argv[2] || '/tmp/hex', 'addons/kaykit_medieval_hexagon_pack/Assets/gltf');
const OUT = process.argv[3] || path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'src', 'assets');
const WANT = /^(tree_single_[AB]|trees_[AB]_(large|medium|small)|rock_single_[A-E]|building_(home_[AB]|well)_(blue|red)|building_(tavern|church|blacksmith|market)_red|barrel|crate_A_big|crate_B_small|sack|tent|wheelbarrow|resource_lumber|waterlily_A|waterplant_A|hill_single_A|hills_A_trees|mountain_A_grass_trees|mountain_B)\.gltf$/;

const files = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (WANT.test(f)) files.push(p); } })(SRC);
files.sort();

const io = new NodeIO();
const doc = new Document();
doc.createBuffer();
const scene = doc.createScene('natura');
for (const f of files) {
  const src = await io.read(f);
  const name = path.basename(f, '.gltf');
  const map = mergeDocuments(doc, src);
  const srcScene = src.getRoot().getDefaultScene() || src.getRoot().listScenes()[0];
  const merged = map.get(srcScene);
  const group = doc.createNode(name);
  for (const n of merged.listChildren()) { merged.removeChild(n); group.addChild(n); }
  scene.addChild(group);
  merged.dispose();
}
// un solo buffer, materiali e texture uguali uniti
const bufs = doc.getRoot().listBuffers();
for (const acc of doc.getRoot().listAccessors()) acc.setBuffer(bufs[0]);
for (const b of bufs.slice(1)) b.dispose();
// quantize: posizioni e normali in interi (KHR_mesh_quantization, letto da GLTFLoader r128), circa metà peso
await doc.transform(dedup(), weld(), prune(), quantize({ quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 12 }));
const out = path.join(OUT, 'natura.glb');
await io.write(out, doc);
console.log(out, files.length, 'oggetti', fs.statSync(out).size, 'byte');
