const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const auth = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        role: user.role
      }
    });
  });
});

// Register
router.post('/register', async (req, res) => {
  const { username, email, password, fullName } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : username.substring(0, 2).toUpperCase();

    db.run(
      'INSERT INTO users (username, email, password, fullName, avatar) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, fullName, avatar],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        const token = jwt.sign(
          { userId: this.lastID, username, role: 'user' },
          process.env.JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.status(201).json({
          token,
          user: {
            id: this.lastID,
            username,
            email,
            fullName,
            avatar,
            role: 'user'
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Profile
router.put('/profile', auth, (req, res) => {
  const { fullName, email, phone, company } = req.body;
  const userId = req.user.userId;

  // Update avatar based on new name
  const avatar = fullName 
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) 
    : null;

  db.run(
    'UPDATE users SET fullName = ?, email = ?, phone = ?, company = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
    [fullName, email, phone, company, avatar, userId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Email already in use' });
        }
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Get updated user
      db.get('SELECT id, username, email, fullName, avatar, role, phone, company FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(user);
      });
    }
  );
});

// Change Password
router.post('/change-password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

// Get current user profile
router.get('/me', auth, (req, res) => {
  const userId = req.user.userId;

  db.get('SELECT id, username, email, fullName, avatar, role, phone, company, createdAt FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  });
});

module.exports = router;
