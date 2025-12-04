const { db, runQuery, getOne, getAll } = require('./database/helpers');

async function debugInvoices() {
    try {
        console.log('--- Debugging Invoices Table ---');

        // 1. Check raw data
        const invoices = await getAll('SELECT id, amount, typeof(amount) as type, status FROM invoices');
        console.log('Raw Invoices Data:', JSON.stringify(invoices, null, 2));

        // 2. Run the stats query exactly as in the route
        const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COALESCE(SUM(amount), 0) as totalAmount,
          COALESCE(SUM(CASE WHEN status = 'pagata' THEN amount ELSE 0 END), 0) as paidAmount
        FROM invoices
    `;
        const stats = await getOne(statsQuery);
        console.log('Stats Query Result:', JSON.stringify(stats, null, 2));

    } catch (err) {
        console.error('Error:', err);
    }
}

debugInvoices();
