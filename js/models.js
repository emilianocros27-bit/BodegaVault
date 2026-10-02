// Índice de modelos: id del catálogo -> constructor 3D.
import { THREE, C, mat, glossy, plastic, labelTex, artTex, RB, B, P, CY } from './modelkit.js';
import * as MU from './models-music.js';
import * as T from './models-tech.js';
import * as K from './models-collect.js';
import { makeCar } from './cars.js';
import { trashCan, trashBagMesh, waterCooler } from './props.js';
import { cactusMesh, nopalMesh, agaveMesh } from './vegetation.js';
import * as MA from './models-more-a.js';
import * as MB from './models-more-b.js';
import * as MC from './models-more-c.js';
import * as MD from './models-more-d.js';

const R = {};
const reg = (ids, fn) => ids.trim().split(/\s+/).forEach(id => (R[id] = fn));
const pick = (arr, s) => arr[s % arr.length];

// ---------- VIDEOJUEGOS ----------
reg('nes', () => T.consoleNES());
reg('snes', () => T.consoleSNES());
reg('n64', () => T.consoleN64());
reg('ps1', () => T.consolePS1());
reg('sega_genesis', () => T.consoleGenesis());
reg('sega_cd', () => T.consoleGenesis({ cd: true }));
reg('atari_2600', () => T.atari2600());
reg('neo_geo', () => T.neoGeo());
reg('consola_retro', (s) => pick([() => T.consoleSNES(), () => T.consolePS1(), () => T.consoleNES()], s)());
reg('consola_ed_limitada', () => T.limitedConsole());
reg('gameboy gameboy_clasica', () => T.handheld({ label: 'GAME BOY' }));
reg('gbc', () => T.handheld({ color: 0x6a3aa8, translucent: true, bezel: 0x2a2a2a, btn: 0x2a2a2a, label: 'COLOR' }));
reg('gba', () => T.gbaSP());
reg('game_watch', () => T.gameWatch());
reg('arcade_portatil', () => T.handheld({ color: 0xe8741a, w: 0.1, h: 0.15, btn: 0x2a2a2a, screen: 'vector', label: 'ARCADE' }));
reg('arcade_mini', () => T.arcadeMini());
reg('vectrex', () => T.vectrex());
reg('virtualboy', () => T.virtualBoy());
reg('cartucho_antiguo', (s) => cart(s));
reg('disco_videojuego', (s) => T.gameDisc(s + 3, 'LEYENDA DEL CRISTAL'));
reg('control_vintage', (s) => T.controllerOnly(pick(['nes', 'snes', 'ps'], s)));
reg('cat_reward_videogames', () => { const g = K.statue('gold', { pose: 'victory', s: 1.3 }); g.traverse(o => { if (o.isMesh && o.material.metalness > 0.5 && o.position.y > 0.05) o.material = mat(0xffffff, { map: artTex(99, 'stars', 256, 256), emissive: 0x6a2aff, emissiveIntensity: 0.25, roughness: 0.3 }); }); return g; });
function cart(s) {
  const g = new THREE.Group();
  const c = new THREE.Group(); c.position.set(0, 0.02, 0); c.rotation.x = -0.25; g.add(c);
  RB(c, 0.12, 0.13, 0.018, 0.004, plastic(0x8f8f8d), 0, 0.065, 0);
  P(c, 0.1, 0.075, artTex(s + 60, 'landscape', 200, 150, 'MUNDO PERDIDO'), 0, 0.075, 0.0095);
  for (let i = 0; i < 6; i++) B(c, 0.1, 0.002, 0.002, plastic(0x6f6f6d), 0, 0.125 - i * 0.004, 0.0095);
  B(g, 0.14, 0.012, 0.05, C.darkWood(), 0, 0.006, 0.02);
  return g;
}

