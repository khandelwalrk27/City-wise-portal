const express = require('express');
const router = express.Router();
const { seedDatabase } = require('../seed/seedData');

// Seed database on demand
router.post('/reset-and-seed', async (req, res) => {
  try {
    await seedDatabase();
    return res.json({ message: 'Database reset and demo data seeded successfully.' });
  } catch (err) {
    console.error('Seed endpoint error:', err);
    return res.status(500).json({ error: 'Failed to reset and seed database.' });
  }
});

module.exports = router;
