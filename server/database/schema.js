const db = require('./db');

const createTables = () => {
  return new Promise(async (resolve, reject) => {
    const isPostgres = db.type === 'postgres';

    try {
      if (isPostgres) {
        // PostgreSQL schema
        await createPostgresTables();
      } else {
        // SQLite schema  
        createSQLiteTables(resolve, reject);
      }

      if (isPostgres) {
        console.log('All PostgreSQL tables created successfully');
        resolve();
      }
    } catch (err) {
      console.error('Error creating tables:', err);
      reject(err);
    }
  });
};

const createPostgresTables = async () => {
  const client = db.pool;

  // Users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      "fullName" VARCHAR(255),
      avatar VARCHAR(10),
      phone VARCHAR(50),
      company VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Contacts table
  await client.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      value DECIMAL(10, 2) DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Lead',
      avatar VARCHAR(10),
      "lastContact" DATE,
      notes TEXT,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Opportunities table
  await client.query(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      value DECIMAL(10, 2) DEFAULT 0,
      stage VARCHAR(50) DEFAULT 'Lead',
      probability INTEGER DEFAULT 0,
      "openDate" DATE,
      "closeDate" DATE,
      "expectedInvoiceDate" DATE,
      "expectedPaymentDate" DATE,
      owner VARCHAR(255),
      "contactId" INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      "originalStage" VARCHAR(50),
      notes TEXT,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add expectedInvoiceDate and expectedPaymentDate columns if they don't exist (for existing databases)
  await client.query(`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS "expectedInvoiceDate" DATE`).catch(() => {});
  await client.query(`ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS "expectedPaymentDate" DATE`).catch(() => {});

  // Tasks table
  await client.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(50) DEFAULT 'Chiamata',
      priority VARCHAR(50) DEFAULT 'Media',
      "dueDate" DATE,
      status VARCHAR(50) DEFAULT 'Da fare',
      "contactId" INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      "opportunityId" INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      description TEXT,
      "completedAt" TIMESTAMP,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications table
  await client.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      "entityType" VARCHAR(50),
      "entityId" INTEGER,
      "isRead" INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notes table
  await client.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      "entityType" VARCHAR(50) NOT NULL,
      "entityId" INTEGER NOT NULL,
      content TEXT NOT NULL,
      "createdBy" INTEGER,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Invoices table (Scadenziario Fatture)
  await client.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      "invoiceNumber" VARCHAR(50) NOT NULL,
      "opportunityId" INTEGER REFERENCES opportunities(id) ON DELETE SET NULL,
      "contactId" INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      type VARCHAR(20) DEFAULT 'emessa',
      amount DECIMAL(10, 2) NOT NULL,
      "issueDate" DATE NOT NULL,
      "dueDate" DATE NOT NULL,
      "paidDate" DATE,
      status VARCHAR(20) DEFAULT 'da_emettere',
      notes TEXT,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Monthly targets table (Target mensili per fatturato)
  await client.query(`
    CREATE TABLE IF NOT EXISTS monthly_targets (
      id SERIAL PRIMARY KEY,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      target DECIMAL(10, 2) NOT NULL DEFAULT 0,
      "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
      "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(year, month, "userId")
    )
  `);

  // Drop old yearly_targets if exists and migrate
  await client.query(`DROP TABLE IF EXISTS yearly_targets`).catch(() => {});
};

const createSQLiteTables = (resolve, reject) => {
  db.serialize(() => {
    // Users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullName TEXT,
        avatar TEXT,
        phone TEXT,
        company TEXT,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add phone and company columns if they don't exist (for existing databases)
    db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, (err) => {
      // Ignore error if column already exists
    });
    db.run(`ALTER TABLE users ADD COLUMN company TEXT`, (err) => {
      // Ignore error if column already exists
    });

    // Contacts table
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        company TEXT,
        email TEXT,
        phone TEXT,
        value REAL DEFAULT 0,
        status TEXT DEFAULT 'Lead',
        avatar TEXT,
        lastContact DATE,
        notes TEXT,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Opportunities table
    db.run(`
      CREATE TABLE IF NOT EXISTS opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT,
        value REAL DEFAULT 0,
        stage TEXT DEFAULT 'Lead',
        probability INTEGER DEFAULT 0,
        openDate DATE,
        closeDate DATE,
        expectedInvoiceDate DATE,
        expectedPaymentDate DATE,
        owner TEXT,
        contactId INTEGER,
        userId INTEGER,
        originalStage TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE SET NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Add expectedInvoiceDate and expectedPaymentDate columns if they don't exist (for existing databases)
    db.run(`ALTER TABLE opportunities ADD COLUMN expectedInvoiceDate DATE`, (err) => {
      // Ignore error if column already exists
    });
    db.run(`ALTER TABLE opportunities ADD COLUMN expectedPaymentDate DATE`, (err) => {
      // Ignore error if column already exists
    });

    // Tasks table
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT DEFAULT 'Chiamata',
        priority TEXT DEFAULT 'Media',
        dueDate DATE,
        status TEXT DEFAULT 'Da fare',
        contactId INTEGER,
        opportunityId INTEGER,
        userId INTEGER,
        description TEXT,
        completedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE SET NULL,
        FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE SET NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Notifications table
    db.run(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT,
        entityType TEXT,
        entityId INTEGER,
        isRead INTEGER DEFAULT 0,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entityType TEXT NOT NULL,
        entityId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdBy INTEGER,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Invoices table (Scadenziario Fatture)
    db.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        invoiceNumber TEXT NOT NULL,
        opportunityId INTEGER,
        contactId INTEGER,
        type TEXT DEFAULT 'emessa',
        amount REAL NOT NULL,
        issueDate DATE NOT NULL,
        dueDate DATE NOT NULL,
        paidDate DATE,
        status TEXT DEFAULT 'da_emettere',
        notes TEXT,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (opportunityId) REFERENCES opportunities(id) ON DELETE SET NULL,
        FOREIGN KEY (contactId) REFERENCES contacts(id) ON DELETE SET NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Monthly targets table (Target mensili per fatturato)
    db.run(`
      CREATE TABLE IF NOT EXISTS monthly_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        target REAL NOT NULL DEFAULT 0,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE(year, month, userId)
      )
    `);

    // Drop old yearly_targets if exists
    db.run(`DROP TABLE IF EXISTS yearly_targets`, (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('All tables created successfully');
        resolve();
      }
    });
  });
};

module.exports = { createTables };
