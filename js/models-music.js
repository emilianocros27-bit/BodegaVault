// Guitarras, jarrones, instrumentos y equipo de audio.
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, hex, rng, woodTex,
  add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, grid, standBase, SW } from './modelkit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// =====================================================================
//  UTILIDADES DE GEOMETRÍA (fusión, varillas, contornos)
// =====================================================================
const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const V2 = (x, y) => new THREE.Vector2(x, y);
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _eu = new THREE.Euler(), _p = new THREE.Vector3(), _sc = new THREE.Vector3();
export function xf(geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  _q.setFromEuler(_eu.set(rx, ry, rz)); _m4.compose(_p.set(x, y, z), _q, _sc.set(sx, sy, sz));
  return geo.applyMatrix4(_m4);
}
// acumulador: muchas piezas pequeñas del mismo material -> una sola malla
export class Acc {
  constructor() { this.list = []; }
  put(geo, x, y, z, rx, ry, rz, sx, sy, sz) { this.list.push(xf(geo, x, y, z, rx, ry, rz, sx, sy, sz)); return this; }
  raw(geo) { this.list.push(geo); return this; }
  mesh(g, m, shadow = true) {
    if (!this.list.length) return null;
    const geos = this.list.map(q => {
      const r = q.index ? q.toNonIndexed() : q;
      for (const k of Object.keys(r.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') r.deleteAttribute(k);
      if (!r.attributes.normal) r.computeVertexNormals();
      if (!r.attributes.uv) r.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(r.attributes.position.count * 2), 2));
      r.clearGroups(); return r;
    });
    const me = add(g, mergeGeometries(geos), m); me.castShadow = shadow; this.list = [];
    return me;
  }
}
const toV = (a) => (a.isVector3 ? a : V3(...a));
// cilindro entre dos puntos
export function rodGeo(a, b, r, seg = 6, r2 = r, open = false) {
  const A = toV(a), Bv = toV(b);
  const d = Bv.clone().sub(A), len = Math.max(1e-5, d.length());
  const geo = new THREE.CylinderGeometry(r2, r, len, seg, 1, open);
  geo.translate(0, len / 2, 0);
  _q.setFromUnitVectors(V3(0, 1, 0), d.normalize()); _m4.compose(A, _q, _sc.set(1, 1, 1));
  return geo.applyMatrix4(_m4);
}
// orienta una geometría (eje +y) hacia una dirección
export function orient(geo, pos, dir) { _q.setFromUnitVectors(V3(0, 1, 0), dir.clone().normalize()); _m4.compose(pos, _q, _sc.set(1, 1, 1)); return geo.applyMatrix4(_m4); }
export const latheGeo = (pts, seg = 16) => new THREE.LatheGeometry(pts.map(([a, b]) => V2(a, b)), seg);
// losa extruida que ocupa z ∈ [0, t]
export function slab(shape, t, bevel = 0, segs = 2, curve = 12) {
  const bv = Math.min(bevel, t * 0.45);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: Math.max(1e-4, t - 2 * bv), bevelEnabled: bv > 0, bevelSize: bv, bevelThickness: bv, bevelSegments: segs, curveSegments: curve });
  geo.translate(0, 0, bv);
  return geo;
}
export function planarUV(geo, minX, minY, w, h) {
  const p = geo.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[2 * i] = (p.getX(i) - minX) / w; uv[2 * i + 1] = (p.getY(i) - minY) / h; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); geo.clearGroups();
  return geo;
}
export function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2); s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}
export function rrPath(w, h, r, cx = 0, cy = 0) {
  const s = new THREE.Path(), x = cx - w / 2, y = cy - h / 2; r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r);
  s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2); s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
  s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5);
  return s;
}
export const polyShape = (pts) => { const s = new THREE.Shape(); pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y))); s.closePath(); return s; };
// contorno suave (Catmull-Rom cerrado)
export function smoothLoop(ctrl, n = 180) {
  const c = new THREE.CatmullRomCurve3(ctrl.map(([x, y]) => V3(x, y, 0)), true, 'centripetal');
  return c.getSpacedPoints(n).slice(0, n).map(p => [p.x, p.y]);
}
export const mirrorHalf = (half) => [...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
// polígono con esquinas redondeadas; cada punto puede traer su radio [x, y, r]
export function roundPoly(ctrl, r0 = 0.01, segs = 5) {
  const out = [], n = ctrl.length;
  for (let i = 0; i < n; i++) {
    const p = ctrl[i], a = ctrl[(i + n - 1) % n], b = ctrl[(i + 1) % n];
    const da = Math.hypot(a[0] - p[0], a[1] - p[1]), db = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const rr = Math.min(p[2] ?? r0, da * 0.48, db * 0.48);
    const p0 = [p[0] + (a[0] - p[0]) / da * rr, p[1] + (a[1] - p[1]) / da * rr], p1 = [p[0] + (b[0] - p[0]) / db * rr, p[1] + (b[1] - p[1]) / db * rr];
    for (let k = 0; k <= segs; k++) {
      const t = k / segs, u = 1 - t;
      out.push([u * u * p0[0] + 2 * u * t * p[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * p[1] + t * t * p1[1]]);
    }
  }
  return out;
}
// contorno con utilidades (normales, cruces, distancia)
export function outline(pts) {
  let A = 0;
  for (let i = 0; i < pts.length; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length]; A += x0 * y1 - x1 * y0; }
  if (A < 0) pts = pts.slice().reverse();
  const n = pts.length;
  const nor = pts.map((p, i) => { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n]; const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dy / l, -dx / l]; });
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  const o = { pts, nor, n, minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
  o.w = o.maxX - o.minX; o.h = o.maxY - o.minY;
  o.shape = () => polyShape(pts);
  o.cross = (axis, v) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const a = axis ? p[1] : p[0], b = axis ? q[1] : q[0];
      if (a !== b && (a - v) * (b - v) <= 0) { const t = (v - a) / (b - a); out.push({ x: p[0] + (q[0] - p[0]) * t, y: p[1] + (q[1] - p[1]) * t, i, t }); }
    }
    return out;
  };
  o.edge = (y, side) => {
    let best = null;
    for (const c of o.cross(1, y)) if (Math.sign(c.x) === side && (!best || Math.abs(c.x) > Math.abs(best.x))) best = c;
    if (!best) return { x: 0, y, n: [side, 0] };
    const a = nor[best.i], b = nor[(best.i + 1) % n];
    const nx = a[0] + (b[0] - a[0]) * best.t, ny = a[1] + (b[1] - a[1]) * best.t, l = Math.hypot(nx, ny) || 1;
    return { x: best.x, y: best.y, n: [nx / l, ny / l] };
  };
  o.halfW = (y, side) => Math.abs(o.edge(y, side).x);
  o.yBottom = (x) => { const c = o.cross(0, x); return c.length ? Math.min(...c.map(k => k.y)) : 0; };
  o.yTop = (x) => { const c = o.cross(0, x); return c.length ? Math.max(...c.map(k => k.y)) : 0; };
  o.dist = (x, y) => {
    let d = 1e9;
    for (let i = 0; i < n; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % n];
      const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1)));
      d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t));
    }
    return d;
  };
  o.inset = (d) => pts.map((p, i) => [p[0] - nor[i][0] * d, p[1] - nor[i][1] * d]);
  // distancia hacia dentro hasta el borde opuesto (para tallas en zonas angostas)
  o.rayIn = (i) => {
    const [px, py] = pts[i], dx = -nor[i][0], dy = -nor[i][1];
    let best = 1;
    for (let j = 0; j < n; j++) {
      if (j === i || (j + 1) % n === i) continue;
      const [ax, ay] = pts[j], [bx, by] = pts[(j + 1) % n];
      const ex = bx - ax, ey = by - ay, den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((ax - px) * ey - (ay - py) * ex) / den, u = ((ax - px) * dy - (ay - py) * dx) / den;
      if (t > 1e-4 && u >= 0 && u <= 1 && t < best) best = t;
    }
    return best;
  };
  return o;
}
const CARVE = [[0, 0], [0.004, 0.0006], [0.012, 0.0028], [0.022, 0.006], [0.034, 0.0092], [0.05, 0.0114], [0.07, 0.012]];
const carveZ = (e) => { for (let k = 1; k < CARVE.length; k++) if (e <= CARVE[k][0]) { const [t0, a] = CARVE[k - 1], [t1, b] = CARVE[k]; return a + (b - a) * (e - t0) / (t1 - t0); } return CARVE[CARVE.length - 1][1]; };
// tapa tallada (Les Paul): anillos hacia dentro que suben siguiendo un perfil
function carveGeo(ol, prof, z0) {
  const { pts, nor, n } = ol;
  const cap = pts.map((p, i) => ol.rayIn(i) * 0.42);
  const zAt = (e) => { for (let k = 1; k < prof.length; k++) if (e <= prof[k][0]) { const [t0, a] = prof[k - 1], [t1, b] = prof[k]; return a + (b - a) * (e - t0) / (t1 - t0); } return prof[prof.length - 1][1]; };
  const rows = prof.map(([t]) => pts.map((p, i) => { const e = Math.min(t, cap[i]); return [p[0] - nor[i][0] * e, p[1] - nor[i][1] * e, z0 + zAt(e)]; }));
  const pos = [], idx = [], R = rows.length;
  rows.forEach(r => r.forEach(v => pos.push(...v)));
  for (let k = 0; k < R - 1; k++) for (let i = 0; i < n; i++) { const a = k * n + i, b = k * n + (i + 1) % n, c = (k + 1) * n + i, d = (k + 1) * n + (i + 1) % n; idx.push(a, b, c, b, d, c); }
  const base = (R - 1) * n;
  THREE.ShapeUtils.triangulateShape(rows[R - 1].map(v => V2(v[0], v[1])), []).forEach(([a, b, c]) => idx.push(base + a, base + b, base + c));
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
    const cz = (pos[b] - pos[a]) * (pos[c + 1] - pos[a + 1]) - (pos[b + 1] - pos[a + 1]) * (pos[c] - pos[a]);
    if (cz < 0) { const k = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = k; }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  planarUV(geo, ol.minX, ol.minY, ol.w, ol.h);
  geo.userData.zAt = zAt;
  return geo;
}

