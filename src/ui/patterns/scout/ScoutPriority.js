import * as React from 'react'
import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import {
  resolveScoutPriority,
  scoutPriorityColors,
  scoutPrioritySx as sx,
} from './scoutPriority.presentation.js'

export { scoutPriorityColors }

export default function ScoutPriority({
  value,
  label,
  short = false,
  tooltip,
  fontSize = 13,
}) {
  const meta = resolveScoutPriority(value)
  const colors = meta.colors
  const fullLabel = label || meta.label
  const displayLabel = short ? meta.shortLabel : fullLabel
  const tooltipLabel = tooltip || fullLabel
  const tooltipTitle = React.isValidElement(tooltipLabel)
    ? tooltipLabel
    : <Box sx={sx.tooltipContent}>{tooltipLabel}</Box>

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box sx={sx.root({ colors, fontSize })}>
        {iconUi({
          id: meta.iconId,
          size: 'sm',
          sx: sx.icon({ colors, fontSize }),
        })}

        <Typography component='span' sx={sx.label({ colors, fontSize })}>
          {displayLabel}
        </Typography>
      </Box>
    </Tooltip>
  )
}
