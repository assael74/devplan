// src/features/notifications/hooks/useNotifications.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCoreData } from '../../coreData/CoreDataProvider'
import {
  deleteNotificationById,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeUserNotifications,
} from '../../../services/firestore/notifications.firestore'
import { buildNotificationsModels } from '../logic/notifications.model'
import { buildNotificationDisplay } from '../logic/notifications.display.logic'
import {
  countUnreadNotifications,
  resolveNotificationNavigationTarget,
  sortNotificationsByCreatedAt,
} from '../logic/notifications.logic'

export default function useNotifications({ userId, enabled = true } = {}) {
  const { playerById, teamById, clubById, loading: coreLoading } = useCoreData()

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled && userId))
  const [error, setError] = useState(null)
  const [pendingIds, setPendingIds] = useState({})

  const maps = useMemo(() => {
    return {
      playerById,
      teamById,
      clubById,
    }
  }, [playerById, teamById, clubById])

  useEffect(() => {
    if (!enabled || !userId) {
      setItems([])
      setLoading(false)
      setError(null)
      return undefined
    }

    setLoading(true)
    setError(null)

    const unsubscribe = subscribeUserNotifications(
      userId,
      (rawItems) => {
        const normalized = buildNotificationsModels(rawItems)
        const enriched = normalized.map((item) => buildNotificationDisplay(item, maps))
        const sorted = sortNotificationsByCreatedAt(enriched)

        setItems(sorted)
        setLoading(false)
      },
      (nextError) => {
        setError(nextError)
        setLoading(false)
      }
    )

    return unsubscribe
  }, [enabled, userId, maps])

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

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!userId || !notificationId) return

      setPending(notificationId, true)

      try {
        await markNotificationRead(userId, notificationId)
      } finally {
        setPending(notificationId, false)
      }
    },
    [setPending, userId]
  )

  const markAllAsRead = useCallback(async () => {
    if (!userId) return
    await markAllNotificationsRead(userId)
  }, [userId])

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!userId || !notificationId) return

      setPending(notificationId, true)

      try {
        await deleteNotificationById(userId, notificationId)
      } finally {
        setPending(notificationId, false)
      }
    },
    [setPending, userId]
  )

  const getNotificationTarget = useCallback((item) => {
    return resolveNotificationNavigationTarget(item)
  }, [])

  return {
    notifications: items,
    unreadCount,
    loading: loading || coreLoading,
    error,
    pendingIds,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationTarget,
  }
}
