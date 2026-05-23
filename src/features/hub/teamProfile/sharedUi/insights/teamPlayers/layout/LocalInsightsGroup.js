// teamProfile/sharedUi/insights/teamPlayers/layout/LocalInsightsGroup.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { loaclSx as sx } from './sx/local.sx'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

const loadingChip = 'בטעינה'

export default function LocalInsightsGroup({
  title,
  sub = '',
  icon = 'insights',
  chip = null,
  chipColor = 'neutral',
  children,
  color,
  loading = false,
  loadingLabel = loadingChip,
}) {
  const resolvedChip = loading ? loadingLabel : chip
  const resolvedChipColor = loading ? 'neutral' : chipColor

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
              <Typography
                level="body-xs"
                sx={{
                  mt: 0.25,
                  color: 'text.tertiary',
                  lineHeight: 1.35,
                }}
              >
                {sub}
              </Typography>
            ) : null}
          </Box>
        </Box>

        {resolvedChip ? (
          <Chip
            size="md"
            variant="soft"
            color={resolvedChipColor}
            sx={{ flex: '0 0 auto' }}
          >
            {resolvedChip}
          </Chip>
        ) : null}
      </Box>

      <Box sx={{ display: 'grid', gap: 1 }}>
        {children}
      </Box>
    </Box>
  )
}
