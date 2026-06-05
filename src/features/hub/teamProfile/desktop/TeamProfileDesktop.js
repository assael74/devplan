// features/hub/teamProfile/desktop/TeamProfileDesktop.js

import React, { useState } from 'react'
import ProfileShell from '../../sharedProfile/ProfileShell'

import TeamHeader from './components/TeamHeader'
import TeamNav from './components/TeamNav'

import TeamModules from '../sharedUi/TeamModules'
import { desktopTeamModulesMap } from './teamModules.map'

import TeamProfileFab from '../sharedUi/TeamProfileFab'

export default function TeamProfileDesktop({
  tab,
  entity,
  context,
  taskContext,
  counts,
  profileData,
}) {
  const [playersInsightsRequest, setPlayersInsightsRequest] = useState(0)
  const [gamesInsightsRequest, setGamesInsightsRequest] = useState(0)
  const [gamesImportRequest, setGamesImportRequest] = useState(0)
  const [performanceInsightsRequest, setPerformanceInsightsRequest] = useState(0)
  const [abilitiesInsightsRequest, setAbilitiesInsightsRequest] = useState(0)
  const [videoInsightsRequest, setVideoInsightsRequest] = useState(0)

  const [playersInsightsStatus, setPlayersInsightsStatus] = useState('empty')

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
      rendererProps={{
        modulesMap: desktopTeamModulesMap,
        profileData,
        playersInsightsRequest,
        gamesInsightsRequest,
        gamesImportRequest,
        performanceInsightsRequest,
        abilitiesInsightsRequest,
        videoInsightsRequest,
        onPlayersInsightsStatusChange: setPlayersInsightsStatus,
      }}
      fabProps={{
        playersInsightsStatus,
        onOpenPlayersInsights: () => {
          if (playersInsightsStatus !== 'ready') return

          setPlayersInsightsRequest(v => v + 1)
        },
        onOpenGamesInsights: () => setGamesInsightsRequest(v => v + 1),
        onImportGames: () => setGamesImportRequest(v => v + 1),
        onOpenPerformanceInsights: () => setPerformanceInsightsRequest(v => v + 1),
        onOpenAbilitiesInsights: () => setAbilitiesInsightsRequest(v => v + 1),
        onOpenVideoInsights: () => setVideoInsightsRequest(v => v + 1),
      }}
    />
  )
}
