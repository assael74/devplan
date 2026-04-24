// features/hub/clubProfile/sharedUi/PlayerModules.js

import React from 'react'
import ProfileModuleRenderer from '../../sharedProfile/ProfileModuleRenderer'

export default function PlayerModules({
  entity,
  context,
  tab,
  modulesMap = {},
  meetingsInsightsRequest = 0,
  paymentsInsightsRequest = 0,
  abilitiesInsightsRequest = 0,
  videoInsightsRequest = 0,
  gamesInsightsRequest = 0,
  performanceInsightsRequest = 0,
  trainingsInsightsRequest = 0,
}) {
  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      modulesMap={modulesMap}
      meetingsInsightsRequest={meetingsInsightsRequest}
      paymentsInsightsRequest={paymentsInsightsRequest}
      abilitiesInsightsRequest={abilitiesInsightsRequest}
      videoInsightsRequest={videoInsightsRequest}
      gamesInsightsRequest={gamesInsightsRequest}
      performanceInsightsRequest={performanceInsightsRequest}
      trainingsInsightsRequest={trainingsInsightsRequest}
    />
  )
}
