// features/hub/teamProfile/desktop/teamModules.map.js

import InfoModule from './modules/info/PlayerInfoModule'
import AbilitiesModule from './modules/abilities/PlayerAbilitiesModule'
import PlayerGamesModule from './modules/games/PlayerGamesModule'
import PerformanceModule from './modules/performance/PlayerPerformanceModule'
import MeetingsModule from './modules/meetings/PlayerMeetingsModule'
import PaymentsModule from './modules/payments/PlayerPaymentsModule'
import PlayerVideosModule from './modules/videos/PlayerVideosModule.js'
import PlayerTrainingsModule from './modules/trainings/PlayerTrainingsModule'

export const desktopProjectPlayerModulesMap = {
  info: InfoModule,
  abilities: AbilitiesModule,
  games: PlayerGamesModule,
  performance: PerformanceModule,
  meetings: MeetingsModule,
  payments: PaymentsModule,
  videoAnalysis: PlayerVideosModule,
  trainings: PlayerTrainingsModule,
}

export const desktopPlayerModulesMap = {
  info: InfoModule,
  abilities: AbilitiesModule,
  games: PlayerGamesModule,
  performance: PerformanceModule,
  videoAnalysis: PlayerVideosModule,
}
