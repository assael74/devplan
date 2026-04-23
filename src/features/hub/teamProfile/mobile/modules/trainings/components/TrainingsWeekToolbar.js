// teamProfile/mobile/modules/trainings/components/TrainingsWeekToolbar.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { weekToolbarSx as sx } from '../sx/weekToolbar.sx.js'

export default function TrainingsWeekToolbar({
  title,
  subtitle = '',
  count = 0,
}) {
  return (
    <Sheet variant="plain" sx={sx.root}>
      <Box sx={sx.main}>
        <Box sx={sx.accent} />

        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.15, flex: 1 }}>
          <Typography level="title-sm" noWrap sx={sx.title}>
            {title}
          </Typography>

          {subtitle ? (
            <Typography level="body-xs" noWrap sx={sx.subtitle}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
      </Box>

      <Chip size="sm" variant="soft" color="primary" sx={sx.countChip}>
        {count}
      </Chip>
    </Sheet>
  )
}
