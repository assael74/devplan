// preview/previewDomainCard/domains/club/players/components/ClubPlayerEmpty.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import { tableSx as sx } from '../sx/clubPlayersTable.sx'

export default function ClubPlayerEmpty() {
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
