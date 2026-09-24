const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { getDB } = require('../config/db');

async function seedDatabase() {
  console.log('Starting CityWise Jaipur database seeding...');
  const db = await getDB();

  // Clear existing records safely
  await db.exec('DELETE FROM notifications;');
  await db.exec('DELETE FROM supports;');
  await db.exec('DELETE FROM status_histories;');
  await db.exec('DELETE FROM media;');
  await db.exec('DELETE FROM issues;');
  await db.exec('DELETE FROM duplicate_groups;');
  await db.exec('DELETE FROM ward_authorities;');
  await db.exec('DELETE FROM categories;');
  await db.exec('DELETE FROM wards;');
  await db.exec('DELETE FROM users;');
  await db.exec('DELETE FROM authorities;');

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // 1. Seed Jaipur Municipal Authorities (Nagar Nigam Greater Jaipur)
  const authoritiesData = [
    { name: 'Nagar Nigam Jaipur - Public Works Dept (PWD Roads)', code: 'NNJ-ROAD', department: 'Road Infrastructure & Bridges', email: 'pwd.roads@jaipur.gov.in', phone: '0141-2740001' },
    { name: 'Jaipur Public Health Engineering Dept (PHED Water)', code: 'NNJ-WATER', department: 'Water Supply & Pipelines', email: 'phed.water@jaipur.gov.in', phone: '0141-2740002' },
    { name: 'Nagar Nigam Greater Sanitation & Waste Mgmt', code: 'NNJ-SAN', department: 'Solid Waste & Public Hygiene', email: 'sanitation@jaipur.gov.in', phone: '0141-2740003' },
    { name: 'Jaipur Development Authority (JDA Street Lighting)', code: 'NNJ-LIGHT', department: 'Electrical & Smart Lighting', email: 'electrical@jda.gov.in', phone: '0141-2740004' },
    { name: 'Nagar Nigam Drainage & Nallah Maintenance', code: 'NNJ-DRAIN', department: 'Stormwater & Flood Control', email: 'drainage@jaipur.gov.in', phone: '0141-2740005' }
  ];

  const authIds = {};
  for (const auth of authoritiesData) {
    const res = await db.run(
      `INSERT INTO authorities (name, code, department, contact_email, phone) VALUES (?, ?, ?, ?, ?)`,
      [auth.name, auth.code, auth.department, auth.email, auth.phone]
    );
    authIds[auth.code] = res.lastID;
  }

  // 2. Seed Demo Users
  const usersData = [
    { name: 'Rajesh Sharma (Jaipur Citizen)', email: 'citizen@citywise.org', password: passwordHash, role: 'CITIZEN', authId: null, phone: '9829012345' },
    { name: 'Pooja Verma (Jaipur Citizen)', email: 'pooja@citywise.org', password: passwordHash, role: 'CITIZEN', authId: null, phone: '9829054321' },
    { name: 'Engineer Vikram Singh (PWD Roads Officer)', email: 'roads@citywise.org', password: passwordHash, role: 'AUTHORITY', authId: authIds['NNJ-ROAD'], phone: '9414011223' },
    { name: 'Officer Sunita Meena (PHED Water Specialist)', email: 'water@citywise.org', password: passwordHash, role: 'AUTHORITY', authId: authIds['NNJ-WATER'], phone: '9414022334' },
    { name: 'Inspector Mohan Lal (Nagar Nigam Sanitation)', email: 'sanitation@citywise.org', password: passwordHash, role: 'AUTHORITY', authId: authIds['NNJ-SAN'], phone: '9414033445' },
    { name: 'Supervisor Anil Gupta (JDA Electrical)', email: 'lighting@citywise.org', password: passwordHash, role: 'AUTHORITY', authId: authIds['NNJ-LIGHT'], phone: '9414044556' },
    { name: 'Nagar Nigam Admin Officer', email: 'admin@citywise.org', password: adminPasswordHash, role: 'ADMIN', authId: null, phone: '0141-2740000' }
  ];

  const userIds = {};
  for (const u of usersData) {
    const res = await db.run(
      `INSERT INTO users (name, email, password_hash, role, authority_id, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [u.name, u.email, u.password, u.role, u.authId, u.phone]
    );
    userIds[u.email] = res.lastID;
  }

  // 3. Seed Wards from Jaipur GeoJSON
  const geojsonPath = path.join(__dirname, '../../../data/wards.geojson');
  let wardsFeatures = [];
  if (fs.existsSync(geojsonPath)) {
    const geo = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    wardsFeatures = geo.features;
  }

  const wardIds = {};
  for (const f of wardsFeatures) {
    const props = f.properties;
    const descWithParshad = `${props.description} | Parshad: ${props.parshad_name} (Mob: ${props.parshad_phone}, ${props.party})`;
    const res = await db.run(
      `INSERT INTO wards (name, code, boundary_geojson, description, population, area_sq_km)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [props.name, props.code, JSON.stringify(f.geometry), descWithParshad, props.population || 40000, props.area_sq_km || 5.0]
    );
    wardIds[props.code] = res.lastID;
  }

  // 4. Seed Categories
  const categoriesData = [
    { name: 'Road Damage & Potholes', code: 'potholes', icon: 'alert-triangle', priority: 'HIGH', desc: 'Broken asphalt, craters on main arterial roads.' },
    { name: 'Waterlogging & Flooding', code: 'waterlogging', icon: 'droplet', priority: 'CRITICAL', desc: 'Stagnant monsoon rain, clogged road crossings.' },
    { name: 'Garbage & Solid Waste Dump', code: 'garbage', icon: 'trash-2', priority: 'MEDIUM', desc: 'Uncollected waste piles, roadside illegal dumping.' },
    { name: 'Broken Streetlights', code: 'streetlights', icon: 'sun', priority: 'MEDIUM', desc: 'Dark road stretches, non-functional sodium lamps.' },
    { name: 'Drainage & Sewage Overflow', code: 'drainage', icon: 'wind', priority: 'HIGH', desc: 'Open drainage lines, foul sewer overflow.' },
    { name: 'Sanitation & Public Hygiene', code: 'sanitation', icon: 'shield-alert', priority: 'HIGH', desc: 'Unhygienic market corridors and public restrooms.' },
    { name: 'Overflowing Garbage Bins', code: 'bins', icon: 'archive', priority: 'LOW', desc: 'Commercial dumpster spillover requiring hopper truck collection.' }
  ];

  const catIds = {};
  for (const c of categoriesData) {
    const res = await db.run(
      `INSERT INTO categories (name, code, icon, description, default_priority) VALUES (?, ?, ?, ?, ?)`,
      [c.name, c.code, c.icon, c.desc, c.priority]
    );
    catIds[c.code] = res.lastID;
  }

  // 5. Seed Jaipur Ward-Authority Mappings
  const wardCodes = Object.keys(wardIds);
  for (const code of wardCodes) {
    const wId = wardIds[code];
    await db.run(`INSERT INTO ward_authorities (ward_id, category_id, authority_id, is_primary) VALUES (?, ?, ?, 1)`, [wId, catIds['potholes'], authIds['NNJ-ROAD']]);
    await db.run(`INSERT INTO ward_authorities (ward_id, category_id, authority_id, is_primary) VALUES (?, ?, ?, 1)`, [wId, catIds['waterlogging'], authIds['NNJ-WATER']]);
    await db.run(`INSERT INTO ward_authorities (ward_id, category_id, authority_id, is_primary) VALUES (?, ?, ?, 1)`, [wId, catIds['garbage'], authIds['NNJ-SAN']]);
    await db.run(`INSERT INTO ward_authorities (ward_id, category_id, authority_id, is_primary) VALUES (?, ?, ?, 1)`, [wId, catIds['streetlights'], authIds['NNJ-LIGHT']]);
    await db.run(`INSERT INTO ward_authorities (ward_id, category_id, authority_id, is_primary) VALUES (?, ?, ?, 1)`, [wId, catIds['drainage'], authIds['NNJ-DRAIN']]);
    await db.run(`INSERT INTO ward_authorities (ward_id, category_id, authority_id, is_primary) VALUES (?, ?, ?, 1)`, [wId, catIds['sanitation'], authIds['NNJ-SAN']]);
    await db.run(`INSERT INTO ward_authorities (ward_id, category_id, authority_id, is_primary) VALUES (?, ?, ?, 1)`, [wId, catIds['bins'], authIds['NNJ-SAN']]);
  }

  // 6. Seed Jaipur Realistic Issues
  const demoIssues = [
    {
      title: 'Deep road pothole near WTP Circle, Malviya Nagar',
      description: 'Massive asphalt crater near World Trade Park exit causing heavy traffic bottleneck during peak office hours.',
      catCode: 'potholes', wardCode: 'JP-WARD-125', authCode: 'NNJ-ROAD', citizenEmail: 'citizen@citywise.org',
      status: 'VERIFICATION_PENDING', priority: 'HIGH', lat: 26.8650, lng: 75.8150, address: 'Calgiri Marg, Near WTP, Malviya Nagar, Jaipur',
      mediaUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
      resolutionUrl: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
      resNotes: 'Nagar Nigam road maintenance crew filled the crater with hot-mix asphalt and compacted with roller.'
    },
    {
      title: 'Severe rainwater logging at Khatipura Flyover, Jhotwara',
      description: 'Rain monsoon drainage blockage causing 2 feet water accumulation near Khatipura crossing.',
      catCode: 'waterlogging', wardCode: 'JP-WARD-043', authCode: 'NNJ-WATER', citizenEmail: 'pooja@citywise.org',
      status: 'IN_PROGRESS', priority: 'CRITICAL', lat: 26.9400, lng: 75.7400, address: 'Khatipura Flyover Junction, Jhotwara, Jaipur',
      mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80'
    },
    {
      title: 'Uncollected garbage dump behind Textile Market, Sanganer',
      description: 'Commercial waste piles left uncleaned for 3 days near Tonk Road junction.',
      catCode: 'garbage', wardCode: 'JP-WARD-070', authCode: 'NNJ-SAN', citizenEmail: 'citizen@citywise.org',
      status: 'CLOSED', priority: 'MEDIUM', lat: 26.8200, lng: 75.7800, address: 'Block C, Sanganer Textile Colony, Jaipur',
      mediaUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
      resolutionUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
      resNotes: 'Nagar Nigam compaction trucks cleared 4 tons of waste and sanitized the site.'
    },
    {
      title: 'Dark streetlight stretch on Sector 2 Main Road, Vidhyadhar Nagar',
      description: '5 LED street poles non-operational for 4 nights, raising safety concerns for pedestrians.',
      catCode: 'streetlights', wardCode: 'JP-WARD-001', authCode: 'NNJ-LIGHT', citizenEmail: 'pooja@citywise.org',
      status: 'ASSIGNED', priority: 'MEDIUM', lat: 26.9600, lng: 75.7700, address: 'Sector 2 Main Road, Vidhyadhar Nagar, Jaipur'
    },
    {
      title: 'Open sewer line near Ajmer Road entrance, Bagru Expressway',
      description: 'Choked drain line causing foul smell and open overflow onto the service lane.',
      catCode: 'drainage', wardCode: 'JP-WARD-104', authCode: 'NNJ-DRAIN', citizenEmail: 'citizen@citywise.org',
      status: 'REOPENED', priority: 'CRITICAL', lat: 26.8700, lng: 75.7000, address: 'Ajmer Road Service Lane, Bagru Zone, Jaipur',
      mediaUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      resNotes: 'Drain unclogged, but citizen requested concrete cover replacement for permanent resolution.'
    },
    {
      title: 'Damaged pavement tiles near Apex Circle, Malviya Nagar',
      description: 'Broken pedestrian footpath pavers near Fortis Hospital crossing.',
      catCode: 'potholes', wardCode: 'JP-WARD-142', authCode: 'NNJ-ROAD', citizenEmail: 'pooja@citywise.org',
      status: 'REPORTED', priority: 'LOW', lat: 26.8600, lng: 75.8600, address: 'Apex Circle Footpath, Malviya Nagar, Jaipur'
    }
  ];

  for (const issue of demoIssues) {
    const catId = catIds[issue.catCode];
    const wardId = wardIds[issue.wardCode];
    const authId = authIds[issue.authCode];
    const citId = userIds[issue.citizenEmail];

    const res = await db.run(
      `INSERT INTO issues 
       (title, description, category_id, ward_id, authority_id, citizen_id, status, priority, latitude, longitude, address, resolution_notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [issue.title, issue.description, catId, wardId, authId, citId, issue.status, issue.priority, issue.lat, issue.lng, issue.address, issue.resNotes || null]
    );

    const issueId = res.lastID;

    // Timeline entries
    await db.run(
      `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks)
       VALUES (?, NULL, 'REPORTED', ?, 'Issue registered on CityWise Jaipur platform.')`,
      [issueId, citId]
    );

    if (['ASSIGNED', 'IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'VERIFICATION_PENDING', 'CLOSED', 'REOPENED'].includes(issue.status)) {
      await db.run(
        `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks)
         VALUES (?, 'REPORTED', 'ASSIGNED', ?, 'Automated Jaipur ward detection assigned issue to department engineer.')`,
        [issueId, userIds['admin@citywise.org']]
      );
    }

    if (['IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'VERIFICATION_PENDING', 'CLOSED', 'REOPENED'].includes(issue.status)) {
      await db.run(
        `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks)
         VALUES (?, 'ASSIGNED', 'IN_PROGRESS', ?, 'Field repair work order dispatched to site.')`,
        [issueId, userIds['roads@citywise.org']]
      );
    }

    if (['VERIFICATION_PENDING', 'CLOSED', 'REOPENED'].includes(issue.status)) {
      await db.run(
        `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks)
         VALUES (?, 'IN_PROGRESS', 'VERIFICATION_PENDING', ?, ?)`,
        [issueId, userIds['roads@citywise.org'], issue.resNotes || 'Resolution completed. Submitted evidence for citizen review.']
      );
    }

    if (issue.status === 'CLOSED') {
      await db.run(
        `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks)
         VALUES (?, 'VERIFICATION_PENDING', 'CLOSED', ?, 'Citizen verified Jaipur site resolution work. Issue closed.')`,
        [issueId, citId]
      );
    } else if (issue.status === 'REOPENED') {
      await db.run(
        `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks)
         VALUES (?, 'VERIFICATION_PENDING', 'REOPENED', ?, 'Citizen requested heavy concrete slab replacement.')`,
        [issueId, citId]
      );
    }

    // Attach Media
    if (issue.mediaUrl) {
      await db.run(
        `INSERT INTO media (issue_id, file_url, file_type, media_stage, uploaded_by_id) VALUES (?, ?, 'IMAGE', 'REPORT', ?)`,
        [issueId, issue.mediaUrl, citId]
      );
    }

    if (issue.resolutionUrl) {
      await db.run(
        `INSERT INTO media (issue_id, file_url, file_type, media_stage, uploaded_by_id) VALUES (?, ?, 'IMAGE', 'RESOLUTION', ?)`,
        [issueId, issue.resolutionUrl, userIds['roads@citywise.org']]
      );
    }

    // Add upvotes
    await db.run(`INSERT INTO supports (issue_id, user_id) VALUES (?, ?)`, [issueId, userIds['citizen@citywise.org']]);
    await db.run(`INSERT INTO supports (issue_id, user_id) VALUES (?, ?)`, [issueId, userIds['pooja@citywise.org']]);
  }

  // 7. Seed Notifications
  await db.run(
    `INSERT INTO notifications (user_id, title, message, type, issue_id, is_read)
     VALUES (?, 'Action Required: Resolution Submitted', 'Resolution evidence submitted for your issue #1 near WTP Malviya Nagar. Please verify.', 'VERIFICATION_REQUIRED', 1, 0)`,
    [userIds['citizen@citywise.org']]
  );

  await db.run(
    `INSERT INTO notifications (user_id, title, message, type, issue_id, is_read)
     VALUES (?, 'New Issue Assigned: #2', 'Severe waterlogging reported at Khatipura Flyover, Jhotwara.', 'ISSUE_ASSIGNED', 2, 0)`,
    [userIds['water@citywise.org']]
  );

  console.log('CityWise Jaipur database successfully seeded with official Jaipur Parshads and realistic civic data!');
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
