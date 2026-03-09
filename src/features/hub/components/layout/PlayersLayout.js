import React from 'react'
import { Box } from '@mui/joy'
import { layoutSx } from './hubComponents.sx'

export default function PlayersLayout({ list, preview }) {
  return (
    <Box sx={{ p: 1, display: 'flex', gap: 1.5, height: '100vh', height: '100dvh', minHeight: 0, overflow: 'hidden' }}>
      <Box sx={layoutSx.listPane}>
        {list}
      </Box>
      <Box sx={{ flex: '0 0 65%', display: { xs: 'none', md: 'block' },  minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        {preview}
      </Box>
    </Box>
  )
}
