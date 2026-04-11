// functions/src/services/meetings/createMeetingUpcomingNotification.js

const { admin } = require('../../config/admin')
const { clean } = require('../../shared/clean')
const { getUserNotificationRef } = require('../notifications/notifications.repo')
const {
  buildMeetingUpcomingNotification,
} = require('./buildMeetingUpcomingNotification')

async function createMeetingUpcomingNotification({
  tx,
  recipientUserId,
  meetingId,
  playerId = '',
  playerName = '',
  meetingType = '',
  meetingDate = '',
  meetingHour = '',
  reminderType = '24h',
  deepLink = '',
}) {
  const userId = clean(recipientUserId)
  if (!userId) return null

  const nowTs = admin.firestore.Timestamp.now()

  const notification = buildMeetingUpcomingNotification({
    meetingId: clean(meetingId),
    playerId: clean(playerId),
    playerName: clean(playerName),
    meetingType: clean(meetingType),
    meetingDate: clean(meetingDate),
    meetingHour: clean(meetingHour),
    reminderType: clean(reminderType) || '24h',
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
  createMeetingUpcomingNotification,
}
