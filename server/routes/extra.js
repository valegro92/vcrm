const express = require('express');
const { getAll, getOne, runQuery, getReturningClause } = require('../database/helpers');
const auth = require('../middleware/auth');

const router = express.Router();

// ============== STATS ==============
router.get('/stats', auth, async (req, res) => {
  try {
    const contactsCount = await getOne('SELECT COUNT(*) as count FROM contacts');
    const opportunitiesCount = await getOne('SELECT COUNT(*) as count FROM opportunities');
    const tasksCount = await getOne('SELECT COUNT(*) as count FROM tasks');

    const pipelineValue = await getOne('SELECT SUM(value) as total FROM opportunities WHERE stage NOT LIKE \'%Chiuso%\'');
    const wonDeals = await getOne('SELECT COUNT(*) as count, SUM(value) as total FROM opportunities WHERE stage LIKE \'%Vinto%\'');
    const openTasks = await getOne('SELECT COUNT(*) as count FROM tasks WHERE status != \'Completata\'');

    res.json({
      contacts: parseInt(contactsCount?.count || 0),
      opportunities: parseInt(opportunitiesCount?.count || 0),
      tasks: parseInt(tasksCount?.count || 0),
      pipelineValue: parseFloat(pipelineValue?.total || 0),
      wonDeals: parseInt(wonDeals?.count || 0),
      wonValue: parseFloat(wonDeals?.total || 0),
      openTasks: parseInt(openTasks?.count || 0)
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Error fetching stats' });
  }
});

// ============== EXPORT ==============
router.get('/export', auth, async (req, res) => {
  const format = req.query.format || 'json';

  try {
    const contacts = await getAll('SELECT * FROM contacts');
    const opportunities = await getAll('SELECT * FROM opportunities');
    const tasks = await getAll('SELECT * FROM tasks');

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
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Error exporting data' });
  }
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
router.get('/search', auth, async (req, res) => {
  const query = req.query.q || '';

  if (query.length < 2) {
    return res.json({ contacts: [], opportunities: [], tasks: [] });
  }

  const searchTerm = `%${query}%`;

  try {
    const contacts = await getAll(
      'SELECT * FROM contacts WHERE name LIKE ? OR company LIKE ? OR email LIKE ? LIMIT 10',
      [searchTerm, searchTerm, searchTerm]
    );

    const opportunities = await getAll(
      'SELECT * FROM opportunities WHERE title LIKE ? OR company LIKE ? LIMIT 10',
      [searchTerm, searchTerm]
    );

    const tasks = await getAll(
      'SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ? LIMIT 10',
      [searchTerm, searchTerm]
    );

    res.json({ contacts, opportunities, tasks });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search error' });
  }
});

// ============== NOTIFICATIONS ==============
router.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await getAll(
      'SELECT * FROM notifications WHERE "userId" = ? OR "userId" IS NULL ORDER BY "createdAt" DESC LIMIT 50',
      [req.user.userId]
    );

    // Also check for tasks due today/overdue
    const today = new Date().toISOString().split('T')[0];
    const tasks = await getAll(
      'SELECT * FROM tasks WHERE status != \'Completata\' AND "dueDate" <= ? ORDER BY "dueDate" LIMIT 10',
      [today]
    );

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

    res.json([...taskNotifications, ...(notifications || [])]);
  } catch (err) {
    console.error('Notifications error:', err);
    res.status(500).json({ error: 'Error fetching notifications' });
  }
});

router.patch('/notifications/:id/read', auth, async (req, res) => {
  const { id } = req.params;

  // Handle task notifications
  if (id.startsWith('task-')) {
    return res.json({ success: true });
  }

  try {
    await runQuery('UPDATE notifications SET "isRead" = 1 WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Update notification error:', err);
    res.status(500).json({ error: 'Error updating notification' });
  }
});

router.patch('/notifications/read-all', auth, async (req, res) => {
  try {
    await runQuery(
      'UPDATE notifications SET "isRead" = 1 WHERE "userId" = ? OR "userId" IS NULL',
      [req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Update all notifications error:', err);
    res.status(500).json({ error: 'Error updating notifications' });
  }
});

// ============== NOTES ==============
router.get('/notes', auth, async (req, res) => {
  const { entityType, entityId } = req.query;

  if (!entityType || !entityId) {
    return res.status(400).json({ error: 'entityType and entityId required' });
  }

  try {
    const notes = await getAll(
      'SELECT * FROM notes WHERE "entityType" = ? AND "entityId" = ? ORDER BY "createdAt" DESC',
      [entityType, entityId]
    );
    res.json(notes || []);
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

router.post('/notes', auth, async (req, res) => {
  const { entityType, entityId, content } = req.body;

  if (!entityType || !entityId || !content) {
    return res.status(400).json({ error: 'entityType, entityId and content required' });
  }

  try {
    const result = await runQuery(
      `INSERT INTO notes ("entityType", "entityId", content, "createdBy") VALUES (?, ?, ?, ?) ${getReturningClause()}`,
      [entityType, entityId, content, req.user.userId]
    );

    const noteId = result.lastID || (result.rows && result.rows[0]?.id);

    res.status(201).json({
      id: noteId,
      entityType,
      entityId,
      content,
      createdBy: req.user.userId,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Error creating note' });
  }
});

router.delete('/notes/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    await runQuery('DELETE FROM notes WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Error deleting note' });
  }
});

// ============== DATA RESTORE (MIGRATION) ==============
router.post('/restore-legacy', auth, async (req, res) => {
  // Only allow admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const fs = require('fs');
  const path = require('path');
  const dumpPath = path.join(__dirname, '../data/legacy_dump.json');

  if (!fs.existsSync(dumpPath)) {
    return res.status(404).json({ error: 'Legacy dump file not found' });
  }

  try {
    const data = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
    const client = require('../database/db').pool; // Direct access to pool for transactions

    if (!client) {
      return res.status(500).json({ error: 'Not connected to PostgreSQL' });
    }

    // Start transaction
    const clientConn = await client.connect();

    try {
      await clientConn.query('BEGIN');

      // 1. Users (skip existing admin/users to avoid conflicts, or use ON CONFLICT)
      if (data.users) {
        for (const user of data.users) {
          await clientConn.query(`
            INSERT INTO users (id, username, email, password, "fullName", avatar, phone, company, role, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (id) DO NOTHING
            ON CONFLICT (username) DO NOTHING
            ON CONFLICT (email) DO NOTHING
          `, [user.id, user.username, user.email, user.password, user.fullName, user.avatar, user.phone, user.company, user.role, user.createdAt, user.updatedAt]);
        }
        // Reset sequence
        await clientConn.query("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
      }

      // 2. Contacts
      if (data.contacts) {
        for (const contact of data.contacts) {
          await clientConn.query(`
            INSERT INTO contacts (id, name, company, email, phone, value, status, avatar, "lastContact", notes, "userId", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO NOTHING
          `, [contact.id, contact.name, contact.company, contact.email, contact.phone, contact.value, contact.status, contact.avatar, contact.lastContact, contact.notes, contact.userId, contact.createdAt, contact.updatedAt]);
        }
        await clientConn.query("SELECT setval('contacts_id_seq', (SELECT MAX(id) FROM contacts))");
      }

      // 3. Opportunities
      if (data.opportunities) {
        for (const opp of data.opportunities) {
          await clientConn.query(`
            INSERT INTO opportunities (id, title, company, value, stage, probability, "openDate", "closeDate", owner, "contactId", "userId", "originalStage", notes, "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            ON CONFLICT (id) DO NOTHING
          `, [opp.id, opp.title, opp.company, opp.value, opp.stage, opp.probability, opp.openDate, opp.closeDate, opp.owner, opp.contactId, opp.userId, opp.originalStage, opp.notes, opp.createdAt, opp.updatedAt]);
        }
        await clientConn.query("SELECT setval('opportunities_id_seq', (SELECT MAX(id) FROM opportunities))");
      }

      // 4. Tasks
      if (data.tasks) {
        for (const task of data.tasks) {
          await clientConn.query(`
            INSERT INTO tasks (id, title, type, priority, "dueDate", status, "contactId", "opportunityId", "userId", description, "completedAt", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT (id) DO NOTHING
          `, [task.id, task.title, task.type, task.priority, task.dueDate, task.status, task.contactId, task.opportunityId, task.userId, task.description, task.completedAt, task.createdAt, task.updatedAt]);
        }
        await clientConn.query("SELECT setval('tasks_id_seq', (SELECT MAX(id) FROM tasks))");
      }

      await clientConn.query('COMMIT');
      res.json({ message: 'Data restored successfully' });
    } catch (e) {
      await clientConn.query('ROLLBACK');
      throw e;
    } finally {
      clientConn.release();
    }

  } catch (err) {
    console.error('Restore error:', err);
    res.status(500).json({ error: 'Error restoring data: ' + err.message });
  }
});

// ============== DEBUG ==============
router.get('/db-test', async (req, res) => {
  try {
    const result = await getOne('SELECT 1 as val');
    res.json({ status: 'ok', result });
  } catch (err) {
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message,
      stack: err.stack,
      env: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        db: process.env.DB_NAME,
        hasUrl: !!process.env.DATABASE_URL
      }
    });
  }
});

module.exports = router;
