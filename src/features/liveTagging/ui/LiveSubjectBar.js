// src/features/liveTagging/ui/LiveSubjectBar.js

import React from 'react'
import { Box, Button, Option, Select, Typography } from '@mui/joy'

import { sx } from './sx/liveTagging.sx.js'

export function LiveSubjectBar({
  players = [],
  activeType,
  activePlayerId,
  onTypeChange,
  onPlayerChange,
}) {
  const isPlayer = activeType === 'player'

  return (
    <Box sx={sx.subjectBar}>
      <Typography level="body-xs" sx={sx.mutedText}>
        נושא תיוג
      </Typography>

      <Box sx={sx.subjectInline}>
        <Box sx={sx.subjectTypeActions}>
          <Button
            size="sm"
            variant={isPlayer ? 'solid' : 'soft'}
            color={isPlayer ? 'primary' : 'neutral'}
            onClick={() => onTypeChange('player')}
          >
            שחקן
          </Button>

          <Button
            size="sm"
            variant={!isPlayer ? 'solid' : 'soft'}
            color={!isPlayer ? 'primary' : 'neutral'}
            onClick={() => onTypeChange('team')}
          >
            קבוצה
          </Button>
        </Box>

        <Select
          size="sm"
          value={activePlayerId}
          disabled={!isPlayer}
          onChange={(event, value) => onPlayerChange(value)}
          sx={sx.playerSelect}
        >
          {players.map((player) => (
            <Option key={player.id} value={player.id}>
              {player.name}
            </Option>
          ))}
        </Select>
      </Box>
    </Box>
  )
}
