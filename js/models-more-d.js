// Objetos nuevos (grupo D): cultura pop, historia de la tecnología, lujo, utilería de cine/TV,
// cultura mexicana, misterio y leyendas de los juguetes. Solo alto nivel (épico, legendario, único, exótico).
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, rng, add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, SW } from './modelkit.js';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
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

// =====================================================================
//  LEGENDARIOS / ÚNICOS / EXÓTICOS (segunda tanda)
// =====================================================================
// deformación por vértice con vector (v) => void
function warpV(geo, fn) {
  const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); fn(v); p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals();
  return geo;
}
// hundimientos/abultamientos suaves: { c:[x,y,z], r, d, dir:[x,y,z] }
function sculpt(geo, list) {
  return warpV(geo, (v) => {
    for (const h of list) {
      const dx = v.x - h.c[0], dy = v.y - h.c[1], dz = v.z - h.c[2];
      const dd = Math.sqrt(dx * dx + dy * dy + dz * dz) / h.r;
      if (dd < 1) { const k = h.d * Math.pow(1 - dd * dd, 2); v.x += h.dir[0] * k; v.y += h.dir[1] * k; v.z += h.dir[2] * k; }
    }
  });
}
const ell = (sx, sy, sz, ws = 48, hs = 32) => new THREE.SphereGeometry(1, ws, hs).scale(sx, sy, sz);
const smoothG = (geo) => mergeVertices(geo);

// ---------- Cabeza olmeca en miniatura ----------
BUILDERS_D.cabeza_olmeca_mini = () => {
  const g = new THREE.Group();
  const bas = mat(0xffffff, { map: stoneTex('olmeca2', [96, 92, 84], { spots: 500, veins: 1 }), roughness: 0.78 });
  const nz = noise3(1200);
  // cabeza: bloque redondeado, cara plana y ancha
  const head = smoothG(new THREE.SphereGeometry(1, 80, 60));
  head.scale(0.13, 0.16, 0.12);
  warpV(head, (v) => {
    if (v.y < -0.1) v.y = -0.1 + (v.y + 0.1) * 0.3; // corte plano en la base
    if (v.z > 0.05) v.z = 0.05 + (v.z - 0.05) * 0.55; // cara aplanada
    v.x *= 1.05 + Math.max(0, -v.y) * 0.6; // mejillas anchas
  });
  sculpt(head, [
    { c: [-0.045, 0.035, 0.08], r: 0.04, d: 0.022, dir: [0, 0, -1] }, { c: [0.045, 0.035, 0.08], r: 0.04, d: 0.022, dir: [0, 0, -1] }, // cuencas
    { c: [-0.045, 0.033, 0.066], r: 0.024, d: 0.014, dir: [0, 0, 1] }, { c: [0.045, 0.033, 0.066], r: 0.024, d: 0.014, dir: [0, 0, 1] }, // párpados hinchados
    { c: [0, 0.07, 0.08], r: 0.06, d: 0.008, dir: [0, 0, 1] }, // ceño
    { c: [0, -0.005, 0.085], r: 0.045, d: 0.03, dir: [0, -0.1, 1] }, // nariz ancha
    { c: [-0.028, -0.02, 0.09], r: 0.022, d: 0.012, dir: [0, 0, 1] }, { c: [0.028, -0.02, 0.09], r: 0.022, d: 0.012, dir: [0, 0, 1] }, // aletas
    { c: [0, -0.065, 0.085], r: 0.05, d: 0.026, dir: [0, 0, 1] }, // labios gruesos
    { c: [0, -0.066, 0.115], r: 0.04, d: 0.006, dir: [0, 0, -1] }, // comisura
    { c: [0, -0.05, 0.1], r: 0.03, d: 0.01, dir: [0, -1, 0] },
  ]);
  displace(head, (x, y, z) => nz(x * 30, y * 30, z * 30, 3) * 0.002);
  add(g, head, bas, 0, 0.15, 0);
  // casco ceñido con banda y orejeras
  const cap = smoothG(new THREE.SphereGeometry(1, 80, 40, 0, TAU, 0, PI * 0.5));
  cap.scale(0.142, 0.13, 0.13);
  warpV(cap, (v) => { if (v.z > 0.06) v.z = 0.06 + (v.z - 0.06) * 0.6; v.x *= 1.05; });
  displace(cap, (x, y, z) => nz(x * 25 + 3, y * 25, z * 25, 3) * 0.0025);
  cap.scale(1, 0.75, 1);
  add(g, cap, bas, 0, 0.245, -0.008);
  add(g, bandGeoD(0.138, 0.026, 0.012), bas, 0, 0.25, -0.008).scale.set(1.08, 1, 0.98);
  for (let i = 0; i < 7; i++) { const a = PI / 2 - 0.6 + i * 0.2; add(g, ell(0.011, 0.014, 0.01, 16, 12), bas, Math.cos(a) * 0.152, 0.262, Math.sin(a) * 0.136); } // garras de jaguar en la banda
  for (const s of [-1, 1]) { RB(g, 0.03, 0.15, 0.07, 0.012, bas, s * 0.142, 0.17, -0.02); lathe(g, smooth([[0, 0], [0.024, 0], [0.026, 0.008], [0.012, 0.012], [0, 0.012]], 10), bas, s * 0.158, 0.15, -0.01, 0, 0, s * PI / 2, 24); }
  // base de madera
  RB(g, 0.36, 0.05, 0.3, 0.008, woodM('olmeca_base', '#2a1408', { rough: 0.4 }), 0, 0.025, 0);
  plaque(g, 'SAN LORENZO · OLMECA', 'Réplica en basalto · 1200 a. C.', 0.12, 0.018, 0, 0.026, 0.1505, 0, 0);
  return ground(g);
};
function bandGeoD(r, w, t, seg = 96) { return latheGeo([[r, -w / 2], [r + t, -w / 2], [r + t, w / 2], [r, w / 2], [r, -w / 2]], seg); }

// ---------- Silla de charro con piteado y plata ----------
BUILDERS_D.silla_charro_plata = () => {
  const g = new THREE.Group();
  const pita = tex('piteado', 512, 512, (c, w, h) => {
    const R = rng(8); c.fillStyle = '#6a3a1a'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '20,8,2' : '150,90,40'},${R() * 0.15})`; c.fillRect(R() * w, R() * h, 2, 2); }
    c.strokeStyle = '#e8e0c8'; c.lineWidth = 3;
    const vine = (x0, y0, x1, y1) => { c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + 80, y0 - 60, x1 - 80, y1 + 60, x1, y1); c.stroke(); };
    for (let k = 0; k < 4; k++) { vine(20, 60 + k * 120, w - 20, 100 + k * 120); for (let j = 0; j < 8; j++) { const x = 50 + j * 58, y = 80 + k * 120 + Math.sin(j) * 18; c.beginPath(); c.ellipse(x, y, 14, 6, j, 0, TAU); c.stroke(); c.beginPath(); c.arc(x + 12, y - 14, 6, 0, TAU); c.stroke(); } }
    c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12);
  }, true);
  const leather = mat(0xffffff, { map: pita, roughness: 0.6, env: true, envI: 0.3 });
  const dark = C.leather(0x3a1e0c), silver = metal(0xdcdee2, 0.16), wood = woodM('estribo', '#6a3a1a', { rough: 0.4 });
  // caballete de madera
  const st = woodM('caballete', '#5a3a1e', { rough: 0.55 });
  B(g, 0.08, 0.05, 0.62, st, 0, 0.62, 0);
  for (const z of [-0.26, 0.26]) for (const s of [-1, 1]) B(g, 0.04, 0.68, 0.04, st, s * 0.07, 0.31, z, 0, 0, s * 0.2);
  for (const z of [-0.26, 0.26]) B(g, 0.22, 0.03, 0.03, st, 0, 0.18, z);
  // fuste: asiento curvo y faldones
  const S = grp(g, 0, 0.66, 0);
  const seat = new THREE.BoxGeometry(0.32, 0.04, 0.5, 10, 2, 16);
  warpV(seat, (v) => { const t = v.z / 0.25; v.y += t * t * 0.06 - Math.pow(v.x / 0.16, 2) * 0.04; if (t > 0.7) v.y += (t - 0.7) * 0.12; });
  add(S, seat, leather);
  for (const s of [-1, 1]) {
    const flap = new THREE.PlaneGeometry(0.42, 0.34, 8, 8); flap.translate(0, -0.17, 0);
    warpV(flap, (v) => { v.z += Math.sin((v.x + 0.21) / 0.42 * PI) * 0.01; });
    add(S, flap, mat(0xffffff, { map: pita, roughness: 0.6, side: THREE.DoubleSide }), s * 0.17, -0.0, 0.0, 0, s * PI / 2, s * -0.12).scale.set(1, 1, 1);
    // arciones y fenders (rosaderos)
    TU(S, [[s * 0.15, 0.0, 0.0], [s * 0.2, -0.18, 0.02], [s * 0.21, -0.36, 0.02]], 0.012, dark, false, 12);
    const fender = new THREE.PlaneGeometry(0.14, 0.26, 4, 6); fender.translate(0, -0.13, 0);
    add(S, fender, mat(0xffffff, { map: pita, roughness: 0.6, side: THREE.DoubleSide }), s * 0.205, -0.08, 0.02, 0, s * PI / 2, s * -0.1);
    // estribo de madera con casquillo de plata
    const sg = grp(S, s * 0.215, -0.42, 0.02, 0, 0, s * -0.08);
    const arch = new THREE.Shape(); arch.moveTo(-0.06, 0); arch.lineTo(0.06, 0); arch.lineTo(0.05, 0.1); arch.quadraticCurveTo(0, 0.13, -0.05, 0.1); arch.closePath(); arch.holes.push(rrect(0.08, 0.07, 0.02, 0, 0.05, true));
    EXS(sg, arch, 0.06, wood, 0, 0, 0, 0, PI / 2, 0, 0.004);
    RB(sg, 0.065, 0.012, 0.13, 0.004, silver, 0, 0.0, 0);
  }
  // cabeza de plata cincelada (horn) y teja trasera
  const horn = grp(S, 0, 0.06, 0.22);
  lathe(horn, smooth([[0, 0], [0.025, 0], [0.018, 0.04], [0.02, 0.08], [0.06, 0.1], [0.065, 0.11], [0.06, 0.12], [0, 0.122]], 30), mat(0xffffff, { map: engraveTex('silla_cabeza', '#dcdee2', 'rgba(40,44,50,0.6)'), metalness: 1, roughness: 0.18 }), 0, 0, 0, 0, 0, 0, 40);
  const cantle = new THREE.TorusGeometry(0.12, 0.02, 10, 32, PI); cantle.scale(1, 0.45, 1.6); add(S, cantle, leather, 0, 0.075, -0.21, -0.25, 0, 0);
  for (let i = 0; i < 9; i++) { const a = 0.15 + i / 8 * (PI - 0.3); lathe(S, smooth([[0, 0], [0.008, 0], [0, 0.005]], 6), silver, Math.cos(a) * 0.12, 0.075 + Math.sin(a) * 0.054, -0.18, PI / 2 - 0.25, 0, 0, 16); }
  for (const z of [-0.12, 0.08]) for (const s of [-1, 1]) lathe(S, smooth([[0, 0], [0.018, 0], [0.012, 0.005], [0, 0.007]], 8), silver, s * 0.16, 0.0, z, 0, 0, s * PI / 2, 20); // conchos
  plaque(g, 'SILLA DE GALA', 'Piteado y plata · Jalisco', 0.1, 0.016, 0, 0.62, 0.312, 0, 0);
  return ground(g);
};

// ---------- Sarape de Saltillo ----------
BUILDERS_D.sarape_saltillo = () => {
  const g = new THREE.Group();
  const weave = tex('saltillo', 512, 1024, (c, w, h) => {
    const R = rng(1850); c.fillStyle = '#6a1a1a'; c.fillRect(0, 0, w, h);
    const cols = ['#c8261a', '#e8a01a', '#1a6a3a', '#1a3a8a', '#f2e6cc', '#5a1a4a', '#e85a1a'];
    // fondo de grecas finas (zigzag)
    for (let y = 0; y < h; y += 8) { c.fillStyle = cols[(y / 8) % cols.length]; for (let x = 0; x < w; x += 16) { c.beginPath(); c.moveTo(x, y + 8); c.lineTo(x + 8, y); c.lineTo(x + 16, y + 8); c.fill(); } }
    c.fillStyle = 'rgba(80,10,10,0.55)'; c.fillRect(0, 0, w, h);
    // rombo central concéntrico dentado
    const cx = w / 2, cy = h / 2;
    for (let k = 14; k > 0; k--) { c.fillStyle = cols[k % cols.length]; const rx = k * 16, ry = k * 32; c.beginPath(); for (let i = 0; i <= 32; i++) { const t = i / 32 * TAU; const step = (i % 2 ? 0.92 : 1); c.lineTo(cx + Math.sign(Math.cos(t)) * Math.pow(Math.abs(Math.cos(t)), 1) * rx * step, cy + Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 1) * ry * step); } c.fill(); }
    // franjas de las orillas
    for (let y = 0; y < 60; y += 6) { c.fillStyle = cols[(y / 6) % cols.length]; c.fillRect(0, y, w, 6); c.fillRect(0, h - y - 6, w, 6); }
    // trama
    c.fillStyle = 'rgba(0,0,0,0.12)'; for (let x = 0; x < w; x += 2) c.fillRect(x, 0, 1, h);
  });
  const cloth = mat(0xffffff, { map: weave, roughness: 1, side: THREE.DoubleSide });
  // percha de hierro forjado
  const iron = mat(0x1c1c1c, { roughness: 0.5, metalness: 0.6, env: true, envI: 0.4 });
  for (const s of [-1, 1]) { CY(g, 0.012, 0.014, 1.2, iron, s * 0.42, 0.6, 0, 0, 0, 0, 12); TU(g, [[s * 0.42, 0.02, -0.14], [s * 0.42, 0.0, 0], [s * 0.42, 0.02, 0.14]], 0.014, iron, false, 10); SP(g, 0.022, iron, s * 0.42, 1.2, 0, 1, 1, 1, 12); }
  CY(g, 0.014, 0.014, 0.88, woodM('percha_sarape', '#5a3418'), 0, 1.18, 0, 0, 0, PI / 2, 16);
  // tejido colgante con caída en dos lados
  const W = 0.72, L = 1.3;
  const sh = new THREE.PlaneGeometry(W, L, 24, 60);
  warpV(sh, (v) => {
    const t = (v.y + L / 2) / L; // 0..1 a lo largo
    const ang = (t - 0.5) * PI; // dobla sobre la barra
    const fold = Math.abs(t - 0.5) * L;
    const side = t < 0.5 ? -1 : 1;
    const wave = Math.sin(v.x * 18 + t * 4) * 0.008 * fold;
    v.y = 1.18 + 0.02 - Math.max(0, fold - 0.03);
    v.z = side * (0.018 + Math.min(fold, 0.03) * 0.6) + wave + side * Math.max(0, fold - 0.03) * 0.04;
    if (side < 0) v.y -= 0.12; // un lado más largo
  });
  add(g, sh, cloth);
  // flecos
  const fr = [];
  for (const [y0, z0] of [[1.2 - (L / 2 - 0.03) - 0.12, -0.04], [1.2 - (L / 2 - 0.03), 0.04]]) for (let i = 0; i < 48; i++) { const x = -W / 2 + (i + 0.5) * W / 48; fr.push(tubeGeo([[x, y0, z0 * 0.9], [x + (i % 2 ? 0.003 : -0.003), y0 - 0.04, z0], [x, y0 - 0.075, z0 * 1.1]], 0.0018, 6, 4)); }
  merged(g, fr, mat(0xe8dcc0, { roughness: 1 }));
  return ground(g);
};

// ---------- Mesa de Talavera poblana ----------
BUILDERS_D.mesa_talavera = () => {
  const g = new THREE.Group();
  const tile = tex('talavera', 256, 256, (c, w, h) => {
    c.fillStyle = '#f4efe2'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    c.fillStyle = '#1a3a9a'; c.strokeStyle = '#1a3a9a'; c.lineWidth = 5;
    for (let k = 0; k < 8; k++) { c.save(); c.translate(cx, cy); c.rotate(k * PI / 4); c.beginPath(); c.ellipse(0, -60, 16, 34, 0, 0, TAU); c.fill(); c.restore(); }
    c.fillStyle = '#e8a01a'; c.beginPath(); c.arc(cx, cy, 30, 0, TAU); c.fill();
    c.fillStyle = '#1a3a9a'; c.beginPath(); c.arc(cx, cy, 12, 0, TAU); c.fill();
    for (const [x, y] of [[0, 0], [w, 0], [0, h], [w, h]]) { c.beginPath(); c.arc(x, y, 46, 0, TAU); c.fill(); c.fillStyle = '#e8a01a'; c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fill(); c.fillStyle = '#1a3a9a'; }
    c.strokeStyle = 'rgba(26,58,154,0.6)'; c.lineWidth = 2; c.strokeRect(1, 1, w - 2, h - 2);
    const R = rng(3); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(80,60,40,${R() * 0.06})`; c.fillRect(R() * w, R() * h, 2, 2); }
  }, true);
  const iron = mat(0x1a1a1a, { roughness: 0.45, metalness: 0.7, env: true, envI: 0.5 });
  const H = 0.74, Wt = 0.8;
  // cubierta: azulejos 5x5 con juntas
  RB(g, Wt + 0.04, 0.04, Wt + 0.04, 0.006, iron, 0, H - 0.02, 0);
  const tiles = mat(0xffffff, { map: rep(tile, 5, 5), roughness: 0.12, env: true, envI: 0.8 });
  B(g, Wt, 0.012, Wt, tiles, 0, H + 0.006, 0);
  // patas de herrería con volutas
  const legs = [];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = sx * (Wt / 2 - 0.04), z = sz * (Wt / 2 - 0.04);
    legs.push(tubeGeo([[x, H - 0.04, z], [x * 1.02, H * 0.5, z * 1.02], [x * 0.94, 0.12, z * 0.94], [x * 1.08, 0.015, z * 1.08]], 0.014, 24, 8));
    const sc = []; for (let i = 0; i <= 30; i++) { const t = i / 30, a = t * TAU * 1.4, r = 0.06 * (1 - t * 0.75); sc.push([x - sx * 0.07 + Math.cos(a) * r * sx * 0.7, H - 0.12 + Math.sin(a) * r, z - sz * 0.07 + Math.cos(a) * r * sz * 0.7]); }
    legs.push(tubeGeo(sc, 0.007, 40, 6));
    lathe(g, smooth([[0, 0], [0.03, 0], [0.02, 0.012], [0, 0.016]], 8), iron, x * 1.08, 0, z * 1.08, 0, 0, 0, 16);
  }
  // travesaño en X
  for (const s of [-1, 1]) legs.push(tubeGeo([[-(Wt / 2 - 0.05), 0.22, -s * (Wt / 2 - 0.05)], [0, 0.18, 0], [(Wt / 2 - 0.05), 0.22, s * (Wt / 2 - 0.05)]], 0.009, 16, 6));
  merged(g, legs, iron);
  TO(g, 0.05, 0.009, iron, 0, 0.18, 0, PI / 2, 0, 0, TAU, 24);
  // jarrón de talavera sobre la mesa
  lathe(g, smooth([[0, 0], [0.04, 0], [0.06, 0.05], [0.065, 0.1], [0.04, 0.15], [0.03, 0.17], [0.04, 0.2], [0.036, 0.2]], 30), mat(0xffffff, { map: rep(tile, 4, 1), roughness: 0.12, env: true, envI: 0.8, side: THREE.DoubleSide }), 0.15, H + 0.012, -0.1, 0, 0, 0, 40);
  return ground(g);
};

