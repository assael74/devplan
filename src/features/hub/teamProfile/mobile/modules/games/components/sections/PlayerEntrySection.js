import React from 'react'
import { Box, Chip, Typography, Tooltip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { sectionsSx as sx } from '../../sx/sections.sx.js'
import {
  getGamePlayers,
  getSquadPlayers,
  getPlayedPlayers,
} from '../../../../../sharedLogic'

export function PlayerEntrySection({ game, onEditEntry }) {
  const time = Number(game?.timePlayed || 0)
  const isStarter = !!game?.isStarting
  const iconStart = isStarter ? 'isStart' : 'isSquad'
  const variant = isStarter ? 'solid' : 'soft'

  return (
    <Box sx={sx.entryCellSx}>
      <Tooltip title="עדכון רישום במשחק">
        <IconButton size="md" variant="plain" onClick={() => onEditEntry(game)}>
          {iconUi({ id: 'entry' })}
        </IconButton>
      </Tooltip>

      <Chip size="md" variant={variant} color={isStarter ? 'success' : 'danger'} startDecorator={iconUi({id: iconStart})}>
        {isStarter ? 'הרכב' : 'ספסל'}
      </Chip>

      <Chip size="md" variant="soft" startDecorator={iconUi({id: 'timePlayed'})}>
        {time} דק׳
      </Chip>
    </Box>
  )
}
