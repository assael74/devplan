// ui/patterns/insights/ui/MetricMiniCard.js

import React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'
import { metricMiniCardSx as sx } from './sx/metricMiniCard.sx.js'

export default function MetricMiniCard({
  label = 'מדד',
  value = '—',
  sub = '',
  icon = 'info',
  color = 'neutral',
  tooltip = null,
  isMobile = false
}) {
  const card = (
    <Box sx={sx.root(color)}>
      <Box sx={sx.titleRow}>
        <Typography level="body-xs" sx={sx.title}>
          {label}
        </Typography>

        {iconUi({ id: icon, size: 'sm' })}
      </Box>

      <Typography level="h3" sx={sx.value}>
        {value}
      </Typography>

      {sub ? (
        <Typography level="body-xs" sx={sx.sub}>
          {sub}
        </Typography>
      ) : null}
    </Box>
  )

  if (!tooltip) return card

  return (
    <Tooltip
      arrow
      placement="top"
      variant="soft"
      color="primary"
      sx={sx.tooltip}
      title={tooltip}
    >
      {card}
    </Tooltip>
  )
}
