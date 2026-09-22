// src/shared/scouting/teams/lines/teamLineBalancePlayerScope.js

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

export const isTeamLineBalanceRelevantPlayer = player => {
  if (!player || typeof player !== 'object') return false

  return clean(player.rosterStatus || 'regular') === 'regular'
}
