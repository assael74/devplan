// shared/games/insights/team/build/teamGamesInsights.build.js

import { buildTeamLeagueSnapshot } from '../snapshots/teamLeague.snapshot.js'
import { buildTeamGamesSnapshot } from '../snapshots/teamGames.snapshot.js'
import { buildTeamGamesSyncStatus } from '../snapshots/teamGames.sync.js'
import { buildTeamGamesCoverageStatus } from '../snapshots/teamGames.coverage.js'

import {
  DEFAULT_TEAM_GAMES_CALCULATION_MODE,
  buildTeamGamesCalculationState,
  normalizeTeamGamesCalculationMode,
} from '../snapshots/teamGames.calculation.js'

import {
  resolveTeamTargetGap,
} from '../targets/index.js'

import {
  buildTeamTargetsState,
  resolveTeamForecastProfileFromActive,
} from '../../../../teams/targets/index.js'

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

  const targets = team?.targets?.hasTargets
    ? team.targets
    : buildTeamTargetsState(team)

  const targetPositionMode = targets?.targetPositionMode || ''
  const targetPosition = targets?.targetPosition || ''
  const targetProfile = targets?.targetProfile || null

  const targetProfileId =
    targets?.resolvedProfileId ||
    targets?.targetProfileId ||
    targetProfile?.id ||
  ''

  const forecastProfile = resolveTeamForecastProfileFromActive(active)

  const targetGap = resolveTeamTargetGap({
    targetProfile,
    forecastProfile,
  })

  // legacy names
  const benchmarkLevel = targetProfile
  const forecastLevel = forecastProfile

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

    targetPosition,
    targetProfile,
    targetProfileId,
    forecastProfile,
    targetGap,

    // legacy keys
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

      // sync is indication only, not calculation blocker
      sync: sync.isSynced ? [] : sync.blockingReasons,

      heavy: ['futurePerformanceStatsNotReady'],
    },
  }
}
