// features/playersDatabase/ui/components/scout/ScoutProfileChip.js

import * as React from 'react'
import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { scoutProfileChipSx as sx } from './sx/scoutProfileChip.sx.js'
import {
  scoutProfileChipColors,
  scoutProfileChipVariants,
} from './sx/scoutColors.sx.js'

export { scoutProfileChipColors }

const resolveTooltipTitle = tooltipLabel => {
  if (React.isValidElement(tooltipLabel)) {
    return tooltipLabel
  }

  return (
    <Box sx={sx.tooltipContent}>
      {tooltipLabel}
    </Box>
  )
}

export default function ScoutProfileChip({
  label = 'פרופיל סקאוט',
  tooltip,
  iconId = 'performanceProfile',
  fontSize = 13,
  variant = 'default',
}) {
  const tooltipLabel = tooltip || label
  const tooltipTitle = resolveTooltipTitle(tooltipLabel)

  const colors = (
    scoutProfileChipVariants[variant] ||
    scoutProfileChipVariants.default
  )

  return (
    <Tooltip
      title={tooltipTitle}
      arrow
    >
      <Box sx={sx.root({
        colors,
        fontSize,
      })}>
        {iconUi({
          id: iconId,
          size: 'sm',
          sx: sx.icon({
            colors,
            fontSize,
          }),
        })}

        <Typography
          component='span'
          sx={sx.label({
            colors,
            fontSize,
          })}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  )
}