// ---------- Cámara telemétrica edición oro ----------
BUILDERS_D.camara_telemetrica_oro = () => {
  const g = new THREE.Group();
  const liz = tex('lagarto', 512, 256, (c, w, h) => {
    const R = rng(51); c.fillStyle = '#3a2a1a'; c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 10) for (let x = (y / 10 % 2) * 9; x < w; x += 18) { const s = 6 + R() * 5; c.fillStyle = `rgb(${70 + R() * 30},${50 + R() * 20},${30 + R() * 15})`; c.beginPath(); c.ellipse(x, y, s, s * 0.7, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(10,6,2,0.6)'; c.lineWidth = 1.2; c.stroke(); }
  }, true);
  const au = gold(0.18), skin = mat(0xffffff, { map: liz, roughness: 0.5, env: true, envI: 0.3 });
  const glassL = mat(0x1a2a3a, { roughness: 0.02, metalness: 0.3, env: true, envI: 1.6 });
  // estuche abierto de piel
  const box = C.leather(0x2a1608);
  RB(g, 0.24, 0.05, 0.16, 0.008, box, 0, 0.025, 0);
  RB(g, 0.22, 0.006, 0.14, 0.003, velvet('cam_oro', '#1a2a4a'), 0, 0.051, 0);
  const lid = grp(g, 0, 0.05, -0.08, -1.9, 0, 0); RB(lid, 0.24, 0.02, 0.16, 0.008, box, 0, 0.01, 0.08); RB(lid, 0.22, 0.004, 0.14, 0.002, velvet('cam_oro_t', '#d8c8a0'), 0, -0.001, 0.08);
  // cuerpo de la cámara
  const K = grp(g, 0, 0.054, 0.0);
  const bodyS = rrect(0.138, 0.078, 0.022);
  EXS(K, bodyS, 0.032, skin, 0, 0.039, 0, 0, 0, 0, 0.002);
  for (const yy of [0.004, 0.074]) RB(K, 0.14, 0.008, 0.034, 0.004, au, 0, yy, 0);
  RB(K, 0.14, 0.012, 0.036, 0.005, au, 0, 0.084, 0); // placa superior
  // ventanas del telémetro y visor
  for (const [x, w] of [[-0.045, 0.02], [0.012, 0.014], [0.05, 0.016]]) { RB(K, w + 0.004, 0.014, 0.003, 0.002, au, x, 0.066, 0.018); RB(K, w, 0.01, 0.002, 0.001, glassL, x, 0.066, 0.0195); }
  // perillas: velocidades, rebobinado, disparador
  lathe(K, smooth([[0, 0], [0.012, 0], [0.012, 0.008], [0.01, 0.01], [0, 0.01]], 10), au, 0.04, 0.09, 0, 0, 0, 0, 32);
  lathe(K, smooth([[0, 0], [0.014, 0], [0.014, 0.006], [0, 0.006]], 6), au, -0.045, 0.09, 0, 0, 0, 0, 32);
  CY(K, 0.004, 0.004, 0.006, mat(0x8a1a1a, { roughness: 0.3, env: true }), 0.058, 0.093, 0.004, 0, 0, 0, 12);
  RB(K, 0.02, 0.006, 0.014, 0.002, au, 0.0, 0.09, 0); // zapata
  // objetivo con anillos moleteados
  const L = grp(K, -0.008, 0.039, 0.016, PI / 2, 0, 0);
  const knurl = latheGeo([[0.019, 0], [0.019, 0.012]], 64); warpV(knurl, (v) => { const a = Math.atan2(v.z, v.x); const k = 1 + 0.03 * Math.sign(Math.sin(a * 32)); v.x *= k; v.z *= k; });
  lathe(L, [[0.016, 0], [0.022, 0], [0.022, 0.006], [0.02, 0.008]], au, 0, 0, 0, 0, 0, 0, 48);
  add(L, knurl, au, 0, 0.008, 0);
  lathe(L, smooth([[0.019, 0.02], [0.017, 0.03], [0.017, 0.036], [0.016, 0.038]], 8), mat(0x141414, { roughness: 0.3, env: true }), 0, 0, 0, 0, 0, 0, 48);
  add(L, new THREE.CircleGeometry(0.014, 48), glassL, 0, 0.0365, 0, -PI / 2, 0, 0);
  TO(L, 0.0142, 0.0012, au, 0, 0.037, 0, PI / 2, 0, 0, TAU, 48);
  // correa
  TU(K, [[-0.07, 0.07, 0], [-0.1, 0.04, 0.03], [-0.09, -0.04, 0.05], [0.0, -0.05, 0.06], [0.09, -0.04, 0.05], [0.1, 0.04, 0.03], [0.07, 0.07, 0]], 0.003, skin, false, 40);
  P(g, 0.1, 0.012, labelTex('EDICIÓN ORO · 0347/1000', { bg: '#1a2a4a', fg: '#e2b04a', w: 1024, h: 120, font: 'bold 60px Georgia' }), 0, 0.03, 0.0805, 0, 0, 0, { rough: 0.4 });
  return ground(g);
};

// ---------- Cifradora mecánica de ruedas de pines ----------
BUILDERS_D.cifradora_ruedas = () => {
  const g = new THREE.Group();
  const olive = mat(0xffffff, { map: wornTex('cifradora', '#4a5236', { chipCol: '#8a8a7a' }), roughness: 0.6, metalness: 0.4, env: true, envI: 0.4 });
  const blk = mat(0x1a1a1a, { roughness: 0.5 }), steel = C.steel(), alu = metal(0xc8ccd0, 0.3);
  // caja con tapa abierta
  RB(g, 0.18, 0.09, 0.13, 0.006, olive, 0, 0.045, 0);
  const lid = grp(g, 0, 0.09, -0.065, -1.95, 0, 0); RB(lid, 0.18, 0.03, 0.13, 0.006, olive, 0, 0.015, 0.065);
  P(lid, 0.12, 0.07, labelTex('CONVERTER M-209', { bg: '#d8d0b8', fg: '#1a1a1a', w: 512, h: 300, font: 'bold 40px monospace', sub: 'INSTRUCCIONES · SECRETO', subFont: '24px monospace' }), 0, 0.031, 0.065, -PI / 2, 0, PI, { rough: 0.8 });
  // placa superior y 6 ruedas de pines con letras
  B(g, 0.17, 0.004, 0.12, alu, 0, 0.092, 0);
  const wheelTex = tex('rueda_letras', 512, 64, (c, w, h) => { c.fillStyle = '#d8d8d0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = 'bold 30px monospace'; c.textAlign = 'center'; const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; for (let i = 0; i < 26; i++) c.fillText(L[i], (i + 0.5) / 26 * w, 42); });
  const wheels = [], pins = [];
  for (let i = 0; i < 6; i++) {
    const z = -0.04 + i * 0.016, r = 0.024 - i * 0.0012;
    const wg = grp(g, 0.01, 0.094, z, 0, 0, PI / 2);
    add(wg, new THREE.CylinderGeometry(r, r, 0.008, 40, 1, true), mat(0xffffff, { map: wheelTex, roughness: 0.5 }), 0, 0, 0, 0, 0, 0);
    for (let k = 0; k < 20; k++) { const a = k / 20 * TAU; pins.push(gx(new THREE.CylinderGeometry(0.0009, 0.0009, 0.004, 5), 0.01 + (k % 2 ? 0.003 : -0.003), 0.094 + Math.sin(a) * (r + 0.001), z + 0 * Math.cos(a), 0, 0, 0)); }
    wheels.push(gx(new THREE.CylinderGeometry(r * 0.6, r * 0.6, 0.009, 24), 0.01, 0.094, z, PI / 2, 0, 0));
  }
  merged(g, wheels, steel); merged(g, pins, steel);
  // rueda indicadora, manivela lateral y cinta impresa
  lathe(g, smooth([[0, 0], [0.022, 0], [0.022, 0.01], [0, 0.012]], 8), blk, -0.055, 0.094, 0.02, 0, 0, 0, 32);
  P(g, 0.03, 0.03, tex('dial_cif', 128, 128, (c, w, h) => { c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8e0c8'; c.font = 'bold 12px monospace'; c.textAlign = 'center'; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; c.fillText('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i], 64 + Math.cos(a) * 50, 68 + Math.sin(a) * 50); } }), -0.055, 0.107, 0.02, -PI / 2, 0, 0);
  const cr = grp(g, 0.092, 0.05, 0.0);
  CY(cr, 0.006, 0.006, 0.012, steel, 0.006, 0, 0, 0, 0, PI / 2, 12); B(cr, 0.006, 0.06, 0.008, steel, 0.014, -0.025, 0); CY(cr, 0.006, 0.006, 0.03, blk, 0.028, -0.05, 0, 0, 0, PI / 2, 12);
  const tape = tex('cinta_cif', 512, 32, (c, w, h) => { c.fillStyle = '#efe8d0'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a2a6a'; c.font = 'bold 20px monospace'; c.fillText('QZVKA RTMEO PLXWN BUSAG HDYIF', 8, 23); });
  add(g, ribbonGeo([[-0.09, 0.06, 0.03], [-0.12, 0.05, 0.05], [-0.15, 0.02, 0.07], [-0.2, 0.004, 0.09], [-0.26, 0.002, 0.07]], 0.012, [0, 1, 0], 40), mat(0xffffff, { map: tape, roughness: 0.9, side: THREE.DoubleSide }));
  return ground(g);
};

// ---------- Computadora casera de 1976 en estuche de koa ----------
BUILDERS_D.computadora_casera_1976 = () => {
  const g = new THREE.Group();
  const koa = woodM('koa', '#8a4a1a', { flame: 1.2, rough: 0.35 });
  // estuche: base trapezoidal (teclado inclinado al frente) y tapa de acrílico ahumado
  const prof = poly([[-0.17, 0], [0.17, 0], [0.17, 0.1], [0.0, 0.1], [-0.17, 0.05]]);
  EXS(g, prof, 0.44, koa, 0, 0, 0, 0, PI / 2, 0, 0.004);
  // placa de circuito (vista por el acrílico)
  const pcbT = pcbTex('apple1', { w: 512, h: 256, base: '#1a5a2a' });
  const top = grp(g, 0, 0.1, -0.09);
  B(top, 0.4, 0.003, 0.15, texM(pcbT, { roughness: 0.45 }), 0, 0.0015, 0);
  merged(top, chipsGeo(Array.from({ length: 40 }, (_, i) => [0.026, 0.008, -0.17 + (i % 10) * 0.034, -0.055 + Math.floor(i / 10) * 0.032, 0.004])).map(ge => gx(ge, 0, 0.003, 0)), mat(0x141414, { roughness: 0.4 }));
  for (let i = 0; i < 6; i++) CY(top, 0.007, 0.007, 0.018, mat(0x2a4aa0, { roughness: 0.3 }), 0.17 + (i % 2) * 0.018, 0.012, -0.05 + Math.floor(i / 2) * 0.03, 0, 0, 0, 14);
  const rim = []; for (const z of [-0.08, 0.08]) rim.push(gx(new THREE.BoxGeometry(0.44, 0.024, 0.012), 0, 0.012, z)); for (const x of [-0.214, 0.214]) rim.push(gx(new THREE.BoxGeometry(0.012, 0.024, 0.17), x, 0.012, 0)); merged(top, rim, koa);
  const acr = B(top, 0.42, 0.003, 0.15, glassD(0x3a2a20, 0.3), 0, 0.023, 0); acr.castShadow = false;
  // teclado
  const kb = grp(g, 0, 0.081, 0.085, Math.atan2(0.05, 0.17), 0, 0);
  RB(kb, 0.33, 0.01, 0.11, 0.003, mat(0x2a2a2a, { roughness: 0.6 }), 0, 0, 0);
  const keys = [], keysG = [];
  const capT = tex('teclas_1976', 512, 256, (c, w, h) => { c.fillStyle = '#e8e4d8'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = 'bold 22px monospace'; c.textAlign = 'center'; const rows = ['1234567890:-', 'QWERTYUIOP@', 'ASDFGHJKL;', 'ZXCVBNM,./']; rows.forEach((r, j) => [...r].forEach((ch, i) => c.fillText(ch, (i + 0.5) / 12 * w, (j + 0.65) / 4 * h))); });
  const capM = mat(0xffffff, { map: capT, roughness: 0.4 });
  for (let j = 0; j < 4; j++) for (let i = 0; i < 12 - (j > 1 ? 1 + (j - 1) : 0); i++) {
    const ge = new RoundedBoxGeometry(0.019, 0.012, 0.019, 2, 0.003);
    const uv = ge.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, (i + uv.getX(k)) / 12, 1 - (j + 1 - uv.getY(k)) / 4);
    keys.push(gx(ge, -0.13 + i * 0.023 + j * 0.006, 0.01, -0.04 + j * 0.024));
  }
  merged(kb, keys, capM);
  RB(kb, 0.13, 0.012, 0.019, 0.003, mat(0xe8e4d8, { roughness: 0.4 }), 0.0, 0.01, 0.058);
  // placa de latón y cassette
  P(g, 0.08, 0.016, labelTex('PROTOTYPE · 1976', { bg: '#c9a24e', fg: '#3a2608', w: 512, h: 100, font: 'bold 44px Georgia' }), 0.12, 0.045, 0.2201, 0, 0, 0, { rough: 0.35 });
  RB(g, 0.1, 0.016, 0.065, 0.003, mat(0xe8e4d8, { roughness: 0.4 }), 0.26, 0.008, 0.06);
  P(g, 0.06, 0.03, labelTex('BASIC', { bg: '#f2ead0', fg: '#1a2a6a', w: 256, h: 128, font: 'bold 48px monospace' }), 0.26, 0.0165, 0.06, -PI / 2, 0, 0);
  return ground(g);
};

// ---------- Gargantilla de zafiros en busto ----------
BUILDERS_D.gargantilla_zafiros = () => {
  const g = new THREE.Group();
  const vel = velvet('busto', '#14141a');
  // busto de terciopelo: cuello y hombros
  // torso: hombros anchos y pecho plano; cuello y remate redondeado
  const torso = smoothG(new THREE.SphereGeometry(1, 64, 40, 0, TAU, 0, PI * 0.62));
  torso.scale(0.15, 0.13, 0.075);
  warpV(torso, (v) => { const t = v.y / 0.13; v.x *= 1 + Math.max(0, 0.6 - t) * 0.15; if (t > 0.7) { v.x *= 1 - (t - 0.7) * 0.9; v.z *= 1 - (t - 0.7) * 0.5; } });
  add(g, torso, vel, 0, 0.1, 0);
  add(g, latheGeo([[0.105, 0], [0.105, 0.0], [0.12, 0.04], [0.135, 0.1]], 48).scale(1.1, 1, 0.55), vel, 0, 0.0, 0);
  lathe(g, smooth([[0.048, 0], [0.044, 0.06], [0.042, 0.1], [0.046, 0.11], [0.03, 0.125], [0, 0.128]], 20), vel, 0, 0.19, 0, 0, 0, 0, 48);
  lathe(g, smooth([[0, 0], [0.09, 0], [0.09, 0.02], [0.06, 0.04], [0.03, 0.06], [0, 0.06]], 16), lacquer(0x0e0e10), 0, 0, 0, 0, 0, 0, 48);
  // gargantilla: collar de brillantes en platino con caída de zafiros
  const pt = whiteGold(), sap = gem(0x1a3ab8, { transmission: 0.45, opacity: 0.92, emissive: 0x0a1a5a, ei: 0.35 });
  const neckY = 0.255, cr = 0.06;
  const pts = []; for (let i = 0; i <= 64; i++) { const a = -PI * 0.95 + i / 64 * PI * 0.9; pts.push([Math.cos(a + PI / 2) * cr * 1.0, neckY - Math.pow(Math.sin(a + PI / 2), 2) * 0.0 - (1 - Math.abs(i - 32) / 32) * 0.06, Math.sin(a + PI / 2) * cr * 0.85 + 0.002]); }
  // la cadena rodea el frente del cuello y baja hacia el escote
  const chain = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = PI * (0.08 + t * 0.84); chain.push([Math.cos(a) * 0.07 * (1 + Math.sin(a) * 0.4), neckY - 0.01 - Math.sin(a) * 0.055, Math.sin(a) * 0.055 + 0.012]); }
  TU(g, chain, 0.0016, pt, false, 120);
  stonesAlong(g, chain.filter((_, i) => i % 1 === 0), 0.0028, diamond(), (p) => [PI / 2 + 0.6, 0, 0]);
  // siete zafiros de pera colgando con halo
  for (let k = 0; k < 7; k++) {
    const t = 0.2 + k / 6 * 0.6, a = PI * (0.08 + t * 0.84);
    const x = Math.cos(a) * 0.07 * (1 + Math.sin(a) * 0.4), y = neckY - 0.012 - Math.sin(a) * 0.055, z = Math.sin(a) * 0.055 + 0.016;
    const s = k === 3 ? 1.6 : 1 - Math.abs(k - 3) * 0.1;
    const pg = grp(g, x, y - 0.012 * s, z, 0.55, 0, 0);
    const pear = latheGeo(smooth([[0, -0.01], [0.006, -0.006], [0.0075, 0.0], [0.005, 0.006], [0, 0.011]], 16), 12); pear.scale(s, s, s * 0.6);
    add(pg, pear, sap);
    TO(pg, 0.0085 * s, 0.0012, pt, 0, 0, 0, 0, 0, 0, TAU, 24);
    stonesAlong(pg, Array.from({ length: 10 }, (_, i) => { const b = i / 10 * TAU; return [Math.cos(b) * 0.0092 * s, Math.sin(b) * 0.0092 * s, 0.001]; }), 0.0012, diamond(), () => [PI / 2, 0, 0]);
  }
  plaque(g, 'ZAFIROS DE CEILÁN', 'Platino y brillantes', 0.09, 0.015, 0, 0.032, 0.083, -0.6, 0);
  return ground(g);
};

