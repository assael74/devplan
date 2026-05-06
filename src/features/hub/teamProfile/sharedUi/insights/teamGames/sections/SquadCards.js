// teamProfile/sharedUi/insights/teamGames/sections/SquadCards.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'
import Dropdown from '@mui/joy/Dropdown'
import Menu from '@mui/joy/Menu'
import MenuButton from '@mui/joy/MenuButton'
import MenuItem from '@mui/joy/MenuItem'

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

import { squadSx as sx } from './sx/squad.sx.js'
import SquadOffenseCards from './SquadOffenseCards.js'

const iconByInsightId = {
  lineup_stability: 'lineup',
  player_integration: 'players',
}

const lineupMetricOrder = [
  'players20StartsPct',
  'top14MinutesPct',
]

const integrationMetricOrder = [
  'players500Pct',
  'players1000Pct',
]

const metricIconById = {
  players500Pct: 'isStart',
  players1000Pct: 'isStart',
  players1500Pct: 'isStart',
  players2000Pct: 'isStart',
  players20StartsPct: 'isStart',
  top14MinutesPct: 'isStart',
}

const fallbackInsights = [
  {
    id: 'lineup_stability',
    label: 'יציבות הרכב',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על יציבות ההרכב, עומק הרוטציה ושחקני מפתח.',
    details: [],
  },
  {
    id: 'player_integration',
    label: 'שילוב שחקנים',
    actionLabel: 'המשך בדיקה',
    tone: 'neutral',
    value: '—',
    text: 'כאן תופיע תובנה על כמות השחקנים שמשולבים בפועל לאורך העונה.',
    details: [],
  },
]

function getUsageRows(brief, order = []) {
  const rows = Array.isArray(brief?.metrics?.squadUsageEvaluation?.rows)
    ? brief.metrics.squadUsageEvaluation.rows
    : []

  return order
    .map((id) => rows.find((row) => row?.id === id))
    .filter(Boolean)
}

function getInsightItems(brief) {
  const items = Array.isArray(brief?.items) ? brief.items : []
  return items.length ? items : fallbackInsights
}

function getInsightById(brief, id) {
  return getInsightItems(brief).find((item) => item?.id === id) || null
}

function getMenuItems(item) {
  const details = Array.isArray(item?.details) ? item.details : []

  const primary = {
    id: `${item?.id || 'insight'}_primary`,
    label: `${item?.actionLabel || item?.label || 'תובנה'} · עיקר התובנה`,
    text: item?.text || 'אין תובנה זמינה כרגע.',
    isPrimary: true,
  }

  return [
    primary,
    ...details.map((detail) => ({
      ...detail,
      isPrimary: false,
    })),
  ]
}

function EmptyState({ title = 'אין נתונים', text = '' }) {
  return (
    <Box sx={sx.emptyState}>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        {title}
      </Typography>

      {text ? (
        <Typography level="body-xs" sx={sx.subText}>
          {text}
        </Typography>
      ) : null}
    </Box>
  )
}

function SquadInsightCard({ item }) {
  const color = normalizeTone(item?.tone)
  const menuItems = getMenuItems(item)

  return (
    <Sheet variant="soft" sx={sx.insightCard(color)}>
      <Box sx={sx.insightTop}>
        <Typography level="body-sm" sx={sx.insightTitle}>
          {item?.label || 'תובנה'}
        </Typography>

        <Chip
          size="sm"
          variant="soft"
          color={color}
          startDecorator={iconUi({
            id: iconByInsightId[item?.id] || 'insights',
            size: 'sm',
          })}
        >
          {item?.actionLabel || 'המשך בדיקה'}
        </Chip>
      </Box>

      <Box sx={sx.insightBody}>
        <Typography level="h3" sx={sx.insightValue}>
          {item?.value || '—'}
        </Typography>

        <Typography level="body-xs" sx={sx.insightText}>
          {item?.text || 'אין תובנה זמינה כרגע.'}
        </Typography>

        {menuItems.length ? (
          <Dropdown>
            <MenuButton
              size="sm"
              variant="plain"
              color={color}
              sx={sx.detailsButton}
            >
              למה זו ההמלצה?
            </MenuButton>

            <Menu
              placement="bottom"
              size="sm"
              variant="outlined"
              sx={sx.detailsMenu}
            >
              {menuItems.map((detail) => (
                <MenuItem key={detail.id} sx={sx.detailsMenuItem}>
                  <Box sx={sx.detailItem}>
                    <Typography
                      level="body-sm"
                      sx={
                        detail.isPrimary
                          ? sx.detailLabelPrimary
                          : sx.detailLabel
                      }
                    >
                      {detail.label}
                    </Typography>

                    <Typography level="body-xs" sx={sx.detailText}>
                      {detail.text}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Dropdown>
        ) : (
          <Box />
        )}
      </Box>
    </Sheet>
  )
}

function SquadUsageBlock({
  title,
  subtitle,
  rows,
  insight,
}) {
  return (
    <Sheet variant="soft" sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="body-sm" sx={sx.sectionTitle}>
            {title}
          </Typography>

          <Typography level="body-xs" sx={sx.sectionSubtitle}>
            {subtitle}
          </Typography>
        </Box>
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
        <EmptyState
          title="אין נתונים להצגה"
          text="חסרים נתוני דקות, פתיחות או נקודות ייחוס ליעד הטבלה."
        />
      )}

      {insight ? (
        <Box sx={sx.takeawayWrap}>
          <Takeaway
            item={insight}
            details={insight?.details}
            icon={iconByInsightId[insight?.id] || 'insights'}
            value={insight?.value}
          />
        </Box>
      ) : null}
    </Sheet>
  )
}

function SquadCurrentCard({ data, brief }) {
  const activePlayersCount = Number(data?.activePlayersCount || 0)

  const lineupRows = getUsageRows(brief, lineupMetricOrder)
  const integrationRows = getUsageRows(brief, integrationMetricOrder)

  const lineupInsight = getInsightById(brief, 'lineup_stability')
  const integrationInsight = getInsightById(brief, 'player_integration')

  return (
    <Sheet variant="soft" sx={sx.mainCard}>
      <Box sx={sx.sectionsStack}>
        <SquadOffenseCards brief={brief} />

        <Box sx={sx.usageRow}>
          <SquadUsageBlock
            title="יציבות הרכב"
            subtitle="גרעין פותח · ריכוזיות דקות"
            rows={lineupRows}
            insight={lineupInsight}
          />

          <SquadUsageBlock
            title="שילוב שחקנים"
            subtitle="עומק שימוש · דקות משמעותיות"
            rows={integrationRows}
            insight={integrationInsight}
          />
        </Box>
      </Box>
    </Sheet>
  )
}

export default function SquadCards({ data, brief }) {
  return (
    <Box sx={sx.grid}>
      <SquadCurrentCard data={data} brief={brief} />
    </Box>
  )
}
