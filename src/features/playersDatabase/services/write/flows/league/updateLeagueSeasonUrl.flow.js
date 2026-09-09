// features/playersDatabase/services/write/flows/league/updateLeagueSeasonUrl.flow.js

import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { updateLeagueSeasonUrl } from '../../leagues/index.js'


export async function updateLeagueSeasonUrlFlow(payload = {}) {
  const results = {}

  try {
    results.leagueSeasonResult = await updateLeagueSeasonUrl(payload)
  } catch (error) {
    throw buildWriteFlowSyncError({
      name: 'LeagueSeasonUrlSyncError',
      fallbackMessage: 'League season URL sync failed',
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
