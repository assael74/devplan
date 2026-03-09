// src/shared/stats/stats.builders.js
const safeId = (v) => (v == null ? '' : String(v))

function normalizeStatsArrayToObject(arr) {
  const out = {}
  const list = Array.isArray(arr) ? arr : []
  for (const x of list) {
    const k = safeId(x?.id || x?.key)
    if (!k) continue
    out[k] = x?.value
  }
  return out
}

export function buildGameStatsByGameId(gameStatsShorts = []) {
  const map = new Map()
  for (const doc of Array.isArray(gameStatsShorts) ? gameStatsShorts : []) {
    const gid = doc?.gameId || doc?.id || doc?.game?.id || null
    if (!gid) continue
    map.set(gid, doc)
  }
  return map
}

export function buildGamesWithStats(games = [], gameStatsShorts = []) {
  const statByGameId = buildGameStatsByGameId(gameStatsShorts)

  return (Array.isArray(games) ? games : []).map((game) => {
    const gameStat = statByGameId.get(game?.id)
    return {
      ...game,
      hasStats: !!gameStat,
      playerStats: gameStat?.playerStats || [],
      teamStats: gameStat?.teamStats || [],
      rivelStats: gameStat?.rivelStats || [],
      gameStat: gameStat || null,
    }
  })
}

export function buildPlayerGamesByPlayerId(gamesWithStats = []) {
  const map = new Map()

  for (const game of Array.isArray(gamesWithStats) ? gamesWithStats : []) {
    if (!game?.hasStats) continue

    const psArr = Array.isArray(game.playerStats) ? game.playerStats : []
    for (const ps of psArr) {
      const pid = safeId(ps?.playerId || ps?.id)
      if (!pid) continue

      if (!map.has(pid)) map.set(pid, [])
      map.get(pid).push({ gameId: game.id, game, stats: ps })
    }
  }

  return map
}

export function buildPlayersWithStats(players = [], gamesWithStats = [], calc, typeFilter = 'all') {
  const playerGamesByPlayerId = buildPlayerGamesByPlayerId(gamesWithStats)

  return (Array.isArray(players) ? players : []).map((player) => {
    const playerGames = playerGamesByPlayerId.get(safeId(player?.id)) || []
    const playerFullStats = calc(playerGames, typeFilter)
    return { ...player, playerGames, playerFullStats }
  })
}

export function buildTeamGamesByTeamId(gamesWithStats = []) {
  const map = new Map()

  for (const game of Array.isArray(gamesWithStats) ? gamesWithStats : []) {
    if (!game?.hasStats) continue

    const teamId = safeId(game?.teamId || game?.gameStat?.teamId)
    if (!teamId) continue

    const statsObj = normalizeStatsArrayToObject(game?.teamStats)

    if (!map.has(teamId)) map.set(teamId, [])
    map.get(teamId).push({ gameId: game.id, game, stats: statsObj })
  }

  return map
}

export function buildTeamsWithStats(teams = [], gamesWithStats = [], calc, typeFilter = 'all') {
  const teamGamesByTeamId = buildTeamGamesByTeamId(gamesWithStats)

  return (Array.isArray(teams) ? teams : []).map((team) => {
    const teamGames = teamGamesByTeamId.get(safeId(team?.id)) || []
    const teamFullStats = calc(teamGames, typeFilter)
    return { ...team, teamGames, teamFullStats }
  })
}
