// src/ui/forms/gameStatsForm/logic/entryStep.logic.js

import {
  resetPlayerStatsRow,
} from './players.logic.js'

import {
  restorePlayerStatsRow,
  updatePlayerStatsRow,
} from './entry.logic.js'

// אחריות:
// Patch builders של Step מילוי הסטטיסטיקה.

export const buildSetActivePlayerPatch = playerId => {
  return {
    activePlayerId: playerId,
  }
}

export const buildResetActivePlayerPatch = ({ draft, playerId }) => {
  return {
    playerStats: resetPlayerStatsRow({
      draft,
      playerId,
    }),
  }
}

export const buildRestoreActivePlayerPatch = ({ draft, savedDraft, playerId, savedRow }) => {
  const playerStats = savedRow
    ? restorePlayerStatsRow({
        draft,
        savedDraft,
        playerId,
      })
    : resetPlayerStatsRow({
        draft,
        playerId,
      })

  return {
    playerStats,
  }
}

export const buildUpdatePlayerStatsPatch = ({ draft, playerId, patch }) => {
  return {
    playerStats: updatePlayerStatsRow({
      draft,
      playerId,
      patch,
    }),
  }
}
