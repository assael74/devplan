// src/features/bulkActions/games/delete/configs/gamesDelete.config.js

export const GAMES_DELETE_SCOPE = {
  SELECTED: 'selected',
  ALL_TEAM_GAMES: 'allTeamGames',
}

export const GAMES_DELETE_CONFIRM_MODE = {
  COUNT: 'count',
  TEAM_NAME: 'teamName',
}

export const GAMES_DELETE_STATUS = {
  EMPTY: 'empty',
  READY: 'ready',
  BLOCKED: 'blocked',
  RUNNING: 'running',
  DONE: 'done',
  ERROR: 'error',
}

export const GAMES_DELETE_SCOPE_OPTIONS = [
  {
    id: GAMES_DELETE_SCOPE.SELECTED,
    label: 'משחקים מסומנים',
    description: 'מחיקת המשחקים שנבחרו בלבד',
    confirmMode: GAMES_DELETE_CONFIRM_MODE.COUNT,
    dangerLevel: 'medium',
  },
  {
    id: GAMES_DELETE_SCOPE.ALL_TEAM_GAMES,
    label: 'כל משחקי הקבוצה',
    description: 'מחיקת כל המשחקים המשויכים לקבוצה',
    confirmMode: GAMES_DELETE_CONFIRM_MODE.TEAM_NAME,
    dangerLevel: 'high',
  },
]