// ---------- Copa de campeón mundial (réplica) ----------
BUILDERS_D.copa_campeon_mundial = () => {
  const g = new THREE.Group();
  const au = gold(0.16), mal = mat(0xffffff, { map: tex('malaquita', 512, 128, (c, w, h) => { c.fillStyle = '#0e5a3a'; c.fillRect(0, 0, w, h); for (let k = 0; k < 40; k++) { c.strokeStyle = k % 2 ? 'rgba(10,40,25,0.7)' : 'rgba(80,190,130,0.5)'; c.lineWidth = 2 + (k % 3); c.beginPath(); for (let x = 0; x <= w; x += 4) c.lineTo(x, k * 3.5 + Math.sin(x / 40 + k * 0.3) * 10); c.stroke(); } }, true), roughness: 0.15, env: true, envI: 0.8 });
  // base: anillos de oro y bandas de malaquita
  lathe(g, smooth([[0, 0], [0.065, 0], [0.066, 0.006], [0.062, 0.01]], 10), au, 0, 0, 0, 0, 0, 0, 64);
  add(g, latheGeo([[0.062, 0.01], [0.062, 0.022], [0.06, 0.024], [0.06, 0.036], [0.062, 0.038]], 64), mal);
  lathe(g, [[0.062, 0.038], [0.064, 0.04], [0.062, 0.044], [0, 0.044]], au, 0, 0, 0, 0, 0, 0, 64);
  // espirales que suben abrazando el mundo (dos figuras estilizadas por lado)
  const sp = [];
  for (let k = 0; k < 4; k++) {
    const a0 = k / 4 * TAU, pts = [];
    for (let i = 0; i <= 30; i++) { const t = i / 30, a = a0 + t * PI * 0.85, r = 0.056 - Math.sin(t * PI) * 0.03 + t * 0.008; pts.push([Math.cos(a) * r, 0.044 + t * 0.21, Math.sin(a) * r]); }
    sp.push(swGeo(pts, (t) => 0.012 - Math.sin(t * PI) * 0.004, 12, 40, 0.55));
  }
  merged(g, sp, au);
  lathe(g, smooth([[0, 0.044], [0.03, 0.05], [0.018, 0.12], [0.03, 0.2], [0.04, 0.25], [0, 0.26]], 30), au, 0, 0, 0, 0, 0, 0, 48);
  // brazos que sostienen el globo
  for (let k = 0; k < 4; k++) { const a = k / 4 * TAU + PI * 0.85; add(g, swGeo([[Math.cos(a) * 0.045, 0.24, Math.sin(a) * 0.045], [Math.cos(a) * 0.055, 0.27, Math.sin(a) * 0.055], [Math.cos(a) * 0.04, 0.3, Math.sin(a) * 0.04]], [0.007, 0.006, 0.005], 8, 12), au); }
  // globo con continentes en relieve
  const globeT = tex('globo_copa', 512, 256, (c, w, h) => { c.fillStyle = '#c8962a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(80,50,5,0.6)'; c.lineWidth = 1.5; for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo(i / 12 * w, 0); c.lineTo(i / 12 * w, h); c.stroke(); } for (let j = 1; j < 6; j++) { c.beginPath(); c.moveTo(0, j / 6 * h); c.lineTo(w, j / 6 * h); c.stroke(); } c.fillStyle = '#f2c860'; const R = rng(1930); for (let k = 0; k < 9; k++) { c.beginPath(); const x = R() * w, y = 40 + R() * (h - 80); for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; c.lineTo(x + Math.cos(a) * (20 + R() * 40), y + Math.sin(a) * (14 + R() * 26)); } c.fill(); } });
  add(g, new THREE.SphereGeometry(0.052, 48, 32), mat(0xffffff, { map: globeT, metalness: 1, roughness: 0.22, bumpMap: globeT, bumpScale: 0.003 }), 0, 0.345, 0);
  // pedestal negro con placa
  RB(g, 0.2, 0.05, 0.2, 0.008, lacquer(0x0e0e10), 0, -0.025, 0);
  plaque(g, 'CAMPEÓN DEL MUNDO', 'Réplica oficial', 0.1, 0.016, 0, -0.025, 0.1005, 0, 0);
  return ground(g);
};

