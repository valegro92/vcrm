const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery, db } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all invoices (filtered by userId)
router.get('/', async (req, res) => {
  try {
    const { status, type, opportunityId } = req.query;
    const userId = req.userId;
    let query;
    let params = [];

    const isPostgres = db.type === 'postgres';

    if (isPostgres) {
      params.push(userId);
      query = `
        SELECT i.*,
               o.title as "opportunityTitle",
               o.company as "opportunityCompany",
               c.name as "contactName"
        FROM invoices i
        LEFT JOIN opportunities o ON i."opportunityId" = o.id
        LEFT JOIN contacts c ON i."contactId" = c.id
        WHERE (i."userId" = $1 OR i."userId" IS NULL)
      `;

      if (status) {
        params.push(status);
        query += ` AND i.status = $${params.length}`;
      }
      if (type) {
        params.push(type);
        query += ` AND i.type = $${params.length}`;
      }
      if (opportunityId) {
        params.push(opportunityId);
        query += ` AND i."opportunityId" = $${params.length}`;
      }

      query += ` ORDER BY i."dueDate" ASC`;
    } else {
      params.push(userId);
      query = `
        SELECT i.*,
               o.title as opportunityTitle,
               o.company as opportunityCompany,
               c.name as contactName
        FROM invoices i
        LEFT JOIN opportunities o ON i.opportunityId = o.id
        LEFT JOIN contacts c ON i.contactId = c.id
        WHERE (i.userId = ? OR i.userId IS NULL)
      `;

      if (status) {
        query += ` AND i.status = ?`;
        params.push(status);
      }
      if (type) {
        query += ` AND i.type = ?`;
        params.push(type);
      }
      if (opportunityId) {
        query += ` AND i.opportunityId = ?`;
        params.push(opportunityId);
      }

      query += ` ORDER BY i.dueDate ASC`;
    }

    const invoices = await getAll(query, params);
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET invoice stats (filtered by userId)
router.get('/stats', async (req, res) => {
  try {
    const userId = req.userId;
    const isPostgres = db.type === 'postgres';

    let query;
    if (isPostgres) {
      query = 'SELECT amount, status, "dueDate", "paidDate" FROM invoices WHERE "userId" = $1 OR "userId" IS NULL';
    } else {
      query = 'SELECT amount, status, dueDate, paidDate FROM invoices WHERE userId = ? OR userId IS NULL';
    }

    const invoices = await getAll(query, [userId]);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = invoices.reduce((acc, inv) => {
      const amount = parseFloat(inv.amount) || 0;
      const dueDate = new Date(inv.dueDate);
      const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      acc.total++;
      acc.totalAmount += amount;

      if (inv.status === 'pagata') {
        acc.paidAmount += amount;
        acc.paidCount++;
      } else if (inv.status === 'da_emettere') {
        acc.toIssueCount++;
      } else if (inv.status === 'emessa') {
        if (due < today) {
          acc.overdueAmount += amount;
          acc.overdueCount++;
        } else {
          acc.pendingAmount += amount;
          acc.issuedCount++;
        }
      }
      return acc;
    }, {
      total: 0,
      totalAmount: 0,
      paidAmount: 0,
      overdueAmount: 0,
      pendingAmount: 0,
      toIssueCount: 0,
      issuedCount: 0,
      paidCount: 0,
      overdueCount: 0
    });

    res.json(stats);
  } catch (err) {
    console.error('Error fetching invoice stats:', err);
    res.status(500).json({ error: 'Failed to fetch invoice stats' });
  }
});

// GET single invoice (filtered by userId)
router.get('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const isPostgres = db.type === 'postgres';
    let query;

    if (isPostgres) {
      query = `
        SELECT i.*,
               o.title as "opportunityTitle",
               o.company as "opportunityCompany",
               c.name as "contactName"
        FROM invoices i
        LEFT JOIN opportunities o ON i."opportunityId" = o.id
        LEFT JOIN contacts c ON i."contactId" = c.id
        WHERE i.id = $1 AND (i."userId" = $2 OR i."userId" IS NULL)
      `;
    } else {
      query = `
        SELECT i.*,
               o.title as opportunityTitle,
               o.company as opportunityCompany,
               c.name as contactName
        FROM invoices i
        LEFT JOIN opportunities o ON i.opportunityId = o.id
        LEFT JOIN contacts c ON i.contactId = c.id
        WHERE i.id = ? AND (i.userId = ? OR i.userId IS NULL)
      `;
    }

    const invoice = await getOne(query, [req.params.id, userId]);

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// CREATE invoice
router.post('/', async (req, res) => {
  try {
    const { invoiceNumber, opportunityId, contactId, type, amount, issueDate, dueDate, status, notes } = req.body;
    const userId = req.userId;

    if (!invoiceNumber || !amount || !issueDate || !dueDate) {
      return res.status(400).json({ error: 'Invoice number, amount, issue date and due date are required' });
    }

    const isPostgres = db.type === 'postgres';
    let result;

    if (isPostgres) {
      const query = `
        INSERT INTO invoices ("invoiceNumber", "opportunityId", "contactId", type, amount, "issueDate", "dueDate", status, notes, "userId")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const dbResult = await db.pool.query(query, [
        invoiceNumber, opportunityId || null, contactId || null, type || 'emessa',
        amount, issueDate, dueDate, status || 'da_emettere', notes || null, userId
      ]);
      result = dbResult.rows[0];
    } else {
      const query = `
        INSERT INTO invoices (invoiceNumber, opportunityId, contactId, type, amount, issueDate, dueDate, status, notes, userId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const insertResult = await runQuery(query, [
        invoiceNumber, opportunityId || null, contactId || null, type || 'emessa',
        amount, issueDate, dueDate, status || 'da_emettere', notes || null, userId
      ]);
      result = await getOne('SELECT * FROM invoices WHERE id = ?', [insertResult.lastID]);
    }

    res.status(201).json(result);
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

// UPDATE invoice (filtered by userId)
router.put('/:id', async (req, res) => {
  try {
    const { invoiceNumber, opportunityId, contactId, type, amount, issueDate, dueDate, paidDate, status, notes } = req.body;
    const userId = req.userId;

    const isPostgres = db.type === 'postgres';
    let result;

    if (isPostgres) {
      const query = `
        UPDATE invoices
        SET "invoiceNumber" = $1, "opportunityId" = $2, "contactId" = $3, type = $4,
            amount = $5, "issueDate" = $6, "dueDate" = $7, "paidDate" = $8, status = $9,
            notes = $10, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $11 AND ("userId" = $12 OR "userId" IS NULL)
        RETURNING *
      `;
      const dbResult = await db.pool.query(query, [
        invoiceNumber, opportunityId || null, contactId || null, type,
        amount, issueDate, dueDate, paidDate || null, status, notes || null, req.params.id, userId
      ]);
      result = dbResult.rows[0];
    } else {
      const query = `
        UPDATE invoices
        SET invoiceNumber = ?, opportunityId = ?, contactId = ?, type = ?,
            amount = ?, issueDate = ?, dueDate = ?, paidDate = ?, status = ?,
            notes = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND (userId = ? OR userId IS NULL)
      `;
      await runQuery(query, [
        invoiceNumber, opportunityId || null, contactId || null, type,
        amount, issueDate, dueDate, paidDate || null, status, notes || null, req.params.id, userId
      ]);
      result = await getOne('SELECT * FROM invoices WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, userId]);
    }

    if (!result) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

// PATCH invoice status (filtered by userId)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, issueDate, paidDate } = req.body;
    const userId = req.userId;

    const isPostgres = db.type === 'postgres';
    let result;

    if (isPostgres) {
      const query = `
        UPDATE invoices
        SET status = $1, "issueDate" = COALESCE($2, "issueDate"), "paidDate" = $3, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $4 AND ("userId" = $5 OR "userId" IS NULL)
        RETURNING *
      `;
      const dbResult = await db.pool.query(query, [status, issueDate || null, paidDate || null, req.params.id, userId]);
      result = dbResult.rows[0];
    } else {
      const query = `
        UPDATE invoices
        SET status = ?, issueDate = COALESCE(?, issueDate), paidDate = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ? AND (userId = ? OR userId IS NULL)
      `;
      await runQuery(query, [status, issueDate || null, paidDate || null, req.params.id, userId]);
      result = await getOne('SELECT * FROM invoices WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, userId]);
    }

    if (!result) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(result);
  } catch (err) {
    console.error('Error updating invoice status:', err);
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
});

// DELETE invoice (filtered by userId)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.userId;
    const isPostgres = db.type === 'postgres';

    if (isPostgres) {
      const result = await db.pool.query('DELETE FROM invoices WHERE id = $1 AND ("userId" = $2 OR "userId" IS NULL) RETURNING id', [req.params.id, userId]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
    } else {
      const result = await runQuery('DELETE FROM invoices WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, userId]);
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
    }

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

module.exports = router;
