// Objetos nuevos (grupo C): leyendas de la historia, el arte, la ciencia, la música y el deporte.
// Solo objetos de alto nivel (épico, legendario, único y exótico).
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, rng, add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, SW } from './modelkit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// { id, name, category, rarity, baseValue, desc }
export const ITEMS_C = [
  // ---------- épicos ----------
  { id: 'bombilla_edison_1879', name: 'Bombilla de Edison 1879 (Réplica)', category: 'electronics', rarity: 'epic', baseValue: 1900, desc: 'Filamento de bambú carbonizado bajo campana de vidrio. La luz que cambió las noches.' },
  { id: 'telefono_bell_1876', name: 'Teléfono de Bell 1876 (Réplica)', category: 'electronics', rarity: 'epic', baseValue: 2600, desc: 'El “teléfono de horca”: electroimán, membrana de pergamino y la primera frase transmitida.' },
  { id: 'microscopio_leeuwenhoek', name: 'Microscopio de Leeuwenhoek', category: 'machines', rarity: 'epic', baseValue: 3400, desc: 'Placa de latón con una lente diminuta. Con algo así se vieron por primera vez las bacterias.' },
  { id: 'fosil_trilobites', name: 'Fósil de Trilobites en Roca', category: 'rarities', rarity: 'epic', baseValue: 3900, desc: 'Artrópodo marino de hace 450 millones de años, preparado a mano sobre su matriz de caliza.' },
  { id: 'ambar_mosquito', name: 'Ámbar Báltico con Mosquito', category: 'rarities', rarity: 'epic', baseValue: 4600, desc: 'Resina fósil pulida con un insecto atrapado hace 40 millones de años.' },
  { id: 'geoda_amatista_catedral', name: 'Geoda Catedral de Amatista', category: 'rarities', rarity: 'epic', baseValue: 5600, desc: 'Geoda uruguaya abierta en dos, tapizada de cristales violeta. Pesa como un refrigerador chico.' },
  { id: 'casco_f1_1976', name: 'Casco de Piloto de Fórmula 1 (1976)', category: 'sports', rarity: 'epic', baseValue: 5800, desc: 'Casco integral de fibra usado en la temporada más dramática de los setenta.' },
  { id: 'cohete_hojalata_1958', name: 'Cohete de Hojalata de Colección', category: 'toys', rarity: 'epic', baseValue: 2400, desc: 'Juguete de cuerda litografiado de 1958, con piloto bajo la cúpula y base de lanzamiento.' },
  { id: 'tintero_imperial', name: 'Tintero Imperial de Bronce Dorado', category: 'valuables', rarity: 'epic', baseValue: 3600, desc: 'Escribanía estilo Imperio con patas de león, dos tinteros de cristal tallado y pluma de ganso.' },
  { id: 'bateria_jazz_1940', name: 'Batería de Jazz de los Años 40', category: 'music', rarity: 'epic', baseValue: 5900, desc: 'Bombo de madera con parche pintado, platillos turcos y aros de latón. Suena a club nocturno.' },
  { id: 'casco_gladiador_murmillo', name: 'Casco de Gladiador Murmillo', category: 'rarities', rarity: 'epic', baseValue: 5200, desc: 'Bronce repujado con rejilla de visión y cresta de pez. Réplica de museo pompeyano.' },
  { id: 'camara_daguerrotipo', name: 'Cámara de Daguerrotipo', category: 'machines', rarity: 'epic', baseValue: 5500, desc: 'Cámara de cajas deslizantes de 1839 con su placa de plata espejada.' },
  { id: 'tenis_para_dos_1958', name: 'Tenis para Dos (Osciloscopio 1958)', category: 'videogames', rarity: 'epic', baseValue: 4800, desc: 'Uno de los primeros videojuegos: una pelota rebotando en un osciloscopio de laboratorio.' },
  { id: 'linterna_magica', name: 'Linterna Mágica Victoriana', category: 'entertainment', rarity: 'epic', baseValue: 2900, desc: 'Proyector de hojalata y latón con placas de vidrio pintadas a mano. El cine antes del cine.' },
  { id: 'molinillo_otomano', name: 'Molinillo de Café Otomano', category: 'everyday', rarity: 'epic', baseValue: 1700, desc: 'Cilindro de latón grabado con manivela plegable. Muele el café fino como harina.' },
  // ---------- legendarios ----------
  { id: 'astrolabio_persa', name: 'Astrolabio Persa de Latón', category: 'machines', rarity: 'legendary', baseValue: 14500, desc: 'Instrumento safávida con red calada de estrellas: medía la hora, la altura del sol y la dirección de La Meca.' },
  { id: 'telescopio_galileo', name: 'Telescopio de Galileo (Réplica)', category: 'machines', rarity: 'legendary', baseValue: 12000, desc: 'Tubo forrado en cuero con dorado a fuego. Con uno así se vieron las lunas de Júpiter en 1610.' },
  { id: 'globo_celeste_laton', name: 'Globo Celeste de Latón', category: 'rarities', rarity: 'legendary', baseValue: 16000, desc: 'Las constelaciones pintadas en oro sobre azul profundo, con meridiano y horizonte grabados.' },
  { id: 'esfera_armilar', name: 'Esfera Armilar Renacentista', category: 'machines', rarity: 'legendary', baseValue: 13500, desc: 'Anillos de latón que modelan el cielo: eclíptica, trópicos y círculos polares alrededor de la Tierra.' },
  { id: 'maquina_vapor_watt', name: 'Máquina de Vapor de Watt (Modelo)', category: 'machines', rarity: 'legendary', baseValue: 18000, desc: 'Modelo de museo de la máquina de balancín: volante, regulador centrífugo y engranaje planetario.' },
  { id: 'gramofono_dorado', name: 'Gramófono de Corneta Dorada', category: 'music', rarity: 'legendary', baseValue: 13000, desc: 'Caja de caoba y corneta de pétalos bañada en oro. Tocaba los 78 del salón de baile.' },
  { id: 'saxofon_oro_grabado', name: 'Saxofón Tenor Chapado en Oro', category: 'music', rarity: 'legendary', baseValue: 11000, desc: 'Grabado a mano en la campana. Perteneció a un solista de las big bands de los cuarenta.' },
  { id: 'escudo_vikingo', name: 'Escudo Vikingo de Tablas', category: 'rarities', rarity: 'legendary', baseValue: 8800, desc: 'Tablas de tilo pintadas, umbo de hierro y borde de cuero crudo. Réplica de Gokstad.' },
  { id: 'kabuto_menpo', name: 'Kabuto y Menpō de Samurái', category: 'art', rarity: 'legendary', baseValue: 21000, desc: 'Casco de 62 placas laqueadas con cuernos dorados y máscara de hierro rojo. Periodo Edo.' },
  { id: 'tabla_surf_madera_1920', name: 'Tabla de Surf de Madera Maciza (1920)', category: 'sports', rarity: 'legendary', baseValue: 15500, desc: 'Tabla de secoya de casi tres metros, sin quilla, como las de los pioneros hawaianos.' },
  { id: 'bicicleta_ruta_acero', name: 'Bicicleta de Ruta de Acero (1968)', category: 'sports', rarity: 'legendary', baseValue: 8200, desc: 'Cuadro de acero con orejetas cromadas, tubulares de seda y cambios de palanca. Ganó una vuelta.' },
  { id: 'escultura_murano_llama', name: 'Escultura de Cristal de Murano', category: 'art', rarity: 'legendary', baseValue: 9800, desc: 'Llama retorcida de vidrio soplado con hilos de color y hoja de oro atrapada.' },
  { id: 'maquina_escribir_oro', name: 'Máquina de Escribir Chapada en Oro', category: 'machines', rarity: 'legendary', baseValue: 22000, desc: 'Edición de presentación de 1926 con teclas de nácar. Escribió contratos de un magnate.' },
  { id: 'piano_cola_miniatura', name: 'Piano de Cola en Miniatura', category: 'music', rarity: 'legendary', baseValue: 7400, desc: 'Réplica a escala 1:6 de un piano de concierto, laca negra y arpa dorada. Obra de ebanista.' },
  { id: 'gabinete_fibra_1971', name: 'Gabinete Arcade de Fibra de Vidrio (1971)', category: 'videogames', rarity: 'legendary', baseValue: 17500, desc: 'El primer arcade comercial: curvas espaciales de fibra con escarcha metálica azul.' },
  { id: 'cinematografo_1895', name: 'Cinematógrafo de 1895', category: 'entertainment', rarity: 'legendary', baseValue: 19500, desc: 'Cámara-proyector de manivela sobre trípode. Así nacieron las primeras funciones de cine.' },
  { id: 'servicio_te_taxco', name: 'Servicio de Té de Plata de Taxco', category: 'everyday', rarity: 'legendary', baseValue: 8600, desc: 'Plata .925 repujada por un maestro platero, con charola de asas y mangos de ébano.' },
  { id: 'pajaro_cantor_jaula', name: 'Pájaro Cantor Autómata en Jaula', category: 'toys', rarity: 'legendary', baseValue: 16500, desc: 'Autómata suizo: el pájaro mueve el pico y la cola mientras canta con un fuelle diminuto.' },
  { id: 'antorcha_olimpica_1968', name: 'Antorcha de la Llama Olímpica 1968', category: 'sports', rarity: 'legendary', baseValue: 14000, desc: 'Antorcha del relevo que llevó el fuego a la Ciudad de México. Aluminio grabado.' },
  // ---------- únicos ----------
  { id: 'violin_cremona_1716', name: 'Violín de Cremona 1716', category: 'music', rarity: 'unique', baseValue: 98000, desc: 'Arce flameado y barniz ámbar de un taller cremonés del siglo de oro. Su voz no tiene precio.' },
  { id: 'mascara_jade_maya', name: 'Máscara Funeraria de Jade Maya', category: 'art', rarity: 'unique', baseValue: 86000, desc: 'Mosaico de jadeíta con ojos de concha y obsidiana. Réplica de museo del ajuar de un rey de Palenque.' },
  { id: 'codice_mexica', name: 'Códice Mexica Plegado', category: 'art', rarity: 'unique', baseValue: 72000, desc: 'Biombo de piel de venado estucada con los signos del tonalpohualli pintados en colores minerales.' },
  { id: 'penacho_quetzal', name: 'Penacho de Plumas de Quetzal (Réplica)', category: 'art', rarity: 'unique', baseValue: 64000, desc: 'Abanico de plumas de quetzal, cotinga y guacamaya con placas de oro. Réplica de artesanos amantecas.' },
  { id: 'piedra_sol_oro', name: 'Piedra del Sol de Oro', category: 'valuables', rarity: 'unique', baseValue: 92000, desc: 'El calendario mexica cincelado en un disco de oro macizo, con su atril de obsidiana.' },
  { id: 'reloj_astronomico', name: 'Reloj Astronómico Gótico', category: 'machines', rarity: 'unique', baseValue: 76000, desc: 'Esfera con zodiaco, sol y luna, calendario perpetuo y torre de pináculos dorados.' },
  { id: 'automata_escritor', name: 'Autómata Escritor Suizo', category: 'machines', rarity: 'unique', baseValue: 115000, desc: 'Un niño mecánico que moja la pluma y escribe cartas. Seis mil piezas en su espalda.' },
  { id: 'arpa_concierto_dorada', name: 'Arpa de Concierto Dorada', category: 'music', rarity: 'unique', baseValue: 48000, desc: 'Arpa de pedales de 47 cuerdas con columna corintia y hoja de oro de 23 quilates.' },
  { id: 'huevo_imperial_celosia', name: 'Huevo Imperial de Celosía', category: 'valuables', rarity: 'unique', baseValue: 118000, desc: 'Esmalte guilloché azul, red de oro y rosas de diamantes. Regalo de Pascua de una corte imperial.' },
  { id: 'cuaderno_leonardo', name: 'Cuaderno de Leonardo y Ornitóptero', category: 'art', rarity: 'unique', baseValue: 68000, desc: 'Facsímil del códice con escritura en espejo junto a un modelo de su máquina voladora.' },
  { id: 'meteorito_hierro', name: 'Meteorito de Hierro Pulido', category: 'rarities', rarity: 'unique', baseValue: 44000, desc: 'Siderito con cara grabada al ácido que revela las figuras de Widmanstätten, formadas en el espacio.' },
  { id: 'craneo_dientes_sable', name: 'Cráneo de Tigre Dientes de Sable', category: 'rarities', rarity: 'unique', baseValue: 36000, desc: 'Smilodon del Pleistoceno rescatado de un pozo de brea. Colmillos de 28 centímetros.' },
  // ---------- exóticos ----------
  { id: 'mecanismo_anticitera', name: 'Mecanismo de Anticitera', category: 'machines', rarity: 'exotic', baseValue: 260000, desc: 'Reconstrucción funcional de la computadora griega de bronce, junto a un fragmento corroído.' },
  { id: 'craneo_cristal_cuarzo', name: 'Cráneo de Cristal de Cuarzo', category: 'mystery', rarity: 'exotic', baseValue: 190000, desc: 'Tallado en una sola pieza de cuarzo transparente. Nadie sabe quién lo hizo ni cómo.' },
  { id: 'pepita_oro_gigante', name: 'Pepita de Oro Gigante', category: 'valuables', rarity: 'exotic', baseValue: 150000, desc: 'Casi doce kilos de oro nativo hallados en un arroyo de Sonora. Ninguna otra se le parece.' },
  { id: 'nido_dinosaurio', name: 'Nido de Huevos de Dinosaurio', category: 'rarities', rarity: 'exotic', baseValue: 175000, desc: 'Nidada completa de hadrosaurio en su arenisca original. Setenta millones de años en espera.' },
  { id: 'espejo_obsidiana', name: 'Espejo Humeante de Obsidiana', category: 'mystery', rarity: 'exotic', baseValue: 98000, desc: 'Espejo de obsidiana pulida en marco de oro y turquesa. Dicen que muestra lo que no quieres ver.' },
];

// =====================================================================
//  utilidades locales
// =====================================================================
const PI = Math.PI, TAU = Math.PI * 2;
const sp = (pts) => {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  s.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
  s.closePath();
  return s;
};
const spPath = (pts) => { const s = new THREE.Path(); s.moveTo(pts[0][0], pts[0][1]); s.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y))); s.closePath(); return s; };
function poly(pts, hole = false) {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) s.lineTo(x, y);
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
const mirror = (half) => [...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
function lathe(g, pts, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, seg = 48, phi0 = 0, phiL = TAU) {
  const geo = new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(Math.max(0, a), b)), seg, phi0, phiL);
  return add(g, geo, m, x, y, z, rx, ry, rz);
}
const latheGeo = (pts, seg = 24, phi0 = 0, phiL = TAU) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(Math.max(0, a), b)), seg, phi0, phiL);
// perfil liso interpolado (curva spline) para tornos
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
// geometría de tubo de radio variable (sin tapas) para fusionar
function swGeo(pts, radii, radial = 10, segs = 24, flatZ = 1) {
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
  return geo;
}
const tubeGeo = (pts, r, segs = 32, radial = 8, closed = false) => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p)), closed), segs, r, radial, closed);
function ground(g) {
  g.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(g);
  const dy = -bb.min.y;
  for (const c of g.children) c.position.y += dy;
  return g;
}
// ruido de valor 3D suave (para rocas, pepitas, etc.)
function noise3(seed) {
  const R = rng(seed), P = new Uint8Array(512), G = new Float32Array(256);
  for (let i = 0; i < 256; i++) { P[i] = i; G[i] = R() * 2 - 1; }
  for (let i = 255; i > 0; i--) { const j = (R() * (i + 1)) | 0; [P[i], P[j]] = [P[j], P[i]]; }
  for (let i = 0; i < 256; i++) P[i + 256] = P[i];
  const f = (t) => t * t * (3 - 2 * t);
  const h = (x, y, z) => G[P[P[P[x & 255] + (y & 255)] + (z & 255)]];
  const n = (x, y, z) => {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z), u = f(x - X), v = f(y - Y), w = f(z - Z);
    const l = (a, b, t) => a + (b - a) * t;
    return l(l(l(h(X, Y, Z), h(X + 1, Y, Z), u), l(h(X, Y + 1, Z), h(X + 1, Y + 1, Z), u), v), l(l(h(X, Y, Z + 1), h(X + 1, Y, Z + 1), u), l(h(X, Y + 1, Z + 1), h(X + 1, Y + 1, Z + 1), u), v), w);
  };
  return (x, y, z, oct = 3) => { let s = 0, a = 1, fr = 1, t = 0; for (let i = 0; i < oct; i++) { s += n(x * fr, y * fr, z * fr) * a; t += a; a *= 0.5; fr *= 2.03; } return s / t; };
}
// desplaza una geometría a lo largo de su normal con una función
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
// materiales
const dbl = (color, o = {}) => mat(color, { side: THREE.DoubleSide, ...o });
const texM = (tex, o = {}) => mat(0xffffff, { map: tex, roughness: 0.6, ...o });
const glassD = (color = 0xd8ecf2, opacity = 0.25) => mat(color, { transparent: true, opacity, roughness: 0.04, metalness: 0.1, env: true, envI: 1.3, depthWrite: false, side: THREE.DoubleSide });
const gold = (r = 0.22) => metal(0xe0b04a, r);
const goldD = () => metal(0xe0b04a, 0.22, { side: THREE.DoubleSide });
const brass = () => metal(0xc49a45, 0.3);
const brassD = () => metal(0xc49a45, 0.3, { side: THREE.DoubleSide });
const gem = (color, op = 0.85) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.02, metalness: 0, transmission: 0.6, thickness: 0.01, ior: 2.0, transparent: true, opacity: op, envMapIntensity: 1.5 });
const circleDecal = (g, r, tex, x, y, z, rx = 0, ry = 0, rz = 0, o = {}) => add(g, new THREE.CircleGeometry(r, 64), texM(tex, o), x, y, z, rx, ry, rz);
// repetición de textura (clon con repeat)
function rep(tex, rx, ry, ox = 0, oy = 0) {
  const t = tex.clone(); t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.offset.set(ox, oy);
  return t;
}

// =====================================================================
//  texturas procedurales
// =====================================================================
// grabado de rinceaux / filigrana sobre metal
function engraveTex(key, base = '#d8ab4a', line = 'rgba(70,40,5,0.55)', o = {}) {
  const { w = 512, h = 256, density = 1, border = true } = o;
  return canvasTex('C_eng_' + key, w, h, (c) => {
    const R = rng(key.length * 131 + 7);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    // brillo cepillado
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.05})`; c.fillRect(0, R() * h, w, 1); }
    c.strokeStyle = line; c.lineCap = 'round';
    const spiral = (x, y, r, dir) => {
      c.beginPath();
      for (let t = 0; t < 9; t += 0.15) { const rr = r * (1 - t / 10); c.lineTo(x + Math.cos(t * dir) * rr, y + Math.sin(t * dir) * rr); }
      c.stroke();
    };
    const n = Math.round(10 * density);
    for (let row = 0; row < 2; row++) {
      const y0 = h * (0.3 + row * 0.4);
      c.lineWidth = 2.2;
      c.beginPath();
      for (let x = 0; x <= w; x += 4) c.lineTo(x, y0 + Math.sin(x / w * TAU * n / 2) * h * 0.12);
      c.stroke();
      c.lineWidth = 1.5;
      for (let i = 0; i < n; i++) {
        const x = (i + 0.25) * w / n, s = i % 2 ? 1 : -1;
        spiral(x, y0 + s * h * 0.08, h * 0.08, s);
        // hojitas
        c.beginPath(); c.ellipse(x + w / n * 0.5, y0 - s * h * 0.07, h * 0.035, h * 0.012, s * 0.8, 0, TAU); c.stroke();
      }
    }
    if (border) { c.lineWidth = 3; c.strokeRect(2, 2, w - 4, h - 4); c.lineWidth = 1; c.strokeRect(9, 9, w - 18, h - 18); }
    // puntillado
    c.fillStyle = line;
    for (let i = 0; i < 700 * density; i++) c.fillRect(R() * w, R() * h, 1, 1);
  }, true);
}
// pergamino / papel viejo
function parchmentTex(key, o = {}) {
  const { w = 512, h = 512, base = '#e9dab4', dark = 'rgba(120,80,30,', draw = null } = o;
  return canvasTex('C_parch_' + key, w, h, (c) => {
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
// piedra / roca
function stoneTex(key, base = [150, 138, 118], o = {}) {
  const { w = 256, h = 256, spots = 900, veins = 6 } = o;
  return canvasTex('C_stone_' + key, w, h, (c) => {
    const R = rng(key.length * 29 + 11);
    c.fillStyle = `rgb(${base})`; c.fillRect(0, 0, w, h);
    for (let i = 0; i < spots; i++) { const k = 0.75 + R() * 0.5; c.fillStyle = `rgba(${base.map(v => Math.min(255, v * k) | 0)},0.55)`; c.beginPath(); c.arc(R() * w, R() * h, 1 + R() * 7, 0, TAU); c.fill(); }
    for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.15})`; c.fillRect(R() * w, R() * h, 1, 1); }
    c.strokeStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < veins; i++) { c.lineWidth = 0.5 + R() * 1.5; c.beginPath(); let x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (R() - 0.5) * 60; y += (R() - 0.5) * 60; c.lineTo(x, y); } c.stroke(); }
  }, true);
}
// terciopelo
function velvetTex(key, col = '#5a0f1c') {
  return canvasTex('C_velv_' + key, 128, 128, (c, w, h) => {
    const R = rng(key.length + 5);
    c.fillStyle = col; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,255,255'},${R() * 0.06})`; c.fillRect(R() * w, R() * h, 2, 1); }
  }, true);
}
// madera con veta (tono libre) y opcional flameado
function grainTex(key, base = '#6a3a1a', o = {}) {
  const { w = 256, h = 512, flame = 0, lines = 90, dark = 'rgba(40,18,5,', light = 'rgba(255,220,160,' } = o;
  return canvasTex('C_grain_' + key, w, h, (c) => {
    const R = rng(key.length * 53 + 9);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < lines; i++) {
      const x0 = R() * w, amp = 2 + R() * 6, f = 0.005 + R() * 0.01, ph = R() * 6;
      c.strokeStyle = (R() < 0.7 ? dark : light) + (0.05 + R() * 0.13) + ')'; c.lineWidth = 0.5 + R() * 2.5;
      c.beginPath();
      for (let y = 0; y <= h; y += 8) c.lineTo(x0 + Math.sin(y * f + ph) * amp, y);
      c.stroke();
    }
    if (flame) {
      for (let y = 0; y < h; y += 3) {
        const a = 0.5 + 0.5 * Math.sin(y * 0.35 + Math.sin(y * 0.05) * 3);
        c.fillStyle = `rgba(255,230,180,${a * 0.14 * flame})`; c.fillRect(0, y, w, 2);
        c.fillStyle = `rgba(40,15,0,${(1 - a) * 0.12 * flame})`; c.fillRect(0, y + 1.5, w, 1.5);
      }
    }
  }, true);
}
// madera con veta: material blanco con la textura (repetición opcional para caras extruidas en metros)
function woodM(key, base, o = {}) {
  const { rx = 1, ry = 1, rough = 0.45, envI = 0.4, flame = 0, lines } = o;
  const t = grainTex(key, base, { flame, ...(lines ? { lines } : {}) });
  return mat(0xffffff, { map: rx === 1 && ry === 1 ? t : rep(t, rx, ry), roughness: rough, env: true, envI });
}
// laca con reflejos (para cajas, pianos)
const lacquer = (color) => mat(color, { roughness: 0.12, metalness: 0.05, env: true, envI: 0.9 });
// placa de latón con texto grabado
function plaque(g, text, sub, w, h, x, y, z, rx = 0, ry = 0) {
  const t = labelTex(text, { bg: '#c9a24e', fg: '#3a2608', w: 512, h: 128, font: 'bold 50px Georgia', border: '#5a3c10', sub, subFont: 'italic 30px Georgia' });
  RB(g, w + 0.006, h + 0.006, 0.004, 0.0015, brass(), x, y, z - 0.001, rx, ry);
  return P(g, w, h, t, x + Math.sin(ry) * 0.0022, y, z + 0.0012 * Math.cos(rx) + Math.cos(ry) * 0.001, rx, ry, 0, { rough: 0.35 });
}
// peana torneada elegante (madera o mármol) — devuelve la altura superior
function plinth(g, r = 0.1, h = 0.05, m = C.darkWood(), o = {}) {
  const { trim = null, square = false } = o;
  if (square) {
    const w = r * 2;
    RB(g, w, h * 0.35, w, 0.004, m, 0, h * 0.175, 0);
    RB(g, w * 0.92, h * 0.5, w * 0.92, 0.006, m, 0, h * 0.35 + h * 0.25, 0);
    RB(g, w * 0.96, h * 0.15, w * 0.96, 0.003, trim ?? m, 0, h * 0.925, 0);
    return h;
  }
  const pr = [[0, 0], [r, 0], [r, h * 0.16]];
  for (let i = 0; i <= 6; i++) { const a = i / 6 * PI / 2; pr.push([r * 0.9 + Math.cos(a) * r * 0.1 * 0.9, h * 0.16 + Math.sin(a) * h * 0.16]); } // cuarto bocel
  pr.push([r * 0.9, h * 0.36], [r * 0.88, h * 0.4], [r * 0.88, h * 0.74]);
  for (let i = 0; i <= 6; i++) { const a = i / 6 * PI / 2; pr.push([r * 0.88 + Math.sin(a) * r * 0.06, h * 0.74 + (1 - Math.cos(a)) * h * 0.14]); } // cavetto
  pr.push([r * 0.95, h * 0.9], [r * 0.95, h * 0.97], [r * 0.935, h], [0, h]);
  lathe(g, pr, m, 0, 0, 0, 0, 0, 0, 64);
  if (trim) lathe(g, [[r * 0.905, h * 0.58], [r * 0.915, h * 0.6], [r * 0.915, h * 0.64], [r * 0.905, h * 0.66]], trim, 0, 0, 0, 0, 0, 0, 64);
  return h;
}

// id -> (seed) => THREE.Group   (cada modelo se agrega abajo con BUILDERS_C.id = fn)
const BUILDERS_C = {};
export function registerC(reg) {
  for (const it of ITEMS_C) if (BUILDERS_C[it.id]) reg(it.id, BUILDERS_C[it.id]);
}
export const BUILT_IDS = () => Object.keys(BUILDERS_C);

// =====================================================================
//  ÉPICOS
// =====================================================================
// ---------- Bombilla de Edison bajo campana ----------
BUILDERS_C.bombilla_edison_1879 = () => {
  const g = new THREE.Group();
  const walnut = mat(0xffffff, { map: grainTex('nogal', '#5a3418'), roughness: 0.4, env: true, envI: 0.4 });
  const h0 = plinth(g, 0.105, 0.045, walnut, { trim: brass() });
  // anillo de latón donde asienta la campana
  lathe(g, [[0.078, h0], [0.086, h0], [0.086, h0 + 0.008], [0.08, h0 + 0.01], [0.078, h0 + 0.01]], brass(), 0, 0, 0, 0, 0, 0, 48);
  // campana de vidrio
  const bell = smooth([[0.074, h0 + 0.006], [0.075, h0 + 0.1], [0.072, h0 + 0.18], [0.06, h0 + 0.225], [0.035, h0 + 0.245], [0.012, h0 + 0.25], [0.0, h0 + 0.25]], 40);
  lathe(g, bell, glassD(0xe6f2f5, 0.16), 0, 0, 0, 0, 0, 0, 56).castShadow = false;
  // perilla de la campana
  lathe(g, smooth([[0, h0 + 0.248], [0.012, h0 + 0.25], [0.008, h0 + 0.256], [0.011, h0 + 0.266], [0.0, h0 + 0.274]], 16), glassD(0xe6f2f5, 0.35), 0, 0, 0, 0, 0, 0, 24);
  // zócalo de porcelana y casquillo
  const porc = C.porcelain(0xf2eee2);
  lathe(g, [[0, h0], [0.028, h0], [0.028, h0 + 0.02], [0.022, h0 + 0.026], [0.018, h0 + 0.028], [0, h0 + 0.028]], porc, 0, 0, 0, 0, 0, 0, 36);
  const screw = [];
  for (let i = 0; i <= 24; i++) { const t = i / 24; screw.push([0.0135 + Math.sin(t * PI * 10) * 0.0012, h0 + 0.028 + t * 0.022]); }
  lathe(g, [[0, h0 + 0.028], ...screw, [0.012, h0 + 0.052], [0, h0 + 0.052]], brass(), 0, 0, 0, 0, 0, 0, 32);
  // bulbo en forma de pera con punta de sellado
  const yb = h0 + 0.05;
  const bulb = smooth([[0.008, yb], [0.014, yb + 0.012], [0.03, yb + 0.04], [0.038, yb + 0.07], [0.033, yb + 0.1], [0.018, yb + 0.118], [0.005, yb + 0.124], [0.0025, yb + 0.13], [0, yb + 0.134]], 44);
  lathe(g, bulb, glassD(0xfff4dc, 0.22), 0, 0, 0, 0, 0, 0, 48).castShadow = false;
  // soporte de vidrio interior y alambres de platino
  lathe(g, smooth([[0.007, yb], [0.006, yb + 0.02], [0.0035, yb + 0.03], [0.0025, yb + 0.034], [0, yb + 0.035]], 12), glassD(0xf5f0e0, 0.45), 0, 0, 0, 0, 0, 0, 20);
  const wire = metal(0xd8d8d0, 0.25);
  for (const s of [-1, 1]) TU(g, [[s * 0.002, yb + 0.03, 0], [s * 0.004, yb + 0.045, 0], [s * 0.006, yb + 0.058, 0]], 0.0006, wire, false, 8);
  // filamento de bambú carbonizado en herradura (brilla tenue)
  const fil = [];
  for (let i = 0; i <= 28; i++) { const a = PI - i / 28 * PI; fil.push([Math.cos(a) * 0.012 * (1 + 0.15 * Math.sin(a)), yb + 0.058 + Math.sin(a) * 0.035, Math.sin(i * 0.9) * 0.0008]); }
  TU(g, fil, 0.0009, mat(0x3a1a08, { emissive: 0xff8a2a, emissiveIntensity: 1.6, roughness: 0.6 }), false, 40);
  // pinzas del filamento
  for (const s of [-1, 1]) CY(g, 0.0014, 0.0014, 0.004, mat(0x444444, { metalness: 0.6, roughness: 0.4 }), s * 0.006, yb + 0.058, 0, 0, 0, 0, 8);
  // cable de algodón trenzado que sale de la peana
  TU(g, [[0.02, h0 * 0.5, -0.1], [0.04, 0.01, -0.14], [0.09, 0.006, -0.16], [0.14, 0.006, -0.12]], 0.003, C.cloth(0x6a2a18), false, 24);
  plaque(g, 'T. A. EDISON', 'Menlo Park · 1879', 0.07, 0.018, 0, h0 * 0.55, 0.0975, 0, 0);
  return g;
};

