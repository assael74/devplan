// src/shared/scouting/teams/lines/teamLineClassification.model.js

export const TEAM_LINE_CLASSIFICATION_VERSION = 'player-line-v7'

export const TEAM_PLAYER_LINE = Object.freeze({
  DEFENSE: 'DEFENSE',
  MIDFIELD: 'MIDFIELD',
  ATTACK: 'ATTACK',
})

export const TEAM_PLAYER_POSITION = Object.freeze({
  FULLBACK: 'FULLBACK',
  ATTACKING_MIDFIELDER: 'ATTACKING_MIDFIELDER',
})

export const TEAM_LINE_CLASSIFICATION_SOURCE = Object.freeze({
  INFERRED: 'inferred',
  KNOWN: 'known',
})

export const TEAM_LINE_EVIDENCE_LEVEL = Object.freeze({
  HIGH: 'high',
  MEDIUM: 'medium',
})

export const TEAM_LINE_MINUTES_BAND = Object.freeze({
  HIGH: 'high',
  MEDIUM_HIGH: 'medium_high',
  MEDIUM: 'medium',
  LOW: 'low',
})

export const TEAM_LINE_SUBSTITUTION_BAND = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
})
