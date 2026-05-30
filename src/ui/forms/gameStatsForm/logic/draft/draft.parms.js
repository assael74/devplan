// src/ui/forms/gameStatsForm/logic/draft/draft.parms.js

import {
  resolvePresetParmIds,
} from '../parms.logic.js'

export const patchSelectedParmsDraft = (draft, selectedParmIds) => {
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
    selectedParmIds: resolvePresetParmIds(preset),
  }
}

export const resetSelectedParmsDraft = draft => {
  return {
    ...(draft || {}),
    preset: 'basic',
    selectedParmIds: resolvePresetParmIds('basic'),
  }
}
