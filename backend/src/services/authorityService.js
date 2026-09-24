const { getDB } = require('../config/db');

/**
 * Assigns responsible authority given a ward and optional category.
 * Looks up stored Ward-Authority mappings in database.
 */
async function assignAuthorityForIssue(wardId, categoryId) {
  const db = await getDB();

  if (!wardId) {
    // Fallback: Default General Public Works Authority
    const defaultAuth = await db.get('SELECT * FROM authorities LIMIT 1');
    return defaultAuth || null;
  }

  // 1. Check direct match for ward_id + category_id
  if (categoryId) {
    const specificMapping = await db.get(
      `SELECT a.* FROM ward_authorities wa
       JOIN authorities a ON wa.authority_id = a.id
       WHERE wa.ward_id = ? AND wa.category_id = ?`,
      [wardId, categoryId]
    );

    if (specificMapping) {
      return specificMapping;
    }
  }

  // 2. Check primary authority for ward
  const wardMapping = await db.get(
    `SELECT a.* FROM ward_authorities wa
     JOIN authorities a ON wa.authority_id = a.id
     WHERE wa.ward_id = ? AND wa.is_primary = 1 LIMIT 1`,
    [wardId]
  );

  if (wardMapping) {
    return wardMapping;
  }

  // 3. Fallback: Any authority for that ward or default authority
  const fallbackWardMapping = await db.get(
    `SELECT a.* FROM ward_authorities wa
     JOIN authorities a ON wa.authority_id = a.id
     WHERE wa.ward_id = ? LIMIT 1`,
    [wardId]
  );

  if (fallbackWardMapping) {
    return fallbackWardMapping;
  }

  // 4. Default global authority fallback
  const firstAuth = await db.get('SELECT * FROM authorities LIMIT 1');
  return firstAuth || null;
}

module.exports = {
  assignAuthorityForIssue
};
