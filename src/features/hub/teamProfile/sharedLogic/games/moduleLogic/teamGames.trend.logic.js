// teamProfile/sharedLogic/games/moduleLogic/teamGames.trend.logic.js

import {
  asGamePerfText,
  getGamePerfPlayerLabel,
  getGamePerfRows,
  toGamePerfNumber,
} from './teamGames.performance.logic.js'

const emptyArray = []

const getGameObject = game => {
  return game?.game || game || {}
}

const getCurrentGameId = ({ game, gameId, performance }) => {
  const gameObject = getGameObject(game)

  return asGamePerfText(
    gameId ||
      performance?.gameId ||
      game?.gameId ||
      gameObject?.id ||
      gameObject?.gameId ||
      ''
  )
}

const getCurrentGameTime = ({ game, gameTime, performance }) => {
  const directTime = toGamePerfNumber(gameTime, null)

  if (Number.isFinite(directTime)) return directTime

  const fromPerformance = toGamePerfNumber(performance?.gameTime, null)

  if (Number.isFinite(fromPerformance)) return fromPerformance

  const gameObject = getGameObject(game)

  const date =
    gameObject?.gameDate ||
    gameObject?.date ||
    performance?.gameDate ||
    ''

  const time = new Date(date).getTime()

  return Number.isFinite(time) ? time : 0
}

const getTimeline = ({ scoring, playerId }) => {
  const id = asGamePerfText(playerId)

  if (!id) return emptyArray

  const timeline = scoring?.impact?.byPlayerId[id]

  return Array.isArray(timeline)
    ? timeline
    : emptyArray
}

const filterTimelineUntilGame = ({ timeline, gameId, gameTime }) => {
  const currentGameId = asGamePerfText(gameId)
  const currentTime = toGamePerfNumber(gameTime, 0)

  return timeline.filter(point => {
    const pointGameId = asGamePerfText(point?.gameId)

    if (currentGameId && pointGameId === currentGameId) {
      return true
    }

    const pointTime = toGamePerfNumber(point?.gameTime, 0)

    return (
      pointTime > 0 &&
      currentTime > 0 &&
      pointTime <= currentTime
    )
  })
}

const sortTimelinePoints = points => {
  return [...points].sort((a, b) => {
    const timeDiff =
      toGamePerfNumber(a?.gameTime, 0) -
      toGamePerfNumber(b?.gameTime, 0)

    if (timeDiff !== 0) return timeDiff

    return asGamePerfText(a?.gameId)
      .localeCompare(asGamePerfText(b?.gameId))
  })
}

const getGameObjectFromScoring = ({ scoring, gameId }) => {
  return scoring?.byGameId?.[gameId]?.game || {}
}

const getPointGameMeta = ({ point, scoring }) => {
  const gameId = asGamePerfText(point?.gameId)

  const game = getGameObjectFromScoring({
    scoring,
    gameId,
  })

  return {
    rival:
      point?.rival ||
      point?.rivel ||
      game?.rival ||
      game?.rivel ||
      '',

    rivel:
      point?.rivel ||
      point?.rival ||
      game?.rivel ||
      game?.rival ||
      '',

    gameRound:
      point?.gameRound ||
      point?.gameLeagueNum ||
      point?.round ||
      game?.gameRound ||
      game?.gameLeagueNum ||
      game?.round ||
      '',

    gameLeagueNum:
      point?.gameLeagueNum ||
      point?.gameRound ||
      point?.round ||
      game?.gameLeagueNum ||
      game?.gameRound ||
      game?.round ||
      '',

    home:
      point?.home ?? game?.home ?? null,

    gameDate:
      point?.gameDate ||
      game?.gameDate ||
      game?.date ||
      '',
  }
}

const getTrendDirection = points => {
  if (!Array.isArray(points) || points.length < 2) {
    return 'neutral'
  }

  const last = points[points.length - 1]
  const prev = points[points.length - 2]

  const diff =
    toGamePerfNumber(last?.cumulativeImpact, 0) -
    toGamePerfNumber(prev?.cumulativeImpact, 0)

  if (diff > 0.05) return 'up'
  if (diff < -0.05) return 'down'

  return 'stable'
}

const getTrendTone = direction => {
  if (direction === 'up') return 'success'
  if (direction === 'down') return 'danger'
  if (direction === 'stable') return 'neutral'

  return 'neutral'
}

