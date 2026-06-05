// src/ui/forms/gameStatsForm/steps/parts/EntryPlayerTabs.js

import React from 'react'
import {
  Avatar,
  Box,
  Button,
} from '@mui/joy'

import { entryStepSx as sx } from '../sx/entryStep.sx.js'
import playerImage from '../../../../core/images/playerImage.jpg'

import {
  isLockedStatsRow,
} from '../../logic/index.js'

// אחריות:
// תצוגת טאבים של שחקנים פעילים בשלב מילוי הסטטיסטיקה.

export function EntryPlayerTabs({
  players,
  selectedPlayerIds,
  activePlayerId,
  onActivePlayer,
}) {
  return (
    <Box sx={sx.activePlayersBar}>
      {selectedPlayerIds.map(playerId => {
        const player = players.find(item => item.playerId === playerId)
        const selected = playerId === activePlayerId
        const photo = player && player.photo ? player.photo : playerImage
        const locked = isLockedStatsRow(player)

        return (
          <Button
            key={playerId}
            size="sm"
            variant={selected ? 'solid' : 'soft'}
            color={selected ? 'primary' : 'neutral'}
            disabled={locked && !selected}
            onClick={() => {
              if (locked && !selected) return
              onActivePlayer(playerId)
            }}
            startDecorator={<Avatar src={photo} sx={{ width: 20, height: 20 }} />}
            sx={sx.playerTabButton}
          >
            {player && player.name ? player.name : 'שחקן'}
          </Button>
        )
      })}
    </Box>
  )
}