// ---------- Teléfono de Bell (“de horca”) ----------
BUILDERS_C.telefono_bell_1876 = () => {
  const g = new THREE.Group();
  const oak = woodM('roble_bell', '#9a6a36', { rx: 3, ry: 3, lines: 70 });
  const oakD = woodM('roble_bell2', '#7a4e26', { rx: 3, ry: 3 });
  // base con moldura
  EXS(g, rrect(0.3, 0.16, 0.012), 0.02, oak, 0, 0.01, 0, -PI / 2, 0, 0, 0.004);
  EXS(g, rrect(0.27, 0.13, 0.01), 0.008, oakD, 0, 0.026, 0, -PI / 2, 0, 0, 0.003);
  // poste vertical (horca) con arco
  const post = new THREE.Shape();
  post.moveTo(-0.018, 0); post.lineTo(0.018, 0); post.lineTo(0.018, 0.13); post.quadraticCurveTo(0.018, 0.17, 0.06, 0.17); post.lineTo(0.09, 0.17);
  post.lineTo(0.09, 0.2); post.lineTo(0.05, 0.2); post.quadraticCurveTo(-0.018, 0.2, -0.018, 0.13); post.closePath();
  EXS(g, post, 0.03, oak, -0.1, 0.03, 0, 0, 0, 0, 0.003);
  // bobinas del electroimán (horizontales, colgando del brazo)
  const coilTex = canvasTex('C_coil', 64, 256, (c, w, h) => { c.fillStyle = '#9a4a1e'; c.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 3) { c.fillStyle = 'rgba(255,190,120,0.45)'; c.fillRect(0, y, w, 1); c.fillStyle = 'rgba(40,10,0,0.4)'; c.fillRect(0, y + 2, w, 1); } }, true);
  const coilM = mat(0xffffff, { map: rep(coilTex, 1, 3), metalness: 0.5, roughness: 0.35, env: true });
  for (const z of [-0.018, 0.018]) {
    const coil = lathe(g, [[0, 0], [0.013, 0], [0.013, 0.004], [0.016, 0.006], [0.016, 0.054], [0.013, 0.056], [0.013, 0.06], [0, 0.06]], coilM, 0.0, 0.17, z, 0, 0, -PI / 2, 24);
    coil.position.x = -0.02;
    lathe(g, [[0, 0], [0.014, 0], [0.014, 0.004], [0, 0.004]], brass(), 0.04, 0.17, z, 0, 0, -PI / 2, 20);
  }
  B(g, 0.01, 0.06, 0.07, C.iron(), -0.027, 0.17, 0);
  // armadura y marco del tambor
  const frame = new THREE.Shape(); frame.absarc(0, 0, 0.06, 0, TAU, false);
  frame.holes.push(circ(0.045, 0, 0, true));
  EXS(g, frame, 0.016, oak, 0.075, 0.17, 0, 0, PI / 2, 0, 0.002);
  // membrana de pergamino
  const memb = parchmentTex('bell_memb', { w: 128, h: 128, base: '#e3d0a2' });
  circleDecal(g, 0.046, memb, 0.066, 0.17, 0, 0, -PI / 2, 0, { side: THREE.DoubleSide, roughness: 0.8 });
  circleDecal(g, 0.046, memb, 0.084, 0.17, 0, 0, PI / 2, 0, { side: THREE.DoubleSide, roughness: 0.8 });
  // boquilla (embudo de latón)
  const funnel = lathe(g, smooth([[0.046, 0], [0.042, 0.006], [0.03, 0.02], [0.02, 0.035], [0.016, 0.06], [0.018, 0.064], [0.014, 0.066]], 28), brassD(), 0, 0, 0, 0, 0, 0, 40);
  funnel.position.set(0.09, 0.17, 0); funnel.rotation.z = -PI / 2;
  // soporte de latón del marco
  EXS(g, poly([[-0.03, 0], [0.03, 0], [0.012, 0.1], [-0.012, 0.1]]), 0.012, brass(), 0.075, 0.03, 0, 0, PI / 2, 0, 0.002);
  // tornillo de ajuste
  CY(g, 0.004, 0.004, 0.05, brass(), -0.07, 0.228, 0, 0, 0, PI / 2, 12);
  lathe(g, [[0, 0], [0.011, 0], [0.011, 0.006], [0.006, 0.01], [0, 0.01]], brass(), -0.1, 0.228, 0, 0, 0, PI / 2, 20);
  // bornes y cables
  for (const s of [-1, 1]) {
    lathe(g, [[0, 0], [0.009, 0], [0.009, 0.004], [0.004, 0.006], [0.004, 0.014], [0.007, 0.016], [0.007, 0.02], [0, 0.021]], brass(), -0.125, 0.03, s * 0.05, 0, 0, 0, 16);
    TU(g, [[-0.125, 0.045, s * 0.05], [-0.13, 0.08, s * 0.04], [-0.06, 0.11, s * 0.02], [-0.03, 0.15, s * 0.015]], 0.0015, C.copper(), false, 20);
    TU(g, [[-0.125, 0.04, s * 0.05], [-0.16, 0.03, s * 0.06], [-0.2, 0.005, s * 0.08]], 0.0022, C.cloth(0x2a2a60), false, 12);
  }
  plaque(g, 'A. G. BELL', 'Boston · 1876', 0.08, 0.016, 0.02, 0.011, 0.0865, 0, 0);
  ground(g);
  return g;
};

// ---------- Microscopio de Leeuwenhoek en estuche ----------
function leeuwenhoek() {
  const g = new THREE.Group();
  const br = metal(0xd8b060, 0.24);
  // dos placas remachadas con el agujero de la lente
  const plate = rrect(0.024, 0.044, 0.006);
  plate.holes.push(circ(0.0011, 0, 0.012, true));
  EXS(g, plate, 0.0008, br, 0, 0, 0.0006, 0, 0, 0, 0.0003);
  EXS(g, plate, 0.0008, metal(0xb8924a, 0.38), 0, 0, -0.0006, 0, 0, 0, 0.0003);
  const riv = [];
  for (const [x, y] of [[-0.008, 0.018], [0.008, 0.018], [-0.008, -0.004], [0.008, -0.004], [0, -0.018]]) riv.push(gx(new THREE.SphereGeometry(0.0009, 8, 6), x, y, 0.0012, 0, 0, 0, [1, 1, 0.5]));
  merged(g, riv, br);
  SP(g, 0.0012, glass(0xf4fbff, 0.6), 0, 0.012, 0);
  // tornillo largo (enfoque) por detrás
  const thr = [];
  for (let i = 0; i <= 40; i++) thr.push([0.0011 + (i % 2) * 0.0004, i / 40 * 0.032]);
  lathe(g, [[0, 0], ...thr, [0, 0.032]], br, 0, -0.03, -0.0035, 0, 0, 0, 12);
  // escuadra que une el tornillo a la placa
  EX(g, [[-0.002, 0], [0.002, 0], [0.002, 0.006], [-0.002, 0.006]], 0.004, br, 0, -0.022, -0.002, 0, 0, 0, 0.0005);
  // bloque portamuestras con aguja
  RB(g, 0.006, 0.006, 0.004, 0.001, br, 0, -0.002, -0.0045);
  CY(g, 0.0005, 0.0005, 0.014, br, 0, 0.007, -0.0035, 0, 0, 0, 6);
  CO(g, 0.0005, 0.002, br, 0, 0.0152, -0.0035, 0, 0, 0, 6);
  // tornillo lateral de ajuste
  CY(g, 0.0008, 0.0008, 0.012, br, 0.006, 0.003, -0.005, 0, 0, PI / 2, 8);
  lathe(g, [[0, 0], [0.0026, 0], [0.0028, 0.002], [0.0026, 0.004], [0, 0.004]], br, 0.012, 0.003, -0.005, 0, 0, -PI / 2, 14);
  // perilla inferior moleteada
  const kn = []; for (let i = 0; i <= 16; i++) kn.push([0.0035 + (i % 2) * 0.0004, -0.035 + i / 16 * 0.006]);
  lathe(g, [[0, -0.035], ...kn, [0, -0.029]], br, 0, 0, -0.0035, 0, 0, 0, 16);
  return g;
}
BUILDERS_C.microscopio_leeuwenhoek = () => {
  const g = new THREE.Group();
  const shell = woodM('caoba_est', '#6a2e14', { rx: 3, ry: 3, rough: 0.3, envI: 0.5 });
  const vel = mat(0xffffff, { map: velvetTex('azul', '#1b3868'), roughness: 1 });
  const W = 0.16, D = 0.11, H = 0.03;
  // caja (paredes) + fondo de terciopelo
  const box = rrect(W, D, 0.008); box.holes.push(rrect(W - 0.014, D - 0.014, 0.004, 0, 0, true));
  EXS(g, box, H, shell, 0, H / 2, 0, -PI / 2, 0, 0, 0.0015);
  RB(g, W - 0.006, 0.006, D - 0.006, 0.002, shell, 0, 0.003, 0);
  RB(g, W - 0.014, 0.014, D - 0.014, 0.004, vel, 0, 0.012, 0);
  // hueco con cojín
  RB(g, 0.05, 0.008, 0.07, 0.004, vel, -0.03, 0.02, 0.005);
  // tapa abierta con carta pergamino
  const lid = grp(g, 0, H, -D / 2 + 0.002, -1.95, 0, 0);
  const lidS = rrect(W, D, 0.008);
  EXS(lid, lidS, 0.012, shell, 0, 0.006, D / 2, -PI / 2, 0, 0, 0.0015);
  RB(lid, W - 0.014, 0.004, D - 0.014, 0.002, vel, 0, -0.0025, D / 2);
  const letter = parchmentTex('carta_lw', { w: 512, h: 360, draw: (c, w, h, R) => {
    c.fillStyle = '#3a2410'; c.font = 'italic 22px Georgia';
    for (let i = 0; i < 9; i++) c.fillText(['Delft, 9 de octubre de 1676', 'Muy señores míos:', 'he visto en una gota de agua', 'de lluvia animálculos vivos,', 'mil veces más pequeños', 'que el ojo de un piojo…', '', 'A. van Leeuwenhoek'][i] ?? '', 30, 40 + i * 30);
    c.strokeStyle = '#3a2410'; c.lineWidth = 1.5;
    for (let k = 0; k < 14; k++) { const x = 320 + R() * 160, y = 200 + R() * 130; c.beginPath(); c.ellipse(x, y, 4 + R() * 8, 2 + R() * 4, R() * 3, 0, TAU); c.stroke(); if (R() < 0.5) { c.beginPath(); c.moveTo(x + 8, y); c.bezierCurveTo(x + 14, y - 6, x + 18, y + 6, x + 24, y); c.stroke(); } }
  } });
  P(lid, 0.12, 0.084, letter, 0, -0.0048, D / 2, PI / 2, 0, 0, { rough: 0.9 });
  // bisagras
  for (const s of [-1, 1]) CY(g, 0.003, 0.003, 0.02, brass(), s * 0.05, H + 0.002, -D / 2 + 0.002, 0, 0, PI / 2, 12);
  // cierre frontal
  RB(g, 0.012, 0.012, 0.003, 0.001, brass(), 0, H - 0.006, D / 2 + 0.001);
  // microscopio en su soporte de latón
  const mic = leeuwenhoek(); mic.scale.setScalar(1.35);
  mic.position.set(0.035, 0.019 + 0.052, 0.0); mic.rotation.y = -0.35;
  g.add(mic);
  lathe(g, [[0, 0], [0.014, 0], [0.014, 0.003], [0.004, 0.005], [0.003, 0.013], [0, 0.013]], brass(), 0.035, 0.019, 0.0, 0, 0, 0, 20);
  // frasco de muestras y portaobjetos
  lathe(g, smooth([[0, 0], [0.008, 0], [0.009, 0.004], [0.009, 0.028], [0.006, 0.031], [0.006, 0.036], [0, 0.036]], 20), glassD(0xd8f0e8, 0.35), -0.03, 0.024, 0.0, PI / 2, 0, 0, 24);
  lathe(g, [[0, 0.03], [0.0065, 0.03], [0.0065, 0.04], [0, 0.04]], C.cork ? C.cork() : mat(0xb08850, { roughness: 1 }), -0.03, 0.024, 0.0, PI / 2, 0, 0, 16);
  lathe(g, [[0, 0.001], [0.0082, 0.001], [0.0082, 0.018], [0, 0.018]], mat(0x9ab87a, { transparent: true, opacity: 0.6, roughness: 0.2 }), -0.03, 0.024, 0.0, PI / 2, 0, 0, 16);
  return ground(g);
};

// ---------- Fósil de trilobites ----------
BUILDERS_C.fosil_trilobites = (seed) => {
  const g = new THREE.Group();
  const N = noise3(41);
  // matriz de caliza irregular
  const rockGeo = new THREE.BoxGeometry(0.26, 0.05, 0.19, 26, 5, 20);
  const p = rockGeo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const u = x / 0.13, v = z / 0.095, m = Math.max(Math.abs(u), Math.abs(v));
    const sq = m > 1e-4 ? m / Math.pow(Math.pow(Math.abs(u), 4) + Math.pow(Math.abs(v), 4), 0.25) : 1; // cuadrado -> superelipse
    const ang = Math.atan2(v, u);
    const k = sq * (1 + N(Math.cos(ang) * 2, Math.sin(ang) * 2, y * 8) * 0.28);
    const t = (y + 0.025) / 0.05;
    x *= k * (1 - 0.06 * t); z *= k * (1 - 0.06 * t);
    if (y > 0) { y += N(x * 14 + 3, 0, z * 14) * 0.006 - Math.max(0, m - 0.88) * 0.12; x *= 1 - Math.max(0, m - 0.9) * 0.3; z *= 1 - Math.max(0, m - 0.9) * 0.3; }
    else if (y > -0.024) y += N(x * 20, y * 20, z * 20) * 0.004;
    p.setXYZ(i, x, y + 0.025, z);
  }
  rockGeo.computeVertexNormals();
  const lime = mat(0xffffff, { map: stoneTex('caliza', [186, 172, 146], { veins: 3 }), roughness: 0.92 });
  add(g, rockGeo, lime, 0, 0.012, 0);
  // base de madera
  const wal = mat(0xffffff, { map: grainTex('nogal_tri', '#3a2412'), roughness: 0.4, env: true, envI: 0.4 });
  RB(g, 0.3, 0.014, 0.22, 0.005, wal, 0, 0.007, 0);
  // trilobites (fósil oscuro pulido)
  const fos = mat(0xffffff, { map: stoneTex('fosil', [80, 64, 48], { spots: 400, veins: 0 }), roughness: 0.38, env: true, envI: 0.5 });
  const T = grp(g, 0.005, 0.066, 0.0, 0, 0.35, 0); T.scale.setScalar(1.25);
  const L = 0.14;
  // céfalo
  const ceph = new THREE.SphereGeometry(1, 36, 14, 0, TAU, 0, PI / 2);
  add(T, gx(ceph, 0, 0, 0, 0, 0, 0, [0.036, 0.013, 0.026]), fos, 0, 0, 0.042);
  add(T, gx(new THREE.SphereGeometry(1, 24, 14, 0, TAU, 0, PI / 2), 0, 0, 0, 0, 0, 0, [0.013, 0.012, 0.02]), fos, 0, 0.006, 0.048);
  // ojos compuestos
  const eyeM = mat(0x241a12, { roughness: 0.2, env: true, envI: 0.8 });
  for (const s of [-1, 1]) {
    SP(T, 0.006, eyeM, s * 0.019, 0.0105, 0.043, 1, 0.9, 1.3, 14);
    // espinas genales
    SW(T, [[s * 0.033, 0.001, 0.03], [s * 0.038, 0.0, 0.012], [s * 0.036, -0.001, -0.01], [s * 0.032, -0.002, -0.024]], [0.004, 0.003, 0.002, 0.0006], fos, 8, 16);
  }
  // tórax: 11 segmentos trilobulados
  const segs = [];
  for (let i = 0; i < 11; i++) {
    const z = 0.022 - i * 0.0056, w = 0.031 - i * 0.0012;
    const pts = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8 * 2 - 1; pts.push([t * w, (1 - t * t) * 0.006 + (Math.abs(t) < 0.35 ? 0.004 : 0) - Math.abs(t) * 0.002, z - Math.abs(t) * 0.004]); }
    segs.push(swGeo(pts, (t) => { const u = Math.abs(t * 2 - 1); return u < 0.3 ? 0.0036 : 0.0028 * (1 - u * 0.4); }, 8, 24));
  }
  merged(T, segs, fos);
  // pigidio
  add(T, gx(new THREE.SphereGeometry(1, 28, 10, 0, TAU, 0, PI / 2), 0, 0, 0, 0, 0, 0, [0.022, 0.009, 0.018]), fos, 0, 0, -0.045);
  SP(T, 0.006, fos, 0, 0.004, -0.04, 1, 0.9, 2.2, 12);
  // segundo trilobites pequeño, parcial
  const T2 = grp(g, -0.075, 0.063, -0.04, 0, -2.2, 0); T2.scale.setScalar(0.45);
  add(T2, gx(ceph.clone(), 0, 0, 0, 0, 0, 0, [0.036, 0.013, 0.026]), fos, 0, 0, 0.042);
  merged(T2, segs.slice(0, 7).map(s => s.clone()), fos);
  plaque(g, 'ELRATHIA KINGII', 'Cámbrico · Utah', 0.08, 0.012, 0, 0.007, 0.1105, 0, 0);
  return ground(g);
};

// ---------- Ámbar con mosquito ----------
BUILDERS_C.ambar_mosquito = () => {
  const g = new THREE.Group();
  const N = noise3(77);
  // peana de ébano con aro de plata
  const ebony = mat(0x16100c, { roughness: 0.25, env: true, envI: 0.6 });
  lathe(g, smooth([[0, 0], [0.05, 0], [0.052, 0.006], [0.048, 0.014], [0.036, 0.02], [0.02, 0.024], [0.012, 0.03], [0, 0.03]], 30), ebony, 0, 0, 0, 0, 0, 0, 48);
  TO(g, 0.047, 0.0015, C.silver(), 0, 0.012, 0, PI / 2, 0, 0, TAU, 48);
  // garras de plata
  const yc = 0.075;
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + 0.3, cx = Math.cos(a), cz = Math.sin(a);
    SW(g, [[cx * 0.008, 0.03, cz * 0.008], [cx * 0.024, 0.036, cz * 0.024], [cx * 0.038, 0.05, cz * 0.038], [cx * 0.044, 0.068, cz * 0.042], [cx * 0.04, 0.08, cz * 0.037]], [0.0026, 0.0024, 0.002, 0.0016, 0.001], C.silver(), 8, 20);
  }
  lathe(g, [[0, 0.028], [0.012, 0.028], [0.008, 0.034], [0, 0.034]], C.silver(), 0, 0, 0, 0, 0, 0, 24);
  // gota de ámbar pulida (pera irregular)
  const ag = new THREE.SphereGeometry(1, 64, 48);
  const ap = ag.attributes.position;
  for (let i = 0; i < ap.count; i++) {
    let x = ap.getX(i), y = ap.getY(i), z = ap.getZ(i);
    const k = 1 + N(x * 1.3, y * 1.3, z * 1.3, 1) * 0.16;
    const pear = 1 - 0.25 * y;
    ap.setXYZ(i, x * 0.042 * k * pear, y * 0.036 * k, z * 0.033 * k * pear);
  }
  ag.computeVertexNormals();
  const amber = new THREE.MeshPhysicalMaterial({ color: 0xe08a18, emissive: 0x7a3200, emissiveIntensity: 0.45, roughness: 0.04, transparent: true, opacity: 0.5, clearcoat: 1, clearcoatRoughness: 0.05, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 1.2 });
  const am = add(g, ag, amber, 0, yc, 0, 0.2, 0.4, 0.1); am.renderOrder = 3; am.castShadow = false;
  // núcleo más oscuro (inclusiones)
  const core = add(g, new THREE.SphereGeometry(0.024, 24, 16), new THREE.MeshStandardMaterial({ color: 0xb05a10, transparent: true, opacity: 0.25, depthWrite: false }), 0, yc - 0.004, 0);
  core.scale.set(1.3, 0.9, 1); core.renderOrder = 2;
  // mosquito
  const bug = grp(g, 0.002, yc + 0.002, 0.004, 0.15, 0.6, 0.1); bug.scale.setScalar(1.7);
  const chit = mat(0x1a0e06, { roughness: 0.35, env: true, envI: 0.5 });
  SW(bug, [[-0.004, 0, 0], [0.002, 0.0005, 0]], [0.0022, 0.002], chit, 10, 6); // tórax
  SW(bug, [[0.003, 0.0004, 0], [0.008, 0.0008, 0], [0.016, 0.0002, 0]], [0.0014, 0.0016, 0.0006], chit, 10, 10); // abdomen
  SP(bug, 0.0014, chit, -0.0055, 0.0004, 0, 1, 1, 1, 10); // cabeza
  SW(bug, [[-0.0068, 0.0002, 0], [-0.011, -0.001, 0], [-0.0145, -0.003, 0]], [0.0003, 0.00022, 0.0001], chit, 5, 8); // probóscide
  const legs = [];
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
    const x0 = -0.002 + k * 0.002;
    legs.push(tubeGeo([[x0, -0.001, s * 0.001], [x0 + (k - 1) * 0.006, 0.001, s * 0.008], [x0 + (k - 1) * 0.012, -0.004, s * 0.013], [x0 + (k - 1) * 0.016, -0.009, s * 0.015]], 0.00022, 16, 4));
    legs.push(tubeGeo([[-0.006, 0.0008, s * 0.0005], [-0.009, 0.004, s * 0.003], [-0.011, 0.0065, s * 0.004]], 0.00016, 8, 3)); // antenas
  }
  merged(bug, legs, chit);
  const wingTex = canvasTex('C_ala', 128, 64, (c, w, h) => {
    c.fillStyle = 'rgba(0,0,0,0)'; c.clearRect(0, 0, w, h);
    c.fillStyle = 'rgba(230,240,255,0.55)'; c.beginPath(); c.ellipse(w / 2, h / 2, w * 0.48, h * 0.4, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(60,40,20,0.7)'; c.lineWidth = 1.5; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(4, h / 2); c.quadraticCurveTo(w / 2, h * (0.2 + i * 0.15), w - 4, h / 2 + (i - 2) * 4); c.stroke(); }
  });
  for (const s of [-1, 1]) P(bug, 0.013, 0.0045, wingTex, 0.0065, 0.0022, s * 0.004, -PI / 2 + s * 0.25, 0, s * 0.35, { transparent: true, double: true, rough: 0.2 });
  // burbujas atrapadas
  const bub = [];
  const R = rng(5);
  for (let i = 0; i < 14; i++) bub.push(gx(new THREE.SphereGeometry(0.0006 + R() * 0.0012, 8, 6), (R() - 0.5) * 0.05, yc + (R() - 0.5) * 0.04, (R() - 0.5) * 0.035));
  const bm = merged(g, bub, mat(0xfff0d0, { transparent: true, opacity: 0.5, roughness: 0.1, depthWrite: false })); bm.renderOrder = 2;
  return g;
};

// ---------- Geoda catedral de amatista ----------
BUILDERS_C.geoda_amatista_catedral = () => {
  const g = new THREE.Group();
  const N = noise3(13);
  const A = 0.19, Hh = 0.3, Dz = 0.15, y0 = 0.33;
  const IA = 0.925, IH = 0.935;
  const bump = (x, y, z) => (1 + N(x * 2.6, y * 2.6, z * 2.6, 2) * 0.16) * (1 - y * 0.08);
  // cascarón exterior (mitad trasera del elipsoide)
  const shellGeo = (sx, sy, sz, amp) => {
    const geo = new THREE.SphereGeometry(1, 64, 48, PI, PI);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = bump(x, y, 0) + (amp ? N(x * 12 + 7, y * 12, z * 12) * amp : 0);
      p.setXYZ(i, x * sx * k, y * sy * k, z * sz * (amp ? 1 + N(x * 9, y * 9, z * 9 + 3) * 0.2 : 1));
    }
    geo.computeVertexNormals();
    return geo;
  };
  const basalt = mat(0xffffff, { map: stoneTex('geoda_ext', [110, 102, 92], { spots: 1400, veins: 2 }), roughness: 1 });
  add(g, shellGeo(A, Hh, Dz, 0.05), basalt, 0, y0, 0);
  // interior tapizado (fondo violeta)
  const inner = add(g, shellGeo(A * IA, Hh * IH, Dz * 0.82, 0), mat(0x3a1a58, { roughness: 0.5, side: THREE.BackSide }), 0, y0, 0);
  // canto con bandas de ágata (cara cortada)
  const agate = canvasTex('C_agata', 512, 512, (c, w, h) => {
    c.fillStyle = '#6e7078'; c.fillRect(0, 0, w, h);
    for (let r = w * 0.5; r > w * 0.4; r -= 1.5) { const k = Math.sin(r * 1.7) * 0.5 + Math.sin(r * 0.63) * 0.5; c.strokeStyle = `rgba(${150 + k * 60},${156 + k * 60},${170 + k * 50},0.9)`; c.lineWidth = 1.6; c.beginPath(); c.ellipse(w / 2, h / 2, r, r, 0, 0, TAU); c.stroke(); }
    c.fillStyle = 'rgba(40,40,50,0.5)'; c.beginPath(); c.arc(w / 2, h / 2, w * 0.5, 0, TAU); c.arc(w / 2, h / 2, w * 0.485, 0, TAU, true); c.fill();
  });
  const ring = new THREE.Shape(), hole = new THREE.Path();
  const M = 96;
  for (let i = 0; i <= M; i++) {
    const a = i / M * TAU, x = Math.cos(a), y = Math.sin(a), k = bump(x, y, 0);
    const P1 = [x * A * k, y * Hh * k], P2 = [x * A * IA * k, y * Hh * IH * k];
    if (i === 0) { ring.moveTo(...P1); hole.moveTo(...P2); } else { ring.lineTo(...P1); hole.lineTo(...P2); }
  }
  ring.holes.push(hole);
  const rg = new THREE.ShapeGeometry(ring, 1);
  // uv radial para las bandas
  const up = rg.attributes.position, uv = rg.attributes.uv;
  for (let i = 0; i < up.count; i++) { const x = up.getX(i) / A, y = up.getY(i) / Hh, a = Math.atan2(y, x), r = Math.hypot(x, y) / bump(Math.cos(a), Math.sin(a), 0); uv.setXY(i, 0.5 + Math.cos(a) * r * 0.5, 0.5 + Math.sin(a) * r * 0.5); }
  add(g, rg, mat(0xffffff, { map: agate, roughness: 0.25, env: true, envI: 0.6 }), 0, y0, 0.0005);
  // cristales (pirámides hexagonales) apuntando al centro
  const R = rng(31);
  const cA = [], cB = [], cQ = [];
  const up3 = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(), q = new THREE.Quaternion(), m4 = new THREE.Matrix4();
  for (let i = 0; i < 1100; i++) {
    const th = PI + R() * PI, ph = Math.acos(R() * 2 - 1);
    const x = Math.cos(th) * Math.sin(ph), y = Math.cos(ph), z = Math.sin(th) * Math.sin(ph);
    if (z > -0.08) continue;
    const k = bump(x, y, 0) * 0.99;
    const px = x * A * IA * k, py = y * Hh * IH * k, pz = z * Dz * 0.82;
    dir.set(-px * 0.8, -py * 0.5, -pz - 0.05).normalize();
    const edge = Math.hypot(x, y) * (1 - Math.max(0, z + 0.3) * 0);
    const L = (edge > 0.95 ? 0.006 : 0.012) + R() * 0.016, r = L * (0.38 + R() * 0.16);
    const cone = new THREE.ConeGeometry(r, L, 6, 1);
    cone.translate(0, L / 2 - L * 0.15, 0);
    q.setFromUnitVectors(up3, dir);
    m4.compose(new THREE.Vector3(px, py + y0, pz), q, new THREE.Vector3(1, 1, 1));
    cone.applyMatrix4(m4);
    (edge > 0.95 ? cQ : R() < 0.5 ? cA : cB).push(cone);
  }
  const amA = mat(0x7a3aa8, { roughness: 0.08, metalness: 0.1, env: true, envI: 1.4, transparent: true, opacity: 0.92, emissive: 0x2a0a40, emissiveIntensity: 0.4, flatShading: true });
  const amB = mat(0xa05ad0, { roughness: 0.06, metalness: 0.1, env: true, envI: 1.4, emissive: 0x3a1050, emissiveIntensity: 0.35, flatShading: true });
  const quartz = mat(0xe8e0f0, { roughness: 0.1, env: true, envI: 1.2, flatShading: true });
  merged(g, cA, amA); merged(g, cB, amB); merged(g, cQ, quartz);
  // soporte de hierro forjado
  const iron = mat(0x1c1a18, { metalness: 0.7, roughness: 0.45, env: true });
  RB(g, 0.34, 0.03, 0.24, 0.006, iron, 0, 0.015, -0.02);
  EXS(g, sp([[-0.13, 0], [0.13, 0], [0.1, 0.05], [0.04, 0.06], [-0.04, 0.06], [-0.1, 0.05]]), 0.02, iron, 0, 0.03, -0.1, 0, 0, 0, 0.004);
  for (const s of [-1, 1]) RB(g, 0.03, 0.02, 0.03, 0.006, iron, s * 0.15, 0.01, 0.08);
  return ground(g);
};

// ---------- Casco de F1 (1976) ----------
BUILDERS_C.casco_f1_1976 = () => {
  const g = new THREE.Group();
  const livery = canvasTex('C_f1_livery', 1024, 512, (c, w, h) => {
    // u: 0.25 = frente (+z); v: 0 = arriba
    c.fillStyle = '#f4f2ee'; c.fillRect(0, 0, w, h);
    // franja superior azul de adelante hacia atrás
    c.fillStyle = '#1a3a8a'; c.fillRect(w * 0.25 - w * 0.03, 0, w * 0.06, h * 0.36); c.fillRect(w * 0.75 - w * 0.03, 0, w * 0.06, h * 0.36);
    c.fillRect(0, 0, w, h * 0.06);
    // banda tricolor alrededor
    const yb = h * 0.365;
    c.fillStyle = '#c81e1e'; c.fillRect(0, yb, w, h * 0.05);
    c.fillStyle = '#111'; c.fillRect(0, yb + h * 0.05, w, h * 0.012);
    c.fillStyle = '#c81e1e'; c.fillRect(0, yb + h * 0.062, w, h * 0.03);
    // puerto de visión (negro)
    c.fillStyle = '#0c0c0c';
    c.beginPath(); c.moveTo(w * 0.25 - w * 0.12, h * 0.45); c.quadraticCurveTo(w * 0.25, h * 0.42, w * 0.25 + w * 0.12, h * 0.45); c.lineTo(w * 0.25 + w * 0.11, h * 0.6); c.quadraticCurveTo(w * 0.25, h * 0.63, w * 0.25 - w * 0.11, h * 0.6); c.closePath(); c.fill();
    // barbilla roja
    c.fillStyle = '#c81e1e'; c.fillRect(w * 0.25 - w * 0.14, h * 0.7, w * 0.28, h * 0.3);
    // número y leyendas ficticias
    c.fillStyle = '#111'; c.font = 'bold 70px Arial'; c.textAlign = 'center';
    c.fillText('11', w * 0.6, h * 0.58); c.fillText('11', w * 0.9, h * 0.58);
    c.font = 'bold 26px Arial'; c.fillStyle = '#c81e1e'; c.fillText('CAMPEÓN · 76', w * 0.75, h * 0.48);
    c.fillStyle = '#1a3a8a'; c.font = 'italic bold 28px Georgia'; c.fillText('Bodega Racing', w * 0.25, h * 0.78);
    // firma a mano
    c.strokeStyle = '#1a1a60'; c.lineWidth = 3; c.beginPath(); c.moveTo(w * 0.62, h * 0.26);
    for (let i = 0; i < 14; i++) c.quadraticCurveTo(w * (0.63 + i * 0.012), h * (0.2 + (i % 2) * 0.08), w * (0.635 + i * 0.012), h * 0.25);
    c.stroke();
  });
  const shellM = mat(0xffffff, { map: livery, roughness: 0.18, env: true, envI: 0.8 });
  const deform = (geo, k = 1) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x0 = p.getX(i), y0 = p.getY(i), z0 = p.getZ(i);
      const th = Math.acos(Math.max(-1, Math.min(1, y0))), ph = Math.atan2(z0, -x0);
      const t2 = th * (0.8 + 0.13 * Math.sin(ph));
      let x = -Math.cos(ph) * Math.sin(t2), y = Math.cos(t2), z = Math.sin(ph) * Math.sin(t2);
      if (y < -0.1 && z > 0) { const f = -y - 0.1; z += f * 0.35 * z; x *= 1 - f * 0.25; }
      if (y < 0) x *= 1 + y * 0.12;
      p.setXYZ(i, x * 0.126 * k, y * 0.148 * k + (y > 0 ? y * y * 0.004 : 0), z * 0.158 * k);
    }
    geo.computeVertexNormals();
    return geo;
  };
  const geo = deform(new THREE.SphereGeometry(1, 72, 48));
  const p = geo.attributes.position;
  const Hc = 0.305;
  add(g, geo, shellM, 0, Hc, 0);
  // interior acolchado
  const inGeo = geo.clone(); inGeo.scale(0.93, 0.95, 0.93);
  add(g, inGeo, mat(0xffffff, { map: velvetTex('acolch', '#262626'), roughness: 1, side: THREE.BackSide }), 0, Hc, 0);
  // ribete de goma en el borde inferior
  const ring = [];
  for (let j = 0; j < 72; j++) { const k = 48 * 73 + j; ring.push([p.getX(k), p.getY(k) + Hc, p.getZ(k)]); }
  TU(g, ring, 0.007, C.rubber(), true, 128);
  // visera ahumada (misma deformación, un poco más grande)
  const visM = new THREE.MeshPhysicalMaterial({ color: 0x3a3226, roughness: 0.03, metalness: 0.1, transparent: true, opacity: 0.55, clearcoat: 1, envMapIntensity: 1.5, side: THREE.DoubleSide, depthWrite: false });
  const vis = add(g, deform(new THREE.SphereGeometry(1, 48, 16, PI / 2 - 0.95, 1.9, PI * 0.43, PI * 0.2), 1.03), visM, 0, Hc, 0); vis.renderOrder = 2; vis.castShadow = false;
  // pivotes de la visera y lengüeta
  for (const s of [-1, 1]) { lathe(g, [[0, 0], [0.013, 0], [0.013, 0.004], [0.009, 0.007], [0, 0.007]], C.chrome(), s * 0.124, Hc - 0.035, 0.03, 0, 0, s * -PI / 2, 24); }
  // soporte: cuello torneado negro con aro cromado
  const blk = mat(0x141414, { roughness: 0.3, env: true, envI: 0.5 });
  lathe(g, smooth([[0, 0], [0.12, 0], [0.12, 0.012], [0.105, 0.022], [0.04, 0.03], [0, 0.032]], 30), blk, 0, 0, 0, 0, 0, 0, 56);
  lathe(g, [[0, 0.02], [0.016, 0.02], [0.012, 0.04], [0.011, 0.34], [0.03, 0.35], [0.07, 0.375], [0.085, 0.4], [0.07, 0.43], [0, 0.44]], C.chrome(), 0, 0, 0, 0, 0, 0, 40);
  TO(g, 0.112, 0.003, C.chrome(), 0, 0.014, 0, PI / 2, 0, 0, TAU, 64);
  plaque(g, 'TEMPORADA 1976', 'Casco de carrera', 0.07, 0.016, 0, 0.018, 0.098, -0.9, 0);
  return ground(g);
};

