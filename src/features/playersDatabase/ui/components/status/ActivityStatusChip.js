// features/playersDatabase/ui/components/status/ActivityStatusChip.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export default function ActivityStatusChip({
  active = false,
  activeLabel = 'ליגה פעילה',
  inactiveLabel = 'ליגה לא פעילה',
}) {
  const color = active ? '#16A34A' : '#DC2626'
  const bg = active ? '#ECFDF5' : '#FEF2F2'
  const label = active ? activeLabel : inactiveLabel

  return (
    <Box
      sx={{
        minHeight: 28,
        px: 1.2,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        borderRadius: 999,
        bgcolor: bg,
        border: `1px solid ${color}`,
        color: devPlanColors.primaryDark,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          bgcolor: color,
          flexShrink: 0,
        }}
      />

      <Typography
        level='body-xs'
        sx={{
          color: devPlanColors.primaryDark,
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
