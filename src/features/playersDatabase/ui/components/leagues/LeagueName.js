import * as React from 'react'
import { Box, Typography } from '@mui/joy'

import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

const clean = value => String(value ?? '').trim()

export default function LeagueName({
  value = '',
  level = '',
  showLevel = false,
  fontSize = 13,
  nameSx,
}) {
  const leagueLevel = Number(level)
  const hasLevel = showLevel && Number.isFinite(leagueLevel) && leagueLevel > 0

  return (
    <Box sx={{
      minWidth: 0,
      maxWidth: '100%',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.65,
    }}>
      <Typography
        component='span'
        sx={{
          minWidth: 0,
          color: devPlanColors.primaryDark,
          fontSize,
          fontWeight: 650,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...nameSx,
        }}
      >
        {clean(value) || '-'}
      </Typography>

      {hasLevel ? (
        <Box
          component='span'
          title={`רמת ליגה ${leagueLevel}`}
          sx={{
            minWidth: fontSize + 11,
            height: fontSize + 4,
            px: 0.45,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            borderRadius: 5,
            bgcolor: '#F4F6FF',
            color: '#4F46E5',
            fontSize: Math.max(fontSize - 4, 8),
            fontWeight: 750,
            lineHeight: 1,
            letterSpacing: 0,
          }}
        >
          {`L${leagueLevel}`}
        </Box>
      ) : null}
    </Box>
  )
}
