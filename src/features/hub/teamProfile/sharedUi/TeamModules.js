// features/hub/teamProfile/sharedUi/TeamModules.js

import React from 'react'
import ProfileModuleRenderer from '../../sharedProfile/ProfileModuleRenderer'

export default function TeamModules({
  entity,
  context,
  tab,
  modulesMap = {},
  playersInsightsRequest = 0,
  gamesInsightsRequest = 0,
  performanceInsightsRequest = 0,
  abilitiesInsightsRequest = 0,
  videoInsightsRequest = 0,
}) {
  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      modulesMap={modulesMap}
      playersInsightsRequest={playersInsightsRequest}
      gamesInsightsRequest={gamesInsightsRequest}
      performanceInsightsRequest={performanceInsightsRequest}
      abilitiesInsightsRequest={abilitiesInsightsRequest}
      videoInsightsRequest={videoInsightsRequest}
    />
  )
}
