require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const compression = require('compression');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');

const app = express();

// ── Seguridad y parsing ───────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:4000'],
  credentials: true,
}));
app.use(express.json({ limit: '50kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Rate limiting global ──────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:      parseInt(process.env.RATE_LIMIT_MAX || '2000'),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas peticiones. Intenta más tarde.' },
});
app.use('/api', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de autenticación. Espera 15 minutos.' },
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// ── Frontend estático ─────────────────────────────────────
const path = require('path');
app.use(express.static(path.join(__dirname, '../../juego')));

// ── Rutas ─────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bodegas',  require('./routes/bodegas'));
app.use('/api/items',    require('./routes/items'));
app.use('/api/market',   require('./routes/market'));
app.use('/api/trades',   require('./routes/trades'));
app.use('/api/player',   require('./routes/player'));
app.use('/api/profile',  require('./routes/profile'));
app.use('/api/friends',  require('./routes/friends'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/gifts',          require('./routes/gifts'));
app.use('/api/revestimientos', require('./routes/revestimientos'));

// ── Catálogo público (sin auth) ───────────────────────────
app.get('/api/catalog', (req, res) => {
  res.json(require('./data/catalog'));
});
app.get('/api/catalog/bodegas', (req, res) => {
  res.json(require('./data/bodegas'));
});
app.get('/api/catalog/npcs', (req, res) => {
  res.json(require('./data/npcs').map(n => ({
    id: n.id, name: n.name, title: n.title,
    preferredCategories: n.preferredCategories,
  })));
});

// ── Health check ──────────────────────────────────────────
app.get('/health', async (req, res) => {
  const { pool } = require('./config/db');
  const { redis } = require('./config/redis');
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.json({ status: 'ok', db: 'ok', redis: 'ok', env: process.env.NODE_ENV });
  } catch (err) {
    res.status(503).json({ status: 'error', error: err.message });
  }
});

// ── SPA fallback (cualquier ruta no-API sirve el index.html) ─
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
  }
  res.sendFile(path.join(__dirname, '../../juego/index.html'));
});

// ── Error handler global ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ── Arranque ──────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000');
const server = app.listen(PORT, () => {
  console.log(`\n🚀 BodegaVault API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  DB: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log(`📦 Redis: ${process.env.REDIS_URL}\n`);
  startAuctionJob();
});

// ── Job de subastas (cada 60s) ────────────────────────────
function startAuctionJob() {
  const { pool } = require('./config/db');
  console.log('⏰ Auction job iniciado');

  const resolveAuctions = async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Buscar subastas vencidas
      const { rows: expired } = await client.query(
        `SELECT a.id, a.seller_id, a.item_id, a.current_bid, a.winner_id, a.min_bid
         FROM auctions a
         WHERE a.status = 'active' AND a.ends_at <= NOW()
         FOR UPDATE SKIP LOCKED`
      );

      for (const auction of expired) {
        // Marcar subasta como terminada
        await client.query(
          `UPDATE auctions SET status='ended' WHERE id=$1`,
          [auction.id]
        );
        // Desbloquear item
        await client.query(
          `UPDATE items SET in_auction=FALSE WHERE id=$1`,
          [auction.item_id]
        );

        if (auction.winner_id && auction.current_bid) {
          // Transferir item al ganador
          await client.query(
            `UPDATE items SET user_id=$1, for_sale=FALSE WHERE id=$2`,
            [auction.winner_id, auction.item_id]
          );
          // Dar dinero al vendedor
          await client.query(
            `UPDATE user_stats SET money=money+$1, total_earned=total_earned+$1 WHERE user_id=$2`,
            [auction.current_bid, auction.seller_id]
          );
          // Registrar transacciones
          await client.query(
            `INSERT INTO transactions (user_id,type,amount,item_id,description) VALUES ($1,'auction_sell',$2,$3,'Subasta ganada')`,
            [auction.seller_id, auction.current_bid, auction.item_id]
          );
          // Notificaciones
          const { rows: [itemRow] } = await client.query(
            `SELECT catalog_id FROM items WHERE id=$1`, [auction.item_id]
          );
          const { rows: [sellerRow] } = await client.query(
            `SELECT username FROM users WHERE id=$1`, [auction.seller_id]
          );
          const { rows: [winnerRow] } = await client.query(
            `SELECT username FROM users WHERE id=$1`, [auction.winner_id]
          );
          await client.query(
            `INSERT INTO notifications (user_id,message) VALUES ($1,$2),($3,$4)`,
            [
              auction.seller_id,
              `🏆 Tu subasta terminó. ${winnerRow?.username} ganó con ${auction.current_bid} monedas.`,
              auction.winner_id,
              `🎉 ¡Ganaste la subasta! El objeto ${itemRow?.catalog_id} es tuyo.`,
            ]
          );
          // Colección del ganador
          await client.query(
            `INSERT INTO collection (user_id, catalog_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [auction.winner_id, itemRow?.catalog_id]
          );
        } else {
          // Sin ganador: devolver item al vendedor
          await client.query(
            `INSERT INTO notifications (user_id,message) VALUES ($1,$2)`,
            [auction.seller_id, `📦 Tu subasta terminó sin pujas. El objeto fue devuelto a tu inventario.`]
          );
        }
      }

      await client.query('COMMIT');
      if (expired.length > 0) console.log(`⏰ Auction job: ${expired.length} subastas resueltas`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Auction job error:', err);
    } finally {
      client.release();
    }
  };

  // Ejecutar inmediatamente y cada 60s
  resolveAuctions();
  setInterval(resolveAuctions, 60 * 1000);
}

module.exports = app;
