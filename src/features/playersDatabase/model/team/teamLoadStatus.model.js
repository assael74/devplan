// features/playersDatabase/model/team/teamLoadStatus.model.js

import { PLAYER_STATS_STATUS } from '../player/playerStats.model.js'
import {
  countCurrentRosterPlayers,
  isCurrentRosterPlayer,
} from './rosterStatus.model.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const buildTeamLoadStatus = teamPlayers => {
  const players = Array.isArray(teamPlayers) ? teamPlayers : []
  const currentRosterPlayers = players.filter(isCurrentRosterPlayer)
  const playersCount = countCurrentRosterPlayers(players)
  const loadedPlayersCount = currentRosterPlayers.filter(player => (
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
