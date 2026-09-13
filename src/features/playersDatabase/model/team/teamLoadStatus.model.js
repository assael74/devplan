// features/playersDatabase/model/team/teamLoadStatus.model.js

import { PLAYER_STATS_STATUS } from '../player/playerStats.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const buildTeamLoadStatus = teamPlayers => {
  const players = Array.isArray(teamPlayers) ? teamPlayers : []
  const playersCount = players.length
  const loadedPlayersCount = players.filter(player => (
    clean(player?.statsStatus) === PLAYER_STATS_STATUS.LOADED
  )).length

  return {
    playersCount,
    hasPlayers: playersCount > 0,
    hasStats: loadedPlayersCount > 0,
    statsComplete:
      playersCount > 0 &&
      loadedPlayersCount === playersCount,
  }
}
