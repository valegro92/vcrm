const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { runQuery, getOne, getReturningClause } = require('../database/helpers');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const router = express.Router();

// Generate secure random token
const generateToken = () => crypto.randomBytes(32).toString('hex');

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
  const { username, email, password, fullName, company } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatar = fullName ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : username.substring(0, 2).toUpperCase();

    const result = await runQuery(
      `INSERT INTO users (username, email, password, "fullName", avatar, company) VALUES (?, ?, ?, ?, ?, ?) ${getReturningClause()}`,
      [username, email, hashedPassword, fullName, avatar, company || null]
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
        company,
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

// Forgot Password - Request reset link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await getOne('SELECT id, email, "fullName" FROM users WHERE email = ?', [email]);

    // Don't reveal if user exists or not for security
    if (!user) {
      return res.json({ message: 'Se l\'email esiste, riceverai le istruzioni per il reset' });
    }

    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await runQuery(
      'UPDATE users SET "resetToken" = ?, "resetExpires" = ? WHERE id = ?',
      [resetToken, resetExpires.toISOString(), user.id]
    );

    // Send email (non-blocking)
    sendPasswordResetEmail(user.email, resetToken, user.fullName).catch(err => {
      console.error('Failed to send password reset email:', err);
    });

    res.json({ message: 'Se l\'email esiste, riceverai le istruzioni per il reset' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Reset Password - Set new password with token
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: 'Token e nuova password sono obbligatori' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve essere di almeno 6 caratteri' });
  }

  try {
    const user = await getOne(
      'SELECT id, "resetExpires" FROM users WHERE "resetToken" = ?',
      [token]
    );

    if (!user) {
      return res.status(400).json({ error: 'Token non valido o scaduto' });
    }

    const expiry = new Date(user.resetExpires);
    if (expiry < new Date()) {
      return res.status(400).json({ error: 'Token scaduto. Richiedi un nuovo reset.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await runQuery(
      'UPDATE users SET password = ?, "resetToken" = NULL, "resetExpires" = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password aggiornata con successo' });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Verify Email
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await getOne(
      'SELECT id FROM users WHERE "verificationToken" = ?',
      [token]
    );

    if (!user) {
      return res.status(400).json({ error: 'Token di verifica non valido' });
    }

    await runQuery(
      'UPDATE users SET "emailVerified" = ?, "verificationToken" = NULL WHERE id = ?',
      [true, user.id]
    );

    res.json({ message: 'Email verificata con successo!' });
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

// Resend verification email
router.post('/resend-verification', auth, async (req, res) => {
  const userId = req.user.userId;

  try {
    const user = await getOne(
      'SELECT id, email, "fullName", "emailVerified" FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'Email già verificata' });
    }

    const verificationToken = generateToken();
    await runQuery(
      'UPDATE users SET "verificationToken" = ? WHERE id = ?',
      [verificationToken, user.id]
    );

    sendVerificationEmail(user.email, verificationToken, user.fullName).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    res.json({ message: 'Email di verifica inviata' });
  } catch (err) {
    console.error('Resend verification error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
