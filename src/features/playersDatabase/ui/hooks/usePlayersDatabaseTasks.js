// src/features/playersDatabase/ui/hooks/usePlayersDatabaseTasks.js

import * as React from 'react'

import { subscribePlayersDatabaseTasks } from '../../services/read/index.js'

export default function usePlayersDatabaseTasks() {
  const [tasks, setTasks] = React.useState(null)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const unsubscribe = subscribePlayersDatabaseTasks(
      setTasks,
      setError
    )

    return () => unsubscribe()
  }, [])

  return {
    tasks: Array.isArray(tasks) ? tasks : [],
    loading: !Array.isArray(tasks),
    error,
  }
}
