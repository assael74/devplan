// features/hub/teamProfile/mobile/components/TeamModules.js

import React from 'react'
import ProfileModuleRenderer from '../../../../hub/sharedProfile/ProfileModuleRenderer'
import TeamAbilitiesModule from '../modules/abilities/TeamAbilitiesModule.js'
import TeamGamesModule from '../modules/games/TeamGamesModule.js'
import TeamManagementModule from '../modules/management/TeamManagementModule.js'


// modules
const modulesMap = {
  management: TeamManagementModule,
  players: null,
  abilities: TeamAbilitiesModule,
  performance: null,
  games: TeamGamesModule,
  videos: null,
  trainings: null
}

export default function TeamModules({ entity, context, tab }) {
  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      modulesMap={modulesMap}
    />
  )
}
