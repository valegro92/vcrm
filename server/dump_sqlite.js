const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database/crm.db');
const db = new sqlite3.Database(dbPath);

const data = {};

db.serialize(() => {
    const tables = ['users', 'contacts', 'opportunities', 'tasks'];
    let completed = 0;

    tables.forEach(table => {
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
            if (err) {
                console.error(`Error reading ${table}:`, err);
                process.exit(1);
            }

            data[table] = rows;
            completed++;

            if (completed === tables.length) {
                fs.writeFileSync(
                    path.join(__dirname, 'data/legacy_dump.json'),
                    JSON.stringify(data, null, 2)
                );
                console.log('Data dumped to data/legacy_dump.json');
                console.log(`Exported: ${data.users.length} users, ${data.contacts.length} contacts, ${data.opportunities.length} opportunities, ${data.tasks.length} tasks`);
            }
        });
    });
});
