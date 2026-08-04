// src/features/hub/controlCenter/shared/KpiCard.js

import React from 'react'
import { Sheet, Typography } from '@mui/joy'

export default function KpiCard({ item, compact = false }) {
  if (!item) return null

  return (
    <Sheet
      variant="outlined"
      sx={{
        minWidth: compact ? 148 : 0,
        minHeight: compact ? 82 : 92,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 0.45,
        p: compact ? 1 : 1.15,
        borderRadius: 10,
        borderColor: 'divider',
        bgcolor: 'background.surface',
      }}
    >
      <Typography
        level="body-xs"
        sx={{
          color: 'text.tertiary',
          fontWeight: 500,
        }}
      >
        {item.label}
      </Typography>

      <Typography
        level={compact ? 'title-lg' : 'h4'}
        sx={{
          fontWeight: 700,
          lineHeight: 1.05,
          color: 'text.primary',
        }}
      >
        {item.value}
      </Typography>

      <Typography
        level="body-xs"
        sx={{
          color: 'text.tertiary',
          fontWeight: 400,
          lineHeight: 1.25,
        }}
      >
        {item.secondary}
      </Typography>
    </Sheet>
  )
}
