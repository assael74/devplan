//  functions\src\services\notifications\notifications.constants.js

const NOTIFICATION_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  ARCHIVED: 'archived',
}

const NOTIFICATION_PRIORITY = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
}

const NOTIFICATION_CATEGORY = {
  FORM: 'form',
  MEETING: 'meeting',
  VIDEO: 'video',
  SYSTEM: 'system',
}

const NOTIFICATION_TYPE = {
  ABILITIES_FORM_SUBMITTED: 'abilities_form_submitted',
  MEETING_UPCOMING_24H: 'meeting_upcoming_24h',
  MEETING_UPCOMING_60M: 'meeting_upcoming_60m',
  VIDEO_VIEWED: 'video_viewed',
}

module.exports = {
  NOTIFICATION_STATUS,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_CATEGORY,
  NOTIFICATION_TYPE,
}
