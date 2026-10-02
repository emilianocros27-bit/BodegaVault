// Rarezas, arte, juguetes, deportes, cine, misteriosos, cotidianos y valiosos.
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, hex, rng,
  add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, grid, standBase, acrylic, SW } from './modelkit.js';
import { signatureTex, Acc, rodGeo, xf, latheGeo, slab, rrShape, rrPath, polyShape, roundPoly, smoothLoop, outline, planarUV, orient, mirrorHalf } from './models-music.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { goldBar } from './models-tech.js';
import { makeCar } from './cars.js';

const lbl = labelTex;

// ---------- piezas genéricas ----------
export function framed(tex, w, h, o = {}) {
  const g = new THREE.Group();
  const fw = o.frame ?? 0.04;
  const fm = o.frameMat ?? (o.ornate ? C.gold() : C.darkWood());
  const f = grp(g, 0, h / 2 + fw + (o.easel ? 0.25 : 0.02), 0, o.easel ? -0.12 : -0.08);
  B(f, w + fw * 2, fw, 0.03, fm, 0, h / 2 + fw / 2, 0); B(f, w + fw * 2, fw, 0.03, fm, 0, -h / 2 - fw / 2, 0);
  B(f, fw, h, 0.03, fm, -w / 2 - fw / 2, 0, 0); B(f, fw, h, 0.03, fm, w / 2 + fw / 2, 0, 0);
  if (o.ornate) for (const [x, y] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) SP(f, fw * 0.8, fm, x * (w / 2 + fw / 2), y * (h / 2 + fw / 2), 0.012, 1, 1, 0.5, 10);
  B(f, w, h, 0.006, o.backMat ?? mat(0x111111), 0, 0, -0.008);
  P(f, w, h, tex, 0, 0, -0.004, 0, 0, 0, { rough: o.rough ?? 0.7 });
  if (o.glass) B(f, w, h, 0.002, glass(0xffffff, 0.12), 0, 0, 0.004).castShadow = false;
  if (o.signed) P(f, w * 0.5, w * 0.18, signatureTex(o.signed), w * 0.12, -h * 0.3, 0.006, 0, 0, 0.2, { transparent: true });
  if (o.easel) {
    const wd = C.wood(0x8a5a2a);
    for (const s of [-1, 1]) CY(g, 0.012, 0.012, h + 0.5, wd, s * (w / 2 - 0.02), (h + 0.5) / 2, 0.03, -0.12, 0, s * -0.08, 8);
    CY(g, 0.012, 0.012, h + 0.4, wd, 0, (h + 0.4) / 2, -0.22, 0.35, 0, 0, 8);
    B(g, w + 0.05, 0.02, 0.05, wd, 0, 0.25, 0.04);
  } else {
    B(g, Math.min(w, 0.3), 0.015, 0.1, C.darkWood(), 0, 0.0075, 0.03);
    CY(g, 0.008, 0.008, h * 0.6, C.darkWood(), 0, h * 0.28, -0.06, 0.4, 0, 0, 6);
  }
  return g;
}
export function book(o = {}) {
  const g = new THREE.Group();
  const W = o.w ?? 0.17, H = o.h ?? 0.24, T = o.t ?? 0.04;
  const coverM = o.coverTex ? mat(0xffffff, { map: o.coverTex, roughness: 0.7 }) : C.leather(o.color ?? 0x5a1a14);
  if (o.open) {
    const pageTex = canvasTex('pages' + (o.illum ? 'i' : ''), 256, 180, (c, w, h) => {
      c.fillStyle = '#f0e4c4'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#2a1a0a';
      for (let side = 0; side < 2; side++) for (let i = 0; i < 14; i++) c.fillRect(side * w / 2 + 16, 20 + i * 11, w / 2 - 32 - (i % 5) * 6, 3);
      if (o.illum) { c.fillStyle = '#b8281f'; c.fillRect(20, 16, 34, 34); c.fillStyle = '#d8b04a'; c.font = 'bold 30px Georgia'; c.fillText('A', 27, 45); c.strokeStyle = '#2a5ab0'; c.lineWidth = 4; c.strokeRect(w / 2 + 12, 12, w / 2 - 24, h - 24); c.fillStyle = '#2a8a4a'; for (let k = 0; k < 8; k++) { c.beginPath(); c.arc(w * 0.75 + Math.cos(k) * 30, h / 2 + Math.sin(k) * 30, 6, 0, 7); c.fill(); } }
      c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(w / 2 - 3, 0, 6, h);
    });
    const bk = grp(g, 0, 0.02, 0, -0.05);
    for (const s of [-1, 1]) { B(bk, W, 0.004, H, coverM, s * W / 2, 0.002, 0, 0, 0, s * -0.08); B(bk, W - 0.01, T / 2, H - 0.01, C.paper(), s * (W / 2 - 0.004), T / 4 + 0.004, 0, 0, 0, s * -0.08); }
    P(bk, W * 2 - 0.02, H - 0.015, pageTex, 0, T / 2 + 0.01, 0, -Math.PI / 2);
    B(g, W * 2 + 0.04, 0.02, H * 0.9, C.darkWood(), 0, 0.01, 0);
  } else {
    const bk = grp(g, 0, 0, 0, 0, o.ry ?? 0.3);
    B(bk, W, T, H, coverM, 0, T / 2, 0);
    B(bk, W - 0.004, T - 0.008, H - 0.01, C.paper(), 0.004, T / 2, 0);
    if (!o.coverTex) {
      P(bk, W * 0.7, H * 0.25, lbl(o.title ?? 'Tomo I', { bg: hex(o.color ?? 0x5a1a14), fg: '#d8b04a', w: 256, h: 96, font: 'bold 38px Georgia', border: '#d8b04a' }), 0, T + 0.0005, -H * 0.15, -Math.PI / 2);
      for (const z of [-H * 0.4, H * 0.4]) B(bk, W + 0.002, T + 0.002, 0.008, C.gold(), 0, T / 2, z);
    }
  }
  return g;
}
export function scroll(tex, o = {}) {
  const g = new THREE.Group();
  const w = o.w ?? 0.4, h = o.h ?? 0.3;
  P(g, w, h, tex, 0, 0.004, 0.0, -Math.PI / 2, 0, 0, { double: true, rough: 0.9 });
  CY(g, 0.025, 0.025, w + 0.02, mat(0xe3d1a4, { roughness: 0.9 }), 0, 0.025, -h / 2 - 0.02, 0, 0, Math.PI / 2, 20);
  for (const s of [-1, 1]) CY(g, 0.008, 0.008, 0.03, C.darkWood(), s * (w / 2 + 0.02), 0.025, -h / 2 - 0.02, 0, 0, Math.PI / 2, 10);
  B(g, 0.02, 0.02, 0.02, mat(0x9a948a, { roughness: 1 }), w * 0.4, 0.01, h * 0.35);
  return g;
}
// moneda con relieve (bumpMap), canto estriado y cápsula de acrílico
function coinArt(c, w, o, height) {
  const cx = w / 2, R = w / 2;
  const tone = (hi) => height ? (hi ? '#ffffff' : '#606060') : null;
  const base = o.gold ? [226, 180, 74] : [200, 204, 208];
  const col = (k) => height ? `rgb(${k * 255 | 0},${k * 255 | 0},${k * 255 | 0})` : `rgb(${base[0] * (0.55 + k * 0.5) | 0},${base[1] * (0.55 + k * 0.5) | 0},${base[2] * (0.55 + k * 0.5) | 0})`;
  c.fillStyle = col(0.42); c.fillRect(0, 0, w, w);
  if (!height) { const g = c.createRadialGradient(cx * 0.8, cx * 0.7, 10, cx, cx, R); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.25)'); c.fillStyle = g; c.fillRect(0, 0, w, w); }
  c.fillStyle = col(0.95); c.beginPath(); c.arc(cx, cx, R, 0, 7); c.arc(cx, cx, R * 0.9, 0, 7, true); c.fill();
  for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2; c.beginPath(); c.arc(cx + Math.cos(a) * R * 0.86, cx + Math.sin(a) * R * 0.86, R * 0.012, 0, 7); c.fill(); }
  // leyenda curva
  const txt = (o.legend ?? 'REPÚBLICA').toUpperCase();
  c.font = `bold ${Math.round(R * 0.13)}px Georgia, serif`; c.textAlign = 'center'; c.textBaseline = 'middle';
  const span = Math.min(Math.PI * 1.1, txt.length * 0.15);
  [...txt].forEach((ch, i) => { const a = -Math.PI / 2 - span / 2 + span * (i + 0.5) / txt.length; c.save(); c.translate(cx + Math.cos(a) * R * 0.74, cx + Math.sin(a) * R * 0.74); c.rotate(a + Math.PI / 2); c.fillText(ch, 0, 0); c.restore(); });
  c.font = `bold ${Math.round(R * 0.15)}px Georgia, serif`; c.fillText(o.year ?? '1870', cx, cx + R * 0.66);
  // motivo central
  c.save(); c.translate(cx, cx - R * 0.02); c.scale(R / 128, R / 128);
  if (o.kind === 'rara') { // águila
    c.fillStyle = col(0.85);
    c.beginPath(); c.moveTo(0, -40); c.bezierCurveTo(14, -44, 18, -30, 10, -22); c.bezierCurveTo(40, -40, 66, -30, 70, -6); c.bezierCurveTo(50, -14, 36, -4, 24, 4); c.bezierCurveTo(30, 20, 22, 40, 0, 52); c.bezierCurveTo(-22, 40, -30, 20, -24, 4); c.bezierCurveTo(-36, -4, -50, -14, -70, -6); c.bezierCurveTo(-66, -30, -40, -40, -10, -22); c.bezierCurveTo(-18, -30, -12, -44, 0, -40); c.fill();
    c.strokeStyle = col(0.5); c.lineWidth = 2.5; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(14 + i * 9, -18 - i * 2); c.lineTo(20 + i * 8, -6 - i); c.stroke(); c.beginPath(); c.moveTo(-14 - i * 9, -18 - i * 2); c.lineTo(-20 - i * 8, -6 - i); c.stroke(); }
    c.fillStyle = col(0.7); c.beginPath(); c.ellipse(0, 62, 46, 6, 0, 0, 7); c.fill();
  } else if (o.kind === 'oro') { // victoria alada
    c.fillStyle = col(0.88);
    c.beginPath(); c.arc(0, -46, 11, 0, 7); c.fill();
    c.beginPath(); c.moveTo(-8, -34); c.lineTo(8, -34); c.lineTo(14, 30); c.lineTo(22, 58); c.lineTo(-22, 58); c.lineTo(-14, 30); c.closePath(); c.fill();
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * 6, -30); c.bezierCurveTo(s * 40, -70, s * 70, -60, s * 76, -40); c.bezierCurveTo(s * 50, -36, s * 30, -14, s * 10, -6); c.fill(); }
    c.strokeStyle = col(0.55); c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(-10 + i * 5, -20); c.lineTo(-14 + i * 7, 54); c.stroke(); }
  } else { // busto de perfil
    c.fillStyle = col(0.88);
    c.beginPath(); c.moveTo(-30, 60); c.bezierCurveTo(-36, 30, -40, 10, -30, -12); c.bezierCurveTo(-34, -40, -10, -62, 14, -56); c.bezierCurveTo(34, -50, 40, -30, 36, -14); c.lineTo(46, -2); c.lineTo(36, 4); c.bezierCurveTo(40, 10, 36, 14, 32, 16); c.bezierCurveTo(34, 24, 26, 30, 16, 28); c.bezierCurveTo(14, 40, 26, 52, 40, 60); c.closePath(); c.fill();
    c.strokeStyle = col(0.55); c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-4, -26, 14 + i * 5, Math.PI * 0.9, Math.PI * 1.7); c.stroke(); }
    c.fillStyle = col(0.6); c.beginPath(); c.arc(22, -18, 3, 0, 7); c.fill();
  }
  c.restore();
}
export function coin(o = {}) {
  const g = new THREE.Group();
  const key = (o.kind ?? 'peso') + (o.gold ? 'g' : 's');
  const colT = canvasTex('coinC' + key, 512, 512, (c, w) => coinArt(c, w, o, false));
  const bumT = canvasTex('coinH' + key, 512, 512, (c, w) => coinArt(c, w, o, true));
  bumT.colorSpace = THREE.NoColorSpace;
  const faceM = mat(0xffffff, { map: colT, bumpMap: bumT, bumpScale: 2.5, metalness: 0.85, roughness: 0.32, env: true, envI: 0.9 });
  const edgeT = canvasTex('reeded', 256, 8, (c, w, h) => { for (let x = 0; x < w; x += 2) { c.fillStyle = x % 4 ? '#888' : '#fff'; c.fillRect(x, 0, 2, h); } });
  const cm = o.gold ? metal(0xd9a93a, 0.28, { bumpMap: edgeT, bumpScale: 1 }) : metal(0xc8ccd0, 0.28, { bumpMap: edgeT, bumpScale: 1 });
  const r = 0.0195, t = 0.0028;
  const wd = C.darkWood();
  // peana con moldura
  add(g, slab(rrShape(0.11, 0.075, 0.01), 0.016, 0.004), wd, 0, 0.0, 0, -Math.PI / 2);
  RB(g, 0.08, 0.008, 0.05, 0.003, wd, 0, 0.02, -0.004);
  RB(g, 0.05, 0.016, 0.022, 0.004, wd, 0, 0.03, -0.008);
  P(g, 0.06, 0.012, labelTex(o.year ?? '1870', { bg: '#c9a54a', fg: '#2a1a08', w: 256, h: 52, font: 'bold 36px Georgia', sub: null }), 0, 0.008, 0.0391);
  // cápsula + moneda inclinadas
  const d = grp(g, 0, 0.066, -0.006, -0.22);
  const ed = add(d, new THREE.CylinderGeometry(r, r, t, 64, 1, true), cm, 0, 0, 0, Math.PI / 2);
  for (const s of [-1, 1]) add(d, new THREE.CircleGeometry(r, 64), faceM, 0, 0, s * t / 2, 0, s > 0 ? 0 : Math.PI, 0);
  const cap = latheGeo([[0, 0.0055], [0.024, 0.0055], [0.027, 0.004], [0.028, 0], [0.027, -0.004], [0.024, -0.0055], [0, -0.0055]], 64);
  add(d, cap, glass(0xf4f8ff, 0.16), 0, 0, 0, Math.PI / 2).castShadow = false;
  add(d, new THREE.TorusGeometry(0.0272, 0.0012, 8, 64), mat(0xeef4ff, { roughness: 0.1, transparent: true, opacity: 0.4 }), 0, 0, 0);
  if (o.stack) {
    const st = new Acc();
    for (let i = 0; i < 7; i++) st.put(new THREE.CylinderGeometry(r, r, t, 40), 0.034 + (i % 2) * 0.0008, 0.024 + t / 2 + i * t * 1.02, 0.018, 0, i * 0.7, 0);
    st.mesh(g, cm);
    add(g, new THREE.CircleGeometry(r, 40), faceM, 0.034 + 0.0008 * 0, 0.024 + 7 * t * 1.02 + 0.0001, 0.018, -Math.PI / 2);
  }
  return g;
}

