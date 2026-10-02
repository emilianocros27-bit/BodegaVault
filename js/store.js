// Tu tienda (tycoon) y el poblado que se expande frente a la calle.
// Todo en coordenadas del mundo. La calle está en z≈49; la banqueta de enfrente termina en z=56.2.
// La tienda mira hacia la calle (-z): fachada en z=62, fondo en z=72 (ampliación hasta z=80).
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, rng, add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, grp } from './modelkit.js';
import { leafyPlant, makeBush, flowerPatch } from './vegetation.js';
import { makeCar } from './cars.js';
import * as TB from './town-buildings.js';

const FB = 0.15;              // altura del piso terminado sobre la losa
const WH = 3.6;               // alto de muros
const TOP = FB + WH;          // 3.75
const R = rng(404);
const rr = (a, b) => a + R() * (b - a);

// ---------------- texturas ----------------
function uvBox(w, h, d, s = 1) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] * s, uv.getY(i) * dims[f][1] * s); }
  return g;
}
function uvPlane(w, d, s = 1) {
  const g = new THREE.PlaneGeometry(w, d), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * s, uv.getY(i) * d * s);
  g.rotateX(-Math.PI / 2);
  return g;
}
const TX = {
  stucco: canvasTex('st-stucco', 256, 256, (c, w) => {
    c.fillStyle = '#efe7d6'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { const k = R() < 0.5 ? 0 : 255; c.fillStyle = `rgba(${k},${k},${k - 30},${R() * 0.05})`; c.fillRect(R() * w, R() * w, 2, 2); }
    for (let i = 0; i < 25; i++) { const x = R() * w, y = R() * w, r = 20 + R() * 50; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(160,140,100,0.06)'); g.addColorStop(1, 'rgba(160,140,100,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  }, true),
  teal: canvasTex('st-teal', 256, 256, (c, w) => {
    c.fillStyle = '#1f6f78'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 6000; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.06})`; c.fillRect(R() * w, R() * w, 2, 2); }
  }, true),
  gravel: canvasTex('st-gravel', 256, 256, (c, w) => {
    c.fillStyle = '#8d8474'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 2600; i++) { const v = 90 + R() * 110 | 0; c.fillStyle = `rgb(${v},${v - 6},${v - 16})`; c.beginPath(); c.ellipse(R() * w, R() * w, 1 + R() * 3, 1 + R() * 2.4, R() * 3, 0, 7); c.fill(); }
  }, true),
  dirt: canvasTex('st-dirt', 256, 256, (c, w) => {
    c.fillStyle = '#7a6448'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * w, r = 10 + R() * 40; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, R() < 0.5 ? 'rgba(60,45,30,0.4)' : 'rgba(150,130,95,0.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(40,30,20,${R() * 0.3})`; c.fillRect(R() * w, R() * w, 2, 2); }
  }, true),
  concrete: canvasTex('st-concrete', 256, 256, (c, w) => {
    c.fillStyle = '#b3aea4'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 7000; i++) { const k = R() < 0.5 ? 0 : 255; c.fillStyle = `rgba(${k},${k},${k},${R() * 0.07})`; c.fillRect(R() * w, R() * w, 2, 2); }
    c.strokeStyle = 'rgba(70,65,60,0.35)'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, w - 2);
  }, true),
  tile: canvasTex('st-tile', 256, 256, (c, w) => {
    c.fillStyle = '#8f8a82'; c.fillRect(0, 0, w, w);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) {
      const k = 0.94 + R() * 0.06; c.fillStyle = (x + y) % 2 ? `rgb(${236 * k | 0},${232 * k | 0},${222 * k | 0})` : `rgb(${214 * k | 0},${206 * k | 0},${190 * k | 0})`;
      c.fillRect(x * 128 + 2, y * 128 + 2, 124, 124);
      c.strokeStyle = 'rgba(160,150,130,0.25)'; c.lineWidth = 1;
      for (let k2 = 0; k2 < 4; k2++) { c.beginPath(); let px = x * 128 + R() * 128, py = y * 128; c.moveTo(px, py); for (let s = 0; s < 6; s++) { px += (R() - 0.5) * 24; py += 21; c.lineTo(px, py); } c.stroke(); }
    }
  }, true),
  asphalt: canvasTex('st-asph', 256, 256, (c, w) => {
    c.fillStyle = '#4a4b4d'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 9000; i++) { const v = 50 + R() * 60 | 0; c.fillStyle = `rgba(${v},${v},${v},0.5)`; c.fillRect(R() * w, R() * w, 2, 2); }
  }, true),
  brick: canvasTex('st-brick', 256, 256, (c, w) => {
    c.fillStyle = '#d9cfc0'; c.fillRect(0, 0, w, w);
    const bh = 256 / 12, bw = 256 / 4;
    for (let r = 0; r < 12; r++) for (let x = (r % 2 ? -bw / 2 : 0); x < w; x += bw) {
      const k = 0.8 + R() * 0.3; c.fillStyle = `rgb(${160 * k | 0},${78 * k | 0},${52 * k | 0})`; c.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4);
      c.fillStyle = 'rgba(255,255,255,0.06)'; c.fillRect(x + 3, r * bh + 3, bw - 8, 3);
    }
  }, true),
  pavers: canvasTex('st-pavers', 256, 256, (c, w) => {
    c.fillStyle = '#9a8f80'; c.fillRect(0, 0, w, w);
    for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) {
      const k = 0.85 + R() * 0.25, ox = y % 2 ? 32 : 0; c.fillStyle = `rgb(${196 * k | 0},${170 * k | 0},${140 * k | 0})`;
      c.fillRect(((x * 64 + ox) % w) + 2, y * 32 + 2, 60, 28); if (ox && x === 3) c.fillRect(2, y * 32 + 2, 28, 28);
    }
  }, true),
  corrugated: canvasTex('st-corr', 128, 128, (c, w) => {
    const g = c.createLinearGradient(0, 0, 32, 0); g.addColorStop(0, '#8d9398'); g.addColorStop(0.5, '#c9ced2'); g.addColorStop(1, '#8d9398');
    c.fillStyle = g; for (let x = 0; x < w; x += 32) { c.save(); c.translate(x, 0); c.fillRect(0, 0, 32, w); c.restore(); }
    for (let i = 0; i < 600; i++) { c.fillStyle = `rgba(90,60,40,${R() * 0.12})`; c.fillRect(R() * w, R() * w, 2, 3); }
  }, true),
  awning: (a, b) => canvasTex('st-awn' + a + b, 128, 64, (c, w, h) => { for (let x = 0; x < w; x += 32) { c.fillStyle = a; c.fillRect(x, 0, 16, h); c.fillStyle = b; c.fillRect(x + 16, 0, 16, h); } c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, h - 6, w, 6); }, true),
  pegboard: canvasTex('st-peg', 128, 128, (c, w) => { c.fillStyle = '#b89668'; c.fillRect(0, 0, w, w); c.fillStyle = '#5a4428'; for (let y = 8; y < w; y += 16) for (let x = 8; x < w; x += 16) { c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } }, true),
};
const M = {
  stucco: mat(0xffffff, { map: TX.stucco, roughness: 0.92 }),
  teal: mat(0xffffff, { map: TX.teal, roughness: 0.8 }),
  mustard: mat(0xf2b134, { roughness: 0.55 }),
  gravel: mat(0xffffff, { map: TX.gravel, roughness: 1 }),
  dirt: mat(0xffffff, { map: TX.dirt, roughness: 1 }),
  concrete: mat(0xffffff, { map: TX.concrete, roughness: 0.9 }),
  tile: mat(0xffffff, { map: TX.tile, roughness: 0.35, env: true, envI: 0.35 }),
  asphalt: mat(0xffffff, { map: TX.asphalt, roughness: 0.95 }),
  brick: mat(0xffffff, { map: TX.brick, roughness: 0.9 }),
  pavers: mat(0xffffff, { map: TX.pavers, roughness: 0.95 }),
  corr: mat(0xffffff, { map: TX.corrugated, roughness: 0.45, metalness: 0.5 }),
  roof: mat(0x6f6c68, { roughness: 0.95 }),
  ceil: mat(0xf4f1ea, { roughness: 0.95 }),
  frame: metal(0x2b2d30, 0.45),
  alum: metal(0xb9bec3, 0.3),
  glass: glass(0xcfe6ee, 0.22),
  darkGlass: mat(0x1b2a33, { roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.8, env: true, envI: 1 }),
  wood: C.wood(0x8a5a32),
  darkWood: C.darkWood(),
  white: mat(0xf2f2ee, { roughness: 0.5 }),
  black: C.black(),
  paint: (c) => mat(c, { roughness: 0.6 }),
  light: emissive(0xfff6e0, 2.2),
  red: mat(0xc0392b, { roughness: 0.5 }),
  steel: C.steel(),
  chrome: C.chrome(),
  gold: C.gold(),
  marble: C.marble(),
  velvet: mat(0x6a0f1e, { roughness: 1, map: null }),
  rubber: C.rubber(),
};

