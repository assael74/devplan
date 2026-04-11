// src/features/notifications/logic/notifications.model.js

function toMs(value) {
  if (!value) return null

  if (typeof value === 'number') return value

  if (value?.toMillis) {
    try {
      return value.toMillis()
    } catch (error) {
      return null
    }
  }

  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? null : parsed
}

export function buildNotificationModel(raw = {}) {
  const createdAtMs = toMs(raw?.createdAt)
  const readAtMs = toMs(raw?.readAt)

  return {
    id: raw?.id || '',
    title: raw?.title || '',
    body: raw?.body || '',
    type: raw?.type || '',
    category: raw?.category || 'general',
    priority: raw?.priority || 'normal',
    status: raw?.status || (readAtMs ? 'read' : 'new'),
    deepLink: raw?.deepLink || null,

    entityType: raw?.entityType || '',
    entityId: raw?.entityId || '',

    playerId: raw?.playerId || raw?.context?.playerId || '',
    teamId: raw?.teamId || raw?.context?.teamId || '',
    clubId: raw?.clubId || raw?.context?.clubId || '',

    playerName: raw?.playerName || '',
    teamName: raw?.teamName || '',
    clubName: raw?.clubName || '',

    meetingId: raw?.meetingId || '',
    meetingType: raw?.meetingType || raw?.context?.meetingType || '',
    meetingDate: raw?.meetingDate || raw?.context?.meetingDate || '',
    meetingHour: raw?.meetingHour || raw?.context?.meetingHour || '',
    reminderType: raw?.reminderType || raw?.context?.reminderType || '',

    context: raw?.context || {},

    createdAt: raw?.createdAt || null,
    readAt: raw?.readAt || null,
    createdAtMs,
    readAtMs,
    isRead: raw?.status === 'unread' ? false : (Boolean(readAtMs) || raw?.status === 'read'),
    raw,
  }
}

export function buildNotificationsModels(items = []) {
  return items.map(buildNotificationModel)
}
