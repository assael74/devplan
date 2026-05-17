// src/shared/players/insights/insights.stats.js

/*
|--------------------------------------------------------------------------
| Player Insights Engine / Stats
|--------------------------------------------------------------------------
|
| אחריות:
| חישוב סטטיסטיקות עזר מתוך ציוני משחק של שחקן.
|
| הקובץ לא מסווג שחקנים.
| הוא רק מכין נתונים כמו סטיית תקן, מינימום, מקסימום, דקות,
| שערים, בישולים ומשחקים גבוהים/נמוכים.
*/

import {
  roundNumber,
  toNumber,
} from '../scoring/scoring.utils.js'

import {
  PLAYER_INSIGHTS_THRESHOLDS,
} from './insights.config.js'

const getScoreRating = (item = {}) => {
  return toNumber(item?.score?.rating, null)
}

const getScoreMinutes = (item = {}) => {
  return toNumber(item?.score?.context?.timePlayed, 0)
}

const getScoreGoals = (item = {}) => {
  return toNumber(item?.score?.context?.goals, 0)
}

const getScoreAssists = (item = {}) => {
  return toNumber(item?.score?.context?.assists, 0)
}

const getRatedScores = (scores = []) => {
  return scores.filter((item) => {
    return Number.isFinite(getScoreRating(item))
  })
}

const getRatings = (scores = []) => {
  return getRatedScores(scores)
    .map(getScoreRating)
    .filter(Number.isFinite)
}

const getRatingSpread = (scores = []) => {
  const ratings = getRatings(scores)

  if (!ratings.length) {
    return {
      avg: null,
      std: null,
      min: null,
      max: null,
      range: null,
    }
  }

  const avg =
    ratings.reduce((sum, value) => sum + value, 0) / ratings.length

  const variance =
    ratings.reduce((sum, value) => {
      return sum + ((value - avg) ** 2)
    }, 0) / ratings.length

  const std = Math.sqrt(variance)
  const min = Math.min(...ratings)
  const max = Math.max(...ratings)

  return {
    avg: roundNumber(avg, 3),
    std: roundNumber(std, 3),
    min: roundNumber(min, 2),
    max: roundNumber(max, 2),
    range: roundNumber(max - min, 2),
  }
}

const sumBy = ({
  scores,
  getter,
}) => {
  return scores.reduce((sum, item) => {
    return sum + getter(item)
  }, 0)
}

export const buildPlayerInsightStats = (scores = []) => {
  const safeScores = Array.isArray(scores) ? scores : []
  const ratedScores = getRatedScores(safeScores)
  const ratings = getRatings(ratedScores)
  const spread = getRatingSpread(ratedScores)

  const goals = sumBy({
    scores: ratedScores,
    getter: getScoreGoals,
  })

  const assists = sumBy({
    scores: ratedScores,
    getter: getScoreAssists,
  })

  const minutes = sumBy({
    scores: ratedScores,
    getter: getScoreMinutes,
  })

  const highGames = ratings.filter((rating) => {
    return rating >= PLAYER_INSIGHTS_THRESHOLDS.highGameRating
  }).length

  const lowGames = ratings.filter((rating) => {
    return rating < PLAYER_INSIGHTS_THRESHOLDS.lowGameRating
  }).length

  return {
    ...spread,

    ratedGames: ratedScores.length,
    minutes,

    goals,
    assists,
    involvement: goals + assists,

    highGames,
    lowGames,
  }
}