// ---------------- utilidades ----------------
const col = (ctx, m) => { m.userData.col = true; return m; };
function box(g, w, h, d, m, x, y, z, s = 0) { const mesh = add(g, s ? uvBox(w, h, d, s) : new THREE.BoxGeometry(w, h, d), m, x, y, z); return mesh; }
function floor(g, x0, z0, x1, z1, m, y, s) { const f = add(g, uvPlane(x1 - x0, z1 - z0, s), m, (x0 + x1) / 2, y, (z0 + z1) / 2); f.castShadow = false; return f; }
// letrero: el texto se encoge solo para caber en el ancho
function signTex(text, W, H, o) {
  return canvasTex(`sign|${text}|${W}|${H}|${o.bg}|${o.fg}|${o.font}|${o.sub}|${o.subFont}|${o.border}`, W, H, (c) => {
    c.fillStyle = o.bg ?? '#1f6f78'; c.fillRect(0, 0, W, H);
    if (o.border) { c.strokeStyle = o.border; c.lineWidth = H * 0.06; c.strokeRect(H * 0.05, H * 0.05, W - H * 0.1, H - H * 0.1); }
    c.fillStyle = o.fg ?? '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const fit = (font, t, maxW, maxPx) => { let [, pre, px, post] = font.match(/^(.*?)(\d+)px(.*)$/); px = Math.min(+px, maxPx); c.font = `${pre}${px}px${post}`; while (c.measureText(t).width > maxW && px > 8) { px -= 2; c.font = `${pre}${px}px${post}`; } };
    fit(o.font ?? `bold ${Math.round(H * 0.55)}px Rubik, system-ui`, text, W * 0.92, H * (o.sub ? 0.5 : 0.88));
    c.fillText(text, W / 2, o.sub ? H * 0.4 : H / 2 + 2);
    if (o.sub) { fit(o.subFont ?? `500 ${Math.round(H * 0.2)}px Rubik, system-ui`, o.sub, W * 0.9, H * 0.24); c.fillText(o.sub, W / 2, H * 0.76); }
  });
}
function sign(g, text, w, h, x, y, z, ry, o = {}) {
  const tex = signTex(text, 1024, Math.round(1024 * h / w), o);
  const m = mat(0xffffff, { map: tex, roughness: 0.5, emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? tex : null, emissiveIntensity: o.glow ?? 0 });
  const p = add(g, new THREE.PlaneGeometry(w, h), m, x, y, z, 0, ry);
  p.castShadow = false;
  return p;
}
// muro axis-aligned con UV en metros
function wallX(g, z, x0, x1, y0, y1, m = M.stucco, t = 0.2) { return col(0, box(g, x1 - x0, y1 - y0, t, m, (x0 + x1) / 2, (y0 + y1) / 2, z, 0.5)); }
function wallZ(g, x, z0, z1, y0, y1, m = M.stucco, t = 0.2) { return col(0, box(g, t, y1 - y0, z1 - z0, m, x, (y0 + y1) / 2, (z0 + z1) / 2, 0.5)); }
function pane(g, along, fixed, a0, a1, y0, y1) {
  const w = a1 - a0, h = y1 - y0, c = (a0 + a1) / 2, yc = (y0 + y1) / 2;
  const p = along === 'x' ? box(g, w, h, 0.03, M.glass, c, yc, fixed) : box(g, 0.03, h, w, M.glass, fixed, yc, c);
  p.castShadow = false; col(0, p);
  const t = 0.06;
  if (along === 'x') { box(g, w + t * 2, t, 0.1, M.frame, c, y1 + t / 2, fixed); box(g, w + t * 2, t, 0.1, M.frame, c, y0 - t / 2, fixed); box(g, t, h, 0.1, M.frame, a0 - t / 2, yc, fixed); box(g, t, h, 0.1, M.frame, a1 + t / 2, yc, fixed); for (let k = 1; k < Math.round(w / 1.6); k++) box(g, 0.04, h, 0.08, M.frame, a0 + k * w / Math.round(w / 1.6), yc, fixed); }
  else { box(g, 0.1, t, w + t * 2, M.frame, fixed, y1 + t / 2, c); box(g, 0.1, t, w + t * 2, M.frame, fixed, y0 - t / 2, c); box(g, 0.1, h, t, M.frame, fixed, yc, a0 - t / 2); box(g, 0.1, h, t, M.frame, fixed, yc, a1 + t / 2); }
  return p;
}
function awning(g, x, z, w, depth, y, a, b, dir = -1) {
  const tex = TX.awning(a, b); tex.repeat.set(w / 1.2, 1);
  const m = mat(0xffffff, { map: tex, roughness: 0.9, side: THREE.DoubleSide });
  const geo = new THREE.PlaneGeometry(w, Math.hypot(depth, 0.55), 1, 1);
  const p = add(g, geo, m, x, y - 0.275, z + dir * depth / 2, Math.atan2(-dir * depth, 0.55));
  // faldón con ondas
  const vs = new THREE.PlaneGeometry(w, 0.22, 24, 1), pp = vs.attributes.position;
  for (let i = 0; i < pp.count; i++) if (pp.getY(i) < 0) pp.setY(i, pp.getY(i) + Math.abs(Math.sin(pp.getX(i) * 7.85)) * 0.06);
  vs.computeVertexNormals();
  add(g, vs, m, x, y - 0.55 - 0.11, z + dir * depth);
  for (const s of [-1, 1]) TU(g, [[x + s * w / 2, y, z], [x + s * w / 2, y - 0.55, z + dir * depth]], 0.012, M.frame);
  return p;
}
function pot(g, x, z, y = FB, size = 1, seed = 1) {
  LA(g, [[0, 0], [0.16, 0], [0.2, 0.34], [0.22, 0.36], [0.2, 0.37], [0.0, 0.33]].map(([a, b]) => [a * size, b * size]), mat(0xb8603a, { roughness: 0.85 }), x, y, z);
  const pl = leafyPlant(size * 1.1, seed); pl.position.set(x, y + 0.33 * size, z); g.add(pl);
}
function stool(g, x, z, h = 0.72) {
  CY(g, 0.19, 0.19, 0.07, M.red, x, FB + h, z, 0, 0, 0, 20);
  CY(g, 0.025, 0.025, h, M.chrome, x, FB + h / 2, z, 0, 0, 0, 10);
  TO(g, 0.15, 0.012, M.chrome, x, FB + h * 0.35, z, Math.PI / 2);
  CY(g, 0.2, 0.22, 0.03, M.chrome, x, FB + 0.015, z, 0, 0, 0, 20);
}
function register(g, x, y, z, ry = 0) {
  const r = grp(g, x, y, z, 0, ry);
  RB(r, 0.42, 0.12, 0.4, 0.02, plastic(0x2a2c30), 0, 0.06, 0);
  RB(r, 0.36, 0.06, 0.2, 0.01, plastic(0x3a3d42), 0, 0.14, 0.06, -0.3);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) RB(r, 0.05, 0.02, 0.035, 0.005, plastic(i === 3 ? 0xd04a3a : 0xe8e4da), -0.1 + i * 0.065, 0.18 - j * 0.012, 0.02 + j * 0.05, -0.3);
  RB(r, 0.2, 0.12, 0.02, 0.01, plastic(0x2a2c30), 0, 0.26, -0.1, -0.2);
  P(r, 0.17, 0.08, labelTex('$ 0.00', { bg: '#0a1a0a', fg: '#39ff66', w: 256, h: 110, font: 'bold 60px monospace' }), 0, 0.26, -0.089, -0.2, 0, 0, { glow: 0.8 });
  return r;
}
function monitor(g, x, y, z, ry, tex) {
  const m = grp(g, x, y, z, 0, ry);
  RB(m, 0.46, 0.3, 0.04, 0.01, M.black, 0, 0.26, 0);
  P(m, 0.42, 0.26, tex, 0, 0.26, 0.021, 0, 0, 0, { glow: 0.9 });
  B(m, 0.04, 0.12, 0.04, M.black, 0, 0.08, -0.03); RB(m, 0.18, 0.02, 0.12, 0.005, M.black, 0, 0.01, -0.02);
}
const camTex = canvasTex('st-cctv', 256, 160, (c, w, h) => {
  const q = [['#35424a', '#4a5a4e'], ['#4a4a3a', '#3a4452'], ['#3a3a44', '#4a4e40'], ['#443a3a', '#3a4a4a']];
  q.forEach(([a, b], i) => { const x = (i % 2) * w / 2, y = (i / 2 | 0) * h / 2; const g = c.createLinearGradient(x, y, x, y + h / 2); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(x + 1, y + 1, w / 2 - 2, h / 2 - 2); c.fillStyle = '#e8e8e8'; c.font = '11px monospace'; c.fillText('CAM ' + (i + 1), x + 6, y + 14); c.fillStyle = '#ff3a3a'; c.beginPath(); c.arc(x + w / 2 - 10, y + 10, 3, 0, 7); c.fill(); });
});
// estante de pared con relleno decorativo
function wallShelf(g, x, z0, z1, face, levels, deco = true) {
  const d = 0.42, len = z1 - z0, cz = (z0 + z1) / 2, cx = x + face * d / 2, sg = grp(g);
  for (const zz of [z0, z1]) col(0, box(sg, d, 2.25, 0.04, M.darkWood, cx, FB + 1.125, zz));
  box(sg, 0.03, 2.25, len, M.darkWood, x + face * 0.015, FB + 1.125, cz);
  for (const y of levels) box(sg, d, 0.035, len, M.wood, cx, FB + y, cz, 1);
  col(0, box(sg, d, 0.1, len, M.darkWood, cx, FB + 0.05, cz));
  if (deco) {
    // cajitas y libros como relleno en el nivel de abajo y arriba
    const R2 = rng(Math.round(z0 * 10 + x));
    for (const y of [levels[0], levels[levels.length - 1]]) {
      let zz = z0 + 0.12;
      while (zz < z1 - 0.2) {
        const w = 0.12 + R2() * 0.22, h = 0.12 + R2() * 0.2;
        const cc = [0x9a7448, 0xc9b28a, 0x7a3a2a, 0x3a5a7a, 0xd8d0c0][(R2() * 5) | 0];
        RB(sg, d * (0.5 + R2() * 0.3), h, w, 0.01, mat(cc, { roughness: 0.9 }), cx, FB + y + 0.02 + h / 2, zz + w / 2);
        zz += w + 0.04 + R2() * 0.15;
      }
    }
  }
  return sg;
}
function vitrinaCase(g, x, z, w, d, ry = 0) {
  const v = grp(g, x, FB, z, 0, ry);
  col(0, RB(v, w, 0.45, d, 0.02, M.darkWood, 0, 0.225, 0));
  RB(v, w + 0.04, 0.04, d + 0.04, 0.01, M.wood, 0, 0.47, 0);
  const gl = box(v, w, 0.52, d, M.glass, 0, 0.49 + 0.26, 0); gl.castShadow = false; col(0, gl);
  box(v, w * 0.96, 0.01, d * 0.9, mat(0x2a0f14, { roughness: 1 }), 0, 0.495, 0).castShadow = false;   // fondo de terciopelo
  RB(v, w + 0.04, 0.035, d + 0.04, 0.01, M.alum, 0, 1.03, 0);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) box(v, 0.022, 0.54, 0.022, M.alum, a * w / 2, 0.76, b * d / 2);
  box(v, w * 0.92, 0.015, 0.03, M.light, 0, 1.0, 0).castShadow = false;
  RB(v, w * 0.7, 0.06, 0.01, 0.004, M.gold, 0, 0.3, d / 2 + 0.003);
  return v;
}

