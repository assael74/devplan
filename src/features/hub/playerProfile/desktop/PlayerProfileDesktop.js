// features/hub/playerProfile/desktop/PlayerProfileDesktop.js

import React from 'react'
import ProfileShell from '../../sharedProfile/ProfileShell'

import PlayerHeader from './components/PlayerHeader'
import PlayerNav from './components/PlayerNav'
import PlayerModules from './components/PlayerModules'
import PlayerProfileFab from './components/PlayerProfileFab'

export default function PlayerProfileDesktop({
  tab,
  entity,
  context,
  taskContext,
  counts,
}) {
  return (
    <ProfileShell
      tab={tab}
      entity={entity}
      context={context}
      taskContext={taskContext}
      headerProps={{ counts }}
      HeaderComp={PlayerHeader}
      NavComp={PlayerNav}
      RendererComp={PlayerModules}
      FabComp={PlayerProfileFab}
    />
  )
}
