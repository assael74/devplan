// src/features/playersDatabase/constants/pdb.constants.js


export const PLAYERS_DATABASE_ROUTE = '/players-database'

export const PLAYERS_DATABASE_COLLECTIONS = {
  playerRoots: 'dbPlayers',
  leagues: 'dbLeagues',
  teamRoots: 'dbBirthTeams',
  teamSeasons: 'dbBirthTeamSeasons',
  playerSeasons: 'dbPlayerSeasons',
  playerSearchIndexes: 'dbSearchIndexes',
  clubProfiles: 'dbClubs',
  leaguesCenter: 'dbLeaguesCenter',
  clubsCenter: 'dbClubsCenter',
  clubsDirectory: 'dbClubsDirectory',
  writeActions: 'dbWriteActions',
}

export const PLAYERS_DATABASE_FAVORITES_DOCUMENTS = {
  PLAYERS: 'players',
  BIRTH_TEAMS: 'birthTeams',
}

export const PLAYERS_DATABASE_FAVORITE_TYPES = {
  PLAYER: 'player',
  BIRTH_TEAM: 'birthTeam',
}

export const PLAYERS_DATABASE_FAVORITES_LIMIT = 500

