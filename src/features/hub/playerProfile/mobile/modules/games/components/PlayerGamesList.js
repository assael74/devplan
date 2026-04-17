// playerProfile/desktop/modules/games/components/PlayerGamesList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import PlayerGameCardMobile  from './gameCard/PlayerGameCardMobile.js'

import { moduleSx as sx } from '../sx/module.sx.js'

export default function PlayerGamesList({
  rows,
  onEditGame,
  onEditEntryGame,
}) {
  if (!rows?.length) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצאו משחקים</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      {rows.map((game, index) => (
        <PlayerGameCardMobile
          key={game?.id || game?.gameId || index}
          game={game}
          onEditEntry={onEditEntryGame}
          defaultExpanded={false}
        />
      ))}
    </Box>
  )
}
