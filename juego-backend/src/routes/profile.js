const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { query, withTransaction } = require('../config/db');

// ── PATCH /api/profile/me/avatar ── Cambiar avatar ────────
router.patch('/me/avatar', requireAuth, async (req, res) => {
  const { avatar } = req.body;
  if (!avatar || typeof avatar !== 'string' || avatar.length > 8)
    return res.status(400).json({ error: 'Avatar inválido' });
  await query(`UPDATE users SET avatar = $1 WHERE id = $2`, [avatar, req.user.id]);
  res.json({ avatar });
});

// ── PUT /api/profile/me/showcase ── Actualizar vitrina ────
router.put('/me/showcase', requireAuth, async (req, res) => {
  const { slots } = req.body;
  if (!Array.isArray(slots)) return res.status(400).json({ error: 'slots debe ser array' });

  try {
    const { rows: [stats] } = await query(
      `SELECT s.level FROM user_stats s WHERE s.user_id = $1`,
      [req.user.id]
    );
    const level = stats.level;
    const maxSlots = level >= 20 ? 7 : level >= 15 ? 5 : level >= 10 ? 3 : level >= 5 ? 1 : 0;
    if (maxSlots === 0) return res.status(403).json({ error: 'Vitrina bloqueada hasta nivel 5' });

    await withTransaction(async (client) => {
      await client.query(`DELETE FROM showcase WHERE user_id = $1`, [req.user.id]);

      for (const s of slots) {
        if (s.slot < 1 || s.slot > maxSlots) continue;
        if (!s.itemId) continue;

        const { rows: items } = await client.query(
          `SELECT id FROM items WHERE id = $1 AND user_id = $2 AND in_auction = FALSE`,
          [s.itemId, req.user.id]
        );
        if (!items.length) continue;

        await client.query(
          `INSERT INTO showcase (user_id, slot, item_id) VALUES ($1, $2, $3)
           ON CONFLICT (user_id, slot) DO UPDATE SET item_id = $3`,
          [req.user.id, s.slot, s.itemId]
        );
      }
    });

    const { rows: showcaseRows } = await query(
      `SELECT sc.slot, i.id, i.catalog_id, i.rarity, i.condition, i.grade, i.value
       FROM showcase sc
       LEFT JOIN items i ON sc.item_id = i.id
       WHERE sc.user_id = $1 ORDER BY sc.slot ASC`,
      [req.user.id]
    );

    res.json({ showcase: showcaseRows });
  } catch (err) {
    console.error('showcase update error:', err);
    res.status(500).json({ error: 'Error al actualizar vitrina' });
  }
});

