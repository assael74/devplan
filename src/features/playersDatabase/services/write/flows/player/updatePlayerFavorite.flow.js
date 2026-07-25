// features/playersDatabase/services/write/flows/player/updatePlayerFavorite.flow.js

import {
  updatePlayerFavorite,
} from '../../players/index.js'
import {
  updatePlayerFavoriteSearchIndexes,
} from '../../searchIndex/index.js'
import {
  updatePlayerFavoriteInAllTeamSeasons,
} from '../../teams/index.js'

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
    results.playerSeasonIndexesResult = await updatePlayerFavoriteSearchIndexes(payload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerFavoriteSearchIndexes',
      cause: error,
      results,
    })
  }

  try {
    results.teamSeasonsResult = await updatePlayerFavoriteInAllTeamSeasons(payload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerFavoriteInAllTeamSeasons',
      cause: error,
      results,
    })
  }

  return {
    ...results,
    rowsCount: (
      Number(results.playerSeasonIndexesResult?.rowsCount || 0) +
      Number(results.teamSeasonsResult?.rowsCount || 0)
    ),
    syncStatus: 'complete',
  }
}
