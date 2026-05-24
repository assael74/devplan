// src/features/hub/playerProfile/sharedLogic/profileData/playerEntity.model.js

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const toBoolean = value => {
  return value === true
}

const pickName = player => {
  return (
    asText(player?.playerFullName) ||
    asText(player?.fullName) ||
    asText(player?.playerName) ||
    asText(player?.name) ||
    asText(player?.label)
  )
}

export const buildPlayerProfileEntity = player => {
  if (!player) return null

  const name = pickName(player)

  return {
    ...player,

    id: asText(player.id || player.playerId),
    playerId: asText(player.playerId || player.id),

    teamId: asText(player.teamId),
    clubId: asText(player.clubId),

    playerFullName: name,
    name,
    label: name,

    active: toBoolean(player.active),
    photo: asText(player.photo),

    type: asText(player.type),
    project: asText(player.project),

    primaryPosition: asText(player.primaryPosition),
    position: asText(player.position),
    positionLayer: asText(player.positionLayer),

    squadRole: asText(player.squadRole),
    role: asText(player.role),

    team: player.team || null,
    club: player.club || null,

    performances: Array.isArray(player.performances)
      ? player.performances
      : [],

    meetings: Array.isArray(player.meetings)
      ? player.meetings
      : [],

    payments: Array.isArray(player.payments)
      ? player.payments
      : [],
  }
}
