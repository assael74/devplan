// teamProfile/sharedUi/insights/teamGames/controls/CalculationModeChips.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

export const CALCULATION_MODES = {
  TEAM: 'team',
  GAMES: 'games',
}

export default function CalculationModeChips({
  value = CALCULATION_MODES.TEAM,
  onChange,
}) {
  const isTeam = value === CALCULATION_MODES.TEAM
  const isGames = value === CALCULATION_MODES.GAMES

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: 0,
        flexShrink: 1,
        overflow: 'hidden',
      }}
    >
      <Chip
        size="sm"
        variant={isTeam ? 'solid' : 'soft'}
        color={isTeam ? 'primary' : 'neutral'}
        onClick={() => onChange(CALCULATION_MODES.TEAM)}
        startDecorator={iconUi({ id: 'teams', size: 'sm' })}
        sx={{
          fontWeight: 700,
          '--Chip-minHeight': '26px',
          minWidth: 0,
          flexShrink: 1,
          maxWidth: { xs: 92, sm: 'none' },

          '& .MuiChip-label': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      >
        נתוני קבוצה
      </Chip>

      <Chip
        size="sm"
        variant={isGames ? 'solid' : 'soft'}
        color={isGames ? 'primary' : 'neutral'}
        onClick={() => onChange(CALCULATION_MODES.GAMES)}
        startDecorator={iconUi({ id: 'games', size: 'sm' })}
        sx={{
          fontWeight: 700,
          '--Chip-minHeight': '26px',
          minWidth: 0,
          flexShrink: 1,
          maxWidth: { xs: 92, sm: 'none' },

          '& .MuiChip-label': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      >
        נתוני משחקים
      </Chip>
    </Box>
  )
}
