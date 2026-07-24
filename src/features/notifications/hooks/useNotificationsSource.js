// src/features/notifications/hooks/useNotificationsSource.js

import { useEffect, useState } from 'react'

import { subscribeNotifications } from '../application/notifications.actions.js'

export default function useNotificationsSource({ userId, enabled = true } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled && userId))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!enabled || !userId) {
      setItems([])
      setLoading(false)
      setError(null)
      return undefined
    }

    setLoading(true)
    setError(null)

    return subscribeNotifications({
      userId,
      onData: (nextItems) => {
        setItems(Array.isArray(nextItems) ? nextItems : [])
        setLoading(false)
      },
      onError: (nextError) => {
        setError(nextError)
        setLoading(false)
      },
    })
  }, [enabled, userId])

  return { items, loading, error }
}
