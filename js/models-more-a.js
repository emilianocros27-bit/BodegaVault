// Objetos nuevos (grupo A): datos del catálogo + modelos 3D.
import { THREE, mat, metal, plastic, glossy, glass, emissive, C, canvasTex, labelTex, artTex, rng, add, B, RB, CY, SP, TO, CO, LA, TU, P, EX, EXS, grp, SW } from './modelkit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// { id, name, category, rarity, baseValue, desc }
export const ITEMS_A = [
  // ---------- cotidianos ----------
  { id: 'plancha_carbon', name: 'Plancha de Carbón Antigua', category: 'everyday', rarity: 'common', baseValue: 180, desc: 'Plancha de hierro que se calentaba con brasas. Su gallito en la punta cierra la tapa.' },
  { id: 'molcajete', name: 'Molcajete de Piedra Volcánica', category: 'everyday', rarity: 'common', baseValue: 150, desc: 'Basalto curado con años de salsas. Incluye su tejolote.' },
  { id: 'olla_peltre', name: 'Olla de Peltre', category: 'everyday', rarity: 'common', baseValue: 90, desc: 'Esmalte moteado y borde negro: la olla de los frijoles de la abuela.' },
  { id: 'licuadora_retro', name: 'Licuadora Retro Cromada', category: 'everyday', rarity: 'rare', baseValue: 420, desc: 'Base de colmena cromada y vaso de vidrio grueso. Aún licúa.' },
  { id: 'lata_galletas', name: 'Lata de Galletas Danesas', category: 'everyday', rarity: 'common', baseValue: 60, desc: 'Todos esperaban galletas; adentro había hilos y agujas.' },
  { id: 'despertador_campanas', name: 'Despertador de Campanas', category: 'everyday', rarity: 'common', baseValue: 130, desc: 'Dos campanas y un martillito que no perdonan a nadie.' },
  { id: 'tetera_esmaltada', name: 'Tetera Esmaltada', category: 'everyday', rarity: 'common', baseValue: 110, desc: 'Tetera de peltre con asa de madera, ideal para el café de olla.' },
  { id: 'lampara_queroseno', name: 'Lámpara de Queroseno', category: 'everyday', rarity: 'common', baseValue: 160, desc: 'Depósito de vidrio prensado y bombilla de cristal soplado.' },
  { id: 'sifon_soda', name: 'Sifón de Soda', category: 'everyday', rarity: 'rare', baseValue: 380, desc: 'Botella de vidrio azul con cabeza cromada. Clásico de cantina.' },
  { id: 'bascula_cocina', name: 'Báscula de Cocina', category: 'everyday', rarity: 'common', baseValue: 140, desc: 'Báscula de resorte esmaltada, pesa hasta 5 kg.' },
  { id: 'regadera_metal', name: 'Regadera de Lámina', category: 'everyday', rarity: 'common', baseValue: 70, desc: 'Lámina galvanizada con su alcachofa perforada.' },
  { id: 'candado_laton', name: 'Candado de Latón', category: 'everyday', rarity: 'common', baseValue: 90, desc: 'Macizo, pesado y con su llave original.' },
  { id: 'maquina_tortillas', name: 'Tortilladora de Hierro', category: 'everyday', rarity: 'common', baseValue: 170, desc: 'Prensa de hierro fundido para tortillas perfectas.' },
  { id: 'jarra_vidrio_prensado', name: 'Jarra de Vidrio Prensado', category: 'everyday', rarity: 'common', baseValue: 80, desc: 'Vidrio labrado en diamante, lista para el agua de limón.' },
  // ---------- juguetes ----------
  { id: 'balero', name: 'Balero de Madera', category: 'toys', rarity: 'common', baseValue: 40, desc: 'Juguete tradicional pintado a mano. ¿Cuántas capiruchos seguidos?' },
  { id: 'loteria', name: 'Lotería Mexicana', category: 'toys', rarity: 'common', baseValue: 90, desc: 'Tabla, baraja y frijolitos. ¡Se va y se corre con…!' },
  { id: 'cubo_rubik', name: 'Cubo Mágico', category: 'toys', rarity: 'rare', baseValue: 250, desc: 'El rompecabezas de 3×3 que nadie en la familia pudo resolver.' },
  { id: 'caballito_mecedor', name: 'Caballito Mecedor', category: 'toys', rarity: 'rare', baseValue: 450, desc: 'Caballo de madera tallada con pintura tordilla y silla roja.' },
  { id: 'soldaditos_plomo', name: 'Soldaditos de Plomo', category: 'toys', rarity: 'rare', baseValue: 300, desc: 'Batallón de granaderos pintados a mano en su caja original.' },
  { id: 'bloques_construccion', name: 'Cubos de Madera con Letras', category: 'toys', rarity: 'common', baseValue: 180, desc: 'Bloques para aprender el abecedario jugando.' },
  { id: 'patineta_retro', name: 'Patineta Retro', category: 'toys', rarity: 'rare', baseValue: 320, desc: 'Tabla setentera con ruedas de uretano de colores.' },
  { id: 'patines_ruedas', name: 'Patines de Cuatro Ruedas', category: 'toys', rarity: 'rare', baseValue: 280, desc: 'Botas blancas, ruedas de color y freno de goma. Para la pista de los sábados.' },
  { id: 'pinata_estrella', name: 'Piñata de Estrella', category: 'toys', rarity: 'common', baseValue: 120, desc: 'Siete picos de papel de china. Dale, dale, dale…' },
  { id: 'caja_sorpresa', name: 'Caja Sorpresa de Payaso', category: 'toys', rarity: 'rare', baseValue: 260, desc: 'Gira la manivela y… ¡sorpresa! Un payaso de resorte.' },
  { id: 'caleidoscopio', name: 'Caleidoscopio', category: 'toys', rarity: 'common', baseValue: 110, desc: 'Tubo de latón y papel decorado con vidrios de colores.' },
  { id: 'luchador_juguete', name: 'Luchador de Juguete', category: 'toys', rarity: 'common', baseValue: 70, desc: 'Figura de plástico de mercado con máscara plateada.' },
  { id: 'carrito_pedales', name: 'Carrito de Pedales', category: 'toys', rarity: 'epic', baseValue: 1800, desc: 'Roadster de lámina de los cincuenta con defensas cromadas.' },
  // ---------- videojuegos ----------
  { id: 'tamagotchi', name: 'Mascota Virtual', category: 'videogames', rarity: 'rare', baseValue: 350, desc: 'La mascota de bolsillo de los 90. No olvides darle de comer.' },
  { id: 'game_gear', name: 'Sega Game Gear', category: 'videogames', rarity: 'rare', baseValue: 420, desc: 'Portátil a color que devoraba seis pilas AA.' },
  { id: 'ps2', name: 'PlayStation 2', category: 'videogames', rarity: 'rare', baseValue: 380, desc: 'La consola más vendida de la historia, con su DualShock 2.' },
  { id: 'dreamcast', name: 'Sega Dreamcast', category: 'videogames', rarity: 'rare', baseValue: 450, desc: 'Adelantada a su tiempo, con VMU en el control.' },
  { id: 'gamecube', name: 'Nintendo GameCube', category: 'videogames', rarity: 'rare', baseValue: 400, desc: 'El cubo índigo con asa para llevarlo a casa de los amigos.' },
  { id: 'xbox_original', name: 'Xbox Original', category: 'videogames', rarity: 'rare', baseValue: 350, desc: 'La caja negra con la X verde y su enorme control “Duke”.' },
  { id: 'gabinete_arcade', name: 'Gabinete Arcade', category: 'videogames', rarity: 'epic', baseValue: 3500, desc: 'Maquinita de fichas de tienda de la esquina, con palanca y seis botones.' },
  { id: 'pinball', name: 'Máquina de Pinball', category: 'videogames', rarity: 'legendary', baseValue: 9000, desc: 'Mesa de pinball con cristal trasero iluminado y bumpers.' },
  { id: 'zapper', name: 'Pistola de Luz Zapper', category: 'videogames', rarity: 'common', baseValue: 150, desc: 'La pistolita para cazar patos (y dispararle al perro).' },
  // ---------- electrónica ----------
  { id: 'walkie_talkie', name: 'Walkie-Talkies', category: 'electronics', rarity: 'common', baseValue: 120, desc: 'Par de radios de juguete. Cambio y fuera.' },
  { id: 'beeper', name: 'Localizador (Beeper)', category: 'electronics', rarity: 'common', baseValue: 90, desc: 'Antes del celular: recibías el número y buscabas un teléfono público.' },
  { id: 'celular_tapa', name: 'Celular de Tapa', category: 'electronics', rarity: 'common', baseValue: 150, desc: 'Se cerraba de golpe para colgar con estilo.' },
  { id: 'lampara_lava', name: 'Lámpara de Lava', category: 'electronics', rarity: 'rare', baseValue: 260, desc: 'Burbujas de cera flotando sin prisa. Hipnótica.' },
  { id: 'videocamara_vhs', name: 'Videocámara VHS', category: 'electronics', rarity: 'rare', baseValue: 480, desc: 'Cámara de hombro que grabó todas las fiestas de la familia.' },
  { id: 'proyector_diapositivas', name: 'Proyector de Diapositivas', category: 'electronics', rarity: 'rare', baseValue: 350, desc: 'Carrusel de 80 transparencias de las vacaciones del 78.' },
  { id: 'tv_portatil', name: 'Televisión Portátil', category: 'electronics', rarity: 'common', baseValue: 220, desc: 'Pantallita de 5 pulgadas con antena de conejo.' },
  { id: 'ipod_classic', name: 'iPod Classic', category: 'electronics', rarity: 'rare', baseValue: 300, desc: 'Mil canciones en tu bolsillo, con rueda de clic.' },
  { id: 'fax', name: 'Máquina de Fax', category: 'electronics', rarity: 'common', baseValue: 130, desc: 'Piiii-krrrrr… llegó un documento urgente.' },
  // ---------- máquinas ----------
  { id: 'caja_registradora_laton', name: 'Caja Registradora de Latón', category: 'machines', rarity: 'epic', baseValue: 2200, desc: 'Latón repujado, teclas de nácar y cajón de roble. Suena “¡cling!”.' },
  { id: 'maquina_palomitas', name: 'Carrito de Palomitas', category: 'machines', rarity: 'rare', baseValue: 900, desc: 'Carrito rojo con vitrina y olla colgante, como en las ferias.' },
  { id: 'telefono_manivela', name: 'Teléfono de Manivela', category: 'machines', rarity: 'rare', baseValue: 700, desc: 'Gira la manivela y la operadora contesta.' },
  { id: 'sextante', name: 'Sextante de Navegación', category: 'machines', rarity: 'epic', baseValue: 1800, desc: 'Instrumento de latón para medir la altura del sol sobre el horizonte.' },
  { id: 'lampara_minero', name: 'Lámpara de Minero', category: 'machines', rarity: 'common', baseValue: 180, desc: 'Lámpara de seguridad con malla metálica contra el grisú.' },
  { id: 'microscopio_laton', name: 'Microscopio de Latón', category: 'machines', rarity: 'epic', baseValue: 1600, desc: 'Microscopio victoriano con pie de herradura y espejo.' },
  { id: 'motor_vapor', name: 'Motor de Vapor Miniatura', category: 'machines', rarity: 'epic', baseValue: 2400, desc: 'Caldera de latón, chimenea y volante rojo. Funciona con pastillas de combustible.' },
  // ---------- música ----------
  { id: 'rockola', name: 'Rockola Wurlitzer', category: 'music', rarity: 'legendary', baseValue: 12000, desc: 'Arco de tubos burbujeantes, cromo y 24 discos de 78 rpm.' },
  { id: 'metronomo', name: 'Metrónomo de Péndulo', category: 'music', rarity: 'common', baseValue: 160, desc: 'Pirámide de madera que marca el tiempo: tic, tac, tic, tac.' },
  { id: 'maracas', name: 'Maracas', category: 'music', rarity: 'common', baseValue: 60, desc: 'Par de maracas de guaje pintadas a mano.' },
  { id: 'trompeta', name: 'Trompeta', category: 'music', rarity: 'rare', baseValue: 900, desc: 'Trompeta de latón lacado, como la del mariachi.' },
  { id: 'violin', name: 'Violín en su Estuche', category: 'music', rarity: 'epic', baseValue: 3200, desc: 'Violín de arce flameado con su arco, en estuche de terciopelo.' },
  { id: 'acordeon', name: 'Acordeón', category: 'music', rarity: 'rare', baseValue: 1100, desc: 'Acordeón de teclado con fuelle rojo, alma del norteño.' },
  { id: 'pandero', name: 'Pandero', category: 'music', rarity: 'common', baseValue: 90, desc: 'Aro de madera con sonajas de latón y listones.' },
  { id: 'saxofon', name: 'Saxofón Alto', category: 'music', rarity: 'epic', baseValue: 2800, desc: 'Saxofón de latón con llaves de nácar, en su atril.' },
  { id: 'cajon_peruano', name: 'Cajón Peruano', category: 'music', rarity: 'common', baseValue: 200, desc: 'Caja de madera que suena a flamenco y a festejo.' },
];

