// src/features/hub/playerProfile/sharedUi/insights/playerGames/sections/DifficultyImpactSection.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  MetricMiniCard,
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

import { difficultyImpactSx as sx } from './sx/DifficultyImpact.sx.js'

const JOY_COLORS = [
  'primary',
  'neutral',
  'danger',
  'success',
  'warning',
]

const hasValue = (value) => {
  return value !== null && value !== undefined && value !== ''
}

const normalizeColor = (value, fallback = 'neutral') => {
  if (JOY_COLORS.includes(value)) return value
  return fallback
}

const getPrimaryItem = (brief) => {
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

const getBriefItems = (brief) => {
  return Array.isArray(brief?.items)
    ? brief.items.filter(Boolean)
    : []
}

const getMetricRows = (brief) => {
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

const resolveMetricValue = (row) => {
  if (hasValue(row?.valueLabel)) return row.valueLabel
  if (hasValue(row?.actualLabel)) return row.actualLabel
  if (hasValue(row?.actual)) return row.actual
  if (hasValue(row?.value)) return row.value
  if (hasValue(row?.count)) return row.count

  return '—'
}

const resolveMetricSub = (row) => {
  if (hasValue(row?.sub)) return row.sub
  if (hasValue(row?.description)) return row.description
  if (hasValue(row?.targetLabel)) return `יעד ${row.targetLabel}`
  if (hasValue(row?.benchmarkLabel)) return `ייחוס ${row.benchmarkLabel}`

  return ''
}

const buildMetricsFromRows = (brief, fallbackIcon = 'details') => {
  const rows = getMetricRows(brief)

  return rows.map((row) => ({
    id: row.id || row.key || row.label,
    label: row.label || row.title || 'מדד',
    value: resolveMetricValue(row),
    sub: resolveMetricSub(row),
    icon: row.icon || row.idIcon || fallbackIcon,
    color: normalizeColor(row.color || row.tone || row?.evaluation?.tone),
    tooltip: row.tooltip || null,
  }))
}

const buildFallbackMetricFromItem = (item, icon = 'details') => {
  if (!item) return null
  if (!hasValue(item?.value)) return null

  return {
    id: `${item.id || item.type || item.label}_value`,
    label: item?.label || 'מדד',
    value: item.value,
    sub: '',
    icon: item?.icon || icon,
    color: normalizeColor(item?.tone),
    tooltip: null,
  }
}

const formatNumber = (value, digits = 0) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '—'

  return number.toFixed(digits)
}

const formatPercent = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '—'

  return `${Math.round(number)}%`
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
  if (number > 0) return 'success'
  if (number < 0) return 'warning'

  return 'neutral'
}

const buildBucketMetrics = (brief) => {
  const buckets = Array.isArray(brief?.metrics?.buckets)
    ? brief.metrics.buckets.filter(Boolean)
    : []

  return buckets.map((bucket) => ({
    id: bucket.id || bucket.label,
    label: bucket.label || 'רמת יריבה',
    value: formatPercent(bucket.playerPointsRate),
    sub: `${formatNumber(bucket.playerGames)} משחקים · פער ${formatSignedPercent(
      bucket.pointsRateGap
    )}`,
    icon: 'difficulty',
    color: getGapColor(bucket.pointsRateGap),
    tooltip: null,
  }))
}

const buildDifficultyMetrics = (brief) => {
  const bucketMetrics = buildBucketMetrics(brief)

  if (bucketMetrics.length) return bucketMetrics

  const rowMetrics = buildMetricsFromRows(brief, 'difficulty')

  if (rowMetrics.length) return rowMetrics

  const primaryItem = getPrimaryItem(brief)
  const fallbackMetric = buildFallbackMetricFromItem(primaryItem, 'difficulty')

  return fallbackMetric ? [fallbackMetric] : []
}

const buildTakeawayDetails = ({
  item,
  brief,
}) => {
  const items = getBriefItems(brief)

  const mainDetail = {
    id: 'main_difficulty_takeaway',
    label: item?.actionLabel || item?.label || 'עיקר התובנה',
    text: item?.text || 'אין תובנה זמינה כרגע.',
  }

  const itemDetails = Array.isArray(item?.details)
    ? item.details.filter(Boolean)
    : []

  const briefDetails = items
    .filter((detail) => detail?.id !== item?.id)
    .map((detail) => ({
      id: detail.id || detail.type || detail.label,
      label: detail.actionLabel || detail.label || 'תובנה',
      text: detail.text || 'אין פירוט זמין.',
    }))

  return [
    mainDetail,
    ...itemDetails,
    ...briefDetails,
  ]
}

function EmptyState() {
  return (
    <Sheet variant="soft" sx={sx.emptyState}>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        אין מספיק נתוני יריבה
      </Typography>

      <Typography level="body-xs" sx={sx.emptyText}>
        כדי לבדוק ביצועים לפי רמת יריבה צריך לחבר מדדי ביצוע לפי רמת קושי.
      </Typography>
    </Sheet>
  )
}

function MetricsGrid({ metrics = [] }) {
  const safeMetrics = Array.isArray(metrics)
    ? metrics.filter(Boolean)
    : []

  if (!safeMetrics.length) {
    return <EmptyState />
  }

  return (
    <Box sx={sx.metricsGrid}>
      {safeMetrics.map((metric) => (
        <MetricMiniCard
          key={metric.id || metric.label}
          label={metric.label}
          value={metric.value}
          sub={metric.sub}
          icon={metric.icon || 'info'}
          color={normalizeColor(metric.color)}
          tooltip={metric.tooltip}
        />
      ))}
    </Box>
  )
}

function DifficultyTakeaway({ brief }) {
  const item = getPrimaryItem(brief)

  if (!item) return null

  return (
    <Box sx={sx.takeawayWrap}>
      <Takeaway
        item={item}
        items={brief?.items}
        details={buildTakeawayDetails({
          item,
          brief,
        })}
        icon="difficulty"
        value={item?.value}
        emptyText="כאן תופיע תובנה על ביצועי השחקן לפי רמת יריבה."
      />
    </Box>
  )
}

export default function DifficultyImpactSection({ brief }) {
  if (!brief) {
    return <EmptyState />
  }

  const metrics = buildDifficultyMetrics(brief)

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Typography level="title-sm" sx={sx.title}>
        ביצועים לפי רמת יריבה
      </Typography>

      <MetricsGrid metrics={metrics} />

      <DifficultyTakeaway brief={brief} />
    </Sheet>
  )
}
