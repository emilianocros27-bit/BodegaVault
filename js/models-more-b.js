// Objetos nuevos (grupo B): datos del catálogo + modelos 3D.
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, rng, add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, SW } from './modelkit.js';
import { humanoid } from './models-collect.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// =====================================================================
//  utilidades propias (prefijo mb-)
// =====================================================================
const T = (key, w, h, draw, repeat = false) => canvasTex('mb-' + key, w, h, draw, repeat);
const DS = THREE.DoubleSide;
const PI = Math.PI, TAU = Math.PI * 2;
const g2 = (a, b, s = 1) => Math.exp(-(a * a + b * b) / (s * s));
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const envMap = () => mat(0xfefefe, { env: true }).envMap;

const PH = new Map();
function phys(key, o) {
  if (!PH.has(key)) PH.set(key, new THREE.MeshPhysicalMaterial({ envMap: envMap(), ...o }));
  const m = PH.get(key);
  if (!m.envMap) { m.envMap = envMap(); m.needsUpdate = true; }
  return m;
}
const gem = (color, key = '') => phys('gem' + color + key, { color, transmission: 0.92, roughness: 0, ior: 2.1, thickness: 0.01, flatShading: true, envMapIntensity: 2.2, specularIntensity: 1 });
const crystal = (color = 0xf4fbff) => phys('cry' + color, { color, transmission: 1, roughness: 0.02, ior: 1.5, thickness: 0.08, envMapIntensity: 1.6, clearcoat: 1 });
const pearlM = () => phys('pearl', { color: 0xf6efe4, roughness: 0.18, sheen: 1, sheenColor: new THREE.Color(0xffd8e8), iridescence: 0.6, envMapIntensity: 1.2, clearcoat: 1 });
const velvet = (c) => mat(c, { roughness: 1, map: T('velvet', 64, 64, (x, w, h) => { const R = rng(4); x.fillStyle = '#bbb'; x.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(255,255,255,${R() * 0.12})`; x.fillRect(R() * w, R() * h, 1, 1); } }, true) });

// esfera deformada; el frente queda en +z con u=0.5 (costura atrás)
function sphereDeform(fn, ws = 48, hs = 36, o = {}) {
  const geo = new THREE.SphereGeometry(1, ws, hs, o.phiStart ?? 0, o.phiLen ?? TAU, 0, o.thetaLen ?? PI);
  geo.rotateY(-PI / 2);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  return geo;
}
// cabeza humana / calavera en coordenadas unitarias
function faceFn(o = {}) {
  const skull = !!o.skull;
  return (v) => {
    const ox = v.x, oy = v.y, oz = v.z, ax = Math.abs(ox);
    const w = smooth(0.15, 0.85, oz);
    let d = 0;
    if (skull) {
      d -= 0.3 * g2((ax - 0.33) / 0.17, (oy - 0.08) / 0.15);
      d -= 0.2 * g2(ox / 0.09, (oy + 0.22) / 0.1);
      d += 0.07 * g2((ax - 0.3) / 0.22, (oy - 0.3) / 0.07);
      d += 0.06 * g2(ox / 0.3, (oy + 0.5) / 0.1);
      d -= 0.05 * g2(ox / 0.3, (oy + 0.62) / 0.05);
    } else {
      d += (o.nose ?? 1) * (0.2 * g2(ox / 0.1, (oy + 0.2) / 0.1) + 0.1 * g2(ox / 0.08, (oy + 0.02) / 0.16));
      d -= 0.08 * g2((ax - 0.33) / 0.13, (oy - 0.1) / 0.1);
      d += 0.05 * g2((ax - 0.3) / 0.2, (oy - 0.25) / 0.07);
      d += 0.05 * g2(ox / 0.17, (oy + 0.42) / 0.06);
      d += 0.06 * g2(ox / 0.2, (oy + 0.7) / 0.12);
      d += 0.04 * g2((ax - 0.45) / 0.15, (oy + 0.12) / 0.15);
    }
    let x = ox, y = oy, z = oz + d * w;
    const jaw = o.jaw ?? (skull ? 0.42 : 0.3);
    if (oy < 0) { x *= 1 - jaw * oy * oy; z *= 1 - 0.08 * oy * oy; }
    if (skull && oz < 0) { z *= 1.12; y *= 1.04; }
    if (!skull && oz < 0) z *= 1.06;
    if (skull && oy < -0.3) { z -= 0.1 * (1 - w) * (-oy - 0.3); }
    v.set(x * (o.sx ?? 0.8), y * (o.sy ?? 1.05), z * (o.sz ?? 0.95));
  };
}
function headMesh(g, r, m, x, y, z, o = {}) {
  const geo = sphereDeform(faceFn(o), o.ws ?? 48, o.hs ?? 36);
  const mesh = add(g, geo, m, x, y, z, o.rx ?? 0, o.ry ?? 0, o.rz ?? 0);
  mesh.scale.setScalar(r);
  return mesh;
}
// cinta a lo largo de una curva, con ancho en la dirección 'side'
function strip(g, pts, w, m, side = [1, 0, 0], segs = 40) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const s = new THREE.Vector3(...side).multiplyScalar(w / 2);
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPointAt(i / segs);
    pos.push(c.x - s.x, c.y - s.y, c.z - s.z, c.x + s.x, c.y + s.y, c.z + s.z);
    uv.push(0, i / segs, 1, i / segs);
    if (i < segs) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return add(g, geo, m);
}
// banda cerrada retorcida (sección elíptica que gira)
function twistBand(g, pts, a, b, twists, m, segs = 220, radial = 20) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), true);
  const fr = curve.computeFrenetFrames(segs, true);
  const pos = [], uv = [], idx = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs, c = curve.getPointAt(t), N = fr.normals[i], Bn = fr.binormals[i], tw = twists * TAU * t;
    for (let j = 0; j <= radial; j++) {
      const ph = j / radial * TAU, ex = a * Math.cos(ph), ey = b * Math.sin(ph);
      const u1 = ex * Math.cos(tw) - ey * Math.sin(tw), u2 = ex * Math.sin(tw) + ey * Math.cos(tw);
      pos.push(c.x + N.x * u1 + Bn.x * u2, c.y + N.y * u1 + Bn.y * u2, c.z + N.z * u1 + Bn.z * u2);
      uv.push(t * 6, j / radial);
      if (i < segs && j < radial) { const k = i * (radial + 1) + j; idx.push(k, k + radial + 1, k + 1, k + 1, k + radial + 1, k + radial + 2); }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return add(g, geo, m);
}
// forma 2D con UV normalizadas 0..1
function shapeMesh(g, shape, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const geo = new THREE.ShapeGeometry(shape, 32);
  geo.computeBoundingBox();
  const bb = geo.boundingBox, uv = geo.attributes.uv, p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
  return add(g, geo, m, x, y, z, rx, ry, rz);
}
// extrusión con UV normalizadas a la caja de la silueta
function exNorm(g, shape, d, m, bevel = 0.003, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, bs = 2) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: bs, curveSegments: 24 });
  geo.translate(0, 0, -d / 2);
  geo.computeBoundingBox();
  const bb = geo.boundingBox, uv = geo.attributes.uv, p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - bb.min.x) / (bb.max.x - bb.min.x), (p.getY(i) - bb.min.y) / (bb.max.y - bb.min.y));
  return add(g, geo, m, x, y, z, rx, ry, rz);
}
const shp = (pts) => new THREE.Shape(pts.map(([a, b]) => new THREE.Vector2(a, b)));
const circ = (r, cx = 0, cy = 0, n = 40, hole = false) => { const s = hole ? new THREE.Path() : new THREE.Shape(); s.absarc(cx, cy, r, 0, TAU, hole); return s; };
function flowerShape(r, petals = 6, inner = 0.45) {
  const s = new THREE.Shape();
  for (let i = 0; i <= petals * 8; i++) { const a = i / (petals * 8) * TAU, k = inner + (1 - inner) * Math.abs(Math.sin(a * petals / 2)); const x = Math.cos(a) * r * k, y = Math.sin(a) * r * k; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  return s;
}
function leafShape(l, w) {
  const s = new THREE.Shape(); s.moveTo(0, 0); s.quadraticCurveTo(w, l * 0.45, 0, l); s.quadraticCurveTo(-w, l * 0.45, 0, 0); return s;
}
function starShape(n, r1, r2, rot = PI / 2) {
  const pts = []; for (let i = 0; i < n * 2; i++) { const a = rot + i / (n * 2) * TAU, r = i % 2 ? r2 : r1; pts.push([Math.cos(a) * r, Math.sin(a) * r]); } return shp(pts);
}
function inst(g, geo, m, list) {
  const im = new THREE.InstancedMesh(geo, m, list.length);
  const o = new THREE.Object3D();
  list.forEach((t, i) => { o.position.set(t[0], t[1], t[2]); o.rotation.set(t[3] ?? 0, t[4] ?? 0, t[5] ?? 0); o.scale.setScalar(t[6] ?? 1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.castShadow = true; im.receiveShadow = true; g.add(im); return im;
}
function noiseTex(key, base, dots, n = 900, size = 3, rep = true) {
  return T(key, 256, 256, (c, w, h) => { const R = rng(key.length * 7 + n); c.fillStyle = base; c.fillRect(0, 0, w, h); for (let i = 0; i < n; i++) { c.fillStyle = dots[(R() * dots.length) | 0]; c.globalAlpha = 0.15 + R() * 0.4; c.beginPath(); c.arc(R() * w, R() * h, R() * size + 0.5, 0, 7); c.fill(); } c.globalAlpha = 1; }, rep);
}
const plaque = (g, text, w, x, y, z, rx = 0) => P(g, w, w * 0.25, labelTex(text, { bg: '#b8913e', fg: '#2a1a08', w: 512, h: 128, font: 'bold 50px Georgia', border: '#6a4a14' }), x, y, z, rx);

// =====================================================================
//  ARTE
// =====================================================================
const ALE_PAL = [
  ['#e8385a', '#2a9ad8', '#f2c21a', '#3ab84a', '#8a3ad8', '#ffffff', '#111111'],
  ['#1a6ad8', '#f27a1a', '#e8e81a', '#e8385a', '#2ab8a8', '#ffffff', '#111111'],
  ['#8a2ad8', '#f2d21a', '#2ad86a', '#f2386a', '#1a8ad8', '#ffffff', '#111111'],
];
function alebrijeTex(k, wing = false) {
  return T('ale' + k + wing, 512, 256, (c, w, h) => {
    const p = ALE_PAL[k], R = rng(11 + k);
    c.fillStyle = p[0]; c.fillRect(0, 0, w, h);
    const bands = wing ? 6 : 14;
    for (let i = 0; i < bands; i++) {
      const x = i * w / bands, bw = w / bands;
      c.fillStyle = p[1 + (i % 4)]; c.fillRect(x + bw * 0.15, 0, bw * 0.3, h);
      c.fillStyle = p[5];
      for (let y = 8; y < h; y += 18) { c.beginPath(); c.arc(x + bw * 0.3, y, 3.5, 0, 7); c.fill(); }
      c.strokeStyle = p[6]; c.lineWidth = 3; c.beginPath();
      for (let y = 0; y <= h; y += 12) c.lineTo(x + bw * 0.7 + ((y / 12) % 2 ? 6 : -6), y);
      c.stroke();
      c.fillStyle = p[1 + ((i + 2) % 4)];
      for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(x + bw * 0.85, y); c.lineTo(x + bw, y + 16); c.lineTo(x + bw * 0.85, y + 32); c.fill(); }
    }
    for (let i = 0; i < 60; i++) { c.fillStyle = p[(R() * 6) | 0]; c.beginPath(); c.arc(R() * w, R() * h, 2 + R() * 3, 0, 7); c.fill(); }
  }, true);
}
function alebrije(seed) {
  const g = new THREE.Group(), k = seed % 3, R = rng(seed + 3);
  const tex = alebrijeTex(k);
  const m = mat(0xffffff, { map: tex, roughness: 0.45 });
  const wt = alebrijeTex(k, true); wt.repeat.set(12, 8);
  const wm = mat(0xffffff, { map: wt, roughness: 0.5, side: DS });
  const pal = ALE_PAL[k].map(s => parseInt(s.slice(1), 16));
  // cuerpo, cuello y cabeza
  SW(g, [[-0.13, 0.15, 0], [-0.05, 0.165, 0], [0.04, 0.17, 0], [0.1, 0.2, 0]], [0.042, 0.056, 0.052, 0.04], m, 18, 28, 0.9);
  SW(g, [[0.09, 0.2, 0], [0.14, 0.26, 0.01], [0.165, 0.3, 0.02]], [0.036, 0.03, 0.03], m, 14, 16);
  SW(g, [[0.15, 0.31, 0.02], [0.2, 0.325, 0.03], [0.26, 0.305, 0.04]], [0.038, 0.03, 0.016], m, 16, 16, 0.85);
  SW(g, [[0.17, 0.29, 0.02], [0.215, 0.275, 0.03], [0.25, 0.268, 0.036]], [0.022, 0.016, 0.008], mat(pal[3], { roughness: 0.5 }), 10, 10);
  for (const s of [-1, 1]) {
    SP(g, 0.011, glossy(0xffffff), 0.19, 0.335, 0.03 + s * 0.022, 1, 1, 1, 12);
    SP(g, 0.006, glossy(0x111111), 0.197, 0.337, 0.03 + s * 0.029, 1, 1, 1, 10);
    SW(g, [[0.17, 0.345, 0.02 + s * 0.015], [0.15, 0.39, 0.02 + s * 0.035], [0.11, 0.41, 0.02 + s * 0.05], [0.085, 0.395, 0.02 + s * 0.055]], [0.009, 0.007, 0.004, 0.001], mat(pal[2], { roughness: 0.4 }), 8, 16);
    EX(g, [[0, 0], [0.03, 0.012], [0.045, 0.035], [0.02, 0.02]], 0.004, mat(pal[1], { roughness: 0.5 }), 0.165, 0.335, 0.02 + s * 0.03, 0, s * 1.2, 0.4, 0.002);
  }
  for (let i = 0; i < 6; i++) { const x = -0.11 + i * 0.035; CO(g, 0.007, 0.024, mat(pal[1 + (i % 4)], { roughness: 0.4 }), x, 0.2 + 0.035 * (x + 0.13) / 0.23 + 0.01, 0, 0, 0, -0.25, 8); }
  // patas
  for (const [hx, s] of [[0.06, 1], [0.06, -1], [-0.1, 1], [-0.1, -1]]) {
    const z = s * 0.036, fw = hx > 0 ? 0.01 : -0.01;
    SW(g, [[hx, 0.16, z * 0.7], [hx + fw, 0.09, z * 1.25], [hx - fw * 0.5, 0.03, z * 1.3]], [0.026, 0.017, 0.013], m, 12, 14);
    SW(g, [[hx - 0.005, 0.012, z * 1.3], [hx + 0.028, 0.01, z * 1.3]], [0.014, 0.011], m, 10, 6);
    for (let c = -1; c <= 1; c++) CO(g, 0.004, 0.014, glossy(0xf8f0d8), hx + 0.042, 0.006, z * 1.3 + c * 0.008, 0, 0, -PI / 2, 6);
  }
  // cola en espiral
  SW(g, [[-0.13, 0.15, 0], [-0.2, 0.17, 0], [-0.245, 0.23, 0], [-0.225, 0.29, 0], [-0.185, 0.285, 0], [-0.19, 0.245, 0]], [0.034, 0.022, 0.015, 0.01, 0.006, 0.003], m, 12, 36);
  // alas
  const wing = shp([[0, 0], [-0.03, 0.06], [-0.09, 0.13], [-0.1, 0.1], [-0.13, 0.11], [-0.13, 0.07], [-0.16, 0.06], [-0.14, 0.02], [-0.1, 0.01]]);
  for (const s of [-1, 1]) EXS(g, wing, 0.004, wm, 0.03, 0.2, s * 0.03, s * -0.55, 0, 0, 0.002).scale.set(1.5, 1.5, 1);
  const gg = grp(null); gg.add(g); g.rotation.y = -0.35 + (R() - 0.5) * 0.2;
  return gg;
}

function catrinaFaceTex() {
  return T('catrinaface', 512, 256, (c, w, h) => {
    c.fillStyle = '#f7f1e6'; c.fillRect(0, 0, w, h);
    const cx = w * 0.5;
    for (const s of [-1, 1]) {
      const ex = cx + s * 30, ey = h * 0.44;
      c.fillStyle = '#e8385a'; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; c.beginPath(); c.arc(ex + Math.cos(a) * 17, ey + Math.sin(a) * 19, 6, 0, 7); c.fill(); }
      c.fillStyle = '#111'; c.beginPath(); c.ellipse(ex, ey, 14, 16, 0, 0, 7); c.fill();
      c.fillStyle = '#2a9ad8'; c.beginPath(); c.arc(ex, ey, 4, 0, 7); c.fill();
    }
    c.fillStyle = '#111'; c.beginPath(); c.moveTo(cx, h * 0.55); c.lineTo(cx - 8, h * 0.62); c.lineTo(cx + 8, h * 0.62); c.fill();
    c.strokeStyle = '#111'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(cx - 28, h * 0.7); c.quadraticCurveTo(cx, h * 0.76, cx + 28, h * 0.7); c.stroke();
    for (let i = -6; i <= 6; i++) { c.beginPath(); c.moveTo(cx + i * 4.5, h * 0.67); c.lineTo(cx + i * 4.5, h * 0.76); c.stroke(); }
    c.fillStyle = '#f2c21a'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(cx - 36 + i * 18, h * 0.27, 5, 0, 7); c.fill(); }
    c.fillStyle = '#3ab84a'; c.beginPath(); c.arc(cx, h * 0.3, 8, 0, 7); c.fill();
    c.strokeStyle = '#8a3ad8'; c.lineWidth = 2; for (const s of [-1, 1]) { c.beginPath(); c.arc(cx + s * 58, h * 0.6, 10, 0, 7); c.stroke(); }
  });
}
function catrina(seed) {
  const g = new THREE.Group(), R = rng(seed + 5);
  const dress = [0x8a1a3a, 0x1a4a8a, 0x2a6a3a][seed % 3];
  const skirtTex = T('catskirt' + (seed % 3), 256, 256, (c, w, h) => {
    const base = '#' + dress.toString(16).padStart(6, '0');
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { const y = h - i * 40 - 12; c.fillStyle = ['#f2c21a', '#ffffff', '#e8385a', '#2a9ad8', '#3ab84a', '#f27a1a'][i]; c.fillRect(0, y, w, 5);
      for (let x = 10; x < w; x += 24) { c.fillStyle = ['#e8385a', '#f2c21a', '#ffffff'][(x / 24 | 0) % 3]; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + Math.cos(k * 1.26) * 5, y - 16 + Math.sin(k * 1.26) * 5, 3, 0, 7); c.fill(); } c.fillStyle = '#111'; c.beginPath(); c.arc(x, y - 16, 2, 0, 7); c.fill(); } }
  }, true);
  const clay = C.porcelain(0xf2ece0);
  const sk = mat(0xffffff, { map: skirtTex, roughness: 0.55 });
  LA(g, [[0, 0], [0.105, 0], [0.108, 0.012], [0.1, 0.04], [0.088, 0.08], [0.074, 0.12], [0.06, 0.16], [0.048, 0.2], [0.04, 0.235], [0.036, 0.25], [0, 0.25]], sk, 0, 0, 0, 48);
  for (const [y, r, c] of [[0.012, 0.106, 0xf2c21a], [0.06, 0.094, 0xffffff], [0.12, 0.075, 0xe8385a]]) TO(g, r, 0.006, mat(c, { roughness: 0.5 }), 0, y, 0, PI / 2, 0, 0, TAU, 48);
  const bod = mat(dress, { roughness: 0.5 });
  SW(g, [[0, 0.24, 0], [0, 0.29, 0.004], [0, 0.34, 0.006], [0, 0.365, 0.004]], [0.038, 0.03, 0.04, 0.036], bod, 16, 16, 0.72);
  // rebozo
  strip(g, [[-0.045, 0.37, -0.02], [-0.05, 0.33, 0.03], [0, 0.3, 0.042], [0.05, 0.33, 0.03], [0.045, 0.37, -0.02]], 0.03, mat(0xffffff, { map: T('rebozo', 64, 128, (c, w, h) => { for (let y = 0; y < h; y += 8) { c.fillStyle = ['#2a9ad8', '#f7f1e6', '#111', '#e8385a'][(y / 8) % 4]; c.fillRect(0, y, w, 8); } }), roughness: 0.9, side: DS }), [0, 1, 0]);
  for (const s of [-1, 1]) {
    SW(g, [[s * 0.045, 0.355, 0], [s * 0.078, 0.31, 0.012], [s * 0.06, 0.265, 0.03], [s * 0.036, 0.262, 0.04]], [0.014, 0.012, 0.01, 0.009], bod, 10, 16);
    SW(g, [[s * 0.036, 0.262, 0.042], [s * 0.022, 0.262, 0.046]], [0.008, 0.005], clay, 8, 4);
  }
  SW(g, [[0, 0.36, 0], [0, 0.395, 0.004]], [0.012, 0.011], clay, 10, 4);
  headMesh(g, 0.042, mat(0xffffff, { map: catrinaFaceTex(), roughness: 0.3 }), 0, 0.43, 0.006, { skull: true, jaw: 0.35 });
  // sombrero con flores y plumas
  const hat = grp(g, 0, 0.465, -0.006, -0.25, 0, 0.12);
  const hm = mat([0x5a2a8a, 0x1a1a1a, 0xc8a878][seed % 3], { roughness: 0.7 });
  LA(hat, [[0, 0], [0.12, -0.004], [0.126, 0.004], [0.118, 0.01], [0.05, 0.012], [0.046, 0.045], [0.04, 0.055], [0, 0.058]], hm, 0, 0, 0, 48);
  TO(hat, 0.047, 0.006, mat(0xe8385a, { roughness: 0.6 }), 0, 0.018, 0, PI / 2, 0, 0, TAU, 36);
  for (let i = 0; i < 7; i++) {
    const a = 0.3 + i * 0.28, r = 0.062 + (i % 2) * 0.02;
    const fl = [0xe8385a, 0xf2c21a, 0xffffff, 0xf27a1a][i % 4];
    EXS(hat, flowerShape(0.017 - (i % 2) * 0.004, 5 + (i % 3)), 0.005, mat(fl, { roughness: 0.5 }), Math.cos(a) * r, 0.02, Math.sin(a) * r, -PI / 2 + 0.3, 0, 0, 0.002);
    SP(hat, 0.005, mat(0x111111), Math.cos(a) * r, 0.025, Math.sin(a) * r, 1, 0.6, 1, 8);
  }
  for (let i = 0; i < 3; i++) SW(hat, [[-0.03, 0.04, -0.02], [-0.07 - i * 0.01, 0.1, -0.04 + i * 0.02], [-0.12 - i * 0.015, 0.12 - i * 0.02, -0.05 + i * 0.03]], [0.006, 0.012, 0.002], mat([0xf7f1e6, 0x2a9ad8, 0xe8385a][i], { roughness: 0.9 }), 8, 16, 0.3);
  g.rotation.y = (R() - 0.5) * 0.3;
  return g;
}

function mascaraTallada(seed) {
  const g = new THREE.Group(), k = seed % 2;
  const face = T('diablo' + k, 512, 256, (c, w, h) => {
    const base = ['#b81e24', '#1a1a1a'][k], acc = ['#111', '#b81e24'][k];
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    const R = rng(21); for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.12})`; c.fillRect(R() * w, R() * h, 3, 1); }
    const cx = w / 2;
    c.fillStyle = acc; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(cx + s * 8, h * 0.3); c.quadraticCurveTo(cx + s * 40, h * 0.18, cx + s * 70, h * 0.28); c.lineTo(cx + s * 60, h * 0.33); c.quadraticCurveTo(cx + s * 38, h * 0.26, cx + s * 10, h * 0.36); c.fill(); }
    for (const s of [-1, 1]) { c.fillStyle = '#f4f0e0'; c.beginPath(); c.ellipse(cx + s * 34, h * 0.42, 17, 10, s * 0.25, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(cx + s * 32, h * 0.42, 6, 0, 7); c.fill(); }
    c.fillStyle = '#111'; c.beginPath(); c.ellipse(cx, h * 0.72, 38, 14, 0, 0, 7); c.fill();
    c.fillStyle = '#f4f0e0'; for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(cx + i * 8 - 3, h * 0.67); c.lineTo(cx + i * 8 + 3, h * 0.67); c.lineTo(cx + i * 8, h * 0.72 + (Math.abs(i) === 3 ? 10 : 0)); c.fill(); }
    c.strokeStyle = '#d8a83a'; c.lineWidth = 3;
    for (const s of [-1, 1]) { c.beginPath(); c.arc(cx + s * 75, h * 0.55, 14, 0, 5); c.stroke(); c.beginPath(); c.arc(cx + s * 75, h * 0.55, 6, 0, 5); c.stroke(); }
    c.fillStyle = '#d8a83a'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(cx - 64 + i * 16, h * 0.12, 4, 0, 7); c.fill(); }
  });
  const m = mat(0xffffff, { map: face, roughness: 0.45, side: DS });
  RB(g, 0.17, 0.025, 0.12, 0.006, C.darkWood(), 0, 0.0125, 0);
  RB(g, 0.025, 0.23, 0.02, 0.004, C.darkWood(), 0, 0.14, -0.035);
  const ff = faceFn({ nose: 1.8, jaw: 0.2 });
  const geo = sphereDeform((v) => {
    ff(v);
    v.z += 0.08 * g2((Math.abs(v.x) - 0.45) / 0.2, (v.y + 0.15) / 0.2) * Math.max(0, v.z);
  }, 40, 28, { phiStart: PI / 2, phiLen: PI });
  const mk = add(g, geo, m, 0, 0.2, -0.01); mk.scale.set(0.085, 0.1, 0.055);
  const hm = mat(k ? 0xd8c8a0 : 0x1a1a1a, { roughness: 0.4 });
  for (const s of [-1, 1]) SW(g, [[s * 0.04, 0.27, 0.01], [s * 0.07, 0.31, 0.02], [s * 0.1, 0.36, 0.01], [s * 0.095, 0.4, -0.01]], [0.017, 0.013, 0.008, 0.002], hm, 12, 20);
  SW(g, [[-0.03, 0.14, 0.03], [0, 0.125, 0.045], [0.03, 0.14, 0.03]], [0.008, 0.012, 0.008], mat(0xb81e24, { roughness: 0.5 }), 10, 10);
  return g;
}

