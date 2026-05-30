// src/ui/forms/gameStatsForm/logic/draft/draft.logic.js

import {
  buildSelectedPlayersPatch,
} from './draft.players.js'

import {
  patchPresetDraft,
  patchSelectedParmsDraft,
} from './draft.parms.js'

export {
  createInitialGameStatsDraft,
} from './draft.init.js'

export {
  patchSelectedPlayersDraft,
  resetSelectedPlayersDraft,
  resetSinglePlayerDraft,
} from './draft.players.js'

export {
  patchPresetDraft,
  patchSelectedParmsDraft,
  resetSelectedParmsDraft,
} from './draft.parms.js'

const hasPatchKey = (patch, key) => {
  return Object.prototype.hasOwnProperty.call(patch || {}, key)
}

export const patchGameStatsDraft = (draft, patch, meta = {}) => {
  const base = {
    ...(draft || {}),
    ...(patch || {}),
  }

  if (hasPatchKey(patch, 'selectedPlayerIds')) {
    return {
      ...base,
      ...buildSelectedPlayersPatch({
        draft: base,
        selectedPlayerIds: patch.selectedPlayerIds,
        game: meta.game,
        team: meta.team,
      }),
    }
  }

  if (hasPatchKey(patch, 'selectedParmIds')) {
    return patchSelectedParmsDraft(base, patch.selectedParmIds)
  }

  if (hasPatchKey(patch, 'preset')) {
    return patchPresetDraft(base, patch.preset)
  }

  return base
}
