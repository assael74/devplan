// clubProfile/desktop/modules/players/components/ClubPlayersList.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import ClubPlayerRow from './ClubPlayerRow.js'

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

export default function ClubPlayersList({ rows = [], profileData, }) {
  if (!rows.length) {
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
      {rows.map(row => {
        const playerId = getPlayerId(row)
        const performance = getPerformance({ row, profileData })

        return (
          <ClubPlayerRow
            key={playerId}
            row={row}
            performance={performance}
          />
        )
      })}
    </Box>
  )
}
