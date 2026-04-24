// features/hub/clubProfile/sharedLogic/teams/moduleLogic/clubTeams.sort.logic.js

export const CLUB_TEAMS_SORT_OPTIONS = [
  { id: 'name', label: 'שם קבוצה', idIcon: 'teams', defaultDirection: 'asc' },
  { id: 'year', label: 'שנתון', idIcon: 'Date', defaultDirection: 'desc' },
  { id: 'players', label: 'שחקנים', idIcon: 'players', defaultDirection: 'desc' },
  { id: 'keyPlayers', label: 'שחקני מפתח', idIcon: 'keyPlayer', defaultDirection: 'desc' },
  { id: 'leaguePosition', label: 'מיקום ליגה', idIcon: 'table', defaultDirection: 'asc' },
  { id: 'points', label: 'נקודות', idIcon: 'score', defaultDirection: 'desc' },
]

export function getClubTeamsSortLabel(sortBy) {
  if (sortBy === 'name') return 'שם'
  if (sortBy === 'year') return 'שנתון'
  if (sortBy === 'players') return 'שחקנים'
  if (sortBy === 'keyPlayers') return 'מפתח'
  if (sortBy === 'leaguePosition') return 'מיקום'
  if (sortBy === 'points') return 'נקודות'
  return 'שם'
}

export function getClubTeamsSortDirectionIcon(sortDirection) {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

const safe = (value) => (value == null ? '' : String(value))
const lower = (value) => safe(value).trim().toLowerCase()

const toNumber = (value, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

const compareText = (a, b) => lower(a).localeCompare(lower(b), 'he')
const compareNumbers = (a, b) => toNumber(a) - toNumber(b)

const compareTeamsBy = (left, right, sortBy) => {
  if (sortBy === 'name') return compareText(left?.teamName, right?.teamName)
  if (sortBy === 'year') return compareText(left?.teamYear, right?.teamYear)
  if (sortBy === 'players') return compareNumbers(left?.playersCount, right?.playersCount)
  if (sortBy === 'keyPlayers') return compareNumbers(left?.keyPlayersCount, right?.keyPlayersCount)
  if (sortBy === 'leaguePosition') return compareNumbers(left?.leaguePosition, right?.leaguePosition)
  if (sortBy === 'points') return compareNumbers(left?.points, right?.points)

  return compareText(left?.teamName, right?.teamName)
}

export function sortClubTeamsRows(rows = [], sort = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const sortBy = safe(sort?.by || 'name')
  const sortDirection = safe(sort?.direction || 'asc')
  const directionFactor = sortDirection === 'asc' ? 1 : -1

  return [...safeRows].sort((left, right) => {
    const primary = compareTeamsBy(left, right, sortBy)

    if (primary !== 0) return primary * directionFactor

    return compareText(left?.teamName, right?.teamName)
  })
}
