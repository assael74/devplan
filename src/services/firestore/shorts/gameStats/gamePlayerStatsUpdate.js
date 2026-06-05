// src/services/firestore/shorts/gameStats/gamePlayerStatsUpdate.js

import { getGameStatsDoc } from './getGameStatsDoc.js'
import { updateGameStatsDoc } from './gameStatsUpdate.js'

import {
  clean,
  getRowPlayerId,
  safeArr,
} from './shared/index.js'

function getPayloadPlayerRow(payload) {
  const rows = safeArr(payload.playerStats)

  if (rows.length !== 1) {
    throw new Error('[updateGamePlayerStatsDoc] expected exactly one playerStats row')
  }

  const row = rows[0]
  const playerId = getRowPlayerId(row)

  if (!playerId) {
    throw new Error('[updateGamePlayerStatsDoc] missing playerId')
  }

  return row
}

function upsertPlayerStatsRow({ rows, nextRow }) {
  const playerId = getRowPlayerId(nextRow)
  const idx = rows.findIndex(row => getRowPlayerId(row) === playerId)

  if (idx < 0) return [...rows, nextRow]

  return rows.map((row, index) => {
    if (index !== idx) return row

    return {
      ...row,
      ...nextRow,
      playerId,
    }
  })
}

function ensurePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[updateGamePlayerStatsDoc] payload is required')
  }
}

function resolveGameStatsDocId(payload) {
  const gameStatsDocId = clean(payload.gameStatsDocId || payload.statsDocId)

  if (!gameStatsDocId) {
    throw new Error('[updateGamePlayerStatsDoc] missing gameStatsDocId')
  }

  return gameStatsDocId
}

function buildNextPlayerRow({ payload, currentStatsDoc, nextPlayerRow, gameStatsDocId }) {
  return {
    ...nextPlayerRow,
    gameId: payload.gameId || currentStatsDoc.gameId,
    teamId: payload.teamId || currentStatsDoc.teamId,
    gameStatsDocId,
  }
}

function buildUpdatePayload({
  payload,
  currentStatsDoc,
  gameStatsDocId,
  nextPlayerStats,
}) {
  return {
    ...payload,
    gameId: payload.gameId || currentStatsDoc.gameId,
    teamId: payload.teamId || currentStatsDoc.teamId,
    gameStatsDocId,
    playerStats: nextPlayerStats,
  }
}

export async function updateGamePlayerStatsDoc({ payload } = {}) {
  ensurePayload(payload)

  const gameStatsDocId = resolveGameStatsDocId(payload)
  const nextPlayerRow = getPayloadPlayerRow(payload)
  const currentStatsDoc = await getGameStatsDoc({ gameStatsDocId })

  if (!currentStatsDoc) {
    throw new Error(`[updateGamePlayerStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
  }

  const nextRow = buildNextPlayerRow({
    payload,
    currentStatsDoc,
    nextPlayerRow,
    gameStatsDocId,
  })

  const nextPlayerStats = upsertPlayerStatsRow({
    rows: safeArr(currentStatsDoc.playerStats),
    nextRow,
  })

  return updateGameStatsDoc({
    payload: buildUpdatePayload({
      payload,
      currentStatsDoc,
      gameStatsDocId,
      nextPlayerStats,
    }),
  })
}
