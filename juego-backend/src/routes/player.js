const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const { withTransaction, query } = require('../config/db');
const { applyXP, XP_REWARDS, levelRewards } = require('../services/xp');
const { leaderboardTop, leaderboardRank, leaderboardUpdate } = require('../config/redis');
const ACHIEVEMENTS   = require('../data/achievements');
const { checkAchievements } = require('../services/achievements');
const EXCLUSIVE_ITEMS = require('../data/exclusiveItems');

// ── POST /api/player/daily ── Recompensa diaria ───────────
router.post('/daily', requireAuth, async (req, res) => {
  try {
    const result = await withTransaction(async (client) => {
      const { rows: [stats] } = await client.query(
        `SELECT money, level, xp, xp_next, daily_last FROM user_stats WHERE user_id=$1 FOR UPDATE`,
        [req.user.id]
      );
      if (stats.daily_last) {
        const lastDate = new Date(stats.daily_last);
        const now      = new Date();
        if (lastDate.toDateString() === now.toDateString())
          throw Object.assign(new Error('Ya reclamaste la recompensa hoy'), { status:400 });
      }

      const amount = 100 + stats.level * 20;
      const xpR    = applyXP(+stats.level, +stats.xp, +stats.xp_next, XP_REWARDS.daily_claim);
      const levelRewardsResult = await processLevelRewards(client, req.user.id, xpR.levelsGained, stats.level);

      await client.query(
        `UPDATE user_stats SET
          money=money+$2+$3, xp=$4, level=$5, xp_next=$6,
          daily_last=NOW(), total_earned=total_earned+$2+$3,
          level_rewards_claimed=$7
         WHERE user_id=$1`,
        [req.user.id, amount, levelRewardsResult.coinsGained, xpR.xp, xpR.level, xpR.xpNext,
         Math.max(stats.level_rewards_claimed || 0, xpR.level)]
      );
      await client.query(
        `INSERT INTO transactions (user_id,type,amount,description) VALUES ($1,'daily',$2,'Recompensa diaria')`,
        [req.user.id, amount]
      );
      await client.query(
        `INSERT INTO notifications (user_id,message) VALUES ($1,$2)`,
        [req.user.id, `🎁 Recompensa diaria reclamada: +${amount} monedas`]
      );

      await checkAchievements(client, req.user.id);
      return { amount, xpResult: xpR, levelRewards: levelRewardsResult.rewards, xp_gained: XP_REWARDS.daily_claim };
    });

    res.json({ message: '¡Recompensa diaria reclamada!', ...result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('daily error:', err);
    res.status(500).json({ error: 'Error al reclamar recompensa' });
  }
});

// ── POST /api/player/roulette ── Ruleta horaria ───────────
router.post('/roulette', requireAuth, async (req, res) => {
  const PRIZES = [
    { type:'nothing', label:'Sin suerte hoy…',  weight:40 },
    { type:'xp',      label:'+150 XP',          weight:25, value:150 },
    { type:'xp',      label:'+300 XP',          weight:10, value:300 },
    { type:'coins',   label:'+200 monedas',      weight:15, value:200 },
    { type:'coins',   label:'+500 monedas',      weight:7,  value:500 },
    { type:'bodega',  label:'¡Bodega gratis!',   weight:3,  value:'basica' },
  ];

  try {
    const result = await withTransaction(async (client) => {
      const { rows: [stats] } = await client.query(
        `SELECT money, level, xp, xp_next, roulette_last, bodega_vouchers FROM user_stats
         WHERE user_id=$1 FOR UPDATE`,
        [req.user.id]
      );

      // Cooldown 60 minutos
      if (stats.roulette_last) {
        const diff = Date.now() - new Date(stats.roulette_last).getTime();
        if (diff < 3600000) {
          const waitMin = Math.ceil((3600000 - diff) / 60000);
          throw Object.assign(
            new Error(`Ruleta disponible en ${waitMin} minuto${waitMin!==1?'s':''}`),
            { status:429, waitMin }
          );
        }
      }

      // Girar ruleta
      const total  = PRIZES.reduce((s, p) => s + p.weight, 0);
      let rand     = Math.random() * total;
      let prize    = PRIZES[0];
      for (const p of PRIZES) { rand -= p.weight; if (rand <= 0) { prize = p; break; } }

      // Aplicar XP base por girar
      const xpR = applyXP(+stats.level, +stats.xp, +stats.xp_next, XP_REWARDS.roulette_spin + (prize.type==='xp' ? prize.value : 0));
      const levelRewardsResult = await processLevelRewards(client, req.user.id, xpR.levelsGained, stats.level);

      let moneyDelta  = 0;
      let newVouchers = stats.bodega_vouchers;

      if (prize.type === 'coins')  moneyDelta = prize.value;
      if (prize.type === 'bodega') newVouchers++;

      await client.query(
        `UPDATE user_stats SET
          roulette_last=NOW(), xp=$2, level=$3, xp_next=$4,
          money=money+$5, bodega_vouchers=$6,
          total_earned=total_earned+GREATEST($5,0),
          level_rewards_claimed=$7
         WHERE user_id=$1`,
        [req.user.id, xpR.xp, xpR.level, xpR.xpNext,
         moneyDelta + levelRewardsResult.coinsGained,
         newVouchers + levelRewardsResult.vouchersGained,
         Math.max(stats.level_rewards_claimed || 0, xpR.level)]
      );

      if (moneyDelta > 0) {
        await client.query(
          `INSERT INTO transactions (user_id,type,amount,description) VALUES ($1,'roulette',$2,$3)`,
          [req.user.id, moneyDelta, `Ruleta: ${prize.label}`]
        );
      }

      const rouletteXpGained = XP_REWARDS.roulette_spin + (prize.type === 'xp' ? prize.value : 0);
      return { prize, xpResult: xpR, levelRewards: levelRewardsResult.rewards, xp_gained: rouletteXpGained };
    });

    res.json({ message: '¡Ruleta girada!', ...result });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message, waitMin: err.waitMin });
    console.error('roulette error:', err);
    res.status(500).json({ error: 'Error al girar la ruleta' });
  }
});

