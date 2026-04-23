// teamProfile/mobile/modules/players/components/TeamPlayersList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import TeamPlayerCardMobile from './playerCard/TeamPlayerCardMobile.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function TeamPlayersList({
  rows,
  onOpenPlayer,
  onEditPlayer,
  onAvatarClick,
  onEditPosition,
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
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      {rows.map((row) => (
        <TeamPlayerCardMobile
          key={row.id}
          row={row}
          onOpenPlayer={onOpenPlayer}
          onAvatarClick={onAvatarClick}
          onEditPlayer={onEditPlayer}
          onEditPosition={onEditPosition}
        />
      ))}
    </Box>
  )
}
