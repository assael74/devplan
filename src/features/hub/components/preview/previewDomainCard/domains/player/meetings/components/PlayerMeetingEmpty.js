import React from 'react'
import { Box, Typography } from '@mui/joy'

import { tableSx as sx } from '../sx/playerMeetingsTable.sx.js'

export default function PlayerMeetingEmpty() {
  return (
    <Box sx={sx.emptyBoxSx}>
      <Typography level="body-md" fontWeight={700}>
        אין מפגשים להצגה
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary', mt: 0.5 }}>
        נסה לנקות חיפוש או לבטל סינון
      </Typography>
    </Box>
  )
}
