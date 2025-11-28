const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all tasks
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM tasks WHERE userId = ? OR userId IS NULL ORDER BY dueDate ASC, createdAt DESC', [req.userId], (err, tasks) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tasks);
  });
});

// Get single task
router.get('/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM tasks WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, req.userId], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  });
});

// Create task
router.post('/', authMiddleware, (req, res) => {
  const { title, type, priority, dueDate, status, contactId, opportunityId, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const query = `
    INSERT INTO tasks (title, type, priority, dueDate, status, contactId, opportunityId, userId, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [title, type || 'Chiamata', priority || 'Media', dueDate, status || 'Da fare', contactId, opportunityId, req.userId, description], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get('SELECT * FROM tasks WHERE id = ?', [this.lastID], (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(task);
    });
  });
});

// Update task
router.put('/:id', authMiddleware, (req, res) => {
  const { title, type, priority, dueDate, status, contactId, opportunityId, description } = req.body;

  const completedAt = status === 'Completata' ? new Date().toISOString() : null;

  const query = `
    UPDATE tasks
    SET title = ?, type = ?, priority = ?, dueDate = ?, status = ?, contactId = ?, opportunityId = ?, description = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND (userId = ? OR userId IS NULL)
  `;

  db.run(query, [title, type, priority, dueDate, status, contactId, opportunityId, description, completedAt, req.params.id, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, task) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(task);
    });
  });
});

// Delete task
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  });
});

// Toggle task status
router.patch('/:id/toggle', authMiddleware, (req, res) => {
  db.get('SELECT status FROM tasks WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, req.userId], (err, task) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const newStatus = task.status === 'Completata' ? 'Da fare' : 'Completata';
    const completedAt = newStatus === 'Completata' ? new Date().toISOString() : null;

    db.run(
      'UPDATE tasks SET status = ?, completedAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, completedAt, req.params.id],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id], (err, updatedTask) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          res.json(updatedTask);
        });
      }
    );
  });
});

module.exports = router;