// ---------- ELECTRÓNICA ----------
reg('mac_classic', () => T.macClassic());
reg('ibm_5150', () => T.ibmPC());
reg('computadora_vieja', () => T.oldTower());
reg('monitor_crt', () => { const g = new THREE.Group(); T.crtMonitor(g, 0, 0, 0, { screen: 'crt' }); return g; });
reg('c64', () => T.breadbox());
reg('amiga500', () => T.breadbox({ w: 0.48, body: plastic(0xe8e4d8), key: plastic(0xf2eee4), floppy: true, label: 'Amiga 500', bodyC: 0xe8e4d8 }));
reg('apple1_rep', () => T.apple1());
reg('walkman', () => T.walkman());
reg('walkman_clasico', () => T.walkman({ color: 0xc0c4ca, label: 'SPORTS' }));
reg('discman', () => T.discman());
reg('hp12c', () => T.calculator({ gold: true, label: '12C' }));
reg('calculadora_vieja', () => T.calculator({ body: 0x5a5448 }));
reg('polaroid', () => T.polaroid());
reg('camara_digital_vieja', () => T.compactCamera());
reg('camara_desechable', () => T.compactCamera({ body: plastic(0x2a8a3a), disposable: true }));
reg('betamax', () => T.vcr());
reg('rotary_phone', () => T.rotaryPhone());
reg('telefono_disco', () => T.rotaryPhone({ color: 0xb81c1c }));
reg('radio_trans', () => T.transistorRadio());
reg('radio_vieja', () => T.cathedralRadio());
reg('radio_portatil grabadora', () => T.boombox());
reg('radio_despertador', () => T.clockRadio());
reg('usb_antigua', () => T.usbStick());
reg('teclado_vintage', () => T.mechKeyboard());
reg('mouse_antiguo', () => T.mouseOld());
reg('nokia_clasico', () => T.nokia());
reg('smartphone_antiguo', () => T.smartphone());
reg('cat_reward_electronics', () => T.tablet());

// ---------- MÁQUINAS ----------
reg('underwood', () => T.typewriter());
reg('maquina_escribir_gen', () => T.typewriter({ color: 0x3a5a4a, label: 'Olivetti' }));
reg('leica_m3', () => T.rangefinder({ label: 'Leitz' }));
reg('camara_analogica', () => T.rangefinder());
reg('proj_8mm', () => T.projector8mm());
reg('coffee_grd', () => T.coffeeGrinder());
reg('pocket_watch reloj_bolsillo', () => T.pocketWatch());
reg('singer', () => T.sewingMachine());
reg('pharmacy_sc', () => T.pharmacyScale());
reg('enigma_rep', () => T.enigma());
reg('dietz_lantern', () => T.lantern());
reg('linterna_met', () => T.flashlight());
reg('reloj_antiguo_gen', () => T.mantelClock());
reg('reloj_pared', () => T.wallClock());
reg('grandfather_c', () => T.grandfatherClock());
reg('telescopio_viejo', () => T.telescope());
reg('ojo_dios', () => T.telescope({ future: true }));
reg('lampara_vintage', () => T.vintageLamp());
reg('exclusive_lamp', () => T.chandelier());
reg('pluma_fuente', () => T.fountainPen());
reg('caja_fuerte_ant', () => T.safe());
reg('caja_fuerte_llena', () => T.safe({ open: true, color: 0x1a2a3a }));

// ---------- RAREZAS ----------
reg('coin_1870', () => K.coin({ kind: '1870', year: '1870', legend: '5 PESETAS' }));
reg('silver_dol', () => K.coin({ kind: 'dol', year: '1957', legend: 'ONE DOLLAR' }));
reg('moneda_rara', () => K.coin({ kind: 'rara', year: '1821', legend: 'MÉXICO' }));
reg('moneda_oro', () => K.coin({ kind: 'oro', gold: true, year: '1947', legend: 'CENTENARIO', stack: true }));
reg('wagner_card', () => K.gradedCard(1, { name: 'WAGNER', team: 'PITTSBURG', grade: 'PSA 3' }));
reg('tarjeta_deportiva', (s) => K.gradedCard(s + 10, { name: 'EL TORO', team: 'DODGERS 1981', shirt: '#f2f2f2', cap: '#1a3a8a', grade: 'PSA 8' }));
reg('carta_rara_sport', () => K.gradedCard(33, { name: 'NÚMERO 23', team: 'ROOKIE 1986', bg: '#c8282a', cap: '#c8282a', shirt: '#c8282a', grade: 'GEM MT 10' }));
reg('tarjeta_promo', (s) => K.gradedCard(s + 40, { name: 'PROMO', team: 'EDICIÓN CINE', bg: '#2a1a5a', grade: 'HOLO' }));
reg('penny_black', () => K.stamp());
reg('sello_postal', () => K.stamp({ kind: 'mx', color: '#1a5a8a', legend: 'CORREOS', value: '10 CENTAVOS' }));
reg('chess_ivory', () => K.chessSet());
reg('globe_antq globo_vintage', () => K.globe());
reg('nautical_map', () => K.scroll(artTex(5, 'map', 512, 380)));
reg('mapa_antiguo', () => K.scroll(artTex(12, 'map', 512, 380), { w: 0.5, h: 0.36 }));
reg('compass exclusive_compass', () => K.compass());
reg('ammonite', () => K.ammonite());
reg('cofre_viejo', () => K.chest());
reg('libro_antiguo', () => K.book({ title: 'Quijote', color: 0x5a1a14 }));
reg('diario_viejo', () => K.book({ title: 'Diario', color: 0x3a2a1a, w: 0.14, h: 0.2, t: 0.03 }));
reg('manuscrito_ilum', () => K.book({ open: true, illum: true, color: 0x6a1a1a }));
reg('billete_antiguo', () => K.banknote());
reg('llave_antigua', () => K.key());
reg('katana_feudal', () => K.katana());
reg('diamante_xviii', () => K.diamond({ size: 1.2 }));
reg('diamante_gema', () => K.diamond());
reg('matrioska_imp', () => K.matryoshka());
reg('tridente_rep', () => K.trident());
reg('nucleo_reactor', () => K.reactorCore());
reg('muestra_bio', () => K.bioSample());
reg('cat_reward_rarities', () => K.ring({ big: true, gem: 0xffffff, box: 0x111111 }));
reg('exclusive_armor', () => armor());
reg('exclusive_crown', () => crown());

