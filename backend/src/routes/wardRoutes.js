const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { getWardsGeoJSON, getWardFromCoordinates } = require('../services/wardService');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Get all wards list
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const wards = await db.all(`
      SELECT w.*, COUNT(i.id) as issue_count
      FROM wards w
      LEFT JOIN issues i ON w.id = i.ward_id
      GROUP BY w.id
      ORDER BY w.name ASC
    `);
    return res.json({ wards });
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching wards.' });
  }
});

// Get GeoJSON for map rendering
router.get('/geojson', async (req, res) => {
  try {
    const geojson = await getWardsGeoJSON();
    return res.json(geojson);
  } catch (err) {
    return res.status(500).json({ error: 'Error generating wards GeoJSON.' });
  }
});

// Detect Ward from Coordinates
router.post('/detect', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Latitude and longitude are required.' });
    }

    const result = await getWardFromCoordinates(latitude, longitude);
    return res.json(result);
  } catch (err) {
    console.error('Ward detection error:', err);
    return res.status(500).json({ error: 'Error during ward detection.' });
  }
});

// Create Ward (Admin)
router.post('/', authenticateToken, requireRole('ADMIN'), async (req, res) => {
  try {
    const { name, code, boundary_geojson, description, population, area_sq_km } = req.body;

    if (!name || !code || !boundary_geojson) {
      return res.status(400).json({ error: 'Name, code, and boundary GeoJSON are required.' });
    }

    const db = await getDB();
    const geojsonStr = typeof boundary_geojson === 'object' ? JSON.stringify(boundary_geojson) : boundary_geojson;

    const result = await db.run(
      `INSERT INTO wards (name, code, boundary_geojson, description, population, area_sq_km)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, code, geojsonStr, description || '', population || 0, area_sq_km || 0.0]
    );

    const newWard = await db.get('SELECT * FROM wards WHERE id = ?', [result.lastID]);
    return res.status(201).json({ message: 'Ward created successfully', ward: newWard });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create ward.' });
  }
});

module.exports = router;
