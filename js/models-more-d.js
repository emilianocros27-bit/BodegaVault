// Objetos nuevos (grupo D): cultura pop, historia de la tecnología, lujo, utilería de cine/TV,
// cultura mexicana, misterio y leyendas de los juguetes. Solo alto nivel (épico, legendario, único, exótico).
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, rng, add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, SW } from './modelkit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// { id, name, category, rarity, baseValue, desc }
export const ITEMS_D = [
  // ---------- épicos ----------
  { id: 'consola_prototipo', name: 'Prototipo de Consola Portátil', category: 'videogames', rarity: 'epic', baseValue: 4200, desc: 'Carcasa transparente, placa de pruebas y etiquetas escritas a mano. Nunca salió a la venta.' },
  { id: 'palanca_arcade_oro', name: 'Palanca Arcade Chapada en Oro', category: 'videogames', rarity: 'epic', baseValue: 2800, desc: 'Panel de torneo con bola de palanca y botones bañados en oro de 24 quilates.' },
  { id: 'carta_primera_edicion', name: 'Carta de Primera Edición Graduada', category: 'toys', rarity: 'epic', baseValue: 5200, desc: 'Carta holográfica de 1999 sellada en su estuche de grado 10. Impecable.' },
  { id: 'rockola_miniatura', name: 'Rockola en Miniatura de Colección', category: 'music', rarity: 'epic', baseValue: 3200, desc: 'Réplica a escala de una rockola de 1946, con tubos de burbujas y luces que sí encienden.' },
  { id: 'robot_hojalata_gigante', name: 'Robot de Hojalata Gigante', category: 'toys', rarity: 'epic', baseValue: 4600, desc: 'Robot litografiado de casi medio metro, con engranes visibles en el pecho y antena de chispa.' },
  { id: 'blaster_utileria', name: 'Bláster de Utilería de Película', category: 'entertainment', rarity: 'epic', baseValue: 5400, desc: 'Pistola de rayos usada en el rodaje de una saga espacial. Pintura desgastada a mano.' },
  { id: 'bola_cristal_nebulosa', name: 'Bola de Cristal con Nebulosa', category: 'mystery', rarity: 'epic', baseValue: 3300, desc: 'Dentro del cristal flota una nebulosa que nadie sabe cómo llegó ahí. Base de bronce con garras.' },
  { id: 'chac_mool_miniatura', name: 'Chac Mool en Miniatura', category: 'art', rarity: 'epic', baseValue: 4800, desc: 'Figura reclinada tallada en piedra caliza, con el recipiente de ofrendas sobre el vientre.' },
  { id: 'rebozo_seda_caja', name: 'Rebozo de Seda en Caja de Olinalá', category: 'art', rarity: 'epic', baseValue: 2400, desc: 'Rebozo de seda de Santa María del Río con rapacejo anudado a mano, guardado en su caja laqueada.' },
  { id: 'plumas_oro_estuche', name: 'Juego de Plumas de Oro en Estuche', category: 'valuables', rarity: 'epic', baseValue: 3600, desc: 'Pluma fuente y portaminas de oro guilloché con plumín de 18 quilates y tintero de cristal.' },
  { id: 'diente_tiranosaurio', name: 'Diente de Tiranosaurio', category: 'rarities', rarity: 'epic', baseValue: 5900, desc: 'Diente aserrado de 25 centímetros hallado en Montana. Cada estría es un filo de carnicero.' },
  { id: 'celular_ladrillo_oro', name: 'Celular “Ladrillo” Chapado en Oro', category: 'electronics', rarity: 'epic', baseValue: 4400, desc: 'El teléfono móvil de 1985 en edición para ejecutivos: carcasa dorada y teclas de nácar.' },
  { id: 'muneca_maldita_vitrina', name: 'Muñeca Maldita en Vitrina', category: 'mystery', rarity: 'epic', baseValue: 3800, desc: 'Muñeca de porcelana encerrada tras cristal y cadenas. La etiqueta dice: “No abrir”.' },
  { id: 'bobina_tesla', name: 'Bobina de Tesla de Laboratorio', category: 'machines', rarity: 'epic', baseValue: 5600, desc: 'Toroide de aluminio, secundario de cobre esmaltado y chispazos de medio metro.' },
  // ---------- legendarios ----------
  { id: 'reloj_maquina_tiempo', name: 'Reloj de la Máquina del Tiempo', category: 'entertainment', rarity: 'legendary', baseValue: 9800, desc: 'Utilería original: tableros de fecha de destino, fecha presente y última salida. Aún parpadea.' },
  { id: 'disco_oro_enmarcado', name: 'Disco de Oro Enmarcado', category: 'music', rarity: 'legendary', baseValue: 7800, desc: 'Reconocimiento por medio millón de copias vendidas, en marco de caja con placa grabada.' },
  { id: 'patineta_flotante', name: 'Patineta Flotante de Utilería', category: 'entertainment', rarity: 'legendary', baseValue: 12500, desc: 'La patineta que “flotaba” en una película de viajes en el tiempo. Viene con su base de exhibición.' },
  { id: 'craneo_alien_resina', name: 'Cráneo Alienígena en Resina', category: 'mystery', rarity: 'legendary', baseValue: 14000, desc: 'Cráneo alargado con órbitas enormes, encapsulado en un bloque de resina cristalina.' },
  { id: 'cabeza_olmeca_mini', name: 'Cabeza Olmeca en Miniatura', category: 'art', rarity: 'legendary', baseValue: 11500, desc: 'Réplica en basalto de un gobernante olmeca con su casco. Tres mil años de mirada serena.' },
  { id: 'silla_charro_plata', name: 'Silla de Charro con Piteado y Plata', category: 'sports', rarity: 'legendary', baseValue: 18000, desc: 'Montura de gala con bordado de pita, cabeza de plata cincelada y estribos de madera.' },
  { id: 'sarape_saltillo', name: 'Sarape de Saltillo Antiguo', category: 'art', rarity: 'legendary', baseValue: 9200, desc: 'Tejido en telar de pedal hacia 1850: rombo central de colores vibrantes y fondo de grecas.' },
  { id: 'mesa_talavera', name: 'Mesa de Talavera Poblana', category: 'everyday', rarity: 'legendary', baseValue: 7200, desc: 'Cubierta de azulejos pintados a mano sobre herrería forjada en Puebla.' },
  { id: 'camara_telemetrica_oro', name: 'Cámara Telemétrica Edición Oro', category: 'electronics', rarity: 'legendary', baseValue: 16000, desc: 'Cámara de 35 mm bañada en oro con forro de piel de lagarto. Tiraje de 1,000 piezas.' },
  { id: 'cifradora_ruedas', name: 'Cifradora Mecánica de Ruedas de Pines', category: 'machines', rarity: 'legendary', baseValue: 21000, desc: 'Máquina de cifrado de campo de los años 40: seis ruedas de pines, manivela e impresión en cinta.' },
  { id: 'computadora_casera_1976', name: 'Computadora Casera de 1976 en Estuche', category: 'electronics', rarity: 'legendary', baseValue: 19000, desc: 'Placa ensamblada a mano en un estuche de madera de koa con teclado. De las primeras de garaje.' },
  { id: 'gargantilla_zafiros', name: 'Gargantilla de Zafiros en Busto', category: 'valuables', rarity: 'legendary', baseValue: 22000, desc: 'Zafiros de Ceilán engarzados en platino con brillantes, sobre busto de terciopelo.' },
  { id: 'copa_campeon_mundial', name: 'Copa de Campeón Mundial (Réplica)', category: 'sports', rarity: 'legendary', baseValue: 16000, desc: 'Réplica de campeón en oro con bandas de malaquita. Las espirales sostienen el mundo.' },
  { id: 'reloj_mesa_guilloche', name: 'Reloj de Mesa de Esmalte Guilloché', category: 'valuables', rarity: 'legendary', baseValue: 19500, desc: 'Reloj de joyero imperial: esmalte rosa translúcido sobre guilloché, perlas y oro de colores.' },
  { id: 'modelo_satelite', name: 'Modelo de Satélite de Museo', category: 'machines', rarity: 'legendary', baseValue: 13500, desc: 'Maqueta del fabricante: aislamiento dorado, paneles solares desplegados y antena parabólica.' },
  // ---------- únicos ----------
  { id: 'reloj_esqueleto_diamantes', name: 'Reloj Esqueleto con Diamantes', category: 'valuables', rarity: 'unique', baseValue: 68000, desc: 'Movimiento calado a la vista, bisel de diamantes y tourbillon. Una pieza de alta relojería.' },
  { id: 'pectoral_jade_oro', name: 'Pectoral de Jade y Oro', category: 'art', rarity: 'unique', baseValue: 74000, desc: 'Pectoral mixteco de oro fundido a la cera perdida con cuentas de jade y cascabeles.' },
  { id: 'coatlicue_miniatura', name: 'Coatlicue en Miniatura', category: 'art', rarity: 'unique', baseValue: 58000, desc: 'La madre de los dioses, con falda de serpientes y cabeza de dos serpientes enfrentadas.' },
  { id: 'roca_lunar_capsula', name: 'Roca Lunar en Cápsula', category: 'rarities', rarity: 'unique', baseValue: 110000, desc: 'Fragmento de basalto lunar sellado en esfera de lucita, en placa de nogal como regalo de Estado.' },
  { id: 'daga_meteorito', name: 'Daga de Hierro Meteórico', category: 'rarities', rarity: 'unique', baseValue: 88000, desc: 'Hoja forjada de un meteorito con empuñadura de oro granulado y pomo de cristal de roca.' },
  { id: 'supercomputadora_banca', name: 'Módulo de Supercomputadora con Banca', category: 'electronics', rarity: 'unique', baseValue: 52000, desc: 'Torre en forma de C con asiento acolchado alrededor. Fue la máquina más rápida del mundo.' },
  { id: 'carrusel_automata', name: 'Carrusel Musical Autómata', category: 'toys', rarity: 'unique', baseValue: 46000, desc: 'Carrusel de feria en miniatura con caballitos que suben y bajan al son de una caja de música.' },
  { id: 'anillo_esmeralda_estuche', name: 'Anillo de Esmeralda en Estuche', category: 'valuables', rarity: 'unique', baseValue: 64000, desc: 'Esmeralda colombiana talla esmeralda de 6 quilates, con halo de diamantes y estuche de piel.' },
  { id: 'casco_espacial_utileria', name: 'Casco Espacial de Utilería', category: 'entertainment', rarity: 'unique', baseValue: 42000, desc: 'Casco usado en una película de ciencia ficción de 1968. Visor dorado y conectores de anillo.' },
  { id: 'fragmento_ovni', name: 'Fragmento de OVNI', category: 'mystery', rarity: 'unique', baseValue: 96000, desc: 'Aleación iridiscente que no se dobla ni se raya, con glifos que brillan en la oscuridad.' },
  { id: 'consola_oro_macizo', name: 'Consola Portátil de Oro Macizo', category: 'videogames', rarity: 'unique', baseValue: 82000, desc: 'Encargada por un jeque: carcasa de oro de 18 quilates y botones de rubí y zafiro.' },
  { id: 'mascara_lucha_oro', name: 'Máscara de Lucha Bordada en Oro', category: 'sports', rarity: 'unique', baseValue: 40000, desc: 'Máscara de campeonato con hilo de oro y pedrería, usada en la noche de su última caída.' },
  // ---------- exóticos ----------
  { id: 'monolito_levitante', name: 'Monolito Levitante', category: 'mystery', rarity: 'exotic', baseValue: 240000, desc: 'Un cristal negro que flota sobre su base de piedra, rodeado de anillos de luz. Nadie lo explica.' },
  { id: 'diamante_azul_maldito', name: 'Diamante Azul Maldito', category: 'valuables', rarity: 'exotic', baseValue: 290000, desc: 'Cuarenta y cinco quilates de azul profundo rodeados de brillantes. Cada dueño tuvo un final trágico.' },
  { id: 'cartucho_campeonato_oro', name: 'Cartucho Dorado de Campeonato', category: 'videogames', rarity: 'exotic', baseValue: 120000, desc: 'Uno de solo 26 cartuchos dorados entregados a los finalistas de un torneo de 1990. Graduado.' },
  { id: 'huevo_dragon_fosil', name: 'Huevo de Dragón Fosilizado', category: 'mystery', rarity: 'exotic', baseValue: 165000, desc: 'Escamas de piedra con una grieta por la que se escapa un resplandor tibio.' },
  { id: 'reloj_supercomplicacion', name: 'Reloj de Bolsillo Súper Complicación', category: 'valuables', rarity: 'exotic', baseValue: 255000, desc: 'Veinticuatro complicaciones en oro: calendario perpetuo, fases lunares y mapa celeste. Ocho años de trabajo.' },
];

