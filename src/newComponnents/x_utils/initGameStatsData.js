import { calculateFullPlayerStats, calculateFullTeamStats, calculateFullScoutStats } from './statsUtils.js'

export const initGameStatsData = ({
  gameStatsShorts = [],
  players = [],
  teams = [],
  games = [],
  scouting = [],
}) => {
  // Index games by id (O(G))
  const gameById = new Map((games || []).map(g => [g.id, g]))

  // Index stats by gameId and by teamId (O(S))
  const statByGameId = new Map()
  const statsByTeamId = new Map()

  // Index player appearances: playerId -> [{gameId, teamId, gameMeta, gameStats}] (O(total playerStats))
  const playerGamesByPlayerId = new Map()

  for (const stat of gameStatsShorts || []) {
    if (!stat) continue
    statByGameId.set(stat.gameId, stat)

    // team index
    if (stat.teamId) {
      const arr = statsByTeamId.get(stat.teamId) || []
      arr.push(stat)
      statsByTeamId.set(stat.teamId, arr)
    }

    // player index
    const gameMeta = gameById.get(stat.gameId) || {}
    const pStats = Array.isArray(stat.playerStats) ? stat.playerStats : []

    for (const ps of pStats) {
      const playerId = ps?.playerId
      if (!playerId) continue
      const arr = playerGamesByPlayerId.get(playerId) || []
      arr.push({
        gameId: stat.gameId,
        teamId: stat.teamId,
        ...gameMeta,
        gameStats: ps,
      })
      playerGamesByPlayerId.set(playerId, arr)
    }
  }

  // Players with stats (O(P + total player games))
  const playersWithStats = (players || []).map(player => {
    const playerGames = playerGamesByPlayerId.get(player.id) || []
    const playerFullStats = calculateFullPlayerStats(playerGames, 'all')
    return { ...player, playerGames, playerFullStats }
  })

  // Teams with stats (O(T + total team games))
  const teamsWithStats = (teams || []).map(team => {
    const teamStatsArr = statsByTeamId.get(team.id) || []
    const teamGames = teamStatsArr.map(stat => {
      const gameMeta = gameById.get(stat.gameId) || {}
      return {
        gameId: stat.gameId,
        ...gameMeta,
        teamStats: stat.teamStats,
        rivelStats: stat.rivelStats,
        playerStats: stat.playerStats,
      }
    })
    const teamFullStats = calculateFullTeamStats(teamGames)
    return { ...team, teamGames, teamFullStats }
  })

  // Games with stats (O(G))
  const gamesWithStats = (games || []).map(game => {
    const gameStat = statByGameId.get(game.id)
    return {
      ...game,
      hasStats: !!gameStat,
      playerStats: gameStat?.playerStats || [],
      teamStats: gameStat?.teamStats || [],
      rivelStats: gameStat?.rivelStats || [],
    }
  })

  const scoutingsWithStats = (scouting || []).map(scout => ({
    ...scout,
    scoutStats: calculateFullScoutStats(scout, 'all'),
  }))

  return { playersWithStats, teamsWithStats, gamesWithStats, scoutingsWithStats }
}
