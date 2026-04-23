// ui/patterns/insights/InsightsChipsList.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'
import { insightsPatternSx as sx } from './sx/insights.sx.js'

export default function InsightsChipsList({
  items = [],
  iconFallback = 'layers',
  chipColor = 'neutral',
}) {
  if (!items.length) {
    return (
      <Typography level="body-sm" sx={{ opacity: 0.7 }}>
        אין נתונים להצגה
      </Typography>
    )
  }

  return (
    <Box sx={sx.chipsWrap}>
      {items.map((item) => (
        <Chip
          key={item.id}
          size="md"
          variant="soft"
          color={item.color || chipColor}
          startDecorator={iconUi({ id: item.icon || item.idIcon || item.id || iconFallback })}
          sx={{ maxWidth: '100%' }}
        >
          {item.label} ({item.count})
        </Chip>
      ))}
    </Box>
  )
}
