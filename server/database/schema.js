const db = require('./db');

const createTables = () => {
  return new Promise((resolve, reject) => {
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
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('All tables created successfully');
          resolve();
        }
      });
    });
  });
};

module.exports = { createTables };
