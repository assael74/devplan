// src/features/hub/teamProfile/sharedUi/players/print/seasonPlan/SeasonPlanContent.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import JoyStarRatingStatic from '../../../../../../../ui/domains/ratings/JoyStarRating.js'
import { CollapseBox } from '../../../../../../../ui/patterns/collapseBox/index.js'

import {
  SEASON_PLAN_LAYER_TARGETS,
} from '../../../../../../../shared/players/players.constants.js'

import {
  SEASON_PLAN_PRINT_COLUMNS,
} from '../../../../sharedLogic/players/print/index.js'

import {
  PlayerCell,
  PositionChips,
  TableColumns,
  TableHead,
} from '../ReportParts.js'

import {
  getSeasonPlanSx,
} from './seasonPlan.sx.js'

function cleanMobileText(value, isMobile) {
  if (!isMobile || !value) return value

  return String(value)
    .replace(/\s*שחקנים\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function getColumns(model = {}, isMobile) {
  const source = Array.isArray(model.columns) && model.columns.length ? model.columns : SEASON_PLAN_PRINT_COLUMNS

  if (!isMobile) return source

  return source
    .filter(column => column.key !== 'level')
    .map(column => {
      if (column.key !== 'positions') return column

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

function resolveLayerTone(item) {
  const count = Number(item.count) || 0

  if (item.mode === 'fixed') {
    if (count === item.target) return 'good'
    if (Math.abs(count - item.target) === 1) return 'warn'

    return 'bad'
  }

  if (item.mode === 'range') {
    if (count >= item.min && count <= item.max) return 'good'
    if (count === item.min - 1 || count === item.max + 1) return 'warn'

    return 'bad'
  }

  if (item.mode === 'min') {
    if (count >= item.target && count <= item.target + 2) return 'good'
    if (count >= item.target - 2 && count < item.target) return 'warn'

    return 'bad'
  }

  return 'neutral'
}

function SeasonPlanStatusChip({ status, sx }) {
  const iconId = status?.iconId || 'notReviewed'
  const iconColor = status?.iconColor || '#64748B'
  const label = status?.shortLabel || status?.label || 'לא נבחן'

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({id: iconId, sx: { color: iconColor }})}
      sx={sx.seasonPlanStatusChip}
    >
      {label}
    </Chip>
  )
}

function ProjectChip({ project, sx }) {
  const iconId = project?.iconId || 'noneType'
  const iconColor = project?.iconColor || '#64748B'

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({id: iconId, sx: { color: iconColor }})}
      sx={sx.projectChip}
    />
  )
}

function StatusLine({ item, label, tone, isMobile, sx }) {
  return (
    <Box sx={sx.kpiLine}>
      <Typography sx={sx.kpiLineLabel}>
        {cleanMobileText(label, isMobile)}
      </Typography>

      <Box sx={sx.kpiLineIndicator}>
        <Box sx={sx.kpiLineIcon}>
          {iconUi({id: item.iconId || 'players', sx: { color: item.iconColor || '#64748B' }})}
        </Box>

        <Typography sx={sx.kpiLineValue}>
          {item.count}
        </Typography>

        <Box sx={sx.kpiLineBar}>
          <Box sx={sx.kpiLineFill({tone, value: item.count})}/>
        </Box>
      </Box>
    </Box>
  )
}

function Kpi({ items, isMobile, sx }) {
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
    <Box sx={sx.kpiGrid}>
      <Sheet variant='outlined' sx={[sx.kpiCard, sx.kpiMain]}>
        <Box sx={sx.kpiCardHeader}>
          <Typography sx={sx.kpiCardTitle}>
            בתכנון לעונה
          </Typography>

          <Typography sx={sx.kpiCardChip}>
            {plannedTotal}
          </Typography>
        </Box>

        <Box sx={sx.kpiLinesThree}>
          <StatusLine item={planned[0]} label='שחקנים בתוכנית' tone='good' isMobile={isMobile} sx={sx} />
          <StatusLine item={planned[1]} label='שחקנים שרוצים לעזוב' tone='warn' isMobile={isMobile} sx={sx} />
          <StatusLine item={planned[2]} label='שחקנים בהתלבטות' tone='neutral' isMobile={isMobile} sx={sx} />
        </Box>
      </Sheet>

      <Sheet variant='outlined' sx={sx.kpiCard}>
        <Box sx={sx.kpiCardHeader}>
          <Typography sx={sx.kpiCardTitle}>
            בתהליך בחינה
          </Typography>

          <Typography sx={sx.kpiCardChip}>
            {reviewTotal}
          </Typography>
        </Box>

        <Box sx={sx.kpiLinesTwo}>
          <StatusLine item={review[0]} label='בבחינה' tone='good' isMobile={isMobile} sx={sx} />
          <StatusLine item={review[1]} label='לא נבחן' tone='neutral' isMobile={isMobile} sx={sx} />
        </Box>
      </Sheet>

      <Sheet variant='outlined' sx={sx.kpiCard}>
        <Box sx={sx.kpiCardHeader}>
          <Typography sx={sx.kpiCardTitle}>
            לא בתכנון
          </Typography>

          <Typography sx={sx.kpiCardChip}>
            {notSuitable.count}
          </Typography>
        </Box>

        <StatusLine item={notSuitable} label='לא מתאים מקצועית' tone='bad' isMobile={isMobile} sx={sx} />
      </Sheet>
    </Box>
  )
}

