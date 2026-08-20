// src/features/playersDatabase/ui/components/scout/ScoutProfileChip.js

import * as React from 'react'
import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import { SCOUT_PROFILES } from '../../../../../shared/scouting/players/profiles.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { scoutProfileChipSx as sx } from './sx/scoutProfileChip.sx.js'
import {
  scoutProfileChipColors,
  scoutProfileChipVariants,
} from './sx/scoutColors.sx.js'

export { scoutProfileChipColors }

function resolveProfile(profileId, label) {
  const definition = SCOUT_PROFILES.find(item => item.id === profileId) || null

  return {
    label: label || definition?.label || 'פרופיל סקאוט',
    iconId: definition?.idIcon || 'performanceProfile',
  }
}

function resolveTooltipTitle(tooltipLabel) {
  if (React.isValidElement(tooltipLabel)) return tooltipLabel

  return (
    <Box sx={sx.tooltipContent}>
      {tooltipLabel}
    </Box>
  )
}

export default function ScoutProfileChip({
  profileId = '',
  label = '',
  tooltip,
  iconId = '',
  fontSize = 13,
  variant = 'default',
  selected = false,
  onClick,
}) {
  const profile = resolveProfile(profileId, label)
  const tooltipLabel = tooltip || profile.label
  const tooltipTitle = resolveTooltipTitle(tooltipLabel)
  const colors = scoutProfileChipVariants[variant] || scoutProfileChipVariants.default
  const interactive = typeof onClick === 'function'

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        component={interactive ? 'button' : 'span'}
        type={interactive ? 'button' : undefined}
        aria-pressed={interactive ? selected : undefined}
        sx={sx.root({ colors, fontSize, interactive, selected })}
        onClick={onClick}
      >
        {iconUi({
          id: iconId || profile.iconId,
          size: 'sm',
          sx: sx.icon({ colors, fontSize, selected }),
        })}

        <Typography component='span' sx={sx.label({ colors, fontSize, selected })}>
          {profile.label}
        </Typography>
      </Box>
    </Tooltip>
  )
}
