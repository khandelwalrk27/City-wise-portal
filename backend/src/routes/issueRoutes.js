const express = require('express');
const router = express.Router();
const { getDB } = require('../config/db');
const { authenticateToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getWardFromCoordinates } = require('../services/wardService');
const { assignAuthorityForIssue } = require('../services/authorityService');
const { transitionStatus } = require('../services/statusWorkflow');
const { findPotentialDuplicates } = require('../services/duplicateService');
const { notifyAuthorityOfIssue, notifyCitizenOfStatusChange } = require('../services/notificationService');

// Get all issues with filters
router.get('/', async (req, res) => {
  try {
    const { category_id, ward_id, authority_id, status, citizen_id, search, limit = 100, offset = 0 } = req.query;
    const db = await getDB();

    let query = `
      SELECT i.*, 
             c.name as category_name, c.icon as category_icon,
             w.name as ward_name, w.code as ward_code,
             a.name as authority_name, a.department as authority_department,
             u.name as citizen_name, u.email as citizen_email,
             (SELECT COUNT(*) FROM supports s WHERE s.issue_id = i.id) as support_count,
             (SELECT file_url FROM media m WHERE m.issue_id = i.id AND m.media_stage = 'REPORT' AND m.file_type = 'IMAGE' LIMIT 1) as primary_image
      FROM issues i
      LEFT JOIN categories c ON i.category_id = c.id
      LEFT JOIN wards w ON i.ward_id = w.id
      LEFT JOIN authorities a ON i.authority_id = a.id
      LEFT JOIN users u ON i.citizen_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (category_id) {
      query += ` AND i.category_id = ?`;
      params.push(category_id);
    }
    if (ward_id) {
      query += ` AND i.ward_id = ?`;
      params.push(ward_id);
    }
    if (authority_id) {
      query += ` AND i.authority_id = ?`;
      params.push(authority_id);
    }
    if (status) {
      query += ` AND i.status = ?`;
      params.push(status);
    }
    if (citizen_id) {
      query += ` AND i.citizen_id = ?`;
      params.push(citizen_id);
    }
    if (search) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ? OR i.address LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY i.created_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const issues = await db.all(query, params);
    return res.json({ issues, total: issues.length });
  } catch (err) {
    console.error('Error in GET /api/issues:', err);
    return res.status(500).json({ error: 'Failed to fetch issues.' });
  }
});

// Get issue details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const issue = await db.get(
      `SELECT i.*, 
              c.name as category_name, c.icon as category_icon,
              w.name as ward_name, w.code as ward_code,
              a.name as authority_name, a.department as authority_department, a.contact_email as authority_email, a.phone as authority_phone,
              u.name as citizen_name, u.email as citizen_email,
              (SELECT COUNT(*) FROM supports s WHERE s.issue_id = i.id) as support_count
       FROM issues i
       LEFT JOIN categories c ON i.category_id = c.id
       LEFT JOIN wards w ON i.ward_id = w.id
       LEFT JOIN authorities a ON i.authority_id = a.id
       LEFT JOIN users u ON i.citizen_id = u.id
       WHERE i.id = ?`,
      [id]
    );

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    // Fetch media attachments
    const media = await db.all('SELECT * FROM media WHERE issue_id = ? ORDER BY created_at ASC', [id]);

    // Fetch status history timeline
    const timeline = await db.all(
      `SELECT sh.*, u.name as changed_by_name, u.role as changed_by_role
       FROM status_histories sh
       JOIN users u ON sh.changed_by_id = u.id
       WHERE sh.issue_id = ?
       ORDER BY sh.created_at ASC`,
      [id]
    );

    // Fetch duplicate group information if linked
    let duplicateGroup = null;
    if (issue.duplicate_group_id) {
      duplicateGroup = await db.get('SELECT * FROM duplicate_groups WHERE id = ?', [issue.duplicate_group_id]);
    }

    return res.json({
      issue,
      media,
      timeline,
      duplicateGroup
    });
  } catch (err) {
    console.error('Error fetching issue detail:', err);
    return res.status(500).json({ error: 'Failed to fetch issue details.' });
  }
});

// Create Issue (Citizen)
router.post('/', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category_id,
      latitude,
      longitude,
      address,
      manual_ward_id,
      priority = 'MEDIUM'
    } = req.body;

    if (!title || !description || !category_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'Title, description, category, latitude, and longitude are required.' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const db = await getDB();

    // 1. Resolve and validate citizen user
    let citizenId = req.user && req.user.id ? req.user.id : null;
    let userRecord = citizenId ? await db.get('SELECT id FROM users WHERE id = ?', [citizenId]) : null;
    if (!userRecord) {
      if (req.user && req.user.email) {
        userRecord = await db.get('SELECT id FROM users WHERE email = ?', [req.user.email.toLowerCase().trim()]);
      }
      if (!userRecord) {
        const anyCitizen = await db.get("SELECT id FROM users WHERE role = 'CITIZEN' LIMIT 1") || await db.get('SELECT id FROM users LIMIT 1');
        if (anyCitizen) {
          userRecord = anyCitizen;
        } else {
          const insUser = await db.run(
            `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'CITIZEN')`,
            [req.user?.name || 'Jaipur Resident', req.user?.email || 'citizen@citywise.org', 'auto_recreated']
          );
          userRecord = { id: insUser.lastID };
        }
      }
      citizenId = userRecord.id;
    }

    // 2. Determine Ward (Automatic GeoJSON point-in-polygon detection or manual override)
    let finalWardId = null;
    let isManualWard = false;

    if (manual_ward_id) {
      finalWardId = parseInt(manual_ward_id);
      isManualWard = true;
    } else {
      const wardDetect = await getWardFromCoordinates(lat, lng);
      if (wardDetect.ward) {
        finalWardId = wardDetect.ward.id;
      } else {
        isManualWard = true;
      }
    }

    // Validate Ward foreign key
    let validWardId = null;
    if (finalWardId) {
      const wardRecord = await db.get('SELECT id FROM wards WHERE id = ?', [finalWardId]);
      if (wardRecord) {
        validWardId = wardRecord.id;
      } else {
        const wardByCode = await db.get('SELECT id FROM wards WHERE code = ? OR code LIKE ?', [
          `JP-WARD-${String(finalWardId).padStart(3, '0')}`,
          `%${finalWardId}%`
        ]);
        validWardId = wardByCode ? wardByCode.id : null;
      }
    }

    // Validate Category foreign key
    let validCatId = parseInt(category_id);
    const catRecord = await db.get('SELECT id FROM categories WHERE id = ?', [validCatId]);
    if (!catRecord) {
      const firstCat = await db.get('SELECT id FROM categories LIMIT 1');
      if (firstCat) {
        validCatId = firstCat.id;
      }
    }

    // 3. Determine Responsible Authority
    const authority = await assignAuthorityForIssue(validWardId, validCatId);
    let validAuthId = authority ? authority.id : null;
    if (validAuthId) {
      const authRecord = await db.get('SELECT id FROM authorities WHERE id = ?', [validAuthId]);
      if (!authRecord) {
        const firstAuth = await db.get('SELECT id FROM authorities LIMIT 1');
        validAuthId = firstAuth ? firstAuth.id : null;
      }
    }

    // 4. Save Issue
    const result = await db.run(
      `INSERT INTO issues 
       (title, description, category_id, ward_id, authority_id, citizen_id, status, priority, latitude, longitude, address, is_manual_ward)
       VALUES (?, ?, ?, ?, ?, ?, 'REPORTED', ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        description.trim(),
        validCatId,
        validWardId,
        validAuthId,
        citizenId,
        priority,
        lat,
        lng,
        address || '',
        isManualWard ? 1 : 0
      ]
    );

    const issueId = result.lastID;

    // 5. Initial Status History Entry
    await db.run(
      `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks)
       VALUES (?, NULL, 'REPORTED', ?, ?)`,
      [issueId, citizenId, 'Issue reported by citizen.']
    );

    // 6. Handle Uploaded Media Files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video');
        const fileUrl = `/uploads/${file.filename}`;
        await db.run(
          `INSERT INTO media (issue_id, file_url, file_type, media_stage, uploaded_by_id)
           VALUES (?, ?, ?, 'REPORT', ?)`,
          [issueId, fileUrl, isVideo ? 'VIDEO' : 'IMAGE', citizenId]
        );
      }
    }

    const createdIssue = await db.get('SELECT * FROM issues WHERE id = ?', [issueId]);

    // 7. Check for potential duplicates
    const potentialDuplicates = await findPotentialDuplicates({
      latitude: lat,
      longitude: lng,
      categoryId: validCatId,
      title,
      description,
      excludeIssueId: issueId
    });

    // 8. Trigger Real-time Authority Notification
    if (validAuthId) {
      await notifyAuthorityOfIssue(validAuthId, createdIssue);
    }

    return res.status(201).json({
      message: 'Issue reported successfully',
      issue: createdIssue,
      detectedWardId: validWardId,
      isManualWard,
      assignedAuthority: authority,
      potentialDuplicates
    });
  } catch (err) {
    console.error('Error creating issue:', err);
    return res.status(500).json({ error: err.message || 'Failed to report issue.' });
  }
});

