// playerProfile/mobile/components/PlayerModules.js

import React from 'react'
import ProfileModuleRenderer from '../../../../hub/sharedProfile/ProfileModuleRenderer'

// modules
import PlayerInfoModule from '../modules/info/PlayerInfoModule'
import PlayerAbilitiesModule from '../modules/abilities/PlayerAbilitiesModule'
import PlayerGamesModule from '../modules/games/PlayerGamesModule'
import PlayerMeetingsModule from '../modules/meetings/PlayerMeetingsModule'
import PlayerVideosModule from '../modules/videos/PlayerVideosModule'
import PlayerTrainingsModule from '../modules/trainings/PlayerTrainingsModule'
import PlayerPaymentsModule from '../modules/payments/PlayerPaymentsModule'

const modulesProjectMap = {
  info: PlayerInfoModule,
  abilities: PlayerAbilitiesModule,
  games: PlayerGamesModule,
  performance: null,
  meetings: PlayerMeetingsModule,
  payments: PlayerPaymentsModule,
  videoAnalysis: PlayerVideosModule,
  trainings: PlayerTrainingsModule
}

const modulesMap = {
  info: PlayerInfoModule,
  abilities: PlayerAbilitiesModule,
  games: PlayerGamesModule,
  performance: PlayerPaymentsModule,
  videoAnalysis: PlayerVideosModule
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
