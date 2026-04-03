const router  = require('express').Router();
const { param } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate }    = require('../middleware/validate');
const { withTransaction, query } = require('../config/db');

const BOX_COST = 45000;

// Probabilidades idénticas a Bodega Misteriosa
const RARITY_WEIGHTS = { common:10, rare:30, epic:38, legendary:17, unique:5 };

function pickRarity() {
  const total = Object.values(RARITY_WEIGHTS).reduce((a,b) => a+b, 0);
  let r = Math.random() * total;
  for (const [k,v] of Object.entries(RARITY_WEIGHTS)) {
    r -= v;
    if (r <= 0) return k;
  }
  return 'common';
}

// ── GET /api/revestimientos — colección del usuario ──────
router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT ur.id, ur.catalog_id, ur.obtained_at,
              rc.name, rc.rarity, rc.description, rc.css_class,
              (us.active_revestimiento = ur.catalog_id) AS equipped
         FROM user_revestimientos ur
         JOIN revestimiento_catalog rc ON rc.id = ur.catalog_id
         JOIN user_stats us ON us.user_id = ur.user_id
        WHERE ur.user_id = $1
        ORDER BY
          CASE rc.rarity
            WHEN 'unique' THEN 1 WHEN 'legendary' THEN 2
            WHEN 'epic'   THEN 3 WHEN 'rare'      THEN 4
            ELSE 5 END, ur.obtained_at DESC`,
      [req.user.id]
    );
    const { rows: [stats] } = await query(
      `SELECT active_revestimiento FROM user_stats WHERE user_id=$1`, [req.user.id]
    );
    res.json({ revestimientos: rows, active: stats?.active_revestimiento || null });
  } catch (err) {
    console.error('get revestimientos error:', err);
    res.status(500).json({ error: 'Error al obtener revestimientos' });
  }
});

// ── POST /api/revestimientos/open-box — abrir caja de diseñador ──
router.post('/open-box', requireAuth, async (req, res) => {
  try {
    const result = await withTransaction(async (client) => {
      const { rows: [stats] } = await client.query(
        `SELECT money, level FROM user_stats WHERE user_id=$1 FOR UPDATE`,
        [req.user.id]
      );

      if (stats.level < 5) {
        throw Object.assign(new Error('Necesitas nivel 5 para abrir la Caja de Diseñador'), { status:403 });
      }
      if (stats.money < BOX_COST) {
        throw Object.assign(new Error('No tienes suficiente dinero'), { status:402 });
      }

      // Elegir rareza y revestimiento aleatorio de esa rareza
      const rarity = pickRarity();
      const { rows: pool } = await client.query(
        `SELECT id, name, css_class FROM revestimiento_catalog WHERE rarity=$1`, [rarity]
      );
      const picked = pool[Math.floor(Math.random() * pool.length)];

      // Comprobar si ya lo tiene (duplicado)
      const { rows: existing } = await client.query(
        `SELECT id FROM user_revestimientos WHERE user_id=$1 AND catalog_id=$2`,
        [req.user.id, picked.id]
      );
      const isDuplicate = existing.length > 0;

      // Descontar dinero
      await client.query(
        `UPDATE user_stats SET money=money-$2, total_spent=total_spent+$2 WHERE user_id=$1`,
        [req.user.id, BOX_COST]
      );
      await client.query(
        `INSERT INTO transactions (user_id,type,amount,description) VALUES ($1,'designer_box',$2,$3)`,
        [req.user.id, -BOX_COST, `Caja de Diseñador: ${picked.name}`]
      );

      if (!isDuplicate) {
        await client.query(
          `INSERT INTO user_revestimientos (user_id, catalog_id) VALUES ($1,$2)`,
          [req.user.id, picked.id]
        );
      }

      // Info completa del revestimiento obtenido
      const { rows: [full] } = await client.query(
        `SELECT * FROM revestimiento_catalog WHERE id=$1`, [picked.id]
      );

      return { revestimiento: full, isDuplicate, cost: BOX_COST };
    });

    res.json({
      revestimiento: result.revestimiento,
      is_duplicate:  result.isDuplicate,
      cost:          result.cost,
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('open designer box error:', err);
    res.status(500).json({ error: 'Error al abrir la caja' });
  }
});

// ── POST /api/revestimientos/:id/equip — equipar ─────────
router.post('/:id/equip',
  requireAuth,
  param('id').notEmpty(),
  validate,
  async (req, res) => {
    try {
      // Verificar que el usuario posee este revestimiento
      const { rows } = await query(
        `SELECT ur.catalog_id FROM user_revestimientos ur
          WHERE ur.user_id=$1 AND ur.catalog_id=$2`,
        [req.user.id, req.params.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'No posees este revestimiento' });

      await query(
        `UPDATE user_stats SET active_revestimiento=$2 WHERE user_id=$1`,
        [req.user.id, req.params.id]
      );
      res.json({ message: 'Revestimiento equipado', active: req.params.id });
    } catch (err) {
      console.error('equip error:', err);
      res.status(500).json({ error: 'Error al equipar' });
    }
  }
);

// ── DELETE /api/revestimientos/active — desequipar ───────
router.delete('/active', requireAuth, async (req, res) => {
  try {
    await query(
      `UPDATE user_stats SET active_revestimiento=NULL WHERE user_id=$1`, [req.user.id]
    );
    res.json({ message: 'Revestimiento desequipado' });
  } catch (err) {
    console.error('unequip error:', err);
    res.status(500).json({ error: 'Error al desequipar' });
  }
});

module.exports = router;