// =====================================================================
//  TEXTURAS DE GUITARRA
// =====================================================================
function drawLoop(c, pts, X, Y) { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(X(x), Y(y)) : c.moveTo(X(x), Y(y)))); c.closePath(); }
function grainLines(c, W, H, R, o = {}) {
  const { col = '60,30,10', n = 140, alpha = 0.18, wav = 3, vertical = true, wide = 2 } = o;
  for (let i = 0; i < n; i++) {
    c.strokeStyle = `rgba(${col},${alpha * (0.3 + R())})`; c.lineWidth = 0.5 + R() * wide;
    const p0 = R() * (vertical ? W : H), ph = R() * 6;
    c.beginPath();
    for (let s = 0; s <= 40; s++) { const t = s / 40 * (vertical ? H : W); const q = p0 + Math.sin(t * 0.012 + ph) * wav + Math.sin(t * 0.05 + ph * 2) * wav * 0.3; vertical ? (s ? c.lineTo(q, t) : c.moveTo(q, t)) : (s ? c.lineTo(t, q) : c.moveTo(t, q)); }
    c.stroke();
  }
}
// tapa del cuerpo: color, veta, flameado, sombreado sunburst que sigue el contorno
function bodyTex(key, ol, spec) {
  const W = 512, H = Math.round(512 * ol.h / ol.w);
  return canvasTex('gtop|' + key, W, H, (c) => {
    const X = x => (x - ol.minX) / ol.w * W, Y = y => (1 - (y - ol.minY) / ol.h) * H, S = m => m / ol.w * W;
    const R = rng(key);
    c.fillStyle = spec.edge ?? spec.base; c.fillRect(0, 0, W, H);
    c.save(); drawLoop(c, ol.pts, X, Y); c.clip();
    c.fillStyle = spec.base; c.fillRect(0, 0, W, H);
    if (spec.glow) { const g = c.createRadialGradient(W / 2, Y(ol.minY + ol.h * 0.35), 10, W / 2, Y(ol.minY + ol.h * 0.35), W * 0.5); g.addColorStop(0, spec.glow); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
    if (spec.grain === 'spruce') grainLines(c, W, H, R, { col: '150,100,40', n: 220, alpha: 0.16, wav: 1.2, wide: 1.4 });
    if (spec.grain === 'mahog') grainLines(c, W, H, R, { col: '40,10,0', n: 160, alpha: 0.22, wav: 4 });
    if (spec.grain === 'koa') { grainLines(c, W, H, R, { col: '70,30,5', n: 120, alpha: 0.14, wav: 4, wide: 2 }); grainLines(c, W, H, R, { col: '255,210,140', n: 40, alpha: 0.07, wav: 4, wide: 3 }); }
    if (spec.grain === 'ash') {
      for (let i = 0; i < 26; i++) { c.strokeStyle = `rgba(90,55,20,${0.12 + R() * 0.16})`; c.lineWidth = 1 + R() * 3; const cx = W * (0.3 + R() * 0.4), w0 = W * (0.05 + i * 0.03); c.beginPath(); c.moveTo(cx - w0, H); c.bezierCurveTo(cx - w0, H * 0.3, cx + w0, H * 0.3, cx + w0, H); c.stroke(); }
      grainLines(c, W, H, R, { col: '90,55,20', n: 60, alpha: 0.12 });
    }
    if (spec.flame) {
      for (let i = 0; i < 110; i++) {
        const y0 = R() * H, light = R() < 0.5;
        c.strokeStyle = light ? `rgba(255,236,190,${0.1 + R() * 0.12})` : `rgba(70,25,0,${0.1 + R() * 0.12})`; c.lineWidth = 2 + R() * 6;
        c.beginPath();
        for (let x = 0; x <= W; x += 8) { const yy = y0 + Math.sin(x * 0.018 + i * 0.7) * 7 + Math.pow((x - W / 2) / W, 2) * 70; x ? c.lineTo(x, yy) : c.moveTo(x, yy); }
        c.stroke();
      }
    }
    spec.under?.(c, X, Y, S, R);
    if (spec.burst) for (const [col, wid, blur] of spec.burst) { c.save(); c.filter = `blur(${Math.max(1, S(blur))}px)`; c.strokeStyle = col; c.lineWidth = S(wid); drawLoop(c, ol.pts, X, Y); c.stroke(); c.restore(); }
    if (spec.purfling) { c.lineWidth = S(0.0016); c.strokeStyle = spec.purfling; drawLoop(c, ol.inset(0.004), X, Y); c.stroke(); }
    spec.over?.(c, X, Y, S, R);
    c.restore();
  });
}
function tortoise(c, R, x0, y0, w, h) {
  c.fillStyle = '#2a0f06'; c.fillRect(x0, y0, w, h);
  for (let i = 0; i < 90; i++) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); const x = x0 + R() * w, y = y0 + R() * h, r = 4 + R() * 16; c.save(); c.translate(x, y); c.scale(r * (1 + R()), r); g.addColorStop(0, `rgba(${170 + R() * 60 | 0},${70 + R() * 40 | 0},10,${0.35 + R() * 0.3})`); g.addColorStop(1, 'rgba(120,40,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, 7); c.fill(); c.restore(); }
}
function fretboardTex(key, spec) {
  const { y0, yNut, wEnd, wNut, frets, inlay, wood, bound } = spec;
  const W = 96, L = yNut - y0, H = Math.min(2048, Math.round(W * L / wEnd * 1.2));
  return canvasTex('fb|' + key, W, H, (c) => {
    const X = x => (x / wEnd + 0.5) * W, Y = y => (1 - (y - y0) / L) * H, S = m => m / wEnd * W;
    const R = rng(key);
    const base = { rose: '#3b2216', ebony: '#17110d', maple: '#dcb577' }[wood];
    c.fillStyle = base; c.fillRect(0, 0, W, H);
    if (wood === 'maple') grainLines(c, W, H, R, { col: '150,95,40', n: 40, alpha: 0.2, wav: 2 });
    else grainLines(c, W, H, R, { col: wood === 'ebony' ? '60,45,35' : '90,50,30', n: 50, alpha: 0.35, wav: 2, wide: 2.5 });
    const fy = (i) => yNut - spec.S * (1 - Math.pow(2, -i / 12));
    // ranuras de trastes
    c.fillStyle = 'rgba(0,0,0,0.5)';
    for (let i = 1; i <= frets; i++) { const y = fy(i); if (y < y0) break; c.fillRect(0, Y(y) - 1, W, 2); }
    const pearl = (x, y, w, h, round) => {
      const g = c.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
      g.addColorStop(0, '#fbf7ee'); g.addColorStop(0.35, '#e8eef2'); g.addColorStop(0.6, '#f6e8ef'); g.addColorStop(1, '#e6f2e8');
      c.fillStyle = g;
      if (round) { c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, 7); c.fill(); }
      else c.fillRect(x - w / 2, y - h / 2, w, h);
    };
    const marks = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
    for (const i of marks) {
      if (i > frets) break;
      const ya = fy(i - 1), yb = fy(i); if (yb < y0) break;
      const ym = (ya + yb) / 2, wHere = wNut + (wEnd - wNut) * (yNut - ym) / L;
      const dpx = S(0.0068), ext = Y(yb) - Y(ya);
      if (inlay === 'dot' || (inlay === 'dotmaple')) {
        const col = inlay === 'dotmaple' ? '#141414' : null;
        const put = (x) => { if (col) { c.fillStyle = col; c.beginPath(); c.arc(X(x), Y(ym), dpx / 2, 0, 7); c.fill(); } else pearl(X(x), Y(ym), dpx, dpx, true); };
        if (i === 12 || i === 24) { put(-wHere * 0.24); put(wHere * 0.24); } else put(0);
      } else if (inlay === 'trap') {
        if (i === 1) continue;
        const tw = S(wHere * 0.62), th = Math.abs(ext) * 0.55;
        c.save(); c.translate(X(0), Y(ym));
        const g = c.createLinearGradient(-tw / 2, -th / 2, tw / 2, th / 2); g.addColorStop(0, '#fbf7ee'); g.addColorStop(0.4, '#eef0f4'); g.addColorStop(0.7, '#f5e6ee'); g.addColorStop(1, '#e8f4ea');
        c.fillStyle = g; c.beginPath(); c.moveTo(-tw / 2, th / 2); c.lineTo(tw / 2, th / 2); c.lineTo(tw * 0.42, -th / 2); c.lineTo(-tw * 0.42, -th / 2); c.closePath(); c.fill();
        c.restore();
      } else if (inlay === 'block') {
        pearl(X(0), Y(ym), S(wHere * 0.7), Math.abs(ext) * 0.62, false);
      }
    }
    if (bound) {
      c.strokeStyle = '#efe2c0'; c.lineWidth = S(0.0024);
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(X(s * (wNut / 2 - 0.0012)), 0); c.lineTo(X(s * (wEnd / 2 - 0.0012)), H); c.stroke(); }
    }
  });
}
function headTex(key, hol, spec) {
  const W = 256, H = Math.round(256 * hol.h / hol.w);
  return canvasTex('ghead|' + key, W, H, (c) => {
    const X = x => (x - hol.minX) / hol.w * W, Y = y => (1 - (y - hol.minY) / hol.h) * H, S = m => m / hol.w * W;
    const R = rng(key);
    c.fillStyle = spec.edge ?? spec.base; c.fillRect(0, 0, W, H);
    c.save(); drawLoop(c, hol.pts, X, Y); c.clip();
    c.fillStyle = spec.base; c.fillRect(0, 0, W, H);
    if (spec.grain) grainLines(c, W, H, R, { col: spec.grain, n: 50, alpha: 0.2, wav: 2 });
    if (spec.bound) { c.strokeStyle = '#efe2c0'; c.lineWidth = S(0.003); drawLoop(c, hol.pts, X, Y); c.stroke(); }
    spec.draw?.(c, X, Y, S, R);
    c.restore();
  });
}
function logo(c, X, Y, S, text, x, y, size, color, o = {}) {
  c.save(); c.translate(X(x), Y(y)); c.rotate(o.rot ?? 0);
  c.fillStyle = color; c.font = `${o.weight ?? 'italic bold'} ${Math.round(S(size))}px ${o.family ?? 'Georgia, serif'}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (o.shadow) { c.shadowColor = o.shadow; c.shadowBlur = 2; }
  c.fillText(text, 0, 0);
  c.restore();
}

// =====================================================================
//  CONTORNOS DE CUERPO Y CLAVIJERO (x = agudos a la derecha, y = hacia el mástil)
// =====================================================================
const BODY_CTRL = {
  lespaul: [[0, 0], [0.09, 0.012], [0.15, 0.05], [0.168, 0.12], [0.157, 0.2], [0.124, 0.262], [0.119, 0.3], [0.13, 0.345], [0.124, 0.384], [0.106, 0.408], [0.086, 0.405], [0.066, 0.38], [0.046, 0.356], [0.028, 0.352], [0.02, 0.405], [0, 0.432], [-0.036, 0.44], [-0.077, 0.436], [-0.11, 0.414], [-0.128, 0.375], [-0.127, 0.33], [-0.118, 0.29], [-0.124, 0.255], [-0.155, 0.2], [-0.168, 0.12], [-0.15, 0.05], [-0.09, 0.012]],
  strat: [[0, 0], [0.1, 0.008], [0.152, 0.048], [0.164, 0.12], [0.148, 0.182], [0.122, 0.228], [0.124, 0.27], [0.128, 0.31], [0.12, 0.35], [0.103, 0.378], [0.088, 0.372], [0.078, 0.345], [0.064, 0.312], [0.044, 0.296], [0, 0.296], [-0.044, 0.304], [-0.064, 0.328], [-0.08, 0.37], [-0.092, 0.41], [-0.106, 0.428], [-0.122, 0.418], [-0.134, 0.38], [-0.137, 0.325], [-0.124, 0.268], [-0.128, 0.222], [-0.156, 0.168], [-0.166, 0.1], [-0.146, 0.038], [-0.09, 0.008]],
  tele: [[0, 0], [0.1, 0.005], [0.148, 0.03], [0.161, 0.09], [0.156, 0.16], [0.132, 0.225], [0.126, 0.265], [0.131, 0.305], [0.124, 0.332], [0.103, 0.343], [0.078, 0.328], [0.052, 0.305], [0.03, 0.3], [0.0, 0.34], [-0.03, 0.392], [-0.08, 0.395], [-0.118, 0.378], [-0.138, 0.34], [-0.134, 0.28], [-0.13, 0.228], [-0.154, 0.16], [-0.161, 0.09], [-0.148, 0.03], [-0.1, 0.005]],
  sg: [[0, 0], [0.1, 0.01], [0.155, 0.048], [0.166, 0.115], [0.152, 0.185], [0.126, 0.228], [0.121, 0.268], [0.131, 0.318], [0.129, 0.368], [0.115, 0.404], [0.1, 0.402], [0.08, 0.36], [0.052, 0.332], [0.028, 0.326], [-0.03, 0.332], [-0.056, 0.348], [-0.084, 0.388], [-0.104, 0.425], [-0.12, 0.422], [-0.133, 0.372], [-0.131, 0.32], [-0.121, 0.27], [-0.126, 0.228], [-0.152, 0.185], [-0.166, 0.115], [-0.155, 0.048], [-0.1, 0.01]],
  acoustic: mirrorHalf([[0, 0], [0.12, 0.006], [0.18, 0.04], [0.197, 0.11], [0.19, 0.18], [0.157, 0.248], [0.139, 0.282], [0.142, 0.322], [0.149, 0.38], [0.141, 0.44], [0.115, 0.484], [0.07, 0.503], [0, 0.507]]),
  classical: mirrorHalf([[0, 0], [0.11, 0.006], [0.17, 0.045], [0.185, 0.11], [0.172, 0.18], [0.136, 0.238], [0.119, 0.27], [0.123, 0.31], [0.138, 0.37], [0.132, 0.43], [0.1, 0.47], [0.05, 0.485], [0, 0.487]]),
  ukulele: mirrorHalf([[0, 0], [0.07, 0.004], [0.104, 0.03], [0.112, 0.075], [0.102, 0.12], [0.077, 0.152], [0.074, 0.175], [0.082, 0.215], [0.078, 0.255], [0.058, 0.285], [0.03, 0.298], [0, 0.3]]),
};
const BODY_POLY = {
  flyingv: [[0, 0.15, 0.02], [0.185, 0.0, 0.008], [0.226, 0.012, 0.008], [0.236, 0.046, 0.012], [0.062, 0.456, 0.03], [0.032, 0.472, 0.012], [-0.032, 0.472, 0.012], [-0.062, 0.456, 0.03], [-0.236, 0.046, 0.012], [-0.226, 0.012, 0.008], [-0.185, 0.0, 0.008]],
  explorer: [[-0.215, 0.035, 0.012], [0.255, 0.0, 0.012], [0.264, 0.036, 0.012], [0.118, 0.2, 0.04], [0.098, 0.35, 0.02], [0.128, 0.4, 0.012], [0.112, 0.418, 0.008], [0.036, 0.402, 0.015], [-0.035, 0.42, 0.015], [-0.105, 0.455, 0.02], [-0.272, 0.588, 0.01], [-0.293, 0.566, 0.01], [-0.152, 0.3, 0.04], [-0.168, 0.13, 0.025]],
};
function bodyOutline(key) {
  if (key === 'bass') return outline(smoothLoop(BODY_CTRL.strat.map(([x, y]) => [x * 1.07, y * (y > 0.25 ? 1.16 : 1.08)]), 200));
  if (BODY_POLY[key]) return outline(roundPoly(BODY_POLY[key], 0.01, 6));
  return outline(smoothLoop(BODY_CTRL[key], 200));
}
const HEAD_CTRL = {
  lp: { pts: [[-0.022, -0.004], [0.022, -0.004], [0.03, 0.02], [0.041, 0.07], [0.046, 0.125], [0.044, 0.163], [0.037, 0.182], [0.016, 0.179], [0, 0.172], [-0.016, 0.179], [-0.037, 0.182], [-0.044, 0.163], [-0.046, 0.125], [-0.041, 0.07], [-0.03, 0.02]], smooth: true },
  martin: { pts: [[-0.0245, -0.004, 0.002], [0.0245, -0.004, 0.002], [0.037, 0.176, 0.006], [0.035, 0.19, 0.004], [-0.035, 0.19, 0.004], [-0.037, 0.176, 0.006]] },
  slot: { pts: [[-0.026, -0.004, 0.002], [0.026, -0.004, 0.002], [0.0275, 0.168, 0.004], [0.031, 0.188, 0.006], [0.012, 0.184, 0.004], [0, 0.194, 0.005], [-0.012, 0.184, 0.004], [-0.031, 0.188, 0.006], [-0.0275, 0.168, 0.004]] },
  strat: { pts: [[0.021, -0.004], [0.0235, 0.025], [0.022, 0.055], [0.03, 0.095], [0.043, 0.132], [0.047, 0.158], [0.04, 0.179], [0.021, 0.191], [-0.004, 0.194], [-0.021, 0.186], [-0.027, 0.166], [-0.027, 0.1], [-0.024, 0.035], [-0.021, -0.004]], smooth: true },
  tele: { pts: [[0.021, -0.004, 0.002], [0.029, 0.04, 0.03], [0.034, 0.15, 0.02], [0.03, 0.184, 0.01], [0.012, 0.192, 0.008], [-0.02, 0.188, 0.008], [-0.027, 0.176, 0.006], [-0.026, 0.03, 0.02], [-0.021, -0.004, 0.002]] },
  bass: { pts: [[0.02, -0.004], [0.024, 0.03], [0.022, 0.07], [0.032, 0.12], [0.049, 0.17], [0.054, 0.205], [0.046, 0.232], [0.024, 0.245], [-0.004, 0.248], [-0.024, 0.238], [-0.031, 0.21], [-0.031, 0.12], [-0.026, 0.04], [-0.02, -0.004]], smooth: true },
  v: { pts: [[-0.023, -0.004, 0.002], [0.023, -0.004, 0.002], [0.056, 0.186, 0.01], [0.043, 0.2, 0.008], [0, 0.158, 0.012], [-0.043, 0.2, 0.008], [-0.056, 0.186, 0.01]] },
  hockey: { pts: [[0.022, -0.004, 0.002], [0.03, 0.05, 0.02], [0.018, 0.2, 0.012], [-0.006, 0.222, 0.01], [-0.034, 0.214, 0.01], [-0.031, 0.04, 0.02], [-0.022, -0.004, 0.002]] },
  uke: { pts: [[-0.018, -0.004], [0.018, -0.004], [0.024, 0.04], [0.027, 0.09], [0.02, 0.112], [0.008, 0.108], [0, 0.114], [-0.008, 0.108], [-0.02, 0.112], [-0.027, 0.09], [-0.024, 0.04]], smooth: true },
  banjo: { pts: [[-0.021, -0.004], [0.021, -0.004], [0.028, 0.04], [0.042, 0.07], [0.045, 0.11], [0.034, 0.148], [0.016, 0.16], [0, 0.176], [-0.016, 0.16], [-0.034, 0.148], [-0.045, 0.11], [-0.042, 0.07], [-0.028, 0.04]], smooth: true },
};
function headOutline(k) { const h = HEAD_CTRL[k]; return outline(h.smooth ? smoothLoop(h.pts, 120) : roundPoly(h.pts, 0.004, 4)); }

// =====================================================================
//  PIEZAS DE HARDWARE
// =====================================================================
const KNOB = {
  tophat: [[0, 0], [0.0115, 0], [0.0115, 0.0034], [0.0104, 0.0045], [0.0094, 0.0125], [0.0086, 0.0139], [0, 0.0141]],
  strat: [[0, 0], [0.0128, 0], [0.0128, 0.0018], [0.0104, 0.0036], [0.0092, 0.0162], [0.0082, 0.0176], [0, 0.018]],
  dome: [[0, 0], [0.0098, 0], [0.0098, 0.0112], [0.0082, 0.0152], [0.0045, 0.0172], [0, 0.0176]],
  witch: [[0, 0], [0.0112, 0], [0.0112, 0.004], [0.0096, 0.0055], [0.0074, 0.016], [0.0066, 0.0172], [0, 0.0174]],
};
function knobs(g, list, kind, m, capM, z0, zfn) {
  const a = new Acc(), b = new Acc();
  for (const [x, y] of list) {
    const z = zfn ? zfn(x, y) : z0;
    a.put(latheGeo(KNOB[kind], 18), x, y, z, Math.PI / 2);
    if (capM) b.put(new THREE.CylinderGeometry(0.0062, 0.0062, 0.0008, 16), x, y, z + KNOB[kind].at(-1)[1] + 0.0002, Math.PI / 2);
    // indicador
    b.put(new THREE.BoxGeometry(0.0012, 0.006, 0.0006), x + 0.004, y + 0.004, z + KNOB[kind].at(-1)[1] + (capM ? 0.0008 : 0.0001), 0, 0, -0.8);
  }
  a.mesh(g, m); b.mesh(g, capM ?? plastic(0x111111));
}
// humbucker con aro
function humbucker(g, y, z, o = {}) {
  const ring = new THREE.Shape(rrShape(0.094, 0.05, 0.007).getPoints(6)); ring.holes.push(rrPath(0.074, 0.04, 0.003));
  add(g, slab(ring, 0.004, 0.0008), o.ringM ?? plastic(0xefe2bf, 0.35), 0, y, z, 0, 0, o.rz ?? 0);
  const hw = o.hw ?? C.chrome();
  const grpP = grp(g, 0, y, z, 0, 0, o.rz ?? 0);
  if (o.cover) {
    add(grpP, slab(rrShape(0.07, 0.038, 0.004), 0.0075, 0.0018), hw, 0, 0, 0.0005);
    const p = new Acc();
    for (let i = 0; i < 6; i++) p.put(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0008, 10), -0.025 + i * 0.01, 0.009, 0.0082, Math.PI / 2);
    p.mesh(grpP, C.silver());
  } else {
    const coil = o.zebra ? [plastic(0xefe2bf, 0.4), plastic(0x121212, 0.35)] : [plastic(0x121212, 0.35), plastic(0x121212, 0.35)];
    for (const s of [-1, 1]) add(grpP, slab(rrShape(0.07, 0.0178, 0.003), 0.0072, 0.0012), coil[s > 0 ? 0 : 1], 0, s * 0.0093, 0.0005);
    add(grpP, new THREE.BoxGeometry(0.074, 0.038, 0.002), C.steel(), 0, 0, 0.001);
    const p = new Acc();
    for (let i = 0; i < 6; i++) {
      p.put(new THREE.CylinderGeometry(0.0023, 0.0023, 0.0012, 10), -0.025 + i * 0.01, 0.0093, 0.0078, Math.PI / 2);
      p.put(new THREE.CylinderGeometry(0.0021, 0.0021, 0.0006, 10), -0.025 + i * 0.01, -0.0093, 0.0076, Math.PI / 2);
    }
    for (const s of [-1, 1]) p.put(new THREE.CylinderGeometry(0.0016, 0.0016, 0.002, 8), s * 0.043, s * 0.02, 0.004, Math.PI / 2);
    p.mesh(grpP, C.silver());
  }
}
// pastilla de bobina simple
function singleCoil(g, x, y, z, rz = 0, o = {}) {
  const w = o.w ?? 0.083, h = o.h ?? 0.0182, n = o.poles ?? 6;
  const gp = grp(g, x, y, z, 0, 0, rz);
  add(gp, slab(rrShape(w, h, h / 2), o.t ?? 0.0075, 0.0018), o.m ?? plastic(0xf2eee2, 0.3));
  const p = new Acc();
  const span = o.span ?? 0.052;
  for (let i = 0; i < n; i++) p.put(new THREE.CylinderGeometry(0.0024, 0.0024, 0.0008, 10), n === 1 ? 0 : -span / 2 + i * span / (n - 1), 0, (o.t ?? 0.0075) + 0.0001, Math.PI / 2);
  p.mesh(gp, C.silver());
  return gp;
}
function strapButton(acc, x, y, z, nx, ny, nz = 0) {
  const geo = latheGeo([[0, 0], [0.0058, 0], [0.0058, 0.0016], [0.0026, 0.0036], [0.0036, 0.007], [0.0048, 0.0088], [0.0028, 0.0104], [0, 0.0106]], 14);
  acc.raw(orient(geo, V3(x, y, z), V3(nx, ny, nz)));
}

// =====================================================================
//  GUITARRA
// =====================================================================
const GK = {
  lespaul: { body: 'lespaul', S: 0.628, yB: 0.14, frets: 22, nutW: 0.043, endW: 0.057, head: 'lp', tilt: 0.24, ht: 0.015, tuner: 'kluson', d: 0.038, fb: 'rose', inlay: 'trap', fbBound: true, set: true, strings: 6, nutSp: 0.035, brSp: 0.051 },
  sg: { body: 'sg', S: 0.628, yB: 0.14, frets: 22, nutW: 0.043, endW: 0.056, head: 'lp', tilt: 0.24, ht: 0.015, tuner: 'kluson', d: 0.034, fb: 'rose', inlay: 'trap', fbBound: true, set: true, strings: 6, nutSp: 0.035, brSp: 0.051 },
  strat: { body: 'strat', S: 0.648, yB: 0.105, frets: 21, nutW: 0.042, endW: 0.056, head: 'strat', tilt: 0, ht: 0.014, tuner: 'fender', d: 0.044, fb: 'rose', inlay: 'dot', set: false, strings: 6, nutSp: 0.035, brSp: 0.053 },
  tele: { body: 'tele', S: 0.648, yB: 0.1, frets: 21, nutW: 0.042, endW: 0.056, head: 'tele', tilt: 0, ht: 0.014, tuner: 'fender', d: 0.044, fb: 'maple', inlay: 'dotmaple', set: false, strings: 6, nutSp: 0.035, brSp: 0.053 },
  bass: { body: 'bass', S: 0.864, yB: 0.1, frets: 20, nutW: 0.038, endW: 0.064, head: 'bass', tilt: 0, ht: 0.015, tuner: 'bass', d: 0.044, fb: 'rose', inlay: 'dot', set: false, strings: 4, nutSp: 0.03, brSp: 0.057 },
  flyingv: { body: 'flyingv', S: 0.628, yB: 0.19, frets: 22, nutW: 0.043, endW: 0.056, head: 'v', tilt: 0.24, ht: 0.015, tuner: 'grover', d: 0.036, fb: 'rose', inlay: 'dot', set: true, strings: 6, nutSp: 0.035, brSp: 0.051 },
  explorer: { body: 'explorer', S: 0.628, yB: 0.17, frets: 22, nutW: 0.043, endW: 0.056, head: 'hockey', tilt: 0.24, ht: 0.015, tuner: 'grover', d: 0.036, fb: 'rose', inlay: 'dot', set: true, strings: 6, nutSp: 0.035, brSp: 0.051 },
  acoustic: { body: 'acoustic', S: 0.645, joint: 14, frets: 20, nutW: 0.043, endW: 0.056, head: 'martin', tilt: 0.26, ht: 0.015, tuner: 'enclosed', d: 0.1, fb: 'ebony', inlay: 'dot', set: true, strings: 6, nutSp: 0.036, brSp: 0.054, hole: 0.05, acoustic: true },
  classical: { body: 'classical', S: 0.65, joint: 12, frets: 19, nutW: 0.052, endW: 0.062, head: 'slot', tilt: 0.26, ht: 0.019, tuner: 'classical', d: 0.095, fb: 'ebony', inlay: null, set: true, strings: 6, nutSp: 0.043, brSp: 0.058, hole: 0.043, acoustic: true, nylon: true },
  ukulele: { body: 'ukulele', S: 0.38, joint: 14, frets: 18, nutW: 0.035, endW: 0.043, head: 'uke', tilt: 0.2, ht: 0.013, tuner: 'uke', d: 0.065, fb: 'rose', inlay: 'dot', set: true, strings: 4, nutSp: 0.027, brSp: 0.04, hole: 0.03, acoustic: true, nylon: true },
};

// mástil: medio cilindro achatado con talón
function neckGeo(yA, yZ, zN, wAt, dpAt, rows = 40, seg = 12) {
  const pos = [], uv = [], idx = [];
  for (let r = 0; r <= rows; r++) {
    const y = yA + (yZ - yA) * r / rows, w = wAt(y), dp = dpAt(y);
    for (let s = 0; s <= seg; s++) {
      const th = Math.PI * s / seg;
      pos.push(Math.cos(th) * w / 2, y, zN - Math.sin(th) * dp);
      uv.push(y * 3, s / seg * 0.35);
    }
  }
  for (let r = 0; r < rows; r++) for (let s = 0; s < seg; s++) { const a = r * (seg + 1) + s, b = a + 1, c = a + seg + 1, d = c + 1; idx.push(a, c, b, b, c, d); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

// clavijero + clavijas; devuelve los puntos de anclaje (en coords locales de la guitarra)
function headstock(g, cfg, o, yNut, zN) {
  const hol = headOutline(cfg.head);
  const hs = grp(g, 0, yNut, zN, -cfg.tilt);
  const t = cfg.ht;
  const faceSpec = o.headSpec ?? { base: '#141010' };
  const htex = headTex(cfg.head + '|' + (o.finish ?? '') + (o.headKey ?? ''), hol, faceSpec);
  const shape = hol.shape();
  const slots = cfg.head === 'slot' ? [-0.0115, 0.0115] : [];
  for (const sx of slots) shape.holes.push(rrPath(0.0105, 0.12, 0.0052, sx, 0.092));
  const hg = planarUV(slab(shape, t, 0.0014), hol.minX, hol.minY, hol.w, hol.h);
  add(hs, hg, mat(0xffffff, { map: htex, roughness: 0.22, env: true, envI: 0.55 }), 0, 0, -t);
  // clavijas
  const hwM = o.goldHW ? C.gold() : C.chrome();
  const mA = new Acc(), mB = new Acc();
  const posts = [];
  const nS = cfg.strings;
  const btnKind = cfg.tuner;
  const kluson = (x, y, s, btnM) => {
    mA.put(new THREE.CylinderGeometry(0.0045, 0.0045, 0.0022, 14), x, y, 0.0011, Math.PI / 2);
    mA.put(new THREE.CylinderGeometry(0.003, 0.003, 0.013, 10), x, y, 0.0065, Math.PI / 2);
    mA.put(new THREE.CylinderGeometry(0.0033, 0.0033, 0.001, 10), x, y, 0.0132, Math.PI / 2);
    const edge = hol.halfW(y, s);
    const bx = s * (edge + 0.013), zb = -t - 0.0042;
    if (btnKind === 'enclosed') mA.put(new RoundedBoxGeometry(0.02, 0.016, 0.011, 2, 0.003), x + s * 0.003, y, -t - 0.0055);
    else mA.put(new THREE.BoxGeometry(0.017, 0.014, 0.008), x + s * 0.002, y, -t - 0.004);
    mA.raw(rodGeo([x + s * 0.008, y, zb], [bx - s * 0.004, y, zb], 0.0017, 8));
    if (btnKind === 'kluson') {
      const ks = new THREE.Shape(roundPoly([[-0.0035, 0], [0.0035, 0], [0.0062, 0.0135], [-0.0062, 0.0135]], 0.0022, 3).map(([a, b]) => V2(a, b)));
      mB.put(slab(ks, 0.0036, 0.0008), bx - s * 0.005, y, zb - 0.0018, 0, 0, -s * Math.PI / 2);
    } else mB.put(new THREE.CylinderGeometry(0.0078, 0.0078, 0.0036, 18), bx + s * 0.002, y, zb, Math.PI / 2, 0, 0, 1.25, 1, 1);
    posts.push([x, y, 0.0062]);
  };
  if (cfg.head === 'lp' || cfg.head === 'martin' || cfg.head === 'v') {
    const ys = cfg.head === 'v' ? [0.062, 0.1, 0.138] : cfg.head === 'martin' ? [0.048, 0.09, 0.132] : [0.058, 0.098, 0.138];
    const btnM = btnKind === 'kluson' && !o.goldHW ? plastic(0xe9dfc0, 0.3) : hwM;
    // graves (i=0..2) a la izquierda, del cejuela hacia arriba; agudos a la derecha
    for (let i = 0; i < 3; i++) { const y = ys[i]; kluson(-(hol.halfW(y, -1) - 0.0115), y, -1, btnM); }
    for (let i = 0; i < 3; i++) { const y = ys[2 - i]; kluson(hol.halfW(y, 1) - 0.0115, y, 1, btnM); }
    mA.mesh(hs, hwM); mB.mesh(hs, btnM);
  } else if (cfg.head === 'strat' || cfg.head === 'tele' || cfg.head === 'hockey') {
    for (let i = 0; i < 6; i++) {
      const y = 0.04 + i * 0.0262;
      const x = cfg.head === 'hockey' ? -0.02 + i * 0.0016 : -0.0145 + i * 0.001;
      kluson(x, y, -1, hwM);
    }
    mA.mesh(hs, hwM); mB.mesh(hs, hwM);
    if (cfg.head !== 'hockey') { // guía de cuerdas
      const tr = new Acc(); tr.put(new THREE.BoxGeometry(0.014, 0.0035, 0.0016), 0.002, 0.086, 0.0042); tr.put(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0034, 8), 0.002, 0.086, 0.0017, Math.PI / 2); tr.mesh(hs, hwM);
    }
  } else if (cfg.head === 'bass') {
    for (let i = 0; i < 4; i++) {
      const y = 0.05 + i * 0.047, x = -0.012 + i * 0.001;
      mA.put(new THREE.CylinderGeometry(0.006, 0.006, 0.0025, 16), x, y, 0.0012, Math.PI / 2);
      mA.put(new THREE.CylinderGeometry(0.0045, 0.0045, 0.017, 12), x, y, 0.0085, Math.PI / 2);
      mA.put(new THREE.BoxGeometry(0.022, 0.022, 0.01), x - 0.004, y, -t - 0.005);
      const bx = -(hol.halfW(y, -1) + 0.018);
      mA.raw(rodGeo([x - 0.01, y, -t - 0.005], [bx + 0.008, y, -t - 0.005], 0.0022, 8));
      const cl = new THREE.Shape(); for (let k = 0; k <= 48; k++) { const a = k / 48 * Math.PI * 2, r = 0.0105 * (1 + 0.22 * Math.cos(4 * a)); k ? cl.lineTo(Math.cos(a) * r, Math.sin(a) * r) : cl.moveTo(r, 0); }
      mB.put(slab(cl, 0.0035, 0.0008), bx, y, -t - 0.0068);
      posts.push([x, y, 0.009]);
    }
    mA.mesh(hs, hwM); mB.mesh(hs, hwM);
    const tr = new Acc(); tr.put(new THREE.CylinderGeometry(0.004, 0.004, 0.004, 12), 0.004, 0.12, 0.002, Math.PI / 2); tr.mesh(hs, hwM);
  } else if (cfg.head === 'slot') {
    const brass = C.brass(), pearl = plastic(0xf1ead6, 0.25);
    const ys = [0.052, 0.092, 0.132];
    for (const s of [-1, 1]) {
      mA.put(new THREE.BoxGeometry(0.0012, 0.118, t * 0.8), s * 0.0282, 0.092, -t / 2);
      for (let i = 0; i < 3; i++) {
        const y = ys[i];
        mB.raw(rodGeo([s * 0.004, y, -t / 2], [s * 0.028, y, -t / 2], 0.003, 12));
        mA.raw(rodGeo([s * 0.028, y, -t / 2], [s * 0.037, y, -t / 2], 0.0014, 8));
        posts.push([s * 0.0115, y, -t / 2 + 0.0032]);
      }
    }
    mA.mesh(hs, brass); mB.mesh(hs, plastic(0xf4f1e8, 0.3));
    const bt = new Acc();
    for (const s of [-1, 1]) for (const y of ys) bt.raw(rodGeo([s * 0.037, y, -t / 2], [s * 0.05, y, -t / 2], 0.0058, 14, 0.0052));
    bt.mesh(hs, pearl);
    // orden: graves en la ranura izquierda (E cerca de la cejuela)
    const L = posts.slice(0, 3), Rr = posts.slice(3, 6);
    posts.length = 0; posts.push(L[0], L[1], L[2], Rr[2], Rr[1], Rr[0]);
  } else if (cfg.head === 'uke' || cfg.head === 'banjo') {
    const ys = cfg.head === 'banjo' ? [0.055, 0.105] : [0.036, 0.074];
    const btnM = plastic(0xf1ead6, 0.25);
    const list = [];
    for (let i = 0; i < 2; i++) list.push([-(hol.halfW(ys[i], -1) - 0.011), ys[i]]);
    for (let i = 0; i < 2; i++) list.push([hol.halfW(ys[1 - i], 1) - 0.011, ys[1 - i]]);
    for (const [x, y] of list) {
      mA.put(new THREE.CylinderGeometry(0.0042, 0.0042, 0.002, 12), x, y, 0.001, Math.PI / 2);
      mA.put(new THREE.CylinderGeometry(0.0028, 0.0028, 0.01, 10), x, y, 0.005, Math.PI / 2);
      mA.put(new THREE.CylinderGeometry(0.0055, 0.0045, 0.012, 14), x, y, -t - 0.006, Math.PI / 2);
      mB.put(latheGeo([[0, 0], [0.0075, 0.001], [0.0082, 0.006], [0.0072, 0.011], [0, 0.012]], 16), x, y, -t - 0.012, -Math.PI / 2);
      posts.push([x, y, 0.0055]);
    }
    mA.mesh(hs, hwM); mB.mesh(hs, btnM);
  }
  // a coordenadas de la guitarra
  const eul = new THREE.Euler(-cfg.tilt, 0, 0), org = V3(0, yNut, zN);
  return { hol, posts: posts.map(p => V3(...p).applyEuler(eul).add(org)), toLocal: (x, y, z) => V3(x, y, z).applyEuler(eul).add(org) };
}

// ---------------------------------------------------------------------
export function guitar(kind = 'lespaul', o = {}) {
  const g = new THREE.Group();
  const cfg = { ...GK[kind] };
  const ol = bodyOutline(cfg.body);
  const bodyTop = ol.yTop(0);
  const fin = kind + '|' + (o.finish ?? o.solid ?? '') + (o.inner ?? '');
  const d = cfg.d, zTop = d / 2;
  const R = rng(fin);
  // escala y posición de la cejuela
  let yB, yNut;
  if (cfg.joint) { yNut = bodyTop + cfg.S * (1 - Math.pow(2, -cfg.joint / 12)); yB = yNut - cfg.S; } else { yB = cfg.yB; yNut = yB + cfg.S; }
  const fretY = (i) => yNut - cfg.S * (1 - Math.pow(2, -i / 12));
  const y0 = fretY(cfg.frets) - (cfg.acoustic ? 0.006 : 0.007);
  const carve = kind === 'lespaul';
  const zC = zTop + (carve ? 0.012 : 0);
  const zF = cfg.acoustic ? zTop + 0.0062 : zC + 0.011;
  const zN = zF - 0.006;
  const wAt = (y) => cfg.nutW + (cfg.endW - cfg.nutW) * (yNut - y) / (yNut - y0);
  const hw = o.goldHW ? C.gold() : C.chrome();
  const cream = plastic(0xefe2bf, 0.35);

  // ---------- cuerpo ----------
  const burst = !o.solid && !o.topTex;
  const inner = o.inner ?? '#e8a33a', outer = o.outer ?? '#5a1e05';
  let topSpec;
  if (cfg.acoustic) {
    topSpec = {
      base: inner, edge: outer, grain: kind === 'ukulele' ? 'koa' : 'spruce', purfling: kind === 'classical' ? '#6a3a1a' : '#1a100a',
      burst: o.flame === false && inner !== outer && !['nat', 'cl', 'uk'].includes(o.finish) ? [[outer, 0.09, 0.03], [outer, 0.03, 0.008]] : [[outer, 0.02, 0.01]],
    };
  } else if (burst) {
    topSpec = { base: inner, edge: '#140600', flame: o.flame ?? true, grain: kind === 'tele' ? 'ash' : null, glow: 'rgba(255,230,160,0.25)', burst: [[outer, 0.11, 0.035], [outer, 0.05, 0.012], ['#120500', 0.016, 0.004]] };
  } else if (o.solid) topSpec = null;
  // tapa para acústicas: roseta, golpeador
  const holeR = cfg.hole ?? 0, yH = cfg.acoustic ? y0 - holeR - (kind === 'ukulele' ? 0.008 : 0.012) : 0;
  if (cfg.acoustic) {
    topSpec.over = (c, X, Y, S, Rr) => {
      const cx = X(0), cy = Y(yH), r = S(holeR);
      if (kind === 'classical') {
        const cols = ['#2f6a3a', '#b8322a', '#efe6cc', '#1a1a1a', '#d9a441'];
        for (let ring = 0; ring < 3; ring++) for (let k = 0; k < 90; k++) { c.fillStyle = cols[(k + ring * 2) % 5]; const a = k / 90 * Math.PI * 2; c.save(); c.translate(cx + Math.cos(a) * (r + S(0.006 + ring * 0.0035)), cy + Math.sin(a) * (r + S(0.006 + ring * 0.0035))); c.rotate(a); c.fillRect(-S(0.0018), -S(0.0018), S(0.0036), S(0.0036)); c.restore(); }
        c.strokeStyle = '#1a0e08'; c.lineWidth = S(0.0015); for (const rr of [0.003, 0.018]) { c.beginPath(); c.arc(cx, cy, r + S(rr), 0, 7); c.stroke(); }
      } else {
        c.strokeStyle = '#120c08'; c.lineWidth = S(0.0022); for (const rr of [0.004, 0.0075, 0.016]) { c.beginPath(); c.arc(cx, cy, r + S(rr), 0, 7); c.stroke(); }
        for (let k = 0; k < 140; k++) { const a = k / 140 * Math.PI * 2; c.strokeStyle = k % 2 ? '#f2ead6' : '#1a120c'; c.lineWidth = S(0.0014); c.beginPath(); c.moveTo(cx + Math.cos(a) * (r + S(0.0095)), cy + Math.sin(a) * (r + S(0.0095))); c.lineTo(cx + Math.cos(a + 0.05) * (r + S(0.0135)), cy + Math.sin(a + 0.05) * (r + S(0.0135))); c.stroke(); }
      }
      if (kind === 'acoustic') {
        const gp = smoothLoop([[0.064, yH + 0.012], [0.052, yH - 0.03], [0.03, yH - 0.068], [0.075, yH - 0.078], [0.112, yH - 0.03], [0.108, yH + 0.035], [0.08, yH + 0.066], [0.05, yH + 0.045]], 80);
        c.save(); drawLoop(c, gp, X, Y); c.clip(); tortoise(c, Rr, 0, 0, c.canvas.width, c.canvas.height); c.restore();
        c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 1; drawLoop(c, gp, X, Y); c.stroke();
      }
    };
  }
  const topKey = fin + '|t';
  const topMat = topSpec ? mat(0xffffff, { map: bodyTex(topKey, ol, topSpec), roughness: cfg.acoustic ? 0.3 : 0.16, env: true, envI: cfg.acoustic ? 0.35 : 0.7 }) : glossy(o.solid);

  if (cfg.acoustic) {
    const backC = o.backColor ?? (kind === 'ukulele' ? 0x8a4a1c : kind === 'classical' ? 0x7a3c1c : 0x63301a);
    const backM = mat(backC, { map: woodTex(backC), roughness: 0.3, env: true, envI: 0.4 });
    const bodyGeo = slab(ol.shape(), d - 0.003, 0.0015);
    add(g, bodyGeo, backM, 0, 0, -d / 2);
    const top = ol.shape(); const hp = new THREE.Path(); hp.absarc(0, yH, holeR, 0, Math.PI * 2, true); top.holes.push(hp);
    add(g, planarUV(slab(top, 0.003, 0, 1, 48), ol.minX, ol.minY, ol.w, ol.h), topMat, 0, 0, zTop - 0.003);
    add(g, new THREE.CircleGeometry(holeR * 1.01, 40), mat(0x0e0704, { roughness: 1 }), 0, yH, zTop - 0.0024).receiveShadow = false;
    // filetes
    const bind = o.bindColor ?? (kind === 'classical' ? 0x5a2a14 : 0xf1e6c8);
    for (const z of [zTop - 0.0005, -d / 2 + 0.0008]) {
      const cv = new THREE.CatmullRomCurve3(ol.pts.map(([x, y]) => V3(x, y, z)), true);
      add(g, new THREE.TubeGeometry(cv, 260, 0.0022, 6, true), plastic(bind, 0.35));
    }
  } else if (carve) {
    const backC = o.sideColor ?? (o.solid === 0x0d0d0d ? 0x0d0d0d : 0x4a1206);
    add(g, slab(ol.shape(), d, 0.002), glossy(backC), 0, 0, -d / 2);
    const cg = carveGeo(ol, CARVE, zTop);
    add(g, cg, topMat);
    const cv = new THREE.CatmullRomCurve3(ol.pts.map(([x, y]) => V3(x, y, zTop + 0.0004)), true);
    add(g, new THREE.TubeGeometry(cv, 260, 0.0024, 6, true), cream);
  } else {
    const bev = { strat: 0.007, bass: 0.007, tele: 0.0022, sg: 0.007, flyingv: 0.004, explorer: 0.004 }[kind] ?? 0.004;
    const pts = ol.inset(bev);
    const bg = slab(polyShape(pts), d, bev, kind === 'sg' ? 1 : 4);
    planarUV(bg, ol.minX, ol.minY, ol.w, ol.h);
    add(g, bg, topMat, 0, 0, -d / 2);
  }
  const zSurf = (x, y) => (carve ? zTop + carveZ(ol.dist(x, y)) : zTop);

  // ---------- mástil ----------
  const neckC = o.maple ? 0xe2bb78 : o.neckColor ?? (kind === 'strat' || kind === 'tele' || kind === 'bass' ? 0xdcb070 : cfg.nylon ? 0x8a5a2e : 0x5a220e);
  const neckM = mat(neckC, { map: woodTex(neckC), roughness: 0.28, env: true, envI: 0.45 });
  const set = cfg.set;
  const heelTop = bodyTop, hl = cfg.acoustic ? 0.07 : 0.05;
  const dpBase = kind === 'ukulele' ? 0.016 : 0.02;
  const heelD = (cfg.acoustic ? zN + d / 2 - 0.002 : zN + d / 2 - 0.006);
  const dpAt = (y) => {
    const base = dpBase + 0.003 * Math.min(1, (yNut - y) / (yNut - y0));
    if (!set) return base;
    const t = Math.max(0, Math.min(1, (heelTop + hl - y) / hl)), s = t * t * (3 - 2 * t);
    return base + (heelD - base) * s;
  };
  const yNeck0 = cfg.acoustic ? heelTop - 0.012 : set ? y0 : y0;
  add(g, neckGeo(yNeck0, yNut + 0.001, zN, wAt, dpAt, 48), neckM);
  // diapasón
  const fbWood = o.maple ? 'maple' : cfg.fb;
  const fbInlay = fbWood === 'maple' ? 'dotmaple' : o.inlay ?? cfg.inlay;
  const fbShape = polyShape([[-cfg.endW / 2, y0], [cfg.endW / 2, y0], [cfg.nutW / 2, yNut - 0.0035], [-cfg.nutW / 2, yNut - 0.0035]]);
  const fbGeo = planarUV(slab(fbShape, 0.006, 0.0006, 1), -cfg.endW / 2, y0, cfg.endW, yNut - y0);
  const fbT = fretboardTex(fin + fbWood + fbInlay + (o.fbBound ?? cfg.fbBound), { y0, yNut, wEnd: cfg.endW, wNut: cfg.nutW, frets: cfg.frets, inlay: fbInlay, wood: fbWood, bound: o.fbBound ?? cfg.fbBound, S: cfg.S });
  add(g, fbGeo, mat(0xffffff, { map: fbT, roughness: fbWood === 'maple' ? 0.25 : 0.55, env: true, envI: 0.3 }), 0, 0, zF - 0.006);
  // trastes
  const fr = new Acc();
  for (let i = 1; i <= cfg.frets; i++) { const y = fretY(i); if (y < y0 + 0.002) break; fr.put(new THREE.CylinderGeometry(0.00105, 0.00105, wAt(y) - 0.001, 6, 1), 0, y, zF, 0, 0, Math.PI / 2); }
  fr.mesh(g, cfg.nylon ? metal(0xd8c9a0, 0.3) : C.silver(), false);
  // cejuela
  add(g, new THREE.BoxGeometry(cfg.nutW, 0.0035, 0.0058), mat(0xf0e8d4, { roughness: 0.35 }), 0, yNut - 0.00175, zF - 0.0017);

  // ---------- clavijero ----------
  let headSpec;
  if (cfg.head === 'lp') headSpec = { base: o.headColor ? hex(o.headColor) : '#0f0c0b', bound: o.goldHW, draw: (c, X, Y, S) => {
    logo(c, X, Y, S, o.brand ?? 'Gibraltar', 0, 0.148, 0.018, '#e9dcb0', { shadow: '#000' });
    logo(c, X, Y, S, o.goldHW ? 'Custom' : 'Les Paul', 0, 0.126, 0.009, '#d8c48a', { weight: 'italic' });
    if (o.goldHW) { c.fillStyle = '#f4efe6'; c.beginPath(); c.moveTo(X(0), Y(0.112)); c.lineTo(X(0.012), Y(0.098)); c.lineTo(X(0), Y(0.084)); c.lineTo(X(-0.012), Y(0.098)); c.fill(); }
    else { c.fillStyle = '#f0ece2'; c.beginPath(); c.moveTo(X(-0.012), Y(0.1)); c.quadraticCurveTo(X(0), Y(0.118), X(0.012), Y(0.1)); c.lineTo(X(0.006), Y(0.092)); c.lineTo(X(0), Y(0.1)); c.lineTo(X(-0.006), Y(0.092)); c.closePath(); c.fill(); }
    // tapa del alma
    c.fillStyle = '#0a0a0a'; c.strokeStyle = '#efe6d0'; c.lineWidth = S(0.0012);
    c.beginPath(); c.moveTo(X(-0.006), Y(0.004)); c.lineTo(X(0.006), Y(0.004)); c.quadraticCurveTo(X(0.016), Y(0.03), X(0.011), Y(0.042)); c.quadraticCurveTo(X(0), Y(0.05), X(-0.011), Y(0.042)); c.quadraticCurveTo(X(-0.016), Y(0.03), X(-0.006), Y(0.004)); c.closePath(); c.fill(); c.stroke();
    logo(c, X, Y, S, 'STANDARD', 0, 0.028, 0.0045, '#efe6d0', { weight: 'bold', family: 'system-ui' });
  } };
  else if (cfg.head === 'martin') headSpec = { base: '#1a100b', grain: '60,30,15', draw: (c, X, Y, S) => { logo(c, X, Y, S, o.brand ?? 'Marisol', 0, 0.162, 0.014, '#e8d7a2', { family: 'Georgia, serif', weight: 'bold' }); logo(c, X, Y, S, 'EST. 1948', 0, 0.147, 0.005, '#c8b78a', { weight: '600', family: 'system-ui' }); } };
  else if (cfg.head === 'slot') headSpec = { base: o.headColor ? hex(o.headColor) : '#4a2412', grain: '30,12,5', draw: (c, X, Y, S) => { c.strokeStyle = '#e8d7a2'; c.lineWidth = S(0.0012); c.beginPath(); c.moveTo(X(-0.02), Y(0.172)); c.quadraticCurveTo(X(0), Y(0.188), X(0.02), Y(0.172)); c.stroke(); } };
  else if (cfg.head === 'strat' || cfg.head === 'tele' || cfg.head === 'bass') {
    const maple = o.maple || kind === 'tele' || kind === 'bass' || !o.headColor;
    headSpec = { base: o.headColor ? hex(o.headColor) : maple ? '#dcb070' : '#dcb070', grain: '140,90,40', draw: (c, X, Y, S) => {
      const yl = cfg.head === 'bass' ? 0.175 : 0.128, xl = cfg.head === 'tele' ? 0.012 : cfg.head === 'bass' ? 0.022 : 0.02;
      logo(c, X, Y, S, o.brand ?? 'Stellar', xl, yl, 0.017, '#111', { rot: -Math.PI / 2 + 0.05, family: 'Georgia, serif' });
      logo(c, X, Y, S, kind === 'tele' ? 'Telecaster' : kind === 'bass' ? 'Jazz Bass' : 'Stratocaster', xl + 0.012, yl - 0.005, 0.0075, '#111', { rot: -Math.PI / 2 + 0.05, weight: 'bold', family: 'system-ui' });
    } };
  } else if (cfg.head === 'v' || cfg.head === 'hockey') headSpec = { base: o.solid ? hex(o.solid) : '#101010', draw: (c, X, Y, S) => logo(c, X, Y, S, o.brand ?? 'Gibraltar', cfg.head === 'hockey' ? 0.0 : 0, cfg.head === 'hockey' ? 0.13 : 0.118, 0.014, o.solid && o.solid > 0x888888 ? '#222' : '#e9dcb0', { rot: cfg.head === 'hockey' ? -Math.PI / 2 : 0 }) };
  else if (cfg.head === 'uke') headSpec = { base: '#5a2a12', grain: '30,10,0', draw: (c, X, Y, S) => logo(c, X, Y, S, o.brand ?? 'Kalani', 0, 0.093, 0.009, '#f0e2b8') };
  const H = headstock(g, cfg, { ...o, headSpec }, yNut, zN);

  // ---------- hardware del cuerpo ----------
  const tails = [], sads = [];
  const nS = cfg.strings;
  const sx = (i, sp) => (nS === 1 ? 0 : (i / (nS - 1) - 0.5) * sp);
  const straps = new Acc();
  const bot = ol.yBottom(0);
  strapButton(straps, 0, bot - 0.0005, 0, 0, -1);
  if (kind === 'lespaul' || kind === 'sg' || kind === 'strat' || kind === 'tele' || kind === 'bass' || kind === 'explorer' || kind === 'flyingv') {
    let best = null; for (let i = 0; i < ol.n; i++) { const [x, y] = ol.pts[i]; if (x < -0.02 && (!best || y > ol.pts[best][1])) best = i; }
    const [x, y] = ol.pts[best], [nx, ny] = ol.nor[best];
    strapButton(straps, x, y, 0, nx, ny);
  } else if (cfg.acoustic) strapButton(straps, 0, heelTop + 0.03, zN - dpAt(heelTop + 0.03) + 0.001, 0, 0, -1);
  straps.mesh(g, hw);

  if (kind === 'lespaul' || kind === 'sg' || kind === 'flyingv' || kind === 'explorer') {
    const zb = carve ? zC : zTop;
    const hbY = kind === 'flyingv' ? [0.232, 0.338] : kind === 'explorer' ? [0.212, 0.318] : [yB + 0.038, y0 - 0.026];
    for (const y of hbY) humbucker(g, y, (carve ? zSurf(0, y) : zTop) - 0.0003, { cover: o.pickupCover, hw, ringM: kind === 'lespaul' || kind === 'sg' ? cream : plastic(0x121212, 0.3), zebra: o.zebra });
    // puente tune-o-matic
    const tom = new Acc(), zs = zF + 0.0034;
    tom.put(new RoundedBoxGeometry(0.084, 0.0095, zs - zb - 0.002, 2, 0.0015), 0, yB, (zs + zb) / 2 - 0.002);
    for (let i = 0; i < 6; i++) tom.put(new THREE.BoxGeometry(0.0072, 0.0085, 0.0028), sx(i, cfg.brSp), yB + (i < 3 ? -0.001 : 0.001) * (i % 3), zs - 0.0012);
    for (const s of [-1, 1]) { tom.put(new THREE.CylinderGeometry(0.0055, 0.0055, 0.0028, 16), s * 0.0405, yB, zb + 0.0016, Math.PI / 2); tom.put(new THREE.CylinderGeometry(0.0021, 0.0021, zs - zb, 8), s * 0.0405, yB, (zs + zb) / 2, Math.PI / 2); }
    // cordal
    const yT = kind === 'flyingv' ? yB - 0.028 : yB - 0.04;
    tom.raw(rodGeo([-0.043, yT, zb + 0.0075], [0.043, yT, zb + 0.0075], 0.0048, 14));
    for (const s of [-1, 1]) { tom.put(new THREE.CylinderGeometry(0.0055, 0.0055, 0.0075, 14), s * 0.0405, yT, zb + 0.0037, Math.PI / 2); tom.put(new THREE.CylinderGeometry(0.004, 0.004, 0.002, 6), s * 0.0405, yT, zb + 0.0115, Math.PI / 2); }
    tom.mesh(g, hw);
    for (let i = 0; i < nS; i++) { tails.push(V3(sx(i, cfg.brSp * 0.92), yT + 0.002, zb + 0.0118)); sads.push(V3(sx(i, cfg.brSp), yB, zs + 0.0002)); }
    // controles
    const knobList = kind === 'lespaul' ? [[0.07, 0.123], [0.104, 0.146], [0.074, 0.078], [0.108, 0.1]]
      : kind === 'sg' ? [[0.066, 0.1], [0.1, 0.122], [0.072, 0.058], [0.106, 0.08]]
      : kind === 'flyingv' ? [[0.098, 0.118], [0.124, 0.098], [0.15, 0.078]]
      : [[0.07, 0.07], [0.115, 0.058], [0.16, 0.046]];
    knobs(g, knobList, kind === 'lespaul' ? 'tophat' : 'witch', kind === 'lespaul' ? (o.goldHW ? mat(0x1a1a1a, { roughness: 0.25 }) : mat(0xb87a22, { roughness: 0.25, env: true, envI: 0.6, transparent: true, opacity: 0.92 })) : plastic(0x111111, 0.3), kind === 'lespaul' ? metal(0xd9c27a, 0.25) : metal(0xc8c8c8, 0.3), zTop, carve ? (x, y) => zSurf(x, y) - 0.0006 : null);
    // selector
    const tg = kind === 'lespaul' ? [-0.094, 0.372] : kind === 'sg' ? [-0.1, 0.33] : kind === 'flyingv' ? [-0.11, 0.15] : [0.14, 0.12];
    const zt = (carve ? zSurf(tg[0], tg[1]) : zTop);
    add(g, new THREE.CylinderGeometry(0.0115, 0.0115, 0.0012, 24), cream, tg[0], tg[1], zt + 0.0004, Math.PI / 2);
    const sw = new Acc();
    sw.put(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 6), tg[0], tg[1], zt + 0.0025, Math.PI / 2);
    sw.raw(rodGeo([tg[0], tg[1], zt + 0.003], [tg[0] + 0.004, tg[1] + 0.004, zt + 0.02], 0.0012, 8));
    sw.mesh(g, hw);
    add(g, new THREE.SphereGeometry(0.0032, 12, 10), cream, tg[0] + 0.0045, tg[1] + 0.0045, zt + 0.021).scale.set(1, 1, 1.5);
    // golpeador
    if (kind === 'lespaul') {
      const pg = smoothLoop([[0.047, 0.222], [0.07, 0.205], [0.093, 0.225], [0.104, 0.27], [0.104, 0.315], [0.094, 0.35], [0.076, 0.37], [0.058, 0.362], [0.048, 0.33], [0.047, 0.27]], 60);
      add(g, slab(polyShape(pg), 0.0018, 0.0005), o.solid === 0x0d0d0d ? plastic(0x0a0a0a, 0.2) : cream, 0, 0, zC + 0.0065);
      add(g, new THREE.BoxGeometry(0.004, 0.012, 0.006), hw, 0.1, 0.245, zSurf(0.1, 0.245) + 0.003);
    } else if (kind === 'sg') {
      const pg = smoothLoop([[-0.03, 0.33], [0.03, 0.326], [0.055, 0.29], [0.078, 0.245], [0.1, 0.17], [0.095, 0.14], [0.055, 0.13], [0.045, 0.19], [-0.045, 0.19], [-0.07, 0.15], [-0.1, 0.16], [-0.11, 0.22], [-0.09, 0.3], [-0.06, 0.33]], 80);
      add(g, slab(polyShape(pg), 0.0022, 0.0006), plastic(0x0c0c0c, 0.2), 0, 0, zTop + 0.0002);
    } else if (kind === 'flyingv') {
      const pg = roundPoly([[0, 0.2, 0.01], [0.075, 0.215, 0.01], [0.05, 0.42, 0.02], [0.028, 0.44, 0.01], [-0.028, 0.44, 0.01], [-0.05, 0.42, 0.02], [-0.075, 0.215, 0.01]], 0.01, 5);
      add(g, slab(polyShape(pg), 0.0022, 0.0006), plastic(o.pickguard ?? 0x0c0c0c, 0.2), 0, 0, zTop + 0.0002);
    } else {
      const pg = roundPoly([[-0.048, 0.178, 0.015], [0.058, 0.17, 0.015], [0.08, 0.25, 0.02], [0.07, 0.355, 0.015], [0.034, 0.39, 0.01], [-0.034, 0.408, 0.01], [-0.072, 0.392, 0.015], [-0.078, 0.26, 0.02]], 0.01, 5);
      add(g, slab(polyShape(pg), 0.0022, 0.0006), plastic(o.pickguard ?? 0xf2efe6, 0.2), 0, 0, zTop + 0.0002);
    }
    // jack
    const e = ol.edge(kind === 'explorer' ? 0.03 : 0.085, 1);
    if (kind === 'lespaul' || kind === 'sg') {
      const jg = new Acc();
      jg.raw(orient(new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 14), V3(e.x + e.n[0] * 0.001, e.y + e.n[1] * 0.001, 0), V3(e.n[0], e.n[1], 0)));
      jg.mesh(g, hw);
      const pl = add(g, new THREE.BoxGeometry(0.032, 0.001, 0.022), cream, e.x + e.n[0] * 0.0004, e.y + e.n[1] * 0.0004, 0);
      pl.rotation.z = Math.atan2(e.n[1], e.n[0]) - Math.PI / 2;
    }
  } else if (kind === 'strat' || kind === 'bass') {
    const pgC = o.pickguard ?? 0xf6f3ea;
    if (kind === 'strat') {
      const pg = smoothLoop([[-0.03, 0.334], [0.028, 0.334], [0.05, 0.318], [0.066, 0.29], [0.092, 0.232], [0.112, 0.172], [0.118, 0.116], [0.106, 0.08], [0.084, 0.07], [0.062, 0.084], [0.05, 0.118], [0.02, 0.128], [-0.04, 0.132], [-0.066, 0.148], [-0.088, 0.186], [-0.098, 0.232], [-0.095, 0.275], [-0.078, 0.305], [-0.056, 0.324]], 120);
      add(g, slab(polyShape(pg), 0.0024, 0.0007), plastic(pgC, 0.25), 0, 0, zTop - 0.0002);
      const zp = zTop + 0.0022;
      const scs = [[0, y0 - 0.03, 0], [0, 0.212, 0], [0, 0.152, -0.13]];
      for (const [x, y, r] of scs) singleCoil(g, x, y, zp, r, { m: plastic(pgC === 0x151515 ? 0xf2eee2 : 0xf4f1e6, 0.3) });
      knobs(g, [[0.066, 0.19], [0.088, 0.148], [0.101, 0.106]], 'strat', plastic(0xf4f1e6, 0.3), null, zp);
      // selector 5 posiciones
      add(g, new THREE.BoxGeometry(0.004, 0.014, 0.001), plastic(0x111111), 0.078, 0.232, zp + 0.0003, 0, 0, -0.5);
      add(g, latheGeo([[0, 0], [0.0032, 0], [0.0036, 0.004], [0.0026, 0.009], [0, 0.0095]], 12), plastic(0xf4f1e6, 0.3), 0.078, 0.232, zp, Math.PI / 2).rotation.set(Math.PI / 2 - 0.3, 0, -0.5);
      // tornillos del golpeador
      const scr = new Acc(), pin = outline(pg).inset(0.0045); for (let i = 0; i < pin.length; i += 11) { const [x, y] = pin[i]; scr.put(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0008, 10), x, y, zp + 0.0003, Math.PI / 2); }
      scr.mesh(g, hw);
      // puente trémolo
      const br = new Acc(), zs = zTop + 0.0105;
      br.put(new RoundedBoxGeometry(0.074, 0.044, 0.0024, 2, 0.001), 0, yB - 0.012, zTop + 0.0012);
      for (let i = 0; i < 6; i++) { br.put(new RoundedBoxGeometry(0.0082, 0.02, zs - zTop - 0.002, 2, 0.0012), sx(i, cfg.brSp), yB - 0.004, (zs + zTop) / 2); br.put(new THREE.CylinderGeometry(0.0012, 0.0012, 0.014, 6), sx(i, cfg.brSp), yB - 0.008, zs - 0.0008, 0, 0, 0); }
      for (let i = 0; i < 6; i++) br.put(new THREE.CylinderGeometry(0.002, 0.002, 0.0008, 8), -0.033 + i * 0.0132, yB - 0.03, zTop + 0.0026, Math.PI / 2);
      br.raw(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(0.036, yB - 0.022, zTop + 0.002), V3(0.04, yB - 0.022, zTop + 0.018), V3(0.06, yB - 0.03, zTop + 0.028), V3(0.13, yB - 0.08, zTop + 0.032)]), 20, 0.0018, 6));
      br.mesh(g, hw);
      add(g, new THREE.SphereGeometry(0.0042, 12, 10), plastic(0xf4f1e6), 0.132, yB - 0.082, zTop + 0.032).scale.set(1.5, 1, 1);
      for (let i = 0; i < nS; i++) { tails.push(V3(sx(i, cfg.brSp), yB - 0.024, zTop + 0.0026)); sads.push(V3(sx(i, cfg.brSp), yB, zs)); }
      // jack de fútbol
      const jk = new Acc(); jk.put(new THREE.CylinderGeometry(0.012, 0.012, 0.0015, 20), 0.118, 0.062, zTop + 0.0005, Math.PI / 2, 0, 0, 1, 1, 0.55); jk.put(new THREE.CylinderGeometry(0.0055, 0.0055, 0.004, 14), 0.118, 0.062, zTop + 0.002, Math.PI / 2); jk.mesh(g, hw);
    } else {
      const pg = smoothLoop([[-0.03, 0.39], [0.03, 0.385], [0.055, 0.36], [0.075, 0.31], [0.09, 0.26], [0.1, 0.2], [0.07, 0.17], [0.03, 0.2], [-0.03, 0.205], [-0.075, 0.19], [-0.11, 0.21], [-0.13, 0.27], [-0.12, 0.34], [-0.085, 0.372]], 100);
      const pgM = o.pickguard === 'tort' || o.pickguard == null ? mat(0xffffff, { map: canvasTex('tort', 256, 256, (c) => tortoise(c, rng(4), 0, 0, 256, 256)), roughness: 0.25, env: true, envI: 0.5 }) : plastic(o.pickguard, 0.25);
      add(g, planarUV(slab(polyShape(pg), 0.0024, 0.0007), -0.13, 0.17, 0.26, 0.22), pgM, 0, 0, zTop - 0.0002);
      for (const y of [0.145, 0.245]) singleCoil(g, 0, y, zTop, 0, { w: 0.098, h: 0.02, poles: 8, span: 0.07, m: plastic(0x131313, 0.3) });
      // placa de control
      const cp = grp(g, 0.105, 0.105, zTop, 0, 0, 0.55);
      add(cp, slab(rrShape(0.026, 0.12, 0.013), 0.0018, 0.0005), hw);
      knobs(cp, [[0, 0.035], [0, 0], [0, -0.035]], 'dome', hw, null, 0.0018);
      const br = new Acc(), zs = zTop + 0.011;
      br.put(new THREE.BoxGeometry(0.072, 0.075, 0.0025), 0, yB - 0.015, zTop + 0.0013);
      br.put(new THREE.BoxGeometry(0.072, 0.004, 0.012), 0, yB - 0.052, zTop + 0.006);
      for (let i = 0; i < 4; i++) { br.raw(rodGeo([sx(i, cfg.brSp), yB - 0.02, zTop + 0.006], [sx(i, cfg.brSp), yB + 0.01, zTop + 0.006], 0.0045, 10)); br.put(new THREE.BoxGeometry(0.004, 0.006, 0.006), sx(i, cfg.brSp), yB, zs - 0.004); }
      br.mesh(g, hw);
      for (let i = 0; i < nS; i++) { tails.push(V3(sx(i, cfg.brSp), yB - 0.048, zTop + 0.008)); sads.push(V3(sx(i, cfg.brSp), yB, zs - 0.001)); }
    }
    // placa del mástil (atrás)
    const np = new Acc(); np.put(new RoundedBoxGeometry(0.05, 0.064, 0.0016, 2, 0.0006), 0, y0 + 0.04, -d / 2 - 0.0006);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) np.put(new THREE.CylinderGeometry(0.0028, 0.0028, 0.0012, 10), a * 0.017, y0 + 0.04 + b * 0.024, -d / 2 - 0.0016, Math.PI / 2);
    np.mesh(g, hw);
  } else if (kind === 'tele') {
    const pg = smoothLoop([[-0.03, 0.34], [0.028, 0.3], [0.045, 0.3], [0.06, 0.28], [0.06, 0.22], [0.03, 0.2], [-0.04, 0.2], [-0.07, 0.18], [-0.11, 0.2], [-0.125, 0.25], [-0.12, 0.33], [-0.09, 0.37], [-0.05, 0.37]], 100);
    add(g, slab(polyShape(pg), 0.0024, 0.0007), plastic(o.pickguard ?? 0x0c0c0c, 0.22), 0, 0, zTop - 0.0002);
    const cov = new Acc(); cov.put(new RoundedBoxGeometry(0.072, 0.024, 0.012, 3, 0.004), 0, y0 - 0.026, zTop + 0.006); cov.mesh(g, hw);
    // puente cenicero con pastilla inclinada
    const br = new Acc(), zs = zTop + 0.0105;
    br.put(new RoundedBoxGeometry(0.086, 0.108, 0.002, 2, 0.001), 0, yB + 0.012, zTop + 0.001);
    br.put(new THREE.BoxGeometry(0.086, 0.002, 0.011), 0, yB - 0.041, zTop + 0.0055);
    for (const s of [-1, 1]) br.put(new THREE.BoxGeometry(0.002, 0.055, 0.011), s * 0.042, yB - 0.014, zTop + 0.0055);
    for (let i = 0; i < 3; i++) br.raw(rodGeo([-0.03 + i * 0.02 - 0.009, yB, zs - 0.0035], [-0.03 + i * 0.02 + 0.009, yB, zs - 0.0035], 0.0035, 10));
    for (let i = 0; i < 6; i++) br.put(new THREE.CylinderGeometry(0.002, 0.002, 0.001, 8), sx(i, cfg.brSp), yB - 0.03, zTop + 0.0024, Math.PI / 2);
    br.mesh(g, hw);
    singleCoil(g, 0, yB + 0.038, zTop + 0.002, -0.12, { w: 0.075, h: 0.021, m: plastic(0x111111, 0.3) });
    for (let i = 0; i < nS; i++) { tails.push(V3(sx(i, cfg.brSp), yB - 0.03, zTop + 0.0026)); sads.push(V3(sx(i, cfg.brSp), yB, zs)); }
    const cp = grp(g, 0.098, 0.12, zTop, 0, 0, 0.3);
    add(cp, slab(rrShape(0.026, 0.14, 0.013), 0.0018, 0.0005), hw);
    knobs(cp, [[0, -0.01], [0, -0.048]], 'dome', hw, null, 0.0018);
    add(cp, new THREE.BoxGeometry(0.003, 0.012, 0.001), plastic(0x111111), 0, 0.045, 0.0022);
    add(cp, latheGeo([[0, 0], [0.004, 0], [0.004, 0.009], [0, 0.0095]], 12), plastic(0x111111, 0.3), 0, 0.045, 0.002).rotation.x = Math.PI / 2;
    const e = ol.edge(0.06, 1);
    const jk = new Acc(); jk.raw(orient(new THREE.CylinderGeometry(0.011, 0.009, 0.004, 18), V3(e.x, e.y, 0), V3(e.n[0], e.n[1], 0))); jk.mesh(g, hw);
    const np = new Acc(); np.put(new RoundedBoxGeometry(0.05, 0.064, 0.0016, 2, 0.0006), 0, y0 + 0.04, -d / 2 - 0.0006); np.mesh(g, hw);
  } else {
    // acústicas: puente de palo de rosa
    const bm = mat(0x1e120b, { roughness: 0.35, env: true, envI: 0.3 });
    const bone = mat(0xf0e8d4, { roughness: 0.35 });
    if (kind === 'classical' || kind === 'ukulele') {
      const bw = kind === 'ukulele' ? 0.07 : 0.18, bh = kind === 'ukulele' ? 0.018 : 0.028;
      add(g, slab(rrShape(bw, bh, 0.004), 0.007, 0.0012), bm, 0, yB - bh * 0.25, zTop);
      add(g, slab(rrShape(bw * 0.5, bh * 0.4, 0.002), 0.0035, 0.0008), bm, 0, yB - bh * 0.52, zTop + 0.006);
      add(g, new THREE.BoxGeometry(bw * 0.46, 0.0028, 0.0045), bone, 0, yB, zTop + 0.0085);
      for (let i = 0; i < nS; i++) { tails.push(V3(sx(i, cfg.brSp * 0.95), yB - bh * 0.52 - 0.002, zTop + 0.0098)); sads.push(V3(sx(i, cfg.brSp), yB, zTop + 0.0108)); }
    } else {
      const half = [[0, -0.014], [0.03, -0.015], [0.06, -0.012], [0.079, -0.006], [0.082, 0.001], [0.079, 0.008], [0.06, 0.013], [0.03, 0.016], [0, 0.014]];
      add(g, slab(polyShape(smoothLoop(mirrorHalf(half), 80)), 0.0085, 0.0015), bm, 0, yB - 0.004, zTop);
      add(g, new THREE.BoxGeometry(0.074, 0.0028, 0.0045), bone, 0, yB, zTop + 0.0098, 0, 0, 0.04);
      const pins = new Acc();
      for (let i = 0; i < nS; i++) { const x = sx(i, cfg.brSp * 0.97), y = yB - 0.011 + Math.abs(i - 2.5) * 0.0005; pins.put(latheGeo([[0, 0], [0.0032, 0], [0.0034, 0.0015], [0.0026, 0.0032], [0, 0.0036]], 12), x, y, zTop + 0.0085, Math.PI / 2); tails.push(V3(x, y, zTop + 0.0118)); sads.push(V3(sx(i, cfg.brSp), yB, zTop + 0.0122)); }
      pins.mesh(g, plastic(0xf4efe4, 0.3));
    }
  }

  // ---------- cuerdas ----------
  const plainM = cfg.nylon ? mat(0xf2efe8, { roughness: 0.3, transparent: true, opacity: 0.9 }) : metal(0xe6e8ea, 0.18);
  const woundM = cfg.nylon ? metal(0xd8d4cc, 0.35) : cfg.acoustic ? metal(0xc9a063, 0.3) : metal(0xc9ccd0, 0.3);
  const sp = new Acc(), sw = new Acc();
  for (let i = 0; i < nS; i++) {
    const wound = nS === 4 ? true : cfg.nylon ? i < 3 : i < (cfg.acoustic ? 4 : 3);
    const r = (nS === 4 ? 0.0009 - i * 0.00008 : 0.00042 + (nS - 1 - i) / (nS - 1) * 0.00045) * (cfg.nylon ? 1.25 : 1);
    const nut = V3(sx(i, cfg.nutSp), yNut - 0.0012, zF + 0.0013);
    const pts = [tails[i], sads[i], nut];
    if ((cfg.head === 'strat' || cfg.head === 'tele') && i >= 4) pts.push(H.toLocal(0.002 + (i - 4.5) * 0.003, 0.086, 0.0026));
    pts.push(H.posts[i]);
    const acc = wound ? sw : sp;
    for (let k = 0; k < pts.length - 1; k++) acc.raw(rodGeo(pts[k], pts[k + 1], r, 5, r, true));
  }
  sp.mesh(g, plainM, false); sw.mesh(g, woundM, false);

  g.userData.guitarLen = yNut + H.hol.maxY;
  g.userData.info = { ol, zBack: -d / 2, zFront: zC, zN, yNut, wAt, dpAt };
  return g;
}

// guitarra sobre soporte de piso tubular (todo conectado, sin piezas flotantes)
function floorStand(gt, lean = 0.22, s = 1) {
  const g = new THREE.Group();
  const info = gt.userData.info;
  const yC = 0.105 * s;
  gt.position.set(0, yC, 0); gt.rotation.x = -lean; g.add(gt); gt.updateMatrix();
  const L = (x, y, z) => V3(x, y, z).applyMatrix4(gt.matrix);
  const tube = new Acc(), foam = new Acc();
  const tm = metal(0x1c1c1e, 0.45), fm = mat(0x0e0e0e, { roughness: 0.95 });
  const ol = info.ol;
  // brazos de la cuna
  const ax = Math.min(0.1, ol.w * 0.26) * (s < 1 ? 1 : 1);
  const arms = [];
  for (const sg of [-1, 1]) {
    const yb = ol.yBottom(sg * ax);
    const a = L(sg * ax, yb - 0.0075 * s, info.zBack - 0.012), b = L(sg * ax, yb - 0.0075 * s, info.zFront + 0.012), c = L(sg * ax, yb + 0.03 * s, info.zFront + 0.016);
    foam.raw(rodGeo(a, b, 0.0078 * s, 10)); foam.raw(rodGeo(b, c, 0.0078 * s, 10));
    foam.put(new THREE.SphereGeometry(0.0078 * s, 10, 8), b.x, b.y, b.z); foam.put(new THREE.SphereGeometry(0.0078 * s, 10, 8), c.x, c.y, c.z); foam.put(new THREE.SphereGeometry(0.0078 * s, 10, 8), a.x, a.y, a.z);
    arms.push(a);
  }
  // poste: detrás del punto más atrasado del cuerpo
  let zMin = 0;
  for (let i = 0; i < ol.n; i += 4) { const p = L(ol.pts[i][0], ol.pts[i][1], info.zBack); zMin = Math.min(zMin, p.z); }
  const zPost = zMin - 0.035 * s;
  const yY = info.yNut - 0.11;
  const nw = info.wAt(yY), ndp = info.dpAt(yY);
  const Rr = nw / 2 + 0.008 * s;
  const zc = info.zN - ndp * 0.55;
  const ybot = L(0, yY, zc - Rr);
  const hub = V3(0, 0.17 * s, zPost);
  const top = V3(0, ybot.y, zPost);
  tube.raw(rodGeo(hub, top, 0.0095 * s, 12));
  tube.raw(rodGeo(top, ybot, 0.0075 * s, 10));
  tube.put(new THREE.SphereGeometry(0.0095 * s, 12, 8), top.x, top.y, top.z);
  tube.put(new THREE.CylinderGeometry(0.013 * s, 0.013 * s, 0.04 * s, 14), hub.x, hub.y, hub.z);
  // horquilla
  const yoke = grp(g); yoke.position.copy(L(0, yY, zc)); yoke.rotation.copy(gt.rotation);
  const yk = new Acc();
  yk.put(new THREE.TorusGeometry(Rr, 0.0055 * s, 8, 20, Math.PI), 0, 0, 0, -Math.PI / 2);
  for (const sg of [-1, 1]) yk.put(new THREE.SphereGeometry(0.0065 * s, 10, 8), sg * Rr, 0, 0);
  yk.mesh(yoke, fm);
  // patas
  const zFront = L(0, 0, info.zFront).z + 0.06 * s;
  const feet = [V3(-0.17 * s, 0.009, zFront), V3(0.17 * s, 0.009, zFront), V3(0, 0.009, zPost - 0.2 * s)];
  for (const f of feet) { tube.raw(rodGeo(hub, f, 0.0085 * s, 10)); foam.put(new THREE.SphereGeometry(0.011 * s, 10, 8), f.x, f.y + 0.002, f.z, 0, 0, 0, 1, 0.8, 1); }
  for (const a of arms) tube.raw(rodGeo(a, V3(0, hub.y - 0.01 * s, hub.z), 0.0075 * s, 10));
  tube.raw(rodGeo(arms[0], arms[1], 0.0075 * s, 10));
  tube.mesh(g, tm); foam.mesh(g, fm);
  return g;
}
function onStand(gt, lean = 0.22) { return floorStand(gt, lean); }

export const GUITARS = {
  lespaul_sunburst: () => onStand(guitar('lespaul', { finish: 'hb', inner: '#f2b441', outer: '#7a2a06' })),
  lespaul_cherry: () => onStand(guitar('lespaul', { finish: 'cherry', inner: '#d8322a', outer: '#4a0505' })),
  lespaul_goldtop: () => onStand(guitar('lespaul', { solid: 0xc9a441, sideColor: 0x3a1606, pickupCover: false, zebra: false, finish: 'gold' })),
  lespaul_black: () => onStand(guitar('lespaul', { solid: 0x0d0d0d, goldHW: true, pickupCover: true, brand: 'Gibraltar', finish: 'black', inlay: 'block', neckColor: 0x0d0d0d, fbBound: true })),
  strat_white: () => onStand(guitar('strat', { solid: 0xf2efe6, maple: true, pickguard: 0xf6f3ea, finish: 'white' })),
  strat_sunburst: () => onStand(guitar('strat', { inner: '#f1c248', outer: '#240d02', flame: false, finish: '3t' })),
  strat_red: () => onStand(guitar('strat', { solid: 0xb81c1c, maple: true, finish: 'red' })),
  strat_seafoam: () => onStand(guitar('strat', { solid: 0x7fc4b0, pickguard: 0xf5ecd8, finish: 'sea' })),
  tele_butterscotch: () => onStand(guitar('tele', { inner: '#e8b765', outer: '#c98f3c', flame: false, finish: 'bs', pickguard: 0x0c0c0c })),
  sg_cherry: () => onStand(guitar('sg', { solid: 0x7a1208, finish: 'sg' })),
  acoustic_natural: () => onStand(guitar('acoustic', { inner: '#efd39a', outer: '#c79a58', flame: false, finish: 'nat' }), 0.19),
  acoustic_burst: () => onStand(guitar('acoustic', { inner: '#e8b050', outer: '#2a0f03', flame: false, finish: 'ab' }), 0.19),
  classical: () => onStand(guitar('classical', { inner: '#d9a868', outer: '#b07a44', flame: false, finish: 'cl', headColor: 0x4a2412 }), 0.19),
  flyingv: () => onStand(guitar('flyingv', { solid: 0xe8e6de, pickguard: 0x0c0c0c, finish: 'v' })),
  explorer: () => onStand(guitar('explorer', { solid: 0x141414, pickguard: 0xf6f3ea, finish: 'ex' })),
  bass_jazz: () => onStand(guitar('bass', { inner: '#e8a33a', outer: '#1a0a02', flame: false, finish: 'bass' })),
  ukulele: () => floorStand(guitar('ukulele', { inner: '#c98a4a', outer: '#8a4a1c', flame: false, finish: 'uk' }), 0.2, 0.62),
};

// banjo de 5 cuerdas con resonador
export function banjo() {
  const g = new THREE.Group();
  const Rp = 0.14, cy = 0.16, S = 0.67, yB = cy - 0.055, yNut = yB + S, frets = 22;
  const fretY = (i) => yNut - S * (1 - Math.pow(2, -i / 12));
  const y0 = fretY(frets) - 0.006;
  const zHead = 0.022, zF = zHead + 0.016, zN = zF - 0.006;
  const nutW = 0.031, endW = 0.037;
  const wAt = (y) => nutW + (endW - nutW) * (yNut - y) / (yNut - y0);
  const potTop = cy + Rp + 0.005;
  const dpAt = (y) => { const t = Math.max(0, Math.min(1, (potTop + 0.05 - y) / 0.05)), s = t * t * (3 - 2 * t); return 0.019 + (0.05 - 0.019) * s; };
  const hw = C.chrome();
  const woodC = 0x8a4a1e, woodM = mat(woodC, { map: woodTex(woodC), roughness: 0.25, env: true, envI: 0.5 });
  // resonador (lathe hacia atrás)
  add(g, latheGeo([[0.152, 0], [0.16, 0.006], [0.161, 0.022], [0.153, 0.036], [0.13, 0.045], [0.09, 0.049], [0.001, 0.05]], 72), woodM, 0, cy, -0.004, -Math.PI / 2);
  // aro de madera, brida, aro tensor y parche
  add(g, new THREE.CylinderGeometry(0.1415, 0.1415, 0.028, 72, 1, true), woodM, 0, cy, 0.008, Math.PI / 2);
  add(g, latheGeo([[0.14, 0], [0.159, 0], [0.161, 0.003], [0.141, 0.0045]], 72), hw, 0, cy, -0.004, -Math.PI / 2);
  add(g, new THREE.TorusGeometry(0.1405, 0.0045, 10, 80), hw, 0, cy, 0.024);
  const headT = canvasTex('banjohead', 512, 512, (c, w, h) => {
    const R = rng(77);
    c.fillStyle = '#efe9da'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '120,110,90' : '255,255,255'},${0.05 + R() * 0.06})`; c.fillRect(R() * w, R() * h, 2 + R() * 3, 2 + R() * 3); }
    c.fillStyle = '#3a2a1a'; c.font = 'italic bold 54px Georgia'; c.textAlign = 'center'; c.fillText('Bodega', w / 2, h * 0.36);
    c.font = '600 22px system-ui'; c.fillText('ORO DE LUJO · 1924', w / 2, h * 0.42);
  });
  add(g, new THREE.CircleGeometry(0.138, 72), mat(0xffffff, { map: headT, roughness: 0.75 }), 0, cy, 0.0228);
  const br = new Acc();
  for (let i = 0; i < 24; i++) {
    const a = (i + 0.5) / 24 * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
    br.raw(rodGeo([ca * 0.1505, cy + sa * 0.1505, -0.001], [ca * 0.1465, cy + sa * 0.1465, 0.0265], 0.0016, 6));
    br.put(new THREE.CylinderGeometry(0.0032, 0.0032, 0.006, 6), ca * 0.1505, cy + sa * 0.1505, -0.004, Math.PI / 2);
  }
  br.raw(xf(new THREE.TorusGeometry(0.147, 0.0035, 8, 24, 1.1), 0, cy, 0.031, 0, 0, -1.45));
  // cordal
  const tp = polyShape(roundPoly([[-0.009, cy - 0.149], [0.009, cy - 0.149], [0.019, cy - 0.085], [-0.019, cy - 0.085]], 0.004, 3));
  br.raw(xf(slab(tp, 0.0026, 0.0008), 0, 0, 0.029));
  br.mesh(g, hw);
  // mástil, diapasón, trastes
  add(g, neckGeo(cy + Rp - 0.004, yNut + 0.001, zN, wAt, dpAt, 48), woodM);
  const fbShape = polyShape([[-endW / 2, y0], [endW / 2, y0], [nutW / 2, yNut - 0.0035], [-nutW / 2, yNut - 0.0035]]);
  const fbT = fretboardTex('banjo', { y0, yNut, wEnd: endW, wNut: nutW, frets, inlay: 'dot', wood: 'ebony', bound: true, S });
  add(g, planarUV(slab(fbShape, 0.006, 0.0006, 1), -endW / 2, y0, endW, yNut - y0), mat(0xffffff, { map: fbT, roughness: 0.5 }), 0, 0, zF - 0.006);
  const fr = new Acc();
  for (let i = 1; i <= frets; i++) { const y = fretY(i); if (y < y0 + 0.002) break; fr.put(new THREE.CylinderGeometry(0.001, 0.001, wAt(y) - 0.001, 6), 0, y, zF, 0, 0, Math.PI / 2); }
  fr.mesh(g, C.silver(), false);
  add(g, new THREE.BoxGeometry(nutW, 0.0035, 0.0058), mat(0xf0e8d4, { roughness: 0.35 }), 0, yNut - 0.00175, zF - 0.0017);
  const H = headstock(g, { head: 'banjo', tilt: 0.2, ht: 0.016, strings: 4, tuner: 'uke' }, { headSpec: { base: '#1a0f08', grain: '60,30,10', draw: (c, X, Y, Sx) => { c.fillStyle = '#f2ece0'; c.beginPath(); c.ellipse(X(0), Y(0.13), Sx(0.012), Sx(0.02), 0, 0, 7); c.fill(); c.fillStyle = '#1a0f08'; c.beginPath(); c.ellipse(X(0), Y(0.13), Sx(0.005), Sx(0.012), 0, 0, 7); c.fill(); } } }, yNut, zN);
  // quinta cuerda: clavija lateral en el traste 5
  const y5 = fretY(5) + 0.004, x5 = -wAt(y5) / 2;
  const p5 = new Acc();
  p5.raw(rodGeo([x5 + 0.002, y5, zF - 0.012], [x5 - 0.014, y5, zF - 0.012], 0.0025, 10));
  p5.put(new THREE.CylinderGeometry(0.0028, 0.0028, 0.006, 10), x5 + 0.004, y5, zF - 0.004, Math.PI / 2);
  p5.mesh(g, hw);
  add(g, latheGeo([[0, 0], [0.0072, 0.001], [0.008, 0.006], [0.007, 0.011], [0, 0.012]], 16), plastic(0xf1ead6, 0.25), x5 - 0.014, y5, zF - 0.012, 0, 0, Math.PI / 2);
  // puente de arce con tapa de ébano
  const bs = polyShape([[-0.04, 0], [-0.031, 0], [-0.026, 0.004], [-0.009, 0.004], [-0.005, 0], [0.005, 0], [0.009, 0.004], [0.026, 0.004], [0.031, 0], [0.04, 0], [0.037, 0.011], [-0.037, 0.011]]);
  add(g, slab(bs, 0.0045, 0.0006), C.wood(0xd8b47a), 0, yB + 0.00225, zHead, Math.PI / 2);
  add(g, new THREE.BoxGeometry(0.074, 0.002, 0.0015), mat(0x141010, { roughness: 0.4 }), 0, yB, zHead + 0.0115);
  // cuerdas
  const sp = new Acc(), sw = new Acc();
  for (let i = 0; i < 4; i++) {
    const xb = -0.0105 + i * 0.0085, xn = -0.0105 + i * 0.007;
    const pts = [V3(xb * 0.8, cy - 0.088, 0.0325), V3(xb, yB, zHead + 0.0122), V3(xn, yNut - 0.0012, zF + 0.0013), H.posts[i]];
    for (let k = 0; k < 3; k++) (i === 0 ? sw : sp).raw(rodGeo(pts[k], pts[k + 1], i === 0 ? 0.0006 : 0.00042, 5, undefined, true));
  }
  const p5s = [V3(-0.019, cy - 0.088, 0.0325), V3(-0.0225, yB, zHead + 0.0122), V3(x5 + 0.0035, y5, zF + 0.0013)];
  for (let k = 0; k < 2; k++) sp.raw(rodGeo(p5s[k], p5s[k + 1], 0.00038, 5, undefined, true));
  sp.mesh(g, metal(0xe6e8ea, 0.18), false); sw.mesh(g, metal(0xc9ccd0, 0.3), false);
  const ol = outline(Array.from({ length: 64 }, (_, i) => { const a = i / 64 * Math.PI * 2; return [Math.cos(a) * 0.16, cy + Math.sin(a) * 0.16]; }));
  g.userData.info = { ol, zBack: -0.054, zFront: 0.032, zN, yNut, wAt, dpAt };
  g.userData.guitarLen = yNut + 0.18;
  return floorStand(g, 0.2);
}

