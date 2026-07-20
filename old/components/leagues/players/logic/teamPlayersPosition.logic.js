// features/playersDatabase/components/leagues/players/logic/teamPlayersPosition.logic.js

import { getPlayerGeneralPosition } from '../../../../../../shared/players/player.positions.utils.js'
import {
  LAYER_TITLES,
  POSITION_LAYERS,
} from '../../../../../../shared/players/players.constants.js'
import { playerIcons } from '../../../../../../ui/core/icons/entities/players.icons.js'
import { clean } from '../../../../sharedLogic/index.js'

export const MIDFIELD_LAYERS = ['atMidfield', 'midfield', 'dmMid']
export const CLEAR_POSITIONS = '__clear_positions__'

export const layerOptions = [
  {
    id: 'attack',
    layers: ['attack'],
    label: LAYER_TITLES.attack,
    icon: playerIcons.attack,
  },
  {
    id: 'midfield',
    layers: MIDFIELD_LAYERS,
    label: LAYER_TITLES.midfield,
    icon: playerIcons.midfield,
  },
  {
    id: 'defense',
    layers: ['defense'],
    label: LAYER_TITLES.defense,
    icon: playerIcons.defense,
  },
  {
    id: 'goalkeeper',
    layers: ['goalkeeper'],
    label: LAYER_TITLES.goalkeeper,
    icon: playerIcons.goalkeeper,
  },
]

export const splitPositions = value => {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean)

  return clean(value)
    .split(/[,\s/|]+/)
    .map(clean)
    .filter(Boolean)
}

export const normalizeLayer = layer => {
  const value = clean(layer)

  return MIDFIELD_LAYERS.includes(value) ? 'midfield' : value
}

export const getLayerOption = layer =>
  layerOptions.find(option => option.id === normalizeLayer(layer))

export const getPositionOptions = layer => {
  const option = getLayerOption(layer)
  if (!option) return []

  return option.layers.flatMap(item => POSITION_LAYERS[item] || [])
}

export const getLayerValue = row => {
  const layer = clean(row.positionLayer || row.layer)
  if (layer) return normalizeLayer(layer)

  const primaryPosition = clean(row.primaryPosition || row.positionCode || row.position)
  const positions = splitPositions(row.positions || primaryPosition)

  return normalizeLayer(
    getPlayerGeneralPosition({
      positions,
      primaryPosition,
    }).layerKey
  )
}

export const getPositionValue = row =>
  clean(row.primaryPosition || row.positionCode || row.position)

export const getDraftLayerValue = (row, draft = {}) =>
  'positionLayer' in draft
    ? clean(draft.positionLayer)
    : getLayerValue(row)

export const getDraftPositionValue = (row, draft = {}) =>
  'primaryPosition' in draft
    ? clean(draft.primaryPosition)
    : getPositionValue(row)

export const hasPositionDraft = (row, draft = {}) => {
  if (!draft || !Object.keys(draft).length) return false

  return (
    clean(draft.positionLayer) !== getLayerValue(row) ||
    clean(draft.primaryPosition) !== getPositionValue(row)
  )
}

export const buildPositionPatch = (row, draft = {}) => {
  const positionLayer = 'positionLayer' in draft
    ? clean(draft.positionLayer)
    : getLayerValue(row)
  const primaryPosition = 'primaryPosition' in draft
    ? clean(draft.primaryPosition)
    : getPositionValue(row)

  return {
    positionLayer,
    primaryPosition,
    positions: primaryPosition ? [primaryPosition] : [],
  }
}
