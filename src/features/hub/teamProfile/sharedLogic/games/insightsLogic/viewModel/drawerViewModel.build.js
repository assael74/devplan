// teamProfile/sharedLogic/games/insightsLogic/viewModel/drawerViewModel.build.js

import { buildTeamGamesTargetProgress } from '../targets/index.js'
import { buildTeamGamesHomeAwayProjection } from '../projections/index.js'
import { buildTeamGamesDifficultyProjection } from '../projections/index.js'
import { buildTeamGamesSquadMetrics } from '../squad/index.js'

import {
  resolveGamesReady,
  resolveTeamGamesDrawerContext,
} from './drawerContext.resolve.js'

export const buildTeamGamesDrawerViewModel = (insights) => {
  const context = resolveTeamGamesDrawerContext(insights)

  const {
    team,
    games,
    calculation,
    active,
    isGamesMode,
    readiness,
    sync,
    coverage,
    targets,
    benchmarkLevel,
    forecastLevel,
    blocking,
  } = context

  const gamesReady = resolveGamesReady({
    readiness,
    games,
  })

  const safeGames = gamesReady ? games : null

  const targetProgress = buildTeamGamesTargetProgress({
    source: active,
    calculation,
    coverage,
    sync,
    targets,
    benchmarkLevel,
    forecastLevel,
  })

  const homeAwayProjection =
    isGamesMode && safeGames
      ? buildTeamGamesHomeAwayProjection({
          league: active,
          games: safeGames,
          benchmarkLevel,
          targetProfile: benchmarkLevel,
        })
      : null

  const difficultyProjection =
    isGamesMode && safeGames
      ? buildTeamGamesDifficultyProjection({
          games: safeGames,
          benchmarkLevel,
          targetProfile: benchmarkLevel,
        })
      : null

  const squadMetrics =
    isGamesMode && safeGames
      ? buildTeamGamesSquadMetrics({
          team,
          games: safeGames,
        })
      : null

  return {
    calculation,
    readiness,
    sync,
    coverage,

    targetProgress,
    homeAwayProjection,
    difficultyProjection,
    squadMetrics,

    blocked: {
      games: !gamesReady,
      gamesReasons: !gamesReady
        ? blocking?.games || blocking?.medium || []
        : [],

      sync: sync?.isSynced === false,
      syncReasons: sync?.isSynced === false
        ? sync?.blockingReasons || []
        : [],
    },
  }
}
