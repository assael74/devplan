// features/hub/clubProfile/sharedUi/ClubModules.js

import React from 'react'
import ProfileModuleRenderer from '../../sharedProfile/ProfileModuleRenderer'

export default function ClubModules({
  entity,
  context,
  tab,
  modulesMap = {},
  teamsInsightsRequest = 0,
  playersInsightsRequest = 0,
}) {
  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      modulesMap={modulesMap}
      teamsInsightsRequest={teamsInsightsRequest}
      playersInsightsRequest={playersInsightsRequest}
    />
  )
}
