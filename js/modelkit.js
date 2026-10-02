// Kit de modelado procedural para los objetos coleccionables.
// Unidades en metros. Cada modelo nace con el origen en el centro de su base.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export { THREE };

// ---------- entorno para metales ----------
let ENV = null;
const envMats = new Set();
export function setEnvMap(tex) {
  ENV = tex;
  for (const m of envMats) { m.envMap = tex; m.needsUpdate = true; }
}

// ---------- aleatorio con semilla ----------
export function rng(seed = 1) {
  let a = typeof seed === 'string' ? [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7) : seed | 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- materiales ----------
const matCache = new Map();
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o, (k, v) => (v && v.isTexture ? v.uuid : v));
  if (matCache.has(key)) return matCache.get(key);
  const { env, envI, ...rest } = o;
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0, ...rest });
  if ((o.metalness ?? 0) > 0.3 || env) { if (ENV) m.envMap = ENV; envMats.add(m); m.envMapIntensity = envI ?? 1; }
  matCache.set(key, m);
  return m;
}
export const metal = (color, rough = 0.3, o = {}) => mat(color, { metalness: 1, roughness: rough, ...o });
export const plastic = (color, rough = 0.45) => mat(color, { roughness: rough, env: true, envI: 0.35 });
export const glossy = (color) => mat(color, { roughness: 0.18, env: true, envI: 0.6 });
export function glass(color = 0xd8ecf2, opacity = 0.3) {
  return mat(color, { transparent: true, opacity, roughness: 0.05, metalness: 0.1, env: true, envI: 1.2, depthWrite: false });
}
export const emissive = (color, i = 1.5) => mat(color, { emissive: color, emissiveIntensity: i });
export const texMat = (tex, o = {}) => mat(0xffffff, { map: tex, roughness: 0.7, ...o });

export const C = {
  gold: () => metal(0xd9a93a, 0.22),
  brass: () => metal(0xb58a3c, 0.35),
  silver: () => metal(0xd0d4d8, 0.2),
  chrome: () => metal(0xeef1f4, 0.08),
  steel: () => metal(0x9aa0a6, 0.4),
  iron: () => metal(0x3c3a38, 0.6),
  bronze: () => metal(0x8a5a2b, 0.4),
  copper: () => metal(0xb8663a, 0.3),
  rust: () => mat(0x6e3b22, { roughness: 0.9, metalness: 0.4 }),
  black: () => plastic(0x161616),
  wood: (c = 0x7a4e2a) => mat(c, { map: woodTex(c), roughness: 0.65 }),
  darkWood: () => mat(0x4a2c17, { map: woodTex(0x4a2c17), roughness: 0.55 }),
  leather: (c = 0x3b2618) => mat(c, { map: leatherTex(), roughness: 0.8 }),
  paper: () => mat(0xefe6cf, { roughness: 0.95 }),
  cloth: (c) => mat(c, { roughness: 1, map: clothTex() }),
  rubber: () => mat(0x1c1c1c, { roughness: 0.9 }),
  porcelain: (c = 0xf4f2ec) => mat(c, { roughness: 0.15, env: true, envI: 0.8 }),
  marble: () => mat(0xeeeae4, { map: marbleTex(), roughness: 0.25, env: true, envI: 0.6 }),
};

