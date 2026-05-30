// src/ui/forms/gameStatsForm/logic/parms.logic.js

import { statsParm } from '../../../../shared/stats/statsParmList.js'
import { GAME_STATS_PRESETS, EXCLUDED_FORM_PARM_IDS } from './core/form.constants.js'

const sortParms = list => {
  return [...list].sort((a, b) => {
    return (a.order || 0) - (b.order || 0)
  })
}

const getPreset = presetId => {
  return GAME_STATS_PRESETS.find(item => item.id === presetId) || GAME_STATS_PRESETS[0]
}

const getParmLabel = parm => {
  return parm?.statsParmName || parm?.statsParmShortName || parm?.id || ''
}

const isTripletParm = parm => {
  return parm?.statsParmFieldType === 'triplet'
}

const getTripletGroup = parm => {
  return parm?.tripletGroup || ''
}

const findParmById = parmId => {
  return getStatsParms().find(item => item.id === parmId) || null
}

const getTripletGroupIds = parm => {
  const group = getTripletGroup(parm)
  if (!group) return [parm.id]

  return getStatsParms()
    .filter(item => isTripletParm(item) && getTripletGroup(item) === group)
    .map(item => item.id)
}

export const getParmDisplayLabel = parm => {
  return getParmLabel(parm)
}

export const getStatsParms = () => {
  const list = Array.isArray(statsParm) ? statsParm : []

  return sortParms(
    list.filter(item => !EXCLUDED_FORM_PARM_IDS.has(item.id))
  )
}

export const getDefaultParmIds = () => {
  return getStatsParms()
    .filter(item => item.isDefault)
    .map(item => item.id)
}

export const resolvePresetParmIds = presetId => {
  const preset = getPreset(presetId)
  const parms = getStatsParms()

  if (preset.id === 'custom') {
    return []
  }

  return parms
    .filter(item => {
      if (item.isDefault && preset.includeDefaults) return true
      return preset.types.includes(item.statsParmType)
    })
    .map(item => item.id)
}

export const toggleParmId = ({ selectedParmIds, parmId }) => {
  const current = Array.isArray(selectedParmIds) ? selectedParmIds : []
  const parm = findParmById(parmId)

  if (!parm) return current

  const ids = isTripletParm(parm)
    ? getTripletGroupIds(parm)
    : [parmId]

  const selected = new Set(current)
  const shouldRemove = ids.every(id => selected.has(id))

  if (shouldRemove) {
    return current.filter(id => !ids.includes(id))
  }

  return Array.from(new Set([...current, ...ids]))
}

export const getVisibleParms = selectedParmIds => {
  const selected = new Set(selectedParmIds || [])
  return getStatsParms().filter(item => selected.has(item.id))
}

export const groupParmsByType = parms => {
  return parms.reduce((acc, item) => {
    const key = item.statsParmType || 'general'

    return {
      ...acc,
      [key]: [...(acc[key] || []), item],
    }
  }, {})
}
