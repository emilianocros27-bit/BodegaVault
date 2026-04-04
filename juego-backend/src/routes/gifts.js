const router = require('express').Router();
const { body, param } = require('express-validator');
const { requireAuth }  = require('../middleware/auth');
const { validate }     = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');
const { openBodega }   = require('../services/gacha');
const { generateOffersForItem } = require('../services/npc');
const { applyXP, XP_REWARDS }  = require('../services/xp');
const BODEGAS = require('../data/bodegas');

const ALLOWED_BODEGAS_LVL5  = ['basica', 'estandar', 'premium'];
const ALL_BODEGAS            = BODEGAS.map(b => b.id);
const DAILY_GIFT_LIMIT       = 3;

function allowedForLevel(level) {
  if (level < 5)  return [];
  if (level < 10) return ALLOWED_BODEGAS_LVL5;
  return ALL_BODEGAS;
}

// ── GET /api/gifts/pending — regalos pendientes para el usuario ──
router.get('/pending', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT g.id, g.bodega_id, g.created_at,
              u.username AS sender_name
         FROM bodega_gifts g
         JOIN users u ON u.id = g.sender_id
        WHERE g.recipient_id = $1 AND g.status = 'pending'
        ORDER BY g.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('gifts pending error:', err);
    res.status(500).json({ error: 'Error al obtener regalos' });
  }
});

// ── POST /api/gifts/send — enviar una bodega a un amigo ──
router.post('/send',
  requireAuth,
  body('friend_id').isUUID(),
  body('bodega_id').notEmpty().isIn(ALL_BODEGAS),
  validate,
  async (req, res) => {
    const { friend_id, bodega_id } = req.body;
    const senderId = req.user.id;

    try {
      const result = await withTransaction(async (client) => {
        // Stats del remitente
        const { rows: [sender] } = await client.query(
          `SELECT us.money, us.level, us.gifts_sent_today, us.gifts_date,
                  u.username
             FROM user_stats us JOIN users u ON u.id = us.user_id
            WHERE us.user_id = $1 FOR UPDATE`,
          [senderId]
        );

        // Validar nivel mínimo
        const allowed = allowedForLevel(sender.level);
        if (!allowed.includes(bodega_id)) {
          const minLevel = ALLOWED_BODEGAS_LVL5.includes(bodega_id) ? 5 : 10;
          throw Object.assign(
            new Error(`Necesitas nivel ${minLevel} para regalar esta bodega`),
            { status: 403 }
          );
        }

        // Validar límite diario (reset si cambió el día)
        const today = new Date().toISOString().slice(0, 10);
        const giftDate = sender.gifts_date ? sender.gifts_date.toISOString().slice(0, 10) : null;
        const sentToday = giftDate === today ? (sender.gifts_sent_today || 0) : 0;
        if (sentToday >= DAILY_GIFT_LIMIT) {
          throw Object.assign(
            new Error(`Límite diario de ${DAILY_GIFT_LIMIT} regalos alcanzado`),
            { status: 429 }
          );
        }

        // Validar que sean amigos
        const { rows: friendship } = await client.query(
          `SELECT id FROM friendships
            WHERE status = 'accepted'
              AND ((requester = $1 AND addressee = $2)
                OR (requester = $2 AND addressee = $1))`,
          [senderId, friend_id]
        );
        if (!friendship.length) {
          throw Object.assign(new Error('Solo puedes enviar regalos a amigos'), { status: 403 });
        }

        // Validar saldo
        const bodega = BODEGAS.find(b => b.id === bodega_id);
        if (sender.money < bodega.cost) {
          throw Object.assign(new Error('No tienes suficiente dinero'), { status: 402 });
        }

        // Descontar dinero al remitente
        await client.query(
          `UPDATE user_stats SET
             money          = money - $2,
             total_spent    = total_spent + $2,
             gifts_sent_today = $3,
             gifts_date     = $4
           WHERE user_id = $1`,
          [senderId, bodega.cost, sentToday + 1, today]
        );

        await client.query(
          `INSERT INTO transactions (user_id, type, amount, description)
           VALUES ($1, 'gift_sent', $2, $3)`,
          [senderId, -bodega.cost, `Regalo: ${bodega.name} → ${friend_id}`]
        );

        // Crear registro de regalo
        const { rows: [gift] } = await client.query(
          `INSERT INTO bodega_gifts (sender_id, recipient_id, bodega_id)
           VALUES ($1, $2, $3) RETURNING id`,
          [senderId, friend_id, bodega_id]
        );

        // Notificar al destinatario
        await client.query(
          `INSERT INTO notifications (user_id, message, metadata)
           VALUES ($1, $2, $3)`,
          [
            friend_id,
            `🎁 ¡${sender.username} te regaló una ${bodega.name}! Toca para abrirla.`,
            JSON.stringify({ type: 'gift', gift_id: gift.id, bodega_id, bodega_name: bodega.name }),
          ]
        );

        return { gift_id: gift.id, bodega_name: bodega.name, cost: bodega.cost, gifts_remaining: DAILY_GIFT_LIMIT - sentToday - 1 };
      });

      res.json({ message: 'Bodega enviada con éxito', ...result });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('gift send error:', err);
      res.status(500).json({ error: 'Error al enviar el regalo' });
    }
  }
);

