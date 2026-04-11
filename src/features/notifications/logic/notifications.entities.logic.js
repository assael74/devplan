// src/features/notifications/logic/notifications.entities.logic.js

function getMapValue(source, id) {
  if (!source || !id) return null

  if (source instanceof Map) {
    return source.get(id) || null
  }

  return source?.[id] || null
}

function resolvePlayer(notification, maps = {}) {
  const playerId =
    notification?.playerId ||
    notification?.context?.playerId ||
    ''

  if (!playerId) return null

  return getMapValue(maps?.playerById, playerId)
}

function resolveTeamFromPlayer(player, maps = {}) {
  if (!player) return null

  const teamId =
    player?.teamId ||
    player?.team?.id ||
    ''

  if (!teamId) return null

  return getMapValue(maps?.teamById, teamId) || player?.team || null
}

function resolveClubFromPlayer(player, maps = {}) {
  if (!player) return null

  const clubId =
    player?.clubId ||
    player?.club?.id ||
    ''

  if (!clubId) return null

  return getMapValue(maps?.clubById, clubId) || player?.club || null
}

function resolveTeam(notification, maps = {}, player = null) {
  const directTeamId =
    notification?.teamId ||
    notification?.context?.teamId ||
    ''

  if (directTeamId) {
    return getMapValue(maps?.teamById, directTeamId)
  }

  return resolveTeamFromPlayer(player, maps)
}

function resolveClub(notification, maps = {}, player = null, team = null) {
  const directClubId =
    notification?.clubId ||
    notification?.context?.clubId ||
    ''

  if (directClubId) {
    return getMapValue(maps?.clubById, directClubId)
  }

  if (team) {
    const teamClubId =
      team?.clubId ||
      team?.club?.id ||
      ''

    if (teamClubId) {
      return getMapValue(maps?.clubById, teamClubId) || team?.club || null
    }
  }

  return resolveClubFromPlayer(player, maps)
}

export function buildNotificationEntities(notification = {}, maps = {}) {
  const player = resolvePlayer(notification, maps)
  const team = resolveTeam(notification, maps, player)
  const club = resolveClub(notification, maps, player, team)

  return {
    player,
    team,
    club,
  }
}