// ── GET /api/player/roulette-status ─────────────────────
router.get('/roulette-status', requireAuth, async (req, res) => {
  const { rows: [stats] } = await query(
    `SELECT roulette_last FROM user_stats WHERE user_id=$1`, [req.user.id]
  );
  const last     = stats.roulette_last ? new Date(stats.roulette_last).getTime() : 0;
  const diff     = Date.now() - last;
  const ready    = diff >= 3600000;
  const waitMs   = ready ? 0 : 3600000 - diff;
  res.json({ ready, waitMs, rouletteLast: stats.roulette_last });
});

// ── POST /api/player/use-voucher ── Usar bodega voucher ──
router.post('/use-voucher', requireAuth, async (req, res) => {
  const { bodegaId } = req.body;
  try {
    const { rows: [stats] } = await query(
      `SELECT bodega_vouchers FROM user_stats WHERE user_id=$1 FOR UPDATE`,
      [req.user.id]
    );
    if (!stats.bodega_vouchers || stats.bodega_vouchers < 1)
      return res.status(400).json({ error: 'No tienes bodegas gratuitas' });

    await query(
      `UPDATE user_stats SET bodega_vouchers=bodega_vouchers-1 WHERE user_id=$1`,
      [req.user.id]
    );
    res.json({ used: true, remaining: stats.bodega_vouchers - 1, bodegaId });
  } catch (err) {
    console.error('use voucher error:', err);
    res.status(500).json({ error: 'Error al usar bodega gratuita' });
  }
});

// ── GET /api/player/collection ────────────────────────────
router.get('/collection', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT catalog_id, first_found_at FROM collection WHERE user_id=$1 ORDER BY first_found_at DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// ── GET /api/player/achievements ─────────────────────────
router.get('/achievements', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT achievement_id, unlocked_at FROM achievements WHERE user_id=$1`,
    [req.user.id]
  );
  const unlocked = rows.map(r => r.achievement_id);
  res.json({ unlocked, definitions: ACHIEVEMENTS });
});

// ── GET /api/player/notifications ────────────────────────
router.get('/notifications', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30`,
    [req.user.id]
  );
  await query(`UPDATE notifications SET read=TRUE WHERE user_id=$1 AND read=FALSE`, [req.user.id]);
  res.json(rows);
});

// ── GET /api/player/transactions ─────────────────────────
router.get('/transactions', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT * FROM transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json(rows);
});

