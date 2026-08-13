// src/shared/scouting/players/verification/playerVerification.model.js

export const PLAYER_VERIFICATION_INPUT_MODE = {
  MANUAL: 'manual',
}

export const PLAYER_VERIFICATION_ANSWER_TYPE = {
  YES_NO_UNKNOWN: 'yes_no_unknown',
}

export const PLAYER_VERIFICATION_ANSWER = {
  YES: 'yes',
  NO: 'no',
  UNKNOWN: 'unknown',
}

export const PLAYER_VERIFICATION_QUESTION = {
  POSITION_CONTEXT_VERIFIED: 'position_context_verified',
  TRANSFERRED_SINCE_SIGNAL: 'transferred_since_signal',
  GOALS_WELL_DISTRIBUTED: 'goals_well_distributed',
  HAS_AGENT: 'has_agent',
  VISUAL_SIGNAL_CONFIRMED: 'visual_signal_confirmed',
  HIGHER_LEVEL_PERFORMANCE_CONFIRMED: 'higher_level_performance_confirmed',
}

export const PLAYER_VERIFICATION_DIMENSION = {
  PROFILE_CONFIDENCE: 'profile_confidence',
  PRODUCTION_RELIABILITY: 'production_reliability',
  DISCOVERY_OPPORTUNITY: 'discovery_opportunity',
  ACTION_IMMEDIACY: 'action_immediacy',
  VISUAL_CONFIDENCE: 'visual_confidence',
  COMPETITION_VALIDATION: 'competition_validation',
}

export const PLAYER_VERIFICATION_EFFECT = {
  SUPPORTS: 'supports',
  REDUCES: 'reduces',
  NEUTRAL: 'neutral',
}

export const PLAYER_VERIFICATION_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}
