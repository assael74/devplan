// features/insightsHub/overview/components/OverviewBlocks.js

import React from 'react'
import { Box, Card, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { OVERVIEW_BLOCKS } from '../data/overview.blocks.js'

import { overviewSx as sx } from './sx/overview.sx'

function OpeningBlock({ item }) {
  return (
    <Card variant="outlined" sx={sx.blockRoot}>
      <Box sx={sx.blockWrap}>
        <Box sx={sx.iconWrap}>
          {iconUi({ id: item.iconId, size: 'md' })}
        </Box>

        <Chip size="sm" variant="soft" sx={{ bgcolor: item.color }}>
          {item.title}
        </Chip>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.35 }}>
        <Typography level="title-sm" sx={{ fontWeight: 700 }}>
          {item.subtitle}
        </Typography>

        <Typography level="body-xs" sx={{ color: 'text.secondary', lineHeight: 1.55 }}>
          {item.text}
        </Typography>
      </Box>
    </Card>
  )
}

export default function OverviewBlocks() {
  return (
    <Box sx={sx.grid}>
      {OVERVIEW_BLOCKS.map((item) => (
        <OpeningBlock key={item.id} item={item} />
      ))}
    </Box>
  )
}
