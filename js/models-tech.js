// Videojuegos, electrónica, máquinas y aparatos.
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, screenTex, hex, rng,
  add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, grid, standBase, acrylic, SW } from './modelkit.js';
import { Acc, rodGeo, xf, latheGeo, slab, rrShape, rrPath, polyShape, roundPoly, smoothLoop, outline, planarUV, orient } from './models-music.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const lbl = (t, o) => labelTex(t, o);
function keyRows(g, x0, y, z0, rows, cols, pitch, keyM, capH = 0.008, tilt = 0) {
  const kb = grp(g, x0, y, z0, tilt);
  grid(kb, cols, rows, pitch, pitch, (x, z) => RB(kb, pitch * 0.82, capH, pitch * 0.82, pitch * 0.12, keyM, x, capH / 2, z));
  return kb;
}
function cable(g, pts, r = 0.003, m = C.black()) { return TU(g, pts, r, m); }

// =====================================================================
//  VIDEOJUEGOS
// =====================================================================
function controllerPad(g, x, z, o = {}) {
  const c = grp(g, x, 0, z, 0, o.ry ?? 0);
  const body = o.body ?? 0x9a9a98;
  if (o.shape === 'snes') {
    RB(c, 0.14, 0.022, 0.06, 0.02, plastic(0xc9c7c2), 0, 0.011, 0);
    for (const [bx, bz, col] of [[0.04, -0.01, 0x2d8a3a], [0.055, 0.004, 0xc8282a], [0.025, 0.004, 0xe8c020], [0.04, 0.018, 0x2a46b0]]) CY(c, 0.007, 0.007, 0.006, plastic(col), bx, 0.024, bz, 0, 0, 0, 14);
  } else if (o.shape === 'ps') {
    RB(c, 0.13, 0.024, 0.055, 0.018, plastic(0xb8b8b6), 0, 0.012, 0);
    for (const s of [-1, 1]) RB(c, 0.03, 0.022, 0.06, 0.012, plastic(0xb8b8b6), s * 0.05, 0.01, 0.035, 0, s * 0.3, 0);
    for (const [bx, bz, col] of [[0.04, -0.012, 0x3aa878], [0.052, 0, 0xd84a5a], [0.028, 0, 0xd87aa8], [0.04, 0.012, 0x4a7ad8]]) CY(c, 0.006, 0.006, 0.006, plastic(0x2a2a2a), bx, 0.026, bz, 0, 0, 0, 12);
  } else {
    RB(c, 0.12, 0.016, 0.05, 0.004, plastic(body), 0, 0.008, 0);
    B(c, 0.11, 0.001, 0.04, plastic(0x1c1c1c), 0, 0.0165, 0);
    for (const bx of [0.03, 0.048]) CY(c, 0.006, 0.006, 0.006, plastic(0xc8282a), bx, 0.018, 0.004, 0, 0, 0, 14);
  }
  B(c, 0.024, 0.006, 0.007, C.black(), -0.038, o.shape === 'ps' ? 0.026 : 0.018, 0); B(c, 0.007, 0.006, 0.024, C.black(), -0.038, o.shape === 'ps' ? 0.026 : 0.018, 0);
  if (o.cable !== false) cable(g, [[x, 0.01, z - 0.025], [x + 0.02, 0.005, z - 0.06], [x - 0.03, 0.005, z - 0.1], [0, 0.02, -0.08]], 0.0022);
  return c;
}
function cartridge(g, x, y, z, o = {}) {
  const c = grp(g, x, y, z, o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
  RB(c, o.w ?? 0.12, o.h ?? 0.13, 0.018, 0.004, plastic(o.color ?? 0x8f8f8d), 0, (o.h ?? 0.13) / 2, 0);
  for (let i = 0; i < 6; i++) B(c, (o.w ?? 0.12) * 0.8, 0.002, 0.002, plastic(0x6f6f6d), 0, (o.h ?? 0.13) * 0.9 - i * 0.004, 0.0095);
  P(c, (o.w ?? 0.12) * 0.8, (o.h ?? 0.13) * 0.55, artTex(o.seed ?? 3, o.style ?? 'landscape', 200, 180, o.title ?? 'SUPER AVENTURA'), 0, (o.h ?? 0.13) * 0.45, 0.0095);
  return c;
}
export function consoleNES() {
  const g = new THREE.Group();
  RB(g, 0.26, 0.085, 0.2, 0.004, plastic(0xcfccc4), 0, 0.0425, 0);
  B(g, 0.262, 0.03, 0.08, plastic(0x3a3a3c), 0, 0.02, 0.061);
  B(g, 0.2, 0.012, 0.06, plastic(0x585858), 0, 0.086, -0.04);
  for (let i = 0; i < 12; i++) B(g, 0.19, 0.002, 0.003, plastic(0xb8b5ad), 0, 0.0865, -0.065 + i * 0.005);
  RB(g, 0.19, 0.035, 0.004, 0.003, plastic(0xbdb9b0), 0, 0.058, 0.1);
  for (const x of [0.04, 0.07]) { RB(g, 0.022, 0.012, 0.004, 0.002, plastic(0x2a2a2a), -0.08 + x, 0.02, 0.102); }
  B(g, 0.01, 0.004, 0.002, emissive(0xff2a1a, 1.2), -0.1, 0.037, 0.101);
  for (const x of [0.04, 0.07]) RB(g, 0.022, 0.009, 0.006, 0.002, plastic(0xc8282a), x, 0.035, 0.1);
  P(g, 0.08, 0.012, lbl('NES', { bg: '#3a3a3c', fg: '#c8282a', w: 256, h: 40, font: 'bold 34px system-ui' }), -0.06, 0.01, 0.1015);
  controllerPad(g, 0.07, 0.19, { ry: 0.3 });
  cartridge(g, -0.07, 0, 0.19, { rx: -Math.PI / 2 + 0.001, ry: 0, seed: 11, title: 'SUPER HERMANOS' }).position.y = 0.01;
  return g;
}
export function consoleSNES() {
  const g = new THREE.Group();
  RB(g, 0.24, 0.07, 0.2, 0.025, plastic(0xc9c7c2), 0, 0.035, 0);
  RB(g, 0.16, 0.012, 0.1, 0.008, plastic(0x9a98a0), 0, 0.072, -0.01);
  B(g, 0.12, 0.004, 0.02, C.black(), 0, 0.079, -0.01);
  for (const [x, col] of [[-0.09, 0x6a4ab0], [0.09, 0x6a4ab0]]) RB(g, 0.03, 0.012, 0.02, 0.005, plastic(col), x, 0.075, 0.04);
  RB(g, 0.02, 0.01, 0.015, 0.004, plastic(0xa8a4b0), -0.03, 0.075, 0.07); RB(g, 0.02, 0.01, 0.015, 0.004, plastic(0xa8a4b0), 0.03, 0.075, 0.07);
  cartridge(g, 0, 0.078, -0.01, { w: 0.13, h: 0.08, color: 0x9a98a0, seed: 21, title: 'DINO KART' });
  controllerPad(g, 0.05, 0.19, { shape: 'snes', ry: -0.2 });
  return g;
}
export function consoleN64() {
  const g = new THREE.Group();
  const sh = [[-0.13, 0], [0.13, 0], [0.13, 0.05], [0.09, 0.075], [-0.09, 0.075], [-0.13, 0.05]];
  EX(g, sh, 0.19, plastic(0x2c2c2e), 0, 0, 0, 0, 0, 0, 0.008);
  CY(g, 0.035, 0.035, 0.012, plastic(0x4a4a4c), -0.07, 0.078, 0.03, 0, 0, 0, 20);
  cartridge(g, 0, 0.075, -0.02, { w: 0.11, h: 0.075, color: 0x6a6a6c, seed: 31, title: 'MARIO 3D' });
  for (let i = 0; i < 4; i++) B(g, 0.022, 0.012, 0.004, C.black(), -0.06 + i * 0.04, 0.02, 0.097);
  const pad = grp(g, 0.02, 0, 0.2, 0, -0.15);
  RB(pad, 0.15, 0.03, 0.06, 0.015, plastic(0x707072), 0, 0.02, -0.01);
  for (const x of [-0.055, 0, 0.055]) RB(pad, 0.035, 0.03, 0.07, 0.012, plastic(0x707072), x, 0.018, 0.04);
  CY(pad, 0.008, 0.01, 0.018, plastic(0x707072), 0, 0.04, 0.01, 0, 0, 0, 10);
  for (const [bx, bz, col] of [[0.045, 0, 0x2a5ad8], [0.06, -0.012, 0x2a9a3a], [0.058, 0.01, 0xe8c020]]) CY(pad, 0.006, 0.006, 0.006, plastic(col), bx, 0.036, bz, 0, 0, 0, 12);
  return g;
}
export function consolePS1() {
  const g = new THREE.Group();
  RB(g, 0.27, 0.06, 0.19, 0.012, plastic(0xc2c1bd), 0, 0.03, 0);
  CY(g, 0.075, 0.075, 0.006, plastic(0xb5b4b0), -0.04, 0.062, -0.01, 0, 0, 0, 48);
  TO(g, 0.075, 0.002, plastic(0x8a8986), -0.04, 0.064, -0.01, Math.PI / 2, 0, 0, Math.PI * 2, 48);
  for (const [x, col] of [[0.07, 0x8a8986], [0.1, 0x8a8986], [0.085, 0x7a7976]]) CY(g, 0.012, 0.012, 0.008, plastic(col), x, 0.062, 0.02 + (x === 0.085 ? 0.03 : 0), 0, 0, 0, 20);
  B(g, 0.02, 0.004, 0.003, emissive(0x33ff33, 1), 0.09, 0.064, -0.04);
  P(g, 0.12, 0.016, lbl('PlayStation', { bg: '#c2c1bd', fg: '#333', w: 512, h: 64, font: 'italic bold 44px system-ui' }), 0.07, 0.035, 0.0955);
  controllerPad(g, -0.02, 0.2, { shape: 'ps', ry: 0.2 });
  return g;
}
export function consoleGenesis(o = {}) {
  const g = new THREE.Group();
  RB(g, 0.28, 0.055, 0.21, 0.01, plastic(0x141414, 0.3), 0, 0.0275, 0);
  CY(g, 0.08, 0.085, 0.008, plastic(0x0a0a0a, 0.3), -0.04, 0.058, 0, 0, 0, 0, 48);
  for (let i = 0; i < 6; i++) TO(g, 0.03 + i * 0.009, 0.0015, plastic(0x2a2a2a), -0.04, 0.062, 0, Math.PI / 2, 0, 0, Math.PI * 2, 40);
  B(g, 0.09, 0.006, 0.02, C.black(), -0.04, 0.066, 0);
  P(g, 0.07, 0.03, lbl('16-BIT', { bg: '#141414', fg: '#e8e8e8', border: '#d8282a', w: 256, h: 110, font: 'bold 56px system-ui' }), 0.08, 0.056, 0.05, -Math.PI / 2);
  for (const x of [0.07, 0.1]) RB(g, 0.02, 0.01, 0.015, 0.004, plastic(0x2a2a2a), x, 0.058, -0.05);
  if (o.cd) {
    RB(g, 0.3, 0.07, 0.24, 0.01, plastic(0x1c1c1c, 0.3), 0, -0.035, 0).position.y = 0.035;
    g.children[0].position.y += 0.07; g.children.slice(1).forEach(c => (c.position.y += 0.07));
    RB(g, 0.2, 0.012, 0.13, 0.004, plastic(0x2a2a2a), 0, 0.063, 0.02).position.y = 0.068;
    B(g, 0.02, 0.004, 0.002, emissive(0xff3311, 1), 0.12, 0.03, 0.121);
    P(g, 0.1, 0.02, lbl('CD-ROM', { bg: '#1c1c1c', fg: '#bbb', w: 256, h: 50, font: 'bold 34px system-ui' }), -0.06, 0.03, 0.1205);
  }
  const pad = grp(g, 0.06, 0, 0.21, 0, -0.25);
  RB(pad, 0.14, 0.024, 0.07, 0.03, plastic(0x141414, 0.3), 0, 0.012, 0);
  for (let i = 0; i < 3; i++) CY(pad, 0.007, 0.007, 0.006, plastic(0x2a2a2a), 0.02 + i * 0.016, 0.026, 0.006 - i * 0.006, 0, 0, 0, 12);
  CY(pad, 0.018, 0.018, 0.005, plastic(0x2a2a2a), -0.035, 0.026, 0, 0, 0, 0, 20);
  cable(g, [[0.06, 0.01, 0.18], [0.02, 0.005, 0.14], [0, 0.02, 0.11]]);
  return g;
}
export function atari2600() {
  const g = new THREE.Group();
  RB(g, 0.34, 0.08, 0.24, 0.006, plastic(0x141414), 0, 0.04, 0);
  B(g, 0.342, 0.04, 0.09, mat(0x6b3a1c, { map: C.wood(0x6b3a1c).map, roughness: 0.4, env: true, envI: 0.3 }), 0, 0.03, 0.08);
  for (let i = 0; i < 10; i++) B(g, 0.3, 0.004, 0.004, plastic(0x2a2a2a), 0, 0.082, -0.1 + i * 0.012);
  for (let i = 0; i < 6; i++) { B(g, 0.02, 0.012, 0.025, C.black(), -0.12 + i * 0.048, 0.056, 0.1); CY(g, 0.004, 0.004, 0.022, C.chrome(), -0.12 + i * 0.048, 0.07, 0.1, 0.6, 0, 0, 8); }
  B(g, 0.12, 0.014, 0.08, C.black(), 0, 0.086, -0.02);
  cartridge(g, 0, 0.08, -0.02, { w: 0.08, h: 0.06, color: 0x141414, seed: 41, title: 'ASTEROIDES' });
  const js = grp(g, 0.12, 0, 0.24);
  RB(js, 0.07, 0.04, 0.07, 0.008, plastic(0x141414), 0, 0.02, 0);
  CY(js, 0.006, 0.008, 0.1, C.black(), 0, 0.08, 0, 0, 0, 0.1, 12);
  CY(js, 0.012, 0.012, 0.006, plastic(0xd8282a), -0.025, 0.043, -0.025, 0, 0, 0, 16);
  cable(g, [[0.12, 0.01, 0.2], [0.1, 0.005, 0.15], [0.05, 0.02, 0.12]]);
  return g;
}
export function neoGeo() {
  const g = new THREE.Group();
  RB(g, 0.33, 0.06, 0.24, 0.01, plastic(0x0e0e0e, 0.25), 0, 0.03, 0);
  P(g, 0.13, 0.03, lbl('NEO·GEO', { bg: '#0e0e0e', fg: '#e8e8e8', w: 512, h: 120, font: 'bold 84px system-ui' }), -0.06, 0.0605, 0.06, -Math.PI / 2);
  B(g, 0.02, 0.003, 0.006, C.gold(), 0.1, 0.061, 0.06);
  cartridge(g, 0, 0.06, -0.03, { w: 0.16, h: 0.1, color: 0x1a1a1a, seed: 51, title: 'METAL SLUG ’96' });
  const st = grp(g, 0, 0, 0.26);
  RB(st, 0.28, 0.06, 0.12, 0.01, plastic(0x0e0e0e, 0.25), 0, 0.03, 0);
  CY(st, 0.006, 0.006, 0.06, C.black(), -0.08, 0.09, 0, 0, 0, 0, 10); SP(st, 0.018, plastic(0xd8282a, 0.2), -0.08, 0.125, 0);
  for (let i = 0; i < 4; i++) CY(st, 0.011, 0.011, 0.01, plastic([0xd8282a, 0xe8c020, 0x2a9a3a, 0x2a5ad8][i]), 0.0 + i * 0.03, 0.063, 0.01 - (i % 2) * 0.01, 0, 0, 0, 16);
  return g;
}
export function limitedConsole() {
  const g = new THREE.Group();
  const gold = C.gold();
  RB(g, 0.26, 0.06, 0.2, 0.02, gold, 0, 0.05, 0);
  CY(g, 0.07, 0.07, 0.006, metal(0x1a1a1a, 0.2), -0.04, 0.083, 0, 0, 0, 0, 40);
  P(g, 0.1, 0.02, lbl('EDICIÓN 1/500', { bg: '#1a1a1a', fg: '#e8c870', w: 512, h: 100, font: 'bold 56px system-ui' }), 0.06, 0.081, 0.04, -Math.PI / 2);
  controllerPad(g, 0.0, 0.1, { shape: 'ps', cable: false }).position.y = 0.02;
  acrylic(g, 0.34, 0.2, 0.3);
  return g;
}
export function handheld(o = {}) {
  const g = new THREE.Group();
  const body = o.color ?? 0xbfbcb4;
  const W = o.w ?? 0.09, H = o.h ?? 0.148, T = 0.032;
  const hh = grp(g, 0, 0.08, 0, -0.25);
  RB(hh, W, H, T, 0.008, o.translucent ? mat(body, { transparent: true, opacity: 0.85, roughness: 0.25 }) : plastic(body), 0, 0, 0);
  RB(hh, W * 0.84, H * 0.42, 0.004, 0.006, plastic(o.bezel ?? 0x5a5a66), 0, H * 0.2, T / 2);
  P(hh, W * 0.52, W * 0.46, screenTex(o.screen ?? 'gb'), 0, H * 0.2, T / 2 + 0.0025, 0, 0, 0, { rough: 0.2 });
  B(hh, 0.006, 0.006, 0.002, emissive(0xff2222, 1), -W * 0.36, H * 0.24, T / 2 + 0.0025);
  B(hh, 0.024, 0.008, 0.005, C.black(), -W * 0.24, -H * 0.12, T / 2 + 0.002); B(hh, 0.008, 0.024, 0.005, C.black(), -W * 0.24, -H * 0.12, T / 2 + 0.002);
  CY(hh, 0.0065, 0.0065, 0.006, plastic(o.btn ?? 0x8a1a4a), W * 0.26, -H * 0.1, T / 2 + 0.002, Math.PI / 2, 0, 0, 16);
  CY(hh, 0.0065, 0.0065, 0.006, plastic(o.btn ?? 0x8a1a4a), W * 0.12, -H * 0.14, T / 2 + 0.002, Math.PI / 2, 0, 0, 16);
  for (const x of [-0.01, 0.012]) RB(hh, 0.014, 0.004, 0.004, 0.0018, plastic(0x777777), x, -H * 0.3, T / 2 + 0.001, 0, 0, -0.4);
  for (let i = 0; i < 6; i++) B(hh, 0.0025, 0.018, 0.002, plastic(0x777777), W * 0.2 + i * 0.005, -H * 0.4, T / 2 + 0.0005, 0, 0, -0.5);
  if (o.label) P(hh, W * 0.6, 0.008, lbl(o.label, { bg: hex(body), fg: '#2a2a6a', w: 512, h: 64, font: 'italic bold 40px system-ui' }), 0, H * 0.43, T / 2 + 0.0005);
  B(g, 0.1, 0.012, 0.06, C.darkWood(), 0, 0.006, 0.02);
  cartridge(g, 0.075, 0, 0.03, { w: 0.057, h: 0.065, color: 0x8f8f8d, seed: 61, title: 'TETRA' }).rotation.set(-Math.PI / 2, 0, 0.3);
  return g;
}
export function gbaSP() {
  const g = new THREE.Group();
  const m = metal(0xa9b3c4, 0.3);
  RB(g, 0.085, 0.022, 0.085, 0.01, m, 0, 0.011, 0);
  B(g, 0.022, 0.004, 0.006, C.black(), -0.025, 0.023, 0.01); B(g, 0.006, 0.004, 0.022, C.black(), -0.025, 0.023, 0.01);
  for (const [x, z] of [[0.028, 0.004], [0.018, 0.016]]) CY(g, 0.005, 0.005, 0.004, plastic(0x2a2a2a), x, 0.023, z, 0, 0, 0, 12);
  const lid = grp(g, 0, 0.022, -0.042, -1.9);
  RB(lid, 0.085, 0.012, 0.085, 0.01, m, 0, 0.006, 0.042);
  P(lid, 0.062, 0.042, artTex(9, 'landscape', 128, 96), 0, -0.0005, 0.042, Math.PI / 2);
  return g;
}
export function gameWatch() {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.04, 0, -0.35);
  RB(d, 0.11, 0.065, 0.01, 0.004, metal(0xc9a441, 0.3), 0, 0, 0);
  B(d, 0.06, 0.04, 0.002, plastic(0x1a1a1a), 0, 0.004, 0.005);
  P(d, 0.05, 0.032, screenTex('lcd'), 0, 0.004, 0.0062);
  for (const x of [-0.042, 0.042]) CY(d, 0.007, 0.007, 0.004, plastic(0xe86a2a), x, -0.012, 0.006, Math.PI / 2, 0, 0, 14);
  P(d, 0.05, 0.008, lbl('GAME & WATCH', { bg: '#c9a441', fg: '#2a1a0a', w: 512, h: 80, font: 'bold 48px system-ui' }), 0, -0.025, 0.0052);
  B(g, 0.12, 0.01, 0.05, C.darkWood(), 0, 0.005, 0.01);
  return g;
}
export function arcadeMini(o = {}) {
  const g = new THREE.Group();
  const sc = o.scale ?? 1;
  const side = [[0, 0], [0.24, 0], [0.24, 0.28], [0.17, 0.3], [0.12, 0.42], [0.2, 0.55], [0.2, 0.6], [0.02, 0.6], [0, 0.55]].map(([x, y]) => [x * sc - 0.12 * sc, y * sc]);
  const art = artTex(71, 'stars', 128, 256);
  for (const s of [-1, 1]) EX(g, side, 0.012, mat(0xffffff, { map: art, roughness: 0.4 }), 0, 0, s * 0.11 * sc, 0, Math.PI / 2, 0, 0.002).rotation.set(0, -Math.PI / 2, 0);
  B(g, 0.21 * sc, 0.28 * sc, 0.22 * sc, plastic(0x111111), 0, 0.14 * sc, -0.01 * sc);
  B(g, 0.21 * sc, 0.2 * sc, 0.01 * sc, plastic(0x0a0a0a), 0, 0.42 * sc, 0.0, -0.35);
  P(g, 0.17 * sc, 0.13 * sc, screenTex('vector'), 0, 0.43 * sc, 0.008 * sc, -0.35, 0, 0, { glow: 0.7 });
  B(g, 0.21 * sc, 0.05 * sc, 0.1 * sc, plastic(0x1a1a1a), 0, 0.305 * sc, 0.06 * sc, 0.2);
  CY(g, 0.004 * sc, 0.004 * sc, 0.03 * sc, C.black(), -0.05 * sc, 0.34 * sc, 0.07 * sc, 0, 0, 0, 8); SP(g, 0.01 * sc, plastic(0xd8282a, 0.2), -0.05 * sc, 0.36 * sc, 0.07 * sc);
  for (let i = 0; i < 3; i++) CY(g, 0.008 * sc, 0.008 * sc, 0.006 * sc, plastic([0xe8c020, 0x2a9a3a, 0x2a5ad8][i]), 0.01 * sc + i * 0.025 * sc, 0.335 * sc, 0.075 * sc, 0.2, 0, 0, 12);
  B(g, 0.21 * sc, 0.06 * sc, 0.06 * sc, emissive(0xffcf4a, 0.9), 0, 0.575 * sc, 0.06 * sc);
  P(g, 0.19 * sc, 0.045 * sc, lbl('SPACE RAID', { bg: '#1a0a3a', fg: '#ffd84a', w: 512, h: 128, font: 'bold 80px system-ui' }), 0, 0.575 * sc, 0.091 * sc, 0, 0, 0, { glow: 0.8 });
  return g;
}
export function vectrex() {
  const g = new THREE.Group();
  RB(g, 0.24, 0.36, 0.28, 0.02, plastic(0x141414), 0, 0.18, 0);
  B(g, 0.19, 0.24, 0.004, plastic(0x050505), 0, 0.2, 0.141);
  P(g, 0.17, 0.22, screenTex('vector'), 0, 0.2, 0.144, 0, 0, 0, { glow: 0.8 });
  for (let i = 0; i < 8; i++) B(g, 0.15, 0.003, 0.003, plastic(0x2a2a2a), 0, 0.35, -0.12 + i * 0.03);
  const pad = grp(g, 0, 0, 0.24);
  RB(pad, 0.2, 0.03, 0.08, 0.008, plastic(0x141414), 0, 0.015, 0);
  CY(pad, 0.005, 0.007, 0.04, C.black(), -0.06, 0.05, 0, 0, 0, 0, 10);
  for (let i = 0; i < 4; i++) CY(pad, 0.007, 0.007, 0.008, plastic(0xd8d8d8), 0.02 + i * 0.022, 0.033, 0, 0, 0, 0, 12);
  return g;
}
export function virtualBoy() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) CY(g, 0.008, 0.008, 0.2, plastic(0x141414), s * 0.05, 0.1, 0, 0, 0, s * 0.35, 10);
  const v = grp(g, 0, 0.2, 0);
  RB(v, 0.25, 0.1, 0.1, 0.03, plastic(0xb81c1c, 0.3), 0, 0.02, 0);
  RB(v, 0.2, 0.06, 0.03, 0.015, plastic(0x141414), 0, 0.01, 0.058);
  for (const s of [-1, 1]) CY(v, 0.018, 0.018, 0.005, glass(0x330000, 0.8), s * 0.04, 0.01, 0.074, Math.PI / 2, 0, 0, 20);
  RB(v, 0.08, 0.03, 0.1, 0.01, plastic(0x141414), 0, 0.075, -0.02);
  return g;
}
export function gameDisc(seed, title) {
  const g = new THREE.Group();
  const st = grp(g, 0, 0.1, 0, -0.18);
  RB(st, 0.135, 0.19, 0.014, 0.004, plastic(0x0d0d0d), 0, 0, 0);
  P(st, 0.125, 0.18, artTex(seed, 'stars', 200, 288, title), 0, 0, 0.0075);
  B(g, 0.15, 0.012, 0.05, C.darkWood(), 0, 0.006, 0.03);
  return g;
}
export function controllerOnly(kind = 'nes') {
  const g = new THREE.Group();
  controllerPad(g, 0, 0, { shape: kind, cable: false });
  TU(g, [[0, 0.01, -0.03], [0.04, 0.005, -0.08], [-0.02, 0.005, -0.12], [0.03, 0.005, -0.15]], 0.0022, C.black());
  return g;
}