// ---------- Cohete de hojalata ----------
BUILDERS_C.cohete_hojalata_1958 = () => {
  const g = new THREE.Group();
  // litografía del fuselaje (u alrededor, v a lo largo)
  const litho = canvasTex('C_cohete', 1024, 1024, (c, w, h) => {
    c.fillStyle = '#e8e0c8'; c.fillRect(0, 0, w, h);
    // franjas rojas y bandas
    c.fillStyle = '#c22a22'; c.fillRect(0, h * 0.55, w, h * 0.45);
    c.fillStyle = '#1d3f8a'; c.fillRect(0, h * 0.52, w, h * 0.03); c.fillRect(0, h * 0.2, w, h * 0.025);
    c.fillStyle = '#e8c23a'; for (let i = 0; i < 24; i++) { c.beginPath(); c.moveTo(i * w / 24, h * 0.55); c.lineTo(i * w / 24 + w / 48, h * 0.62); c.lineTo(i * w / 24 + w / 24, h * 0.55); c.fill(); }
    // ojos de buey con astronautas
    for (let i = 0; i < 4; i++) {
      const x = (i + 0.5) * w / 4, y = h * 0.36;
      c.fillStyle = '#9a9a9a'; c.beginPath(); c.arc(x, y, 58, 0, TAU); c.fill();
      const gg = c.createRadialGradient(x - 15, y - 15, 5, x, y, 48); gg.addColorStop(0, '#9fd8ff'); gg.addColorStop(1, '#1b3a7a');
      c.fillStyle = gg; c.beginPath(); c.arc(x, y, 46, 0, TAU); c.fill();
      c.fillStyle = '#f2d2b0'; c.beginPath(); c.arc(x, y + 6, 18, 0, TAU); c.fill();
      c.fillStyle = '#222'; c.fillRect(x - 8, y + 2, 4, 4); c.fillRect(x + 4, y + 2, 4, 4);
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.arc(x, y + 6, 24, PI * 1.1, PI * 1.9); c.stroke();
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; c.fillStyle = '#555'; c.beginPath(); c.arc(x + Math.cos(a) * 52, y + Math.sin(a) * 52, 3, 0, TAU); c.fill(); }
    }
    c.fillStyle = '#1d3f8a'; c.font = 'bold 64px Arial'; c.textAlign = 'center';
    c.fillText('X-58  COHETE ESPACIAL', w * 0.5, h * 0.8);
    c.fillText('X-58  COHETE ESPACIAL', w * 1.0, h * 0.8); c.fillText('X-58  COHETE ESPACIAL', 0, h * 0.8);
    c.fillStyle = '#fff'; c.font = 'bold 40px Arial'; c.fillText('★  ★  ★  ★  ★  ★  ★  ★', w * 0.5, h * 0.92);
    // remaches en líneas
    c.fillStyle = 'rgba(80,60,40,0.6)'; for (const yy of [0.12, 0.5, 0.97]) for (let x = 0; x < w; x += 20) { c.beginPath(); c.arc(x, h * yy, 2.5, 0, TAU); c.fill(); }
    // desgaste de juguete
    const R = rng(8); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(90,70,50,${R() * 0.3})`; c.fillRect(R() * w, R() * h, 1 + R() * 3, 1); }
  });
  const tin = mat(0xffffff, { map: litho, roughness: 0.28, metalness: 0.35, env: true, envI: 0.8 });
  const red = mat(0xc22a22, { roughness: 0.3, metalness: 0.3, env: true, envI: 0.7 });
  const y0 = 0.085;
  // fuselaje: tobera, cuerpo y cono
  const prof = smooth([[0.028, 0], [0.045, 0.02], [0.052, 0.06], [0.054, 0.12], [0.052, 0.18], [0.046, 0.23], [0.034, 0.27], [0.018, 0.3], [0.004, 0.318], [0, 0.32]], 60);
  lathe(g, prof, tin, 0, y0, 0, 0, 0, 0, 56);
  lathe(g, [[0.016, 0.318], [0.004, 0.318], [0.0025, 0.34], [0, 0.345]], C.chrome(), 0, y0, 0, 0, 0, 0, 16);
  // tobera cromada
  lathe(g, smooth([[0.022, -0.028], [0.03, -0.024], [0.032, -0.015], [0.03, 0.002], [0.028, 0.004]], 16), C.chrome(), 0, y0, 0, 0, 0, 0, 36);
  lathe(g, [[0, -0.026], [0.02, -0.026], [0.02, -0.022], [0, -0.022]], emissive(0xff7a20, 1.2), 0, y0, 0, 0, 0, 0, 24);
  // aletas (tres) de lámina roja con filo cromado
  const fin = sp([[0, 0], [0.07, -0.05], [0.085, -0.075], [0.07, -0.078], [0.035, -0.04], [0, -0.01], [0, 0.1], [0.012, 0.09]]);
  const finPts = [[0.0, 0.1], [0.012, 0.09], [0.045, 0.02], [0.07, -0.05], [0.085, -0.075]];
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + PI / 2 + PI / 3;
    const f = grp(g, Math.cos(a) * 0.046, y0 + 0.04, Math.sin(a) * 0.046, 0, -a, 0);
    EXS(f, fin, 0.004, red, 0, 0, 0, 0, 0, 0, 0.0015);
    TU(f, finPts.map(([x, y]) => [x, y, 0]), 0.0022, C.chrome(), false, 24);
  }
  // cúpula de vidrio con piloto
  const yd = y0 + 0.205;
  const dome = new THREE.SphereGeometry(0.03, 32, 16, 0, TAU, 0, PI / 2);
  const dm = add(g, dome, glassD(0xcfe8ff, 0.3), 0.0, yd, 0.045, PI / 2 - 0.35, 0, 0); dm.renderOrder = 2;
  TO(g, 0.03, 0.003, C.chrome(), 0.0, yd, 0.045, -0.35, 0, 0, TAU, 40);
  const pil = grp(g, 0, yd, 0.045, -0.35, 0, 0);
  SP(pil, 0.013, mat(0xf0f0f0, { roughness: 0.3 }), 0, 0.0, 0.012);
  SP(pil, 0.009, mat(0xf2c8a0, { roughness: 0.6 }), 0, 0, 0.018, 1, 1, 0.8, 16);
  // llave de cuerda
  const key = new THREE.Shape(); key.absarc(-0.012, 0, 0.011, PI / 2, PI * 1.5, false); key.lineTo(0.012, -0.011); key.absarc(0.012, 0, 0.011, -PI / 2, PI / 2, false); key.closePath();
  key.holes.push(circ(0.005, -0.012, 0, true), circ(0.005, 0.012, 0, true));
  CY(g, 0.003, 0.003, 0.02, brass(), 0.063, y0 + 0.1, 0, 0, 0, PI / 2, 12);
  EXS(g, key, 0.003, brass(), 0.075, y0 + 0.1, 0, 0, PI / 2, 0, 0.001);
  // plataforma de lanzamiento de hojalata
  const pad = canvasTex('C_pad', 512, 512, (c, w, h) => {
    c.fillStyle = '#2a4a7a'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#e8c23a'; c.lineWidth = 10; c.strokeRect(20, 20, w - 40, h - 40);
    c.fillStyle = '#e8e0c8'; c.beginPath(); c.arc(w / 2, h / 2, 150, 0, TAU); c.fill();
    c.fillStyle = '#c22a22'; c.beginPath(); c.arc(w / 2, h / 2, 120, 0, TAU); c.fill();
    c.fillStyle = '#e8c23a'; c.font = 'bold 44px Arial'; c.textAlign = 'center';
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - PI / 2; c.fillText(String(10 - i), w / 2 + Math.cos(a) * 190, h / 2 + Math.sin(a) * 190 + 14); }
    c.font = 'bold 30px Arial'; c.fillStyle = '#fff'; c.fillText('BASE LUNAR', w / 2, h - 34);
  });
  const padM = mat(0xffffff, { map: pad, roughness: 0.3, metalness: 0.3, env: true, envI: 0.6 });
  RB(g, 0.2, 0.03, 0.2, 0.006, mat(0x2a4a7a, { roughness: 0.3, metalness: 0.3, env: true }), 0, 0.015, 0);
  P(g, 0.19, 0.19, pad, 0, 0.0305, 0, -PI / 2, 0, 0, { rough: 0.3 });
  // torres de sujeción
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + PI / 2;
    const x = Math.cos(a) * 0.07, z = Math.sin(a) * 0.07;
    EXS(g, poly([[-0.008, 0], [0.008, 0], [0.004, 0.05], [-0.004, 0.05]]), 0.004, C.chrome(), x, 0.03, z, 0, -a + PI / 2, 0, 0.001);
    TU(g, [[x, 0.075, z], [x * 0.75, 0.085, z * 0.75], [x * 0.62, 0.09, z * 0.62]], 0.002, C.chrome(), false, 8);
  }
  lathe(g, [[0, 0.03], [0.04, 0.03], [0.036, 0.04], [0.03, 0.058], [0, 0.058]], C.chrome(), 0, 0, 0, 0, 0, 0, 36);
  return g;
};

// ---------- Tintero imperial ----------
BUILDERS_C.tintero_imperial = () => {
  const g = new THREE.Group();
  const gl = metal(0xd8a844, 0.28);
  const eng = mat(0xffffff, { map: engraveTex('tint', '#caa048', 'rgba(80,50,10,0.55)', { w: 512, h: 128 }), metalness: 1, roughness: 0.3 });
  const W = 0.3, D = 0.17, y0 = 0.028;
  // bandeja con extremos curvos
  const tray = sp([[-W / 2, -D / 2 + 0.02], [-W / 2 + 0.02, -D / 2], [0, -D / 2 - 0.006], [W / 2 - 0.02, -D / 2], [W / 2, -D / 2 + 0.02], [W / 2 + 0.006, 0], [W / 2, D / 2 - 0.02], [W / 2 - 0.02, D / 2], [0, D / 2 + 0.006], [-W / 2 + 0.02, D / 2], [-W / 2, D / 2 - 0.02], [-W / 2 - 0.006, 0]]);
  EXS(g, tray, 0.012, [mat(0xffffff, { map: rep(engraveTex('tint', '#caa048', 'rgba(80,50,10,0.55)', { w: 512, h: 128 }), 4, 8), metalness: 1, roughness: 0.3 }), gl], 0, y0, 0, -PI / 2, 0, 0, 0.004);
  // hundido interior de cuero verde
  EXS(g, rrect(W - 0.05, D - 0.05, 0.015), 0.002, C.leather(0x1e4a2a), 0, y0 + 0.0075, 0, -PI / 2, 0, 0, 0.001);
  // borde de perlas (merge)
  const pearls = [];
  const edgeCurve = tray.getSpacedPoints(90);
  edgeCurve.forEach(v => pearls.push(gx(new THREE.SphereGeometry(0.0028, 8, 6), v.x, y0 + 0.01, -v.y)));
  merged(g, pearls, gl);
  // patas de garra de león
  const paw = [];
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = sx * (W / 2 - 0.025), z = sz * (D / 2 - 0.02);
    paw.push(gx(latheGeo(smooth([[0, 0.03], [0.012, 0.028], [0.016, 0.02], [0.014, 0.012], [0.018, 0.005], [0.016, 0], [0, 0]], 16), 20), x, 0, z));
    for (let k = -1; k <= 1; k++) paw.push(gx(new THREE.SphereGeometry(0.0065, 10, 8), x + Math.sin(k * 0.6 + (sx > 0 ? 0 : 0)) * 0.012 * 1, 0.005, z + Math.cos(k * 0.6) * 0.012 * sz, 0, 0, 0, [1, 0.8, 1.3]));
  }
  merged(g, paw, gl);
  // tinteros de cristal tallado (facetas)
  const crystal = mat(0xe8f4ff, { transparent: true, opacity: 0.45, roughness: 0.02, metalness: 0.2, env: true, envI: 1.6, flatShading: true, depthWrite: false });
  const inkM = mat(0x0a0a18, { roughness: 0.1 });
  for (const s of [-1, 1]) {
    const x = s * 0.085, yb = y0 + 0.012;
    const cr = lathe(g, [[0, 0], [0.028, 0], [0.034, 0.008], [0.036, 0.03], [0.03, 0.045], [0.018, 0.05], [0.016, 0.052]], crystal, x, yb, 0, 0, PI / 12, 0, 12); cr.renderOrder = 2;
    lathe(g, [[0, 0.002], [0.026, 0.002], [0.028, 0.02], [0, 0.02]], inkM, x, yb, 0, 0, 0, 0, 16);
    // collar y tapa abovedada con bellota
    lathe(g, [[0.016, 0.05], [0.021, 0.05], [0.022, 0.056], [0.018, 0.058]], gl, x, yb, 0, 0, 0, 0, 24);
    const lid = grp(g, x, yb + 0.058, 0);
    lathe(lid, smooth([[0, 0.022], [0.006, 0.02], [0.004, 0.016], [0.012, 0.012], [0.02, 0.006], [0.023, 0.001], [0.022, 0]], 20), eng, 0, 0, 0, 0, 0, 0, 32);
    lathe(lid, smooth([[0, 0.02], [0.004, 0.022], [0.005, 0.028], [0.002, 0.034], [0, 0.036]], 12), gl, 0, 0, 0, 0, 0, 0, 16);
  }
  // salvadera central (arenero)
  lathe(g, smooth([[0, 0], [0.022, 0], [0.024, 0.006], [0.018, 0.02], [0.016, 0.04], [0.02, 0.05], [0.02, 0.054], [0, 0.056]], 30), eng, 0, y0 + 0.012, 0.01, 0, 0, 0, 36);
  const holes = []; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; holes.push(gx(new THREE.CircleGeometry(0.0015, 8), Math.cos(a) * 0.012, y0 + 0.0685, 0.01 + Math.sin(a) * 0.012, -PI / 2)); }
  merged(g, holes, mat(0x1a1208));
  // cresta posterior calada: corona de laurel con medallón
  const crest = new THREE.Shape();
  crest.moveTo(-0.12, 0); crest.lineTo(0.12, 0); crest.quadraticCurveTo(0.12, 0.03, 0.08, 0.04); crest.quadraticCurveTo(0.04, 0.05, 0.035, 0.09); crest.lineTo(-0.035, 0.09); crest.quadraticCurveTo(-0.04, 0.05, -0.08, 0.04); crest.quadraticCurveTo(-0.12, 0.03, -0.12, 0); crest.closePath();
  for (let i = 0; i < 5; i++) crest.holes.push(spPath([[-0.105 + i * 0.012, 0.012], [-0.098 + i * 0.012, 0.02], [-0.1 + i * 0.012, 0.03], [-0.106 + i * 0.012, 0.02]]), spPath([[0.105 - i * 0.012, 0.012], [0.098 - i * 0.012, 0.02], [0.1 - i * 0.012, 0.03], [0.106 - i * 0.012, 0.02]]));
  EXS(g, crest, 0.006, gl, 0, y0 + 0.012, -D / 2 + 0.018, 0, 0, 0, 0.0015);
  // medallón con monograma
  const mono = canvasTex('C_mono', 256, 256, (c, w, h) => {
    c.fillStyle = '#d8a844'; c.fillRect(0, 0, w, h);
    const gg = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gg.addColorStop(0, '#f0c860'); gg.addColorStop(1, '#8a6420'); c.fillStyle = gg; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#5a3c10'; c.lineWidth = 6; c.beginPath(); c.arc(w / 2, h / 2, w * 0.44, 0, TAU); c.stroke();
    c.fillStyle = '#4a300a'; c.font = 'bold 150px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', w / 2, h / 2 + 8);
    c.strokeStyle = '#4a300a'; c.lineWidth = 3; for (let i = 0; i < 9; i++) { const a = PI * 0.65 + i * 0.2; c.beginPath(); c.ellipse(w / 2 + Math.cos(a) * 100, h / 2 + Math.sin(a) * 100, 12, 5, a + 1.2, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(w / 2 - Math.cos(a) * 100, h / 2 + Math.sin(a) * 100, 12, 5, -a - 1.2, 0, TAU); c.stroke(); }
  });
  lathe(g, [[0, 0], [0.03, 0], [0.032, 0.004], [0.03, 0.007], [0, 0.007]], gl, 0, y0 + 0.012 + 0.085, -D / 2 + 0.018, PI / 2, 0, 0, 40);
  circleDecal(g, 0.027, mono, 0, y0 + 0.097, -D / 2 + 0.018 + 0.0075, 0, 0, 0, { metalness: 0.9, roughness: 0.3 });
  // pluma de ganso sobre su apoyo
  const quillTex = canvasTex('C_pluma', 64, 512, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    for (let y = 30; y < h - 10; y += 2) {
      const t = y / h, half = Math.sin(Math.min(1, t * 1.3) * PI) * w * 0.46 + 2;
      c.strokeStyle = `rgba(${240 - t * 30},${236 - t * 40},${226 - t * 50},0.95)`; c.lineWidth = 1.6;
      c.beginPath(); c.moveTo(w / 2, y); c.lineTo(w / 2 - half, y - 10); c.moveTo(w / 2, y); c.lineTo(w / 2 + half, y - 10); c.stroke();
    }
    c.strokeStyle = '#d8d0b8'; c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke();
  });
  const qg = new THREE.PlaneGeometry(0.045, 0.28, 1, 16);
  const qp = qg.attributes.position; for (let i = 0; i < qp.count; i++) { const y = qp.getY(i); qp.setZ(i, Math.pow((y + 0.14) / 0.28, 2) * -0.03 + Math.abs(qp.getX(i)) * 0.2); }
  qg.computeVertexNormals();
  const q = add(g, qg, mat(0xffffff, { map: quillTex, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, roughness: 0.8 }), 0, 0, 0, -PI / 2, 0, PI / 2);
  q.removeFromParent(); const qgp = grp(g, 0.01, y0 + 0.036, 0.058, 0, 0.12, 0.05); qgp.add(q);
  // soporte de pluma
  for (const x of [-0.07, 0.07]) EXS(g, poly([[-0.006, 0], [0.006, 0], [0.006, 0.02], [0.002, 0.024], [0, 0.018], [-0.002, 0.024], [-0.006, 0.02]]), 0.004, gl, x * 0.9, y0 + 0.012, 0.055, 0, 0, 0, 0.001);
  return ground(g);
};

// ---------- Molinillo de café otomano con cezve ----------
BUILDERS_C.molinillo_otomano = () => {
  const g = new THREE.Group();
  const engTex = canvasTex('C_otomano', 512, 1024, (c, w, h) => {
    c.fillStyle = '#e8c068'; c.fillRect(0, 0, w, h);
    const R = rng(4);
    for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,240,200,${R() * 0.06})`; c.fillRect(0, R() * h, w, 1); }
    c.strokeStyle = 'rgba(70,40,5,0.65)'; c.lineWidth = 2;
    // bandas con arabescos y medallones
    for (let b = 0; b < 5; b++) {
      const y0 = b * h / 5;
      c.lineWidth = 3; c.beginPath(); c.moveTo(0, y0 + 6); c.lineTo(w, y0 + 6); c.stroke();
      c.lineWidth = 1.6;
      for (let k = 0; k < 4; k++) {
        const x = (k + 0.5) * w / 4, y = y0 + h / 10;
        c.beginPath(); c.moveTo(x, y - 70); c.bezierCurveTo(x + 50, y - 40, x + 50, y + 40, x, y + 70); c.bezierCurveTo(x - 50, y + 40, x - 50, y - 40, x, y - 70); c.stroke();
        c.beginPath(); c.moveTo(x, y - 45); c.bezierCurveTo(x + 28, y - 20, x + 28, y + 20, x, y + 45); c.bezierCurveTo(x - 28, y + 20, x - 28, y - 20, x, y - 45); c.stroke();
        for (let a = 0; a < 8; a++) { const t = a / 8 * TAU; c.beginPath(); c.ellipse(x + Math.cos(t) * 14, y + Math.sin(t) * 14, 7, 3, t, 0, TAU); c.stroke(); }
        c.beginPath(); c.moveTo(x + w / 8, y0 + 14); c.quadraticCurveTo(x + w / 8 + 20, y, x + w / 8, y0 + h / 5 - 10); c.stroke();
      }
    }
    for (let i = 0; i < 2500; i++) { c.fillStyle = 'rgba(60,35,5,0.5)'; c.fillRect(R() * w, R() * h, 1, 1); }
  }, true);
  const eng = mat(0xffffff, { map: engTex, metalness: 1, roughness: 0.22 });
  const br = metal(0xd0a048, 0.25);
  // charola redonda de cobre martillado
  const hammer = canvasTex('C_martillado', 256, 256, (c, w, h) => { c.fillStyle = '#b8663a'; c.fillRect(0, 0, w, h); const R = rng(9); for (let i = 0; i < 400; i++) { const x = R() * w, y = R() * h, r = 4 + R() * 7; const gg = c.createRadialGradient(x - 2, y - 2, 0, x, y, r); gg.addColorStop(0, 'rgba(255,210,170,0.35)'); gg.addColorStop(1, 'rgba(60,20,0,0.2)'); c.fillStyle = gg; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }, true);
  lathe(g, [[0, 0.004], [0.14, 0.004], [0.15, 0.008], [0.155, 0.016], [0.152, 0.018], [0.145, 0.01], [0.13, 0.008], [0, 0.008]], mat(0xffffff, { map: hammer, metalness: 1, roughness: 0.35 }), 0, 0, 0, 0, 0, 0, 72);
  lathe(g, [[0, 0], [0.1, 0], [0.1, 0.004], [0, 0.004]], metal(0x8a4a2a, 0.4), 0, 0, 0, 0, 0, 0, 48);
  // cuerpo del molinillo
  const mx = -0.05, y0 = 0.008;
  lathe(g, [[0, 0], [0.027, 0], [0.028, 0.004], [0.028, 0.07], [0.029, 0.072], [0.029, 0.078], [0.028, 0.08], [0.028, 0.2], [0.0295, 0.203], [0.0295, 0.21], [0.026, 0.212], [0, 0.212]], eng, mx, y0, 0, 0, 0, 0, 48);
  // tapa abombada y eje
  lathe(g, smooth([[0.026, 0.212], [0.024, 0.218], [0.016, 0.226], [0.008, 0.23], [0.005, 0.232]], 16), br, mx, y0, 0, 0, 0, 0, 36);
  CY(g, 0.0025, 0.0025, 0.03, C.steel(), mx, y0 + 0.24, 0, 0, 0, 0, 10);
  // manivela plegable
  const crank = grp(g, mx, y0 + 0.25, 0, 0, 0.6, 0);
  lathe(crank, [[0, -0.004], [0.007, -0.004], [0.007, 0.004], [0, 0.004]], br, 0, 0, 0, 0, 0, 0, 16);
  crank.add(new THREE.Mesh(swGeo([[0, 0.002, 0], [0.04, 0.006, 0], [0.075, 0.004, 0], [0.09, -0.004, 0]], [0.004, 0.0032, 0.003, 0.003], 8, 20, 0.5), br));
  lathe(crank, smooth([[0, 0], [0.006, 0.002], [0.008, 0.012], [0.007, 0.024], [0.004, 0.03], [0, 0.031]], 16), C.darkWood(), 0.09, -0.034, 0, 0, 0, 0, 20);
  CY(crank, 0.002, 0.002, 0.03, br, 0.09, -0.02, 0, 0, 0, 0, 8);
  // cezve (olla de café) de cobre con mango de latón
  const cz = grp(g, 0.06, 0.008, 0.02, 0, -0.5, 0);
  lathe(cz, smooth([[0, 0], [0.036, 0], [0.038, 0.01], [0.034, 0.04], [0.028, 0.06], [0.03, 0.07], [0.034, 0.074]], 30), mat(0xffffff, { map: hammer, metalness: 1, roughness: 0.3, side: THREE.DoubleSide }), 0, 0, 0, 0, 0, 0, 44);
  add(cz, new THREE.CircleGeometry(0.029, 32), mat(0x2a1206, { roughness: 0.15 }), 0, 0.058, 0, -PI / 2);
  cz.add(new THREE.Mesh(swGeo([[0.03, 0.06, 0], [0.07, 0.075, 0], [0.12, 0.085, 0], [0.16, 0.09, 0]], [0.004, 0.0035, 0.0035, 0.004], 8, 20, 0.5), br));
  lathe(cz, smooth([[0, 0], [0.006, 0.004], [0.007, 0.02], [0.005, 0.03], [0, 0.034]], 12), C.darkWood(), 0.162, 0.09, 0, 0, 0, -PI / 2 + 0.1, 16);
  // tacita (fincan) con portavasos (zarf) calado
  const cup = grp(g, 0.05, 0.008, -0.07);
  lathe(cup, smooth([[0, 0], [0.018, 0], [0.02, 0.006], [0.024, 0.03], [0.026, 0.045], [0.022, 0.047]], 20), eng, 0, 0, 0, 0, 0, 0, 36);
  lathe(cup, smooth([[0.018, 0.02], [0.021, 0.028], [0.022, 0.04], [0.021, 0.056], [0.019, 0.056]], 12), C.porcelain(0xf4f0e8), 0, 0, 0, 0, 0, 0, 36);
  add(cup, new THREE.CircleGeometry(0.0205, 24), mat(0x2a1206, { roughness: 0.15 }), 0, 0.052, 0, -PI / 2);
  return g;
};

