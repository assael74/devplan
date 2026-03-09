// features/hub/teamProfile/components/TeamModules.js
import React from 'react'
import ProfileModuleRenderer from '../../../hub/sharedProfile/ProfileModuleRenderer'
import ClubManagementModule from '../modules/management/ClubManagementModule.js'
import ClubTeamsModule from '../modules/teams/ClubTeamsModule.js'
import ClubPlayersModule from '../modules/players/ClubPlayersModule.js'
// modules

const modulesMap = {
  management: ClubManagementModule,
  teams: ClubTeamsModule,
  players: ClubPlayersModule,
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
