// teamProfile/sharedUi/insights/teamPlayers/buildSection/PositionModeSwitch.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { positionSx as sx } from './sx/position.sx.js'

export default function PositionModeSwitch({
  value,
  onChange,
}) {
  return (
    <Box sx={sx.modeSwitch}>
      <Chip
        size="sm"
        variant={value === 'primary' ? 'soft' : 'plain'}
        color={value === 'primary' ? 'primary' : 'neutral'}
        onClick={() => onChange('primary')}
        sx={sx.modeChip(value === 'primary')}
      >
        ראשית בלבד
      </Chip>

      <Chip
        size="sm"
        variant={value === 'coverage' ? 'soft' : 'plain'}
        color={value === 'coverage' ? 'primary' : 'neutral'}
        onClick={() => onChange('coverage')}
        sx={sx.modeChip(value === 'coverage')}
      >
        כל העמדות
      </Chip>
    </Box>
  )
}
