// ── Servicio de Logros ────────────────────────────────────

// Comprueba y desbloquea logros según el estado actual del usuario.
// Recibe un client de transacción activo.
async function checkAchievements(client, userId) {
  // Leer stats completos
  const { rows: [stats] } = await client.query(
    `SELECT us.money, us.level, us.bodegas_opened, us.items_sold,
            us.items_repaired, us.bj_wins, us.bj_best_streak, us.total_earned, us.poker_royal_flushes
     FROM user_stats us WHERE us.user_id = $1`,
    [userId]
  );
  if (!stats) return [];

  // Contadores de colección e ítems por rareza
  const { rows: colRow } = await client.query(
    `SELECT COUNT(*) AS total FROM collection WHERE user_id = $1`, [userId]
  );
  const { rows: rarityRows } = await client.query(
    `SELECT rarity, COUNT(*) AS cnt FROM items WHERE user_id = $1 GROUP BY rarity`, [userId]
  );
  const byRarity = {};
  rarityRows.forEach(r => { byRarity[r.rarity] = parseInt(r.cnt); });

  // Logros ya desbloqueados
  const { rows: unlocked } = await client.query(
    `SELECT achievement_id FROM achievements WHERE user_id = $1`, [userId]
  );
  const unlockedSet = new Set(unlocked.map(r => r.achievement_id));

  // Definición de condiciones
  const money        = parseInt(stats.money        || 0);
  const level        = parseInt(stats.level        || 1);
  const bodegas      = parseInt(stats.bodegas_opened || 0);
  const sold         = parseInt(stats.items_sold    || 0);
  const repaired     = parseInt(stats.items_repaired || 0);
  const bjWins       = parseInt(stats.bj_wins       || 0);
  const bjStreak     = parseInt(stats.bj_best_streak || 0);
  const collCount    = parseInt(colRow[0].total     || 0);

  const conditions = [
    { id:'first_bodega',    met: bodegas >= 1 },
    { id:'bodega_10',       met: bodegas >= 10 },
    { id:'first_rare',      met: (byRarity.rare      || 0) >= 1 },
    { id:'first_epic',      met: (byRarity.epic      || 0) >= 1 },
    { id:'first_legendary', met: (byRarity.legendary || 0) >= 1 },
    { id:'first_unique',    met: (byRarity.unique    || 0) >= 1 },
    { id:'rich',            met: money >= 10000 },
    { id:'millionaire',     met: money >= 1000000 },
    { id:'sold_10',         met: sold >= 10 },
    { id:'repaired_5',      met: repaired >= 5 },
    { id:'bj_10',           met: bjWins >= 10 },
    { id:'bj_streak5',      met: bjStreak >= 5 },
    { id:'level_5',         met: level >= 5 },
    { id:'level_10',        met: level >= 10 },
    { id:'level_25',        met: level >= 25 },
    { id:'collector_20',    met: collCount >= 20 },
    { id:'collector_all',   met: collCount >= 100 },
    { id:'level_50',        met: level >= 50 },
    { id:'bodega_50',       met: bodegas >= 50 },
    { id:'poker_royal',     met: (stats.poker_royal_flushes || 0) >= 1 },
  ];

  const newlyUnlocked = [];
  for (const { id, met } of conditions) {
    if (met && !unlockedSet.has(id)) {
      await client.query(
        `INSERT INTO achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, id]
      );
      // Notificación
      const icons = {
        first_bodega:'🔑', bodega_10:'🏭', first_rare:'💙', first_epic:'💜',
        first_legendary:'🏆', first_unique:'💫', rich:'💰', millionaire:'🤑',
        sold_10:'💼', repaired_5:'🔧', bj_10:'🃏', bj_streak5:'🔥',
        level_5:'⭐', level_10:'🌟', level_25:'✨', collector_20:'📚', collector_all:'🎖️',
        level_50:'👑', bodega_50:'🏪', poker_royal:'🃏',
      };
      const names = {
        first_bodega:'Primera Bodega', bodega_10:'Bodeguero', first_rare:'Primer Raro',
        first_epic:'Primer Épico', first_legendary:'Primer Legendario', first_unique:'Objeto Único',
        rich:'Rico', millionaire:'Millonario', sold_10:'Comerciante', repaired_5:'Manitas',
        bj_10:'Tahúr', bj_streak5:'Racha de Fuego', level_5:'Aprendiz', level_10:'Veterano',
        level_25:'Maestro', collector_20:'Coleccionista', collector_all:'Completista',
        level_50:'Leyenda', bodega_50:'Rey de las Bodegas', poker_royal:'Sangre Real',
      };
      await client.query(
        `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
        [userId, `${icons[id] || '🏅'} ¡Logro desbloqueado: ${names[id] || id}!`]
      );
      newlyUnlocked.push(id);

      const TITLE_ACHIEVEMENTS = {
        collector_all: 'Pansita Llena Corazon Contento',
        level_50:      'Niño Rata',
        millionaire:   'Goloso',
        poker_royal:   'La Escalera es la Clave',
        bodega_50:     'Comprador Compulsivo',
      };
      if (TITLE_ACHIEVEMENTS[id]) {
        await client.query(
          `INSERT INTO user_titles (user_id, title_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [userId, id]
        );
        await client.query(
          `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
          [userId, `🎖️ ¡Título desbloqueado: "${TITLE_ACHIEVEMENTS[id]}"! Equípalo desde tus logros.`]
        );
      }
    }
  }

  return newlyUnlocked;
}

module.exports = { checkAchievements };
