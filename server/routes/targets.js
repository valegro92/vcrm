const express = require('express');
const { getAll, getOne, runQuery, getReturningClause } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all targets
router.get('/', authMiddleware, async (req, res) => {
  try {
    const targets = await getAll('SELECT * FROM yearly_targets WHERE "userId" = ? OR "userId" IS NULL ORDER BY year DESC', [req.userId]);
    res.json(targets);
  } catch (err) {
    console.error('Get targets error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get target for a specific year
router.get('/:year', authMiddleware, async (req, res) => {
  try {
    const target = await getOne('SELECT * FROM yearly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.year, req.userId]);
    if (!target) {
      // Return default target if not set
      return res.json({ year: parseInt(req.params.year), target: 85000 });
    }
    res.json(target);
  } catch (err) {
    console.error('Get target error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create or update target for a year (upsert)
router.post('/', authMiddleware, async (req, res) => {
  const { year, target } = req.body;

  if (!year || target === undefined) {
    return res.status(400).json({ error: 'Year and target are required' });
  }

  try {
    // Check if target for this year already exists
    const existing = await getOne('SELECT * FROM yearly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)', [year, req.userId]);

    if (existing) {
      // Update existing
      await runQuery(
        'UPDATE yearly_targets SET target = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)',
        [target, year, req.userId]
      );
    } else {
      // Insert new
      await runQuery(
        `INSERT INTO yearly_targets (year, target, "userId") VALUES (?, ?, ?) ${getReturningClause()}`,
        [year, target, req.userId]
      );
    }

    const updatedTarget = await getOne('SELECT * FROM yearly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)', [year, req.userId]);
    res.json(updatedTarget);
  } catch (err) {
    console.error('Save target error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete target for a year
router.delete('/:year', authMiddleware, async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM yearly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.year, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Target not found' });
    }

    res.json({ message: 'Target deleted successfully' });
  } catch (err) {
    console.error('Delete target error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
