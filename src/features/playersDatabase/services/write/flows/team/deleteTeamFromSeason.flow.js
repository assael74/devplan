// features/playersDatabase/services/write/flows/team/deleteTeamFromSeason.flow.js

import {
  removeLeagueSeasonTeam,
} from '../../leagues/index.js'
import {
  removePlayerSeasonDocsMany,
} from '../../players/index.js'
import {
  deleteSearchIndexesForTeamSeason,
  getSearchIndexMetaForTeamSeason,
} from '../../searchIndex/index.js'
import {
  removeTeamSeason,
} from '../../teams/index.js'

const runDeleteStage = async ({
  stage,
  results,
  action,
}) => {
  try {
    const result = await action()
    results[stage] = result

    return result
  } catch (error) {
    error.name = 'TeamSeasonDeleteError'
    error.stage = stage
    error.results = results
    throw error
  }
}

export async function deleteTeamFromSeasonFlow(payload = {}) {
  const results = {}

  const searchIndexMetaResult = await runDeleteStage({
    stage: 'getSearchIndexMetaForTeamSeason',
    results,
    action: () => getSearchIndexMetaForTeamSeason(payload),
  })

  const leagueTableRankResult = await runDeleteStage({
    stage: 'removeLeagueSeasonTeam',
    results,
    action: () => removeLeagueSeasonTeam(payload),
  })

  if (!leagueTableRankResult.removed) {
    return {
      leagueTableRankResult,
      teamSeasonResult: null,
      searchIndexResult: null,
      searchIndexMetaResult,
      playerSeasonDocsResult: null,
      rowsCount: 0,
      completed: false,
      stoppedAt: 'leagueTableRank',
      syncStatus: 'stopped',
    }
  }

  const teamSeasonResult = await runDeleteStage({
    stage: 'removeTeamSeason',
    results,
    action: () => removeTeamSeason(payload),
  })

  const playerSeasonDocsResult = await runDeleteStage({
    stage: 'removePlayerSeasonDocsMany',
    results,
    action: () => removePlayerSeasonDocsMany({
      ...payload,
      playerDocumentIds: searchIndexMetaResult.playerDocumentIds,
    }),
  })

  const searchIndexResult = await runDeleteStage({
    stage: 'deleteSearchIndexesForTeamSeason',
    results,
    action: () => deleteSearchIndexesForTeamSeason(payload),
  })

  return {
    leagueTableRankResult,
    teamSeasonResult,
    searchIndexResult,
    searchIndexMetaResult,
    playerSeasonDocsResult,
    rowsCount: searchIndexResult.rowsCount,
    completed: true,
    syncStatus: 'complete',
  }
}
