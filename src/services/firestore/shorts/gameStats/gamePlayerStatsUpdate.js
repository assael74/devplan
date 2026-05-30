// src/services/firestore/shorts/gameStats/gamePlayerStatsUpdate.js

import { getGameStatsDoc } from './getGameStatsDoc.js'
import { updateGameStatsDoc } from './gameStatsUpdate.js'

const clean = value => String(value ?? '').trim()

const safeArr = value => {
  return Array.isArray(value) ? value : []
}

const getPlayerId = row => {
  return clean(row?.playerId || row?.id)
}

const getPayloadPlayerRow = payload => {
  const rows = safeArr(payload?.playerStats)

  if (rows.length !== 1) {
    throw new Error('[updateGamePlayerStatsDoc] expected exactly one playerStats row')
  }

  const row = rows[0]
  const playerId = getPlayerId(row)

  if (!playerId) {
    throw new Error('[updateGamePlayerStatsDoc] missing playerId')
  }

  return row
}

const upsertPlayerStatsRow = ({ rows, nextRow }) => {
  const playerId = getPlayerId(nextRow)
  const idx = rows.findIndex(row => getPlayerId(row) === playerId)

  if (idx < 0) return [...rows, nextRow]

  return rows.map((row, index) => {
    return index === idx
      ? {
          ...row,
          ...nextRow,
          playerId,
        }
      : row
  })
}

export async function updateGamePlayerStatsDoc({ payload } = {}) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('[updateGamePlayerStatsDoc] payload is required')
  }

  const gameStatsDocId = clean(payload.gameStatsDocId || payload.statsDocId)

  if (!gameStatsDocId) {
    throw new Error('[updateGamePlayerStatsDoc] missing gameStatsDocId')
  }

  const nextPlayerRow = getPayloadPlayerRow(payload)

  const currentStatsDoc = await getGameStatsDoc({ gameStatsDocId })

  if (!currentStatsDoc) {
    throw new Error(`[updateGamePlayerStatsDoc] gameStats doc not found: ${gameStatsDocId}`)
  }

  const nextPlayerStats = upsertPlayerStatsRow({
    rows: safeArr(currentStatsDoc.playerStats),
    nextRow: {
      ...nextPlayerRow,
      gameId: payload.gameId || currentStatsDoc.gameId,
      teamId: payload.teamId || currentStatsDoc.teamId,
      gameStatsDocId,
    },
  })

  return updateGameStatsDoc({
    payload: {
      ...payload,
      gameId: payload.gameId || currentStatsDoc.gameId,
      teamId: payload.teamId || currentStatsDoc.teamId,
      gameStatsDocId,
      playerStats: nextPlayerStats,
    },
  })
}
