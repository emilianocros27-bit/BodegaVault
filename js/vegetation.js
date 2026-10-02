// Vegetación con "tarjetas" de hojas (planos con transparencia) en lugar de esferas sobre palos.
// Árboles, arbustos, pasto y flores se dibujan instanciados para que el rendimiento aguante.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const rnd = (R, a, b) => a + R() * (b - a);
function rng(seed) { let a = seed | 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function tex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
// ---------------- texturas ----------------
function leafCluster(hue, key) {
  return tex(256, 256, (c, w) => {
    const R = rng(key);
    for (let i = 0; i < 140; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * w * 0.42;
      const x = w / 2 + Math.cos(a) * d, y = w / 2 + Math.sin(a) * d * 0.9;
      const L = 14 + R() * 16, rot = R() * Math.PI * 2;
      const l = 28 + R() * 22 - d / w * 18;
      c.save(); c.translate(x, y); c.rotate(rot);
      c.fillStyle = `hsl(${hue + R() * 16 - 8},${45 + R() * 20}%,${l}%)`;
      c.beginPath(); c.moveTo(0, -L); c.quadraticCurveTo(L * 0.55, 0, 0, L); c.quadraticCurveTo(-L * 0.55, 0, 0, -L); c.fill();
      c.strokeStyle = `hsla(${hue},40%,${l - 10}%,0.6)`; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -L); c.lineTo(0, L); c.stroke();
      c.restore();
    }
  });
}
const barkTex = tex(128, 256, (c, w, h) => {
  const R = rng(5);
  c.fillStyle = '#5a4432'; c.fillRect(0, 0, w, h);
  for (let i = 0; i < 90; i++) { c.strokeStyle = `rgba(${R() < 0.5 ? 25 : 120},${R() < 0.5 ? 18 : 95},${R() < 0.5 ? 10 : 70},${0.3 + R() * 0.4})`; c.lineWidth = 1 + R() * 3; const x = R() * w; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= h; y += 16) c.lineTo(x + Math.sin(y * 0.05 + i) * 4 + (R() - 0.5) * 3, y); c.stroke(); }
});
barkTex.wrapS = barkTex.wrapT = THREE.RepeatWrapping;
const grassTex = tex(128, 128, (c, w, h) => {
  const R = rng(9);
  for (let i = 0; i < 46; i++) {
    const x = 6 + R() * (w - 12), hh = h * (0.45 + R() * 0.55), bend = (R() - 0.5) * 26;
    c.fillStyle = `hsl(${78 + R() * 30},${40 + R() * 20}%,${24 + R() * 22}%)`;
    c.beginPath(); c.moveTo(x - 2.5, h); c.quadraticCurveTo(x + bend * 0.4, h - hh * 0.6, x + bend, h - hh); c.quadraticCurveTo(x + bend * 0.4 + 1.5, h - hh * 0.6, x + 2.5, h); c.fill();
  }
});
function flowerTex(col, key) {
  return tex(128, 128, (c, w, h) => {
    const R = rng(key);
    for (let i = 0; i < 5; i++) {
      const x = 20 + R() * 88, top = 20 + R() * 50;
      c.strokeStyle = '#3f6a2a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x + (R() - 0.5) * 10, h); c.quadraticCurveTo(x + (R() - 0.5) * 20, (h + top) / 2, x, top); c.stroke();
      c.fillStyle = '#4f7a34'; c.beginPath(); c.ellipse(x - 6, (h + top) / 2 + 10, 7, 3, 0.6, 0, 7); c.fill();
      c.fillStyle = col;
      const n = 5 + ((R() * 3) | 0), r = 7 + R() * 5;
      for (let p = 0; p < n; p++) { const a = (p / n) * Math.PI * 2; c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.8, top + Math.sin(a) * r * 0.8, r * 0.7, r * 0.38, a, 0, 7); c.fill(); }
      c.fillStyle = '#f2c230'; c.beginPath(); c.arc(x, top, r * 0.35, 0, 7); c.fill();
    }
  });
}
const LEAF_TEX = [leafCluster(105, 1), leafCluster(90, 2), leafCluster(120, 3), leafCluster(70, 4)];
const leafMat = (i) => new THREE.MeshStandardMaterial({ map: LEAF_TEX[i % LEAF_TEX.length], alphaTest: 0.45, roughness: 0.85 });
const leafDepth = (i) => new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: LEAF_TEX[i % LEAF_TEX.length], alphaTest: 0.45 });
const barkMat = new THREE.MeshStandardMaterial({ map: barkTex, roughness: 0.95 });

