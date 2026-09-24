const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all authorities
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const authorities = await db.all(`
      SELECT a.*, COUNT(i.id) as assigned_issues_count
      FROM authorities a
      LEFT JOIN issues i ON a.id = i.authority_id AND i.status != 'CLOSED'
      GROUP BY a.id
      ORDER BY a.name ASC
    `);
    return res.json({ authorities });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching authorities.' });
  }
});

// Get Ward-Authority Mappings
router.get('/mappings', async (req, res) => {
  try {
    const db = await getDB();
    const mappings = await db.all(`
      SELECT wa.*, w.name as ward_name, w.code as ward_code,
             a.name as authority_name, a.department,
             c.name as category_name
      FROM ward_authorities wa
      JOIN wards w ON wa.ward_id = w.id
      JOIN authorities a ON wa.authority_id = a.id
      LEFT JOIN categories c ON wa.category_id = c.id
      ORDER BY w.name, c.name
    `);
    return res.json({ mappings });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching mappings.' });
  }
});

// Create Authority (ADMIN)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, code, department, contact_email, phone } = req.body;
    if (!name || !code || !department || !contact_email) {
      return res.status(400).json({ error: 'Name, code, department, and contact email are required.' });
    }

    const db = await getDB();
    const result = await db.run(
      `INSERT INTO authorities (name, code, department, contact_email, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [name, code, department, contact_email, phone || '']
    );

    const authority = await db.get('SELECT * FROM authorities WHERE id = ?', [result.lastID]);
    return res.status(201).json({ message: 'Authority created', authority });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create authority.' });
  }
});

// Save or Update Ward-Authority Mapping (ADMIN)
router.post('/mappings', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { ward_id, authority_id, category_id, is_primary = true } = req.body;
    if (!ward_id || !authority_id) {
      return res.status(400).json({ error: 'ward_id and authority_id are required.' });
    }

    const db = await getDB();
    await db.run(
      `INSERT INTO ward_authorities (ward_id, authority_id, category_id, is_primary)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(ward_id, category_id) DO UPDATE SET
       authority_id = excluded.authority_id,
       is_primary = excluded.is_primary`,
      [ward_id, authority_id, category_id || null, is_primary ? 1 : 0]
    );

    return res.json({ message: 'Ward-Authority mapping updated successfully.' });
  } catch (err) {
    console.error('Mapping error:', err);
    return res.status(500).json({ error: 'Failed to update ward authority mapping.' });
  }
});

module.exports = router;
