// src/shared/teams/expectations/expectations.context.js

/*
|--------------------------------------------------------------------------
| Team Expectations / Context
|--------------------------------------------------------------------------
|
| אחריות:
| בניית context אחיד לציפיות משחק.
|
| הקובץ הזה לא מגדיר בנצ׳מרקים.
| הוא קורא יעד קבוצה קיים ומכין אותו לחישוב expectation.
*/

import {
  buildTeamTargetsState,
} from '../targets/index.js'

import {
  TEAM_EXPECTATIONS_CONFIG,
} from './expectations.config.js'

import {
  TEAM_EXPECTATIONS_BLOCK_REASON,
  TEAM_EXPECTATIONS_FALLBACK,
  TEAM_EXPECTATIONS_MISSING,
  TEAM_EXPECTATIONS_STATUS,
} from './expectations.status.js'

import {
  asText,
  getGameObject,
  safeDivide,
  toNumber,
} from './expectations.utils.js'

const block = ({
  reason,
  missing = [],
}) => {
  return {
    status: TEAM_EXPECTATIONS_STATUS.BLOCKED,
    isReady: false,
    reason,
    missing,
    fallback: [],
  }
}

const getGameId = (row = {}) => {
  const game = getGameObject(row)

  return (
    row?.gameId ||
    game?.id ||
    game?.gameId ||
    ''
  )
}

const resolveTargets = ({
  team,
  targets,
}) => {
  if (targets?.hasTargets) return targets

  return buildTeamTargetsState(team)
}

const resolveHomeAway = (game = {}) => {
  const source = getGameObject(game)

  if (source?.home === true) {
    return {
      value: 'home',
      missing: [],
      fallback: [],
    }
  }

  if (source?.home === false) {
    return {
      value: 'away',
      missing: [],
      fallback: [],
    }
  }

  const homeAway = asText(source?.homeAway)

  if (homeAway) {
    return {
      value: homeAway,
      missing: [],
      fallback: [],
    }
  }

  return {
    value: TEAM_EXPECTATIONS_CONFIG.defaultHomeAway,
    missing: [TEAM_EXPECTATIONS_MISSING.HOME_AWAY],
    fallback: [TEAM_EXPECTATIONS_FALLBACK.HOME_AWAY_NEUTRAL],
  }
}

const resolveDifficulty = (game = {}) => {
  const source = getGameObject(game)
  const difficulty = asText(source?.difficulty)

  if (difficulty) {
    return {
      value: difficulty,
      missing: [],
      fallback: [],
    }
  }

  return {
    value: TEAM_EXPECTATIONS_CONFIG.defaultDifficulty,
    missing: [TEAM_EXPECTATIONS_MISSING.DIFFICULTY],
    fallback: [TEAM_EXPECTATIONS_FALLBACK.DIFFICULTY_EQUAL],
  }
}

const resolveLeagueNumGames = ({
  team,
  targets,
}) => {
  const explicit =
    toNumber(team?.leagueNumGames, 0) ||
    toNumber(targets?.raw?.leagueNumGames, 0)

  if (explicit) {
    return {
      value: explicit,
      fallback: [],
    }
  }

  return {
    value: TEAM_EXPECTATIONS_CONFIG.defaultLeagueGames,
    fallback: [TEAM_EXPECTATIONS_FALLBACK.LEAGUE_GAMES_DEFAULT],
  }
}

const buildSeasonTargets = ({
  team,
  targets,
}) => {
  const leagueNumGames = resolveLeagueNumGames({
    team,
    targets,
  })

  const points = toNumber(targets?.values?.points, null)
  const successRate = toNumber(targets?.values?.successRate, 0)
  const goalsFor = toNumber(targets?.values?.goalsFor, null)
  const goalsAgainst = toNumber(targets?.values?.goalsAgainst, null)

  return {
    points,
    successRate,
    goalsFor,
    goalsAgainst,

    leagueNumGames: leagueNumGames.value,
    leagueNumGamesFallback: leagueNumGames.fallback,

    pointsPerGame: safeDivide({
      value: points,
      total: leagueNumGames.value,
      fallback: null,
    }),

    goalsForPerGame: safeDivide({
      value: goalsFor,
      total: leagueNumGames.value,
      fallback: null,
    }),

    goalsAgainstPerGame: safeDivide({
      value: goalsAgainst,
      total: leagueNumGames.value,
      fallback: null,
    }),
  }
}

export const buildTeamExpectationContext = ({
  team,
  game,
  targets,
} = {}) => {
  if (!team) {
    return block({
      reason: TEAM_EXPECTATIONS_BLOCK_REASON.MISSING_TEAM,
      missing: ['team'],
    })
  }

  if (!game) {
    return block({
      reason: TEAM_EXPECTATIONS_BLOCK_REASON.MISSING_GAME,
      missing: ['game'],
    })
  }

  const resolvedTargets = resolveTargets({
    team,
    targets,
  })

  if (!resolvedTargets?.hasTargets) {
    return block({
      reason: TEAM_EXPECTATIONS_BLOCK_REASON.MISSING_TARGETS,
      missing: ['targets'],
    })
  }

  const seasonTargets = buildSeasonTargets({
    team,
    targets: resolvedTargets,
  })

  if (!Number.isFinite(seasonTargets.points)) {
    return block({
      reason: TEAM_EXPECTATIONS_BLOCK_REASON.MISSING_TARGET_POINTS,
      missing: ['target_points'],
    })
  }

  if (!seasonTargets.leagueNumGames) {
    return block({
      reason: TEAM_EXPECTATIONS_BLOCK_REASON.MISSING_LEAGUE_GAMES,
      missing: ['league_num_games'],
    })
  }

  const homeAway = resolveHomeAway(game)
  const difficulty = resolveDifficulty(game)

  return {
    status: TEAM_EXPECTATIONS_STATUS.READY,
    isReady: true,
    reason: '',

    gameId: getGameId(game),
    teamId: team?.id || '',

    team,
    game: getGameObject(game),

    targets: resolvedTargets,
    groups: resolvedTargets?.groups || {},

    targetProfileId:
      resolvedTargets?.resolvedProfileId ||
      resolvedTargets?.targetProfileId ||
      '',

    targetLabel: resolvedTargets?.values?.targetLabel || '',

    homeAway: homeAway.value,
    difficulty: difficulty.value,

    seasonTargets,

    missing: [
      ...homeAway.missing,
      ...difficulty.missing,
    ],

    fallback: [
      ...seasonTargets.leagueNumGamesFallback,
      ...homeAway.fallback,
      ...difficulty.fallback,
    ],
  }
}
