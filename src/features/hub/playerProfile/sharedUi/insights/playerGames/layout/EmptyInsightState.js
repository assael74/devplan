// playerProfile/sharedUi/insights/playerGames/layout/EmptyInsightState.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

export function EmptyInsightState({
  title = 'אין נתונים להצגה',
  text = 'לא קיימים מספיק נתונים כדי להציג את האזור הזה.',
}) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 'lg',
        bgcolor: 'background.level1',
        border: '1px solid',
        borderColor: 'divider',
        display: 'grid',
        gap: 0.5,
      }}
    >
      <Typography level="title-sm" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>

      <Typography
        level="body-sm"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.55,
        }}
      >
        {text}
      </Typography>
    </Box>
  )
}