// =====================================================================
//  ELECTRÓNICA
// =====================================================================
const beige = () => plastic(0xd9d0b8, 0.5);
export function keyboard(g, x, y, z, o = {}) {
  const k = grp(g, x, y, z);
  const W = o.w ?? 0.44, D = o.d ?? 0.16;
  RB(k, W, 0.03, D, 0.006, o.body ?? beige(), 0, 0.015, 0);
  grid(k, o.cols ?? 15, o.rows ?? 5, W / ((o.cols ?? 15) + 1.2), D / ((o.rows ?? 5) + 1), (kx, kz, i, j) => RB(k, W / ((o.cols ?? 15) + 1.2) * 0.84, 0.012, D / ((o.rows ?? 5) + 1) * 0.82, 0.002, (o.accent && (i === 0 || i >= (o.cols ?? 15) - 2)) ? o.accent : o.key ?? plastic(0xebe4d0, 0.4), kx, 0.034 + j * 0.001, kz));
  return k;
}
export function crtMonitor(g, x, y, z, o = {}) {
  const m = grp(g, x, y, z);
  const s = o.size ?? 1;
  RB(m, 0.36 * s, 0.3 * s, 0.1 * s, 0.015, o.body ?? beige(), 0, 0.15 * s, 0.08 * s);
  RB(m, 0.3 * s, 0.24 * s, 0.26 * s, 0.03, o.body ?? beige(), 0, 0.15 * s, -0.08 * s);
  B(m, 0.28 * s, 0.21 * s, 0.004, plastic(0x1a1d1a, 0.1), 0, 0.16 * s, 0.131 * s);
  P(m, 0.27 * s, 0.2 * s, screenTex(o.screen ?? 'crt'), 0, 0.16 * s, 0.134 * s, 0, 0, 0, { glow: 0.6, rough: 0.1 });
  B(m, 0.012, 0.012, 0.004, emissive(0x33ff33, 1), 0.15 * s, 0.03 * s, 0.131 * s);
  return m;
}
export function ibmPC(o = {}) {
  const g = new THREE.Group();
  const b = beige();
  RB(g, 0.5, 0.14, 0.4, 0.006, b, 0, 0.07, 0);
  for (const x of [0.06, 0.18]) { B(g, 0.1, 0.06, 0.004, plastic(0x2a2a2a), x, 0.08, 0.2); B(g, 0.07, 0.004, 0.006, C.black(), x, 0.085, 0.203); }
  P(g, 0.05, 0.015, lbl('IBM', { bg: '#2a4aa8', fg: '#fff', w: 128, h: 40, font: 'bold 32px system-ui' }), -0.2, 0.12, 0.201);
  crtMonitor(g, 0, 0.14, 0, { screen: 'crt', body: b });
  keyboard(g, 0, 0, 0.34, { w: 0.46, d: 0.17, cols: 16 });
  return g;
}
export function oldTower() {
  const g = new THREE.Group();
  RB(g, 0.18, 0.4, 0.4, 0.006, beige(), -0.28, 0.2, 0);
  B(g, 0.14, 0.03, 0.004, plastic(0xbab29c), -0.28, 0.33, 0.201); B(g, 0.1, 0.004, 0.006, C.black(), -0.28, 0.33, 0.203);
  B(g, 0.14, 0.025, 0.004, plastic(0xbab29c), -0.28, 0.28, 0.201);
  CY(g, 0.012, 0.012, 0.006, plastic(0xbab29c), -0.28, 0.12, 0.201, Math.PI / 2, 0, 0, 16);
  B(g, 0.008, 0.004, 0.003, emissive(0x33ff33, 1), -0.24, 0.1, 0.201);
  crtMonitor(g, 0.08, 0, 0, { screen: 'crt' });
  keyboard(g, 0.08, 0, 0.3, { w: 0.4, d: 0.14 });
  return g;
}
export function breadbox(o = {}) {
  const g = new THREE.Group();
  const W = o.w ?? 0.4;
  EX(g, [[-0.1, 0], [0.1, 0], [0.1, 0.04], [-0.08, 0.075], [-0.1, 0.075]], W, plastic(o.body ?? 0x6b5a48, 0.45), 0, 0, 0, 0, -Math.PI / 2, 0, 0.006).rotation.set(0, Math.PI / 2, 0);
  const k = grp(g, 0, 0.055, 0.0, 0.18);
  grid(k, 16, 5, W * 0.9 / 17, 0.022, (x, z, i, j) => RB(k, W * 0.9 / 17 * 0.85, 0.012, 0.019, 0.002, o.key ?? plastic(0x4a3a2c, 0.4), x, 0.006, z));
  if (o.floppy) { B(g, 0.004, 0.02, 0.1, plastic(0x999999), W / 2 + 0.001, 0.035, 0.0); B(g, 0.002, 0.003, 0.08, C.black(), W / 2 + 0.003, 0.035, 0.0); }
  P(g, 0.12, 0.02, lbl(o.label ?? 'commodore 64', { bg: hex(o.bodyC ?? 0x6b5a48), fg: '#e8e0d0', w: 512, h: 80, font: 'bold 44px system-ui' }), -W / 2 + 0.08, 0.075, -0.075, -Math.PI / 2 + 0.3);
  B(g, 0.02, 0.004, 0.002, emissive(0xff2211, 1), W / 2 - 0.04, 0.045, 0.09);
  return g;
}
export function apple1() {
  const g = new THREE.Group();
  RB(g, 0.42, 0.08, 0.32, 0.01, C.wood(0x8a5a2a), 0, 0.04, 0);
  const pcb = canvasTex('pcb', 256, 200, (c, w, h) => { c.fillStyle = '#1f6a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d8c070'; c.lineWidth = 1; for (let i = 0; i < 60; i++) { c.beginPath(); c.moveTo(Math.random() * w, Math.random() * h); c.lineTo(Math.random() * w, Math.random() * h); c.stroke(); } c.fillStyle = '#eee'; c.font = 'bold 14px monospace'; c.fillText('APPLE COMPUTER 1', 10, 20); c.fillText('PALO ALTO. CA.', 10, 38); });
  B(g, 0.36, 0.004, 0.26, mat(0xffffff, { map: pcb, roughness: 0.4 }), 0, 0.082, -0.01);
  grid(g, 8, 5, 0.04, 0.045, (x, z) => B(g, 0.03, 0.008, 0.012, plastic(0x141414), x, 0.089, z - 0.01));
  for (let i = 0; i < 4; i++) CY(g, 0.012, 0.012, 0.03, mat(0x2a4aa8), -0.15 + i * 0.03, 0.1, 0.1, 0, 0, 0, 12);
  keyboard(g, 0, 0, 0.3, { w: 0.34, d: 0.12, body: mat(0x2a2a2a), key: plastic(0x1a1a1a), cols: 12, rows: 4 });
  acrylic(g, 0.48, 0.14, 0.52);
  return g;
}
export function walkman(o = {}) {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.06, 0, -0.2);
  RB(d, 0.09, 0.13, 0.03, 0.006, metal(o.color ?? 0x5a7ab8, 0.3), 0, 0, 0);
  RB(d, 0.07, 0.05, 0.004, 0.004, glass(0x2a2a2a, 0.5), 0, 0.02, 0.016);
  for (const s of [-1, 1]) CY(d, 0.009, 0.009, 0.004, plastic(0xf1f1f1), s * 0.018, 0.02, 0.016, Math.PI / 2, 0, 0, 12);
  for (let i = 0; i < 5; i++) RB(d, 0.013, 0.012, 0.012, 0.002, C.silver(), -0.03 + i * 0.015, 0.068, 0);
  P(d, 0.06, 0.012, lbl(o.label ?? 'WALKMAN', { bg: hex(o.color ?? 0x5a7ab8), fg: '#fff', w: 256, h: 56, font: 'bold 40px system-ui' }), 0, -0.035, 0.0155);
  const hp = grp(g, 0.1, 0.0, 0.02);
  TU(hp, [[-0.05, 0.03, 0], [-0.04, 0.09, 0], [0, 0.11, 0], [0.04, 0.09, 0], [0.05, 0.03, 0]], 0.003, C.silver());
  for (const s of [-1, 1]) CY(hp, 0.025, 0.025, 0.015, mat(0xe8742a, { roughness: 1 }), s * 0.05, 0.03, 0, 0, 0, Math.PI / 2, 20);
  cable(g, [[0.05, 0.02, 0.02], [0.03, 0.005, 0.05], [0.0, 0.03, 0.02]], 0.0015);
  return g;
}
export function discman() {
  const g = new THREE.Group();
  CY(g, 0.068, 0.068, 0.025, metal(0xc8ccd2, 0.3), 0, 0.0125, 0, 0, 0, 0, 48);
  CY(g, 0.06, 0.06, 0.002, glass(0x333344, 0.5), 0, 0.026, 0, 0, 0, 0, 48);
  CY(g, 0.055, 0.055, 0.001, mat(0xe0e4f0, { metalness: 0.9, roughness: 0.1, env: true }), 0, 0.022, 0, 0, 0, 0, 40);
  for (let i = 0; i < 4; i++) RB(g, 0.012, 0.006, 0.008, 0.002, plastic(0x2a2a2a), -0.02 + i * 0.013, 0.012, 0.068);
  P(g, 0.04, 0.008, lbl('DISCMAN', { bg: '#c8ccd2', fg: '#333', w: 256, h: 50, font: 'bold 36px system-ui' }), 0, 0.027, -0.045, -Math.PI / 2);
  return g;
}
export function calculator(o = {}) {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.012, 0, -0.08);
  RB(d, o.w ?? 0.128, 0.015, o.d ?? 0.08, 0.005, plastic(o.body ?? 0x2a2622), 0, 0, 0);
  if (o.gold) B(d, (o.w ?? 0.128) * 0.95, 0.001, 0.01, C.gold(), 0, 0.008, -0.028);
  P(d, 0.06, 0.016, screenTex('lcd'), -0.02, 0.0082, -0.028, -Math.PI / 2);
  grid(d, 10, 4, 0.0115, 0.011, (x, z) => RB(d, 0.009, 0.004, 0.008, 0.0015, plastic(0x1a1a1a), x, 0.009, z + 0.012));
  if (o.label) P(d, 0.03, 0.006, lbl(o.label, { bg: '#2a2622', fg: '#c8b070', w: 128, h: 30, font: 'bold 24px system-ui' }), 0.04, 0.0082, -0.028, -Math.PI / 2);
  return g;
}
export function compactCamera(o = {}) {
  const g = new THREE.Group();
  RB(g, 0.11, 0.065, 0.035, 0.01, o.body ?? metal(0xc0c4ca, 0.3), 0, 0.0325, 0);
  CY(g, 0.022, 0.024, 0.02, C.black(), 0.015, 0.033, 0.026, Math.PI / 2, 0, 0, 24);
  CY(g, 0.015, 0.015, 0.002, glass(0x3a4a6a, 0.85), 0.015, 0.033, 0.037, Math.PI / 2, 0, 0, 24);
  B(g, 0.018, 0.012, 0.004, glass(0xf0f0ff, 0.6), -0.035, 0.05, 0.018);
  CY(g, 0.006, 0.006, 0.006, C.silver(), 0.035, 0.068, 0, 0, 0, 0, 12);
  if (o.disposable) { P(g, 0.1, 0.04, lbl('FOTO 27', { bg: '#f2c230', fg: '#1a6a3a', w: 256, h: 100, font: 'bold 56px system-ui' }), 0, 0.03, 0.0176); B(g, 0.02, 0.01, 0.01, plastic(0x2a2a2a), -0.03, 0.068, -0.01); }
  return g;
}
export function vcr(o = {}) {
  const g = new THREE.Group();
  RB(g, 0.43, 0.09, 0.3, 0.006, metal(o.color ?? 0x3a3a3c, 0.4), 0, 0.045, 0);
  B(g, 0.2, 0.04, 0.004, plastic(0x1a1a1a), -0.08, 0.055, 0.151);
  B(g, 0.08, 0.02, 0.004, emissive(0x33ddff, 0.8), 0.12, 0.06, 0.151);
  for (let i = 0; i < 6; i++) RB(g, 0.018, 0.01, 0.008, 0.002, C.silver(), 0.06 + i * 0.022, 0.025, 0.152);
  P(g, 0.1, 0.014, lbl(o.label ?? 'BETAMAX', { bg: '#3a3a3c', fg: '#e8e8e8', w: 256, h: 40, font: 'bold 30px system-ui' }), -0.13, 0.02, 0.1515);
  const tape = grp(g, 0.1, 0.0, 0.26, 0, 0.3);
  RB(tape, o.label === 'VHS' ? 0.19 : 0.156, 0.025, 0.096, 0.004, plastic(0x141414), 0, 0.0125, 0);
  P(tape, 0.12, 0.018, lbl('Lado A', { bg: '#f4f0e0', fg: '#333', w: 256, h: 40, font: 'italic 28px Georgia' }), 0, 0.0126, 0.0485);
  return g;
}
export function transistorRadio(o = {}) {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.065, 0, -0.1);
  RB(d, 0.15, 0.1, 0.04, 0.01, C.leather(o.color ?? 0x6a2a1a), 0, 0, 0);
  B(d, 0.13, 0.08, 0.002, metal(0xd8c89a, 0.3), 0, 0, 0.021);
  grid(d, 12, 7, 0.0085, 0.0085, (x, y) => CY(d, 0.0025, 0.0025, 0.004, C.black(), x - 0.02, y, 0.022, Math.PI / 2, 0, 0, 8));
  CY(d, 0.022, 0.022, 0.006, plastic(0xefe6d0), 0.045, 0.0, 0.023, Math.PI / 2, 0, 0, 24);
  P(d, 0.036, 0.036, canvasTex('dial', 128, 128, (c, w, h) => { c.fillStyle = '#efe6d0'; c.beginPath(); c.arc(64, 64, 64, 0, 7); c.fill(); c.fillStyle = '#333'; c.font = '14px monospace'; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; c.fillText(String(55 + i * 15), 58 + Math.cos(a) * 44, 68 + Math.sin(a) * 44); } c.fillStyle = '#c8282a'; c.fillRect(62, 10, 3, 54); }), 0.045, 0, 0.0265, 0, 0, 0, { transparent: true, alphaTest: 0.2 });
  TU(g, [[-0.06, 0.12, 0.0], [-0.03, 0.15, 0.0], [0.03, 0.15, 0], [0.06, 0.12, 0]], 0.005, C.leather(o.color ?? 0x6a2a1a));
  return g;
}
export function boombox() {
  const g = new THREE.Group();
  RB(g, 0.5, 0.26, 0.12, 0.012, metal(0x2a2a2c, 0.4), 0, 0.13, 0);
  for (const s of [-1, 1]) {
    CY(g, 0.085, 0.085, 0.01, metal(0x9aa0a6, 0.3), s * 0.16, 0.12, 0.062, Math.PI / 2, 0, 0, 40);
    CY(g, 0.07, 0.07, 0.012, mat(0x111111, { roughness: 0.9 }), s * 0.16, 0.12, 0.064, Math.PI / 2, 0, 0, 40);
    CY(g, 0.02, 0.02, 0.016, C.chrome(), s * 0.16, 0.12, 0.066, Math.PI / 2, 0, 0, 20);
  }
  B(g, 0.14, 0.08, 0.006, glass(0x333333, 0.6), 0, 0.12, 0.062);
  for (const s of [-1, 1]) CY(g, 0.012, 0.012, 0.007, plastic(0xf1f1f1), s * 0.03, 0.12, 0.062, Math.PI / 2, 0, 0, 12);
  B(g, 0.4, 0.03, 0.006, emissive(0xffa040, 0.5), 0, 0.225, 0.062);
  for (let i = 0; i < 6; i++) RB(g, 0.018, 0.012, 0.02, 0.003, C.silver(), -0.05 + i * 0.02, 0.265, 0.02);
  TU(g, [[-0.2, 0.26, 0], [-0.18, 0.33, 0], [0.18, 0.33, 0], [0.2, 0.26, 0]], 0.01, C.chrome());
  CY(g, 0.003, 0.003, 0.25, C.chrome(), 0.2, 0.38, -0.04, 0, 0, -0.5, 8);
  return g;
}
export function clockRadio() {
  const g = new THREE.Group();
  EX(g, [[-0.1, 0], [0.1, 0], [0.1, 0.07], [-0.1, 0.08]], 0.1, plastic(0x3a2a1c), 0, 0, 0, 0, 0, 0, 0.006);
  B(g, 0.11, 0.04, 0.004, plastic(0x0a0a0a), -0.03, 0.045, 0.052);
  P(g, 0.1, 0.035, lbl('07:30', { bg: '#0a0a0a', fg: '#ff3322', w: 256, h: 90, font: 'bold 80px monospace' }), -0.03, 0.045, 0.0545, 0, 0, 0, { glow: 1 });
  grid(g, 5, 4, 0.01, 0.01, (x, y) => CY(g, 0.003, 0.003, 0.004, C.black(), 0.06 + x, 0.04 + y, 0.052, Math.PI / 2, 0, 0, 8));
  for (let i = 0; i < 3; i++) RB(g, 0.025, 0.008, 0.02, 0.003, plastic(0x999999), -0.05 + i * 0.035, 0.083, 0);
  return g;
}
export function usbStick() {
  const g = new THREE.Group();
  RB(g, 0.06, 0.012, 0.02, 0.004, plastic(0x2a4ab0, 0.3), 0, 0.006, 0);
  B(g, 0.014, 0.0045, 0.012, C.silver(), 0.036, 0.006, 0);
  P(g, 0.035, 0.012, lbl('128MB', { bg: '#2a4ab0', fg: '#fff', w: 128, h: 40, font: 'bold 30px system-ui' }), -0.005, 0.0121, 0, -Math.PI / 2);
  TO(g, 0.008, 0.002, C.silver(), -0.036, 0.006, 0, Math.PI / 2, 0, 0);
  return g;
}
export function mechKeyboard() {
  const g = new THREE.Group();
  keyboard(g, 0, 0, 0, { w: 0.46, d: 0.16, body: plastic(0xcfc9b6), key: plastic(0xe8e2d0, 0.4), accent: plastic(0x8a8478, 0.4), cols: 17, rows: 6 });
  TU(g, [[0, 0.02, -0.08], [0.02, 0.01, -0.14], [-0.05, 0.005, -0.2]], 0.003, beige());
  return g;
}
export function mouseOld() {
  const g = new THREE.Group();
  RB(g, 0.06, 0.035, 0.1, 0.015, beige(), 0, 0.0175, 0);
  B(g, 0.055, 0.002, 0.035, plastic(0xa8a08a), 0, 0.035, -0.02);
  B(g, 0.002, 0.003, 0.035, plastic(0x8a8272), 0, 0.036, -0.02);
  TU(g, [[0, 0.015, -0.05], [0.02, 0.008, -0.1], [-0.03, 0.005, -0.15], [0.01, 0.005, -0.2]], 0.002, beige());
  return g;
}
export function nokia() {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.06, 0, -0.3);
  RB(d, 0.047, 0.115, 0.018, 0.012, plastic(0x28323e, 0.35), 0, 0, 0);
  RB(d, 0.036, 0.03, 0.002, 0.004, plastic(0x1a1a1a), 0, 0.028, 0.0095);
  P(d, 0.03, 0.023, screenTex('nokia'), 0, 0.028, 0.0107);
  grid(d, 3, 4, 0.011, 0.008, (x, y) => RB(d, 0.009, 0.006, 0.004, 0.002, plastic(0x9aa4b0), x, y - 0.028, 0.0095));
  RB(d, 0.03, 0.01, 0.004, 0.003, plastic(0x9aa4b0), 0, 0.002, 0.0095);
  B(g, 0.07, 0.01, 0.05, C.darkWood(), 0, 0.005, 0.01);
  return g;
}
export function smartphone(o = {}) {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.07, 0, -0.3);
  RB(d, o.w ?? 0.06, o.h ?? 0.115, 0.011, 0.008, o.body ?? plastic(0x1a1a1a, 0.2), 0, 0, 0);
  P(d, (o.w ?? 0.06) * 0.88, (o.h ?? 0.115) * 0.78, screenTex('phone'), 0, 0.002, 0.0058, 0, 0, 0, { glow: 0.6, rough: 0.1 });
  CY(d, 0.005, 0.005, 0.002, plastic(0x2a2a2a), 0, -(o.h ?? 0.115) * 0.44, 0.0058, Math.PI / 2, 0, 0, 16);
  B(g, 0.08, 0.01, 0.05, C.darkWood(), 0, 0.005, 0.01);
  return g;
}
export function tablet() {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.12, 0, -0.25);
  RB(d, 0.17, 0.24, 0.008, 0.012, C.gold(), 0, 0, 0);
  RB(d, 0.16, 0.23, 0.002, 0.01, plastic(0x0a0a0a, 0.1), 0, 0, 0.004);
  P(d, 0.145, 0.205, artTex(88, 'stars', 180, 256, 'HISTORY'), 0, 0, 0.0052, 0, 0, 0, { glow: 0.7 });
  B(g, 0.2, 0.012, 0.08, C.darkWood(), 0, 0.006, 0.03);
  acrylic(g, 0.24, 0.3, 0.14);
  return g;
}

