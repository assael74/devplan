// hub/teamProfile/modules/games/logic/teamGames.filters.logic.js

// hub/teamProfile/modules/games/logic/teamGames.filters.logic.js

import { createGameRowNormalizer } from '../../../../../../shared/games/games.normalize.logic.js'

const safe = (v) => (v == null ? '' : String(v))
const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export const createInitialTeamGamesFilters = () => ({
  search: '',
  periodKey: '',
  typeKey: '',
  resultKey: '',
  difficultyKey: '',
})

const normalize = createGameRowNormalizer({})

const applyFilters = (rows, filters) => {
  let res = Array.isArray(rows) ? [...rows] : []

  const q = safe(filters?.search).toLowerCase().trim()

  if (q) {
    res = res.filter((g) => {
      return (
        safe(g?.rival).toLowerCase().includes(q) ||
        safe(g?.typeH).toLowerCase().includes(q) ||
        safe(g?.score).toLowerCase().includes(q)
      )
    })
  }

  if (filters?.typeKey) {
    res = res.filter((g) => g?.type === filters.typeKey)
  }

  if (filters?.resultKey) {
    res = res.filter((g) => g?.result === filters.resultKey)
  }

  if (filters?.difficultyKey) {
    res = res.filter((g) => g?.difficulty === filters.difficultyKey)
  }

  return res
}

const buildSummary = (all, filtered) => {
  const played = filtered.filter((g) => g?.result)
  const upcoming = filtered.filter((g) => !g?.result)

  return {
    totalGames: all.length,
    filteredGames: filtered.length,
    playedGames: played.length,
    upcomingGames: upcoming.length,
    activeFiltersCount:
      (filtered.length !== all.length ? 1 : 0),
  }
}

const groupCount = (rows, getKey, getLabel, getIcon) => {
  const map = {}

  for (const row of rows) {
    const key = getKey(row) || 'none'
    if (!map[key]) {
      map[key] = {
        id: key,
        value: key,
        label: getLabel(row, key),
        idIcon: getIcon?.(row, key),
        count: 0,
      }
    }
    map[key].count += 1
  }

  return Object.values(map)
}

const buildOptions = (rows) => {
  const typeOptions = groupCount(
    rows,
    (g) => g?.type,
    (g, key) => g?.typeH || key,
    () => 'game'
  )

  const resultOptions = groupCount(
    rows,
    (g) => g?.result,
    (g, key) => {
      if (key === 'win') return 'ניצחון'
      if (key === 'draw') return 'תיקו'
      if (key === 'loss') return 'הפסד'
      return 'לא שוחק'
    },
    () => 'result'
  )

  const difficultyOptions = groupCount(
    rows,
    (g) => g?.difficulty,
    (g, key) => g?.difficultyH || key,
    () => 'difficulty'
  )

  const periodOptions = [
    {
      id: 'all',
      value: '',
      label: 'כל התקופות',
      count: rows.length,
    },
  ]

  return {
    typeOptions,
    resultOptions,
    difficultyOptions,
    periodOptions,
  }
}

const buildIndicators = (filters) => {
  const indicators = []

  if (filters?.search) {
    indicators.push({
      id: 'search',
      type: 'search',
      label: filters.search,
      idIcon: 'search',
    })
  }

  if (filters?.typeKey) {
    indicators.push({
      id: 'type',
      type: 'typeKey',
      label: filters.typeKey,
      idIcon: 'game',
    })
  }

  if (filters?.resultKey) {
    indicators.push({
      id: 'result',
      type: 'resultKey',
      label: filters.resultKey,
      idIcon: 'result',
    })
  }

  if (filters?.difficultyKey) {
    indicators.push({
      id: 'difficulty',
      type: 'difficultyKey',
      label: filters.difficultyKey,
      idIcon: 'difficulty',
    })
  }

  return indicators
}

const enrichGameWithTeam = (game, team) => {
  const srcTeam = team || {}

  return {
    ...game,

    team: srcTeam,
    teamId: srcTeam?.id || '',
    teamName: srcTeam?.teamName || srcTeam?.name || '',
    teamPhoto: srcTeam?.photo || '',
  }
}

export const resolveTeamGamesFiltersDomain = (team, filters) => {
  const raw = Array.isArray(team?.teamGames) ? team.teamGames : []

  const normalized = raw.map(normalize)

  const enriched = normalized.map((game) => enrichGameWithTeam(game, team))

  const filtered = applyFilters(enriched, filters)

  const summary = buildSummary(enriched, filtered)
  const options = buildOptions(enriched)
  const indicators = buildIndicators(filters)

  return {
    games: filtered,
    summary,
    options,
    indicators,
  }
}
