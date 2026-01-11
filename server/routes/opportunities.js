const express = require('express');
const { getAll, getOne, runQuery, getReturningClause, db } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all opportunities
router.get('/', authMiddleware, async (req, res) => {
  const { year } = req.query;
  let query = 'SELECT * FROM opportunities WHERE "userId" = ? OR "userId" IS NULL';
  const params = [req.userId];

  if (year) {
    if (db.type === 'postgres') {
      query += ' AND EXTRACT(YEAR FROM "closeDate") = ?';
    } else {
      query += ' AND strftime("%Y", closeDate) = ?';
    }
    params.push(year);
  }

  query += ' ORDER BY "createdAt" DESC';

  try {
    const opportunities = await getAll(query, params);
    res.json(opportunities);
  } catch (err) {
    console.error('Get opportunities error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single opportunity
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const opportunity = await getOne('SELECT * FROM opportunities WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.id, req.userId]);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (err) {
    console.error('Get opportunity error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create opportunity
router.post('/', authMiddleware, async (req, res) => {
  const { title, company, value, stage, probability, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, originalStage, notes } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const query = `
    INSERT INTO opportunities (title, company, value, stage, probability, "openDate", "closeDate", "expectedInvoiceDate", "expectedPaymentDate", owner, "contactId", "userId", "originalStage", notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ${getReturningClause()}
  `;

  try {
    const result = await runQuery(query, [title, company, value || 0, stage || 'Lead', probability || 0, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, req.userId, originalStage, notes]);

    const opportunityId = result.lastID || (result.rows && result.rows[0]?.id);
    const opportunity = await getOne('SELECT * FROM opportunities WHERE id = ?', [opportunityId]);

    res.status(201).json(opportunity);
  } catch (err) {
    console.error('Create opportunity error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update opportunity
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, company, value, stage, probability, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, originalStage, notes } = req.body;

  const query = `
    UPDATE opportunities
    SET title = ?, company = ?, value = ?, stage = ?, probability = ?, "openDate" = ?, "closeDate" = ?, "expectedInvoiceDate" = ?, "expectedPaymentDate" = ?, owner = ?, "contactId" = ?, "originalStage" = ?, notes = ?, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)
  `;

  try {
    const result = await runQuery(query, [title, company, value, stage, probability, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, originalStage, notes, req.params.id, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const opportunity = await getOne('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    res.json(opportunity);
  } catch (err) {
    console.error('Update opportunity error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete opportunity
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM opportunities WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.id, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity deleted successfully' });
  } catch (err) {
    console.error('Delete opportunity error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update opportunity stage (for drag and drop)
router.patch('/:id/stage', authMiddleware, async (req, res) => {
  const { stage, probability, expectedInvoiceDate, expectedPaymentDate } = req.body;

  try {
    let query;
    let params;

    // Se è Chiuso Vinto, aggiorniamo anche le date previste di fatturazione e incasso
    if (stage === 'Chiuso Vinto' && (expectedInvoiceDate || expectedPaymentDate)) {
      query = 'UPDATE opportunities SET stage = ?, probability = ?, "expectedInvoiceDate" = ?, "expectedPaymentDate" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)';
      params = [stage, probability, expectedInvoiceDate || null, expectedPaymentDate || null, req.params.id, req.userId];
    } else {
      query = 'UPDATE opportunities SET stage = ?, probability = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)';
      params = [stage, probability, req.params.id, req.userId];
    }

    const result = await runQuery(query, params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    const opportunity = await getOne('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    res.json(opportunity);
  } catch (err) {
    console.error('Update opportunity stage error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
