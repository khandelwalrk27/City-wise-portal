const path = require('path');
// Load environment variables from backend/.env and root .env
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { getSupabaseClient, isSupabaseConfigured } = require('../config/supabaseDb');

async function testConnection() {
  console.log('====================================================');
  console.log('CityWise Jaipur - Supabase Connection Health Check');
  console.log('====================================================');

  if (!isSupabaseConfigured()) {
    console.log('❌ Supabase credentials are NOT configured yet.\n');
    console.log('Please paste your Supabase Project credentials into backend/.env (or root .env):');
    console.log('----------------------------------------------------');
    console.log('SUPABASE_URL=https://<your-project-id>.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret-key>');
    console.log('SUPABASE_ANON_KEY=<your-anon-public-key>');
    console.log('----------------------------------------------------');
    console.log('Where to find them:');
    console.log('1. Go to https://supabase.com/dashboard/project/_/settings/api');
    console.log('2. Copy Project URL -> SUPABASE_URL');
    console.log('3. Copy "anon public" -> SUPABASE_ANON_KEY');
    console.log('4. Copy "service_role secret" (Reveal) -> SUPABASE_SERVICE_ROLE_KEY\n');
    return false;
  }

  console.log(`📡 Connecting to Supabase Project: ${process.env.SUPABASE_URL}`);
  try {
    const supabase = getSupabaseClient();
    const startTime = Date.now();

    // Query authorities
    const { data: auths, error, count } = await supabase.from('authorities').select('*', { count: 'exact' }).limit(5);
    const latency = Date.now() - startTime;

    if (error) {
      if (error.code === '42P01' || (error.message && error.message.toLowerCase().includes('does not exist'))) {
        console.log('⚠️  Connected to Supabase successfully, but database tables do not exist yet.');
        console.log('\n👉 Next step to create tables:');
        console.log('1. Go to your Supabase Project -> SQL Editor: https://supabase.com/dashboard/project/_/sql');
        console.log('2. Paste the contents of: data/supabase_schema.sql');
        console.log('3. Click "Run"');
        console.log('4. Then run: npm run seed:supabase\n');
      } else {
        console.error('❌ Supabase Error:', error.message);
      }
      return false;
    }

    console.log(`✅ Successfully connected to Supabase PostgreSQL! (Latency: ${latency}ms)`);
    console.log(`📊 Registered Authorities: ${count || 0}`);

    const { count: wardCount } = await supabase.from('wards').select('*', { count: 'exact', head: true });
    const { count: issueCount } = await supabase.from('issues').select('*', { count: 'exact', head: true });
    console.log(`🏛️  Wards Configured: ${wardCount || 0}`);
    console.log(`📋 Reported Issues: ${issueCount || 0}`);

    if ((count || 0) === 0 && (wardCount || 0) === 0) {
      console.log('\n💡 Note: Tables are created, but currently empty. Run:');
      console.log('   npm run seed:supabase');
      console.log('   to populate official Jaipur Parshad and initial civic data.\n');
    }

    return true;
  } catch (err) {
    console.error('❌ Connection exception:', err.message);
    return false;
  }
}

if (require.main === module) {
  testConnection().then(() => process.exit(0)).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { testConnection };
