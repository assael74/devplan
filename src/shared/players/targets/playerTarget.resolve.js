// src/shared/players/targets/playerTarget.resolve.js

import {
  POSITION_LAYERS,
  LAYER_TITLES,
  SQUAD_ROLE_OPTIONS,
} from '../players.constants.js'

const clean = (value) => {
  return value == null ? '' : String(value).trim()
}

const findPositionLayerByCode = (code) => {
  const normalizedCode = clean(code)

  if (!normalizedCode) return null

  const layerKeys = Object.keys(POSITION_LAYERS || {})

  for (let i = 0; i < layerKeys.length; i++) {
    const layerKey = layerKeys[i]
    const positions = POSITION_LAYERS[layerKey] || []

    const found = positions.find((item) => {
      return item?.code === normalizedCode
    })

    if (found) {
      return {
        id: layerKey,
        layerKey,
        layerLabel: LAYER_TITLES[layerKey] || found.label || '',
        code: found.code,
        label: found.label || '',
        layerCode: found.layerCode || '',
      }
    }
  }

  return null
}

const getPrimaryPositionCode = (player = {}) => {
  if (Array.isArray(player?.positions) && player.positions.length > 0) {
    const first = player.positions[0]

    if (typeof first === 'string') return first
    if (first?.code) return first.code
    if (first?.id) return first.id
  }

  return (
    player?.position ||
    player?.positionCode ||
    player?.mainPosition ||
    player?.generalPosition?.code ||
    ''
  )
}

export const resolvePlayerPosition = (player = {}) => {
  const directLayer =
    player?.generalPosition?.layerKey ||
    player?.positionLayer ||
    player?.layerKey ||
    ''

  if (directLayer && POSITION_LAYERS?.[directLayer]) {
    return {
      id: directLayer,
      layerKey: directLayer,
      layerLabel:
        player?.generalPosition?.layerLabel ||
        LAYER_TITLES[directLayer] ||
        '',
      label:
        player?.generalPosition?.layerLabel ||
        LAYER_TITLES[directLayer] ||
        '',
    }
  }

  const positionCode = getPrimaryPositionCode(player)
  const resolved = findPositionLayerByCode(positionCode)

  if (resolved) return resolved

  return {
    id: '',
    layerKey: '',
    layerLabel: 'לא הוגדרה עמדה',
    label: 'לא הוגדרה עמדה',
  }
}

export const resolvePlayerRole = (player = {}) => {
  const roleId = clean(
    player?.squadRole ||
    player?.role ||
    player?.playerRole
  )

  const option = SQUAD_ROLE_OPTIONS.find((item) => {
    return item.value === roleId || item.id === roleId
  })

  if (!option) {
    return {
      id: '',
      value: '',
      label: 'לא הוגדר מעמד',
      weight: 0,
      color: 'neutral',
      iconId: '',
    }
  }

  return {
    id: option.value,
    value: option.value,
    label: option.label,
    weight: option.weight || 0,
    color: option.color || 'neutral',
    iconId: option.idIcon || '',
  }
}
