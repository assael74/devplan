// src/features/bulkActions/players/delete/configs/playersDelete.config.js

export const PLAYERS_DELETE_SCOPE = {
  SELECTED: 'selected',
  ALL_TEAM_PLAYERS: 'allTeamPlayers',
}

export const PLAYERS_DELETE_CONFIRM_MODE = {
  COUNT: 'count',
  TEAM_NAME: 'teamName',
}

export const PLAYERS_DELETE_STATUS = {
  EMPTY: 'empty',
  READY: 'ready',
  BLOCKED: 'blocked',
  RUNNING: 'running',
  DONE: 'done',
  ERROR: 'error',
}

export const PLAYERS_DELETE_SCOPE_OPTIONS = [
  {
    id: PLAYERS_DELETE_SCOPE.SELECTED,
    label: 'שחקנים מסומנים',
    description: 'מחיקת השחקנים שנבחרו בלבד',
    confirmMode: PLAYERS_DELETE_CONFIRM_MODE.COUNT,
    dangerLevel: 'medium',
  },
  {
    id: PLAYERS_DELETE_SCOPE.ALL_TEAM_PLAYERS,
    label: 'כל שחקני הקבוצה',
    description: 'מחיקת כל השחקנים המשויכים לקבוצה',
    confirmMode: PLAYERS_DELETE_CONFIRM_MODE.TEAM_NAME,
    dangerLevel: 'high',
  },
]