// ---------- ARTE ----------
reg('art_nouveau', () => K.framed(artTex(7, 'nouveau', 256, 360), 0.34, 0.48, { glass: true, ornate: true }));
reg('oil_painting', () => K.framed(artTex(21, 'portrait', 256, 320), 0.5, 0.62, { ornate: true, easel: true }));
reg('cuadro_antiguo', (s) => K.framed(artTex(s + 30, 'landscape', 320, 240), 0.6, 0.45, { ornate: true, easel: true }));
reg('arte_original', () => K.framed(artTex(44, 'abstract', 320, 320), 0.6, 0.6, { easel: true, frameMat: plastic(0xf2f2f2) }));
reg('arte_extrano', () => K.framed(artTex(66, 'abstract', 256, 256), 0.4, 0.4, { frameMat: C.iron() }));
reg('cat_reward_art', () => K.framed(artTex(1893, 'scream', 256, 320), 0.46, 0.58, { ornate: true, easel: true }));
reg('bronze_fig', () => K.statue('bronze', { pose: 'thinker', s: 1.2 }));
reg('estatua_pequena', () => K.statue('marble', { pose: 'bust' }));
reg('estatua_grande', () => K.statue('bronze', { pose: 'victory', s: 2.4 }));
reg('objeto_museo', () => K.statue('stone', { pose: 'idol', s: 1.8 }));
reg('venetian_mir', () => mirror());

// ---------- MÚSICA ----------
reg('les_paul_rep', (s) => MU.GUITARS[pick(['lespaul_sunburst', 'lespaul_cherry', 'lespaul_goldtop', 'lespaul_black'], s)]());
reg('guitarra_vieja', (s) => MU.GUITARS[pick(['acoustic_burst', 'acoustic_natural', 'classical'], s)]());
reg('cat_reward_machines', () => MU.GUITARS.strat_white());
reg('banjo_1920', () => MU.banjo());
reg('instrumento_mini', () => MU.GUITARS.ukulele());
reg('chinese_vase', (s) => { const [p, t] = MU.VASE_VARIANTS[s % MU.VASE_VARIANTS.length]; return MU.vase(p, t, s); });
reg('harmonica', () => MU.harmonica());
reg('beatles_vinyl', () => MU.vinylRecord(4, 'CALLE ABBEY 1969', { style: 'landscape', label: '#2a8a3a' }));
reg('vinilo_clasico', (s) => MU.vinylRecord(s + 20, 'JAZZ ’58', { style: 'abstract' }));
reg('disco_firmado', (s) => MU.vinylRecord(s + 40, 'GIRA DE ORO', { style: 'stars', signed: true }));
reg('cat_reward_music', () => MU.vinylRecord(77, 'REY DEL POP ’82', { style: 'portrait', signed: true, label: '#e8e8e8' }));
reg('cassette_cinta', (s) => MU.cassette(s));
reg('cd_raro', (s) => MU.cdCase(s + 5, 'LADOS B RAROS'));
reg('music_box caja_musical_gen', () => MU.musicBox());
reg('theremin', () => MU.theremin());
reg('microfono_vintage', () => MU.microphone());
reg('bocina_antigua', () => MU.gramophone());
reg('tocadiscos', () => MU.turntable());
reg('audifonos_viejos', () => MU.headphones());
reg('mezcladora_vieja', () => MU.mixer());
reg('amplificador_viejo', () => MU.amplifier());
reg('partitura', (s) => MU.sheetMusic(s));
reg('poster_banda', (s) => K.poster(s + 70, 'LOS ROCKEROS', { style: 'abstract' }));
reg('autografo_musical', (s) => MU.sheetMusic(s + 9, { signed: true, title: 'Para mi fan #1' }));
reg('revista_musical', (s) => K.magazine(s + 80, 'ROCK HOY'));
reg('entrada_concierto', (s) => K.ticket(s + 3, 'CONCIERTO 1985'));

