// features/playersDatabase/services/write/flows/league/createLeagueSeason.flow.js

import {
  syncLeaguesMasterDocument,
  upsertLeagueSeason,
} from '../../leagues/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'

export async function createLeagueSeasonFlow(payload = {}) {
  const results = {}
  let stage = 'leagueSeason'

  try {
    results.leagueSeason = await upsertLeagueSeason({
      ...payload,
      syncMaster: false,
    })

    stage = 'leaguesMaster'
    results.leaguesMaster = await syncLeaguesMasterDocument({
      leagues: [payload.league || {}],
    })

    return {
      status: 'complete',
      ...results.leagueSeason,
      results,
    }
  } catch (error) {
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: 'createLeagueSeason',
    })
  }
}
