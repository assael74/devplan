
const safeArray = (v) => (Array.isArray(v) ? v : [])

export const buildTeamPlayersMap = (team) => {
  const teamPlayers = safeArray(team?.players)

  return new Map(
    teamPlayers.map((player) => [
      player?.id || player?.playerId,
      player,
    ])
  )
}

export const enrichGamePlayersWithTeam = (game, teamPlayersMap) => {
  const rawGamePlayers = safeArray(game?.game?.gamePlayers)

  return rawGamePlayers.map((item) => {
    const playerId = item?.playerId || item?.id || ''
    const player = teamPlayersMap.get(playerId) || {}

    return {
      ...item,
      playerId,
      photo: player?.photo || '',
      playerFullName: player?.playerFullName || '',
      isKey: player?.isKey || false,
      type: player?.type || item?.type || '',
    }
  })
}

export const enrichGameWithTeam = (game, team) => {
  const srcTeam = team || {}
  const teamPlayersMap = buildTeamPlayersMap(srcTeam)
  const gamePlayers = enrichGamePlayersWithTeam(game, teamPlayersMap)

  return {
    ...game,
    team: srcTeam,
    teamId: srcTeam?.id || '',
    teamName: srcTeam?.teamName || srcTeam?.name || '',
    teamPhoto: srcTeam?.photo || '',
    gamePlayers,
  }
}
