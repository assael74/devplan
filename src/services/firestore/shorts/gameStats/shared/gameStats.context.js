// src/services/firestore/shorts/gameStats/shared/gameStats.context.js

import { getPayloadNumber, toNum } from './gameStats.payload.js'

export function buildRegularGameContext({ payload, game, gameId, teamId }) {
  const gameDuration = game.gameDuration || payload.gameDuration || 0

  return {
    gameId,
    teamId,
    gameDuration,
    timePlayed: getPayloadNumber({
      payload,
      key: 'timePlayed',
      fallback: gameDuration,
    }),
    timeVideoStats: getPayloadNumber({
      payload,
      key: 'timeVideoStats',
      fallback: payload.teamVideoTime || gameDuration,
    }),
  }
}

export function buildRegularRollbackContext({ currentGameStats, game, gameId, teamId, gameStatsDocId }) {
  const savedTeamStats = currentGameStats.teamStats || {}
  const gameDuration = toNum(savedTeamStats.timePlayed) || toNum(game.gameDuration)

  return {
    gameId,
    teamId,
    gameStatsDocId,
    gameDuration,
    timePlayed: toNum(savedTeamStats.timePlayed) || gameDuration,
    timeVideoStats:
      toNum(savedTeamStats.timeVideoStats) ||
      toNum(savedTeamStats.timePlayed) ||
      gameDuration,
  }
}

export function buildPrivateGameContext({ payload, externalGame, playerRow, gameId }) {
  const gameDuration = toNum(externalGame.gameDuration || payload.gameDuration || 80)

  return {
    gameId,
    teamId: '',
    gameDuration,
    timePlayed: getPayloadNumber({
      payload,
      key: 'timePlayed',
      fallback: toNum(playerRow.timePlayed) || gameDuration,
    }),
    timeVideoStats: getPayloadNumber({
      payload,
      key: 'timeVideoStats',
      fallback: toNum(playerRow.timeVideoStats) || toNum(playerRow.timePlayed) || gameDuration,
    }),
  }
}

export function buildPrivateRollbackContext({ currentGameStats, externalGame, gameId, gameStatsDocId }) {
  const rows = Array.isArray(currentGameStats.playerStats)
    ? currentGameStats.playerStats
    : []

  const firstRow = rows[0] || {}
  const gameDuration = toNum(externalGame.gameDuration || firstRow.timePlayed || 80)

  return {
    gameId,
    teamId: '',
    gameStatsDocId,
    gameDuration,
    timePlayed: toNum(firstRow.timePlayed) || gameDuration,
    timeVideoStats:
      toNum(firstRow.timeVideoStats) ||
      toNum(firstRow.timePlayed) ||
      gameDuration,
  }
}