// ---------- texturas ----------
const texCache = new Map();
export function canvasTex(key, w, h, draw, repeat = false) {
  if (key && texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (key) texCache.set(key, t);
  return t;
}
export const hex = (n) => '#' + n.toString(16).padStart(6, '0');
function shade(n, k) {
  const r = Math.min(255, ((n >> 16) & 255) * k) | 0, g = Math.min(255, ((n >> 8) & 255) * k) | 0, b = Math.min(255, (n & 255) * k) | 0;
  return `rgb(${r},${g},${b})`;
}
export function woodTex(color = 0x7a4e2a) {
  return canvasTex('wood' + color, 256, 256, (c, w, h) => {
    const R = rng(color);
    c.fillStyle = hex(color); c.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) {
      c.strokeStyle = shade(color, 0.7 + R() * 0.5); c.globalAlpha = 0.25 + R() * 0.3; c.lineWidth = 1 + R() * 3;
      const y = R() * h;
      c.beginPath(); c.moveTo(0, y);
      for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x * 0.03 + i) * 4 + (R() - 0.5) * 2);
      c.stroke();
    }
    c.globalAlpha = 1;
  }, true);
}
function leatherTex() {
  return canvasTex('leather', 128, 128, (c, w, h) => {
    const R = rng(3);
    c.fillStyle = '#888'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(${R() < 0.5 ? 0 : 255},${R() < 0.5 ? 0 : 255},${R() < 0.5 ? 0 : 255},0.08)`; c.fillRect(R() * w, R() * h, 2, 2); }
  }, true);
}
function clothTex() {
  return canvasTex('cloth', 64, 64, (c, w, h) => {
    c.fillStyle = '#ddd'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(0,0,0,0.12)';
    for (let i = 0; i < w; i += 2) { c.fillRect(i, 0, 1, h); c.fillRect(0, i, w, 1); }
  }, true);
}
function marbleTex() {
  return canvasTex('marble', 256, 256, (c, w, h) => {
    const R = rng(9);
    c.fillStyle = '#f1eee8'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) {
      c.strokeStyle = `rgba(120,115,110,${0.1 + R() * 0.25})`; c.lineWidth = 0.5 + R() * 2;
      let x = R() * w, y = 0;
      c.beginPath(); c.moveTo(x, y);
      while (y < h) { x += (R() - 0.5) * 30; y += 10 + R() * 20; c.lineTo(x, y); }
      c.stroke();
    }
  }, true);
}
// etiqueta con texto
export function labelTex(text, o = {}) {
  const { bg = '#ffffff', fg = '#111111', w = 512, h = 128, font = 'bold 72px system-ui', border = null, sub = null, subFont = '500 34px system-ui', align = 'center' } = o;
  return canvasTex(`lbl|${text}|${bg}|${fg}|${w}|${h}|${font}|${border}|${sub}`, w, h, (c) => {
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    if (border) { c.strokeStyle = border; c.lineWidth = h * 0.06; c.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1); }
    c.fillStyle = fg; c.font = font; c.textAlign = align; c.textBaseline = 'middle';
    const x = align === 'center' ? w / 2 : w * 0.06;
    c.fillText(text, x, sub ? h * 0.4 : h / 2 + 2);
    if (sub) { c.font = subFont; c.fillText(sub, x, h * 0.75); }
  });
}
// arte procedural: portadas, pinturas, pósters
export function artTex(seed, style = 'abstract', w = 256, h = 256, title = null) {
  return canvasTex(`art|${seed}|${style}|${w}|${h}|${title}`, w, h, (c) => {
    const R = rng(seed);
    const hue = R() * 360;
    const col = (dh, s, l, a = 1) => `hsla(${(hue + dh) % 360},${s}%,${l}%,${a})`;
    if (style === 'landscape') {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, col(200, 50, 70)); g.addColorStop(0.6, col(30, 60, 80)); g.addColorStop(1, col(90, 30, 40));
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let k = 0; k < 3; k++) {
        c.fillStyle = col(100 + k * 20, 30, 45 - k * 10);
        c.beginPath(); c.moveTo(0, h);
        for (let x = 0; x <= w; x += 8) c.lineTo(x, h * (0.5 + k * 0.12) + Math.sin(x * 0.02 + R() * 6) * 20 * (1 - k * 0.2));
        c.lineTo(w, h); c.fill();
      }
      c.fillStyle = col(40, 80, 85, 0.8); c.beginPath(); c.arc(w * (0.2 + R() * 0.6), h * 0.22, w * 0.07, 0, 7); c.fill();
    } else if (style === 'portrait') {
      c.fillStyle = col(20, 40, 18); c.fillRect(0, 0, w, h);
      const g = c.createRadialGradient(w / 2, h * 0.4, 5, w / 2, h * 0.4, w * 0.6); g.addColorStop(0, col(30, 50, 35, 0.9)); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = col(0, 20, 12); c.beginPath(); c.ellipse(w / 2, h * 0.95, w * 0.38, h * 0.35, 0, 0, 7); c.fill();
      c.fillStyle = '#d9a982'; c.beginPath(); c.ellipse(w / 2, h * 0.42, w * 0.15, h * 0.19, 0, 0, 7); c.fill();
      c.fillStyle = col(10, 40, 15); c.beginPath(); c.ellipse(w / 2, h * 0.3, w * 0.17, h * 0.12, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#2b1a10'; c.fillRect(w * 0.44, h * 0.4, w * 0.03, h * 0.015); c.fillRect(w * 0.53, h * 0.4, w * 0.03, h * 0.015);
      c.strokeStyle = '#8a4a3a'; c.lineWidth = 2; c.beginPath(); c.arc(w / 2, h * 0.49, w * 0.04, 0.2, Math.PI - 0.2); c.stroke();
    } else if (style === 'scream') {
      for (let y = 0; y < h; y += 3) { c.strokeStyle = `hsl(${20 + Math.sin(y * 0.05) * 20},80%,${45 + Math.sin(y * 0.1) * 10}%)`; c.lineWidth = 4; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 10) c.lineTo(x, y + Math.sin(x * 0.04 + y * 0.03) * 8); c.stroke(); }
      c.fillStyle = '#2f4d6b'; c.beginPath(); c.moveTo(0, h * 0.55); c.quadraticCurveTo(w * 0.5, h * 0.4, w, h * 0.7); c.lineTo(w, h); c.lineTo(0, h); c.fill();
      c.strokeStyle = '#7a4a2a'; c.lineWidth = 10; c.beginPath(); c.moveTo(w * 0.1, h); c.lineTo(w * 0.9, h * 0.45); c.stroke();
      c.fillStyle = '#e4d9a8'; c.beginPath(); c.ellipse(w * 0.35, h * 0.62, w * 0.08, h * 0.12, 0, 0, 7); c.fill();
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.ellipse(w * 0.35, h * 0.68, w * 0.02, h * 0.04, 0, 0, 7); c.fill();
      c.beginPath(); c.arc(w * 0.32, h * 0.59, 4, 0, 7); c.arc(w * 0.38, h * 0.59, 4, 0, 7); c.fill();
      c.fillStyle = '#222'; c.fillRect(w * 0.3, h * 0.74, w * 0.1, h * 0.26);
    } else if (style === 'nouveau') {
      c.fillStyle = col(40, 35, 80); c.fillRect(0, 0, w, h);
      c.strokeStyle = col(40, 50, 45); c.lineWidth = 3;
      c.beginPath(); c.arc(w / 2, h * 0.4, w * 0.35, 0, 7); c.stroke();
      c.fillStyle = col(20, 45, 60); c.beginPath(); c.arc(w / 2, h * 0.4, w * 0.32, 0, 7); c.fill();
      c.fillStyle = '#e8c6a4'; c.beginPath(); c.ellipse(w / 2, h * 0.4, w * 0.1, h * 0.12, 0, 0, 7); c.fill();
      c.fillStyle = col(10, 60, 35); for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(w / 2 + Math.cos(i) * w * 0.14, h * 0.33 + Math.sin(i * 1.7) * h * 0.08, w * 0.06, h * 0.03, i, 0, 7); c.fill(); }
      c.fillStyle = col(60, 40, 40); c.fillRect(w * 0.2, h * 0.55, w * 0.6, h * 0.4);
      c.fillStyle = col(40, 30, 20); c.font = `bold ${w * 0.08}px Georgia`; c.textAlign = 'center'; c.fillText('JOB', w / 2, h * 0.9);
    } else if (style === 'stars') {
      const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#1a0b3d'); g.addColorStop(0.5, '#3b1b7a'); g.addColorStop(1, '#0b2a5c');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${R()})`; c.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); }
      for (let i = 0; i < 5; i++) { const x = R() * w, y = R() * h, r = 20 + R() * 60; const gg = c.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `hsla(${280 + R() * 80},90%,65%,0.45)`); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
    } else if (style === 'map') {
      c.fillStyle = '#e3d1a4'; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(120,85,40,0.12)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(R() * w, R() * h, 10 + R() * 40, 0, 7); c.fill(); }
      c.fillStyle = '#c9b07a'; c.strokeStyle = '#6b4a24'; c.lineWidth = 1.5;
      for (let k = 0; k < 4; k++) {
        const cx = R() * w, cy = R() * h, r = w * (0.08 + R() * 0.15);
        c.beginPath(); for (let a = 0; a < 6.3; a += 0.3) { const rr = r * (0.7 + R() * 0.5); c.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } c.closePath(); c.fill(); c.stroke();
      }
      c.strokeStyle = 'rgba(107,74,36,0.35)'; c.lineWidth = 0.6;
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; c.beginPath(); c.moveTo(w * 0.7, h * 0.7); c.lineTo(w * 0.7 + Math.cos(a) * w, h * 0.7 + Math.sin(a) * w); c.stroke(); }
      c.strokeStyle = '#6b4a24'; c.lineWidth = 2; c.beginPath(); c.arc(w * 0.7, h * 0.7, w * 0.08, 0, 7); c.stroke();
      c.lineWidth = 4; c.strokeRect(4, 4, w - 8, h - 8);
    } else {
      c.fillStyle = col(0, 30, 85); c.fillRect(0, 0, w, h);
      for (let i = 0; i < 9; i++) {
        c.fillStyle = col(R() * 180, 55 + R() * 30, 35 + R() * 30, 0.85);
        if (R() < 0.5) c.fillRect(R() * w, R() * h, R() * w * 0.5, R() * h * 0.5);
        else { c.beginPath(); c.arc(R() * w, R() * h, R() * w * 0.25, 0, 7); c.fill(); }
      }
      c.strokeStyle = '#111'; c.lineWidth = 4;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(R() * w, 0); c.lineTo(R() * w, h); c.stroke(); }
    }
    if (title) {
      c.fillStyle = 'rgba(0,0,0,0.55)'; c.fillRect(0, h * 0.78, w, h * 0.22);
      c.fillStyle = '#fff'; c.font = `bold ${Math.round(h * 0.09)}px system-ui`; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(title, w / 2, h * 0.89);
    }
  });
}
// pantalla con píxeles
export function screenTex(kind = 'gb') {
  return canvasTex('scr' + kind, 128, 128, (c, w, h) => {
    const R = rng(kind);
    if (kind === 'gb') {
      c.fillStyle = '#9bbc0f'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#306230'; for (let x = 0; x < w; x += 8) c.fillRect(x, h - 20, 8, 20);
      c.fillStyle = '#0f380f'; c.fillRect(40, h - 44, 14, 24); c.fillRect(38, h - 50, 18, 8);
      for (let i = 0; i < 4; i++) c.fillRect(20 + i * 26, 30 + (i % 2) * 12, 10, 10);
      c.fillStyle = '#8bac0f'; c.fillRect(0, 0, w, 14);
    } else if (kind === 'crt') {
      c.fillStyle = '#0c1a0c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#39ff66'; c.font = '10px monospace';
      for (let i = 0; i < 10; i++) c.fillText(['READY.', 'LOAD "*",8,1', 'C:\\>DIR', 'RUN', '10 PRINT "HOLA"', '20 GOTO 10', 'A>', 'OK'][(R() * 8) | 0], 6, 14 + i * 11);
    } else if (kind === 'mac') {
      c.fillStyle = '#e8e8e8'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff'; c.fillRect(0, 0, w, 12); c.fillStyle = '#000'; c.fillRect(0, 12, w, 1);
      c.fillRect(44, 40, 40, 48); c.fillStyle = '#e8e8e8'; c.fillRect(48, 44, 32, 30);
      c.fillStyle = '#000'; c.fillRect(56, 52, 3, 6); c.fillRect(69, 52, 3, 6); c.fillRect(56, 64, 16, 2);
    } else if (kind === 'vector') {
      c.fillStyle = '#050505'; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#e8f4ff'; c.lineWidth = 1.2; c.shadowColor = '#9cf'; c.shadowBlur = 4;
      for (let i = 0; i < 7; i++) { c.beginPath(); const x = R() * w, y = R() * h; c.moveTo(x, y); c.lineTo(x + 10, y + 6); c.lineTo(x + 4, y + 14); c.lineTo(x - 6, y + 8); c.closePath(); c.stroke(); }
      c.beginPath(); c.moveTo(w / 2, h - 20); c.lineTo(w / 2 - 8, h - 6); c.lineTo(w / 2 + 8, h - 6); c.closePath(); c.stroke();
    } else if (kind === 'lcd') {
      c.fillStyle = '#b9c2a4'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1d2618'; c.font = 'bold 44px monospace'; c.textAlign = 'right'; c.fillText('1984.00', w - 6, h / 2 + 16);
    } else if (kind === 'phone') {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a6fd8'); g.addColorStop(1, '#8a3ad8');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 12; i++) { c.fillStyle = `hsl(${i * 30},70%,60%)`; c.fillRect(14 + (i % 4) * 26, 20 + ((i / 4) | 0) * 30, 18, 18); }
    } else if (kind === 'tv') {
      for (let i = 0; i < 7; i++) { c.fillStyle = ['#c0c0c0', '#c0c000', '#00c0c0', '#00c000', '#c000c0', '#c00000', '#0000c0'][i]; c.fillRect(i * w / 7, 0, w / 7 + 1, h * 0.7); }
      c.fillStyle = '#111'; c.fillRect(0, h * 0.7, w, h * 0.3);
    } else if (kind === 'nokia') {
      c.fillStyle = '#9fb58a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#1b2a14'; for (let i = 0; i < 6; i++) c.fillRect(20 + i * 12, 60, 10, 10);
      c.fillRect(20, 60, 10, 10); c.font = 'bold 18px monospace'; c.fillText('12:45', 30, 30);
    } else {
      c.fillStyle = '#202830'; c.fillRect(0, 0, w, h);
    }
    c.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 0; y < h; y += 2) c.fillRect(0, y, w, 1);
  });
}