// ---------- Linterna mágica ----------
BUILDERS_C.linterna_magica = () => {
  const g = new THREE.Group();
  const japan = canvasTex('C_japan', 512, 512, (c, w, h) => {
    c.fillStyle = '#1a1614'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#c9a24e'; c.lineWidth = 3; c.strokeRect(24, 24, w - 48, h - 48); c.lineWidth = 1.2; c.strokeRect(34, 34, w - 68, h - 68);
    c.lineWidth = 2; for (const [x, y] of [[34, 34], [w - 34, 34], [34, h - 34], [w - 34, h - 34]]) { c.beginPath(); c.arc(x, y, 18, 0, TAU); c.stroke(); }
    c.beginPath(); c.moveTo(w / 2, h * 0.2); c.bezierCurveTo(w * 0.8, h * 0.3, w * 0.8, h * 0.7, w / 2, h * 0.8); c.bezierCurveTo(w * 0.2, h * 0.7, w * 0.2, h * 0.3, w / 2, h * 0.2); c.stroke();
    c.fillStyle = '#c9a24e'; c.font = 'italic 34px Georgia'; c.textAlign = 'center'; c.fillText('Phantasmagoria', w / 2, h / 2 + 10);
    const R = rng(12); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.04})`; c.fillRect(R() * w, R() * h, 2, 2); }
  });
  const body = mat(0xffffff, { map: japan, roughness: 0.3, metalness: 0.4, env: true, envI: 0.6 });
  const bodyP = mat(0x1a1614, { roughness: 0.3, metalness: 0.4, env: true, envI: 0.6 });
  const br = brass();
  const y0 = 0.05;
  // base de caoba con patas de bola
  const mah = woodM('caoba_lint', '#6a2e14', { rx: 3, ry: 3 });
  EXS(g, rrect(0.24, 0.2, 0.012), 0.018, mah, 0, 0.03, 0, -PI / 2, 0, 0, 0.004);
  const feet = []; for (const [x, z] of [[-0.1, -0.08], [0.1, -0.08], [-0.1, 0.08], [0.1, 0.08]]) feet.push(gx(latheGeo(smooth([[0, 0], [0.012, 0.002], [0.014, 0.01], [0.01, 0.02], [0.006, 0.022], [0, 0.022]], 12), 16), x, 0, z));
  merged(g, feet, br);
  // cuerpo (caja con esquinas redondeadas)
  const bx = 0.16, by = 0.15, bz = 0.14;
  RB(g, bx, by, bz, 0.01, [bodyP, bodyP, bodyP, bodyP, body, body], 0, y0 + by / 2 + 0.005, 0);
  // puerta lateral con ventanita roja
  RB(g, 0.004, 0.08, 0.09, 0.003, br, bx / 2 + 0.002, y0 + 0.08, 0);
  circleDecal(g, 0.018, canvasTex('C_rubi', 64, 64, (c, w, h) => { const gg = c.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gg.addColorStop(0, '#ffb070'); gg.addColorStop(1, '#8a1010'); c.fillStyle = gg; c.fillRect(0, 0, w, h); }), bx / 2 + 0.0045, y0 + 0.085, 0, 0, PI / 2, 0, { emissive: 0xff4020, emissiveIntensity: 0.6 });
  TO(g, 0.019, 0.002, br, bx / 2 + 0.0045, y0 + 0.085, 0, 0, PI / 2, 0, TAU, 32);
  // chimenea con respiraderos y capuchón
  const yc = y0 + by + 0.005;
  lathe(g, [[0.03, 0], [0.034, 0], [0.034, 0.006], [0.026, 0.01], [0.022, 0.1], [0.024, 0.104], [0.022, 0.108]], bodyP, 0, yc, -0.01, 0, 0, 0, 32);
  const cap = smooth([[0, 0.14], [0.012, 0.138], [0.03, 0.128], [0.044, 0.118], [0.046, 0.114], [0.03, 0.112], [0.024, 0.108]], 20);
  lathe(g, cap, mat(0x1a1614, { roughness: 0.3, metalness: 0.4, side: THREE.DoubleSide }), 0, yc, -0.01, 0, 0, 0, 36);
  lathe(g, [[0, 0.14], [0.006, 0.14], [0.004, 0.152], [0, 0.156]], br, 0, yc, -0.01, 0, 0, 0, 16);
  const vents = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; vents.push(gx(new THREE.PlaneGeometry(0.006, 0.02), Math.cos(a) * 0.0232, yc + 0.07, -0.01 + Math.sin(a) * 0.0232, 0, -a + PI / 2, 0)); }
  merged(g, vents, emissive(0xffa040, 1.4));
  // bandas de latón
  for (const y of [y0 + 0.02, y0 + by - 0.01]) RB(g, bx + 0.004, 0.008, bz + 0.004, 0.004, br, 0, y, 0);
  // escenario del portaplacas y placa de vidrio pintada
  const zf = bz / 2;
  RB(g, 0.2, 0.09, 0.014, 0.004, br, 0, y0 + 0.08, zf + 0.012);
  const slideTex = canvasTex('C_placa_linterna', 512, 128, (c, w, h) => {
    c.fillStyle = '#5a3a1e'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      const x = 90 + i * 166, y = h / 2;
      const gg = c.createRadialGradient(x, y, 5, x, y, 50); gg.addColorStop(0, '#fef2c0'); gg.addColorStop(1, ['#3a7ac8', '#c83a3a', '#3a9a5a'][i]);
      c.fillStyle = gg; c.beginPath(); c.arc(x, y, 50, 0, TAU); c.fill();
      c.fillStyle = '#1a1a1a'; c.beginPath(); c.arc(x - 8, y + 5, 16, 0, TAU); c.fill(); c.fillRect(x - 30, y + 20, 50, 8);
      c.fillStyle = '#f8e080'; c.beginPath(); c.arc(x + 20, y - 22, 9, 0, TAU); c.fill();
    }
  });
  RB(g, 0.34, 0.07, 0.006, 0.002, C.wood(0x8a5a2a), 0.04, y0 + 0.08, zf + 0.022);
  P(g, 0.32, 0.06, slideTex, 0.04, y0 + 0.08, zf + 0.0255);
  // tubo del objetivo telescópico
  const lz = zf + 0.026;
  lathe(g, [[0.04, 0], [0.042, 0], [0.042, 0.012], [0.036, 0.016], [0.036, 0.07], [0.038, 0.072], [0.038, 0.08], [0.032, 0.082], [0.032, 0.14], [0.035, 0.142], [0.035, 0.152], [0.028, 0.152]], br, 0, y0 + 0.08, lz, PI / 2, 0, 0, 40);
  lathe(g, [[0, 0.146], [0.029, 0.146], [0, 0.146]], glass(0xcfe6ff, 0.5), 0, y0 + 0.08, lz, PI / 2, 0, 0, 32);
  // perilla de enfoque
  CY(g, 0.004, 0.004, 0.02, br, 0, y0 + 0.123, lz + 0.1, 0, 0, 0, 10);
  lathe(g, [[0, 0], [0.01, 0], [0.01, 0.008], [0, 0.008]], br, 0, y0 + 0.13, lz + 0.1, 0, 0, 0, 16);
  // caja de placas de repuesto
  const box = grp(g, -0.19, 0, 0.02, 0, 0.3, 0);
  RB(box, 0.09, 0.06, 0.14, 0.004, C.wood(0x6a4020), 0, 0.03, 0);
  for (let i = 0; i < 6; i++) RB(box, 0.086, 0.07, 0.005, 0.001, C.wood(0x8a5a2a), 0, 0.045 + (i % 2) * 0.003, -0.055 + i * 0.022, -0.05);
  return ground(g);
};

// ---------- Cámara de daguerrotipo (cajas deslizantes) ----------
BUILDERS_C.camara_daguerrotipo = () => {
  const g = new THREE.Group();
  const walnut = woodM('nogal_dag', '#7a4a22', { rx: 3, ry: 3, rough: 0.5 });
  const walnutL = woodM('nogal_dag2', '#8a5a2c', { rx: 3, ry: 3, rough: 0.5 });
  const br = brass();
  // mesa-soporte con cajón
  const stand = woodM('caoba_mesa', '#4a2412', { rx: 2, ry: 2, rough: 0.35 });
  RB(g, 0.34, 0.03, 0.52, 0.006, stand, 0, 0.1, -0.04);
  const legs = []; for (const [x, z] of [[-0.14, -0.27], [0.14, -0.27], [-0.14, 0.19], [0.14, 0.19]]) legs.push(gx(latheGeo(smooth([[0.012, 0], [0.016, 0.01], [0.012, 0.03], [0.018, 0.05], [0.013, 0.07], [0.016, 0.085], [0.02, 0.088]], 24), 16), x, 0, z));
  merged(g, legs, stand);
  RB(g, 0.3, 0.03, 0.48, 0.004, stand, 0, 0.074, -0.04);
  CY(g, 0.006, 0.006, 0.008, br, 0, 0.074, 0.202, PI / 2, 0, 0, 12);
  const y0 = 0.115;
  // caja delantera (más grande) con tablero del objetivo
  const L1 = 0.26, L2 = 0.24, Wc = 0.27, Hc = 0.29;
  RB(g, Wc, Hc, L1, 0.004, walnut, 0, y0 + Hc / 2, 0.05);
  // caja trasera que entra en la delantera
  RB(g, Wc - 0.02, Hc - 0.02, L2, 0.004, walnutL, 0, y0 + Hc / 2, 0.05 - L1 / 2 - L2 / 2 + 0.06);
  // cantoneras de latón
  const corners = [];
  for (const sx of [-1, 1]) for (const sy of [0, 1]) for (const sz of [-1, 1]) {
    corners.push(gx(new THREE.BoxGeometry(0.03, 0.03, 0.03), sx * (Wc / 2 - 0.013), y0 + (sy ? Hc - 0.013 : 0.013), 0.05 + sz * (L1 / 2 - 0.013)));
  }
  merged(g, corners, br);
  // objetivo de latón con parasol
  const zf = 0.05 + L1 / 2;
  lathe(g, [[0.055, 0], [0.058, 0.004], [0.058, 0.01], [0.05, 0.012], [0.048, 0.03], [0.046, 0.06], [0.05, 0.064], [0.05, 0.075], [0.044, 0.08], [0.044, 0.1], [0.047, 0.104], [0.047, 0.11], [0.041, 0.11]], mat(0xffffff, { map: engraveTex('dag_obj', '#c8a050', 'rgba(70,45,10,0.45)', { density: 0.5 }), metalness: 1, roughness: 0.3, side: THREE.DoubleSide }), 0, y0 + Hc / 2, zf, PI / 2, 0, 0, 48);
  lathe(g, smooth([[0, 0.1], [0.02, 0.098], [0.04, 0.094]], 8), mat(0x2a3848, { roughness: 0.02, metalness: 0.5, env: true, envI: 1.5 }), 0, y0 + Hc / 2, zf, PI / 2, 0, 0, 32);
  // tapa del objetivo colgando de cadena
  CY(g, 0.044, 0.044, 0.012, br, 0.08, y0 + 0.06, zf + 0.006, PI / 2, 0, 0.3, 32);
  TU(g, [[0.04, y0 + 0.13, zf + 0.004], [0.07, y0 + 0.09, zf + 0.008], [0.08, y0 + 0.08, zf + 0.008]], 0.0012, br, false, 12);
  // etiqueta de certificado en el costado
  const lab = parchmentTex('dag_label', { w: 512, h: 384, draw: (c, w, h) => {
    c.strokeStyle = '#3a2410'; c.lineWidth = 6; c.strokeRect(14, 14, w - 28, h - 28); c.lineWidth = 2; c.strokeRect(26, 26, w - 52, h - 52);
    c.fillStyle = '#2a1a08'; c.textAlign = 'center';
    c.font = 'italic bold 44px Georgia'; c.fillText('Le Daguerréotype', w / 2, 90);
    c.font = '24px Georgia'; c.fillText('Nul appareil n’est garanti', w / 2, 140); c.fillText('s’il ne porte la signature de', w / 2, 172); c.fillText('M. Daguerre et le cachet', w / 2, 204);
    c.font = 'italic 40px Georgia'; c.fillText('L. J. M. Daguerre', w / 2, 270);
    c.fillStyle = '#8a1a1a'; c.beginPath(); c.arc(w * 0.78, 320, 30, 0, TAU); c.fill();
    c.fillStyle = '#e0b0a0'; c.font = 'bold 20px Georgia'; c.fillText('LD', w * 0.78, 327);
  } });
  P(g, 0.14, 0.105, lab, Wc / 2 + 0.0015, y0 + Hc * 0.55, 0.05, 0, PI / 2, 0, { rough: 0.9 });
  // vidrio esmerilado trasero con marco y tapa abierta
  const zb = 0.05 - L1 / 2 - L2 + 0.06;
  RB(g, Wc - 0.04, Hc - 0.04, 0.012, 0.003, walnut, 0, y0 + Hc / 2, zb - 0.002);
  P(g, Wc - 0.07, Hc - 0.07, canvasTex('C_esmerilado', 256, 256, (c, w, h) => {
    c.fillStyle = '#b8b8b0'; c.fillRect(0, 0, w, h);
    // imagen invertida tenue en el vidrio
    c.fillStyle = 'rgba(60,50,40,0.35)'; c.beginPath(); c.ellipse(w / 2, h * 0.62, 36, 46, 0, 0, TAU); c.fill(); c.fillRect(w / 2 - 70, h * 0.05, 140, h * 0.4);
    const R = rng(3); for (let i = 0; i < 3000; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.2})`; c.fillRect(R() * w, R() * h, 1, 1); }
  }), 0, y0 + Hc / 2, zb - 0.0085, 0, PI, 0, { rough: 0.95 });
  // pomo trasero para deslizar
  lathe(g, smooth([[0, 0], [0.012, 0.002], [0.01, 0.012], [0.014, 0.022], [0, 0.026]], 12), br, 0, y0 + Hc - 0.035, zb - 0.008, -PI / 2, 0, 0, 16);
  // daguerrotipo en estuche de piel abierto
  const cs = grp(g, -0.24, 0, 0.26, 0, 0.5, 0);
  const lea = C.leather(0x3a1a10);
  RB(cs, 0.1, 0.012, 0.085, 0.004, lea, 0, 0.006, 0);
  const lid = grp(cs, 0, 0.012, -0.0425, -1.9, 0, 0);
  RB(lid, 0.1, 0.01, 0.085, 0.004, lea, 0, 0.005, 0.0425);
  P(lid, 0.088, 0.073, velvetTex('rojo_dag', '#7a1020'), 0, -0.0005, 0.0425, PI / 2, 0, 0, { rough: 1 });
  const plateTex = canvasTex('C_dag_plate', 256, 320, (c, w, h) => {
    const gg = c.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.7); gg.addColorStop(0, '#d8d4c8'); gg.addColorStop(0.7, '#8a8478'); gg.addColorStop(1, '#3a3228');
    c.fillStyle = gg; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(40,32,24,0.85)'; c.beginPath(); c.ellipse(w / 2, h * 0.95, w * 0.36, h * 0.35, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(200,190,170,0.95)'; c.beginPath(); c.ellipse(w / 2, h * 0.42, w * 0.15, h * 0.17, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(40,32,24,0.9)'; c.beginPath(); c.ellipse(w / 2, h * 0.32, w * 0.17, h * 0.1, 0, PI, 0); c.fill();
    c.fillStyle = 'rgba(40,32,24,0.7)'; c.fillRect(w * 0.43, h * 0.4, w * 0.04, h * 0.012); c.fillRect(w * 0.53, h * 0.4, w * 0.04, h * 0.012);
    const e = c.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.6); e.addColorStop(0, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(90,60,120,0.5)'); c.fillStyle = e; c.fillRect(0, 0, w, h);
  });
  const pm = add(cs, new THREE.PlaneGeometry(0.066, 0.078), mat(0xffffff, { map: plateTex, metalness: 0.6, roughness: 0.2, env: true, envI: 0.6 }), 0, 0.0125, 0, -PI / 2, 0, 0);
  const mat2 = new THREE.Shape(); mat2.moveTo(-0.044, -0.037); mat2.lineTo(0.044, -0.037); mat2.lineTo(0.044, 0.037); mat2.lineTo(-0.044, 0.037); mat2.closePath();
  mat2.holes.push(spPath([[0, -0.034], [0.026, -0.022], [0.03, 0], [0.026, 0.022], [0, 0.034], [-0.026, 0.022], [-0.03, 0], [-0.026, -0.022]]));
  EXS(cs, mat2, 0.001, gold(0.25), 0, 0.0135, 0, -PI / 2, 0, PI / 2, 0.0004);
  return ground(g);
};

// ---------- Tenis para Dos: osciloscopio + computadora analógica ----------
BUILDERS_C.tenis_para_dos_1958 = () => {
  const g = new THREE.Group();
  const hammer = canvasTex('C_hammer', 256, 256, (c, w, h) => { c.fillStyle = '#7d8a86'; c.fillRect(0, 0, w, h); const R = rng(21); for (let i = 0; i < 1400; i++) { const x = R() * w, y = R() * h, r = 1.5 + R() * 3; c.fillStyle = `rgba(${R() < 0.5 ? '255,255,255' : '0,0,0'},${0.015 + R() * 0.03})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } }, true);
  const case1 = mat(0xffffff, { map: hammer, roughness: 0.45, metalness: 0.5, env: true, envI: 0.5 });
  const panel = mat(0x2a2c2c, { roughness: 0.4, metalness: 0.4 });
  const knobM = mat(0x161616, { roughness: 0.3, env: true, envI: 0.5 });
  const knob = (grpp, x, y, z, r = 0.012) => { lathe(grpp, [[0, 0], [r, 0], [r, 0.004], [r * 0.8, 0.012], [r * 0.7, 0.016], [0, 0.016]], knobM, x, y, z, PI / 2, 0, 0, 20); P(grpp, r * 0.3, r * 0.1, labelTex('.', { bg: '#fff' }), x, y + r * 0.5, z + 0.0165); };
  // computadora analógica (base) con tablero de conexiones
  const W = 0.5, D = 0.36;
  RB(g, W, 0.16, D, 0.01, case1, 0, 0.08, 0);
  // rejillas de ventilación laterales y patas de goma
  const slots = [];
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) slots.push(gx(new RoundedBoxGeometry(0.004, 0.08, 0.012, 1, 0.002), sx * (W / 2 + 0.001), 0.085, -0.12 + i * 0.03));
  for (const sx of [-1, 1]) for (let i = 0; i < 7; i++) slots.push(gx(new RoundedBoxGeometry(0.004, 0.012, 0.1, 1, 0.002), -0.05 + sx * (0.13 + 0.001), 0.2 + i * 0.022, -0.05));
  merged(g, slots, mat(0x151515, { roughness: 0.8 }));
  const feet = []; for (const [x, z] of [[-0.22, -0.15], [0.22, -0.15], [-0.22, 0.15], [0.22, 0.15]]) feet.push(gx(new THREE.CylinderGeometry(0.015, 0.018, 0.012, 16), x, -0.006, z));
  merged(g, feet, C.rubber());
  const patch = canvasTex('C_patch', 512, 256, (c, w, h) => {
    c.fillStyle = '#1c1c1c'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d8d0b0'; c.font = 'bold 16px Arial'; c.fillText('COMPUTADORA ANALÓGICA · MODELO 30', 16, 22);
    for (let i = 0; i < 10; i++) for (let j = 0; j < 4; j++) { const x = 30 + i * 48, y = 60 + j * 48; c.fillStyle = ['#c02020', '#202020', '#e0e0e0', '#2050c0'][j]; c.beginPath(); c.arc(x, y, 9, 0, TAU); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill(); }
  });
  P(g, W - 0.04, 0.12, patch, 0, 0.08, D / 2 + 0.0005);
  // cables de conexión (arcos de colores)
  const R = rng(8);
  const cols = [0xc02020, 0x2050c0, 0xe0c020, 0x20a040, 0x111111];
  for (let i = 0; i < 7; i++) {
    const x1 = -0.2 + R() * 0.4, x2 = -0.2 + R() * 0.4, y1 = 0.04 + ((R() * 4) | 0) * 0.022, y2 = 0.04 + ((R() * 4) | 0) * 0.022;
    TU(g, [[x1, y1, D / 2 + 0.002], [x1, y1 - 0.01, D / 2 + 0.03], [(x1 + x2) / 2, Math.min(y1, y2) - 0.03, D / 2 + 0.05], [x2, y2 - 0.01, D / 2 + 0.03], [x2, y2, D / 2 + 0.002]], 0.0025, plastic(cols[i % 5]), false, 24);
  }
  // osciloscopio encima
  const oy = 0.16, ow = 0.26, oh = 0.28, od = 0.34;
  RB(g, ow, oh, od, 0.012, case1, -0.05, oy + oh / 2, -0.01);
  RB(g, ow - 0.02, oh - 0.02, 0.01, 0.004, panel, -0.05, oy + oh / 2, od / 2 - 0.01 + 0.005);
  // asa superior
  TU(g, [[-0.14, oy + oh, -0.05], [-0.12, oy + oh + 0.035, -0.05], [0.02, oy + oh + 0.035, -0.05], [0.04, oy + oh, -0.05]], 0.006, C.chrome(), false, 24);
  // tubo de rayos catódicos: visera + pantalla verde con la cancha
  const scrZ = od / 2 - 0.01 + 0.012, sx = -0.05, sy = oy + oh * 0.6;
  lathe(g, [[0.06, 0], [0.066, 0], [0.066, 0.03], [0.062, 0.034], [0.056, 0.034]], mat(0x1a1a1a, { roughness: 0.5, side: THREE.DoubleSide }), sx, sy, scrZ, PI / 2, 0, 0, 40);
  const scr = canvasTex('C_tenis_scr', 256, 256, (c, w, h) => {
    const gg = c.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2); gg.addColorStop(0, '#0e2a18'); gg.addColorStop(1, '#030a05');
    c.fillStyle = gg; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(80,200,120,0.15)'; c.lineWidth = 1; for (let i = 1; i < 8; i++) { c.beginPath(); c.moveTo(i * w / 8, 0); c.lineTo(i * w / 8, h); c.stroke(); c.beginPath(); c.moveTo(0, i * h / 8); c.lineTo(w, i * h / 8); c.stroke(); }
    c.shadowColor = '#6f6'; c.shadowBlur = 8; c.strokeStyle = '#8fff9f'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(20, h * 0.72); c.lineTo(w - 20, h * 0.72); c.stroke();
    c.beginPath(); c.moveTo(w / 2, h * 0.72); c.lineTo(w / 2, h * 0.6); c.stroke();
    c.fillStyle = '#b8ffc0';
    for (let i = 0; i < 16; i++) { const t = i / 15; const x = 40 + t * 160, y = h * 0.72 - Math.abs(Math.sin(t * PI * 1.3 + 0.2)) * 90 * (1 - t * 0.4); c.globalAlpha = 0.25 + t * 0.75; c.beginPath(); c.arc(x, y, 3 + t * 2, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
  });
  const sc = add(g, new THREE.CircleGeometry(0.057, 48), mat(0xffffff, { map: scr, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 1.2, roughness: 0.1 }), sx, sy, scrZ + 0.004);
  add(g, new THREE.SphereGeometry(0.06, 32, 12, 0, TAU, 0, 0.35), glass(0xa0ffc0, 0.12), sx, sy, scrZ + 0.004 - 0.056, PI / 2, 0, 0);
  // perillas y rotulación del panel
  for (let i = 0; i < 3; i++) knob(g, sx - 0.08 + i * 0.08, oy + 0.065, od / 2 + 0.006, 0.011);
  for (const y of [sy + 0.03, sy - 0.03]) knob(g, sx + 0.1, y, od / 2 + 0.006, 0.009);
  P(g, 0.2, 0.025, labelTex('OSCILOSCOPIO DE LABORATORIO', { bg: '#2a2c2c', fg: '#d8d0b0', font: 'bold 34px Arial' }), sx, oy + oh - 0.03, od / 2 + 0.0055);
  // interruptor y foco piloto
  CY(g, 0.003, 0.003, 0.015, C.chrome(), sx - 0.1, oy + 0.11, od / 2 + 0.012, PI / 2 - 0.4, 0, 0, 8);
  SP(g, 0.006, emissive(0xff3020, 1.4), sx - 0.1, oy + 0.14, od / 2 + 0.008);
  // dos controles de aluminio con perilla y botón
  const alu = metal(0xb8bcc0, 0.35);
  for (const s of [-1, 1]) {
    const cx = s * 0.34, cz = D / 2 + 0.12;
    const ctl = grp(g, cx, -0.012, cz, 0, -s * 0.3, 0);
    RB(ctl, 0.09, 0.05, 0.12, 0.008, alu, 0, 0.025, 0);
    knob(ctl, 0, 0.05, 0.01, 0.013); ctl.children[ctl.children.length - 2].rotation.set(0, 0, 0);
    lathe(ctl, [[0, 0], [0.008, 0], [0.008, 0.008], [0.006, 0.012], [0, 0.012]], plastic(0xc02020), 0.02, 0.05, -0.035, 0, 0, 0, 16);
    P(ctl, 0.06, 0.012, labelTex(s < 0 ? 'JUGADOR 1' : 'JUGADOR 2', { bg: '#b8bcc0', fg: '#222', font: 'bold 60px Arial' }), 0, 0.0505, 0.04, -PI / 2);
    TU(g, [[cx - s * 0.02, 0.008, cz - 0.06], [cx - s * 0.05, -0.008, cz - 0.1], [s * 0.25, -0.008, D / 2 + 0.02], [s * 0.2, 0.02, D / 2 + 0.002]], 0.004, C.black(), false, 24);
  }
  return ground(g);
};

// ---------- Batería de jazz de los años 40 ----------
function pearlTex(key, base = '#f2efe8') {
  return canvasTex('C_perla_' + key, 512, 256, (c, w, h) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    const R = rng(key.length * 7 + 1);
    for (let i = 0; i < 160; i++) {
      const x = R() * w, y = R() * h, r = 8 + R() * 40;
      const gg = c.createRadialGradient(x, y, 0, x, y, r);
      const tint = [['255,250,240'], ['220,225,235'], ['240,230,215'], ['200,205,215']][(R() * 4) | 0];
      gg.addColorStop(0, `rgba(${tint},0.55)`); gg.addColorStop(1, `rgba(${tint},0)`);
      c.fillStyle = gg; c.beginPath(); c.ellipse(x, y, r * 1.8, r * 0.6, R() * 3, 0, TAU); c.fill();
    }
  }, true);
}
function cymbalTex() {
  return canvasTex('C_platillo', 512, 512, (c, w, h) => {
    const cx = w / 2, cy = h / 2;
    c.fillStyle = '#c8943a'; c.fillRect(0, 0, w, h);
    for (let r = 4; r < w / 2; r += 1.5) { c.strokeStyle = `rgba(${r % 3 < 1.5 ? '255,220,150' : '90,50,10'},${0.12 + (r % 4) * 0.04})`; c.lineWidth = 1; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.stroke(); }
    c.fillStyle = 'rgba(30,20,10,0.8)'; c.font = 'italic bold 22px Georgia'; c.textAlign = 'center'; c.fillText('ESTAMBUL', cx, cy + 90);
  });
}
function drumPiece(parent, r, d, o = {}) {
  const { head = null, wrap, nickel, rods, lugsN = 8, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 } = o;
  const g = grp(parent, x, y, z, rx, ry, rz);
  const shell = new THREE.CylinderGeometry(r, r, d - 0.02, 48, 1, true);
  add(g, shell, wrap);
  // aros de madera con filete
  const hoopM = woodM('aro_bat', '#5a2a12', { rx: 1, ry: 1, rough: 0.35, envI: 0.6 });
  for (const s of [-1, 1]) lathe(g, [[r - 0.002, 0], [r + 0.009, 0], [r + 0.011, 0.004], [r + 0.011, 0.018], [r + 0.009, 0.022], [r - 0.002, 0.022]], hoopM, 0, s * (d / 2 - 0.011) - 0.011, 0, 0, 0, 0, 56);
  // parches
  const skin = mat(0xffffff, { map: canvasTex('C_parche', 256, 256, (c, w, h) => { c.fillStyle = '#efe4c8'; c.fillRect(0, 0, w, h); const R = rng(2); for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(150,110,60,${R() * 0.08})`; c.beginPath(); c.arc(R() * w, R() * h, 2 + R() * 12, 0, TAU); c.fill(); } }), roughness: 0.8 });
  add(g, new THREE.CircleGeometry(r, 48), skin, 0, -d / 2 + 0.004, 0, PI / 2);
  add(g, new THREE.CircleGeometry(r, 48), head ? mat(0xffffff, { map: head, roughness: 0.7 }) : skin, 0, d / 2 - 0.004, 0, -PI / 2);
  // tensores y ganchos (acumulados para fusionar)
  const m = new THREE.Matrix4().compose(g.position, new THREE.Quaternion().setFromEuler(g.rotation), new THREE.Vector3(1, 1, 1));
  for (let i = 0; i < lugsN; i++) {
    const a = (i + 0.5) / lugsN * TAU, ca = Math.cos(a), sa = Math.sin(a);
    nickel.push(gx(latheGeo(smooth([[0, -0.03], [0.007, -0.028], [0.009, 0], [0.007, 0.028], [0, 0.03]], 10), 10), ca * (r + 0.004), 0, sa * (r + 0.004), 0, 0, PI / 2 * 0 ).applyMatrix4(m));
    for (const s of [-1, 1]) {
      rods.push(gx(new THREE.CylinderGeometry(0.0022, 0.0022, d * 0.32, 6), ca * (r + 0.016), s * (d / 2 - d * 0.18), sa * (r + 0.016)).applyMatrix4(m));
      rods.push(gx(new THREE.BoxGeometry(0.01, 0.012, 0.008), ca * (r + 0.014), s * (d / 2 - 0.012), sa * (r + 0.014), 0, -a, 0).applyMatrix4(m));
    }
  }
  return g;
}
function standTripod(parent, x, z, h, nickel, spread = 0.2) {
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + 0.3;
    nickel.push(swGeo([[x, 0.2, z], [x + Math.cos(a) * spread * 0.6, 0.08, z + Math.sin(a) * spread * 0.6], [x + Math.cos(a) * spread, 0.008, z + Math.sin(a) * spread]], [0.006, 0.0055, 0.005], 6, 8));
  }
  nickel.push(gx(new THREE.CylinderGeometry(0.009, 0.009, 0.24, 12), x, 0.12, z));
  nickel.push(gx(new THREE.CylinderGeometry(0.006, 0.006, h - 0.22, 10), x, 0.22 + (h - 0.22) / 2, z));
  nickel.push(gx(new THREE.CylinderGeometry(0.013, 0.013, 0.025, 12), x, 0.24, z));
}
BUILDERS_C.bateria_jazz_1940 = () => {
  const g = new THREE.Group();
  const wrap = mat(0xffffff, { map: pearlTex('bat'), roughness: 0.2, env: true, envI: 0.8 });
  const nickelM = metal(0xdfe3e6, 0.12), nickel = [], rods = [];
  // parche frontal del bombo pintado
  const front = canvasTex('C_bombo_art', 512, 512, (c, w, h) => {
    const cx = w / 2, cy = h / 2;
    const gg = c.createRadialGradient(cx, cy, 20, cx, cy, w / 2); gg.addColorStop(0, '#f6ecd0'); gg.addColorStop(1, '#d8c498'); c.fillStyle = gg; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1a2a5a'; c.beginPath(); c.arc(cx, cy, w * 0.36, 0, TAU); c.fill();
    const sky = c.createLinearGradient(0, cy - 180, 0, cy + 180); sky.addColorStop(0, '#1a2a5a'); sky.addColorStop(1, '#c8603a');
    c.fillStyle = sky; c.beginPath(); c.arc(cx, cy, w * 0.33, 0, TAU); c.fill();
    c.fillStyle = '#f8e8a0'; c.beginPath(); c.arc(cx + 50, cy - 50, 34, 0, TAU); c.fill();
    c.fillStyle = '#10141c';
    const palm = (x, y, s) => { c.fillRect(x - 4 * s, y - 120 * s, 8 * s, 120 * s); for (let i = 0; i < 7; i++) { const a = -PI / 2 + (i - 3) * 0.45; c.beginPath(); c.ellipse(x + Math.cos(a) * 36 * s, y - 120 * s + Math.sin(a) * 18 * s + 12 * s, 40 * s, 8 * s, a, 0, TAU); c.fill(); } };
    palm(cx - 90, cy + 110, 1); palm(cx - 40, cy + 120, 0.7);
    c.fillRect(cx - 170, cy + 105, 340, 60);
    c.fillStyle = '#e8c23a'; c.font = 'italic bold 52px Georgia'; c.textAlign = 'center'; c.fillText('Los Reyes', cx, cy + 170 - 205);
    c.font = 'bold 40px Georgia'; c.fillText('DEL SWING', cx, cy + 20);
    c.strokeStyle = '#e8c23a'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, w * 0.36, 0, TAU); c.stroke();
    c.font = 'bold 22px Georgia'; for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; c.save(); c.translate(cx + Math.cos(a) * w * 0.42, cy + Math.sin(a) * w * 0.42); c.rotate(a + PI / 2); c.fillText('★', 0, 0); c.restore(); }
  });
  // bombo (26") de frente al jugador
  const BR = 0.33, BD = 0.36, by = BR + 0.03;
  drumPiece(g, BR, BD, { head: front, wrap, nickel, rods, lugsN: 10, x: 0, y: by, z: 0, rx: PI / 2 });
  // espuelas y pedal
  for (const s of [-1, 1]) nickel.push(swGeo([[s * 0.2, by - 0.2, 0.12], [s * 0.28, by - 0.3, 0.16], [s * 0.34, 0.01, 0.2]], [0.007, 0.006, 0.006], 6, 10));
  const pedal = grp(g, 0, 0, -BD / 2 - 0.12);
  EXS(pedal, poly([[-0.04, 0], [0.04, 0], [0.035, 0.26], [-0.035, 0.26]]), 0.008, mat(0x2a2a2a, { roughness: 0.6, metalness: 0.5 }), 0, 0.035, 0.02, -PI / 2 + 0.25, 0, 0, 0.003);
  nickel.push(gx(new THREE.CylinderGeometry(0.004, 0.004, 0.22, 8), 0, 0.2, -BD / 2 - 0.035, 0.35, 0, 0));
  SP(g, 0.03, C.cloth(0xe8e0d0), 0, 0.3, -BD / 2 - 0.005, 1, 1, 0.7, 14);
  // tom de montaje sobre el bombo
  drumPiece(g, 0.15, 0.2, { wrap, nickel, rods, lugsN: 6, x: 0.02, y: by + BR + 0.16, z: -0.1, rx: -0.35 });
  nickel.push(gx(new THREE.CylinderGeometry(0.01, 0.01, 0.14, 10), 0.02, by + BR + 0.03, -0.05, -0.2, 0, 0));
  // tom de piso con patas
  const ft = { x: -0.5, z: -0.2 };
  drumPiece(g, 0.2, 0.38, { wrap, nickel, rods, lugsN: 8, x: ft.x, y: 0.5, z: ft.z });
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.5; nickel.push(swGeo([[ft.x + Math.cos(a) * 0.215, 0.55, ft.z + Math.sin(a) * 0.215], [ft.x + Math.cos(a) * 0.25, 0.25, ft.z + Math.sin(a) * 0.25], [ft.x + Math.cos(a) * 0.27, 0.01, ft.z + Math.sin(a) * 0.27]], [0.006, 0.006, 0.006], 6, 8)); }
  // redoblante en su atril
  const sn = { x: 0.42, z: -0.32 };
  standTripod(g, sn.x, sn.z, 0.52, nickel, 0.22);
  drumPiece(g, 0.18, 0.15, { wrap, nickel, rods, lugsN: 8, x: sn.x, y: 0.61, z: sn.z, rx: 0.12 });
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; nickel.push(swGeo([[sn.x, 0.53, sn.z], [sn.x + Math.cos(a) * 0.12, 0.54, sn.z + Math.sin(a) * 0.12], [sn.x + Math.cos(a) * 0.17, 0.56, sn.z + Math.sin(a) * 0.17]], [0.004, 0.004, 0.004], 6, 8)); }
  // baquetas sobre el redoblante
  const hick = C.wood(0xd8b078);
  for (const s of [-1, 1]) add(g, swGeo([[sn.x - 0.14, 0.7, sn.z + s * 0.03], [sn.x + 0.02, 0.704, sn.z + s * 0.02], [sn.x + 0.24, 0.712, sn.z + s * 0.01]], [0.0065, 0.0065, 0.004], 8, 6), hick);
  // platillos: ride y hi-hat
  const cym = mat(0xffffff, { map: cymbalTex(), metalness: 1, roughness: 0.28, side: THREE.DoubleSide });
  const cymProf = (R) => smooth([[0, 0.028], [0.03, 0.026], [0.05, 0.012], [0.06, 0.009], [R * 0.6, 0.0035], [R, 0]], 30);
  const ride = { x: -0.42, z: 0.12 };
  standTripod(g, ride.x, ride.z, 1.02, nickel, 0.25);
  lathe(g, cymProf(0.25), cym, ride.x, 1.02, ride.z, 0.18, 0, 0.1, 56);
  const hh = { x: 0.62, z: -0.1 };
  standTripod(g, hh.x, hh.z, 0.86, nickel, 0.22);
  lathe(g, cymProf(0.18), cym, hh.x, 0.87, hh.z, PI, 0, 0, 48);
  lathe(g, cymProf(0.18), cym, hh.x, 0.885, hh.z, 0, 0, 0, 48);
  nickel.push(gx(new THREE.CylinderGeometry(0.004, 0.004, 0.08, 8), hh.x, 0.9, hh.z));
  EXS(g, poly([[-0.035, 0], [0.035, 0], [0.03, 0.22], [-0.03, 0.22]]), 0.008, mat(0x2a2a2a, { roughness: 0.6, metalness: 0.5 }), hh.x, 0.03, hh.z - 0.1, -PI / 2 + 0.25, 0, 0, 0.003);
  merged(g, nickel, nickelM);
  merged(g, rods, nickelM);
  return g;
};

