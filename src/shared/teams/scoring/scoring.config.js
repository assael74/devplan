// src/shared/teams/scoring/scoring.config.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Config
|--------------------------------------------------------------------------
|
| אחריות:
| הגדרות בסיס למנוע ציון קבוצה.
|
| כאן מגדירים:
| - ציון בסיס
| - גבולות ציון
| - מספר משחקי ברירת מחדל
| - fallback לרמת קושי
| - משקולות הציון
| - ערכי חו״ד sportingDirector
*/

export const TEAM_SCORING_CONFIG = {
  baseRating: 6,
  minRating: 4,
  maxRating: 8.5,

  defaultLeagueGames: 30,
  defaultOpponentDifficulty: 'equal',

  minRatedGames: 1,
  reliableGames: 5,
}

export const TEAM_SCORING_WEIGHTS = {
  result: 0.35,
  attack: 0.18,
  defense: 0.18,
  context: 0.09,
  sportingDirector: 0.2,
}

export const TEAM_SCORING_SPORTING_DIRECTOR_VALUES = {
  excellent: 0.6,
  positive: 0.35,
  neutral: 0,
  negative: -0.35,
  poor: -0.6,
}
