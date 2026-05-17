// teamProfile/sharedUi/insights/teamPlayers/components/RangeIndicator.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { indicatorSx as sx } from './sx/indicator.sx.js'

const statusPosition = {
  under: '12%',
  ok: '50%',
  over: '88%',
  keyOverload: '88%',
  warning: '50%',
  neutral: '50%',
}

const statusColor = {
  under: 'warning.500',
  ok: 'success.500',
  over: 'danger.500',
  keyOverload: 'danger.500',
  warning: 'warning.500',
  neutral: 'neutral.400',
}

export default function RangeIndicator({
  status = 'neutral',
}) {
  const position = statusPosition[status] || statusPosition.neutral
  const color = statusColor[status] || statusColor.neutral

  return (
    <Box sx={sx.indicatorRoot}>
      <Box sx={sx.indicatorTrack}>
        <Box sx={{ ...sx.indicatorZone, ...sx.indicatorZoneLeft }} />
        <Box sx={{ ...sx.indicatorZone, ...sx.indicatorZoneMid }} />
        <Box sx={{ ...sx.indicatorZone, ...sx.indicatorZoneRight }} />

        <Box
          sx={sx.indicatorMarker({
            status,
            position,
            color,
          })}
        />
      </Box>

      <Box sx={sx.indicatorLabels}>
        <Typography level="body-xs" sx={sx.indicatorLabel}>
          חסר
        </Typography>

        <Typography
          level="body-xs"
          sx={{
            ...sx.indicatorLabel,
            ...sx.indicatorLabelCenter,
          }}
        >
          תקין
        </Typography>

        <Typography
          level="body-xs"
          sx={{
            ...sx.indicatorLabel,
            ...sx.indicatorLabelEnd,
          }}
        >
          עומס
        </Typography>
      </Box>
    </Box>
  )
}
