// features/playersDatabase/ui/pages/searchPage/logic/search.model.js

export function normalizeSearchRow(row = {}) {
  const current = row.current || row.currentSeason || {}

  return {
    ...row,
    id: row.id || row.playerId || row.externalId,
    playerName: row.playerName || row.name || row.fullName || 'שחקן ללא שם',
    teamName: row.teamName || current.teamName || '—',
    leagueName: row.leagueName || current.leagueName || '—',
    leagueLevel: row.leagueLevel || current.leagueLevel || '—',
    birthYear: row.birthYear || row.yearOfBirth || '—',
    seasonKey: row.seasonKey || current.seasonKey || '—',
    minutes: Number(row.minutes || current.minutes || 0),
    appearances: Number(row.appearances || row.games || current.appearances || current.games || 0),
    starts: Number(row.starts || current.starts || 0),
    goals: Number(row.goals || current.goals || 0),
    primaryProfile: row.primaryProfile || row.profileName || '—',
    score: Number(row.score || row.matchScore || 0),
  }
}

export function matchCondition(row, condition) {
  if (!condition || condition.value === '') return true

  const actual = Number(row[condition.field] || 0)
  const expected = Number(condition.value)

  if (condition.operator === 'gte') return actual >= expected
  if (condition.operator === 'lte') return actual <= expected
  if (condition.operator === 'gt') return actual > expected
  if (condition.operator === 'lt') return actual < expected
  if (condition.operator === 'eq') return actual === expected

  return true
}

export function filterSearchRows(rows, filters) {
  const normalizedRows = rows.map(normalizeSearchRow)
  const query = filters.query.trim().toLowerCase()

  return normalizedRows.filter(row => {
    const textMatch = !query || [
      row.playerName,
      row.teamName,
      row.leagueName,
    ].some(value => String(value).toLowerCase().includes(query))

    const birthYearMatch = !filters.birthYears.length ||
      filters.birthYears.includes(String(row.birthYear))
    const levelMatch = !filters.leagueLevels.length ||
      filters.leagueLevels.includes(String(row.leagueLevel))
    const leagueMatch = !filters.leagues.length ||
      filters.leagues.includes(row.leagueName)
    const profileMatch = !filters.scoutProfiles.length ||
      filters.scoutProfiles.some(profile => (
        String(row.primaryProfile).toLowerCase().includes(profile.toLowerCase())
      ))
    const statsMatch = filters.conditions.every(condition => (
      matchCondition(row, condition)
    ))

    return textMatch && birthYearMatch && levelMatch &&
      leagueMatch && profileMatch && statsMatch
  })
}
