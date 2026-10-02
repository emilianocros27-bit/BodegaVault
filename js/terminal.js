// Central de contenedores: contenedores ISO, tractocamión con chasis portacontenedor,
// patio de la terminal y agencia de autos. Unidades en metros (+y arriba, ojo del jugador a 1.7 m).
// Todo lo estático se fusiona por material (MB) para mantener pocas llamadas de dibujo.
import { THREE, mat, metal, glass, emissive, C, canvasTex, rng } from './modelkit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Autos decorativos: se cargan de forma diferida para que este módulo no dependa de cars.js.
let _makeCar = null;
const carsReady = import('./cars.js').then(m => (_makeCar = m.makeCar)).catch(e => console.warn('terminal: cars.js no disponible', e));
function lazyCar(parent, type, color, x, z, ry) {
  const h = new THREE.Group(); h.position.set(x, 0, z); h.rotation.y = ry; parent.add(h);
  const put = () => { if (!_makeCar) return; try { h.add(_makeCar(type, color)); } catch (e) { console.warn(e); } };
  if (_makeCar) put(); else carsReady.then(put);
  return h;
}

const PI = Math.PI, HP = Math.PI / 2;

// =====================================================================================
// Infraestructura: constructor que fusiona geometrías por material
// =====================================================================================
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3();
const KEEP = ['position', 'normal', 'uv'];
function prep(geo) {
  if (geo.index) geo = geo.toNonIndexed();
  for (const k of Object.keys(geo.attributes)) if (!KEEP.includes(k)) geo.deleteAttribute(k);
  if (!geo.attributes.normal) geo.computeVertexNormals();
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
  geo.clearGroups();
  geo.morphAttributes = {};
  return geo;
}
const mtx = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) =>
  new THREE.Matrix4().compose(_v.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz));

class MB {
  constructor(bk = new Map(), base = new THREE.Matrix4()) { this.bk = bk; this.base = base; }
  at(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) { return new MB(this.bk, this.base.clone().multiply(mtx(x, y, z, rx, ry, rz))); }
  putM(geo, m, M) {
    geo = prep(geo);
    geo.applyMatrix4(M ? this.base.clone().multiply(M) : this.base);
    let a = this.bk.get(m); if (!a) this.bk.set(m, (a = []));
    a.push(geo);
    return this;
  }
  put(geo, m, x, y, z, rx, ry, rz, sx, sy, sz) { return this.putM(geo, m, mtx(x, y, z, rx, ry, rz, sx, sy, sz)); }
  box(w, h, d, m, x, y, z, rx, ry, rz, uvs) { return this.put(uvs ? uvBox(w, h, d, uvs) : new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz); }
  cyl(rt, rb, h, m, x, y, z, rx, ry, rz, seg = 16, open = false) { return this.put(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m, x, y, z, rx, ry, rz); }
  sph(r, m, x, y, z, sx = 1, sy = 1, sz = 1, seg = 14) { return this.put(new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.6 | 0)), m, x, y, z, 0, 0, 0, sx, sy, sz); }
  plane(w, h, m, x, y, z, rx, ry, rz, uvs) { return this.put(uvs ? uvPlaneV(w, h, uvs) : new THREE.PlaneGeometry(w, h), m, x, y, z, rx, ry, rz); }
  // plano horizontal (mirando +y) con UV en metros
  flat(x0, z0, x1, z1, m, y = 0, uvs = 0.25) { return this.put(uvPlaneV(x1 - x0, z1 - z0, uvs), m, (x0 + x1) / 2, y, (z0 + z1) / 2, -HP); }
  // caja orientada entre dos puntos (eje largo = a→b)
  beam(a, b, w, d, m, roll = 0) {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), dir = Bv.clone().sub(A), len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    if (roll) q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), roll));
    const M = new THREE.Matrix4().compose(A.add(Bv).multiplyScalar(0.5), q, _s.set(1, 1, 1));
    return this.putM(new THREE.BoxGeometry(w, len, d), m, M);
  }
  tube(a, b, r, m, seg = 8) {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), dir = Bv.clone().sub(A), len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return this.putM(new THREE.CylinderGeometry(r, r, len, seg, 1, true), m, new THREE.Matrix4().compose(A.add(Bv).multiplyScalar(0.5), q, _s.set(1, 1, 1)));
  }
  curve(pts, r, m, seg = 24, rad = 6) {
    const cv = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
    return this.put(new THREE.TubeGeometry(cv, seg, r, rad, false), m);
  }
  build(parent, o = {}) {
    const out = [];
    for (const [m, geos] of this.bk) {
      const g = mergeGeometries(geos, false);
      if (!g) { console.warn('terminal: merge failed', m); continue; }
      g.computeBoundingSphere();
      const mesh = new THREE.Mesh(g, m);
      mesh.castShadow = o.cast ?? (!m.transparent && !m.userData.noCast);
      mesh.receiveShadow = !m.userData.noRecv;
      if (o.name) mesh.name = o.name;
      parent.add(mesh); out.push(mesh);
    }
    this.bk.clear();
    return out;
  }
}

function uvBox(w, h, d, s = 1) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] * s, uv.getY(i) * dims[f][1] * s); }
  return g;
}
function uvPlaneV(w, h, s = 1) {
  const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * s, uv.getY(i) * h * s);
  return g;
}
// plano con UV restringido a una región del atlas (px del canvas)
function atlasPlane(w, h, reg, W, H) {
  const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv;
  const [x0, y0, x1, y1] = reg;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (x0 + uv.getX(i) * (x1 - x0)) / W, 1 - (y1 - uv.getY(i) * (y1 - y0)) / H);
  return g;
}
// silueta 2D con esquinas redondeadas: pts = [[x, y, r?], ...]
function rshape(pts) {
  const s = new THREE.Shape(), n = pts.length;
  const P = (i) => pts[(i + n) % n];
  for (let i = 0; i < n; i++) {
    const [x, y, r = 0] = P(i);
    if (!r) { i ? s.lineTo(x, y) : s.moveTo(x, y); continue; }
    const [px, py] = P(i - 1), [nx, ny] = P(i + 1);
    const l1 = Math.hypot(px - x, py - y), l2 = Math.hypot(nx - x, ny - y);
    const r1 = Math.min(r, l1 / 2), r2 = Math.min(r, l2 / 2);
    const ax = x + (px - x) / l1 * r1, ay = y + (py - y) / l1 * r1, bx = x + (nx - x) / l2 * r2, by = y + (ny - y) / l2 * r2;
    i ? s.lineTo(ax, ay) : s.moveTo(ax, ay);
    s.quadraticCurveTo(x, y, bx, by);
  }
  s.closePath();
  return s;
}
// extrusión de silueta lateral (plano XY) con ancho total w en z y bisel que no agranda el contorno
function exGeo(shape, w, bevel = 0.02, curveSeg = 8) {
  const depth = Math.max(0.001, w - 2 * bevel);
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: curveSeg });
  g.translate(0, 0, -depth / 2);
  return g;
}
function latheGeo(pts, seg = 28) { return new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg); }

// =====================================================================================
// Utilidades de color y dibujo
// =====================================================================================
const rgbOf = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
const lum = (c) => { const [r, g, b] = rgbOf(c); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
const css = (c, k = 1, a = 1) => { const [r, g, b] = rgbOf(c).map(v => Math.max(0, Math.min(255, v * k | 0))); return `rgba(${r},${g},${b},${a})`; };
const hashStr = (s) => [...String(s)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) | 0, 7);
function fitFont(c, tpl, text, maxW, maxPx) {
  let px = Math.max(6, maxPx | 0);
  c.font = tpl.replace('#', px);
  const w = c.measureText(text).width;
  if (w > maxW) { px = Math.max(6, px * maxW / w | 0); c.font = tpl.replace('#', px); }
  return px;
}
function noiseDots(c, w, h, R, n, col, amax = 0.08, sz = 2) {
  for (let i = 0; i < n; i++) { c.fillStyle = col(R()) ; c.globalAlpha = R() * amax; c.fillRect(R() * w, R() * h, sz, sz); }
  c.globalAlpha = 1;
}

