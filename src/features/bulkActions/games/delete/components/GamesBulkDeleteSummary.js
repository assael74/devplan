// src/features/bulkActions/games/delete/components/GamesBulkDeleteSummary.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { gamesDeleteModalSx as sx } from '../sx/gamesDeleteModal.sx.js'

const items = [
  {
    key: 'totalGames',
    label: 'משחקים',
  },
  {
    key: 'withStats',
    label: 'עם סטטיסטיקה',
  },
  {
    key: 'withVideo',
    label: 'עם וידאו',
  },
  {
    key: 'officialGames',
    label: 'רשמיים',
  },
  {
    key: 'trainingGames',
    label: 'אימונים',
  },
]

export default function GamesBulkDeleteSummary({ summary = {} }) {
  return (
    <Box sx={sx.summaryGrid}>
      {items.map(item => (
        <Box key={item.key} sx={sx.summaryCard}>
          <Typography level="body-xs" color="neutral">
            {item.label}
          </Typography>

          <Typography level="h3">
            {summary[item.key] || 0}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