// =====================================================================
//  utilidades locales
// =====================================================================
const PI = Math.PI, TAU = Math.PI * 2;
const pick = (a, s) => a[Math.abs(s | 0) % a.length];
// silueta suave (spline cerrada)
function sp(pts) {
  const s = new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  s.splineThru(pts.slice(1).map(([x, y]) => new THREE.Vector2(x, y)));
  s.closePath();
  return s;
}
// silueta poligonal
function poly(pts, hole = false) {
  const s = hole ? new THREE.Path() : new THREE.Shape();
  s.moveTo(pts[0][0], pts[0][1]);
  for (const [x, y] of pts.slice(1)) s.lineTo(x, y);
  s.closePath();
  return s;
}
// rectángulo redondeado (Shape o Path)
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
  s.absarc(cx, cy, r, 0, TAU, false);
  return s;
}
const mirror = (half) => [...half, ...half.slice(1, -1).reverse().map(([x, y]) => [-x, y])];
// torno con rotación
function lathe(g, pts, m, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, seg = 40, phi0 = 0, phiL = TAU) {
  const geo = new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(Math.max(0, a), b)), seg, phi0, phiL);
  return add(g, geo, m, x, y, z, rx, ry, rz);
}
// transforma una geometría (para fusionar piezas repetidas)
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
function gx(geo, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) {
  _q.setFromEuler(_e.set(rx, ry, rz));
  _m4.compose(_v.set(x, y, z), _q, typeof s === 'number' ? _s.set(s, s, s) : _s.set(...s));
  return geo.applyMatrix4(_m4);
}
function merged(g, geos, m) {
  const list = geos.map(ge => {
    const n = ge.index ? ge.toNonIndexed() : ge;
    for (const k of Object.keys(n.attributes)) if (!['position', 'normal', 'uv'].includes(k)) n.deleteAttribute(k);
    if (!n.attributes.uv) n.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n.attributes.position.count * 2), 2));
    n.clearGroups();
    return n;
  });
  return add(g, mergeGeometries(list, false), m);
}
const latheGeo = (pts, seg = 20) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(Math.max(0, a), b)), seg);
// apoya el grupo en y = 0
function ground(g) {
  g.updateMatrixWorld(true);
  const bb = new THREE.Box3().setFromObject(g);
  const dy = -bb.min.y;
  for (const c of g.children) c.position.y += dy;
  return g;
}
// material doble cara (copia de un material cacheado)
const dbl = (color, o = {}) => mat(color, { side: THREE.DoubleSide, ...o });
const brassD = () => metal(0xc49a45, 0.25, { side: THREE.DoubleSide });
const chromeD = () => metal(0xeef1f4, 0.08, { side: THREE.DoubleSide });
const glassD = (color = 0xd8ecf2, opacity = 0.28) => mat(color, { transparent: true, opacity, roughness: 0.05, metalness: 0.1, env: true, envI: 1.2, depthWrite: false, side: THREE.DoubleSide });
const texM = (tex, o = {}) => mat(0xffffff, { map: tex, roughness: 0.6, ...o });
const circleDecal = (g, r, tex, x, y, z, rx = 0, ry = 0, rz = 0, o = {}) => add(g, new THREE.CircleGeometry(r, 48), texM(tex, o), x, y, z, rx, ry, rz);
// textura de esmalte moteado (peltre)
function speckleTex(key, base, dot = '#ffffff', n = 1400) {
  return canvasTex('A_spk_' + key, 256, 256, (c, w, h) => {
    const R = rng(key.length * 97 + 3);
    c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { c.fillStyle = dot; c.globalAlpha = 0.4 + R() * 0.6; c.beginPath(); c.arc(R() * w, R() * h, 0.4 + R() * 1.6, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  }, true);
}
// carátula de reloj / báscula
function dialTex(key, o = {}) {
  const { bg = '#f3ead2', fg = '#1a1a1a', nums = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], hands = true, title = null, red = null, needle = null, ticks = 60, font = 'Georgia' } = o;
  return canvasTex('A_dial_' + key, 512, 512, (c, w, h) => {
    const cx = w / 2, cy = h / 2;
    c.fillStyle = bg; c.fillRect(0, 0, w, h);
    const gr = c.createRadialGradient(cx, cy, w * 0.1, cx, cy, w * 0.5); gr.addColorStop(0, 'rgba(255,255,255,0.15)'); gr.addColorStop(1, 'rgba(0,0,0,0.18)');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = fg; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, w * 0.47, 0, 7); c.stroke();
    for (let i = 0; i < ticks; i++) {
      const a = i / ticks * TAU - PI / 2, big = i % (ticks / nums.length) === 0;
      c.lineWidth = big ? 6 : 2;
      c.beginPath(); c.moveTo(cx + Math.cos(a) * w * 0.44, cy + Math.sin(a) * w * 0.44); c.lineTo(cx + Math.cos(a) * w * (big ? 0.38 : 0.415), cy + Math.sin(a) * w * (big ? 0.38 : 0.415)); c.stroke();
    }
    c.fillStyle = fg; c.font = `bold ${w * 0.085}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
    nums.forEach((n, i) => { const a = i / nums.length * TAU - PI / 2; c.fillText(String(n), cx + Math.cos(a) * w * 0.31, cy + Math.sin(a) * w * 0.31); });
    if (title) { c.font = `italic bold ${w * 0.055}px ${font}`; c.fillText(title, cx, cy + h * 0.17); }
    const hand = (a, len, wd, col) => { c.strokeStyle = col; c.lineWidth = wd; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx - Math.cos(a) * len * 0.15, cy - Math.sin(a) * len * 0.15); c.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); c.stroke(); };
    if (hands) { hand(-PI / 2 + TAU * (10.1 / 12), w * 0.22, 12, fg); hand(-PI / 2 + TAU * (8 / 60), w * 0.34, 8, fg); }
    if (red != null) hand(-PI / 2 + TAU * red, w * 0.3, 4, '#c8282a');
    if (needle != null) hand(-PI / 2 + TAU * needle, w * 0.4, 6, '#c8282a');
    c.fillStyle = fg; c.beginPath(); c.arc(cx, cy, w * 0.025, 0, 7); c.fill();
  });
}
// perilla moleteada
function knob(g, r, h, m, x, y, z, rx = 0, ry = 0, rz = 0) {
  return lathe(g, [[0, 0], [r, 0], [r, h * 0.8], [r * 0.85, h], [0, h]], m, x, y, z, rx, ry, rz, 18);
}

// =====================================================================
//  COTIDIANOS
// =====================================================================
function planchaCarbon(seed) {
  const g = new THREE.Group();
  const iron = mat(0x2b2927, { metalness: 0.65, roughness: 0.55 });
  const outline = (k) => sp([[0, -0.115 * k], [0.035 * k, -0.075 * k], [0.054 * k, -0.01 * k], [0.056 * k, 0.07 * k], [0.05 * k, 0.09 * k], [-0.05 * k, 0.09 * k], [-0.056 * k, 0.07 * k], [-0.054 * k, -0.01 * k], [-0.035 * k, -0.075 * k]]);
  EXS(g, outline(1), 0.01, iron, 0, 0.008, 0, -PI / 2, 0, 0, 0.003); // suela
  EXS(g, outline(0.95), 0.06, iron, 0, 0.045, 0, -PI / 2, 0, 0, 0.004); // cuerpo
  EXS(g, outline(0.97), 0.014, mat(0x383532, { metalness: 0.6, roughness: 0.45 }), 0, 0.083, 0, -PI / 2, 0, 0, 0.007); // tapa
  // respiraderos con brasas
  const vent = [];
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) { const z = -0.06 + i * 0.016; vent.push(gx(new THREE.CylinderGeometry(0.0055, 0.0055, 0.006, 12), s * 0.0525, 0.045, z, 0, 0, PI / 2)); }
  merged(g, vent, mat(0x2a0a02, { emissive: 0xff4a10, emissiveIntensity: 0.8 }));
  // bisagra trasera
  CY(g, 0.008, 0.008, 0.07, iron, 0, 0.08, -0.088, 0, 0, PI / 2, 12);
  // postes y asa de madera
  SW(g, [[0, 0.09, -0.07], [0, 0.13, -0.075], [0, 0.155, -0.055]], [0.008, 0.006, 0.006], iron, 10, 12);
  SW(g, [[0, 0.09, 0.03], [0, 0.13, 0.04], [0, 0.155, 0.035]], [0.008, 0.006, 0.006], iron, 10, 12);
  lathe(g, [[0, -0.05], [0.009, -0.05], [0.013, -0.04], [0.015, 0], [0.013, 0.04], [0.009, 0.05], [0, 0.05]], C.wood(0x5a3218), 0, 0.158, -0.01, PI / 2, 0, 0, 20);
  // gallito (cierre) en la punta
  const rooster = [[-0.016, 0], [0.014, 0], [0.018, 0.01], [0.022, 0.019], [0.027, 0.021], [0.022, 0.025], [0.02, 0.031], [0.016, 0.035], [0.012, 0.03], [0.008, 0.022], [-0.004, 0.016], [-0.012, 0.03], [-0.021, 0.036], [-0.02, 0.018]];
  EX(g, rooster, 0.005, iron, 0, 0.09, 0.07, 0, -PI / 2, 0, 0.0015);
  return g;
}

function molcajete(seed) {
  const g = new THREE.Group();
  const tex = canvasTex('A_basalt', 256, 256, (c, w, h) => {
    const R = rng(5); c.fillStyle = '#4a4744'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { c.fillStyle = R() < 0.55 ? 'rgba(18,17,16,0.75)' : 'rgba(130,124,118,0.35)'; c.beginPath(); c.arc(R() * w, R() * h, 0.5 + R() * 2.2, 0, 7); c.fill(); }
  }, true);
  const stone = mat(0x9a948e, { map: tex, roughness: 0.95 });
  lathe(g, [[0, 0.03], [0.06, 0.028], [0.1, 0.045], [0.12, 0.08], [0.126, 0.108], [0.12, 0.12], [0.107, 0.116], [0.092, 0.085], [0.055, 0.062], [0, 0.058]], stone, 0, 0, 0, 0, 0, 0, 44);
  for (let i = 0; i < 3; i++) {
    const a = i / 3 * TAU + 0.5;
    lathe(g, [[0, 0], [0.02, 0], [0.026, 0.012], [0.024, 0.03], [0.018, 0.048], [0, 0.05]], stone, Math.cos(a) * 0.07, 0, Math.sin(a) * 0.07, 0, 0, 0, 16);
  }
  // salsa
  const salsa = canvasTex('A_salsa', 128, 128, (c, w, h) => {
    const R = rng(8); c.fillStyle = '#9a1c10'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { c.fillStyle = pick(['#c8401c', '#5a0a06', '#3a7a22', '#e8d8b0', '#b82a14'], (R() * 5) | 0); c.beginPath(); c.arc(R() * w, R() * h, 0.8 + R() * 2.5, 0, 7); c.fill(); }
  });
  circleDecal(g, 0.098, salsa, 0, 0.095, 0, -PI / 2, 0, 0, { roughness: 0.25 });
  // tejolote
  lathe(g, [[0, 0], [0.022, 0], [0.03, 0.02], [0.027, 0.05], [0.019, 0.075], [0.013, 0.092], [0, 0.097]], stone, 0.035, 0.09, 0.01, 0, 0, -1.15, 24);
  // jitomate y chile
  const tom = SP(g, 0.032, glossy(0xc8200e), 0.17, 0.028, 0.06, 1, 0.85, 1); tom.rotation.y = 0.4;
  CO(g, 0.012, 0.006, mat(0x3a6a1a, { roughness: 0.7 }), 0.17, 0.056, 0.06, 0, 0, 0, 6);
  SW(g, [[0.12, 0.012, 0.13], [0.15, 0.013, 0.14], [0.18, 0.012, 0.135], [0.2, 0.012, 0.12]], [0.012, 0.013, 0.01, 0.002], glossy(0x2f7a1c), 12, 16);
  return g;
}

function ollaPeltre(seed) {
  const g = new THREE.Group();
  const col = pick(['#2d5aa8', '#1f6a4a', '#b8261e', '#e8e4d8'], seed);
  const enamel = mat(0xffffff, { map: speckleTex('olla' + col, col, col === '#e8e4d8' ? '#2d5aa8' : '#ffffff'), roughness: 0.2, env: true, envI: 0.7 });
  const inner = C.porcelain(0xeeeee6);
  const rim = glossy(0x141414);
  lathe(g, [[0, 0], [0.1, 0], [0.108, 0.006], [0.112, 0.022], [0.112, 0.125]], enamel, 0, 0, 0, 0, 0, 0, 48);
  lathe(g, [[0.106, 0.125], [0.106, 0.012], [0.1, 0.008], [0, 0.008]], inner, 0, 0, 0, 0, 0, 0, 48);
  TO(g, 0.109, 0.0035, rim, 0, 0.125, 0, PI / 2, 0, 0, TAU, 48);
  lathe(g, [[0, 0], [0.098, 0], [0.1, 0.004]], rim, 0, -0.0005, 0, 0, 0, 0, 36);
  for (const s of [-1, 1]) {
    const h = grp(g, s * 0.112, 0.1, 0, 0, s * PI / 2);
    TO(h, 0.022, 0.0045, rim, 0, 0, 0, PI / 2, 0, 0, PI, 20);
    for (const k of [-1, 1]) SP(h, 0.004, rim, k * 0.022, 0, 0, 1, 1, 0.6, 8);
  }
  // tapa
  lathe(g, [[0.114, 0.124], [0.114, 0.129], [0.098, 0.142], [0.05, 0.155], [0, 0.158]], enamel, 0, 0, 0, 0, 0, 0, 48);
  TO(g, 0.113, 0.003, rim, 0, 0.128, 0, PI / 2, 0, 0, TAU, 48);
  lathe(g, [[0, 0.157], [0.012, 0.157], [0.008, 0.165], [0.016, 0.175], [0.014, 0.18], [0, 0.182]], rim, 0, 0, 0, 0, 0, 0, 18);
  return g;
}

function licuadoraRetro(seed) {
  const g = new THREE.Group();
  const ch = C.chrome();
  lathe(g, [[0, 0], [0.09, 0], [0.093, 0.008], [0.09, 0.02], [0.084, 0.024], [0.084, 0.03], [0.078, 0.06], [0.08, 0.064], [0.074, 0.068], [0.07, 0.1], [0.072, 0.104], [0.066, 0.108], [0.062, 0.14], [0, 0.14]], ch, 0, 0, 0, 0, 0, 0, 48);
  // panel frontal con botones
  const pnl = grp(g, 0, 0.055, 0.08, -0.3);
  RB(pnl, 0.08, 0.036, 0.016, 0.006, plastic(0x1a1a1a), 0, 0, 0);
  P(pnl, 0.07, 0.01, labelTex('LICÚA · PICA', { bg: '#1a1a1a', fg: '#e8e0c8', w: 256, h: 36, font: 'bold 24px system-ui' }), 0, 0.011, 0.0085);
  for (let i = 0; i < 3; i++) RB(pnl, 0.018, 0.012, 0.012, 0.003, plastic(pick([0xe8e2d4, 0xc8282a], i === 1 ? 1 : 0)), -0.022 + i * 0.022, -0.005, 0.009 + (i === 1 ? -0.003 : 0));
  // acoplador
  lathe(g, [[0, 0.14], [0.058, 0.14], [0.06, 0.15], [0.056, 0.168], [0, 0.168]], plastic(0x1a1a1a), 0, 0, 0, 0, 0, 0, 32);
  // vaso de vidrio
  lathe(g, [[0.054, 0.168], [0.058, 0.2], [0.07, 0.3], [0.078, 0.37], [0.08, 0.385]], glassD(0xd8f0ee, 0.3), 0, 0, 0, 0, 0, 0, 40);
  lathe(g, [[0, 0.172], [0.055, 0.172], [0.064, 0.25], [0, 0.25]], mat(0xf08aa0, { roughness: 0.4, transparent: true, opacity: 0.92 }), 0, 0, 0, 0, 0, 0, 32);
  for (let i = 0; i < 4; i++) B(g, 0.05, 0.002, 0.01, C.steel(), 0, 0.182, 0, 0, i * PI / 4, 0.2);
  // graduaciones
  for (let i = 0; i < 5; i++) B(g, 0.02, 0.0015, 0.001, mat(0xffffff, { roughness: 0.4 }), 0, 0.22 + i * 0.03, 0.062 + i * 0.003 + 0.001, -0.08);
  // asa
  SW(g, [[-0.07, 0.35, 0], [-0.11, 0.34, 0], [-0.125, 0.29, 0], [-0.115, 0.23, 0], [-0.065, 0.21, 0]], [0.012, 0.014, 0.014, 0.013, 0.01], glassD(0xd8f0ee, 0.4), 12, 30, 0.6);
  // tapa
  lathe(g, [[0, 0.383], [0.083, 0.383], [0.083, 0.395], [0.075, 0.4], [0.03, 0.402], [0.028, 0.415], [0, 0.418]], plastic(0x1a1a1a), 0, 0, 0, 0, 0, 0, 32);
  return g;
}

function lataGalletas(seed) {
  const g = new THREE.Group();
  const blue = '#1c3a7a';
  const side = canvasTex('A_tin_side', 1024, 128, (c, w, h) => {
    c.fillStyle = blue; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d9b44a'; c.fillRect(0, 10, w, 5); c.fillRect(0, h - 15, w, 5);
    c.font = 'italic bold 44px Georgia'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) { c.fillStyle = '#f2e8c8'; c.fillText('Galletas Danesas', w * (i + 0.5) / 3, h / 2); }
    c.fillStyle = '#d9b44a'; for (let x = 0; x < w; x += 32) { c.beginPath(); c.arc(x, 24, 3, 0, 7); c.arc(x + 16, h - 24, 3, 0, 7); c.fill(); }
  });
  const lidTex = canvasTex('A_tin_lid', 512, 512, (c, w, h) => {
    c.fillStyle = blue; c.fillRect(0, 0, w, h);
    const cx = w / 2;
    c.strokeStyle = '#d9b44a'; c.lineWidth = 10; c.beginPath(); c.arc(cx, cx, w * 0.46, 0, 7); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.arc(cx, cx, w * 0.42, 0, 7); c.stroke();
    // plato con galletas
    c.fillStyle = '#e8e8f0'; c.beginPath(); c.ellipse(cx, h * 0.52, w * 0.3, h * 0.2, 0, 0, 7); c.fill();
    const R = rng(4);
    for (let i = 0; i < 9; i++) {
      const x = cx + (R() - 0.5) * w * 0.4, y = h * 0.52 + (R() - 0.5) * h * 0.22, r = 26 + R() * 12;
      c.fillStyle = pick(['#d49a4a', '#c07a32', '#e2b066'], i); c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      c.strokeStyle = 'rgba(90,50,10,0.5)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r * 0.55, 0, 7); c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 0; k < 8; k++) c.fillRect(x + (R() - 0.5) * r, y + (R() - 0.5) * r, 3, 3);
    }
    c.fillStyle = '#f2e8c8'; c.font = 'italic bold 48px Georgia'; c.textAlign = 'center';
    c.fillText('Galletas', cx, h * 0.2); c.font = 'bold 30px Georgia'; c.fillText('DANESAS DE MANTEQUILLA', cx, h * 0.84);
  });
  const sideM = mat(0xffffff, { map: side, roughness: 0.25, metalness: 0.35, env: true, envI: 0.6 });
  const tinM = metal(0x2a4a8a, 0.3);
  add(g, new THREE.CylinderGeometry(0.1, 0.1, 0.06, 56, 1, true), sideM, 0, 0.03, 0);
  lathe(g, [[0, 0.001], [0.096, 0], [0.1, 0.004]], tinM, 0, 0, 0, 0, 0, 0, 48);
  // tapa
  lathe(g, [[0.1015, 0.046], [0.1025, 0.05], [0.103, 0.068], [0.1, 0.074], [0.09, 0.076], [0, 0.076]], tinM, 0, 0, 0, 0, 0, 0, 56);
  circleDecal(g, 0.092, lidTex, 0, 0.0765, 0, -PI / 2, 0, 0, { roughness: 0.25, metalness: 0.3, env: true, envI: 0.5 });
  TO(g, 0.103, 0.0025, C.gold(), 0, 0.058, 0, PI / 2, 0, 0, TAU, 56);
  // galletas sueltas
  const cookie = mat(0xd49a4a, { roughness: 0.8, map: speckleTex('cookie', '#d49a4a', '#f8f0e0', 500) });
  TO(g, 0.022, 0.009, cookie, 0.15, 0.009, 0.06, PI / 2, 0, 0, TAU, 24);
  TU(g, [[0.12, 0.007, 0.13], [0.14, 0.007, 0.15], [0.16, 0.007, 0.13], [0.14, 0.007, 0.11], [0.12, 0.007, 0.14], [0.13, 0.007, 0.16]], 0.007, cookie, false, 40);
  return g;
}

function despertador(seed) {
  const g = new THREE.Group();
  const col = pick([0xb8201a, 0x1f5a3a, 0x1a1a1a, 0x2a4a8a], seed);
  const body = metal(col, 0.3, { metalness: 0.5 });
  const ch = C.chrome();
  const cy = 0.09;
  lathe(g, [[0, -0.024], [0.046, -0.024], [0.054, -0.019], [0.058, -0.008], [0.058, 0.012], [0.055, 0.02], [0.05, 0.024]], body, 0, cy, 0, PI / 2, 0, 0, 48);
  TO(g, 0.052, 0.005, ch, 0, cy, 0.025, 0, 0, 0, TAU, 48);
  circleDecal(g, 0.049, dialTex('despertador', { title: 'Despertador', red: 0.3 }), 0, cy, 0.023, 0, 0, 0, { roughness: 0.4 });
  lathe(g, [[0.05, 0.024], [0.035, 0.031], [0, 0.034]], glassD(0xeef6ff, 0.18), 0, cy, 0, PI / 2, 0, 0, 40);
  // campanas
  for (const s of [-1, 1]) {
    const b = grp(g, s * 0.036, cy + 0.058, -0.004, 0, 0, -s * 0.5);
    lathe(b, [[0, 0.028], [0.012, 0.027], [0.024, 0.019], [0.031, 0.006], [0.033, 0], [0.03, 0], [0.028, 0.005], [0.021, 0.016], [0.01, 0.023], [0, 0.024]], ch, 0, 0, 0, 0, 0, 0, 32);
    CY(b, 0.003, 0.003, 0.012, ch, 0, -0.004, 0, 0, 0, 0, 8);
  }
  // martillo
  CY(g, 0.0022, 0.0022, 0.034, ch, 0, cy + 0.07, -0.01, 0, 0, 0, 8);
  RB(g, 0.012, 0.007, 0.007, 0.002, ch, 0, cy + 0.088, -0.01);
  // asa
  TO(g, 0.02, 0.003, ch, 0, cy + 0.066, -0.004, 0, 0, 0, PI, 16);
  // patas
  for (const s of [-1, 1]) SW(g, [[s * 0.03, cy - 0.045, 0], [s * 0.042, cy - 0.07, 0.003], [s * 0.046, 0.006, 0.004]], [0.005, 0.004, 0.006], ch, 8, 10);
  // llaves de cuerda traseras
  for (const s of [-1, 1]) { CY(g, 0.003, 0.003, 0.012, ch, s * 0.018, cy - 0.01, -0.03, PI / 2, 0, 0, 8); EX(g, [[-0.012, -0.005], [0.012, -0.005], [0.014, 0.006], [0.004, 0.004], [-0.004, 0.004], [-0.014, 0.006]], 0.002, ch, s * 0.018, cy - 0.01, -0.036, 0, 0, 0, 0.001); }
  return g;
}

function teteraEsmaltada(seed) {
  const g = new THREE.Group();
  const col = pick(['#b8261e', '#2d5aa8', '#2d7a4a', '#e0a020'], seed);
  const en = mat(0xffffff, { map: speckleTex('tetera' + col, col, '#ffffff', 1000), roughness: 0.2, env: true, envI: 0.7 });
  const blk = glossy(0x141414);
  lathe(g, [[0, 0], [0.07, 0], [0.086, 0.008], [0.097, 0.035], [0.097, 0.07], [0.086, 0.1], [0.066, 0.12], [0.05, 0.128]], en, 0, 0, 0, 0, 0, 0, 48);
  lathe(g, [[0, -0.001], [0.07, -0.001], [0.074, 0.003]], blk, 0, 0, 0, 0, 0, 0, 32);
  TO(g, 0.05, 0.003, blk, 0, 0.128, 0, PI / 2, 0, 0, TAU, 32);
  // pico
  SW(g, [[0.075, 0.045, 0], [0.11, 0.07, 0], [0.135, 0.11, 0], [0.15, 0.135, 0]], [0.024, 0.016, 0.011, 0.009], en, 14, 20);
  TO(g, 0.009, 0.0022, blk, 0.151, 0.137, 0, PI / 2 - 0.6, 0, -0.9, TAU, 16);
  // tapa
  lathe(g, [[0.052, 0.126], [0.052, 0.132], [0.04, 0.142], [0.015, 0.148], [0, 0.149]], en, 0, 0, 0, 0, 0, 0, 36);
  lathe(g, [[0, 0.148], [0.008, 0.148], [0.006, 0.155], [0.013, 0.163], [0.01, 0.168], [0, 0.169]], blk, 0, 0, 0, 0, 0, 0, 16);
  // asa de alambre y agarradera de madera
  for (const s of [-1, 1]) { SP(g, 0.007, blk, s * 0.078, 0.108, 0, 1, 1, 0.6, 10); }
  TU(g, [[-0.078, 0.108, 0], [-0.07, 0.16, 0], [-0.04, 0.2, 0], [0, 0.212, 0], [0.04, 0.2, 0], [0.07, 0.16, 0], [0.078, 0.108, 0]], 0.0028, C.steel(), false, 40);
  lathe(g, [[0, -0.035], [0.009, -0.035], [0.012, -0.025], [0.013, 0], [0.012, 0.025], [0.009, 0.035], [0, 0.035]], C.wood(0x3a2012), 0, 0.211, 0, 0, 0, PI / 2, 18);
  return g;
}

function lamparaQueroseno(seed) {
  const g = new THREE.Group();
  const tint = pick([0x9ad8c0, 0xe8c080, 0xd8e8f0, 0x88a8e0], seed);
  const pressed = canvasTex('A_pressed', 256, 256, (c, w, h) => {
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,0.75)'; c.lineWidth = 3;
    for (let i = -8; i < 16; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32 + h, h); c.stroke(); c.beginPath(); c.moveTo(i * 32, h); c.lineTo(i * 32 + h, 0); c.stroke(); }
  }, true);
  pressed.repeat.set(6, 2);
  const glassP = mat(tint, { map: pressed, transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.1, env: true, envI: 1.2, depthWrite: false, side: THREE.DoubleSide });
  lathe(g, [[0, 0], [0.068, 0], [0.071, 0.012], [0.05, 0.03], [0.03, 0.05], [0.028, 0.062], [0.058, 0.08], [0.074, 0.11], [0.07, 0.14], [0.042, 0.16], [0.026, 0.166]], glassP, 0, 0, 0, 0, 0, 0, 40);
  lathe(g, [[0, 0.07], [0.052, 0.075], [0.066, 0.1], [0.066, 0.12], [0, 0.12]], mat(0xd89a2a, { transparent: true, opacity: 0.55, roughness: 0.1 }), 0, 0, 0, 0, 0, 0, 32);
  // quemador de latón
  const br = C.brass();
  lathe(g, [[0.026, 0.164], [0.031, 0.166], [0.033, 0.18], [0.029, 0.188], [0.04, 0.198], [0.043, 0.214], [0.036, 0.216], [0.034, 0.2], [0, 0.2]], br, 0, 0, 0, 0, 0, 0, 32);
  knob(g, 0.009, 0.004, br, 0.044, 0.19, 0, 0, 0, -PI / 2);
  CY(g, 0.002, 0.002, 0.02, br, 0.036, 0.19, 0, 0, 0, PI / 2, 6);
  B(g, 0.02, 0.012, 0.004, mat(0xe8dcc0, { roughness: 1 }), 0, 0.206, 0);
  // llama
  SP(g, 0.009, emissive(0xffa020, 2.2), 0, 0.232, 0, 0.8, 2, 0.8, 14);
  SP(g, 0.005, emissive(0xfff0a0, 3), 0, 0.226, 0, 0.8, 1.6, 0.8, 10);
  // bombilla
  lathe(g, [[0.034, 0.206], [0.037, 0.222], [0.052, 0.25], [0.057, 0.28], [0.048, 0.32], [0.031, 0.355], [0.029, 0.43], [0.033, 0.436]], glassD(0xf4f8ff, 0.22), 0, 0, 0, 0, 0, 0, 40);
  return g;
}

function sifonSoda(seed) {
  const g = new THREE.Group();
  const tint = pick([0x2a64c8, 0x2a9a7a, 0x8a3ac8, 0xd8e8f0], seed);
  lathe(g, [[0, 0.001], [0.044, 0.001], [0.048, 0.006], [0.048, 0.2], [0.043, 0.216], [0.03, 0.23], [0.028, 0.24]], glassD(tint, 0.55), 0, 0, 0, 0, 0, 0, 40);
  lathe(g, [[0, 0.004], [0.044, 0.004], [0.045, 0.16], [0, 0.16]], mat(tint, { transparent: true, opacity: 0.35, roughness: 0.05 }), 0, 0, 0, 0, 0, 0, 32);
  // malla metálica decorativa
  const mesh = canvasTex('A_sifon_mesh', 128, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(210,214,218,1)'; c.lineWidth = 3;
    for (let i = -4; i < 8; i++) { c.beginPath(); c.moveTo(i * 24, 0); c.lineTo(i * 24 + h, h); c.stroke(); c.beginPath(); c.moveTo(i * 24, h); c.lineTo(i * 24 + h, 0); c.stroke(); }
  }, true);
  mesh.repeat.set(8, 4);
  add(g, new THREE.CylinderGeometry(0.0495, 0.0495, 0.17, 40, 1, true), mat(0xffffff, { map: mesh, transparent: true, alphaTest: 0.4, metalness: 0.9, roughness: 0.3, side: THREE.DoubleSide, env: true }), 0, 0.105, 0);
  const ch = C.chrome();
  lathe(g, [[0, 0], [0.05, 0], [0.051, 0.018], [0.047, 0.02]], ch, 0, 0, 0, 0, 0, 0, 40);
  lathe(g, [[0.047, 0.19], [0.05, 0.192], [0.05, 0.2], [0.046, 0.202]], ch, 0, 0, 0, 0, 0, 0, 40);
  // cabeza
  lathe(g, [[0, 0.232], [0.033, 0.232], [0.036, 0.25], [0.034, 0.27], [0.028, 0.29], [0.031, 0.302], [0.022, 0.314], [0, 0.318]], ch, 0, 0, 0, 0, 0, 0, 32);
  SW(g, [[0, 0.285, 0.02], [0, 0.284, 0.05], [0, 0.272, 0.078], [0, 0.255, 0.092]], [0.012, 0.009, 0.007, 0.0055], ch, 12, 16);
  SW(g, [[0, 0.312, 0.012], [0, 0.322, -0.02], [0, 0.312, -0.055], [0, 0.29, -0.075]], [0.006, 0.008, 0.009, 0.008], ch, 10, 16, 1.6);
  TU(g, [[0, 0.23, 0], [0, 0.12, 0.005], [0, 0.01, 0.01]], 0.003, glass(0xffffff, 0.4));
  return g;
}

function basculaCocina(seed) {
  const g = new THREE.Group();
  const col = pick([0x9ad0b8, 0xe8dcc0, 0xc8302a, 0x6aa0d0], seed);
  const en = glossy(col);
  const sil = sp([[-0.1, 0], [0.1, 0], [0.095, 0.014], [0.072, 0.03], [0.078, 0.06], [0.088, 0.1], [0.086, 0.15], [0.064, 0.196], [0, 0.212], [-0.064, 0.196], [-0.086, 0.15], [-0.088, 0.1], [-0.078, 0.06], [-0.072, 0.03], [-0.095, 0.014]]);
  EXS(g, sil, 0.08, en, 0, 0.001, 0, 0, 0, 0, 0.012);
  const ch = C.chrome();
  TO(g, 0.064, 0.006, ch, 0, 0.125, 0.052, 0, 0, 0, TAU, 48);
  circleDecal(g, 0.062, dialTex('bascula', { nums: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5], hands: false, needle: 0.09, ticks: 50, title: 'kg', bg: '#fbf6e8', font: 'system-ui' }), 0, 0.125, 0.05, 0, 0, 0, { roughness: 0.4 });
  lathe(g, [[0.062, 0], [0.04, 0.008], [0, 0.01]], glassD(0xeef6ff, 0.15), 0, 0.125, 0.05, PI / 2, 0, 0, 40);
  P(g, 0.07, 0.016, labelTex('COCINA', { bg: hexs(col), fg: '#ffffff', w: 256, h: 58, font: 'bold 40px system-ui' }), 0, 0.035, 0.053);
  // plato
  CY(g, 0.012, 0.016, 0.02, ch, 0, 0.228, 0, 0, 0, 0, 20);
  lathe(g, [[0, 0.236], [0.095, 0.24], [0.115, 0.26], [0.118, 0.263], [0.113, 0.263], [0.093, 0.244], [0, 0.24]], metal(0xd8dcde, 0.18, { side: THREE.DoubleSide }), 0, 0, 0, 0, 0, 0, 48);
  return g;
}
const hexs = (n) => '#' + n.toString(16).padStart(6, '0');

function regadera(seed) {
  const g = new THREE.Group();
  const tex = canvasTex('A_galv', 256, 256, (c, w, h) => {
    const R = rng(12); c.fillStyle = '#a8aeb2'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      c.fillStyle = `rgba(${R() < 0.5 ? 255 : 60},${R() < 0.5 ? 255 : 70},${R() < 0.5 ? 255 : 80},${0.05 + R() * 0.12})`;
      c.beginPath(); const x = R() * w, y = R() * h; c.moveTo(x, y); for (let k = 0; k < 6; k++) c.lineTo(x + (R() - 0.5) * 50, y + (R() - 0.5) * 50); c.fill();
    }
  }, true);
  const galv = mat(0xffffff, { map: tex, metalness: 0.8, roughness: 0.4, env: true });
  const body = lathe(g, [[0, 0], [0.08, 0], [0.083, 0.006], [0.083, 0.02], [0.08, 0.022], [0.08, 0.19], [0.083, 0.192], [0.083, 0.2], [0.075, 0.212], [0.05, 0.22], [0, 0.222]], galv, 0, 0, 0, 0, 0, 0, 44);
  body.scale.x = 1.25;
  TO(g, 0.035, 0.004, galv, -0.03, 0.222, 0, PI / 2, 0, 0, TAU, 28);
  // pico
  SW(g, [[0.085, 0.035, 0], [0.16, 0.12, 0], [0.24, 0.215, 0], [0.27, 0.25, 0]], [0.022, 0.016, 0.012, 0.011], galv, 12, 20);
  const a = Math.atan2(0.25 - 0.215, 0.27 - 0.24);
  const rose = grp(g, 0.268, 0.248, 0, 0, 0, a - PI / 2);
  lathe(rose, [[0.011, 0], [0.018, 0.012], [0.034, 0.028], [0.036, 0.034]], galv, 0, 0, 0, 0, 0, 0, 32);
  const holes = canvasTex('A_rose', 256, 256, (c, w, h) => {
    c.fillStyle = '#9aa0a4'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a1c1e';
    for (let r = 0; r < 5; r++) { const n = r === 0 ? 1 : r * 8; for (let i = 0; i < n; i++) { const t = i / n * TAU; c.beginPath(); c.arc(w / 2 + Math.cos(t) * r * 22, h / 2 + Math.sin(t) * r * 22, 5, 0, 7); c.fill(); } }
  });
  circleDecal(rose, 0.036, holes, 0, 0.034, 0, -PI / 2, 0, 0, { metalness: 0.7, roughness: 0.4 });
  // tirante y asas
  TU(g, [[0.09, 0.17, 0], [0.13, 0.15, 0], [0.17, 0.13, 0]], 0.004, galv);
  TU(g, [[-0.07, 0.215, 0], [-0.03, 0.29, 0], [0.04, 0.3, 0], [0.08, 0.22, 0]], 0.007, galv, false, 32);
  TU(g, [[-0.1, 0.19, 0], [-0.145, 0.16, 0], [-0.15, 0.09, 0], [-0.1, 0.05, 0]], 0.007, galv, false, 32);
  return g;
}

function candado(seed) {
  const g = new THREE.Group();
  const br = C.brass();
  const face = canvasTex('A_candado', 256, 288, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#d8b060'); gr.addColorStop(1, '#8a6224');
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(70,45,10,0.7)'; c.lineWidth = 4; c.strokeRect(14, 14, w - 28, h - 28);
    c.fillStyle = 'rgba(60,38,8,0.85)'; c.font = 'bold 34px Georgia'; c.textAlign = 'center'; c.fillText('LATÓN', w / 2, 70); c.font = '22px Georgia'; c.fillText('SEGURIDAD', w / 2, 100);
    c.fillStyle = '#1a1206'; c.beginPath(); c.arc(w / 2, h * 0.62, 16, 0, 7); c.fill(); c.fillRect(w / 2 - 7, h * 0.62, 14, 44);
    c.strokeStyle = 'rgba(255,240,200,0.5)'; c.lineWidth = 3; c.beginPath(); c.arc(w / 2, h * 0.62 + 12, 34, 0, 7); c.stroke();
  });
  EXS(g, rrect(0.07, 0.08, 0.012, 0, 0.04), 0.026, [mat(0xffffff, { map: face, metalness: 0.9, roughness: 0.3, env: true }), br], 0, 0, 0, 0, 0, 0, 0.004);
  // ajusta UV de las tapas (coordenadas de forma → 0..1)
  const gm = g.children[0].geometry, uv = gm.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) + 0.039) / 0.078, (uv.getY(i) + 0.004) / 0.088);
  // arco
  const sh = [];
  for (let i = 0; i <= 16; i++) { const t = PI - i / 16 * PI; sh.push([Math.cos(t) * 0.022, 0.1 + Math.sin(t) * 0.022, 0]); }
  TU(g, [[-0.022, 0.075, 0], ...sh, [0.022, 0.09, 0], [0.022, 0.078, 0]], 0.0065, C.chrome(), false, 48);
  // llave
  const key = grp(g, 0, 0.03, 0.018, 0, 0, 0);
  CY(key, 0.0035, 0.0035, 0.03, br, 0, 0, 0.016, PI / 2, 0, 0, 10);
  EXS(key, (() => { const s = circ(0.013, 0, 0.045); s.holes.push(circ(0.005, 0, 0.049, true)); return s; })(), 0.003, br, 0, -0.045, 0.036, 0, PI / 2, 0, 0.001).rotation.set(0, PI / 2, 0);
  return g;
}

function tortilladora(seed) {
  const g = new THREE.Group();
  const iron = pick([mat(0x2a2826, { metalness: 0.6, roughness: 0.6 }), metal(0xb8bcc0, 0.45)], seed);
  lathe(g, [[0, 0.012], [0.1, 0.012], [0.103, 0.016], [0.103, 0.028], [0.1, 0.031], [0, 0.031]], iron, 0, 0, 0, 0, 0, 0, 48);
  for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + PI / 2; lathe(g, [[0, 0], [0.012, 0], [0.01, 0.013]], iron, Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08, 0, 0, 0, 12); }
  // tortilla
  const masa = canvasTex('A_masa', 128, 128, (c, w, h) => { const R = rng(3); c.fillStyle = '#e8d49a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(160,120,50,${R() * 0.3})`; c.beginPath(); c.arc(R() * w, R() * h, R() * 3, 0, 7); c.fill(); } });
  add(g, new THREE.CylinderGeometry(0.088, 0.088, 0.003, 40), texM(masa, { roughness: 0.9 }), 0.012, 0.0325, 0.01);
  // plato superior con nervaduras
  lathe(g, [[0, 0.034], [0.1, 0.034], [0.103, 0.038], [0.1, 0.048], [0.02, 0.05], [0, 0.05]], iron, 0, 0, 0, 0, 0, 0, 48);
  const ribs = [];
  for (let i = 0; i < 6; i++) { const a = i / 6 * PI; ribs.push(gx(new THREE.BoxGeometry(0.18, 0.01, 0.006), 0, 0.054, 0, 0, a, 0)); }
  merged(g, ribs, iron);
  CY(g, 0.018, 0.02, 0.012, iron, 0, 0.058, 0, 0, 0, 0, 20);
  // orejas de bisagra (atrás) y del pivote (adelante)
  for (const s of [-1, 1]) {
    EX(g, [[-0.015, 0], [0.015, 0], [0.012, 0.05], [0, 0.058], [-0.012, 0.05]], 0.008, iron, s * 0.02, 0.012, -0.108, 0, PI / 2, 0, 0.002);
    EX(g, [[-0.015, 0], [0.015, 0], [0.012, 0.06], [0, 0.068], [-0.012, 0.06]], 0.008, iron, s * 0.02, 0.012, 0.108, 0, PI / 2, 0, 0.002);
  }
  CY(g, 0.006, 0.006, 0.05, iron, 0, 0.055, -0.108, 0, 0, PI / 2, 10);
  CY(g, 0.006, 0.006, 0.05, iron, 0, 0.068, 0.108, 0, 0, PI / 2, 10);
  // palanca
  SW(g, [[0, 0.068, 0.108], [0, 0.075, 0.06], [0, 0.07, 0.0], [0, 0.085, -0.1], [0, 0.11, -0.2], [0, 0.125, -0.25]], [0.011, 0.01, 0.012, 0.01, 0.009, 0.01], iron, 12, 36, 0.7);
  return g;
}