// ---------- Casco de gladiador murmillo ----------
BUILDERS_C.casco_gladiador_murmillo = () => {
  const g = new THREE.Group();
  const patina = canvasTex('C_bronce_pat', 512, 512, (c, w, h) => {
    c.fillStyle = '#b8863c'; c.fillRect(0, 0, w, h);
    const R = rng(33);
    for (let i = 0; i < 90; i++) { const x = R() * w, y = R() * h, r = 10 + R() * 50; const gg = c.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(${R() < 0.3 ? '70,130,100' : '90,55,20'},${0.25 + R() * 0.25})`); gg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gg; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
    for (let i = 0; i < 500; i++) { c.fillStyle = `rgba(255,230,170,${R() * 0.08})`; c.fillRect(0, R() * h, w, 1); }
  }, true);
  const bronze = mat(0xffffff, { map: patina, metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide });
  const brimTex = engraveTex('murm_brim', '#c09048', 'rgba(60,35,10,0.6)', { w: 1024, h: 128, density: 2 });
  const brimM = mat(0xffffff, { map: brimTex, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide });
  // peana y cabeza de madera
  const wal = woodM('nogal_glad', '#4a2a14', { rough: 0.4 });
  plinth(g, 0.13, 0.06, wal, { trim: brass() });
  lathe(g, smooth([[0, 0.06], [0.05, 0.06], [0.045, 0.1], [0.05, 0.16], [0.075, 0.2], [0.095, 0.26], [0.1, 0.32], [0.09, 0.38], [0.05, 0.42], [0, 0.43]], 30), wal, 0, 0, 0, 0, 0, 0, 36);
  const H = grp(g, 0, 0.3, 0); H.scale.set(1, 1, 1.12);
  // cuenco del casco
  lathe(H, smooth([[0.128, 0], [0.126, 0.04], [0.118, 0.08], [0.1, 0.12], [0.07, 0.15], [0.035, 0.165], [0, 0.17]], 40), bronze, 0, 0, 0, 0, 0, 0, 64);
  // ala ancha repujada
  lathe(H, [[0.126, 0.002], [0.15, -0.006], [0.19, -0.02], [0.215, -0.034], [0.222, -0.04], [0.224, -0.046], [0.218, -0.045], [0.19, -0.03], [0.15, -0.014], [0.126, -0.008]], brimM, 0, 0, 0, 0, 0, 0, 72);
  TO(H, 0.223, 0.004, bronze, 0, -0.044, 0, PI / 2, 0, 0, TAU, 72);
  // visera con rejilla (cilindro abierto frontal con agujeros por textura)
  const grill = canvasTex('C_rejilla', 512, 256, (c, w, h) => {
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#fff'; c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'destination-out';
    for (const ex of [0.34, 0.66]) {
      for (let i = -4; i <= 4; i++) for (let j = -3; j <= 3; j++) {
        const x = w * ex + i * 13 + (j % 2) * 6.5, y = h * 0.32 + j * 12;
        if (Math.hypot((x - w * ex) / 58, (y - h * 0.32) / 40) < 1) { c.beginPath(); c.arc(x, y, 4.2, 0, TAU); c.fill(); }
      }
    }
    c.globalCompositeOperation = 'source-over';
  });
  const visTex = canvasTex('C_visera', 512, 256, (c, w, h) => {
    c.drawImage(patina.image, 0, 0, w, h);
    c.strokeStyle = 'rgba(60,35,10,0.7)'; c.lineWidth = 5;
    for (const ex of [0.34, 0.66]) { c.beginPath(); c.ellipse(w * ex, h * 0.32, 62, 44, 0, 0, TAU); c.stroke(); }
    c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2, h * 0.1); c.lineTo(w / 2, h * 0.95); c.stroke();
    c.beginPath(); c.moveTo(w * 0.08, h * 0.9); c.quadraticCurveTo(w / 2, h * 0.7, w * 0.92, h * 0.9); c.stroke();
  });
  const visM = mat(0xffffff, { map: visTex, alphaMap: grill, alphaTest: 0.5, transparent: false, metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide });
  const vg = new THREE.CylinderGeometry(0.128, 0.11, 0.2, 48, 4, true, -1.3 + PI / 2 - PI / 2, 2.6);
  vg.rotateY(PI / 2 - PI / 2);
  // el cilindro de three empieza en +z con theta=0 -> centrar al frente
  const vp = vg.attributes.position;
  for (let i = 0; i < vp.count; i++) { const y = vp.getY(i); const x = vp.getX(i), z = vp.getZ(i); const k = 1 + Math.max(0, -y) * 0.25; vp.setXYZ(i, x, y, z * (z > 0 ? k * 0.95 : 1)); }
  vg.computeVertexNormals();
  add(H, vg, visM, 0, -0.1, 0);
  // reborde inferior y cierre lateral de la visera
  TU(H, Array.from({ length: 17 }, (_, i) => { const a = -1.3 + i / 16 * 2.6; return [Math.sin(a) * 0.11, -0.2, Math.cos(a) * 0.11 * (1 + 0.25 * 0.1) * 0.95 * (Math.cos(a) > 0 ? 1.25 : 1)]; }), 0.004, bronze, false, 48);
  // cresta en forma de aleta de pez
  const crestS = sp([[-0.14, 0], [-0.1, 0.06], [-0.02, 0.1], [0.08, 0.1], [0.15, 0.065], [0.17, 0.02], [0.14, 0]]);
  EXS(H, crestS, 0.012, mat(0xffffff, { map: rep(patina, 4, 4), metalness: 0.9, roughness: 0.35 }), 0, 0.12, 0, 0, -PI / 2, 0, 0.003);
  // penacho de crin roja
  const hair = [], R = rng(4);
  for (let i = 0; i < 70; i++) {
    const t = i / 69, zz = 0.13 - t * 0.28 + (R() - 0.5) * 0.01, yy = 0.2 + Math.sin(t * PI) * 0.03;
    const sx = (R() - 0.5) * 0.02;
    hair.push(swGeo([[sx, yy, zz], [sx * 2, yy + 0.03, zz - 0.02], [sx * 3.5, yy + 0.02 - t * 0.05, zz - 0.07 - t * 0.04], [sx * 5, yy - 0.04 - t * 0.12, zz - 0.1 - t * 0.05]], [0.006, 0.007, 0.005, 0.0015], 5, 10));
  }
  merged(H, hair, mat(0x9a1a14, { roughness: 0.85 }));
  // porta plumas laterales con plumas blancas
  const featherS = sp([[0, 0], [0.012, 0.04], [0.016, 0.12], [0.008, 0.2], [0, 0.22], [-0.008, 0.2], [-0.016, 0.12], [-0.012, 0.04]]);
  for (const s of [-1, 1]) {
    CY(H, 0.006, 0.005, 0.05, bronze, s * 0.126, 0.07, -0.01, 0, 0, -s * 0.15, 12);
    const f = new THREE.ShapeGeometry(featherS, 8);
    const fp = f.attributes.position; for (let i = 0; i < fp.count; i++) { const y = fp.getY(i); fp.setZ(i, -y * y * 0.8); }
    f.computeVertexNormals();
    add(H, f, mat(0xf4f0e8, { roughness: 0.9, side: THREE.DoubleSide, map: canvasTex('C_pluma_b', 64, 256, (c, w, h) => { c.fillStyle = '#f4f0e8'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(160,150,130,0.5)'; for (let y = 0; y < h; y += 4) { c.beginPath(); c.moveTo(w / 2, y); c.lineTo(0, y - 12); c.moveTo(w / 2, y); c.lineTo(w, y - 12); c.stroke(); } c.strokeStyle = '#ccc'; c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, h); c.stroke(); }) }), s * 0.13, 0.09, -0.01, 0, 0, -s * 0.15);
  }
  plaque(g, 'MURMILLO', 'Pompeya · s. I d.C.', 0.08, 0.018, 0, 0.03, 0.12, -0.25, 0);
  return g;
};

// =====================================================================
//  LEGENDARIOS
// =====================================================================
// anillo plano (banda) de radio r, ancho w, grosor t; eje = y local
function bandGeo(r, w, t, seg = 96) {
  return latheGeo([[r, -w / 2], [r + t, -w / 2], [r + t, w / 2], [r, w / 2], [r, -w / 2]], seg);
}
// escala graduada para anillos de latón
function scaleTex(key, o = {}) {
  const { base = '#d0a450', ink = 'rgba(60,35,5,0.85)', n = 360, labels = null, w = 2048, h = 64 } = o;
  return canvasTex('C_scale_' + key, w, h, (c) => {
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    c.fillStyle = ink;
    for (let i = 0; i < n; i++) { const x = i / n * w, big = i % 10 === 0, mid = i % 5 === 0; c.fillRect(x, 0, 1.5, big ? h * 0.45 : mid ? h * 0.32 : h * 0.2); }
    c.fillRect(0, h * 0.5, w, 1.5);
    if (labels) { c.font = `bold ${h * 0.34}px Georgia`; c.textAlign = 'center'; labels.forEach((t, i) => c.fillText(t, (i + 0.5) / labels.length * w, h * 0.9)); }
  }, true);
}

// ---------- Astrolabio persa ----------
BUILDERS_C.astrolabio_persa = () => {
  const g = new THREE.Group();
  const br = metal(0xd2a650, 0.26);
  const brD = metal(0xb88a3c, 0.32, { side: THREE.DoubleSide });
  const R0 = 0.11;
  const A = grp(g, 0, 0.29, 0);
  // madre: disco con limbo graduado en abjad
  const tymp = canvasTex('C_timpano', 1024, 1024, (c, w, h) => {
    const cx = w / 2, cy = h / 2;
    c.fillStyle = '#7a5420'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,220,140,0.75)'; c.lineWidth = 2;
    // almucantarates (círculos excéntricos) y acimutes
    for (let i = 0; i < 18; i++) { const r = 60 + i * 22, off = i * 9; c.beginPath(); c.arc(cx, cy - 120 + off, r, 0, TAU); c.stroke(); }
    c.lineWidth = 1.2;
    for (let i = -8; i <= 8; i++) { c.beginPath(); c.ellipse(cx + i * 30, cy - 160, Math.abs(i) * 30 + 20, 330, 0, 0, PI); c.stroke(); }
    c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, w * 0.33, 0, TAU); c.stroke(); c.beginPath(); c.arc(cx, cy, w * 0.2, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(cx - w * 0.4, cy); c.lineTo(cx + w * 0.4, cy); c.moveTo(cx, cy - w * 0.4); c.lineTo(cx, cy + w * 0.4); c.stroke();
    // limbo exterior
    c.fillStyle = '#d8ac58'; c.beginPath(); c.arc(cx, cy, w * 0.5, 0, TAU); c.arc(cx, cy, w * 0.41, 0, TAU, true); c.fill();
    c.fillStyle = 'rgba(60,35,5,0.9)';
    for (let i = 0; i < 360; i++) { const a = i / 360 * TAU, l = i % 5 === 0 ? 0.035 : 0.018; c.save(); c.translate(cx, cy); c.rotate(a); c.fillRect(w * (0.41), -0.8, w * l, 1.6); c.restore(); }
    c.font = 'bold 30px serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const ab = 'ابجدهوزحطيكلمنسعفصقرشتثخذ';
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU - PI / 2; c.save(); c.translate(cx + Math.cos(a) * w * 0.465, cy + Math.sin(a) * w * 0.465); c.rotate(a + PI / 2); c.fillText(ab[i], 0, 0); c.restore(); }
  });
  add(A, new THREE.CylinderGeometry(R0, R0, 0.006, 96), [br, mat(0xffffff, { map: tymp, metalness: 1, roughness: 0.32 }), br], 0, 0, 0, PI / 2, 0, 0);
  lathe(A, [[R0 - 0.012, -0.004], [R0 + 0.004, -0.004], [R0 + 0.004, 0.008], [R0 - 0.012, 0.008]], br, 0, 0, 0, PI / 2, 0, 0, 96);
  // red calada (rete): anillo de la eclíptica descentrado + punteros de estrellas en forma de llama
  const rete = new THREE.Shape(); rete.absarc(0, 0, R0 * 0.83, 0, TAU, false);
  rete.holes.push(circ(R0 * 0.76, 0, 0, true));
  const reteM = mat(0xf0c868, { metalness: 0.65, roughness: 0.3, env: true, envI: 1.2 });
  const rg = [new THREE.ExtrudeGeometry(rete, { depth: 0.002, bevelEnabled: false, curveSegments: 64 })];
  const ecl = new THREE.Shape(); ecl.absarc(0, R0 * 0.18, R0 * 0.58, 0, TAU, false); ecl.holes.push(circ(R0 * 0.48, 0, R0 * 0.18, true));
  rg.push(new THREE.ExtrudeGeometry(ecl, { depth: 0.002, bevelEnabled: false, curveSegments: 64 }));
  const Rr = rng(17);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU + Rr() * 0.2, r1 = R0 * (0.3 + Rr() * 0.35), len = R0 * (0.2 + Rr() * 0.12);
    const flame = sp([[0, 0], [len * 0.25, len * 0.2], [len * 0.6, len * 0.1], [len, 0], [len * 0.6, -len * 0.12], [len * 0.25, -len * 0.22]]);
    const fg = new THREE.ExtrudeGeometry(flame, { depth: 0.002, bevelEnabled: false, curveSegments: 8 });
    fg.translate(-len * 0.1, 0, 0); fg.rotateZ(a); fg.translate(Math.cos(a) * r1, Math.sin(a) * r1, 0);
    rg.push(fg);
    // brazo que une la estrella al anillo
    const arm = new THREE.ExtrudeGeometry(sp([[0, -0.0028], [R0 * 0.8 - r1, -0.002], [R0 * 0.8 - r1, 0.002], [0, 0.0028]]), { depth: 0.002, bevelEnabled: false, curveSegments: 4 });
    arm.rotateZ(a); arm.translate(Math.cos(a) * r1, Math.sin(a) * r1, 0); rg.push(arm);
  }
  // arabescos de la red (volutas)
  for (let i = 0; i < 4; i++) { const t = new THREE.TorusGeometry(R0 * 0.16, 0.0022, 6, 24, PI * 1.2); t.rotateZ(i * PI / 2); t.translate(Math.cos(i * PI / 2 + 0.6) * R0 * 0.35, Math.sin(i * PI / 2 + 0.6) * R0 * 0.35, 0.001); rg.push(t); }
  add(A, mergeList(rg), reteM, 0, 0, 0.0085);
  // eje y cuña (caballo)
  lathe(A, [[0, 0], [0.006, 0], [0.006, 0.014], [0.004, 0.016], [0, 0.016]], br, 0, 0, 0.003, PI / 2, 0, 0, 16);
  EX(A, [[-0.003, -0.006], [0.003, -0.006], [0.002, 0.012], [-0.002, 0.012]], 0.003, br, 0, 0, 0.021, 0, 0, 0.6, 0.0005);
  // alidada en el dorso
  EX(A, [[-0.006, -R0 * 0.95], [0.006, -R0 * 0.95], [0.004, R0 * 0.95], [-0.004, R0 * 0.95]], 0.003, br, 0, 0, -0.006, 0, 0, -0.4, 0.0005);
  // trono (kursi) calado con anilla
  const kursi = new THREE.Shape();
  kursi.moveTo(-0.045, 0); kursi.quadraticCurveTo(-0.05, 0.02, -0.03, 0.03); kursi.quadraticCurveTo(-0.025, 0.05, -0.008, 0.055); kursi.lineTo(0, 0.062); kursi.lineTo(0.008, 0.055); kursi.quadraticCurveTo(0.025, 0.05, 0.03, 0.03); kursi.quadraticCurveTo(0.05, 0.02, 0.045, 0); kursi.closePath();
  kursi.holes.push(spPath([[-0.025, 0.012], [-0.012, 0.03], [-0.006, 0.02], [-0.012, 0.008]]), spPath([[0.025, 0.012], [0.012, 0.03], [0.006, 0.02], [0.012, 0.008]]), circ(0.005, 0, 0.042, true));
  EXS(A, kursi, 0.008, br, 0, R0 - 0.004, 0.002, 0, 0, 0, 0.0015);
  TO(A, 0.008, 0.0022, br, 0, R0 + 0.068, 0.002, 0, PI / 2, 0, TAU, 20);
  TO(A, 0.016, 0.0028, br, 0, R0 + 0.09, 0.002, 0, 0, 0, TAU, 32);
  // soporte de nogal: base y poste con gancho
  const wal = woodM('nogal_astro', '#5a3418', { rough: 0.38, rx: 2, ry: 2 });
  plinth(g, 0.1, 0.04, wal, { trim: brass() });
  lathe(g, smooth([[0, 0.04], [0.022, 0.04], [0.016, 0.06], [0.012, 0.12], [0.016, 0.16], [0.01, 0.2], [0.012, 0.42], [0.016, 0.43], [0, 0.44]], 30), wal, 0, 0, -0.04, 0, 0, 0, 24);
  TU(g, [[0, 0.43, -0.04], [0, 0.445, -0.02], [0, 0.44, 0.0], [0, 0.425, 0.002]], 0.0025, br, false, 16);
  A.position.set(0, 0.425 - (R0 + 0.09) - 0.016, 0.002);
  return g;
};

// ---------- Telescopio de Galileo ----------
BUILDERS_C.telescopio_galileo = () => {
  const g = new THREE.Group();
  const leather = canvasTex('C_tel_cuero', 1024, 128, (c, w, h) => {
    c.fillStyle = '#7a3a1a'; c.fillRect(0, 0, w, h);
    const R = rng(6); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(${R() < 0.5 ? '0,0,0' : '255,200,150'},${R() * 0.07})`; c.fillRect(R() * w, R() * h, 2, 2); }
    // dorado a fuego: lirios y bandas
    c.strokeStyle = '#d8b050'; c.fillStyle = '#d8b050'; c.lineWidth = 2;
    for (let k = 0; k < 8; k++) {
      const x0 = k * w / 8;
      c.fillRect(x0 + 2, 0, 3, h); c.fillRect(x0 + 10, 0, 1.5, h);
      for (let j = 0; j < 3; j++) {
        const x = x0 + w / 16, y = (j + 0.5) * h / 3;
        c.beginPath(); c.moveTo(x, y - 14); c.quadraticCurveTo(x + 5, y - 4, x, y + 4); c.quadraticCurveTo(x - 5, y - 4, x, y - 14); c.fill();
        c.beginPath(); c.moveTo(x - 2, y); c.quadraticCurveTo(x - 14, y - 10, x - 10, y + 2); c.moveTo(x + 2, y); c.quadraticCurveTo(x + 14, y - 10, x + 10, y + 2); c.stroke();
        c.fillRect(x - 7, y + 4, 14, 2);
        c.beginPath(); c.arc(x + w / 32, (j) * h / 3, 2.5, 0, TAU); c.fill();
      }
    }
  }, true);
  const lea = mat(0xffffff, { map: rep(leather, 1, 1), roughness: 0.55 });
  const wood = woodM('tel_madera', '#5a2e14', { rough: 0.4 });
  const T = grp(g, 0, 0.3, 0, 0, 0, 0);
  T.rotation.set(0, PI / 2 + 0.25, 0.12);
  // tubo principal (eje y local -> lo acostamos)
  const tube = grp(T, 0, 0, 0, 0, 0, PI / 2);
  const L = 0.98;
  lathe(tube, [[0.022, -L / 2], [0.025, -L / 2 + 0.01], [0.025, L / 2 - 0.04], [0.027, L / 2 - 0.03], [0.027, L / 2]], lea, 0, 0, 0, 0, 0, 0, 40);
  // virolas de madera torneada y latón
  lathe(tube, smooth([[0.02, L / 2], [0.03, L / 2 + 0.005], [0.033, L / 2 + 0.03], [0.03, L / 2 + 0.05], [0.026, L / 2 + 0.055]], 20), wood, 0, 0, 0, 0, 0, 0, 36);
  lathe(tube, [[0.024, L / 2 + 0.054], [0.028, L / 2 + 0.054], [0.028, L / 2 + 0.06], [0.024, L / 2 + 0.06]], brass(), 0, 0, 0, 0, 0, 0, 36);
  add(tube, new THREE.CircleGeometry(0.024, 32), mat(0x335566, { roughness: 0.02, metalness: 0.6, env: true, envI: 1.5 }), 0, L / 2 + 0.058, 0, -PI / 2);
  lathe(tube, smooth([[0.012, -L / 2 - 0.09], [0.015, -L / 2 - 0.085], [0.016, -L / 2 - 0.05], [0.02, -L / 2 - 0.03], [0.024, -L / 2 - 0.005], [0.022, -L / 2]], 20), wood, 0, 0, 0, 0, 0, 0, 30);
  lathe(tube, [[0.011, -L / 2 - 0.092], [0.016, -L / 2 - 0.092], [0.016, -L / 2 - 0.086], [0.011, -L / 2 - 0.086]], brass(), 0, 0, 0, 0, 0, 0, 24);
  for (const y of [-0.2, 0.15, 0.4]) lathe(tube, [[0.025, y - 0.006], [0.0275, y - 0.005], [0.0275, y + 0.005], [0.025, y + 0.006]], brass(), 0, 0, 0, 0, 0, 0, 32);
  // horquilla de latón y columna torneada
  const fork = new THREE.Shape(); fork.moveTo(-0.05, 0); fork.lineTo(0.05, 0); fork.lineTo(0.05, 0.05); fork.quadraticCurveTo(0.05, 0.08, 0.03, 0.085); fork.lineTo(0.03, 0.03); fork.quadraticCurveTo(0, 0.0, -0.03, 0.03); fork.lineTo(-0.03, 0.085); fork.quadraticCurveTo(-0.05, 0.08, -0.05, 0.05); fork.closePath();
  EXS(g, fork, 0.012, brass(), 0, 0.235, 0, 0, PI / 2 + 0.25, 0, 0.002);
  lathe(g, smooth([[0, 0.05], [0.03, 0.05], [0.022, 0.07], [0.015, 0.1], [0.022, 0.14], [0.014, 0.18], [0.012, 0.22], [0.02, 0.235], [0, 0.24]], 30), wood, 0, 0, 0, 0, 0, 0, 32);
  // base trípode de garras
  plinth(g, 0.12, 0.05, woodM('tel_base', '#3a1e0e', { rough: 0.35 }), { trim: brass() });
  plaque(g, 'G. GALILEI', 'Padua · 1610', 0.075, 0.016, 0, 0.026, 0.118, 0, 0);
  return g;
};

// ---------- Globo celeste de latón ----------
BUILDERS_C.globo_celeste_laton = () => {
  const g = new THREE.Group();
  const sky = canvasTex('C_cielo', 2048, 1024, (c, w, h) => {
    const gg = c.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#0e1c40'); gg.addColorStop(0.5, '#1a2c5a'); gg.addColorStop(1, '#0e1c40');
    c.fillStyle = gg; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(216,176,80,0.45)'; c.lineWidth = 1.5;
    for (let i = 1; i < 12; i++) { c.beginPath(); c.moveTo(i * w / 12, 0); c.lineTo(i * w / 12, h); c.stroke(); }
    for (let j = 1; j < 6; j++) { c.beginPath(); c.moveTo(0, j * h / 6); c.lineTo(w, j * h / 6); c.stroke(); }
    // eclíptica
    c.strokeStyle = 'rgba(232,200,110,0.9)'; c.lineWidth = 10; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, h / 2 + Math.sin(x / w * TAU) * h * 0.13); c.stroke();
    c.strokeStyle = 'rgba(14,28,64,1)'; c.lineWidth = 6; c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, h / 2 + Math.sin(x / w * TAU) * h * 0.13); c.stroke();
    const R = rng(77);
    // constelaciones con figuras en oro
    c.fillStyle = '#f0d890'; c.strokeStyle = 'rgba(240,216,144,0.8)'; c.lineWidth = 2;
    const names = ['ORION', 'LEO', 'TAVRVS', 'CYGNVS', 'SCORPIVS', 'PEGASVS', 'DRACO', 'LYRA', 'AQVILA', 'GEMINI', 'VIRGO', 'HYDRA', 'CETVS', 'URSA MAIOR'];
    for (let k = 0; k < names.length; k++) {
      const cx = (k + 0.5) / names.length * w + (R() - 0.5) * 60, cy = h * (0.18 + R() * 0.64);
      const pts = []; for (let i = 0; i < 6; i++) pts.push([cx + (R() - 0.5) * 180, cy + (R() - 0.5) * 140]);
      c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
      pts.forEach(([x, y]) => { c.beginPath(); for (let a = 0; a < 10; a++) { const r = a % 2 ? 3 : 8; c.lineTo(x + Math.cos(a * PI / 5) * r, y + Math.sin(a * PI / 5) * r); } c.fill(); });
      // figura alegórica difusa
      c.save(); c.globalAlpha = 0.18; c.beginPath(); c.ellipse(cx, cy, 110, 70, R() * 3, 0, TAU); c.fill(); c.restore();
      c.font = 'italic bold 30px Georgia'; c.textAlign = 'center'; c.fillText(names[k], cx, cy + 95);
    }
    for (let i = 0; i < 1500; i++) { c.fillStyle = `rgba(255,240,200,${0.3 + R() * 0.7})`; c.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); }
  });
  const yc = 0.36, Rg = 0.15;
  const G = grp(g, 0, yc, 0, 0, 0, 0.41);
  add(G, new THREE.SphereGeometry(Rg, 72, 48), mat(0xffffff, { map: sky, roughness: 0.35, env: true, envI: 0.5 }));
  // meridiano graduado
  const merTex = scaleTex('meridiano', { n: 360, labels: ['10', '20', '30', '40', '50', '60', '70', '80', '90', '80', '70', '60', '50', '40', '30', '20', '10', '0', '10', '20', '30', '40', '50', '60', '70', '80', '90', '80', '70', '60', '50', '40', '30', '20', '10', '0'] });
  add(G, bandGeo(Rg + 0.006, 0.014, 0.006), [mat(0xffffff, { map: merTex, metalness: 1, roughness: 0.3 })], 0, 0, 0, PI / 2, 0, 0);
  // ejes polares
  for (const s of [-1, 1]) lathe(G, [[0, 0], [0.006, 0], [0.004, 0.012], [0.006, 0.016], [0, 0.022]], brass(), 0, s * (Rg + 0.012), 0, s < 0 ? PI : 0, 0, 0, 16);
  // horizonte con zodiaco
  const zod = canvasTex('C_zodiaco', 2048, 128, (c, w, h) => {
    c.fillStyle = '#efe2c0'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#3a2410'; c.lineWidth = 2; c.strokeRect(0, 4, w, h - 8); c.beginPath(); c.moveTo(0, h * 0.35); c.lineTo(w, h * 0.35); c.stroke();
    const z = ['ARIES', 'TAURUS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTARIUS', 'CAPRICORNUS', 'AQUARIUS', 'PISCES'];
    c.fillStyle = '#3a2410'; c.font = 'italic 34px Georgia'; c.textAlign = 'center';
    z.forEach((t, i) => { c.fillText(t, (i + 0.5) / 12 * w, h * 0.8); c.fillRect(i / 12 * w, 0, 2, h); });
    for (let i = 0; i < 360; i++) c.fillRect(i / 360 * w, 4, 1, i % 5 ? 10 : 22);
  });
  const hor = new THREE.RingGeometry(Rg + 0.014, Rg + 0.06, 96, 1);
  const hu = hor.attributes.uv, hp = hor.attributes.position;
  for (let i = 0; i < hu.count; i++) { const x = hp.getX(i), y = hp.getY(i); hu.setXY(i, (Math.atan2(y, x) / TAU + 1) % 1, (Math.hypot(x, y) - Rg - 0.014) / 0.046); }
  add(g, hor, mat(0xffffff, { map: zod, roughness: 0.6 }), 0, yc + 0.001, 0, -PI / 2);
  add(g, bandGeo(Rg + 0.06, 0.02, 0.006), woodM('globo_ring', '#4a2410', { rough: 0.35 }), 0, yc - 0.008, 0);
  add(g, bandGeo(Rg + 0.008, 0.02, 0.006), woodM('globo_ring', '#4a2410', { rough: 0.35 }), 0, yc - 0.008, 0);
  // patas torneadas y travesaños
  const wood = woodM('globo_pata', '#4a2410', { rough: 0.35 });
  const legs = [];
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * TAU + PI / 4, x = Math.cos(a) * (Rg + 0.035), z = Math.sin(a) * (Rg + 0.035);
    legs.push(gx(latheGeo(smooth([[0.012, 0], [0.016, 0.02], [0.011, 0.05], [0.009, 0.1], [0.016, 0.14], [0.01, 0.18], [0.012, 0.24], [0.016, 0.28], [0.012, yc - 0.02]], 40), 20), x, 0.02, z));
  }
  merged(g, legs, wood);
  const cross = [];
  for (const a of [PI / 4, -PI / 4]) cross.push(gx(new RoundedBoxGeometry(2 * (Rg + 0.035) * 1.0, 0.016, 0.02, 2, 0.004), 0, 0.08, 0, 0, a, 0));
  merged(g, cross, wood);
  lathe(g, smooth([[0, 0.088], [0.02, 0.088], [0.014, 0.11], [0.006, 0.14], [0.003, 0.16], [0, 0.165]], 16), wood, 0, 0, 0, 0, 0, 0, 20);
  // soporte inferior del meridiano
  lathe(g, smooth([[0, 0.088], [0.012, 0.09], [0.008, 0.13], [0.006, yc - Rg - 0.02], [0.012, yc - Rg - 0.012]], 16), brass(), 0, 0, 0, 0, 0, 0, 16);
  const feet = []; for (let i = 0; i < 4; i++) { const a = i / 4 * TAU + PI / 4; feet.push(gx(new THREE.SphereGeometry(0.018, 14, 10), Math.cos(a) * (Rg + 0.035), 0.016, Math.sin(a) * (Rg + 0.035), 0, 0, 0, [1, 0.9, 1])); }
  merged(g, feet, wood);
  return ground(g);
};

