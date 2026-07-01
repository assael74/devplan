// src/shared/players/targets/playerTarget.resolve.js

import { POSITION_LAYERS, LAYER_TITLES, SQUAD_ROLE_OPTIONS } from '../players.constants.js'

const clean = value => value == null ? '' : String(value).trim()

const resolvePositionCodeValue = value => {
  if (typeof value === 'string') return clean(value)
  if (value?.code) return clean(value.code)
  if (value?.id) return clean(value.id)
  if (value?.value) return clean(value.value)
  return ''
}

const findPositionLayerByCode = code => {
  const normalizedCode = clean(code)

  if (!normalizedCode) return null

  const layerKeys = Object.keys(POSITION_LAYERS || {})

  for (let i = 0; i < layerKeys.length; i++) {
    const layerKey = layerKeys[i]
    const positions = POSITION_LAYERS[layerKey] || []
    const found = positions.find(item => item?.code === normalizedCode)

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

export const resolvePlayerPrimaryPositionCode = (player = {}) => {
  const primaryPosition = resolvePositionCodeValue(player?.primaryPosition)
  if (primaryPosition) return primaryPosition

  if (Array.isArray(player?.positions) && player.positions.length > 0) {
    const firstPosition = resolvePositionCodeValue(player.positions[0])
    if (firstPosition) return firstPosition
  }

  if (typeof player?.positions === 'string') {
    const positionsValue = clean(player.positions)
    if (positionsValue) return positionsValue
  }

  return (
    resolvePositionCodeValue(player?.position) ||
    resolvePositionCodeValue(player?.positionCode) ||
    resolvePositionCodeValue(player?.mainPosition) ||
    resolvePositionCodeValue(player?.generalPosition?.code)
  )
}

export const resolvePlayerPosition = (player = {}) => {
  const primaryPositionCode = resolvePlayerPrimaryPositionCode(player)
  const primaryPosition = findPositionLayerByCode(primaryPositionCode)

  if (primaryPosition) return primaryPosition

  const directLayer = player?.generalPosition?.layerKey || player?.positionLayer || player?.layerKey || ''

  if (directLayer && POSITION_LAYERS?.[directLayer]) {
    return {
      id: directLayer,
      layerKey: directLayer,
      layerLabel: player?.generalPosition?.layerLabel || LAYER_TITLES[directLayer] || '',
      code: primaryPositionCode,
      label: player?.generalPosition?.layerLabel || LAYER_TITLES[directLayer] || '',
    }
  }

  return {
    id: '',
    layerKey: '',
    layerLabel: 'לא הוגדרה עמדה',
    code: primaryPositionCode,
    label: 'לא הוגדרה עמדה',
  }
}

export const resolvePlayerRole = (player = {}) => {
  const roleId = clean(player?.squadRole || player?.role || player?.playerRole)
  const option = SQUAD_ROLE_OPTIONS.find(item => item.value === roleId || item.id === roleId)

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
