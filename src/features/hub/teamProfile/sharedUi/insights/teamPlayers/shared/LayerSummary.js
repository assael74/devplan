// TEAMPROFILE/sharedUi/insights/teamPlayers/shared/LayerSummary.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { layersSx as sx } from './sx/layers.sx.js'

export default function LayerSummary({
  icon = 'layers',
  title,
  sub,
  chipLabel,
  chipColor = 'neutral',
}) {
  return (
    <Box sx={sx.layerSummary}>
      <Box sx={sx.layerTitleWrap}>
        <Box sx={sx.layerIcon}>
          {iconUi({ id: icon, size: 'sm' })}
        </Box>

        <Box sx={sx.layerText}>
          <Typography level="title-sm" sx={sx.layerTitle}>
            {title}
          </Typography>

          {sub ? (
            <Typography level="body-xs" sx={sx.layerSub}>
              {sub}
            </Typography>
          ) : null}
        </Box>
      </Box>

      {chipLabel ? (
        <Chip
          size="sm"
          variant="soft"
          color={chipColor}
          sx={sx.layerChip}
        >
          {chipLabel}
        </Chip>
      ) : null}
    </Box>
  )
}
