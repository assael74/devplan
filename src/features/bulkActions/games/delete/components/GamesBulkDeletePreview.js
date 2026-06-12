// src/features/bulkActions/games/delete/components/GamesBulkDeletePreview.js

import React from 'react'
import { Box, Table, Typography } from '@mui/joy'

import GamesBulkDeleteStatusChip from './GamesBulkDeleteStatusChip.js'
import { gamesDeleteModalSx as sx } from '../sx/gamesDeleteModal.sx.js'
import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'

const getOpponent = game => {
  return game?.rivel || game?.rival || '-'
}

const getResult = game => {
  const goalsFor = game?.goalsFor
  const goalsAgainst = game?.goalsAgainst

  if (goalsFor === undefined || goalsAgainst === undefined) return '-'

  return `${goalsFor}:${goalsAgainst}`
}

const getHomeAway = game => {
  if (game?.home === true || game?.isHome === true) return 'בית'
  if (game?.home === false || game?.isHome === false) return 'חוץ'

  return '-'
}

export default function GamesBulkDeletePreview({ games = [] }) {
  if (!games.length) {
    return (
      <Typography level="body-sm" color="neutral">
        אין משחקים להצגה.
      </Typography>
    )
  }

  return (
    <Box sx={sx.previewBox} className="dpScrollThin">
      <Table
        size="sm"
        stickyHeader
        hoverRow
        sx={{
          '--TableCell-paddingX': '8px',
          '--TableCell-paddingY': '6px',
        }}
      >
        <thead>
          <tr>
            <th>תאריך</th>
            <th>יריבה</th>
            <th>בית/חוץ</th>
            <th>תוצאה</th>
            <th>סטטוס</th>
          </tr>
        </thead>

        <tbody>
          {games.map(game => (
            <tr key={game?.id || game?.gameId}>
              <td>{getFullDateIl(game?.game?.gameDate || game?.game?.date)}</td>
              <td>{getOpponent(game?.game)}</td>
              <td>{getHomeAway(game?.game)}</td>
              <td>{getResult(game?.game)}</td>
              <td>
                <GamesBulkDeleteStatusChip game={game?.game} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  )
}
