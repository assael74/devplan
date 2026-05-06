// src/features/hub/playerProfile/sharedUi/insights/playerGames/sections/TeamImpactSection.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import {
  MetricMiniCard,
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

import { teamImpactSx as sx } from './sx/TeamImpact.sx.js'

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

const formatGap = (value, digits = 2) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return '—'
  if (number > 0) return `+${formatNumber(number, digits)}`
  if (number < 0) return formatNumber(number, digits)

  return '0'
}

const getGapColor = (value) => {
  const number = Number(value)

  if (!Number.isFinite(number)) return 'neutral'
  if (number > 0) return 'success'
  if (number < 0) return 'warning'

  return 'neutral'
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

const buildTeamImpactMetrics = (brief) => {
  const metrics = brief?.metrics || {}
  const withPlayer = metrics.withPlayer || {}
  const withoutPlayer = metrics.withoutPlayer || {}

  return [
    {
      id: 'withPlayerPointsRate',
      label: 'איתו',
      value: formatPercent(withPlayer.pointsRate),
      sub: `${formatNumber(withPlayer.points)}/${formatNumber(withPlayer.maxPoints)} נק׳`,
      icon: 'player',
      color: 'neutral',
    },
    {
      id: 'withoutPlayerPointsRate',
      label: 'בלעדיו',
      value: formatPercent(withoutPlayer.pointsRate),
      sub: `${formatNumber(withoutPlayer.points)}/${formatNumber(withoutPlayer.maxPoints)} נק׳`,
      icon: 'team',
      color: 'neutral',
    },
    {
      id: 'pointsPerGameGap',
      label: 'פער נק׳ למשחק',
      value: formatGap(metrics.pointsPerGameGap),
      sub: 'איתו מול בלעדיו',
      icon: 'trend',
      color: getGapColor(metrics.pointsPerGameGap),
    },
  ]
}

const buildTakeawayDetails = ({
  item,
  brief,
}) => {
  const items = getBriefItems(brief)

  const mainDetail = {
    id: 'main_team_impact_takeaway',
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
        אין מספיק נתוני השפעה קבוצתית
      </Typography>

      <Typography level="body-xs" sx={sx.emptyText}>
        כדי לבדוק השפעה קבוצתית צריך נתוני משחקים עם השחקן ובלעדיו.
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

function TeamImpactTakeaway({ brief }) {
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
        icon="team"
        value={item?.value}
        emptyText="כאן תופיע תובנה על השפעת השחקן על ביצועי הקבוצה."
      />
    </Box>
  )
}

export default function TeamImpactSection({ brief }) {
  if (!brief) {
    return <EmptyState />
  }

  const metrics = buildTeamImpactMetrics(brief)

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Typography level="title-sm" sx={sx.title}>
        השפעה קבוצתית
      </Typography>

      <MetricsGrid metrics={metrics} />

      <TeamImpactTakeaway brief={brief} />
    </Sheet>
  )
}
