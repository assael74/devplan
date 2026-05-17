// src/features/hub/teamProfile/sharedLogic/players/insightsLogic/performance/perf.js

import {
  buildPlayerPerformance,
  getOrderedSeasonGames,
  getScopedGames,
  mergeSeasonProfileWithScopedMetrics,
} from './performanceScope.logic.js'

const emptyArray = []

export const buildPerf = ({
  games = emptyArray,
  team,
  calculationMode = 'games',
  performanceScope,
} = {}) => {
  const seasonGames = getOrderedSeasonGames(games)

  const scopedGames = getScopedGames({
    games,
    performanceScope,
  })

  const season = buildPlayerPerformance({
    games: seasonGames,
    team,
    calculationMode,
    classificationMode: 'season',
  })

  const scoped = buildPlayerPerformance({
    games: scopedGames,
    team,
    calculationMode,
    classificationMode: 'scope',
  })

  const rows = mergeSeasonProfileWithScopedMetrics({
    seasonRows: season?.rows,
    scopedRows: scoped?.rows,
    performanceScope,
  })

  return {
    playerPerformance: season,
    scopedPlayerPerformance: scoped,
    playerPerformanceRows: Array.isArray(rows) ? rows : emptyArray,
  }
}
