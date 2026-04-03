const router = require('express').Router();
const { param, body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');
const { calcItemValue, calcRepairCost, attemptRepair } = require('../services/gacha');
const { applyXP, XP_REWARDS } = require('../services/xp');
const { checkAchievements } = require('../services/achievements');
const { generateOffersForItem } = require('../services/npc');
const CATALOG = require('../data/catalog');

// ── GET /api/items — Inventario del jugador ───────────────
router.get('/', requireAuth, async (req, res) => {
  const { category, rarity, for_sale, unidentified, limit = 50, offset = 0 } = req.query;
  const safeLimit = Math.min(parseInt(limit) || 50, 1000);
  let where = ['i.user_id = $1'];
  const params = [req.user.id];
  let p = 2;

  if (category)     { where.push(`c.category = $${p++}`); params.push(category); }
  if (rarity)       { where.push(`i.rarity = $${p++}`);   params.push(rarity); }
  if (for_sale === 'true')  where.push('i.for_sale = TRUE');
  if (unidentified === 'true') where.push('i.identified = FALSE');

  const { rows } = await query(
    `SELECT i.*, c.name as catalog_name, c.category, c.base_value
     FROM items i
     LEFT JOIN LATERAL (
       SELECT name, category, ${CATALOG.length} as base_value
       FROM (VALUES ${CATALOG.map(c=>`('${c.id}','${c.name}','${c.category}',${c.baseValue})`).join(',')})
            AS t(id,name,category,base_value)
       WHERE t.id = i.catalog_id
     ) c ON TRUE
     WHERE ${where.join(' AND ')}
     ORDER BY i.acquired_at DESC
     LIMIT $${p++} OFFSET $${p}`,
    [...params, safeLimit, parseInt(offset)]
  );
  res.json(rows);
});

// ── GET /api/items/:id ────────────────────────────────────
router.get('/:id', requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    const { rows } = await query(
      `SELECT * FROM items WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Objeto no encontrado' });
    res.json(rows[0]);
  }
);

// ── POST /api/items/:id/evaluate ─────────────────────────
router.post('/:id/evaluate',
  requireAuth,
  param('id').isUUID(),
  body('type').isIn(['quick','professional']),
  validate,
  async (req, res) => {
    const { type } = req.body;
    const isPro    = type === 'professional';
    const cost     = isPro ? 50 : 0;

    try {
      const result = await withTransaction(async (client) => {
        const { rows: [item] } = await client.query(
          `SELECT * FROM items WHERE id = $1 AND user_id = $2 FOR UPDATE`,
          [req.params.id, req.user.id]
        );
        if (!item) throw Object.assign(new Error('No encontrado'), { status:404 });
        if (item.identified) throw Object.assign(new Error('Ya identificado'), { status:400 });

        const { rows: [stats] } = await client.query(
          `SELECT money, level, xp, xp_next FROM user_stats WHERE user_id = $1 FOR UPDATE`,
          [req.user.id]
        );
        if (cost > 0 && stats.money < cost) throw Object.assign(new Error('Sin fondos'), { status:402 });

        let newGrade = item.grade;
        if (isPro) newGrade = Math.min(10, item.grade + Math.floor(Math.random() * 2));

        const cat   = CATALOG.find(c => c.id === item.catalog_id);
        const value = calcItemValue(cat, item.condition, newGrade);

        await client.query(
          `UPDATE items SET identified=TRUE, grade=$2, value=$3 WHERE id=$1`,
          [item.id, newGrade, value]
        );
        await client.query(
          `INSERT INTO collection (user_id,catalog_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [req.user.id, item.catalog_id]
        );

        const moneyDelta = -cost;

        if (cost > 0) {
          await client.query(
            `UPDATE user_stats SET money=money+$2 WHERE user_id=$1`,
            [req.user.id, moneyDelta]
          );
          await client.query(
            `INSERT INTO transactions (user_id,type,amount,item_id) VALUES ($1,'evaluate',$2,$3)`,
            [req.user.id, moneyDelta, item.id]
          );
        }

        await checkAchievements(client, req.user.id);
        return { item: { ...item, identified:true, grade:newGrade, value }, xp_gained: 0 };
      });

      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('evaluate error:', err);
      res.status(500).json({ error: 'Error al evaluar' });
    }
  }
);

