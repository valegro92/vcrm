const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const runAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

async function debug() {
    try {
        console.log('--- Checking Invoices Table ---');
        const invoices = await runAll('SELECT id, amount, status, dueDate, type FROM invoices');
        console.log('Invoices found:', invoices.length);
        console.table(invoices);

        console.log('\n--- Running Stats Query ---');
        const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(CAST(amount AS NUMERIC)), 0) as totalAmount,
          COALESCE(SUM(CASE WHEN status = 'pagata' THEN CAST(amount AS NUMERIC) ELSE 0 END), 0) as paidAmount,
          COALESCE(SUM(CASE WHEN (status = 'emessa' OR status = 'da_pagare') AND date(dueDate) < date('now') THEN CAST(amount AS NUMERIC) ELSE 0 END), 0) as overdueAmount,
          COALESCE(SUM(CASE WHEN (status = 'emessa' OR status = 'da_pagare') AND date(dueDate) >= date('now') THEN CAST(amount AS NUMERIC) ELSE 0 END), 0) as pendingAmount,
          COUNT(CASE WHEN status = 'da_emettere' THEN 1 END) as toIssueCount,
          COUNT(CASE WHEN status = 'emessa' OR status = 'da_pagare' THEN 1 END) as issuedCount,
          COUNT(CASE WHEN status = 'pagata' THEN 1 END) as paidCount,
          COUNT(CASE WHEN (status = 'emessa' OR status = 'da_pagare') AND date(dueDate) < date('now') THEN 1 END) as overdueCount
        FROM invoices
    `;

        const stats = await runQuery(statsQuery);
        console.log('Stats Result:', stats);

        console.log('\n--- Testing Simplified SUM ---');
        const simpleSum = await runQuery('SELECT SUM(amount) as rawSum, SUM(CAST(amount AS NUMERIC)) as castSum FROM invoices');
        console.log('Simple Sum:', simpleSum);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        db.close();
    }
}

debug();
