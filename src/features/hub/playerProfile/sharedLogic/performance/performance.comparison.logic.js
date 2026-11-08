// src/features/hub/playerProfile/sharedLogic/performance/performance.comparison.logic.js

import { POSITION_STANDARD } from './performance.benchmarks.data.js'
import { aggregatePerformanceMetric, numberOrNull, PERFORMANCE_METRICS } from './performance.metrics.logic.js'

const POSITION_ALIASES = {
  DCL: 'CD', DCR: 'CD', CB: 'CD', CD: 'CD',
  DL: 'LD', LD: 'LD', DR: 'RD', RD: 'RD',
  DM: 'DM', MCL: 'CM', MCR: 'CM', CM: 'CM',
  AL: 'LM', LM: 'LM', AR: 'RM', RM: 'RM', S: 'F', F: 'F',
}

export function getPlayerStandardPosition(player) {
  const position = player?.primaryPosition || (Array.isArray(player?.positions) ? player.positions[0] : '')
  const key = typeof position === 'object' && position ? position.id || position.code : position
  return POSITION_ALIASES[String(key || '').toUpperCase()] || ''
}

export function getPositionBenchmarkValue(reference, minutes, percentile = 'p50') {
  const value = numberOrNull(reference?.[percentile])
  if (value === null) return null
  if (reference.isRate) return Math.round(value * 100)
  const duration = numberOrNull(minutes)
  return duration > 0 ? value * duration / POSITION_STANDARD.baseMinutes : null
}

export function getBenchmarkGapTone(actual, target, lowerIsBetter = false) {
  const measured = numberOrNull(actual)
  const benchmark = numberOrNull(target)
  if (measured === null || benchmark === null) return null
  const deficit = lowerIsBetter ? measured - benchmark : benchmark - measured
  if (deficit <= 0) return null
  const gap = benchmark > 0 ? deficit / benchmark : Infinity
  if (gap > 0.2) return 'danger'
  return gap >= 0.1 ? 'warning' : null
}

export function buildPositionComparison({
  games,
  positionId,
  minutes = 90,
  percentile = 'p50',
  family = 'all',
}) {
  const position = POSITION_STANDARD.positions.find(item => item.id === positionId)
  if (!position) return []
  return position.metrics.map(reference => {
    const metric = PERFORMANCE_METRICS.find(item => [item.totalKey, item.successKey, item.rateKey].includes(reference.id))
    if (family !== 'all' && (!metric || metric.family !== family)) return null
    const measured = metric ? aggregatePerformanceMetric(games, metric, String(minutes)) : null
    let actual = null
    if (measured) {
      if (reference.isRate) actual = measured.rate
      else if (reference.id === metric.successKey) actual = measured.successAverage
      else actual = measured.average
    }
    const target = getPositionBenchmarkValue(reference, minutes, percentile)
    const difference = actual === null || target === null ? null : actual - target
    return {
      ...reference, actual, target, difference,
      gapTone: getBenchmarkGapTone(actual, target, reference.lowerIsBetter),
      count: measured ? measured.count : 0,
      favorable: difference === null ? null : reference.lowerIsBetter ? difference <= 0 : difference >= 0,
      unavailableReason: !metric ? 'לא נמדד בטופס הסטטיסטיקה' : actual === null ? 'לא נמדד בבסיס הזמן שנבחר' : '',
    }
  }).filter(Boolean)
}

export { POSITION_STANDARD }