// ---------- texturas compartidas ----------
const TXT = {};
TXT.grime = () => canvasTex('tm-grime', 256, 256, (c, w, h) => {
  const R = rng(77);
  c.fillStyle = '#efefef'; c.fillRect(0, 0, w, h);
  noiseDots(c, w, h, R, 6000, (r) => r < 0.5 ? '#000' : '#fff', 0.07);
  for (let i = 0; i < 26; i++) {
    const x = R() * w, len = h * (0.2 + R() * 0.7), y = R() * h * 0.3;
    const g = c.createLinearGradient(0, y, 0, y + len); g.addColorStop(0, 'rgba(90,60,40,0.22)'); g.addColorStop(1, 'rgba(90,60,40,0)');
    c.fillStyle = g; c.fillRect(x, y, 1 + R() * 2.5, len);
  }
  for (let i = 0; i < 14; i++) { const x = R() * w, y = R() * h, r = 3 + R() * 14; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(70,50,35,0.18)'); g.addColorStop(1, 'rgba(70,50,35,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
}, true);
TXT.cast = () => canvasTex('tm-cast', 128, 128, (c, w, h) => {
  const R = rng(5);
  c.fillStyle = '#d9d9d9'; c.fillRect(0, 0, w, h);
  noiseDots(c, w, h, R, 900, () => '#000', 0.15);
  c.fillStyle = '#6a6a6a'; c.beginPath(); c.ellipse(w / 2, h / 2, 42, 24, 0, 0, 7); c.fill();
  c.fillStyle = '#0c0c0c'; c.beginPath(); c.ellipse(w / 2, h / 2, 36, 19, 0, 0, 7); c.fill();
  c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4);
});
TXT.floor = () => canvasTex('tm-floor', 256, 256, (c, w, h) => {
  const R = rng(19);
  const n = 8, ph = h / n;
  for (let i = 0; i < n; i++) {
    const k = 0.75 + R() * 0.35;
    c.fillStyle = `rgb(${128 * k | 0},${78 * k | 0},${50 * k | 0})`; c.fillRect(0, i * ph, w, ph);
    for (let j = 0; j < 14; j++) { c.strokeStyle = `rgba(40,20,10,${0.12 + R() * 0.2})`; c.lineWidth = 0.6 + R(); const y = i * ph + R() * ph; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 16) c.lineTo(x, y + (R() - 0.5) * 2); c.stroke(); }
    c.fillStyle = 'rgba(15,8,4,0.85)'; c.fillRect(0, i * ph, w, 1.5);
    // juntas a tope y tornillos sobre travesaños
    const jx = R() * w; c.fillRect(jx, i * ph, 1.5, ph);
  }
  c.fillStyle = 'rgba(20,20,20,0.9)';
  for (let x = 0; x < w; x += 64) for (let i = 0; i < n; i++) { c.beginPath(); c.arc(x + 20, i * ph + ph / 2, 1.6, 0, 7); c.fill(); }
  for (let i = 0; i < 18; i++) { const x = R() * w, y = R() * h, r = 8 + R() * 30; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(20,12,6,0.3)'); g.addColorStop(1, 'rgba(20,12,6,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
}, true);
TXT.inner = () => canvasTex('tm-inner', 128, 32, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#7a7c7e'); g.addColorStop(0.25, '#9a9c9e'); g.addColorStop(0.5, '#8a8c8e'); g.addColorStop(0.75, '#5f6163'); g.addColorStop(1, '#7a7c7e');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}, true);

// ---------- materiales ----------
const MT = {
  paint: (c) => mat(c, { map: TXT.grime(), roughness: 0.58, metalness: 0.2, env: true, envI: 0.35 }),
  cast: (c) => mat(c, { map: TXT.cast(), roughness: 0.7, metalness: 0.25 }),
  hard: () => metal(0x9fa4a8, 0.42, { map: TXT.grime() }),
  inner: () => mat(0x6e7072, { map: TXT.inner(), roughness: 0.75 }),
  floor: () => mat(0xffffff, { map: TXT.floor(), roughness: 0.85 }),
  under: () => mat(0x1d1e1f, { roughness: 0.95 }),
  rubber: () => mat(0x151515, { roughness: 0.92 }),
  chrome: () => metal(0xf6f8fa, 0.16, { envI: 1.7 }),
  alu: () => metal(0xd4d9de, 0.26, { envI: 1.5 }),
  steel: () => metal(0x9aa1a7, 0.4, { envI: 1.3 }),
  galv: () => mat(0xaab0b4, { roughness: 0.42, metalness: 0.75, env: true, envI: 0.8 }),
  black: () => mat(0x1b1c1e, { roughness: 0.55, metalness: 0.3, env: true, envI: 0.3 }),
  blackMatte: () => mat(0x161718, { roughness: 0.85 }),
  darkGlass: () => mat(0x10171c, { roughness: 0.04, metalness: 0.5, env: true, envI: 1.5 }),
  tint: () => mat(0x1c2a33, { roughness: 0.03, metalness: 0.2, transparent: true, opacity: 0.55, env: true, envI: 1.3, depthWrite: false }),
  redLens: () => mat(0x9b0d0d, { emissive: 0xff2010, emissiveIntensity: 0.45, roughness: 0.12, env: true, envI: 0.8 }),
  amberLens: () => mat(0xd8850e, { emissive: 0xff8a00, emissiveIntensity: 0.4, roughness: 0.15, env: true, envI: 0.8 }),
  headLens: () => mat(0xf1f4f6, { emissive: 0xfff2d6, emissiveIntensity: 0.5, roughness: 0.05, metalness: 0.2, env: true, envI: 1.4 }),
};

// =====================================================================================
// CONTENEDORES
// =====================================================================================
// Tres navieras inventadas. prefix = código de propietario ISO 6346 (3 letras + U).
export const CONTAINER_BRANDS = [
  { id: 'marea', name: 'Marea Azul Lines', short: 'MAREA AZUL', prefix: 'MAZU', tagline: 'LINES', accent: 0x8fdcef,
    colors: [0x1d4f8c, 0x14737a, 0x23395d, 0x8b9197, 0x3b86b8, 0x0f5c4e] },
  { id: 'solmar', name: 'Naviera Solmar', short: 'SOLMAR', prefix: 'SOLU', tagline: 'NAVIERA DEL PACÍFICO', accent: 0xffc83a,
    colors: [0xd9621e, 0xe3ab24, 0xb3281f, 0x6f1f26, 0xcfc6b2, 0xc4431c] },
  { id: 'halcon', name: 'Halcón Global Logistics', short: 'HALCÓN', prefix: 'HGCU', tagline: 'GLOBAL LOGISTICS', accent: 0xf2f2ee,
    colors: [0x2e6a3c, 0x6a2230, 0x7a8187, 0xa4282a, 0x55632c, 0x2b2e33] },
];
const brandOf = (id) => CONTAINER_BRANDS.find(b => b.id === id) || CONTAINER_BRANDS[0];

function containerSpec(size) {
  const k = String(size).toUpperCase();
  const is40 = k.startsWith('40') || k.startsWith('45');
  const hc = k.includes('HC') || k.startsWith('45');
  return { key: k, is40, hc, L: is40 ? 12.192 : 6.058, W: 2.438, H: hc ? 2.896 : 2.591, iso: is40 ? (hc ? '45G1' : '42G1') : '22G1',
    tare: is40 ? (hc ? 3900 : 3750) : 2230, cube: is40 ? (hc ? 76.3 : 67.7) : 33.2 };
}
// dígito verificador ISO 6346
function isoCheck(s) {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const ch = s[i]; let v;
    if (ch >= '0' && ch <= '9') v = +ch;
    else { const b = ch.charCodeAt(0) - 55; v = b + Math.floor((b - 1) / 10); }
    sum += v * (1 << i);
  }
  return (sum % 11) % 10;
}
function containerCode(brand, seed) {
  const R = rng(seed * 7919 + 13);
  const num = String(100000 + Math.floor(R() * 899999));
  return { owner: brand.prefix, num, check: isoCheck(brand.prefix + num) };
}

// ---------- perfil trapezoidal y lámina corrugada ----------
function trapProf(x0, x1, pitch, depth, outer, inner) {
  const len = x1 - x0, n = Math.max(1, Math.round(len / pitch)), p = len / n, k = p / pitch;
  const o = outer * k, ii = inner * k, sl = (p - o - ii) / 2;
  const pts = [[x0, 0]];
  for (let j = 0; j < n; j++) { const s = x0 + j * p; pts.push([s + ii / 2, 0], [s + ii / 2 + sl, depth], [s + ii / 2 + sl + o, depth], [s + p - ii / 2, 0]); }
  pts.push([x1, 0]);
  const d = (x) => {
    if (x <= x0 || x >= x1) return 0;
    let lo = 0, hi = pts.length - 1;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (pts[mid][0] <= x) lo = mid; else hi = mid; }
    const a = pts[lo], b = pts[hi], t = b[0] > a[0] ? (x - a[0]) / (b[0] - a[0]) : 0;
    return a[1] + (b[1] - a[1]) * t;
  };
  return { brk: pts.map(p => p[0]), d };
}
// lámina: eje del perfil = a (x), eje recto = b (y), desplazamiento hacia +z.
// swap=true intercambia (a→y, b→x) para costillas horizontales.
function corrGeo(prof, a0, a1, b0, b1, o = {}) {
  const as = [a0, ...prof.brk.filter(a => a > a0 + 1e-4 && a < a1 - 1e-4), a1];
  const rows = o.rows || 1, off = o.off || 0, dent = o.dent, U = o.uv || ((a, b) => [a, b]);
  const pos = [], uv = [];
  const P = (a, b) => { const z = prof.d(a) + off + (dent ? dent(a, b) : 0); return o.swap ? [b, a, z] : [a, b, z]; };
  const push = (a, b) => { pos.push(...P(a, b)); uv.push(...U(a, b)); };
  for (let r = 0; r < rows; r++) {
    const ba = b0 + (b1 - b0) * r / rows, bb = b0 + (b1 - b0) * (r + 1) / rows;
    for (let k = 0; k < as.length - 1; k++) {
      const aa = as[k], ab = as[k + 1];
      if (!o.swap) { push(aa, ba); push(ab, ba); push(ab, bb); push(aa, ba); push(ab, bb); push(aa, bb); }
      else { push(aa, ba); push(ab, bb); push(ab, ba); push(aa, ba); push(aa, bb); push(ab, bb); }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

// ---------- logotipos ----------
function drawGlyph(c, brand, cx, cy, r, fg, bg, accent) {
  c.save();
  if (brand.id === 'marea') {
    c.fillStyle = fg; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
    c.strokeStyle = bg; c.lineCap = 'round'; c.lineWidth = r * 0.16;
    for (let k = 0; k < 3; k++) {
      const y = cy - r * 0.35 + k * r * 0.36;
      c.beginPath();
      for (let t = 0; t <= 1.001; t += 0.05) { const x = cx - r * 0.62 + t * r * 1.24; const yy = y + Math.sin(t * PI * 2 + k * 0.8) * r * 0.1; t ? c.lineTo(x, yy) : c.moveTo(x, yy); }
      c.stroke();
    }
  } else if (brand.id === 'solmar') {
    c.fillStyle = accent;
    for (let k = 0; k < 11; k++) {
      const a = PI + (k + 0.5) / 11 * PI;
      c.beginPath(); c.moveTo(cx + Math.cos(a - 0.08) * r * 0.78, cy + Math.sin(a - 0.08) * r * 0.78);
      c.lineTo(cx + Math.cos(a) * r * 1.15, cy + Math.sin(a) * r * 1.15);
      c.lineTo(cx + Math.cos(a + 0.08) * r * 0.78, cy + Math.sin(a + 0.08) * r * 0.78); c.fill();
    }
    c.beginPath(); c.arc(cx, cy, r * 0.7, PI, 0); c.closePath(); c.fill();
    c.fillStyle = fg;
    for (let k = 0; k < 3; k++) c.fillRect(cx - r * (1.1 - k * 0.22), cy + r * (0.12 + k * 0.2), r * (2.2 - k * 0.44), r * 0.1);
  } else {
    c.fillStyle = fg;
    for (let k = 0; k < 3; k++) {
      const x = cx - r * 0.9 + k * r * 0.5, y = cy - r * 0.55 + k * r * 0.3, L = r * (1.7 - k * 0.35), t = r * 0.22;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + L, y - L * 0.12); c.lineTo(x + L - t * 0.6, y + t); c.lineTo(x - t * 0.6, y + t * 1.1); c.closePath(); c.fill();
    }
    c.beginPath(); c.moveTo(cx + r * 0.75, cy - r * 0.95); c.lineTo(cx + r * 1.1, cy - r * 0.7); c.lineTo(cx + r * 0.7, cy - r * 0.62); c.closePath(); c.fill();
  }
  c.restore();
}
function inkFor(color) { return lum(color) > 0.55 ? '#1c1e21' : '#f3f2ee'; }
function accentFor(brand, color) { return Math.abs(lum(brand.accent) - lum(color)) < 0.22 ? inkFor(color) : css(brand.accent); }

function weather(c, w, h, R, amt, ppm) {
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, `rgba(255,250,240,${0.05 + 0.05 * amt})`); g.addColorStop(0.45, 'rgba(255,255,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  g = c.createLinearGradient(0, h, 0, h * 0.5);
  g.addColorStop(0, `rgba(58,44,30,${0.25 + 0.2 * amt})`); g.addColorStop(1, 'rgba(58,44,30,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // escurrimientos de óxido desde el techo y costuras
  const n = Math.round((w / ppm) * 1.8 * amt);
  for (let i = 0; i < n; i++) {
    const x = R() * w, y0 = R() < 0.65 ? 0 : R() * h * 0.6, len = h * (0.12 + R() * 0.6), wd = 0.6 + R() * 2.4;
    const gg = c.createLinearGradient(0, y0, 0, y0 + len);
    gg.addColorStop(0, `rgba(118,56,22,${0.35 + R() * 0.35})`); gg.addColorStop(1, 'rgba(118,56,22,0)');
    c.fillStyle = gg; c.fillRect(x, y0, wd, len);
    if (R() < 0.5) { c.fillStyle = 'rgba(95,40,15,0.6)'; c.beginPath(); c.ellipse(x + wd / 2, y0 + 1, wd * 1.4, 1.5 + R() * 2, 0, 0, 7); c.fill(); }
  }
  // manchas de óxido en bordes y parte baja: racimos irregulares de puntos pequeños
  for (let i = 0; i < 22 * amt; i++) {
    const edge = R();
    const x = edge < 0.2 ? R() * w * 0.04 : edge < 0.4 ? w - R() * w * 0.04 : R() * w;
    const y = edge < 0.4 ? R() * h : h - R() * h * 0.2;
    const r = (3 + R() * 9) * (ppm / 90);
    c.fillStyle = 'rgba(70,40,22,0.18)'; c.beginPath(); c.ellipse(x, y, r * 1.6, r, R() * 3, 0, 7); c.fill();
    for (let k = 0; k < 14; k++) {
      const a = R() * 7, d = R() * r, s = 0.6 + R() * 2.2;
      c.fillStyle = R() < 0.6 ? `rgba(92,46,20,${0.45 + R() * 0.4})` : `rgba(150,82,38,${0.3 + R() * 0.4})`;
      c.fillRect(x + Math.cos(a) * d * 1.5, y + Math.sin(a) * d, s, s * (0.6 + R()));
    }
  }
  // rayones
  c.lineCap = 'round';
  for (let i = 0; i < 26 * amt; i++) {
    const x = R() * w, y = h * (0.2 + R() * 0.75), L = 8 + R() * 50;
    c.strokeStyle = R() < 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(40,25,15,0.25)'; c.lineWidth = 0.6 + R();
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + L, y + (R() - 0.5) * 6); c.stroke();
  }
  noiseDots(c, w, h, R, 2500 * amt, (r) => r < 0.7 ? '#3a2a1a' : '#fff', 0.12, 1.5);
}

// arte lateral de cada naviera (lienzo en px; ppm = px por metro)
function paintBrandSide(c, brand, color, w, h, ppm, R) {
  const ink = inkFor(color), acc = accentFor(brand, color), L = w / ppm, H = h / ppm;
  const M = (v) => v * ppm;
  if (brand.id === 'marea') {
    const r = 0.58, cx = L > 8 ? 2.1 : 1.15, cy = H * 0.44;
    drawGlyph(c, brand, M(cx), M(cy), M(r), ink, css(color), acc);
    c.fillStyle = ink; c.textBaseline = 'middle'; c.textAlign = 'left';
    const x0 = cx + r + 0.3, maxW = Math.min(L - x0 - 0.5, 7.2);
    fitFont(c, 'italic 800 #px "Trebuchet MS", "Avenir Next", Arial, sans-serif', brand.short, M(maxW), M(0.78));
    c.fillText(brand.short, M(x0), M(cy - 0.08));
    c.fillStyle = acc; c.fillRect(M(x0), M(cy + 0.36), M(Math.min(maxW, 3.6)), M(0.045));
    fitFont(c, '600 #px "Trebuchet MS", Arial, sans-serif', brand.tagline, M(maxW * 0.6), M(0.22));
    c.fillStyle = ink; c.fillText(brand.tagline, M(x0), M(cy + 0.56));
  } else if (brand.id === 'solmar') {
    c.fillStyle = acc; c.fillRect(0, M(H * 0.8), w, M(0.1)); c.fillRect(0, M(H * 0.8 + 0.16), w, M(0.045));
    const r = 0.72, cx = L > 8 ? 2.2 : 1.25, cy = H * 0.5;
    drawGlyph(c, brand, M(cx), M(cy), M(r), ink, css(color), acc);
    c.fillStyle = ink; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    const x0 = cx + r + 0.35, maxW = Math.min(L - x0 - 0.45, 6.5);
    fitFont(c, '900 #px "Arial Black", "Helvetica Neue", Arial, sans-serif', brand.short, M(maxW), M(0.95));
    c.fillText(brand.short, M(x0), M(cy + 0.25));
    fitFont(c, 'bold #px "Helvetica Neue", Arial, sans-serif', brand.tagline, M(maxW * 0.9), M(0.2));
    c.fillText(brand.tagline, M(x0 + 0.04), M(cy + 0.56));
  } else {
    // franjas diagonales cerca de las puertas
    c.fillStyle = acc; c.globalAlpha = 0.9;
    for (let k = 0; k < 3; k++) {
      const x = L - 0.9 - k * 0.42;
      c.beginPath(); c.moveTo(M(x), h); c.lineTo(M(x + 0.22), h); c.lineTo(M(x + 0.22 + H * 0.35), M(H * 0.62)); c.lineTo(M(x + H * 0.35), M(H * 0.62)); c.closePath(); c.fill();
    }
    c.globalAlpha = 1;
    const r = 0.62, cx = L > 8 ? 2.0 : 1.05, cy = H * 0.42;
    drawGlyph(c, brand, M(cx), M(cy), M(r), acc, css(color), acc);
    c.fillStyle = ink; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    const x0 = cx + r + 0.45, maxW = Math.min(L - x0 - (L > 8 ? 3 : 1.2), 6.8);
    fitFont(c, 'bold #px Impact, "Haettenschweiler", "Arial Narrow Bold", sans-serif', brand.short, M(maxW), M(0.9));
    c.fillText(brand.short, M(x0), M(cy + 0.3));
    fitFont(c, '600 #px "Helvetica Neue", Arial, sans-serif', brand.tagline, M(maxW), M(0.2));
    c.fillText(brand.tagline, M(x0 + 0.02), M(cy + 0.6));
  }
}

function sideDims(sp) { return { sx0: -sp.L / 2 + 0.14, sx1: sp.L / 2 - 0.14, sy0: 0.14, sy1: sp.H - 0.08 }; }
function liveryTex(brand, color, sp, variant) {
  const d = sideDims(sp), len = d.sx1 - d.sx0, hgt = d.sy1 - d.sy0;
  const W = sp.is40 ? 1024 : 512, ppm = W / len, H = Math.round(hgt * ppm);
  return canvasTex(`tm-liv|${brand.id}|${color}|${sp.key}|${variant}`, W, H, (c, w, h) => {
    const R = rng(hashStr(brand.id) + color + variant * 977 + (sp.is40 ? 5 : 0));
    c.fillStyle = css(color); c.fillRect(0, 0, w, h);
    // repintados (parches de otro tono)
    for (let i = 0; i < 1 + variant * 1.5; i++) {
      const pw = (0.5 + R() * 1.6) * ppm, ph = (0.4 + R() * 1.2) * ppm;
      c.fillStyle = css(color, 0.88 + R() * 0.2); c.fillRect(R() * (w - pw), R() * (h - ph), pw, ph);
    }
    paintBrandSide(c, brand, color, w, h, ppm, R);
    weather(c, w, h, R, [0.35, 0.65, 1.0, 1.45][variant % 4], ppm);
  });
}
// atlas de calcomanías: código, logotipo, placa CSC y tabla de pesos
const ATL = { W: 512, H: 512, code: [0, 0, 512, 150], logo: [0, 156, 512, 290], csc: [0, 300, 236, 410], wt: [246, 300, 512, 500] };
function decalTex(brand, color, sp, code) {
  const dark = lum(color) > 0.55;
  return canvasTex(`tm-dec|${brand.id}|${dark}|${sp.key}|${code.owner}${code.num}`, ATL.W, ATL.H, (c) => {
    const ink = dark ? '#1c1e21' : '#f3f2ee';
    c.clearRect(0, 0, ATL.W, ATL.H);
    // código ISO
    c.fillStyle = ink; c.textBaseline = 'middle'; c.textAlign = 'left';
    c.font = 'bold 66px "Arial Narrow", "Helvetica Neue", Arial, sans-serif';
    const t = `${code.owner} ${code.num}`;
    c.fillText(t, 14, 44);
    const tw = c.measureText(t).width;
    c.strokeStyle = ink; c.lineWidth = 4; c.strokeRect(tw + 30, 10, 48, 66);
    c.fillText(String(code.check), tw + 40, 44);
    c.font = 'bold 54px "Arial Narrow", "Helvetica Neue", Arial, sans-serif'; c.fillText(sp.iso, 14, 112);
    // logotipo pequeño
    drawGlyph(c, brand, 70, 223, 50, ink, dark ? '#e8e2d0' : '#333', ink);
    fitFont(c, '900 #px "Arial Black", Arial, sans-serif', brand.short, 370, 64);
    c.fillStyle = ink; c.fillText(brand.short, 138, 210);
    fitFont(c, 'bold #px Arial, sans-serif', brand.tagline, 360, 24); c.fillText(brand.tagline, 140, 258);
    // placa CSC (aluminio remachado)
    const [x0, y0, x1, y1] = ATL.csc;
    const g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, '#d6d8da'); g.addColorStop(0.5, '#b4b7ba'); g.addColorStop(1, '#cfd2d4');
    c.fillStyle = g; c.fillRect(x0 + 4, y0 + 4, x1 - x0 - 8, y1 - y0 - 8);
    c.strokeStyle = '#333'; c.lineWidth = 2; c.strokeRect(x0 + 10, y0 + 10, x1 - x0 - 20, y1 - y0 - 20);
    c.fillStyle = '#222'; c.font = 'bold 15px Arial'; c.fillText('CSC SAFETY APPROVAL', x0 + 18, y0 + 26);
    c.font = '11px Arial';
    ['MX-BV / 2041 / ' + code.num.slice(0, 3), 'DATE MANUFACTURED  07-2019', 'IDENT. No. ' + code.owner + code.num, 'MAX GROSS  30480 KG', 'STACKING  192000 KG'].forEach((s, i) => c.fillText(s, x0 + 18, y0 + 44 + i * 13));
    c.fillStyle = '#555'; for (const [a, b] of [[x0 + 8, y0 + 8], [x1 - 8, y0 + 8], [x0 + 8, y1 - 8], [x1 - 8, y1 - 8]]) { c.beginPath(); c.arc(a, b, 3, 0, 7); c.fill(); }
    // tabla de pesos
    const [wx, wy] = ATL.wt;
    c.fillStyle = ink; c.font = 'bold 22px "Arial Narrow", Arial, sans-serif';
    const lb = (kg) => Math.round(kg * 2.20462).toLocaleString('en-US');
    const rows = [['MAX. GROSS', 30480], ['TARE', sp.tare], ['NET', 30480 - sp.tare]];
    rows.forEach(([k, v], i) => { c.fillText(k, wx + 6, wy + 22 + i * 44); c.fillText(v.toLocaleString('en-US') + ' KG', wx + 130, wy + 22 + i * 44); c.font = '18px "Arial Narrow", Arial'; c.fillText(lb(v) + ' LB', wx + 130, wy + 42 + i * 44); c.font = 'bold 22px "Arial Narrow", Arial, sans-serif'; });
    c.fillText('CU. CAP.', wx + 6, wy + 160); c.fillText(sp.cube + ' CU.M', wx + 130, wy + 160);
    c.font = '18px "Arial Narrow", Arial'; c.fillText(Math.round(sp.cube * 35.315).toLocaleString('en-US') + ' CU.FT', wx + 130, wy + 182);
  });
}
const decalMat = (tex) => mat(0xffffff, { map: tex, transparent: true, depthWrite: false, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });

// ---------- ensamblado del contenedor ----------
// body: MB del cuerpo; fL/fR: MB con origen en la bisagra de cada hoja (ya orientados).
function buildContainer(body, fL, fR, o) {
  const { sp, brand, color, seed, lite } = o;
  const { L, W, H } = sp, hl = L / 2, hw = W / 2;
  const R = rng(seed * 31 + 7);
  const variant = lite ? seed % 2 : seed % 4;
  const paint = MT.paint(color), cast = MT.cast(color), hard = MT.hard();
  const liv = mat(0xffffff, { map: liveryTex(brand, color, sp, variant), roughness: 0.55, metalness: 0.15, env: true, envI: 0.35 });
  const code = lite ? containerCode(brand, 1 + (seed % 3)) : containerCode(brand, seed);
  const dm = decalMat(decalTex(brand, color, sp, code));

  // esquineros (castings) y postes
  const cx = hl - 0.089, cz = hw - 0.081;
  for (const a of [-1, 1]) for (const b of [-1, 1]) for (const y of [0.059, H - 0.059]) body.box(0.178, 0.118, 0.162, cast, a * cx, y, b * cz);
  for (const b of [-1, 1]) {
    body.box(0.15, H - 0.236, 0.15, paint, -hl + 0.078, H / 2, b * (hw - 0.078), 0, 0, 0, 0.6);
    body.box(0.165, H - 0.236, 0.16, paint, hl - 0.1675, H / 2, b * (hw - 0.083), 0, 0, 0, 0.6);
    // largueros inferior y superior
    body.box(L - 0.356, 0.16, 0.06, paint, 0, 0.08, b * (hw - 0.03), 0, 0, 0, 0.6);
    body.box(L - 0.356, 0.09, 0.07, paint, 0, H - 0.045, b * (hw - 0.035), 0, 0, 0, 0.6);
    // bolsas para montacargas (20')
    if (!sp.is40) for (const x of [-1.025, 1.025]) {
      body.box(0.36, 0.1, 0.02, MT.under(), x, 0.075, b * (hw - 0.001));
      body.box(0.4, 0.13, 0.03, paint, x, 0.075, b * (hw + 0.004));
    }
  }
  body.box(0.1, 0.12, W - 0.324, paint, -hl + 0.05, 0.06, 0, 0, 0, 0, 0.6);
  body.box(0.1, 0.12, W - 0.324, paint, -hl + 0.05, H - 0.06, 0, 0, 0, 0, 0.6);
  body.box(0.235, 0.115, W - 0.324, paint, hl - 0.1325, 0.0625, 0, 0, 0, 0, 0.6);   // umbral trasero
  body.box(0.235, 0.105, W - 0.324, paint, hl - 0.1325, H - 0.0575, 0, 0, 0, 0, 0.6); // cabezal trasero
  // travesaños inferiores (se ven cuando está sobre el chasis o apilado)
  for (let x = -hl + 0.3; x < hl - 0.2; x += 0.6) body.box(0.07, 0.1, W - 0.14, MT.under(), x, 0.06, 0);
  body.plane(L - 0.1, W - 0.1, MT.under(), 0, 0.012, 0, HP);

  // costados corrugados (misma lámina, girada 180° para el lado -z)
  const sd = sideDims(sp);
  const prof = trapProf(sd.sx0, sd.sx1, 0.278, 0.036, 0.072, 0.068);
  const Lu = sd.sx1 - sd.sx0, Hu = sd.sy1 - sd.sy0;
  const livUV = (a, b) => [(a - sd.sx0) / Lu, (b - sd.sy0) / Hu];
  for (const side of [1, -1]) {
    const f = side > 0 ? body.at(0, 0, hw - 0.05) : body.at(0, 0, -(hw - 0.05), 0, PI, 0);
    let dent = null;
    if (!lite) {
      const ds = []; const nd = Math.floor(R() * 4);
      for (let i = 0; i < nd; i++) ds.push([sd.sx0 + R() * Lu, sd.sy0 + 0.3 + R() * (Hu - 0.6), 0.25 + R() * 0.45, 0.008 + R() * 0.02]);
      if (ds.length) dent = (a, b) => { let z = 0; for (const [x, y, r, k] of ds) z -= k * Math.exp(-((a - x) ** 2 + (b - y) ** 2) / (r * r)); return z; };
    }
    f.putM(corrGeo(prof, sd.sx0, sd.sx1, sd.sy0, sd.sy1, { uv: livUV, rows: dent ? 6 : 1, dent }), liv);
    // código en la esquina superior del lado de las puertas (se ajusta a la corrugación)
    const cw = 1.55, ch = cw * (ATL.code[3] - ATL.code[1]) / (ATL.code[2] - ATL.code[0]);
    const ca = side > 0 ? sd.sx1 - 0.45 - cw : sd.sx0 + 0.45, cb = sd.sy1 - 0.2 - ch;
    const [x0, y0, x1, y1] = ATL.code;
    f.putM(corrGeo(prof, ca, ca + cw, cb, cb + ch, { off: 0.003, uv: (a, b) => [(x0 + (a - ca) / cw * (x1 - x0)) / ATL.W, 1 - (y1 - (b - cb) / ch * (y1 - y0)) / ATL.H] }), dm);
  }
  // frente (corrugación vertical) y techo
  const fp = trapProf(-(hw - 0.14), hw - 0.14, 0.3, 0.036, 0.1, 0.1);
  body.at(-hl + 0.075, 0, 0, 0, -HP, 0).putM(corrGeo(fp, -(hw - 0.14), hw - 0.14, 0.1, H - 0.1, { uv: (a, b) => [a * 0.7, b * 0.7] }), paint);
  const rp = trapProf(-hl + 0.1, hl - 0.1, 0.23, 0.014, 0.09, 0.09);
  body.at(0, H - 0.03, 0, -HP, 0, 0).putM(corrGeo(rp, -hl + 0.1, hl - 0.1, -(hw - 0.05), hw - 0.05, { uv: (a, b) => [a * 0.5, b * 0.5] }), paint);

  // interior oscuro con piso de madera
  if (!lite) {
    const inner = MT.inner(), x0 = -hl + 0.08, x1 = hl - 0.02;
    body.put(uvPlaneV(x1 - x0, W - 0.1, 0.5), MT.floor(), (x0 + x1) / 2, 0.122, 0, -HP);
    const wallG = (w, h) => { const g = new THREE.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.278, uv.getY(i)); return g; };
    body.put(wallG(x1 - x0, H - 0.17), inner, (x0 + x1) / 2, H / 2 + 0.03, hw - 0.055, 0, PI, 0);
    body.put(wallG(x1 - x0, H - 0.17), inner, (x0 + x1) / 2, H / 2 + 0.03, -(hw - 0.055));
    body.put(wallG(W - 0.1, H - 0.17), inner, x0, H / 2 + 0.03, 0, 0, HP, 0);
    body.put(new THREE.PlaneGeometry(x1 - x0, W - 0.1), mat(0x4a4c4e, { roughness: 0.9 }), (x0 + x1) / 2, H - 0.05, 0, HP);
    // anillos de amarre en el piso
    for (let x = x0 + 0.6; x < x1 - 0.3; x += 1.5) for (const b of [-1, 1]) body.box(0.06, 0.03, 0.02, hard, x, 0.14, b * (hw - 0.08));
  }

  // hojas de puerta y herrajes del marco
  const wl = hw - 0.039, yb = 0.105, yt = H - 0.105, hz = hw - 0.035;
  const bars = [0.3, wl - 0.21];
  for (const s of [1, -1]) {
    const f = s > 0 ? fL : fR;
    buildDoorLeaf(f, s, { wl, yb, yt, paint, hard, dm, bars, lite, right: s < 0, sp });
    // retenes de levas en umbral y cabezal
    for (const a of bars) {
      const z = s > 0 ? hz - a : -hz + a;
      for (const y of [yb + 0.035, yt - 0.035]) body.box(0.07, 0.09, 0.075, hard, hl + 0.02, y, z);
    }
    // orejas de bisagra en el poste
    for (const y of [yb + 0.22, yb + (yt - yb) * 0.36, yb + (yt - yb) * 0.64, yt - 0.22]) body.box(0.06, 0.1, 0.05, hard, hl - 0.05, y, s * (hz + 0.012));
  }
}
function buildDoorLeaf(f, s, o) {
  const { wl, yb, yt, paint, hard, dm, bars, lite, right, sp } = o;
  const hl = yt - yb, X = (a) => s * a;
  // marco de la hoja
  f.box(0.05, hl, 0.05, paint, X(0.025), yb + hl / 2, -0.025, 0, 0, 0, 0.6);
  f.box(0.06, hl, 0.05, paint, X(wl - 0.03), yb + hl / 2, -0.025, 0, 0, 0, 0.6);
  f.box(wl, 0.07, 0.05, paint, X(wl / 2), yb + 0.035, -0.025, 0, 0, 0, 0.6);
  f.box(wl, 0.07, 0.05, paint, X(wl / 2), yt - 0.035, -0.025, 0, 0, 0, 0.6);
  // lámina con costillas horizontales
  const a0 = yb + 0.07, a1 = yt - 0.07, b0 = Math.min(X(0.05), X(wl - 0.06)), b1 = Math.max(X(0.05), X(wl - 0.06));
  const prof = trapProf(a0, a1, (a1 - a0) / 5, 0.022, 0.2, 0.14);
  f.at(0, 0, -0.04).putM(corrGeo(prof, a0, a1, b0, b1, { swap: true, uv: (a, b) => [b * 0.7, a * 0.7] }), paint);
  // cara interior
  if (!lite) f.put(new THREE.PlaneGeometry(wl, hl), MT.inner(), X(wl / 2), yb + hl / 2, -0.052, 0, PI, 0);
  // barras de cierre, levas, guías y manijas
  bars.forEach((a, i) => {
    const bx = X(a);
    f.cyl(0.0165, 0.0165, hl - 0.03, hard, bx, yb + hl / 2, 0.045, 0, 0, 0, 10);
    for (const y of [yb + 0.035, yt - 0.035]) { f.box(0.055, 0.05, 0.055, hard, bx, y, 0.045); f.box(0.03, 0.03, 0.07, hard, bx + X(0.03), y, 0.05); }
    for (const y of [yb + 0.3, yb + hl * 0.56, yt - 0.3]) { f.box(0.09, 0.05, 0.05, hard, bx, y, 0.022); }
    const hy = i ? 1.02 : 1.2, dir = i ? -1 : 1;
    f.box(0.075, 0.13, 0.07, hard, bx, hy, 0.05);
    f.box(0.4, 0.04, 0.014, hard, bx + X(dir * 0.22), hy, 0.08);
    f.box(0.03, 0.06, 0.03, hard, bx + X(dir * 0.42), hy, 0.068);
    f.box(0.06, 0.08, 0.02, hard, bx + X(dir * 0.45), hy, 0.03);
  });
  // bisagras
  for (const y of [yb + 0.22, yb + hl * 0.36, yb + hl * 0.64, yt - 0.22]) {
    f.box(0.18, 0.07, 0.016, hard, X(0.08), y, 0.004);
    f.cyl(0.022, 0.022, 0.1, hard, 0, y, 0.0, 0, 0, 0, 10);
  }
  // empaque de hule en el borde libre
  f.box(0.018, hl - 0.02, 0.03, MT.rubber(), X(wl + 0.004), yb + hl / 2, -0.03);
  // calcomanías
  const reg = (r, w) => { const h = w * (r[3] - r[1]) / (r[2] - r[0]); return [atlasPlane(w, h, r, ATL.W, ATL.H), h]; };
  if (right) {
    const [g1, h1] = reg(ATL.code, 0.95); f.put(g1, dm, X(wl * 0.55), yt - 0.28 - h1 / 2, -0.012);
    const [g2, h2] = reg(ATL.wt, 0.42); f.put(g2, dm, X(wl * 0.62), yt - 0.85 - h2 / 2, -0.012);
  } else {
    const [g1] = reg(ATL.logo, 0.8); f.put(g1, dm, X(wl * 0.5), yt - 0.45, -0.012);
    const [g2] = reg(ATL.csc, 0.3); f.put(g2, dm, X(wl * 0.55), 1.55, -0.012);
  }
}

// Contenedor completo con puertas abribles.
// doorL/doorR: Groups con pivote en la bisagra. Abrir: doorL.rotation.y = -a, doorR.rotation.y = +a (a≈0..1.9).
export function containerMesh(brandId, color, size = '20', seed = 1) {
  const brand = brandOf(brandId), sp = containerSpec(size);
  if (color == null) color = brand.colors[seed % brand.colors.length];
  const g = new THREE.Group(); g.name = 'container';
  const hz = sp.W / 2 - 0.035, dx = sp.L / 2 - 0.03;
  const dL = new THREE.Group(); dL.name = 'doorL'; dL.position.set(dx, 0, hz);
  const dR = new THREE.Group(); dR.name = 'doorR'; dR.position.set(dx, 0, -hz);
  const body = new MB(), mL = new MB(), mR = new MB();
  buildContainer(body, mL.at(0, 0, 0, 0, HP, 0), mR.at(0, 0, 0, 0, HP, 0), { sp, brand, color, seed, lite: false });
  body.build(g); mL.build(dL); mR.build(dR);
  g.add(dL, dR);
  dL.userData.openDir = -1; dR.userData.openDir = 1;
  const code = containerCode(brand, seed);
  Object.assign(g.userData, {
    kind: 'container', brand: brand.id, color, size: sp.key, seed, length: sp.L, width: sp.W, height: sp.H,
    code: `${code.owner} ${code.num} ${code.check}`, iso: sp.iso, doorOpenAngle: 1.85,
  });
  g.userData.setDoors = (t) => { dL.rotation.y = -t * 1.85; dR.rotation.y = t * 1.85; };
  return g;
}
// versión ligera para pilas decorativas: se fusiona dentro de un MB compartido (puertas fijas, sin interior)
function containerInto(mb, brandId, color, size, seed, x, y, z, ry) {
  const brand = brandOf(brandId), sp = containerSpec(size);
  const f = mb.at(x, y, z, 0, ry, 0);
  const hz = sp.W / 2 - 0.035, dx = sp.L / 2 - 0.03;
  buildContainer(f, f.at(dx, 0, hz, 0, HP, 0), f.at(dx, 0, -hz, 0, HP, 0), { sp, brand, color, seed, lite: true });
  return sp;
}

// =====================================================================================
// TRACTOCAMIÓN (nariz larga estilo americano) + CHASIS PORTACONTENEDOR ESQUELETO
// =====================================================================================
TXT.diamond = () => canvasTex('tm-diamond', 128, 128, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#b9bdc1'); g.addColorStop(1, '#9aa0a5'); c.fillStyle = g; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < w; x += 16) {
    c.save(); c.translate(x + 4, y + 8); c.rotate(((x + y) / 16) % 2 ? 0.8 : -0.8);
    c.fillStyle = '#e4e7ea'; c.fillRect(-6, -1.5, 12, 3); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(-6, 1.5, 12, 1); c.restore();
  }
}, true);
TXT.dot = () => canvasTex('tm-dot', 128, 16, (c, w, h) => { for (let x = 0; x < w; x += 32) { c.fillStyle = '#d01818'; c.fillRect(x, 0, 18, h); c.fillStyle = '#f4f4f4'; c.fillRect(x + 18, 0, 14, h); } }, true);
TXT.plate = (t) => canvasTex('tm-plate|' + t, 256, 128, (c, w, h) => {
  c.fillStyle = '#f3f1ea'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#1d5a3a'; c.fillRect(0, 0, w, 26); c.fillStyle = '#fff'; c.font = 'bold 18px Arial'; c.textAlign = 'center'; c.fillText('TRANSPORTE FEDERAL', w / 2, 19);
  c.fillStyle = '#111'; c.font = 'bold 62px "Arial Narrow", Arial'; c.fillText(t, w / 2, 96);
  c.font = '14px Arial'; c.fillText('MÉXICO', w / 2, 120);
  c.strokeStyle = '#333'; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4);
});
TXT.flap = () => canvasTex('tm-flap', 128, 160, (c, w, h) => {
  c.fillStyle = '#121212'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#d8dadc'; c.font = 'bold 30px Impact, Arial Black, sans-serif'; c.textAlign = 'center'; c.fillText('TITÁN', w / 2, 52);
  c.strokeStyle = '#d8dadc'; c.lineWidth = 3; c.beginPath(); c.moveTo(20, 66); c.lineTo(108, 66); c.stroke();
  c.font = 'bold 13px Arial'; c.fillText('TRANSPORTES', w / 2, 86); c.fillText('DEL VALLE', w / 2, 102);
  c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 110; y < h; y += 6) c.fillRect(0, y, w, 2);
});
TXT.badge = () => canvasTex('tm-badge', 256, 64, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f4f6f8'); g.addColorStop(0.5, '#9aa1a8'); g.addColorStop(1, '#e8ebee');
  c.fillStyle = '#0d0f12'; c.beginPath(); c.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 7); c.fill();
  c.strokeStyle = g; c.lineWidth = 5; c.stroke();
  c.fillStyle = g; c.font = 'italic 900 38px "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TITÁN', w / 2, h / 2 + 2);
});
TXT.tread = () => canvasTex('tm-tread', 512, 32, (c, w, h) => {
  c.fillStyle = '#2a2a2a'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#121212'; for (let x = 0; x < w; x += 8) c.fillRect(x, 0, 3, h);
}, true);

