//  teamProfile/mobile/modules/trainings/components/TrainingsRows.js

import React from 'react'
import { Box, Chip, IconButton, Sheet, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import {
  getCompactTrainingLabel,
  getCompactTrainingSubLabel,
} from './../../../../sharedLogic'

import { rowsSx as sx } from '../sx/rows.sx.js'

function EmptyRow({ row, mode = 'profile' }) {
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

function ActiveRow({ row, mode = 'profile', onRowClick }) {
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
            if (onRowClick) onRowClick(row)
          }}
        >
          {iconUi({ id: 'more' })}
        </IconButton>
      </Tooltip>
    </Sheet>
  )
}

export default function TrainingsRows({
  rows = [],
  mode = 'profile',
  onRowClick,
}) {
  const items = Array.isArray(rows) ? rows : []
  const hasRows = items.length > 0

  if (!hasRows) {
    return (
      <Box sx={sx.emptyWrap(mode)}>
        <Box sx={sx.empty}>
          <Typography level="body-sm" sx={{ fontWeight: 700 }}>
            אין אימונים להצגה
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.25 }}>
            המערכת לא זיהתה ימים רלוונטיים לשבוע זה.
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={sx.rows(mode)}>
      {items.map((row, index) => {
        const key = row?.id || row?.dayKey || row?.dayLabel || `training-row-${index}`

        return row?.isEmpty ? (
          <EmptyRow key={key} row={row} mode={mode} />
        ) : (
          <ActiveRow key={key} row={row} mode={mode} onRowClick={onRowClick} />
        )
      })}
    </Box>
  )
}