// =====================================================================
//  utilidades locales
// =====================================================================
const PI = Math.PI, TAU = Math.PI * 2;
function poly(pts, hole = false) {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) s.lineTo(x, y);
  s.closePath();
  return s;
}
function spl(pts, hole = false) {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  s.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
  s.closePath();
  return s;
}
function rrect(w, h, r, cx = 0, cy = 0, hole = false) {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  const x = cx - w / 2, y = cy - h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function circ(r, cx = 0, cy = 0, hole = false) {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  s.absarc(cx, cy, r, 0, TAU, hole);
  return s;
}
function lathe(g, pts, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, seg = 48, phi0 = 0, phiL = TAU) {
  const geo = new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(Math.max(0, a), b)), seg, phi0, phiL);
  return add(g, geo, m, x, y, z, rx, ry, rz);
}
const latheGeo = (pts, seg = 24, phi0 = 0, phiL = TAU) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(Math.max(0, a), b)), seg, phi0, phiL);
function smooth(pts, n = 64) {
  const c = new THREE.SplineCurve(pts.map(([a, b]) => new THREE.Vector2(a, b)));
  return c.getPoints(n).map(v => [Math.max(0, v.x), v.y]);
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
function gx(geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) {
  _q.setFromEuler(_e.set(rx, ry, rz));
  _m4.compose(_v.set(x, y, z), _q, typeof s === 'number' ? _s.set(s, s, s) : _s.set(...s));
  return geo.applyMatrix4(_m4);
}
function mergeList(geos) {
  const list = geos.map(ge => {
    const n = ge.index ? ge.toNonIndexed() : ge;
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
    if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
    n.clearGroups();
    return n;
  });
  return mergeGeometries(list, false);
}
const merged = (g, geos, m) => add(g, mergeList(geos), m);
function swGeo(pts, radii, radial = 10, segs = 24, flatZ = 1, closed = false) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed);
  const geo = new THREE.TubeGeometry(curve, segs, 1, radial, closed);
  const p = geo.attributes.position, v = new THREE.Vector3();
  const n = radii.length - 1;
  const rf = typeof radii === 'function' ? radii : (t) => { const f = t * n, i = Math.min(n - 1, Math.floor(f)); return radii[i] + (radii[i + 1] - radii[i]) * (f - i); };
  for (let i = 0; i <= segs; i++) {
    const c = curve.getPointAt(i / segs), r = rf(i / segs);
    for (let j = 0; j <= radial; j++) { const k = i * (radial + 1) + j; v.fromBufferAttribute(p, k).sub(c).multiplyScalar(r); v.z *= flatZ; v.add(c); p.setXYZ(k, v.x, v.y, v.z); }
  }
  geo.computeVertexNormals();
  return geo;
}
const tubeGeo = (pts, r, segs = 32, radial = 8, closed = false) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed), segs, r, radial, closed);
const exGeo = (shape, d, bevel = 0.002, curveSegments = 16) => { const ge = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2, curveSegments }); ge.translate(0, 0, -d / 2); return ge; };
const rbGeo = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
function ground(g) {
  g.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(g);
  const dy = -bb.min.y;
  for (const c of g.children) c.position.y += dy;
  return g;
}
function noise3(seed) {
  const R = rng(seed), Pm = new Uint8Array(512), G = new Float32Array(256);
  for (let i = 0; i < 256; i++) { Pm[i] = i; G[i] = R() * 2 - 1; }
  for (let i = 255; i > 0; i--) { const j = (R() * (i + 1)) | 0; [Pm[i], Pm[j]] = [Pm[j], Pm[i]]; }
  for (let i = 0; i < 256; i++) Pm[i + 256] = Pm[i];
  const f = (t) => t * t * (3 - 2 * t);
  const h = (x, y, z) => G[Pm[Pm[Pm[x & 255] + (y & 255)] + (z & 255)]];
  const n = (x, y, z) => {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), u = f(x - X), v = f(y - Y), w = f(z - Z);
    const l = (a, b, t) => a + (b - a) * t;
    return l(l(l(h(X, Y, Z), h(X + 1, Y, Z), u), l(h(X, Y + 1, Z), h(X + 1, Y + 1, Z), u), v), l(l(h(X, Y, Z + 1), h(X + 1, Y, Z + 1), u), l(h(X, Y + 1, Z + 1), h(X + 1, Y + 1, Z + 1), u), v), w);
  };
  return (x, y, z, oct = 3) => { let s = 0, a = 1, fr = 1, t = 0; for (let i = 0; i < oct; i++) { s += n(x * fr, y * fr, z * fr) * a; t += a; a *= 0.5; fr *= 2.03; } return s / t; };
}
// desplaza cada vértice con una función (x,y,z) -> [x,y,z]
function warp(geo, fn) {
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const r = fn(p.getX(i), p.getY(i), p.getZ(i)); p.setXYZ(i, r[0], r[1], r[2]); }
  geo.computeVertexNormals();
  return geo;
}
function displace(geo, fn) {
  const p = geo.attributes.position, nrm = geo.attributes.normal, v = new THREE.Vector3(), nn = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); nn.fromBufferAttribute(nrm, i);
    const d = fn(v.x, v.y, v.z, nn);
    p.setXYZ(i, v.x + nn.x * d, v.y + nn.y * d, v.z + nn.z * d);
  }
  geo.computeVertexNormals();
  return geo;
}
// ---------- materiales ----------
const texM = (tex, o = {}) => mat(0xffffff, { map: tex, roughness: 0.6, ...o });
const glassD = (color = 0xd8ecf2, opacity = 0.25) => mat(color, { transparent: true, opacity, roughness: 0.04, metalness: 0.1, env: true, envI: 1.3, depthWrite: false, side: THREE.DoubleSide });
const gold = (r = 0.2) => metal(0xe2b04a, r);
const roseGold = () => metal(0xe0a080, 0.22);
const whiteGold = () => metal(0xe8ecef, 0.12);
const brass = () => metal(0xc49a45, 0.3);
const gemCache = new Map();
function gem(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (gemCache.has(key)) return gemCache.get(key);
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: 0.03, metalness: 0.05, transmission: o.transmission ?? 0.55, thickness: 0.01, ior: o.ior ?? 2.0, transparent: true, opacity: o.opacity ?? 0.9, envMapIntensity: 1.8, clearcoat: 1, flatShading: o.flat ?? true, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 0.25 });
  gemCache.set(key, m);
  return m;
}
const diamond = () => gem(0xf4f8ff, { transmission: 0.7, opacity: 0.85, emissive: 0x5a6a80, ei: 0.35 });
const lacquer = (color) => mat(color, { roughness: 0.12, metalness: 0.05, env: true, envI: 0.9 });
const circleDecal = (g, r, tex, x, y, z, rx = 0, ry = 0, rz = 0, o = {}) => add(g, new THREE.CircleGeometry(r, 64), texM(tex, o), x, y, z, rx, ry, rz);
function rep(tex, rx, ry, ox = 0, oy = 0) {
  const t = tex.clone(); t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.offset.set(ox, oy);
  return t;
}
// ---------- texturas procedurales ----------
function grainTex(key, base = '#6a3a1a', o = {}) {
  const { w = 256, h = 512, flame = 0, lines = 90, dark = 'rgba(40,18,5,', light = 'rgba(255,220,160,' } = o;
  return canvasTex('D_grain_' + key, w, h, (c) => {
    const R = rng(key.length * 53 + 9);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < lines; i++) {
      const x0 = R() * w, amp = 2 + R() * 6, f = 0.005 + R() * 0.01, ph = R() * 6;
      c.strokeStyle = (R() < 0.7 ? dark : light) + (0.05 + R() * 0.13) + ')'; c.lineWidth = 0.5 + R() * 2.5;
      c.beginPath();
      for (let y = 0; y <= h; y += 8) c.lineTo(x0 + Math.sin(y * f + ph) * amp, y);
      c.stroke();
    }
    if (flame) for (let y = 0; y < h; y += 3) { const a = 0.5 + 0.5 * Math.sin(y * 0.35 + Math.sin(y * 0.05) * 3); c.fillStyle = `rgba(255,230,180,${a * 0.14 * flame})`; c.fillRect(0, y, w, 2); }
  }, true);
}
function woodM(key, base, o = {}) {
  const { rx = 1, ry = 1, rough = 0.45, envI = 0.4, flame = 0, lines } = o;
  const t = grainTex(key, base, { flame, ...(lines ? { lines } : {}) });
  return mat(0xffffff, { map: rx === 1 && ry === 1 ? t : rep(t, rx, ry), roughness: rough, env: true, envI });
}
function stoneTex(key, base = [150, 138, 118], o = {}) {
  const { w = 256, h = 256, spots = 900, veins = 6, pits = 0 } = o;
  return canvasTex('D_stone_' + key, w, h, (c) => {
    const R = rng(key.length * 29 + 11);
    c.fillStyle = `rgb(${base})`; c.fillRect(0, 0, w, h);
    for (let i = 0; i < spots; i++) { const k = 0.75 + R() * 0.5; c.fillStyle = `rgba(${base.map(v => Math.min(255, v * k) | 0)},0.55)`; c.beginPath(); c.arc(R() * w, R() * h, 1 + R() * 7, 0, TAU); c.fill(); }
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.15})`; c.fillRect(R() * w, R() * h, 1, 1); }
    for (let i = 0; i < pits; i++) { c.fillStyle = `rgba(0,0,0,${0.2 + R() * 0.3})`; c.beginPath(); c.arc(R() * w, R() * h, 0.6 + R() * 1.8, 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < veins; i++) { c.lineWidth = 0.5 + R() * 1.5; c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (R() - 0.5) * 60; y += (R() - 0.5) * 60; c.lineTo(x, y); } c.stroke(); }
  }, true);
}
function velvetTex(key, col = '#5a0f1c') {
  return canvasTex('D_velv_' + key, 128, 128, (c, w, h) => {
    const R = rng(key.length + 5);
    c.fillStyle = col; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,255,255'},${R() * 0.06})`; c.fillRect(R() * w, R() * h, 2, 1); }
  }, true);
}
const velvet = (key, col) => mat(0xffffff, { map: velvetTex(key, col), roughness: 1 });
function engraveTex(key, base = '#d8ab4a', line = 'rgba(70,40,5,0.55)', o = {}) {
  const { w = 512, h = 256, density = 1, border = true } = o;
  return canvasTex('D_eng_' + key, w, h, (c) => {
    const R = rng(key.length * 131 + 7);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.05})`; c.fillRect(0, R() * h, w, 1); }
    c.strokeStyle = line; c.lineCap = 'round';
    const spiral = (x, y, r, dir) => { c.beginPath(); for (let t = 0; t < 9; t += 0.15) { const rr = r * (1 - t / 10); c.lineTo(x + Math.cos(t * dir) * rr, y + Math.sin(t * dir) * rr); } c.stroke(); };
    const n = Math.round(10 * density);
    for (let row = 0; row < 2; row++) {
      const y0 = h * (0.3 + row * 0.4);
      c.lineWidth = 2.2; c.beginPath();
      for (let x = 0; x <= w; x += 4) c.lineTo(x, y0 + Math.sin(x / w * TAU * n / 2) * h * 0.12);
      c.stroke(); c.lineWidth = 1.5;
      for (let i = 0; i < n; i++) {
        const x = (i + 0.25) * w / n, s = i % 2 ? 1 : -1;
        spiral(x, y0 + s * h * 0.08, h * 0.08, s);
        c.beginPath(); c.ellipse(x + w / n * 0.5, y0 - s * h * 0.07, h * 0.035, h * 0.012, s * 0.8, 0, TAU); c.stroke();
      }
    }
    if (border) { c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4); c.lineWidth = 1; c.strokeRect(9, 9, w - 18, h - 18); }
    c.fillStyle = line;
    for (let i = 0; i < 700 * density; i++) c.fillRect(R() * w, R() * h, 1, 1);
  }, true);
}
// guilloché (líneas concéntricas onduladas) para esferas y tapas
function guillocheTex(key, base = '#d9a93a', line = 'rgba(90,55,10,0.5)', o = {}) {
  const { w = 512, rays = 36, rings = 38, center = true } = o;
  return canvasTex('D_guil_' + key, w, w, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, w, w);
    c.strokeStyle = line; c.lineWidth = 1.2;
    const cx = w / 2;
    for (let k = 1; k <= rings; k++) {
      const r0 = k / rings * w * 0.5;
      c.beginPath();
      for (let a = 0; a <= TAU + 0.01; a += 0.02) { const r = r0 + Math.sin(a * rays) * w * 0.006; c.lineTo(cx + Math.cos(a) * r, cx + Math.sin(a) * r); }
      c.stroke();
    }
    if (center) { const g = c.createRadialGradient(cx, cx, 0, cx, cx, w * 0.5); g.addColorStop(0, 'rgba(255,255,255,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0.12)'); c.fillStyle = g; c.fillRect(0, 0, w, w); }
  });
}
// guilloché lineal (para cuerpos cilíndricos)
function barleyTex(key, base = '#d9a93a', line = 'rgba(90,55,10,0.45)') {
  return canvasTex('D_barley_' + key, 256, 256, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    c.strokeStyle = line; c.lineWidth = 1.3;
    for (let x = -h; x < w + h; x += 6) { c.beginPath(); for (let y = 0; y <= h; y += 4) c.lineTo(x + y * 0.5 + Math.sin(y * 0.2) * 2, y); c.stroke(); }
    for (let i = 0; i < 200; i++) { c.fillStyle = 'rgba(255,255,255,0.05)'; c.fillRect(0, (i * 37) % h, w, 1); }
  }, true);
}
function parchmentTex(key, o = {}) {
  const { w = 512, h = 512, base = '#e9dab4', dark = 'rgba(120,80,30,', draw = null } = o;
  return canvasTex('D_parch_' + key, w, h, (c) => {
    const R = rng(key.length * 17 + 3);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 60; i++) { c.fillStyle = dark + (R() * 0.06) + ')'; c.beginPath(); c.arc(R() * w, R() * h, 10 + R() * 60, 0, TAU); c.fill(); }
    const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, dark + '0.35)');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2000; i++) { c.fillStyle = dark + (R() * 0.12) + ')'; c.fillRect(R() * w, R() * h, 1, 1); }
    if (draw) draw(c, w, h, R);
  });
}
// textura libre con clave propia
const tex = (key, w, h, draw, repeat = false) => canvasTex('D_' + key, w, h, draw, repeat);
// desgaste (rasguños y polvo) superpuesto a un color
function wornTex(key, base, o = {}) {
  const { w = 256, h = 256, scratches = 120, chips = 40, chipCol = '#b8b8b8' } = o;
  return tex('worn_' + key, w, h, (c) => {
    const R = rng(key.length * 7 + 1);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.08})`; c.fillRect(R() * w, R() * h, 2, 2); }
    for (let i = 0; i < scratches; i++) { c.strokeStyle = `rgba(255,255,255,${0.05 + R() * 0.15})`; c.lineWidth = 0.5; const x = R() * w, y = R() * h, a = R() * TAU, l = 3 + R() * 18; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
    for (let i = 0; i < chips; i++) { c.fillStyle = chipCol; c.globalAlpha = 0.4 + R() * 0.5; c.beginPath(); const x = R() * w, y = R() * h; for (let k = 0; k < 6; k++) c.lineTo(x + (R() - 0.5) * 7, y + (R() - 0.5) * 7); c.fill(); }
    c.globalAlpha = 1;
  }, true);
}
// placa de latón con texto grabado
function plaque(g, text, sub, w, h, x, y, z, rx = 0, ry = 0, o = {}) {
  const { bg = '#c9a24e', fg = '#3a2608', frame = brass() } = o;
  const t = labelTex(text, { bg, fg, w: 512, h: 128, font: 'bold 50px Georgia', border: fg, sub, subFont: 'italic 30px Georgia' });
  const b = RB(g, w + 0.006, h + 0.006, 0.004, 0.0015, frame, x, y, z, rx, ry);
  const q = P(g, w, h, t, 0, 0, 0.0021, 0, 0, 0, { rough: 0.35 });
  b.add(q); q.castShadow = false;
  return b;
}
// peana torneada elegante — devuelve la altura superior
function plinth(g, r = 0.1, h = 0.05, m = C.darkWood(), o = {}) {
  const { trim = null } = o;
  const pr = [[0, 0], [r, 0], [r, h * 0.16]];
  for (let i = 0; i <= 6; i++) { const a = i / 6 * PI / 2; pr.push([r * 0.9 + Math.cos(a) * r * 0.09, h * 0.16 + Math.sin(a) * h * 0.16]); }
  pr.push([r * 0.9, h * 0.36], [r * 0.88, h * 0.4], [r * 0.88, h * 0.74]);
  for (let i = 0; i <= 6; i++) { const a = i / 6 * PI / 2; pr.push([r * 0.88 + Math.sin(a) * r * 0.06, h * 0.74 + (1 - Math.cos(a)) * h * 0.14]); }
  pr.push([r * 0.95, h * 0.9], [r * 0.95, h * 0.97], [r * 0.935, h], [0, h]);
  lathe(g, pr, m, 0, 0, 0, 0, 0, 0, 64);
  if (trim) lathe(g, [[r * 0.885, h * 0.58], [r * 0.9, h * 0.6], [r * 0.9, h * 0.64], [r * 0.885, h * 0.66]], trim, 0, 0, 0, 0, 0, 0, 64);
  return h;
}
// base rectangular moldurada — devuelve la altura superior
function slabBase(g, w, d, h, m, o = {}) {
  const { trim = null, r = 0.006 } = o;
  EXS(g, rrect(w, d, r * 2), h * 0.55, m, 0, h * 0.275, 0, -PI / 2, 0, 0, Math.min(0.004, h * 0.12));
  EXS(g, rrect(w * 0.94, d * 0.92, r * 1.5), h * 0.45, m, 0, h * 0.55 + h * 0.225, 0, -PI / 2, 0, 0, Math.min(0.003, h * 0.1));
  if (trim) EXS(g, rrect(w * 0.955, d * 0.935, r * 1.5), h * 0.08, trim, 0, h * 0.58, 0, -PI / 2, 0, 0, 0.001);
  return h;
}
// vitrina de cristal con marco (caja) — y0: altura de apoyo
function vitrine(g, w, h, d, y0, frameM) {
  const gl = glassD(0xeef6ff, 0.13);
  const bx = B(g, w, h, d, gl, 0, y0 + h / 2, 0); bx.castShadow = false; bx.renderOrder = 3;
  const e = 0.006;
  const geos = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) geos.push(gx(new THREE.BoxGeometry(e, h, e), sx * w / 2, y0 + h / 2, sz * d / 2));
  for (const y of [y0 + e / 2, y0 + h - e / 2]) {
    for (const sz of [-1, 1]) geos.push(gx(new THREE.BoxGeometry(w + e, e, e), 0, y, sz * d / 2));
    for (const sx of [-1, 1]) geos.push(gx(new THREE.BoxGeometry(e, e, d + e), sx * w / 2, y, 0));
  }
  merged(g, geos, frameM);
}
// domo de cristal
function glassDome(g, r, h, y0) {
  const pts = smooth([[r, 0], [r, h * 0.7], [r * 0.85, h * 0.93], [r * 0.4, h * 1.0], [0, h * 1.0]], 30);
  const d = lathe(g, pts, glassD(0xeef6ff, 0.12), 0, y0, 0, 0, 0, 0, 56); d.castShadow = false; d.renderOrder = 3;
  return d;
}
// facetado de brillante (geometría) — r: radio, altura total ~0.62r (corona+pabellón)
function brilliantGeo(r, o = {}) {
  const { n = 16, table = 0.56, crown = 0.16, pav = 0.43, seg = 1 } = o;
  const pts = [[0, -pav * r], [r * 0.999, -0.01 * r], [r, 0.01 * r], [r * (table + (1 - table) * 0.45), crown * r * 0.75], [r * table, crown * r], [0, crown * r]];
  const geo = new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), n);
  return geo;
}
function brilliant(g, r, m, x, y, z, rx = 0, ry = 0, rz = 0, o) { return add(g, brilliantGeo(r, o), m, x, y, z, rx, ry, rz); }
// fila de brillantes a lo largo de una lista de puntos (fusionados)
function stonesAlong(g, pts, r, m, orient = null) {
  const geos = pts.map((p, i) => { const ge = brilliantGeo(r, { n: 8 }); const o = orient ? orient(p, i) : [0, 0, 0]; return gx(ge, p[0], p[1], p[2], o[0], o[1], o[2]); });
  return merged(g, geos, m);
}
// engrane plano (perfil 2D) para extruir
function gearShape(rOut, teeth, rIn = 0, o = {}) {
  const { depthT = 0.12, spokes = 0 } = o;
  const s = new THREE.Shape();
  const N = teeth * 4;
  for (let i = 0; i <= N; i++) {
    const a = i / N * TAU, ph = i % 4;
    const r = ph === 1 || ph === 2 ? rOut : rOut * (1 - depthT);
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  if (spokes) {
    const r1 = rOut * 0.28, r2 = rOut * (1 - depthT) * 0.82;
    for (let k = 0; k < spokes; k++) {
      const a0 = k / spokes * TAU + 0.18, a1 = (k + 1) / spokes * TAU - 0.18;
      const hp = new THREE.Path();
      hp.moveTo(Math.cos(a0) * r1, Math.sin(a0) * r1);
      hp.absarc(0, 0, r2, a0, a1, false);
      hp.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
      hp.absarc(0, 0, r1, a1, a0, true);
      s.holes.push(hp);
    }
  } else if (rIn > 0) s.holes.push(circ(rIn, 0, 0, true));
  return s;
}
const gearGeo = (rOut, teeth, d, o) => exGeo(gearShape(rOut, teeth, o?.rIn ?? rOut * 0.15, o), d, 0.0003, 4);

// id -> (seed) => THREE.Group
const BUILDERS_D = {};
export function registerD(reg) {
  for (const it of ITEMS_D) if (BUILDERS_D[it.id]) reg(it.id, BUILDERS_D[it.id]);
}
export const BUILT_IDS = () => Object.keys(BUILDERS_D);

// =====================================================================
//  ÉPICOS
// =====================================================================
// cinta plana a lo largo de una curva; el ancho va en la dirección de `side` (perpendicular a la tangente)
function ribbonGeo(pts, width, side = [0, 0, 1], segs = 40, widthFn = null) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)));
  const pos = [], uv = [], idx = [];
  const sd = new THREE.Vector3(...side), t = new THREE.Vector3(), s = new THREE.Vector3();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs, c = curve.getPointAt(u);
    curve.getTangentAt(u, t);
    s.copy(sd).sub(t.clone().multiplyScalar(sd.dot(t))).normalize();
    const w = (widthFn ? widthFn(u) : 1) * width / 2;
    pos.push(c.x - s.x * w, c.y - s.y * w, c.z - s.z * w, c.x + s.x * w, c.y + s.y * w, c.z + s.z * w);
    uv.push(0, u, 1, u);
    if (i < segs) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}