const TM = {
  paint: (c) => mat(c, { roughness: 0.2, metalness: 0.35, env: true, envI: 0.9 }),
  chassis: () => mat(0x1e1f21, { roughness: 0.55, metalness: 0.35, env: true, envI: 0.3, map: TXT.grime() }),
  tire: () => mat(0x262626, { roughness: 0.9, side: THREE.DoubleSide }),
  tread: () => mat(0xffffff, { map: TXT.tread(), roughness: 0.95, side: THREE.DoubleSide }),
  diamond: () => mat(0xffffff, { map: TXT.diamond(), roughness: 0.35, metalness: 0.8, env: true, envI: 0.8 }),
  dot: () => mat(0xffffff, { map: TXT.dot(), roughness: 0.3, emissive: 0x220000, emissiveIntensity: 0.3 }),
  mirror: () => metal(0xdfe6ea, 0.03),
};

// ---------- ruedas (grupo hijo con userData.wheel; rodar = rotation.z) ----------
const _wheelTpl = {};
function wheelTemplate(kind) {
  if (_wheelTpl[kind]) return _wheelTpl[kind];
  const g = new THREE.Group(), mb = new MB(), f = mb.at(0, 0, 0, HP, 0, 0); // eje de la rueda = z local, cara exterior +z
  const tire = (y) => {
    const prof = [[0.285, -0.112], [0.31, -0.132], [0.4, -0.142], [0.47, -0.134], [0.505, -0.118], [0.518, -0.104]];
    const side = prof.map(([r, yy]) => [r, yy + y]);
    f.put(latheGeo(side, 40), TM.tire());
    f.put(latheGeo([...prof].reverse().map(([r, yy]) => [r, -yy + y]), 40), TM.tire());
    // banda de rodamiento con dibujo
    const tg = new THREE.CylinderGeometry(0.522, 0.522, 0.21, 48, 1, true);
    const uv = tg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 4, uv.getY(i));
    f.put(tg, TM.tread(), 0, y, 0);
    for (const yy of [-0.06, 0.0, 0.06]) f.put(new THREE.CylinderGeometry(0.505, 0.505, 0.012, 40, 1, true), TM.tire(), 0, y + yy, 0);
  };
  const rim = (y, out, front) => {
    const s = out ? 1 : -1;
    const P = [[0.292, -0.11], [0.272, -0.098], [0.268, 0.07], [0.292, 0.098], [0.284, 0.108], [0.24, 0.07], [0.19, 0.045], [0.125, 0.045], [0.112, 0.09], [0.0, 0.092]].map(([r, yy]) => [r, y + yy * s]);
    f.put(latheGeo(out ? P : [...P].reverse(), 36), front ? MT.chrome() : MT.alu());
    // agujeros de mano
    for (let k = 0; k < 10; k++) { const a = k / 10 * PI * 2 + 0.31; f.put(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 12), MT.blackMatte(), Math.cos(a) * 0.19, y + s * 0.05, Math.sin(a) * 0.19, 0, 0, 0, 1, 1, 1.5); }
    if (out) {
      for (let k = 0; k < 10; k++) { const a = k / 10 * PI * 2; f.cyl(0.016, 0.016, 0.05, MT.chrome(), Math.cos(a) * 0.145, y + 0.105, Math.sin(a) * 0.145, 0, 0, 0, 6); }
      if (front) f.put(latheGeo([[0.1, 0], [0.098, 0.04], [0.07, 0.09], [0.02, 0.12], [0, 0.122]], 24), MT.chrome(), 0, y + 0.09, 0);
      else f.put(latheGeo([[0.085, 0], [0.083, 0.06], [0.05, 0.085], [0, 0.088]], 20), MT.chrome(), 0, y + 0.09, 0);
    }
  };
  if (kind === 'front') { tire(0); rim(0, true, true); }
  else { tire(0.165); tire(-0.165); rim(0.165, true, false); rim(-0.165, false, false); f.cyl(0.13, 0.13, 0.12, MT.steel(), 0, 0, 0, 0, 0, 0, 16); }
  mb.build(g);
  return (_wheelTpl[kind] = g);
}
function addWheel(parent, kind, x, z, list) {
  const w = new THREE.Group(); w.position.set(x, 0.522, z);
  const t = wheelTemplate(kind).clone(); if (z < 0) t.rotation.y = PI;
  w.add(t); w.userData.wheel = true; w.userData.radius = 0.522; w.name = 'wheel';
  parent.add(w); list.push(w);
  return w;
}
// arco (silueta lateral) alrededor de una rueda
function archShape(cx, cy, ro, ri, a0, a1, nose) {
  const pts = [];
  for (let a = a0; a >= a1 - 1e-6; a -= (a0 - a1) / 14) pts.push([cx + ro * Math.cos(a), cy + ro * Math.sin(a)]);
  if (nose) pts.push(...nose);
  for (let a = a1; a <= a0 + 1e-6; a += (a0 - a1) / 14) pts.push([cx + ri * Math.cos(a), cy + ri * Math.sin(a)]);
  return rshape(pts);
}
// placa plana con silueta (x,y) sobre el costado z = ±zs, mirando hacia afuera
function sideShape(f, pts, zs, side, m) {
  const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(side > 0 ? x : -x, y)));
  const g = new THREE.ShapeGeometry(sh);
  if (side < 0) g.rotateY(PI);
  f.put(g, m, 0, 0, side * zs);
}

function buildTractor(t, color, wheels) {
  const mb = new MB();
  const paint = TM.paint(color), dark = TM.chassis(), chrome = MT.chrome(), alu = MT.alu(), blk = MT.blackMatte();
  // bastidor
  for (const z of [-0.43, 0.43]) mb.box(7.05, 0.26, 0.08, dark, -0.075, 0.93, z, 0, 0, 0, 0.5);
  for (const x of [3.3, 1.9, 0.4, -1.1, -2.6, -3.55]) mb.box(0.12, 0.2, 0.8, dark, x, 0.93, 0);
  // motor, cárter, ejes y suspensión
  mb.box(1.35, 0.46, 0.78, mat(0x2b2d2f, { roughness: 0.6, metalness: 0.5 }), 2.55, 0.84, 0);
  mb.box(1.0, 0.18, 0.5, dark, 2.6, 0.55, 0);
  mb.box(0.14, 0.12, 1.9, dark, 2.75, 0.5, 0);
  for (const z of [-0.43, 0.43]) { for (let k = 0; k < 5; k++) mb.box(1.25 - k * 0.18, 0.025, 0.08, dark, 2.75, 0.62 + k * 0.026, z); }
  for (const x of [-1.95, -3.25]) {
    mb.cyl(0.085, 0.085, 1.62, dark, x, 0.522, 0, HP, 0, 0, 12);
    mb.sph(0.22, dark, x, 0.52, 0, 1, 0.9, 0.75);
    for (const z of [-0.43, 0.43]) { mb.cyl(0.12, 0.12, 0.22, blk, x + 0.15, 0.84, z, 0, 0, 0, 14); mb.box(0.5, 0.08, 0.12, dark, x, 0.66, z); }
  }
  mb.box(1.5, 0.06, 0.06, dark, -2.6, 0.52, 0, 0, 0, 0);
  // defensa cromada, placa y ganchos
  mb.box(0.24, 0.34, 2.2, chrome, 3.64, 0.74, 0);
  for (const s of [-1, 1]) mb.box(0.24, 0.34, 0.3, chrome, 3.58, 0.74, s * 1.21, 0, s * 0.45, 0);
  mb.box(0.25, 0.04, 2.3, mat(0x222222, { roughness: 0.5 }), 3.65, 0.56, 0);
  mb.put(new THREE.PlaneGeometry(0.36, 0.18), mat(0xffffff, { map: TXT.plate('45-AK-7R'), roughness: 0.5 }), 3.765, 0.74, 0, 0, HP, 0);
  for (const s of [-1, 1]) mb.put(new THREE.TorusGeometry(0.05, 0.016, 8, 16), mat(0xc0281e, { roughness: 0.4 }), 3.78, 0.58, s * 0.45, 0, HP, 0);
  // cofre largo (silueta extruida, se angosta hacia el frente)
  const hood = exGeo(rshape([[1.47, 1.06], [1.47, 2.06], [2.4, 2.07, 0.3], [3.32, 1.99, 0.14], [3.43, 1.86, 0.05], [3.43, 1.06]]), 1.24, 0.09, 10);
  { const p = hood.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) * (1 - 0.14 * Math.max(0, x - 1.47) / 1.96)); } hood.computeVertexNormals(); }
  mb.put(hood, paint);
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) mb.box(0.32, 0.022, 0.012, chrome, 2.05, 1.38 + k * 0.06, s * (0.6 - 0.035 * 0.3));   // rejillas laterales
  // parrilla
  mb.box(0.05, 0.92, 1.0, mat(0x0b0c0d, { roughness: 0.8 }), 3.43, 1.48, 0);
  for (let k = 0; k <= 22; k++) mb.box(0.045, 0.9, 0.014, chrome, 3.47, 1.48, -0.46 + k * 0.92 / 22);
  for (const s of [-1, 1]) mb.box(0.08, 1.0, 0.07, chrome, 3.47, 1.48, s * 0.52);
  mb.box(0.09, 0.09, 1.11, chrome, 3.47, 1.97, 0); mb.box(0.08, 0.07, 1.11, chrome, 3.47, 1.0, 0);
  mb.put(new THREE.PlaneGeometry(0.3, 0.075), mat(0xffffff, { map: TXT.badge(), roughness: 0.25, metalness: 0.3, transparent: true }), 3.523, 1.97, 0, 0, HP, 0);
  mb.put(latheGeo([[0.02, 0], [0.03, 0.03], [0.01, 0.14], [0, 0.15]], 10), chrome, 3.35, 1.98, 0, 0, 0, -1.1);   // adorno del cofre
  // salpicaderas delanteras
  for (const s of [-1, 1]) {
    const fs = archShape(2.75, 0.57, 0.68, 0.6, PI * 0.93, PI * 0.16, [[3.5, 0.88], [3.5, 0.8]]);
    mb.put(exGeo(fs, 0.5, 0.03, 6), paint, 0, 0, s * 0.95);
    mb.box(1.25, 0.04, 0.24, blk, 2.78, 1.06, s * 0.62);
    // faros rectangulares y direccionales
    mb.box(0.16, 0.2, 0.36, chrome, 3.38, 1.01, s * 0.93);
    for (const dz of [-0.08, 0.08]) mb.put(new THREE.PlaneGeometry(0.14, 0.13), MT.headLens(), 3.462, 1.01, s * 0.93 + dz, 0, HP, 0);
    mb.box(0.05, 0.07, 0.16, MT.amberLens(), 3.5, 0.84, s * 0.93);
    // purificadores de aire cromados
    mb.cyl(0.2, 0.2, 0.78, chrome, 1.76, 1.68, s * 0.86, 0, 0, 0, 24);
    mb.cyl(0.205, 0.205, 0.05, alu, 1.76, 2.08, s * 0.86, 0, 0, 0, 24);
    mb.cyl(0.07, 0.07, 0.3, chrome, 1.76, 1.95, s * 0.6, HP, 0, 0, 12);
  }
  // cabina + dormitorio (silueta extruida)
  const cab = rshape([[1.47, 1.1], [1.47, 2.08], [1.42, 2.14, 0.04], [1.17, 3.1, 0.06], [1.0, 3.27, 0.14], [-0.95, 3.3, 0.1], [-1.02, 3.2, 0.05], [-1.02, 1.1]]);
  mb.put(exGeo(cab, 2.04, 0.07, 10), paint);
  // parabrisas en dos piezas
  { const ax = 1.42, ay = 2.14, bx = 1.17, by = 3.1, len = Math.hypot(ax - bx, ay - by), a = Math.atan2(ax - bx, by - ay);
    const nx = Math.cos(a), ny = Math.sin(a), cxw = (ax + bx) / 2 + nx * 0.006, cyw = (ay + by) / 2 + ny * 0.006;
    for (const s of [-1, 1]) { const gw = new THREE.PlaneGeometry(0.86, len * 0.92); gw.rotateY(HP); gw.rotateZ(a); mb.put(gw, MT.darkGlass(), cxw, cyw, s * 0.47); }
    const gp = new THREE.BoxGeometry(0.02, len * 0.95, 0.07); gp.rotateZ(a); mb.put(gp, mat(0x111111, { roughness: 0.5 }), cxw, cyw, 0);
    // visera
    mb.box(0.4, 0.04, 2.02, paint, 1.2, 3.22, 0, 0, 0, -0.35);
    for (let k = 0; k < 5; k++) mb.box(0.05, 0.035, 0.09, MT.amberLens(), 1.38, 3.17, -0.5 + k * 0.25);
  }
  for (const s of [-1, 1]) {
    const zs = 1.021;
    sideShape(mb, [[0.32, 2.28], [1.25, 2.28], [1.07, 2.98], [0.32, 2.98]], zs, s, MT.darkGlass());
    sideShape(mb, [[-0.86, 2.55], [-0.42, 2.55], [-0.42, 2.86], [-0.86, 2.86]], zs, s, MT.darkGlass());
    // costuras de puerta, manija y agarraderas
    mb.box(0.012, 1.86, 0.006, blk, 0.22, 2.07, s * zs); mb.box(0.012, 1.7, 0.006, blk, 1.36, 2.0, s * zs);
    mb.box(1.14, 0.012, 0.006, blk, 0.79, 3.03, s * zs);
    mb.box(0.16, 0.035, 0.03, chrome, 0.42, 2.12, s * (zs + 0.012));
    mb.cyl(0.016, 0.016, 0.9, chrome, 1.44, 1.95, s * 1.04, 0, 0, 0, 8);
    mb.cyl(0.016, 0.016, 0.9, chrome, 0.12, 1.95, s * 1.04, 0, 0, 0, 8);
    // espejos tipo "west coast"
    for (const y of [2.32, 2.92]) mb.tube([1.3, y, s * 1.0], [1.25, y - 0.02, s * 1.36], 0.012, chrome);
    mb.box(0.07, 0.48, 0.22, chrome, 1.25, 2.62, s * 1.38);
    mb.put(new THREE.PlaneGeometry(0.2, 0.44), TM.mirror(), 1.21, 2.62, s * 1.38, 0, -HP, 0);
    mb.tube([3.0, 1.2, s * 1.05], [3.0, 1.45, s * 1.12], 0.01, chrome);
    mb.sph(0.07, chrome, 3.0, 1.5, s * 1.12, 1, 1, 0.5);
    // escalones, tanques de combustible y caja de baterías
    for (const y of [0.5, 0.86]) mb.box(0.62, 0.035, 0.3, TM.diamond(), 0.85, y, s * 0.98);
    mb.box(0.62, 0.42, 0.04, alu, 0.85, 0.68, s * 1.12);
    mb.cyl(0.31, 0.31, 1.28, alu, -0.3, 0.74, s * 0.97, 0, 0, HP, 32);
    for (const x of [-0.75, 0.15]) mb.cyl(0.318, 0.318, 0.07, blk, x, 0.74, s * 0.97, 0, 0, HP, 32);
    mb.cyl(0.06, 0.06, 0.05, chrome, -0.3, 1.07, s * 0.97, 0, 0, 0, 12);
    // chimeneas de escape con protector térmico
    mb.cyl(0.066, 0.066, 2.9, chrome, -1.17, 2.55, s * 0.92, 0, 0, 0, 18);
    mb.cyl(0.085, 0.085, 1.0, MT.steel(), -1.17, 2.55, s * 0.92, 0, 0, 0, 18, true);
    { const gc = new THREE.CylinderGeometry(0.066, 0.066, 0.2, 18, 1, true); gc.rotateZ(0.5); mb.put(gc, chrome, -1.2, 4.03, s * 0.92); }
    for (const y of [1.9, 3.0]) mb.box(0.16, 0.04, 0.05, chrome, -1.09, y, s * 0.92);
    // salpicadera de cuarto y loderas
    mb.put(exGeo(archShape(-1.95, 0.522, 0.6, 0.57, PI * 0.95, PI * 0.15), 0.62, 0.01, 4), blk, 0, 0, s * 0.9);
    mb.put(new THREE.PlaneGeometry(0.62, 0.72), mat(0xffffff, { map: TXT.flap(), roughness: 0.9, side: THREE.DoubleSide }), -3.88, 0.62, s * 0.9, 0, -HP, 0);
    mb.box(0.05, 0.05, 0.64, chrome, -3.88, 0.25, s * 0.9);
    // calaveras traseras
    mb.box(0.04, 0.1, 0.22, MT.redLens(), -3.62, 0.98, s * 0.38);
  }
  mb.box(0.05, 0.05, 2.4, chrome, -3.88, 0.98, 0);
  mb.box(0.03, 0.05, 0.12, chrome, -3.62, 0.98, 0);
  // cornetas de aire en el techo
  for (const s of [-1, 1]) mb.put(latheGeo([[0.02, 0], [0.025, 0.4], [0.07, 0.55], [0.075, 0.56]], 14), chrome, 0.2, 3.38, s * 0.35, 0, 0, HP);
  // cubierta y quinta rueda
  mb.box(0.75, 0.03, 1.0, TM.diamond(), -1.5, 1.08, 0);
  mb.box(0.6, 0.12, 0.85, dark, -2.4, 1.1, 0);
  const fw = new THREE.Shape(); fw.absarc(0, 0, 0.45, 0.35, PI * 2 - 0.35, false); fw.lineTo(-0.05, 0); fw.closePath();
  { const g5 = new THREE.ExtrudeGeometry(fw, { depth: 0.07, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 }); g5.rotateX(-HP); g5.rotateY(PI); mb.put(g5, mat(0x34373a, { roughness: 0.4, metalness: 0.6 }), -2.4, 1.15, 0); }
  // mangueras de aire (roja y azul) en espiral
  for (const [k, c] of [[0, 0xc01d1d], [1, 0x1d4fc0]]) {
    const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60, a = t * PI * 2 * 7; pts.push([-1.12 - t * 0.55 + Math.cos(a) * 0.06, 1.95 - t * 0.6, -0.1 + k * 0.2 + Math.sin(a) * 0.06]); }
    mb.curve(pts, 0.011, mat(c, { roughness: 0.5 }), 220, 6);
  }
  mb.build(t);
  // ruedas
  addWheel(t, 'front', 2.75, 1.02, wheels); addWheel(t, 'front', 2.75, -1.02, wheels);
  for (const x of [-1.95, -3.25]) { addWheel(t, 'dual', x, 0.9, wheels); addWheel(t, 'dual', x, -0.9, wheels); }
}

