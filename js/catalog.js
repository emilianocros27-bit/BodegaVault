// Datos del juego original BodegaVault (github.com/emilianocros27-bit/BodegaVault)
// Generado desde juego/js/data.js y juego-backend/src/data/*.js
// Se excluyó solo el objeto digital (Skin Galaxy Fortnite).

import * as MA from './models-more-a.js';
import * as MB from './models-more-b.js';
import * as MC from './models-more-c.js';
import * as MD from './models-more-d.js';

export const RARITIES = {
  "common": {
    "id": "common",
    "name": "Común",
    "color": "#9e9e9e",
    "bg": "rgba(158,158,158,0.15)",
    "xpMult": 1
  },
  "rare": {
    "id": "rare",
    "name": "Raro",
    "color": "#2196f3",
    "bg": "rgba(33,150,243,0.15)",
    "xpMult": 2
  },
  "epic": {
    "id": "epic",
    "name": "Épico",
    "color": "#9c27b0",
    "bg": "rgba(156,39,176,0.15)",
    "xpMult": 4
  },
  "legendary": {
    "id": "legendary",
    "name": "Legendario",
    "color": "#ff9800",
    "bg": "rgba(255,152,0,0.15)",
    "xpMult": 8
  },
  "unique": {
    "id": "unique",
    "name": "Único",
    "color": "#e91e63",
    "bg": "rgba(233,30,99,0.15)",
    "xpMult": 20
  },
  "exotic": {
    "id": "exotic",
    "name": "Exótico",
    "color": "#39FF14",
    "bg": "rgba(57,255,20,0.12)",
    "xpMult": 50
  }
};

export const CONDITIONS = {
  "new": {
    "id": "new",
    "name": "Nuevo",
    "valueMult": 1.5,
    "color": "#4caf50",
    "repairCost": 0
  },
  "used": {
    "id": "used",
    "name": "Usado",
    "valueMult": 1,
    "color": "#8bc34a",
    "repairCost": 30
  },
  "damaged": {
    "id": "damaged",
    "name": "Dañado",
    "valueMult": 0.6,
    "color": "#ff9800",
    "repairCost": 80
  },
  "very_damaged": {
    "id": "very_damaged",
    "name": "Muy Dañado",
    "valueMult": 0.3,
    "color": "#f44336",
    "repairCost": 150
  }
};

export const CATEGORIES = {
  "videogames": {
    "id": "videogames",
    "name": "Videojuegos",
    "icon": "🎮",
    "color": "#e91e63"
  },
  "electronics": {
    "id": "electronics",
    "name": "Electrónica",
    "icon": "💻",
    "color": "#2196f3"
  },
  "machines": {
    "id": "machines",
    "name": "Máquinas",
    "icon": "⚙️",
    "color": "#607d8b"
  },
  "rarities": {
    "id": "rarities",
    "name": "Rarezas",
    "icon": "💎",
    "color": "#9c27b0"
  },
  "art": {
    "id": "art",
    "name": "Arte",
    "icon": "🎨",
    "color": "#ff5722"
  },
  "music": {
    "id": "music",
    "name": "Música",
    "icon": "🎵",
    "color": "#4caf50"
  },
  "toys": {
    "id": "toys",
    "name": "Juguetes",
    "icon": "🧸",
    "color": "#ff9800"
  },
  "sports": {
    "id": "sports",
    "name": "Deportes",
    "icon": "⚽",
    "color": "#00bcd4"
  },
  "entertainment": {
    "id": "entertainment",
    "name": "Entretenimiento",
    "icon": "🎬",
    "color": "#673ab7"
  },
  "mystery": {
    "id": "mystery",
    "name": "Objetos Raros",
    "icon": "❓",
    "color": "#795548"
  },
  "everyday": {
    "id": "everyday",
    "name": "Cotidianos",
    "icon": "🏠",
    "color": "#78909c"
  },
  "valuables": {
    "id": "valuables",
    "name": "Valiosos",
    "icon": "💰",
    "color": "#ffc107"
  }
};

