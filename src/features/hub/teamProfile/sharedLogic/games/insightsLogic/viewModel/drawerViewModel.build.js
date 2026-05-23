// teamProfile/sharedLogic/games/insightsLogic/viewModel/drawerViewModel.build.js

import { buildTeamGamesTargetProgress } from '../targets/index.js'
import { buildTeamGamesHomeAwayProjection } from '../projections/index.js'
import { buildTeamGamesDifficultyProjection } from '../projections/index.js'
import { buildTeamGamesSquadMetrics } from '../squad/index.js'

import {
  buildPerformanceBrief,
} from '../../../../../../../shared/games/insights/team/sections/performance/index.js'

import {
  resolveGamesReady,
  resolveTeamGamesDrawerContext,
} from './drawerContext.resolve.js'

import {
  buildTeamGamesScoringModel,
} from './teamScoring.model.js'

const getScoringGames = ({ rawGames, fallbackGames }) => {
  if (Array.isArray(rawGames) && rawGames.length) return rawGames
  if (Array.isArray(fallbackGames) && fallbackGames.length) return fallbackGames

  return []
}

const buildTeamScoring = ({
  isGamesMode,
  scoringGames,
  team,
  calculation,
}) => {
  if (!isGamesMode || !scoringGames.length) return null

  return buildTeamGamesScoringModel({
    team,
    games: scoringGames,
    calculation,
  })
}

const buildPerformance = ({ teamScoring }) => {
  if (!teamScoring) return null

  return buildPerformanceBrief({
    teamScoring,
  })
}

export const buildTeamGamesDrawerViewModel = (insights) => {
  const context = resolveTeamGamesDrawerContext(insights)

  const {
    team,
    games,
    rawGames,
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

  const scoringGames = getScoringGames({
    rawGames,
    fallbackGames: safeGames,
  })

  const teamScoring = buildTeamScoring({
    isGamesMode,
    scoringGames,
    team,
    calculation,
  })

  const performanceBrief = buildPerformance({
    teamScoring,
  })

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

    teamScoring,
    performanceBrief,

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
