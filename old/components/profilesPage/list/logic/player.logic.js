// features/playersDatabase/components/profilesPage/list/logic/player.logic.js

import { getPlayerGeneralPosition } from '../../../../../../shared/players/player.positions.utils.js'
import {
  LAYER_TITLES,
  POSITION_LAYERS,
} from '../../../../../../shared/players/players.constants.js'
import { clean } from '../../logic/utils.js'

const MIDFIELD_LAYERS = [
  'atMidfield',
  'midfield',
  'dmMid',
]

export const PLAYER_LAYER_OPTIONS = [
  {
    id: 'attack',
    code: 'attack',
    layers: ['attack'],
    label: LAYER_TITLES.attack,
  },
  {
    id: 'midfield',
    code: 'midfield',
    layers: MIDFIELD_LAYERS,
    label: LAYER_TITLES.midfield,
  },
  {
    id: 'defense',
    code: 'defense',
    layers: ['defense'],
    label: LAYER_TITLES.defense,
  },
  {
    id: 'goalkeeper',
    code: 'goalkeeper',
    layers: ['goalkeeper'],
    label: LAYER_TITLES.goalkeeper,
  },
]

export const getPositionLayerOptions = () => PLAYER_LAYER_OPTIONS

export const normalizeLayer = layer => {
  const value = clean(layer)

  return MIDFIELD_LAYERS.includes(value)
    ? 'midfield'
    : value
}

export const getLayerOption = layer =>
  PLAYER_LAYER_OPTIONS.find(
    option => option.id === normalizeLayer(layer)
  ) || null

export const getPositionOptions = layer => {
  const option = getLayerOption(layer)

  if (!option) return []

  return option.layers.flatMap(
    item => POSITION_LAYERS[item] || []
  )
}

export const getPlayerPositionInfo = player => {
  const primaryPosition = clean(player?.primaryPosition)

  const positions = Array.isArray(player?.positions)
    ? player.positions.filter(Boolean)
    : clean(player?.positions)
      ? [clean(player.positions)]
      : []

  const documentLayer = clean(player?.positionLayer)

  if (documentLayer) {
    return {
      primaryPosition,
      positions,
      layerKey: normalizeLayer(documentLayer),
      layerLabel: LAYER_TITLES[documentLayer] || documentLayer,
      missingDocumentLayer: false,
      sourceLabel: 'חוליה מהמסמך',
      sourceColor: 'neutral',
    }
  }

  const inferred = getPlayerGeneralPosition({
    primaryPosition,
    positions,
  })

  return {
    primaryPosition,
    positions,
    layerKey: normalizeLayer(inferred.layerKey),
    layerLabel: inferred.layerLabel || '-',
    missingDocumentLayer: true,
    sourceLabel: inferred.layerKey ? 'חוליה משוערת' : 'חסרה חוליה',
    sourceColor: inferred.layerKey ? 'warning' : 'danger',
  }
}

export const getPlayerUrls = player => ({
  playerUrl: clean(
    player?.playerUrl ||
      player?.source?.playerUrl
  ),
  leagueUrl: clean(
    player?.leagueUrl ||
      player?.source?.leagueUrl
  ),
  teamUrl: clean(
    player?.teamUrl ||
      player?.source?.teamUrl
  ),
})
