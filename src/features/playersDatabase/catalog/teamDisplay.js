// features/playersDatabase/catalog/teamDisplay.js

const clean = value => String(value ?? '').trim()

const getTeamSlotFromTeamId = teamId => {
  const parts = clean(teamId).split('_').filter(Boolean)
  const lastPart = Number(parts[parts.length - 1])

  return Number.isInteger(lastPart) && lastPart > 1 ? lastPart : 1
}

export const buildTeamDisplayName = ({
  clubName = '',
  clubId = '',
  teamId = '',
  teamSlot = '',
} = {}) => {
  const baseName = clean(clubName || clubId || teamId)
  const slot = Number(teamSlot) || getTeamSlotFromTeamId(teamId)

  if (!baseName) return ''
  if (slot <= 1) return baseName

  return `${baseName} ${slot}`
}
