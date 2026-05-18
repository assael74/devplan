// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/SelectableChips.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { chipsSx as sx } from './sx/chips.sx.js'

const emptyArray = []

export default function SelectableChips({
  items = emptyArray,
  color = 'success',
  getLabel,
  onSelect,
}) {
  const safeItems = Array.isArray(items) ? items : emptyArray

  if (!safeItems.length) return null

  return (
    <Box sx={sx.selectableChips}>
      {safeItems.map(item => {
        const label = typeof getLabel === 'function'
          ? getLabel(item)
          : item.label

        return (
          <Chip
            key={item.id || label}
            size="sm"
            variant="soft"
            color={item.color || color}
            onClick={() => {
              if (typeof onSelect === 'function') {
                onSelect(item)
              }
            }}
            sx={sx.selectableChip}
          >
            {label}
          </Chip>
        )
      })}
    </Box>
  )
}
