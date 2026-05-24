// playerProfile/sharedLogic/games/module/playerGames.trend.logic.js

import {
  asPlayerGamePerfText,
  getPlayerGameId,
  getPlayerScoringRows,
  toPlayerGamePerfNumber,
} from './playerGames.performance.logic.js'

const getGameObject = game => {
  return game?.game || game?.rawGame || game || {}
}

const getCurrentGameTime = game => {
  const direct = toPlayerGamePerfNumber(game?.gameTime, null)
  if (Number.isFinite(direct)) return direct

  const source = getGameObject(game)
  const date =
    game?.gameDate ||
    game?.date ||
    source?.gameDate ||
    source?.date ||
    ''

  const time = new Date(date).getTime()

  return Number.isFinite(time) ? time : 0
}

const getPointTime = point => {
  const direct = toPlayerGamePerfNumber(point?.gameTime, null)
  if (Number.isFinite(direct)) return direct

  const time = new Date(point?.gameDate || '').getTime()

  return Number.isFinite(time) ? time : 0
}

const sortPoints = points => {
  return [...points].sort((a, b) => {
    const timeDiff = getPointTime(a) - getPointTime(b)

    if (timeDiff !== 0) return timeDiff

    return asPlayerGamePerfText(a?.gameId)
      .localeCompare(asPlayerGamePerfText(b?.gameId))
  })
}

const filterUntilGame = ({ points, game }) => {
  const currentGameId = getPlayerGameId(game)
  const currentGameTime = getCurrentGameTime(game)

  return points.filter(point => {
    const pointGameId = asPlayerGamePerfText(point?.gameId)

    if (currentGameId && pointGameId === currentGameId) {
      return true
    }

    const pointTime = getPointTime(point)

    return (
      pointTime > 0 &&
      currentGameTime > 0 &&
      pointTime <= currentGameTime
    )
  })
}

const getTrendDirection = points => {
  if (!Array.isArray(points) || points.length < 2) {
    return 'neutral'
  }

  const last = points[points.length - 1]
  const prev = points[points.length - 2]

  const diff =
    toPlayerGamePerfNumber(last?.cumulativeImpact, 0) -
    toPlayerGamePerfNumber(prev?.cumulativeImpact, 0)

  if (diff > 0.05) return 'up'
  if (diff < -0.05) return 'down'

  return 'stable'
}

const getTrendTone = direction => {
  if (direction === 'up') return 'success'
  if (direction === 'down') return 'danger'

  return 'neutral'
}

const buildSummary = points => {
  const first = points[0] || null
  const current = points[points.length - 1] || null

  const currentImpact = toPlayerGamePerfNumber(
    current?.cumulativeImpact,
    0
  )

  const firstImpact = toPlayerGamePerfNumber(
    first?.cumulativeImpact,
    0
  )

  const lastDelta = toPlayerGamePerfNumber(
    current?.impactDelta,
    0
  )

  const avgRating = points.length
    ? points.reduce((sum, point) => {
        return sum + toPlayerGamePerfNumber(point?.ratingRaw ?? point?.rating, 0)
      }, 0) / points.length
    : null

  const direction = getTrendDirection(points)

  return {
    games: points.length,

    currentImpact,
    firstImpact,
    totalChange: currentImpact - firstImpact,
    lastDelta,

    currentRating: current?.ratingRaw ?? current?.rating ?? null,
    avgRating: Number.isFinite(avgRating)
      ? Number(avgRating.toFixed(2))
      : null,

    trendDirection: direction,
    trendTone: getTrendTone(direction),
  }
}

export const buildPlayerGameTrendModel = ({ game, scoring, player } = {}) => {
  const allPoints = getPlayerScoringRows(scoring)
  const points = sortPoints(
    filterUntilGame({
      points: allPoints,
      game,
    })
  )

  const currentPoint = points[points.length - 1] || null

  return {
    playerId:
      asPlayerGamePerfText(player?.playerId) ||
      asPlayerGamePerfText(player?.id) ||
      asPlayerGamePerfText(currentPoint?.playerId),

    playerFullName:
      player?.playerFullName ||
      player?.label ||
      currentPoint?.playerFullName ||
      'שחקן',

    gameId: getPlayerGameId(game),
    gameTime: getCurrentGameTime(game),

    points,
    currentPoint,

    summary: buildSummary(points),

    hasPoints: points.length > 0,
  }
}
