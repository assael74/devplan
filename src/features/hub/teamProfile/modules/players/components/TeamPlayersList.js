// teamProfile/modules/players/components/TeamPlayersList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import TeamPlayerRow from './TeamPlayerRow.js'

import { teamPlayersListSx as sx } from '../sx/teamPlayers.list.sx.js'

export default function TeamPlayersList({
  rows,
  onOpenPlayer,
  onAvatarClick,
  onOpenEdit,
  onOpenPositions,
  onToggleActive,
}) {
  if (!rows?.length) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצאו שחקנים להצגה</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      {rows.map((row) => (
        <TeamPlayerRow
          key={row.id}
          row={row}
          onOpenPlayer={onOpenPlayer}
          onAvatarClick={onAvatarClick}
          onOpenEdit={onOpenEdit}
          onOpenPositions={onOpenPositions}
          onToggleActive={onToggleActive}
        />
      ))}
    </Box>
  )
}
