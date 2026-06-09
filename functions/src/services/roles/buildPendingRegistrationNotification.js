// functions/src/services/roles/buildPendingRegistrationNotification.js

const {
  NOTIFICATION_STATUS,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_TYPE,
} = require('../notifications/notifications.constants')

function buildPendingRegistrationNotificationId(roleId) {
  return `${NOTIFICATION_TYPE.REGISTRATION_PENDING_APPROVAL}__${roleId}`
}

function buildPendingRegistrationNotification({
  roleId,
  authUid = '',
  fullName = '',
  email = '',
  phone = '',
  deepLink = '',
  nowTs,
}) {
  const displayName = fullName || email || 'משתמש חדש'

  return {
    id: buildPendingRegistrationNotificationId(roleId),
    type: NOTIFICATION_TYPE.REGISTRATION_PENDING_APPROVAL,
    category: NOTIFICATION_CATEGORY.SYSTEM,
    priority: NOTIFICATION_PRIORITY.HIGH,
    status: NOTIFICATION_STATUS.UNREAD,

    title: 'הרשמה חדשה ממתינה לאישור',
    body: `${displayName} נרשם למערכת וממתין לאישור שלך`,

    entityType: 'role',
    entityId: roleId || null,
    deepLink: deepLink || '',

    roleId: roleId || '',
    authUid: authUid || '',
    fullName: fullName || '',
    email: email || '',
    phone: phone || '',

    createdAt: nowTs,
    updatedAt: nowTs,
    readAt: null,
    archivedAt: null,
  }
}

module.exports = {
  buildPendingRegistrationNotification,
  buildPendingRegistrationNotificationId,
}
