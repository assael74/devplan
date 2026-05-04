// shared/games/insights/team/teamInsights.build.js

import { buildTeamLeagueSnapshot } from './teamLeague.snapshot.js'
import { buildTeamGamesSnapshot } from './teamGames.snapshot.js'
import { buildTeamGamesSyncStatus } from './teamGames.sync.js'
import { buildTeamGamesCoverageStatus } from './teamGames.coverage.js'

import {
  DEFAULT_TEAM_GAMES_CALCULATION_MODE,
  buildTeamGamesCalculationState,
  normalizeTeamGamesCalculationMode,
} from './teamGames.calculation.js'

import {
  getTeamGamesBenchmarkLevelById,
  resolveTeamGamesTableLevelByProjectedPoints,
} from './team.benchmarks.js'

export const buildTeamGamesInsights = ({
  team,
  rows = [],
  normalizeRow,
  calculationMode = DEFAULT_TEAM_GAMES_CALCULATION_MODE,
}) => {
  const mode = normalizeTeamGamesCalculationMode(calculationMode)

  const teamSource = buildTeamLeagueSnapshot(team)
  const gamesSource = buildTeamGamesSnapshot({ rows, normalizeRow })

  const sources = {
    team: teamSource,
    games: gamesSource,
  }

  const calculation = buildTeamGamesCalculationState({
    mode,
    sources,
  })

  const active = calculation.active || teamSource

  const sync = buildTeamGamesSyncStatus({
    leagueSnapshot: teamSource,
    gamesSnapshot: gamesSource,
  })

  const coverage = buildTeamGamesCoverageStatus({
    teamSnapshot: teamSource,
    gamesSnapshot: gamesSource,
  })

  const targets = team?.targets || {}
  const benchmarkLevel = getTeamGamesBenchmarkLevelById(targets?.benchmarkLevelId)

  const forecastLevel = resolveTeamGamesTableLevelByProjectedPoints(
    active?.projectedTotalPoints
  )

  const teamReady = teamSource.isReady === true
  const gamesReady = gamesSource.isReady === true
  const heavyReady = false

  return {
    domain: 'teamGames',

    calculation,

    sources,

    readiness: {
      teamReady,
      gamesReady,
      gamesCoverageReady: coverage?.isFullPlayedCoverage === true,
      heavyReady,

      // legacy keys
      lightReady: teamReady,
      mediumReady: gamesReady,
    },

    league: teamSource,
    games: gamesSource,
    active,

    sync,
    coverage,

    targets,
    benchmarkLevel,
    forecastLevel,

    summary: {
      light: teamSource,
      medium: gamesReady ? gamesSource : null,
      active,
      heavy: null,
    },

    indicators: {
      sync,
      coverage,
    },

    blocking: {
      team: teamReady ? [] : teamSource.missingFields,
      games: gamesReady ? [] : ['missingPlayedGames'],

      // legacy keys
      light: teamReady ? [] : teamSource.missingFields,
      medium: gamesReady ? [] : ['missingPlayedGames'],

      // sync is now indication only, not calculation blocker
      sync: sync.isSynced ? [] : sync.blockingReasons,

      heavy: ['futurePerformanceStatsNotReady'],
    },
  }
}
