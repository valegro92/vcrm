const express = require('express');
const { getAll, getOne, runQuery, getReturningClause } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all targets for a year
router.get('/:year', authMiddleware, async (req, res) => {
  try {
    const targets = await getAll(
      'SELECT * FROM monthly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL) ORDER BY month ASC',
      [req.params.year, req.userId]
    );

    // Return array of 12 months with targets (fill missing with 0)
    const monthlyTargets = [];
    for (let month = 0; month < 12; month++) {
      const existing = targets.find(t => t.month === month);
      monthlyTargets.push({
        month,
        target: existing ? parseFloat(existing.target) : 0
      });
    }

    res.json(monthlyTargets);
  } catch (err) {
    console.error('Get targets error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get annual total for a year
router.get('/:year/total', authMiddleware, async (req, res) => {
  try {
    const targets = await getAll(
      'SELECT * FROM monthly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)',
      [req.params.year, req.userId]
    );

    const total = targets.reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0);
    res.json({ year: parseInt(req.params.year), total });
  } catch (err) {
    console.error('Get annual total error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Save target for a specific month
router.post('/', authMiddleware, async (req, res) => {
  const { year, month, target } = req.body;

  if (year === undefined || month === undefined || target === undefined) {
    return res.status(400).json({ error: 'Year, month, and target are required' });
  }

  try {
    // Check if target for this month already exists
    const existing = await getOne(
      'SELECT * FROM monthly_targets WHERE year = ? AND month = ? AND ("userId" = ? OR "userId" IS NULL)',
      [year, month, req.userId]
    );

    if (existing) {
      // Update existing
      await runQuery(
        'UPDATE monthly_targets SET target = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE year = ? AND month = ? AND ("userId" = ? OR "userId" IS NULL)',
        [target, year, month, req.userId]
      );
    } else {
      // Insert new
      await runQuery(
        `INSERT INTO monthly_targets (year, month, target, "userId") VALUES (?, ?, ?, ?) ${getReturningClause()}`,
        [year, month, target, req.userId]
      );
    }

    const updatedTarget = await getOne(
      'SELECT * FROM monthly_targets WHERE year = ? AND month = ? AND ("userId" = ? OR "userId" IS NULL)',
      [year, month, req.userId]
    );
    res.json(updatedTarget);
  } catch (err) {
    console.error('Save target error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Save all targets for a year (batch)
router.post('/batch', authMiddleware, async (req, res) => {
  const { year, targets } = req.body;

  if (!year || !targets || !Array.isArray(targets)) {
    return res.status(400).json({ error: 'Year and targets array are required' });
  }

  try {
    // Delete existing targets for this year
    await runQuery(
      'DELETE FROM monthly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)',
      [year, req.userId]
    );

    // Insert new targets
    for (const t of targets) {
      if (t.target > 0) {
        await runQuery(
          `INSERT INTO monthly_targets (year, month, target, "userId") VALUES (?, ?, ?, ?)`,
          [year, t.month, t.target, req.userId]
        );
      }
    }

    // Return updated targets
    const updatedTargets = await getAll(
      'SELECT * FROM monthly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL) ORDER BY month ASC',
      [year, req.userId]
    );

    res.json(updatedTargets);
  } catch (err) {
    console.error('Batch save targets error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete all targets for a year
router.delete('/:year', authMiddleware, async (req, res) => {
  try {
    await runQuery(
      'DELETE FROM monthly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL)',
      [req.params.year, req.userId]
    );

    res.json({ message: 'Targets deleted successfully' });
  } catch (err) {
    console.error('Delete targets error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