// ---------------- etapas ----------------
// Cada constructor recibe (g, built, slots, pts) y agrega sus mallas.
// slots: lugares de exhibición { id, x, y, z, w, h, ry }. pts: puntos de interés { name: Vector3 }.
const S = {};

S.baldio = (g) => {
  floor(g, -9.5, 57.3, 9.5, 84, M.dirt, 0.006, 0.5);
  // escombro, llantas, colchón viejo, maleza
  for (let i = 0; i < 7; i++) { const s = rr(0.3, 0.7); const m = add(g, new THREE.DodecahedronGeometry(s, 0), mat(0x8a8274, { roughness: 1 }), rr(-7, 7), s * 0.35, rr(62, 82), rr(0, 3), rr(0, 3), 0); m.scale.y = 0.45; }
  for (let i = 0; i < 3; i++) TO(g, 0.33, 0.12, M.rubber, rr(-6, 6), 0.12, rr(64, 80), Math.PI / 2);
  RB(g, 1.9, 0.18, 0.9, 0.06, mat(0xb8b09a, { roughness: 1 }), 4.5, 0.1, 76, 0, 0.4, 0.05);
  for (let i = 0; i < 14; i++) { const b = makeBush(rr(0.5, 1.1), i); b.position.set(rr(-8.5, 8.5), -0.1, rr(58.5, 83)); g.add(b); }
  // letrero de "SE VENDE"
  for (const x of [4.3, 6.7]) CY(g, 0.05, 0.05, 2.4, M.darkWood, x, 1.2, 58.2, 0, 0, 0, 8);
  RB(g, 3, 1.4, 0.06, 0.02, M.white, 5.5, 1.9, 58.2);
  sign(g, 'SE VENDE', 2.8, 0.8, 5.5, 2.15, 58.16, Math.PI, { bg: '#c0392b', fg: '#ffffff', font: 'bold 190px Rubik, system-ui' });
  sign(g, 'TERRENO 18 × 27 m', 2.8, 0.45, 5.5, 1.52, 58.16, Math.PI, { bg: '#ffffff', fg: '#222222', font: 'bold 110px Rubik, system-ui' });
};

