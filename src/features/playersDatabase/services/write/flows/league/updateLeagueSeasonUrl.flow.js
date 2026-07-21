// features/playersDatabase/services/write/flows/league/updateLeagueSeasonUrl.flow.js

import {
  updateLeagueSeasonUrl,
} from '../../leagues/index.js'
import {
  updateSearchIndexesLeagueSeasonUrl,
} from '../../searchIndex/index.js'

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `League season URL sync failed at ${stage}`)

  error.name = 'LeagueSeasonUrlSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}

export async function updateLeagueSeasonUrlFlow(payload = {}) {
  const results = {}

  try {
    results.leagueSeasonResult = await updateLeagueSeasonUrl(payload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateLeagueSeasonUrl',
      cause: error,
      results,
    })
  }

  try {
    results.searchIndexResult = await updateSearchIndexesLeagueSeasonUrl(payload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateSearchIndexesLeagueSeasonUrl',
      cause: error,
      results,
    })
  }

  return {
    ...results,
    rowsCount: results.searchIndexResult.rowsCount,
    syncStatus: 'complete',
  }
}
