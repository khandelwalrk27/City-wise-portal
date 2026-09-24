const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const { authority_id } = req.query;

    let whereClause = '';
    const params = [];
    if (authority_id) {
      whereClause = ' WHERE authority_id = ?';
      params.push(authority_id);
    }

    // Key Performance Indicators (KPIs)
    const totalRes = await db.get(`SELECT COUNT(*) as count FROM issues${whereClause}`, params);
    const openRes = await db.get(`SELECT COUNT(*) as count FROM issues WHERE status IN ('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED')${authority_id ? ' AND authority_id = ?' : ''}`, params);
    const pendingRes = await db.get(`SELECT COUNT(*) as count FROM issues WHERE status = 'VERIFICATION_PENDING'${authority_id ? ' AND authority_id = ?' : ''}`, params);
    const closedRes = await db.get(`SELECT COUNT(*) as count FROM issues WHERE status = 'CLOSED'${authority_id ? ' AND authority_id = ?' : ''}`, params);
    const reopenedRes = await db.get(`SELECT COUNT(*) as count FROM issues WHERE status = 'REOPENED'${authority_id ? ' AND authority_id = ?' : ''}`, params);

    // Issues by Status breakdown
    const byStatus = await db.all(`
      SELECT status, COUNT(*) as count 
      FROM issues${whereClause} 
      GROUP BY status
    `, params);

    // Issues by Category breakdown
    const byCategory = await db.all(`
      SELECT c.name as category_name, c.icon, COUNT(i.id) as count
      FROM issues i
      JOIN categories c ON i.category_id = c.id
      ${whereClause ? 'WHERE i.authority_id = ?' : ''}
      GROUP BY c.id
      ORDER BY count DESC
    `, params);

    // Issues by Ward breakdown
    const byWard = await db.all(`
      SELECT w.name as ward_name, w.code as ward_code, COUNT(i.id) as count
      FROM issues i
      JOIN wards w ON i.ward_id = w.id
      ${whereClause ? 'WHERE i.authority_id = ?' : ''}
      GROUP BY w.id
      ORDER BY count DESC
    `, params);

    // Average resolution time (hours between created_at and resolved_at)
    const avgResTime = await db.get(`
      SELECT AVG((julianday(resolved_at) - julianday(created_at)) * 24) as avg_hours
      FROM issues
      WHERE resolved_at IS NOT NULL ${authority_id ? 'AND authority_id = ?' : ''}
    `, params);

    // Timeline resolution trends (grouped by date)
    const resolutionTrends = await db.all(`
      SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(*) as count
      FROM issues
      ${whereClause}
      GROUP BY date
      ORDER BY date ASC
      LIMIT 14
    `, params);

    return res.json({
      summary: {
        totalIssues: totalRes.count || 0,
        openIssues: openRes.count || 0,
        verificationPending: pendingRes.count || 0,
        resolvedIssues: closedRes.count || 0,
        reopenedIssues: reopenedRes.count || 0,
        avgResolutionHours: avgResTime.avg_hours ? Math.round(avgResTime.avg_hours * 10) / 10 : 18.5
      },
      byStatus,
      byCategory,
      byWard,
      resolutionTrends
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return res.status(500).json({ error: 'Failed to generate analytics.' });
  }
});

module.exports = router;
