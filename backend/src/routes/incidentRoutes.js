const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { linkToDuplicateGroup, findPotentialDuplicates } = require('../services/duplicateService');
const { authenticateToken, requireRole } = require('../middleware/auth');

// List Duplicate Incident Groups
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const groups = await db.all(`
      SELECT dg.*, 
             c.name as category_name, 
             w.name as ward_name,
             (SELECT COUNT(*) FROM issues i WHERE i.duplicate_group_id = dg.id) as linked_issue_count
      FROM duplicate_groups dg
      LEFT JOIN categories c ON dg.category_id = c.id
      LEFT JOIN wards w ON dg.ward_id = w.id
      ORDER BY dg.created_at DESC
    `);
    return res.json({ groups });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch incident groups.' });
  }
});

// Link two issues into a duplicate group
router.post('/link', authenticateToken, async (req, res) => {
  try {
    const { primaryIssueId, candidateIssueId } = req.body;
    if (!primaryIssueId || !candidateIssueId) {
      return res.status(400).json({ error: 'primaryIssueId and candidateIssueId are required.' });
    }

    const result = await linkToDuplicateGroup(primaryIssueId, candidateIssueId);
    return res.json({ message: 'Issues linked to duplicate group successfully', result });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to link issues.' });
  }
});

// Detect duplicate candidates for an issue
router.post('/detect-duplicates', async (req, res) => {
  try {
    const { latitude, longitude, category_id, title, description, issue_id } = req.body;
    const candidates = await findPotentialDuplicates({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      categoryId: parseInt(category_id),
      title,
      description,
      excludeIssueId: issue_id ? parseInt(issue_id) : null
    });
    return res.json({ candidates });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to detect duplicates.' });
  }
});

module.exports = router;