// ---------- Esfera armilar ----------
BUILDERS_C.esfera_armilar = () => {
  const g = new THREE.Group();
  const br = metal(0xcfa04a, 0.25);
  const eclTex = canvasTex('C_ecliptica', 2048, 96, (c, w, h) => {
    c.fillStyle = '#d4a650'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(60,35,5,0.9)';
    const z = ['ARIES', 'TAVRVS', 'GEMINI', 'CANCER', 'LEO', 'VIRGO', 'LIBRA', 'SCORPIO', 'SAGITTA', 'CAPRICOR', 'AQVARIVS', 'PISCES'];
    c.font = 'italic bold 40px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
    z.forEach((t, i) => { c.fillText(t, (i + 0.5) / 12 * w, h / 2 + 4); c.fillRect(i / 12 * w, 0, 3, h); });
    for (let i = 0; i < 360; i++) { c.fillRect(i / 360 * w, 0, 1.2, i % 5 ? 8 : 14); c.fillRect(i / 360 * w, h - (i % 5 ? 8 : 14), 1.2, 14); }
  }, true);
  const yc = 0.36, Rs = 0.16;
  const S = grp(g, 0, yc, 0, 0, 0, 0.41);
  const scaleM = mat(0xffffff, { map: scaleTex('armilar', { n: 360 }), metalness: 1, roughness: 0.28 });
  const ring = (r, w, rx, rz, m = br, y = 0) => { const geo = bandGeo(r, w, 0.0035); const mm = add(S, geo, m, 0, y, 0, rx, 0, rz); return mm; };
  // coluros (dos meridianos), ecuador, trópicos y círculos polares
  ring(Rs, 0.01, PI / 2, 0, scaleM); ring(Rs, 0.01, PI / 2, PI / 2 * 0, scaleM).rotation.set(PI / 2, 0, PI / 2);
  ring(Rs - 0.004, 0.01, 0, 0);
  for (const s of [-1, 1]) {
    const yt = Math.sin(23.44 * PI / 180) * Rs, rt = Math.cos(23.44 * PI / 180) * Rs;
    ring(rt - 0.004, 0.006, 0, 0, br, s * yt);
    const yp = Math.sin(66.56 * PI / 180) * Rs, rp = Math.cos(66.56 * PI / 180) * Rs;
    ring(rp - 0.004, 0.006, 0, 0, br, s * yp);
  }
  // eclíptica ancha con zodiaco
  const ec = add(S, bandGeo(Rs - 0.002, 0.03, 0.003), mat(0xffffff, { map: eclTex, metalness: 1, roughness: 0.3 }), 0, 0, 0, 23.44 * PI / 180, 0, 0);
  // Tierra al centro sobre el eje
  const earth = canvasTex('C_tierra_ant', 512, 256, (c, w, h) => {
    c.fillStyle = '#5a7a8a'; c.fillRect(0, 0, w, h);
    const R = rng(4); c.fillStyle = '#c8b078';
    for (let k = 0; k < 7; k++) { const cx = R() * w, cy = h * (0.2 + R() * 0.6); c.beginPath(); for (let a = 0; a < 6.3; a += 0.3) { const rr = 20 + R() * 40; c.lineTo(cx + Math.cos(a) * rr * 1.4, cy + Math.sin(a) * rr); } c.fill(); }
  });
  add(S, new THREE.SphereGeometry(0.03, 32, 20), mat(0xffffff, { map: earth, roughness: 0.5 }));
  add(S, new THREE.CylinderGeometry(0.0025, 0.0025, 2 * Rs + 0.05, 8), br);
  for (const s of [-1, 1]) lathe(S, smooth([[0, 0], [0.008, 0.002], [0.006, 0.012], [0.003, 0.02], [0, 0.026]], 10), br, 0, s * (Rs + 0.024), 0, s < 0 ? PI : 0, 0, 0, 16);
  // meridiano exterior fijo y semiarco de soporte
  add(g, bandGeo(Rs + 0.012, 0.012, 0.005), scaleM, 0, yc, 0, PI / 2, 0, 0);
  // pedestal balaustre
  const wal = woodM('armilar_base', '#3a1e0e', { rough: 0.35 });
  plinth(g, 0.13, 0.05, wal, { trim: br });
  lathe(g, smooth([[0, 0.05], [0.05, 0.05], [0.045, 0.06], [0.025, 0.07], [0.018, 0.09], [0.03, 0.12], [0.032, 0.14], [0.02, 0.16], [0.012, 0.17], [0.016, 0.18], [0.012, yc - Rs - 0.02], [0.006, yc - Rs - 0.012]], 40), br, 0, 0, 0, 0, 0, 0, 36);
  plaque(g, 'SPHAERA MVNDI', 'Lovaina · 1560', 0.08, 0.016, 0, 0.028, 0.124, 0, 0);
  return g;
};

// silueta de engrane (dientes trapezoidales) con agujero central y radios calados opcionales
function gearShape(r, n, th, hole = 0, spokes = 0, rimW = 0) {
  const s = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, da = TAU / n;
    const pts = [[a0, r - th], [a0 + da * 0.18, r], [a0 + da * 0.5, r], [a0 + da * 0.68, r - th]];
    pts.forEach(([a, rr], k) => { const x = Math.cos(a) * rr, y = Math.sin(a) * rr; if (i === 0 && k === 0) s.moveTo(x, y); else s.lineTo(x, y); });
  }
  s.closePath();
  if (spokes) {
    const ri = r - th - rimW, rh = hole + rimW * 0.8;
    for (let k = 0; k < spokes; k++) {
      const a0 = k / spokes * TAU, da = TAU / spokes, sw = Math.min(0.5, rimW / ri * 0.8);
      const p = new THREE.Path();
      p.absarc(0, 0, ri, a0 + sw, a0 + da - sw, false);
      p.absarc(0, 0, rh, a0 + da - sw * ri / rh * 0.9, a0 + sw * ri / rh * 0.9, true);
      p.closePath(); s.holes.push(p);
    }
  }
  if (hole) s.holes.push(circ(hole, 0, 0, true));
  return s;
}
const gearGeo = (r, n, th, d, hole = 0, spokes = 0, rimW = 0) => { const geo = new THREE.ExtrudeGeometry(gearShape(r, n, th, hole, spokes, rimW), { depth: d, bevelEnabled: true, bevelSize: Math.min(0.0008, d * 0.2), bevelThickness: Math.min(0.0008, d * 0.2), bevelSegments: 1, curveSegments: 6 }); geo.translate(0, 0, -d / 2); return geo; };

// ---------- Máquina de vapor de Watt (modelo de balancín) ----------
BUILDERS_C.maquina_vapor_watt = () => {
  const g = new THREE.Group();
  const wal = woodM('watt_base', '#4a2410', { rx: 2, ry: 2, rough: 0.35 });
  const green = mat(0x2c4a32, { roughness: 0.35, metalness: 0.3, env: true, envI: 0.6 });
  const iron = mat(0x2a2826, { roughness: 0.45, metalness: 0.7, env: true });
  const br = metal(0xd2a650, 0.22), steel = C.steel();
  // base de madera y lecho de sillería
  RB(g, 0.66, 0.04, 0.34, 0.008, wal, 0, 0.02, 0);
  RB(g, 0.62, 0.012, 0.3, 0.003, wal, 0, 0.046, 0);
  const stone = mat(0xffffff, { map: rep(canvasTex('C_sillar', 256, 256, (c, w, h) => { c.fillStyle = '#b8ab92'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(70,60,45,0.7)'; c.lineWidth = 3; for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); for (let x = (y / 64) % 2 * 64; x < w; x += 128) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 64); c.stroke(); } } const R = rng(2); for (let i = 0; i < 2000; i++) { c.fillStyle = `rgba(0,0,0,${R() * 0.1})`; c.fillRect(R() * w, R() * h, 2, 2); } }, true), 2, 1), roughness: 0.9 });
  RB(g, 0.18, 0.05, 0.16, 0.004, stone, -0.18, 0.077, 0);
  // cilindro de vapor con bridas
  const xc = -0.18, y1 = 0.102;
  lathe(g, [[0, 0], [0.058, 0], [0.058, 0.012], [0.048, 0.014], [0.048, 0.16], [0.058, 0.162], [0.058, 0.174], [0.03, 0.18], [0.012, 0.184], [0, 0.184]], green, xc, y1, 0, 0, 0, 0, 40);
  const bolts = []; for (const yy of [0.006, 0.168]) for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; bolts.push(gx(new THREE.CylinderGeometry(0.003, 0.003, 0.016, 6), xc + Math.cos(a) * 0.053, y1 + yy, Math.sin(a) * 0.053)); }
  merged(g, bolts, br);
  for (const yy of [0.04, 0.12]) lathe(g, [[0.048, yy - 0.004], [0.051, yy - 0.003], [0.051, yy + 0.003], [0.048, yy + 0.004]], br, xc, y1, 0, 0, 0, 0, 40);
  // caja de válvulas y tubería de vapor
  RB(g, 0.03, 0.12, 0.05, 0.004, green, xc - 0.07, y1 + 0.08, 0);
  TU(g, [[xc - 0.07, y1 + 0.14, 0], [xc - 0.07, y1 + 0.2, 0], [xc - 0.12, y1 + 0.22, 0], [xc - 0.25, y1 + 0.2, 0]], 0.01, C.copper(), false, 24);
  // vástago del pistón
  const yb = 0.43;
  CY(g, 0.005, 0.005, yb - y1 - 0.18, C.chrome(), xc, y1 + 0.18 + (yb - y1 - 0.18) / 2 - 0.01, 0, 0, 0, 0, 12);
  // columnas dóricas que sostienen el balancín
  const col = []; for (const z of [-0.06, 0.06]) col.push(gx(latheGeo([[0.03, 0], [0.03, 0.012], [0.022, 0.016], [0.02, 0.02], [0.018, yb - 0.08], [0.022, yb - 0.075], [0.03, yb - 0.07], [0.03, yb - 0.06], [0, yb - 0.06]], 24), 0, 0.052, z));
  merged(g, col, green);
  RB(g, 0.08, 0.016, 0.16, 0.004, green, 0, yb - 0.018, 0);
  // balancín de vientre de pez calado (dos placas)
  const beamS = sp([[-0.26, -0.012], [-0.12, -0.032], [0, -0.04], [0.12, -0.032], [0.26, -0.012], [0.26, 0.012], [0.12, 0.022], [0, 0.026], [-0.12, 0.022], [-0.26, 0.012]]);
  for (const x of [-0.17, -0.09, 0.09, 0.17]) beamS.holes.push(spPath([[x - 0.03, 0], [x, -0.012 - Math.abs(x) * -0.02], [x + 0.03, 0], [x, 0.008]]));
  for (const z of [-0.016, 0.016]) EXS(g, beamS, 0.007, iron, 0, yb, z, 0, 0, 0, 0.0015);
  CY(g, 0.008, 0.008, 0.07, br, 0, yb, 0, PI / 2, 0, 0, 16);
  for (const x of [-0.26, 0.26]) CY(g, 0.005, 0.005, 0.05, br, x, yb, 0, PI / 2, 0, 0, 12);
  // movimiento paralelo (eslabones)
  for (const z of [-0.022, 0.022]) { B(g, 0.006, 0.05, 0.004, steel, xc + 0.005, yb - 0.02, z); B(g, 0.07, 0.006, 0.004, steel, xc + 0.04, yb - 0.04, z, 0, 0, -0.2); }
  // volante con radios curvos
  const xf = 0.3, yf = 0.2, zf = -0.1, Rf = 0.15;
  const fw = grp(g, xf, yf, zf);
  add(fw, bandGeo(Rf - 0.014, 0.022, 0.014, 96), iron, 0, 0, 0, PI / 2, 0, 0);
  const spk = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; const p = (t, off) => [Math.cos(a + off) * t, Math.sin(a + off) * t, 0]; spk.push(swGeo([p(0.02, 0), p(0.06, 0.08), p(0.1, 0.1), p(Rf - 0.012, 0.06)], [0.008, 0.0065, 0.006, 0.008], 8, 12, 0.7)); }
  spk.push(gx(latheGeo([[0, -0.02], [0.025, -0.02], [0.025, 0.02], [0, 0.02]], 24), 0, 0, 0, PI / 2));
  merged(fw, spk, iron);
  CY(g, 0.008, 0.008, 0.2, steel, xf, yf, 0, PI / 2, 0, 0, 12);
  // soportes en A del eje
  for (const z of [-0.14, 0.06]) EXS(g, poly([[-0.06, 0], [0.06, 0], [0.012, yf - 0.03], [0.012, yf - 0.035 + 0.02], [-0.012, yf - 0.035 + 0.02], [-0.012, yf - 0.03]]), 0.014, green, xf, 0.052, z, 0, 0, 0, 0.003);
  // engranaje sol y planeta
  add(g, gearGeo(0.04, 24, 0.006, 0.012, 0.008), br, xf, yf, 0.02);
  add(g, gearGeo(0.04, 24, 0.006, 0.012, 0.006), br, xf + 0.075, yf + 0.03, 0.02, 0, 0, 0.2);
  // biela del balancín al planeta
  const rodA = [0.26, yb, 0.02], rodB = [xf + 0.075, yf + 0.03, 0.02];
  add(g, swGeo([rodA, [(rodA[0] + rodB[0]) / 2, (rodA[1] + rodB[1]) / 2, 0.02], rodB], [0.006, 0.009, 0.006], 8, 12), iron);
  // regulador centrífugo
  const xg = 0.14, zg = 0.1;
  lathe(g, [[0, 0.052], [0.022, 0.052], [0.016, 0.07], [0.008, 0.08], [0.006, 0.26], [0.01, 0.27], [0, 0.275]], br, xg, 0, zg, 0, 0, 0, 20);
  const gov = []; for (const s of [-1, 1]) { gov.push(tubeGeo([[xg, 0.262, zg], [xg + s * 0.04, 0.21, zg]], 0.0022, 6, 6)); gov.push(tubeGeo([[xg, 0.2, zg], [xg + s * 0.035, 0.212, zg]], 0.0018, 6, 6)); }
  merged(g, gov, steel);
  for (const s of [-1, 1]) SP(g, 0.016, br, xg + s * 0.046, 0.204, zg, 1, 1, 1, 20);
  lathe(g, [[0.006, 0.195], [0.012, 0.195], [0.012, 0.205], [0.006, 0.205]], br, xg, 0, zg, 0, 0, 0, 16);
  plaque(g, 'BOULTON & WATT', 'Soho, Birmingham · 1788', 0.12, 0.02, 0, 0.02, 0.1705, 0, 0);
  return g;
};

// ---------- Gramófono de corneta dorada ----------
BUILDERS_C.gramofono_dorado = () => {
  const g = new THREE.Group();
  const mah = woodM('gram_caoba', '#5a1e0c', { rx: 3, ry: 3, rough: 0.25, envI: 0.7 });
  const gd = goldD();
  const W = 0.32, Hb = 0.14;
  // caja con zócalo y cornisa
  RB(g, W + 0.02, 0.018, W + 0.02, 0.005, mah, 0, 0.009, 0);
  RB(g, W, Hb, W, 0.006, mah, 0, 0.018 + Hb / 2, 0);
  RB(g, W + 0.016, 0.014, W + 0.016, 0.005, mah, 0, 0.018 + Hb + 0.007, 0);
  // panel frontal con marquetería dorada
  const fret = canvasTex('C_gram_panel', 512, 256, (c, w, h) => {
    c.fillStyle = '#5a1e0c'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#e0b84a'; c.lineWidth = 6; c.strokeRect(20, 20, w - 40, h - 40);
    c.lineWidth = 3;
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(w / 2, h / 2); c.bezierCurveTo(w / 2 + s * 60, h * 0.15, w / 2 + s * 160, h * 0.2, w / 2 + s * 200, h / 2); c.bezierCurveTo(w / 2 + s * 160, h * 0.8, w / 2 + s * 60, h * 0.85, w / 2, h / 2); c.stroke(); c.beginPath(); c.arc(w / 2 + s * 130, h / 2, 22, 0, TAU); c.stroke(); }
    c.fillStyle = '#e0b84a'; c.beginPath(); c.arc(w / 2, h / 2, 16, 0, TAU); c.fill();
  });
  P(g, W - 0.04, Hb - 0.04, fret, 0, 0.018 + Hb / 2, W / 2 + 0.0005, 0, 0, 0, { rough: 0.35 });
  // cantoneras doradas y patas de garra
  const cn = []; for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { cn.push(gx(new RoundedBoxGeometry(0.022, Hb + 0.01, 0.022, 2, 0.004), x * W / 2, 0.018 + Hb / 2, z * W / 2)); cn.push(gx(new THREE.SphereGeometry(0.014, 12, 10), x * (W / 2 - 0.01), 0.004, z * (W / 2 - 0.01), 0, 0, 0, [1, 0.6, 1])); }
  merged(g, cn, gold());
  // manivela lateral
  const ytop = 0.018 + Hb + 0.014;
  CY(g, 0.006, 0.006, 0.03, gold(), W / 2 + 0.015, 0.1, 0, 0, 0, PI / 2, 12);
  add(g, swGeo([[W / 2 + 0.03, 0.1, 0], [W / 2 + 0.034, 0.07, 0.01], [W / 2 + 0.036, 0.04, 0.02]], [0.005, 0.004, 0.004], 8, 8), gold());
  lathe(g, smooth([[0, 0], [0.008, 0.002], [0.009, 0.02], [0.006, 0.035], [0, 0.036]], 10), C.darkWood(), W / 2 + 0.036, 0.04, 0.02, 0, 0, -PI / 2, 14);
  // plato con fieltro y disco de 78 rpm
  lathe(g, [[0, 0], [0.13, 0], [0.13, 0.008], [0, 0.008]], mat(0x1e4a2a, { map: velvetTex('fieltro', '#1e4a2a'), roughness: 1 }), 0, ytop, 0.01, 0, 0, 0, 64);
  const rec = canvasTex('C_disco78', 512, 512, (c, w, h) => {
    c.fillStyle = '#111'; c.fillRect(0, 0, w, h);
    for (let r = 90; r < 250; r += 1.6) { c.strokeStyle = `rgba(255,255,255,${0.03 + (r % 5) * 0.012})`; c.beginPath(); c.arc(w / 2, h / 2, r, 0, TAU); c.stroke(); }
    c.fillStyle = '#7a1414'; c.beginPath(); c.arc(w / 2, h / 2, 86, 0, TAU); c.fill();
    c.fillStyle = '#e0c060'; c.font = 'italic bold 28px Georgia'; c.textAlign = 'center'; c.fillText('Danzón', w / 2, h / 2 - 30); c.font = '18px Georgia'; c.fillText('Orquesta Típica', w / 2, h / 2 + 40); c.fillText('78 R.P.M.', w / 2, h / 2 + 62);
  });
  add(g, new THREE.CylinderGeometry(0.125, 0.125, 0.003, 64), [mat(0x111111, { roughness: 0.25 }), mat(0xffffff, { map: rec, roughness: 0.25, env: true, envI: 0.6 }), mat(0x111111)], 0, ytop + 0.0095, 0.01);
  CY(g, 0.003, 0.003, 0.016, C.chrome(), 0, ytop + 0.016, 0.01, 0, 0, 0, 8);
  // brazo/codo que sostiene la corneta
  const bx = 0.12, bz = -0.12;
  lathe(g, smooth([[0, 0], [0.026, 0], [0.022, 0.01], [0.014, 0.02], [0.012, 0.05]], 12), gd, bx, ytop, bz, 0, 0, 0, 24);
  const armPts = [[bx, ytop + 0.05, bz], [bx, ytop + 0.075, bz + 0.02], [bx - 0.05, ytop + 0.08, bz + 0.1], [bx - 0.1, ytop + 0.06, bz + 0.17]];
  add(g, swGeo(armPts, [0.012, 0.011, 0.01, 0.009], 12, 24), gd);
  // diafragma (caja de sonido)
  const sbx = bx - 0.1, sbz = bz + 0.17;
  lathe(g, [[0, -0.006], [0.028, -0.006], [0.03, 0], [0.028, 0.006], [0, 0.006]], gd, sbx, ytop + 0.045, sbz, 0, 0, PI / 2 - 0.2, 32);
  add(g, new THREE.CircleGeometry(0.024, 32), mat(0xd8c8a0, { roughness: 0.2, metalness: 0.3 }), sbx + 0.0062, ytop + 0.045, sbz, 0, PI / 2, 0.0);
  CY(g, 0.0012, 0.0004, 0.03, C.steel(), sbx - 0.004, ytop + 0.025, sbz, 0, 0, 0.3, 6);
  // cuello de la corneta (sube desde el codo) y campana de pétalos
  const neck = [[bx, ytop + 0.05, bz], [bx, ytop + 0.12, bz - 0.02], [bx - 0.02, ytop + 0.22, bz - 0.02], [bx - 0.06, ytop + 0.3, bz + 0.02]];
  add(g, swGeo(neck, [0.014, 0.018, 0.026, 0.036], 16, 24), gd);
  const hornG = new THREE.LatheGeometry(smooth([[0.034, 0], [0.04, 0.06], [0.06, 0.14], [0.1, 0.22], [0.16, 0.28], [0.22, 0.31], [0.25, 0.315]], 40).map(([a, b]) => new THREE.Vector2(a, b)), 120);
  const hp = hornG.attributes.position;
  for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i); const r = Math.hypot(x, z), ph = Math.atan2(z, x); const k = 1 + Math.pow(y / 0.315, 2) * 0.06 * Math.cos(ph * 10); hp.setXYZ(i, x * k, y, z * k); }
  hornG.computeVertexNormals();
  const horn = grp(g, bx - 0.06, ytop + 0.3, bz + 0.02);
  horn.lookAt(new THREE.Vector3(bx - 0.06 - 0.2, ytop + 0.3 + 0.35, bz + 0.02 + 1.0));
  const hm = add(horn, hornG, gd, 0, 0, 0, PI / 2, 0, 0);
  // costillas de los pétalos
  const ribs = []; for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + PI / 10; const pts = smooth([[0.04, 0.06], [0.06, 0.14], [0.1, 0.22], [0.16, 0.28], [0.22, 0.31], [0.25, 0.315]], 10).map(([r, y]) => { const k = 1 - Math.pow(y / 0.315, 2) * 0.06; return [Math.cos(a) * r * k, y, Math.sin(a) * r * k]; }); ribs.push(tubeGeo(pts, 0.0022, 20, 5)); }
  ribs.push(new THREE.TorusGeometry(0.25, 0.005, 8, 120).rotateX(PI / 2).translate(0, 0.315, 0));
  const rm = merged(horn, ribs, gold(0.18)); rm.rotation.x = PI / 2;
  return ground(g);
};

// ---------- Saxofón tenor chapado en oro ----------
BUILDERS_C.saxofon_oro_grabado = () => {
  const g = new THREE.Group();
  const gd = metal(0xe4b452, 0.18);
  const engr = mat(0xffffff, { map: engraveTex('sax_bell', '#e0b050', 'rgba(90,55,10,0.6)', { w: 1024, h: 256, density: 1.6, border: false }), metalness: 1, roughness: 0.22, side: THREE.DoubleSide });
  const S = grp(g, 0, 0.07, 0, 0, -0.5, 0);
  // cuerpo cónico en J
  const body = [[0, 0.66, 0], [0, 0.5, 0], [0, 0.32, 0.002], [0.004, 0.16, 0.004], [0.03, 0.07, 0.006], [0.085, 0.06, 0.006], [0.115, 0.11, 0.004], [0.125, 0.2, 0]];
  add(S, swGeo(body, (t) => 0.016 + t * t * 0.03 + t * 0.008, 24, 64), gd);
  // campana grabada
  const bell = latheGeo(smooth([[0.054, 0], [0.056, 0.03], [0.062, 0.07], [0.075, 0.1], [0.09, 0.115], [0.094, 0.12]], 24), 64);
  add(S, bell, engr, 0.125, 0.195, 0, 0, 0, -0.08);
  TO(S, 0.093, 0.0035, gd, 0.125 - 0.0097, 0.195 + 0.119, 0, PI / 2, 0, 0.08, TAU, 64);
  // tudel y boquilla
  const neck = [[0, 0.655, 0], [0, 0.7, 0.004], [0.0, 0.73, 0.03], [0, 0.735, 0.07], [0, 0.73, 0.1]];
  add(S, swGeo(neck, [0.0135, 0.012, 0.0105, 0.009, 0.0085], 14, 24), gd);
  lathe(S, smooth([[0.0085, 0], [0.0105, 0.01], [0.011, 0.03], [0.008, 0.05], [0.004, 0.058], [0, 0.06]], 14), mat(0x111111, { roughness: 0.2, env: true, envI: 0.6 }), 0, 0.729, 0.1, PI / 2 + 0.1, 0, 0, 20);
  CY(S, 0.0105, 0.0105, 0.012, C.silver(), 0, 0.729, 0.112, PI / 2 + 0.1, 0, 0, 16);
  // zapatillas (tapas de llaves) y botones de nácar en el frente del cuerpo
  const cups = [], pearls = [], rods = [], curve = new THREE.CatmullRomCurve3(body.map(p => new THREE.Vector3(...p)));
  for (let i = 0; i < 20; i++) {
    const t = 0.08 + i / 20 * 0.85, pt = curve.getPointAt(t), r = 0.016 + t * t * 0.03 + t * 0.008;
    const tan = curve.getTangentAt(t);
    const side = i % 3 === 0 ? -1 : 1;
    const n = new THREE.Vector3(0, 0, 1).applyAxisAngle(tan, side * 0.6).normalize();
    const pos = pt.clone().addScaledVector(n, r + 0.004);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    const cg = latheGeo([[0, 0.004], [0.011 + t * 0.006, 0.004], [0.012 + t * 0.006, 0], [0.011 + t * 0.006, -0.004], [0, -0.004]], 16);
    cg.applyQuaternion(q); cg.translate(pos.x, pos.y, pos.z); cups.push(cg);
    rods.push(new THREE.CylinderGeometry(0.0014, 0.0014, 0.03, 6).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tan)).translate(pos.x + n.x * 0.004 + 0.012, pos.y, pos.z + n.z * 0.004));
  }
  // botones de dedos (nácar)
  for (let i = 0; i < 6; i++) { const t = 0.12 + i * 0.07, pt = curve.getPointAt(t); const pg = new THREE.CylinderGeometry(0.0065, 0.0065, 0.004, 16); pg.rotateX(PI / 2); pg.translate(pt.x - 0.002, pt.y, pt.z + 0.032 + t * 0.01); pearls.push(pg); }
  merged(S, cups, gd); merged(S, rods, gd);
  merged(S, pearls, mat(0xf4eee4, { roughness: 0.15, env: true, envI: 1.2, metalness: 0.2 }));
  // protector de llaves y abrazadera del arco
  TU(S, [[0.02, 0.09, 0.03], [0.05, 0.06, 0.05], [0.09, 0.07, 0.045], [0.11, 0.12, 0.03]], 0.0025, gd, false, 24);
  TO(S, 0.04, 0.004, gd, 0.04, 0.1, 0.006, 0, 0, 0, TAU, 32).scale.set(1, 0.6, 1);
  // atril de exhibición
  const blk = mat(0x161616, { roughness: 0.35, env: true, envI: 0.5 });
  lathe(g, smooth([[0, 0], [0.13, 0], [0.13, 0.012], [0.11, 0.02], [0.03, 0.026], [0, 0.026]], 20), blk, 0, 0, 0, 0, 0, 0, 56);
  lathe(g, [[0.008, 0.02], [0.008, 0.45], [0.012, 0.46], [0, 0.465]], C.chrome(), 0.0, 0, -0.04, 0, 0, 0, 16);
  add(g, new THREE.TorusGeometry(0.06, 0.006, 8, 32, PI), C.rubber(), 0.0, 0.11, 0.0, PI / 2 + 0.2, 0, 0);
  CY(g, 0.006, 0.006, 0.05, C.chrome(), 0, 0.11, -0.02, PI / 2, 0, 0, 8);
  TU(g, [[0, 0.42, -0.04], [0, 0.44, -0.01], [0, 0.42, 0.01]], 0.005, C.rubber(), false, 12);
  plaque(g, 'TENOR · BAÑO DE ORO 24K', 'Big band · 1944', 0.09, 0.016, 0, 0.016, 0.122, -0.4, 0);
  return ground(g);
};

// ---------- Escudo vikingo ----------
BUILDERS_C.escudo_vikingo = () => {
  const g = new THREE.Group();
  const face = canvasTex('C_escudo', 1024, 1024, (c, w, h) => {
    const cx = w / 2, cy = h / 2;
    const R = rng(91);
    // tablas
    for (let i = 0; i < 7; i++) { c.fillStyle = `hsl(32, 35%, ${50 + R() * 8}%)`; c.fillRect(i * w / 7, 0, w / 7, h); }
    // pintura: espiral de cuatro brazos rojo / crema (estilo Gokstad)
    for (let k = 0; k < 8; k++) {
      c.fillStyle = k % 2 ? '#e8d8a8' : '#9a2018';
      c.beginPath(); c.moveTo(cx, cy);
      for (let t = 0; t <= 1.001; t += 0.05) { const a = k / 8 * TAU + t * 0.9, r = t * w * 0.5; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      for (let t = 1; t >= 0; t -= 0.05) { const a = (k + 1) / 8 * TAU + t * 0.9, r = t * w * 0.5; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
      c.fill();
    }
    // juntas de tablas y desgaste
    c.strokeStyle = 'rgba(40,20,5,0.6)'; c.lineWidth = 3; for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(i * w / 7 + (R() - 0.5) * 4, 0); c.lineTo(i * w / 7, h); c.stroke(); }
    for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(150,110,60,${R() * 0.5})`; c.beginPath(); c.ellipse(R() * w, R() * h, 2 + R() * 20, 1 + R() * 4, (R() - 0.5) * 0.3 + PI / 2, 0, TAU); c.fill(); }
    for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(30,15,5,${R() * 0.4})`; c.lineWidth = 1; const x = R() * w, y = R() * h; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (R() - 0.5) * 60, y + (R() - 0.5) * 20); c.stroke(); }
    for (let i = 0; i < 300; i++) { c.strokeStyle = `rgba(60,30,10,0.12)`; const x = R() * w; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (R() - 0.5) * 8, h); c.stroke(); }
  });
  const Rr = 0.4;
  const S = grp(g, 0, 0.47, 0.03, -0.2, 0, 0);
  add(S, new THREE.CylinderGeometry(Rr, Rr, 0.012, 96), [woodM('escudo_canto', '#7a5a34'), mat(0xffffff, { map: face, roughness: 0.75 }), woodM('escudo_dorso', '#8a6a40', { rx: 1, ry: 1 })], 0, 0, 0, PI / 2, 0, 0);
  // borde de cuero crudo cosido
  const rawhide = canvasTex('C_cuero_crudo', 1024, 32, (c, w, h) => { c.fillStyle = '#b89a6a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#5a3a1a'; c.lineWidth = 2; for (let x = 0; x < w; x += 12) { c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 6, h - 4); c.stroke(); } }, true);
  add(S, new THREE.TorusGeometry(Rr, 0.009, 10, 128), mat(0xffffff, { map: rep(rawhide, 8, 1), roughness: 0.8 }), 0, 0, 0);
  // umbo de hierro con pestaña remachada
  const iron = mat(0x3a3836, { metalness: 0.75, roughness: 0.45, env: true });
  lathe(S, smooth([[0.095, 0], [0.096, 0.004], [0.075, 0.006], [0.07, 0.03], [0.064, 0.05], [0.045, 0.075], [0.02, 0.085], [0, 0.087]], 30), iron, 0, 0, 0.006, PI / 2, 0, 0, 48);
  const riv = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; riv.push(gx(new THREE.SphereGeometry(0.008, 10, 6, 0, TAU, 0, PI / 2), Math.cos(a) * 0.084, Math.sin(a) * 0.084, 0.01, PI / 2)); }
  for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; riv.push(gx(new THREE.SphereGeometry(0.0045, 8, 5, 0, TAU, 0, PI / 2), Math.cos(a) * (Rr - 0.03), Math.sin(a) * (Rr - 0.03), 0.006, PI / 2)); }
  merged(S, riv, iron);
  // empuñadura trasera
  RB(S, 0.5, 0.04, 0.015, 0.006, woodM('escudo_asa', '#6a4a24'), 0, 0, -0.014);
  // caballete de exhibición
  const oak = woodM('caballete', '#3a2010', { rough: 0.4 });
  for (const s of [-1, 1]) RB(g, 0.04, 0.03, 0.34, 0.008, oak, s * 0.2, 0.015, 0);
  RB(g, 0.46, 0.03, 0.05, 0.008, oak, 0, 0.045, 0.04);
  RB(g, 0.46, 0.035, 0.035, 0.008, oak, 0, 0.07, 0.07);
  add(g, swGeo([[0, 0.03, -0.14], [0, 0.3, -0.07], [0, 0.6, 0.0]], [0.018, 0.016, 0.014], 10, 10, 0.6), oak);
  // hacha barbada apoyada
  const ax = grp(g, 0.3, 0, 0.12, 0, -0.4, 0.12);
  add(ax, swGeo([[0, 0.01, 0], [0, 0.35, 0], [0.005, 0.62, 0]], [0.016, 0.014, 0.015], 10, 12), woodM('hacha_mango', '#6a4a28'));
  EXS(ax, sp([[0.01, 0.56], [0.04, 0.6], [0.11, 0.62], [0.13, 0.55], [0.11, 0.48], [0.06, 0.53], [0.01, 0.53]]), 0.01, mat(0x6a6a68, { metalness: 0.8, roughness: 0.35, env: true }), 0, 0, 0, 0, 0, 0, 0.003);
  plaque(g, 'SKJǪLDR', 'Gokstad · s. IX', 0.08, 0.016, 0, 0.06, 0.088, 0, 0);
  return g;
};

