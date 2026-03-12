// // preview/previewDomainCard/domains/player/games/components/PlayerGameEmpty.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import { tableSx as sx } from '../sx/playerGamesTable.sx.js'

export default function PlayerGameEmpty() {
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
