// src/features/hub/hooks/games/useGameStatsHubUpdate.js

import { useState } from 'react'
import {
  createGameStatsDoc,
  deleteGameStatsDoc,
  updateGameStatsDoc,
} from '../../../../services/firestore/shorts/gameStats/index.js'

const clean = value => String(value ?? '').trim()

const hasStatsDocId = draft => {
  return Boolean(clean(draft?.gameStatsDocId || draft?.statsDocId))
}

export function useGameStatsHubUpdate() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const runCreate = async draft => {
    setPending(true)
    setError(null)

    try {
      return await createGameStatsDoc({ draft })
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runUpdate = async draft => {
    setPending(true)
    setError(null)

    try {
      return await updateGameStatsDoc({ draft })
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runDelete = async draft => {
    setPending(true)
    setError(null)

    try {
      return await deleteGameStatsDoc({ draft })
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runSave = async draft => {
    return hasStatsDocId(draft)
      ? runUpdate({
          ...draft,
          gameStatsDocId: draft?.gameStatsDocId || draft?.statsDocId,
        })
      : runCreate(draft)
  }

  return {
    runCreate,
    runUpdate,
    runDelete,
    runSave,
    pending,
    error,
  }
}
