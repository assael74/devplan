// src/shared/entityLifecycle/cascade/team/teamCascadeDelete.keys.js

export const TEAM_CASCADE_DELETE_KEYS = {
  team: [
    'teams.teamsInfo',
    'teams.teamsTraining',
    'teams.teamsStats',
  ],

  players: [
    'players.playersInfo',
    'players.playersNames',
    'players.playersParents',
    'players.playersTeam',
    'players.playersProInfo',
    'players.playersAbilities',
    'players.playersStats',
  ],

  games: [
    'games.gameInfo',
    'games.gameResult',
    'games.gameTime',
    'games.gamePlayers',
  ],

  meetings: [
    'meetings.meetingInfo',
    'meetings.meetingNotes',
  ],

  payments: [
    'payments.paymentOperative',
    'payments.paymentProfit',
  ],
}

export const TEAM_CASCADE_DELETE_ORDER = [
  'paymentsArchive',
  'stats',
  'games',
  'meetings',
  'players',
  'team',
  'storage',
]
