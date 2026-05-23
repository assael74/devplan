// src/shared/teams/expectations/expectations.game.js

/*
|--------------------------------------------------------------------------
| Team Expectations / Game
|--------------------------------------------------------------------------
|
| אחריות:
| בניית ציפייה מותאמת למשחק אחד.
|
| חשוב:
| הקובץ לא מגדיר בנצ׳מרקים.
| הוא קורא את הערכים מתוך targets שמבוססים על:
| src/shared/teams/targets/teamTargetProfiles.js
*/

import {
  TEAM_EXPECTATIONS_CONFIG,
} from './expectations.config.js'

import {
  TEAM_EXPECTATIONS_FALLBACK,
  TEAM_EXPECTATIONS_MISSING,
  TEAM_EXPECTATIONS_STATUS,
} from './expectations.status.js'

import {
  buildTeamExpectationContext,
} from './expectations.context.js'

import {
  clampNumber,
  roundNumber,
  toNumber,
} from './expectations.utils.js'

const getPositiveRate = (value) => {
  const n = toNumber(value, 0)

  return n > 0 ? n : 0
}

const getHomeAwayRate = ({
  context,
  fallback,
}) => {
  if (context.homeAway === 'neutral') {
    fallback.push(TEAM_EXPECTATIONS_FALLBACK.HOME_AWAY_RATE_SEASON)
    return context.seasonTargets.successRate
  }

  const rate = getPositiveRate(
    context?.groups?.homeAway?.[context.homeAway]?.greenMin
  )

  if (rate) return rate

  fallback.push(TEAM_EXPECTATIONS_FALLBACK.HOME_AWAY_RATE_SEASON)

  return context.seasonTargets.successRate
}

const getDifficultyRate = ({
  context,
  fallback,
}) => {
  const rate = getPositiveRate(
    context?.groups?.difficulty?.[context.difficulty]?.targetRate
  )

  if (rate) return rate

  fallback.push(TEAM_EXPECTATIONS_FALLBACK.DIFFICULTY_RATE_SEASON)

  return context.seasonTargets.successRate
}

const getFinalRate = ({
  seasonRate,
  homeAwayRate,
  difficultyRate,
}) => {
  const values = [
    seasonRate,
    homeAwayRate,
    difficultyRate,
  ].filter((value) => value > 0)

  if (!values.length) return 0

  const sum = values.reduce((acc, value) => {
    return acc + value
  }, 0)

  return sum / values.length
}

const resolveSpecificGoalExpectation = ({
  context,
  key,
}) => {
  const difficultyValue =
    context?.groups?.difficulty?.[context.difficulty]?.[key]

  if (Number.isFinite(toNumber(difficultyValue, null))) {
    return toNumber(difficultyValue, null)
  }

  const homeAwayValue =
    context?.groups?.homeAway?.[context.homeAway]?.[key]

  if (Number.isFinite(toNumber(homeAwayValue, null))) {
    return toNumber(homeAwayValue, null)
  }

  return null
}

const getExpectedGoalsFor = ({
  context,
  fallback,
  missing,
}) => {
  const specific = resolveSpecificGoalExpectation({
    context,
    key: 'goalsFor',
  })

  if (Number.isFinite(specific)) return specific

  const base = context?.seasonTargets?.goalsForPerGame

  if (!Number.isFinite(base)) {
    missing.push(TEAM_EXPECTATIONS_MISSING.GOALS_FOR_TARGET)
    return null
  }

  fallback.push(TEAM_EXPECTATIONS_FALLBACK.GOALS_FOR_SEASON_AVG)

  return base
}

const getExpectedGoalsAgainst = ({
  context,
  fallback,
  missing,
}) => {
  const specific = resolveSpecificGoalExpectation({
    context,
    key: 'goalsAgainst',
  })

  if (Number.isFinite(specific)) return specific

  const base = context?.seasonTargets?.goalsAgainstPerGame

  if (!Number.isFinite(base)) {
    missing.push(TEAM_EXPECTATIONS_MISSING.GOALS_AGAINST_TARGET)
    return null
  }

  fallback.push(TEAM_EXPECTATIONS_FALLBACK.GOALS_AGAINST_SEASON_AVG)

  return base
}