// ---------- JUGUETES ----------
reg('figura_accion', (s) => K.actionFigure({ seed: s, suit: 0x2a5ab0, title: 'SÚPER AGENTE' }));
reg('figura_ed_limitada', () => K.actionFigure({ seed: 12, suit: 0xd9a93a, cape: 0xc8282a, title: 'EDICIÓN LIMITADA' }));
reg('figura_firmada_col', () => K.actionFigure({ seed: 15, suit: 0x1a1a1a, helmet: 0x1a1a1a, visor: true, signed: true, title: 'COLECCIONISTA' }));
reg('minifigura_colec', () => K.minifig());
reg('muneca_antigua', () => K.doll());
reg('peluche_vintage', () => K.teddy());
reg('carrito_metal', (s) => K.diecastCar({ color: pick([0xc8282a, 0x2a5ab0, 0x2a8a3a, 0xe8c020], s), stripe: true }));
reg('avion_juguete', () => K.toyPlane());
reg('tren_electrico', () => K.trainSet());
reg('robot_juguete', () => K.tinRobot());
reg('dinosaurio_plastico', () => K.trex());
reg('set_juguetes_antiguo', () => K.boxProduct({ w: 0.36, h: 0.08, d: 0.26, title: 'SOLDADITOS', style: 'landscape', seed: 3, pieces: true }));
reg('trompo', () => K.spinningTop());
reg('yoyo', () => K.yoyo());
reg('canicas_antiguas', () => K.marbles());
reg('muneco_cuerda', () => K.windupToy());
reg('castillo_juguete', () => K.toyCastle());
reg('pistola_juguete_vin', () => K.rayGun());
reg('juego_mesa_antiguo', () => K.boxProduct({ w: 0.36, h: 0.06, d: 0.36, title: 'LOTERÍA', style: 'nouveau', seed: 17, pieces: true, sideBg: '#8a1a1a' }));
reg('rompecabezas_viejo', () => K.boxProduct({ w: 0.3, h: 0.06, d: 0.22, title: '1000 PIEZAS', style: 'landscape', seed: 29, stand: true }));
reg('cat_reward_toys', () => K.looseFigure({ suit: 0x3a6a4a, pants: 0x5a5040, helmet: 0x3a6a4a, visor: true, jetpack: true, s: 1.2 }));

// ---------- DEPORTES ----------
reg('jersey_firmado', () => K.jersey({ num: 10, signed: true, name: 'EL CRACK' }));
reg('camiseta_vintage', (s) => K.jersey({ num: 7 + s % 5, color: '#2a8a3a', name: 'VINTAGE' }));
reg('cat_reward_sports', () => K.jersey({ num: 9, color: '#1a3a8a', trim: '#f2d01a', signed: true, name: 'NAZARIO' }));
reg('balon_firmado', () => K.soccerBall({ signed: true }));
reg('bate_firmado', () => K.bat({ signed: true }));
reg('guante_antiguo', () => K.glove());
reg('trofeo_viejo', () => K.trophy({ gold: false, text: 'LIGA 1974' }));
reg('trofeo_importante', () => K.trophy({ big: true, s: 1.8, text: 'CAMPEÓN MUNDIAL' }));
reg('medalla_deportiva', () => K.medal());
reg('casco_deportivo', () => K.helmet({ color: 0x1a3a8a }));
reg('zapatos_vintage', () => K.sneakers());
reg('poster_firmado', (s) => K.poster(s + 90, 'FINAL 1986', { style: 'portrait', signed: true }));
reg('foto_firmada', (s) => K.framed(artTex(s + 100, 'portrait', 256, 320), 0.24, 0.3, { glass: true, signed: s + 5 }));
reg('banderin', () => K.pennant());
reg('ticket_antiguo', (s) => K.ticket(s + 12, 'FINAL COPA 1970'));
reg('revista_deportiva', (s) => K.magazine(s + 120, 'GOL!'));
reg('bufanda_equipo', () => K.scarf());
reg('figura_deportiva', () => K.looseFigure({ suit: 0xc8282a, pants: 0xf2f2f2, s: 0.8 }));
reg('disco_conmemorativo', (s) => K.discStand(s + 7, 'CAMPEONES 1999'));
reg('album_estampas', () => K.stickerAlbum());