// Update Issue Status (Authority / Admin)
router.post('/:id/status', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'New status is required.' });
    }

    const db = await getDB();
    const issue = await db.get('SELECT * FROM issues WHERE id = ?', [id]);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    // Role verification: Authority can only manage issues assigned to them or if ADMIN
    if (req.user.role === 'AUTHORITY' && issue.authority_id !== req.user.authority_id) {
      return res.status(403).json({ error: 'Unauthorized to manage issues outside your authority.' });
    }

    // Centralized Status Transition Execution
    const result = await transitionStatus({
      issueId: id,
      newStatus: status,
      userId: req.user.id,
      remarks: remarks || `Status changed to ${status}`
    });

    // Handle Resolution Media Files if provided during status transition
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video');
        const fileUrl = `/uploads/${file.filename}`;
        await db.run(
          `INSERT INTO media (issue_id, file_url, file_type, media_stage, uploaded_by_id)
           VALUES (?, ?, ?, 'RESOLUTION', ?)`,
          [id, fileUrl, isVideo ? 'VIDEO' : 'IMAGE', req.user.id]
        );
      }
    }

    // Real-time Notification to Citizen
    await notifyCitizenOfStatusChange(issue.citizen_id, issue, status, remarks);

    return res.json({ message: 'Status updated successfully', issue: result.issue });
  } catch (err) {
    console.error('Error updating status:', err);
    return res.status(400).json({ error: err.message || 'Failed to update issue status.' });
  }
});