export function gradedCard(seed, o = {}) {
  const g = new THREE.Group();
  const card = canvasTex('card' + seed + (o.sport ?? ''), 200, 280, (c, w, h) => {
    const R = rng(seed);
    c.fillStyle = o.bg ?? '#efe6cc'; c.fillRect(0, 0, w, h);
    c.fillStyle = `hsl(${R() * 360},35%,55%)`; c.fillRect(14, 14, w - 28, h - 70);
    c.fillStyle = '#d9a982'; c.beginPath(); c.ellipse(w / 2, 90, 30, 38, 0, 0, 7); c.fill();
    c.fillStyle = o.cap ?? '#2a3a6a'; c.beginPath(); c.ellipse(w / 2, 64, 34, 18, 0, Math.PI, 0); c.fill(); c.fillRect(w / 2 - 10, 60, 50, 8);
    c.fillStyle = o.shirt ?? '#f2f2f2'; c.beginPath(); c.ellipse(w / 2, 200, 62, 62, 0, Math.PI, 0); c.fill();
    c.fillStyle = '#1a1a1a'; c.font = 'bold 20px Georgia'; c.textAlign = 'center'; c.fillText(o.name ?? 'WAGNER', w / 2, h - 36);
    c.font = '14px Georgia'; c.fillText(o.team ?? 'PITTSBURG', w / 2, h - 16);
  });
  const st = grp(g, 0, 0.1, 0, -0.15);
  RB(st, 0.085, 0.14, 0.008, 0.003, glass(0xf4f8ff, 0.3), 0, 0, 0);
  P(st, 0.06, 0.084, card, 0, -0.01, 0.0045);
  P(st, 0.075, 0.022, lbl(o.grade ?? 'GEM MT 10', { bg: '#c8282a', fg: '#fff', w: 256, h: 70, font: 'bold 34px system-ui' }), 0, 0.055, 0.0045);
  B(g, 0.11, 0.015, 0.05, C.darkWood(), 0, 0.0075, 0.02);
  return g;
}
export function stamp(o = {}) {
  const tex = canvasTex('stamp' + (o.kind ?? 'pb'), 200, 240, (c, w, h) => {
    c.fillStyle = '#f7f2e4'; c.fillRect(0, 0, w, h);
    c.fillStyle = o.color ?? '#141414'; c.fillRect(20, 20, w - 40, h - 40);
    c.fillStyle = '#e8e2d0'; c.beginPath(); c.ellipse(w / 2, h / 2 - 10, 45, 58, 0, 0, 7); c.fill();
    c.fillStyle = o.color ?? '#141414'; c.beginPath(); c.ellipse(w / 2 + 6, h / 2 - 20, 26, 34, 0, 0, 7); c.fill();
    c.fillStyle = '#e8e2d0'; c.font = 'bold 18px Georgia'; c.textAlign = 'center'; c.fillText(o.legend ?? 'POSTAGE', w / 2, 40); c.fillText(o.value ?? 'ONE PENNY', w / 2, h - 28);
    c.fillStyle = '#f7f2e4'; for (let i = 0; i < w; i += 14) { c.beginPath(); c.arc(i, 4, 5, 0, 7); c.fill(); c.beginPath(); c.arc(i, h - 4, 5, 0, 7); c.fill(); } for (let i = 0; i < h; i += 14) { c.beginPath(); c.arc(4, i, 5, 0, 7); c.fill(); c.beginPath(); c.arc(w - 4, i, 5, 0, 7); c.fill(); }
  });
  return framed(tex, 0.08, 0.1, { frame: 0.025, glass: true, frameMat: C.gold() });
}
export function chessSet() {
  const g = new THREE.Group();
  const board = canvasTex('chess', 256, 256, (c, w) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#3a2412' : '#e8d8b8'; c.fillRect(i * 32, j * 32, 32, 32); } });
  RB(g, 0.4, 0.04, 0.4, 0.006, C.wood(0x5a2e14), 0, 0.02, 0);
  P(g, 0.36, 0.36, board, 0, 0.0405, 0, -Math.PI / 2, 0, 0, { rough: 0.3 });
  const ivory = mat(0xf2ead6, { roughness: 0.3, env: true, envI: 0.5 }), ebony = mat(0x1a1210, { roughness: 0.25, env: true, envI: 0.5 });
  const pawn = [[0, 0], [0.012, 0], [0.012, 0.004], [0.007, 0.01], [0.005, 0.022], [0.008, 0.026], [0, 0.034]];
  const king = [[0, 0], [0.015, 0], [0.015, 0.005], [0.009, 0.012], [0.006, 0.045], [0.011, 0.05], [0.008, 0.058], [0, 0.06]];
  const sq = 0.045;
  const place = (col, row, m, prof) => LA(g, prof, m, -0.1575 + col * sq, 0.041, -0.1575 + row * sq, 16);
  for (let i = 0; i < 8; i++) { place(i, 1, ivory, pawn); place(i, 6, ebony, pawn); }
  for (let i = 0; i < 8; i++) { place(i, 0, ivory, i === 4 || i === 3 ? king : pawn.map(([a, b]) => [a * 1.2, b * 1.5])); place(i, 7, ebony, i === 4 || i === 3 ? king : pawn.map(([a, b]) => [a * 1.2, b * 1.5])); }
  return g;
}
export function globe(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('globe', 512, 256, (c, w, h) => {
    const R = rng(33);
    c.fillStyle = '#d9c79c'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#b09560';
    for (let k = 0; k < 7; k++) { const cx = R() * w, cy = h * (0.2 + R() * 0.6), r = 30 + R() * 60; c.beginPath(); for (let a = 0; a < 6.3; a += 0.25) { const rr = r * (0.6 + R() * 0.6); c.lineTo(cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr); } c.closePath(); c.fill(); c.strokeStyle = '#5a3a1a'; c.stroke(); }
    c.strokeStyle = 'rgba(90,58,26,0.4)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(i * w / 12, 0); c.lineTo(i * w / 12, h); c.stroke(); } for (let j = 1; j < 6; j++) { c.beginPath(); c.moveTo(0, j * h / 6); c.lineTo(w, j * h / 6); c.stroke(); }
    c.fillStyle = 'rgba(80,50,20,0.15)'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(R() * w, R() * h, 4 + R() * 20, 0, 7); c.fill(); }
  });
  const R0 = o.r ?? 0.15;
  LA(g, [[0, 0], [0.1, 0], [0.1, 0.02], [0.03, 0.04], [0.02, 0.1], [0.015, 0.12]], C.wood(0x5a2e14), 0, 0, 0, 24);
  const gl = grp(g, 0, 0.14 + R0, 0, 0, 0, 0.41);
  SP(gl, R0, mat(0xffffff, { map: tex, roughness: 0.4, env: true, envI: 0.3 }), 0, 0, 0, 1, 1, 1, 40);
  TO(gl, R0 + 0.012, 0.005, C.brass(), 0, 0, 0, 0, 0, 0, Math.PI * 1.3, 40).rotation.z = -Math.PI * 0.65;
  CY(gl, 0.004, 0.004, R0 * 2 + 0.05, C.brass(), 0, 0, 0, 0, 0, 0, 8);
  return g;
}
export function compass() {
  const g = new THREE.Group();
  RB(g, 0.12, 0.04, 0.12, 0.006, C.wood(0x5a2e14), 0, 0.02, 0);
  CY(g, 0.05, 0.05, 0.02, C.brass(), 0, 0.045, 0, 0, 0, 0, 40);
  P(g, 0.09, 0.09, canvasTex('rose', 256, 256, (c) => {
    c.fillStyle = '#f2e8cc'; c.beginPath(); c.arc(128, 128, 128, 0, 7); c.fill();
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; c.fillStyle = i % 2 ? '#1f3a6a' : '#b8281f'; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.cos(a - 0.12) * 40, 128 + Math.sin(a - 0.12) * 40); c.lineTo(128 + Math.cos(a) * (i % 2 ? 80 : 110), 128 + Math.sin(a) * (i % 2 ? 80 : 110)); c.lineTo(128 + Math.cos(a + 0.12) * 40, 128 + Math.sin(a + 0.12) * 40); c.fill(); }
    c.fillStyle = '#222'; c.font = 'bold 22px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; ['N', 'E', 'S', 'O'].forEach((t, i) => { const a = i / 4 * 6.28 - 1.57; c.fillText(t, 128 + Math.cos(a) * 118 * 0.92, 128 + Math.sin(a) * 118 * 0.92); });
  }), 0, 0.0555, 0, -Math.PI / 2, 0, 0, { transparent: true, alphaTest: 0.2 });
  CY(g, 0.05, 0.05, 0.004, glass(0xffffff, 0.2), 0, 0.058, 0, 0, 0, 0, 40).castShadow = false;
  const lid = grp(g, 0, 0.04, -0.06, -2.1); RB(lid, 0.12, 0.012, 0.12, 0.004, C.wood(0x5a2e14), 0, 0.006, 0.06);
  return g;
}
export function ammonite() {
  const g = new THREE.Group();
  RB(g, 0.2, 0.05, 0.16, 0.02, mat(0x8a7a64, { roughness: 1 }), 0, 0.025, 0);
  const pts = [];
  for (let t = 0; t < 14; t += 0.15) { const r = 0.004 * Math.exp(t * 0.22); pts.push([Math.cos(t) * r, 0.1 + Math.sin(t) * r, 0]); }
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const tubeGeo = new THREE.TubeGeometry(curve, 200, 1, 12, false);
  const pos = tubeGeo.attributes.position; const tmp = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const seg = Math.floor(i / 13) / 200; const t = seg * 14; const r = 0.004 * Math.exp(t * 0.22) * 0.55;
    const pt = curve.getPointAt(Math.min(1, seg)); tmp.fromBufferAttribute(pos, i).sub(pt).multiplyScalar(r); pos.setXYZ(i, pt.x + tmp.x, pt.y + tmp.y, pt.z + tmp.z * 0.7);
  }
  tubeGeo.computeVertexNormals();
  const ribs = canvasTex('ribs', 256, 16, (c, w, h) => { for (let x = 0; x < w; x += 4) { c.fillStyle = x % 8 ? '#b8a07a' : '#6a5438'; c.fillRect(x, 0, 4, h); } }, true);
  ribs.repeat.set(6, 1);
  add(g, tubeGeo, mat(0xffffff, { map: ribs, roughness: 0.5, metalness: 0.2 }), 0, -0.02, 0);
  return g;
}
export function chest(o = {}) {
  const g = new THREE.Group();
  const wd = C.wood(0x5a3218), ir = C.iron();
  RB(g, 0.5, 0.26, 0.32, 0.01, wd, 0, 0.13, 0);
  for (const x of [-0.2, 0, 0.2]) B(g, 0.03, 0.27, 0.33, ir, x, 0.13, 0);
  const lid = grp(g, 0, 0.26, -0.16, o.open ? -1.2 : 0);
  const s = new THREE.Shape(); s.moveTo(-0.16, 0); s.lineTo(0.16, 0); s.absarc(0, 0, 0.16, 0, Math.PI, false);
  EXS(lid, s, 0.5, wd, 0, 0, 0.16, 0, Math.PI / 2, 0, 0.005).scale.set(1, 0.6, 1);
  B(g, 0.06, 0.08, 0.02, C.brass(), 0, 0.22, 0.165);
  for (const s2 of [-1, 1]) TO(g, 0.03, 0.006, ir, s2 * 0.255, 0.15, 0, 0, Math.PI / 2, 0, Math.PI, 16);
  if (o.open) for (let i = 0; i < 20; i++) CY(g, 0.012, 0.012, 0.003, C.gold(), (Math.random() - 0.5) * 0.4, 0.25 + Math.random() * 0.03, (Math.random() - 0.5) * 0.25, Math.random(), 0, Math.random(), 16);
  return g;
}
export function banknote() {
  const tex = canvasTex('oldbill', 320, 150, (c, w, h) => {
    c.fillStyle = '#d8d0a8'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#3a5a3a'; c.lineWidth = 4; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#3a5a3a'; c.font = 'bold 18px Georgia'; c.textAlign = 'center'; c.fillText('BANCO NACIONAL DE MÉXICO', w / 2, 34);
    c.font = 'bold 44px Georgia'; c.fillText('$50', 60, 110); c.fillText('$50', w - 60, 110);
    c.beginPath(); c.ellipse(w / 2, 90, 34, 40, 0, 0, 7); c.stroke();
    c.font = '12px Georgia'; c.fillText('CINCUENTA PESOS · 1913', w / 2, h - 18);
  });
  return framed(tex, 0.22, 0.1, { frame: 0.02, glass: true });
}
export function key(o = {}) {
  const g = new THREE.Group();
  const k = grp(g, 0, 0.015, 0, -Math.PI / 2);
  TO(k, 0.025, 0.006, C.brass(), -0.07, 0, 0, 0, 0, 0, Math.PI * 2, 24);
  for (let i = 0; i < 4; i++) TO(k, 0.009, 0.003, C.brass(), -0.07 + Math.cos(i * 1.57) * 0.012, Math.sin(i * 1.57) * 0.012, 0, 0, 0, 0, Math.PI * 2, 12);
  CY(k, 0.005, 0.005, 0.12, C.brass(), 0.0, 0, 0, 0, 0, Math.PI / 2, 10);
  B(k, 0.018, 0.022, 0.004, C.brass(), 0.05, -0.012, 0);
  B(k, 0.006, 0.01, 0.004, C.brass(), 0.04, -0.028, 0);
  RB(g, 0.2, 0.012, 0.08, 0.004, mat(0x3a0a18, { roughness: 1 }), 0, 0.006, 0);
  return g;
}
export function katana() {
  const g = new THREE.Group();
  const wd = mat(0x1a0a0a, { roughness: 0.25, env: true, envI: 0.5 });
  B(g, 0.9, 0.04, 0.16, wd, 0, 0.02, 0);
  for (const x of [-0.3, 0.3]) { B(g, 0.05, 0.22, 0.14, wd, x, 0.13, 0); }
  const k = grp(g, 0, 0.18, 0.02, 0, 0, 0.02);
  B(k, 0.6, 0.02, 0.012, mat(0x0a0a0a, { roughness: 0.2, env: true }), 0.12, 0, 0);
  const blade = [[0, -0.012], [0.62, -0.01], [0.66, 0.01], [0.62, 0.012], [0, 0.012]];
  const b2 = grp(g, 0, 0.26, 0.02, 0, 0, 0.02);
  EX(b2, blade, 0.004, C.chrome(), -0.18, 0, 0, 0, 0, 0, 0.001);
  CY(b2, 0.035, 0.035, 0.008, C.gold(), -0.18, 0, 0, 0, 0, Math.PI / 2, 24);
  const wrap = canvasTex('tsuka', 128, 32, (c, w, h) => { c.fillStyle = '#e8e0d0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a3a'; for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 8, h / 2); c.lineTo(x, h); c.lineTo(x + 16, h); c.lineTo(x + 8, h / 2); c.lineTo(x + 16, 0); c.fill(); } }, true);
  wrap.repeat.set(3, 1);
  CY(b2, 0.013, 0.013, 0.25, mat(0xffffff, { map: wrap, roughness: 0.8 }), -0.31, 0, 0, 0, 0, Math.PI / 2, 12);
  return g;
}
export function diamond(o = {}) {
  const g = new THREE.Group();
  const s = o.size ?? 1;
  CY(g, 0.06, 0.07, 0.04, mat(0x1a1a4a, { roughness: 1 }), 0, 0.02, 0, 0, 0, 0, 24);
  const dm = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0, transmission: 1, thickness: 0.02, ior: 2.4, iridescence: 0.4, clearcoat: 1, flatShading: true, envMapIntensity: 2 });
  const d = grp(g, 0, 0.075, 0, 0.3, 0, 0.3);
  add(d, new THREE.ConeGeometry(0.03 * s, 0.03 * s, 12), dm, 0, -0.005 * s, 0, Math.PI, 0, 0);
  add(d, new THREE.CylinderGeometry(0.018 * s, 0.03 * s, 0.012 * s, 12), dm, 0, 0.0155 * s, 0);
  acrylic(g, 0.14, 0.14, 0.14, 0);
  return g;
}
export function matryoshka() {
  const g = new THREE.Group();
  const tex = (i) => canvasTex('matr' + i, 256, 256, (c, w, h) => {
    c.fillStyle = ['#c8282a', '#2a5ab0', '#e8a820', '#2a8a4a', '#8a2a8a'][i]; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f2e8d8'; c.beginPath(); c.ellipse(w * 0.25, h * 0.3, 22, 26, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(w * 0.75, h * 0.3, 22, 26, 0, 0, 7); c.fill();
    c.fillStyle = '#d8b04a'; for (let k = 0; k < 10; k++) { c.beginPath(); c.arc(k * 28, h * 0.62, 10, 0, 7); c.fill(); }
    c.fillStyle = '#f2f2f2'; c.beginPath(); c.ellipse(w * 0.5, h * 0.8, 40, 20, 0, 0, 7); c.fill();
  });
  const prof = [[0, 0], [0.05, 0], [0.058, 0.03], [0.055, 0.07], [0.04, 0.1], [0.045, 0.13], [0.03, 0.155], [0, 0.165]];
  for (let i = 0; i < 5; i++) { const s = 1 - i * 0.18; LA(g, prof.map(([a, b]) => [a * s, b * s]), mat(0xffffff, { map: tex(i), roughness: 0.25, env: true, envI: 0.5 }), -0.18 + i * 0.1 + (i === 0 ? 0 : 0.02 * i), 0, 0, 32); }
  return g;
}
export function trident() {
  const g = new THREE.Group();
  const gd = C.gold();
  CY(g, 0.1, 0.12, 0.05, C.marble(), 0, 0.025, 0, 0, 0, 0, 24);
  CY(g, 0.012, 0.012, 1.3, gd, 0, 0.7, 0, 0, 0, 0, 12);
  B(g, 0.2, 0.02, 0.02, gd, 0, 1.35, 0);
  for (const x of [-0.09, 0, 0.09]) { CY(g, 0.009, 0.009, 0.22, gd, x, 1.46, 0, 0, 0, 0, 10); CO(g, 0.02, 0.06, gd, x, 1.6, 0, 0, 0, 0, 4); }
  SP(g, 0.03, emissive(0x3ad8ff, 1.5), 0, 1.35, 0.02);
  return g;
}
export function reactorCore() {
  const g = new THREE.Group();
  CY(g, 0.12, 0.13, 0.04, C.steel(), 0, 0.02, 0, 0, 0, 0, 24);
  CY(g, 0.12, 0.13, 0.04, C.steel(), 0, 0.4, 0, 0, 0, 0, 24);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; CY(g, 0.008, 0.008, 0.36, C.steel(), Math.cos(a) * 0.11, 0.21, Math.sin(a) * 0.11, 0, 0, 0, 8); }
  CY(g, 0.05, 0.05, 0.3, emissive(0x39ff14, 2.5), 0, 0.21, 0, 0, 0, 0, 24);
  CY(g, 0.08, 0.08, 0.32, glass(0xaaffaa, 0.25), 0, 0.21, 0, 0, 0, 0, 24);
  for (let i = 0; i < 3; i++) TO(g, 0.09, 0.006, emissive(0x39ff14, 1.2), 0, 0.12 + i * 0.09, 0, Math.PI / 2, 0, 0, Math.PI * 2, 32);
  P(g, 0.06, 0.06, lbl('☢', { bg: '#f2d01a', fg: '#111', w: 128, h: 128, font: 'bold 100px system-ui' }), 0, 0.02, 0.131);
  return g;
}
export function bioSample() {
  const g = new THREE.Group();
  RB(g, 0.3, 0.06, 0.2, 0.01, metal(0xe8e8e8, 0.3), 0, 0.03, 0);
  for (let i = 0; i < 3; i++) { const x = -0.08 + i * 0.08; CY(g, 0.025, 0.025, 0.16, glass(0xe8fff0, 0.3), x, 0.14, 0, 0, 0, 0, 20); CY(g, 0.02, 0.02, 0.1 - i * 0.02, emissive([0x7cff4a, 0xff4ad8, 0x4ad8ff][i], 1.5), x, 0.11 - i * 0.01, 0, 0, 0, 0, 16); CY(g, 0.027, 0.027, 0.02, C.steel(), x, 0.225, 0, 0, 0, 0, 20); }
  P(g, 0.2, 0.03, lbl('CLASIFICADO · BIO-7', { bg: '#c8282a', fg: '#fff', w: 512, h: 80, font: 'bold 40px system-ui' }), 0, 0.03, 0.101);
  return g;
}
export function ring(o = {}) {
  const g = new THREE.Group();
  const bx = grp(g);
  RB(bx, 0.07, 0.04, 0.07, 0.01, mat(o.box ?? 0x6a0a1a, { roughness: 1 }), 0, 0.02, 0);
  const lid = grp(bx, 0, 0.04, -0.035, -1.8); RB(lid, 0.07, 0.02, 0.07, 0.01, mat(o.box ?? 0x6a0a1a, { roughness: 1 }), 0, 0.01, 0.035);
  const r = grp(g, 0, 0.055, 0, 0.2);
  TO(r, 0.013 * (o.big ? 1.4 : 1), 0.003 * (o.big ? 1.8 : 1), C.gold(), 0, 0, 0, 0, 0, 0, Math.PI * 2, 32);
  const gem = new THREE.MeshPhysicalMaterial({ color: o.gem ?? 0xffffff, transmission: 0.95, roughness: 0, ior: 2.2, thickness: 0.01, flatShading: true });
  add(r, new THREE.OctahedronGeometry(0.007 * (o.big ? 1.6 : 1)), gem, 0, 0.016 * (o.big ? 1.4 : 1), 0);
  if (o.big) for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; SP(r, 0.0022, emissive(0xffffff, 0.5), Math.cos(a) * 0.012, 0.022 + Math.sin(a) * 0.004, 0.008); }
  return g;
}
export function necklace(o = {}) {
  const g = new THREE.Group();
  LA(g, [[0, 0], [0.06, 0], [0.065, 0.01], [0.02, 0.03], [0.02, 0.12], [0.06, 0.2], [0.07, 0.24], [0.05, 0.29], [0.02, 0.32], [0, 0.33]], mat(0x1a1a1a, { roughness: 0.9 }), 0, 0, 0, 32).scale.z = 0.6;
  for (let i = 0; i <= 26; i++) { const a = -Math.PI * 0.8 + (i / 26) * Math.PI * 1.6; SP(g, 0.007, o.pearl ? C.porcelain() : C.gold(), Math.sin(a) * 0.06, 0.28 - (1 - Math.cos(a)) * 0.05, 0.035 + Math.cos(a) * 0.01, 1, 1, 1, 10); }
  const gem = new THREE.MeshPhysicalMaterial({ color: o.gem ?? 0x1a8a3a, transmission: 0.6, roughness: 0.05, ior: 1.6, thickness: 0.02, flatShading: true });
  add(g, new THREE.OctahedronGeometry(0.018), gem, 0, 0.19, 0.05, 0, 0, 0).scale.set(1, 1.3, 0.6);
  TO(g, 0.02, 0.003, C.gold(), 0, 0.19, 0.045);
  return g;
}
export function brooch() {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.05, 0, -0.4);
  for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; SP(d, 0.012, C.gold(), Math.cos(a) * 0.025, Math.sin(a) * 0.025, 0, 1, 1, 0.4, 10); SP(d, 0.005, new THREE.MeshPhysicalMaterial({ color: [0xc8282a, 0x2a5ad8][i % 2], transmission: 0.8, roughness: 0, ior: 1.8 }), Math.cos(a) * 0.025, Math.sin(a) * 0.025, 0.005); }
  SP(d, 0.014, new THREE.MeshPhysicalMaterial({ color: 0x2a8a4a, transmission: 0.8, roughness: 0, ior: 1.8 }), 0, 0, 0.004);
  RB(g, 0.1, 0.02, 0.08, 0.008, mat(0x1a1a4a, { roughness: 1 }), 0, 0.01, 0.01);
  return g;
}
export function luxuryWatch() {
  const g = new THREE.Group();
  RB(g, 0.14, 0.05, 0.12, 0.01, mat(0x0e2a1a, { roughness: 0.3, env: true, envI: 0.4 }), 0, 0.025, 0);
  CY(g, 0.035, 0.035, 0.03, mat(0xf2efe6, { roughness: 1 }), 0, 0.06, 0, 0, 0, Math.PI / 2, 24);
  const w = grp(g, 0, 0.1, 0, -0.5);
  CY(w, 0.022, 0.022, 0.012, C.gold(), 0, 0, 0, Math.PI / 2, 0, 0, 40);
  TO(w, 0.022, 0.003, C.gold(), 0, 0, 0.006, 0, 0, 0, Math.PI * 2, 48);
  P(w, 0.036, 0.036, canvasTex('luxdial', 256, 256, (c) => { const gr = c.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#1a4a3a'); gr.addColorStop(1, '#0a1a14'); c.fillStyle = gr; c.beginPath(); c.arc(128, 128, 128, 0, 7); c.fill(); c.fillStyle = '#e8d08a'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; c.save(); c.translate(128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); c.rotate(a); c.fillRect(-10, -3, 20, 6); c.restore(); } c.fillStyle = '#e8d08a'; c.font = 'bold 20px Georgia'; c.textAlign = 'center'; c.fillText('ROYALE', 128, 90); c.fillRect(126, 60, 4, 70); c.save(); c.translate(128, 128); c.rotate(1.1); c.fillRect(-3, -90, 6, 90); c.restore(); }), 0, 0, 0.0065, 0, 0, 0, { transparent: true, alphaTest: 0.2 });
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) RB(w, 0.022, 0.008, 0.006, 0.002, C.gold(), 0, s * (0.026 + i * 0.009), -0.002);
  return g;
}
export function chalice() {
  const g = new THREE.Group();
  LA(g, [[0, 0], [0.06, 0], [0.06, 0.01], [0.02, 0.03], [0.012, 0.1], [0.025, 0.11], [0.012, 0.12], [0.02, 0.14], [0.06, 0.18], [0.065, 0.24], [0.06, 0.24]], metal(0xd9a93a, 0.2, { side: THREE.DoubleSide }), 0, 0, 0, 40);
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; SP(g, 0.007, new THREE.MeshPhysicalMaterial({ color: [0xc8282a, 0x2a5ad8, 0x2a8a4a][i % 3], transmission: 0.7, roughness: 0 }), Math.cos(a) * 0.062, 0.2, Math.sin(a) * 0.062); }
  return g;
}
export function faberge() {
  const g = new THREE.Group();
  LA(g, [[0, 0], [0.05, 0], [0.05, 0.01], [0.015, 0.03], [0.01, 0.05]], C.gold(), 0, 0, 0, 32);
  const tex = canvasTex('egg', 512, 256, (c, w, h) => { c.fillStyle = '#b8203a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8c870'; c.lineWidth = 3; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * w / 16, 0); c.lineTo(i * w / 16 + w / 16, h); c.stroke(); c.beginPath(); c.moveTo(i * w / 16 + w / 16, 0); c.lineTo(i * w / 16, h); c.stroke(); } c.fillStyle = '#f2f2f2'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc(Math.random() * w, Math.random() * h, 3, 0, 7); c.fill(); } });
  const egg = SP(g, 0.07, mat(0xffffff, { map: tex, roughness: 0.15, metalness: 0.3, env: true, envI: 0.8 }), 0, 0.14, 0, 1, 1.35, 1, 40);
  TO(g, 0.071, 0.004, C.gold(), 0, 0.14, 0, Math.PI / 2, 0, 0, Math.PI * 2, 40);
  add(g, new THREE.OctahedronGeometry(0.012), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 1, roughness: 0, ior: 2.4 }), 0, 0.24, 0);
  return g;
}
export function swordInStone() {
  const g = new THREE.Group();
  add(g, new THREE.DodecahedronGeometry(0.2, 1), mat(0x7a7670, { roughness: 1, flatShading: true }), 0, 0.12, 0).scale.set(1.2, 0.7, 1);
  EX(g, [[-0.015, 0], [0.015, 0], [0.012, 0.5], [0, 0.55], [-0.012, 0.5]], 0.006, C.chrome(), 0, 0.2, 0, 0, 0, 0, 0.001);
  B(g, 0.14, 0.02, 0.025, C.gold(), 0, 0.72, 0);
  CY(g, 0.012, 0.012, 0.12, C.leather(0x3a1a0a), 0, 0.79, 0, 0, 0, 0, 10);
  SP(g, 0.02, C.gold(), 0, 0.86, 0);
  SP(g, 0.03, emissive(0x7ab8ff, 1.2), 0, 0.2, 0, 3, 0.4, 3);
  return g;
}
export function comicSlab(title = 'ACTION 1938', o = {}) {
  const tex = canvasTex('comic' + title, 200, 280, (c, w, h) => {
    c.fillStyle = '#f2d01a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c8282a'; c.fillRect(0, 0, w, 60);
    c.fillStyle = '#fff'; c.font = 'italic bold 30px Impact, system-ui'; c.textAlign = 'center'; c.fillText(o.logo ?? 'ACTION', w / 2, 42);
    c.fillStyle = '#2a5ab0'; c.fillRect(20, 70, w - 40, h - 110);
    c.fillStyle = '#1a3a8a'; c.beginPath(); c.moveTo(w / 2, 90); c.lineTo(w / 2 + 30, 170); c.lineTo(w / 2 - 30, 170); c.fill();
    c.fillStyle = '#c8282a'; c.fillRect(w / 2 - 36, 140, 72, 20); c.fillStyle = '#e8b890'; c.beginPath(); c.arc(w / 2, 100, 14, 0, 7); c.fill();
    c.fillStyle = '#1a1a1a'; c.font = 'bold 14px system-ui'; c.fillText(o.sub ?? 'No. 1 · JUNIO 1938', w / 2, h - 16);
  });
  const g = new THREE.Group();
  const st = grp(g, 0, 0.14, 0, -0.15);
  RB(st, 0.2, 0.28, 0.012, 0.004, glass(0xf4f8ff, 0.28), 0, 0, 0);
  P(st, 0.17, 0.23, tex, 0, -0.015, 0.0065);
  P(st, 0.18, 0.03, lbl('CGC 9.0', { bg: '#1a3a8a', fg: '#fff', w: 256, h: 60, font: 'bold 34px system-ui' }), 0, 0.12, 0.0065);
  B(g, 0.22, 0.02, 0.07, C.darkWood(), 0, 0.01, 0.03);
  return g;
}
export function docSigned(seed, title) {
  const tex = canvasTex('doc' + seed, 220, 300, (c, w, h) => {
    const R = rng(seed);
    c.fillStyle = '#efe2bf'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(120,85,40,0.15)'; for (let i = 0; i < 25; i++) { c.beginPath(); c.arc(R() * w, R() * h, 5 + R() * 25, 0, 7); c.fill(); }
    c.fillStyle = '#2a1a0a'; c.font = 'bold italic 20px Georgia'; c.textAlign = 'center'; c.fillText(title, w / 2, 40);
    for (let i = 0; i < 14; i++) c.fillRect(22, 64 + i * 12, w - 44 - (i % 4) * 8, 2);
    c.fillStyle = '#b8281f'; c.beginPath(); c.arc(w * 0.75, h - 50, 20, 0, 7); c.fill();
  });
  return framed(tex, 0.22, 0.3, { glass: true, signed: seed + 1 });
}

