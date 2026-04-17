// // preview/previewDomainCard/domains/team/games/components/TeamGameEmpty.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { tableSx as sx } from '../sx/teamGamesTable.sx.js'

export default function TeamGamesEmpty() {
  return (
    <Box sx={sx.emptyBoxSx}>
      <Typography level="body-md" fontWeight={700}>
        אין משחקים להצגה
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.5 }}>
        נסה לנקות חיפוש או לבטל סינון
      </Typography>
    </Box>
  )
}
