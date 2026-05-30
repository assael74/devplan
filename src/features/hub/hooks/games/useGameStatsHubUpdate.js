// src/features/hub/hooks/games/useGameStatsHubUpdate.js

import { useState } from 'react'

import {
  createGameStatsDoc,
  deleteGameStatsDoc,
  updateGameStatsDoc,
} from '../../../../services/firestore/shorts/gameStats/index.js'

const clean = value => {
  return String(value ?? '').trim()
}

const getStatsDocId = payload => {
  return clean(payload?.gameStatsDocId || payload?.statsDocId)
}

const hasStatsDocId = payload => {
  return Boolean(getStatsDocId(payload))
}

const withStatsDocId = payload => {
  const gameStatsDocId = getStatsDocId(payload)

  return {
    ...(payload || {}),
    ...(gameStatsDocId ? { gameStatsDocId } : {}),
  }
}

export function useGameStatsHubUpdate() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(null)

  const runCreate = async payload => {
    setPending(true)
    setError(null)

    try {
      return await createGameStatsDoc({ payload })
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runUpdate = async payload => {
    setPending(true)
    setError(null)

    try {
      return await updateGameStatsDoc({
        payload: withStatsDocId(payload),
      })
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runDelete = async payload => {
    setPending(true)
    setError(null)

    try {
      return await deleteGameStatsDoc({
        payload: withStatsDocId(payload),
      })
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runSave = async payload => {
    return hasStatsDocId(payload)
      ? runUpdate(payload)
      : runCreate(payload)
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
