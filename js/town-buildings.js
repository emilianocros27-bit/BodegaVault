// Edificios de los negocios del barrio y el taller de restauración.
// Todo se modela a mano con geometría procedural + texturas pintadas en canvas (rótulos, desgaste,
// herrería, productos). Las piezas repetidas se fusionan por material (Kit) para mantener pocas
// llamadas de dibujo: cada edificio queda en ~60–150 mallas.
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, rng } from './modelkit.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { leafyPlant, cactusMesh, agaveMesh } from './vegetation.js';
import { trashCan, trashBagMesh } from './props.js';
import { makeCar } from './cars.js';

const PI = Math.PI, TAU = PI * 2;
const hx = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0');

// =====================================================================================
// Fuentes de rotulista (se cargan una vez; las texturas con texto se repintan al llegar)
// =====================================================================================
const FONTS = ['Alfa Slab One', 'Lobster', 'Bungee', 'Monoton', 'Pacifico', 'Rubik', 'Bebas Neue'];
let fontsReady = false;
const redraws = [];
if (typeof document !== 'undefined') {
  let link = document.querySelector('link[data-tb-fonts]');
  const loaded = new Promise((res) => {
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet'; link.dataset.tbFonts = '1';
      link.href = 'https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Bungee&family=Lobster&family=Monoton&family=Pacifico&family=Bebas+Neue&family=Rubik:wght@400;500;700;800&display=swap';
      link.onload = res; link.onerror = res;
      document.head.appendChild(link);
    } else res();
    setTimeout(res, 5000);
  });
  loaded.then(() => Promise.all(FONTS.map(f => document.fonts.load(`40px "${f}"`).catch(() => null))))
    .then(() => { fontsReady = true; for (const f of redraws.splice(0)) f(); });
}
// textura de canvas que se vuelve a pintar cuando las fuentes estén listas
function ftex(key, w, h, draw, repeat = false) {
  const t = canvasTex(key, w, h, draw, repeat);
  if (!fontsReady && !t.userData.tbRedraw) {
    t.userData.tbRedraw = true;
    redraws.push(() => { const ctx = t.image.getContext('2d'); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, w, h); draw(ctx, w, h); t.needsUpdate = true; });
  }
  return t;
}

// =====================================================================================
// Kit: acumula geometría transformada por material y la fusiona en una malla por material
// =====================================================================================
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();
const TM = (x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) =>
  new THREE.Matrix4().compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz)), _s.set(sx, sy, sz));

class Kit {
  constructor(bk = new Map(), base = new THREE.Matrix4()) { this.bk = bk; this.base = base; }
  sub(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) { return new Kit(this.bk, this.base.clone().multiply(TM(x, y, z, rx, ry, rz, s))); }
  geo(m, g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
    g.applyMatrix4(this.base.clone().multiply(TM(x, y, z, rx, ry, rz, sx, sy, sz)));
    if (!this.bk.has(m)) this.bk.set(m, []);
    this.bk.get(m).push(g);
    return g;
  }
  box(m, w, h, d, x, y, z, rx, ry, rz) { return this.geo(m, new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz); }
  wbox(m, w, h, d, x, y, z, s = 1, rx, ry, rz) { return this.geo(m, uvBox(w, h, d, s), x, y, z, rx, ry, rz); }
  rbox(m, w, h, d, r, x, y, z, rx, ry, rz, seg = 2) { return this.geo(m, new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999), x, y, z, rx, ry, rz); }
  cyl(m, rt, rb, h, x, y, z, rx, ry, rz, seg = 16, open = false) { return this.geo(m, new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), x, y, z, rx, ry, rz); }
  sph(m, r, x, y, z, sx = 1, sy = 1, sz = 1, seg = 12) { return this.geo(m, new THREE.SphereGeometry(r, seg, Math.max(6, seg * 0.7 | 0)), x, y, z, 0, 0, 0, sx, sy, sz); }
  hemi(m, r, x, y, z, sx = 1, sy = 1, sz = 1, seg = 14) { return this.geo(m, new THREE.SphereGeometry(r, seg, Math.max(5, seg / 2 | 0), 0, TAU, 0, PI / 2), x, y, z, 0, 0, 0, sx, sy, sz); }
  tor(m, R, t, x, y, z, rx, ry, rz, arc = TAU, seg = 24, ts = 8) { return this.geo(m, new THREE.TorusGeometry(R, t, ts, seg, arc), x, y, z, rx, ry, rz); }
  cone(m, r, h, x, y, z, rx, ry, rz, seg = 16, open = false) { return this.geo(m, new THREE.ConeGeometry(r, h, seg, 1, open), x, y, z, rx, ry, rz); }
  lathe(m, pts, x, y, z, seg = 24, rx = 0, ry = 0, rz = 0, s = 1) { return this.geo(m, new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg), x, y, z, rx, ry, rz, s); }
  tube(m, pts, r, seg = 24, radial = 6, closed = false) {
    const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed);
    return this.geo(m, new THREE.TubeGeometry(curve, seg, r, radial, closed));
  }
  plane(m, w, h, x, y, z, rx, ry, rz) { return this.geo(m, new THREE.PlaneGeometry(w, h), x, y, z, rx, ry, rz); }
  ext(m, shape, d, x, y, z, rx, ry, rz, bevel = 0, curveSeg = 12) {
    const s = Array.isArray(shape) ? new THREE.Shape(shape.map(([a, b]) => new THREE.Vector2(a, b))) : shape;
    const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: curveSeg });
    g.translate(0, 0, -d / 2);
    return this.geo(m, g, x, y, z, rx, ry, rz);
  }
  // caja con UV en una celda de un atlas NxM (todas las caras muestran la celda)
  abox(m, w, h, d, cell, n, x, y, z, rx, ry, rz, rows = n) {
    const g = new THREE.BoxGeometry(w, h, d); cellUV(g, cell, n, rows);
    return this.geo(m, g, x, y, z, rx, ry, rz);
  }
  acyl(m, rt, rb, h, cell, n, x, y, z, rx, ry, rz, seg = 12, rows = n) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, true); cellUV(g, cell, n, rows);
    return this.geo(m, g, x, y, z, rx, ry, rz);
  }
  // tira de cable que cuelga entre dos puntos (catenaria aproximada)
  wire(m, a, b, sag = 0.3, r = 0.008, seg = 12) {
    const pts = [];
    for (let i = 0; i <= 6; i++) { const t = i / 6; pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * PI) * sag, a[2] + (b[2] - a[2]) * t]); }
    return this.tube(m, pts, r, seg, 5);
  }
  build(parent) {
    const out = [];
    for (const [m, list] of this.bk) {
      if (!list.length) continue;
      const gs = list.map(normGeo);
      const merged = gs.length === 1 ? gs[0] : mergeGeometries(gs, false);
      if (!merged) { console.warn('Kit: merge failed', m); continue; }
      const mesh = new THREE.Mesh(merged, m);
      const see = m.transparent || (m.emissiveIntensity > 0.9 && m.emissive && m.emissive.getHex() !== 0);
      mesh.castShadow = !see; mesh.receiveShadow = !m.transparent;
      parent.add(mesh); out.push(mesh);
    }
    this.bk.clear();
    return out;
  }
}
function normGeo(g) {
  let n = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(n.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') n.deleteAttribute(k);
  if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
  if (!n.attributes.normal) n.computeVertexNormals();
  n.clearGroups(); n.morphAttributes = {};
  return n;
}
function cellUV(g, cell, n, rows = n) {
  const uv = g.attributes.uv, cx = cell % n, cy = (cell / n | 0) % rows;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (cx + 0.04 + uv.getX(i) * 0.92) / n, 1 - (cy + 1 - 0.04 - uv.getY(i) * 0.92) / rows);
}
function uvBox(w, h, d, s = 1) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setXY(i, uv.getX(i) * dims[f][0] * s, uv.getY(i) * dims[f][1] * s); }
  return g;
}
// proyección planar de UV (para muros pintados de una pieza)
function projUV(g, fu, fv) {
  const p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, fu(p.getX(i), p.getY(i), p.getZ(i)), fv(p.getX(i), p.getY(i), p.getZ(i)));
  uv.needsUpdate = true;
  return g;
}
// helpers de colisión
function colBox(parent, cols, w, h, d, x, y, z, ry = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), HIDDEN);
  m.position.set(x, y, z); m.rotation.y = ry; m.visible = false; m.userData.col = true;
  parent.add(m); cols.push(m);
  return m;
}
const HIDDEN = new THREE.MeshBasicMaterial({ color: 0xff00ff, visible: false });

// =====================================================================================
// Pintura en canvas: muros con desgaste, rótulos a mano, lonas
// =====================================================================================
function rgba(h, a) { const n = typeof h === 'number' ? h : parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; }
function shadeC(h, k) {
  const n = typeof h === 'number' ? h : parseInt(h.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, k >= 1 ? v + (255 - v) * (k - 1) : v * k)) | 0;
  return `rgb(${f((n >> 16) & 255)},${f((n >> 8) & 255)},${f(n & 255)})`;
}
// ajusta el tamaño de letra para que el texto quepa
function fitFont(c, text, font, px, maxW) {
  c.font = font.replace('#', px);
  let w = c.measureText(text).width;
  if (w > maxW) { px = Math.max(6, px * maxW / w); c.font = font.replace('#', px); }
  return px;
}
// texto de rotulista: sombra, contorno y relleno con pincelada irregular
function brushText(c, text, x, y, o) {
  const { font = '800 #px Rubik, system-ui', px = 60, maxW = 9999, fill = '#fff', outline = null, ow = 0.12, shadow = null, sh = 0.08, align = 'center', base = 'middle', grad = null, skew = 0, seed = 1, rough = 0.6, glow = null } = o;
  const R = rng(seed + text.length * 31);
  c.save();
  const s = fitFont(c, text, font, px, maxW);
  c.textAlign = align; c.textBaseline = base; c.lineJoin = 'round';
  c.translate(x, y); if (skew) c.transform(1, 0, skew, 1, 0, 0);
  if (glow) { c.shadowColor = glow; c.shadowBlur = s * 0.45; }
  if (shadow) { c.fillStyle = shadow; c.strokeStyle = shadow; c.lineWidth = s * ow * 1.6; c.strokeText(text, s * sh, s * sh); c.fillText(text, s * sh, s * sh); }
  c.shadowBlur = glow ? s * 0.45 : 0;
  if (outline) { c.strokeStyle = outline; c.lineWidth = s * ow * 2; c.strokeText(text, 0, 0); }
  if (grad) { const g = c.createLinearGradient(0, -s / 2, 0, s / 2); grad.forEach((cc, i) => g.addColorStop(i / (grad.length - 1), cc)); c.fillStyle = g; } else c.fillStyle = fill;
  c.fillText(text, 0, 0);
  c.shadowBlur = 0;
  // pinceladas: variaciones leves de tono dentro de las letras
  if (rough > 0) {
    c.globalCompositeOperation = 'source-atop';
    const tw = c.measureText(text).width;
    const x0 = align === 'center' ? -tw / 2 : align === 'right' ? -tw : 0;
    for (let i = 0; i < 26; i++) { c.fillStyle = R() < 0.5 ? `rgba(255,255,255,${0.05 * rough})` : `rgba(0,0,0,${0.07 * rough})`; c.fillRect(x0 + R() * tw, -s * 0.6 + R() * s * 1.2, 2 + R() * s * 0.4, 1 + R() * s * 0.06); }
    c.globalCompositeOperation = 'source-over';
  }
  c.restore();
  return s;
}
function noiseFill(c, x, y, w, h, n, a, R, size = 2) {
  for (let i = 0; i < n; i++) { const k = R() < 0.5 ? 0 : 255; c.fillStyle = `rgba(${k},${k},${k},${R() * a})`; c.fillRect(x + R() * w, y + R() * h, size, size); }
}
function blotches(c, W, H, n, col, a, R, rmin = 20, rmax = 80) {
  for (let i = 0; i < n; i++) {
    const x = R() * W, y = R() * H, r = rmin + R() * (rmax - rmin);
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, rgba(col, a * (0.4 + R() * 0.6))); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
function brickPattern(c, x, y, w, h, bw, bh, R, base = 0xa0543a, mortar = '#b9ad98') {
  c.fillStyle = mortar; c.fillRect(x, y, w, h);
  for (let r = 0, yy = y; yy < y + h; r++, yy += bh) for (let xx = x - (r % 2 ? bw / 2 : 0); xx < x + w; xx += bw) {
    const k = 0.78 + R() * 0.32; c.fillStyle = shadeC(base, k); c.fillRect(xx + 1.5, yy + 1.5, bw - 3, bh - 3);
  }
}
// Pintor de muros en coordenadas de metros: x ∈ [-W/2, W/2], y ∈ [0, H] (y hacia arriba)
function wallPainter(c, W, H, ppm, R) {
  const X = (x) => (x + W / 2) * ppm, Y = (y) => (H - y) * ppm, S = (m) => m * ppm;
  const F = {
    c, W, H, ppm, R, X, Y, S,
    rect(x0, y0, x1, y1, col) { c.fillStyle = col; c.fillRect(X(x0), Y(y1), S(x1 - x0), S(y1 - y0)); },
    // banda de pintura con orillas de brocha
    band(x0, y0, x1, y1, col, jag = 0.012) {
      c.fillStyle = col; c.beginPath(); c.moveTo(X(x0), Y(y0));
      for (let x = x0; x <= x1 + 1e-6; x += 0.12) c.lineTo(X(x), Y(y1 + (R() - 0.5) * jag));
      for (let x = x1; x >= x0 - 1e-6; x -= 0.12) c.lineTo(X(x), Y(y0 + (R() - 0.5) * jag));
      c.closePath(); c.fill();
    },
    texture(k = 1) { noiseFill(c, 0, 0, S(W), S(H), 9000 * k, 0.06, R, 2); blotches(c, S(W), S(H), 30 * k, 0x6a5a40, 0.08, R, S(0.2), S(1.2)); },
    // escurrimientos, salpicado inferior, suciedad general
    grime(k = 1, tops = []) {
      if (k <= 0) return;
      for (let i = 0; i < 70 * k; i++) {
        const x = -W / 2 + R() * W, y0 = tops.length ? tops[(R() * tops.length) | 0] : H - R() * 0.1, len = 0.3 + R() * 1.6 * k;
        const g = c.createLinearGradient(0, Y(y0), 0, Y(y0 - len)); g.addColorStop(0, `rgba(55,45,35,${0.12 + 0.2 * k * R()})`); g.addColorStop(1, 'rgba(55,45,35,0)');
        c.fillStyle = g; c.fillRect(X(x), Y(y0), S(0.02 + R() * 0.12), S(len));
      }
      const g = c.createLinearGradient(0, Y(0), 0, Y(0.7)); g.addColorStop(0, `rgba(70,55,40,${0.45 * k})`); g.addColorStop(1, 'rgba(70,55,40,0)');
      c.fillStyle = g; c.fillRect(0, Y(0.7), S(W), S(0.7));
      for (let i = 0; i < 400 * k; i++) { c.fillStyle = `rgba(60,48,36,${R() * 0.25})`; c.fillRect(X(-W / 2 + R() * W), Y(R() * R() * 0.6), 2 + R() * 3, 2 + R() * 3); }
      blotches(c, S(W), S(H), 18 * k, 0x3a3228, 0.14 * k, R, S(0.3), S(1.4));
    },
    // pintura descarapelada que deja ver aplanado gris o tabique
    peel(n, under = 'brick', col = null, yMax = H) {
      for (let i = 0; i < n; i++) {
        const cx = -W / 2 + 0.2 + R() * (W - 0.4), cy = 0.15 + R() * (yMax - 0.4), rx = 0.12 + R() * 0.45, ry = 0.08 + R() * 0.3;
        c.save(); c.beginPath();
        for (let a = 0; a < TAU; a += 0.35) { const k = 0.6 + R() * 0.5; const px = X(cx + Math.cos(a) * rx * k), py = Y(cy + Math.sin(a) * ry * k); a === 0 ? c.moveTo(px, py) : c.lineTo(px, py); }
        c.closePath();
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; c.stroke();
        c.clip();
        if (under === 'brick') brickPattern(c, X(cx - rx), Y(cy + ry), S(rx * 2), S(ry * 2), S(0.28), S(0.075), R);
        else { c.fillStyle = col || '#9a968c'; c.fillRect(X(cx - rx), Y(cy + ry), S(rx * 2), S(ry * 2)); noiseFill(c, X(cx - rx), Y(cy + ry), S(rx * 2), S(ry * 2), 300, 0.2, R); }
        c.restore();
        c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(X(cx - rx * 0.8), Y(cy - ry * 0.9), S(rx * 1.6), 2);
      }
    },
    cracks(n) {
      c.strokeStyle = 'rgba(40,34,28,0.55)';
      for (let i = 0; i < n; i++) {
        let x = -W / 2 + R() * W, y = R() * H; c.lineWidth = 0.8 + R() * 1.2; c.beginPath(); c.moveTo(X(x), Y(y));
        for (let k = 0; k < 8; k++) { x += (R() - 0.5) * 0.25; y -= 0.05 + R() * 0.12; c.lineTo(X(x), Y(y)); }
        c.stroke();
      }
    },
    // grafiti de firmas (tags)
    tags(n, cols = ['#1a1a1a', '#2a4ab8', '#c02a2a', '#7a2ab8']) {
      for (let i = 0; i < n; i++) {
        const x = -W / 2 + 0.3 + R() * (W - 0.6), y = 0.4 + R() * 1.4, s = 0.25 + R() * 0.3;
        c.strokeStyle = cols[(R() * cols.length) | 0]; c.lineWidth = S(0.018 + R() * 0.02); c.lineCap = 'round'; c.beginPath();
        let px = x, py = y; c.moveTo(X(px), Y(py));
        for (let k = 0; k < 9; k++) { px += s * (0.08 + R() * 0.12); py = y + (R() - 0.5) * s; c.quadraticCurveTo(X(px - s * 0.1), Y(y + (R() - 0.5) * s * 1.4), X(px), Y(py)); }
        c.stroke();
      }
    },
    // cartel pegado (anuncio de papel) medio roto
    poster(x, y, w, h, bg, lines, seed = 1) {
      const Rp = rng(seed);
      c.save(); c.translate(X(x), Y(y)); c.rotate((Rp() - 0.5) * 0.08);
      c.fillStyle = bg; c.fillRect(-S(w / 2), -S(h / 2), S(w), S(h));
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-S(w / 2), S(h / 2) - 3, S(w), 3);
      lines.forEach(([t, col, sz], i) => { c.fillStyle = col; c.font = `800 ${S(sz)}px Rubik, system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle'; const yy = -S(h / 2) + S(h) * (i + 0.7) / (lines.length + 0.4); fitFont(c, t, `800 #px Rubik, system-ui`, S(sz), S(w * 0.9)); c.fillText(t, 0, yy); });
      // esquina despegada y doblada
      const fw = S(w * (0.12 + 0.2 * Rp())), fh = S(h * (0.1 + 0.2 * Rp()));
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.moveTo(S(w / 2), S(h / 2)); c.lineTo(S(w / 2) - fw, S(h / 2)); c.lineTo(S(w / 2), S(h / 2) - fh); c.fill();
      c.fillStyle = '#e8e2d2'; c.beginPath(); c.moveTo(S(w / 2) - fw, S(h / 2)); c.lineTo(S(w / 2), S(h / 2) - fh); c.lineTo(S(w / 2) - fw * 0.8, S(h / 2) - fh * 0.8); c.fill();
      c.restore();
    },
    text(t, x, y, o) { return brushText(c, t, X(x), Y(y), { ...o, px: S(o.size ?? 0.4), maxW: S(o.maxW ?? W) }); },
  };
  return F;
}

// =====================================================================================
// Texturas base (se generan una sola vez)
// =====================================================================================
const TX = {};
const T = (key, w, h, draw, rep = true) => canvasTex('tb-' + key, w, h, draw, rep);
function lazyTX() {
  if (TX.ready) return TX;
  TX.ready = true;
  TX.concrete = T('concrete', 256, 256, (c, w) => {
    const R = rng(11); c.fillStyle = '#a9a49a'; c.fillRect(0, 0, w, w);
    noiseFill(c, 0, 0, w, w, 9000, 0.08, R); blotches(c, w, w, 26, 0x5a5448, 0.12, R, 10, 60);
    c.strokeStyle = 'rgba(60,55,50,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 1); c.lineTo(w, 1); c.moveTo(1, 0); c.lineTo(1, w); c.stroke();
  });
  // concreto de taller: manchas de aceite y llanta
  TX.shopFloor = T('shopfloor', 512, 512, (c, w) => {
    const R = rng(12); c.fillStyle = '#8f8b84'; c.fillRect(0, 0, w, w);
    noiseFill(c, 0, 0, w, w, 16000, 0.08, R); blotches(c, w, w, 40, 0x4a463e, 0.14, R, 20, 90);
    for (let i = 0; i < 9; i++) { const x = R() * w, y = R() * w, r = 20 + R() * 60; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(20,18,14,0.75)'); g.addColorStop(0.6, 'rgba(25,22,18,0.4)'); g.addColorStop(1, 'rgba(25,22,18,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, r * (0.5 + R() * 0.5), R() * 3, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(50,46,40,0.5)'; c.lineWidth = 2; c.strokeRect(0, 0, w, w);
    c.strokeStyle = 'rgba(40,36,30,0.4)'; for (let i = 0; i < 6; i++) { let x = R() * w, y = R() * w; c.lineWidth = 0.8; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 10; k++) { x += (R() - 0.5) * 30; y += (R() - 0.5) * 30; c.lineTo(x, y); } c.stroke(); }
  });
  TX.block = T('block', 256, 256, (c, w) => {          // tabicón gris 40x20
    const R = rng(13); c.fillStyle = '#8a877f'; c.fillRect(0, 0, w, w);
    const bw = w / 2.5, bh = w / 5;
    for (let r = 0; r < 5; r++) for (let x = (r % 2 ? -bw / 2 : 0); x < w; x += bw) { const k = 0.85 + R() * 0.25; c.fillStyle = shadeC(0xa7a399, k); c.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4); noiseFill(c, x + 2, r * bh + 2, bw - 4, bh - 4, 160, 0.18, R); }
  });
  TX.brick = T('brick', 256, 256, (c, w) => { const R = rng(14); brickPattern(c, 0, 0, w, w, w / 4, w / 12, R); noiseFill(c, 0, 0, w, w, 3000, 0.08, R); });
  TX.roofRed = T('roofred', 256, 256, (c, w) => {        // impermeabilizante rojo
    const R = rng(15); c.fillStyle = '#9a4a34'; c.fillRect(0, 0, w, w);
    noiseFill(c, 0, 0, w, w, 7000, 0.1, R); blotches(c, w, w, 30, 0x5a3a2a, 0.2, R, 10, 70); blotches(c, w, w, 12, 0xd8b0a0, 0.12, R, 10, 50);
    c.strokeStyle = 'rgba(60,30,20,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, w / 2); c.lineTo(w, w / 2 + 6); c.stroke();
  });
  TX.corrugated = T('corr', 128, 128, (c, w) => {        // cortina metálica (duelas horizontales)
    for (let y = 0; y < w; y += 16) { const g = c.createLinearGradient(0, y, 0, y + 16); g.addColorStop(0, '#6e7478'); g.addColorStop(0.35, '#d4d8da'); g.addColorStop(0.7, '#9aa0a4'); g.addColorStop(1, '#4e5256'); c.fillStyle = g; c.fillRect(0, y, w, 16); }
    const R = rng(16); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(110,70,40,${R() * 0.12})`; c.fillRect(R() * w, R() * w, 2, 2 + R() * 4); }
  });
  TX.lamina = T('lamina', 128, 128, (c, w) => {          // lámina acanalada (vertical)
    for (let x = 0; x < w; x += 21.33) { const g = c.createLinearGradient(x, 0, x + 21.33, 0); g.addColorStop(0, '#7d8388'); g.addColorStop(0.5, '#c8cdd0'); g.addColorStop(1, '#7d8388'); c.fillStyle = g; c.fillRect(x, 0, 21.4, w); }
    const R = rng(17); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(120,70,40,${R() * 0.15})`; c.fillRect(R() * w, R() * w, 2, 3 + R() * 6); }
  });
  TX.tileCream = T('tilecream', 256, 256, (c, w) => {
    const R = rng(18); c.fillStyle = '#9d968a'; c.fillRect(0, 0, w, w);
    for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { const k = 0.93 + R() * 0.07; c.fillStyle = `rgb(${230 * k | 0},${222 * k | 0},${204 * k | 0})`; c.fillRect(x * 128 + 2, y * 128 + 2, 124, 124); noiseFill(c, x * 128 + 2, y * 128 + 2, 124, 124, 200, 0.06, R); }
  });
  TX.terrazzo = T('terrazzo', 256, 256, (c, w) => {
    const R = rng(19); c.fillStyle = '#d8d2c6'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 1400; i++) { const v = R(); c.fillStyle = v < 0.3 ? '#8a8276' : v < 0.55 ? '#b0a08a' : v < 0.7 ? '#6a6a6a' : v < 0.8 ? '#c98a6a' : '#f4f0e8'; c.beginPath(); c.ellipse(R() * w, R() * w, 1 + R() * 3.5, 1 + R() * 2.5, R() * 3, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(120,110,95,0.6)'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, w - 2);
  });
  TX.checker = T('checker', 256, 256, (c, w) => {
    const R = rng(20);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#1c1c1e' : '#ecebe6'; c.fillRect(x * 64, y * 64, 64, 64); noiseFill(c, x * 64, y * 64, 64, 64, 60, 0.06, R); }
    c.strokeStyle = 'rgba(128,128,128,0.4)'; c.lineWidth = 1; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, w); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); }
  });
  TX.rubber = T('rubberfloor', 128, 128, (c, w) => {
    const R = rng(21); c.fillStyle = '#26282a'; c.fillRect(0, 0, w, w);
    for (let i = 0; i < 700; i++) { c.fillStyle = R() < 0.5 ? 'rgba(90,90,90,0.5)' : 'rgba(230,110,40,0.35)'; c.fillRect(R() * w, R() * w, 1.5, 1.5); }
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 2; c.strokeRect(0, 0, w, w);
  });
  TX.arcadeCarpet = T('arccarpet', 256, 256, (c, w) => {
    const R = rng(22); c.fillStyle = '#120a24'; c.fillRect(0, 0, w, w);
    const cols = ['#ff3ad0', '#3af2ff', '#f2ff3a', '#7a3aff'];
    for (let i = 0; i < 60; i++) { c.strokeStyle = cols[i % 4]; c.lineWidth = 2; const x = R() * w, y = R() * w, s = 6 + R() * 10; c.beginPath(); if (i % 3 === 0) c.arc(x, y, s / 2, 0, TAU); else if (i % 3 === 1) { c.moveTo(x - s, y); c.lineTo(x, y - s); c.lineTo(x + s, y); } else { c.moveTo(x, y); c.lineTo(x + s, y + s); c.moveTo(x + s, y); c.lineTo(x, y + s); } c.stroke(); }
  });
  TX.wood = T('woodplank', 256, 256, (c, w) => {
    const R = rng(23);
    for (let i = 0; i < 8; i++) { const k = 0.8 + R() * 0.3; c.fillStyle = shadeC(0x8a5a32, k); c.fillRect(0, i * 32, w, 32); for (let j = 0; j < 14; j++) { c.strokeStyle = `rgba(50,30,15,${0.1 + R() * 0.2})`; c.lineWidth = 1; c.beginPath(); const y = i * 32 + R() * 32; c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + (R() - 0.5) * 3); c.stroke(); } c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(0, i * 32, w, 2); }
  });
  TX.herreria = T('herreria', 256, 256, (c, w) => {     // herrería con volutas (alpha)
    c.clearRect(0, 0, w, w); c.strokeStyle = '#fff'; c.lineCap = 'round';
    c.lineWidth = 10; c.strokeRect(5, 5, w - 10, w - 10);
    c.lineWidth = 7; for (let x = 32; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, w); c.stroke(); }
    c.lineWidth = 6; c.beginPath(); c.moveTo(0, w * 0.2); c.lineTo(w, w * 0.2); c.moveTo(0, w * 0.8); c.lineTo(w, w * 0.8); c.stroke();
    c.lineWidth = 5; for (let x = 32; x < w; x += 64) for (const y of [w * 0.2, w * 0.8]) { for (const s of [-1, 1]) { c.beginPath(); c.arc(x + s * 16, y - s * 10, 12, 0, PI * 1.5); c.stroke(); } }
    c.lineWidth = 5; c.beginPath(); c.arc(w / 2, w / 2, 40, 0, TAU); c.stroke(); c.beginPath(); c.arc(w / 2, w / 2, 18, 0, TAU); c.stroke();
  }, false);
  TX.reja = T('reja', 128, 256, (c, w, h) => {          // reja de tienda (barrotes + malla)
    c.clearRect(0, 0, w, h); c.strokeStyle = '#fff';
    c.lineWidth = 3; for (let i = -h; i < w + h; i += 18) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + h, h); c.moveTo(i + h, 0); c.lineTo(i, h); c.stroke(); }
    c.lineWidth = 9; for (let x = 4; x < w; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
    c.lineWidth = 10; c.beginPath(); c.moveTo(0, 5); c.lineTo(w, 5); c.moveTo(0, h - 5); c.lineTo(w, h - 5); c.moveTo(0, h / 2); c.lineTo(w, h / 2); c.stroke();
  }, true);
  TX.papel = T('papelpicado', 512, 128, (c, w, h) => {   // 4 banderitas de papel picado
    c.clearRect(0, 0, w, h);
    const cols = ['#e8308a', '#2fb0e8', '#f2c230', '#34b85a'];
    for (let i = 0; i < 4; i++) {
      const x0 = i * 128; c.fillStyle = cols[i]; c.fillRect(x0 + 6, 6, 116, 100);
      for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(x0 + 6 + k * 19.3, 106); c.lineTo(x0 + 16 + k * 19.3, 122); c.lineTo(x0 + 25 + k * 19.3, 106); c.fill(); }
      c.globalCompositeOperation = 'destination-out';
      c.beginPath(); c.arc(x0 + 64, 52, 20, 0, TAU); c.fill();
      c.fillStyle = cols[i]; c.globalCompositeOperation = 'source-over'; c.beginPath(); c.arc(x0 + 64, 52, 12, 0, TAU); c.fill();
      c.globalCompositeOperation = 'destination-out';
      for (let a = 0; a < 8; a++) { c.beginPath(); c.ellipse(x0 + 64 + Math.cos(a * PI / 4) * 34, 52 + Math.sin(a * PI / 4) * 30, 7, 4, a * PI / 4, 0, TAU); c.fill(); }
      for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x0 + 18 + k * 23, 16); c.lineTo(x0 + 26 + k * 23, 26); c.lineTo(x0 + 18 + k * 23, 30); c.fill(); }
      c.globalCompositeOperation = 'source-over';
    }
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, 5);
  }, false);
  TX.talavera = T('talavera', 256, 128, (c, w, h) => {
    const R = rng(24); c.fillStyle = '#f4efe2'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1f3f9a'; c.fillRect(0, 0, w, 12); c.fillRect(0, h - 12, w, 12);
    for (let x = 16; x < w; x += 32) { c.fillStyle = '#1f3f9a'; c.beginPath(); c.arc(x, h / 2, 12, 0, TAU); c.fill(); c.fillStyle = '#f2b134'; c.beginPath(); c.arc(x, h / 2, 5, 0, TAU); c.fill(); c.fillStyle = '#1f3f9a'; for (let a = 0; a < 4; a++) { c.beginPath(); c.ellipse(x + Math.cos(a * PI / 2 + PI / 4) * 16, h / 2 + Math.sin(a * PI / 2 + PI / 4) * 16, 5, 2.5, a * PI / 2 + PI / 4, 0, TAU); c.fill(); } }
    noiseFill(c, 0, 0, w, h, 400, 0.05, R);
  });
  TX.azulejo = T('azulejo', 128, 128, (c, w) => {        // azulejo talavera para zoclos
    c.fillStyle = '#f2ecdc'; c.fillRect(0, 0, w, w);
    c.fillStyle = '#1f3f9a'; c.beginPath(); c.moveTo(w / 2, 6); c.lineTo(w - 6, w / 2); c.lineTo(w / 2, w - 6); c.lineTo(6, w / 2); c.closePath(); c.fill();
    c.fillStyle = '#f2ecdc'; c.beginPath(); c.arc(w / 2, w / 2, 26, 0, TAU); c.fill();
    c.fillStyle = '#e0a020'; c.beginPath(); c.arc(w / 2, w / 2, 14, 0, TAU); c.fill();
    c.fillStyle = '#2f8a4a'; for (const [x, y] of [[0, 0], [w, 0], [0, w], [w, w]]) { c.beginPath(); c.arc(x, y, 18, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(80,80,80,0.5)'; c.strokeRect(0, 0, w, w);
  });
  TX.cloth = T('clothstripes', 128, 128, (c, w) => { const cols = ['#c83a3a', '#f2efe6', '#2a5ab8', '#f2c230', '#3aa860', '#e86fb0', '#6a3ab8', '#f08a2a']; for (let i = 0; i < 8; i++) { c.fillStyle = cols[i]; c.fillRect(i * 16, 0, 16, w); } c.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < w; y += 3) c.fillRect(0, y, w, 1); });
  TX.pegboard = T('pegboard', 512, 256, (c, w, h) => {  // pegboard con siluetas de herramienta
    c.fillStyle = '#c9a676'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#6a5030'; for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(30,30,30,0.85)'; const R = rng(25);
    const tool = (x, y, kind, s) => { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath();
      if (kind === 0) { c.rect(-4, -40, 8, 60); c.arc(0, -46, 12, 0, TAU); }           // llave
      else if (kind === 1) { c.rect(-5, -10, 10, 50); c.rect(-18, -30, 36, 20); }      // martillo
      else if (kind === 2) { c.rect(-4, -40, 8, 30); c.rect(-7, -10, 14, 40); }        // desarmador
      else { c.moveTo(-10, -40); c.lineTo(-3, 0); c.lineTo(-8, 40); c.lineTo(-2, 40); c.lineTo(3, 2); c.lineTo(8, 40); c.lineTo(14, 40); c.lineTo(7, 0); c.lineTo(10, -40); c.closePath(); }
      c.fill(); c.restore(); };
    for (let i = 0; i < 16; i++) tool(24 + i * 30, 70 + (i % 2) * 10, i % 4, 0.8 + R() * 0.3);
    for (let i = 0; i < 12; i++) tool(30 + i * 40, 185, (i + 1) % 4, 0.9);
  }, false);
}
// ---------------- atlas de productos (cajas / latas / botellas) ----------------
const BRANDS = ['Gripex', 'Aspirax', 'Dolorín', 'VitaMax', 'Tosidol', 'Galletas Marisol', 'Choco-Rico', 'Frijolitos', 'Jabón Rosa', 'Detergente Ola', 'Arroz Güero', 'Atún Delmar', 'Sopa Nena', 'Café Molido', 'Cereal Sol', 'Papel Suave', 'Salsa Brava', 'Chiles Doña', 'Aceite Oro', 'Harina Mía', 'Té Manzanilla', 'Leche Vaquita', 'Pañales Bebé', 'Suero Oral', 'Crema Lulú', 'Shampoo Brillo', 'Pasta Dent', 'Mazapán', 'Chicles Tuti', 'Cloro Blanco', 'Fibrax', 'Antiácido'];
function packAtlas() {
  return ftex('tb-pack', 1024, 512, (c, w, h) => {
    const R = rng(31), cw = w / 8, ch = h / 4;
    const pal = ['#d8342c', '#f2c230', '#2a6ad8', '#2fa860', '#f08a2a', '#8a3ab8', '#f2f0ea', '#1a8a9a', '#e86fb0', '#6a4a2a'];
    for (let i = 0; i < 32; i++) {
      const x = (i % 8) * cw, y = (i / 8 | 0) * ch, a = pal[(R() * pal.length) | 0], b = pal[(R() * pal.length) | 0];
      c.fillStyle = a; c.fillRect(x, y, cw, ch);
      c.fillStyle = b; c.fillRect(x, y + ch * 0.62, cw, ch * 0.38);
      c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.ellipse(x + cw / 2, y + ch * 0.4, cw * 0.4, ch * 0.18, 0, 0, TAU); c.fill();
      c.fillStyle = '#1a1a1a'; fitFont(c, BRANDS[i], '800 #px Rubik, system-ui', 22, cw * 0.72); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(BRANDS[i], x + cw / 2, y + ch * 0.4);
      c.fillStyle = 'rgba(255,255,255,0.9)'; c.font = '600 13px Rubik, system-ui'; c.fillText(['500 mg', '1 kg', '12 pz', '250 g', 'NUEVO', '2x1'][i % 6], x + cw / 2, y + ch * 0.8);
      c.fillStyle = 'rgba(0,0,0,0.2)'; c.fillRect(x, y, 3, ch);
    }
  });
}
const SODAS = [['Chiva Cola', '#b8141c', '#f2f0ea'], ['Naranjita', '#f08a1a', '#1a5a2a'], ['Limonada Sol', '#3ab84a', '#f2f2a0'], ['Uva Loca', '#6a2a9a', '#f2c230'], ['Toronja Brava', '#e8588a', '#ffffff'], ['Agua Pura', '#2a8ad8', '#ffffff'], ['Manzanita', '#c8282a', '#f2e8a0'], ['Tamarindo', '#7a4a1a', '#f2c230']];
function sodaAtlas() {
  return ftex('tb-soda', 512, 256, (c, w, h) => {
    const cw = w / 4, ch = h / 2;
    SODAS.forEach(([n, bg, fg], i) => {
      const x = (i % 4) * cw, y = (i / 4 | 0) * ch;
      c.fillStyle = bg; c.fillRect(x, y, cw, ch);
      c.fillStyle = fg; c.fillRect(x, y + ch * 0.12, cw, 6); c.fillRect(x, y + ch * 0.84, cw, 6);
      c.save(); c.translate(x + cw / 2, y + ch / 2); c.rotate(-0.12);
      brushText(c, n, 0, 0, { font: 'bold #px Lobster, Rubik, system-ui', px: 34, maxW: cw * 0.9, fill: fg, rough: 0 }); c.restore();
    });
  });
}

// =====================================================================================
// Materiales compartidos
// =====================================================================================
let M = null;
const DS = THREE.DoubleSide;
function mats() {
  if (M) return M;
  lazyTX();
  M = {
    concrete: mat(0xffffff, { map: TX.concrete, roughness: 0.92 }),
    concreteDark: mat(0x9a968e, { map: TX.concrete, roughness: 0.95 }),
    shopFloor: mat(0xffffff, { map: TX.shopFloor, roughness: 0.75, env: true, envI: 0.25 }),
    block: mat(0xffffff, { map: TX.block, roughness: 0.95 }),
    brick: mat(0xffffff, { map: TX.brick, roughness: 0.9 }),
    roofRed: mat(0xffffff, { map: TX.roofRed, roughness: 0.95 }),
    curtain: mat(0xffffff, { map: TX.corrugated, roughness: 0.45, metalness: 0.55, env: true, envI: 0.5 }),
    lamina: mat(0xffffff, { map: TX.lamina, roughness: 0.5, metalness: 0.5, env: true, envI: 0.5, side: DS }),
    laminaClear: mat(0xf2ecd0, { roughness: 0.4, transparent: true, opacity: 0.55, side: DS, emissive: 0xfff4d0, emissiveIntensity: 0.35 }),
    tileCream: mat(0xffffff, { map: TX.tileCream, roughness: 0.3, env: true, envI: 0.35 }),
    terrazzo: mat(0xffffff, { map: TX.terrazzo, roughness: 0.25, env: true, envI: 0.35 }),
    checker: mat(0xffffff, { map: TX.checker, roughness: 0.2, env: true, envI: 0.4 }),
    rubberFloor: mat(0xffffff, { map: TX.rubber, roughness: 0.95 }),
    carpet: mat(0xffffff, { map: TX.arcadeCarpet, roughness: 1, emissive: 0xffffff, emissiveMap: TX.arcadeCarpet, emissiveIntensity: 0.35 }),
    planks: mat(0xffffff, { map: TX.wood, roughness: 0.6 }),
    herreria: mat(0x1e1e1e, { map: TX.herreria, alphaTest: 0.5, side: DS, roughness: 0.5, metalness: 0.4 }),
    herreriaW: mat(0xeeeee6, { map: TX.herreria, alphaTest: 0.5, side: DS, roughness: 0.5 }),
    reja: mat(0x2c2c2c, { map: TX.reja, alphaTest: 0.5, side: DS, roughness: 0.55, metalness: 0.5 }),
    papel: mat(0xffffff, { map: TX.papel, alphaTest: 0.5, side: DS, roughness: 0.9 }),
    talavera: mat(0xffffff, { map: TX.talavera, roughness: 0.25, env: true, envI: 0.4 }),
    azulejo: mat(0xffffff, { map: TX.azulejo, roughness: 0.2, env: true, envI: 0.5 }),
    pegboard: mat(0xffffff, { map: TX.pegboard, roughness: 0.85 }),
    cloth: mat(0xffffff, { map: TX.cloth, roughness: 1, side: DS }),
    frame: metal(0x2b2d30, 0.45),
    alum: metal(0xb9bec3, 0.3),
    steel: C.steel(), chrome: C.chrome(), iron: C.iron(), rust: C.rust(),
    black: plastic(0x161616), white: mat(0xf2f2ee, { roughness: 0.5 }), rubber: C.rubber(),
    glass: glass(0xcfe6ee, 0.2),
    glassDark: mat(0x1b2a33, { roughness: 0.06, metalness: 0.3, transparent: true, opacity: 0.55, env: true, envI: 1.2, depthWrite: false }),
    mirror: metal(0xe6ecef, 0.03, { envI: 1.3 }),
    wood: C.wood(0x8a5a32), darkWood: C.darkWood(), ply: C.wood(0xc8a070),
    tube: emissive(0xf4fbff, 2.4), bulb: emissive(0xffe2a0, 3), warm: emissive(0xffc870, 2),
    cable: mat(0x121212, { roughness: 0.6 }),
    ceiling: mat(0xf2efe8, { roughness: 0.95 }),
    pvc: mat(0xe8e6e0, { roughness: 0.5 }), pvcGrey: mat(0x9a9c9a, { roughness: 0.5 }), cpvc: mat(0xd8a050, { roughness: 0.45 }),
    tinaco: mat(0x1c1c1c, { roughness: 0.5, env: true, envI: 0.3 }), tinacoNew: mat(0xd8cba8, { roughness: 0.5, env: true, envI: 0.3 }),
    bottleGreen: mat(0x2f8a3a, { roughness: 0.2, transparent: true, opacity: 0.75, env: true, envI: 0.8 }),
    bottleClear: mat(0xd8eef2, { roughness: 0.1, transparent: true, opacity: 0.5, env: true, envI: 1 }),
    red: plastic(0xc8281e), yellow: plastic(0xf2c230), blue: plastic(0x2a5ab8), green: plastic(0x2f9a4a), orange: plastic(0xf07a1a),
    soil: mat(0x4a3424, { roughness: 1 }),
    pack: null, soda: null,
  };
  M.pack = mat(0xffffff, { map: packAtlas(), roughness: 0.55 });
  M.soda = mat(0xffffff, { map: sodaAtlas(), roughness: 0.3, env: true, envI: 0.5 });
  return M;
}
const paint = (c, r = 0.8) => mat(c, { roughness: r });
const texM = (tex, o = {}) => mat(0xffffff, { map: tex, roughness: 0.8, ...o });
const glowM = (tex, i = 1, o = {}) => mat(0xffffff, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: i, roughness: 0.4, ...o });

// =====================================================================================
// Accesorios de arquitectura (tinaco, varillas, antena, tendedero, cables, etc.)
// =====================================================================================
function tinaco(K, x, y, z, m, s = 1) {
  const pts = [[0, 0], [0.5, 0], [0.54, 0.04], [0.55, 0.12]];
  for (let i = 0; i < 5; i++) { const y0 = 0.16 + i * 0.2; pts.push([0.55, y0], [0.57, y0 + 0.05], [0.55, y0 + 0.1]); }
  pts.push([0.55, 1.12], [0.5, 1.2], [0.3, 1.24], [0.29, 1.28]);
  K.lathe(m, pts.map(([a, b]) => [a * s, b * s]), x, y, z, 32);
  K.lathe(m, [[0, 1.34], [0.2, 1.33], [0.3, 1.3], [0.31, 1.27], [0.28, 1.27]].map(([a, b]) => [a * s, b * s]), x, y, z, 24);
  // tuberías de salida y flotador
  const mm = mats();
  K.cyl(mm.pvcGrey, 0.03, 0.03, 0.5, x + 0.45 * s, y + 0.2, z, 0, 0, PI / 2, 8);
  K.tube(mm.cpvc, [[x + 0.7 * s, y + 0.2, z], [x + 0.8 * s, y + 0.1, z], [x + 0.8 * s, y - 0.25, z + 0.1]], 0.018, 8, 6);
}
function tinacoBase(K, x, y, z, h = 0.5) {
  const mm = mats();
  for (const [a, b] of [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]]) K.wbox(mm.block, 0.2, h, 0.2, x + a, y + h / 2, z + b, 2);
  K.box(mm.iron, 1.25, 0.06, 1.25, x, y + h + 0.03, z);
}
// varillas de castillo que asoman (con botellas de plástico en algunas puntas)
function rebar(K, x, y, z, R, h = 0.7, bottles = true) {
  const mm = mats();
  K.wbox(mm.concreteDark, 0.24, 0.25, 0.24, x, y + 0.125, z, 2);
  for (const [a, b] of [[-0.06, -0.06], [0.06, -0.06], [-0.06, 0.06], [0.06, 0.06]]) {
    const hh = h * (0.75 + R() * 0.5), bx = (R() - 0.5) * 0.12, bz = (R() - 0.5) * 0.12;
    K.tube(mm.rust, [[x + a, y + 0.2, z + b], [x + a, y + hh * 0.6, z + b], [x + a + bx, y + hh, z + b + bz]], 0.0065, 6, 5);
    if (bottles && R() < 0.35) K.lathe(R() < 0.5 ? mm.bottleGreen : mm.bottleClear, [[0, 0.24], [0.035, 0.22], [0.035, 0.08], [0.012, 0.03], [0.012, 0]], x + a + bx, y + hh - 0.04, z + b + bz, 10, PI);
  }
  for (let i = 0; i < 2; i++) K.tor(mm.rust, 0.085, 0.004, x, y + 0.35 + i * 0.18, z, PI / 2, 0, PI / 4, TAU, 4, 3);
}
function satDish(K, x, y, z, ry) {
  const mm = mats(), s = K.sub(x, y, z, 0, ry);
  s.cyl(mm.steel, 0.022, 0.022, 0.8, 0, 0.4, 0, 0, 0, 0, 8);
  const dish = s.sub(0, 0.85, 0.06, -0.55, 0, 0);
  dish.lathe(mm.white, [[0, 0], [0.12, 0.012], [0.24, 0.05], [0.32, 0.09], [0.33, 0.1]], 0, 0, 0, 24, PI / 2);
  dish.tube(mm.steel, [[0, -0.3, 0.02], [0, -0.25, 0.25], [0, 0, 0.42]], 0.01, 8, 5);
  dish.rbox(mm.black, 0.06, 0.08, 0.1, 0.015, 0, 0, 0.44);
}
function antenna(K, x, y, z, ry) {
  const mm = mats(), s = K.sub(x, y, z, 0, ry);
  s.cyl(mm.alum, 0.015, 0.015, 2.2, 0, 1.1, 0, 0, 0, 0, 6);
  for (let i = 0; i < 6; i++) s.cyl(mm.alum, 0.006, 0.006, 0.9 - i * 0.11, 0, 1.6 + i * 0.1, 0.25 - i * 0.1, 0, 0, PI / 2, 5);
  s.cyl(mm.alum, 0.008, 0.008, 0.7, 0, 1.62, 0, PI / 2, 0, 0, 5);
  for (const a of [0, 2.1, 4.2]) s.tube(mm.cable, [[0, 1.3, 0], [Math.cos(a) * 0.8, 0.02, Math.sin(a) * 0.8]], 0.003, 2, 3);
}
function gasTank(K, x, y, z, col = 0xd8d8d0) {
  const m = paint(col, 0.5), mm = mats();
  K.lathe(m, [[0, 0], [0.16, 0], [0.18, 0.04], [0.18, 1.0], [0.15, 1.12], [0.06, 1.17], [0, 1.17]], x, y, z, 20);
  K.tor(m, 0.12, 0.018, x, y + 1.28, z, PI / 2, 0, 0, TAU, 16, 6);
  for (const a of [0, PI]) K.box(m, 0.02, 0.12, 0.03, x + Math.cos(a) * 0.12, y + 1.22, z);
  K.cyl(mm.brassy ?? C.brass(), 0.02, 0.02, 0.08, x, y + 1.21, z, 0, 0, 0, 8);
  K.tube(mm.cable, [[x, y + 1.24, z], [x + 0.1, y + 1.3, z + 0.1], [x + 0.3, y + 1.0, z + 0.25], [x + 0.35, y + 0.2, z + 0.3]], 0.008, 12, 5);
}
function boiler(K, x, y, z) {
  const mm = mats();
  K.cyl(mm.white, 0.24, 0.24, 1.05, x, y + 0.6, z, 0, 0, 0, 20);
  K.cyl(mm.white, 0.25, 0.25, 0.04, x, y + 1.12, z, 0, 0, 0, 20);
  K.cyl(mm.steel, 0.06, 0.06, 0.8, x, y + 1.5, z, 0, 0, 0, 10);
  K.cone(mm.steel, 0.12, 0.1, x, y + 1.95, z, 0, 0, 0, 10);
  for (const a of [0, 2.1, 4.2]) K.cyl(mm.iron, 0.015, 0.015, 0.12, x + Math.cos(a) * 0.18, y + 0.06, z + Math.sin(a) * 0.18, 0, 0, 0, 5);
  K.rbox(mm.black, 0.12, 0.1, 0.06, 0.02, x, y + 0.35, z + 0.25);
  K.tube(mm.cpvc, [[x + 0.2, y + 0.3, z], [x + 0.5, y + 0.3, z], [x + 0.5, y + 0.05, z]], 0.015, 6, 5);
}
// tendedero con ropa colgada
function clothesLine(K, x, z, y, len, ry, R) {
  const mm = mats(), s = K.sub(x, y, z, 0, ry);
  for (const e of [-len / 2, len / 2]) { s.cyl(mm.steel, 0.025, 0.025, 1.8, e, 0.9, 0, 0, 0, 0, 8); s.cyl(mm.steel, 0.015, 0.015, 0.9, e, 1.75, 0, PI / 2, 0, 0, 6); }
  for (const zz of [-0.35, 0, 0.35]) s.wire(mm.cable, [-len / 2, 1.75, zz], [len / 2, 1.75, zz], 0.06, 0.004, 8);
  const shirt = [[-0.25, 0], [0.25, 0], [0.25, 0.4], [0.4, 0.34], [0.46, 0.5], [0.18, 0.62], [0.07, 0.56], [-0.07, 0.56], [-0.18, 0.62], [-0.46, 0.5], [-0.4, 0.34], [-0.25, 0.4]];
  const pants = [[-0.22, 0], [-0.05, 0], [0, 0.45], [0.05, 0], [0.22, 0], [0.2, 0.72], [-0.2, 0.72]];
  for (const zz of [-0.35, 0, 0.35]) {
    let xx = -len / 2 + 0.3;
    while (xx < len / 2 - 0.4) {
      const kind = R(), cell = (R() * 8) | 0;
      if (kind < 0.4) { const g = new THREE.ExtrudeGeometry(new THREE.Shape(shirt.map(([a, b]) => new THREE.Vector2(a, b))), { depth: 0.01, bevelEnabled: false }); cellUV(g, cell, 8, 1); s.geo(mm.cloth, g, xx + 0.25, 1.75 - 0.62, zz, 0, 0, 0, 0.8); xx += 0.55; }
      else if (kind < 0.65) { const g = new THREE.ExtrudeGeometry(new THREE.Shape(pants.map(([a, b]) => new THREE.Vector2(a, b))), { depth: 0.01, bevelEnabled: false }); cellUV(g, cell, 8, 1); s.geo(mm.cloth, g, xx + 0.2, 1.75 - 0.72, zz); xx += 0.5; }
      else { const w = 0.35 + R() * 0.4, h = 0.4 + R() * 0.4; const g = new THREE.PlaneGeometry(w, h, 4, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 9) * 0.02); g.computeVertexNormals(); cellUV(g, cell, 8, 1); s.geo(mm.cloth, g, xx + w / 2, 1.75 - h / 2, zz); xx += w + 0.08; }
      for (const px of [xx - 0.3, xx - 0.05]) s.box(R() < 0.5 ? mm.red : mm.blue, 0.012, 0.06, 0.02, px, 1.75, zz);
      xx += 0.05 + R() * 0.2;
    }
  }
}
// poste de luz de concreto con cables al edificio
function lightPole(K, g, cols, x, z, targets) {
  const mm = mats();
  K.lathe(mm.concrete, [[0, 0], [0.17, 0], [0.16, 0.2], [0.1, 7.4], [0, 7.45]], x, 0, z, 12);
  K.box(mm.wood, 1.4, 0.1, 0.1, x, 6.9, z);
  for (const a of [-0.6, -0.2, 0.2, 0.6]) { K.cyl(mm.white, 0.03, 0.04, 0.12, x + a, 7.0, z, 0, 0, 0, 8); }
  // lámpara de calle
  K.tube(mm.steel, [[x, 6.2, z], [x - 0.2, 6.6, z], [x - 0.8, 6.8, z], [x - 1.4, 6.75, z]], 0.035, 12, 6);
  K.rbox(mm.steel, 0.55, 0.12, 0.26, 0.05, x - 1.55, 6.72, z);
  K.box(mats().white, 0.44, 0.02, 0.18, x - 1.55, 6.65, z);
  // transformador
  K.cyl(paint(0x6a7a70, 0.5), 0.26, 0.26, 0.75, x + 0.34, 5.6, z, 0, 0, 0, 16);
  K.cyl(paint(0x6a7a70, 0.5), 0.28, 0.28, 0.05, x + 0.34, 6.0, z, 0, 0, 0, 16);
  for (const a of [-0.1, 0.1]) K.cyl(mm.white, 0.03, 0.03, 0.14, x + 0.34 + a, 6.08, z, 0, 0, 0, 6);
  K.box(mm.iron, 0.1, 0.5, 0.06, x + 0.12, 5.6, z);
  for (const t of targets) K.wire(mm.cable, [x + t[3], 6.95, z], t, 0.35, 0.009, 14);
  colBox(g, cols, 0.36, 3, 0.36, x, 1.5, z);
}
// maceta de talavera o barro con planta
function planter(g, K, x, y, z, s, seed, kind = 'leafy', potKind = 'talavera') {
  const mm = mats();
  const prof = potKind === 'talavera' ? [[0, 0], [0.14, 0], [0.16, 0.04], [0.2, 0.2], [0.23, 0.36], [0.25, 0.38], [0.24, 0.41], [0.2, 0.4], [0, 0.36]] : [[0, 0], [0.15, 0], [0.19, 0.32], [0.22, 0.34], [0.21, 0.37], [0.18, 0.36], [0, 0.33]];
  K.lathe(potKind === 'talavera' ? mm.talavera : paint(0xb0603a, 0.85), prof.map(([a, b]) => [a * s, b * s]), x, y, z, 20);
  K.cyl(mm.soil, 0.2 * s, 0.2 * s, 0.02, x, y + 0.36 * s, z, 0, 0, 0, 14);
  let p;
  if (kind === 'cactus') p = cactusMesh(s * 1.3, 'column', seed);
  else if (kind === 'barrel') p = cactusMesh(s * 1.4, 'barrel', seed);
  else if (kind === 'agave') p = agaveMesh(s * 0.7);
  else p = leafyPlant(s * 1.2, seed);
  p.position.set(x, y + 0.36 * s, z); g.add(p);
}
// tubo fluorescente tipo gabinete
function fluo(K, x, y, z, len = 1.22, ry = 0) {
  const mm = mats(), s = K.sub(x, y, z, 0, ry);
  s.rbox(mm.white, len + 0.06, 0.06, 0.24, 0.015, 0, 0.03, 0);
  for (const a of [-0.055, 0.055]) s.cyl(mm.tube, 0.016, 0.016, len, 0, -0.012, a, 0, 0, PI / 2, 8);
}
function bareBulb(K, x, y, z, drop = 0.5) {
  const mm = mats();
  K.cyl(mm.cable, 0.004, 0.004, drop, x, y - drop / 2, z, 0, 0, 0, 4);
  K.cyl(mm.black, 0.022, 0.022, 0.05, x, y - drop - 0.02, z, 0, 0, 0, 8);
  K.sph(mm.bulb, 0.045, x, y - drop - 0.08, z, 1, 1.2, 1, 10);
}
function sconce(K, x, y, z) {
  const mm = mats();
  K.rbox(mm.iron, 0.12, 0.2, 0.05, 0.02, x, y, z + 0.025);
  K.tube(mm.iron, [[x, y + 0.05, z + 0.03], [x, y + 0.12, z + 0.2], [x, y + 0.08, z + 0.3]], 0.012, 8, 5);
  K.cone(mm.iron, 0.12, 0.12, x, y + 0.06, z + 0.32, 0, 0, 0, 12, true);
  K.sph(mm.bulb, 0.05, x, y + 0.0, z + 0.32, 1, 1, 1, 10);
}
// silla y mesa de plástico (de refresquera)
function plasticChair(K, x, z, ry, m) {
  const s = K.sub(x, 0, z, 0, ry);
  s.rbox(m, 0.44, 0.04, 0.42, 0.015, 0, 0.44, 0);
  s.rbox(m, 0.44, 0.42, 0.035, 0.015, 0, 0.7, -0.2, -0.12);
  for (const [a, b] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) s.cyl(m, 0.022, 0.03, 0.44, a, 0.22, b, b * 0.2, 0, -a * 0.2, 8);
  for (const a of [-0.2, 0.2]) s.rbox(m, 0.03, 0.03, 0.36, 0.01, a, 0.62, 0);
}
function plasticTable(K, x, z, m, logoTex) {
  const s = K.sub(x, 0, z);
  s.rbox(m, 0.8, 0.04, 0.8, 0.02, 0, 0.72, 0);
  for (const [a, b] of [[-0.34, -0.34], [0.34, -0.34], [-0.34, 0.34], [0.34, 0.34]]) s.cyl(m, 0.025, 0.035, 0.72, a, 0.36, b, b * 0.1, 0, -a * 0.1, 8);
  if (logoTex) s.plane(texM(logoTex, { roughness: 0.4, transparent: true }), 0.5, 0.5, 0, 0.742, 0, -PI / 2);
}
// triciclo de reparto con canasta
function triciclo(K, x, z, ry, basketM) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry);
  const wheel = (px, pz) => { s.tor(mm.rubber, 0.3, 0.025, px, 0.32, pz, 0, 0, 0, TAU, 24, 6); s.tor(mm.steel, 0.28, 0.008, px, 0.32, pz, 0, 0, 0, TAU, 20, 4); for (let i = 0; i < 8; i++) s.cyl(mm.steel, 0.003, 0.003, 0.56, px, 0.32, pz, 0, 0, i * PI / 8, 3); s.cyl(mm.steel, 0.02, 0.02, 0.06, px, 0.32, pz, PI / 2, 0, 0, 6); };
  wheel(-0.7, -0.42); wheel(-0.7, 0.42); wheel(0.75, 0);
  s.box(basketM, 0.9, 0.5, 0.92, -0.7, 0.85, 0);
  s.box(mm.steel, 0.95, 0.03, 0.97, -0.7, 0.6, 0);
  s.tube(paint(0x2a5ab8, 0.4), [[-0.25, 0.62, 0], [0.2, 0.62, 0], [0.45, 0.95, 0], [0.75, 0.32, 0]], 0.022, 14, 6);
  s.tube(paint(0x2a5ab8, 0.4), [[0.2, 0.62, 0], [0.25, 1.0, 0]], 0.022, 4, 6);
  s.rbox(mm.black, 0.24, 0.06, 0.16, 0.03, 0.25, 1.03, 0);
  s.tube(paint(0x2a5ab8, 0.4), [[0.6, 0.7, 0], [0.62, 1.05, 0]], 0.02, 4, 6);
  s.tube(mm.steel, [[0.62, 1.05, -0.28], [0.58, 1.08, 0], [0.62, 1.05, 0.28]], 0.013, 8, 6);
  for (const a of [-0.28, 0.28]) s.cyl(mm.black, 0.018, 0.018, 0.1, 0.62, 1.05, a, PI / 2, 0, 0, 6);
}
// caballete (A-frame) con letrero a mano
function aFrame(K, g, cols, x, z, ry, tex) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry);
  const face = texM(tex, { roughness: 0.7 });
  for (const sg of [-1, 1]) {
    const p = s.sub(0, 0, sg * 0.2, -sg * 0.2);
    p.rbox(mm.wood, 0.62, 0.95, 0.03, 0.01, 0, 0.47, 0);
    p.plane(face, 0.54, 0.8, 0, 0.5, sg * 0.017, 0, sg > 0 ? 0 : PI);
  }
  s.box(mm.steel, 0.01, 0.01, 0.4, 0.28, 0.5, 0);
  colBox(g, cols, 0.66, 0.9, 0.5, x, 0.45, z, ry);
}

// =====================================================================================
// Casco del edificio: fachada pintada con vanos, muros, losa, azotea y accesorios por nivel
// =====================================================================================
const FB = 0.15, FZ = -2, BZ = -12.5, HW = 5.8, FT = 0.25;
const WEAR = [1, 0.3, 0.05];
function uvPlaneH(w, d, s = 1) {
  const g = new THREE.PlaneGeometry(w, d), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * s, uv.getY(i) * d * s);
  g.rotateX(-PI / 2);
  return g;
}
// contorno de fachada: los vanos a nivel de piso son muescas del contorno; los demás, huecos
function facadeShape(W, H, holes) {
  const sh = new THREE.Shape();
  sh.moveTo(-W / 2, 0);
  const ground = holes.filter(h => h.y0 <= 0.001).sort((a, b) => a.x0 - b.x0);
  for (const h of ground) {
    sh.lineTo(h.x0, 0);
    if (h.arch) { const r = (h.x1 - h.x0) / 2, ya = h.y1 - r; sh.lineTo(h.x0, ya); for (let i = 1; i < 16; i++) { const a = PI - PI * i / 16; sh.lineTo((h.x0 + h.x1) / 2 + Math.cos(a) * r, ya + Math.sin(a) * r); } sh.lineTo(h.x1, ya); }
    else { sh.lineTo(h.x0, h.y1); sh.lineTo(h.x1, h.y1); }
    sh.lineTo(h.x1, 0);
  }
  sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(-W / 2, H); sh.closePath();
  for (const h of holes.filter(h => h.y0 > 0.001)) {
    const p = new THREE.Path(); p.moveTo(h.x0, h.y0); p.lineTo(h.x1, h.y0);
    if (h.arch) { const r = (h.x1 - h.x0) / 2, ya = h.y1 - r; p.lineTo(h.x1, ya); for (let i = 1; i < 16; i++) { const a = PI * i / 16; p.lineTo((h.x0 + h.x1) / 2 + Math.cos(a) * r, ya + Math.sin(a) * r); } p.lineTo(h.x0, ya); }
    else { p.lineTo(h.x1, h.y1); p.lineTo(h.x0, h.y1); }
    p.closePath(); sh.holes.push(p);
  }
  return sh;
}
function shell(ctx, o) {
  const { g, K, cols, lvl, R, kind } = ctx, mm = mats();
  const st = o.storeys ?? 1, H1 = o.H1 ?? 3.6, H2 = o.H2 ?? 2.9;
  const roofY = st === 2 ? H1 + 0.2 + H2 + 0.2 : H1 + 0.2;
  const Htop = roofY + (o.par ?? 0.85);
  const W = HW * 2 + 0.1, wear = WEAR[lvl - 1];
  const paintC = lvl === 1 ? (o.paint1 ?? o.paint) : o.paint;
  const open = o.openings, up = o.upWin ?? [], all = [...open, ...up];
  const info = { H1, roofY, Htop, st, W };
  Object.assign(ctx, info);
  // ---------- textura de fachada pintada a mano ----------
  const PPM = 130;
  const ftx = ftex(`tb-fac-${kind}-${lvl}`, Math.round(W * PPM), Math.round(Htop * PPM), (c) => {
    const Rr = rng(kind + ':' + lvl), F = wallPainter(c, W, Htop, PPM, Rr);
    F.rect(-W / 2, 0, W / 2, Htop, paintC); F.texture(0.5 + wear);
    if (o.band) F.band(-W / 2, 0, W / 2, o.bandH ?? 0.85, lvl === 1 ? (o.band1 ?? o.band) : o.band);
    for (const [y0, y1, col] of o.stripes ?? []) F.band(-W / 2, y0, W / 2, y1, col, 0.01);
    if (st === 2) F.band(-W / 2, H1 - 0.02, W / 2, H1 + 0.24, o.trim);
    F.band(-W / 2, Htop - 0.2, W / 2, Htop, o.trim);
    for (const h of all) { const t = 0.09; if (!h.arch) F.rect(h.x0 - t, Math.max(0, h.y0 - t), h.x1 + t, h.y1 + t, o.trim); else { c.fillStyle = o.trim; const r = (h.x1 - h.x0) / 2 + t, cx = (h.x0 + h.x1) / 2, ya = h.y1 - r + t; c.beginPath(); c.moveTo(F.X(h.x0 - t), F.Y(Math.max(0, h.y0 - t))); c.lineTo(F.X(h.x0 - t), F.Y(ya)); c.arc(F.X(cx), F.Y(ya), F.S(r), PI, 0); c.lineTo(F.X(h.x1 + t), F.Y(Math.max(0, h.y0 - t))); c.fill(); } }
    o.art?.(F, lvl);
    F.grime(wear, [Htop - 0.2, ...all.filter(h => h.y0 > 0.1).map(h => h.y0 - 0.09)]);
    if (lvl === 1) {
      F.cracks(16); F.peel(10, Rr() < 0.5 ? 'brick' : 'plaster', null, Math.min(Htop, 4)); F.tags(5);
      const xs = []; for (let x = -5.3; x <= 5.3; x += 0.25) if (!open.some(h => x > h.x0 - 0.5 && x < h.x1 + 0.5)) xs.push(x);
      const posters = [['SE RENTA CUARTO', 'Informes aquí', '#f2f0e0'], ['LUCHA LIBRE', 'Domingo 5 pm', '#f2c230'], ['CLASES DE GUITARRA', '55 2468 1357', '#ffffff'], ['SE BUSCA PERRITO', 'Recompensa', '#e8f0ff'], ['BAILE SONIDERO', 'Sábado', '#f28ac0']];
      for (let i = 0; i < 3 && xs.length; i++) { const x = xs[(Rr() * xs.length) | 0], p = posters[(Rr() * posters.length) | 0]; F.poster(x, 1.5 + Rr() * 0.4, 0.42, 0.56, p[2], [[p[0], '#1a1a1a', 0.07], [p[1], '#b8141c', 0.05]], i + 3); }
    } else if (lvl === 2) { F.cracks(2); }
  });
  const facM = mat(0xffffff, { map: ftx, roughness: 0.88 });
  const fg = new THREE.ExtrudeGeometry(facadeShape(W, Htop, all), { depth: FT, bevelEnabled: false, curveSegments: 16 });
  fg.translate(0, 0, FZ - FT);
  projUV(fg, (x) => (x + W / 2) / W, (x, y) => y / Htop);
  K.geo(facM, fg);
  // ---------- muros laterales (pintados o de block) y fondo ----------
  const L = FZ - FT - BZ, Hs = roofY + 0.5;
  const stx = ftex(`tb-side-${kind}-${lvl}`, 1024, Math.round(1024 * Hs / L), (c) => {
    const Rr = rng(kind + 'side' + lvl), F = wallPainter(c, L, Hs, 1024 / L, Rr);
    if (lvl === 1 && !o.sidePainted) { c.fillStyle = '#8a877f'; c.fillRect(0, 0, c.canvas.width, c.canvas.height); const bw = F.S(0.4), bh = F.S(0.2); for (let r = 0; r * bh < c.canvas.height; r++) for (let x = (r % 2 ? -bw / 2 : 0); x < c.canvas.width; x += bw) { c.fillStyle = shadeC(0xa7a399, 0.82 + Rr() * 0.25); c.fillRect(x + 1.5, r * bh + 1.5, bw - 3, bh - 3); } F.texture(0.8); }
    else { F.rect(-L / 2, 0, L / 2, Hs, o.sidePaint ?? paintC); F.texture(0.5 + wear); if (o.band) F.band(-L / 2, 0, L / 2, o.bandH ?? 0.85, o.band); }
    o.sideArt?.(F, lvl);
    F.grime(wear * 0.8, [Hs - 0.05]);
    if (lvl === 1) { F.cracks(8); F.tags(3); }
  });
  const sideM = mat(0xffffff, { map: stx, roughness: 0.9 });
  for (const sgn of [-1, 1]) {
    const sg = new THREE.BoxGeometry(0.2, Hs, L); sg.translate(sgn * (HW - 0.1), Hs / 2, (FZ - FT + BZ) / 2);
    projUV(sg, (x, y, z) => sgn > 0 ? (FZ - FT - z) / L : (z - BZ) / L, (x, y) => y / Hs);
    K.geo(sideM, sg);
  }
  K.wbox(mm.block, W - 0.1, Hs, 0.2, 0, Hs / 2, BZ + 0.1, 0.5);
  for (const sgn of [-1, 1]) K.box(mm.concrete, 0.3, 0.06, L + 0.1, sgn * (HW - 0.1), Hs + 0.03, (FZ - FT + BZ) / 2);
  K.box(mm.concrete, W, 0.06, 0.3, 0, Hs + 0.03, BZ + 0.1);
  // pretil frontal: remate y cornisa
  const trimM = paint(o.trim, 0.6);
  K.rbox(trimM, W + 0.12, 0.09, FT + 0.14, 0.02, 0, Htop + 0.045, FZ - FT / 2 + 0.03);
  if (lvl === 3) {
    const prof = [[0, 0], [0.06, 0], [0.06, 0.04], [0.1, 0.08], [0.14, 0.1], [0.14, 0.16], [0, 0.16]];
    K.ext(trimM, prof, W + 0.1, 0, Htop - 0.36, FZ - 0.001, 0, -PI / 2, 0);
    if (st === 2) K.ext(trimM, prof.map(([a, b]) => [a * 0.8, b * 0.9]), W + 0.1, 0, H1 + 0.12, FZ - 0.001, 0, -PI / 2, 0);
  }
  // ---------- losas y azotea ----------
  K.wbox(mm.concrete, W - 0.1, FB, BZ - FZ - 0.3 < 0 ? FZ + 0.35 - BZ : 10, 0, FB / 2, (BZ + FZ + 0.35) / 2, 0.5);
  const slabs = st === 2 ? [H1, H1 + 0.2 + H2] : [H1];
  for (const y of slabs) K.wbox(mm.concrete, W - 0.3, 0.2, L, 0, y + 0.1, (FZ - FT + BZ) / 2, 0.5);
  K.geo(mm.roofRed, uvPlaneH(W - 0.4, L - 0.2, 0.5), 0, roofY + 0.004, (FZ - FT + BZ) / 2);
  // piso interior, plafón y muros interiores
  const inW = W - 0.5, inD = L - 0.2, inZ = (FZ - FT + BZ + 0.2) / 2;
  K.geo(o.floorM ?? mm.tileCream, uvPlaneH(inW, inD, o.floorS ?? 1 / 0.6), 0, FB + 0.004, inZ);
  const ceilM = o.ceilM ?? mm.ceiling;
  K.plane(ceilM, inW, inD, 0, H1 - 0.002, inZ, PI / 2);
  const inWallM = paint(o.inWall ?? 0xf0ebe0, 0.9), hin = (o.upperInterior ? roofY - 0.2 : H1) - FB;
  K.plane(inWallM, inD, hin, -HW + 0.205, FB + hin / 2, inZ, 0, PI / 2);
  K.plane(inWallM, inD, hin, HW - 0.205, FB + hin / 2, inZ, 0, -PI / 2);
  K.plane(inWallM, inW, hin, 0, FB + hin / 2, BZ + 0.205, 0);
  if (o.wainscot) {
    const wm = o.wainscot, wh = o.wainscotH ?? 1.2;
    const wg = (w) => { const gg = new THREE.PlaneGeometry(w, wh); const uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.2, uv.getY(i) * wh / 0.2); return gg; };
    K.geo(wm, wg(inD), -HW + 0.21, FB + wh / 2, inZ, 0, PI / 2); K.geo(wm, wg(inD), HW - 0.21, FB + wh / 2, inZ, 0, -PI / 2); K.geo(wm, wg(inW), 0, FB + wh / 2, BZ + 0.21, 0);
  }
  if (st === 2 && !o.upperInterior) {
    // cuartos de arriba: fondo oscuro y cortinas detrás de cada ventana
    for (const h of up) {
      const cw = h.x1 - h.x0, ch = h.y1 - h.y0, cx = (h.x0 + h.x1) / 2, cy = (h.y0 + h.y1) / 2;
      K.plane(paint(0x2a2622, 1), cw + 0.4, ch + 0.4, cx, cy, FZ - FT - 0.9);
      for (const sgn of [-1, 1]) { const gg = new THREE.PlaneGeometry(cw * 0.34, ch, 8, 1), p = gg.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 40) * 0.025); gg.computeVertexNormals(); cellUV(gg, (kind.length + (sgn > 0 ? 1 : 3)) % 8, 8, 1); K.geo(mm.cloth, gg, cx + sgn * cw * 0.33, cy, FZ - FT - 0.1); }
    }
  } else if (o.upperInterior) {
    K.geo(o.upFloorM ?? mm.tileCream, uvPlaneH(inW, inD, 1 / 0.6), 0, H1 + 0.204, inZ);
    K.plane(ceilM, inW, inD, 0, roofY - 0.202, inZ, PI / 2);
  }
  // ---------- vanos: cancelería, puertas, ventanas, cortinas ----------
  const frameM = lvl === 1 ? mm.frame : mm.alum;
  for (const h of open) opening(ctx, o, h, frameM);
  for (const h of up) window2(ctx, o, h, frameM);
  // ---------- azotea ----------
  roofStuff(ctx, o);
  // ---------- instalaciones en fachada ----------
  facadeServices(ctx, o);
  // ---------- terreno alrededor, banqueta y escalón ----------
  lotGround(ctx, o);
  // colisionador principal
  colBox(g, cols, W + 0.1, Htop, BZ - FZ < 0 ? FZ - BZ + 0.05 : 10.5, 0, Htop / 2, (FZ + BZ) / 2 + 0.02);
  return info;
}
// vano de planta baja
function opening(ctx, o, h, frameM) {
  const { K, lvl } = ctx, mm = mats();
  const w = h.x1 - h.x0, cx = (h.x0 + h.x1) / 2, t = h.type;
  const zg = FZ - 0.12;
  if (t === 'glass' || t === 'win') {
    const y0 = Math.max(h.y0, FB), hh = h.y1 - y0;
    // cristal y marco perimetral
    K.plane(mm.glass, w, hh, cx, y0 + hh / 2, zg);
    K.box(frameM, w + 0.04, 0.07, 0.1, cx, h.y1 - 0.035, zg);
    for (const x of [h.x0 + 0.035, h.x1 - 0.035]) K.box(frameM, 0.07, hh, 0.1, x, y0 + hh / 2, zg);
    if (t === 'glass') K.box(frameM, w, 0.28, 0.09, cx, y0 + 0.14, zg); else { K.box(frameM, w, 0.06, 0.1, cx, y0 + 0.03, zg); K.rbox(mm.concrete, w + 0.2, 0.06, 0.2, 0.02, cx, y0 - 0.03, FZ + 0.06); }
    if (hh > 2.4 && t === 'glass') K.box(frameM, w, 0.06, 0.1, cx, y0 + 2.2, zg);
    const d = h.door;
    const n = Math.max(1, Math.round(w / 1.5));
    for (let k = 1; k < n; k++) { const x = h.x0 + k * w / n; if (d && x > d[0] - 0.1 && x < d[1] + 0.1) continue; K.box(frameM, 0.05, hh, 0.09, x, y0 + hh / 2, zg); }
    if (d) {
      const dw = d[1] - d[0], dcx = (d[0] + d[1]) / 2;
      for (const x of [d[0], d[1]]) K.box(frameM, 0.08, 2.2, 0.12, x, y0 + 1.1, zg + 0.01);
      K.box(frameM, dw, 0.08, 0.12, dcx, y0 + 2.2, zg + 0.01);
      const leaves = dw > 1.3 ? 2 : 1;
      for (let i = 0; i < leaves; i++) {
        const lx = d[0] + dw * (i + 0.5) / leaves, lw = dw / leaves;
        K.box(frameM, lw - 0.04, 0.12, 0.05, lx, y0 + 0.08, zg + 0.04);
        K.box(frameM, 0.06, 2.1, 0.05, lx - lw / 2 + 0.05, y0 + 1.1, zg + 0.04); K.box(frameM, 0.06, 2.1, 0.05, lx + lw / 2 - 0.05, y0 + 1.1, zg + 0.04);
        const hxp = leaves === 2 ? (i === 0 ? lx + lw / 2 - 0.14 : lx - lw / 2 + 0.14) : lx + lw / 2 - 0.16;
        K.cyl(mm.chrome, 0.016, 0.016, 0.7, hxp, y0 + 1.1, zg + 0.12, 0, 0, 0, 8);
        for (const yy of [0.8, 1.4]) K.cyl(mm.chrome, 0.01, 0.01, 0.07, hxp, y0 + yy, zg + 0.085, PI / 2, 0, 0, 6);
      }
      // letrero ABIERTO colgado y horario
      const ab = lvl === 3 ? glowM(openTex(3), 1.4, { transparent: true }) : texM(openTex(lvl), { transparent: true });
      K.plane(ab, 0.42, 0.2, dcx + (leaves === 2 ? -dw / 4 : 0), y0 + 1.62, zg + 0.07);
      K.plane(texM(hoursTex(), { transparent: true, roughness: 0.4 }), 0.26, 0.2, dcx + (leaves === 2 ? dw / 4 : 0), y0 + 1.5, zg + 0.07);
      if (lvl > 1) K.plane(texM(pushTex(), { transparent: true }), 0.18, 0.06, dcx + (leaves === 2 ? dw / 4 : 0), y0 + 1.2, zg + 0.07);
    }
  } else if (t === 'reja') {
    const hh = h.y1 - Math.max(h.y0, FB), y0 = Math.max(h.y0, FB);
    const gg = new THREE.PlaneGeometry(w, hh), uv = gg.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 0.5, uv.getY(i) * hh / 1.0);
    K.geo(mm.reja, gg, cx, y0 + hh / 2, FZ - 0.05);
    for (const x of [h.x0 + 0.03, h.x1 - 0.03]) K.box(mm.iron, 0.06, hh, 0.06, x, y0 + hh / 2, FZ - 0.05);
    K.box(mm.iron, w, 0.06, 0.06, cx, h.y1 - 0.03, FZ - 0.05); K.box(mm.iron, w, 0.06, 0.06, cx, y0 + 1.0, FZ - 0.05);
    // ventanilla para despachar
    const vw = h.ventanilla ?? 0.6, vx = h.vx ?? cx;
    K.box(mm.iron, vw + 0.08, 0.05, 0.3, vx, y0 + 1.02, FZ - 0.02);
  } else if (t === 'door') {
    // puerta de herrería de la casa (zaguán)
    const y0 = h.y0, hh = h.y1 - y0, dm = paint(o.doorC ?? 0x6a2a1a, 0.5);
    K.box(dm, w - 0.04, hh - 0.02, 0.06, cx, y0 + hh / 2, zg);
    const leaves = w > 1.6 ? 2 : 1;
    for (let i = 0; i < leaves; i++) {
      const lx = h.x0 + w * (i + 0.5) / leaves, lw = w / leaves;
      for (let k = 0; k < Math.floor((lw - 0.1) / 0.12); k++) K.box(dm, 0.05, hh * 0.45, 0.03, lx - lw / 2 + 0.12 + k * 0.12, y0 + hh * 0.3, zg + 0.045);
      K.plane(mm.herreria, lw - 0.25, hh * 0.35, lx, y0 + hh * 0.74, zg + 0.04);
      K.plane(paint(0x2a2622, 1), lw - 0.25, hh * 0.35, lx, y0 + hh * 0.74, zg + 0.02);
      K.box(dm, lw - 0.08, 0.06, 0.05, lx, y0 + hh * 0.55, zg + 0.04);
    }
    K.cyl(mm.chrome, 0.02, 0.02, 0.12, cx + (leaves === 2 ? -0.12 : w / 2 - 0.15), y0 + 1.05, zg + 0.08, PI / 2, 0, 0, 8);
    K.rbox(mm.chrome, 0.06, 0.12, 0.02, cx + (leaves === 2 ? -0.12 : w / 2 - 0.15), y0 + 1.05, zg + 0.04, 0, 0, 0);
    K.box(mm.concrete, w + 0.2, FB, 0.3, cx, FB / 2, FZ + 0.15);
  }
  // cortina metálica enrollada arriba del vano
  if ((t === 'glass' || t === 'open' || t === 'reja') && h.curtain !== false) {
    const cm = lvl === 1 ? mat(0xc8b8a0, { map: TX.corrugated, roughness: 0.7, metalness: 0.4 }) : mm.curtain;
    const cw = w + 0.24;
    K.wbox(cm, cw, 0.5, 0.34, cx, h.y1 + 0.27, FZ + 0.15, 1.6);
    K.box(mm.frame, cw + 0.02, 0.03, 0.36, cx, h.y1 + 0.53, FZ + 0.15);
    for (const x of [h.x0 - 0.03, h.x1 + 0.03]) K.box(mm.frame, 0.07, h.y1 - 0.02, 0.09, x, h.y1 / 2, FZ + 0.045);
    K.box(mm.steel, w + 0.02, 0.07, 0.05, cx, h.y1 + 0.03, FZ + 0.06);
    for (const x of [cx - w * 0.3, cx + w * 0.3]) K.tor(mm.steel, 0.035, 0.008, x, h.y1 - 0.02, FZ + 0.1, 0, 0, 0, PI, 10, 4);
    if (lvl === 1) { K.rbox(C.brass(), 0.06, 0.07, 0.03, 0.01, cx - w * 0.3, h.y1 - 0.08, FZ + 0.11, 0, 0, 0); }
  }
  if (t === 'open') K.box(mm.steel, w, 0.02, 0.1, cx, FB + 0.01, FZ - 0.02);
}
// ventana con herrería, repisa y cancel
function window2(ctx, o, h, frameM) {
  const { K, lvl } = ctx, mm = mats();
  const w = h.x1 - h.x0, cx = (h.x0 + h.x1) / 2, hh = h.y1 - h.y0, cy = (h.y0 + h.y1) / 2;
  const zg = FZ - 0.15;
  if (h.arch) {
    const r = w / 2, ya = h.y1 - r;
    K.plane(mm.glass, w, ya - h.y0, cx, (h.y0 + ya) / 2, zg);
    K.geo(mm.glass, new THREE.CircleGeometry(r, 20, 0, PI), cx, ya, zg);
    K.tor(frameM, r - 0.03, 0.03, cx, ya, zg, 0, 0, 0, PI, 20, 5);
    for (let i = 1; i < 4; i++) { const a = PI * i / 4; K.box(frameM, 0.03, r, 0.04, cx + Math.cos(a) * r / 2, ya + Math.sin(a) * r / 2, zg, 0, 0, a - PI / 2); }
    K.box(frameM, w, 0.04, 0.05, cx, ya, zg);
    for (const x of [h.x0 + 0.03, h.x1 - 0.03, cx]) K.box(frameM, 0.05, ya - h.y0, 0.06, x, (h.y0 + ya) / 2, zg);
  } else {
    K.plane(mm.glass, w, hh, cx, cy, zg);
    K.box(frameM, w, 0.06, 0.08, cx, h.y1 - 0.03, zg); K.box(frameM, w, 0.06, 0.08, cx, h.y0 + 0.03, zg);
    for (const x of [h.x0 + 0.03, h.x1 - 0.03, cx]) K.box(frameM, 0.05, hh, 0.08, x, cy, zg);
    // protección de herrería
    if (h.grill !== false) {
      const gg = new THREE.PlaneGeometry(w, hh), uv = gg.attributes.uv;
      const nx = Math.max(1, Math.round(w / 0.9)), ny = Math.max(1, Math.round(hh / 0.9));
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * nx, uv.getY(i) * ny);
      K.geo(lvl === 1 ? mm.herreria : (o.grillWhite ? mm.herreriaW : mm.herreria), gg, cx, cy, FZ + 0.04);
    }
  }
  K.rbox(lvl === 3 ? paint(o.trim, 0.6) : mm.concrete, w + 0.24, 0.07, 0.16, 0.02, cx, h.y0 - 0.035, FZ + 0.06);
  if (lvl === 3 && h.flowers !== false && h.y0 > 3) {
    // jardinera de ventana con geranios
    K.rbox(paint(0x8a4a2a, 0.8), w * 0.9, 0.2, 0.22, 0.03, cx, h.y0 + 0.08, FZ + 0.17);
    for (let i = 0; i < Math.round(w / 0.18); i++) { const x = h.x0 + 0.1 + i * 0.18; K.sph(mats().green, 0.08, x, h.y0 + 0.22, FZ + 0.17, 1, 0.8, 1, 8); K.sph(i % 2 ? mats().red : paint(0xe8508a, 0.6), 0.035, x + 0.03, h.y0 + 0.3, FZ + 0.2, 1, 1, 1, 6); }
  }
}
function openTex(lvl) {
  return ftex('tb-open' + lvl, 256, 128, (c, w, h) => {
    if (lvl === 1) { c.fillStyle = '#c8a878'; c.fillRect(8, 20, w - 16, h - 28); c.fillStyle = 'rgba(0,0,0,0.1)'; for (let i = 0; i < 20; i++) c.fillRect(8, 20 + i * 5, w - 16, 1); brushText(c, 'ABIERTO', w / 2, h * 0.6, { font: 'bold #px Rubik, system-ui', px: 56, maxW: w * 0.8, fill: '#1a1a1a', rough: 1 }); }
    else if (lvl === 2) { c.fillStyle = '#b8141c'; c.beginPath(); c.roundRect(6, 22, w - 12, h - 30, 14); c.fill(); brushText(c, 'ABIERTO', w / 2, h * 0.6, { font: '800 #px Rubik, system-ui', px: 60, maxW: w * 0.8, fill: '#fff', rough: 0 }); }
    else { c.fillStyle = '#0a0a0a'; c.beginPath(); c.roundRect(6, 22, w - 12, h - 30, 14); c.fill(); c.strokeStyle = '#3af2ff'; c.lineWidth = 5; c.shadowColor = '#3af2ff'; c.shadowBlur = 12; c.beginPath(); c.roundRect(14, 30, w - 28, h - 46, 10); c.stroke(); brushText(c, 'ABIERTO', w / 2, h * 0.6, { font: 'bold #px Bungee, Rubik, system-ui', px: 50, maxW: w * 0.75, fill: '#ff4a7a', glow: '#ff2a5a', rough: 0 }); }
    c.strokeStyle = '#444'; c.lineWidth = 2; c.beginPath(); c.moveTo(w * 0.3, 22); c.lineTo(w / 2, 2); c.lineTo(w * 0.7, 22); c.stroke();
  }, false);
}
function hoursTex() {
  return ftex('tb-hours', 256, 200, (c, w, h) => {
    c.fillStyle = 'rgba(255,255,255,0.92)'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1a1a1a'; c.textAlign = 'center'; c.font = '800 30px Rubik, system-ui'; c.fillText('HORARIO', w / 2, 40);
    c.font = '500 21px Rubik, system-ui'; ['Lun a Sáb', '8:00 – 21:00', 'Domingo', '9:00 – 15:00'].forEach((t, i) => c.fillText(t, w / 2, 80 + i * 30));
  }, false);
}
function pushTex() { return ftex('tb-push', 128, 40, (c, w, h) => { c.fillStyle = '#1a1a1a'; c.font = '800 26px Rubik, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('EMPUJE', w / 2, h / 2); }, false); }
// azotea: tinaco, varillas, tanque de gas, boiler, tendedero, antena, terraza (nivel 3)
function roofStuff(ctx, o) {
  const { K, g, lvl, R, roofY, Htop, st } = ctx, mm = mats();
  const zF = FZ - FT, y = roofY;
  // varillas de castillo en esquinas (obra que "algún día" crecerá)
  const corners = [[-HW + 0.3, BZ + 0.3], [HW - 0.3, BZ + 0.3], [-HW + 0.3, zF - 0.3], [HW - 0.3, zF - 0.3], [0, BZ + 0.3], [-HW + 0.3, (BZ + zF) / 2], [HW - 0.3, (BZ + zF) / 2]];
  const nReb = lvl === 1 ? 7 : lvl === 2 ? 2 : 0;
  for (let i = 0; i < nReb; i++) rebar(K, corners[i][0], y, corners[i][1], R, 0.6 + R() * 0.5, lvl === 1);
  // cubo de escalera con tinaco encima (1 piso) o tinaco sobre base
  const tx = o.tinacoX ?? 3.6, tz = o.tinacoZ ?? BZ + 1.6;
  const tm = lvl === 1 ? mm.tinaco : mm.tinacoNew;
  if (st === 1 && o.stairHouse !== false) {
    const sw = 1.9, sd = 2.4, sh = 2.3, sx = tx, sz = BZ + 0.2 + sd / 2;
    const shM = lvl === 1 ? mm.block : paint(o.sidePaint ?? o.paint, 0.9);
    K.wbox(shM, sw, sh, sd, sx, y + sh / 2, sz, 0.5);
    K.box(mm.concrete, sw + 0.2, 0.12, sd + 0.2, sx, y + sh + 0.06, sz);
    K.box(paint(lvl === 1 ? 0x3a4a52 : 0x2a5a7a, 0.5), 0.8, 1.9, 0.04, sx - 0.3, y + 0.95, sz + sd / 2 + 0.02);
    K.cyl(mm.chrome, 0.015, 0.015, 0.1, sx + 0.0, y + 1.0, sz + sd / 2 + 0.06, PI / 2, 0, 0, 6);
    tinaco(K, sx, y + sh + 0.12, sz, tm, 0.95);
    K.tube(mm.pvcGrey, [[sx + 0.6, y + sh + 0.3, sz], [sx + sw / 2 + 0.05, y + sh - 0.1, sz], [sx + sw / 2 + 0.05, y + 0.05, sz]], 0.022, 10, 6);
    if (lvl === 1) rebar(K, sx - sw / 2 + 0.12, y + sh + 0.12, sz - sd / 2 + 0.12, R, 0.5, true);
  } else {
    const s2 = st === 2 ? 0.85 : 1;
    if (st === 2) { for (const [a, b] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) K.wbox(mm.block, 0.2, 0.14, 0.4, tx + a, y + 0.07, tz + b, 2); tinaco(K, tx, y + 0.14, tz, tm, s2); }
    else { tinacoBase(K, tx, y, tz, 0.45); tinaco(K, tx, y + 0.51, tz, tm); }
  }
  if (lvl === 1) { tinaco(K, tx - 1.5, y + 0.02, BZ + 1.0, mm.tinaco, 0.75); }
  // gas y calentador
  gasTank(K, -HW + 0.6, y, BZ + 0.6, lvl === 1 ? 0xc8c0b0 : 0xe8e4dc);
  if (lvl === 1) gasTank(K, -HW + 1.05, y, BZ + 0.55, 0xb8b4a8);
  boiler(K, -HW + 1.7, y, BZ + 0.55);
  K.tube(mm.cpvc, [[-HW + 1.9, y + 0.3, BZ + 0.55], [-HW + 2.4, y + 0.12, BZ + 0.6], [tx - 0.6, y + 0.12, BZ + 0.6]], 0.014, 12, 5);
  // antena y parabólica
  if (lvl < 3) antenna(K, -HW + 0.6, y, zF - 1.5, 0.4);
  satDish(K, HW - 0.5, y, zF - 0.8, -2.4 + R());
  // tendedero
  if (!(lvl === 3 && o.terrace)) clothesLine(K, o.lineX ?? -1.6, o.lineZ ?? BZ + 3.2, y, 3.6, 0, R);
  // cachivaches de azotea (nivel 1)
  if (lvl === 1) {
    K.lathe(mm.red, [[0, 0], [0.13, 0], [0.16, 0.3], [0.17, 0.31], [0.15, 0.31], [0.12, 0.02]], 1.2, y, BZ + 0.7, 16);
    K.box(mm.wood, 1.8, 0.03, 0.25, 0.4, y + 0.02, BZ + 1.5, 0, 0.3, 0);
    K.box(mm.wood, 1.6, 0.03, 0.2, 0.5, y + 0.05, BZ + 1.7, 0, 0.25, 0.02);
    plasticChair(K.sub(0, y, 0), -3.2, BZ + 1.0, 0.5, paint(0xf2f2ee, 0.5));
    for (let i = 0; i < 2; i++) K.tor(mm.rubber, 0.3, 0.1, 1.9, y + 0.1 + i * 0.2, BZ + 2.6, PI / 2, 0, 0, TAU, 20, 8);
  }
  // terraza del nivel 3: barandal, sombrillas, foquitos y papel picado
  if (lvl === 3 && o.terrace && st === 1) {
    const z0 = zF - 0.1, z1 = zF - 4.5, x0 = -HW + 0.3, x1 = HW - 0.3;
    K.geo(mm.planks, uvPlaneH(x1 - x0, z0 - z1, 0.8), 0, y + 0.02, (z0 + z1) / 2);
    for (const x of [x0, x1]) { const gg = new THREE.PlaneGeometry(z0 - z1, 0.9), uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (z0 - z1) / 0.9, uv.getY(i)); K.geo(mm.herreria, gg, x, y + 0.5, (z0 + z1) / 2, 0, PI / 2); K.box(mm.iron, 0.05, 0.05, z0 - z1, x, y + 0.97, (z0 + z1) / 2); }
    { const gg = new THREE.PlaneGeometry(x1 - x0, 0.9), uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / 0.9, uv.getY(i)); K.geo(mm.herreria, gg, 0, y + 0.5, z1); K.box(mm.iron, x1 - x0, 0.05, 0.05, 0, y + 0.97, z1); }
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) K.cyl(mm.iron, 0.03, 0.03, 2.6, x, y + 1.3, z, 0, 0, 0, 8);
    // foquitos
    const bulbs = (a, b) => { K.wire(mm.cable, a, b, 0.35, 0.005, 16); for (let i = 1; i < 12; i++) { const t = i / 12; K.sph(mm.bulb, 0.035, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t - Math.sin(t * PI) * 0.35 - 0.05, a[2] + (b[2] - a[2]) * t, 1, 1.2, 1, 8); } };
    bulbs([x0, y + 2.55, z0], [x1, y + 2.55, z1]); bulbs([x1, y + 2.55, z0], [x0, y + 2.55, z1]);
    papelPicado(K, [x0, y + 2.45, (z0 + z1) / 2], [x1, y + 2.45, (z0 + z1) / 2], 0.3, R);
    const KT = K.sub(0, y + 0.02, 0);
    for (const [x, sgn] of [[-2.6, 1], [2.4, -1]]) {
      plasticTable(KT, x, (z0 + z1) / 2, paint(0xf2efe6, 0.5));
      K.cyl(mm.steel, 0.02, 0.02, 2.2, x, y + 1.1, (z0 + z1) / 2, 0, 0, 0, 6);
      const um = new THREE.ConeGeometry(1.2, 0.4, 10, 1, true); const uv = um.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 6);
      K.geo(mat(0xffffff, { map: stripeTex(o.awning?.[0] ?? '#c8281e', o.awning?.[1] ?? '#f2efe6'), side: DS, roughness: 0.9 }), um, x, y + 2.25, (z0 + z1) / 2);
      for (let k = 0; k < 3; k++) { const a = k * 2.1 + sgn; plasticChair(KT, x + Math.cos(a) * 0.75, (z0 + z1) / 2 + Math.sin(a) * 0.75, -a - PI / 2, paint(0xf2efe6, 0.5)); }
    }
    for (const x of [x0 + 0.3, x1 - 0.3]) planter(g, K, x, y, z1 + 0.35, 1.1, 7 + (x > 0 ? 1 : 0), x > 0 ? 'agave' : 'leafy');
  }
}
// tiras de papel picado entre dos puntos
function papelPicado(K, a, b, sag, R) {
  const mm = mats();
  K.wire(mm.cable, a, b, sag, 0.003, 16);
  const L = Math.hypot(b[0] - a[0], b[2] - a[2]), n = Math.floor(L / 0.34), ry = -Math.atan2(b[2] - a[2], b[0] - a[0]);
  for (let i = 1; i < n; i++) {
    const t = i / n, x = a[0] + (b[0] - a[0]) * t, z = a[2] + (b[2] - a[2]) * t, y = a[1] + (b[1] - a[1]) * t - Math.sin(t * PI) * sag;
    const gg = new THREE.PlaneGeometry(0.28, 0.3, 2, 2), p = gg.attributes.position;
    for (let k = 0; k < p.count; k++) p.setZ(k, Math.sin(p.getX(k) * 12 + i) * 0.02);
    gg.computeVertexNormals(); cellUV(gg, (R() * 4) | 0, 4, 1);
    K.geo(mm.papel, gg, x, y - 0.15, z, (R() - 0.5) * 0.3, ry);
  }
}
function stripeTex(a, b) { return canvasTex('tb-stripe' + a + b, 128, 64, (c, w, h) => { for (let x = 0; x < w; x += 32) { c.fillStyle = a; c.fillRect(x, 0, 16, h); c.fillStyle = b; c.fillRect(x + 16, 0, 16, h); } c.fillStyle = 'rgba(0,0,0,0.07)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1); }, true); }
// mufa, medidor, bajante, gárgola, cables sobre la fachada
function facadeServices(ctx, o) {
  const { K, lvl, R, Htop, roofY } = ctx, mm = mats();
  const mx = o.mufaX ?? HW - 0.3, z = FZ + 0.08;
  K.cyl(mm.pvcGrey, 0.03, 0.03, Htop + 0.9 - 1.9, mx, 1.9 + (Htop + 0.9 - 1.9) / 2, z, 0, 0, 0, 8);
  K.tube(mm.pvcGrey, [[mx, Htop + 0.85, z], [mx, Htop + 1.0, z + 0.04], [mx, Htop + 0.95, z + 0.16]], 0.04, 8, 8);
  for (let i = 0; i < 3; i++) K.tube(mm.cable, [[mx, Htop + 0.95, z + 0.16], [mx + 0.04 * (i - 1), Htop + 0.85, z + 0.25]], 0.006, 4, 4);
  for (const yy of [2.5, Htop - 0.5]) K.box(mm.steel, 0.1, 0.03, 0.06, mx, yy, z - 0.03);
  // medidor
  K.rbox(paint(0x9aa0a0, 0.5), 0.3, 0.42, 0.16, 0.02, mx, 1.65, z + 0.02);
  K.cyl(mm.glass, 0.1, 0.1, 0.1, mx, 1.7, z + 0.12, PI / 2, 0, 0, 16);
  K.plane(texM(meterTex(), { roughness: 0.3 }), 0.16, 0.16, mx, 1.7, z + 0.11);
  // bajante pluvial
  const dx = -HW + 0.12, top = Math.min(Htop - 0.3, roofY + 0.2);
  K.cyl(lvl === 1 ? mm.pvcGrey : paint(o.trim, 0.5), 0.05, 0.05, top - 0.2, dx, 0.2 + (top - 0.2) / 2, z + 0.02, 0, 0, 0, 10);
  K.tube(lvl === 1 ? mm.pvcGrey : paint(o.trim, 0.5), [[dx, 0.35, z + 0.02], [dx, 0.1, z + 0.08], [dx, 0.05, z + 0.3]], 0.05, 8, 10);
  for (let y = 1; y < top; y += 1.2) K.box(mm.steel, 0.13, 0.03, 0.08, dx, y, z - 0.01);
  // gárgola que asoma del pretil
  K.box(lvl === 1 ? mm.pvcGrey : paint(o.trim, 0.5), 0.12, 0.08, 0.45, -HW + 1.4, roofY + 0.1, FZ + 0.2);
  if (lvl === 1) K.plane(mat(0x2a2620, { roughness: 1, transparent: true, opacity: 0.35 }), 0.25, roofY - 0.2, -HW + 1.4, roofY / 2 + 0.05, FZ + 0.004);
  // maraña de cables bajo el pretil (nivel 1) o canaleta ordenada
  if (lvl === 1) {
    for (let i = 0; i < 4; i++) K.wire(mm.cable, [mx, Htop - 0.5 - i * 0.07, z + 0.02], [-HW + 0.3 + R() * 2, Htop - 0.45 - i * 0.05, z + 0.02], 0.25 + R() * 0.3, 0.007, 16);
    K.wire(mm.cable, [mx - 0.1, Htop - 0.3, z + 0.02], [mx - 2.5, 1.9, z + 0.02], 0.2, 0.006, 10);
  } else K.box(mm.pvc, W_(ctx) - 1.0, 0.06, 0.06, 0, Htop - 0.45, z);
  // número de casa
  K.plane(texM(numTex(o.num ?? 27), { roughness: 0.4 }), 0.26, 0.18, o.numX ?? HW - 0.9, 2.35, FZ + 0.005);
  // arbotantes en pilares (nivel 3)
  if (lvl === 3) for (const x of o.sconces ?? [-HW + 0.4, HW - 0.8]) sconce(K, x, 2.45, FZ);
}
const W_ = (ctx) => ctx.W;
function meterTex() { return canvasTex('tb-meter', 64, 64, (c, w) => { c.fillStyle = '#e8e8e0'; c.fillRect(0, 0, w, w); c.fillStyle = '#1a1a1a'; c.font = 'bold 9px monospace'; c.fillText('CFE-ish', 12, 16); c.fillStyle = '#222'; c.fillRect(10, 26, 44, 12); c.fillStyle = '#f2f2f2'; c.font = 'bold 10px monospace'; c.fillText('04721', 15, 36); c.fillStyle = '#b8141c'; c.fillRect(30, 44, 4, 12); }); }
function numTex(n) { return canvasTex('tb-num' + n, 128, 90, (c, w, h) => { c.fillStyle = '#1f3f9a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f2ecdc'; c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12); c.fillStyle = '#f2ecdc'; c.font = 'bold 50px Rubik, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(n), w / 2, h / 2 + 3); }); }
// banqueta del frente, terreno de los lados y cachivaches
function lotGround(ctx, o) {
  const { K, g, cols, lvl, R } = ctx, mm = mats();
  const apronM = lvl === 3 ? mat(0xd8d0c0, { map: TX.concrete, roughness: 0.85 }) : mm.concrete;
  K.geo(apronM, uvPlaneH(14, -FZ - 0.35, 0.7), 0, 0.012, (FZ + 0.35) / 2);
  if (lvl === 3) { const gg = uvPlaneH(14, 0.2, 5); K.geo(mm.azulejo, gg, 0, 0.016, -0.12); }
  const sideM = lvl === 1 ? mat(0x8a7458, { map: TX.concrete, roughness: 1 }) : mm.concreteDark;
  for (const sgn of [-1, 1]) K.geo(sideM, uvPlaneH(1.2, 12.3, 0.6), sgn * (HW + 0.6), 0.011, (FZ + 0.35 - 14) / 2 + 0.17);
  K.geo(sideM, uvPlaneH(11.6, 1.5, 0.6), 0, 0.011, (BZ - 14) / 2);
  lightPole(K, g, cols, HW + 0.62, -0.5, [[(o.mufaX ?? HW - 0.3), ctx.Htop + 0.95, FZ + 0.25, -0.3]]);
  if (lvl === 1) {
    // cachivaches en el pasillo lateral
    const sx = -(HW + 0.6);
    for (let i = 0; i < 3; i++) K.tor(mm.rubber, 0.3, 0.1, sx, 0.1 + i * 0.2, -4.2, PI / 2, 0, 0, TAU, 20, 8);
    for (let i = 0; i < 4; i++) K.wbox(mm.block, 0.4, 0.2, 0.2, sx + (i % 2) * 0.1, 0.1 + (i / 2 | 0) * 0.2, -6 - (i % 2) * 0.22, 2);
    K.lathe(mm.blue, [[0, 0], [0.13, 0], [0.16, 0.34], [0.17, 0.35], [0.15, 0.35], [0.12, 0.02]], sx + 0.1, 0, -7.2, 16);
    const b1 = trashBagMesh(3, 0x141414, 0.9); b1.position.set(-sx - 0.1, 0, -3.2); g.add(b1);
    const b2 = trashBagMesh(5, 0x1a2a4a, 0.8); b2.position.set(-sx + 0.1, 0, -3.8); g.add(b2);
    for (let i = 0; i < 5; i++) { const p = leafyPlant(0.35 + R() * 0.3, 20 + i, 0xb8c890); p.position.set((R() < 0.5 ? -1 : 1) * (HW + 0.3 + R() * 0.8), 0, -3 - R() * 9); g.add(p); }
    colBox(g, cols, 1.1, 1, 5, sx, 0.5, -5.5);
  } else if (lvl === 3) {
    for (const sgn of [-1, 1]) for (const z of [-4, -8]) planter(g, K, sgn * (HW + 0.6), 0, z, 1.2, 30 + z * sgn, z === -4 ? 'agave' : 'cactus', 'barro');
  }
}

// =====================================================================================
// Emblemas pintados (para rótulos, lonas y muros)
// =====================================================================================
function emblem(c, kind, x, y, s, alt = false) {
  c.save(); c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round';
  const ol = (w = 0.05) => { c.strokeStyle = '#1a1a1a'; c.lineWidth = s * w; c.stroke(); };
  if (kind === 'tortilleria') {
    for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#f2dca0' : '#e8cc88'; c.beginPath(); c.ellipse(-s * 0.1, s * 0.3 - i * s * 0.07, s * 0.42, s * 0.12, 0, 0, TAU); c.fill(); ol(0.02); }
    c.save(); c.translate(s * 0.28, -s * 0.1); c.rotate(0.5);
    c.fillStyle = '#f2c230'; c.beginPath(); c.ellipse(0, 0, s * 0.12, s * 0.34, 0, 0, TAU); c.fill(); ol(0.03);
    c.fillStyle = '#d8a018'; for (let yy = -0.28; yy < 0.3; yy += 0.07) for (let xx = -0.08; xx <= 0.08; xx += 0.055) { c.beginPath(); c.arc(xx * s, yy * s, s * 0.022, 0, TAU); c.fill(); }
    c.fillStyle = '#4a9a3a'; for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(0, s * 0.3); c.quadraticCurveTo(sg * s * 0.3, s * 0.1, sg * s * 0.18, -s * 0.3); c.quadraticCurveTo(sg * s * 0.1, s * 0.1, 0, s * 0.3); c.fill(); ol(0.02); }
    c.restore();
  } else if (kind === 'taqueria') {
    c.rotate(-0.15);
    c.fillStyle = '#6a9a3a'; c.beginPath(); c.arc(0, s * 0.05, s * 0.4, PI, TAU); c.fill();
    for (let i = 0; i < 9; i++) { c.fillStyle = ['#c83a1a', '#f2f0e0', '#e86a2a', '#3a8a3a'][i % 4]; c.beginPath(); c.arc(-s * 0.3 + i * s * 0.075, -s * 0.05 - Math.sin(i) * s * 0.05, s * 0.06, 0, TAU); c.fill(); }
    c.fillStyle = '#f2d890'; c.beginPath(); c.arc(0, s * 0.12, s * 0.42, PI * 1.05, TAU * 0.975, false); c.lineTo(s * 0.4, s * 0.14); c.arc(0, s * 0.12, s * 0.42, 0, PI); c.closePath();
    c.beginPath(); c.moveTo(-s * 0.42, s * 0.12); c.arc(0, s * 0.12, s * 0.42, PI, 0, true); c.lineTo(s * 0.36, s * 0.12); c.arc(0, s * 0.12, s * 0.36, 0, PI, false); c.closePath(); c.fill(); ol(0.03);
    c.fillStyle = '#6aa83a'; c.beginPath(); c.arc(s * 0.42, s * 0.2, s * 0.08, 0, TAU); c.fill(); ol(0.02);
  } else if (kind === 'farmacia') {
    const a = s * 0.16, b = s * 0.46;
    c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(-a - s * 0.05, -b - s * 0.05, (a + s * 0.05) * 2, (b + s * 0.05) * 2, s * 0.06); c.roundRect(-b - s * 0.05, -a - s * 0.05, (b + s * 0.05) * 2, (a + s * 0.05) * 2, s * 0.06); c.fill();
    c.fillStyle = alt ? '#3af27a' : '#1f9a4a'; c.beginPath(); c.roundRect(-a, -b, a * 2, b * 2, s * 0.04); c.roundRect(-b, -a, b * 2, a * 2, s * 0.04); c.fill();
  } else if (kind === 'panaderia') {
    c.fillStyle = '#c88a4a'; c.beginPath(); c.ellipse(0, s * 0.18, s * 0.46, s * 0.14, 0, 0, TAU); c.fill(); ol(0.03);
    c.fillStyle = '#f4e4c8'; c.beginPath(); c.ellipse(0, s * 0.1, s * 0.44, s * 0.36, 0, PI, TAU); c.fill(); ol(0.03);
    c.strokeStyle = '#c8a070'; c.lineWidth = s * 0.02; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(i * s * 0.1, s * 0.08); c.quadraticCurveTo(i * s * 0.06, -s * 0.15, 0, -s * 0.25); c.stroke(); }
    c.strokeStyle = '#d8a030'; c.lineWidth = s * 0.03; c.beginPath(); c.moveTo(s * 0.35, -s * 0.05); c.lineTo(s * 0.5, -s * 0.5); c.stroke();
    c.fillStyle = '#e8b848'; for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(s * (0.38 + i * 0.025) + (i % 2 ? s * 0.04 : -s * 0.04), -s * (0.12 + i * 0.075), s * 0.03, s * 0.055, (i % 2 ? 0.5 : -0.5), 0, TAU); c.fill(); }
  } else if (kind === 'gimnasio') {
    c.rotate(-0.35);
    c.fillStyle = '#c8ccd0'; c.fillRect(-s * 0.46, -s * 0.03, s * 0.92, s * 0.06);
    for (const sg of [-1, 1]) for (let i = 0; i < 3; i++) { c.fillStyle = i === 1 ? '#f07a1a' : '#1a1a1a'; c.beginPath(); c.roundRect(sg * s * (0.2 + i * 0.07) - s * 0.03, -s * (0.26 - i * 0.05), s * 0.06, s * (0.52 - i * 0.1), s * 0.02); c.fill(); }
  } else if (kind === 'abarrotes') {
    c.fillStyle = '#c8281e'; c.beginPath(); c.moveTo(-s * 0.42, -s * 0.08); c.lineTo(s * 0.42, -s * 0.08); c.lineTo(s * 0.32, s * 0.36); c.lineTo(-s * 0.32, s * 0.36); c.closePath(); c.fill(); ol(0.03);
    c.strokeStyle = '#1a1a1a'; c.lineWidth = s * 0.04; c.beginPath(); c.arc(0, -s * 0.08, s * 0.3, PI, TAU); c.stroke();
    const it = [['#f2c230', -0.22], ['#2a8ad8', -0.05], ['#3aa860', 0.12], ['#f2f0ea', 0.27]];
    for (const [col, xx] of it) { c.fillStyle = col; c.fillRect(xx * s - s * 0.06, -s * 0.3, s * 0.12, s * 0.24); c.strokeStyle = '#1a1a1a'; c.lineWidth = s * 0.015; c.strokeRect(xx * s - s * 0.06, -s * 0.3, s * 0.12, s * 0.24); }
    c.fillStyle = 'rgba(255,255,255,0.3)'; for (let i = 0; i < 4; i++) c.fillRect(-s * 0.3, s * (0.0 + i * 0.08), s * 0.6, s * 0.02);
  } else if (kind === 'barberia') {
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.moveTo(0, -s * 0.05);
    c.bezierCurveTo(s * 0.15, -s * 0.2, s * 0.35, -s * 0.05, s * 0.5, -s * 0.25); c.bezierCurveTo(s * 0.45, s * 0.05, s * 0.2, s * 0.1, 0, s * 0.02);
    c.bezierCurveTo(-s * 0.2, s * 0.1, -s * 0.45, s * 0.05, -s * 0.5, -s * 0.25); c.bezierCurveTo(-s * 0.35, -s * 0.05, -s * 0.15, -s * 0.2, 0, -s * 0.05); c.fill();
    c.strokeStyle = alt ? '#e8cf8a' : '#c8a04a'; c.lineWidth = s * 0.04;
    for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(sg * s * 0.2, s * 0.45); c.lineTo(-sg * s * 0.06, s * 0.12); c.stroke(); c.beginPath(); c.arc(sg * s * 0.24, s * 0.5, s * 0.06, 0, TAU); c.stroke(); }
  } else if (kind === 'lavanderia') {
    c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-s * 0.2, -s * 0.35); c.lineTo(-s * 0.42, -s * 0.2); c.lineTo(-s * 0.32, -s * 0.05); c.lineTo(-s * 0.22, -s * 0.1); c.lineTo(-s * 0.22, s * 0.35); c.lineTo(s * 0.22, s * 0.35); c.lineTo(s * 0.22, -s * 0.1); c.lineTo(s * 0.32, -s * 0.05); c.lineTo(s * 0.42, -s * 0.2); c.lineTo(s * 0.2, -s * 0.35); c.quadraticCurveTo(0, -s * 0.22, -s * 0.2, -s * 0.35); c.fill(); ol(0.03);
    for (const [bx, by, br] of [[0.35, -0.4, 0.1], [0.45, -0.18, 0.06], [-0.4, 0.3, 0.08], [0.38, 0.28, 0.12]]) { const gr = c.createRadialGradient(bx * s - br * s * 0.3, by * s - br * s * 0.3, 1, bx * s, by * s, br * s); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, 'rgba(160,220,255,0.6)'); gr.addColorStop(1, 'rgba(90,170,230,0.9)'); c.fillStyle = gr; c.beginPath(); c.arc(bx * s, by * s, br * s, 0, TAU); c.fill(); }
  } else if (kind === 'paleteria') {
    c.fillStyle = '#c8a070'; c.fillRect(-s * 0.04, s * 0.1, s * 0.08, s * 0.4);
    c.fillStyle = '#e8508a'; c.beginPath(); c.roundRect(-s * 0.2, -s * 0.45, s * 0.4, s * 0.6, [s * 0.18, s * 0.18, s * 0.04, s * 0.04]); c.fill(); ol(0.03);
    c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.roundRect(-s * 0.13, -s * 0.38, s * 0.07, s * 0.4, s * 0.03); c.fill();
    c.fillStyle = '#c8184a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(-s * 0.08 + (i % 3) * s * 0.08, -s * 0.2 + (i / 3 | 0) * s * 0.18, s * 0.018, s * 0.03, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#3a9a4a'; for (let i = 0; i < 5; i++) { c.save(); c.translate(s * 0.35, -s * 0.2); c.rotate(-1.2 + i * 0.6); c.beginPath(); c.ellipse(s * 0.15, 0, s * 0.16, s * 0.04, 0, 0, TAU); c.fill(); c.restore(); }
    c.strokeStyle = '#8a5a2a'; c.lineWidth = s * 0.04; c.beginPath(); c.moveTo(s * 0.35, -s * 0.2); c.quadraticCurveTo(s * 0.4, s * 0.15, s * 0.32, s * 0.48); c.stroke();
  } else if (kind === 'arcade') {
    const px = s * 0.08, inv = ['..X.....X..', '...X...X...', '..XXXXXXX..', '.XX.XXX.XX.', 'XXXXXXXXXXX', 'X.XXXXXXX.X', 'X.X.....X.X', '...XX.XX...'];
    c.fillStyle = alt ? '#3af2ff' : '#7aff3a';
    inv.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === 'X') c.fillRect((i - 5.5) * px, (j - 4) * px, px - 1, px - 1); }));
  }
  c.restore();
}

// =====================================================================================
// Rótulos: caja de lona (nv 2), caja iluminada + neón + bandera (nv 3), toldos
// =====================================================================================
function signage(ctx, o) {
  const { K, g, lvl, kind } = ctx, mm = mats(), sg = o.sign;
  const x = sg?.x ?? 0, y = sg?.y, w = sg?.w, h = sg?.h;
  if (sg && lvl >= 2) {
    const tex = ftex(`tb-sign-${kind}-${lvl}`, 1024, Math.round(1024 * h / w), (c, cw, ch) => sg.draw(c, cw, ch, lvl));
    const frM = lvl === 3 ? (sg.frameM ?? metal(0x2a2a2c, 0.35)) : paint(0x2a2a2a, 0.6);
    K.rbox(frM, w + 0.14, h + 0.14, 0.16, 0.03, x, y, FZ + 0.09);
    K.plane(lvl === 3 ? glowM(tex, sg.glow ?? 0.55) : texM(tex, { roughness: 0.55 }), w, h, x, y, FZ + 0.175);
    if (lvl === 2) {
      // arbotantes tipo cuello de ganso
      const n = Math.max(2, Math.round(w / 2.6));
      for (let i = 0; i < n; i++) {
        const lx = x - w / 2 + w * (i + 0.5) / n;
        K.tube(mm.frame, [[lx, y + h / 2 + 0.05, FZ + 0.03], [lx, y + h / 2 + 0.35, FZ + 0.15], [lx, y + h / 2 + 0.3, FZ + 0.55]], 0.015, 10, 5);
        K.cone(mm.frame, 0.1, 0.12, lx, y + h / 2 + 0.24, FZ + 0.58, 0.9, 0, 0, 12, true);
        K.sph(mm.bulb, 0.035, lx, y + h / 2 + 0.2, FZ + 0.56, 1, 1, 1, 8);
      }
    }
    if (lvl === 3 && sg.bulbs) {
      const step = 0.22;
      for (let t = 0; t < (w + h) * 2; t += step) {
        let bx, by;
        if (t < w) { bx = x - w / 2 + t; by = y + h / 2 + 0.05; } else if (t < w + h) { bx = x + w / 2 + 0.05; by = y + h / 2 - (t - w); } else if (t < 2 * w + h) { bx = x + w / 2 - (t - w - h); by = y - h / 2 - 0.05; } else { bx = x - w / 2 - 0.05; by = y - h / 2 + (t - 2 * w - h); }
        K.sph(sg.bulbM ?? mm.bulb, 0.035, bx, by, FZ + 0.19, 1, 1, 1, 8);
      }
    }
  }
  // neón adicional
  if (lvl === 3 && o.neon) for (const n of [].concat(o.neon)) {
    const tex = ftex(`tb-neon-${kind}-${n.text}`, 1024, Math.round(1024 * n.h / n.w), (c, cw, ch) => {
      c.clearRect(0, 0, cw, ch);
      if (n.draw) n.draw(c, cw, ch);
      else {
        c.lineJoin = 'round';
        const f = fitFont(c, n.text, n.font ?? 'bold #px Lobster, Rubik, system-ui', ch * 0.7, cw * 0.92);
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.shadowColor = n.col; c.shadowBlur = f * 0.35; c.strokeStyle = n.col; c.lineWidth = f * 0.09; c.strokeText(n.text, cw / 2, ch / 2);
        c.shadowBlur = f * 0.15; c.strokeStyle = '#ffffff'; c.lineWidth = f * 0.03; c.strokeText(n.text, cw / 2, ch / 2);
      }
    });
    if (n.back !== false) K.rbox(mat(0x121214, { roughness: 0.3, transparent: true, opacity: 0.65 }), n.w * 0.98, n.h * 0.9, 0.03, 0.01, n.x, n.y, (n.z ?? FZ) + 0.015);
    K.plane(glowM(tex, 1.6, { transparent: true, depthWrite: false }), n.w, n.h, n.x, n.y, (n.z ?? FZ) + 0.035);
  }
  // bandera perpendicular iluminada
  if (lvl >= 2 && o.blade) {
    const b = o.blade, bx = b.x ?? -HW + 0.3, by = b.y ?? 3.0, bw = b.w ?? 0.9, bh = b.h ?? 0.9;
    const tex = ftex(`tb-blade-${kind}-${lvl}`, 512, Math.round(512 * bh / bw), (c, cw, ch) => b.draw(c, cw, ch, lvl));
    const fm = lvl === 3 ? glowM(tex, 0.7) : texM(tex);
    K.rbox(paint(0x2a2a2a, 0.5), 0.14, bh + 0.08, bw + 0.08, 0.03, bx, by, FZ + 0.2 + bw / 2);
    K.plane(fm, bw, bh, bx + 0.072, by, FZ + 0.2 + bw / 2, 0, PI / 2);
    K.plane(fm, bw, bh, bx - 0.072, by, FZ + 0.2 + bw / 2, 0, -PI / 2);
    for (const yy of [by + bh / 2 + 0.02, by - bh / 2 + 0.1]) K.box(mm.frame, 0.04, 0.04, 0.24, bx, yy, FZ + 0.1);
  }
  // toldos
  if (lvl >= 2 && o.awning) for (const a of o.awnings ?? [{ x0: -HW + 0.2, x1: HW - 0.2 }]) awningK(ctx, a.x0, a.x1, a.y ?? (o.awningY ?? 3.25), a.depth ?? 1.05, 0.6, o.awning[0], o.awning[1], a.text ?? o.awningText ?? '');
}
function awningK(ctx, x0, x1, yTop, depth, drop, a, b, text) {
  const { K, lvl } = ctx, mm = mats();
  const w = x1 - x0, cx = (x0 + x1) / 2, len = Math.hypot(depth, drop);
  const st = stripeTex(a, b);
  const fab = mat(0xffffff, { map: st, roughness: 0.9, side: DS });
  const gg = new THREE.PlaneGeometry(w, len, 1, 1), uv = gg.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w / 1.0, uv.getY(i));
  K.geo(fab, gg, cx, yTop - drop / 2, FZ + depth / 2, -Math.atan2(depth, drop));
  // faldón con ondas y texto
  const vt = ftex(`tb-val-${a}-${b}-${text}-${w.toFixed(1)}`, 1024, Math.max(32, Math.round(1024 * 0.3 / w)), (c, cw, ch) => {
    c.fillStyle = a; c.fillRect(0, 0, cw, ch); c.fillStyle = 'rgba(0,0,0,0.07)'; for (let yy = 0; yy < ch; yy += 3) c.fillRect(0, yy, cw, 1);
    if (text) brushText(c, text, cw / 2, ch * 0.45, { font: '800 #px Rubik, system-ui', px: ch * 0.55, maxW: cw * 0.9, fill: b, rough: 0 });
  });
  const vg = new THREE.PlaneGeometry(w, 0.3, Math.round(w * 4), 1), pp = vg.attributes.position;
  for (let i = 0; i < pp.count; i++) if (pp.getY(i) < 0) pp.setY(i, pp.getY(i) + Math.abs(Math.sin((pp.getX(i) + w / 2) * PI * 4 / 1.0)) * 0.07);
  vg.computeVertexNormals();
  K.geo(mat(0xffffff, { map: vt, roughness: 0.9, side: DS }), vg, cx, yTop - drop - 0.15, FZ + depth + 0.005);
  for (const sgn of [-1, 1]) {
    K.ext(fab, [[0, 0], [depth, -drop], [0, -drop]], 0.01, cx + sgn * w / 2, yTop, FZ, 0, -PI / 2, 0);
    K.tube(mm.frame, [[cx + sgn * w / 2, yTop - drop - 0.05, FZ], [cx + sgn * w / 2, yTop - drop, FZ + depth]], 0.012, 2, 5);
  }
  K.cyl(mm.frame, 0.018, 0.018, w, cx, yTop - drop, FZ + depth, 0, 0, PI / 2, 6);
  K.cyl(mm.frame, 0.018, 0.018, w, cx, yTop, FZ + 0.02, 0, 0, PI / 2, 6);
}

// =====================================================================================
// Mobiliario e interiores (origen en el centro inferior trasero, el frente mira a +z)
// =====================================================================================
// fila de productos en caja con etiquetas del atlas
function packRow(K, x0, x1, y, zc, depth, R, hMin = 0.12, hMax = 0.26, m) {
  const mm = mats();
  let x = x0 + 0.02;
  while (x < x1 - 0.06) {
    const w = 0.06 + R() * 0.1, h = hMin + R() * (hMax - hMin), d = Math.min(depth * 0.85, 0.08 + R() * 0.15), cell = (R() * 32) | 0;
    const n = 1 + ((R() * 3) | 0);
    for (let k = 0; k < n && x + w < x1; k++) { K.abox(m ?? mm.pack, w, h, d, cell, 8, x + w / 2, y + h / 2, zc + depth / 2 - d / 2 - 0.01, 0, (R() - 0.5) * 0.08, 0, 4); x += w + 0.005; }
    x += 0.01 + R() * 0.03;
  }
}
// botellas de refresco (cuerpo de color + etiqueta del atlas)
function bottleRow(K, x0, x1, y, zc, depth, R, big = false) {
  const mm = mats();
  const rr = big ? 0.045 : 0.032, hh = big ? 0.32 : 0.24;
  for (let x = x0 + rr + 0.01; x < x1 - rr; x += rr * 2 + 0.008) for (let z = zc - depth / 2 + rr + 0.02; z < zc + depth / 2 - rr; z += rr * 2 + 0.02) {
    const s = (R() * 8) | 0, col = SODAS[s][1];
    const bm = mat(parseInt(col.slice(1), 16), { roughness: 0.12, env: true, envI: 0.9, transparent: true, opacity: 0.88 });
    K.lathe(bm, [[0, 0], [rr, 0], [rr, hh * 0.6], [rr * 0.45, hh * 0.85], [rr * 0.35, hh], [0, hh]], x, y, z, 10);
    K.acyl(mm.soda, rr * 1.02, rr * 1.02, hh * 0.28, s, 4, x, y + hh * 0.3, z, 0, R() * TAU, 0, 12, 2);
    K.cyl(mm.red, rr * 0.4, rr * 0.4, 0.015, x, y + hh + 0.007, z, 0, 0, 0, 8);
  }
}
function shelfUnit(K, x, z, ry, w, h, d, levels, fill, R, frameM) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry), fm = frameM ?? mm.white;
  for (const sx of [-w / 2, w / 2]) s.box(fm, 0.04, h, d, sx, FB + h / 2, 0);
  s.box(fm, w, h, 0.02, 0, FB + h / 2, -d / 2 + 0.01);
  for (const ly of levels) {
    s.box(fm, w, 0.03, d, 0, FB + ly, 0);
    s.box(mm.pvc, w, 0.04, 0.005, 0, FB + ly - 0.005, d / 2 + 0.003);
    const top = levels.find(l => l > ly) ?? h;
    const room = top - ly - 0.04;
    if (fill === 'pack') packRow(s, -w / 2 + 0.03, w / 2 - 0.03, FB + ly + 0.015, 0, d, R, Math.min(0.1, room * 0.5), Math.min(room * 0.9, 0.3));
    else if (fill === 'soda') bottleRow(s, -w / 2 + 0.03, w / 2 - 0.03, FB + ly + 0.015, 0, d * 0.8, R, room > 0.4);
    else if (fill === 'mixed') { if (R() < 0.5) packRow(s, -w / 2 + 0.03, w / 2 - 0.03, FB + ly + 0.015, 0, d, R, 0.08, Math.min(room * 0.9, 0.3)); else bottleRow(s, -w / 2 + 0.03, w / 2 - 0.03, FB + ly + 0.015, 0, d * 0.6, R, false); }
    else if (typeof fill === 'function') fill(s, ly, room, w, d);
  }
  s.box(fm, w, 0.1, d, 0, FB + 0.05, 0);
  return s;
}
function tplane(K, m, w, h, s, x, y, z, rx = 0, ry = 0, rz = 0) {
  const gg = new THREE.PlaneGeometry(w, h), uv = gg.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * s, uv.getY(i) * h * s);
  return K.geo(m, gg, x, y, z, rx, ry, rz);
}
function counterK(K, x, z, ry, w, d, h, bodyM, topM, o = {}) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry);
  s.rbox(bodyM, w, h - 0.05, d, 0.02, 0, FB + (h - 0.05) / 2, 0);
  s.rbox(topM, w + 0.06, 0.05, d + 0.06, 0.012, 0, FB + h - 0.025, 0.02);
  s.box(mm.black, w - 0.04, 0.08, d - 0.1, 0, FB + 0.04, 0.02);
  if (o.panelM) tplane(s, o.panelM, w - 0.1, h - 0.25, o.panelS ?? 1 / 0.2, 0, FB + h / 2, d / 2 + 0.003);
  return s;
}
function glassCounter(K, x, z, ry, w, d, bodyM, fill, R) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry), h = 1.0;
  s.rbox(bodyM, w, 0.35, d, 0.02, 0, FB + 0.175, 0);
  s.box(mm.glass, w, 0.62, d, 0, FB + 0.66, 0);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) s.box(mm.alum, 0.025, 0.64, 0.025, a * w / 2, FB + 0.67, b * d / 2);
  s.box(mm.alum, w + 0.02, 0.025, d + 0.02, 0, FB + 0.985, 0);
  s.box(mm.glass, w - 0.04, 0.01, d - 0.04, 0, FB + 0.62, 0);
  s.box(mm.tube, w - 0.1, 0.015, 0.02, 0, FB + 0.95, -d / 2 + 0.05);
  if (fill) { fill(s, FB + 0.36, w, d); fill(s, FB + 0.63, w, d); }
  return s;
}
function registerK(K, x, y, z, ry) {
  const mm = mats(), s = K.sub(x, y, z, 0, ry);
  s.rbox(plastic(0x2a2c30), 0.38, 0.1, 0.36, 0.02, 0, 0.05, 0);
  s.rbox(plastic(0x3a3d42), 0.3, 0.05, 0.18, 0.01, 0, 0.12, 0.06, -0.3);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) s.rbox(plastic(i === 3 ? 0xd04a3a : 0xe8e4da), 0.045, 0.02, 0.03, 0.005, -0.09 + i * 0.06, 0.155 - j * 0.012, 0.02 + j * 0.045, -0.3);
  s.rbox(plastic(0x2a2c30), 0.2, 0.12, 0.03, 0.01, 0, 0.24, -0.1, -0.2);
  s.plane(glowM(canvasTex('tb-regscr', 128, 64, (c, w, h) => { c.fillStyle = '#0a1a0a'; c.fillRect(0, 0, w, h); c.fillStyle = '#39ff66'; c.font = 'bold 26px monospace'; c.fillText('$ 0.00', 10, 42); }), 0.8), 0.17, 0.08, 0, 0.24, -0.084, -0.2);
}
function stoolK(K, x, z, h, seatM) {
  const mm = mats();
  K.cyl(seatM, 0.18, 0.18, 0.07, x, FB + h, z, 0, 0, 0, 20);
  K.cyl(mm.chrome, 0.025, 0.025, h, x, FB + h / 2, z, 0, 0, 0, 8);
  K.tor(mm.chrome, 0.14, 0.012, x, FB + h * 0.35, z, PI / 2, 0, 0, TAU, 20, 5);
  K.cyl(mm.chrome, 0.19, 0.21, 0.03, x, FB + 0.015, z, 0, 0, 0, 20);
}
function posterK(K, x, y, z, w, h, tex, ry = 0, glow = 0) {
  K.plane(glow ? glowM(tex, glow) : texM(tex, { roughness: 0.6 }), w, h, x, y, z, 0, ry);
}
function tvK(K, x, y, z, ry, tex) {
  const mm = mats(), s = K.sub(x, y, z, 0, ry);
  s.rbox(mm.black, 0.9, 0.54, 0.05, 0.01, 0, 0, 0);
  s.plane(glowM(tex, 0.9), 0.84, 0.48, 0, 0, 0.026);
  s.box(mm.black, 0.1, 0.1, 0.2, 0, 0, -0.12);
}
function fanK(K, x, z, ry) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry);
  s.cyl(mm.white, 0.18, 0.2, 0.05, 0, FB + 0.025, 0, 0, 0, 0, 16);
  s.cyl(mm.white, 0.018, 0.018, 1.2, 0, FB + 0.6, 0, 0, 0, 0, 8);
  const hd = s.sub(0, FB + 1.25, 0, 0.1);
  hd.rbox(mm.white, 0.16, 0.14, 0.2, 0.05, 0, 0, -0.08);
  hd.tor(mm.chrome, 0.22, 0.006, 0, 0, 0.06, 0, 0, 0, TAU, 24, 4);
  for (let i = 0; i < 8; i++) hd.cyl(mm.chrome, 0.003, 0.003, 0.44, 0, 0, 0.06, 0, 0, i * PI / 8, 3);
  for (let i = 0; i < 3; i++) hd.sph(plastic(0x4a8ad8), 0.1, Math.cos(i * 2.1) * 0.1, Math.sin(i * 2.1) * 0.1, 0.05, 1, 0.5, 0.12, 8);
}
function clockK(K, x, y, z, ry) {
  const s = K.sub(x, y, z, 0, ry), mm = mats();
  s.cyl(mm.black, 0.17, 0.17, 0.04, 0, 0, 0, PI / 2, 0, 0, 24);
  s.plane(texM(canvasTex('tb-clock', 128, 128, (c, w) => { c.fillStyle = '#f8f6f0'; c.beginPath(); c.arc(64, 64, 62, 0, TAU); c.fill(); c.fillStyle = '#1a1a1a'; c.font = 'bold 16px Rubik, system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - PI / 2; c.fillText(String(i), 64 + Math.cos(a) * 48, 64 + Math.sin(a) * 48); } c.strokeStyle = '#1a1a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + 22, 64 - 18); c.stroke(); c.lineWidth = 2.5; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 - 8, 64 - 40); c.stroke(); c.strokeStyle = '#c8281e'; c.lineWidth = 1; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + 30, 64 + 30); c.stroke(); }, false), { roughness: 0.3 }), 0.32, 0.32, 0, 0, 0.021);
}
// altarcito de la Virgen con veladoras y flores
function altarK(K, x, y, z, ry) {
  const mm = mats(), s = K.sub(x, y, z, 0, ry);
  s.rbox(mm.darkWood, 0.5, 0.04, 0.22, 0.01, 0, 0, 0.08);
  s.rbox(C.gold(), 0.36, 0.5, 0.03, 0.01, 0, 0.3, -0.01);
  s.plane(texM(virgenTex(), { roughness: 0.5 }), 0.3, 0.44, 0, 0.3, 0.006);
  for (const a of [-0.17, 0.17]) { s.cyl(glass(0xc8281e, 0.7), 0.03, 0.03, 0.12, a, 0.08, 0.1, 0, 0, 0, 10); s.sph(emissive(0xffb040, 3), 0.012, a, 0.16, 0.1, 1, 1.6, 1, 6); }
  for (let i = 0; i < 6; i++) s.sph(i % 2 ? mm.red : paint(0xf2f2f2, 0.6), 0.03, -0.1 + i * 0.04, 0.05, 0.14, 1, 1, 1, 6);
}
function virgenTex() {
  return canvasTex('tb-virgen', 128, 192, (c, w, h) => {
    c.fillStyle = '#2a1a0a'; c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, h * 0.5); g.addColorStop(0, '#fff2a0'); g.addColorStop(0.6, '#f2a020'); g.addColorStop(1, '#6a2a0a'); c.fillStyle = g;
    c.beginPath(); c.ellipse(w / 2, h / 2, w * 0.45, h * 0.46, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,240,160,0.8)'; c.lineWidth = 1.5; for (let i = 0; i < 40; i++) { const a = i / 40 * TAU; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * w * 0.25, h / 2 + Math.sin(a) * h * 0.3); c.lineTo(w / 2 + Math.cos(a) * w * 0.44, h / 2 + Math.sin(a) * h * 0.45); c.stroke(); }
    c.fillStyle = '#c8485a'; c.beginPath(); c.moveTo(w / 2, h * 0.25); c.lineTo(w * 0.66, h * 0.82); c.lineTo(w * 0.34, h * 0.82); c.fill();
    c.fillStyle = '#2a7a7a'; c.beginPath(); c.moveTo(w / 2, h * 0.16); c.quadraticCurveTo(w * 0.72, h * 0.3, w * 0.7, h * 0.84); c.lineTo(w * 0.6, h * 0.84); c.lineTo(w / 2, h * 0.3); c.lineTo(w * 0.4, h * 0.84); c.lineTo(w * 0.3, h * 0.84); c.quadraticCurveTo(w * 0.28, h * 0.3, w / 2, h * 0.16); c.fill();
    c.fillStyle = '#f2d060'; for (let i = 0; i < 12; i++) c.fillRect(w * 0.33 + (i % 4) * w * 0.1, h * 0.35 + (i / 4 | 0) * h * 0.15, 2, 2);
    c.fillStyle = '#c8906a'; c.beginPath(); c.arc(w / 2, h * 0.22, w * 0.06, 0, TAU); c.fill();
    c.fillStyle = '#1a1a1a'; c.beginPath(); c.ellipse(w / 2, h * 0.87, w * 0.16, h * 0.03, 0, 0, TAU); c.fill();
  });
}
// carteles de cartón escritos a mano / impresos
function handSign(lines, o = {}) {
  const { bg = '#c8a878', fg = '#1a1a1a', w = 256, h = 192, font = 'bold #px Lobster, Rubik, system-ui', accent = '#c8281e', key = '' } = o;
  return ftex('tb-hs-' + lines.join('|') + bg + fg + w + h + key, w, h, (c) => {
    const R = rng(lines.join(''));
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    if (bg === '#c8a878') { c.fillStyle = 'rgba(90,60,30,0.15)'; for (let i = 0; i < 30; i++) c.fillRect(0, R() * h, w, 1); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4); }
    lines.forEach((t, i) => brushText(c, t, w / 2, h * (i + 0.6) / (lines.length + 0.2), { font, px: h / (lines.length + 0.6), maxW: w * 0.88, fill: i === 0 ? fg : accent, rough: 0.8, skew: -0.05 }));
  }, false);
}
// letrero-menú impreso o pizarrón
function boardTex(key, title, items, o = {}) {
  const { bg = '#1c1c1a', fg = '#f4e8c8', accent = '#f2c230', w = 512, h = 384, titleFont = 'bold #px Lobster, Rubik, system-ui', chalk = true } = o;
  return ftex('tb-board-' + key, w, h, (c) => {
    const R = rng(key);
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    if (chalk) { c.fillStyle = 'rgba(255,255,255,0.04)'; for (let i = 0; i < 40; i++) c.fillRect(R() * w, R() * h, 30 + R() * 80, 8 + R() * 20); }
    brushText(c, title, w / 2, h * 0.13, { font: titleFont, px: h * 0.15, maxW: w * 0.9, fill: accent, rough: 0.3 });
    const cols = items.length > 6 ? 2 : 1, rows = Math.ceil(items.length / cols);
    items.forEach(([n, p], i) => {
      const cx = cols === 2 ? (i < rows ? w * 0.05 : w * 0.53) : w * 0.08, cy = h * 0.3 + (i % rows) * (h * 0.66 / rows), cw = cols === 2 ? w * 0.42 : w * 0.84;
      c.fillStyle = fg; c.textAlign = 'left'; c.textBaseline = 'middle'; fitFont(c, n, '600 #px Rubik, system-ui', Math.min(34, h * 0.6 / rows), cw * 0.7); c.fillText(n, cx, cy);
      c.fillStyle = accent; c.textAlign = 'right'; c.font = `800 ${Math.min(34, h * 0.6 / rows)}px Rubik, system-ui`; c.fillText(p, cx + cw, cy);
      c.strokeStyle = rgba(0xffffff, 0.15); c.setLineDash([3, 5]); c.beginPath(); c.moveTo(cx + c.measureText(p).width * 0 + cw * 0.72, cy); c.lineTo(cx + cw * 0.8, cy); c.stroke(); c.setLineDash([]);
    });
  }, false);
}
// refrigerador de refrescos con puerta de cristal
function coolerK(K, x, z, ry, brand, R, w = 0.75) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry), h = 2.0, d = 0.7;
  const [name, bg, fg] = SODAS[brand];
  const body = paint(parseInt(bg.slice(1), 16), 0.35);
  s.rbox(body, w, h, d, 0.03, 0, FB + h / 2, 0);
  s.box(mats().white, w - 0.1, h - 0.45, 0.02, 0, FB + (h - 0.45) / 2 + 0.12, d / 2 - 0.3);
  const shelves = [0.3, 0.7, 1.1, 1.45];
  for (const ly of shelves) { s.box(mm.steel, w - 0.1, 0.015, d - 0.15, 0, FB + ly, 0.02); bottleRow(s, -w / 2 + 0.06, w / 2 - 0.06, FB + ly + 0.01, 0.02, d - 0.2, R, ly < 0.5); }
  s.box(mm.tube, 0.02, h - 0.5, 0.02, -w / 2 + 0.06, FB + h / 2 - 0.05, d / 2 - 0.04);
  s.plane(mm.glass, w - 0.08, h - 0.45, 0, FB + h / 2 - 0.1, d / 2 + 0.012);
  s.box(mm.black, 0.03, h - 0.45, 0.04, -w / 2 + 0.04, FB + h / 2 - 0.1, d / 2 + 0.01); s.box(mm.black, 0.03, h - 0.45, 0.04, w / 2 - 0.04, FB + h / 2 - 0.1, d / 2 + 0.01);
  s.cyl(mm.chrome, 0.012, 0.012, 0.5, w / 2 - 0.08, FB + 1.1, d / 2 + 0.05, 0, 0, 0, 6);
  const tex = ftex('tb-coolhead-' + brand, 256, 80, (c, cw, ch) => { c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.fillStyle = fg; c.fillRect(0, ch - 8, cw, 4); brushText(c, name, cw / 2, ch * 0.45, { font: 'bold #px Lobster, Rubik, system-ui', px: 50, maxW: cw * 0.9, fill: fg, rough: 0 }); }, false);
  s.plane(glowM(tex, 0.8), w - 0.06, 0.24, 0, FB + h - 0.16, d / 2 + 0.004);
}
// congelador horizontal de tapa de cristal
function freezerK(K, x, z, ry, w, labelTex, fill, R) {
  const mm = mats(), s = K.sub(x, 0, z, 0, ry), d = 0.7, h = 0.85;
  s.rbox(mm.white, w, h, d, 0.04, 0, FB + h / 2, 0);
  s.box(paint(0x2a8ad8, 0.4), w - 0.1, 0.02, d - 0.1, 0, FB + h - 0.25, 0);
  if (fill) fill(s, FB + h - 0.24, w - 0.14, d - 0.14);
  s.box(mm.glass, w - 0.06, 0.02, d - 0.06, 0, FB + h + 0.01, 0);
  s.box(mm.alum, w, 0.03, 0.04, 0, FB + h + 0.02, 0); s.box(mm.alum, w, 0.03, 0.03, 0, FB + h + 0.02, d / 2 - 0.02); s.box(mm.alum, w, 0.03, 0.03, 0, FB + h + 0.02, -d / 2 + 0.02);
  if (labelTex) s.plane(texM(labelTex, { roughness: 0.4 }), w * 0.8, 0.4, 0, FB + 0.45, d / 2 + 0.004);
  s.box(mm.black, w - 0.1, 0.06, d - 0.1, 0, FB + 0.03, 0);
}

// =====================================================================================
// Negocios
// =====================================================================================
const KIND = {};
const floorFor = (lvl, a, b, c) => [a, b, c][lvl - 1];
// diseño estándar de rótulo: fondo, emblema a la izquierda, nombre, subtítulo y teléfono
function signDraw(o) {
  return (c, w, h, lvl) => {
    const R = rng(o.name + lvl);
    const g = c.createLinearGradient(0, 0, 0, h); o.bg.forEach((cc, i) => g.addColorStop(i / Math.max(1, o.bg.length - 1), cc));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (o.pattern) o.pattern(c, w, h);
    c.strokeStyle = o.border; c.lineWidth = h * 0.06; c.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
    c.strokeStyle = o.border2 ?? 'rgba(255,255,255,0.6)'; c.lineWidth = h * 0.015; c.strokeRect(h * 0.12, h * 0.12, w - h * 0.24, h - h * 0.24);
    const ex = h * 0.72;
    emblem(c, o.kind, ex, h / 2, h * 0.78, lvl === 3);
    emblem(c, o.kind, w - ex, h / 2, h * 0.78, lvl === 3);
    const tx = w / 2, tw = w - ex * 2 - h * 0.6;
    brushText(c, o.name, tx, h * (o.sub ? 0.4 : 0.52), { font: o.font, px: h * 0.5, maxW: tw, fill: o.fg, outline: o.outline, ow: 0.08, shadow: o.shadow, sh: 0.06, rough: lvl === 3 ? 0 : 0.5, seed: 3 });
    if (o.sub) brushText(c, o.sub, tx, h * 0.77, { font: o.subFont ?? 'bold #px Lobster, Rubik, system-ui', px: h * 0.24, maxW: tw * 0.8, fill: o.subFg ?? o.fg, outline: o.subOutline, ow: 0.06, rough: 0, seed: 4 });
    if (lvl === 3) { const sh = c.createLinearGradient(0, 0, 0, h); sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.5, 'rgba(255,255,255,0)'); c.fillStyle = sh; c.fillRect(0, 0, w, h * 0.5); }
  };
}
function bladeDraw(o) {
  return (c, w, h, lvl) => {
    c.fillStyle = o.bg; c.fillRect(0, 0, w, h);
    c.strokeStyle = o.border; c.lineWidth = w * 0.05; c.strokeRect(w * 0.04, w * 0.04, w - w * 0.08, h - w * 0.08);
    emblem(c, o.kind, w / 2, h * 0.4, w * 0.62, lvl === 3);
    brushText(c, o.text, w / 2, h * 0.84, { font: o.font ?? '800 #px Rubik, system-ui', px: h * 0.16, maxW: w * 0.84, fill: o.fg, rough: 0 });
  };
}

// ---------------------------------------------------------------- TORTILLERÍA
KIND.tortilleria = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const o = {
    paint: '#f2c14e', paint1: '#dcc088', trim: '#2f7a3a', band: '#2f7a3a', band1: '#5a7a52', stripes: [[0.85, 0.93, '#c8281e']],
    openings: [{ x0: -5.0, x1: 1.3, y0: 0, y1: 2.75, type: 'open' }, { x0: 2.5, x1: 3.7, y0: 0, y1: 2.3, type: 'door' }, { x0: 4.3, x1: 5.3, y0: 1.2, y1: 2.3, type: 'win' }],
    doorC: 0x2f5a3a, mufaX: 1.95, numX: 3.1,
    floorM: floorFor(lvl, mm.concrete, mm.tileCream, mm.terrazzo), floorS: lvl === 1 ? 0.5 : 1 / 0.6,
    wainscot: lvl > 1 ? mm.azulejo : null, inWall: 0xf2ecd8,
    awning: ['#2f7a3a', '#f2efe6'], awnings: [{ x0: -5.1, x1: 1.4, text: 'TORTILLAS DE MAÍZ · MASA · TOTOPOS' }],
    terrace: true, sconces: [-5.5, 1.9, 5.55],
    art(F, lvl) {
      if (lvl === 1) {
        F.text('TORTILLERÍA', -0.3, 3.95, { size: 0.78, maxW: 8.4, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#c8281e', outline: '#1f5a2a', ow: 0.07, shadow: 'rgba(0,0,0,0.45)', sh: 0.05, seed: 2 });
        F.text('La Guadalupana', 3.6, 3.33, { size: 0.36, maxW: 3.6, font: 'bold #px Lobster, Rubik, system-ui', fill: '#1f5a2a', seed: 5 });
        F.text('1 KG $22', 3.3, 2.75, { size: 0.3, maxW: 2.2, font: '800 #px Rubik, system-ui', fill: '#c8281e', seed: 7 });
      }
      F.text(lvl === 1 ? 'MASA · TOTOPOS' : 'Desde 1978', 4.8, lvl === 1 ? 0.45 : 0.45, { size: 0.22, maxW: 1.8, font: '800 #px Rubik, system-ui', fill: '#f2efe6', seed: 9 });
      if (lvl === 2) { F.c.save(); emblem(F.c, 'tortilleria', F.X(3.9), F.Y(2.85), F.S(0.6)); F.c.restore(); }
    },
    sideArt(F, lvl) {
      if (lvl === 1) { F.text('SE HACEN TAMALES', 0, 2.2, { size: 0.4, maxW: 6, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#c8281e', seed: 11 }); F.text('Pedidos aquí', 0, 1.6, { size: 0.3, maxW: 4, font: 'bold #px Lobster, Rubik, system-ui', fill: '#1f5a2a', seed: 12 }); }
      else { F.rect(-3.5, 1.2, 3.5, 3.4, '#2f7a3a'); F.text('TORTILLERÍA', 0, 2.65, { size: 0.7, maxW: 6.6, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#f2c14e', outline: '#1a1a1a', ow: 0.05 }); F.text('La Guadalupana', 0, 1.75, { size: 0.45, maxW: 5, font: 'bold #px Lobster, Rubik, system-ui', fill: '#ffffff' }); }
    },
    sign: { x: -0.3, y: 3.95, w: 8.9, h: 1.0, draw: signDraw({ kind: 'tortilleria', name: 'TORTILLERÍA', sub: 'La Guadalupana', bg: ['#fff4d0', '#f2c14e'], border: '#2f7a3a', fg: '#c8281e', outline: '#1f5a2a', shadow: 'rgba(0,0,0,0.35)', font: '#px "Alfa Slab One", Rubik, system-ui', subFg: '#1f5a2a' }), bulbs: false },
    neon: { text: '¡Calientitas!', col: '#ffb030', x: 3.8, y: 2.82, w: 2.6, h: 0.62 },
    blade: { x: HW - 0.35, y: 2.95, w: 0.8, h: 0.95, draw: bladeDraw({ kind: 'tortilleria', bg: '#f2efe6', border: '#2f7a3a', fg: '#c8281e', text: 'TORTILLAS' }) },
  };
  shell(ctx, o);
  signage(ctx, o);
  // ---------- interior ----------
  // mostrador al frente con báscula y papel
  const ctrM = lvl === 1 ? mm.steel : paint(0x2f7a3a, 0.5);
  const ctr = counterK(K, -1.9, -3.05, 0, 5.4, 0.7, 1.05, ctrM, lvl === 1 ? mm.steel : mm.tileCream, { panelM: lvl > 1 ? mm.azulejo : null });
  colBox(g, cols, 5.5, 1.1, 0.8, -1.9, 0.55, -3.05);
  const top = FB + 1.05;
  // báscula
  const sc = K.sub(-0.9, top, -3.0);
  sc.rbox(mm.white, 0.36, 0.1, 0.34, 0.03, 0, 0.05, 0);
  sc.rbox(mm.steel, 0.4, 0.02, 0.38, 0.005, 0, 0.11, 0);
  sc.rbox(mm.white, 0.3, 0.2, 0.08, 0.02, 0, 0.3, -0.2, -0.25);
  sc.plane(lvl === 3 ? glowM(canvasTex('tb-scale3', 128, 48, (c, w, h) => { c.fillStyle = '#081208'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff3a2a'; c.font = 'bold 34px monospace'; c.fillText('1.000', 8, 36); }), 1.2) : texM(canvasTex('tb-scale', 128, 64, (c, w, h) => { c.fillStyle = '#f8f4e8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1a1a1a'; c.beginPath(); c.arc(64, 64, 50, PI, TAU); c.stroke(); for (let i = 0; i <= 20; i++) { const a = PI + i / 20 * PI; c.beginPath(); c.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); c.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); c.stroke(); } c.strokeStyle = '#c8281e'; c.lineWidth = 2; c.beginPath(); c.moveTo(64, 62); c.lineTo(90, 22); c.stroke(); })), 0.24, 0.12, 0, 0.3, -0.155, -0.25);
  // papel de estraza y tortillas envueltas
  for (let i = 0; i < 14; i++) K.box(paint(i % 2 ? 0xc8a878 : 0xbf9c6a, 0.95), 0.42, 0.006, 0.36, -2.0 + (i % 3) * 0.004, top + 0.004 + i * 0.006, -3.0, 0, 0.02 * i, 0);
  for (let k = 0; k < 3; k++) { K.rbox(paint(0xc8a878, 0.95), 0.26, 0.09, 0.26, 0.04, -2.9 + k * 0.32, top + 0.045, -2.95, 0, k * 0.4, 0); }
  for (let i = 0; i < 12; i++) K.cyl(paint(0xeed8a0, 0.9), 0.14, 0.14, 0.008, -3.8, top + 0.005 + i * 0.009, -3.05, 0, 0, 0, 20);
  K.lathe(C.wood(0xb88a4a), [[0, 0], [0.18, 0], [0.24, 0.12], [0.25, 0.13]], -3.8, top, -3.05, 16);
  if (lvl > 1) registerK(K, 0.2, top, -3.1, PI + 0.3);
  K.plane(texM(handSign(['1 kg $22', '½ kg $11'], { bg: '#f2efe6', fg: '#c8281e', accent: '#1f5a2a' })), 0.5, 0.36, -4.4, top + 0.3, -2.72, 0, 0.1);
  K.box(mm.steel, 0.02, 0.3, 0.02, -4.4, top + 0.12, -2.73);
  // máquina tortilladora con banda
  const tm = K.sub(-2.0, 0, -5.8);
  const steel = mm.steel, dark = metal(0x4a4c4e, 0.5);
  for (const [a, b] of [[-1.7, -0.4], [1.7, -0.4], [-1.7, 0.4], [1.7, 0.4]]) tm.box(dark, 0.07, 0.8, 0.07, a, FB + 0.4, b);
  tm.rbox(steel, 3.6, 0.12, 0.9, 0.02, 0, FB + 0.86, 0);
  // horno de tres pisos
  tm.rbox(steel, 2.2, 0.55, 0.92, 0.03, -0.55, FB + 1.2, 0);
  for (let i = 0; i < 3; i++) tm.box(emissive(0xff7a1a, 1.8), 1.9, 0.03, 0.02, -0.55, FB + 1.04 + i * 0.13, 0.465);
  for (let i = 0; i < 8; i++) tm.box(dark, 0.03, 0.46, 0.02, -1.5 + i * 0.27, FB + 1.2, 0.47);
  tm.box(steel, 2.3, 0.04, 0.95, -0.55, FB + 1.49, 0);
  // tolva con masa, rodillos y cortador
  tm.box(steel, 0.7, 0.5, 0.8, 1.2, FB + 1.17, 0);
  tm.lathe(steel, [[0.2, 0], [0.45, 0.45], [0.47, 0.47]], 1.25, FB + 1.42, 0, 4, 0, PI / 4);
  tm.sph(paint(0xe8d8a8, 0.95), 0.3, 1.25, FB + 1.72, 0, 1.1, 0.45, 1, 14);
  for (const zz of [-0.15, 0.15]) tm.cyl(mm.chrome, 0.08, 0.08, 0.75, 0.82, FB + 1.1 + (zz > 0 ? 0.08 : 0), 0, PI / 2, 0, 0, 16);
  // banda con tortillas saliendo
  tm.box(paint(0x3a3a3a, 0.7), 3.3, 0.02, 0.62, -0.1, FB + 0.935, 0);
  for (let i = 0; i < 18; i++) tm.cyl(paint(0xeed8a0, 0.9), 0.07, 0.07, 0.006, 0.6 - i * 0.16, FB + 0.95, (i % 3 - 1) * 0.18, 0, 0, 0, 14);
  tm.rbox(steel, 0.5, 0.18, 0.7, 0.02, -2.0, FB + 0.82, 0);
  for (let i = 0; i < 20; i++) tm.cyl(paint(0xeed8a0, 0.9), 0.075, 0.075, 0.006, -2.0 + (i % 2) * 0.01, FB + 0.92 + i * 0.007, 0, 0, 0, 0, 14);
  // campana y chimenea
  tm.lathe(steel, [[0.9, 0], [0.9, 0.05], [0.3, 0.45], [0.2, 0.5]], -0.55, FB + 2.2, 0, 4, 0, PI / 4);
  tm.cyl(steel, 0.18, 0.18, 1.1, -0.55, FB + 3.05, 0, 0, 0, 0, 12);
  tm.box(paint(0xc8281e, 0.5), 0.12, 0.1, 0.12, 1.2, FB + 1.05, 0.46);
  tm.tube(paint(0xf2c230, 0.5), [[-1.7, FB + 1.1, -0.4], [-2.2, FB + 0.5, -0.8], [-2.8, FB + 0.1, -1.0]], 0.012, 8, 5);
  colBox(g, cols, 4.2, 1.4, 1.2, -2.0, 0.7, -5.8);
  // tina con masa, costales de maíz, molino
  K.lathe(mm.blue, [[0, 0], [0.35, 0], [0.42, 0.45], [0.44, 0.46], [0.41, 0.46], [0.34, 0.02]], 1.9, FB, -6.2, 20);
  K.sph(paint(0xe8d8a8, 0.95), 0.36, 1.9, FB + 0.38, -6.2, 1, 0.3, 1, 14);
  for (let i = 0; i < 5; i++) { K.rbox(paint(0xe8e0c8, 1), 0.5, 0.28, 0.8, 0.12, 3.2 + (i % 2) * 0.55, FB + 0.14 + (i / 2 | 0) * 0.27, -11.4, 0, (R() - 0.5) * 0.3, 0); }
  K.plane(texM(handSign(['MAÍZ BLANCO', '50 kg'], { bg: '#e8e0c8', fg: '#2f7a3a', accent: '#c8281e', font: '800 #px Rubik, system-ui' })), 0.4, 0.3, 3.2, FB + 0.18, -11.0 + 0.01, 0);
  const ml = K.sub(4.5, 0, -8.0);
  ml.rbox(paint(0x3a6a8a, 0.4), 0.6, 0.9, 0.6, 0.04, 0, FB + 0.45, 0);
  ml.cyl(mm.steel, 0.25, 0.3, 0.3, 0, FB + 1.05, 0, 0, 0, 0, 16);
  ml.lathe(mm.steel, [[0.1, 0], [0.3, 0.25], [0.32, 0.27]], 0, FB + 1.2, 0, 16);
  ml.cyl(mm.black, 0.18, 0.18, 0.3, 0.35, FB + 0.5, 0, 0, 0, PI / 2, 14);
  colBox(g, cols, 0.7, 1.4, 0.7, 4.5, 0.7, -8.0);
  // repisa trasera, altar, calendario, reloj, luces
  shelfUnit(K, -3.2, -12.05, 0, 2.2, 1.9, 0.4, [0.4, 0.9, 1.4], (s, ly) => { for (let i = 0; i < 6; i++) s.box(paint(i % 2 ? 0xc8a878 : 0xf2efe6, 0.95), 0.3, 0.12, 0.3, -0.8 + i * 0.32, FB + ly + 0.075, 0); }, R, mm.darkWood);
  altarK(K, 0.4, 1.75, -12.25, 0);
  posterK(K, 1.6, 1.9, -12.28, 0.5, 0.7, calendarTex('Tortillería La Guadalupana'));
  clockK(K, -0.8, 2.6, -12.28, 0);
  for (const x of [-3.4, 0, 3.4]) for (const z of [-4.5, -8.5]) lvl === 1 && x !== 0 ? bareBulb(K, x, ctx.H1, z, 0.4) : fluo(K, x, ctx.H1 - 0.03, z);
  if (lvl === 1) fanK(K, 0.5, -4.6, 2.5);
  // ---------- banqueta ----------
  const basket = paint(0xc8a060, 0.95);
  triciclo(K, lvl === 3 ? -5.2 : -4.8, -0.9, lvl === 1 ? 0.3 : 0, basket);
  colBox(g, cols, 2.0, 1.2, 1.2, lvl === 3 ? -5.2 : -4.8, 0.6, -0.9);
  if (lvl === 1) {
    K.plane(texM(handSign(['HAY TORTILLAS', 'calientitas'])), 0.7, 0.5, 2.2, 1.1, -1.94, 0, 0, 0.05);
    const b = trashBagMesh(7, 0x141414, 0.8); b.position.set(4.9, 0, -1.4); g.add(b);
  } else {
    aFrame(K, g, cols, 2.2, -1.0, -0.3, handSign(['Tortillas', '1 kg $22', 'Masa · Totopos'], { bg: '#1c1c1a', fg: '#f2c14e', accent: '#ffffff', w: 256, h: 380 }));
    const tc = trashCan(0x2f7a3a, 'BASURA'); tc.position.set(4.6, 0, -1.3); g.add(tc); colBox(g, cols, 0.6, 1, 0.6, 4.6, 0.5, -1.3);
  }
  if (lvl === 3) { for (const x of [-2.6, 0.4]) planter(g, K, x, 0, -0.45, 1.1, 40 + x * 3, 'leafy'); colBox(g, cols, 3.6, 0.8, 0.5, -1.1, 0.4, -0.45); }
  return new THREE.Vector3(-1.9, 0, -1.2);
};
function calendarTex(title) {
  return ftex('tb-cal-' + title, 256, 360, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h * 0.55); g.addColorStop(0, '#f2a040'); g.addColorStop(1, '#c83a2a'); c.fillStyle = g; c.fillRect(0, 0, w, h * 0.55);
    c.fillStyle = '#2a1a3a'; c.beginPath(); c.moveTo(0, h * 0.55); for (let x = 0; x <= w; x += 16) c.lineTo(x, h * 0.4 + Math.sin(x * 0.05) * 20); c.lineTo(w, h * 0.55); c.fill();
    c.fillStyle = '#f2e0a0'; c.beginPath(); c.arc(w * 0.7, h * 0.2, 26, 0, TAU); c.fill();
    c.fillStyle = '#f8f6f0'; c.fillRect(0, h * 0.55, w, h * 0.45);
    c.fillStyle = '#1a1a1a'; c.font = 'bold 18px Rubik, system-ui'; c.textAlign = 'center'; c.fillText(title, w / 2, h * 0.61);
    c.font = 'bold 14px Rubik, system-ui'; c.fillStyle = '#c8281e'; c.fillText('SEPTIEMBRE', w / 2, h * 0.67);
    c.fillStyle = '#333'; c.font = '11px Rubik, system-ui';
    for (let i = 0; i < 30; i++) c.fillText(String(i + 1), 24 + (i % 7) * 34, h * 0.73 + (i / 7 | 0) * 18);
  }, false);
}

// =====================================================================================
// API
// =====================================================================================
export const BUSINESS_KINDS = ['tortilleria', 'taqueria', 'farmacia', 'panaderia', 'gimnasio', 'abarrotes', 'barberia', 'lavanderia', 'paleteria', 'arcade'];
export function buildBusiness(kind, level = 1) {
  const lvl = Math.max(1, Math.min(3, Math.round(level) || 1));
  if (!KIND[kind]) kind = 'tortilleria';
  const g = new THREE.Group(); g.name = 'negocio-' + kind + '-' + lvl;
  const K = new Kit(), cols = [];
  const ctx = { g, K, cols, lvl, R: rng(kind + ':' + lvl), kind };
  const door = KIND[kind](ctx) ?? new THREE.Vector3(0, 0, -1);
  K.build(g);
  g.updateMatrixWorld(true);
  return { group: g, colliders: cols, door };
}

// =====================================================================================
// Piezas específicas: pan, trompo, maquinitas, lavadoras, sillón de barbero, carrito...
// =====================================================================================
const conchaTex = () => canvasTex('tb-concha', 384, 128, (c) => {
  const cols = [['#f4ead8', '#d8c4a0'], ['#f2b0c4', '#d8889c'], ['#6a3a1a', '#4a2410']];
  cols.forEach(([a, b], i) => {
    const x0 = i * 128; c.fillStyle = a; c.fillRect(x0, 0, 128, 128);
    c.strokeStyle = b; c.lineWidth = 3;
    for (let k = -8; k < 16; k++) { c.beginPath(); c.moveTo(x0 + k * 16, 0); c.lineTo(x0 + k * 16 + 128, 128); c.stroke(); c.beginPath(); c.moveTo(x0 + k * 16 + 128, 0); c.lineTo(x0 + k * 16, 128); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.15)'; for (let k = 0; k < 200; k++) c.fillRect(x0 + Math.random() * 128, Math.random() * 128, 2, 2);
  });
});
function breadTray(K, x, y, z, w, d, kind, R) {
  const mm = mats();
  K.box(mm.alum, w, 0.012, d, x, y + 0.006, z);
  for (const s of [-1, 1]) { K.box(mm.alum, w, 0.03, 0.01, x, y + 0.02, z + s * d / 2); K.box(mm.alum, 0.01, 0.03, d, x + s * w / 2, y + 0.02, z); }
  const pan = mat(0xc8843a, { roughness: 0.65 }), pan2 = mat(0xe0a860, { roughness: 0.7 }), cm = mat(0xffffff, { map: conchaTex(), roughness: 0.8 });
  const nx = Math.max(1, Math.floor(w / 0.13)), nz = Math.max(1, Math.floor(d / 0.13));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const px = x - w / 2 + (i + 0.5) * w / nx + (R() - 0.5) * 0.02, pz = z - d / 2 + (j + 0.5) * d / nz + (R() - 0.5) * 0.02, yy = y + 0.012;
    if (kind === 'concha') { K.cyl(pan, 0.05, 0.052, 0.025, px, yy + 0.012, pz, 0, 0, 0, 12); const gg = new THREE.SphereGeometry(0.052, 12, 6, 0, TAU, 0, PI / 2); cellUV(gg, (R() * 3) | 0, 3, 1); K.geo(cm, gg, px, yy + 0.024, pz, 0, R() * 3, 0, 1, 0.65, 1); }
    else if (kind === 'cuerno') K.tor(pan, 0.035, 0.022, px, yy + 0.02, pz, PI / 2, 0, R() * 3, PI * 1.2, 10, 6);
    else if (kind === 'bolillo') { K.sph(pan2, 0.055, px, yy + 0.025, pz, 1.3, 0.55, 0.7, 10); K.box(mat(0xf2d8a0, { roughness: 0.8 }), 0.06, 0.01, 0.012, px, yy + 0.054, pz); }
    else if (kind === 'dona') { K.tor(pan, 0.03, 0.02, px, yy + 0.02, pz, PI / 2, 0, 0, TAU, 12, 6); K.tor(R() < 0.5 ? mat(0x4a2410, { roughness: 0.3 }) : mat(0xf2b0c4, { roughness: 0.3 }), 0.03, 0.017, px, yy + 0.028, pz, PI / 2, 0, 0, TAU, 12, 6); }
    else if (kind === 'oreja') K.cyl(mat(0xd8984a, { roughness: 0.5, env: true, envI: 0.3 }), 0.055, 0.055, 0.015, px, yy + 0.008, pz, 0, 0, 0, 12);
    else K.cyl(pan2, 0.04, 0.045, 0.03, px, yy + 0.015, pz, 0, 0, 0, 10);
  }
}
const meatTex = () => canvasTex('tb-meat', 128, 256, (c, w, h) => {
  const R = rng(77); c.fillStyle = '#b8481e'; c.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 6) { c.fillStyle = `rgba(${R() < 0.5 ? '90,20,5' : '230,120,50'},${0.3 + R() * 0.4})`; c.fillRect(0, y, w, 2 + R() * 3); }
  for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(30,10,0,${R() * 0.5})`; c.fillRect(R() * w, R() * h, 3 + R() * 8, 2); }
}, true);
function trompo(K, x, z, lvl) {
  const mm = mats(), s = K.sub(x, FB, z), mt = mat(0xffffff, { map: meatTex(), roughness: 0.55, env: true, envI: 0.2 });
  s.cyl(mm.steel, 0.28, 0.3, 0.05, 0, 1.05, 0, 0, 0, 0, 20);
  s.cyl(mm.steel, 0.015, 0.015, 1.15, 0, 1.6, 0, 0, 0, 0, 8);
  const prof = [[0, 0], [0.16, 0], [0.2, 0.08], [0.24, 0.3], [0.26, 0.5], [0.24, 0.62], [0.17, 0.7], [0.08, 0.74], [0, 0.75]];
  const gg = new THREE.LatheGeometry(prof.map(([a, b]) => new THREE.Vector2(a, b)), 24); const p = gg.attributes.position;
  for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getZ(i), p.getX(i)), k = 1 + 0.06 * Math.sin(a * 7 + p.getY(i) * 30); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
  gg.computeVertexNormals(); s.geo(mt, gg, 0, 1.08, 0);
  // piña
  const pm = mat(0xd8a020, { map: canvasTex('tb-pina', 64, 64, (c, w) => { c.fillStyle = '#c8901a'; c.fillRect(0, 0, w, w); c.strokeStyle = '#6a4a10'; c.lineWidth = 2; for (let i = -64; i < 128; i += 10) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 64, 64); c.stroke(); c.beginPath(); c.moveTo(i + 64, 0); c.lineTo(i, 64); c.stroke(); } }, true), roughness: 0.7 });
  s.sph(pm, 0.1, 0, 1.92, 0, 1, 1.3, 1, 12);
  for (let i = 0; i < 7; i++) s.cone(mm.green, 0.025, 0.22, Math.cos(i) * 0.03, 2.12, Math.sin(i) * 0.03, Math.cos(i * 2) * 0.4, 0, Math.sin(i * 2) * 0.4, 6);
  // quemador vertical
  s.rbox(mm.steel, 0.55, 0.85, 0.12, 0.02, 0, 1.5, -0.42);
  for (let i = 0; i < 5; i++) s.box(emissive(0xff5a10, lvl === 1 ? 1.4 : 2.2), 0.4, 0.04, 0.02, 0, 1.2 + i * 0.15, -0.355);
  s.cyl(mm.steel, 0.02, 0.02, 0.3, 0.1, 0.9, -0.3, 0.4, 0, 0, 6);
}
const screenAtlas = () => canvasTex('tb-screens', 512, 128, (c) => {
  const R = rng(81);
  for (let i = 0; i < 4; i++) {
    const x0 = i * 128;
    const bgs = ['#05051a', '#001a10', '#1a0520', '#000000']; c.fillStyle = bgs[i]; c.fillRect(x0, 0, 128, 128);
    if (i === 0) { for (let k = 0; k < 30; k++) { c.fillStyle = '#fff'; c.fillRect(x0 + R() * 128, R() * 128, 1, 1); } c.fillStyle = '#3af2ff'; c.fillRect(x0 + 58, 100, 12, 8); c.fillStyle = '#7aff3a'; for (let k = 0; k < 6; k++) for (let j = 0; j < 3; j++) c.fillRect(x0 + 14 + k * 18, 18 + j * 14, 10, 7); }
    if (i === 1) { c.fillStyle = '#2a2aff'; for (let k = 0; k < 8; k++) { c.fillRect(x0 + 8, 8 + k * 14, 112, 2); } c.fillStyle = '#f2f23a'; c.beginPath(); c.arc(x0 + 40, 50, 9, 0.5, TAU - 0.5); c.lineTo(x0 + 40, 50); c.fill(); for (let k = 0; k < 10; k++) { c.fillStyle = '#ffd8a0'; c.fillRect(x0 + 55 + k * 7, 49, 2, 2); } c.fillStyle = '#ff3a3a'; c.fillRect(x0 + 90, 80, 12, 12); }
    if (i === 2) { const g = c.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#ff6a3a'); g.addColorStop(1, '#3a0a5a'); c.fillStyle = g; c.fillRect(x0, 0, 128, 70); c.fillStyle = '#ff3ad0'; for (let k = 0; k < 9; k++) { c.fillRect(x0, 70 + k * 6, 128, 1); } for (let k = 0; k < 9; k++) { c.beginPath(); c.moveTo(x0 + 64, 70); c.lineTo(x0 + k * 16, 128); c.strokeStyle = '#ff3ad0'; c.stroke(); } c.fillStyle = '#3af2ff'; c.fillRect(x0 + 52, 100, 24, 10); }
    if (i === 3) { c.fillStyle = '#3a3a3a'; c.fillRect(x0, 90, 128, 38); c.fillStyle = '#ffd03a'; c.fillRect(x0 + 20, 60, 18, 30); c.fillStyle = '#ff3a3a'; c.fillRect(x0 + 85, 55, 20, 35); c.fillStyle = '#fff'; c.font = 'bold 14px monospace'; c.fillText('FIGHT!', x0 + 38, 30); c.fillStyle = '#ff3a3a'; c.fillRect(x0 + 6, 6, 50, 6); c.fillStyle = '#3aff3a'; c.fillRect(x0 + 72, 6, 50, 6); }
    c.fillStyle = 'rgba(255,255,255,0.06)'; for (let y = 0; y < 128; y += 2) c.fillRect(x0, y, 128, 1);
  }
});
function arcadeCab(K, x, z, ry, cell, lvl) {
  const mm = mats(), s = K.sub(x, FB, z, 0, ry), body = paint([0x1a1a2a, 0x2a0a3a, 0x0a2a3a, 0x3a0a0a][cell], 0.4);
  s.box(body, 0.66, 1.0, 0.75, 0, 0.5, 0);
  s.box(body, 0.66, 0.85, 0.42, 0, 1.42, -0.16);
  s.box(body, 0.66, 0.24, 0.5, 0, 1.92, -0.12);
  s.rbox(mm.black, 0.64, 0.12, 0.36, 0.02, 0, 1.06, 0.22, 0.25);
  s.sph(mm.red, 0.03, -0.12, 1.16, 0.26, 1, 1, 1, 8); s.cyl(mm.black, 0.008, 0.008, 0.06, -0.12, 1.12, 0.26, 0, 0, 0, 6);
  for (let i = 0; i < 3; i++) s.cyl([mm.yellow, mm.blue, mm.green][i], 0.022, 0.022, 0.02, 0.06 + i * 0.07, 1.13, 0.22 + (i % 2) * 0.03, 0.25, 0, 0, 10);
  const scr = new THREE.PlaneGeometry(0.56, 0.48); cellUV(scr, cell, 4, 1);
  s.geo(glowM(screenAtlas(), lvl === 1 ? 0.9 : 1.3), scr, 0, 1.45, 0.07, -0.2);
  s.box(mats().glassDark, 0.6, 0.52, 0.01, 0, 1.45, 0.08, -0.2);
  const mq = new THREE.PlaneGeometry(0.6, 0.18); cellUV(mq, cell, 4, 1);
  s.geo(glowM(marqueeTex(), 1.2), mq, 0, 1.92, 0.135);
  s.box(mm.black, 0.12, 0.08, 0.02, 0, 0.6, 0.38); s.box(emissive(0xff3a3a, 1.5), 0.04, 0.03, 0.01, 0, 0.62, 0.392);
  for (const sx of [-0.335, 0.335]) { const ag = new THREE.PlaneGeometry(0.7, 1.9); cellUV(ag, cell, 4, 1); s.geo(texM(sideArtTex(), { roughness: 0.5 }), ag, sx, 0.98, -0.02, 0, sx > 0 ? PI / 2 : -PI / 2); }
}
const marqueeTex = () => ftex('tb-marquee', 512, 64, (c) => { ['GALAXIA', 'COME-COME', 'NEÓN 84', 'PUÑOS'].forEach((t, i) => { const g = c.createLinearGradient(i * 128, 0, i * 128, 64); g.addColorStop(0, ['#3a1aff', '#f2c230', '#ff3ad0', '#ff3a1a'][i]); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(i * 128, 0, 128, 64); brushText(c, t, i * 128 + 64, 32, { font: 'bold #px Bungee, Rubik, system-ui', px: 30, maxW: 116, fill: '#fff', outline: '#000', ow: 0.08, rough: 0 }); }); }, false);
const sideArtTex = () => canvasTex('tb-sideart', 512, 256, (c) => { [['#3a1aff', '#3af2ff'], ['#f2c230', '#ff3a3a'], ['#ff3ad0', '#7a3aff'], ['#ff3a1a', '#f2c230']].forEach(([a, b], i) => { const x0 = i * 128; c.fillStyle = '#111'; c.fillRect(x0, 0, 128, 256); const g = c.createLinearGradient(x0, 0, x0 + 128, 256); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.beginPath(); c.moveTo(x0, 60); c.lineTo(x0 + 128, 20); c.lineTo(x0 + 128, 200); c.lineTo(x0, 240); c.fill(); c.fillStyle = 'rgba(0,0,0,0.4)'; for (let k = 0; k < 6; k++) c.fillRect(x0, 80 + k * 22, 128, 6); }); });
function washer(K, x, z, ry, dryer = false, y0 = FB) {
  const mm = mats(), s = K.sub(x, y0, z, 0, ry), h = dryer ? 0.9 : 0.95;
  s.rbox(dryer ? paint(0xe8ecee, 0.35) : mm.white, 0.68, h, 0.7, 0.03, 0, h / 2, 0);
  s.rbox(paint(0xc8ccd0, 0.4), 0.66, 0.16, 0.05, 0.02, 0, h - 0.1, 0.34);
  s.box(glowM(canvasTex('tb-wpanel', 64, 16, (c) => { c.fillStyle = '#081a10'; c.fillRect(0, 0, 64, 16); c.fillStyle = '#3aff7a'; c.font = 'bold 12px monospace'; c.fillText('0:34', 4, 12); }), 0.8), 0.12, 0.04, 0.01, 0.15, h - 0.1, 0.37);
  s.cyl(mm.chrome, 0.03, 0.03, 0.03, -0.18, h - 0.1, 0.37, PI / 2, 0, 0, 12);
  s.box(paint(0x8a8e90, 0.5), 0.1, 0.04, 0.02, -0.04, h - 0.1, 0.37);
  const dy = dryer ? h / 2 - 0.04 : h / 2 - 0.08;
  s.tor(mm.chrome, 0.21, 0.035, 0, dy, 0.36, 0, 0, 0, TAU, 28, 8);
  s.geo(mat(0xffffff, { map: drumTex(), roughness: 0.15, env: true, envI: 0.8, emissive: 0xffffff, emissiveMap: drumTex(), emissiveIntensity: 0.25 }), new THREE.CircleGeometry(0.2, 24), 0, dy, 0.35, 0, 0, Math.random() * 6);
  s.box(mm.black, 0.6, 0.04, 0.6, 0, 0.02, 0);
}
const drumTex = () => canvasTex('tb-drum', 128, 128, (c, w) => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, '#2a3a4a'); g.addColorStop(1, '#0a1218'); c.fillStyle = g; c.fillRect(0, 0, w, w); const R = rng(5); for (let i = 0; i < 9; i++) { c.fillStyle = ['#c83a3a', '#3a6ad8', '#f2f2e8', '#f2c230', '#3aa860'][i % 5]; c.globalAlpha = 0.7; c.beginPath(); c.ellipse(64 + (R() - 0.5) * 60, 64 + (R() - 0.2) * 60, 20, 10, R() * 3, 0, TAU); c.fill(); } c.globalAlpha = 0.5; c.fillStyle = '#bfe8ff'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(R() * w, R() * w * 0.6, 2 + R() * 6, 0, TAU); c.fill(); } c.globalAlpha = 1; });
function barberChair(K, x, z, ry, leather) {
  const mm = mats(), s = K.sub(x, FB, z, 0, ry);
  s.cyl(mm.chrome, 0.28, 0.3, 0.05, 0, 0.025, 0, 0, 0, 0, 24);
  s.cyl(mm.chrome, 0.07, 0.09, 0.35, 0, 0.22, 0, 0, 0, 0, 14);
  s.rbox(mm.chrome, 0.56, 0.06, 0.55, 0.02, 0, 0.42, 0);
  s.rbox(leather, 0.52, 0.14, 0.52, 0.05, 0, 0.52, 0);
  s.rbox(leather, 0.52, 0.66, 0.12, 0.05, 0, 0.88, -0.24, -0.15);
  s.rbox(leather, 0.26, 0.14, 0.1, 0.04, 0, 1.3, -0.31, -0.15);
  for (const sx of [-0.3, 0.3]) { s.rbox(leather, 0.08, 0.06, 0.45, 0.025, sx, 0.72, 0.02); s.cyl(mm.chrome, 0.015, 0.015, 0.2, sx, 0.62, 0.15, 0, 0, 0, 6); s.cyl(mm.chrome, 0.015, 0.015, 0.2, sx, 0.62, -0.15, 0, 0, 0, 6); }
  s.tube(mm.chrome, [[-0.15, 0.45, 0.25], [-0.15, 0.25, 0.42], [0.15, 0.25, 0.42], [0.15, 0.45, 0.25]], 0.015, 12, 6);
  s.rbox(mm.chrome, 0.36, 0.02, 0.12, 0.008, 0, 0.25, 0.45);
  s.box(mm.chrome, 0.04, 0.12, 0.02, 0.24, 0.2, 0.18, 0, 0, 0.5);
}
function barberPole(K, x, y, z) {
  const mm = mats();
  const tex = canvasTex('tb-pole', 64, 256, (c, w, h) => { c.fillStyle = '#f2f2f2'; c.fillRect(0, 0, w, h); const cols = ['#c8281e', '#1f3f9a']; for (let i = -8; i < 16; i++) { c.fillStyle = cols[(i + 16) % 2]; c.beginPath(); c.moveTo(0, i * 32); c.lineTo(w, i * 32 - 40); c.lineTo(w, i * 32 - 28); c.lineTo(0, i * 32 + 12); c.fill(); } }, true);
  K.cyl(glowM(tex, 0.5), 0.08, 0.08, 0.7, x, y, z + 0.18, 0, 0, 0, 20);
  K.cyl(glass(0xffffff, 0.25), 0.095, 0.095, 0.72, x, y, z + 0.18, 0, 0, 0, 20);
  for (const s of [-1, 1]) { K.cyl(mm.chrome, 0.11, 0.1, 0.06, x, y + s * 0.39, z + 0.18, 0, 0, 0, 20); K.sph(mm.chrome, 0.07, x, y + s * 0.45, z + 0.18, 1, 0.7, 1, 12); }
  K.box(mm.chrome, 0.04, 0.04, 0.18, x, y + 0.3, z + 0.08); K.box(mm.chrome, 0.04, 0.04, 0.18, x, y - 0.3, z + 0.08);
}
// vitrolero de agua fresca
function vitrolero(K, x, y, z, col, fill = 0.75) {
  const mm = mats();
  K.lathe(glass(0xeef6f8, 0.25), [[0, 0], [0.13, 0], [0.15, 0.05], [0.15, 0.38], [0.12, 0.44], [0.12, 0.46]], x, y, z, 20);
  K.lathe(mat(col, { roughness: 0.15, transparent: true, opacity: 0.85, env: true, envI: 0.5 }), [[0, 0.01], [0.13, 0.01], [0.14, 0.05], [0.14, 0.38 * fill], [0, 0.38 * fill]], x, y, z, 18);
  K.cyl(mm.red, 0.13, 0.13, 0.03, x, y + 0.47, z, 0, 0, 0, 16);
  K.cyl(mm.chrome, 0.012, 0.012, 0.06, x, y + 0.06, z + 0.16, PI / 2, 0, 0, 6);
}
function paletaRow(K, x0, x1, y, zc, depth, R) {
  const cols = [0xe8508a, 0xf2c230, 0x3ab84a, 0xf2efe6, 0x8a3ab8, 0xf07a1a, 0x6a3a1a, 0xd8342c].map(c => mat(c, { roughness: 0.4, env: true, envI: 0.3 }));
  const stick = mat(0xd8b888, { roughness: 0.8 });
  for (let x = x0 + 0.04; x < x1 - 0.04; x += 0.07) for (let z = zc - depth / 2 + 0.06; z < zc + depth / 2 - 0.04; z += 0.12) {
    const t = R() * 0.6 - 0.3;
    K.rbox(cols[(R() * 8) | 0], 0.055, 0.025, 0.1, 0.012, x, y + 0.015, z, 0, t, 0);
    K.box(stick, 0.012, 0.004, 0.06, x + Math.sin(t) * 0.07, y + 0.006, z + Math.cos(t) * 0.07, 0, t, 0);
  }
}

// ---------------------------------------------------------------- TAQUERÍA
KIND.taqueria = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const o = {
    paint: '#f4f0e4', paint1: '#e2d8c2', trim: '#c8281e', band: '#c8281e', band1: '#9a4a3a', stripes: [[0.85, 0.95, '#f2c230'], [0.95, 1.0, '#2f8a3a']],
    openings: [{ x0: -5.2, x1: 2.6, y0: 0, y1: 2.75, type: 'open' }, { x0: 3.3, x1: 5.3, y0: 0, y1: 2.6, type: 'glass', door: [3.55, 4.65], curtain: true }],
    mufaX: 2.95, numX: 4.9,
    floorM: floorFor(lvl, mm.concrete, mm.checker, mm.terrazzo), floorS: lvl === 1 ? 0.5 : 1 / 0.6,
    wainscot: lvl > 1 ? mm.azulejo : null, inWall: 0xf2d8a8,
    awning: ['#c8281e', '#f4f0e4'], awnings: [{ x0: -5.3, x1: 2.7, text: 'TACOS AL PASTOR · SUADERO · LONGANIZA · CAMPECHANOS' }],
    terrace: true, sconces: [-5.55, 3.0],
    art(F, lvl) {
      if (lvl === 1) {
        F.text('TAQUERÍA', -1.3, 3.98, { size: 0.75, maxW: 7, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#c8281e', outline: '#1a1a1a', ow: 0.06, shadow: 'rgba(0,0,0,0.35)', sh: 0.05 });
        F.text('El Güero', 3.3, 3.95, { size: 0.55, maxW: 3.6, font: 'bold #px Lobster, Rubik, system-ui', fill: '#2f8a3a', outline: '#ffffff', ow: 0.05 });
        F.text('PASTOR 5 x $50', 4.3, 3.15, { size: 0.24, maxW: 2.4, font: '800 #px Rubik, system-ui', fill: '#1a1a1a' });
        F.c.save(); emblem(F.c, 'taqueria', F.X(-5.0), F.Y(3.95), F.S(0.8)); F.c.restore();
      }
    },
    sideArt(F, lvl) {
      const t = lvl === 1 ? 0.75 : 1;
      F.c.save(); F.c.globalAlpha = t; emblem(F.c, 'taqueria', F.X(-2.6), F.Y(2.2), F.S(2.0)); F.c.restore();
      F.text('¡Tacos al Pastor!', 1.5, 2.6, { size: 0.55, maxW: 5.5, font: 'bold #px Lobster, Rubik, system-ui', fill: '#c8281e', outline: '#ffffff', ow: 0.05 });
      F.text('El Güero', 1.5, 1.7, { size: 0.5, maxW: 4, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#2f8a3a' });
    },
    sign: { x: -0.3, y: 3.95, w: 8.9, h: 1.0, draw: signDraw({ kind: 'taqueria', name: 'TAQUERÍA EL GÜERO', sub: 'Tacos al pastor desde 1985', bg: ['#c8281e', '#8a140e'], border: '#f2c230', fg: '#ffffff', outline: '#1a1a1a', shadow: 'rgba(0,0,0,0.5)', font: '#px "Alfa Slab One", Rubik, system-ui', subFg: '#f2c230' }), bulbs: true },
    neon: { text: 'TACOS', font: 'bold #px Bungee, Rubik, system-ui', col: '#ff3a3a', x: 4.3, y: 3.3, w: 1.5, h: 0.32 },
    blade: { x: HW - 0.35, y: 3.9, w: 0.8, h: 0.9, draw: bladeDraw({ kind: 'taqueria', bg: '#f2c230', border: '#c8281e', fg: '#c8281e', text: 'TACOS' }) },
  };
  shell(ctx, o);
  signage(ctx, o);
  // trompo al pastor junto a la calle y plancha
  trompo(K, -4.5, -2.85, lvl);
  const ctr = counterK(K, -1.6, -3.0, 0, 4.2, 0.75, 0.95, lvl === 1 ? mm.steel : paint(0xc8281e, 0.5), mm.steel, { panelM: lvl > 1 ? mm.azulejo : null });
  colBox(g, cols, 5.6, 2.2, 1.1, -2.4, 1.1, -3.0);
  const top = FB + 0.95;
  // plancha con comal y carnes
  K.rbox(metal(0x2a2a2a, 0.6), 1.6, 0.04, 0.6, 0.01, -2.4, top + 0.02, -3.05);
  K.lathe(metal(0x1a1a1a, 0.5), [[0, 0], [0.32, 0.02], [0.35, 0.08], [0.36, 0.09]], -2.4, top + 0.04, -3.05, 24);
  const carnes = [mat(0x6a2a10, { roughness: 0.5 }), mat(0x8a4a2a, { roughness: 0.5 }), mat(0xa83a1a, { roughness: 0.5 })];
  for (let i = 0; i < 40; i++) K.box(carnes[i % 3], 0.03, 0.02, 0.03, -2.4 + Math.cos(i) * 0.25 * R(), top + 0.08, -3.05 + Math.sin(i * 1.7) * 0.25 * R(), 0, R() * 3, 0);
  // tortillas, salsas, cebolla y cilantro, limones
  for (let i = 0; i < 10; i++) K.cyl(paint(0xeed8a0, 0.9), 0.07, 0.07, 0.006, -1.3, top + 0.01 + i * 0.008, -3.0, 0, 0, 0, 14);
  const salsaC = [0xc8281e, 0x2f8a3a, 0xe86a1a, 0x8a1a10];
  for (let i = 0; i < 4; i++) { const sx = -0.6 + i * 0.3; K.lathe(mat(0x5a5650, { roughness: 0.95 }), [[0, 0], [0.09, 0], [0.12, 0.08], [0.12, 0.09]], sx, top, -2.85, 14); K.cyl(mat(salsaC[i], { roughness: 0.3, env: true, envI: 0.3 }), 0.105, 0.105, 0.01, sx, top + 0.075, -2.85, 0, 0, 0, 14); K.cyl(mm.steel, 0.005, 0.005, 0.15, sx + 0.04, top + 0.12, -2.85, 0, 0, 0.5, 4); }
  for (const [x, c] of [[0.6, 0xf2f2e8], [0.9, 0x3a8a2a]]) { K.box(mm.steel, 0.25, 0.08, 0.2, x, top + 0.04, -3.0); for (let i = 0; i < 12; i++) K.box(paint(c, 0.8), 0.015, 0.015, 0.015, x - 0.08 + R() * 0.16, top + 0.085, -3.0 - 0.06 + R() * 0.12); }
  for (let i = 0; i < 9; i++) K.sph(paint(0x6ab83a, 0.4), 0.025, -3.4 + (i % 3) * 0.05, top + 0.02, -2.9 + (i / 3 | 0) * 0.05, 1, 0.8, 1, 8);
  // barra lateral con bancos y mesas
  K.rbox(mm.darkWood, 0.35, 0.05, 4.5, 0.01, -5.4, FB + 1.05, -6.6);
  for (let z = -5.0; z > -8.6; z -= 0.8) stoolK(K, -4.95, z, 0.72, mm.red);
  colBox(g, cols, 0.9, 1.1, 4.6, -5.15, 0.55, -6.6);
  const tm = lvl === 1 ? mm.red : paint(0xf2efe6, 0.45);
  for (const [x, z] of [[0.3, -6.2], [2.4, -6.2], [0.3, -8.6], [2.4, -8.6]]) { plasticTable(K, x, z, tm); for (let k = 0; k < 4; k++) plasticChair(K, x + Math.cos(k * PI / 2) * 0.6, z + Math.sin(k * PI / 2) * 0.6, -k * PI / 2 - PI / 2, tm); colBox(g, cols, 1.5, 1, 1.5, x, 0.5, z); }
  coolerK(K, 4.9, -10.0, -PI / 2, 0, R); coolerK(K, 4.9, -10.8, -PI / 2, 2, R);
  colBox(g, cols, 0.8, 2, 1.6, 4.9, 1, -10.4);
  // menú en la pared del fondo
  posterK(K, -1.0, 2.3, -12.28, 3.0, 1.4, boardTex('taco', 'Menú', [['Pastor', '$12'], ['Suadero', '$14'], ['Longaniza', '$14'], ['Campechano', '$15'], ['Gringa', '$45'], ['Volcán', '$25'], ['Agua de horchata', '$20'], ['Refresco', '$22']], { bg: lvl === 1 ? '#2a2a26' : '#c8281e', accent: '#f2c230' }), 0, lvl === 3 ? 0.4 : 0);
  K.rbox(mm.darkWood, 3.1, 1.5, 0.04, 0.01, -1.0, 2.3, -12.31);
  altarK(K, 2.4, 1.9, -12.25, 0); clockK(K, 3.5, 2.6, -12.28, 0);
  if (lvl > 1) tvK(K, 5.45, 2.5, -6.0, -PI / 2, screenAtlas());
  if (lvl === 3) papelPicado(K, [-5.5, 3.3, -4.5], [5.5, 3.3, -4.5], 0.25, R), papelPicado(K, [-5.5, 3.3, -8.5], [5.5, 3.3, -8.5], 0.25, R);
  for (const x of [-3.0, 1.0]) for (const z of [-5.0, -9.0]) fluo(K, x, ctx.H1 - 0.03, z);
  // banqueta: mesita y bancos de plástico (nv1), caballete (nv2+)
  if (lvl === 1) {
    plasticTable(K, -3.0, -0.9, mm.red); plasticChair(K, -3.7, -0.9, PI / 2, mm.red); plasticChair(K, -2.3, -0.9, -PI / 2, mm.red);
    colBox(g, cols, 2.0, 1, 1.0, -3.0, 0.5, -0.9);
    K.plane(texM(handSign(['HAY GRINGAS', 'y quesadillas'])), 0.6, 0.45, 2.95, 1.3, -1.89);
    const tcb = trashBagMesh(9, 0x1a1a1a, 0.85); tcb.position.set(5.2, 0, -1.5); g.add(tcb);
  } else {
    aFrame(K, g, cols, 1.6, -0.9, 0.3, handSign(['Pastor', '5 x $50', 'hoy'], { bg: '#1c1c1a', fg: '#f2c230', accent: '#ffffff', w: 256, h: 380 }));
    for (const x of [-4.2, -2.6]) { plasticTable(K, x, -0.95, paint(0xf2efe6, 0.45)); plasticChair(K, x - 0.55, -0.95, PI / 2, paint(0xf2efe6, 0.45)); plasticChair(K, x + 0.55, -0.95, -PI / 2, paint(0xf2efe6, 0.45)); }
    colBox(g, cols, 3.3, 1, 1.0, -3.4, 0.5, -0.95);
    const tc = trashCan(0xc8281e, 'BASURA'); tc.position.set(5.0, 0, -1.3); g.add(tc); colBox(g, cols, 0.6, 1, 0.6, 5.0, 0.5, -1.3);
  }
  if (lvl === 3) { planter(g, K, -5.3, 0, -0.5, 1.1, 51, 'agave'); planter(g, K, 0.0, 0, -0.5, 1.1, 52, 'leafy'); colBox(g, cols, 0.6, 0.8, 0.6, -5.3, 0.4, -0.5); colBox(g, cols, 0.6, 0.8, 0.6, 0, 0.4, -0.5); }
  return new THREE.Vector3(-0.8, 0, -1.0);
};

// ---------------------------------------------------------------- FARMACIA
KIND.farmacia = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const H1 = 3.6;
  const o = {
    storeys: 2, H1, H2: 2.7, paint: '#f4f4f0', paint1: '#dcdcd0', trim: '#1f9a4a', band: '#1f9a4a', band1: '#5a8a6a', stripes: [[0.85, 0.92, '#f2f2ea']],
    sidePaint: lvl === 1 ? '#c8c4b4' : '#e8efe8',
    openings: [{ x0: -5.2, x1: 3.0, y0: 0, y1: 2.85, type: 'glass', door: [-1.2, 0.6] }, { x0: 3.7, x1: 5.0, y0: 0, y1: 2.4, type: 'door' }],
    upWin: [{ x0: -4.8, x1: -2.4, y0: 4.6, y1: 5.9 }, { x0: -0.8, x1: 1.6, y0: 4.6, y1: 5.9 }],
    doorC: 0x4a5a5a, grillWhite: true, mufaX: 3.35, numX: 4.35, tinacoX: 3.4,
    floorM: floorFor(lvl, mm.tileCream, mm.terrazzo, mm.terrazzo), inWall: 0xf4f6f2,
    awning: ['#1f9a4a', '#f4f4f0'], awnings: [{ x0: -5.3, x1: 3.1, y: 3.25, text: 'MEDICAMENTOS · GENÉRICOS · PERFUMERÍA' }],
    sconces: [-5.55, 3.35],
    art(F, lvl) {
      if (lvl === 1) {
        F.text('FARMACIA', -1.1, 3.98, { size: 0.62, maxW: 6, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#1f9a4a', shadow: 'rgba(0,0,0,0.3)', sh: 0.04 });
        F.text('del Barrio', 2.2, 3.95, { size: 0.42, maxW: 2.6, font: 'bold #px Lobster, Rubik, system-ui', fill: '#1f9a4a' });
        F.c.save(); emblem(F.c, 'farmacia', F.X(4.3), F.Y(5.2), F.S(1.2)); F.c.restore();
        F.text('CONSULTA MÉDICA', -1.6, 6.5, { size: 0.3, maxW: 5, font: '800 #px Rubik, system-ui', fill: '#1f9a4a' });
      }
    },
    sideArt(F, lvl) {
      F.c.save(); emblem(F.c, 'farmacia', F.X(-2.5), F.Y(4.8), F.S(1.8)); F.c.restore();
      F.text('FARMACIA', 1.6, 5.1, { size: 0.6, maxW: 5, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#1f9a4a' });
      F.text('Consulta $40 · Genéricos', 1.6, 4.4, { size: 0.32, maxW: 5, font: '800 #px Rubik, system-ui', fill: '#2a2a2a' });
    },
    sign: { x: -0.4, y: 3.95, w: 9.4, h: 0.85, draw: signDraw({ kind: 'farmacia', name: 'FARMACIA DEL BARRIO', sub: 'Genéricos · Consultorio · Abierto 24 h', bg: ['#ffffff', '#e8f4ec'], border: '#1f9a4a', fg: '#1f9a4a', shadow: 'rgba(0,0,0,0.15)', font: '800 #px Rubik, system-ui', subFg: '#2a2a2a', subFont: '600 #px Rubik, system-ui' }) },
    neon: { text: '24 HORAS', font: 'bold #px Bungee, Rubik, system-ui', col: '#3aff7a', x: 3.0, y: 6.45, w: 2.6, h: 0.45 },
  };
  shell(ctx, o);
  signage(ctx, o);
  // gran cruz verde en la fachada (pintada / caja / LED)
  if (lvl >= 2) {
    const ct = canvasTex('tb-cross' + lvl, 256, 256, (c, w) => { c.fillStyle = lvl === 3 ? '#062a12' : '#ffffff'; c.fillRect(0, 0, w, w); emblem(c, 'farmacia', w / 2, w / 2, w * 0.95, lvl === 3); });
    const cm = lvl === 3 ? glowM(ct, 1.2) : texM(ct, { roughness: 0.4 });
    const cs = K.sub(4.25, 5.25, FZ + 0.12);
    const sh = new THREE.Shape(); const a = 0.25, b = 0.72;
    sh.moveTo(-a, -b); sh.lineTo(a, -b); sh.lineTo(a, -a); sh.lineTo(b, -a); sh.lineTo(b, a); sh.lineTo(a, a); sh.lineTo(a, b); sh.lineTo(-a, b); sh.lineTo(-a, a); sh.lineTo(-b, a); sh.lineTo(-b, -a); sh.lineTo(-a, -a); sh.closePath();
    cs.ext(paint(0x1a6a3a, 0.4), sh, 0.18, 0, 0, 0, 0, 0, 0, 0.02);
    const fgeo = new THREE.ShapeGeometry(sh); projUV(fgeo, (x) => (x + b) / (2 * b), (x, y) => (y + b) / (2 * b)); cs.geo(cm, fgeo, 0, 0, 0.115);
  }
  // interior: anaqueles en muros, mostradores de cristal, consultorio
  shelfUnit(K, -5.35, -7.2, PI / 2, 8.0, 2.3, 0.4, [0.3, 0.75, 1.2, 1.65, 2.05], 'pack', R);
  shelfUnit(K, 5.35, -8.0, -PI / 2, 6.4, 2.3, 0.4, [0.3, 0.75, 1.2, 1.65, 2.05], 'pack', R);
  shelfUnit(K, -1.6, -12.05, 0, 5.6, 2.3, 0.4, [0.3, 0.75, 1.2, 1.65, 2.05], 'pack', R);
  colBox(g, cols, 0.5, 2.4, 8.0, -5.35, 1.2, -7.2); colBox(g, cols, 0.5, 2.4, 6.4, 5.35, 1.2, -8.0);
  const gcFill = (s, y, w, d) => packRow(s, -w / 2 + 0.05, w / 2 - 0.05, y + 0.01, 0, d * 0.7, R, 0.06, 0.16);
  glassCounter(K, -2.6, -9.4, 0, 2.4, 0.6, paint(0x1f9a4a, 0.5), gcFill, R);
  glassCounter(K, 0.3, -9.4, 0, 2.4, 0.6, paint(0x1f9a4a, 0.5), gcFill, R);
  colBox(g, cols, 5.4, 1.1, 0.7, -1.15, 0.55, -9.4);
  registerK(K, 0.9, FB + 1.0, -9.4, PI);
  for (let i = 0; i < 3; i++) K.lathe(mm.bottleClear, [[0, 0], [0.04, 0], [0.04, 0.12], [0.02, 0.15], [0, 0.15]], -1.8 + i * 0.12, FB + 1.0, -9.35, 10);
  // puerta de consultorio
  K.box(paint(0xe8e4dc, 0.6), 0.04, 2.1, 1.0, 5.56, FB + 1.05, -3.9);
  K.plane(texM(handSign(['CONSULTORIO', 'Dr. Ramírez · $40'], { bg: '#ffffff', fg: '#1f9a4a', accent: '#2a2a2a', font: '800 #px Rubik, system-ui', w: 256, h: 96 })), 0.7, 0.26, 5.53, FB + 2.3, -3.9, 0, -PI / 2);
  K.cyl(mm.chrome, 0.015, 0.015, 0.12, 5.5, FB + 1.0, -3.55, 0, 0, PI / 2, 6);
  // báscula de pie y silla de espera
  const bs = K.sub(-4.4, 0, -3.3);
  bs.rbox(mm.white, 0.4, 0.08, 0.45, 0.02, 0, FB + 0.04, 0); bs.cyl(mm.chrome, 0.025, 0.025, 1.1, 0, FB + 0.6, -0.18, 0, 0, 0, 8);
  bs.cyl(mm.white, 0.16, 0.16, 0.08, 0, FB + 1.2, -0.18, PI / 2, 0, 0, 20); bs.plane(texM(meterTex()), 0.2, 0.2, 0, FB + 1.2, -0.135);
  colBox(g, cols, 0.5, 1.3, 0.5, -4.4, 0.65, -3.4);
  for (let i = 0; i < 3; i++) plasticChair(K, 2.0 + i * 0.5, -3.0, PI, mm.white);
  colBox(g, cols, 1.6, 1, 0.6, 2.5, 0.5, -3.0);
  posterK(K, 4.2, 2.1, -12.28, 0.7, 1.0, artPoster('VACÚNATE', '#1f6fb8', '#ffffff', 'farm1'));
  for (const x of [-3.2, 0, 3.2]) for (const z of [-4.6, -8.2, -11.0]) fluo(K, x, H1 - 0.03, z);
  // banqueta
  if (lvl === 1) { K.plane(texM(handSign(['SE APLICAN', 'INYECCIONES'], { bg: '#ffffff', fg: '#c8281e', accent: '#1f9a4a' })), 0.6, 0.45, 2.0, 1.4, FZ - 0.11); }
  else { aFrame(K, g, cols, 2.0, -0.9, -0.25, handSign(['Consulta', '$40', 'sin cita'], { bg: '#1f9a4a', fg: '#ffffff', accent: '#f2f2ea', w: 256, h: 380 })); const tc = trashCan(0x1f9a4a, 'BASURA'); tc.position.set(5.0, 0, -1.3); g.add(tc); colBox(g, cols, 0.6, 1, 0.6, 5.0, 0.5, -1.3); }
  if (lvl === 3) { for (const x of [-4.6, -2.4, 1.8]) planter(g, K, x, 0, -0.5, 1.0, 60 + x, 'leafy', 'barro'); colBox(g, cols, 7, 0.8, 0.5, -1.4, 0.4, -0.5); const bench = K.sub(3.8, 0, -0.6); bench.rbox(mm.planks, 1.4, 0.06, 0.4, 0.01, 0, 0.45, 0); for (const sx of [-0.6, 0.6]) bench.box(mm.iron, 0.05, 0.45, 0.38, sx, 0.225, 0); }
  return new THREE.Vector3(-0.3, 0, -1.0);
};
function artPoster(title, bg, fg, key) {
  return ftex('tb-poster-' + key, 256, 360, (c, w, h) => {
    const R = rng(key); c.fillStyle = bg; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(255,255,255,${0.08 + R() * 0.1})`; c.beginPath(); c.arc(R() * w, R() * h * 0.7, 20 + R() * 60, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.beginPath(); c.ellipse(w / 2, h * 0.55, w * 0.25, h * 0.2, 0, 0, TAU); c.fill();
    brushText(c, title, w / 2, h * 0.86, { font: '800 #px Rubik, system-ui', px: 44, maxW: w * 0.9, fill: fg, rough: 0 });
  }, false);
}

// ---------------------------------------------------------------- PANADERÍA
KIND.panaderia = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const o = {
    paint: '#e8a07e', paint1: '#d4ae96', trim: '#7a3a1a', band: '#7a3a1a', band1: '#8a6a5a', stripes: [[0.85, 0.92, '#f2d8a0']],
    openings: [{ x0: -5.0, x1: -2.4, y0: 0.6, y1: 3.0, type: 'win', arch: true }, { x0: -1.3, x1: 1.3, y0: 0, y1: 3.0, type: 'glass', door: [-1.0, 1.0], arch: true, curtain: false }, { x0: 2.4, x1: 5.0, y0: 0.6, y1: 3.0, type: 'win', arch: true }],
    mufaX: 5.45, numX: 1.75, par: 1.0,
    floorM: floorFor(lvl, mm.tileCream, mm.terrazzo, mm.checker), inWall: 0xf6e8d0, wainscot: lvl > 1 ? mm.planks : null, wainscotH: 1.0,
    terrace: true, sconces: [-1.85, 1.85, -5.5, 5.5],
    art(F, lvl) {
      if (lvl === 1) {
        F.text('PANADERÍA', 0, 4.2, { size: 0.62, maxW: 7, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#7a3a1a', shadow: 'rgba(255,255,255,0.4)', sh: 0.04 });
        F.text('La Espiga', 0, 3.55, { size: 0.42, maxW: 4, font: 'bold #px Lobster, Rubik, system-ui', fill: '#f4ead8', outline: '#7a3a1a', ow: 0.06 });
        F.text('PAN CALIENTE 6 PM', -3.7, 0.4, { size: 0.2, maxW: 2.4, font: '800 #px Rubik, system-ui', fill: '#f2d8a0' });
      }
      // marco de cantera alrededor de los arcos
      for (const h of [{ x0: -5.0, x1: -2.4 }, { x0: -1.3, x1: 1.3 }, { x0: 2.4, x1: 5.0 }]) { const cx = (h.x0 + h.x1) / 2, r = (h.x1 - h.x0) / 2 + 0.22; F.c.strokeStyle = lvl === 1 ? '#a89a88' : '#d8c8a8'; F.c.lineWidth = F.S(0.12); F.c.beginPath(); F.c.arc(F.X(cx), F.Y(3.0 - r + 0.22), F.S(r), PI, 0); F.c.stroke(); }
    },
    sideArt(F, lvl) {
      F.c.save(); emblem(F.c, 'panaderia', F.X(-2.8), F.Y(2.4), F.S(1.8)); F.c.restore();
      F.text('Pan de dulce', 1.2, 2.8, { size: 0.55, maxW: 5, font: 'bold #px Lobster, Rubik, system-ui', fill: '#7a3a1a' });
      F.text('Conchas · Cuernos · Bolillo', 1.2, 2.05, { size: 0.3, maxW: 5, font: '800 #px Rubik, system-ui', fill: '#4a2a1a' });
    },
    sign: { x: 0, y: 4.15, w: 7.2, h: 0.85, draw: signDraw({ kind: 'panaderia', name: 'Panadería La Espiga', bg: ['#f6ead0', '#e8cfa0'], border: '#7a3a1a', fg: '#7a3a1a', shadow: 'rgba(0,0,0,0.2)', font: 'bold #px Lobster, Rubik, system-ui' }), frameM: C.wood(0x5a3218) },
    neon: { text: 'Pan caliente', col: '#ffb040', x: 0, y: 3.35, w: 2.4, h: 0.38, back: false, z: FZ + 0.32 },
    blade: { x: HW - 0.9, y: 3.0, w: 0.8, h: 0.8, draw: bladeDraw({ kind: 'panaderia', bg: '#f6ead0', border: '#7a3a1a', fg: '#7a3a1a', text: 'PAN' }) },
  };
  const info = shell(ctx, o);
  signage(ctx, o);
  // tejadillo de barro con vigas (nv 2 y 3)
  if (lvl >= 2) {
    const teja = mat(0xb8582e, { roughness: 0.8 }), y0 = 3.55;
    for (let x = -5.6; x <= 5.6; x += 0.24) { K.cyl(teja, 0.11, 0.11, 0.95, x, y0 - 0.05, FZ + 0.45, PI / 2 + 0.25, 0, 0, 8, false); }
    K.box(mats().darkWood, 11.5, 0.06, 0.95, 0, y0 - 0.15, FZ + 0.45, 0.25);
    for (let x = -5.5; x <= 5.5; x += 1.1) K.box(mats().darkWood, 0.12, 0.14, 1.05, x, y0 - 0.26, FZ + 0.5, 0.25);
  }
  // interior: repisas con charolas de pan, mesa central, vitrina de pasteles, horno
  const kinds = ['concha', 'cuerno', 'bolillo', 'dona', 'oreja', 'polvoron'];
  for (const [x, ry, w] of [[-5.3, PI / 2, 7.0], [5.3, -PI / 2, 5.6]]) {
    shelfUnit(K, x, x < 0 ? -7.0 : -7.7, ry, w, 2.0, 0.55, [0.35, 0.8, 1.25, 1.7], (s, ly, room, ww, d) => { for (let i = 0; i < Math.floor(ww / 0.65); i++) breadTray(s, -ww / 2 + 0.36 + i * 0.65, FB + ly + 0.015, 0.02, 0.6, 0.42, kinds[(i + Math.round(ly * 10)) % 6], R); }, R, mm.darkWood);
    colBox(g, cols, 0.6, 2.1, w, x, 1.05, x < 0 ? -7.0 : -7.7);
  }
  const tb = K.sub(0, 0, -6.4);
  tb.rbox(mm.darkWood, 2.0, 0.08, 1.0, 0.02, 0, FB + 0.86, 0);
  for (const [a, b] of [[-0.9, -0.42], [0.9, -0.42], [-0.9, 0.42], [0.9, 0.42]]) tb.box(mm.darkWood, 0.08, 0.86, 0.08, a, FB + 0.43, b);
  for (let i = 0; i < 12; i++) tb.box(mm.alum, 0.42, 0.012, 0.32, -0.6, FB + 0.91 + i * 0.014, 0);
  for (let i = 0; i < 6; i++) { tb.box(mm.chrome, 0.02, 0.02, 0.25, 0.1 + i * 0.07, FB + 0.92, 0.1, 0, 0.2, 0); tb.box(mm.chrome, 0.02, 0.02, 0.25, 0.1 + i * 0.07, FB + 0.93, 0.1, 0, 0.25, 0); }
  breadTray(tb, 0.55, FB + 0.9, -0.2, 0.6, 0.4, 'concha', R);
  colBox(g, cols, 2.1, 1, 1.1, 0, 0.5, -6.4);
  const cakeFill = (s, y, w, d) => { for (let i = 0; i < 4; i++) { const x = -w / 2 + 0.3 + i * (w - 0.6) / 3; s.cyl(paint([0xf4eee0, 0xf2b0c4, 0x6a3a1a, 0xf2e0a0][i], 0.5), 0.13, 0.13, 0.12, x, y + 0.07, 0, 0, 0, 0, 20); s.tor(paint(0xffffff, 0.4), 0.12, 0.015, x, y + 0.13, 0, PI / 2, 0, 0, TAU, 20, 5); s.sph(mats().red, 0.02, x, y + 0.15, 0, 1, 1, 1, 6); } };
  glassCounter(K, 0.6, -9.8, 0, 3.4, 0.7, C.wood(0x6a3a1a), cakeFill, R);
  colBox(g, cols, 3.5, 1.1, 0.8, 0.6, 0.55, -9.8);
  registerK(K, -0.7, FB + 1.0, -9.8, PI);
  // horno de ladrillo al fondo con boca encendida
  const ov = K.sub(-3.0, 0, -11.5);
  ov.wbox(mm.brick, 2.2, 1.9, 1.3, 0, FB + 0.95, 0, 1);
  ov.hemi(mm.brick, 0.9, 0, FB + 1.9, 0, 1.2, 0.5, 0.7);
  ov.geo(emissive(0xff7a20, 2), new THREE.CircleGeometry(0.4, 20, 0, PI), 0, FB + 0.75, 0.66);
  ov.tor(mm.iron, 0.42, 0.04, 0, FB + 0.75, 0.66, 0, 0, 0, PI, 16, 6);
  ov.box(mm.iron, 0.9, 0.05, 0.1, 0, FB + 0.74, 0.68);
  ov.cyl(mm.iron, 0.025, 0.025, 1.8, 1.3, FB + 0.9, 0.5, 0.2, 0, 0.15, 6); ov.box(mm.iron, 0.3, 0.02, 0.35, 1.45, FB + 0.06, 0.82, 0.2, 0, 0.15);
  colBox(g, cols, 2.3, 2.4, 1.4, -3.0, 1.2, -11.5);
  // carro de charolas
  const cr = K.sub(3.6, 0, -11.2);
  for (const [a, b] of [[-0.35, -0.3], [0.35, -0.3], [-0.35, 0.3], [0.35, 0.3]]) cr.box(mm.alum, 0.03, 1.7, 0.03, a, FB + 0.9, b);
  for (let i = 0; i < 9; i++) breadTray(cr, 0, FB + 0.25 + i * 0.17, 0, 0.66, 0.56, kinds[i % 6], R);
  colBox(g, cols, 0.8, 1.9, 0.7, 3.6, 0.95, -11.2);
  for (const x of [-3, 0, 3]) for (const z of [-4.5, -8.5]) lvl === 1 ? bareBulb(K, x, ctx.H1, z, 0.6) : (lvl === 2 ? fluo(K, x, ctx.H1 - 0.03, z) : pendant(K, x, ctx.H1, z));
  clockK(K, 2.0, 2.7, -12.28, 0);
  // banqueta
  if (lvl === 1) { triciclo(K, 3.8, -0.9, 0, paint(0xc8a060, 0.95)); colBox(g, cols, 2.0, 1.2, 1.2, 3.8, 0.6, -0.9); K.plane(texM(handSign(['BOLILLO', '$3'])), 0.5, 0.36, -3.7, 2.0, FZ - 0.17); }
  else {
    aFrame(K, g, cols, -3.4, -0.9, 0.2, handSign(['Conchas', '$12', 'recién hechas'], { bg: '#3a2214', fg: '#f2d8a0', accent: '#ffffff', w: 256, h: 380 }));
    const bench = K.sub(3.6, 0, -0.7); bench.rbox(mm.planks, 1.6, 0.06, 0.42, 0.01, 0, 0.45, 0); bench.rbox(mm.planks, 1.6, 0.35, 0.05, 0.01, 0, 0.72, -0.2, -0.15); for (const sx of [-0.7, 0.7]) bench.box(mm.iron, 0.05, 0.45, 0.4, sx, 0.225, 0); colBox(g, cols, 1.7, 1, 0.6, 3.6, 0.5, -0.7);
  }
  if (lvl === 3) { for (const x of [-5.3, -1.75, 1.75]) planter(g, K, x, 0, -0.45, 1.0, 70 + x, x === -5.3 ? 'barrel' : 'leafy'); colBox(g, cols, 0.5, 0.8, 0.5, -5.3, 0.4, -0.45); colBox(g, cols, 0.5, 0.8, 0.5, -1.75, 0.4, -0.45); colBox(g, cols, 0.5, 0.8, 0.5, 1.75, 0.4, -0.45); }
  return new THREE.Vector3(0, 0, -1.0);
};
function pendant(K, x, y, z) {
  const mm = mats();
  K.cyl(mm.cable, 0.004, 0.004, 0.8, x, y - 0.4, z, 0, 0, 0, 4);
  K.lathe(paint(0x1f3a3a, 0.4), [[0.02, 0], [0.06, 0], [0.2, 0.18], [0.21, 0.2]], x, y - 1.0, z, 20, PI);
  K.sph(mm.bulb, 0.05, x, y - 1.15, z, 1, 1, 1, 10);
}

// ---------------------------------------------------------------- GIMNASIO
KIND.gimnasio = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const H1 = 3.6, up0 = H1 + 0.2;
  const o = {
    storeys: 2, H1, H2: 2.7, upperInterior: true, paint: '#3a3d40', paint1: '#6e6c66', trim: '#f07a1a', band: '#1a1a1a', stripes: [[0.85, 0.95, '#f07a1a']],
    sidePaint: lvl === 1 ? '#8a8680' : '#3a3d40', sidePainted: lvl > 1,
    openings: [{ x0: -5.2, x1: 5.0, y0: 0, y1: 2.85, type: 'glass', door: [-0.6, 0.9] }],
    upWin: [{ x0: -5.0, x1: -0.35, y0: 4.35, y1: 6.15, grill: false, flowers: false }, { x0: 0.35, x1: 5.0, y0: 4.35, y1: 6.15, grill: false, flowers: false }],
    mufaX: 5.45, numX: 1.4, tinacoX: 3.8,
    floorM: mm.rubberFloor, floorS: 1, upFloorM: mm.rubberFloor, inWall: lvl === 1 ? 0xd8d4c8 : 0x2a2c2e, ceilM: lvl === 1 ? mm.ceiling : paint(0x1a1a1c, 0.9),
    sconces: [-5.5, 5.5],
    art(F, lvl) {
      if (lvl === 1) { F.text('GYM TITÁN', 0, 3.9, { size: 0.55, maxW: 6, font: 'bold #px Bungee, Rubik, system-ui', fill: '#f07a1a', outline: '#1a1a1a', ow: 0.06 }); F.text('PESAS · BOX · ZUMBA', 0, 6.45, { size: 0.28, maxW: 6, font: '800 #px Rubik, system-ui', fill: '#f2efe6' }); }
      F.rect(-0.25, 4.2, 0.25, 6.3, lvl === 1 ? '#5a5650' : '#f07a1a');
    },
    sideArt(F, lvl) {
      F.c.save(); emblem(F.c, 'gimnasio', F.X(-2.6), F.Y(4.6), F.S(2.4)); F.c.restore();
      F.text('SIN DOLOR', 1.8, 5.3, { size: 0.6, maxW: 5, font: 'bold #px Bungee, Rubik, system-ui', fill: lvl === 1 ? '#f2efe6' : '#f07a1a' });
      F.text('NO HAY GLORIA', 1.8, 4.5, { size: 0.5, maxW: 5, font: 'bold #px Bungee, Rubik, system-ui', fill: '#f2efe6' });
      F.text('Inscripción GRATIS', 1.8, 3.6, { size: 0.3, maxW: 5, font: '800 #px Rubik, system-ui', fill: '#f2c230' });
    },
    sign: { x: 0, y: 3.85, w: 10.2, h: 0.75, draw: signDraw({ kind: 'gimnasio', name: 'GYM TITÁN', sub: 'Pesas · Box · Cardio · Zumba', bg: ['#1a1a1a', '#2a2c2e'], border: '#f07a1a', fg: '#f07a1a', outline: '#000000', font: 'bold #px Bungee, Rubik, system-ui', subFg: '#f2efe6', subFont: '800 #px Rubik, system-ui' }), glow: 0.8 },
    neon: { text: 'NO PAIN NO GAIN', font: 'bold #px Bungee, Rubik, system-ui', col: '#ff7a1a', x: 0, y: 6.5, w: 4.2, h: 0.42 },
    blade: { x: -HW + 0.35, y: 5.3, w: 0.8, h: 1.1, draw: bladeDraw({ kind: 'gimnasio', bg: '#1a1a1a', border: '#f07a1a', fg: '#f07a1a', text: 'GYM', font: 'bold #px Bungee, Rubik, system-ui' }) },
  };
  shell(ctx, o);
  signage(ctx, o);
  const plateM = mat(0x1a1a1a, { roughness: 0.6 }), barM = mm.chrome, orange = paint(0xf07a1a, 0.4);
  // pared de espejos a la izquierda (abajo y arriba)
  for (const y0 of [FB + 0.3, up0 + 0.3]) { K.plane(mm.mirror, 8.6, 1.9, -5.58, y0 + 0.95, -7.4, 0, PI / 2); K.box(mm.alum, 0.03, 0.04, 8.7, -5.57, y0, -7.4); }
  // rack de mancuernas
  const rk = K.sub(-4.9, 0, -7.4, 0, PI / 2);
  for (const ly of [0.45, 0.8]) { rk.box(mm.steel, 3.2, 0.04, 0.35, 0, FB + ly, 0, 0.25, 0, 0); for (let i = 0; i < 9; i++) { const x = -1.45 + i * 0.36, r = 0.05 + i * 0.008; rk.cyl(barM, 0.015, 0.015, 0.26, x, FB + ly + 0.07, 0, PI / 2, 0, 0, 6); for (const s of [-0.1, 0.1]) rk.cyl(plateM, r, r, 0.07, x, FB + ly + 0.07, s, PI / 2, 0, 0, 14); } }
  for (const x of [-1.6, 1.6]) rk.box(mm.iron, 0.06, 0.9, 0.4, x, FB + 0.45, 0);
  colBox(g, cols, 0.6, 1, 3.4, -4.9, 0.5, -7.4);
  // press de banca con barra y discos
  const bp = (KK, x, z, y0) => { const s = KK.sub(x, y0, z); s.rbox(paint(0x1a1a1a, 0.6), 0.32, 0.1, 1.2, 0.04, 0, 0.45, 0); for (const zz of [-0.45, 0.45]) s.box(mm.iron, 0.06, 0.42, 0.06, 0, 0.21, zz); for (const sx of [-0.55, 0.55]) { s.box(orange, 0.06, 1.2, 0.06, sx, 0.6, -0.55); s.box(mm.iron, 0.5, 0.05, 0.06, sx, 0.02, -0.55); } s.cyl(barM, 0.014, 0.014, 2.0, 0, 1.12, -0.55, 0, 0, PI / 2, 8); for (const sx of [-0.75, -0.69, 0.69, 0.75]) s.cyl(plateM, 0.22, 0.22, 0.05, sx, 1.12, -0.55, 0, 0, PI / 2, 20); };
  bp(K, -1.5, -7.0, FB); colBox(g, cols, 2.2, 1.3, 1.4, -1.5, 0.65, -7.1);
  // caminadoras frente al vidrio (nv2+), bicis (nv1)
  for (let i = 0; i < (lvl === 1 ? 2 : 4); i++) {
    const s = K.sub(-3.6 + i * 1.5, FB, -3.4, 0, PI);
    if (lvl === 1) { s.box(mm.iron, 0.08, 0.7, 0.08, 0, 0.35, 0.3); s.rbox(mm.black, 0.24, 0.07, 0.3, 0.03, 0, 0.92, 0.32); s.tor(mm.steel, 0.25, 0.04, 0, 0.3, -0.25, 0, PI / 2, 0, TAU, 20, 6); s.box(mm.iron, 0.08, 0.06, 1.0, 0, 0.05, 0); s.tube(mm.iron, [[0, 0.3, -0.25], [0, 0.95, -0.4], [0, 1.05, -0.5]], 0.025, 8, 6); }
    else { s.rbox(paint(0x2a2a2a, 0.5), 0.8, 0.18, 1.8, 0.05, 0, 0.09, 0); s.box(mm.rubber, 0.55, 0.02, 1.5, 0, 0.19, 0.05); for (const sx of [-0.36, 0.36]) s.tube(mm.steel, [[sx, 0.15, -0.7], [sx, 1.0, -0.8], [sx * 0.9, 1.25, -0.75]], 0.025, 8, 6); s.rbox(paint(0x1a1a1a, 0.4), 0.72, 0.32, 0.12, 0.03, 0, 1.32, -0.82, -0.6); s.plane(glowM(screenAtlas(), 0.8), 0.3, 0.15, 0, 1.36, -0.75, -0.6); }
  }
  colBox(g, cols, 6.6, 1.4, 1.9, -1.35, 0.7, -3.4);
  // recepción
  counterK(K, 3.6, -4.2, -PI / 2, 1.8, 0.6, 1.05, orange, mm.black);
  colBox(g, cols, 0.7, 1.1, 1.9, 3.6, 0.55, -4.2);
  registerK(K, 3.6, FB + 1.05, -4.5, -PI / 2);
  for (let i = 0; i < 3; i++) K.lathe(plastic([0x3a8ad8, 0xf07a1a, 0x3aa860][i]), [[0, 0], [0.04, 0], [0.04, 0.2], [0.02, 0.24], [0, 0.24]], 3.5, FB + 1.05, -3.6 - i * 0.1, 10);
  // rack de discos y sentadilla al fondo
  const sq = K.sub(2.2, FB, -10.5);
  for (const sx of [-0.6, 0.6]) for (const sz of [-0.5, 0.5]) sq.box(orange, 0.07, 2.3, 0.07, sx, 1.15, sz);
  sq.box(mm.iron, 1.3, 0.07, 0.07, 0, 2.3, -0.5); sq.box(mm.iron, 1.3, 0.07, 0.07, 0, 2.3, 0.5);
  sq.cyl(barM, 0.014, 0.014, 2.1, 0, 1.4, 0.5, 0, 0, PI / 2, 8);
  for (const sx of [-0.85, -0.79, 0.79, 0.85]) sq.cyl(plateM, 0.22, 0.22, 0.05, sx, 1.4, 0.5, 0, 0, PI / 2, 20);
  for (let i = 0; i < 6; i++) sq.cyl(i % 2 ? plateM : paint(0xc8281e, 0.5), 0.2 - i * 0.015, 0.2 - i * 0.015, 0.04, 1.4 + (i % 2) * 0.05, 0.25 + i * 0.05, -0.5 + (i % 3) * 0.04, 0, 0, 0, 18);
  colBox(g, cols, 1.5, 2.4, 1.2, 2.2, 1.2, -10.5);
  // sala de arriba: costales y bicis de spinning
  for (let i = 0; i < 3; i++) {
    const x = -3.8 + i * 1.6, z = -4.0;
    K.cyl(mm.iron, 0.006, 0.006, 0.6, x, roofY_(ctx) - 0.5, z, 0, 0, 0, 4);
    K.lathe(i === 1 ? paint(0xc8281e, 0.5) : paint(0x1a1a1a, 0.5), [[0, 0], [0.16, 0.02], [0.18, 0.1], [0.18, 0.95], [0.16, 1.02], [0, 1.03]], x, up0 + 0.55, z, 18);
  }
  for (let i = 0; i < 3; i++) { const s = K.sub(1.2 + i * 1.3, up0, -4.0, 0, PI); s.box(mm.iron, 0.08, 0.06, 1.0, 0, 0.05, 0); s.cyl(mm.steel, 0.22, 0.22, 0.06, 0, 0.35, -0.35, 0, 0, PI / 2, 18); s.tube(mm.iron, [[0, 0.1, 0.3], [0, 0.8, 0.25], [0, 0.95, 0.3]], 0.03, 8, 6); s.tube(mm.iron, [[0, 0.35, -0.35], [0, 0.9, -0.3], [0, 1.1, -0.4]], 0.03, 8, 6); s.rbox(mm.black, 0.18, 0.06, 0.28, 0.03, 0, 0.98, 0.3); s.cyl(mm.black, 0.02, 0.02, 0.45, 0, 1.12, -0.4, 0, 0, PI / 2, 6); }
  // ring de box (nv3)
  if (lvl === 3) { const rg = K.sub(2.5, up0, -9.0); rg.rbox(paint(0x1f3f9a, 0.6), 3.4, 0.4, 3.4, 0.05, 0, 0.2, 0); for (const [a, b] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) rg.cyl(paint(0xc8281e, 0.4), 0.05, 0.05, 1.4, a, 1.1, b, 0, 0, 0, 8); for (const y of [0.8, 1.1, 1.4]) for (const [a, b, c2, d] of [[-1.6, -1.6, 1.6, -1.6], [-1.6, 1.6, 1.6, 1.6], [-1.6, -1.6, -1.6, 1.6], [1.6, -1.6, 1.6, 1.6]]) rg.tube(mm.white, [[a, y, b], [c2, y, d]], 0.018, 2, 5); }
  for (const x of [-3.2, 0, 3.2]) for (const z of [-4.4, -8.4]) { fluo(K, x, ctx.H1 - 0.03, z, 1.22, PI / 2); fluo(K, x, roofY_(ctx) - 0.23, z, 1.22, PI / 2); }
  posterK(K, 4.5, 2.0, -12.28, 0.9, 1.25, artPoster('CLASES DE BOX', '#c8281e', '#ffffff', 'gym1'));
  posterK(K, 3.3, 2.0, -12.28, 0.9, 1.25, artPoster('ZUMBA 7 PM', '#7a3ab8', '#f2c230', 'gym2'));
  if (lvl > 1) aFrame(K, g, cols, 2.6, -0.9, -0.2, handSign(['Mensualidad', '$350', '¡Inscríbete!'], { bg: '#1a1a1a', fg: '#f07a1a', accent: '#ffffff', w: 256, h: 380 }));
  // rack de bicis (nv3)
  if (lvl === 3) { for (let i = 0; i < 4; i++) K.tor(mm.steel, 0.3, 0.025, -4.4 + i * 0.45, 0.3, -0.6, 0, PI / 2, 0, PI, 12, 5); colBox(g, cols, 1.8, 0.6, 0.3, -3.7, 0.3, -0.6); planter(g, K, 4.8, 0, -0.5, 1.2, 81, 'agave'); colBox(g, cols, 0.6, 0.8, 0.6, 4.8, 0.4, -0.5); }
  return new THREE.Vector3(0.15, 0, -1.0);
};
const roofY_ = (ctx) => ctx.roofY - 0.2;

// ---------------------------------------------------------------- ABARROTES
KIND.abarrotes = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const front = lvl === 3 ? { x0: -5.2, x1: 1.4, y0: 0, y1: 2.75, type: 'open' } : { x0: -5.2, x1: 1.4, y0: 0, y1: 2.75, type: 'reja', vx: -1.9, ventanilla: 1.0 };
  const o = {
    paint: '#b8141c', paint1: '#a4443c', trim: '#f2efe6', band: '#f2efe6', band1: '#cfc6b4', stripes: [[0.85, 0.9, '#1a1a1a']],
    openings: [front, { x0: 2.1, x1: 3.3, y0: 0, y1: 2.3, type: 'door' }, { x0: 3.9, x1: 5.3, y0: 1.0, y1: 2.3, type: 'win' }],
    doorC: 0x2a3a5a, mufaX: 1.75, numX: 2.7, tinacoX: -3.4,
    floorM: floorFor(lvl, mm.concrete, mm.tileCream, mm.terrazzo), floorS: lvl === 1 ? 0.5 : 1 / 0.6, inWall: 0xe8dcc0,
    awning: ['#b8141c', '#f2efe6'], awnings: [{ x0: -5.3, x1: 1.5, text: 'ABARROTES · CREMERÍA · VINOS · REFRESCOS' }],
    terrace: true, sconces: [-5.55, 1.75, 5.55],
    art(F, lvl) {
      // rótulo pintado de refresquera (siempre), más gastado en nv1
      F.rect(-5.9, 3.3, 5.9, 4.55, '#f2efe6');
      F.text('Chiva Cola', -3.3, 3.95, { size: 0.68, maxW: 4, font: 'bold #px Lobster, Rubik, system-ui', fill: '#b8141c', seed: 31 });
      F.text('ABARROTES', 1.2, 4.12, { size: 0.42, maxW: 4.6, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#1a1a1a' });
      F.text('"DON CHUY"', 1.2, 3.58, { size: 0.36, maxW: 4.6, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#b8141c' });
      F.text('Chiva Cola', 4.65, 3.95, { size: 0.42, maxW: 2.1, font: 'bold #px Lobster, Rubik, system-ui', fill: '#b8141c' });
      F.text('HAY HIELO', 4.6, 2.75, { size: 0.26, maxW: 1.8, font: '800 #px Rubik, system-ui', fill: '#f2efe6' });
      F.text('RECARGAS · PAGO DE LUZ', -2.0, 0.42, { size: 0.2, maxW: 5, font: '800 #px Rubik, system-ui', fill: '#b8141c' });
    },
    sideArt(F, lvl) {
      F.rect(-4.2, 0.9, 4.2, 3.6, '#f2efe6');
      F.text('Chiva Cola', 0, 2.7, { size: 1.0, maxW: 7, font: 'bold #px Lobster, Rubik, system-ui', fill: '#b8141c' });
      F.text('¡La de siempre, bien fría!', 0, 1.6, { size: 0.4, maxW: 7, font: '800 #px Rubik, system-ui', fill: '#1a1a1a' });
    },
    sign: lvl === 3 ? { x: -1.9, y: 3.92, w: 6.6, h: 1.0, draw: signDraw({ kind: 'abarrotes', name: 'ABARROTES DON CHUY', sub: 'Cremería · Vinos · Recargas', bg: ['#ffffff', '#f2efe6'], border: '#b8141c', fg: '#b8141c', outline: '#ffffff', font: '#px "Alfa Slab One", Rubik, system-ui', subFg: '#1a1a1a' }), bulbs: true } : null,
    neon: { text: 'Abierto', col: '#ff3a5a', x: 4.6, y: 2.75, w: 1.5, h: 0.42 },
    blade: { x: HW - 0.35, y: 3.9, w: 0.8, h: 0.9, draw: bladeDraw({ kind: 'abarrotes', bg: '#f2efe6', border: '#b8141c', fg: '#b8141c', text: 'ABARROTES' }) },
  };
  shell(ctx, o);
  signage(ctx, o);
  // nv2: letrero de lámina enmarcado sobre lo pintado
  if (lvl === 2) { K.rbox(paint(0x2a2a2a, 0.5), 3.4, 0.9, 0.08, 0.02, 1.2, 3.92, FZ + 0.05); K.plane(texM(ftex('tb-abar2', 512, 136, (c, w, h) => { c.fillStyle = '#f2efe6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8141c'; c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12); brushText(c, 'ABARROTES', w / 2, h * 0.38, { font: '#px "Alfa Slab One", Rubik, system-ui', px: 56, maxW: w * 0.85, fill: '#1a1a1a', rough: 0 }); brushText(c, 'DON CHUY', w / 2, h * 0.74, { font: '#px "Alfa Slab One", Rubik, system-ui', px: 40, maxW: w * 0.8, fill: '#b8141c', rough: 0 }); }, false)), 3.3, 0.82, 1.2, 3.92, FZ + 0.095); }
  // interior atiborrado
  shelfUnit(K, -5.35, -7.3, PI / 2, 9.4, 2.4, 0.42, [0.3, 0.7, 1.1, 1.5, 1.9], 'mixed', R, mm.steel);
  shelfUnit(K, 5.35, -8.3, -PI / 2, 7.4, 2.4, 0.42, [0.3, 0.7, 1.1, 1.5, 1.9], 'pack', R, mm.steel);
  shelfUnit(K, -0.6, -12.05, 0, 5.0, 2.4, 0.42, [0.3, 0.7, 1.1, 1.5, 1.9], 'mixed', R, mm.steel);
  colBox(g, cols, 0.5, 2.5, 9.4, -5.35, 1.25, -7.3); colBox(g, cols, 0.5, 2.5, 7.4, 5.35, 1.25, -8.3);
  // góndola central
  const gd = K.sub(-0.4, 0, -7.6, 0, PI / 2);
  for (const s of [-1, 1]) { const side = gd.sub(0, 0, s * 0.22, 0, s > 0 ? 0 : PI); shelfUnit(side, 0, 0, 0, 3.2, 1.5, 0.4, [0.25, 0.65, 1.05], 'pack', R, mm.steel); }
  colBox(g, cols, 1.0, 1.6, 3.3, -0.4, 0.8, -7.6);
  // mostrador con dulces en frascos y báscula
  counterK(K, -1.9, -3.4, 0, 3.6, 0.6, 1.0, paint(0xb8141c, 0.5), mm.glass.transparent ? mm.steel : mm.steel);
  colBox(g, cols, 3.7, 1.1, 0.7, -1.9, 0.55, -3.4);
  const top = FB + 1.0;
  const candy = [0xe8508a, 0xf2c230, 0x3ab84a, 0xc8281e, 0x8a3ab8, 0xf07a1a];
  for (let i = 0; i < 6; i++) { const x = -3.4 + i * 0.3; K.lathe(glass(0xf2f6f8, 0.3), [[0, 0], [0.09, 0], [0.1, 0.2], [0.07, 0.24], [0.07, 0.27]], x, top, -3.3, 14); for (let k = 0; k < 9; k++) K.sph(plastic(candy[(i + k) % 6]), 0.022, x + (R() - 0.5) * 0.1, top + 0.03 + (k / 3 | 0) * 0.04, -3.3 + (R() - 0.5) * 0.1, 1, 1, 1, 6); K.cyl(mm.red, 0.075, 0.075, 0.03, x, top + 0.28, -3.3, 0, 0, 0, 12); }
  registerK(K, -0.4, top, -3.4, PI);
  // tiras de papitas colgadas
  const chips = ftex('tb-chips', 256, 512, (c, w, h) => { const cols2 = ['#f2c230', '#c8281e', '#2a6ad8', '#3aa860', '#f07a1a', '#8a3ab8']; for (let i = 0; i < 6; i++) { const y = i * h / 6; const g2 = c.createLinearGradient(0, y, w, y); g2.addColorStop(0, cols2[i]); g2.addColorStop(0.5, '#ffffff'); g2.addColorStop(1, cols2[i]); c.fillStyle = cols2[i]; c.fillRect(8, y + 6, w - 16, h / 6 - 12); c.fillStyle = 'rgba(255,255,255,0.3)'; c.fillRect(8, y + 6, 30, h / 6 - 12); brushText(c, ['Papas Lupe', 'Chicharrín', 'Totopitos', 'Cacahuate', 'Churritos', 'Palomitas'][i], w / 2, y + h / 12, { font: '800 #px Rubik, system-ui', px: 34, maxW: w * 0.8, fill: '#1a1a1a', rough: 0 }); } c.fillStyle = '#888'; c.fillRect(w / 2 - 3, 0, 6, h); }, false);
  for (const x of [0.4, 0.75]) { K.plane(texM(chips, { transparent: true, side: DS }), 0.3, 1.5, x, 2.0, -3.15); K.box(mm.steel, 0.02, 0.02, 0.02, x, 2.77, -3.15); }
  // refrigeradores y congelador de helados
  coolerK(K, 4.9, -3.4, -PI / 2, 0, R); coolerK(K, 4.9, -4.2, -PI / 2, 3, R);
  colBox(g, cols, 0.8, 2.1, 1.6, 4.9, 1.05, -3.8);
  // piñata colgando
  const pn = K.sub(2.6, ctx.H1 - 0.9, -5.5);
  pn.sph(paint(0xf2c230, 0.8), 0.25, 0, 0, 0, 1, 1, 1, 12);
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, dir = new THREE.Vector3(Math.cos(a), Math.sin(a), 0); pn.cone(plastic([0xe8508a, 0x2fb0e8, 0x3ab84a, 0xf07a1a][i % 4]), 0.1, 0.55, dir.x * 0.42, dir.y * 0.42, 0, 0, 0, a - PI / 2, 10); }
  pn.cyl(mm.cable, 0.004, 0.004, 0.65, 0, 0.55, 0, 0, 0, 0, 4);
  for (let i = 0; i < 7; i++) pn.plane(mats().papel, 0.05, 0.4, Math.cos(i) * 0.1, -0.4, Math.sin(i) * 0.1, 0, i);
  for (const x of [-3, 0.5, 3.5]) for (const z of [-4.8, -9]) lvl === 1 ? bareBulb(K, x, ctx.H1, z, 0.5) : fluo(K, x, ctx.H1 - 0.03, z);
  posterK(K, 2.8, 2.2, -12.28, 1.0, 0.7, artPoster('RECARGAS', '#2a6ad8', '#ffffff', 'abr1'));
  // banqueta: congelador de hielo, cajas de refresco, banca
  freezerK(K, 4.6, -1.15, PI, 1.2, handSign(['HIELO'], { bg: '#2a8ad8', fg: '#ffffff', font: '800 #px Rubik, system-ui', w: 256, h: 96 }), null, R);
  colBox(g, cols, 1.3, 1, 0.8, 4.6, 0.5, -1.15);
  const crateM = plastic(0xc8281e, 0.5);
  for (let i = 0; i < (lvl === 1 ? 5 : 3); i++) { const cx = -4.6 + (i % 2) * 0.05, cy = 0.15 + i * 0.3; K.box(crateM, 0.5, 0.3, 0.35, cx, cy, -1.05 + (i % 2) * 0.02); for (let k = 0; k < 6; k++) K.cyl(mm.bottleClear, 0.03, 0.03, 0.26, cx - 0.17 + (k % 3) * 0.17, cy + 0.12, -1.13 + (k / 3 | 0) * 0.16, 0, 0, 0, 8); }
  colBox(g, cols, 0.6, 1.5, 0.5, -4.6, 0.75, -1.05);
  if (lvl === 1) { const b = trashBagMesh(11, 0x141414, 0.9); b.position.set(-3.6, 0, -1.4); g.add(b); K.plane(texM(handSign(['NO HAY FIADO'], { bg: '#f2efe6', fg: '#b8141c' })), 0.6, 0.4, -1.9, 2.0, FZ - 0.03); }
  else { const bench = K.sub(-1.9, 0, -0.75); bench.rbox(mm.planks, 1.6, 0.06, 0.42, 0.01, 0, 0.45, 0); for (const sx of [-0.7, 0.7]) bench.box(mm.iron, 0.05, 0.45, 0.4, sx, 0.225, 0); colBox(g, cols, 1.7, 0.6, 0.5, -1.9, 0.3, -0.75); }
  if (lvl === 3) { planter(g, K, 0.6, 0, -0.5, 1.0, 91, 'leafy'); colBox(g, cols, 0.5, 0.8, 0.5, 0.6, 0.4, -0.5); }
  return new THREE.Vector3(-1.9, 0, -1.4);
};

// ---------------------------------------------------------------- BARBERÍA
KIND.barberia = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const o = {
    paint: '#1f2a44', paint1: '#525a6c', trim: '#e8cf8a', trim1: '#b8a678', band: '#151515', stripes: [[0.85, 0.9, '#e8cf8a']],
    openings: [{ x0: -5.2, x1: 1.0, y0: 0, y1: 2.8, type: 'glass', door: [-0.3, 0.75] }, { x0: 2.0, x1: 5.2, y0: 0, y1: 2.6, type: 'door' }],
    doorC: 0x1a1a1a, mufaX: 1.5, numX: 4.6, grillWhite: false,
    floorM: mm.checker, floorS: 1 / 0.6, inWall: lvl === 1 ? 0xd8d0c0 : 0x2a3a4a, wainscot: lvl > 1 ? mm.planks : null, wainscotH: 1.1,
    awning: ['#1f2a44', '#f2efe6'], awnings: [{ x0: -5.3, x1: 1.1, text: 'CORTE · BARBA · NAVAJA' }],
    sconces: [-5.55, 1.45, 5.55],
    art(F, lvl) {
      if (lvl === 1) { F.text('BARBERÍA', -2.1, 3.98, { size: 0.6, maxW: 5.6, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#e8cf8a', shadow: 'rgba(0,0,0,0.5)', sh: 0.05 }); F.text('Corte $80', 3.6, 3.9, { size: 0.4, maxW: 3, font: 'bold #px Lobster, Rubik, system-ui', fill: '#f2efe6' }); }
      F.text('EST. 1962', -2.1, 0.45, { size: 0.2, maxW: 3, font: '800 #px Rubik, system-ui', fill: '#e8cf8a' });
    },
    sideArt(F, lvl) {
      F.c.save(); emblem(F.c, 'barberia', F.X(0), F.Y(3.0), F.S(2.4), true); F.c.restore();
      F.text('Barbería Clásica', 0, 1.7, { size: 0.55, maxW: 6, font: 'bold #px Lobster, Rubik, system-ui', fill: '#e8cf8a' });
    },
    sign: { x: -2.1, y: 3.95, w: 6.4, h: 1.0, draw: signDraw({ kind: 'barberia', name: 'BARBERÍA', sub: 'Clásica', bg: ['#1a2238', '#0e1424'], border: '#e8cf8a', border2: 'rgba(232,207,138,0.5)', fg: '#e8cf8a', shadow: 'rgba(0,0,0,0.6)', font: '#px "Alfa Slab One", Rubik, system-ui', subFg: '#f2efe6' }), frameM: C.gold() },
    neon: { text: 'Barber Shop', col: '#3af2ff', x: 3.6, y: 3.9, w: 3.0, h: 0.7 },
    blade: null,
  };
  shell(ctx, o);
  signage(ctx, o);
  barberPole(K, 1.5, 2.0, FZ);
  if (lvl >= 2) barberPole(K, -5.5, 2.0, FZ);
  // espejos, repisa y sillones frente a la pared izquierda
  K.plane(mm.mirror, 6.0, 1.3, -5.58, FB + 1.75, -7.2, 0, PI / 2);
  K.box(lvl === 3 ? C.gold() : mm.darkWood, 0.04, 1.4, 6.1, -5.57, FB + 1.75, -7.2);
  K.rbox(mm.marble ?? C.marble(), 0.4, 0.05, 6.0, 0.01, -5.4, FB + 1.0, -7.2);
  K.rbox(mm.darkWood, 0.36, 0.9, 6.0, 0.02, -5.42, FB + 0.5, -7.2);
  for (let i = 0; i < 18; i++) K.lathe(plastic([0x1a1a1a, 0xc8a04a, 0x3a6ad8, 0xf2efe6, 0x8a1a10][i % 5]), [[0, 0], [0.03, 0], [0.03, 0.12], [0.015, 0.15], [0, 0.16]], -5.45, FB + 1.025, -4.6 - i * 0.3 - R() * 0.05, 8);
  const leather = lvl === 1 ? mat(0x6a1a1a, { roughness: 0.55 }) : mat(0x8a1a14, { roughness: 0.35, env: true, envI: 0.4 });
  for (let i = 0; i < 3; i++) { barberChair(K, -4.5, -5.0 - i * 2.0, -PI / 2, leather); colBox(g, cols, 0.9, 1.4, 0.9, -4.5, 0.7, -5.0 - i * 2.0); }
  // sala de espera
  const bench = K.sub(4.9, 0, -7.0, 0, -PI / 2);
  bench.rbox(leather, 3.0, 0.12, 0.5, 0.04, 0, FB + 0.45, 0); bench.rbox(leather, 3.0, 0.5, 0.12, 0.04, 0, FB + 0.75, -0.22);
  for (const sx of [-1.3, 1.3]) bench.box(mm.chrome, 0.05, 0.45, 0.45, sx, FB + 0.22, 0);
  colBox(g, cols, 0.6, 1, 3.1, 4.9, 0.5, -7.0);
  K.rbox(mm.darkWood, 0.5, 0.45, 0.5, 0.02, 4.9, FB + 0.22, -9.0);
  for (let i = 0; i < 4; i++) K.box(paint([0xc8281e, 0xf2efe6, 0x2a6ad8, 0xf2c230][i], 0.7), 0.3, 0.01, 0.22, 4.9, FB + 0.46 + i * 0.012, -9.0, 0, i * 0.3, 0);
  tvK(K, 5.45, 2.4, -6.0, -PI / 2, screenAtlas());
  for (let i = 0; i < 4; i++) posterK(K, 5.57, 2.3, [-3.2, -4.0, -10.6, -11.4][i], 0.6, 0.8, ftex('tb-cut' + i, 192, 256, (c, w, h) => { c.fillStyle = '#e8e2d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#c8906a'; c.beginPath(); c.ellipse(w / 2, h * 0.45, w * 0.22, h * 0.2, 0, 0, TAU); c.fill(); c.fillStyle = '#1a1a1a'; c.beginPath(); c.ellipse(w / 2, h * 0.32 - i * 2, w * 0.24, h * (0.08 + i * 0.03), 0, PI, TAU); c.fill(); c.fillRect(w * 0.28, h * 0.62, w * 0.44, h * 0.3); c.font = 'bold 22px Rubik, system-ui'; c.textAlign = 'center'; c.fillText(['FADE', 'CLÁSICO', 'POMPADOUR', 'MILITAR'][i], w / 2, h * 0.97); }, false), -PI / 2);
  K.plane(texM(boardTex('barber', 'Precios', [['Corte', '$80'], ['Barba', '$60'], ['Corte + barba', '$120'], ['Niño', '$60'], ['Navaja', '$70']], { bg: '#1a1a1a', accent: '#e8cf8a' })), 1.4, 1.0, 0, 2.2, -12.28);
  for (const z of [-4.2, -7.2, -10.2]) for (const x of [-3, 2]) lvl === 3 ? pendant(K, x, ctx.H1, z) : fluo(K, x, ctx.H1 - 0.03, z);
  colBox(g, cols, 0.3, 1.0, 0.3, 1.5, 2.0, FZ + 0.15);
  if (lvl > 1) { aFrame(K, g, cols, -2.6, -0.9, 0.25, handSign(['Corte', '$80', 'sin cita'], { bg: '#1a2238', fg: '#e8cf8a', accent: '#ffffff', w: 256, h: 380 })); }
  if (lvl === 3) { for (const x of [-4.6, 0.3]) planter(g, K, x, 0, -0.45, 1.1, 100 + x, 'barrel', 'talavera'); colBox(g, cols, 0.5, 0.8, 0.5, -4.6, 0.4, -0.45); colBox(g, cols, 0.5, 0.8, 0.5, 0.3, 0.4, -0.45); }
  return new THREE.Vector3(0.2, 0, -1.0);
};

// ---------------------------------------------------------------- LAVANDERÍA
KIND.lavanderia = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const o = {
    paint: '#7fd0e0', paint1: '#a8c8c8', trim: '#1f6fb8', band: '#1f6fb8', band1: '#5a7a8a', stripes: [[0.85, 0.92, '#ffffff']],
    openings: [{ x0: -5.2, x1: 5.2, y0: 0, y1: 2.85, type: 'glass', door: [3.3, 4.5] }],
    mufaX: 5.48, numX: 3.9,
    floorM: floorFor(lvl, mm.tileCream, mm.terrazzo, mm.checker), inWall: 0xeef6f8, wainscot: lvl > 1 ? mm.azulejo : null, wainscotH: 0.9,
    awning: ['#1f6fb8', '#ffffff'], awnings: [{ x0: -5.3, x1: 5.3, text: 'AUTOSERVICIO · LAVADO POR KILO · PLANCHADO · TINTORERÍA' }],
    terrace: true, sconces: [-5.55, 5.55],
    art(F, lvl) {
      if (lvl === 1) { F.text('LAVANDERÍA', -1.2, 3.98, { size: 0.62, maxW: 6.4, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#1f6fb8', shadow: 'rgba(255,255,255,0.6)', sh: 0.04 }); F.text('Burbujas', 3.5, 3.92, { size: 0.5, maxW: 3, font: 'bold #px Lobster, Rubik, system-ui', fill: '#ffffff', outline: '#1f6fb8', ow: 0.06 }); }
      const R2 = rng(5); for (let i = 0; i < 26; i++) { const x = -5.6 + R2() * 11.2, y = 0.95 + R2() * (lvl === 1 ? 0.3 : 0.5), r = 0.04 + R2() * 0.1; F.c.strokeStyle = 'rgba(255,255,255,0.8)'; F.c.lineWidth = 3; F.c.beginPath(); F.c.arc(F.X(x), F.Y(y), F.S(r), 0, TAU); F.c.stroke(); }
    },
    sideArt(F, lvl) {
      F.c.save(); emblem(F.c, 'lavanderia', F.X(-2.6), F.Y(2.4), F.S(2.0)); F.c.restore();
      F.text('Lavado por kilo', 1.4, 2.8, { size: 0.5, maxW: 5, font: 'bold #px Lobster, Rubik, system-ui', fill: '#1f6fb8' });
      F.text('$25 el kilo · entrega el mismo día', 1.4, 2.0, { size: 0.26, maxW: 5.5, font: '800 #px Rubik, system-ui', fill: '#1a3a5a' });
    },
    sign: { x: 0, y: 3.95, w: 9.6, h: 0.95, draw: signDraw({ kind: 'lavanderia', name: 'LAVANDERÍA BURBUJAS', sub: 'Autoservicio · Lavado por kilo', bg: ['#ffffff', '#cfefff'], border: '#1f6fb8', fg: '#1f6fb8', shadow: 'rgba(0,0,0,0.15)', font: '#px "Alfa Slab One", Rubik, system-ui', subFg: '#2a8ad8' }) },
    neon: { text: 'Lava · Seca · Dobla', col: '#3af2ff', x: -2.2, y: 2.4, w: 3.2, h: 0.4, z: FZ - 0.2, back: false },
    blade: { x: -HW + 0.35, y: 3.9, w: 0.8, h: 0.9, draw: bladeDraw({ kind: 'lavanderia', bg: '#1f6fb8', border: '#ffffff', fg: '#ffffff', text: 'LAVANDERÍA' }) },
  };
  shell(ctx, o);
  signage(ctx, o);
  // fila de lavadoras a la izquierda y secadoras apiladas al fondo
  for (let i = 0; i < 9; i++) washer(K, -5.15, -3.4 - i * 0.78, PI / 2);
  K.box(mm.steel, 0.5, 0.3, 7.2, -5.35, FB + 1.25, -6.5);
  colBox(g, cols, 0.8, 1.0, 7.2, -5.15, 0.5, -6.5);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) washer(K, -3.2 + i * 0.75, -11.9, 0, true, FB + j * 0.95);
  colBox(g, cols, 4.6, 2.0, 0.8, -1.3, 1.0, -11.9);
  // mesa central para doblar
  const tb = K.sub(-0.8, 0, -7.2);
  tb.rbox(mm.white, 1.0, 0.06, 3.6, 0.02, 0, FB + 0.88, 0); tb.box(mm.steel, 0.9, 0.04, 3.4, 0, FB + 0.25, 0);
  for (const [a, b] of [[-0.45, -1.7], [0.45, -1.7], [-0.45, 1.7], [0.45, 1.7]]) tb.box(mm.steel, 0.05, 0.88, 0.05, a, FB + 0.44, b);
  for (let i = 0; i < 6; i++) { const z = -1.4 + i * 0.55; for (let k = 0; k < 4; k++) { const cg = new THREE.BoxGeometry(0.34, 0.05, 0.3); cellUV(cg, (i * 3 + k) % 8, 8, 1); tb.geo(mm.cloth, cg, (i % 2 ? 0.2 : -0.2), FB + 0.94 + k * 0.05, z, 0, (R() - 0.5) * 0.2, 0); } }
  colBox(g, cols, 1.1, 1, 3.7, -0.8, 0.5, -7.2);
  // carritos de ropa
  for (const [x, z] of [[1.4, -5.0], [1.0, -9.2]]) { const c2 = K.sub(x, 0, z); c2.box(mm.steel, 0.6, 0.02, 0.8, 0, FB + 0.25, 0); for (const [a, b] of [[-0.28, -0.38], [0.28, -0.38], [-0.28, 0.38], [0.28, 0.38]]) { c2.cyl(mm.chrome, 0.012, 0.012, 1.0, a, FB + 0.6, b, 0, 0, 0, 6); c2.sph(mm.black, 0.03, a, FB + 0.04, b, 1, 1, 1, 6); } c2.box(plastic(0x2a6ad8, 0.6), 0.56, 0.5, 0.76, 0, FB + 0.55, 0); c2.sph(mm.cloth, 0.28, 0, FB + 0.82, 0, 1, 0.45, 1.3, 10); c2.tube(mm.chrome, [[-0.28, FB + 1.1, -0.38], [-0.28, FB + 1.8, -0.38], [0.28, FB + 1.8, -0.38], [0.28, FB + 1.1, -0.38]], 0.012, 8, 5); colBox(g, cols, 0.7, 1.2, 0.9, x, 0.6, z); }
  // mostrador y estante de detergentes, sillas de espera junto al vidrio
  counterK(K, 4.2, -9.6, -PI / 2, 2.4, 0.6, 1.05, paint(0x1f6fb8, 0.5), mm.white);
  colBox(g, cols, 0.7, 1.1, 2.5, 4.2, 0.55, -9.6);
  registerK(K, 4.2, FB + 1.05, -9.2, -PI / 2);
  for (let i = 0; i < 6; i++) K.rbox(plastic(0x2a2a8a), 0.4, 0.35, 0.3, 0.04, 4.2, FB + 1.25 + (i % 2) * 0.01, -10.6 + (i % 3) * 0.02, 0, 0, 0);
  shelfUnit(K, 5.35, -6.8, -PI / 2, 2.4, 2.0, 0.35, [0.3, 0.8, 1.3], 'pack', R);
  colBox(g, cols, 0.45, 2.1, 2.4, 5.35, 1.05, -6.8);
  for (let i = 0; i < 4; i++) plasticChair(K, 0.4 + i * 0.6, -3.0, PI, lvl === 1 ? plastic(0x2a6ad8) : plastic(0xf07a1a));
  colBox(g, cols, 2.5, 1, 0.6, 1.3, 0.5, -3.0);
  clockK(K, 2.0, 2.6, -12.28, 0);
  posterK(K, 3.2, 2.0, -12.28, 1.2, 0.85, boardTex('lava', 'Tarifas', [['Lavado 1 kg', '$25'], ['Secado 30 min', '$30'], ['Edredón', '$120'], ['Planchado pza', '$12']], { bg: '#ffffff', fg: '#1a3a5a', accent: '#1f6fb8', chalk: false }));
  for (const x of [-3.2, 0, 3.2]) for (const z of [-4.5, -8.5]) fluo(K, x, ctx.H1 - 0.03, z, 1.22, PI / 2);
  if (lvl === 1) { const b = trashBagMesh(13, 0x1a2a4a, 0.85); b.position.set(-4.8, 0, -1.4); g.add(b); K.plane(texM(handSign(['SE PLANCHA', 'ropa'], { bg: '#ffffff', fg: '#1f6fb8' })), 0.55, 0.4, 2.0, 1.5, FZ - 0.11); }
  else { aFrame(K, g, cols, -2.6, -0.9, 0.2, handSign(['Lavado', '$25 kg', 'mismo día'], { bg: '#1f6fb8', fg: '#ffffff', accent: '#cfefff', w: 256, h: 380 })); }
  if (lvl === 3) { const bench = K.sub(0.6, 0, -0.7); bench.rbox(mm.planks, 1.6, 0.06, 0.42, 0.01, 0, 0.45, 0); for (const sx of [-0.7, 0.7]) bench.box(mm.iron, 0.05, 0.45, 0.4, sx, 0.225, 0); colBox(g, cols, 1.7, 0.6, 0.5, 0.6, 0.3, -0.7); for (const x of [-4.8, 2.2]) planter(g, K, x, 0, -0.45, 1.1, 110 + x, 'leafy', 'barro'); colBox(g, cols, 0.5, 0.8, 0.5, -4.8, 0.4, -0.45); colBox(g, cols, 0.5, 0.8, 0.5, 2.2, 0.4, -0.45); }
  return new THREE.Vector3(3.9, 0, -1.0);
};

// ---------------------------------------------------------------- PALETERÍA
KIND.paleteria = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const o = {
    paint: '#f7b8cf', paint1: '#e4c4cc', trim: '#ffffff', band: '#e8508a', band1: '#c88a9a', stripes: [[0.85, 0.92, '#3ab84a']],
    openings: [{ x0: -5.2, x1: 1.6, y0: 0, y1: 2.75, type: 'open' }, { x0: 2.3, x1: 5.2, y0: 0, y1: 2.75, type: 'glass', door: [3.3, 4.4] }],
    mufaX: 1.95, numX: 4.8,
    floorM: floorFor(lvl, mm.tileCream, mm.checker, mm.terrazzo), inWall: 0xfff0f4, wainscot: lvl > 1 ? mm.azulejo : null, wainscotH: 1.0,
    awning: ['#e8508a', '#ffffff'], awnings: [{ x0: -5.3, x1: 1.7, text: 'PALETAS · NIEVES · AGUAS FRESCAS' }],
    terrace: true, sconces: [-5.55, 1.95, 5.55],
    art(F, lvl) {
      if (lvl === 1) { F.text('PALETERÍA', -1.6, 3.98, { size: 0.62, maxW: 6, font: 'bold #px Pacifico, Lobster, Rubik, system-ui', fill: '#e8508a', outline: '#ffffff', ow: 0.06 }); F.text('La Palmera', 3.4, 3.95, { size: 0.42, maxW: 3.2, font: 'bold #px Pacifico, Lobster, Rubik, system-ui', fill: '#2f8a3a' }); }
      F.c.save(); emblem(F.c, 'paleteria', F.X(3.75), F.Y(lvl === 1 ? 3.25 : 3.25), F.S(0.5)); F.c.restore();
    },
    sideArt(F, lvl) {
      // mural de playa con palmera
      const c = F.c, gr = c.createLinearGradient(0, F.Y(4), 0, F.Y(0.9)); gr.addColorStop(0, '#5ac8f0'); gr.addColorStop(0.7, '#bfefff'); gr.addColorStop(1, '#f2dca0');
      c.fillStyle = gr; c.fillRect(F.X(-4.2), F.Y(3.9), F.S(8.4), F.S(3.0));
      c.fillStyle = '#2a8ad8'; c.fillRect(F.X(-4.2), F.Y(1.7), F.S(8.4), F.S(0.3));
      c.fillStyle = '#f2c230'; c.beginPath(); c.arc(F.X(2.8), F.Y(3.2), F.S(0.4), 0, TAU); c.fill();
      emblem(c, 'paleteria', F.X(-1.5), F.Y(2.4), F.S(2.2));
      F.text('Paletería La Palmera', 1.6, 2.4, { size: 0.45, maxW: 4.6, font: 'bold #px Pacifico, Lobster, Rubik, system-ui', fill: '#e8508a', outline: '#ffffff', ow: 0.06 });
    },
    sign: { x: -1.6, y: 3.95, w: 7.6, h: 1.0, draw: signDraw({ kind: 'paleteria', name: 'Paletería La Palmera', sub: 'Paletas de agua y de leche', bg: ['#ffffff', '#ffd8e6'], border: '#e8508a', fg: '#e8508a', outline: '#ffffff', shadow: 'rgba(0,0,0,0.2)', font: 'bold #px Pacifico, Lobster, Rubik, system-ui', subFg: '#2f8a3a' }), bulbs: true, bulbM: emissive(0xffd0e0, 2.5) },
    neon: { text: 'Nieves', col: '#ff6ac0', x: 3.75, y: 3.85, w: 2.4, h: 0.62 },
    blade: { x: HW - 0.35, y: 3.1, w: 0.8, h: 0.95, draw: bladeDraw({ kind: 'paleteria', bg: '#ffffff', border: '#e8508a', fg: '#e8508a', text: 'PALETAS' }) },
  };
  shell(ctx, o);
  signage(ctx, o);
  // congeladores con paletas, mostrador con vitroleros
  const fill = (s, y, w, d) => paletaRow(s, -w / 2, w / 2, y, 0, d, R);
  freezerK(K, -3.6, -3.4, 0, 2.0, handSign(['Paletas $20'], { bg: '#ffffff', fg: '#e8508a', font: 'bold #px Pacifico, Lobster, Rubik, system-ui', w: 256, h: 96 }), fill, R);
  freezerK(K, -1.3, -3.4, 0, 2.0, handSign(['Nieves $35'], { bg: '#ffffff', fg: '#2f8a3a', font: 'bold #px Pacifico, Lobster, Rubik, system-ui', w: 256, h: 96 }), (s, y, w, d) => { for (let i = 0; i < 6; i++) { const x = -w / 2 + 0.17 + (i % 3) * (w - 0.3) / 2, z = (i < 3 ? -1 : 1) * 0.14; s.box(mm.steel, 0.3, 0.02, 0.25, x, y + 0.01, z); s.sph(paint([0xf2efe6, 0x6a3a1a, 0xe8508a, 0x3ab84a, 0xf2c230, 0x8a3ab8][i], 0.6), 0.14, x, y + 0.02, z, 1, 0.35, 0.8, 10); } }, R);
  colBox(g, cols, 4.4, 1, 0.8, -2.45, 0.5, -3.4);
  counterK(K, -2.2, -6.2, 0, 4.4, 0.6, 1.0, paint(0xe8508a, 0.5), mm.white, { panelM: lvl > 1 ? mm.azulejo : null });
  colBox(g, cols, 4.5, 1.1, 0.7, -2.2, 0.55, -6.2);
  const aguas = [0xf2efe6, 0x8a1a3a, 0x7a4a1a, 0x6ad83a, 0xf2c230, 0xf07a8a];
  for (let i = 0; i < 6; i++) vitrolero(K, -4.0 + i * 0.6, FB + 1.0, -6.15, aguas[i]);
  registerK(K, 0.6, FB + 1.0, -6.1, PI);
  // vitrina vertical de paletas y menú
  coolerK(K, 4.9, -6.0, -PI / 2, 4, R); coolerK(K, 4.9, -6.8, -PI / 2, 1, R);
  colBox(g, cols, 0.8, 2.1, 1.6, 4.9, 1.05, -6.4);
  K.plane(texM(boardTex('pal', 'Sabores', [['Fresa', '$20'], ['Limón', '$18'], ['Mango con chile', '$22'], ['Nuez', '$25'], ['Coco', '$22'], ['Tamarindo', '$18'], ['Horchata (agua)', '$20'], ['Jamaica (agua)', '$20']], { bg: '#ffffff', fg: '#3a2a2a', accent: '#e8508a', chalk: false, titleFont: 'bold #px Pacifico, Lobster, Rubik, system-ui' })), 3.0, 1.4, -2.0, 2.4, -12.28);
  K.rbox(paint(0xffffff, 0.5), 3.1, 1.5, 0.04, 0.01, -2.0, 2.4, -12.31);
  planter(g, K, 3.2, FB, -11.6, 1.6, 121, 'leafy', 'talavera');
  for (const x of [-3, 0.5, 3.5]) for (const z of [-4.5, -8.5]) lvl === 3 ? pendant(K, x, ctx.H1, z) : fluo(K, x, ctx.H1 - 0.03, z);
  // carrito de paletas en la banqueta
  const cx = lvl === 1 ? 2.8 : -4.3, cr = K.sub(cx, 0, -0.95, 0, 0.15);
  cr.rbox(mm.white, 1.1, 0.7, 0.6, 0.06, 0, 0.62, 0);
  cr.plane(texM(handSign(['La Palmera'], { bg: '#ffffff', fg: '#e8508a', font: 'bold #px Pacifico, Lobster, Rubik, system-ui', w: 256, h: 96 })), 0.9, 0.34, 0, 0.62, 0.302);
  cr.rbox(mm.alum, 1.12, 0.05, 0.62, 0.02, 0, 1.0, 0);
  for (const s of [-1, 1]) { cr.tor(mm.rubber, 0.16, 0.03, -0.35, 0.18, s * 0.33, 0, 0, 0, TAU, 18, 6); cr.cyl(mm.steel, 0.02, 0.02, 0.05, -0.35, 0.18, s * 0.33, PI / 2, 0, 0, 6); }
  cr.cyl(mm.steel, 0.02, 0.02, 0.3, 0.45, 0.13, 0, 0, 0, 0, 6);
  cr.tube(mm.chrome, [[0.55, 0.9, -0.25], [0.8, 1.0, -0.25], [0.8, 1.0, 0.25], [0.55, 0.9, 0.25]], 0.015, 10, 6);
  cr.cyl(mm.steel, 0.015, 0.015, 1.4, 0, 1.7, 0, 0, 0, 0, 6);
  const um = new THREE.ConeGeometry(0.75, 0.3, 8, 1, true); const uv = um.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 4);
  cr.geo(mat(0xffffff, { map: stripeTex('#e8508a', '#ffffff'), side: DS, roughness: 0.9 }), um, 0, 2.3, 0);
  for (let i = 0; i < 3; i++) cr.cyl(mm.chrome, 0.03, 0.04, 0.05, -0.4 + i * 0.03, 1.05, 0.2, 0, 0, 0, 10);
  colBox(g, cols, 1.4, 1.2, 0.9, cx, 0.6, -0.95);
  if (lvl > 1) { const bench = K.sub(-1.6, 0, -0.7); bench.rbox(paint(0xffffff, 0.5), 1.6, 0.06, 0.42, 0.01, 0, 0.45, 0); bench.rbox(paint(0xe8508a, 0.5), 1.6, 0.35, 0.05, 0.01, 0, 0.72, -0.2, -0.15); for (const sx of [-0.7, 0.7]) bench.box(mm.iron, 0.05, 0.45, 0.4, sx, 0.225, 0); colBox(g, cols, 1.7, 1, 0.6, -1.6, 0.5, -0.7); }
  if (lvl === 3) { for (const x of [0.6, 5.2]) planter(g, K, x, 0, -0.45, 1.1, 130 + x, 'leafy', 'talavera'); colBox(g, cols, 0.5, 0.8, 0.5, 0.6, 0.4, -0.45); colBox(g, cols, 0.5, 0.8, 0.5, 5.2, 0.4, -0.45); }
  return new THREE.Vector3(-2.0, 0, -1.6);
};

// ---------------------------------------------------------------- ARCADE
KIND.arcade = (ctx) => {
  const { g, K, cols, lvl, R } = ctx, mm = mats();
  const H1 = 4.4;
  const o = {
    H1, par: 1.3, paint: '#2a1a4a', paint1: '#4e4660', trim: '#3af2ff', trim1: '#6a8a9a', band: '#111111', stripes: [[0.85, 0.92, '#ff3ad0']],
    sidePainted: true, sidePaint: lvl === 1 ? '#5a5464' : '#2a1a4a',
    openings: [{ x0: -4.4, x1: 4.4, y0: 0, y1: 3.0, type: 'open' }],
    mufaX: 5.4, numX: 5.0, stairHouse: false, tinacoX: 3.6,
    floorM: mm.carpet, floorS: 1 / 1.2, inWall: lvl === 1 ? 0x3a3448 : 0x120a20, ceilM: paint(0x0a0612, 0.95),
    sconces: [-5.0, 5.0],
    art(F, lvl) {
      if (lvl === 1) { F.text('MAQUINITAS', 0, 4.55, { size: 0.8, maxW: 8, font: 'bold #px Bungee, Rubik, system-ui', fill: '#f2c230', outline: '#1a1a1a', ow: 0.07 }); F.text('Salón Arcade Pixel · 5 fichas $20', 0, 3.75, { size: 0.3, maxW: 7, font: '800 #px Rubik, system-ui', fill: '#3af2ff' }); }
      const c = F.c; c.save(); for (let i = 0; i < 12; i++) { c.fillStyle = ['#ff3ad0', '#3af2ff', '#f2c230', '#7aff3a'][i % 4]; c.globalAlpha = lvl === 1 ? 0.5 : 0.9; c.fillRect(F.X(-5.85 + (i % 2) * 0.15), F.Y(0.9 + i * 0.22), F.S(0.12), F.S(0.12)); c.fillRect(F.X(5.6 + (i % 2) * 0.15), F.Y(0.9 + i * 0.22), F.S(0.12), F.S(0.12)); } c.restore();
    },
    sideArt(F, lvl) {
      const c = F.c; emblem(c, 'arcade', F.X(-2.5), F.Y(3.2), F.S(2.4), lvl === 3);
      F.text('GAME OVER', 1.8, 3.6, { size: 0.6, maxW: 5, font: 'bold #px Bungee, Rubik, system-ui', fill: '#ff3ad0' });
      F.text('¿Otra ficha?', 1.8, 2.7, { size: 0.45, maxW: 5, font: 'bold #px Bungee, Rubik, system-ui', fill: '#3af2ff' });
      if (lvl === 1) F.tags(4);
    },
    sign: { x: 0, y: 4.35, w: 10.6, h: 1.6, draw: (c, w, h, lvl) => {
      c.fillStyle = '#0a0612'; c.fillRect(0, 0, w, h);
      const R2 = rng(9); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${R2() * 0.6})`; c.fillRect(R2() * w, R2() * h, 2, 2); }
      c.strokeStyle = '#ff3ad0'; c.lineWidth = 10; c.shadowColor = '#ff3ad0'; c.shadowBlur = 20; c.strokeRect(14, 14, w - 28, h - 28); c.shadowBlur = 0;
      emblem(c, 'arcade', h * 0.7, h / 2, h * 0.8, true); emblem(c, 'arcade', w - h * 0.7, h / 2, h * 0.8, false);
      brushText(c, 'SALÓN ARCADE', w / 2, h * 0.3, { font: 'bold #px Bungee, Rubik, system-ui', px: h * 0.2, maxW: w * 0.6, fill: '#3af2ff', glow: lvl === 3 ? '#3af2ff' : null, rough: 0 });
      brushText(c, 'PIXEL', w / 2, h * 0.66, { font: 'bold #px Bungee, Rubik, system-ui', px: h * 0.46, maxW: w * 0.6, grad: ['#f2c230', '#ff3ad0'], outline: '#ffffff', ow: 0.04, glow: lvl === 3 ? '#ff3ad0' : null, rough: 0 });
    }, bulbs: true, glow: 0.9 },
    neon: [{ text: 'INSERT COIN', font: 'bold #px Monoton, Bungee, Rubik, system-ui', col: '#7aff3a', x: 0, y: 3.33, w: 3.6, h: 0.4, back: false, z: FZ + 0.32 }],
    blade: { x: -HW + 0.35, y: 3.4, w: 0.8, h: 1.2, draw: bladeDraw({ kind: 'arcade', bg: '#0a0612', border: '#3af2ff', fg: '#ff3ad0', text: 'ARCADE', font: 'bold #px Bungee, Rubik, system-ui' }) },
  };
  shell(ctx, o);
  signage(ctx, o);
  // filas de maquinitas
  const pos = [];
  for (let i = 0; i < 6; i++) pos.push([-4.9, -3.6 - i * 0.78, PI / 2]);
  for (let i = 0; i < 6; i++) pos.push([4.9, -4.4 - i * 0.78, -PI / 2]);
  for (let i = 0; i < 4; i++) { pos.push([-1.5 + i * 0.78, -7.0, 0]); pos.push([-1.5 + i * 0.78, -8.2, PI]); }
  for (let i = 0; i < 5; i++) pos.push([-2.0 + i * 0.78, -11.75, 0]);
  const n = lvl === 1 ? 14 : pos.length;
  pos.slice(0, n).forEach(([x, z, ry], i) => arcadeCab(K, x, z, ry, i % 4, lvl));
  colBox(g, cols, 0.9, 2.1, 4.8, -4.9, 1.05, -5.55); colBox(g, cols, 0.9, 2.1, 4.8, 4.9, 1.05, -6.35);
  colBox(g, cols, 3.2, 2.1, 2.1, -0.33, 1.05, -7.6); colBox(g, cols, 4.0, 2.1, 0.9, -0.44, 1.05, -11.75);
  // máquina de peluches
  const cl = K.sub(3.4, FB, -2.9);
  cl.rbox(paint(0xff3ad0, 0.4), 0.9, 0.85, 0.9, 0.03, 0, 0.42, 0);
  cl.box(mm.glass, 0.86, 1.0, 0.86, 0, 1.36, 0);
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) cl.box(mm.chrome, 0.04, 1.0, 0.04, a * 0.43, 1.36, b * 0.43);
  cl.rbox(paint(0xff3ad0, 0.4), 0.92, 0.25, 0.92, 0.03, 0, 1.98, 0);
  cl.plane(glowM(handSign(['ATRÁPALO'], { bg: '#1a0a2a', fg: '#f2c230', font: 'bold #px Bungee, Rubik, system-ui', w: 256, h: 64 }), 1), 0.8, 0.2, 0, 1.98, 0.465);
  for (let i = 0; i < 14; i++) cl.sph(plastic([0xf2c230, 0x3af2ff, 0xff7a3a, 0x7aff3a, 0xf2efe6][i % 5]), 0.08, -0.3 + (i % 4) * 0.2, 0.92 + (i / 4 | 0) * 0.1, -0.3 + ((i * 7) % 4) * 0.2, 1, 1, 1, 8);
  cl.cyl(mm.chrome, 0.006, 0.006, 0.4, 0.1, 1.65, 0.1, 0, 0, 0, 4); for (let k = 0; k < 3; k++) cl.cyl(mm.chrome, 0.008, 0.004, 0.1, 0.1 + Math.cos(k * 2.1) * 0.03, 1.42, 0.1 + Math.sin(k * 2.1) * 0.03, Math.sin(k * 2.1) * 0.4, 0, -Math.cos(k * 2.1) * 0.4, 4);
  colBox(g, cols, 1.0, 2.1, 1.0, 3.4, 1.05, -2.9);
  // cambiadora de fichas
  const ch = K.sub(-3.5, FB, -2.7); ch.rbox(mm.steel, 0.5, 1.5, 0.4, 0.03, 0, 0.75, 0); ch.plane(glowM(handSign(['FICHAS', '$5'], { bg: '#0a0a0a', fg: '#f2c230', accent: '#3af2ff', font: 'bold #px Bungee, Rubik, system-ui', w: 128, h: 128 }), 1), 0.36, 0.36, 0, 1.15, 0.205); ch.box(mm.black, 0.12, 0.08, 0.06, 0, 0.5, 0.22);
  colBox(g, cols, 0.6, 1.6, 0.5, -3.5, 0.8, -2.7);
  // luz negra y neones del techo
  for (const x of [-3, 0, 3]) for (const z of [-4.2, -7.6, -11]) K.cyl(emissive(lvl === 1 ? 0x8a6aff : 0xa03aff, 2.4), 0.02, 0.02, 1.2, x, H1 - 0.05, z, 0, 0, PI / 2, 8);
  if (lvl > 1) { K.box(emissive(0xff3ad0, 2.4), 10.9, 0.03, 0.03, 0, H1 - 0.1, -2.4); K.box(emissive(0x3af2ff, 2.4), 0.03, 0.03, 9.8, -5.55, H1 - 0.1, -7.3); K.box(emissive(0x3af2ff, 2.4), 0.03, 0.03, 9.8, 5.55, H1 - 0.1, -7.3); }
  posterK(K, 3.0, 2.6, -12.28, 1.6, 1.0, artPoster('TORNEO SÁBADO', '#120a2a', '#3af2ff', 'arc1'), 0, 0.6);
  // banqueta
  if (lvl === 1) { K.plane(texM(handSign(['NO SE FÍA', 'NI FICHAS'], { bg: '#f2efe6', fg: '#1a1a1a' })), 0.55, 0.4, 5.0, 1.6, FZ + 0.01); const b = trashBagMesh(17, 0x141414, 0.85); b.position.set(-5.0, 0, -1.4); g.add(b); }
  else aFrame(K, g, cols, 3.2, -0.9, -0.3, handSign(['5 fichas', '$20', '¡Récord!'], { bg: '#0a0612', fg: '#3af2ff', accent: '#ff3ad0', font: 'bold #px Bungee, Rubik, system-ui', w: 256, h: 380 }));
  if (lvl === 3) { for (const x of [-5.0, 5.0]) { const s = K.sub(x, 0, -0.6); s.rbox(paint(0x1a1a1a, 0.4), 0.5, 1.0, 0.5, 0.04, 0, 0.5, 0); s.box(emissive(0x3af2ff, 2.5), 0.52, 0.04, 0.52, 0, 0.9, 0); s.box(emissive(0xff3ad0, 2.5), 0.52, 0.04, 0.52, 0, 0.15, 0); colBox(g, cols, 0.6, 1, 0.6, x, 0.5, -0.6); } }
  return new THREE.Vector3(0, 0, -1.0);
};

// =====================================================================================
// TALLER DE RESTAURACIÓN (coordenadas del mundo; se construye en un marco local girado)
// Marco local: fachada en z=0 mirando a +z (hacia la calle), interior z ∈ [-9, 0], x ∈ [-5.5, 5.5].
// Mundo: x = 30 - xL, z = 61.5 - zL  (la cortina abierta da hacia la calle, -z del mundo).
// =====================================================================================
export function tallerRestauracion(g, pts) {
  const mm = mats(), R = rng('taller');
  const tg = new THREE.Group(); tg.name = 'taller'; tg.position.set(30, 0, 61.5); tg.rotation.y = PI; g.add(tg);
  const K = new Kit(), cols = [];
  const W = 11, HW2 = W / 2, D = 9, Hw = 4.6, Htop = 5.5, OX0 = -3.4, OX1 = 3.4, OY = 3.9;
  // ---------- fachada pintada a mano ----------
  const PPM = 140;
  const ftx = ftex('tb-taller-fac', Math.round(W * PPM), Math.round(Htop * PPM), (c) => {
    const F = wallPainter(c, W, Htop, PPM, rng('tallerfac'));
    F.rect(-W / 2, 0, W / 2, Htop, '#e6dcc4'); F.texture(0.9);
    F.band(-W / 2, 0, W / 2, 0.9, '#1f3f6a');
    F.band(-W / 2, 0.9, W / 2, 1.0, '#c8281e');
    F.band(-W / 2, Htop - 1.5, W / 2, Htop - 1.42, '#c8281e');
    F.band(-W / 2, Htop - 0.22, W / 2, Htop, '#1f3f6a');
    F.rect(OX0 - 0.12, 0, OX1 + 0.12, OY + 0.12, '#1f3f6a');
    // rótulo a mano
    F.text('TALLER DE RESTAURACIÓN', 0, 4.82, { size: 0.62, maxW: 10.2, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#c8281e', outline: '#1a1a1a', ow: 0.06, shadow: 'rgba(0,0,0,0.35)', sh: 0.05, seed: 3 });
    F.text('Hojalatería · Pintura · Mecánica · Autos Clásicos', 0, 4.3, { size: 0.26, maxW: 7.4, font: '800 #px Rubik, system-ui', fill: '#1f3f6a', seed: 4 });
    F.text('Tel. 55 3141 5926', -4.45, 2.9, { size: 0.2, maxW: 1.8, font: '800 #px Rubik, system-ui', fill: '#1f3f6a' });
    F.text('SE RESTAURAN', -4.45, 2.4, { size: 0.24, maxW: 1.8, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#c8281e' });
    F.text('VOCHOS', -4.45, 2.0, { size: 0.3, maxW: 1.8, font: 'bold #px Lobster, Rubik, system-ui', fill: '#1f3f6a' });
    F.text('NO ESTACIONARSE', 4.45, 0.45, { size: 0.18, maxW: 1.8, font: '800 #px Rubik, system-ui', fill: '#f2efe6' });
    // auto clásico pintado (silueta)
    const cc = F.c; cc.save(); cc.translate(F.X(4.4), F.Y(3.3)); cc.scale(F.S(0.0042), F.S(0.0042));
    cc.fillStyle = '#c8281e'; cc.beginPath(); cc.moveTo(-200, 40); cc.lineTo(-190, -10); cc.quadraticCurveTo(-120, -30, -80, -40); cc.quadraticCurveTo(-30, -110, 60, -100); cc.quadraticCurveTo(120, -60, 160, -30); cc.quadraticCurveTo(200, -20, 205, 40); cc.closePath(); cc.fill();
    cc.fillStyle = '#bfe0f0'; cc.beginPath(); cc.moveTo(-60, -40); cc.quadraticCurveTo(-20, -95, 40, -90); cc.lineTo(60, -40); cc.closePath(); cc.fill();
    cc.fillStyle = '#1a1a1a'; for (const x of [-120, 120]) { cc.beginPath(); cc.arc(x, 40, 34, 0, TAU); cc.fill(); } cc.fillStyle = '#c8ccd0'; for (const x of [-120, 120]) { cc.beginPath(); cc.arc(x, 40, 14, 0, TAU); cc.fill(); }
    cc.restore();
    F.grime(0.6, [Htop - 0.22]); F.cracks(6); F.tags(2);
    F.poster(4.6, 1.6, 0.45, 0.6, '#f2c230', [['REFACCIONES', '#1a1a1a', 0.07], ['originales', '#c8281e', 0.05]], 7);
  });
  const facM = mat(0xffffff, { map: ftx, roughness: 0.88 });
  const fgeo = new THREE.ExtrudeGeometry(facadeShape(W, Htop, [{ x0: OX0, x1: OX1, y0: 0, y1: OY }]), { depth: 0.25, bevelEnabled: false });
  fgeo.translate(0, 0, -0.25); projUV(fgeo, (x) => (x + W / 2) / W, (x, y) => y / Htop);
  K.geo(facM, fgeo);
  K.rbox(paint(0x1f3f6a, 0.6), W + 0.12, 0.09, 0.4, 0.02, 0, Htop + 0.045, -0.12);
  // muros laterales de tabique aparente y fondo de block
  const sideTx = ftex('tb-taller-side', 1024, 512, (c, w, h) => {
    const F = wallPainter(c, D, Hw + 0.4, w / D, rng('tside'));
    brickPattern(c, 0, 0, w, h, w / D * 0.28, w / D * 0.075, F.R); F.texture(0.6);
    F.rect(-3.2, 1.2, 3.2, 3.6, '#e6dcc4');
    F.text('HOJALATERÍA', 0, 2.9, { size: 0.55, maxW: 6, font: '#px "Alfa Slab One", Rubik, system-ui', fill: '#c8281e' });
    F.text('y PINTURA', 0, 2.1, { size: 0.45, maxW: 5, font: 'bold #px Lobster, Rubik, system-ui', fill: '#1f3f6a' });
    F.text('Trabajos garantizados', 0, 1.55, { size: 0.24, maxW: 5, font: '800 #px Rubik, system-ui', fill: '#1a1a1a' });
    F.grime(0.7, [Hw + 0.35]);
  });
  const sideM = mat(0xffffff, { map: sideTx, roughness: 0.9 });
  for (const sgn of [-1, 1]) {
    const sg = new THREE.BoxGeometry(0.22, Hw + 0.4, D - 0.25); sg.translate(sgn * (HW2 - 0.11), (Hw + 0.4) / 2, -(D + 0.25) / 2);
    projUV(sg, (x, y, z) => sgn > 0 ? (-0.25 - z) / (D - 0.25) : (z + D) / (D - 0.25), (x, y) => y / (Hw + 0.4));
    K.geo(sideM, sg);
    colBox(tg, cols, 0.3, Hw, D, sgn * (HW2 - 0.11), Hw / 2, -D / 2);
  }
  K.wbox(mm.block, W, Hw + 0.4, 0.22, 0, (Hw + 0.4) / 2, -D + 0.11, 0.5);
  colBox(tg, cols, W, Hw, 0.3, 0, Hw / 2, -D + 0.11);
  for (const [x0, x1] of [[-HW2, OX0], [OX1, HW2]]) colBox(tg, cols, x1 - x0, Hw, 0.3, (x0 + x1) / 2, Hw / 2, -0.12);
  // pintura interior (mitad baja gris, mitad alta blanca)
  const inLow = paint(0x7a8088, 0.85), inHi = paint(0xe8e4da, 0.9);
  for (const sgn of [-1, 1]) { K.plane(inLow, D - 0.5, 1.4, sgn * (HW2 - 0.225), 0.7, -D / 2, 0, -sgn * PI / 2); K.plane(inHi, D - 0.5, Hw - 1.4, sgn * (HW2 - 0.225), 1.4 + (Hw - 1.4) / 2, -D / 2, 0, -sgn * PI / 2); }
  K.plane(inLow, W - 0.45, 1.4, 0, 0.7, -D + 0.225); K.plane(inHi, W - 0.45, Hw - 1.4, 0, 1.4 + (Hw - 1.4) / 2, -D + 0.225);
  // ---------- piso y patio de maniobras ----------
  K.geo(mm.shopFloor, uvPlaneH(W - 0.44, D - 0.45, 0.25), 0, 0.02, -D / 2 - 0.1);
  K.geo(mm.shopFloor, uvPlaneH(12, 4.2, 0.22), 0, 0.015, 2.1);
  K.box(metal(0x2a2a2a, 0.6), 0.6, 0.01, 0.4, 0, 0.026, -4.5);
  for (let i = 0; i < 6; i++) K.box(metal(0x1a1a1a, 0.6), 0.02, 0.012, 0.36, -0.25 + i * 0.1, 0.03, -4.5);
  // ---------- techo: armaduras de acero y lámina con domos ----------
  const steelR = paint(0x8a2a1e, 0.5);
  for (let z = -0.8; z > -D; z -= 2.1) {
    K.box(steelR, W - 0.44, 0.1, 0.12, 0, Hw - 0.6, z); K.box(steelR, W - 0.44, 0.1, 0.12, 0, Hw - 0.05, z);
    for (let x = -HW2 + 0.6; x < HW2 - 0.5; x += 0.7) K.box(steelR, 0.05, 0.62, 0.06, x + 0.175, Hw - 0.33, z, 0, 0, (Math.round(x / 0.7) % 2 ? 0.5 : -0.5));
  }
  K.geo(mm.lamina, (() => { const gg = new THREE.PlaneGeometry(W - 0.2, D), uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (W - 0.2) / 0.5, uv.getY(i) * D / 3); gg.rotateX(PI / 2); return gg; })(), 0, Hw + 0.02, -D / 2, 0.02);
  for (const x of [-2.5, 2.5]) for (const z of [-2.5, -6.5]) K.box(mm.laminaClear, 1.0, 0.01, 1.6, x, Hw + 0.01, z, 0.02);
  // ---------- cortina enrollada, guías ----------
  const cw = OX1 - OX0 + 0.3;
  K.cyl(mm.curtain, 0.32, 0.32, cw, 0, OY + 0.36, -0.55, 0, 0, PI / 2, 20);
  K.wbox(mm.curtain, cw, 0.7, 0.05, 0, OY + 0.35, 0.03, 1.5);
  for (const x of [OX0 + 0.05, OX1 - 0.05]) K.box(mm.frame, 0.1, OY, 0.12, x, OY / 2, -0.12);
  K.box(mm.steel, cw - 0.3, 0.08, 0.06, 0, OY + 0.02, -0.12);
  // ---------- elevador de dos postes con auto arriba ----------
  const LX = -2.6, LZ = -4.4, liftY = 1.75, liftM = paint(0x1f5ab8, 0.45), yel = paint(0xf2c230, 0.5);
  for (const sgn of [-1, 1]) {
    const px = LX + sgn * 1.65;
    K.rbox(liftM, 0.32, 3.8, 0.3, 0.03, px, 1.9, LZ);
    K.box(mm.steel, 0.5, 0.02, 0.6, px, 0.01, LZ);
    K.rbox(yel, 0.36, 0.5, 0.36, 0.02, px, liftY - 0.2, LZ);
    for (const dz of [-1, 1]) { K.box(yel, 0.12, 0.08, 1.0, px - sgn * 0.45, liftY - 0.15, LZ + dz * 0.5, 0, -sgn * dz * 0.45); K.cyl(mm.rubber, 0.07, 0.07, 0.05, px - sgn * 0.9, liftY - 0.08, LZ + dz * 0.95, 0, 0, 0, 12); }
    for (let y = 0.4; y < 3.6; y += 0.25) K.box(mm.frame, 0.2, 0.02, 0.02, px, y, LZ + 0.16);
    colBox(tg, cols, 0.45, 3.8, 0.45, px, 1.9, LZ);
  }
  K.box(liftM, 3.6, 0.16, 0.2, LX, 3.86, LZ);
  K.rbox(paint(0x2a2a2a, 0.5), 0.3, 0.45, 0.3, 0.03, LX - 1.95, 1.4, LZ + 0.1);
  K.cyl(paint(0x3a3a3a, 0.5), 0.1, 0.1, 0.35, LX - 1.95, 1.85, LZ + 0.1, 0, 0, 0, 12);
  K.tube(mm.cable, [[LX - 1.95, 1.2, LZ + 0.1], [LX - 1.9, 0.05, LZ + 0.4], [LX + 1.6, 0.05, LZ + 0.4], [LX + 1.65, 0.3, LZ + 0.2]], 0.015, 16, 5);
  const car1 = makeCar('sedan', 0x7a1a1a); car1.rotation.y = PI / 2; car1.position.set(LX, liftY, LZ); tg.add(car1);
  // charola de aceite, patín (creeper) y gato bajo el auto
  K.lathe(paint(0x1a1a1a, 0.4), [[0, 0], [0.32, 0], [0.38, 0.1], [0.4, 0.1]], LX + 0.2, 0.02, LZ - 1.1, 20);
  K.cyl(mat(0x0a0806, { roughness: 0.1, env: true, envI: 0.6 }), 0.34, 0.34, 0.01, LX + 0.2, 0.08, LZ - 1.1, 0, 0, 0, 20);
  const cr = K.sub(LX - 0.4, 0, LZ + 0.6, 0, 0.3); cr.rbox(paint(0xc8281e, 0.5), 0.45, 0.05, 1.0, 0.02, 0, 0.1, 0); cr.rbox(mm.black, 0.3, 0.06, 0.25, 0.03, 0, 0.14, -0.35); for (const [a, b] of [[-0.18, -0.4], [0.18, -0.4], [-0.18, 0.4], [0.18, 0.4]]) cr.sph(mm.black, 0.035, a, 0.04, b, 1, 1, 1, 8);
  const jk = K.sub(LX + 0.9, 0, LZ + 1.6, 0, -0.4); jk.rbox(paint(0xc8281e, 0.4), 0.3, 0.14, 0.75, 0.03, 0, 0.12, 0); jk.box(paint(0xc8281e, 0.4), 0.08, 0.06, 0.4, 0, 0.22, 0.2, -0.35); jk.cyl(mm.chrome, 0.018, 0.018, 1.1, 0, 0.45, -0.75, 1.0, 0, 0, 8); for (const [a, b] of [[-0.14, 0.3], [0.14, 0.3], [-0.14, -0.3], [0.14, -0.3]]) jk.cyl(mm.steel, 0.05, 0.05, 0.03, a, 0.05, b, 0, 0, PI / 2, 10);
  // ---------- bahía de restauración: vocho en primer sobre torres ----------
  const VX = 2.5, VZ = -4.6;
  const car2 = makeCar('vocho', 0x8e928e); car2.rotation.y = -PI / 2; car2.position.set(VX, 0.18, VZ); tg.add(car2);
  for (const [a, b] of [[-0.65, -1.2], [0.65, -1.2], [-0.65, 1.2], [0.65, 1.2]]) { K.cone(paint(0xc8281e, 0.4), 0.13, 0.28, VX + a, 0.14, VZ + b, 0, 0, 0, 4); K.cyl(mm.steel, 0.025, 0.025, 0.12, VX + a, 0.3, VZ + b, 0, 0, 0, 6); }
  colBox(tg, cols, 1.9, 1.6, 4.3, VX, 0.8, VZ);
  // salpicadera y cofre recargados en la pared, puerta en caballetes
  K.sph(paint(0x8e928e, 0.4), 0.45, 5.1, 0.55, -2.2, 0.35, 0.8, 1.2, 14);
  K.rbox(paint(0x6a7a8a, 0.35), 1.2, 0.04, 1.0, 0.1, 5.15, 0.7, -3.4, 0, 0, 1.25);
  const sh = K.sub(4.2, 0, -7.0);
  for (const sx of [-0.5, 0.5]) { sh.box(mm.wood, 0.06, 0.8, 0.06, sx, 0.4, -0.2, 0.2); sh.box(mm.wood, 0.06, 0.8, 0.06, sx, 0.4, 0.2, -0.2); sh.box(mm.wood, 0.08, 0.06, 0.5, sx, 0.78, 0); }
  sh.rbox(paint(0x8e928e, 0.35), 1.2, 0.06, 0.95, 0.05, 0, 0.85, 0, 0, 0.05, 0);
  sh.rbox(mm.glassDark, 0.7, 0.01, 0.45, 0.04, 0.1, 0.89, 0.15);
  colBox(tg, cols, 1.3, 1.0, 0.7, 4.2, 0.5, -7.0);
  // carrito con pistola de pintura y latas de primer
  const pc = K.sub(4.6, 0, -5.4);
  pc.rbox(paint(0x2a2a2a, 0.5), 0.5, 0.04, 0.4, 0.01, 0, 0.8, 0); pc.box(paint(0x2a2a2a, 0.5), 0.5, 0.03, 0.4, 0, 0.3, 0);
  for (const [a, b] of [[-0.22, -0.17], [0.22, -0.17], [-0.22, 0.17], [0.22, 0.17]]) { pc.cyl(mm.steel, 0.012, 0.012, 0.8, a, 0.4, b, 0, 0, 0, 6); pc.sph(mm.black, 0.03, a, 0.03, b, 1, 1, 1, 6); }
  for (let i = 0; i < 4; i++) pc.cyl(paint([0x8e928e, 0xc8281e, 0x2a2a2a, 0xe8e4da][i], 0.4), 0.06, 0.06, 0.17, -0.15 + (i % 2) * 0.14, 0.9 + 0.0, -0.08 + (i / 2 | 0) * 0.15, 0, 0, 0, 12);
  const gun = pc.sub(0.18, 0.87, 0.1, 0, 0.6); gun.cyl(mm.chrome, 0.05, 0.05, 0.12, 0, 0.12, 0, 0, 0, 0, 12); gun.rbox(mm.chrome, 0.04, 0.1, 0.14, 0.01, 0, 0.0, 0.03); gun.cyl(mm.black, 0.015, 0.015, 0.12, 0, -0.08, 0.06, 0.3, 0, 0, 6);
  for (let i = 0; i < 5; i++) pc.rbox(paint(0xd8c8a0, 0.9), 0.1, 0.03, 0.06, 0.008, -0.1 + i * 0.05, 0.33, 0, 0, i * 0.4, 0);
  colBox(tg, cols, 0.6, 1.0, 0.5, 4.6, 0.5, -5.4);
  // ---------- banco de trabajo con tornillo, pegboard ----------
  const bx = -3.4, bz = -8.45;
  K.rbox(C.wood(0x8a6a42), 3.4, 0.07, 0.8, 0.01, bx, 0.92, bz);
  K.box(paint(0x3a3c3e, 0.5), 3.3, 0.04, 0.7, bx, 0.25, bz);
  for (const [a, b] of [[-1.6, -0.35], [1.6, -0.35], [-1.6, 0.35], [1.6, 0.35]]) K.box(paint(0x3a3c3e, 0.5), 0.06, 0.9, 0.06, bx + a, 0.45, bz + b);
  for (let i = 0; i < 3; i++) K.rbox(paint(0x3a3c3e, 0.5), 0.6, 0.18, 0.66, 0.01, bx + 0.8, 0.78 - i * 0.2, bz, 0, 0, 0);
  for (let i = 0; i < 3; i++) K.box(mm.chrome, 0.2, 0.02, 0.02, bx + 0.8, 0.78 - i * 0.2, bz + 0.34);
  // tornillo de banco
  const vs = K.sub(bx - 1.2, 0.955, bz + 0.3);
  vs.rbox(paint(0x1f5ab8, 0.4), 0.22, 0.14, 0.3, 0.02, 0, 0.07, 0); vs.rbox(paint(0x1f5ab8, 0.4), 0.22, 0.12, 0.08, 0.02, 0, 0.14, 0.2); vs.rbox(paint(0x1f5ab8, 0.4), 0.22, 0.12, 0.08, 0.02, 0, 0.14, -0.08);
  vs.cyl(mm.chrome, 0.012, 0.012, 0.4, 0, 0.1, 0.35, PI / 2, 0, 0, 8); vs.cyl(mm.chrome, 0.008, 0.008, 0.26, 0, 0.1, 0.55, 0, 0, PI / 2, 6);
  // herramientas sueltas en el banco
  for (let i = 0; i < 5; i++) K.box(mm.chrome, 0.18 + R() * 0.08, 0.012, 0.03, bx - 0.3 + i * 0.12, 0.965, bz + 0.15 - R() * 0.2, 0, R() * 3, 0);
  K.rbox(paint(0xc8281e, 0.4), 0.5, 0.2, 0.22, 0.02, bx + 1.3, 1.05, bz - 0.15);
  K.cyl(paint(0xf2c230, 0.5), 0.07, 0.07, 0.24, bx + 0.4, 1.08, bz - 0.2, 0, 0, PI / 2, 12);
  K.lathe(paint(0x1f6a3a, 0.4), [[0, 0], [0.06, 0], [0.06, 0.2], [0.02, 0.25], [0.012, 0.3]], bx - 0.6, 0.955, bz - 0.25, 10);
  K.plane(mm.pegboard, 3.4, 1.4, bx, 1.75, -D + 0.235);
  K.box(C.wood(0x8a6a42), 3.4, 0.04, 0.3, bx, 2.55, -D + 0.38);
  for (let i = 0; i < 8; i++) K.cyl(paint([0xc8281e, 0x1f5ab8, 0xf2c230, 0x2a2a2a][i % 4], 0.4), 0.06, 0.06, 0.18, bx - 1.4 + i * 0.4, 2.66, -D + 0.38, 0, 0, 0, 10);
  // herramientas reales colgadas sobre la pegboard
  for (let i = 0; i < 6; i++) { K.box(mm.chrome, 0.025, 0.25 + i * 0.02, 0.012, bx - 1.45 + i * 0.13, 1.55, -D + 0.25); K.tor(mm.chrome, 0.03, 0.008, bx - 1.45 + i * 0.13, 1.7 + i * 0.01, -D + 0.25, 0, 0, 0, TAU, 10, 4); }
  for (let i = 0; i < 4; i++) { K.cyl(mm.darkWood, 0.016, 0.016, 0.3, bx + 0.6 + i * 0.12, 1.45, -D + 0.26, 0, 0, 0, 6); K.box(mm.steel, 0.12, 0.05, 0.03, bx + 0.6 + i * 0.12, 1.63, -D + 0.26); }
  fluo(K, bx, 2.4, -D + 0.5);
  colBox(tg, cols, 3.5, 1.0, 0.85, bx, 0.5, bz);
  tg.updateMatrix();
  pts.taller = new THREE.Vector3(bx, 0, -7.4).applyMatrix4(tg.matrix);
  pts.taller.y = 0;
  // ---------- cajoneras rojas rodantes ----------
  const chest = (x, z, ry, h = 1.0, top = true) => {
    const s = K.sub(x, 0, z, 0, ry), red = mat(0xb81a14, { roughness: 0.3, metalness: 0.3, env: true, envI: 0.6 });
    s.rbox(red, 1.1, h, 0.55, 0.02, 0, 0.12 + h / 2, 0);
    for (let i = 0; i < 5; i++) { const dy = 0.2 + i * (h - 0.15) / 5; s.box(paint(0x8a1410, 0.4), 1.02, 0.01, 0.01, 0, 0.12 + dy, 0.28); s.box(mm.chrome, 0.8, 0.025, 0.03, 0, 0.12 + dy + 0.07, 0.29); }
    for (const [a, b] of [[-0.45, -0.2], [0.45, -0.2], [-0.45, 0.2], [0.45, 0.2]]) { s.cyl(mm.black, 0.05, 0.05, 0.04, a, 0.06, b, 0, 0, PI / 2, 10); s.box(mm.steel, 0.04, 0.05, 0.06, a, 0.1, b); }
    s.tube(mm.chrome, [[-0.58, 0.12 + h - 0.1, -0.15], [-0.7, 0.12 + h - 0.1, 0], [-0.58, 0.12 + h - 0.1, 0.15]], 0.015, 8, 6);
    s.rbox(mm.black, 1.08, 0.02, 0.53, 0.005, 0, 0.13 + h, 0);
    if (top) {
      s.rbox(red, 1.0, 0.45, 0.45, 0.02, 0, 0.36 + h, -0.03);
      for (let i = 0; i < 3; i++) s.box(mm.chrome, 0.7, 0.02, 0.03, 0, 0.2 + h + i * 0.12, 0.21);
      s.rbox(red, 1.0, 0.05, 0.45, 0.02, 0, 0.6 + h, -0.03, 0.15);
    }
  };
  chest(-0.9, -8.5, 0); colBox(tg, cols, 1.2, 1.7, 0.7, -0.9, 0.85, -8.5);
  chest(-0.8, -2.2, PI / 2 + 0.2, 0.8, false); colBox(tg, cols, 0.7, 1.0, 1.2, -0.8, 0.5, -2.2);
  // ---------- estantería de refacciones ----------
  const rk = K.sub(1.4, 0, -8.6);
  for (const [a, b] of [[-0.9, -0.25], [0.9, -0.25], [-0.9, 0.25], [0.9, 0.25]]) rk.box(paint(0x1f5ab8, 0.5), 0.05, 2.6, 0.05, a, 1.3, b);
  for (const ly of [0.15, 0.75, 1.35, 1.95, 2.5]) {
    rk.box(mm.steel, 1.85, 0.03, 0.55, 0, ly, 0);
    let x = -0.85; while (x < 0.75) { const w = 0.2 + R() * 0.3, h = 0.15 + R() * 0.3; if (R() < 0.75) rk.rbox(paint([0xb8905a, 0xc8a070, 0xa8804a, 0x2a5ab8, 0xc8281e][(R() * 5) | 0], 0.85), w, h, 0.4, 0.01, x + w / 2, ly + 0.015 + h / 2, 0); else { rk.cyl(paint(0xe8e4da, 0.5), 0.07, 0.07, 0.15, x + 0.08, ly + 0.09, 0, 0, 0, 0, 12); rk.cyl(paint(0x2a5ab8, 0.5), 0.07, 0.07, 0.15, x + 0.08, ly + 0.09, -0.15, 0, 0, 0, 12); } x += w + 0.04; }
  }
  for (let i = 0; i < 3; i++) rk.cyl(mm.steel, 0.08, 0.06, 0.12, 0.3 + i * 0.18, 0.8, 0.15, 0, 0, 0, 10);
  colBox(tg, cols, 1.9, 2.6, 0.6, 1.4, 1.3, -8.6);
  // ---------- oficina con ventana ----------
  const OXa = 3.0, OZa = -6.6;
  K.wbox(mm.block, 0.15, 1.0, D - 0.22 + OZa, OXa, 0.5, (OZa - D + 0.22) / 2, 0.5);
  K.wbox(mm.block, 0.15, 0.6, D - 0.22 + OZa, OXa, 2.5, (OZa - D + 0.22) / 2, 0.5);
  K.wbox(mm.block, HW2 - 0.22 - OXa, 2.8, 0.15, (OXa + HW2 - 0.22) / 2, 1.4, OZa, 0.5);
  K.plane(mm.glass, D - 0.22 + OZa, 1.0, OXa - 0.08, 1.5, (OZa - D + 0.22) / 2, 0, -PI / 2);
  for (const z of [OZa, (OZa - D + 0.22) / 2, -D + 0.24]) K.box(mm.alum, 0.08, 1.0, 0.05, OXa - 0.08, 1.5, z);
  K.box(mm.frame, (HW2 - 0.22 - OXa), 2.1, 0.05, (OXa + HW2 - 0.22) / 2, 1.05, OZa + 0.08);
  K.box(C.wood(0x6a4a2a), 0.9, 2.05, 0.04, (OXa + HW2 - 0.22) / 2, 1.03, OZa + 0.11);
  K.cyl(mm.chrome, 0.015, 0.015, 0.1, (OXa + HW2 - 0.22) / 2 + 0.35, 1.0, OZa + 0.16, PI / 2, 0, 0, 6);
  K.box(mm.ceiling, HW2 - 0.22 - OXa, 0.05, D - 0.22 + OZa, (OXa + HW2 - 0.22) / 2, 2.82, (OZa - D + 0.22) / 2);
  K.plane(texM(handSign(['OFICINA'], { bg: '#1f3f6a', fg: '#ffffff', font: '800 #px Rubik, system-ui', w: 256, h: 64 })), 0.6, 0.15, (OXa + HW2 - 0.22) / 2, 2.25, OZa + 0.08);
  // escritorio, silla, computadora, archivero
  const ofx = (OXa + HW2 - 0.22) / 2, ofz = (OZa - D + 0.22) / 2;
  K.rbox(C.wood(0x6a4a2a), 1.3, 0.05, 0.6, 0.01, ofx, 0.75, ofz - 0.35); K.box(C.wood(0x5a3a1a), 1.25, 0.7, 0.04, ofx, 0.38, ofz - 0.6);
  K.rbox(mm.black, 0.4, 0.3, 0.03, 0.01, ofx, 1.05, ofz - 0.55); K.plane(glowM(screenAtlas(), 0.6), 0.36, 0.26, ofx, 1.05, ofz - 0.534);
  K.rbox(mm.black, 0.45, 0.45, 0.1, 0.04, ofx, 0.95, ofz + 0.35); K.rbox(mm.black, 0.45, 0.08, 0.45, 0.03, ofx, 0.5, ofz + 0.15); K.cyl(mm.chrome, 0.025, 0.025, 0.45, ofx, 0.25, ofz + 0.15, 0, 0, 0, 6);
  K.rbox(paint(0x7a8088, 0.5), 0.45, 1.3, 0.6, 0.02, HW2 - 0.5, 0.65, OZa - 0.6);
  for (let i = 0; i < 4; i++) K.box(mm.chrome, 0.15, 0.02, 0.02, HW2 - 0.5 - 0.0, 1.15 - i * 0.3, OZa - 0.29);
  for (let i = 0; i < 3; i++) { K.cyl(C.gold(), 0.04, 0.06, 0.04, ofx - 0.5 + i * 0.12, 0.8, ofz - 0.55, 0, 0, 0, 10); K.lathe(C.gold(), [[0, 0], [0.05, 0.02], [0.02, 0.1], [0.06, 0.2], [0.05, 0.22]], ofx - 0.5 + i * 0.12, 0.82, ofz - 0.55, 10); }
  posterK(K, ofx, 1.9, -D + 0.235, 0.6, 0.85, calendarTex('Refaccionaria El Pistón'));
  colBox(tg, cols, HW2 - 0.22 - OXa + 0.2, 2.9, D - 0.22 + OZa + 0.1, (OXa + HW2 - 0.22) / 2, 1.45, (OZa - D + 0.22) / 2);
  // ---------- rack de llantas (pared izquierda, al frente) ----------
  const tr = K.sub(-HW2 + 0.55, 0, -2.6);
  for (const sz of [-1, 1]) for (const yy of [0.05, 1.0, 1.95]) tr.box(paint(0x2a2a2a, 0.5), 0.6, 0.04, 0.04, 0, yy, sz * 1.0);
  for (const sx of [-0.28, 0.28]) for (const sz of [-1, 1]) tr.box(paint(0x2a2a2a, 0.5), 0.04, 2.4, 0.04, sx, 1.2, sz * 1.0);
  for (const yy of [0.05, 1.0]) for (let i = 0; i < 5; i++) { tr.tor(mm.rubber, 0.3, 0.1, 0, yy + 0.4, -0.8 + i * 0.4, 0, PI / 2, 0, TAU, 22, 8); tr.cyl(mm.steel, 0.17, 0.17, 0.16, 0, yy + 0.4, -0.8 + i * 0.4, 0, 0, PI / 2, 14); }
  colBox(tg, cols, 0.7, 2.4, 2.2, -HW2 + 0.55, 1.2, -2.6);
  // ---------- tambos de aceite ----------
  const drum = (x, z, col, lbl) => {
    const dm = mat(col, { roughness: 0.45, metalness: 0.4, env: true, envI: 0.4 });
    K.cyl(dm, 0.29, 0.29, 0.88, x, 0.44, z, 0, 0, 0, 20);
    for (const y of [0.3, 0.6]) K.tor(dm, 0.29, 0.015, x, y, z, PI / 2, 0, 0, TAU, 20, 4);
    K.cyl(metal(0x5a5a5a, 0.5), 0.27, 0.27, 0.01, x, 0.885, z, 0, 0, 0, 20);
    if (lbl) K.plane(texM(handSign([lbl], { bg: '#f2efe6', fg: '#1a1a1a', font: '800 #px Rubik, system-ui', w: 128, h: 64 })), 0.3, 0.15, x, 0.55, z + 0.292);
  };
  drum(4.7, -0.8, 0x1f5ab8, 'ACEITE'); drum(4.7, -1.45, 0xc8281e, 'USADO'); drum(4.05, -0.8, 0xf2c230, null);
  K.cyl(mm.steel, 0.02, 0.02, 0.9, 4.7, 1.2, -0.8, 0, 0, 0, 6); K.rbox(mm.steel, 0.1, 0.15, 0.1, 0.02, 4.7, 1.6, -0.8); K.tube(mm.cable, [[4.7, 1.55, -0.75], [4.4, 1.2, -0.5], [4.3, 0.95, -0.5]], 0.012, 8, 5);
  colBox(tg, cols, 1.3, 1.0, 1.3, 4.45, 0.5, -1.15);
  // ---------- compresor con manguera ----------
  const cp = K.sub(HW2 - 0.6, 0, -3.3, 0, PI / 2);
  cp.lathe(paint(0xc8281e, 0.35), [[0, -0.6], [0.2, -0.6], [0.28, -0.55], [0.3, -0.45], [0.3, 0.45], [0.28, 0.55], [0.2, 0.6], [0, 0.6]], 0, 0.42, 0, 20, 0, 0, PI / 2);
  for (const sx of [-0.4, 0.4]) cp.box(mm.iron, 0.08, 0.15, 0.4, sx, 0.07, 0);
  cp.rbox(paint(0x2a2a2a, 0.4), 0.35, 0.3, 0.3, 0.04, -0.2, 0.85, 0); cp.cyl(paint(0x5a5a5a, 0.5), 0.12, 0.12, 0.25, 0.2, 0.85, 0, 0, 0, PI / 2, 14);
  cp.cyl(mm.steel, 0.13, 0.13, 0.03, 0.36, 0.85, 0.1, 0, 0, PI / 2, 18); cp.cyl(mm.chrome, 0.05, 0.05, 0.02, -0.4, 0.75, 0.3, PI / 2, 0, 0, 12);
  cp.tube(mm.black, [[-0.4, 0.75, 0.3], [-0.6, 0.4, 0.6], [-1.2, 0.02, 0.9], [-2.0, 0.02, 1.2], [-2.6, 0.02, 0.6]], 0.012, 30, 5);
  colBox(tg, cols, 0.7, 1.1, 1.3, HW2 - 0.6, 0.55, -3.3);
  // carrete de manguera en el muro
  K.cyl(paint(0xf2c230, 0.4), 0.25, 0.25, 0.04, HW2 - 0.3, 2.0, -2.3, 0, 0, PI / 2, 20); for (let i = 0; i < 4; i++) K.tor(mm.black, 0.17 - i * 0.002, 0.018, HW2 - 0.36 - i * 0.03, 2.0, -2.3, 0, PI / 2, 0, TAU, 20, 5);
  // ---------- motor V8 en su base ----------
  const en = K.sub(-0.2, 0, -1.5, 0, 0.5), enM = paint(0x1f5ab8, 0.45);
  en.box(paint(0xc8281e, 0.4), 0.08, 0.08, 1.0, 0, 0.08, 0); en.box(paint(0xc8281e, 0.4), 0.8, 0.08, 0.08, 0, 0.08, -0.4);
  for (const [a, b] of [[-0.4, -0.4], [0.4, -0.4], [0, 0.5]]) en.sph(mm.black, 0.04, a, 0.04, b, 1, 1, 1, 8);
  en.box(paint(0xc8281e, 0.4), 0.08, 0.8, 0.08, 0, 0.5, -0.4); en.box(paint(0xc8281e, 0.4), 0.08, 0.08, 0.4, 0, 0.9, -0.2);
  en.rbox(enM, 0.5, 0.42, 0.6, 0.03, 0, 1.0, 0.25);
  for (const sx of [-1, 1]) { en.rbox(enM, 0.2, 0.25, 0.6, 0.03, sx * 0.24, 1.26, 0.25, 0, 0, sx * 0.6); en.rbox(mm.chrome, 0.12, 0.06, 0.62, 0.02, sx * 0.34, 1.4, 0.25, 0, 0, sx * 0.6); }
  en.rbox(mm.steel, 0.26, 0.12, 0.4, 0.03, 0, 1.36, 0.25); en.cyl(mm.chrome, 0.2, 0.2, 0.08, 0, 1.5, 0.25, 0, 0, 0, 20);
  en.cyl(mm.steel, 0.16, 0.16, 0.05, 0, 1.0, 0.58, PI / 2, 0, 0, 18); en.cyl(mm.black, 0.07, 0.07, 0.08, 0.12, 1.15, 0.58, PI / 2, 0, 0, 12);
  colBox(tg, cols, 0.9, 1.6, 1.1, -0.2, 0.8, -1.5);
  // ---------- luces, carteles, extintor, altar ----------
  for (const x of [-3.2, 0, 3.0]) for (const z of [-2.9, -6.9]) { K.cyl(mm.steel, 0.004, 0.004, 0.55, x - 0.5, Hw - 0.33, z, 0, 0, 0, 4); K.cyl(mm.steel, 0.004, 0.004, 0.55, x + 0.5, Hw - 0.33, z, 0, 0, 0, 4); fluo(K, x, Hw - 0.6, z, 1.22, 0); }
  // extintor
  const ex = K.sub(OX1 + 0.4, 0, -0.32);
  ex.box(mm.steel, 0.12, 0.06, 0.08, 0, 1.45, -0.02);
  ex.lathe(paint(0xc8140e, 0.35), [[0, 0], [0.08, 0], [0.085, 0.02], [0.085, 0.5], [0.06, 0.56], [0.025, 0.58], [0, 0.58]], 0, 0.9, 0.06, 18);
  ex.rbox(mm.black, 0.05, 0.08, 0.1, 0.01, 0, 1.52, 0.06); ex.tube(mm.black, [[0.02, 1.5, 0.08], [0.1, 1.3, 0.14], [0.08, 1.0, 0.15]], 0.01, 8, 5);
  ex.plane(texM(handSign(['EXTINTOR'], { bg: '#c8140e', fg: '#ffffff', font: '800 #px Rubik, system-ui', w: 256, h: 64 })), 0.36, 0.1, 0, 1.75, -0.059);
  for (const [x, y, z, ry, tex, w, h] of [[-HW2 + 0.235, 2.6, -5.5, PI / 2, artPoster('MUSTANG 66', '#1f3f6a', '#f2c230', 'tp1'), 0.7, 0.98], [-HW2 + 0.235, 2.6, -6.5, PI / 2, artPoster('VOCHO 72', '#c8281e', '#ffffff', 'tp2'), 0.7, 0.98], [HW2 - 0.235, 2.4, -1.7, -PI / 2, handSign(['NO FUMAR'], { bg: '#ffffff', fg: '#c8281e', font: '800 #px Rubik, system-ui', w: 256, h: 128 }), 0.6, 0.3], [-1.4, 2.5, -D + 0.235, 0, calendarTex('Taller de Restauración'), 0.6, 0.85], [-2.6, 3.0, -D + 0.235, 0, boardTex('tallerpz', 'Pendientes', [['Vocho 72 · primer', 'mar'], ['Sedán · frenos', 'mié'], ['Combi · motor', 'vie']], { w: 512, h: 300 }), 1.0, 0.6]]) posterK(K, x, y, z, w, h, tex, ry);
  altarK(K, 0.0, 2.2, -D + 0.24, 0);
  clockK(K, 1.4, 3.3, -D + 0.24, 0);
  // radio sobre la estantería
  K.rbox(paint(0x2a2a2a, 0.5), 0.36, 0.2, 0.14, 0.03, 1.4, 2.75, -8.6); for (const s of [-0.1, 0.1]) K.cyl(mm.steel, 0.06, 0.06, 0.01, 1.4 + s, 2.75, -8.53, PI / 2, 0, 0, 14); K.cyl(mm.chrome, 0.004, 0.004, 0.5, 1.55, 3.05, -8.6, 0, 0, 0.4, 4);
  // ---------- patio: caballete, llantas, tambo-bote ----------
  aFrame(K, tg, cols, -4.6, 1.8, 0.35, handSign(['Restauramos', 'tu clásico', 'Cotiza aquí'], { bg: '#1f3f6a', fg: '#f2c230', accent: '#ffffff', w: 256, h: 380 }));
  for (let i = 0; i < 4; i++) K.tor(mm.rubber, 0.3, 0.1, 4.8, 0.1 + i * 0.2, 1.2, PI / 2, 0, 0, TAU, 22, 8);
  colBox(tg, cols, 0.9, 0.9, 0.9, 4.8, 0.45, 1.2);
  K.cyl(paint(0x2a5a3a, 0.5), 0.29, 0.29, 0.88, 4.7, 0.44, 2.4, 0, 0, 0, 20); K.cyl(mats().black, 0.27, 0.27, 0.02, 4.7, 0.86, 2.4, 0, 0, 0, 20);
  colBox(tg, cols, 0.6, 0.9, 0.6, 4.7, 0.45, 2.4);
  // banqueta y bocina de taller
  K.rbox(mm.planks, 1.5, 0.06, 0.4, 0.01, 2.2, 0.45, 0.4); for (const sx of [-0.65, 0.65]) K.box(mm.iron, 0.05, 0.45, 0.38, 2.2 + sx, 0.225, 0.4);
  colBox(tg, cols, 1.6, 0.6, 0.5, 2.2, 0.3, 0.4);
  K.build(tg);
  tg.updateMatrixWorld(true);
}
