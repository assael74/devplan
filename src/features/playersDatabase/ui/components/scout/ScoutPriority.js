// features/playersDatabase/ui/components/scout/ScoutPriority.js

import * as React from 'react'
import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { resolveScoutPriority } from '../../logic/scoutDisplay.logic.js'
import {
  scoutPriorityColors,
  scoutPrioritySx as sx,
} from './sx/scoutComponents.sx.js'

export { scoutPriorityColors }

const priorityStyleByTone = {
  elite: {
    colors: scoutPriorityColors.leadingTarget,
    iconId: 'leadingTarget',
  },

  high: {
    colors: scoutPriorityColors.highPriority,
    iconId: 'highPriority',
  },

  positive: {
    colors: scoutPriorityColors.positive,
    iconId: 'positivePriority',
  },

  neutral: {
    colors: scoutPriorityColors.regular,
    iconId: 'regularPriority',
  },

  low: {
    colors: scoutPriorityColors.lowPriority,
    iconId: 'lowPriority',
  },
}

const shortLabelByTone = {
  elite: 'יעד מוביל',
  high: 'גבוהה',
  positive: 'חיובי',
  neutral: 'רגיל',
  low: 'נמוכה',
}

export default function ScoutPriority({
  value,
  label,
  short = false,
  tooltip,
  fontSize = 13,
}) {
  const meta = resolveScoutPriority(value)

  const display = (
    priorityStyleByTone[meta.tone] ||
    priorityStyleByTone.neutral
  )

  const colors = display.colors
  const fullLabel = label || meta.label

  const displayLabel = short
    ? shortLabelByTone[meta.tone] || fullLabel
    : fullLabel

  const tooltipLabel = tooltip || fullLabel

  return (
    <Tooltip title={tooltipLabel} arrow>
      <Box sx={sx.root({ colors, fontSize })}>
        {iconUi({id: display.iconId, size: 'sm', sx: sx.icon({colors, fontSize})})}

        <Typography component='span' sx={sx.label({ colors, fontSize })}>
          {displayLabel}
        </Typography>
      </Box>
    </Tooltip>
  )
}
