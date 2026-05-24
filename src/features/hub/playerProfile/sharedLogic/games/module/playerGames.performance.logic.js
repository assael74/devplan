// playerProfile/sharedLogic/games/module/playerGames.performance.logic.js

import {
  formatLtr,
} from '../../../../../../shared/format/index.js'

const emptyArray = []

export const formatPlayerGamePerfLtr = formatLtr

export const toPlayerGamePerfNumber = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  const n = Number(value)

  return Number.isFinite(n) ? n : fallback
}

export const asPlayerGamePerfText = value => {
  return value == null ? '' : String(value).trim()
}

export const getPlayerGameId = game => {
  const source = game?.game || game?.rawGame || game || {}

  return asPlayerGamePerfText(
    game?.gameId ||
      game?.id ||
      game?._id ||
      source?.id ||
      source?.gameId ||
      ''
  )
}

export const formatPlayerGameRating = value => {
  const n = toPlayerGamePerfNumber(value, null)

  if (!Number.isFinite(n)) return '—'

  return formatPlayerGamePerfLtr(n.toFixed(1))
}

export const formatPlayerGameSigned = value => {
  const n = toPlayerGamePerfNumber(value, null)

  if (!Number.isFinite(n)) return '—'
  if (n > 0) return formatPlayerGamePerfLtr(`+${n.toFixed(2)}`)

  return formatPlayerGamePerfLtr(n.toFixed(2))
}

export const getPlayerGameRatingTone = value => {
  const n = toPlayerGamePerfNumber(value, null)

  if (!Number.isFinite(n)) return 'neutral'
  if (n >= 6.5) return 'success'
  if (n >= 6) return 'primary'
  if (n >= 5.7) return 'warning'

  return 'danger'
}

export const getPlayerGameImpactTone = value => {
  const n = toPlayerGamePerfNumber(value, null)

  if (!Number.isFinite(n)) return 'neutral'
  if (n >= 0) return 'success'
  if (n >= -0.5) return 'warning'

  return 'danger'
}

export const getPlayerScoringRows = scoring => {
  return Array.isArray(scoring?.rows)
    ? scoring.rows
    : emptyArray
}

export const getPlayerScoringByGameId = scoring => {
  return scoring?.byGameId || {}
}

export const getPlayerGameScore = ({ game, scoring }) => {
  const gameId = getPlayerGameId(game)
  const byGameId = getPlayerScoringByGameId(scoring)

  return gameId
    ? byGameId[gameId] || null
    : null
}

export const buildPlayerGamePerformanceModel = ({ game, scoring } = {}) => {
  const scoreRow = getPlayerGameScore({
    game,
    scoring,
  })

  const rating = toPlayerGamePerfNumber(
    scoreRow?.ratingRaw ??
      scoreRow?.rating,
    null
  )

  const matchImpact = toPlayerGamePerfNumber(
    scoreRow?.impactDelta,
    null
  )

  const cumulativeImpact = toPlayerGamePerfNumber(
    scoreRow?.cumulativeImpact ??
      scoreRow?.tva,
    null
  )

  const minutes = toPlayerGamePerfNumber(
    scoreRow?.minutes ??
      game?.timePlayed,
    0
  )

  const goals = toPlayerGamePerfNumber(
    scoreRow?.goals ??
      game?.goals,
    0
  )

  const assists = toPlayerGamePerfNumber(
    scoreRow?.assists ??
      game?.assists,
    0
  )

  return {
    scoreRow,

    rating,
    matchImpact,
    cumulativeImpact,

    minutes,
    goals,
    assists,

    ratingText: formatPlayerGameRating(rating),
    matchImpactText: formatPlayerGameSigned(matchImpact),
    cumulativeImpactText: formatPlayerGameSigned(cumulativeImpact),

    ratingTone: getPlayerGameRatingTone(rating),
    matchImpactTone: getPlayerGameImpactTone(matchImpact),
    cumulativeImpactTone: getPlayerGameImpactTone(cumulativeImpact),

    hasRating: Number.isFinite(Number(rating)),
    hasMatchImpact: Number.isFinite(Number(matchImpact)),
    hasCumulativeImpact: Number.isFinite(Number(cumulativeImpact)),

    game,
  }
}
