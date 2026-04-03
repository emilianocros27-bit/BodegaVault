require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const { pool } = require('./db');

async function migrate() {
  const sqlPath = path.join(__dirname, '../../migrations/001_initial.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  try {
    console.log('🔧 Ejecutando migración...');
    await pool.query(sql);
    console.log('✅ Migración completada');
  } catch (err) {
    console.error('❌ Error en migración:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
