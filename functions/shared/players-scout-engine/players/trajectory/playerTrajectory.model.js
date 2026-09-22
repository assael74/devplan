// src/shared/scouting/players/trajectory/playerTrajectory.model.js

export const PLAYER_TRAJECTORY_DIRECTION = {
  BREAKTHROUGH: 'breakthrough',
  UP: 'up',
  STABLE: 'stable',
  DOWN: 'down',
  UNKNOWN: 'unknown',
}

export const PLAYER_TRAJECTORY_CONFIDENCE = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
}

export const PLAYER_TRANSFER_DIRECTION = {
  UP: 'up',
  DOWN: 'down',
  LATERAL: 'lateral',
  MIXED: 'mixed',
  UNKNOWN: 'unknown',
}

export const PLAYER_TRAJECTORY_EVIDENCE = {
  MINUTES_UP: 'minutes_up',
  MINUTES_DOWN: 'minutes_down',
  STARTS_UP: 'starts_up',
  STARTS_DOWN: 'starts_down',
  PRODUCTION_UP: 'production_up',
  PRODUCTION_DOWN: 'production_down',
  LEAGUE_LEVEL_UP: 'league_level_up',
  LEAGUE_LEVEL_DOWN: 'league_level_down',
  CLUB_LEVEL_UP: 'club_level_up',
  CLUB_LEVEL_DOWN: 'club_level_down',
  PLAYING_ABOVE_AGE: 'playing_above_age',
  PROFILE_ADDED: 'profile_added',
  PROFILE_LOST: 'profile_lost',
}
