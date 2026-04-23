// teamProfile/mobile/modules/trainings/components/TrainingsToolbar.js

import React from 'react'
import { Box, Chip, IconButton, Sheet, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../sx/toolbar.sx.js'

export default function TrainingsToolbar({
  title = 'אימונים',
  stats = [],
  showCreate = false,
  onCreate,
}) {
  const items = Array.isArray(stats) ? stats : []

  return (
    <Sheet variant="plain" sx={sx.root}>
      <Box sx={sx.titleWrap}>
        <Box sx={sx.dot} />

        <Typography level="title-sm" sx={sx.title}>
          {title}
        </Typography>
      </Box>

      <Box sx={sx.right}>
        <Box sx={sx.stats}>
          {items.map((item) => (
            <Chip
              key={item.id}
              size="sm"
              variant={item.id === 'current' ? 'solid' : 'soft'}
              color={item.color || 'neutral'}
              sx={sx.statChip}
            >
              {`${item.label}: ${item.value}`}
            </Chip>
          ))}
        </Box>
      </Box>
    </Sheet>
  )
}
