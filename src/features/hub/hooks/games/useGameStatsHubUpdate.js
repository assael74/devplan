// src/features/hub/hooks/games/useGameStatsHubUpdate.js

import { useState } from 'react'

import {
  createGameStatsDoc,
  createTeamOnlyGameStatsDoc,
  deleteGameStatsDoc,
  deletePrivatePlayerGameStatsDoc,
  savePrivatePlayerGameStatsDoc,
  updateGameStatsDoc,
  updateGamePlayerStatsDoc,
} from '../../../../services/firestore/shorts/gameStats/index.js'

const clean = value => String(value ?? '').trim()
const getStatsDocId = payload => clean(payload?.gameStatsDocId || payload?.statsDocId)
const hasStatsDocId = payload => Boolean(getStatsDocId(payload))

const isPrivatePlayerScopeSave = payload => {
  return (
    payload?.scope === 'privatePlayer' ||
    payload?.source === 'privatePlayerProfile' ||
    payload?.meta?.scope === 'privatePlayer' ||
    payload?.meta?.source === 'privatePlayerProfile'
  )
}

const isTeamOnlyScopeSave = payload => {
  return (
    payload?.scope === 'team' ||
    payload?.statsScope === 'teamOnly' ||
    payload?.source === 'liveTaggingTeamOnly' ||
    payload?.meta?.scope === 'team'
  )
}

const isPlayerScopeSave = payload => {
  return (
    payload?.scope === 'player' ||
    payload?.source === 'playerProfile' ||
    payload?.meta?.scope === 'player'
  )
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

  const runRequest = async request => {
    setPending(true)
    setError(null)

    try {
      return await request()
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setPending(false)
    }
  }

  const runCreate = payload => {
    return runRequest(() => createGameStatsDoc({ payload }))
  }

  const runTeamOnlyCreate = payload => {
    return runRequest(() => createTeamOnlyGameStatsDoc({ payload }))
  }

  const runUpdate = payload => {
    return runRequest(() => updateGameStatsDoc({
      payload: withStatsDocId(payload),
    }))
  }

  const runPlayerUpdate = payload => {
    return runRequest(() => updateGamePlayerStatsDoc({
      payload: withStatsDocId(payload),
    }))
  }

  const runPrivatePlayerSave = payload => {
    return runRequest(() => savePrivatePlayerGameStatsDoc({
      payload: withStatsDocId(payload),
    }))
  }

  const runDelete = payload => {
    if (isPrivatePlayerScopeSave(payload)) {
      return runRequest(() => deletePrivatePlayerGameStatsDoc({
        payload: withStatsDocId(payload),
      }))
    }

    return runRequest(() => deleteGameStatsDoc({
      payload: withStatsDocId(payload),
    }))
  }

  const runSave = async payload => {
    if (isPrivatePlayerScopeSave(payload)) {
      return runPrivatePlayerSave(payload)
    }

    if (isTeamOnlyScopeSave(payload) && !hasStatsDocId(payload)) {
      return runTeamOnlyCreate(payload)
    }

    if (hasStatsDocId(payload) && isPlayerScopeSave(payload)) {
      return runPlayerUpdate(payload)
    }

    return hasStatsDocId(payload)
      ? runUpdate(payload)
      : runCreate(payload)
  }

  return {
    runCreate,
    runTeamOnlyCreate,
    runUpdate,
    runPlayerUpdate,
    runPrivatePlayerSave,
    runDelete,
    runSave,
    pending,
    error,
  }
}