function relojCucu(seed) {
  const g = new THREE.Group();
  const wd = C.darkWood(), wl = C.wood(0x8a5a2e);
  RB(g, 0.34, 0.03, 0.22, 0.008, wd, 0, 0.015, 0);
  RB(g, 0.09, 1.02, 0.025, 0.006, wd, 0, 0.54, -0.11);
  const h = grp(g, 0, 0.6, 0); h.scale.setScalar(1.3);
  RB(h, 0.26, 0.24, 0.12, 0.006, wl, 0, 0.12, -0.02);
  for (const s of [-1, 1]) RB(h, 0.2, 0.014, 0.16, 0.004, wd, s * 0.075, 0.29, -0.01, 0, 0, s * -0.62);
  const leaf = leafShape(0.07, 0.03);
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const x = s * (0.02 + i * 0.042); EXS(h, leaf, 0.006, wl, x, 0.345 - 0.71 * Math.abs(x), 0.078, 0, 0, -s * 2.19, 0.002).scale.setScalar(0.8); }
  EX(h, [[-0.035, 0], [0.03, 0], [0.045, 0.02], [0.02, 0.025], [0.035, 0.05], [0.0, 0.035], [-0.035, 0.03], [-0.05, 0.015]], 0.01, wd, 0, 0.37, 0.02, 0, 0, 0, 0.003);
  const dial = T('cucudial', 256, 256, (c, w, h2) => {
    c.fillStyle = '#efe4c8'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill();
    c.strokeStyle = '#3a2410'; c.lineWidth = 4; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.stroke();
    c.fillStyle = '#2a1a0a'; c.font = 'bold 28px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const RN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    RN.forEach((t, i) => { const a = i / 12 * TAU - PI / 2; c.save(); c.translate(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); c.rotate(a + PI / 2); c.fillText(t, 0, 0); c.restore(); });
    c.lineWidth = 7; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + 45, 128 - 30); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 - 10, 128 - 80); c.stroke();
    c.beginPath(); c.arc(128, 128, 8, 0, 7); c.fill();
  });
  CY(h, 0.075, 0.075, 0.012, wd, 0, 0.1, 0.044, PI / 2, 0, 0, 40);
  P(h, 0.13, 0.13, dial, 0, 0.1, 0.051, 0, 0, 0, { transparent: true, alphaTest: 0.2 });
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; EXS(h, leafShape(0.03, 0.013), 0.005, wd, Math.cos(a) * 0.082, 0.1 + Math.sin(a) * 0.082, 0.045, 0, 0, a - PI / 2, 0.0015); }
  RB(h, 0.05, 0.05, 0.012, 0.004, mat(0x1a1008, { roughness: 0.8 }), 0, 0.215, 0.04);
  const bird = grp(h, 0, 0.215, 0.05);
  SW(bird, [[0, -0.005, -0.01], [0, 0, 0.012], [0, 0.006, 0.024]], [0.009, 0.011, 0.007], mat(0x6a4a2a, { roughness: 0.7 }), 10, 10);
  CO(bird, 0.004, 0.012, mat(0xe8a020), 0, 0.006, 0.034, PI / 2, 0, 0, 8);
  RB(h, 0.28, 0.02, 0.14, 0.004, wd, 0, 0.0, -0.01);
  // péndulo y pesas
  RB(g, 0.006, 0.2, 0.004, 0.002, wd, 0, 0.5, 0.03);
  EXS(g, leafShape(0.08, 0.035), 0.006, wl, 0, 0.42, 0.032, 0, 0, PI, 0.002);
  const cone = T('pinecone', 128, 128, (c, w, h2) => { c.fillStyle = '#3a2410'; c.fillRect(0, 0, w, h2); c.fillStyle = '#7a5226'; for (let y = 0; y < h2; y += 12) for (let x = (y / 12 % 2) * 8; x < w; x += 16) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + 8, y + 12); c.lineTo(x + 16, y); c.fill(); } }, true);
  const cm = mat(0xffffff, { map: cone, roughness: 0.6, metalness: 0.3 });
  const chainM = metal(0x5a5a52, 0.5);
  for (const [x, y] of [[-0.06, 0.12], [0.06, 0.22]]) {
    CY(g, 0.0018, 0.0018, 0.6 - y - 0.1, chainM, x, y + 0.1 + (0.6 - y - 0.1) / 2, 0.0, 0, 0, 0, 6);
    LA(g, [[0, 0], [0.012, 0.006], [0.022, 0.025], [0.024, 0.055], [0.019, 0.08], [0.01, 0.095], [0.003, 0.1], [0, 0.1]], cm, x, y, 0, 24);
  }
  return g;
}