// placa de circuito impreso
function pcbTex(key, o = {}) {
  const { w = 512, h = 256, base = '#1d5a2c', trace = 'rgba(190,230,150,0.55)', pad = '#d8c070', silk = '#f2f2e8' } = o;
  return tex('pcb_' + key, w, h, (c) => {
    const R = rng(key.length * 97 + 13);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.08})`; c.fillRect(R() * w, R() * h, 3, 3); }
    c.strokeStyle = trace; c.lineCap = 'round';
    for (let i = 0; i < 140; i++) {
      c.lineWidth = R() < 0.2 ? 3 : 1.4;
      let x = (R() * w / 8 | 0) * 8, y = (R() * h / 8 | 0) * 8;
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 3; k++) { if (R() < 0.5) x += ((R() - 0.5) * 120 | 0); else y += ((R() - 0.5) * 80 | 0); const d = (R() - 0.5) * 20; c.lineTo(x, y); x += d; y += d; c.lineTo(x, y); }
      c.stroke();
      c.fillStyle = pad; c.beginPath(); c.arc(x, y, 2.4, 0, TAU); c.fill();
    }
    c.fillStyle = pad;
    for (let i = 0; i < 90; i++) { c.beginPath(); c.arc(R() * w, R() * h, 1.6 + R() * 1.4, 0, TAU); c.fill(); }
    c.fillStyle = silk; c.font = 'bold 11px monospace';
    for (let i = 0; i < 26; i++) c.fillText(['U', 'R', 'C', 'Q', 'J', 'D'][(R() * 6) | 0] + ((R() * 40) | 0), R() * w, R() * h);
  });
}
function chipsGeo(list) { return list.map(([w, d, x, z, hh = 0.002]) => gx(new THREE.BoxGeometry(w, hh, d), x, hh / 2, z)); }

// ---------- Prototipo de consola portátil ----------
BUILDERS_D.consola_prototipo = () => {
  const g = new THREE.Group();
  // base de exhibición negra con etiqueta
  const black = mat(0x121212, { roughness: 0.35, env: true, envI: 0.5 });
  slabBase(g, 0.26, 0.15, 0.022, black);
  P(g, 0.12, 0.012, labelTex('EVT-2 · PROTOTIPO · NO VENDER', { bg: '#141414', fg: '#e8e2c8', w: 1024, h: 102, font: 'bold 52px monospace' }), 0, 0.012, 0.0712, 0, 0, 0, { rough: 0.5 });
  // soporte de acrílico inclinado (perfil extruido)
  const acr = glassD(0xdff0ff, 0.28);
  EXS(g, poly([[-0.03, 0], [0.02, 0], [0.02, 0.016], [0.015, 0.016], [0.015, 0.004], [0.004, 0.004], [-0.032, 0.085], [-0.038, 0.085], [-0.004, 0.004], [-0.03, 0.004]]), 0.15, acr, -0.02, 0.022, -0.003, 0, -PI / 2, 0, 0.0015);
  // tarjeta de depuración a un lado con cinta plana
  const dbg = grp(g, 0.09, 0.022, 0.035);
  RB(dbg, 0.06, 0.004, 0.04, 0.001, texM(pcbTex('dbg', { w: 256, h: 256, base: '#1f3f7a' }), { roughness: 0.5 }), 0, 0.002, 0);
  merged(dbg, chipsGeo([[0.018, 0.018, -0.01, 0.004, 0.003], [0.012, 0.006, 0.016, -0.01], [0.012, 0.006, 0.016, 0.01], [0.006, 0.02, -0.024, -0.004]]).map(ge => gx(ge, 0, 0.004, 0)), mat(0x151515, { roughness: 0.4 }));
  CY(dbg, 0.0035, 0.0035, 0.008, emissive(0xff3020, 2.2), 0.024, 0.0065, 0.014, 0, 0, 0, 12);
  RB(dbg, 0.03, 0.008, 0.006, 0.001, mat(0x2a2a2a, { roughness: 0.5 }), -0.005, 0.008, -0.019);
  // consola inclinada sobre el soporte
  const h = grp(g, -0.02, 0.07, -0.004, -0.42, 0, 0);
  const W = 0.165, H = 0.078, D = 0.026;
  const outline = spl([[-W / 2 + 0.03, -H / 2], [0, -H / 2 - 0.002], [W / 2 - 0.03, -H / 2], [W / 2 - 0.004, -H / 2 + 0.018], [W / 2, 0.006], [W / 2 - 0.012, H / 2 - 0.004], [0, H / 2], [-W / 2 + 0.012, H / 2 - 0.004], [-W / 2, 0.006], [-W / 2 + 0.004, -H / 2 + 0.018]]);
  // placa interior con componentes
  const pcb = texM(pcbTex('proto'), { roughness: 0.45, env: true, envI: 0.3 });
  const inner = exGeo(outline, 0.0016, 0, 32); inner.scale(0.93, 0.9, 1);
  add(h, inner, pcb, 0, 0, -0.004);
  merged(h, [
    gx(new THREE.BoxGeometry(0.016, 0.016, 0.003), -0.058, 0.012, -0.0015), gx(new THREE.BoxGeometry(0.012, 0.012, 0.003), 0.058, 0.014, -0.0015),
    gx(new THREE.BoxGeometry(0.02, 0.007, 0.0025), 0.052, -0.022, -0.0017), gx(new THREE.BoxGeometry(0.009, 0.009, 0.0025), -0.05, -0.024, -0.0017),
  ], mat(0x141414, { roughness: 0.35 }));
  // condensadores electrolíticos
  const caps = [];
  for (const [x, y] of [[-0.071, -0.004], [0.072, -0.004], [0.066, 0.028], [-0.066, 0.028]]) caps.push(gx(new THREE.CylinderGeometry(0.003, 0.003, 0.007, 14), x, y, 0.0005, PI / 2, 0, 0));
  merged(h, caps, mat(0x2440a0, { roughness: 0.3, env: true }));
  // pantalla (módulo LCD con marco)
  RB(h, 0.07, 0.052, 0.004, 0.002, mat(0x202020, { roughness: 0.5 }), 0, 0.006, -0.001);
  const scr = tex('proto_scr', 256, 192, (c, w, hh) => {
    const gr = c.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#2c3a7a'); gr.addColorStop(1, '#7ac0e8');
    c.fillStyle = gr; c.fillRect(0, 0, w, hh);
    c.fillStyle = '#3a8a3a'; for (let x = 0; x < w; x += 16) c.fillRect(x, hh - 30 - (x % 48 === 0 ? 16 : 0), 16, 40);
    c.fillStyle = '#ffd040'; c.fillRect(60, hh - 58, 14, 14); c.fillStyle = '#e04040'; c.fillRect(58, hh - 70, 18, 10);
    c.fillStyle = '#fff'; c.font = 'bold 16px monospace'; c.fillText('BUILD 0.37', 8, 20); c.fillText('FPS 29', 170, 20);
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < hh; y += 2) c.fillRect(0, y, w, 1);
  });
  P(h, 0.06, 0.044, scr, 0, 0.006, 0.0012, 0, 0, 0, { glow: 0.7, rough: 0.2 });
  // carcasa transparente ahumada
  const shellG = exGeo(outline, D, 0.004, 40);
  const shell = add(h, shellG, mat(0xa8c8e0, { transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0.1, env: true, envI: 1.2, depthWrite: false }), 0, 0, 0);
  shell.castShadow = false; shell.renderOrder = 2;
  // cruceta y botones (plástico gris de prototipo)
  const btnM = mat(0x3a3d42, { roughness: 0.4, env: true, envI: 0.4 });
  const cr = 0.0045, cl = 0.013;
  EXS(h, poly([[-cr, cl], [cr, cl], [cr, cr], [cl, cr], [cl, -cr], [cr, -cr], [cr, -cl], [-cr, -cl], [-cr, -cr], [-cl, -cr], [-cl, cr], [-cr, cr]]), 0.004, btnM, -0.058, -0.004, D / 2 + 0.004, 0, 0, 0, 0.0012);
  const bt = [];
  for (const [x, y, c] of [[0.055, 0.004, 0], [0.066, -0.006, 0], [0.055, -0.016, 0], [0.044, -0.006, 0]]) bt.push(gx(latheGeo(smooth([[0, 0], [0.0052, 0], [0.0052, 0.0022], [0.0035, 0.0038], [0, 0.0042]], 10), 20), x, y, D / 2 + 0.002, PI / 2, 0, 0));
  merged(h, bt, btnM);
  // start / select (píldoras)
  for (const x of [-0.012, 0.012]) RB(h, 0.012, 0.004, 0.004, 0.0019, mat(0x1a1a1a, { roughness: 0.6 }), x, -0.031, D / 2 + 0.002, 0, 0, 0.35);
  // gatillos
  for (const s of [-1, 1]) EXS(h, rrect(0.04, 0.008, 0.004), 0.012, mat(0x505458, { roughness: 0.45 }), s * 0.05, H / 2 - 0.001, -0.004, 0, 0, s * -0.06, 0.002);
  // etiquetas de cinta escritas a mano
  const tape = tex('proto_tape', 256, 64, (c, w, hh) => { c.fillStyle = '#efe6b8'; c.fillRect(0, 0, w, hh); c.fillStyle = '#1a2a8a'; c.font = 'italic bold 30px "Comic Sans MS", cursive'; c.fillText('EVT2 #07 ok', 12, 42); c.strokeStyle = 'rgba(0,0,0,0.1)'; c.strokeRect(1, 1, w - 2, hh - 2); });
  P(h, 0.042, 0.011, tape, 0.04, 0.03, D / 2 + 0.0045, 0, 0, 0.08, { rough: 0.8 });
  const tape2 = tex('proto_tape2', 256, 64, (c, w, hh) => { c.fillStyle = '#e04830'; c.fillRect(0, 0, w, hh); c.fillStyle = '#fff'; c.font = 'bold 34px monospace'; c.fillText('CONFIDENCIAL', 8, 44); });
  P(h, 0.04, 0.01, tape2, -0.046, 0.029, D / 2 + 0.0045, 0, 0, -0.05, { rough: 0.8 });
  // tornillos visibles
  const sc = [];
  for (const [x, y] of [[-0.07, 0.022], [0.07, 0.022], [-0.06, -0.03], [0.06, -0.03]]) sc.push(gx(new THREE.CylinderGeometry(0.0022, 0.0022, 0.002, 12), x, y, D / 2 + 0.003, PI / 2, 0, 0));
  merged(h, sc, C.chrome());
  // cinta plana hacia la tarjeta de depuración (sale del costado derecho)
  const rib = tex('proto_rib', 64, 64, (c, w, hh) => { c.fillStyle = '#b8b8b8'; c.fillRect(0, 0, w, hh); c.fillStyle = 'rgba(0,0,0,0.25)'; for (let x = 0; x < w; x += 4) c.fillRect(x, 0, 1, hh); c.fillStyle = '#b02020'; c.fillRect(0, 0, 3, hh); }, true);
  const ribM = mat(0xffffff, { map: rib, roughness: 0.6, side: THREE.DoubleSide });
  add(g, ribbonGeo([[0.06, 0.086, -0.016], [0.09, 0.088, -0.02], [0.105, 0.06, -0.02], [0.09, 0.034, -0.018], [0.085, 0.031, 0.014]], 0.016, [0, 0, 1], 40), ribM);
  return ground(g);
};

// ---------- Palanca arcade chapada en oro ----------
BUILDERS_D.palanca_arcade_oro = () => {
  const g = new THREE.Group();
  const lac = lacquer(0x0d0d10);
  const au = gold(0.16);
  // cuerpo: perfil lateral (frente más bajo) extruido a lo ancho
  const Wd = 0.44, Dp = 0.25, hf = 0.05, hb = 0.068;
  const prof = poly([[-Dp / 2, 0.004], [-Dp / 2 + 0.004, 0], [Dp / 2 - 0.004, 0], [Dp / 2, 0.004], [Dp / 2, hb], [-Dp / 2, hf]]);
  EXS(g, prof, Wd - 0.012, lac, 0, 0, 0, 0, PI / 2, 0, 0.006);
  // molduras doradas en las aristas superiores
  const sl = Math.atan2(hb - hf, Dp);
  const trims = [];
  for (const s of [-1, 1]) trims.push(tubeGeo([[s * (Wd / 2), hf + 0.004, Dp / 2 + 0.004], [s * (Wd / 2), hb + 0.004, -Dp / 2 - 0.004]], 0.0035, 4, 8));
  trims.push(tubeGeo([[-Wd / 2, hf + 0.004, Dp / 2 + 0.004], [Wd / 2, hf + 0.004, Dp / 2 + 0.004]], 0.0035, 4, 8));
  trims.push(tubeGeo([[-Wd / 2, hb + 0.004, -Dp / 2 - 0.004], [Wd / 2, hb + 0.004, -Dp / 2 - 0.004]], 0.0035, 4, 8));
  merged(g, trims, au);
  // cubierta superior con arte art déco
  const top = grp(g, 0, (hf + hb) / 2 + 0.0065, 0, sl, 0, 0);
  const art = tex('stick_art', 1024, 576, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#141418'); gr.addColorStop(1, '#050507'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(226,176,74,0.9)'; c.lineWidth = 3;
    c.strokeRect(14, 14, w - 28, h - 28); c.lineWidth = 1; c.strokeRect(24, 24, w - 48, h - 48);
    // abanicos art déco
    for (const [x, y, r] of [[250, 300, 190], [800, 300, 230]]) for (let k = 0; k < 7; k++) { c.beginPath(); c.arc(x, y, r - k * 22, 0, TAU); c.globalAlpha = 0.18; c.stroke(); }
    c.globalAlpha = 1;
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; c.beginPath(); c.moveTo(250 + Math.cos(a) * 60, 300 + Math.sin(a) * 60); c.lineTo(250 + Math.cos(a) * 180, 300 + Math.sin(a) * 180); c.globalAlpha = 0.25; c.stroke(); }
    c.globalAlpha = 1; c.fillStyle = '#e2b04a'; c.font = 'bold 44px Georgia'; c.textAlign = 'center';
    c.fillText('CAMPEÓN NACIONAL · 1998', w / 2, 70);
    c.font = 'italic 26px Georgia'; c.fillText('Edición de torneo — 1 de 50', w / 2, h - 44);
  });
  RB(top, Wd - 0.02, 0.004, Dp - 0.02, 0.002, mat(0x0a0a0a, { roughness: 0.3 }), 0, -0.002, 0);
  P(top, Wd - 0.03, Dp - 0.03, art, 0, 0.0002, 0, -PI / 2, 0, 0, { rough: 0.3 });
  // placa acrílica encima
  const acr = B(top, Wd - 0.03, 0.003, Dp - 0.03, glassD(0xffffff, 0.12), 0, 0.0017, 0); acr.castShadow = false;
  // palanca: base, guardapolvo, eje, bola dorada
  const jx = -0.12, jz = 0.01;
  lathe(top, [[0, 0], [0.026, 0], [0.026, 0.0015], [0.012, 0.003], [0, 0.003]], au, jx, 0.003, jz, 0, 0, 0, 40);
  lathe(top, smooth([[0, 0.003], [0.0055, 0.003], [0.005, 0.02], [0.0045, 0.045], [0, 0.045]], 10), C.chrome(), jx, 0, jz, 0, 0, 0, 20);
  lathe(top, smooth([[0, 0.034], [0.006, 0.0345], [0.013, 0.04], [0.019, 0.05], [0.02, 0.06], [0.017, 0.07], [0.009, 0.077], [0, 0.079]], 32), au, jx, 0, jz, 0, 0, 0, 40);
  // botones cóncavos dorados (disposición de torneo)
  const btnGeo = latheGeo(smooth([[0, 0.006], [0.01, 0.0075], [0.0128, 0.0085], [0.0135, 0.007], [0.0135, 0], [0.0155, 0], [0.0155, 0.0015], [0, 0.0015]], 20), 32);
  const bts = [];
  const lay = [[0, 0.008], [0.036, -0.002], [0.072, -0.002], [0.108, 0.004], [0.002, -0.03], [0.038, -0.04], [0.074, -0.04], [0.11, -0.034]];
  for (const [x, z] of lay) bts.push(gx(btnGeo.clone(), x + 0.01, 0.003, -(z) + 0.005));
  merged(top, bts, au);
  // anillos negros alrededor de cada botón
  merged(top, lay.map(([x, z]) => gx(new THREE.TorusGeometry(0.0158, 0.0012, 6, 28), x + 0.01, 0.0035, -(z) + 0.005, PI / 2, 0, 0)), mat(0x050505, { roughness: 0.3 }));
  // inicio / selección en la arista trasera
  for (const x of [0.15, 0.18]) lathe(top, [[0, 0.003], [0.006, 0.003], [0.006, 0.007], [0, 0.0072]], C.chrome(), x, 0, -0.095, 0, 0, 0, 20);
  // patas de goma
  merged(g, [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => gx(new THREE.CylinderGeometry(0.012, 0.014, 0.004, 16), sx * (Wd / 2 - 0.03), -0.002, sz * (Dp / 2 - 0.03))), C.rubber());
  // cable trenzado enrollado
  const cab = [];
  cab.push([0.16, 0.035, -Dp / 2 - 0.002], [0.17, 0.03, -Dp / 2 - 0.03], [0.2, 0.008, -Dp / 2 - 0.05]);
  for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU * 1.6; cab.push([0.27 + Math.cos(a) * 0.05, 0.006 + i * 0.0003, -Dp / 2 - 0.06 + Math.sin(a) * 0.045]); }
  const brd = tex('braid', 64, 64, (c, w, h) => { c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c99a3a'; c.lineWidth = 3; for (let i = -64; i < 128; i += 10) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 64, h); c.stroke(); c.beginPath(); c.moveTo(i + 64, 0); c.lineTo(i, h); c.stroke(); } }, true);
  add(g, tubeGeo(cab, 0.0035, 160, 8), mat(0xffffff, { map: rep(brd, 1, 60), roughness: 0.6 }));
  return ground(g);
};

// ---------- Carta de primera edición en estuche graduado ----------
BUILDERS_D.carta_primera_edicion = () => {
  const g = new THREE.Group();
  // atril de nogal con ranura
  const wal = woodM('d_atril', '#5a3418', { rx: 2, ry: 1 });
  EXS(g, rrect(0.13, 0.07, 0.01), 0.018, wal, 0, 0.009, 0, -PI / 2, 0, 0, 0.003);
  EXS(g, poly([[-0.015, 0], [0.015, 0], [0.012, 0.022], [-0.01, 0.026]]), 0.11, wal, 0, 0.018, -0.006, 0, PI / 2, 0, 0.002);
  // estuche (slab) inclinado
  const s = grp(g, 0, 0.098, -0.002, -0.2, 0, 0);
  const W = 0.086, H = 0.146, D = 0.0075;
  const slab = add(s, rbGeo(W, H, D, 0.004), mat(0xf4f8ff, { transparent: true, opacity: 0.22, roughness: 0.03, metalness: 0.1, env: true, envI: 1.4, depthWrite: false }));
  slab.castShadow = false; slab.renderOrder = 3;
  // marco interior esmerilado
  const fr = rrect(W - 0.008, H - 0.008, 0.003); fr.holes.push(rrect(0.066, 0.092, 0.002, 0, -0.012, true));
  add(s, exGeo(fr, 0.004, 0.0005), mat(0xe8eef4, { transparent: true, opacity: 0.45, roughness: 0.35, depthWrite: false }));
  // etiqueta de grado
  const lbl = tex('grade_lbl', 512, 128, (c, w, h) => {
    c.fillStyle = '#f7f7f2'; c.fillRect(0, 0, w, h); c.fillStyle = '#b01818'; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10);
    c.fillStyle = '#111'; c.font = 'bold 26px system-ui'; c.fillText('1999 BESTIAS ELEMENTALES', 16, 44); c.font = '22px system-ui'; c.fillText('DRAGÓN DE FUEGO · HOLO · 1a EDICIÓN', 16, 78);
    c.font = 'bold 54px system-ui'; c.textAlign = 'right'; c.fillText('10', w - 20, 74); c.font = 'bold 18px system-ui'; c.fillText('GEMA PERFECTA', w - 16, 104);
    c.textAlign = 'left'; c.font = '16px monospace'; c.fillText('N.º 00418772', 16, 108);
  });
  P(s, W - 0.012, 0.022, lbl, 0, H / 2 - 0.019, 0.0005, 0, 0, 0, { rough: 0.4 });
  // carta holográfica (iridiscente)
  const cardArt = tex('card_art', 256, 360, (c, w, h) => {
    c.fillStyle = '#e8c23a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d8d0c0'; c.fillRect(10, 10, w - 20, h - 20);
    c.fillStyle = '#c03a20'; c.fillRect(14, 14, w - 28, h - 28);
    c.fillStyle = '#111'; c.font = 'bold 20px system-ui'; c.fillText('Dragón de Fuego', 22, 38); c.textAlign = 'right'; c.fillStyle = '#b00'; c.fillText('120 PS', w - 22, 38); c.textAlign = 'left';
    // ventana de arte con fondo holográfico
    const gr = c.createLinearGradient(0, 50, w, 200); ['#ff6a6a', '#ffd86a', '#8aff8a', '#6ad8ff', '#c08aff', '#ff6ad8'].forEach((cc, i) => gr.addColorStop(i / 5, cc));
    c.fillStyle = gr; c.fillRect(22, 50, w - 44, 150);
    for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(255,255,255,${0.15 + (i % 3) * 0.1})`; c.beginPath(); c.moveTo(128, 125); c.lineTo(128 + Math.cos(i / 40 * TAU) * 200, 125 + Math.sin(i / 40 * TAU) * 200); c.stroke(); }
    // silueta de dragón
    c.fillStyle = '#e0601a'; c.strokeStyle = '#401004'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(80, 190); c.quadraticCurveTo(90, 120, 130, 110); c.quadraticCurveTo(150, 80, 172, 92); c.lineTo(160, 104); c.quadraticCurveTo(176, 140, 150, 190); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#c84a10'; c.beginPath(); c.moveTo(118, 120); c.lineTo(60, 70); c.lineTo(78, 112); c.lineTo(46, 104); c.lineTo(100, 140); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#ffd000'; c.beginPath(); c.moveTo(150, 186); c.quadraticCurveTo(200, 180, 210, 150); c.quadraticCurveTo(222, 140, 214, 128); c.quadraticCurveTo(200, 150, 160, 168); c.fill();
    c.fillStyle = '#111'; c.beginPath(); c.arc(165, 98, 2.5, 0, TAU); c.fill();
    c.fillStyle = '#f2ecd8'; c.fillRect(22, 210, w - 44, 120);
    c.fillStyle = '#222'; c.font = 'bold 15px system-ui'; c.fillText('Llamarada', 30, 236); c.textAlign = 'right'; c.fillText('100', w - 30, 236); c.textAlign = 'left';
    c.font = '11px system-ui'; c.fillText('Descarta 4 energías de fuego para', 30, 256); c.fillText('usar este ataque.', 30, 270);
    c.fillStyle = '#111'; c.font = 'bold 12px system-ui'; c.fillText('1a EDICIÓN', 30, 318); c.fillText('4/102 ★', w - 90, 318);
  });
  const cardM = new THREE.MeshPhysicalMaterial({ map: cardArt, roughness: 0.25, metalness: 0.35, iridescence: 1, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 700], envMapIntensity: 1.2 });
  add(s, new THREE.PlaneGeometry(0.063, 0.088), cardM, 0, -0.012, 0.0004);
  add(s, new THREE.PlaneGeometry(0.063, 0.088), mat(0x2a3a8a, { roughness: 0.5 }), 0, -0.012, -0.0004, 0, PI, 0);
  // holograma de autenticidad en el reverso
  circleDecal(s, 0.007, tex('holo_seal', 64, 64, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); ['#c0c0ff', '#ffc0f0', '#c0fff0', '#fff0c0'].forEach((cc, i) => gr.addColorStop(i / 3, cc)); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.strokeStyle = '#888'; c.beginPath(); c.arc(32, 32, 24, 0, TAU); c.stroke(); }), 0, H / 2 - 0.02, -D / 2 - 0.0002, 0, PI, 0, { metalness: 0.7, roughness: 0.2 });
  return ground(g);
};