// =====================================================================
//  MÁQUINAS
// =====================================================================
export function typewriter(o = {}) {
  const g = new THREE.Group();
  const bd = glossy(o.color ?? 0x121212);
  EX(g, [[-0.15, 0], [0.15, 0], [0.15, 0.08], [0.12, 0.12], [-0.12, 0.12], [-0.15, 0.08]], 0.24, bd, 0, 0, 0, 0, Math.PI / 2, 0, 0.01).rotation.set(0, Math.PI / 2, 0);
  const kb = grp(g, 0, 0.05, 0.1, 0.35);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 11 - (r === 3 ? 1 : 0); i++) {
    const x = -0.1 + i * 0.02 + r * 0.005, z = -0.03 + r * 0.02;
    CY(kb, 0.0012, 0.0012, 0.03 + r * 0.01, C.chrome(), x, -0.005, z, 0, 0, 0, 5);
    CY(kb, 0.0075, 0.0075, 0.004, C.chrome(), x, 0.012, z, 0, 0, 0, 16);
    CY(kb, 0.0065, 0.0065, 0.0045, mat(0x0d0d0d, { roughness: 0.3 }), x, 0.013, z, 0, 0, 0, 16);
  }
  B(kb, 0.12, 0.012, 0.012, C.chrome(), 0, 0.005, 0.06);
  CY(g, 0.022, 0.022, 0.34, mat(0x141414, { roughness: 0.7 }), 0, 0.14, -0.06, 0, 0, Math.PI / 2, 24);
  for (const s of [-1, 1]) CY(g, 0.028, 0.028, 0.02, C.chrome(), s * 0.18, 0.14, -0.06, 0, 0, Math.PI / 2, 20);
  B(g, 0.2, 0.2, 0.001, C.paper(), 0, 0.22, -0.08, -0.15);
  P(g, 0.18, 0.1, canvasTex('typed', 256, 140, (c, w, h) => { c.fillStyle = '#f4efe0'; c.fillRect(0, 0, w, h); c.fillStyle = '#222'; c.font = '13px Courier New'; ['Querido coleccionista:', 'La bodega 7 guarda', 'algo que no imaginas...', '', 'Atte. E.'].forEach((t, i) => c.fillText(t, 12, 22 + i * 18)); }), 0, 0.24, -0.0795, -0.15);
  TU(g, [[-0.17, 0.15, -0.06], [-0.22, 0.17, -0.04], [-0.24, 0.17, 0.0]], 0.004, C.chrome());
  P(g, 0.1, 0.02, lbl(o.label ?? 'Underwood', { bg: '#121212', fg: '#d8b04a', w: 512, h: 100, font: 'italic bold 70px Georgia' }), 0, 0.1, 0.121, -0.3);
  return g;
}
export function rangefinder(o = {}) {
  const g = new THREE.Group();
  RB(g, 0.138, 0.078, 0.033, 0.01, C.leather(0x151515), 0, 0.039, 0);
  RB(g, 0.14, 0.02, 0.035, 0.008, C.chrome(), 0, 0.075, 0);
  for (const x of [-0.045, -0.02, 0.04]) B(g, 0.016, 0.012, 0.004, glass(0x2a3a4a, 0.8), x, 0.075, 0.018);
  CY(g, 0.012, 0.012, 0.01, C.chrome(), 0.035, 0.09, -0.005, 0, 0, 0, 20);
  CY(g, 0.009, 0.009, 0.008, C.chrome(), -0.04, 0.089, -0.005, 0, 0, 0, 16);
  CY(g, 0.026, 0.026, 0.012, C.chrome(), 0, 0.04, 0.022, Math.PI / 2, 0, 0, 32);
  CY(g, 0.022, 0.024, 0.035, C.black(), 0, 0.04, 0.045, Math.PI / 2, 0, 0, 32);
  CY(g, 0.017, 0.017, 0.002, glass(0x3a4a7a, 0.85), 0, 0.04, 0.063, Math.PI / 2, 0, 0, 32);
  if (o.label) P(g, 0.04, 0.008, lbl(o.label, { bg: '#e8e8e8', fg: '#c8282a', w: 256, h: 50, font: 'italic bold 40px Georgia' }), -0.03, 0.0855, 0.0, -Math.PI / 2);
  TU(g, [[-0.07, 0.07, 0], [-0.09, 0.02, 0.02], [-0.06, 0.005, 0.08], [0.06, 0.005, 0.08], [0.09, 0.02, 0.02], [0.07, 0.07, 0]], 0.003, C.leather(0x3a2616));
  return g;
}
export function projector8mm() {
  const g = new THREE.Group();
  RB(g, 0.24, 0.16, 0.12, 0.012, metal(0x6a6e72, 0.4), 0, 0.08, 0);
  CY(g, 0.028, 0.03, 0.08, C.chrome(), 0.14, 0.09, 0, 0, 0, Math.PI / 2, 24);
  CY(g, 0.022, 0.022, 0.002, glass(0x3a4a6a, 0.9), 0.181, 0.09, 0, 0, 0, Math.PI / 2, 24);
  for (const [x, a] of [[-0.06, 0.4], [0.06, -0.4]]) {
    B(g, 0.01, 0.14, 0.01, C.steel(), x, 0.22, 0, 0, 0, a);
    const rl = grp(g, x + Math.sin(-a) * 0.08, 0.3, 0.0);
    CY(rl, 0.09, 0.09, 0.012, C.silver(), 0, 0, 0, Math.PI / 2, 0, 0, 40);
    CY(rl, 0.06, 0.06, 0.014, mat(0x2a1a0a, { roughness: 0.4 }), 0, 0, 0, Math.PI / 2, 0, 0, 40);
    for (let i = 0; i < 3; i++) B(rl, 0.03, 0.012, 0.016, mat(0x4a4e52), Math.cos(i * 2.1) * 0.06, Math.sin(i * 2.1) * 0.06, 0, 0, 0, i * 2.1);
  }
  B(g, 0.03, 0.012, 0.005, emissive(0xff4411, 0.8), -0.08, 0.05, 0.061);
  return g;
}
export function coffeeGrinder() {
  const g = new THREE.Group();
  const w = C.wood(0x7a4a22);
  RB(g, 0.14, 0.13, 0.14, 0.006, w, 0, 0.065, 0);
  B(g, 0.1, 0.04, 0.004, C.darkWood(), 0, 0.04, 0.071);
  SP(g, 0.008, C.brass(), 0, 0.04, 0.078);
  LA(g, [[0.06, 0], [0.065, 0.005], [0.055, 0.04], [0.03, 0.06], [0.02, 0.065]], C.brass(), 0, 0.13, 0, 32);
  CY(g, 0.006, 0.006, 0.03, C.iron(), 0, 0.21, 0, 0, 0, 0, 8);
  B(g, 0.1, 0.008, 0.012, C.iron(), 0.04, 0.225, 0, 0, 0, 0);
  CY(g, 0.008, 0.01, 0.03, C.darkWood(), 0.09, 0.245, 0, 0, 0, 0, 12);
  return g;
}
export function pocketWatch(o = {}) {
  const g = new THREE.Group();
  const gd = o.metal ?? C.gold();
  const w = grp(g, 0, 0.03, 0, -1.1);
  CY(w, 0.025, 0.025, 0.012, gd, 0, 0, 0, Math.PI / 2, 0, 0, 40);
  TO(w, 0.025, 0.003, gd, 0, 0, 0.006, 0, 0, 0, Math.PI * 2, 48);
  P(w, 0.044, 0.044, canvasTex('dialroman', 256, 256, (c, W) => {
    c.fillStyle = '#f7f2e4'; c.beginPath(); c.arc(128, 128, 128, 0, 7); c.fill();
    c.strokeStyle = '#222'; c.lineWidth = 3; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.stroke();
    c.fillStyle = '#111'; c.font = 'bold 26px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
    ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((t, i) => { const a = i / 12 * 6.283 - 1.571; c.fillText(t, 128 + Math.cos(a) * 95, 128 + Math.sin(a) * 95); });
    c.lineWidth = 6; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 40, 128 - 50); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 - 20, 128 + 78); c.stroke();
    c.beginPath(); c.arc(128, 170, 18, 0, 7); c.lineWidth = 1.5; c.stroke();
  }), 0, 0, 0.0065, 0, 0, 0, { transparent: true, alphaTest: 0.2 });
  CY(w, 0.0015, 0.0015, 0.001, glass(0xffffff, 0.3), 0, 0, 0.0072, Math.PI / 2, 0, 0, 30).scale.set(15, 1, 15);
  CY(w, 0.004, 0.004, 0.006, gd, 0, 0.029, 0, 0, 0, 0, 12);
  TO(w, 0.007, 0.0015, gd, 0, 0.036, 0, 0, 0, 0);
  for (let i = 0; i < 18; i++) TO(g, 0.004, 0.0009, gd, 0.01 + i * 0.006, 0.003, -0.02 + Math.sin(i * 0.5) * 0.01, Math.PI / 2, i % 2 ? Math.PI / 2 : 0, 0, Math.PI * 2, 10);
  RB(g, 0.1, 0.012, 0.08, 0.005, mat(0x3a0a18, { roughness: 1 }), 0, -0.006, 0);
  return g;
}
export function sewingMachine() {
  const g = new THREE.Group();
  RB(g, 0.42, 0.04, 0.2, 0.006, C.wood(0x6b3a1c), 0, 0.02, 0);
  const bd = glossy(0x0e0e0e);
  B(g, 0.34, 0.03, 0.12, bd, 0, 0.055, 0);
  B(g, 0.06, 0.2, 0.08, bd, 0.14, 0.17, 0);
  RB(g, 0.3, 0.07, 0.08, 0.03, bd, 0.02, 0.27, 0);
  B(g, 0.05, 0.1, 0.06, bd, -0.12, 0.2, 0);
  CY(g, 0.002, 0.002, 0.04, C.chrome(), -0.12, 0.13, 0.01, 0, 0, 0, 6);
  CY(g, 0.055, 0.055, 0.02, C.chrome(), 0.2, 0.25, 0, 0, 0, Math.PI / 2, 32);
  CY(g, 0.01, 0.01, 0.03, C.gold(), 0.02, 0.32, 0, 0, 0, 0, 12);
  P(g, 0.2, 0.035, lbl('SINGER', { bg: '#0e0e0e', fg: '#d8b04a', w: 512, h: 90, font: 'bold 70px Georgia' }), 0.0, 0.27, 0.041);
  for (let i = 0; i < 14; i++) SP(g, 0.004, C.gold(), -0.1 + i * 0.02, 0.24 + Math.sin(i) * 0.008, 0.041, 1, 1, 0.3, 6);
  return g;
}
export function pharmacyScale() {
  const g = new THREE.Group();
  const br = C.brass();
  RB(g, 0.3, 0.04, 0.14, 0.006, C.marble(), 0, 0.02, 0);
  CY(g, 0.012, 0.018, 0.26, br, 0, 0.17, 0, 0, 0, 0, 16);
  SP(g, 0.018, br, 0, 0.31, 0);
  B(g, 0.32, 0.008, 0.01, br, 0, 0.31, 0);
  CO(g, 0.012, 0.06, br, 0, 0.35, 0, 0, 0, 0, 12);
  for (const s of [-1, 1]) {
    for (let k = 0; k < 3; k++) { const a = k * 2.094; CY(g, 0.001, 0.001, 0.2, br, s * 0.155 + Math.cos(a) * 0.025, 0.21, Math.sin(a) * 0.025, Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1, 4); }
    LA(g, [[0, 0], [0.05, 0.004], [0.055, 0.015]], metal(0xb58a3c, 0.3, { side: THREE.DoubleSide }), s * 0.155, 0.1, 0, 24);
  }
  for (let i = 0; i < 4; i++) CY(g, 0.008 + i * 0.002, 0.009 + i * 0.002, 0.01 + i * 0.004, br, 0.08 + i * 0.025, 0.045, 0.045, 0, 0, 0, 12);
  return g;
}
export function enigma() {
  const g = new THREE.Group();
  const wd = C.wood(0x5a3a1c);
  RB(g, 0.34, 0.13, 0.28, 0.006, wd, 0, 0.065, 0);
  B(g, 0.32, 0.004, 0.26, mat(0x222222), 0, 0.131, 0);
  const kb = grp(g, 0, 0.133, 0.07);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9 - (r === 2 ? 1 : 0); i++) { const x = -0.12 + i * 0.03 + r * 0.01, z = r * 0.025; CY(kb, 0.009, 0.009, 0.004, C.black(), x, 0.012, z, 0, 0, 0, 16); CY(kb, 0.008, 0.008, 0.001, mat(0xf2f0e8), x, 0.0145, z, 0, 0, 0, 16); CY(kb, 0.0015, 0.0015, 0.012, C.steel(), x, 0.005, z, 0, 0, 0, 5); }
  const lb = grp(g, 0, 0.133, -0.03);
  for (let r = 0; r < 3; r++) for (let i = 0; i < 9 - (r === 2 ? 1 : 0); i++) CY(lb, 0.008, 0.008, 0.002, i === 3 && r === 1 ? emissive(0xffe070, 1.5) : mat(0xe8dcb0, { roughness: 0.3, transparent: true, opacity: 0.8 }), -0.12 + i * 0.03 + r * 0.01, 0.002, r * 0.022, 0, 0, 0, 16);
  for (let i = 0; i < 3; i++) { CY(g, 0.028, 0.028, 0.018, C.steel(), -0.03 + i * 0.03, 0.14, -0.1, 0, 0, Math.PI / 2, 26); CY(g, 0.029, 0.029, 0.004, mat(0xf2f0e8), -0.03 + i * 0.03 - 0.009, 0.14, -0.1, 0, 0, Math.PI / 2, 26); }
  const plug = grp(g, 0, 0.03, 0.141);
  for (let i = 0; i < 13; i++) for (let r = 0; r < 2; r++) CY(plug, 0.003, 0.003, 0.004, C.black(), -0.13 + i * 0.022, r * 0.02, 0, Math.PI / 2, 0, 0, 8);
  TU(g, [[-0.08, 0.05, 0.145], [-0.05, 0.02, 0.17], [0.03, 0.03, 0.16], [0.05, 0.03, 0.145]], 0.002, mat(0xd8282a));
  const lid = grp(g, 0, 0.13, -0.14, -1.9);
  RB(lid, 0.34, 0.03, 0.28, 0.006, wd, 0, 0.015, 0.14);
  return g;
}
export function lantern(o = {}) {
  const g = new THREE.Group();
  const m = metal(o.color ?? 0xa8201a, 0.45);
  CY(g, 0.08, 0.085, 0.05, m, 0, 0.025, 0, 0, 0, 0, 32);
  LA(g, [[0.02, 0], [0.05, 0.02], [0.065, 0.07], [0.05, 0.12], [0.025, 0.14]], glass(0xfff0d0, 0.35), 0, 0.05, 0, 32);
  SP(g, 0.012, emissive(0xffb040, o.lit ? 2.5 : 0.6), 0, 0.1, 0, 0.6, 1.3, 0.6);
  for (let i = 0; i < 4; i++) { const a = i / 4 * 6.28; CY(g, 0.003, 0.003, 0.17, m, Math.cos(a) * 0.075, 0.13, Math.sin(a) * 0.075, 0, 0, 0, 6); }
  CY(g, 0.05, 0.075, 0.03, m, 0, 0.21, 0, 0, 0, 0, 24);
  CY(g, 0.02, 0.03, 0.03, m, 0, 0.24, 0, 0, 0, 0, 16);
  TO(g, 0.06, 0.003, C.steel(), 0, 0.26, 0, 0, 0, 0, Math.PI, 24);
  return g;
}
let _dial = null;
export function dialTex() { if (!_dial) { pocketWatch(); _dial = canvasTex('dialroman'); } return _dial; }
export function telescope(o = {}) {
  const g = new THREE.Group();
  const wd = C.wood(0x6b3a1c);
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28; CY(g, 0.012, 0.016, 0.9, wd, Math.cos(a) * 0.18, 0.42, Math.sin(a) * 0.18, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4, 10); }
  CY(g, 0.04, 0.04, 0.05, C.brass(), 0, 0.85, 0, 0, 0, 0, 20);
  const t = grp(g, 0, 0.9, 0, 0, 0, 0.45);
  const m = o.future ? metal(0x2a2e3a, 0.2) : C.brass();
  CY(t, 0.055, 0.05, 0.6, m, 0, 0.2, 0, 0, 0, 0, 32);
  CY(t, 0.035, 0.035, 0.25, m, 0, -0.2, 0, 0, 0, 0, 24);
  CY(t, 0.02, 0.02, 0.1, C.black(), 0, -0.36, 0, 0, 0, 0, 16);
  TO(t, 0.057, 0.006, C.brass(), 0, 0.49, 0, Math.PI / 2, 0, 0, Math.PI * 2, 32);
  CY(t, 0.05, 0.05, 0.002, o.future ? emissive(0x7a4aff, 2) : glass(0x3a5a8a, 0.8), 0, 0.5, 0, 0, 0, 0, 32);
  if (o.future) for (let i = 0; i < 4; i++) TO(t, 0.07, 0.004, emissive(0x7a4aff, 1.5), 0, 0.05 + i * 0.12, 0, Math.PI / 2, 0, 0, Math.PI * 2, 32);
  CY(t, 0.012, 0.012, 0.18, m, 0.07, 0.25, 0, 0, 0, 0, 12);
  return g;
}
export function vintageLamp() {
  const g = new THREE.Group();
  LA(g, [[0, 0], [0.09, 0], [0.09, 0.015], [0.03, 0.03], [0.02, 0.06], [0.015, 0.3], [0.03, 0.32], [0.012, 0.34], [0, 0.34]], C.brass(), 0, 0, 0, 32);
  LA(g, [[0.16, 0], [0.155, 0.01], [0.08, 0.18], [0.075, 0.19]], mat(0xe8d6a8, { roughness: 1, side: THREE.DoubleSide, emissive: 0xffc070, emissiveIntensity: 0.25 }), 0, 0.26, 0, 40);
  SP(g, 0.03, emissive(0xffe0a0, 1.2), 0, 0.33, 0);
  TO(g, 0.16, 0.004, C.brass(), 0, 0.26, 0, Math.PI / 2, 0, 0, Math.PI * 2, 40);
  for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28; CY(g, 0.003, 0.003, 0.03, mat(0xc9a441, { roughness: 0.6 }), Math.cos(a) * 0.16, 0.245, Math.sin(a) * 0.16, 0, 0, 0, 4); }
  return g;
}
export function chandelier() {
  const g = new THREE.Group();
  const gd = C.gold();
  CY(g, 0.01, 0.01, 0.4, gd, 0, 0.5, 0, 0, 0, 0, 8);
  LA(g, [[0, 0], [0.05, 0.02], [0.07, 0.08], [0.04, 0.14], [0.02, 0.2], [0, 0.22]], gd, 0, 0.1, 0, 24);
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.28, x = Math.cos(a) * 0.22, z = Math.sin(a) * 0.22;
    TU(g, [[0, 0.2, 0], [x * 0.5, 0.12, z * 0.5], [x, 0.18, z]], 0.007, gd);
    CY(g, 0.03, 0.02, 0.02, gd, x, 0.19, z, 0, 0, 0, 16);
    CY(g, 0.01, 0.01, 0.06, mat(0xf8f4ea), x, 0.23, z, 0, 0, 0, 10);
    SP(g, 0.008, emissive(0xffc060, 2), x, 0.27, z, 1, 1.6, 1);
    for (let k = 0; k < 3; k++) add(g, new THREE.OctahedronGeometry(0.014), glass(0xf2f8ff, 0.55), x * 0.9, 0.14 - k * 0.025, z * 0.9);
  }
  for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; add(g, new THREE.OctahedronGeometry(0.012), glass(0xf2f8ff, 0.55), Math.cos(a) * 0.1, 0.08, Math.sin(a) * 0.1); }
  CY(g, 0.12, 0.14, 0.02, C.darkWood(), 0, 0.01, 0, 0, 0, 0, 24);
  return g;
}
export function fountainPen() {
  const g = new THREE.Group();
  B(g, 0.18, 0.02, 0.08, C.darkWood(), 0, 0.01, 0);
  CY(g, 0.012, 0.012, 0.06, mat(0x1a2a5a, { roughness: 0.2, env: true, envI: 0.6 }), 0.05, 0.05, 0, 0, 0, 0, 16);
  const pen = grp(g, -0.02, 0.035, 0.0, 0, 0.2, Math.PI / 2 - 0.2);
  CY(pen, 0.0065, 0.006, 0.11, mat(0x0e0e0e, { roughness: 0.15, env: true, envI: 0.6 }), 0, 0, 0, 0, 0, 0, 20);
  TO(pen, 0.0066, 0.0012, C.gold(), 0, 0.02, 0, Math.PI / 2, 0, 0);
  CO(pen, 0.005, 0.025, C.gold(), 0, -0.068, 0, Math.PI, 0, 0, 16);
  B(pen, 0.002, 0.04, 0.002, C.gold(), 0.007, 0.04, 0);
  return g;
}
export function safe(o = {}) {
  const g = new THREE.Group();
  const m = metal(o.color ?? 0x2a3a2a, 0.45);
  RB(g, 0.42, 0.5, 0.4, 0.02, m, 0, 0.27, 0);
  for (const [x, z] of [[-0.18, -0.16], [0.18, -0.16], [-0.18, 0.16], [0.18, 0.16]]) CY(g, 0.025, 0.02, 0.04, C.iron(), x, 0.02, z, 0, 0, 0, 12);
  const door = grp(g, -0.18, 0.27, 0.2, 0, o.open ? -1.6 : 0);
  RB(door, 0.36, 0.44, 0.03, 0.01, m, 0.18, 0, 0.015);
  const orn = canvasTex('safeorn', 256, 320, (c, w, h) => { c.fillStyle = '#2a3a2a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d8b04a'; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28); c.lineWidth = 2; c.strokeRect(26, 26, w - 52, h - 52); c.fillStyle = '#d8b04a'; c.font = 'italic bold 30px Georgia'; c.textAlign = 'center'; c.fillText('Hnos. Garza', w / 2, 70); c.font = '18px Georgia'; c.fillText('Monterrey · 1912', w / 2, h - 40); });
  P(door, 0.34, 0.42, orn, 0.18, 0, 0.031);
  CY(door, 0.045, 0.045, 0.02, C.chrome(), 0.18, 0.02, 0.04, Math.PI / 2, 0, 0, 32);
  for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28; B(door, 0.002, 0.008, 0.002, C.black(), 0.18 + Math.cos(a) * 0.04, 0.02 + Math.sin(a) * 0.04, 0.051, 0, 0, a); }
  B(door, 0.012, 0.08, 0.012, C.chrome(), 0.3, 0.0, 0.04);
  if (o.open) {
    B(g, 0.38, 0.46, 0.005, mat(0x3a0a18, { roughness: 1 }), 0, 0.27, -0.18);
    B(g, 0.37, 0.008, 0.36, m, 0, 0.27, 0);
    for (let i = 0; i < 6; i++) goldBar(g, -0.1 + (i % 3) * 0.1, 0.06 + Math.floor(i / 3) * 0.035, 0.0, 0.5);
    for (let i = 0; i < 4; i++) B(g, 0.12, 0.03, 0.06, mat(0x3a7a3a, { roughness: 0.9 }), -0.08 + (i % 2) * 0.14, 0.29 + Math.floor(i / 2) * 0.032, 0.02);
  }
  return g;
}
export function goldBar(g, x, y, z, s = 1) {
  const pts = [[-0.06, 0], [0.06, 0], [0.05, 0.03], [-0.05, 0.03]].map(([a, b]) => [a * s * 1.6, b * s * 1.2]);
  const bar = EX(g, pts, 0.05 * s * 1.3, C.gold(), x, y, z, 0, 0, 0, 0.003);
  return bar;
}

