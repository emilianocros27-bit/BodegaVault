// Relleno de bodegas: cachivaches, muebles viejos, cajas, lonas, estantes.
// Devuelve el grupo y "spots" donde se pueden acomodar los objetos del botín.
// Coordenadas locales de la bodega: x de -D (fondo) a 0 (puerta), z centrado.
import { THREE, mat, metal, plastic, C, canvasTex, rng, add, B, RB, CY, SP, TO, LA, grp } from './modelkit.js';

const cardboard = (k = 0) => mat([0xa8804f, 0x9a7446, 0xb58a58, 0x8e6a40][k % 4], { roughness: 1, map: boxTex(k % 4) });
function boxTex(k) {
  return canvasTex('cbox' + k, 128, 128, (c, w, h) => {
    const R = rng(k + 3);
    c.fillStyle = '#b8b8b8'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 800; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.06})`; c.fillRect(R() * w, R() * h, 2, 2); }
    c.fillStyle = 'rgba(255,255,255,0.08)'; for (let x = 0; x < w; x += 6) c.fillRect(x, 0, 2, h);
    c.fillStyle = 'rgba(200,180,130,0.9)'; c.fillRect(0, h * 0.44, w, h * 0.12);
    if (k % 2) { c.fillStyle = 'rgba(40,30,20,0.75)'; c.font = 'bold 18px system-ui'; c.fillText(['FRÁGIL', 'LIBROS', 'COCINA', 'VARIOS'][k], 12, 30); c.strokeStyle = 'rgba(40,30,20,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(80, 90); c.lineTo(80, 110); c.moveTo(72, 98); c.lineTo(80, 88); c.lineTo(88, 98); c.stroke(); }
  });
}
const tarpMat = () => mat(0x2d5aa8, { roughness: 0.7, side: THREE.DoubleSide });
const bagMat = () => mat(0x111111, { roughness: 0.25, metalness: 0.1, env: true, envI: 0.5 });
const dust = () => mat(0x8a8474, { roughness: 1 });

function lumpyGeo(base, amp, seed) {
  const g = base.clone(); const p = g.attributes.position, v = new THREE.Vector3(), R = rng(seed);
  const f = [R() * 9 + 3, R() * 9 + 3, R() * 9 + 3];
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * f[0]) * Math.sin(v.y * f[1] + 1) * Math.sin(v.z * f[2] + 2); v.addScaledVector(v.clone().normalize(), n * amp); if (v.y < 0) v.y = Math.max(v.y, -0.001); p.setXYZ(i, v.x, v.y, v.z); }
  g.computeVertexNormals(); return g;
}
export function cardboardBox(g, w, h, d, x, y, z, ry, k, open = false) {
  const b = grp(g, x, y, z, 0, ry);
  const m = cardboard(k);
  if (open) {
    for (const [bw, bd, bx, bz] of [[w, 0.01, 0, d / 2], [w, 0.01, 0, -d / 2], [0.01, d, w / 2, 0], [0.01, d, -w / 2, 0]]) add(b, new THREE.BoxGeometry(bw || 0.01, h, bd || 0.01), m, bx, h / 2, bz);
    add(b, new THREE.BoxGeometry(w, 0.01, d), m, 0, 0.005, 0);
    add(b, new THREE.BoxGeometry(w, 0.01, d / 2), m, 0, h + 0.1, d / 2 + 0.12, -1.1);
    add(b, new THREE.BoxGeometry(w / 2, 0.01, d), m, w / 2 + 0.1, h + 0.08, 0, 0, 0, -1.2);
  } else {
    RB(b, w, h, d, 0.012, m, 0, h / 2, 0);
    B(b, w + 0.004, 0.004, 0.06, mat(0xc9ad6a, { roughness: 0.4 }), 0, h + 0.001, 0);
  }
  return b;
}
function shelfRack(g, x, z, len, levels, ry = 0) {
  const r = grp(g, x, 0, z, 0, ry);
  const steel = metal(0x5a6068, 0.45), board = mat(0x8a7a60, { roughness: 1 });
  for (const lx of [-len / 2, len / 2]) for (const lz of [-0.22, 0.22]) B(r, 0.035, 1.9, 0.035, steel, lx, 0.95, lz);
  const tops = [];
  for (let i = 0; i < levels; i++) { const y = 0.12 + i * 0.58; B(r, len + 0.04, 0.025, 0.48, board, 0, y, 0); B(r, len + 0.04, 0.04, 0.02, steel, 0, y, 0.24); tops.push(y + 0.013); }
  return { r, tops };
}
function chairStack(g, x, z, n, ry) {
  const s = grp(g, x, 0, z, 0, ry);
  const m = plastic(0xe8e6de, 0.6);
  for (let i = 0; i < n; i++) {
    const c = grp(s, 0, i * 0.09, 0);
    RB(c, 0.44, 0.03, 0.42, 0.01, m, 0, 0.44, 0);
    RB(c, 0.44, 0.42, 0.03, 0.01, m, 0, 0.68, -0.2, -0.12);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(c, new THREE.CylinderGeometry(0.018, 0.022, 0.46, 8), m, a * 0.19, 0.22, b * 0.18, b * 0.08, 0, a * 0.06);
  }
}
function mattress(g, x, z, ry) {
  const tex = canvasTex('mattress', 128, 256, (c, w, h) => { c.fillStyle = '#e8e2d2'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(120,110,90,0.35)'; for (let x = 0; x < w; x += 16) for (let y = 0; y < h; y += 16) { c.beginPath(); c.arc(x + 8, y + 8, 2, 0, 7); c.stroke(); } c.fillStyle = 'rgba(160,120,60,0.25)'; c.beginPath(); c.ellipse(70, 150, 30, 20, 0.3, 0, 7); c.fill(); });
  RB(g, 0.24, 1.9, 1.3, 0.08, mat(0xffffff, { map: tex, roughness: 1 }), x, 0.95, z, 0, ry, 0.12);
}
function dresser(g, x, z, ry) {
  const d = grp(g, x, 0, z, 0, ry);
  const w = C.wood(0x6a4a2a);
  RB(d, 0.95, 0.85, 0.45, 0.02, w, 0, 0.44, 0);
  for (let i = 0; i < 3; i++) { RB(d, 0.86, 0.22, 0.02, 0.01, C.wood(0x7a5632), 0, 0.2 + i * 0.26, 0.225); for (const sx of [-0.2, 0.2]) SP(d, 0.018, C.brass(), sx, 0.2 + i * 0.26, 0.24); }
  return 0.87;
}
function armchair(g, x, z, ry, color) {
  const a = grp(g, x, 0, z, 0, ry);
  const m = mat(color, { roughness: 1, map: canvasTex('fabric', 64, 64, (c, w) => { c.fillStyle = '#ccc'; c.fillRect(0, 0, w, w); c.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < w; i += 3) { c.fillRect(i, 0, 1, w); c.fillRect(0, i, w, 1); } }, true) });
  RB(a, 0.8, 0.4, 0.8, 0.1, m, 0, 0.3, 0);
  RB(a, 0.8, 0.55, 0.2, 0.08, m, 0, 0.72, -0.32, -0.1);
  for (const sx of [-0.36, 0.36]) RB(a, 0.16, 0.3, 0.8, 0.07, m, sx, 0.58, 0);
  RB(a, 0.62, 0.12, 0.6, 0.05, m, 0, 0.55, 0.05);
}
function tarpLump(g, x, z, sx, sy, sz, seed) {
  const geo = lumpyGeo(new THREE.SphereGeometry(1, 28, 18, 0, Math.PI * 2, 0, Math.PI / 2), 0.08, seed);
  const m = add(g, geo, tarpMat(), x, 0, z); m.scale.set(sx, sy, sz);
}
// bolsa de basura: perfil torneado (fondo abultado, cuello fruncido y nudo con orejas) + arrugas
const bagTex = canvasTex('bagwrinkle', 128, 256, (c, w, h) => {
  c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
  const R = rng(91);
  for (let i = 0; i < 70; i++) { const x = R() * w, y = R() * h; const g = c.createLinearGradient(x - 6, y, x + 6, y); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, R() < 0.5 ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.save(); c.translate(x, y); c.rotate((R() - 0.5) * 0.8); c.fillRect(-6, -30 - R() * 40, 12, 60 + R() * 80); c.restore(); }
}, true);
export function trashBagMesh(seed = 1, color = 0x141414, s = 1) {
  const R = rng(seed * 17 + 3);
  const prof = [[0, 0], [0.16, 0.005], [0.26, 0.05], [0.3, 0.14], [0.29, 0.26], [0.24, 0.36], [0.15, 0.44], [0.06, 0.5], [0.035, 0.53], [0.04, 0.56], [0.03, 0.6], [0, 0.61]];
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 36);
  const p = geo.attributes.position, v = new THREE.Vector3();
  const f = [3 + R() * 3, 5 + R() * 4, 7 + R() * 5], ph = [R() * 6, R() * 6, R() * 6];
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const a = Math.atan2(v.z, v.x), y = v.y, r = Math.hypot(v.x, v.z);
    // bultos de lo que trae adentro + pliegues verticales finos + se aplasta contra el piso
    let k = 1 + 0.09 * Math.sin(a * 2 + ph[0]) * Math.sin(y * f[0]) + 0.05 * Math.sin(a * f[1] + y * 9 + ph[1]) + (y > 0.42 ? 0.18 * Math.sin(a * 11 + ph[2]) : 0.025 * Math.sin(a * f[2] * 2));
    if (y < 0.1) k *= 1 + (0.1 - y) * 1.2;
    p.setXYZ(i, Math.cos(a) * r * k * (1 + 0.12 * Math.cos(a)), y * (0.92 + 0.08 * Math.sin(a * 3 + ph[0])), Math.sin(a) * r * k);
  }
  geo.computeVertexNormals();
  const m = mat(color, { roughness: 0.28, metalness: 0.05, map: bagTex, env: true, envI: 0.6 });
  const g = new THREE.Group();
  add(g, geo, m);
  // orejas del nudo
  for (const sgn of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.13, 10, 3), m); e.scale.set(1, 1, 0.35); e.position.set(sgn * 0.05, 0.63, 0); e.rotation.z = -sgn * 0.9; e.castShadow = true; g.add(e); }
  g.scale.setScalar(s);
  g.rotation.set((R() - 0.5) * 0.15, R() * 6, (R() - 0.5) * 0.15);
  return g;
}
function trashBag(g, x, z, s, seed) {
  const b = trashBagMesh(seed, [0x141414, 0x141414, 0x1a2a4a, 0x2a2a2a][seed % 4], s * 0.9); b.position.set(x, 0, z); g.add(b);
}
// bote de basura de calle (lámina con costillas, tapa abombada, calcomanía)
export function trashCan(color = 0x2458a8, label = 'BASURA') {
  const g = new THREE.Group();
  const tex = canvasTex('can' + color + label, 256, 128, (c, w, h) => {
    c.fillStyle = '#' + color.toString(16).padStart(6, '0'); c.fillRect(0, 0, w, h);
    for (let i = 0; i < 600; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
    { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0.12)'); gr.addColorStop(0.15, 'rgba(255,255,255,0)'); gr.addColorStop(0.85, 'rgba(40,30,20,0)'); gr.addColorStop(1, 'rgba(40,30,20,0.3)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); }
    c.fillStyle = '#f2f2ea'; c.fillRect(w * 0.3, h * 0.28, w * 0.4, h * 0.34);
    c.fillStyle = '#1a1a1a'; c.font = 'bold 22px system-ui'; c.textAlign = 'center'; c.fillText(label, w / 2, h * 0.5);
    c.font = '15px system-ui'; c.fillText('♻ INORGÁNICA', w / 2, h * 0.58);
  });
  tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(2, 1);
  const body = new THREE.LatheGeometry([[0.22, 0], [0.235, 0.02], [0.25, 0.1], [0.265, 0.8], [0.27, 0.82], [0.275, 0.84], [0.27, 0.85]].map(([r, y]) => new THREE.Vector2(r, y)), 48, 0, Math.PI * 2);
  { const p = body.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x), r = Math.hypot(v.x, v.z); const rib = (v.y > 0.12 && v.y < 0.78) ? 1 + 0.018 * Math.max(0, Math.cos(a * 16)) ** 6 : 1; p.setXYZ(i, Math.cos(a) * r * rib, v.y, Math.sin(a) * r * rib); body.attributes.uv.setY(i, v.y / 0.85); } body.computeVertexNormals(); }
  add(g, body, mat(0xffffff, { map: tex, roughness: 0.45, metalness: 0.35, side: THREE.DoubleSide }));
  for (const y of [0.16, 0.74]) TO(g, 0.268, 0.012, metal(0x9aa0a6, 0.35), 0, y, 0, Math.PI / 2, 0, 0, Math.PI * 2, 48);
  LA(g, [[0, 0.95], [0.08, 0.945], [0.2, 0.92], [0.27, 0.88], [0.29, 0.86], [0.29, 0.84], [0.24, 0.845]], mat(0x2a2a2a, { roughness: 0.5, metalness: 0.3 }), 0, 0, 0, 48);
  RB(g, 0.16, 0.04, 0.05, 0.02, mat(0x2a2a2a, { roughness: 0.5 }), 0, 0.965, 0);
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
function bin(g, x, z, color) {
  const m = plastic(color, 0.5);
  RB(g, 0.6, 0.38, 0.42, 0.03, m, x, 0.19, z);
  RB(g, 0.63, 0.05, 0.45, 0.02, plastic(0x2a2a2a, 0.5), x, 0.4, z);
  return 0.43;
}
function rolledRug(g, x, z, ry) {
  const tex = canvasTex('rugroll', 128, 64, (c, w, h) => { c.fillStyle = '#8a2a2a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e0b060'; c.lineWidth = 3; for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 8, h); c.stroke(); } }, true);
  add(g, new THREE.CylinderGeometry(0.13, 0.13, 1.8, 20), mat(0xffffff, { map: tex, roughness: 1 }), x, 0.9, z, 0.18, ry, 0.08);
}
function tire(g, x, z, n) { for (let i = 0; i < n; i++) TO(g, 0.28, 0.1, mat(0x1c1c1c, { roughness: 0.9 }), x, 0.1 + i * 0.2, z, Math.PI / 2, 0, 0, Math.PI * 2, 24); }
function crate(g, x, y, z, s, ry) {
  const c = grp(g, x, y, z, 0, ry);
  const w = C.wood(0xa8804a);
  for (const yy of [0.05, 0.2, 0.35]) for (const zz of [-1, 1]) B(c, 0.55 * s, 0.1 * s, 0.02, w, 0, yy * s, zz * 0.2 * s);
  for (const yy of [0.05, 0.2, 0.35]) for (const xx of [-1, 1]) B(c, 0.02, 0.1 * s, 0.4 * s, w, xx * 0.27 * s, yy * s, 0);
  B(c, 0.55 * s, 0.02, 0.4 * s, w, 0, 0.01, 0);
  return 0.4 * s;
}
function lampStand(g, x, z) {
  CY(g, 0.14, 0.16, 0.03, metal(0x2a2a2a, 0.5), x, 0.015, z, 0, 0, 0, 16);
  CY(g, 0.012, 0.012, 1.4, C.brass(), x, 0.7, z, 0.05, 0, 0, 8);
  add(g, new THREE.CylinderGeometry(0.14, 0.22, 0.28, 16, 1, true), mat(0xd8c89a, { roughness: 1, side: THREE.DoubleSide }), x + 0.035, 1.42, z, 0.05, 0, 0);
}
function broom(g, x, z) { CY(g, 0.013, 0.013, 1.3, C.wood(0xc8a070), x, 0.72, z, 0.25, 0, 0.1, 6); RB(g, 0.25, 0.12, 0.05, 0.02, plastic(0xc8282a), x - 0.02, 0.07, z - 0.17); }

// ---- distribución ----
export function clutterUnit(seed, D, W) {
  const R = rng(seed);
  const g = new THREE.Group();
  const spots = []; // {x,y,z,maxW,maxH,kind}
  const zL = -W / 2 + 0.3, zR = W / 2 - 0.3;
  // estante metálico en un costado, al fondo
  const side = R() < 0.5 ? -1 : 1;
  const rack = shelfRack(g, -D + 1.3, side * (W / 2 - 0.4), 1.6, 4, 0);
  rack.tops.forEach((y, i) => {
    for (const dx of [-0.5, 0, 0.5]) {
      if (R() < 0.55) {
        const k = (R() * 4) | 0; const h = 0.18 + R() * 0.2;
        cardboardBox(rack.r, 0.34, Math.min(h, 0.45), 0.34, dx, y, 0, R() * 0.3 - 0.15, k, R() < 0.25);
      } else spots.push({ x: -D + 1.3 + dx, y, z: side * (W / 2 - 0.4), maxW: 0.42, maxH: i < 3 ? 0.5 : 0.6, kind: 'shelf' });
    }
  });
  // pila de cajas en la esquina del fondo opuesta
  const bx = -D + 0.45, bz = -side * (W / 2 - 0.45);
  let yy = 0;
  for (let i = 0; i < 3; i++) { const s = 0.62 - i * 0.08, h = 0.42 - i * 0.04; cardboardBox(g, s, h, s, bx + (R() - 0.5) * 0.06, yy, bz + (R() - 0.5) * 0.06, R() * 0.4, (R() * 4) | 0); yy += h; }
  spots.push({ x: bx, y: yy, z: bz, maxW: 0.45, maxH: 0.5, kind: 'boxtop' });
  cardboardBox(g, 0.55, 0.4, 0.5, bx + 0.7, 0, bz, R() * 0.3, (R() * 4) | 0);
  spots.push({ x: bx + 0.7, y: 0.4, z: bz, maxW: 0.45, maxH: 0.5, kind: 'boxtop' });
  // mueble grande: cómoda, sillón o colchón
  const fx = -D + 0.35, fz = 0;
  const pick = R();
  if (pick < 0.33) { const top = dresser(g, fx + 0.1, fz, Math.PI / 2); spots.push({ x: fx + 0.15, y: top, z: fz, maxW: 0.7, maxH: 0.8, kind: 'furniture' }); }
  else if (pick < 0.66) { armchair(g, fx + 0.5, fz + 0.2, Math.PI / 2 + 0.3, [0x7a5a3a, 0x3a5a6a, 0x6a2a2a][(R() * 3) | 0]); mattress(g, fx - 0.05, fz - 0.9, Math.PI / 2); }
  else { mattress(g, fx - 0.05, fz, Math.PI / 2); rolledRug(g, fx + 0.15, fz + 0.9, 0); }
  // lona sobre un bulto y bolsas
  if (R() < 0.7) tarpLump(g, -D / 2 - 0.2, side * (W / 2 - 0.55), 0.55, 0.7, 0.45, seed + 1);
  for (let i = 0; i < 1 + ((R() * 3) | 0); i++) trashBag(g, -1.2 - R() * 1.5, -side * (W / 2 - 0.35 - R() * 0.3), 0.8 + R() * 0.4, seed + i + 7);
  // contenedores y sillas / llantas / huacal
  const top = bin(g, -D / 2 + 0.4, -side * (W / 2 - 0.35), [0x2a5aa8, 0x3a8a4a, 0xc8a020][(R() * 3) | 0]);
  spots.push({ x: -D / 2 + 0.4, y: top, z: -side * (W / 2 - 0.35), maxW: 0.5, maxH: 0.5, kind: 'boxtop' });
  if (R() < 0.5) chairStack(g, -1.1, side * (W / 2 - 0.4), 2 + ((R() * 3) | 0), R());
  else tire(g, -1.1, side * (W / 2 - 0.45), 2 + ((R() * 2) | 0));
  const ch = crate(g, -2.2, 0, 0.45 * (R() < 0.5 ? 1 : -1), 1, R() * 0.5);
  spots.push({ x: -2.2, y: ch, z: 0.45 * Math.sign(R() - 0.5), maxW: 0.45, maxH: 0.55, kind: 'boxtop' });
  if (R() < 0.6) lampStand(g, -D + 0.5, side * 0.3);
  if (R() < 0.6) broom(g, -0.4, side * (W / 2 - 0.2));
  // piso libre
  for (const [x, z] of [[-D + 1.4, 0], [-D / 2, 0.1], [-2.4, -0.45], [-1.7, 0.3], [-D / 2 - 0.6, -0.5]]) spots.push({ x, y: 0, z, maxW: 1.1, maxH: 2.4, kind: 'floor' });
  // polvo y manchas
  for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.3 + R() * 0.6, 20), mat(0x6a6454, { transparent: true, opacity: 0.1, roughness: 1, depthWrite: false })); p.rotation.x = -Math.PI / 2; p.position.set(-R() * D, 0.002, (R() - 0.5) * W * 0.8); g.add(p); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { group: g, spots };
}

// despachador de agua con garrafón de 20 L (perfil torneado con anillos)
export function waterCooler() {
  const g = new THREE.Group();
  const white = plastic(0xecebe6, 0.4), grey = plastic(0x9a9ea3, 0.4);
  RB(g, 0.32, 0.86, 0.32, 0.04, white, 0, 0.43, 0);
  RB(g, 0.26, 0.34, 0.012, 0.01, grey, 0, 0.62, 0.162);                    // panel frontal
  RB(g, 0.2, 0.025, 0.1, 0.008, plastic(0x3a3d42, 0.5), 0, 0.46, 0.2);        // charola
  for (let i = 0; i < 6; i++) B(g, 0.17, 0.004, 0.006, grey, 0, 0.475, 0.16 + i * 0.013);
  for (const [x, c] of [[-0.06, 0x2a6ad8], [0.06, 0xd83a2a]]) { RB(g, 0.05, 0.06, 0.05, 0.012, plastic(c, 0.3), x, 0.64, 0.19); CY(g, 0.008, 0.008, 0.05, grey, x, 0.595, 0.2, 0, 0, 0, 8); }
  RB(g, 0.3, 0.05, 0.3, 0.02, grey, 0, 0.885, 0);
  // garrafón: cuerpo con anillos, hombro y cuello hacia abajo
  const prof = [[0, 0.02], [0.03, 0.02], [0.034, 0.0], [0.045, 0.0], [0.048, 0.06], [0.1, 0.1], [0.13, 0.14], [0.14, 0.18]];
  for (let k = 0; k < 4; k++) { const y = 0.2 + k * 0.08; prof.push([0.142, y], [0.132, y + 0.02], [0.142, y + 0.04]); }
  prof.push([0.142, 0.52], [0.13, 0.56], [0.08, 0.585], [0, 0.59]);
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 40);
  const bottle = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({ color: 0x7ab8e8, roughness: 0.08, transmission: 0.6, transparent: true, opacity: 0.55, thickness: 0.1, depthWrite: false }));
  bottle.position.y = 0.91; g.add(bottle);
  const water = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.3, 32), mat(0x3a8ad8, { transparent: true, opacity: 0.35, roughness: 0.1 }));
  water.position.y = 0.91 + 0.33; g.add(water);
  CY(g, 0.05, 0.05, 0.03, plastic(0x2a6ad8, 0.3), 0, 0.905, 0, 0, 0, 0, 20);
  // etiqueta
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.1435, 0.1435, 0.1, 40, 1, true, -0.8, 1.6), mat(0xffffff, { map: canvasTex('garrafonlab', 256, 64, (c, w, h) => { c.fillStyle = '#1a5ab8'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'bold 30px system-ui'; c.textAlign = 'center'; c.fillText('AGUA PURIFICADA', w / 2, 30); c.font = '18px system-ui'; c.fillText('20 L', w / 2, 54); }), roughness: 0.6 }));
  lab.position.y = 0.91 + 0.44; g.add(lab);
  g.traverse(o => { if (o.isMesh && !o.material.transparent) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