// ── GET /api/player/leaderboard ───────────────────────────
router.get('/leaderboard', requireAuth, async (req, res) => {
  const raw  = await leaderboardTop(20);
  const rank = await leaderboardRank(req.user.id);
  const top  = [];
  for (let i = 0; i < raw.length; i += 2) {
    const userId = raw[i];
    const score  = parseInt(raw[i+1]);
    const { rows } = await query(`SELECT username, avatar FROM users WHERE id=$1`, [userId]);
    if (rows.length) top.push({ rank: top.length + 1, userId, username: rows[0].username, avatar: rows[0].avatar, level: score });
  }
  res.json({ top, myRank: rank !== null ? rank + 1 : null });
});

// ── POST /api/player/blackjack ── Resultado de partida ────
router.post('/blackjack', requireAuth, async (req, res) => {
  const { outcome, bet, streak } = req.body;
  if (!['win','lose','push'].includes(outcome)) return res.status(400).json({ error: 'outcome inválido' });
  if (!Number.isInteger(bet) || bet < 10)       return res.status(400).json({ error: 'apuesta inválida' });

  try {
    const result = await withTransaction(async (client) => {
      const { rows: [stats] } = await client.query(
        `SELECT money, level, xp, xp_next, bj_wins, bj_losses, bj_best_streak FROM user_stats WHERE user_id=$1 FOR UPDATE`,
        [req.user.id]
      );
      if (stats.money < bet && outcome !== 'win')
        throw Object.assign(new Error('Sin fondos suficientes'), { status:402 });

      let moneyDelta = 0;
      let xpGained   = 0;
      if (outcome === 'win') {
        const mult  = 1 + Math.min((streak || 1) - 1, 4) * 0.25;
        const won   = Math.round(bet * mult);
        moneyDelta  = won;
        xpGained    = XP_REWARDS.bj_win + (streak || 1) * XP_REWARDS.bj_win_streak_bonus;
      } else if (outcome === 'push') {
        moneyDelta  = 0;
      } else {
        moneyDelta  = -bet;
      }

      const newBjWins    = outcome === 'win'  ? stats.bj_wins   + 1 : stats.bj_wins;
      const newBjLosses  = outcome === 'lose' ? stats.bj_losses + 1 : stats.bj_losses;
      const newBestStreak = Math.max(stats.bj_best_streak, streak || 0);
      const xpR = applyXP(+stats.level, +stats.xp, +stats.xp_next, xpGained);
      const levelRewardsResult = await processLevelRewards(client, req.user.id, xpR.levelsGained, stats.level);

      await client.query(
        `UPDATE user_stats SET
          money=money+$2+$3, bj_wins=$4, bj_losses=$5, bj_best_streak=$6,
          xp=$7, level=$8, xp_next=$9,
          total_earned = total_earned + GREATEST($2,0),
          total_spent  = total_spent  + GREATEST(-$2,0),
          level_rewards_claimed=$10
         WHERE user_id=$1`,
        [req.user.id, moneyDelta, levelRewardsResult.coinsGained,
         newBjWins, newBjLosses, newBestStreak, xpR.xp, xpR.level, xpR.xpNext,
         Math.max(stats.level_rewards_claimed || 0, xpR.level)]
      );

      if (moneyDelta !== 0) {
        await client.query(
          `INSERT INTO transactions (user_id,type,amount,description) VALUES ($1,$2,$3,$4)`,
          [req.user.id, outcome==='win'?'bj_win':'bj_loss', moneyDelta, `Blackjack: ${outcome}`]
        );
      }

      await leaderboardUpdate(req.user.id, xpR.level);
      await checkAchievements(client, req.user.id);
      return { moneyDelta, xpResult: xpR, levelRewards: levelRewardsResult.rewards, xp_gained: xpGained };
    });

    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('blackjack save error:', err);
    res.status(500).json({ error: 'Error al guardar partida' });
  }
});

