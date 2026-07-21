// features/playersDatabase/ui/components/scout/ScoutProfileChip.js

import * as React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { devPlanColors } from '../../../../../ui/core/theme/Colors.js'

export const scoutProfileChipColors = {
  background: 'linear-gradient(90deg, #173B57 0%, #245F89 55%, #2F86C7 100%)',
  text: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.18)',
  shadow: '0 4px 14px rgba(47, 134, 199, 0.28)',
  icon: '#BFE4FF',
}

const SCOUT_PROFILE_CHIP_VARIANTS = {
  default: scoutProfileChipColors,
  combination: {
    background: devPlanColors.tertiaryLight,
    text: devPlanColors.primaryDark,
    border: devPlanColors.tertiary,
    shadow: '0 4px 14px rgba(47, 134, 199, 0.18)',
    icon: devPlanColors.tertiary,
  },
}

export default function ScoutProfileChip({
  label = 'פרופיל סקאוט',
  tooltip,
  iconId = 'performanceProfile',
  fontSize = 13,
  variant = 'default',
}) {
  const tooltipLabel = tooltip || label
  const colors = SCOUT_PROFILE_CHIP_VARIANTS[variant] || SCOUT_PROFILE_CHIP_VARIANTS.default

  return (
    <Tooltip title={tooltipLabel} arrow>
      <Box sx={{
        minHeight: fontSize + 10,
        px: 0.85,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.45,
        borderRadius: 999,
        color: colors.text,
        background: colors.background,
        border: `1px solid ${colors.border}`,
        boxShadow: colors.shadow,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        overflow: 'hidden',
        transition: 'transform 120ms ease, box-shadow 120ms ease',

        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: variant === 'combination'
            ? '0 6px 18px rgba(47, 134, 199, 0.24)'
            : '0 6px 18px rgba(47, 134, 199, 0.34)',
        },
      }}>
        {iconUi({
          id: iconId,
          size: 'sm',
          sx: {
            flexShrink: 0,
            color: colors.icon,
            fontSize: fontSize + 1,
          },
        })}

        <Typography
          component='span'
          sx={{
            color: colors.text,
            fontSize,
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </Box>
    </Tooltip>
  )
}
