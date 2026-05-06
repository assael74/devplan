// playerProfile/sharedUi/insights/playerGames/sections/ExpectationSection.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import {
  MetricMiniCard,
  Takeaway,
} from '../../../../../../../ui/patterns/insights/index.js'

import { expectationSx as sx } from './sx/Expectation.sx.js'

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

const getSectionId = (brief) => {
  return brief?.sectionId || brief?.id || ''
}

const getPositionLayerKey = (brief) => {
  return brief?.metrics?.position?.layerKey || ''
}

const isDefensiveUiRole = (brief) => {
  const layerKey = getPositionLayerKey(brief)

  return (
    layerKey === 'dmMid' ||
    layerKey === 'defense' ||
    layerKey === 'goalkeeper'
  )
}

const resolveExpectationLayout = (briefs = {}) => {
  if (isDefensiveUiRole(briefs.positionFit)) {
    return 'defensive'
  }

  return 'attacking'
}

const buildScoringMetrics = (brief, positionBrief) => {
  const metrics = brief?.metrics || {}
  const isDefensive = isDefensiveUiRole(positionBrief)

  return [
    {
      id: 'goals',
      label: 'שערים',
      value: formatNumber(metrics.goals),
      sub: '',
      icon: 'goal',
      color: 'neutral',
    },
    {
      id: 'assists',
      label: 'בישולים',
      value: formatNumber(metrics.assists),
      sub: '',
      icon: 'assist',
      color: 'neutral',
    },
    {
      id: 'goalContributions',
      label: 'מעורבות',
      value: formatNumber(metrics.goalContributions),
      sub: isDefensive ? 'אין יעד התקפי לעמדה' : '',
      icon: 'attack',
      color: normalizeColor(brief?.tone),
    },
  ]
}

const buildDefensivePositionMetrics = (brief) => {
  const metrics = brief?.metrics || {}

  return [
    {
      id: 'goalsAgainstPerGame',
      label: 'ספיגה למשחק',
      value: formatNumber(metrics.goalsAgainstPerGame, 2),
      sub: `יעד ${formatNumber(metrics.goalsAgainstPerGameTarget, 2)}`,
      icon: 'defense',
      color: normalizeColor(brief?.tone),
    },
    {
      id: 'cleanSheetPct',
      label: 'רשת נקייה',
      value: formatPercent(metrics.cleanSheetPct),
      sub: `${formatNumber(metrics.cleanSheets)} משחקים`,
      icon: 'verified',
      color: 'neutral',
    },
    {
      id: 'goalContributions',
      label: 'תרומה התקפית',
      value: formatNumber(metrics.goalContributions),
      sub: 'אין יעד התקפי לעמדה',
      icon: 'attack',
      color: 'neutral',
    },
  ]
}

const buildAttackingPositionMetrics = (brief) => {
  const metrics = brief?.metrics || {}

  return [
    {
      id: 'goalContributions',
      label: 'מעורבות',
      value: formatNumber(metrics.goalContributions),
      sub: '',
      icon: 'attack',
      color: normalizeColor(brief?.tone),
    },
    {
      id: 'goals',
      label: 'שערים',
      value: formatNumber(metrics.goals),
      sub: '',
      icon: 'goal',
      color: 'neutral',
    },
    {
      id: 'assists',
      label: 'בישולים',
      value: formatNumber(metrics.assists),
      sub: '',
      icon: 'assist',
      color: 'neutral',
    },
  ]
}

const buildPositionFitMetrics = (brief) => {
  if (isDefensiveUiRole(brief)) {
    return buildDefensivePositionMetrics(brief)
  }

  return buildAttackingPositionMetrics(brief)
}

const buildTakeawayDetails = ({
  item,
  brief,
}) => {
  const items = getBriefItems(brief)

  const mainDetail = {
    id: 'main_expectation_takeaway',
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

function PositionChip({ brief }) {
  const metrics = brief?.metrics || {}

  const label =
    metrics?.position?.layerLabel ||
    brief?.targetLabel ||
    'עמדה לא הוגדרה'

  return (
    <Chip
      size="sm"
      variant="soft"
      color="neutral"
      sx={sx.positionChip}
    >
      {label}
    </Chip>
  )
}

function EmptyState({
  title = 'אין מספיק נתונים',
  text = 'המידע יוצג לאחר חיבור המדדים.',
}) {
  return (
    <Sheet variant="soft" sx={sx.emptyState}>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        {title}
      </Typography>

      <Typography level="body-xs" sx={sx.emptyText}>
        {text}
      </Typography>
    </Sheet>
  )
}

function BlockHeader({
  title,
  chip = null,
}) {
  return (
    <Box sx={sx.blockHeader}>
      <Typography level="body-sm" sx={sx.blockTitle}>
        {title}
      </Typography>

      {chip}
    </Box>
  )
}

function MetricsGrid({
  metrics = [],
  emptyTitle,
  emptyText,
}) {
  const safeMetrics = Array.isArray(metrics)
    ? metrics.filter(Boolean)
    : []

  if (!safeMetrics.length) {
    return (
      <EmptyState
        title={emptyTitle}
        text={emptyText}
      />
    )
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

function BlockTakeaway({
  brief,
  icon,
  emptyText,
}) {
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
        icon={icon}
        value={item?.value}
        emptyText={emptyText}
      />
    </Box>
  )
}

function ExpectationBlock({
  title,
  brief,
  icon,
  metrics,
  emptyTitle,
  emptyText,
}) {
  if (!brief) return null

  const isPositionFit = getSectionId(brief) === 'positionFit'

  return (
    <Sheet variant="soft" sx={sx.block}>
      <BlockHeader
        title={title}
        chip={isPositionFit ? <PositionChip brief={brief} /> : null}
      />

      <MetricsGrid
        metrics={metrics}
        emptyTitle={emptyTitle}
        emptyText={emptyText}
      />

      <BlockTakeaway
        brief={brief}
        icon={icon}
        emptyText="כאן תופיע תובנה מקצועית על השחקן."
      />
    </Sheet>
  )
}

export default function ExpectationSection({
  briefs = {},
}) {
  const hasAnyData =
    briefs?.scoring ||
    briefs?.positionFit

  if (!hasAnyData) {
    return (
      <EmptyState
        title="אין מספיק נתוני תפוקה"
        text="כדי לבדוק עמידה בציפייה צריך לחבר תפוקה ישירה ותרומה לפי עמדה."
      />
    )
  }

  const layout = resolveExpectationLayout(briefs)

  const scoringMetrics = buildScoringMetrics(
    briefs.scoring,
    briefs.positionFit
  )

  const positionMetrics = buildPositionFitMetrics(
    briefs.positionFit
  )

  return (
    <Box sx={sx.mainGrid(layout)}>
      <ExpectationBlock
        title="תפוקה ישירה"
        brief={briefs.scoring}
        icon="goal"
        metrics={scoringMetrics}
        emptyTitle="אין מדדי תפוקה להצגה"
        emptyText="בשלב הבא נחבר לכאן שערים, בישולים ומעורבות ישירה."
      />

      <ExpectationBlock
        title="תרומה לפי עמדה"
        brief={briefs.positionFit}
        icon="position"
        metrics={positionMetrics}
        emptyTitle="אין מדדי עמדה להצגה"
        emptyText="כדי לבדוק תרומה לפי עמדה צריך להגדיר עמדה ולחבר נתוני משחק."
      />
    </Box>
  )
}
