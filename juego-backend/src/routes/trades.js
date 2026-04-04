const router = require('express').Router();
const { param } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');
const { generateTradeForUser } = require('../services/npc');
const { calcItemValue } = require('../services/gacha');
const { applyXP, XP_REWARDS } = require('../services/xp');
const CATALOG = require('../data/catalog');

// ── GET /api/trades ── Listar tratos pendientes ───────────
router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM npc_trades
     WHERE user_id=$1 AND status='pending' AND expires_at > NOW()
     ORDER BY created_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// ── POST /api/trades/generate ─────────────────────────────
router.post('/generate', requireAuth, async (req, res) => {
  try {
    // No generar si ya tiene 3 activos
    const { rows: existing } = await query(
      `SELECT COUNT(*) FROM npc_trades WHERE user_id=$1 AND status='pending' AND expires_at > NOW()`,
      [req.user.id]
    );
    if (parseInt(existing[0].count) >= 3) {
      return res.json({ message: 'Ya tienes el máximo de tratos activos', generated: false });
    }

    // Obtener items del usuario
    const { rows: userItems } = await query(
      `SELECT * FROM items WHERE user_id=$1 AND identified=TRUE AND for_sale=FALSE`,
      [req.user.id]
    );
    if (userItems.length < 2) {
      return res.json({ message: 'Necesitas al menos 2 objetos identificados', generated: false });
    }

    const trade = generateTradeForUser(userItems);
    if (!trade) return res.json({ message: 'Sin tratos disponibles ahora', generated: false });

    const { rows: [inserted] } = await query(
      `INSERT INTO npc_trades (user_id, npc_id, want_items, give_catalog, give_rarity, phrase)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, trade.npc_id, trade.want_items, trade.give_catalog, trade.give_rarity, trade.phrase]
    );

    res.json({ trade: inserted, generated: true });
  } catch (err) {
    console.error('generate trade error:', err);
    res.status(500).json({ error: 'Error al generar trato' });
  }
});

// ── POST /api/trades/:id/accept ───────────────────────────
router.post('/:id/accept',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await withTransaction(async (client) => {
        const { rows: [trade] } = await client.query(
          `SELECT * FROM npc_trades WHERE id=$1 AND user_id=$2 AND status='pending' AND expires_at > NOW() FOR UPDATE`,
          [req.params.id, req.user.id]
        );
        if (!trade) throw Object.assign(new Error('Trato no encontrado o expirado'), { status:404 });

        // Verificar que el usuario tiene todos los items
        const wantIds = trade.want_items;
        const { rows: ownedItems } = await client.query(
          `SELECT id FROM items WHERE id = ANY($1) AND user_id=$2`,
          [wantIds, req.user.id]
        );
        if (ownedItems.length !== wantIds.length)
          throw Object.assign(new Error('Ya no tienes todos los objetos requeridos'), { status:400 });

        // Eliminar items entregados
        await client.query(
          `DELETE FROM items WHERE id = ANY($1) AND user_id=$2`,
          [wantIds, req.user.id]
        );

        // Crear item recibido
        const giveCat   = CATALOG.find(c => c.id === trade.give_catalog);
        const condition = 'used';
        const grade     = 6 + Math.floor(Math.random() * 4);
        const value     = calcItemValue(giveCat, condition, grade);

        const { rows: [newItem] } = await client.query(
          `INSERT INTO items (user_id,catalog_id,rarity,condition,grade,identified,value)
           VALUES ($1,$2,$3,$4,$5,TRUE,$6) RETURNING *`,
          [req.user.id, giveCat.id, trade.give_rarity, condition, grade, value]
        );
        await client.query(
          `INSERT INTO collection (user_id,catalog_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
          [req.user.id, giveCat.id]
        );

        // XP y stats
        const { rows: [stats] } = await client.query(
          `SELECT level, xp, xp_next FROM user_stats WHERE user_id=$1 FOR UPDATE`,
          [req.user.id]
        );
        const xpR = applyXP(+stats.level, +stats.xp, +stats.xp_next, XP_REWARDS.accept_trade);
        await client.query(
          `UPDATE user_stats SET trades_done=trades_done+1, xp=$2,level=$3,xp_next=$4 WHERE user_id=$1`,
          [req.user.id, xpR.xp, xpR.level, xpR.xpNext]
        );
        await client.query(`UPDATE npc_trades SET status='accepted' WHERE id=$1`, [trade.id]);

        return { newItem, xpResult: xpR };
      });

      res.json({ message: 'Trato completado', ...result });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('accept trade error:', err);
      res.status(500).json({ error: 'Error al aceptar el trato' });
    }
  }
);

// ── POST /api/trades/:id/reject ───────────────────────────
router.post('/:id/reject',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    const { rows } = await query(
      `UPDATE npc_trades SET status='rejected' WHERE id=$1 AND user_id=$2 AND status='pending' RETURNING id`,
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Trato no encontrado' });
    res.json({ message: 'Trato rechazado' });
  }
);

module.exports = router;
