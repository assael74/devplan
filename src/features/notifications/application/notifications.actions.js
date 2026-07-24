// src/features/notifications/application/notifications.actions.js

import {
  deleteNotificationById,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeUserNotifications,
} from '../repository/notifications.repository.js'

export function subscribeNotifications({ userId, onData, onError } = {}) {
  if (!userId || typeof onData !== 'function') return () => {}
  return subscribeUserNotifications(userId, onData, onError)
}

export async function markNotificationAsRead({ userId, notificationId } = {}) {
  if (!userId || !notificationId) return null
  return markNotificationRead(userId, notificationId)
}

export async function markNotificationsAsRead({ userId } = {}) {
  if (!userId) return null
  return markAllNotificationsRead(userId)
}

export async function removeNotification({ userId, notificationId } = {}) {
  if (!userId || !notificationId) return null
  return deleteNotificationById(userId, notificationId)
}
