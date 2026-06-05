// src/ui/forms/gameStatsForm/steps/parts/SummaryPlayerRow.js

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import { summaryStepSx as sx } from '../sx/summaryStep.sx.js'
import playerImage from '../../../../core/images/playerImage.jpg'
import { iconUi } from '../../../../core/icons/iconUi.js'

import {
  getSummaryFieldLabel,
  getSummaryFieldType,
  getSummaryFieldValue,
  getSummaryRowStats,
} from '../../logic/index.js'

// אחריות:
// תצוגת שורת שחקן בסיכום טופס הסטטיסטיקה.

function PlayerInfoCell({ row }) {
  const photo = row.photo || playerImage
  const icon = row.isStarting ? 'isStart' : 'isSquad'

  return (
    <Box sx={sx.summaryPlayerInfo}>
      <Avatar src={photo} sx={{ width: 26, height: 26 }} />

      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-sm" fontWeight={700} noWrap>
          {row.name}
        </Typography>

        <Typography level="body-xs" color="neutral" startDecorator={iconUi({ id: icon })}>
          {row.isStarting ? 'הרכב' : 'ספסל'} · {row.timePlayed || 0} דק׳
        </Typography>
      </Box>
    </Box>
  )
}

function StatusCell({ row, locked }) {
  const color = row.isComplete
    ? 'success'
    : row.isPartial
      ? 'warning'
      : 'neutral'

  return (
    <Box sx={sx.summaryStatusCell}>
      {locked ? (
        <Chip size="sm" variant="soft" color="warning">
          נעול
        </Chip>
      ) : null}

      <Chip size="sm" variant="soft" color={color}>
        {row.filled}/{row.total}
      </Chip>

      <Typography level="body-xs" color="neutral">
        {row.rate}%
      </Typography>
    </Box>
  )
}

function SummaryFieldCell({ field, rowStats }) {
  const value = getSummaryFieldValue({ field, row: rowStats })
  const isEmpty = value === '—'

  return (
    <Box sx={sx.summaryFieldCell(getSummaryFieldType(field), isEmpty)}>
      <Typography level="body-xs" sx={sx.summaryFieldLabel} noWrap>
        {getSummaryFieldLabel(field)}
      </Typography>

      <Typography level="body-sm" sx={sx.summaryFieldValue} noWrap>
        {value}
      </Typography>
    </Box>
  )
}

export function SummaryPlayerRow({ row, draft, fields, locked, onOpenPlayer }) {
  const rowStats = getSummaryRowStats({
    draft,
    playerId: row.playerId,
  })

  const handleOpen = () => {
    if (locked) return

    onOpenPlayer(row.playerId)
  }

  const handleKeyDown = event => {
    if (locked) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onOpenPlayer(row.playerId)
  }

  return (
    <Box
      role={locked ? 'presentation' : 'button'}
      tabIndex={locked ? -1 : 0}
      sx={sx.summaryDetailedRow({ locked, row })}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <PlayerInfoCell row={row} />

      <StatusCell row={row} locked={locked} />

      <Box sx={sx.summaryFieldsGrid}>
        {fields.map(field => (
          <SummaryFieldCell
            key={field.id}
            field={field}
            rowStats={rowStats}
          />
        ))}
      </Box>
    </Box>
  )
}
