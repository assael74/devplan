// teamProfile/desktop/modules/games/components/sections/PlayerEntrySection.js

import React from 'react'
import { Box, Chip, Typography, Tooltip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { sectionsSx as sx } from './sx/sections.sx.js'
import {
  getGamePlayers,
  getSquadPlayers,
  getPlayedPlayers,
} from './../../../../../sharedLogic/games'

export function PlayerEntrySection({ game, onEditEntry }) {
  const players = getGamePlayers(game)
  const teamPlayers = Array.isArray(game?.team?.players) ? game.team.players : []

  const squad = getSquadPlayers(players)
  const played = getPlayedPlayers(players)
  const totalTeam = teamPlayers.length

  const handleEntryEdit = event => {
    event.stopPropagation()

    if (onEditEntry) {
      onEditEntry(game)
    }
  }

  return (
    <Box sx={sx.entryCellSx}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', px: 0.5, gap: 0.5, py: 0 }}>
        <Tooltip title="עדכון רישום שחקנים">
          <IconButton size="sm" variant="plain" onClick={handleEntryEdit}>
            {iconUi({ id: 'entry' })}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ p: 0 }}>
        <Chip size="sm" variant="soft" color="primary" startDecorator={iconUi({id: 'isSquad', size: 'sm'})}>
          {squad.length} / {totalTeam}
        </Chip>

        <Chip size="sm" variant="soft" color="success" startDecorator={iconUi({id: 'isSquad', size: 'sm'})}>
          {played.length}
        </Chip>
      </Box>
    </Box>
  )
}
