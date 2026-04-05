// ── Servicio XP / Niveles ────────────────────────────────

function xpForLevel(level) {
  return Math.floor(100 * Math.pow(1.30, level - 1)) + 150;
}

// Mapa de recompensas reales por nivel
const COIN_REWARDS    = { 2:150, 4:300, 6:500, 7:300, 8:800, 10:1500, 12:1000, 15:2000, 20:5000 };
const BODEGA_REWARDS  = {
  3:  ['basica'],
  5:  ['estandar'],
  7:  ['estandar'],
  9:  ['premium'],
  10: ['premium','premium'],
  12: ['premium'],
  15: ['rara','rara'],
  20: ['misteriosa'],
};
const ITEM_REWARDS      = { 6:'exclusive_compass', 9:'exclusive_lamp', 15:'exclusive_armor', 20:'exclusive_crown' };
const SHOWCASE_SLOTS    = { 5:1, 10:2, 15:2, 20:2 };

function levelRewards(level) {
  const rewards = [];
  if (COIN_REWARDS[level])   rewards.push({ type:'coins',          amount: COIN_REWARDS[level] });
  if (BODEGA_REWARDS[level]) BODEGA_REWARDS[level].forEach(id => rewards.push({ type:'bodega', id }));
  if (ITEM_REWARDS[level])   rewards.push({ type:'item',           catalogId: ITEM_REWARDS[level] });
  if (SHOWCASE_SLOTS[level]) rewards.push({ type:'showcase_slots', count: SHOWCASE_SLOTS[level] });
  // Cada 5 niveles a partir del 25
  if (level >= 25 && level % 5 === 0) {
    rewards.push({ type:'coins',  amount: 3000 });
    rewards.push({ type:'bodega', id: 'misteriosa' });
  }
  return rewards;
}

// Aplica XP y devuelve niveles subidos + recompensas totales
function applyXP(currentLevel, currentXP, currentXPNext, gainedXP) {
  // Sanear entradas corruptas antes de operar
  let level  = (Number.isFinite(currentLevel)  && currentLevel  > 0)  ? Math.min(currentLevel,  9999)  : 1;
  let xp     = (Number.isFinite(currentXP)     && currentXP     >= 0) ? Math.min(currentXP,     1e12)  : 0;
  let xpNext = (Number.isFinite(currentXPNext) && currentXPNext > 0)  ? Math.min(currentXPNext, 1e12)  : xpForLevel(level);
  xp += (Number.isFinite(gainedXP) ? gainedXP : 0);
  const levelsGained  = [];
  const allRewards    = [];

  while (xp >= xpNext) {
    xp    -= xpNext;
    level += 1;
    xpNext = xpForLevel(level);
    levelsGained.push(level);
    allRewards.push(...levelRewards(level));
  }

  return { level, xp, xpNext, levelsGained, rewards: allRewards };
}

// XP por acción
const XP_REWARDS = {
  // Bodegas: XP base por tipo
  bodega_base: {
    basica:     5,
    estandar:  12,
    premium:   22,
    rara:      40,
    misteriosa:70,
    magnate:  150,
    abismo:   300,
  },
  // XP adicional por rareza de cada objeto encontrado
  item_rarity: {
    common:    1,
    rare:      4,
    epic:     12,
    legendary:30,
    unique:   80,
    exotic:  250,
  },
  // Otras acciones
  quick_evaluate:         3,
  pro_evaluate:           8,
  repair_success:         4,
  sell_item:              6,
  accept_trade:          10,
  bj_win:                 3,
  bj_win_streak_bonus:    1,
  daily_claim:           12,
  roulette_spin:          3,
  auction_sell:           8,
};

module.exports = { xpForLevel, levelRewards, applyXP, XP_REWARDS };