// ---------- Rockola en miniatura ----------
BUILDERS_D.rockola_miniatura = () => {
  const g = new THREE.Group();
  const W = 0.3, Hb = 0.3, R = W / 2, D = 0.15;
  const wal = woodM('d_rock', '#6a3a1a', { rx: 3, ry: 2, rough: 0.25, envI: 0.7 });
  // silueta frontal: rectángulo con arco superior
  const arch = (w, hb, r, cy = 0) => { const s = new THREE.Shape(); s.moveTo(-w / 2, cy); s.lineTo(w / 2, cy); s.lineTo(w / 2, cy + hb); s.absarc(0, cy + hb, w / 2, 0, PI, false); s.closePath(); return s; };
  EXS(g, arch(W, Hb, R, 0.012), D, wal, 0, 0, 0, 0, 0, 0, 0.006);
  // zócalo cromado
  RB(g, W + 0.02, 0.016, D + 0.02, 0.004, C.chrome(), 0, 0.008, 0);
  // bandas de arco luminosas (ámbar, rojo, verde) siguiendo el arco frontal
  const archPts = (rr, y0, n = 40) => { const p = []; p.push([-rr, 0.04, 0]); for (let i = 0; i <= n; i++) { const a = PI - i / n * PI; p.push([Math.cos(a) * rr, y0 + Math.sin(a) * rr, 0]); } p.push([rr, 0.04, 0]); return p; };
  const bands = [[R - 0.008, 0xffa020, 0.011], [R - 0.03, 0xe8302a, 0.008], [R - 0.047, 0x40c060, 0.006]];
  for (const [rr, col, t] of bands) {
    const pts = archPts(rr, Hb + 0.012).map(([x, y]) => [x, y, D / 2 + 0.006]);
    add(g, tubeGeo(pts, t, 120, 10), mat(col, { emissive: col, emissiveIntensity: 1.1, roughness: 0.25, transparent: true, opacity: 0.92 }));
  }
  // tubos de burbujas a los lados (vidrio + burbujas)
  for (const s of [-1, 1]) {
    const tb = add(g, new THREE.CylinderGeometry(0.0055, 0.0055, 0.2, 16, 1, true), glassD(0xff8030, 0.35), s * (R - 0.008), 0.15, D / 2 + 0.006); tb.castShadow = false;
    add(g, new THREE.CylinderGeometry(0.004, 0.004, 0.2, 12), emissive(0xff6a10, 0.9), s * (R - 0.008), 0.15, D / 2 + 0.006);
    const bub = []; const Rr = rng(5 + s);
    for (let i = 0; i < 14; i++) bub.push(gx(new THREE.SphereGeometry(0.0022 + Rr() * 0.0015, 8, 6), s * (R - 0.008) + (Rr() - 0.5) * 0.003, 0.06 + i * 0.013, D / 2 + 0.0105));
    merged(g, bub, mat(0xfff4d8, { emissive: 0xffe0a0, emissiveIntensity: 0.8, roughness: 0.1 }));
  }
  // ventana superior con carrusel de discos (en relieve sobre el frente)
  const winR = R - 0.062, z0 = D / 2 + 0.006, wy = Hb + 0.012 - 0.03;
  const win = new THREE.Shape(); win.absarc(0, 0, winR, 0, PI, false); win.closePath();
  add(g, exGeo(win, 0.003, 0.001), mat(0x1a120a, { roughness: 0.7 }), 0, wy, z0);
  const recs = [];
  for (let i = 0; i < 7; i++) recs.push(gx(new THREE.CylinderGeometry(0.04, 0.04, 0.0018, 36), -0.03 + i * 0.01, wy + 0.04, z0 + 0.02, 0, 0, PI / 2 - 0.25));
  merged(g, recs, mat(0x111111, { roughness: 0.25, env: true, envI: 0.6 }));
  lathe(g, [[0, 0], [0.006, 0], [0.006, 0.07], [0, 0.07]], C.chrome(), -0.035, wy + 0.04, z0 + 0.02, 0, 0, -PI / 2, 12);
  const dome = add(g, new THREE.SphereGeometry(winR, 40, 16, 0, PI, 0, PI / 2), glassD(0xfff0d8, 0.16), 0, wy, z0); dome.castShadow = false; dome.renderOrder = 3;
  dome.scale.set(1, 1, 0.45);
  add(g, new THREE.TorusGeometry(winR, 0.004, 8, 40, PI), C.chrome(), 0, wy, z0 + 0.002);
  // panel de selección con tiras de títulos
  const sel = tex('rock_sel', 512, 256, (c, w, h) => {
    c.fillStyle = '#efe6cc'; c.fillRect(0, 0, w, h);
    const R2 = rng(77);
    for (let col = 0; col < 4; col++) for (let row = 0; row < 6; row++) {
      const x = 10 + col * 125, y = 10 + row * 40;
      c.fillStyle = ['#c83a2a', '#2a5ac8', '#2a9a4a', '#d89a2a'][(col + row) % 4]; c.fillRect(x, y, 115, 6);
      c.fillStyle = '#222'; c.font = 'bold 13px Georgia'; c.fillText(['Bésame', 'Sabor a mí', 'Perfidia', 'Solamente', 'Amor', 'Noche', 'Cielito', 'Bolero'][(R2() * 8) | 0], x + 4, y + 22);
      c.font = '10px Georgia'; c.fillText(String.fromCharCode(65 + col) + (row + 1), x + 92, y + 22);
    }
  });
  RB(g, 0.2, 0.08, 0.012, 0.003, C.chrome(), 0, 0.2, D / 2 + 0.002);
  P(g, 0.186, 0.068, sel, 0, 0.2, D / 2 + 0.0085, 0, 0, 0, { glow: 0.35, rough: 0.3 });
  // botonera
  const kb = [];
  for (let i = 0; i < 10; i++) kb.push(gx(rbGeo(0.012, 0.006, 0.01, 0.002), -0.072 + i * 0.016, 0.152, D / 2 + 0.006));
  merged(g, kb, mat(0xf2ead8, { roughness: 0.3, env: true }));
  // rejilla cromada del altavoz
  const gr = new THREE.Shape(); gr.moveTo(-0.1, 0); gr.lineTo(0.1, 0); gr.lineTo(0.1, 0.08); gr.absarc(0, 0.08, 0.1, 0, PI, false); gr.closePath();
  for (let i = 0; i < 7; i++) gr.holes.push(rrect(0.008, 0.11 - Math.abs(i - 3) * 0.012, 0.004, -0.075 + i * 0.025, 0.07, true));
  add(g, exGeo(gr, 0.006, 0.0015), C.chrome(), 0, 0.035, D / 2 + 0.004).scale.set(0.85, 0.6, 1);
  add(g, new THREE.PlaneGeometry(0.16, 0.1), C.cloth(0x7a1a14), 0, 0.075, D / 2 + 0.001);
  // pilastras laterales con líneas cromadas
  for (const s of [-1, 1]) {
    RB(g, 0.012, 0.25, 0.014, 0.005, C.chrome(), s * (R + 0.002), 0.145, D / 2 - 0.004);
    RB(g, 0.004, Hb, D - 0.02, 0.0015, C.chrome(), s * (R + 0.006), Hb / 2 + 0.012, 0);
  }
  // corona de cromo con remate
  lathe(g, smooth([[0, 0], [0.014, 0], [0.012, 0.012], [0.006, 0.02], [0, 0.024]], 16), C.chrome(), 0, Hb + R + 0.012, 0, 0, 0, 0, 24);
  return ground(g);
};

// ---------- Robot de hojalata gigante ----------
BUILDERS_D.robot_hojalata_gigante = () => {
  const g = new THREE.Group();
  const litho = tex('robot_litho', 512, 512, (c, w, h) => {
    c.fillStyle = '#a62a22'; c.fillRect(0, 0, w, h);
    // paneles con remaches
    c.strokeStyle = '#3a0c08'; c.lineWidth = 4;
    for (let y = 0; y < h; y += 128) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.fillStyle = '#d8c070';
    for (let y = 14; y < h; y += 128) for (let x = 10; x < w; x += 28) { c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); c.fillStyle = '#f8e8a0'; c.beginPath(); c.arc(x - 1, y - 1, 1.5, 0, TAU); c.fill(); c.fillStyle = '#d8c070'; }
    // medidores impresos
    for (const [x, y] of [[90, 330], [420, 330], [90, 460], [420, 460]]) { c.fillStyle = '#efe6c8'; c.beginPath(); c.arc(x, y, 34, 0, TAU); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 3; c.stroke(); c.lineWidth = 2; for (let k = 0; k < 9; k++) { const a = PI + k / 8 * PI; c.beginPath(); c.moveTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); c.lineTo(x + Math.cos(a) * 32, y + Math.sin(a) * 32); c.stroke(); } c.strokeStyle = '#c00'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 18, y - 18); c.stroke(); }
    c.fillStyle = '#2a4ab0'; c.fillRect(200, 300, 110, 200); c.fillStyle = '#ffd040'; for (let i = 0; i < 5; i++) c.fillRect(214, 316 + i * 36, 82, 14);
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  const tin = mat(0xffffff, { map: litho, roughness: 0.3, metalness: 0.45, env: true, envI: 0.8 });
  const silver = metal(0xc8ccd0, 0.25);
  const blue = mat(0x2a4ab0, { roughness: 0.3, metalness: 0.4, env: true });
  // pies y piernas
  for (const s of [-1, 1]) {
    EXS(g, spl([[-0.035, 0], [0.035, 0], [0.045, 0.012], [0.03, 0.03], [-0.03, 0.03], [-0.04, 0.012]]), 0.075, blue, s * 0.05, 0, 0.005, 0, PI / 2, 0, 0.004);
    RB(g, 0.06, 0.1, 0.06, 0.008, tin, s * 0.05, 0.085, 0);
    RB(g, 0.066, 0.012, 0.066, 0.004, silver, s * 0.05, 0.135, 0);
  }
  // torso
  const ty = 0.145;
  RB(g, 0.2, 0.18, 0.13, 0.02, tin, 0, ty + 0.09, 0);
  RB(g, 0.21, 0.02, 0.14, 0.008, silver, 0, ty + 0.005, 0);
  RB(g, 0.21, 0.018, 0.14, 0.008, silver, 0, ty + 0.18, 0);
  // ventana del pecho con engranes de colores
  const win = new THREE.Shape(); win.absarc(0, 0, 0.05, 0, TAU, false); 
  const ringS = new THREE.Shape(); ringS.absarc(0, 0, 0.058, 0, TAU, false); ringS.holes.push(circ(0.049, 0, 0, true));
  add(g, exGeo(ringS, 0.008, 0.002), C.chrome(), 0, ty + 0.1, 0.066);
  add(g, new THREE.CircleGeometry(0.05, 40), mat(0x101010, { roughness: 0.8 }), 0, ty + 0.1, 0.058);
  const gearCols = [[0.026, 14, -0.018, 0.012, 0xe0b030], [0.02, 11, 0.022, 0.016, 0x30a0e0], [0.017, 10, 0.004, -0.024, 0x40c050], [0.012, 8, -0.026, -0.018, 0xe04040]];
  for (const [r, t, x, y, col] of gearCols) add(g, gearGeo(r, t, 0.004, { spokes: 4 }), mat(col, { metalness: 0.6, roughness: 0.3, env: true }), x, ty + 0.1 + y, 0.062, 0, 0, x);
  const gw = add(g, new THREE.CircleGeometry(0.05, 40), glassD(0xd8f0ff, 0.2), 0, ty + 0.1, 0.07); gw.castShadow = false;
  // brazos de acordeón
  const armPts = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; armPts.push([0.022 - t * 0.004 + (i % 2 ? 0.004 : 0), t * 0.13]); }
  for (const s of [-1, 1]) {
    const a = grp(g, s * 0.112, ty + 0.15, 0, 0, 0, s * 0.25);
    lathe(a, [[0, 0.02], [0.026, 0.02], [0.03, 0], [0, 0]].map(([r, y]) => [r, -y]), silver, 0, 0, 0, 0, 0, 0, 24);
    const arm = lathe(a, armPts, blue, 0, 0, 0, PI, 0, 0, 28);
    // pinza
    const cl = grp(a, 0, -0.14, 0, 0, 0, 0);
    lathe(cl, [[0, 0], [0.02, 0], [0.02, 0.012], [0, 0.014]], silver, 0, -0.012, 0, 0, 0, 0, 24);
    for (const k of [-1, 1]) EXS(cl, spl([[0, 0], [0.012, -0.01], [0.016, -0.04], [0.006, -0.05], [0.004, -0.03], [0, -0.012]]), 0.012, silver, k * 0.004, -0.012, 0, 0, k < 0 ? PI : 0, 0, 0.002);
  }
  // cuello y cabeza
  lathe(g, [[0, 0], [0.04, 0], [0.036, 0.01], [0.036, 0.02], [0, 0.02]], silver, 0, ty + 0.19, 0, 0, 0, 0, 32);
  const hy = ty + 0.21;
  const head = tex('robot_face', 512, 256, (c, w, h) => { c.fillStyle = '#b8bec4'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a8088'; for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 2, h); c.fillStyle = '#d0a020'; for (let x = 8; x < w; x += 32) { c.beginPath(); c.arc(x, 14, 3, 0, TAU); c.fill(); c.beginPath(); c.arc(x, h - 14, 3, 0, TAU); c.fill(); } });
  RB(g, 0.15, 0.12, 0.12, 0.018, mat(0xffffff, { map: head, metalness: 0.6, roughness: 0.25, env: true }), 0, hy + 0.06, 0);
  // ojos: cuencas cromadas con lente roja encendida
  for (const s of [-1, 1]) {
    lathe(g, smooth([[0, 0], [0.022, 0], [0.024, 0.006], [0.018, 0.012], [0, 0.012]], 12), C.chrome(), s * 0.036, hy + 0.075, 0.06, PI / 2, 0, 0, 28);
    lathe(g, smooth([[0, 0.012], [0.014, 0.012], [0.01, 0.02], [0, 0.022]], 10), mat(0xff3010, { emissive: 0xff2000, emissiveIntensity: 1.4, roughness: 0.1 }), s * 0.036, hy + 0.075, 0.06, PI / 2, 0, 0, 24);
  }
  // boca de rejilla
  const mouth = rrect(0.08, 0.024, 0.006); for (let i = 0; i < 6; i++) mouth.holes.push(rrect(0.004, 0.014, 0.002, -0.025 + i * 0.01, 0, true));
  add(g, exGeo(mouth, 0.004, 0.001), C.chrome(), 0, hy + 0.03, 0.061);
  add(g, new THREE.PlaneGeometry(0.07, 0.016), mat(0x0a0a0a), 0, hy + 0.03, 0.0595);
  // orejas
  for (const s of [-1, 1]) lathe(g, smooth([[0, 0], [0.025, 0], [0.022, 0.012], [0.012, 0.02], [0, 0.022]], 16), blue, s * 0.075, hy + 0.06, 0, 0, 0, -s * PI / 2, 28);
  // cúpula de cristal con antena de chispa
  const dm = lathe(g, smooth([[0.04, 0], [0.04, 0.012], [0.03, 0.035], [0.015, 0.045], [0, 0.047]], 20), glassD(0xff9a50, 0.4), 0, hy + 0.12, 0, 0, 0, 0, 36); dm.castShadow = false;
  lathe(g, [[0, 0], [0.044, 0], [0.044, 0.006], [0, 0.006]], C.chrome(), 0, hy + 0.117, 0, 0, 0, 0, 36);
  const sp = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; sp.push(gx(new THREE.ConeGeometry(0.004, 0.025, 6), Math.cos(a) * 0.012, hy + 0.135, Math.sin(a) * 0.012, Math.sin(a) * 0.6, 0, -Math.cos(a) * 0.6)); }
  merged(g, sp, mat(0xffe060, { emissive: 0xffa020, emissiveIntensity: 1.5 }));
  CY(g, 0.003, 0.004, 0.08, C.chrome(), 0, hy + 0.2, 0, 0, 0, 0, 10);
  lathe(g, smooth([[0, 0], [0.008, 0.004], [0.01, 0.012], [0.006, 0.02], [0, 0.022]], 12), mat(0xff3020, { emissive: 0xff2000, emissiveIntensity: 1.2 }), 0, hy + 0.24, 0, 0, 0, 0, 20);
  // llave de cuerda en la espalda
  const key = new THREE.Shape(); key.absarc(-0.022, 0, 0.018, PI / 2, 3 * PI / 2, false); key.lineTo(0.022, -0.018); key.absarc(0.022, 0, 0.018, -PI / 2, PI / 2, false); key.closePath();
  key.holes.push(circ(0.009, -0.024, 0, true)); key.holes.push(circ(0.009, 0.024, 0, true));
  add(g, exGeo(key, 0.004, 0.0015), brass(), 0, ty + 0.11, -0.1);
  CY(g, 0.004, 0.004, 0.035, brass(), 0, ty + 0.11, -0.08, PI / 2, 0, 0, 10);
  // caja original detrás (cartón litografiado)
  const box = tex('robot_box', 512, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1a2a6a'); gr.addColorStop(1, '#3a0a4a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); for (let i = 0; i < 120; i++) { c.fillStyle = '#fff'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } c.fillStyle = '#ffd030'; c.font = 'bold italic 64px Georgia'; c.fillText('ROBOT ATÓMICO', 26, 110); c.fillStyle = '#ff5030'; c.font = 'bold 28px system-ui'; c.fillText('¡CAMINA · CHISPEA · LUCES!', 30, 170); c.fillStyle = '#fff'; c.font = '20px system-ui'; c.fillText('Juguete de cuerda · Hecho en Japón', 30, 220); });
  RB(g, 0.34, 0.012, 0.16, 0.003, mat(0xffffff, { map: box, roughness: 0.8 }), 0.0, -0.006, -0.03);
  return ground(g);
};

// ---------- Bláster de utilería ----------
BUILDERS_D.blaster_utileria = () => {
  const g = new THREE.Group();
  // base de exhibición de nogal con dos horquillas
  const wal = woodM('d_blbase', '#4a2a14', { rx: 2, ry: 1, rough: 0.3 });
  slabBase(g, 0.36, 0.13, 0.026, wal, { trim: brass() });
  plaque(g, 'UTILERÍA ORIGINAL', 'Rodaje 1977 · Unidad B', 0.09, 0.022, 0, 0.013, 0.0655);
  const fork = spl([[-0.012, 0], [0.012, 0], [0.01, 0.05], [0.016, 0.07], [0.008, 0.074], [0.0, 0.058], [-0.008, 0.074], [-0.016, 0.07], [-0.01, 0.05]]);
  for (const x of [-0.07, 0.07]) EXS(g, fork, 0.012, mat(0x1a1a1a, { roughness: 0.4, env: true }), x, 0.026, 0, 0, 0, 0, 0.002);
  // pistola
  const gun = grp(g, 0, 0.107, 0);
  const worn = mat(0xffffff, { map: wornTex('blaster', '#2a2c30', { chips: 70, chipCol: '#9ca0a6' }), metalness: 0.6, roughness: 0.45, env: true });
  const worn2 = mat(0xffffff, { map: wornTex('blaster2', '#3a3a34', { chips: 40, chipCol: '#a8a090' }), metalness: 0.4, roughness: 0.55, env: true });
  // receptor
  EXS(gun, spl([[-0.1, -0.012], [0.03, -0.016], [0.07, -0.01], [0.075, 0.018], [0.03, 0.028], [-0.06, 0.028], [-0.11, 0.02], [-0.118, 0.0]]), 0.032, worn, 0, 0, 0, 0, 0, 0, 0.004);
  // empuñadura con estrías
  const grip = spl([[-0.1, -0.008], [-0.06, -0.01], [-0.075, -0.06], [-0.088, -0.1], [-0.11, -0.105], [-0.125, -0.095], [-0.116, -0.05]]);
  EXS(gun, grip, 0.028, worn2, 0, 0, 0, 0, 0, 0, 0.005);
  const gtex = tex('grip_tex', 64, 128, (c, w, h) => { c.fillStyle = '#2a1a10'; c.fillRect(0, 0, w, h); c.strokeStyle = '#120a04'; c.lineWidth = 2; for (let y = 0; y < h; y += 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y + 4); c.stroke(); } }, true);
  for (const s of [-1, 1]) EXS(gun, spl([[-0.068, -0.02], [-0.078, -0.06], [-0.09, -0.092], [-0.108, -0.094], [-0.106, -0.05], [-0.094, -0.02]]), 0.004, mat(0xffffff, { map: gtex, roughness: 0.7 }), 0, 0, s * 0.017, 0, 0, 0, 0.0015);
  // guardamonte y gatillo
  const tg = new THREE.Shape(); tg.moveTo(-0.06, -0.012); tg.quadraticCurveTo(-0.055, -0.045, -0.02, -0.045); tg.lineTo(-0.005, -0.045); tg.lineTo(-0.005, -0.012); tg.lineTo(-0.012, -0.012); tg.lineTo(-0.012, -0.039); tg.lineTo(-0.02, -0.039); tg.quadraticCurveTo(-0.048, -0.039, -0.052, -0.012); tg.closePath();
  EXS(gun, tg, 0.008, worn, 0, 0, 0, 0, 0, 0, 0.0015);
  EXS(gun, spl([[-0.033, -0.012], [-0.026, -0.016], [-0.028, -0.032], [-0.036, -0.03], [-0.036, -0.016]]), 0.005, C.steel(), 0, 0, 0, 0, 0, 0, 0.001);
  // cañón con aletas de enfriamiento y supresor
  const bar = [[0, 0], [0.013, 0], [0.013, 0.02]];
  for (let i = 0; i < 8; i++) { const y = 0.024 + i * 0.011; bar.push([0.011, y], [0.017, y + 0.002], [0.017, y + 0.006], [0.011, y + 0.008]); }
  bar.push([0.011, 0.12], [0.014, 0.122], [0.014, 0.15], [0.01, 0.155], [0.006, 0.155], [0.006, 0.14], [0, 0.14]);
  lathe(gun, bar, worn, 0.06, 0.006, 0, 0, 0, -PI / 2, 28);
  // ranuras del supresor
  const sl = []; for (let i = 0; i < 6; i++) sl.push(gx(new THREE.BoxGeometry(0.018, 0.003, 0.03), 0.198, 0.006, 0, i / 6 * PI, 0, 0));
  merged(gun, sl, mat(0x080808, { roughness: 0.8 }));
  // mira telescópica
  lathe(gun, smooth([[0, 0], [0.012, 0], [0.012, 0.01], [0.009, 0.02], [0.009, 0.09], [0.0115, 0.1], [0.0115, 0.115], [0, 0.115]], 40), worn, -0.075, 0.047, 0, 0, 0, -PI / 2, 28);
  for (const x of [-0.06, 0.01]) EXS(gun, poly([[-0.008, 0], [0.008, 0], [0.006, 0.012], [-0.006, 0.012]]), 0.01, worn2, x, 0.028, 0, 0, 0, 0, 0.001);
  for (const [x, rz] of [[0.041, -PI / 2], [-0.075, PI / 2]]) add(gun, new THREE.CircleGeometry(0.0095, 24), gem(0x4a90c0, { opacity: 0.85, flat: false, emissive: 0x103050, ei: 0.6 }), x, 0.047, 0, 0, rz > 0 ? -PI / 2 : PI / 2, 0);
  // célula de energía lateral con contactos de cobre
  lathe(gun, smooth([[0, 0], [0.011, 0], [0.012, 0.006], [0.012, 0.05], [0.011, 0.056], [0, 0.056]], 16), worn2, -0.04, 0.004, 0.026, 0, 0, -PI / 2, 24);
  const rings = []; for (let i = 0; i < 4; i++) rings.push(gx(new THREE.TorusGeometry(0.012, 0.0015, 6, 24), -0.03 + i * 0.012, 0.004, 0.026, 0, PI / 2, 0));
  merged(gun, rings, C.copper());
  // cables de colores
  TU(gun, [[-0.04, 0.012, 0.03], [-0.06, 0.024, 0.024], [-0.09, 0.022, 0.018]], 0.0022, mat(0xb02a1a, { roughness: 0.5 }), false, 16);
  TU(gun, [[0.016, 0.01, 0.03], [0.03, 0.022, 0.022], [0.05, 0.02, 0.018]], 0.0022, mat(0xd8b020, { roughness: 0.5 }), false, 16);
  // perilla de potencia
  lathe(gun, [[0, 0], [0.008, 0], [0.008, 0.006], [0.005, 0.009], [0, 0.009]], C.chrome(), 0.03, 0.006, 0.016, PI / 2, 0, 0, 20);
  return ground(g);
};

