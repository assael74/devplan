// src/features/playersDatabase/services/writeV2/stats/flows/statsFinalSync.flow.js

import { writeStatsCanonicalV2 } from './writeStatsCanonical.flow.js'
import { syncStatsCounterpartsV2 } from './syncStatsCounterparts.flow.js'
import { syncStatsPlayerDocumentsV2 } from './syncStatsPlayerDocuments.flow.js'
import { syncStatsPlayerIndexesV2 } from './syncStatsPlayerIndexes.flow.js'
import { syncStatsTeamLeagueV2 } from './syncStatsTeamLeague.flow.js'
import { syncStatsClubsV2 } from './syncStatsClubs.flow.js'

export const STATS_FINAL_SYNC_STAGE = Object.freeze({
  CANONICAL: 'canonical',
  COUNTERPARTS: 'counterparts',
  PLAYER_DOCUMENTS: 'playerDocuments',
  PLAYER_INDEXES: 'playerIndexes',
  TEAM_LEAGUE: 'teamLeague',
  CLUBS: 'clubs',
})

export const STATS_FINAL_SYNC_STAGES = Object.freeze([
  STATS_FINAL_SYNC_STAGE.CANONICAL,
  STATS_FINAL_SYNC_STAGE.COUNTERPARTS,
  STATS_FINAL_SYNC_STAGE.PLAYER_DOCUMENTS,
  STATS_FINAL_SYNC_STAGE.PLAYER_INDEXES,
  STATS_FINAL_SYNC_STAGE.TEAM_LEAGUE,
  STATS_FINAL_SYNC_STAGE.CLUBS,
])

const handlers = {
  [STATS_FINAL_SYNC_STAGE.CANONICAL]: writeStatsCanonicalV2,
  [STATS_FINAL_SYNC_STAGE.COUNTERPARTS]: syncStatsCounterpartsV2,
  [STATS_FINAL_SYNC_STAGE.PLAYER_DOCUMENTS]: syncStatsPlayerDocumentsV2,
  [STATS_FINAL_SYNC_STAGE.PLAYER_INDEXES]: syncStatsPlayerIndexesV2,
  [STATS_FINAL_SYNC_STAGE.TEAM_LEAGUE]: syncStatsTeamLeagueV2,
  [STATS_FINAL_SYNC_STAGE.CLUBS]: syncStatsClubsV2,
}

export async function runStatsFinalSyncStageV2({ stage, approvedState } = {}) {
  const handler = handlers[stage]
  if (!handler) {
    const error = new Error(`Unsupported Stats Final Sync stage: ${stage || 'missing'}`)
    error.code = 'STATS_FINAL_SYNC_STAGE_INVALID'
    throw error
  }
  if (stage === STATS_FINAL_SYNC_STAGE.PLAYER_INDEXES ||
      stage === STATS_FINAL_SYNC_STAGE.TEAM_LEAGUE) {
    return handler({ approved: approvedState })
  }

  return handler({ approvedState })
}
