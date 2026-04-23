// teamProfile/sharedLogic/videos/moduleLogic/teamVideos.sort.logic.js

export const TEAM_VIDEOS_SORT_OPTIONS = [
  { id: 'date', label: 'תאריך', idIcon: 'calendar', defaultDirection: 'desc' },
  { id: 'name', label: 'שם וידאו', idIcon: 'videoAnalysis', defaultDirection: 'asc' },
  { id: 'playerName', label: 'שחקן', idIcon: 'players', defaultDirection: 'asc' },
  { id: 'tagsCount', label: 'תגיות', idIcon: 'tag', defaultDirection: 'desc' },
  { id: 'scope', label: 'סוג', idIcon: 'filters', defaultDirection: 'asc' },
  { id: 'month', label: 'חודש', idIcon: 'meetingDone', defaultDirection: 'desc' },
]

export function getTeamVideosSortLabel(sortBy) {
  if (sortBy === 'date') return 'תאריך'
  if (sortBy === 'name') return 'שם'
  if (sortBy === 'playerName') return 'שחקן'
  if (sortBy === 'tagsCount') return 'תגיות'
  if (sortBy === 'scope') return 'סוג'
  if (sortBy === 'month') return 'חודש'
  return 'תאריך'
}

export function getTeamVideosSortDirectionIcon(sortDirection) {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

const safe = (v) => (v == null ? '' : String(v))
const lower = (v) => safe(v).trim().toLowerCase()

const toNumber = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const toDateMs = (video) => {
  const raw =
    video?.videoDate ||
    video?.date ||
    video?.createdAt ||
    video?.meetingDate ||
    video?.ts ||
    ''

  if (!raw) return 0

  const parsed = new Date(raw).getTime()
  if (Number.isFinite(parsed)) return parsed

  const s = safe(raw)
  return s ? new Date(s).getTime() || 0 : 0
}

const compareText = (a, b) => lower(a).localeCompare(lower(b), 'he')

const compareNumbers = (a, b) => toNumber(a) - toNumber(b)

const compareDates = (a, b) => toDateMs(a) - toDateMs(b)

const compareByScope = (left, right) => {
  const leftScope = lower(left?.scope || left?.contextType)
  const rightScope = lower(right?.scope || right?.contextType)

  const rank = (value) => {
    if (value === 'analysis' || value === 'entity') return 1
    if (value === 'meeting') return 2
    return 99
  }

  return compareNumbers(rank(leftScope), rank(rightScope))
}

const compareByMonth = (left, right) => {
  const leftMonth = safe(left?.monthKey)
  const rightMonth = safe(right?.monthKey)

  if (leftMonth && rightMonth) {
    return leftMonth.localeCompare(rightMonth, 'he')
  }

  return compareDates(left, right)
}

const compareVideosBy = (left, right, sortBy) => {
  if (sortBy === 'date') return compareDates(left, right)
  if (sortBy === 'name') return compareText(left?.name, right?.name)
  if (sortBy === 'playerName') return compareText(left?.playerName, right?.playerName)
  if (sortBy === 'tagsCount') return compareNumbers(left?.tagsCount, right?.tagsCount)
  if (sortBy === 'scope') return compareByScope(left, right)
  if (sortBy === 'month') return compareByMonth(left, right)

  return compareDates(left, right)
}

export function sortTeamVideosRows(rows = [], sort = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const sortBy = safe(sort?.by || 'date')
  const sortDirection = safe(sort?.direction || 'desc')
  const directionFactor = sortDirection === 'asc' ? 1 : -1

  return [...safeRows].sort((left, right) => {
    const primary = compareVideosBy(left, right, sortBy)

    if (primary !== 0) {
      return primary * directionFactor
    }

    return compareDates(left, right) * -1
  })
}
