// features/playersDatabase/ui/components/status/ActivityStatusChip.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export default function ActivityStatusChip({
  active = false,
  label = '',
  activeLabel = 'פעיל',
  inactiveLabel = 'לא פעיל',
  activeColor = '#16A34A',
  inactiveColor = '#DC2626',
  activeBg = '#ECFDF5',
  inactiveBg = '#FEF2F2',
  textColor = devPlanColors.primaryDark,
  sx,
}) {
  const color = active
    ? activeColor
    : inactiveColor

  const backgroundColor = active
    ? activeBg
    : inactiveBg

  const resolvedLabel = label || (
    active
      ? activeLabel
      : inactiveLabel
  )

  return (
    <Box
      sx={{
        minHeight: 28,
        px: 1.2,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        borderRadius: 999,
        bgcolor: backgroundColor,
        border: `1px solid ${color}`,
        color: textColor,
        ...sx,
      }}
    >
      <Box
        aria-hidden='true'
        sx={{
          width: 7,
          height: 7,
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor: color,
        }}
      />

      <Typography
        level='body-xs'
        sx={{
          color: textColor,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {resolvedLabel}
      </Typography>
    </Box>
  )
}