export const CATALOG = [
  {"id":"exclusive_compass","name":"Brújula Náutica de Capitán","category":"rarities","rarity":"rare","baseValue":600,"desc":"Exclusiva de nivel 6. Solo existe una por jugador.","exclusive":true},
  {"id":"exclusive_lamp","name":"Lámpara de Araña Imperial","category":"art","rarity":"epic","baseValue":1400,"desc":"Exclusiva de nivel 9. Pieza única de colección.","exclusive":true},
  {"id":"exclusive_armor","name":"Armadura Medieval","category":"rarities","rarity":"legendary","baseValue":4500,"desc":"Exclusiva de nivel 15. Forjada a mano.","exclusive":true},
  {"id":"exclusive_crown","name":"Corona Imperial","category":"rarities","rarity":"unique","baseValue":25000,"desc":"Exclusiva de nivel 20. Solo los grandes coleccionistas la poseen.","exclusive":true},
  {"id":"nes","name":"Nintendo NES","category":"videogames","rarity":"rare","baseValue":350,"desc":"Consola 8-bit que definió una generación."},
  {"id":"gameboy","name":"Game Boy Original","category":"videogames","rarity":"rare","baseValue":280,"desc":"La icónica portátil gris de Nintendo, 1989."},
  {"id":"atari_2600","name":"Atari 2600","category":"videogames","rarity":"rare","baseValue":320,"desc":"La primera consola doméstica masiva."},
  {"id":"snes","name":"Super Nintendo SNES","category":"videogames","rarity":"epic","baseValue":500,"desc":"Maestría gráfica de 16 bits."},
  {"id":"n64","name":"Nintendo 64","category":"videogames","rarity":"rare","baseValue":400,"desc":"La revolución del 3D doméstico."},
  {"id":"ps1","name":"PlayStation 1","category":"videogames","rarity":"common","baseValue":200,"desc":"El inicio de la era PlayStation."},
  {"id":"gbc","name":"Game Boy Color","category":"videogames","rarity":"common","baseValue":150,"desc":"La portátil que trajo color a Nintendo."},
  {"id":"game_watch","name":"Game & Watch","category":"videogames","rarity":"legendary","baseValue":1200,"desc":"El precursor de todas las portátiles Nintendo."},
  {"id":"vectrex","name":"Vectrex","category":"videogames","rarity":"epic","baseValue":800,"desc":"Consola con pantalla vectorial integrada, 1982."},
  {"id":"sega_genesis","name":"SEGA Genesis","category":"videogames","rarity":"rare","baseValue":350,"desc":"\"SEGA does what Nintendon't.\""},
  {"id":"virtualboy","name":"Virtual Boy","category":"videogames","rarity":"epic","baseValue":700,"desc":"El experimento en realidad virtual de Nintendo."},
  {"id":"neo_geo","name":"Neo Geo AES","category":"videogames","rarity":"legendary","baseValue":1800,"desc":"La consola arcade más poderosa de su era."},
  {"id":"gba","name":"Game Boy Advance SP","category":"videogames","rarity":"common","baseValue":180,"desc":"La portátil plegable de Nintendo, 2003."},
  {"id":"sega_cd","name":"SEGA CD","category":"videogames","rarity":"epic","baseValue":650,"desc":"El addon de CD para Genesis que casi nadie recuerda."},
  {"id":"mac_classic","name":"Macintosh Classic","category":"electronics","rarity":"epic","baseValue":600,"desc":"El primer Macintosh asequible de Apple, 1984."},
  {"id":"ibm_5150","name":"IBM PC 5150","category":"electronics","rarity":"legendary","baseValue":2000,"desc":"El ordenador que definió el estándar PC."},
  {"id":"c64","name":"Commodore 64","category":"electronics","rarity":"rare","baseValue":450,"desc":"El ordenador doméstico más vendido de la historia."},
  {"id":"walkman","name":"Sony Walkman TPS-L2","category":"electronics","rarity":"epic","baseValue":750,"desc":"El primer Walkman jamás producido, 1979."},
  {"id":"hp12c","name":"Calculadora HP-12C","category":"electronics","rarity":"common","baseValue":180,"desc":"Calculadora financiera legendaria."},
  {"id":"polaroid","name":"Polaroid SX-70","category":"electronics","rarity":"rare","baseValue":380,"desc":"La primera cámara Polaroid plegable SLR."},
  {"id":"betamax","name":"Sony Betamax","category":"electronics","rarity":"rare","baseValue":290,"desc":"El formato que perdió la guerra VHS vs Beta."},
  {"id":"rotary_phone","name":"Teléfono Rotatorio","category":"electronics","rarity":"common","baseValue":120,"desc":"Teléfono de disco de baquelita negra, años 60."},
  {"id":"radio_trans","name":"Radio Transistor","category":"electronics","rarity":"common","baseValue":90,"desc":"Pequeña radio portátil de los años 60."},
  {"id":"apple1_rep","name":"Apple I (Réplica)","category":"electronics","rarity":"unique","baseValue":15000,"desc":"Una rarísima réplica del primer ordenador de Apple."},
  {"id":"amiga500","name":"Commodore Amiga 500","category":"electronics","rarity":"epic","baseValue":550,"desc":"La joya de los ordenadores personales de 16 bits."},
  {"id":"underwood","name":"Máquina de Escribir Underwood","category":"machines","rarity":"common","baseValue":160,"desc":"Máquina de escribir mecánica clásica americana."},
  {"id":"leica_m3","name":"Cámara Leica M3","category":"machines","rarity":"epic","baseValue":900,"desc":"Una de las mejores cámaras telemetría jamás fabricadas."},
  {"id":"proj_8mm","name":"Proyector 8mm","category":"machines","rarity":"rare","baseValue":250,"desc":"Proyector de cine doméstico de los años 60."},
  {"id":"coffee_grd","name":"Molinillo de Café Antiguo","category":"machines","rarity":"common","baseValue":80,"desc":"Molinillo de café de madera y hierro fundido."},
  {"id":"pocket_watch","name":"Reloj de Bolsillo Dorado","category":"machines","rarity":"rare","baseValue":420,"desc":"Reloj de bolsillo con cadena dorada, circa 1920."},
  {"id":"singer","name":"Máquina de Coser Singer","category":"machines","rarity":"common","baseValue":200,"desc":"La icónica máquina de coser negra de pedal."},
  {"id":"pharmacy_sc","name":"Balanza de Farmacia","category":"machines","rarity":"rare","baseValue":300,"desc":"Balanza de precisión de latón y cristal."},
  {"id":"enigma_rep","name":"Máquina Enigma (Réplica)","category":"machines","rarity":"legendary","baseValue":2500,"desc":"Réplica funcional de la famosa máquina de cifrado."},
  {"id":"dietz_lantern","name":"Linterna Dietz","category":"machines","rarity":"common","baseValue":70,"desc":"Linterna de queroseno clásica americana."},
  {"id":"coin_1870","name":"Moneda 5 Pesetas 1870","category":"rarities","rarity":"epic","baseValue":850,"desc":"Moneda española de plata del período isabelino."},
  {"id":"silver_dol","name":"Dólar de Plata 1957","category":"rarities","rarity":"rare","baseValue":380,"desc":"Certificado de plata de los Estados Unidos."},
  {"id":"wagner_card","name":"Carta T206 H. Wagner","category":"rarities","rarity":"unique","baseValue":50000,"desc":"Una de las cartas de béisbol más raras del mundo."},
  {"id":"penny_black","name":"Sello Penny Black 1840","category":"rarities","rarity":"legendary","baseValue":3500,"desc":"El primer sello postal del mundo."},
  {"id":"chess_ivory","name":"Ajedrez de Marfil","category":"rarities","rarity":"epic","baseValue":1200,"desc":"Juego de ajedrez tallado en marfil, S.XIX."},
  {"id":"globe_antq","name":"Globo Terráqueo Antiguo","category":"rarities","rarity":"rare","baseValue":550,"desc":"Globo de madera y papel maché, circa 1890."},
  {"id":"nautical_map","name":"Mapa Náutico Antiguo","category":"rarities","rarity":"rare","baseValue":490,"desc":"Mapa náutico del Caribe, siglo XVIII."},
  {"id":"compass","name":"Brújula de Marina","category":"rarities","rarity":"rare","baseValue":320,"desc":"Brújula de latón para navegación oceánica."},
  {"id":"ammonite","name":"Fósil de Amonita","category":"rarities","rarity":"common","baseValue":140,"desc":"Fósil de cefalópodo de 150 millones de años."},
  {"id":"art_nouveau","name":"Litografía Art Nouveau","category":"art","rarity":"rare","baseValue":480,"desc":"Obra litográfica de estilo art nouveau, circa 1900."},
  {"id":"bronze_fig","name":"Figura de Bronce","category":"art","rarity":"epic","baseValue":950,"desc":"Figura de bronce fundido, estilo modernista."},
  {"id":"chinese_vase","name":"Jarrón de Porcelana China","category":"art","rarity":"epic","baseValue":1100,"desc":"Jarrón de la dinastía Ming, posible réplica tardía."},
  {"id":"venetian_mir","name":"Espejo Veneciano","category":"art","rarity":"rare","baseValue":620,"desc":"Espejo decorado con técnica veneciana, S.XIX."},
  {"id":"grandfather_c","name":"Reloj de Pie Victoriano","category":"art","rarity":"legendary","baseValue":2200,"desc":"Majestuoso reloj de caja alta, periodo victoriano."},
  {"id":"oil_painting","name":"Óleo Flamenco S.XVII","category":"art","rarity":"legendary","baseValue":3000,"desc":"Pintura al óleo de escuela flamenca, autoría incierta."},
  {"id":"les_paul_rep","name":"Gibson Les Paul 1959","category":"music","rarity":"legendary","baseValue":1800,"desc":"Réplica vintage de la guitarra más legendaria."},
  {"id":"harmonica","name":"Hohner Cromática","category":"music","rarity":"common","baseValue":110,"desc":"Harmónica cromática de metal de los años 50."},
  {"id":"beatles_vinyl","name":"Vinilo Original Beatles","category":"music","rarity":"epic","baseValue":800,"desc":"Disco de vinilo original \"Abbey Road\", 1969."},
  {"id":"music_box","name":"Caja de Música Suiza","category":"music","rarity":"rare","baseValue":440,"desc":"Caja de música mecánica de cilindro, circa 1880."},
  {"id":"banjo_1920","name":"Banjo de los Años 20","category":"music","rarity":"rare","baseValue":520,"desc":"Banjo de 5 cuerdas de la era del jazz."},
  {"id":"theremin","name":"Theremin RCA","category":"music","rarity":"legendary","baseValue":2800,"desc":"Instrumento electrónico sin contacto, rarísimo."},
  {"id":"consola_retro","name":"Consola Retro","category":"videogames","rarity":"common","baseValue":150,"desc":"Consola de los 80s, plástico gris desgastado y botones simples."},
  {"id":"cartucho_antiguo","name":"Cartucho Antiguo","category":"videogames","rarity":"common","baseValue":80,"desc":"Cartucho clásico con etiqueta gastada. ¿Qué juego habrá dentro?"},
  {"id":"disco_videojuego","name":"Disco de Videojuego Raro","category":"videogames","rarity":"rare","baseValue":600,"desc":"CD brillante con diseño futurista en caja abierta."},
  {"id":"control_vintage","name":"Control Vintage","category":"videogames","rarity":"common","baseValue":120,"desc":"Control noventero con cable y botones grandes."},
  {"id":"arcade_portatil","name":"Arcade Portátil","category":"videogames","rarity":"rare","baseValue":800,"desc":"Pequeña máquina arcade de mano con pantalla iluminada."},
  {"id":"arcade_mini","name":"Máquina Arcade Mini","category":"videogames","rarity":"rare","baseValue":1200,"desc":"Arcade en miniatura con luces neón y pantalla encendida."},
  {"id":"gameboy_clasica","name":"GameBoy Clásica","category":"videogames","rarity":"rare","baseValue":1500,"desc":"La portátil gris con pantalla verde. Icono de una generación."},
  {"id":"consola_ed_limitada","name":"Consola Edición Limitada","category":"videogames","rarity":"unique","baseValue":45000,"desc":"Consola con diseño exclusivo y colores especiales. Solo existieron 500 unidades."},
  {"id":"usb_antigua","name":"Memoria USB Antigua","category":"electronics","rarity":"common","baseValue":60,"desc":"USB vieja, diseño simple, algo rayada."},
  {"id":"computadora_vieja","name":"Computadora Vieja","category":"electronics","rarity":"common","baseValue":200,"desc":"PC de escritorio antiguo, monitor grande beige."},
  {"id":"monitor_crt","name":"Monitor CRT","category":"electronics","rarity":"common","baseValue":250,"desc":"Pantalla gruesa encendida con estática. Pesa una tonelada."},
  {"id":"teclado_vintage","name":"Teclado Mecánico Vintage","category":"electronics","rarity":"rare","baseValue":700,"desc":"Teclas grandes y gastadas que hacen un clack satisfactorio."},
  {"id":"mouse_antiguo","name":"Mouse Antiguo","category":"electronics","rarity":"common","baseValue":70,"desc":"Mouse de bola color gris con cable visible."},
  {"id":"camara_digital_vieja","name":"Cámara Digital Vieja","category":"electronics","rarity":"common","baseValue":180,"desc":"Cámara compacta de los 2000 con lente pequeño."},
  {"id":"walkman_clasico","name":"Walkman Clásico","category":"electronics","rarity":"rare","baseValue":500,"desc":"Reproductor de cassette portátil con audífonos."},
  {"id":"discman","name":"Discman","category":"electronics","rarity":"common","baseValue":300,"desc":"Reproductor de CD portátil con tapa abierta."},
  {"id":"telefono_disco","name":"Teléfono de Disco","category":"electronics","rarity":"rare","baseValue":800,"desc":"Teléfono antiguo con rueda numérica."},
  {"id":"nokia_clasico","name":"Teléfono Nokia Clásico","category":"electronics","rarity":"common","baseValue":150,"desc":"Celular antiguo pequeño con pantalla verde. Indestructible."},
  {"id":"smartphone_antiguo","name":"Smartphone Antiguo","category":"electronics","rarity":"common","baseValue":100,"desc":"Smartphone viejo con bordes gruesos y pantalla rayada."},
  {"id":"radio_vieja","name":"Radio Vieja","category":"electronics","rarity":"common","baseValue":180,"desc":"Radio portátil antigua con antena extendida."},
  {"id":"figura_accion","name":"Figura de Acción","category":"toys","rarity":"common","baseValue":100,"desc":"Figura articulada de superhéroe con colores llamativos."},
  {"id":"minifigura_colec","name":"Minifigura Coleccionable","category":"toys","rarity":"common","baseValue":80,"desc":"Figura pequeña estilo bloque, cara simple."},
  {"id":"muneca_antigua","name":"Muñeca Antigua","category":"toys","rarity":"rare","baseValue":600,"desc":"Muñeca de porcelana con vestido clásico. Ojos de cristal."},
  {"id":"peluche_vintage","name":"Peluche Vintage","category":"toys","rarity":"common","baseValue":90,"desc":"Oso de peluche viejo con costuras visibles."},
  {"id":"carrito_metal","name":"Carrito de Metal","category":"toys","rarity":"common","baseValue":120,"desc":"Coche de juguete metálico con pintura desgastada."},
  {"id":"avion_juguete","name":"Avión de Juguete","category":"toys","rarity":"common","baseValue":80,"desc":"Avión pequeño de plástico con colores brillantes."},
  {"id":"tren_electrico","name":"Tren Eléctrico","category":"toys","rarity":"rare","baseValue":1000,"desc":"Tren de juguete con rieles. Funciona con pila."},
  {"id":"robot_juguete","name":"Robot de Juguete","category":"toys","rarity":"rare","baseValue":900,"desc":"Robot retro con diseño cuadrado y ojos luminosos."},
  {"id":"dinosaurio_plastico","name":"Dinosaurio de Plástico","category":"toys","rarity":"common","baseValue":70,"desc":"Figura de dinosaurio verde texturizado."},
  {"id":"figura_ed_limitada","name":"Figura Edición Limitada","category":"toys","rarity":"epic","baseValue":3500,"desc":"Figura en caja sellada con número de edición."},
  {"id":"figura_firmada_col","name":"Figura Firmada","category":"toys","rarity":"unique","baseValue":38000,"desc":"Figura con firma original del creador en la caja. Irrepetible."},
  {"id":"set_juguetes_antiguo","name":"Set de Juguetes Antiguo","category":"toys","rarity":"rare","baseValue":1200,"desc":"Colección de juguetes en caja original."},
  {"id":"trompo","name":"Trompo","category":"toys","rarity":"common","baseValue":60,"desc":"Trompo de madera colorido."},
  {"id":"yoyo","name":"Yoyo","category":"toys","rarity":"common","baseValue":70,"desc":"Yoyo clásico con cuerda."},
  {"id":"canicas_antiguas","name":"Canicas Antiguas","category":"toys","rarity":"common","baseValue":80,"desc":"Varias canicas brillantes de cristal."},
  {"id":"muneco_cuerda","name":"Muñeco de Cuerda","category":"toys","rarity":"rare","baseValue":500,"desc":"Juguete mecánico con llave de cuerda."},
  {"id":"castillo_juguete","name":"Castillo de Juguete","category":"toys","rarity":"rare","baseValue":900,"desc":"Castillo miniatura medieval con torre y foso."},
  {"id":"pistola_juguete_vin","name":"Pistola de Juguete Vintage","category":"toys","rarity":"common","baseValue":150,"desc":"Pistola antigua de plástico con tapa de corcho."},
  {"id":"juego_mesa_antiguo","name":"Juego de Mesa Antiguo","category":"toys","rarity":"rare","baseValue":700,"desc":"Caja vieja de juego de mesa con manual en papel amarillo."},
  {"id":"rompecabezas_viejo","name":"Rompecabezas Viejo","category":"toys","rarity":"common","baseValue":100,"desc":"Puzzle incompleto sobre mesa. Faltan tres piezas."},
  {"id":"jersey_firmado","name":"Jersey Firmado","category":"sports","rarity":"unique","baseValue":50000,"desc":"Camiseta deportiva con firma auténtica de leyenda. Certificado de autenticidad incluido."},
  {"id":"balon_firmado","name":"Balón Firmado","category":"sports","rarity":"epic","baseValue":4000,"desc":"Balón con autógrafo de jugador famoso."},
  {"id":"tarjeta_deportiva","name":"Tarjeta Deportiva","category":"sports","rarity":"rare","baseValue":1500,"desc":"Tarjeta coleccionable brillante de jugador estrella."},
  {"id":"bate_firmado","name":"Bate Firmado","category":"sports","rarity":"epic","baseValue":3500,"desc":"Bate de madera con firma visible y fecha."},
  {"id":"guante_antiguo","name":"Guante Antiguo","category":"sports","rarity":"common","baseValue":200,"desc":"Guante de béisbol desgastado con forma del usuario."},
  {"id":"trofeo_viejo","name":"Trofeo Viejo","category":"sports","rarity":"rare","baseValue":800,"desc":"Trofeo dorado con una capa de polvo histórico."},
  {"id":"medalla_deportiva","name":"Medalla Deportiva","category":"sports","rarity":"rare","baseValue":600,"desc":"Medalla colgante con cinta desgastada."},
  {"id":"casco_deportivo","name":"Casco Deportivo","category":"sports","rarity":"rare","baseValue":1000,"desc":"Casco usado con marcas de impacto."},
  {"id":"zapatos_vintage","name":"Zapatos Vintage","category":"sports","rarity":"rare","baseValue":1200,"desc":"Tenis deportivos de edición clásica, colores desgastados."},
  {"id":"poster_firmado","name":"Póster Firmado","category":"sports","rarity":"rare","baseValue":1800,"desc":"Póster con firma de atleta famoso."},
  {"id":"foto_firmada","name":"Foto Firmada","category":"sports","rarity":"rare","baseValue":1500,"desc":"Fotografía deportiva autografiada en el momento decisivo."},
  {"id":"banderin","name":"Banderín","category":"sports","rarity":"common","baseValue":100,"desc":"Banderín triangular de equipo."},
  {"id":"ticket_antiguo","name":"Ticket Antiguo","category":"sports","rarity":"common","baseValue":200,"desc":"Boleto viejo de evento deportivo histórico."},
  {"id":"revista_deportiva","name":"Revista Deportiva","category":"sports","rarity":"common","baseValue":150,"desc":"Revista vieja abierta en la página del campeón."},
  {"id":"carta_rara_sport","name":"Carta Rara de Jugador","category":"sports","rarity":"unique","baseValue":55000,"desc":"Carta de jugador con impresión defectuosa de fábrica. Solo existen 50."},
  {"id":"camiseta_vintage","name":"Camiseta Vintage","category":"sports","rarity":"common","baseValue":300,"desc":"Camiseta deportiva vieja de temporada clásica."},
  {"id":"bufanda_equipo","name":"Bufanda de Equipo","category":"sports","rarity":"common","baseValue":120,"desc":"Bufanda con colores del equipo campeón."},
  {"id":"figura_deportiva","name":"Figura Deportiva","category":"sports","rarity":"rare","baseValue":700,"desc":"Figura de jugador en posición de juego."},
  {"id":"disco_conmemorativo","name":"Disco Conmemorativo","category":"sports","rarity":"rare","baseValue":900,"desc":"Placa deportiva metálica de campeonato."},
  {"id":"album_estampas","name":"Álbum de Estampas","category":"sports","rarity":"rare","baseValue":600,"desc":"Álbum de estampas parcialmente lleno."},
  {"id":"vinilo_clasico","name":"Vinilo Clásico","category":"music","rarity":"common","baseValue":200,"desc":"Disco negro con portada vintage."},
  {"id":"cassette_cinta","name":"Cassette","category":"music","rarity":"common","baseValue":100,"desc":"Cinta transparente antigua. Las caras A y B."},
  {"id":"cd_raro","name":"CD Raro","category":"music","rarity":"rare","baseValue":500,"desc":"CD brillante con diseño edición especial."},
  {"id":"poster_banda","name":"Póster de Banda","category":"music","rarity":"common","baseValue":150,"desc":"Póster musical de banda icónica."},
  {"id":"autografo_musical","name":"Autógrafo Musical","category":"music","rarity":"rare","baseValue":800,"desc":"Firma en papel de artista reconocido."},
  {"id":"guitarra_vieja","name":"Guitarra Vieja","category":"music","rarity":"unique","baseValue":42000,"desc":"Guitarra acústica con historia. Perteneció a alguien famoso."},
  {"id":"microfono_vintage","name":"Micrófono Vintage","category":"music","rarity":"rare","baseValue":1500,"desc":"Micrófono antiguo metálico estilo cabaret."},
  {"id":"bocina_antigua","name":"Bocina Antigua","category":"music","rarity":"rare","baseValue":1200,"desc":"Altavoz grande viejo con bocina de madera."},
  {"id":"radio_portatil","name":"Radio Portátil","category":"music","rarity":"common","baseValue":180,"desc":"Radio pequeña retro con antena."},
  {"id":"tocadiscos","name":"Tocadiscos","category":"music","rarity":"rare","baseValue":1800,"desc":"Reproductor de vinilo abierto. Aún gira."},
  {"id":"partitura","name":"Partitura","category":"music","rarity":"common","baseValue":120,"desc":"Hojas con notas musicales manuscritas."},
  {"id":"revista_musical","name":"Revista Musical","category":"music","rarity":"common","baseValue":100,"desc":"Revista antigua de música con entrevista histórica."},
  {"id":"entrada_concierto","name":"Entrada de Concierto","category":"music","rarity":"common","baseValue":200,"desc":"Ticket de concierto de leyenda."},
  {"id":"disco_firmado","name":"Disco Firmado","category":"music","rarity":"legendary","baseValue":12000,"desc":"Vinilo autografiado por el artista en la portada."},
  {"id":"instrumento_mini","name":"Instrumento Mini","category":"music","rarity":"rare","baseValue":600,"desc":"Instrumento pequeño de colección."},
  {"id":"caja_musical_gen","name":"Caja Musical","category":"music","rarity":"rare","baseValue":900,"desc":"Caja musical vintage con mecanismo de cilindro."},
  {"id":"audifonos_viejos","name":"Audífonos Viejos","category":"music","rarity":"common","baseValue":150,"desc":"Auriculares grandes acolchados de los 70s."},
  {"id":"mezcladora_vieja","name":"Mezcladora","category":"music","rarity":"rare","baseValue":2000,"desc":"Consola de audio analógica con muchos botones."},
  {"id":"grabadora","name":"Grabadora","category":"music","rarity":"common","baseValue":250,"desc":"Grabadora portátil de cassette."},
  {"id":"amplificador_viejo","name":"Amplificador","category":"music","rarity":"rare","baseValue":1500,"desc":"Amplificador vintage de tubos. Sonido cálido."},
  {"id":"reloj_antiguo_gen","name":"Reloj Antiguo","category":"machines","rarity":"rare","baseValue":1800,"desc":"Reloj dorado clásico de mesa."},
  {"id":"reloj_bolsillo","name":"Reloj de Bolsillo","category":"machines","rarity":"rare","baseValue":2000,"desc":"Reloj abierto con cadena. Las manecillas aún se mueven."},
  {"id":"maquina_escribir_gen","name":"Máquina de Escribir Vintage","category":"machines","rarity":"rare","baseValue":1200,"desc":"Máquina mecánica con todas las teclas."},
  {"id":"telescopio_viejo","name":"Telescopio Viejo","category":"machines","rarity":"unique","baseValue":48000,"desc":"Telescopio de latón del siglo XIX. Con él se descubrió algo importante."},
  {"id":"camara_analogica","name":"Cámara Analógica","category":"machines","rarity":"rare","baseValue":1500,"desc":"Cámara antigua con rollo adentro sin revelar."},
  {"id":"lampara_vintage","name":"Lámpara Vintage","category":"machines","rarity":"common","baseValue":300,"desc":"Lámpara de pie con pantalla de tela y luz cálida."},
  {"id":"cuadro_antiguo","name":"Cuadro Antiguo","category":"art","rarity":"rare","baseValue":2000,"desc":"Pintura clásica en marco dorado."},
  {"id":"estatua_pequena","name":"Estatua Pequeña","category":"art","rarity":"rare","baseValue":1800,"desc":"Escultura pequeña de mármol o bronce."},
  {"id":"cofre_viejo","name":"Cofre Viejo","category":"rarities","rarity":"rare","baseValue":1500,"desc":"Cofre de madera con cerradura oxidada."},
  {"id":"libro_antiguo","name":"Libro Antiguo","category":"rarities","rarity":"rare","baseValue":1200,"desc":"Libro con páginas amarillas y olor a historia."},
  {"id":"mapa_antiguo","name":"Mapa Antiguo","category":"rarities","rarity":"unique","baseValue":52000,"desc":"Mapa enrollado de región inexplorada. Anotaciones a pluma."},
  {"id":"moneda_rara","name":"Moneda Rara","category":"rarities","rarity":"rare","baseValue":1000,"desc":"Moneda metálica brillante de época desconocida."},
  {"id":"billete_antiguo","name":"Billete Antiguo","category":"rarities","rarity":"common","baseValue":350,"desc":"Billete desgastado fuera de circulación."},
  {"id":"sello_postal","name":"Sello Postal","category":"rarities","rarity":"common","baseValue":200,"desc":"Estampilla antigua con figura de personaje."},
  {"id":"pluma_fuente","name":"Pluma Fuente","category":"machines","rarity":"common","baseValue":250,"desc":"Pluma elegante de émbolo con tinta seca."},
  {"id":"diario_viejo","name":"Diario Viejo","category":"rarities","rarity":"common","baseValue":180,"desc":"Cuaderno antiguo con cierre de cuero."},
  {"id":"caja_fuerte_ant","name":"Caja Fuerte Antigua","category":"machines","rarity":"rare","baseValue":1500,"desc":"Caja metálica cerrada. Nadie sabe la combinación."},
  {"id":"llave_antigua","name":"Llave Antigua","category":"rarities","rarity":"common","baseValue":150,"desc":"Llave oxidada de hierro forjado."},
  {"id":"reloj_pared","name":"Reloj de Pared","category":"machines","rarity":"rare","baseValue":1800,"desc":"Reloj colgado de péndulo que aún marca la hora."},
  {"id":"globo_vintage","name":"Globo Terráqueo Vintage","category":"rarities","rarity":"rare","baseValue":1200,"desc":"Globo terráqueo vintage con países que ya no existen."},
  {"id":"poster_pelicula","name":"Póster de Película","category":"entertainment","rarity":"common","baseValue":150,"desc":"Cartel cinematográfico enmarcado."},
  {"id":"figura_personaje","name":"Figura de Personaje","category":"entertainment","rarity":"rare","baseValue":800,"desc":"Figura detallada de personaje icónico."},
  {"id":"dvd_raro","name":"DVD Raro","category":"entertainment","rarity":"rare","baseValue":600,"desc":"Caja de DVD edición especial fuera de catálogo."},
  {"id":"vhs_cinta","name":"VHS","category":"entertainment","rarity":"common","baseValue":150,"desc":"Cinta antigua de película. Hay que rebobinarla."},
  {"id":"guion_pelicula","name":"Guion de Película","category":"entertainment","rarity":"rare","baseValue":2000,"desc":"Hojas impresas con anotaciones del director."},
  {"id":"mascara_personaje","name":"Máscara de Personaje","category":"entertainment","rarity":"rare","baseValue":1500,"desc":"Máscara de personaje famoso, ligeramente desgastada."},
  {"id":"prop_pelicula","name":"Prop de Película","category":"entertainment","rarity":"unique","baseValue":60000,"desc":"Objeto real usado en el rodaje. Certificado oficial del estudio."},
  {"id":"figura_especial","name":"Figura Especial","category":"entertainment","rarity":"epic","baseValue":5000,"desc":"Figura en vitrina de edición muy limitada."},
  {"id":"coleccion_dvd","name":"Colección de DVD","category":"entertainment","rarity":"rare","baseValue":1000,"desc":"Varias cajas de saga completa."},
  {"id":"camara_filmacion","name":"Cámara de Filmación","category":"entertainment","rarity":"epic","baseValue":4500,"desc":"Cámara de filmación antigua usada en producciones reales."},
  {"id":"entrada_cine","name":"Entrada de Cine","category":"entertainment","rarity":"common","baseValue":100,"desc":"Ticket viejo de estreno histórico."},
  {"id":"llavero_tematico","name":"Llavero Temático","category":"entertainment","rarity":"common","baseValue":80,"desc":"Llavero de franquicia coleccionable."},
  {"id":"ropa_personaje","name":"Ropa de Personaje","category":"entertainment","rarity":"unique","baseValue":65000,"desc":"Traje icónico usado por el actor en pantalla. Con etiqueta de vestuario."},
  {"id":"casco_personaje","name":"Casco de Personaje","category":"entertainment","rarity":"epic","baseValue":6000,"desc":"Casco de personaje famoso con acabados de producción."},
  {"id":"figura_firmada_cine","name":"Figura Firmada de Cine","category":"entertainment","rarity":"legendary","baseValue":18000,"desc":"Figura autografiada por el actor protagonista."},
  {"id":"set_coleccion","name":"Set de Colección","category":"entertainment","rarity":"epic","baseValue":4000,"desc":"Colección completa de la trilogía en caja especial."},
  {"id":"estatua_grande","name":"Estatua Grande","category":"entertainment","rarity":"epic","baseValue":5500,"desc":"Figura de gran tamaño de personaje icónico."},
  {"id":"libro_arte","name":"Libro de Arte","category":"entertainment","rarity":"rare","baseValue":1200,"desc":"Libro ilustrado con arte conceptual de producción."},
  {"id":"tarjeta_promo","name":"Tarjeta Promo","category":"entertainment","rarity":"rare","baseValue":900,"desc":"Tarjeta especial de promoción de estreno."},
  {"id":"caja_edicion_prem","name":"Caja Edición Premium","category":"entertainment","rarity":"epic","baseValue":3500,"desc":"Caja premium sellada con extras exclusivos."},
  {"id":"objeto_misterioso","name":"Objeto Misterioso","category":"mystery","rarity":"rare","baseValue":1500,"desc":"Nadie sabe qué es exactamente."},
  {"id":"caja_sellada","name":"Caja Sellada","category":"mystery","rarity":"rare","baseValue":1200,"desc":"Caja cerrada sin abrir. Pesa más de lo esperado."},
  {"id":"artefacto_desc","name":"Artefacto Desconocido","category":"mystery","rarity":"epic","baseValue":5000,"desc":"Máquina extraña con mecanismos incomprensibles."},
  {"id":"maquina_incompleta","name":"Máquina Incompleta","category":"mystery","rarity":"common","baseValue":400,"desc":"Partes sueltas que alguna vez formaron algo."},
  {"id":"dispositivo_raro","name":"Dispositivo Raro","category":"mystery","rarity":"rare","baseValue":1800,"desc":"Aparato desconocido que emite calor intermitente."},
  {"id":"objeto_experimental","name":"Objeto Experimental","category":"mystery","rarity":"epic","baseValue":6500,"desc":"Tecnología extraña con etiqueta de laboratorio."},
  {"id":"prototipo","name":"Prototipo","category":"mystery","rarity":"unique","baseValue":70000,"desc":"Pieza única de tecnología avanzada. Número de serie: 001."},
  {"id":"arte_extrano","name":"Arte Extraño","category":"mystery","rarity":"rare","baseValue":2000,"desc":"Escultura rara que inquieta a quien la observa."},
  {"id":"objeto_alien","name":"Objeto Alien","category":"mystery","rarity":"unique","baseValue":75000,"desc":"Diseño futurista sin componentes identificables. Origen inexplicado."},
  {"id":"reliquia_misteriosa","name":"Reliquia","category":"mystery","rarity":"rare","baseValue":1500,"desc":"Objeto antiguo raro de procedencia desconocida."},
  {"id":"maquina_rota","name":"Máquina Rota","category":"mystery","rarity":"common","baseValue":250,"desc":"Objeto dañado irrecuperable. Curioso igual."},
  {"id":"objeto_no_ident","name":"Objeto No Identificado","category":"mystery","rarity":"rare","baseValue":1000,"desc":"Cubierto parcialmente. Nadie lo ha catalogado."},
  {"id":"dispositivo_oxidado","name":"Dispositivo Oxidado","category":"mystery","rarity":"common","baseValue":300,"desc":"Metal viejo con botones indescifrables."},
  {"id":"pieza_mecanica","name":"Pieza Mecánica","category":"mystery","rarity":"common","baseValue":180,"desc":"Engranajes y resortes de máquina desconocida."},
  {"id":"objeto_brillante","name":"Objeto Brillante","category":"mystery","rarity":"rare","baseValue":1200,"desc":"Emite una luz intensa sin batería visible."},
  {"id":"caja_rota","name":"Caja Rota","category":"mystery","rarity":"common","baseValue":150,"desc":"Caja abierta con algo adentro que no se ve bien."},
  {"id":"aparato_extrano","name":"Aparato Extraño","category":"mystery","rarity":"rare","baseValue":1500,"desc":"Máquina rara con cables de colores."},
  {"id":"herramienta_antigua","name":"Herramienta Antigua","category":"mystery","rarity":"common","baseValue":200,"desc":"Herramienta vieja de uso desconocido."},
  {"id":"artefacto_mecanico","name":"Artefacto Mecánico","category":"mystery","rarity":"unique","baseValue":72000,"desc":"Mecanismo complejo de precisión inimaginable. Funciona solo."},
  {"id":"objeto_unico_mist","name":"Objeto Único","category":"mystery","rarity":"unique","baseValue":80000,"desc":"Pieza especial irrepetible. Solo existe este ejemplar en el mundo."},
  {"id":"lata_vintage","name":"Lata Vintage","category":"everyday","rarity":"common","baseValue":80,"desc":"Lata oxidada de producto descontinuado."},
  {"id":"botella_antigua","name":"Botella Antigua","category":"everyday","rarity":"common","baseValue":120,"desc":"Botella de vidrio con etiqueta ilegible."},
  {"id":"caja_cereal","name":"Caja de Cereal","category":"everyday","rarity":"common","baseValue":60,"desc":"Caja vieja con mascota de cereal que ya no se vende."},
  {"id":"juguete_cajita_feliz","name":"Juguete Cajita Feliz","category":"everyday","rarity":"common","baseValue":100,"desc":"Juguete pequeño de hamburgesería."},
  {"id":"reloj_digital_ant","name":"Reloj Digital","category":"everyday","rarity":"common","baseValue":150,"desc":"Reloj retro con display de segmentos rojos."},
  {"id":"calculadora_vieja","name":"Calculadora","category":"everyday","rarity":"common","baseValue":120,"desc":"Calculadora vieja con teclas duras."},
  {"id":"telefono_publico","name":"Teléfono Público","category":"everyday","rarity":"rare","baseValue":800,"desc":"Teléfono de calle completo con cabina parcial."},
  {"id":"agenda_vieja","name":"Agenda","category":"everyday","rarity":"common","baseValue":80,"desc":"Libreta usada con citas de otra persona."},
  {"id":"camara_desechable","name":"Cámara Desechable","category":"everyday","rarity":"common","baseValue":100,"desc":"Cámara simple con fotos sin revelar adentro."},
  {"id":"linterna_met","name":"Linterna Metálica","category":"everyday","rarity":"common","baseValue":120,"desc":"Linterna metálica pesada. Pilas incluidas."},
  {"id":"encendedor_vin","name":"Encendedor Vintage","category":"everyday","rarity":"common","baseValue":90,"desc":"Encendedor viejo de metal con grabado."},
  {"id":"termo","name":"Termo Metálico","category":"everyday","rarity":"common","baseValue":150,"desc":"Termo metálico de marca antigua."},
  {"id":"radio_despertador","name":"Radio Despertador","category":"everyday","rarity":"common","baseValue":200,"desc":"Reloj con radio AM integrada."},
  {"id":"tv_antigua","name":"Televisión Antigua","category":"everyday","rarity":"rare","baseValue":1000,"desc":"TV pequeña antigua con antena de conejo."},
  {"id":"control_remoto_ant","name":"Control Remoto Antiguo","category":"everyday","rarity":"common","baseValue":80,"desc":"Mando viejo con muchos botones sin función."},
  {"id":"ventilador_ant","name":"Ventilador de Mesa","category":"everyday","rarity":"common","baseValue":200,"desc":"Ventilador de metal que hace ruido al girar."},
  {"id":"cafetera_antigua","name":"Cafetera Antigua","category":"everyday","rarity":"common","baseValue":250,"desc":"Cafetera de aluminio estilo italiano."},
  {"id":"taza_decorada","name":"Taza Decorada","category":"everyday","rarity":"common","baseValue":70,"desc":"Taza con diseño vintage."},
  {"id":"plato_vintage","name":"Plato Vintage","category":"everyday","rarity":"common","baseValue":80,"desc":"Plato con diseño de otra época."},
  {"id":"caja_metalica","name":"Caja Metálica","category":"everyday","rarity":"common","baseValue":150,"desc":"Caja resistente de metal con cierre a presión."},
  {"id":"reloj_lujo","name":"Reloj de Lujo","category":"valuables","rarity":"unique","baseValue":72000,"desc":"Reloj elegante de manufactura suiza limitada. Solo 100 en el mundo."},
  {"id":"collar_joya","name":"Collar de Joya","category":"valuables","rarity":"epic","baseValue":7000,"desc":"Collar brillante con piedra preciosa."},
  {"id":"anillo_detallado","name":"Anillo Detallado","category":"valuables","rarity":"epic","baseValue":5500,"desc":"Anillo con grabados y gema central."},
  {"id":"joya_vintage","name":"Joya Vintage","category":"valuables","rarity":"epic","baseValue":6000,"desc":"Accesorio antiguo con piedra de color."},
  {"id":"lingote_oro","name":"Lingote de Oro","category":"valuables","rarity":"legendary","baseValue":35000,"desc":"Barra de oro puro con sello de fundición."},
  {"id":"moneda_oro","name":"Moneda de Oro","category":"valuables","rarity":"legendary","baseValue":20000,"desc":"Moneda dorada de alta pureza."},
  {"id":"diamante_gema","name":"Diamante","category":"valuables","rarity":"legendary","baseValue":30000,"desc":"Gema brillante tallada en corte antiguo."},
  {"id":"caja_fuerte_llena","name":"Caja Fuerte con Contenido","category":"valuables","rarity":"legendary","baseValue":28000,"desc":"Caja abierta con dinero adentro. Nadie sabe de dónde viene."},
  {"id":"objeto_firmado_raro","name":"Objeto Firmado Raro","category":"valuables","rarity":"epic","baseValue":7500,"desc":"Objeto de colección con firma de personalidad histórica."},
  {"id":"edicion_limitada_val","name":"Edición Limitada","category":"valuables","rarity":"legendary","baseValue":22000,"desc":"Objeto exclusivo producido en tirada reducida."},
  {"id":"objeto_historico","name":"Objeto Histórico","category":"valuables","rarity":"unique","baseValue":68000,"desc":"Reliquia de evento histórico documentado. Museo lo quiere."},
  {"id":"reliquia_famosa","name":"Reliquia Famosa","category":"valuables","rarity":"unique","baseValue":82000,"desc":"Objeto icónico conocido en el mundo del coleccionismo."},
  {"id":"trofeo_importante","name":"Trofeo Importante","category":"valuables","rarity":"legendary","baseValue":18000,"desc":"Premio importante de competición internacional."},
  {"id":"objeto_museo","name":"Objeto de Museo","category":"valuables","rarity":"unique","baseValue":76000,"desc":"Pieza exhibida en museo. Tiene ficha oficial de catalogación."},
  {"id":"pieza_unica_val","name":"Pieza Única","category":"valuables","rarity":"unique","baseValue":85000,"desc":"Objeto irrepetible. El único de su clase."},
  {"id":"objeto_legendario","name":"Objeto Legendario","category":"valuables","rarity":"unique","baseValue":78000,"desc":"Objeto mítico cuya existencia se dudaba."},
  {"id":"coleccion_completa","name":"Colección Completa","category":"valuables","rarity":"legendary","baseValue":32000,"desc":"Set completo de serie codiciada."},
  {"id":"arte_original","name":"Arte Original","category":"valuables","rarity":"unique","baseValue":90000,"desc":"Pintura única de artista reconocido. Sin firma pero documentada."},
  {"id":"documento_firmado","name":"Documento Firmado","category":"valuables","rarity":"epic","baseValue":8000,"desc":"Papel con firma de personaje histórico."},
  {"id":"katana_feudal","name":"Katana Feudal Original","category":"rarities","rarity":"legendary","baseValue":8000,"desc":"Hoja forjada en Japón feudal, S.XVII. Jamás usada en batalla.","exclusive":true,"abismo":true},
  {"id":"diamante_xviii","name":"Diamante Tallado S.XVIII","category":"rarities","rarity":"legendary","baseValue":12000,"desc":"Diamante de corte antiguo con certificado de autenticidad.","exclusive":true,"abismo":true},
  {"id":"matrioska_imp","name":"Matrioska Imperial","category":"rarities","rarity":"legendary","baseValue":9500,"desc":"Juego de muñecas rusas de la época zarista, pintadas a mano.","exclusive":true,"abismo":true},
  {"id":"manuscrito_ilum","name":"Manuscrito Iluminado","category":"art","rarity":"unique","baseValue":50000,"desc":"Manuscrito medieval con iluminaciones en pan de oro. S.XIV.","exclusive":true,"abismo":true},
  {"id":"tridente_rep","name":"Tridente de Poseidón","category":"rarities","rarity":"unique","baseValue":75000,"desc":"Réplica arqueológica griega en bronce sólido, tallada a mano.","exclusive":true,"abismo":true},
  {"id":"nucleo_reactor","name":"Núcleo de Reactor Miniatura","category":"rarities","rarity":"exotic","baseValue":120000,"desc":"Pieza de demostración de reactor experimental, sellada en vidrio blindado.","exclusive":true,"abismo":true},
  {"id":"muestra_bio","name":"Muestra Biológica Clasificada","category":"rarities","rarity":"exotic","baseValue":150000,"desc":"Espécimen en formol con sello gubernamental ilegible. Origen desconocido.","exclusive":true,"abismo":true},
  {"id":"ojo_dios","name":"Ojo de Dios (Telescopio)","category":"machines","rarity":"exotic","baseValue":200000,"desc":"Telescopio victoriano con lentes de cristal de roca tallado a mano.","exclusive":true,"abismo":true},
  {"id":"cat_reward_electronics","name":"iPad Gold History Edition","category":"electronics","rarity":"unique","baseValue":90000,"desc":"El iPad Gold History Edition, exclusivo para quienes dominaron Electrónica.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_machines","name":"Guitarra de Jimi Hendrix","category":"machines","rarity":"unique","baseValue":95000,"desc":"La legendaria guitarra de Jimi Hendrix, recompensa por completar Máquinas.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_rarities","name":"Anillo de Campeonato NBA","category":"rarities","rarity":"unique","baseValue":88000,"desc":"Anillo de campeonato NBA auténtico, para los maestros de Rarezas.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_art","name":"Cuadro El Grito","category":"art","rarity":"unique","baseValue":92000,"desc":"Reproducción firmada de \"El Grito\" de Munch, trofeo del coleccionista de Arte.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_music","name":"Álbum de Michael Jackson","category":"music","rarity":"unique","baseValue":87000,"desc":"Álbum firmado de Michael Jackson, para quienes completaron Música.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_toys","name":"Figura de Acción Boba Fett","category":"toys","rarity":"unique","baseValue":86000,"desc":"Figura original de Boba Fett edición limitada, recompensa de Juguetes.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_sports","name":"Jersey Firmado R. Nazario","category":"sports","rarity":"unique","baseValue":93000,"desc":"Jersey firmado por Ronaldo Nazario, otorgado a los campeones de Deportes.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_entertainment","name":"Toyota Supra MK4 FF","category":"entertainment","rarity":"unique","baseValue":91000,"desc":"El Toyota Supra MK4 de Fast & Furious, exclusivo de maestros de Entretenimiento.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_mystery","name":"Robot Tesla","category":"mystery","rarity":"unique","baseValue":89000,"desc":"Prototipo del Robot Tesla, recompensa para quienes desvelaron todos los Misterios.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_everyday","name":"Espátula de Bob","category":"everyday","rarity":"unique","baseValue":84000,"desc":"La espátula dorada de Bob Esponja, otorgada al completar lo Cotidiano.","exclusive":true,"category_reward":true},
  {"id":"cat_reward_valuables","name":"Cómic Superman n.°1 (1939)","category":"valuables","rarity":"unique","baseValue":95000,"desc":"El primer cómic de Superman (1939), la joya de los coleccionistas de Valiosos.","exclusive":true,"category_reward":true},
];

