// ui/patterns/insights/ui/InsightTooltip.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { insightTooltipSx as sx } from './sx/insightTooltip.sx.js'

export default function InsightTooltip({
  title = 'מידע',
  rows = [],
}) {
  const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : []

  return (
    <Box sx={sx.root}>
      <Typography level="body-sm" sx={sx.title}>
        {title}
      </Typography>

      {safeRows.length ? (
        <Box sx={sx.rows}>
          {safeRows.map((row) => (
            <Typography
              key={row.id || row.label}
              level="body-xs"
              sx={sx.row}
            >
              • {row.label}: {row.value}
            </Typography>
          ))}
        </Box>
      ) : null}
    </Box>
  )
}
