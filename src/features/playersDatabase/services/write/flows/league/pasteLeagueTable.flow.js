// features/playersDatabase/services/write/flows/league/pasteLeagueTable.flow.js

import {
  ensureLeagueDoc,
  syncLeaguesMasterDocument,
  updateLeagueSeasonTableRank,
} from '../../leagues/index.js'
import { upsertTeamSeasonSearchIndexMany } from '../../searchIndex/index.js'
import {
  assertWriteResultClean,
  attachWriteFlowReport,
} from '../writeFlowReport.js'

export async function pasteLeagueTableFlow(payload = {}) {
  const results = {}
  let stage = 'leagueDocument'

  try {
    results.leagueDocument = await ensureLeagueDoc(
      payload.league || {},
      { syncMaster: false }
    )

    stage = 'leagueTable'
    results.leagueTable = await updateLeagueSeasonTableRank({
      ...payload,
      syncMaster: false,
    })

    stage = 'teamIndexes'
    results.teamIndexes = await upsertTeamSeasonSearchIndexMany(payload)
    assertWriteResultClean({
      result: results.teamIndexes,
      stage,
    })

    stage = 'leaguesMaster'
    results.leaguesMaster = await syncLeaguesMasterDocument({
      leagues: [payload.league || {}],
    })

    return {
      status: 'complete',
      ...results.leagueTable,
      leagueResult: results.leagueTable,
      searchIndexResult: results.teamIndexes,
      results,
    }
  } catch (error) {
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: 'pasteLeagueTable',
    })
  }
}
