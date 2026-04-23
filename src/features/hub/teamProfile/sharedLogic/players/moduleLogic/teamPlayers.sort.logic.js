// teamProfile/sharedLogic/players/moduleLogic/teamPlayers.sort.logic.js

const safe = (v) => (v == null ? '' : String(v))
const lower = (v) => safe(v).trim().toLowerCase()

const toNumber = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const SQUAD_ROLE_ORDER = {
  key: 3,
  rotation: 2,
  fringe: 1,
  '': 0,
}

const PROJECT_STATUS_ORDER = {
  approved: 8,
  signed: 7,
  messageSent: 6,
  contacted: 5,
  interested: 4,
  candidate: 3,
  followUp: 2,
  rejected: 1,
  '': 0,
}

const getTimeRateValue = (row) => {
  const stats = row?.playerFullStats || {}
  return toNumber(
    stats.timeRateValue ??
      stats.timeRate ??
      stats.playTimeRate ??
      stats.timeRatePct ??
      0
  )
}

const getGoalsValue = (row) => {
  return toNumber(row?.playerFullStats?.goals ?? 0)
}

const getAssistsValue = (row) => {
  return toNumber(row?.playerFullStats?.assists ?? 0)
}

const getSortValue = (row, sortBy) => {
  if (sortBy === 'name') return lower(row?.fullName)
  if (sortBy === 'age') return toNumber(row?.age, 999)
  if (sortBy === 'level') return toNumber(row?.level)
  if (sortBy === 'timeRate') return getTimeRateValue(row)
  if (sortBy === 'goals') return getGoalsValue(row)
  if (sortBy === 'assists') return getAssistsValue(row)
  if (sortBy === 'squadRole') {
    return SQUAD_ROLE_ORDER[safe(row?.squadRole).trim()] ?? 0
  }
  if (sortBy === 'projectStatus') {
    return PROJECT_STATUS_ORDER[safe(row?.projectStatus).trim()] ?? 0
  }

  return toNumber(row?.level)
}

const compareStrings = (a, b, direction) => {
  const result = a.localeCompare(b, 'he')
  return direction === 'asc' ? result : -result
}

const compareNumbers = (a, b, direction) => {
  return direction === 'asc' ? a - b : b - a
}

export const sortTeamPlayersRows = (
  rows,
  sort = { by: 'level', direction: 'desc' }
) => {
  const list = Array.isArray(rows) ? [...rows] : []
  const sortBy = safe(sort?.by).trim() || 'level'
  const direction = safe(sort?.direction).trim() === 'asc' ? 'asc' : 'desc'

  return list.sort((rowA, rowB) => {
    const a = getSortValue(rowA, sortBy)
    const b = getSortValue(rowB, sortBy)

    let result = 0

    if (typeof a === 'string' || typeof b === 'string') {
      result = compareStrings(String(a), String(b), direction)
    } else {
      result = compareNumbers(toNumber(a), toNumber(b), direction)
    }

    if (result !== 0) return result

    return compareStrings(lower(rowA?.fullName), lower(rowB?.fullName), 'asc')
  })
}
