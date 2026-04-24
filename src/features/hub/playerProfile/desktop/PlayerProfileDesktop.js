// features/hub/playerProfile/desktop/PlayerProfileDesktop.js

import React, { useState } from 'react'
import ProfileShell from '../../sharedProfile/ProfileShell'

import PlayerHeader from './components/PlayerHeader'
import PlayerNav from './components/PlayerNav'

import PlayerModules from '../sharedUi/PlayerModules.js'
import { desktopPlayerModulesMap, desktopProjectPlayerModulesMap } from './playerModules.map'

import PlayerProfileFab from '../sharedUi/PlayerProfileFab'

export default function PlayerProfileDesktop({
  tab,
  entity,
  context,
  taskContext,
  counts,
}) {
  const [meetingsInsightsRequest, setMeetingsInsightsRequest] = useState(0)
  const [paymentsInsightsRequest, setPaymentsInsightsRequest] = useState(0)
  const [abilitiesInsightsRequest, setAbilitiesInsightsRequest] = useState(0)
  const [videoInsightsRequest, setVideoInsightsRequest] = useState(0)
  const [gamesInsightsRequest, setGamesInsightsRequest] = useState(0)
  const [performanceInsightsRequest, setPerformanceInsightsRequest] = useState(0)
  const [trainingsInsightsRequest, setTrainingsInsightsRequest] = useState(0)

  const modulesMap =
    entity?.type === 'project'
      ? desktopProjectPlayerModulesMap
      : desktopPlayerModulesMap

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
      rendererProps={{
        modulesMap,
        meetingsInsightsRequest,
        paymentsInsightsRequest,
        abilitiesInsightsRequest,
        videoInsightsRequest,
        gamesInsightsRequest,
        performanceInsightsRequest,
        trainingsInsightsRequest,
      }}
      fabProps={{
        onOpenMeetingsInsights: () => setMeetingsInsightsRequest((v) => v + 1),
        onOpenPaymentsInsights: () => setPaymentsInsightsRequest((v) => v + 1),
        onOpenAbilitiesInsights: () => setAbilitiesInsightsRequest((v) => v + 1),
        onOpenVideoInsights: () => setVideoInsightsRequest((v) => v + 1),
        onOpenGamesInsights: () => setGamesInsightsRequest((v) => v + 1),
        onOpenPerformanceInsights: () => setPerformanceInsightsRequest((v) => v + 1),
        onOpenTrainingsInsights: () => setTrainingsInsightsRequest((v) => v + 1),
      }}
    />
  )
}