function Layers({ items, sx }) {
  const list = SEASON_PLAN_LAYER_TARGETS.map(target => {
    const summary = items.find(item => item.value === target.value)

    return {
      ...target,
      count: summary?.count || 0,
    }
  })

  return (
    <Box sx={sx.layerGrid}>
      {list.map(item => {
        const tone = resolveLayerTone(item)

        return (
          <Sheet
            key={item.value}
            variant='outlined'
            sx={sx.layerCard}
          >
            <Typography sx={sx.layerCardTitle}>
              {item.label}
            </Typography>

            <Typography sx={sx.layerCardCount({ tone })}>
              {item.count}
            </Typography>

            <Typography sx={sx.layerCardRequirement}>
              {item.requirement}
            </Typography>
          </Sheet>
        )
      })}
    </Box>
  )
}

function renderCell(column, row, isMobile, sx) {
  if (column.key === 'index') {
    return row.index
  }

  if (column.key === 'player') {
    return <PlayerCell row={row} styles={sx} />
  }

  if (column.key === 'positions') {
    const positions = isMobile ? [row.mainPosition].filter(Boolean) : row.positions

    return (
      <PositionChips positions={positions} styles={sx} />
    )
  }

  if (column.key === 'seasonPlanStatus') {
    return (
      <SeasonPlanStatusChip status={row.seasonPlanStatus} sx={sx} />
    )
  }

  if (column.key === 'level') {
    return (
      <Box sx={sx.potentialCell}>
        <JoyStarRatingStatic value={row.level} size='sm' />
      </Box>
    )
  }

  if (column.key === 'project') {
    return (
      <ProjectChip project={row.project} sx={sx} />
    )
  }

  return null
}

function SquadTable({ rows, columns, isMobile, sx }) {
  return (
    <Box component='table' sx={sx.table}>
      <TableColumns columns={columns} />
      <TableHead columns={columns} styles={sx} />

      <Box component='tbody'>
        {rows.map(row => (
          <Box
            key={row.id}
            component='tr'
            className='dpPrintRow'
          >
            {columns.map(column => (
              <Box
                key={column.key}
                component='td'
                sx={[
                  sx.td,
                  column.key === 'index' ? sx.indexTd : null,
                  column.key !== 'player' && column.key !== 'positions' ? sx.centerTd : sx.middleTd,
                ]}
              >
                {renderCell(column, row, isMobile, sx)}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function Section({
  group,
  columns,
  isMobile,
  isPdf,
  presentation,
  defaultOpen,
  sx,
}) {
  const [open, setOpen] = React.useState(defaultOpen)

  if (!group.rows.length) return null

  return (
    <CollapseBox
      open={isPdf || open}
      onToggle={() => {
        if (!isPdf) setOpen(previous => !previous)
      }}
      rootSx={sx.tableSection}
      headerSx={sx.collapseHeader({tone: group.tone, presentation})}
      title={cleanMobileText(group.title, isMobile)}
      subtitle={cleanMobileText(group.subtitle, isMobile)}
      endSlot={(
        <Typography sx={sx.sectionCount({tone: group.tone})}>
          {isMobile ? group.rows.length : `${group.rows.length} שחקנים`}
        </Typography>
      )}
    >
      <SquadTable
        rows={group.rows}
        columns={columns}
        isMobile={isMobile}
        sx={sx}
      />
    </CollapseBox>
  )
}

export default function SeasonPlanContent({ model, presentation, device }) {
  const isPdf = presentation === 'pdf'
  const isMobile = device === 'mobile'
  const sx = getSeasonPlanSx({presentation, device})

  const summaryItems = Array.isArray(model.summary?.status) ? model.summary.status : []

  const layerItems = Array.isArray(model.summary?.layers) ? model.summary.layers : []

  const groups = Array.isArray(model.sections) ? model.sections : []

  const columns = getColumns(model, isMobile)
  const [layersOpen, setLayersOpen] = React.useState(isPdf)

  return (
    <>
      <Kpi
        items={summaryItems}
        isMobile={isMobile}
        sx={sx}
      />

      <CollapseBox
        open={layersOpen}
        onToggle={() => {
          if (!isPdf) setLayersOpen(previous => !previous)
        }}
        rootSx={sx.collapseSection}
        headerSx={sx.collapseHeader({tone: 'team', presentation})}
        title='תכנון לעונה לפי חוליות'
        subtitle='חלוקה ראשונית לפי קווי משחק'
      >
        <Layers items={layerItems} sx={sx} />
      </CollapseBox>

      <Box sx={sx.tables}>
        {groups.map((group, index) => (
          <Section
            key={group.id}
            group={group}
            columns={columns}
            isMobile={isMobile}
            isPdf={isPdf}
            presentation={presentation}
            defaultOpen={index === 0}
            sx={sx}
          />
        ))}
      </Box>
    </>
  )
}
