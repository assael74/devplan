// src/features/hub/teamProfile/sharedUi/players/print/SeasonPlanContent.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { SEASON_PLAN_LAYER_TARGETS } from '../../../../../../shared/players/players.constants.js'

import {
  SquadTable,
} from './ReportParts.js'

import { sharedSx } from './sx/shared.sx.js'
import { seasonPlanSx as sx } from './sx/seasonPlan.sx.js'

function findItem(items, value) {
  return items.find(item => item.value === value) || {
    id: value,
    value,
    label: value,
    shortLabel: value,
    count: 0,
    iconId: 'players',
    iconColor: '#64748B',
  }
}

function getLayerTone(item, value) {
  if (item.mode === 'fixed') {
    if (value === item.target) return 'good'
    if (Math.abs(value - item.target) === 1) return 'warn'

    return 'bad'
  }

  if (item.mode === 'range') {
    if (value >= item.min && value <= item.max) return 'good'
    if (value === item.min - 1 || value === item.max + 1) return 'warn'

    return 'bad'
  }

  if (item.mode === 'min') {
    if (value >= item.target && value <= item.target + 2) return 'good'
    if (value >= item.target - 2 && value < item.target) return 'warn'

    return 'bad'
  }

  return 'neutral'
}

function StatusLine({ item, label, tone }) {
  return (
    <Box sx={sx.seasonPlanKpiLine}>
      <Box sx={sx.seasonPlanKpiLineCopy}>
        <Typography sx={sx.seasonPlanKpiLineLabel}>
          {label}
        </Typography>

        <Box sx={sx.seasonPlanKpiLineIndicator}>
          <Box sx={sx.seasonPlanKpiLineIcon}>
            {iconUi({ id: item.iconId || 'players', sx: { color: item.iconColor || '#64748B' }, })}
          </Box>

          <Typography sx={sx.seasonPlanKpiLineValue}>
            {item.count}
          </Typography>

          <Box sx={sx.seasonPlanKpiLineBar}>
            <Box
              sx={sx.seasonPlanKpiLineFill({
                tone,
                value: item.count,
              })}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function LayerCard({ item }) {
  const tone = getLayerTone(item, item.count)

  return (
    <Sheet variant='outlined' sx={sx.layerKpiCard}>
      <Box sx={sx.layerKpiCardHeader}>
        <Typography sx={sx.layerKpiCardTitle}>
          {item.label}
        </Typography>
      </Box>

      <Typography sx={sx.layerKpiCardCount({ tone })}>
        {item.count}
      </Typography>

      <Typography sx={sx.layerKpiCardRequirement}>
        {item.requirement}
      </Typography>
    </Sheet>
  )
}

function Layers({ items = [] }) {
  const list = SEASON_PLAN_LAYER_TARGETS.map(item => {
    const summary = items.find(row => row.value === item.value)

    return {
      ...item,
      count: summary ? summary.count : 0,
    }
  })

  return (
    <Sheet variant='outlined' className='dpPrintSection' sx={sx.layerSection}>
      <Box sx={sx.layerSectionHeader}>
        <Box>
          <Typography level='title-sm' sx={sharedSx.summarySectionTitle}>
            תכנון לעונה לפי חוליות
          </Typography>

          <Typography level='body-xs' sx={sharedSx.summarySectionSubtitle}>
            חלוקה ראשונית לפי קווי משחק
          </Typography>
        </Box>
      </Box>

      <Box sx={sx.layerGrid}>
        {list.map(item => (
          <LayerCard key={item.value} item={item} />
        ))}
      </Box>
    </Sheet>
  )
}

function Kpi({ items = [] }) {
  const planned = [
    findItem(items, 'inSquad'),
    findItem(items, 'wantsToLeave'),
    findItem(items, 'undecided'),
  ]

  const review = [
    findItem(items, 'underReview'),
    findItem(items, 'notReviewed'),
  ]

  const notSuitable = findItem(items, 'notSuitable')

  const plannedTotal = planned.reduce((sum, item) => {
    return sum + Number(item.count || 0)
  }, 0)

  const reviewTotal = review.reduce((sum, item) => {
    return sum + Number(item.count || 0)
  }, 0)

  return (
    <Sheet variant='outlined' className='dpPrintSection' sx={sx.seasonPlanKpiSection}>
      <Box sx={sx.seasonPlanKpiHeader}>
        <Box>
          <Typography level='title-sm' sx={sharedSx.summarySectionTitle}>
            תכנון לעונה
          </Typography>

          <Typography level='body-xs' sx={sharedSx.summarySectionSubtitle}>
            חלוקה קצרה ומדורגת לפני הטבלה
          </Typography>
        </Box>

        <Typography sx={sharedSx.summarySectionTotal}>
          {plannedTotal} שחקנים
        </Typography>
      </Box>

      <Box sx={sx.seasonPlanKpiGrid}>
        <Sheet variant='outlined' sx={[sx.seasonPlanKpiCard, sx.seasonPlanKpiMain]}>
          <Box sx={sx.seasonPlanKpiCardHeader}>
            <Typography sx={sx.seasonPlanKpiCardTitle}>
              בתכנון לעונה
            </Typography>

            <Typography sx={sx.seasonPlanKpiCardChip}>
              {plannedTotal}
            </Typography>
          </Box>

          <Box sx={sx.seasonPlanKpiLinesInlineThree}>
            <StatusLine item={planned[0]} label='שחקנים בתוכנית' tone='good' />
            <StatusLine item={planned[1]} label='שחקנים שרוצים לעזוב' tone='warn' />
            <StatusLine item={planned[2]} label='שחקנים בהתלבטות' tone='neutral' />
          </Box>
        </Sheet>

        <Sheet variant='outlined' sx={[sx.seasonPlanKpiCard, sx.seasonPlanKpiMid]}>
          <Box sx={sx.seasonPlanKpiCardHeader}>
            <Typography sx={sx.seasonPlanKpiCardTitle}>
              עדיין בתהליך בחינה
            </Typography>

            <Typography sx={sx.seasonPlanKpiCardChip}>
              {reviewTotal}
            </Typography>
          </Box>

          <Box sx={sx.seasonPlanKpiLinesInlineTwo}>
            <StatusLine item={review[0]} label='בבחינה' tone='good' />
            <StatusLine item={review[1]} label='לא נבחן' tone='neutral' />
          </Box>
        </Sheet>

        <Sheet variant='outlined' sx={[sx.seasonPlanKpiCard, sx.seasonPlanKpiSide]}>
          <Box sx={sx.seasonPlanKpiCardHeader}>
            <Typography sx={sx.seasonPlanKpiCardTitle}>
              לא בתכנון
            </Typography>

            <Typography sx={sx.seasonPlanKpiCardChip}>
              {notSuitable.count}
            </Typography>
          </Box>

          <Box sx={sx.seasonPlanKpiLines}>
            <StatusLine
              item={notSuitable}
              label='לא מתאים מקצועית'
              tone='bad'
            />
          </Box>
        </Sheet>
      </Box>
    </Sheet>
  )
}

function Section({ group, columns }) {
  if (!group.rows.length) return null

  return (
    <Sheet
      variant='outlined'
      className='dpPrintSection'
      sx={sx.tableSection({ topMargin: group.id === 'notSuitable' ? 1.5 : 0, })}
    >
      <Box sx={sx.tableSectionHeader({ tone: group.tone })}>
        <Box>
          <Typography
            level='title-sm'
            sx={sx.tableSectionTitle({ tone: group.tone })}
          >
            {group.title}
          </Typography>

          <Typography
            level='body-xs'
            sx={sx.tableSectionSubtitle({ tone: group.tone })}
          >
            {group.subtitle}
          </Typography>
        </Box>

        <Typography sx={sx.tableSectionCount({ tone: group.tone })}>
          {group.rows.length} שחקנים
        </Typography>
      </Box>

      <SquadTable
        rows={group.rows}
        columns={columns}
        showSeasonPlanStatus
      />
    </Sheet>
  )
}

export default function SeasonPlanContent({ model }) {
  const layerItems = Array.isArray(model.seasonPlanLayerSummary) ? model.seasonPlanLayerSummary : []

  const summaryItems = Array.isArray(model.seasonPlanSummary) ? model.seasonPlanSummary : []

  const groups = Array.isArray(model.squadGroups) ? model.squadGroups : []

  const columns = Array.isArray(model.columns) ? model.columns : []

  return (
    <>
      <Kpi items={summaryItems} />

      <Layers items={layerItems} />

      <Box sx={sx.tables}>
        {groups.map(group => (
          <Section
            key={group.id}
            group={group}
            columns={columns}
          />
        ))}
      </Box>
    </>
  )
}
