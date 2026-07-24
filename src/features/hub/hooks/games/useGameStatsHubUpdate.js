// src/features/hub/hooks/games/useGameStatsHubUpdate.js

import { useState } from 'react'

import {
  deleteGameStats,
  saveGameStats,
  unwrapActionResult,
} from '../../application/index.js'

export function useGameStatsHubUpdate() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const runRequest = async request => {
    setPending(true)
    setError(null)

    try {
      const result = await request()
      return unwrapActionResult(result)
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runSave = payload => {
    return runRequest(() => saveGameStats({ payload }))
  }

  const runDelete = payload => {
    return runRequest(() => deleteGameStats({ payload }))
  }

  return {
    runCreate: runSave,
    runTeamOnlyCreate: runSave,
    runUpdate: runSave,
    runPlayerUpdate: runSave,
    runPrivatePlayerSave: runSave,
    runDelete,
    runSave,
    pending,
    error,
  }
}
