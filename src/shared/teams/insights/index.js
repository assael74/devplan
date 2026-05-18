// src/shared/teams/insights/index.js

/*
|--------------------------------------------------------------------------
| Team Insights Engine / Public API
|--------------------------------------------------------------------------
|
| אחריות:
| מנוע תובנות קבוצתי לקבוצות שחקנים.
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
  TEAM_TONE_RANK,
  getMaxTeamTone,
} from './insights.config.js'

export {
  TEAM_INSIGHT_FAMILIES,
  TEAM_PLAYERS_STRUCTURE_INSIGHT_TYPES,
  TEAM_PLAYERS_PERFORMANCE_INSIGHT_TYPES,
  TEAM_PLAYERS_RISK_INSIGHT_TYPES,
  TEAM_PLAYERS_SAMPLE_INSIGHT_TYPES,
  TEAM_PLAYERS_DRILLDOWN_INSIGHT_TYPES,
  TEAM_PLAYERS_RECOMMEND_INSIGHT_TYPES,
  TEAM_PLAYERS_INSIGHT_TYPES,
  getTeamPlayersInsightType,
} from './insights.types.js'

export {
  TEAM_PLAYERS_SAMPLE_INSIGHT_RULES,
  TEAM_PLAYERS_PERFORMANCE_INSIGHT_RULES,
  TEAM_PLAYERS_RISK_INSIGHT_RULES,
  TEAM_PLAYERS_DRILLDOWN_INSIGHT_RULES,
  TEAM_PLAYERS_RECOMMEND_INSIGHT_RULES,
  TEAM_PLAYERS_INSIGHT_RULES,
  TEAM_PLAYERS_INSIGHT_RULES_BY_FAMILY,
  resolveTeamPlayersInsightId,
  resolveTeamPlayersInsights,
} from './insights.rules.js'

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

export {
  buildTeamInsightRecommendations,
  printRecommendationsTextDebug,
  printRecommendationsFullTextDebug,
} from './insights.recommendations.js'
