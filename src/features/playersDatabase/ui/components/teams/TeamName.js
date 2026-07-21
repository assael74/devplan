// features/playersDatabase/ui/components/teams/TeamName.js

import * as React from 'react'
import { Box, Typography } from '@mui/joy'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const clean = value => String(value ?? '').trim()

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
    <Box sx={{
      minWidth: 0,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.75,
      maxWidth: '100%',
    }}>
      <Typography
        component='span'
        sx={{
          minWidth: 0,
          color: devPlanColors.primaryDark,
          fontSize,
          fontWeight: 700,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...nameSx,
        }}
      >
        {name || '-'}
      </Typography>

      {slotColor ? (
        <Box
          component='span'
          sx={{
            minWidth: fontSize + 10,
            height: fontSize + 8,
            px: 0.65,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: 6,
            bgcolor: slotColor.bg,
            border: `1px solid ${slotColor.border}`,
            color: slotColor.text,
            fontSize: Math.max(fontSize - 1, 11),
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {slotNumber}
        </Box>
      ) : null}
    </Box>
  )
}
