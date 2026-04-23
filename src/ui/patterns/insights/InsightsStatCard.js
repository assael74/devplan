// ui/patterns/insights/InsightsStatCard.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'
import { insightsPatternSx as sx } from './sx/insights.sx.js'

export default function InsightsStatCard({
  title,
  value,
  sub = '',
  icon = 'insights',
}) {
  return (
    <Sheet variant="soft" sx={sx.statCard}>
      <Box sx={sx.statCardHead}>
        <Box sx={sx.iconWrap}>{iconUi({ id: icon, size: 'sm' })}</Box>

        <Typography level="title-xs" sx={{ opacity: 0.8, fontWeight: 600 }}>
          {title}
        </Typography>

        <Typography level="title-sm" sx={sx.statsValue}>
          {value}
        </Typography>
      </Box>

      {!!sub && (
        <Typography level="body-xs" sx={{ opacity: 0.65 }}>
          {sub}
        </Typography>
      )}
    </Sheet>
  )
}
