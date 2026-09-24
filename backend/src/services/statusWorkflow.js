const { getDB } = require('../config/db');

// Allowed status transition map
const ALLOWED_TRANSITIONS = {
  'REPORTED': ['ASSIGNED', 'IN_PROGRESS'],
  'ASSIGNED': ['IN_PROGRESS'],
  'IN_PROGRESS': ['RESOLUTION_SUBMITTED', 'VERIFICATION_PENDING'],
  'RESOLUTION_SUBMITTED': ['VERIFICATION_PENDING', 'CLOSED', 'REOPENED'],
  'VERIFICATION_PENDING': ['CLOSED', 'REOPENED'],
  'REOPENED': ['IN_PROGRESS', 'ASSIGNED', 'RESOLUTION_SUBMITTED'],
  'CLOSED': ['REOPENED'] // Admin or Citizen can reopen if needed
};

/**
 * Validates whether transition from currentStatus to nextStatus is allowed.
 */
function isValidTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(nextStatus) : false;
}

/**
 * Transition status central service function.
 */
async function transitionStatus({ issueId, newStatus, userId, remarks = '' }) {
  const db = await getDB();

  const issue = await db.get('SELECT * FROM issues WHERE id = ?', [issueId]);
  if (!issue) {
    throw new Error(`Issue with ID ${issueId} not found`);
  }

  const currentStatus = issue.status;

  if (!isValidTransition(currentStatus, newStatus)) {
    throw new Error(`Invalid status transition from '${currentStatus}' to '${newStatus}'`);
  }

  const now = new Date().toISOString();
  let resolvedAt = issue.resolved_at;
  let verifiedAt = issue.verified_at;

  if (newStatus === 'RESOLUTION_SUBMITTED' || newStatus === 'VERIFICATION_PENDING') {
    resolvedAt = now;
  }
  if (newStatus === 'CLOSED') {
    verifiedAt = now;
  }

  // Update Issue Status
  await db.run(
    `UPDATE issues 
     SET status = ?, resolution_notes = COALESCE(?, resolution_notes), 
         resolved_at = ?, verified_at = ?, updated_at = ? 
     WHERE id = ?`,
    [newStatus, remarks, resolvedAt, verifiedAt, now, issueId]
  );

  // Insert into StatusHistory
  await db.run(
    `INSERT INTO status_histories (issue_id, from_status, to_status, changed_by_id, remarks, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [issueId, currentStatus, newStatus, userId, remarks, now]
  );

  const updatedIssue = await db.get('SELECT * FROM issues WHERE id = ?', [issueId]);

  return {
    success: true,
    issue: updatedIssue,
    previousStatus: currentStatus,
    newStatus
  };
}

module.exports = {
  ALLOWED_TRANSITIONS,
  isValidTransition,
  transitionStatus
};
