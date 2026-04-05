const router  = require('express').Router();
const { body, param } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');
const { applyXP, XP_REWARDS } = require('../services/xp');
const { checkAchievements } = require('../services/achievements');
const { leaderboardUpdate } = require('../config/redis');
const CATALOG = require('../data/catalog');
const CATEGORY_REWARD_IDS = new Set(CATALOG.filter(c => c.category_reward || c.exclusive).map(c => c.id));

// Helper: verificar que items pertenecen al usuario y son intercambiables
async function validateUserItems(client, userId, itemIds) {
  if (!itemIds || itemIds.length === 0 || itemIds.length > 3)
    throw Object.assign(new Error('Debes ofrecer entre 1 y 3 objetos'), { status: 400 });
  const { rows } = await client.query(
    `SELECT id, catalog_id, identified, for_sale, in_auction FROM items
     WHERE id = ANY($1) AND user_id = $2`,
    [itemIds, userId]
  );
  if (rows.length !== itemIds.length)
    throw Object.assign(new Error('Uno o más objetos no existen en tu inventario'), { status: 400 });
  for (const item of rows) {
    if (!item.identified)  throw Object.assign(new Error('Todos los objetos deben estar identificados'), { status: 400 });
    if (item.for_sale)     throw Object.assign(new Error('Retira los objetos de venta antes de intercambiarlos'), { status: 400 });
    if (item.in_auction)   throw Object.assign(new Error('No puedes intercambiar objetos en subasta'), { status: 400 });
    if (CATEGORY_REWARD_IDS.has(item.catalog_id))
      throw Object.assign(new Error('Los objetos exclusivos no se pueden intercambiar'), { status: 400 });
  }
  return rows;
}

// ── GET /api/trades ── Listar intercambios abiertos (mercado global) ──
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT pt.*,
              u.username AS creator_name, u.avatar AS creator_avatar,
              COALESCE(
                json_agg(
                  json_build_object('id',i.id,'catalog_id',i.catalog_id,'rarity',i.rarity,
                                    'condition',i.condition,'grade',i.grade,'value',i.value)
                ) FILTER (WHERE i.id IS NOT NULL), '[]'
              ) AS offer_item_details
       FROM player_trades pt
       JOIN users u ON u.id = pt.creator_id
       LEFT JOIN items i ON i.id = ANY(pt.offer_items)
       WHERE pt.status = 'open' AND pt.expires_at > NOW()
         AND pt.creator_id != $1
       GROUP BY pt.id, u.username, u.avatar
       ORDER BY pt.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('list trades error:', err);
    res.status(500).json({ error: 'Error al cargar intercambios' });
  }
});

// ── GET /api/trades/mine ── Mis intercambios creados ──────
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT pt.*,
              u.username AS respondent_name,
              COALESCE(
                json_agg(
                  json_build_object('id',i.id,'catalog_id',i.catalog_id,'rarity',i.rarity,
                                    'condition',i.condition,'grade',i.grade,'value',i.value)
                ) FILTER (WHERE i.id IS NOT NULL), '[]'
              ) AS offer_item_details
       FROM player_trades pt
       LEFT JOIN users u ON u.id = pt.respondent_id
       LEFT JOIN items i ON i.id = ANY(pt.offer_items)
       WHERE pt.creator_id = $1 AND pt.status IN ('open','accepted')
       GROUP BY pt.id, u.username
       ORDER BY pt.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('mine trades error:', err);
    res.status(500).json({ error: 'Error al cargar tus intercambios' });
  }
});

// ── GET /api/trades/proposals ── Propuestas recibidas ─────
router.get('/proposals', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT pt.*,
              uc.username AS creator_name,
              ur.username AS respondent_name, ur.avatar AS respondent_avatar,
              COALESCE(
                (SELECT json_agg(json_build_object('id',i.id,'catalog_id',i.catalog_id,'rarity',i.rarity,
                                                   'condition',i.condition,'grade',i.grade,'value',i.value))
                 FROM items i WHERE i.id = ANY(pt.offer_items)), '[]'
              ) AS offer_item_details,
              COALESCE(
                (SELECT json_agg(json_build_object('id',i.id,'catalog_id',i.catalog_id,'rarity',i.rarity,
                                                   'condition',i.condition,'grade',i.grade,'value',i.value))
                 FROM items i WHERE i.id = ANY(pt.respond_items)), '[]'
              ) AS respond_item_details
       FROM player_trades pt
       JOIN users uc ON uc.id = pt.creator_id
       LEFT JOIN users ur ON ur.id = pt.respondent_id
       WHERE pt.creator_id = $1 AND pt.status = 'open' AND pt.respondent_id IS NOT NULL
         AND pt.expires_at > NOW()
       ORDER BY pt.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('proposals error:', err);
    res.status(500).json({ error: 'Error al cargar propuestas' });
  }
});

