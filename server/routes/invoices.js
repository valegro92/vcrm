const express = require('express');
const router = express.Router();
const { getAll, getOne, runQuery, db } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const { status, type, opportunityId } = req.query;
    let query;
    let params = [];

    const isPostgres = db.type === 'postgres';

    if (isPostgres) {
      query = `
        SELECT i.*, 
               o.title as "opportunityTitle", 
               o.company as "opportunityCompany",
               c.name as "contactName"
        FROM invoices i
        LEFT JOIN opportunities o ON i."opportunityId" = o.id
        LEFT JOIN contacts c ON i."contactId" = c.id
        WHERE 1=1
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
      query = `
        SELECT i.*, 
               o.title as opportunityTitle, 
               o.company as opportunityCompany,
               c.name as contactName
        FROM invoices i
        LEFT JOIN opportunities o ON i.opportunityId = o.id
        LEFT JOIN contacts c ON i.contactId = c.id
        WHERE 1=1
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

// GET invoice stats
router.get('/stats', async (req, res) => {
  try {
    const isPostgres = db.type === 'postgres';

    // Fetch all invoices to calculate stats in JS (more robust across DBs)
    let query;
    if (isPostgres) {
      query = 'SELECT amount, status, "dueDate", "paidDate" FROM invoices';
    } else {
      query = 'SELECT amount, status, dueDate, paidDate FROM invoices';
    }

    const invoices = await getAll(query);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = invoices.reduce((acc, inv) => {
      const amount = parseFloat(inv.amount) || 0;
      const dueDate = new Date(inv.dueDate);
      // Reset time part for date comparison
      const due = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      acc.total++;
      acc.totalAmount += amount;

      if (inv.status === 'pagata') {
        acc.paidAmount += amount;
        acc.paidCount++;
      } else if (inv.status === 'da_emettere') {
        acc.toIssueCount++;
      } else if (inv.status === 'emessa' || inv.status === 'da_pagare') {
        if (due < today) {
          acc.overdueAmount += amount;
          acc.overdueCount++;
        } else {
          acc.pendingAmount += amount;
          acc.issuedCount++; // "issued" here means pending payment
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

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
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
        WHERE i.id = $1
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
        WHERE i.id = ?
      `;
    }

    const invoice = await getOne(query, [req.params.id]);

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
    const userId = req.user.id;

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

// UPDATE invoice
router.put('/:id', async (req, res) => {
  try {
    const { invoiceNumber, opportunityId, contactId, type, amount, issueDate, dueDate, paidDate, status, notes } = req.body;

    const isPostgres = db.type === 'postgres';
    let result;

    if (isPostgres) {
      const query = `
        UPDATE invoices 
        SET "invoiceNumber" = $1, "opportunityId" = $2, "contactId" = $3, type = $4, 
            amount = $5, "issueDate" = $6, "dueDate" = $7, "paidDate" = $8, status = $9, 
            notes = $10, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *
      `;
      const dbResult = await db.pool.query(query, [
        invoiceNumber, opportunityId || null, contactId || null, type,
        amount, issueDate, dueDate, paidDate || null, status, notes || null, req.params.id
      ]);
      result = dbResult.rows[0];
    } else {
      const query = `
        UPDATE invoices 
        SET invoiceNumber = ?, opportunityId = ?, contactId = ?, type = ?, 
            amount = ?, issueDate = ?, dueDate = ?, paidDate = ?, status = ?, 
            notes = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await runQuery(query, [
        invoiceNumber, opportunityId || null, contactId || null, type,
        amount, issueDate, dueDate, paidDate || null, status, notes || null, req.params.id
      ]);
      result = await getOne('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
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

// PATCH invoice status (quick update)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, paidDate } = req.body;

    const isPostgres = db.type === 'postgres';
    let result;

    if (isPostgres) {
      const query = `
        UPDATE invoices 
        SET status = $1, "paidDate" = $2, "updatedAt" = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *
      `;
      const dbResult = await db.pool.query(query, [status, paidDate || null, req.params.id]);
      result = dbResult.rows[0];
    } else {
      const query = `
        UPDATE invoices 
        SET status = ?, paidDate = ?, updatedAt = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      await runQuery(query, [status, paidDate || null, req.params.id]);
      result = await getOne('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
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

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    const isPostgres = db.type === 'postgres';

    if (isPostgres) {
      await db.pool.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
    } else {
      await runQuery('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    }

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

module.exports = router;
