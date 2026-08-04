// src/ui/forms/gameStats/logic/draft/draft.params.js

import {
  resolvePresetParamIds,
} from '../params.logic.js'

export const patchSelectedParamsDraft = (draft, selectedParmIds) => {
  return {
    ...(draft || {}),
    preset: 'custom',
    selectedParmIds: Array.isArray(selectedParmIds) ? selectedParmIds : [],
  }
}

export const patchPresetDraft = (draft, preset) => {
  if (preset === 'custom') {
    return {
      ...(draft || {}),
      preset: 'custom',
      selectedParmIds: Array.isArray(draft?.selectedParmIds)
        ? draft.selectedParmIds
        : [],
    }
  }

  return {
    ...(draft || {}),
    preset,
    selectedParmIds: resolvePresetParamIds(preset),
  }
}

export const resetSelectedParamsDraft = draft => {
  return {
    ...(draft || {}),
    preset: 'basic',
    selectedParmIds: resolvePresetParamIds('basic'),
  }
}
