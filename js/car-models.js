// Catálogo de autos (venta en la agencia + tráfico). Solo datos: se puede importar sin three.js.
// Cada entrada: id, brand, model, year, category, rarity, baseValue (MXN de juego), colors (hex de fábrica),
// length (m) y b = especificación geométrica para el constructor de js/cars.js.
//
// Convenciones de 'b' (todas las distancias 'd' en metros medidas desde la punta delantera):
//   L, W, H, wb (distancia entre ejes), fo (voladizo delantero = d del eje delantero), R (radio de llanta),
//   rr (radio del rin), tw (ancho de llanta), clr (altura libre de la carrocería)
//   belt: línea de cintura / cofre / cajuela [[d, y]...]; roof: perfil del habitáculo [[d, y]...]
//   ws / rg: rangos del parabrisas y medallón; win: rangos de ventanas laterales; bpil: postes negros
//   tF/nF, tR/nR: longitud y exponente del redondeo en planta (frente / cola)
//   head / grille / front / tail / rear: parches sobre la cara del frente o la cola, s = longitud de arco
//   desde el centro (un número = centrado de -s a s; [s0, s1] = par simétrico)
export const CAR_CATEGORIES = [
  { id: 'compacto', name: 'Compactos' }, { id: 'hatchback', name: 'Hatchbacks' }, { id: 'sedan', name: 'Sedanes' },
  { id: 'suv', name: 'SUV y todoterreno' }, { id: 'pickup', name: 'Pickups' }, { id: 'van', name: 'Vans' },
  { id: 'deportivo', name: 'Deportivos' }, { id: 'muscle', name: 'Muscle cars' }, { id: 'lujo', name: 'Lujo' },
  { id: 'clasico', name: 'Clásicos' }, { id: 'electrico', name: 'Eléctricos' }, { id: 'superdeportivo', name: 'Superdeportivos' },
];
export const CAR_RARITIES = ['common', 'rare', 'epic', 'legendary', 'unique', 'exotic'];

// formas normalizadas reutilizables (u: 0 interior -> 1 exterior, v: 0 abajo -> 1 arriba)
const SWOOP = [[0, 0.15], [0.55, 0], [1, 0.3], [1, 1], [0.5, 0.82], [0, 0.55]];
const SLANT = [[0, 0.05], [1, 0], [1, 0.95], [0.1, 1]];
const TRAP = [[0, 0], [1, 0], [0.9, 1], [0.1, 1]];
const TRAPI = [[0.1, 0], [0.9, 0], [1, 1], [0, 1]];
const ELL = [[0.5, 0], [0.85, 0.1], [1, 0.5], [0.85, 0.9], [0.5, 1], [0.15, 0.9], [0, 0.5], [0.15, 0.1]];
const POPUP = (x0, x1, z0, z1) => ({ x: [x0, x1], z: [z0, z1], tex: 'outline', frame: '#1a1a1a' });
const TAILW = [[0, 0.1], [1, 0], [1, 1], [0, 0.75]];
function rrq(r = 0.2, n = 4) {
  const p = [];
  for (const [cx, cy, a0] of [[1 - r, r, -Math.PI / 2], [1 - r, 1 - r, 0], [r, 1 - r, Math.PI / 2], [r, r, Math.PI]])
    for (let i = 0; i <= n; i++) { const a = a0 + (Math.PI / 2) * i / n; p.push([+(cx + Math.cos(a) * r).toFixed(3), +(cy + Math.sin(a) * r).toFixed(3)]); }
  return p;
}

export const CAR_MODELS = [
  // ============================== COMPACTOS
  { id: 'chevrolet_spark', brand: 'Chevrolet', model: 'Spark', year: 2016, category: 'compacto', rarity: 'common', baseValue: 55000, colors: [0xd61f26, 0x8ecb3a, 0xf1f1ee, 0x9ea3a8, 0x2b64b8], length: 3.64 },
  { id: 'nissan_march', brand: 'Nissan', model: 'March', year: 2015, category: 'compacto', rarity: 'common', baseValue: 65000, colors: [0xf1f1ee, 0xb3b7bb, 0xa31d24, 0x2a2c2f, 0x3a6fb0], length: 3.83 },
  { id: 'chevrolet_chevy', brand: 'Chevrolet', model: 'Chevy', year: 2008, category: 'compacto', rarity: 'common', baseValue: 45000, colors: [0xb8bcc0, 0xf1f1ee, 0xa01c22, 0x23407a, 0x1e1f21], length: 3.73 },
  { id: 'fiat_500', brand: 'Fiat', model: '500', year: 2012, category: 'compacto', rarity: 'rare', baseValue: 130000, colors: [0xd21f2b, 0xf4f1e6, 0x9fd2d8, 0xf2d14a, 0x1c1c1e], length: 3.55 },
  { id: 'mini_cooper', brand: 'Mini', model: 'Cooper', year: 2008, category: 'compacto', rarity: 'rare', baseValue: 160000, colors: [0x0b4f2e, 0xb3121b, 0xe8e2d0, 0x2d4f8e, 0x1a1a1a], length: 3.70 },
  // ============================== HATCHBACKS
  { id: 'vw_golf_a4', brand: 'Volkswagen', model: 'Golf A4', year: 2003, category: 'hatchback', rarity: 'common', baseValue: 65000, colors: [0x2a2c2f, 0xb8bcc0, 0x1f3e7a, 0xa01820, 0xf1f1ee], length: 4.15 },
  { id: 'vw_golf_gti', brand: 'Volkswagen', model: 'Golf GTI', year: 2017, category: 'hatchback', rarity: 'rare', baseValue: 250000, colors: [0xc8102e, 0xf1f1ee, 0x2a2c2f, 0x5d6166, 0x0f3d8a], length: 4.27 },
  { id: 'kia_rio', brand: 'Kia', model: 'Rio Hatchback', year: 2018, category: 'hatchback', rarity: 'common', baseValue: 95000, colors: [0xf1f1ee, 0xa0a4a8, 0xb0161c, 0x1a1a1c, 0x2d5f9e], length: 4.07 },
  { id: 'mazda_3', brand: 'Mazda', model: 'Mazda 3 Hatchback', year: 2019, category: 'hatchback', rarity: 'rare', baseValue: 180000, colors: [0x9b111e, 0x6b6e72, 0xf1f1ee, 0x1b1c1e, 0x264b7a], length: 4.46 },
  { id: 'vw_caribe', brand: 'Volkswagen', model: 'Caribe', year: 1984, category: 'hatchback', rarity: 'rare', baseValue: 125000, colors: [0xc7a24a, 0xa81c1c, 0xf1eee4, 0x2b4d82, 0x5a7a4a], length: 3.82 },
  // ============================== SEDANES
  { id: 'nissan_tsuru', brand: 'Nissan', model: 'Tsuru', year: 2010, category: 'sedan', rarity: 'common', baseValue: 50000, colors: [0xf1f1ee, 0xb8bcc0, 0x2f5d9a, 0x8a1a1a, 0x2a6a4a], length: 4.34, b: { legacy: 'sedan', L: 4.34 } },
  { id: 'nissan_versa', brand: 'Nissan', model: 'Versa', year: 2020, category: 'sedan', rarity: 'common', baseValue: 90000, colors: [0xf1f1ee, 0xa6aaae, 0x2a2c2f, 0xa11a22, 0x2b4f86], length: 4.49 },
  { id: 'nissan_sentra', brand: 'Nissan', model: 'Sentra', year: 2020, category: 'sedan', rarity: 'rare', baseValue: 140000, colors: [0x1f2022, 0xf1f1ee, 0x7a7e82, 0x9e1b22, 0x1d4a8a], length: 4.64 },
  { id: 'vw_jetta_a4', brand: 'Volkswagen', model: 'Jetta A4', year: 2005, category: 'sedan', rarity: 'common', baseValue: 70000, colors: [0xb8bcc0, 0x1e1f21, 0xf1f1ee, 0x2a3f6a, 0x6a1a22], length: 4.38 },
  { id: 'chevrolet_aveo', brand: 'Chevrolet', model: 'Aveo', year: 2012, category: 'sedan', rarity: 'common', baseValue: 70000, colors: [0xf1f1ee, 0xb3b7bb, 0x9a1c20, 0x2a2c2f, 0x23427a], length: 4.31 },
  { id: 'toyota_corolla', brand: 'Toyota', model: 'Corolla', year: 2020, category: 'sedan', rarity: 'rare', baseValue: 150000, colors: [0xf1f1ee, 0x9fa4a9, 0x1b1c1e, 0x8e1a20, 0x2c4d7a], length: 4.63 },
  { id: 'honda_civic', brand: 'Honda', model: 'Civic', year: 2017, category: 'sedan', rarity: 'rare', baseValue: 170000, colors: [0x1b1c1e, 0xf1f1ee, 0x8a8e92, 0xa3141c, 0x1f3f7e], length: 4.63 },
  // ============================== SUV
  { id: 'toyota_rav4', brand: 'Toyota', model: 'RAV4', year: 2019, category: 'suv', rarity: 'rare', baseValue: 240000, colors: [0xf1f1ee, 0x7a8a6a, 0x2a2c2f, 0x9a9ea2, 0x2b4a7a], length: 4.60 },
  { id: 'honda_crv', brand: 'Honda', model: 'CR-V', year: 2017, category: 'suv', rarity: 'rare', baseValue: 230000, colors: [0xf1f1ee, 0x5c3a2a, 0x1b1c1e, 0x9a9ea2, 0x6a1a1e], length: 4.59 },
  { id: 'jeep_wrangler', brand: 'Jeep', model: 'Wrangler Unlimited', year: 2020, category: 'suv', rarity: 'epic', baseValue: 420000, colors: [0x1b1c1e, 0xf1f1ee, 0xc8102e, 0x2d6a3a, 0xf0c21b, 0x3a74b8], length: 4.79 },
  { id: 'ford_bronco', brand: 'Ford', model: 'Bronco', year: 2021, category: 'suv', rarity: 'epic', baseValue: 480000, colors: [0x2f6fa8, 0xd8d4c8, 0x1b1c1e, 0xe07a1a, 0x5a6a4a], length: 4.81 },
  { id: 'chevrolet_suburban', brand: 'Chevrolet', model: 'Suburban', year: 2015, category: 'suv', rarity: 'epic', baseValue: 520000, colors: [0x1b1c1e, 0xf1f1ee, 0x7a7e82, 0x3a2a24, 0x2a3a5a], length: 5.70 },
  // ============================== PICKUPS
  { id: 'nissan_d21', brand: 'Nissan', model: 'Pickup D21 Estaquitas', year: 1995, category: 'pickup', rarity: 'common', baseValue: 70000, colors: [0xf1f1ee, 0x8a2a1a, 0x2a4a7a, 0x3a5a3a, 0xb0b4b8], length: 5.08, b: { legacy: 'pickup', L: 5.08 } },
  { id: 'chevrolet_silverado', brand: 'Chevrolet', model: 'Silverado', year: 2019, category: 'pickup', rarity: 'rare', baseValue: 290000, colors: [0xf1f1ee, 0x1b1c1e, 0xa3141c, 0x7a7e82, 0x2a3f6a], length: 5.89 },
  { id: 'ford_lobo', brand: 'Ford', model: 'Lobo', year: 2018, category: 'pickup', rarity: 'rare', baseValue: 280000, colors: [0x1b1c1e, 0xf1f1ee, 0x2a4c8a, 0x9a1a1e, 0x6a6e72], length: 5.89 },
  { id: 'toyota_hilux', brand: 'Toyota', model: 'Hilux', year: 2016, category: 'pickup', rarity: 'rare', baseValue: 220000, colors: [0xf1f1ee, 0x9a9ea2, 0x1b1c1e, 0x9a1a1e, 0x4a5a6a], length: 5.33 },
  { id: 'ram_1500', brand: 'RAM', model: '1500', year: 2019, category: 'pickup', rarity: 'epic', baseValue: 450000, colors: [0x1b1c1e, 0xf1f1ee, 0x8a1a1e, 0x2a3a5a, 0x6a6e72], length: 5.92 },
  // ============================== VANS
  { id: 'vw_combi', brand: 'Volkswagen', model: 'Combi T1 Samba', year: 1962, category: 'van', rarity: 'legendary', baseValue: 1100000, colors: [0x7fb5a8, 0xd0402a, 0x6f98c8, 0xe8b830, 0x5a7a4a], length: 4.28 },
  { id: 'toyota_hiace', brand: 'Toyota', model: 'Hiace', year: 2015, category: 'van', rarity: 'rare', baseValue: 180000, colors: [0xf1f1ee, 0xb8bcc0, 0x1b1c1e], length: 5.38 },
  { id: 'honda_odyssey', brand: 'Honda', model: 'Odyssey', year: 2018, category: 'van', rarity: 'rare', baseValue: 260000, colors: [0xf1f1ee, 0x1b1c1e, 0x7a7e82, 0x3a2a24, 0x2a3a5a], length: 5.16 },
  // ============================== DEPORTIVOS
  { id: 'mazda_mx5', brand: 'Mazda', model: 'MX-5 Miata', year: 1990, category: 'deportivo', rarity: 'epic', baseValue: 320000, colors: [0xc8102e, 0xf1f1ee, 0x1f4aa0, 0xe8c21a, 0x1a4a2a], length: 3.97 },
  { id: 'audi_tt', brand: 'Audi', model: 'TT Coupé', year: 2000, category: 'deportivo', rarity: 'epic', baseValue: 340000, colors: [0xb8bcc0, 0xe8e0c8, 0x1b1c1e, 0x9a1a1e, 0x2a4a8a], length: 4.04 },
  { id: 'nissan_gtr', brand: 'Nissan', model: 'GT-R', year: 2017, category: 'deportivo', rarity: 'legendary', baseValue: 1900000, colors: [0x6a6e72, 0xf1f1ee, 0x1b1c1e, 0x2a4ab0, 0xc07a1a], length: 4.71 },
  { id: 'toyota_supra', brand: 'Toyota', model: 'Supra MK4', year: 1998, category: 'deportivo', rarity: 'legendary', baseValue: 1300000, colors: [0xe07a1a, 0xf1f1ee, 0x1b1c1e, 0xb8bcc0, 0xb0141c], length: 4.52 },
  { id: 'mazda_rx7', brand: 'Mazda', model: 'RX-7 FD', year: 1993, category: 'deportivo', rarity: 'epic', baseValue: 650000, colors: [0xc8102e, 0xf2c300, 0xf1f1ee, 0x1b1c1e, 0x2a3a6a], length: 4.29 },
  { id: 'porsche_911', brand: 'Porsche', model: '911 Carrera (993)', year: 1995, category: 'deportivo', rarity: 'legendary', baseValue: 1600000, colors: [0xb8bcc0, 0xc8102e, 0xf2c300, 0x1b1c1e, 0x2a4a8a, 0xf1f1ee], length: 4.25 },
  { id: 'bmw_m3', brand: 'BMW', model: 'M3 (E46)', year: 2003, category: 'deportivo', rarity: 'epic', baseValue: 480000, colors: [0x1e4aa8, 0xb8bcc0, 0x1b1c1e, 0xc8c8c0, 0x6a7a3a], length: 4.49 },
  { id: 'lotus_elise', brand: 'Lotus', model: 'Elise', year: 2005, category: 'deportivo', rarity: 'epic', baseValue: 600000, colors: [0xf2c300, 0x1a5a2a, 0xe07a1a, 0xf1f1ee, 0xc8102e], length: 3.79 },
  // ============================== MUSCLE
  { id: 'ford_mustang_1967', brand: 'Ford', model: 'Mustang Fastback', year: 1967, category: 'muscle', rarity: 'legendary', baseValue: 1200000, colors: [0x1a4a2a, 0xc8102e, 0x1a3a7a, 0xe8e4d8, 0x2a2a2a], length: 4.72 },
  { id: 'ford_mustang', brand: 'Ford', model: 'Mustang GT', year: 2020, category: 'muscle', rarity: 'epic', baseValue: 550000, colors: [0x1f4ab8, 0xc8102e, 0x1b1c1e, 0xf2c300, 0xf1f1ee, 0xe06a1a], length: 4.79 },
  { id: 'dodge_challenger', brand: 'Dodge', model: 'Challenger R/T', year: 2020, category: 'muscle', rarity: 'epic', baseValue: 600000, colors: [0xe07a1a, 0x6a2aa0, 0x1b1c1e, 0x2a8a3a, 0xc8102e, 0xf1f1ee], length: 5.03 },
  { id: 'dodge_charger', brand: 'Dodge', model: 'Charger', year: 2020, category: 'muscle', rarity: 'epic', baseValue: 520000, colors: [0x1b1c1e, 0x7a7e82, 0xc8102e, 0xf1f1ee, 0x1f3a7a], length: 5.04 },
  { id: 'chevrolet_camaro_1969', brand: 'Chevrolet', model: 'Camaro SS', year: 1969, category: 'muscle', rarity: 'legendary', baseValue: 1100000, colors: [0xe07a1a, 0x1f4ab8, 0xf2c300, 0xc8102e, 0xe8e4d8], length: 4.72 },
  // ============================== LUJO
  { id: 'mercedes_g', brand: 'Mercedes-Benz', model: 'Clase G 500', year: 2015, category: 'lujo', rarity: 'legendary', baseValue: 2200000, colors: [0x1b1c1e, 0xf1f1ee, 0x7a7e82, 0x3a4a3a, 0x8a8a7a], length: 4.66 },
  { id: 'mercedes_sl', brand: 'Mercedes-Benz', model: 'SL 500 (R129)', year: 1995, category: 'lujo', rarity: 'epic', baseValue: 450000, colors: [0x1b1c1e, 0xb8bcc0, 0x8a1a1e, 0x1a2a4a, 0xe8e4d8], length: 4.47 },
  { id: 'cadillac_escalade', brand: 'Cadillac', model: 'Escalade', year: 2015, category: 'lujo', rarity: 'epic', baseValue: 750000, colors: [0x1b1c1e, 0xf1f1ee, 0x7a7e82, 0x3a2a24], length: 5.18 },
  { id: 'range_rover', brand: 'Land Rover', model: 'Range Rover', year: 2015, category: 'lujo', rarity: 'epic', baseValue: 780000, colors: [0x1b1c1e, 0xf1f1ee, 0x6a6e72, 0x2a3a2a, 0xb0a890], length: 5.00 },
  { id: 'bentley_continental', brand: 'Bentley', model: 'Continental GT', year: 2018, category: 'lujo', rarity: 'legendary', baseValue: 2400000, colors: [0x1a2a4a, 0x1b1c1e, 0xf1f1ee, 0x6a1a22, 0x2a4a3a], length: 4.85 },
  // ============================== CLÁSICOS
  { id: 'vw_vocho', brand: 'Volkswagen', model: 'Sedán (Vocho)', year: 1995, category: 'clasico', rarity: 'common', baseValue: 60000, colors: [0x6a8a3a, 0xf1eee4, 0x1f4a8a, 0xc8102e, 0xe8c21a, 0x2a2a2a], length: 4.06, b: { legacy: 'vocho', L: 4.06 } },
  { id: 'chevrolet_impala_1964', brand: 'Chevrolet', model: 'Impala SS', year: 1964, category: 'clasico', rarity: 'epic', baseValue: 650000, colors: [0x7a1a2a, 0x1a3a6a, 0xe8e4d8, 0x1b1c1e, 0x4a8a8a], length: 5.37 },
  { id: 'cadillac_eldorado_1959', brand: 'Cadillac', model: 'Eldorado Seville', year: 1959, category: 'clasico', rarity: 'legendary', baseValue: 1800000, colors: [0xe6a4b4, 0xe8e4d8, 0x1b1c1e, 0x8ab8d0, 0x9a1a2a], length: 5.72 },
  { id: 'ford_f100_1956', brand: 'Ford', model: 'F-100', year: 1956, category: 'clasico', rarity: 'epic', baseValue: 520000, colors: [0x3a7ab8, 0xc8102e, 0x2a6a3a, 0xe8d8a8, 0x1b1c1e], length: 4.73 },
  { id: 'bmw_e30', brand: 'BMW', model: 'Serie 3 (E30)', year: 1988, category: 'clasico', rarity: 'rare', baseValue: 190000, colors: [0xe8e4d8, 0x1b1c1e, 0x8a1a1e, 0x2a3a6a, 0xb8bcc0], length: 4.33 },
  { id: 'datsun_1600', brand: 'Nissan', model: 'Datsun 1600', year: 1972, category: 'clasico', rarity: 'rare', baseValue: 150000, colors: [0xe07a1a, 0xe8e4d8, 0x3a6a3a, 0x8a1a1e, 0x2a4a8a], length: 4.12 },
  { id: 'nissan_tsubame', brand: 'Nissan', model: 'Tsubame', year: 1991, category: 'clasico', rarity: 'common', baseValue: 45000, colors: [0xf1f1ee, 0xb8bcc0, 0x7a1a1e, 0x2a3a5a], length: 4.25 },
  { id: 'chevrolet_corvette_c2', brand: 'Chevrolet', model: 'Corvette Sting Ray', year: 1963, category: 'clasico', rarity: 'legendary', baseValue: 2300000, colors: [0xc8102e, 0x2a3a6a, 0xe8e4d8, 0x3a3a3a, 0x7a9ab8], length: 4.45 },
  // ============================== ELÉCTRICOS
  { id: 'tesla_model3', brand: 'Tesla', model: 'Model 3', year: 2020, category: 'electrico', rarity: 'epic', baseValue: 380000, colors: [0xf1f1ee, 0x1b1c1e, 0x5d6166, 0x1f3f8a, 0xa3141c], length: 4.69 },
  { id: 'tesla_cybertruck', brand: 'Tesla', model: 'Cybertruck', year: 2024, category: 'electrico', rarity: 'legendary', baseValue: 1400000, colors: [0xb4b8bc], length: 5.68 },
  { id: 'nissan_leaf', brand: 'Nissan', model: 'Leaf', year: 2018, category: 'electrico', rarity: 'rare', baseValue: 200000, colors: [0xf1f1ee, 0x2a5aa0, 0x1b1c1e, 0x9a9ea2, 0xa3141c], length: 4.48 },
  { id: 'porsche_taycan', brand: 'Porsche', model: 'Taycan', year: 2020, category: 'electrico', rarity: 'legendary', baseValue: 2200000, colors: [0x1b1c1e, 0xf1f1ee, 0x3a6ab0, 0x8a8e92, 0xa05aa0], length: 4.96 },
  // ============================== SUPERDEPORTIVOS
  { id: 'ferrari_testarossa', brand: 'Ferrari', model: 'Testarossa', year: 1986, category: 'superdeportivo', rarity: 'unique', baseValue: 3200000, colors: [0xc8102e, 0xf1f1ee, 0x1b1c1e, 0xf2c300], length: 4.49 },
  { id: 'lamborghini_countach', brand: 'Lamborghini', model: 'Countach LP5000 QV', year: 1985, category: 'superdeportivo', rarity: 'unique', baseValue: 6500000, colors: [0xc8102e, 0xf1f1ee, 0x1b1c1e, 0xf2c300], length: 4.14 },
  { id: 'lamborghini_aventador', brand: 'Lamborghini', model: 'Aventador', year: 2017, category: 'superdeportivo', rarity: 'unique', baseValue: 7000000, colors: [0x8ac81a, 0xf28a00, 0xf2c300, 0x1b1c1e, 0xf1f1ee], length: 4.78 },
  { id: 'ford_gt', brand: 'Ford', model: 'GT', year: 2005, category: 'superdeportivo', rarity: 'unique', baseValue: 5500000, colors: [0x1f4ab8, 0xc8102e, 0xf2c300, 0xf1f1ee, 0x1b1c1e], length: 4.64 },
  { id: 'ferrari_f40', brand: 'Ferrari', model: 'F40', year: 1990, category: 'superdeportivo', rarity: 'exotic', baseValue: 14000000, colors: [0xc8102e], length: 4.36 },
  { id: 'mclaren_f1', brand: 'McLaren', model: 'F1', year: 1995, category: 'superdeportivo', rarity: 'exotic', baseValue: 35000000, colors: [0x6a6e72, 0xe07a1a, 0x1b1c1e, 0xf1f1ee, 0x2a4a6a], length: 4.29 },
  { id: 'bugatti_chiron', brand: 'Bugatti', model: 'Chiron', year: 2018, category: 'superdeportivo', rarity: 'exotic', baseValue: 45000000, colors: [0x1f3a8a, 0x1b1c1e, 0xc8102e, 0xf1f1ee], length: 4.54 },
];

