const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: false,
});

redis.on('connect',   () => console.log('✅ Redis conectado'));
redis.on('error',     (err) => console.error('❌ Redis error:', err.message));
redis.on('reconnecting', () => console.log('🔄 Redis reconectando...'));

// ── Helpers de caché ──────────────────────────────────────
const CACHE_TTL = {
  session:    60 * 60 * 24 * 7,   // 7 días
  gameState:  60 * 5,              // 5 min
  leaderboard: 60 * 2,            // 2 min
  catalog:    60 * 60,            // 1 hora
};

async function cacheGet(key) {
  const val = await redis.get(key);
  return val ? JSON.parse(val) : null;
}

async function cacheSet(key, value, ttl = 300) {
  await redis.set(key, JSON.stringify(value), 'EX', ttl);
}

async function cacheDel(key) {
  await redis.del(key);
}

async function cacheGetOrSet(key, fn, ttl = 300) {
  const cached = await cacheGet(key);
  if (cached !== null) return cached;
  const value = await fn();
  await cacheSet(key, value, ttl);
  return value;
}

// ── Leaderboard (Sorted Set) ──────────────────────────────
async function leaderboardUpdate(userId, score) {
  await redis.zadd('leaderboard:level', score, userId);
}

async function leaderboardTop(n = 20) {
  return redis.zrevrange('leaderboard:level', 0, n - 1, 'WITHSCORES');
}

async function leaderboardRank(userId) {
  return redis.zrevrank('leaderboard:level', userId);
}

module.exports = {
  redis,
  CACHE_TTL,
  cacheGet, cacheSet, cacheDel, cacheGetOrSet,
  leaderboardUpdate, leaderboardTop, leaderboardRank,
};
