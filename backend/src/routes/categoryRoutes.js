const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
    return res.json({ categories });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching categories.' });
  }
});

module.exports = router;
