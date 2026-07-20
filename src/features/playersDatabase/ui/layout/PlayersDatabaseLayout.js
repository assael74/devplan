// features/playersDatabase/ui/layout/PlayersDatabaseLayout.js

import * as React from 'react'
import { Box } from '@mui/joy'

import { pdbLayoutSx as sx } from './layout.sx.js'

export default function PlayersDatabaseLayout({ children }) {
  return (
    <Box sx={sx.root}>
      <Box sx={sx.content}>
        {children}
      </Box>
    </Box>
  )
}
