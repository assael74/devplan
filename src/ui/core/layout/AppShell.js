import React from 'react'
import { Box } from '@mui/joy'

export default function AppShell({ children }) {
  return (
    <Box
      sx={{
        height: '100vh',
        height: '100dvh',
        overflow: 'hidden',
        bgcolor: 'background.body',
        color: 'text.primary',
      }}
    >
      {children}
    </Box>
  )
}