// ---------- Reloj de mesa de esmalte guilloché ----------
BUILDERS_D.reloj_mesa_guilloche = () => {
  const g = new THREE.Group();
  const pink = new THREE.MeshPhysicalMaterial({ map: guillocheTex('rosa', '#e8889c', 'rgba(140,40,70,0.45)', { rays: 24, rings: 50 }), roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, metalness: 0.25, envMapIntensity: 1.3 });
  const au = gold(0.18), rose = roseGold(), pearl = mat(0xf6f0e6, { roughness: 0.15, env: true, envI: 1.0 });
  // cuerpo cuadrado con remate en arco, sobre patas de bola
  const sh = new THREE.Shape(); sh.moveTo(-0.06, 0); sh.lineTo(0.06, 0); sh.lineTo(0.06, 0.11); sh.quadraticCurveTo(0.06, 0.14, 0.0, 0.15); sh.quadraticCurveTo(-0.06, 0.14, -0.06, 0.11); sh.closePath();
  const body = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 3, curveSegments: 32 });
  { const uv = body.attributes.uv, p = body.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + 0.075) / 0.15, (p.getY(i) + 0.0) / 0.15); }
  add(g, body, pink, 0, 0.015, -0.015);
  // marco de perlas y laureles
  const outline = sh.getSpacedPoints(80);
  for (const [i, p] of outline.entries()) if (i % 2 === 0) SP(g, 0.0026, pearl, p.x * 1.02, 0.015 + p.y * 1.0 + (p.y < 0.001 ? 0.002 : 0), 0.0175, 1, 1, 1, 10);
  TU(g, outline.map(p => [p.x * 0.92, 0.015 + 0.006 + p.y * 0.92, 0.0175]), 0.0012, rose, true, 160);
  // esfera blanca de esmalte con números y manecillas
  const dial = tex('dial_guil', 256, 256, (c, w, h) => { c.fillStyle = '#f8f4ec'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a1a'; c.font = 'bold 22px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - PI / 2; c.fillText(['I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], w / 2 + Math.cos(a) * 96, h / 2 + Math.sin(a) * 96); } });
  const dy = 0.015 + 0.075;
  CY(g, 0.034, 0.034, 0.004, au, 0, dy, 0.017, PI / 2, 0, 0, 48);
  add(g, new THREE.CircleGeometry(0.03, 48), mat(0xffffff, { map: dial, roughness: 0.2, env: true, envI: 0.6 }), 0, dy, 0.0192);
  TO(g, 0.031, 0.0018, au, 0, dy, 0.0192, 0, 0, 0, TAU, 48);
  for (const [l, a] of [[0.018, 2.3], [0.025, 0.2]]) { const hg = grp(g, 0, dy, 0.02, 0, 0, a); B(hg, 0.0018, l, 0.0006, au, 0, l / 2, 0); }
  // guirnalda y lazo de oro de colores arriba
  for (let k = 0; k < 9; k++) { const a = PI * 0.15 + k / 8 * PI * 0.7; SP(g, 0.004, k % 2 ? rose : mat(0x8ab07a, { metalness: 1, roughness: 0.25 }), Math.cos(a) * 0.05, dy + Math.sin(a) * 0.05, 0.019, 1.4, 0.7, 0.6, 10); }
  TO(g, 0.008, 0.002, au, -0.008, 0.162, 0.0, 0, 0, 0.6, TAU, 16); TO(g, 0.008, 0.002, au, 0.008, 0.162, 0.0, 0, 0, -0.6, TAU, 16); SP(g, 0.004, au, 0, 0.162, 0);
  // base escalonada y patas de bola
  RB(g, 0.14, 0.012, 0.05, 0.003, au, 0, 0.012, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) SP(g, 0.006, au, sx * 0.06, 0.006, sz * 0.018, 1, 1, 1, 12);
  // soporte trasero
  B(g, 0.01, 0.12, 0.004, rose, 0, 0.07, -0.04, -0.3, 0, 0);
  return ground(g);
};

// ---------- Modelo de satélite de museo ----------
BUILDERS_D.modelo_satelite = () => {
  const g = new THREE.Group();
  const foilT = tex('foil', 256, 256, (c, w, h) => { const R = rng(9); c.fillStyle = '#d8a83a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 60; i++) { c.strokeStyle = `rgba(${R() < 0.5 ? '255,240,180' : '120,80,20'},${0.2 + R() * 0.3})`; c.lineWidth = 1 + R() * 3; c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (R() - 0.5) * 80; y += (R() - 0.5) * 80; c.lineTo(x, y); } c.stroke(); } }, true);
  const foil = mat(0xffffff, { map: foilT, metalness: 1, roughness: 0.25, bumpMap: foilT, bumpScale: 0.003 });
  const panelT = tex('panel_solar', 256, 512, (c, w, h) => { c.fillStyle = '#0a1a3a'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 32) for (let x = 0; x < w; x += 32) { const gr = c.createLinearGradient(x, y, x + 32, y + 32); gr.addColorStop(0, '#1a3a8a'); gr.addColorStop(1, '#0a1a4a'); c.fillStyle = gr; c.fillRect(x + 1.5, y + 1.5, 29, 29); } c.strokeStyle = 'rgba(200,210,230,0.4)'; for (let x = 0; x < w; x += 8) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } });
  const pan = mat(0xffffff, { map: panelT, roughness: 0.15, metalness: 0.4, env: true, envI: 1.0 }), alu = metal(0xc8ccd0, 0.3), white = mat(0xf2f2ee, { roughness: 0.4 });
  const S = grp(g, 0, 0.34, 0);
  // bus central con aislamiento dorado
  RB(S, 0.14, 0.16, 0.14, 0.01, foil, 0, 0, 0);
  B(S, 0.142, 0.012, 0.142, white, 0, 0.08, 0); B(S, 0.142, 0.012, 0.142, white, 0, -0.08, 0);
  // paneles solares desplegados (dos alas de 3 secciones)
  for (const s of [-1, 1]) {
    CY(S, 0.004, 0.004, 0.06, alu, s * 0.1, 0, 0, 0, 0, PI / 2, 8);
    for (let k = 0; k < 3; k++) { const x = s * (0.15 + k * 0.105); RB(S, 0.1, 0.004, 0.14, 0.001, alu, x, 0, 0); P(S, 0.096, 0.136, panelT, x, 0.0025, 0, -PI / 2, 0, 0, { rough: 0.15 }); P(S, 0.096, 0.136, panelT, x, -0.0025, 0, PI / 2, 0, 0); }
  }
  // antena parabólica y alimentador
  const dish = grp(S, 0, 0.1, 0.03, -0.5, 0, 0);
  CY(dish, 0.006, 0.008, 0.04, alu, 0, 0.0, 0, 0, 0, 0, 10);
  add(dish, latheGeo(smooth([[0, 0], [0.04, 0.008], [0.075, 0.03]], 16), 48), mat(0xf6f6f2, { roughness: 0.35, side: THREE.DoubleSide }), 0, 0.02, 0);
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; TU(dish, [[Math.cos(a) * 0.07, 0.05, Math.sin(a) * 0.07], [0, 0.085, 0]], 0.0012, alu, false, 4); }
  CY(dish, 0.006, 0.006, 0.016, alu, 0, 0.088, 0, 0, 0, 0, 10);
  // antenas látigo, toberas y sensores
  for (const s of [-1, 1]) TU(S, [[s * 0.06, -0.08, 0.06], [s * 0.1, -0.16, 0.1]], 0.0015, alu, false, 4);
  for (const [x, z] of [[0.04, 0.04], [-0.04, -0.04]]) lathe(S, smooth([[0.004, 0], [0.006, -0.01], [0.012, -0.02]], 8), metal(0x3a3a3a, 0.4), x, -0.086, z, 0, 0, 0, 16);
  RB(S, 0.03, 0.02, 0.02, 0.004, mat(0x1a1a1a, { roughness: 0.3 }), 0.04, 0.0, 0.075);
  // mástil y base de exhibición
  CY(g, 0.008, 0.008, 0.26, alu, 0, 0.13, 0, 0, 0, 0, 12);
  RB(g, 0.3, 0.03, 0.2, 0.006, lacquer(0x101014), 0, 0.015, 0);
  plaque(g, 'MODELO DE FÁBRICA', 'Satélite de comunicaciones · 1:15', 0.11, 0.016, 0, 0.016, 0.1005, 0, 0);
  return ground(g);
};

// ---------- Reloj esqueleto con diamantes ----------
BUILDERS_D.reloj_esqueleto_diamantes = () => {
  const g = new THREE.Group();
  const wg = whiteGold(), au = gold(0.2), ruby = gem(0xc8102a, { opacity: 0.95 });
  // estuche abierto con cojín
  const box = lacquer(0x1a0e08);
  RB(g, 0.14, 0.05, 0.14, 0.01, box, 0, 0.025, 0);
  const lid = grp(g, 0, 0.05, -0.07, -1.85, 0, 0); RB(lid, 0.14, 0.03, 0.14, 0.01, box, 0, 0.015, 0.07); P(lid, 0.12, 0.12, labelTex('HAUTE HORLOGERIE', { bg: '#f2ead8', fg: '#8a6a2a', w: 512, h: 512, font: 'italic bold 44px Georgia', sub: 'Tourbillon · Squelette', subFont: 'italic 30px Georgia' }), 0, -0.001, 0.07, PI / 2, 0, 0, { rough: 0.6 });
  add(g, ell(0.05, 0.022, 0.035, 32, 20), velvet('cojin_reloj', '#f2ead8'), 0, 0.058, 0.0);
  // caja del reloj sobre el cojín
  const W = grp(g, 0, 0.083, 0.0, -0.35, 0, 0);
  const R0 = 0.021;
  lathe(W, smooth([[0, -0.005], [R0, -0.005], [R0 + 0.002, 0.0], [R0 + 0.001, 0.005], [0, 0.005]], 16), wg, 0, 0, 0, PI / 2, 0, 0, 64);
  stonesAlong(W, Array.from({ length: 36 }, (_, i) => { const a = i / 36 * TAU; return [Math.cos(a) * (R0 - 0.0005), Math.sin(a) * (R0 - 0.0005), 0.0055]; }), 0.0016, diamond(), () => [PI / 2, 0, 0]);
  // movimiento calado: puentes y engranes a la vista
  const plate = new THREE.Shape(); plate.absarc(0, 0, R0 - 0.0025, 0, TAU, false);
  for (const [x, y, r] of [[0.008, 0.006, 0.006], [-0.008, -0.004, 0.005], [0.0, -0.011, 0.0045], [-0.009, 0.009, 0.004]]) plate.holes.push(circ(r, x, y, true));
  EXS(W, plate, 0.0012, metal(0x8a8e94, 0.3), 0, 0, 0.002, 0, 0, 0, 0.0003);
  for (const [x, y, r, n] of [[0.008, 0.006, 0.0055, 30], [-0.008, -0.004, 0.0045, 24], [0.0, -0.011, 0.004, 20], [-0.009, 0.009, 0.0035, 18], [0.004, 0.0, 0.003, 14]]) add(W, gearGeo(r, n, 0.0008, { rIn: r * 0.25, spokes: 4 }), au, x, y, 0.0028);
  for (const [x, y] of [[0.008, 0.006], [-0.008, -0.004], [0.0, -0.011]]) SP(W, 0.0009, ruby, x, y, 0.0038, 1, 1, 0.5, 8);
  // jaula del tourbillon a las 6
  const tb = grp(W, 0, -0.011, 0.0035);
  TO(tb, 0.004, 0.0004, wg, 0, 0, 0, 0, 0, 0, TAU, 24); for (let i = 0; i < 3; i++) B(tb, 0.0006, 0.008, 0.0005, wg, 0, 0, 0.0005, 0, 0, i * PI / 3);
  // manecillas esqueleto y cristal de zafiro
  for (const [l, a] of [[0.012, 0.9], [0.017, -0.5]]) { const hg = grp(W, 0, 0, 0.0048, 0, 0, a); TU(hg, [[0, 0, 0], [0.0012, l * 0.5, 0], [0, l, 0], [-0.0012, l * 0.5, 0], [0, 0, 0]], 0.0004, au, false, 16); }
  add(W, new THREE.CircleGeometry(R0 - 0.001, 48), glassD(0xeef6ff, 0.12), 0, 0, 0.0052);
  // corona y correa de cocodrilo curvada
  CY(W, 0.002, 0.002, 0.004, wg, R0 + 0.003, 0, 0, 0, 0, PI / 2, 12);
  const croc = mat(0xffffff, { map: tex('cocodrilo', 256, 512, (c, w, h) => { const R = rng(4); c.fillStyle = '#1a0e08'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 24) for (let x = (y / 24 % 2) * 20; x < w; x += 40) { c.strokeStyle = 'rgba(80,50,30,0.7)'; c.lineWidth = 2; c.strokeRect(x + 2, y + 2, 36 + R() * 4, 20); } }, true), roughness: 0.35, env: true, envI: 0.4 });
  for (const s of [-1, 1]) { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push([0, s * (R0 + t * 0.06), -t * t * 0.03 - 0.002]); } add(W, ribbonGeo(pts, 0.018, [1, 0, 0], 24, (u) => 1 - u * 0.2), mat(0xffffff, { map: croc.map, roughness: 0.35, side: THREE.DoubleSide })); }
  return ground(g);
};

// ---------- Pectoral de jade y oro ----------
BUILDERS_D.pectoral_jade_oro = () => {
  const g = new THREE.Group();
  const au = gold(0.24), jade = mat(0x2a8a5a, { roughness: 0.18, env: true, envI: 0.8 }), turq = mat(0x3ab8a8, { roughness: 0.3, env: true, envI: 0.5 });
  // tablero de terciopelo inclinado
  const vb = grp(g, 0, 0.0, 0, 0, 0, 0);
  RB(vb, 0.36, 0.03, 0.08, 0.006, woodM('pectoral_base', '#2a1408'), 0, 0.015, 0.06);
  const board = grp(g, 0, 0.17, 0, -0.22, 0, 0);
  RB(board, 0.34, 0.34, 0.02, 0.006, velvet('pectoral', '#1a1a1a'), 0, 0, -0.012);
  // máscara central de oro fundido (dios con tocado)
  const D = grp(board, 0, 0.04, 0.0);
  lathe(D, smooth([[0, 0.0], [0.05, 0.0], [0.052, 0.004], [0.04, 0.01], [0, 0.012]], 14), au, 0, 0, 0, PI / 2, 0, 0, 48);
  const face = smoothG(new THREE.SphereGeometry(1, 40, 30, 0, PI, 0, PI)); face.scale(0.028, 0.034, 0.012);
  sculpt(face, [{ c: [-0.01, 0.006, 0.01], r: 0.008, d: 0.003, dir: [0, 0, -1] }, { c: [0.01, 0.006, 0.01], r: 0.008, d: 0.003, dir: [0, 0, -1] }, { c: [0, -0.004, 0.012], r: 0.008, d: 0.004, dir: [0, 0, 1] }, { c: [0, -0.016, 0.01], r: 0.008, d: 0.003, dir: [0, 0, 1] }]);
  add(D, face, au, 0, -0.002, 0.012);
  for (let i = 0; i < 9; i++) { const a = PI * 0.15 + i / 8 * PI * 0.7; add(D, swGeo([[Math.cos(a) * 0.035, Math.sin(a) * 0.035, 0.012], [Math.cos(a) * 0.07, Math.sin(a) * 0.07 + 0.01, 0.01]], [0.004, 0.0025], 6, 6, 0.5), au); } // plumas del tocado
  for (const s of [-1, 1]) lathe(D, smooth([[0, 0], [0.012, 0], [0.01, 0.004], [0, 0.005]], 8), turq, s * 0.038, -0.004, 0.006, PI / 2, 0, 0, 20); // orejeras
  // sartas de cuentas de jade que cuelgan en arco
  const beads = [], goldB = [];
  for (let r = 0; r < 3; r++) for (let i = 0; i <= 22; i++) { const t = i / 22, a = PI * (0.1 + t * 0.8); const x = Math.cos(a) * (0.13 - r * 0.018), y = -Math.sin(a) * (0.06 + r * 0.025) + 0.1; (i % 4 === 2 ? goldB : beads).push(gx(new THREE.SphereGeometry(0.0055 - r * 0.0008, 14, 10), x, y, 0.004)); }
  merged(board, beads, jade); merged(board, goldB, au);
  // fila de cascabeles
  for (let i = 0; i < 9; i++) { const x = -0.1 + i * 0.025, cb = grp(board, x, -0.1 + Math.abs(i - 4) * 0.004, 0.006); TU(cb, [[0, 0.04, 0], [0, 0.012, 0]], 0.0008, au, false, 4); lathe(cb, smooth([[0, 0.012], [0.006, 0.008], [0.008, 0.0], [0.006, -0.008], [0, -0.01]], 12), au, 0, 0, 0, 0, 0, 0, 20); B(cb, 0.008, 0.0012, 0.004, mat(0x1a1408, { roughness: 1 }), 0, -0.006, 0.006); }
  // placas trapezoidales de oro a los lados
  for (const s of [-1, 1]) EXS(board, poly([[-0.018, -0.02], [0.018, -0.02], [0.012, 0.02], [-0.012, 0.02]]), 0.002, au, s * 0.085, 0.05, 0.002, 0, 0, 0, 0.0008);
  plaque(g, 'PECTORAL MIXTECO', 'Oro a la cera perdida y jade', 0.1, 0.015, 0, 0.016, 0.1005, 0, 0);
  return ground(g);
};

