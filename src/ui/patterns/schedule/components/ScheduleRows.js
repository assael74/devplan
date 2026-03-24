// ui/patterns/schedule/components/ScheduleRows.js

import React from 'react'
import { Box, Chip, Sheet, Typography, Tooltip, IconButton } from '@mui/joy'
import { scheduleWeekBlockSx as sx } from '../sx/scheduleWeekBlock.sx.js'
import { iconUi } from '../../../core/icons/iconUi.js'
import {
  getCompactTrainingLabel,
  getCompactTrainingSubLabel,
} from '../logic/schedule.logic.js'

export function EmptyScheduleRow({ row, mode = 'profile' }) {
  return (
    <Sheet variant="plain" sx={sx.emptyRow(mode)}>
      <Box sx={sx.rowMain}>
        <Chip size="sm" variant="soft" color="neutral" sx={sx.dayChipEmpty(mode)}>
          {row?.dayLabel ? `יום ${row.dayLabel}` : '—'}
        </Chip>

        <Box sx={sx.rowText}>
          <Typography level="body-sm" sx={sx.emptyRowPrimary(mode)} noWrap>
            אין אימון
          </Typography>

          <Typography level="body-xs" sx={sx.emptyRowSecondary(mode)} noWrap>
            יום פנוי
          </Typography>
        </Box>
      </Box>
    </Sheet>
  )
}

export function ActiveScheduleRow({ row, mode = 'profile', onRowClick }) {
  return (
    <Sheet variant="plain" sx={sx.row(mode)}>
      <Box sx={sx.rowMain}>
        <Chip size="sm" variant="solid" sx={sx.dayChip}>
          {row?.dayLabel ? `יום ${row.dayLabel}` : '—'}
        </Chip>

        <Box sx={sx.rowText}>
          <Typography level="body-sm" sx={sx.rowPrimary(mode)} noWrap>
            {getCompactTrainingLabel(row)}
          </Typography>

          <Typography level="body-xs" sx={sx.rowSecondary(mode)} noWrap>
            {getCompactTrainingSubLabel(row) || '—'}
          </Typography>
        </Box>
      </Box>

      <Chip
        size="sm"
        variant="soft"
        color={row?.statusColor || 'primary'}
        sx={sx.statusChip(mode)}
      >
        {row?.statusLabel || 'מתוכנן'}
      </Chip>

      <Tooltip title="עריכת יום האימון">
        <IconButton
          size="sm"
          variant="plain"
          onClick={(e) => {
            e.stopPropagation()
            onRowClick(row)
          }}
        >
          {iconUi({ id: 'more' })}
        </IconButton>
      </Tooltip>
    </Sheet>
  )
}

export function ScheduleRow({ row, mode = 'profile', onRowClick }) {
  if (row?.isEmpty) return <EmptyScheduleRow row={row} mode={mode} />
  return <ActiveScheduleRow row={row} mode={mode} onRowClick={onRowClick} />
}
