// src/shared/teams/insights/index.js

/*
|--------------------------------------------------------------------------
| Team Insights Engine / Public API
|--------------------------------------------------------------------------
|
| אחריות:
| מנוע תובנות קבוצתי למקבצי שחקנים.
|
| המנוע הזה לא מחשב ציון שחקן.
| הוא מקבל תוצרי scoring / player insights,
| מקבץ אותם לפי אספקט מקצועי,
| ומחזיר אבחנה קבוצתית לפי מעמד, עמדה, סטטוס פרויקט ועוד.
*/

export {
  TEAM_INSIGHTS_THRESHOLDS,
  TEAM_ROLE_RISK_RULES,
  TEAM_RISK_TONES,
  TEAM_QUALITY_TONES,
  DEFAULT_RISK_RULES,
} from './insights.config.js'

export {
  buildTeamInsightPlayersMap,
  buildTeamInsightPlayer,
} from './insights.players.js'

export {
  buildTeamGroupDiagnosis,
} from './insights.diagnosis.js'

export {
  buildTeamInsightGroup,
  buildTeamInsightAspect,
} from './insights.groups.js'

export {
  buildTeamInsights,
} from './insights.model.js'

export {
  printTeamInsightsDebug,
} from './insights.debug.js'
