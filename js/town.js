// Expansión del barrio: calles laterales, lotes para negocios, camino trasero hacia la central de contenedores.
// Coordenadas del mundo. Calle principal en z≈49 (banqueta norte z 42–44.35). Bodegas en |x|<16.7, z −34..42.
// Lado izquierdo (sgn=−1) y derecho (sgn=+1): calle lateral |x| 19.5–26, banquetas 16.9–19.5 y 26–28.5,
// lotes |x| 28.5–42.5 en z = LOT_Z ± 7. Terminal detrás de las bodegas (portón en z = −48.5).
import { THREE, mat, metal, plastic, C, canvasTex, labelTex, rng, add, B, RB, CY, TO, TU, grp } from './modelkit.js';
import { createForest, makeBush, grassField, flowerField, leafyPlant } from './vegetation.js';
import { trashCan, trashBagMesh } from './props.js';

export const LOT_Z = [35, 20, 5, -10, -25];
export const STREET = { in: 16.9, curbIn: 19.5, curbOut: 26, out: 28.5, lot: 28.5, lotEnd: 42.5, wall: 46, zTop: 44.4, zBack: -42 };
export const BACK_ROAD = { z0: -48.5, z1: -42 };
// origen de un lote (frente del lote en la banqueta, +z local apunta a la calle)
export function lotFrame(sgn, i) { return { x: sgn * STREET.lot, z: LOT_Z[i], ry: sgn < 0 ? Math.PI / 2 : -Math.PI / 2 }; }

const R0 = rng(77);
const rr = (R, a, b) => a + R() * (b - a);