// ── POST /api/trades ── Crear intercambio ─────────────────
router.post('/',
  requireAuth,
  body('offer_items').isArray({ min:1, max:3 }),
  body('want_catalog').optional().isString(),
  body('want_rarity').optional().isIn(['common','rare','epic','legendary','unique','exotic','']),
  body('want_note').optional().isString().isLength({ max: 100 }),
  validate,
  async (req, res) => {
    const { offer_items, want_catalog, want_rarity, want_note } = req.body;
    try {
      const result = await withTransaction(async (client) => {
        // Verificar máximo 3 activos
        const { rows: existing } = await client.query(
          `SELECT COUNT(*) FROM player_trades WHERE creator_id=$1 AND status='open' AND expires_at > NOW()`,
          [req.user.id]
        );
        if (parseInt(existing[0].count) >= 3)
          throw Object.assign(new Error('Ya tienes 3 intercambios activos. Cancela uno primero.'), { status: 400 });

        await validateUserItems(client, req.user.id, offer_items);

        // Marcar items como en intercambio (for_sale=FALSE ya está, usamos in_auction=FALSE too)
        const { rows: [trade] } = await client.query(
          `INSERT INTO player_trades (creator_id, offer_items, want_catalog, want_rarity, want_note)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [req.user.id, offer_items, want_catalog || null, want_rarity || null, want_note || null]
        );
        return trade;
      });
      res.status(201).json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('create trade error:', err);
      res.status(500).json({ error: 'Error al crear intercambio' });
    }
  }
);

// ── POST /api/trades/:id/propose ── Proponer intercambio ──
router.post('/:id/propose',
  requireAuth,
  param('id').isUUID(),
  body('respond_items').isArray({ min:1, max:3 }),
  validate,
  async (req, res) => {
    const { respond_items } = req.body;
    try {
      const result = await withTransaction(async (client) => {
        const { rows: [trade] } = await client.query(
          `SELECT * FROM player_trades WHERE id=$1 AND status='open' AND expires_at > NOW() FOR UPDATE`,
          [req.params.id]
        );
        if (!trade) throw Object.assign(new Error('Intercambio no encontrado o expirado'), { status: 404 });
        if (trade.creator_id === req.user.id)
          throw Object.assign(new Error('No puedes responder tu propio intercambio'), { status: 400 });
        if (trade.respondent_id)
          throw Object.assign(new Error('Este intercambio ya tiene una propuesta pendiente'), { status: 409 });

        await validateUserItems(client, req.user.id, respond_items);

        const { rows: [updated] } = await client.query(
          `UPDATE player_trades SET respondent_id=$2, respond_items=$3, respondent_accepted=TRUE
           WHERE id=$1 RETURNING *`,
          [trade.id, req.user.id, respond_items]
        );

        // Notificar al creador
        await client.query(
          `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
          [trade.creator_id, `🤝 ¡Alguien propuso un intercambio por tus objetos! Revisa tus intercambios.`]
        );

        return updated;
      });
      res.json(result);
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('propose trade error:', err);
      res.status(500).json({ error: 'Error al proponer intercambio' });
    }
  }
);

