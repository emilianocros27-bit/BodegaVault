// ── Servicio de Recompensas por Catálogo Completo ─────────────────────────────
const CATALOG = require('../data/catalog');
const EXCLUSIVE_ITEMS = require('../data/exclusiveItems');

// Mapa: category → array de catalog_ids que cuentan para completar el catálogo
// (excluimos abismo-only y los propios category_reward)
const CATEGORY_REQUIRED = {};
for (const item of CATALOG) {
  if (item.category_reward || item.abismo) continue;
  if (!CATEGORY_REQUIRED[item.category]) CATEGORY_REQUIRED[item.category] = [];
  CATEGORY_REQUIRED[item.category].push(item.id);
}

// Mapa: category → rewardItemId
const CATEGORY_REWARD_ITEM = {};
for (const [key, item] of Object.entries(EXCLUSIVE_ITEMS)) {
  if (item.category_reward) {
    CATEGORY_REWARD_ITEM[item.category] = item.id;
  }
}

/**
 * Verifica si el usuario completó algún catálogo nuevo y otorga la recompensa.
 * Debe llamarse dentro de una transacción de Postgres.
 * @param {Object} client  - Cliente pg de la transacción activa
 * @param {string} userId  - UUID del usuario
 * @param {string[]} newCatalogIds - IDs de catálogo recién añadidos a su colección
 * @returns {Array} Lista de recompensas concedidas { category, item }
 */
async function checkCategoryCompletions(client, userId, newCatalogIds) {
  if (!newCatalogIds || newCatalogIds.length === 0) return [];

  // Categorías afectadas por los nuevos ítems
  const affectedCategories = [...new Set(
    newCatalogIds
      .map(cid => {
        const entry = CATALOG.find(c => c.id === cid);
        return entry ? entry.category : null;
      })
      .filter(Boolean)
  )];

  if (affectedCategories.length === 0) return [];

  // Categorías para las que existe recompensa
  const categoriesWithReward = affectedCategories.filter(cat => CATEGORY_REWARD_ITEM[cat]);
  if (categoriesWithReward.length === 0) return [];

  // Obtener recompensas ya entregadas al usuario
  const { rows: alreadyGranted } = await client.query(
    `SELECT category FROM category_rewards WHERE user_id = $1`,
    [userId]
  );
  const grantedSet = new Set(alreadyGranted.map(r => r.category));

  // Obtener colección actual del usuario
  const { rows: collection } = await client.query(
    `SELECT catalog_id FROM collection WHERE user_id = $1`,
    [userId]
  );
  const collectedSet = new Set(collection.map(r => r.catalog_id));

  const newRewards = [];

  for (const category of categoriesWithReward) {
    if (grantedSet.has(category)) continue; // ya entregada

    const required = CATEGORY_REQUIRED[category] || [];
    if (required.length === 0) continue;

    // Verificar que tiene todos los ítems requeridos
    const hasAll = required.every(id => collectedSet.has(id));
    if (!hasAll) continue;

    // Otorgar recompensa
    const rewardId = CATEGORY_REWARD_ITEM[category];
    const rewardItem = EXCLUSIVE_ITEMS[rewardId];
    if (!rewardItem) continue;

    // Insertar ítem exclusivo en el inventario
    await client.query(
      `INSERT INTO items (user_id, catalog_id, rarity, condition, grade, identified, value, is_exclusive)
       VALUES ($1, $2, $3, 'new', 10, TRUE, $4, TRUE)
       ON CONFLICT DO NOTHING`,
      [userId, rewardItem.id, rewardItem.rarity, rewardItem.baseValue]
    );

    // Registrar en colección
    await client.query(
      `INSERT INTO collection (user_id, catalog_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, rewardItem.id]
    );

    // Marcar como entregada
    await client.query(
      `INSERT INTO category_rewards (user_id, category) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, category]
    );

    // Notificación
    await client.query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
      [userId, `🏆 ¡Completaste el catálogo de ${category}! Recibiste: ${rewardItem.name}`]
    );

    newRewards.push({ category, item: rewardItem });
  }

  return newRewards;
}

module.exports = { checkCategoryCompletions, CATEGORY_REQUIRED, CATEGORY_REWARD_ITEM };