// =====================================================================
//  COTIDIANOS (aparatos)
// =====================================================================
export function tvOld() {
  const g = new THREE.Group();
  const wd = C.wood(0x6b3a1c);
  for (const [x, z] of [[-0.2, -0.12], [0.2, -0.12], [-0.2, 0.12], [0.2, 0.12]]) CY(g, 0.012, 0.008, 0.2, wd, x, 0.1, z, 0, 0, 0, 8);
  RB(g, 0.56, 0.42, 0.36, 0.02, wd, 0, 0.41, 0);
  RB(g, 0.34, 0.28, 0.02, 0.05, plastic(0x2a2a2a), -0.06, 0.43, 0.175);
  P(g, 0.3, 0.24, screenTex('tv'), -0.06, 0.43, 0.186, 0, 0, 0, { glow: 0.5, rough: 0.1 });
  for (const y of [0.52, 0.44]) CY(g, 0.022, 0.022, 0.02, plastic(0xd8d0b8), 0.19, y, 0.18, Math.PI / 2, 0, 0, 20);
  grid(g, 3, 5, 0.02, 0.015, (x, y) => B(g, 0.015, 0.006, 0.004, C.black(), 0.19 + x, 0.33 + y, 0.18));
  for (const s of [-1, 1]) CY(g, 0.003, 0.003, 0.35, C.chrome(), s * 0.08, 0.76, -0.05, 0, 0, s * 0.45, 6);
  SP(g, 0.03, C.black(), 0, 0.63, -0.05, 1, 0.6, 1);
  return g;
}
export function remote() {
  const g = new THREE.Group();
  RB(g, 0.05, 0.02, 0.17, 0.008, plastic(0x2a2a2a), 0, 0.01, 0);
  grid(g, 3, 6, 0.013, 0.013, (x, z) => RB(g, 0.01, 0.004, 0.008, 0.002, plastic(0x777777), x, 0.021, z + 0.02));
  CY(g, 0.006, 0.006, 0.004, plastic(0xd8282a), -0.012, 0.021, -0.06, 0, 0, 0, 12);
  return g;
}
export function deskFan() {
  const g = new THREE.Group();
  const m = metal(0x3a6a5a, 0.4);
  CY(g, 0.1, 0.11, 0.03, m, 0, 0.015, 0, 0, 0, 0, 32);
  CY(g, 0.012, 0.012, 0.22, m, 0, 0.14, 0, 0, 0, 0, 12);
  const h = grp(g, 0, 0.27, 0, -0.15);
  RB(h, 0.08, 0.08, 0.1, 0.03, m, 0, 0, -0.04);
  for (let i = 0; i < 4; i++) { const b = SP(h, 0.06, C.brass(), Math.cos(i * 1.57) * 0.06, Math.sin(i * 1.57) * 0.06, 0.03, 1, 0.5, 0.08); b.rotation.z = i * 1.57; }
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; TU(h, [[0, 0, 0.07], [Math.cos(a) * 0.11, Math.sin(a) * 0.11, 0.04], [Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.0]], 0.0015, C.chrome()); }
  TO(h, 0.12, 0.003, C.chrome(), 0, 0, 0.0, 0, 0, 0, Math.PI * 2, 40);
  TO(h, 0.06, 0.002, C.chrome(), 0, 0, 0.06, 0, 0, 0, Math.PI * 2, 24);
  return g;
}
export function mokaPot() {
  const g = new THREE.Group();
  const al = metal(0xb8bcc0, 0.35);
  const oct = (r0, r1, h, y) => CY(g, r1, r0, h, al, 0, y, 0, 0, 0, 0, 8);
  oct(0.055, 0.042, 0.08, 0.04); oct(0.04, 0.05, 0.1, 0.13);
  CO(g, 0.05, 0.03, al, 0, 0.195, 0, 0, 0, 0, 8);
  SP(g, 0.008, plastic(0x111111), 0, 0.212, 0);
  TU(g, [[0.045, 0.17, 0], [0.09, 0.17, 0], [0.085, 0.1, 0], [0.045, 0.1, 0]], 0.008, plastic(0x111111));
  CO(g, 0.012, 0.03, al, -0.05, 0.17, 0, 0, 0, 0.6, 8);
  return g;
}
export function mug(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('mug' + (o.seed ?? 1), 256, 128, (c, w, h) => { c.fillStyle = o.bg ?? '#f4f0e6'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8282a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(25 + i * 52, h / 2, 16, 0, 7); c.fill(); } c.fillStyle = '#2a6a3a'; c.fillRect(0, h - 12, w, 6); c.fillRect(0, 6, w, 6); });
  CY(g, 0.042, 0.038, 0.095, [mat(0xffffff, { map: tex, roughness: 0.15, env: true, envI: 0.6 }), C.porcelain(), C.porcelain()], 0, 0.0475, 0, 0, 0, 0, 32);
  CY(g, 0.036, 0.036, 0.002, mat(0x2a1a0a, { roughness: 0.1 }), 0, 0.085, 0, 0, 0, 0, 24);
  TO(g, 0.025, 0.007, C.porcelain(), 0.045, 0.05, 0, 0, 0, 0, Math.PI, 16).rotation.z = -Math.PI / 2;
  return g;
}
export function plate(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('plate', 256, 256, (c, w, h) => {
    c.fillStyle = '#f7f4ec'; c.beginPath(); c.arc(128, 128, 128, 0, 7); c.fill();
    c.strokeStyle = '#1f3f9a'; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 112, 0, 7); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.arc(128, 128, 70, 0, 7); c.stroke();
    c.fillStyle = '#1f3f9a'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; c.beginPath(); c.ellipse(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92, 10, 5, a, 0, 7); c.fill(); }
    c.fillRect(100, 110, 56, 30); c.beginPath(); c.moveTo(94, 110); c.lineTo(128, 80); c.lineTo(162, 110); c.fill();
  });
  const p = grp(g, 0, 0.12, -0.01, -0.25);
  LA(p, [[0, 0], [0.07, 0], [0.11, 0.012], [0.12, 0.016]], C.porcelain(), 0, 0, 0, 48).rotation.x = Math.PI / 2;
  P(p, 0.238, 0.238, tex, 0, 0, 0.004, 0, 0, 0, { transparent: true, alphaTest: 0.2, rough: 0.15 });
  B(g, 0.16, 0.012, 0.06, C.darkWood(), 0, 0.006, 0.02);
  B(g, 0.02, 0.2, 0.012, C.darkWood(), 0, 0.1, -0.05, -0.2);
  return g;
}
export function tinBox(o = {}) {
  const g = new THREE.Group();
  const tex = artTex(o.seed ?? 14, 'nouveau', 256, 180, o.title ?? 'GALLETAS');
  RB(g, 0.22, 0.08, 0.15, 0.012, [metal(0xc8282a, 0.35)], 0, 0.04, 0);
  RB(g, 0.225, 0.02, 0.155, 0.01, metal(0xc8282a, 0.35), 0, 0.085, 0);
  P(g, 0.19, 0.13, tex, 0, 0.0955, 0, -Math.PI / 2, 0, 0, { rough: 0.3 });
  return g;
}
export function thermos() {
  const g = new THREE.Group();
  LA(g, [[0, 0], [0.04, 0], [0.042, 0.01], [0.042, 0.22], [0.035, 0.24], [0.03, 0.25]], metal(0x2a6a4a, 0.35), 0, 0, 0, 32);
  CY(g, 0.044, 0.044, 0.06, C.steel(), 0, 0.27, 0, 0, 0, 0, 32);
  B(g, 0.004, 0.14, 0.02, C.steel(), 0.046, 0.12, 0);
  P(g, 0.06, 0.03, lbl('ACAMPA', { bg: '#2a6a4a', fg: '#e8e0c8', w: 256, h: 128, font: 'bold 56px system-ui' }), 0, 0.12, 0.043);
  return g;
}
export function flashlight() {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.025, 0, 0, 0, Math.PI / 2);
  CY(d, 0.018, 0.018, 0.16, metal(0x3a3e42, 0.35), 0, 0, 0, 0, 0, 0, 20);
  CY(d, 0.028, 0.018, 0.05, C.chrome(), 0, 0.1, 0, 0, 0, 0, 24);
  CY(d, 0.026, 0.026, 0.002, glass(0xfffbe8, 0.7), 0, 0.126, 0, 0, 0, 0, 24);
  B(d, 0.012, 0.02, 0.008, plastic(0xd8282a), 0, 0.03, 0.018);
  for (let i = 0; i < 8; i++) TO(d, 0.018, 0.0015, C.black(), 0, -0.05 + i * 0.01, 0, Math.PI / 2, 0, 0, Math.PI * 2, 20);
  return g;
}
export function lighter() {
  const g = new THREE.Group();
  RB(g, 0.038, 0.035, 0.013, 0.004, C.chrome(), 0, 0.0175, 0);
  const lid = grp(g, 0.019, 0.035, 0, 0, 0, 0.9);
  RB(lid, 0.038, 0.02, 0.013, 0.004, C.chrome(), -0.019, 0.01, 0);
  CY(g, 0.008, 0.008, 0.012, C.chrome(), 0.0, 0.042, 0, 0, 0, 0, 12);
  CY(g, 0.006, 0.006, 0.004, C.steel(), 0.01, 0.045, 0, Math.PI / 2, 0, 0, 12);
  SP(g, 0.006, emissive(0xffa030, 2), 0.0, 0.058, 0, 0.7, 1.8, 0.7);
  return g;
}
export function payphone() {
  const g = new THREE.Group();
  CY(g, 0.03, 0.035, 1.1, metal(0x2a3a8a, 0.4), 0, 0.55, -0.05, 0, 0, 0, 12);
  RB(g, 0.3, 0.45, 0.14, 0.02, metal(0x2a3a8a, 0.4), 0, 1.15, 0);
  B(g, 0.22, 0.1, 0.004, plastic(0x1a1a1a), 0, 1.3, 0.071);
  P(g, 0.2, 0.08, lbl('TELÉFONO', { bg: '#f2c230', fg: '#1a1a1a', w: 512, h: 200, font: 'bold 100px system-ui', sub: 'LADA 01', subFont: 'bold 60px system-ui' }), 0, 1.3, 0.074);
  grid(g, 3, 4, 0.035, 0.03, (x, y) => RB(g, 0.026, 0.022, 0.01, 0.004, C.chrome(), x - 0.04, y + 1.12, 0.074));
  B(g, 0.03, 0.006, 0.005, C.black(), 0.09, 1.2, 0.072);
  const hs = grp(g, 0.11, 1.08, 0.08);
  CY(hs, 0.014, 0.014, 0.18, plastic(0x111111), 0, 0, 0, 0, 0, 0, 12);
  for (const s of [-1, 1]) CY(hs, 0.024, 0.02, 0.03, plastic(0x111111), 0, s * 0.09, 0.012, Math.PI / 2, 0, 0, 16);
  TU(g, [[0.11, 0.99, 0.08], [0.13, 0.9, 0.1], [0.08, 0.95, 0.07]], 0.004, C.steel());
  CY(g, 0.16, 0.18, 0.04, metal(0x2a2a2a, 0.5), 0, 0.02, -0.05, 0, 0, 0, 24);
  return g;
}
export function digitalWatch(o = {}) {
  const g = new THREE.Group();
  const w = grp(g, 0, 0.04, 0);
  TO(w, 0.035, 0.009, o.band ?? plastic(0x1a1a1a), 0, 0, 0, 0, 0, 0, Math.PI * 2, 32).scale.set(1, 1.25, 1.2);
  RB(w, 0.036, 0.04, 0.014, 0.004, o.case ?? C.silver(), 0, 0.045, 0.008, -1.4);
  P(w, 0.026, 0.016, lbl('12:08', { bg: '#b9c2a4', fg: '#1d2618', w: 256, h: 150, font: 'bold 110px monospace' }), 0, 0.053, 0.0, -Math.PI / 2 + 0.17);
  return g;
}
export function coffeeMaker() { return mokaPot(); }

