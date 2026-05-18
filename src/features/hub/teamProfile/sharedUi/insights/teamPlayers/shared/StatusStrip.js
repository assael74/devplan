// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/StatusStrip.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { chipsSx as sx } from './sx/chips.sx.js'

const emptyArray = []

export default function StatusStrip({
  items = emptyArray,
}) {
  const safeItems = Array.isArray(items)
    ? items.filter(item => item && item.label)
    : emptyArray

  if (!safeItems.length) return null

  return (
    <Box sx={sx.statusStrip}>
      {safeItems.map(item => (
        <Chip
          key={item.id || item.label}
          size="sm"
          variant="soft"
          color={item.color || 'neutral'}
          sx={sx.statusChip}
        >
          {item.label}
        </Chip>
      ))}
    </Box>
  )
}