// ------------------------------------------------------------------ especificaciones geométricas
// perfil lateral a partir de pocas cotas: c = base del parabrisas, t = tope del parabrisas, r = fin del techo,
// q = base del medallón (d desde el frente); yb = cintura, yn = punta, yh = frente del cofre, yd = cajuela, yt = cola
function prof({ L, H, c, t, r, q, yb, yn = 0.6, yh = 0.8, yd, yt, rise = 0.03, k = 'sedan', hood = 0.5, nose = 0.2 }) {
  const ybr = yb + rise;
  yd ??= ybr + 0.01;
  yt ??= k === 'sedan' || k === 'fast' ? yd - 0.16 : ybr - 0.12;
  const belt = [[0, yn], [0.04, yn + (yh - yn) * 0.6], [nose, yh], [c * hood, yh + (yb - yh) * 0.7], [c, yb], [(c + q) / 2, yb + rise * 0.55], [q, ybr]];
  if (k === 'sedan' || k === 'fast') belt.push([Math.min(L - 0.18, q + 0.22), yd], [L - 0.09, yd - 0.005], [L - 0.025, yd - 0.05], [L, yt]);
  else belt.push([L - 0.06, ybr], [L - 0.015, ybr - 0.05], [L, yt]);
  const drop = k === 'hatch' ? 0.07 : k === 'box' ? 0.015 : 0.035;
  const roof = [[c - 0.06, yb - 0.04], [c + 0.08, yb + 0.05], [c + (t - c) * 0.5, yb + (H - yb) * 0.68], [t, H - 0.025], [t + (r - t) * 0.3, H], [t + (r - t) * 0.7, H - drop * 0.35], [r, H - drop]];
  if (k === 'box') roof.push([L - 0.03, H - 0.06], [L, ybr - 0.04]);
  else { const ye = k === 'hatch' ? ybr + 0.02 : yd + 0.02; roof.push([r + (q - r) * 0.5, (H + ye) / 2 + (H - ye) * 0.1], [q, ye], [Math.min(L, q + 0.06), ye - 0.07]); }
  return { belt, roof, ws: [c + 0.02, t - 0.02], rg: k === 'box' ? undefined : [r + 0.02, q - 0.02] };
}
const B = {};
B.toyota_corolla = {
  L: 4.63, W: 1.78, H: 1.435, wb: 2.70, fo: 0.93, R: 0.316, rr: 0.205, tw: 0.205, clr: 0.15, fbump: 0.2, rbump: 0.22,
  tF: 0.9, nF: 3.4, tR: 0.7, nR: 4, tumble: 0.34, hoodCrown: 0.04, roofCrown: 0.06,
  belt: [[0, 0.6], [0.05, 0.72], [0.2, 0.8], [0.6, 0.88], [1.35, 0.97], [2.5, 1.0], [3.8, 1.03], [4.4, 1.03], [4.58, 0.98], [4.63, 0.82]],
  roof: [[1.3, 0.96], [1.45, 1.06], [1.8, 1.27], [2.15, 1.4], [2.5, 1.435], [2.9, 1.43], [3.2, 1.39], [3.55, 1.22], [3.85, 1.06], [3.95, 1.0]],
  ws: [1.33, 2.12], rg: [3.2, 3.9], win: [[1.42, 2.55], [2.63, 3.62]], bpil: [[2.55, 2.63]], blackPillars: true,
  levels: [0.86, 0.6], doors: [1.42, 2.59, 3.36], hoodLine: 1.3, trunkLine: 3.97, hoodSides: [0.2, 1.3, 0.72],
  handles: [[2.25, 0.93], [3.15, 0.95]], handleMat: 'paint', mirror: [1.55, 1.0, 1, 'paint'], shark: 3.35,
  head: [{ s: [0.4, 1.0], y: [0.68, 0.8], tex: 'hmod', poly: SWOOP, extra: 'a' }],
  grille: [{ s: 0.4, y: [0.7, 0.76], tex: 'hbar2', bars: 'gloss', frame: 'chrome' }, { s: 0.62, y: [0.28, 0.56], tex: 'honey', frame: 'black', poly: TRAPI }],
  front: [{ s: [0.66, 0.86], y: [0.3, 0.46], kind: 'grille', tex: 'mesh', frame: 'black' }],
  tail: [{ s: [0.35, 1.05], y: [0.86, 0.98], tex: 'tmod', poly: TAILW }],
  rear: [{ s: [0.62, 0.85], y: [0.42, 0.46], tex: 'tred' }, { s: 0.7, y: [0.22, 0.34], kind: 'grille', tex: 'solid', bars: '#161616' }],
  plateF: 0.42, plateR: 0.72, wheel: { style: 'alloy10', rim: 'silver' },
};
B.vw_golf_gti = {
  L: 4.27, W: 1.80, H: 1.44, wb: 2.63, fo: 0.87, R: 0.32, rr: 0.229, tw: 0.225, clr: 0.13, fbump: 0.2, rbump: 0.26,
  tF: 0.8, nF: 3.4, tR: 0.35, nR: 5, tumble: 0.34, hoodCrown: 0.04, roofCrown: 0.06,
  belt: [[0, 0.6], [0.05, 0.72], [0.2, 0.8], [0.6, 0.88], [1.4, 0.97], [2.5, 1.0], [3.8, 1.03], [4.1, 1.03], [4.24, 0.99], [4.27, 0.9]],
  roof: [[1.36, 0.96], [1.5, 1.06], [1.85, 1.27], [2.18, 1.41], [2.6, 1.44], [3.3, 1.43], [3.75, 1.40], [3.95, 1.28], [4.12, 1.08], [4.2, 1.02]],
  ws: [1.38, 2.16], rg: [3.8, 4.14], win: [[1.45, 2.5], [2.58, 3.5]], bpil: [[2.5, 2.58]], blackPillars: true,
  levels: [0.86, 0.6], doors: [1.4, 2.54, 3.3], hoodLine: 1.36, hoodSides: [0.15, 1.36, 0.74],
  handles: [[2.2, 0.93], [3.1, 0.95]], handleMat: 'paint', mirror: [1.5, 1.0, 1, 'paint'], shark: 3.6,
  head: [{ s: [0.34, 0.9], y: [0.7, 0.8], tex: 'hmod', poly: SLANT }],
  grille: [{ s: 0.36, y: [0.715, 0.79], tex: 'honey', frame: 'none' }, { s: 0.36, y: [0.702, 0.713], tex: 'solid', bars: '#d01010' }, { s: 0.52, y: [0.26, 0.52], tex: 'honey', frame: 'black', poly: TRAPI }],
  front: [{ s: [0.6, 0.84], y: [0.3, 0.48], kind: 'grille', tex: 'honey', frame: 'black' }, { s: [0.66, 0.78], y: [0.34, 0.4], tex: 'fog' }],
  tail: [{ s: [0.3, 0.95], y: [0.9, 1.0], tex: 'tmod', poly: TAILW }],
  rear: [{ s: 0.8, y: [0.2, 0.32], kind: 'grille', tex: 'solid', bars: '#161616' }],
  exhaust: [{ z: 0.55, y: 0.27, r: 0.045 }],
  plateF: 0.42, plateR: 0.62, badge: 'GTI', badgeY: 0.8, wheel: { style: 'y', rim: 'silver', caliper: 0xc01010 },
  extras: [{ type: 'lip', d: 3.8, chord: 0.22, span: 1.3, h: 0.02, tilt: 0.1, mat: 'paint' }],
};
B.jeep_wrangler = {
  L: 4.55, W: 1.78, H: 1.84, wb: 3.01, fo: 0.72, R: 0.40, rr: 0.216, tw: 0.25, clr: 0.25, fbump: 0.1, rbump: 0.1, track: 1.64,
  tF: 0.18, nF: 6, tR: 0.12, nR: 8, tumble: 0.06, hoodCrown: 0.015, roofCrown: 0.02, crownExp: 5, shoulder: 0.99, tuck: 0.02, pillarW: 0.07,
  belt: [[0, 1.0], [0.04, 1.07], [1.3, 1.16], [2.6, 1.2], [4.5, 1.22], [4.55, 1.12]],
  roof: [[1.28, 1.14], [1.36, 1.28], [1.78, 1.82], [1.9, 1.84], [4.45, 1.84], [4.53, 1.8], [4.55, 1.05]],
  ws: [1.3, 1.8], win: [[1.45, 2.5], [2.62, 3.5], [3.62, 4.42]], bpil: [[2.5, 2.62], [3.5, 3.62]], blackPillars: true, roofMat: 'black',
  doors: [1.45, 2.56, 3.5], handles: [[2.35, 1.07], [3.35, 1.07]], mirror: [1.55, 1.24, 1.25, 'black'], wipers: true,
  head: [{ round: 0.105, s: 0.56, y: 0.9, bezel: 'black', out: 0.02 }],
  grille: [{ s: 0.46, y: [0.76, 1.03], tex: 'slots7', bars: 'black', frame: 'none' }],
  front: [{ s: [0.62, 0.78], y: [0.62, 0.7], tex: 'amber' }],
  rear: [{ s: 0.7, y: [1.28, 1.74], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.7, 0.9], y: [0.72, 1.02], tex: 'tred2' }],
  bumpF: [{ y: 0.5, h: 0.2, d: 0.14, mat: 'black', s: 1.0 }], bumpR: [{ y: 0.5, h: 0.18, d: 0.1, mat: 'black', s: 1.0 }],
  arches: { mat: 'plastic', r: 0.06, flare: 0.06, grow: 0.03 }, plateF: 0.5, plateR: 0.78, badge: 'WRANGLER', badgeS: 0.55, badgeY: 1.05,
  wheel: { style: 'offroad', rim: 'dark' },
  extras: [{ type: 'spare', y: 1.0, r: 0.39, style: 'offroad', rim: 'dark' }, { type: 'hinges', d: [1.5, 2.62], y: [1.0, 0.74] }, { type: 'steps', x: [1.3, 3.45], y: 0.42, mat: 'black' }],
};
B.porsche_911 = {
  L: 4.245, W: 1.735, H: 1.30, wb: 2.27, fo: 0.94, R: 0.31, rr: 0.216, tw: 0.225, clr: 0.13, fbump: 0.12, rbump: 0.15,
  tF: 0.75, nF: 2.6, tR: 0.55, nR: 3.2, tumble: 0.5, shoulder: 0.95, hoodCrown: 0.03, roofCrown: 0.07, pillarW: 0.05,
  belt: [[0, 0.46], [0.05, 0.55], [0.3, 0.64], [0.8, 0.76], [1.35, 0.86], [2.3, 0.9], [3.3, 0.92], [3.7, 0.88], [4.05, 0.79], [4.2, 0.68], [4.245, 0.56]],
  fender: [[0.02, 0], [0.25, 0.1], [0.6, 0.11], [1.0, 0.07], [1.35, 0], [3.55, 0], [3.8, 0.06], [4.05, 0.05], [4.24, 0]],
  roof: [[1.3, 0.85], [1.45, 0.96], [1.75, 1.16], [2.0, 1.27], [2.3, 1.3], [2.65, 1.27], [3.0, 1.17], [3.3, 1.04], [3.6, 0.93], [3.85, 0.86]],
  ws: [1.33, 1.98], rg: [2.95, 3.55], win: [[1.45, 2.68], [2.74, 3.12]], bpil: [[2.68, 2.74]], blackPillars: true,
  doors: [1.5, 2.72], handles: [[2.5, 0.86]], mirror: [1.52, 0.93, 0.9, 'paint'], hoodLine: 1.3, hoodSides: [0.12, 1.3, 0.6],
  head: [{ round: 0.1, s: 0.56, y: 0.62, tilt: 0.55, bezel: 'paint', out: 0.0, depth: 0.03, dome: 0.35 }],
  front: [{ s: 0.36, y: [0.2, 0.32], kind: 'grille', tex: 'mesh', frame: 'black' }, { s: [0.44, 0.74], y: [0.28, 0.36], tex: 'hrecta' }],
  tail: [{ s: 0.88, y: [0.62, 0.72], tex: 'tred' }],
  rear: [{ s: [0.42, 0.72], y: [0.3, 0.36], tex: 'tred' }],
  top: [{ x: [3.78, 4.02], z: [-0.32, 0.32], tex: 'louver', bars: '#3a3a3a' }],
  exhaust: [{ z: 0.4, y: 0.24, r: 0.04, n: 2, gap: 0.09, both: false }],
  plateF: 0.36, plateR: 0.48, badge: 'PORSCHE', badgeS: 0, badgeY: 0.67, wheel: { style: 'alloy5', rim: 'silver' },
};
B.lamborghini_countach = {
  L: 4.14, W: 2.0, H: 1.07, wb: 2.45, fo: 0.98, R: 0.31, rr: 0.19, tw: 0.28, clr: 0.12, fbump: 0.14, rbump: 0.12,
  tF: 0.9, nF: 2.4, tR: 0.22, nR: 7, tumble: 0.6, shoulder: 0.93, hoodCrown: 0.02, roofCrown: 0.05, pillarW: 0.05,
  belt: [[0, 0.5], [0.08, 0.56], [1.35, 0.8], [2.0, 0.84], [2.6, 0.9], [3.5, 0.95], [4.05, 0.93], [4.14, 0.84]],
  roof: [[1.3, 0.79], [1.4, 0.84], [1.7, 0.96], [2.05, 1.06], [2.3, 1.07], [2.6, 1.05], [3.0, 1.0], [3.35, 0.97], [3.45, 0.94]],
  ws: [1.35, 2.05], rg: [2.55, 2.95], win: [[1.52, 2.45]], blackPillars: true,
  doors: [1.45, 2.5], mirror: [1.5, 0.9, 0.9, 'black'],
  top: [POPUP(0.25, 0.6, 0.35, 0.78), { x: [3.25, 3.95], z: [-0.42, 0.42], tex: 'louver', bars: '#2a2a2a' }],
  front: [{ s: [0.35, 0.95], y: [0.42, 0.49], tex: 'hrecta' }, { s: 0.3, y: [0.22, 0.34], kind: 'grille', tex: 'hbar', frame: 'black' }],
  side: [{ x: [2.4, 3.1], y: [0.6, 0.86], tex: 'naca', poly: [[0, 0.75], [1, 0.1], [1, 1], [0, 1]] }],
  rear: [{ s: 0.98, y: [0.5, 0.8], kind: 'grille', tex: 'hbar2', bars: 'black', frame: 'none' }],
  tail: [{ s: [0.45, 0.95], y: [0.6, 0.76], tex: 'tclassic' }],
  exhaust: [{ z: 0.26, y: 0.36, r: 0.045, n: 2, gap: 0.1 }],
  arches: { mat: 'paint', r: 0.04, flare: 0.05 },
  plateF: null, plateR: 0.42, badge: 'COUNTACH', badgeS: 0.5, badgeY: 0.86, wheel: { style: 'dish', rim: 'gold' },
  extras: [{ type: 'wing', d: 3.95, y: 1.2, span: 1.7, chord: 0.36, post: 0.34 }, { type: 'airbox', d: 2.95, l: 0.6, h: 0.14, w: 0.36 }],
};

