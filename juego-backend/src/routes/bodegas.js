const router = require('express').Router();
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');
const { openBodega }  = require('../services/gacha');
const { generateOffersForItem } = require('../services/npc');
const { applyXP, XP_REWARDS, levelRewards } = require('../services/xp');
const { checkAchievements } = require('../services/achievements');
const { checkCategoryCompletions } = require('../services/categoryRewards');
const { leaderboardUpdate } = require('../config/redis');
const BODEGAS = require('../data/bodegas');
const EXCLUSIVE_ITEMS = require('../data/exclusiveItems');

async function processLevelRewards(client, userId, levelsGained, prevLevel) {
  const allRewards   = [];
  let coinsGained    = 0;
  let vouchersGained = 0;
  for (const lvl of levelsGained) {
    const rewards = levelRewards(lvl);
    for (const reward of rewards) {
      allRewards.push({ ...reward, level: lvl });
      if (reward.type === 'coins') {
        coinsGained += reward.amount;
      }
      if (reward.type === 'bodega') {
        vouchersGained++;
        await client.query(`UPDATE user_stats SET bodega_vouchers=bodega_vouchers+1 WHERE user_id=$1`, [userId]);
      }
      if (reward.type === 'item') {
        const cat = EXCLUSIVE_ITEMS[reward.catalogId];
        if (cat) {
          await client.query(
            `INSERT INTO items (user_id,catalog_id,rarity,condition,grade,identified,value,is_exclusive)
             VALUES ($1,$2,$3,'new',10,TRUE,$4,TRUE)
             ON CONFLICT DO NOTHING`,
            [userId, cat.id, cat.rarity, cat.baseValue]
          );
        }
      }
    }
    await client.query(
      `INSERT INTO notifications (user_id,message) VALUES ($1,$2)`,
      [userId, `🎉 ¡Subiste al nivel ${lvl}!`]
    );
  }
  if (coinsGained > 0) {
    await client.query(`UPDATE user_stats SET money=money+$2 WHERE user_id=$1`, [userId, coinsGained]);
  }
  return { rewards: allRewards, coinsGained, vouchersGained };
}

// ── GET /api/bodegas ──────────────────────────────────────
router.get('/', requireAuth, (req, res) => {
  res.json(BODEGAS.map(b => ({
    id:                 b.id,
    name:               b.name,
    cost:               b.cost,
    itemCount:          b.itemCount,
    rarityWeights:      b.rarityWeights,
    conditionWeights:   b.conditionWeights,
    unidentifiedChance: b.unidentifiedChance,
  })));
});

// ── POST /api/bodegas/open ────────────────────────────────
router.post('/open',
  requireAuth,
  body('bodega_id').notEmpty().isIn(BODEGAS.map(b => b.id)),
  validate,
  async (req, res) => {
    const { bodega_id } = req.body;
    const userId = req.user.id;

    try {
      const result = await withTransaction(async (client) => {
        // Leer stats actuales
        const { rows: [stats] } = await client.query(
          `SELECT money, level, xp, xp_next, bodegas_opened FROM user_stats WHERE user_id = $1 FOR UPDATE`,
          [userId]
        );

        const bodega = BODEGAS.find(b => b.id === bodega_id);
        if (stats.money < bodega.cost) throw Object.assign(new Error('Sin fondos'), { status: 402 });
        if (bodega.minLevel && stats.level < bodega.minLevel)
          throw Object.assign(new Error(`Necesitas nivel ${bodega.minLevel} para esta bodega`), { status: 403 });

        // Generar objetos
        const { items } = openBodega(bodega_id);

        // Calcular XP: base por tipo + rareza de cada objeto
        const baseXP   = XP_REWARDS.bodega_base[bodega_id] ?? 8;
        const rarityXP = items.reduce((sum, item) => sum + (XP_REWARDS.item_rarity[item.rarity] ?? 1), 0);
        const gainedXP = baseXP + rarityXP;
        const xpResult = applyXP(+stats.level, +stats.xp, +stats.xp_next, gainedXP);

        // Insertar items en BD
        const insertedItems = [];
        const newCatalogIds = [];
        for (const item of items) {
          const { rows: [inserted] } = await client.query(
            `INSERT INTO items (user_id, catalog_id, rarity, condition, grade, identified, value)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [userId, item.catalog_id, item.rarity, item.condition, item.grade, item.identified, item.value]
          );
          insertedItems.push(inserted);

          // Registrar en colección si está identificado
          if (item.identified) {
            const { rowCount } = await client.query(
              `INSERT INTO collection (user_id, catalog_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
              [userId, item.catalog_id]
            );
            if (rowCount > 0) newCatalogIds.push(item.catalog_id);
          }
        }

        // Transacción económica
        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description)
           VALUES ($1,'bodega_purchase',$2,$3)`,
          [userId, -bodega.cost, `Compra: ${bodega.name}`]
        );

        // Actualizar stats
        await client.query(
          `UPDATE user_stats SET
            money          = money - $2,
            level          = $3,
            xp             = $4,
            xp_next        = $5,
            bodegas_opened = bodegas_opened + 1,
            total_spent    = total_spent + $2
           WHERE user_id = $1`,
          [userId, bodega.cost, xpResult.level, xpResult.xp, xpResult.xpNext]
        );

        // Recompensas por nivel
        const levelRewardsResult = await processLevelRewards(client, userId, xpResult.levelsGained, stats.level);
        if (levelRewardsResult.coinsGained > 0) {
          await client.query(
            `UPDATE user_stats SET
              money = money + $2,
              level_rewards_claimed = $3
             WHERE user_id = $1`,
            [userId, levelRewardsResult.coinsGained, Math.max(stats.level || 0, xpResult.level)]
          );
        }

        // Generar ofertas NPC para cada item identificado
        const allOffers = [];
        for (const item of insertedItems) {
          if (!item.identified) continue;
          const offers = generateOffersForItem(item);
          for (const offer of offers) {
            await client.query(
              `INSERT INTO npc_offers (user_id, npc_id, item_id, price, phrase)
               VALUES ($1,$2,$3,$4,$5)`,
              [userId, offer.npc_id, item.id, offer.price, offer.phrase]
            );
          }
          allOffers.push(...offers.map(o => ({ ...o, item_id: item.id })));
        }

        await checkAchievements(client, userId);

        // Verificar si el usuario completó algún catálogo
        const categoryRewards = await checkCategoryCompletions(client, userId, newCatalogIds);

        return { items: insertedItems, xpResult, levelRewardsResult, bodegaCost: bodega.cost, gainedXP, categoryRewards };
      });

      await leaderboardUpdate(userId, result.xpResult.level);

      res.json({
        items:           result.items,
        levels_up:       result.xpResult.levelsGained,
        new_level:       result.xpResult.level,
        new_xp:          result.xpResult.xp,
        new_xp_next:     result.xpResult.xpNext,
        xp_gained:       result.gainedXP,
        money_spent:     result.bodegaCost,
        levelRewards:    result.levelRewardsResult.rewards,
        categoryRewards: result.categoryRewards,
      });
    } catch (err) {
      if (err.status === 402) return res.status(402).json({ error: 'No tienes suficiente dinero' });
      if (err.status === 403) return res.status(403).json({ error: err.message });
      console.error('open bodega error:', err);
      res.status(500).json({ error: 'Error al abrir la bodega' });
    }
  }
);

module.exports = router;
