import { TEAM_GAMES_FILTER_KEYS } from './teamGames.filters.constants.js'

const safe = (v) => (v == null ? '' : String(v))
const safeArray = (v) => (Array.isArray(v) ? v : [])

export const matchesTeamGameSearch = (game, search) => {
  const q = safe(search).toLowerCase().trim()
  if (!q) return true

  return (
    safe(game?.rival).toLowerCase().includes(q) ||
    safe(game?.typeH).toLowerCase().includes(q) ||
    safe(game?.difficultyH).toLowerCase().includes(q) ||
    safe(game?.score).toLowerCase().includes(q)
  )
}

export const applyTeamGamesFilters = (rows, filters) => {
  return safeArray(rows).filter((game) => {
    if (!matchesTeamGameSearch(game, filters?.search)) return false
    if (filters?.typeKey && game?.type !== filters.typeKey) return false
    if (filters?.homeKey && game?.homeKey !== filters.homeKey) return false
    if (filters?.resultKey && game?.result !== filters.resultKey) return false
    if (filters?.difficultyKey && game?.difficulty !== filters.difficultyKey) return false
    return true
  })
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