// ---------- Bola de cristal con nebulosa ----------
BUILDERS_D.bola_cristal_nebulosa = () => {
  const g = new THREE.Group();
  const bronze = metal(0x7a5228, 0.35);
  const bronzeD = mat(0xffffff, { map: wornTex('bronze_pat', '#7a5228', { chips: 90, chipCol: '#2f6a58', scratches: 60 }), metalness: 0.85, roughness: 0.38, env: true });
  // pedestal torneado de bronce
  const pr = smooth([[0, 0], [0.085, 0], [0.088, 0.008], [0.08, 0.016], [0.06, 0.024], [0.045, 0.04], [0.038, 0.06], [0.042, 0.075], [0.05, 0.085], [0.055, 0.09], [0.05, 0.088], [0.03, 0.08], [0, 0.077]], 48);
  lathe(g, pr, bronzeD, 0, 0, 0, 0, 0, 0, 64);
  // runas grabadas alrededor del pedestal
  const runes = tex('runes', 1024, 64, (c, w, h) => { c.fillStyle = '#6a4420'; c.fillRect(0, 0, w, h); c.strokeStyle = '#e8c070'; c.lineWidth = 3; const R = rng(4); for (let i = 0; i < 28; i++) { const x = 18 + i * 36; c.beginPath(); c.moveTo(x, 12); for (let k = 0; k < 4; k++) c.lineTo(x + (R() - 0.5) * 22, 12 + R() * 40); c.stroke(); } });
  const band = add(g, new THREE.CylinderGeometry(0.0405, 0.0385, 0.016, 48, 1, true), mat(0xffffff, { map: runes, metalness: 0.8, roughness: 0.35, env: true }), 0, 0.064, 0);
  // garras que sujetan la bola (barridos)
  const Rb = 0.075, cy = 0.152;
  for (let k = 0; k < 3; k++) {
    const a = k / 3 * TAU + PI / 6;
    const pt = (r, y) => [Math.cos(a) * r, y, Math.sin(a) * r];
    SW(g, [pt(0.05, 0.085), pt(0.07, 0.1), pt(0.082, 0.13), pt(0.078, 0.165), pt(0.064, 0.19)], [0.012, 0.011, 0.009, 0.006, 0.003], bronze, 10, 30);
    // espolones laterales
    for (const d of [-0.35, 0.35]) {
      const b = a + d, ptb = (r, y) => [Math.cos(b) * r, y, Math.sin(b) * r];
      SW(g, [pt(0.07, 0.1), ptb(0.078, 0.12), ptb(0.083, 0.145), ptb(0.078, 0.165)], [0.007, 0.006, 0.004, 0.002], bronze, 8, 20);
    }
  }
  // esfera de cristal
  const ball = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0, transmission: 0.9, thickness: 0.05, ior: 1.5, transparent: true, opacity: 0.35, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false });
  const bm = add(g, new THREE.SphereGeometry(Rb, 48, 32), ball, 0, cy, 0); bm.castShadow = false; bm.renderOrder = 4;
  // nebulosa interior (capas aditivas)
  const neb = (key, hue) => tex('neb_' + key, 512, 256, (c, w, h) => {
    c.fillStyle = '#000'; c.fillRect(0, 0, w, h);
    const R = rng(hue);
    for (let i = 0; i < 40; i++) { const x = R() * w, y = h * 0.2 + R() * h * 0.6, r = 20 + R() * 70; const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `hsla(${hue + R() * 60},90%,60%,0.35)`); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${R()})`; c.fillRect(R() * w, R() * h, 1.5, 1.5); }
  });
  for (const [r, hue, rot] of [[0.9, 280, 0], [0.72, 190, 1.2], [0.5, 330, 2.3]]) {
    const m = new THREE.MeshBasicMaterial({ map: neb('l' + hue, hue), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const s = add(g, new THREE.SphereGeometry(Rb * r, 32, 20), m, 0, cy, 0, rot, rot * 0.7, 0.3); s.castShadow = false; s.receiveShadow = false; s.renderOrder = 2;
  }
  const core = add(g, new THREE.SphereGeometry(0.008, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe8ff }), 0.006, cy + 0.004, 0); core.castShadow = false;
  // aro de bronce de asiento
  add(g, new THREE.TorusGeometry(0.05, 0.004, 10, 48), bronze, 0, 0.092, 0, PI / 2, 0, 0);
  return ground(g);
};

// ---------- Chac Mool en miniatura ----------
BUILDERS_D.chac_mool_miniatura = () => {
  const g = new THREE.Group();
  const lime = mat(0xffffff, { map: stoneTex('caliza', [196, 184, 158], { pits: 500, veins: 3 }), roughness: 0.92 });
  const limeD = mat(0xffffff, { map: stoneTex('caliza_d', [168, 156, 132], { pits: 300, veins: 2 }), roughness: 0.95 });
  // plataforma rectangular con talud
  EXS(g, rrect(0.36, 0.17, 0.006), 0.022, limeD, 0, 0.011, 0, -PI / 2, 0, 0, 0.004);
  EXS(g, rrect(0.33, 0.15, 0.004), 0.012, lime, 0, 0.028, 0, -PI / 2, 0, 0, 0.003);
  const f = grp(g, 0, 0.034, 0);
  const N = noise3(31);
  const rough = (geo, k = 0.0025) => displace(geo, (x, y, z) => N(x * 60, y * 60, z * 60) * k);
  // torso reclinado (más ancho en z)
  add(f, rough(swGeo([[0.06, 0.032, 0], [0.02, 0.05, 0], [-0.025, 0.07, 0], [-0.06, 0.088, 0]], [0.036, 0.034, 0.032, 0.03], 16, 24, 1.45)), lime);
  // hombros (tapas)
  add(f, rough(new THREE.SphereGeometry(0.032, 16, 12).scale(1, 0.9, 1.5)), lime, -0.062, 0.09, 0);
  add(f, rough(new THREE.SphereGeometry(0.036, 16, 12).scale(1.1, 0.9, 1.4)), lime, 0.064, 0.032, 0);
  // piernas: muslos hacia arriba, espinillas hacia abajo, pies planos
  for (const s of [-1, 1]) {
    add(f, rough(swGeo([[0.07, 0.035, s * 0.03], [0.11, 0.08, s * 0.032], [0.14, 0.112, s * 0.032]], [0.023, 0.021, 0.019], 12, 16)), lime);
    add(f, rough(swGeo([[0.142, 0.115, s * 0.032], [0.162, 0.07, s * 0.03], [0.172, 0.022, s * 0.028]], [0.019, 0.016, 0.014], 12, 16)), lime);
    add(f, new THREE.SphereGeometry(0.02, 14, 10), lime, 0.142, 0.114, s * 0.032);
    RB(f, 0.05, 0.016, 0.028, 0.006, lime, 0.188, 0.008, s * 0.03);
    // brazaletes / ajorcas en tobillos
    add(f, new THREE.TorusGeometry(0.016, 0.004, 8, 20), limeD, 0.17, 0.03, s * 0.028, PI / 2 + 0.2, 0, 0);
  }
  // brazos: hombro → codo apoyado en la plataforma → manos sobre el vientre
  for (const s of [-1, 1]) {
    add(f, rough(swGeo([[-0.06, 0.09, s * 0.05], [-0.05, 0.05, s * 0.062], [-0.038, 0.012, s * 0.066]], [0.016, 0.015, 0.014], 12, 16)), lime);
    add(f, new THREE.SphereGeometry(0.0145, 12, 10), lime, -0.038, 0.012, s * 0.066);
    add(f, rough(swGeo([[-0.038, 0.012, s * 0.066], [0.0, 0.04, s * 0.06], [0.02, 0.07, s * 0.035]], [0.0145, 0.013, 0.012], 12, 16)), lime);
    RB(f, 0.03, 0.012, 0.022, 0.005, lime, 0.026, 0.074, s * 0.028, 0, 0, -0.4);
    add(f, new THREE.TorusGeometry(0.014, 0.0035, 8, 20), limeD, -0.01, 0.034, s * 0.062, 0.3, PI / 2, 0.7);
  }
  // recipiente de ofrendas sobre el vientre
  lathe(f, smooth([[0, 0], [0.026, 0], [0.034, 0.008], [0.036, 0.014], [0.03, 0.016], [0.02, 0.012], [0, 0.011]], 20), limeD, 0.02, 0.078, 0, 0, 0, -0.32, 32);
  // cabeza girada al frente (+z)
  const hd = grp(f, -0.085, 0.13, 0.01, 0, 0, 0.1);
  add(hd, rough(new THREE.SphereGeometry(0.03, 20, 16).scale(0.95, 1.12, 0.9), 0.002), lime);
  // tocado cuadrado
  RB(hd, 0.07, 0.022, 0.058, 0.006, limeD, 0, 0.03, -0.004);
  RB(hd, 0.064, 0.05, 0.012, 0.004, limeD, 0, 0.004, -0.03);
  // orejeras circulares
  for (const s of [-1, 1]) {
    lathe(hd, [[0, 0], [0.015, 0], [0.015, 0.006], [0.008, 0.008], [0, 0.008]], limeD, s * 0.031, 0.002, 0, 0, 0, -s * PI / 2, 20);
  }
  // rostro tallado (cejas, ojos, nariz, boca)
  const face = tex('chac_face', 256, 256, (c, w, h) => {
    c.fillStyle = '#c4b89e'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(60,45,30,0.75)'; c.strokeStyle = 'rgba(60,45,30,0.85)'; c.lineWidth = 6;
    c.fillRect(46, 92, 64, 18); c.fillRect(146, 92, 64, 18);
    c.beginPath(); c.moveTo(128, 100); c.lineTo(110, 168); c.lineTo(146, 168); c.stroke();
    c.fillRect(88, 192, 80, 12);
    for (let i = 0; i < 800; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  add(hd, new THREE.SphereGeometry(0.0302, 20, 12, PI / 2 - 0.7, 1.4, PI / 2 - 0.65, 1.3).scale(0.95, 1.12, 0.92), texM(face, { roughness: 0.9 }));
  // collar de placas
  add(f, new THREE.TorusGeometry(0.03, 0.006, 8, 24, PI * 1.2), limeD, -0.07, 0.105, 0, 0, 0, 0.9);
  return ground(g);
};

// ---------- Rebozo de seda en caja de Olinalá ----------
BUILDERS_D.rebozo_seda_caja = () => {
  const g = new THREE.Group();
  const olin = tex('olinala', 512, 256, (c, w, h) => {
    c.fillStyle = '#141018'; c.fillRect(0, 0, w, h);
    const R = rng(12);
    c.strokeStyle = '#c8a040'; c.lineWidth = 3; c.strokeRect(8, 8, w - 16, h - 16);
    for (let i = 0; i < 22; i++) {
      const x = 30 + R() * (w - 60), y = 30 + R() * (h - 60), r = 8 + R() * 14, col = ['#e8402a', '#f0b020', '#3aa0d8', '#e870a0', '#5ab040'][(R() * 5) | 0];
      c.fillStyle = col; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(x + Math.cos(k) * r * 0.6, y + Math.sin(k) * r * 0.6, r * 0.5, r * 0.25, k, 0, TAU); c.fill(); }
      c.fillStyle = '#ffe080'; c.beginPath(); c.arc(x, y, r * 0.25, 0, TAU); c.fill();
      c.strokeStyle = '#4a8a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 20, y + 10, x + 30 * (R() - 0.5), y + 30); c.stroke();
    }
    // pajarito
    c.fillStyle = '#2a8ad8'; c.beginPath(); c.ellipse(w / 2, h / 2, 26, 14, -0.3, 0, TAU); c.fill(); c.beginPath(); c.moveTo(w / 2 + 20, h / 2 - 8); c.lineTo(w / 2 + 34, h / 2 - 14); c.lineTo(w / 2 + 22, h / 2); c.fill();
  });
  const lac = mat(0xffffff, { map: rep(olin, 2.5, 5), roughness: 0.25, env: true, envI: 0.6 });
  const lacIn = lacquer(0xb8402a);
  const W = 0.4, D = 0.22, H = 0.11, t = 0.012;
  // caja: paredes con lados decorados
  const wall = rrect(W, D, 0.01); wall.holes.push(rrect(W - 2 * t, D - 2 * t, 0.004, 0, 0, true));
  EXS(g, wall, H, lac, 0, H / 2, 0, -PI / 2, 0, 0, 0.002);
  RB(g, W - 0.01, 0.01, D - 0.01, 0.003, lacIn, 0, 0.005, 0);
  // tapa abierta hacia atrás
  const lid = grp(g, 0, H, -D / 2, -1.85, 0, 0);
  RB(lid, W + 0.006, 0.014, D + 0.006, 0.006, lac, 0, 0.007, D / 2);
  RB(lid, W - 0.02, 0.003, D - 0.02, 0.002, lacIn, 0, -0.0005, D / 2);
  P(lid, W - 0.04, D - 0.04, olin, 0, -0.0022, D / 2, PI / 2, 0, PI, { rough: 0.3 });
  P(lid, W - 0.01, D - 0.01, olin, 0, 0.0142, D / 2, -PI / 2, 0, 0, { rough: 0.3 });
  // bisagras
  for (const s of [-1, 1]) CY(g, 0.004, 0.004, 0.03, brass(), s * 0.12, H, -D / 2 - 0.002, 0, 0, PI / 2, 12);
  // rebozo doblado (capas onduladas) con jaspe
  const jaspe = tex('jaspe2', 512, 512, (c, w, h) => {
    c.fillStyle = '#16244e'; c.fillRect(0, 0, w, h);
    const R = rng(8);
    // urdimbre jaspeada: motas difusas en bandas verticales
    for (let x = 0; x < w; x += 3) {
      const band = Math.floor(x / 48) % 4;
      for (let y = 0; y < h; y += 36) {
        const off = Math.sin(x * 0.12) * 10 + (band % 2) * 18;
        c.fillStyle = band === 3 ? 'rgba(200,150,70,0.75)' : 'rgba(232,228,214,0.8)';
        const len = 12 + Math.abs(Math.sin(x * 0.05 + y)) * 14;
        c.fillRect(x, y + off, 2.2, len);
      }
    }
    c.filter = 'blur(1px)'; c.drawImage(c.canvas, 0, 0); c.filter = 'none';
    for (let y = 0; y < h; y += 2) { c.fillStyle = 'rgba(255,255,255,0.04)'; c.fillRect(0, y, w, 1); }
    // franjas laterales lisas
    c.fillStyle = '#7a1a2a'; c.fillRect(0, 0, 10, h); c.fillRect(w - 10, 0, 10, h);
  }, true);
  const silk = mat(0xffffff, { map: rep(jaspe, 1.5, 1), roughness: 0.38, metalness: 0.15, env: true, envI: 0.5, side: THREE.DoubleSide });
  const layers = 5;
  for (let i = 0; i < layers; i++) {
    const geo = new THREE.BoxGeometry(W - 0.04 - i * 0.004, 0.008, D - 0.04 - i * 0.002, 24, 1, 12);
    warp(geo, (x, y, z) => [x, y + Math.sin(x * 22 + i) * 0.002 + Math.cos(z * 30 + i * 2) * 0.0015 + (1 - Math.min(1, Math.abs(x) / 0.18) ** 4) * 0.004, z]);
    add(g, geo, silk, 0, 0.016 + i * 0.0085, 0);
  }
  // pliegue suave sobre el borde frontal con rapacejo colgando
  const drape = ribbonGeo([[0, 0.058, 0.07], [0, 0.064, 0.1], [0, 0.06, 0.115], [0, 0.03, 0.122], [0, -0.0, 0.123]], 0.3, [1, 0, 0], 30);
  add(g, drape, silk, 0.02, 0.0, 0);
  const fringe = tex('rapacejo', 512, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.strokeStyle = '#1a2a5a'; c.lineWidth = 2;
    for (let x = 4; x < w; x += 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (x % 16 ? 4 : -4), 30); c.lineTo(x, 60); c.stroke(); }
    c.fillStyle = '#1a2a5a'; for (let x = 8; x < w; x += 16) { c.beginPath(); c.arc(x, 30, 3, 0, TAU); c.fill(); c.beginPath(); c.arc(x + 8, 60, 3, 0, TAU); c.fill(); }
    c.lineWidth = 1.5; for (let x = 2; x < w; x += 3) { c.beginPath(); c.moveTo(x, 60); c.lineTo(x + Math.sin(x) * 2, h); c.stroke(); }
  });
  add(g, ribbonGeo([[0, 0.0, 0.123], [0, -0.04, 0.121]], 0.3, [1, 0, 0], 4), mat(0xffffff, { map: fringe, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide, roughness: 0.6 }), 0.02, 0.0, 0);
  return ground(g);
};

// ---------- Juego de plumas de oro en estuche ----------
BUILDERS_D.plumas_oro_estuche = () => {
  const g = new THREE.Group();
  const leather = C.leather(0x3a1a0e);
  const vel = velvet('plumas', '#1a2450');
  const W = 0.24, D = 0.11, H = 0.028;
  const wall = rrect(W, D, 0.012); wall.holes.push(rrect(W - 0.012, D - 0.012, 0.008, 0, 0, true));
  EXS(g, wall, H, leather, 0, H / 2, 0, -PI / 2, 0, 0, 0.003);
  RB(g, W - 0.01, H - 0.008, D - 0.01, 0.006, vel, 0, (H - 0.008) / 2, 0);
  // tapa abierta (acolchada en satén)
  const lid = grp(g, 0, H, -D / 2, -1.92, 0, 0);
  EXS(lid, rrect(W, D, 0.012), 0.016, leather, 0, 0.008, D / 2, -PI / 2, 0, 0, 0.003);
  const satin = tex('satin_lid', 512, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2ead8'); gr.addColorStop(0.5, '#fffaf0'); gr.addColorStop(1, '#e6dcc4'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#b08830'; c.font = 'italic bold 40px Georgia'; c.textAlign = 'center'; c.fillText('Maison Ortiz', w / 2, h / 2); c.font = '22px Georgia'; c.fillText('ORO 18 K · GUILLOCHÉ', w / 2, h / 2 + 36); });
  P(lid, W - 0.014, D - 0.014, satin, 0, -0.0042, D / 2, PI / 2, 0, 0, { rough: 0.4 });
  // broche de oro
  RB(g, 0.02, 0.012, 0.004, 0.002, gold(), 0, H - 0.002, D / 2 + 0.002);
  // pluma fuente
  const bodyM = mat(0xffffff, { map: rep(barleyTex('pen', '#e0ae48'), 4, 1), metalness: 1, roughness: 0.22, env: true });
  const pen = (z, kind) => {
    const p = grp(g, 0, H - 0.002 + 0.0035, z, 0, 0, 0);
    const q = grp(p, 0, 0, 0, 0, 0, PI / 2); // eje del lathe a lo largo de x
    const L = 0.14;
    // cuerpo con guilloché
    lathe(q, smooth([[0, 0], [0.0045, 0.002], [0.0058, 0.015], [0.0062, 0.07], [0.0062, 0.076]], 24), kind === 'pen' ? gold(0.18) : bodyM, 0, -L / 2, 0, 0, 0, 0, 24);
    lathe(q, [[0.0062, 0.076], [0.0068, 0.077], [0.0068, 0.082], [0.0066, 0.083]], C.chrome(), 0, -L / 2, 0, 0, 0, 0, 24);
    lathe(q, smooth([[0.0066, 0.083], [0.0066, 0.13], [0.0058, 0.137], [0.004, 0.141], [0, 0.142]], 20), kind === 'pen' ? bodyM : gold(0.18), 0, -L / 2, 0, 0, 0, 0, 24);
    // clip
    EXS(q, spl([[-0.0012, 0.08], [0.0012, 0.08], [0.0014, 0.13], [0, 0.134], [-0.0014, 0.13]]), 0.0016, gold(0.15), 0, -L / 2, 0.0075, 0, 0, 0, 0.0005);
    lathe(q, [[0, 0], [0.0015, 0], [0.0012, 0.004], [0, 0.004]], gold(), 0, -L / 2 + 0.084, 0.0084, PI / 2, 0, 0, 10);
    if (kind === 'pen') {
      // plumín bicolor
      const nib = new THREE.Shape(); nib.moveTo(-0.0045, 0); nib.quadraticCurveTo(-0.004, 0.014, 0, 0.022); nib.quadraticCurveTo(0.004, 0.014, 0.0045, 0); nib.closePath();
      const nb = add(q, exGeo(nib, 0.0008, 0.0003), gold(0.12), 0, -L / 2 - 0.02, 0.001, 0, 0, 0); nb.rotation.x = -0.12;
      add(q, new THREE.BoxGeometry(0.0004, 0.012, 0.001), mat(0x111111), 0, -L / 2 - 0.004, 0.0018);
      lathe(q, [[0, 0], [0.0036, 0], [0.0042, 0.004], [0.0045, 0.006], [0, 0.006]], mat(0x0a0a0a, { roughness: 0.3 }), 0, -L / 2 - 0.006, 0, 0, 0, 0, 20);
    } else lathe(q, [[0, 0], [0.0007, 0], [0.0007, 0.008], [0, 0.008]], C.chrome(), 0, -L / 2 - 0.008, 0, 0, 0, 0, 10);
  };
  pen(0.012, 'pen');
  pen(-0.028, 'pencil');
  // nichos de velvet (canales)
  for (const z of [0.012, -0.028]) add(g, new THREE.CylinderGeometry(0.008, 0.008, 0.17, 20, 1, false, 0, PI), mat(0xffffff, { map: velvetTex('nicho', '#121a3a'), roughness: 1, side: THREE.BackSide }), 0, H - 0.002, z, PI, 0, PI / 2);
  // tintero de cristal tallado con tapa de oro
  const ink = grp(g, W / 2 + 0.06, 0, 0);
  const cut = new THREE.CylinderGeometry(0.026, 0.03, 0.04, 8, 1); cut.translate(0, 0.02, 0);
  const cg = add(ink, cut, gem(0xe8f4ff, { transmission: 0.8, opacity: 0.55, ior: 1.5, ei: 0.05 })); cg.castShadow = false;
  add(ink, new THREE.CylinderGeometry(0.02, 0.022, 0.028, 24), mat(0x0a1440, { roughness: 0.1 }), 0, 0.016, 0);
  lathe(ink, smooth([[0, 0.04], [0.014, 0.04], [0.016, 0.046], [0.014, 0.05], [0.008, 0.054], [0.004, 0.062], [0, 0.064]], 20), gold(), 0, 0, 0, 0, 0, 0, 28);
  return ground(g);
};

// ---------- Diente de tiranosaurio ----------
BUILDERS_D.diente_tiranosaurio = () => {
  const g = new THREE.Group();
  const black = mat(0x0e0e10, { roughness: 0.25, env: true, envI: 0.6 });
  slabBase(g, 0.16, 0.12, 0.024, black, { trim: brass() });
  // cuna de latón
  const h0 = 0.024;
  for (const s of [-1, 1]) SW(g, [[s * 0.02, h0, 0], [s * 0.024, h0 + 0.02, 0], [s * 0.02, h0 + 0.04, 0], [s * 0.012, h0 + 0.05, 0]], [0.003, 0.0028, 0.0025, 0.002], brass(), 8, 16);
  // diente: torno elíptico curvado con estrías y bordes aserrados
  const H = 0.17;
  const pts = smooth([[0, 0], [0.019, 0.0], [0.024, 0.03], [0.023, 0.06], [0.021, 0.085], [0.017, 0.11], [0.011, 0.14], [0.005, 0.162], [0, H]], 60);
  const geo = new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), 48);
  warp(geo, (x, y, z) => {
    const t = y / H, ang = Math.atan2(z, x);
    // sección almendrada: más angosta en x (lados), aristas en z (frente/atrás)
    let nx = x * 0.62, nz = z;
    // aserrado en las aristas delantera y trasera (|x| pequeño, parte alta)
    const edge = Math.exp(-((nx / 0.004) ** 2)) * (t > 0.35 ? 1 : 0);
    nz += Math.sign(z) * edge * (0.0012 * (0.5 + 0.5 * Math.sin(y * 900)));
    // estrías longitudinales tenues
    const rr = Math.hypot(nx, nz); const k = 1 + 0.02 * Math.sin(ang * 14) * t;
    nx *= k; nz *= k;
    // curvatura hacia atrás (-z)
    const bend = -0.075 * t * t;
    return [nx, y, nz + bend];
  });
  const toothTex = tex('trex_tooth', 64, 512, (c, w, h) => {
    const gr = c.createLinearGradient(0, h, 0, 0);
    gr.addColorStop(0, '#b89a74'); gr.addColorStop(0.28, '#9a7a52'); gr.addColorStop(0.36, '#4a3220'); gr.addColorStop(0.7, '#2a1c12'); gr.addColorStop(1, '#3a2a1a');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const R = rng(66);
    for (let i = 0; i < 900; i++) { const y = R() * h; c.fillStyle = y > h * 0.66 ? `rgba(60,40,20,${R() * 0.4})` : `rgba(255,230,190,${R() * 0.08})`; c.fillRect(R() * w, y, 1 + R() * 2, 1 + R() * 3); }
    c.strokeStyle = 'rgba(0,0,0,0.25)'; for (let i = 0; i < 14; i++) { c.beginPath(); const y = R() * h * 0.6; c.moveTo(0, y); c.lineTo(w, y + (R() - 0.5) * 8); c.stroke(); }
  });
  // UV del torno: v recorre el perfil (raíz abajo → punta arriba)
  const tooth = add(g, geo, new THREE.MeshPhysicalMaterial({ map: toothTex, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.3, envMapIntensity: 0.8 }), 0, h0 + 0.012, 0.01, 0.12, 0.3, 0);
  // vitrina de acrílico y ficha
  const ac = B(g, 0.14, 0.22, 0.1, glassD(0xf2f8ff, 0.1), 0, h0 + 0.11, 0); ac.castShadow = false; ac.renderOrder = 3;
  plaque(g, 'TYRANNOSAURUS REX', 'Formación Hell Creek · Montana', 0.1, 0.018, 0, 0.012, 0.0605, 0, 0, { bg: '#1a1a1a', fg: '#d8c088', frame: brass() });
  return ground(g);
};

// ---------- Celular “ladrillo” chapado en oro ----------
BUILDERS_D.celular_ladrillo_oro = () => {
  const g = new THREE.Group();
  const brushed = tex('brushed_au', 256, 256, (c, w, h) => { c.fillStyle = '#d6a845'; c.fillRect(0, 0, w, h); const R = rng(3); for (let i = 0; i < 600; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '255,240,200' : '90,60,10'},${R() * 0.12})`; c.fillRect(0, R() * h, w, 1); } }, true);
  const au = mat(0xffffff, { map: brushed, metalness: 1, roughness: 0.25, env: true });
  // base cargador de cuero negro
  const blk = mat(0x111111, { roughness: 0.4, env: true, envI: 0.4 });
  EXS(g, rrect(0.12, 0.1, 0.02), 0.03, blk, 0, 0.015, 0, -PI / 2, 0, 0, 0.004);
  CY(g, 0.0035, 0.0035, 0.004, emissive(0x30ff40, 2), 0.04, 0.032, 0.035, 0, 0, 0, 12);
  EXS(g, rrect(0.07, 0.054, 0.006), 0.01, mat(0x080808, { roughness: 0.6 }), 0, 0.03, 0, -PI / 2, 0, 0, 0.002);
  // teléfono de pie, ligeramente inclinado
  const ph = grp(g, 0, 0.033, 0.0, -0.12, 0, 0);
  const W = 0.058, H = 0.225, D = 0.044;
  RB(ph, W, H, D, 0.009, au, 0, H / 2, 0);
  // costados con junta negra
  RB(ph, W + 0.001, H - 0.02, 0.004, 0.0015, mat(0x1a1a1a, { roughness: 0.5 }), 0, H / 2, -0.004);
  // frente: pantalla LED, teclado de nácar, rejilla
  const fz = D / 2 + 0.0005;
  RB(ph, 0.046, 0.022, 0.003, 0.002, mat(0x1a0404, { roughness: 0.1, env: true }), 0, H - 0.07, fz);
  P(ph, 0.04, 0.014, tex('brick_led', 256, 96, (c, w, h) => { c.fillStyle = '#120202'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff3a1a'; c.shadowColor = '#ff2000'; c.shadowBlur = 8; c.font = 'bold 58px monospace'; c.fillText('5551985', 8, 70); }), 0, H - 0.07, fz + 0.0016, 0, 0, 0, { glow: 1.2 });
  const nacre = tex('nacre', 128, 128, (c, w, h) => { const R = rng(9); c.fillStyle = '#f2eee6'; c.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { const x = R() * w, y = R() * h, r = 10 + R() * 30, gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `hsla(${R() * 360},60%,85%,0.5)`); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); } });
  const nM = new THREE.MeshPhysicalMaterial({ map: nacre, roughness: 0.2, iridescence: 0.8, iridescenceIOR: 1.4, clearcoat: 1, envMapIntensity: 1 });
  const keys = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) keys.push(gx(rbGeo(0.012, 0.0085, 0.004, 0.002), (c - 1) * 0.0145, H - 0.098 - r * 0.0125, fz + 0.001));
  merged(ph, keys, nM);
  // números de las teclas
  P(ph, 0.044, 0.074, tex('brick_keys', 256, 432, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#3a2a10'; c.font = 'bold 30px system-ui'; c.textAlign = 'center'; const L = [['SND', 'CLR', 'END'], ['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['*', '0', '#'], ['FCN', 'RCL', 'STO']]; L.forEach((row, r) => row.forEach((t, k) => { c.font = t.length > 1 ? 'bold 20px system-ui' : 'bold 34px system-ui'; c.fillText(t, w / 2 + (k - 1) * 84, 46 + r * 72); })); }), 0, H - 0.129, fz + 0.0031, 0, 0, 0, { transparent: true, alphaTest: 0.3 });
  // auricular y micrófono
  const slots = rrect(0.03, 0.012, 0.004); for (let i = 0; i < 5; i++) slots.holes.push(rrect(0.003, 0.008, 0.0012, -0.012 + i * 0.006, 0, true));
  add(ph, exGeo(slots, 0.002, 0.0006), mat(0x1a1a1a, { roughness: 0.5 }), 0, H - 0.03, fz);
  const mic = []; for (let i = 0; i < 9; i++) mic.push(gx(new THREE.CylinderGeometry(0.0011, 0.0011, 0.002, 8), (i % 3 - 1) * 0.004, 0.022 + Math.floor(i / 3) * 0.004, fz, PI / 2, 0, 0));
  merged(ph, mic, mat(0x050505));
  // antena de goma
  lathe(ph, smooth([[0, 0], [0.008, 0], [0.008, 0.012], [0.006, 0.016], [0.0055, 0.07], [0.0062, 0.074], [0.0045, 0.08], [0, 0.081]], 30), mat(0x141414, { roughness: 0.7 }), -0.016, H - 0.002, -0.004, 0, 0, 0, 20);
  // grabado del ejecutivo
  P(ph, 0.04, 0.016, labelTex('EDICIÓN EJECUTIVA', { bg: '#d6a845', fg: '#5a3a08', w: 512, h: 160, font: 'bold 50px Georgia', sub: 'N.º 017 · 1985', subFont: 'italic 40px Georgia' }), 0, 0.045, fz + 0.0002, 0, 0, 0, { rough: 0.3 });
  return ground(g);
};

// ---------- Muñeca maldita en vitrina ----------
BUILDERS_D.muneca_maldita_vitrina = () => {
  const g = new THREE.Group();
  const ebony = woodM('d_ebano', '#2a1810', { rx: 3, ry: 3, rough: 0.35 });
  const W = 0.26, D = 0.2, Hv = 0.42;
  slabBase(g, W + 0.04, D + 0.04, 0.035, ebony, { trim: metal(0x6a6a60, 0.5) });
  const y0 = 0.035;
  vitrine(g, W, Hv, D, y0, ebony);
  // corona moldurada
  EXS(g, rrect(W + 0.03, D + 0.03, 0.008), 0.02, ebony, 0, y0 + Hv + 0.01, 0, -PI / 2, 0, 0, 0.004);
  lathe(g, smooth([[0, 0], [0.03, 0], [0.024, 0.02], [0.01, 0.034], [0.012, 0.04], [0, 0.05]], 16), ebony, 0, y0 + Hv + 0.02, 0, 0, 0, 0, 24);
  // muñeca de porcelana de pie en su soporte
  const d = grp(g, 0, y0, -0.01);
  CY(d, 0.04, 0.045, 0.01, ebony, 0, 0.005, 0, 0, 0, 0, 32);
  CY(d, 0.0025, 0.0025, 0.14, C.iron(), 0, 0.075, -0.02, 0, 0, 0, 8);
  // zapatitos y piernas
  for (const s of [-1, 1]) { SW(d, [[s * 0.018, 0.012, 0.004], [s * 0.018, 0.05, 0]], [0.009, 0.01], C.porcelain(0xeee6dc), 10, 8); RB(d, 0.018, 0.012, 0.03, 0.005, lacquer(0x101010), s * 0.018, 0.016, 0.006); }
  // vestido victoriano con encaje
  const lace = tex('lace', 256, 256, (c, w, h) => { c.fillStyle = '#6a1a26'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(240,226,210,0.8)'; c.lineWidth = 2; for (let y = h - 60; y < h; y += 14) for (let x = 0; x < w; x += 16) { c.beginPath(); c.arc(x + (y % 28 ? 8 : 0), y, 6, 0, PI); c.stroke(); } for (let i = 0; i < 1600; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(80,60,40,0.25)'; c.beginPath(); c.arc(Math.random() * w, Math.random() * h * 0.7, 10 + Math.random() * 20, 0, TAU); c.fill(); } });
  const dress = mat(0xffffff, { map: rep(lace, 3, 1), roughness: 0.95, side: THREE.DoubleSide });
  const skirt = [];
  for (let i = 0; i <= 20; i++) { const t = i / 20; skirt.push([0.026 + Math.pow(1 - t, 1.6) * 0.045 + Math.sin(t * 12) * 0.0015, 0.045 + t * 0.105]); }
  const sk = new THREE.LatheGeometry(skirt.map(([a, b]) => new THREE.Vector2(a, b)), 40);
  warp(sk, (x, y, z) => { const a = Math.atan2(z, x), k = 1 + 0.07 * Math.sin(a * 9) * (1 - (y - 0.045) / 0.105); return [x * k, y, z * k]; });
  add(d, sk, dress);
  // corpiño
  add(d, swGeo([[0, 0.14, 0], [0, 0.175, 0], [0, 0.2, 0]], [0.026, 0.022, 0.018], 16, 8, 0.8), dress);
  // brazos
  for (const s of [-1, 1]) {
    SW(d, [[s * 0.022, 0.195, 0], [s * 0.034, 0.17, 0.006], [s * 0.038, 0.14, 0.014]], [0.008, 0.007, 0.006], dress, 10, 12);
    add(d, new THREE.SphereGeometry(0.0065, 12, 10), C.porcelain(0xeee6dc), s * 0.039, 0.134, 0.016);
  }
  // cuello de encaje
  add(d, new THREE.TorusGeometry(0.017, 0.005, 8, 24), mat(0xf0e6d6, { roughness: 0.9 }), 0, 0.203, 0, PI / 2, 0, 0);
  // cabeza de porcelana con rostro pintado y grieta
  const face = tex('doll_face', 256, 256, (c, w, h) => {
    c.fillStyle = '#efe4d8'; c.fillRect(0, 0, w, h);
    for (const x of [92, 164]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, 120, 19, 13, 0, 0, TAU); c.fill(); c.fillStyle = '#3a6a9a'; c.beginPath(); c.arc(x, 121, 10, 0, TAU); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(x, 121, 4.5, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x - 4, 117, 2.5, 0, TAU); c.fill(); c.strokeStyle = '#2a1a10'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, 117, 21, 15, 0, PI * 1.1, PI * 1.9); c.stroke(); c.lineWidth = 3; c.strokeStyle = '#5a3a20'; c.beginPath(); c.arc(x, 112, 26, PI * 1.25, PI * 1.75); c.stroke(); }
    c.fillStyle = 'rgba(220,90,90,0.35)'; c.beginPath(); c.arc(70, 160, 20, 0, TAU); c.fill(); c.beginPath(); c.arc(186, 160, 20, 0, TAU); c.fill();
    c.fillStyle = '#a02030'; c.beginPath(); c.ellipse(128, 180, 12, 6, 0, 0, TAU); c.fill();
    c.strokeStyle = '#3a2a20'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(150, 40); c.lineTo(160, 80); c.lineTo(148, 100); c.lineTo(170, 130); c.lineTo(162, 170); c.stroke();
    c.fillStyle = 'rgba(80,10,10,0.6)'; c.fillRect(162, 134, 2, 18);
  });
  const hd = grp(d, 0, 0.235, 0, 0, 0, 0.12);
  add(hd, new THREE.SphereGeometry(0.03, 32, 24).scale(1, 1.08, 0.98), C.porcelain(0xefe4d8));
  add(hd, new THREE.SphereGeometry(0.0302, 32, 16, PI / 2 - 0.9, 1.8, 0.7, 1.4).scale(1, 1.08, 0.98), texM(face, { roughness: 0.2, env: true, envI: 0.6 }));
  // cabello de rizos (barridos espirales)
  const hair = mat(0x3a2210, { roughness: 0.7 });
  add(hd, new THREE.SphereGeometry(0.032, 24, 16, 0, TAU, 0, PI * 0.45).scale(1.02, 1.08, 1.02), hair, 0, 0.002, -0.002, -0.35, 0, 0);
  const curls = [];
  for (let k = 0; k < 8; k++) {
    const a = PI * 0.15 + k / 7 * PI * 0.7 + PI; const x0 = Math.cos(a) * 0.03, z0 = Math.sin(a) * 0.026;
    const pts = []; for (let i = 0; i <= 20; i++) { const t = i / 20; pts.push([x0 * (1 + 0.1 * t) + Math.cos(t * 14) * 0.004, 0.01 - t * 0.055, z0 + Math.sin(t * 14) * 0.004]); }
    curls.push(swGeo(pts, [0.005, 0.004, 0.003], 6, 30));
  }
  merged(hd, curls, hair);
  // lazo
  for (const s of [-1, 1]) add(hd, new THREE.SphereGeometry(0.012, 12, 8).scale(1.2, 0.7, 0.4), mat(0x2a0a10, { roughness: 0.6 }), s * 0.012, 0.03, -0.012, 0, 0, s * 0.4);
  // cadenas cruzadas al frente con candado
  const links = [];
  const chain = (p0, p1) => { const n = 46; for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, sag = Math.sin(t * PI) * 0.008; links.push(gx(new THREE.TorusGeometry(0.0045, 0.0013, 6, 12).scale(1.5, 1, 1), p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t - sag, D / 2 + 0.006, i % 2 ? PI / 2 : 0, 0, Math.atan2(p1[1] - p0[1], p1[0] - p0[0]))); } };
  chain([-W / 2, y0 + Hv - 0.02], [W / 2, y0 + 0.03]);
  chain([W / 2, y0 + Hv - 0.02], [-W / 2, y0 + 0.03]);
  merged(g, links, C.iron());
  const lockY = y0 + Hv / 2 + 0.005;
  RB(g, 0.034, 0.03, 0.012, 0.004, metal(0x5a4a2a, 0.45), 0, lockY, D / 2 + 0.014);
  add(g, new THREE.TorusGeometry(0.011, 0.003, 8, 20, PI), C.steel(), 0, lockY + 0.015, D / 2 + 0.014);
  // etiqueta de advertencia
  const tag = tex('no_abrir', 256, 128, (c, w, h) => { c.fillStyle = '#e8dcb8'; c.fillRect(0, 0, w, h); c.fillStyle = '#7a0a0a'; c.font = 'bold 44px Georgia'; c.textAlign = 'center'; c.fillText('NO ABRIR', w / 2, 56); c.font = 'italic 20px Georgia'; c.fillStyle = '#222'; c.fillText('Sta. María, 1912', w / 2, 96); });
  P(g, 0.07, 0.035, tag, 0.0, lockY - 0.04, D / 2 + 0.008, 0, 0, 0.1, { rough: 0.9 });
  return ground(g);
};