// =====================================================================
//  JARRONES
// =====================================================================
const VASE_PROFILES = {
  meiping: [[0, 0], [0.07, 0], [0.075, 0.01], [0.08, 0.08], [0.11, 0.2], [0.13, 0.27], [0.12, 0.31], [0.06, 0.34], [0.035, 0.35], [0.035, 0.37], [0.045, 0.375], [0.04, 0.38]],
  baluster: [[0, 0], [0.08, 0], [0.085, 0.015], [0.1, 0.08], [0.125, 0.17], [0.12, 0.24], [0.08, 0.3], [0.055, 0.34], [0.06, 0.4], [0.085, 0.45], [0.09, 0.46], [0.08, 0.46]],
  gourd: [[0, 0], [0.07, 0], [0.1, 0.04], [0.115, 0.1], [0.1, 0.17], [0.05, 0.21], [0.07, 0.25], [0.075, 0.29], [0.05, 0.33], [0.03, 0.36], [0.035, 0.38], [0.03, 0.38]],
  amphora: [[0, 0], [0.03, 0], [0.035, 0.03], [0.06, 0.08], [0.11, 0.18], [0.12, 0.26], [0.09, 0.34], [0.05, 0.38], [0.045, 0.44], [0.065, 0.46], [0.06, 0.47]],
  ginger: [[0, 0], [0.07, 0], [0.075, 0.01], [0.11, 0.08], [0.125, 0.15], [0.11, 0.22], [0.075, 0.25], [0.07, 0.26]],
  bottle: [[0, 0], [0.075, 0], [0.08, 0.01], [0.11, 0.08], [0.11, 0.14], [0.07, 0.2], [0.03, 0.24], [0.022, 0.34], [0.026, 0.4], [0.034, 0.42], [0.03, 0.42]],
  moon: [[0, 0], [0.05, 0], [0.055, 0.02], [0.13, 0.08], [0.16, 0.17], [0.13, 0.27], [0.05, 0.33], [0.035, 0.36], [0.04, 0.38], [0.035, 0.38]],
  rouleau: [[0, 0], [0.085, 0], [0.09, 0.01], [0.092, 0.27], [0.07, 0.3], [0.04, 0.32], [0.04, 0.38], [0.06, 0.4], [0.055, 0.4]],
  hu: [[0, 0], [0.07, 0], [0.075, 0.04], [0.065, 0.06], [0.1, 0.14], [0.12, 0.22], [0.1, 0.3], [0.07, 0.36], [0.075, 0.43], [0.085, 0.44], [0.08, 0.44]],
};
const VASE_PATTERNS = {
  bluewhite(c, w, h, R) {
    c.fillStyle = '#f5f3ee'; c.fillRect(0, 0, w, h);
    const blue = '#1f3f9a';
    c.fillStyle = blue; c.fillRect(0, 0, w, h * 0.06); c.fillRect(0, h * 0.94, w, h * 0.06);
    c.strokeStyle = blue; c.lineWidth = 3;
    for (let x = 0; x < w; x += 32) { c.beginPath(); c.moveTo(x, h * 0.9); c.quadraticCurveTo(x + 16, h * 0.78, x + 32, h * 0.9); c.stroke(); c.fillStyle = 'rgba(31,63,154,0.35)'; c.fill(); }
    for (let x = 0; x < w; x += 24) { c.beginPath(); c.moveTo(x, h * 0.1); c.lineTo(x + 12, h * 0.2); c.lineTo(x + 24, h * 0.1); c.stroke(); }
    c.lineWidth = 5;
    for (let k = 0; k < 2; k++) {
      c.beginPath(); const y0 = h * (0.4 + k * 0.18);
      for (let x = 0; x <= w; x += 6) c.lineTo(x, y0 + Math.sin(x * 0.025 + k * 2) * h * 0.06);
      c.stroke();
    }
    c.fillStyle = blue;
    for (let i = 0; i < 16; i++) { const x = R() * w, y = h * (0.3 + R() * 0.4); for (let j = 0; j < 3; j++) { c.beginPath(); c.arc(x + j * 9, y - j * 3, 7 - j, 0, 7); c.fill(); } }
    for (let i = 0; i < 40; i++) { c.globalAlpha = 0.5; c.beginPath(); c.arc(R() * w, h * (0.25 + R() * 0.5), 2 + R() * 4, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  },
  famille(c, w, h, R) {
    c.fillStyle = '#f7f1e6'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c9a246'; c.fillRect(0, 0, w, h * 0.04); c.fillRect(0, h * 0.96, w, h * 0.04);
    for (let i = 0; i < 26; i++) {
      const x = R() * w, y = h * (0.15 + R() * 0.7), r = 8 + R() * 10;
      c.strokeStyle = '#4a7a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y + 20, x + R() * 40 - 20, y + 40); c.stroke();
      c.fillStyle = ['#e07a9a', '#d94a5a', '#f2b8c8', '#f2d06a'][(R() * 4) | 0];
      for (let p = 0; p < 5; p++) { const a = p * 1.26; c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.55, r * 0.35, a, 0, 7); c.fill(); }
      c.fillStyle = '#f2d06a'; c.beginPath(); c.arc(x, y, r * 0.25, 0, 7); c.fill();
      c.fillStyle = '#5f9a48'; c.beginPath(); c.ellipse(x + 12, y + 14, 8, 4, 0.6, 0, 7); c.fill();
    }
  },
  celadon(c, w, h, R) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#a8c9b0'); g.addColorStop(1, '#7ea58e');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(40,60,45,0.35)'; c.lineWidth = 0.8;
    for (let i = 0; i < 120; i++) { let x = R() * w, y = R() * h; c.beginPath(); c.moveTo(x, y); for (let s = 0; s < 4; s++) { x += (R() - 0.5) * 30; y += (R() - 0.5) * 30; c.lineTo(x, y); } c.stroke(); }
  },
  imari(c, w, h, R) {
    c.fillStyle = '#f6f2ea'; c.fillRect(0, 0, w, h);
    const n = 6;
    for (let i = 0; i < n; i++) {
      c.fillStyle = i % 2 ? '#1d3a8a' : '#b8281f';
      c.beginPath(); c.moveTo(i * w / n, h * 0.2); c.quadraticCurveTo((i + 0.5) * w / n, h * 0.05, (i + 1) * w / n, h * 0.2); c.lineTo((i + 1) * w / n, h * 0.8); c.quadraticCurveTo((i + 0.5) * w / n, h * 0.95, i * w / n, h * 0.8); c.closePath(); c.fill();
      c.strokeStyle = '#d8b04a'; c.lineWidth = 3; c.stroke();
      c.fillStyle = '#f6f2ea'; c.beginPath(); c.arc((i + 0.5) * w / n, h / 2, w / n * 0.25, 0, 7); c.fill();
      c.fillStyle = '#d8b04a'; c.beginPath(); c.arc((i + 0.5) * w / n, h / 2, w / n * 0.12, 0, 7); c.fill();
    }
  },
  greek(c, w, h, R) {
    c.fillStyle = '#c9652e'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1b1210'; c.fillRect(0, 0, w, h * 0.25); c.fillRect(0, h * 0.78, w, h * 0.22);
    c.strokeStyle = '#1b1210'; c.lineWidth = 4;
    for (let x = 0; x < w; x += 24) { const y = h * 0.29; c.beginPath(); c.moveTo(x, y + 14); c.lineTo(x, y); c.lineTo(x + 18, y); c.lineTo(x + 18, y + 10); c.lineTo(x + 8, y + 10); c.lineTo(x + 8, y + 5); c.stroke(); }
    c.fillStyle = '#1b1210';
    for (let i = 0; i < 4; i++) {
      const x = (i + 0.5) * w / 4, y = h * 0.62;
      c.beginPath(); c.arc(x, y - 44, 9, 0, 7); c.fill();
      c.beginPath(); c.moveTo(x - 10, y - 34); c.lineTo(x + 10, y - 34); c.lineTo(x + 14, y + 6); c.lineTo(x - 14, y + 6); c.fill();
      c.fillRect(x - 12, y + 6, 6, 26); c.fillRect(x + 6, y + 6, 6, 26);
      c.fillRect(x + 10, y - 30, 22, 4); c.beginPath(); c.arc(x + 36, y - 28, 10, 0, 7); c.fill();
    }
  },
  cloisonne(c, w, h, R) {
    c.fillStyle = '#1f8f9a'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#e0b84a'; c.lineWidth = 2.5;
    for (let i = 0; i < 30; i++) { const x = R() * w, y = R() * h; c.beginPath(); for (let a = 0; a < 12; a += 0.3) c.lineTo(x + Math.cos(a) * a * 2.5, y + Math.sin(a) * a * 2.5); c.stroke(); }
    for (let i = 0; i < 14; i++) { const x = R() * w, y = h * (0.2 + R() * 0.6); c.fillStyle = ['#c8283a', '#f0d040', '#f2f2f2', '#2a3a9a'][(R() * 4) | 0]; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fill(); c.stroke(); }
    c.fillStyle = '#e0b84a'; c.fillRect(0, 0, w, h * 0.05); c.fillRect(0, h * 0.95, w, h * 0.05);
  },
  talavera(c, w, h, R) {
    c.fillStyle = '#f4efe2'; c.fillRect(0, 0, w, h);
    const blue = '#1c3f94', yel = '#e0a82e';
    c.fillStyle = blue; c.fillRect(0, h * 0.04, w, h * 0.05); c.fillRect(0, h * 0.91, w, h * 0.05);
    for (let i = 0; i < 5; i++) {
      const x = (i + 0.5) * w / 5, y = h / 2;
      c.fillStyle = blue; for (let p = 0; p < 8; p++) { const a = p * Math.PI / 4; c.beginPath(); c.ellipse(x + Math.cos(a) * 20, y + Math.sin(a) * 20, 14, 7, a, 0, 7); c.fill(); }
      c.fillStyle = yel; c.beginPath(); c.arc(x, y, 12, 0, 7); c.fill();
      c.fillStyle = blue; c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill();
      c.fillStyle = yel; for (let p = 0; p < 4; p++) { c.beginPath(); c.arc(x + w / 10, h * (0.2 + p * 0.2), 4, 0, 7); c.fill(); }
    }
    c.strokeStyle = blue; c.lineWidth = 2; for (let x = 0; x < w; x += 12) { c.beginPath(); c.arc(x, h * 0.17, 5, 0, Math.PI); c.stroke(); c.beginPath(); c.arc(x, h * 0.83, 5, Math.PI, 0); c.stroke(); }
  },
  oxblood(c, w, h, R) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#e9d7c2'); g.addColorStop(0.18, '#a3161a'); g.addColorStop(0.7, '#6a0a0e'); g.addColorStop(1, '#2a0304');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(255,${R() * 80 | 0},${R() * 60 | 0},0.08)`; c.fillRect(R() * w, R() * h, 3, 8 + R() * 20); }
  },
};
function vaseTex(pattern, seed) {
  return canvasTex(`vase|${pattern}|${seed}`, 512, 256, (c, w, h) => VASE_PATTERNS[pattern](c, w, h, rng(seed + pattern)));
}
export function vase(profile = 'meiping', pattern = 'bluewhite', seed = 1, o = {}) {
  const g = new THREE.Group();
  const pts = VASE_PROFILES[profile];
  const sc = o.scale ?? 1;
  const tex = vaseTex(pattern, seed);
  tex.wrapS = THREE.RepeatWrapping;
  const m = mat(0xffffff, { map: tex, roughness: pattern === 'greek' ? 0.7 : 0.12, env: true, envI: pattern === 'greek' ? 0.2 : 0.8, side: THREE.DoubleSide });
  // perfil suavizado + labio y boca hueca
  const cv = new THREE.SplineCurve(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
  const sm = cv.getPoints(90).map(p => [p.x, p.y]);
  const [rx, ry] = sm[sm.length - 1];
  const prof = [[0, 0], ...sm, [Math.max(0.004, rx - 0.006), ry - 0.002], [Math.max(0.004, rx - 0.009), ry - 0.03], [0, ry - 0.05]];
  const v = LA(g, prof.map(([x, y]) => [x * sc, y * sc]), m, 0, 0, 0, 72);
  // lathe UV: la textura corre sobre el perfil (v) y alrededor (u) — girar la textura
  tex.rotation = 0;
  if (profile === 'moon') v.scale.z = 0.45;
  const topY = pts[pts.length - 1][1] * sc;
  if (profile === 'ginger') {
    LA(g, [[0, 0.07], [0.075, 0.06], [0.078, 0.045], [0.07, 0.03], [0.06, 0], [0, 0]].map(([x, y]) => [x * sc, (y + 0.26) * sc]), m, 0, 0, 0, 48);
    SP(g, 0.022 * sc, m, 0, 0.335 * sc, 0);
  }
  if (profile === 'amphora' || profile === 'moon' || profile === 'hu') {
    for (const s of [-1, 1]) {
      if (profile === 'hu') TO(g, 0.03 * sc, 0.006 * sc, C.bronze(), s * 0.1 * sc, 0.37 * sc, 0, 0, Math.PI / 2, 0);
      else if (profile === 'moon') TU(g, [[s * 0.036 * sc, 0.352 * sc, 0], [s * 0.09 * sc, 0.375 * sc, 0], [s * 0.135 * sc, 0.31 * sc, 0], [s * 0.138 * sc, 0.235 * sc, 0]], 0.008 * sc, m);
      else TU(g, [[s * 0.043 * sc, 0.43 * sc, 0], [s * 0.1 * sc, 0.42 * sc, 0], [s * 0.1 * sc, 0.33 * sc, 0], [s * 0.08 * sc, 0.3 * sc, 0]], 0.009 * sc, m);
    }
  }
  if (o.stand !== false) {
    const wd = C.darkWood();
    const r = Math.max(...pts.slice(0, 3).map(p => p[0])) * sc * 1.25;
    const kids = [...g.children]; kids.forEach(ch => (ch.position.y += 0.042));
    // peana de madera tallada con patas de voluta
    add(g, latheGeo([[0, 0.042], [r * 0.98, 0.042], [r * 1.02, 0.038], [r * 1.06, 0.03], [r * 1.02, 0.024], [r * 1.1, 0.018], [r * 1.1, 0.014], [0, 0.014]], 48), wd);
    const ft = new Acc();
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; ft.raw(xf(new THREE.SphereGeometry(0.013, 12, 8), Math.cos(a) * r * 0.85, 0.009, Math.sin(a) * r * 0.85, 0, 0, 0, 1.3, 0.75, 1.3)); }
    ft.mesh(g, wd);
  }
  g.userData.topY = topY;
  return g;
}
export const VASE_VARIANTS = [
  ['meiping', 'bluewhite'], ['baluster', 'famille'], ['gourd', 'celadon'], ['amphora', 'greek'], ['ginger', 'imari'],
  ['bottle', 'oxblood'], ['moon', 'bluewhite'], ['rouleau', 'cloisonne'], ['hu', 'celadon'], ['baluster', 'talavera'],
  ['ginger', 'bluewhite'], ['meiping', 'famille'], ['bottle', 'celadon'], ['rouleau', 'imari'], ['gourd', 'cloisonne'], ['meiping', 'oxblood'],
];

