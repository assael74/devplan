// functions/src/services/meetings/buildMeetingUpcomingNotification.js

const {
  NOTIFICATION_STATUS,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_TYPE,
} = require('../notifications/notifications.constants')

function resolveMeetingUpcomingType(reminderType) {
  if (reminderType === '60m') {
    return NOTIFICATION_TYPE.MEETING_UPCOMING_60M
  }

  return NOTIFICATION_TYPE.MEETING_UPCOMING_24H
}

function buildMeetingUpcomingNotificationId({
  meetingId,
  reminderType = '24h',
}) {
  return `${resolveMeetingUpcomingType(reminderType)}__${meetingId}`
}

function buildMeetingUpcomingNotification({
  meetingId,
  playerId = '',
  playerName = '',
  meetingType = '',
  meetingDate = '',
  meetingHour = '',
  reminderType = '24h',
  deepLink = '',
  nowTs,
}) {
  const type = resolveMeetingUpcomingType(reminderType)
  const timingLabel = reminderType === '60m' ? 'בעוד כשעה' : 'מחר'
  const meetingLabel = meetingType || 'פגישה'

  return {
    id: buildMeetingUpcomingNotificationId({
      meetingId,
      reminderType,
    }),
    type,
    category: NOTIFICATION_CATEGORY.MEETING,
    priority: NOTIFICATION_PRIORITY.HIGH,
    status: NOTIFICATION_STATUS.UNREAD,

    title: `${meetingLabel} מתקרבת`,
    body: playerName
      ? `${meetingLabel} עם ${playerName} ${timingLabel}${meetingDate ? ` · ${meetingDate}` : ''}${meetingHour ? ` ${meetingHour}` : ''}`
      : `${meetingLabel} ${timingLabel}${meetingDate ? ` · ${meetingDate}` : ''}${meetingHour ? ` ${meetingHour}` : ''}`,

    entityType: 'meeting',
    entityId: meetingId || null,
    deepLink: deepLink || '',

    meetingId: meetingId || '',
    playerId: playerId || '',
    playerName: playerName || '',
    meetingType: meetingType || '',
    meetingDate: meetingDate || '',
    meetingHour: meetingHour || '',
    reminderType,

    createdAt: nowTs,
    updatedAt: nowTs,
    readAt: null,
    archivedAt: null,
  }
}

module.exports = {
  buildMeetingUpcomingNotification,
  buildMeetingUpcomingNotificationId,
}
