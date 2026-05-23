// src/shared/teams/scoring/scoring.status.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Status
|--------------------------------------------------------------------------
|
| אחריות:
| סטטוסים וסיבות חסימה של מנוע ציון קבוצה.
*/

export const TEAM_SCORING_STATUS = {
  READY: 'ready',
  BLOCKED: 'blocked',
  NOT_RATED: 'notRated',
}

export const TEAM_SCORING_BLOCK_REASON = {
  MISSING_TEAM: 'missing_team',
  MISSING_GAME: 'missing_game',
  MISSING_TEAM_TARGET: 'missing_team_target',
  MISSING_RESULT: 'missing_result',
  GAME_NOT_PLAYED: 'game_not_played',
}

export const TEAM_SCORING_REASON_LABELS = {
  [TEAM_SCORING_BLOCK_REASON.MISSING_TEAM]: 'חסרה קבוצה',
  [TEAM_SCORING_BLOCK_REASON.MISSING_GAME]: 'חסר משחק',
  [TEAM_SCORING_BLOCK_REASON.MISSING_TEAM_TARGET]: 'חסר יעד קבוצה',
  [TEAM_SCORING_BLOCK_REASON.MISSING_RESULT]: 'חסרה תוצאת משחק',
  [TEAM_SCORING_BLOCK_REASON.GAME_NOT_PLAYED]: 'המשחק עדיין לא שוחק',
}
