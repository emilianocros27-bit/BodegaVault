const jwt  = require('jsonwebtoken');
const { query } = require('../config/db');
const { redis } = require('../config/redis');

const JWT_SECRET  = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

// ── Generar token ─────────────────────────────────────────
function signToken(userId, username) {
  const jti = require('uuid').v4();
  return {
    token: jwt.sign({ sub: userId, username, jti }, JWT_SECRET, { expiresIn: JWT_EXPIRES }),
    jti,
  };
}

// ── Middleware de autenticación ───────────────────────────
async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer '))
    return res.status(401).json({ error: 'Token requerido' });

  const token = header.slice(7);
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  // Verificar blacklist (logout)
  const blacklisted = await redis.get(`bl:${payload.jti}`);
  if (blacklisted) return res.status(401).json({ error: 'Sesión cerrada' });

  // Verificar que el usuario existe y no está baneado
  const { rows } = await query('SELECT id, username, is_banned FROM users WHERE id = $1', [payload.sub]);
  if (!rows.length) return res.status(401).json({ error: 'Usuario no encontrado' });
  if (rows[0].is_banned) return res.status(403).json({ error: 'Cuenta suspendida' });

  req.user = { id: rows[0].id, username: rows[0].username };
  next();
}

// ── Invalidar token (logout) ──────────────────────────────
async function blacklistToken(jti, exp) {
  const ttl = exp - Math.floor(Date.now() / 1000);
  if (ttl > 0) await redis.set(`bl:${jti}`, '1', 'EX', ttl);
}

module.exports = { signToken, requireAuth, blacklistToken };
