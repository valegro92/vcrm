const express = require('express');
const { getAll, getOne, runQuery, getReturningClause } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const VALID_TARGET_TYPES = ['ordinato', 'fatturato', 'incassato'];

// Get all targets for a year (all types)
router.get('/:year', authMiddleware, async (req, res) => {
  try {
    const targets = await getAll(
      'SELECT * FROM monthly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL) ORDER BY month ASC',
      [req.params.year, req.userId]
    );

    // Build result: for each type, 12 months
    const result = {};
    for (const type of VALID_TARGET_TYPES) {
      result[type] = [];
      for (let month = 0; month < 12; month++) {
        const existing = targets.find(t => t.month === month && (t.target_type === type || (!t.target_type && type === 'ordinato')));
        result[type].push({
          month,
          target: existing ? parseFloat(existing.target) : 0
        });
      }
    }

    // Also return legacy flat array for backward compatibility
    const legacy = [];
    for (let month = 0; month < 12; month++) {
      const existing = targets.find(t => t.month === month && (!t.target_type || t.target_type === 'ordinato'));
      legacy.push({
        month,
        target: existing ? parseFloat(existing.target) : 0
      });
    }

    res.json({
      byType: result,
      // Legacy flat array (defaults to ordinato)
      legacy
    });
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

    const totals = {};
    for (const type of VALID_TARGET_TYPES) {
      totals[type] = targets
        .filter(t => t.target_type === type || (!t.target_type && type === 'ordinato'))
        .reduce((sum, t) => sum + (parseFloat(t.target) || 0), 0);
    }

    // Legacy total (ordinato)
    const total = totals.ordinato;

    res.json({ year: parseInt(req.params.year), total, totals });
  } catch (err) {
    console.error('Get annual total error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Save target for a specific month
router.post('/', authMiddleware, async (req, res) => {
  const { year, month, target, target_type = 'ordinato' } = req.body;

  if (year === undefined || month === undefined || target === undefined) {
    return res.status(400).json({ error: 'Year, month, and target are required' });
  }

  if (!VALID_TARGET_TYPES.includes(target_type)) {
    return res.status(400).json({ error: 'Invalid target_type. Must be: ordinato, fatturato, or incassato' });
  }

  try {
    const existing = await getOne(
      'SELECT * FROM monthly_targets WHERE year = ? AND month = ? AND target_type = ? AND ("userId" = ? OR "userId" IS NULL)',
      [year, month, target_type, req.userId]
    );

    if (existing) {
      await runQuery(
        'UPDATE monthly_targets SET target = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE year = ? AND month = ? AND target_type = ? AND ("userId" = ? OR "userId" IS NULL)',
        [target, year, month, target_type, req.userId]
      );
    } else {
      await runQuery(
        `INSERT INTO monthly_targets (year, month, target, target_type, "userId") VALUES (?, ?, ?, ?, ?) ${getReturningClause()}`,
        [year, month, target, target_type, req.userId]
      );
    }

    const updatedTarget = await getOne(
      'SELECT * FROM monthly_targets WHERE year = ? AND month = ? AND target_type = ? AND ("userId" = ? OR "userId" IS NULL)',
      [year, month, target_type, req.userId]
    );
    res.json(updatedTarget);
  } catch (err) {
    console.error('Save target error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Save all targets for a year (batch) - supports types
router.post('/batch', authMiddleware, async (req, res) => {
  const { year, targets, byType } = req.body;

  if (!year) {
    return res.status(400).json({ error: 'Year is required' });
  }

  try {
    if (byType) {
      // New format: { ordinato: [...], fatturato: [...], incassato: [...] }
      for (const type of VALID_TARGET_TYPES) {
        if (!byType[type]) continue;

        // Delete existing targets for this year and type
        await runQuery(
          'DELETE FROM monthly_targets WHERE year = ? AND target_type = ? AND ("userId" = ? OR "userId" IS NULL)',
          [year, type, req.userId]
        );

        // Insert new targets
        for (const t of byType[type]) {
          if (t.target > 0) {
            await runQuery(
              `INSERT INTO monthly_targets (year, month, target, target_type, "userId") VALUES (?, ?, ?, ?, ?)`,
              [year, t.month, t.target, type, req.userId]
            );
          }
        }
      }
    } else if (targets && Array.isArray(targets)) {
      // Legacy format: flat array (treated as ordinato)
      await runQuery(
        'DELETE FROM monthly_targets WHERE year = ? AND (target_type = ? OR target_type IS NULL) AND ("userId" = ? OR "userId" IS NULL)',
        [year, 'ordinato', req.userId]
      );

      for (const t of targets) {
        if (t.target > 0) {
          await runQuery(
            `INSERT INTO monthly_targets (year, month, target, target_type, "userId") VALUES (?, ?, ?, ?, ?)`,
            [year, t.month, t.target, 'ordinato', req.userId]
          );
        }
      }
    } else {
      return res.status(400).json({ error: 'Either targets array or byType object is required' });
    }

    // Return all updated targets
    const updatedTargets = await getAll(
      'SELECT * FROM monthly_targets WHERE year = ? AND ("userId" = ? OR "userId" IS NULL) ORDER BY target_type, month ASC',
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
