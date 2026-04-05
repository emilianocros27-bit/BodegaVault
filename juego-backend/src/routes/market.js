const router = require('express').Router();
const { param } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');
const { applyXP, XP_REWARDS } = require('../services/xp');
const { checkAchievements } = require('../services/achievements');
const CATALOG = require('../data/catalog');
const CATEGORY_REWARD_IDS = new Set(CATALOG.filter(c => c.category_reward).map(c => c.id));

// ── GET /api/market/offers ─ Todas las ofertas pendientes ─
router.get('/offers', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT o.*, i.catalog_id, i.rarity, i.condition, i.grade, i.value
     FROM npc_offers o JOIN items i ON i.id = o.item_id
     WHERE o.user_id=$1 AND o.status='pending' AND o.expires_at > NOW()
     ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// ── POST /api/market/offers/:id/accept ───────────────────
router.post('/offers/:id/accept',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const txResult = await withTransaction(async (client) => {
        const { rows: [offer] } = await client.query(
          `SELECT o.*, i.user_id as item_owner
           FROM npc_offers o JOIN items i ON i.id = o.item_id
           WHERE o.id=$1 AND o.user_id=$2 AND o.status='pending' AND o.expires_at > NOW()
           FOR UPDATE`,
          [req.params.id, req.user.id]
        );
        if (!offer) throw Object.assign(new Error('Oferta no encontrada o expirada'), { status:404 });

        // Verificar que el ítem no es una recompensa de catálogo (no se puede vender)
        const { rows: [itemRow] } = await client.query(
          `SELECT catalog_id FROM items WHERE id=$1`, [offer.item_id]
        );
        if (itemRow && CATEGORY_REWARD_IDS.has(itemRow.catalog_id))
          throw Object.assign(new Error('Este objeto es una recompensa exclusiva de catálogo y no se puede vender.'), { status:403 });

        const { rows: [stats] } = await client.query(
          `SELECT money, level, xp, xp_next, items_sold, total_earned,
                  daily_sales, daily_sales_date FROM user_stats WHERE user_id=$1 FOR UPDATE`,
          [req.user.id]
        );

        // Verificar límite diario de ventas
        const today = new Date().toISOString().slice(0, 10);
        const isNewDay = !stats.daily_sales_date || stats.daily_sales_date.toISOString?.().slice(0,10) !== today
                        && String(stats.daily_sales_date).slice(0,10) !== today;
        const salesCount = isNewDay ? 0 : (stats.daily_sales || 0);
        if (salesCount >= 12) throw Object.assign(new Error('Límite de 12 ventas diarias alcanzado. Vuelve mañana.'), { status: 429 });

        // Marcar oferta como aceptada y las demás del mismo item como expiradas
        await client.query(`UPDATE npc_offers SET status='accepted' WHERE id=$1`, [offer.id]);
        await client.query(
          `UPDATE npc_offers SET status='expired' WHERE item_id=$1 AND id!=$2 AND status='pending'`,
          [offer.item_id, offer.id]
        );

        // Eliminar item del inventario
        await client.query(`DELETE FROM items WHERE id=$1 AND user_id=$2`, [offer.item_id, req.user.id]);

        // Pagar al jugador
        const xpR = applyXP(+stats.level, +stats.xp, +stats.xp_next, XP_REWARDS.sell_item);
        await client.query(
          `UPDATE user_stats SET
            money            = money + $2,
            items_sold       = items_sold + 1,
            total_earned     = total_earned + $2,
            xp=$3, level=$4, xp_next=$5,
            daily_sales      = CASE WHEN daily_sales_date = CURRENT_DATE THEN daily_sales + 1 ELSE 1 END,
            daily_sales_date = CURRENT_DATE
           WHERE user_id=$1`,
          [req.user.id, offer.price, xpR.xp, xpR.level, xpR.xpNext]
        );
        await client.query(
          `INSERT INTO transactions (user_id,type,amount,npc_id,description)
           VALUES ($1,'item_sold',$2,$3,$4)`,
          [req.user.id, offer.price, offer.npc_id, `Venta a ${offer.npc_id}`]
        );

        await checkAchievements(client, req.user.id);
        return { price: offer.price, xpResult: xpR, xp_gained: XP_REWARDS.sell_item };
      });

      res.json({ message: 'Venta completada', ...txResult });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message, remaining: 0 });
      console.error('accept offer error:', err);
      res.status(500).json({ error: 'Error al aceptar la oferta' });
    }
  }
);

// ── POST /api/market/offers/:id/reject ───────────────────
router.post('/offers/:id/reject',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    const { rows } = await query(
      `UPDATE npc_offers SET status='rejected' WHERE id=$1 AND user_id=$2 AND status='pending' RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Oferta no encontrada' });
    res.json({ message: 'Oferta rechazada' });
  }
);

module.exports = router;
