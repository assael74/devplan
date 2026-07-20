// features/playersDatabase/ui/components/scout/ScoutPriority.js

import * as React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { resolveScoutPriority } from '../../logic/scoutDisplay.logic.js'

export const scoutPriorityColors = {
  leadingTarget: {
    main: '#1F7A4D',
    light: '#E8F5EE',
    text: '#175C3A',
  },

  highPriority: {
    main: '#2F86C7',
    light: '#EAF5FC',
    text: '#215F8F',
  },

  positive: {
    main: '#4F9A73',
    light: '#EDF7F1',
    text: '#356B4F',
  },

  regular: {
    main: '#657684',
    light: '#F1F4F6',
    text: '#4D5B66',
  },

  lowPriority: {
    main: '#C58A32',
    light: '#FBF3E6',
    text: '#8A5E1F',
  },
}

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
  const display = priorityStyleByTone[meta.tone] || priorityStyleByTone.neutral
  const colors = display.colors
  const fullLabel = label || meta.label
  const displayLabel = short
    ? shortLabelByTone[meta.tone] || fullLabel
    : fullLabel
  const tooltipLabel = tooltip || fullLabel

  return (
    <Tooltip title={tooltipLabel} arrow>
      <Box sx={{
        minHeight: fontSize + 8,
        px: 0.65,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.35,
        borderRadius: 999,
        bgcolor: colors.light,
        border: `1px solid ${colors.main}33`,
        color: colors.text,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        overflow: 'hidden',
      }}>
        {iconUi({
          id: display.iconId,
          size: 'sm',
          sx: {
            flexShrink: 0,
            color: colors.main,
            fontSize: fontSize + 1,
          },
        })}

        <Typography
          component='span'
          sx={{
            color: colors.text,
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayLabel}
        </Typography>
      </Box>
    </Tooltip>
  )
}

