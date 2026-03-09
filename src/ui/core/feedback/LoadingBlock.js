import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/joy'

export default function LoadingBlock({ label = 'טוען...' }) {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <CircularProgress />
      <Typography level="body-sm" sx={{ mt: 2, color: 'text.tertiary' }}>
        {label}
      </Typography>
    </Box>
  )
}
