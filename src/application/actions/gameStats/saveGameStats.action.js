// src/application/actions/gameStats/saveGameStats.action.js

import {
  createGameStatsDoc,
  createTeamOnlyGameStatsDoc,
  savePrivatePlayerGameStatsDoc,
  updateGamePlayerStatsDoc,
  updateGameStatsDoc,
} from '../../../services/firestore/shorts/gameStats/index.js'
import { actionFailure, actionSuccess } from '../../shared/actionResult.js'

const clean = value => String(value || '').trim()
const getStatsDocId = payload => clean(payload?.gameStatsDocId || payload?.statsDocId)

function isPrivatePlayerScope(payload) {
  return (
    payload?.scope === 'privatePlayer' ||
    payload?.source === 'privatePlayerProfile' ||
    payload?.meta?.scope === 'privatePlayer' ||
    payload?.meta?.source === 'privatePlayerProfile'
  )
}

function isTeamOnlyScope(payload) {
  return (
    payload?.scope === 'team' ||
    payload?.statsScope === 'teamOnly' ||
    payload?.source === 'liveTaggingTeamOnly' ||
    payload?.meta?.scope === 'team'
  )
}

function isPlayerScope(payload) {
  return (
    payload?.scope === 'player' ||
    payload?.source === 'playerProfile' ||
    payload?.meta?.scope === 'player'
  )
}

function withStatsDocId(payload) {
  const gameStatsDocId = getStatsDocId(payload)

  return {
    ...(payload || {}),
    ...(gameStatsDocId ? { gameStatsDocId } : {}),
  }
}

export async function saveGameStats({ payload } = {}) {
  const normalizedPayload = withStatsDocId(payload)
  const gameStatsDocId = getStatsDocId(normalizedPayload)
  const metadata = {
    action: 'saveGameStats',
    gameId: clean(normalizedPayload?.gameId) || null,
    gameStatsDocId: gameStatsDocId || null,
    scope: normalizedPayload?.scope || normalizedPayload?.statsScope || null,
  }

  try {
    let data

    if (isPrivatePlayerScope(normalizedPayload)) {
      data = await savePrivatePlayerGameStatsDoc({ payload: normalizedPayload })
    } else if (isTeamOnlyScope(normalizedPayload) && !gameStatsDocId) {
      data = await createTeamOnlyGameStatsDoc({ payload: normalizedPayload })
    } else if (gameStatsDocId && isPlayerScope(normalizedPayload)) {
      data = await updateGamePlayerStatsDoc({ payload: normalizedPayload })
    } else if (gameStatsDocId) {
      data = await updateGameStatsDoc({ payload: normalizedPayload })
    } else {
      data = await createGameStatsDoc({ payload: normalizedPayload })
    }

    return actionSuccess({ data, metadata })
  } catch (error) {
    return actionFailure({ error, metadata })
  }
}
