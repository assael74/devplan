// src/ui/forms/gameStatsForm/steps/SummaryStep.js

import React from 'react'
import {
  Box,
  Sheet,
  Typography,
} from '@mui/joy'

import { summaryStepSx as sx } from './sx/summaryStep.sx.js'

import {
  buildEntryFields,
  buildStatsSummaryRows,
  buildStatsSummaryTotals,
  getVisibleParms,
  isLockedSummaryRow,
} from '../logic/index.js'

import { SummaryPlayerRow } from './parts/SummaryPlayerRow.js'
import { SummaryTotals } from './parts/SummaryTotals.js'

// אחריות:
// Step הסיכום של טופס יצירת סטטיסטיקה.

export function SummaryStep({ draft, onDraft, onStep }) {
  const selectedParmIds = draft && Array.isArray(draft.selectedParmIds)
    ? draft.selectedParmIds
    : []

  const visibleParms = getVisibleParms(selectedParmIds)
  const fields = buildEntryFields(visibleParms)

  const summaryRows = buildStatsSummaryRows({ draft, fields })
  const totals = buildStatsSummaryTotals(summaryRows)

  const openPlayer = playerId => {
    onDraft({ activePlayerId: playerId })
    onStep('entry')
  }

  return (
    <Box sx={sx.stepContent}>
      <Box>
        <Typography level="title-sm">
          סיכום סטטיסטיקה
        </Typography>

        <Typography level="body-sm" color="neutral">
          סקירה מפורטת של כל השחקנים והפרמטרים שנבחרו לפני שמירה.
        </Typography>
      </Box>

      <SummaryTotals totals={totals} />

      <Sheet variant="outlined" sx={sx.summaryDetailedList}>
        {summaryRows.map(row => (
          <SummaryPlayerRow
            key={row.playerId}
            row={row}
            draft={draft}
            fields={fields}
            locked={isLockedSummaryRow({ row, draft })}
            onOpenPlayer={openPlayer}
          />
        ))}
      </Sheet>
    </Box>
  )
}
