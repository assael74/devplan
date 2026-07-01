// src/features/bulkActions/players/delete/components/PlayersBulkDeleteSummary.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { playersDeleteModalSx as sx } from './sx/playersDeleteModal.sx.js'

const items = [
  { key: 'totalPlayers', label: 'שחקנים' },
  { key: 'withPhoto', label: 'עם תמונה' },
  { key: 'withParents', label: 'עם פרטי הורים' },
  { key: 'withAbilities', label: 'עם יכולות' },
  { key: 'withStats', label: 'עם ביצועים' },
]

export default function PlayersBulkDeleteSummary({ summary = {} }) {
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
