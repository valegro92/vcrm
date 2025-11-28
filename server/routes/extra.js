const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const auth = require('../middleware/auth');

const router = express.Router();

// ============== STATS ==============
router.get('/stats', auth, (req, res) => {
  const contactsPromise = new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM contacts', [], (err, row) => {
      if (err) reject(err);
      else resolve(row?.count || 0);
    });
  });

  const opportunitiesPromise = new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM opportunities', [], (err, row) => {
      if (err) reject(err);
      else resolve(row?.count || 0);
    });
  });

  const tasksPromise = new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM tasks', [], (err, row) => {
      if (err) reject(err);
      else resolve(row?.count || 0);
    });
  });

  const pipelineValuePromise = new Promise((resolve, reject) => {
    db.get('SELECT SUM(value) as total FROM opportunities WHERE stage NOT LIKE "%Chiuso%"', [], (err, row) => {
      if (err) reject(err);
      else resolve(row?.total || 0);
    });
  });

  const wonDealsPromise = new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count, SUM(value) as total FROM opportunities WHERE stage LIKE "%Vinto%"', [], (err, row) => {
      if (err) reject(err);
      else resolve({ count: row?.count || 0, total: row?.total || 0 });
    });
  });

  const openTasksPromise = new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM tasks WHERE status != "Completata"', [], (err, row) => {
      if (err) reject(err);
      else resolve(row?.count || 0);
    });
  });

  Promise.all([contactsPromise, opportunitiesPromise, tasksPromise, pipelineValuePromise, wonDealsPromise, openTasksPromise])
    .then(([contacts, opportunities, tasks, pipelineValue, wonDeals, openTasks]) => {
      res.json({
        contacts,
        opportunities,
        tasks,
        pipelineValue,
        wonDeals: wonDeals.count,
        wonValue: wonDeals.total,
        openTasks
      });
    })
    .catch(err => {
      res.status(500).json({ error: 'Error fetching stats' });
    });
});

