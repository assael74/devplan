// src/shared/players/player.positions.utils.js

import { POSITION_LAYERS, LAYER_TITLES } from './players.constants.js'

const safeArr = (value) => {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

const clean = (value) => {
  return value == null ? '' : String(value).trim()
}

const normalizeArgs = (input) => {
  if (Array.isArray(input)) {
    return {
      positions: safeArr(input),
      primaryPosition: '',
    }
  }

  if (input && typeof input === 'object') {
    return {
      positions: safeArr(input.positions),
      primaryPosition: clean(input.primaryPosition),
    }
  }

  return {
    positions: [],
    primaryPosition: '',
  }
}

const findLayerByPositionCode = (code) => {
  const normalizedCode = clean(code)

  if (!normalizedCode) return null

  for (const [layerKey, list] of Object.entries(POSITION_LAYERS)) {
    const found = list.some((position) => position.code === normalizedCode)

    if (found) {
      return {
        layerKey,
        layerLabel: LAYER_TITLES[layerKey] || 'לא עודכן',
      }
    }
  }

  return null
}

const resolveByPositionsCount = (positions = []) => {
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

export function getPlayerGeneralPosition(input = []) {
  const {
    positions,
    primaryPosition,
  } = normalizeArgs(input)

  if (primaryPosition && positions.includes(primaryPosition)) {
    const primaryLayer = findLayerByPositionCode(primaryPosition)

    if (primaryLayer) {
      return {
        ...primaryLayer,
        primaryPosition,
        source: 'primaryPosition',
      }
    }
  }

  const fallback = resolveByPositionsCount(positions)

  return {
    ...fallback,
    primaryPosition: '',
    source: 'positions',
  }
}
