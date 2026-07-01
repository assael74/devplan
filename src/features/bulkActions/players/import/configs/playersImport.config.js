// src/features/bulkActions/players/import/configs/playersImport.config.js

export const PLAYERS_IMPORT_DEFAULTS = {
  active: true,
  birth: '',
  ifaLink: '',
  playerFirstName: '',
  playerLastName: '',
}

export const playersImportConfig = {
  type: 'players',

  columns: {
    playerName: [
      'שם',
      'שם שחקן',
      'שחקן',
      'שם מלא',
      'player',
      'playerName',
      'fullName',
    ],

    playerFirstName: [
      'שם פרטי',
      'פרטי',
      'firstName',
      'playerFirstName',
      'first_name',
    ],

    playerLastName: [
      'שם משפחה',
      'משפחה',
      'lastName',
      'playerLastName',
      'last_name',
    ],

    birth: [
      'תאריך לידה',
      'חודש ושנת לידה',
      'שנתון',
      'שנת לידה',
      'לידה',
      'birth',
      'birthYear',
      'yearOfBirth',
    ],

    ifaLink: [
      'קישור התאחדות',
      'קישור שחקן',
      'קישור',
      'ifaLink',
      'ifa',
    ],
  },

  required: [],

  defaults: PLAYERS_IMPORT_DEFAULTS,
}
