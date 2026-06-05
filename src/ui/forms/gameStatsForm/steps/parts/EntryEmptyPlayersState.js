// src/ui/forms/gameStatsForm/steps/parts/EntryEmptyPlayersState.js

import React from 'react'
import {
  Box,
  Sheet,
  Typography,
} from '@mui/joy'

import { entryStepSx as sx } from '../sx/entryStep.sx.js'

// אחריות:
// תצוגת מצב ריק בשלב מילוי הסטטיסטיקה.

export function EntryEmptyPlayersState() {
  return (
    <Box sx={sx.stepContent}>
      <Typography level="title-sm">
        מילוי נתונים
      </Typography>

      <Sheet variant="outlined" sx={sx.placeholder}>
        <Typography level="body-sm" color="neutral">
          לא נבחרו שחקנים. חזור לשלב שחקנים ובחר לפחות שחקן אחד.
        </Typography>
      </Sheet>
    </Box>
  )
}
