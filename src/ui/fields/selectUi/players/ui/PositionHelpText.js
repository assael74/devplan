// ui/fields/selectUi/players/ui/PositionHelpText.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { sx } from '../sx/playerPositions.sx.js'

export default function PositionHelpText({
  hasPositions,
  hasPrimary,
}) {
  return (
    <Box sx={sx.helper}>
      {hasPositions && !hasPrimary ? (
        <Typography level="body-xs" sx={sx.helperWarning}>
          לא הוגדרה עמדה ראשית. לחץ על אחת העמדות המסומנות כדי להגדיר.
        </Typography>
      ) : hasPositions ? (
        <Typography level="body-xs" sx={sx.helperText}>
          לחיצה על עמדה מסומנת מגדירה אותה כעמדה ראשית.
        </Typography>
      ) : null}
    </Box>
  )
}
