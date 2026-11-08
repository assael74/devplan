// src/features/hub/playerProfile/sharedLogic/performance/performance.metrics.logic.js

import { statsParm } from '../../../../../shared/stats/statsParmList.js'
import { calculateSuccessRate } from '../../../../../shared/stats/stats.helpers.js'
import { normalizePerformanceValue } from '../../../../../shared/performance/logic/perf.aggregate.logic.js'
import { normalizeFullDate } from '../../../../../shared/format/dateUtils.js'
import { getPlayerPerformanceGames } from './performance.domain.logic.js'

export const PERFORMANCE_VIEWS = [
  { id: 'games', label: 'לפי משחק', icon: 'game' },
  { id: 'summary', label: 'סיכום', icon: 'stats' },
  { id: 'normalized', label: 'נרמול', icon: 'rate' },
  { id: 'compare', label: 'השוואה לעמדה', icon: 'targets' },
]

export const INITIAL_REPORT_FILTERS = { type: 'all', family: 'all', from: '', to: '' }

export const numberOrNull = value => {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function buildMetricCatalog() {
  const groups = new Map()
  const metrics = []
  for (const param of statsParm) {
    if (param.isDefault !== false) continue
    if (param.tripletGroup) {
      const group = groups.get(param.tripletGroup) || []
      group.push(param)
      groups.set(param.tripletGroup, group)
    } else {
      metrics.push({
        id: param.id, label: param.statsParmName, type: 'number',
        family: param.statsParmType, totalKey: param.id, order: param.order || 0,
      })
    }
  }
  for (const [id, params] of groups) {
    const total = params.find(param => /Total$/.test(param.id))
    const rate = params.find(param => /Rate$/.test(param.id))
    const success = params.find(param => param !== total && param !== rate)
    if (!total || !rate || !success) continue
    metrics.push({
      id, type: 'triplet', label: total.statsParmShortName || total.statsParmName,
      description: total.statsParmDescription || '', family: total.statsParmType,
      totalKey: total.id, successKey: success.id, rateKey: rate.id, order: total.order || 0,
    })
  }
  return metrics.sort((a, b) => a.order - b.order)
}

export const PERFORMANCE_METRICS = buildMetricCatalog()

const dateKey = value => {
  const text = String(value || '').trim()
  return normalizeFullDate(text.slice(0, 10).replace(/[/.]/g, '-')).ymd
}

export function getNormalizationMinutes(game, target = 'age') {
  return target === 'age' ? numberOrNull(game.duration) : numberOrNull(target)
}

export function buildReportGames(player) {
  const playerId = String(player?.id || '')
  return getPlayerPerformanceGames(player).map(game => {
    const statsRow = (Array.isArray(game.playerStats) ? game.playerStats : [])
      .find(row => String(row.playerId) === playerId)
    const stats = statsRow ? { ...statsRow, ...(statsRow.stats || {}) } : {}
    const entry = (Array.isArray(game.gamePlayers) ? game.gamePlayers : [])
      .find(row => String(row.playerId || row.id) === playerId)
    const registration = entry || (String(game.playerId) === playerId ? game : {})
    const measured = PERFORMANCE_METRICS.some(metric => numberOrNull(stats[metric.totalKey]) !== null)
    return {
      id: game.id, game, stats, measured, canEdit: !game.referenceOnly,
      rival: game.rivel || game.rival || game.opponent || 'ללא יריבה',
      date: dateKey(game.gameDate), type: game.type || '',
      home: game.home, duration: numberOrNull(game.gameDuration),
      timePlayed: numberOrNull(stats.timePlayed) === null
        ? numberOrNull(registration.timePlayed) : numberOrNull(stats.timePlayed),
      videoMinutes: numberOrNull(stats.timeVideoStats),
      status: game.statsStatus || '',
    }
  }).sort((a, b) => b.date.localeCompare(a.date) || String(a.id).localeCompare(String(b.id)))
}

export function filterReportGames(games, filters = {}) {
  return games.filter(game => {
    if (filters.type && filters.type !== 'all' && game.type !== filters.type) return false
    if (filters.from && (!game.date || game.date < filters.from)) return false
    if (filters.to && (!game.date || game.date > filters.to)) return false
    return true
  })
}

export function getMetricGameValue(game, metric, target = null) {
  const raw = numberOrNull(game.stats[metric.totalKey])
  const success = metric.successKey ? numberOrNull(game.stats[metric.successKey]) : null
  const minutes = getNormalizationMinutes(game, target)
  const value = target === null ? raw : normalizePerformanceValue(raw, game.videoMinutes, minutes)
  const successful = target === null ? success : normalizePerformanceValue(success, game.videoMinutes, minutes)
  return {
    value, success: successful,
    rate: raw !== null && raw > 0 && success !== null ? calculateSuccessRate(raw, success) : null,
  }
}

export function aggregatePerformanceMetric(games, metric, target = null) {
  let value = 0
  let success = 0
  let count = 0
  let successCount = 0
  let pairedTotal = 0
  let pairedSuccess = 0
  let pairedCount = 0
  for (const game of games) {
    const measured = getMetricGameValue(game, metric, target)
    if (measured.value !== null) {
      value += measured.value
      count += 1
    }
    if (measured.success !== null) {
      success += measured.success
      successCount += 1
    }
    if (measured.value !== null && measured.success !== null) {
      pairedTotal += measured.value
      pairedSuccess += measured.success
      pairedCount += 1
    }
  }
  return {
    ...metric,
    value: count ? value : null,
    average: count ? value / count : null,
    success: successCount ? success : null,
    successAverage: successCount ? success / successCount : null,
    rate: pairedTotal > 0 ? calculateSuccessRate(pairedTotal, pairedSuccess) : null,
    count, successCount, pairedCount, totalGames: games.length,
  }
}

export function buildPerformanceReport({ player, filters = {}, target = 'age' }) {
  const games = filterReportGames(buildReportGames(player), filters)
  const measuredGames = games.filter(game => game.measured)
  const metrics = PERFORMANCE_METRICS.filter(metric => !filters.family || filters.family === 'all' || metric.family === filters.family)
  const rawMetrics = metrics.map(metric => aggregatePerformanceMetric(measuredGames, metric))
  const normalizedMetrics = metrics.map(metric => aggregatePerformanceMetric(measuredGames, metric, target))
  const validGames = measuredGames.filter(game => game.videoMinutes > 0 && getNormalizationMinutes(game, target) > 0)
  const sumMinutes = key => {
    const values = measuredGames.map(game => game[key]).filter(value => value !== null)
    return values.length ? values.reduce((sum, value) => sum + value, 0) : null
  }
  return {
    games, measuredGames, metrics, rawMetrics, normalizedMetrics,
    normalizedGames: validGames.length,
    missingVideoGames: measuredGames.filter(game => !(game.videoMinutes > 0)).length,
    missingDurationGames: target === 'age'
      ? measuredGames.filter(game => !(game.duration > 0)).length : 0,
    videoMinutes: sumMinutes('videoMinutes'),
    timePlayed: sumMinutes('timePlayed'),
  }
}

export function usesWholePerformanceCounts(metric) {
  const id = typeof metric === 'string' ? metric : metric?.id || metric?.totalKey || ''
  return /^(passes|progressivePasses)(Total|Success)?$/.test(id)
}

export function formatPerformanceValue(value, rate = false, metric = null) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '—'
  if (rate) return `${Math.round(Number(value))}%`
  return new Intl.NumberFormat('he-IL', { maximumFractionDigits: usesWholePerformanceCounts(metric) ? 0 : 1 }).format(Number(value))
}

export const normalizationLabel = target => target === 'age' ? 'למשך המשחק בקבוצת הגיל' : `ל־${target} דקות`
