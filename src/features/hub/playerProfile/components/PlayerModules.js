// src/features/players/playerProfile/components/PlayerModules.js
import React from 'react'
import ProfileModuleRenderer from '../../../hub/sharedProfile/ProfileModuleRenderer'

// modules
import InfoModule from '../modules/info/PlayerInfoModule'
import AbilitiesModule from '../modules/abilities/PlayerAbilitiesModule'
import PlayerGamesModule from '../modules/games/PlayerGamesModule'
import PerformanceModule from '../modules/performance/PlayerPerformanceModule'
import MeetingsModule from '../modules/meetings/PlayerMeetingsModule'
import PaymentsModule from '../modules/payments/PlayerPaymentsModule'
import PlayerVideosModule from '../modules/videos/PlayerVideosModule.js'
import PlayerTrainingsModule from '../modules/trainings/PlayerTrainingsModule'

const modulesProjectMap = {
  info: InfoModule,
  abilities: AbilitiesModule,
  games: PlayerGamesModule,
  performance: PerformanceModule,
  meetings: MeetingsModule,
  payments: PaymentsModule,
  videoAnalysis: PlayerVideosModule,
  trainings: PlayerTrainingsModule
}

const modulesMap = {
  info: InfoModule,
  abilities: AbilitiesModule,
  games: PlayerGamesModule,
  performance: PerformanceModule,
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
