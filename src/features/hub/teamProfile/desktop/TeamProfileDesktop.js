// features/hub/teamProfile/desktop/TeamProfileDesktop.js

import React from 'react'
import ProfileShell from '../../sharedProfile/ProfileShell'

import TeamHeader from './components/TeamHeader'
import TeamNav from './components/TeamNav'
import TeamModules from './components/TeamModules'
import TeamProfileFab from './components/TeamProfileFab'

export default function TeamProfileDesktop({
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
      HeaderComp={TeamHeader}
      NavComp={TeamNav}
      RendererComp={TeamModules}
      FabComp={TeamProfileFab}
    />
  )
}
