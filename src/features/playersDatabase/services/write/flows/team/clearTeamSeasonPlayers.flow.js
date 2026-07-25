// features/playersDatabase/services/write/flows/team/clearTeamSeasonPlayers.flow.js

import { syncLeaguesMasterDocument, updateLeagueSeasonTableRankScoutProfilesSummary, updateLeagueSeasonTableRankTeamUrl } from '../../leagues/index.js'
import { removePlayerSeasonDocsMany } from '../../players/index.js'
import { deletePlayerSearchIndexesForTeamSeason, getSearchIndexMetaForTeamSeason, updateTeamSeasonSearchIndexRosterMeta, updateTeamSeasonSearchIndexScoutProfilesSummary } from '../../searchIndex/index.js'
import { clearTeamSeasonPlayers } from '../../teams/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'

const FLOW = 'clearTeamSeasonPlayers'

const runStage = async ({ stage, results, action }) => {
  try {
    const result = await action()
    results[stage] = result
    return result
  } catch (error) {
    throw attachWriteFlowReport({ error, stage, results, flow: FLOW })
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

  const playerSeasonDocsResult = await runStage({
    stage: 'removePlayerSeasonDocsMany',
    results,
    action: () => removePlayerSeasonDocsMany({
      ...payload,
      playerDocumentIds: searchIndexMetaResult.playerDocumentIds,
    }),
  })

  const playerIndexesResult = await runStage({
    stage: 'deletePlayerSearchIndexesForTeamSeason',
    results,
    action: () => deletePlayerSearchIndexesForTeamSeason(payload),
  })

  const leagueRosterResult = await runStage({
    stage: 'updateLeagueSeasonTableRankTeamUrl',
    results,
    action: () => updateLeagueSeasonTableRankTeamUrl({
      ...payload,
      team: {
        ...(payload.team || {}),
        playersCount: 0,
      },
    }),
  })

  const leagueProfilesResult = await runStage({
    stage: 'updateLeagueSeasonTableRankScoutProfilesSummary',
    results,
    action: () => updateLeagueSeasonTableRankScoutProfilesSummary({
      ...payload,
      scoutProfilesSummary: { total: 0, profileCounts: {} },
    }),
  })

  const teamIndexRosterResult = await runStage({
    stage: 'updateTeamSeasonSearchIndexRosterMeta',
    results,
    action: () => updateTeamSeasonSearchIndexRosterMeta({
      ...payload,
      playersCount: 0,
      playerSeasonIndexCount: 0,
      scoutProfiledPlayersCount: 0,
    }),
  })

  const teamIndexProfilesResult = await runStage({
    stage: 'updateTeamSeasonSearchIndexScoutProfilesSummary',
    results,
    action: () => updateTeamSeasonSearchIndexScoutProfilesSummary({
      ...payload,
      scoutProfilesSummary: { total: 0, profileCounts: {} },
    }),
  })

  const masterResult = await runStage({
    stage: 'syncLeaguesMasterDocument',
    results,
    action: () => syncLeaguesMasterDocument({
      leagues: [payload.league || { id: payload.season?.leagueId }],
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
    playerSeasonDocsResult,
    playerIndexesResult,
    leagueRosterResult,
    leagueProfilesResult,
    teamIndexRosterResult,
    teamIndexProfilesResult,
    masterResult,
  }
}
