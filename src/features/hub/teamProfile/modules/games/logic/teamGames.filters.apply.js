import { TEAM_GAMES_FILTER_KEYS } from './teamGames.filters.constants.js'
import { buildHaystack } from '../../../../../../shared/games/games.search.logic.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])

function toDateMs(value) {
  if (!value) return Number.POSITIVE_INFINITY

  // Firestore Timestamp
  if (value?.seconds) {
    return value.seconds * 1000
  }

  // Date instance
  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY
  }

  // numeric timestamp
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY
  }

  const raw = String(value).trim()
  if (!raw) return Number.POSITIVE_INFINITY

  // dd-mm-yyyy / dd/mm/yyyy
  const match = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (match) {
    const day = Number(match[1])
    const month = Number(match[2])
    const year = Number(match[3])

    const time = new Date(year, month - 1, day).getTime()
    return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY
  }

  // iso / regular parse fallback
  const time = new Date(raw).getTime()
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY
}

function getGameSortTime(game) {
  return toDateMs(
    game?.gameDate ||
    game?.date ||
    game?.gameDateObj ||
    game?.dateObj ||
    game?.dateMs
  )
}

function sortGamesByDateAsc(rows = []) {
  return [...rows].sort((a, b) => {
    return getGameSortTime(a) - getGameSortTime(b)
  })
}

export const matchesTeamGameSearch = (game, search) => {
  const q = String(search || '').toLowerCase().trim()
  if (!q) return true

  return buildHaystack(game).includes(q)
}

export const applyTeamGamesFilters = (rows, filters) => {
  const filtered = safeArray(rows).filter((game) => {
    if (!matchesTeamGameSearch(game, filters?.search)) return false
    if (filters?.typeKey && game?.type !== filters.typeKey) return false
    if (filters?.homeKey && game?.homeKey !== filters.homeKey) return false
    if (filters?.resultKey && game?.result !== filters.resultKey) return false
    if (filters?.difficultyKey && game?.difficulty !== filters.difficultyKey) return false
    return true
  })

  return sortGamesByDateAsc(filtered)
}

export const buildTeamGamesSummary = (all, filtered, filters) => {
  const baseAll = safeArray(all)
  const baseFiltered = safeArray(filtered)

  const playedGames = baseFiltered.filter((game) => !!game?.result).length
  const upcomingGames = baseFiltered.filter((game) => !game?.result).length
  const activeFiltersCount = TEAM_GAMES_FILTER_KEYS.filter((key) => !!filters?.[key]).length

  return {
    totalGames: baseAll.length,
    filteredGames: baseFiltered.length,
    playedGames,
    upcomingGames,
    activeFiltersCount,
  }
}