function esculturaAbstracta(seed) {
  const g = new THREE.Group();
  const pat = T('patina', 256, 256, (c, w, h) => {
    const R = rng(33); c.fillStyle = '#7a4a24'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${60 + R() * 40},${130 + R() * 50},${110 + R() * 40},${0.1 + R() * 0.25})`; c.beginPath(); c.arc(R() * w, R() * h, 4 + R() * 20, 0, 7); c.fill(); }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(220,160,90,${R() * 0.3})`; c.fillRect(R() * w, R() * h, 30, 2); }
  }, true);
  const bz = mat(0xffffff, { map: pat, metalness: 0.75, roughness: 0.38, env: true, envI: 1 });
  RB(g, 0.24, 0.08, 0.24, 0.006, mat(0x1c1c1e, { roughness: 0.3, env: true, envI: 0.5 }), 0, 0.04, 0);
  LA(g, [[0, 0], [0.035, 0], [0.03, 0.01], [0.012, 0.03], [0.01, 0.045], [0, 0.045]], bz, 0, 0.08, 0, 24);
  const s = 1 + (seed % 3) * 0.05;
  twistBand(g, [[0, 0.12, 0], [0.13 * s, 0.2, 0.05], [0.11 * s, 0.37, -0.04], [0.01, 0.3, 0.02], [-0.1 * s, 0.4, 0.04], [-0.13 * s, 0.22, -0.05]], 0.042, 0.009, 2, bz);
  return g;
}

