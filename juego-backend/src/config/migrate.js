require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const migrationsDir = path.join(__dirname, '../../migrations');
  const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  try {
    // Crear tabla de control si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    for (const file of files) {
      const { rows } = await pool.query('SELECT 1 FROM _migrations WHERE name=$1', [file]);
      if (rows.length > 0) {
        console.log(`⏭️  Saltando migración ya ejecutada: ${file}`);
        continue;
      }
      console.log(`🔧 Ejecutando migración: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
      await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      console.log(`✅ ${file} completada`);
    }
  } catch (err) {
    console.error('❌ Error en migración:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
