// features/playersDatabase/ui/components/status/ActivityStatusChip.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'
import { activityStatusChipSx as chipSx } from './activityStatusChip.sx.js'

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
  sx: externalSx,
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
      sx={[
        chipSx.root({
          backgroundColor,
          color,
          textColor,
        }),
        externalSx,
      ]}
    >
      <Box
        aria-hidden='true'
        sx={chipSx.dot(color)}
      />

      <Typography
        level='body-xs'
        sx={chipSx.label(textColor)}
      >
        {resolvedLabel}
      </Typography>
    </Box>
  )
}
