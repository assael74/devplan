// src/shared/teams/scoring/adapters/index.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Adapters Public API
|--------------------------------------------------------------------------
|
| אחריות:
| נקודת ייצוא פנימית לכל adapters של מנוע ציון קבוצה.
|
| שימוש:
| מאפשר import נקי מתוך תיקיית adapters בלי להיכנס לקבצים ספציפיים.
*/

export {
  buildTeamMatchScoreInput,
} from './matchInput.js'

export {
  buildTeamGameScore,
} from './gameScores.js'

export {
  buildScopedTeamScores,
} from './scopeScores.js'