// ---------- relojes: esfera fina reutilizable ----------
function dialFace(key, o = {}) {
  return canvasTex('dialF|' + key, 512, 512, (c, w, h) => {
    const cx = w / 2, cy = h / 2, R = w / 2;
    const g0 = c.createRadialGradient(cx, cy * 0.9, 10, cx, cy, R); g0.addColorStop(0, o.bg ?? '#fbf6e6'); g0.addColorStop(1, o.bg2 ?? '#e9dcbc');
    c.fillStyle = g0; c.fillRect(0, 0, w, h);
    c.strokeStyle = o.ink ?? '#1a1410'; c.fillStyle = o.ink ?? '#1a1410';
    c.lineWidth = 3; for (const r of [0.94, 0.86, 0.6]) { c.beginPath(); c.arc(cx, cy, R * r, 0, 7); c.stroke(); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2; c.lineWidth = i % 5 ? 2 : 5; c.beginPath(); c.moveTo(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86); c.lineTo(cx + Math.cos(a) * R * (i % 5 ? 0.9 : 0.94), cy + Math.sin(a) * R * (i % 5 ? 0.9 : 0.94)); c.stroke(); }
    const roman = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    c.font = `${o.arabic ? '600' : 'bold'} ${o.arabic ? 50 : 46}px ${o.arabic ? 'system-ui' : 'Georgia, serif'}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * Math.PI * 2 - Math.PI / 2;
      c.save(); c.translate(cx + Math.cos(a) * R * 0.73, cy + Math.sin(a) * R * 0.73); if (!o.arabic) c.rotate(a + Math.PI / 2);
      c.fillText(o.arabic ? String(i || 12) : roman[i], 0, 0); c.restore();
    }
    if (o.maker) { c.font = 'italic 600 30px Georgia, serif'; c.fillText(o.maker, cx, cy - R * 0.3); c.font = '600 18px system-ui'; c.fillText(o.sub ?? 'PARIS', cx, cy + R * 0.32); }
    c.globalAlpha = 0.08; for (let i = 0; i < 200; i++) { c.fillStyle = i % 2 ? '#7a5a2a' : '#fff'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 0, 7); c.fill(); } c.globalAlpha = 1;
  });
}
// esfera completa (bisel de latón, cristal abombado y agujas) mirando a +z
export function clockFace(g, x, y, z, r, o = {}) {
  const f = grp(g, x, y, z);
  const br = o.bezel ?? C.brass();
  add(f, latheGeo([[r * 0.93, 0], [r * 1.06, 0], [r * 1.1, 0.004], [r * 1.07, 0.009], [r * 0.99, 0.011], [r * 0.95, 0.007]], 64), br, 0, 0, 0, Math.PI / 2);
  add(f, new THREE.CircleGeometry(r * 0.95, 64), mat(0xffffff, { map: dialFace(o.key ?? 'std', o), roughness: 0.55 }), 0, 0, 0.0015);
  const hands = new Acc();
  const hand = (len, wid, ang, zz) => {
    const s = new THREE.Shape(); s.moveTo(-wid * 0.5, -len * 0.18); s.lineTo(wid * 0.5, -len * 0.18); s.lineTo(wid * 0.35, len * 0.55); s.lineTo(wid * 0.9, len * 0.7); s.lineTo(0, len); s.lineTo(-wid * 0.9, len * 0.7); s.lineTo(-wid * 0.35, len * 0.55); s.closePath();
    hands.put(slab(s, 0.0008), 0, 0, zz, 0, 0, ang);
  };
  hand(r * 0.52, r * 0.07, 2.0 - 0.26, 0.003); hand(r * 0.78, r * 0.05, -1.05, 0.0039);
  hands.put(new THREE.CylinderGeometry(r * 0.04, r * 0.04, 0.003, 14), 0, 0, 0.0045, Math.PI / 2);
  hands.mesh(f, metal(0x14161c, 0.35));
  const R = r * 2.2, th = Math.asin(r * 0.95 / R);
  const dome = add(f, new THREE.SphereGeometry(R, 40, 6, 0, Math.PI * 2, 0, th), glass(0xffffff, 0.12), 0, 0, 0.011 - R, Math.PI / 2);
  dome.castShadow = false;
  return f;
}
const finial = (g, x, y, z, s, m) => add(g, latheGeo([[0, 0], [0.012 * s, 0], [0.014 * s, 0.006 * s], [0.006 * s, 0.012 * s], [0.011 * s, 0.022 * s], [0.004 * s, 0.036 * s], [0.006 * s, 0.042 * s], [0, 0.05 * s]], 20), m, x, y, z);

export function mantelClock() {
  const g = new THREE.Group();
  const wd = mat(0x4a1e0c, { map: C.wood(0x4a1e0c).map, roughness: 0.25, env: true, envI: 0.5 }), br = C.brass();
  for (const [x, z] of [[-0.19, -0.05], [0.19, -0.05], [-0.19, 0.05], [0.19, 0.05]]) add(g, latheGeo([[0, 0], [0.012, 0.001], [0.016, 0.006], [0.012, 0.012], [0, 0.013]], 18), br, x, 0, z);
  RB(g, 0.44, 0.022, 0.14, 0.006, wd, 0, 0.024, 0);
  RB(g, 0.42, 0.014, 0.13, 0.005, wd, 0, 0.041, 0);
  const s = new THREE.Shape();
  s.moveTo(-0.2, 0); s.lineTo(0.2, 0); s.lineTo(0.2, 0.06); s.bezierCurveTo(0.2, 0.1, 0.15, 0.11, 0.11, 0.135);
  s.bezierCurveTo(0.075, 0.16, 0.06, 0.215, 0, 0.215); s.bezierCurveTo(-0.06, 0.215, -0.075, 0.16, -0.11, 0.135);
  s.bezierCurveTo(-0.15, 0.11, -0.2, 0.1, -0.2, 0.06); s.closePath();
  add(g, slab(s, 0.11, 0.007, 3, 24), wd, 0, 0.048, -0.055);
  // filete de latón siguiendo el contorno
  const pts = s.getSpacedPoints(120).map(p => [p.x * 0.955, p.y * 0.94 + 0.006]);
  add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(([x, y]) => new THREE.Vector3(x, y + 0.048, 0.0555)), true), 160, 0.0016, 5, true), br);
  clockFace(g, 0, 0.048 + 0.122, 0.056, 0.068, { key: 'mantel', maker: 'Le Roy', sub: 'PARIS' });
  // ornamentos laterales
  for (const sx of [-1, 1]) { add(g, new THREE.TorusGeometry(0.014, 0.0025, 8, 20), br, sx * 0.205, 0.09, 0, 0, Math.PI / 2); add(g, new THREE.SphereGeometry(0.005, 10, 8), br, sx * 0.204, 0.105, 0); }
  B(g, 0.24, 0.006, 0.004, br, 0, 0.062, 0.0575);
  return g;
}
export function wallClock() {
  const g = new THREE.Group();
  const wd = mat(0x4f2410, { map: C.wood(0x4f2410).map, roughness: 0.3, env: true, envI: 0.45 }), br = C.brass();
  const W = 0.3, D = 0.1;
  finial(g, 0, 0, 0, 1.1, wd).rotation.x = Math.PI; g.children.at(-1).position.y = 0.055;
  RB(g, W + 0.02, 0.05, D + 0.01, 0.008, wd, 0, 0.08, 0);
  RB(g, W, 0.016, D, 0.004, wd, 0, 0.113, 0);
  B(g, W - 0.02, 0.6, 0.01, mat(0x6a3a1a, { map: C.wood(0x6a3a1a).map, roughness: 0.6 }), 0, 0.42, -D / 2 + 0.006);
  for (const sx of [-1, 1]) RB(g, 0.024, 0.6, D, 0.004, wd, sx * (W / 2 - 0.012), 0.42, 0);
  RB(g, W, 0.016, D, 0.004, wd, 0, 0.728, 0);
  RB(g, W + 0.02, 0.05, D + 0.01, 0.008, wd, 0, 0.76, 0);
  const ped = new THREE.Shape(); ped.moveTo(-0.17, 0); ped.lineTo(0.17, 0); ped.lineTo(0.0, 0.08); ped.closePath();
  add(g, slab(ped, 0.03, 0.004), wd, 0, 0.785, 0.02);
  for (const x of [-0.15, 0, 0.15]) finial(g, x, x ? 0.785 : 0.86, 0.035, 0.8, br);
  // puerta de cristal con marco
  const zf = D / 2 + 0.002;
  for (const sx of [-1, 1]) B(g, 0.016, 0.6, 0.008, wd, sx * (W / 2 - 0.02), 0.42, zf);
  for (const y of [0.125, 0.715, 0.43]) B(g, W - 0.04, 0.016, 0.008, wd, 0, y, zf);
  add(g, new THREE.PlaneGeometry(W - 0.05, 0.58), glass(0xf2f6fa, 0.14), 0, 0.42, zf - 0.001).castShadow = false;
  clockFace(g, 0, 0.6, -D / 2 + 0.012, 0.095, { key: 'viena', maker: 'Viena', sub: 'REGULADOR' });
  // péndulo y pesas
  const p = new Acc();
  p.raw(rodGeo([0, 0.5, -0.03], [0, 0.2, -0.03], 0.002, 8));
  p.put(latheGeo([[0, -0.006], [0.038, -0.004], [0.042, 0], [0.038, 0.004], [0, 0.006]], 32), 0, 0.19, -0.028, Math.PI / 2);
  for (const sx of [-1, 1]) { p.raw(rodGeo([sx * 0.07, 0.5, -0.02], [sx * 0.07, 0.36, -0.02], 0.0008, 5)); p.put(latheGeo([[0, 0], [0.014, 0], [0.014, 0.1], [0.008, 0.106], [0, 0.106]], 20), sx * 0.07, 0.25, -0.02); }
  p.mesh(g, br);
  return g;
}
export function grandfatherClock() {
  const g = new THREE.Group();
  const wd = mat(0x4a1e0c, { map: C.wood(0x4a1e0c).map, roughness: 0.3, env: true, envI: 0.45 }), br = C.brass();
  for (const [x, z] of [[-0.21, -0.12], [0.21, -0.12], [-0.21, 0.12], [0.21, 0.12]]) RB(g, 0.06, 0.04, 0.06, 0.008, wd, x, 0.02, z);
  RB(g, 0.5, 0.3, 0.3, 0.008, wd, 0, 0.19, 0);
  RB(g, 0.36, 0.2, 0.01, 0.004, wd, 0, 0.19, 0.151);
  RB(g, 0.46, 0.03, 0.27, 0.006, wd, 0, 0.355, 0);
  // cintura con ventana
  RB(g, 0.38, 0.95, 0.24, 0.006, wd, 0, 0.845, 0);
  B(g, 0.2, 0.72, 0.006, glass(0xf2f6fa, 0.16), 0, 0.83, 0.121).castShadow = false;
  for (const sx of [-1, 1]) B(g, 0.018, 0.74, 0.012, wd, sx * 0.11, 0.83, 0.124);
  for (const y of [0.46, 1.2]) B(g, 0.238, 0.018, 0.012, wd, 0, y, 0.124);
  B(g, 0.19, 0.7, 0.004, mat(0x2a1208, { roughness: 0.8 }), 0, 0.83, 0.114);
  const p = new Acc();
  p.raw(rodGeo([0, 1.18, 0.1], [0, 0.6, 0.1], 0.0035, 8));
  p.put(latheGeo([[0, -0.01], [0.07, -0.007], [0.075, 0], [0.07, 0.007], [0, 0.01]], 36), 0, 0.58, 0.1, Math.PI / 2);
  for (const sx of [-1, 0, 1]) p.put(latheGeo([[0, 0], [0.022, 0], [0.022, 0.2], [0.012, 0.21], [0, 0.21]], 20), sx * 0.055, 0.9 + Math.abs(sx) * 0.05, 0.07);
  p.mesh(g, br);
  RB(g, 0.44, 0.03, 0.28, 0.006, wd, 0, 1.335, 0);
  // capucha con esfera arqueada
  RB(g, 0.46, 0.42, 0.29, 0.008, wd, 0, 1.56, 0);
  for (const sx of [-1, 1]) add(g, latheGeo([[0, 0], [0.018, 0], [0.018, 0.4], [0, 0.4]], 16), br, sx * 0.205, 1.36, 0.135);
  add(g, new THREE.PlaneGeometry(0.33, 0.33), mat(0xd9b860, { metalness: 0.7, roughness: 0.35 }), 0, 1.56, 0.1455);
  clockFace(g, 0, 1.56, 0.146, 0.135, { key: 'abuelo', maker: 'Tompion', sub: 'LONDRES' });
  const s = new THREE.Shape(); s.moveTo(-0.25, 0); s.lineTo(0.25, 0); s.lineTo(0.25, 0.05); s.bezierCurveTo(0.16, 0.06, 0.12, 0.18, 0.04, 0.17); s.lineTo(-0.04, 0.17); s.bezierCurveTo(-0.12, 0.18, -0.16, 0.06, -0.25, 0.05); s.closePath();
  add(g, slab(s, 0.3, 0.005), wd, 0, 1.77, -0.15);
  for (const x of [-0.2, 0, 0.2]) finial(g, x, x ? 1.82 : 1.945, 0.05, 1.2, br);
  return g;
}
export function macClassic() {
  const g = new THREE.Group();
  const b = plastic(0xe6dfcb, 0.5), b2 = plastic(0xd8cfb8, 0.55);
  const W = 0.246, Hh = 0.345, D = 0.27;
  // cuerpo: perfil lateral con frente inclinado
  const e = 0.012, side = new THREE.Shape(); side.moveTo(-D / 2 + e, e); side.lineTo(D / 2 - 0.015 - e, e); side.lineTo(D / 2 - e, 0.03); side.lineTo(D / 2 - 0.012 - e, Hh - e); side.lineTo(-D / 2 + 0.03, Hh - e); side.lineTo(-D / 2 + e, Hh - 0.05); side.closePath();
  add(g, slab(side, W, 0.012, 3), b, W / 2, 0, 0, 0, -Math.PI / 2);
  // bisel de pantalla rebajado
  const zf = D / 2 - 0.0082;
  const bez = new THREE.Shape(rrShape(0.2, 0.16, 0.02).getPoints(8)); bez.holes.push(rrPath(0.17, 0.128, 0.012));
  const bz = add(g, slab(bez, 0.006, 0.002), b2, 0, 0.235, zf - 0.001); bz.rotation.x = -0.035;
  add(g, new THREE.PlaneGeometry(0.17, 0.128), mat(0x101010, { roughness: 0.3 }), 0, 0.235, zf + 0.0008, -0.035);
  P(g, 0.152, 0.112, screenTex('mac'), 0, 0.235, zf + 0.0013, -0.035, 0, 0, { glow: 0.5 });
  add(g, new THREE.PlaneGeometry(0.168, 0.126), glass(0xeef4ff, 0.1), 0, 0.235, zf + 0.0022, -0.035).castShadow = false;
  // ranura de disquete, logo, rejilla
  B(g, 0.062, 0.005, 0.004, mat(0x1a1a1a), 0.04, 0.09, zf + 0.0045);
  B(g, 0.07, 0.012, 0.002, b2, 0.04, 0.09, zf + 0.004);
  P(g, 0.016, 0.018, canvasTex('macLogo', 64, 72, (c) => { const cols = ['#61bb46', '#fdb827', '#f5821f', '#e03a3e', '#963d97', '#009ddc']; cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(0, 10 + i * 10, 64, 10); }); c.globalCompositeOperation = 'destination-in'; c.beginPath(); c.arc(32, 44, 24, 0, 7); c.fill(); c.globalCompositeOperation = 'source-over'; c.fillStyle = '#61bb46'; c.fillRect(30, 2, 8, 12); }), -0.09, 0.06, zf + 0.0052, 0, 0, 0, { transparent: true, alphaTest: 0.3 });
  for (let i = 0; i < 9; i++) B(g, 0.004, 0.018, 0.004, mat(0x3a3630), -0.098 + i * 0.008, 0.315, -D / 2 + 0.004 + i * 0.0);
  for (let i = 0; i < 7; i++) B(g, 0.12, 0.003, 0.003, mat(0x8a8270), 0, 0.33 - i * 0.004 + 0.02, -0.05 - i * 0.012);
  B(g, 0.2, 0.006, 0.006, b2, 0, 0.012, D / 2 - 0.001);
  // teclado y ratón
  keyboard(g, 0, 0, 0.29, { w: 0.3, d: 0.11, cols: 13 });
  const mouse = grp(g, 0.21, 0, 0.3);
  RB(mouse, 0.055, 0.028, 0.09, 0.012, b, 0, 0.014, 0); B(mouse, 0.048, 0.002, 0.032, b2, 0, 0.0282, -0.02);
  cable(g, [[0.21, 0.015, 0.255], [0.19, 0.008, 0.2], [0.12, 0.008, 0.17], [0.07, 0.01, 0.13]]);
  return g;
}
export function polaroid() {
  const g = new THREE.Group();
  const blk = plastic(0x1b1b1b, 0.5), wht = plastic(0xf1efe8, 0.45);
  // perfil lateral en cuña (OneStep)
  const s = new THREE.Shape(); s.moveTo(-0.069, 0.006); s.lineTo(0.069, 0.006); s.lineTo(0.069, 0.114); s.lineTo(-0.03, 0.114); s.lineTo(-0.069, 0.08); s.closePath();
  add(g, slab(s, 0.112, 0.006, 3), blk, 0.056, 0, 0, 0, -Math.PI / 2);
  // frente blanco con franja arcoíris
  const zf = 0.075 + 0.0005;
  RB(g, 0.112, 0.1, 0.004, 0.003, wht, 0, 0.054, zf);
  P(g, 0.016, 0.1, canvasTex('rainbow', 32, 128, (c) => ['#e0262b', '#f39a1e', '#f6d21a', '#3ba64a', '#2e7fc1'].forEach((col, i) => { c.fillStyle = col; c.fillRect(i * 6.4, 0, 6.4, 128); })), 0, 0.054, zf + 0.0021);
  add(g, latheGeo([[0.024, 0], [0.026, 0.003], [0.024, 0.016], [0.018, 0.018], [0.014, 0.012]], 32), blk, -0.026, 0.06, zf + 0.002, Math.PI / 2);
  add(g, new THREE.SphereGeometry(0.03, 24, 8, 0, Math.PI * 2, 0, 0.5), glass(0x3a4a6a, 0.85), -0.026, 0.06, zf - 0.0085, Math.PI / 2);
  RB(g, 0.03, 0.016, 0.03, 0.004, blk, 0.03, 0.124, 0.05);
  B(g, 0.02, 0.01, 0.002, glass(0x9ab0c8, 0.6), 0.03, 0.124, 0.0655);
  add(g, latheGeo([[0, 0], [0.008, 0], [0.008, 0.004], [0.006, 0.006], [0, 0.0065]], 16), plastic(0xd8282a, 0.3), 0.035, 0.035, zf + 0.002, Math.PI / 2);
  B(g, 0.09, 0.004, 0.006, mat(0x0a0a0a), 0.0, 0.006, zf + 0.002);
  P(g, 0.04, 0.008, labelTex('OneStep', { bg: '#00000000', fg: '#222', w: 256, h: 50, font: 'italic bold 40px system-ui' }), 0.034, 0.012, zf + 0.0022, 0, 0, 0, { transparent: true });
  // foto saliendo
  const ph = grp(g, 0, 0.006, zf + 0.035, -0.06);
  B(ph, 0.088, 0.002, 0.07, mat(0xf4f2ec, { roughness: 0.8 }), 0, 0, 0);
  P(ph, 0.075, 0.05, artTex(5, 'landscape', 128, 96), 0, 0.0011, -0.004, -Math.PI / 2);
  return g;
}

export function rotaryPhone(o = {}) {
  const g = new THREE.Group();
  const m = glossy(o.color ?? 0x121212);
  // cuerpo: perfil lateral extruido a lo ancho con aristas muy redondeadas
  const e = 0.016, W = 0.215;
  const prof = outline([[-0.1, 0], [0.105, 0], [0.105, 0.012], [0.022, 0.112], [-0.085, 0.118], [-0.1, 0.1]]).inset(e);
  add(g, slab(polyShape(prof), W, e, 5, 16), m, W / 2, 0, 0, 0, -Math.PI / 2);
  RB(g, 0.2, 0.006, 0.19, 0.003, mat(0x1a1a1a, { roughness: 0.9 }), 0, 0.003, 0.002);
  // disco: placa de números + rueda con 10 agujeros + tope
  const ang = Math.atan2(0.083, 0.1), nz = Math.cos(ang), ny = Math.sin(ang);
  const dial = grp(g, 0, 0.062 + ny * 0.001, 0.0635 + nz * 0.001, -ang);
  const numT = canvasTex('rotnum', 256, 256, (c, w) => { c.fillStyle = '#f4f1e8'; c.beginPath(); c.arc(128, 128, 128, 0, 7); c.fill(); c.fillStyle = '#111'; c.font = 'bold 22px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 0; i < 10; i++) { const a = Math.PI * 0.62 + i * 0.5; c.fillText(String((i + 1) % 10), 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); c.font = '600 9px system-ui'; c.fillText('ABCDEFGHIJKLMNOPRSTUVWXY'.slice(i * 3 - 3, i * 3) || '', 128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92 + 15); c.font = 'bold 22px system-ui'; } c.fillStyle = '#c8282a'; c.beginPath(); c.arc(128, 128, 38, 0, 7); c.fill(); c.fillStyle = '#fff'; c.font = 'bold 14px system-ui'; c.fillText('555-0142', 128, 128); });
  add(dial, new THREE.CircleGeometry(0.046, 48), mat(0xffffff, { map: numT, roughness: 0.5 }), 0, 0, 0.0005);
  const wheel = new THREE.Shape(); wheel.absarc(0, 0, 0.046, 0, Math.PI * 2);
  for (let i = 0; i < 10; i++) { const a = -(Math.PI * 0.62 + i * 0.5); const h = new THREE.Path(); h.absarc(Math.cos(a) * 0.034, -Math.sin(a) * 0.034 * -1, 0.0075, 0, Math.PI * 2, true); wheel.holes.push(h); }
  const hole = new THREE.Path(); hole.absarc(0, 0, 0.017, 0, Math.PI * 2, true); wheel.holes.push(hole);
  add(dial, slab(wheel, 0.004, 0.001, 2, 24), mat(0xeef3f6, { roughness: 0.05, transparent: true, opacity: 0.45, env: true, envI: 1 }), 0, 0, 0.001).castShadow = false;
  add(dial, latheGeo([[0, 0.006], [0.012, 0.005], [0.016, 0.002], [0.017, 0]], 32), C.chrome(), 0, 0, 0.001, Math.PI / 2);
  add(dial, new THREE.BoxGeometry(0.003, 0.012, 0.006), C.chrome(), 0.042, -0.024, 0.004, 0, 0, 0.9);
  // horquilla y auricular
  for (const s of [-1, 1]) { add(g, latheGeo([[0, 0], [0.016, 0], [0.012, 0.028], [0.016, 0.032], [0, 0.034]], 18), m, s * 0.085, 0.09, -0.03, -0.25); add(g, new THREE.BoxGeometry(0.008, 0.006, 0.016), C.chrome(), s * 0.07, 0.112, -0.035); }
  const hs = grp(g, 0, 0.142, -0.032);
  SW(hs, [[-0.115, -0.012, 0], [-0.085, 0.008, 0], [0, 0.016, 0], [0.085, 0.008, 0], [0.115, -0.012, 0]], [0.018, 0.013, 0.012, 0.013, 0.018], m, 16, 32, 0.8);
  for (const s of [-1, 1]) {
    add(hs, latheGeo([[0, 0], [0.026, 0], [0.03, 0.006], [0.028, 0.022], [0.016, 0.034], [0, 0.036]], 28), m, s * 0.105, -0.014, 0, Math.PI);
    add(hs, new THREE.CircleGeometry(0.024, 24), mat(0x1c1c1c, { roughness: 0.8 }), s * 0.105, -0.0145, 0, Math.PI / 2);
  }
  // cordón en espiral
  const pts = []; for (let i = 0; i <= 80; i++) { const t = i / 80; pts.push([-0.11 + Math.cos(t * 70) * 0.006, 0.12 - t * 0.1 + Math.sin(t * 70) * 0.006, -0.04 - t * 0.09]); }
  TU(g, pts, 0.0022, m, false, 500);
  return g;
}
export function cathedralRadio() {
  const g = new THREE.Group();
  const wd = mat(0x5a2c12, { map: C.wood(0x5a2c12).map, roughness: 0.3, env: true, envI: 0.45 });
  const ven = mat(0x8a4e22, { map: C.wood(0x8a4e22).map, roughness: 0.32, env: true, envI: 0.4 });
  const D = 0.2, e = 0.008;
  const arch = (w, h0, top) => { const s = new THREE.Shape(); s.moveTo(-w, 0); s.lineTo(w, 0); s.lineTo(w, h0); s.quadraticCurveTo(w, top - (top - h0) * 0.15, 0, top); s.quadraticCurveTo(-w, top - (top - h0) * 0.15, -w, h0); s.closePath(); return s; };
  RB(g, 0.35, 0.03, D + 0.02, 0.008, wd, 0, 0.015, 0);
  const body = arch(0.16 - e, 0.22, 0.42 - e); body.getPoints(); 
  add(g, slab(body, D, e, 3, 24), wd, 0, 0.03, -D / 2);
  // panel frontal de chapa clara (relieve)
  const zf = D / 2;
  add(g, slab(arch(0.13, 0.2, 0.37), 0.006, 0.002, 2, 24), ven, 0, 0.042, zf - 0.001);
  // rejilla con tela + tracería gótica
  const gr = new THREE.Shape(arch(0.095, 0.24, 0.355).getPoints(24)); 
  add(g, new THREE.ShapeGeometry(arch(0.095, 0.0, 0.2), 24), mat(0xc9a86a, { map: C.cloth(0xc9a86a).map, roughness: 1 }), 0, 0.165, zf + 0.0052);
  const tr = new Acc();
  const fr = new THREE.Shape(arch(0.1, 0.0, 0.205).getPoints(24)); fr.holes.push(new THREE.Path(arch(0.093, 0.0, 0.196).getPoints(24).reverse()));
  tr.put(slab(fr, 0.005, 0.001, 1, 24), 0, 0.163, zf + 0.004);
  for (const x of [-0.047, 0, 0.047]) tr.put(new THREE.BoxGeometry(0.008, x ? 0.15 : 0.19, 0.005), x, 0.165 + (x ? 0.075 : 0.095), zf + 0.0075);
  for (const x of [-0.0705, -0.0235, 0.0235, 0.0705]) { const a = new THREE.Shape(); a.absarc(0, 0, 0.0235, 0, Math.PI); a.lineTo(-0.0195, 0); a.absarc(0, 0, 0.0195, Math.PI, 0, true); tr.put(slab(a, 0.005, 0.0008, 1, 12), x, 0.29, zf + 0.005); }
  tr.mesh(g, wd);
  // escudo del dial y perillas
  add(g, slab(arch(0.035, 0.012, 0.04), 0.004, 0.001, 1, 16), C.brass(), 0, 0.105, zf + 0.0045);
  add(g, new THREE.ShapeGeometry(arch(0.028, 0.008, 0.032), 16), mat(0xffffff, { map: canvasTex('philcoDial', 128, 64, (c, w, h) => { c.fillStyle = '#f2d9a0'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2410'; c.font = 'bold 11px system-ui'; c.textAlign = 'center'; ['55', '70', '90', '110', '130', '160'].forEach((t, i) => { const a = Math.PI + 0.3 + i * 0.5; c.fillText(t, w / 2 + Math.cos(a) * 44, h - 6 + Math.sin(a) * 44); }); c.strokeStyle = '#a01a10'; c.lineWidth = 2; c.beginPath(); c.moveTo(w / 2, h); c.lineTo(w / 2 + 20, 18); c.stroke(); }), emissive: 0xffb060, emissiveIntensity: 0.35, roughness: 0.4 }), 0, 0.108, zf + 0.0087);
  const kn = new Acc();
  for (const [x, y] of [[-0.085, 0.075], [-0.04, 0.065], [0.04, 0.065], [0.085, 0.075]]) kn.put(latheGeo([[0, 0], [0.014, 0], [0.0145, 0.004], [0.012, 0.012], [0.009, 0.016], [0, 0.017]], 20), x, y, zf + 0.004, Math.PI / 2);
  kn.mesh(g, mat(0x2a140a, { roughness: 0.25, env: true, envI: 0.5 }));
  P(g, 0.06, 0.012, labelTex('PHILCO', { bg: '#00000000', fg: '#e8c878', w: 256, h: 50, font: 'bold 38px Georgia' }), 0, 0.15, zf + 0.0051, 0, 0, 0, { transparent: true });
  return g;
}