S.terreno = (g, built) => {
  floor(g, -9.5, 57.3, 9.5, 84, M.gravel, 0.008, 0.6);
  // bordillo del terreno
  for (const [x0, z0, x1, z1] of [[-9.5, 57.3, -9.5, 84], [9.5, 57.3, 9.5, 84], [-9.5, 84, 9.5, 84]]) box(g, Math.max(0.15, x1 - x0), 0.12, Math.max(0.15, z1 - z0), M.concrete, (x0 + x1) / 2, 0.06, (z0 + z1) / 2);
  if (built.has('muros')) return;
  // letrero "próximamente"
  for (const x of [5.4, 8.4]) CY(g, 0.05, 0.05, 2.6, M.steel, x, 1.3, 58.6, 0, 0, 0, 8);
  RB(g, 3.3, 1.5, 0.06, 0.02, M.teal, 6.9, 2.0, 58.6);
  sign(g, 'PRÓXIMAMENTE', 3.1, 0.5, 6.9, 2.45, 58.56, Math.PI, { bg: '#1f6f78', fg: '#f2b134', font: 'bold 150px Rubik, system-ui' });
  sign(g, 'EL BAZAR', 3.1, 0.85, 6.9, 1.8, 58.56, Math.PI, { bg: '#1f6f78', fg: '#ffffff', font: 'bold 260px Bebas Neue, Rubik, system-ui' });
  // conos y block apilado
  for (const [x, z] of [[-8.4, 58.2], [-6.5, 58.2], [8.8, 60.8]]) { CO(g, 0.16, 0.5, mat(0xff6a1a, { roughness: 0.6 }), x, 0.27, z, 0, 0, 0, 16); box(g, 0.34, 0.03, 0.34, M.black, x, 0.015, z); TO(g, 0.1, 0.02, M.white, x, 0.33, z, Math.PI / 2); }
  const blocks = grp(g, -7.2, 0, 80.5);
  for (let y = 0; y < 3; y++) for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) box(blocks, 0.39, 0.19, 0.19, M.concrete, i * 0.4 - 0.6, 0.1 + y * 0.2, j * 0.2 + (y % 2) * 0.05);
  col(0, box(blocks, 1.7, 0.6, 0.5, M.concrete, 0, 0.3, 0.1)).visible = false;
};

S.losa = (g, built) => {
  const back = built.has('ampliacion') ? 80.2 : 72.2;
  const s = box(g, 14.4, FB, back - 61.8, M.concrete, 0, FB / 2, (61.8 + back) / 2, 0.35); s.castShadow = false;
  // rampa/escalón de acceso
  box(g, 3.2, 0.08, 0.9, M.concrete, 0, 0.04, 61.35, 0.35).castShadow = false;
};

S.muros = (g, built, slots, pts) => {
  const amp = built.has('ampliacion');
  // fachada (z=62): pilares, aparadores de vidrio y puerta
  wallX(g, 62, -7.1, -6.2, FB, TOP, M.teal); wallX(g, 62, 6.2, 7.1, FB, TOP, M.teal);
  for (const s of [-1, 1]) {
    const a0 = s < 0 ? -6.2 : 1.45, a1 = s < 0 ? -1.45 : 6.2;
    wallX(g, 62, a0, a1, FB, FB + 0.6, M.teal);
    wallX(g, 62, a0, a1, 2.85, TOP, M.stucco);
    pane(g, 'x', 62, a0, a1, FB + 0.66, 2.79);
    wallX(g, 62, s < 0 ? -1.45 : 1.1, s < 0 ? -1.1 : 1.45, FB, TOP, M.teal);
    box(g, a1 - a0 + 0.1, 0.06, 0.34, M.alum, (a0 + a1) / 2, FB + 0.63, 62.1);   // repisa del aparador
  }
  wallX(g, 62, -1.1, 1.1, 2.75, TOP, M.stucco);
  // marco de puerta y puertas de vidrio abiertas hacia adentro
  for (const s of [-1, 1]) {
    box(g, 0.08, 2.6, 0.12, M.frame, s * 1.1, FB + 1.3, 62);
    const dg = grp(g, s * 1.08, FB, 62.05, 0, s * 1.35);
    const leaf = box(dg, 1.0, 2.5, 0.04, M.glass, -s * 0.5, 1.26, 0); leaf.castShadow = false;
    box(dg, 1.04, 0.08, 0.05, M.frame, -s * 0.5, 0.04, 0); box(dg, 1.04, 0.08, 0.05, M.frame, -s * 0.5, 2.5, 0);
    box(dg, 0.06, 2.5, 0.05, M.frame, -s * 1.0, 1.25, 0); box(dg, 0.06, 2.5, 0.05, M.frame, 0, 1.25, 0);
    CY(dg, 0.015, 0.015, 0.5, M.chrome, -s * 0.9, 1.1, 0.05, 0, 0, 0, 8);
  }
  box(g, 2.3, 0.1, 0.14, M.frame, 0, 2.7, 62);
  // costados y fondo
  wallZ(g, -7, 62, amp ? 80 : 72, FB, TOP); wallZ(g, 7, 62, amp ? 80 : 72, FB, TOP);
  if (amp) {
    wallX(g, 72, -7, -3, FB, TOP); wallX(g, 72, 3, 7, FB, TOP); wallX(g, 72, -3, 3, 3.0, TOP);
    box(g, 6.1, 0.12, 0.26, M.teal, 0, 3.0, 72);
    wallX(g, 80, -7, 7, FB, TOP);
    // ventanas altas de la ampliación
    for (const s of [-1, 1]) for (const z of [74.5, 77.5]) { box(g, 0.24, 0.6, 1.6, M.darkGlass, s * 7, 2.9, z).castShadow = false; box(g, 0.26, 0.06, 1.7, M.alum, s * 7, 2.57, z); }
  } else wallX(g, 72, -7, 7, FB, TOP);
  // techo, plafón y pretil
  const back = amp ? 80 : 72;
  box(g, 14.6, 0.22, back - 61.7, M.roof, 0, TOP + 0.11, (61.7 + back) / 2);
  box(g, 14.0, 0.02, back - 62.2, M.ceil, 0, TOP - 0.01, (62.2 + back) / 2).castShadow = false;
  box(g, 14.8, 0.95, 0.26, M.stucco, 0, TOP + 0.47, 61.9, 0.5);           // pretil frontal (zona del letrero)
  box(g, 14.9, 0.1, 0.36, M.teal, 0, TOP + 0.97, 61.9);
  for (const s of [-1, 1]) box(g, 0.24, 0.55, back - 62, M.stucco, s * 7.2, TOP + 0.27, (62 + back) / 2, 0.5);
  box(g, 14.6, 0.55, 0.24, M.stucco, 0, TOP + 0.27, back + 0.1, 0.5);
  // tinaco y bajante
  CY(g, 0.55, 0.55, 1.2, mat(0x1a1a1a, { roughness: 0.6 }), 5.4, TOP + 0.82, 70.6, 0, 0, 0, 24);
  CY(g, 0.35, 0.55, 0.2, mat(0x1a1a1a, { roughness: 0.6 }), 5.4, TOP + 1.52, 70.6, 0, 0, 0, 24);
  CY(g, 0.05, 0.05, TOP, mat(0x9a9a96, { roughness: 0.5 }), 7.18, TOP / 2, 71.7, 0, 0, 0, 10);
  // zoclo interior
  for (const s of [-1, 1]) box(g, 0.02, 0.1, back - 62.3, M.darkWood, s * 6.89, FB + 0.05, (62.2 + back) / 2);
  // luminaria básica: foco pelón (se reemplaza con 'piso')
  if (!built.has('piso')) { CY(g, 0.01, 0.01, 0.5, M.black, 0, TOP - 0.25, 67, 0, 0, 0, 6); SP(g, 0.07, emissive(0xfff0c8, 3), 0, TOP - 0.55, 67); }
  pts.inside = new THREE.Vector3(0, 0, 66.5);
};