// trailer: origen en el perno rey (kingpin)
const TRL = { front: 0.9, rear: -11.5, deck: 1.42, c40: -5.226, c20: [-2.159, -8.293] };
function buildTrailer(t, wheels) {
  const mb = new MB(), dark = TM.chassis(), galv = MT.galv(), blk = MT.blackMatte();
  // vigas principales (alma con cuello de ganso suave) y patines
  const web = rshape([[0.9, 1.24], [-1.6, 1.24], [-2.6, 0.92], [-11.45, 0.92], [-11.45, 1.32], [0.9, 1.32]]);
  for (const z of [-0.5, 0.5]) {
    mb.put(exGeo(web, 0.014, 0, 1), dark, 0, 0, z);
    mb.box(12.35, 0.02, 0.14, dark, -5.275, 1.31, z, 0, 0, 0, 0.5);
    mb.box(2.5, 0.02, 0.14, dark, -0.35, 1.25, z);
    mb.beam([-1.6, 1.25, z], [-2.6, 0.93, z], 0.02, 0.14, dark);
    mb.box(8.85, 0.02, 0.14, dark, -7.025, 0.93, z, 0, 0, 0, 0.5);
  }
  for (let x = -1; x > -11.4; x -= 1.15) mb.box(0.08, 0.16, 1.0, dark, x, x > -2.6 ? 1.28 : 1.2, 0);
  // placa de acople y perno rey
  mb.box(1.7, 0.03, 1.2, dark, 0.05, 1.235, 0);
  mb.cyl(0.045, 0.045, 0.08, MT.steel(), 0, 1.18, 0, 0, 0, 0, 12);
  // travesaños con candados giratorios (twistlocks)
  const bolster = (x, w, locks) => {
    mb.box(w, 0.1, 2.42, dark, x, 1.37, 0);
    for (const s of [-1, 1]) {
      mb.put(new THREE.PlaneGeometry(w * 0.9, 0.06), TM.dot(), x, 1.37, s * 1.212, 0, s > 0 ? 0 : PI, 0);
      mb.box(0.05, 0.05, 0.03, MT.amberLens(), x, 1.33, s * 1.215);
      for (const lx of locks) { mb.box(0.12, 0.03, 0.12, galv, lx, 1.43, s * 1.138); mb.put(new THREE.ConeGeometry(0.035, 0.07, 6), galv, lx, 1.47, s * 1.138); }
    }
  };
  bolster(0.8, 0.2, [0.781]);
  bolster(TRL.c20[0] - 3.06, 0.45, [-5.099, -5.353]);
  bolster(-11.27, 0.3, [-11.233]);
  for (const x of [-2.2, -8.3]) { mb.box(0.12, 0.08, 2.3, dark, x, 1.36, 0); }
  // patas de apoyo (landing gear)
  for (const s of [-1, 1]) {
    mb.box(0.13, 0.95, 0.13, dark, -1.0, 0.77, s * 0.55);
    mb.box(0.1, 0.45, 0.1, MT.steel(), -1.0, 0.3, s * 0.55);
    mb.box(0.32, 0.04, 0.26, dark, -1.0, 0.09, s * 0.55);
    mb.beam([-1.0, 0.9, s * 0.55], [-1.9, 1.24, s * 0.5], 0.05, 0.05, dark);
  }
  mb.beam([-1.0, 0.75, -0.55], [-1.0, 0.75, 0.55], 0.06, 0.06, dark);
  mb.box(0.1, 0.18, 0.2, dark, -1.0, 0.95, -0.66);
  mb.tube([-1.0, 0.95, -0.76], [-1.0, 0.95, -0.95], 0.015, MT.steel());
  mb.tube([-1.0, 0.95, -0.95], [-1.0, 0.72, -0.95], 0.015, MT.steel());
  // suspensión, ejes y tanque de aire
  for (const x of [-9.7, -10.95]) mb.cyl(0.065, 0.065, 1.85, dark, x, 0.522, 0, HP, 0, 0, 12);
  for (const z of [-0.5, 0.5]) {
    for (const x of [-9.05, -10.32, -11.55]) mb.box(0.1, 0.32, 0.1, dark, x, 0.76, z);
    for (const x of [-9.7, -10.95]) for (let k = 0; k < 4; k++) mb.box(1.1 - k * 0.2, 0.025, 0.08, dark, x, 0.6 + k * 0.027, z);
  }
  mb.cyl(0.13, 0.13, 0.9, MT.steel(), -8.7, 0.8, 0, HP, 0, 0, 16);
  // defensa trasera antiempotramiento, barra de luces y placa
  mb.box(0.12, 0.12, 2.3, dark, -11.45, 0.52, 0);
  mb.put(new THREE.PlaneGeometry(2.2, 0.06), TM.dot(), -11.512, 0.52, 0, 0, -HP, 0);
  for (const z of [-0.5, 0.5]) mb.box(0.1, 0.42, 0.08, dark, -11.45, 0.73, z);
  mb.box(0.08, 0.16, 2.3, dark, -11.47, 1.12, 0);
  mb.put(new THREE.PlaneGeometry(2.1, 0.05), TM.dot(), -11.512, 1.18, 0, 0, -HP, 0);
  for (const z of [-1.0, -0.78, 0.78, 1.0]) mb.put(new THREE.CircleGeometry(0.055, 16), MT.redLens(), -11.513, 1.1, z, 0, -HP, 0);
  for (const z of [-0.12, 0, 0.12]) mb.put(new THREE.CircleGeometry(0.022, 10), MT.redLens(), -11.513, 1.1, z, 0, -HP, 0);
  mb.put(new THREE.PlaneGeometry(0.3, 0.15), mat(0xffffff, { map: TXT.plate('482-UR-3'), roughness: 0.5 }), -11.513, 0.9, 0.35, 0, -HP, 0);
  for (const s of [-1, 1]) {
    mb.put(new THREE.PlaneGeometry(0.6, 0.66), mat(0x141414, { roughness: 0.9, side: THREE.DoubleSide }), -11.42, 0.6, s * 0.92, 0, HP, 0);
    // manos de acople (gladhands) al frente
    mb.box(0.06, 0.05, 0.1, mat(s > 0 ? 0xc01d1d : 0x1d4fc0, { roughness: 0.5 }), 0.92, 1.3, s * 0.25);
  }
  mb.build(t);
  for (const x of [-9.7, -10.95]) { addWheel(t, 'dual', x, 0.9, wheels); addWheel(t, 'dual', x, -0.9, wheels); }
}

// Tractocamión + chasis. Frente +x, origen en el suelo al centro del largo total.
// userData: cargoY (base del contenedor), cargoX (centro de la carga de 40'), cargoX20 [x1, x2], length,
// tractor/trailer (grupo 'trailer' con pivote en el perno rey para articular), wheels[].
export function truckMesh(color = 0xc8c8c8) {
  const g = new THREE.Group(); g.name = 'truck';
  const front = 3.82, kp = -2.4, rear = kp + TRL.rear, shift = -(front + rear) / 2;
  const tractor = new THREE.Group(); tractor.name = 'tractor'; tractor.position.x = shift;
  const trailer = new THREE.Group(); trailer.name = 'trailer'; trailer.position.x = shift + kp;
  const wheels = [];
  buildTractor(tractor, color, wheels);
  buildTrailer(trailer, wheels);
  g.add(tractor, trailer);
  Object.assign(g.userData, {
    kind: 'truck', color, length: front - rear, wheels, tractor, trailer,
    cargoY: TRL.deck, cargoX: trailer.position.x + TRL.c40, cargoX20: TRL.c20.map(x => trailer.position.x + x),
    kingpinX: trailer.position.x, wheelRadius: 0.522,
  });
  return g;
}

