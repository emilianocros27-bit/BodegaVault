const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { query, withTransaction } = require('../config/db');

// ── GET /api/friends ── Lista de amigos ───────────────────
router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT f.id, f.status, f.created_at,
            u.id AS friend_id, u.username, u.avatar,
            s.level
     FROM friendships f
     JOIN users u ON (
       CASE WHEN f.requester = $1 THEN f.addressee ELSE f.requester END = u.id
     )
     JOIN user_stats s ON s.user_id = u.id
     WHERE (f.requester = $1 OR f.addressee = $1)
       AND f.status = 'accepted'`,
    [req.user.id]
  );
  res.json(rows.map(r => ({
    friendshipId: r.id,
    friendId:  r.friend_id,
    username:  r.username,
    avatar:    r.avatar,
    level:     r.level,
    since:     r.created_at,
  })));
});

// ── GET /api/friends/requests ── Solicitudes pendientes ──
router.get('/requests', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT f.id, f.created_at,
            u.id AS requester_id, u.username, u.avatar, s.level
     FROM friendships f
     JOIN users u ON f.requester = u.id
     JOIN user_stats s ON s.user_id = u.id
     WHERE f.addressee = $1 AND f.status = 'pending'
     ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  res.json(rows.map(r => ({
    friendshipId: r.id,
    requesterId: r.requester_id,
    username:    r.username,
    avatar:      r.avatar,
    level:       r.level,
    sentAt:      r.created_at,
  })));
});

// ── POST /api/friends/request/:userId ── Enviar solicitud ─
router.post('/request/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;
  if (userId === req.user.id)
    return res.status(400).json({ error: 'No puedes agregarte a ti mismo' });

  try {
    // Verificar que el usuario existe
    const { rows: users } = await query(
      `SELECT id, username FROM users WHERE id = $1`, [userId]
    );
    if (!users.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Verificar que no existe ya una relación
    const { rows: existing } = await query(
      `SELECT id, status FROM friendships
       WHERE (requester=$1 AND addressee=$2) OR (requester=$2 AND addressee=$1)`,
      [req.user.id, userId]
    );
    if (existing.length) {
      if (existing[0].status === 'accepted') return res.status(409).json({ error: 'Ya son amigos' });
      return res.status(409).json({ error: 'Ya existe una solicitud pendiente' });
    }

    const { rows: [f] } = await query(
      `INSERT INTO friendships (requester, addressee) VALUES ($1, $2) RETURNING id`,
      [req.user.id, userId]
    );

    // Notificar al destinatario
    await query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
      [userId, `👋 ${req.user.username} te ha enviado una solicitud de amistad.`]
    );

    res.status(201).json({ friendshipId: f.id, message: 'Solicitud enviada' });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Solicitud ya enviada' });
    console.error('friend request error:', err);
    res.status(500).json({ error: 'Error al enviar solicitud' });
  }
});

// ── POST /api/friends/accept/:friendshipId ── Aceptar ─────
router.post('/accept/:friendshipId', requireAuth, async (req, res) => {
  try {
    const { rows: [f] } = await query(
      `UPDATE friendships SET status='accepted'
       WHERE id=$1 AND addressee=$2 AND status='pending'
       RETURNING id, requester`,
      [req.params.friendshipId, req.user.id]
    );
    if (!f) return res.status(404).json({ error: 'Solicitud no encontrada' });

    // Notificar al que envió la solicitud
    await query(
      `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
      [f.requester, `✅ ${req.user.username} aceptó tu solicitud de amistad.`]
    );

    res.json({ message: 'Amistad aceptada' });
  } catch (err) {
    console.error('accept friend error:', err);
    res.status(500).json({ error: 'Error al aceptar solicitud' });
  }
});

// ── DELETE /api/friends/:userId ── Eliminar amigo ─────────
router.delete('/:userId', requireAuth, async (req, res) => {
  const { rowCount } = await query(
    `DELETE FROM friendships
     WHERE ((requester=$1 AND addressee=$2) OR (requester=$2 AND addressee=$1))
       AND status='accepted'`,
    [req.user.id, req.params.userId]
  );
  if (!rowCount) return res.status(404).json({ error: 'No son amigos' });
  res.json({ message: 'Amigo eliminado' });
});

// ── GET /api/friends/search?q=username ── Buscar usuario ──
router.get('/search/users', requireAuth, async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.json([]);
  const { rows } = await query(
    `SELECT u.id, u.username, u.avatar, s.level
     FROM users u JOIN user_stats s ON s.user_id = u.id
     WHERE u.username ILIKE $1 AND u.id != $2 AND u.is_banned = FALSE
     LIMIT 10`,
    [`%${q}%`, req.user.id]
  );
  res.json(rows);
});

module.exports = router;