// ── POST /api/gifts/:id/open — abrir un regalo recibido ──
router.post('/:id/open',
  requireAuth,
  param('id').isUUID(),
  validate,
  async (req, res) => {
    const recipientId = req.user.id;

    try {
      const result = await withTransaction(async (client) => {
        // Verificar regalo
        const { rows: [gift] } = await client.query(
          `SELECT * FROM bodega_gifts WHERE id = $1 AND recipient_id = $2 FOR UPDATE`,
          [req.params.id, recipientId]
        );
        if (!gift) throw Object.assign(new Error('Regalo no encontrado'), { status: 404 });
        if (gift.status !== 'pending') throw Object.assign(new Error('Este regalo ya fue abierto'), { status: 409 });

        // Stats del destinatario (para XP)
        const { rows: [stats] } = await client.query(
          `SELECT level, xp, xp_next, bodegas_opened FROM user_stats WHERE user_id = $1 FOR UPDATE`,
          [recipientId]
        );

        // Abrir la bodega
        const { items } = openBodega(gift.bodega_id);

        const baseXP   = XP_REWARDS.bodega_base[gift.bodega_id] ?? 8;
        const rarityXP = items.reduce((sum, item) => sum + (XP_REWARDS.item_rarity[item.rarity] ?? 1), 0);
        const gainedXP = baseXP + rarityXP;
        const xpResult = applyXP(+stats.level, +stats.xp, +stats.xp_next, gainedXP);

        // Insertar items
        const insertedItems = [];
        for (const item of items) {
          const { rows: [inserted] } = await client.query(
            `INSERT INTO items (user_id, catalog_id, rarity, condition, grade, identified, value)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
            [recipientId, item.catalog_id, item.rarity, item.condition, item.grade, item.identified, item.value]
          );
          insertedItems.push(inserted);

          if (item.identified) {
            await client.query(
              `INSERT INTO collection (user_id, catalog_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
              [recipientId, item.catalog_id]
            );
          }
        }

        // Actualizar stats del destinatario
        await client.query(
          `UPDATE user_stats SET
             level          = $2,
             xp             = $3,
             xp_next        = $4,
             bodegas_opened = bodegas_opened + 1
           WHERE user_id = $1`,
          [recipientId, xpResult.level, xpResult.xp, xpResult.xpNext]
        );

        // Generar ofertas NPC
        for (const item of insertedItems) {
          if (!item.identified) continue;
          const offers = generateOffersForItem(item);
          for (const offer of offers) {
            await client.query(
              `INSERT INTO npc_offers (user_id, npc_id, item_id, price, phrase)
               VALUES ($1,$2,$3,$4,$5)`,
              [recipientId, offer.npc_id, item.id, offer.price, offer.phrase]
            );
          }
        }

        // Marcar regalo como abierto
        await client.query(
          `UPDATE bodega_gifts SET status = 'opened' WHERE id = $1`,
          [gift.id]
        );

        // Marcar notificación de regalo como leída
        await client.query(
          `UPDATE notifications SET read = TRUE
            WHERE user_id = $1 AND metadata->>'gift_id' = $2`,
          [recipientId, gift.id]
        );

        return { items: insertedItems, xpResult, bodega_id: gift.bodega_id };
      });

      res.json({
        items:       result.items,
        new_level:   result.xpResult.level,
        new_xp:      result.xpResult.xp,
        new_xp_next: result.xpResult.xpNext,
        levels_up:   result.xpResult.levelsGained,
        bodega_id:   result.bodega_id,
      });
    } catch (err) {
      if (err.status) return res.status(err.status).json({ error: err.message });
      console.error('gift open error:', err);
      res.status(500).json({ error: 'Error al abrir el regalo' });
    }
  }
);

module.exports = router;
