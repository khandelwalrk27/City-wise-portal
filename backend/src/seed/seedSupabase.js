const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { getSupabaseClient, isSupabaseConfigured } = require('../config/supabaseDb');

async function seedSupabaseDatabase() {
  if (!isSupabaseConfigured()) {
    console.log('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured. Skipping Supabase seeding.');
    return;
  }

  console.log('Starting CityWise Jaipur Supabase database seeding...');
  const supabase = getSupabaseClient();

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Authorities
  const authoritiesData = [
    { name: 'Nagar Nigam Jaipur - Public Works Dept (PWD Roads)', code: 'NNJ-ROAD', department: 'Road Infrastructure & Bridges', contact_email: 'pwd.roads@jaipur.gov.in', phone: '0141-2740001' },
    { name: 'Jaipur Public Health Engineering Dept (PHED Water)', code: 'NNJ-WATER', department: 'Water Supply & Pipelines', contact_email: 'phed.water@jaipur.gov.in', phone: '0141-2740002' },
    { name: 'Nagar Nigam Greater Sanitation & Waste Mgmt', code: 'NNJ-SAN', department: 'Solid Waste & Public Hygiene', contact_email: 'sanitation@jaipur.gov.in', phone: '0141-2740003' },
    { name: 'Jaipur Development Authority (JDA Street Lighting)', code: 'NNJ-LIGHT', department: 'Electrical & Smart Lighting', contact_email: 'electrical@jda.gov.in', phone: '0141-2740004' },
    { name: 'Nagar Nigam Drainage & Nallah Maintenance', code: 'NNJ-DRAIN', department: 'Stormwater & Flood Control', contact_email: 'drainage@jaipur.gov.in', phone: '0141-2740005' }
  ];

  for (const auth of authoritiesData) {
    await supabase.from('authorities').upsert(auth, { onConflict: 'code' });
  }

  const { data: dbAuths } = await supabase.from('authorities').select('*');
  const authMap = {};
  (dbAuths || []).forEach(a => { authMap[a.code] = a.id; });

  // 2. Demo Users
  const usersData = [
    { name: 'Rajesh Sharma (Jaipur Citizen)', email: 'citizen@citywise.org', password_hash: passwordHash, role: 'CITIZEN', authority_id: null, phone: '9829012345' },
    { name: 'Pooja Verma (Jaipur Citizen)', email: 'pooja@citywise.org', password_hash: passwordHash, role: 'CITIZEN', authority_id: null, phone: '9829054321' },
    { name: 'Engineer Vikram Singh (PWD Roads Officer)', email: 'roads@citywise.org', password_hash: passwordHash, role: 'AUTHORITY', authority_id: authMap['NNJ-ROAD'], phone: '9414011223' },
    { name: 'Officer Sunita Meena (PHED Water Specialist)', email: 'water@citywise.org', password_hash: passwordHash, role: 'AUTHORITY', authority_id: authMap['NNJ-WATER'], phone: '9414022334' },
    { name: 'Inspector Mohan Lal (Nagar Nigam Sanitation)', email: 'sanitation@citywise.org', password_hash: passwordHash, role: 'AUTHORITY', authority_id: authMap['NNJ-SAN'], phone: '9414033445' },
    { name: 'Supervisor Anil Gupta (JDA Electrical)', email: 'lighting@citywise.org', password_hash: passwordHash, role: 'AUTHORITY', authority_id: authMap['NNJ-LIGHT'], phone: '9414044556' },
    { name: 'Nagar Nigam Admin Officer', email: 'admin@citywise.org', password_hash: adminPasswordHash, role: 'ADMIN', authority_id: null, phone: '0141-2740000' }
  ];

  for (const u of usersData) {
    await supabase.from('users').upsert(u, { onConflict: 'email' });
  }

  // 3. Wards from GeoJSON
  const geojsonPath = path.join(__dirname, '../../../data/wards.geojson');
  if (fs.existsSync(geojsonPath)) {
    const geo = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    for (const f of geo.features) {
      const p = f.properties;
      const descWithParshad = `${p.description} | Parshad: ${p.parshad_name} (Mob: ${p.parshad_phone}, ${p.party})`;
      await supabase.from('wards').upsert({
        name: p.name,
        code: p.code,
        boundary_geojson: f.geometry,
        description: descWithParshad,
        population: p.population || 40000,
        area_sq_km: p.area_sq_km || 5.0
      }, { onConflict: 'code' });
    }
  }

  // 4. Categories
  const categoriesData = [
    { name: 'Road Damage & Potholes', code: 'potholes', icon: 'alert-triangle', default_priority: 'HIGH', description: 'Broken asphalt, craters on main arterial roads.' },
    { name: 'Waterlogging & Flooding', code: 'waterlogging', icon: 'droplet', default_priority: 'CRITICAL', description: 'Stagnant monsoon rain, clogged road crossings.' },
    { name: 'Garbage & Solid Waste Dump', code: 'garbage', icon: 'trash-2', default_priority: 'MEDIUM', description: 'Uncollected waste piles, roadside illegal dumping.' },
    { name: 'Broken Streetlights', code: 'streetlights', icon: 'sun', default_priority: 'MEDIUM', description: 'Dark road stretches, non-functional sodium lamps.' },
    { name: 'Drainage & Sewage Overflow', code: 'drainage', icon: 'wind', default_priority: 'HIGH', description: 'Open drainage lines, foul sewer overflow.' },
    { name: 'Sanitation & Public Hygiene', code: 'sanitation', icon: 'shield-alert', default_priority: 'HIGH', description: 'Unhygienic public spaces.' },
    { name: 'Overflowing Garbage Bins', code: 'bins', icon: 'archive', default_priority: 'LOW', description: 'Commercial dumpster spillover.' }
  ];

  for (const c of categoriesData) {
    await supabase.from('categories').upsert(c, { onConflict: 'code' });
  }

  console.log('CityWise Jaipur Supabase database successfully seeded!');
}

if (require.main === module) {
  require('dotenv').config();
  seedSupabaseDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Supabase seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seedSupabaseDatabase };
