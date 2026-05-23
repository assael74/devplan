// src/shared/teams/scoring/scoring.match.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Match Score Entry
|--------------------------------------------------------------------------
|
| אחריות:
| קובץ הכניסה הראשי לחישוב ציון משחק קבוצתי.
|
| חשוב:
| הקובץ לא מחשב expected values.
| מקור האמת לציפיות משחק:
| src/shared/teams/expectations
*/

import {
  TEAM_SCORING_CONFIG,
  TEAM_SCORING_WEIGHTS,
  TEAM_SCORING_SPORTING_DIRECTOR_VALUES,
} from './scoring.config.js'

import {
  TEAM_SCORING_STATUS,
} from './scoring.status.js'

import {
  buildTeamScoringContext,
} from './scoring.context.js'

import {
  resolveTeamScoringReadiness,
} from './scoring.readiness.js'

import {
  clampNumber,
  roundNumber,
  roundScore,
  toNumber,
} from './scoring.utils.js'

const isNumber = value => {
  return Number.isFinite(Number(value))
}

const buildResultDelta = (context = {}) => {
  const expected = toNumber(context.expectedPointsForGame, null)

  if (!Number.isFinite(expected)) return 0

  const delta = context.actualPoints - expected

  return clampNumber({
    value: delta * 0.55,
    min: -1.4,
    max: 1.4,
  })
}

const buildAttackDelta = (context = {}) => {
  const target = context.gameTargets?.targetGoalsForPerGame

  if (!isNumber(target)) return 0

  const delta = context.goalsFor - Number(target)

  return clampNumber({
    value: delta * 0.45,
    min: -1,
    max: 1,
  })
}

const buildDefenseDelta = (context = {}) => {
  const target = context.gameTargets?.targetGoalsAgainstPerGame

  if (!isNumber(target)) return 0

  const delta = Number(target) - context.goalsAgainst

  return clampNumber({
    value: delta * 0.45,
    min: -1,
    max: 1,
  })
}

const buildContextDelta = (context = {}) => {
  const {
    actualPoints,
    expectedPointsForGame,
    difficulty,
    homeAway,
  } = context

  if (!isNumber(expectedPointsForGame)) return 0

  let value = 0

  if (difficulty === 'hard' && actualPoints >= 1) value += 0.35
  if (difficulty === 'hard' && actualPoints === 0) value += 0.1

  if (difficulty === 'easy' && actualPoints < 3) value -= 0.35
  if (homeAway === 'home' && actualPoints < expectedPointsForGame) value -= 0.15
  if (homeAway === 'away' && actualPoints >= expectedPointsForGame) value += 0.15

  return clampNumber({
    value,
    min: -0.7,
    max: 0.7,
  })
}

const buildSportingDirectorDelta = (assessment) => {
  if (assessment === undefined || assessment === null || assessment === '') {
    return 0
  }

  const numeric = toNumber(assessment, null)

  if (Number.isFinite(numeric)) {
    return clampNumber({
      value: numeric - TEAM_SCORING_CONFIG.baseRating,
      min: -1,
      max: 1,
    })
  }

  return (
    TEAM_SCORING_SPORTING_DIRECTOR_VALUES[assessment] ||
    0
  )
}

const buildDeltas = ({
  context,
  sportingDirectorAssessment,
}) => {
  return {
    result: roundNumber(buildResultDelta(context)),
    attack: roundNumber(buildAttackDelta(context)),
    defense: roundNumber(buildDefenseDelta(context)),
    context: roundNumber(buildContextDelta(context)),
    sportingDirector: roundNumber(
      buildSportingDirectorDelta(sportingDirectorAssessment)
    ),
  }
}

const buildWeightedDelta = (deltas = {}) => {
  const value =
    (deltas.result * TEAM_SCORING_WEIGHTS.result) +
    (deltas.attack * TEAM_SCORING_WEIGHTS.attack) +
    (deltas.defense * TEAM_SCORING_WEIGHTS.defense) +
    (deltas.context * TEAM_SCORING_WEIGHTS.context) +
    (deltas.sportingDirector * TEAM_SCORING_WEIGHTS.sportingDirector)

  return roundNumber(value)
}

const buildFlags = (context = {}) => {
  const expectations = context?.expectations || {}
  const missing = Array.isArray(expectations?.missing)
    ? expectations.missing
    : []

  const fallback = Array.isArray(expectations?.fallback)
    ? expectations.fallback
    : []

  return {
    missingExpectedGoalsFor:
      !isNumber(context?.gameTargets?.targetGoalsForPerGame),

    missingExpectedGoalsAgainst:
      !isNumber(context?.gameTargets?.targetGoalsAgainstPerGame),

    hasExpectationFallbacks: fallback.length > 0,
    hasExpectationMissing: missing.length > 0,

    missing,
    fallback,
  }
}

export const buildTeamMatchScore = ({
  team,
  game,
  sportingDirectorAssessment,
} = {}) => {
  const readiness = resolveTeamScoringReadiness({
    team,
    game,
  })

  if (readiness.status !== TEAM_SCORING_STATUS.READY) {
    return {
      ...readiness,
      rating: null,
      baseRating: TEAM_SCORING_CONFIG.baseRating,
    }
  }

  const context = buildTeamScoringContext({
    team,
    game,
    readiness,
  })

  const deltas = buildDeltas({
    context,
    sportingDirectorAssessment,
  })

  const weightedDelta = buildWeightedDelta(deltas)

  const rating = clampNumber({
    value: TEAM_SCORING_CONFIG.baseRating + weightedDelta,
    min: TEAM_SCORING_CONFIG.minRating,
    max: TEAM_SCORING_CONFIG.maxRating,
  })

  return {
    status: TEAM_SCORING_STATUS.READY,
    isReady: true,

    rating: roundScore(rating),
    ratingRaw: roundNumber(rating, 3),
    baseRating: TEAM_SCORING_CONFIG.baseRating,

    weightedDelta,
    deltas,
    flags: buildFlags(context),

    context,
    expectations: context.expectations,

    targets: readiness.targets,

    reliability: {
      level: 'single_game',
      label: 'משחק בודד',
    },
  }
}
