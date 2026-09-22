// src/shared/scouting/players/context/playerContext.model.js

export const PLAYER_TEAM_CONTEXT = {
  SUPPORTIVE: 'supportive',
  NEUTRAL: 'neutral',
  ADVERSE: 'adverse',
  MIXED: 'mixed',
  UNAVAILABLE: 'unavailable',
}

export const PLAYER_COMPETITION_CONTEXT = {
  ABOVE_CLUB_LEVEL: 'plays_above_club_level',
  AT_CLUB_LEVEL: 'plays_at_club_level',
  BELOW_CLUB_LEVEL: 'plays_below_club_level',
  UNAVAILABLE: 'unavailable',
}

export const PLAYER_POSITION_EVIDENCE = {
  CONFIRMED: 'confirmed',
  PLAUSIBLE: 'plausible',
  UNKNOWN: 'unknown',
  MISMATCH: 'mismatch',
  NOT_REQUIRED: 'not_required',
}

export const PLAYER_CONTEXT_SIDE = {
  ATTACK: 'attack',
  DEFENSE: 'defense',
  BOTH: 'both',
  NONE: 'none',
}
