// features/playersDatabase/services/write/flows/team/deleteTeamPlayerFromSeason.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
  updateLeagueSeasonTableRankTeamUrl,
} from '../../leagues/index.js'
import {
  removePlayerSeasonDocsMany,
} from '../../players/index.js'
import {
  deleteSearchIndexForTeamPlayerSeason,
  getSearchIndexMetaForTeamPlayerSeason,
  updateTeamSeasonSearchIndexRosterMeta,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  removeTeamPlayerFromSeason,
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
    error.name = 'TeamPlayerSeasonDeleteError'
    error.stage = stage
    error.results = results
    throw error
  }
}

export async function deleteTeamPlayerFromSeasonFlow(payload = {}) {
  const player = payload.player || {}
  const results = {}

  const searchIndexMetaResult = await runDeleteStage({
    stage: 'getSearchIndexMetaForTeamPlayerSeason',
    results,
    action: () => getSearchIndexMetaForTeamPlayerSeason({
      ...payload,
      player,
    }),
  })

  const teamPlayerResult = await runDeleteStage({
    stage: 'removeTeamPlayerFromSeason',
    results,
    action: () => removeTeamPlayerFromSeason({
      ...payload,
      player,
    }),
  })

  if (!teamPlayerResult.removed) {
    const error = new Error('Team player was not removed from the team season')
    error.name = 'TeamPlayerSeasonDeleteError'
    error.stage = 'removeTeamPlayerFromSeason'
    error.results = results
    throw error
  }

  const playerDocumentIds = [
    ...(Array.isArray(searchIndexMetaResult.playerDocumentIds)
      ? searchIndexMetaResult.playerDocumentIds
      : []),
    player.playerDocumentId,
  ].filter(Boolean)

  const playerSeasonDocsResult = await runDeleteStage({
    stage: 'removePlayerSeasonDocsMany',
    results,
    action: () => removePlayerSeasonDocsMany({
      ...payload,
      playerDocumentIds,
    }),
  })

  const searchIndexResult = await runDeleteStage({
    stage: 'deleteSearchIndexForTeamPlayerSeason',
    results,
    action: () => deleteSearchIndexForTeamPlayerSeason({
      ...payload,
      player,
    }),
  })

  const teamWithRosterMeta = {
    ...(payload.team || {}),
    playersCount: teamPlayerResult.playersCount,
  }

  const leagueTableRankResult = await runDeleteStage({
    stage: 'updateLeagueSeasonTableRankTeamUrl',
    results,
    action: () => updateLeagueSeasonTableRankTeamUrl({
      ...payload,
      team: teamWithRosterMeta,
    }),
  })

  const leagueTableRankScoutProfilesResult = await runDeleteStage({
    stage: 'updateLeagueSeasonTableRankScoutProfilesSummary',
    results,
    action: () => updateLeagueSeasonTableRankScoutProfilesSummary({
      ...payload,
      team: payload.team || {},
      scoutProfilesSummary: teamPlayerResult.scoutProfilesSummary,
    }),
  })

  const teamSeasonIndexResult = await runDeleteStage({
    stage: 'updateTeamSeasonSearchIndexRosterMeta',
    results,
    action: () => updateTeamSeasonSearchIndexRosterMeta({
      ...payload,
      team: teamWithRosterMeta,
      playersCount: teamPlayerResult.playersCount,
      playerSeasonIndexCount: searchIndexResult.remainingRowsCount,
      scoutProfiledPlayersCount: teamPlayerResult.scoutProfilesSummary.total,
    }),
  })

  const teamSeasonIndexScoutProfilesResult = await runDeleteStage({
    stage: 'updateTeamSeasonSearchIndexScoutProfilesSummary',
    results,
    action: () => updateTeamSeasonSearchIndexScoutProfilesSummary({
      ...payload,
      team: payload.team || {},
      scoutProfilesSummary: teamPlayerResult.scoutProfilesSummary,
    }),
  })

  return {
    searchIndexMetaResult,
    teamPlayerResult,
    playerSeasonDocsResult,
    searchIndexResult,
    leagueTableRankResult,
    leagueTableRankScoutProfilesResult,
    teamSeasonIndexResult,
    teamSeasonIndexScoutProfilesResult,
    rowsCount: searchIndexResult.rowsCount,
    syncStatus: 'complete',
  }
}
