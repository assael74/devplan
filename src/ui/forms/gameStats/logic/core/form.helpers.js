// src/ui/forms/gameStats/logic/core/form.helpers.js

export const toNumber = value => {
  const num = Number(value)
  return Number.isFinite(num) ? num : 0
}

export const getGameTitle = game => {
  return game?.rival || game?.rivel || game?.opponent || 'משחק ללא יריבה'
}

export const getGameStatsTeamName = ({ game, team, context } = {}) => {
  const source = game?.game || game || {}
  const player = context?.player || context?.entity || {}
  const privatePlayer = player.isPrivatePlayer === true ||
    player.playerSource === 'private' ||
    context?.isPrivatePlayer === true ||
    source.isExternalGame === true ||
    source.gameSource === 'external'

  const teamNames = privatePlayer
    ? [source.teamName, player.teamName, player.team?.teamName, player.team?.name]
    : [team?.teamName, team?.name, source.teamName, source.team?.teamName, context?.team?.teamName]
  const clubNames = privatePlayer
    ? [source.clubName, player.clubName, player.club?.clubName, player.club?.name]
    : [team?.club?.clubName, team?.club?.name, context?.club?.clubName, context?.club?.name, source.clubName]
  const pickName = values => {
    return values.map(value => value == null ? '' : String(value).trim()).find(Boolean) || ''
  }
  const clubName = pickName(clubNames)
  const teamName = pickName(teamNames)

  return Array.from(new Set([clubName, teamName].filter(Boolean))).join(' · ') || 'קבוצה'
}

export const getPlayerId = player => {
  return player?.playerId || player?.id || ''
}

export const getPlayerName = player => {
  return player?.playerFullName || player?.fullName || player?.name || 'שחקן ללא שם'
}

export const isPlayerStarting = player => {
  return Boolean(player?.isStarting || player?.onStart)
}

export const isPlayerInSquad = player => {
  return Boolean(player?.onSquad || player?.isSelected || player?.inSquad)
}
