// teamProfile/sharedUi/insights/teamPlayers/layout/LocalInsightsGroup.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { loaclSx as sx } from './sx/local.sx'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

export default function LocalInsightsGroup({
  title,
  sub = '',
  icon = 'insights',
  chip = null,
  chipColor = 'neutral',
  children,
  color
}) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.head}>
        <Box sx={sx.titleWrap}>
          <Box sx={sx.icon(color)}>
            {iconUi({ id: icon, size: 'lg' })}
          </Box>

          <Box>
            <Typography level="title-lg" sx={sx.sectionTitle}>
              {title}
            </Typography>

            {sub ? (
              <Typography level="body-xs" sx={{ mt: 0.25, color: 'text.tertiary', lineHeight: 1.35 }}>
                {sub}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {chip ? (
          <Chip
            size="md"
            variant="soft"
            color={chipColor}
            sx={{ flex: '0 0 auto' }}
          >
            {chip}
          </Chip>
        ) : null}
      </Box>

      <Box sx={{ display: 'grid', gap: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
