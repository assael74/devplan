// teamProfile/sharedLogic/games/moduleLogic/teamGames.filters.apply.js

import { TEAM_GAMES_FILTER_KEYS } from './teamGames.filters.constants.js'
import { buildHaystack } from '../../../../../../shared/games/games.search.logic.js'
import { isGamePlayed } from '../../../../../../shared/games/games.constants.js'

const safeArray = (v) => (Array.isArray(v) ? v : [])

function toDateMs(value) {
  if (!value) return Number.POSITIVE_INFINITY

  if (value?.seconds) {
    return value.seconds * 1000
  }

  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.POSITIVE_INFINITY
  }

  const raw = String(value).trim()
  if (!raw) return Number.POSITIVE_INFINITY

  const match = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)

  if (match) {
    const day = Number(match[1])
    const month = Number(match[2])
    const year = Number(match[3])

    const time = new Date(year, month - 1, day).getTime()
    return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY
  }

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

const asText = value => {
  return value == null ? '' : String(value).trim()
}

const toNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback

  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const getGameId = game => {
  return asText(
    game?.gameId ||
      game?.id ||
      game?._id ||
      game?.game?.id ||
      game?.game?.gameId ||
      ''
  )
}

const getGameImpact = ({ game, teamScoringByGameId }) => {
  const gameId = getGameId(game)
  const score = gameId ? teamScoringByGameId[gameId] : null

  return toNumber(
    score?.matchImpact ??
      score?.impactDelta,
    null
  )
}

const matchesImpactFilter = ({ game, filters, teamScoringByGameId }) => {
  const key = filters?.impactKey

  if (!key) return true

  const impact = getGameImpact({
    game,
    teamScoringByGameId,
  })

  if (!Number.isFinite(impact)) return false
  if (key === 'positive') return impact > 0
  if (key === 'negative') return impact < 0

  return true
}

export const matchesTeamGameSearch = (game, search) => {
  const q = String(search || '').toLowerCase().trim()
  if (!q) return true

  return buildHaystack(game).includes(q)
}

export const applyTeamGamesFilters = ( rows, filters, extra = {} ) => {
  const teamScoringByGameId = extra?.teamScoringByGameId || {}

  const filtered = safeArray(rows).filter((game) => {
    if (!matchesTeamGameSearch(game, filters?.search)) return false
    if (filters?.typeKey && game?.type !== filters.typeKey) return false
    if (filters?.homeKey && game?.homeKey !== filters.homeKey) return false
    if (filters?.resultKey && game?.result !== filters.resultKey) return false
    if (filters?.difficultyKey && game?.difficulty !== filters.difficultyKey) return false
    if (filters?.onlyPlayed && !isGamePlayed(game)) return false

    if (!matchesImpactFilter({
      game,
      filters,
      teamScoringByGameId,
    })) {
      return false
    }

    return true
  })

  return sortGamesByDateAsc(filtered)
}

export const buildTeamGamesSummary = (all, filtered, filters) => {
  const baseAll = safeArray(all)
  const baseFiltered = safeArray(filtered)

  const playedGames = baseFiltered.filter(isGamePlayed).length
  const upcomingGames = baseFiltered.filter((game) => !isGamePlayed(game)).length

  const activeFiltersCount = TEAM_GAMES_FILTER_KEYS.filter((key) => {
    return Boolean(filters[key])
  }).length

  return {
    totalGames: baseAll.length,
    filteredGames: baseFiltered.length,
    playedGames,
    upcomingGames,
    activeFiltersCount,
  }
}