// ── POST /api/items/evaluate-all ─────────────────────────
router.post('/evaluate-all', requireAuth, async (req, res) => {
  try {
    const result = await withTransaction(async (client) => {
      // Traer todos los no identificados del usuario
      const { rows: unidItems } = await client.query(
        `SELECT i.*, c.base_value FROM items i
         LEFT JOIN LATERAL (SELECT NULL AS base_value) c ON TRUE
         WHERE i.user_id = $1 AND i.identified = FALSE
         FOR UPDATE`,
        [req.user.id]
      );

      if (!unidItems.length) throw Object.assign(new Error('No tienes objetos sin identificar'), { status: 400 });

      const updatedItems = [];

      for (const item of unidItems) {
        const cat   = CATALOG.find(c => c.id === item.catalog_id);
        if (!cat) continue;
        const value = calcItemValue(cat, item.condition, item.grade);

        await client.query(
          `UPDATE items SET identified=TRUE, value=$2 WHERE id=$1`,
          [item.id, value]
        );
        await client.query(
          `INSERT INTO collection (user_id, catalog_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [req.user.id, item.catalog_id]
        );

        updatedItems.push({ id: item.id, catalog_id: item.catalog_id, rarity: item.rarity,
          condition: item.condition, grade: item.grade, identified: true, value });
      }

      // Generar ofertas NPC para los items recién identificados
      for (const item of updatedItems) {
        const offers = generateOffersForItem(item);
        for (const offer of offers) {
          await client.query(
            `INSERT INTO npc_offers (user_id, npc_id, item_id, price, phrase)
             VALUES ($1,$2,$3,$4,$5)`,
            [req.user.id, offer.npc_id, item.id, offer.price, offer.phrase]
          );
        }
      }

      await checkAchievements(client, req.user.id);
      return { count: updatedItems.length, items: updatedItems, xp_gained: 0 };
    });

    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('evaluate-all error:', err);
    res.status(500).json({ error: 'Error al evaluar objetos' });
  }
});

// ── POST /api/items/:id/repair ────────────────────────────
router.post('/:id/repair',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await withTransaction(async (client) => {
        const { rows: [item] } = await client.query(
          `SELECT * FROM items WHERE id=$1 AND user_id=$2 FOR UPDATE`,
          [req.params.id, req.user.id]
        );
        if (!item) throw Object.assign(new Error('No encontrado'), { status:404 });
        if (!item.identified) throw Object.assign(new Error('Primero identifícalo'), { status:400 });
        if (item.condition === 'new') throw Object.assign(new Error('Ya está en perfecto estado'), { status:400 });

        const cost = calcRepairCost(item.condition, item.rarity);
        const { rows: [stats] } = await client.query(
          `SELECT money, level, xp, xp_next FROM user_stats WHERE user_id=$1 FOR UPDATE`,
          [req.user.id]
        );
        if (stats.money < cost) throw Object.assign(new Error('Sin fondos'), { status:402 });

        const repairResult = attemptRepair(item.condition, item.rarity);
        const cat   = CATALOG.find(c => c.id === item.catalog_id);
        const newGrade = repairResult.success && repairResult.critical
          ? Math.min(10, item.grade + 1) : item.grade;
        const newValue = calcItemValue(cat, repairResult.newCondition, newGrade);

        await client.query(
          `UPDATE items SET condition=$2, grade=$3, value=$4 WHERE id=$1`,
          [item.id, repairResult.newCondition, newGrade, newValue]
        );
        await client.query(
          `UPDATE user_stats SET money=money-$2, items_repaired=items_repaired+1 WHERE user_id=$1`,
          [req.user.id, cost]
        );
        await client.query(
          `INSERT INTO transactions (user_id,type,amount,item_id,description) VALUES ($1,'repair',$2,$3,$4)`,
          [req.user.id, -cost, item.id, `Reparación: ${repairResult.success?'Éxito':'Fallo'}`]
        );

        let repairXpR = null;
        if (repairResult.success) {
          repairXpR = applyXP(stats.level, stats.xp, stats.xp_next, XP_REWARDS.repair_success);
          await client.query(
            `UPDATE user_stats SET xp=$2,level=$3,xp_next=$4 WHERE user_id=$1`,
            [req.user.id, repairXpR.xp, repairXpR.level, repairXpR.xpNext]
          );
        }

        return {
          repair: repairResult, newCondition: repairResult.newCondition, newValue, cost,
          xpResult: repairXpR,
          xp_gained: repairResult.success ? XP_REWARDS.repair_success : 0,
        };
      });

      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('repair error:', err);
      res.status(500).json({ error: 'Error al reparar' });
    }
  }
);

// ── PATCH /api/items/:id/sale ─────────────────────────────
router.patch('/:id/sale',
  requireAuth,
  param('id').isUUID(),
  body('for_sale').isBoolean(),
  validate,
  async (req, res) => {
    const { for_sale } = req.body;
    try {
      const result = await withTransaction(async (client) => {
        const { rows: [item] } = await client.query(
          `UPDATE items SET for_sale=$2 WHERE id=$1 AND user_id=$3 AND in_auction=FALSE RETURNING *`,
          [req.params.id, for_sale, req.user.id]
        );
        if (!item) throw Object.assign(new Error('No encontrado o en subasta activa'), { status:404 });

        // Expirar todas las ofertas previas pendientes del item
        await client.query(
          `UPDATE npc_offers SET status='expired'
           WHERE item_id=$1 AND status='pending'`,
          [item.id]
        );

        // Si se pone en venta: generar ofertas NPC frescas
        if (for_sale) {
          const offers = generateOffersForItem(item);
          for (const offer of offers) {
            await client.query(
              `INSERT INTO npc_offers (user_id, npc_id, item_id, price, phrase)
               VALUES ($1,$2,$3,$4,$5)`,
              [req.user.id, offer.npc_id, item.id, offer.price, offer.phrase]
            );
          }
        }

        return item;
      });

      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('sale update error:', err);
      res.status(500).json({ error: 'Error al actualizar estado de venta' });
    }
  }
);

module.exports = router;
