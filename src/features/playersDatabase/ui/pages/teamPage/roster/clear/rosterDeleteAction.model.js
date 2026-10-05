// src/features/playersDatabase/ui/pages/teamPage/roster/clear/rosterDeleteAction.model.js

const clean = value => String(value === undefined || value === null ? '' : value).trim()
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {}
const hasRows = value => Object.keys(object(value)).length > 0

export const resolveNextTeamSeasonDeleteAction = ({
  teamId = '',
  seasonId = '',
  leagueId = '',
  teamSeason = null,
} = {}) => {
  const source = object(teamSeason)
  const identity = object(source.identity)
  if (
    !clean(teamId) ||
    clean(identity.teamId) !== clean(teamId) ||
    clean(identity.seasonId) !== clean(seasonId) ||
    clean(identity.leagueId) !== clean(leagueId)
  ) return null

  if (clean(source.stats && source.stats.statsLoadState && source.stats.statsLoadState.status) === 'loaded') {
    return 'stats'
  }

  const roster = object(source.roster)
  const movement = object(source.movement)
  const hasRosterState = hasRows(roster.playersById) ||
    hasRows(roster.rosterImport) ||
    hasRows(movement.transfersInById) ||
    hasRows(movement.transfersOutById) ||
    hasRows(movement.pendingById)

  return hasRosterState ? 'roster' : null
}

export default resolveNextTeamSeasonDeleteAction