// ── GET /api/profile/me/showcase ─────────────────────────
router.get('/me/showcase', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT sc.slot, i.id, i.catalog_id, i.rarity, i.condition, i.grade, i.value, i.identified
     FROM showcase sc
     LEFT JOIN items i ON sc.item_id = i.id
     WHERE sc.user_id = $1 ORDER BY sc.slot ASC`,
    [req.user.id]
  );
  res.json(rows);
});

// ── GET /api/profile/me/titles ── Mis títulos desbloqueados
router.get('/me/titles', requireAuth, async (req, res) => {
  const TITLE_ACHIEVEMENTS = ['collector_all','level_50','millionaire','poker_royal','bodega_50'];
  try {
    // Auto-grant any titles the user has earned but not yet received
    await query(
      `INSERT INTO user_titles (user_id, title_id)
       SELECT user_id, achievement_id
       FROM achievements
       WHERE user_id=$1 AND achievement_id = ANY($2)
       ON CONFLICT DO NOTHING`,
      [req.user.id, TITLE_ACHIEVEMENTS]
    );

    const { rows } = await query(
      `SELECT ut.title_id, ut.unlocked_at, us.equipped_title
       FROM user_titles ut
       CROSS JOIN user_stats us
       WHERE ut.user_id = $1 AND us.user_id = $1
       ORDER BY ut.unlocked_at ASC`,
      [req.user.id]
    );
    if (rows.length === 0) {
      const { rows: [stats] } = await query(`SELECT equipped_title FROM user_stats WHERE user_id=$1`, [req.user.id]);
      return res.json({ titles: [], equipped: stats?.equipped_title || null });
    }
    res.json({ titles: rows.map(r => r.title_id), equipped: rows[0].equipped_title || null });
  } catch (err) {
    console.error('titles error:', err);
    res.status(500).json({ error: 'Error al cargar títulos' });
  }
});

// ── POST /api/profile/me/titles/equip ── Equipar título
router.post('/me/titles/equip', requireAuth, async (req, res) => {
  const { title_id } = req.body;
  try {
    if (title_id !== null) {
      const { rows } = await query(
        `SELECT 1 FROM user_titles WHERE user_id=$1 AND title_id=$2`,
        [req.user.id, title_id]
      );
      if (!rows.length) return res.status(403).json({ error: 'No tienes ese título' });
    }
    await query(`UPDATE user_stats SET equipped_title=$1 WHERE user_id=$2`, [title_id, req.user.id]);
    res.json({ equipped: title_id });
  } catch (err) {
    console.error('equip title error:', err);
    res.status(500).json({ error: 'Error al equipar título' });
  }
});

// ── GET /api/profile/:userId ── Perfil público ────────────
router.get('/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rows: users } = await query(
      `SELECT u.id, u.username, u.avatar, u.created_at,
              s.level, s.money, s.bodegas_opened, s.items_sold,
              s.total_earned, s.bj_wins, s.bj_best_streak, s.equipped_title
       FROM users u JOIN user_stats s ON s.user_id = u.id
       WHERE u.id = $1 AND u.is_banned = FALSE`,
      [userId]
    );
    if (!users.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const user = users[0];

    const { rows: achRows } = await query(
      `SELECT achievement_id FROM achievements WHERE user_id = $1`,
      [userId]
    );

    const { rows: colRows } = await query(
      `SELECT COUNT(*) AS total FROM collection WHERE user_id = $1`,
      [userId]
    );

    const { rows: showcaseRows } = await query(
      `SELECT sc.slot, i.id, i.catalog_id, i.rarity, i.condition, i.grade, i.value
       FROM showcase sc
       LEFT JOIN items i ON sc.item_id = i.id
       WHERE sc.user_id = $1
       ORDER BY sc.slot ASC`,
      [userId]
    );

    const { rows: revRows } = await query(
      `SELECT rc.id, rc.name, rc.css_class, rc.rarity
       FROM user_stats us
       LEFT JOIN revestimiento_catalog rc ON rc.id = us.active_revestimiento
       WHERE us.user_id = $1`,
      [userId]
    );
    const activeRev = revRows[0]?.id ? revRows[0] : null;

    res.json({
      id:             user.id,
      username:       user.username,
      avatar:         user.avatar,
      createdAt:      user.created_at,
      level:          user.level,
      bodegas:        user.bodegas_opened || 0,
      sold:           user.items_sold || 0,
      bjWins:         user.bj_wins || 0,
      bjBestStreak:   user.bj_best_streak || 0,
      totalEarned:    parseInt(user.total_earned || 0),
      collectionCount: parseInt(colRows[0].total),
      achievements:   achRows.map(a => a.achievement_id),
      showcase:       showcaseRows,
      activeRevestimiento: activeRev,
      equippedTitle:  user.equipped_title || null,
    });
  } catch (err) {
    console.error('profile error:', err);
    res.status(500).json({ error: 'Error al cargar perfil' });
  }
});

// ── GET /api/profile/:userId/inventory ── Ver inventario de otro jugador
router.get('/:userId/inventory', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT id, catalog_id, rarity, condition, grade, identified, for_sale, value
     FROM items WHERE user_id = $1 AND in_auction = FALSE
     ORDER BY value DESC LIMIT 100`,
    [req.params.userId]
  );
  res.json(rows.map(i => ({
    uid: i.id, catalogId: i.catalog_id, rarity: i.rarity,
    condition: i.condition, grade: i.grade, identified: i.identified,
    forSale: i.for_sale, value: i.value,
  })));
});

module.exports = router;
