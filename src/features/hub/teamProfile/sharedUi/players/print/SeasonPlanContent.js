// src/features/hub/teamProfile/sharedUi/players/print/SeasonPlanContent.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { SEASON_PLAN_LAYER_TARGETS } from '../../../../../../shared/players/players.constants.js'
import { CollapseBox } from '../../../../../../ui/patterns/collapseBox/index.js'

import {
  SEASON_PLAN_PRINT_COLUMNS,
} from '../../../sharedLogic/players/print/index.js'

import {
  SquadTable,
} from './ReportParts.js'

import { seasonPlanSx as sx } from './sx/seasonPlan.sx.js'

function cleanMobileText(value, isMobile = false) {
  if (!isMobile || !value) return value

  return String(value)
    .replace(/\s*שחקנים\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function getColumns(model = {}) {
  const columns = Array.isArray(model.columns) ? model.columns : []
  const resolvedColumns = columns.length ? columns : SEASON_PLAN_PRINT_COLUMNS

  if (!model.isMobile) {
    return resolvedColumns
  }

  return resolvedColumns
    .filter(column => column.key !== 'level')
    .map(column => {
      if (column.key !== 'positions') {
        return column
      }

      return {
        ...column,
        label: 'עמדה ראשית',
      }
    })
}

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

function StatusLine({ item, label, tone, isMobile = false }) {
  const resolvedLabel = cleanMobileText(label, isMobile)

  return (
    <Box sx={sx.seasonPlanKpiLine}>
      <Box sx={sx.seasonPlanKpiLineCopy}>
        <Typography sx={sx.seasonPlanKpiLineLabel}>
          {resolvedLabel}
        </Typography>

        <Box sx={sx.seasonPlanKpiLineIndicator}>
          <Box sx={sx.seasonPlanKpiLineIcon}>
            {iconUi({ id: item.iconId || 'players', sx: { color: item.iconColor || '#64748B' } })}
          </Box>

          <Typography sx={sx.seasonPlanKpiLineValue}>
            {item.count}
          </Typography>

          <Box sx={sx.seasonPlanKpiLineBar}>
            <Box sx={sx.seasonPlanKpiLineFill({ tone, value: item.count })} />
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
    <Box sx={sx.layerGrid}>
      {list.map(item => (
        <LayerCard key={item.value} item={item} />
      ))}
    </Box>
  )
}

function Kpi({ items = [], isMobile = false }) {
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
          <StatusLine item={planned[0]} label='שחקנים בתוכנית' tone='good' isMobile={isMobile} />
          <StatusLine item={planned[1]} label='שחקנים שרוצים לעזוב' tone='warn' isMobile={isMobile} />
          <StatusLine item={planned[2]} label='שחקנים בהתלבטות' tone='neutral' isMobile={isMobile} />
        </Box>
      </Sheet>

      <Sheet variant='outlined' sx={[sx.seasonPlanKpiCard, sx.seasonPlanKpiMid]}>
        <Box sx={sx.seasonPlanKpiCardHeader}>
          <Typography sx={sx.seasonPlanKpiCardTitle}>
            בתהליך בחינה
          </Typography>

          <Typography sx={sx.seasonPlanKpiCardChip}>
            {reviewTotal}
          </Typography>
        </Box>

        <Box sx={sx.seasonPlanKpiLinesInlineTwo}>
          <StatusLine item={review[0]} label='בבחינה' tone='good' isMobile={isMobile} />
          <StatusLine item={review[1]} label='לא נבחן' tone='neutral' isMobile={isMobile} />
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
          <StatusLine item={notSuitable} label='לא מתאים מקצועית' tone='bad' isMobile={isMobile} />
        </Box>
      </Sheet>
    </Box>
  )
}

function Section({ group, columns, isMobile = false, presentation = 'pdf', defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen)
  const isPdf = presentation === 'pdf'
  const title = cleanMobileText(group.title, isMobile)
  const subtitle = cleanMobileText(group.subtitle, isMobile)
  const countLabel = isMobile ? group.rows.length : `${group.rows.length} שחקנים`

  if (!group.rows.length) return null

  return (
    <CollapseBox
      open={isPdf || open}
      onToggle={() => {
        if (isPdf) return

        setOpen(prev => !prev)
      }}
      rootSx={sx.tableSection({ topMargin: group.id === 'notSuitable' ? 0.5 : 0.5 })}
      headerSx={sx.collapseHeader({ tone: group.tone, presentation })}
      title={title}
      subtitle={subtitle}
      endSlot={(
        <Typography sx={sx.tableSectionCount({ tone: group.tone })}>
          {countLabel}
        </Typography>
      )}
    >
      <SquadTable
        rows={group.rows}
        columns={columns}
        showSeasonPlanStatus
        isMobile={isMobile}
      />
    </CollapseBox>
  )
}

export default function SeasonPlanContent({ model }) {
  const isPdf = model.presentation === 'pdf'
  const layerItems = Array.isArray(model.summary?.layers) ? model.summary.layers : []
  const summaryItems = Array.isArray(model.summary?.status) ? model.summary.status : []
  const groups = Array.isArray(model.sections) ? model.sections : []
  const columns = getColumns(model)

  const [layersOpen, setLayersOpen] = React.useState(isPdf)

  return (
    <>
      <Kpi items={summaryItems} isMobile={model.isMobile} />

      <CollapseBox
        open={layersOpen}
        onToggle={() => {
          if (isPdf) return

          setLayersOpen(prev => !prev)
        }}
        rootSx={sx.collapseSection({ mt: 1 })}
        headerSx={sx.collapseHeader({ tone: 'team', presentation: model.presentation })}
        title='תכנון לעונה לפי חוליות'
        subtitle='חלוקה ראשונית לפי קווי משחק'
      >
        <Layers items={layerItems} />
      </CollapseBox>

      <Box sx={sx.tables}>
        {groups.map((group, index) => (
          <Section
            key={group.id}
            group={group}
            columns={columns}
            isMobile={model.isMobile}
            presentation={model.presentation}
            defaultOpen={index === 0}
          />
        ))}
      </Box>
    </>
  )
}
