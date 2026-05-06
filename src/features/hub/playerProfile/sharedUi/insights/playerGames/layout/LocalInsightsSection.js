// playerProfile/sharedUi/insights/playerGames/layout/LocalInsightsSection.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

const safeIconId = (value) => {
  if (typeof value !== 'string') return 'insights'
  if (!value.trim()) return 'insights'

  // זמנית נמנעים מ-rate כי הוא מפיל PercentIcon אצלך
  if (value === 'rate') return 'insights'

  return value
}

export function LocalInsightsSection({
  title,
  icon = 'insights',
  action = null,
  children,
}) {
  const iconId = safeIconId(icon)

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            minWidth: 0,
          }}
        >
          {iconUi({ id: iconId })}

          <Typography
            level="title-sm"
            sx={{
              fontWeight: 700,
              minWidth: 0,
            }}
          >
            {title}
          </Typography>
        </Box>

        {action}
      </Box>

      {children}
    </Box>
  )
}