const getExpectationStatus = ({
  missing,
}) => {
  return missing.length
    ? TEAM_EXPECTATIONS_STATUS.PARTIAL
    : TEAM_EXPECTATIONS_STATUS.READY
}

export const buildTeamGameExpectations = ({
  team,
  game,
  targets,
} = {}) => {
  const context = buildTeamExpectationContext({
    team,
    game,
    targets,
  })

  if (context.status === TEAM_EXPECTATIONS_STATUS.BLOCKED) {
    return {
      ...context,
      expectedPoints: null,
      expectedGoalsFor: null,
      expectedGoalsAgainst: null,
    }
  }

  const missing = [...context.missing]
  const fallback = [...context.fallback]

  const seasonRate = toNumber(context.seasonTargets.successRate, 0)

  const homeAwayRate = getHomeAwayRate({
    context,
    fallback,
  })

  const difficultyRate = getDifficultyRate({
    context,
    fallback,
  })

  const finalRate = getFinalRate({
    seasonRate,
    homeAwayRate,
    difficultyRate,
  })

  const expectedPoints = clampNumber({
    value: (finalRate / 100) * 3,
    min: TEAM_EXPECTATIONS_CONFIG.minExpectedPoints,
    max: TEAM_EXPECTATIONS_CONFIG.maxExpectedPoints,
  })

  const goalsFor = getExpectedGoalsFor({
    context,
    fallback,
    missing,
  })

  const goalsAgainst = getExpectedGoalsAgainst({
    context,
    fallback,
    missing,
  })

  const expectedGoalsFor = Number.isFinite(goalsFor)
    ? clampNumber({
        value: goalsFor,
        min: TEAM_EXPECTATIONS_CONFIG.minGoalExpectation,
        max: TEAM_EXPECTATIONS_CONFIG.maxGoalExpectation,
      })
    : null

  const expectedGoalsAgainst = Number.isFinite(goalsAgainst)
    ? clampNumber({
        value: goalsAgainst,
        min: TEAM_EXPECTATIONS_CONFIG.minGoalExpectation,
        max: TEAM_EXPECTATIONS_CONFIG.maxGoalExpectation,
      })
    : null

  const status = getExpectationStatus({
    missing,
  })

  return {
    status,
    isReady: true,
    reason: '',

    gameId: context.gameId,
    teamId: context.teamId,

    targetProfileId: context.targetProfileId,
    targetLabel: context.targetLabel,

    homeAway: context.homeAway,
    difficulty: context.difficulty,

    expectedPoints: roundNumber(expectedPoints, 2),

    expectedGoalsFor:
      expectedGoalsFor === null
        ? null
        : roundNumber(expectedGoalsFor, 2),

    expectedGoalsAgainst:
      expectedGoalsAgainst === null
        ? null
        : roundNumber(expectedGoalsAgainst, 2),

    base: {
      pointsPerGame:
        context.seasonTargets.pointsPerGame === null
          ? null
          : roundNumber(context.seasonTargets.pointsPerGame, 2),

      goalsForPerGame:
        context.seasonTargets.goalsForPerGame === null
          ? null
          : roundNumber(context.seasonTargets.goalsForPerGame, 2),

      goalsAgainstPerGame:
        context.seasonTargets.goalsAgainstPerGame === null
          ? null
          : roundNumber(context.seasonTargets.goalsAgainstPerGame, 2),
    },

    rates: {
      seasonRate: roundNumber(seasonRate, 2),
      homeAwayRate: roundNumber(homeAwayRate, 2),
      difficultyRate: roundNumber(difficultyRate, 2),
      finalRate: roundNumber(finalRate, 2),
    },

    missing,
    fallback,

    context,
  }
}