function vitral(seed) {
  const g = new THREE.Group(), W = 0.46, Hr = 0.5;
  const arch = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.absarc(0, h, w / 2, 0, PI, false); s.lineTo(-w / 2, 0); return s; };
  const outer = arch(W + 0.07, Hr); const inner = arch(W, Hr);
  const hole = new THREE.Path(inner.getPoints(48)); outer.holes.push(hole);
  const y0 = 0.05;
  const fr = grp(g, 0, y0, 0);
  EXS(fr, outer, 0.035, C.darkWood(), 0, -0.035, 0, 0, 0, 0, 0.004);
  const k = seed % 3;
  const tex = T('vitral' + k, 256, 400, (c, w, h) => {
    const R = rng(40 + k);
    const cols = [['#c81e2a', '#1e4ab8', '#e8b820', '#2a8a3a', '#7a2a9a', '#e8e0c0'], ['#1e6ab8', '#2ab8b8', '#e8d020', '#c83a1e', '#3a3a9a', '#f0e8d0'], ['#9a1e5a', '#e87a1e', '#2a9a4a', '#1e3a9a', '#e8c820', '#e8f0e0']][k];
    c.fillStyle = cols[5]; c.fillRect(0, 0, w, h);
    const S = 32;
    for (let y = -S; y < h; y += S) for (let x = -S; x < w + S; x += S) { c.fillStyle = `hsla(${40 + R() * 20},60%,${78 + R() * 12}%,1)`; c.beginPath(); c.moveTo(x, y + S / 2); c.lineTo(x + S / 2, y); c.lineTo(x + S, y + S / 2); c.lineTo(x + S / 2, y + S); c.fill(); }
    c.strokeStyle = '#1a1a1a'; c.lineWidth = 3;
    for (let y = -S; y < h + S; y += S) for (let x = -S; x < w + S; x += S) { c.beginPath(); c.moveTo(x, y + S / 2); c.lineTo(x + S / 2, y); c.lineTo(x + S, y + S / 2); c.lineTo(x + S / 2, y + S); c.closePath(); c.stroke(); }
    c.lineWidth = 16; c.strokeStyle = '#1a1a1a'; c.strokeRect(0, 0, w, h);
    c.lineWidth = 10; c.strokeStyle = cols[1]; c.strokeRect(14, 14, w - 28, h - 28);
    for (let i = 0; i < 12; i++) { c.fillStyle = cols[i % 2 ? 2 : 0]; c.fillRect(8, 20 + i * 32, 12, 18); c.fillRect(w - 20, 20 + i * 32, 12, 18); }
    const cx = w / 2, cy = h * 0.52, r = w * 0.36;
    c.fillStyle = cols[1]; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillStyle = cols[i % 2 ? 0 : 4]; c.beginPath(); c.ellipse(cx + Math.cos(a) * r * 0.58, cy + Math.sin(a) * r * 0.58, r * 0.32, r * 0.13, a, 0, 7); c.fill(); }
    c.fillStyle = cols[2]; c.beginPath(); c.arc(cx, cy, r * 0.28, 0, 7); c.fill();
    c.fillStyle = cols[3]; c.beginPath(); c.arc(cx, cy, r * 0.12, 0, 7); c.fill();
    c.strokeStyle = '#141414'; c.lineWidth = 4;
    c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); c.beginPath(); c.arc(cx, cy, r * 0.28, 0, 7); c.stroke(); c.beginPath(); c.arc(cx, cy, r * 0.12, 0, 7); c.stroke();
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.beginPath(); c.ellipse(cx + Math.cos(a) * r * 0.58, cy + Math.sin(a) * r * 0.58, r * 0.32, r * 0.13, a, 0, 7); c.stroke(); }
    c.fillStyle = cols[3]; c.beginPath(); c.moveTo(cx, h * 0.08); c.lineTo(cx + 26, h * 0.2); c.lineTo(cx, h * 0.26); c.lineTo(cx - 26, h * 0.2); c.fill(); c.stroke();
    c.fillStyle = cols[0]; c.beginPath(); c.moveTo(cx, h * 0.93); c.lineTo(cx + 30, h * 0.86); c.lineTo(cx, h * 0.79); c.lineTo(cx - 30, h * 0.86); c.fill(); c.stroke();
  });
  const gm = mat(0xffffff, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55, roughness: 0.15, transparent: true, opacity: 0.93, side: DS, env: true, envI: 0.6 });
  shapeMesh(fr, arch(W + 0.004, Hr), gm, 0, -0.03, 0);
  for (const s of [-1, 1]) {
    RB(g, 0.06, 0.035, 0.18, 0.008, C.darkWood(), s * (W / 2 + 0.01), 0.0175, 0);
    RB(g, 0.05, 0.05, 0.05, 0.006, C.darkWood(), s * (W / 2 + 0.01), 0.05, 0);
  }
  return g;
}

function arbolVida(seed) {
  const g = new THREE.Group(), R = rng(seed + 50);
  const clayT = T('arbolclay', 256, 128, (c, w, h) => { c.fillStyle = '#e8b830'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { c.fillStyle = ['#e8385a', '#2a9ad8', '#3ab84a', '#8a3ad8'][(x / 16) % 4]; c.fillRect(x, 0, 6, h); c.fillStyle = '#fff'; for (let y = 6; y < h; y += 14) { c.beginPath(); c.arc(x + 11, y, 2.2, 0, 7); c.fill(); } } }, true);
  const cm = mat(0xffffff, { map: clayT, roughness: 0.55 });
  LA(g, [[0, 0], [0.11, 0], [0.112, 0.015], [0.09, 0.03], [0.07, 0.05], [0.055, 0.07], [0, 0.07]], cm, 0, 0, 0, 36);
  SW(g, [[0, 0.06, 0], [0.004, 0.2, 0], [0, 0.34, 0], [0, 0.44, 0]], [0.028, 0.022, 0.018, 0.014], cm, 14, 20);
  // serpiente enroscada
  const sn = []; for (let i = 0; i <= 16; i++) { const a = i * 0.9; sn.push([Math.cos(a) * 0.032, 0.09 + i * 0.012, Math.sin(a) * 0.032]); }
  SW(g, sn, [0.004, 0.009, 0.009, 0.008, 0.005], mat(0x3a9a2a, { roughness: 0.4 }), 8, 60);
  const branchM = mat(0xffffff, { map: clayT, roughness: 0.55 });
  const tips = [];
  for (const [y0, sp, up] of [[0.14, 0.16, 0.12], [0.25, 0.14, 0.12], [0.35, 0.1, 0.1]]) for (const s of [-1, 1]) {
    const pts = [[0, y0, 0], [s * sp * 0.5, y0 + 0.02, 0], [s * sp, y0 + up * 0.5, 0], [s * sp * 0.9, y0 + up, 0], [s * sp * 0.6, y0 + up * 1.15, 0]];
    SW(g, pts, [0.011, 0.01, 0.009, 0.008, 0.006], branchM, 10, 24);
    tips.push(...pts.slice(1).map(p => [p[0], p[1], p[2]]));
  }
  // arco superior
  const ar = []; for (let i = 0; i <= 12; i++) { const a = PI * i / 12; ar.push([Math.cos(a) * 0.18, 0.3 + Math.sin(a) * 0.24, 0]); }
  SW(g, ar, [0.01, 0.01], branchM, 10, 40);
  tips.push(...ar.filter((_, i) => i % 2 === 1));
  const cols = [0xe8385a, 0xf2c21a, 0x2a9ad8, 0xffffff, 0x8a3ad8, 0xf27a1a];
  const flowerGeos = cols.map(() => []);
  const centerGeos = [];
  tips.forEach((p, i) => {
    const r = 0.018 + R() * 0.012;
    const fg = new THREE.ExtrudeGeometry(flowerShape(r, 5 + (i % 3), 0.5), { depth: 0.005, bevelEnabled: true, bevelSize: 0.0015, bevelThickness: 0.0015, bevelSegments: 1 });
    fg.translate(p[0], p[1], p[2] + 0.004);
    flowerGeos[i % cols.length].push(fg);
    const cg = new THREE.SphereGeometry(r * 0.35, 10, 8); cg.scale(1, 1, 0.5); cg.translate(p[0], p[1], p[2] + 0.012); centerGeos.push(cg);
  });
  flowerGeos.forEach((arr, i) => { if (arr.length) add(g, mergeGeometries(arr), mat(cols[i], { roughness: 0.5 })); });
  add(g, mergeGeometries(centerGeos), mat(0xf2c21a, { roughness: 0.5 }));
  const leaves = [];
  for (let i = 0; i < 26; i++) { const p = tips[(R() * tips.length) | 0]; const lg = new THREE.ExtrudeGeometry(leafShape(0.035, 0.012), { depth: 0.003, bevelEnabled: false }); lg.rotateZ(R() * TAU); lg.translate(p[0] + (R() - 0.5) * 0.03, p[1] + (R() - 0.5) * 0.03, p[2] - 0.004); leaves.push(lg); }
  add(g, mergeGeometries(leaves), mat(0x2a8a3a, { roughness: 0.5 }));
  // palomas
  const dove = shp([[0, 0], [0.02, 0.008], [0.03, 0.02], [0.035, 0.01], [0.045, 0.012], [0.04, 0], [0.02, -0.008], [-0.01, -0.004], [-0.02, 0.004]]);
  for (const [x, y, s] of [[-0.12, 0.47, 1], [0.12, 0.47, -1], [0, 0.56, 1], [-0.05, 0.2, -1]]) EXS(g, dove, 0.006, mat(0xffffff, { roughness: 0.5 }), x, y, 0.01, 0, s > 0 ? 0 : PI, 0, 0.002);
  return g;
}

