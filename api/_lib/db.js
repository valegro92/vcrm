// Database connection helper for Vercel Serverless
// Supporta sia PostgreSQL (Neon/Vercel) che in-memory per sviluppo

const { Pool } = require('pg');

let pool;

function getPool() {
  if (!pool) {
    // Usa DATABASE_URL da variabili d'ambiente Vercel
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

async function query(text, params) {
  const client = getPool();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

module.exports = { query, getPool };
