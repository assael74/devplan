// features/hub/clubProfile/desktop/clubModules.map.js

import ClubManagementModule from './modules/management/ClubManagementModule.js'
import ClubTeamsModule from './modules/teams/ClubTeamsModule.js'
import ClubPlayersModule from './modules/players/ClubPlayersModule.js'

export const desktopClubModulesMap = {
  management: ClubManagementModule,
  teams: ClubTeamsModule,
  players: ClubPlayersModule,
}