// ---------- CINE Y ENTRETENIMIENTO ----------
reg('poster_pelicula', (s) => K.poster(s + 140, 'NOCHE ESTELAR'));
reg('figura_personaje', (s) => K.looseFigure({ suit: pick([0x2a5ab0, 0x8a1a8a, 0x2a8a3a], s), cape: 0xc8282a }));
reg('dvd_raro', (s) => K.dvdCase(s + 150, 'DIRECTOR’S CUT'));
reg('coleccion_dvd', (s) => K.dvdCase(s + 160, 'SAGA', 6));
reg('vhs_cinta', (s) => K.vhs(s + 170, 'LA BODEGA ’87'));
reg('guion_pelicula', (s) => MU.sheetMusic(s + 30, { script: true, title: 'GUION · TOMA FINAL' }));
reg('mascara_personaje', (s) => K.mask({ kind: s % 2 ? 'hockey' : 'phantom' }));
reg('prop_pelicula', () => K.statue('gold', { pose: 'idol', s: 1.5 }));
reg('figura_especial', () => K.statue('marble', { pose: 'victory', s: 1.6 }));
reg('camara_filmacion', () => K.filmCamera());
reg('entrada_cine', (s) => K.ticket(s + 20, 'CINE ROYAL'));
reg('llavero_tematico', () => K.keychain());
reg('ropa_personaje', () => K.costume());
reg('casco_personaje', (s) => K.helmet({ kind: s % 2 ? 'scifi' : 'mando' }));
reg('figura_firmada_cine', () => K.actionFigure({ seed: 22, suit: 0xf2f2f2, helmet: 0xf2f2f2, visor: true, signed: true, title: 'GALAXIA' }));
reg('set_coleccion', () => K.boxProduct({ w: 0.4, h: 0.14, d: 0.3, title: 'SET COLECCIÓN', style: 'stars', seed: 31, sideBg: '#1a1a3a' }));
reg('libro_arte', () => K.book({ coverTex: artTex(41, 'stars', 256, 320), w: 0.24, h: 0.3, t: 0.035 }));
reg('caja_edicion_prem', () => K.boxProduct({ w: 0.3, h: 0.12, d: 0.3, title: 'PREMIUM', style: 'stars', seed: 51, sideBg: '#2a1a0a' }));
reg('cat_reward_entertainment', () => K.modelCar({ color: 0xe8741a }));

// ---------- OBJETOS EXTRAÑOS ----------
reg('objeto_misterioso', (s) => K.artifact('orb', s));
reg('caja_sellada', () => K.artifact('crate'));
reg('artefacto_desc', (s) => K.artifact('cube', s + 3));
reg('maquina_incompleta', (s) => K.artifact('gears', s));
reg('dispositivo_raro', (s) => K.artifact('device', s));
reg('objeto_experimental', (s) => K.artifact('device', s + 50));
reg('prototipo', () => K.artifact('ring', 7));
reg('objeto_alien', () => K.artifact('alien'));
reg('reliquia_misteriosa', () => K.chalice());
reg('maquina_rota', (s) => K.artifact('rusty', s));
reg('objeto_no_ident', (s) => K.artifact('other', s + 9));
reg('dispositivo_oxidado', (s) => K.artifact('rusty', s + 4));
reg('pieza_mecanica', (s) => K.artifact('gears', s + 11));
reg('objeto_brillante', (s) => K.artifact('orb', s + 21));
reg('caja_rota', () => K.artifact('broken'));
reg('aparato_extrano', (s) => K.artifact('device', s + 77));
reg('herramienta_antigua', () => handDrill());
reg('artefacto_mecanico', (s) => K.artifact('gears', 99));
reg('objeto_unico_mist', () => K.artifact('ring', 31));
reg('cat_reward_mystery', () => K.artifact('robot'));

