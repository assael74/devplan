// features/playersDatabase/services/write/flows/team/clearTeamSeasonPlayers.flow.js

import {
  updateLeagueSeasonTableRankTeamSyncMeta,
} from '../../leagues/index.js'
import { removePlayerSeasonDocsMany } from '../../players/index.js'
import { deleteSearchIndexesForTeamSeason } from '../../searchIndex/index.js'
import { removeTeamSeason } from '../../teams/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'

const FLOW = 'clearTeamSeasonPlayers'
const runStage = async ({ stage, results, action }) => {
  try {
    const result = await action()
    results[stage] = result
    return result
  } catch (error) {
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: FLOW,
    })
  }
}

export async function clearTeamSeasonPlayersFlow(payload = {}) {
  const results = {}
  const teamSeasonResult = await runStage({
    stage: 'removeTeamSeason',
    results,
    action: () => removeTeamSeason(payload),
  })

  const playerDocumentIds = Array.isArray(teamSeasonResult.playerDocumentIds)
    ? teamSeasonResult.playerDocumentIds
    : []

  const playerSeasonDocsResult = await runStage({
    stage: 'removePlayerSeasonDocsMany',
    results,
    action: () => removePlayerSeasonDocsMany({
      ...payload,
      playerDocumentIds,
    }),
  })

  const playerIndexesResult = await runStage({
    stage: 'deleteSearchIndexesForTeamSeason',
    results,
    action: () => deleteSearchIndexesForTeamSeason(payload),
  })

  const leagueTeamMetaResult = await runStage({
    stage: 'updateLeagueSeasonTableRankTeamSyncMeta',
    results,
    action: () => updateLeagueSeasonTableRankTeamSyncMeta({
      ...payload,
      team: {
        ...(payload.team || {}),
        ...buildTeamLoadStatus([]),
      },
      scoutProfilesSummary: {
        total: 0,
        profileCounts: {},
      },
    }),
  })
  const leagueRosterResult = leagueTeamMetaResult
  const leagueProfilesResult = leagueTeamMetaResult

  return {
    status: 'complete',
    syncStatus: 'complete',
    completed: true,
    removedPlayersCount: teamSeasonResult.removedPlayersCount || 0,
    rowsCount: playerIndexesResult.rowsCount || 0,
    teamSeasonResult,
    playerDocumentIds,
    playerSeasonDocsResult,
    playerIndexesResult,
    leagueRosterResult,
    leagueProfilesResult,
  }
}
