// ui/patterns/insights/InsightsSection.js

import React from 'react'
import { Box, Divider, Typography } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'
import { insightsPatternSx as sx } from './sx/insights.sx.js'

export default function InsightsSection({
  title,
  icon = 'insights',
  children,
}) {
  return (
    <Box sx={sx.sectionBlock}>
      <Box sx={sx.sectionHead}>
        <Box sx={sx.sectionIcon}>{iconUi({ id: icon })}</Box>

        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Box>

      <Divider sx={{ my: 0.1 }} />

      {children}
    </Box>
  )
}
