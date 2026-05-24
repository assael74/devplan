// clubProfile/desktop/modules/teams/components/ClubTeamsList.js

import React from 'react'
import { Box } from '@mui/joy'

import ClubTeamRow from './ClubTeamRow.js'

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

export default function ClubTeamsList({ rows = [], profileData, onEditTeam }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      {rows.map(row => {
        const teamId = getTeamId(row)

        return (
          <ClubTeamRow
            key={teamId}
            row={row}
            performance={getTeamPerformance({ row, profileData })}
            onEdit={onEditTeam}
          />
        )
      })}
    </Box>
  )
}