// =====================================================================
//  OTROS INSTRUMENTOS Y AUDIO
// =====================================================================
export function harmonica() {
  const g = new THREE.Group();
  RB(g, 0.16, 0.012, 0.035, 0.004, C.chrome(), 0, 0.016, 0);
  RB(g, 0.16, 0.012, 0.035, 0.004, C.chrome(), 0, 0.034, 0);
  B(g, 0.158, 0.008, 0.033, C.wood(0x8a5a2a), 0, 0.025, 0);
  for (let i = 0; i < 12; i++) B(g, 0.007, 0.005, 0.002, mat(0x111111), -0.07 + i * 0.0127, 0.025, 0.0166);
  P(g, 0.08, 0.012, labelTex('CHROMONICA 64', { bg: '#dcdfe2', fg: '#222', w: 512, h: 80, font: 'bold 50px Georgia' }), 0, 0.034, 0.0176);
  CY(g, 0.006, 0.006, 0.02, C.chrome(), 0.09, 0.025, 0, 0, 0, Math.PI / 2, 12);
  RB(g, 0.2, 0.012, 0.07, 0.004, C.leather(0x5a1a1a), 0, 0.006, 0.01);
  return g;
}
export function vinylRecord(seed, title, o = {}) {
  const g = new THREE.Group();
  const cover = artTex(seed, o.style || 'abstract', 256, 256, title);
  const stand = grp(g, 0, 0, 0, 0, 0, 0);
  RB(stand, 0.315, 0.315, 0.004, 0.002, mat(0xffffff, { map: cover, roughness: 0.5 }), 0, 0.175, 0, -0.12);
  const vinyl = canvasTex('vinyl' + (o.color || 0), 256, 256, (c, w, h) => {
    c.fillStyle = o.color ? hex(o.color) : '#0b0b0b'; c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, 7); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.07)'; for (let r = 40; r < w / 2; r += 2) { c.beginPath(); c.arc(w / 2, h / 2, r, 0, 7); c.stroke(); }
    c.fillStyle = o.label || '#d8352a'; c.beginPath(); c.arc(w / 2, h / 2, 34, 0, 7); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(w / 2, h / 2, 3, 0, 7); c.fill();
  });
  const disc = CY(g, 0.15, 0.15, 0.002, [mat(0x0b0b0b, { roughness: 0.25 }), mat(0xffffff, { map: vinyl, roughness: 0.25, env: true, envI: 0.4 }), mat(0xffffff, { map: vinyl, roughness: 0.25 })], 0.08, 0.2, -0.012, Math.PI / 2 - 0.12, 0, 0, 64);
  disc.rotation.set(-0.12 + Math.PI / 2, 0, 0);
  // atril
  B(g, 0.2, 0.012, 0.08, C.darkWood(), 0, 0.006, 0.02);
  B(g, 0.2, 0.03, 0.012, C.darkWood(), 0, 0.02, 0.05);
  if (o.signed) P(g, 0.12, 0.05, signatureTex(seed), -0.03, 0.12, 0.012, -0.12, 0, 0.2, { transparent: true });
  return g;
}
export function signatureTex(seed) {
  return canvasTex('sig' + seed, 256, 96, (c, w, h) => {
    const R = rng(seed);
    c.strokeStyle = '#1a1a8a'; c.lineWidth = 3.2; c.lineCap = 'round';
    c.beginPath(); let x = 16, y = h * 0.6; c.moveTo(x, y);
    for (let i = 0; i < 22; i++) { const nx = x + 6 + R() * 12, ny = h * (0.2 + R() * 0.6); c.quadraticCurveTo(x + (R() - 0.5) * 30, y - 30 + R() * 60, nx, ny); x = nx; y = ny; }
    c.stroke();
    c.beginPath(); c.moveTo(20, h * 0.85); c.quadraticCurveTo(w / 2, h * 0.7, w - 20, h * 0.8); c.stroke();
  });
}
export function cassette(seed = 1, o = {}) {
  const g = new THREE.Group();
  const tape = grp(g, 0, 0.004, 0, -Math.PI / 2);
  RB(tape, 0.1, 0.064, 0.012, 0.003, plastic(o.shell ?? 0x1b1b1b, 0.35), 0, 0, 0);
  P(tape, 0.09, 0.035, labelTex(o.label || 'MIX 1986', { bg: '#f2e7c7', fg: '#b3261e', w: 512, h: 200, font: 'italic bold 80px Georgia', sub: 'LADO A · 60 min', subFont: '500 40px system-ui' }), 0, 0.01, 0.0062);
  B(tape, 0.05, 0.014, 0.001, glass(0x552222, 0.6), 0, -0.004, 0.0065);
  for (const s of [-1, 1]) { CY(tape, 0.009, 0.009, 0.013, plastic(0xf1f1f1), s * 0.02, -0.004, 0, Math.PI / 2, 0, 0, 12); CY(tape, 0.013, 0.013, 0.011, mat(0x3b2413), s * 0.02, -0.004, 0, Math.PI / 2, 0, 0, 24); }
  const cs = grp(g, 0.06, 0.035, -0.02, 0, -0.4, 0);
  B(cs, 0.108, 0.07, 0.017, glass(0xf0f4f8, 0.3), 0, 0, 0);
  P(cs, 0.1, 0.065, artTex(seed, 'abstract', 256, 160, o.label || 'MIX 1986'), 0, 0, 0.009);
  return g;
}
export function cdCase(seed, title, o = {}) {
  const g = new THREE.Group();
  const st = grp(g, 0, 0.07, 0, -0.18);
  RB(st, 0.142, 0.125, 0.01, 0.002, glass(0xf2f6fa, 0.35), 0, 0, 0);
  P(st, 0.12, 0.12, artTex(seed, o.style || 'abstract', 256, 256, title), 0, 0, 0.0055);
  B(st, 0.01, 0.125, 0.011, plastic(0x111111), -0.066, 0, 0);
  const disc = canvasTex('cd', 256, 256, (c, w, h) => {
    const gr = c.createConicGradient ? c.createConicGradient(0, w / 2, h / 2) : null;
    if (gr) { ['#d8d8e8', '#ffd0f0', '#c0f0ff', '#f0ffd0', '#d8d8e8'].forEach((col, i) => gr.addColorStop(i / 4, col)); c.fillStyle = gr; } else c.fillStyle = '#ddd';
    c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, 7); c.fill();
    c.fillStyle = '#eee'; c.beginPath(); c.arc(w / 2, h / 2, 34, 0, 7); c.fill();
    c.fillStyle = '#000'; c.beginPath(); c.arc(w / 2, h / 2, 10, 0, 7); c.fill();
  });
  P(g, 0.12, 0.12, disc, 0.06, 0.004, 0.05, -Math.PI / 2, 0, 0, { transparent: true, alphaTest: 0.3, rough: 0.1 });
  B(g, 0.1, 0.012, 0.04, C.darkWood(), 0, 0.006, 0.02);
  return g;
}
export function musicBox() {
  const g = new THREE.Group();
  const wd = C.wood(0x6b3a1c);
  RB(g, 0.18, 0.08, 0.12, 0.006, wd, 0, 0.04, 0);
  B(g, 0.16, 0.005, 0.1, mat(0x7a1a2a, { roughness: 1 }), 0, 0.078, 0);
  const lid = grp(g, 0, 0.08, -0.06, -1.9);
  RB(lid, 0.18, 0.02, 0.12, 0.006, wd, 0, 0.01, 0.06);
  P(lid, 0.12, 0.08, artTex(12, 'landscape', 128, 96), 0, -0.001, 0.06, Math.PI / 2);
  B(lid, 0.14, 0.001, 0.09, glass(0xffffff, 0.5), 0, -0.002, 0.06);
  CY(g, 0.012, 0.012, 0.06, C.brass(), -0.03, 0.09, 0.02, 0, 0, Math.PI / 2, 16);
  for (let i = 0; i < 12; i++) B(g, 0.003, 0.002, 0.03, C.steel(), -0.05 + i * 0.004, 0.09, 0.04);
  // bailarina
  CY(g, 0.02, 0.02, 0.006, mat(0xe8b6c6), 0.04, 0.083, 0.01, 0, 0, 0, 16);
  LA(g, [[0, 0], [0.018, 0.01], [0.022, 0.014], [0.004, 0.02], [0, 0.02]], mat(0xf6c8d8, { roughness: 0.6 }), 0.04, 0.1, 0.01);
  CY(g, 0.004, 0.003, 0.02, mat(0xf2d0c0), 0.04, 0.13, 0.01, 0, 0, 0, 8);
  SP(g, 0.006, mat(0xf2d0c0), 0.04, 0.145, 0.01);
  CY(g, 0.0015, 0.0015, 0.03, mat(0xf2d0c0), 0.04, 0.09, 0.01, 0, 0, 0, 6);
  CY(g, 0.0015, 0.0015, 0.025, mat(0xf2d0c0), 0.04, 0.14, 0.01, 0, 0, 1.2, 6);
  B(g, 0.004, 0.02, 0.004, C.brass(), 0.09, 0.05, 0, 0, 0, 0);
  CY(g, 0.012, 0.012, 0.003, C.brass(), 0.093, 0.05, 0, 0, 0, Math.PI / 2, 8);
  return g;
}
export function theremin() {
  const g = new THREE.Group();
  const wd = C.wood(0x5a3218);
  for (const [x, z] of [[-0.18, -0.1], [0.18, -0.1], [-0.18, 0.1], [0.18, 0.1]]) CY(g, 0.012, 0.009, 0.62, wd, x, 0.31, z, 0, 0, 0, 10);
  RB(g, 0.5, 0.2, 0.28, 0.01, wd, 0, 0.72, 0);
  B(g, 0.46, 0.14, 0.004, mat(0xc9b58a, { map: C.cloth(0xc9b58a).map, roughness: 1 }), 0, 0.72, 0.141);
  for (const x of [-0.12, 0, 0.12]) CY(g, 0.018, 0.018, 0.02, C.black(), x, 0.66, 0.145, Math.PI / 2, 0, 0, 16);
  CY(g, 0.005, 0.005, 0.45, C.chrome(), 0.22, 1.05, 0, 0, 0, 0, 10);
  TO(g, 0.08, 0.005, C.chrome(), -0.3, 0.78, 0, 0, Math.PI / 2, 0);
  CY(g, 0.005, 0.005, 0.08, C.chrome(), -0.25, 0.78, 0, 0, 0, Math.PI / 2, 8);
  P(g, 0.12, 0.03, labelTex('RCA · THEREMIN', { bg: '#1b1b1b', fg: '#d9b34a', w: 512, h: 128, font: 'bold 60px Georgia' }), 0, 0.8, 0.142);
  return g;
}
export function microphone() {
  const g = new THREE.Group();
  CY(g, 0.09, 0.1, 0.015, C.iron(), 0, 0.0075, 0, 0, 0, 0, 32);
  CY(g, 0.008, 0.008, 0.36, C.chrome(), 0, 0.19, 0, 0, 0, 0, 12);
  const head = grp(g, 0, 0.42, 0);
  TO(head, 0.045, 0.006, C.chrome(), 0, 0, 0, 0, Math.PI / 2, 0, Math.PI * 2, 32);
  const grille = canvasTex('micgrille', 128, 128, (c, w, h) => { c.fillStyle = '#ccd'; c.fillRect(0, 0, w, h); c.fillStyle = '#556'; for (let y = 4; y < h; y += 6) for (let x = 4; x < w; x += 6) c.fillRect(x, y, 3, 3); });
  const m = metal(0xdfe3e8, 0.25, { map: grille });
  RB(head, 0.07, 0.1, 0.04, 0.018, m, 0, 0.0, 0);
  B(head, 0.012, 0.1, 0.045, C.chrome(), 0, 0, 0);
  for (const s of [-1, 1]) CY(head, 0.006, 0.006, 0.02, C.chrome(), s * 0.048, -0.03, 0, 0, 0, Math.PI / 2, 8);
  return g;
}
export function gramophone() {
  const g = new THREE.Group();
  const wd = C.wood(0x6b3a1c);
  RB(g, 0.3, 0.14, 0.3, 0.008, wd, 0, 0.07, 0);
  CY(g, 0.13, 0.13, 0.01, mat(0x2a1a4a, { roughness: 1 }), 0, 0.145, 0, 0, 0, 0, 40);
  CY(g, 0.12, 0.12, 0.003, mat(0x0b0b0b, { roughness: 0.3 }), 0, 0.152, 0, 0, 0, 0, 40);
  CY(g, 0.012, 0.012, 0.03, C.brass(), 0.12, 0.16, 0.1, 0, 0, 0, 12);
  TU(g, [[0.12, 0.17, 0.1], [0.1, 0.2, 0.05], [0.06, 0.2, 0.0], [0.03, 0.17, -0.02]], 0.008, C.brass());
  const horn = LA(g, [[0.012, 0], [0.02, 0.1], [0.04, 0.2], [0.09, 0.3], [0.19, 0.36], [0.2, 0.365]], metal(0xc59440, 0.25, { side: THREE.DoubleSide }), 0, 0, 0, 40);
  horn.position.set(0.12, 0.18, 0.1); horn.rotation.set(-0.6, 0, -0.9);
  CY(g, 0.012, 0.012, 0.07, C.brass(), -0.155, 0.08, 0, 0, 0, Math.PI / 2, 10);
  B(g, 0.01, 0.07, 0.01, C.brass(), -0.19, 0.1, 0);
  return g;
}
export function turntable() {
  const g = new THREE.Group();
  RB(g, 0.42, 0.1, 0.34, 0.01, C.leather(0x7a2a1a), 0, 0.05, 0);
  B(g, 0.4, 0.004, 0.32, mat(0xe8e0cc, { roughness: 0.7 }), 0, 0.1, 0);
  CY(g, 0.14, 0.14, 0.01, C.silver(), -0.04, 0.108, 0, 0, 0, 0, 48);
  CY(g, 0.14, 0.14, 0.003, mat(0x0b0b0b, { roughness: 0.3 }), -0.04, 0.115, 0, 0, 0, 0, 48);
  CY(g, 0.035, 0.035, 0.004, mat(0x2a5aa8), -0.04, 0.118, 0, 0, 0, 0, 24);
  CY(g, 0.015, 0.015, 0.03, C.chrome(), 0.15, 0.115, -0.1, 0, 0, 0, 12);
  TU(g, [[0.15, 0.13, -0.1], [0.14, 0.13, 0.02], [0.07, 0.125, 0.07]], 0.004, C.chrome());
  B(g, 0.02, 0.01, 0.03, C.black(), 0.065, 0.122, 0.075);
  for (const x of [0.12, 0.16]) CY(g, 0.01, 0.01, 0.012, C.chrome(), x, 0.108, 0.13, 0, 0, 0, 12);
  const lid = grp(g, 0, 0.1, -0.17, -1.5);
  RB(lid, 0.42, 0.06, 0.34, 0.01, C.leather(0x7a2a1a), 0, 0.03, 0.17);
  CY(g, 0.012, 0.012, 0.06, C.brass(), 0, 0.06, 0.175, 0, 0, Math.PI / 2, 8);
  return g;
}
export function headphones() {
  const g = new THREE.Group();
  const band = TU(g, [[-0.08, 0.05, 0], [-0.075, 0.13, 0], [0, 0.18, 0], [0.075, 0.13, 0], [0.08, 0.05, 0]], 0.009, C.black());
  for (const s of [-1, 1]) {
    CY(g, 0.05, 0.05, 0.03, plastic(0x2a2a2a), s * 0.085, 0.05, 0, 0, 0, Math.PI / 2, 32);
    CY(g, 0.045, 0.045, 0.02, mat(0x1a1a1a, { roughness: 1 }), s * 0.066, 0.05, 0, 0, 0, Math.PI / 2, 32);
    CY(g, 0.035, 0.035, 0.004, C.silver(), s * 0.101, 0.05, 0, 0, 0, Math.PI / 2, 32);
  }
  TU(g, [[0.1, 0.03, 0], [0.13, 0.0, 0.03], [0.1, 0.004, 0.1], [0.02, 0.004, 0.09]], 0.003, C.black());
  return g;
}
export function mixer() {
  const g = new THREE.Group();
  const top = grp(g, 0, 0.04, 0, -0.18);
  RB(top, 0.42, 0.05, 0.3, 0.008, plastic(0x2c2e33), 0, 0, 0);
  B(top, 0.4, 0.002, 0.28, mat(0x3a3d44), 0, 0.026, 0);
  grid(top, 8, 1, 0.048, 1, (x) => {
    for (let k = 0; k < 4; k++) { CY(top, 0.008, 0.009, 0.012, [plastic(0x111111), plastic([0xd8342a, 0x2a6ad8, 0xe8c030, 0xeeeeee][k]), plastic(0x111111)], x, 0.032, -0.11 + k * 0.035, 0, 0, 0, 12); }
    B(top, 0.004, 0.002, 0.08, C.black(), x, 0.027, 0.08);
    RB(top, 0.014, 0.012, 0.02, 0.003, plastic(0xe8e8e8), x, 0.034, 0.06 + ((x * 91) % 0.04));
  });
  for (let i = 0; i < 10; i++) B(top, 0.008, 0.004, 0.008, emissive(i < 6 ? 0x33ff66 : i < 8 ? 0xffcc00 : 0xff3322, 1), 0.19, 0.028, -0.12 + i * 0.012);
  return g;
}
export function amplifier(o = {}) {
  const g = new THREE.Group();
  const tolex = C.leather(o.tolex ?? 0x151515);
  RB(g, 0.5, 0.42, 0.24, 0.015, tolex, 0, 0.21, 0);
  const cloth = canvasTex('ampcloth', 128, 128, (c, w, h) => { c.fillStyle = '#c9b48a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(80,60,30,0.4)'; for (let i = -h; i < w; i += 6) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.stroke(); } }, true);
  B(g, 0.45, 0.28, 0.005, mat(0xffffff, { map: cloth, roughness: 1 }), 0, 0.17, 0.121);
  B(g, 0.46, 0.08, 0.005, mat(0x1c1c1c), 0, 0.36, 0.121);
  for (let i = 0; i < 7; i++) CY(g, 0.012, 0.012, 0.015, plastic(0xefe6d0), -0.18 + i * 0.05, 0.36, 0.127, Math.PI / 2, 0, 0, 14);
  B(g, 0.1, 0.02, 0.003, C.chrome(), 0, 0.3, 0.125);
  P(g, 0.12, 0.03, labelTex('Vulcan', { bg: '#00000000', fg: '#e8d6a0', w: 256, h: 64, font: 'italic bold 52px Georgia' }), 0.14, 0.29, 0.125, 0, 0, 0, { transparent: true });
  TU(g, [[-0.08, 0.43, 0], [-0.05, 0.47, 0], [0.05, 0.47, 0], [0.08, 0.43, 0]], 0.01, C.black());
  for (const x of [-0.22, 0.22]) for (const z of [-0.1, 0.1]) CY(g, 0.012, 0.012, 0.01, C.black(), x, 0.004, z, 0, 0, 0, 8);
  return g;
}
export function speakerHorn() { return gramophone(); }

