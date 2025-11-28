const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all opportunities
router.get('/', authMiddleware, (req, res) => {
  const { year } = req.query;
  let query = 'SELECT * FROM opportunities WHERE userId = ? OR userId IS NULL';
  const params = [req.userId];

  if (year) {
    query += ' AND strftime("%Y", closeDate) = ?';
    params.push(year);
  }

  query += ' ORDER BY createdAt DESC';

  db.all(query, params, (err, opportunities) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(opportunities);
  });
});

// Get single opportunity
router.get('/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM opportunities WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, req.userId], (err, opportunity) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  });
});

// Create opportunity
router.post('/', authMiddleware, (req, res) => {
  const { title, company, value, stage, probability, openDate, closeDate, owner, contactId, originalStage, notes } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const query = `
    INSERT INTO opportunities (title, company, value, stage, probability, openDate, closeDate, owner, contactId, userId, originalStage, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [title, company, value || 0, stage || 'Lead', probability || 0, openDate, closeDate, owner, contactId, req.userId, originalStage, notes], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get('SELECT * FROM opportunities WHERE id = ?', [this.lastID], (err, opportunity) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(opportunity);
    });
  });
});

// Update opportunity
router.put('/:id', authMiddleware, (req, res) => {
  const { title, company, value, stage, probability, openDate, closeDate, owner, contactId, originalStage, notes } = req.body;

  const query = `
    UPDATE opportunities
    SET title = ?, company = ?, value = ?, stage = ?, probability = ?, openDate = ?, closeDate = ?, owner = ?, contactId = ?, originalStage = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND (userId = ? OR userId IS NULL)
  `;

  db.run(query, [title, company, value, stage, probability, openDate, closeDate, owner, contactId, originalStage, notes, req.params.id, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    db.get('SELECT * FROM opportunities WHERE id = ?', [req.params.id], (err, opportunity) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(opportunity);
    });
  });
});

// Delete opportunity
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM opportunities WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.json({ message: 'Opportunity deleted successfully' });
  });
});

// Update opportunity stage (for drag and drop)
router.patch('/:id/stage', authMiddleware, (req, res) => {
  const { stage, probability } = req.body;

  db.run(
    'UPDATE opportunities SET stage = ?, probability = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND (userId = ? OR userId IS NULL)',
    [stage, probability, req.params.id, req.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Opportunity not found' });
      }

      db.get('SELECT * FROM opportunities WHERE id = ?', [req.params.id], (err, opportunity) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(opportunity);
      });
    }
  );
});

module.exports = router;
