// src/shared/scouting/players/opportunity/playerOpportunity.model.js

export const PLAYER_SCOUT_ACTION_STATUS = {
  IMMEDIATE: 'immediate',
  PRIORITY: 'priority',
  WATCH: 'watch',
  EXPOSED: 'exposed',
}

export const PLAYER_SCOUT_OPPORTUNITY_REASON = {
  STRONG_SIGNAL: 'strong_signal',
  RELIABLE_SIGNAL: 'reliable_signal',
  LOW_RELIABILITY: 'low_reliability',
  EARLY_BREAKTHROUGH: 'early_breakthrough',
  UNDEREXPOSED: 'underexposed',
  HIDDEN_PERFORMER: 'hidden_performer',
  POSITIONAL_OUTLIER: 'positional_outlier',
  PLAYS_ABOVE_CLUB_LEVEL: 'plays_above_club_level',
  PLAYS_BELOW_CLUB_LEVEL: 'plays_below_club_level',
  ADVERSE_TEAM_CONTEXT: 'adverse_team_context',
  STRONG_TEAM_CONTEXT: 'strong_team_context',
  FUTURE_LEVEL_RISK: 'future_level_risk',
  FUTURE_LEVEL_UPSIDE: 'future_level_upside',
  MULTI_SEASON_GROWTH: 'multi_season_growth',
  TRANSFERRED_UP: 'transferred_up',
  TRANSFERRED_DOWN: 'transferred_down',
  TOP_CLUB_EXPOSURE: 'top_club_exposure',
}

export const PLAYER_SCOUT_EXPOSURE_LEVEL = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  UNKNOWN: 'unknown',
}