// ---------- Bobina de Tesla ----------
BUILDERS_D.bobina_tesla = () => {
  const g = new THREE.Group();
  const panel = mat(0x1c1e22, { roughness: 0.5, env: true, envI: 0.3 });
  // gabinete de control con perillas y medidor
  RB(g, 0.34, 0.07, 0.34, 0.01, panel, 0, 0.035, 0);
  RB(g, 0.35, 0.008, 0.35, 0.004, C.steel(), 0, 0.072, 0);
  const meter = tex('tesla_meter', 128, 128, (c, w, h) => { c.fillStyle = '#efe8d4'; c.fillRect(0, 0, w, h); c.strokeStyle = '#222'; c.lineWidth = 2; c.beginPath(); c.arc(64, 90, 50, PI * 1.15, PI * 1.85); c.stroke(); for (let k = 0; k <= 10; k++) { const a = PI * 1.15 + k / 10 * PI * 0.7; c.beginPath(); c.moveTo(64 + Math.cos(a) * 44, 90 + Math.sin(a) * 44); c.lineTo(64 + Math.cos(a) * 52, 90 + Math.sin(a) * 52); c.stroke(); } c.strokeStyle = '#c00'; c.beginPath(); c.moveTo(64, 90); c.lineTo(90, 50); c.stroke(); c.fillStyle = '#222'; c.font = 'bold 14px system-ui'; c.fillText('kV', 54, 116); });
  circleDecal(g, 0.018, meter, -0.08, 0.04, 0.1705);
  add(g, new THREE.TorusGeometry(0.019, 0.003, 8, 28), C.chrome(), -0.08, 0.04, 0.171);
  for (const [x, col] of [[0.02, 0x111111], [0.06, 0x111111], [0.11, 0xc01a1a]]) lathe(g, smooth([[0, 0], [0.011, 0], [0.011, 0.008], [0.008, 0.014], [0, 0.015]], 10), mat(col, { roughness: 0.35, env: true }), x, 0.04, 0.17, PI / 2, 0, 0, 20);
  CY(g, 0.005, 0.005, 0.004, emissive(0xff4020, 2), 0.11, 0.06, 0.171, PI / 2, 0, 0, 12);
  // bobina primaria: espiral plana de tubo de cobre
  const sp = []; for (let i = 0; i <= 200; i++) { const t = i / 200, a = t * TAU * 6; const r = 0.06 + t * 0.07; sp.push([Math.cos(a) * r, 0.084 + t * 0.012, Math.sin(a) * r]); }
  add(g, tubeGeo(sp, 0.0032, 400, 6), metal(0xd07840, 0.25));
  // soportes acrílicos de la primaria
  const sup = []; for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + PI / 4; sup.push(gx(new THREE.BoxGeometry(0.08, 0.012, 0.01), Math.cos(a) * 0.1, 0.082, Math.sin(a) * 0.1, 0, -a, 0)); }
  merged(g, sup, mat(0xd8d0b8, { roughness: 0.4 }));
  // secundaria: tubo con alambre esmaltado finísimo
  const wind = tex('tesla_wind', 64, 512, (c, w, h) => { for (let y = 0; y < h; y += 2) { c.fillStyle = y % 4 ? '#a8501e' : '#e09050'; c.fillRect(0, y, w, 2); } c.fillStyle = 'rgba(255,220,180,0.25)'; c.fillRect(w * 0.4, 0, w * 0.15, h); }, true);
  const secH = 0.36;
  add(g, new THREE.CylinderGeometry(0.032, 0.032, secH, 40, 1, true), mat(0xffffff, { map: rep(wind, 3, 4), metalness: 0.7, roughness: 0.25, env: true }), 0, 0.08 + secH / 2, 0);
  lathe(g, [[0, 0], [0.04, 0], [0.04, 0.012], [0.033, 0.014], [0, 0.014]], mat(0xe8e4dc, { roughness: 0.3 }), 0, 0.075, 0, 0, 0, 0, 32);
  lathe(g, [[0, 0], [0.036, 0], [0.036, 0.01], [0, 0.01]], mat(0xe8e4dc, { roughness: 0.3 }), 0, 0.08 + secH, 0, 0, 0, 0, 32);
  // toroide de aluminio pulido
  const ty = 0.08 + secH + 0.035;
  add(g, new THREE.TorusGeometry(0.075, 0.03, 24, 64), metal(0xd8dce0, 0.18), 0, ty, 0, PI / 2, 0, 0);
  lathe(g, smooth([[0, -0.025], [0.05, -0.02], [0.06, 0], [0.05, 0.02], [0, 0.025]], 16), metal(0xd8dce0, 0.2), 0, ty, 0, 0, 0, 0, 40);
  // arcos eléctricos (líneas quebradas luminosas)
  const arcM = new THREE.MeshBasicMaterial({ color: 0xd8b8ff });
  const glowM = new THREE.MeshBasicMaterial({ color: 0x9a60ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false });
  const R = rng(1919);
  const arcs = [], glows = [];
  for (let k = 0; k < 6; k++) {
    const a0 = k / 6 * TAU + R() * 0.6; let x = Math.cos(a0) * 0.1, y = ty + (R() - 0.5) * 0.02, z = Math.sin(a0) * 0.1;
    const pts = [[x, y, z]];
    const L = 0.08 + R() * 0.14;
    for (let i = 1; i <= 9; i++) { const r = 0.1 + i / 9 * L; const a = a0 + (R() - 0.5) * 0.25; x = Math.cos(a) * r; z = Math.sin(a) * r; y += (R() - 0.45) * 0.03; pts.push([x, y, z]); }
    const c3 = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0);
    arcs.push(new THREE.TubeGeometry(c3, 40, 0.0012, 4, false));
    glows.push(new THREE.TubeGeometry(c3, 40, 0.004, 6, false));
  }
  const am = merged(g, arcs, arcM); am.castShadow = false;
  const gm = merged(g, glows, glowM); gm.castShadow = false;
  // cable de tierra y aisladores
  TU(g, [[0.16, 0.05, -0.17], [0.2, 0.02, -0.2], [0.24, 0.004, -0.16]], 0.004, mat(0x2a7a2a, { roughness: 0.5 }), false, 16);
  plaque(g, 'LABORATORIO DE ALTA TENSIÓN', 'Colorado Springs · 1899', 0.12, 0.02, 0.1705, 0.04, 0, 0, PI / 2, { bg: '#c9a24e' });
  return ground(g);
};

