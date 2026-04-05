const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { query, withTransaction } = require('../config/db');
const { applyXP, XP_REWARDS } = require('../services/xp');
const { leaderboardUpdate } = require('../config/redis');
const CATALOG = require('../data/catalog');
const CATEGORY_REWARD_IDS = new Set(CATALOG.filter(c => c.category_reward).map(c => c.id));

// ── GET /api/auctions ── Lista de subastas activas ────────
router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT a.id, a.seller_id, a.item_id, a.min_bid, a.current_bid,
            a.winner_id, a.ends_at, a.created_at, a.status,
            u.username AS seller_name, u.avatar AS seller_avatar,
            i.catalog_id, i.rarity, i.condition, i.grade, i.value AS item_value,
            i.identified, i.is_exclusive,
            w.username AS winner_name,
            (SELECT COUNT(*) FROM auction_bids ab WHERE ab.auction_id = a.id) AS bid_count,
            (SELECT ab2.bidder_id FROM auction_bids ab2
             WHERE ab2.auction_id = a.id ORDER BY ab2.amount DESC LIMIT 1) AS top_bidder_id
     FROM auctions a
     JOIN users u ON a.seller_id = u.id
     JOIN items i ON a.item_id = i.id
     LEFT JOIN users w ON a.winner_id = w.id
     WHERE a.status = 'active'
     ORDER BY a.ends_at ASC`,
    []
  );
  res.json(rows);
});

// ── GET /api/auctions/mine ── Mis subastas ────────────────
router.get('/mine', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT a.id, a.seller_id, a.item_id, a.min_bid, a.current_bid,
            a.winner_id, a.ends_at, a.created_at, a.status,
            i.catalog_id, i.rarity, i.condition, i.grade, i.value AS item_value,
            i.identified, i.is_exclusive,
            w.username AS winner_name,
            (SELECT COUNT(*) FROM auction_bids ab WHERE ab.auction_id = a.id) AS bid_count
     FROM auctions a
     JOIN items i ON a.item_id = i.id
     LEFT JOIN users w ON a.winner_id = w.id
     WHERE a.seller_id = $1
     ORDER BY a.created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json(rows);
});

// ── POST /api/auctions ── Crear subasta ───────────────────
router.post('/', requireAuth, async (req, res) => {
  const { itemId, minBid, durationHours } = req.body;
  if (!itemId || !minBid || !durationHours)
    return res.status(400).json({ error: 'Faltan campos: itemId, minBid, durationHours' });
  if (!Number.isInteger(minBid) || minBid < 1)
    return res.status(400).json({ error: 'Precio mínimo inválido' });
  if (!Number.isFinite(durationHours) || durationHours < 0.5 || durationHours > 24)
    return res.status(400).json({ error: 'Duración debe ser entre 0.5 y 24 horas' });

  try {
    const result = await withTransaction(async (client) => {
      // Verificar que el item pertenece al usuario, está identificado y no está bloqueado
      const { rows: items } = await client.query(
        `SELECT id, catalog_id, rarity, condition, grade, value, identified, in_auction, for_sale
         FROM items WHERE id=$1 AND user_id=$2 FOR UPDATE`,
        [itemId, req.user.id]
      );
      if (!items.length) throw Object.assign(new Error('Item no encontrado'), { status:404 });
      const item = items[0];
      if (!item.identified) throw Object.assign(new Error('Debes identificar el objeto primero'), { status:400 });
      if (item.in_auction)  throw Object.assign(new Error('El objeto ya está en una subasta'), { status:409 });
      if (CATEGORY_REWARD_IDS.has(item.catalog_id)) throw Object.assign(new Error('Los objetos de recompensa de catálogo no se pueden subastar.'), { status:403 });

      // Bloquear el item
      await client.query(
        `UPDATE items SET in_auction=TRUE, for_sale=FALSE WHERE id=$1`,
        [itemId]
      );

      // Crear subasta
      const endsAt = new Date(Date.now() + durationHours * 3600 * 1000);
      const { rows: [auction] } = await client.query(
        `INSERT INTO auctions (seller_id, item_id, min_bid, ends_at)
         VALUES ($1, $2, $3, $4) RETURNING id, ends_at`,
        [req.user.id, itemId, minBid, endsAt]
      );

      return { auctionId: auction.id, endsAt: auction.ends_at, item };
    });

    res.status(201).json({ message: 'Subasta creada', ...result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('create auction error:', err);
    res.status(500).json({ error: 'Error al crear subasta' });
  }
});

// ── POST /api/auctions/:id/bid ── Pujar ───────────────────
router.post('/:id/bid', requireAuth, async (req, res) => {
  const { amount } = req.body;
  if (!Number.isInteger(amount) || amount < 1)
    return res.status(400).json({ error: 'Cantidad inválida' });

  try {
    const result = await withTransaction(async (client) => {
      // Cargar subasta con lock
      const { rows: [auction] } = await client.query(
        `SELECT id, seller_id, current_bid, min_bid, winner_id, ends_at, status
         FROM auctions WHERE id=$1 FOR UPDATE`,
        [req.params.id]
      );
      if (!auction) throw Object.assign(new Error('Subasta no encontrada'), { status:404 });
      if (auction.status !== 'active') throw Object.assign(new Error('La subasta ya terminó'), { status:409 });
      if (new Date(auction.ends_at) < new Date()) throw Object.assign(new Error('La subasta expiró'), { status:409 });
      if (auction.seller_id === req.user.id) throw Object.assign(new Error('No puedes pujar en tu propia subasta'), { status:400 });

      const minRequired = Math.max(auction.min_bid, (auction.current_bid || 0) + 1);
      if (amount < minRequired)
        throw Object.assign(new Error(`La puja mínima es ${minRequired} monedas`), { status:400 });

      // Verificar fondos del pujador
      const { rows: [bidderStats] } = await client.query(
        `SELECT money FROM user_stats WHERE user_id=$1 FOR UPDATE`,
        [req.user.id]
      );
      if (bidderStats.money < amount)
        throw Object.assign(new Error('No tienes suficientes monedas'), { status:402 });

      // Desbloquear monedas del pujador anterior si existe y es diferente al actual
      if (auction.winner_id && auction.winner_id !== req.user.id) {
        await client.query(
          `UPDATE user_stats SET money=money+$1 WHERE user_id=$2`,
          [auction.current_bid, auction.winner_id]
        );
        await client.query(
          `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
          [auction.winner_id, `💸 Tu puja fue superada. +${auction.current_bid} monedas devueltas.`]
        );
      }

      // Bloquear monedas del nuevo pujador
      await client.query(
        `UPDATE user_stats SET money=money-$1 WHERE user_id=$2`,
        [amount, req.user.id]
      );

      // Registrar la puja
      await client.query(
        `INSERT INTO auction_bids (auction_id, bidder_id, amount) VALUES ($1, $2, $3)`,
        [req.params.id, req.user.id, amount]
      );

      // Actualizar subasta
      await client.query(
        `UPDATE auctions SET current_bid=$1, winner_id=$2 WHERE id=$3`,
        [amount, req.user.id, req.params.id]
      );

      // Notificar al vendedor
      await client.query(
        `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
        [auction.seller_id, `📈 Nueva puja de ${req.user.username}: ${amount} monedas en tu subasta.`]
      );

      return { newBid: amount, prevBidRefunded: auction.current_bid || 0 };
    });

    res.json({ message: 'Puja registrada', ...result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('bid error:', err);
    res.status(500).json({ error: 'Error al pujar' });
  }
});

module.exports = router;
