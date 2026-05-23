// teamProfile/sharedLogic/games/insightsLogic/viewModel/teamScoring.model.js

/*
|--------------------------------------------------------------------------
| Team Games Drawer / Team Scoring Model
|--------------------------------------------------------------------------
|
| אחריות:
| חיבור מנוע הסקורינג הקבוצתי הגלובלי למודל המקומי של מגירת
| תובנות משחקי קבוצה.
*/

import {
  buildScopedTeamScores,
  buildTeamSeasonScore,
} from '../../../../../../../shared/teams/scoring/index.js'

const emptyArray = []

const getScope = ({ calculation }) => {
  return calculation?.scope || null
}

const toFixedNumber = (value, digits = 2) => {
  const n = Number(value)

  if (!Number.isFinite(n)) return 0

  return Number(n.toFixed(digits))
}

const getTrendRows = ({ scopedScores }) => {
  const scores = Array.isArray(scopedScores?.flatScores)
    ? scopedScores.flatScores
    : emptyArray

  return scores.map((item) => {
    const score = item?.score || {}
    const context = score?.context || {}
    const gameTargets = context?.gameTargets || {}

    const actualPoints = Number(context?.actualPoints ?? 0)
    const expectedPoints = Number(context?.expectedPointsForGame ?? 0)

    return {
      gameId: item?.gameId || context?.gameId || '',
      gameDate: item?.gameDate || '',

      rating: score?.rating ?? null,
      ratingRaw: score?.ratingRaw ?? null,

      tva: score?.rating
        ? toFixedNumber(score.rating - score.baseRating)
        : 0,

      actualPoints,
      expectedPoints,
      pointsDelta: toFixedNumber(actualPoints - expectedPoints),

      homeAway: context?.homeAway || '',
      difficulty: context?.difficulty || 'equal',

      goalsFor: context?.goalsFor ?? 0,
      goalsAgainst: context?.goalsAgainst ?? 0,

      expectedGoalsFor: gameTargets?.targetGoalsForPerGame ?? null,
      expectedGoalsAgainst: gameTargets?.targetGoalsAgainstPerGame ?? null,

      goalsForDelta: Number.isFinite(Number(gameTargets?.targetGoalsForPerGame))
        ? toFixedNumber(context.goalsFor - gameTargets.targetGoalsForPerGame)
        : null,

      goalsAgainstDelta: Number.isFinite(Number(gameTargets?.targetGoalsAgainstPerGame))
        ? toFixedNumber(gameTargets.targetGoalsAgainstPerGame - context.goalsAgainst)
        : null,

      deltas: score?.deltas || {},
      flags: score?.flags || {},

      expectations: score?.expectations || context?.expectations || null,

      status: score?.status || '',
      reason: score?.reason || '',
    }
  })
}

const buildSummary = ({ seasonScore }) => {
  if (!seasonScore) return null

  return {
    status: seasonScore.status || '',

    teamRating: seasonScore.teamRating ?? null,
    teamRatingRaw: seasonScore.teamRatingRaw ?? null,

    tva: seasonScore.tva ?? 0,
    pointsPaceDelta: seasonScore.pointsPaceDelta ?? 0,

    ratedGames: seasonScore.ratedGames ?? 0,

    actualPoints: seasonScore.actualPoints ?? 0,
    expectedPoints: seasonScore.expectedPoints ?? 0,

    actualGoalsFor: seasonScore.actualGoalsFor ?? 0,
    expectedGoalsFor: seasonScore.expectedGoalsFor ?? 0,
    goalsForDelta: seasonScore.goalsForDelta ?? 0,

    actualGoalsAgainst: seasonScore.actualGoalsAgainst ?? 0,
    expectedGoalsAgainst: seasonScore.expectedGoalsAgainst ?? 0,
    goalsAgainstDelta: seasonScore.goalsAgainstDelta ?? 0,

    reliability: seasonScore.reliability || null,
  }
}

export const buildTeamGamesScoringModel = ({
  team,
  games,
  calculation,
} = {}) => {
  if (!team || !Array.isArray(games) || !games.length) {
    return null
  }

  const scopedScores = buildScopedTeamScores({
    team,
    games,
    scope: getScope({ calculation }),
  })

  const seasonScore = buildTeamSeasonScore({
    scores: scopedScores.flatScores,
  })

  return {
    summary: buildSummary({
      seasonScore,
    }),

    trend: getTrendRows({
      scopedScores,
    }),

    scopedScores,
    seasonScore,
  }
}
