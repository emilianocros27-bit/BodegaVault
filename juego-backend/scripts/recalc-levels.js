// Script: recalcula niveles de todos los usuarios con el nuevo sistema XP
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'bodegavault',
  user:     process.env.DB_USER     || 'bodega',
  password: process.env.DB_PASSWORD || 'bodega_secret',
});

// ── Nueva curva XP ────────────────────────────────────────
function xpForLevel(level) {
  return Math.floor(100 * Math.pow(1.30, level - 1));
}

// Calcula nivel y xp residual a partir de un total de XP acumulado
function calcLevelFromXP(totalXP) {
  let level = 1;
  let xp    = totalXP;
  let xpNext = xpForLevel(level + 1); // XP necesario para subir de nivel actual

  while (xp >= xpNext) {
    xp    -= xpNext;
    level += 1;
    xpNext = xpForLevel(level + 1);
  }
  return { level, xp, xpNext };
}

// ── Nuevas recompensas XP por acción ─────────────────────
const XP = {
  open_bodega:    8,
  item_per_find:  2,  // promedio 3 items por bodega
  sell_item:      6,
  repair_success: 4,
  accept_trade:   10,
  bj_win:         3,
};

const AVG_ITEMS_PER_BODEGA = 3;

async function run() {
  const client = await pool.connect();
  try {
    const { rows: users } = await client.query(
      `SELECT user_id, level, bodegas_opened, items_sold, items_repaired, trades_done, bj_wins
       FROM user_stats ORDER BY level DESC`
    );

    console.log('\n══ Recalculando niveles ══════════════════════════════\n');

    for (const u of users) {
      // Estimar XP total ganado con las nuevas recompensas
      const estimatedXP =
        (u.bodegas_opened * (XP.open_bodega + AVG_ITEMS_PER_BODEGA * XP.item_per_find)) +
        (u.items_sold     * XP.sell_item) +
        (u.items_repaired * XP.repair_success) +
        (u.trades_done    * XP.accept_trade) +
        (u.bj_wins        * XP.bj_win);

      const { level, xp, xpNext } = calcLevelFromXP(estimatedXP);

      console.log(`Usuario ${u.user_id.slice(0,8)}...`);
      console.log(`  Nivel anterior : ${u.level}`);
      console.log(`  XP estimado    : ${estimatedXP}`);
      console.log(`  Nivel nuevo    : ${level}  (${xp}/${xpNext} XP)`);
      console.log('');

      await client.query(
        `UPDATE user_stats SET level=$2, xp=$3, xp_next=$4 WHERE user_id=$1`,
        [u.user_id, level, xp, xpNext]
      );
    }

    console.log('✅ Todos los usuarios actualizados.\n');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