// ---------- COTIDIANOS ----------
reg('lata_vintage', (s) => K.sodaCan({ color: pick(['#c8282a', '#2a6a3a', '#1a3a8a'], s) }));
reg('botella_antigua', (s) => K.bottle({ color: pick([0x2a6a4a, 0x6a3a1a, 0x3a5a8a], s) }));
reg('caja_cereal', () => K.cerealBox());
reg('juguete_cajita_feliz', () => K.happyMeal());
reg('reloj_digital_ant', () => T.digitalWatch());
reg('telefono_publico', () => T.payphone());
reg('agenda_vieja', () => K.agenda());
reg('encendedor_vin', () => T.lighter());
reg('termo', () => T.thermos());
reg('tv_antigua', () => T.tvOld());
reg('control_remoto_ant', () => T.remote());
reg('ventilador_ant', () => T.deskFan());
reg('cafetera_antigua', () => T.mokaPot());
reg('taza_decorada', (s) => T.mug({ seed: s }));
reg('plato_vintage', () => T.plate());
reg('caja_metalica', (s) => T.tinBox({ seed: s }));
reg('cat_reward_everyday', () => K.spatula());

// ---------- VALIOSOS ----------
reg('reloj_lujo', () => K.luxuryWatch());
reg('collar_joya', () => K.necklace());
reg('anillo_detallado', () => K.ring({ gem: 0xc8282a }));
reg('joya_vintage', () => K.brooch());
reg('lingote_oro', () => { const g = new THREE.Group(); for (let i = 0; i < 5; i++) T.goldBar(g, (i % 3 - 1) * 0.11 + (i > 2 ? 0.055 : 0), i > 2 ? 0.037 : 0, 0, 1); return g; });
reg('objeto_firmado_raro', () => { const g = K.soccerBall({ signed: true }); return g; });
reg('edicion_limitada_val', () => K.boxProduct({ w: 0.26, h: 0.1, d: 0.26, title: 'Nº 007/100', style: 'stars', seed: 61, sideBg: '#2a2210' }));
reg('objeto_historico', () => astrolabe());
reg('reliquia_famosa', () => K.chalice());
reg('pieza_unica_val', () => K.faberge());
reg('objeto_legendario', () => K.swordInStone());
reg('coleccion_completa', () => collectionCase());
reg('documento_firmado', (s) => K.docSigned(s + 4, 'ACTA 1810'));
reg('cat_reward_valuables', () => K.comicSlab('ACTION 1938', { logo: 'SUPER', sub: 'No. 1 · 1939' }));

