// src/shared/scouting/teams/balance/teamBalance.model.js

export const TEAM_BALANCE_RELIABILITY = Object.freeze({
  SUFFICIENT: 'sufficient',
  PARTIAL: 'partial',
  INSUFFICIENT: 'insufficient',
})

export const TEAM_BALANCE_AVAILABILITY = Object.freeze({
  AVAILABLE: 'available',
  LIMITED: 'limited',
  UNAVAILABLE: 'unavailable',
})

export const TEAM_BALANCE_STATS_STATUS = Object.freeze({
  LOADED: 'loaded',
  MISSING: 'missing',
})

export const TEAM_BALANCE_USAGE_THRESHOLDS = Object.freeze([
  0.7,
  0.5,
  0.3,
  0.1,
])

export const TEAM_BALANCE_TOP_PLAYER_COUNTS = Object.freeze([
  5,
  10,
  14,
])