// ── POST /api/player/poker ── Resultado de partida ────────
router.post('/poker', requireAuth, async (req, res) => {
  const { outcome, bet, blindsWon } = req.body;
  if (!['win','lose'].includes(outcome))          return res.status(400).json({ error: 'outcome inválido' });
  if (!Number.isInteger(bet) || bet < 100)        return res.status(400).json({ error: 'apuesta inválida' });
  if (!Number.isInteger(blindsWon) || blindsWon < 0 || blindsWon > 3)
    return res.status(400).json({ error: 'blindsWon inválido' });

  const XP_BY_BLINDS = [2, 5, 12, 25];

  try {
    const result = await withTransaction(async (client) => {
      const { rows: [stats] } = await client.query(
        `SELECT money, level, xp, xp_next FROM user_stats WHERE user_id=$1 FOR UPDATE`,
        [req.user.id]
      );

      const moneyDelta = outcome === 'win' ? bet * 3 : -bet;
      const xpGained   = XP_BY_BLINDS[blindsWon] || 2;

      const xpR = applyXP(+stats.level, +stats.xp, +stats.xp_next, xpGained);
      const levelRewardsResult = await processLevelRewards(client, req.user.id, xpR.levelsGained, stats.level);

      await client.query(
        `UPDATE user_stats SET
          money=money+$2+$3, xp=$4, level=$5, xp_next=$6,
          total_earned = total_earned + GREATEST($2,0),
          total_spent  = total_spent  + GREATEST(-$2,0),
          level_rewards_claimed=$7
         WHERE user_id=$1`,
        [req.user.id, moneyDelta, levelRewardsResult.coinsGained,
         xpR.xp, xpR.level, xpR.xpNext,
         Math.max(stats.level_rewards_claimed || 0, xpR.level)]
      );

      await client.query(
        `INSERT INTO transactions (user_id,type,amount,description) VALUES ($1,$2,$3,$4)`,
        [req.user.id, outcome==='win'?'poker_win':'poker_loss', moneyDelta,
         `BodegaPoker: ${outcome} (${blindsWon}/3 blinds)`]
      );

      await leaderboardUpdate(req.user.id, xpR.level);
      await checkAchievements(client, req.user.id);
      return { moneyDelta, xpResult: xpR, levelRewards: levelRewardsResult.rewards, xp_gained: xpGained };
    });

    res.json(result);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('poker save error:', err);
    res.status(500).json({ error: 'Error al guardar partida de póker' });
  }
});

// ── HELPER: Procesar recompensas de niveles ganados ───────
async function processLevelRewards(client, userId, levelsGained, prevLevel) {
  const allRewards   = [];
  let coinsGained    = 0;
  let vouchersGained = 0;

  for (const lvl of levelsGained) {
    const rewards = levelRewards(lvl);
    for (const reward of rewards) {
      allRewards.push({ ...reward, level: lvl });

      if (reward.type === 'coins') {
        coinsGained += reward.amount;
      }
      if (reward.type === 'bodega') {
        vouchersGained++;
        await client.query(
          `UPDATE user_stats SET bodega_vouchers=bodega_vouchers+1 WHERE user_id=$1`,
          [userId]
        );
      }
      if (reward.type === 'item') {
        const excl = EXCLUSIVE_ITEMS[reward.catalogId];
        if (excl) {
          const value = Math.floor(excl.baseValue * (excl.rarity === 'unique' ? 1.0 : 0.9));
          await client.query(
            `INSERT INTO items (user_id, catalog_id, rarity, condition, grade, identified, value, is_exclusive)
             VALUES ($1, $2, $3, 'new', 10, TRUE, $4, TRUE)`,
            [userId, excl.id, excl.rarity, value]
          );
          await client.query(
            `INSERT INTO collection (user_id, catalog_id) VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [userId, excl.id]
          );
        }
      }
    }

    if (rewards.length > 0) {
      const desc = rewards.map(r => {
        if (r.type === 'coins')  return `+${r.amount} monedas`;
        if (r.type === 'bodega') return `Bodega gratis (${r.id})`;
        if (r.type === 'item')   return `Objeto exclusivo: ${EXCLUSIVE_ITEMS[r.catalogId]?.name || r.catalogId}`;
        if (r.type === 'showcase_slots') return `+${r.count} slots de Vitrina`;
        return r.type;
      }).join(', ');
      await client.query(
        `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
        [userId, `🌟 ¡Nivel ${lvl}! Recompensas: ${desc}`]
      );
    }
  }

  return { rewards: allRewards, coinsGained, vouchersGained };
}

module.exports = router;