// ---------- Coatlicue en miniatura ----------
BUILDERS_D.coatlicue_miniatura = () => {
  const g = new THREE.Group();
  const nz = noise3(1790);
  const stone = mat(0xffffff, { map: stoneTex('coatlicue', [118, 112, 100], { spots: 1500, veins: 2 }), roughness: 0.85 });
  const skirtT = tex('falda_serpientes', 512, 512, (c, w, h) => {
    c.fillStyle = '#7a7266'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(30,26,20,0.75)'; c.lineWidth = 4;
    for (let row = 0; row < 8; row++) for (let k = 0; k < 6; k++) { const x0 = (k + (row % 2) * 0.5) / 6 * w, y0 = row / 8 * h; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x0 + w / 12, y0 + h / 8); c.lineTo(x0 + w / 6, y0); c.stroke(); for (let s = 0; s < 4; s++) { c.beginPath(); c.moveTo(x0 + 6 + s * 9, y0 + 6 + s * 12); c.lineTo(x0 + w / 6 - 6 - s * 9, y0 + 6 + s * 12); c.stroke(); } }
  }, true);
  const skirt = mat(0xffffff, { map: skirtT, roughness: 0.85, bumpMap: skirtT, bumpScale: 0.004 });
  // cuerpo: bloque trapezoidal (falda) y torso con collar de manos y corazones
  const body = new THREE.BoxGeometry(0.16, 0.22, 0.1, 8, 12, 6);
  warpV(body, (v) => { const t = (v.y + 0.11) / 0.22; v.x *= 1 + (0.5 - t) * 0.25; v.z *= 1 + (0.5 - t) * 0.15; });
  add(g, body, skirt, 0, 0.17, 0);
  const torso = new THREE.BoxGeometry(0.17, 0.1, 0.11, 8, 6, 6); warpV(torso, (v) => { v.x *= 1 + (v.y / 0.05) * 0.06; }); add(g, torso, stone, 0, 0.33, 0);
  for (let i = 0; i < 6; i++) { const x = -0.06 + i * 0.024; add(g, ell(0.011, 0.014, 0.006, 12, 10), stone, x, 0.34 - Math.abs(i - 2.5) * 0.008, 0.057); } // collar de manos
  add(g, ell(0.03, 0.025, 0.01, 16, 12), stone, 0, 0.31, 0.058); // cráneo pectoral
  // brazos con garras (cabezas de serpiente en los codos)
  for (const s of [-1, 1]) { add(g, swGeo([[s * 0.088, 0.37, 0], [s * 0.1, 0.33, 0.04], [s * 0.08, 0.31, 0.07]], [0.022, 0.02, 0.018], 10, 12, 0.8), stone); add(g, ell(0.02, 0.015, 0.025, 14, 10), stone, s * 0.08, 0.31, 0.085); }
  // cabeza: dos serpientes enfrentadas formando el rostro
  const H = grp(g, 0, 0.42, 0.0);
  for (const s of [-1, 1]) {
    const head = smoothG(ell(0.045, 0.04, 0.06, 32, 24));
    warpV(head, (v) => { v.x *= 1 - Math.max(0, v.z / 0.06) * 0.35; });
    displace(head, (x, y, z) => nz(x * 40 + s, y * 40, z * 40, 2) * 0.002);
    add(H, head, stone, s * 0.035, 0.02, 0.0, 0, s * 0.35, 0);
    SP(H, 0.009, mat(0x2a2620, { roughness: 0.9 }), s * 0.045, 0.045, 0.04, 1, 1, 0.6, 12); // ojos
    for (let k = 0; k < 2; k++) CO(H, 0.006, 0.026, mat(0xb8b0a0, { roughness: 0.7 }), s * (0.008 + k * 0.012), -0.008, 0.055, PI, 0, 0, 8); // colmillos
  }
  add(H, ribbonGeo([[0, -0.01, 0.06], [0, -0.04, 0.07], [0, -0.06, 0.065]], 0.02, [1, 0, 0], 12, (u) => 1 - u * 0.5), mat(0x6a6256, { roughness: 0.9, side: THREE.DoubleSide })); // lengua bífida
  // pies con garras y base
  for (const s of [-1, 1]) { RB(g, 0.05, 0.04, 0.06, 0.01, stone, s * 0.05, 0.06, 0.02); for (let k = 0; k < 3; k++) CO(g, 0.006, 0.02, stone, s * 0.05 + (k - 1) * 0.014, 0.05, 0.055, PI / 2, 0, 0, 8); }
  RB(g, 0.28, 0.04, 0.2, 0.006, mat(0xffffff, { map: stoneTex('coatlicue_base', [60, 58, 54]), roughness: 0.6 }), 0, 0.02, 0);
  plaque(g, 'COATLICUE', 'La de la falda de serpientes', 0.1, 0.015, 0, 0.022, 0.1005, 0, 0);
  return ground(g);
};

// ---------- Roca lunar en cápsula ----------
BUILDERS_D.roca_lunar_capsula = () => {
  const g = new THREE.Group();
  const walnut = woodM('lunar_nogal', '#4a2a14', { rough: 0.3 });
  // placa de nogal escudo
  const shield = new THREE.Shape(); shield.moveTo(-0.12, 0.16); shield.lineTo(0.12, 0.16); shield.lineTo(0.12, -0.04); shield.quadraticCurveTo(0.12, -0.14, 0, -0.17); shield.quadraticCurveTo(-0.12, -0.14, -0.12, -0.04); shield.closePath();
  const P0 = grp(g, 0, 0.19, 0, -0.18, 0, 0);
  EXS(P0, shield, 0.02, walnut, 0, 0, 0, 0, 0, 0, 0.004);
  B(g, 0.2, 0.03, 0.12, walnut, 0, 0.015, 0.02);
  B(g, 0.02, 0.1, 0.06, walnut, 0, 0.06, -0.04, -0.18, 0, 0);
  // bandera y textos
  const flag = tex('bandera_lunar', 256, 160, (c, w, h) => { c.fillStyle = '#f4f4f0'; c.fillRect(0, 0, w, h); c.fillStyle = '#006847'; c.fillRect(0, 0, w / 3, h); c.fillStyle = '#ce1126'; c.fillRect(w * 2 / 3, 0, w / 3, h); c.fillStyle = '#8a5a2a'; c.beginPath(); c.arc(w / 2, h / 2, 16, 0, TAU); c.fill(); });
  P(P0, 0.07, 0.044, flag, 0, 0.11, 0.0146, 0, 0, 0, { rough: 0.6 });
  plaque(P0, 'APOLLO 17', 'Fragmento lunar · 1972', 0.13, 0.024, 0, -0.1, 0.0162, 0, 0);
  // esfera de lucita con fragmento de basalto
  const nz = noise3(1717);
  const rock = mergeVertices(new THREE.IcosahedronGeometry(0.006, 3));
  displace(rock, (x, y, z) => nz(x * 600, y * 600, z * 600, 3) * 0.0025);
  const sph = grp(P0, 0, 0.025, 0.035);
  add(sph, rock, mat(0x4a4844, { roughness: 0.95 }));
  const luc = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.02, transmission: 1, thickness: 0.05, ior: 1.49, transparent: true, opacity: 0.55, envMapIntensity: 1.6, clearcoat: 1 });
  add(sph, new THREE.SphereGeometry(0.026, 40, 28), luc).castShadow = false;
  lathe(P0, smooth([[0.012, 0], [0.018, 0.006], [0.016, 0.012], [0.01, 0.014]], 10), metal(0xc8ccd0, 0.2), 0, 0.025, 0.0142, PI / 2, 0, 0, 24);
  return ground(g);
};

// ---------- Daga de hierro meteórico ----------
BUILDERS_D.daga_meteorito = () => {
  const g = new THREE.Group();
  const wid = tex('daga_wid', 256, 1024, (c, w, h) => { const R = rng(91); c.fillStyle = '#9aa0a6'; c.fillRect(0, 0, w, h); for (const ang of [0.3, 1.35, -0.75]) for (let i = 0; i < 120; i++) { c.save(); c.translate(R() * w, R() * h); c.rotate(ang); const L = 30 + R() * 140, T = 2 + R() * 6; c.fillStyle = `rgba(${R() < 0.5 ? '220,224,230' : '70,74,80'},0.55)`; c.fillRect(-L / 2, -T / 2, L, T); c.restore(); } });
  const blade = mat(0xffffff, { map: wid, metalness: 0.9, roughness: 0.25, env: true, envI: 1.1 });
  const au = gold(0.28), crystal = gem(0xf4f8ff, { transmission: 0.85, opacity: 0.7, flat: true, ei: 0.1 });
  const D = grp(g, -0.05, 0.076, 0);
  // hoja con filo y nervio central
  const bl = new THREE.Shape(); bl.moveTo(0, 0.012); bl.lineTo(0.17, 0.006); bl.quadraticCurveTo(0.2, 0.002, 0.21, 0); bl.quadraticCurveTo(0.2, -0.002, 0.17, -0.006); bl.lineTo(0, -0.012); bl.closePath();
  const bgeo = new THREE.ExtrudeGeometry(bl, { depth: 0.002, bevelEnabled: true, bevelSize: 0.0016, bevelThickness: 0.0016, bevelSegments: 1, curveSegments: 16 });
  { const uv = bgeo.attributes.uv, p = bgeo.attributes.position; for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getY(i) * 10 + 0.5, p.getX(i) / 0.21); }
  add(D, bgeo, blade, 0, 0, -0.001);
  // guarda, empuñadura granulada y pomo de cristal
  RB(D, 0.008, 0.05, 0.012, 0.003, au, -0.004, 0, 0);
  for (const s of [-1, 1]) SP(D, 0.004, au, -0.004, s * 0.027, 0, 1, 1, 1, 10);
  const grip = latheGeo(smooth([[0.007, 0], [0.009, 0.02], [0.0085, 0.05], [0.0075, 0.075], [0.006, 0.08]], 20), 32);
  add(D, grip, mat(0xffffff, { map: tex('granulado', 128, 128, (c, w, h) => { c.fillStyle = '#b8862a'; c.fillRect(0, 0, w, h); for (let y = 4; y < h; y += 8) for (let x = (y / 8 % 2) * 4 + 2; x < w; x += 8) { const gr = c.createRadialGradient(x - 1, y - 1, 0, x, y, 4); gr.addColorStop(0, '#fff0b0'); gr.addColorStop(1, '#8a5a10'); c.fillStyle = gr; c.beginPath(); c.arc(x, y, 3.4, 0, TAU); c.fill(); } }, true), metalness: 1, roughness: 0.3 }), -0.008, 0, 0, 0, 0, PI / 2);
  add(D, new THREE.IcosahedronGeometry(0.014, 1), crystal, -0.1, 0, 0).scale.set(1.3, 1, 1);
  TO(D, 0.008, 0.002, au, -0.088, 0, 0, 0, PI / 2, 0, TAU, 20);
  // atril con horquillas y vaina
  const wd = woodM('daga_atril', '#1a0e08', { rough: 0.3 });
  RB(g, 0.32, 0.02, 0.1, 0.005, wd, 0, 0.01, 0);
  for (const x of [-0.1, 0.07]) { B(g, 0.012, 0.05, 0.012, wd, x, 0.035, 0); TU(g, [[x, 0.072, -0.012], [x, 0.06, 0], [x, 0.072, 0.012]], 0.003, au, false, 8); }
  const sc = grp(g, -0.11, 0.03, 0.035, 0, 0.08, 0);
  add(sc, latheGeo(smooth([[0, 0], [0.012, 0.01], [0.014, 0.08], [0.012, 0.2], [0.006, 0.22], [0, 0.225]], 20), 24).scale(1, 1, 0.4), C.leather(0x3a1e0c), 0, 0, 0, 0, 0, -PI / 2);
  plaque(g, 'HIERRO METEÓRICO', 'Hoja forjada · oro granulado', 0.1, 0.012, 0, 0.012, 0.0505, -0.3, 0);
  return ground(g);
};

// ---------- Módulo de supercomputadora con banca ----------
BUILDERS_D.supercomputadora_banca = () => {
  const g = new THREE.Group();
  const panelM = (c) => mat(c, { roughness: 0.35, metalness: 0.2, env: true, envI: 0.6 });
  const cols = [0xc8261a, 0xc8261a, 0xe86a1a, 0xc8261a, 0xe86a1a, 0x1a1a1a];
  const N = 12, R0 = 0.46, R1 = 0.26, H = 1.55, gap = 0.6; // forma de C (abierta)
  const vinyl = mat(0xffffff, { map: tex('vinil_banca', 128, 128, (c, w, h) => { c.fillStyle = '#c86a2a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(80,30,10,0.4)'; for (let y = 0; y < h; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } }, true), roughness: 0.55, env: true, envI: 0.3 });
  for (let i = 0; i < N; i++) {
    const a0 = gap / 2 + i / N * (TAU - gap), a1 = gap / 2 + (i + 1) / N * (TAU - gap);
    const sh = new THREE.Shape(); sh.absarc(0, 0, R0, a0 + 0.005, a1 - 0.005, false); sh.absarc(0, 0, R1, a1 - 0.005, a0 + 0.005, true); sh.closePath();
    EXS(g, sh, H - 0.45, panelM(cols[i % cols.length]), 0, 0.45 + (H - 0.45) / 2, 0, PI / 2, 0, 0, 0.004);
    // banca acolchada en la base (segmento)
    const bs = new THREE.Shape(); bs.absarc(0, 0, R0 + 0.28, a0 + 0.004, a1 - 0.004, false); bs.absarc(0, 0, R1 - 0.0, a1 - 0.004, a0 + 0.004, true); bs.closePath();
    EXS(g, bs, 0.36, mat(0x2a2a2e, { roughness: 0.5 }), 0, 0.2, 0, PI / 2, 0, 0, 0.004);
    const cush = new THREE.Shape(); cush.absarc(0, 0, R0 + 0.27, a0 + 0.01, a1 - 0.01, false); cush.absarc(0, 0, R0 + 0.01, a1 - 0.01, a0 + 0.01, true); cush.closePath();
    EXS(g, cush, 0.07, vinyl, 0, 0.41, 0, PI / 2, 0, 0, 0.025);
  }
  // logotipo y rejillas
  const logo = tex('logo_super', 512, 128, (c, w, h) => { c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h); c.fillStyle = '#f2f2ee'; c.font = 'bold 84px Arial'; c.textAlign = 'center'; c.fillText('VÉRTICE-1', w / 2, 96); });
  P(g, 0.3, 0.075, logo, Math.sin(PI) * (R0 + 0.006), 1.35, Math.cos(PI) * (R0 + 0.006) * -1, 0, 0, 0);
  // tapa superior
  const top = new THREE.Shape(); top.absarc(0, 0, R0 + 0.01, gap / 2, TAU - gap / 2, false); top.absarc(0, 0, R1 - 0.01, TAU - gap / 2, gap / 2, true); top.closePath();
  EXS(g, top, 0.02, mat(0x1a1a1a, { roughness: 0.4 }), 0, H + 0.01, 0, PI / 2, 0, 0, 0.004);
  // interior: cableado visible por la abertura
  const wires = []; const R = rng(76); for (let i = 0; i < 40; i++) { const a = (R() - 0.5) * gap * 0.6, y0 = 0.5 + R() * 1.0; wires.push(tubeGeo([[Math.sin(a) * R1 * 0.9, y0, Math.cos(a) * R1 * 0.9], [Math.sin(a) * R1 * 0.5, y0 - 0.1, Math.cos(a) * R1 * 0.5], [0, y0 - 0.3, 0]], 0.003, 8, 4)); }
  merged(g, wires, mat(0xd8d0c0, { roughness: 0.6 }));
  plaque(g, 'SUPERCOMPUTADORA · 1976', '160 MFLOPS · la más rápida del mundo', 0.24, 0.04, 0, 0.3, R0 + 0.285, 0, 0);
  return ground(g);
};

