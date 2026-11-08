// src/features/hub/playerProfile/sharedLogic/performance/performance.share.logic.js

import { getFullDateIl } from '../../../../../shared/format/dateUtils.js'
import { getGameStatsTeamName } from '../../../../../ui/forms/gameStats/logic/core/form.helpers.js'
import { resolveEntityAvatar } from '../../../../../ui/core/avatars/fallbackAvatar.js'
import { formatPerformanceValue as format, getMetricGameValue, getNormalizationMinutes, normalizationLabel } from './performance.metrics.logic.js'
import { getBenchmarkGapTone, getPlayerStandardPosition, getPositionBenchmarkValue, POSITION_STANDARD } from './performance.comparison.logic.js'

function metricLine(metric, value, success, rate) {
  if (value === null && success === null) return null
  if (metric.type !== 'triplet') return `*${metric.label}:* ${format(value, false, metric)}`
  return `*${metric.label}:* ${format(value, false, metric)} סה״כ · ${format(success, false, metric)} ${metric.id === 'shots' ? 'למסגרת' : 'הצלחות'} · ${format(rate, true)}`
}

function metricRow(metric, data, note = '') {
  const text = metricLine(metric, data.value, data.success, data.rate)
  if (!text) return null
  return {
    id: metric.id,
    label: metric.label,
    values: [format(data.value, false, metric), metric.type === 'triplet' ? format(data.success, false, metric) : '—', metric.type === 'triplet' ? format(data.rate, true) : '—'],
    note,
    text: `${text}${note ? ` ${note}` : ''}`,
  }
}

function benchmarkMinutes(games, metric, part, target) {
  if (target !== 'age') return target
  // Use the same measured games as this value's normalized average, including explicit zero.
  const durations = games
    .filter(game => getMetricGameValue(game, metric, target)[part] !== null)
    .map(game => getNormalizationMinutes(game, target))
  return durations.length ? durations.reduce((sum, duration) => sum + duration, 0) / durations.length : null
}

function benchmarkCells({
  metric,
  position,
  games,
  target,
  percentile,
}) {
  const parts = metric.type === 'triplet' ? [
    { key: metric.totalKey, part: 'value', label: 'סה״כ' },
    { key: metric.successKey, part: 'success', label: metric.id === 'shots' ? 'למסגרת' : 'הצלחות' },
    { key: metric.rateKey, part: 'rate', label: 'הצלחה' },
  ] : [{ key: metric.totalKey, part: 'value', label: '' }]
  const references = parts.map(part => {
    const reference = position?.metrics.find(item => item.id === part.key)
    if (!reference) return null
    const minutes = reference.isRate ? null : benchmarkMinutes(games, metric, part.part, target)
    const value = getPositionBenchmarkValue(reference, minutes, percentile)
    if (value === null) return null
    return { ...part, reference, value, formatted: format(value, reference.isRate, metric) }
  }).filter(Boolean)
  const counts = references.filter(item => !item.reference.isRate)
  const rate = references.find(item => item.reference.isRate)
  const quantity = counts.map(item => counts.length > 1 ? `${item.label} ${item.formatted}` : item.formatted).join('\n') || '—'
  return {
    references,
    values: [quantity, rate ? rate.formatted : '—'],
    text: references.map(item => [item.label, item.formatted].filter(Boolean).join(' ')).join(' · '),
  }
}

function addPositionBenchmark(result, options) {
  const { player, report, target, normalizedGame, positionId, percentile } = options
  const id = positionId === undefined ? getPlayerStandardPosition(player) : positionId
  const position = POSITION_STANDARD.positions.find(item => item.id === id)
  const games = normalizedGame ? [normalizedGame] : report.measuredGames
  result.benchmark = { positionId: id, positionLabel: position?.label || '', percentile, columnStart: result.columns.length }
  result.columns.push('תקן — כמות', 'תקן — אחוז הצלחה')
  result.details.push(`תקן לעמדה: ${position?.label || 'לא נבחרה עמדה'} · ${percentile.toUpperCase()}`)
  for (const row of result.rows) {
    const metric = report.metrics.find(item => item.id === row.id)
    const benchmark = benchmarkCells({ metric, position, games, target, percentile })
    const aggregate = report.normalizedMetrics.find(item => item.id === metric.id)
    const actual = normalizedGame ? getMetricGameValue(normalizedGame, metric, target) : {
      value: aggregate.average, success: aggregate.successAverage, rate: aggregate.rate,
    }
    row.cellTones = ['value', 'success', 'rate'].map(part => {
      const reference = benchmark.references.find(item => item.part === part)
      return reference ? getBenchmarkGapTone(actual[part], reference.value, reference.reference.lowerIsBetter) : null
    })
    row.values.push(...benchmark.values)
    if (benchmark.text) row.text += ` · תקן: ${benchmark.text}`
  }
}

