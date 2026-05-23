// src/shared/teams/scoring/scoring.season.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Season Score
|--------------------------------------------------------------------------
|
| אחריות:
| חישוב ציון תקופתי / עונתי לקבוצה מתוך ציוני משחק קיימים.
|
| מחשב:
| - ממוצע rating
| - TVA קבוצתי
| - פער נקודות מצטבר מול ציפיות המשחק
| - שערי זכות מול ציפייה
| - שערי חובה מול ציפייה
| - אמינות לפי כמות משחקים
*/

import {
  TEAM_SCORING_CONFIG,
} from './scoring.config.js'

import {
  TEAM_SCORING_STATUS,
} from './scoring.status.js'

import {
  roundNumber,
  roundScore,
  toNumber,
} from './scoring.utils.js'

const emptySeasonScore = ({
  reason = '',
} = {}) => {
  return {
    status: TEAM_SCORING_STATUS.NOT_RATED,

    teamRating: null,
    teamRatingRaw: null,

    tva: 0,
    pointsPaceDelta: 0,

    ratedGames: 0,

    actualPoints: 0,
    expectedPoints: 0,

    actualGoalsFor: 0,
    expectedGoalsFor: 0,

    actualGoalsAgainst: 0,
    expectedGoalsAgainst: 0,

    goalsForDelta: 0,
    goalsAgainstDelta: 0,

    reason,

    reliability: {
      level: 'none',
      label: 'לא מדורג',
    },
  }
}

const isRatedScore = (item = {}) => {
  const rating = toNumber(item?.score?.rating, null)

  return (
    item?.score?.status === TEAM_SCORING_STATUS.READY &&
    Number.isFinite(rating)
  )
}

const addIfNumber = ({
  total,
  value,
}) => {
  const n = toNumber(value, null)

  return Number.isFinite(n) ? total + n : total
}

const getReliability = (games) => {
  const count = toNumber(games, 0)

  if (count <= 0) {
    return {
      level: 'none',
      label: 'לא מדורג',
    }
  }

  if (count < TEAM_SCORING_CONFIG.reliableGames) {
    return {
      level: 'low',
      label: 'מדגם משחקים נמוך',
    }
  }

  return {
    level: 'high',
    label: 'אמינות גבוהה',
  }
}

export const buildTeamSeasonScore = ({
  scores,
} = {}) => {
  const base = Array.isArray(scores) ? scores : []
  const ratedScores = base.filter(isRatedScore)

  if (!ratedScores.length) {
    return emptySeasonScore({
      reason: 'no_rated_scores',
    })
  }

  let ratingSum = 0
  let tva = 0

  const totals = ratedScores.reduce((acc, item) => {
    const score = item?.score || {}
    const context = score?.context || {}

    const rating = toNumber(score?.rating, 0)

    ratingSum += rating
    tva += rating - TEAM_SCORING_CONFIG.baseRating

    return {
      actualPoints: addIfNumber({
        total: acc.actualPoints,
        value: context?.actualPoints,
      }),

      expectedPoints: addIfNumber({
        total: acc.expectedPoints,
        value: context?.expectedPointsForGame,
      }),

      actualGoalsFor: addIfNumber({
        total: acc.actualGoalsFor,
        value: context?.goalsFor,
      }),

      expectedGoalsFor: addIfNumber({
        total: acc.expectedGoalsFor,
        value: context?.gameTargets?.targetGoalsForPerGame,
      }),

      actualGoalsAgainst: addIfNumber({
        total: acc.actualGoalsAgainst,
        value: context?.goalsAgainst,
      }),

      expectedGoalsAgainst: addIfNumber({
        total: acc.expectedGoalsAgainst,
        value: context?.gameTargets?.targetGoalsAgainstPerGame,
      }),
    }
  }, {
    actualPoints: 0,
    expectedPoints: 0,
    actualGoalsFor: 0,
    expectedGoalsFor: 0,
    actualGoalsAgainst: 0,
    expectedGoalsAgainst: 0,
  })

  const ratedGames = ratedScores.length
  const teamRatingRaw = ratingSum / ratedGames

  const pointsPaceDelta =
    totals.actualPoints - totals.expectedPoints

  const goalsForDelta =
    totals.actualGoalsFor - totals.expectedGoalsFor

  const goalsAgainstDelta =
    totals.expectedGoalsAgainst - totals.actualGoalsAgainst

  const reliability = getReliability(ratedGames)

  return {
    status: TEAM_SCORING_STATUS.READY,

    teamRatingRaw: roundNumber(teamRatingRaw, 3),
    teamRating: roundScore(teamRatingRaw),

    tva: roundNumber(tva, 2),
    pointsPaceDelta: roundNumber(pointsPaceDelta, 2),

    ratedGames,

    actualPoints: roundNumber(totals.actualPoints, 2),
    expectedPoints: roundNumber(totals.expectedPoints, 2),

    actualGoalsFor: roundNumber(totals.actualGoalsFor, 2),
    expectedGoalsFor: roundNumber(totals.expectedGoalsFor, 2),

    actualGoalsAgainst: roundNumber(totals.actualGoalsAgainst, 2),
    expectedGoalsAgainst: roundNumber(totals.expectedGoalsAgainst, 2),

    goalsForDelta: roundNumber(goalsForDelta, 2),
    goalsAgainstDelta: roundNumber(goalsAgainstDelta, 2),

    reliability,

    scores: ratedScores,
  }
}
