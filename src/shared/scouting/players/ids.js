// src/shared/scouting/players/ids.js

export const SCOUT_PROFILE_IDENTITY = {
  CORE: 'core',
  PRELIMINARY: 'preliminary',
  SUPPORTING: 'supporting',
  OPPORTUNITY: 'opportunity',
}

export const SCOUT_RELIABILITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const SCOUT_REVIEW = {
  POSITION: 'position_check',
  VIDEO_POSITION: 'video_position_check',
  PROFILE_RELEVANCE: 'profile_relevance_check',
  TEAM_CONTEXT: 'team_context_check',
}

export const SCOUT_WARNING = {
  POSITION_MISSING: 'position_not_verified',
  ROLE_INFERENCE: 'role_inference_only',
  LOW_SAMPLE: 'low_player_sample',
  LOW_TEAM_SAMPLE: 'low_team_games_sample',
  TEAM_CONTEXT_SENSITIVE: 'team_context_sensitive',
}

export const SCOUT_LEVEL = {
  SAME: 'same_level',
  BELOW: 'below_level',
  ABOVE: 'above_level',
}

export const TEAM_FILTER = {
  ANY: 'any_team',
  ATTACK_POSITIVE: 'attack_positive',
  ATTACK_POSITIVE_OR_GOALS_GTE_10: 'attack_positive_or_goals_gte_10',
  ANY_POSITIVE: 'any_positive',
  CLEAR_POSITIVE: 'clear_positive',
  DEFENSE_POSITIVE: 'defense_positive',
}

export const DRILLDOWN_STATUS = {
  STRONG: 'strong',
  OPEN: 'open',
  HIDDEN: 'hidden',
}
