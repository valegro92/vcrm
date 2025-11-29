const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database/crm.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    const tables = ['users', 'contacts', 'opportunities', 'tasks'];

    tables.forEach(table => {
        db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
            if (err) {
                console.log(`${table}: Error - ${err.message}`);
            } else {
                console.log(`${table}: ${row.count} records`);
            }
        });
    });
});
