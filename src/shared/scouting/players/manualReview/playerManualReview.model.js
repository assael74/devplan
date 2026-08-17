// src/shared/scouting/players/manualReview/playerManualReview.model.js

export const PLAYER_MANUAL_REVIEW_FIELD = {
  POSITION: 'position',
  AGENT_STATUS: 'agent_status',
  TRANSFER_HISTORY: 'transfer_history',
  GOAL_DISTRIBUTION: 'goal_distribution',
  MINUTES_DISTRIBUTION: 'minutes_distribution',
  VISUAL_REVIEW: 'visual_review',
  AGENT_PATH_FIT: 'agent_path_fit',
  SCOUT_PATH_FIT: 'scout_path_fit',
}

export const PLAYER_MANUAL_REVIEW_STATUS = {
  UNKNOWN: 'unknown',
  REVIEWED: 'reviewed',
}

export const PLAYER_AGENT_STATUS = {
  UNKNOWN: 'unknown',
  NO: 'no',
  YES: 'yes',
}

export const PLAYER_REVIEW_FIT = {
  UNKNOWN: 'unknown',
  NO: 'no',
  YES: 'yes',
}
