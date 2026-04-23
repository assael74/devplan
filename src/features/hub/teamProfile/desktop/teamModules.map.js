// features/hub/teamProfile/desktop/teamModules.map.js

import TeamManagementModule from './modules/management/TeamManagementModule.js'
import TeamPlayersModule from './modules/players/TeamPlayersModule.js'
import TeamGamesModule from './modules/games/TeamGamesModule.js'
import TeamPerformanceModule from './modules/performance/TeamPerformanceModule.js'
import TeamAbilitiesModule from './modules/abilities/TeamAbilitiesModule.js'
import TeamVideosModule from './modules/videos/TeamVideosModule.js'
import TeamTrainingsModule from './modules/trainings/TeamTrainingsModule.js'

export const desktopTeamModulesMap = {
  management: TeamManagementModule,
  players: TeamPlayersModule,
  abilities: TeamAbilitiesModule,
  performance: TeamPerformanceModule,
  games: TeamGamesModule,
  videos: TeamVideosModule,
  trainings: TeamTrainingsModule,
}
