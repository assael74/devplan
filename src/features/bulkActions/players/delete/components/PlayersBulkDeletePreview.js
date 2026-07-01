// src/features/bulkActions/players/delete/components/PlayersBulkDeletePreview.js

import React from 'react'
import { Box, Table, Typography } from '@mui/joy'

import PlayersBulkDeleteStatusChip from './PlayersBulkDeleteStatusChip.js'
import { playersDeleteModalSx as sx } from './sx/playersDeleteModal.sx.js'

function getPlayerData(player = {}) {
  return player?.player || player
}

function getPlayerId(player = {}) {
  const data = getPlayerData(player)
  return player?.id || player?.playerId || data?.id || ''
}

function getPlayerName(player = {}) {
  const data = getPlayerData(player)

  const firstName = String(data?.playerFirstName || '').trim()
  const lastName = String(data?.playerLastName || '').trim()
  const fullName = `${firstName} ${lastName}`.trim()

  return fullName || data?.playerName || data?.name || '-'
}

function getBirth(player = {}) {
  const data = getPlayerData(player)
  return data?.birth || data?.birthYear || '-'
}

function getPosition(player = {}) {
  const data = getPlayerData(player)

  return (
    data?.primaryPosition ||
    data?.position ||
    data?.positions?.[0] ||
    '-'
  )
}

function getTeamName(player = {}) {
  const data = getPlayerData(player)
  return data?.teamName || player?.teamName || '-'
}

export default function PlayersBulkDeletePreview({ players = [] }) {
  if (!players.length) {
    return (
      <Typography level="body-sm" color="neutral">
        אין שחקנים להצגה.
      </Typography>
    )
  }

  return (
    <Box sx={sx.previewBox} className="dpScrollThin">
      <Table size="sm" stickyHeader hoverRow sx={sx.previewTable}>
        <thead>
          <tr>
            <th>שחקן</th>
            <th>שנתון</th>
            <th>עמדה</th>
            <th>קבוצה</th>
            <th>סטטוס</th>
          </tr>
        </thead>

        <tbody>
          {players.map(player => (
            <tr key={getPlayerId(player)}>
              <td>{getPlayerName(player)}</td>
              <td>{getBirth(player)}</td>
              <td>{getPosition(player)}</td>
              <td>{getTeamName(player)}</td>

              <td>
                <PlayersBulkDeleteStatusChip player={player} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  )
}
