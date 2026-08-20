// src/shared/scouting/players/opportunity/playerOpportunity.model.js

export const PLAYER_SCOUT_ACTION_STATUS = {
  REMOVE: 'remove',
  WATCH: 'watch',
  PRIORITY: 'priority',
  IMMEDIATE: 'immediate',
}

export const PLAYER_SCOUT_IMMEDIACY_BOOST = {
  EARLY_AGE_GROUP: 'early_age_group',
  PROFILE_COMBINATION: 'profile_combination',
  IDEAL_CLUB_RANGE: 'ideal_club_range',
  IDEAL_LEAGUE_LEVEL: 'ideal_league_level',
  FUTURE_LEVEL_RISK: 'future_level_risk',
  PLAYING_UP_VALIDATION: 'playing_up_validation',
  PROFILE_PERSISTENCE: 'profile_persistence',
  PROFILE_COMBINATION_PERSISTENCE: 'profile_combination_persistence',
}

export const PLAYER_SCOUT_IMMEDIACY_REDUCTION = {
  SIGNAL_DECAY: 'signal_decay',
}

export const PLAYER_SCOUT_IMMEDIACY_EVALUATION_RESULT = {
  BOOST: 'boost',
  NO_CHANGE: 'no_change',
  REDUCTION: 'reduction',
  NOT_APPLICABLE: 'not_applicable',
}

export const PLAYER_SCOUT_IMMEDIACY_SOURCE = {
  PROFILE: 'profile',
  NEAR_PROFILE: 'near_profile',
  NONE: 'none',
}

export const PLAYER_SCOUT_EXPOSURE_LEVEL = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  UNKNOWN: 'unknown',
}