function talaveraTex(k) {
  return T('talav' + k, 512, 512, (c, w, h) => {
    const cx = w / 2, cy = h / 2, R = w / 2;
    const blue = ['#1e3a9a', '#1e3a9a', '#2a4ab0'][k], acc = ['#1e3a9a', '#e8a01a', '#2a8a3a'][k], acc2 = ['#4a6ad8', '#c83a1e', '#e8c01a'][k];
    c.fillStyle = '#f6f2e6'; c.fillRect(0, 0, w, h);
    c.strokeStyle = blue; c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, R * 0.97, 0, 7); c.stroke();
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; c.fillStyle = i % 2 ? blue : acc; c.beginPath(); c.ellipse(cx + Math.cos(a) * R * 0.82, cy + Math.sin(a) * R * 0.82, R * 0.1, R * 0.045, a, 0, 7); c.fill(); }
    c.lineWidth = 5; c.strokeStyle = blue; c.beginPath(); c.arc(cx, cy, R * 0.68, 0, 7); c.stroke(); c.beginPath(); c.arc(cx, cy, R * 0.62, 0, 7); c.stroke();
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; c.fillStyle = acc2; c.beginPath(); c.arc(cx + Math.cos(a) * R * 0.65, cy + Math.sin(a) * R * 0.65, 6, 0, 7); c.fill(); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.fillStyle = i % 2 ? blue : acc; c.beginPath(); c.moveTo(cx, cy); c.quadraticCurveTo(cx + Math.cos(a - 0.3) * R * 0.5, cy + Math.sin(a - 0.3) * R * 0.5, cx + Math.cos(a) * R * 0.52, cy + Math.sin(a) * R * 0.52); c.quadraticCurveTo(cx + Math.cos(a + 0.3) * R * 0.5, cy + Math.sin(a + 0.3) * R * 0.5, cx, cy); c.fill(); }
    c.fillStyle = acc2; c.beginPath(); c.arc(cx, cy, R * 0.12, 0, 7); c.fill();
    c.fillStyle = blue; c.beginPath(); c.arc(cx, cy, R * 0.06, 0, 7); c.fill();
  });
}
function platoTalavera(seed) {
  const g = new THREE.Group(), Rr = 0.15, k = seed % 3;
  const prof = (r) => r < 0.085 ? 0 : 0.022 * Math.pow((r - 0.085) / (Rr - 0.085), 1.4);
  const geo = new THREE.RingGeometry(0.0005, Rr, 96, 24);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const r = Math.hypot(p.getX(i), p.getY(i)); p.setZ(i, prof(r)); }
  geo.computeVertexNormals();
  const pl = grp(g, 0, Rr + 0.016, 0.012, -0.22);
  add(pl, geo, mat(0xffffff, { map: talaveraTex(k), roughness: 0.12, env: true, envI: 0.9 }));
  const back = add(pl, geo, C.porcelain(0xe8e0cc), 0, 0, -0.005); back.material = mat(0xe8e0cc, { roughness: 0.4, side: THREE.BackSide });
  TO(pl, Rr, 0.0032, C.porcelain(0xf2eee2), 0, 0, 0.0195, 0, 0, 0, TAU, 96);
  // atril de alambre
  const wm = metal(0x2a2a2a, 0.5);
  RB(g, 0.2, 0.012, 0.1, 0.004, C.darkWood(), 0, 0.006, -0.01);
  TU(g, [[-0.07, 0.012, 0.05], [-0.07, 0.03, 0.05], [0.07, 0.03, 0.05], [0.07, 0.012, 0.05]], 0.003, wm);
  for (const s of [-1, 1]) TU(g, [[s * 0.06, 0.012, -0.05], [s * 0.05, 0.12, -0.05], [s * 0.035, 0.2, -0.025]], 0.003, wm);
  return g;
}

function espejoSol(seed) {
  const g = new THREE.Group(), k = seed % 3;
  const tin = T('tinpunch', 128, 128, (c, w, h) => { c.fillStyle = '#c4c8cc'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(40,40,40,0.35)'; for (let y = 4; y < h; y += 8) for (let x = 4 + (y / 8 % 2) * 4; x < w; x += 8) { c.beginPath(); c.arc(x, y, 1.3, 0, 7); c.fill(); } }, true);
  tin.repeat.set(6, 6);
  const tm = mat(0xffffff, { map: tin, metalness: 0.7, roughness: 0.35, env: true, envI: 1.3, emissive: 0x222222 });
  const cols = [[0xe8385a, 0xf2c21a, 0x2a9ad8], [0x3ab84a, 0xe8385a, 0xf27a1a], [0x8a3ad8, 0xf2c21a, 0x2ab8a8]][k];
  const sun = grp(g, 0, 0.235, 0.0, -0.12);
  const rays = []; const n = 16;
  for (let i = 0; i < n * 2; i++) { const a = PI / 2 + i / (n * 2) * TAU; const r = i % 2 ? 0.1 : (i % 4 === 0 ? 0.215 : 0.17); rays.push([Math.cos(a) * r, Math.sin(a) * r]); }
  exNorm(sun, shp(rays), 0.003, tm, 0.0015, 0, 0, 0);
  const rays2 = []; for (let i = 0; i < n * 2; i++) { const a = PI / 2 + PI / (n * 2) + i / (n * 2) * TAU; const r = i % 2 ? 0.095 : 0.14; rays2.push([Math.cos(a) * r, Math.sin(a) * r]); }
  EXS(sun, shp(rays2), 0.002, mat(cols[0], { roughness: 0.35, metalness: 0.4, env: true }), 0, 0, 0.004, 0, 0, 0, 0.001);
  const ring = circ(0.1); ring.holes.push(circ(0.075, 0, 0, 40, true));
  EXS(sun, ring, 0.006, mat(cols[1], { roughness: 0.35, metalness: 0.4, env: true }), 0, 0, 0.008, 0, 0, 0, 0.002);
  for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; SP(sun, 0.005, mat(cols[2], { roughness: 0.3, metalness: 0.4, env: true }), Math.cos(a) * 0.0875, Math.sin(a) * 0.0875, 0.014, 1, 1, 0.6, 8); }
  CY(sun, 0.076, 0.076, 0.004, mat(0xc8d4dc, { metalness: 0.9, roughness: 0.04, env: true, envI: 1.6, emissive: 0x2a3440 }), 0, 0, 0.006, PI / 2, 0, 0, 48);
  RB(g, 0.2, 0.018, 0.12, 0.005, C.darkWood(), 0, 0.009, 0);
  RB(g, 0.16, 0.02, 0.02, 0.004, C.darkWood(), 0, 0.028, 0.035);
  RB(g, 0.03, 0.22, 0.012, 0.004, C.darkWood(), 0, 0.12, -0.045, -0.12);
  return g;
}

function bustoMarmol(seed) {
  const g = new THREE.Group();
  const mm = C.marble();
  RB(g, 0.17, 0.04, 0.17, 0.004, mat(0x5a5652, { roughness: 0.3, env: true, envI: 0.5 }), 0, 0.02, 0);
  LA(g, [[0, 0], [0.065, 0], [0.066, 0.012], [0.055, 0.02], [0.034, 0.045], [0.03, 0.06], [0.04, 0.075], [0.052, 0.082], [0, 0.082]], mm, 0, 0.04, 0, 40);
  // pecho y hombros
  const chest = sphereDeform((v) => {
    let { x, y, z } = v;
    if (y < -0.2) y = -0.2 - (y + 0.2) * 0.25;
    z *= 1 - 0.2 * Math.max(0, y);
    z += 0.08 * g2((Math.abs(x) - 0.35) / 0.25, (y - 0.05) / 0.25) * Math.max(0, z);
    y += 0.12 * g2(x / 0.55, 0) * Math.max(0, y) - 0.05 * Math.max(0, y) * Math.abs(x);
    v.set(x, y, z);
  }, 40, 30);
  const ch = add(g, chest, mm, 0, 0.18, 0); ch.scale.set(0.15, 0.11, 0.08);
  // toga
  SW(g, [[-0.12, 0.235, 0.035], [-0.06, 0.205, 0.07], [0.02, 0.165, 0.078], [0.1, 0.135, 0.05]], [0.016, 0.02, 0.018, 0.01], mm, 12, 20, 0.4);
  SW(g, [[0, 0.24, 0], [0.004, 0.3, 0.008]], [0.034, 0.03], mm, 16, 6);
  const head = grp(g, 0, 0.37, 0.018, 0.05, (seed % 3 - 1) * 0.25);
  headMesh(head, 0.1, mm, 0, 0, 0, { nose: 1.4 });
  const hair = sphereDeform((v) => {
    const n = Math.sin(v.x * 23) * Math.sin(v.y * 21 + 1) * Math.sin(v.z * 19 + 2);
    const k = 1.05 + 0.035 * n;
    v.multiplyScalar(k);
    v.x *= 0.82; v.y *= 1.02; v.z *= 0.98;
    if (v.z < 0) v.z *= 1.08;
  }, 48, 32, { thetaLen: PI * 0.52 });
  add(head, hair, mm, 0, 0.012, -0.01, -0.35, 0, 0).scale.setScalar(0.1);
  for (const s of [-1, 1]) SW(head, [[s * 0.077, 0.02, -0.005], [s * 0.083, 0.0, -0.01], [s * 0.078, -0.03, -0.005]], [0.01, 0.014, 0.008], mm, 10, 8, 0.4);
  plaque(g, 'AVGVSTVS', 0.08, 0, 0.022, 0.0855);
  return g;
}

// =====================================================================
//  DEPORTES
// =====================================================================
function mascaraLucha(seed) {
  const g = new THREE.Group(), k = seed % 3;
  const [base, acc, trim] = [['#c81e2a', '#f2c21a', '#ffffff'], ['#1a3a9a', '#c8ccd4', '#e8385a'], ['#141414', '#d8a83a', '#c81e2a']][k];
  const tex = T('lucha' + k, 512, 256, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    const cx = w / 2;
    // cresta central
    c.fillStyle = acc; c.beginPath(); c.moveTo(cx - 10, h * 0.42); c.lineTo(cx - 18, 0); c.lineTo(cx + 18, 0); c.lineTo(cx + 10, h * 0.42); c.fill();
    c.fillStyle = trim; c.fillRect(cx - 3, 0, 6, h * 0.4);
    for (const s of [-1, 1]) {
      // llamas alrededor de los ojos
      c.fillStyle = acc; c.beginPath(); c.moveTo(cx + s * 8, h * 0.52);
      c.quadraticCurveTo(cx + s * 20, h * 0.38, cx + s * 45, h * 0.3); c.lineTo(cx + s * 70, h * 0.12); c.lineTo(cx + s * 66, h * 0.3); c.lineTo(cx + s * 95, h * 0.2); c.lineTo(cx + s * 80, h * 0.42);
      c.lineTo(cx + s * 110, h * 0.38); c.quadraticCurveTo(cx + s * 70, h * 0.62, cx + s * 30, h * 0.58); c.fill();
      c.strokeStyle = trim; c.lineWidth = 3; c.stroke();
      c.fillStyle = trim; c.beginPath(); c.ellipse(cx + s * 28, h * 0.47, 17, 11, s * 0.3, 0, 7); c.fill();
      c.fillStyle = '#0a0a0a'; c.beginPath(); c.ellipse(cx + s * 28, h * 0.47, 12, 7, s * 0.3, 0, 7); c.fill();
    }
    c.fillStyle = trim; c.beginPath(); c.ellipse(cx, h * 0.64, 24, 12, 0, 0, 7); c.fill();
    c.fillStyle = '#0a0a0a'; c.beginPath(); c.ellipse(cx, h * 0.64, 18, 7, 0, 0, 7); c.fill();
    c.strokeStyle = acc; c.lineWidth = 4; c.beginPath(); c.moveTo(0, h * 0.8); c.lineTo(w, h * 0.8); c.stroke();
    // agujetas atrás (costura en u=0/1)
    c.strokeStyle = trim; c.lineWidth = 3;
    for (let y = h * 0.45; y < h * 0.85; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(14, y + 12); c.stroke(); c.beginPath(); c.moveTo(w, y); c.lineTo(w - 14, y + 12); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 40; i++) c.fillRect(0, i * 7, w, 2);
  });
  const mm = mat(0xffffff, { map: tex, roughness: 0.28, env: true, envI: 0.7 });
  const skin = mat(0xd8c4b0, { roughness: 0.5 });
  LA(g, [[0, 0], [0.07, 0], [0.072, 0.012], [0.05, 0.022], [0.03, 0.05], [0.028, 0.07], [0, 0.07]], C.darkWood(), 0, 0, 0, 40);
  SW(g, [[0, 0.06, 0], [0, 0.14, 0.004], [0, 0.2, 0.01]], [0.028, 0.034, 0.042], skin, 16, 8);
  SW(g, [[0, 0.16, 0.004], [0, 0.21, 0.012]], [0.05, 0.05], mat(base === '#141414' ? 0x141414 : parseInt(base.slice(1), 16), { roughness: 0.3 }), 18, 6, 0.9);
  headMesh(g, 0.105, mm, 0, 0.3, 0.012, { nose: 0.8 });
  return g;
}

