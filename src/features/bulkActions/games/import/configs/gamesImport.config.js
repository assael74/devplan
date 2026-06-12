// src/features/bulkActions/games/import/configs/gamesImport.config.js

export const GAMES_IMPORT_DEFAULTS = {
  gameHour: '12:00',
  goalsFor: 0,
  goalsAgainst: 0,
  gameStatus: 'scheduled',
  home: true,
  gameLeagueNum: '',
}

export const gamesImportConfig = {
  type: 'games',

  columns: {
    gameDate: [
      'תאריך',
      'תאריך משחק',
      'date',
      'gameDate',
      'game_date',
    ],

    gameLeagueNum: [
      'מחזור',
      'מספר מחזור',
      'מחזור ליגה',
      'round',
      'leagueNum',
      'gameLeagueNum',
      'game_league_num',
    ],

    gameHour: [
      'שעה',
      'שעת משחק',
      'hour',
      'time',
      'gameHour',
      'game_hour',
    ],

    rivel: [
      'יריבה',
      'קבוצה יריבה',
      'נגד',
      'opponent',
      'rival',
      'rivel',
    ],

    home: [
      'בית/חוץ',
      'בית חוץ',
      'מיקום',
      'homeAway',
      'home_away',
      'home',
    ],

    type: [
      'סוג משחק',
      'מסגרת',
      'מפעל',
      'type',
      'competition',
      'gameType',
    ],

    gameDuration: [
      'משך משחק',
      'דקות משחק',
      'משך',
      'duration',
      'gameDuration',
      'game_duration',
    ],

    difficulty: [
      'קושי',
      'דרגת קושי',
      'difficulty',
    ],

    goalsFor: [
      'שערי זכות',
      'זכות',
      'כבשנו',
      'goalsFor',
      'goals_for',
      'gf',
    ],

    goalsAgainst: [
      'שערי חובה',
      'חובה',
      'ספגנו',
      'goalsAgainst',
      'goals_against',
      'ga',
    ],
  },

  required: [
    'gameDate',
    'rivel',
    'home',
    'type',
    'gameDuration',
  ],

  defaults: GAMES_IMPORT_DEFAULTS,
}
