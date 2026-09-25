const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');
const { isSupabaseConfigured, getSupabaseClient } = require('./supabaseDb');

let dbInstance = null;

async function getDB() {
  if (dbInstance) return dbInstance;

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
  const dbDir = isServerless ? '/tmp/citywise_db' : path.join(__dirname, '../../database');
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
    } catch (e) {
      console.warn('DB directory mkdir notice:', e.message);
    }
  }

  const dbPath = isServerless 
    ? path.join(dbDir, 'citywise.sqlite')
    : (process.env.DB_PATH || path.join(dbDir, 'citywise.sqlite'));

  // On serverless, copy bundled pre-seeded sqlite database to /tmp if it exists
  const bundledDb = path.join(__dirname, '../../database/citywise.sqlite');
  if (isServerless && !fs.existsSync(dbPath) && fs.existsSync(bundledDb)) {
    try {
      fs.copyFileSync(bundledDb, dbPath);
    } catch (e) {
      console.warn('Could not copy bundled sqlite to /tmp:', e.message);
    }
  }

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys for SQLite
  await dbInstance.run('PRAGMA foreign_keys = ON;');

  await initTables(dbInstance);

  return dbInstance;
}

async function initTables(db) {
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('CITIZEN', 'AUTHORITY', 'ADMIN')) NOT NULL DEFAULT 'CITIZEN',
      authority_id INTEGER,
      phone TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(authority_id) REFERENCES authorities(id) ON DELETE SET NULL
    );
  `);

  // Authorities table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS authorities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      department TEXT NOT NULL,
      contact_email TEXT NOT NULL,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Wards table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS wards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      boundary_geojson TEXT NOT NULL,
      description TEXT,
      population INTEGER DEFAULT 0,
      area_sq_km REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ward-Authority Mapping table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS ward_authorities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ward_id INTEGER NOT NULL,
      category_id INTEGER,
      authority_id INTEGER NOT NULL,
      is_primary BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(ward_id) REFERENCES wards(id) ON DELETE CASCADE,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE,
      FOREIGN KEY(authority_id) REFERENCES authorities(id) ON DELETE CASCADE,
      UNIQUE(ward_id, category_id)
    );
  `);

  // Categories table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      code TEXT NOT NULL UNIQUE,
      icon TEXT DEFAULT 'alert-circle',
      description TEXT,
      default_priority TEXT CHECK(default_priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Duplicate Groups / Incidents
  await db.exec(`
    CREATE TABLE IF NOT EXISTS duplicate_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category_id INTEGER,
      ward_id INTEGER,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      primary_issue_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL,
      FOREIGN KEY(ward_id) REFERENCES wards(id) ON DELETE SET NULL
    );
  `);

  // Issues table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      ward_id INTEGER,
      authority_id INTEGER,
      citizen_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'VERIFICATION_PENDING', 'CLOSED', 'REOPENED')) NOT NULL DEFAULT 'REPORTED',
      priority TEXT CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) NOT NULL DEFAULT 'MEDIUM',
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      address TEXT,
      is_manual_ward BOOLEAN DEFAULT 0,
      duplicate_group_id INTEGER,
      resolution_notes TEXT,
      resolved_at DATETIME,
      verified_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id),
      FOREIGN KEY(ward_id) REFERENCES wards(id),
      FOREIGN KEY(authority_id) REFERENCES authorities(id),
      FOREIGN KEY(citizen_id) REFERENCES users(id),
      FOREIGN KEY(duplicate_group_id) REFERENCES duplicate_groups(id) ON DELETE SET NULL
    );
  `);

  // Media table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      file_url TEXT NOT NULL,
      file_type TEXT CHECK(file_type IN ('IMAGE', 'VIDEO')) NOT NULL DEFAULT 'IMAGE',
      media_stage TEXT CHECK(media_stage IN ('REPORT', 'RESOLUTION')) NOT NULL DEFAULT 'REPORT',
      uploaded_by_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY(uploaded_by_id) REFERENCES users(id)
    );
  `);

  // Status History table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS status_histories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      changed_by_id INTEGER NOT NULL,
      remarks TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY(changed_by_id) REFERENCES users(id)
    );
  `);

  // Supports table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS supports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(issue_id, user_id)
    );
  `);

  // Notifications table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'INFO',
      issue_id INTEGER,
      is_read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(issue_id) REFERENCES issues(id) ON DELETE CASCADE
    );
  `);

  // Indexes for performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_issues_citizen ON issues(citizen_id);
    CREATE INDEX IF NOT EXISTS idx_issues_authority ON issues(authority_id);
    CREATE INDEX IF NOT EXISTS idx_issues_ward ON issues(ward_id);
    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_media_issue ON media(issue_id);
    CREATE INDEX IF NOT EXISTS idx_status_history_issue ON status_histories(issue_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);
}

module.exports = { 
  getDB,
  isSupabaseConfigured,
  getSupabaseClient
};