function cinturonCampeon(seed) {
  const g = new THREE.Group();
  RB(g, 0.56, 0.03, 0.3, 0.008, C.darkWood(), 0, 0.015, 0);
  const lm = mat(0x141414, { map: T('beltleather', 128, 128, (c, w, h) => { c.fillStyle = '#9a9a9a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#ddd'; c.setLineDash([4, 3]); c.lineWidth = 2; c.beginPath(); c.moveTo(0, 8); c.lineTo(w, 8); c.moveTo(0, h - 8); c.lineTo(w, h - 8); c.stroke(); }), roughness: 0.45, side: DS });
  const band = add(g, new THREE.CylinderGeometry(0.2, 0.2, 0.1, 64, 1, true, PI * 1.12, PI * 1.76), lm, 0, 0.14, 0);
  band.scale.set(1.25, 1, 0.72);
  const goldT = T('beltplate', 512, 384, (c, w, h) => {
    const gr = c.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w / 2); gr.addColorStop(0, '#fff2b0'); gr.addColorStop(0.5, '#e0b040'); gr.addColorStop(1, '#8a6414');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#7a5410'; c.lineWidth = 8; c.strokeRect(14, 14, w - 28, h - 28);
    c.fillStyle = '#1a3a9a'; c.beginPath(); c.arc(w / 2, h * 0.46, 96, 0, 7); c.fill();
    c.strokeStyle = '#f0d070'; c.lineWidth = 4; c.beginPath(); c.arc(w / 2, h * 0.46, 96, 0, 7); c.stroke();
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.ellipse(w / 2, h * 0.46, Math.abs(i) * 30, 96, 0, 0, 7); c.stroke(); }
    for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(w / 2 - 92, h * 0.46 + i * 36); c.lineTo(w / 2 + 92, h * 0.46 + i * 36); c.stroke(); }
    c.fillStyle = '#7a5410'; c.font = 'bold 54px Georgia'; c.textAlign = 'center'; c.fillText('CAMPEÓN', w / 2, h * 0.9);
    c.font = 'bold 30px Georgia'; c.fillText('MUNDIAL', w / 2, h * 0.14);
    c.fillStyle = '#c81e2a'; for (const s of [-1, 1]) { c.beginPath(); c.arc(w / 2 + s * 170, h * 0.46, 22, 0, 7); c.fill(); }
    c.strokeStyle = '#7a5410'; c.lineWidth = 5; for (const s of [-1, 1]) for (let i = 0; i < 7; i++) { c.beginPath(); c.ellipse(w / 2 + s * (120 + i * 3), h * 0.3 + i * 22, 14, 7, s * 0.8, 0, 7); c.stroke(); }
  });
  const pm = mat(0xffffff, { map: goldT, metalness: 0.85, roughness: 0.25, env: true, envI: 1.2 });
  const plate = new THREE.Shape(); const W = 0.13, Hh = 0.09;
  plate.moveTo(-W, -Hh * 0.6); plate.quadraticCurveTo(-W * 1.1, 0, -W, Hh * 0.6); plate.quadraticCurveTo(-W * 0.6, Hh * 0.8, -W * 0.3, Hh); plate.quadraticCurveTo(0, Hh * 1.25, W * 0.3, Hh); plate.quadraticCurveTo(W * 0.6, Hh * 0.8, W, Hh * 0.6);
  plate.quadraticCurveTo(W * 1.1, 0, W, -Hh * 0.6); plate.quadraticCurveTo(W * 0.6, -Hh * 0.8, W * 0.3, -Hh); plate.quadraticCurveTo(0, -Hh * 1.25, -W * 0.3, -Hh); plate.quadraticCurveTo(-W * 0.6, -Hh * 0.8, -W, -Hh * 0.6);
  exNorm(g, plate, 0.008, pm, 0.004, 0, 0.14, 0.2 * 0.72 + 0.008, 0, 0, 0, 3);
  for (const [dx, dy] of [[-0.1, 0.06], [0.1, 0.06], [-0.1, -0.06], [0.1, -0.06]]) add(g, new THREE.OctahedronGeometry(0.008), gem(0xc81e2a), dx, 0.14 + dy, 0.165).scale.set(1, 1, 0.5);
  const sideT = T('beltside', 256, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#fff0a0'); gr.addColorStop(1, '#a07820'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = '#7a5410'; c.lineWidth = 8; c.strokeRect(12, 12, w - 24, h - 24); c.fillStyle = '#7a5410'; c.font = 'bold 110px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★', w / 2, h / 2); });
  const sm = mat(0xffffff, { map: sideT, metalness: 0.85, roughness: 0.28, env: true, envI: 1.2 });
  for (const th of [-1.35, -0.72, 0.72, 1.35]) {
    const a = 0.25, b = 0.144, x = a * Math.sin(th), z = b * Math.cos(th);
    const ry = Math.atan2(Math.sin(th) / a, Math.cos(th) / b);
    const sp = grp(g, x * 1.03, 0.14, z * 1.03, 0, ry, 0);
    exNorm(sp, shp([[-0.035, -0.045], [0.035, -0.045], [0.04, 0], [0.035, 0.045], [-0.035, 0.045], [-0.04, 0]]), 0.004, sm, 0.002);
  }
  return g;
}

function boxGlove(g, m, side) {
  const lm = LA(g, [[0, 0], [0.048, 0], [0.05, 0.012], [0.048, 0.08], [0.056, 0.095], [0, 0.1]], m, 0, 0, 0, 32); lm.scale.z = 0.8;
  add(g, new THREE.CylinderGeometry(0.0485, 0.0485, 0.03, 32, 1, true), mat(0xf4f4f4, { roughness: 0.4, side: DS }), 0, 0.03, 0).scale.z = 0.8;
  SW(g, [[0, 0.09, 0], [0, 0.15, 0.004], [0, 0.2, 0.02], [0, 0.228, 0.058], [0, 0.205, 0.095]], [0.056, 0.066, 0.068, 0.058, 0.042], m, 20, 30, 0.9);
  SW(g, [[side * 0.048, 0.115, 0.025], [side * 0.058, 0.165, 0.055], [side * 0.042, 0.195, 0.08]], [0.026, 0.025, 0.019], m, 12, 14);
  P(g, 0.06, 0.03, labelTex('PRO', { bg: '#ffffff', fg: '#111', w: 256, h: 128, font: 'italic bold 80px system-ui' }), 0, 0.17, -0.062, 0, PI, 0);
  const lp = []; for (let i = 0; i <= 8; i++) lp.push([(i % 2 ? 1 : -1) * 0.012, 0.012 + i * 0.009, 0.041]);
  TU(g, lp, 0.0022, mat(0xf4f4f4, { roughness: 0.8 }), false, 60);
}
function guantesBox(seed) {
  const g = new THREE.Group();
  const col = [0xc81e2a, 0x1a3a9a, 0x141414][seed % 3];
  const m = mat(col, { roughness: 0.3, env: true, envI: 0.7 });
  const a = grp(g, -0.07, 0, -0.04, 0, 0.35, 0); boxGlove(a, m, 1);
  const b = grp(g, 0.05, 0.057, 0.08, 0, -0.5, 0); const bb = grp(b, 0, 0, 0, 0, 0, PI / 2 * 1); boxGlove(bb, m, -1);
  b.children[0].rotation.set(0, 0, PI / 2);
  b.position.x = 0.14;
  TU(g, [[-0.07, 0.05, 0.0], [0.0, 0.01, 0.07], [0.08, 0.04, 0.1], [0.12, 0.06, 0.1]], 0.0025, mat(0xf4f4f4, { roughness: 0.8 }), false, 40);
  return g;
}

