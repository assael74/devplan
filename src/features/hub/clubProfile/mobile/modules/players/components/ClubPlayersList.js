// clubProfile/mobile/modules/players/components/ClubPlayersList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubPlayerCardMobile from './playerCard/ClubPlayerCardMobile.js'

import { listSx as sx } from '../sx/list.sx.js'

const getPlayerId = row => {
  return String(row?.playerId || row?.id || '').trim()
}

const getPerformance = ({ row, profileData }) => {
  const playerId = getPlayerId(row)

  return (
    profileData?.playersScoring?.byId[playerId] ||
    profileData?.scoring?.players?.byId[playerId] ||
    row?.performance ||
    null
  )
}

export default function ClubPlayersList({
  rows,
  profileData,
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
      {rows.map((row) => {
        const playerId = getPlayerId(row)
        const performance = getPerformance({ row, profileData })

        return (
          <ClubPlayerCardMobile
            key={row.id}
            row={row}
            performance={performance}
            onOpenPlayer={onOpenPlayer}
            onAvatarClick={onAvatarClick}
            onEditPlayer={onEditPlayer}
            onEditPosition={onEditPosition}
          />
        )
      })}
    </Box>
  )
}
