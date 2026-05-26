// features/insightsHub/performance/components/blocks/PerformanceCaseCard.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  blocksSx,
} from './sx/blocks.sx.js'

export default function PerformanceCaseCard({ item }) {
  return (
    <Box sx={blocksSx.caseCard}>
      <Typography level="title-sm" sx={{ fontWeight: 700 }}>
        {item.title}
      </Typography>

      {item.meta ? (
        <Typography level="body-xs" sx={{ color: 'text.tertiary', lineHeight: 1.6 }}>
          {item.meta}
        </Typography>
      ) : null}

      <Typography level="h3" sx={{ fontWeight: 700 }}>
        {item.rating}
      </Typography>

      <Typography level="body-sm" sx={blocksSx.formulaText}>
        {item.formula}
      </Typography>

      <Typography level="body-sm" sx={{ fontWeight: 700 }}>
        {item.result}
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
        {item.text}
      </Typography>
    </Box>
  )
}
