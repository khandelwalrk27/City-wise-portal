const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDB } = require('../config/db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'CITIZEN', authority_id, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const db = await getDB();
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const validRole = ['CITIZEN', 'AUTHORITY', 'ADMIN'].includes(role) ? role : 'CITIZEN';

    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, role, authority_id, phone)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, validRole, authority_id || null, phone || null]
    );

    const newUser = await db.get(
      `SELECT u.id, u.name, u.email, u.role, u.authority_id, u.phone, a.name as authority_name
       FROM users u
       LEFT JOIN authorities a ON u.authority_id = a.id
       WHERE u.id = ?`,
      [result.lastID]
    );

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, authority_id: newUser.authority_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Error in /register:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDB();
    const user = await db.get(
      `SELECT u.*, a.name as authority_name
       FROM users u
       LEFT JOIN authorities a ON u.authority_id = a.id
       WHERE u.email = ?`,
      [email.toLowerCase().trim()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, authority_id: user.authority_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Error in /login:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Get Current Profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDB();
    const user = await db.get(
      `SELECT u.id, u.name, u.email, u.role, u.authority_id, u.phone, u.avatar_url, u.created_at, a.name as authority_name
       FROM users u
       LEFT JOIN authorities a ON u.authority_id = a.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching profile.' });
  }
});

module.exports = router;
