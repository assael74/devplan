// features/playersDatabase/components/profilesPage/logic/sort.logic.js

const cleanText = value => String(value ?? '').trim()

const statusOrder = {
  risk: 4,
  missingSnapshot: 3,
  profiles: 2,
  ok: 1,
}

export const PROFILE_LIST_SORT_OPTIONS = [
  {
    id: 'status',
    label: 'סטטוס',
    defaultDirection: 'desc',
  },
  {
    id: 'title',
    label: 'שם',
    defaultDirection: 'asc',
  },
  {
    id: 'scoutProfilesCount',
    label: 'פרופילים',
    defaultDirection: 'desc',
  },
  {
    id: 'loadedPlayersCount',
    label: 'שחקנים',
    defaultDirection: 'desc',
  },
  {
    id: 'loadedTeamsCount',
    label: 'קבוצות',
    defaultDirection: 'desc',
  },
  {
    id: 'riskCount',
    label: 'סיכון',
    defaultDirection: 'desc',
  },
  {
    id: 'latestSnapshotAt',
    label: 'עדכון אחרון',
    defaultDirection: 'desc',
  },
]

export const PLAYER_LIST_SORT_OPTIONS = [
  {
    id: 'playerName',
    label: 'שם שחקן',
    defaultDirection: 'asc',
  },
  {
    id: 'positionUpdated',
    label: 'עמדה מעודכנת',
    defaultDirection: 'desc',
  },
  {
    id: 'goals',
    label: 'כמות שערים',
    defaultDirection: 'desc',
  },
  {
    id: 'minutes',
    label: 'כמות דקות',
    defaultDirection: 'desc',
  },
  {
    id: 'team',
    label: 'קבוצה',
    defaultDirection: 'asc',
  },
]

const compareValues = (left, right, direction = 'asc') => {
  if (left === right) return 0
  const factor = direction === 'asc' ? 1 : -1
  return left > right ? factor : -factor
}

const compareStrings = (left, right, direction = 'asc') =>
  cleanText(left).localeCompare(cleanText(right), 'he') * (direction === 'asc' ? 1 : -1)

const compareBooleans = (left, right, direction = 'asc') => {
  const l = left ? 1 : 0
  const r = right ? 1 : 0
  return compareValues(l, r, direction)
}

const getPlayerRowName = row =>
  row?.fullName ||
  row?.playerName ||
  row?.name ||
  row?.title ||
  ''

const getPlayerRowTeam = row =>
  row?.clubName ||
  row?.teamName ||
  row?.team?.clubName ||
  row?.team?.teamName ||
  ''

const getPlayerRowGoals = row =>
  Number(row?.current?.goals ?? row?.goals ?? row?.stats?.goals ?? 0)

const getPlayerRowMinutes = row =>
  Number(row?.current?.minutes ?? row?.minutes ?? row?.stats?.minutes ?? 0)

const getPlayerRowPositionUpdated = row =>
  Boolean(
    cleanText(row?.positionLayer) &&
    !row?.missingDocumentLayer &&
    cleanText(row?.positionLayer) !== ''
  )

export function sortPlayerRowsByState(rows = [], sortBy = 'playerName', sortDirection = 'asc') {
  const direction = sortDirection === 'desc' ? 'desc' : 'asc'

  return [...rows].sort((a, b) => {
    if (sortBy === 'playerName') {
      const diff = compareStrings(getPlayerRowName(a), getPlayerRowName(b), direction)
      if (diff) return diff
    } else if (sortBy === 'positionUpdated') {
      const diff = compareBooleans(getPlayerRowPositionUpdated(a), getPlayerRowPositionUpdated(b), direction)
      if (diff) return diff
    } else if (sortBy === 'goals') {
      const diff = compareValues(getPlayerRowGoals(a), getPlayerRowGoals(b), direction)
      if (diff) return diff
    } else if (sortBy === 'minutes') {
      const diff = compareValues(getPlayerRowMinutes(a), getPlayerRowMinutes(b), direction)
      if (diff) return diff
    } else if (sortBy === 'team') {
      const diff = compareStrings(getPlayerRowTeam(a), getPlayerRowTeam(b), direction)
      if (diff) return diff
    } else {
      const diff = compareStrings(getPlayerRowName(a), getPlayerRowName(b), direction)
      if (diff) return diff
    }

    return compareStrings(getPlayerRowName(a), getPlayerRowName(b), 'asc')
  })
}

export function sortProfilesByState(rows = [], sortBy = 'status', sortDirection = 'desc') {
  const direction = sortDirection === 'asc' ? 'asc' : 'desc'

  return [...rows].sort((a, b) => {
    if (sortBy === 'status') {
      const left = statusOrder[a?.status] || 0
      const right = statusOrder[b?.status] || 0
      const diff = compareValues(left, right, direction)
      if (diff) return diff
    } else if (sortBy === 'title') {
      const diff = compareStrings(a?.title, b?.title, direction)
      if (diff) return diff
    } else if (sortBy === 'latestSnapshotAt') {
      const diff = compareStrings(a?.latestSnapshotAt, b?.latestSnapshotAt, direction)
      if (diff) return diff
    } else {
      const left = Number(a?.[sortBy]) || 0
      const right = Number(b?.[sortBy]) || 0
      const diff = compareValues(left, right, direction)
      if (diff) return diff
    }

    return cleanText(a?.title).localeCompare(cleanText(b?.title), 'he')
  })
}
