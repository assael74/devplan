// TEAMPROFILE/sharedUi/insights/teamPlayers/print/printTable.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { tableSx as sx } from './sx/table.sx.js'

const PlayerAvatar = ({ row }) => {
  if (row.photo) {
    return (
      <Box sx={sx.avatarWrap}>
        <img
          src={row.photo}
          alt=""
          style={sx.avatarImg}
        />
      </Box>
    )
  }

  return (
    <Box sx={sx.avatarWrap}>
      <Box sx={sx.avatarFallback}>
        {row.initials}
      </Box>
    </Box>
  )
}

const TableCell = ({ children, cellSx }) => {
  return (
    <td style={cellSx || sx.td}>
      {children}
    </td>
  )
}

export const PlayersTable = ({ rows = [] }) => {
  if (!rows.length) {
    return (
      <Typography sx={sx.emptyText}>
        אין שחקנים להצגה במעמד זה.
      </Typography>
    )
  }

  return (
    <Box sx={sx.tableWrap}>
      <table style={sx.table} dir="rtl">
        <thead>
          <tr>
            <th style={{ ...sx.th, width: '4%' }}>#</th>
            <th style={{ ...sx.th, width: '7%' }}>תמונה</th>
            <th style={{ ...sx.th, width: '15%' }}>שחקן</th>
            <th style={{ ...sx.th, width: '9%' }}>עמדה</th>
            <th style={{ ...sx.th, width: '14%' }}>פרופיל</th>
            <th style={{ ...sx.th, width: '10%' }}>מדד יעילות</th>
            <th style={{ ...sx.th, width: '10%' }}>מדד השפעה</th>
            <th style={{ ...sx.th, width: '6%' }}>מש׳</th>
            <th style={{ ...sx.th, width: '7%' }}>דק׳</th>
            <th style={{ ...sx.th, width: '6%' }}>שערים</th>
            <th style={{ ...sx.th, width: '6%' }}>בישולים</th>
            <th style={{ ...sx.th, width: '6%' }}>הערה</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(row => {
            return (
              <tr key={row.id} className="dpPrintRow">
                <TableCell>{row.index}</TableCell>

                <TableCell>
                  <PlayerAvatar row={row} />
                </TableCell>

                <TableCell>{row.name}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell>{row.profile}</TableCell>
                <TableCell>{row.rating}</TableCell>

                <TableCell cellSx={sx.tdImpact(row.tvaTone)}>
                  {row.tva}
                </TableCell>

                <TableCell>{row.games}</TableCell>
                <TableCell>{row.minutes}</TableCell>
                <TableCell>{row.goals}</TableCell>
                <TableCell>{row.assists}</TableCell>

                <TableCell cellSx={sx.tdNote}>
                  {row.subStatus}
                </TableCell>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Box>
  )
}
