const { getDB } = require('../config/db');

let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
}

/**
 * Creates persistent notification in DB and emits real-time socket event.
 */
async function sendNotification({ userId, title, message, type = 'INFO', issueId = null, authorityId = null, notifyRole = null }) {
  const db = await getDB();
  const now = new Date().toISOString();

  // If specific userId provided, insert DB notification
  let notificationId = null;
  if (userId) {
    const result = await db.run(
      `INSERT INTO notifications (user_id, title, message, type, issue_id, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`,
      [userId, title, message, type, issueId, now]
    );
    notificationId = result.lastID;
  }

  const payload = {
    id: notificationId || Date.now(),
    userId,
    title,
    message,
    type,
    issueId,
    authorityId,
    createdAt: now
  };

  if (ioInstance) {
    if (userId) {
      ioInstance.to(`user_${userId}`).emit('notification', payload);
    }
    if (authorityId) {
      ioInstance.to(`authority_${authorityId}`).emit('notification', payload);
    }
    if (notifyRole) {
      ioInstance.to(`role_${notifyRole}`).emit('notification', payload);
    }
    // Broadcast to global feed if relevant
    ioInstance.emit('global_notification', payload);
  }

  return payload;
}

/**
 * Utility to notify Authority Officers when an issue is assigned or created.
 */
async function notifyAuthorityOfIssue(authorityId, issue) {
  const db = await getDB();
  // Find users registered under this authority
  const officers = await db.all('SELECT id FROM users WHERE authority_id = ? OR role = "ADMIN"', [authorityId]);
  
  for (const officer of officers) {
    await sendNotification({
      userId: officer.id,
      authorityId,
      title: `New Issue Assigned: #${issue.id}`,
      message: `Issue "${issue.title}" has been assigned to your department.`,
      type: 'ISSUE_ASSIGNED',
      issueId: issue.id
    });
  }
}

/**
 * Utility to notify Citizen when status of their issue updates.
 */
async function notifyCitizenOfStatusChange(citizenId, issue, newStatus, remarks) {
  let title = `Update on Issue #${issue.id}`;
  let message = `The status of your reported issue "${issue.title}" was updated to ${newStatus}.`;

  if (newStatus === 'VERIFICATION_PENDING' || newStatus === 'RESOLUTION_SUBMITTED') {
    title = `Action Required: Resolution Submitted for Issue #${issue.id}`;
    message = `The authority has submitted resolution evidence for "${issue.title}". Please review and verify.`;
  } else if (newStatus === 'CLOSED') {
    title = `Issue Closed: #${issue.id}`;
    message = `Your reported issue "${issue.title}" has been verified and closed. Thank you for making your city better!`;
  }

  await sendNotification({
    userId: citizenId,
    title,
    message,
    type: newStatus === 'VERIFICATION_PENDING' ? 'VERIFICATION_REQUIRED' : 'STATUS_UPDATE',
    issueId: issue.id
  });
}

module.exports = {
  setSocketIO,
  sendNotification,
  notifyAuthorityOfIssue,
  notifyCitizenOfStatusChange
};
