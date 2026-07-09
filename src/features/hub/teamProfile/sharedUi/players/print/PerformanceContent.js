// src/features/hub/teamProfile/sharedUi/players/print/PerformanceContent.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import {
  PlayerCell,
  PositionChips,
  TableColumns,
  TableHead,
} from './ReportParts.js'

import { sharedSx } from './sx/shared.sx.js'
import { perfSx as sx } from './sx/perf.sx.js'

const TONES = {
  goals: {
    bg: 'rgba(34, 197, 94, 0.12)',
    text: '#14532d',
    border: 'rgba(34, 197, 94, 0.3)',
    icon: '#16a34a',
  },
  assists: {
    bg: 'rgba(59, 130, 246, 0.11)',
    text: '#1e3a8a',
    border: 'rgba(59, 130, 246, 0.28)',
    icon: '#2563eb',
  },
  minutes: {
    bg: 'rgba(99, 102, 241, 0.1)',
    text: '#312e81',
    border: 'rgba(99, 102, 241, 0.26)',
    icon: '#4f46e5',
  },
  defense: {
    bg: 'rgba(249, 115, 22, 0.1)',
    text: '#7c2d12',
    border: 'rgba(249, 115, 22, 0.26)',
    icon: '#ea580c',
  },
  neutral: {
    bg: 'rgba(100, 116, 139, 0.08)',
    text: '#334155',
    border: 'rgba(100, 116, 139, 0.2)',
    icon: '#64748b',
  },
}

function MetricChip({ item }) {
  const tone = TONES[item.metricKey] || TONES.neutral

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({
        id: item.icon,
        sx: { color: tone.icon },
      })}
      sx={sx.metricChip({ tone })}
    >
      {item.value}
    </Chip>
  )
}

function Metrics({ items = [] }) {
  if (!items.length) return null

  return (
    <Box sx={sx.metricChips}>
      {items.map(item => (
        <MetricChip key={item.key} item={item} />
      ))}
    </Box>
  )
}

function TopItems({ items = [] }) {
  return (
    <Box sx={sx.performanceTopItems}>
      {items.map(item => (
        <Chip
          key={item.key}
          size='sm'
          variant='soft'
          color={item.tone || 'neutral'}
          startDecorator={iconUi({ id: item.icon })}
          sx={[
            sx.performanceTopChip,
            item.iconOnly ? sx.performanceIconChip : null,
          ]}
        >
          {item.iconOnly ? null : item.label}
        </Chip>
      ))}
    </Box>
  )
}

function Row({ row }) {
  const positions = row.mainPosition ? [row.mainPosition] : []

  return (
    <Box component='tr' className='dpPrintRow'>
      <Box component='td' sx={[sharedSx.td, sharedSx.indexTd]}>
        {row.index}
      </Box>

      <Box component='td' sx={[sharedSx.td, sharedSx.middleTd]}>
        <PlayerCell row={row} />
      </Box>

      <Box component='td' sx={[sharedSx.td, sharedSx.middleTd]}>
        <PositionChips positions={positions} />
      </Box>

      <Box component='td' sx={sharedSx.td}>
        <Metrics items={row.targets} />
      </Box>

      <Box component='td' sx={[sharedSx.td, sharedSx.middleTd]}>
        <TopItems items={row.performanceTopItems} />
      </Box>

      <Box component='td' sx={sharedSx.td}>
        <Metrics items={row.stats} />
      </Box>
    </Box>
  )
}

export default function PerformanceContent({ model }) {
  const rows = model.rows || []
  const columns = model.columns || []

  return (
    <Box sx={sx.tableWrap}>
      <Box component='table' sx={sharedSx.table}>
        <TableColumns columns={columns} />
        <TableHead columns={columns} />

        <Box component='tbody'>
          {rows.map(row => (
            <Row key={row.id} row={row} />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
