// ── Servicio Gacha: lógica de bodegas ─────────────────────

const CATALOG = require('../data/catalog');
const BODEGAS = require('../data/bodegas');

const CONDITION_ORDER = ['new', 'used', 'damaged', 'very_damaged'];

const CONDITIONS_MULT = {
  new:          1.5,
  used:         1.0,
  damaged:      0.6,
  very_damaged: 0.3,
};

function weightedRandom(weights) {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const [k, v] of Object.entries(weights)) {
    r -= v;
    if (r <= 0) return k;
  }
  return Object.keys(weights)[0];
}

function calcItemValue(catalogItem, condition, grade) {
  const condMult  = CONDITIONS_MULT[condition] ?? 1;
  const gradeMult = 0.5 + (grade / 10) * 1.0;
  return Math.round(catalogItem.baseValue * condMult * gradeMult);
}

function generateItem(bodega) {
  const weights   = bodega.abismoOnly ? bodega.abismoWeights : bodega.rarityWeights;
  const rarity    = weightedRandom(weights);
  const condition = weightedRandom(bodega.conditionWeights);
  const identified = Math.random() > bodega.unidentifiedChance;
  const grade     = Math.floor(Math.random() * 10) + 1;

  // Pool: Caja del Abismo
  // - legendary/unique/exotic → items exclusivos del abismo
  // - epic → catálogo general (sin exclusivos), precios normales
  let pool;
  if (bodega.abismoOnly) {
    const abismoRarities = ['legendary', 'unique', 'exotic'];
    if (abismoRarities.includes(rarity)) {
      pool = CATALOG.filter(c => c.abismo && c.rarity === rarity);
      if (!pool.length) pool = CATALOG.filter(c => c.abismo);
    } else {
      // epic usa catálogo general sin exclusivos
      pool = CATALOG.filter(c => c.rarity === rarity && !c.abismo && !c.exclusive);
      if (!pool.length) pool = CATALOG.filter(c => !c.abismo && !c.exclusive);
    }
  } else {
    // Bóveda del Magnate excluye items exclusivos de abismo
    pool = CATALOG.filter(c => c.rarity === rarity && !c.abismo);
    if (!pool.length) pool = CATALOG.filter(c => !c.abismo);
  }

  const cat = pool[Math.floor(Math.random() * pool.length)];

  return {
    catalog_id:  cat.id,
    rarity,
    condition,
    grade,
    identified: bodega.abismoOnly ? true : identified,
    value: calcItemValue(cat, condition, grade),
  };
}

function openBodega(bodegaId) {
  const bodega = BODEGAS.find(b => b.id === bodegaId);
  if (!bodega) throw new Error(`Bodega no encontrada: ${bodegaId}`);

  const count = bodega.itemCount.min +
    Math.floor(Math.random() * (bodega.itemCount.max - bodega.itemCount.min + 1));

  const items = Array.from({ length: count }, () => generateItem(bodega));
  return { bodega, items };
}

// ── Reparación ────────────────────────────────────────────
const REPAIR_SUCCESS = {
  new:          0,
  used:         0.85,
  damaged:      0.70,
  very_damaged: 0.55,
};

const RARITY_REPAIR_MULT = {
  common:    1,
  rare:      2,
  epic:      4,
  legendary: 8,
  unique:    20,
  exotic:    60,
};

const CONDITION_REPAIR_COST = {
  new:          0,
  used:         30,
  damaged:      80,
  very_damaged: 150,
};

function calcRepairCost(condition, rarity) {
  return Math.round((CONDITION_REPAIR_COST[condition] ?? 80) * (RARITY_REPAIR_MULT[rarity] ?? 1));
}

function attemptRepair(condition, rarity) {
  if (condition === 'new') return { success: false, newCondition: condition, critical: false };

  const roll    = Math.random();
  const chance  = REPAIR_SUCCESS[condition] ?? 0.5;
  const idx     = CONDITION_ORDER.indexOf(condition);

  if (roll < chance * 0.1) {
    // Crítico: mejora 2 niveles
    return { success: true, critical: true,  newCondition: CONDITION_ORDER[Math.max(0, idx - 2)] };
  } else if (roll < chance) {
    // Normal: mejora 1 nivel
    return { success: true, critical: false, newCondition: CONDITION_ORDER[Math.max(0, idx - 1)] };
  } else if (roll > 0.95) {
    // Fallo crítico: empeora
    return { success: false, fail: true,     newCondition: CONDITION_ORDER[Math.min(CONDITION_ORDER.length - 1, idx + 1)] };
  } else {
    // Fallo normal: sin cambio
    return { success: false, fail: false,    newCondition: condition };
  }
}

module.exports = { openBodega, calcItemValue, calcRepairCost, attemptRepair, CATALOG, BODEGAS };
