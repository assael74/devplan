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
    id: 'seasonPlanStatus',
    label: 'תכנון לעונה',
    idIcon: 'notReviewed',
    defaultDirection: 'asc',
  },
  {
    id: 'performanceProfile',
    label: 'פרופיל תפקוד',
    idIcon: 'insights',
    defaultDirection: 'asc',
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

const PERFORMANCE_PROFILE_ORDER = {
  stat_anchor: 1,
  core_worker: 2,
  weak_spot: 3,
  joker: 4,
  unstable: 5,
  secondary_contributor: 6,
  out_of_sample: 99,
  '': 100,
}

const SEASON_PLAN_STATUS_ORDER = {
  inSquad: 0,
  wantsToLeave: 1,
  undecided: 2,
  underReview: 3,
  notReviewed: 4,
  notSuitable: 5,
  '': 99,
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

const getPerformanceProfileKey = row => {
  return (
    safe(row?.performance?.profileId).trim() ||
    safe(row?.performance?.insightId).trim() ||
    safe(row?.performance?.profile?.id).trim() ||
    ''
  )
}

const getPerformanceProfileValue = row => {
  const key = getPerformanceProfileKey(row)
  return PERFORMANCE_PROFILE_ORDER[key] ?? 100
}


const getSeasonPlanStatusKey = row => {
  return (
    safe(row?.seasonPlanStatus?.value).trim() ||
    safe(row?.seasonPlanStatus).trim() ||
    safe(row?.raw?.seasonPlanStatus?.value).trim() ||
    safe(row?.raw?.seasonPlanStatus).trim() ||
    safe(row?.raw?.player?.seasonPlanStatus).trim() ||
    safe(row?.player?.seasonPlanStatus).trim() ||
    ''
  )
}

const getSeasonPlanStatusValue = row => {
  const key = getSeasonPlanStatusKey(row)
  return SEASON_PLAN_STATUS_ORDER[key] ?? 99
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
  if (sortBy === 'seasonPlanStatus') return getSeasonPlanStatusValue(row)
  if (sortBy === 'projectStatus') return getProjectStatusValue(row)
  if (sortBy === 'performanceProfile') return getPerformanceProfileValue(row)

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

const compareSquadRoleThenName = (rowA, rowB) => {
  const roleResult = compareNumbers(
    getSquadRoleValue(rowA),
    getSquadRoleValue(rowB),
    'desc'
  )

  if (roleResult !== 0) return roleResult

  return compareStrings(
    lower(rowA?.playerFullName),
    lower(rowB?.playerFullName),
    'asc'
  )
}

export const sortTeamPlayersRows = (
  rows,
  sort = { by: 'squadRole', direction: 'desc' }
) => {
  const list = Array.isArray(rows) ? [...rows] : []
  const sortBy = safe(sort?.by).trim() || 'squadRole'
  const direction = safe(sort?.direction).trim() === 'asc' ? 'asc' : 'desc'

  return list.sort((rowA, rowB) => {
    if (sortBy === 'squadRole' || sortBy === 'name') {
      return compareSquadRoleThenName(rowA, rowB)
    }

    if (sortBy === 'seasonPlanStatus') {
      const result = compareNumbers(
        getSeasonPlanStatusValue(rowA),
        getSeasonPlanStatusValue(rowB),
        direction
      )

      if (result !== 0) return result

      return compareStrings(lower(rowA?.playerFullName), lower(rowB?.playerFullName), 'asc')
    }

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
  if (sortBy === 'performanceProfile') return 'פרופיל תפקוד'

  if (sortBy === 'seasonPlanStatus') return 'תכנון לעונה'
  return 'פוטנציאל'
}

export function getTeamPlayersSortDirectionIcon(sortDirection) {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

export function getTeamPlayersSortDirectionLabel(sortDirection) {
  return sortDirection === 'asc' ? 'מהנמוך לגבוה' : 'מהגבוה לנמוך'
}