function raquetaMadera(seed) {
  const g = new THREE.Group();
  const wd = C.wood(0xb88a52), dk = C.wood(0x6a4222);
  RB(g, 0.26, 0.03, 0.16, 0.008, C.darkWood(), 0, 0.015, 0);
  RB(g, 0.08, 0.06, 0.06, 0.008, C.darkWood(), 0, 0.06, -0.02);
  const r = grp(g, 0, 0.5, -0.02, -0.06);
  const el = (a, b, hole) => { const s = hole ? new THREE.Path() : new THREE.Shape(); s.absellipse(0, 0, a, b, 0, TAU, hole); return s; };
  const fr = el(0.118, 0.152); fr.holes.push(el(0.102, 0.136, true));
  exNorm(r, fr, 0.014, wd, 0.003);
  const lam = new THREE.Shape(); lam.absellipse(0, 0, 0.111, 0.145, 0, TAU); lam.holes.push(el(0.108, 0.142, true));
  EXS(r, lam, 0.0165, dk, 0, 0, 0, 0, 0, 0, 0.0035);
  const strT = T('strings', 256, 320, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = '#f0ead8'; c.lineWidth = 2.2; for (let x = 6; x < w; x += 13) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 6; y < h; y += 13) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } });
  const sm = mat(0xffffff, { map: strT, transparent: true, alphaTest: 0.3, side: DS, roughness: 0.6 });
  shapeMesh(r, el(0.104, 0.138), sm, 0, 0, 0);
  const th = shp([[-0.07, -0.13], [-0.018, -0.25], [0.018, -0.25], [0.07, -0.13], [0.04, -0.14], [0.0, -0.21], [-0.04, -0.14]]);
  EXS(r, th, 0.014, wd, 0, 0, 0, 0, 0, 0, 0.003);
  CY(r, 0.014, 0.014, 0.05, wd, 0, -0.27, 0, 0, 0, 0, 8);
  const grip = T('grip', 64, 256, (c, w, h) => { c.fillStyle = '#5a3418'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2a160a'; c.lineWidth = 3; for (let y = -64; y < h; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + 16); c.stroke(); } }, true);
  CY(r, 0.0165, 0.0165, 0.15, mat(0xffffff, { map: grip, roughness: 0.8 }), 0, -0.365, 0, 0, 0, 0, 8);
  LA(r, [[0, 0], [0.019, 0], [0.02, 0.006], [0.017, 0.012], [0, 0.012]], dk, 0, -0.452, 0, 8);
  P(r, 0.05, 0.02, labelTex('CHAMPION', { bg: '#b88a52', fg: '#2a1408', w: 256, h: 96, font: 'bold 44px Georgia' }), 0, -0.185, 0.0102);
  // pelota
  const ball = T('tball', 256, 128, (c, w, h) => { c.fillStyle = '#e8f048'; c.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.25})`; c.fillRect(R() * w, R() * h, 2, 1); } c.strokeStyle = '#fafaf0'; c.lineWidth = 5; c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, h / 2 + Math.sin(x / w * TAU * 2) * h * 0.25); c.stroke(); });
  SP(g, 0.033, mat(0xffffff, { map: ball, roughness: 0.95 }), 0.08, 0.063, 0.04, 1, 1, 1, 24);
  return g;
}

function balonAmericano(seed) {
  const g = new THREE.Group();
  const L = 0.28, Rm = 0.085, pts = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([Rm * Math.pow(Math.sin(PI * t), 0.78) + (i === 0 || i === 24 ? 0 : 0), t * L - L / 2]); }
  const tex = T('football', 512, 256, (c, w, h) => {
    c.fillStyle = '#7a3a1a'; c.fillRect(0, 0, w, h);
    const R = rng(8); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${R() < 0.5 ? 0 : 255},${R() < 0.5 ? 60 : 200},0,${R() * 0.12})`; c.beginPath(); c.arc(R() * w, R() * h, 1.2, 0, 7); c.fill(); }
    c.strokeStyle = '#2a1206'; c.lineWidth = 4; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * w / 4, 0); c.lineTo(i * w / 4, h); c.stroke(); }
    c.fillStyle = '#f4f0e6'; c.fillRect(0, h * 0.16, w, 10); c.fillRect(0, h * 0.8, w, 10);
    c.fillStyle = '#f0d890'; c.font = 'bold 22px Georgia'; c.textAlign = 'center'; c.fillText('OFFICIAL', w * 0.125, h * 0.5); c.fillText('LEAGUE', w * 0.625, h * 0.5);
  });
  const b = grp(g, 0, 0.112, 0, 0, 0, PI / 2);
  LA(b, pts, mat(0xffffff, { map: tex, roughness: 0.6 }), 0, 0, 0, 40);
  const lw = mat(0xf6f4ee, { roughness: 0.6 });
  RB(g, 0.1, 0.005, 0.007, 0.002, lw, 0, 0.112 + Rm + 0.001, 0);
  for (let i = 0; i < 8; i++) RB(g, 0.004, 0.005, 0.026, 0.0015, lw, -0.04 + i * 0.0114, 0.112 + Rm, 0);
  LA(g, [[0, 0], [0.05, 0], [0.052, 0.008], [0.028, 0.016], [0.03, 0.036], [0.045, 0.042], [0.04, 0.044], [0, 0.03]], plastic(0xe86a1a), 0, 0, 0, 32);
  return g;
}

function paloGolf(seed) {
  const g = new THREE.Group();
  RB(g, 1.12, 0.03, 0.2, 0.008, C.darkWood(), 0, 0.015, 0);
  P(g, 0.18, 0.045, labelTex('HOYO EN UNO', { bg: '#b8913e', fg: '#2a1a08', w: 512, h: 128, font: 'bold 56px Georgia' }), -0.3, 0.02, 0.1005);
  for (const x of [-0.25, 0.3]) EX(g, [[-0.025, 0], [0.025, 0], [0.025, 0.07], [0.012, 0.07], [0.006, 0.06], [-0.006, 0.06], [-0.012, 0.07], [-0.025, 0.07]], 0.03, C.darkWood(), x, 0.03, -0.03, 0, PI / 2, 0, 0.003);
  const c = grp(g, 0, 0.098, -0.03, 0, 0, 0);
  CY(c, 0.0065, 0.0045, 0.8, C.chrome(), 0.05, 0, 0, 0, 0, PI / 2, 12);
  const grip = T('golfgrip', 64, 256, (x, w, h) => { x.fillStyle = '#1a1a1a'; x.fillRect(0, 0, w, h); x.fillStyle = '#3a3a3a'; for (let y = 0; y < h; y += 6) for (let i = 0; i < w; i += 6) x.fillRect(i + (y / 6 % 2) * 3, y, 2, 2); x.fillStyle = '#c81e2a'; x.fillRect(0, h - 30, w, 6); }, true);
  CY(c, 0.0125, 0.0095, 0.27, mat(0xffffff, { map: grip, roughness: 0.85 }), -0.48, 0, 0, 0, 0, PI / 2, 16);
  LA(c, [[0, 0], [0.013, 0], [0.0135, 0.004], [0, 0.006]], mat(0x1a1a1a), -0.615, 0, 0, 20).rotation.z = PI / 2;
  // cabeza del driver
  const head = sphereDeform((v) => { let { x, y, z } = v; x *= 1 + 0.25 * z; if (y < 0) y *= 0.55; v.set(x, y, z); }, 32, 24);
  const hd = add(c, head, mat(0x1a1c20, { roughness: 0.2, metalness: 0.6, env: true, envI: 1 }), 0.49, 0.012, 0.04, 0, -0.3, 0); hd.scale.set(0.058, 0.034, 0.048);
  CY(c, 0.009, 0.0065, 0.07, mat(0x1a1c20, { roughness: 0.3, metalness: 0.6, env: true }), 0.45, 0.01, 0.0, 0, 0, PI / 2 - 0.4, 12);
  RB(c, 0.07, 0.036, 0.004, 0.002, C.steel(), 0.5, 0.008, 0.087, 0, -0.3, 0);
  // pelota en tee
  LA(g, [[0, 0], [0.003, 0], [0.003, 0.04], [0.009, 0.05], [0.01, 0.054], [0, 0.052]], mat(0xf4f0e6, { roughness: 0.5 }), 0.4, 0.03, 0.05, 16);
  const dim = T('dimples', 256, 128, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#b8b8b8'; for (let y = 4; y < h; y += 8) for (let i = 4 + (y / 8 % 2) * 4; i < w; i += 8) { x.beginPath(); x.arc(i, y, 2.6, 0, 7); x.fill(); } }, true);
  SP(g, 0.0214, mat(0xffffff, { roughness: 0.35, bumpMap: dim, bumpScale: 0.6, env: true, envI: 0.5 }), 0.4, 0.105, 0.05, 1, 1, 1, 28);
  return g;
}

function mancuernas(seed) {
  const g = new THREE.Group();
  RB(g, 0.5, 0.012, 0.36, 0.005, mat(0x2a2a2a, { roughness: 1 }), 0, 0.006, 0);
  const knurl = T('knurl', 64, 64, (x, w, h) => { x.fillStyle = '#cfd3d8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#6a6e74'; x.lineWidth = 1; for (let i = -64; i < 64; i += 5) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, h); x.stroke(); x.beginPath(); x.moveTo(i + 64, 0); x.lineTo(i, h); x.stroke(); } }, true);
  knurl.repeat.set(4, 6);
  const km = mat(0xffffff, { map: knurl, metalness: 0.9, roughness: 0.35, env: true, envI: 1 });
  const rub = mat(0x1a1a1a, { roughness: 0.85 });
  const bell = (x, z, ry, s, kg) => {
    const d = grp(g, x, 0.055 * s, z, 0, ry, 0);
    CY(d, 0.016 * s, 0.016 * s, 0.15 * s, km, 0, 0, 0, 0, 0, PI / 2, 16);
    for (const sd of [-1, 1]) {
      const hx = grp(d, sd * 0.11 * s, 0, 0, PI / 6, 0, 0);
      add(hx, new THREE.CylinderGeometry(0.058 * s, 0.058 * s, 0.075 * s, 6), rub, 0, 0, 0, 0, 0, PI / 2);
      CY(hx, 0.028 * s, 0.028 * s, 0.078 * s, C.chrome(), 0, 0, 0, 0, 0, PI / 2, 24);
      P(d, 0.05 * s, 0.05 * s, labelTex(kg, { bg: '#1a1a1a', fg: '#e8e8e8', w: 128, h: 128, font: 'bold 60px system-ui' }), sd * 0.149 * s, 0, 0, 0, sd * PI / 2, 0);
      CY(d, 0.02 * s, 0.02 * s, 0.012 * s, C.chrome(), sd * 0.065 * s, 0, 0, 0, 0, PI / 2, 20);
    }
  };
  bell(0, -0.08, 0.1, 1, '10');
  bell(0.01, 0.08, -0.05, 1, '10');
  return g;
}

function tablaSurf(seed) {
  const g = new THREE.Group(), k = seed % 3;
  const L = 1.8, half = (y) => { const t = y / L; return t < 0.02 ? 0.14 + t * 2 : 0.245 * Math.pow(Math.sin(PI * Math.min(1, 0.18 + t * 0.9)), 0.7) * (1 - Math.pow(t, 6)) + 0.001; };
  const pts = []; for (let i = 0; i <= 40; i++) { const y = 0.02 + i / 40 * (L - 0.02); pts.push([half(y), y]); }
  const outline = [[-0.13, 0], [0.13, 0], ...pts, ...pts.slice().reverse().map(([x, y]) => [-x, y])];
  const cols = [['#f4f2ec', '#1e7ac8', '#f27a1a'], ['#f2d21a', '#c81e2a', '#141414'], ['#2ab8a8', '#f4f2ec', '#e8385a']][k];
  const tex = T('surf' + k, 128, 512, (c, w, h) => {
    c.fillStyle = cols[0]; c.fillRect(0, 0, w, h);
    c.fillStyle = cols[1]; c.fillRect(0, h * 0.6, w, 40); c.fillStyle = cols[2]; c.fillRect(0, h * 0.6 + 44, w, 12);
    c.fillStyle = cols[1]; c.beginPath(); c.moveTo(0, h * 0.9); c.lineTo(w, h * 0.78); c.lineTo(w, h); c.lineTo(0, h); c.fill();
    c.fillStyle = '#6a4a2a'; c.fillRect(w / 2 - 1, 0, 2, h);
    c.save(); c.translate(w / 2, h * 0.36); c.rotate(-PI / 2); c.fillStyle = cols[2]; c.font = 'italic bold 30px system-ui'; c.textAlign = 'center'; c.fillText('OLAS', 0, 10); c.restore();
  });
  RB(g, 0.6, 0.04, 0.34, 0.01, C.darkWood(), 0, 0.02, 0);
  RB(g, 0.08, 1.1, 0.06, 0.01, C.darkWood(), 0, 0.59, -0.15);
  RB(g, 0.3, 0.05, 0.08, 0.02, mat(0x2a2a2a, { roughness: 0.9 }), 0, 1.02, -0.11);
  RB(g, 0.3, 0.05, 0.1, 0.02, mat(0x2a2a2a, { roughness: 0.9 }), 0, 0.065, 0.07);
  const b = grp(g, 0, 0.055, 0.08, -0.12, 0, 0);
  exNorm(b, shp(outline), 0.02, mat(0xffffff, { map: tex, roughness: 0.2, env: true, envI: 0.6 }), 0.02, 0, 0, 0, 0, 0, 0, 4);
  const fin = [[0, 0], [0.11, 0], [0.06, 0.035], [0.03, 0.1], [0.012, 0.11]];
  const fm = plastic(0x1a1a1a, 0.3);
  for (const [x, y, s] of [[0, 0.1, 1], [-0.1, 0.22, 0.85], [0.1, 0.22, 0.85]]) EX(b, fin.map(([a, c]) => [a * s, c * s]), 0.006, fm, x, y + 0.1 * s, -0.03, -PI / 2, 0, -PI / 2 * 0 , 0.002).rotation.set(0, -PI / 2, -PI / 2);
  return g;
}

