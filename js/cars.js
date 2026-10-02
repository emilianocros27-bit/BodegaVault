// Autos procedurales. La carrocería es un "loft": una serie de secciones transversales a lo largo
// de x (frente = +x), cada una con techo abombado, cristales con caída hacia adentro (tumblehome),
// hombro, costado con recogido inferior y arcos de rueda. En planta la carrocería se afina hacia
// las defensas con una superelipse. Cristales, molduras y bajos salen del mismo mallado (grupos
// de material), así que siempre quedan pegados a la superficie. Los detalles (faros, parrilla,
// espejos, manijas...) se colocan consultando la superficie (parches que siguen la carrocería con
// texturas de canvas) y se fusionan por material para mantener pocas llamadas de dibujo.
//
// API:
//   makeCar(type, color, opts) -> THREE.Group   (frente +x, origen al centro en el piso, metros)
//     type: 'sedan' | 'vocho' | 'pickup' | 'taxi' | 'police' | cualquier id de CAR_MODELS
//   Las ruedas son grupos hijos con userData.wheel = true (radio en userData.radius). Para girarlas:
//     wheel.rotation.z -= velocidad * dt / wheel.userData.radius
//   CAR_MODELS, CAR_CATEGORIES, CAR_RARITIES, carInfo(id)  (ver car-models.js)
import { THREE, mat, metal, canvasTex, labelTex } from './modelkit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { CAR_MODELS, CAR_CATEGORIES, CAR_RARITIES, carInfo } from './car-models.js';
export { CAR_MODELS, CAR_CATEGORIES, CAR_RARITIES, carInfo };

// ------------------------------------------------------------------ materiales
const MT = {
  tire: () => mat(0x1b1b1b, { roughness: 0.9 }),
  wall: () => mat(0x111111, { roughness: 0.95 }),
  rim: () => metal(0xc9cdd1, 0.3),
  steelRim: (c) => mat(c, { roughness: 0.35, metalness: 0.5, env: true, envI: 0.6 }),
  chrome: () => metal(0xeef1f4, 0.08),
  glass: () => mat(0x0d1318, { roughness: 0.03, metalness: 0.4, env: true, envI: 1.6 }),
  trim: () => mat(0x141414, { roughness: 0.55 }),
  gloss: () => mat(0x0c0c0c, { roughness: 0.15, metalness: 0.3, env: true, envI: 0.8 }),
  plastic: () => mat(0x26272a, { roughness: 0.7 }),
  under: () => mat(0x0b0b0b, { roughness: 0.95 }),
  head: () => mat(0xf2f5f7, { emissive: 0xfff4d8, emissiveIntensity: 0.35, roughness: 0.04, metalness: 0.25, env: true, envI: 1.4 }),
  reflector: () => metal(0xdfe3e6, 0.12),
  tail: () => mat(0x9a0c0c, { emissive: 0xff1a0a, emissiveIntensity: 0.4, roughness: 0.12, env: true, envI: 0.8 }),
  amber: () => mat(0xd8820e, { emissive: 0xff8a00, emissiveIntensity: 0.25, roughness: 0.15, env: true, envI: 0.8 }),
  clear: () => mat(0xe6e8ea, { roughness: 0.08, metalness: 0.2, env: true, envI: 1.2 }),
  engine: () => mat(0x3a3c3e, { roughness: 0.55, metalness: 0.6 }),
  bay: () => mat(0x1a1b1c, { roughness: 0.8 }),
  seat: () => mat(0x2a2624, { roughness: 0.9 }),
  soft: () => mat(0x1e1e1e, { roughness: 0.95, map: canvasTex('softtop', 64, 64, (c, w, h) => { c.fillStyle = '#bbb'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < w; i += 2) { c.fillRect(i, 0, 1, h); c.fillRect(0, i, w, 1); } }, true) }),
};

// pintura con barniz (clearcoat). El mapa de entorno se toma del de modelkit (setEnvMap).
let _probe = null;
const probe = () => (_probe ??= mat(0xfefefe, { env: true, envI: 1, roughness: 0.99 }));
const paintCache = new Map();
function paintMat(color, rough = 0.32, o = {}) {
  const c = new THREE.Color(color), hsl = {}; c.getHSL(hsl);
  const metalness = o.metal ?? (hsl.s < 0.18 && hsl.l > 0.3 && hsl.l < 0.85 ? 0.62 : 0.28);
  const key = [color, rough, metalness, o.cc ?? 1].join('|');
  if (paintCache.has(key)) return paintCache.get(key);
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness, clearcoat: o.cc ?? 1, clearcoatRoughness: 0.05, envMapIntensity: 1.0 });
  Object.defineProperty(m, 'envMap', { get: () => probe().envMap, set: () => {}, configurable: true });
  paintCache.set(key, m);
  return m;
}
// si el entorno cambia después de compilar, recompila las pinturas
function envWatch(mesh) {
  mesh.onBeforeRender = () => {
    const e = probe().envMap;
    if (e === _envSeen) return; _envSeen = e;
    for (const m of paintCache.values()) m.needsUpdate = true;
  };
}
let _envSeen = null;

function plateTex(txt) {
  return canvasTex('plate' + txt, 256, 128, (c, w, h) => {
    c.fillStyle = '#f2f2ea'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#7a1a2a'; c.fillRect(0, 0, w, 26);
    c.fillStyle = '#fff'; c.font = 'bold 18px system-ui'; c.textAlign = 'center'; c.fillText('MÉXICO', w / 2, 19);
    c.fillStyle = '#1a1a1a'; c.font = 'bold 56px system-ui'; c.fillText(txt, w / 2, 90);
    c.font = '14px system-ui'; c.fillText('CIUDAD DE MÉXICO', w / 2, 118);
    c.strokeStyle = '#333'; c.lineWidth = 4; c.strokeRect(2, 2, w - 4, h - 4);
  });
}
const PLATES = [];
const rndPlate = () => {
  if (PLATES.length >= 24) return PLATES[(Math.random() * PLATES.length) | 0];
  const L = 'ABCDEFGHJKLMNPRSTUVWXYZ'; const r = () => L[(Math.random() * L.length) | 0];
  const p = `${r()}${r()}${r()}-${(100 + Math.random() * 899) | 0}`; PLATES.push(p); return p;
};

