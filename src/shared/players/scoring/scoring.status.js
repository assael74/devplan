// src/shared/players/scoring/scoring.status.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / 2. Status
|--------------------------------------------------------------------------
|
| אחריות:
| הגדרת סטטוסים, סיבות חסימה וטקסטים בסיסיים של המנוע.
|
| סדר במנוע:
| 2 מתוך 5.
|
| משמש את:
| - scoring.readiness.js
| - scoring.match.js
|
| כולל:
| - ready
| - blocked
| - notRated
| - סיבות חסימה
| - תוויות חסימה בעברית
*/

export const PLAYER_SCORING_STATUS = {
  READY: 'ready',
  BLOCKED: 'blocked',
  NOT_RATED: 'notRated',
}

export const PLAYER_SCORING_BLOCK_REASON = {
  MISSING_TEAM: 'missing_team',
  MISSING_TEAM_TARGET: 'missing_team_target',
  MISSING_MODE: 'missing_mode',
  MISSING_PLAYER: 'missing_player',
  MISSING_ROLE: 'missing_role',
  MISSING_POSITION: 'missing_position',
  MISSING_PLAYER_GAME: 'missing_player_game',
  MISSING_TIME_PLAYED: 'missing_time_played',
  BELOW_MIN_MINUTES: 'below_min_minutes',
}

export const PLAYER_SCORING_REASON_LABELS = {
  missing_team: 'חסרה קבוצה',
  missing_team_target: 'חסר יעד קבוצתי',
  missing_mode: 'לא נבחר בסיס חישוב',
  missing_player: 'חסר שחקן',
  missing_role: 'לא הוגדר מעמד שחקן',
  missing_position: 'לא הוגדרה עמדה ראשית',
  missing_player_game: 'חסרים נתוני שחקן במשחק',
  missing_time_played: 'חסרות דקות משחק',
  below_min_minutes: 'פחות מ־10 דקות',
}
