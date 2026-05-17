// src/shared/players/insights/index.js

/*
|--------------------------------------------------------------------------
| Player Insights Engine / Public API
|--------------------------------------------------------------------------
|
| אחריות:
| נקודת הייצוא הציבורית של מנוע תובנות שחקן.
|
| המנוע הזה לא מחשב ציון.
| הוא מקבל תוצרי scoring ומתרגם אותם לפרופיל ביצוע בפועל:
| עוגן סטטיסטי, הג'וקר, בורג מרכזי, תורם משני,
| לא יציב, נקודת תורפה, מחוץ למדגם.
*/

export {
  PLAYER_INSIGHTS_THRESHOLDS,
} from './insights.config.js'

export {
  PLAYER_INSIGHT_PROFILES,
  getPlayerInsightProfile,
} from './insights.profiles.js'

export {
  buildPlayerInsightStats,
} from './insights.stats.js'

export {
  classifyPlayerInsight,
} from './insights.classify.js'

export {
  buildPlayerInsightProfile,
  buildPlayersInsightsFromGameScores,
  buildPlayersInsightsFromGames,
} from './insights.model.js'

export {
  printPlayersInsightsDebug,
} from './insights.debug.js'
