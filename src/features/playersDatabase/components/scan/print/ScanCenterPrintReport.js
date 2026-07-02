import React from 'react'
import { Box, Typography } from '@mui/joy'

import { scanPrintSx as sx } from './sx/print.sx.js'

const scopeLabel = {
  database: 'מאגר נתונים',
  year: 'שנתון',
  league: 'ליגה',
}

export default function ScanCenterPrintReport({ rows }) {
  return (
    <Box className="dpPrintSection" sx={sx.section}>
      <Typography level="h2">
        מרכז סריקה
      </Typography>

      <Typography level="body-sm" sx={sx.summary}>
        {rows.length} פרופילים בתצוגה המסוננת
      </Typography>

      <Box component="table" sx={sx.table}>
        <thead>
          <tr>
            <th>סוג</th>
            <th>פרופיל</th>
            <th>סטטוס</th>
            <th>ליגות</th>
            <th>שחקנים</th>
            <th>פרופילים</th>
            <th>בסיכון</th>
            <th>עדכון אחרון</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(row => (
            <tr key={row.id}>
              <td>{scopeLabel[row.scope] || row.scope || '-'}</td>
              <td>{row.title}</td>
              <td>{row.status || '-'}</td>
              <td>{row.leaguesCount || 0}</td>
              <td>{row.loadedPlayersCount || 0}</td>
              <td>{row.scoutProfilesCount || 0}</td>
              <td>{row.riskCount || 0}</td>
              <td>{row.latestSnapshotAt || '-'}</td>
            </tr>
          ))}
        </tbody>
      </Box>
    </Box>
  )
}
