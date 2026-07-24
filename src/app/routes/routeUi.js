// src/app/routes/routeUi.js

import React from 'react'
import { Box, CircularProgress, Typography } from '@mui/joy'

import DefaultSkeleton from '../../ui/loading/pages/DefaultSkeleton.js'

export function LoadingScreen({ label = 'טוען...' }) {
  return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <CircularProgress size='lg' />

      <Typography level='body-md' sx={{ mt: 2 }}>
        {label}
      </Typography>
    </Box>
  )
}

export function lazyRoute(element, fallback = <DefaultSkeleton />) {
  return <React.Suspense fallback={fallback}>{element}</React.Suspense>
}