function balonBasquet(seed) {
  const g = new THREE.Group();
  const tex = T('bball', 512, 256, (c, w, h) => {
    c.fillStyle = '#d8661e'; c.fillRect(0, 0, w, h);
    const R = rng(4); for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(${R() < 0.5 ? 60 : 255},${R() < 0.5 ? 20 : 140},0,${R() * 0.18})`; c.beginPath(); c.arc(R() * w, R() * h, 1.3, 0, 7); c.fill(); }
    c.strokeStyle = '#1a0e08'; c.lineWidth = 5;
    for (const x of [w * 0.25, w * 0.75]) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    c.beginPath(); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
    for (const cx of [0, w / 2, w]) for (const s of [-1, 1]) { c.beginPath(); for (let y = 0; y <= h; y += 4) { const lat = (y / h - 0.5) * PI; c.lineTo(cx + s * w * 0.14 * Math.cos(lat), y); } c.stroke(); }
    c.fillStyle = '#1a0e08'; c.font = 'bold 20px system-ui'; c.textAlign = 'center'; c.fillText('OFICIAL', w * 0.375, h * 0.4); c.font = '14px system-ui'; c.fillText('INDOOR · OUTDOOR', w * 0.375, h * 0.62);
  });
  LA(g, [[0, 0], [0.07, 0], [0.072, 0.01], [0.05, 0.02], [0.055, 0.04], [0.062, 0.045], [0.05, 0.047], [0, 0.03]], C.darkWood(), 0, 0, 0, 40);
  const b = SP(g, 0.12, mat(0xffffff, { map: tex, roughness: 0.75 }), 0, 0.045 + 0.1, 0, 1, 1, 1, 48);
  b.rotation.y = -PI / 4;
  return g;
}

function cascoAmericano(seed) {
  const g = new THREE.Group(), k = seed % 3;
  const [base, stripe, logo] = [['#8a1a1a', '#f4f0e6', '#f2c21a'], ['#1a2a5a', '#c0c4cc', '#e87a1a'], ['#e8e8e8', '#1a5a2a', '#1a5a2a']][k];
  const tex = T('helm' + k, 512, 256, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (const x of [w * 0.25, w * 0.75]) { c.fillStyle = stripe; c.fillRect(x - 14, 0, 28, h); c.fillStyle = base; c.fillRect(x - 3, 0, 6, h); }
    for (const x of [2, w / 2, w - 2]) { c.fillStyle = logo; c.beginPath(); c.moveTo(x - 40, h * 0.62); c.lineTo(x, h * 0.3); c.lineTo(x + 40, h * 0.62); c.lineTo(x + 20, h * 0.62); c.lineTo(x, h * 0.45); c.lineTo(x - 20, h * 0.62); c.fill(); }
  });
  const sm = mat(0xffffff, { map: tex, roughness: 0.15, env: true, envI: 0.9, side: DS });
  RB(g, 0.3, 0.03, 0.3, 0.008, C.darkWood(), 0, 0.015, 0);
  const h = grp(g, 0, 0.145, 0);
  const sc = [0.125, 0.135, 0.15];
  add(h, new THREE.SphereGeometry(1, 48, 24, 0, TAU, 0, PI / 2), sm).scale.set(...sc);
  add(h, new THREE.SphereGeometry(1, 40, 12, PI / 2 + PI * 0.28, TAU - PI * 0.56, PI / 2, PI * 0.3), sm).scale.set(...sc);
  add(h, new THREE.SphereGeometry(0.96, 32, 16, 0, TAU, 0, PI * 0.78), mat(0x2a2a2a, { roughness: 0.9, side: THREE.BackSide })).scale.set(...sc);
  for (const s of [-1, 1]) CY(h, 0.012, 0.012, 0.006, mat(0x111111), s * 0.123, -0.03, 0.01, 0, 0, PI / 2, 16);
  const fmM = plastic([0x9a9a9a, 0x1a1a1a, 0xf4f4f4][k], 0.35);
  const ear = (y, zf) => [[-0.12, y, 0.045], [-0.1, y, 0.12], [-0.05, y, zf], [0, y, zf + 0.01], [0.05, y, zf], [0.1, y, 0.12], [0.12, y, 0.045]];
  TU(h, ear(-0.02, 0.17), 0.0055, fmM, false, 60);
  TU(h, ear(-0.065, 0.165), 0.0055, fmM, false, 60);
  TU(h, [[0, 0.0, 0.156], [0, -0.04, 0.178], [0, -0.075, 0.172], [0, -0.1, 0.14]], 0.0055, fmM, false, 20);
  for (const s of [-1, 1]) TU(h, [[s * 0.055, -0.012, 0.155], [s * 0.056, -0.045, 0.172], [s * 0.05, -0.075, 0.162], [s * 0.035, -0.095, 0.135]], 0.0055, fmM, false, 20);
  TU(h, [[-0.1, -0.1, 0.02], [-0.05, -0.12, 0.1], [0, -0.125, 0.12], [0.05, -0.12, 0.1], [0.1, -0.1, 0.02]], 0.004, mat(0xf4f4f4, { roughness: 0.6 }), false, 30);
  return g;
}

//@@TAIL
export const ITEMS_B = [
  { id: 'alebrije', name: 'Alebrije Oaxaqueño', category: 'art', rarity: 'rare', baseValue: 650, desc: 'Criatura fantástica tallada en copal y pintada a mano en Oaxaca.' },
  { id: 'catrina', name: 'Catrina de Barro', category: 'art', rarity: 'rare', baseValue: 700, desc: 'Elegante calavera de barro policromado con sombrero de flores.' },
  { id: 'mascara_tallada', name: 'Máscara Tallada de Diablo', category: 'art', rarity: 'rare', baseValue: 480, desc: 'Máscara de danza tradicional tallada en madera y laqueada.' },
  { id: 'reloj_cucu', name: 'Reloj Cucú Selva Negra', category: 'art', rarity: 'epic', baseValue: 1900, desc: 'Reloj de cuco tallado en la Selva Negra, con pesas de piña.' },
  { id: 'escultura_abstracta', name: 'Escultura Abstracta de Bronce', category: 'art', rarity: 'epic', baseValue: 2600, desc: 'Cinta de bronce retorcida con pátina verde, firmada por el autor.' },
  { id: 'vitral', name: 'Vitral Emplomado', category: 'art', rarity: 'epic', baseValue: 2100, desc: 'Ventana de arco con vidrios de colores unidos con plomo.' },
  { id: 'arbol_vida', name: 'Árbol de la Vida de Barro', category: 'art', rarity: 'rare', baseValue: 900, desc: 'Candelabro de barro de Metepec lleno de flores, hojas y palomas.' },
  { id: 'plato_talavera', name: 'Plato de Talavera', category: 'art', rarity: 'common', baseValue: 140, desc: 'Plato de cerámica poblana esmaltada a mano.' },
  { id: 'espejo_sol', name: 'Espejo Sol de Hojalata', category: 'art', rarity: 'rare', baseValue: 380, desc: 'Espejo con rayos de hojalata repujada y pintada de Oaxaca.' },
  { id: 'busto_marmol', name: 'Busto de Mármol', category: 'art', rarity: 'legendary', baseValue: 7500, desc: 'Busto clásico de emperador romano esculpido en mármol blanco.' },
  { id: 'mascara_lucha', name: 'Máscara de Lucha Libre', category: 'sports', rarity: 'rare', baseValue: 450, desc: 'Máscara de luchador usada en función, con agujetas y flamas bordadas.' },
  { id: 'cinturon_campeon', name: 'Cinturón de Campeonato', category: 'sports', rarity: 'epic', baseValue: 3000, desc: 'Cinturón de campeón mundial con placa dorada y piedras rojas.' },
  { id: 'guantes_box', name: 'Guantes de Box', category: 'sports', rarity: 'rare', baseValue: 800, desc: 'Par de guantes de piel usados en una pelea por el título.' },
  { id: 'raqueta_madera', name: 'Raqueta de Madera', category: 'sports', rarity: 'common', baseValue: 180, desc: 'Raqueta de tenis laminada de los años 70, con pelota incluida.' },
  { id: 'balon_americano', name: 'Balón de Fútbol Americano', category: 'sports', rarity: 'common', baseValue: 150, desc: 'Balón de piel con agujetas blancas sobre su tee de pateo.' },
  { id: 'palo_golf', name: 'Palo de Golf', category: 'sports', rarity: 'common', baseValue: 200, desc: 'Driver de colección montado en base de madera con pelota y tee.' },
  { id: 'mancuernas', name: 'Mancuernas Hexagonales', category: 'sports', rarity: 'common', baseValue: 120, desc: 'Par de mancuernas de 10 kg con mango moleteado cromado.' },
  { id: 'tabla_surf', name: 'Tabla de Surf', category: 'sports', rarity: 'rare', baseValue: 900, desc: 'Tabla de surf vintage con tres quillas, en su soporte de exhibición.' },
  { id: 'balon_basquet', name: 'Balón de Básquetbol', category: 'sports', rarity: 'common', baseValue: 160, desc: 'Balón oficial de básquetbol sobre base de madera.' },
  { id: 'casco_americano', name: 'Casco de Fútbol Americano', category: 'sports', rarity: 'rare', baseValue: 600, desc: 'Casco con careta y franja central, firmado por el mariscal de campo.' },
];
const BUILDERS = {
  mascara_lucha: mascaraLucha, cinturon_campeon: cinturonCampeon, guantes_box: guantesBox, raqueta_madera: raquetaMadera, balon_americano: balonAmericano,
  palo_golf: paloGolf, mancuernas, tabla_surf: tablaSurf, balon_basquet: balonBasquet, casco_americano: cascoAmericano,
  alebrije, catrina, mascara_tallada: mascaraTallada, reloj_cucu: relojCucu, escultura_abstracta: esculturaAbstracta,
  vitral, arbol_vida: arbolVida, plato_talavera: platoTalavera, espejo_sol: espejoSol, busto_marmol: bustoMarmol,
};
export function registerB(reg) {
  for (const it of ITEMS_B) if (BUILDERS[it.id]) reg(it.id, BUILDERS[it.id]);
}
export const BUILT_IDS = () => Object.keys(BUILDERS);
