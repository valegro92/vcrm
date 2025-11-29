const express = require('express');
const { getAll, getOne, runQuery, getReturningClause } = require('../database/helpers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all contacts
router.get('/', authMiddleware, async (req, res) => {
  try {
    const contacts = await getAll('SELECT * FROM contacts WHERE "userId" = ? OR "userId" IS NULL ORDER BY "createdAt" DESC', [req.userId]);
    res.json(contacts);
  } catch (err) {
    console.error('Get contacts error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single contact
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const contact = await getOne('SELECT * FROM contacts WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.id, req.userId]);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (err) {
    console.error('Get contact error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create contact
router.post('/', authMiddleware, async (req, res) => {
  const { name, company, email, phone, value, status, avatar, lastContact, notes } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const query = `
    INSERT INTO contacts (name, company, email, phone, value, status, avatar, "lastContact", notes, "userId")
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ${getReturningClause()}
  `;

  try {
    const result = await runQuery(query, [name, company, email, phone, value || 0, status || 'Lead', avatar, lastContact, notes, req.userId]);

    const contactId = result.lastID || (result.rows && result.rows[0]?.id);
    const contact = await getOne('SELECT * FROM contacts WHERE id = ?', [contactId]);

    res.status(201).json(contact);
  } catch (err) {
    console.error('Create contact error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update contact
router.put('/:id', authMiddleware, async (req, res) => {
  const { name, company, email, phone, value, status, avatar, lastContact, notes } = req.body;

  const query = `
    UPDATE contacts
    SET name = ?, company = ?, email = ?, phone = ?, value = ?, status = ?, avatar = ?, "lastContact" = ?, notes = ?, "updatedAt" = CURRENT_TIMESTAMP
    WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)
  `;

  try {
    const result = await runQuery(query, [name, company, email, phone, value, status, avatar, lastContact, notes, req.params.id, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const contact = await getOne('SELECT * FROM contacts WHERE id = ?', [req.params.id]);
    res.json(contact);
  } catch (err) {
    console.error('Update contact error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete contact
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await runQuery('DELETE FROM contacts WHERE id = ? AND ("userId" = ? OR "userId" IS NULL)', [req.params.id, req.userId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error('Delete contact error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