// ---------- Kabuto y menpō ----------
BUILDERS_C.kabuto_menpo = () => {
  const g = new THREE.Group();
  const lacq = mat(0x141210, { roughness: 0.18, metalness: 0.2, env: true, envI: 0.8 });
  const gd = gold(0.25);
  // caja de armadura (karabitsu) laqueada con mon dorado
  const boxT = canvasTex('C_karabitsu', 512, 512, (c, w, h) => {
    c.fillStyle = '#1a0e0a'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#c9a24e'; c.lineWidth = 6; c.strokeRect(18, 18, w - 36, h - 36);
    const cx = w / 2, cy = h / 2; c.fillStyle = '#d8b050';
    c.beginPath(); c.arc(cx, cy, 90, 0, TAU); c.fill(); c.fillStyle = '#1a0e0a'; c.beginPath(); c.arc(cx, cy, 78, 0, TAU); c.fill(); c.fillStyle = '#d8b050';
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU - PI / 2; c.beginPath(); c.arc(cx + Math.cos(a) * 30, cy + Math.sin(a) * 30, 30, a + PI * 0.6, a + PI * 1.9); c.arc(cx + Math.cos(a) * 18, cy + Math.sin(a) * 18, 14, a + PI * 1.9, a + PI * 0.6, true); c.fill(); }
  });
  const boxM = mat(0xffffff, { map: boxT, roughness: 0.2, env: true, envI: 0.6 });
  RB(g, 0.42, 0.26, 0.34, 0.012, [lacq, lacq, lacq, lacq, boxM, lacq], 0, 0.13, 0);
  const metal_ = []; for (const x of [-1, 1]) for (const z of [-1, 1]) metal_.push(gx(new RoundedBoxGeometry(0.04, 0.27, 0.04, 2, 0.006), x * 0.195, 0.13, z * 0.155));
  merged(g, metal_, gd);
  // tela de base (fukusa) roja
  RB(g, 0.3, 0.006, 0.26, 0.003, mat(0xffffff, { map: velvetTex('rojo_kab', '#8a1414'), roughness: 1 }), 0, 0.263, 0);
  const K = grp(g, 0, 0.27, 0);
  // cuenco de 62 placas (costillas)
  const bowl = latheGeo(smooth([[0.12, 0], [0.122, 0.04], [0.112, 0.085], [0.088, 0.125], [0.05, 0.15], [0.02, 0.158], [0, 0.16]], 30), 124);
  const bp = bowl.attributes.position;
  for (let i = 0; i < bp.count; i++) { const x = bp.getX(i), y = bp.getY(i), z = bp.getZ(i); const ph = Math.atan2(z, x); const k = 1 + 0.012 * Math.pow(Math.abs(Math.cos(ph * 31)), 8) * (1 - y / 0.16); bp.setXYZ(i, x * k, y, z * k * 1.12); }
  bowl.computeVertexNormals();
  add(K, bowl, lacq, 0, 0.13, 0);
  lathe(K, [[0, 0.155], [0.025, 0.155], [0.022, 0.165], [0.012, 0.17], [0, 0.172]], gd, 0, 0.13, 0, 0, 0, 0, 24); // tehen
  // visera (mabizashi)
  add(K, latheGeo([[0.121, 0.002], [0.14, -0.006], [0.158, -0.018], [0.16, -0.022]], 48, -0.9, 1.8).scale(1, 1, 1.12), lacq, 0, 0.13, 0);
  // shikoro: 5 láminas escalonadas con cordones
  const lace = canvasTex('C_odoshi', 1024, 128, (c, w, h) => {
    c.fillStyle = '#1a1a1a'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#2a4a9a'; for (let x = 0; x < w; x += 16) c.fillRect(x + 4, 0, 8, h);
    c.fillStyle = '#d8b050'; c.fillRect(0, h - 10, w, 6);
  }, true);
  const laceM = mat(0xffffff, { map: rep(lace, 3, 1), roughness: 0.55, side: THREE.DoubleSide });
  for (let i = 0; i < 5; i++) {
    const r0 = 0.125 + i * 0.022, y0 = 0.12 - i * 0.03;
    const gap = 2.7 - i * 0.12;
    const geo = latheGeo([[r0, y0], [r0 + 0.02, y0 - 0.032]], 64, gap / 2, TAU - gap);
    geo.scale(1, 1, 1.12);
    add(K, geo, laceM, 0, 0, 0);
  }
  // fukigaeshi (alas)
  for (const s of [-1, 1]) {
    const fk = sp([[0, 0], [0.05, 0.01], [0.075, 0.04], [0.07, 0.07], [0.03, 0.06], [0, 0.04]]);
    EXS(K, fk, 0.006, lacq, s * 0.13, 0.12, 0.1, 0, s * 0.9, s * 0.2, 0.002);
    add(K, new THREE.CircleGeometry(0.014, 24), gd, s * 0.155, 0.15, 0.115, 0, s * 0.9, 0);
  }
  // kuwagata (cuernos dorados) y maedate de luna
  for (const s of [-1, 1]) add(K, swGeo([[s * 0.015, 0.135, 0.13], [s * 0.04, 0.2, 0.15], [s * 0.07, 0.29, 0.14], [s * 0.08, 0.36, 0.12]], [0.008, 0.007, 0.005, 0.002], 10, 24, 0.35), gd);
  const moon = new THREE.Shape(); moon.absarc(0, 0, 0.05, 0.2, PI - 0.2, false); moon.absarc(0, 0.018, 0.04, PI - 0.4, 0.4, true); moon.closePath();
  EXS(K, moon, 0.004, gd, 0, 0.17, 0.14, -0.2, 0, 0, 0.001);
  RB(K, 0.04, 0.03, 0.01, 0.004, gd, 0, 0.14, 0.13, -0.2);
  // menpō: máscara roja con nariz, bigote y barbilla
  const red = mat(0x8a1a12, { roughness: 0.25, env: true, envI: 0.7 });
  const mk = new THREE.SphereGeometry(0.11, 48, 24, PI / 2 - 0.95, 1.9, PI * 0.5, PI * 0.36);
  const mp = mk.attributes.position; for (let i = 0; i < mp.count; i++) { const x = mp.getX(i), y = mp.getY(i), z = mp.getZ(i); mp.setXYZ(i, x * 0.95, y * 1.1, z * 1.18 + (y < -0.06 ? (y + 0.06) * 0.4 : 0)); }
  mk.computeVertexNormals();
  add(K, mk, mat(0x8a1a12, { roughness: 0.25, env: true, envI: 0.7, side: THREE.DoubleSide }), 0, 0.12, 0);
  add(K, swGeo([[0, 0.1, 0.12], [0, 0.08, 0.14], [0, 0.065, 0.142]], [0.008, 0.014, 0.012], 10, 10), red);
  const hair = mat(0xe8e4dc, { roughness: 0.9 });
  for (const s of [-1, 1]) add(K, swGeo([[s * 0.005, 0.056, 0.14], [s * 0.03, 0.05, 0.132], [s * 0.05, 0.04, 0.115], [s * 0.06, 0.025, 0.1]], [0.005, 0.006, 0.004, 0.0015], 8, 16), hair);
  add(K, swGeo([[0, 0.03, 0.12], [0, 0.0, 0.11], [0, -0.03, 0.095]], [0.008, 0.009, 0.003], 8, 10), hair);
  // nodowa (gorguera) de láminas
  for (let i = 0; i < 3; i++) add(K, latheGeo([[0.08 + i * 0.008, -0.02 - i * 0.018], [0.09 + i * 0.008, -0.04 - i * 0.018]], 48, -1.1, 2.2).scale(1, 1, 1.15), laceM, 0, 0.12, 0);
  // soporte interior (cabeza de madera)
  lathe(K, smooth([[0, -0.01], [0.06, -0.008], [0.09, 0.05], [0.1, 0.12], [0.08, 0.2], [0, 0.24]], 20), C.darkWood(), 0, 0, -0.01, 0, 0, 0, 24);
  return ground(g);
};

// ---------- Tabla de surf de madera maciza ----------
BUILDERS_C.tabla_surf_madera_1920 = () => {
  const g = new THREE.Group();
  const L = 2.9, Wd = 0.56, T = 0.07;
  const planks = canvasTex('C_secoya', 256, 2048, (c, w, h) => {
    const cols = ['#8a3a1e', '#a4512a', '#7a321a', '#b86a3a', '#93422a', '#a85a2e', '#82361c'];
    const n = 7;
    for (let i = 0; i < n; i++) { c.fillStyle = cols[i]; c.fillRect(i * w / n, 0, w / n + 1, h); }
    const R = rng(51);
    for (let i = 0; i < 220; i++) { const x = R() * w; c.strokeStyle = `rgba(${R() < 0.5 ? '40,10,0' : '255,200,150'},${0.06 + R() * 0.1})`; c.lineWidth = 0.5 + R() * 2; c.beginPath(); for (let y = 0; y <= h; y += 32) c.lineTo(x + Math.sin(y * 0.004 + i) * 3, y); c.stroke(); }
    c.fillStyle = 'rgba(30,10,0,0.7)'; for (let i = 1; i < n; i++) c.fillRect(i * w / n - 1, 0, 2, h);
    // calcomanía
    c.save(); c.translate(w / 2, h * 0.3); c.rotate(-PI / 2); c.fillStyle = 'rgba(245,230,190,0.85)'; c.font = 'bold 40px Georgia'; c.textAlign = 'center'; c.fillText('WAIKĪKĪ · 1925', 0, 12); c.restore();
  });
  // contorno (nariz redonda, cola casi recta)
  const half = [[0, -L / 2], [Wd * 0.38, -L / 2 + 0.01], [Wd * 0.47, -L / 2 + 0.25], [Wd * 0.5, -0.2], [Wd * 0.49, 0.5], [Wd * 0.4, L / 2 - 0.35], [Wd * 0.22, L / 2 - 0.08], [0, L / 2]];
  const outline = sp(mirror(half));
  const geo = new THREE.ExtrudeGeometry(outline, { depth: T * 0.4, bevelEnabled: true, bevelThickness: T * 0.3, bevelSize: 0.03, bevelSegments: 6, curveSegments: 48 });
  geo.translate(0, 0, -T * 0.2);
  // uv a partir de la posición (para las tablas)
  const pp = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < pp.count; i++) uv.setXY(i, pp.getX(i) / Wd + 0.5, pp.getY(i) / L + 0.5);
  // ligera curvatura (rocker) en la nariz
  for (let i = 0; i < pp.count; i++) { const y = pp.getY(i); if (y > L * 0.25) pp.setZ(i, pp.getZ(i) + Math.pow((y - L * 0.25) / (L * 0.25), 2) * 0.05); }
  geo.computeVertexNormals();
  const board = add(g, geo, mat(0xffffff, { map: planks, roughness: 0.25, env: true, envI: 0.6 }), 0, 0.45, 0, -PI / 2, 0, PI / 2);
  // caballetes acolchados
  const wal = woodM('caballete_surf', '#3a2010', { rough: 0.45 });
  for (const x of [-0.75, 0.75]) {
    for (const s of [-1, 1]) add(g, swGeo([[x - 0.12 * s * 0, 0.0, s * 0.18], [x, 0.2, s * 0.1], [x, 0.38, s * 0.04]], [0.022, 0.02, 0.018], 8, 8), wal);
    RB(g, 0.08, 0.04, 0.5, 0.01, wal, x, 0.385, 0);
    RB(g, 0.1, 0.03, 0.4, 0.012, mat(0xffffff, { map: velvetTex('verde_surf', '#1e4a2a'), roughness: 1 }), x, 0.405, 0);
    RB(g, 0.06, 0.03, 0.4, 0.008, wal, x, 0.015, 0);
  }
  plaque(g, 'TABLA OLO · SECOYA', 'Hawái · 1925', 0.1, 0.02, 0.75, 0.38, 0.252, 0, 0);
  return ground(g);
};

// ---------- Bicicleta de ruta de acero (1968) ----------
BUILDERS_C.bicicleta_ruta_acero = () => {
  const g = new THREE.Group();
  const paintT = canvasTex('C_bici_pintura', 1024, 64, (c, w, h) => {
    c.fillStyle = '#4fa3c4'; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(0, h * 0.2, w, h * 0.15);
  }, true);
  const paint = mat(0xffffff, { map: paintT, roughness: 0.15, metalness: 0.3, env: true, envI: 0.9 });
  const decalT = canvasTex('C_bici_decal', 1024, 64, (c, w, h) => {
    c.fillStyle = '#4fa3c4'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#f4f0e8'; c.fillRect(w * 0.25, 0, w * 0.5, h);
    c.fillStyle = '#c81e1e'; c.font = 'italic bold 40px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Cóndor', w * 0.5, h * 0.25); c.fillText('Cóndor', w * 0.5, h * 0.75);
    c.fillStyle = '#1a1a1a'; c.fillRect(w * 0.25, 0, 4, h); c.fillRect(w * 0.75 - 4, 0, 4, h);
  });
  const decal = mat(0xffffff, { map: decalT, roughness: 0.15, metalness: 0.3, env: true, envI: 0.9 });
  const chrome = C.chrome(), alu = metal(0xc8ccd0, 0.25), blackR = C.rubber();
  const RA = [-0.5, 0.36], FA = [0.5, 0.36], BB = [-0.07, 0.29], ST = [-0.17, 0.84], HT = [0.38, 0.81], HB = [0.42, 0.66];
  const tube = (a, b, r, m, z1 = 0, z2 = 0, r2 = r) => add(g, swGeo([[a[0], a[1], z1], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (z1 + z2) / 2], [b[0], b[1], z2]], [r, (r + r2) / 2, r2], 14, 8), m);
  const lug = (p, dir, m = chrome) => { const L = 0.035; tube([p[0] - dir[0] * L, p[1] - dir[1] * L], [p[0] + dir[0] * L, p[1] + dir[1] * L], 0.0175, m); };
  const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  // cuadro
  tube(ST, HT, 0.0135, paint); tube(BB, HB, 0.0155, decal); tube(BB, [ST[0] + 0.01, ST[1] + 0.02], 0.0145, paint);
  tube(HB, HT, 0.017, paint);
  for (const s of [-1, 1]) { tube(BB, RA, 0.011, paint, s * 0.02, s * 0.065, 0.007); tube([ST[0] + 0.005, ST[1] - 0.04], RA, 0.009, paint, s * 0.012, s * 0.065, 0.006); }
  // orejetas cromadas
  lug(ST, nrm(ST, HT)); lug(HT, nrm(HT, HB)); lug(HB, nrm(HB, HT)); lug([ST[0] + 0.003, ST[1] - 0.04], nrm(BB, ST));
  lathe(g, [[0, -0.04], [0.022, -0.04], [0.024, -0.03], [0.024, 0.03], [0.022, 0.04], [0, 0.04]], chrome, BB[0], BB[1], 0, PI / 2, 0, 0, 24);
  for (const s of [-1, 1]) { lathe(g, [[0, -0.006], [0.012, -0.006], [0.012, 0.006], [0, 0.006]], chrome, RA[0], RA[1], s * 0.065, PI / 2, 0, 0, 12); }
  // horquilla con corona cromada
  lathe(g, [[0.017, -0.02], [0.03, -0.012], [0.03, 0.0], [0.017, 0.006]], chrome, HB[0], HB[1] - 0.012, 0, 0, 0, -0.42, 20);
  for (const s of [-1, 1]) add(g, swGeo([[HB[0] + 0.006, HB[1] - 0.02, s * 0.025], [HB[0] + 0.035, HB[1] - 0.12, s * 0.05], [FA[0] - 0.005, FA[1] + 0.05, s * 0.055], [FA[0], FA[1], s * 0.055]], [0.012, 0.011, 0.008, 0.006], 10, 16), paint);
  // ruedas: llanta, tubular de seda, radios y maza
  const wheel = (cx, cy, rear) => {
    const W = grp(g, cx, cy, 0);
    add(W, bandGeo(0.3, 0.02, 0.012, 96), alu, 0, 0, 0, PI / 2, 0, 0);
    add(W, new THREE.TorusGeometry(0.324, 0.012, 10, 96), mat(0x1a1a1a, { roughness: 0.85 }));
    add(W, new THREE.TorusGeometry(0.318, 0.0105, 8, 96), mat(0xc8a06a, { roughness: 0.7 }));
    lathe(W, smooth([[0, -0.05], [0.012, -0.05], [0.022, -0.04], [0.009, -0.03], [0.009, 0.03], [0.022, 0.04], [0.012, 0.05], [0, 0.05]], 20), chrome, 0, 0, 0, PI / 2, 0, 0, 20);
    const sp_ = [];
    for (let i = 0; i < 36; i++) {
      const side = i % 2 ? 1 : -1, a = i / 36 * TAU, a2 = a + (i % 4 < 2 ? 0.45 : -0.45);
      const p1 = new THREE.Vector3(Math.cos(a) * 0.02, Math.sin(a) * 0.02, side * 0.038), p2 = new THREE.Vector3(Math.cos(a2) * 0.3, Math.sin(a2) * 0.3, side * 0.004);
      const d = p2.clone().sub(p1), len = d.length();
      const cg = new THREE.CylinderGeometry(0.0009, 0.0009, len, 4); cg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize())); cg.translate((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, (p1.z + p2.z) / 2);
      sp_.push(cg);
    }
    merged(W, sp_, chrome);
    if (rear) { const cogs = []; for (let k = 0; k < 5; k++) cogs.push(gearGeo(0.026 + k * 0.005, 14 + k * 2, 0.003, 0.002, 0.008).translate(0, 0, -0.045 + k * 0.004)); merged(W, cogs, chrome); }
    // cierre rápido
    lathe(W, [[0, 0], [0.008, 0], [0.008, 0.004], [0, 0.006]], chrome, 0, 0, 0.055, PI / 2, 0, 0, 12);
    add(W, swGeo([[0, 0, 0.06], [0.02, -0.01, 0.062], [0.045, -0.02, 0.064]], [0.004, 0.004, 0.005], 6, 6, 0.5), chrome);
  };
  wheel(RA[0], RA[1], true); wheel(FA[0], FA[1], false);
  // plato de 52 dientes calado, bielas y pedales con calapiés
  const ring = add(g, gearGeo(0.1, 52, 0.006, 0.004, 0.025, 5, 0.012), chrome, BB[0], BB[1], 0.05);
  const crankA = (s, ang) => {
    const cg = grp(g, BB[0], BB[1], s * 0.058, 0, 0, ang);
    EX(cg, [[-0.012, 0], [0.012, 0], [0.008, -0.165], [-0.008, -0.165]], 0.01, chrome, 0, 0, 0, 0, 0, 0, 0.003);
    const pd = grp(cg, 0, -0.165, s * 0.04, 0, 0, -ang);
    RB(pd, 0.09, 0.016, 0.06, 0.004, mat(0x222222, { metalness: 0.6, roughness: 0.4 }), 0, 0, 0);
    TU(pd, [[0.045, 0.008, -0.025], [0.08, 0.04, -0.02], [0.095, 0.06, 0], [0.08, 0.04, 0.02], [0.045, 0.008, 0.025]], 0.003, chrome, false, 20);
    TU(pd, [[0.0, 0.01, -0.03], [0.07, 0.07, -0.032], [0.07, 0.07, 0.032], [0.0, 0.01, 0.03]], 0.004, C.leather(0x3a2010), false, 16);
  };
  crankA(1, 0.6); crankA(-1, 0.6 + PI);
  // cadena
  const chainT = canvasTex('C_cadena', 256, 16, (c, w, h) => { c.fillStyle = '#4a4a4a'; c.fillRect(0, 0, w, h); c.fillStyle = '#9a9a9a'; for (let x = 0; x < w; x += 8) { c.fillRect(x, 3, 5, h - 6); } }, true);
  const chain = [];
  for (let i = 0; i <= 20; i++) { const a = PI / 2 + i / 20 * PI; chain.push([BB[0] + Math.cos(a) * -0.098, BB[1] + Math.sin(a) * 0.098, 0.05]); }
  TU(g, [[BB[0], BB[1] + 0.1, 0.048], [RA[0], RA[1] + 0.035, 0.044], [RA[0] - 0.03, RA[1], 0.044], [RA[0], RA[1] - 0.035, 0.044], [RA[0] + 0.06, RA[1] - 0.06, 0.044], [BB[0], BB[1] - 0.1, 0.048]], 0.0035, mat(0xffffff, { map: rep(chainT, 16, 1), metalness: 0.8, roughness: 0.4 }), false, 64);
  // desviador trasero
  RB(g, 0.025, 0.05, 0.012, 0.004, chrome, RA[0] + 0.01, RA[1] - 0.05, 0.06, 0, 0, 0.3);
  // tija y sillín de cuero con remaches
  tube([ST[0], ST[1]], [ST[0] - 0.02, ST[1] + 0.09], 0.012, chrome);
  const saddle = sp([[0, 0.14], [0.012, 0.13], [0.018, 0.08], [0.03, 0.03], [0.07, -0.01], [0.075, -0.04], [0.05, -0.06], [0, -0.065], [-0.05, -0.06], [-0.075, -0.04], [-0.07, -0.01], [-0.03, 0.03], [-0.018, 0.08], [-0.012, 0.13]]);
  const sm = EXS(g, saddle, 0.012, C.leather(0x5a2e14), ST[0] - 0.02, ST[1] + 0.105, 0, -PI / 2, 0, -PI / 2, 0.01);
  const rv = []; for (let i = 0; i < 5; i++) rv.push(gx(new THREE.SphereGeometry(0.004, 8, 6), ST[0] - 0.02 - 0.06, ST[1] + 0.116, -0.05 + i * 0.025));
  merged(g, rv, C.copper());
  // potencia y manillar de ruta con cinta blanca
  const stemTop = [HT[0] - 0.01, HT[1] + 0.05];
  tube(HT, stemTop, 0.012, chrome);
  tube(stemTop, [stemTop[0] + 0.09, stemTop[1] + 0.005], 0.011, chrome);
  const bx = stemTop[0] + 0.09, by = stemTop[1] + 0.005;
  const tape = C.cloth(0xf2eee4);
  for (const s of [-1, 1]) add(g, swGeo([[bx, by, 0], [bx, by, s * 0.12], [bx + 0.03, by, s * 0.2], [bx + 0.09, by - 0.04, s * 0.21], [bx + 0.08, by - 0.12, s * 0.21], [bx + 0.02, by - 0.14, s * 0.21], [bx - 0.03, by - 0.12, s * 0.21]], (t) => t < 0.2 ? 0.0125 : 0.012, 10, 48), tape);
  for (const s of [-1, 1]) { add(g, swGeo([[bx + 0.085, by - 0.035, s * 0.205], [bx + 0.11, by - 0.06, s * 0.205], [bx + 0.11, by - 0.13, s * 0.2]], [0.012, 0.01, 0.006], 10, 12), mat(0xc8a06a, { roughness: 0.6 })); }
  // frenos de pinza
  for (const [x, y] of [[HB[0] + 0.02, HB[1] - 0.03], [ST[0] + 0.03, ST[1] - 0.05]]) EXS(g, sp([[-0.035, 0], [0, 0.015], [0.035, 0], [0.03, -0.05], [0.02, -0.01], [-0.02, -0.01], [-0.03, -0.05]]), 0.012, chrome, x + 0.015, y, 0, 0, PI / 2, 0, 0.002);
  // base de exhibición
  const wal = woodM('bici_base', '#4a2810', { rx: 2, ry: 2 });
  RB(g, 1.25, 0.025, 0.22, 0.006, wal, 0, 0.0125, 0);
  for (const x of [RA[0], FA[0]]) for (const s of [-1, 1]) RB(g, 0.06, 0.03, 0.05, 0.01, wal, x + s * 0.11, 0.04, 0, 0, 0, s * 0.5);
  plaque(g, 'CUADRO DE ACERO · 1968', 'Vuelta Ciclista', 0.1, 0.018, 0, 0.0125, 0.1105, 0, 0);
  return g;
};