// ── POST /api/trades/:id/accept ── Aceptar propuesta ──────
router.post('/:id/accept',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const result = await withTransaction(async (client) => {
        const { rows: [trade] } = await client.query(
          `SELECT * FROM player_trades WHERE id=$1 AND status='open' AND expires_at > NOW() FOR UPDATE`,
          [req.params.id]
        );
        if (!trade) throw Object.assign(new Error('Intercambio no encontrado o expirado'), { status: 404 });
        if (trade.creator_id !== req.user.id)
          throw Object.assign(new Error('Solo el creador puede aceptar'), { status: 403 });
        if (!trade.respondent_id || !trade.respond_items)
          throw Object.assign(new Error('No hay propuesta que aceptar'), { status: 400 });

        // Verificar que ambos siguen teniendo sus items
        const { rows: creatorItems } = await client.query(
          `SELECT id FROM items WHERE id = ANY($1) AND user_id=$2`,
          [trade.offer_items, trade.creator_id]
        );
        if (creatorItems.length !== trade.offer_items.length)
          throw Object.assign(new Error('Ya no tienes todos los objetos ofrecidos'), { status: 400 });

        const { rows: respondentItems } = await client.query(
          `SELECT id FROM items WHERE id = ANY($1) AND user_id=$2`,
          [trade.respond_items, trade.respondent_id]
        );
        if (respondentItems.length !== trade.respond_items.length)
          throw Object.assign(new Error('El otro jugador ya no tiene sus objetos'), { status: 400 });

        // Transferir items del creador → respondente
        await client.query(
          `UPDATE items SET user_id=$1 WHERE id = ANY($2)`,
          [trade.respondent_id, trade.offer_items]
        );

        // Transferir items del respondente → creador
        await client.query(
          `UPDATE items SET user_id=$1 WHERE id = ANY($2)`,
          [trade.creator_id, trade.respond_items]
        );

        // Actualizar colecciones de ambos
        for (const itemId of trade.offer_items) {
          const { rows: [itm] } = await client.query(`SELECT catalog_id FROM items WHERE id=$1`, [itemId]);
          if (itm) await client.query(`INSERT INTO collection (user_id,catalog_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [trade.respondent_id, itm.catalog_id]);
        }
        for (const itemId of trade.respond_items) {
          const { rows: [itm] } = await client.query(`SELECT catalog_id FROM items WHERE id=$1`, [itemId]);
          if (itm) await client.query(`INSERT INTO collection (user_id,catalog_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [trade.creator_id, itm.catalog_id]);
        }

        // XP para ambos
        const { rows: [statsC] } = await client.query(`SELECT level,xp,xp_next FROM user_stats WHERE user_id=$1`, [trade.creator_id]);
        const { rows: [statsR] } = await client.query(`SELECT level,xp,xp_next FROM user_stats WHERE user_id=$1`, [trade.respondent_id]);
        const xpC = applyXP(+statsC.level, +statsC.xp, +statsC.xp_next, XP_REWARDS.accept_trade);
        const xpR = applyXP(+statsR.level, +statsR.xp, +statsR.xp_next, XP_REWARDS.accept_trade);

        await client.query(
          `UPDATE user_stats SET trades_done=trades_done+1,xp=$2,level=$3,xp_next=$4 WHERE user_id=$1`,
          [trade.creator_id, xpC.xp, xpC.level, xpC.xpNext]
        );
        await client.query(
          `UPDATE user_stats SET trades_done=trades_done+1,xp=$2,level=$3,xp_next=$4 WHERE user_id=$1`,
          [trade.respondent_id, xpR.xp, xpR.level, xpR.xpNext]
        );

        // Marcar como completado
        await client.query(`UPDATE player_trades SET status='accepted' WHERE id=$1`, [trade.id]);

        // Notificar al respondente
        await client.query(
          `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
          [trade.respondent_id, `✅ ¡Tu propuesta de intercambio fue aceptada! Los objetos ya están en tu inventario.`]
        );

        await leaderboardUpdate(trade.creator_id, xpC.level);
        await leaderboardUpdate(trade.respondent_id, xpR.level);
        await checkAchievements(client, req.user.id);

        return { xpResult: xpC, xp_gained: XP_REWARDS.accept_trade };
      });
      res.json({ message: '¡Intercambio completado!', ...result });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('accept trade error:', err);
      res.status(500).json({ error: 'Error al aceptar el intercambio' });
    }
  }
);

// ── POST /api/trades/:id/reject ── Rechazar propuesta ─────
router.post('/:id/reject',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { rows: [trade] } = await query(
        `SELECT * FROM player_trades WHERE id=$1 AND creator_id=$2 AND status='open'`,
        [req.params.id, req.user.id]
      );
      if (!trade) return res.status(404).json({ error: 'Intercambio no encontrado' });

      // Notificar al respondente
      if (trade.respondent_id) {
        await query(
          `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
          [trade.respondent_id, `❌ Tu propuesta de intercambio fue rechazada. Tus objetos siguen en tu inventario.`]
        );
      }

      // Limpiar respondente para que otro pueda proponer
      await query(
        `UPDATE player_trades SET respondent_id=NULL, respond_items=NULL, respondent_accepted=NULL WHERE id=$1`,
        [trade.id]
      );
      res.json({ message: 'Propuesta rechazada' });
    } catch (err) {
      console.error('reject trade error:', err);
      res.status(500).json({ error: 'Error al rechazar' });
    }
  }
);

// ── POST /api/trades/:id/cancel ── Cancelar mi intercambio ─
router.post('/:id/cancel',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    try {
      const { rows } = await query(
        `UPDATE player_trades SET status='cancelled' WHERE id=$1 AND creator_id=$2 AND status='open' RETURNING id`,
        [req.params.id, req.user.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Intercambio no encontrado' });
      res.json({ message: 'Intercambio cancelado' });
    } catch (err) {
      console.error('cancel trade error:', err);
      res.status(500).json({ error: 'Error al cancelar' });
    }
  }
);

module.exports = router;
