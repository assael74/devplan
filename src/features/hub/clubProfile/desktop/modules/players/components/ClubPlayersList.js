// clubProfile/desktop/modules/players/components/ClubPlayersList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import ClubPlayerRow from './ClubPlayerRow.js'

import { clubPlayersListSx as sx } from '../sx/clubPlayers.list.sx.js'

export default function ClubPlayersList({ rows }) {
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
        <ClubPlayerRow
          key={row.id}
          row={row}
        />
      ))}
    </Box>
  )
}
