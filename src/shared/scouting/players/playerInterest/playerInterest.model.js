// src/shared/scouting/players/playerInterest/playerInterest.model.js

export const PLAYER_INTEREST_LEVEL = {
  REASONABLE: 'reasonable',
  INTERESTING: 'interesting',
  SUPER_INTERESTING: 'super_interesting',
}

export const PLAYER_INTEREST_REASON = {
  POSITION_VERIFIED: 'position_verified_or_not_required',
  PROFILE_PERSISTENCE: 'profile_persistence',
  DEFINED_COMBINATION: 'defined_profile_combination',
  HIGH_IMMEDIACY: 'high_immediacy',
  STRONG_PROFILE_DEPTH: 'strong_profile_depth',
  PROFILE_INTEREST_CAPPED: 'profile_interest_not_yet_confirmed_at_player_level',
}

export const PLAYER_INTEREST_LIMIT = {
  POSITION_NOT_VERIFIED: 'position_not_verified',
  POSITION_MISMATCH: 'position_mismatch',
  WHOLE_PLAYER_SUPPORT_MISSING: 'whole_player_support_missing',
}

export const PLAYER_INTEREST_UPGRADE_CONDITION = {
  POSITION_VERIFICATION: 'position_verification',
  WHOLE_PLAYER_CONFIRMATION: 'whole_player_confirmation',
}
