// Canonical Club Season Identity Index projection builders. Pure domain calculation.

const clean = value => String(value === undefined || value === null ? '' : value).trim()

const sortEntries = entries => [...entries].sort((left, right) => (
  clean(left.clubId).localeCompare(clean(right.clubId)) ||
  Number(left.teamSlot || 1) - Number(right.teamSlot || 1) ||
  clean(left.leagueId).localeCompare(clean(right.leagueId))
))

export const buildLeagueClubSeasonIdentityEntries = ({
  league = {},
  season = {},
  rows = [],
} = {}) => {
  const seasonKey = clean(season.seasonKey || season.seasonId)
  const birthYear = Number(season.birthYear) || 0
  const leagueId = clean(league.id || league.leagueId || season.leagueId)
  const leagueName = clean(league.name || league.leagueName)
  const leagueLevel = Number(league.level) || 0
  const ageGroupId = clean(league.ageGroupId || season.ageGroupId)

  if (!seasonKey || !birthYear || !leagueId) return []

  const entries = new Map()

  ;(Array.isArray(rows) ? rows : []).forEach(row => {
    const clubId = clean(row?.clubId)
    const teamId = clean(row?.teamId || row?.birthTeamId)
    if (!clubId || !teamId) return

    const teamSlot = Number(row?.birthTeamSlot || row?.teamSlot || 1) || 1
    const entry = {
      clubId,
      ageGroupId,
      teamId,
      teamSlot,
      leagueId,
      leagueName,
      leagueLevel,
    }

    entries.set(`${clubId}::${teamSlot}::${teamId}`, entry)
  })

  return sortEntries([...entries.values()])
}

export const buildNextClubSeasonIdentityEntries = ({
  existingEntries = [],
  leagueEntries = [],
  leagueId = '',
} = {}) => {
  const safeLeagueId = clean(leagueId)
  const previousLeagueEntries = (Array.isArray(existingEntries) ? existingEntries : [])
    .filter(entry => clean(entry?.leagueId) === safeLeagueId)
  const retainedEntries = (Array.isArray(existingEntries) ? existingEntries : [])
    .filter(entry => clean(entry?.leagueId) !== safeLeagueId)
  const safeLeagueEntries = Array.isArray(leagueEntries) ? leagueEntries : []
  const currentClubTeamKeys = new Set(safeLeagueEntries.map(entry => (
    `${clean(entry?.clubId)}::${clean(entry?.teamId)}`
  )))
  const removedEntries = previousLeagueEntries.filter(entry => (
    !currentClubTeamKeys.has(`${clean(entry?.clubId)}::${clean(entry?.teamId)}`)
  ))

  return {
    entries: sortEntries([...retainedEntries, ...safeLeagueEntries]),
    removedEntries,
  }
}