S.mostrador = (g, built, slots, pts) => {
  const c = grp(g);
  // mostrador en L: frente a lo largo de x (z=69) y regreso hacia el fondo (x=2.4)
  col(0, RB(c, 4.0, 1.0, 0.7, 0.03, M.darkWood, 4.4, FB + 0.5, 69.0));
  col(0, RB(c, 0.7, 1.0, 1.9, 0.03, M.darkWood, 2.75, FB + 0.5, 70.3));
  RB(c, 4.1, 0.05, 0.8, 0.015, M.marble, 4.4, FB + 1.02, 69.0);
  RB(c, 0.8, 0.05, 1.95, 0.015, M.marble, 2.75, FB + 1.02, 70.3);
  box(c, 3.9, 0.1, 0.02, M.teal, 4.4, FB + 0.82, 68.64);
  box(c, 3.9, 0.04, 0.02, M.gold, 4.4, FB + 0.74, 68.64);
  for (let i = 0; i < 4; i++) RB(c, 0.9, 0.5, 0.02, 0.01, M.wood, 2.9 + i * 1.0, FB + 0.4, 68.64);
  register(c, 5.7, FB + 1.045, 69.05, Math.PI);
  // timbre, recibos, bolsa
  CY(c, 0.05, 0.06, 0.02, M.chrome, 3.35, FB + 1.055, 68.85, 0, 0, 0, 16); SP(c, 0.045, M.chrome, 3.35, FB + 1.07, 68.85, 1, 0.6, 1, 12);
  RB(c, 0.16, 0.02, 0.22, 0.005, M.white, 6.1, FB + 1.055, 69.1, 0, 0.3);
  stool(c, 5.3, 70.1);
  // repisa trasera con bolsas y rollos de papel
  col(0, box(c, 3.8, 0.9, 0.45, M.darkWood, 4.9, FB + 0.45, 71.6));
  for (let i = 0; i < 4; i++) RB(c, 0.3, 0.38, 0.12, 0.01, mat([0xf2b134, 0x1f6f78, 0xf2f2ee, 0xf2b134][i], { roughness: 0.9 }), 3.4 + i * 0.45, FB + 1.1, 71.6);
  sign(c, 'GRACIAS POR SU COMPRA', 2.6, 0.4, 4.9, FB + 2.3, 71.88, Math.PI, { bg: '#f2b134', fg: '#1f3a3e', font: 'bold 150px Rubik, system-ui' });
  slots.push({ id: 'm1', x: 3.8, y: FB + 1.045, z: 69.05, w: 0.5, h: 0.5, ry: Math.PI });
  slots.push({ id: 'm2', x: 4.7, y: FB + 1.045, z: 69.05, w: 0.5, h: 0.5, ry: Math.PI });
  pts.counter = new THREE.Vector3(4.4, 0, 67.9);
};

S.vitrina1 = (g, built, slots) => {
  vitrinaCase(g, -3.3, 65.2, 1.9, 0.62);
  for (let i = 0; i < 3; i++) slots.push({ id: 'v1' + i, x: -3.9 + i * 0.6, y: FB + 0.5, z: 65.2, w: 0.52, h: 0.44, ry: Math.PI });
};
S.vitrina2 = (g, built, slots) => {
  vitrinaCase(g, -3.3, 68.6, 1.9, 0.62);
  for (let i = 0; i < 3; i++) slots.push({ id: 'v2' + i, x: -3.9 + i * 0.6, y: FB + 0.5, z: 68.6, w: 0.52, h: 0.44, ry: Math.PI });
};
S.estante1 = (g, built, slots) => {
  wallShelf(g, -6.9, 63.1, 67.5, 1, [0.35, 0.95, 1.55, 2.15]);
  for (const [z, y] of [[64.2, 0.95], [66.4, 0.95], [64.2, 1.55], [66.4, 1.55]]) slots.push({ id: 'e1' + z + y, x: -6.67, y: FB + y + 0.02, z, w: 0.9, h: 0.55, ry: Math.PI / 2 });
};
S.estante2 = (g, built, slots) => {
  wallShelf(g, 6.9, 62.9, 67.3, -1, [0.35, 0.95, 1.55, 2.15]);
  for (const [z, y] of [[64.0, 0.95], [66.2, 0.95], [64.0, 1.55], [66.2, 1.55]]) slots.push({ id: 'e2' + z + y, x: 6.67, y: FB + y + 0.02, z, w: 0.9, h: 0.55, ry: -Math.PI / 2 });
};

S.letrero = (g) => {
  // letrero de fachada con letras iluminadas
  RB(g, 8.2, 0.95, 0.18, 0.04, M.frame, 0, TOP + 0.48, 61.72);
  sign(g, 'EL BAZAR', 7.9, 0.8, 0, TOP + 0.5, 61.62, Math.PI, { bg: '#1f3a3e', fg: '#f2b134', font: 'bold 200px Bebas Neue, Rubik, system-ui', glow: 0.55 });
  sign(g, 'COMPRA · VENTA', 2.5, 0.3, 0, 3.02, 61.88, Math.PI, { bg: '#f2b134', fg: '#1f3a3e', font: 'bold 44px Rubik, system-ui' });
  // toldos rayados sobre los aparadores
  awning(g, -3.83, 61.88, 4.8, 0.9, 3.35, '#1f6f78', '#f2efe6');
  awning(g, 3.83, 61.88, 4.8, 0.9, 3.35, '#1f6f78', '#f2efe6');
  // letrero "ABIERTO" en el aparador
  sign(g, 'ABIERTO', 0.9, 0.3, 5.4, 2.35, 62.04, Math.PI, { bg: '#101010', fg: '#ff3a4a', font: 'bold 150px Rubik, system-ui', glow: 1.4 });
  // caballete en la banqueta
  const af = grp(g, -3.4, 0, 59.6, 0, 0.25);
  for (const s of [-1, 1]) {
    const pv = grp(af, 0, 0.92, 0, -s * 0.19);
    RB(pv, 0.62, 0.9, 0.03, 0.01, M.darkWood, 0, -0.46, 0);
    sign(pv, '¡COMPRAMOS!', 0.54, 0.78, 0, -0.46, s * 0.017, s < 0 ? Math.PI : 0, { bg: '#20282a', fg: '#ffffff', font: 'bold 200px Rubik, system-ui', sub: 'y vendemos de todo', subFont: '500 120px Rubik, system-ui' });
  }
  col(0, box(af, 0.6, 0.9, 0.4, M.black, 0, 0.45, 0)).visible = false;
};

S.piso = (g, built, slots, pts) => {
  const back = built.has('ampliacion') ? 79.9 : 71.9;
  floor(g, -6.9, 62.1, 6.9, back, M.tile, FB + 0.004, 1 / 0.8);
  // tapete de entrada
  const mat1 = RB(g, 1.8, 0.012, 1.0, 0.004, mat(0x2a3a3c, { roughness: 1 }), 0, FB + 0.01, 62.8); mat1.castShadow = false;
  sign(g, 'BIENVENIDO', 1.4, 0.3, 0, FB + 0.018, 62.8, 0, { bg: '#2a3a3c', fg: '#f2b134', font: 'bold 150px Rubik, system-ui' }).rotation.x = -Math.PI / 2;
  // lámparas de panel
  for (const x of [-3.6, 0, 3.6]) for (let z = 64.2; z < back - 1; z += 3.6) { box(g, 1.2, 0.04, 0.3, M.alum, x, TOP - 0.03, z); box(g, 1.12, 0.02, 0.24, M.light, x, TOP - 0.055, z).castShadow = false; }
  pts.bright = true;
};

S.clima = (g) => {
  // minisplit
  const ac = grp(g, -6.78, 3.1, 70.3, 0, Math.PI / 2);
  RB(ac, 1.0, 0.3, 0.22, 0.06, M.white, 0, 0, 0);
  box(ac, 0.9, 0.02, 0.06, mat(0xd8d8d4), 0, -0.13, 0.09);
  SP(ac, 0.012, emissive(0x3aff7a, 3), 0.4, -0.05, 0.112, 1, 1, 0.3, 8);
  // bocinas de techo
  for (const [x, z] of [[-3.5, 64], [3.5, 64], [-3.5, 70], [1.2, 70]]) { CY(g, 0.16, 0.16, 0.03, M.white, x, TOP - 0.02, z, 0, 0, 0, 20); TO(g, 0.12, 0.008, mat(0xcccccc), x, TOP - 0.04, z, Math.PI / 2); }
  pot(g, -6.35, 71.35, FB, 1.3, 3); pot(g, -1.9, 62.6, FB, 1.1, 4); pot(g, 1.9, 62.6, FB, 1.1, 5);
  // unidad exterior en el techo
  const ex = grp(g, -4.8, TOP + 0.22, 70.5);
  RB(ex, 0.9, 0.62, 0.36, 0.02, mat(0xe6e6e0), 0, 0.31, 0);
  CY(ex, 0.22, 0.22, 0.02, M.black, 0.1, 0.31, -0.19, Math.PI / 2, 0, 0, 20);
};