function jarraVidrio(seed) {
  const g = new THREE.Group();
  const dia = canvasTex('A_diamante', 256, 256, (c, w, h) => {
    c.fillStyle = 'rgba(210,235,230,0.35)'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 4;
    for (let i = -8; i < 16; i++) { c.beginPath(); c.moveTo(i * 32, 0); c.lineTo(i * 32 + h, h); c.stroke(); c.beginPath(); c.moveTo(i * 32, h); c.lineTo(i * 32 + h, 0); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,0.35)'; for (let x = 0; x < w; x += 32) for (let y = 16; y < h; y += 32) { c.beginPath(); c.arc(x + 16, y, 5, 0, 7); c.fill(); }
  }, true);
  dia.repeat.set(10, 3);
  const gm = mat(0xffffff, { map: dia, transparent: true, opacity: 0.7, roughness: 0.05, metalness: 0.1, env: true, envI: 1.3, depthWrite: false, side: THREE.DoubleSide });
  const geo = latheGeo([[0, 0], [0.055, 0], [0.06, 0.01], [0.058, 0.03], [0.065, 0.08], [0.07, 0.14], [0.066, 0.19], [0.073, 0.215], [0.069, 0.216], [0.062, 0.19], [0.066, 0.14], [0.061, 0.08], [0.054, 0.03], [0, 0.012]], 48);
  // pico: estira el borde hacia +z
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const r = Math.hypot(x, z); if (r < 0.01 || y < 0.16) continue;
    const f = Math.pow(Math.max(0, z / r), 6) * ((y - 0.16) / 0.056) ** 1.5;
    p.setZ(i, z + f * 0.03); p.setY(i, y + f * 0.006);
  }
  geo.computeVertexNormals();
  add(g, geo, gm);
  lathe(g, [[0, 0.013], [0.053, 0.013], [0.059, 0.08], [0.062, 0.14], [0, 0.14]], mat(0xf2e878, { transparent: true, opacity: 0.55, roughness: 0.1 }), 0, 0, 0, 0, 0, 0, 36);
  SW(g, [[0, 0.19, -0.064], [0, 0.19, -0.1], [0, 0.14, -0.115], [0, 0.07, -0.09], [0, 0.05, -0.06]], [0.01, 0.012, 0.012, 0.011, 0.009], glassD(0xd8f0e8, 0.45), 12, 30, 1);
  // rodajas de limón flotando
  circleDecal(g, 0.02, canvasTex('A_limon', 128, 128, (c, w, h) => { c.fillStyle = '#4a9a2a'; c.beginPath(); c.arc(64, 64, 64, 0, 7); c.fill(); c.fillStyle = '#d8f0a0'; c.beginPath(); c.arc(64, 64, 56, 0, 7); c.fill(); c.strokeStyle = '#f4ffe0'; c.lineWidth = 4; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.cos(i * 0.785) * 54, 64 + Math.sin(i * 0.785) * 54); c.stroke(); } }), 0.02, 0.141, 0.01, -PI / 2, 0, 0, { transparent: true, alphaTest: 0.5 });
  return g;
}
// @@TOYS@@
// (el resto de los objetos del grupo A se agregan abajo; solo se registran los que tienen modelo)
const BUILDERS_A = {
  plancha_carbon: planchaCarbon, molcajete, olla_peltre: ollaPeltre, licuadora_retro: licuadoraRetro, lata_galletas: lataGalletas,
  despertador_campanas: despertador, tetera_esmaltada: teteraEsmaltada, lampara_queroseno: lamparaQueroseno, sifon_soda: sifonSoda,
  bascula_cocina: basculaCocina, regadera_metal: regadera, candado_laton: candado, maquina_tortillas: tortilladora, jarra_vidrio_prensado: jarraVidrio,
};
export function registerA(reg) {
  for (const it of ITEMS_A) if (BUILDERS_A[it.id]) reg(it.id, BUILDERS_A[it.id]);
}
export const BUILT_IDS = () => Object.keys(BUILDERS_A);
