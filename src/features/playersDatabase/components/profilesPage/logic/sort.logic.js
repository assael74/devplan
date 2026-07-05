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

const compareValues = (left, right, direction = 'asc') => {
  if (left === right) return 0
  const factor = direction === 'asc' ? 1 : -1
  return left > right ? factor : -factor
}

const compareStrings = (left, right, direction = 'asc') =>
  cleanText(left).localeCompare(cleanText(right), 'he') * (direction === 'asc' ? 1 : -1)

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
