// src/ui/forms/gameStatsForm/steps/SummaryStep.js

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  Sheet,
  Typography,
} from '@mui/joy'

import { summaryStepSx as sx } from './sx/summaryStep.sx.js'
import playerImage from '../../../core/images/playerImage.jpg'
import { iconUi } from '../../../core/icons/iconUi.js'

import {
  buildEntryFields,
  buildStatsSummaryRows,
  buildStatsSummaryTotals,
  getVisibleParms,
} from '../logic/index.js'

function SummaryTotals({ totals }) {
  return (
    <Sheet variant="outlined" sx={sx.summaryStatsCard}>
      <Chip size="sm" variant="soft" color="primary">
        השלמה {totals.completionRate}%
      </Chip>

      <Chip size="sm" variant="soft" color="success">
        מלאים {totals.completedPlayers}/{totals.totalPlayers}
      </Chip>

      <Chip size="sm" variant="soft" color="warning">
        חלקיים {totals.partialPlayers}
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        ריקים {totals.emptyPlayers}
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        שדות {totals.filledFields}/{totals.totalFields}
      </Chip>
    </Sheet>
  )
}

function SummaryPlayerRow({ row, onOpenPlayer }) {
  const photo = row?.photo || playerImage
  const icon = row?.isStarting ? 'isStart' : 'isSquad'
  const color = row.isComplete
    ? 'success'
    : row.isPartial
      ? 'warning'
      : 'neutral'

  return (
    <Box
      role="button"
      tabIndex={0}
      sx={sx.summaryPlayerRow(row)}
      onClick={() => onOpenPlayer(row.playerId)}
      onKeyDown={event => {
        if (event.key === 'Enter') onOpenPlayer(row.playerId)
      }}
    >
      <Box>
        <Box sx={sx.summaryPlayerTitle}>
          <Avatar src={photo} sx={{ width: 20, height: 20 }} />

          <Typography level="body-sm" fontWeight={700}>
            {row.name}
          </Typography>
        </Box>

        <Typography level="body-xs" color="neutral" startDecorator={iconUi({ id: icon })}>
          {row.isStarting ? 'הרכב' : 'ספסל'} · {row.timePlayed || 0} דק׳
        </Typography>
      </Box>

      <Box sx={sx.summaryRowRight}>
        <Chip size="sm" variant="soft" color={color}>
          {row.filled}/{row.total}
        </Chip>

        <Typography level="body-xs" color="neutral">
          {row.rate}%
        </Typography>
      </Box>
    </Box>
  )
}

export function SummaryStep({ draft, onDraft, onStep }) {
  const selectedParmIds = draft?.selectedParmIds || []
  const visibleParms = getVisibleParms(selectedParmIds)
  const fields = buildEntryFields(visibleParms)

  const summaryRows = buildStatsSummaryRows({ draft, fields })
  const totals = buildStatsSummaryTotals(summaryRows)

  const openPlayer = playerId => {
    onDraft({ activePlayerId: playerId })
    onStep?.('entry')
  }

  return (
    <Box sx={sx.stepContent}>
      <Box>
        <Typography level="title-sm">
          סיכום מילוי
        </Typography>

        <Typography level="body-sm" color="neutral">
          בדוק מי מולא, מי חסר, ואיפה יש מילוי חלקי לפני שמירה.
        </Typography>
      </Box>

      <SummaryTotals totals={totals} />

      <Sheet variant="outlined" sx={sx.summaryList}>
        {summaryRows.map(row => (
          <SummaryPlayerRow
            key={row.playerId}
            row={row}
            onOpenPlayer={openPlayer}
          />
        ))}
      </Sheet>
    </Box>
  )
}