S.camaras = (g) => {
  for (const [x, z, ry] of [[-6.7, 62.35, 0.8], [6.7, 71.65, -2.4], [6.7, 62.35, -0.8]]) {
    const c = grp(g, x, TOP - 0.1, z, 0, ry);
    box(c, 0.08, 0.12, 0.08, M.white, 0, 0.02, 0);
    const b = RB(c, 0.14, 0.12, 0.3, 0.03, M.white, 0, -0.08, 0.12, -0.35);
    CY(c, 0.045, 0.045, 0.02, M.black, 0, -0.14, 0.27, Math.PI / 2 - 0.35, 0, 0, 16);
    SP(c, 0.012, emissive(0xff2a2a, 3), 0.05, -0.04, 0.26, 1, 1, 1, 8);
  }
  monitor(g, 6.25, FB + 1.045, 69.1, Math.PI, camTex);
  sign(g, 'SONRÍA, LO ESTAMOS GRABANDO', 1.3, 0.34, 6.88, 2.4, 64.9, -Math.PI / 2, { bg: '#f2c230', fg: '#111', font: 'bold 64px Rubik, system-ui' });
};

S.ampliacion = (g, built, slots) => {
  // piso de concreto pulido (el 'piso' lo cubre con loseta)
  if (!built.has('piso')) floor(g, -6.9, 72.1, 6.9, 79.9, M.concrete, FB + 0.004, 0.4);
  // pedestales para piezas grandes
  for (const [x, z] of [[-4.8, 74.6], [-4.8, 77.8], [4.8, 74.6], [4.8, 77.8]]) {
    col(0, CY(g, 0.55, 0.6, 0.45, M.white, x, FB + 0.225, z, 0, 0, 0, 32));
    TO(g, 0.56, 0.015, M.gold, x, FB + 0.44, z, Math.PI / 2, 0, 0, Math.PI * 2, 40);
    slots.push({ id: 'p' + x + z, x, y: FB + 0.45, z, w: 1.0, h: 1.7, ry: x < 0 ? Math.PI / 2 : -Math.PI / 2 });
  }
  // repisa flotante al fondo para piezas medianas
  box(g, 3.6, 0.06, 0.45, M.darkWood, 0, FB + 1.3, 79.66);
  for (const x of [-1.6, 1.6]) box(g, 0.04, 0.3, 0.4, M.frame, x, FB + 1.14, 79.7);
  box(g, 3.4, 0.03, 0.03, M.light, 0, FB + 2.5, 79.85).castShadow = false;
  slots.push({ id: 'a1', x: -0.9, y: FB + 1.33, z: 79.6, w: 1.0, h: 0.9, ry: Math.PI });
  slots.push({ id: 'a2', x: 0.9, y: FB + 1.33, z: 79.6, w: 1.0, h: 0.9, ry: Math.PI });
  sign(g, 'SALA DE PIEZAS GRANDES', 2.8, 0.34, 0, 3.1, 79.88, Math.PI, { bg: '#1f3a3e', fg: '#f2b134', font: 'bold 120px Rubik, system-ui' });
};

S.lujo = (g, built, slots) => {
  const x = 0, z = 76.2;
  col(0, CY(g, 0.8, 0.9, 0.2, M.marble, x, FB + 0.1, z, 0, 0, 0, 40));
  col(0, CY(g, 0.62, 0.66, 0.75, mat(0x1a1a1a, { roughness: 0.3, env: true, envI: 0.6 }), x, FB + 0.575, z, 0, 0, 0, 40));
  TO(g, 0.63, 0.02, M.gold, x, FB + 0.95, z, Math.PI / 2, 0, 0, Math.PI * 2, 48);
  CY(g, 0.6, 0.6, 0.02, M.velvet, x, FB + 0.96, z, 0, 0, 0, 40);
  const gl = CY(g, 0.6, 0.6, 0.85, M.glass, x, FB + 1.4, z, 0, 0, 0, 40); gl.castShadow = false;
  CY(g, 0.62, 0.62, 0.05, M.gold, x, FB + 1.85, z, 0, 0, 0, 40);
  SP(g, 0.05, M.gold, x, FB + 1.9, z);
  // cordón de terciopelo
  const posts = [[-1.3, 75], [1.3, 75], [1.3, 77.4], [-1.3, 77.4]];
  for (const [px, pz] of posts) { CY(g, 0.035, 0.035, 0.9, M.gold, px, FB + 0.45, pz, 0, 0, 0, 12); CY(g, 0.15, 0.17, 0.04, M.gold, px, FB + 0.02, pz, 0, 0, 0, 20); SP(g, 0.055, M.gold, px, FB + 0.93, pz); }
  for (let i = 0; i < 4; i++) { const [a, b] = posts[i], [c, d] = posts[(i + 1) % 4]; TU(g, [[a, FB + 0.85, b], [(a + c) / 2, FB + 0.66, (b + d) / 2], [c, FB + 0.85, d]], 0.022, M.velvet); }
  // reflectores
  for (const [px, pz] of [[-1.6, 76.2], [1.6, 76.2]]) { const s = grp(g, px, TOP - 0.05, pz); CY(s, 0.02, 0.02, 0.3, M.black, 0, -0.15, 0, 0, 0, 0, 8); CY(s, 0.07, 0.1, 0.2, M.black, 0, -0.35, 0, 0, 0, px < 0 ? -0.7 : 0.7); }
  sign(g, 'COLECCIÓN PRIVADA', 1.6, 0.26, 0, FB + 0.55, z - 0.67, Math.PI, { bg: '#111111', fg: '#e8cf8a', font: 'bold 120px Rubik, system-ui' });
  slots.push({ id: 'l1', x: x - 0.25, y: FB + 0.97, z, w: 0.45, h: 0.8, ry: Math.PI, lux: true });
  slots.push({ id: 'l2', x: x + 0.25, y: FB + 0.97, z, w: 0.45, h: 0.8, ry: Math.PI, lux: true });
};

S.espectacular = (g) => {
  const e = grp(g, 0, TOP + 0.22, 70.8);
  for (const x of [-3, 3]) { col(0, box(e, 0.3, 4.2, 0.3, M.steel, x, 2.1, 0)); for (let y = 0.6; y < 4; y += 0.8) box(e, 0.34, 0.04, 0.34, M.steel, x, y, 0); }
  TU(e, [[-3, 0.5, 0], [0, 2.2, 0], [3, 0.5, 0]], 0.04, M.steel);
  RB(e, 9.2, 3.2, 0.3, 0.05, M.frame, 0, 5.2, 0);
  sign(e, 'EL BAZAR', 8.8, 2.9, 0, 5.2, -0.16, Math.PI, { bg: '#1f3a3e', fg: '#f2b134', font: 'bold 330px Bebas Neue, Rubik, system-ui', sub: 'COMPRAMOS · VENDEMOS · COLECCIONAMOS', subFont: 'bold 46px Rubik, system-ui', glow: 0.25 });
  box(e, 9.0, 0.08, 0.4, M.steel, 0, 3.55, -0.3);
  for (let i = -3; i <= 3; i += 2) { const l = grp(e, i, 3.6, -0.5); CY(l, 0.02, 0.02, 0.5, M.steel, 0, 0.1, 0.2, 0.6); CY(l, 0.09, 0.12, 0.18, M.black, 0, 0.3, 0, -0.9, 0, 0, 12); }
};