// Submit Resolution Evidence (Authority)
router.post('/:id/resolution', authenticateToken, requireRole('AUTHORITY', 'ADMIN'), upload.array('files', 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const db = await getDB();
    const issue = await db.get('SELECT * FROM issues WHERE id = ?', [id]);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    if (req.user.role === 'AUTHORITY' && issue.authority_id !== req.user.authority_id) {
      return res.status(403).json({ error: 'Unauthorized to manage issues outside your authority.' });
    }

    // Upload resolution media files
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video');
        const fileUrl = `/uploads/${file.filename}`;
        await db.run(
          `INSERT INTO media (issue_id, file_url, file_type, media_stage, uploaded_by_id)
           VALUES (?, ?, ?, 'RESOLUTION', ?)`,
          [id, fileUrl, isVideo ? 'VIDEO' : 'IMAGE', req.user.id]
        );
      }
    }

    // Set status to VERIFICATION_PENDING
    const transition = await transitionStatus({
      issueId: id,
      newStatus: 'VERIFICATION_PENDING',
      userId: req.user.id,
      remarks: remarks || 'Resolution submitted with evidence. Awaiting citizen verification.'
    });

    // Notify Citizen
    await notifyCitizenOfStatusChange(issue.citizen_id, issue, 'VERIFICATION_PENDING', remarks);

    return res.json({ message: 'Resolution submitted successfully', issue: transition.issue });
  } catch (err) {
    console.error('Resolution submission error:', err);
    return res.status(500).json({ error: 'Failed to submit resolution evidence.' });
  }
});

// Citizen Resolution Verification (Approve or Reopen)
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, remarks } = req.body; // approved = true -> CLOSED, approved = false -> REOPENED

    const db = await getDB();
    const issue = await db.get('SELECT * FROM issues WHERE id = ?', [id]);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found.' });
    }

    // Ensure only reporting citizen or Admin can verify
    if (req.user.role === 'CITIZEN' && issue.citizen_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the citizen who reported this issue can verify its resolution.' });
    }

    const targetStatus = approved ? 'CLOSED' : 'REOPENED';
    const defaultRemark = approved ? 'Citizen verified resolution and closed issue.' : 'Citizen rejected resolution and reopened issue.';

    const transition = await transitionStatus({
      issueId: id,
      newStatus: targetStatus,
      userId: req.user.id,
      remarks: remarks || defaultRemark
    });

    // Notify Authority
    if (issue.authority_id) {
      const officers = await db.all('SELECT id FROM users WHERE authority_id = ?', [issue.authority_id]);
      const notifySvc = require('../services/notificationService');
      for (const officer of officers) {
        await notifySvc.sendNotification({
          userId: officer.id,
          authorityId: issue.authority_id,
          title: approved ? `Issue #${id} Verified & Closed` : `Issue #${id} Reopened by Citizen`,
          message: approved 
            ? `Citizen verified resolution for "${issue.title}".` 
            : `Citizen rejected resolution for "${issue.title}". Remarks: ${remarks || 'None'}`,
          type: approved ? 'VERIFICATION_APPROVED' : 'ISSUE_REOPENED',
          issueId: issue.id
        });
      }
    }

    return res.json({ message: `Issue ${approved ? 'verified and closed' : 'reopened'} successfully`, issue: transition.issue });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(400).json({ error: err.message || 'Failed to verify resolution.' });
  }
});

// Community Upvote / Support Issue
router.post('/:id/support', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDB();

    const existing = await db.get('SELECT * FROM supports WHERE issue_id = ? AND user_id = ?', [id, req.user.id]);

    if (existing) {
      // Remove support (toggle off)
      await db.run('DELETE FROM supports WHERE issue_id = ? AND user_id = ?', [id, req.user.id]);
      const countRes = await db.get('SELECT COUNT(*) as count FROM supports WHERE issue_id = ?', [id]);
      return res.json({ supported: false, support_count: countRes.count });
    } else {
      // Add support
      await db.run('INSERT INTO supports (issue_id, user_id) VALUES (?, ?)', [id, req.user.id]);
      const countRes = await db.get('SELECT COUNT(*) as count FROM supports WHERE issue_id = ?', [id]);
      return res.json({ supported: true, support_count: countRes.count });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Failed to process community support.' });
  }
});

module.exports = router;
