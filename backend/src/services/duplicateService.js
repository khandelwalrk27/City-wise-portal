const { getDB } = require('../config/db');

/**
 * Calculates Haversine distance in meters between two lat/lng points.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Keyword similarity between two strings (0 to 1)
 */
function keywordSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const words1 = new Set(str1.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/));
  const words2 = new Set(str2.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let intersection = 0;
  for (const word of words1) {
    if (word.length > 3 && words2.has(word)) {
      intersection++;
    }
  }
  
  return intersection / Math.min(words1.size, words2.size);
}

/**
 * Finds duplicate candidates for a newly reported or existing issue.
 */
async function findPotentialDuplicates({ latitude, longitude, categoryId, title, description, excludeIssueId = null, maxDistanceMeters = 300 }) {
  const db = await getDB();

  const activeIssues = await db.all(
    `SELECT i.*, c.name as category_name, u.name as citizen_name
     FROM issues i
     LEFT JOIN categories c ON i.category_id = c.id
     LEFT JOIN users u ON i.citizen_id = u.id
     WHERE i.status != 'CLOSED' AND (? IS NULL OR i.id != ?)`,
    [excludeIssueId, excludeIssueId]
  );

  const duplicates = [];

  for (const issue of activeIssues) {
    // 1. Check distance
    const dist = haversineDistance(latitude, longitude, issue.latitude, issue.longitude);
    
    // 2. Check category match
    const isSameCategory = parseInt(issue.category_id) === parseInt(categoryId);
    
    // 3. Check text similarity
    const simTitle = keywordSimilarity(title, issue.title);
    const simDesc = keywordSimilarity(description, issue.description);

    let matchConfidence = 0;

    if (dist <= maxDistanceMeters) {
      matchConfidence += 0.5; // High spatial proximity
    } else if (dist <= maxDistanceMeters * 2) {
      matchConfidence += 0.2;
    }

    if (isSameCategory) {
      matchConfidence += 0.3;
    }

    if (simTitle > 0.4 || simDesc > 0.3) {
      matchConfidence += 0.2;
    }

    // Candidate threshold
    if (dist <= maxDistanceMeters || matchConfidence >= 0.6) {
      duplicates.push({
        issue,
        distanceMeters: Math.round(dist),
        confidenceScore: Math.min(1.0, Math.round(matchConfidence * 100) / 100),
        reason: dist <= 100 ? 'Very close location match' : 'High textual & category similarity'
      });
    }
  }

  return duplicates.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

/**
 * Creates an incident group or links an issue to an existing duplicate group.
 */
async function linkToDuplicateGroup(primaryIssueId, candidateIssueId) {
  const db = await getDB();

  const primary = await db.get('SELECT * FROM issues WHERE id = ?', [primaryIssueId]);
  const candidate = await db.get('SELECT * FROM issues WHERE id = ?', [candidateIssueId]);

  if (!primary || !candidate) {
    throw new Error('One or both issues not found');
  }

  let groupId = primary.duplicate_group_id;

  if (!groupId) {
    // Create new group
    const result = await db.run(
      `INSERT INTO duplicate_groups (title, category_id, ward_id, status, primary_issue_id)
       VALUES (?, ?, ?, 'ACTIVE', ?)`,
      [`Incident Cluster: ${primary.title}`, primary.category_id, primary.ward_id, primary.id]
    );
    groupId = result.lastID;

    // Link primary
    await db.run('UPDATE issues SET duplicate_group_id = ? WHERE id = ?', [groupId, primary.id]);
  }

  // Link candidate
  await db.run('UPDATE issues SET duplicate_group_id = ? WHERE id = ?', [groupId, candidate.id]);

  return { groupId, primaryIssueId: primary.id, linkedIssueId: candidate.id };
}

module.exports = {
  haversineDistance,
  findPotentialDuplicates,
  linkToDuplicateGroup
};
