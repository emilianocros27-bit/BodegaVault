const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'bodegavault',
  user:     process.env.DB_USER     || 'bodega',
  password: process.env.DB_PASSWORD || 'bodega_secret',
  max:      20,          // pool máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message);
});

// Helper: ejecutar query con log en dev
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (process.env.NODE_ENV === 'development') {
    const ms = Date.now() - start;
    if (ms > 100) console.log(`🐢 Slow query (${ms}ms):`, text.slice(0, 80));
  }
  return res;
}

// Helper: transacción
async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, withTransaction };
