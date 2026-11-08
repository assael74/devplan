// src/ui/forms/gameStats/logic/draft/draft.logic.js

import {
  buildSelectedPlayersPatch,
} from './draft.players.js'

import {
  patchPresetDraft,
  patchSelectedParamsDraft,
} from './draft.params.js'

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
  patchSelectedParamsDraft,
  resetSelectedParamsDraft,
} from './draft.params.js'

const hasPatchKey = (patch, key) => {
  return Object.prototype.hasOwnProperty.call(patch || {}, key)
}

function patchPlayerTimes(draft, patch) {
  const scope = draft.scope || draft.meta?.scope
  if (scope !== 'player' && scope !== 'privatePlayer') return draft

  const timePatch = {}
  for (const key of ['timePlayed', 'timeVideoStats']) {
    if (hasPatchKey(patch, key)) timePatch[key] = patch[key]
  }

  if (!Object.keys(timePatch).length) return draft

  const playerId = draft.editablePlayerId || draft.meta?.playerId || draft.activePlayerId
  const updateRows = rows => (Array.isArray(rows) ? rows : []).map(row => {
    return (row.playerId || row.id) === playerId ? { ...row, ...timePatch } : row
  })

  return {
    ...draft,
    players: updateRows(draft.players),
    playerStats: updateRows(draft.playerStats),
  }
}

export const patchGameStatsDraft = (draft, patch, meta = {}) => {
  const base = patchPlayerTimes({
    ...(draft || {}),
    ...(patch || {}),
  }, patch)

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
    return patchSelectedParamsDraft(base, patch.selectedParmIds)
  }

  if (hasPatchKey(patch, 'preset')) {
    return patchPresetDraft(base, patch.preset)
  }

  return base
}