// =====================================================================
//  LEGENDARIOS
// =====================================================================
// ---------- Reloj de la máquina del tiempo (tubos nixie) ----------
BUILDERS_D.reloj_maquina_tiempo = () => {
  const g = new THREE.Group();
  const wal = woodM('d_tmw', '#5a3218', { rx: 3, ry: 3, rough: 0.3 });
  const brushed = mat(0xffffff, { map: tex('tm_brush', 256, 256, (c, w, h) => { c.fillStyle = '#8a8e94'; c.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'},${Math.random() * 0.08})`; c.fillRect(0, Math.random() * h, w, 1); } }, true), metalness: 0.9, roughness: 0.35, env: true });
  // consola: perfil lateral con frente inclinado
  const prof = poly([[-0.1, 0], [0.1, 0], [0.1, 0.05], [0.04, 0.2], [-0.1, 0.2]]);
  EXS(g, prof, 0.46, wal, 0, 0, 0, 0, -PI / 2, 0, 0.006);
  // placa frontal inclinada
  const ang = Math.atan2(0.15, 0.06);
  const fp = grp(g, 0, 0.125, 0.07 + 0.004, -(PI / 2 - ang), 0, 0);
  RB(fp, 0.44, 0.15, 0.006, 0.003, brushed, 0, 0, 0);
  // remaches
  const rv = []; for (const x of [-0.21, 0.21]) for (const y of [-0.065, 0.065]) rv.push(gx(new THREE.SphereGeometry(0.004, 10, 6, 0, TAU, 0, PI / 2), x, y, 0.003, PI / 2, 0, 0));
  merged(fp, rv, brass());
  // tres filas de tubos nixie
  const rows = [['DESTINO', 0xff2a1a, '10261985', '#ff3a20'], ['PRESENTE', 0x30e050, '09302026', '#40ff60'], ['ÚLTIMA SALIDA', 0xffa020, '11121955', '#ffb030']];
  rows.forEach(([lbl, col, digits, css], r) => {
    const y = 0.045 - r * 0.047;
    // banda de color con rótulo
    P(fp, 0.12, 0.012, labelTex(lbl, { bg: css, fg: '#111', w: 512, h: 52, font: 'bold 36px system-ui' }), -0.13, y - 0.019, 0.0035, 0, 0, 0, { rough: 0.5 });
    RB(fp, 0.4, 0.036, 0.008, 0.003, mat(0x111111, { roughness: 0.4 }), 0.0, y, 0.006);
    // tubos de vidrio
    const tubes = [], sockets = [];
    for (let i = 0; i < 8; i++) {
      const x = -0.16 + i * 0.044 + (i >= 4 ? 0.01 : 0) + (i >= 6 ? 0.01 : 0) - 0.01;
      tubes.push(gx(latheGeo(smooth([[0.0, 0], [0.0095, 0.001], [0.0105, 0.01], [0.0105, 0.042], [0.008, 0.049], [0.002, 0.052], [0, 0.053]], 16), 20), x, y - 0.017, 0.022, 0, 0, 0, [1, 0.68, 1]));
      sockets.push(gx(new THREE.CylinderGeometry(0.0115, 0.0115, 0.006, 20), x, y - 0.018, 0.022));
    }
    const tm = merged(fp, tubes, glassD(0xffe8c8, 0.18)); tm.castShadow = false; tm.renderOrder = 3;
    merged(fp, sockets, mat(0x1a1a1a, { roughness: 0.4 }));
    // dígitos luminosos (malla de ánodo + número)
    const dt = tex('nixie_' + r, 1024, 128, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.strokeStyle = 'rgba(120,110,100,0.5)'; c.lineWidth = 1;
      for (let i = 0; i < 8; i++) { const cx = 64 + i * 128; for (let k = -40; k <= 40; k += 6) { c.beginPath(); c.moveTo(cx + k, 8); c.lineTo(cx + k, 120); c.stroke(); } }
      c.font = 'bold 104px "Courier New", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.shadowColor = css; c.shadowBlur = 18; c.fillStyle = '#fff2c0';
      for (let i = 0; i < 8; i++) c.fillText(digits[i], 64 + i * 128, 68);
    });
    const dm = new THREE.MeshBasicMaterial({ map: dt, color: new THREE.Color(col).lerp(new THREE.Color(0xffffff), 0.35).multiplyScalar(1.6), transparent: true, alphaTest: 0.05, side: THREE.DoubleSide });
    for (let i = 0; i < 8; i++) {
      const x = -0.16 + i * 0.044 + (i >= 4 ? 0.01 : 0) + (i >= 6 ? 0.01 : 0) - 0.01;
      const pl = add(fp, new THREE.PlaneGeometry(0.014, 0.022), dm, x, y + 0.002, 0.022); pl.castShadow = false;
      const uv = pl.geometry.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, (i + uv.getX(k)) / 8);
    }
  });
  // palanca y conmutadores en la cubierta superior
  const top = grp(g, 0, 0.2, -0.03);
  RB(top, 0.44, 0.004, 0.13, 0.002, brushed, 0, 0.002, 0);
  for (let i = 0; i < 5; i++) {
    lathe(top, [[0, 0], [0.007, 0], [0.007, 0.004], [0.004, 0.006], [0, 0.006]], C.chrome(), -0.17 + i * 0.03, 0.004, 0.02, 0, 0, 0, 16);
    CY(top, 0.0018, 0.0012, 0.022, C.chrome(), -0.17 + i * 0.03 + 0.003, 0.014, 0.02, 0, 0, -0.3, 8);
  }
  const lv = grp(top, 0.15, 0.004, 0.0, 0, 0, -0.4);
  lathe(lv, [[0, 0], [0.014, 0], [0.014, 0.01], [0.006, 0.014], [0, 0.014]], brass(), 0, 0, 0, 0, 0, 0, 20);
  CY(lv, 0.003, 0.003, 0.07, C.chrome(), 0, 0.045, 0, 0, 0, 0, 10);
  lathe(lv, smooth([[0, 0], [0.008, 0.002], [0.01, 0.012], [0.008, 0.024], [0, 0.026]], 14), mat(0xb01a14, { roughness: 0.25, env: true }), 0, 0.078, 0, 0, 0, 0, 20);
  // haz de cables por detrás
  for (let i = 0; i < 4; i++) TU(g, [[-0.15 + i * 0.03, 0.1, -0.105], [-0.15 + i * 0.03, 0.06, -0.14], [-0.16 + i * 0.035, 0.008, -0.18]], 0.0035, mat([0xc01a1a, 0x1a1ac0, 0xd8b020, 0x1a1a1a][i], { roughness: 0.5 }), false, 16);
  return ground(g);
};

// ---------- Disco de oro enmarcado ----------
BUILDERS_D.disco_oro_enmarcado = () => {
  const g = new THREE.Group();
  const W = 0.4, H = 0.5, D = 0.05;
  const frameM = lacquer(0x0c0c0c);
  const fr = rrect(W, H, 0.006); fr.holes.push(rrect(W - 0.05, H - 0.05, 0.002, 0, 0, true));
  const f = grp(g, 0, H / 2, 0, -0.1, 0, 0);
  EXS(f, fr, D, frameM, 0, 0, 0, 0, 0, 0, 0.004);
  // filete dorado interior
  const fil = rrect(W - 0.05, H - 0.05, 0.002); fil.holes.push(rrect(W - 0.058, H - 0.058, 0.001, 0, 0, true));
  EXS(f, fil, D - 0.004, gold(0.2), 0, 0, -0.002, 0, 0, 0, 0.001);
  // fondo de terciopelo
  add(f, new THREE.PlaneGeometry(W - 0.05, H - 0.05), velvet('disc_bg', '#141414'), 0, 0, -D / 2 + 0.004);
  // disco dorado con surcos
  const grooves = tex('gold_grooves', 512, 512, (c, w, h) => {
    c.fillStyle = '#d8aa48'; c.fillRect(0, 0, w, h);
    for (let r = 70; r < 250; r += 2) { c.strokeStyle = `rgba(${r % 6 ? '90,60,10' : '255,240,190'},${0.25 + (r % 4) * 0.05})`; c.lineWidth = 1; c.beginPath(); c.arc(w / 2, h / 2, r, 0, TAU); c.stroke(); }
    for (const r of [120, 170, 210]) { c.strokeStyle = 'rgba(255,240,200,0.6)'; c.lineWidth = 3; c.beginPath(); c.arc(w / 2, h / 2, r, 0, TAU); c.stroke(); }
    // etiqueta central
  });
  const disc = add(f, new THREE.CylinderGeometry(0.15, 0.15, 0.002, 96), [mat(0xd8aa48, { metalness: 1, roughness: 0.2 }), mat(0xffffff, { map: grooves, metalness: 0.85, roughness: 0.28, env: true }), mat(0xffffff, { map: grooves, metalness: 1, roughness: 0.2 })], 0, 0.045, -D / 2 + 0.012, PI / 2, 0, 0);
  circleDecal(f, 0.042, tex('gold_lbl', 256, 256, (c, w, h) => { c.fillStyle = '#7a1414'; c.fillRect(0, 0, w, h); c.strokeStyle = '#f0d890'; c.lineWidth = 3; c.beginPath(); c.arc(128, 128, 118, 0, TAU); c.stroke(); c.fillStyle = '#f0d890'; c.textAlign = 'center'; c.font = 'bold 26px Georgia'; c.fillText('DISCOS DEL VALLE', 128, 80); c.font = 'italic 24px Georgia'; c.fillText('“Corazón de Neón”', 128, 190); c.fillStyle = '#111'; c.beginPath(); c.arc(128, 128, 9, 0, TAU); c.fill(); }), 0, 0.045, -D / 2 + 0.0132, 0, 0, 0, { roughness: 0.6 });
  // portada en miniatura
  P(f, 0.07, 0.07, artTex(1985, 'abstract', 256, 256, 'NEÓN'), -0.1, -0.165, -D / 2 + 0.008, 0, 0, 0, { rough: 0.5 });
  // placa conmemorativa grabada
  RB(f, 0.18, 0.06, 0.004, 0.002, gold(0.18), 0.06, -0.165, -D / 2 + 0.008);
  P(f, 0.172, 0.052, tex('rec_plaque', 512, 160, (c, w, h) => { c.fillStyle = '#d4a848'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2408'; c.textAlign = 'center'; c.font = 'bold 30px Georgia'; c.fillText('PRESENTADO A LOS ESTRELLAS', w / 2, 40); c.font = 'italic 24px Georgia'; c.fillText('por más de 500,000 copias vendidas', w / 2, 80); c.font = '22px Georgia'; c.fillText('de “Corazón de Neón” · México, 1986', w / 2, 116); c.strokeStyle = '#3a2408'; c.lineWidth = 3; c.strokeRect(6, 6, w - 12, h - 12); }), 0.06, -0.165, -D / 2 + 0.0105, 0, 0, 0, { rough: 0.25 });
  // cristal frontal
  const gl = add(f, new THREE.PlaneGeometry(W - 0.05, H - 0.05), glassD(0xffffff, 0.08), 0, 0, D / 2 - 0.006); gl.castShadow = false;
  // pata trasera tipo atril
  EXS(g, poly([[-0.015, 0], [0.015, 0], [0.012, 0.3], [-0.012, 0.3]]), 0.008, frameM, 0, 0.0, -0.07, -0.25, 0, 0, 0.002);
  return ground(g);
};

// ---------- Patineta flotante de utilería ----------
BUILDERS_D.patineta_flotante = () => {
  const g = new THREE.Group();
  const blk = mat(0x0c0c0e, { roughness: 0.25, env: true, envI: 0.6 });
  // base de exhibición elíptica con luz
  const base = new THREE.Shape(); base.absellipse(0, 0, 0.3, 0.12, 0, TAU, false);
  EXS(g, base, 0.03, blk, 0, 0.015, 0, -PI / 2, 0, 0, 0.006);
  const glowT = tex('hover_glow', 256, 128, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(120,200,255,1)'); gr.addColorStop(0.5, 'rgba(60,120,255,0.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const gm = add(g, new THREE.PlaneGeometry(0.56, 0.2), new THREE.MeshBasicMaterial({ map: glowT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.0365, 0, -PI / 2, 0, 0); gm.castShadow = false;
  add(g, new THREE.TorusGeometry(1, 0.012, 6, 64).scale(0.27, 0.105, 1), emissive(0x40a0ff, 2), 0, 0.034, 0, PI / 2, 0, 0);
  plaque(g, 'PATINETA FLOTANTE', 'Utilería de rodaje · 1989', 0.11, 0.02, 0, 0.016, 0.121, 0, 0, { bg: '#1a1a1a', fg: '#7ac8ff', frame: C.chrome() });
  // varilla transparente
  const rod = add(g, new THREE.CylinderGeometry(0.008, 0.012, 0.11, 20), glassD(0xd8f0ff, 0.35), 0, 0.085, 0); rod.castShadow = false;
  // tabla
  const b = grp(g, 0, 0.15, 0, 0, 0, 0.04);
  const L = 0.6, Wd = 0.155;
  const outline = new THREE.Shape();
  outline.moveTo(-L / 2 + 0.06, -Wd / 2); outline.lineTo(L / 2 - 0.09, -Wd / 2);
  outline.bezierCurveTo(L / 2 - 0.02, -Wd / 2, L / 2, -0.03, L / 2, 0); outline.bezierCurveTo(L / 2, 0.03, L / 2 - 0.02, Wd / 2, L / 2 - 0.09, Wd / 2);
  outline.lineTo(-L / 2 + 0.06, Wd / 2); outline.bezierCurveTo(-L / 2, Wd / 2, -L / 2, Wd / 2 - 0.02, -L / 2, 0); outline.bezierCurveTo(-L / 2, -Wd / 2 + 0.02, -L / 2, -Wd / 2, -L / 2 + 0.06, -Wd / 2);
  const deckGeo = exGeo(outline, 0.022, 0.006, 32);
  deckGeo.rotateX(-PI / 2);
  // ligera curva de la punta
  warp(deckGeo, (x, y, z) => [x, y + Math.max(0, x - 0.16) ** 2 * 0.9, z]);
  // UVs planas superiores
  const pa = deckGeo.attributes.position, uva = deckGeo.attributes.uv;
  for (let i = 0; i < pa.count; i++) uva.setXY(i, pa.getX(i) / L + 0.5, -pa.getZ(i) / Wd + 0.5);
  const graphic = tex('hover_deck', 1024, 256, (c, w, h) => {
    c.fillStyle = '#e8308a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffd820'; c.beginPath(); c.moveTo(0, h * 0.72); c.lineTo(w, h * 0.28); c.lineTo(w, h * 0.42); c.lineTo(0, h * 0.86); c.fill();
    c.fillStyle = '#20c8e8'; c.beginPath(); c.moveTo(0, h * 0.2); c.lineTo(w * 0.6, 0); c.lineTo(w * 0.75, 0); c.lineTo(0, h * 0.32); c.fill();
    c.fillStyle = '#111'; c.font = 'bold italic 120px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FLOTA·X', w * 0.5, h * 0.52);
    c.fillStyle = '#fff'; c.fillText('FLOTA·X', w * 0.5 - 5, h * 0.52 - 5);
    for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  });
  add(b, deckGeo, new THREE.MeshPhysicalMaterial({ map: graphic, roughness: 0.3, clearcoat: 0.7, envMapIntensity: 0.8 }));
  // almohadillas antiderrapantes para los pies
  const pad = tex('hover_pad', 128, 128, (c, w, h) => { c.fillStyle = '#b8e020'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 * 4; x < w; x += 8) c.fillRect(x, y, 4, 4); }, true);
  for (const x of [-0.16, 0.1]) {
    const pg = exGeo(rrect(0.11, 0.1, 0.03), 0.004, 0.0015, 12); pg.rotateX(-PI / 2);
    add(b, pg, mat(0xffffff, { map: rep(pad, 8, 8), roughness: 0.9 }), x, 0.0125 + Math.max(0, x - 0.16) ** 2 * 0.9, 0);
  }
  // correa para el pie (cinta)
  add(b, ribbonGeo([[0.1, 0.014, -0.06], [0.1, 0.05, -0.03], [0.1, 0.058, 0], [0.1, 0.05, 0.03], [0.1, 0.014, 0.06]], 0.035, [1, 0, 0], 20), mat(0x181818, { roughness: 0.8, side: THREE.DoubleSide }));
  // propulsores inferiores con brillo
  for (const x of [-0.17, 0.17]) {
    lathe(b, smooth([[0, 0], [0.045, 0], [0.05, 0.006], [0.045, 0.012], [0, 0.012]], 16), mat(0x2a2a2e, { metalness: 0.6, roughness: 0.35, env: true }), x, -0.024, 0, 0, 0, 0, 32);
    add(b, new THREE.CircleGeometry(0.035, 32), mat(0x60c0ff, { emissive: 0x3aa0ff, emissiveIntensity: 2.4 }), x, -0.0245, 0, PI / 2, 0, 0);
    add(b, new THREE.TorusGeometry(0.042, 0.003, 6, 32), C.chrome(), x, -0.024, 0, PI / 2, 0, 0);
  }
  return ground(g);
};

// ---------- Cráneo alienígena en resina ----------
BUILDERS_D.craneo_alien_resina = () => {
  const g = new THREE.Group();
  const blk = mat(0x0a0a0c, { roughness: 0.3, env: true, envI: 0.5 });
  slabBase(g, 0.26, 0.2, 0.03, blk, { trim: C.chrome() });
  const y0 = 0.03;
  // cráneo: bóveda alargada hacia atrás y arriba
  const N = noise3(51);
  const bone = mat(0xffffff, { map: tex('alien_bone', 256, 256, (c, w, h) => { c.fillStyle = '#d8ccb0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(${Math.random() < 0.6 ? '90,70,40' : '255,250,230'},${Math.random() * 0.15})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } c.strokeStyle = 'rgba(70,50,30,0.5)'; c.lineWidth = 1.2; c.beginPath(); let x = 30, y = 128; c.moveTo(x, y); for (let k = 0; k < 30; k++) { x += 7; y += (Math.random() - 0.5) * 8; c.lineTo(x, y); } c.stroke(); }), roughness: 0.65 });
  const sk = grp(g, 0, y0 + 0.085, -0.01, 0.1, 0, 0);
  // bóveda: esfera deformada, bulbosa y alargada hacia atrás y arriba
  const cran = new THREE.SphereGeometry(0.05, 56, 40);
  warp(cran, (x, y, z) => {
    const back = Math.max(0, -z) / 0.05, up = Math.max(0, y) / 0.05;
    const nz = z * (1 + back * 0.55) - back * up * 0.012;
    const ny = y * 1.05 + back * back * 0.016;
    const nx = x * (1.02 - Math.max(0, -y) / 0.05 * 0.15);
    const n = N(x * 50, y * 50, z * 50) * 0.0012;
    return [nx + n, ny + n, nz];
  });
  add(sk, cran, bone, 0, 0.02, -0.01);
  // rostro: triángulo invertido que baja a un mentón pequeño
  const face = new THREE.SphereGeometry(0.036, 40, 30);
  warp(face, (x, y, z) => {
    const down = Math.max(0, -y) / 0.036;
    return [x * (1 - down * 0.62), y * 1.25 - down * down * 0.008, z * (0.78 - down * 0.15) + down * 0.006];
  });
  add(sk, face, bone, 0, -0.012, 0.02);
  // órbitas enormes almendradas, inclinadas e incrustadas en la superficie
  for (const s of [-1, 1]) {
    const orb = new THREE.SphereGeometry(0.0155, 28, 18); orb.scale(1, 1.5, 0.45);
    add(sk, orb, mat(0x0c0806, { roughness: 0.9 }), s * 0.02, -0.004, 0.038, -0.15, s * 0.35, -s * 0.6);
    // reflejo húmedo mínimo
    const shine = new THREE.SphereGeometry(0.0145, 20, 12); shine.scale(1, 1.48, 0.38);
    add(sk, shine, gem(0x101820, { opacity: 0.6, flat: false, ei: 0.05 }), s * 0.02, -0.004, 0.039, -0.15, s * 0.35, -s * 0.6);
  }
  // fosas nasales (dos ranuras) y boca
  for (const s of [-1, 1]) add(sk, new THREE.SphereGeometry(0.0022, 10, 8).scale(1, 2.2, 1), mat(0x1a120a), s * 0.0035, -0.03, 0.044, 0.3, 0, 0);
  add(sk, new THREE.BoxGeometry(0.014, 0.0015, 0.008), mat(0x1a120a), 0, -0.045, 0.037, 0.4, 0, 0);
  // sutura y fontanela
  add(sk, tubeGeo([[0, 0.068, 0.0], [0, 0.07, -0.03], [0, 0.064, -0.06], [0, 0.05, -0.08]], 0.0008, 24, 4), mat(0x6a5a40, { roughness: 0.9 }));
  // resina: bloque transparente con burbujas
  const resin = new THREE.MeshPhysicalMaterial({ color: 0xf0f6ff, roughness: 0.02, transmission: 0.92, thickness: 0.2, ior: 1.5, transparent: true, opacity: 0.4, clearcoat: 1, depthWrite: false, envMapIntensity: 1.5 });
  const blk2 = add(g, rbGeo(0.22, 0.24, 0.16, 0.012), resin, 0, y0 + 0.12, 0); blk2.castShadow = false; blk2.renderOrder = 4;
  const bub = []; const R = rng(77);
  for (let i = 0; i < 40; i++) bub.push(gx(new THREE.SphereGeometry(0.001 + R() * 0.002, 6, 4), (R() - 0.5) * 0.2, y0 + 0.01 + R() * 0.22, (R() - 0.5) * 0.14));
  const bm = merged(g, bub, mat(0xffffff, { transparent: true, opacity: 0.5, roughness: 0.1 })); bm.castShadow = false;
  // tenue luz verde desde la base
  add(g, new THREE.PlaneGeometry(0.2, 0.14), new THREE.MeshBasicMaterial({ color: 0x30ff90, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending, depthWrite: false }), 0, y0 + 0.002, 0, -PI / 2, 0, 0).castShadow = false;
  plaque(g, 'ESPÉCIMEN 47-R', 'Hallado en Roswell, N.M. · 1947', 0.12, 0.018, 0, 0.015, 0.1005, 0, 0, { bg: '#1a1a1a', fg: '#7aff9a', frame: C.chrome() });
  return ground(g);
};