// ---------- geometrías y armado ----------
export function add(g, geo, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(x, y, z); mesh.rotation.set(rx, ry, rz);
  mesh.castShadow = true; mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
export const B = (g, w, h, d, m, x, y, z, rx, ry, rz) => add(g, new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
export const RB = (g, w, h, d, r, m, x, y, z, rx, ry, rz) => add(g, new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999), m, x, y, z, rx, ry, rz);
export const CY = (g, rt, rb, h, m, x, y, z, rx, ry, rz, seg = 24) => add(g, new THREE.CylinderGeometry(rt, rb, h, seg), m, x, y, z, rx, ry, rz);
export const SP = (g, r, m, x, y, z, sx = 1, sy = 1, sz = 1, seg = 20) => { const s = add(g, new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.7 | 0)), m, x, y, z); s.scale.set(sx, sy, sz); return s; };
export const TO = (g, r, t, m, x, y, z, rx, ry, rz, arc = Math.PI * 2, seg = 32) => add(g, new THREE.TorusGeometry(r, t, 10, seg, arc), m, x, y, z, rx, ry, rz);
export const CO = (g, r, h, m, x, y, z, rx, ry, rz, seg = 24) => add(g, new THREE.ConeGeometry(r, h, seg), m, x, y, z, rx, ry, rz);
export function LA(g, pts, m, x = 0, y = 0, z = 0, seg = 40) {
  const geo = new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg);
  return add(g, geo, m, x, y, z);
}
export function TU(g, pts, r, m, closed = false, seg = 48) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed);
  return add(g, new THREE.TubeGeometry(curve, seg, r, 8, closed), m);
}
// placa con textura (calcomanía). Mira hacia +z salvo rotación
export function P(g, w, h, tex, x, y, z, rx = 0, ry = 0, rz = 0, o = {}) {
  const m = tex?.isTexture ? mat(0xffffff, { map: tex, roughness: o.rough ?? 0.6, transparent: !!o.transparent, alphaTest: o.alphaTest ?? 0, side: o.double ? THREE.DoubleSide : THREE.FrontSide, emissive: o.glow ? 0xffffff : 0x000000, emissiveMap: o.glow ? tex : null, emissiveIntensity: o.glow ?? 0 }) : tex;
  return add(g, new THREE.PlaneGeometry(w, h), m, x, y, z, rx, ry, rz);
}
// extrusión de una silueta 2D (en el plano XY) con grosor d centrada en z
export function EX(g, shapePts, d, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, bevel = 0.004) {
  const s = new THREE.Shape(shapePts.map(([a, b]) => new THREE.Vector2(a, b)));
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments: 16 });
  geo.translate(0, 0, -d / 2);
  return add(g, geo, m, x, y, z, rx, ry, rz);
}
export function EXS(g, shape, d, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, bevel = 0.004) {
  const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 3, curveSegments: 24 });
  geo.translate(0, 0, -d / 2);
  return add(g, geo, m, x, y, z, rx, ry, rz);
}
export const grp = (parent, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.set(rx, ry, rz); parent?.add(g); return g; };

