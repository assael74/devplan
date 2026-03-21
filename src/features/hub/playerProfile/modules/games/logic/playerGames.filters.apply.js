import { PLAYER_GAMES_FILTER_KEYS } from './playerGames.filters.constants.js'
import { buildHaystack } from '../../../../../../shared/games/games.search.logic.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])

export const matchesPlayerGameSearch = (game, search) => {
  const q = String(search || '').toLowerCase().trim()
  if (!q) return true

  return buildHaystack(game).includes(q)
}

export const applyPlayerGamesFilters = (rows, filters) => {
  return safeArray(rows).filter((game) => {
    if (!matchesPlayerGameSearch(game, filters?.search)) return false
    if (filters?.typeKey && game?.type !== filters.typeKey) return false
    if (filters?.homeKey && game?.homeKey !== filters.homeKey) return false
    if (filters?.resultKey && game?.result !== filters.resultKey) return false
    if (filters?.difficultyKey && game?.difficulty !== filters.difficultyKey) return false
    return true
  })
}

export const buildPlayerGamesSummary = (all, filtered, filters) => {
  const baseAll = safeArray(all)
  const baseFiltered = safeArray(filtered)

  const playedGames = baseFiltered.filter((game) => !!game?.result).length
  const upcomingGames = baseFiltered.filter((game) => !game?.result).length
  const activeFiltersCount = PLAYER_GAMES_FILTER_KEYS.filter((key) => !!filters?.[key]).length

  return {
    totalGames: baseAll.length,
    filteredGames: baseFiltered.length,
    playedGames,
    upcomingGames,
    activeFiltersCount,
  }
}