// ---------- Carrusel musical autómata ----------
function horse(m, mane) {
  const h = new THREE.Group();
  add(h, swGeo([[-0.03, 0, 0], [0, 0.004, 0], [0.028, 0.008, 0]], [0.012, 0.015, 0.012], 12, 12), m); // cuerpo
  add(h, swGeo([[0.026, 0.006, 0], [0.036, 0.026, 0], [0.04, 0.036, 0]], [0.008, 0.007, 0.006], 10, 10), m); // cuello
  add(h, swGeo([[0.036, 0.04, 0], [0.05, 0.034, 0], [0.056, 0.028, 0]], [0.008, 0.006, 0.005], 10, 10), m); // cabeza
  for (const s of [-1, 1]) for (const fx of [-0.024, 0.022]) add(h, swGeo([[fx, -0.006, s * 0.007], [fx + (fx > 0 ? 0.012 : -0.01), -0.02, s * 0.007], [fx + (fx > 0 ? 0.008 : -0.016), -0.034, s * 0.007]], [0.004, 0.003, 0.0025], 6, 8), m);
  add(h, swGeo([[-0.03, 0.004, 0], [-0.042, -0.006, 0], [-0.046, -0.024, 0]], [0.004, 0.005, 0.002], 6, 8), mane); // cola
  add(h, swGeo([[0.028, 0.018, 0], [0.034, 0.034, 0], [0.04, 0.044, 0]], [0.003, 0.004, 0.002], 6, 8, 2), mane); // crin
  return h;
}
BUILDERS_D.carrusel_automata = () => {
  const g = new THREE.Group();
  const au = gold(0.2), red = lacquer(0xb8161e), cream = mat(0xf4ecd8, { roughness: 0.3, env: true, envI: 0.5 });
  const mirrorM = metal(0xe8eef2, 0.05);
  // base: caja musical cilíndrica con plataforma
  lathe(g, smooth([[0, 0], [0.16, 0], [0.165, 0.01], [0.16, 0.05], [0.165, 0.055], [0, 0.055]], 20), red, 0, 0, 0, 0, 0, 0, 64);
  TO(g, 0.163, 0.004, au, 0, 0.012, 0, PI / 2, 0, 0, TAU, 64); TO(g, 0.163, 0.004, au, 0, 0.053, 0, PI / 2, 0, 0, TAU, 64);
  lathe(g, [[0, 0.055], [0.15, 0.055], [0.15, 0.065], [0, 0.065]], C.wood(0x8a5a2a), 0, 0, 0, 0, 0, 0, 64);
  // columna central con espejos
  const col = latheGeo([[0.035, 0.065], [0.035, 0.3]], 12);
  add(g, col, mirrorM);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; B(g, 0.004, 0.235, 0.004, au, Math.cos(a) * 0.036, 0.18, Math.sin(a) * 0.036); }
  // toldo cónico a rayas con faldón festoneado
  const awnT = tex('toldo', 512, 128, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#f4ecd8' : '#b8161e'; c.fillRect(i * w / 16, 0, w / 16 + 1, h); } }, true);
  add(g, latheGeo(smooth([[0.17, 0], [0.12, 0.04], [0.05, 0.07], [0.0, 0.08]], 20), 64), mat(0xffffff, { map: awnT, roughness: 0.5, side: THREE.DoubleSide }), 0, 0.3, 0);
  const fest = []; for (let i = 0; i < 24; i++) { const a = (i + 0.5) / 24 * TAU; fest.push(gx(new THREE.CircleGeometry(0.022, 16, 0, PI), Math.cos(a) * 0.171, 0.3, Math.sin(a) * 0.171, PI, -a + PI / 2, 0)); }
  merged(g, fest, mat(0xffffff, { map: awnT, roughness: 0.5, side: THREE.DoubleSide }));
  TO(g, 0.171, 0.004, au, 0, 0.3, 0, PI / 2, 0, 0, TAU, 64);
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; SP(g, 0.004, emissive(0xfff0b0, 1.2), Math.cos(a) * 0.172, 0.296, Math.sin(a) * 0.172, 1, 1, 1, 8); }
  lathe(g, smooth([[0, 0], [0.012, 0], [0.008, 0.02], [0.012, 0.03], [0, 0.05]], 12), au, 0, 0.375, 0, 0, 0, 0, 20);
  // caballitos con tubos dorados a diferentes alturas
  const hm = [cream, mat(0x2a2a2e, { roughness: 0.35, env: true }), mat(0xd8b080, { roughness: 0.35, env: true })], mane = mat(0x5a3a1a, { roughness: 0.7 });
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * TAU, r = 0.115, y = 0.13 + Math.sin(i * 1.7) * 0.025;
    const twist = latheGeo([[0.0035, 0.065], [0.0035, 0.3]], 8); warpV(twist, (v) => { const k = 1 + 0.15 * Math.sin(Math.atan2(v.z, v.x) * 3 + v.y * 120); v.x *= k; v.z *= k; });
    add(g, twist, au, Math.cos(a) * r, 0, Math.sin(a) * r);
    const hg = grp(g, Math.cos(a) * r, y, Math.sin(a) * r, 0, -a - PI / 2, 0);
    hg.add(horse(hm[i % 3], mane));
    RB(hg, 0.018, 0.004, 0.022, 0.002, red, 0, 0.016, 0); // montura
  }
  // manivela de la caja de música
  CY(g, 0.003, 0.003, 0.02, au, 0.17, 0.03, 0, 0, 0, PI / 2, 8); B(g, 0.004, 0.025, 0.004, au, 0.18, 0.02, 0); SP(g, 0.006, cream, 0.18, 0.006, 0);
  return ground(g);
};

// ---------- Anillo de esmeralda en estuche ----------
BUILDERS_D.anillo_esmeralda_estuche = () => {
  const g = new THREE.Group();
  const leather = C.leather(0x0e3a2a), satin = mat(0xf4f0e6, { roughness: 0.4, env: true, envI: 0.3 });
  const pt = whiteGold(), emer = gem(0x0a9a4a, { transmission: 0.5, opacity: 0.92, emissive: 0x053a1a, ei: 0.3 });
  // estuche abierto con cojín ranurado
  RB(g, 0.07, 0.035, 0.07, 0.01, leather, 0, 0.0175, 0);
  const lid = grp(g, 0, 0.035, -0.035, -1.95, 0, 0); RB(lid, 0.07, 0.025, 0.07, 0.01, leather, 0, 0.0125, 0.035); RB(lid, 0.06, 0.004, 0.06, 0.003, satin, 0, -0.001, 0.035);
  P(lid, 0.04, 0.012, labelTex('JOYERÍA REAL', { bg: '#f4f0e6', fg: '#8a6a2a', w: 512, h: 150, font: 'italic bold 70px Georgia' }), 0, -0.0035, 0.035, PI / 2, 0, PI, { rough: 0.5 });
  for (const s of [-1, 1]) add(g, ell(0.03, 0.012, 0.014, 24, 14), velvet('anillo', '#0a2a1e'), 0, 0.034, s * 0.008);
  // aro de platino
  const R = grp(g, 0, 0.05, 0, 0, 0, 0);
  add(R, latheGeo([[0.0085, -0.0012], [0.0095, -0.0014], [0.0098, 0], [0.0095, 0.0014], [0.0085, 0.0012], [0.0085, -0.0012]], 64), pt, 0, 0, 0, PI / 2, 0, 0);
  // esmeralda talla esmeralda (octágono escalonado) con halo
  const top = grp(R, 0, 0.0105, 0);
  const ec = new THREE.Shape(); const w = 0.0055, d = 0.0042, ch = 0.0012; ec.moveTo(-w + ch, -d); ec.lineTo(w - ch, -d); ec.lineTo(w, -d + ch); ec.lineTo(w, d - ch); ec.lineTo(w - ch, d); ec.lineTo(-w + ch, d); ec.lineTo(-w, d - ch); ec.lineTo(-w, -d + ch); ec.closePath();
  const eg = new THREE.ExtrudeGeometry(ec, { depth: 0.002, bevelEnabled: true, bevelSize: 0.0012, bevelThickness: 0.0016, bevelSegments: 2, curveSegments: 1 });
  add(top, eg, emer, 0, 0.0025, 0, -PI / 2, 0, 0);
  const halo = []; const hp = ec.getPoints(); for (let i = 0; i < 22; i++) { const t = i / 22, p = ec.getPointAt(t); halo.push([p.x * 1.32, 0.001, -p.y * 1.32]); }
  stonesAlong(top, halo, 0.0008, diamond(), () => [0, 0, 0]);
  for (const [x, z] of [[-w, -d], [w, -d], [-w, d], [w, d]]) CO(top, 0.0007, 0.003, pt, x * 0.92, 0.003, z * 0.92, 0, 0, 0, 6); // garras
  lathe(top, [[0.003, -0.004], [0.006, 0.0], [0.006, 0.0008], [0.002, 0.0008]], pt, 0, 0, 0, 0, 0, 0, 16);
  return ground(g);
};

// ---------- Casco espacial de utilería ----------
BUILDERS_D.casco_espacial_utileria = () => {
  const g = new THREE.Group();
  const shellM = mat(0xf2ece0, { roughness: 0.3, env: true, envI: 0.5 }), visor = new THREE.MeshPhysicalMaterial({ color: 0xe0a830, metalness: 1, roughness: 0.04, envMapIntensity: 1.8, transparent: true, opacity: 0.92 });
  const alu = metal(0xc8ccd0, 0.25), red = mat(0xb8261a, { roughness: 0.4 });
  // maniquí/soporte
  lathe(g, smooth([[0, 0], [0.11, 0], [0.11, 0.03], [0.04, 0.05], [0.03, 0.14], [0, 0.14]], 20), lacquer(0x1a1a1e), 0, 0, 0, 0, 0, 0, 48);
  const H = grp(g, 0, 0.27, 0);
  // casco: cáscara esférica con abertura del visor
  add(H, new THREE.SphereGeometry(0.13, 64, 48), shellM);
  const vg = new THREE.SphereGeometry(0.1305, 48, 32, PI * 0.25, PI * 0.5, PI * 0.28, PI * 0.36);
  add(H, vg, visor, 0, 0, 0, 0, 0, 0);
  // marco del visor y franjas
  const frame = []; for (let i = 0; i <= 40; i++) { const t = i / 40, phi = PI * 0.25 + t * PI * 0.5; for (const th of [PI * 0.28, PI * 0.64]) frame.push([th, phi]); }
  const edge = (th0, th1, ph0, ph1) => { const pts = []; for (let i = 0; i <= 30; i++) { const t = i / 30, th = th0 + (th1 - th0) * t, ph = ph0 + (ph1 - ph0) * t; pts.push([-0.132 * Math.cos(ph) * Math.sin(th), 0.132 * Math.cos(th), 0.132 * Math.sin(ph) * Math.sin(th)]); } return tubeGeo(pts, 0.005, 30, 6); };
  merged(H, [edge(PI * 0.28, PI * 0.28, PI * 0.25, PI * 0.75), edge(PI * 0.64, PI * 0.64, PI * 0.25, PI * 0.75), edge(PI * 0.28, PI * 0.64, PI * 0.25, PI * 0.25), edge(PI * 0.28, PI * 0.64, PI * 0.75, PI * 0.75)], alu);
  add(H, bandGeoD(0.13, 0.02, 0.003), red, 0, 0.05, 0).rotation.set(0, 0, PI / 2);
  // anillo de cuello y conectores
  lathe(H, [[0.09, -0.11], [0.11, -0.115], [0.11, -0.14], [0.095, -0.145], [0.09, -0.145]], alu, 0, 0, 0, 0, 0, 0, 64);
  for (let i = 0; i < 3; i++) { const a = PI + (i - 1) * 0.5; lathe(H, smooth([[0, 0], [0.014, 0], [0.014, 0.02], [0.01, 0.024], [0, 0.024]], 10), i === 1 ? red : alu, Math.cos(a) * 0.115, -0.07, Math.sin(a) * 0.115, PI / 2, 0, -a + PI / 2, 20); }
  for (const s of [-1, 1]) { RB(H, 0.04, 0.03, 0.02, 0.006, alu, s * 0.12, 0.0, 0.0, 0, s * PI / 2, 0); CY(H, 0.005, 0.005, 0.03, emissive(0xff3020, 1.2), s * 0.136, 0.02, 0.0, 0, 0, PI / 2, 8); }
  // reflejo en el visor
  const L = new THREE.PointLight(0xffe0a0, 0.3, 0.5); L.position.set(0, 0.32, 0.3); g.add(L);
  plaque(g, 'UTILERÍA ORIGINAL', 'Odisea espacial · 1968', 0.1, 0.015, 0, 0.018, 0.11, -0.4, 0);
  return ground(g);
};

