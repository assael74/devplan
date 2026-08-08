// features/playersDatabase/services/write/flows/league/updateLeagueSeasonUrl.flow.js

import { updateLeagueSeasonUrl } from '../../leagues/index.js'

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

  return {
    ...results,
    rowsCount: results.leagueSeasonResult?.updated ? 1 : 0,
    syncStatus: 'complete',
  }
}