// ---------- compactos
B.chevrolet_spark = {
  L: 3.64, W: 1.6, H: 1.48, wb: 2.39, fo: 0.72, R: 0.29, rr: 0.19, tw: 0.185, clr: 0.15, fbump: 0.2, rbump: 0.28,
  tF: 0.7, nF: 3, tR: 0.3, nR: 4.5, tumble: 0.3, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 3.64, H: 1.48, c: 1.08, t: 1.75, r: 3.2, q: 3.56, yb: 0.97, yn: 0.62, yh: 0.8, rise: 0.06, k: 'hatch' }),
  win: [[1.2, 2.2], [2.28, 3.02]], bpil: [[2.2, 2.28]], blackPillars: true, levels: [0.84, 0.6],
  doors: [1.17, 2.24, 3.0], hoodLine: 1.05, hoodSides: [0.15, 1.05, 0.72], handles: [[1.95, 0.92]], handleMat: 'paint', mirror: [1.25, 1.0, 0.9, 'black'],
  head: [{ s: [0.28, 0.82], y: [0.66, 0.86], tex: 'hmod', poly: [[0, 0.3], [0.5, 0.1], [1, 0], [1, 1], [0.5, 0.7], [0, 0.55]], extra: 'a' }],
  grille: [{ s: 0.26, y: [0.68, 0.76], tex: 'hbar3', bars: 'chrome', frame: 'chrome' }, { s: 0.45, y: [0.32, 0.58], tex: 'honey', frame: 'black', poly: TRAPI }],
  front: [{ s: [0.55, 0.72], y: [0.36, 0.46], tex: 'fog' }],
  tail: [{ s: [0.5, 0.9], y: [0.8, 1.15], tex: 'tred2', poly: [[0, 0.6], [0.5, 0], [1, 0], [1, 1], [0.6, 1]] }],
  rear: [{ s: 0.65, y: [0.24, 0.36], kind: 'grille', tex: 'solid', bars: '#1a1a1a' }],
  plateF: 0.44, plateR: 0.62, wheel: { style: 'alloy5', rim: 'silver' }, extras: [{ type: 'lip', d: 3.22, chord: 0.14, span: 1.2, h: 0.0, tilt: 0.1 }],
};
B.nissan_march = {
  L: 3.83, W: 1.67, H: 1.52, wb: 2.45, fo: 0.76, R: 0.29, rr: 0.19, tw: 0.185, clr: 0.15, fbump: 0.2, rbump: 0.26,
  tF: 0.8, nF: 2.6, tR: 0.4, nR: 3.5, tumble: 0.34, hoodCrown: 0.05, roofCrown: 0.08,
  ...prof({ L: 3.83, H: 1.52, c: 1.15, t: 1.85, r: 3.35, q: 3.74, yb: 0.98, yn: 0.62, yh: 0.8, rise: 0.04, k: 'hatch' }),
  win: [[1.28, 2.35], [2.43, 3.2]], bpil: [[2.35, 2.43]], blackPillars: true, levels: [0.84, 0.6],
  doors: [1.24, 2.39, 3.15], hoodLine: 1.12, handles: [[2.1, 0.94], [3.0, 0.96]], handleMat: 'paint', mirror: [1.32, 1.02, 0.95, 'paint'],
  head: [{ s: [0.3, 0.86], y: [0.64, 0.86], tex: 'hrecta', poly: [[0, 0.25], [0.6, 0], [1, 0.25], [1, 1], [0.5, 0.95], [0, 0.6]] }],
  grille: [{ s: 0.28, y: [0.62, 0.76], tex: 'hbar2', bars: 'chrome', frame: 'chrome', poly: [[0.15, 0], [0.85, 0], [1, 1], [0, 1]] }, { s: 0.42, y: [0.32, 0.5], tex: 'hbar2', frame: 'black', bars: 'black' }],
  tail: [{ s: [0.55, 0.92], y: [0.8, 1.2], tex: 'tred2', poly: [[0, 0.2], [0.6, 0], [1, 0.3], [1, 1], [0.4, 0.9]] }],
  plateF: 0.44, plateR: 0.62, wheel: { style: 'hubcap', rim: 'silver' },
};
B.chevrolet_chevy = {
  L: 3.73, W: 1.61, H: 1.42, wb: 2.44, fo: 0.7, R: 0.285, rr: 0.178, tw: 0.175, clr: 0.15, fbump: 0.2, rbump: 0.24,
  tF: 0.7, nF: 2.8, tR: 0.35, nR: 4, tumble: 0.32, hoodCrown: 0.05, roofCrown: 0.07,
  ...prof({ L: 3.73, H: 1.42, c: 1.1, t: 1.75, r: 3.1, q: 3.62, yb: 0.92, yn: 0.6, yh: 0.76, rise: 0.05, k: 'hatch' }),
  win: [[1.22, 2.5], [2.6, 3.05]], bpil: [[2.5, 2.6]], blackPillars: true, split: 0.42, lower: 0x4a4c4f, levels: [0.8, 0.42],
  doors: [1.2, 2.55], hoodLine: 1.08, handles: [[2.3, 0.88]], mirror: [1.28, 0.97, 0.9, 'black'],
  head: [{ s: [0.2, 0.74], y: [0.6, 0.76], tex: 'hrect', poly: [[0, 0.1], [1, 0], [1, 0.7], [0.6, 1], [0, 1]] }],
  grille: [{ s: 0.2, y: [0.62, 0.72], tex: 'hbar2', bars: 'black', frame: 'chrome' }, { s: 0.45, y: [0.34, 0.46], tex: 'hbar2', bars: 'black', frame: 'none' }],
  tail: [{ s: [0.52, 0.86], y: [0.72, 1.02], tex: 'tclassic', poly: [[0, 0], [1, 0], [1, 1], [0.2, 1]] }],
  plateF: 0.42, plateR: 0.58, wheel: { style: 'hubcap', rim: 'silver' },
};
B.fiat_500 = {
  L: 3.55, W: 1.63, H: 1.49, wb: 2.3, fo: 0.64, R: 0.29, rr: 0.19, tw: 0.185, clr: 0.15, fbump: 0.22, rbump: 0.26,
  tF: 0.75, nF: 2.3, tR: 0.45, nR: 2.8, tumble: 0.3, hoodCrown: 0.06, roofCrown: 0.08, shoulder: 0.97,
  ...prof({ L: 3.55, H: 1.49, c: 1.0, t: 1.62, r: 3.05, q: 3.45, yb: 0.97, yn: 0.66, yh: 0.86, rise: 0.04, k: 'hatch', nose: 0.25 }),
  win: [[1.12, 2.42], [2.5, 2.92]], bpil: [[2.42, 2.5]], blackPillars: true, chromeSill: true, levels: [0.82, 0.55],
  doors: [1.1, 2.46], hoodLine: 0.98, handles: [[2.25, 0.92]], handleMat: 'chrome', mirror: [1.16, 1.0, 0.9, 'paint'],
  head: [{ round: 0.085, s: 0.55, y: 0.66, bezel: 'chrome', out: 0.0, depth: 0.03 }],
  front: [{ round: 0.05, s: 0.5, y: 0.83, bezel: 'chrome', tex: 'hlens', depth: 0.02 }, { s: 0.3, y: [0.72, 0.745], kind: 'grille', tex: 'solid', bars: 'chrome', poly: [[0, 0.2], [0.5, 0], [1, 0.2], [1, 1], [0.5, 0.8], [0, 1]] }, { s: 0.4, y: [0.32, 0.48], kind: 'grille', tex: 'honey', frame: 'chrome', poly: TRAPI }],
  tail: [{ s: [0.55, 0.88], y: [0.8, 1.06], tex: 'tmod', poly: rrq() }],
  bumpR: [{ y: 0.42, h: 0.04, d: 0.03, mat: 'chrome', s: 0.6 }],
  plateF: 0.5, plateR: 0.55, badge: '500', wheel: { style: 'alloy7', rim: 'silver' },
};
B.mini_cooper = {
  L: 3.70, W: 1.68, H: 1.41, wb: 2.47, fo: 0.68, R: 0.3, rr: 0.203, tw: 0.195, clr: 0.14, fbump: 0.22, rbump: 0.24,
  tF: 0.6, nF: 3, tR: 0.25, nR: 5, tumble: 0.22, hoodCrown: 0.05, roofCrown: 0.05, crownExp: 3,
  ...prof({ L: 3.70, H: 1.41, c: 1.05, t: 1.5, r: 3.4, q: 3.64, yb: 0.95, yn: 0.62, yh: 0.82, rise: 0.02, k: 'hatch', nose: 0.22 }),
  win: [[1.1, 2.45], [2.53, 3.3]], bpil: [[2.45, 2.53]], blackPillars: true, chromeSill: true, roofMat: 'white', levels: [0.85, 0.55],
  doors: [1.12, 2.5], hoodLine: 0.05, hoodSides: [0.1, 1.0, 0.95], handles: [[2.25, 0.9]], handleMat: 'chrome', mirror: [1.15, 0.98, 0.9, 'white'],
  head: [{ round: 0.11, s: 0.55, y: 0.76, bezel: 'chrome', tilt: 0.25, out: -0.02, depth: 0.04 }],
  grille: [{ s: 0.32, y: [0.56, 0.74], tex: 'honey', frame: 'chrome', bars: 'black', poly: [[0.08, 0], [0.92, 0], [1, 0.55], [0.85, 1], [0.15, 1], [0, 0.55]] }],
  front: [{ round: 0.04, s: 0.48, y: 0.42, bezel: 'chrome', tex: 'fog' }, { s: 0.6, y: [0.3, 0.4], kind: 'grille', tex: 'hbar', frame: 'none' }],
  tail: [{ s: [0.58, 0.82], y: [0.82, 1.06], tex: 'tred2', poly: [[0, 0], [1, 0], [1, 1], [0, 1]] }],
  arches: { mat: 'plastic', r: 0.03, flare: 0.015 }, split: 0.4,
  plateF: 0.44, plateR: 0.66, badge: 'COOPER', wheel: { style: 'alloy7', rim: 'silver' },
};
// ---------- hatchbacks
B.vw_golf_a4 = {
  L: 4.15, W: 1.73, H: 1.44, wb: 2.51, fo: 0.82, R: 0.3, rr: 0.19, tw: 0.195, clr: 0.14, fbump: 0.2, rbump: 0.25,
  tF: 0.7, nF: 3, tR: 0.3, nR: 5, tumble: 0.3, hoodCrown: 0.05, roofCrown: 0.06,
  ...prof({ L: 4.15, H: 1.44, c: 1.3, t: 2.02, r: 3.6, q: 4.03, yb: 0.96, yn: 0.6, yh: 0.78, rise: 0.04, k: 'hatch' }),
  win: [[1.42, 2.48], [2.56, 3.35]], bpil: [[2.48, 2.56]], blackPillars: true, levels: [0.84, 0.6], molding: [0.6, 0.66, 1.2, 3.6],
  doors: [1.38, 2.52, 3.28], hoodLine: 1.27, hoodSides: [0.15, 1.27, 0.75], handles: [[2.15, 0.92], [3.05, 0.93]], handleMat: 'paint', mirror: [1.45, 1.0, 0.95, 'paint'],
  head: [{ s: [0.3, 0.84], y: [0.64, 0.79], tex: 'hmod2', poly: [[0, 0], [1, 0.1], [1, 1], [0, 0.9]] }],
  grille: [{ s: 0.3, y: [0.66, 0.77], tex: 'hbar3', bars: 'paint', frame: 'black', bars: '#2a2c2f' }, { s: 0.5, y: [0.32, 0.46], tex: 'mesh', frame: 'black', poly: TRAPI }],
  tail: [{ s: [0.38, 0.86], y: [0.84, 0.99], tex: 'tclassic', poly: [[0, 0], [1, 0], [1, 1], [0.05, 1]] }],
  plateF: 0.42, plateR: 0.66, badge: 'GOLF', wheel: { style: 'hubcap', rim: 'silver' },
};
B.kia_rio = {
  L: 4.07, W: 1.73, H: 1.45, wb: 2.58, fo: 0.8, R: 0.3, rr: 0.19, tw: 0.195, clr: 0.15, fbump: 0.2, rbump: 0.25,
  tF: 0.7, nF: 3.2, tR: 0.3, nR: 5, tumble: 0.32, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 4.07, H: 1.45, c: 1.28, t: 2.0, r: 3.55, q: 3.96, yb: 0.98, yn: 0.62, yh: 0.8, rise: 0.06, k: 'hatch' }),
  win: [[1.38, 2.5], [2.58, 3.33]], bpil: [[2.5, 2.58]], blackPillars: true, levels: [0.86, 0.6],
  doors: [1.35, 2.54, 3.3], hoodLine: 1.25, hoodSides: [0.15, 1.25, 0.72], handles: [[2.15, 0.94], [3.05, 0.96]], handleMat: 'paint', mirror: [1.42, 1.02, 0.95, 'paint'],
  head: [{ s: [0.3, 0.86], y: [0.66, 0.8], tex: 'hmod', poly: SWOOP }],
  grille: [{ s: 0.3, y: [0.62, 0.76], tex: 'honey', frame: 'chrome', poly: [[0.12, 0], [0.88, 0], [1, 0.7], [0.8, 1], [0.2, 1], [0, 0.7]] }, { s: 0.48, y: [0.32, 0.46], tex: 'mesh', frame: 'black', poly: TRAPI }],
  front: [{ s: [0.6, 0.8], y: [0.36, 0.44], tex: 'drl' }],
  tail: [{ s: [0.4, 0.9], y: [0.86, 1.02], tex: 'tmod', poly: TAILW }],
  plateF: 0.42, plateR: 0.66, badge: 'RIO', wheel: { style: 'alloy5', rim: 'silver' },
};
B.mazda_3 = {
  L: 4.46, W: 1.8, H: 1.44, wb: 2.73, fo: 0.9, R: 0.32, rr: 0.229, tw: 0.215, clr: 0.14, fbump: 0.2, rbump: 0.28,
  tF: 0.9, nF: 3.2, tR: 0.45, nR: 4, tumble: 0.36, hoodCrown: 0.05, roofCrown: 0.07, glassBulge: 0.015,
  ...prof({ L: 4.46, H: 1.44, c: 1.55, t: 2.33, r: 3.65, q: 4.3, yb: 0.99, yn: 0.6, yh: 0.76, rise: 0.06, k: 'hatch', hood: 0.55 }),
  win: [[1.65, 2.75], [2.83, 3.45]], bpil: [[2.75, 2.83]], blackPillars: true, chromeSill: true, levels: [0.86, 0.55],
  doors: [1.58, 2.79, 3.45], hoodLine: 1.5, hoodSides: [0.15, 1.5, 0.72], handles: [[2.4, 0.95], [3.3, 0.97]], handleMat: 'paint', mirror: [1.68, 1.03, 0.95, 'paint'],
  head: [{ s: [0.38, 0.92], y: [0.66, 0.74], tex: 'hled', poly: [[0, 0], [1, 0.2], [1, 1], [0, 0.7]] }],
  grille: [{ s: 0.4, y: [0.38, 0.68], tex: 'mesh', frame: 'chrome', poly: [[0.1, 0], [0.9, 0], [1, 0.85], [0.92, 1], [0.08, 1], [0, 0.85]] }],
  tail: [{ s: [0.4, 0.88], y: [0.86, 0.98], tex: 'tround2', poly: rrq(0.45) }],
  rear: [{ s: 0.8, y: [0.2, 0.32], kind: 'grille', tex: 'solid', bars: '#161616' }],
  exhaust: [{ z: 0.5, y: 0.26, r: 0.045 }], plateF: 0.36, plateR: 0.62, badge: 'MAZDA3', wheel: { style: 'alloy10', rim: 'gun' },
};
B.vw_caribe = {
  L: 3.82, W: 1.61, H: 1.39, wb: 2.4, fo: 0.7, R: 0.28, rr: 0.165, tw: 0.175, clr: 0.16, fbump: 0.14, rbump: 0.14,
  tF: 0.15, nF: 6, tR: 0.12, nR: 7, tumble: 0.22, hoodCrown: 0.02, roofCrown: 0.04, crownExp: 3, pillarW: 0.05,
  ...prof({ L: 3.82, H: 1.39, c: 1.2, t: 1.82, r: 3.25, q: 3.7, yb: 0.9, yn: 0.82, yh: 0.86, rise: 0.02, k: 'hatch', nose: 0.06 }),
  win: [[1.3, 2.38], [2.46, 3.25]], bpil: [[2.38, 2.46]], blackPillars: true, levels: [0.78, 0.55], molding: [0.56, 0.6, 0.8, 3.0, 'chrome'],
  doors: [1.26, 2.42, 3.2], hoodLine: 1.17, hoodSides: [0.04, 1.17, 0.85], handles: [[2.1, 0.86], [2.95, 0.86]], handleMat: 'chrome', mirror: [1.3, 0.94, 0.8, 'black'],
  head: [{ round: 0.085, s: 0.6, y: 0.7, bezel: 'black', depth: 0.03 }],
  grille: [{ s: 0.8, y: [0.6, 0.8], tex: 'hbar', bars: 'black', frame: 'black' }],
  front: [{ s: [0.62, 0.78], y: [0.43, 0.49], tex: 'amber' }],
  bumpF: [{ y: 0.47, h: 0.1, d: 0.06, mat: 'chrome', s: 0.92 }], bumpR: [{ y: 0.47, h: 0.1, d: 0.06, mat: 'chrome', s: 0.85 }],
  tail: [{ s: [0.48, 0.78], y: [0.62, 0.8], tex: 'tclassic' }],
  plateF: 0.6, plateR: 0.66, badge: 'CARIBE', wheel: { style: 'steel', rim: 'steel' },
};
// ---------- sedanes
B.nissan_versa = {
  L: 4.49, W: 1.74, H: 1.47, wb: 2.62, fo: 0.87, R: 0.3, rr: 0.19, tw: 0.195, clr: 0.15, fbump: 0.2, rbump: 0.24,
  tF: 0.85, nF: 3.2, tR: 0.6, nR: 4, tumble: 0.33, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 4.49, H: 1.47, c: 1.32, t: 2.05, r: 2.95, q: 3.75, yb: 0.98, yn: 0.6, yh: 0.8, yd: 1.04, rise: 0.04 }),
  win: [[1.42, 2.5], [2.58, 3.4]], bpil: [[2.5, 2.58]], blackPillars: true, levels: [0.86, 0.6],
  doors: [1.38, 2.54, 3.3], hoodLine: 1.28, trunkLine: 3.82, hoodSides: [0.2, 1.28, 0.72], handles: [[2.2, 0.94], [3.1, 0.96]], handleMat: 'paint', mirror: [1.48, 1.02, 0.95, 'paint'], shark: 3.2,
  head: [{ s: [0.36, 0.95], y: [0.66, 0.8], tex: 'hmod', poly: SWOOP }],
  grille: [{ s: 0.36, y: [0.46, 0.76], tex: 'mesh', frame: 'chrome', poly: [[0.25, 0], [0.75, 0], [1, 1], [0, 1]] }],
  front: [{ s: [0.6, 0.82], y: [0.32, 0.44], kind: 'grille', tex: 'hbar', frame: 'black' }],
  tail: [{ s: [0.3, 0.98], y: [0.86, 1.0], tex: 'tmod', poly: TAILW }],
  plateF: 0.38, plateR: 0.74, badge: 'VERSA', wheel: { style: 'alloy10', rim: 'silver' },
};
B.nissan_sentra = {
  L: 4.64, W: 1.82, H: 1.45, wb: 2.71, fo: 0.93, R: 0.32, rr: 0.216, tw: 0.215, clr: 0.14, fbump: 0.2, rbump: 0.24,
  tF: 0.9, nF: 3.2, tR: 0.6, nR: 4, tumble: 0.36, hoodCrown: 0.05, roofCrown: 0.06,
  ...prof({ L: 4.64, H: 1.45, c: 1.4, t: 2.15, r: 3.0, q: 3.92, yb: 0.97, yn: 0.58, yh: 0.78, yd: 1.02, rise: 0.04 }),
  win: [[1.5, 2.6], [2.68, 3.55]], bpil: [[2.6, 2.68]], blackPillars: true, pillarRoof: false, roofMat: 'black', levels: [0.84, 0.58],
  doors: [1.45, 2.64, 3.42], hoodLine: 1.36, trunkLine: 3.98, hoodSides: [0.2, 1.36, 0.7], handles: [[2.3, 0.93], [3.2, 0.95]], handleMat: 'chrome', mirror: [1.55, 1.0, 0.95, 'black'], shark: 3.3,
  head: [{ s: [0.4, 1.0], y: [0.64, 0.76], tex: 'hled', poly: SWOOP }],
  grille: [{ s: 0.42, y: [0.4, 0.74], tex: 'mesh', frame: 'chrome', poly: [[0.22, 0], [0.78, 0], [1, 0.85], [0.95, 1], [0.05, 1], [0, 0.85]] }],
  front: [{ s: [0.62, 0.86], y: [0.28, 0.42], kind: 'grille', tex: 'honey', frame: 'black' }],
  tail: [{ s: [0.32, 1.05], y: [0.86, 0.98], tex: 'tmod', poly: TAILW }],
  exhaust: [{ z: 0.55, y: 0.24, r: 0.035 }], plateF: 0.34, plateR: 0.72, badge: 'SENTRA', wheel: { style: 'y', rim: 'silver' },
};
B.vw_jetta_a4 = {
  L: 4.38, W: 1.73, H: 1.45, wb: 2.51, fo: 0.86, R: 0.3, rr: 0.19, tw: 0.195, clr: 0.14, fbump: 0.2, rbump: 0.22,
  tF: 0.6, nF: 3.5, tR: 0.45, nR: 5, tumble: 0.3, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 4.38, H: 1.45, c: 1.32, t: 2.02, r: 2.85, q: 3.58, yb: 0.96, yn: 0.62, yh: 0.8, yd: 1.04, rise: 0.04 }),
  win: [[1.42, 2.48], [2.56, 3.3]], bpil: [[2.48, 2.56]], blackPillars: true, levels: [0.84, 0.6], molding: [0.6, 0.66, 1.2, 3.8],
  doors: [1.38, 2.52, 3.22], hoodLine: 1.28, trunkLine: 3.64, hoodSides: [0.18, 1.28, 0.74], handles: [[2.12, 0.92], [2.98, 0.93]], handleMat: 'paint', mirror: [1.45, 1.0, 0.95, 'paint'],
  head: [{ s: [0.34, 0.86], y: [0.64, 0.79], tex: 'hmod2', poly: [[0, 0], [1, 0], [1, 1], [0, 1]] }],
  grille: [{ s: 0.33, y: [0.64, 0.78], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }, { s: 0.5, y: [0.32, 0.46], tex: 'mesh', frame: 'black', poly: TRAPI }],
  tail: [{ s: [0.36, 0.84], y: [0.84, 0.98], tex: 'tclassic', poly: [[0, 0], [1, 0], [1, 1], [0, 1]] }],
  plateF: 0.4, plateR: 0.76, badge: 'JETTA', wheel: { style: 'alloy5', rim: 'silver' },
};
B.chevrolet_aveo = {
  L: 4.31, W: 1.71, H: 1.5, wb: 2.48, fo: 0.84, R: 0.3, rr: 0.19, tw: 0.185, clr: 0.15, fbump: 0.2, rbump: 0.24,
  tF: 0.8, nF: 3, tR: 0.55, nR: 4, tumble: 0.32, hoodCrown: 0.05, roofCrown: 0.07,
  ...prof({ L: 4.31, H: 1.5, c: 1.28, t: 1.98, r: 2.85, q: 3.6, yb: 0.99, yn: 0.62, yh: 0.82, yd: 1.04, rise: 0.04 }),
  win: [[1.38, 2.45], [2.53, 3.28]], bpil: [[2.45, 2.53]], blackPillars: true, levels: [0.86, 0.6],
  doors: [1.34, 2.49, 3.2], hoodLine: 1.25, trunkLine: 3.66, hoodSides: [0.2, 1.25, 0.72], handles: [[2.12, 0.95], [3.0, 0.97]], handleMat: 'paint', mirror: [1.42, 1.03, 0.95, 'paint'],
  head: [{ s: [0.32, 0.9], y: [0.66, 0.86], tex: 'hmod2', poly: [[0, 0.2], [1, 0], [1, 0.8], [0.7, 1], [0, 1]] }],
  grille: [{ s: 0.3, y: [0.7, 0.8], tex: 'hbar2', bars: 'black', frame: 'chrome' }, { s: 0.42, y: [0.4, 0.62], tex: 'hbar2', bars: 'black', frame: 'chrome' }, { s: 0.42, y: [0.635, 0.665], tex: 'solid', bars: '#c9a44a' }],
  tail: [{ s: [0.34, 0.86], y: [0.84, 1.02], tex: 'tclassic', poly: [[0, 0], [1, 0], [1, 1], [0, 0.85]] }],
  plateF: 0.38, plateR: 0.76, badge: 'AVEO', wheel: { style: 'hubcap', rim: 'silver' },
};
B.honda_civic = {
  L: 4.63, W: 1.8, H: 1.42, wb: 2.7, fo: 0.92, R: 0.32, rr: 0.216, tw: 0.215, clr: 0.13, fbump: 0.18, rbump: 0.24,
  tF: 0.9, nF: 3.4, tR: 0.5, nR: 4, tumble: 0.38, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 4.63, H: 1.42, c: 1.45, t: 2.22, r: 2.85, q: 4.15, yb: 0.95, yn: 0.56, yh: 0.76, yd: 1.0, rise: 0.05, k: 'fast' }),
  win: [[1.55, 2.62], [2.7, 3.55]], bpil: [[2.62, 2.7]], blackPillars: true, levels: [0.82, 0.55],
  doors: [1.5, 2.66, 3.45], hoodLine: 1.4, trunkLine: 4.2, hoodSides: [0.2, 1.4, 0.7], handles: [[2.3, 0.92], [3.22, 0.94]], handleMat: 'paint', mirror: [1.58, 0.98, 0.95, 'paint'], shark: 3.0,
  head: [{ s: [0.38, 0.96], y: [0.62, 0.74], tex: 'hled', poly: SWOOP }],
  grille: [{ s: 0.4, y: [0.66, 0.73], tex: 'solid', bars: 'chrome', frame: 'none', poly: [[0, 0], [1, 0], [1, 0.5], [0.94, 1], [0.06, 1], [0, 0.5]] }, { s: 0.3, y: [0.56, 0.65], tex: 'honey', frame: 'none' }, { s: 0.55, y: [0.24, 0.44], tex: 'honey', frame: 'black', poly: TRAPI }],
  front: [{ s: [0.62, 0.86], y: [0.26, 0.44], kind: 'grille', tex: 'honey', frame: 'black', poly: [[0, 0], [1, 0], [1, 1], [0.3, 1]] }],
  tail: [{ s: [0.3, 1.05], y: [0.84, 0.98], tex: 'tmod', poly: [[0, 0.4], [0.7, 0], [1, 0.3], [1, 1], [0, 1]] }],
  extras: [{ type: 'lip', d: 4.42, chord: 0.12, span: 1.25, h: 0.0, tilt: 0.15 }],
  exhaust: [{ z: 0.0, y: 0.24, r: 0.045, both: false }], plateF: 0.34, plateR: 0.6, badge: 'CIVIC', wheel: { style: 'y', rim: 'gun' },
};

