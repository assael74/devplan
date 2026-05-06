// shared/games/insights/player/sections/recent/recent.metrics.js

import {
  pickNumber,
} from '../../../team/common/index.js'

function getRecentSource(insights = {}) {
  return insights?.games?.recent || insights?.summary?.recent || {}
}

export function buildPlayerRecentMetrics(insights = {}) {
  const source = getRecentSource(insights)

  return {
    source,

    sampleSize: pickNumber(source, ['sampleSize'], 0),
    minutes: pickNumber(source, ['minutes'], 0),
    goals: pickNumber(source, ['goals'], 0),
    assists: pickNumber(source, ['assists'], 0),
    goalContributions: pickNumber(source, ['goalContributions'], 0),
    goalsPerGame: pickNumber(source, ['goalsPerGame'], 0),
    assistsPerGame: pickNumber(source, ['assistsPerGame'], 0),
    contributionsPerGame: pickNumber(source, ['contributionsPerGame'], 0),

    hasAnyData: pickNumber(source, ['sampleSize'], 0) > 0,
    hasEnoughData: pickNumber(source, ['sampleSize'], 0) >= 3,
    hasOutput:
      pickNumber(source, ['goals'], 0) > 0 ||
      pickNumber(source, ['assists'], 0) > 0,
  }
}