const buildTrendPoint = ({ point, scoring }) => {
  const meta = getPointGameMeta({
    point,
    scoring,
  })

  const rating = toGamePerfNumber(
    point?.ratingRaw ?? point?.rating,
    null
  )

  const impactDelta = toGamePerfNumber(
    point?.impactDelta,
    0
  )

  const cumulativeImpact = toGamePerfNumber(
    point?.cumulativeImpact,
    0
  )

  return {
    gameId: asGamePerfText(point?.gameId),
    gameDate: meta.gameDate,
    gameTime: toGamePerfNumber(point?.gameTime, 0),

    rival: meta.rival,
    rivel: meta.rivel,
    gameRound: meta.gameRound,
    gameLeagueNum: meta.gameLeagueNum,
    home: meta.home,

    playerId: asGamePerfText(point?.playerId),
    playerFullName: point?.playerFullName || '',
    photo: point?.photo || '',

    rating,
    ratingRaw: rating,

    minutes: toGamePerfNumber(point?.minutes, 0),
    goals: toGamePerfNumber(point?.goals, 0),
    assists: toGamePerfNumber(point?.assists, 0),

    impactDelta,
    cumulativeImpact,

    status: point?.status || '',
    reason: point?.reason || '',
    reasonLabel: point?.reasonLabel || '',
  }
}

const buildTrendSummary = points => {
  const first = points[0] || null
  const current = points[points.length - 1] || null

  const currentImpact = toGamePerfNumber(
    current?.cumulativeImpact,
    0
  )

  const firstImpact = toGamePerfNumber(
    first?.cumulativeImpact,
    0
  )

  const totalChange = points.length
    ? toGamePerfNumber(currentImpact - firstImpact, 0)
    : 0

  const lastDelta = toGamePerfNumber(
    current?.impactDelta,
    0
  )

  const avgRating = points.length
    ? points.reduce((sum, point) => {
        return sum + toGamePerfNumber(point?.ratingRaw, 0)
      }, 0) / points.length
    : null

  const direction = getTrendDirection(points)

  return {
    games: points.length,

    currentImpact,
    firstImpact,
    totalChange,
    lastDelta,

    currentRating: current?.ratingRaw ?? null,
    avgRating: Number.isFinite(avgRating)
      ? Number(avgRating.toFixed(2))
      : null,

    trendDirection: direction,
    trendTone: getTrendTone(direction),
  }
}

export const buildPlayerGameTrendModel = ({
  scoring,
  playerId,
  game,
  gameId,
  gameTime,
  performance,
} = {}) => {
  const currentGameId = getCurrentGameId({
    game,
    gameId,
    performance,
  })

  const currentGameTime = getCurrentGameTime({
    game,
    gameTime,
    performance,
  })

  const timeline = getTimeline({
    scoring,
    playerId,
  })

  const points = sortTimelinePoints(
    filterTimelineUntilGame({
      timeline,
      gameId: currentGameId,
      gameTime: currentGameTime,
    })
  ).map(point => {
    return buildTrendPoint({ point, scoring })
  })

  const currentPoint = points[points.length - 1] || null

  return {
    playerId: asGamePerfText(playerId),
    playerFullName: currentPoint?.playerFullName || '',
    photo: currentPoint?.photo || '',

    gameId: currentGameId,
    gameTime: currentGameTime,

    points,
    currentPoint,
    summary: buildTrendSummary(points),

    hasPoints: points.length > 0,
  }
}

export const buildGamePlayersTrendOptions = ({ scoring, performance, game } = {}) => {
  const rows = getGamePerfRows(performance)

  const gameId = getCurrentGameId({
    game,
    performance,
  })

  const gameTime = getCurrentGameTime({
    game,
    performance,
  })

  return rows.map(row => {
    const trend = buildPlayerGameTrendModel({
      scoring,
      playerId: row?.playerId,
      game,
      gameId,
      gameTime,
      performance,
    })

    return {
      playerId: asGamePerfText(row?.playerId),
      playerFullName: getGamePerfPlayerLabel(row),
      photo: row?.photo || row?.player?.photo || '',

      rating: row?.ratingRaw ?? null,
      minutes: toGamePerfNumber(row?.minutes, 0),

      currentImpact: trend?.summary?.currentImpact ?? 0,
      trendDirection: trend?.summary?.trendDirection || 'neutral',
      trendTone: trend?.summary?.trendTone || 'neutral',

      trend,
      row,
    }
  })
}
