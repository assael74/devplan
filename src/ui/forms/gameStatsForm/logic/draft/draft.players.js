// src/ui/forms/gameStatsForm/logic/draft/draft.players.js

import {
  getDefaultSelectedPlayerIds,
  resetPlayerStatsRow,
  syncSelectedPlayersStatsRows,
} from '../players.logic.js'

const getNextActivePlayerId = ({ draft, selectedPlayerIds }) => {
  if (!selectedPlayerIds.length) return ''

  if (selectedPlayerIds.includes(draft?.activePlayerId)) {
    return draft.activePlayerId
  }

  return selectedPlayerIds[0] || ''
}

export const buildSelectedPlayersPatch = ({ draft, selectedPlayerIds, game, team }) => {
  const nextSelectedPlayerIds = Array.isArray(selectedPlayerIds)
    ? selectedPlayerIds
    : []

  return {
    selectedPlayerIds: nextSelectedPlayerIds,
    activePlayerId: getNextActivePlayerId({
      draft,
      selectedPlayerIds: nextSelectedPlayerIds,
    }),
    playerStats: syncSelectedPlayersStatsRows({
      draft,
      selectedPlayerIds: nextSelectedPlayerIds,
      game,
      team,
    }),
  }
}

export const patchSelectedPlayersDraft = (draft, selectedPlayerIds, meta = {}) => {
  return {
    ...(draft || {}),
    ...buildSelectedPlayersPatch({
      draft: draft || {},
      selectedPlayerIds,
      game: meta.game,
      team: meta.team,
    }),
  }
}

export const resetSelectedPlayersDraft = (draft, meta = {}) => {
  const selectedPlayerIds = getDefaultSelectedPlayerIds(draft?.players || [])

  return patchSelectedPlayersDraft(draft, selectedPlayerIds, meta)
}

export const resetSinglePlayerDraft = (draft, playerId, meta = {}) => {
  return {
    ...(draft || {}),
    playerStats: resetPlayerStatsRow({
      draft,
      playerId,
      game: meta.game,
      team: meta.team,
    }),
  }
}
