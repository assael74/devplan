// src/features/notifications/hooks/useNotifications.js

import { useCallback, useMemo, useState } from 'react'
import { useCoreData } from '../../coreData/CoreDataProvider.js'

import {
  markNotificationAsRead,
  markNotificationsAsRead,
  removeNotification,
} from '../application/notifications.actions.js'
import { buildNotificationsModels } from '../logic/notifications.model.js'
import { buildNotificationDisplay } from '../logic/notifications.display.logic.js'
import {
  countUnreadNotifications,
  resolveNotificationNavigationTarget,
  sortNotificationsByCreatedAt,
} from '../logic/notifications.logic.js'
import useNotificationsSource from './useNotificationsSource.js'

export default function useNotifications({ userId, enabled = true } = {}) {
  const {
    playerById,
    teamById,
    clubById,
    sourceStatus,
    loading: coreLoading,
  } = useCoreData()

  const [pendingIds, setPendingIds] = useState({})
  const source = useNotificationsSource({ userId, enabled })

  const maps = useMemo(() => ({ playerById, teamById, clubById }), [
    playerById,
    teamById,
    clubById,
  ])

  const items = useMemo(() => {
    const normalized = buildNotificationsModels(source.items)
    const enriched = normalized.map((item) => buildNotificationDisplay(item, maps))
    return sortNotificationsByCreatedAt(enriched)
  }, [source.items, maps])

  const unreadCount = useMemo(() => countUnreadNotifications(items), [items])

  const setPending = useCallback((notificationId, value) => {
    setPendingIds((prev) => {
      if (!notificationId) return prev
      const next = { ...prev }
      if (value) next[notificationId] = true
      else delete next[notificationId]
      return next
    })
  }, [])

  const markAsRead = useCallback(async (notificationId) => {
    if (!userId || !notificationId) return
    setPending(notificationId, true)
    try {
      await markNotificationAsRead({ userId, notificationId })
    } finally {
      setPending(notificationId, false)
    }
  }, [setPending, userId])

  const markAllAsRead = useCallback(async () => {
    await markNotificationsAsRead({ userId })
  }, [userId])

  const deleteNotification = useCallback(async (notificationId) => {
    if (!userId || !notificationId) return
    setPending(notificationId, true)
    try {
      await removeNotification({ userId, notificationId })
    } finally {
      setPending(notificationId, false)
    }
  }, [setPending, userId])

  const getNotificationTarget = useCallback((item) => {
    return resolveNotificationNavigationTarget(item)
  }, [])

  const coreEntitiesLoading = sourceStatus
    ? ['players', 'teams', 'clubs'].some((key) => sourceStatus[key] === false)
    : coreLoading

  return {
    notifications: items,
    unreadCount,
    loading: source.loading || coreEntitiesLoading,
    error: source.error,
    pendingIds,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationTarget,
  }
}
