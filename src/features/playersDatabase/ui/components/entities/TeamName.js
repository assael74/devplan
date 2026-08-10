// src/features/playersDatabase/ui/components/entities/TeamName.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { teamNameSx as sx } from './sx/teamName.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const resolveSlotColor = slot => {
  if (slot === 2) {
    return {
      bg: '#FBF3E6',
      border: '#F0B35B',
      text: '#B36B00',
    }
  }

  if (slot === 3) {
    return {
      bg: '#FEF2F2',
      border: '#FCA5A5',
      text: '#B91C1C',
    }
  }

  return null
}

const stripSlotSuffix = (name, slot) => {
  if (slot <= 1) return clean(name)

  return clean(name).replace(new RegExp(`\\s+${slot}$`), '').trim()
}

export default function TeamName({
  value = '',
  slot = 1,
  fontSize = 14,
  nameSx,
}) {
  const slotNumber = Number(slot) || 1
  const slotColor = resolveSlotColor(slotNumber)
  const name = stripSlotSuffix(value, slotNumber)

  return (
    <Box sx={sx.root}>
      <Typography
        component='span'
        sx={[sx.name(fontSize), nameSx]}
      >
        {name || '-'}
      </Typography>

      {slotColor ? (
        <Box
          component='span'
          sx={sx.slot({
            fontSize,
            slotColor,
          })}
        >
          {slotNumber}
        </Box>
      ) : null}
    </Box>
  )
}