export function sheetMusic(seed, o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('sheet' + seed + (o.script ? 's' : ''), 256, 340, (c, w, h) => {
    const R = rng(seed);
    c.fillStyle = '#f1e6c8'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(120,90,40,0.12)'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(R() * w, R() * h, 5 + R() * 30, 0, 7); c.fill(); }
    c.fillStyle = '#222'; c.font = 'italic bold 22px Georgia'; c.textAlign = 'center';
    if (o.script) {
      c.fillText(o.title || 'ESCENA 12', w / 2, 34); c.font = '12px monospace'; c.textAlign = 'left';
      for (let i = 0; i < 20; i++) c.fillText(['INT. BODEGA - NOCHE', 'EL COLECCIONISTA', '(en voz baja)', 'Ábrela. Ahora.', 'Se escucha la cortina.', 'CORTE A:'][(R() * 6) | 0], i % 3 === 1 ? 70 : 24, 64 + i * 13);
    } else {
      c.fillText(o.title || 'Nocturno Op. 9', w / 2, 30);
      c.strokeStyle = '#333'; c.lineWidth = 1;
      for (let s = 0; s < 7; s++) {
        const y0 = 56 + s * 40;
        for (let l = 0; l < 5; l++) { c.beginPath(); c.moveTo(16, y0 + l * 5); c.lineTo(w - 16, y0 + l * 5); c.stroke(); }
        for (let n = 0; n < 12; n++) { const x = 34 + n * 17, y = y0 + (R() * 8 | 0) * 2.5; c.beginPath(); c.ellipse(x, y, 3.5, 2.5, -0.4, 0, 7); c.fill(); c.fillRect(x + 3, y - 14, 1, 14); }
      }
    }
  });
  const pg = grp(g, 0, 0.14, 0, -0.25);
  B(pg, 0.21, 0.28, 0.002, mat(0xffffff, { map: tex, roughness: 0.9 }), 0, 0, 0);
  B(g, 0.24, 0.012, 0.06, C.darkWood(), 0, 0.006, 0.03);
  B(g, 0.24, 0.02, 0.01, C.darkWood(), 0, 0.02, 0.055);
  if (o.signed) P(pg, 0.12, 0.045, signatureTex(seed + 3), 0.03, -0.09, 0.0015, 0, 0, 0.15, { transparent: true });
  return g;
}
