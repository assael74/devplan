// clubProfile/sharedLogic/players/moduleLogic/clubPlayers.sort.logic.js

export const CLUB_PLAYERS_SORT_OPTIONS = [
  { id: 'name', label: 'שם שחקן', idIcon: 'player', defaultDirection: 'asc' },
  { id: 'team', label: 'קבוצה', idIcon: 'teams', defaultDirection: 'asc' },
  { id: 'age', label: 'גיל', idIcon: 'age', defaultDirection: 'asc' },
  { id: 'position', label: 'עמדה', idIcon: 'position', defaultDirection: 'asc' },
  { id: 'level', label: 'יכולת', idIcon: 'abilities', defaultDirection: 'desc' },
  { id: 'squadRole', label: 'מעמד', idIcon: 'keyPlayer', defaultDirection: 'desc' },
]

const safe = (value) => (value == null ? '' : String(value))
const lower = (value) => safe(value).trim().toLowerCase()

const toNumber = (value, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

const compareText = (a, b) => lower(a).localeCompare(lower(b), 'he')
const compareNumbers = (a, b) => toNumber(a) - toNumber(b)

const getSquadRoleRank = (row) => {
  const weight = Number(row?.squadRoleMeta?.weight)
  if (Number.isFinite(weight)) return weight

  if (row?.squadRole === 'key') return 3
  if (row?.squadRole === 'rotation') return 2
  if (row?.squadRole === 'fringe') return 1

  return 0
}

const comparePlayersBy = (left, right, sortBy) => {
  if (sortBy === 'name') return compareText(left?.fullName, right?.fullName)
  if (sortBy === 'team') return compareText(left?.teamName, right?.teamName)
  if (sortBy === 'age') return compareNumbers(left?.age, right?.age)
  if (sortBy === 'position') return compareText(left?.generalPositionLabel, right?.generalPositionLabel)
  if (sortBy === 'level') return compareNumbers(left?.level, right?.level)
  if (sortBy === 'squadRole') return compareNumbers(getSquadRoleRank(left), getSquadRoleRank(right))

  return compareText(left?.fullName, right?.fullName)
}

export function sortClubPlayersRows(rows = [], sort = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const sortBy = safe(sort?.by || 'name')
  const sortDirection = safe(sort?.direction || 'asc')
  const directionFactor = sortDirection === 'asc' ? 1 : -1

  return [...safeRows].sort((left, right) => {
    const primary = comparePlayersBy(left, right, sortBy)

    if (primary !== 0) return primary * directionFactor

    return compareText(left?.fullName, right?.fullName)
  })
}

export function getClubPlayersSortLabel(sortBy) {
  if (sortBy === 'name') return 'שם'
  if (sortBy === 'team') return 'קבוצה'
  if (sortBy === 'age') return 'גיל'
  if (sortBy === 'position') return 'עמדה'
  if (sortBy === 'level') return 'פוטנציאל'
  if (sortBy === 'timeRate') return 'דקות משחק'
  if (sortBy === 'goals') return 'שערים'
  if (sortBy === 'assists') return 'בישולים'
  if (sortBy === 'squadRole') return 'מעמד'
  if (sortBy === 'projectStatus') return 'סטטוס פרויקט'
  return 'פוטנציאל'
}

export function getClubPlayersSortDirectionIcon(sortDirection) {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

export function getClubPlayersSortDirectionLabel(sortDirection) {
  return sortDirection === 'asc' ? 'מהנמוך לגבוה' : 'מהגבוה לנמוך'
}
