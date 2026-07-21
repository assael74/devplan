// features/playersDatabase/services/write/flows/player/updatePlayerFavorite.flow.js

import {
  updatePlayerFavorite,
} from '../../players/index.js'
import {
  updatePlayerFavoriteSearchIndexes,
} from '../../searchIndex/index.js'

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `Player favorite sync failed at ${stage}`)

  error.name = 'PlayerFavoriteSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}

export async function updatePlayerFavoriteFlow(payload = {}) {
  const results = {}

  try {
    results.playerFavoriteResult = await updatePlayerFavorite(payload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerFavorite',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonIndexResult = await updatePlayerFavoriteSearchIndexes(payload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerFavoriteSearchIndexes',
      cause: error,
      results,
    })
  }

  return {
    ...results,
    rowsCount: results.playerSeasonIndexResult.rowsCount,
    syncStatus: 'complete',
  }
}
