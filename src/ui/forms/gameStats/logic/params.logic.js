// src/ui/forms/gameStats/logic/params.logic.js

import { statsParm } from '../../../../shared/stats/statsParmList.js'
import { GAME_STATS_PRESETS, EXCLUDED_FORM_PARAM_IDS } from './core/form.constants.js'

const sortParams = list => {
  return [...list].sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })
}

const getPreset = presetId => {
  return GAME_STATS_PRESETS.find(item => item.id === presetId) || GAME_STATS_PRESETS[0]
}

const getParamLabel = param => {
  return param?.statsParmName || param?.statsParmShortName || param?.id || ''
}

const isTripletParam = param => {
  return param?.statsParmFieldType === 'triplet'
}

const getTripletGroup = param => {
  return param?.tripletGroup || ''
}

const findParamById = paramId => {
  return getStatsParams().find(item => item.id === paramId) || null
}

const getTripletGroupIds = param => {
  const group = getTripletGroup(param)
  if (!group) return [param.id]

  return getStatsParams()
    .filter(item => isTripletParam(item) && getTripletGroup(item) === group)
    .map(item => item.id)
}

export const getParamDisplayLabel = param => {
  return getParamLabel(param)
}

export const getStatsParams = () => {
  const list = Array.isArray(statsParm) ? statsParm : []

  return sortParams(
    list.filter(item => !EXCLUDED_FORM_PARAM_IDS.has(item.id))
  )
}

export const getDefaultParamIds = () => {
  return getStatsParams()
    .filter(item => item.isDefault)
    .map(item => item.id)
}

export const resolvePresetParamIds = presetId => {
  const preset = getPreset(presetId)
  const params = getStatsParams()

  if (preset.id === 'custom') {
    return []
  }

  return params
    .filter(item => {
      if (item.isDefault && preset.includeDefaults) return true
      return preset.types.includes(item.statsParmType)
    })
    .map(item => item.id)
}

export const toggleParamId = ({ selectedParmIds, paramId }) => {
  const current = Array.isArray(selectedParmIds) ? selectedParmIds : []
  const param = findParamById(paramId)

  if (!param) return current

  const ids = isTripletParam(param)
    ? getTripletGroupIds(param)
    : [paramId]

  const selected = new Set(current)
  const shouldRemove = ids.every(id => selected.has(id))

  if (shouldRemove) {
    return current.filter(id => !ids.includes(id))
  }

  return Array.from(new Set([...current, ...ids]))
}

export const getVisibleParams = selectedParmIds => {
  const selected = new Set(selectedParmIds || [])
  return getStatsParams().filter(item => selected.has(item.id))
}

export const groupParamsByType = params => {
  return params.reduce((acc, item) => {
    const key = item.statsParmType || 'general'

    return {
      ...acc,
      [key]: [...(acc[key] || []), item],
    }
  }, {})
}
