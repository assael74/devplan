// playerProfile/desktop/modules/games/components/PlayerGamesList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import PlayerGameRow from './PlayerGameRow.js'

import { playerGamesListSx as sx } from '../sx/playerGames.list.sx.js'

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
    <Box sx={sx.wrap}>
      {rows.map((row) => (
        <PlayerGameRow
          key={row.id}
          game={row}
          onEdit={onEditGame}
          onEditEntry={onEditEntryGame}
        />
      ))}
    </Box>
  )
}
