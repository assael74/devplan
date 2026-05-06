// teamProfile/sharedLogic/games/insightsLogic/squad/squad.players.js

import { EMPTY } from '../common/index.js'

export const getPlayerId = (player = {}) => {
  return player?.id || player?.playerId || player?.uid || ''
}

export const getPlayerName = (player = {}, fallback = EMPTY) => {
  const fullName = String(player?.playerFullName || '').trim()
  if (fullName) return fullName

  const shortName = String(player?.playerShortName || '').trim()
  if (shortName) return shortName

  const firstName = String(player?.playerFirstName || '').trim()
  const lastName = String(player?.playerLastName || '').trim()
  const joined = `${firstName} ${lastName}`.trim()

  return joined || fallback
}

export const isActiveSquadPlayer = (player = {}) => {
  if (!player || !getPlayerId(player)) return false

  if (player?.isDeleted === true) return false
  if (player?.deleted === true) return false
  if (player?.archived === true) return false
  if (player?.isArchived === true) return false
  if (player?.isActive === false) return false
  if (player?.active === false) return false

  const status = String(player?.status || player?.playerStatus || '').toLowerCase()
  if (['inactive', 'archived', 'deleted', 'left'].includes(status)) return false

  return true
}

export const buildPlayersMap = (players = []) => {
  return players.reduce((acc, player) => {
    const id = getPlayerId(player)
    if (!id) return acc

    acc[id] = player
    return acc
  }, {})
}

export const getActiveSquadPlayers = (team = {}) => {
  const players = Array.isArray(team?.players) ? team.players : []
  return players.filter(isActiveSquadPlayer)
}
