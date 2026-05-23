// src/shared/teams/scoring/index.js

/*
|--------------------------------------------------------------------------
| Team Scoring Engine / Public API
|--------------------------------------------------------------------------
|
| אחריות:
| נקודת הייצוא הציבורית של מנוע ציון קבוצה.
|
| קובץ כניסה חיצוני:
| כל שימוש מחוץ לתיקיית scoring צריך לעבור דרך הקובץ הזה.
*/

export {
  TEAM_SCORING_CONFIG,
  TEAM_SCORING_WEIGHTS,
  TEAM_SCORING_SPORTING_DIRECTOR_VALUES,
} from './scoring.config.js'

export {
  TEAM_SCORING_STATUS,
  TEAM_SCORING_BLOCK_REASON,
  TEAM_SCORING_REASON_LABELS,
} from './scoring.status.js'

export {
  buildTeamScoringScope,
} from './scoring.scope.js'

export {
  resolveTeamScoringReadiness,
} from './scoring.readiness.js'

export {
  buildTeamScoringContext,
} from './scoring.context.js'

export {
  buildTeamMatchScore,
} from './scoring.match.js'

export {
  buildTeamSeasonScore,
} from './scoring.season.js'

export {
  buildTeamMatchScoreInput,
  buildTeamGameScore,
  buildScopedTeamScores,
} from './adapters/index.js'

export {
  buildTeamScoringDebugModel,
  printTeamScoringDebug,
} from './scoring.debug.js'
