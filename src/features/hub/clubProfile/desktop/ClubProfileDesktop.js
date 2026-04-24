// features/hub/clubProfile/desktop/ClubProfileDesktop.js

import React, { useState } from 'react'
import ProfileShell from '../../sharedProfile/ProfileShell'

import ClubHeader from './components/ClubHeader'
import ClubNav from './components/ClubNav'

import ClubModules from '../sharedUi/ClubModules'
import { desktopClubModulesMap } from './clubModules.map'

import ClubProfileFab from '../sharedUi/ClubProfileFab'

export default function ClubProfileDesktop({
  tab,
  entity,
  context,
  taskContext,
  counts,
}) {
  const [playersInsightsRequest, setPlayersInsightsRequest] = useState(0)
  const [teamsInsightsRequest, setTeamsInsightsRequest] = useState(0)

  return (
    <ProfileShell
      tab={tab}
      entity={entity}
      context={context}
      taskContext={taskContext}
      headerProps={{ counts }}
      HeaderComp={ClubHeader}
      NavComp={ClubNav}
      RendererComp={ClubModules}
      FabComp={ClubProfileFab}
      rendererProps={{
        modulesMap: desktopClubModulesMap,
        playersInsightsRequest,
        teamsInsightsRequest,
      }}
      fabProps={{
        onOpenPlayersInsights: () => setPlayersInsightsRequest((v) => v + 1),
        onOpenTeamsInsights: () => setTeamsInsightsRequest((v) => v + 1),
      }}
    />
  )
}
