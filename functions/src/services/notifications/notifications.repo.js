// functions\src\services\notifications\notifications.repo.js

const { db } = require('../../config/admin')

function getUserNotificationsCollection(userId) {
  return db.collection('users').doc(userId).collection('notifications')
}

function getUserNotificationRef(userId, notificationId) {
  return getUserNotificationsCollection(userId).doc(notificationId)
}

module.exports = {
  getUserNotificationsCollection,
  getUserNotificationRef,
}
