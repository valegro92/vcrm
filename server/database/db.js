const path = require('path');
const fs = require('fs');

// Determine which database to use based on environment
const usePostgres = process.env.DATABASE_URL || (
  process.env.DB_HOST &&
  process.env.DB_USER &&
  process.env.DB_NAME
);

let db;

if (usePostgres) {
  // PostgreSQL Configuration
  const { Pool } = require('pg');

  const baseConfig = process.env.DATABASE_URL
    ? {
      connectionString: process.env.DATABASE_URL,
    }
    : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };

  // Per Sevalla internal connection, non serve SSL
  const poolConfig = {
    ...baseConfig,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };

  console.log('📡 Connecting to PostgreSQL...');
  console.log(`  Connection: ${process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual vars'}`);

  const pool = new Pool(poolConfig);

  // Test connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('❌ PostgreSQL connection error:', err.message);
    } else {
      console.log(`✓ Connected to PostgreSQL database`);
      console.log(`  Database: ${poolConfig.database || 'from DATABASE_URL'}`);
    }
  });

  // Wrapper to make PostgreSQL API similar to SQLite
  db = {
    query: (text, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      return pool.query(text, params, callback);
    },
    get: (text, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      pool.query(text, params, (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows[0]);
      });
    },
    all: (text, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      pool.query(text, params, (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows);
      });
    },
    run: (text, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      pool.query(text, params, (err, result) => {
        if (err) return callback(err);
        // Return context similar to SQLite
        callback.call({ lastID: result.rows[0]?.id, changes: result.rowCount }, err);
      });
    },
    pool: pool,
    type: 'postgres'
  };

} else {
  // SQLite Configuration (fallback for local development)
  const sqlite3 = require('sqlite3').verbose();

  let dbPath = process.env.DB_PATH ||
    (process.env.NODE_ENV === 'production'
      ? '/data/crm.db'
      : path.join(__dirname, 'crm.db'));

  // Ensure directory exists
  let dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Created database directory: ${dbDir}`);
    } catch (err) {
      console.error('Failed to create database directory:', err.message);
      // Fallback to local directory if /data is not writable
      dbPath = path.join(__dirname, 'crm.db');
      dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      console.log(`Using fallback database path: ${dbPath}`);
    }
  }

  const sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log(`✓ Connected to SQLite database at: ${dbPath}`);
    }
  });

  // Enable foreign keys for SQLite
  sqliteDb.run('PRAGMA foreign_keys = ON');

  db = sqliteDb;
  db.type = 'sqlite';
}

module.exports = db;
