// src/features/hub/sharedProfile/ProfileShell.js

import React from 'react'
import { Sheet, Box } from '@mui/joy'

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
}) {
  const isMeetings = tab === 'meetings'

  return (
    <Sheet
      sx={{
        height: '100dvh',
        bgcolor: 'background.body',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >

      {HeaderComp ? <HeaderComp entity={entity} context={context} tab={tab} {...headerProps} /> : null}

      {NavComp ? (
        <Box sx={{ px: 1.25, pt: 1 }}>
          <NavComp entity={entity} context={context} tab={tab} {...navProps} />
        </Box>
      ) : null}

      <Box
        className="dpScrollThin"
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: isMeetings ? 'hidden' : 'auto',
          pt: 1.25,
          pb: 2,
          scrollPaddingBottom: 8,
          overscrollBehavior: 'contain',
        }}
      >
        {RendererComp ? (
          <RendererComp entity={entity} context={context} tab={tab} {...rendererProps} />
        ) : null}

      </Box>

      {FabComp ?
        <FabComp
          entity={entity}
          context={context}
          tab={tab}
          entityType={entity}
          taskContext={taskContext}
          {...fabProps}
        />
        : null
      }
    </Sheet>
  )
}
