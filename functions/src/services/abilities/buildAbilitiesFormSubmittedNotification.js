// functions\src\services\meetings\buildMeetingUpcomingNotification.js

const {
  NOTIFICATION_STATUS,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_TYPE,
} = require('../notifications/notifications.constants')

function buildAbilitiesFormSubmittedNotificationId(inviteId) {
  return `${NOTIFICATION_TYPE.ABILITIES_FORM_SUBMITTED}__${inviteId}`
}

function buildAbilitiesFormSubmittedNotification({
  inviteId,
  submissionId = '',
  playerId = '',
  playerName = '',
  actorName = '',
  deepLink = '',
  nowTs,
}) {
  return {
    id: buildAbilitiesFormSubmittedNotificationId(inviteId),
    type: NOTIFICATION_TYPE.ABILITIES_FORM_SUBMITTED,
    category: NOTIFICATION_CATEGORY.FORM,
    priority: NOTIFICATION_PRIORITY.HIGH,
    status: NOTIFICATION_STATUS.UNREAD,

    title: 'התקבל טופס חדש',
    body: actorName
      ? `${actorName} מילא טופס עבור ${playerName || 'שחקן'}`
      : `התקבל טופס עבור ${playerName || 'שחקן'}`,

    entityType: 'player',
    entityId: playerId || null,
    deepLink: deepLink || '',

    actorName: actorName || '',
    inviteId: inviteId || '',
    submissionId: submissionId || '',

    createdAt: nowTs,
    updatedAt: nowTs,
    readAt: null,
    archivedAt: null,
  }
}

module.exports = {
  buildAbilitiesFormSubmittedNotification,
  buildAbilitiesFormSubmittedNotificationId,
}
