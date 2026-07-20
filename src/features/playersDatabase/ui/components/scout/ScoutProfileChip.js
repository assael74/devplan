// features/playersDatabase/ui/components/scout/ScoutProfileChip.js

import * as React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

export const scoutProfileChipColors = {
  background: 'linear-gradient(90deg, #173B57 0%, #245F89 55%, #2F86C7 100%)',
  text: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.18)',
  shadow: '0 4px 14px rgba(47, 134, 199, 0.28)',
  icon: '#BFE4FF',
}

export default function ScoutProfileChip({
  label = 'פרופיל סקאוט',
  tooltip,
  iconId = 'performanceProfile',
  fontSize = 13,
}) {
  const tooltipLabel = tooltip || label

  return (
    <Tooltip title={tooltipLabel} arrow>
      <Box sx={{
        minHeight: fontSize + 10,
        px: 0.85,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.45,
        borderRadius: 999,
        color: scoutProfileChipColors.text,
        background: scoutProfileChipColors.background,
        border: `1px solid ${scoutProfileChipColors.border}`,
        boxShadow: scoutProfileChipColors.shadow,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        overflow: 'hidden',
        transition: 'transform 120ms ease, box-shadow 120ms ease',

        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 6px 18px rgba(47, 134, 199, 0.34)',
        },
      }}>
        {iconUi({
          id: iconId,
          size: 'sm',
          sx: {
            flexShrink: 0,
            color: scoutProfileChipColors.icon,
            fontSize: fontSize + 1,
          },
        })}

        <Typography
          component='span'
          sx={{
            color: scoutProfileChipColors.text,
            fontSize,
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  )
}

