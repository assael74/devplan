// src/ui/forms/gameStatsForm/steps/parts/SummaryTotals.js

import React from 'react'
import { Chip, Sheet } from '@mui/joy'

import { summaryStepSx as sx } from '../sx/summaryStep.sx.js'

// אחריות:
// תצוגת סיכום מספרי על מילוי טופס הסטטיסטיקה.

export function SummaryTotals({ totals }) {
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
