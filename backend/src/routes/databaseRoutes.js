const express = require('express');
const router = express.Router();
const { getDB, isSupabaseConfigured, getSupabaseClient } = require('../config/db');

router.get('/status', async (req, res) => {
  try {
    const supabaseConfigured = isSupabaseConfigured();

    if (supabaseConfigured) {
      try {
        const supabase = getSupabaseClient();
        const startTime = Date.now();
        const { data: auths, error, count: authCount } = await supabase.from('authorities').select('*', { count: 'exact', head: true });
        const latency = Date.now() - startTime;

        if (error) {
          return res.json({
            engine: 'supabase',
            configured: true,
            healthy: false,
            url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/https:\/\/(.{4}).*(\..*)/, 'https://$1***$2') : null,
            error: error.message,
            needsMigration: error.code === '42P01' || error.message.includes('does not exist'),
            message: 'Supabase credentials set, but tables need to be migrated using data/supabase_schema.sql'
          });
        }

        const { count: wardCount } = await supabase.from('wards').select('*', { count: 'exact', head: true });
        const { count: issueCount } = await supabase.from('issues').select('*', { count: 'exact', head: true });

        return res.json({
          engine: 'supabase',
          configured: true,
          healthy: true,
          url: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.replace(/https:\/\/(.{4}).*(\..*)/, 'https://$1***$2') : null,
          latencyMs: latency,
          counts: {
            authorities: authCount || 0,
            wards: wardCount || 0,
            issues: issueCount || 0
          },
          message: 'Connected to Supabase PostgreSQL'
        });
      } catch (sbErr) {
        return res.json({
          engine: 'supabase',
          configured: true,
          healthy: false,
          error: sbErr.message,
          message: 'Error communicating with Supabase'
        });
      }
    }

    // SQLite mode
    const db = await getDB();
    const authRow = await db.get('SELECT COUNT(*) as count FROM authorities');
    const wardRow = await db.get('SELECT COUNT(*) as count FROM wards');
    const issueRow = await db.get('SELECT COUNT(*) as count FROM issues');

    return res.json({
      engine: 'sqlite',
      configured: false,
      healthy: true,
      databaseFile: process.env.DB_PATH || 'database/citywise.sqlite',
      counts: {
        authorities: authRow?.count || 0,
        wards: wardRow?.count || 0,
        issues: issueRow?.count || 0
      },
      message: 'Operating on local SQLite. Add SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY to switch to Supabase.'
    });
  } catch (err) {
    return res.status(500).json({
      healthy: false,
      error: err.message
    });
  }
});

module.exports = router;
