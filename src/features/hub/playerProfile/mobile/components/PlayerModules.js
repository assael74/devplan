// playerProfile/mobile/components/PlayerModules.js

import React from 'react'
import ProfileModuleRenderer from '../../../../hub/sharedProfile/ProfileModuleRenderer'

// modules
import PlayerInfoModule from '../modules/info/PlayerInfoModule'
import PlayerAbilitiesModule from '../modules/abilities/PlayerAbilitiesModule'
import PlayerGamesModule from '../modules/games/PlayerGamesModule'
import PlayerMeetingsModule from '../modules/meetings/PlayerMeetingsModule'

const modulesProjectMap = {
  info: PlayerInfoModule,
  abilities: PlayerAbilitiesModule,
  games: PlayerGamesModule,
  performance: null,
  meetings: PlayerMeetingsModule,
  payments: null,
  videoAnalysis: null,
  trainings: null
}

const modulesMap = {
  info: PlayerInfoModule,
  abilities: PlayerAbilitiesModule,
  games: PlayerGamesModule,
  performance: null,
  videoAnalysis: null
}

export default function PlayerModules({ entity, context, tab }) {
  const isProject = entity?.type === 'project'

  return (
    <ProfileModuleRenderer
      entity={entity}
      context={context}
      tab={tab}
      modulesMap={isProject ? modulesProjectMap : modulesMap}
    />
  )
}
