// teamProfile/sharedLogic/players/moduleLogic/row/row.positions.js

import { getPlayerGeneralPosition } from '../../../../../../../shared/players/player.positions.utils.js'

import {
  norm,
  toArr,
} from './row.helpers.js'

export const pickPositions = (player, row) => {
  if (row?.positions != null) return toArr(row.positions)
  if (player?.positions != null) return toArr(player.positions)

  return []
}

export const pickPrimaryPosition = ({
  player = {},
  row = {},
  positions = [],
}) => {
  const primaryPosition = norm(
    row?.primaryPosition ||
    player?.primaryPosition ||
    row?.generalPosition?.primaryPosition ||
    player?.generalPosition?.primaryPosition
  )

  if (primaryPosition && positions.includes(primaryPosition)) {
    return primaryPosition
  }

  return ''
}

export const buildGeneralPosition = ({
  positions = [],
  primaryPosition = '',
}) => {
  const generalPositionRaw = getPlayerGeneralPosition({
    positions,
    primaryPosition,
  }) || {}
  
  return {
    layerKey: norm(generalPositionRaw?.layerKey),
    layerLabel: norm(generalPositionRaw?.layerLabel),
    primaryPosition: norm(
      generalPositionRaw?.primaryPosition ||
      primaryPosition
    ),
    source: norm(generalPositionRaw?.source),
  }
}
