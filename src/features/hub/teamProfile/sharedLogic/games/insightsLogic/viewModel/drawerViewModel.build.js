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

  return {
    calculation,
    readiness,
    sync,
    coverage,

    targetProgress: buildTeamGamesTargetProgress({
      source: active,
      calculation,
      coverage,
      sync,
      targets,
      benchmarkLevel,
      forecastLevel,
    }),

    homeAwayProjection: isGamesMode
      ? buildTeamGamesHomeAwayProjection({
          league: active,
          games: safeGames || {},
        })
      : null,

    difficultyProjection: isGamesMode
      ? buildTeamGamesDifficultyProjection({
          games: safeGames || {},
        })
      : null,

    squadMetrics: isGamesMode
      ? buildTeamGamesSquadMetrics({
          team,
          games: safeGames || {},
        })
      : null,

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
