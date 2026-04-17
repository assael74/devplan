// features/hub/clubProfile/mobile/components/ClubModules.js

import React from 'react'
import ProfileModuleRenderer from '../../../../hub/sharedProfile/ProfileModuleRenderer'
//import ClubManagementModule from '../modules/management/ClubManagementModule.js'
//import ClubTeamsModule from '../modules/teams/ClubTeamsModule.js'
//import ClubPlayersModule from '../modules/players/ClubPlayersModule.js'
// modules

const modulesMap = {
  management: null,
  teams: null,
  players: null,
}

export default function ClubModules({ entity, context, tab }) {
  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      modulesMap={modulesMap}
    />
  )
}
