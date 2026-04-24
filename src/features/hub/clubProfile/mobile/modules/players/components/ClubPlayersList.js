// clubProfile/mobile/modules/players/components/ClubPlayersList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubPlayerCardMobile from './playerCard/ClubPlayerCardMobile.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function ClubPlayersList({
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
        <ClubPlayerCardMobile
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