// ---------- Fragmento de OVNI ----------
BUILDERS_D.fragmento_ovni = () => {
  const g = new THREE.Group();
  const glyph = tex('glifos_ovni', 512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); const R = rng(51); c.strokeStyle = '#40ffd0'; c.lineWidth = 4; c.shadowColor = '#40ffd0'; c.shadowBlur = 12; for (let k = 0; k < 14; k++) { const x = 60 + (k % 4) * 110, y = 70 + Math.floor(k / 4) * 110; c.beginPath(); c.arc(x, y, 18 + R() * 10, R() * 3, R() * 3 + 4); c.stroke(); c.beginPath(); c.moveTo(x - 20, y + 30); c.lineTo(x + 20, y + 30 - R() * 20); c.stroke(); if (R() < 0.6) { c.beginPath(); c.arc(x + 10, y - 10, 4, 0, TAU); c.stroke(); } } });
  // lámina iridiscente arrugada y rota
  const nz = noise3(1947);
  const sheet = new THREE.CircleGeometry(0.12, 64, 0, TAU);
  warpV(sheet, (v) => { const a = Math.atan2(v.y, v.x), r = Math.hypot(v.x, v.y); const edge = 0.55 + nz(Math.cos(a) * 2.2, Math.sin(a) * 2.2, 1, 3) * 0.7 + Math.abs(Math.sin(a * 7)) * 0.15; const k = Math.min(1, edge); v.x *= k; v.y *= k * 0.8; v.z = nz(v.x * 18, v.y * 18, 5, 3) * 0.012 + r * r * 0.6; });
  const rainbow = tex('iridiscente', 256, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, w, h); ['#9ad0ff', '#d0a0ff', '#ffb0d0', '#ffe0a0', '#a0ffd0', '#9ad0ff'].forEach((col, i, a) => gr.addColorStop(i / (a.length - 1), col)); c.fillStyle = gr; c.fillRect(0, 0, w, h); const R = rng(4); for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(255,255,255,${R() * 0.25})`; c.lineWidth = 1 + R() * 3; c.beginPath(); c.arc(R() * w, R() * h, 20 + R() * 80, 0, TAU); c.stroke(); } });
  const iri = mat(0xffffff, { map: rainbow, metalness: 1, roughness: 0.12, side: THREE.DoubleSide });
  const F = grp(g, 0, 0.17, 0, -0.35, 0.3, 0.2);
  add(F, sheet, iri);
  const back = sheet.clone(); add(F, back, iri, 0, 0, -0.003);
  const gl = add(F, sheet.clone(), new THREE.MeshBasicMaterial({ map: glyph, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }), 0, 0, 0.0015); gl.castShadow = false;
  // soporte de acrílico con base negra iluminada
  RB(g, 0.24, 0.03, 0.16, 0.006, lacquer(0x0a0a0c), 0, 0.015, 0);
  add(g, new THREE.PlaneGeometry(0.2, 0.12), new THREE.MeshBasicMaterial({ color: 0x40ffd0, transparent: true, opacity: 0.12, depthWrite: false }), 0, 0.0305, 0, -PI / 2, 0, 0);
  const acr = glassD(0xdff0ff, 0.3);
  B(g, 0.01, 0.13, 0.01, acr, 0, 0.095, -0.02);
  plaque(g, 'MATERIAL NO IDENTIFICADO', 'Desierto de Sonora · 1974', 0.13, 0.016, 0, 0.016, 0.0805, 0, 0, { bg: '#1a1a1a', fg: '#40ffd0', frame: metal(0x3a3a3a, 0.3) });
  return ground(g);
};

// ---------- Consola portátil de oro macizo ----------
BUILDERS_D.consola_oro_macizo = () => {
  const g = new THREE.Group();
  const au = gold(0.15), ruby = gem(0xc8102a, { opacity: 0.95 }), sapph = gem(0x1a3ab8, { opacity: 0.95 });
  const black = mat(0x121212, { roughness: 0.35, env: true, envI: 0.5 });
  slabBase(g, 0.2, 0.14, 0.022, black, { trim: au });
  // soporte inclinado
  EXS(g, poly([[-0.03, 0], [0.02, 0], [0.02, 0.012], [-0.03, 0.09], [-0.036, 0.09], [-0.005, 0.01], [-0.03, 0.01]]), 0.09, glassD(0xdff0ff, 0.28), -0.015, 0.022, 0, 0, -PI / 2, 0, 0.0015);
  // cuerpo vertical estilo clásico (90×148 mm) con esquina redondeada abajo a la derecha
  const H = grp(g, -0.015, 0.1, 0.0, -0.3, 0, 0);
  const W = 0.09, Hh = 0.148, D = 0.03;
  const sh = new THREE.Shape(); sh.moveTo(-W / 2, -Hh / 2); sh.lineTo(W / 2 - 0.03, -Hh / 2); sh.quadraticCurveTo(W / 2, -Hh / 2, W / 2, -Hh / 2 + 0.03); sh.lineTo(W / 2, Hh / 2 - 0.004); sh.quadraticCurveTo(W / 2, Hh / 2, W / 2 - 0.004, Hh / 2); sh.lineTo(-W / 2 + 0.004, Hh / 2); sh.quadraticCurveTo(-W / 2, Hh / 2, -W / 2, Hh / 2 - 0.004); sh.closePath();
  const body = new THREE.ExtrudeGeometry(sh, { depth: D, bevelEnabled: true, bevelSize: 0.003, bevelThickness: 0.003, bevelSegments: 3, curveSegments: 24 });
  body.translate(0, 0, -D / 2);
  add(H, body, mat(0xffffff, { map: engraveTex('consola_oro', '#e2b04a', 'rgba(90,55,10,0.35)', { border: false, density: 0.5 }), metalness: 1, roughness: 0.15 }));
  // marco de pantalla, pantalla y leyenda
  RB(H, 0.076, 0.062, 0.002, 0.006, mat(0x2a2a30, { roughness: 0.4 }), 0, 0.034, D / 2 + 0.003);
  const scr = tex('scr_oro', 160, 144, (c, w, h) => { c.fillStyle = '#8aa830'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a4010'; c.font = 'bold 20px monospace'; c.fillText('GOLD', 50, 70); c.fillRect(20, 100, 120, 6); });
  P(H, 0.047, 0.042, scr, 0, 0.036, D / 2 + 0.0042, 0, 0, 0, { glow: 0.4, rough: 0.2 });
  // cruceta de oro y botones de rubí y zafiro
  const cr = 0.004, cl = 0.011;
  EXS(H, poly([[-cr, cl], [cr, cl], [cr, cr], [cl, cr], [cl, -cr], [cr, -cr], [cr, -cl], [-cr, -cl], [-cr, -cr], [-cl, -cr], [-cl, cr], [-cr, cr]]), 0.004, gold(0.1), -0.024, -0.024, D / 2 + 0.004, 0, 0, 0, 0.001);
  add(H, brilliantGeo(0.0055, { n: 12 }), ruby, 0.028, -0.02, D / 2 + 0.003, PI / 2, 0, 0);
  add(H, brilliantGeo(0.0055, { n: 12 }), sapph, 0.016, -0.028, D / 2 + 0.003, PI / 2, 0, 0);
  for (const x of [-0.008, 0.006]) RB(H, 0.011, 0.0035, 0.003, 0.0016, gold(0.1), x, -0.05, D / 2 + 0.002, 0, 0, 0.45);
  for (let i = 0; i < 6; i++) B(H, 0.0016, 0.016, 0.001, mat(0x3a2a10, { roughness: 0.6 }), 0.026 + i * 0.004, -0.058, D / 2 + 0.0035, 0, 0, -0.45); // rejilla del altavoz
  stonesAlong(H, Array.from({ length: 12 }, (_, i) => [-0.036 + i * 0.0065, 0.07, D / 2 + 0.003]), 0.0014, diamond(), () => [PI / 2, 0, 0]);
  plaque(g, 'ORO 18 K · PIEZA ÚNICA', 'Encargo privado', 0.09, 0.012, 0, 0.011, 0.0712, 0, 0);
  return ground(g);
};

// ---------- Máscara de lucha bordada en oro ----------
BUILDERS_D.mascara_lucha_oro = () => {
  const g = new THREE.Group();
  const maskT = tex('lucha_oro', 1024, 512, (c, w, h) => {
    c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h);
    const R = rng(77); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.04})`; c.fillRect(R() * w, R() * h, 2, 1); }
    // flamas y contorno de ojos/boca bordados en oro (u: 0.25 = frente)
    c.strokeStyle = '#e2b04a'; c.fillStyle = '#e2b04a'; c.lineWidth = 8;
    const cx = w * 0.25;
    for (const s of [-1, 1]) { c.beginPath(); c.ellipse(cx + s * 60, h * 0.45, 52, 34, s * 0.25, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(cx + s * 20, h * 0.36); for (let k = 0; k < 5; k++) c.quadraticCurveTo(cx + s * (60 + k * 30), h * (0.3 - k * 0.04), cx + s * (80 + k * 30), h * (0.2 - k * 0.02)); c.stroke(); }
    c.beginPath(); c.ellipse(cx, h * 0.72, 46, 22, 0, 0, TAU); c.stroke();
    c.lineWidth = 6; c.beginPath(); c.moveTo(cx, h * 0.08); c.lineTo(cx, h * 0.3); c.stroke();
    for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(cx - 140 + k * 46, h * 0.98); c.quadraticCurveTo(cx - 130 + k * 46, h * 0.85, cx - 118 + k * 46, h * 0.98); c.fill(); }
    // pedrería
    for (let i = 0; i < 60; i++) { c.fillStyle = R() < 0.5 ? '#ffffff' : '#ff3a3a'; c.beginPath(); c.arc(cx + (R() - 0.5) * 360, h * (0.1 + R() * 0.8), 3, 0, TAU); c.fill(); }
  });
  const fabric = mat(0xffffff, { map: maskT, roughness: 0.45, metalness: 0.3, env: true, envI: 0.6 });
  // cabeza de maniquí con la máscara (rostro hacia +z)
  const head = mergeVertices(new THREE.SphereGeometry(1, 64, 48));
  head.scale(0.075, 0.1, 0.09);
  warpV(head, (v) => { if (v.y < -0.04 && v.z < 0.03) v.z *= 0.85; if (v.y < -0.06) v.x *= 1 - (-0.06 - v.y) * 4; });
  sculpt(head, [{ c: [-0.026, 0.01, 0.084], r: 0.022, d: 0.008, dir: [0, 0, -1] }, { c: [0.026, 0.01, 0.084], r: 0.022, d: 0.008, dir: [0, 0, -1] }, { c: [0, -0.012, 0.09], r: 0.02, d: 0.012, dir: [0, 0, 1] }, { c: [0, -0.045, 0.082], r: 0.022, d: 0.004, dir: [0, 0, 1] }]);
  { const uv = head.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, (uv.getX(i) + 0.0) % 1); }
  add(g, head, fabric, 0, 0.26, 0);
  // aberturas: ojos y boca con forro dorado
  const skin = mat(0x1a1410, { roughness: 0.8 });
  for (const s of [-1, 1]) { add(g, ell(0.017, 0.011, 0.004, 20, 12), skin, s * 0.026, 0.27, 0.083, 0, 0, s * -0.25); TO(g, 0.016, 0.002, gold(0.25), s * 0.026, 0.27, 0.084, 0, 0, 0, TAU, 24).scale.set(1, 0.68, 1); }
  add(g, ell(0.016, 0.008, 0.004, 20, 12), skin, 0, 0.214, 0.083);
  // cordones de la nuca
  for (let i = 0; i < 5; i++) TU(g, [[-0.012, 0.21 + i * 0.016, -0.088], [0.012, 0.218 + i * 0.016, -0.088]], 0.0012, mat(0xe2b04a, { roughness: 0.4, metalness: 0.6 }), false, 4);
  TU(g, [[0, 0.21, -0.09], [0.02, 0.18, -0.1], [0.01, 0.15, -0.095]], 0.0012, mat(0xe2b04a, { roughness: 0.4, metalness: 0.6 }), false, 8);
  // cuello y base
  lathe(g, smooth([[0, 0], [0.09, 0], [0.09, 0.025], [0.04, 0.05], [0.035, 0.16], [0, 0.17]], 20), lacquer(0x2a0a0a), 0, 0, 0, 0, 0, 0, 48);
  plaque(g, 'ÚLTIMA CAÍDA', 'Arena México · máscara de campeonato', 0.12, 0.016, 0, 0.012, 0.09, -0.5, 0);
  return ground(g);
};

