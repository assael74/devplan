// src/shared/scouting/players/context/playerPositionContext.js

import {
  PLAYER_POSITION_EVIDENCE,
} from './playerContext.model.js'

const DEFENSE_MIDFIELD_LAYERS = new Set([
  'd',
  'dm',
  'm',
  'defense',
  'dmmid',
  'midfield',
  'dr',
  'dcr',
  'dcl',
  'dc',
  'dl',
  'dmr',
  'dmc',
  'dml',
  'mcr',
  'mcl',
])

const ATTACK_LAYERS = new Set([
  's',
  'am',
  'attack',
  'atmidfield',
  'ar',
  'ac',
  'al',
])

const normalizeValue = value => String(value || '')
  .trim()
  .toLowerCase()

const resolvePositionValue = (player = {}) => {
  const values = [
    player.positionLayer,
    player.positionLayerCode,
    player.layerCode,
    player.primaryPositionLayer,
    player.primaryPosition,
    player.position,
  ]

  return values
    .map(normalizeValue)
    .find(Boolean) || ''
}

const matchesDefenseMidfield = (positionValue) => {
  if (!positionValue) return PLAYER_POSITION_EVIDENCE.UNKNOWN
  if (DEFENSE_MIDFIELD_LAYERS.has(positionValue)) {
    return PLAYER_POSITION_EVIDENCE.CONFIRMED
  }
  if (ATTACK_LAYERS.has(positionValue)) {
    return PLAYER_POSITION_EVIDENCE.MISMATCH
  }

  return PLAYER_POSITION_EVIDENCE.PLAUSIBLE
}

const matchesNotAttack = (positionValue) => {
  if (!positionValue) return PLAYER_POSITION_EVIDENCE.UNKNOWN
  if (ATTACK_LAYERS.has(positionValue)) {
    return PLAYER_POSITION_EVIDENCE.MISMATCH
  }
  if (DEFENSE_MIDFIELD_LAYERS.has(positionValue)) {
    return PLAYER_POSITION_EVIDENCE.CONFIRMED
  }

  return PLAYER_POSITION_EVIDENCE.PLAUSIBLE
}

export const buildPlayerPositionContext = ({ profile = {}, player = {} } = {}) => {
  const requiredContext = normalizeValue(profile.positionContext)
  const positionValue = resolvePositionValue(player)

  if (!requiredContext) {
    return {
      evidence: PLAYER_POSITION_EVIDENCE.NOT_REQUIRED,
      requiredContext: '',
      positionValue,
    }
  }

  if (requiredContext === 'defense_midfield') {
    return {
      evidence: matchesDefenseMidfield(positionValue),
      requiredContext,
      positionValue,
    }
  }

  if (requiredContext === 'not_attack') {
    return {
      evidence: matchesNotAttack(positionValue),
      requiredContext,
      positionValue,
    }
  }

  return {
    evidence: positionValue
      ? PLAYER_POSITION_EVIDENCE.PLAUSIBLE
      : PLAYER_POSITION_EVIDENCE.UNKNOWN,
    requiredContext,
    positionValue,
  }
}
