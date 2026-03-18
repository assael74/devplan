// teamProfile/modules/games/components/TeamGamesList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import TeamGameRow from './TeamGameRow.js'

import { teamGamesListSx as sx } from '../sx/teamGames.list.sx.js'

export default function TeamGamesList({
  rows,
  onEditGame,
  onOpenEdit,
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
      {rows.map((row) => (
        <TeamGameRow
          key={row.id}
          game={row}
          onEdit={onEditGame}
        />
      ))}
    </Box>
  )
}