// ---------- Monolito levitante ----------
BUILDERS_D.monolito_levitante = () => {
  const g = new THREE.Group();
  const stone = mat(0xffffff, { map: stoneTex('monolito_base', [70, 66, 62], { spots: 900, veins: 4 }), roughness: 0.75 });
  const obs = new THREE.MeshPhysicalMaterial({ color: 0x030304, roughness: 0.04, metalness: 0.1, clearcoat: 1, envMapIntensity: 1.2, flatShading: true });
  // base de piedra tallada en escalones
  for (const [r, h, y] of [[0.16, 0.04, 0.02], [0.13, 0.03, 0.055], [0.1, 0.02, 0.08]]) { const b = CY(g, r, r * 1.04, h, stone, 0, y, 0, 0, 0, 0, 8); b.rotation.y = PI / 8; }
  add(g, new THREE.CircleGeometry(0.06, 48), emissive(0x7a40ff, 1.6), 0, 0.0905, 0, -PI / 2, 0, 0);
  // cristal negro bipiramidal alargado que flota
  const M = grp(g, 0, 0.25, 0, 0, 0.4, 0);
  const pts = [[0, -0.12], [0.035, -0.06], [0.04, 0.0], [0.035, 0.07], [0, 0.14]];
  add(M, latheGeo(pts, 6), obs);
  // anillos de luz
  for (const [r, y, rx, rz] of [[0.075, 0.0, PI / 2 + 0.3, 0.2], [0.09, 0.02, PI / 2 - 0.25, -0.3], [0.06, -0.05, PI / 2, 0.6]]) { const t = TO(M, r, 0.0018, emissive(0xa070ff, 2.4), 0, y, 0, rx, 0, rz, TAU, 64); t.castShadow = false; }
  // halo y haz entre base y cristal
  const beam = add(g, new THREE.CylinderGeometry(0.02, 0.05, 0.05, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x8a60ff, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }), 0, 0.115, 0); beam.castShadow = false;
  const L = new THREE.PointLight(0x9a70ff, 0.8, 0.8); L.position.set(0, 0.2, 0); g.add(L);
  // runas talladas en la base
  const rt = tex('runas', 512, 64, (c, w, h) => { c.fillStyle = '#464240'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b8a0ff'; c.lineWidth = 3; const R = rng(3); for (let i = 0; i < 16; i++) { const x = 16 + i * 31; c.beginPath(); c.moveTo(x, 12); c.lineTo(x + (R() - 0.5) * 16, 52); c.moveTo(x - 8, 30); c.lineTo(x + 8, 24 + R() * 12); c.stroke(); } }, true);
  add(g, new THREE.CylinderGeometry(0.1305, 0.1355, 0.03, 8, 1, true), mat(0xffffff, { map: rt, roughness: 0.7, emissive: 0x2a1a5a, emissiveIntensity: 0.4 }), 0, 0.055, 0, 0, PI / 8, 0);
  return ground(g);
};

// ---------- Diamante azul maldito ----------
BUILDERS_D.diamante_azul_maldito = () => {
  const g = new THREE.Group();
  const blue = gem(0x1a3ab8, { transmission: 0.55, opacity: 0.92, emissive: 0x0a1a6a, ei: 0.45 });
  const pt = whiteGold();
  // columna de terciopelo y domo de cristal
  lathe(g, smooth([[0, 0], [0.09, 0], [0.09, 0.02], [0.06, 0.035], [0.05, 0.12], [0.07, 0.13], [0.07, 0.14], [0, 0.14]], 24), lacquer(0x0e0e12), 0, 0, 0, 0, 0, 0, 64);
  add(g, ell(0.055, 0.025, 0.04, 32, 20), velvet('diamante_azul', '#1a1a2a'), 0, 0.15, 0);
  // colgante: diamante cojín azul con halo de brillantes y cadena
  const D = grp(g, 0, 0.2, 0.0, -0.2, 0, 0);
  const cush = brilliantGeo(0.018, { n: 16, table: 0.5, crown: 0.2, pav: 0.55 }); cush.scale(1.1, 1, 0.9); cush.rotateX(PI / 2);
  add(D, cush, blue);
  stonesAlong(D, Array.from({ length: 16 }, (_, i) => { const a = i / 16 * TAU; return [Math.cos(a) * 0.024, Math.sin(a) * 0.022, 0.0]; }), 0.0035, diamond(), () => [PI / 2, 0, 0]);
  TO(D, 0.0235, 0.0012, pt, 0, 0, -0.002, 0, 0, 0, TAU, 48).scale.set(1.05, 0.95, 1);
  lathe(D, smooth([[0, 0], [0.004, 0], [0.003, 0.006], [0, 0.008]], 8), pt, 0, 0.026, 0, 0, 0, 0, 12);
  const chain = []; for (let i = 0; i <= 40; i++) { const t = i / 40, a = PI * (0.5 + (t - 0.5) * 1.6); chain.push([Math.cos(a) * 0.06, 0.032 + Math.sin(a) * 0.045 - 0.045 + 0.045, -0.01 - Math.sin(t * PI) * 0.03]); }
  TU(D, chain, 0.0012, pt, false, 80);
  stonesAlong(D, chain.filter((_, i) => i % 2 === 0), 0.0016, diamond(), () => [PI / 2, 0, 0]);
  // domo y placa
  glassDome(g, 0.09, 0.2, 0.14);
  TO(g, 0.09, 0.004, gold(0.2), 0, 0.142, 0, PI / 2, 0, 0, TAU, 64);
  const L = new THREE.PointLight(0x5a7aff, 0.4, 0.5); L.position.set(0, 0.25, 0.1); g.add(L);
  plaque(g, '45.52 QUILATES', 'Ninguno de sus dueños lo conservó', 0.1, 0.015, 0, 0.07, 0.054, -0.15, 0);
  return ground(g);
};

// ---------- Cartucho dorado de campeonato ----------
BUILDERS_D.cartucho_campeonato_oro = () => {
  const g = new THREE.Group();
  const au = mat(0xf0c050, { metalness: 0.85, roughness: 0.28, env: true, envI: 1.2 });
  // estuche de grado (acrílico) con etiqueta de calificación
  const C0 = grp(g, 0, 0.0, 0);
  const caseM = glassD(0xf4f8ff, 0.16);
  const cs = RB(C0, 0.16, 0.022, 0.2, 0.006, caseM, 0, 0.011, 0); cs.castShadow = false; cs.renderOrder = 3;
  P(C0, 0.13, 0.03, labelTex('9.6 · GRADUADO', { bg: '#f4f4f0', fg: '#1a2a6a', w: 1024, h: 230, font: 'bold 110px Arial', sub: 'CAMPEONATO 1990 · 1 DE 26', subFont: 'bold 56px Arial' }), 0, 0.0225, -0.075, -PI / 2, 0, 0, { rough: 0.4 });
  // cartucho dorado con etiqueta
  const K = grp(g, 0, 0.0085, 0.015);
  const sh = new THREE.Shape(); sh.moveTo(-0.06, -0.066); sh.lineTo(0.06, -0.066); sh.lineTo(0.06, 0.06); sh.lineTo(0.055, 0.066); sh.lineTo(-0.055, 0.066); sh.lineTo(-0.06, 0.06); sh.closePath();
  EXS(K, sh, 0.014, au, 0, 0, 0, -PI / 2, 0, 0, 0.0015);
  const lab = tex('cart_champ', 512, 400, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0a2a'); gr.addColorStop(1, '#2a0a3a'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#e2b04a'; c.font = 'bold 66px Arial'; c.textAlign = 'center'; c.fillText('WORLD', w / 2, 120); c.fillText('CHAMPIONSHIPS', w / 2, 200); c.font = 'bold 90px Arial'; c.fillStyle = '#ffffff'; c.fillText('1990', w / 2, 320); c.strokeStyle = '#e2b04a'; c.lineWidth = 8; c.strokeRect(12, 12, w - 24, h - 24); });
  P(K, 0.092, 0.072, lab, 0, 0.0085, 0.006, -PI / 2, 0, 0, { rough: 0.35 });
  // estrías de agarre y ranura del conector
  for (let i = 0; i < 8; i++) B(K, 0.1, 0.0012, 0.0016, gold(0.25), 0, 0.0082, -0.045 - i * 0.0026);
  B(K, 0.11, 0.004, 0.008, mat(0x2a2010, { roughness: 0.5 }), 0, -0.004, 0.064);
  return ground(g);
};

// ---------- Huevo de dragón fosilizado ----------
BUILDERS_D.huevo_dragon_fosil = () => {
  const g = new THREE.Group();
  const nz = noise3(3330);
  // escamas: grilla hexagonal desplazada sobre el huevo
  const egg = mergeVertices(latheGeo(smooth([[0, 0], [0.06, 0.02], [0.085, 0.07], [0.08, 0.13], [0.055, 0.18], [0.02, 0.205], [0, 0.21]], 64), 96));
  displace(egg, (x, y, z) => { const a = Math.atan2(z, x), u = a * 9, v = y * 70; const fu = u - Math.floor(u) - 0.5, fv = (v + (Math.floor(u) % 2) * 0.5) - Math.floor(v + (Math.floor(u) % 2) * 0.5) - 0.5; return 0.004 * (1 - Math.min(1, (fu * fu + fv * fv) * 4)) + nz(x * 40, y * 40, z * 40, 2) * 0.002; });
  const scaleT = tex('escama_dragon', 256, 256, (c, w, h) => { const R = rng(5); c.fillStyle = '#4a3a2a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '20,14,8' : '140,110,70'},${R() * 0.4})`; c.fillRect(R() * w, R() * h, 2, 2); } }, true);
  const E = grp(g, 0, 0.07, 0, 0.12, 0, 0.08);
  add(E, egg, mat(0xffffff, { map: scaleT, roughness: 0.8, bumpMap: scaleT, bumpScale: 0.003, metalness: 0.15 }));
  // grieta incandescente
  const crack = []; for (let i = 0; i <= 30; i++) { const t = i / 30, y = 0.05 + t * 0.12, a = 0.3 + Math.sin(t * 12) * 0.12 + t * 0.4, r = 0.084 - Math.pow(t - 0.4, 2) * 0.12 + 0.002; crack.push([Math.cos(a) * r, y, Math.sin(a) * r]); }
  const cm = add(E, swGeo(crack, (t) => 0.0035 * Math.sin(t * PI) + 0.0006, 8, 60, 1), emissive(0xff6a10, 3.0)); cm.castShadow = false;
  for (const off of [[0.04, 0.25, 0.5], [0.09, 0.62, -0.4]]) { const br = []; const i0 = Math.floor(off[1] * 30); for (let k = 0; k <= 8; k++) { const p = crack[i0]; br.push([p[0] + k * 0.003 * Math.cos(off[2]), p[1] + k * 0.004, p[2] + k * 0.003 * Math.sin(off[2]) * 0.3]); } add(E, swGeo(br, (t) => 0.0018 * (1 - t), 6, 12, 1), emissive(0xff8a20, 2.6)).castShadow = false; }
  const L = new THREE.PointLight(0xff7020, 0.7, 0.5); L.position.set(0.12, 0.17, 0.12); g.add(L);
  // nido de ramas petrificadas y base
  const twigs = []; const R = rng(91); for (let i = 0; i < 26; i++) { const a = R() * TAU, r = 0.07 + R() * 0.04; twigs.push(tubeGeo([[Math.cos(a) * r, 0.05 + R() * 0.03, Math.sin(a) * r], [Math.cos(a + 0.8) * (r + 0.02), 0.04 + R() * 0.03, Math.sin(a + 0.8) * (r + 0.02)], [Math.cos(a + 1.6) * r, 0.05 + R() * 0.03, Math.sin(a + 1.6) * r]], 0.005 + R() * 0.003, 12, 5)); }
  merged(g, twigs, mat(0xffffff, { map: stoneTex('ramas_dragon', [100, 84, 66]), roughness: 0.9 }));
  lathe(g, smooth([[0, 0], [0.14, 0], [0.142, 0.02], [0.12, 0.04], [0, 0.045]], 16), mat(0xffffff, { map: stoneTex('base_dragon', [56, 52, 48]), roughness: 0.7 }), 0, 0, 0, 0, 0, 0, 7);
  plaque(g, 'OVUM DRACONIS', 'Hallazgo de origen desconocido', 0.1, 0.014, 0, 0.022, 0.13, -0.6, 0);
  return ground(g);
};

// ---------- Reloj de bolsillo súper complicación ----------
BUILDERS_D.reloj_supercomplicacion = () => {
  const g = new THREE.Group();
  const au = gold(0.16), dialAu = mat(0xffffff, { map: guillocheTex('supercomp', '#e8e2d0', 'rgba(140,120,80,0.35)', { rays: 0, rings: 60 }), roughness: 0.25, env: true, envI: 0.6 });
  // atril de caoba con gancho
  const wd = woodM('super_atril', '#3a1608', { rough: 0.3 });
  RB(g, 0.16, 0.025, 0.12, 0.006, wd, 0, 0.0125, 0);
  const st = grp(g, 0, 0.025, -0.02, -0.2, 0, 0); B(st, 0.03, 0.15, 0.012, wd, 0, 0.075, 0); TU(st, [[0, 0.15, 0.006], [0, 0.162, 0.016], [0, 0.152, 0.024]], 0.002, au, false, 10);
  // caja del reloj (cazador abierto)
  const W = grp(g, 0, 0.105, 0.0, -0.2, 0, 0);
  const R0 = 0.033;
  lathe(W, smooth([[0, -0.008], [R0 - 0.004, -0.008], [R0, -0.004], [R0 + 0.001, 0.0], [R0, 0.004], [R0 - 0.002, 0.006], [0, 0.006]], 20), mat(0xffffff, { map: barleyTex('super_caja'), metalness: 1, roughness: 0.18 }), 0, 0, 0, PI / 2, 0, 0, 72);
  // esfera blanca con 4 subesferas
  const dialT = tex('dial_super', 512, 512, (c, w, h) => {
    const cx = w / 2; c.fillStyle = '#f8f4ea'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1a1a1a'; c.font = 'bold 34px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - PI / 2; c.fillText(['I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][i - 1], cx + Math.cos(a) * 205, cx + Math.sin(a) * 205); }
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; c.fillRect(cx + Math.cos(a) * 232 - 1, cx + Math.sin(a) * 232 - 1, 3, 3); }
    const sub = (x, y, n, lab) => { c.strokeStyle = '#1a1a1a'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 58, 0, TAU); c.stroke(); for (let i = 0; i < n; i++) { const a = i / n * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * 50, y + Math.sin(a) * 50); c.lineTo(x + Math.cos(a) * 58, y + Math.sin(a) * 58); c.stroke(); } c.font = 'italic 16px Georgia'; c.fillText(lab, x, y + 30); };
    sub(cx, cx - 100, 31, 'DATE'); sub(cx - 100, cx, 7, 'JOUR'); sub(cx + 100, cx, 12, 'MOIS');
    c.fillStyle = '#1a2a6a'; c.beginPath(); c.arc(cx, cx + 100, 58, PI, TAU); c.fill(); c.fillStyle = '#e2c060'; c.beginPath(); c.arc(cx - 20, cx + 80, 18, 0, TAU); c.fill(); c.fillStyle = '#f2f2ea'; for (let i = 0; i < 12; i++) c.fillRect(cx - 50 + i * 9, cx + 60 + (i % 3) * 8, 2, 2); // fases lunares
    c.fillStyle = '#1a1a1a'; c.font = 'bold 20px Georgia'; c.fillText('GRANDE COMPLICATION', cx, cx + 175);
  });
  add(W, new THREE.CircleGeometry(R0 - 0.003, 64), mat(0xffffff, { map: dialT, roughness: 0.25, env: true, envI: 0.5 }), 0, 0, 0.0061);
  for (const [l, a, wd2] of [[0.018, 2.1, 0.0016], [0.026, -0.4, 0.0012], [0.028, 1.1, 0.0005]]) { const hg = grp(W, 0, 0, 0.0068, 0, 0, a); B(hg, wd2, l, 0.0005, mat(0x1a2a8a, { metalness: 1, roughness: 0.2 }), 0, l / 2, 0); }
  for (const [x, y, a] of [[0, 0.01, 0.4], [-0.01, 0, 1.8], [0.01, 0, -0.9]]) { const hg = grp(W, x, y, 0.0066, 0, 0, a); B(hg, 0.0006, 0.007, 0.0004, mat(0x1a1a1a), 0, 0.0035, 0); }
  add(W, latheGeo(smooth([[0, 0.009], [R0 * 0.6, 0.008], [R0 - 0.002, 0.006]], 16), 48), glassD(0xeef6ff, 0.12), 0, 0, 0, PI / 2, 0, 0);
  // corona, arco y tapa trasera abierta con mapa celeste
  lathe(W, smooth([[0, 0], [0.004, 0], [0.004, 0.008], [0.006, 0.01], [0.006, 0.014], [0, 0.016]], 12), au, 0, R0, 0, 0, 0, 0, 20);
  TO(W, 0.009, 0.0016, au, 0, R0 + 0.022, 0, 0, PI / 2, 0, TAU, 24);
  const lid = grp(W, 0, -R0, -0.008, -PI * 0.92 + PI, 0, 0);
  const sky = tex('mapa_celeste', 512, 512, (c, w, h) => { const cx = w / 2; c.fillStyle = '#0a1a4a'; c.beginPath(); c.arc(cx, cx, cx, 0, TAU); c.fill(); const R = rng(8); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,240,200,${0.4 + R() * 0.6})`; c.beginPath(); c.arc(R() * w, R() * h, R() * 2.2, 0, TAU); c.fill(); } c.strokeStyle = 'rgba(226,192,96,0.7)'; c.lineWidth = 2; for (const r of [80, 160, 230]) { c.beginPath(); c.arc(cx, cx, r, 0, TAU); c.stroke(); } });
  add(lid, latheGeo(smooth([[0, -0.004], [R0 - 0.004, -0.003], [R0, 0.0]], 12), 72), au, 0, R0, 0, PI / 2, 0, 0);
  add(lid, new THREE.CircleGeometry(R0 - 0.005, 64), mat(0xffffff, { map: sky, roughness: 0.3, metalness: 0.3, env: true, envI: 0.5 }), 0, R0, 0.0005);
  // cadena tipo albert hasta la base
  const ch = []; for (let i = 0; i <= 60; i++) { const t = i / 60; ch.push(gx(new THREE.TorusGeometry(0.0028, 0.0008, 6, 12), 0.01 + t * 0.06, 0.15 - Math.sin(t * PI * 0.9) * 0.1 - t * 0.04, 0.02 + t * 0.02, 0, i % 2 ? PI / 2 : 0, 0)); }
  merged(g, ch, au);
  plaque(g, '24 COMPLICACIONES', 'Ocho años de trabajo', 0.1, 0.012, 0, 0.0125, 0.0605, 0, 0);
  return ground(g);
};