// ---------------- geometrías ----------------
// duplica cada triángulo con el orden invertido: ambas caras visibles sin invertir la normal (no se ven negras)
function doubleFaced(geo) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const n = g.attributes.position.count;
  const out = new THREE.BufferGeometry();
  for (const name of Object.keys(g.attributes)) {
    const a = g.attributes[name], it = a.itemSize, src = a.array;
    const arr = new Float32Array(src.length * 2); arr.set(src);
    for (let t = 0; t < n / 3; t++) for (let v = 0; v < 3; v++) { const from = (t * 3 + (2 - v)) * it, to = (n + t * 3 + v) * it; for (let k = 0; k < it; k++) arr[to + k] = src[from + k]; }
    out.setAttribute(name, new THREE.BufferAttribute(arr, it));
  }
  return out;
}
// cilindro curvo y afinado a lo largo de una curva (tronco / ramas)
function limb(points, r0, r1, radial = 7, segs = 8) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPointAt(i / segs), r = r0 + (r1 - r0) * (i / segs);
    for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r).add(c); p.setXYZ(k, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals();
  const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 2, uv.getY(i) * (r0 * 20));
  return geo;
}
// tarjetas de hojas alrededor de un volumen; normales apuntando hacia afuera del centro (sombreado suave)
function cards(centers, count, size, R, center) {
  const geos = [];
  for (let i = 0; i < count; i++) {
    const c = centers[(R() * centers.length) | 0];
    const g = new THREE.PlaneGeometry(size * rnd(R, 0.8, 1.2), size * rnd(R, 0.8, 1.2));
    const e = new THREE.Euler(rnd(R, -1.2, 1.2), R() * Math.PI * 2, rnd(R, -0.6, 0.6));
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(e));
    g.translate(c.x + rnd(R, -1, 1) * c.r, c.y + rnd(R, -0.7, 0.7) * c.r, c.z + rnd(R, -1, 1) * c.r);
    const n = g.attributes.normal, p = g.attributes.position, v = new THREE.Vector3();
    for (let k = 0; k < p.count; k++) { v.fromBufferAttribute(p, k).sub(center).normalize(); v.y = v.y * 0.7 + 0.3; v.normalize(); n.setXYZ(k, v.x, v.y, v.z); }
    geos.push(g);
  }
  return mergeGeometries(geos);
}
export function treeVariant(seed, kind = 'broad') {
  const R = rng(seed * 97 + 3);
  const H = kind === 'tall' ? rnd(R, 5.5, 7) : rnd(R, 3.8, 5);
  const bend = new THREE.Vector3(rnd(R, -0.3, 0.3), 0, rnd(R, -0.3, 0.3));
  const trunkPts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(bend.x * 0.3, H * 0.35, bend.z * 0.3), new THREE.Vector3(bend.x, H * 0.7, bend.z)];
  const barks = [limb(trunkPts, 0.2, 0.08, 9, 10)];
  // raíces
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + R(); barks.push(limb([new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(Math.cos(a) * 0.25, 0.08, Math.sin(a) * 0.25), new THREE.Vector3(Math.cos(a) * 0.45, -0.02, Math.sin(a) * 0.45)], 0.1, 0.02, 5, 4)); }
  const centers = [];
  const top = trunkPts[2];
  const nb = kind === 'tall' ? 7 : 5;
  for (let i = 0; i < nb; i++) {
    const a = (i / nb) * Math.PI * 2 + rnd(R, -0.3, 0.3);
    const y0 = H * rnd(R, 0.45, 0.72);
    const len = kind === 'tall' ? rnd(R, 0.9, 1.5) : rnd(R, 1.4, 2.1);
    const start = new THREE.Vector3(bend.x * y0 / (H * 0.7), y0, bend.z * y0 / (H * 0.7));
    const mid = start.clone().add(new THREE.Vector3(Math.cos(a) * len * 0.5, len * 0.45, Math.sin(a) * len * 0.5));
    const end = start.clone().add(new THREE.Vector3(Math.cos(a) * len, len * 0.75, Math.sin(a) * len));
    barks.push(limb([start, mid, end], 0.07, 0.02, 6, 6));
    centers.push({ x: end.x, y: end.y + 0.2, z: end.z, r: kind === 'tall' ? 0.8 : 1.05 });
    centers.push({ x: mid.x, y: mid.y + 0.3, z: mid.z, r: 0.7 });
  }
  centers.push({ x: top.x, y: top.y + 0.6, z: top.z, r: kind === 'tall' ? 1.0 : 1.3 });
  const cc = new THREE.Vector3(top.x, H * 0.8, top.z);
  const leaves = doubleFaced(cards(centers, kind === 'tall' ? 70 : 85, kind === 'tall' ? 1.3 : 1.55, R, cc));
  return { bark: mergeGeometries(barks), leaves, height: H };
}
export function bushGeometry(seed, size = 1) {
  const R = rng(seed * 31 + 7);
  const centers = [];
  for (let i = 0; i < 5; i++) centers.push({ x: rnd(R, -0.35, 0.35) * size, y: rnd(R, 0.3, 0.6) * size, z: rnd(R, -0.35, 0.35) * size, r: 0.35 * size });
  return doubleFaced(cards(centers, 26, 0.75 * size, R, new THREE.Vector3(0, 0.2 * size, 0)));
}

