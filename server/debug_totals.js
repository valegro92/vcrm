require('dotenv').config();
const { getAll, db } = require('./database/helpers');

async function debugTables() {
    try {
        console.log('Database Type:', db.type);

        // List all tables
        const tables = await getAll("SELECT name FROM sqlite_master WHERE type='table'");
        console.log('Tables:', JSON.stringify(tables, null, 2));

        for (const table of tables) {
            const count = await getAll(`SELECT COUNT(*) as count FROM ${table.name}`);
            console.log(`Table ${table.name}: ${count[0].count} rows`);
        }

        // Specific check for invoices
        const invoices = await getAll('SELECT * FROM invoices');
        console.log('Invoices content:', JSON.stringify(invoices, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

debugTables();
