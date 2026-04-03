// Objetos exclusivos otorgados como recompensas de nivel
// Solo se obtienen por esta vía, nunca aparecen en bodegas
const EXCLUSIVE_ITEMS = {
  exclusive_compass: {
    id:        'exclusive_compass',
    name:      'Brújula Náutica de Capitán',
    emoji:     '🧭',
    rarity:    'rare',
    category:  'rarities',
    baseValue: 600,
    desc:      'Brújula exclusiva otorgada a los navegantes de nivel 6. Solo existe una por jugador.',
  },
  exclusive_lamp: {
    id:        'exclusive_lamp',
    name:      'Lámpara de Araña Imperial',
    emoji:     '🏮',
    rarity:    'epic',
    category:  'art',
    baseValue: 1400,
    desc:      'Lámpara de época otorgada a veteranos de nivel 9. Pieza única de colección.',
  },
  exclusive_armor: {
    id:        'exclusive_armor',
    name:      'Armadura Medieval',
    emoji:     '🛡️',
    rarity:    'legendary',
    category:  'rarities',
    baseValue: 4500,
    desc:      'Armadura completa forjada a mano, recompensa de los maestros nivel 15.',
  },
  exclusive_crown: {
    id:        'exclusive_crown',
    name:      'Corona Imperial',
    emoji:     '👑',
    rarity:    'unique',
    category:  'rarities',
    baseValue: 25000,
    desc:      'La Corona Imperial. Solo los más grandes coleccionistas (nivel 20) la poseen.',
  },
};

module.exports = EXCLUSIVE_ITEMS;
