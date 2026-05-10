// teamProfile/sharedUi/insights/teamGames/sections/shared/EmptyStateView.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

function getRootSx(sx, mode) {
  if (mode === 'card') return sx.cardBody
  return sx.emptyState
}

function getTextSx(sx, mode) {
  if (mode === 'card') return sx.subTextBottom
  return sx.subText
}

export default function EmptyStateView({ model, sx, mode = 'card' }) {
  return (
    <Box sx={getRootSx(sx, mode)}>
      <Typography level="title-sm" sx={sx.emptyTitle}>
        {model?.title || 'אין נתונים'}
      </Typography>

      {mode === 'card' ? <Box /> : null}

      {model?.text ? (
        <Typography level="body-xs" sx={getTextSx(sx, mode)}>
          {model.text}
        </Typography>
      ) : null}
    </Box>
  )
}
