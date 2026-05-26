// features/insightsHub/performance/components/blocks/PerformanceFormulaCard.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  blocksSx,
} from './sx/blocks.sx.js'

export default function PerformanceFormulaCard({ item }) {
  return (
    <Box sx={blocksSx.formulaCard}>
      <Typography level="title-sm" sx={{ fontWeight: 700 }}>
        {item.title}
      </Typography>

      <Typography level="body-md" sx={blocksSx.formulaText}>
        {item.formula}
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
        {item.text}
      </Typography>
    </Box>
  )
}
