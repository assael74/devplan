// teamProfile/sharedUi/insights/teamPlayers/cards/RoleRangeIndicator.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { indicSx as sx } from './sx/indicator.sx'

const statusPosition = {
  under: '12%',
  ok: '50%',
  over: '88%',
  keyOverload: '88%',
  warning: '50%',
  neutral: '50%',
}

const statusLabel = {
  under: 'חסר',
  ok: 'בטווח',
  over: 'עומס',
  keyOverload: 'ריבוי מפתח',
  warning: 'בדיקה',
  neutral: 'ללא הערכה',
}

const statusColor = {
  under: 'warning.500',
  ok: 'success.500',
  over: 'danger.500',
  keyOverload: 'danger.500',
  warning: 'warning.500',
  neutral: 'neutral.400',
}

export default function RoleRangeIndicator({ status = 'neutral', showStatus = false }) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.track}>
        <Box sx={{ ...sx.zone, ...sx.zoneLeft }} />
        <Box sx={{ ...sx.zone, ...sx.zoneMid }} />
        <Box sx={{ ...sx.zone, ...sx.zoneRight }} />
        <Box sx={sx.marker(status)} />
      </Box>

      <Box sx={sx.labels}>
        <Typography level="body-xs" sx={sx.label}>
          חסר
        </Typography>

        <Typography level="body-xs" sx={{ ...sx.label, ...sx.labelCenter }}>
          תקין
        </Typography>

        <Typography level="body-xs" sx={{ ...sx.label, ...sx.labelEnd }}>
          עומס
        </Typography>
      </Box>

      {showStatus ? (
        <Typography level="body-xs" sx={sx.status(status)}>
          {statusLabel[status] || statusLabel.neutral}
        </Typography>
      ) : null}
    </Box>
  )
}