// ---------------- texturas ----------------
const T = {
  asphalt: canvasTex('tw-asph', 512, 512, (c, w) => {
    c.fillStyle = '#4b4c4f'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 26000; i++) { const v = 45 + R0() * 70 | 0; c.fillStyle = `rgba(${v},${v},${v},0.55)`; c.fillRect(R0() * w, R0() * w, 2, 2); }
    for (let i = 0; i < 14; i++) { const x = R0() * w, y = R0() * w, r = 20 + R0() * 60; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(20,20,22,0.35)'); g.addColorStop(1, 'rgba(20,20,22,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.strokeStyle = 'rgba(25,25,25,0.7)'; c.lineWidth = 1.5;
    for (let i = 0; i < 7; i++) { let x = R0() * w, y = R0() * w; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 9; s++) { x += (R0() - 0.5) * 40; y += (R0() - 0.5) * 40; c.lineTo(x, y); } c.stroke(); }
    for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(30,30,32,0.9)'; c.beginPath(); const x = R0() * w, y = R0() * w; c.ellipse(x, y, 10 + R0() * 18, 8 + R0() * 12, R0() * 3, 0, 7); c.fill(); }
  }, true),
  walk: canvasTex('tw-walk', 256, 256, (c, w) => {
    c.fillStyle = '#bfbab0'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 6000; i++) { const k = R0() < 0.5 ? 0 : 255; c.fillStyle = `rgba(${k},${k},${k},${R0() * 0.06})`; c.fillRect(R0() * w, R0() * w, 2, 2); }
    for (let i = 0; i < 5; i++) { const x = R0() * w, y = R0() * w, r = 10 + R0() * 30; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(90,80,60,0.15)'); g.addColorStop(1, 'rgba(90,80,60,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    c.strokeStyle = 'rgba(70,65,55,0.55)'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, w - 3, w - 3);
  }, true),
  dirt: canvasTex('tw-dirt', 256, 256, (c, w) => {
    c.fillStyle = '#7d6a4e'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 50; i++) { const x = R0() * w, y = R0() * w, r = 8 + R0() * 40; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, R0() < 0.5 ? 'rgba(60,48,30,0.4)' : 'rgba(150,132,98,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let i = 0; i < 1800; i++) { c.fillStyle = `rgba(${R0() < 0.3 ? '200,190,170' : '40,30,20'},${R0() * 0.35})`; c.fillRect(R0() * w, R0() * w, 2, 2); }
  }, true),
  chain: canvasTex('tw-chain', 128, 128, (c, w) => {
    c.strokeStyle = 'rgba(196,200,202,1)'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(0, w / 2); c.lineTo(w / 2, 0); c.lineTo(w, w / 2); c.lineTo(w / 2, w); c.closePath(); c.stroke();
  }, true),
  block: canvasTex('tw-block', 256, 256, (c, w) => {
    c.fillStyle = '#a9a69e'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${R0() * 0.07})`; c.fillRect(R0() * w, R0() * w, 2, 2); }
    c.strokeStyle = 'rgba(60,60,55,0.6)'; c.lineWidth = 3;
    for (let r = 0; r < 5; r++) { c.beginPath(); c.moveTo(0, r * 51.2); c.lineTo(w, r * 51.2); c.stroke(); for (let x = r % 2 ? 64 : 0; x < w; x += 128) { c.beginPath(); c.moveTo(x, r * 51.2); c.lineTo(x, r * 51.2 + 51.2); c.stroke(); } }
  }, true),
  graffiti: canvasTex('tw-graf', 512, 128, (c, w, h) => {
    c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h);
    c.font = 'bold 84px Impact, system-ui'; c.lineWidth = 8; c.strokeStyle = '#1a1a2a'; c.fillStyle = '#e84a8a';
    c.save(); c.translate(40, 100); c.rotate(-0.06); c.strokeText('BARRIO', 0, 0); c.fillText('BARRIO', 0, 0); c.restore();
    c.fillStyle = '#3ad0e8'; c.font = 'bold 50px Impact, system-ui'; c.fillText('VAULT', 330, 70);
  }),
};
const M = {
  asphalt: mat(0xffffff, { map: T.asphalt, roughness: 0.93 }),
  walk: mat(0xffffff, { map: T.walk, roughness: 0.9 }),
  curb: mat(0xd2cdc3, { roughness: 0.8 }),
  curbY: mat(0xe0b52a, { roughness: 0.7 }),
  paintW: mat(0xeeeeea, { roughness: 0.6 }),
  paintY: mat(0xe8c23a, { roughness: 0.6 }),
  dirt: mat(0xffffff, { map: T.dirt, roughness: 1 }),
  chain: mat(0xffffff, { map: T.chain, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.6 }),
  post: metal(0x9aa0a3, 0.35),
  pole: metal(0x5f6468, 0.45),
  block: mat(0xffffff, { map: T.block, roughness: 0.95 }),
  concrete: mat(0xb5b0a6, { roughness: 0.9 }),
  lamp: mat(0xfff3d6, { emissive: 0xffd89a, emissiveIntensity: 0.25 }),
  wood: C.wood(0x8a6a44),
  sign: mat(0x1a6a3a, { roughness: 0.5 }),
};

// ---------------- utilidades ----------------
function uvBox(w, h, d, s = 1) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] * s, uv.getY(i) * dims[f][1] * s); }
  return g;
}
function slab(g, x0, x1, z0, z1, h, m, s = 1, y = 0) { const b = add(g, uvBox(x1 - x0, h, z1 - z0, s), m, (x0 + x1) / 2, y + h / 2, (z0 + z1) / 2); b.castShadow = false; return b; }
function plane(g, x0, x1, z0, z1, y, m, s = 1) {
  const w = x1 - x0, d = z1 - z0, geo = new THREE.PlaneGeometry(w, d), uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * s, uv.getY(i) * d * s);
  geo.rotateX(-Math.PI / 2);
  const p = add(g, geo, m, (x0 + x1) / 2, y, (z0 + z1) / 2); p.castShadow = false; return p;
}
const col = (m) => { m.userData.col = true; return m; };
const hiddenCol = (g, x0, z0, x1, z1, h = 2) => { const b = add(g, new THREE.BoxGeometry(Math.abs(x1 - x0), h, Math.abs(z1 - z0)), M.post, (x0 + x1) / 2, h / 2, (z0 + z1) / 2); b.visible = false; return col(b); };
// reja de malla ciclónica entre dos puntos
function fence(g, x0, z0, x1, z1, h = 2.1, barbed = false) {
  const dx = x1 - x0, dz = z1 - z0, len = Math.hypot(dx, dz);
  const geo = new THREE.PlaneGeometry(len, h - 0.1), uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 0.15, uv.getY(i) * (h - 0.1) / 0.15);
  const m = add(g, geo, M.chain, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, 0, Math.atan2(-dz, dx)); m.castShadow = true;
  const n = Math.ceil(len / 3);
  for (let i = 0; i <= n; i++) { CY(g, 0.04, 0.04, h + 0.05, M.post, x0 + dx * i / n, (h + 0.05) / 2, z0 + dz * i / n, 0, 0, 0, 8); }
  TU(g, [[x0, h, z0], [x1, h, z1]], 0.025, M.post, false, 4);
  if (barbed) for (let k = 0; k < 3; k++) TU(g, [[x0, h + 0.12 + k * 0.1, z0], [x1, h + 0.12 + k * 0.1, z1]], 0.006, metal(0x6a6a6a, 0.5), false, 4);
  hiddenCol(g, Math.min(x0, x1) - 0.06, Math.min(z0, z1) - 0.06, Math.max(x0, x1) + 0.06, Math.max(z0, z1) + 0.06, h);
}
function streetLamp(g, x, z, dirX) {
  const p = grp(g, x, 0, z);
  CY(p, 0.09, 0.13, 0.5, M.pole, 0, 0.25, 0, 0, 0, 0, 12);
  CY(p, 0.06, 0.085, 7.2, M.pole, 0, 3.7, 0, 0, 0, 0, 12);
  TU(p, [[0, 7.2, 0], [dirX * 0.4, 7.7, 0], [dirX * 1.4, 7.75, 0]], 0.045, M.pole, false, 12);
  const head = grp(p, dirX * 1.55, 7.7, 0);
  RB(head, 0.7, 0.14, 0.32, 0.05, M.pole, 0, 0, 0);
  add(head, new THREE.BoxGeometry(0.56, 0.02, 0.22), M.lamp, 0, -0.075, 0).castShadow = false;
  hiddenCol(g, x - 0.15, z - 0.15, x + 0.15, z + 0.15);
}
function streetSign(g, x, z, text, ry) {
  CY(g, 0.035, 0.035, 2.7, M.pole, x, 1.35, z, 0, 0, 0, 8);
  const s = grp(g, x, 2.55, z, 0, ry);
  const tex = labelTex(text, { bg: '#0f5a8a', fg: '#ffffff', w: 512, h: 110, font: 'bold 52px Rubik, system-ui', border: '#ffffff' });
  for (const d of [-1, 1]) { const p = add(s, new THREE.PlaneGeometry(1.2, 0.26), mat(0xffffff, { map: tex, roughness: 0.4, side: THREE.FrontSide }), 0, 0, d * 0.012, 0, d < 0 ? Math.PI : 0); p.castShadow = false; }
  B(s, 1.22, 0.28, 0.02, M.pole, 0, 0, 0);
}
function planter(g, x, z, seed) {
  RB(g, 1.1, 0.4, 1.1, 0.05, M.concrete, x, 0.35, z);
  add(g, new THREE.BoxGeometry(0.98, 0.02, 0.98), M.dirt, x, 0.555, z).castShadow = false;
  const p = leafyPlant(1.3, seed); p.position.set(x, 0.55, z); g.add(p);
  hiddenCol(g, x - 0.55, z - 0.55, x + 0.55, z + 0.55, 0.6);
}
function forSaleSign(g, x, z, ry, title, sub, color = '#c0392b') {
  const s = grp(g, x, 0, z, 0, ry);
  for (const dx of [-1.1, 1.1]) CY(s, 0.05, 0.06, 2.6, M.wood, dx, 1.3, 0, 0, 0, 0, 8);
  RB(s, 2.7, 1.35, 0.06, 0.02, mat(0xf4f2ea, { roughness: 0.6 }), 0, 1.95, 0);
  const tex = labelTex(title, { bg: color, fg: '#ffffff', w: 1024, h: 300, font: 'bold 150px Rubik, system-ui', sub, subFont: 'bold 62px Rubik, system-ui' });
  const p = add(s, new THREE.PlaneGeometry(2.55, 0.75), mat(0xffffff, { map: tex, roughness: 0.5 }), 0, 2.1, 0.035); p.castShadow = false;
  const t2 = labelTex('Tel. 55 1234 5678', { bg: '#f4f2ea', fg: '#222', w: 512, h: 90, font: 'bold 54px Rubik, system-ui' });
  add(s, new THREE.PlaneGeometry(1.6, 0.28), mat(0xffffff, { map: t2 }), 0, 1.5, 0.035).castShadow = false;
  hiddenCol(s, -1.2, -0.1, 1.2, 0.1, 2.5);
  return s;
}
function weeds(R, x0, x1, z0, z1, n) {
  const list = [];
  for (let i = 0; i < n; i++) list.push([rr(R, x0, x1), rr(R, z0, z1), rr(R, 0.8, 1.7), R() * 6]);
  return grassField(list);
}

// ---------------- lado sin abrir: terreno baldío cercado y lleno de maleza ----------------
export function buildSideWild(sgn) {
  const g = new THREE.Group(), R = rng(sgn < 0 ? 311 : 733);
  const X = v => sgn * v;
  const xi = STREET.in - 0.2, xo = STREET.wall;
  // piso de tierra y hierba
  plane(g, Math.min(X(xi), X(xo)), Math.max(X(xi), X(xo)), STREET.zBack - 2, 41.7, 0.004, M.dirt, 0.35);
  g.add(weeds(R, Math.min(X(xi), X(xo)) + 0.3, Math.max(X(xi), X(xo)) - 0.3, STREET.zBack - 1.5, 41.3, 2600));
  const fl = []; for (let k = 0; k < 18; k++) { const cx = X(rr(R, 20, 44)), cz = rr(R, -40, 40); for (let i = 0; i < 6; i++) fl.push([cx + rr(R, -1, 1), -0.02, cz + rr(R, -1, 1), rr(R, 0.6, 1), R() * 6]); }
  g.add(flowerField(fl, sgn < 0 ? 1 : 4));
  for (let i = 0; i < 26; i++) { const b = makeBush(rr(R, 0.8, 1.6), i + (sgn < 0 ? 0 : 50)); b.position.set(X(rr(R, 20, 45)), -0.1, rr(R, -42, 40)); g.add(b); }
  // árboles del baldío (instanciados dentro del grupo, se van al abrir la calle)
  const f = createForest(g);
  for (let i = 0; i < 22; i++) { const x = X(rr(R, 21, 45)), z = rr(R, -41, 38); f.add(x, z, rr(R, 0.8, 1.35)); hiddenCol(g, x - 0.3, z - 0.3, x + 0.3, z + 0.3, 3); }
  f.build();
  // cascajo, llantas, colchón viejo, bolsas
  for (let i = 0; i < 10; i++) { const s = rr(R, 0.3, 0.8); const m = add(g, new THREE.DodecahedronGeometry(s, 1), mat(0x8a8274, { roughness: 1 }), X(rr(R, 21, 44)), s * 0.3, rr(R, -40, 38), R() * 3, R() * 3, 0); m.scale.y = 0.45; }
  for (let i = 0; i < 5; i++) TO(g, 0.33, 0.12, C.rubber(), X(rr(R, 21, 44)), 0.12, rr(R, -38, 38), Math.PI / 2 + rr(R, -0.3, 0.3));
  for (let i = 0; i < 4; i++) { const b = trashBagMesh(i + (sgn < 0 ? 3 : 9), 0x141414, 0.8); b.position.set(X(rr(R, 21, 30)), 0, rr(R, 30, 40)); g.add(b); }
  // rejas: al frente sobre la banqueta, afuera, atrás y la del patio de bodegas
  fence(g, X(16.7), 41.8, X(xo), 41.8, 2.1, true);
  fence(g, X(xo), 41.8, X(xo), STREET.zBack - 2, 2.1, true);
  fence(g, X(16.7), STREET.zBack - 2, X(xo), STREET.zBack - 2, 2.1, true);
  fence(g, X(16.7), -34, X(16.7), 42);
  fence(g, X(16.7), STREET.zBack - 2, X(16.7), -34);
  // grafiti en una lámina y letrero de venta hacia la calle principal
  const lam = add(g, new THREE.PlaneGeometry(3.2, 1.6), mat(0xffffff, { map: T.graffiti, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide }), X(35), 1.1, 41.74); lam.castShadow = false;
  forSaleSign(g, X(27), 40.6, 0, 'SE VENDE', 'ZONA COMERCIAL · LOTES PARA NEGOCIO');
  g.traverse(o => { if (o.isMesh && !o.isInstancedMesh) o.receiveShadow = true; });
  return g;
}

// ---------------- lado abierto: calle lateral, banquetas, luminarias y lotes ----------------
export function buildSideOpen(sgn, { backRoad = false } = {}) {
  const g = new THREE.Group(), R = rng(sgn < 0 ? 911 : 533);
  const X = v => sgn * v, lo = (a, b) => [Math.min(X(a), X(b)), Math.max(X(a), X(b))];
  const zb = backRoad ? BACK_ROAD.z0 : STREET.zBack;
  // arroyo vehicular (entra a la calle principal cruzando la banqueta)
  const [a0, a1] = lo(STREET.curbIn, STREET.curbOut);
  plane(g, a0, a1, zb, STREET.zTop, 0.012, M.asphalt, 0.18);
  slab(g, a0, a1, 42, 44.36, 0.16, M.asphalt, 0.18);                         // rampa sobre la banqueta principal
  for (let z = zb + 2; z < 40; z += 4.5) add(g, new THREE.BoxGeometry(0.13, 0.01, 2.3), M.paintY, X((STREET.curbIn + STREET.curbOut) / 2), 0.02, z).castShadow = false;
  for (let x = STREET.curbIn + 0.5; x < STREET.curbOut - 0.3; x += 0.9) add(g, new THREE.BoxGeometry(0.5, 0.011, 2.6), M.paintW, X(x), 0.02, 40.2).castShadow = false; // paso de cebra
  add(g, new THREE.BoxGeometry(STREET.curbOut - STREET.curbIn - 0.2, 0.011, 0.3), M.paintW, X((STREET.curbIn + STREET.curbOut) / 2), 0.021, 38.5).castShadow = false;
  // banquetas con guarnición
  for (const [i0, i1] of [[STREET.in, STREET.curbIn], [STREET.curbOut, STREET.out]]) {
    const [b0, b1] = lo(i0, i1);
    slab(g, b0, b1, zb + (backRoad && i0 < 20 ? 6.5 : 0), 42, 0.15, M.walk, 1 / 1.25);
    const cx = i0 < 20 ? X(STREET.curbIn) : X(STREET.curbOut);
    add(g, uvBox(0.16, 0.18, 42 - zb, 1), M.curb, cx - sgn * (i0 < 20 ? 0.08 : -0.08), 0.09, (zb + 42) / 2).castShadow = false;
  }
  // pintura amarilla en la esquina (no estacionarse)
  add(g, new THREE.BoxGeometry(0.17, 0.185, 6), M.curbY, X(STREET.curbOut + 0.08), 0.093, 38.5).castShadow = false;
  // luminarias y árboles en jardinera sobre la banqueta exterior
  for (const z of [36, 20, 4, -12, -28]) streetLamp(g, X(STREET.out - 0.45), z + 7.5, -sgn);
  for (const z of LOT_Z) planter(g, X(STREET.out - 0.7), z + 7.5 - 3.8, Math.round(z + sgn * 10));
  for (const z of [30, 8, -18]) planter(g, X(STREET.in + 0.8), z, Math.round(z * 3 + sgn));
  streetSign(g, X(STREET.curbOut + 0.4), 41.2, sgn < 0 ? 'CALLE DE LOS COLECCIONISTAS' : 'CALLE DEL TIANGUIS', sgn < 0 ? Math.PI / 2 : -Math.PI / 2);
  // cerca/barda perimetral detrás de los lotes
  const [w0, w1] = lo(STREET.lotEnd + 0.4, STREET.wall);
  plane(g, w0, w1, zb, 42, 0.006, M.dirt, 0.35);
  add(g, uvBox(0.2, 2.2, 42 - zb, 0.5), M.block, X(STREET.wall), 1.1, (zb + 42) / 2); hiddenCol(g, X(STREET.wall) - 0.12, zb, X(STREET.wall) + 0.12, 42, 2.2);
  for (let z = zb + 3; z < 40; z += 6) { const b = makeBush(rr(R, 1, 1.6), Math.round(z) + 7); b.position.set(X(rr(R, 43.5, 45.2)), -0.1, z + rr(R, -1, 1)); g.add(b); }
  const f = createForest(g); for (let z = zb + 4; z < 38; z += rr(R, 7, 11)) f.add(X(44.6), z, rr(R, 0.8, 1.1)); f.build();
  // guarnición al fondo si no hay camino trasero
  if (!backRoad) { add(g, uvBox(STREET.curbOut - STREET.curbIn, 0.9, 0.3, 0.5), M.block, X((STREET.curbIn + STREET.curbOut) / 2), 0.45, zb - 0.15); hiddenCol(g, a0, zb - 0.4, a1, zb, 1); for (const x of [STREET.curbIn + 1.2, STREET.curbOut - 1.2]) { CY(g, 0.12, 0.12, 0.9, mat(0xf2c230, { roughness: 0.5 }), X(x), 0.45, zb + 0.4, 0, 0, 0, 12); } }
  // la reja del patio de bodegas ya no está: queda abierto hacia la calle lateral
  g.traverse(o => { if (o.isMesh && !o.isInstancedMesh) o.receiveShadow = true; });
  return g;
}

// ---------------- lote vacío (marco local del lote: +z hacia la calle, x ±7, z −14..0) ----------------
export function buildEmptyLot(seed = 1, label = 'SE VENDE', sub = 'LOTE PARA NEGOCIO') {
  const g = new THREE.Group(), R = rng(seed * 13 + 1);
  plane(g, -6.9, 6.9, -13.9, -0.1, 0.006, M.dirt, 0.35);
  g.add(weeds(R, -6.6, 6.6, -13.6, -0.6, 520));
  for (let i = 0; i < 5; i++) { const b = makeBush(rr(R, 0.7, 1.3), seed * 5 + i); b.position.set(rr(R, -6, 6), -0.1, rr(R, -13, -3)); g.add(b); }
  for (let i = 0; i < 4; i++) { const s = rr(R, 0.25, 0.6); const m = add(g, new THREE.DodecahedronGeometry(s, 1), mat(0x8a8274, { roughness: 1 }), rr(R, -6, 6), s * 0.3, rr(R, -12, -3), R() * 3, R() * 3, 0); m.scale.y = 0.45; }
  // mojoneras en las esquinas y cinta de obra
  for (const [x, z] of [[-6.9, -0.2], [6.9, -0.2], [-6.9, -13.8], [6.9, -13.8]]) { add(g, new THREE.BoxGeometry(0.15, 0.5, 0.15), M.concrete, x, 0.25, z); add(g, new THREE.BoxGeometry(0.16, 0.08, 0.16), mat(0xe03a2a), x, 0.5, z); }
  forSaleSign(g, 3.4, -0.9, 0, label, sub, label === 'SE VENDE' ? '#c0392b' : '#1a6a3a');
  g.traverse(o => { if (o.isMesh && !o.isInstancedMesh) { o.receiveShadow = true; } });
  return g;
}
// obra en proceso: andamios, block, lona (se muestra mientras "se construye")
export function buildConstruction(seed = 1) {
  const g = new THREE.Group(), R = rng(seed);
  plane(g, -6.9, 6.9, -13.9, -0.1, 0.008, M.concrete, 0.4);
  const tube = metal(0x8a8e92, 0.4);
  for (const x of [-5.5, -1.8, 1.8, 5.5]) for (const z of [-2.2, -12]) CY(g, 0.03, 0.03, 6, tube, x, 3, z, 0, 0, 0, 8);
  for (const y of [1.5, 3, 4.5]) for (const z of [-2.2, -12]) { add(g, new THREE.CylinderGeometry(0.025, 0.025, 11, 6), tube, 0, y, z, 0, 0, Math.PI / 2); add(g, uvBox(11, 0.05, 0.9, 1), C.wood(0xb8905a), 0, y + 0.05, z + 0.45); }
  const lona = add(g, new THREE.PlaneGeometry(11.4, 5.8), mat(0x2a7a3a, { roughness: 0.9, transparent: true, opacity: 0.85, side: THREE.DoubleSide }), 0, 3, -1.7); lona.castShadow = false;
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) add(g, new THREE.BoxGeometry(0.39, 0.19, 0.19), M.concrete, -3 + j * 0.42, 0.1 + i * 0.2, -6 + (i % 2) * 0.1);
  hiddenCol(g, -6, -12.5, 6, -1.6, 3);
  return g;
}

// ---------------- camino trasero hacia la central de contenedores ----------------
export function buildBackRoad(leftOpen, rightOpen) {
  const g = new THREE.Group();
  const xa = leftOpen ? -STREET.curbOut : -STREET.in, xb = STREET.curbOut;
  plane(g, xa, xb, BACK_ROAD.z0, BACK_ROAD.z1, 0.013, M.asphalt, 0.18);
  for (let x = xa + 2; x < xb - 2; x += 4.5) add(g, new THREE.BoxGeometry(2.3, 0.01, 0.13), M.paintY, x, 0.022, (BACK_ROAD.z0 + BACK_ROAD.z1) / 2).castShadow = false;
  // banqueta del lado de las bodegas
  slab(g, -STREET.in, STREET.in, BACK_ROAD.z1, BACK_ROAD.z1 + 2.2, 0.15, M.walk, 1 / 1.25);
  add(g, uvBox(STREET.in * 2, 0.18, 0.16, 1), M.curb, 0, 0.09, BACK_ROAD.z1 + 0.08).castShadow = false;
  if (!leftOpen) { add(g, uvBox(0.3, 0.9, BACK_ROAD.z1 - BACK_ROAD.z0, 0.5), M.block, xa - 0.15, 0.45, (BACK_ROAD.z0 + BACK_ROAD.z1) / 2); hiddenCol(g, xa - 0.4, BACK_ROAD.z0, xa, BACK_ROAD.z1, 1); }
  for (const x of [-12, 0, 12]) streetLamp(g, x, BACK_ROAD.z1 + 1.6, 0.0001);
  streetSign(g, 14, BACK_ROAD.z1 + 1.2, 'AV. DE LOS CONTENEDORES', 0);
  g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
  return g;
}
// bosque detrás de las bodegas (desaparece al construir la central)
export function buildTerminalWild() {
  const g = new THREE.Group(), R = rng(4242);
  const f = createForest(g);
  for (let i = 0; i < 70; i++) f.add(rr(R, -44, 44), rr(R, -98, -46), rr(R, 1, 1.7));
  f.build();
  g.add(weeds(R, -45, 45, -99, -44, 2600));
  for (let i = 0; i < 20; i++) { const b = makeBush(rr(R, 0.9, 1.7), 300 + i); b.position.set(rr(R, -44, 44), -0.1, rr(R, -98, -45)); g.add(b); }
  fence(g, -STREET.in, -44, STREET.in, -44, 2.1, true);
  forSaleSign(g, 6, -43.2, Math.PI, 'PRÓXIMAMENTE', 'CENTRAL DE CONTENEDORES', '#1a4a8a');
  g.traverse(o => { if (o.isMesh && !o.isInstancedMesh) o.receiveShadow = true; });
  return g;
}