// =====================================================================================
// PATIO DE LA TERMINAL
// =====================================================================================
TXT.concrete = () => canvasTex('tm-conc', 512, 512, (c, w, h) => {
  const R = rng(311);
  c.fillStyle = '#a9a59c'; c.fillRect(0, 0, w, h);
  noiseDots(c, w, h, R, 22000, (r) => r < 0.5 ? '#000' : '#fff', 0.07, 2);
  for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * h, r = 20 + R() * 90; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${R() < 0.5 ? '70,65,58' : '200,196,186'},0.13)`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  c.strokeStyle = 'rgba(45,42,38,0.55)'; c.lineWidth = 3; c.strokeRect(0, 0, w, h);
  c.strokeStyle = 'rgba(60,56,50,0.35)'; c.lineWidth = 1;
  for (let k = 0; k < 5; k++) { c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let s = 0; s < 8; s++) { x += (R() - 0.5) * 40; y += (R() - 0.5) * 40; c.lineTo(x, y); } c.stroke(); }
}, true);
TXT.asphalt = () => canvasTex('tm-asph', 512, 512, (c, w, h) => {
  const R = rng(312);
  c.fillStyle = '#4b4c4e'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 26000; i++) { const v = 40 + R() * 80 | 0; c.fillStyle = `rgba(${v},${v},${v},0.55)`; c.fillRect(R() * w, R() * h, 2, 2); }
  for (let i = 0; i < 30; i++) { const x = R() * w, y = R() * h, r = 20 + R() * 80; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, R() < 0.6 ? 'rgba(20,20,22,0.22)' : 'rgba(120,118,112,0.15)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
}, true);
TXT.worn = () => canvasTex('tm-worn', 128, 128, (c, w, h) => {
  const R = rng(313);
  c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 28; i++) { const x = R() * w, y = R() * h, r = 4 + R() * 16; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(0,0,0,${0.25 + R() * 0.45})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(0,0,0,${0.3 + R() * 0.6})`; c.beginPath(); c.arc(R() * w, R() * h, 0.4 + R() * 1.2, 0, 7); c.fill(); }
  c.globalCompositeOperation = 'source-over';
}, true);
TXT.chain = () => canvasTex('tm-chain', 64, 64, (c, w, h) => {
  c.clearRect(0, 0, w, h);
  c.strokeStyle = 'rgba(190,196,200,0.95)'; c.lineWidth = 2.2;
  for (let k = -2; k < 3; k++) { c.beginPath(); c.moveTo(k * 32, 0); c.lineTo(k * 32 + 64, 64); c.stroke(); c.beginPath(); c.moveTo(k * 32 + 64, 0); c.lineTo(k * 32, 64); c.stroke(); }
}, true);
TXT.hazard = () => canvasTex('tm-haz', 128, 128, (c, w, h) => {
  c.fillStyle = '#f2c018'; c.fillRect(0, 0, w, h); c.fillStyle = '#151515';
  for (let k = -2; k < 4; k++) { c.beginPath(); c.moveTo(k * 64, h); c.lineTo(k * 64 + 32, h); c.lineTo(k * 64 + 32 + h, 0); c.lineTo(k * 64 + h, 0); c.closePath(); c.fill(); }
}, true);
TXT.armStripe = () => canvasTex('tm-arm', 256, 16, (c, w, h) => { for (let x = 0; x < w; x += 64) { c.fillStyle = '#d42020'; c.fillRect(x, 0, 32, h); c.fillStyle = '#f6f6f6'; c.fillRect(x + 32, 0, 32, h); } }, true);
TXT.panel = () => canvasTex('tm-panel', 128, 128, (c, w, h) => {
  const R = rng(314);
  c.fillStyle = '#e9e7e0'; c.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 32) { const g = c.createLinearGradient(x, 0, x + 32, 0); g.addColorStop(0, 'rgba(0,0,0,0.12)'); g.addColorStop(0.15, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.04)'); c.fillStyle = g; c.fillRect(x, 0, 32, h); }
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, 0, 2, h);
  noiseDots(c, w, h, R, 900, () => '#5a5040', 0.1);
  const g = c.createLinearGradient(0, h, 0, h * 0.7); g.addColorStop(0, 'rgba(90,75,55,0.18)'); g.addColorStop(1, 'rgba(90,75,55,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
}, true);
TXT.window = () => canvasTex('tm-win', 256, 256, (c, w, h) => {
  const R = rng(315);
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#5f7f93'); g.addColorStop(0.5, '#a9c2cf'); g.addColorStop(1, '#3d5666');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // persianas a media altura
  const bh = h * (0.3 + R() * 0.35);
  for (let y = 0; y < bh; y += 7) { c.fillStyle = '#ddd8cc'; c.fillRect(0, y, w, 5); c.fillStyle = 'rgba(0,0,0,0.15)'; c.fillRect(0, y + 5, w, 2); }
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.moveTo(w * 0.1, h); c.lineTo(w * 0.5, 0); c.lineTo(w * 0.62, 0); c.lineTo(w * 0.22, h); c.fill();
  c.fillStyle = '#c9ccce'; c.fillRect(w / 2 - 3, 0, 6, h);
});
TXT.door = () => canvasTex('tm-door', 128, 256, (c, w, h) => {
  c.fillStyle = '#c9ccce'; c.fillRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#4a6474'); g.addColorStop(1, '#2b3c47');
  c.fillStyle = g; c.fillRect(14, 14, w - 28, h * 0.55);
  c.fillStyle = '#b8bcbf'; c.fillRect(14, h * 0.6, w - 28, h * 0.36);
  c.fillStyle = '#555'; c.fillRect(w - 30, h * 0.5, 8, 30);
  c.fillStyle = '#fff'; c.font = 'bold 16px Arial'; c.textAlign = 'center'; c.fillText('OFICINA', w / 2, h * 0.36);
});
TXT.fan = () => canvasTex('tm-fan', 128, 128, (c, w, h) => {
  c.fillStyle = '#d8d8d4'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(w * 0.42, h / 2, 46, 0, 7); c.fill();
  c.strokeStyle = '#999'; c.lineWidth = 2; for (let r = 10; r < 48; r += 7) { c.beginPath(); c.arc(w * 0.42, h / 2, r, 0, 7); c.stroke(); }
  c.fillStyle = '#777'; for (let y = 10; y < h - 10; y += 6) c.fillRect(w * 0.84, y, 14, 3);
}, true);
TXT.grating = () => canvasTex('tm-grate', 64, 64, (c, w, h) => {
  c.clearRect(0, 0, w, h); c.fillStyle = '#8e9397';
  for (let x = 0; x < w; x += 8) c.fillRect(x, 0, 2, h);
  for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 2);
}, true);
TXT.oil = () => canvasTex('tm-oil', 128, 128, (c, w, h) => {
  const R = rng(316); c.clearRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const x = w / 2 + (R() - 0.5) * 50, y = h / 2 + (R() - 0.5) * 50, r = 14 + R() * 30; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(12,10,8,0.5)'); g.addColorStop(1, 'rgba(12,10,8,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); }
});
TXT.tireMark = () => canvasTex('tm-tmark', 64, 256, (c, w, h) => {
  const R = rng(317); c.clearRect(0, 0, w, h);
  for (let y = 0; y < h; y += 2) { c.fillStyle = `rgba(15,15,15,${0.12 + R() * 0.12})`; c.fillRect(6 + R() * 2, y, 18, 2); c.fillRect(40 + R() * 2, y, 18, 2); }
}, true);
function signTex(text, W, H, o = {}) {
  return canvasTex(`tm-sign|${text}|${W}|${H}|${o.bg}|${o.fg}|${o.sub}|${o.font}|${o.icon}`, W, H, (c) => {
    c.fillStyle = o.bg ?? '#173a63'; c.fillRect(0, 0, W, H);
    if (o.border) { c.strokeStyle = o.border; c.lineWidth = H * 0.05; c.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12); }
    let x0 = 0;
    if (o.icon) {
      // ícono de contenedor apilado
      const s = H * 0.62, ix = H * 0.25, iy = (H - s) / 2;
      const cols = ['#e3ab24', '#d9621e', '#3b86b8'];
      for (let k = 0; k < 3; k++) { c.fillStyle = cols[k]; c.fillRect(ix + (k === 2 ? s * 0.25 : k * s * 0.52), iy + (k === 2 ? 0 : s * 0.52), s * 0.48, s * 0.46); c.fillStyle = 'rgba(0,0,0,0.25)'; for (let j = 1; j < 5; j++) c.fillRect(ix + (k === 2 ? s * 0.25 : k * s * 0.52) + j * s * 0.096, iy + (k === 2 ? 0 : s * 0.52), 2, s * 0.46); }
      x0 = ix + s * 1.15;
    }
    c.fillStyle = o.fg ?? '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const cw = W - x0, cxm = x0 + cw / 2;
    fitFont(c, o.font ?? '900 #px "Arial Black", Arial, sans-serif', text, cw * 0.9, H * (o.sub ? 0.46 : 0.62));
    c.fillText(text, cxm, o.sub ? H * 0.4 : H / 2);
    if (o.sub) { fitFont(c, o.subFont ?? 'bold #px Arial, sans-serif', o.sub, cw * 0.88, H * 0.2); c.fillStyle = o.subFg ?? o.fg ?? '#fff'; c.fillText(o.sub, cxm, H * 0.76); }
  });
}
const signMat = (tex, glow = 0) => mat(0xffffff, { map: tex, roughness: 0.45, emissive: glow ? 0xffffff : 0x000000, emissiveMap: glow ? tex : null, emissiveIntensity: glow });
// letreros de piso (atlas 8×4 celdas de 128 px)
const GCELLS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'ALTO', '10', 'ENTRADA', 'SALIDA', 'arrow', 'walk', 'DESCARGA', 'km/h'];
TXT.ground = () => canvasTex('tm-gatl', 1024, 512, (c) => {
  c.clearRect(0, 0, 1024, 512);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  GCELLS.forEach((t, i) => {
    const x = (i % 8) * 128 + 64, y = (i / 8 | 0) * 128 + 64;
    c.fillStyle = i < 12 ? '#f2c418' : '#f4f4f0';
    if (t === 'arrow') { c.beginPath(); c.moveTo(x, y - 58); c.lineTo(x + 34, y - 10); c.lineTo(x + 12, y - 10); c.lineTo(x + 12, y + 60); c.lineTo(x - 12, y + 60); c.lineTo(x - 12, y - 10); c.lineTo(x - 34, y - 10); c.closePath(); c.fill(); return; }
    if (t === 'walk') {
      c.beginPath(); c.arc(x, y - 44, 11, 0, 7); c.fill();
      c.lineWidth = 12; c.strokeStyle = c.fillStyle; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, y - 28); c.lineTo(x - 4, y + 8); c.lineTo(x - 22, y + 50); c.moveTo(x - 4, y + 8); c.lineTo(x + 18, y + 50); c.moveTo(x - 2, y - 20); c.lineTo(x - 26, y + 2); c.moveTo(x - 2, y - 20); c.lineTo(x + 24, y - 2); c.stroke(); return;
    }
    fitFont(c, 'bold #px "Arial Narrow", Arial, sans-serif', t, 120, 100);
    c.save(); c.translate(x, y); c.scale(1, t.length > 2 ? 1.6 : 1); c.fillText(t, 0, 0); c.restore();
  });
  c.globalCompositeOperation = 'destination-out';
  const R = rng(9); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.7})`; c.fillRect(R() * 1024, R() * 512, 2, 2); }
  c.globalCompositeOperation = 'source-over';
});

const TT = {
  concrete: () => mat(0xffffff, { map: TXT.concrete(), roughness: 0.92 }),
  asphalt: () => mat(0xffffff, { map: TXT.asphalt(), roughness: 0.95 }),
  wallConc: () => mat(0xcfcac0, { map: TXT.concrete(), roughness: 0.9 }),
  white: () => mat(0xf4f4ef, { map: TXT.worn(), transparent: true, depthWrite: false, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  yellow: () => mat(0xf2c418, { map: TXT.worn(), transparent: true, depthWrite: false, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  green: () => mat(0x3f8a5a, { map: TXT.worn(), transparent: true, depthWrite: false, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }),
  gtext: () => mat(0xffffff, { map: TXT.ground(), transparent: true, depthWrite: false, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
  chain: () => { const m = mat(0xffffff, { map: TXT.chain(), transparent: true, depthWrite: false, side: THREE.DoubleSide, roughness: 0.4, metalness: 0.6, env: true, envI: 0.6 }); m.userData.noCast = true; return m; },
  hazard: () => mat(0xffffff, { map: TXT.hazard(), roughness: 0.6 }),
  arm: () => mat(0xffffff, { map: TXT.armStripe(), roughness: 0.4 }),
  panel: () => mat(0xffffff, { map: TXT.panel(), roughness: 0.6, metalness: 0.1 }),
  win: () => mat(0xffffff, { map: TXT.window(), roughness: 0.08, metalness: 0.3, env: true, envI: 1.2 }),
  navy: () => mat(0x1d3557, { roughness: 0.5, metalness: 0.3, env: true, envI: 0.4, map: TXT.grime() }),
  yellowSteel: () => mat(0xf0b416, { roughness: 0.5, metalness: 0.3, env: true, envI: 0.4, map: TXT.grime() }),
  craneWhite: () => mat(0xeae9e3, { roughness: 0.5, metalness: 0.2, env: true, envI: 0.4, map: TXT.grime() }),
  grating: () => mat(0xffffff, { map: TXT.grating(), transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.5, metalness: 0.6 }),
  puddle: () => mat(0x1b1f23, { roughness: 0.03, metalness: 0.5, env: true, envI: 1.3, transparent: true, opacity: 0.88, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }),
  oil: () => mat(0xffffff, { map: TXT.oil(), transparent: true, depthWrite: false, roughness: 0.3, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }),
  tmark: () => mat(0xffffff, { map: TXT.tireMark(), transparent: true, depthWrite: false, roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }),
  lamp: () => mat(0xfff8e8, { emissive: 0xfff2d0, emissiveIntensity: 0.6, roughness: 0.2 }),
  blueDrum: () => mat(0x1f55a8, { roughness: 0.45 }),
  orange: () => mat(0xe8641c, { roughness: 0.5 }),
};
// colisionador invisible
function colBox(parent, list, x, y, z, w, h, d, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ visible: false }));
  m.position.set(x, y, z); m.rotation.y = ry; m.userData.col = true; m.visible = false;
  parent.add(m); list.push(m); return m;
}
// franja pintada en el piso entre dos puntos
function stripe(mb, m, x0, z0, x1, z1, w, y = 0.012) {
  const len = Math.hypot(x1 - x0, z1 - z0); if (len < 1e-3) return;
  mb.put(uvPlaneV(len, w, 0.5), m, (x0 + x1) / 2, y, (z0 + z1) / 2, -HP, 0, Math.atan2(-(z1 - z0), x1 - x0));
}
function dashed(mb, m, x0, z0, x1, z1, w, dash = 3, gap = 3) {
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(len / (dash + gap));
  for (let i = 0; i <= n; i++) { const a = i * (dash + gap) / len, b = Math.min(1, (i * (dash + gap) + dash) / len); if (a >= 1) break; stripe(mb, m, x0 + (x1 - x0) * a, z0 + (z1 - z0) * a, x0 + (x1 - x0) * b, z0 + (z1 - z0) * b, w); }
}
function rectLine(mb, m, x0, z0, x1, z1, w) { stripe(mb, m, x0, z0, x1, z0, w); stripe(mb, m, x0, z1, x1, z1, w); stripe(mb, m, x0, z0, x0, z1, w); stripe(mb, m, x1, z0, x1, z1, w); }
// texto del atlas de piso: rot = ángulo (rad) del "arriba" del texto respecto a -z
function gText(mb, cell, x, z, size, rot = 0) {
  const i = GCELLS.indexOf(cell), cx = (i % 8) * 128, cy = (i / 8 | 0) * 128;
  mb.put(atlasPlane(size, size, [cx, cy, cx + 128, cy + 128], 1024, 512), TT.gtext(), x, 0.014, z, -HP, 0, rot);
}

// cerca perimetral: muro de concreto + malla ciclónica + alambre de púas inclinado hacia afuera
function fenceRun(mb, cols, parent, x0, z0, x1, z1, out) {
  const len = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0);
  const f = mb.at((x0 + x1) / 2, 0, (z0 + z1) / 2, 0, ry, 0);
  const o = Math.sign(out[0] * Math.sin(ry) + out[1] * Math.cos(ry)) || 1;
  const conc = TT.wallConc(), galv = MT.galv();
  f.box(len, 1.0, 0.22, conc, 0, 0.5, 0, 0, 0, 0, 0.4);
  f.box(len, 0.06, 0.28, conc, 0, 1.03, 0, 0, 0, 0, 0.4);
  for (let x = -len / 2 + 2.5; x < len / 2 - 0.5; x += 2.5) f.box(0.012, 0.98, 0.225, mat(0x6e6a63, { roughness: 1 }), x, 0.5, 0);
  f.put(new THREE.PlaneGeometry(len, 1.9).translate(0, 0, 0), TT.chain(), 0, 2.0, 0);
  { const g = f.bk.get(TT.chain()); const last = g[g.length - 1], uv = last.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 0.2, uv.getY(i) * 1.9 / 0.2); }
  const n = Math.max(1, Math.round(len / 3));
  for (let i = 0; i <= n; i++) {
    const x = -len / 2 + i * len / n;
    f.cyl(0.045, 0.045, 2.02, galv, x, 2.07, 0, 0, 0, 0, 10);
    f.beam([x, 3.0, 0], [x, 3.38, o * 0.38], 0.04, 0.04, galv);
  }
  f.cyl(0.025, 0.025, len, galv, 0, 3.0, 0, 0, 0, HP, 8);
  f.cyl(0.018, 0.018, len, galv, 0, 1.08, 0, 0, 0, HP, 8);
  for (const t of [0.35, 0.68, 1]) f.cyl(0.006, 0.006, len, MT.steel(), 0, 3.0 + 0.38 * t, o * 0.38 * t, 0, 0, HP, 4);
  colBox(parent, cols, (x0 + x1) / 2, 1.6, (z0 + z1) / 2, len, 3.2, 0.4, ry);
}

// ---------- grúa de pórtico sobre rieles (RMG) ----------
// Grupo 'crane' (se desplaza en z sobre los rieles), hijo 'trolley' (x, a lo largo de las vigas)
// y nieto 'spreader' (sube/baja). userData.setTrolley(x), userData.setHoist(h) con h = altura de la base del spreader.
function buildCrane(cols) {
  const g = new THREE.Group(); g.name = 'crane';
  const mb = new MB(), Y = TT.yellowSteel(), W = TT.craneWhite(), dark = MT.black(), galv = MT.galv();
  const LX = 15.5, GY = 16.4, TOP = 17.3;
  for (const s of [-1, 1]) {
    const x = s * LX;
    mb.box(1.1, 1.2, 12.6, Y, x, 1.25, 0, 0, 0, 0, 0.3);
    for (const z of [-5.7, 5.7]) {
      mb.box(0.9, 0.75, 1.9, dark, x, 0.45, z);
      for (const dz of [-0.55, 0.55]) mb.cyl(0.34, 0.34, 0.24, MT.steel(), x, 0.36, z + dz, 0, 0, HP, 18);
      mb.box(0.7, 0.35, 0.3, mat(0xf2c418, { roughness: 0.5, map: TXT.hazard() }), x, 0.5, z + Math.sign(z) * 1.05);
    }
    for (const z of [-1, 1]) mb.beam([x, 1.8, z * 5.4], [x, GY - 0.6, z * 2.6], 0.95, 0.95, Y);
    mb.beam([x, 8.6, -4.0], [x, 8.6, 4.0], 0.6, 0.6, Y);
    mb.beam([x, 2.2, -5.0], [x, 8.3, 3.9], 0.25, 0.25, Y); mb.beam([x, 2.2, 5.0], [x, 8.3, -3.9], 0.25, 0.25, Y);
    mb.box(1.3, 1.5, 6.8, Y, x, GY - 0.1, 0, 0, 0, 0, 0.3);
    // escalera con jaula en la pata
    const lz = 5.6, lx = x + s * 0.7;
    for (const dz of [-0.22, 0.22]) mb.cyl(0.025, 0.025, GY - 1.5, galv, lx, (GY + 1.5) / 2, lz + dz, 0, 0, 0, 6);
    for (let y = 2; y < GY - 0.5; y += 0.3) mb.cyl(0.015, 0.015, 0.44, galv, lx, y, lz, HP, 0, 0, 5);
    for (let y = 4; y < GY - 0.5; y += 1.2) mb.put(new THREE.TorusGeometry(0.38, 0.015, 4, 16, PI), galv, lx + s * 0.02, y, lz, 0, s > 0 ? -HP : HP, HP);
  }
  // vigas principales con pasillos y barandales
  for (const z of [-2.6, 2.6]) {
    mb.box(36, 1.8, 0.9, Y, 0, GY, z, 0, 0, 0, 0.3);
    mb.box(36, 0.12, 0.12, MT.steel(), 0, GY + 0.96, z);
    const wz = z + Math.sign(z) * 0.9;
    mb.put(uvPlaneV(36, 0.8, 1), TT.grating(), 0, GY - 0.9, wz, -HP);
    for (let x = -17.5; x <= 17.5; x += 2.5) { mb.box(0.05, 1.1, 0.05, Y, x, GY - 0.35, wz + Math.sign(z) * 0.38); mb.box(0.12, 0.08, 0.9, Y, x, GY - 0.95, wz); }
    mb.box(36, 0.05, 0.05, Y, 0, GY + 0.2, wz + Math.sign(z) * 0.38);
    mb.box(36, 0.04, 0.04, Y, 0, GY - 0.3, wz + Math.sign(z) * 0.38);
    // rótulos
    mb.put(new THREE.PlaneGeometry(4.5, 1.1), signMat(signTex('RMG 01', 512, 128, { bg: '#f0b416', fg: '#1a1a1a' })), 0, GY, z + Math.sign(z) * 0.452, 0, z > 0 ? 0 : PI, 0);
    mb.put(new THREE.PlaneGeometry(2.4, 0.9), signMat(signTex('40 t', 256, 96, { bg: '#ffffff', fg: '#c0281e', border: '#c0281e' })), -9, GY, z + Math.sign(z) * 0.452, 0, z > 0 ? 0 : PI, 0);
    for (let x = -14; x <= 14; x += 7) mb.box(0.5, 0.12, 0.35, TT.lamp(), x, GY - 0.95, z * 0.6);
  }
  // casa eléctrica y anemómetro sobre la pata +x
  mb.box(3.4, 2.6, 4.6, W, LX + 0.4, GY + 2.2, 0, 0, 0, 0, 0.5);
  mb.box(3.6, 0.15, 4.8, dark, LX + 0.4, GY + 3.55, 0);
  for (const z of [-1.2, 0, 1.2]) mb.box(0.03, 0.9, 0.7, mat(0x9aa0a6, { roughness: 0.5, metalness: 0.5 }), LX + 2.12, GY + 2.2, z);
  mb.cyl(0.04, 0.04, 2.2, galv, LX + 1.6, GY + 4.7, 1.8, 0, 0, 0, 6);
  for (let k = 0; k < 3; k++) mb.sph(0.08, galv, LX + 1.6 + Math.cos(k * 2.1) * 0.25, GY + 5.8, 1.8 + Math.sin(k * 2.1) * 0.25);
  mb.sph(0.16, MT.amberLens(), LX + 0.4, GY + 3.75, -1.8);
  // carrete de cable en la pata -x
  mb.cyl(1.25, 1.25, 0.7, dark, -LX - 1.0, 2.6, 4.2, 0, 0, HP, 32);
  mb.cyl(1.0, 1.0, 0.72, mat(0x222222, { roughness: 0.8 }), -LX - 1.0, 2.6, 4.2, 0, 0, HP, 32);
  mb.box(0.8, 2.2, 0.6, Y, -LX - 0.6, 1.9, 4.2);
  mb.build(g);
  for (const s of [-1, 1]) colBox(g, cols, s * LX, 1.3, 0, 1.4, 2.6, 13.4);

  // carro (trolley) con cabina del operador
  const tr = new THREE.Group(); tr.name = 'trolley'; tr.position.set(0, TOP, 0); g.add(tr);
  const tb = new MB();
  tb.box(5.4, 0.55, 6.4, Y, 0, 0.27, 0, 0, 0, 0, 0.4);
  for (const x of [-2.2, 2.2]) for (const z of [-2.6, 2.6]) tb.cyl(0.3, 0.3, 0.25, MT.steel(), x, 0.1, z, HP, 0, 0, 16);
  tb.box(4.4, 2.5, 3.8, W, -0.2, 1.8, 0, 0, 0, 0, 0.5);
  tb.box(4.6, 0.12, 4.0, dark, -0.2, 3.1, 0);
  for (const x of [-1.5, 0, 1.5]) tb.box(0.8, 0.02, 0.6, mat(0x9aa0a6, { roughness: 0.5, metalness: 0.5 }), x, 2.0, 1.91, 0, 0, 0);
  tb.put(new THREE.PlaneGeometry(3.4, 0.7), signMat(signTex('BODEGAVAULT TERMINAL', 1024, 160, { bg: '#1d3557', fg: '#ffffff' })), -0.2, 2.4, 1.91);
  for (const x of [-1.6, 1.6]) for (const z of [-0.9, 0.9]) tb.cyl(0.38, 0.38, 0.22, dark, x, -0.05, z, HP, 0, 0, 18);
  // cabina colgante
  for (const x of [1.0, 2.6]) tb.box(0.25, 3.0, 0.25, Y, x, -1.2, 4.0);
  tb.box(2.2, 0.25, 2.0, Y, 1.8, 0.2, 3.7);
  tb.box(2.4, 2.3, 2.2, W, 1.8, -3.4, 4.3, 0, 0, 0, 0.5);
  tb.box(2.5, 0.12, 2.3, dark, 1.8, -2.2, 4.3);
  tb.put(new THREE.PlaneGeometry(2.0, 1.4), MT.darkGlass(), 3.005, -3.3, 4.3, 0, HP, 0);
  tb.put(new THREE.PlaneGeometry(2.0, 1.4), MT.darkGlass(), 0.595, -3.3, 4.3, 0, -HP, 0);
  tb.put(new THREE.PlaneGeometry(2.0, 1.4), MT.darkGlass(), 1.8, -3.3, 5.405);
  tb.put(new THREE.PlaneGeometry(1.8, 1.6), MT.darkGlass(), 1.8, -4.555, 4.3, HP, 0, 0);
  tb.build(tr);
  // cables de izaje (escala en y = largo)
  const ropes = new THREE.Group(); ropes.name = 'ropes'; tr.add(ropes);
  const rb = new MB();
  for (const x of [-1.15, 1.15]) for (const z of [-0.55, 0.55]) rb.put(new THREE.CylinderGeometry(0.022, 0.022, 1, 6, 1, true).translate(0, -0.5, 0), MT.black(), x, 0, z);
  rb.build(ropes, { cast: false });
  // spreader telescópico
  const sp = new THREE.Group(); sp.name = 'spreader'; tr.add(sp);
  const sb = new MB(), SY = mat(0xf2a516, { roughness: 0.45, metalness: 0.3, env: true, envI: 0.4, map: TXT.grime() });
  sb.box(2.6, 0.5, 1.5, SY, 0, 0.95, 0);
  for (const x of [-1.15, 1.15]) for (const z of [-0.55, 0.55]) sb.cyl(0.2, 0.2, 0.12, dark, x, 1.2, z, HP, 0, 0, 14);
  sb.box(3.4, 0.6, 2.2, SY, 0, 0.42, 0);
  for (const z of [-0.7, 0.7]) sb.box(12.0, 0.3, 0.32, SY, 0, 0.3, z, 0, 0, 0, 0.4);
  for (const x of [-5.95, 5.95]) {
    sb.box(0.36, 0.38, 2.44, SY, x, 0.2, 0);
    for (const z of [-1.138, 1.138]) {
      sb.put(new THREE.ConeGeometry(0.04, 0.09, 6).rotateX(PI), galv, x, -0.03, z);
      const fl = new THREE.BoxGeometry(0.03, 0.55, 0.42); sb.put(fl, SY, x + Math.sign(x) * 0.22, -0.12, z + Math.sign(z) * 0.1, 0, 0, Math.sign(x) * 0.35);
    }
    sb.box(0.3, 0.2, 0.3, dark, x * 0.85, 0.6, 0);
  }
  sb.build(sp);
  const st = { x: 0, h: 9.5 };
  const apply = () => { tr.position.x = st.x; sp.position.y = st.h - TOP; ropes.scale.y = Math.max(0.1, TOP - (st.h + 1.2)); };
  g.userData = { kind: 'crane', trolleyRange: [-12.5, 12.5], hoistRange: [1.0, 13.5], railsZ: [-15.5, -46.8], zRange: [-22, -37], spreaderOffset: 0,
    setTrolley: (x) => { st.x = x; apply(); }, setHoist: (h) => { st.h = h; apply(); } };
  apply();
  return g;
}

// ---------- torre de iluminación ----------
function floodTower(mb, cols, parent, x, z, face) {
  const galv = MT.galv();
  mb.box(1.2, 0.6, 1.2, TT.wallConc(), x, 0.3, z, 0, 0, 0, 0.5);
  mb.cyl(0.13, 0.26, 21, galv, x, 11.1, z, 0, 0, 0, 14);
  const f = mb.at(x, 21.4, z, 0, face, 0);
  f.box(3.2, 0.12, 0.12, galv, 0, 0, 0); f.box(3.2, 0.12, 0.12, galv, 0, 1.1, 0);
  for (const xx of [-1.6, 1.6]) f.box(0.1, 1.2, 0.1, galv, xx, 0.55, 0);
  for (let i = 0; i < 6; i++) {
    const fx = -1.1 + (i % 3) * 1.1, fy = i < 3 ? 0.05 : 1.15;
    f.box(0.7, 0.55, 0.22, MT.black(), fx, fy, 0.2, -0.45, 0, 0);
    f.put(new THREE.PlaneGeometry(0.62, 0.47), TT.lamp(), fx, fy - 0.05, 0.32, -0.45, 0, 0);
  }
  f.put(uvPlaneV(3.4, 1.0, 1), TT.grating(), 0, -0.6, -0.3, -HP);
  f.box(3.4, 0.6, 0.04, galv, 0, -0.3, -0.8);
  for (let y = 1; y < 20.5; y += 0.35) mb.cyl(0.012, 0.012, 0.4, galv, x - 0.3, y, z, 0, 0, HP, 4);
  for (const dz of [-0.2, 0.2]) mb.cyl(0.02, 0.02, 20, galv, x - 0.3, 10.8, z + dz, 0, 0, 0, 5);
  colBox(parent, cols, x, 1.5, z, 1.3, 3, 1.3);
}
function bollard(mb, x, z) {
  mb.cyl(0.1, 0.1, 1.05, mat(0xf2c418, { roughness: 0.45, metalness: 0.3, env: true, envI: 0.4 }), x, 0.525, z, 0, 0, 0, 14);
  mb.cyl(0.102, 0.102, 0.08, mat(0x151515, { roughness: 0.6 }), x, 0.82, z, 0, 0, 0, 14);
  mb.cyl(0.102, 0.102, 0.08, mat(0x151515, { roughness: 0.6 }), x, 0.62, z, 0, 0, 0, 14);
  mb.sph(0.1, mat(0xf2c418, { roughness: 0.45, metalness: 0.3, env: true, envI: 0.4 }), x, 1.05, z, 1, 0.5, 1, 12);
}
function jersey(mb, cols, parent, x, z, ry, len = 3, color = null) {
  const sh = new THREE.Shape([[-0.3, 0], [0.3, 0], [0.3, 0.08], [0.18, 0.33], [0.08, 0.81], [-0.08, 0.81], [-0.18, 0.33], [-0.3, 0.08]].map(([a, b]) => new THREE.Vector2(a, b)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }); g.translate(0, 0, -len / 2);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 0.4, uv.getY(i) * 0.4);
  mb.put(g, color ? mat(color, { map: TXT.concrete(), roughness: 0.8 }) : TT.wallConc(), x, 0, z, 0, ry, 0);
  colBox(parent, cols, x, 0.45, z, 0.6, 0.9, len, ry);
}
function postSign(mb, x, z, ry, tex, w, h, y = 2.2) {
  const f = mb.at(x, 0, z, 0, ry, 0);
  f.cyl(0.04, 0.04, y + h / 2, MT.galv(), 0, (y + h / 2) / 2, -0.03, 0, 0, 0, 8);
  f.box(w + 0.04, h + 0.04, 0.03, MT.galv(), 0, y, -0.05);
  f.put(new THREE.PlaneGeometry(w, h), signMat(tex), 0, y, -0.03);
}
function roundSign(mb, x, z, ry, txt, color = '#c0281e') {
  const tex = canvasTex('tm-rs|' + txt + color, 128, 128, (c, w, h) => {
    c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 63, 0, 7); c.fill();
    c.strokeStyle = color; c.lineWidth = 14; c.beginPath(); c.arc(64, 64, 54, 0, 7); c.stroke();
    c.fillStyle = '#111'; c.textAlign = 'center'; c.textBaseline = 'middle'; fitFont(c, 'bold #px Arial', txt, 76, 56); c.fillText(txt, 64, 66);
  });
  const f = mb.at(x, 0, z, 0, ry, 0);
  f.cyl(0.035, 0.035, 2.4, MT.galv(), 0, 1.2, -0.03, 0, 0, 0, 8);
  f.put(new THREE.CircleGeometry(0.3, 24), mat(0xffffff, { map: tex, transparent: true, roughness: 0.5 }), 0, 2.2, 0);
  f.put(new THREE.CircleGeometry(0.3, 24), MT.galv(), 0, 2.2, -0.012, 0, PI, 0);
}

// ---------- oficina modular de dos pisos ----------
function buildOffice(mb, cols, parent, X0, X1, Z0, Z1) {
  // Z1 = fachada (+z). Pisos: 0.3–3.0 y 3.15–5.85
  const W = X1 - X0, D = Z1 - Z0, cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  const panel = TT.panel(), navy = TT.navy(), win = TT.win(), galv = MT.galv(), ys = TT.yellowSteel();
  for (const [y0, y1] of [[0.3, 3.0], [3.15, 5.85]]) {
    mb.box(W, y1 - y0, D, panel, cx, (y0 + y1) / 2, cz, 0, 0, 0, 0.5);
    // marcos de módulo (cada 3.5 m) estilo contenedor
    for (let x = X0; x <= X1 + 1e-3; x += W / 4) for (const z of [Z0, Z1]) mb.box(0.16, y1 - y0 + 0.15, 0.16, navy, x, (y0 + y1) / 2, z);
    for (const y of [y0, y1]) { mb.box(W + 0.16, 0.16, 0.16, navy, cx, y, Z1); mb.box(W + 0.16, 0.16, 0.16, navy, cx, y, Z0); mb.box(0.16, 0.16, D, navy, X0, y, cz); mb.box(0.16, 0.16, D, navy, X1, y, cz); }
  }
  mb.box(W - 0.2, 0.3, D - 0.2, mat(0x3a3b3d, { roughness: 0.9 }), cx, 0.15, cz);
  mb.box(W + 0.3, 0.15, D + 0.3, navy, cx, 5.95, cz);
  colBox(parent, cols, cx, 3, cz, W + 0.2, 6, D + 0.2);
  // ventanas y puertas (fachada +z)
  const winAt = (x, y, w, h, zf, ry = 0) => {
    const f = mb.at(x, y, zf, 0, ry, 0);
    f.put(new THREE.PlaneGeometry(w, h), win, 0, 0, 0.015);
    f.box(w + 0.1, 0.06, 0.08, MT.alu(), 0, h / 2 + 0.03, 0.03); f.box(w + 0.16, 0.05, 0.16, MT.alu(), 0, -h / 2 - 0.03, 0.06);
    for (const s of [-1, 1]) f.box(0.05, h, 0.08, MT.alu(), s * (w / 2 + 0.025), 0, 0.03);
  };
  const doorX = cx;
  for (const x of [X0 + 1.4, X0 + 3.9, X1 - 3.9, X1 - 1.4]) winAt(x, 1.75, 1.5, 1.1, Z1);
  for (const x of [X0 + 1.4, X0 + 3.9, X1 - 3.9, X1 - 1.4]) winAt(x, 4.6, 1.5, 1.1, Z1);
  for (const z of [Z0 + 1.6, Z1 - 1.6]) { winAt(X0, 1.75, 1.2, 1.0, z, -HP); winAt(X0, 4.6, 1.2, 1.0, z, -HP); }
  winAt(X1 - 1.4, 1.75, 1.5, 1.1, Z0, PI); winAt(X0 + 1.4, 4.6, 1.5, 1.1, Z0, PI);
  const doorM = mat(0xffffff, { map: TXT.door(), roughness: 0.35, metalness: 0.2, env: true, envI: 0.6 });
  mb.put(new THREE.PlaneGeometry(1.0, 2.15), doorM, doorX, 0.3 + 1.075, Z1 + 0.015);
  mb.box(1.15, 0.08, 0.1, MT.alu(), doorX, 2.5, Z1 + 0.03);
  mb.put(new THREE.PlaneGeometry(1.0, 2.15), doorM, doorX - 3.5, 3.15 + 1.075, Z1 + 0.015);
  mb.box(1.8, 0.3, 1.2, TT.wallConc(), doorX, 0.15, Z1 + 0.6, 0, 0, 0, 0.5);
  mb.put(new THREE.PlaneGeometry(1.6, 0.36), signMat(signTex('OFICINA · CAJA', 512, 116, { bg: '#1d3557', fg: '#ffffff' })), doorX, 2.72, Z1 + 0.012);
  mb.box(0.3, 0.12, 0.2, MT.black(), doorX + 0.9, 2.6, Z1 + 0.1); mb.put(new THREE.PlaneGeometry(0.26, 0.16), TT.lamp(), doorX + 0.9, 2.54, Z1 + 0.1, HP, 0, 0);
  // balcón y barandal amarillo
  const BZ = Z1 + 1.4;
  mb.put(uvPlaneV(W + 1.3, 1.4, 1.2), TT.grating(), cx + 0.6, 3.1, Z1 + 0.7, -HP);
  mb.box(W + 1.3, 0.14, 0.1, ys, cx + 0.6, 3.05, BZ);
  for (let x = X0 + 0.1; x <= X1 + 1.2; x += (W + 1.1) / 5) { mb.box(0.12, 3.05, 0.12, ys, x, 1.52, BZ); mb.box(0.06, 1.05, 0.06, ys, x, 3.6, BZ); }
  mb.box(W + 1.3, 0.05, 0.05, ys, cx + 0.6, 4.15, BZ); mb.box(W + 1.3, 0.04, 0.04, ys, cx + 0.6, 3.65, BZ);
  mb.box(0.05, 1.05, 1.4, ys, X0, 3.6, Z1 + 0.7);
  mb.put(new THREE.PlaneGeometry(5.4, 0.85), signMat(signTex('VENTA DE CONTENEDORES', 1024, 160, { bg: '#c0281e', fg: '#ffffff', sub: 'SUBASTA DIARIA · CONTENIDO SORPRESA', subFg: '#ffe08a' })), cx - 1.5, 3.65, BZ + 0.05);
  // escalera exterior en el costado +x
  const sx = X1 + 0.15 + 0.55, n = 16, run = 4.3, zt = Z1 - 0.3, zb = zt - run;
  for (let i = 0; i < n; i++) { const t = (i + 1) / n; mb.box(1.0, 0.04, run / n + 0.04, TT.grating() === null ? galv : MT.galv(), sx, 3.0 * t - 0.02, zb + run * (i + 0.5) / n); }
  for (const dx of [-0.53, 0.53]) {
    mb.beam([sx + dx, 0, zb], [sx + dx, 3.0, zt], 0.06, 0.22, ys);
    mb.beam([sx + dx, 1.0, zb], [sx + dx, 4.0, zt], 0.045, 0.045, ys);
    for (let k = 0; k <= 3; k++) { const t = k / 3; mb.box(0.045, 1.0, 0.045, ys, sx + dx, 3.0 * t + 0.5, zb + run * t); }
  }
  mb.put(uvPlaneV(1.1, 1.4 + 0.3, 1.2), TT.grating(), sx, 3.1, Z1 + 0.55, -HP);
  for (const z of [zt, Z1 + 1.4]) mb.box(0.12, 3.05, 0.12, ys, sx + 0.5, 1.52, z);
  mb.box(0.05, 0.05, 1.7, ys, sx + 0.53, 4.15, Z1 + 0.55);
  colBox(parent, cols, sx, 0.6, (zb + zt) / 2, 1.2, 1.2, run);
  // letrero principal en el techo
  const st = signTex('CENTRAL DE CONTENEDORES', 2048, 220, { bg: '#173a63', fg: '#ffffff', icon: true, sub: 'COMPRA · VENTA · SUBASTA DE CONTENEDORES', subFg: '#f2c418' });
  for (const x of [X0 + 1.5, cx, X1 - 1.5]) { mb.box(0.12, 1.6, 0.12, galv, x, 6.8, Z1 - 0.3); mb.beam([x, 6.0, Z1 - 1.6], [x, 7.4, Z1 - 0.35], 0.08, 0.08, galv); }
  mb.box(W - 0.6, 1.5, 0.12, navy, cx, 6.95, Z1 - 0.2);
  mb.put(new THREE.PlaneGeometry(W - 0.8, 1.32), signMat(st, 0.25), cx, 6.95, Z1 - 0.135);
  // equipos de techo: tinaco, aires acondicionados, antena
  mb.put(latheGeo([[0, 0], [0.55, 0], [0.58, 0.1], [0.58, 1.05], [0.5, 1.2], [0.2, 1.28], [0.2, 1.36], [0, 1.36]], 28), mat(0x1c1d1e, { roughness: 0.6 }), X0 + 1.6, 6.03, Z0 + 1.5);
  for (let i = 0; i < 3; i++) {
    const ax = X0 + 4.5 + i * 2.6, az = Z0 + 1.3;
    mb.box(1.0, 0.75, 0.42, mat(0xd8d8d4, { roughness: 0.5 }), ax, 6.4, az);
    mb.put(new THREE.PlaneGeometry(0.95, 0.72), mat(0xffffff, { map: TXT.fan(), roughness: 0.6 }), ax, 6.4, az + 0.212);
  }
  mb.cyl(0.03, 0.03, 3, galv, X1 - 1.2, 7.5, Z0 + 1.0, 0, 0, 0, 6);
  mb.put(new THREE.SphereGeometry(0.45, 18, 10, 0, PI * 2, 0, 1.0), mat(0xe8e8e4, { roughness: 0.4, side: THREE.DoubleSide }), X1 - 2.4, 6.5, Z0 + 1.0, -0.9, 0.6, 0);
  // bajantes pluviales
  for (const x of [X0 + 0.2, X1 - 0.2]) mb.cyl(0.05, 0.05, 6, mat(0x8a8d90, { roughness: 0.5 }), x, 3, Z0 - 0.12, 0, 0, 0, 8);
  // aire tipo ventana en el costado y banca
  mb.box(0.65, 0.45, 0.6, mat(0xd8d8d4, { roughness: 0.5 }), X0 - 0.3, 2.4, Z0 + 3.3);
  mb.box(1.6, 0.06, 0.4, C.wood(0x8a5a32), X1 - 1.2, 0.45, Z1 + 0.9);
  for (const dx of [-0.6, 0.6]) mb.box(0.06, 0.45, 0.4, MT.black(), X1 - 1.2 + dx, 0.22, Z1 + 0.9);
  mb.cyl(0.25, 0.22, 0.85, TT.blueDrum(), X1 - 2.6, 0.43, Z1 + 0.7, 0, 0, 0, 20);
}

export function buildTerminal() {
  const group = new THREE.Group(); group.name = 'terminal';
  const cols = [];
  const mb = new MB(), stk = new MB();
  const conc = TT.concrete(), asph = TT.asphalt(), white = TT.white(), yellow = TT.yellow(), green = TT.green();
  const R = rng(2024);

  // ---------- piso ----------
  mb.put(uvPlaneV(80, 48, 0.2), conc, 0, 0, -24, -HP);
  for (const [x0, z0, x1, z1] of [[-6.5, -8, 6.5, 0], [0.4, -46.6, 5.6, -8], [-18.6, -46.6, 5.6, -41.4], [-18.6, -41.4, -13.4, -18], [-18.6, -18, 0.4, -6]]) mb.flat(x0, z0, x1, z1, asph, 0.004, 0.2);
  // líneas de carril
  dashed(mb, white, 0, -7.5, 0, -0.4, 0.15, 2, 2);
  stripe(mb, white, 0.55, -46.5, 0.55, -8, 0.14); stripe(mb, white, 5.45, -46.5, 5.45, -8, 0.14);
  dashed(mb, yellow, 3, -40, 3, -9, 0.12, 3, 3);
  stripe(mb, white, -18.5, -46.5, 5.45, -46.5, 0.14); stripe(mb, white, -13.5, -41.5, 0.55, -41.5, 0.14);
  stripe(mb, white, -18.5, -46.5, -18.5, -6.2, 0.14); stripe(mb, white, -13.5, -41.5, -13.5, -18.2, 0.14);
  dashed(mb, yellow, -16, -40, -16, -19, 0.12, 3, 3); dashed(mb, yellow, -14, -44, 0, -44, 0.12, 3, 3);
  rectLine(mb, yellow, 0.75, -35.4, 5.25, -18.6, 0.18);
  for (let z = -34; z > -36; z -= 0.8) stripe(mb, yellow, 1.0, z, 5.0, z - 0.6, 0.12);
  gText(mb, 'DESCARGA', 3, -31.5, 3.2, 0); gText(mb, 'arrow', 3, -12, 2.6, 0); gText(mb, 'ENTRADA', 3, -5.2, 3.2, PI);
  gText(mb, 'arrow', -3, -4.5, 2.6, PI); gText(mb, 'SALIDA', -16, -30, 3.2, PI); gText(mb, 'arrow', -16, -34, 2.6, PI);
  gText(mb, '10', 3, -15.5, 2.0, PI); gText(mb, 'km/h', 3, -17, 1.6, PI);
  stripe(mb, white, -5.8, -2.0, -0.2, -2.0, 0.45); gText(mb, 'ALTO', -3, -3.0, 2.2, PI);
  // banda de cruce y topes (reductores)
  for (const x0 of [-5.6, 0.6]) for (let i = 0; i < 10; i++) mb.box(0.5, 0.06, 0.5, i % 2 ? MT.black() : mat(0xf2c418, { roughness: 0.6 }), x0 + 0.25 + i * 0.5, 0.03, -8.5);
  // andador peatonal verde con bordes blancos y pictogramas
  const walk = (x0, z0, x1, z1) => { mb.flat(x0, z0, x1, z1, green, 0.008, 0.5); rectLine(mb, white, x0, z0, x1, z1, 0.12); };
  walk(7.3, -27.9, 8.9, 0); walk(8.9, -3.9, 24.6, -2.3); walk(7.3, -29, 28.6, -26);
  for (const z of [-6, -16]) gText(mb, 'walk', 8.1, z, 1.3, 0);
  gText(mb, 'walk', 14, -27.5, 1.3, HP); gText(mb, 'walk', 16, -3.1, 1.3, -HP);
  // cajones de contenedores (slots)
  const slots = [];
  const xs = [10.6, 13.8, 17.0, 20.2, 23.4, 26.6];
  xs.forEach((x, i) => slots.push({ id: 'A' + (i + 1), x, z: -26 - 0.001 + 0 - 6.058 / 2 + 6.058, ry: HP, size: '20', stack: 0 }));
  slots.forEach(s => { s.z = -26 + 6.058 / 2; });
  xs.forEach((x, i) => { const big = i >= 4, L = big ? 12.192 : 6.058; slots.push({ id: 'B' + (i + 1), x, z: -29 - L / 2, ry: -HP, size: big ? '40' : '20', stack: 0 }); });
  for (const s of slots) {
    const L = s.size === '40' ? 12.192 : 6.058, hwid = 1.45;
    const zA = s.ry > 0 ? s.z - L / 2 : s.z + L / 2, zB = s.ry > 0 ? s.z + L / 2 + 0.15 : s.z - L / 2 - 0.15;
    rectLine(mb, yellow, s.x - hwid, Math.min(zA, zB), s.x + hwid, Math.max(zA, zB), 0.12);
    gText(mb, s.id, s.x, zA + (s.ry > 0 ? -0.75 : 0.75), 1.1, s.ry > 0 ? 0 : PI);
    s.z = +s.z.toFixed(3);
  }
  // charcos, manchas de aceite y huellas de llanta
  for (const [x, z, r] of [[-8, -20, 1.6], [12.4, -42, 1.2], [-25.5, -30.4, 1.4], [6.2, -12, 0.9], [33, -15.5, 1.1], [-3.5, -36, 1.3]]) {
    const pts = []; for (let a = 0; a < PI * 2; a += PI / 12) { const k = r * (0.7 + R() * 0.45); pts.push(new THREE.Vector2(Math.cos(a) * k * 1.4, Math.sin(a) * k)); }
    mb.put(new THREE.ShapeGeometry(new THREE.Shape(pts)), TT.puddle(), x, 0.016, z, -HP, 0, R() * 3);
  }
  for (let i = 0; i < 22; i++) { const s = 1 + R() * 2.2, onLane = i < 14; const x = onLane ? 3 + (R() - 0.5) * 3 : -16 + (R() - 0.5) * 3, z = onLane ? -10 - R() * 34 : -20 - R() * 22; mb.put(new THREE.PlaneGeometry(s, s), TT.oil(), x, 0.013, z, -HP, 0, R() * 6); }
  for (const [x, z0, z1] of [[3 - 0.95, -46, -6], [3 + 0.95, -46, -6], [-16 - 0.95, -44, -19], [-16 + 0.95, -44, -19]]) { const g = uvPlaneV(0.62, z0 - z1, 1); const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 0.62, uv.getY(i) / 4); mb.put(g, TT.tmark(), x, 0.011, (z0 + z1) / 2, -HP); }

  // ---------- cerca perimetral, portón y caseta ----------
  fenceRun(mb, cols, group, -40, 0, -7.0, 0, [0, 1]);
  fenceRun(mb, cols, group, 9.0, 0, 40, 0, [0, 1]);
  fenceRun(mb, cols, group, -40, -48, 40, -48, [0, -1]);
  fenceRun(mb, cols, group, -40, 0, -40, -48, [-1, 0]);
  fenceRun(mb, cols, group, 40, 0, 40, -48, [1, 0]);
  // pilares del portón y viga con letrero
  for (const s of [-1, 1]) {
    mb.box(0.7, 7.6, 0.7, TT.wallConc(), s * 6.65, 3.8, 0, 0, 0, 0, 0.5);
    mb.box(0.72, 1.2, 0.72, TT.hazard(), s * 6.65, 0.6, 0);
    colBox(group, cols, s * 6.65, 3.8, 0, 0.8, 7.6, 0.8);
  }
  mb.box(14.0, 0.6, 0.6, TT.navy(), 0, 6.2, 0);
  mb.box(11.6, 1.6, 0.25, TT.navy(), 0, 7.35, 0);
  const gs = signTex('CENTRAL DE CONTENEDORES', 2048, 280, { bg: '#173a63', fg: '#ffffff', icon: true, sub: 'ACCESO DE CARGA · VENTA AL PÚBLICO', subFg: '#f2c418' });
  mb.put(new THREE.PlaneGeometry(11.4, 1.45), signMat(gs, 0.2), 0, 7.35, 0.13);
  mb.put(new THREE.PlaneGeometry(11.4, 1.45), signMat(gs, 0.2), 0, 7.35, -0.13, 0, PI, 0);
  mb.put(new THREE.PlaneGeometry(2.2, 0.42), signMat(signTex('ALTURA LIBRE 5.9 m', 512, 100, { bg: '#f2c418', fg: '#111111' })), 0, 6.2, 0.305);
  for (const x of [-3, 3]) { mb.box(0.3, 0.7, 0.3, MT.black(), x, 5.55, 0.3); mb.sph(0.08, x > 0 ? mat(0x20ff60, { emissive: 0x20ff60, emissiveIntensity: 1.2 }) : mat(0x501010, { roughness: 0.3 }), x, 5.72, 0.46); mb.sph(0.08, x > 0 ? mat(0x501010, { roughness: 0.3 }) : mat(0xff2020, { emissive: 0xff2020, emissiveIntensity: 1.2 }), x, 5.42, 0.46); }
  for (const x of [-4.5, -1.5, 1.5, 4.5]) { mb.box(0.6, 0.1, 0.35, MT.black(), x, 5.85, 0); mb.put(new THREE.PlaneGeometry(0.5, 0.25), TT.lamp(), x, 5.795, 0, HP, 0, 0); }
  // acceso peatonal con techito
  for (const x of [7.15, 9.0]) { mb.box(0.25, 2.8, 0.25, TT.navy(), x, 1.4, 0); }
  mb.box(2.4, 0.14, 1.4, TT.navy(), 8.08, 2.85, 0);
  mb.put(new THREE.PlaneGeometry(1.8, 0.3), signMat(signTex('ACCESO PEATONAL', 512, 86, { bg: '#1d3557', fg: '#ffffff' })), 8.08, 2.6, 0.13);
  mb.box(0.35, 2.4, 0.22, TT.wallConc(), 6.85 + 0.15, 1.2, 0);
  // portón corredizo estacionado (abierto) detrás del muro izquierdo
  { const gz = -0.75, x0 = -19.4, x1 = -7.2, len = x1 - x0, xc = (x0 + x1) / 2, galv = MT.galv();
    mb.box(len, 0.08, 0.08, galv, xc, 2.55, gz); mb.box(len, 0.08, 0.08, galv, xc, 0.18, gz);
    for (let x = x0; x <= x1 + 1e-3; x += len / 6) mb.box(0.08, 2.4, 0.08, galv, x, 1.36, gz);
    mb.beam([x0, 0.2, gz], [xc, 2.5, gz], 0.05, 0.05, galv); mb.beam([x1, 0.2, gz], [xc, 2.5, gz], 0.05, 0.05, galv);
    mb.put(new THREE.PlaneGeometry(len, 2.3), TT.chain(), xc, 1.36, gz);
    { const a = mb.bk.get(TT.chain()), g = a[a.length - 1], uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 0.2, uv.getY(i) * 2.3 / 0.2); }
    for (const x of [x0 + 0.6, x1 - 0.6]) mb.cyl(0.11, 0.11, 0.06, MT.black(), x, 0.11, gz, HP, 0, 0, 14);
    colBox(group, cols, xc, 1.3, gz, len, 2.6, 0.3);
  }
  // isla, caseta de vigilancia y plumas
  mb.box(2.0, 0.15, 6.6, TT.wallConc(), 0, 0.075, -3.6, 0, 0, 0, 0.5);
  for (const s of [-1, 1]) mb.box(0.06, 0.16, 6.6, TT.hazard(), s * 1.0, 0.08, -3.6);
  mb.box(2.06, 0.16, 0.06, TT.hazard(), 0, 0.08, -0.3);
  { const bx = 0, bz = -3.7, y0 = 0.15, panel = TT.panel(), navy = TT.navy();
    mb.box(1.7, 1.0, 2.5, panel, bx, y0 + 0.5, bz, 0, 0, 0, 0.6);
    for (const [w, d, x, z, ry] of [[1.6, 0, 0, 1.25, 0], [1.6, 0, 0, -1.25, PI], [2.4, 0, 0.85, 0, HP], [2.4, 0, -0.85, 0, -HP]]) mb.put(new THREE.PlaneGeometry(w, 1.15), MT.tint(), bx + x, y0 + 1.6, bz + z, 0, ry, 0);
    for (const [x, z] of [[-0.85, -1.25], [0.85, -1.25], [-0.85, 1.25], [0.85, 1.25]]) mb.box(0.08, 2.4, 0.08, navy, bx + x, y0 + 1.2, bz + z);
    mb.box(1.76, 0.1, 2.56, navy, bx, y0 + 1.05, bz); mb.box(1.76, 0.12, 2.56, navy, bx, y0 + 2.2, bz);
    mb.box(2.4, 0.18, 3.2, navy, bx, y0 + 2.35, bz);
    mb.put(new THREE.PlaneGeometry(1.5, 0.2), signMat(signTex('VIGILANCIA', 512, 70, { bg: '#1d3557', fg: '#ffffff' })), bx, y0 + 2.35, bz + 1.605);
    mb.sph(0.12, MT.amberLens(), bx, y0 + 2.5, bz + 1.0);
    mb.box(1.5, 0.06, 0.5, C.wood(0x8a5a32), bx, y0 + 1.0, bz + 0.85);
    mb.box(0.4, 0.28, 0.05, MT.black(), bx + 0.3, y0 + 1.2, bz + 0.75);
    mb.box(0.45, 0.4, 0.6, mat(0xd8d8d4, { roughness: 0.5 }), bx, y0 + 2.6, bz - 0.8);
    colBox(group, cols, bx, 1.3, bz, 1.8, 2.6, 2.6);
    for (const z of [-0.6, -6.6]) bollard(mb, 0, z);
  }
  const barriers = {};
  for (const [s, name] of [[1, 'barrier'], [-1, 'barrierOut']]) {
    const px = s * 1.3, pz = -1.2;
    mb.box(0.36, 1.0, 0.36, mat(0xf2c418, { roughness: 0.45, metalness: 0.2 }), px, 0.5, pz);
    mb.box(0.38, 0.06, 0.38, MT.black(), px, 1.02, pz);
    mb.box(0.08, 0.85, 0.08, MT.galv(), s * 5.8, 0.42, pz); mb.box(0.18, 0.06, 0.1, MT.galv(), s * 5.8, 0.86, pz);
    const arm = new THREE.Group(); arm.name = name; arm.position.set(px, 0.95, pz); group.add(arm);
    const am = new MB();
    const ag = uvBox(4.6, 0.09, 0.06, 1); const uv = ag.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.8, uv.getY(i));
    am.put(ag, TT.arm(), s * 2.45, 0, 0);
    am.box(0.5, 0.18, 0.14, MT.black(), -s * 0.15, 0, 0);
    am.box(0.16, 0.16, 0.2, MT.black(), 0, 0, 0);
    for (let k = 0; k < 4; k++) am.sph(0.025, MT.redLens(), s * (1 + k * 1.1), 0.05, 0);
    am.build(arm);
    arm.userData = { openAngle: s * HP * 0.98, axis: 'z' };
    barriers[name] = arm;
  }
  postSign(mb, 7.2, -1.2, 0, signTex('USO OBLIGATORIO', 512, 300, { bg: '#1f5fa8', fg: '#ffffff', sub: 'CASCO · CHALECO · BOTAS', font: 'bold #px Arial' }), 1.2, 0.7, 1.9);
  roundSign(mb, 6.3, -7.5, 0, '10'); roundSign(mb, -6.3, -10, PI, 'ALTO');
  postSign(mb, 6.4, -20, -HP, signTex('PRECAUCIÓN', 512, 300, { bg: '#f2c418', fg: '#111111', sub: 'GRÚA EN OPERACIÓN', font: 'bold #px Arial' }), 1.1, 0.65, 2.0);

  // ---------- oficina ----------
  buildOffice(mb, cols, group, 17, 31, -14, -7);
  for (const x of [17.2, 24, 30.8]) bollard(mb, x, -4.4);
  // estacionamiento de personal
  for (let x = 33.0; x <= 39.6; x += 2.6) stripe(mb, white, x, -2.0, x, -7.4, 0.12);
  for (let x = 34.3; x < 39.5; x += 2.6) mb.box(1.6, 0.12, 0.2, mat(0xf2c418, { roughness: 0.7 }), x, 0.06, -7.0);
  lazyCar(group, 'pickup', 0xe8e4da, 34.3, -4.6, -HP);
  lazyCar(group, 'sedan', 0x7a1f2a, 36.9, -4.7, -HP);
  colBox(group, cols, 35.6, 0.8, -4.6, 5.2, 1.6, 4.6);

  // ---------- grúa y rieles ----------
  for (const x of [-1.5, 29.5]) {
    mb.flat(x - 0.4, -46.9, x + 0.4, -15.4, mat(0x8a8780, { map: TXT.concrete(), roughness: 0.9 }), 0.007, 0.3);
    mb.box(0.075, 0.07, 31.4, MT.steel(), x, 0.035, -31.15);
    for (const z of [-15.5, -46.8]) { mb.box(0.9, 0.9, 0.6, TT.hazard(), x, 0.45, z); colBox(group, cols, x, 0.45, z, 0.9, 0.9, 0.6); }
  }
  const crane = buildCrane(cols);
  crane.position.set(14, 0, -30);
  group.add(crane);

  // ---------- torres de iluminación ----------
  floodTower(mb, cols, group, -38.8, -2.2, PI * 0.75);
  floodTower(mb, cols, group, 38.8, -1.6, -PI * 0.75);
  floodTower(mb, cols, group, -38.8, -47.0, PI * 0.25);
  floodTower(mb, cols, group, 39.0, -47.2, -PI * 0.25);

  // ---------- área de mantenimiento (techumbre) ----------
  { const x0 = -36, x1 = -24, z0 = -12.5, z1 = -3.5, galv = MT.galv();
    for (const x of [x0, (x0 + x1) / 2, x1]) for (const z of [z0, z1]) { mb.box(0.25, 4.6, 0.25, TT.navy(), x, 2.3, z); colBox(group, cols, x, 1.5, z, 0.3, 3, 0.3); }
    for (const z of [z0, z1]) mb.box(x1 - x0 + 0.4, 0.3, 0.2, TT.navy(), (x0 + x1) / 2, 4.55, z);
    const rp = trapProf(x0 - 0.5, x1 + 0.5, 0.2, 0.03, 0.05, 0.11);
    mb.at(0, 4.75, (z0 + z1) / 2, -HP - 0.05, 0, 0).putM(corrGeo(rp, x0 - 0.5, x1 + 0.5, -(z1 - z0) / 2 - 0.6, (z1 - z0) / 2 + 0.6, { uv: (a, b) => [a * 0.5, b * 0.5] }), mat(0xb9bec2, { map: TXT.grime(), roughness: 0.45, metalness: 0.6, env: true, envI: 0.6, side: THREE.DoubleSide }));
    for (let i = 0; i < 7; i++) { const x = x0 + 0.8 + (i % 4) * 0.62, z = z0 + 0.8 + (i / 4 | 0) * 0.62; mb.cyl(0.29, 0.29, 0.88, [TT.blueDrum(), mat(0xc0281e, { roughness: 0.45 }), mat(0xe9b21a, { roughness: 0.45 })][i % 3], x, 0.44, z, 0, 0, 0, 20); }
    for (let i = 0; i < 5; i++) mb.put(new THREE.TorusGeometry(0.4, 0.14, 10, 24), mat(0x1c1c1c, { roughness: 0.9 }), x1 - 1.0, 0.14 + i * 0.27, z1 - 1.2, HP, 0, 0);
    for (let i = 0; i < 3; i++) mb.put(new THREE.TorusGeometry(0.4, 0.14, 10, 24), mat(0x1c1c1c, { roughness: 0.9 }), x1 - 2.1, 0.14 + i * 0.27, z1 - 1.2, HP, 0, 0);
    mb.box(2.2, 0.08, 0.8, C.wood(0x8a5a32), (x0 + x1) / 2, 0.92, z0 + 0.6); for (const dx of [-1, 1]) mb.box(0.08, 0.9, 0.7, MT.black(), (x0 + x1) / 2 + dx, 0.45, z0 + 0.6);
    mb.box(1.1, 0.8, 0.6, mat(0xc0281e, { roughness: 0.5 }), x0 + 5.2, 0.4, z0 + 0.6); mb.cyl(0.25, 0.25, 0.9, mat(0xc0281e, { roughness: 0.5 }), x0 + 5.2, 1.05, z0 + 0.6, 0, 0, HP, 16);
    for (let i = 0; i < 4; i++) { const x = x0 + 7 + (i % 2) * 1.3, y = (i / 2 | 0) * 0.15; for (let k = 0; k < 3; k++) mb.box(1.2, 0.03, 0.1, C.wood(0xb08a5a), x, y + 0.02, z1 - 1 + (k - 1) * 0.5); for (let k = 0; k < 7; k++) mb.box(0.1, 0.03, 1.2, C.wood(0xb08a5a), x - 0.55 + k * 0.183, y + 0.1, z1 - 1); }
    colBox(group, cols, x0 + 1.9, 0.5, z0 + 1.1, 2.8, 1, 1.4);
    containerInto(stk, 'halcon', 0x7a8187, '20', 41, -30, 0, -15.0, 0);
    colBox(group, cols, -30, 1.3, -15.0, 6.1, 2.6, 2.5);
  }

  // ---------- pilas de contenedores decorativos ----------
  const pick = () => { const b = CONTAINER_BRANDS[(R() * 3) | 0]; return [b.id, b.colors[(R() * b.colors.length) | 0]]; };
  const stack = (x, z, ry, size, tiers, seed0) => {
    const sp = containerSpec(size);
    for (let t = 0; t < tiers; t++) { const [b, c] = pick(); containerInto(stk, b, c, size, seed0 + t * 17, x + (R() - 0.5) * 0.06, t * sp.H, z + (R() - 0.5) * 0.06, ry + (R() - 0.5) * 0.008); }
    const along = Math.abs(Math.sin(ry)) > 0.5;
    colBox(group, cols, x, tiers * sp.H / 2, z, along ? sp.W : sp.L, tiers * sp.H, along ? sp.L : sp.W);
  };
  let sd = 100;
  // zona poniente: dos hileras de 40' orientados en z
  for (const x of [-20.6, -23.5, -26.4, -29.3, -32.2, -35.1, -38.0]) {
    for (const zc of [-23.6, -37.1]) {
      if (R() < 0.3) { stack(x, zc + 3.07, HP * (R() < 0.5 ? 1 : -1), '20', 1 + (R() * 3 | 0), sd += 3); stack(x, zc - 3.07, HP * (R() < 0.5 ? 1 : -1), '20', 1 + (R() * 3 | 0), sd += 3); }
      else stack(x, zc, HP * (R() < 0.5 ? 1 : -1), R() < 0.25 ? '40HC' : '40', 1 + (R() * 3.4 | 0), sd += 5);
    }
  }
  // zona central
  for (const x of [-11.1, -8.2, -5.3]) stack(x, -33.6, -HP, '40', 1 + (R() * 3 | 0), sd += 5);
  // zona oriente: 20' orientados en x
  for (let z = -18.0; z > -46.5; z -= 2.75) stack(35.3, z, R() < 0.5 ? 0 : PI, '20', 1 + (R() * 4 | 0), sd += 5);
  // fondo bajo la grúa
  stack(14.6, -44.8, 0, '40', 2, sd += 5); stack(24.5, -44.8, PI, '20', 3, sd += 5);
  stk.build(group);

  // ---------- barreras, bolardos y conos ----------
  for (let z = -8; z > -25; z -= 3.3) jersey(mb, cols, group, 6.4, z - 1.5, 0, 3);
  for (const x of [-12.5, -9.5, -6.5]) jersey(mb, cols, group, x, -26.2, HP, 3, 0xe9e5dc);
  for (const z of [-0.6, -2.3]) bollard(mb, 7.0, z);
  for (const [x, z] of [[18.5, -45.9], [6.4, -27], [6.4, -29.2], [28.9, -27], [28.9, -29.2]]) bollard(mb, x, z);
  for (const [x, z] of [[-6.3, -41], [-9.5, -41], [6.0, -38], [0.0, -47.3]]) {
    mb.put(latheGeo([[0.19, 0], [0.19, 0.03], [0.14, 0.04], [0.035, 0.7], [0, 0.71]], 18), TT.orange(), x, 0, z);
    mb.cyl(0.085, 0.07, 0.1, mat(0xf4f4f4, { roughness: 0.4 }), x, 0.45, z, 0, 0, 0, 18);
  }

  mb.build(group);

  // ---------- trayectoria del camión ----------
  const key = [[3, 15], [3, 6], [3, 0], [3, -8], [3, -16], [3, -22], [3, -27], [3, -32], [2.5, -37], [0.8, -40.6], [-2.3, -43.2], [-6, -44.2], [-10, -44.2], [-13.2, -43.3], [-15.3, -41.2], [-16, -38], [-16, -30], [-16, -24], [-15.4, -19.8], [-13.3, -15.8], [-9.8, -12.2], [-6, -9.2], [-3.8, -6.6], [-3, -3], [-3, 0], [-3, 8], [-3, 15]];
  const curve = new THREE.CatmullRomCurve3(key.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
  const n = Math.round(curve.getLength() / 2);
  const truckPath = curve.getSpacedPoints(n);
  let unloadIndex = 0, best = 1e9;
  truckPath.forEach((p, i) => { const d = Math.hypot(p.x - 3, p.z + 27); if (d < best) { best = d; unloadIndex = i; } });
  truckPath[unloadIndex].set(3, 0, -27);

  const pts = {
    office: new THREE.Vector3(24, 0, -6.2),
    gate: new THREE.Vector3(0, 0, 0),
    pedGate: new THREE.Vector3(8.1, 0, 0.6),
    unload: { x: 3, z: -27, ry: HP, index: unloadIndex },
  };
  return { group, colliders: cols, slots, truckPath, pts, crane, barriers };
}

// =====================================================================================
// AGENCIA DE AUTOS "AUTOS DON CHUY" (niveles 1–3)
// =====================================================================================
TXT.gravel = () => canvasTex('tm-gravel', 256, 256, (c, w, h) => {
  const R = rng(401);
  c.fillStyle = '#8e8676'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 3200; i++) { const v = 90 + R() * 110 | 0; c.fillStyle = `rgb(${v},${v - 6},${v - 16})`; c.beginPath(); c.ellipse(R() * w, R() * h, 0.8 + R() * 2.6, 0.8 + R() * 2, R() * 3, 0, 7); c.fill(); }
  for (let i = 0; i < 20; i++) { const x = R() * w, y = R() * h, r = 15 + R() * 40; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(60,50,38,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
}, true);
TXT.tile = () => canvasTex('tm-tile', 256, 256, (c, w, h) => {
  const R = rng(402);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { const k = 0.95 + R() * 0.05; c.fillStyle = `rgb(${228 * k | 0},${228 * k | 0},${224 * k | 0})`; c.fillRect(x * 128, y * 128, 128, 128); }
  c.strokeStyle = 'rgba(120,120,115,0.6)'; c.lineWidth = 2; for (let k = 0; k <= 256; k += 128) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k, h); c.stroke(); c.beginPath(); c.moveTo(0, k); c.lineTo(w, k); c.stroke(); }
  noiseDots(c, w, h, R, 1500, () => '#888', 0.08);
}, true);
TXT.pavers = () => canvasTex('tm-pavers', 256, 256, (c, w, h) => {
  const R = rng(403); c.fillStyle = '#6f6a62'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < 8; y++) for (let x = -1; x < 5; x++) { const k = 0.85 + R() * 0.2, ox = y % 2 ? 32 : 0; c.fillStyle = `rgb(${172 * k | 0},${166 * k | 0},${156 * k | 0})`; c.fillRect(x * 64 + ox + 2, y * 32 + 2, 60, 28); }
}, true);
TXT.hedge = () => canvasTex('tm-hedge', 128, 128, (c, w, h) => {
  const R = rng(404); c.fillStyle = '#2f5a28'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 700; i++) { c.fillStyle = `hsl(${95 + R() * 30},${40 + R() * 25}%,${18 + R() * 28}%)`; c.beginPath(); c.ellipse(R() * w, R() * h, 2 + R() * 4, 1 + R() * 2.5, R() * 3, 0, 7); c.fill(); }
}, true);
TXT.stucco = () => canvasTex('tm-stucco', 256, 256, (c, w, h) => {
  const R = rng(405); c.fillStyle = '#f0ebe0'; c.fillRect(0, 0, w, h);
  noiseDots(c, w, h, R, 8000, (r) => r < 0.5 ? '#000' : '#fff', 0.05);
}, true);
function donChuyLogo(c, cx, cy, r) {
  c.fillStyle = '#d42a1f'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
  c.strokeStyle = '#f6c21a'; c.lineWidth = r * 0.1; c.beginPath(); c.arc(cx, cy, r * 0.88, 0, 7); c.stroke();
  c.fillStyle = '#ffffff';
  const s = r / 50; c.save(); c.translate(cx, cy + r * 0.12); c.scale(s, s);
  c.beginPath(); c.moveTo(-36, 6); c.lineTo(-30, -4); c.lineTo(-14, -6); c.lineTo(-4, -18); c.lineTo(16, -18); c.lineTo(26, -6); c.lineTo(36, -3); c.lineTo(38, 8); c.lineTo(-36, 8); c.closePath(); c.fill();
  c.fillStyle = '#d42a1f'; for (const x of [-20, 22]) { c.beginPath(); c.arc(x, 9, 7, 0, 7); c.fill(); }
  c.fillStyle = '#fff'; for (const x of [-20, 22]) { c.beginPath(); c.arc(x, 9, 3, 0, 7); c.fill(); }
  c.restore();
}
function brandTex(W, H, sub, o = {}) {
  return canvasTex(`tm-dch|${W}|${H}|${sub}|${o.bg}`, W, H, (c) => {
    c.fillStyle = o.bg ?? '#13233f'; c.fillRect(0, 0, W, H);
    if (o.stripe !== false) { c.fillStyle = '#d42a1f'; c.fillRect(0, H * 0.9, W, H * 0.1); c.fillStyle = '#f6c21a'; c.fillRect(0, H * 0.86, W, H * 0.04); }
    const r = H * 0.36; donChuyLogo(c, H * 0.48, H * 0.44, r);
    c.fillStyle = o.fg ?? '#ffffff'; c.textAlign = 'left'; c.textBaseline = 'middle';
    const x0 = H * 0.95;
    fitFont(c, 'italic 900 #px "Arial Black", Arial, sans-serif', 'AUTOS DON CHUY', W - x0 - H * 0.2, H * (sub ? 0.42 : 0.55));
    c.fillText('AUTOS DON CHUY', x0, sub ? H * 0.36 : H * 0.45);
    if (sub) { c.fillStyle = '#f6c21a'; fitFont(c, 'bold #px Arial, sans-serif', sub, W - x0 - H * 0.2, H * 0.2); c.fillText(sub, x0 + 4, H * 0.68); }
  });
}
function pylonTex(level) {
  return canvasTex('tm-pylon' + level, 256, 1024, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1a2f52'); g.addColorStop(1, '#0d1a30'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    donChuyLogo(c, w / 2, 150, 100);
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    fitFont(c, 'italic 900 #px "Arial Black", Arial', 'AUTOS', w * 0.86, 70); c.fillText('AUTOS', w / 2, 320);
    fitFont(c, 'italic 900 #px "Arial Black", Arial', 'DON', w * 0.86, 96); c.fillText('DON', w / 2, 410);
    fitFont(c, 'italic 900 #px "Arial Black", Arial', 'CHUY', w * 0.86, 110); c.fillText('CHUY', w / 2, 515);
    c.fillStyle = '#f6c21a'; c.fillRect(20, 590, w - 40, 6);
    const lines = level >= 3 ? ['SEMINUEVOS', 'CERTIFICADOS', 'CRÉDITO', 'A MESES'] : ['SEMINUEVOS', 'CRÉDITO', 'TOMAMOS', 'TU AUTO'];
    c.fillStyle = '#ffffff'; lines.forEach((t, i) => { fitFont(c, 'bold #px Arial', t, w * 0.86, 46); c.fillText(t, w / 2, 660 + i * 70); });
    c.fillStyle = '#d42a1f'; c.fillRect(0, h - 90, w, 90); c.fillStyle = '#fff'; fitFont(c, 'bold #px Arial', '55 1234 5678', w * 0.86, 44); c.fillText('55 1234 5678', w / 2, h - 45);
  });
}
const PRICE_TXT = [['¡OFERTA!', 'A TRATO'], ['CRÉDITO', 'SIN BURÓ'], ['¡LLÉVATELO!', 'HOY MISMO'], ['ÚNICO', 'DUEÑO'], ['REMATE', 'DE CONTADO']];
function priceTex(i) {
  const [a, b] = PRICE_TXT[i % PRICE_TXT.length];
  return canvasTex('tm-price' + i % PRICE_TXT.length, 128, 160, (c, w, h) => {
    c.fillStyle = '#fffdf2'; c.fillRect(0, 0, w, h);
    c.fillStyle = i % 2 ? '#d42a1f' : '#f6c21a'; c.fillRect(0, 0, w, 44);
    c.fillStyle = i % 2 ? '#fff' : '#111'; c.textAlign = 'center'; c.textBaseline = 'middle'; fitFont(c, '900 #px Arial Black, Arial', a, w * 0.9, 30); c.fillText(a, w / 2, 23);
    c.fillStyle = '#111'; fitFont(c, 'bold #px Arial', b, w * 0.9, 22); c.fillText(b, w / 2, 70);
    c.fillStyle = '#1a6a2a'; fitFont(c, '900 #px Arial Black, Arial', '$ ______', w * 0.9, 24); c.fillText('$ ______', w / 2, 112);
    c.strokeStyle = '#111'; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4);
  });
}
// banderines en cuerda entre dos puntos con catenaria
function bunting(mb, a, b, sag, pals) {
  const n = Math.max(4, Math.round(Math.hypot(b[0] - a[0], b[2] - a[2]) / 0.38));
  const P = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - sag * 4 * t * (1 - t), a[2] + (b[2] - a[2]) * t];
  const pts = []; for (let i = 0; i <= 16; i++) pts.push(P(i / 16));
  mb.curve(pts, 0.006, mat(0x333333, { roughness: 0.6 }), 32, 4);
  const dx = b[0] - a[0], dz = b[2] - a[2], ry = -Math.atan2(dz, dx);
  for (let i = 1; i < n; i++) {
    const p = P(i / n), q = P((i + 0.5) / n);
    const sh = new THREE.Shape([new THREE.Vector2(-0.12, 0), new THREE.Vector2(0.12, 0), new THREE.Vector2(0, -0.28)]);
    const g = new THREE.ShapeGeometry(sh);
    mb.put(g, pals[i % pals.length], p[0], p[1] - 0.005, p[2], 0, ry, Math.atan2(q[1] - p[1], Math.hypot(q[0] - p[0], q[2] - p[2])) * 0.8);
  }
}
function flag(mb, x, z, h, tex, ry = 0) {
  mb.cyl(0.05, 0.07, h, MT.alu(), x, h / 2, z, 0, 0, 0, 12);
  mb.sph(0.08, MT.chrome(), x, h + 0.05, z);
  const g = new THREE.PlaneGeometry(1.8, 1.1, 12, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const u = (p.getX(i) + 0.9) / 1.8; p.setZ(i, Math.sin(u * 5.5) * 0.12 * u); }
  g.computeVertexNormals();
  mb.put(g, mat(0xffffff, { map: tex, roughness: 0.8, side: THREE.DoubleSide }), x + 0.95, h - 0.65, z, 0, ry, 0);
}
function lightPole(mb, cols, parent, x, z, ry) {
  mb.cyl(0.07, 0.11, 7, MT.galv(), x, 3.5, z, 0, 0, 0, 12);
  mb.cyl(0.25, 0.3, 0.5, TT.wallConc(), x, 0.25, z, 0, 0, 0, 16);
  const f = mb.at(x, 7, z, 0, ry, 0);
  for (const s of [-1, 1]) { f.box(1.0, 0.06, 0.06, MT.galv(), s * 0.5, 0, 0); f.box(0.6, 0.1, 0.3, MT.black(), s * 1.0, -0.02, 0); f.put(new THREE.PlaneGeometry(0.55, 0.25), TT.lamp(), s * 1.0, -0.075, 0, HP, 0, 0); }
  colBox(parent, cols, x, 1, z, 0.6, 2, 0.6);
}
function priceStand(mb, x, z, ry, i) {
  const f = mb.at(x, 0, z, 0, ry, 0);
  f.box(0.36, 0.03, 0.3, MT.black(), 0, 0.015, 0);
  f.cyl(0.018, 0.018, 1.0, MT.black(), 0, 0.5, 0, 0, 0, 0, 8);
  f.box(0.5, 0.64, 0.02, MT.black(), 0, 1.2, -0.012);
  f.put(new THREE.PlaneGeometry(0.46, 0.58), mat(0xffffff, { map: priceTex(i), roughness: 0.6 }), 0, 1.2, 0.0);
}
function glassWall(mb, along, fixed, a0, a1, y0, y1, mullion = 1.6) {
  const w = a1 - a0, c = (a0 + a1) / 2, yc = (y0 + y1) / 2, h = y1 - y0, fr = MT.alu();
  const gl = glass(0xcfe6ee, 0.22);
  if (along === 'x') {
    mb.box(w, h, 0.02, gl, c, yc, fixed);
    mb.box(w, 0.1, 0.14, fr, c, y0 + 0.05, fixed); mb.box(w, 0.12, 0.14, fr, c, y1 - 0.06, fixed); mb.box(w, 0.06, 0.1, fr, c, y0 + 2.6, fixed);
    const n = Math.round(w / mullion); for (let k = 0; k <= n; k++) mb.box(0.07, h, 0.14, fr, a0 + k * w / n, yc, fixed);
  } else {
    mb.box(0.02, h, w, gl, fixed, yc, c);
    mb.box(0.14, 0.1, w, fr, fixed, y0 + 0.05, c); mb.box(0.14, 0.12, w, fr, fixed, y1 - 0.06, c); mb.box(0.1, 0.06, w, fr, fixed, y0 + 2.6, c);
    const n = Math.round(w / mullion); for (let k = 0; k <= n; k++) mb.box(0.14, h, 0.07, fr, fixed, yc, a0 + k * w / n);
  }
}

// Agencia de autos. Origen: centro del borde frontal; +z hacia la calle; x ∈ [-11, 11], z ∈ [-24, 0].
// slots: { x, z, ry, y, indoor } (frente del auto = +x local tras rotar ry). 8 / 11 / 14 lugares.
export function buildDealership(level = 1) {
  level = Math.max(1, Math.min(3, level | 0));
  const group = new THREE.Group(); group.name = 'dealership';
  const cols = [], mb = new MB(), slots = [];
  const white = TT.white(), yellow = TT.yellow();
  const R = rng(77 + level);
  const pals = [0xd42a1f, 0xf6c21a, 0x1f5fa8, 0x2e8a3c, 0xf4f4f0].map(c => mat(c, { roughness: 0.7, side: THREE.DoubleSide }));
  const rowX = [-8.6, -5.7, -2.8, 0.1, 3.0, 5.9];
  // ---------- piso ----------
  if (level === 1) {
    mb.put(uvPlaneV(22, 24, 0.3), mat(0xffffff, { map: TXT.gravel(), roughness: 1 }), 0, 0.004, -12, -HP);
    mb.flat(7.2, -6, 9.8, 0, TT.asphalt(), 0.008, 0.25);
  } else {
    mb.put(uvPlaneV(22, 24, 0.2), level === 3 ? mat(0xffffff, { map: TXT.pavers(), roughness: 0.85 }) : TT.concrete(), 0, 0.004, -12, -HP);
    mb.flat(7.2, -16, 9.8, 0, TT.asphalt(), 0.008, 0.25);
  }
  // guarnición frontal
  mb.box(22, 0.15, 0.25, TT.wallConc(), 0, 0.075, -0.125, 0, 0, 0, 0.5);
  // ---------- lugares ----------
  const row1 = level === 1 ? rowX.slice(0, 5) : rowX;
  const row2 = level === 1 ? rowX.slice(0, 3) : level === 2 ? rowX.slice(0, 5) : rowX;
  const z1 = -3.4, z2 = level === 3 ? -10.9 : -12.6;
  row1.forEach(x => slots.push({ x, z: z1, ry: -HP, y: 0, indoor: false }));
  row2.forEach(x => slots.push({ x, z: z2, ry: -HP, y: 0, indoor: false }));
  const paintM = level === 1 ? null : (level === 3 ? white : yellow);
  slots.forEach((s, i) => {
    if (paintM) { for (const dx of [-1.45, 1.45]) stripe(mb, paintM, s.x + dx, s.z + 2.4, s.x + dx, s.z - 2.6, 0.1); stripe(mb, paintM, s.x - 1.45, s.z - 2.6, s.x + 1.45, s.z - 2.6, 0.1); }
    else { mb.box(1.5, 0.1, 0.18, TT.wallConc(), s.x, 0.05, s.z - 2.45); }
    priceStand(mb, s.x + 1.05, s.z + 2.75, (R() - 0.5) * 0.4, i);
  });
  let office;
  // ---------- edificios por nivel ----------
  if (level === 1) {
    // oficina portátil sobre bloques
    const X0 = 5.2, X1 = 10.4, Z0 = -23.4, Z1 = -21.0, H = 2.6, y0 = 0.3;
    mb.box(X1 - X0, H, Z1 - Z0, TT.panel(), (X0 + X1) / 2, y0 + H / 2, (Z0 + Z1) / 2, 0, 0, 0, 0.6);
    mb.box(X1 - X0 + 0.2, 0.12, Z1 - Z0 + 0.3, TT.navy(), (X0 + X1) / 2, y0 + H + 0.06, (Z0 + Z1) / 2);
    for (const x of [X0 + 0.3, X1 - 0.3]) for (const z of [Z0 + 0.3, Z1 - 0.3]) mb.box(0.4, 0.3, 0.2, TT.wallConc(), x, 0.15, z);
    mb.put(new THREE.PlaneGeometry(1.4, 1.0), TT.win(), 6.4, 1.8, Z1 + 0.01); mb.box(1.5, 0.05, 0.12, MT.alu(), 6.4, 1.27, Z1 + 0.05);
    mb.put(new THREE.PlaneGeometry(0.9, 2.05), mat(0xffffff, { map: TXT.door(), roughness: 0.4 }), 8.6, y0 + 1.03, Z1 + 0.01);
    for (let k = 0; k < 2; k++) mb.box(1.1, 0.15, 0.32, TT.wallConc(), 8.6, 0.075 + k * 0.15, Z1 + 0.5 - k * 0.3);
    mb.box(0.65, 0.42, 0.45, mat(0xd8d8d4, { roughness: 0.5 }), X0 - 0.25, 2.0, -22.2);
    // letrero sobre la oficina
    for (const x of [6.0, 9.6]) mb.box(0.08, 1.2, 0.08, MT.galv(), x, 3.4, Z1 - 0.4);
    mb.put(new THREE.PlaneGeometry(4.6, 1.0), signMat(brandTex(1024, 220, 'SEMINUEVOS · CRÉDITO')), 7.8, 3.6, Z1 - 0.35);
    colBox(group, cols, (X0 + X1) / 2, 1.5, (Z0 + Z1) / 2, X1 - X0, 3, Z1 - Z0 + 0.4);
    office = new THREE.Vector3(8.6, 0, -19.9);
    // malla lateral y trasera
    const chain = TT.chain(), galv = MT.galv();
    for (const [x0, z0, x1, z1] of [[-11, -24, 11, -24], [-11, -24, -11, -0.3], [11, -24, 11, -2.4]]) {
      const len = Math.hypot(x1 - x0, z1 - z0), ry = -Math.atan2(z1 - z0, x1 - x0), f = mb.at((x0 + x1) / 2, 0, (z0 + z1) / 2, 0, ry, 0);
      f.put(new THREE.PlaneGeometry(len, 1.9), chain, 0, 1.0, 0);
      const a = mb.bk.get(chain), gg = a[a.length - 1], uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * len / 0.2, uv.getY(i) * 1.9 / 0.2);
      for (let k = 0; k <= Math.round(len / 3); k++) f.cyl(0.04, 0.04, 2.0, galv, -len / 2 + k * len / Math.round(len / 3), 1.0, 0, 0, 0, 0, 8);
      f.cyl(0.02, 0.02, len, galv, 0, 1.95, 0, 0, 0, HP, 6);
      colBox(group, cols, (x0 + x1) / 2, 1, (z0 + z1) / 2, len, 2, 0.2, ry);
    }
    // postes con cadena al frente
    for (let x = -10.8; x < 7.0; x += 2.0) { mb.box(0.12, 0.7, 0.12, mat(0xf4f4f0, { roughness: 0.6 }), x, 0.35, -0.5); if (x + 2 < 7.0) mb.curve([[x, 0.6, -0.5], [x + 1, 0.42, -0.5], [x + 2, 0.6, -0.5]], 0.012, MT.galv(), 10, 4); }
    // letrero de dos postes en la esquina
    for (const x of [9.9, 10.9]) { mb.cyl(0.06, 0.06, 4.6, MT.steel(), x, 2.3, -1.0, 0, 0, 0, 10); colBox(group, cols, x, 1, -1.0, 0.2, 2, 0.2); }
    mb.box(1.8, 3.0, 0.08, TT.navy(), 10.4, 3.2, -1.0);
    mb.put(new THREE.PlaneGeometry(1.7, 2.9), signMat(pylonTex(1)), 10.4, 3.2, -0.955);
    mb.put(new THREE.PlaneGeometry(1.7, 2.9), signMat(pylonTex(1)), 10.4, 3.2, -1.045, 0, PI, 0);
    // banderines en zigzag sobre el lote
    for (const [x, z] of [[-10.6, -0.6], [-10.6, -16], [6.8, -0.6], [6.8, -16], [-1.9, -8.2]]) { mb.cyl(0.05, 0.05, 4.6, MT.galv(), x, 2.3, z, 0, 0, 0, 8); colBox(group, cols, x, 1, z, 0.15, 2, 0.15); }
    bunting(mb, [-10.6, 4.4, -0.6], [6.8, 4.4, -0.6], 0.5, pals);
    bunting(mb, [-10.6, 4.4, -0.6], [-1.9, 4.4, -8.2], 0.5, pals);
    bunting(mb, [6.8, 4.4, -0.6], [-1.9, 4.4, -8.2], 0.5, pals);
    bunting(mb, [-10.6, 4.4, -16], [-1.9, 4.4, -8.2], 0.5, pals);
    bunting(mb, [6.8, 4.4, -16], [-1.9, 4.4, -8.2], 0.5, pals);
    bunting(mb, [6.8, 4.4, -16], [8.6, 3.0, -21.1], 0.3, pals);
  } else {
    // muretes laterales con jardinera
    for (const s of [-1, 1]) {
      mb.box(0.3, 0.6, 22.5, TT.wallConc(), s * 10.85, 0.3, -12.85, 0, 0, 0, 0.5);
      colBox(group, cols, s * 10.85, 0.5, -12.85, 0.3, 1, 22.5);
    }
    mb.box(15.6, 0.45, 0.8, TT.wallConc(), -3.2, 0.225, -0.65, 0, 0, 0, 0.5);
    mb.put(uvBox(15.4, 0.4, 0.6, 1.5), mat(0xffffff, { map: TXT.hedge(), roughness: 0.95 }), -3.2, 0.62, -0.65);
    colBox(group, cols, -3.2, 0.5, -0.65, 15.6, 1, 0.8);
    for (const [x, z] of [[-10.3, -5.4], [-10.3, -16.8], [6.9, -5.4]]) lightPole(mb, cols, group, x, z, level === 3 ? 0.3 : 0);
    for (const x of [-9, -6.5, -4]) flag(mb, x, -1.6 + (level === 3 ? 0 : 50), 7.5, brandTex(256, 160, null, { stripe: true }));
    // pilón
    if (level === 2) {
      mb.box(1.2, 6.0, 0.5, TT.navy(), 10.1, 3.0, -1.3, 0, 0, 0, 0.5);
      for (const s of [-1, 1]) mb.put(new THREE.PlaneGeometry(1.0, 4.0), signMat(pylonTex(2)), 10.1, 3.6, -1.3 + s * 0.255, 0, s > 0 ? 0 : PI, 0);
      colBox(group, cols, 10.1, 3, -1.3, 1.2, 6, 0.5);
    }
    // banderines entre postes de luz
    bunting(mb, [-10.3, 6.6, -5.4], [6.9, 6.6, -5.4], 0.7, pals);
    bunting(mb, [-10.3, 6.6, -5.4], [-10.3, 6.6, -16.8], 0.6, pals);
    bunting(mb, [-10.3, 6.4, -16.8], [6.9, 6.0, -5.4], 0.9, pals);
  }
  if (level === 2) {
    // oficina de mampostería con frente de cristal
    const X0 = 4.4, X1 = 10.6, Z0 = -23.6, Z1 = -17.4, H = 3.4;
    const st = mat(0xffffff, { map: TXT.stucco(), roughness: 0.9 });
    mb.box(X1 - X0, H, Z1 - Z0, st, (X0 + X1) / 2, H / 2, (Z0 + Z1) / 2, 0, 0, 0, 0.5);
    mb.box(X1 - X0 + 0.4, 0.6, Z1 - Z0 + 0.4, TT.navy(), (X0 + X1) / 2, H + 0.3, (Z0 + Z1) / 2);
    glassWall(mb, 'x', Z1 + 0.03, X0 + 0.3, X1 - 0.3, 0.05, H - 0.1, 1.5);
    mb.put(new THREE.PlaneGeometry(5.6, 0.55), signMat(brandTex(1024, 100, null, { stripe: false })), (X0 + X1) / 2, H + 0.3, Z1 + 0.205);
    mb.box(X1 - X0 + 1.2, 0.12, 1.4, TT.navy(), (X0 + X1) / 2, 2.9, Z1 + 0.7);
    colBox(group, cols, (X0 + X1) / 2, 1.8, (Z0 + Z1) / 2, X1 - X0, 3.6, Z1 - Z0);
    office = new THREE.Vector3(7.5, 0, -16.4);
    // cubierta en voladizo sobre la segunda fila
    const cz0 = -16.0, cz1 = -10.0, ys = TT.navy();
    for (let x = -10.2; x <= 4.4; x += 2.92) { mb.box(0.2, 3.6, 0.2, ys, x, 1.8, cz0); mb.beam([x, 3.6, cz0], [x, 3.2, cz1], 0.12, 0.3, ys); colBox(group, cols, x, 1.5, cz0, 0.25, 3, 0.25); }
    const rp = trapProf(-10.5, 4.7, 0.25, 0.03, 0.06, 0.12);
    mb.at(0, 3.45, (cz0 + cz1) / 2, -HP + Math.atan2(0.4, 6), 0, 0).putM(corrGeo(rp, -10.5, 4.7, -3.1, 3.1, { uv: (a, b) => [a * 0.5, b * 0.5] }), mat(0xd6d9dc, { map: TXT.grime(), roughness: 0.4, metalness: 0.6, env: true, envI: 0.7, side: THREE.DoubleSide }));
    mb.box(15.2, 0.4, 0.08, mat(0xd42a1f, { roughness: 0.5 }), -2.9, 3.05, cz1 - 0.05);
  }
  if (level === 3) {
    // sala de exhibición de cristal con oficina
    const X0 = -10.5, X1 = 4.0, Z0 = -23.6, Z1 = -14.3, H = 5.2;
    mb.flat(X0, Z0, X1, Z1, mat(0xffffff, { map: TXT.tile(), roughness: 0.12, env: true, envI: 0.7 }), 0.06, 0.4);
    mb.box(X1 - X0, 0.06, Z1 - Z0, TT.wallConc(), (X0 + X1) / 2, 0.03, (Z0 + Z1) / 2);
    glassWall(mb, 'x', Z1, X0, X1, 0.06, H - 0.1, 1.8);
    glassWall(mb, 'z', X0, Z0, Z1, 0.06, H - 0.1, 1.8);
    colBox(group, cols, (X0 + X1) / 2 - 0.9, 2.5, Z1, X1 - X0 - 2.0, 5, 0.2);
    colBox(group, cols, X0, 2.5, (Z0 + Z1) / 2, 0.2, 5, Z1 - Z0);
    // puertas de cristal (abiertas hacia el lote, vano para pasar)
    mb.box(2.2, 0.12, 0.2, MT.alu(), X1 - 1.4, 2.6, Z1 + 0.02);
    const st = mat(0xffffff, { map: TXT.stucco(), roughness: 0.9 });
    // muro trasero con muro de marca
    mb.box(X1 - X0, H, 0.3, st, (X0 + X1) / 2, H / 2, Z0 + 0.15, 0, 0, 0, 0.5);
    mb.put(new THREE.PlaneGeometry(8, 1.4), signMat(brandTex(1024, 180, 'SEMINUEVOS CERTIFICADOS', { bg: '#13233f' }), 0.4), (X0 + X1) / 2, 3.3, Z0 + 0.31);
    colBox(group, cols, (X0 + X1) / 2, 2.5, Z0 + 0.15, X1 - X0, 5, 0.3);
    // techo y faldón con letras luminosas
    mb.box(X1 - X0 + 0.6, 0.35, Z1 - Z0 + 0.6, mat(0xe8e8e4, { roughness: 0.8 }), (X0 + X1) / 2, H + 0.12, (Z0 + Z1) / 2);
    mb.box(X1 - X0 + 0.7, 1.0, 0.3, mat(0x13233f, { roughness: 0.4, metalness: 0.4, env: true, envI: 0.5 }), (X0 + X1) / 2, H + 0.4, Z1 + 0.3);
    mb.box(0.3, 1.0, Z1 - Z0 + 0.7, mat(0x13233f, { roughness: 0.4, metalness: 0.4, env: true, envI: 0.5 }), X0 - 0.3, H + 0.4, (Z0 + Z1) / 2);
    mb.put(new THREE.PlaneGeometry(10.5, 0.85), signMat(brandTex(1536, 124, null, { stripe: false, bg: '#13233f' }), 0.9), (X0 + X1) / 2, H + 0.4, Z1 + 0.456);
    for (let x = X0 + 1.5; x < X1 - 1; x += 3) for (let z = Z0 + 2; z < Z1 - 1; z += 3) mb.put(new THREE.PlaneGeometry(1.2, 0.6), TT.lamp(), x, H - 0.06, z, HP, 0, 0);
    mb.put(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), mat(0xf4f2ec, { roughness: 0.9 }), (X0 + X1) / 2, H - 0.05, (Z0 + Z1) / 2, HP, 0, 0);
    // tarimas de exhibición y mostrador
    for (const x of [-7.2, -1.6]) { mb.cyl(2.9, 2.9, 0.1, mat(0x2a2c30, { roughness: 0.25, metalness: 0.5, env: true, envI: 0.8 }), x, 0.11, -19.2, 0, 0, 0, 48); mb.put(new THREE.TorusGeometry(2.9, 0.02, 6, 64), TT.lamp(), x, 0.16, -19.2, HP, 0, 0); }
    mb.box(2.4, 1.05, 0.7, mat(0x13233f, { roughness: 0.4 }), 2.2, 0.58, -22.4); mb.box(2.5, 0.05, 0.8, mat(0xf4f4f0, { roughness: 0.2, env: true, envI: 0.6 }), 2.2, 1.12, -22.4);
    colBox(group, cols, 2.2, 0.55, -22.4, 2.4, 1.1, 0.7);
    for (const x of [-9.6, 3.2]) { mb.box(0.5, 0.5, 0.5, mat(0xf4f4f0, { roughness: 0.5 }), x, 0.31, -15.0); mb.put(uvBox(0.45, 0.4, 0.45, 2), mat(0xffffff, { map: TXT.hedge(), roughness: 0.95 }), x, 0.76, -15.0); }
    slots.push({ x: -7.2, z: -19.2, ry: -HP + 0.6, y: 0.16, indoor: true });
    slots.push({ x: -1.6, z: -19.2, ry: -HP - 0.6, y: 0.16, indoor: true });
    // oficina anexa
    const OX0 = 4.0, OX1 = 10.6, OZ1 = -16.2;
    mb.box(OX1 - OX0, 3.6, OZ1 - Z0, st, (OX0 + OX1) / 2, 1.8, (Z0 + OZ1) / 2, 0, 0, 0, 0.5);
    mb.box(OX1 - OX0 + 0.3, 0.45, OZ1 - Z0 + 0.3, mat(0x13233f, { roughness: 0.4, metalness: 0.4 }), (OX0 + OX1) / 2, 3.8, (Z0 + OZ1) / 2);
    glassWall(mb, 'x', OZ1 + 0.02, OX0 + 0.4, OX1 - 0.4, 0.05, 3.4, 1.3);
    mb.put(new THREE.PlaneGeometry(4.5, 0.32), signMat(signTex('OFICINA · FINANCIAMIENTO', 1024, 72, { bg: '#13233f', fg: '#ffffff' })), (OX0 + OX1) / 2, 3.8, OZ1 + 0.165);
    colBox(group, cols, (OX0 + OX1) / 2, 1.8, (Z0 + OZ1) / 2, OX1 - OX0, 3.6, OZ1 - Z0);
    office = new THREE.Vector3(7.3, 0, -15.2);
    // pilón luminoso alto
    mb.box(1.5, 8.6, 0.6, mat(0x13233f, { roughness: 0.35, metalness: 0.5, env: true, envI: 0.6 }), 10.1, 4.3, -1.3);
    mb.box(1.8, 0.5, 0.9, TT.wallConc(), 10.1, 0.25, -1.3);
    for (const s of [-1, 1]) mb.put(new THREE.PlaneGeometry(1.3, 5.2), signMat(pylonTex(3), 0.85), 10.1, 4.9, -1.3 + s * 0.305, 0, s > 0 ? 0 : PI, 0);
    mb.box(1.6, 0.12, 0.7, MT.alu(), 10.1, 8.66, -1.3);
    colBox(group, cols, 10.1, 3, -1.3, 1.6, 6, 0.8);
  }
  mb.build(group);
  slots.forEach(s => { s.x = +s.x.toFixed(3); s.z = +s.z.toFixed(3); s.ry = +s.ry.toFixed(4); });
  return { group, colliders: cols, slots, pts: { office, entrance: new THREE.Vector3(8.5, 0, 0) } };
}
