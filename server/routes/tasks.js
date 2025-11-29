const express = require('express');
const { getAll, getOne, runQuery, getReturningClause } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await getAll('SELECT * FROM tasks WHERE "userId" = ? OR "userId" IS NULL ORDER BY "dueDate" ASC, "createdAt" DESC', [req.userId]);
    res.json(tasks);
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single task
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await getOne('SELECT * FROM tasks WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.id, req.userId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('Get task error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create task
router.post('/', authMiddleware, async (req, res) => {
  const { title, type, priority, dueDate, status, contactId, opportunityId, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const query = `
    INSERT INTO tasks (title, type, priority, "dueDate", status, "contactId", "opportunityId", "userId", description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ${getReturningClause()}
  `;

  try {
    const result = await runQuery(query, [title, type || 'Chiamata', priority || 'Media', dueDate, status || 'Da fare', contactId, opportunityId, req.userId, description]);

    const taskId = result.lastID || (result.rows && result.rows[0]?.id);
    const task = await getOne('SELECT * FROM tasks WHERE id = ?', [taskId]);

    res.status(201).json(task);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, type, priority, dueDate, status, contactId, opportunityId, description } = req.body;

  const completedAt = status === 'Completata' ? new Date().toISOString() : null;

  const query = `
    UPDATE tasks
    SET title = ?, type = ?, priority = ?, "dueDate" = ?, status = ?, "contactId" = ?, "opportunityId" = ?, description = ?, "completedAt" = ?, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)
  `;

  try {
    const result = await runQuery(query, [title, type, priority, dueDate, status, contactId, opportunityId, description, completedAt, req.params.id, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const task = await getOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(task);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM tasks WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.id, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Toggle task status
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const task = await getOne('SELECT status FROM tasks WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.id, req.userId]);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newStatus = task.status === 'Completata' ? 'Da fare' : 'Completata';
    const completedAt = newStatus === 'Completata' ? new Date().toISOString() : null;

    await runQuery(
      'UPDATE tasks SET status = ?, "completedAt" = ?, "updatedAt" = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, completedAt, req.params.id]
    );

    const updatedTask = await getOne('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    res.json(updatedTask);
  } catch (err) {
    console.error('Toggle task status error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
