const express = require('express');
const router = express.Router();
const { suggestCategoryAndPriority, summarizeIssue, naturalLanguageSearch, generatePlainLanguageSummary } = require('../services/aiService');
const { getDB } = require('../config/db');

// Suggest Category & Priority from input description
router.post('/suggest', async (req, res) => {
  try {
    const { description } = req.body;
    const result = await suggestCategoryAndPriority(description);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate AI suggestion.' });
  }
});

// Summarize issue
router.post('/summarize', async (req, res) => {
  try {
    const { title, description } = req.body;
    const summary = await summarizeIssue(title, description);
    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to summarize issue.' });
  }
});

// Natural Language Search over existing issues
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const db = await getDB();
    const issues = await db.all(`
      SELECT i.*, c.name as category_name, w.name as ward_name, a.name as authority_name
      FROM issues i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN wards w ON i.ward_id = w.id
      LEFT JOIN authorities a ON i.authority_id = a.id
    `);

    const results = await naturalLanguageSearch(q, issues);
    return res.json({ query: q, count: results.length, results });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to execute natural language search.' });
  }
});

// Plain Language Analytics Summary
router.get('/executive-summary', async (req, res) => {
  try {
    const db = await getDB();
    const totalRes = await db.get('SELECT COUNT(*) as count FROM issues');
    const resolvedRes = await db.get('SELECT COUNT(*) as count FROM issues WHERE status = "CLOSED"');
    const topWardRes = await db.get('SELECT w.name FROM issues i JOIN wards w ON i.ward_id = w.id GROUP BY w.id ORDER BY COUNT(i.id) DESC LIMIT 1');
    const topCatRes = await db.get('SELECT c.name FROM issues i JOIN categories c ON i.category_id = c.id GROUP BY c.id ORDER BY COUNT(i.id) DESC LIMIT 1');

    const summary = await generatePlainLanguageSummary({
      totalIssues: totalRes ? totalRes.count : 0,
      resolvedIssues: resolvedRes ? resolvedRes.count : 0,
      topWard: topWardRes ? topWardRes.name : 'Metro Central Ward',
      topCategory: topCatRes ? topCatRes.name : 'Road Damage / Potholes'
    });

    return res.json(summary);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate plain language summary.' });
  }
});

module.exports = router;