// ============== EXPORT ==============
router.get('/export', auth, (req, res) => {
  const format = req.query.format || 'json';

  const contactsPromise = new Promise((resolve, reject) => {
    db.all('SELECT * FROM contacts', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  const opportunitiesPromise = new Promise((resolve, reject) => {
    db.all('SELECT * FROM opportunities', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  const tasksPromise = new Promise((resolve, reject) => {
    db.all('SELECT * FROM tasks', [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });

  Promise.all([contactsPromise, opportunitiesPromise, tasksPromise])
    .then(([contacts, opportunities, tasks]) => {
      if (format === 'csv') {
        // Generate CSV
        const contactsCsv = generateCSV(contacts, ['id', 'name', 'company', 'email', 'phone', 'value', 'status', 'lastContact']);
        const opportunitiesCsv = generateCSV(opportunities, ['id', 'title', 'company', 'value', 'stage', 'probability', 'closeDate', 'owner']);
        const tasksCsv = generateCSV(tasks, ['id', 'title', 'type', 'priority', 'status', 'dueDate', 'contactId']);

        res.json({
          format: 'csv',
          data: {
            contacts: contactsCsv,
            opportunities: opportunitiesCsv,
            tasks: tasksCsv
          }
        });
      } else {
        res.json({
          format: 'json',
          exportDate: new Date().toISOString(),
          data: {
            contacts,
            opportunities,
            tasks
          }
        });
      }
    })
    .catch(err => {
      res.status(500).json({ error: 'Error exporting data' });
    });
});

function generateCSV(data, columns) {
  if (!data || data.length === 0) return '';
  
  const header = columns.join(',');
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return '';
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );
  
  return [header, ...rows].join('\n');
}

// ============== GLOBAL SEARCH ==============
router.get('/search', auth, (req, res) => {
  const query = req.query.q || '';
  
  if (query.length < 2) {
    return res.json({ contacts: [], opportunities: [], tasks: [] });
  }

  const searchTerm = `%${query}%`;

  const contactsPromise = new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM contacts WHERE name LIKE ? OR company LIKE ? OR email LIKE ? LIMIT 10',
      [searchTerm, searchTerm, searchTerm],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });

  const opportunitiesPromise = new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM opportunities WHERE title LIKE ? OR company LIKE ? LIMIT 10',
      [searchTerm, searchTerm],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });

  const tasksPromise = new Promise((resolve, reject) => {
    db.all(
      'SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? LIMIT 10',
      [searchTerm, searchTerm],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });

  Promise.all([contactsPromise, opportunitiesPromise, tasksPromise])
    .then(([contacts, opportunities, tasks]) => {
      res.json({ contacts, opportunities, tasks });
    })
    .catch(err => {
      res.status(500).json({ error: 'Search error' });
    });
});

// ============== NOTIFICATIONS ==============
// Create notifications table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    entityType TEXT,
    entityId INTEGER,
    isRead INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

router.get('/notifications', auth, (req, res) => {
  db.all(
    'SELECT * FROM notifications WHERE userId = ? OR userId IS NULL ORDER BY createdAt DESC LIMIT 50',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching notifications' });
      }
      
      // Also check for tasks due today/overdue
      const today = new Date().toISOString().split('T')[0];
      db.all(
        'SELECT * FROM tasks WHERE status != "Completata" AND dueDate <= ? ORDER BY dueDate LIMIT 10',
        [today],
        (err, tasks) => {
          const taskNotifications = (tasks || []).map(task => ({
            id: `task-${task.id}`,
            type: task.dueDate < today ? 'overdue' : 'due_today',
            title: task.dueDate < today ? 'Attività scaduta' : 'Attività in scadenza oggi',
            message: task.title,
            entityType: 'task',
            entityId: task.id,
            isRead: 0,
            createdAt: task.dueDate
          }));

          res.json([...taskNotifications, ...(rows || [])]);
        }
      );
    }
  );
});

router.patch('/notifications/:id/read', auth, (req, res) => {
  const { id } = req.params;
  
  // Handle task notifications
  if (id.startsWith('task-')) {
    return res.json({ success: true });
  }
  
  db.run(
    'UPDATE notifications SET isRead = 1 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating notification' });
      }
      res.json({ success: true });
    }
  );
});

router.patch('/notifications/read-all', auth, (req, res) => {
  db.run(
    'UPDATE notifications SET isRead = 1 WHERE userId = ? OR userId IS NULL',
    [req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating notifications' });
      }
      res.json({ success: true });
    }
  );
});

// ============== NOTES ==============
// Create notes table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entityType TEXT NOT NULL,
    entityId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdBy INTEGER,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

router.get('/notes', auth, (req, res) => {
  const { entityType, entityId } = req.query;
  
  if (!entityType || !entityId) {
    return res.status(400).json({ error: 'entityType and entityId required' });
  }

  db.all(
    'SELECT * FROM notes WHERE entityType = ? AND entityId = ? ORDER BY createdAt DESC',
    [entityType, entityId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching notes' });
      }
      res.json(rows || []);
    }
  );
});

router.post('/notes', auth, (req, res) => {
  const { entityType, entityId, content } = req.body;
  
  if (!entityType || !entityId || !content) {
    return res.status(400).json({ error: 'entityType, entityId and content required' });
  }

  db.run(
    'INSERT INTO notes (entityType, entityId, content, createdBy) VALUES (?, ?, ?, ?)',
    [entityType, entityId, content, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error creating note' });
      }
      res.status(201).json({
        id: this.lastID,
        entityType,
        entityId,
        content,
        createdBy: req.user.userId,
        createdAt: new Date().toISOString()
      });
    }
  );
});

router.delete('/notes/:id', auth, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error deleting note' });
    }
    res.json({ success: true });
  });
});

module.exports = router;
