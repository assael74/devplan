// src/shared/players/player.positions.utils.js

import { POSITION_LAYERS, LAYER_TITLES } from './players.constants.js'

export function getPlayerGeneralPosition(positions = []) {
  const counts = {}

  for (const code of positions || []) {
    for (const [layerKey, list] of Object.entries(POSITION_LAYERS)) {
      if (list.some((p) => p.code === code)) {
        counts[layerKey] = (counts[layerKey] || 0) + 1
      }
    }
  }

  let bestLayer = ''
  let bestCount = 0

  for (const [layer, count] of Object.entries(counts)) {
    if (count > bestCount) {
      bestLayer = layer
      bestCount = count
    }
  }

  return {
    layerKey: bestLayer,
    layerLabel: LAYER_TITLES[bestLayer] || 'לא עודכן',
  }
}
