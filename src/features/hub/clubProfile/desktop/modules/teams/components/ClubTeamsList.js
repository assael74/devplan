// clubProfile/desktop/modules/teams/components/ClubTeamsList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubTeamRow from './ClubTeamRow.js'

import { clubTeamsListSx as sx } from '../sx/clubTeams.list.sx.js'

export default function ClubTeamsList({ rows, onEditTeam }) {
  if (!rows?.length) {
    return (
      <Box sx={sx.emptyState}>
        <Typography level="title-sm">לא נמצאו קבוצות</Typography>
        <Typography level="body-sm" sx={{ opacity: 0.72 }}>
          נסה לשנות פילטרים או לאפס את החיפוש.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      {rows.map((row) => (
        <ClubTeamRow
          key={row.id}
          row={row}
          onEdit={onEditTeam}
        />
      ))}
    </Box>
  )
}