S.estacionamiento = (g) => {
  floor(g, 10, 57.3, 22.5, 72, M.asphalt, 0.012, 0.35);
  const w = mat(0xf2f2ee, { roughness: 0.6 });
  for (let i = 0; i <= 4; i++) box(g, 0.12, 0.01, 5.0, w, 10.6 + i * 2.8, 0.022, 68.5).castShadow = false;
  for (let i = 0; i < 4; i++) { box(g, 1.6, 0.12, 0.22, M.concrete, 12 + i * 2.8, 0.06, 70.6); }
  box(g, 11.6, 0.01, 0.12, mat(0xf2c230), 16.2, 0.022, 65.5).castShadow = false;
  // auto estacionado
  const car = makeCar('sedan', 0x2a6a4a); car.rotation.y = Math.PI / 2; car.position.set(14.8, 0, 68.4); g.add(car); car.userData.col = true;
  // poste de luz y letrero
  CY(g, 0.07, 0.09, 5.5, M.steel, 22.1, 2.75, 60, 0, 0, 0, 10); col(0, box(g, 0.2, 2, 0.2, M.steel, 22.1, 1, 60)).visible = false;
  box(g, 1.2, 0.08, 0.2, M.steel, 21.6, 5.5, 60); box(g, 0.6, 0.06, 0.28, M.light, 21.2, 5.45, 60).castShadow = false;
  CY(g, 0.04, 0.04, 2.4, M.steel, 10.5, 1.2, 58, 0, 0, 0, 8);
  sign(g, 'E', 0.6, 0.6, 10.5, 2.3, 57.97, Math.PI, { bg: '#1a5ab8', fg: '#ffffff', font: 'bold 700px Rubik, system-ui', border: '#ffffff' });
  sign(g, 'CLIENTES', 0.6, 0.18, 10.5, 1.9, 57.97, Math.PI, { bg: '#ffffff', fg: '#1a5ab8', font: 'bold 180px Rubik, system-ui' });
};

S.cafeteria = (g, built, slots, pts) => {
  const x0 = -23.5, x1 = -12.5, z0 = 61.5, z1 = 69.5, h = 3.4;
  floor(g, x0 - 0.5, 57.3, x1 + 0.5, z1 + 0.5, M.pavers, 0.01, 0.8);
  box(g, x1 - x0, 0.12, z1 - z0, M.concrete, (x0 + x1) / 2, 0.06, (z0 + z1) / 2).castShadow = false;
  // fachada de ladrillo con ventanales
  wallX(g, z0, x0, x0 + 0.8, 0.12, h, M.brick); wallX(g, z0, x1 - 0.8, x1, 0.12, h, M.brick);
  wallX(g, z0, x0 + 0.8, x1 - 0.8, 0.12, 0.7, M.brick); wallX(g, z0, x0 + 0.8, x1 - 0.8, 2.7, h, M.brick);
  pane(g, 'x', z0, x0 + 0.8, -19.3, 0.76, 2.64); pane(g, 'x', z0, -16.7, x1 - 0.8, 0.76, 2.64);
  const door = box(g, 2.4, 1.94, 0.05, M.darkGlass, -18, 1.7, z0); col(0, door);
  for (const x of [-19.25, -16.75]) box(g, 0.08, 1.95, 0.12, M.frame, x, 1.7, z0);
  CY(g, 0.015, 0.015, 0.5, M.chrome, -18.2, 1.3, z0 - 0.06, 0, 0, 0, 8); CY(g, 0.015, 0.015, 0.5, M.chrome, -17.8, 1.3, z0 - 0.06, 0, 0, 0, 8);
  wallZ(g, x0, z0, z1, 0.12, h, M.brick); wallZ(g, x1, z0, z1, 0.12, h, M.brick); wallX(g, z1, x0, x1, 0.12, h, M.brick);
  box(g, x1 - x0 + 0.5, 0.25, z1 - z0 + 0.5, M.roof, (x0 + x1) / 2, h + 0.12, (z0 + z1) / 2);
  box(g, x1 - x0 + 0.6, 0.5, 0.2, mat(0x2d4a2a, { roughness: 0.7 }), (x0 + x1) / 2, h + 0.1, z0 - 0.15);
  sign(g, 'CAFÉ LA ESQUINA', 5.2, 0.5, (x0 + x1) / 2, h + 0.1, z0 - 0.26, Math.PI, { bg: '#2d4a2a', fg: '#f4e8c8', font: 'bold 150px Rubik, system-ui', glow: 0.3 });
  awning(g, (x0 + x1) / 2, z0 - 0.02, x1 - x0 - 0.4, 1.1, 3.05, '#2d4a2a', '#f4e8c8');
  // interior visible: barra, cafetera, lámparas, repisas
  const inn = grp(g);
  box(inn, x1 - x0 - 0.4, 0.02, z1 - z0 - 0.4, C.wood(0x6a4424), (x0 + x1) / 2, 0.13, (z0 + z1) / 2).castShadow = false;
  RB(inn, 6, 1.0, 0.7, 0.02, C.wood(0x5a3a1c), -18, 0.62, 67.2); RB(inn, 6.1, 0.05, 0.8, 0.01, M.marble, -18, 1.14, 67.2);
  RB(inn, 0.6, 0.5, 0.45, 0.04, M.chrome, -16.2, 1.42, 67.3); SP(inn, 0.03, emissive(0x3aff7a, 3), -16.2, 1.5, 67.06, 1, 1, 0.4, 8);
  for (let i = 0; i < 5; i++) { CY(inn, 0.045, 0.035, 0.1, C.porcelain(), -20.4 + i * 0.25, 1.21, 67.1, 0, 0, 0, 12); }
  for (const x of [-21, -18, -15]) { CY(inn, 0.005, 0.005, 1.2, M.black, x, h - 0.6, 65.5, 0, 0, 0, 6); CO(inn, 0.22, 0.24, mat(0x2d4a2a, { roughness: 0.5 }), x, h - 1.25, 65.5, 0, 0, 0, 20); SP(inn, 0.07, emissive(0xffd79a, 3), x, h - 1.35, 65.5); }
  for (const y of [1.8, 2.3]) box(inn, 5, 0.04, 0.3, C.wood(0x6a4424), -18, y, 69.2);
  for (let i = 0; i < 12; i++) CY(inn, 0.06, 0.06, 0.2 + R() * 0.1, mat([0xc0392b, 0xf2efe6, 0x2d4a2a, 0x8a5a32][i % 4], { roughness: 0.5 }), -20.2 + i * 0.4, 1.95, 69.2, 0, 0, 0, 12);
  sign(inn, 'MENÚ', 2.2, 1.0, -18, 2.4, 69.37, Math.PI, { bg: '#1c1c1a', fg: '#f4e8c8', font: 'bold 120px Rubik, system-ui', sub: 'Americano $25 · Latte $45 · Pan $18', subFont: '500 60px Rubik, system-ui' });
  // terraza con mesas y sombrillas
  for (const x of [-21.4, -14.6]) {
    const t = grp(g, x, 0, 59.2);
    CY(t, 0.45, 0.45, 0.04, M.white, 0, 0.74, 0, 0, 0, 0, 24); CY(t, 0.03, 0.03, 0.74, M.frame, 0, 0.37, 0, 0, 0, 0, 8); CY(t, 0.25, 0.28, 0.03, M.frame, 0, 0.015, 0, 0, 0, 0, 16);
    CY(t, 0.025, 0.025, 2.3, M.alum, 0, 1.15, 0, 0, 0, 0, 8);
    const um = add(t, new THREE.ConeGeometry(1.4, 0.45, 8, 1, true), mat(0xffffff, { map: TX.awning('#2d4a2a', '#f4e8c8'), side: THREE.DoubleSide, roughness: 0.9 }), 0, 2.2, 0);
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.4, cx = Math.cos(a) * 0.75, cz = Math.sin(a) * 0.75; const ch = grp(t, cx, 0, cz, 0, -a - Math.PI / 2); RB(ch, 0.42, 0.04, 0.42, 0.01, C.wood(0x8a5a32), 0, 0.46, 0); for (const [a1, b1] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) CY(ch, 0.015, 0.015, 0.46, M.frame, a1 * 0.18, 0.23, b1 * 0.18, 0, 0, 0, 6); RB(ch, 0.42, 0.36, 0.03, 0.01, C.wood(0x8a5a32), 0, 0.68, -0.2); }
    col(0, box(t, 0.9, 0.9, 0.9, M.black, 0, 0.45, 0)).visible = false;
  }
  pot(g, x0 + 0.4, 60.8, 0.12, 1.2, 7); pot(g, x1 - 0.4, 60.8, 0.12, 1.2, 8);
  pts.cafe = new THREE.Vector3(-18, 0, 60.3);
};

