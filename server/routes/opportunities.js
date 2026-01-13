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
  const { title, company, value, stage, probability, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, originalStage, notes, projectStatus } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  // Se è già Chiuso Vinto, imposta projectStatus di default
  const finalProjectStatus = stage === 'Chiuso Vinto' ? (projectStatus || 'in_lavorazione') : null;

  const query = `
    INSERT INTO opportunities (title, company, value, stage, probability, "openDate", "closeDate", "expectedInvoiceDate", "expectedPaymentDate", owner, "contactId", "userId", "originalStage", notes, "projectStatus")
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ${getReturningClause()}
  `;

  try {
    const result = await runQuery(query, [title, company, value || 0, stage || 'Lead', probability || 0, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, req.userId, originalStage, notes, finalProjectStatus]);

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
  const { title, company, value, stage, probability, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, originalStage, notes, projectStatus } = req.body;

  const query = `
    UPDATE opportunities
    SET title = ?, company = ?, value = ?, stage = ?, probability = ?, "openDate" = ?, "closeDate" = ?, "expectedInvoiceDate" = ?, "expectedPaymentDate" = ?, owner = ?, "contactId" = ?, "originalStage" = ?, notes = ?, "projectStatus" = ?, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)
  `;

  try {
    const result = await runQuery(query, [title, company, value, stage, probability, openDate, closeDate, expectedInvoiceDate, expectedPaymentDate, owner, contactId, originalStage, notes, projectStatus, req.params.id, req.userId]);

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

    // Se è Chiuso Vinto, aggiorniamo anche le date previste e impostiamo projectStatus
    if (stage === 'Chiuso Vinto') {
      query = 'UPDATE opportunities SET stage = ?, probability = ?, "expectedInvoiceDate" = ?, "expectedPaymentDate" = ?, "projectStatus" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)';
      params = [stage, probability, expectedInvoiceDate || null, expectedPaymentDate || null, 'in_lavorazione', req.params.id, req.userId];
    } else {
      // Se non è più Chiuso Vinto, resettiamo projectStatus a null
      query = 'UPDATE opportunities SET stage = ?, probability = ?, "projectStatus" = NULL, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)';
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

// Update project status (for project Kanban drag and drop)
router.patch('/:id/project-status', authMiddleware, async (req, res) => {
  const { projectStatus } = req.body;

  const validStatuses = ['in_lavorazione', 'in_revisione', 'consegnato', 'chiuso', 'archiviato'];
  if (!validStatuses.includes(projectStatus)) {
    return res.status(400).json({ error: 'Invalid project status' });
  }

  try {
    const query = 'UPDATE opportunities SET "projectStatus" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ? AND ("userId" = ? OR "userId" IS NULL) AND stage = ?';
    const params = [projectStatus, req.params.id, req.userId, 'Chiuso Vinto'];

    const result = await runQuery(query, params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Project not found or not a won opportunity' });
    }

    const opportunity = await getOne('SELECT * FROM opportunities WHERE id = ?', [req.params.id]);
    res.json(opportunity);
  } catch (err) {
    console.error('Update project status error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
