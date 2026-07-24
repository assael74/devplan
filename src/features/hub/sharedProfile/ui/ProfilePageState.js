// src/features/hub/sharedProfile/ui/ProfilePageState.js

import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress, Sheet, Typography } from '@mui/joy'

const LOADING_LABELS = {
  player: 'טוען שחקן…',
  team: 'טוען קבוצה…',
  club: 'טוען מועדון…',
}

export default function ProfilePageState({
  state,
  profileType,
  fallbackPath = '/hub',
}) {
  if (state === 'missing') {
    return <Navigate to={fallbackPath} replace />
  }

  if (state === 'error') {
    return (
      <Sheet sx={{ p: 2 }}>
        <Typography level="body-sm">שגיאה בטעינת נתונים</Typography>
      </Sheet>
    )
  }

  if (state === 'loading') {
    return (
      <Sheet sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size="sm" />
          <Typography level="body-sm">
            {LOADING_LABELS[profileType] || 'טוען נתונים…'}
          </Typography>
        </Box>
      </Sheet>
    )
  }

  return null
}