// El taller lo modela js/town-buildings.js (coordenadas del mundo, mismo contrato)
S.taller = (g, built, slots, pts) => { if (TB.tallerRestauracion) TB.tallerRestauracion(g, pts); else pts.taller = new THREE.Vector3(30, 0, 68.6); };

S.plaza = (g, built, slots, pts) => {
  const cx = -38, cz = 67.5;
  floor(g, -48, 57.3, -28, 78, M.pavers, 0.012, 0.9);
  // círculo central y kiosco
  const ring = add(g, new THREE.RingGeometry(3.6, 4.1, 48), M.concrete, cx, 0.02, cz, -Math.PI / 2); ring.castShadow = false;
  const k = grp(g, cx, 0, cz);
  const plat = add(k, new THREE.CylinderGeometry(3.4, 3.5, 0.3, 8), M.concrete, 0, 0.15, 0); plat.castShadow = false;
  add(k, new THREE.CylinderGeometry(3.42, 3.42, 0.04, 8), mat(0xb8603a, { roughness: 0.8 }), 0, 0.31, 0).castShadow = false;
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + Math.PI / 8, x = Math.cos(a) * 3.1, z = Math.sin(a) * 3.1;
    col(0, CY(k, 0.1, 0.12, 3.1, M.white, x, 1.85, z, 0, 0, 0, 12));
    CY(k, 0.18, 0.18, 0.12, M.white, x, 0.38, z, 0, 0, 0, 12); CY(k, 0.17, 0.12, 0.14, M.white, x, 3.35, z, 0, 0, 0, 12);
    // barandal entre columnas (dejando la entrada al frente)
    if (i !== 5) { const a2 = (i + 1) / 8 * Math.PI * 2 + Math.PI / 8, x2 = Math.cos(a2) * 3.1, z2 = Math.sin(a2) * 3.1; TU(k, [[x, 1.2, z], [x2, 1.2, z2]], 0.035, metal(0x2a4a2a, 0.5)); for (let t = 1; t < 6; t++) CY(k, 0.012, 0.012, 0.85, metal(0x2a4a2a, 0.5), x + (x2 - x) * t / 6, 0.75, z + (z2 - z) * t / 6, 0, 0, 0, 6); }
  }
  const roof = add(k, new THREE.ConeGeometry(4.0, 1.7, 8, 1), mat(0x2a6a4a, { roughness: 0.6, side: THREE.DoubleSide }), 0, 4.3, 0, 0, Math.PI / 8);
  add(k, new THREE.CylinderGeometry(3.95, 3.95, 0.25, 8, 1, true), M.white, 0, 3.45, 0, 0, Math.PI / 8);
  CY(k, 0.04, 0.02, 0.8, M.gold, 0, 5.5, 0, 0, 0, 0, 8); SP(k, 0.1, M.gold, 0, 5.2, 0);
  // bancas, faroles y jardineras
  const bench = (x, z, ry) => { const b = grp(g, x, 0, z, 0, ry); for (let i = 0; i < 4; i++) RB(b, 1.8, 0.05, 0.1, 0.01, C.wood(0x8a5a32), 0, 0.46, -0.18 + i * 0.12); for (let i = 0; i < 3; i++) RB(b, 1.8, 0.08, 0.04, 0.01, C.wood(0x8a5a32), 0, 0.62 + i * 0.13, -0.26, -0.15); for (const s of [-0.8, 0.8]) { add(b, new THREE.BoxGeometry(0.06, 0.46, 0.5), metal(0x1c2a1c, 0.5), s, 0.23, 0); add(b, new THREE.BoxGeometry(0.06, 0.45, 0.06), metal(0x1c2a1c, 0.5), s, 0.7, -0.27); } col(0, box(b, 1.9, 0.8, 0.6, M.black, 0, 0.4, -0.05)).visible = false; };
  bench(cx, cz - 5.6, 0); bench(cx, cz + 5.6, Math.PI); bench(cx - 5.6, cz, Math.PI / 2); bench(cx + 5.6, cz, -Math.PI / 2);
  for (const [x, z] of [[-43.5, 62], [-32.5, 62], [-43.5, 73], [-32.5, 73]]) {
    col(0, CY(g, 0.07, 0.1, 3.4, metal(0x1c2a1c, 0.5), x, 1.7, z, 0, 0, 0, 10));
    CY(g, 0.18, 0.22, 0.25, metal(0x1c2a1c, 0.5), x, 0.12, z, 0, 0, 0, 12);
    const lamp = grp(g, x, 3.4, z); add(lamp, new THREE.CylinderGeometry(0.18, 0.12, 0.4, 6), mat(0xfff0c8, { emissive: 0xffd79a, emissiveIntensity: 1.2, transparent: true, opacity: 0.9 }), 0, 0.2, 0); add(lamp, new THREE.ConeGeometry(0.26, 0.2, 6), metal(0x1c2a1c, 0.5), 0, 0.5, 0);
  }
  for (const [x, z] of [[-45, 67.5], [-31, 67.5]]) { col(0, RB(g, 1.4, 0.45, 3.4, 0.04, M.concrete, x, 0.225, z)); box(g, 1.2, 0.05, 3.2, M.dirt, x, 0.44, z); flowerPatch(g, x, 0.45, z, 1.1, 3.0, 30, Math.round(x)); }
  sign(g, 'PLAZA DEL BARRIO', 2.4, 0.5, cx, 1.35, 57.9, Math.PI, { bg: '#2a6a4a', fg: '#ffffff', font: 'bold 150px Rubik, system-ui' });
  for (const x of [-39.1, -36.9]) CY(g, 0.05, 0.05, 1.6, metal(0x1c2a1c, 0.5), x, 0.8, 57.92, 0, 0, 0, 8);
  pts.plaza = new THREE.Vector3(cx, 0, cz);
};

// ---------------- armado ----------------
// Devuelve { group, pieces: {id: Group}, slots, colliders: [Mesh], pts }
export function buildStore(built) {
  const root = new THREE.Group();
  const pieces = {}, slots = [], pts = {};
  const order = Object.keys(S).filter(id => id !== 'cafeteria' && (id === 'baldio' ? !built.has('terreno') : built.has(id)));
  for (const id of order) { const g = new THREE.Group(); g.name = id; S[id](g, built, slots, pts); root.add(g); pieces[id] = g; }
  const colliders = [];
  root.updateMatrixWorld(true);
  root.traverse(o => { if (o.userData.col) colliders.push(o); });
  return { group: root, pieces, slots, colliders, pts };
}
export const STORE_FLOOR = FB;

// Café La Esquina: negocio del barrio que existe desde el inicio (se puede comprar)
export function buildCafe() {
  const g = new THREE.Group(), pts = {};
  S.cafeteria(g, new Set(), [], pts);
  const colliders = []; g.updateMatrixWorld(true); g.traverse(o => { if (o.userData.col) colliders.push(o); });
  return { group: g, colliders, pts };
}
