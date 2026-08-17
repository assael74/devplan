// src/shared/scouting/players/spotlights/playerSpotlights.utils.js

import {
  PLAYER_SCOUT_SPOTLIGHT_CONFIDENCE,
} from './playerSpotlights.model.js'

const DEFENSIVE_POSITIONS = new Set([
  'd',
  'dm',
  'defense',
  'dmmid',
  'dr',
  'dcr',
  'dcl',
  'dc',
  'dl',
  'dmr',
  'dmc',
  'dml',
])

export const resolvePlayerPositionValue = (player = {}) => {
  const values = [
    player.positionLayer,
    player.positionLayerCode,
    player.layerCode,
    player.primaryPositionLayer,
    player.primaryPosition,
    player.position,
  ]

  return values
    .map(value => String(value || '').trim().toLowerCase())
    .find(Boolean) || ''
}

export const isDefensivePosition = (player = {}) => {
  const positionValue = resolvePlayerPositionValue(player)

  return DEFENSIVE_POSITIONS.has(positionValue)
}

export const buildSpotlight = ({
  id,
  confidence,
  effect,
  evidence = [],
  details = {},
}) => {
  return {
    id,
    confidence,
    effect,
    evidence,
    details,
  }
}