// ---------- estatuas y figuras ----------
// figura humana anatómica (extremidades continuas, torso con cintura y pecho)
export function humanoid(g, m, o = {}) {
  const k = 0.48 * (o.s ?? 1);
  const h = grp(g, 0, o.y ?? 0, 0);
  h.scale.setScalar(k);
  const skin = o.skin ?? m, shirt = o.shirt ?? m, pants = o.pants ?? m, boots = o.boots ?? pants;
  const pose = o.pose ?? (o.armsUp ? 'victory' : 'stand');
  const sit = pose === 'think';
  for (const sx of [-1, 1]) {
    const legs = sit ? [[sx * 0.09, 0.5, 0], [sx * 0.1, 0.5, 0.24], [sx * 0.1, 0.27, 0.27], [sx * 0.1, 0.06, 0.25]] : [[sx * 0.085, 0.52, 0], [sx * 0.09, 0.4, 0.005], [sx * 0.092, 0.27, 0.015], [sx * 0.092, 0.06, 0]];
    SW(h, legs, [0.07, 0.058, 0.042, 0.032], pants, 12, 20);
    RB(h, 0.085, 0.055, 0.17, 0.025, boots, sx * 0.093, 0.028, (sit ? 0.25 : 0) + 0.045);
  }
  const lean = sit ? 0.12 : 0;
  SW(h, [[0, 0.47, 0], [0, 0.58, lean * 0.3], [0, 0.7, lean * 0.7], [0, 0.8, lean]], [0.115, 0.095, 0.125, 0.09], shirt, 16, 16, 0.62);
  for (const sx of [-1, 1]) SP(h, 0.05, shirt, sx * 0.14, 0.785, lean, 1, 0.8, 0.9, 12);
  SW(h, [[0, 0.8, lean], [0, 0.87, lean + 0.01]], [0.042, 0.038], skin, 10, 4);
  const head = grp(h, 0, 0.945, lean + 0.015);
  SP(head, 0.085, skin, 0, 0, 0, 0.88, 1.08, 0.95, 20);
  SP(head, 0.03, skin, 0, -0.05, 0.035, 1.3, 0.8, 1, 10);
  SP(head, 0.013, skin, 0, -0.005, 0.083, 0.8, 1, 1.2, 8);
  for (const sx of [-1, 1]) { SP(head, 0.011, mat(0x1a1410, { roughness: 0.3 }), sx * 0.03, 0.012, 0.074, 1, 0.8, 0.5, 8); SP(head, 0.016, skin, sx * 0.08, 0, 0, 0.5, 1, 0.7, 8); }
  if (o.hair) SP(head, 0.088, o.hair, 0, 0.02, -0.01, 0.92, 0.92, 0.98, 18);
  if (o.helmet) SP(head, 0.096, o.helmet, 0, 0.012, 0, 0.95, 1.1, 1.05, 22);
  if (o.visor) RB(head, 0.12, 0.035, 0.03, 0.012, o.visor, 0, 0.01, 0.085);
  for (const sx of [-1, 1]) {
    let arm;
    if (pose === 'victory') arm = [[sx * 0.15, 0.79, 0], [sx * 0.23, 0.92, 0.02], [sx * 0.26, 1.08, 0.03]];
    else if (sit && sx > 0) arm = [[sx * 0.15, 0.79, lean], [sx * 0.13, 0.6, 0.2], [sx * 0.05, 0.84, 0.13]];
    else arm = [[sx * 0.15, 0.79, lean], [sx * 0.185, 0.64, lean + 0.02], [sx * 0.19, 0.5, lean + 0.05]];
    SW(h, arm, [0.042, 0.034, 0.027], shirt, 10, 14);
    const w = arm[2];
    RB(h, 0.045, 0.07, 0.03, 0.014, skin, w[0], w[1] + (pose === 'victory' ? 0.04 : -0.04), w[2]);
  }
  if (o.cape) EX(h, [[-0.13, 0], [0.13, 0], [0.2, -0.55], [-0.2, -0.55]], 0.01, o.cape, 0, 0.8, -0.07, 0.08, 0, 0, 0.004);
  return h;
}
export function statue(kind = 'bronze', o = {}) {
  const g = new THREE.Group();
  const m = kind === 'marble' ? C.marble() : kind === 'gold' ? C.gold() : kind === 'stone' ? mat(0x8a847a, { roughness: 1 }) : metal(0x7a4a22, 0.45);
  const s = o.s ?? 1;
  RB(g, 0.18 * s, 0.08 * s, 0.18 * s, 0.006, o.base ?? C.marble(), 0, 0.04 * s, 0);
  if (o.pose === 'thinker') {
    add(g, new THREE.DodecahedronGeometry(0.12 * s, 1), mat(0x6a645a, { roughness: 1, flatShading: true }), 0, 0.08 * s + 0.1 * s, 0.02 * s).scale.set(1.2, 0.8, 1);
    humanoid(g, m, { s: s * 0.95, y: 0.08 * s - 0.04 * s, pose: 'think' });
  } else if (o.pose === 'bust') {
    RB(g, 0.14 * s, 0.1 * s, 0.08 * s, 0.03, m, 0, 0.13 * s, 0);
    CY(g, 0.025 * s, 0.03 * s, 0.05 * s, m, 0, 0.2 * s, 0, 0, 0, 0, 12);
    SP(g, 0.055 * s, m, 0, 0.27 * s, 0, 0.9, 1.1, 1);
    SP(g, 0.058 * s, m, 0, 0.29 * s, -0.008 * s, 1, 0.8, 1);
  } else if (o.pose === 'idol') {
    const h = grp(g, 0, 0.08 * s, 0);
    LA(h, [[0, 0], [0.06, 0], [0.07, 0.06], [0.05, 0.12], [0.04, 0.14]].map(([a, b]) => [a * s, b * s]), m, 0, 0, 0, 24);
    SP(h, 0.055 * s, m, 0, 0.19 * s, 0, 1, 1.1, 0.9);
    for (const sx of [-1, 1]) SP(h, 0.01 * s, emissive(0x3aff8a, 1), sx * 0.02 * s, 0.2 * s, 0.045 * s);
    B(h, 0.03 * s, 0.006 * s, 0.01 * s, C.black(), 0, 0.17 * s, 0.05 * s);
  } else humanoid(g, m, { s: s * 1.1, y: 0.08 * s, pose: o.pose === 'victory' ? 'victory' : 'stand' });
  return g;
}
export function actionFigure(o = {}) {
  const g = new THREE.Group();
  const card = grp(g, 0, 0.15, -0.01, -0.12);
  RB(card, 0.2, 0.3, 0.006, 0.01, mat(0xffffff, { map: artTex(o.seed ?? 3, 'stars', 200, 300, o.title ?? 'HÉROES'), roughness: 0.4 }), 0, 0, 0);
  RB(card, 0.14, 0.22, 0.05, 0.02, glass(0xf6fbff, 0.25), 0, -0.02, 0.028);
  const f = grp(card, 0, -0.12, 0.028);
  humanoid(f, plastic(o.suit ?? 0x2a5ab0), { s: 0.42, shirt: plastic(o.suit ?? 0x2a5ab0), pants: plastic(o.pants ?? 0x1a1a1a), skin: plastic(o.skin ?? 0xe8b890), helmet: o.helmet ? plastic(o.helmet) : null, visor: o.visor ? plastic(0x111111) : null, cape: o.cape ? plastic(o.cape) : null, boots: plastic(0x1a1a1a) });
  if (o.signed) P(card, 0.12, 0.04, signatureTex(o.seed ?? 3), 0.02, -0.1, 0.055, 0, 0, 0.2, { transparent: true });
  B(g, 0.22, 0.012, 0.07, C.darkWood(), 0, 0.006, 0.02);
  return g;
}
export function looseFigure(o = {}) {
  const g = new THREE.Group();
  CY(g, 0.05, 0.055, 0.012, plastic(0x1a1a1a), 0, 0.006, 0, 0, 0, 0, 24);
  humanoid(g, plastic(o.suit ?? 0x3a7a3a), { s: o.s ?? 0.55, y: 0.012, shirt: plastic(o.suit ?? 0x3a7a3a), pants: plastic(o.pants ?? 0x5a5040), skin: plastic(o.skin ?? 0xe8b890), helmet: o.helmet ? plastic(o.helmet) : null, visor: o.visor ? mat(0x111111) : null, cape: o.cape ? plastic(o.cape) : null, boots: plastic(0x2a2a2a), hair: o.hair ? plastic(o.hair) : null });
  if (o.jetpack) { RB(g, 0.05, 0.07, 0.03, 0.008, plastic(0x6a6e72), 0, 0.17, -0.035); CO(g, 0.012, 0.03, plastic(0xd8282a), 0, 0.2, -0.035, 0, 0, 0, 10); }
  return g;
}
export function minifig() {
  const g = new THREE.Group();
  const y = plastic(0xf2cd37, 0.2), r = plastic(0xc8282a, 0.2), b = plastic(0x1a3a8a, 0.2);
  for (const s of [-1, 1]) RB(g, 0.016, 0.03, 0.02, 0.002, b, s * 0.009, 0.015, 0);
  B(g, 0.036, 0.006, 0.02, b, 0, 0.033, 0);
  EX(g, [[-0.019, 0], [0.019, 0], [0.016, 0.03], [-0.016, 0.03]], 0.018, r, 0, 0.036, 0, 0, 0, 0, 0.001);
  for (const s of [-1, 1]) { CY(g, 0.006, 0.006, 0.025, r, s * 0.023, 0.052, 0.003, 0.3, 0, s * 0.2, 8); SP(g, 0.005, y, s * 0.026, 0.038, 0.008); }
  CY(g, 0.012, 0.012, 0.022, y, 0, 0.078, 0, 0, 0, 0, 16);
  CY(g, 0.006, 0.006, 0.006, y, 0, 0.092, 0, 0, 0, 0, 12);
  P(g, 0.016, 0.01, lbl('• ‿ •', { bg: '#f2cd37', fg: '#111', w: 128, h: 80, font: 'bold 50px system-ui' }), 0, 0.078, 0.0121);
  B(g, 0.08, 0.006, 0.06, plastic(0x2a8a3a, 0.3), 0, -0.003, 0).position.y = 0.003;
  g.children.slice(0, -1).forEach(c => (c.position.y += 0.006));
  return g;
}
export function doll() {
  const g = new THREE.Group();
  const skin = mat(0xf2d6c4, { roughness: 0.3, env: true, envI: 0.4 });
  LA(g, [[0, 0], [0.09, 0], [0.085, 0.02], [0.05, 0.12], [0.03, 0.16], [0, 0.17]], mat(0x8ab8d8, { roughness: 0.9 }), 0, 0, 0, 32);
  LA(g, [[0, 0], [0.095, 0], [0.09, 0.01], [0, 0.012]], mat(0xffffff, { roughness: 1 }), 0, 0.005, 0, 32);
  for (const s of [-1, 1]) CY(g, 0.009, 0.008, 0.08, skin, s * 0.045, 0.13, 0.01, 0, 0, s * 0.35, 10);
  SP(g, 0.045, skin, 0, 0.21, 0);
  SP(g, 0.048, mat(0xc8a050, { roughness: 0.8 }), 0, 0.225, -0.006, 1, 0.85, 1);
  for (const s of [-1, 1]) { CY(g, 0.012, 0.009, 0.08, mat(0xc8a050), s * 0.04, 0.18, -0.01, 0, 0, s * 0.1, 8); SP(g, 0.007, mat(0x2a5ab0), s * 0.016, 0.215, 0.041); }
  SP(g, 0.006, mat(0xd86a7a), 0, 0.195, 0.043, 1.4, 0.8, 0.6);
  TO(g, 0.02, 0.004, mat(0xd84a6a), 0, 0.26, 0.0, 0, 0, 0);
  return g;
}
export function teddy() {
  const g = new THREE.Group();
  const fur = mat(0xa0703a, { roughness: 1, map: C.cloth(0xa0703a).map });
  const light = mat(0xd8b88a, { roughness: 1 });
  SP(g, 0.08, fur, 0, 0.1, 0, 1, 1.1, 0.9);
  SP(g, 0.05, light, 0, 0.1, 0.045, 1, 1.1, 0.6);
  SP(g, 0.06, fur, 0, 0.22, 0.01);
  SP(g, 0.028, light, 0, 0.205, 0.058, 1, 0.8, 0.8);
  SP(g, 0.009, mat(0x1a1a1a, { roughness: 0.2 }), 0, 0.215, 0.083);
  for (const s of [-1, 1]) { SP(g, 0.022, fur, s * 0.05, 0.27, 0.0); SP(g, 0.012, light, s * 0.05, 0.27, 0.012); SP(g, 0.007, mat(0x111111, { roughness: 0.1 }), s * 0.022, 0.235, 0.055); SP(g, 0.032, fur, s * 0.085, 0.13, 0.02, 0.8, 1.3, 0.8); SP(g, 0.04, fur, s * 0.05, 0.03, 0.05, 0.9, 0.8, 1.2); }
  TO(g, 0.035, 0.008, mat(0xc8282a), 0, 0.165, 0.01, Math.PI / 2 - 0.2, 0, 0);
  return g;
}
export function trainSet() {
  const g = new THREE.Group();
  const track = new THREE.Shape(); track.absellipse(0, 0, 0.3, 0.16, 0, Math.PI * 2);
  const hole = new THREE.Path(); hole.absellipse(0, 0, 0.26, 0.12, 0, Math.PI * 2); track.holes.push(hole);
  EXS(g, track, 0.01, mat(0x5a4a3a, { roughness: 1 }), 0, 0.005, 0, -Math.PI / 2, 0, 0, 0);
  for (let i = 0; i < 40; i++) { const a = i / 40 * 6.28; B(g, 0.06, 0.006, 0.012, C.darkWood(), Math.cos(a) * 0.28, 0.012, Math.sin(a) * 0.14, 0, -Math.atan2(Math.cos(a) * 0.14, -Math.sin(a) * 0.28), 0); }
  TO(g, 0.28, 0.003, C.steel(), 0, 0.017, 0, Math.PI / 2, 0, 0, Math.PI * 2, 64).scale.set(1.07, 0.54 / 0.28 * 0.28, 1);
  const loco = grp(g, 0, 0.018, 0.14);
  const bk = glossy(0x141414);
  CY(loco, 0.025, 0.025, 0.1, bk, 0.02, 0.04, 0, 0, 0, Math.PI / 2, 16);
  B(loco, 0.05, 0.06, 0.05, bk, -0.045, 0.045, 0); B(loco, 0.06, 0.006, 0.06, glossy(0xc8282a), -0.045, 0.078, 0);
  CY(loco, 0.008, 0.012, 0.03, bk, 0.05, 0.075, 0, 0, 0, 0, 10);
  for (const x of [-0.05, -0.01, 0.03]) for (const z of [-0.026, 0.026]) CY(loco, 0.013, 0.013, 0.006, glossy(0xc8282a), x, 0.013, z, Math.PI / 2, 0, 0, 14);
  for (let k = 0; k < 2; k++) { const w = grp(g, -0.14 - k * 0.12, 0.018, 0.13 - k * 0.01, 0, 0.15 + k * 0.15); RB(w, 0.1, 0.05, 0.05, 0.005, glossy([0x2a5ab0, 0x2a8a3a][k]), 0, 0.04, 0); for (const x of [-0.03, 0.03]) for (const z of [-0.026, 0.026]) CY(w, 0.01, 0.01, 0.006, C.black(), x, 0.012, z, Math.PI / 2, 0, 0, 12); }
  return g;
}
export function tinRobot() {
  const g = new THREE.Group();
  const tin = metal(0x9aa6b0, 0.35), red = glossy(0xc8282a);
  for (const s of [-1, 1]) { RB(g, 0.04, 0.08, 0.05, 0.006, tin, s * 0.03, 0.04, 0); RB(g, 0.045, 0.02, 0.07, 0.005, red, s * 0.03, 0.01, 0.01); }
  RB(g, 0.12, 0.13, 0.08, 0.01, tin, 0, 0.145, 0);
  B(g, 0.08, 0.06, 0.002, glass(0x2a2a2a, 0.7), 0, 0.15, 0.041);
  for (let i = 0; i < 4; i++) CY(g, 0.006, 0.006, 0.004, emissive([0xff3322, 0xffcc22, 0x33ff66, 0x33aaff][i], 1.2), -0.024 + i * 0.016, 0.15, 0.042, Math.PI / 2, 0, 0, 10);
  for (const s of [-1, 1]) { CY(g, 0.012, 0.012, 0.09, tin, s * 0.075, 0.16, 0, 0, 0, s * 0.25, 10); TO(g, 0.012, 0.004, red, s * 0.09, 0.105, 0, 0, 0, 0, Math.PI * 1.5, 12); }
  RB(g, 0.08, 0.07, 0.07, 0.01, tin, 0, 0.25, 0);
  for (const s of [-1, 1]) { CY(g, 0.01, 0.01, 0.006, emissive(0xffe060, 1.2), s * 0.018, 0.26, 0.036, Math.PI / 2, 0, 0, 12); CY(g, 0.005, 0.01, 0.02, red, s * 0.045, 0.26, 0, 0, 0, Math.PI / 2, 10); }
  CY(g, 0.002, 0.002, 0.04, C.chrome(), 0, 0.3, 0, 0, 0, 0, 6); SP(g, 0.008, red, 0, 0.32, 0);
  B(g, 0.05, 0.004, 0.02, C.black(), 0, 0.235, 0.036);
  return g;
}
export function trex() {
  const g = new THREE.Group();
  const scales = canvasTex('dinoskin', 128, 128, (c, w) => { c.fillStyle = '#3f8a3a'; c.fillRect(0, 0, w, w); for (let y = 0; y < w; y += 8) for (let x = (y / 8) % 2 * 4; x < w; x += 8) { c.fillStyle = `rgba(${20 + Math.random() * 30},${60 + Math.random() * 40},20,0.5)`; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill(); } }, true);
  const m = mat(0xffffff, { map: scales, roughness: 0.55, env: true, envI: 0.3 });
  const belly = mat(0xc8c890, { roughness: 0.6 });
  SW(g, [[-0.3, 0.12, 0], [-0.18, 0.15, 0], [-0.05, 0.17, 0], [0.06, 0.2, 0], [0.12, 0.25, 0], [0.15, 0.29, 0]], [0.004, 0.028, 0.058, 0.06, 0.04, 0.036], m, 16, 40, 0.85);
  SP(g, 0.045, belly, 0.04, 0.165, 0, 1.4, 0.8, 0.7, 14);
  const head = grp(g, 0.19, 0.3, 0, 0, 0, -0.15);
  RB(head, 0.12, 0.06, 0.07, 0.025, m, 0.02, 0.01, 0);
  RB(head, 0.1, 0.022, 0.058, 0.01, m, 0.025, -0.03, 0, 0, 0, 0.12);
  for (let i = 0; i < 7; i++) for (const sz of [-1, 1]) CO(head, 0.0045, 0.014, mat(0xf2f2e8), -0.01 + i * 0.013, -0.012, sz * 0.026, Math.PI, 0, 0, 5);
  for (const sz of [-1, 1]) { SP(head, 0.009, mat(0xffd84a, { emissive: 0x442200 }), 0.0, 0.025, sz * 0.03); SP(head, 0.004, mat(0x111111), 0.004, 0.025, sz * 0.036); }
  for (const sz of [-1, 1]) {
    SW(g, [[0.0, 0.17, sz * 0.045], [0.035, 0.1, sz * 0.055], [-0.01, 0.05, sz * 0.055], [0.01, 0.012, sz * 0.055]], [0.042, 0.028, 0.017, 0.013], m, 10, 16);
    for (const dz of [-0.012, 0, 0.012]) CO(g, 0.006, 0.035, m, 0.03, 0.008, sz * 0.055 + dz, 0, 0, -Math.PI / 2 + 0.1, 6);
    SW(g, [[0.1, 0.21, sz * 0.03], [0.125, 0.18, sz * 0.035], [0.14, 0.17, sz * 0.03]], [0.01, 0.007, 0.005], m, 6, 8);
  }
  RB(g, 0.3, 0.012, 0.14, 0.005, C.darkWood(), 0, 0.006, 0);
  return g;
}
export function spinningTop() {
  const g = new THREE.Group();
  const tex = canvasTex('trompo', 256, 64, (c, w, h) => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#c8282a', '#e8c020', '#2a5ab0', '#2a8a3a'][i % 4]; c.fillRect(i * w / 8, 0, w / 8, h); } }, true);
  const top = grp(g, 0.0, 0.0, 0, 0, 0, 0.25);
  LA(top, [[0, 0], [0.004, 0.005], [0.03, 0.04], [0.04, 0.06], [0.035, 0.075], [0.008, 0.08], [0.006, 0.095], [0, 0.095]], mat(0xffffff, { map: tex, roughness: 0.25, env: true, envI: 0.5 }), 0, 0, 0, 32);
  CY(top, 0.0015, 0.0015, 0.01, C.steel(), 0, 0.0, 0, 0, 0, 0, 6);
  TU(g, [[0.03, 0.03, 0.0], [0.08, 0.005, 0.03], [0.14, 0.005, -0.02], [0.18, 0.005, 0.04]], 0.002, mat(0xe8dcc0, { roughness: 1 }));
  return g;
}
export function yoyo() {
  const g = new THREE.Group();
  const y = grp(g, 0, 0.05, 0, Math.PI / 2, 0.4);
  for (const s of [-1, 1]) { const h = LA(y, [[0.004, 0], [0.028, 0.004], [0.03, 0.012], [0, 0.014]], glossy(0xc8282a), 0, s * 0.004, 0, 32); h.scale.y = s; }
  CY(y, 0.004, 0.004, 0.008, C.chrome(), 0, 0, 0, 0, 0, 0, 10);
  TU(g, [[0, 0.05, 0], [0.02, 0.1, 0.01], [0.01, 0.14, -0.01], [0.03, 0.18, 0.0]], 0.0012, mat(0xf2f2e8, { roughness: 1 }));
  CY(g, 0.035, 0.04, 0.01, C.darkWood(), 0, 0.005, 0, 0, 0, 0, 20);
  return g;
}
export function marbles() {
  const g = new THREE.Group();
  LA(g, [[0, 0], [0.06, 0], [0.065, 0.01], [0.065, 0.1], [0.05, 0.11], [0.05, 0.12], [0.049, 0.12], [0.049, 0.111], [0.063, 0.1], [0.063, 0.01], [0, 0.003]], glass(0xe8f8ff, 0.3), 0, 0, 0, 32);
  const R = rng(5);
  for (let i = 0; i < 28; i++) { const a = R() * 6.28, r = R() * 0.045; SP(g, 0.009, new THREE.MeshPhysicalMaterial({ color: new THREE.Color().setHSL(R(), 0.7, 0.55), transmission: 0.6, roughness: 0.05, thickness: 0.01 }), Math.cos(a) * r, 0.012 + (i / 28) * 0.07 + R() * 0.01, Math.sin(a) * r, 1, 1, 1, 10); }
  CY(g, 0.051, 0.051, 0.012, C.wood(0x8a5a2a), 0, 0.126, 0, 0, 0, 0, 24);
  return g;
}
export function windupToy() {
  const g = new THREE.Group();
  const tin = metal(0xe8a020, 0.4);
  SP(g, 0.05, tin, 0, 0.07, 0, 1, 1, 1.2);
  SP(g, 0.035, tin, 0, 0.13, 0.03);
  for (const s of [-1, 1]) { SP(g, 0.012, glossy(0x111111), s * 0.015, 0.14, 0.06); CY(g, 0.008, 0.008, 0.05, tin, s * 0.03, 0.02, 0.02, 0.4, 0, 0, 8); }
  CO(g, 0.01, 0.025, glossy(0xc8282a), 0, 0.12, 0.07, Math.PI / 2, 0, 0, 10);
  const k = grp(g, 0, 0.07, -0.065, Math.PI / 2);
  CY(k, 0.003, 0.003, 0.03, C.brass(), 0, 0.015, 0, 0, 0, 0, 6);
  TO(k, 0.012, 0.003, C.brass(), -0.012, 0.035, 0, 0, 0, Math.PI / 2, Math.PI * 2, 16); TO(k, 0.012, 0.003, C.brass(), 0.012, 0.035, 0, 0, 0, Math.PI / 2, Math.PI * 2, 16);
  return g;
}
export function toyCastle() {
  const g = new THREE.Group();
  const st = mat(0xb8b0a0, { roughness: 1 }), rf = glossy(0x2a5ab0);
  B(g, 0.36, 0.02, 0.3, mat(0x3a7a3a), 0, 0.01, 0);
  B(g, 0.24, 0.12, 0.18, st, 0, 0.08, 0);
  for (const [x, z] of [[-0.12, -0.09], [0.12, -0.09], [-0.12, 0.09], [0.12, 0.09]]) { CY(g, 0.035, 0.035, 0.18, st, x, 0.11, z, 0, 0, 0, 16); CO(g, 0.045, 0.08, rf, x, 0.24, z, 0, 0, 0, 16); }
  B(g, 0.06, 0.08, 0.004, C.darkWood(), 0, 0.06, 0.091);
  for (let i = 0; i < 6; i++) B(g, 0.02, 0.02, 0.02, st, -0.1 + i * 0.04, 0.15, 0.09);
  CY(g, 0.002, 0.002, 0.08, C.black(), 0.12, 0.3, 0.09, 0, 0, 0, 4); B(g, 0.03, 0.02, 0.001, glossy(0xc8282a), 0.135, 0.33, 0.09);
  return g;
}
export function rayGun() {
  const g = new THREE.Group();
  const m = metal(0xc0c4ca, 0.25), r = glossy(0xc8282a);
  const gun = grp(g, 0, 0.1, 0);
  LA(gun, [[0, 0], [0.025, 0], [0.03, 0.04], [0.02, 0.1], [0.008, 0.14], [0, 0.14]], m, 0, 0, 0, 20).rotation.z = -Math.PI / 2;
  for (let i = 0; i < 3; i++) TO(gun, 0.03 - i * 0.004, 0.004, r, 0.03 + i * 0.025, 0, 0, 0, Math.PI / 2, 0, Math.PI * 2, 20);
  RB(gun, 0.03, 0.08, 0.025, 0.008, r, -0.01, -0.05, 0, 0, 0, -0.3);
  SP(gun, 0.01, emissive(0x39ff14, 1.5), 0.145, 0, 0);
  B(g, 0.2, 0.012, 0.07, C.darkWood(), 0, 0.006, 0);
  return g;
}
export function boxProduct(o = {}) {
  const g = new THREE.Group();
  const W = o.w ?? 0.3, H = o.h ?? 0.06, D = o.d ?? 0.3;
  const top = artTex(o.seed ?? 8, o.style ?? 'abstract', 256, 256, o.title ?? 'JUEGO');
  const side = labelTex(o.title ?? 'JUEGO', { bg: o.sideBg ?? '#1a3a8a', fg: '#f2d01a', w: 512, h: 96, font: 'bold 60px system-ui' });
  const sm = mat(0xffffff, { map: side, roughness: 0.6 }), tm = mat(0xffffff, { map: top, roughness: 0.5 });
  const b = grp(g, 0, 0, 0, o.stand ? -0.1 : 0);
  if (o.stand) {
    b.position.set(0, H / 2 + 0.01, 0);
    add(b, new THREE.BoxGeometry(W, D, H), [sm, sm, sm, sm, tm, sm], 0, D / 2, 0);
    B(g, W + 0.02, 0.012, 0.08, C.darkWood(), 0, 0.006, H / 2 + 0.03);
  } else add(b, new THREE.BoxGeometry(W, H, D), [sm, sm, tm, sm, sm, sm], 0, H / 2, 0);
  if (o.pieces) for (let i = 0; i < 8; i++) CY(g, 0.012, 0.012, 0.008, glossy([0xc8282a, 0x2a5ab0, 0xe8c020, 0x2a8a3a][i % 4]), W / 2 + 0.03 + (i % 3) * 0.03, 0.004, -0.06 + Math.floor(i / 3) * 0.03, 0, 0, 0, 14);
  return g;
}

// ---------- deportes ----------
export function jersey(o = {}) {
  const tex = canvasTex('jersey' + (o.num ?? 10) + (o.color ?? ''), 256, 300, (c, w, h) => {
    c.fillStyle = '#101418'; c.fillRect(0, 0, w, h);
    c.fillStyle = o.color ?? '#b81c1c';
    c.beginPath(); c.moveTo(70, 30); c.lineTo(100, 20); c.quadraticCurveTo(128, 40, 156, 20); c.lineTo(186, 30); c.lineTo(240, 80); c.lineTo(210, 120); c.lineTo(190, 100); c.lineTo(190, 280); c.lineTo(66, 280); c.lineTo(66, 100); c.lineTo(46, 120); c.lineTo(16, 80); c.closePath(); c.fill();
    c.fillStyle = o.trim ?? '#f2f2f2'; c.fillRect(66, 270, 124, 10); c.font = 'bold 90px system-ui'; c.textAlign = 'center'; c.fillText(String(o.num ?? 10), 128, 190);
    c.font = 'bold 22px system-ui'; c.fillText(o.name ?? 'CAMPEÓN', 128, 90);
  });
  return framed(tex, 0.42, 0.5, { glass: true, signed: o.signed ? (o.num ?? 10) + 5 : 0, frameMat: C.black() });
}
export function soccerBall(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('soccer', 512, 256, (c, w, h) => { c.fillStyle = '#f7f7f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; for (let j = 0; j < 4; j++) for (let i = 0; i < 8; i++) { const x = (i + (j % 2) * 0.5) * w / 8, y = (j + 0.5) * h / 4; c.beginPath(); for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28 - 1.57; c.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18 * 0.9); } c.fill(); } });
  CY(g, 0.06, 0.07, 0.04, C.darkWood(), 0, 0.02, 0, 0, 0, 0, 24);
  SP(g, 0.11, mat(0xffffff, { map: tex, roughness: 0.4 }), 0, 0.15, 0, 1, 1, 1, 32);
  if (o.signed) P(g, 0.1, 0.04, signatureTex(21), 0, 0.16, 0.111, 0, 0, 0.1, { transparent: true });
  return g;
}
export function bat(o = {}) {
  const g = new THREE.Group();
  const b = grp(g, 0, 0.09, 0, 0, 0, Math.PI / 2 - 0.08);
  LA(b, [[0, 0], [0.018, 0], [0.018, 0.01], [0.012, 0.02], [0.013, 0.3], [0.025, 0.55], [0.032, 0.8], [0.03, 0.84], [0, 0.845]], C.wood(0xd8b078), 0, -0.42, 0, 24);
  if (o.signed) P(b, 0.04, 0.2, signatureTex(31), 0, 0.2, 0.031, 0, 0, Math.PI / 2, { transparent: true });
  for (const x of [-0.25, 0.25]) { B(g, 0.04, 0.06, 0.08, C.darkWood(), x, 0.03, 0); }
  B(g, 0.7, 0.012, 0.1, C.darkWood(), 0, 0.006, 0);
  return g;
}
export function glove() {
  const g = new THREE.Group();
  const lt = C.leather(0x8a4a1a);
  SP(g, 0.1, lt, 0, 0.07, 0, 1, 0.55, 1.1, 16);
  for (let i = 0; i < 4; i++) CY(g, 0.022, 0.018, 0.1, lt, -0.045 + i * 0.03, 0.08, -0.12, 0.3, 0, (i - 1.5) * 0.12, 10);
  CY(g, 0.024, 0.02, 0.08, lt, 0.1, 0.07, -0.02, 0.2, 0, -1.1, 10);
  SP(g, 0.036, mat(0xf2f2ec, { roughness: 0.6 }), 0, 0.11, -0.01);
  TU(g, [[-0.03, 0.135, -0.02], [0, 0.145, -0.01], [0.03, 0.135, 0.0]], 0.002, mat(0xc8282a));
  return g;
}
export function trophy(o = {}) {
  const g = new THREE.Group();
  const m = o.gold === false ? C.silver() : C.gold();
  const s = o.s ?? 1;
  RB(g, 0.16 * s, 0.08 * s, 0.16 * s, 0.006, C.darkWood(), 0, 0.04 * s, 0);
  P(g, 0.1 * s, 0.03 * s, labelTex(o.text ?? 'CAMPEÓN 1986', { bg: '#d9a93a', fg: '#2a1a0a', w: 512, h: 128, font: 'bold 56px Georgia' }), 0, 0.04 * s, 0.081 * s);
  LA(g, [[0, 0], [0.04, 0], [0.04, 0.01], [0.012, 0.03], [0.01, 0.1], [0.02, 0.11], [0.015, 0.12], [0.06, 0.18], [0.075, 0.26], [0.07, 0.265]].map(([a, b]) => [a * s, b * s]), metal(o.gold === false ? 0xd0d4d8 : 0xd9a93a, 0.2, { side: THREE.DoubleSide }), 0, 0.08 * s, 0, 40);
  for (const sx of [-1, 1]) TO(g, 0.035 * s, 0.006 * s, m, sx * 0.08 * s, 0.29 * s, 0, 0, 0, sx > 0 ? -Math.PI / 2 : Math.PI / 2, Math.PI, 16);
  if (o.big) { SP(g, 0.03 * s, m, 0, 0.37 * s, 0); for (let i = 0; i < 5; i++) CO(g, 0.012 * s, 0.04 * s, m, Math.cos(i * 1.26) * 0.02 * s, 0.4 * s, Math.sin(i * 1.26) * 0.02 * s, 0, 0, Math.cos(i * 1.26) * 0.4, 5); }
  return g;
}
export function medal(o = {}) {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.13, 0, -0.2);
  const rib = canvasTex('ribbon', 64, 128, (c, w, h) => { const cols = ['#2a8a3a', '#f2f2f2', '#c8282a']; cols.forEach((col, i) => { c.fillStyle = col; c.fillRect(i * w / 3, 0, w / 3 + 1, h); }); });
  EX(d, [[-0.02, 0.1], [0.02, 0.1], [0.012, 0.02], [-0.012, 0.02]], 0.002, mat(0xffffff, { map: rib, roughness: 1 }), 0, -0.04, 0, 0, 0, 0, 0);
  CY(d, 0.035, 0.035, 0.005, [C.gold(), C.gold(), C.gold()], 0, -0.06, 0.003, Math.PI / 2, 0, 0, 40);
  P(d, 0.05, 0.05, labelTex('1°', { bg: '#d9a93a', fg: '#6a4a10', w: 128, h: 128, font: 'bold 70px Georgia' }), 0, -0.06, 0.0062, 0, 0, 0, { rough: 0.3 });
  RB(g, 0.12, 0.2, 0.012, 0.006, mat(0x1a1a4a, { roughness: 1 }), 0, 0.1, -0.012, -0.2);
  B(g, 0.12, 0.012, 0.06, C.darkWood(), 0, 0.006, 0.02);
  return g;
}
export function helmet(o = {}) {
  const g = new THREE.Group();
  CY(g, 0.07, 0.08, 0.06, C.darkWood(), 0, 0.03, 0, 0, 0, 0, 24);
  const h = grp(g, 0, 0.16, 0);
  const m = glossy(o.color ?? 0xc8282a);
  if (o.kind === 'scifi') {
    SP(h, 0.11, glossy(0xf2f2f2), 0, 0.02, 0, 1, 1.15, 1.05, 32);
    B(h, 0.14, 0.035, 0.04, glossy(0x111111), 0, 0.03, 0.09);
    B(h, 0.03, 0.08, 0.03, glossy(0x111111), 0, -0.04, 0.1);
    for (const s of [-1, 1]) { B(h, 0.03, 0.05, 0.08, glossy(0x2a5a8a), s * 0.1, -0.03, 0.02); }
  } else if (o.kind === 'mando') {
    SP(h, 0.105, metal(0x8a9098, 0.3), 0, 0.02, 0, 1, 1.15, 1.05, 32);
    B(h, 0.14, 0.025, 0.04, glossy(0x111111), 0, 0.03, 0.09);
    B(h, 0.025, 0.07, 0.03, glossy(0x111111), 0, -0.02, 0.1);
    CY(h, 0.004, 0.004, 0.08, metal(0x8a9098, 0.3), 0.1, 0.08, 0, 0, 0, 0.1, 6);
  } else {
    SP(h, 0.11, m, 0, 0.02, 0, 1, 0.95, 1.12, 32);
    for (let i = 0; i < 3; i++) TU(h, [[-0.09, -0.04 + i * 0.03, 0.08], [0, -0.05 + i * 0.03, 0.14], [0.09, -0.04 + i * 0.03, 0.08]], 0.005, C.steel());
    B(h, 0.02, 0.16, 0.2, plastic(0xf2f2f2), 0, 0.03, 0.0).scale.set(1, 1, 1);
  }
  return g;
}
export function sneakers() {
  const g = new THREE.Group();
  for (const s of [-1, 1]) {
    const sh = grp(g, s * 0.06, 0, 0, 0, s * 0.1);
    RB(sh, 0.09, 0.025, 0.27, 0.012, plastic(0xf2f2ec), 0, 0.0125, 0);
    RB(sh, 0.085, 0.07, 0.2, 0.03, C.leather(0xf2f2ec), 0, 0.055, -0.02);
    RB(sh, 0.086, 0.04, 0.1, 0.02, C.leather(0xc8282a), 0, 0.045, 0.07);
    EX(sh, [[0, 0], [0.12, 0.01], [0.08, 0.04]], 0.087, mat(0xc8282a, { roughness: 0.6 }), -0.043, 0.04, -0.03, 0, Math.PI / 2, 0, 0);
    for (let i = 0; i < 4; i++) B(sh, 0.05, 0.004, 0.006, mat(0xf2f2f2), 0, 0.09, 0.02 - i * 0.02);
  }
  return g;
}
export function pennant(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('pennant' + (o.text ?? ''), 512, 160, (c, w, h) => { c.fillStyle = o.bg ?? '#1a3a8a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w, h / 2); c.lineTo(0, h); c.fill(); c.fillStyle = '#f2d01a'; c.font = 'bold 50px system-ui'; c.textBaseline = 'middle'; c.fillText(o.text ?? 'ÁGUILAS', 30, h / 2); });
  CY(g, 0.005, 0.005, 0.5, C.wood(0xd8b078), -0.18, 0.25, 0, 0, 0, 0, 8);
  P(g, 0.45, 0.14, tex, 0.045, 0.42, 0.0, 0, 0, -0.05, { transparent: true, alphaTest: 0.3, double: true });
  CY(g, 0.05, 0.06, 0.02, C.darkWood(), -0.18, 0.01, 0, 0, 0, 0, 16);
  return g;
}
export function scarf(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('scarf' + (o.c1 ?? ''), 64, 256, (c, w, h) => { for (let y = 0; y < h; y += 32) { c.fillStyle = y % 64 ? (o.c1 ?? '#c8282a') : (o.c2 ?? '#f2f2f2'); c.fillRect(0, y, w, 32); } }, true);
  tex.repeat.set(1, 2);
  const m = mat(0xffffff, { map: tex, roughness: 1 });
  for (let i = 0; i < 4; i++) RB(g, 0.2, 0.025, 0.08, 0.01, m, 0, 0.0125 + i * 0.025, (i % 2) * 0.01);
  for (let i = 0; i < 10; i++) CY(g, 0.002, 0.002, 0.04, m, -0.09 + i * 0.02, 0.01, 0.06, Math.PI / 2, 0, 0, 4);
  return g;
}
export function stickerAlbum() {
  return book({ open: true, w: 0.2, h: 0.27, coverTex: artTex(55, 'abstract', 256, 256, 'MUNDIAL ’86') });
}
export function poster(seed, title, o = {}) { return framed(artTex(seed, o.style ?? 'stars', 256, 360, title), 0.4, 0.56, { glass: true, signed: o.signed ? seed : 0, frameMat: C.black() }); }
export function ticket(seed, title) {
  const g = new THREE.Group();
  const tex = canvasTex('ticket' + seed, 256, 110, (c, w, h) => { const R = rng(seed); c.fillStyle = `hsl(${R() * 360},60%,70%)`; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = 'bold 26px system-ui'; c.fillText(title, 16, 38); c.font = '16px system-ui'; c.fillText('FILA 7 · ASIENTO 12', 16, 66); c.fillText('ADMITE UNO · $25', 16, 90); c.setLineDash([6, 4]); c.beginPath(); c.moveTo(w - 50, 0); c.lineTo(w - 50, h); c.stroke(); });
  const st = grp(g, 0, 0.06, 0, -0.3);
  RB(st, 0.19, 0.09, 0.008, 0.003, glass(0xf4f8ff, 0.3), 0, 0, 0);
  P(st, 0.17, 0.073, tex, 0, 0, 0.0045);
  B(g, 0.2, 0.012, 0.05, C.darkWood(), 0, 0.006, 0.02);
  return g;
}
export function magazine(seed, title) {
  const g = new THREE.Group();
  const cover = artTex(seed, 'portrait', 200, 270, title);
  for (let i = 0; i < 3; i++) { const m = grp(g, 0, 0.004 + i * 0.006, 0, 0, 0.2 * i - 0.2); B(m, 0.21, 0.005, 0.28, C.paper(), 0, 0, 0); P(m, 0.21, 0.28, i === 2 ? cover : artTex(seed + i, 'abstract', 128, 170), 0, 0.0026, 0, -Math.PI / 2); }
  return g;
}
export function discStand(seed, title, o = {}) {
  const g = new THREE.Group();
  const d = grp(g, 0, 0.13, 0, -0.15);
  CY(d, 0.1, 0.1, 0.006, [C.gold(), metal(0xffffff, 0.2, { map: artTex(seed, 'stars', 256, 256) }), C.gold()], 0, 0, 0, Math.PI / 2, 0, 0, 48);
  CY(d, 0.02, 0.02, 0.008, mat(0xf2f2f2), 0, 0, 0, Math.PI / 2, 0, 0, 24);
  P(d, 0.16, 0.03, lbl(title, { bg: '#1a1a1a', fg: '#e8c870', w: 512, h: 90, font: 'bold 50px system-ui' }), 0, -0.12, 0.005);
  RB(g, 0.26, 0.3, 0.01, 0.006, mat(0x1a1a1a, { roughness: 1 }), 0, 0.14, -0.008, -0.15);
  B(g, 0.26, 0.012, 0.06, C.darkWood(), 0, 0.006, 0.02);
  return g;
}

// ---------- cine y entretenimiento ----------
export function dvdCase(seed, title, n = 1) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) {
    const c = grp(g, (i - (n - 1) / 2) * 0.017, 0.095, 0, -0.1, 0, 0);
    if (n === 1) { c.rotation.x = -0.18; }
    RB(c, n > 1 ? 0.015 : 0.135, 0.19, n > 1 ? 0.135 : 0.015, 0.003, plastic(0x1a1a3a), 0, 0, 0, 0, n > 1 ? 0 : 0, 0);
    if (n > 1) P(c, 0.19, 0.013, lbl(`${title} ${i + 1}`, { bg: ['#1a3a8a', '#8a1a1a', '#1a6a3a', '#3a3a3a'][i % 4], fg: '#fff', w: 512, h: 40, font: 'bold 30px system-ui' }), 0.0076, 0, 0, 0, Math.PI / 2, Math.PI / 2);
    else P(c, 0.125, 0.18, artTex(seed, 'portrait', 180, 256, title), 0, 0, 0.0081);
  }
  B(g, Math.max(0.15, n * 0.02 + 0.04), 0.012, 0.16, C.darkWood(), 0, 0.006, 0.0);
  return g;
}
export function vhs(seed, title) {
  const g = new THREE.Group();
  const sl = grp(g, -0.04, 0.1, 0, -0.15, 0.2);
  RB(sl, 0.11, 0.2, 0.028, 0.003, mat(0xffffff, { map: artTex(seed, 'landscape', 180, 320, title), roughness: 0.5 }), 0, 0, 0);
  const t = grp(g, 0.08, 0.0125, 0.04, 0, -0.3);
  RB(t, 0.187, 0.025, 0.103, 0.004, plastic(0x141414), 0, 0, 0);
  P(t, 0.12, 0.02, lbl(title, { bg: '#f4f0e0', fg: '#333', w: 512, h: 80, font: 'bold 40px system-ui' }), 0, 0.0126, 0.02, -Math.PI / 2);
  for (const s of [-1, 1]) CY(t, 0.022, 0.022, 0.001, glass(0x333333, 0.6), s * 0.045, 0.0126, -0.02, 0, 0, 0, 20);
  return g;
}
export function mask(o = {}) {
  const g = new THREE.Group();
  CY(g, 0.008, 0.008, 0.3, C.black(), 0, 0.15, 0, 0, 0, 0, 8);
  CY(g, 0.07, 0.08, 0.02, C.darkWood(), 0, 0.01, 0, 0, 0, 0, 24);
  const f = grp(g, 0, 0.36, 0);
  const m = glossy(o.color ?? 0xe8e4dc);
  SP(f, 0.09, m, 0, 0, 0.0, 0.85, 1.15, 0.6, 32);
  for (const s of [-1, 1]) { SP(f, 0.02, mat(0x0a0a0a), s * 0.032, 0.025, 0.048, 1.3, 0.8, 0.4); }
  if (o.kind === 'hockey') for (let i = 0; i < 10; i++) SP(f, 0.006, mat(0x111111), (Math.random() - 0.5) * 0.08, -0.04 + Math.random() * 0.05, 0.052, 1, 1, 0.3);
  else { SP(f, 0.014, m, 0, -0.01, 0.05, 1, 1.2, 1); B(f, 0.05, 0.008, 0.01, mat(0x111111), 0, -0.05, 0.048); }
  return g;
}
export function filmCamera() {
  const g = new THREE.Group();
  for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28; CY(g, 0.012, 0.012, 1.0, C.steel(), Math.cos(a) * 0.2, 0.47, Math.sin(a) * 0.2, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4, 8); }
  const c = grp(g, 0, 0.96, 0);
  RB(c, 0.2, 0.2, 0.34, 0.015, metal(0x2a2a2c, 0.4), 0, 0, 0);
  CY(c, 0.05, 0.055, 0.14, C.black(), 0, 0, 0.23, Math.PI / 2, 0, 0, 24);
  CY(c, 0.045, 0.045, 0.002, glass(0x3a4a7a, 0.9), 0, 0, 0.301, Math.PI / 2, 0, 0, 24);
  for (const z of [-0.08, 0.1]) { CY(c, 0.14, 0.14, 0.04, metal(0x3a3a3c, 0.4), 0, 0.22, z, 0, 0, Math.PI / 2, 40); CY(c, 0.09, 0.09, 0.045, mat(0x2a1a0a), 0, 0.22, z, 0, 0, Math.PI / 2, 30); }
  CY(c, 0.012, 0.012, 0.15, C.black(), 0.13, 0.05, -0.1, 0, 0, Math.PI / 2 - 0.5, 10);
  return g;
}
export function keychain() {
  const g = new THREE.Group();
  TO(g, 0.015, 0.002, C.chrome(), 0, 0.12, 0, 0, 0, 0);
  for (let i = 0; i < 4; i++) TO(g, 0.004, 0.0012, C.chrome(), 0, 0.1 - i * 0.007, 0, 0, i % 2 ? Math.PI / 2 : 0, 0, Math.PI * 2, 8);
  const f = grp(g, 0, 0.03, 0);
  looseFigure({ suit: 0xf2d01a, s: 0.12 }).children.forEach(ch => f.add(ch.clone()));
  B(g, 0.08, 0.012, 0.05, C.darkWood(), 0, 0.006, 0.0);
  CY(g, 0.002, 0.002, 0.13, C.chrome(), 0, 0.065, -0.02, 0, 0, 0, 4);
  return g;
}
export function costume(o = {}) {
  const g = new THREE.Group();
  CY(g, 0.15, 0.17, 0.03, C.black(), 0, 0.015, 0, 0, 0, 0, 24);
  CY(g, 0.012, 0.012, 0.8, C.chrome(), 0, 0.4, 0, 0, 0, 0, 8);
  const suit = glossy(o.color ?? 0x1a3a8a);
  LA(g, [[0, 0], [0.13, 0], [0.12, 0.15], [0.16, 0.38], [0.1, 0.45], [0.05, 0.47], [0, 0.47]], suit, 0, 0.8, 0, 32).scale.z = 0.65;
  P(g, 0.12, 0.1, labelTex('S', { bg: '#f2d01a', fg: '#c8282a', w: 128, h: 110, font: 'bold 100px Georgia' }), 0, 1.1, 0.1, -0.1);
  EX(g, [[-0.14, 0], [0.14, 0], [0.22, -0.7], [-0.22, -0.7]], 0.006, glossy(o.cape ?? 0xc8282a), 0, 1.25, -0.1, 0.12, 0, 0, 0.002);
  SP(g, 0.06, mat(0x2a2a2a), 0, 1.33, 0);
  return g;
}
export function modelCar(o = {}) { return diecastCar({ color: o.color ?? 0xe8741a, s: 1.8, box: true, type: 'sedan', plate: 'EDICIÓN 1:18' }); }

// ---------- misteriosos ----------
export function artifact(kind, seed = 1) {
  const g = new THREE.Group();
  const R = rng(seed);
  const col = new THREE.Color().setHSL(R(), 0.8, 0.55).getHex();
  if (kind === 'orb') {
    CY(g, 0.08, 0.1, 0.05, C.bronze(), 0, 0.025, 0, 0, 0, 0, 8);
    for (let i = 0; i < 3; i++) { const a = i / 3 * 6.28; CY(g, 0.006, 0.006, 0.1, C.bronze(), Math.cos(a) * 0.06, 0.09, Math.sin(a) * 0.06, Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3, 6); }
    SP(g, 0.065, emissive(col, 1.3), 0, 0.17, 0, 1, 1, 1, 32);
    SP(g, 0.075, glass(0xffffff, 0.2), 0, 0.17, 0, 1, 1, 1, 32);
  } else if (kind === 'cube') {
    const tex = canvasTex('runes' + seed, 128, 128, (c, w, h) => { c.fillStyle = '#2a2622'; c.fillRect(0, 0, w, h); c.strokeStyle = hex(col); c.lineWidth = 3; c.shadowColor = hex(col); c.shadowBlur = 6; for (let i = 0; i < 6; i++) { c.beginPath(); const x = 20 + (i % 3) * 36, y = 30 + Math.floor(i / 3) * 50; c.moveTo(x, y); c.lineTo(x + 14, y + 20); c.lineTo(x + 24, y); c.moveTo(x + 12, y - 8); c.lineTo(x + 12, y + 30); c.stroke(); } });
    add(g, new THREE.BoxGeometry(0.14, 0.14, 0.14), mat(0xffffff, { map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.6, roughness: 0.6 }), 0, 0.12, 0, 0.3, 0.6, 0.2);
  } else if (kind === 'gears') {
    const gear = (r, x, y, z, m) => { const s = new THREE.Shape(); const n = Math.round(r * 120); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? r : r * 0.82; s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } s.closePath(); const h = new THREE.Path(); h.absarc(0, 0, r * 0.25, 0, Math.PI * 2); s.holes.push(h); return EXS(g, s, 0.012, m, x, y, z, 0, 0, 0, 0.001); };
    gear(0.08, 0, 0.12, 0, C.brass()); gear(0.05, 0.11, 0.08, 0.015, C.copper()); gear(0.035, -0.08, 0.19, 0.015, C.steel()); gear(0.06, 0.05, 0.22, -0.015, C.brass());
    RB(g, 0.3, 0.02, 0.1, 0.004, C.darkWood(), 0, 0.01, 0);
    CY(g, 0.006, 0.006, 0.22, C.iron(), 0, 0.12, -0.03, 0, 0, 0, 6);
  } else if (kind === 'alien') {
    const geo = new THREE.IcosahedronGeometry(0.1, 3); const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const k = 1 + 0.25 * Math.sin(v.x * 40) * Math.sin(v.y * 35) * Math.sin(v.z * 30); v.multiplyScalar(k); p.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals();
    add(g, geo, new THREE.MeshPhysicalMaterial({ color: 0x3a1a6a, metalness: 0.6, roughness: 0.2, iridescence: 1, iridescenceIOR: 1.8, emissive: 0x2a0a5a, emissiveIntensity: 0.6 }), 0, 0.15, 0);
    for (let i = 0; i < 5; i++) SP(g, 0.01, emissive(0x39ff14, 2), Math.cos(i) * 0.09, 0.15 + Math.sin(i * 2) * 0.05, Math.sin(i) * 0.09);
    CY(g, 0.08, 0.1, 0.03, metal(0x1a1a1a, 0.3), 0, 0.015, 0, 0, 0, 0, 6);
  } else if (kind === 'device') {
    RB(g, 0.2, 0.08, 0.14, 0.02, metal(0x3a3e44, 0.35), 0, 0.04, 0);
    for (let i = 0; i < 3; i++) CY(g, 0.012, 0.012, 0.02, plastic(0x1a1a1a), -0.06 + i * 0.04, 0.09, 0.03, 0, 0, 0, 12);
    B(g, 0.08, 0.03, 0.004, emissive(col, 1), 0.04, 0.06, 0.071);
    CY(g, 0.003, 0.003, 0.15, C.chrome(), 0.08, 0.15, -0.04, 0, 0, 0.2, 6); SP(g, 0.01, emissive(0xff3322, 2), 0.065, 0.225, -0.04);
    TU(g, [[-0.1, 0.03, 0.0], [-0.15, 0.01, 0.05], [-0.18, 0.005, -0.02]], 0.005, mat(0xc8282a));
  } else if (kind === 'crate') {
    RB(g, 0.3, 0.26, 0.3, 0.01, C.wood(0x9a7040), 0, 0.13, 0);
    for (const y of [0.03, 0.23]) B(g, 0.31, 0.03, 0.31, C.wood(0x6a4a24), 0, y, 0);
    for (const s of [-1, 1]) B(g, 0.02, 0.28, 0.31, C.iron(), s * 0.1, 0.13, 0);
    P(g, 0.2, 0.08, labelTex('NO ABRIR', { bg: '#00000000', fg: '#b8281f', w: 512, h: 200, font: 'bold 110px Impact, system-ui' }), 0, 0.14, 0.152, 0, 0, -0.1, { transparent: true });
    B(g, 0.06, 0.05, 0.02, C.brass(), 0, 0.2, 0.155);
  } else if (kind === 'broken') {
    RB(g, 0.3, 0.2, 0.3, 0.01, mat(0xa88a5a, { roughness: 1 }), 0, 0.1, 0, 0, 0, 0.05);
    B(g, 0.2, 0.02, 0.2, mat(0xa88a5a, { roughness: 1 }), 0.08, 0.22, -0.05, 0.5, 0.3, 0.2);
    for (let i = 0; i < 5; i++) B(g, 0.04, 0.02, 0.08, mat(0x8a6a3a), (R() - 0.5) * 0.4, 0.01, (R() - 0.5) * 0.4, 0, R() * 3, 0);
  } else if (kind === 'rusty') {
    RB(g, 0.22, 0.12, 0.15, 0.01, C.rust(), 0, 0.06, 0);
    for (let i = 0; i < 4; i++) CY(g, 0.015, 0.015, 0.03, C.rust(), -0.07 + i * 0.045, 0.13, 0.03, 0, 0, 0, 8);
    CY(g, 0.04, 0.04, 0.02, glass(0x886644, 0.6), 0.05, 0.08, 0.076, Math.PI / 2, 0, 0, 20);
    TU(g, [[-0.1, 0.1, 0], [-0.15, 0.2, 0], [-0.08, 0.25, 0.02]], 0.008, C.rust());
  } else if (kind === 'ring') {
    CY(g, 0.1, 0.12, 0.04, metal(0x1a1a1a, 0.3), 0, 0.02, 0, 0, 0, 0, 6);
    TO(g, 0.1, 0.015, C.gold(), 0, 0.2, 0, 0, 0, 0, Math.PI * 2, 48);
    TO(g, 0.07, 0.008, emissive(0xffd84a, 1.5), 0, 0.2, 0, 0.8, 0.4, 0, Math.PI * 2, 48);
    SP(g, 0.025, emissive(0xffffff, 2), 0, 0.2, 0);
  } else if (kind === 'robot') {
    const w = glossy(0xf2f2f0), bk = glossy(0x1a1a1a);
    for (const s of [-1, 1]) { CY(g, 0.02, 0.016, 0.24, w, s * 0.04, 0.12, 0, 0, 0, 0, 12); CY(g, 0.016, 0.014, 0.2, w, s * 0.11, 0.36, 0, 0, 0, s * 0.15, 12); SP(g, 0.018, bk, s * 0.125, 0.25, 0); }
    RB(g, 0.16, 0.2, 0.09, 0.03, w, 0, 0.35, 0);
    B(g, 0.1, 0.02, 0.005, emissive(0x3ad8ff, 1.5), 0, 0.38, 0.046);
    SP(g, 0.055, bk, 0, 0.51, 0, 1, 1.1, 1, 24);
    B(g, 0.08, 0.012, 0.01, emissive(0x3ad8ff, 1.8), 0, 0.51, 0.05);
  } else {
    RB(g, 0.2, 0.2, 0.2, 0.04, metal(0x2a2e34, 0.25), 0, 0.12, 0, 0.2, 0.5, 0);
    for (let i = 0; i < 6; i++) SP(g, 0.012, emissive(col, 1.5), (R() - 0.5) * 0.18, 0.05 + R() * 0.18, 0.11);
  }
  return g;
}

