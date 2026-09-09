// features/playersDatabase/services/write/flows/team/clearTeamSeasonPlayers.flow.js

import {
  updateLeagueSeasonTableRankTeamSyncMeta,
} from '../../leagues/index.js'
import { removePlayerSeasonDocsMany } from '../../players/index.js'
import { deleteSearchIndexesForTeamSeason } from '../../searchIndex/index.js'
import { removeTeamSeason } from '../../teams/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'
import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'

const FLOW = 'clearTeamSeasonPlayers'

const buildCommittedProjectionFailure = ({
  stage,
  cause,
  results = {},
} = {}) => buildWriteFlowSyncError({
  name: 'ClearTeamSeasonPlayersProjectionSyncError',
  fallbackMessage: 'Team roster was cleared, but projection synchronization failed',
  stage,
  cause,
  results: {
    ...results,
    teamCanonicalCommitted: true,
    projectionsCompleted: false,
    completed: false,
    syncStatus: 'projection_failed',
    recoveryRequired: true,
    stoppedAt: stage,
    projectionError: String(cause?.message || `Projection sync failed at ${stage}`).trim(),
  },
})

const runProjectionStage = async ({ stage, results, action }) => {
  try {
    const result = await action()
    results[stage] = result

    if (result?.updated === false || (result?.failedCount || 0) > 0) {
      throw new Error(
        result?.reason ||
        `${result.failedCount} projection record(s) failed`
      )
    }

    return result
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage,
      cause: error,
      results,
    })
  }
}
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

  const playerSeasonDocsResult = await runProjectionStage({
    stage: 'removePlayerSeasonDocsMany',
    results,
    action: () => removePlayerSeasonDocsMany({
      ...payload,
      playerDocumentIds,
    }),
  })

  const playerIndexesResult = await runProjectionStage({
    stage: 'deleteSearchIndexesForTeamSeason',
    results,
    action: () => deleteSearchIndexesForTeamSeason(payload),
  })

  const leagueTeamMetaResult = await runProjectionStage({
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
      teamTaskSignals: {
        offense: false,
        defense: false,
      },
    }),
  })
  const leagueRosterResult = leagueTeamMetaResult
  const leagueProfilesResult = leagueTeamMetaResult

  return {
    status: 'complete',
    syncStatus: 'complete',
    completed: true,
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    recoveryRequired: false,
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
