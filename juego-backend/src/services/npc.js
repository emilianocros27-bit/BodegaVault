// ── Servicio NPC: lógica de ofertas e intercambios ────────

const NPCS = require('../data/npcs');
const CATALOG = require('../data/catalog');

function npcOfferPrice(npcId, catalogId, condition, grade, rarity, itemValue) {
  const npc  = NPCS.find(n => n.id === npcId);
  if (!npc) return 0;

  const cat  = CATALOG.find(c => c.id === catalogId);
  if (!cat) return 0;

  // Usar item.value directamente (ya incluye condición y grade)
  // Solo aplicar multiplicadores propios del NPC
  let price = itemValue;
  price *= (npc.categoryMultipliers[cat.category] ?? 1.0);
  if (npc.gradeBonusThreshold && grade >= npc.gradeBonusThreshold) price *= 1.3;

  // Variación aleatoria ±10%
  price = Math.round(price * (0.9 + Math.random() * 0.2));
  return Math.max(1, price);
}

function generateOffersForItem(item) {
  const offers = [];
  NPCS.forEach(npc => {
    const chance = 0.55 + (npc.tradeFrequency / 5) * 0.1;
    if (Math.random() > chance) return;

    const price = npcOfferPrice(npc.id, item.catalog_id, item.condition, item.grade, item.rarity, item.value);
    const phrase = npc.buyPhrases[Math.floor(Math.random() * npc.buyPhrases.length)];
    offers.push({ npc_id: npc.id, price, phrase });
  });
  return offers;
}

function generateTradeForUser(userItems) {
  // Elegir NPC aleatorio
  const npc = NPCS[Math.floor(Math.random() * NPCS.length)];
  const prefs = npc.preferredCategories.length ? npc.preferredCategories : ['videogames','electronics','machines','rarities','art','music'];

  const matching = userItems.filter(i => {
    const cat = CATALOG.find(c => c.id === i.catalog_id);
    return cat && prefs.includes(cat.category) && i.identified;
  });
  if (matching.length < 2) return null;

  const wantCount = 2 + Math.floor(Math.random() * 2);
  const want = matching.slice(0, wantCount);

  const RARITY_ORDER = ['common','rare','epic','legendary','unique'];
  const maxRIdx = want.reduce((max, item) => Math.max(max, RARITY_ORDER.indexOf(item.rarity)), 0);
  const giveRarity = RARITY_ORDER[Math.min(RARITY_ORDER.length - 1, maxRIdx + (Math.random() > 0.5 ? 1 : 0))];

  const givePool = CATALOG.filter(c => c.rarity === giveRarity);
  if (!givePool.length) return null;
  const giveCat = givePool[Math.floor(Math.random() * givePool.length)];

  return {
    npc_id:      npc.id,
    npc:         npc,
    want_items:  want.map(i => i.id),
    give_catalog: giveCat.id,
    give_rarity:  giveRarity,
    phrase:      `"¿Me das esos ${want.length} objetos? Tengo algo especial para ti."`,
  };
}

module.exports = { generateOffersForItem, generateTradeForUser, npcOfferPrice, NPCS };
