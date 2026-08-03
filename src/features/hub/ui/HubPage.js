// src/features/hub/ui/HubPage.js

import React from 'react'
import { Box, CircularProgress, Sheet, Typography } from '@mui/joy'

import HubRootDesktop from '../components/desktop/HubRootDesktop.js'
import HubRootMobile from '../components/mobile/HubRootMobile.js'
import { HUB_SCOPE } from '../scopes/scope.js'
import { useHubPageModel } from './useHubPageModel.js'

function LoadingView() {
  return (
    <Sheet sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size="sm" />
        <Typography level="body-sm">טוען נתונים.</Typography>
      </Box>
    </Sheet>
  )
}

function ErrorView() {
  return (
    <Sheet sx={{ p: 2 }}>
      <Typography level="body-sm">שגיאה בטעינת נתונים</Typography>
    </Sheet>
  )
}

export default function HubPage({ scope = HUB_SCOPE.INTERNAL }) {
  const model = useHubPageModel({ scope })

  if (model.loading) return <LoadingView />
  if (model.error) return <ErrorView />

  return model.isMobile
    ? <HubRootMobile {...model.mobileProps} />
    : <HubRootDesktop {...model.desktopProps} />
}
