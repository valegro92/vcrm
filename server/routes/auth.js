const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { runQuery, getOne, getReturningClause } = require('../database/helpers');
const auth = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await getOne('SELECT * FROM users WHERE username = ? OR email = ?', [username, username]);

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
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
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

    const result = await runQuery(
      `INSERT INTO users (username, email, password, fullName, avatar) VALUES (?, ?, ?, ?, ?) ${getReturningClause()}`,
      [username, email, hashedPassword, fullName, avatar]
    );

    const userId = result.lastID || (result.rows && result.rows[0]?.id);

    const token = jwt.sign(
      { userId: userId, username, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        username,
        email,
        fullName,
        avatar,
        role: 'user'
      }
    });
  } catch (err) {
    if (err.message.includes('UNIQUE') || err.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
  const { fullName, email, phone, company } = req.body;
  const userId = req.user.userId;

  // Update avatar based on new name
  const avatar = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : null;

  try {
    const result = await runQuery(
      'UPDATE users SET "fullName" = ?, email = ?, phone = ?, company = ?, avatar = COALESCE(?, avatar) WHERE id = ?',
      [fullName, email, phone, company, avatar, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get updated user
    const user = await getOne('SELECT id, username, email, "fullName", avatar, role, phone, company FROM users WHERE id = ?', [userId]);
    res.json(user);
  } catch (err) {
    if (err.message.includes('UNIQUE') || err.message.includes('duplicate key')) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
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

  try {
    const user = await getOne('SELECT password FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await runQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await getOne('SELECT id, username, email, "fullName", avatar, role, phone, company, "createdAt" FROM users WHERE id = ?', [userId]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
