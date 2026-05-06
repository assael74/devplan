// shared/games/insights/team/sections/homeAway/homeAway.metrics.js

import {
  calcPercent,
  pickNumber,
  roundNumber,
} from '../../common/index.js'

import {
  getHomeAwayBucket,
  resolveHomeAwaySource,
} from './homeAway.sources.js'

function normalizeBucket(bucket) {
  if (!bucket) {
    return {
      games: 0,
      points: 0,
      maxPoints: 0,
      pointsRate: 0,
      remainingGames: 0,
      projectedPoints: 0,
    }
  }

  const games = pickNumber(
    bucket,
    ['games', 'gamesCount', 'count', 'playedGames', 'playedGamesCount', 'total'],
    0
  )

  const points = pickNumber(bucket, ['points', 'value'], 0)

  const maxPoints = pickNumber(
    bucket,
    ['maxPoints', 'possiblePoints', 'totalMaxPoints'],
    games * 3
  )

  const pointsRate = pickNumber(
    bucket,
    ['pointsRate', 'rate', 'percent', 'pct'],
    calcPercent(points, maxPoints)
  )

  const remainingGames = pickNumber(
    bucket,
    ['remainingGames', 'remainingGamesCount', 'upcomingGames', 'upcomingCount'],
    0
  )

  const projectedPoints = pickNumber(
    bucket,
    ['projectedPoints', 'projection', 'projectedTotalPoints'],
    points
  )

  return {
    games,
    points,
    maxPoints,
    pointsRate,
    remainingGames,
    projectedPoints,
  }
}

export function buildHomeAwayMetrics(insights = {}) {
  const source = resolveHomeAwaySource(insights)

  const home = normalizeBucket(getHomeAwayBucket(source, 'home'))
  const away = normalizeBucket(getHomeAwayBucket(source, 'away'))

  const totalGames = home.games + away.games
  const gap = roundNumber(home.pointsRate - away.pointsRate, 1)
  const absGap = Math.abs(gap)

  const overallRate = pickNumber(
    insights?.active,
    ['pointsRate', 'rate', 'percent', 'pct'],
    null
  )

  return {
    source,
    home,
    away,
    totalGames,
    gap,
    absGap,
    overallRate,

    hasHomeData: home.games > 0,
    hasAwayData: away.games > 0,
    hasAnyData: home.games > 0 || away.games > 0,
  }
}
