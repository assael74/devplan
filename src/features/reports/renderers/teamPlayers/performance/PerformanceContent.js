// src/features/hub/teamProfile/sharedUi/players/print/performance/PerformanceContent.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  PERFORMANCE_PRINT_COLUMNS,
} from '../../../model/teams/players/print/index.js'

import {
  PlayerCell,
  PositionChips,
  TableColumns,
  TableHead,
} from '../ReportParts.js'

import {
  getPerformanceSx,
  PERFORMANCE_TONES,
} from './performance.sx.js'

function MetricChip({ item, sx }) {
  const tone = PERFORMANCE_TONES[item.metricKey] || PERFORMANCE_TONES.neutral

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({id: item.icon, sx: { color: tone.icon }, })}
      sx={sx.metricChip({ tone })}
    >
      {item.value}
    </Chip>
  )
}

function Metrics({ items = [], sx }) {
  if (!items.length) return null

  return (
    <Box sx={sx.metricChips}>
      {items.map(item => (
        <MetricChip
          key={item.key}
          item={item}
          sx={sx}
        />
      ))}
    </Box>
  )
}

function PerformanceItems({ items = [], sx }) {
  return (
    <Box sx={sx.performanceItems}>
      {items.map(item => (
        <Chip
          key={item.key}
          size='sm'
          variant='soft'
          color={item.tone || 'neutral'}
          startDecorator={iconUi({ id: item.icon })}
          sx={[
            sx.performanceChip,
            item.iconOnly ? sx.performanceIconChip : null,
          ]}
        >
          {item.iconOnly ? null : item.label}
        </Chip>
      ))}
    </Box>
  )
}

function Row({ row, columns, sx }) {
  return (
    <Box component='tr' className='dpPrintRow'>
      {columns.map(column => (
        <Box
          key={column.key}
          component='td'
          sx={[
            sx.td,
            column.key === 'index' ? sx.indexTd : null,
            column.key === 'player' ||
            column.key === 'position' ||
            column.key === 'performance' ? sx.middleTd : null,
          ]}
        >
          {column.key === 'index' && row.index}

          {column.key === 'player' && (
            <PlayerCell row={row} styles={sx} />
          )}

          {column.key === 'position' && (
            <PositionChips
              positions={[row.mainPosition].filter(Boolean)}
              styles={sx}
            />
          )}

          {column.key === 'targets' && (
            <Metrics items={row.targets} sx={sx} />
          )}

          {column.key === 'performance' && (
            <PerformanceItems
              items={row.performanceTopItems}
              sx={sx}
            />
          )}

          {column.key === 'stats' && (
            <Metrics items={row.stats} sx={sx} />
          )}
        </Box>
      ))}
    </Box>
  )
}

export default function PerformanceContent({ model, presentation, device }) {
  const sx = getPerformanceSx({presentation, device})

  const sectionRows = model.sections?.[0]?.rows

  const rows = Array.isArray(sectionRows) ? sectionRows : Array.isArray(model.rows) ? model.rows : []

  const columns = Array.isArray(model.columns) && model.columns.length ? model.columns : PERFORMANCE_PRINT_COLUMNS

  return (
    <Box sx={sx.tableWrap}>
      <Box component='table' sx={sx.table}>
        <TableColumns columns={columns} />
        <TableHead columns={columns} styles={sx} />

        <Box component='tbody'>
          {rows.map(row => (
            <Row
              key={row.id}
              row={row}
              columns={columns}
              sx={sx}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
