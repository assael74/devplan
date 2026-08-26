// features/playersDatabase/services/write/flows/team/clearTeamSeasonPlayers.flow.js

import {
  updateLeagueSeasonTableRankTeamSyncMeta,
} from '../../leagues/index.js'
import { removePlayerSeasonDocsMany } from '../../players/index.js'
import {
  deletePlayerSearchIndexesForTeamSeason,
  getSearchIndexMetaForTeamSeason,
  updateTeamSeasonSearchIndexRosterMeta,
} from '../../searchIndex/index.js'
import { clearTeamSeasonPlayers } from '../../teams/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'

const FLOW = 'clearTeamSeasonPlayers'

const mergePlayerDocumentIds = (...groups) => Array.from(new Set(
  groups
    .flatMap(group => (Array.isArray(group) ? group : []))
    .filter(Boolean)
))

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

  const searchIndexMetaResult = await runStage({
    stage: 'getSearchIndexMetaForTeamSeason',
    results,
    action: () => getSearchIndexMetaForTeamSeason(payload),
  })

  const teamSeasonResult = await runStage({
    stage: 'clearTeamSeasonPlayers',
    results,
    action: () => clearTeamSeasonPlayers(payload),
  })

  const playerDocumentIds = mergePlayerDocumentIds(
    teamSeasonResult.playerDocumentIds,
    searchIndexMetaResult.playerDocumentIds
  )

  const playerSeasonDocsResult = await runStage({
    stage: 'removePlayerSeasonDocsMany',
    results,
    action: () => removePlayerSeasonDocsMany({
      ...payload,
      playerDocumentIds,
    }),
  })

  const playerIndexesResult = await runStage({
    stage: 'deletePlayerSearchIndexesForTeamSeason',
    results,
    action: () => deletePlayerSearchIndexesForTeamSeason(payload),
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

  const teamIndexRosterResult = await runStage({
    stage: 'updateTeamSeasonSearchIndexRosterMeta',
    results,
    action: () => updateTeamSeasonSearchIndexRosterMeta({
      ...payload,
      playersCount: 0,
      playerSeasonIndexCount: 0,
      scoutProfilesSummary: {
        total: 0,
        profileCounts: {},
      },
      teamBalance: teamSeasonResult.teamBalance,
    }),
  })



  return {
    status: 'complete',
    syncStatus: 'complete',
    completed: true,
    removedPlayersCount: teamSeasonResult.removedPlayersCount || 0,
    rowsCount: playerIndexesResult.rowsCount || 0,
    searchIndexMetaResult,
    teamSeasonResult,
    playerDocumentIds,
    playerSeasonDocsResult,
    playerIndexesResult,
    leagueRosterResult,
    leagueProfilesResult,
    teamIndexRosterResult,
    teamIndexProfilesResult: teamIndexRosterResult,
  }
}
