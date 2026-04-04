const router = require('express').Router();
const { param } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');
const { applyXP, XP_REWARDS } = require('../services/xp');
const { checkAchievements } = require('../services/achievements');

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

        const { rows: [stats] } = await client.query(
          `SELECT money, level, xp, xp_next, items_sold, total_earned FROM user_stats WHERE user_id=$1 FOR UPDATE`,
          [req.user.id]
        );

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
            money       = money + $2,
            items_sold  = items_sold + 1,
            total_earned= total_earned + $2,
            xp=$3, level=$4, xp_next=$5
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
      if (err.status) return res.status(err.status).json({ error: err.message });
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
