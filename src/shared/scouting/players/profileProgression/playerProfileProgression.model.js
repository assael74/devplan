// src/shared/scouting/players/profileProgression/playerProfileProgression.model.js


export const NEAR_PROFILE_ELIGIBLE_PROFILE_IDS = Object.freeze([
  'clear_scorer',
  'killer_efficiency',
  'single_engine',
  'secondary_threat',
])

export const PROFILE_DISTANCE_STATUS = Object.freeze({
  VERY_CLOSE: 'very_close',
  NEAR: 'near',
  OUTSIDE: 'outside',
  UNAVAILABLE: 'unavailable',
})

export const PROFILE_DISTANCE_TREND = Object.freeze({
  CLOSING_FAST: 'closing_fast',
  CLOSING: 'closing',
  STABLE: 'stable',
  MOVING_AWAY: 'moving_away',
  UNKNOWN: 'unknown',
})

export const PROFILE_DISTANCE_THRESHOLD = Object.freeze({
  VERY_CLOSE: 0.1,
  NEAR: 0.2,
  FAST_CLOSING_DELTA: 0.1,
  STABLE_DELTA: 0.02,
})