// ---------- SUV
B.toyota_rav4 = {
  L: 4.6, W: 1.855, H: 1.69, wb: 2.69, fo: 0.93, R: 0.36, rr: 0.216, tw: 0.225, clr: 0.2, fbump: 0.24, rbump: 0.3,
  tF: 0.6, nF: 3.6, tR: 0.3, nR: 5, tumble: 0.26, hoodCrown: 0.04, roofCrown: 0.05,
  ...prof({ L: 4.6, H: 1.69, c: 1.35, t: 2.1, r: 3.95, q: 4.45, yb: 1.12, yn: 0.78, yh: 0.98, rise: 0.06, k: 'hatch' }),
  win: [[1.48, 2.6], [2.68, 3.55], [3.62, 4.05]], bpil: [[2.6, 2.68], [3.55, 3.62]], blackPillars: true, split: 0.55, levels: [1.0, 0.55],
  doors: [1.45, 2.64, 3.6], hoodLine: 1.32, hoodSides: [0.2, 1.32, 0.7], handles: [[2.35, 1.08], [3.3, 1.1]], handleMat: 'paint', mirror: [1.52, 1.16, 1.05, 'black'],
  head: [{ s: [0.4, 0.92], y: [0.84, 0.96], tex: 'hled', poly: [[0, 0], [1, 0.2], [1, 1], [0.2, 1]], extra: 'a' }],
  grille: [{ s: 0.38, y: [0.85, 0.94], tex: 'hbar', bars: 'gloss', frame: 'black' }, { s: 0.58, y: [0.42, 0.8], tex: 'egg', frame: 'black', bars: 'gloss', poly: [[0.15, 0], [0.85, 0], [1, 0.3], [0.95, 1], [0.05, 1], [0, 0.3]] }],
  tail: [{ s: [0.4, 0.98], y: [1.0, 1.12], tex: 'tmod', poly: TAILW }],
  arches: { mat: 'plastic', r: 0.045, flare: 0.03, grow: 0.02 }, plateF: 0.5, plateR: 0.78, badge: 'RAV4', badgeY: 0.98,
  wheel: { style: 'alloy5', rim: 'gun' }, extras: [{ type: 'rails', x: [2.2, 4.0] }, { type: 'lip', d: 3.98, chord: 0.12, span: 1.3, h: 0.0, tilt: 0.12 }],
};
B.honda_crv = {
  L: 4.59, W: 1.855, H: 1.68, wb: 2.66, fo: 0.92, R: 0.35, rr: 0.229, tw: 0.225, clr: 0.19, fbump: 0.24, rbump: 0.3,
  tF: 0.75, nF: 3.2, tR: 0.35, nR: 4.5, tumble: 0.3, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 4.59, H: 1.68, c: 1.36, t: 2.12, r: 3.8, q: 4.46, yb: 1.08, yn: 0.74, yh: 0.95, rise: 0.06, k: 'hatch' }),
  win: [[1.5, 2.6], [2.68, 3.55], [3.62, 4.0]], bpil: [[2.6, 2.68], [3.55, 3.62]], blackPillars: true, chromeSill: true, split: 0.5, levels: [0.98, 0.5],
  doors: [1.45, 2.64, 3.58], hoodLine: 1.33, hoodSides: [0.2, 1.33, 0.7], handles: [[2.35, 1.05], [3.3, 1.07]], handleMat: 'paint', mirror: [1.52, 1.12, 1.05, 'paint'],
  head: [{ s: [0.42, 0.95], y: [0.8, 0.92], tex: 'hled', poly: SWOOP }],
  grille: [{ s: 0.46, y: [0.86, 0.9], tex: 'solid', bars: 'chrome', poly: [[0, 0], [1, 0.4], [1, 1], [0, 1]] }, { s: 0.42, y: [0.7, 0.85], tex: 'hbar2', frame: 'none', bars: 'gloss' }, { s: 0.6, y: [0.36, 0.6], tex: 'honey', frame: 'black', poly: TRAPI }],
  tail: [{ s: [0.55, 1.05], y: [0.95, 1.4], tex: 'tmod', poly: [[0, 0], [1, 0], [1, 1], [0.75, 1], [0.55, 0.32], [0, 0.32]] }],
  arches: { mat: 'plastic', r: 0.03, flare: 0.015 }, plateF: 0.46, plateR: 0.76, badge: 'CR-V', badgeY: 0.95,
  exhaust: [{ z: 0.55, y: 0.3, r: 0.045 }], wheel: { style: 'alloy10', rim: 'silver' }, extras: [{ type: 'rails', x: [2.2, 4.0] }],
};
B.ford_bronco = {
  L: 4.6, W: 1.93, H: 1.85, wb: 2.95, fo: 0.74, R: 0.41, rr: 0.216, tw: 0.27, clr: 0.27, fbump: 0.08, rbump: 0.08, track: 1.68,
  tF: 0.15, nF: 7, tR: 0.12, nR: 9, tumble: 0.05, hoodCrown: 0.012, roofCrown: 0.02, crownExp: 6, shoulder: 0.99, tuck: 0.02, pillarW: 0.07,
  belt: [[0, 1.02], [0.04, 1.1], [1.35, 1.17], [2.6, 1.2], [4.55, 1.22], [4.6, 1.12]],
  roof: [[1.36, 1.15], [1.42, 1.3], [1.78, 1.82], [1.9, 1.85], [4.5, 1.85], [4.58, 1.8], [4.6, 1.05]],
  ws: [1.4, 1.8], win: [[1.5, 2.55], [2.67, 3.55], [3.67, 4.45]], bpil: [[2.55, 2.67], [3.55, 3.67]], blackPillars: true, roofMat: 'white', levels: [0.62],
  doors: [1.48, 2.6, 3.55], handles: [[2.38, 1.08], [3.38, 1.08]], mirror: [1.6, 1.24, 1.25, 'black'], hoodLine: 1.36,
  grille: [{ s: 0.78, y: [0.8, 1.1], tex: 'txt:BRONCO', bars: '#e9e9e6', frame: 'black' }],
  head: [{ round: 0.105, s: 0.66, y: 0.95, bezel: 'black', out: 0.01, tex: 'hround' }],
  rear: [{ s: 0.66, y: [1.3, 1.76], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.78, 0.92], y: [0.75, 1.12], tex: 'tsmoke' }],
  bumpF: [{ y: 0.55, h: 0.22, d: 0.14, mat: 'black', s: 1.05 }], bumpR: [{ y: 0.55, h: 0.2, d: 0.1, mat: 'black', s: 1.0 }],
  arches: { mat: 'plastic', r: 0.07, flare: 0.07, grow: 0.03 }, split: 0.55, plateF: 0.55, plateR: 0.82, badge: 'BRONCO', badgeS: 0.5, badgeY: 1.08,
  wheel: { style: 'offroad', rim: 'silver' },
  extras: [{ type: 'spare', y: 1.0, r: 0.4, style: 'offroad', rim: 'silver' }, { type: 'steps', x: [1.3, 3.55], y: 0.44, mat: 'black' }],
};
B.chevrolet_suburban = {
  L: 5.7, W: 2.04, H: 1.89, wb: 3.3, fo: 1.0, R: 0.4, rr: 0.254, tw: 0.275, clr: 0.22, fbump: 0.2, rbump: 0.22,
  tF: 0.35, nF: 4, tR: 0.15, nR: 7, tumble: 0.14, hoodCrown: 0.03, roofCrown: 0.04, crownExp: 3, shoulder: 0.975,
  ...prof({ L: 5.7, H: 1.89, c: 1.55, t: 2.35, r: 5.6, q: 5.65, yb: 1.2, yn: 0.95, yh: 1.13, rise: 0.04, k: 'box', nose: 0.12 }),
  win: [[1.68, 2.78], [2.88, 3.85], [3.97, 5.45]], bpil: [[2.78, 2.88], [3.85, 3.97]], blackPillars: true, levels: [1.05, 0.62], split: 0.42,
  doors: [1.65, 2.83, 3.92], hoodLine: 1.5, hoodSides: [0.1, 1.5, 0.78], handles: [[2.55, 1.12], [3.65, 1.14]], handleMat: 'chrome', mirror: [1.7, 1.25, 1.3, 'paint'],
  head: [{ s: [0.56, 0.95], y: [0.9, 1.1], tex: 'hmod2', poly: [[0, 0.1], [1, 0], [1, 1], [0, 1]] }],
  grille: [{ s: 0.56, y: [0.72, 1.12], tex: 'hbar3', bars: 'chrome', frame: 'chrome' }, { s: 0.58, y: [0.92, 0.95], tex: 'solid', bars: 'chrome' }],
  front: [{ s: 0.6, y: [0.36, 0.54], kind: 'grille', tex: 'hbar', frame: 'black' }],
  rear: [{ s: 0.78, y: [1.28, 1.78], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.82, 1.02], y: [1.0, 1.45], tex: 'tclassic' }],
  bumpR: [{ y: 0.55, h: 0.18, d: 0.08, mat: 'chrome', s: 1.1 }],
  arches: { mat: 'plastic', r: 0.035, flare: 0.02 }, plateF: 0.48, plateR: 0.9, badge: 'SUBURBAN', badgeS: 0.5, badgeY: 1.2,
  wheel: { style: 'alloy6', rim: 'chrome' }, extras: [{ type: 'rails', x: [2.3, 5.5], zf: 0.85 }, { type: 'steps', x: [1.6, 4.4], y: 0.43, mat: 'black' }],
};
// ---------- pickups (cabina + caja)
B.chevrolet_silverado = {
  L: 5.89, W: 2.06, H: 1.92, wb: 3.75, fo: 0.95, R: 0.41, rr: 0.229, tw: 0.265, clr: 0.26, fbump: 0.2, track: 1.75,
  tF: 0.35, nF: 5, nR: 30, tR: 0.05, tumble: 0.12, hoodCrown: 0.03, roofCrown: 0.04, crownExp: 3, shoulder: 0.98,
  ...prof({ L: 4.08, H: 1.92, c: 1.62, t: 2.38, r: 3.98, q: 4.05, yb: 1.32, yn: 1.12, yh: 1.27, rise: 0.0, k: 'box', nose: 0.1 }),
  bed: { cab: 4.08, h: 1.34, tail: 'tclassic', tailH: 0.42, plateY: 0.62 },
  win: [[1.75, 2.85], [2.95, 3.85]], bpil: [[2.85, 2.95]], blackPillars: true, levels: [1.15, 0.7],
  doors: [1.7, 2.9, 3.92], hoodLine: 1.58, hoodSides: [0.1, 1.58, 0.75], handles: [[2.62, 1.22], [3.65, 1.22]], handleMat: 'chrome', mirror: [1.82, 1.4, 1.35, 'black'],
  head: [{ s: [0.62, 0.98], y: [0.98, 1.17], tex: 'hmod', poly: [[0, 0], [1, 0.15], [1, 1], [0, 0.85]] }],
  grille: [{ s: 0.62, y: [0.72, 1.2], tex: 'egg', frame: 'chrome', bars: 'gloss' }, { s: 0.98, y: [1.06, 1.1], tex: 'solid', bars: 'chrome' }],
  bumpF: [{ y: 0.62, h: 0.24, d: 0.1, mat: 'chrome', s: 1.1 }],
  arches: { mat: 'paint', r: 0.03, flare: 0.02 }, plateF: 0.62, wheel: { style: 'truck', rim: 'chrome' },
  extras: [{ type: 'steps', x: [1.7, 3.95], y: 0.5, mat: 'black' }],
};
B.ford_lobo = {
  L: 5.89, W: 2.03, H: 1.96, wb: 3.68, fo: 0.97, R: 0.41, rr: 0.229, tw: 0.265, clr: 0.26, fbump: 0.2, track: 1.73,
  tF: 0.3, nF: 5, nR: 30, tR: 0.05, tumble: 0.12, hoodCrown: 0.03, roofCrown: 0.04, crownExp: 3, shoulder: 0.98,
  ...prof({ L: 4.12, H: 1.96, c: 1.65, t: 2.4, r: 4.02, q: 4.08, yb: 1.32, yn: 1.1, yh: 1.26, rise: 0.0, k: 'box', nose: 0.1 }),
  bed: { cab: 4.12, h: 1.32, tail: 'tred2', tailH: 0.42, plateY: 0.62 },
  win: [[1.78, 2.88], [2.98, 3.9]], bpil: [[2.88, 2.98]], blackPillars: true, levels: [1.15, 0.7],
  doors: [1.72, 2.93, 3.95], hoodLine: 1.6, hoodSides: [0.1, 1.6, 0.7], handles: [[2.65, 1.22], [3.68, 1.22]], handleMat: 'chrome', mirror: [1.85, 1.42, 1.35, 'chrome'],
  head: [{ s: [0.6, 0.97], y: [0.96, 1.2], tex: 'hled', poly: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 0.82], [0.75, 0.82], [0.75, 0.18], [0, 0.18]] }, { s: [0.62, 0.86], y: [1.0, 1.16], tex: 'hmod' }],
  grille: [{ s: 0.6, y: [0.74, 1.2], tex: 'hbar3', frame: 'chrome', bars: 'chrome' }],
  bumpF: [{ y: 0.62, h: 0.24, d: 0.1, mat: 'chrome', s: 1.1 }],
  arches: { mat: 'paint', r: 0.03, flare: 0.02 }, plateF: 0.62, wheel: { style: 'alloy6', rim: 'silver' },
  extras: [{ type: 'steps', x: [1.7, 3.95], y: 0.5, mat: 'black' }],
};
B.toyota_hilux = {
  L: 5.33, W: 1.855, H: 1.815, wb: 3.085, fo: 0.9, R: 0.38, rr: 0.216, tw: 0.265, clr: 0.24, fbump: 0.2, track: 1.55,
  tF: 0.45, nF: 4, nR: 30, tR: 0.05, tumble: 0.18, hoodCrown: 0.035, roofCrown: 0.05, crownExp: 2.5,
  ...prof({ L: 3.78, H: 1.815, c: 1.52, t: 2.28, r: 3.68, q: 3.74, yb: 1.2, yn: 0.96, yh: 1.1, rise: 0.0, k: 'box', nose: 0.14 }),
  bed: { cab: 3.78, h: 1.2, tail: 'tclassic', tailH: 0.36, plateY: 0.58 },
  win: [[1.65, 2.62], [2.72, 3.6]], bpil: [[2.62, 2.72]], blackPillars: true, levels: [1.05, 0.65],
  doors: [1.6, 2.67, 3.65], hoodLine: 1.5, hoodSides: [0.15, 1.5, 0.72], handles: [[2.45, 1.1], [3.4, 1.1]], handleMat: 'chrome', mirror: [1.7, 1.28, 1.2, 'chrome'],
  head: [{ s: [0.4, 0.92], y: [0.9, 1.06], tex: 'hmod', poly: [[0, 0.3], [1, 0], [1, 1], [0, 1]], extra: 'a' }],
  grille: [{ s: 0.42, y: [0.72, 1.06], tex: 'hbar2', frame: 'chrome', bars: 'chrome', poly: [[0.12, 0], [0.88, 0], [1, 1], [0, 1]] }],
  front: [{ s: 0.6, y: [0.42, 0.6], kind: 'grille', tex: 'mesh', frame: 'black', poly: TRAPI }],
  arches: { mat: 'plastic', r: 0.04, flare: 0.04 }, plateF: 0.6, wheel: { style: 'alloy6', rim: 'silver' },
  extras: [{ type: 'steps', x: [1.6, 3.7], y: 0.46, mat: 'chrome' }],
};
B.ram_1500 = {
  L: 5.92, W: 2.08, H: 1.97, wb: 3.67, fo: 0.98, R: 0.42, rr: 0.254, tw: 0.275, clr: 0.27, fbump: 0.2, track: 1.76,
  tF: 0.35, nF: 4.5, nR: 30, tR: 0.05, tumble: 0.14, hoodCrown: 0.035, roofCrown: 0.04, crownExp: 3, shoulder: 0.98,
  ...prof({ L: 4.18, H: 1.97, c: 1.66, t: 2.45, r: 4.08, q: 4.14, yb: 1.33, yn: 1.12, yh: 1.27, rise: 0.0, k: 'box', nose: 0.12 }),
  bed: { cab: 4.18, h: 1.34, tail: 'tmod', tailH: 0.42, plateY: 0.62 },
  win: [[1.8, 2.92], [3.02, 3.95]], bpil: [[2.92, 3.02]], blackPillars: true, levels: [1.16, 0.7],
  doors: [1.75, 2.97, 4.0], hoodLine: 1.62, hoodSides: [0.1, 1.62, 0.6], handles: [[2.7, 1.22], [3.72, 1.22]], handleMat: 'chrome', mirror: [1.86, 1.42, 1.35, 'chrome'],
  head: [{ s: [0.64, 0.98], y: [1.0, 1.18], tex: 'hled', poly: [[0, 0], [1, 0.1], [1, 1], [0, 0.9]] }],
  grille: [{ s: 0.64, y: [0.76, 1.2], tex: 'txt:RAM', frame: 'chrome', bars: '#dfe3e6' }],
  bumpF: [{ y: 0.64, h: 0.24, d: 0.1, mat: 'chrome', s: 1.1 }],
  arches: { mat: 'paint', r: 0.03, flare: 0.02 }, plateF: 0.64, wheel: { style: 'alloy6', rim: 'silver' },
  extras: [{ type: 'steps', x: [1.75, 4.0], y: 0.5, mat: 'black' }, { type: 'scoop', d: 0.9, l: 0.7, h: 0.05, w: 0.6 }],
};
// ---------- vans
B.vw_combi = {
  L: 4.28, W: 1.75, H: 1.94, wb: 2.4, fo: 0.62, R: 0.335, rr: 0.19, tw: 0.17, clr: 0.22, track: 1.4,
  tF: 0.42, nF: 2.2, tR: 0.38, nR: 2.4, tumble: 0.12, hoodCrown: 0.02, roofCrown: 0.07, crownExp: 3, shoulder: 0.98, pillarW: 0.07, tuck: 0.04,
  belt: [[0, 1.0], [0.03, 1.12], [0.12, 1.2], [2.0, 1.2], [4.15, 1.2], [4.24, 1.1], [4.28, 0.95]],
  roof: [[0.1, 1.18], [0.12, 1.25], [0.22, 1.6], [0.35, 1.8], [0.6, 1.92], [1.0, 1.94], [3.6, 1.94], [3.95, 1.86], [4.18, 1.65], [4.27, 1.3], [4.28, 1.15]],
  bot: [[0, 0.52], [0.15, 0.32], [0.6, 0.24], [3.4, 0.24], [4.0, 0.32], [4.28, 0.52]],
  ws: [0.12, 0.33], rg: [3.97, 4.2], win: [[0.42, 1.05], [1.12, 1.78], [1.85, 2.5], [2.57, 3.22], [3.29, 3.92]], mainMat: 'white', roofMat: 'white', split: 1.12, lower: 'paint', levels: [1.12, 0.6],
  doors: [0.42, 1.08, 1.6, 2.55], handles: [[0.95, 1.08], [2.45, 1.08]], handleMat: 'chrome', mirror: [0.6, 1.5, 0.8, 'chrome'], wipers: false,
  head: [{ round: 0.09, s: 0.6, y: 0.88, bezel: 'chrome', depth: 0.05 }],
  front: [{ round: 0.03, s: 0.58, y: 1.07, bezel: 'chrome', tex: 'amber' }],
  tail: [{ round: 0.045, s: 0.68, y: 0.9, bezel: 'chrome', tex: 'tround1' }],
  side: [{ x: [3.58, 3.95], y: [1.26, 1.44], tex: 'louver', bars: '#333' }],
  bumpF: [{ y: 0.46, h: 0.11, d: 0.05, mat: 'chrome', s: 1.0 }], bumpR: [{ y: 0.46, h: 0.11, d: 0.05, mat: 'chrome', s: 0.95 }],
  plateF: 0.62, plateR: 0.68, badge: false, wheel: { style: 'steelcap', rim: 'white' },
  extras: [{ type: 'split', x: [0.1, 0.36], r: 0.03, mat: 'white' }, { type: 'vee', y0: 0.86, y1: 1.18, s1: 0.62, r: 0.018, mat: 'white' }],
};
B.toyota_hiace = {
  L: 5.38, W: 1.88, H: 2.29, wb: 3.11, fo: 0.88, R: 0.34, rr: 0.19, tw: 0.195, clr: 0.2, fbump: 0.25, rbump: 0.2,
  tF: 0.4, nF: 3.5, tR: 0.15, nR: 8, tumble: 0.1, hoodCrown: 0.03, roofCrown: 0.05, crownExp: 4, shoulder: 0.98,
  belt: [[0, 0.92], [0.05, 1.04], [0.25, 1.12], [0.55, 1.2], [3, 1.22], [5.3, 1.22], [5.38, 1.15]],
  roof: [[0.5, 1.18], [0.6, 1.3], [0.9, 1.65], [1.22, 2.02], [1.6, 2.25], [2.0, 2.29], [5.25, 2.29], [5.36, 2.22], [5.38, 1.12]],
  ws: [0.58, 1.22], win: [[0.75, 1.58], [1.68, 2.35], [2.45, 3.4], [3.5, 4.4], [4.5, 5.2]], bpil: [[1.58, 1.68], [2.35, 2.45], [3.4, 3.5], [4.4, 4.5]], blackPillars: true, levels: [1.1, 0.6],
  doors: [0.72, 1.62, 2.4, 3.45], hoodLine: 0.52, handles: [[1.4, 1.14], [2.55, 1.14]], mirror: [0.8, 1.35, 1.3, 'black'],
  head: [{ s: [0.44, 0.88], y: [0.86, 1.02], tex: 'hmod2', poly: [[0, 0], [1, 0], [1, 1], [0.1, 1]] }],
  grille: [{ s: 0.44, y: [0.86, 1.04], tex: 'hbar2', frame: 'chrome', bars: 'chrome' }],
  front: [{ s: 0.62, y: [0.42, 0.56], kind: 'grille', tex: 'hbar', frame: 'none' }],
  rear: [{ s: 0.78, y: [1.32, 2.05], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.8, 0.94], y: [0.7, 1.12], tex: 'tclassic' }],
  plateF: 0.5, plateR: 0.7, badge: 'HIACE', badgeS: 0.5, badgeY: 1.2, wheel: { style: 'steel', rim: 'steel' },
};
B.honda_odyssey = {
  L: 5.16, W: 1.99, H: 1.74, wb: 3.0, fo: 0.95, R: 0.36, rr: 0.229, tw: 0.235, clr: 0.16, fbump: 0.22, rbump: 0.28,
  tF: 0.7, nF: 3.2, tR: 0.2, nR: 6, tumble: 0.26, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 5.16, H: 1.74, c: 1.2, t: 2.15, r: 4.72, q: 5.08, yb: 1.06, yn: 0.76, yh: 0.96, rise: 0.04, k: 'hatch' }),
  win: [[1.32, 2.42], [2.52, 3.72], [3.82, 4.72]], bpil: [[2.42, 2.52], [3.72, 3.82]], blackPillars: true, chromeSill: true, levels: [0.95, 0.55],
  doors: [1.32, 2.47, 3.8], hoodLine: 1.15, hoodSides: [0.2, 1.15, 0.72], handles: [[2.25, 1.0], [2.65, 1.0]], handleMat: 'chrome', mirror: [1.38, 1.1, 1.1, 'paint'],
  head: [{ s: [0.45, 0.98], y: [0.78, 0.9], tex: 'hled', poly: SWOOP }],
  grille: [{ s: 0.5, y: [0.82, 0.86], tex: 'solid', bars: 'chrome' }, { s: 0.42, y: [0.66, 0.81], tex: 'hbar2', frame: 'none', bars: 'gloss' }, { s: 0.62, y: [0.32, 0.54], tex: 'honey', frame: 'black', poly: TRAPI }],
  tail: [{ s: [0.38, 1.05], y: [0.96, 1.1], tex: 'tmod', poly: TAILW }],
  side: [{ x: [3.4, 4.6], y: [1.0, 1.02], mat: 'chrome' }],
  plateF: 0.42, plateR: 0.78, badge: 'ODYSSEY', badgeY: 0.95, wheel: { style: 'alloy10', rim: 'silver' },
};

