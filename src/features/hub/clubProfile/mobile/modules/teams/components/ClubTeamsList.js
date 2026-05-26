// clubProfile/mobile/modules/teams/components/ClubTeamsList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubTeamCardMobile from './teamCard/ClubTeamCardMobile.js'

import { listSx as sx } from '../sx/list.sx.js'

const getTeamId = row => {
  return String(row?.id || row?.teamId || '').trim()
}

const getTeamPerformance = ({ row, profileData }) => {
  const teamId = getTeamId(row)

  return (
    profileData?.teamsScoring?.byId[teamId] ||
    profileData?.scoring?.teams?.byId[teamId] ||
    row?.performance ||
    null
  )
}

export default function ClubTeamsList({
  rows,
  profileData,
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
      {rows.map((row) => {
        const teamId = getTeamId(row)

        return (
          <ClubTeamCardMobile
            key={row.id}
            row={row}
            performance={getTeamPerformance({ row, profileData })}
            onOpenTeam={onOpenTeam}
            onAvatarClick={onAvatarClick}
            onEditTeam={onEditTeam}
          />
        )
      })}
    </Box>
  )
}
