const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const { body } = require('express-validator');
const { query, withTransaction } = require('../config/db');
const { signToken, requireAuth, blacklistToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { leaderboardUpdate } = require('../config/redis');
const { xpForLevel } = require('../services/xp');

// ── POST /api/auth/register ───────────────────────────────
router.post('/register',
  body('username').trim().isLength({ min:3, max:30 }).matches(/^[a-zA-Z0-9_]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min:6 }),
  validate,
  async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const hash = await bcrypt.hash(password, 12);
      const user = await withTransaction(async (client) => {
        const { rows } = await client.query(
          `INSERT INTO users (username, email, password_hash)
           VALUES ($1, $2, $3) RETURNING id, username, email, created_at`,
          [username, email, hash]
        );
        const u = rows[0];
        // Crear stats iniciales
        await client.query(
          `INSERT INTO user_stats (user_id, money, level, xp, xp_next)
           VALUES ($1, 500, 1, 0, $2)`,
          [u.id, xpForLevel(2)]
        );
        // Notificación de bienvenida
        await client.query(
          `INSERT INTO notifications (user_id, message) VALUES ($1, $2)`,
          [u.id, '🎉 ¡Bienvenido a BodegaVault! Tienes 500 monedas para empezar.']
        );
        return u;
      });

      await leaderboardUpdate(user.id, 1);
      const { token } = signToken(user.id, user.username);

      res.status(201).json({
        message: '¡Cuenta creada!',
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err) {
      if (err.code === '23505') {
        const field = err.detail.includes('username') ? 'username' : 'email';
        return res.status(409).json({ error: `El ${field} ya está en uso` });
      }
      console.error('register error:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// ── POST /api/auth/login ──────────────────────────────────
router.post('/login',
  body('login').notEmpty(),      // puede ser email o username
  body('password').notEmpty(),
  validate,
  async (req, res) => {
    const { login, password } = req.body;
    try {
      const isEmail = login.includes('@');
      const field   = isEmail ? 'email' : 'username';
      const { rows } = await query(
        `SELECT u.id, u.username, u.email, u.password_hash, u.is_banned
         FROM users u WHERE u.${field} = $1`,
        [isEmail ? login.toLowerCase() : login]
      );
      if (!rows.length) return res.status(401).json({ error: 'Credenciales incorrectas' });
      const user = rows[0];
      if (user.is_banned) return res.status(403).json({ error: 'Cuenta suspendida' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

      await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
      const { token } = signToken(user.id, user.username);

      res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email },
      });
    } catch (err) {
      console.error('login error:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
);

// ── POST /api/auth/logout ─────────────────────────────────
router.post('/logout', requireAuth, async (req, res) => {
  const header = req.headers.authorization.slice(7);
  const jwt    = require('jsonwebtoken');
  const payload = jwt.decode(header);
  if (payload?.jti) await blacklistToken(payload.jti, payload.exp);
  res.json({ message: 'Sesión cerrada' });
});

// ── GET /api/auth/me ──────────────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT u.id, u.username, u.email, u.avatar, u.created_at, u.last_login,
            s.money, s.level, s.xp, s.xp_next,
            s.bodegas_opened, s.items_sold, s.items_repaired, s.trades_done,
            s.bj_wins, s.bj_losses, s.bj_best_streak,
            s.total_earned, s.total_spent, s.daily_last,
            s.roulette_last, s.bodega_vouchers, s.level_rewards_claimed
     FROM users u JOIN user_stats s ON s.user_id = u.id
     WHERE u.id = $1`,
    [req.user.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(rows[0]);
});

module.exports = router;
