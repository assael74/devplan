// clubProfile/mobile/modules/teams/components/ClubTeamsList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubTeamCardMobile from './teamCard/ClubTeamCardMobile.js'

import { listSx as sx } from '../sx/list.sx.js'

export default function ClubTeamsList({
  rows,
  onOpenTeam,
  onEditTeam,
  onAvatarClick,
  onToggleActive,
}) {
  if (!rows?.length) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצאו קבוצות להצגה</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      {rows.map((row) => (
        <ClubTeamCardMobile
          key={row.id}
          row={row}
          onOpenTeam={onOpenTeam}
          onAvatarClick={onAvatarClick}
          onEditTeam={onEditTeam}
        />
      ))}
    </Box>
  )
}
