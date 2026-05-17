// src/shared/players/scoring/scoring.config.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / 1. Config
|--------------------------------------------------------------------------
|
| אחריות:
| הגדרת קבועי הבסיס של מנוע ציון שחקן.
|
| סדר במנוע:
| 1 מתוך 5.
|
| משמש את:
| - scoring.readiness.js
| - scoring.match.js
|
| כולל:
| - ציון בסיס
| - גבולות ציון
| - רף דקות מינימלי
| - ברירת מחדל לרמת יריבה
| - משקלי רכיבי הציון
| - משקלי עמדה להתקפה / הגנה
*/

export const PLAYER_SCORING_DEFAULT_SCOPE = {
  gameTypes: ['league'],
  limit: null,
  dateFrom: null,
  dateTo: null,
  sortDirection: 'desc',
}

export const PLAYER_SCORING_CONFIG = {
  baseRating: 6,
  minRating: 0,
  maxRating: 10,
  minRatedMinutes: 10,
  defaultOpponentLevel: 'equal',
}

export const PLAYER_SCORING_WEIGHTS = {
  personal: 0.45,
  teamImpact: 0.3,
  targetPace: 0.15,
  coach: 0.1,
}

export const PLAYER_SCORING_POSITION_WEIGHTS = {
  goalkeeper: {
    attack: 0,
    defense: 1,
  },

  defense: {
    attack: 0.1,
    defense: 0.9,
  },

  dmMid: {
    attack: 0.35,
    defense: 0.65,
  },

  midfield: {
    attack: 0.5,
    defense: 0.5,
  },

  atMidfield: {
    attack: 0.7,
    defense: 0.3,
  },

  attack: {
    attack: 0.85,
    defense: 0.15,
  },
}

export const PLAYER_SCORING_OPPONENT_MODIFIERS = {
  easy: 0.95,
  equal: 1,
  hard: 1.08,
}