// ------------------------------------------------------------------ texturas de faros, calaveras y parrillas
const hexs = (n) => '#' + (n >>> 0).toString(16).padStart(6, '0');
function polyPath(c, poly, W, H, inset = 0) {
  const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
  c.beginPath();
  poly.forEach(([u, v], i) => {
    const uu = u + (cx - u) * inset, vv = v + (cy - v) * inset;
    const X = uu * W, Y = (1 - vv) * H; i ? c.lineTo(X, Y) : c.moveTo(X, Y);
  });
  c.closePath();
}
const rrPoly = (r = 0.18, n = 5) => { // rectángulo redondeado normalizado
  const p = [];
  for (const [cx, cy, a0] of [[1 - r, r, -Math.PI / 2], [1 - r, 1 - r, 0], [r, 1 - r, Math.PI / 2], [r, r, Math.PI]])
    for (let i = 0; i <= n; i++) { const a = a0 + (Math.PI / 2) * i / n; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  return p;
};
const ellPoly = (n = 28) => { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([0.5 + 0.5 * Math.cos(a), 0.5 + 0.5 * Math.sin(a)]); } return p; };
function chromeGrad(c, x0, y0, x1, y1) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#f6f8fa'); g.addColorStop(0.45, '#9da3a8'); g.addColorStop(0.55, '#6d7378'); g.addColorStop(1, '#e4e7ea');
  return g;
}
function reflector(c, x, y, r, tint = '#ffffff') {
  const g = c.createRadialGradient(x - r * 0.2, y - r * 0.25, r * 0.05, x, y, r);
  g.addColorStop(0, tint); g.addColorStop(0.35, '#c9d0d6'); g.addColorStop(0.8, '#707880'); g.addColorStop(1, '#2a2e32');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
}
function lens(c, x, y, r) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r);
  g.addColorStop(0, '#ffffff'); g.addColorStop(0.3, '#a8b4c0'); g.addColorStop(0.75, '#1b2229'); g.addColorStop(1, '#050608');
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.strokeStyle = '#d8dde2'; c.lineWidth = Math.max(1, r * 0.12); c.beginPath(); c.arc(x, y, r * 1.05, 0, 7); c.stroke();
}
function ribs(c, W, H, a = 0.22, sx = 7, sy = 6) {
  c.fillStyle = `rgba(255,255,255,${a})`; for (let x = 0; x < W; x += sx) c.fillRect(x, 0, 1.5, H);
  c.fillStyle = `rgba(0,0,0,${a * 0.7})`; for (let y = 0; y < H; y += sy) c.fillRect(0, y, W, 1.5);
}
// kind: tipo de lámpara; poly: silueta normalizada (u: 0 = lado interior, 1 = exterior; v: 0 = abajo)
function lampTex(kind, aspect, poly, extra = '') {
  const W = 256, H = Math.max(32, Math.min(256, Math.round(256 / Math.max(0.5, aspect) / 16) * 16));
  poly = poly || rrPoly(kind.startsWith('h') || kind.startsWith('t') ? 0.2 : 0.3);
  return canvasTex(`lamp|${kind}|${W}|${H}|${JSON.stringify(poly)}|${extra}`, W, H, (c) => {
    c.save(); polyPath(c, poly, W, H); c.clip();
    const bg = (a, b) => { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H); };
    if (kind === 'hmod' || kind === 'hmod2') {
      bg('#3a4046', '#101214');
      const r = H * 0.28;
      if (kind === 'hmod2') { lens(c, W * 0.3, H * 0.5, r * 0.9); lens(c, W * 0.55, H * 0.5, r * 0.9); }
      else { lens(c, W * 0.32, H * 0.52, r); reflector(c, W * 0.64, H * 0.5, r * 1.05, '#fafcff'); }
      c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, 0, W, H * 0.3);
      if (extra.includes('a')) { c.fillStyle = '#e08a18'; c.fillRect(W * 0.86, H * 0.2, W * 0.14, H * 0.6); ribs(c, W, H, 0.12); }
      c.shadowColor = '#ffffff'; c.shadowBlur = 10; c.strokeStyle = '#ffffff'; c.lineWidth = H * 0.13;
      polyPath(c, poly, W, H, 0.02); c.stroke(); c.shadowBlur = 0;
    } else if (kind === 'hled') {
      bg('#23272b', '#08090a');
      for (let i = 0; i < 3; i++) { c.fillStyle = '#9aa4ae'; c.fillRect(W * (0.2 + i * 0.2), H * 0.35, W * 0.1, H * 0.3); c.fillStyle = '#e8eef4'; c.fillRect(W * (0.22 + i * 0.2), H * 0.42, W * 0.06, H * 0.16); }
      c.shadowColor = '#fff'; c.shadowBlur = 8; c.fillStyle = '#ffffff'; c.fillRect(0, H * 0.02, W, H * 0.2); c.shadowBlur = 0;
      if (extra.includes('a')) { c.fillStyle = '#e08a18'; c.fillRect(W * 0.88, 0, W * 0.12, H); }
    } else if (kind === 'hrect' || kind === 'hrecta') {
      bg('#eef1f3', '#b8bec4');
      const g = c.createRadialGradient(W * 0.45, H * 0.5, 2, W * 0.45, H * 0.5, H * 0.9); g.addColorStop(0, '#ffffff'); g.addColorStop(1, 'rgba(160,170,178,0.2)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      ribs(c, W, H, 0.3, 6, 5);
      if (kind === 'hrecta') { c.fillStyle = '#e08a18'; c.fillRect(W * 0.8, 0, W * 0.2, H); ribs(c, W, H, 0.12, 6, 5); c.fillStyle = '#333'; c.fillRect(W * 0.795, 0, 3, H); }
    } else if (kind === 'hround' || kind === 'hround2') {
      bg('#2a2e32', '#0e1012');
      const n = kind === 'hround2' ? 2 : 1, r = Math.min(H * 0.46, W / n * 0.46);
      for (let i = 0; i < n; i++) {
        const x = W * (i + 0.5) / n, y = H / 2; reflector(c, x, y, r);
        c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 1;
        for (let k = 1; k < 5; k++) { c.beginPath(); c.arc(x, y, r * k / 5, 0, 7); c.stroke(); }
        for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(x + k * r / 4.5, y - r); c.lineTo(x + k * r / 4.5, y + r); c.stroke(); }
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, r * 0.16, 0, 7); c.fill();
      }
    } else if (kind === 'hlens') { // lente redonda (faro 3D)
      reflector(c, W / 2, H / 2, W * 0.5);
      c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 2;
      for (let k = 1; k < 6; k++) { c.beginPath(); c.arc(W / 2, H / 2, W * 0.5 * k / 6, 0, 7); c.stroke(); }
      for (let k = -5; k <= 5; k++) { c.beginPath(); c.moveTo(W / 2 + k * W / 11, 0); c.lineTo(W / 2 + k * W / 11, H); c.stroke(); }
      const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.18); g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    } else if (kind === 'tmod') {
      bg('#4a0507', '#1c0203');
      c.fillStyle = 'rgba(255,40,40,0.18)'; for (let y = H * 0.25; y < H * 0.8; y += H * 0.18) c.fillRect(W * 0.1, y, W * 0.8, H * 0.05);
      c.fillStyle = 'rgba(235,235,235,0.75)'; c.fillRect(W * 0.04, H * 0.62, W * 0.22, H * 0.24);
      c.shadowColor = '#ff2020'; c.shadowBlur = 12; c.strokeStyle = '#ff3030'; c.lineWidth = H * 0.12;
      polyPath(c, poly, W, H, 0.12); c.stroke(); c.shadowBlur = 0;
    } else if (kind === 'tclassic' || kind === 'tred' || kind === 'tred2') {
      bg('#c01812', '#7a0806'); ribs(c, W, H, 0.18, 5, 6);
      if (kind === 'tclassic') { c.fillStyle = '#e8870f'; c.fillRect(W * 0.72, 0, W * 0.28, H); c.fillStyle = '#e8e8e6'; c.fillRect(0, 0, W * 0.2, H); ribs(c, W, H, 0.15, 5, 6); c.fillStyle = '#222'; c.fillRect(W * 0.2, 0, 2, H); c.fillRect(W * 0.72, 0, 2, H); }
      if (kind === 'tred2') { c.fillStyle = '#e8e8e6'; c.fillRect(0, H * 0.55, W * 0.3, H * 0.45); }
    } else if (kind === 'tround2' || kind === 'tround1' || kind === 'tround3') {
      bg('#1a1a1a', '#0a0a0a');
      const n = kind === 'tround3' ? 3 : kind === 'tround2' ? 2 : 1, r = Math.min(H * 0.44, W / n * 0.44);
      for (let i = 0; i < n; i++) {
        const x = W * (i + 0.5) / n, g = c.createRadialGradient(x, H / 2, 1, x, H / 2, r);
        g.addColorStop(0, '#ff5a4a'); g.addColorStop(0.6, '#c01410'); g.addColorStop(1, '#6a0504');
        c.fillStyle = g; c.beginPath(); c.arc(x, H / 2, r, 0, 7); c.fill();
        c.strokeStyle = '#d8dde2'; c.lineWidth = r * 0.12; c.stroke();
        c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.arc(x, H / 2, r * k / 4, 0, 7); c.stroke(); }
      }
    } else if (kind === 'tsmoke') {
      bg('#2a0a0b', '#0b0303');
      c.shadowColor = '#ff2020'; c.shadowBlur = 10; c.fillStyle = '#ff3a30';
      for (let i = 0; i < 3; i++) c.fillRect(W * 0.06, H * (0.2 + i * 0.25), W * 0.88, H * 0.07);
      c.shadowBlur = 0;
    } else if (kind === 'tbars3') { // tres barras verticales (Mustang)
      bg('#2a0506', '#100202'); c.shadowColor = '#ff2020'; c.shadowBlur = 10; c.fillStyle = '#ff3528';
      for (let i = 0; i < 3; i++) c.fillRect(W * (0.08 + i * 0.31), H * 0.08, W * 0.2, H * 0.84);
      c.shadowBlur = 0;
    } else if (kind === 'amber') { bg('#f0a030', '#c06a08'); ribs(c, W, H, 0.2, 5, 5); }
    else if (kind === 'clear') { bg('#f4f6f8', '#c4cad0'); ribs(c, W, H, 0.25, 5, 5); }
    else if (kind === 'fog') {
      bg('#1a1c1e', '#0a0b0c'); const r = Math.min(W, H) * 0.42; reflector(c, W / 2, H / 2, r, '#fffbe8');
    } else if (kind === 'drl') { bg('#15171a', '#0a0b0c'); c.shadowColor = '#fff'; c.shadowBlur = 8; c.fillStyle = '#fff'; c.fillRect(W * 0.04, H * 0.3, W * 0.92, H * 0.4); }
    else if (kind === 'lightbar') { bg('#101010', '#050505'); for (let i = 0; i < 10; i++) { c.fillStyle = '#ffb040'; c.fillRect(W * (0.03 + i * 0.097), H * 0.3, W * 0.07, H * 0.4); } }
    c.restore();
  });
}
// parrillas y rejillas
function grilleTex(kind, aspect, poly, frame = 'chrome', bars = 'chrome') {
  const W = 256, H = Math.max(32, Math.min(256, Math.round(256 / Math.max(0.5, aspect) / 16) * 16));
  poly = poly || rrPoly(0.12);
  return canvasTex(`gr|${kind}|${H}|${JSON.stringify(poly)}|${frame}|${bars}`, W, H, (c) => {
    c.save(); polyPath(c, poly, W, H); c.clip();
    c.fillStyle = '#070808'; c.fillRect(0, 0, W, H);
    const col = bars === 'chrome' ? chromeGrad(c, 0, 0, 0, H) : bars === 'black' ? '#1d1f21' : bars === 'silver' ? '#9ea4a9' : bars === 'gloss' ? '#2c2f33' : bars;
    c.fillStyle = col; c.strokeStyle = col;
    const bw = Math.max(2, H * 0.035);
    if (kind === 'hbar' || kind === 'hbar2' || kind === 'hbar3') {
      const n = kind === 'hbar3' ? 3 : kind === 'hbar2' ? Math.max(3, Math.round(H / 20)) : Math.max(4, Math.round(H / 11));
      for (let i = 1; i <= n; i++) { const y = H * i / (n + 1); c.fillRect(0, y - bw * (kind === 'hbar3' ? 2.2 : 1) / 2, W, bw * (kind === 'hbar3' ? 2.2 : 1)); }
    } else if (kind === 'vbar') {
      const n = Math.max(8, Math.round(W / 11)); for (let i = 1; i < n; i++) c.fillRect(W * i / n - bw / 2, 0, bw, H);
    } else if (kind === 'egg') {
      const n = Math.max(6, Math.round(W / 22)), m = Math.max(2, Math.round(H / 20));
      for (let i = 1; i < n; i++) c.fillRect(W * i / n - bw / 2, 0, bw, H);
      for (let j = 1; j < m; j++) c.fillRect(0, H * j / m - bw / 2, W, bw);
    } else if (kind === 'mesh') {
      c.lineWidth = Math.max(1.5, H * 0.02); const s = 11;
      for (let x = -H; x < W + H; x += s) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + H, H); c.stroke(); c.beginPath(); c.moveTo(x, H); c.lineTo(x + H, 0); c.stroke(); }
    } else if (kind === 'honey') {
      c.lineWidth = 2; const r = 8, hh = r * Math.sqrt(3);
      for (let y = 0, row = 0; y < H + hh; y += hh / 2, row++) for (let x = (row % 2) * r * 1.5; x < W + r * 3; x += r * 3) {
        c.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.stroke();
      }
    } else if (kind === 'dots') {
      for (let y = 6; y < H; y += 10) for (let x = 6 + ((y / 10) % 2) * 5; x < W; x += 10) { c.beginPath(); c.arc(x, y, 3, 0, 7); c.fill(); }
    } else if (kind === 'louver') {
      c.fillStyle = '#070808'; c.fillRect(0, 0, W, H);
      const n = Math.max(5, Math.round(H / 10)); for (let i = 0; i < n; i++) { const g = c.createLinearGradient(0, H * i / n, 0, H * (i + 0.7) / n); g.addColorStop(0, typeof col === 'string' ? col : '#444'); g.addColorStop(1, '#101010'); c.fillStyle = g; c.fillRect(0, H * i / n, W, H * 0.6 / n); }
    } else if (kind === 'vlouver') {
      const n = Math.max(6, Math.round(W / 12)); for (let i = 0; i < n; i++) { c.fillRect(W * i / n, 0, W * 0.55 / n, H); }
    } else if (kind.startsWith('slots')) { // ranuras verticales sobre fondo transparente (Jeep)
      c.clearRect(0, 0, W, H); const n = +kind.slice(5) || 7, sw = W / n;
      for (let i = 0; i < n; i++) { const x = sw * i + sw * 0.22, w = sw * 0.56; c.fillStyle = '#060606'; c.beginPath(); c.roundRect(x, H * 0.04, w, H * 0.92, w * 0.45); c.fill(); c.strokeStyle = typeof col === 'string' ? col : '#888'; c.lineWidth = 2; c.stroke(); }
    } else if (kind.startsWith('txt:')) { // letras sobre parrilla (RAM, BRONCO)
      c.fillStyle = '#0d0e0f'; c.fillRect(0, 0, W, H);
      const t = kind.slice(4); c.font = `900 ${Math.round(Math.min(H * 0.55, W / t.length * 1.25))}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = typeof col === 'string' ? col : '#d8dce0'; c.fillText(t, W / 2, H / 2 + 2);
    } else if (kind === 'outline') { c.clearRect(0, 0, W, H);
    } else if (kind === 'solid') {
      c.fillStyle = col; c.fillRect(0, 0, W, H);
    } else if (kind === 'naca') {
      const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, '#303234'); g.addColorStop(1, '#030303'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
    if (frame !== 'none') {
      c.lineWidth = Math.max(3, H * 0.09);
      c.strokeStyle = frame === 'chrome' ? chromeGrad(c, 0, 0, 0, H) : frame === 'black' ? '#1a1b1d' : frame;
      polyPath(c, poly, W, H); c.stroke();
    }
    c.restore();
  });
}
function stripeTex(col, n = 2) {
  return canvasTex(`stripe|${col}|${n}`, 64, 64, (c, W, H) => {
    c.fillStyle = hexs(col);
    if (n === 1) c.fillRect(0, H * 0.1, W, H * 0.8);
    else { c.fillRect(0, H * 0.04, W, H * 0.38); c.fillRect(0, H * 0.58, W, H * 0.38); }
  });
}

// ------------------------------------------------------------------ utilidades
const _o = new THREE.Object3D();
function TM(x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) {
  _o.position.set(x, y, z); _o.rotation.set(rx, ry, rz); _o.scale.set(sx, sy, sz); _o.updateMatrix(); return _o.matrix.clone();
}
const _up = new THREE.Vector3(0, 0, 1);
function TQ(x, y, z, dir, s = 1) { // orienta +z local hacia dir
  const q = new THREE.Quaternion().setFromUnitVectors(_up, new THREE.Vector3(...dir).normalize());
  return new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(s, s, s));
}
// Lote de geometrías agrupadas por material -> un mesh por material
class Kit {
  constructor() { this.b = new Map(); }
  add(geo, m, M4) {
    if (!geo) return null;
    if (M4) geo.applyMatrix4(M4);
    const g = geo.index ? geo.toNonIndexed() : geo;
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.clearGroups(); g.morphAttributes = {};
    if (!this.b.has(m)) this.b.set(m, []);
    this.b.get(m).push(g);
    return g;
  }
  box(m, w, h, d, ...t) { return this.add(new THREE.BoxGeometry(w, h, d), m, TM(...t)); }
  rbox(m, w, h, d, r, ...t) { return this.add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2) * 0.999), m, TM(...t)); }
  cyl(m, rt, rb, h, seg, ...t) { return this.add(new THREE.CylinderGeometry(rt, rb, h, seg), m, TM(...t)); }
  sph(m, r, ...t) { return this.add(new THREE.SphereGeometry(r, 16, 12), m, TM(...t)); }
  plane(m, w, h, ...t) { return this.add(new THREE.PlaneGeometry(w, h), m, TM(...t)); }
  build(parent) {
    for (const [m, arr] of this.b) { const mesh = new THREE.Mesh(mergeGeometries(arr, false), m); parent.add(mesh); }
    this.b.clear();
  }
}

// interpolación cúbica monótona (Fritsch–Carlson): perfiles sin sobrepasos
function mono(input) {
  const p = input.slice().sort((a, b) => a[0] - b[0]);
  const n = p.length, xs = p.map(q => q[0]), ys = p.map(q => q[1]), d = [], m = [];
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / Math.max(1e-6, xs[i + 1] - xs[i]);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  const f = (x) => {
    if (x <= xs[0]) return ys[0]; if (x >= xs[n - 1]) return ys[n - 1];
    let i = 0; while (x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = (x - xs[i]) / h, t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
  f.x0 = xs[0]; f.x1 = xs[n - 1];
  return f;
}
const inR = (rs, x) => !!rs && rs.some(([a, b]) => x > a && x < b);

// ------------------------------------------------------------------ carrocería (loft)
const FB = [0, 0.02, 0.3, 0.75, 1, 0.8, 0.3]; // perfil de la cresta de salpicadera por anillo del techo
function makeBody(P) {
  const belt = mono(P.belt), bot0 = mono(P.bot), roofF = P.roof ? mono(P.roof) : null;
  const fend = P.fender ? mono(P.fender) : null;
  const top = (x) => { const b = belt(x) + P.hoodCrown; return roofF && x > roofF.x0 && x < roofF.x1 ? Math.max(b, roofF(x)) : b; };
  const bot = (x) => { let y = bot0(x); for (const w of P.wheels) { const dx = x - w.x; if (Math.abs(dx) < w.a) y = Math.max(y, w.y + Math.sqrt(w.a * w.a - dx * dx)); } return y; };
  const hwAt = (x) => {
    const f = x >= P.xc, tF = P.tF ?? (P.x1 - P.xc), tR = P.tR ?? (P.xc - P.x0);
    const s = Math.max(0, Math.min(1, f ? 1 - (P.x1 - x) / tF : 1 - (x - P.x0) / tR)), n = f ? P.nF : P.nR;
    return P.hw * Math.pow(Math.max(0, 1 - Math.pow(s, n)), 1 / n);
  };
  const levels = (P.levels ?? []).slice().sort((a, b) => b - a);
  const tuck = P.tuck ?? 0.05, shoulder = P.shoulder ?? 0.965, bulge = P.glassBulge ?? 0.01, cx = P.crownExp ?? 2;
  const IDX = { roofEdge: 6, sideStart: 12 };
  const hc = new Map();
  function half(x) {
    const key = Math.round(x * 1e5);
    const hit = hc.get(key); if (hit) return hit;
    const w = hwAt(x), t = top(x), bl = Math.min(belt(x), t), bt = Math.min(bot(x), bl - 0.16);
    const wb = w * shoulder, yE = Math.max(bl, t - P.roofCrown), gh = yE - bl;
    const wr = Math.min(wb, Math.max(0, wb - P.tumble * gh));
    const fb = fend && x > fend.x0 && x < fend.x1 ? Math.max(0, fend(x)) : 0;
    const pts = [];
    const rg = Math.min(0.97, Math.max(0.86, 1 - (P.pillarW ?? 0.06) / Math.max(wr, 0.1)));
    [0, 0.3, 0.55, 0.72, 0.84, rg, 1].forEach((r, i) => pts.push([wr * r, yE + (t - yE) * (1 - Math.pow(r, cx)) + fb * FB[i]]));
    const sp = Math.min(0.45, (P.pillarW ?? 0.06) / Math.max(gh, 1e-3)), ss = Math.min(0.45, 0.028 / Math.max(gh, 1e-3));
    for (const s of [0, sp, 0.5, 1 - ss, 1]) pts.push([wr + (wb - wr) * s + bulge * Math.sin(Math.PI * s) * Math.min(1, gh * 4), yE + (bl - yE) * s]);
    pts.push([wb, bl]);
    pts.push([w * 0.992, bl - 0.03]);
    const yA = bl - 0.085, yB = bt + 0.12, yR = bot0(x) + 0.12;
    const zOf = (y) => w * (1 - tuck * Math.pow(Math.max(0, Math.min(1, (yA - y) / Math.max(0.05, yA - yR))), 2));
    pts.push([w, yA]);
    for (const L of levels) { const y = Math.max(yB, Math.min(yA, L)); pts.push([zOf(y), y]); }
    pts.push([zOf(yB), yB]);
    pts.push([zOf(yB) * 0.975, bt + 0.035]);
    pts.push([zOf(yB) * 0.92, bt]);
    pts.push([0, bt]);
    const r = { pts, gh, w, wr, wb, t, bl, bt, yE };
    if (hc.size > 4000) hc.clear();
    hc.set(key, r);
    return r;
  }
  const segType = (k, n) => {
    if (k < 5) return 'roofG'; if (k < 7) return 'roof';
    if (k === 7) return 'pillar'; if (k === 8 || k === 9) return 'win'; if (k === 10) return 'sill';
    if (k === n - 2) return 'under';
    return 'side';
  };
  let xs = [];
  const N = P.stations ?? 56;
  for (let i = 0; i <= N; i++) xs.push((P.x0 + P.x1) / 2 + (P.x1 - P.x0) / 2 * Math.sin(-Math.PI / 2 + Math.PI * i / N));
  for (const rs of [P.sideWin, P.bpil, P.topGlass, P.hood ? [P.hood] : null]) if (rs) for (const [a, b] of rs) xs.push(a, b);
  for (const w of P.wheels) for (let t = -1.05; t <= 1.051; t += 0.105) xs.push(w.x + t * w.a);
  for (const x of P.extraX ?? []) xs.push(x);
  xs = xs.filter(x => x >= P.x0 && x <= P.x1).sort((a, b) => a - b).filter((x, i, a) => i === 0 || x - a[i - 1] > 0.012);
  if (xs[xs.length - 1] < P.x1) xs.push(P.x1);
  const S = xs.map(half), n = S[0].pts.length, Mr = 2 * n - 2;
  const pos = new Float32Array(xs.length * Mr * 3);
  xs.forEach((x, i) => {
    const pts = S[i].pts;
    for (let j = 0; j < Mr; j++) {
      const k = j < n ? j : 2 * n - 2 - j, sgn = j < n ? 1 : -1, o = (i * Mr + j) * 3;
      pos[o] = x; pos[o + 1] = pts[k][1]; pos[o + 2] = sgn * pts[k][0];
    }
  });
  const buckets = { paint: [], glass: [], trim: [], under: [], lower: [], hood: [], pillar: [], roofp: [] };
  const mold = P.molding;
  for (let i = 0; i < xs.length - 1; i++) {
    const xm = (xs[i] + xs[i + 1]) / 2, gmin = Math.min(S[i].gh, S[i + 1].gh);
    for (let j = 0; j < Mr; j++) {
      const kk = j < n - 1 ? j : (2 * n - 3) - j;
      const type = segType(kk, n);
      let b = 'paint';
      const isHood = P.hood && gmin < 0.005 && xm > P.hood[0] && xm < P.hood[1];
      if (type === 'roofG') b = inR(P.topGlass, xm) && gmin > 0.03 ? 'glass' : isHood ? 'hood' : gmin > 0.1 ? 'roofp' : 'paint';
      else if (type === 'roof') b = isHood ? 'hood' : gmin > 0.1 ? 'roofp' : 'paint';
      else if (type === 'pillar') b = P.blackPillars && gmin > 0.1 && (inR(P.sideWin, xm) || inR(P.bpil, xm)) ? 'trim' : P.pillarRoof && gmin > 0.1 ? 'roofp' : 'paint';
      else if (type === 'win') b = gmin > 0.1 && inR(P.sideWin, xm) ? 'glass' : gmin > 0.1 && inR(P.bpil, xm) ? 'trim' : P.pillarRoof && gmin > 0.1 ? 'roofp' : 'paint';
      else if (type === 'sill') b = gmin > 0.1 && (inR(P.sideWin, xm) || inR(P.bpil, xm)) ? (P.chromeSill ? 'pillar' : 'trim') : 'paint';
      else if (type === 'under') b = 'under';
      else {
        const ka = kk < n - 1 ? kk : 0;
        const ym = (S[i].pts[ka][1] + S[i].pts[ka + 1][1] + S[i + 1].pts[ka][1] + S[i + 1].pts[ka + 1][1]) / 4;
        if (mold && ym > mold[0] && ym < mold[1] && xm > mold[2] && xm < mold[3]) b = mold[4] === 'chrome' ? 'pillar' : 'trim';
        else if (P.split != null && ym < P.split) b = 'lower';
      }
      const a0 = i * Mr + j, a1 = i * Mr + (j + 1) % Mr, c0 = (i + 1) * Mr + j, c1 = (i + 1) * Mr + (j + 1) % Mr;
      buckets[b].push(a0, a1, c0, a1, c1, c0);
    }
  }
  const base = new THREE.BufferGeometry();
  base.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const all = [].concat(...Object.values(buckets));
  base.setIndex(all); base.computeVertexNormals();
  const normal = base.attributes.normal;
  const mk = (names) => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', base.attributes.position); g.setAttribute('normal', normal);
    const idx = []; names.forEach((nm, gi) => { if (buckets[nm].length) g.addGroup(idx.length, buckets[nm].length, gi); idx.push(...buckets[nm]); });
    g.setIndex(idx); return g;
  };
  // consultas de superficie
  function sideZp(p, y) {
    if (y >= p[IDX.roofEdge][1]) return p[IDX.roofEdge][0];
    for (let k = IDX.roofEdge; k < p.length - 2; k++) {
      const [z0, y0] = p[k], [z1, y1] = p[k + 1];
      if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) return z0 + (z1 - z0) * (y - y0) / (y1 - y0);
    }
    return p[p.length - 2][0];
  }
  const sideZ = (x, y) => sideZp(half(x).pts, y);
  // z de la superficie o 0 si a esa altura no hay carrocería
  function zAt(x, y) {
    const h = half(x);
    if (y > h.pts[IDX.roofEdge][1] + 1e-4 || y < h.bt + 0.002 || h.w < 1e-4) return 0;
    return sideZp(h.pts, y);
  }
  function endX(z, y, front = true) {
    let a = front ? P.xc : P.x0, b = front ? P.x1 : P.xc;
    for (let it = 0; it < 30; it++) {
      const m = (a + b) / 2, zm = sideZ(m, y);
      if (front) { if (zm > z) a = m; else b = m; } else { if (zm > z) b = m; else a = m; }
    }
    return (a + b) / 2;
  }
  function onEnd(z, y, front = true) {
    const az = Math.abs(z), x = endX(az, y, front), e = 0.02;
    const dxdz = (endX(az + e, y, front) - endX(Math.max(0, az - e), y, front)) / (az + e - Math.max(0, az - e));
    let nx = front ? 1 : -1, nz = front ? -dxdz : dxdz; const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    if (z < 0) nz = -nz;
    return { x, z, y, nx, nz, ry: Math.atan2(-nz, nx) };
  }
  function onSide(x, y, s = 1) {
    const z = sideZ(x, y), e = 0.02, d = (sideZ(x + e, y) - sideZ(x - e, y)) / (2 * e);
    let nx = -d, nz = 1; const l = Math.hypot(nx, nz); nx /= l; nz /= l;
    return { x, y, z: s * z, nx, nz: s * nz, ry: Math.atan2(-s * nz, nx) };
  }
  function topAt(x, z) {
    const p = half(x).pts; const az = Math.abs(z);
    for (let k = 0; k < IDX.roofEdge; k++) if (az >= p[k][0] && az <= p[k + 1][0] && p[k + 1][0] > p[k][0]) return p[k][1] + (p[k + 1][1] - p[k][1]) * (az - p[k][0]) / (p[k + 1][0] - p[k][0]);
    return p[IDX.roofEdge][1];
  }
  // contorno en planta a una altura: arco desde la punta (s = 0) hacia el costado
  const arcs = new Map();
  function arc(front, y) {
    const key = (front ? 'F' : 'R') + Math.round(y * 1000);
    if (arcs.has(key)) return arcs.get(key);
    const xe = front ? P.x1 : P.x0, M = 64, xsA = [];
    for (let i = 0; i <= M; i++) { const t = i / M; xsA.push(xe + (P.xc - xe) * t * t); }
    const zs = xsA.map(x => zAt(x, y));
    let i0 = zs.findIndex(z => z > 1e-4); if (i0 < 0) i0 = M;
    const pts = [];
    if (i0 > 0) { let a = xsA[i0 - 1], b = xsA[i0]; for (let it = 0; it < 20; it++) { const m = (a + b) / 2; if (zAt(m, y) > 1e-4) b = m; else a = m; } pts.push([b, 0]); }
    for (let i = i0; i <= M; i++) pts.push([xsA[i], zs[i]]);
    const s = [0]; for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const r = { pts, s, len: s[s.length - 1], front };
    arcs.set(key, r); return r;
  }
  function at(front, y, s) {
    const A = arc(front, y), p = A.pts;
    if (p.length < 2) return { x: front ? P.x1 : P.x0, z: 0, nx: front ? 1 : -1, nz: 0 };
    s = Math.max(0, Math.min(A.len, s));
    let i = 1; while (i < p.length - 1 && A.s[i] < s) i++;
    const t = (s - A.s[i - 1]) / Math.max(1e-6, A.s[i] - A.s[i - 1]);
    const x = p[i - 1][0] + (p[i][0] - p[i - 1][0]) * t, z = p[i - 1][1] + (p[i][1] - p[i - 1][1]) * t;
    let dx = p[i][0] - p[i - 1][0], dz = p[i][1] - p[i - 1][1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const nx = front ? dz : -dz, nz = front ? -dx : dx;
    return { x, z, nx, nz };
  }
  function seamGeo(x, k0, k1, both = true, wdt = 0.01, off = 0.003) {
    const p = half(x).pts, v = [], idx = [];
    const sides = both ? [1, -1] : [1];
    for (const s of sides) {
      const st = v.length / 3;
      for (let k = k0; k <= k1; k++) {
        const a = p[Math.max(0, k - 1)], b = p[Math.min(p.length - 1, k + 1)];
        let nz = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nz, ny) || 1; nz /= l; ny /= l;
        const z = s * (p[k][0] + nz * off), y = p[k][1] + ny * off;
        v.push(x - wdt / 2, y, z, x + wdt / 2, y, z);
      }
      for (let k = 0; k < k1 - k0; k++) { const a = st + k * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2, a, a + 2, a + 1, a + 1, a + 2, a + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
    return g;
  }
  return { P, xs, half, mk, buckets, sideZ, zAt, endX, onEnd, onSide, topAt, top, belt, bot, bot0, hwAt, seamGeo, arc, at, IDX };
}

// ------------------------------------------------------------------ parches sobre la superficie
function finishGrid(v, uv, nu, nv, expect) {
  const idx = [];
  for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
    const a = i * (nv + 1) + j, b = (i + 1) * (nv + 1) + j;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  // orientación hacia afuera
  const A = new THREE.Vector3(...v.slice(idx[0] * 3, idx[0] * 3 + 3)), B = new THREE.Vector3(...v.slice(idx[1] * 3, idx[1] * 3 + 3)), C = new THREE.Vector3(...v.slice(idx[2] * 3, idx[2] * 3 + 3));
  const n = B.sub(A).cross(C.sub(A));
  if (n.dot(new THREE.Vector3(...expect)) < 0) for (let t = 0; t < idx.length; t += 3) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q; }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// parche en frente/trasera: s = longitud de arco desde el centro (negativa = lado derecho), y = altura
function endPatch(body, front, s0, s1, y0, y1, o = {}) {
  const out = o.out ?? 0.004, geos = [];
  const center = s0 < 0;
  const sides = center ? [1] : o.single ? [o.single] : [1, -1];
  const nu = o.nu ?? Math.max(2, Math.ceil((s1 - s0) / 0.035)), nv = o.nv ?? Math.max(1, Math.ceil((y1 - y0) / 0.05));
  for (const sd of sides) {
    const v = [], uv = []; let ex = [0, 0, 0];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
      const u = i / nu, w = j / nv, y = y0 + (y1 - y0) * w, s = s0 + (s1 - s0) * u;
      const p = body.at(front, y, Math.abs(s)), sg = (s < 0 ? -1 : 1) * sd;
      const bul = (o.bulge ?? 0) * Math.sin(Math.PI * u) * Math.sin(Math.PI * w);
      v.push(p.x + p.nx * (out + bul), y, sg * (p.z + p.nz * (out + bul)));
      uv.push(center && front ? 1 - u : u, w);
      if (i === 0 && j === 0) ex = [p.nx, 0, sg * p.nz];
    }
    if (Math.abs(ex[0]) + Math.abs(ex[2]) < 1e-3) ex = [front ? 1 : -1, 0, 0];
    geos.push(finishGrid(v, uv, nu, nv, ex));
  }
  return geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
}
// parche sobre el techo/cofre: x en [xa, xb], |z| en [za, zb]
function topPatch(body, xa, xb, za, zb, o = {}) {
  const out = o.out ?? 0.004, geos = [];
  const center = za < 0, sides = center ? [1] : [1, -1];
  const nu = o.nu ?? Math.max(2, Math.ceil(Math.abs(xb - xa) / 0.08)), nv = o.nv ?? Math.max(1, Math.ceil((zb - za) / 0.08));
  for (const sd of sides) {
    const v = [], uv = [];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
      const u = i / nu, w = j / nv, x = xa + (xb - xa) * u, z = (za + (zb - za) * w) * sd;
      v.push(x, body.topAt(x, z) + out, z); uv.push(u, w);
    }
    geos.push(finishGrid(v, uv, nu, nv, [0, 1, 0]));
  }
  return geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
}
// parche lateral: x en [xa, xb], y en [ya, yb]; en el lado derecho u se invierte (texto legible)
function sidePatch(body, xa, xb, ya, yb, o = {}) {
  const out = o.out ?? 0.004, geos = [];
  const nu = o.nu ?? Math.max(2, Math.ceil(Math.abs(xb - xa) / 0.08)), nv = o.nv ?? Math.max(1, Math.ceil((yb - ya) / 0.06));
  for (const sd of o.sides ?? [1, -1]) {
    const v = [], uv = [];
    for (let i = 0; i <= nu; i++) for (let j = 0; j <= nv; j++) {
      const u = i / nu, w = j / nv, x = xa + (xb - xa) * u, y = ya + (yb - ya) * w;
      v.push(x, y, sd * (body.sideZ(x, y) + out)); uv.push(sd > 0 ? u : 1 - u, w);
    }
    geos.push(finishGrid(v, uv, nu, nv, [0, 0, sd]));
  }
  return geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
}
// línea fina sobre el techo/cofre a lo largo de x (juntas del cofre, cajuela)
function topLine(body, xa, xb, zf, wdt = 0.008) {
  const v = [], idx = [], n = Math.max(3, Math.ceil(Math.abs(xb - xa) / 0.06));
  for (const sd of [1, -1]) {
    const st = v.length / 3;
    for (let i = 0; i <= n; i++) {
      const x = xa + (xb - xa) * i / n, h = body.half(x), z = sd * (typeof zf === 'function' ? zf(x) : zf * h.wr), y = body.topAt(x, z) + 0.003;
      v.push(x, y, z - wdt / 2, x, y, z + wdt / 2);
    }
    for (let i = 0; i < n; i++) { const a = st + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2, a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
// línea sobre el costado a lo largo de x a altura y (molduras, pliegues)
function sideLine(body, xa, xb, y, wdt = 0.01, off = 0.004, yf = null) {
  const v = [], idx = [], n = Math.max(3, Math.ceil(Math.abs(xb - xa) / 0.08));
  for (const sd of [1, -1]) {
    const st = v.length / 3;
    for (let i = 0; i <= n; i++) {
      const x = xa + (xb - xa) * i / n, yy = yf ? yf(x) : y, z = sd * (body.sideZ(x, yy) + off);
      v.push(x, yy - wdt / 2, z, x, yy + wdt / 2, z);
    }
    for (let i = 0; i < n; i++) { const a = st + i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2, a, a + 2, a + 1, a + 1, a + 2, a + 3); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

// barrido de una sección cerrada a lo largo de un camino en planta (x,z) a una altura dada
function sweep(path, y, section, center) {
  const n = path.length, m = section.length, v = [], idx = [];
  const nrm = path.map((p, i) => {
    const a = path[Math.max(0, i - 1)], b = path[Math.min(n - 1, i + 1)];
    let nx = b[1] - a[1], nz = -(b[0] - a[0]); const l = Math.hypot(nx, nz) || 1; nx /= l; nz /= l;
    if (nx * (p[0] - center[0]) + nz * (p[1] - center[1]) < 0) { nx = -nx; nz = -nz; }
    return [nx, nz];
  });
  for (let i = 0; i < n; i++) for (const [o, h] of section) v.push(path[i][0] + nrm[i][0] * o, y + h, path[i][1] + nrm[i][1] * o);
  for (let i = 0; i < n - 1; i++) for (let j = 0; j < m; j++) {
    const a = i * m + j, b = (i + 1) * m + j, c = i * m + (j + 1) % m, d = (i + 1) * m + (j + 1) % m;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(idx);
  const p = g.attributes.position, A = new THREE.Vector3(), Bv = new THREE.Vector3(), Cv = new THREE.Vector3(); let s = 0;
  for (let t = 0; t < idx.length; t += 3) {
    A.fromBufferAttribute(p, idx[t]); Bv.fromBufferAttribute(p, idx[t + 1]); Cv.fromBufferAttribute(p, idx[t + 2]);
    const cen = A.clone().add(Bv).add(Cv).multiplyScalar(1 / 3);
    const nn = Bv.clone().sub(A).cross(Cv.clone().sub(A));
    s += nn.x * (cen.x - center[0]) + nn.z * (cen.z - center[1]);
  }
  if (s < 0) { for (let t = 0; t < idx.length; t += 3) { const q = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = q; } g.setIndex(idx); }
  g.computeVertexNormals();
  return g;
}
const roundSect = (d, h, r = 0.35) => [[0, -h / 2], [d * (1 - r), -h / 2], [d, -h / 2 * (1 - r)], [d, h / 2 * (1 - r)], [d * (1 - r), h / 2], [0, h / 2], [-0.03, h / 2 * 0.8], [-0.03, -h / 2 * 0.8]];
// defensa envolvente que sigue la planta de la carrocería (s = cuánto envuelve hacia el costado)
function arcBumper(K, body, front, y, h, d, m, sMax, out = 0.01, sect = null) {
  const A = body.arc(front, y), path = [];
  const N = 16, S = Math.min(sMax, A.len * 0.98);
  for (let i = 0; i <= N; i++) { const s = S * Math.sin(Math.PI / 2 * i / N); const p = body.at(front, y, s); path.push([p.x, p.z]); }
  const full = path.slice(1).reverse().map(([x, z]) => [x, -z]).concat(path);
  const P = body.P, c = [front ? P.xc - 1 : P.xc + 1, 0];
  const se = (sect ?? roundSect(d, h)).map(([o, hh]) => [o + out, hh]);
  K.add(sweep(full, y, se, [P.xc, 0]), m);
}
// compat con los modelos originales
function wrapBumper(K, body, front, y, h, d, m, wrap = 0.45, out = 0.02) {
  const P = body.P, xe = front ? P.x1 : P.x0, sg = front ? 1 : -1, path = [];
  const N = 18;
  for (let i = 0; i <= N; i++) { const t = Math.sin(Math.PI / 2 * i / N); const x = xe - sg * wrap * (1 - t); path.push([x, body.sideZ(x, y)]); }
  const tip = path[path.length - 1]; tip[1] = 0;
  const full = path.concat(path.slice(0, -1).reverse().map(([x, z]) => [x, -z]));
  const sect = roundSect(d, h).map(([o, hh]) => [o + out, hh]);
  K.add(sweep(full, y, sect, [P.xc, 0]), m);
}
// labio del arco de rueda (tubo que sigue el borde del arco)
function archLip(K, body, w, m, r = 0.018, out = 0.0, a0 = -0.12, a1 = Math.PI + 0.12, flare = 0) {
  for (const sd of [1, -1]) {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = a0 + (a1 - a0) * i / 20, x = w.x + Math.cos(t) * w.a, y = w.y + Math.sin(t) * w.a;
      const yy = Math.max(y, body.P.bot[0][1] * 0 + 0.05);
      pts.push(new THREE.Vector3(x, yy, sd * (body.sideZ(x, Math.max(yy, body.bot0(x) + 0.13)) + out + flare * Math.sin(Math.max(0, Math.min(Math.PI, t))))));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    K.add(new THREE.TubeGeometry(curve, 24, r, 6, false), m);
  }
}

// ------------------------------------------------------------------ ruedas (grupos hijos que giran)
function lathe(pts, seg = 28) { return new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg); }
function spokeGeo(r0, r1, w0, w1, t, dish = 0) {
  const s = new THREE.Shape(); s.moveTo(r0, -w0 / 2); s.lineTo(r1, -w1 / 2); s.lineTo(r1, w1 / 2); s.lineTo(r0, w0 / 2); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 1 });
  g.rotateX(Math.PI / 2); // forma en xz, grosor hacia -y
  g.translate(0, t, 0);
  if (dish) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) - dish * (p.getX(i) - r0) / (r1 - r0)); }
  g.computeVertexNormals();
  return g;
}
const norm = (g) => { const n = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k); if (!n.attributes.uv) n.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2)); if (!n.attributes.normal) n.computeVertexNormals(); return n; };
const wheelCache = new Map();
function wheelGeos(o) {
  const { R, w, rr, style = 'alloy5' } = o;
  const key = [R, w, rr, style, o.whitewall ? 1 : 0, o.spokes ?? ''].join('|');
  if (wheelCache.has(key)) return wheelCache.get(key);
  const P = { tire: [], rim: [], dark: [], cap: [], white: [] };
  const add = (part, g, M) => { if (M) g.applyMatrix4(M); P[part].push(norm(g)); };
  const fy = w * 0.36; // plano de la cara del rin
  // llanta: costado abombado + banda con hombro
  const sw = R - rr;
  add('tire', lathe([[rr - 0.004, -w * 0.4], [rr + 0.012, -w * 0.47], [rr + sw * 0.45, -w * 0.52], [R - sw * 0.14, -w * 0.5], [R - 0.012, -w * 0.43], [R, -w * 0.3], [R, w * 0.3], [R - 0.012, w * 0.43], [R - sw * 0.14, w * 0.5], [rr + sw * 0.45, w * 0.52], [rr + 0.012, w * 0.47], [rr - 0.004, w * 0.4]], 30));
  for (const yy of [-0.12, 0.12]) add('dark', new THREE.TorusGeometry(R - 0.002, 0.006, 4, 30), TM(0, w * yy, 0, Math.PI / 2, 0, 0));
  if (o.whitewall) add('white', lathe([[rr + sw * 0.28, w * 0.515], [rr + sw * 0.62, w * 0.515]], 30));
  // barril y ceja del rin
  add('rim', lathe([[rr * 0.9, w * 0.3], [rr * 0.97, w * 0.4], [rr + 0.008, w * 0.43], [rr + 0.004, w * 0.36], [rr - 0.006, -w * 0.3], [rr * 0.5, -w * 0.32]], 28));
  // fondo oscuro (disco de freno / interior del rin)
  add('dark', new THREE.CylinderGeometry(rr * 0.92, rr * 0.92, 0.01, 24), TM(0, -w * 0.05, 0));
  add('dark', new THREE.CylinderGeometry(rr * 0.72, rr * 0.72, 0.03, 24), TM(0, w * 0.02, 0));
  const hub = (r = 0.24, h = 0.05, part = 'rim') => add(part, new THREE.CylinderGeometry(rr * r, rr * (r + 0.03), h, 18), TM(0, fy - h / 2 + 0.01, 0));
  const nuts = (n = 5, r = 0.16, part = 'cap') => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.3; add(part, new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6), TM(Math.cos(a) * rr * r, fy + 0.012, Math.sin(a) * rr * r)); } };
  const spokes = (n, r0, r1, w0, w1, t, dish, part = 'rim', off = 0) => { const sg = spokeGeo(rr * r0, rr * r1, rr * w0, rr * w1, t, dish); for (let i = 0; i < n; i++) add(part, sg.clone(), TM(0, fy - t + 0.012, 0, 0, -(i / n * Math.PI * 2 + off), 0)); };
  if (style === 'hubcap') {
    add('cap', lathe([[0.001, w * 0.47], [rr * 0.25, w * 0.465], [rr * 0.6, w * 0.43], [rr * 0.92, w * 0.38], [rr * 1.02, w * 0.36]], 28));
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; add('dark', new THREE.BoxGeometry(rr * 0.22, 0.012, 0.03), TM(Math.cos(a) * rr * 0.72, w * 0.408, Math.sin(a) * rr * 0.72, 0, -a, 0)); }
    add('dark', new THREE.CylinderGeometry(rr * 0.2, rr * 0.2, 0.01, 18), TM(0, w * 0.47, 0));
  } else if (style === 'steel' || style === 'steelcap') {
    add('rim', lathe([[0.001, fy], [rr * 0.45, fy], [rr * 0.62, fy - 0.02], [rr * 0.8, fy - 0.035], [rr * 0.93, fy]], 24));
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3; add('dark', new THREE.CylinderGeometry(rr * 0.09, rr * 0.09, 0.01, 10), TM(Math.cos(a) * rr * 0.7, fy - 0.03, Math.sin(a) * rr * 0.7)); }
    add('cap', lathe(style === 'steelcap' ? [[0.001, w * 0.56], [rr * 0.25, w * 0.54], [rr * 0.45, w * 0.47], [rr * 0.55, fy]] : [[0.001, fy + 0.02], [rr * 0.2, fy + 0.018], [rr * 0.3, fy]], 20));
    if (style === 'steel') nuts(5, 0.4);
  } else if (style === 'rally') {
    add('rim', lathe([[0.001, fy], [rr * 0.5, fy], [rr * 0.62, fy - 0.02], [rr * 0.8, fy - 0.025]], 24));
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add('dark', new THREE.BoxGeometry(rr * 0.2, 0.012, rr * 0.11), TM(Math.cos(a) * rr * 0.62, fy - 0.018, Math.sin(a) * rr * 0.62, 0, -a, 0)); }
    add('cap', lathe([[rr * 0.8, fy - 0.02], [rr * 0.9, fy + 0.005], [rr * 1.01, fy + 0.01]], 28));
    add('cap', lathe([[0.001, fy + 0.03], [rr * 0.2, fy + 0.028], [rr * 0.32, fy + 0.005]], 20));
  } else if (style === 'wire') {
    const n = 36; const lip = lathe([[rr * 0.86, fy - 0.03], [rr * 0.95, fy]], 28); add('cap', lip);
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2, b = a + (i % 2 ? 0.5 : -0.5), yin = i % 2 ? fy - 0.06 : fy - 0.01;
      const p0 = new THREE.Vector3(Math.cos(a) * rr * 0.22, yin, Math.sin(a) * rr * 0.22), p1 = new THREE.Vector3(Math.cos(b) * rr * 0.86, fy - 0.03, Math.sin(b) * rr * 0.86);
      const d = p1.clone().sub(p0), L = d.length(); const cg = new THREE.CylinderGeometry(0.0035, 0.0035, L, 4);
      const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
      add('cap', cg, new THREE.Matrix4().compose(p0.clone().add(p1).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1)));
    }
    add('cap', new THREE.CylinderGeometry(rr * 0.24, rr * 0.28, 0.06, 16), TM(0, fy - 0.02, 0));
    for (let i = 0; i < 3; i++) add('cap', new THREE.BoxGeometry(rr * 0.5, 0.02, 0.025), TM(0, fy + 0.02, 0, 0, i * Math.PI / 1.5 + 0.3, 0));
  } else if (style === 'dish') {
    add('rim', lathe([[0.001, fy], [rr * 0.3, fy], [rr * 0.72, fy - 0.03], [rr * 0.78, fy - 0.03]], 26));
    add('cap', lathe([[rr * 0.78, fy - 0.03], [rr * 0.82, fy - 0.005], [rr * 1.01, fy + 0.004]], 28));
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add('dark', new THREE.CylinderGeometry(rr * 0.1, rr * 0.1, 0.01, 12), TM(Math.cos(a) * rr * 0.52, fy - 0.012, Math.sin(a) * rr * 0.52)); }
    nuts(5, 0.2);
  } else if (style === 'aero') {
    add('rim', lathe([[0.001, fy + 0.01], [rr * 0.5, fy + 0.005], [rr * 0.9, fy - 0.01], [rr * 0.97, fy]], 28));
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add('dark', new THREE.BoxGeometry(rr * 0.42, 0.01, rr * 0.13), TM(Math.cos(a) * rr * 0.62, fy + 0.006, Math.sin(a) * rr * 0.62, 0, -a - 0.5, 0)); }
    add('cap', new THREE.CylinderGeometry(rr * 0.13, rr * 0.13, 0.012, 16), TM(0, fy + 0.014, 0));
  } else if (style === 'holes') { // tipo Mercedes: disco con 8 perforaciones
    add('rim', lathe([[0.001, fy], [rr * 0.3, fy], [rr * 0.5, fy - 0.01], [rr * 0.9, fy - 0.025]], 28));
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; add('dark', new THREE.CylinderGeometry(rr * 0.13, rr * 0.13, 0.01, 12), TM(Math.cos(a) * rr * 0.66, fy - 0.014, Math.sin(a) * rr * 0.66)); }
    add('cap', new THREE.CylinderGeometry(rr * 0.2, rr * 0.2, 0.014, 16), TM(0, fy + 0.006, 0));
  } else if (style === 'turbo') { // pétalos anchos (tipo Fuchs)
    spokes(5, 0.25, 0.9, 0.34, 0.5, 0.03, 0.025);
    add('rim', lathe([[0.001, fy + 0.01], [rr * 0.3, fy]], 20));
    add('cap', lathe([[0.001, fy + 0.03], [rr * 0.17, fy + 0.02], [rr * 0.2, fy]], 16)); nuts(5, 0.22, 'dark');
  } else if (style === 'mesh') {
    const n = 12;
    for (let k = 0; k < 2; k++) { const sg = spokeGeo(rr * 0.2, rr * 0.92, rr * 0.05, rr * 0.05, 0.02, 0.03); for (let i = 0; i < n; i++) add('rim', sg.clone(), TM(0, fy - 0.01, 0, 0, -(i / n * Math.PI * 2) + (k ? 0.22 : -0.22), 0)); }
    hub(0.26, 0.05); add('cap', lathe([[rr * 0.9, fy - 0.035], [rr * 0.95, fy], [rr * 1.01, fy + 0.004]], 28)); nuts(5, 0.16, 'cap');
  } else if (style === 'center') { // 5 radios con tuerca central (carreras)
    spokes(5, 0.18, 0.93, 0.26, 0.2, 0.035, 0.035); hub(0.22, 0.06);
    add('cap', new THREE.CylinderGeometry(rr * 0.13, rr * 0.13, 0.05, 6), TM(0, fy + 0.02, 0));
  } else if (style === 'offroad') {
    spokes(6, 0.24, 0.9, 0.3, 0.22, 0.04, 0.02); hub(0.28, 0.07); nuts(6, 0.2, 'cap');
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; add('cap', new THREE.CylinderGeometry(0.007, 0.007, 0.02, 6), TM(Math.cos(a) * rr * 0.95, fy + 0.012, Math.sin(a) * rr * 0.95)); }
  } else if (style === 'y') {
    const sg = spokeGeo(rr * 0.24, rr * 0.93, rr * 0.16, rr * 0.07, 0.03, 0.03);
    for (let i = 0; i < 5; i++) for (const d of [-0.16, 0.16]) add('rim', sg.clone(), TM(0, fy - 0.018, 0, 0, -(i / 5 * Math.PI * 2 + d), 0));
    hub(0.27, 0.05); nuts(5, 0.17, 'cap'); add('cap', new THREE.CylinderGeometry(rr * 0.1, rr * 0.1, 0.01, 14), TM(0, fy + 0.01, 0));
  } else { // alloy5 / alloy10 / alloy6 / alloy7 / truck
    const n = style === 'alloy10' ? 10 : style === 'alloy6' || style === 'truck' ? 6 : style === 'alloy7' ? 7 : style === 'multi' ? 15 : (o.spokes ?? 5);
    const wd = n >= 15 ? [0.07, 0.06] : n >= 10 ? [0.12, 0.09] : n >= 7 ? [0.18, 0.13] : [0.26, 0.19];
    spokes(n, 0.22, 0.93, wd[0], wd[1], 0.032, style === 'truck' ? 0.01 : 0.035);
    hub(0.27, style === 'truck' ? 0.1 : 0.05);
    nuts(style === 'truck' ? 6 : 5, 0.17, 'cap');
    add('cap', new THREE.CylinderGeometry(rr * 0.1, rr * 0.11, 0.014, 16), TM(0, fy + (style === 'truck' ? 0.04 : 0.012), 0));
  }
  const out = {};
  for (const k in P) if (P[k].length) out[k] = mergeGeometries(P[k], false);
  wheelCache.set(key, out);
  return out;
}
const RIMS = {
  silver: () => metal(0xc9cdd1, 0.28), dark: () => mat(0x2b2d30, { metalness: 0.7, roughness: 0.35, env: true, envI: 0.8 }),
  gun: () => metal(0x5d6166, 0.3), chrome: () => MT.chrome(), gold: () => metal(0xc8a24a, 0.3), white: () => mat(0xeeeeee, { roughness: 0.3, metalness: 0.2, env: true, envI: 0.5 }),
  black: () => mat(0x111213, { roughness: 0.4, metalness: 0.3, env: true, envI: 0.5 }), steel: () => mat(0x9a9ea2, { roughness: 0.4, metalness: 0.6, env: true, envI: 0.6 }),
  plastic: () => mat(0xb9bdc1, { roughness: 0.35, metalness: 0.5, env: true, envI: 0.7 }),
};
function rimMat(r, body) { if (r && r.isMaterial) return r; if (typeof r === 'number') return MT.steelRim(r); return (RIMS[r] ?? RIMS.silver)(); }
// list: [[x, z], ...]  o: { R, w, rr, style, rim, cap, whitewall, caliper }
function addWheels(g, K, list, o) {
  const G = wheelGeos(o);
  const mats = {
    tire: MT.tire(), rim: rimMat(o.rim), dark: mat(0x1a1b1c, { roughness: 0.6, metalness: 0.4 }),
    cap: o.cap === 'rim' ? rimMat(o.rim) : o.cap === 'dark' ? RIMS.dark() : o.cap === 'body' && o.paint ? o.paint : o.style === 'hubcap' ? RIMS.plastic() : MT.chrome(),
    white: mat(0xf2f0ea, { roughness: 0.7 }),
  };
  for (const [x, z] of list) {
    const spin = new THREE.Group(); spin.position.set(x, o.R, z);
    spin.userData.wheel = true; spin.userData.noMerge = true; spin.userData.radius = o.R; spin.userData.front = x > 0;
    const hold = new THREE.Group(); hold.rotation.x = z > 0 ? Math.PI / 2 : -Math.PI / 2; spin.add(hold);
    for (const k in G) { const m = new THREE.Mesh(G[k], mats[k]); m.castShadow = true; m.receiveShadow = true; hold.add(m); }
    g.add(spin);
    if (o.caliper && K) { const s = z > 0 ? 1 : -1; K.rbox(mat(o.caliper, { roughness: 0.35, metalness: 0.2, env: true, envI: 0.5 }), o.rr * 0.5, o.rr * 0.5, 0.05, 0.015, x - o.rr * 0.35, o.R + o.rr * 0.38, z - s * o.w * 0.12, 0, 0, 0.5); }
  }
}

// ------------------------------------------------------------------ piezas comunes
function mirror(K, body, x, y, m, s, size = 1, glassM = MT.chrome()) {
  const p = body.onSide(x, y, s);
  const T = TM(p.x, p.y, p.z, 0, 0, 0);
  K.add(new RoundedBoxGeometry(0.07 * size, 0.035, 0.09 * size, 2, 0.012), m, T.clone().multiply(TM(0, 0, s * 0.045 * size)));
  K.add(new RoundedBoxGeometry(0.1 * size, 0.1 * size, 0.16 * size, 3, 0.035 * size), m, T.clone().multiply(TM(0.01, 0.045 * size, s * 0.13 * size, 0, s * 0.12, 0)));
  K.add(new THREE.PlaneGeometry(0.13 * size, 0.07 * size), glassM, T.clone().multiply(TM(-0.042 * size, 0.045 * size, s * 0.13 * size, 0, -Math.PI / 2 + s * 0.12, 0)));
}
function handle(K, body, x, y, s, m, type = 'bar') {
  const p = body.onSide(x, y, s);
  if (type === 'flush') { K.add(new RoundedBoxGeometry(0.16, 0.025, 0.012, 2, 0.005), m, TM(p.x, p.y, p.z + s * 0.002, 0, p.ry + (s > 0 ? 0 : 0), 0)); return; }
  if (type === 'button') { K.add(new RoundedBoxGeometry(0.14, 0.028, 0.03, 2, 0.012), m, TM(p.x, p.y, p.z + s * 0.01)); return; }
  K.add(new RoundedBoxGeometry(0.15, 0.03, 0.03, 2, 0.012), m, TM(p.x, p.y, p.z + s * 0.004, 0, 0, 0));
  K.add(new THREE.BoxGeometry(0.16, 0.05, 0.004), MT.trim(), TM(p.x, p.y, p.z - s * 0.004));
}
function plate(K, body, front, y, txt, out = 0.01) {
  const p = body.onEnd(0, y, front);
  const m = mat(0xffffff, { map: plateTex(txt), roughness: 0.45 });
  K.add(new THREE.PlaneGeometry(0.34, 0.17), m, TM(p.x + (front ? out : -out), y, 0, 0, front ? Math.PI / 2 : -Math.PI / 2, 0));
  K.add(new THREE.BoxGeometry(0.02, 0.19, 0.36), MT.trim(), TM(p.x + (front ? out - 0.011 : -out + 0.011), y, 0));
}
function endLamp(K, body, front, z, y, w, h, lens, opts = {}) {
  for (const s of [1, -1]) {
    const p = body.onEnd(s * z, y, front), d = opts.d ?? 0.05;
    const T = TM(p.x, y, p.z, 0, p.ry, 0);
    K.add(new RoundedBoxGeometry(d, h, w, 2, Math.min(h, w) * 0.2), lens, T.clone().multiply(TM(opts.in ?? -d * 0.2, 0, 0)));
    if (opts.bezel) K.add(new RoundedBoxGeometry(d * 0.8, h + 0.025, w + 0.025, 2, 0.012), opts.bezel, T.clone().multiply(TM(-d * 0.45, 0, 0)));
    if (opts.reflector) K.add(new THREE.CylinderGeometry(h * 0.32, h * 0.32, 0.01, 16), MT.reflector(), T.clone().multiply(TM(d * 0.32, 0, s * w * 0.18, 0, 0, Math.PI / 2)));
  }
}
// faro redondo 3D: bisel + lente abombada con textura. dir = normal hacia afuera
function roundLamp(K, pos, dir, r, bezelM, lensM, o = {}) {
  const T = TQ(pos[0], pos[1], pos[2], dir);
  const depth = o.depth ?? 0.05;
  if (bezelM) {
    K.add(new THREE.CylinderGeometry(r * 1.12, r * 1.18, depth, 24, 1, true), bezelM, T.clone().multiply(TM(0, 0, -depth / 2 + 0.01, Math.PI / 2, 0, 0)));
    K.add(new THREE.TorusGeometry(r * 1.06, r * 0.08, 6, 24), bezelM, T.clone().multiply(TM(0, 0, 0.01)));
  }
  const c = new THREE.CircleGeometry(r, 24), p = c.attributes.position;
  for (let i = 0; i < p.count; i++) { const q = Math.hypot(p.getX(i), p.getY(i)) / r; p.setZ(i, (o.dome ?? 0.25) * r * (1 - q * q)); }
  c.computeVertexNormals();
  K.add(c, lensM, T.clone().multiply(TM(0, 0, 0.004)));
}
// materiales con textura para parches
const texMatCache = new Map();
function lampMat(tex, glow = 0.35) {
  return mat(0xffffff, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: glow, roughness: 0.08, metalness: 0.2, env: true, envI: 1.2, transparent: false, alphaTest: 0.5 });
}
function decalMat(tex, o = {}) { return mat(0xffffff, { map: tex, roughness: o.rough ?? 0.35, metalness: o.metal ?? 0.35, env: true, envI: 0.8, alphaTest: 0.5 }); }

// ------------------------------------------------------------------ vano de motor (cofre abierto)
function engineBay(K, body, xa, xb) {
  const P = body.P, hw = P.hw - 0.14, yb = P.bayFloor ?? 0.45, xm = (xa + xb) / 2, len = xb - xa;
  const yt = body.belt(xm) - 0.04;
  K.box(MT.bay(), len, yt - yb, hw * 2, xm, (yt + yb) / 2, 0);
  const ex = xm + 0.05, top = yt + 0.02;
  K.rbox(MT.engine(), 0.55, 0.3, 0.42, 0.04, ex, top + 0.06, -0.05);
  K.rbox(mat(0xa82020, { roughness: 0.35, metalness: 0.4 }), 0.5, 0.07, 0.22, 0.03, ex, top + 0.24, -0.05);
  for (let i = 0; i < 4; i++) K.cyl(MT.trim(), 0.018, 0.018, 0.1, 8, ex - 0.18 + i * 0.12, top + 0.27, 0.1, Math.PI / 2 * 0.3, 0, 0);
  K.cyl(MT.plastic(), 0.17, 0.17, 0.08, 24, ex - 0.02, top + 0.34, -0.05);
  K.cyl(MT.chrome(), 0.02, 0.02, 0.03, 8, ex - 0.02, top + 0.39, -0.05);
  K.rbox(mat(0x1a1a1a, { roughness: 0.6 }), 0.2, 0.18, 0.14, 0.01, xa + 0.3, top + 0.06, hw - 0.14);
  K.box(mat(0xc02020, { roughness: 0.4 }), 0.03, 0.02, 0.02, xa + 0.34, top + 0.16, hw - 0.12);
  K.rbox(mat(0xe8e2c8, { roughness: 0.3, transparent: true, opacity: 0.9 }), 0.14, 0.14, 0.1, 0.02, xa + 0.28, top + 0.05, -hw + 0.14);
  K.box(mat(0x404448, { roughness: 0.4, metalness: 0.6 }), 0.05, yt - yb - 0.05, hw * 1.5, xb - 0.1, (yt + yb) / 2 + 0.02, 0);
  K.cyl(MT.trim(), 0.025, 0.025, 0.5, 8, xb - 0.35, top + 0.12, 0.25, 0, 0, Math.PI / 2);
}
function hoodPanel(g, body, paint, ang) {
  const P = body.P, hx = P.hood[0], hy = body.top(hx) + 0.01;
  const piv = new THREE.Group(); piv.position.set(hx, hy, 0); piv.rotation.z = ang; g.add(piv);
  const gh = new THREE.BufferGeometry();
  gh.setAttribute('position', body.mk(['hood']).attributes.position); gh.setAttribute('normal', body.mk(['hood']).attributes.normal);
  gh.setIndex(body.buckets.hood);
  const outer = new THREE.Mesh(gh, paint); outer.position.set(-hx, -hy, 0); piv.add(outer);
  const inner = new THREE.Mesh(gh, mat(0x2a2a2a, { roughness: 0.8, side: THREE.BackSide })); inner.position.set(-hx, -hy - 0.012, 0); piv.add(inner);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.62, 6), metal(0x9a9a9a, 0.4));
  rod.position.set(hx + 0.62, hy - 0.08, 0.5); rod.rotation.z = 0.35; g.add(rod);
}

// ------------------------------------------------------------------ Sedán (Nissan Tsuru B13)
const SEDAN = {
  x0: -2.17, x1: 2.17, xc: 0.05, hw: 0.83, nF: 7, nR: 8,
  shoulder: 0.965, tumble: 0.36, hoodCrown: 0.03, roofCrown: 0.05, glassBulge: 0.012, tuck: 0.05, pillarW: 0.06,
  belt: [[-2.17, 0.8], [-2.14, 0.88], [-2.06, 0.925], [-1.8, 0.94], [-1.2, 0.94], [0, 0.915], [1.0, 0.895], [1.6, 0.865], [2.0, 0.83], [2.12, 0.8], [2.17, 0.745]],
  roof: [[-1.27, 0.9], [-1.17, 0.99], [-0.95, 1.19], [-0.62, 1.355], [-0.45, 1.385], [0, 1.395], [0.25, 1.385], [0.38, 1.36], [0.75, 1.14], [1.03, 0.965], [1.1, 0.9]],
  bot: [[-2.17, 0.47], [-2.1, 0.37], [-1.9, 0.32], [0, 0.3], [1.95, 0.32], [2.1, 0.37], [2.17, 0.47]],
  wheels: [{ x: 1.3, y: 0.3, a: 0.36 }, { x: -1.13, y: 0.3, a: 0.36 }],
  sideWin: [[-0.66, -0.03], [0.07, 1.12]], bpil: [[-0.03, 0.07]], topGlass: [[-1.22, -0.6], [0.36, 1.12]],
  levels: [0.645, 0.6], molding: [0.6, 0.645, -1.82, 1.88], hood: [1.06, 2.16], blackPillars: false,
};
function sedan(color, o = {}) {
  const g = new THREE.Group(), K = new Kit();
  const paint = o.paint ?? paintMat(color);
  const P = { ...SEDAN, split: o.split ?? null, extraX: [0.06, -0.72, 1.02] };
  if (o.split) P.levels = [0.645, 0.6, o.split];
  const body = makeBody(P);
  const lower = o.lowerPaint ?? paint;
  const geo = body.mk(['paint', 'glass', 'trim', 'under', 'lower', 'pillar', 'roofp'].concat(o.hoodOpen ? [] : ['hood']));
  const mats = [paint, MT.glass(), MT.trim(), MT.under(), lower, MT.chrome(), paint]; if (!o.hoodOpen) mats.push(paint);
  const bm = new THREE.Mesh(geo, mats); g.add(bm); envWatch(bm);
  if (o.hoodOpen) hoodPanel(g, body, paint, o.hoodAngle ?? 0.95);
  const T = MT.trim(), plas = MT.plastic(), ch = MT.chrome();
  const ns = body.half(0).pts.length;
  for (const x of [1.02, 0.06, -0.72]) K.add(body.seamGeo(x, 11, ns - 4), T);
  K.add(body.seamGeo(1.075, 0, 11), T); K.add(body.seamGeo(-1.3, 0, 11), T);
  wrapBumper(K, body, true, 0.44, 0.17, 0.07, plas, 0.5, 0.015);
  wrapBumper(K, body, false, 0.44, 0.17, 0.07, plas, 0.45, 0.015);
  wrapBumper(K, body, true, 0.47, 0.025, 0.08, T, 0.48, 0.02);
  wrapBumper(K, body, false, 0.47, 0.025, 0.08, T, 0.43, 0.02);
  // faros rectangulares con cuartos ámbar envolventes
  K.add(endPatch(body, true, 0.36, 0.72, 0.64, 0.75, { out: 0.006 }), lampMat(lampTex('hrect', 3.3)));
  K.add(endPatch(body, true, 0.72, 0.86, 0.64, 0.745, { out: 0.006 }), lampMat(lampTex('amber', 1.4), 0.2));
  K.add(endPatch(body, true, -0.34, 0.34, 0.645, 0.735, { out: 0.006 }), decalMat(grilleTex('hbar2', 7, null, 'black', 'chrome')));
  { const p = body.onEnd(0, 0.69, true); K.add(new THREE.TorusGeometry(0.045, 0.008, 8, 24), ch, TM(p.x + 0.012, 0.69, 0, 0, Math.PI / 2, 0)); }
  { const p = body.onEnd(0, 0.44, true); K.box(MT.under(), 0.02, 0.06, 0.7, p.x + 0.09, 0.4, 0); }
  // calaveras traseras anchas con reflejante central
  K.add(endPatch(body, false, 0.3, 0.84, 0.725, 0.855, { out: 0.006 }), lampMat(lampTex('tclassic', 4.1), 0.3));
  K.add(endPatch(body, false, -0.3, 0.3, 0.74, 0.84, { out: 0.005 }), decalMat(grilleTex('solid', 6, null, 'chrome', '#1a0808')));
  plate(K, body, true, 0.44, o.plate ?? rndPlate(), 0.1);
  plate(K, body, false, 0.64, o.plate ?? rndPlate(), 0.012);
  for (const s of [1, -1]) {
    mirror(K, body, 0.93, 0.97, paint, s);
    handle(K, body, 0.2, 0.82, s, T); handle(K, body, -0.6, 0.83, s, T);
  }
  for (const zz of [0.25, -0.3]) { const y = body.topAt(1.05, zz); K.box(T, 0.02, 0.015, 0.5, 1.07, y + 0.02, zz, 0, 0.12, 0); }
  K.cyl(T, 0.004, 0.006, 0.7, 6, 0.95, 1.2, 0.72, 0, 0, 0.5);
  K.cyl(metal(0x6a6a6a, 0.4), 0.025, 0.025, 0.25, 10, -2.12, 0.3, -0.45, 0, 0, Math.PI / 2);
  K.box(MT.under(), 3.9, 0.12, 1.3, 0.05, 0.27, 0);
  if (o.hoodOpen) engineBay(K, body, 1.1, 2.05);
  addWheels(g, K, [[1.3, 0.705], [-1.13, 0.705], [1.3, -0.705], [-1.13, -0.705]], { R: 0.29, w: 0.17, rr: 0.175, rim: 'silver', style: o.wheelStyle ?? 'hubcap' });
  K.build(g);
  g.userData.body = body;
  return g;
}

// ------------------------------------------------------------------ Vocho (VW Sedán 1990s)
function vocho(color, o = {}) {
  const g = new THREE.Group(), K = new Kit();
  const paint = o.paint ?? paintMat(color, 0.3, { metal: 0.12 });
  const P = {
    x0: -2.02, x1: 1.98, xc: -0.1, hw: 0.72, nF: 2.4, nR: 2.6,
    shoulder: 0.97, tumble: 0.5, hoodCrown: 0.07, roofCrown: 0.1, glassBulge: 0.02, tuck: 0.08, pillarW: 0.055,
    belt: [[-2.02, 0.5], [-1.97, 0.66], [-1.82, 0.83], [-1.55, 0.93], [-1.1, 0.965], [0, 0.965], [0.62, 0.95], [1.2, 0.88], [1.6, 0.77], [1.86, 0.6], [1.98, 0.44]],
    roof: [[-1.66, 0.9], [-1.45, 1.06], [-1.1, 1.3], [-0.7, 1.45], [-0.3, 1.5], [0.05, 1.48], [0.3, 1.42], [0.62, 1.09], [0.72, 0.95]],
    bot: [[-2.02, 0.48], [-1.9, 0.4], [-1.5, 0.37], [0, 0.36], [1.6, 0.37], [1.9, 0.42], [1.98, 0.45]],
    wheels: [{ x: 1.18, y: 0.32, a: 0.38 }, { x: -1.22, y: 0.32, a: 0.38 }],
    sideWin: [[-1.2, -0.37], [-0.27, 0.72]], topGlass: [[0.3, 0.72], [-1.52, -1.05]],
    levels: [0.6], stations: 60,
  };
  const body = makeBody(P);
  const bm = new THREE.Mesh(body.mk(['paint', 'glass', 'trim', 'under', 'lower', 'pillar', 'hood', 'roofp']), [paint, MT.glass(), MT.trim(), MT.under(), paint, MT.chrome(), paint, paint]);
  g.add(bm); envWatch(bm);
  const ch = MT.chrome(), T = MT.trim();
  // salpicaderas bulbosas: mini-loft desplazado hacia afuera
  const fender = (xw, len, front) => {
    const a = 0.38, xa = xw - len * (front ? 0.52 : 0.46), xb = xw + len * (front ? 0.48 : 0.54);
    const F = {
      x0: xa, x1: xb, xc: xw + (front ? 0.02 : -0.05), hw: 0.2, nF: 2.2, nR: 2.2, shoulder: 1, tumble: 0, hoodCrown: 0.06, roofCrown: 0.001, glassBulge: 0, tuck: 0.25,
      belt: front ? [[xa, 0.42], [xa + 0.12, 0.62], [xw - 0.15, 0.82], [xw + 0.1, 0.84], [xw + 0.35, 0.74], [xb - 0.06, 0.52], [xb, 0.4]]
        : [[xa, 0.4], [xa + 0.08, 0.6], [xw - 0.35, 0.8], [xw - 0.05, 0.87], [xw + 0.2, 0.86], [xb - 0.1, 0.7], [xb, 0.48]],
      bot: [[xa, 0.4], [xb, 0.4]], wheels: [{ x: xw, y: 0.32, a }], stations: 30, levels: [],
    };
    const fb = makeBody(F);
    const fg = fb.mk(['paint', 'glass', 'trim', 'under', 'lower', 'pillar', 'hood', 'roofp']);
    for (const s of [1, -1]) {
      const m = new THREE.Mesh(fg, [paint, paint, paint, MT.under(), paint, paint, paint, paint]); m.position.z = s * 0.6; g.add(m);
    }
    return fb;
  };
  const ff = fender(1.18, 1.05, true), rf = fender(-1.22, 1.15, false);
  const lensM = lampMat(lampTex('hlens', 1, ellPoly()), 0.3);
  for (const s of [1, -1]) {
    const x = 1.48, y = ff.topAt(x, 0) - 0.05;
    const T0 = TM(x, y, s * 0.6, 0, 0, 0.12);
    K.add(new THREE.CylinderGeometry(0.1, 0.115, 0.16, 24), paint, T0.clone().multiply(TM(0, 0, 0, 0, 0, Math.PI / 2)));
    K.add(new THREE.TorusGeometry(0.095, 0.012, 8, 24), ch, T0.clone().multiply(TM(0.08, 0, 0, 0, Math.PI / 2, 0)));
    roundLamp(K, [0, 0, 0], [1, 0, 0], 0.092, null, lensM, { dome: 0.3 });
    K.b.get(lensM).at(-1).applyMatrix4(T0.clone().multiply(TM(0.076, 0, 0)));
    K.add(new RoundedBoxGeometry(0.1, 0.045, 0.05, 2, 0.02), MT.amber(), TM(1.3, ff.topAt(1.3, 0) + 0.005, s * 0.6));
    const xt = -1.72, yt = rf.topAt(xt, 0) - 0.08;
    const T1 = TM(xt, yt, s * 0.6, 0, 0, 0.35);
    K.add(new RoundedBoxGeometry(0.09, 0.24, 0.13, 3, 0.045), MT.tail(), T1);
    K.add(new RoundedBoxGeometry(0.07, 0.26, 0.15, 3, 0.05), ch, T1.clone().multiply(TM(0.015, 0, 0)));
    K.add(new RoundedBoxGeometry(0.093, 0.06, 0.1, 2, 0.02), MT.amber(), T1.clone().multiply(TM(-0.002, 0.08, 0)));
  }
  for (const s of [1, -1]) K.rbox(T, 1.45, 0.05, 0.2, 0.02, -0.02, 0.4, s * 0.72);
  for (const [xe, sg] of [[2.03, 1], [-2.07, -1]]) {
    const path = []; for (let i = 0; i <= 20; i++) { const z = -0.82 + 1.64 * i / 20; path.push([xe - sg * 0.16 * Math.pow(Math.abs(z) / 0.82, 3), z]); }
    K.add(sweep(path, 0.47, roundSect(0.035, 0.11, 0.4), [xe - sg * 1.2, 0]), ch);
    for (const s of [1, -1]) { K.rbox(ch, 0.05, 0.18, 0.05, 0.02, xe + sg * 0.012, 0.53, s * 0.36); K.box(T, 0.2, 0.04, 0.04, xe - sg * 0.12, 0.47, s * 0.4); }
  }
  { const x = 1.78, y = body.topAt(x, 0); K.cyl(ch, 0.045, 0.045, 0.012, 20, x + 0.02, y + 0.004, 0, 0, 0, -0.9); K.box(ch, 0.1, 0.02, 0.03, 1.66, body.topAt(1.66, 0) + 0.01, 0, 0, 0, -0.5); }
  for (let i = 0; i < 12; i++) { const x = 1.6 - i * 0.07; K.box(ch, 0.07, 0.008, 0.012, x, body.topAt(x, 0) + 0.002, 0, 0, 0, Math.atan2(body.topAt(x + 0.03, 0) - body.topAt(x - 0.03, 0), 0.06)); }
  for (const s of [1, -1]) for (let i = 0; i < 5; i++) { const x = -1.55 - i * 0.045, y = body.topAt(x, 0.15); K.box(T, 0.012, 0.012, 0.22, x, y + 0.002, s * 0.15, 0, 0, -0.9); }
  { const y = body.onEnd(0, 0.62, false); K.box(ch, 0.03, 0.05, 0.14, y.x - 0.01, 0.66, 0); }
  const ns = body.half(0).pts.length;
  for (const x of [0.72, -0.3]) K.add(body.seamGeo(x, 11, ns - 4), T);
  K.add(body.seamGeo(0.74, 0, 11), T);
  for (const s of [1, -1]) {
    const p = body.onSide(-0.18, 0.86, s); K.rbox(ch, 0.14, 0.03, 0.03, 0.012, p.x, p.y, p.z + s * 0.01);
    mirror(K, body, 0.62, 1.02, ch, s, 0.75);
  }
  for (const zz of [0.2, -0.25]) { const y = body.topAt(0.72, zz); K.box(T, 0.02, 0.012, 0.42, 0.72, y + 0.015, zz, 0, 0.1, 0); }
  plate(K, body, true, 0.6, rndPlate(), 0.02);
  plate(K, body, false, 0.62, rndPlate(), 0.02);
  K.box(MT.under(), 3.6, 0.12, 1.1, -0.05, 0.3, 0);
  K.cyl(metal(0x6a6a6a, 0.4), 0.03, 0.03, 0.2, 10, -2.06, 0.38, 0.3, 0, 0, Math.PI / 2);
  K.cyl(metal(0x6a6a6a, 0.4), 0.03, 0.03, 0.2, 10, -2.06, 0.38, -0.3, 0, 0, Math.PI / 2);
  addWheels(g, K, [[1.18, 0.66], [-1.22, 0.66], [1.18, -0.66], [-1.22, -0.66]], { R: 0.305, w: 0.165, rr: 0.19, rim: color, style: 'steelcap' });
  K.build(g);
  g.userData.body = body;
  return g;
}

// ------------------------------------------------------------------ Pickup (Nissan D21 90s)
function pickup(color, o = {}) {
  const g = new THREE.Group(), K = new Kit();
  const paint = o.paint ?? paintMat(color, 0.34);
  const P = {
    x0: -0.62, x1: 2.5, xc: 0.9, hw: 0.9, nF: 7, nR: 24,
    shoulder: 0.975, tumble: 0.2, hoodCrown: 0.03, roofCrown: 0.045, glassBulge: 0.01, tuck: 0.04, pillarW: 0.07,
    belt: [[-0.62, 1.1], [0, 1.1], [1.0, 1.09], [1.9, 1.07], [2.3, 1.05], [2.44, 1.0], [2.5, 0.92]],
    roof: [[-0.63, 1.72], [-0.1, 1.735], [0.45, 1.725], [0.6, 1.69], [1.22, 1.16], [1.3, 1.1]],
    bot: [[-0.62, 0.52], [2.25, 0.52], [2.45, 0.58], [2.5, 0.64]],
    wheels: [{ x: 1.62, y: 0.38, a: 0.45 }],
    sideWin: [[-0.43, 1.3]], topGlass: [[0.58, 1.3]],
    levels: [0.8, 0.76], hood: [1.26, 2.49], stations: 56, extraX: [1.24, -0.52],
  };
  const body = makeBody(P);
  const geo = body.mk(['paint', 'glass', 'trim', 'under', 'lower', 'pillar', 'roofp'].concat(o.hoodOpen ? [] : ['hood']));
  const mats = [paint, MT.glass(), MT.trim(), MT.under(), paint, MT.chrome(), paint]; if (!o.hoodOpen) mats.push(paint);
  const bm = new THREE.Mesh(geo, mats); g.add(bm); envWatch(bm);
  if (o.hoodOpen) hoodPanel(g, body, paint, o.hoodAngle ?? 0.9);
  const ch = MT.chrome(), T = MT.trim();
  K.add(new RoundedBoxGeometry(0.02, 0.42, 1.2, 2, 0.06), MT.glass(), TM(-0.625, 1.42, 0));
  K.add(new RoundedBoxGeometry(0.015, 0.46, 1.24, 2, 0.07), T, TM(-0.618, 1.42, 0));
  truckBed(K, paint, { bx0: -2.58, bx1: -0.66, bw: 0.88, xr: -1.52, a: 0.45, yT: 1.1, yB: 0.52, wy: 0.38, label: 'NISSAN', color });
  wrapBumper(K, body, true, 0.55, 0.2, 0.08, ch, 0.25, 0.02);
  { const p = body.onEnd(0, 0.86, true);
    K.add(endPatch(body, true, -0.5, 0.5, 0.74, 0.98, { out: 0.012 }), decalMat(grilleTex('egg', 4.2, null, 'chrome', 'chrome')));
    K.add(new THREE.PlaneGeometry(0.34, 0.07), mat(0xffffff, { map: labelTex('NISSAN', { bg: '#dfe3e6', fg: '#1a1a1a', w: 256, h: 52, font: 'bold 40px system-ui' }), roughness: 0.3, metalness: 0.4 }), TM(p.x + 0.03, 0.86, 0, 0, Math.PI / 2, 0)); }
  K.add(endPatch(body, true, 0.52, 0.78, 0.78, 0.96, { out: 0.01 }), lampMat(lampTex('hrect', 1.5)));
  K.add(endPatch(body, true, 0.78, 0.86, 0.79, 0.95, { out: 0.01 }), lampMat(lampTex('amber', 0.5), 0.2));
  { const p = body.onEnd(0, 0.55, true); K.box(MT.under(), 0.03, 0.12, 1.3, p.x - 0.02, 0.44, 0); }
  const ns = body.half(0).pts.length;
  for (const x of [1.24, -0.52]) K.add(body.seamGeo(x, 11, ns - 4), T);
  K.add(body.seamGeo(1.265, 0, 11), T);
  for (const s of [1, -1]) {
    handle(K, body, -0.3, 1.0, s, T);
    mirror(K, body, 1.18, 1.17, T, s, 1.25);
  }
  for (const zz of [0.3, -0.3]) { const y = body.topAt(1.26, zz); K.box(T, 0.02, 0.015, 0.55, 1.28, y + 0.02, zz, 0, 0.1, 0); }
  K.cyl(T, 0.004, 0.006, 0.8, 6, 1.2, 1.5, -0.86, 0, 0, 0.3);
  plate(K, body, true, 0.55, rndPlate(), 0.1);
  K.add(new THREE.PlaneGeometry(0.34, 0.17), mat(0xffffff, { map: plateTex(rndPlate()), roughness: 0.45 }), TM(-2.58 - 0.03, 0.66, 0, 0, -Math.PI / 2, 0));
  K.box(MT.under(), 4.8, 0.14, 1.1, -0.05, 0.42, 0);
  K.cyl(metal(0x6a6a6a, 0.4), 0.03, 0.03, 0.3, 10, -2.5, 0.35, -0.55, 0, 0, Math.PI / 2);
  for (const s of [1, -1]) { K.box(T, 0.012, 0.22, 0.22, -2.0, 0.34, s * 0.78); K.box(T, 0.012, 0.2, 0.22, 1.1, 0.4, s * 0.8); }
  addWheels(g, K, [[1.62, 0.77], [-1.52, 0.77], [1.62, -0.77], [-1.52, -0.77]], { R: 0.37, w: 0.21, rr: 0.2, rim: 0xd8dadc, style: 'steel' });
  K.build(g);
  g.userData.body = body;
  return g;
}
// caja de pickup: costados extruidos con arco, frente, compuerta, piso, calaveras
function truckBed(K, paint, b) {
  const { bx0, bx1, bw, xr, a, yT, yB, wy } = b;
  const side = new THREE.Shape();
  const ya = Math.min(a * 0.95, Math.max(-a * 0.95, yB - wy)), ang = Math.asin(ya / a);
  side.moveTo(bx0, yB + 0.03); side.lineTo(bx0, yT); side.lineTo(bx1, yT); side.lineTo(bx1, yB); side.lineTo(xr + a * Math.cos(ang), yB);
  side.absarc(xr, wy, a, ang, Math.PI - ang, false); side.lineTo(bx0, yB + 0.03);
  const T = MT.trim(), liner = mat(0x252525, { roughness: 0.9 });
  const eg = new THREE.ExtrudeGeometry(side, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 16 });
  eg.translate(0, 0, -0.025);
  for (const s of [1, -1]) {
    K.add(eg.clone(), paint, TM(0, 0, s * (bw - 0.03)));
    K.rbox(b.railM ?? T, bx1 - bx0 + 0.02, 0.04, 0.1, 0.015, (bx0 + bx1) / 2, yT + 0.02, s * (bw - 0.05));
    K.box(liner, bx1 - bx0 - 0.1, yT - yB - 0.12, 0.01, (bx0 + bx1) / 2, (yT + yB + 0.12) / 2, s * (bw - 0.09));
    K.add(new THREE.CylinderGeometry(a - 0.02, a - 0.02, 0.36, 18, 1, true, -Math.PI / 2, Math.PI), mat(0x0b0b0b, { roughness: 0.95, side: THREE.DoubleSide }), TM(xr, wy, s * (bw - 0.2), -Math.PI / 2, 0, 0));
    if (b.tailTex) K.add(new THREE.PlaneGeometry(0.13, b.tailH ?? 0.4), lampMat(b.tailTex, 0.3), TM(bx0 - 0.03, b.tailY ?? yT - 0.24, s * (bw - 0.08), 0, -Math.PI / 2, 0));
    else {
      K.rbox(MT.tail(), 0.05, 0.36, 0.12, 0.02, bx0 - 0.005, yT - 0.24, s * (bw - 0.08));
      K.rbox(MT.amber(), 0.052, 0.08, 0.12, 0.02, bx0 - 0.005, yT - 0.45, s * (bw - 0.08));
      K.rbox(T, 0.04, 0.46, 0.14, 0.02, bx0 + 0.002, yT - 0.28, s * (bw - 0.08));
    }
  }
  K.rbox(paint, 0.06, yT - yB + 0.06, 2 * bw - 0.06, 0.02, bx1 + 0.02, (yT + yB - 0.06) / 2, 0);
  K.box(liner, 0.01, yT - yB - 0.12, 2 * bw - 0.2, bx1 - 0.02, (yT + yB + 0.12) / 2, 0);
  K.rbox(paint, 0.05, yT - yB - 0.02, 2 * bw - 0.26, 0.02, bx0 + 0.01, (yT + yB) / 2 + 0.01, 0);
  K.rbox(T, 0.02, 0.05, 0.3, 0.01, bx0 - 0.02, yT - 0.1, 0);
  if (b.label) K.add(new THREE.PlaneGeometry(Math.min(1.1, bw * 1.2), 0.12), mat(0xffffff, { map: labelTex(b.label, { bg: '#00000000', fg: '#' + new THREE.Color(b.color).multiplyScalar(0.55).getHexString(), w: 512, h: 64, font: 'bold 52px system-ui' }), transparent: true, roughness: 0.3 }), TM(bx0 - 0.018, yT - 0.26, 0, 0, -Math.PI / 2, 0));
  K.box(liner, bx1 - bx0 - 0.06, 0.04, 2 * bw - 0.16, (bx0 + bx1) / 2, yB + 0.12, 0);
  for (let i = 0; i < 6; i++) K.box(mat(0x1c1c1c, { roughness: 0.9 }), bx1 - bx0 - 0.08, 0.015, 0.04, (bx0 + bx1) / 2, yB + 0.145, -(bw - 0.3) + i * (2 * bw - 0.6) / 5);
}

// ------------------------------------------------------------------ constructor genérico (CAR_MODELS)
const PAINT_FOR = (spec, paint, color) => (k) => {
  if (k == null || k === 'paint') return paint;
  if (k === 'black') return paintMat(0x0d0d0e, 0.25);
  if (k === 'white') return paintMat(0xf1f1ee, 0.28);
  if (k === 'soft') return MT.soft();
  if (k === 'plastic') return MT.plastic();
  if (k === 'trim') return MT.trim();
  if (k === 'chrome') return MT.chrome();
  if (k === 'gloss') return MT.gloss();
  if (k === 'glass') return MT.glass();
  if (k === 'amber') return MT.amber();
  if (k === 'red') return MT.tail();
  if (k === 'under') return MT.under();
  if (k === 'carbon') return mat(0x1a1b1d, { roughness: 0.3, metalness: 0.3, env: true, envI: 0.6 });
  if (typeof k === 'number') return paintMat(k, 0.3);
  return paint;
};
function buildGeneric(M, color, o = {}) {
  const b = M.b, g = new THREE.Group(), K = new Kit();
  const L = b.L, x1 = L / 2, x0 = -L / 2, X = (d) => x1 - d;
  const xf = X(b.fo), xr = xf - b.wb, R = b.R, clr = b.clr ?? 0.16;
  const conv = (arr) => arr.map(([d, y]) => [X(d), y]);
  const rng = (arr) => (arr || []).map(([a, c]) => [Math.min(X(a), X(c)), Math.max(X(a), X(c))]);
  const hw = b.W / 2;
  const bodyX0 = b.bed ? X(b.bed.cab) : x0;
  const gap = b.gap ?? 0.04;
  const wheelsP = [{ x: xf, y: R, a: R + gap }, { x: xr, y: R, a: R + gap + (b.gapR ?? 0) }];
  const fbH = b.fbump ?? 0.17, rbH = b.rbump ?? 0.17;
  const bot = b.bot ? conv(b.bot) : [[bodyX0, clr + rbH], [bodyX0 + 0.1, clr + rbH * 0.45], [bodyX0 + 0.3, clr + 0.02], [Math.max(bodyX0 + 0.35, xr), clr], [xf, clr], [x1 - 0.3, clr + 0.02], [x1 - 0.1, clr + fbH * 0.45], [x1, clr + fbH]];
  const P = {
    x0: bodyX0, x1, xc: b.xc != null ? X(b.xc) : Math.max(bodyX0 + 0.3, Math.min(x1 - 0.3, (xf + xr) / 2)), hw, nF: b.nF ?? 6, nR: b.nR ?? 6,
    shoulder: b.shoulder ?? 0.965, tumble: b.tumble ?? 0.3, hoodCrown: b.hoodCrown ?? 0.03, roofCrown: b.roofCrown ?? 0.05, glassBulge: b.glassBulge ?? 0.01,
    tuck: b.tuck ?? 0.05, pillarW: b.pillarW ?? 0.06, crownExp: b.crownExp ?? 2, tF: b.tF, tR: b.tR,
    belt: conv(b.belt), roof: b.roof ? conv(b.roof) : null, bot, fender: b.fender ? conv(b.fender) : null,
    wheels: wheelsP.filter(w => w.x - w.a < x1 && w.x + w.a > bodyX0),
    sideWin: rng(b.win), bpil: rng(b.bpil), topGlass: rng([b.ws, b.rg, ...(b.glass || [])].filter(Boolean)),
    levels: b.levels ?? [], split: b.split ?? null, blackPillars: b.blackPillars, chromeSill: b.chromeSill, pillarRoof: b.pillarRoof,
    molding: b.molding ? [b.molding[0], b.molding[1], ...rng([[b.molding[2], b.molding[3]]])[0], b.molding[4]] : null,
    stations: b.stations ?? 52, extraX: (b.doors || []).map(X),
  };
  const body = makeBody(P);
  const paint = o.paint ?? paintMat(color, b.rough ?? 0.3, { metal: b.metal });
  const PM = PAINT_FOR(b, paint, color);
  const mainM = b.mainMat ? PM(b.mainMat) : paint; // dos tonos: parte alta de otro color
  const roofM = PM(b.roofMat), lowerM = PM(b.lower ?? 'plastic'), moldM = PM(b.moldMat ?? 'trim');
  const bm = new THREE.Mesh(body.mk(['paint', 'glass', 'trim', 'under', 'lower', 'pillar', 'hood', 'roofp']), [mainM, MT.glass(), moldM, MT.under(), lowerM, MT.chrome(), mainM, roofM]);
  g.add(bm); envWatch(bm);
  const T = MT.trim(), ch = MT.chrome(), ns = body.half(0).pts.length;
  const ctx = { g, K, body, b, X, xf, xr, R, paint, PM, color, hw, x0, x1, bodyX0 };
  // juntas: puertas, cofre, cajuela
  for (const d of b.doors || []) K.add(body.seamGeo(X(d), b.seamK ?? 11, ns - 4), T);
  if (b.hoodLine != null) K.add(body.seamGeo(X(b.hoodLine), 0, 11), T);
  if (b.trunkLine != null) K.add(body.seamGeo(X(b.trunkLine), 0, 11), T);
  if (b.hoodSides) K.add(topLine(body, X(b.hoodSides[0]), X(b.hoodSides[1]), b.hoodSides[2]), T);
  if (b.trunkSides) K.add(topLine(body, X(b.trunkSides[0]), X(b.trunkSides[1]), b.trunkSides[2]), T);
  for (const l of b.lines || []) K.add(sideLine(body, X(l[0]), X(l[1]), l[2], l[3] ?? 0.008, 0.003), PM(l[4] ?? 'trim'));
  // manijas y espejos
  for (const [d, y] of b.handles || []) for (const s of [1, -1]) handle(K, body, X(d), y, s, b.handleMat ? PM(b.handleMat) : (b.handleType === 'flush' ? paint : T), b.handleType);
  if (b.mirror) { const [d, y, sz = 1, mm = 'paint'] = b.mirror; for (const s of [1, -1]) mirror(K, body, X(d), y, PM(mm), s, sz); }
  // limpiadores
  if (b.ws && b.wipers !== false) {
    const xw = X(b.ws[0]) - 0.06;
    for (const zz of [0.22, -0.34]) { const y = body.topAt(xw, zz); K.box(T, 0.018, 0.014, hw * 0.62, xw, y + 0.02, zz, 0, 0.1, 0); }
  }
  // lámparas, parrillas, rejillas
  const texFor = (e, aspect) => {
    if (e.kind === 'grille') return decalMat(grilleTex(e.tex, aspect, e.poly, e.frame ?? 'none', e.bars ?? 'black'), { metal: e.frame === 'chrome' || e.bars === 'chrome' ? 0.55 : 0.2 });
    return lampMat(lampTex(e.tex, aspect, e.poly, e.extra ?? ''), e.glow ?? (e.tex.startsWith('h') ? 0.35 : e.tex.startsWith('t') ? 0.3 : 0.15));
  };
  const place = (e, front) => {
    if (e.round) { // faro redondo 3D
      const y = e.y, p = body.at(front, y, e.s), sgs = e.s === 0 ? [1] : [1, -1];
      for (const sd of sgs) {
        const dir = [p.nx * Math.cos(e.tilt ?? 0), Math.sin(e.tilt ?? 0), sd * p.nz * Math.cos(e.tilt ?? 0)];
        const pos = [p.x + p.nx * (e.out ?? 0), y, sd * (p.z + p.nz * (e.out ?? 0))];
        roundLamp(K, pos, dir, e.round, e.bezel === 'none' ? null : PM(e.bezel ?? 'chrome'), lampMat(lampTex(e.tex ?? (front ? 'hlens' : 'tround1'), 1, ellPoly()), e.glow ?? 0.3), { dome: e.dome, depth: e.depth });
      }
      return;
    }
    const [s0, s1] = Array.isArray(e.s) ? e.s : [-e.s, e.s], [y0, y1] = e.y;
    const aspect = Math.abs(s1 - s0) / Math.max(0.01, y1 - y0);
    const m = e.mat ? PM(e.mat) : texFor(e, aspect);
    K.add(endPatch(body, front, s0, s1, y0, y1, { out: e.out ?? 0.005, bulge: e.bulge ?? 0 }), m);
  };
  for (const e of b.head || []) place(e, true);
  for (const e of b.grille || []) place({ kind: 'grille', ...e }, true);
  for (const e of b.front || []) place(e, true);
  for (const e of b.tail || []) place(e, false);
  for (const e of b.rear || []) place(e, false);
  for (const e of b.top || []) { // parches sobre cofre/techo/cofre trasero: {x:[d0,d1], z:[z0,z1], tex, kind}
    const xa = X(e.x[1]), xb = X(e.x[0]);
    const m = e.mat ? PM(e.mat) : e.stripe ? decalMat(stripeTex(e.stripe, e.n ?? 2), { metal: 0.2, rough: 0.3 }) : decalMat(grilleTex(e.tex, (xb - xa) / Math.max(0.01, e.z[1] - e.z[0]), e.poly, e.frame ?? 'none', e.bars ?? 'black'));
    K.add(topPatch(body, xa, xb, e.z[0], e.z[1], { out: e.out ?? 0.004 }), m);
  }
  for (const e of b.side || []) { // parches laterales: {x:[d0,d1], y:[y0,y1], tex|mat|stripe}
    const xa = X(e.x[1]), xb = X(e.x[0]);
    const m = e.mat ? PM(e.mat) : e.stripe ? decalMat(stripeTex(e.stripe, 1), { metal: 0.2 }) : e.lamp ? lampMat(lampTex(e.lamp, (xb - xa) / (e.y[1] - e.y[0]), e.poly), 0.2) : decalMat(grilleTex(e.tex, (xb - xa) / (e.y[1] - e.y[0]), e.poly, e.frame ?? 'none', e.bars ?? 'black'));
    K.add(sidePatch(body, xa, xb, e.y[0], e.y[1], { out: e.out ?? 0.004 }), m);
  }
  // defensas
  for (const [key, front] of [['bumpF', true], ['bumpR', false]]) {
    for (const bp of [].concat(b[key] || [])) arcBumper(K, body, front, bp.y, bp.h, bp.d ?? 0.06, PM(bp.mat ?? 'chrome'), bp.s ?? 0.6, bp.out ?? 0.01);
  }
  // placas
  if (b.plateF !== null) { const y = b.plateF ?? clr + fbH * 0.9; const p = body.at(true, y, 0); K.add(new THREE.PlaneGeometry(0.34, 0.17), mat(0xffffff, { map: plateTex(o.plate ?? rndPlate()), roughness: 0.45 }), TM(p.x + (b.plateOutF ?? 0.012), y, 0, 0, Math.PI / 2, 0)); }
  if (b.plateR !== null && !b.bed) { const y = b.plateR ?? 0.62; const p = body.at(false, y, 0); K.add(new THREE.PlaneGeometry(0.34, 0.17), mat(0xffffff, { map: plateTex(o.plate ?? rndPlate()), roughness: 0.45 }), TM(p.x - (b.plateOutR ?? 0.012), y, 0, 0, -Math.PI / 2, 0)); K.box(T, 0.012, 0.19, 0.36, p.x - (b.plateOutR ?? 0.012) + 0.007, y, 0); }
  // insignia con el nombre del modelo
  if (b.badge !== false && !b.bed) {
    const txt = b.badge ?? M.model.toUpperCase().slice(0, 14), y = b.badgeY ?? (b.plateR ?? 0.62) + 0.17;
    const p = body.at(false, y, b.badgeS ?? 0.35);
    const w = Math.min(0.32, 0.03 * txt.length + 0.04);
    K.add(new THREE.PlaneGeometry(w, 0.045), mat(0xffffff, { map: labelTex(txt, { bg: '#00000000', fg: '#dde2e6', w: 512, h: 72, font: 'bold 54px system-ui' }), transparent: true, alphaTest: 0.3, metalness: 0.6, roughness: 0.25, env: true }), TM(p.x - 0.006, y, -(p.z), 0, -Math.PI / 2 + Math.atan2(p.nz, -p.nx) * 0, 0));
  }
  // escapes
  for (const e of b.exhaust || []) {
    const n = e.n ?? 1;
    for (const sd of e.both === false ? [1] : [1, -1]) for (let i = 0; i < n; i++) {
      const z = sd * (e.z + i * (e.gap ?? 0.1)), y = e.y ?? clr + 0.06;
      const p = body.at(false, y, Math.abs(z)), xe = p.x - (e.out ?? 0.0);
      if (e.shape === 'rect') { K.rbox(ch, 0.08, e.r * 1.4, e.w ?? e.r * 3, 0.01, xe + 0.02, y, z); K.box(MT.under(), 0.02, e.r * 1.1, (e.w ?? e.r * 3) - 0.02, xe - 0.012, y, z); }
      else { K.cyl(ch, e.r, e.r, 0.12, 14, xe + 0.04, y, z, 0, 0, Math.PI / 2); K.cyl(MT.under(), e.r * 0.8, e.r * 0.8, 0.01, 12, xe - 0.021, y, z, 0, 0, Math.PI / 2); }
    }
  }
  // arcos: cejas / guardafangos
  if (b.arches) for (const w of wheelsP) if (w.x < x1 && w.x > bodyX0 - 0.1 || b.bed) {
    if (b.bed && w.x < bodyX0) continue;
    const A = b.arches; archLip(K, body, { ...w, a: w.a + (A.grow ?? 0) }, PM(A.mat ?? 'plastic'), A.r ?? 0.02, A.out ?? 0.0, A.a0 ?? -0.12, A.a1 ?? Math.PI + 0.12, A.flare ?? 0);
  }
  // antena de techo tipo aleta
  if (b.shark) { const xs = X(b.shark), y = body.topAt(xs, 0); K.add(new RoundedBoxGeometry(0.16, 0.06, 0.05, 2, 0.02), PM(b.shark_mat ?? 'black'), TM(xs, y + 0.02, 0, 0, 0, 0.12)); }
  // extras específicos
  for (const e of b.extras || []) EXTRAS[e.type]?.(ctx, e);
  // caja de pickup
  if (b.bed) {
    const B = b.bed;
    truckBed(K, paint, { bx0: x0, bx1: bodyX0 - 0.03, bw: B.w ?? hw - 0.01, xr, a: R + gap + 0.01, yT: B.h, yB: B.yB ?? clr + 0.22, wy: R, label: B.label, color, tailTex: lampTex(B.tail ?? 'tclassic', 0.35), tailH: B.tailH ?? 0.4, tailY: B.tailY, railM: B.rail ? PM(B.rail) : null });
    if (b.plateR !== null) K.add(new THREE.PlaneGeometry(0.34, 0.17), mat(0xffffff, { map: plateTex(rndPlate()), roughness: 0.45 }), TM(x0 - 0.04, B.plateY ?? clr + 0.35, 0, 0, -Math.PI / 2, 0));
    // medallón trasero de la cabina
    const yb = body.belt(bodyX0 + 0.02) + 0.06, yt = body.top(bodyX0 + 0.05) - 0.08;
    K.add(new RoundedBoxGeometry(0.02, yt - yb, hw * 1.3, 2, 0.05), MT.glass(), TM(bodyX0 - 0.004, (yt + yb) / 2, 0));
    if (B.bumper !== false) { K.rbox(PM(B.bumper ?? 'chrome'), 0.14, 0.16, 2 * hw - 0.04, 0.03, x0 - 0.06, clr + 0.2, 0); K.box(T, 0.06, 0.04, 0.5, x0 - 0.13, clr + 0.28, 0); }
  }
  // chasis y bajos
  K.box(MT.under(), (x1 - bodyX0) * 0.86, 0.1, hw * 1.6, (x1 + bodyX0) / 2, clr + 0.06, 0);
  // ruedas
  const W = b.wheel || {}, tw = b.tw ?? 0.2, track = b.track ?? (2 * hw - tw - 0.06);
  addWheels(g, K, [[xf, track / 2], [xr, track / 2], [xf, -track / 2], [xr, -track / 2]], { R, w: tw, rr: b.rr ?? R * 0.62, style: W.style ?? 'alloy5', rim: W.rim ?? 'silver', cap: W.cap, whitewall: W.whitewall, caliper: W.caliper, paint });
  K.build(g);
  g.userData.body = body;
  return g;
}

// ------------------------------------------------------------------ extras por modelo
const EXTRAS = {
  // alerón trasero: {d (desde el frente), y (altura del ala), span, chord, posts, mat}
  wing(c, e) {
    const { K, X, PM, body } = c, x = X(e.d), m = PM(e.mat ?? 'paint');
    K.rbox(m, e.chord ?? 0.28, e.t ?? 0.04, e.span ?? 1.5, 0.015, x, e.y, 0, 0, 0, e.tilt ?? 0.06);
    for (const s of [1, -1]) {
      if (e.plates !== false) K.rbox(m, (e.chord ?? 0.28) + 0.04, e.ph ?? 0.14, 0.02, 0.008, x, e.y - (e.ph ?? 0.14) * 0.35, s * (e.span ?? 1.5) / 2);
      const zp = s * (e.post ?? 0.45), yb = body.topAt(x, zp);
      if (e.y - yb > 0.03) K.rbox(PM(e.postMat ?? 'paint'), 0.1, e.y - yb, 0.04, 0.01, x, (e.y + yb) / 2, zp);
    }
  },
  // aleta trasera tipo 'ducktail' o labio
  lip(c, e) {
    const { K, X, PM, body } = c, x = X(e.d), m = PM(e.mat ?? 'paint');
    for (let i = 0; i < 1; i++) {
      const y = body.topAt(x, 0);
      K.rbox(m, e.chord ?? 0.16, e.t ?? 0.03, (e.span ?? 1.3), 0.012, x, y + (e.h ?? 0.03), 0, 0, 0, e.tilt ?? 0.15);
    }
  },
  // aletas (Cadillac 59 / Impala): perfil lateral extruido sobre la salpicadera trasera
  fin(c, e) {
    const { K, X, PM, body, paint } = c;
    const sh = new THREE.Shape(); const pts = e.pts.map(([d, y]) => [X(d), y]);
    sh.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) sh.lineTo(p[0], p[1]); sh.closePath();
    const eg = new THREE.ExtrudeGeometry(sh, { depth: e.t ?? 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 8 });
    for (const s of [1, -1]) K.add(eg.clone(), paint, TM(0, 0, s * (e.z ?? c.hw - 0.12) - (e.t ?? 0.06) / 2));
    if (e.bullets) for (const s of [1, -1]) for (const [d, y] of e.bullets) {
      const x = X(d);
      K.add(new THREE.ConeGeometry(0.045, 0.14, 16), MT.tail(), TM(x - 0.06, y, s * (e.z ?? c.hw - 0.12), 0, 0, Math.PI / 2));
      K.cyl(MT.chrome(), 0.05, 0.05, 0.05, 16, x, y, s * (e.z ?? c.hw - 0.12), 0, 0, Math.PI / 2);
    }
  },
  // llanta de refacción en la puerta trasera
  spare(c, e) {
    const { g, K, X, PM, body } = c, x = X(c.b.L) - (e.out ?? 0.12), y = e.y ?? 0.95, r = e.r ?? c.R;
    const w = new THREE.Group(); w.position.set(x, y, 0); w.rotation.y = -Math.PI / 2;
    const G = wheelGeos({ R: r, w: 0.2, rr: r * 0.6, style: e.style ?? 'steel' });
    const hold = new THREE.Group(); hold.rotation.x = Math.PI / 2; w.add(hold);
    const mats = { tire: MT.tire(), rim: rimMat(e.rim ?? 'dark'), dark: mat(0x1a1b1c, { roughness: 0.6 }), cap: MT.chrome(), white: MT.tire() };
    for (const k in G) hold.add(new THREE.Mesh(G[k], mats[k]));
    g.add(w);
    if (e.cover) { K.add(new THREE.CylinderGeometry(r + 0.01, r + 0.01, 0.21, 28, 1, true), PM(e.cover), TM(x, y, 0, 0, 0, Math.PI / 2)); K.add(new THREE.CircleGeometry(r + 0.01, 28), PM(e.cover), TM(x - 0.105, y, 0, 0, -Math.PI / 2, 0)); }
    K.box(MT.trim(), 0.14, 0.08, 0.08, x + 0.1, y, 0);
  },
  // barras de techo
  rails(c, e) {
    const { K, X, body, PM } = c, xa = X(e.x[1]), xb = X(e.x[0]), m = PM(e.mat ?? 'black');
    for (const s of [1, -1]) {
      const pts = []; for (let i = 0; i <= 10; i++) { const x = xa + (xb - xa) * i / 10, z = s * body.half(x).wr * (e.zf ?? 0.78); pts.push(new THREE.Vector3(x, body.topAt(x, z) + (e.h ?? 0.05), z)); }
      K.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, e.r ?? 0.015, 6, false), m);
      for (const t of [0.05, 0.95]) { const p = pts[Math.round(t * 10)]; K.rbox(m, 0.08, e.h ?? 0.05, 0.04, 0.01, p.x, p.y - (e.h ?? 0.05) / 2, p.z); }
    }
  },
  // toma de aire sobre el cofre
  scoop(c, e) {
    const { K, X, body, PM } = c, x = X(e.d), y = body.topAt(x, 0);
    K.rbox(PM(e.mat ?? 'paint'), e.l ?? 0.5, e.h ?? 0.08, e.w ?? 0.5, 0.03, x, y + (e.h ?? 0.08) / 2 - 0.01, 0, 0, 0, e.tilt ?? 0.03);
    K.box(MT.under(), 0.02, (e.h ?? 0.08) * 0.6, (e.w ?? 0.5) * 0.8, x + (e.l ?? 0.5) / 2, y + (e.h ?? 0.08) * 0.45, 0);
  },
  // tapa de gasolina, cuartos laterales
  box(c, e) { const { K, X, PM } = c; for (const s of e.both === false ? [1] : [1, -1]) K.rbox(PM(e.mat ?? 'trim'), e.l, e.h, e.w, e.r ?? 0.01, X(e.d), e.y, s * e.z, e.rx ?? 0, e.ry ?? 0, e.rz ?? 0); },
  cyl(c, e) { const { K, X, PM } = c; for (const s of e.both === false ? [1] : [1, -1]) K.cyl(PM(e.mat ?? 'trim'), e.r, e.r2 ?? e.r, e.h, 16, X(e.d), e.y, s * e.z, e.rx ?? 0, e.ry ?? 0, e.rz ?? 0); },
  // estribos
  steps(c, e) { const { K, X, PM } = c; for (const s of [1, -1]) K.rbox(PM(e.mat ?? 'plastic'), X(e.x[0]) - X(e.x[1]), 0.05, e.w ?? 0.16, 0.02, (X(e.x[0]) + X(e.x[1])) / 2, e.y, s * (e.z ?? c.hw - 0.02)); },
  // bisagras expuestas (Wrangler, Clase G)
  hinges(c, e) { const { K, X, body } = c; for (const d of e.d) for (const y of e.y) for (const s of [1, -1]) { const p = body.onSide(X(d), y, s); K.rbox(MT.trim(), 0.08, 0.05, 0.03, 0.008, p.x, y, p.z + s * 0.01); } },
  // torreta de policía / luces
  lightbar(c, e) { const { K, X, body } = c, x = X(e.d), y = body.topAt(x, 0); K.rbox(MT.trim(), 0.25, 0.05, 1.1, 0.02, x, y + 0.04, 0); K.add(new THREE.BoxGeometry(0.2, 0.05, 1.0), lampMat(lampTex('lightbar', 5)), TM(x, y + 0.085, 0)); },
  // cofre con parrilla de persiana (Countach, F40): usa 'top' con louver
  // defensa tubular / tumbaburros
  bullbar(c, e) {
    const { K, X, PM, body } = c, x = X(0) + (e.out ?? 0.12), m = PM(e.mat ?? 'black');
    for (const s of [1, -1]) K.cyl(m, 0.03, 0.03, e.h ?? 0.5, 10, x, (e.y ?? 0.6), s * 0.35);
    K.cyl(m, 0.03, 0.03, 0.8, 10, x, (e.y ?? 0.6) + (e.h ?? 0.5) / 2, 0, Math.PI / 2, 0, 0);
  },
  // cajas laterales de toma de aire (Countach)
  airbox(c, e) { const { K, X, PM, body } = c; for (const s of [1, -1]) { const x = X(e.d), z = body.half(x).wr * 0.98; K.rbox(PM(e.mat ?? 'paint'), e.l ?? 0.5, e.h ?? 0.14, e.w ?? 0.3, 0.03, x, body.topAt(x, z) + (e.h ?? 0.14) / 2 - 0.03, s * (z - (e.w ?? 0.3) / 2 + 0.06), 0, 0, e.tilt ?? 0.04); K.box(MT.under(), 0.02, (e.h ?? 0.14) * 0.6, (e.w ?? 0.3) * 0.8, x + (e.l ?? 0.5) / 2, body.topAt(x, z) + (e.h ?? 0.14) * 0.4, s * (z - (e.w ?? 0.3) / 2 + 0.06)); } },
  // tiras horizontales en el costado (Testarossa)
  strakes(c, e) {
    const { K, X, PM, body } = c, m = PM(e.mat ?? 'paint');
    for (let i = 0; i < e.n; i++) { const y = e.y0 + i * e.dy; const xa = X(e.x[1]), xb = X(e.x[0]); K.add(sideLine(body, xa, xb, y, e.t ?? 0.025, e.off ?? 0.01), m); }
  },
  // espejo en la puerta alto (camiones) — ya cubierto por mirror; techo de lona / hardtop
  snorkel(c, e) { const { K, X, body } = c, x = X(e.d); const p = body.onSide(x, e.y0, 1); K.cyl(MT.trim(), 0.045, 0.045, e.h, 10, x, e.y0 + e.h / 2, p.z + 0.06); K.rbox(MT.trim(), 0.14, 0.1, 0.12, 0.03, x + 0.03, e.y0 + e.h, p.z + 0.06); },
  // cristal partido (Combi): marco central vertical
  split(c, e) { const { K, X, body } = c, xa = X(e.x[1]), xb = X(e.x[0]); const pts = []; for (let i = 0; i <= 8; i++) { const x = xa + (xb - xa) * i / 8; pts.push(new THREE.Vector3(x, body.topAt(x, 0) + 0.004, 0)); } K.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, e.r ?? 0.025, 6, false), c.PM(e.mat ?? 'paint')); },
  // emblema V frontal (Combi)
  vee(c, e) {
    const { K, body, PM } = c, m = PM(e.mat ?? 'white');
    for (const s of [1, -1]) {
      const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12, y = e.y1 + (e.y0 - e.y1) * t, sv = s * (e.s1 * (1 - t)); const p = body.at(true, y, Math.abs(sv)); pts.push(new THREE.Vector3(p.x + 0.006, y, Math.sign(sv || 1) * p.z)); }
      K.add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, e.r ?? 0.02, 5, false), m);
    }
    const p = body.at(true, e.y0 + 0.02, 0); K.cyl(MT.chrome(), 0.1, 0.1, 0.02, 24, p.x + 0.01, e.y0 + 0.02, 0, 0, 0, Math.PI / 2);
  },
  // defensa trasera tipo tubo (Combi) / cualquier barra horizontal
  bar(c, e) { const { K, X, PM } = c; K.rbox(PM(e.mat ?? 'chrome'), e.l ?? 0.1, e.h ?? 0.1, e.w, 0.02, X(e.d), e.y, 0); },
  // estribo de cilindros y ojo de buey (clásicos): ruedas ocultas (faldones)
  skirt(c, e) { const { K, body, X, PM } = c; const xa = X(e.x[1]), xb = X(e.x[0]); K.add(sidePatch(body, xa, xb, e.y[0], e.y[1], { out: 0.004 }), PM('paint')); },
  // parabrisas de roadster sin techo + barra (no usado)
};

// ------------------------------------------------------------------ fábrica
export function makeCar(type = 'sedan', color, o = {}) {
  let g;
  const M = carInfo(type);
  if (M && !color) color = M.colors[(Math.random() * M.colors.length) | 0];
  const alias = M?.b?.legacy ?? type;
  if (alias === 'vocho') g = vocho(color || 0x6a8a3a, o);
  else if (alias === 'pickup') g = pickup(color || 0x8a2a1a, o);
  else if (alias === 'taxi') {
    const pink = paintMat(0xd83a78, 0.28);
    g = sedan(0xf4f2ee, { ...o, split: 0.78, lowerPaint: pink, plate: 'A 12-345', wheelStyle: 'hubcap' });
    const K = new Kit(), body = g.userData.body;
    K.add(new RoundedBoxGeometry(0.28, 0.14, 0.62, 3, 0.04), mat(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.3, map: labelTex('TAXI', { bg: '#ffffff', fg: '#d83a78', w: 256, h: 96, font: 'bold 72px system-ui' }) }), TM(0.0, body.top(0) + 0.08, 0));
    K.box(MT.trim(), 0.3, 0.02, 0.64, 0.0, body.top(0) + 0.01, 0);
    const lab = mat(0xffffff, { map: labelTex('CDMX · TAXI', { bg: '#00000000', fg: '#ffffff', w: 512, h: 96, font: 'bold 64px system-ui' }), transparent: true, roughness: 0.3 });
    for (const s of [1, -1]) {
      const p = body.onSide(-0.33, 0.7, s);
      K.add(new THREE.PlaneGeometry(0.6, 0.11), lab, TM(p.x, 0.7, p.z + s * 0.006, 0, s > 0 ? 0 : Math.PI, 0));
      const q = body.onSide(0.55, 0.7, s);
      K.add(new THREE.PlaneGeometry(0.5, 0.1), mat(0xffffff, { map: labelTex('A 12-345', { bg: '#00000000', fg: '#ffffff', w: 512, h: 96, font: 'bold 70px system-ui' }), transparent: true }), TM(q.x, 0.7, q.z + s * 0.006, 0, s > 0 ? 0 : Math.PI, 0));
    }
    K.build(g);
  } else if (alias === 'police') {
    g = sedan(0xf4f4f4, { ...o, split: 0.7, lowerPaint: paintMat(0x1a3a8a, 0.3), plate: 'PAT-066' });
    const body = g.userData.body, K = new Kit();
    const bar = new THREE.Group(); bar.position.set(-0.05, body.top(-0.05) + 0.02, 0); g.add(bar);
    K.rbox(MT.trim(), 0.3, 0.07, 1.25, 0.03, 0, 0.035, 0);
    K.rbox(MT.clear(), 0.2, 0.08, 0.1, 0.03, 0, 0.11, 0);
    for (const s of [1, -1]) K.box(MT.trim(), 0.04, 0.04, 0.04, 0, -0.01, s * 0.5);
    K.build(bar);
    const red = mat(0xff2020, { emissive: 0xff0000, emissiveIntensity: 2.5, transparent: true, opacity: 0.9 });
    const blue = mat(0x2040ff, { emissive: 0x1030ff, emissiveIntensity: 2.5, transparent: true, opacity: 0.9 });
    const l = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.11, 0.55, 3, 0.045), red); l.position.set(0, 0.12, -0.31); bar.add(l);
    const r = new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.11, 0.55, 3, 0.045), blue); r.position.set(0, 0.12, 0.31); bar.add(r);
    const K2 = new Kit();
    const lab = mat(0xffffff, { map: labelTex('POLICÍA', { bg: '#00000000', fg: '#1a3a8a', w: 512, h: 96, font: 'bold 80px system-ui' }), transparent: true });
    const lab2 = mat(0xffffff, { map: labelTex('SSC · CDMX', { bg: '#00000000', fg: '#ffffff', w: 512, h: 96, font: 'bold 64px system-ui' }), transparent: true });
    for (const s of [1, -1]) {
      const p = body.onSide(-0.2, 0.8, s);
      K2.add(new THREE.PlaneGeometry(1.0, 0.18), lab, TM(p.x, 0.8, p.z + s * 0.006, 0, s > 0 ? 0 : Math.PI, 0));
      const q = body.onSide(-0.2, 0.55, s);
      K2.add(new THREE.PlaneGeometry(0.7, 0.12), lab2, TM(q.x, 0.55, q.z + s * 0.006, 0, s > 0 ? 0 : Math.PI, 0));
    }
    K2.build(g);
    g.userData.lightbar = { red, blue };
  } else if (M && M.b && !M.b.legacy) g = buildGeneric(M, color, o);
  else g = sedan(color || 0xc8c4bc, o);
  g.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  g.userData.model = M?.id ?? type;
  g.userData.length = M?.b?.L ?? M?.length ?? 4.3;
  return g;
}