export const BODEGA_TIERS = [
  {
    "id": "basica",
    "name": "Bodega Básica",
    "cost": 300,
    "itemCount": {
      "min": 2,
      "max": 4
    },
    "rarityWeights": {
      "common": 72,
      "rare": 25,
      "epic": 3,
      "legendary": 0,
      "unique": 0
    },
    "conditionWeights": {
      "new": 10,
      "used": 35,
      "damaged": 35,
      "very_damaged": 20
    },
    "unidentifiedChance": 0.15
  },
  {
    "id": "estandar",
    "name": "Bodega Estándar",
    "cost": 800,
    "itemCount": {
      "min": 3,
      "max": 5
    },
    "rarityWeights": {
      "common": 58,
      "rare": 34,
      "epic": 7,
      "legendary": 1,
      "unique": 0
    },
    "conditionWeights": {
      "new": 15,
      "used": 40,
      "damaged": 30,
      "very_damaged": 15
    },
    "unidentifiedChance": 0.2
  },
  {
    "id": "premium",
    "name": "Bodega Premium",
    "cost": 2000,
    "itemCount": {
      "min": 4,
      "max": 6
    },
    "rarityWeights": {
      "common": 40,
      "rare": 38,
      "epic": 18,
      "legendary": 3,
      "unique": 1
    },
    "conditionWeights": {
      "new": 25,
      "used": 45,
      "damaged": 20,
      "very_damaged": 10
    },
    "unidentifiedChance": 0.3
  },
  {
    "id": "rara",
    "name": "Bodega Rara",
    "cost": 5000,
    "itemCount": {
      "min": 3,
      "max": 5
    },
    "rarityWeights": {
      "common": 18,
      "rare": 42,
      "epic": 30,
      "legendary": 8,
      "unique": 2
    },
    "conditionWeights": {
      "new": 20,
      "used": 30,
      "damaged": 30,
      "very_damaged": 20
    },
    "unidentifiedChance": 0.5
  },
  {
    "id": "misteriosa",
    "name": "Bodega Misteriosa",
    "cost": 12000,
    "itemCount": {
      "min": 4,
      "max": 7
    },
    "rarityWeights": {
      "common": 10,
      "rare": 30,
      "epic": 38,
      "legendary": 17,
      "unique": 5
    },
    "conditionWeights": {
      "new": 30,
      "used": 30,
      "damaged": 25,
      "very_damaged": 15
    },
    "unidentifiedChance": 0.6
  },
  {
    "id": "magnate",
    "name": "Bóveda del Magnate",
    "cost": 150000,
    "itemCount": {
      "min": 5,
      "max": 8
    },
    "rarityWeights": {
      "common": 0,
      "rare": 0,
      "epic": 45,
      "legendary": 40,
      "unique": 15
    },
    "conditionWeights": {
      "new": 60,
      "used": 35,
      "damaged": 5,
      "very_damaged": 0
    },
    "unidentifiedChance": 0,
    "minLevel": 10
  },
  {
    "id": "abismo",
    "name": "Caja del Abismo",
    "cost": 250000,
    "itemCount": {
      "min": 2,
      "max": 4
    },
    "rarityWeights": {
      "common": 0,
      "rare": 0,
      "epic": 0,
      "legendary": 0,
      "unique": 0,
      "exotic": 0
    },
    "abismoWeights": {
      "epic": 45,
      "legendary": 35,
      "unique": 18,
      "exotic": 2
    },
    "conditionWeights": {
      "new": 80,
      "used": 20,
      "damaged": 0,
      "very_damaged": 0
    },
    "unidentifiedChance": 0,
    "minLevel": 20,
    "abismoOnly": true
  }
];

