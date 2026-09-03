// src/features/playersDatabase/ui/components/playerMeta/playerRole.options.js

import { POSITION_LAYERS } from '../../../../../shared/players/players.constants.js'

const POSITION_LAYER_LABELS = {
  goalkeeper: 'שוער',
  defense: 'הגנה',
  dmMid: 'קישור אחורי',
  midfield: 'קישור',
  atMidfield: 'קישור התקפי',
  attack: 'התקפה',
}

const POSITION_LABELS = {
  S: 'חלוץ',
  AR: 'כנף ימין',
  AC: 'קשר התקפי',
  AL: 'כנף שמאל',
  MCR: 'קשר אמצע ימין',
  MCL: 'קשר אמצע שמאל',
  DMR: 'מגן / כנף ימין',
  DM: 'קשר אחורי',
  DML: 'מגן / כנף שמאל',
  DR: 'מגן ימין',
  DCR: 'בלם ימני',
  DCL: 'בלם שמאלי',
  DL: 'מגן שמאל',
  GK: 'שוער',
}

// The UI uses the professional pitch order, independently from the storage order.
const POSITION_LAYER_DISPLAY_ORDER = [
  'goalkeeper',
  'defense',
  'dmMid',
  'midfield',
  'atMidfield',
  'attack',
]

const orderedPositionLayerKeys = POSITION_LAYER_DISPLAY_ORDER.filter(key => (
  Array.isArray(POSITION_LAYERS[key])
))

export const POSITION_LAYER_OPTIONS = orderedPositionLayerKeys.map(key => ({
  value: key,
  label: POSITION_LAYER_LABELS[key] || key,
}))

export const POSITION_OPTIONS = orderedPositionLayerKeys
  .flatMap(key => POSITION_LAYERS[key])
  .flat()
  .map(position => ({
    value: position.code,
    label: POSITION_LABELS[position.code] || position.code,
  }))

export const getPlayerRoleOptionLabel = (options, value) => (
  options.find(option => option.value === value)?.label || value || ''
)