// ---------- deportivos
B.mazda_mx5 = {
  L: 3.97, W: 1.675, H: 1.23, wb: 2.265, fo: 0.78, R: 0.29, rr: 0.178, tw: 0.185, clr: 0.13, fbump: 0.14, rbump: 0.2,
  tF: 0.75, nF: 2.5, tR: 0.5, nR: 3, tumble: 0.42, shoulder: 0.96, hoodCrown: 0.04, roofCrown: 0.05, pillarW: 0.05,
  belt: [[0, 0.5], [0.05, 0.58], [0.35, 0.68], [0.9, 0.77], [1.45, 0.82], [2.5, 0.84], [3.5, 0.87], [3.85, 0.86], [3.95, 0.8], [3.97, 0.7]],
  roof: [[1.4, 0.81], [1.5, 0.9], [1.7, 1.08], [1.9, 1.2], [2.2, 1.23], [2.55, 1.22], [2.8, 1.12], [3.0, 0.93], [3.08, 0.86]],
  ws: [1.47, 1.88], rg: [2.72, 2.95], win: [[1.95, 2.6]], blackPillars: true, roofMat: 'soft', pillarRoof: true,
  doors: [1.5, 2.65], handles: [[2.45, 0.79]], mirror: [1.62, 0.9, 0.8, 'paint'], hoodLine: 1.42, trunkLine: 3.1,
  top: [POPUP(0.38, 0.72, 0.4, 0.7)],
  front: [{ s: 0.3, y: [0.26, 0.38], kind: 'grille', tex: 'hbar', frame: 'black', poly: ELL }, { s: [0.36, 0.66], y: [0.4, 0.46], tex: 'clear' }],
  tail: [{ s: [0.3, 0.84], y: [0.64, 0.75], tex: 'tclassic' }],
  plateF: 0.36, plateR: 0.52, badge: 'MX-5', wheel: { style: 'alloy7', rim: 'silver' }, exhaust: [{ z: 0.45, y: 0.24, r: 0.035, both: false }],
};
B.audi_tt = {
  L: 4.04, W: 1.76, H: 1.35, wb: 2.42, fo: 0.87, R: 0.31, rr: 0.216, tw: 0.225, clr: 0.13, fbump: 0.16, rbump: 0.2,
  tF: 0.8, nF: 2.6, tR: 0.55, nR: 2.8, tumble: 0.45, shoulder: 0.955, hoodCrown: 0.05, roofCrown: 0.08, pillarW: 0.05,
  belt: [[0, 0.54], [0.05, 0.64], [0.3, 0.74], [0.8, 0.84], [1.28, 0.9], [2.5, 0.94], [3.6, 0.94], [3.95, 0.9], [4.02, 0.8], [4.04, 0.64]],
  roof: [[1.22, 0.88], [1.4, 1.02], [1.75, 1.24], [2.1, 1.34], [2.5, 1.35], [2.9, 1.3], [3.25, 1.17], [3.6, 1.0], [3.8, 0.93]],
  ws: [1.3, 2.05], rg: [2.95, 3.62], win: [[1.42, 2.85]], blackPillars: true, chromeSill: true,
  doors: [1.42, 2.62], handles: [[2.4, 0.9]], handleMat: 'chrome', mirror: [1.48, 0.98, 0.85, 'paint'], hoodLine: 0.08, hoodSides: [0.1, 1.25, 0.9],
  head: [{ s: [0.32, 0.84], y: [0.58, 0.73], tex: 'hmod2', poly: rrq(0.4) }],
  grille: [{ s: 0.3, y: [0.42, 0.6], tex: 'honey', frame: 'chrome', poly: rrq(0.3) }],
  front: [{ s: 0.5, y: [0.22, 0.36], kind: 'grille', tex: 'hbar', frame: 'black', poly: rrq(0.3) }],
  tail: [{ s: [0.32, 0.84], y: [0.76, 0.88], tex: 'tclassic', poly: rrq(0.4) }],
  arches: { mat: 'paint', r: 0.03, flare: 0.02 }, plateF: 0.32, plateR: 0.56, badge: 'TT', exhaust: [{ z: 0.45, y: 0.24, r: 0.04, n: 2, gap: 0.09, both: false }],
  wheel: { style: 'alloy6', rim: 'silver' }, extras: [{ type: 'lip', d: 3.9, chord: 0.12, span: 1.3, h: 0.02, tilt: 0.1 }, { type: 'cyl', d: 3.15, y: 0.9, z: 0.875, r: 0.06, h: 0.02, rx: Math.PI / 2, mat: 'chrome', both: false }],
};
B.nissan_gtr = {
  L: 4.71, W: 1.895, H: 1.37, wb: 2.78, fo: 0.98, R: 0.355, rr: 0.254, tw: 0.26, clr: 0.12, fbump: 0.14, rbump: 0.2,
  tF: 0.8, nF: 3.2, tR: 0.4, nR: 4, tumble: 0.4, shoulder: 0.955, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 4.71, H: 1.37, c: 1.55, t: 2.28, r: 2.85, q: 4.12, yb: 0.95, yn: 0.55, yh: 0.74, yd: 1.0, rise: 0.04, k: 'fast' }),
  win: [[1.65, 2.75], [2.82, 3.35]], bpil: [[2.75, 2.82]], blackPillars: true, levels: [0.82, 0.5],
  doors: [1.62, 2.78], handles: [[2.55, 0.91]], handleType: 'flush', mirror: [1.68, 0.98, 0.95, 'paint'], hoodLine: 1.5, hoodSides: [0.2, 1.5, 0.55],
  head: [{ s: [0.42, 0.98], y: [0.6, 0.75], tex: 'hmod2', poly: [[0, 0.1], [1, 0], [1, 1], [0.35, 0.9]] }],
  grille: [{ s: 0.42, y: [0.3, 0.62], tex: 'mesh', frame: 'chrome', poly: [[0.12, 0], [0.88, 0], [1, 1], [0, 1]] }],
  front: [{ s: [0.62, 0.9], y: [0.22, 0.5], kind: 'grille', tex: 'honey', frame: 'black', poly: [[0, 0], [1, 0], [1, 1], [0.4, 1]] }],
  side: [{ x: [1.42, 1.62], y: [0.6, 0.78], tex: 'vlouver', bars: '#333' }],
  tail: [{ s: [0.3, 0.84], y: [0.8, 0.94], tex: 'tround2', poly: rrq(0.45) }],
  rear: [{ s: 0.8, y: [0.2, 0.36], kind: 'grille', tex: 'solid', bars: '#161616' }],
  exhaust: [{ z: 0.5, y: 0.27, r: 0.05, n: 2, gap: 0.12 }], plateF: 0.34, plateR: 0.6, badge: 'GT-R',
  wheel: { style: 'alloy10', rim: 'dark', caliper: 0xd8a020 },
  extras: [{ type: 'wing', d: 4.5, y: 1.08, span: 1.5, chord: 0.22, post: 0.5, ph: 0.08 }],
};
B.toyota_supra = {
  L: 4.52, W: 1.81, H: 1.275, wb: 2.55, fo: 0.93, R: 0.33, rr: 0.216, tw: 0.235, clr: 0.12, fbump: 0.12, rbump: 0.2,
  tF: 1.0, nF: 2.4, tR: 0.5, nR: 3, tumble: 0.5, shoulder: 0.95, hoodCrown: 0.05, roofCrown: 0.08, pillarW: 0.05,
  belt: [[0, 0.5], [0.06, 0.6], [0.4, 0.7], [1.0, 0.79], [1.55, 0.85], [2.6, 0.9], [3.5, 0.92], [4.3, 0.93], [4.45, 0.9], [4.52, 0.74]],
  roof: [[1.5, 0.84], [1.65, 0.95], [1.95, 1.17], [2.25, 1.27], [2.6, 1.275], [2.95, 1.24], [3.3, 1.12], [3.65, 0.98], [3.9, 0.93]],
  ws: [1.55, 2.2], rg: [3.0, 3.75], win: [[1.68, 2.95]], blackPillars: true,
  doors: [1.62, 2.8], handles: [[2.6, 0.88]], handleType: 'flush', mirror: [1.68, 0.95, 0.85, 'paint'], hoodLine: 1.5, hoodSides: [0.1, 1.5, 0.8],
  head: [{ s: [0.42, 0.86], y: [0.55, 0.67], tex: 'hmod2', poly: SWOOP }],
  grille: [{ s: 0.45, y: [0.24, 0.42], tex: 'hbar', frame: 'black', poly: ELL }],
  front: [{ s: [0.5, 0.8], y: [0.42, 0.47], tex: 'amber' }],
  tail: [{ s: [0.22, 0.86], y: [0.68, 0.82], tex: 'tround2', poly: rrq(0.3) }],
  exhaust: [{ z: 0.48, y: 0.26, r: 0.055, both: false }], plateF: 0.33, plateR: 0.5, badge: 'SUPRA',
  wheel: { style: 'alloy5', rim: 'silver' }, extras: [{ type: 'wing', d: 4.27, y: 1.14, span: 1.62, chord: 0.3, post: 0.56, ph: 0.06, tilt: 0.1 }],
};
B.mazda_rx7 = {
  L: 4.285, W: 1.76, H: 1.23, wb: 2.425, fo: 0.9, R: 0.32, rr: 0.216, tw: 0.225, clr: 0.12, fbump: 0.12, rbump: 0.18,
  tF: 0.95, nF: 2.3, tR: 0.5, nR: 2.8, tumble: 0.52, shoulder: 0.95, hoodCrown: 0.03, roofCrown: 0.08, pillarW: 0.05,
  belt: [[0, 0.5], [0.06, 0.58], [0.4, 0.68], [1.0, 0.78], [1.55, 0.83], [2.5, 0.86], [3.5, 0.9], [4.15, 0.9], [4.25, 0.85], [4.285, 0.72]],
  fender: [[0.1, 0], [0.5, 0.07], [1.0, 0.06], [1.45, 0], [3.5, 0], [3.75, 0.05], [4.1, 0.04], [4.28, 0]],
  roof: [[1.5, 0.82], [1.6, 0.92], [1.85, 1.12], [2.15, 1.22], [2.45, 1.23], [2.8, 1.19], [3.2, 1.06], [3.55, 0.94], [3.75, 0.9]],
  ws: [1.53, 2.12], rg: [2.82, 3.58], win: [[1.62, 2.75]], blackPillars: true,
  doors: [1.58, 2.72], handles: [[2.55, 0.83]], handleType: 'flush', mirror: [1.64, 0.92, 0.85, 'paint'], hoodLine: 1.5,
  top: [POPUP(0.4, 0.78, 0.42, 0.7)],
  front: [{ s: 0.42, y: [0.26, 0.42], kind: 'grille', tex: 'mesh', frame: 'black', poly: ELL }, { s: [0.46, 0.72], y: [0.3, 0.37], tex: 'clear' }],
  rear: [{ s: 0.84, y: [0.66, 0.8], kind: 'grille', tex: 'solid', bars: '#141414' }],
  tail: [{ s: [0.24, 0.82], y: [0.665, 0.795], tex: 'tround3', poly: rrq(0.3) }],
  exhaust: [{ z: 0.55, y: 0.25, r: 0.045 }], plateF: null, plateR: 0.48, badge: 'RX-7',
  wheel: { style: 'alloy5', rim: 'silver' }, extras: [{ type: 'wing', d: 4.1, y: 1.03, span: 1.45, chord: 0.2, post: 0.52, ph: 0.05 }],
};
B.bmw_m3 = {
  L: 4.49, W: 1.78, H: 1.37, wb: 2.73, fo: 0.8, R: 0.33, rr: 0.229, tw: 0.245, clr: 0.13, fbump: 0.15, rbump: 0.2,
  tF: 0.55, nF: 3.4, tR: 0.5, nR: 4, tumble: 0.4, shoulder: 0.955, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 4.49, H: 1.37, c: 1.42, t: 2.15, r: 2.95, q: 3.8, yb: 0.93, yn: 0.6, yh: 0.78, yd: 1.0, rise: 0.04 }),
  win: [[1.55, 2.6], [2.66, 3.15]], bpil: [[2.6, 2.66]], blackPillars: true, levels: [0.82, 0.55],
  doors: [1.5, 2.65], hoodLine: 0.06, hoodSides: [0.08, 1.38, 0.95], trunkLine: 3.85, handles: [[2.45, 0.89]], handleMat: 'paint', mirror: [1.58, 0.97, 0.9, 'paint'],
  head: [{ s: [0.2, 0.8], y: [0.61, 0.74], tex: 'hround2', poly: [[0, 0], [1, 0.05], [1, 0.85], [0.8, 1], [0, 1]] }],
  front: [{ s: [0.02, 0.17], y: [0.6, 0.75], kind: 'grille', tex: 'vbar', bars: 'black', frame: 'chrome', poly: [[0, 0.1], [0.9, 0], [1, 0.9], [0.85, 1], [0.05, 1], [0, 0.85]] }, { s: 0.45, y: [0.24, 0.42], kind: 'grille', tex: 'mesh', frame: 'black', poly: TRAPI }, { s: [0.55, 0.75], y: [0.3, 0.38], tex: 'fog' }],
  side: [{ x: [1.22, 1.42], y: [0.7, 0.8], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }],
  tail: [{ s: [0.3, 0.84], y: [0.8, 0.93], tex: 'tred2', poly: [[0, 0], [1, 0], [1, 1], [0.3, 1], [0, 0.6]] }],
  exhaust: [{ z: 0.48, y: 0.26, r: 0.04, n: 2, gap: 0.1 }], plateF: 0.36, plateR: 0.72, badge: 'M3',
  wheel: { style: 'y', rim: 'silver' },
};
B.lotus_elise = {
  L: 3.785, W: 1.72, H: 1.117, wb: 2.3, fo: 0.84, R: 0.29, rr: 0.203, tw: 0.205, clr: 0.12, fbump: 0.12, rbump: 0.16,
  tF: 0.8, nF: 2.4, tR: 0.35, nR: 3, tumble: 0.55, shoulder: 0.93, hoodCrown: 0.03, roofCrown: 0.06, pillarW: 0.05,
  belt: [[0, 0.48], [0.05, 0.56], [0.4, 0.64], [1.15, 0.74], [1.8, 0.8], [2.8, 0.86], [3.6, 0.86], [3.75, 0.82], [3.785, 0.72]],
  fender: [[0.05, 0], [0.35, 0.09], [0.8, 0.1], [1.15, 0.04], [1.3, 0], [2.95, 0], [3.2, 0.06], [3.6, 0.05], [3.78, 0]],
  roof: [[1.2, 0.74], [1.3, 0.8], [1.5, 0.97], [1.75, 1.1], [2.05, 1.117], [2.35, 1.1], [2.6, 1.02], [2.9, 0.92], [3.1, 0.87]],
  ws: [1.25, 1.72], win: [[1.4, 2.25]], blackPillars: true, roofMat: 'black',
  doors: [1.35, 2.3], mirror: [1.42, 0.86, 0.75, 'black'], hoodLine: 1.18,
  head: [{ s: [0.3, 0.72], y: [0.5, 0.66], tex: 'hmod2', poly: [[0, 0], [1, 0.25], [1, 1], [0.4, 0.95], [0, 0.6]] }],
  grille: [{ s: 0.38, y: [0.22, 0.38], tex: 'mesh', frame: 'black', poly: ELL }],
  top: [{ x: [3.0, 3.55], z: [-0.36, 0.36], tex: 'louver', bars: '#333' }],
  side: [{ x: [2.35, 2.78], y: [0.45, 0.7], tex: 'naca', poly: [[0, 0.1], [1, 0.3], [1, 1], [0.1, 0.9]] }],
  tail: [{ s: [0.24, 0.72], y: [0.62, 0.75], tex: 'tround2', poly: rrq(0.45) }],
  rear: [{ s: 0.5, y: [0.2, 0.36], kind: 'grille', tex: 'mesh', frame: 'black' }],
  exhaust: [{ z: 0.0, y: 0.3, r: 0.045, both: false }], plateF: null, plateR: 0.45, badge: 'ELISE',
  wheel: { style: 'alloy6', rim: 'silver' },
};
// ---------- muscle
B.ford_mustang_1967 = {
  L: 4.72, W: 1.8, H: 1.31, wb: 2.74, fo: 0.95, R: 0.33, rr: 0.178, tw: 0.2, clr: 0.15, fbump: 0.12, rbump: 0.14, metal: 0.15,
  tF: 0.4, nF: 3.4, tR: 0.3, nR: 5, tumble: 0.36, hoodCrown: 0.025, roofCrown: 0.06,
  belt: [[0, 0.72], [0.04, 0.8], [0.15, 0.86], [0.8, 0.88], [1.65, 0.9], [2.6, 0.92], [3.7, 0.95], [4.6, 0.96], [4.68, 0.93], [4.72, 0.84]],
  roof: [[1.6, 0.89], [1.75, 1.0], [2.05, 1.22], [2.35, 1.3], [2.7, 1.31], [3.0, 1.27], [3.6, 1.12], [4.2, 0.98], [4.4, 0.96]],
  ws: [1.65, 2.3], rg: [3.05, 4.1], win: [[1.8, 2.95]], chromeSill: true, levels: [0.72, 0.5],
  doors: [1.75, 2.98], hoodLine: 1.58, hoodSides: [0.1, 1.58, 0.82], trunkLine: 4.3, handles: [[2.78, 0.86]], handleMat: 'chrome', mirror: [1.85, 0.94, 0.8, 'chrome'],
  lines: [[0.1, 3.6, 0.74, 0.008, 'chrome']],
  head: [{ round: 0.085, s: 0.74, y: 0.72, bezel: 'chrome', depth: 0.06 }],
  grille: [{ s: 0.62, y: [0.56, 0.82], tex: 'egg', frame: 'chrome', bars: '#3a3a3a' }],
  side: [{ x: [3.02, 3.4], y: [0.99, 1.1], tex: 'louver', bars: '#999' }, { x: [3.3, 3.62], y: [0.6, 0.78], tex: 'naca', poly: [[0, 0.2], [1, 0], [1, 1], [0, 0.8]] }],
  rear: [{ s: 0.84, y: [0.66, 0.9], kind: 'grille', tex: 'solid', bars: '#161616' }],
  tail: [{ s: [0.18, 0.76], y: [0.7, 0.86], tex: 'tbars3' }],
  bumpF: [{ y: 0.5, h: 0.09, d: 0.06, mat: 'chrome', s: 1.0 }], bumpR: [{ y: 0.52, h: 0.09, d: 0.06, mat: 'chrome', s: 0.95 }],
  exhaust: [{ z: 0.45, y: 0.25, r: 0.04 }], plateF: 0.4, plateR: 0.6, badge: 'MUSTANG',
  wheel: { style: 'rally', rim: 'steel' },
};
B.ford_mustang = {
  L: 4.79, W: 1.92, H: 1.38, wb: 2.72, fo: 0.9, R: 0.35, rr: 0.241, tw: 0.255, clr: 0.13, fbump: 0.14, rbump: 0.2,
  tF: 0.75, nF: 3.4, tR: 0.45, nR: 4, tumble: 0.42, shoulder: 0.955, hoodCrown: 0.04, roofCrown: 0.06,
  belt: [[0, 0.66], [0.04, 0.76], [0.2, 0.82], [0.9, 0.9], [1.75, 0.94], [2.7, 0.96], [3.7, 0.98], [4.55, 0.99], [4.72, 0.95], [4.79, 0.82]],
  fender: [[2.9, 0], [3.4, 0.03], [3.9, 0.04], [4.5, 0]],
  roof: [[1.7, 0.93], [1.85, 1.04], [2.1, 1.24], [2.4, 1.36], [2.75, 1.38], [3.1, 1.33], [3.6, 1.17], [4.1, 1.02], [4.25, 0.99]],
  ws: [1.75, 2.38], rg: [3.2, 4.15], win: [[1.88, 3.25]], blackPillars: true, levels: [0.84, 0.5],
  doors: [1.82, 3.0], hoodLine: 1.68, hoodSides: [0.1, 1.68, 0.65], trunkLine: 4.28, handles: [[2.8, 0.93]], handleType: 'flush', mirror: [1.92, 1.01, 0.95, 'paint'],
  head: [{ s: [0.55, 0.98], y: [0.7, 0.84], tex: 'hled', poly: [[0, 0], [1, 0.25], [1, 1], [0.15, 0.85]] }],
  grille: [{ s: 0.55, y: [0.4, 0.78], tex: 'honey', frame: 'black', poly: [[0.06, 0], [0.94, 0], [1, 1], [0, 1]] }],
  top: [{ x: [0.6, 0.95], z: [0.22, 0.42], tex: 'vlouver', bars: '#2a2a2a' }],
  rear: [{ s: 0.86, y: [0.78, 0.96], kind: 'grille', tex: 'solid', bars: '#141414' }, { s: 0.8, y: [0.2, 0.34], kind: 'grille', tex: 'solid', bars: '#161616' }],
  tail: [{ s: [0.25, 0.8], y: [0.8, 0.94], tex: 'tbars3' }],
  exhaust: [{ z: 0.48, y: 0.26, r: 0.045, n: 2, gap: 0.11 }], plateF: 0.34, plateR: 0.6, badge: 'MUSTANG',
  wheel: { style: 'alloy10', rim: 'dark', caliper: 0xc01010 }, extras: [{ type: 'lip', d: 4.6, chord: 0.12, span: 1.3, h: 0.0, tilt: 0.15 }],
};
B.dodge_challenger = {
  L: 5.03, W: 1.92, H: 1.45, wb: 2.95, fo: 0.97, R: 0.35, rr: 0.254, tw: 0.245, clr: 0.14, fbump: 0.12, rbump: 0.18,
  tF: 0.3, nF: 6, tR: 0.3, nR: 6, tumble: 0.32, hoodCrown: 0.03, roofCrown: 0.05,
  belt: [[0, 0.74], [0.03, 0.84], [0.15, 0.9], [1.0, 0.93], [1.85, 0.97], [3.0, 0.99], [4.1, 1.0], [4.95, 1.0], [5.0, 0.96], [5.03, 0.85]],
  roof: [[1.8, 0.96], [1.95, 1.07], [2.25, 1.3], [2.55, 1.43], [2.95, 1.45], [3.3, 1.42], [3.7, 1.22], [3.95, 1.06], [4.05, 1.0]],
  ws: [1.85, 2.5], rg: [3.35, 3.98], win: [[1.98, 3.15], [3.2, 3.55]], blackPillars: true, levels: [0.84, 0.5],
  doors: [1.9, 3.18], hoodLine: 1.75, hoodSides: [0.1, 1.75, 0.78], trunkLine: 4.08, handles: [[2.95, 0.93]], handleMat: 'paint', mirror: [1.98, 1.02, 1.0, 'paint'],
  grille: [{ s: 0.96, y: [0.62, 0.88], tex: 'egg', frame: 'chrome', bars: '#2a2a2a' }],
  head: [{ round: 0.075, s: 0.62, y: 0.76, bezel: 'black', depth: 0.03, out: 0.0 }, { round: 0.075, s: 0.8, y: 0.76, bezel: 'black', depth: 0.03, out: 0.0 }],
  front: [{ s: 0.62, y: [0.3, 0.5], kind: 'grille', tex: 'mesh', frame: 'black' }],
  tail: [{ s: 0.92, y: [0.8, 0.96], tex: 'tmod', poly: [[0, 0], [1, 0], [1, 1], [0, 1]] }],
  exhaust: [{ z: 0.55, y: 0.26, r: 0.05, shape: 'rect', w: 0.16 }], plateF: 0.4, plateR: 0.62, badge: 'CHALLENGER',
  wheel: { style: 'alloy5', rim: 'dark' }, extras: [{ type: 'scoop', d: 0.7, l: 0.6, h: 0.07, w: 0.5 }, { type: 'lip', d: 4.85, chord: 0.12, span: 1.4, h: 0.0, tilt: 0.12 }],
};
B.dodge_charger = {
  L: 5.04, W: 1.905, H: 1.48, wb: 3.05, fo: 0.98, R: 0.35, rr: 0.254, tw: 0.245, clr: 0.14, fbump: 0.16, rbump: 0.22,
  tF: 0.55, nF: 4, tR: 0.45, nR: 5, tumble: 0.34, hoodCrown: 0.04, roofCrown: 0.06,
  ...prof({ L: 5.04, H: 1.48, c: 1.75, t: 2.5, r: 3.4, q: 4.3, yb: 0.99, yn: 0.7, yh: 0.88, yd: 1.05, rise: 0.04 }),
  win: [[1.88, 2.95], [3.03, 3.95]], bpil: [[2.95, 3.03]], blackPillars: true, levels: [0.86, 0.52],
  doors: [1.82, 2.99, 3.85], hoodLine: 1.7, hoodSides: [0.1, 1.7, 0.7], trunkLine: 4.35, handles: [[2.75, 0.95], [3.7, 0.97]], handleMat: 'paint', mirror: [1.9, 1.04, 1.0, 'paint'],
  head: [{ s: [0.6, 0.96], y: [0.72, 0.86], tex: 'hled', poly: SLANT }],
  grille: [{ s: 0.6, y: [0.64, 0.86], tex: 'honey', frame: 'chrome', poly: [[0, 0], [1, 0], [0.96, 1], [0.04, 1]] }, { s: 0.6, y: [0.3, 0.54], tex: 'honey', frame: 'black', poly: TRAPI }],
  tail: [{ s: 0.98, y: [0.9, 1.01], tex: 'tmod', poly: [[0, 0], [1, 0], [1, 1], [0, 1]] }],
  exhaust: [{ z: 0.55, y: 0.27, r: 0.045 }], plateF: 0.4, plateR: 0.72, badge: 'CHARGER',
  wheel: { style: 'alloy5', rim: 'silver', caliper: 0xc01010 }, extras: [{ type: 'lip', d: 4.92, chord: 0.12, span: 1.4, h: 0.0, tilt: 0.12 }],
};
B.chevrolet_camaro_1969 = {
  L: 4.72, W: 1.85, H: 1.3, wb: 2.74, fo: 0.92, R: 0.34, rr: 0.178, tw: 0.215, clr: 0.15, fbump: 0.12, rbump: 0.14, metal: 0.15,
  tF: 0.35, nF: 4, tR: 0.3, nR: 5, tumble: 0.36, hoodCrown: 0.025, roofCrown: 0.06,
  belt: [[0, 0.7], [0.04, 0.8], [0.2, 0.84], [0.8, 0.86], [1.6, 0.88], [2.4, 0.86], [3.3, 0.9], [4.0, 0.92], [4.65, 0.92], [4.72, 0.8]],
  roof: [[1.55, 0.87], [1.7, 0.98], [2.0, 1.2], [2.3, 1.29], [2.7, 1.3], [3.0, 1.27], [3.3, 1.12], [3.7, 0.97], [3.85, 0.93]],
  ws: [1.6, 2.25], rg: [3.05, 3.75], win: [[1.72, 2.95], [3.0, 3.3]], chromeSill: true, roofMat: 'black', levels: [0.72, 0.5],
  doors: [1.68, 2.98], hoodLine: 1.52, hoodSides: [0.1, 1.52, 0.8], trunkLine: 3.88, handles: [[2.78, 0.84]], handleMat: 'chrome', mirror: [1.8, 0.92, 0.8, 'chrome'],
  lines: [[0.2, 4.4, 0.66, 0.006, 'chrome']],
  grille: [{ s: 0.95, y: [0.56, 0.82], tex: 'egg', frame: 'chrome', bars: '#2c2c2c' }],
  head: [{ round: 0.08, s: 0.74, y: 0.69, bezel: 'chrome', depth: 0.04 }],
  top: [{ x: [0.0, 1.5], z: [-0.3, 0.3], stripe: 0xf4f4f0 }, { x: [3.9, 4.72], z: [-0.3, 0.3], stripe: 0xf4f4f0 }],
  tail: [{ s: [0.12, 0.78], y: [0.64, 0.8], tex: 'tred' }],
  bumpF: [{ y: 0.5, h: 0.09, d: 0.06, mat: 'chrome', s: 1.05 }], bumpR: [{ y: 0.52, h: 0.09, d: 0.06, mat: 'chrome', s: 1.0 }],
  exhaust: [{ z: 0.5, y: 0.25, r: 0.04 }], plateF: 0.4, plateR: 0.48, badge: 'CAMARO SS',
  wheel: { style: 'rally', rim: 'steel' }, extras: [{ type: 'lip', d: 4.6, chord: 0.14, span: 1.4, h: 0.0, tilt: 0.15 }],
};

