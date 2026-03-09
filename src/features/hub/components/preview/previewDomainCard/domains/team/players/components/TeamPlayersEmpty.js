// // preview/previewDomainCard/domains/team/players/components/TeamPlayersEmpty.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import { tableSx as sx } from '../sx/teamPlayersTable.sx'

export default function TeamPlayersEmpty() {
  return (
    <Box sx={sx.emptyBoxSx}>
      <Typography level="body-md" fontWeight={700}>
        אין שחקנים להצגה
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.5 }}>
        נסה לנקות חיפוש או לבטל סינון של שחקני מפתח בלבד
      </Typography>
    </Box>
  )
}
