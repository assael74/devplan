// features/hub/teamProfile/mobile/teamModulesMobile.map.js

import TeamAbilitiesModule from './modules/abilities/TeamAbilitiesModule.js'
import TeamGamesModule from './modules/games/TeamGamesModule.js'
import TeamManagementModule from './modules/management/TeamManagementModule.js'
import TeamPlayersModule from './modules/players/TeamPlayersModule.js'
import TeamVideosModule from './modules/videos/TeamVideosModule.js'
import TeamTrainingsModule from './modules/trainings/TeamTrainingsModule.js'

export const mobileTeamModulesMap = {
  management: TeamManagementModule,
  players: TeamPlayersModule,
  abilities: TeamAbilitiesModule,
  performance: null,
  games: TeamGamesModule,
  videos: TeamVideosModule,
  trainings: TeamTrainingsModule,
}
