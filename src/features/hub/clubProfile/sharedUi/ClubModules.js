// features/hub/clubProfile/sharedUi/ClubModules.js

import React from 'react'
import ProfileModuleRenderer from '../../sharedProfile/ProfileModuleRenderer'

export default function ClubModules({
  entity,
  context,
  tab,
  profileData,
  modulesMap = {},
  teamsInsightsRequest = 0,
  playersInsightsRequest = 0,
}) {
  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      profileData={profileData}
      modulesMap={modulesMap}
      teamsInsightsRequest={teamsInsightsRequest}
      playersInsightsRequest={playersInsightsRequest}
    />
  )
}
