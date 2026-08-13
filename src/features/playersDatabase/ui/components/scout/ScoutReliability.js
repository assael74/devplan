// src/features/playersDatabase/ui/components/scout/ScoutReliability.js

import * as React from 'react'
import {
  Box,
  Typography,
} from '@mui/joy'

import { scoutStoryModalSx as sx } from './sx/scoutStoryModal.sx.js'

const RELIABILITY_LABELS = {
  high: 'אמינות גבוהה',
  medium: 'אמינות בינונית',
  low: 'אמינות נמוכה',
}

const resolveLevel = level => {
  const value = String(level || '').trim().toLowerCase()

  if (value === 'high') return 'high'
  if (value === 'medium') return 'medium'
  if (value === 'low') return 'low'

  return 'neutral'
}

export default function ScoutReliability({
  level,
  score,
  label,
  compact = false,
}) {
  const resolvedLevel = resolveLevel(level)
  const resolvedLabel = (
    label ||
    RELIABILITY_LABELS[resolvedLevel] ||
    'אמינות לא זמינה'
  )
  const hasScore = (
    score !== undefined &&
    score !== null &&
    score !== ''
  )

  return (
    <Box sx={sx.reliability({ compact })}>
      <Box
        component='span'
        sx={sx.reliabilityDot[resolvedLevel]}
      />

      <Typography
        component='span'
        sx={sx.reliabilityLabel({ compact })}
      >
        {resolvedLabel}
      </Typography>

      {hasScore ? (
        <Typography
          component='span'
          sx={sx.reliabilityScore({ compact })}
        >
          {score}
        </Typography>
      ) : null}
    </Box>
  )
}