export function buildPerformanceShareReport({
  player,
  context,
  report,
  view,
  target = 'age',
  activeGame,
  normalizedGame = null,
  comparison = [],
  positionId,
  positionLabel = '',
  percentile = 'p50',
}) {
  const name = player?.playerFullName || player?.fullName || 'שחקן'
  const game = view === 'normalized' ? normalizedGame : activeGame
  const teamLabel = getGameStatsTeamName({ game: game?.game, team: context?.team, context: { ...context, player } })
  const result = {
    title: `${name} · דוח ביצועים`,
    playerAvatar: {
      name,
      src: resolveEntityAvatar({ entityType: 'player', entity: player }),
      fallback: resolveEntityAvatar({ entityType: 'player' }),
    },
    team: teamLabel !== 'קבוצה' ? teamLabel : '',
    heading: '',
    details: [],
    columns: ['מדד', 'סה״כ', 'הצלחות', 'אחוז הצלחה'],
    rows: [],
    notes: [],
  }
  if ((view === 'games' || view === 'normalized') && game) {
    result.heading = `נגד ${game.rival}${game.date ? ` · ${getFullDateIl(game.date)}` : ''}`
    if (view === 'normalized') result.details.push(`נרמול ${normalizationLabel(target)}`)
    result.details.push(`דקות משחק: ${format(game.timePlayed)} · דקות ניתוח: ${format(game.videoMinutes)}`)
    for (const metric of report.metrics) {
      const data = getMetricGameValue(game, metric, view === 'normalized' ? target : null)
      const row = metricRow(metric, data)
      if (row) result.rows.push(row)
    }
  } else if (view === 'compare') {
    const label = POSITION_STANDARD.positions.find(item => item.id === positionId)?.label || positionLabel
    result.heading = `השוואה לפי עמדה: ${label} · ${percentile.toUpperCase()}`
    result.details.push(`בסיס השוואה: ${target} דקות · ${report.measuredGames.length} משחקים`)
    result.columns = ['מדד', 'השחקן', 'תקן', 'עדיפות']
    for (const metric of comparison.filter(item => item.actual !== null)) {
      result.rows.push({
        id: metric.id,
        label: metric.label,
        values: [format(metric.actual, metric.isRate, metric), format(metric.target, metric.isRate, metric), metric.lowerIsBetter ? 'נמוך יותר' : 'גבוה יותר'],
        note: '',
        cellTones: [metric.gapTone || null],
        text: `*${metric.label}:* ${format(metric.actual, metric.isRate, metric)} · תקן ${format(metric.target, metric.isRate, metric)}${metric.lowerIsBetter ? ' (פחות עדיף)' : ''}`,
      })
    }
  } else {
    const normalized = view === 'normalized'
    result.heading = normalized ? `ממוצע מנורמל ${normalizationLabel(target)}` : 'סיכום נתונים בפועל'
    result.details.push(`${report.measuredGames.length} משחקים שנמדדו · ${format(report.videoMinutes)} דקות ניתוח`)
    if (normalized) result.details.push(`נרמול על בסיס דקות הווידאו שנותחו · ${report.normalizedGames} משחקים מתאימים`)
    const metrics = normalized ? report.normalizedMetrics : report.rawMetrics
    for (const metric of metrics) {
      const coverage = metric.count < report.measuredGames.length ? `(נמדד ב־${metric.count} משחקים)` : ''
      const paired = metric.type === 'triplet' && metric.pairedCount < metric.count
        ? `(אחוזי הצלחה מ־${metric.pairedCount} משחקים)` : ''
      const row = metricRow(metric, {
        value: normalized ? metric.average : metric.value,
        success: normalized ? metric.successAverage : metric.success,
        rate: metric.rate,
      }, [coverage, paired].filter(Boolean).join(' '))
      if (row) result.rows.push(row)
    }
  }
  if (view === 'normalized') addPositionBenchmark(result, { player, report, target, normalizedGame, positionId, percentile })
  return result
}

export function performanceShareText(report) {
  return [
    `*${report.title}*`, ...(report.team ? [report.team] : []), `*${report.heading}*`, ...report.details,
    '', ...report.rows.map(row => row.text), '', ...report.notes,
  ].join('\n').trimEnd()
}

export function filterPerformanceShareReport(report, hiddenRows = [], hiddenColumns = []) {
  const columnIndices = report.columns.map((_, index) => index).filter(index => !hiddenColumns.includes(report.columns[index]))
  const rows = report.rows.filter(row => !hiddenRows.includes(row.id)).map(row => {
    if (columnIndices.length === report.columns.length) return row
    const values = columnIndices.filter(index => index > 0).map(index => `${row.values[index - 1]} ${report.columns[index]}`)
    const label = columnIndices.includes(0) ? `*${row.label}:* ` : ''
    return { ...row, text: `${label}${values.join(' · ')}${row.note ? ` ${row.note}` : ''}`.trim() }
  })
  return {
    ...report,
    columns: columnIndices.map(index => report.columns[index]),
    sourceColumnCount: report.columns.length,
    columnIndices,
    rows,
  }
}

export function buildPerformanceShareText(options) {
  return performanceShareText(buildPerformanceShareReport(options))
}