// ---------- cotidianos pequeños ----------
export function sodaCan(o = {}) {
  const g = new THREE.Group();
  const tex = canvasTex('can' + (o.color ?? ''), 256, 128, (c, w, h) => { c.fillStyle = o.color ?? '#c8282a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = 'italic bold 40px Georgia'; c.fillText(o.title ?? 'Cola-Rica', 20, 76); c.fillRect(0, 96, w, 6); c.fillStyle = '#f2d01a'; c.fillRect(0, 106, w, 4); });
  CY(g, 0.033, 0.033, 0.115, [mat(0xffffff, { map: tex, metalness: 0.5, roughness: 0.3, env: true }), C.silver(), C.silver()], 0, 0.06, 0, 0, 0, 0, 32);
  CY(g, 0.028, 0.033, 0.008, C.silver(), 0, 0.121, 0, 0, 0, 0, 32);
  B(g, 0.02, 0.002, 0.01, C.silver(), 0.005, 0.126, 0);
  return g;
}
export function bottle(o = {}) {
  const g = new THREE.Group();
  LA(g, [[0, 0], [0.035, 0], [0.037, 0.01], [0.037, 0.13], [0.03, 0.16], [0.012, 0.2], [0.012, 0.23], [0.015, 0.235], [0.013, 0.24]], new THREE.MeshPhysicalMaterial({ color: o.color ?? 0x2a6a4a, transmission: 0.8, roughness: 0.05, thickness: 0.01, side: THREE.DoubleSide }), 0, 0, 0, 32);
  P(g, 0.06, 0.05, labelTex(o.title ?? 'ELIXIR 1890', { bg: '#efe2bf', fg: '#6a1a1a', w: 256, h: 200, font: 'bold 38px Georgia', sub: 'Tónico', subFont: 'italic 30px Georgia' }), 0, 0.07, 0.0375);
  CY(g, 0.013, 0.011, 0.018, mat(0x8a6a3a, { roughness: 1 }), 0, 0.245, 0, 0, 0, 0, 12);
  return g;
}
export function cerealBox() { return boxProduct({ w: 0.19, h: 0.07, d: 0.28, stand: true, title: 'ZUCARITOS', style: 'abstract', seed: 91, sideBg: '#f2a020' }); }
export function happyMeal() {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-0.08, 0); s.lineTo(0.08, 0); s.lineTo(0.09, 0.12); s.lineTo(-0.09, 0.12);
  EXS(g, s, 0.12, glossy(0xc8282a), 0, 0, 0, 0, 0, 0, 0.002);
  for (const s2 of [-1, 1]) TU(g, [[s2 * 0.08, 0.12, -0.03], [s2 * 0.05, 0.18, 0], [s2 * 0.08, 0.12, 0.03]], 0.004, glossy(0xf2c230));
  P(g, 0.1, 0.06, labelTex('CAJITA', { bg: '#c8282a', fg: '#f2c230', w: 256, h: 150, font: 'bold 70px system-ui' }), 0, 0.06, 0.061);
  const f = grp(g, 0.16, 0, 0.02); looseFigure({ suit: 0xf2c230, s: 0.3 }).children.forEach(c => f.add(c.clone()));
  return g;
}
export function agenda() { return book({ w: 0.15, h: 0.21, t: 0.025, color: 0x1a3a5a, title: 'AGENDA 1994' }); }
export function spatula() {
  const g = new THREE.Group();
  const s = grp(g, 0, 0.1, 0, 0, 0, Math.PI / 2 - 0.3);
  RB(s, 0.09, 0.1, 0.004, 0.01, C.steel(), 0, 0.2, 0);
  for (let i = 0; i < 3; i++) B(s, 0.008, 0.07, 0.005, C.black(), -0.025 + i * 0.025, 0.2, 0);
  CY(s, 0.006, 0.006, 0.12, C.steel(), 0, 0.1, 0, 0, 0, 0, 8);
  CY(s, 0.012, 0.01, 0.1, C.wood(0x6a3a1a), 0, 0.0, 0, 0, 0, 0, 12);
  acrylic(g, 0.35, 0.2, 0.14);
  return g;
}

// auto a escala 1:24 sobre peana (usa el modelo detallado de autos)
export function diecastCar(o = {}) {
  const g = new THREE.Group();
  const s = o.s ?? 1;
  const L = 0.2 * s;
  let car;
  try { car = makeCar(o.type ?? 'vocho', o.color ?? 0xc8282a); } catch (e) { car = null; }
  const holder = grp(g, 0, 0.016 * s, 0, 0, -0.45, 0);
  if (car) {
    const bb = new THREE.Box3().setFromObject(car), sz = bb.getSize(new THREE.Vector3());
    const k = L / Math.max(sz.x, sz.z);
    car.scale.setScalar(k);
    car.position.set(-(bb.min.x + sz.x / 2) * k, -bb.min.y * k, -(bb.min.z + sz.z / 2) * k);
    holder.add(car);
  }
  // peana con placa
  const wd = C.darkWood();
  add(g, slab(rrShape(0.26 * s, 0.13 * s, 0.012 * s), 0.016 * s, 0.003 * s), wd, 0, 0, 0, -Math.PI / 2);
  add(g, new THREE.BoxGeometry(0.23 * s, 0.0015, 0.1 * s), mat(0x2a2a2a, { roughness: 0.9 }), 0, 0.0165 * s, 0);
  P(g, 0.07 * s, 0.012 * s, labelTex(o.plate ?? 'ESCALA 1:24', { bg: '#c9a54a', fg: '#2a1a08', w: 256, h: 44, font: 'bold 30px system-ui' }), 0, 0.008 * s, 0.0651 * s);
  if (o.box) {
    const gl = add(g, new RoundedBoxGeometry(0.25 * s, 0.11 * s, 0.12 * s, 2, 0.003), glass(0xeef6ff, 0.12), 0, 0.016 * s + 0.055 * s, 0);
    gl.castShadow = false;
  }
  return g;
}
// biplano de hojalata sobre pedestal
export function toyPlane() {
  const g = new THREE.Group();
  const yel = glossy(0xe8c020), red = glossy(0xc8282a), blk = plastic(0x161616, 0.4);
  const wd = C.darkWood();
  add(g, latheGeo([[0, 0.02], [0.05, 0.02], [0.056, 0.014], [0.06, 0.004], [0.058, 0], [0, 0]], 40), wd);
  add(g, rodGeo([0, 0.02, 0], [0, 0.085, 0], 0.003, 10), C.chrome());
  const p = grp(g, 0, 0.1, 0, 0, -0.5, 0.06);
  // fuselaje con barrido de radio variable (morro a +x)
  SW(p, [[0.1, 0, 0], [0.07, 0.002, 0], [0.02, 0.004, 0], [-0.04, 0.006, 0], [-0.1, 0.012, 0]], [0.019, 0.024, 0.022, 0.016, 0.006], yel, 16, 32);
  add(p, latheGeo([[0, 0], [0.019, 0], [0.02, 0.006], [0.017, 0.01], [0, 0.012]], 20), red, 0.1, 0, 0, 0, 0, -Math.PI / 2);
  add(p, new THREE.SphereGeometry(0.006, 12, 8), C.chrome(), 0.114, 0, 0);
  const prop = new Acc(); for (const a of [0, Math.PI]) prop.put(new THREE.BoxGeometry(0.003, 0.07, 0.008), 0.117, 0, 0, a + 0.3, 0, 0, 1, 1, 1); prop.mesh(p, mat(0x6a4020, { roughness: 0.5 }));
  // alas dobles redondeadas
  const wing = new THREE.Shape(rrShape(0.26, 0.055, 0.025).getPoints(6));
  for (const y of [-0.016, 0.03]) add(p, slab(wing, 0.005, 0.0015), red, 0.035, y, 0, Math.PI / 2, 0, Math.PI / 2).rotation.set(Math.PI / 2, 0, Math.PI / 2);
  const st = new Acc();
  for (const z of [-0.09, 0.09]) for (const x of [0.02, 0.05]) st.raw(rodGeo([x, -0.014, z], [x, 0.028, z], 0.0015, 6));
  for (const z of [-0.025, 0.025]) st.raw(rodGeo([0.045, 0.012, z], [0.035, 0.028, z * 1.5], 0.0015, 6));
  st.mesh(p, blk);
  // cola
  add(p, slab(new THREE.Shape(rrShape(0.09, 0.035, 0.012).getPoints(4)), 0.004, 0.001), red, -0.088, 0.008, 0, Math.PI / 2, 0, Math.PI / 2).rotation.set(Math.PI / 2, 0, Math.PI / 2);
  add(p, slab(polyShape([[-0.003, 0], [0.03, 0], [0.02, 0.035], [-0.008, 0.035]]), 0.004, 0.001), red, -0.11, 0.008, -0.002);
  // tren de aterrizaje
  const lg = new Acc();
  for (const z of [-0.025, 0.025]) { lg.raw(rodGeo([0.05, -0.012, z * 0.4], [0.055, -0.042, z], 0.0016, 6)); lg.raw(rodGeo([0.03, -0.012, z * 0.4], [0.055, -0.042, z], 0.0016, 6)); }
  lg.mesh(p, blk);
  for (const z of [-0.027, 0.027]) { add(p, new THREE.CylinderGeometry(0.011, 0.011, 0.006, 18), blk, 0.055, -0.044, z, Math.PI / 2); add(p, new THREE.CylinderGeometry(0.005, 0.005, 0.0065, 12), C.chrome(), 0.055, -0.044, z, Math.PI / 2); }
  // cabina, matrícula
  add(p, new THREE.TorusGeometry(0.012, 0.003, 8, 16), blk, -0.005, 0.024, 0, Math.PI / 2);
  P(p, 0.05, 0.012, labelTex('XB-07', { bg: '#00000000', fg: '#111', w: 200, h: 48, font: 'bold 40px system-ui' }), -0.04, 0.008, 0.0145, 0, 0, 0, { transparent: true });
  return g;
}
