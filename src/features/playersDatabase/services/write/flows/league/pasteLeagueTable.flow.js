// src/features/playersDatabase/services/write/flows/league/pasteLeagueTable.flow.js

import {
  ensureLeagueDoc,
  updateLeagueSeasonTableRank,
} from '../../leagues/index.js'
import {
  syncLeagueClubSeasonIdentityIndex,
} from '../../clubs/index.js'
import {
  queueLeagueProjectionJob,
} from '../../leagueProjectionJobs/leagueProjectionJob.write.js'
import {
  assertWriteResultClean,
  attachWriteFlowReport,
} from '../writeFlowReport.js'

export async function pasteLeagueTableFlow(payload = {}) {
  const results = {}
  let stage = 'leagueDocument'
  let leagueCanonicalCommitted = false
  const sourceRevision = `${Date.now()}-${Math.random().toString(36).slice(2)}`

  try {
    results.leagueDocument = await ensureLeagueDoc(
      payload.league || {},
      { syncMaster: false }
    )

    stage = 'leagueTable'
    results.leagueTable = await updateLeagueSeasonTableRank({
      ...payload,
      season: {
        ...(payload.season || {}),
        sourceRevision,
      },
      syncMaster: false,
    })
    leagueCanonicalCommitted = true

    const canonicalRows = results.leagueTable?.seasonDocument?.tableRank || []
    const canonicalSeason = results.leagueTable?.seasonDocument || payload.season || {}
    const target = results.leagueTable?.target || payload.target || 'current'

    stage = 'clubSeasonIdentityIndex'
    results.clubSeasonIdentityIndex = await syncLeagueClubSeasonIdentityIndex({
      league: payload.league || {},
      season: canonicalSeason,
      rows: canonicalRows,
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
    })
    assertWriteResultClean({ result: results.clubSeasonIdentityIndex, stage })

    // The League table is now the complete source needed by Stats validation.
    // All derived document work is delegated to the durable server job.
    stage = 'projectionJob'
    results.projectionJob = await queueLeagueProjectionJob({
      league: payload.league || {},
      season: canonicalSeason,
      target,
      sourceRevision,
      writeActionId: payload.writeActionId,
    })

    return {
      status: 'canonical_complete',
      ...results.leagueTable,
      leagueCanonicalCommitted: true,
      projectionsCompleted: false,
      backgroundSyncPending: true,
      completed: false,
      recoveryRequired: false,
      leagueResult: results.leagueTable,
      projectionJob: results.projectionJob,
      results,
    }
  } catch (error) {
    if (leagueCanonicalCommitted) {
      error.leagueCanonicalCommitted = true
      error.projectionsCompleted = false
      error.completed = false
      error.recoveryRequired = true
    }
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: 'pasteLeagueTable',
    })
  }
}
