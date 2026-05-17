// teamProfile/sharedLogic/players/moduleLogic/teamPlayers.sort.logic.js

const safe = (v) => (v == null ? '' : String(v))
const lower = (v) => safe(v).trim().toLowerCase()

const toNumber = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export const TEAM_PLAYERS_SORT_OPTIONS = [
  {
    id: 'level',
    label: 'פוטנציאל',
    idIcon: 'insights',
    defaultDirection: 'desc',
  },
  {
    id: 'name',
    label: 'שם',
    idIcon: 'players',
    defaultDirection: 'asc',
  },
  {
    id: 'timeRate',
    label: 'אחוזי דקות',
    idIcon: 'playTimeRate',
    defaultDirection: 'desc',
  },
  {
    id: 'goals',
    label: 'שערים',
    idIcon: 'goal',
    defaultDirection: 'desc',
  },
  {
    id: 'assists',
    label: 'בישולים',
    idIcon: 'assists',
    defaultDirection: 'desc',
  },
  {
    id: 'squadRole',
    label: 'מעמד',
    idIcon: 'star',
    defaultDirection: 'desc',
  },
  {
    id: 'projectStatus',
    label: 'סטטוס פרויקט',
    idIcon: 'project',
    defaultDirection: 'asc',
  },
]

const SQUAD_ROLE_ORDER = {
  key: 5,
  core: 4,
  rotation: 3,
  fringe: 2,
  '': 1,
}

const PROJECT_STATUS_ORDER = {
  approved: 10,
  signed: 9,
  messageSent: 8,
  contacted: 7,
  interested: 6,
  candidate: 5,
  candidateFlow: 5,
  followUp: 4,
  rejected: 3,
  noneType: 1,
  '': 1,
}

const getProjectStatusKey = (row) => {
  return (
    safe(row?.projectStatus).trim() ||
    safe(row?.projectChipMeta?.id).trim() ||
    safe(row?.type).trim() ||
    ''
  )
}

const isGeneralProjectStatus = (row) => {
  const key = getProjectStatusKey(row)

  return (
    !key ||
    key === 'noneType' ||
    key === 'default' ||
    key === 'general'
  )
}

const getProjectStatusValue = (row) => {
  const key = getProjectStatusKey(row)
  return PROJECT_STATUS_ORDER[key] ?? 2
}

const getSquadRoleValue = (row) => {
  const key = safe(row?.squadRole).trim()
  return SQUAD_ROLE_ORDER[key] ?? SQUAD_ROLE_ORDER['']
}

const getTimeRateValue = (row) => {
  const stats = row?.playerGamesStats || {}

  return toNumber(
    stats.minutesPct ??
      stats.timeRateValue ??
      stats.timeRate ??
      stats.playTimeRate ??
      stats.timeRatePct ??
      0
  )
}

const getGoalsValue = (row) => {
  return toNumber(row?.playerGamesStats?.goals ?? 0)
}

const getAssistsValue = (row) => {
  return toNumber(row?.playerGamesStats?.assists ?? 0)
}

const getSortValue = (row, sortBy) => {
  if (sortBy === 'name') return lower(row?.playerFullName)
  if (sortBy === 'level') return toNumber(row?.level)
  if (sortBy === 'timeRate') return getTimeRateValue(row)
  if (sortBy === 'goals') return getGoalsValue(row)
  if (sortBy === 'assists') return getAssistsValue(row)
  if (sortBy === 'squadRole') return getSquadRoleValue(row)
  if (sortBy === 'projectStatus') return getProjectStatusValue(row)

  return toNumber(row?.level)
}

const compareStrings = (a, b, direction) => {
  const result = a.localeCompare(b, 'he')
  return direction === 'asc' ? result : -result
}

const compareNumbers = (a, b, direction) => {
  return direction === 'asc' ? a - b : b - a
}

const compareProjectStatus = (rowA, rowB, direction) => {
  const aGeneral = isGeneralProjectStatus(rowA)
  const bGeneral = isGeneralProjectStatus(rowB)

  if (aGeneral && !bGeneral) return 1
  if (!aGeneral && bGeneral) return -1

  const a = getProjectStatusValue(rowA)
  const b = getProjectStatusValue(rowB)

  return compareNumbers(a, b, direction)
}

export const sortTeamPlayersRows = (
  rows,
  sort = { by: 'level', direction: 'desc' }
) => {
  const list = Array.isArray(rows) ? [...rows] : []
  const sortBy = safe(sort?.by).trim() || 'level'
  const direction = safe(sort?.direction).trim() === 'asc' ? 'asc' : 'desc'

  return list.sort((rowA, rowB) => {
    let result = 0

    if (sortBy === 'projectStatus') {
      result = compareProjectStatus(rowA, rowB, direction)
    } else {
      const a = getSortValue(rowA, sortBy)
      const b = getSortValue(rowB, sortBy)

      if (typeof a === 'string' || typeof b === 'string') {
        result = compareStrings(String(a), String(b), direction)
      } else {
        result = compareNumbers(toNumber(a), toNumber(b), direction)
      }
    }

    if (result !== 0) return result

    return compareStrings(lower(rowA?.playerFullName), lower(rowB?.playerFullName), 'asc')
  })
}

export function getTeamPlayersSortLabel(sortBy) {
  if (sortBy === 'name') return 'שם'
  if (sortBy === 'level') return 'פוטנציאל'
  if (sortBy === 'timeRate') return 'אחוזי דקות'
  if (sortBy === 'goals') return 'שערים'
  if (sortBy === 'assists') return 'בישולים'
  if (sortBy === 'squadRole') return 'מעמד'
  if (sortBy === 'projectStatus') return 'סטטוס פרויקט'

  return 'פוטנציאל'
}

export function getTeamPlayersSortDirectionIcon(sortDirection) {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

export function getTeamPlayersSortDirectionLabel(sortDirection) {
  return sortDirection === 'asc' ? 'מהנמוך לגבוה' : 'מהגבוה לנמוך'
}
