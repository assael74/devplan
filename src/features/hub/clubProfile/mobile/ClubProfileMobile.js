// features/hub/clubProfile/mobile/ClubProfileMobile.js

import React from 'react'
import ProfileShell from '../../sharedProfile/ProfileShell'

import ClubHeader from './components/ClubHeader'
import ClubNav from './components/ClubNav'
import ClubModules from './components/ClubModules'
import ClubProfileFab from './components/ClubProfileFab'

export default function ClubProfileMobile({
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
      entityType="club"
      taskContext={taskContext}
      headerProps={{ counts }}
      HeaderComp={ClubHeader}
      NavComp={ClubNav}
      RendererComp={ClubModules}
      FabComp={ClubProfileFab}
    />
  )
}
