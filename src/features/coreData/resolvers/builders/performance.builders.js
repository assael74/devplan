// src/features/coreData/resolvers/builders/performance.builders.js

import { calculateFullPlayerStats, calculateFullTeamStats } from '../../../../shared/stats/stats.calc.js'

const safeId = (v) => (v == null ? '' : String(v))
const safeArr = (v) => (Array.isArray(v) ? v : [])

/**
 * ----------------------------------------
 * buildPlayerGamesByPlayerId
 * ----------------------------------------
 * יוצר אינדקס:
 *
 * playerId -> [
 *   { gameId, game, stats }
 * ]
 *
 */
export const buildPlayerGamesByPlayerId = (games = []) => {
  const map = new Map()

  for (const game of safeArr(games)) {
    const players = safeArr(game?.players || game?.gamePlayers)
    
    for (const p of players) {
      const pid = safeId(p?.playerId || p?.p)
      if (!pid) continue

      if (!map.has(pid)) map.set(pid, [])

      map.get(pid).push({
        gameId: game.id,
        game,
        stats: {
          isSelected: !!p?.isSelected,
          isStarting: !!p?.isStarting,
          timePlayed: Number(p?.timePlayed ?? 0),
          goals: Number(p?.goals ?? 0),
          assists: Number(p?.assists ?? 0),
        },
      })
    }
  }

  return map
}

/**
 * ----------------------------------------
 * buildPlayersWithStats
 * ----------------------------------------
 */
export const buildPlayersWithStats = (
  players = [],
  games = [],
  typeFilter = 'all'
) => {
  const playerGamesByPlayerId = buildPlayerGamesByPlayerId(games)

  return safeArr(players).map((player) => {
    const playerGames = playerGamesByPlayerId.get(safeId(player?.id)) || []

    const playerFullStats = calculateFullPlayerStats(playerGames, typeFilter)

    return {
      ...player,
      playerGames,
      playerFullStats,
    }
  })
}

/**
 * ----------------------------------------
 * buildTeamGamesByTeamId
 * ----------------------------------------
 */
export const buildTeamGamesByTeamId = (games = []) => {
  const map = new Map()

  for (const game of safeArr(games)) {
    const teamId = safeId(game?.teamId)
    if (!teamId) continue

    if (!map.has(teamId)) map.set(teamId, [])

    map.get(teamId).push({
      gameId: game.id,
      game,
      stats: {
        goalsFor: Number(game?.goalsFor ?? game?.gf ?? 0),
        goalsAgainst: Number(game?.goalsAgainst ?? game?.ga ?? 0),
      },
    })
  }

  return map
}

/**
 * ----------------------------------------
 * buildTeamsWithStats
 * ----------------------------------------
 */
export const buildTeamsWithStats = (
  teams = [],
  games = [],
  typeFilter = 'all'
) => {
  const teamGamesByTeamId = buildTeamGamesByTeamId(games)

  return safeArr(teams).map((team) => {
    const teamGames = teamGamesByTeamId.get(safeId(team?.id)) || []

    const teamFullStats = calculateFullTeamStats(teamGames, typeFilter)

    return {
      ...team,
      teamGames,
      teamFullStats,
    }
  })
}