// ---------- lujo
B.mercedes_g = {
  L: 4.66, W: 1.86, H: 1.95, wb: 2.85, fo: 0.76, R: 0.38, rr: 0.229, tw: 0.265, clr: 0.23, fbump: 0.12, rbump: 0.12, track: 1.56,
  tF: 0.12, nF: 9, tR: 0.1, nR: 10, tumble: 0.04, hoodCrown: 0.015, roofCrown: 0.02, crownExp: 6, shoulder: 0.99, tuck: 0.02, pillarW: 0.07,
  belt: [[0, 1.0], [0.03, 1.08], [1.4, 1.13], [4.6, 1.15], [4.66, 1.06]],
  roof: [[1.42, 1.12], [1.46, 1.25], [1.72, 1.88], [1.82, 1.95], [4.58, 1.95], [4.64, 1.9], [4.66, 1.0]],
  ws: [1.44, 1.76], win: [[1.6, 2.6], [2.72, 3.6], [3.72, 4.45]], bpil: [[2.6, 2.72], [3.6, 3.72]], blackPillars: true,
  molding: [0.78, 0.85, 0.2, 4.5], doors: [1.55, 2.66, 3.62], hoodLine: 1.42, hoodSides: [0.03, 1.42, 0.92], handles: [[2.4, 1.06], [3.4, 1.06]], handleMat: 'chrome', mirror: [1.6, 1.25, 1.2, 'paint'],
  head: [{ round: 0.1, s: 0.66, y: 0.9, bezel: 'black', depth: 0.06 }],
  grille: [{ s: 0.42, y: [0.74, 1.05], tex: 'hbar3', bars: 'chrome', frame: 'chrome' }],
  rear: [{ s: 0.72, y: [1.25, 1.72], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.74, 0.9], y: [0.72, 1.0], tex: 'tclassic' }],
  bumpF: [{ y: 0.48, h: 0.18, d: 0.1, mat: 'black', s: 1.0 }], bumpR: [{ y: 0.48, h: 0.18, d: 0.1, mat: 'black', s: 1.0 }],
  plateF: 0.5, plateR: 0.62, badge: 'G 500', badgeS: 0.5, badgeY: 1.05, wheel: { style: 'y', rim: 'silver' },
  extras: [{ type: 'spare', y: 1.08, r: 0.38, cover: 'paint' }, { type: 'hinges', d: [1.6, 2.72], y: [1.0, 0.7] }, { type: 'box', d: 0.22, y: 1.15, z: 0.72, l: 0.12, h: 0.06, w: 0.1, mat: 'amber' }, { type: 'steps', x: [1.5, 3.6], y: 0.42, mat: 'black' }],
};
B.mercedes_sl = {
  L: 4.47, W: 1.81, H: 1.29, wb: 2.515, fo: 0.88, R: 0.31, rr: 0.216, tw: 0.225, clr: 0.13, fbump: 0.16, rbump: 0.2,
  tF: 0.45, nF: 3.4, tR: 0.4, nR: 4, tumble: 0.4, shoulder: 0.96, hoodCrown: 0.04, roofCrown: 0.06,
  belt: [[0, 0.58], [0.05, 0.68], [0.3, 0.74], [1.0, 0.8], [1.55, 0.84], [2.6, 0.86], [3.6, 0.9], [4.35, 0.92], [4.44, 0.89], [4.47, 0.8]],
  roof: [[1.5, 0.83], [1.62, 0.93], [1.9, 1.15], [2.2, 1.27], [2.6, 1.29], [2.95, 1.26], [3.2, 1.1], [3.35, 0.95], [3.42, 0.9]],
  ws: [1.55, 2.15], rg: [2.98, 3.36], win: [[1.65, 2.95]], chromeSill: true, blackPillars: true, levels: [0.6, 0.45],
  molding: [0.36, 0.5, 0.25, 4.2], moldMat: 'paint', lines: [[0.25, 4.2, 0.4, 0.006, 'trim'], [0.25, 4.2, 0.45, 0.006, 'trim']],
  doors: [1.6, 2.85], hoodLine: 1.48, hoodSides: [0.15, 1.48, 0.75], trunkLine: 3.48, handles: [[2.62, 0.82]], handleMat: 'chrome', mirror: [1.68, 0.92, 0.9, 'paint'],
  head: [{ s: [0.44, 0.86], y: [0.55, 0.7], tex: 'hrecta', poly: [[0, 0], [1, 0], [1, 0.85], [0.95, 1], [0, 1]] }],
  grille: [{ s: 0.42, y: [0.53, 0.7], tex: 'hbar2', bars: 'chrome', frame: 'chrome', poly: [[0, 0], [1, 0], [0.96, 1], [0.04, 1]] }],
  front: [{ round: 0.05, s: 0, y: 0.62, bezel: 'chrome', tex: 'clear', depth: 0.02 }],
  side: [{ x: [1.22, 1.45], y: [0.64, 0.74], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }],
  tail: [{ s: [0.3, 0.86], y: [0.64, 0.82], tex: 'tclassic', poly: [[0, 0], [1, 0], [1, 1], [0, 0.8]] }],
  exhaust: [{ z: 0.5, y: 0.25, r: 0.04 }], plateF: 0.38, plateR: 0.58, badge: 'SL 500', wheel: { style: 'holes', rim: 'silver' },
};
B.cadillac_escalade = {
  L: 5.18, W: 2.04, H: 1.89, wb: 2.95, fo: 1.0, R: 0.41, rr: 0.279, tw: 0.285, clr: 0.22, fbump: 0.2, rbump: 0.22,
  tF: 0.25, nF: 6, tR: 0.15, nR: 7, tumble: 0.14, hoodCrown: 0.03, roofCrown: 0.04, crownExp: 3, shoulder: 0.975,
  ...prof({ L: 5.18, H: 1.89, c: 1.55, t: 2.32, r: 5.08, q: 5.12, yb: 1.2, yn: 1.0, yh: 1.15, rise: 0.04, k: 'box', nose: 0.1 }),
  win: [[1.68, 2.78], [2.88, 3.85], [3.97, 4.9]], bpil: [[2.78, 2.88], [3.85, 3.97]], blackPillars: true, chromeSill: true, levels: [1.05, 0.62],
  doors: [1.65, 2.83, 3.92], hoodLine: 1.5, hoodSides: [0.1, 1.5, 0.75], handles: [[2.55, 1.12], [3.65, 1.14]], handleMat: 'chrome', mirror: [1.7, 1.25, 1.3, 'paint'],
  head: [{ s: [0.64, 0.96], y: [0.98, 1.14], tex: 'hmod2', poly: [[0, 0], [1, 0], [1, 1], [0, 1]] }, { s: [0.88, 0.97], y: [0.6, 0.98], tex: 'drl' }],
  grille: [{ s: 0.62, y: [0.66, 1.15], tex: 'egg', frame: 'chrome', bars: 'chrome', poly: [[0.05, 0], [0.95, 0], [1, 1], [0, 1]] }],
  rear: [{ s: 0.72, y: [1.3, 1.78], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.86, 1.04], y: [1.0, 1.72], tex: 'tmod' }],
  bumpR: [{ y: 0.55, h: 0.16, d: 0.07, mat: 'chrome', s: 1.0 }],
  plateF: 0.5, plateR: 0.9, badge: 'ESCALADE', badgeS: 0.5, badgeY: 1.22, wheel: { style: 'alloy6', rim: 'chrome' },
  extras: [{ type: 'rails', x: [2.3, 4.95], zf: 0.85, mat: 'chrome' }, { type: 'steps', x: [1.6, 4.0], y: 0.43, mat: 'chrome' }],
};
B.range_rover = {
  L: 5.0, W: 1.98, H: 1.84, wb: 2.92, fo: 0.95, R: 0.4, rr: 0.254, tw: 0.275, clr: 0.22, fbump: 0.2, rbump: 0.2,
  tF: 0.35, nF: 4.5, tR: 0.2, nR: 6, tumble: 0.16, hoodCrown: 0.025, roofCrown: 0.03, crownExp: 3.5, shoulder: 0.975,
  ...prof({ L: 5.0, H: 1.84, c: 1.5, t: 2.3, r: 4.88, q: 4.95, yb: 1.12, yn: 0.92, yh: 1.06, rise: 0.0, k: 'box', nose: 0.1, hood: 0.4 }),
  win: [[1.62, 2.75], [2.85, 3.85], [3.95, 4.75]], bpil: [[2.75, 2.85], [3.85, 3.95]], blackPillars: true, roofMat: 'black', pillarRoof: true, chromeSill: true, levels: [1.0, 0.55],
  doors: [1.6, 2.8, 3.92], hoodLine: 1.46, hoodSides: [0.05, 1.46, 0.97], handles: [[2.5, 1.04], [3.6, 1.06]], handleType: 'flush', mirror: [1.65, 1.18, 1.2, 'black'],
  head: [{ s: [0.48, 0.96], y: [0.88, 1.0], tex: 'hled', poly: [[0, 0], [1, 0.1], [1, 1], [0, 0.9]] }],
  grille: [{ s: 0.47, y: [0.8, 1.0], tex: 'honey', frame: 'chrome', bars: 'gloss' }],
  front: [{ s: 0.62, y: [0.36, 0.56], kind: 'grille', tex: 'honey', frame: 'black', poly: TRAPI }],
  side: [{ x: [1.25, 1.6], y: [0.76, 0.86], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }],
  rear: [{ s: 0.72, y: [1.24, 1.7], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.8, 0.98], y: [0.96, 1.22], tex: 'tmod' }],
  plateF: 0.48, plateR: 0.82, badge: 'RANGE ROVER', badgeS: 0, badgeY: 1.14, wheel: { style: 'alloy10', rim: 'silver' },
  extras: [{ type: 'lip', d: 4.92, chord: 0.12, span: 1.5, h: 0.0, tilt: 0.1, mat: 'black' }],
};
B.bentley_continental = {
  L: 4.85, W: 1.95, H: 1.4, wb: 2.85, fo: 0.92, R: 0.36, rr: 0.267, tw: 0.275, clr: 0.13, fbump: 0.14, rbump: 0.2,
  tF: 0.55, nF: 3.4, tR: 0.45, nR: 3.6, tumble: 0.42, shoulder: 0.955, hoodCrown: 0.05, roofCrown: 0.07,
  belt: [[0, 0.66], [0.04, 0.76], [0.25, 0.82], [1.0, 0.9], [1.75, 0.94], [2.8, 0.98], [3.8, 1.0], [4.6, 0.99], [4.78, 0.94], [4.85, 0.8]],
  fender: [[4.0, 0], [4.3, 0.04], [4.75, 0]],
  roof: [[1.72, 0.93], [1.88, 1.05], [2.15, 1.27], [2.45, 1.38], [2.8, 1.4], [3.15, 1.36], [3.6, 1.2], [4.0, 1.04], [4.2, 1.0]],
  ws: [1.75, 2.42], rg: [3.25, 4.12], win: [[1.9, 3.25]], chromeSill: true, blackPillars: true, levels: [0.84, 0.5],
  doors: [1.85, 3.1], hoodLine: 0.1, hoodSides: [0.1, 1.7, 0.85], trunkLine: 4.25, handles: [[2.9, 0.95]], handleMat: 'chrome', mirror: [1.92, 1.02, 1.0, 'paint'],
  grille: [{ s: 0.42, y: [0.42, 0.82], tex: 'mesh', frame: 'chrome', bars: 'chrome', poly: [[0.08, 0], [0.92, 0], [1, 0.85], [0.9, 1], [0.1, 1], [0, 0.85]] }],
  head: [{ round: 0.1, s: 0.74, y: 0.75, bezel: 'chrome', depth: 0.03 }, { round: 0.07, s: 0.55, y: 0.75, bezel: 'chrome', depth: 0.03 }],
  front: [{ s: [0.48, 0.86], y: [0.22, 0.4], kind: 'grille', tex: 'mesh', frame: 'chrome', bars: 'chrome' }],
  tail: [{ s: [0.4, 0.88], y: [0.8, 0.93], tex: 'tmod', poly: ELL }],
  exhaust: [{ z: 0.55, y: 0.26, r: 0.05, shape: 'rect', w: 0.2 }], plateF: 0.34, plateR: 0.62, badge: 'CONTINENTAL GT',
  wheel: { style: 'alloy10', rim: 'silver', caliper: 0x1a1a1a },
};
// ---------- clásicos
B.chevrolet_impala_1964 = {
  L: 5.37, W: 2.02, H: 1.39, wb: 3.02, fo: 1.02, R: 0.36, rr: 0.19, tw: 0.2, clr: 0.17, fbump: 0.12, rbump: 0.12, metal: 0.18,
  tF: 0.3, nF: 6, tR: 0.3, nR: 6, tumble: 0.3, hoodCrown: 0.02, roofCrown: 0.05, crownExp: 2.5,
  belt: [[0, 0.78], [0.03, 0.86], [0.15, 0.9], [1.0, 0.92], [1.85, 0.93], [3.2, 0.94], [4.4, 0.95], [5.3, 0.95], [5.35, 0.92], [5.37, 0.84]],
  roof: [[1.8, 0.92], [1.95, 1.02], [2.25, 1.25], [2.55, 1.37], [2.95, 1.39], [3.4, 1.37], [3.7, 1.25], [3.95, 1.04], [4.05, 0.97]],
  ws: [1.85, 2.5], rg: [3.5, 4.0], win: [[1.98, 3.3], [3.36, 3.75]], chromeSill: true, levels: [0.82, 0.5],
  doors: [1.95, 3.25], hoodLine: 1.75, trunkLine: 4.1, handles: [[3.05, 0.88]], handleMat: 'chrome', mirror: [2.0, 0.98, 0.85, 'chrome'],
  lines: [[0.15, 5.2, 0.8, 0.012, 'chrome'], [1.2, 4.5, 0.38, 0.02, 'chrome']],
  grille: [{ s: 1.0, y: [0.58, 0.86], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }],
  head: [{ round: 0.075, s: 0.68, y: 0.73, bezel: 'chrome', depth: 0.03 }, { round: 0.075, s: 0.88, y: 0.73, bezel: 'chrome', depth: 0.03 }],
  rear: [{ s: 0.98, y: [0.64, 0.86], kind: 'grille', tex: 'solid', bars: 'chrome' }],
  tail: [{ s: [0.22, 0.96], y: [0.67, 0.83], tex: 'tround3', poly: rrq(0.25) }],
  bumpF: [{ y: 0.5, h: 0.13, d: 0.07, mat: 'chrome', s: 1.15 }], bumpR: [{ y: 0.52, h: 0.12, d: 0.07, mat: 'chrome', s: 1.1 }],
  exhaust: [{ z: 0.5, y: 0.26, r: 0.04 }], plateF: 0.5, plateR: 0.5, badge: 'IMPALA SS', badgeY: 0.92,
  wheel: { style: 'wire', rim: 'chrome', whitewall: true },
};
B.cadillac_eldorado_1959 = {
  L: 5.72, W: 2.03, H: 1.38, wb: 3.3, fo: 1.07, R: 0.38, rr: 0.19, tw: 0.21, clr: 0.17, fbump: 0.12, rbump: 0.12, metal: 0.25,
  tF: 0.35, nF: 5, tR: 0.3, nR: 6, tumble: 0.3, hoodCrown: 0.02, roofCrown: 0.04, crownExp: 2.5,
  belt: [[0, 0.72], [0.03, 0.82], [0.15, 0.88], [1.2, 0.9], [2.0, 0.9], [3.5, 0.92], [4.8, 0.94], [5.6, 0.94], [5.68, 0.9], [5.72, 0.82]],
  roof: [[1.95, 0.89], [2.05, 1.0], [2.25, 1.22], [2.5, 1.35], [2.9, 1.38], [3.6, 1.37], [3.85, 1.28], [4.05, 1.06], [4.12, 0.98]],
  ws: [1.98, 2.45], rg: [3.75, 4.08], win: [[2.1, 3.55], [3.62, 3.85]], chromeSill: true, roofMat: 'white', levels: [0.8, 0.5],
  doors: [2.05, 3.5], hoodLine: 1.92, trunkLine: 4.15, handles: [[3.3, 0.86]], handleMat: 'chrome', mirror: [2.1, 0.96, 0.85, 'chrome'],
  lines: [[1.3, 4.7, 0.37, 0.03, 'chrome'], [4.0, 5.6, 0.72, 0.02, 'chrome'], [0.2, 1.9, 0.78, 0.01, 'chrome']],
  grille: [{ s: 1.0, y: [0.5, 0.78], tex: 'dots', bars: 'chrome', frame: 'chrome' }],
  head: [{ round: 0.08, s: 0.66, y: 0.82, bezel: 'chrome', depth: 0.05 }, { round: 0.08, s: 0.86, y: 0.82, bezel: 'chrome', depth: 0.05 }],
  rear: [{ s: 1.0, y: [0.5, 0.74], kind: 'grille', tex: 'dots', bars: 'chrome', frame: 'chrome' }],
  tail: [{ s: [0.62, 0.9], y: [0.55, 0.64], tex: 'tred' }],
  bumpF: [{ y: 0.46, h: 0.16, d: 0.1, mat: 'chrome', s: 1.2 }], bumpR: [{ y: 0.44, h: 0.14, d: 0.09, mat: 'chrome', s: 1.15 }],
  plateF: null, plateR: 0.62, badge: 'ELDORADO', badgeY: 0.86, wheel: { style: 'hubcap', rim: 'chrome', whitewall: true, cap: 'chrome' },
  extras: [{ type: 'fin', pts: [[4.0, 0.9], [4.9, 1.0], [5.72, 1.22], [5.74, 1.1], [5.6, 0.93]], z: 0.88, t: 0.05, bullets: [[5.66, 1.12], [5.66, 1.03]] },
    { type: 'cyl', d: -0.02, y: 0.6, z: 0.42, r: 0.06, r2: 0.03, h: 0.14, rz: -Math.PI / 2, mat: 'chrome' }],
};
B.ford_f100_1956 = {
  L: 4.73, W: 1.99, H: 1.84, wb: 2.79, fo: 0.75, R: 0.36, rr: 0.2, tw: 0.2, clr: 0.25, fbump: 0.15, track: 1.6, metal: 0.12,
  tF: 0.45, nF: 3, nR: 30, tR: 0.05, tumble: 0.1, hoodCrown: 0.02, roofCrown: 0.06, crownExp: 2.5, shoulder: 0.98,
  belt: [[0, 0.95], [0.04, 1.02], [0.2, 1.06], [1.3, 1.15], [2.75, 1.18]],
  fender: [[0.0, 0], [0.15, 0.09], [0.6, 0.13], [1.1, 0.1], [1.3, 0]],
  roof: [[1.3, 1.13], [1.4, 1.3], [1.55, 1.7], [1.75, 1.82], [2.5, 1.84], [2.7, 1.8], [2.75, 1.15]],
  ws: [1.38, 1.62], win: [[1.62, 2.55]], chromeSill: true, levels: [0.9, 0.6],
  bed: { cab: 2.75, h: 1.15, tail: 'tround1', tailH: 0.12, tailY: 0.95, plateY: 0.55, bumper: 'chrome' },
  doors: [1.45, 2.6], hoodLine: 1.32, hoodSides: [0.1, 1.3, 0.62], handles: [[2.42, 1.08]], handleMat: 'chrome', mirror: [1.55, 1.25, 1.0, 'chrome'],
  grille: [{ s: 0.55, y: [0.62, 0.9], tex: 'hbar3', bars: 'chrome', frame: 'chrome' }],
  head: [{ round: 0.09, s: 0.74, y: 0.97, bezel: 'chrome', depth: 0.06 }],
  bumpF: [{ y: 0.52, h: 0.14, d: 0.08, mat: 'chrome', s: 1.05 }],
  plateF: 0.52, wheel: { style: 'steel', rim: 0xe8e4d8, whitewall: true },
  extras: [{ type: 'steps', x: [1.4, 2.7], y: 0.5, mat: 'black' }],
};
B.bmw_e30 = {
  L: 4.325, W: 1.645, H: 1.38, wb: 2.57, fo: 0.74, R: 0.3, rr: 0.19, tw: 0.195, clr: 0.14, fbump: 0.12, rbump: 0.14,
  tF: 0.15, nF: 7, tR: 0.15, nR: 7, tumble: 0.25, hoodCrown: 0.025, roofCrown: 0.05, crownExp: 2.5, pillarW: 0.05,
  ...prof({ L: 4.325, H: 1.38, c: 1.3, t: 1.95, r: 2.85, q: 3.55, yb: 0.9, yn: 0.72, yh: 0.76, yd: 0.97, rise: 0.03, nose: 0.06 }),
  win: [[1.42, 2.58], [2.64, 3.25]], bpil: [[2.58, 2.64]], blackPillars: true, levels: [0.78, 0.5], molding: [0.48, 0.54, 0.3, 4.0],
  doors: [1.38, 2.62], hoodLine: 0.04, hoodSides: [0.05, 1.27, 0.9], trunkLine: 3.6, handles: [[2.42, 0.86]], handleMat: 'trim', mirror: [1.45, 0.94, 0.85, 'black'],
  front: [{ s: 0.8, y: [0.55, 0.73], kind: 'grille', tex: 'solid', bars: '#151515', out: 0.003 }, { s: [0.02, 0.15], y: [0.56, 0.72], kind: 'grille', tex: 'vbar', bars: 'black', frame: 'chrome', out: 0.008, poly: [[0, 0.05], [1, 0], [1, 1], [0, 0.95]] }],
  head: [{ s: [0.2, 0.76], y: [0.57, 0.71], tex: 'hround2', out: 0.008 }],
  rear: [{ s: 0.3, y: [0.64, 0.76], kind: 'grille', tex: 'solid', bars: '#1a1a1a' }],
  tail: [{ s: [0.3, 0.78], y: [0.62, 0.78], tex: 'tclassic' }],
  bumpF: [{ y: 0.45, h: 0.1, d: 0.07, mat: 'chrome', s: 0.92 }], bumpR: [{ y: 0.45, h: 0.1, d: 0.07, mat: 'chrome', s: 0.88 }],
  exhaust: [{ z: 0.45, y: 0.25, r: 0.035, both: false }], plateF: 0.45, plateR: 0.62, badge: '325i', wheel: { style: 'mesh', rim: 'silver' },
};
B.datsun_1600 = {
  L: 4.12, W: 1.56, H: 1.41, wb: 2.42, fo: 0.75, R: 0.29, rr: 0.165, tw: 0.165, clr: 0.16, fbump: 0.12, rbump: 0.12, metal: 0.12,
  tF: 0.12, nF: 7, tR: 0.12, nR: 7, tumble: 0.28, hoodCrown: 0.02, roofCrown: 0.05, crownExp: 2.5, pillarW: 0.05,
  ...prof({ L: 4.12, H: 1.41, c: 1.28, t: 1.9, r: 2.7, q: 3.3, yb: 0.88, yn: 0.72, yh: 0.76, yd: 0.93, rise: 0.02, nose: 0.06 }),
  win: [[1.4, 2.3], [2.36, 2.95]], bpil: [[2.3, 2.36]], chromeSill: true, levels: [0.78, 0.5], lines: [[0.1, 4.0, 0.8, 0.006, 'chrome']],
  doors: [1.36, 2.33, 2.95], hoodLine: 1.24, trunkLine: 3.36, handles: [[2.15, 0.84], [2.8, 0.84]], handleMat: 'chrome', mirror: [0.6, 0.8, 0.7, 'chrome'],
  grille: [{ s: 0.72, y: [0.56, 0.74], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }],
  head: [{ round: 0.075, s: 0.6, y: 0.65, bezel: 'chrome', depth: 0.03 }],
  tail: [{ s: [0.35, 0.72], y: [0.6, 0.74], tex: 'tclassic' }],
  bumpF: [{ y: 0.45, h: 0.09, d: 0.06, mat: 'chrome', s: 0.9 }], bumpR: [{ y: 0.45, h: 0.09, d: 0.06, mat: 'chrome', s: 0.85 }],
  plateF: 0.45, plateR: 0.62, badge: 'DATSUN', wheel: { style: 'hubcap', rim: 'chrome', cap: 'chrome' },
};
B.nissan_tsubame = {
  L: 4.25, W: 1.64, H: 1.43, wb: 2.43, fo: 0.82, R: 0.29, rr: 0.165, tw: 0.175, clr: 0.15, fbump: 0.15, rbump: 0.15,
  tF: 0.2, nF: 6, tR: 0.1, nR: 8, tumble: 0.22, hoodCrown: 0.02, roofCrown: 0.04, crownExp: 3,
  ...prof({ L: 4.25, H: 1.43, c: 1.25, t: 1.92, r: 4.1, q: 4.2, yb: 0.9, yn: 0.68, yh: 0.76, rise: 0.03, k: 'box', nose: 0.08 }),
  win: [[1.36, 2.35], [2.43, 3.3], [3.38, 4.05]], bpil: [[2.35, 2.43], [3.3, 3.38]], blackPillars: true, levels: [0.8, 0.5], molding: [0.56, 0.62, 0.3, 4.0],
  doors: [1.32, 2.39, 3.3], hoodLine: 1.2, hoodSides: [0.05, 1.2, 0.85], handles: [[2.15, 0.86], [3.1, 0.87]], mirror: [1.4, 0.95, 0.85, 'black'],
  head: [{ s: [0.32, 0.76], y: [0.58, 0.72], tex: 'hrecta' }],
  grille: [{ s: 0.31, y: [0.58, 0.72], tex: 'hbar2', bars: 'black', frame: 'chrome' }],
  rear: [{ s: 0.62, y: [0.96, 1.36], mat: 'glass', out: 0.01 }],
  tail: [{ s: [0.62, 0.8], y: [0.6, 0.86], tex: 'tclassic' }],
  bumpF: [{ y: 0.45, h: 0.12, d: 0.07, mat: 'plastic', s: 0.95 }], bumpR: [{ y: 0.45, h: 0.12, d: 0.07, mat: 'plastic', s: 0.9 }],
  plateF: 0.46, plateR: 0.72, badge: 'TSUBAME', badgeS: 0.45, badgeY: 0.9, wheel: { style: 'hubcap', rim: 'silver' },
};
B.chevrolet_corvette_c2 = {
  L: 4.45, W: 1.77, H: 1.25, wb: 2.49, fo: 1.0, R: 0.33, rr: 0.19, tw: 0.2, clr: 0.13, fbump: 0.12, rbump: 0.14, metal: 0.2,
  tF: 0.9, nF: 2.4, tR: 0.4, nR: 3.2, tumble: 0.46, shoulder: 0.95, hoodCrown: 0.03, roofCrown: 0.07, pillarW: 0.05,
  belt: [[0, 0.56], [0.05, 0.64], [0.4, 0.7], [1.0, 0.76], [1.65, 0.8], [2.6, 0.82], [3.5, 0.84], [4.3, 0.82], [4.42, 0.76], [4.45, 0.66]],
  fender: [[0.05, 0], [0.35, 0.06], [0.9, 0.08], [1.4, 0.04], [1.65, 0], [3.85, 0], [4.05, 0.05], [4.3, 0.04], [4.45, 0]],
  roof: [[1.6, 0.79], [1.72, 0.9], [1.95, 1.12], [2.25, 1.24], [2.55, 1.25], [2.9, 1.2], [3.3, 1.05], [3.7, 0.9], [3.85, 0.85]],
  ws: [1.64, 2.2], rg: [2.95, 3.75], win: [[1.75, 2.75]], chromeSill: true, levels: [0.66, 0.45], lines: [[0.1, 4.4, 0.66, 0.006, 'paint']],
  doors: [1.72, 2.8], hoodLine: 1.58, hoodSides: [0.3, 1.58, 0.45], trunkLine: 3.9, handles: [[2.62, 0.78]], handleMat: 'chrome', mirror: [1.8, 0.88, 0.8, 'chrome'],
  top: [POPUP(0.25, 0.62, 0.45, 0.7), { x: [0.85, 1.15], z: [0.22, 0.38], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }],
  grille: [{ s: 0.42, y: [0.3, 0.44], tex: 'hbar2', bars: 'chrome', frame: 'chrome', poly: ELL }],
  side: [{ x: [1.32, 1.56], y: [0.5, 0.66], tex: 'hbar2', bars: 'chrome', frame: 'chrome' }],
  tail: [{ s: [0.18, 0.66], y: [0.6, 0.72], tex: 'tround2', poly: rrq(0.45) }],
  bumpF: [{ y: 0.38, h: 0.05, d: 0.04, mat: 'chrome', s: 0.8 }], bumpR: [{ y: 0.42, h: 0.05, d: 0.04, mat: 'chrome', s: 0.75 }],
  exhaust: [{ z: 0.45, y: 0.24, r: 0.035 }], plateF: null, plateR: 0.5, badge: 'STING RAY',
  wheel: { style: 'rally', rim: 'steel', whitewall: true }, extras: [{ type: 'split', x: [2.95, 3.75], r: 0.02, mat: 'paint' }],
};

for (const m of CAR_MODELS) if (B[m.id]) m.b = B[m.id];
export function carInfo(id) { return CAR_MODELS.find(m => m.id === id) ?? null; }
