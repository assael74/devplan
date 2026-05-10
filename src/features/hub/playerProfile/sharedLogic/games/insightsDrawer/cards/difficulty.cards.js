// playerProfile/sharedLogic/games/insightsDrawer/cards/difficulty.cards.js

import {
  formatNumber,
  formatPercent,
  normalizeJoyColor,
} from './cards.shared.js'

import {
  buildDifficultyTooltip,
} from '../tooltips/index.js'

const hasValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

const getBucketReliability = (bucket = {}) => {
  const withPlayer = bucket.withPlayer || bucket.player || {}
  const withoutPlayer = bucket.withoutPlayer || {}

  const withGames = Number(withPlayer.games || 0)
  const withoutGames = Number(withoutPlayer.games || 0)

  return {
    withGames,
    withoutGames,
    hasCompare: withGames > 0 && withoutGames > 0,
  }
}

const getBucketColor = (bucket = {}) => {
  const reliability = getBucketReliability(bucket)

  if (!reliability.hasCompare) return 'neutral'

  return getGapColor(bucket.pointsRateGap)
}

const getBucketSub = (bucket = {}) => {
  const withPlayer = bucket.withPlayer || bucket.player || {}
  const reliability = getBucketReliability(bucket)

  if (!reliability.withGames) {
    return 'אין משחקים עם השחקן'
  }

  if (!reliability.withoutGames) {
    return `${formatNumber(withPlayer.games)} משחקים · אין מדגם בלעדיו`
  }

  return `${formatNumber(withPlayer.games)} משחקים · פער ${formatSignedPercent(
    bucket.pointsRateGap
  )}`
}

const formatSignedPercent = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '—'

  const rounded = Math.round(number)
  const sign = rounded > 0 ? '+' : ''

  return `${sign}${rounded}%`
}

const getGapColor = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return 'neutral'
  if (number >= 10) return 'success'
  if (number <= -10) return 'warning'

  return 'neutral'
}

const getMetricRows = (brief = {}) => {
  const metrics = brief?.metrics || {}

  if (Array.isArray(metrics.rows)) {
    return metrics.rows.filter(Boolean)
  }

  if (Array.isArray(metrics.evaluation?.rows)) {
    return metrics.evaluation.rows.filter(Boolean)
  }

  if (Array.isArray(metrics.contextRows)) {
    return metrics.contextRows.filter(Boolean)
  }

  if (Array.isArray(brief?.rows)) {
    return brief.rows.filter(Boolean)
  }

  return []
}

const resolveMetricValue = (row = {}) => {
  if (hasValue(row.valueLabel)) return row.valueLabel
  if (hasValue(row.actualLabel)) return row.actualLabel
  if (hasValue(row.actual)) return row.actual
  if (hasValue(row.value)) return row.value
  if (hasValue(row.count)) return row.count

  return '—'
}

const resolveMetricSub = (row = {}) => {
  if (hasValue(row.sub)) return row.sub
  if (hasValue(row.description)) return row.description
  if (hasValue(row.targetLabel)) return `יעד ${row.targetLabel}`
  if (hasValue(row.benchmarkLabel)) return `ייחוס ${row.benchmarkLabel}`

  return ''
}

const buildRowsCards = (brief = {}) => {
  const rows = getMetricRows(brief)

  return rows.map((row) => ({
    id: row.id || row.key || row.label,
    label: row.label || row.title || 'מדד',
    value: resolveMetricValue(row),
    sub: resolveMetricSub(row),
    icon: row.icon || row.idIcon || 'difficulty',
    color: normalizeJoyColor(row.color || row.tone || row?.evaluation?.tone),
    tooltip: row.tooltip || null,
  }))
}

const buildBucketCards = (brief = {}) => {
  const buckets = Array.isArray(brief?.metrics?.buckets)
    ? brief.metrics.buckets.filter(Boolean)
    : []

  return buckets.map((bucket) => ({
    id: bucket.id || bucket.label,
    label: bucket.label || 'רמת יריבה',
    value: formatPercent(bucket.playerPointsRate),
    sub: getBucketSub(bucket),
    icon: 'difficulty',
    color: getBucketColor(bucket),
    tooltip: buildDifficultyTooltip({
      id: bucket.id,
      brief,
    }),
  }))
}

const getPrimaryItem = (brief = {}) => {
  const items = Array.isArray(brief?.items) ? brief.items : []

  return (
    items.find((item) => item?.id === 'action_focus') ||
    items.find((item) => item?.type === 'focus') ||
    items.find((item) => item?.type === 'risk') ||
    items.find((item) => item?.type === 'advantage') ||
    items[0] ||
    null
  )
}

const buildFallbackCard = (brief = {}) => {
  const item = getPrimaryItem(brief)

  if (!item) return null
  if (!hasValue(item.value)) return null

  return {
    id: `${item.id || item.type || item.label}_value`,
    label: item.label || 'מדד',
    value: item.value,
    sub: '',
    icon: item.icon || 'difficulty',
    color: normalizeJoyColor(item.tone),
    tooltip: null,
  }
}

export const buildDifficultyCards = (brief = {}) => {
  const bucketCards = buildBucketCards(brief)

  if (bucketCards.length) return bucketCards

  const rowCards = buildRowsCards(brief)

  if (rowCards.length) return rowCards

  const fallbackCard = buildFallbackCard(brief)

  return fallbackCard ? [fallbackCard] : []
}