export const NPCS = [
  {
    "id": "don_miguel",
    "name": "Don Miguel",
    "title": "El Coleccionista",
    "preferredCategories": [
      "videogames"
    ],
    "categoryMultipliers": {
      "videogames": 1.25,
      "electronics": 1,
      "machines": 0.9,
      "rarities": 0.85,
      "art": 0.8,
      "music": 0.85
    },
    "tradeFrequency": 3,
    "gradeBonusThreshold": null,
    "buyPhrases": [
      "¡Esto me trae muchos recuerdos!",
      "Por esto pago bien.",
      "Lo llevo, ¿cuánto quieres?"
    ]
  },
  {
    "id": "senora_torres",
    "name": "Sra. Torres",
    "title": "Anticuaria",
    "preferredCategories": [
      "rarities",
      "art"
    ],
    "categoryMultipliers": {
      "videogames": 0.8,
      "electronics": 0.85,
      "machines": 1,
      "rarities": 1.3,
      "art": 1.2,
      "music": 1.1
    },
    "tradeFrequency": 2,
    "gradeBonusThreshold": null,
    "buyPhrases": [
      "Esto merece un lugar en mi tienda.",
      "Rarísimo. Te hago una oferta seria.",
      "Llevo años buscando algo así."
    ]
  },
  {
    "id": "el_tecnico",
    "name": "El Técnico",
    "title": "Experto Electrónica",
    "preferredCategories": [
      "electronics",
      "machines"
    ],
    "categoryMultipliers": {
      "videogames": 1,
      "electronics": 1.3,
      "machines": 1.2,
      "rarities": 0.9,
      "art": 0.75,
      "music": 0.9
    },
    "tradeFrequency": 4,
    "gradeBonusThreshold": null,
    "buyPhrases": [
      "Veo potencial en esto.",
      "Lo puedo restaurar.",
      "Trato hecho si me lo dejas a buen precio."
    ]
  },
  {
    "id": "ramiro",
    "name": "Ramiro",
    "title": "Revendedor",
    "preferredCategories": [],
    "categoryMultipliers": {
      "videogames": 0.88,
      "electronics": 0.88,
      "machines": 0.88,
      "rarities": 0.88,
      "art": 0.88,
      "music": 0.88
    },
    "tradeFrequency": 5,
    "gradeBonusThreshold": null,
    "buyPhrases": [
      "Lo tomo, pero no puedo pagar más.",
      "El mercado está difícil, pero lo llevo.",
      "¿Lo tomas o lo dejo?"
    ]
  },
  {
    "id": "dra_vega",
    "name": "Dra. Vega",
    "title": "Historiadora",
    "preferredCategories": [
      "rarities",
      "electronics",
      "music"
    ],
    "categoryMultipliers": {
      "videogames": 0.85,
      "electronics": 1.15,
      "machines": 1.1,
      "rarities": 1.2,
      "art": 1.05,
      "music": 1.15
    },
    "tradeFrequency": 2,
    "gradeBonusThreshold": 8,
    "buyPhrases": [
      "Fascinante. Esto tiene valor histórico real.",
      "Para mi investigación es perfecto.",
      "Artículo excepcional."
    ]
  },
  {
    "id": "misterioso",
    "name": "El Misterioso",
    "title": "???",
    "preferredCategories": [],
    "categoryMultipliers": {
      "videogames": 2,
      "electronics": 2,
      "machines": 2,
      "rarities": 2,
      "art": 2,
      "music": 2
    },
    "tradeFrequency": 1,
    "gradeBonusThreshold": null,
    "buyPhrases": [
      "...",
      "Sé lo que vale realmente.",
      "Nadie más te pagará esto."
    ]
  }
];

// objetos nuevos (sin duplicar ids)
// solo entran los que ya tienen modelo 3D registrado (evita cajas de reemplazo)
const HAS = new Set([MA, MB, MC, MD].flatMap(m => m.BUILT_IDS?.() ?? []));
for (const it of [...(MA.ITEMS_A ?? []), ...(MB.ITEMS_B ?? []), ...(MC.ITEMS_C ?? []), ...(MD.ITEMS_D ?? [])]) if (HAS.has(it.id) && !CATALOG.some(c => c.id === it.id)) CATALOG.push(it);
