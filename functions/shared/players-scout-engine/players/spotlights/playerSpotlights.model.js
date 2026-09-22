// src/shared/scouting/players/spotlights/playerSpotlights.model.js

export const PLAYER_SCOUT_SPOTLIGHT = {
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
  TRANSFERRED_UP: 'transferred_up',
  TRANSFERRED_DOWN: 'transferred_down',
  MULTI_SEASON_GROWTH: 'multi_season_growth',
}

export const PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const PLAYER_SCOUT_SPOTLIGHT_EFFECT = {
  SUPPORTS_ACTION: 'supports_action',
  REDUCES_IMMEDIACY: 'reduces_immediacy',
  CONTEXT_ONLY: 'context_only',
}
