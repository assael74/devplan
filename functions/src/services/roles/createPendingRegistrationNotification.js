// functions/src/services/roles/createPendingRegistrationNotification.js

const { admin } = require('../../config/admin')
const { clean } = require('../../shared/clean')
const { getUserNotificationRef } = require('../notifications/notifications.repo')
const {
  buildPendingRegistrationNotification,
} = require('./buildPendingRegistrationNotification')

async function createPendingRegistrationNotification({
  tx,
  recipientUserId,
  roleId,
  authUid = '',
  fullName = '',
  email = '',
  phone = '',
  deepLink = '',
}) {
  const userId = clean(recipientUserId)
  if (!userId) return null

  const nowTs = admin.firestore.Timestamp.now()
  const notification = buildPendingRegistrationNotification({
    roleId: clean(roleId),
    authUid: clean(authUid),
    fullName: clean(fullName),
    email: clean(email),
    phone: clean(phone),
    deepLink: clean(deepLink),
    nowTs,
  })

  const notificationRef = getUserNotificationRef(userId, notification.id)

  if (tx) {
    tx.set(notificationRef, notification, { merge: false })
    return notification
  }

  await notificationRef.set(notification, { merge: false })
  return notification
}

module.exports = {
  createPendingRegistrationNotification,
}
