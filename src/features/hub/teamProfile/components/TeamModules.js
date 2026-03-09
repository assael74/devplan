// features/hub/teamProfile/components/TeamModules.js
import React from 'react'
import ProfileModuleRenderer from '../../../hub/sharedProfile/ProfileModuleRenderer'
import TeamManagementModule from '../modules/management/TeamManagementModule.js'
import TeamPlayersModule from '../modules/players/TeamPlayersModule.js'
import TeamGamesModule from '../modules/games/TeamGamesModule.js'
import TeamPerformanceModule from '../modules/performance/TeamPerformanceModule.js'
import TeamAbilitiesModule from '../modules/abilities/TeamAbilitiesModule.js'
import TeamVideosModule from '../modules/videos/TeamVideosModule.js'

// modules
const modulesMap = {
  management: TeamManagementModule,
  players: TeamPlayersModule,
  abilities: TeamAbilitiesModule,
  performance: TeamPerformanceModule,
  games: TeamGamesModule,
  videos: TeamVideosModule
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