// ---------- Escultura de cristal de Murano ----------
BUILDERS_C.escultura_murano_llama = () => {
  const g = new THREE.Group();
  const swirl = canvasTex('C_murano', 512, 1024, (c, w, h) => {
    const gg = c.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#ffb020'); gg.addColorStop(0.35, '#e0401a'); gg.addColorStop(0.7, '#8a1060'); gg.addColorStop(1, '#1a2a9a');
    c.fillStyle = gg; c.fillRect(0, 0, w, h);
    // hilos de lattimo (blanco) en espiral
    for (let k = 0; k < 10; k++) { c.strokeStyle = k % 2 ? 'rgba(255,255,255,0.75)' : 'rgba(20,40,160,0.7)'; c.lineWidth = k % 2 ? 6 : 10; c.beginPath(); for (let y = 0; y <= h; y += 8) c.lineTo(((k / 10) * w + y * 0.9) % w, y); c.stroke(); }
    // aventurina: escamas de oro
    const R = rng(23); for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(255,${200 + R() * 55},${80 + R() * 80},${0.5 + R() * 0.5})`; c.fillRect(R() * w, R() * h, 1 + R() * 3, 1 + R() * 2); }
  }, true);
  const prof = smooth([[0, 0], [0.06, 0.005], [0.085, 0.04], [0.08, 0.1], [0.06, 0.17], [0.045, 0.24], [0.032, 0.31], [0.018, 0.38], [0.006, 0.43], [0, 0.45]], 60);
  const twist = (geo, ribs, amp) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const r = Math.hypot(x, z), ph = Math.atan2(z, x);
      const rr = r * (1 + amp * Math.cos(ph * ribs + y * 22));
      const a = ph + y * 7, bend = Math.sin(y / 0.45 * PI * 1.2) * 0.035 * (y / 0.45);
      p.setXYZ(i, Math.cos(a) * rr + bend, y, Math.sin(a) * rr);
    }
    geo.computeVertexNormals();
    return geo;
  };
  const yb = 0.05;
  // núcleo de color
  const core = twist(latheGeo(prof.map(([r, y]) => [r * 0.62, y * 0.97]), 72), 5, 0.18);
  add(g, core, mat(0xffffff, { map: swirl, roughness: 0.12, env: true, envI: 0.8, emissive: 0x401008, emissiveIntensity: 0.4 }), 0, yb, 0);
  // capa exterior de cristal transparente
  const shell = twist(latheGeo(prof, 72), 5, 0.12);
  const sm = add(g, shell, new THREE.MeshPhysicalMaterial({ color: 0xeaf6ff, roughness: 0.02, transparent: true, opacity: 0.32, clearcoat: 1, envMapIntensity: 1.6, depthWrite: false, side: THREE.DoubleSide }), 0, yb, 0);
  sm.renderOrder = 2; sm.castShadow = false;
  // burbujas
  const R = rng(4), bub = [];
  for (let i = 0; i < 40; i++) { const y = R() * 0.3; const r = 0.04 * (1 - y / 0.45); bub.push(gx(new THREE.SphereGeometry(0.0015 + R() * 0.002, 6, 5), (R() - 0.5) * r, yb + y + 0.02, (R() - 0.5) * r)); }
  const bm = merged(g, bub, mat(0xffffff, { transparent: true, opacity: 0.5, roughness: 0 })); bm.renderOrder = 3;
  // base de cristal negro pulido
  lathe(g, smooth([[0, 0], [0.11, 0], [0.115, 0.008], [0.11, 0.03], [0.095, 0.045], [0.06, 0.052], [0, 0.052]], 30), mat(0x0a0a0c, { roughness: 0.04, env: true, envI: 1.4 }), 0, 0, 0, 0, 0, 0, 64);
  P(g, 0.06, 0.012, labelTex('Murano · Venezia', { bg: '#0a0a0c', fg: '#d8b050', font: 'italic bold 60px Georgia' }), 0, 0.022, 0.1115, -0.32, 0, 0, { rough: 0.2 });
  return g;
};

// ---------- Máquina de escribir chapada en oro ----------
BUILDERS_C.maquina_escribir_oro = () => {
  const g = new THREE.Group();
  const engT = engraveTex('maq_oro', '#e4b85a', 'rgba(110,70,15,0.55)', { w: 512, h: 512, density: 1.2, border: false });
  const gEng = mat(0xffffff, { map: rep(engT, 5, 5), metalness: 1, roughness: 0.22 });
  const gd = metal(0xe8bc5c, 0.18);
  const W = 0.32;
  // cuerpo: perfil lateral extruido a lo ancho
  const side = new THREE.Shape();
  side.moveTo(0.16, 0); side.lineTo(0.16, 0.025); side.lineTo(0.05, 0.075); side.quadraticCurveTo(0.0, 0.095, -0.05, 0.1); side.lineTo(-0.13, 0.11); side.lineTo(-0.14, 0.09); side.lineTo(-0.14, 0); side.closePath();
  EXS(g, side, W, [gEng, gd], 0, 0.004, 0, 0, -PI / 2, 0, 0.006);
  // placa frontal con leyenda
  P(g, 0.2, 0.02, labelTex('EDICIÓN ORO · 1926', { bg: '#1a1208', fg: '#e8c060', font: 'bold 52px Georgia' }), 0, 0.03, 0.0, 0, 0, 0).position.set(0, 0.016, 0.1665);
  // teclas: aros dorados + tapas de nácar con letras (atlas)
  const rows = ['1234567890-', 'QWERTYUIOP½', 'ASDFGHJKLÑ;', 'ZXCVBNM,.?/'];
  const atlas = canvasTex('C_teclas', 1024, 512, (c, w, h) => {
    const cw = w / 11, ch = h / 4;
    for (let r = 0; r < 4; r++) for (let k = 0; k < 11; k++) {
      const x = k * cw, y = r * ch;
      const gg = c.createRadialGradient(x + cw * 0.4, y + ch * 0.4, 2, x + cw / 2, y + ch / 2, cw * 0.6); gg.addColorStop(0, '#fffaf2'); gg.addColorStop(0.6, '#e8e0ee'); gg.addColorStop(1, '#c8d8e0');
      c.fillStyle = gg; c.fillRect(x, y, cw, ch);
      c.fillStyle = '#1a1208'; c.font = 'bold 54px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(rows[r][k], x + cw / 2, y + ch / 2 + 3);
    }
  });
  const rims = [], tops = [], stems = [];
  for (let r = 0; r < 4; r++) for (let k = 0; k < 11; k++) {
    const x = (k - 5) * 0.024 + r * 0.004, z = 0.16 - r * 0.026, y = 0.05 + r * 0.016;
    rims.push(gx(latheGeo([[0.0085, -0.003], [0.0095, -0.003], [0.0095, 0.002], [0.0085, 0.002]], 16), x, y, z));
    stems.push(gx(new THREE.CylinderGeometry(0.0015, 0.0015, 0.03, 5), x, y - 0.015, z - 0.008, -0.5));
    const tg = new THREE.CircleGeometry(0.0085, 20); tg.rotateX(-PI / 2); tg.translate(x, y + 0.0015, z);
    const uv = tg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, (k + uv.getX(i)) / 11, 1 - (r + 1 - uv.getY(i)) / 4);
    tops.push(tg);
  }
  merged(g, rims, gd); merged(g, stems, C.steel());
  merged(g, tops, mat(0xffffff, { map: atlas, roughness: 0.15, env: true, envI: 0.8 }));
  RB(g, 0.14, 0.008, 0.014, 0.003, mat(0xf4eef4, { roughness: 0.15, env: true }), 0.0, 0.04, 0.188);
  // canasta de tipos (abanico) visible
  const bars = []; for (let i = 0; i < 40; i++) { const a = -1.3 + i / 39 * 2.6; bars.push(gx(new THREE.BoxGeometry(0.0018, 0.004, 0.07), Math.sin(a) * 0.06, 0.105, 0.02 - Math.cos(a) * 0.035, 0, a, 0)); }
  merged(g, bars, C.steel());
  // carro: rodillo, perillas, hoja y palanca de retorno
  const yc = 0.15, zc = -0.06;
  CY(g, 0.022, 0.022, 0.36, mat(0x111111, { roughness: 0.5 }), 0, yc, zc, 0, 0, PI / 2, 32);
  for (const s of [-1, 1]) lathe(g, smooth([[0, 0], [0.018, 0], [0.022, 0.008], [0.02, 0.018], [0.014, 0.024], [0, 0.026]], 16), gd, s * 0.18, yc, zc, 0, 0, -s * PI / 2, 24);
  RB(g, 0.4, 0.02, 0.05, 0.005, gEng, 0, yc - 0.03, zc - 0.005);
  const paper = parchmentTex('carta_maq', { w: 512, h: 640, base: '#f4efe2', draw: (c, w, h) => { c.fillStyle = '#1a1a2a'; c.font = '20px Courier New'; ['México, D.F., 3 de marzo de 1926', '', 'Estimado señor:', '', 'Por medio de la presente le', 'confirmo la compra de los', 'terrenos de la colonia Roma', 'por la suma acordada de', 'cien mil pesos oro…'].forEach((t, i) => c.fillText(t, 40, 60 + i * 32)); } });
  const pg = new THREE.PlaneGeometry(0.21, 0.27, 1, 12);
  const pp = pg.attributes.position; for (let i = 0; i < pp.count; i++) { const y = pp.getY(i); const t = (y + 0.135) / 0.27; pp.setZ(i, -t * t * 0.05 - Math.max(0, 0.2 - t) * 0.08); }
  pg.computeVertexNormals();
  add(g, pg, mat(0xffffff, { map: paper, side: THREE.DoubleSide, roughness: 0.9 }), 0, yc + 0.135 + 0.005, zc + 0.025, -0.2, 0, 0);
  add(g, swGeo([[-0.17, yc + 0.02, zc + 0.02], [-0.2, yc + 0.035, zc + 0.05], [-0.235, yc + 0.03, zc + 0.08]], [0.004, 0.0035, 0.005], 8, 10), gd);
  // carretes de cinta
  for (const s of [-1, 1]) { lathe(g, [[0, 0], [0.024, 0], [0.024, 0.004], [0.012, 0.006], [0.012, 0.014], [0.024, 0.016], [0.024, 0.02], [0, 0.02]], gd, s * 0.09, 0.105, -0.02, 0, 0, 0, 24); CY(g, 0.019, 0.019, 0.008, mat(0x2a0a0a, { roughness: 0.6 }), s * 0.09, 0.115, -0.02, 0, 0, 0, 20); }
  // tapete de terciopelo
  RB(g, 0.46, 0.006, 0.4, 0.003, mat(0xffffff, { map: velvetTex('verde_maq', '#1e3a2a'), roughness: 1 }), 0, 0.003, 0.0);
  return ground(g);
};

// ---------- Piano de cola en miniatura ----------
BUILDERS_C.piano_cola_miniatura = () => {
  const g = new THREE.Group();
  const lac = lacquer(0x0b0b0c), gd = gold(0.2);
  // contorno visto desde arriba: x a lo ancho, y hacia atrás (=-z)
  const outlinePts = [[-0.12, 0], [0.12, 0], [0.122, 0.08], [0.11, 0.15], [0.07, 0.2], [0.03, 0.26], [0.0, 0.33], [-0.03, 0.4], [-0.07, 0.44], [-0.11, 0.445], [-0.12, 0.42]];
  const outline = () => { const s = new THREE.Shape(); s.moveTo(-0.12, 0); s.lineTo(0.12, 0); s.splineThru(outlinePts.slice(2).map(([x, y]) => new THREE.Vector2(x, y))); s.lineTo(-0.12, 0); s.closePath(); return s; };
  const yb = 0.11, Hc = 0.055;
  // caja (paredes) con hueco interior
  const walls = outline();
  const inner = new THREE.Path(); inner.moveTo(-0.11, 0.06); inner.lineTo(0.11, 0.06); inner.splineThru([[0.112, 0.09], [0.1, 0.15], [0.062, 0.195], [0.022, 0.255], [-0.006, 0.32], [-0.035, 0.39], [-0.07, 0.43], [-0.105, 0.434], [-0.11, 0.41]].map(([x, y]) => new THREE.Vector2(x, y))); inner.lineTo(-0.11, 0.06); walls.holes.push(inner);
  EXS(g, walls, Hc, lac, 0, yb + Hc / 2, 0, -PI / 2, 0, 0, 0.003);
  // fondo: tabla armónica de abeto con cuerdas y arpa dorada
  const sb = canvasTex('C_tabla_arm', 512, 1024, (c, w, h) => {
    c.fillStyle = '#d8b880'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(120,80,30,0.25)'; for (let x = 0; x < w; x += 9) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 30, h); c.stroke(); }
    c.strokeStyle = 'rgba(230,230,230,0.9)'; c.lineWidth = 1.2; for (let i = 0; i < 70; i++) { const x = 20 + i * 6.5; c.beginPath(); c.moveTo(x, 40); c.lineTo(x * 0.85 - 10, h * (0.25 + i / 70 * 0.7)); c.stroke(); }
  });
  const floor = outline();
  const fg = new THREE.ShapeGeometry(floor, 24); const fu = fg.attributes.uv, fp = fg.attributes.position;
  for (let i = 0; i < fu.count; i++) fu.setXY(i, (fp.getX(i) + 0.12) / 0.244, fp.getY(i) / 0.445);
  add(g, fg, mat(0xffffff, { map: sb, roughness: 0.6 }), 0, yb + 0.0146, 0, -PI / 2, 0, 0);
  EXS(g, outline(), 0.012, lac, 0, yb + 0.006, 0, -PI / 2, 0, 0, 0.002);
  const harp = new THREE.Shape(); harp.moveTo(-0.1, 0.07); harp.lineTo(0.1, 0.07); harp.splineThru([[0.09, 0.15], [0.05, 0.21], [0.0, 0.32], [-0.06, 0.41], [-0.1, 0.42]].map(([x, y]) => new THREE.Vector2(x, y))); harp.closePath();
  for (const [x, y] of [[-0.05, 0.14], [0.03, 0.12], [-0.06, 0.26], [0.0, 0.2]]) harp.holes.push(circ(0.022, x, y, true));
  harp.holes.push(spPath([[-0.09, 0.3], [-0.04, 0.3], [-0.07, 0.38]]));
  EXS(g, harp, 0.004, gd, 0, yb + 0.022, 0, -PI / 2, 0, 0, 0.001);
  // tapa abierta con su vara
  const lidG = grp(g, -0.12, yb + Hc + 0.002, 0, 0, 0, 0.75);
  EXS(lidG, outline(), 0.004, lac, 0.12, 0, 0, -PI / 2, 0, 0, 0.001);
  CY(g, 0.0018, 0.0018, 0.13, gd, 0.08, yb + Hc + 0.06, -0.2, 0, 0, 0.35, 8);
  // teclado: lecho con teclas blancas (textura) y negras fusionadas
  const kT = canvasTex('C_teclado', 1024, 64, (c, w, h) => { c.fillStyle = '#f6f2e8'; c.fillRect(0, 0, w, h); c.fillStyle = '#9a968c'; for (let i = 0; i <= 52; i++) c.fillRect(i * w / 52, 0, 2, h); });
  RB(g, 0.22, 0.008, 0.045, 0.001, [lac, lac, mat(0xffffff, { map: kT, roughness: 0.25 }), lac, lac, lac], 0, yb + 0.026, 0.022);
  const blacks = []; const kw = 0.22 / 52;
  for (let i = 0; i < 51; i++) { const n = (i + 5) % 7; if (n === 2 || n === 6) continue; blacks.push(gx(new THREE.BoxGeometry(kw * 0.55, 0.005, 0.026), -0.11 + (i + 1) * kw, yb + 0.032, 0.012)); }
  merged(g, blacks, mat(0x0a0a0a, { roughness: 0.3 }));
  RB(g, 0.24, 0.022, 0.06, 0.003, lac, 0, yb + 0.012, 0.03);
  for (const s of [-1, 1]) RB(g, 0.012, 0.03, 0.06, 0.003, lac, s * 0.116, yb + 0.03, 0.03);
  // atril calado
  const desk = rrect(0.14, 0.05, 0.004); for (let i = 0; i < 6; i++) desk.holes.push(spPath([[-0.055 + i * 0.022, -0.012], [-0.047 + i * 0.022, 0.0], [-0.055 + i * 0.022, 0.014], [-0.063 + i * 0.022, 0.0]]));
  EXS(g, desk, 0.003, lac, 0, yb + Hc + 0.03, 0.05 - 0.04, -0.3, 0, 0, 0.001);
  // partitura
  P(g, 0.06, 0.04, parchmentTex('part_min', { w: 256, h: 180, base: '#f2ead6', draw: (c, w, h) => { c.strokeStyle = '#333'; for (let k = 0; k < 4; k++) for (let l = 0; l < 5; l++) { c.beginPath(); c.moveTo(10, 20 + k * 40 + l * 5); c.lineTo(w - 10, 20 + k * 40 + l * 5); c.stroke(); } c.fillStyle = '#222'; for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse(20 + (i % 10) * 22, 25 + Math.floor(i / 10) * 40 + (i * 7 % 5) * 3, 3, 2, -0.4, 0, TAU); c.fill(); } } }), 0.0, yb + Hc + 0.032, 0.0125, -0.3, 0, 0);
  // patas torneadas con ruedas y lira de pedales
  const legs = []; for (const [x, z] of [[-0.1, 0.02], [0.1, 0.02], [-0.09, -0.4]]) legs.push(gx(latheGeo(smooth([[0.006, 0], [0.01, 0.006], [0.008, 0.02], [0.012, 0.05], [0.009, 0.08], [0.013, 0.1], [0.016, yb]], 20), 16), x, 0, z));
  merged(g, legs, lac);
  EXS(g, sp([[-0.02, 0], [0.02, 0], [0.025, 0.04], [0.012, yb - 0.01], [-0.012, yb - 0.01], [-0.025, 0.04]]), 0.008, lac, 0, 0, -0.06, 0, 0, 0, 0.002);
  for (let i = -1; i <= 1; i++) RB(g, 0.006, 0.004, 0.02, 0.001, gd, i * 0.01, 0.012, -0.05);
  plaque(g, 'ESCALA 1:6', 'Ebanistería fina', 0.06, 0.014, 0, yb + 0.012, 0.0615, 0, 0);
  return ground(g);
};

// ---------- Gabinete arcade de fibra de vidrio (1971) ----------
BUILDERS_C.gabinete_fibra_1971 = () => {
  const g = new THREE.Group();
  const flake = canvasTex('C_metalflake', 256, 256, (c, w, h) => { c.fillStyle = '#1f5fb0'; c.fillRect(0, 0, w, h); const R = rng(71); for (let i = 0; i < 5000; i++) { const v = R(); c.fillStyle = v < 0.5 ? `rgba(160,210,255,${R() * 0.6})` : `rgba(5,20,60,${R() * 0.5})`; c.fillRect(R() * w, R() * h, 1.5, 1.5); } }, true);
  const fib = mat(0xffffff, { map: rep(flake, 6, 6), roughness: 0.12, metalness: 0.55, env: true, envI: 1.1 });
  // alas laterales (silueta completa) y cuerpo central con el hueco de pantalla
  const wing = sp([[-0.3, 0], [0.26, 0], [0.3, 0.12], [0.26, 0.38], [0.32, 0.62], [0.38, 0.86], [0.32, 1.1], [0.14, 1.28], [-0.1, 1.32], [-0.24, 1.2], [-0.3, 0.9], [-0.33, 0.5], [-0.32, 0.15]]);
  const ex = (shape, d, bev) => { const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.9, bevelSegments: 6, curveSegments: 48 }); geo.translate(0, 0, -d / 2); return geo; };
  for (const s of [-1, 1]) add(g, ex(wing, 0.04, 0.035), fib, s * 0.215, 0, 0, 0, -PI / 2, 0);
  const mid = new THREE.Shape();
  mid.moveTo(-0.3, 0); mid.lineTo(0.24, 0); mid.quadraticCurveTo(0.29, 0.2, 0.28, 0.4); mid.quadraticCurveTo(0.29, 0.6, 0.36, 0.68);
  mid.quadraticCurveTo(0.4, 0.72, 0.34, 0.76); mid.lineTo(0.2, 0.8); mid.quadraticCurveTo(0.12, 0.9, 0.13, 1.04); mid.quadraticCurveTo(0.16, 1.16, 0.3, 1.18);
  mid.quadraticCurveTo(0.3, 1.32, 0.0, 1.33); mid.quadraticCurveTo(-0.26, 1.3, -0.3, 0.9); mid.quadraticCurveTo(-0.34, 0.5, -0.3, 0); mid.closePath();
  add(g, ex(mid, 0.36, 0.03), fib, 0, 0, 0, 0, -PI / 2, 0);
  // pantalla con naves
  const scr = canvasTex('C_space_scr', 512, 384, (c, w, h) => {
    c.fillStyle = '#05070a'; c.fillRect(0, 0, w, h);
    const R = rng(8); for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${R()})`; c.fillRect(R() * w, R() * h, 2, 2); }
    c.fillStyle = '#e8f0ff';
    const ship = (x, y, a) => { c.save(); c.translate(x, y); c.rotate(a); c.beginPath(); c.moveTo(0, -18); c.lineTo(10, 14); c.lineTo(0, 8); c.lineTo(-10, 14); c.closePath(); c.fill(); c.restore(); };
    ship(150, 220, 0.6);
    for (const [x, y] of [[360, 120], [400, 150]]) { c.beginPath(); c.ellipse(x, y, 22, 8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x, y - 6, 10, 7, 0, PI, 0); c.fill(); }
    c.font = 'bold 30px monospace'; c.fillText('03', 30, 40); c.fillText('07', w - 80, 40); c.fillText('1:12', w / 2 - 40, 40);
    c.fillStyle = 'rgba(255,255,255,0.04)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
  });
  add(g, new THREE.PlaneGeometry(0.4, 0.3), mat(0x050505, { roughness: 0.4 }), 0, 0.93, 0.19, -0.15, 0, 0);
  add(g, new THREE.PlaneGeometry(0.3, 0.225), mat(0xffffff, { map: scr, emissive: 0xffffff, emissiveMap: scr, emissiveIntensity: 0.9, roughness: 0.05 }), 0, 0.93, 0.193, -0.15, 0, 0);
  // panel de control con botones
  const panel = mat(0xc8c8c8, { roughness: 0.25, metalness: 0.7, env: true });
  RB(g, 0.34, 0.012, 0.1, 0.004, panel, 0, 0.775, 0.34, 0.28, 0, 0);
  const btn = []; for (let i = 0; i < 4; i++) btn.push(gx(latheGeo([[0, 0], [0.016, 0], [0.016, 0.01], [0.012, 0.016], [0, 0.017]], 16), -0.12 + i * 0.08, 0.78, 0.34, 0.28));
  merged(g, btn, plastic(0xf0f0f0));
  P(g, 0.3, 0.025, labelTex('ROTAR   ROTAR   EMPUJE   DISPARO', { bg: '#c8c8c8', fg: '#1a1a1a', font: 'bold 34px Arial' }), 0, 0.768, 0.385, -PI / 2 + 0.28, 0, 0);
  // ranura de monedas iluminada
  RB(g, 0.08, 0.1, 0.02, 0.006, metal(0xc8c8c8, 0.3), 0, 0.36, 0.33);
  add(g, new THREE.PlaneGeometry(0.012, 0.03), emissive(0xff3020, 1.6), 0.0, 0.38, 0.3405);
  P(g, 0.06, 0.02, labelTex('25¢', { bg: '#c8c8c8', fg: '#c01010', font: 'bold 80px Arial' }), 0, 0.33, 0.3405);
  // marquesina retroiluminada
  const marq = canvasTex('C_marq71', 512, 128, (c, w, h) => { const gg = c.createLinearGradient(0, 0, w, 0); gg.addColorStop(0, '#ff7a20'); gg.addColorStop(1, '#ffd040'); c.fillStyle = gg; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1a40'; c.font = 'italic bold 64px Arial'; c.textAlign = 'center'; c.fillText('ESPACIO 71', w / 2, h / 2 + 22); });
  add(g, new THREE.PlaneGeometry(0.3, 0.06), mat(0xffffff, { map: marq, emissive: 0xffffff, emissiveMap: marq, emissiveIntensity: 0.7 }), 0, 1.14, 0.2, 0.9, 0, 0);
  return ground(g);
};

// ---------- Cinematógrafo de 1895 sobre trípode ----------
BUILDERS_C.cinematografo_1895 = () => {
  const g = new THREE.Group();
  const mah = woodM('cine_caoba', '#7a3a18', { rx: 4, ry: 4, rough: 0.35, envI: 0.6 });
  const br = brass();
  const y0 = 1.0;
  // caja de madera con esquinas de latón
  RB(g, 0.17, 0.2, 0.26, 0.006, mah, 0, y0 + 0.1, 0);
  const cn = []; for (const sx of [-1, 1]) for (const sy of [0, 1]) for (const sz of [-1, 1]) cn.push(gx(new THREE.BoxGeometry(0.02, 0.02, 0.02), sx * 0.08, y0 + 0.01 + sy * 0.18, sz * 0.125));
  merged(g, cn, br);
  // puerta lateral con bisagras y placa
  RB(g, 0.004, 0.16, 0.2, 0.003, mah, 0.087, y0 + 0.1, -0.01);
  for (const z of [-0.08, 0.06]) CY(g, 0.004, 0.004, 0.025, br, 0.089, y0 + 0.1, z, PI / 2, 0, 0, 10);
  P(g, 0.08, 0.03, labelTex('CINÉMATOGRAPHE', { bg: '#c9a24e', fg: '#2a1a08', font: 'bold 52px Georgia', sub: 'Lyon · 1895', subFont: 'italic 34px Georgia', border: '#5a3c10' }), 0.0895, y0 + 0.16, -0.01, 0, PI / 2, 0, { rough: 0.35 });
  // objetivo de latón
  lathe(g, [[0.032, 0], [0.036, 0.004], [0.036, 0.012], [0.028, 0.014], [0.026, 0.05], [0.03, 0.054], [0.03, 0.065], [0.024, 0.066]], br, 0, y0 + 0.1, 0.13, PI / 2, 0, 0, 36);
  add(g, new THREE.CircleGeometry(0.023, 32), mat(0x2a3848, { roughness: 0.02, metalness: 0.6, env: true, envI: 1.5 }), 0, y0 + 0.1, 0.195);
  // carrete de película en la parte superior
  const reel = grp(g, 0, y0 + 0.27, -0.03);
  const rs = new THREE.Shape(); rs.absarc(0, 0, 0.075, 0, TAU, false); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; rs.holes.push(circ(0.018, Math.cos(a) * 0.045, Math.sin(a) * 0.045, true)); } rs.holes.push(circ(0.005, 0, 0, true));
  for (const x of [-0.016, 0.016]) EXS(reel, rs, 0.002, metal(0x3a3a3a, 0.4), x, 0, 0, 0, PI / 2, 0, 0.0005);
  CY(reel, 0.055, 0.055, 0.028, mat(0x2a1a10, { roughness: 0.5 }), 0, 0, 0, 0, 0, PI / 2, 40);
  CY(reel, 0.008, 0.008, 0.04, br, 0, 0, 0, 0, 0, PI / 2, 12);
  RB(g, 0.03, 0.08, 0.015, 0.003, br, 0, y0 + 0.22, -0.03);
  // película que entra a la caja
  add(g, new THREE.PlaneGeometry(0.028, 0.1), mat(0x3a2a18, { roughness: 0.4, side: THREE.DoubleSide }), 0, y0 + 0.24, 0.035, -0.3, PI / 2, 0).rotation.set(0.5, 0, 0);
  // manivela
  CY(g, 0.005, 0.005, 0.03, br, -0.1, y0 + 0.1, -0.05, 0, 0, PI / 2, 10);
  add(g, swGeo([[-0.115, y0 + 0.1, -0.05], [-0.118, y0 + 0.06, -0.06], [-0.12, y0 + 0.03, -0.065]], [0.005, 0.004, 0.004], 8, 8, 0.5), br);
  lathe(g, smooth([[0, 0], [0.007, 0.002], [0.008, 0.02], [0.005, 0.035], [0, 0.036]], 10), C.darkWood(), -0.12, y0 + 0.03, -0.065, 0, 0, PI / 2, 14);
  // cabeza del trípode y patas de madera con herrajes
  RB(g, 0.2, 0.02, 0.28, 0.004, mah, 0, y0 - 0.01, 0);
  lathe(g, [[0, 0], [0.06, 0], [0.06, 0.03], [0.04, 0.035], [0, 0.035]], br, 0, y0 - 0.055, 0, 0, 0, 0, 24);
  const legs = [], fit = [];
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + PI / 2, top = [Math.cos(a) * 0.05, y0 - 0.05, Math.sin(a) * 0.05], foot = [Math.cos(a) * 0.42, 0, Math.sin(a) * 0.42];
    for (const o of [-1, 1]) { const off = [-Math.sin(a) * 0.016 * o, 0, Math.cos(a) * 0.016 * o]; legs.push(swGeo([[top[0] + off[0], top[1], top[2] + off[2]], [(top[0] + foot[0]) / 2 + off[0] * 0.6, (top[1] + foot[1]) / 2, (top[2] + foot[2]) / 2 + off[2] * 0.6], [foot[0] + off[0] * 0.2, 0.04, foot[2] + off[2] * 0.2]], [0.012, 0.011, 0.009], 6, 8, 1)); }
    fit.push(gx(new THREE.ConeGeometry(0.012, 0.045, 10), foot[0], 0.022, foot[2], PI));
    fit.push(gx(new THREE.CylinderGeometry(0.02, 0.02, 0.025, 10), (top[0] * 1 + foot[0] * 0) * 0.4 + foot[0] * 0.6 * 0.6, (top[1]) * 0.6 * 0.6 + 0.0, 0, 0, 0, 0, [0.001, 0.001, 0.001]));
  }
  merged(g, legs, woodM('cine_patas', '#9a6a3a', { rough: 0.5 }));
  merged(g, fit, br);
  return ground(g);
};

// ---------- Servicio de té de plata de Taxco ----------
BUILDERS_C.servicio_te_taxco = () => {
  const g = new THREE.Group();
  const silverT = canvasTex('C_plata_rep', 512, 256, (c, w, h) => {
    c.fillStyle = '#d8dadc'; c.fillRect(0, 0, w, h);
    const R = rng(12);
    for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${R() * 0.06})`; c.fillRect(0, R() * h, w, 1); }
    c.strokeStyle = 'rgba(60,64,70,0.5)'; c.lineWidth = 2;
    for (let k = 0; k < 8; k++) { const x = (k + 0.5) * w / 8; c.beginPath(); c.moveTo(x, h * 0.2); c.bezierCurveTo(x + 30, h * 0.35, x - 30, h * 0.65, x, h * 0.8); c.stroke(); for (let j = 0; j < 4; j++) { c.beginPath(); c.ellipse(x + (j % 2 ? 14 : -14), h * (0.3 + j * 0.13), 10, 4, (j % 2 ? 0.6 : -0.6), 0, TAU); c.stroke(); } }
    c.lineWidth = 3; c.beginPath(); c.moveTo(0, h * 0.1); c.lineTo(w, h * 0.1); c.moveTo(0, h * 0.9); c.lineTo(w, h * 0.9); c.stroke();
  }, true);
  const silver = mat(0xffffff, { map: silverT, metalness: 1, roughness: 0.16 });
  const sil = metal(0xdcdee2, 0.14), ebony = mat(0x14100c, { roughness: 0.3, env: true, envI: 0.5 });
  // charola oval con asas
  const tray = new THREE.Shape(); tray.absellipse(0, 0, 0.26, 0.17, 0, TAU, false, 0);
  EXS(g, tray, 0.006, sil, 0, 0.012, 0, -PI / 2, 0, 0, 0.003);
  const rimPts = []; for (let i = 0; i <= 96; i++) { const a = i / 96 * TAU; rimPts.push([Math.cos(a) * 0.262, 0.024, Math.sin(a) * 0.172]); }
  TU(g, rimPts.slice(0, 96), 0.006, sil, true, 192);
  const gal = []; for (let i = 0; i < 64; i++) { const a = i / 64 * TAU; gal.push(gx(new THREE.SphereGeometry(0.004, 8, 6), Math.cos(a) * 0.262, 0.032, Math.sin(a) * 0.172)); }
  merged(g, gal, sil);
  for (const s of [-1, 1]) { const hh = new THREE.Shape(); hh.absarc(0, 0, 0.035, PI * 0.15, PI * 0.85, false); hh.absarc(0, 0, 0.022, PI * 0.85, PI * 0.15, true); hh.closePath(); EXS(g, hh, 0.006, sil, s * 0.27, 0.024, 0, -PI / 2, 0, s * PI / 2 - PI / 2 + (s > 0 ? PI : 0), 0.002); }
  const feet = []; for (const [x, z] of [[-0.18, -0.1], [0.18, -0.1], [-0.18, 0.1], [0.18, 0.1]]) feet.push(gx(latheGeo(smooth([[0, 0], [0.014, 0], [0.01, 0.006], [0.012, 0.012], [0, 0.013]], 8), 12), x, 0, z));
  merged(g, feet, sil);
  const yt = 0.024;
  // repujado (gallones) para piezas torneadas
  const gadroon = (geo, n, amp) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), y = p.getY(i); const k = 1 + amp * Math.pow(Math.abs(Math.cos(Math.atan2(z, x) * n / 2)), 2); p.setXYZ(i, x * k, y, z * k); } geo.computeVertexNormals(); return geo; };
  // tetera
  const tp = grp(g, 0, yt, -0.03);
  add(tp, gadroon(latheGeo(smooth([[0, 0], [0.04, 0], [0.042, 0.006], [0.07, 0.04], [0.078, 0.07], [0.07, 0.1], [0.05, 0.12], [0.046, 0.125]], 40), 64), 16, 0.035), silver);
  lathe(tp, smooth([[0.046, 0.125], [0.044, 0.13], [0.03, 0.14], [0.012, 0.15], [0.008, 0.158], [0.012, 0.168], [0, 0.175]], 20), sil, 0, 0, 0, 0, 0, 0, 40);
  lathe(tp, smooth([[0, 0.165], [0.012, 0.166], [0.01, 0.175], [0.004, 0.182], [0, 0.183]], 10), ebony, 0, 0, 0, 0, 0, 0, 20);
  add(tp, swGeo([[0.065, 0.05, 0], [0.1, 0.07, 0], [0.12, 0.12, 0], [0.135, 0.15, 0]], [0.016, 0.011, 0.007, 0.006], 12, 24), sil);
  add(tp, swGeo([[-0.068, 0.11, 0], [-0.11, 0.12, 0], [-0.125, 0.08, 0], [-0.1, 0.04, 0], [-0.07, 0.035, 0]], [0.007, 0.008, 0.009, 0.008, 0.006], 10, 24, 0.7), ebony);
  // azucarera y cremera
  const sg = grp(g, -0.15, yt, 0.04);
  add(sg, gadroon(latheGeo(smooth([[0, 0], [0.025, 0], [0.022, 0.012], [0.04, 0.03], [0.046, 0.055], [0.042, 0.075], [0.04, 0.078]], 30), 48), 12, 0.04), silver);
  lathe(sg, smooth([[0.042, 0.078], [0.035, 0.085], [0.016, 0.09], [0.008, 0.1], [0, 0.104]], 12), sil, 0, 0, 0, 0, 0, 0, 32);
  for (const s of [-1, 1]) add(sg, swGeo([[s * 0.042, 0.06, 0], [s * 0.065, 0.065, 0], [s * 0.06, 0.035, 0], [s * 0.044, 0.03, 0]], [0.004, 0.004, 0.004, 0.004], 8, 16, 0.6), sil);
  const cr = grp(g, 0.15, yt, 0.05, 0, 0.5, 0);
  add(cr, gadroon(latheGeo(smooth([[0, 0], [0.022, 0], [0.02, 0.01], [0.035, 0.03], [0.036, 0.055], [0.03, 0.07], [0.034, 0.08]], 30), 48), 12, 0.04), mat(0xffffff, { map: silverT, metalness: 1, roughness: 0.16, side: THREE.DoubleSide }));
  add(cr, swGeo([[-0.034, 0.07, 0], [-0.058, 0.07, 0], [-0.055, 0.035, 0], [-0.034, 0.025, 0]], [0.004, 0.0045, 0.0045, 0.004], 8, 16, 0.6), ebony);
  EXS(cr, sp([[0.03, 0.072], [0.05, 0.085], [0.034, 0.08]]), 0.012, sil, 0, 0, 0, 0, 0, 0, 0.002);
  // tazas de porcelana
  for (const [x, z] of [[0.06, 0.1], [-0.05, 0.11]]) { lathe(g, smooth([[0, 0], [0.025, 0], [0.03, 0.004], [0.034, 0.008], [0, 0.008]], 8), C.porcelain(), x, yt, z, 0, 0, 0, 32); lathe(g, smooth([[0, 0.006], [0.018, 0.006], [0.022, 0.012], [0.03, 0.03], [0.034, 0.045], [0.031, 0.045]], 16), mat(0xf6f3ec, { roughness: 0.15, env: true, envI: 0.8, side: THREE.DoubleSide }), x, yt, z, 0, 0, 0, 32); add(g, new THREE.CircleGeometry(0.03, 24), mat(0x7a3a10, { roughness: 0.1 }), x, yt + 0.038, z, -PI / 2); }
  plaque(g, 'PLATA .925 · TAXCO', 'Maestro platero · 1958', 0.09, 0.016, 0, 0.012, 0.172, -0.3, 0);
  return ground(g);
};
