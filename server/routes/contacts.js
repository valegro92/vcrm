const express = require('express');
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all contacts
router.get('/', authMiddleware, (req, res) => {
  db.all('SELECT * FROM contacts WHERE userId = ? OR userId IS NULL ORDER BY createdAt DESC', [req.userId], (err, contacts) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(contacts);
  });
});

// Get single contact
router.get('/:id', authMiddleware, (req, res) => {
  db.get('SELECT * FROM contacts WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, req.userId], (err, contact) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  });
});

// Create contact
router.post('/', authMiddleware, (req, res) => {
  const { name, company, email, phone, value, status, avatar, lastContact, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const query = `
    INSERT INTO contacts (name, company, email, phone, value, status, avatar, lastContact, notes, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [name, company, email, phone, value || 0, status || 'Lead', avatar, lastContact, notes, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (err, contact) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json(contact);
    });
  });
});

// Update contact
router.put('/:id', authMiddleware, (req, res) => {
  const { name, company, email, phone, value, status, avatar, lastContact, notes } = req.body;

  const query = `
    UPDATE contacts
    SET name = ?, company = ?, email = ?, phone = ?, value = ?, status = ?, avatar = ?, lastContact = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND (userId = ? OR userId IS NULL)
  `;

  db.run(query, [name, company, email, phone, value, status, avatar, lastContact, notes, req.params.id, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    db.get('SELECT * FROM contacts WHERE id = ?', [req.params.id], (err, contact) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(contact);
    });
  });
});

// Delete contact
router.delete('/:id', authMiddleware, (req, res) => {
  db.run('DELETE FROM contacts WHERE id = ? AND (userId = ? OR userId IS NULL)', [req.params.id, req.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  });
});

module.exports = router;
