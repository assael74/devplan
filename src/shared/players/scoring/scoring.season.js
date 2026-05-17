// src/shared/players/scoring/scoring.season.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / Season Score
|--------------------------------------------------------------------------
|
| אחריות:
| חישוב ציון עונתי לשחקן מתוך ציוני משחק קיימים.
|
| סדר במנוע:
| אחרי scopeScores.js.
|
| תפקיד:
| לקבל ציוני משחק של שחקן,
| לחשב ממוצע משוקלל דקות,
| לחשב TVA,
| לחשב אמינות עונתית,
| ולהחזיר מודל עונתי נקי.
*/

import {
  PLAYER_SCORING_CONFIG,
} from './scoring.config.js'

import {
  PLAYER_SCORING_STATUS,
} from './scoring.status.js'

import {
  roundNumber,
  roundScore,
  toNumber,
} from './scoring.utils.js'

const emptySeasonScore = ({
  playerId = '',
  reason = '',
} = {}) => {
  return {
    status: PLAYER_SCORING_STATUS.NOT_RATED,
    playerId,
    seasonRating: null,
    tva: 0,
    ratedGames: 0,
    ratedMinutes: 0,
    reason,
    reliability: {
      level: 'none',
      label: 'לא מדורג',
    },
  }
}

const isRatedScore = (item = {}) => {
  const rating = toNumber(item?.score?.rating, null)
  const timePlayed = toNumber(item?.score?.context?.timePlayed, 0)

  return (
    item?.score?.status === PLAYER_SCORING_STATUS.READY &&
    Number.isFinite(rating) &&
    timePlayed > 0
  )
}

const getReliability = (minutes) => {
  const value = toNumber(minutes, 0)

  if (value < 270) {
    return {
      level: 'none',
      label: 'לא מדורג',
    }
  }

  if (value < 500) {
    return {
      level: 'low',
      label: 'מדגם נמוך',
    }
  }

  if (value < 900) {
    return {
      level: 'basic',
      label: 'אמינות בסיסית',
    }
  }

  if (value < 1500) {
    return {
      level: 'medium',
      label: 'אמינות בינונית',
    }
  }

  return {
    level: 'high',
    label: 'אמינות גבוהה',
  }
}

export const buildPlayerSeasonScore = ({
  playerId,
  scores,
} = {}) => {
  const id = String(playerId || '').trim()
  const base = Array.isArray(scores) ? scores : []

  const playerScores = id
    ? base.filter((item) => {
        return String(item?.playerId || '').trim() === id
      })
    : base

  const ratedScores = playerScores.filter(isRatedScore)

  if (!ratedScores.length) {
    return emptySeasonScore({
      playerId: id,
      reason: 'no_rated_scores',
    })
  }

  let ratingWeightedSum = 0
  let ratedMinutes = 0
  let tva = 0

  ratedScores.forEach((item) => {
    const rating = toNumber(item?.score?.rating, 0)
    const timePlayed = toNumber(item?.score?.context?.timePlayed, 0)
    const gameMinutes = toNumber(item?.score?.context?.gameMinutes, 90)

    ratingWeightedSum += rating * timePlayed
    ratedMinutes += timePlayed

    if (gameMinutes > 0) {
      tva += (
        (rating - PLAYER_SCORING_CONFIG.baseRating) *
        (timePlayed / gameMinutes)
      )
    }
  })

  const seasonRating = ratedMinutes > 0
    ? ratingWeightedSum / ratedMinutes
    : null

  const reliability = getReliability(ratedMinutes)

  return {
    status: PLAYER_SCORING_STATUS.READY,
    playerId: id,

    seasonRatingRaw: roundNumber(seasonRating, 3),
    seasonRating: roundScore(seasonRating),
    tva: roundNumber(tva, 2),

    ratedGames: ratedScores.length,
    ratedMinutes,

    reliability,

    scores: ratedScores,
  }
}
