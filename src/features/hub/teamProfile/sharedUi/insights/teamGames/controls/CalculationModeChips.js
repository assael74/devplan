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
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
      <Chip
        size="sm"
        variant={isTeam ? 'solid' : 'soft'}
        color={isTeam ? 'primary' : 'neutral'}
        onClick={() => onChange(CALCULATION_MODES.TEAM)}
        startDecorator={iconUi({ id: 'teams', size: 'sm' })}
        sx={{ fontWeight: 700, '--Chip-minHeight': '26px' }}
      >
        נתוני קבוצה
      </Chip>

      <Chip
        size="sm"
        variant={isGames ? 'solid' : 'soft'}
        color={isGames ? 'primary' : 'neutral'}
        onClick={() => onChange(CALCULATION_MODES.GAMES)}
        startDecorator={iconUi({ id: 'game', size: 'sm' })}
        sx={{ fontWeight: 700, '--Chip-minHeight': '26px' }}
      >
        נתוני משחקים
      </Chip>
    </Box>
  )
}
