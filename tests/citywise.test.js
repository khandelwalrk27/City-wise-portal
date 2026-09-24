const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { getDB } = require('../backend/src/config/db');
const { getWardFromCoordinates } = require('../backend/src/services/wardService');
const { assignAuthorityForIssue } = require('../backend/src/services/authorityService');
const { transitionStatus, isValidTransition } = require('../backend/src/services/statusWorkflow');
const { findPotentialDuplicates } = require('../backend/src/services/duplicateService');

test('CityWise Jaipur - Automated Test Suite', async (t) => {

  await t.test('Database connection and schema initialization', async () => {
    const db = await getDB();
    assert.ok(db, 'Database instance should be initialized');
    
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    assert.ok(userCount.count >= 0, 'Users table should exist');
  });

  await t.test('GeoJSON Point-in-Polygon Ward Detection for Jaipur', async () => {
    // Coordinates inside Ward 125 (Malviya Nagar Central: Lat 26.865, Lng 75.815)
    const result = await getWardFromCoordinates(26.865, 75.815);
    assert.ok(result.ward, 'Should detect a ward for Malviya Nagar coordinates');
    assert.strictEqual(result.isManual, false, 'Should be automatic ward detection');
    assert.ok(result.ward.name.includes('Malviya Nagar') || result.ward.code.includes('WARD'), 'Detected ward should match Jaipur ward');
  });

  await t.test('Authority Assignment Lookup', async () => {
    // Ward 1 + Category Potholes -> PWD Roads
    const authority = await assignAuthorityForIssue(1, 1);
    assert.ok(authority, 'Authority should be assigned');
    assert.ok(authority.name, 'Authority name should be present');
  });

  await t.test('Status Transition Central Machine', async () => {
    assert.strictEqual(isValidTransition('REPORTED', 'ASSIGNED'), true);
    assert.strictEqual(isValidTransition('ASSIGNED', 'IN_PROGRESS'), true);
    assert.strictEqual(isValidTransition('IN_PROGRESS', 'RESOLUTION_SUBMITTED'), true);
    assert.strictEqual(isValidTransition('RESOLUTION_SUBMITTED', 'VERIFICATION_PENDING'), true);
    assert.strictEqual(isValidTransition('VERIFICATION_PENDING', 'CLOSED'), true);
    assert.strictEqual(isValidTransition('VERIFICATION_PENDING', 'REOPENED'), true);
    assert.strictEqual(isValidTransition('CLOSED', 'REPORTED'), false, 'Direct CLOSED to REPORTED should be invalid');
  });

  await t.test('Duplicate Issue Grouping Detection', async () => {
    const duplicates = await findPotentialDuplicates({
      latitude: 26.8650,
      longitude: 75.8150,
      categoryId: 1,
      title: 'Deep crater pothole WTP',
      description: 'Dangerous road crater near WTP exit'
    });
    assert.ok(Array.isArray(duplicates), 'Duplicates candidate list should be an array');
  });

});