// ---------------- bosque instanciado ----------------
export function createForest(scene) {
  const variants = [treeVariant(1), treeVariant(2), treeVariant(3, 'tall'), treeVariant(4), treeVariant(5, 'tall')];
  const lists = variants.map(() => []);
  return {
    add(x, z, s) { const i = Math.floor(Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % variants.length); lists[i].push({ x, z, s, ry: (x * 7 + z * 3) % 6.28 }); },
    build() {
      const o = new THREE.Object3D();
      variants.forEach((v, i) => {
        const L = lists[i]; if (!L.length) return;
        const bark = new THREE.InstancedMesh(v.bark, barkMat, L.length);
        const leaves = new THREE.InstancedMesh(v.leaves, leafMat(i), L.length);
        leaves.customDepthMaterial = leafDepth(i);
        L.forEach((t, k) => { o.position.set(t.x, 0, t.z); o.rotation.set(0, t.ry, 0); o.scale.setScalar(t.s * 0.85); o.updateMatrix(); bark.setMatrixAt(k, o.matrix); leaves.setMatrixAt(k, o.matrix); });
        bark.castShadow = leaves.castShadow = true; bark.receiveShadow = leaves.receiveShadow = true;
        scene.add(bark, leaves);
      });
    },
  };
}
const bushGeos = [bushGeometry(1), bushGeometry(2), bushGeometry(3)];
export function makeBush(size = 1, seed = 1) {
  const m = new THREE.Mesh(bushGeos[seed % 3], leafMat(seed));
  m.customDepthMaterial = leafDepth(seed); m.scale.setScalar(size); m.castShadow = m.receiveShadow = true;
  return m;
}
// pasto y flores silvestres: planos cruzados instanciados
function crossGeo(w, h) {
  const a = new THREE.PlaneGeometry(w, h); a.translate(0, h / 2, 0);
  const b = a.clone(); b.rotateY(Math.PI / 3);
  const c = a.clone(); c.rotateY(-Math.PI / 3);
  const g = mergeGeometries([a, b, c]);
  const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return doubleFaced(g);
}
export function grassField(positions) {
  const m = new THREE.InstancedMesh(crossGeo(0.5, 0.42), new THREE.MeshStandardMaterial({ map: grassTex, alphaTest: 0.4, roughness: 1 }), positions.length);
  const o = new THREE.Object3D();
  positions.forEach(([x, z, s, r], i) => { o.position.set(x, -0.02, z); o.rotation.set(0, r, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
  m.receiveShadow = true;
  return m;
}
const FLOWER_COLS = ['#e0413a', '#f2c230', '#e86fb0', '#ffffff', '#f08a2a', '#9b5de5'];
export const FLOWER_TEX = FLOWER_COLS.map((c, i) => flowerTex(c, i + 11));
export function flowerField(positions, colorIdx) {
  const m = new THREE.InstancedMesh(crossGeo(0.45, 0.45), new THREE.MeshStandardMaterial({ map: FLOWER_TEX[colorIdx % FLOWER_TEX.length], alphaTest: 0.4, roughness: 0.9 }), positions.length);
  const o = new THREE.Object3D();
  positions.forEach(([x, y, z, s, r], i) => { o.position.set(x, y, z); o.rotation.set(0, r, 0); o.scale.setScalar(s); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
  return m;
}
export function flowerPatch(parent, x, y, z, w, d, n, seed) {
  const R = rng(seed);
  const byCol = {};
  for (let i = 0; i < n; i++) { const c = (R() * FLOWER_COLS.length) | 0; (byCol[c] ||= []).push([x + rnd(R, -w / 2, w / 2), y, z + rnd(R, -d / 2, d / 2), rnd(R, 0.6, 1), R() * 6]); }
  for (const [c, list] of Object.entries(byCol)) parent.add(flowerField(list, +c));
}
// planta de maceta con hojas alargadas (no esferas)
const bladeTex = tex(64, 256, (c, w, h) => {
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#2f5a2a'); g.addColorStop(0.5, '#5a9a44'); g.addColorStop(1, '#2f5a2a');
  c.fillStyle = g; c.beginPath(); c.moveTo(w / 2, 0); c.quadraticCurveTo(w, h * 0.45, w / 2, h); c.quadraticCurveTo(0, h * 0.45, w / 2, 0); c.fill();
  c.strokeStyle = 'rgba(220,240,180,0.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(w / 2, 4); c.lineTo(w / 2, h - 4); c.stroke();
});
export function leafyPlant(size = 1, seed = 1, color) {
  const R = rng(seed * 13);
  const geos = [];
  const n = 14;
  for (let i = 0; i < n; i++) {
    const L = size * rnd(R, 0.45, 0.8);
    const g = new THREE.PlaneGeometry(size * 0.16, L, 1, 6);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) { const y = p.getY(k) + L / 2; p.setY(k, y); p.setZ(k, -Math.pow(y / L, 2) * L * 0.45); }
    g.rotateX(-rnd(R, 0.1, 0.5));
    g.rotateY((i / n) * Math.PI * 2 + R() * 0.4);
    geos.push(g);
  }
  const merged = mergeGeometries(geos); merged.computeVertexNormals();
  const nm = merged.attributes.normal; for (let i = 0; i < nm.count; i++) nm.setY(i, Math.abs(nm.getY(i)) + 0.4); merged.normalizeNormals();
  const geo = doubleFaced(merged);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: bladeTex, alphaTest: 0.4, roughness: 0.7, color: color ?? 0xffffff }));
  m.castShadow = true;
  return m;
}
// ---------------- suculentas ----------------
const spineTex = tex(128, 128, (c, w) => {
  c.fillStyle = '#4f8a3c'; c.fillRect(0, 0, w, w);
  const R = rng(55);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '20,50,15' : '140,190,100'},${R() * 0.18})`; c.fillRect(R() * w, R() * w, 2, 2); }
  for (let y = 8; y < w; y += 21) for (let x = (y / 21 % 2) * 10 + 5; x < w; x += 21) {
    c.fillStyle = '#d9cf9a'; c.beginPath(); c.arc(x, y, 2.6, 0, 7); c.fill();
    c.strokeStyle = 'rgba(245,240,215,0.9)'; c.lineWidth = 1;
    for (let k = 0; k < 4; k++) { const a = R() * 6.28; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 7, y + Math.sin(a) * 7); c.stroke(); }
  }
}, true);
const cactusMat = (c = 0xc8e4b4) => new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.55, color: c });
// cactus columnar/barril con costillas (lathe deformado), para macetas
function ribbed(profile, ribs, depth, seg = 40) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const a = Math.atan2(v.z, v.x), r = Math.hypot(v.x, v.z); const k = 1 - depth + depth * Math.pow(Math.abs(Math.cos(a * ribs / 2)), 0.6); p.setXYZ(i, Math.cos(a) * r * k, v.y, Math.sin(a) * r * k); }
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ribs / 2, uv.getY(i) * 2);
  g.computeVertexNormals();
  return g;
}
export function cactusMesh(size = 1, kind = 'column', seed = 1) {
  const g = new THREE.Group(), m = cactusMat(), R = rng(seed * 7 + 1);
  if (kind === 'barrel') {
    const b = new THREE.Mesh(ribbed([[0, 0], [0.12, 0.01], [0.17, 0.08], [0.18, 0.16], [0.15, 0.25], [0.08, 0.3], [0, 0.31]], 18, 0.12), m); b.scale.setScalar(size); g.add(b);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(0.04 * size, 0.05 * size, 10, 1, true), new THREE.MeshStandardMaterial({ color: 0xe8508a, side: THREE.DoubleSide, roughness: 0.6 })); fl.position.y = 0.31 * size; fl.rotation.x = Math.PI; g.add(fl);
  } else {
    const col = (h, r) => ribbed([[0, 0], [r * 0.95, 0.01], [r, 0.1], [r, h - r * 0.9], [r * 0.8, h - r * 0.3], [r * 0.4, h - 0.02], [0, h]], 10, 0.14);
    const main = new THREE.Mesh(col(0.75, 0.075), m); main.scale.setScalar(size); g.add(main);
    // brazos que salen de lado y suben (saguaro chico)
    for (const [sgn, y0, h] of [[1, 0.28, 0.32], [-1, 0.4, 0.26]]) {
      if (R() < 0.15) continue;
      const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, y0, 0), new THREE.Vector3(sgn * 0.11, y0 + 0.02, 0), new THREE.Vector3(sgn * 0.15, y0 + 0.1, 0), new THREE.Vector3(sgn * 0.15, y0 + h, 0)].map(v => v.multiplyScalar(size)));
      const arm = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.05 * size, 10, false), m); g.add(arm);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.05 * size, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), m); tip.position.set(sgn * 0.15 * size, (y0 + h) * size, 0); g.add(tip);
    }
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
// nopal: pencas ovaladas y carnosas con areolas, unidas en cadena
export function nopalMesh(size = 1, seed = 1) {
  const R = rng(seed * 31 + 5), g = new THREE.Group(), m = cactusMat(0xd8f4c4);
  const padGeo = new THREE.SphereGeometry(1, 24, 16); padGeo.scale(0.17, 0.25, 0.045);
  { const p = padGeo.attributes.position, v = new THREE.Vector3(); for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); v.z *= 1 - 0.35 * Math.abs(v.y / 0.25); v.x *= 1 + 0.08 * (v.y / 0.25); p.setXYZ(i, v.x, v.y, v.z); } padGeo.computeVertexNormals(); }
  const add = (parent, y, rz, s, depth) => {
    const piv = new THREE.Group(); piv.position.y = y; piv.rotation.z = rz; piv.rotation.y = (R() - 0.5) * 0.6; parent.add(piv);
    const pad = new THREE.Mesh(padGeo, m); pad.scale.setScalar(s); pad.position.y = 0.23 * s; pad.castShadow = pad.receiveShadow = true; piv.add(pad);
    if (depth > 0) { const n = depth > 1 ? 2 : 1 + (R() < 0.5 ? 1 : 0); for (let k = 0; k < n; k++) add(piv, 0.44 * s, (k - (n - 1) / 2) * 0.8 + (R() - 0.5) * 0.3, s * (0.82 + R() * 0.12), depth - 1); }
    else if (R() < 0.6) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.03 * s * 1.4, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc8285a, roughness: 0.5 })); t.scale.y = 1.3; t.position.y = 0.48 * s; piv.add(t); }
  };
  add(g, 0, 0, size, 3);
  return g;
}
// agave: pencas carnosas, acanaladas, con borde de espinas y punta oscura
export function agaveMesh(size = 1) {
  const geos = [];
  const n = 22;
  for (let i = 0; i < n; i++) {
    const L = size * (0.55 + ((i * 7) % 5) * 0.08), Wd = 0.13 * size;
    const g = new THREE.CylinderGeometry(1, 1, L, 10, 10, false); g.translate(0, L / 2, 0);
    const p = g.attributes.position;
    for (let k = 0; k < p.count; k++) {
      const y = p.getY(k), t = y / L; let x = p.getX(k), z = p.getZ(k);
      const w = Wd * Math.sin(Math.PI * Math.min(1, (1 - t) * 1.15 + 0.05)) * (1 - t * 0.35);
      x = x * w; z = z * w * 0.55; if (z > 0) z *= 0.4;           // cara superior acanalada (cóncava)
      z += Math.pow(t, 2) * L * 0.42;                               // se arquea hacia afuera
      p.setXYZ(k, x, y, z);
    }
    const tilt = 0.15 + ((i * 5) % 7) * 0.12;
    g.rotateX(tilt); g.rotateY((i / n) * Math.PI * 2 * 1.618);
    geos.push(g);
  }
  const geo = mergeGeometries(geos); geo.computeVertexNormals();
  const cols = new Float32Array(geo.attributes.position.count * 3), p = geo.attributes.position;
  let maxY = 0; for (let i = 0; i < p.count; i++) maxY = Math.max(maxY, p.getY(i));
  for (let i = 0; i < p.count; i++) { const t = p.getY(i) / maxY; const c = new THREE.Color(0x5f9a86).lerp(new THREE.Color(0x8ab8a4), t * 0.6); if (t > 0.93) c.set(0x3a2a1a); cols.set([c.r, c.g, c.b], i * 3); }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5 }));
  m.castShadow = true; m.receiveShadow = true;
  return m;
}
