// features/hub/components/desktop/layout/HubDesktopLayout.js

import React from 'react'
import { Box } from '@mui/joy'

import { layoutSx as sx } from './layout.sx'

export default function HubDesktopLayout({ list, control }) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        p: 1,
        pb: 1.5,
        display: 'flex',
        gap: 1.5,
        overflow: 'hidden',
      }}
    >
      <Box sx={sx.listPane}>
        {list}
      </Box>

      <Box
        className="dpScrollThin"
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          minWidth: 0,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarGutter: 'stable',
        }}
      >
        {control}
      </Box>
    </Box>
  )
}
