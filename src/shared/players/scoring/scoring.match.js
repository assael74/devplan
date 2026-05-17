// src/shared/players/scoring/scoring.match.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / 5. Match Score Entry
|--------------------------------------------------------------------------
|
| אחריות:
| קובץ הכניסה הראשי לחישוב ציון משחק לשחקן.
|
| סדר במנוע:
| 5 מתוך 5.
|
| תפקיד:
| מתזמר את כל שלבי החישוב:
| 1. readiness
| 2. context
| 3. personal delta
| 4. team impact delta
| 5. target pace delta
| 6. coach delta
| 7. weighted delta
| 8. final rating
|
| Public Entry:
| buildPlayerMatchScore()
|
| משמש את:
| - playerProfile/sharedLogic
| - teamProfile/sharedLogic
| - future rankings / reports / insights
*/

import {
  PLAYER_SCORING_CONFIG,
  PLAYER_SCORING_WEIGHTS,
  PLAYER_SCORING_POSITION_WEIGHTS,
  PLAYER_SCORING_OPPONENT_MODIFIERS,
} from './scoring.config.js'

import {
  PLAYER_SCORING_STATUS,
} from './scoring.status.js'

import {
  buildScoringContext,
} from './scoring.context.js'

import {
  resolveScoringReadiness,
} from './scoring.readiness.js'

import {
  clampNumber,
  roundNumber,
  roundScore,
  safeDivide,
} from './scoring.utils.js'

const getPositionWeights = (positionLayer) => {
  return (
    PLAYER_SCORING_POSITION_WEIGHTS[positionLayer] ||
    PLAYER_SCORING_POSITION_WEIGHTS.midfield
  )
}

const getOpponentModifier = (opponentLevel) => {
  return PLAYER_SCORING_OPPONENT_MODIFIERS[opponentLevel] || 1
}

const buildPersonalDelta = (context = {}) => {
  const {
    goals,
    assists,
    positionLayer,
  } = context

  const goalWeight = positionLayer === 'defense'
    ? 1.25
    : 1

  const assistWeight = positionLayer === 'defense'
    ? 0.9
    : 0.7

  const outputValue =
    (goals * goalWeight) +
    (assists * assistWeight)

  return clampNumber({
    value: outputValue * 0.85,
    min: -0.8,
    max: 2.2,
  })
}



const buildTargetPaceDelta = (context = {}) => {
  const {
    goals,
    assists,
    timePlayed,
    gameMinutes,
    attackTargets,
  } = context

  const goalsTarget = safeDivide({
    value: attackTargets?.goalsPerGameTarget,
    total: gameMinutes,
  }) * timePlayed

  const assistsTarget = safeDivide({
    value: attackTargets?.assistsPerGameTarget,
    total: gameMinutes,
  }) * timePlayed

  const actualValue =
    goals +
    (assists * 0.7)

  const targetValue =
    goalsTarget +
    (assistsTarget * 0.7)

  if (targetValue <= 0 && actualValue <= 0) return 0

  const delta = actualValue - targetValue

  return clampNumber({
    value: delta * 0.75,
    min: -0.7,
    max: 1.2,
  })
}



const buildTeamImpactDelta = (context = {}) => {
  const {
    teamGoalsFor,
    teamGoalsAgainst,
    seasonTargets,
    gameMinutes,
    timePlayed,
    positionLayer,
  } = context

  const positionWeights = getPositionWeights(positionLayer)

  const targetGoalsForPerGame = safeDivide({
    value: seasonTargets?.goalsFor,
    total: seasonTargets?.leagueNumGames || 0,
  })

  const targetGoalsAgainstPerGame = safeDivide({
    value: seasonTargets?.goalsAgainst,
    total: seasonTargets?.leagueNumGames || 0,
  })

  const minutesShare = safeDivide({
    value: timePlayed,
    total: gameMinutes,
  })

  const attackImpact =
    targetGoalsForPerGame > 0
      ? (teamGoalsFor - targetGoalsForPerGame) * minutesShare
      : 0

  const defenseImpact =
    targetGoalsAgainstPerGame > 0
      ? (targetGoalsAgainstPerGame - teamGoalsAgainst) * minutesShare
      : 0

  const weightedImpact =
    (attackImpact * positionWeights.attack) +
    (defenseImpact * positionWeights.defense)

  return clampNumber({
    value: weightedImpact * 0.35,
    min: -1,
    max: 1,
  })
}

const buildCoachDelta = (coachAssessment) => {
  if (!coachAssessment) return 0

  if (coachAssessment === 'positive') return 0.4
  if (coachAssessment === 'negative') return -0.4

  return 0
}

const buildDeltas = ({
  context,
  coachAssessment,
}) => {
  const opponentModifier = getOpponentModifier(context.opponentLevel)

  const personal = buildPersonalDelta(context) * opponentModifier
  const targetPace = buildTargetPaceDelta(context) * opponentModifier
  const teamImpact = buildTeamImpactDelta(context) * opponentModifier
  const coach = buildCoachDelta(coachAssessment)

  return {
    personal: roundNumber(personal),
    teamImpact: roundNumber(teamImpact),
    targetPace: roundNumber(targetPace),
    coach: roundNumber(coach),
  }
}

const buildWeightedDelta = (deltas = {}) => {
  const value =
    (deltas.personal * PLAYER_SCORING_WEIGHTS.personal) +
    (deltas.teamImpact * PLAYER_SCORING_WEIGHTS.teamImpact) +
    (deltas.targetPace * PLAYER_SCORING_WEIGHTS.targetPace) +
    (deltas.coach * PLAYER_SCORING_WEIGHTS.coach)

  return roundNumber(value)
}

export const buildPlayerMatchScore = ({
  player,
  team,
  game,
  playerGame,
  calculationMode,
  coachAssessment,
} = {}) => {
  const readiness = resolveScoringReadiness({
    player,
    team,
    playerGame,
    calculationMode,
  })

  if (readiness.status !== PLAYER_SCORING_STATUS.READY) {
    return {
      ...readiness,
      rating: null,
      baseRating: PLAYER_SCORING_CONFIG.baseRating,
    }
  }

  const context = buildScoringContext({
    player,
    team,
    game,
    playerGame,
    calculationMode,
    readiness,
  })

  const deltas = buildDeltas({
    context,
    coachAssessment,
  })

  const weightedDelta = buildWeightedDelta(deltas)

  const rating = clampNumber({
    value: PLAYER_SCORING_CONFIG.baseRating + weightedDelta,
    min: PLAYER_SCORING_CONFIG.minRating,
    max: PLAYER_SCORING_CONFIG.maxRating,
  })

  return {
    status: PLAYER_SCORING_STATUS.READY,
    isReady: true,

    rating: roundScore(rating),
    baseRating: PLAYER_SCORING_CONFIG.baseRating,

    weightedDelta,
    deltas,

    context,

    targets: readiness.targets,

    reliability: {
      level: context.hasLowMinutesSample ? 'low' : 'high',
      label: context.hasLowMinutesSample
        ? 'מדגם דקות נמוך'
        : 'אמינות גבוהה',
    },
  }
}