// ---------- extras compuestos ----------
function armor() {
  const g = new THREE.Group();
  const st = C.chrome();
  CY(g, 0.18, 0.2, 0.04, C.darkWood(), 0, 0.02, 0, 0, 0, 0, 24);
  CY(g, 0.015, 0.015, 1.2, C.darkWood(), 0, 0.6, -0.05, 0, 0, 0, 8);
  const h = K.humanoid(g, st, { s: 3.2, y: 0.04, helmet: st, visor: mat(0x0a0a0a), boots: st });
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), st); p.position.set(s * 0.23, 1.15, 0); p.scale.set(1, 0.7, 1); p.castShadow = true; g.add(p); }
  const cape = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.8), mat(0x7a1a1a, { side: THREE.DoubleSide, roughness: 1 })); cape.position.set(0, 0.8, -0.12); g.add(cape);
  return g;
}
function crown() {
  const g = new THREE.Group();
  RB(g, 0.3, 0.08, 0.3, 0.03, mat(0x6a0a1a, { roughness: 1 }), 0, 0.04, 0);
  const gd = C.gold();
  const c = new THREE.Group(); c.position.y = 0.1; g.add(c);
  CY(c, 0.09, 0.085, 0.05, gd, 0, 0.025, 0, 0, 0, 0, 40);
  CY(c, 0.086, 0.082, 0.052, mat(0x8a0a1a, { roughness: 1, side: THREE.BackSide }), 0, 0.03, 0, 0, 0, 0, 40);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const p = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.06, 4), gd); p.position.set(Math.cos(a) * 0.088, 0.08, Math.sin(a) * 0.088); c.add(p); const gm = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), new THREE.MeshPhysicalMaterial({ color: [0xc8282a, 0x2a5ad8, 0x2a8a3a][i % 3], transmission: 0.7, roughness: 0 })); gm.position.set(Math.cos(a) * 0.09, 0.025, Math.sin(a) * 0.09); c.add(gm); const pr = new THREE.Mesh(new THREE.SphereGeometry(0.007, 10, 8), C.porcelain()); pr.position.set(Math.cos(a) * 0.088, 0.115, Math.sin(a) * 0.088); c.add(pr); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.008, 8, 32, Math.PI), gd); arch.position.y = 0.05; c.add(arch);
  const arch2 = arch.clone(); arch2.rotation.y = Math.PI / 2; c.add(arch2);
  const cr = new THREE.Mesh(new THREE.SphereGeometry(0.018, 16, 12), gd); cr.position.y = 0.145; c.add(cr);
  return g;
}
function mirror() {
  const g = new THREE.Group();
  const gd = C.gold();
  const glassM = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.02 });
  const f = new THREE.Group(); f.position.set(0, 0.5, 0); f.rotation.x = -0.1; g.add(f);
  const s = new THREE.Shape(); s.absellipse(0, 0, 0.26, 0.36, 0, Math.PI * 2);
  const hole = new THREE.Path(); hole.absellipse(0, 0, 0.21, 0.31, 0, Math.PI * 2); s.holes.push(hole);
  const fr = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, curveSegments: 48 }), gd); f.add(fr);
  const m = new THREE.Mesh(new THREE.CircleGeometry(1, 48), glassM); m.scale.set(0.215, 0.315, 1); m.position.z = 0.012; f.add(m);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const b = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), gd); b.position.set(Math.cos(a) * 0.27, Math.sin(a) * 0.37, 0.02); b.scale.set(1, 1, 0.5); f.add(b); }
  const top = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.12, 4), gd); top.position.set(0, 0.42, 0.015); f.add(top);
  B(g, 0.3, 0.02, 0.12, C.darkWood(), 0, 0.01, 0.04);
  return g;
}
function handDrill() {
  const g = new THREE.Group();
  const d = new THREE.Group(); d.position.set(0, 0.03, 0); d.rotation.z = Math.PI / 2; g.add(d);
  CY(d, 0.008, 0.008, 0.3, C.iron(), 0, 0, 0, 0, 0, 0, 8);
  CY(d, 0.02, 0.018, 0.08, C.wood(0x8a5a2a), 0, -0.18, 0, 0, 0, 0, 12);
  CY(d, 0.05, 0.05, 0.01, C.iron(), 0.02, 0.02, 0, 0, 0, Math.PI / 2, 24);
  CY(d, 0.012, 0.01, 0.06, C.wood(0x8a5a2a), 0.06, 0.05, 0, 0, 0, Math.PI / 2, 10);
  CY(d, 0.003, 0.003, 0.06, C.steel(), 0, 0.18, 0, 0, 0, 0, 6);
  return g;
}
function astrolabe() {
  const g = new THREE.Group();
  const br = C.brass();
  const a = new THREE.Group(); a.position.y = 0.2; a.rotation.x = -0.2; g.add(a);
  CY(a, 0.14, 0.14, 0.012, br, 0, 0, 0, Math.PI / 2, 0, 0, 48);
  P(a, 0.24, 0.24, labelTex('✶', { bg: '#b58a3c', fg: '#5a3a10', w: 256, h: 256, font: 'bold 200px Georgia' }), 0, 0, 0.007);
  const r = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.006, 8, 48), br); r.position.z = 0.01; a.add(r);
  B(a, 0.26, 0.008, 0.004, br, 0, 0, 0.012, 0, 0, 0.6);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 16), br); ring.position.y = 0.16; a.add(ring);
  CY(g, 0.006, 0.006, 0.08, br, 0, 0.04, 0, 0, 0, 0, 8);
  CY(g, 0.08, 0.09, 0.02, C.darkWood(), 0, 0.01, 0, 0, 0, 0, 24);
  return g;
}
function collectionCase() {
  const g = new THREE.Group();
  RB(g, 0.5, 0.05, 0.3, 0.008, C.darkWood(), 0, 0.025, 0);
  B(g, 0.48, 0.005, 0.28, mat(0x1a1a4a, { roughness: 1 }), 0, 0.052, 0);
  const items = [() => K.coin({ kind: 'oro', gold: true }), () => K.ring({ gem: 0x2a5ad8 }), () => T.pocketWatch(), () => K.brooch(), () => K.coin({ kind: 'dol' }), () => K.ring({ gem: 0x2a8a3a })];
  items.forEach((fn, i) => { const m = fn(); m.scale.setScalar(0.8); m.position.set(-0.17 + (i % 3) * 0.17, 0.055, -0.07 + Math.floor(i / 3) * 0.14); g.add(m); });
  B(g, 0.5, 0.12, 0.3, new THREE.MeshStandardMaterial({ color: 0xeef6ff, transparent: true, opacity: 0.15, roughness: 0.05, depthWrite: false }), 0, 0.11, 0).castShadow = false;
  return g;
}

