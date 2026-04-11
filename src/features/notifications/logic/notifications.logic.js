// src/features/notifications/logic/notifications.logic.js

export function sortNotificationsByCreatedAt(items = []) {
  return [...items].sort((a, b) => {
    const aMs = a?.createdAtMs || 0
    const bMs = b?.createdAtMs || 0
    return bMs - aMs
  })
}

export function countUnreadNotifications(items = []) {
  return items.reduce((total, item) => {
    return item?.isRead ? total : total + 1
  }, 0)
}

export function isNotificationRead(item) {
  return Boolean(item?.isRead)
}

export function getNotificationCategoryMeta(category) {
  switch (category) {
    case 'form':
      return {
        label: 'יכולות',
        iconId: 'abilities',
        color: 'primary',
      }

    case 'meeting':
      return {
        label: 'פגישה',
        iconId: 'meeting',
        color: 'warning',
      }

    default:
      return {
        label: 'מערכת',
        iconId: 'notifications',
        color: 'neutral',
      }
  }
}

export function resolveNotificationNavigationTarget(item) {
  const deepLink = item?.deepLink

  if (!deepLink || typeof deepLink !== 'string') {
    return null
  }

  return {
    path: deepLink,
    replace: false,
  }
}

export function formatNotificationDateTime(item) {
  const value = item?.createdAtMs
  if (!value) return ''

  try {
    return new Intl.DateTimeFormat('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  } catch (error) {
    return ''
  }
}
