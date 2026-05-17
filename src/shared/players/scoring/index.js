// src/shared/players/scoring/index.js

/*
|--------------------------------------------------------------------------
| Player Scoring Engine / Public API
|--------------------------------------------------------------------------
|
| אחריות:
| נקודת הייצוא הציבורית של מנוע ציון שחקן.
|
| קובץ כניסה חיצוני:
| כל שימוש מחוץ לתיקיית scoring צריך לעבור דרך הקובץ הזה.
|
| Public API:
| - buildScoringScope
| - resolveScoringReadiness
| - buildScoringContext
| - buildPlayerMatchScore
| - buildMatchScoreInput
| - buildGamePlayerScores
| - buildScopedGameScores
*/

export {
  buildScoringScope,
} from './scoring.scope.js'

export {
  resolveScoringReadiness,
} from './scoring.readiness.js'

export {
  buildScoringContext,
} from './scoring.context.js'

export {
  buildPlayerMatchScore,
} from './scoring.match.js'

export {
  buildPlayerSeasonScore,
} from './scoring.season.js'

export {
  buildMatchScoreInput,
} from './adapters/matchInput.js'

export {
  buildGamePlayerScores,
} from './adapters/gameScores.js'

export {
  buildScopedGameScores,
} from './adapters/scopeScores.js'