MA.registerA?.(reg);
MB.registerB?.(reg);
MC.registerC?.(reg);
MD.registerD?.(reg);

// ---------- galería: variantes extra ----------
const gKeys = Object.keys(MU.GUITARS);
export const EXTRA_SHOWCASE = [
  ...gKeys.map(k => ({ id: 'guitar:' + k, name: 'Guitarra · ' + k.replace('_', ' '), category: 'music', rarity: 'rare', extra: true })),
  { id: 'banjo', name: 'Banjo', category: 'music', rarity: 'rare', extra: true },
  ...[['vocho', 0x5a8a4a], ['sedan', 0x2f5d9a], ['taxi', 0], ['pickup', 0x8a2a1a], ['police', 0]].map(([t, c]) => ({ id: `car:${t}:${c}`, name: 'Auto · ' + t, category: 'everyday', rarity: 'common', extra: true })),
  ...['trashcan', 'trashbag', 'cooler', 'cactus', 'barrel', 'nopal', 'agave'].map(k => ({ id: 'prop:' + k, name: 'Escenario · ' + k, category: 'everyday', rarity: 'common', extra: true })),
  ...MU.VASE_VARIANTS.map(([p, t], i) => ({ id: 'vase:' + i, name: `Jarrón ${p} · ${t}`, category: 'art', rarity: 'epic', extra: true })),
];

function fallback(id) {
  const g = new THREE.Group();
  RB(g, 0.3, 0.25, 0.3, 0.02, C.wood(0xa8763e), 0, 0.125, 0);
  P(g, 0.26, 0.08, labelTex(id.slice(0, 18), { bg: '#f1e6c8', fg: '#333', w: 512, h: 128, font: 'bold 44px system-ui' }), 0, 0.14, 0.151);
  return g;
}
// apoya el modelo exactamente sobre y = 0 (corrige piezas flotando o hundidas)
const _gb = new THREE.Box3();
function groundIt(g) {
  g.updateMatrixWorld(true);
  _gb.setFromObject(g);
  const dy = _gb.min.y;
  if (Number.isFinite(dy) && Math.abs(dy) > 0.0005 && Math.abs(dy) < 0.08) for (const ch of g.children) ch.position.y -= dy;
}
export function hasModel(id) { return !!R[id]; }
export function buildItem(id, seed = 1) {
  let g;
  if (id.startsWith('car:')) { const [, t, c] = id.split(':'); g = makeCar(t, +c || 0xc8c4bc); }
  else if (id.startsWith('guitar:')) g = MU.GUITARS[id.slice(7)]();
  else if (id === 'banjo') g = MU.banjo();
  else if (id.startsWith('prop:')) { const k = id.slice(5); g = new THREE.Group(); g.add(k === 'trashcan' ? trashCan(0x2458a8) : k === 'trashbag' ? trashBagMesh(seed) : k === 'cooler' ? waterCooler() : k === 'cactus' ? cactusMesh(1.2, 'column', seed) : k === 'barrel' ? cactusMesh(1.2, 'barrel', seed) : k === 'nopal' ? nopalMesh(1.1, seed) : agaveMesh(1)); }
  else if (id.startsWith('vase:')) { const [p, t] = MU.VASE_VARIANTS[+id.slice(5)]; g = MU.vase(p, t, +id.slice(5) + 1); }
  else g = (R[id] ?? (() => fallback(id)))(Math.abs(seed | 0));
  if (!id.startsWith('car:') && !id.startsWith('prop:')) groundIt(g);
  g.userData.catalogId = id;
  return g;
}
