import React from 'react'
import { Box, Chip, Typography, Tooltip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { sectionsSx as sx } from '../../sx/sections.sx.js'
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

  const handleEntryEdit = () => {
    if (onEditEntry) onEditEntry(game)
  }

  return (
    <Box sx={sx.entryCellSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="עדכון רישום שחקנים">
          <IconButton size="sm" variant="plain" onClick={handleEntryEdit}>
            {iconUi({ id: 'entry' })}
          </IconButton>
        </Tooltip>

        <Typography level="title-sm" sx={sx.titleSx}>
          סגל:
        </Typography>

        <Chip size="sm" variant="soft" color="primary">
          {squad.length} / {totalTeam}
        </Chip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography level="title-sm" sx={sx.titleSx}>
          שותפו:
        </Typography>

        <Chip size="sm" variant="soft" color="success">
          {played.length}
        </Chip>
      </Box>
    </Box>
  )
}
