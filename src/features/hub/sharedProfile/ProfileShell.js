// features/hub/sharedProfile/ProfileShell.js

import React from 'react'
import { Box, Button, CircularProgress, Sheet, Typography } from '@mui/joy'
import { useLocation, useNavigate } from 'react-router-dom'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

function ModuleLoadingFallback() {
  return (
    <Box
      sx={{
        minHeight: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: 2,
      }}
    >
      <CircularProgress size="sm" />
      <Typography level="body-sm">טוען מודול...</Typography>
    </Box>
  )
}

export default function ProfileShell({
  tab,
  entity,
  context,
  NavComp,
  FabComp,
  fabProps,
  taskContext,
  HeaderComp,
  RendererComp,
  headerProps,
  navProps,
  rendererProps,
  backRoute,
  scrollMode = 'page',
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const isContained = scrollMode === 'contained'

  const handleBack = () => {
    const returnTo = location.state?.returnTo || backRoute

    if (returnTo) {
      navigate(returnTo)
      return
    }

    navigate(-1)
  }

  const backAction = (
    <Button
      size="sm"
      variant="plain"
      color="neutral"
      startDecorator={iconUi({ id: 'back', size: 'sm' })}
      onClick={handleBack}
      sx={{
        minHeight: 30,
        px: 0.75,
        flexShrink: 0,
      }}
    >
      חזרה
    </Button>
  )

  return (
    <Sheet
      sx={{
        height: '100%',
        bgcolor: 'background.body',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {HeaderComp ? (
        <HeaderComp
          entity={entity}
          context={context}
          tab={tab}
          backAction={backAction}
          {...headerProps}
        />
      ) : null}

      {NavComp ? (
        <Box sx={{ px: 1.25, pt: 0.75, flexShrink: 0 }}>
          <NavComp entity={entity} context={context} tab={tab} {...navProps} />
        </Box>
      ) : null}

      <Box
        className={isContained ? undefined : 'dpScrollThin'}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: isContained ? 'hidden' : 'auto',
          pt: 1,
          pb: 2,
          scrollPaddingBottom: 8,
          overscrollBehavior: 'contain',
        }}
      >
        {RendererComp ? (
          <React.Suspense fallback={<ModuleLoadingFallback />}>
            <RendererComp entity={entity} context={context} tab={tab} {...rendererProps} />
          </React.Suspense>
        ) : null}
      </Box>

      {FabComp ? (
        <FabComp
          entity={entity}
          context={context}
          tab={tab}
          entityType={entity}
          taskContext={taskContext}
          {...fabProps}
        />
      ) : null}
    </Sheet>
  )
}
