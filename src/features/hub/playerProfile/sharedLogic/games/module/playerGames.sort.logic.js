// playerProfile/sharedLogic/games/moduleLogic/playerGames.sort.logic.js

export const PLAYER_GAMES_SORT_OPTIONS = [
  { id: 'date', label: 'תאריך', idIcon: 'Date', defaultDirection: 'desc' },
  { id: 'rival', label: 'יריבה', idIcon: 'rival', defaultDirection: 'desc' },
  { id: 'home', label: 'משחקי בית', idIcon: 'home', defaultDirection: 'asc' },
  { id: 'difficulty', label: 'רמת קושי', idIcon: 'difficulty', defaultDirection: 'asc' },
]

export function getPlayerGamesSortLabel(sortBy) {
  if (sortBy === 'date') return 'תאריך'
  if (sortBy === 'rival') return 'יריבה'
  if (sortBy === 'home') return 'בית'
  if (sortBy === 'difficulty') return 'קושי'
  return 'תאריך'
}

export function getPlayerGamesSortDirectionIcon(sortDirection) {
  return sortDirection === 'asc' ? 'sortUp' : 'sortDown'
}

const safe = (value) => (value == null ? '' : String(value))
const lower = (value) => safe(value).trim().toLowerCase()

const toNumber = (value, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

const toDateMs = (game) => {
  const directMs = Number(game?.ms)
  if (Number.isFinite(directMs)) return directMs

  const rawDate = safe(game?.gameDate || game?.date).trim()
  const rawHour = safe(game?.gameHour || game?.hour).trim()

  if (!rawDate) return 0

  const isoLike = rawHour ? `${rawDate}T${rawHour}` : rawDate
  const parsed = new Date(isoLike).getTime()

  return Number.isFinite(parsed) ? parsed : 0
}

const normalizeHomeRank = (value) => {
  if (typeof value === 'boolean') return value ? 1 : 0

  const normalized = lower(value)

  if (normalized === 'home' || normalized === 'בית' || normalized === 'true' || normalized === '1') {
    return 1
  }

  if (normalized === 'away' || normalized === 'חוץ' || normalized === 'false' || normalized === '0') {
    return 0
  }

  return 0
}

const normalizeDifficultyRank = (value) => {
  const normalized = lower(value)

  if (!normalized) return 999
  if (normalized === 'easy' || normalized === 'קל') return 1
  if (normalized === 'medium' || normalized === 'בינוני') return 2
  if (normalized === 'hard' || normalized === 'קשה') return 3

  const numeric = toNumber(value, NaN)
  if (Number.isFinite(numeric)) return numeric

  return 999
}

const compareText = (a, b) => lower(a).localeCompare(lower(b), 'he')
const compareNumbers = (a, b) => toNumber(a) - toNumber(b)
const compareDates = (a, b) => toDateMs(a) - toDateMs(b)

const compareGamesBy = (left, right, sortBy) => {
  if (sortBy === 'date') return compareNumbers(toDateMs(left?.game), toDateMs(right?.game))
  if (sortBy === 'rival') return compareText(left?.rival, right?.rival)
  if (sortBy === 'home') {
    return compareNumbers(
      normalizeHomeRank(left?.home ?? left?.homeKey),
      normalizeHomeRank(right?.home ?? right?.homeKey)
    )
  }
  if (sortBy === 'difficulty') {
    return compareNumbers(
      normalizeDifficultyRank(left?.difficulty),
      normalizeDifficultyRank(right?.difficulty)
    )
  }

  return compareDates(left, right)
}

export function sortPlayerGamesRows(rows = [], sort = {}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const sortBy = safe(sort?.by || 'date')
  const sortDirection = safe(sort?.direction || 'desc')
  const directionFactor = sortDirection === 'asc' ? 1 : -1

  return [...safeRows].sort((left, right) => {
    const primary = compareGamesBy(left, right, sortBy)

    if (primary !== 0) return primary * directionFactor

    return compareDates(left, right) * -1
  })
}
