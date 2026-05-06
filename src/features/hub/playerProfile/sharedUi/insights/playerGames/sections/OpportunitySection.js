// playerProfile/sharedUi/insights/playerGames/sections/OpportunitySection.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  MetricMiniCard,
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

import { opportunitySx as sx } from './sx/Opportunity.sx.js'

const JOY_COLORS = [
  'primary',
  'neutral',
  'danger',
  'success',
  'warning',
]

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

const buildMetricDetails = (metrics = []) => {
  const safeMetrics = Array.isArray(metrics)
    ? metrics.filter(Boolean)
    : []

  return safeMetrics.map((metric) => ({
    id: `metric_${metric.id || metric.label}`,
    label: metric.label || 'מדד',
    text: `${metric.value || '—'}${metric.sub ? ` · ${metric.sub}` : ''}`,
  }))
}

const buildBriefDetails = ({
  brief,
  item,
}) => {
  const items = Array.isArray(brief?.items)
    ? brief.items.filter(Boolean)
    : []

  return items
    .filter((detail) => detail?.id !== item?.id)
    .map((detail) => ({
      id: detail.id || detail.type || detail.label,
      label: detail.actionLabel || detail.label || 'תובנה',
      text: detail.text || 'אין פירוט זמין.',
    }))
}

const buildItemDetails = (item) => {
  const details = Array.isArray(item?.details)
    ? item.details.filter(Boolean)
    : []

  return details.map((detail) => ({
    id: detail.id || detail.label,
    label: detail.label || 'פירוט',
    text: detail.text || 'אין פירוט זמין.',
  }))
}

const buildOpportunityDetails = ({
  item,
  brief,
  data,
}) => {
  const mainDetail = {
    id: 'main_opportunity_takeaway',
    label: item?.actionLabel || item?.label || 'עיקר התובנה',
    text: item?.text || 'אין תובנה זמינה כרגע.',
  }

  const metricDetails = buildMetricDetails(data?.metrics)
  const itemDetails = buildItemDetails(item)

  const briefDetails = buildBriefDetails({
    brief,
    item,
  })

  return [
    mainDetail,
    ...metricDetails,
    ...itemDetails,
    ...briefDetails,
  ]
}

function EmptyState() {
  return (
    <Sheet variant="soft" sx={sx.emptyState}>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        אין מספיק נתוני הזדמנות
      </Typography>

      <Typography level="body-xs" sx={sx.emptyText}>
        כדי לנתח שילוב בסגל נדרשים נתוני דקות, פתיחות ושיוך למשחקי ליגה.
      </Typography>
    </Sheet>
  )
}

function OpportunityMetrics({ metrics = [] }) {
  const safeMetrics = Array.isArray(metrics)
    ? metrics.filter(Boolean)
    : []

  if (!safeMetrics.length) {
    return <EmptyState />
  }

  return (
    <Box sx={sx.metricsGrid}>
      {safeMetrics.map((item) => (
        <MetricMiniCard
          key={item.id || item.label}
          label={item.label}
          value={item.value}
          sub={item.sub}
          icon={item.icon || 'info'}
          color={normalizeColor(item.color)}
          tooltip={item.tooltip || null}
        />
      ))}
    </Box>
  )
}

function OpportunityTakeaway({
  data,
  brief,
}) {
  const item = getPrimaryItem(brief)

  if (!item) return null

  return (
    <Box sx={sx.takeawayWrap}>
      <Takeaway
        item={item}
        items={brief?.items}
        details={buildOpportunityDetails({
          item,
          brief,
          data,
        })}
        icon="time"
        value={item?.value}
        emptyText="כאן תופיע תובנה על נפח ההזדמנות שקיבל השחקן."
      />
    </Box>
  )
}

export default function OpportunitySection({
  data,
  brief,
}) {
  const metrics = data?.metrics || []

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleBlock}>
          <Typography level="body-sm" sx={sx.title}>
            מדדי הזדמנות
          </Typography>

          <Typography level="body-xs" sx={sx.subtitle}>
            בדיקה האם נפח השימוש בפועל תואם את המעמד שהוגדר לשחקן
          </Typography>
        </Box>
      </Box>

      <OpportunityMetrics metrics={metrics} />

      <OpportunityTakeaway
        data={data}
        brief={brief}
      />
    </Sheet>
  )
}
