// teamProfile/sharedUi/insights/teamGames/sections/SquadOffenseCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import {
  BenchmarkTooltip,
  MetricMiniCard,
  Takeaway
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  formatActual,
  formatTarget,
  getRowTone,
  normalizeTone,
} from '../../../../../../../ui/patterns/insights/utils/index.js'

import { squadOffenseSx as sx } from './sx/squadOffense.sx.js'

const attackMetricOrder = [
  'uniqueScorers',
  'scorers5Plus',
  'top3DependencyPct',
]

const metricIconById = {
  uniqueScorers: 'goal',
  scorers3Plus: 'attack',
  scorers5Plus: 'assists',
  scorers10Plus: 'star',
  topScorerDependencyPct: 'player',
  top3DependencyPct: 'teams',
}

function getAttackRows(brief) {
  const rows = Array.isArray(brief?.metrics?.scorersEvaluation?.rows)
    ? brief.metrics.scorersEvaluation.rows
    : []

  return attackMetricOrder
    .map((id) => rows.find((row) => row?.id === id))
    .filter(Boolean)
}

function getAttackInsight(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []

  return (
    items.find((item) => item?.id === 'attacking_involvement') || {
      id: 'attacking_involvement',
      label: 'מעורבות התקפית',
      actionLabel: 'המשך בדיקה',
      tone: 'neutral',
      value: '—',
      text: 'כאן תופיע תובנה על פיזור הכובשים, המבשלים והמעורבים בשערים.',
      details: [],
    }
  )
}

function EmptyState() {
  return (
    <Box sx={sx.emptyState}>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        אין נתוני תרומה התקפית
      </Typography>

      <Typography level="body-xs" sx={sx.subText}>
        חסרים נתוני כובשים או נקודות ייחוס ליעד הטבלה.
      </Typography>
    </Box>
  )
}

export default function SquadOffenseCards({ brief }) {
  const rows = getAttackRows(brief)
  const insight = getAttackInsight(brief)
  const color = normalizeTone(insight?.tone)

  return (
    <Sheet variant="soft" sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.headerText}>
          <Typography level="body-sm" sx={sx.sectionTitle}>
            תרומה למשחק ההתקפי
          </Typography>

          <Typography level="body-xs" sx={sx.sectionSubtitle}>
            פיזור כובשים · כובשים משמעותיים · ריכוזיות שערים
          </Typography>
        </Box>

        <Chip
          size="sm"
          variant="soft"
          color={color}
          startDecorator={iconUi({ id: 'attack', size: 'sm' })}
          sx={sx.headerChip}
        >
          {insight?.actionLabel || 'המשך בדיקה'}
        </Chip>
      </Box>

      {rows.length ? (
        <Box sx={sx.metricsGrid}>
          {rows.map((row) => (
            <MetricMiniCard
              key={row.id}
              label={row?.label || 'מדד'}
              value={formatActual(row)}
              sub={`יעד ${formatTarget(row)}`}
              icon={metricIconById[row?.id] || 'info'}
              color={getRowTone(row)}
              tooltip={<BenchmarkTooltip row={row} />}
            />
          ))}
        </Box>
      ) : (
        <EmptyState />
      )}

      <Takeaway
        item={insight}
        details={insight?.details}
        icon="goals"
        value={insight?.value}
      />
    </Sheet>
  )
}
