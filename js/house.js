// Interior de la casa por nivel (planta baja del Edif. Sauce) + baño + mesa de taller.
// Coordenadas locales del edificio: frente en x=0, fondo x=-7; cuarto x∈[-5.14,-0.2], baño x∈[-6.8,-5.26].
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, rng, add, B, RB, CY, SP, TO, LA, TU, P, EX, grp } from './modelkit.js';
import { chandelier, crtMonitor } from './models-tech.js';
import { leafyPlant } from './vegetation.js';

const HB = 0.15, HF = 2.9;
const R = rng(77);

// ---------------- texturas ----------------
const T = {};
T.wall = [
  canvasTex('hw1', 512, 512, (c, w) => {
    c.fillStyle = '#8a9463'; c.fillRect(0, 0, w, w);
    const blob = (x, y, r, col) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); };
    for (let i = 0; i < 70; i++) blob(R() * w, R() * w, 30 + R() * 90, R() < 0.5 ? 'rgba(55,65,30,0.25)' : 'rgba(200,205,160,0.14)');
    for (let k = 0; k < 7; k++) { const cx = R() * w, cy = R() * w * 0.4; for (let i = 0; i < 110; i++) { const a = R() * 6.28, d = R() ** 1.6 * 90; blob(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, 2 + R() * 8, 'rgba(22,28,14,0.55)'); } }
    for (let i = 0; i < 30; i++) { const x = R() * w, y0 = R() * w * 0.4, len = 60 + R() * 260; const g = c.createLinearGradient(0, y0, 0, y0 + len); g.addColorStop(0, 'rgba(60,50,25,0.4)'); g.addColorStop(1, 'rgba(60,50,25,0)'); c.fillStyle = g; c.fillRect(x, y0, 2 + R() * 5, len); }
    c.strokeStyle = 'rgba(30,30,20,0.85)'; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { let x = R() * w, y = R() * w * 0.5; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 12; s++) { x += (R() - 0.5) * 30; y += 8 + R() * 18; c.lineTo(x, y); } c.stroke(); }
    for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(210,205,170,0.55)'; const x = R() * w, y = R() * w; c.beginPath(); c.moveTo(x, y); for (let a = 0; a < 6.3; a += 0.5) c.lineTo(x + Math.cos(a) * (8 + R() * 26), y + Math.sin(a) * (8 + R() * 20)); c.fill(); c.strokeStyle = 'rgba(80,70,50,0.4)'; c.lineWidth = 1; c.stroke(); }
  }, true),
  canvasTex('hw2', 256, 256, (c, w) => { c.fillStyle = '#ece4d0'; c.fillRect(0, 0, w, w); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${R() < 0.5 ? 0 : 255},${R() < 0.5 ? 0 : 255},0,${R() * 0.025})`; c.fillRect(R() * w, R() * w, 2, 2); } }, true),
  canvasTex('hw3', 256, 256, (c, w) => { c.fillStyle = '#e4d2b0'; c.fillRect(0, 0, w, w); c.fillStyle = 'rgba(255,255,255,0.18)'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 12, w); c.fillStyle = 'rgba(150,110,60,0.18)'; for (let x = 16; x < w; x += 32) for (let y = 8; y < w; y += 32) { c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); } }, true),
  canvasTex('hw4', 256, 256, (c, w) => { c.fillStyle = '#34423c'; c.fillRect(0, 0, w, w); c.strokeStyle = 'rgba(200,180,120,0.14)'; c.lineWidth = 2; for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { const cx = x * 128 + 64, cy = y * 128 + 64; c.beginPath(); c.moveTo(cx, cy - 46); c.bezierCurveTo(cx + 36, cy - 26, cx + 36, cy + 26, cx, cy + 46); c.bezierCurveTo(cx - 36, cy + 26, cx - 36, cy - 26, cx, cy - 46); c.stroke(); c.beginPath(); c.arc(cx, cy, 10, 0, 7); c.stroke(); } }, true),
  canvasTex('hw5', 256, 256, (c, w) => { c.fillStyle = '#231f1b'; c.fillRect(0, 0, w, w); c.fillStyle = 'rgba(201,164,65,0.16)'; for (let x = 0; x < w; x += 42) c.fillRect(x, 0, 3, w); c.fillStyle = 'rgba(255,255,255,0.03)'; for (let x = 20; x < w; x += 42) c.fillRect(x, 0, 18, w); }, true),
];
T.floor = [
  canvasTex('hf1', 256, 256, (c, w) => { for (let x = 0; x < w; x += 32) { const k = 0.6 + R() * 0.35; c.fillStyle = `rgb(${98 * k | 0},${82 * k | 0},${50 * k | 0})`; c.fillRect(x, 0, 32, w); c.fillStyle = 'rgba(20,15,5,0.8)'; c.fillRect(x, 0, 2, w); c.fillRect(x, R() * w, 32, 2); for (let i = 0; i < 12; i++) { c.strokeStyle = `rgba(40,30,15,${0.2 + R() * 0.2})`; const gx = x + R() * 32; c.beginPath(); c.moveTo(gx, 0); c.bezierCurveTo(gx + 4, w * 0.3, gx - 4, w * 0.6, gx + 2, w); c.stroke(); } } for (let i = 0; i < 50; i++) { const r = 10 + R() * 40, gx = R() * w, gy = R() * w; const g = c.createRadialGradient(gx, gy, 0, gx, gy, r); g.addColorStop(0, 'rgba(25,30,10,0.4)'); g.addColorStop(1, 'rgba(25,30,10,0)'); c.fillStyle = g; c.fillRect(gx - r, gy - r, r * 2, r * 2); } }, true),
  canvasTex('hf2', 256, 256, (c, w) => { for (let x = 0; x < w; x += 42) { const k = 0.9 + R() * 0.15; c.fillStyle = `rgb(${196 * k | 0},${160 * k | 0},${112 * k | 0})`; c.fillRect(x, 0, 42, w); c.fillStyle = 'rgba(80,50,20,0.35)'; c.fillRect(x, 0, 1.5, w); c.fillRect(x, (R() * w) | 0, 42, 1.5); for (let i = 0; i < 8; i++) { c.strokeStyle = 'rgba(120,80,40,0.18)'; const gx = x + R() * 42; c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx + 3, w); c.stroke(); } } }, true),
  canvasTex('hf3', 256, 256, (c, w) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const k = 0.85 + R() * 0.25; c.save(); c.translate(x * 32 + 16, y * 32 + 16); c.rotate((x + y) % 2 ? Math.PI / 4 : -Math.PI / 4); c.fillStyle = `rgb(${150 * k | 0},${98 * k | 0},${54 * k | 0})`; c.fillRect(-22, -8, 44, 16); c.strokeStyle = 'rgba(40,20,5,0.4)'; c.strokeRect(-22, -8, 44, 16); c.restore(); } }, true),
  canvasTex('hf4', 256, 256, (c, w) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const k = 0.8 + R() * 0.25; c.save(); c.translate(x * 32 + 16, y * 32 + 16); c.rotate((x + y) % 2 ? Math.PI / 4 : -Math.PI / 4); c.fillStyle = `rgb(${100 * k | 0},${60 * k | 0},${30 * k | 0})`; c.fillRect(-22, -8, 44, 16); c.strokeStyle = 'rgba(20,10,0,0.5)'; c.strokeRect(-22, -8, 44, 16); c.restore(); } }, true),
  canvasTex('hf5', 256, 256, (c, w) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#e9e4da' : '#f5f2eb'; c.fillRect(i * 128, j * 128, 128, 128); } c.strokeStyle = 'rgba(140,130,120,0.35)'; for (let k = 0; k < 22; k++) { c.beginPath(); let x = R() * w, y = 0; c.moveTo(x, y); while (y < w) { x += (R() - 0.5) * 30; y += 18; c.lineTo(x, y); } c.stroke(); } c.strokeStyle = '#b89a5a'; c.lineWidth = 2; c.strokeRect(1, 1, 127, 127); c.strokeRect(128, 128, 127, 127); }, true),
];
const tileTex = (base, grout, dirty, sub = false) => canvasTex('tile' + base + dirty + sub, 256, 256, (c, w) => {
  c.fillStyle = grout; c.fillRect(0, 0, w, w);
  const tw = sub ? 64 : 42, th = sub ? 32 : 42;
  for (let y = 0; y < w; y += th) for (let x = (sub && (y / th) % 2 ? -tw / 2 : 0); x < w; x += tw) { const k = 0.94 + R() * 0.08; c.fillStyle = base; c.globalAlpha = k; c.fillRect(x + 2, y + 2, tw - 4, th - 4); c.globalAlpha = 1; c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(x + 3, y + 3, tw - 10, 3); }
  if (dirty) {
    for (let i = 0; i < 40; i++) { const r = 6 + R() * 26, x = R() * w, y = R() * w; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(70,60,20,0.35)'); g.addColorStop(1, 'rgba(70,60,20,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.strokeStyle = 'rgba(30,30,30,0.7)'; c.lineWidth = 1.2; for (let i = 0; i < 6; i++) { let x = R() * w, y = R() * w; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 5; s++) { x += (R() - 0.5) * 30; y += (R() - 0.5) * 30; c.lineTo(x, y); } c.stroke(); }
    c.fillStyle = 'rgba(40,50,30,0.5)'; for (let y = th; y < w; y += th) c.fillRect(0, y - 2, w, 3);
  }
}, true);
const fabric = (hex, key, pattern = 'weave') => canvasTex('fab' + key, 128, 128, (c, w) => {
  c.fillStyle = hex; c.fillRect(0, 0, w, w);
  if (pattern === 'plaid') { c.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < w; x += 32) { c.fillRect(x, 0, 10, w); c.fillRect(0, x, w, 10); } c.fillStyle = 'rgba(255,255,255,0.18)'; for (let x = 16; x < w; x += 32) { c.fillRect(x, 0, 3, w); c.fillRect(0, x, w, 3); } }
  else if (pattern === 'quilt') { c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 2; for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, w); c.moveTo(0, x); c.lineTo(w, x); c.stroke(); } c.fillStyle = 'rgba(255,255,255,0.25)'; for (let x = 16; x < w; x += 32) for (let y = 16; y < w; y += 32) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); } }
  c.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = 0; i < w; i += 2) { c.fillRect(i, 0, 1, w); c.fillRect(0, i, w, 1); }
}, true);
const books = canvasTex('books', 256, 64, (c, w, h) => { let x = 0; while (x < w) { const bw = 6 + R() * 12; c.fillStyle = `hsl(${R() * 360},${30 + R() * 30}%,${25 + R() * 30}%)`; c.fillRect(x, h - (40 + R() * 24), bw, h); c.fillStyle = 'rgba(255,230,160,0.6)'; c.fillRect(x + 1, h - 30, bw - 2, 2); x += bw + 1; } });

// ---------------- piezas ----------------
function col(list, m) { list.push(m); m.userData.col = true; return m; }
function wavyCurtain(g, w, h, x, y, z, ry, color) {
  const geo = new THREE.PlaneGeometry(w, h, 24, 2); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 28) * 0.03);
  geo.computeVertexNormals();
  return add(g, geo, mat(color, { roughness: 1, side: THREE.DoubleSide, map: fabric('#dddddd', 'cur') }), x, y, z, 0, ry);
}
function frameArt(g, seed, style, w, h, x, y, z, ry, fm) { const f = grp(g, x, y, z, 0, ry); RB(f, w + 0.08, h + 0.08, 0.035, 0.012, fm ?? C.gold(), 0, 0, 0); P(f, w, h, artTex(seed, style, 256, 200), 0, 0, 0.019); }
function baseboard(g, m, level) {
  const h = level >= 4 ? 0.14 : 0.09;
  for (const [x0, x1, z, ry] of [[-5.14, -0.2, -3.29, 0], [-5.14, -0.2, 3.29, Math.PI]]) B(g, x1 - x0, h, 0.02, m, (x0 + x1) / 2, HB + h / 2, z, 0, ry);
  for (const [z0, z1] of [[-3.3, 1.7], [2.5, 3.3]]) B(g, 0.02, h, z1 - z0, m, -5.13, HB + h / 2, (z0 + z1) / 2);
  if (level >= 4) { for (const z of [-3.28, 3.28]) B(g, 4.94, 0.08, 0.05, m, -2.67, HF - 0.04, z); B(g, 0.05, 0.08, 6.6, m, -5.12, HF - 0.04, 0); }
}
function outlet(g, x, y, z, ry) { const o = grp(g, x, y, z, 0, ry); RB(o, 0.08, 0.12, 0.012, 0.005, plastic(0xefece4), 0, 0, 0); for (const dy of [-0.025, 0.025]) for (const dx of [-0.012, 0.012]) B(o, 0.006, 0.014, 0.005, C.black(), dx, dy, 0.006); }
function bedFrame(g, cols, x, z, o) {
  const b = grp(g, x, HB, z);
  const wood = o.wood;
  col(cols, RB(b, 2.05, 0.3, 1.5, 0.05, wood, 0, 0.2, 0));
  RB(b, 1.98, 0.22, 1.44, 0.08, mat(0xf4f1ea, { roughness: 1, map: fabric('#f1ede4', 'mat', 'quilt') }), 0, 0.46, 0);
  const sheet = RB(b, 1.4, 0.07, 1.52, 0.03, mat(0xffffff, { roughness: 1, map: fabric(o.sheet, 'sh' + o.sheet, o.plaid ? 'plaid' : 'quilt') }), 0.3, 0.58, 0);
  for (const dz of [-0.36, 0.36]) RB(b, 0.36, 0.14, 0.55, 0.06, mat(0xf8f6f0, { roughness: 1 }), -0.75, 0.63, dz, 0, 0, 0.18);
  RB(b, 0.1, o.headH ?? 1.0, 1.58, 0.04, o.head ?? wood, -1.04, 0.55, 0);
  if (o.tufted) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) SP(b, 0.012, C.black(), -0.985, 0.7 + j * 0.15, -0.6 + i * 0.4);
  return b;
}
function nightstand(g, cols, x, z, wood, lampShade = 0xf2e6c8) {
  const n = grp(g, x, HB, z);
  col(cols, RB(n, 0.45, 0.55, 0.42, 0.03, wood, 0, 0.275, 0));
  RB(n, 0.4, 0.16, 0.02, 0.01, wood, 0, 0.36, 0.21); SP(n, 0.015, C.brass(), 0, 0.36, 0.225);
  CY(n, 0.06, 0.08, 0.04, C.brass(), 0, 0.57, 0, 0, 0, 0, 16); CY(n, 0.01, 0.01, 0.24, C.brass(), 0, 0.7, 0, 0, 0, 0, 8);
  add(n, new THREE.CylinderGeometry(0.1, 0.14, 0.18, 20, 1, true), mat(lampShade, { emissive: 0xffd8a0, emissiveIntensity: 0.5, side: THREE.DoubleSide, roughness: 1 }), 0, 0.86, 0);
}
function sofa(g, cols, x, z, ry, m) {
  const s = grp(g, x, HB, z, 0, ry);
  col(cols, RB(s, 2.0, 0.42, 0.9, 0.08, m, 0, 0.25, 0));
  RB(s, 2.0, 0.55, 0.24, 0.1, m, 0, 0.65, -0.34, -0.08);
  for (const sx of [-0.92, 0.92]) RB(s, 0.22, 0.62, 0.9, 0.1, m, sx, 0.4, 0);
  for (const sx of [-0.43, 0.43]) RB(s, 0.84, 0.16, 0.66, 0.07, m, sx, 0.5, 0.08);
  for (const sx of [-0.6, 0.6]) RB(s, 0.4, 0.4, 0.12, 0.08, mat(0xe8d8b0, { roughness: 1, map: fabric('#e0cfa6', 'cush', 'plaid') }), sx, 0.7, -0.18, -0.2, 0, sx * 0.3);
  for (const [a, b] of [[-0.9, -0.35], [0.9, -0.35], [-0.9, 0.35], [0.9, 0.35]]) CY(s, 0.025, 0.018, 0.08, C.darkWood(), a, 0.04, b, 0, 0, 0, 8);
}
function table(g, cols, x, z, w, d, h, wood, round = false) {
  const t = grp(g, x, HB, z);
  if (round) col(cols, CY(t, w / 2, w / 2, 0.04, wood, 0, h, 0, 0, 0, 0, 32));
  else col(cols, RB(t, w, 0.05, d, 0.02, wood, 0, h, 0));
  if (round) { CY(t, 0.04, 0.05, h, wood, 0, h / 2, 0, 0, 0, 0, 12); CY(t, 0.25, 0.28, 0.03, wood, 0, 0.015, 0, 0, 0, 0, 24); }
  else for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) CY(t, 0.028, 0.02, h, wood, a * (w / 2 - 0.06), h / 2, b * (d / 2 - 0.06), 0, 0, 0, 10);
}
function woodChair(g, x, z, ry, wood) {
  const c = grp(g, x, HB, z, 0, ry);
  RB(c, 0.44, 0.05, 0.42, 0.015, wood, 0, 0.46, 0);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) CY(c, 0.02, 0.016, 0.46, wood, a * 0.18, 0.23, b * 0.17, 0, 0, 0, 8);
  for (const a of [-1, 1]) CY(c, 0.018, 0.018, 0.5, wood, a * 0.18, 0.72, -0.19, -0.08, 0, 0, 8);
  RB(c, 0.4, 0.12, 0.03, 0.012, wood, 0, 0.88, -0.2, -0.08);
  RB(c, 0.36, 0.05, 0.02, 0.01, wood, 0, 0.66, -0.2, -0.08);
}
function monoblocChair(g, x, z, ry) {
  const c = grp(g, x, HB, z, 0, ry);
  const m = plastic(0xe6e2d6, 0.55);
  RB(c, 0.46, 0.04, 0.44, 0.02, m, 0, 0.44, 0);
  RB(c, 0.46, 0.44, 0.035, 0.02, m, 0, 0.68, -0.21, -0.12);
  for (let i = 0; i < 4; i++) B(c, 0.05, 0.3, 0.01, mat(0x1a1a1a), -0.15 + i * 0.1, 0.68, -0.19, -0.12);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) CY(c, 0.022, 0.03, 0.46, m, a * 0.2, 0.22, b * 0.19, b * 0.1, 0, a * 0.1, 10);
  for (const a of [-1, 1]) RB(c, 0.04, 0.04, 0.4, 0.015, m, a * 0.23, 0.6, 0);
  return c;
}
function plant(g, x, z, s = 1, pot = 0xb5623a) {
  const p = grp(g, x, HB, z);
  LA(p, [[0, 0], [0.12 * s, 0], [0.16 * s, 0.3 * s], [0.17 * s, 0.32 * s], [0.15 * s, 0.32 * s], [0.14 * s, 0.28 * s], [0, 0.28 * s]], mat(pot, { roughness: 0.8 }), 0, 0, 0, 24);
  CY(p, 0.14 * s, 0.14 * s, 0.01, mat(0x3a2a1a, { roughness: 1 }), 0, 0.29 * s, 0, 0, 0, 0, 16);
  const l = leafyPlant(1.1 * s, Math.round(x * 7 + z)); l.position.y = 0.29 * s; p.add(l);
}
function rug(g, x, z, w, d, key, a, b2) {
  const tex = canvasTex('rug' + key, 256, 256, (c, W) => {
    c.fillStyle = a; c.fillRect(0, 0, W, W);
    c.strokeStyle = b2; c.lineWidth = 10; c.strokeRect(12, 12, W - 24, W - 24); c.lineWidth = 3; c.strokeRect(30, 30, W - 60, W - 60);
    for (let i = 0; i < 5; i++) { c.save(); c.translate(W / 2, W / 2); c.rotate(i * Math.PI / 5); c.beginPath(); c.ellipse(0, 0, 80, 26, 0, 0, 7); c.stroke(); c.restore(); }
    c.fillStyle = 'rgba(0,0,0,0.06)'; for (let i = 0; i < W; i += 2) c.fillRect(i, 0, 1, W);
  });
  const m = add(g, new THREE.BoxGeometry(w, 0.012, d), mat(0xffffff, { map: tex, roughness: 1 }), x, HB + 0.006, z); m.castShadow = false;
}
function bookshelf(g, cols, x, z, ry, wood) {
  const s = grp(g, x, HB, z, 0, ry);
  col(cols, RB(s, 1.0, 1.9, 0.34, 0.02, wood, 0, 0.95, 0));
  for (let i = 0; i < 4; i++) { B(s, 0.94, 0.02, 0.3, wood, 0, 0.35 + i * 0.45, 0.02); P(s, 0.9, 0.34, books, 0, 0.53 + i * 0.45, 0.16); }
  B(s, 0.94, 1.84, 0.01, mat(0x2a1a0a), 0, 0.95, -0.16);
}
function vitrina(g, cols, slots, x, z, w, h, d, wood) {
  const v = grp(g, x, HB, z);
  col(cols, RB(v, w, 0.5, d, 0.02, wood, 0, 0.25, 0));
  B(v, w, h, d, glass(0xeef6ff, 0.14), 0, 0.5 + h / 2, 0).castShadow = false;
  RB(v, w + 0.04, 0.05, d + 0.04, 0.015, wood, 0, 0.5 + h + 0.025, 0);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(v, 0.02, h, 0.02, C.brass(), a * w / 2, 0.5 + h / 2, b * d / 2);
  B(v, w * 0.9, 0.02, 0.03, emissive(0xfff2d8, 2.2), 0, 0.5 + h - 0.03, 0).castShadow = false;
  slots.push({ g: v, y: 0.52, w, h: h - 0.1, d });
}
function kitchenette(g, cols, level) {
  const k = grp(g, -4.55, HB, 3.02);
  const body = level >= 5 ? mat(0x1a1a1a, { roughness: 0.3, env: true, envI: 0.5 }) : level >= 4 ? C.darkWood() : plastic(0xf2efe8, 0.4);
  col(cols, RB(k, 1.1, 0.88, 0.58, 0.02, body, 0, 0.44, 0));
  for (const dx of [-0.27, 0.27]) { RB(k, 0.5, 0.7, 0.02, 0.01, body, dx, 0.42, 0.29); B(k, 0.12, 0.02, 0.02, C.chrome(), dx, 0.7, 0.305); }
  RB(k, 1.14, 0.04, 0.62, 0.01, level >= 5 ? C.marble() : mat(0x3a3a3a, { roughness: 0.35 }), 0, 0.9, 0);
  for (const [dx, dz] of [[-0.35, -0.1], [-0.12, -0.1], [-0.35, 0.12], [-0.12, 0.12]]) { CY(k, 0.07, 0.07, 0.012, C.black(), dx, 0.926, dz, 0, 0, 0, 20); TO(k, 0.05, 0.006, C.steel(), dx, 0.934, dz, Math.PI / 2, 0, 0, Math.PI * 2, 16); }
  LA(k, [[0, 0], [0.16, 0], [0.18, 0.02]], metal(0xc8ccd0, 0.2, { side: THREE.DoubleSide }), 0.3, 0.9, 0, 24).scale.set(1, -3, 1);
  TU(k, [[0.3, 0.92, -0.2], [0.3, 1.2, -0.2], [0.3, 1.2, -0.05]], 0.015, C.chrome());
  RB(k, 1.1, 0.55, 0.34, 0.02, body, 0, 1.75, -0.12);
  CY(k, 0.1, 0.1, 0.18, level >= 3 ? C.steel() : mat(0xc8282a), -0.35, 1.02, -0.1, 0, 0, 0, 16);
  // refri
  const f = grp(g, -3.72, HB, 3.0);
  col(cols, RB(f, 0.62, level >= 3 ? 1.75 : 1.3, 0.62, 0.05, level >= 4 ? C.steel() : plastic(0xf0ede6, 0.3), 0, (level >= 3 ? 1.75 : 1.3) / 2, 0));
  B(f, 0.6, 0.01, 0.01, C.black(), 0, level >= 3 ? 1.15 : 0.9, 0.31);
  for (const y of [0.7, level >= 3 ? 1.45 : 1.05]) RB(f, 0.03, 0.22, 0.04, 0.01, C.chrome(), -0.24, y, 0.33);
  for (let i = 0; i < 4; i++) RB(f, 0.06, 0.06, 0.01, 0.005, plastic([0xc8282a, 0xf2c230, 0x2a8a3a, 0x2a5ab0][i]), -0.1 + (i % 2) * 0.14, 1.0 + Math.floor(i / 2) * 0.14, 0.315);
}
function tv(g, x, z, ry, big, crt) {
  const t = grp(g, x, HB, z, 0, ry);
  if (crt) { const s = grp(t, 0, 0.45, 0); crtMonitor(s, 0, 0, 0, { size: 1.2, body: plastic(0x2a2a2a, 0.4), screen: 'tv' }); return; }
  const w = big ? 1.6 : 1.2, h = big ? 0.92 : 0.7;
  RB(t, w, h, 0.05, 0.01, C.black(), 0, 1.15, 0);
  P(t, w - 0.06, h - 0.06, artTex(big ? 91 : 71, 'landscape', 256, 144), 0, 1.15, 0.027, 0, 0, 0, { glow: 0.65, rough: 0.1 });
}
function tvStand(g, cols, x, z, ry, wood) { const s = grp(g, x, HB, z, 0, ry); col(cols, RB(s, 1.5, 0.45, 0.42, 0.02, wood, 0, 0.225, 0)); for (const dx of [-0.37, 0.37]) { RB(s, 0.7, 0.36, 0.01, 0.01, wood, dx, 0.23, 0.21); B(s, 0.1, 0.015, 0.02, C.brass(), dx, 0.3, 0.22); } }
function floorLamp(g, x, z, shade = 0xf2e6c8) { const l = grp(g, x, HB, z); CY(l, 0.15, 0.17, 0.03, C.black(), 0, 0.015, 0, 0, 0, 0, 20); CY(l, 0.015, 0.015, 1.5, C.brass(), 0, 0.75, 0, 0, 0, 0, 8); add(l, new THREE.CylinderGeometry(0.16, 0.24, 0.3, 24, 1, true), mat(shade, { emissive: 0xffd8a0, emissiveIntensity: 0.55, side: THREE.DoubleSide, roughness: 1 }), 0, 1.55, 0); }
function wallClock(g, x, y, z, ry) { const c = grp(g, x, y, z, 0, ry); CY(c, 0.16, 0.16, 0.04, C.darkWood(), 0, 0, 0, Math.PI / 2, 0, 0, 32); P(c, 0.28, 0.28, canvasTex('hclock', 128, 128, (x2, w) => { x2.fillStyle = '#f6f2e6'; x2.beginPath(); x2.arc(64, 64, 64, 0, 7); x2.fill(); x2.fillStyle = '#222'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; x2.fillRect(64 + Math.cos(a) * 52 - 2, 64 + Math.sin(a) * 52 - 2, 4, 4); } x2.lineWidth = 4; x2.strokeStyle = '#222'; x2.beginPath(); x2.moveTo(64, 64); x2.lineTo(64, 26); x2.moveTo(64, 64); x2.lineTo(92, 70); x2.stroke(); }), 0, 0, 0.021, 0, 0, 0, { transparent: true, alphaTest: 0.2 }); }

// ---------------- mesa de taller ----------------
function workbench(g, cols, level) {
  const w = grp(g, -0.95, HB, 2.95, 0, Math.PI);
  const top = level >= 3 ? C.wood(0x8a5a2a) : mat(0x7a6a4a, { roughness: 1 });
  col(cols, RB(w, 1.2, 0.06, 0.6, 0.02, top, 0, 0.84, 0));
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) B(w, 0.05, 0.84, 0.05, level >= 2 ? C.steel() : C.wood(0x5a4a3a), a * 0.55, 0.42, b * 0.26);
  B(w, 1.1, 0.03, 0.5, top, 0, 0.25, 0);
  // tablero perforado con herramientas
  P(w, 1.2, 0.7, canvasTex('pegh', 256, 160, (c, W, H) => { c.fillStyle = '#c8a878'; c.fillRect(0, 0, W, H); c.fillStyle = 'rgba(60,40,20,0.6)'; for (let x = 6; x < W; x += 12) for (let y = 6; y < H; y += 12) { c.beginPath(); c.arc(x, y, 1.6, 0, 7); c.fill(); } }), 0, 1.35, -0.29);
  for (let i = 0; i < 4; i++) { const t = grp(w, -0.45 + i * 0.3, 1.35, -0.27); B(t, 0.03, 0.24, 0.02, i % 2 ? C.steel() : C.wood(0xc8a070), 0, 0, 0); if (i % 2) TO(t, 0.03, 0.008, C.steel(), 0, 0.13, 0, 0, 0, 0, Math.PI * 1.6, 12); else RB(t, 0.1, 0.05, 0.04, 0.01, C.steel(), 0, 0.13, 0); }
  // lámpara de brazo, tornillo de banco, lupa, cautín, piezas
  const arm = grp(w, 0.45, 0.87, -0.15); CY(arm, 0.06, 0.07, 0.03, C.black(), 0, 0.015, 0, 0, 0, 0, 16);
  TU(arm, [[0, 0.03, 0], [0, 0.35, 0.05], [-0.15, 0.5, 0.2]], 0.012, C.black());
  add(arm, new THREE.ConeGeometry(0.08, 0.12, 16, 1, true), mat(0x2a2a2a, { side: THREE.DoubleSide }), -0.17, 0.46, 0.22, Math.PI * 0.85);
  SP(arm, 0.03, emissive(0xfff0c0, 2), -0.17, 0.43, 0.23);
  RB(w, 0.18, 0.1, 0.12, 0.02, mat(0x2a4a8a, { metalness: 0.5, roughness: 0.4 }), -0.45, 0.92, 0.2);
  CY(w, 0.01, 0.01, 0.2, C.steel(), -0.45, 0.94, 0.3, Math.PI / 2, 0, 0, 8);
  TO(w, 0.05, 0.006, C.black(), -0.05, 0.875, 0.12, Math.PI / 2, 0, 0, Math.PI * 2, 20); CY(w, 0.048, 0.048, 0.004, glass(0xeef6ff, 0.4), -0.05, 0.875, 0.12, 0, 0, 0, 20);
  for (let i = 0; i < 8; i++) { const s = SP(w, 0.012, [C.brass(), C.steel(), C.copper()][i % 3], 0.1 + R() * 0.3, 0.875, R() * 0.3 - 0.1, 1, 0.5, 1, 8); }
  CY(w, 0.012, 0.008, 0.18, mat(0xc8282a), 0.2, 0.885, -0.05, 0, 0, Math.PI / 2 - 0.3, 8);
  return { x: -0.95, z: 2.55 };
}

// ---------------- baño ----------------
function bathroom(g, cols, anims, level) {
  const b = grp(g);
  const dirty = level === 1;
  const floorT = level >= 5 ? T.floor[4] : tileTex(dirty ? '#d8d2bc' : level >= 3 ? '#cfd6d8' : '#e8e8e2', dirty ? '#5a5642' : '#9aa0a0', dirty);
  const wallT = level >= 5 ? T.floor[4] : tileTex(dirty ? '#e4e0d0' : level >= 3 ? '#f4f4f0' : '#dfe8ea', dirty ? '#6a6450' : '#b8bcbc', dirty, level >= 3);
  floorT.repeat.set(1, 1); wallT.repeat.set(1, 1);
  const uvScale = (geo, sx, sy) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy); return geo; };
  const fm = mat(0xffffff, { map: floorT, roughness: level >= 3 ? 0.25 : 0.6, env: true, envI: 0.3 });
  const wm = mat(0xffffff, { map: wallT, roughness: level >= 3 ? 0.2 : 0.5, env: true, envI: 0.3, side: THREE.DoubleSide });
  const fl = add(b, uvScale(new THREE.PlaneGeometry(1.54, 6.6), 1.54 * 1.2, 6.6 * 1.2), fm, -6.03, HB + 0.004, 0, -Math.PI / 2); fl.castShadow = false;
  const th = level >= 3 ? 2.6 : 1.4;
  const tile = (w, x, z, ry) => { const m = add(b, uvScale(new THREE.PlaneGeometry(w, th), w * 1.6, th * 1.6), wm, x, HB + th / 2, z, 0, ry); m.castShadow = false; };
  tile(6.6, -6.79, 0, Math.PI / 2);
  tile(5.0, -5.275, -0.8, -Math.PI / 2); tile(0.8, -5.275, 2.9, -Math.PI / 2);
  tile(1.54, -6.03, -3.29, 0); tile(1.54, -6.03, 3.29, Math.PI);
  const porc = level >= 5 ? mat(0x1a1a1a, { roughness: 0.15, env: true, envI: 0.8 }) : C.porcelain(dirty ? 0xd8d0b8 : 0xf6f5f0);
  const fix = level >= 5 ? C.gold() : dirty ? C.rust() : C.chrome();
  // WC
  const wc = grp(b, -6.5, HB, -0.3, 0, -Math.PI / 2);
  col(cols, LA(wc, [[0, 0], [0.12, 0], [0.11, 0.2], [0.2, 0.38], [0.2, 0.4], [0, 0.4]], porc, 0, 0, 0, 24)).scale.set(1, 1, 1.3);
  RB(wc, 0.42, 0.4, 0.18, 0.03, porc, 0, 0.62, -0.26);
  if (!dirty) { const seat = TO(wc, 0.15, 0.025, level >= 5 ? C.black() : plastic(0xffffff), 0, 0.41, 0.02, Math.PI / 2, 0, 0, Math.PI * 2, 24); seat.scale.set(1, 1.3, 1); RB(wc, 0.36, 0.03, 0.4, 0.02, level >= 5 ? C.black() : plastic(0xffffff), 0, 0.62, -0.1, -1.2); }
  RB(wc, 0.06, 0.02, 0.03, 0.008, fix, 0.14, 0.78, -0.2);
  CY(wc, 0.13, 0.13, 0.002, mat(dirty ? 0x6a5a2a : 0x8ab0c0, { roughness: 0.05 }), 0, 0.37, 0.02, 0, 0, 0, 20).scale.set(1, 1, 1.3);
  // lavabo y espejo
  const s = grp(b, -6.6, HB, -1.55, 0, -Math.PI / 2);
  if (level >= 3) { col(cols, RB(s, 0.8, 0.8, 0.48, 0.02, level >= 5 ? C.darkWood() : C.wood(0x8a5a2a), 0, 0.4, -0.05)); RB(s, 0.82, 0.04, 0.5, 0.01, level >= 5 ? C.marble() : C.porcelain(), 0, 0.82, -0.05); LA(s, [[0, 0], [0.18, 0], [0.2, 0.12]], mat(0xf8f8f4, { roughness: 0.1, side: THREE.DoubleSide }), 0, 0.72, -0.02, 24).scale.set(1, 1, 0.8); }
  else { col(cols, CY(s, 0.07, 0.1, 0.78, porc, 0, 0.39, -0.05, 0, 0, 0, 16)); LA(s, [[0, 0], [0.2, 0.02], [0.26, 0.14], [0.27, 0.16], [0.2, 0.16]], mat(dirty ? 0xd8d0b8 : 0xf6f5f0, { roughness: 0.2, side: THREE.DoubleSide }), 0, 0.72, 0, 24).scale.set(1, 1, 0.8); }
  TU(s, [[0, 0.88, -0.22], [0, 0.98, -0.2], [0, 0.98, -0.08]], 0.012, fix);
  for (const dx of [-0.08, 0.08]) CY(s, 0.015, 0.015, 0.04, fix, dx, 0.9, -0.2, 0, 0, 0, 8);
  const mir = grp(b, -6.78, HB + 1.55, -1.55, 0, Math.PI / 2);
  RB(mir, dirty ? 0.4 : 0.6, dirty ? 0.5 : 0.75, 0.03, 0.01, level >= 5 ? C.gold() : dirty ? plastic(0xd8d0b8) : C.chrome(), 0, 0, 0);
  add(mir, new THREE.PlaneGeometry(dirty ? 0.36 : 0.56, dirty ? 0.46 : 0.71), new THREE.MeshStandardMaterial({ color: dirty ? 0xa8aca0 : 0xe8eef2, metalness: 1, roughness: dirty ? 0.35 : 0.03 }), 0, 0, 0.017);
  if (dirty) { const cr = canvasTex('crack', 128, 128, (c) => { c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.5; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(80, 50); let x = 80, y = 50; for (let i = 0; i < 6; i++) { x += (R() - 0.5) * 40; y += (R() - 0.5) * 40; c.lineTo(x, y); } c.stroke(); } }); P(mir, 0.36, 0.46, cr, 0, 0, 0.019, 0, 0, 0, { transparent: true }); }
  // regadera
  const sh = grp(b, -6.03, HB, -2.75);
  if (level >= 5) {
    col(cols, RB(sh, 1.5, 0.5, 0.95, 0.12, C.porcelain(0xf8f8f4), 0, 0.25, 0));
    add(sh, new THREE.BoxGeometry(1.36, 0.02, 0.8), mat(0x9ad0e0, { roughness: 0.02, transparent: true, opacity: 0.7 }), 0, 0.46, 0);
    for (const x of [-0.5, 0.5]) SP(sh, 0.04, C.gold(), x, -0.02, 0.4);
    TU(sh, [[-0.6, 0.5, -0.45], [-0.6, 0.8, -0.45], [-0.45, 0.8, -0.4]], 0.02, C.gold());
  } else {
    CY(sh, 0.018, 0.018, 0.02, fix, 0, 0.005, 0.1, 0, 0, 0, 12);
    if (level >= 3) { B(sh, 0.02, 2.1, 1.0, glass(0xeef8ff, 0.2), 0.74, 1.05, 0).castShadow = false; B(sh, 0.03, 2.1, 0.03, C.chrome(), 0.74, 1.05, -0.5); }
    else { const rod = CY(sh, 0.012, 0.012, 1.5, fix, 0, 2.0, 0.5, 0, 0, Math.PI / 2, 8); const cur = wavyCurtain(sh, 1.2, 1.5, 0.1, 1.2, 0.5, 0, dirty ? 0x8ab0a0 : 0xe8f0f4); if (dirty) { cur.material = mat(0x7a9a8a, { roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }); } }
  }
  TU(b, [[-6.78, HB + 1.1, -2.75], [-6.78, HB + 2.05, -2.75], [-6.6, HB + 2.1, -2.75]], 0.015, fix);
  add(b, new THREE.ConeGeometry(level >= 3 ? 0.12 : 0.06, 0.05, 20), fix, -6.55, HB + 2.06, -2.75, Math.PI);
  // detalles
  if (dirty) {
    const bucket = grp(b, -5.7, HB, -2.9); add(bucket, new THREE.CylinderGeometry(0.16, 0.13, 0.28, 16, 1, true), mat(0x2a6ac8, { roughness: 0.6, side: THREE.DoubleSide }), 0, 0.14, 0); CY(bucket, 0.14, 0.14, 0.002, mat(0x6a7a7a, { roughness: 0.05 }), 0, 0.2, 0, 0, 0, 0, 16);
    CY(b, 0.045, 0.045, 0.1, plastic(0xe8e2d0), -5.5, HB + 0.05, 0.3, Math.PI / 2, 0, 0.3, 12);
    TU(b, [[-6.78, HB + 0.5, 0.2], [-6.5, HB + 0.3, 0.9], [-6.78, HB + 0.1, 1.6]], 0.02, C.rust());
    for (let i = 0; i < 4; i++) { const r = add(b, new THREE.SphereGeometry(0.012, 8, 6), mat(0x3a1a0a, { roughness: 0.4 }), -5.6 - R() * 1, HB + 0.006, R() * 5 - 2.5); r.scale.set(1, 0.4, 1.8); r.rotation.y = R() * 6; }
    const drip = add(b, new THREE.SphereGeometry(0.012, 8, 6), mat(0x9ab0b8, { roughness: 0.05 }), -6.55, HB + 1.9, -2.75); drip.userData.noMerge = true;
    anims.push((dt, t) => { const q = (t % 1.1) / 1.1; drip.position.y = HB + 1.9 - q * q * 1.85; });
  } else {
    RB(b, 0.02, 0.02, 0.6, 0.01, fix, -5.29, HB + 1.2, -1.0);
    for (const [c1, z] of [[0x2a6ac8, -1.15], [0xf2f2f2, -0.85]]) add(b, new THREE.BoxGeometry(0.04, 0.5, 0.26), mat(level >= 5 ? 0xe8dcc0 : c1, { roughness: 1, map: fabric('#dddddd', 'towel') }), -5.31, HB + 0.95, z);
    RB(b, 0.6, 0.015, 0.4, 0.01, mat(level >= 5 ? 0x2a2a2a : 0x6a9ab8, { roughness: 1 }), -6.05, HB + 0.01, -0.3);
    if (level >= 3) plant(b, -5.5, 3.0, 0.8, level >= 5 ? 0x1a1a1a : 0xe8e4dc);
    CY(b, 0.06, 0.06, 0.1, plastic(0xffffff), -5.45, HB + 0.35, -0.1, Math.PI / 2, 0, 0, 16);
  }
  // cortina o puerta del baño
  if (dirty) wavyCurtain(g, 0.84, 1.9, -5.19, HB + 1.05, 2.1, Math.PI / 2, 0xa84a3a);
  else { const d = grp(g, -5.2, HB, 1.7, 0, -1.2); RB(d, 0.05, 2.0, 0.8, 0.01, level >= 4 ? C.darkWood() : C.wood(0xa8784a), 0, 1.0, 0.4); SP(d, 0.03, fix, 0.04, 1.0, 0.72); }
}

// ---------------- construcción por nivel ----------------
export const HOUSE_WALL_TEX = T.wall;
export const HOUSE_FLOOR_TEX = T.floor;
export function buildHouseInterior(level) {
  const g = new THREE.Group();
  const cols = [], anims = [], slots = [];
  const wood = level >= 4 ? C.darkWood() : C.wood(level >= 3 ? 0x8a5a2a : 0xa8784a);
  let light = { pos: [-2.6, HF - 0.5, 0], color: 0xfff0d8, i: 7 }, light2 = null;
  bathroom(g, cols, anims, level);
  const bench = workbench(g, cols, level);
  if (level === 1) {
    // colchón en el piso con cobija a cuadros, almohada y ropa
    const m = grp(g, -3.9, HB, -2.55);
    col(cols, RB(m, 2.0, 0.22, 1.4, 0.08, mat(0xffffff, { roughness: 1, map: canvasTex('matt1', 128, 256, (c, w, h) => { c.fillStyle = '#d8cfb4'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(100,90,70,0.35)'; for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 16) { c.beginPath(); c.arc(x + 8, y + 8, 2, 0, 7); c.stroke(); } for (let i = 0; i < 4; i++) { c.fillStyle = `rgba(140,100,40,${0.2 + R() * 0.2})`; c.beginPath(); c.ellipse(R() * w, R() * h, 16 + R() * 20, 10 + R() * 14, R(), 0, 7); c.fill(); } }) }), 0, 0.11, 0));
    const blanket = new THREE.PlaneGeometry(1.4, 1.5, 20, 20); { const p = blanket.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 7) * 0.03 + Math.sin(p.getY(i) * 5 + 1) * 0.03 + 0.02); blanket.computeVertexNormals(); }
    add(m, blanket, mat(0xffffff, { roughness: 1, map: fabric('#8a3a2a', 'plaid1', 'plaid'), side: THREE.DoubleSide }), 0.3, 0.25, 0, -Math.PI / 2);
    RB(m, 0.4, 0.14, 0.6, 0.06, mat(0x6f95c4, { roughness: 1, map: fabric('#8aa8d0', 'pill') }), -0.72, 0.29, 0, 0, 0.15, 0.1);
    for (let i = 0; i < 6; i++) { const c2 = add(g, new THREE.SphereGeometry(0.16, 10, 8), mat([0x2a3a6a, 0x8a2a2a, 0x3a3a3a, 0xc8b88a][i % 4], { roughness: 1 }), -2.8 + R() * 0.4, HB + 0.05, -1.35 + R() * 0.3); c2.scale.set(1.3, 0.35, 1); c2.rotation.y = R() * 3; }
    // silla de plástico con veladora
    monoblocChair(g, -4.6, 0.4, 0.35);
    const cand = grp(g, -4.55, HB + 0.46, 0.42); CY(cand, 0.035, 0.035, 0.12, mat(0xf2ead8, { roughness: 0.6 }), 0, 0.06, 0, 0, 0, 0, 12); const fl = SP(cand, 0.012, emissive(0xffa040, 3), 0, 0.14, 0, 1, 2, 1); fl.userData.noMerge = true;
    light2 = { pos: [-4.55, HB + 0.75, 0.42], color: 0xffa850, i: 1.6 };
    anims.push((dt, t) => (fl.scale.y = 2 + 0.3 * Math.sin(t * 19)));
    // tele vieja sobre un huacal
    const cr = grp(g, -1.9, HB, -3.0); for (const y of [0.05, 0.2, 0.35]) for (const s2 of [-1, 1]) B(cr, 0.55, 0.1, 0.02, C.wood(0xa8804a), 0, y, s2 * 0.2); col(cols, B(cr, 0.55, 0.42, 0.42, C.wood(0xa8804a), 0, 0.21, 0)).visible = false;
    const tvG = grp(cr, 0, 0.42, 0, 0, 0.3); crtMonitor(tvG, 0, 0, -0.05, { size: 0.9, body: plastic(0x3a3a3a, 0.4), screen: 'tv' });
    TU(g, [[-1.9, HB + 0.9, -3.1], [-1.9, HB + 1.2, -3.25], [-1.2, HB + 1.1, -3.25]], 0.004, C.black());
    // parrilla eléctrica, olla, garrafón y cajas
    const hp = grp(g, -4.75, HB, 3.0); RB(hp, 0.5, 0.45, 0.4, 0.02, C.wood(0x8a7050), 0, 0.225, 0); col(cols, hp.children[0]);
    RB(hp, 0.35, 0.05, 0.25, 0.01, C.steel(), 0, 0.475, 0); TO(hp, 0.08, 0.008, mat(0x8a2010, { emissive: 0x401000 }), 0, 0.505, 0, Math.PI / 2, 0, 0, Math.PI * 2, 20);
    LA(hp, [[0, 0], [0.1, 0], [0.11, 0.1], [0.1, 0.1]], metal(0xa8acb0, 0.4, { side: THREE.DoubleSide }), 0, 0.51, 0, 20);
    const gar = grp(g, -4.1, HB, 3.08); LA(gar, [[0, 0], [0.13, 0], [0.14, 0.3], [0.1, 0.4], [0.03, 0.44], [0.03, 0.47]], new THREE.MeshPhysicalMaterial({ color: 0x9fd0ff, transmission: 0.6, roughness: 0.1, thickness: 0.05 }), 0, 0, 0, 20); col(cols, gar.children[0]);
    for (const [w, h, d, x, y, z, ry, k] of [[0.6, 0.5, 0.5, -0.75, 0, -2.9, 0, 0], [0.5, 0.4, 0.45, -0.8, 0.5, -2.85, 0.2, 1], [0.55, 0.45, 0.55, -2.8, 0, 3.0, 0.1, 2]]) { const bx = RB(g, w, h, d, 0.01, mat(0xa8804f, { roughness: 1 }), x, HB + y + h / 2, z, 0, ry); if (!y) col(cols, bx); B(g, w + 0.004, 0.004, 0.06, mat(0xc9ad6a, { roughness: 0.4 }), x, HB + y + h, z, 0, ry); }
    // cubeta con gotera en la sala
    const bk = grp(g, -2.4, HB, 1.9); add(bk, new THREE.CylinderGeometry(0.2, 0.16, 0.32, 20, 1, true), metal(0x9aa0a3, 0.35, { side: THREE.DoubleSide }), 0, 0.16, 0); CY(bk, 0.185, 0.185, 0.002, mat(0x4b5a5a, { roughness: 0.05 }), 0, 0.24, 0, 0, 0, 0, 20); col(cols, bk.children[0]);
    const drop = SP(g, 0.013, mat(0x9ab0b8, { roughness: 0.05 }), -2.4, HF - 0.05, 1.9, 1, 1.5, 1); drop.userData.noMerge = true;
    P(g, 0.9, 0.9, canvasTex('stain2', 128, 128, (c) => { for (let r = 60; r > 6; r -= 8) { c.strokeStyle = `rgba(90,70,30,${0.15 + R() * 0.2})`; c.lineWidth = 4; c.beginPath(); c.arc(64, 64, r, 0, 7); c.stroke(); } }), -2.4, HF - 0.004, 1.9, Math.PI / 2, 0, 0, { transparent: true });
    anims.push((dt, t) => { const q = (t % 1.5) / 1.5, f = Math.min(1, q / 0.45); drop.visible = q < 0.45; drop.position.y = HF - 0.05 - (HF - 0.05 - (HB + 0.25)) * f * f; });
    // foco pelón, cables, pósters, telarañas, cucarachas
    B(g, 0.01, 0.55, 0.01, C.black(), -2.6, HF - 0.275, 0); SP(g, 0.055, emissive(0xffe0a0, 2.5), -2.6, HF - 0.63, 0);
    TU(g, [[-2.6, HF - 0.01, 0], [-3.8, HF - 0.03, 0.2], [-5.1, HF - 0.05, 0.3]], 0.006, C.black());
    light = { pos: [-2.6, HF - 0.72, 0], color: 0xffd79a, i: 5, flicker: true };
    for (const [seed, x, y, ry, z] of [[3, -3.6, 1.7, 0, -3.285], [8, -1.4, 1.6, Math.PI, 3.285]]) { P(g, 0.45, 0.62, artTex(seed, 'portrait', 180, 250, ['LUCHA LIBRE', 'CUMBIA'][seed % 2]), x, HB + y, z, 0, ry, 0.03); for (const dx of [-0.2, 0.2]) P(g, 0.06, 0.02, mat(0xe8e0c0, { transparent: true, opacity: 0.8 }), x + dx * (ry ? -1 : 1), HB + y + 0.3, z + (ry ? -0.001 : 0.001), 0, ry, 0.4); }
    for (let i = 0; i < 5; i++) { const r2 = add(g, new THREE.SphereGeometry(0.012, 8, 6), mat(0x3a1a0a, { roughness: 0.4 }), -0.5 - R() * 4.3, HB + 0.006, -3 + R() * 6); r2.scale.set(1, 0.4, 1.8); r2.rotation.y = R() * 6; }
  } else {
    // --- recámara ---
    const sheetCol = ['', '', '#3a5a8a', '#6a2a2a', '#2a3a34', '#e8e0d0'][level];
    bedFrame(g, cols, -4.1, -2.4, { wood, sheet: sheetCol, plaid: level === 2, head: level >= 5 ? mat(0x2a1a12, { roughness: 0.45 }) : wood, headH: level >= 4 ? 1.25 : 0.95, tufted: level >= 5 });
    nightstand(g, cols, -4.75, -1.25, wood);
    if (level >= 3) nightstand(g, cols, -4.75, -3.05, wood);
    // lámpara de techo
    if (level >= 5) { const ch = chandelier(); ch.scale.setScalar(1.6); ch.position.set(-2.6, HF - 0.85, 0); g.add(ch); }
    else { add(g, new THREE.SphereGeometry(0.22, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(level >= 3 ? 0xf2e6c8 : 0xffffff, { emissive: 0xfff0d0, emissiveIntensity: 0.8, side: THREE.DoubleSide }), -2.6, HF - 0.02, 0, Math.PI); }
    // cortinas y zoclo
    for (const dz of [-2.5, -0.7]) wavyCurtain(g, 0.45, 1.6, -0.24, HB + 1.5, dz, Math.PI / 2, ['', '', 0xc8b89a, 0x8a3a2a, 0x2a4a3a, 0x5a1a1a][level]);
    CY(g, 0.012, 0.012, 2.2, level >= 4 ? C.brass() : C.darkWood(), -0.24, HB + 2.33, -1.6, Math.PI / 2, 0, 0, 8);
    baseboard(g, level >= 4 ? C.darkWood() : plastic(0xf2efe6, 0.5), level);
    for (const [x, z, ry] of [[-3.2, -3.285, 0], [-0.8, 3.285, Math.PI], [-5.125, -1.8, Math.PI / 2]]) outlet(g, x, HB + 0.3, z, ry);
    plant(g, -0.6, -3.0, level >= 3 ? 1.3 : 1);
    wallClock(g, -5.125, HB + 2.1, -0.4, Math.PI / 2);
    if (level === 2) {
      table(g, cols, -2.5, 2.35, 0.9, 0.9, 0.74, wood, true);
      woodChair(g, -2.5, 1.7, 0, wood); woodChair(g, -2.5, 3.0, Math.PI, wood);
      rug(g, -2.4, 0.1, 1.8, 1.3, 'r2', '#6a4a3a', '#e0c890');
      const sh = grp(g, -3.2, HB, -3.15); for (const y of [0.8, 1.3]) { RB(sh, 1.1, 0.04, 0.28, 0.01, wood, 0, y, 0); P(sh, 1.0, 0.3, books, 0, y + 0.17, 0.08); }
      frameArt(g, 3, 'landscape', 0.8, 0.55, -2.5, HB + 1.75, 3.27, Math.PI, wood);
      kitchenette(g, cols, 2);
      light = { pos: [-2.6, HF - 0.4, 0], color: 0xfff0d8, i: 7 };
    } else {
      // --- sala ---
      sofa(g, cols, -1.95, -2.75, 0, level >= 5 ? mat(0x5a3018, { roughness: 0.45, env: true, envI: 0.4 }) : mat(level === 4 ? 0x2a4a3a : 0x6a7a8a, { roughness: 1, map: fabric('#bbbbbb', 'sofa') }));
      rug(g, -2.1, -0.9, 2.6, 1.9, 'r' + level, ['', '', '', '#7a5a3a', '#2a3a4a', '#6a1a1a'][level], '#e0c890');
      table(g, cols, -1.95, -1.35, 1.0, 0.55, 0.42, wood);
      if (level >= 5) B(g, 0.95, 0.02, 0.5, glass(0xeef6ff, 0.35), -1.95, HB + 0.45, -1.35).castShadow = false;
      tvStand(g, cols, -2.3, 3.05, Math.PI, wood); tv(g, -2.3, 3.12, Math.PI, level >= 5, false);
      kitchenette(g, cols, level);
      frameArt(g, level * 5, 'portrait', 0.6, 0.8, -3.6, HB + 1.6, -3.27, 0);
      frameArt(g, level * 5 + 1, 'nouveau', 0.9, 0.6, -5.12, HB + 1.7, 0.8, Math.PI / 2);
      floorLamp(g, -0.55, -2.95);
      plant(g, -3.3, 2.95, 1.2);
      if (level >= 4) {
        bookshelf(g, cols, -5.0, 0.35, Math.PI / 2, wood);
        vitrina(g, cols, slots, -3.25, 1.35, 0.6, 0.9, 0.6, wood);
        vitrina(g, cols, slots, -1.75, 1.35, 0.6, 0.9, 0.6, wood);
        if (level >= 5) { vitrina(g, cols, slots, -3.25, -0.2, 0.55, 0.8, 0.55, wood); vitrina(g, cols, slots, -0.75, -1.3, 0.55, 0.8, 0.55, wood); }
      }
      light = { pos: [-2.6, HF - 0.6, 0], color: level >= 4 ? 0xffe0b8 : 0xffe6c0, i: level >= 5 ? 12 : 9 };
    }
  }
  g.traverse(o => { if (o.isMesh && o.castShadow === false) return; if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group: g, colliders: cols, anims, slots, light, light2, workbench: bench };
}
