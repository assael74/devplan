// src/features/firestoreUsage/hooks/useFirestoreUsageSnapshot.js

import * as React from 'react'

import {
  getFirestoreUsageSnapshot,
  resetFirestoreUsageSnapshot,
} from '../../../services/firestore/usage/index.js'

const DEFAULT_REFRESH_INTERVAL = 1000

const cloneSnapshot = snapshot => {
  if (!snapshot) return null

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(snapshot)
    } catch {
      // fallback below
    }
  }

  try {
    return JSON.parse(JSON.stringify(snapshot))
  } catch {
    return snapshot
  }
}

const downloadSnapshot = snapshot => {
  if (
    typeof window === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return
  }

  const content = JSON.stringify(snapshot, null, 2)
  const blob = new Blob([content], {
    type: 'application/json;charset=utf-8',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const timestamp = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replaceAll('.', '-')

  link.href = url
  link.download = `firestore-usage-${timestamp}.json`

  document.body.appendChild(link)
  link.click()
  link.remove()

  URL.revokeObjectURL(url)
}

export default function useFirestoreUsageSnapshot({
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  autoRefresh = true,
} = {}) {
  const [snapshot, setSnapshot] =
    React.useState(() =>
      cloneSnapshot(getFirestoreUsageSnapshot())
    )

  const [lastRefreshedAt, setLastRefreshedAt] =
    React.useState(() => new Date().toISOString())

  const refresh = React.useCallback(() => {
    const nextSnapshot = cloneSnapshot(
      getFirestoreUsageSnapshot()
    )

    setSnapshot(nextSnapshot)
    setLastRefreshedAt(new Date().toISOString())

    return nextSnapshot
  }, [])

  const reset = React.useCallback(() => {
    const nextSnapshot = cloneSnapshot(
      resetFirestoreUsageSnapshot()
    )

    setSnapshot(nextSnapshot)
    setLastRefreshedAt(new Date().toISOString())

    return nextSnapshot
  }, [])

  const exportJson = React.useCallback(() => {
    const currentSnapshot = cloneSnapshot(
      getFirestoreUsageSnapshot()
    )

    downloadSnapshot(currentSnapshot)

    return currentSnapshot
  }, [])

  React.useEffect(() => {
    if (!autoRefresh) return undefined

    const safeInterval = Math.max(
      Number(refreshInterval || 0),
      500
    )

    const intervalId = window.setInterval(
      refresh,
      safeInterval
    )

    return () => {
      window.clearInterval(intervalId)
    }
  }, [
    autoRefresh,
    refresh,
    refreshInterval,
  ])

  return {
    snapshot,
    lastRefreshedAt,

    refresh,
    reset,
    exportJson,
  }
}