// rejilla de botones / teclas
export function grid(g, nx, nz, sx, sz, fn) {
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) fn((i - (nx - 1) / 2) * sx, (j - (nz - 1) / 2) * sz, i, j);
}
// soporte / base de exhibición
export function standBase(g, w = 0.2, d = 0.2, h = 0.03, m = C.darkWood()) { return RB(g, w, h, d, 0.006, m, 0, h / 2, 0); }
// caja de acrílico
export function acrylic(g, w, h, d, y0 = 0) {
  RB(g, w + 0.02, 0.02, d + 0.02, 0.004, C.black(), 0, y0 + 0.01, 0);
  const gl = B(g, w, h, d, glass(0xeef6ff, 0.16), 0, y0 + 0.02 + h / 2, 0); gl.castShadow = false;
}

// barrido: tubo a lo largo de una curva con radio variable (extremidades, cuerpos, colas)
export function SW(g, pts, radii, m, radial = 14, segs = 24, flatZ = 1) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const geo = new THREE.TubeGeometry(curve, segs, 1, radial, false);
  const p = geo.attributes.position, v = new THREE.Vector3();
  const n = radii.length - 1;
  const rf = typeof radii === 'function' ? radii : (t) => { const f = t * n, i = Math.min(n - 1, Math.floor(f)); return radii[i] + (radii[i + 1] - radii[i]) * (f - i); };
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPointAt(i / segs), r = rf(i / segs);
    for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r); v.z *= flatZ; v.add(c); p.setXYZ(k, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals();
  // tapas redondeadas en los extremos
  const mesh = add(g, geo, m);
  for (const t of [0, 1]) { const r = rf(t); if (r > 0.004) { const s = add(g, new THREE.SphereGeometry(r, radial, Math.max(6, radial / 2)), m); s.position.copy(curve.getPointAt(t)); s.scale.z = flatZ; } }
  return mesh;
}
