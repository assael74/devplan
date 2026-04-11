// src/features/home/hooks/usePersonalTasks.js

import { useEffect, useMemo, useState } from 'react'

import { tasksShortsRef } from '../../../services/firestore/shortsCollections.js'
import { subscribeShorts } from '../../../services/firestore/shorts/shorts.subscribe.js'
import { resolveTasksFromShorts } from '../logic/tasks.resolver.js'

export default function usePersonalTasks() {
  const [tasksShorts, setTasksShorts] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = subscribeShorts(tasksShortsRef, setTasksShorts, setError)
    return () => unsub?.()
  }, [])

  const loading = !Array.isArray(tasksShorts)

  const value = useMemo(() => {
    if (loading) {
      return {
        loading: true,
        error,
        tasksShorts,
        tasks: [],
        tasksById: new Map(),
      }
    }

    const resolved = resolveTasksFromShorts(tasksShorts)

    return {
      loading: false,
      error,
      tasksShorts,
      ...resolved,
    }
  }, [loading, error, tasksShorts])

  return value
}
