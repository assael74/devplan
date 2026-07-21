// features/playersDatabase/services/write/flows/team/pasteTeamPlayerStats.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
} from '../../leagues/index.js'
import {
  syncPlayerScoutProfileDocsMany,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexStatsMany,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  ensureTeamDoc,
  updateTeamSeasonPlayerStats,
} from '../../teams/index.js'
import {
  buildScoutProfilesSummary,
} from '../shared.js'

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `Player stats sync failed at ${stage}`)

  error.name = 'PlayerStatsSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}

const assertTeamSeasonUpdated = result => {
  if (!result?.teamDocumentId || !result?.seasonId) {
    throw new Error('Team season stats were not updated')
  }
}

export async function pasteTeamPlayerStatsFlow(payload = {}) {
  const results = {}
  const scoutProfilesSummary = buildScoutProfilesSummary(payload.players)

  try {
    results.teamDocResult = await ensureTeamDoc(payload.team || {})
  } catch (error) {
    throw buildSyncError({
      stage: 'ensureTeamDoc',
      cause: error,
      results,
    })
  }

  const team = {
    ...(payload.team || {}),
    birthTeamDocumentId: results.teamDocResult.birthTeamDocumentId,
    teamDocumentId: results.teamDocResult.teamDocumentId,
  }

  try {
    results.teamSeasonResult = await updateTeamSeasonPlayerStats({
      ...payload,
      team,
    })
    assertTeamSeasonUpdated(results.teamSeasonResult)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateTeamSeasonPlayerStats',
      cause: error,
      results,
    })
  }

  try {
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexStatsMany({
      ...payload,
      team,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerSeasonSearchIndexStatsMany',
      cause: error,
      results,
    })
  }

  try {
    results.playerScoutProfileDocsResult = await syncPlayerScoutProfileDocsMany({
      ...payload,
      team,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'syncPlayerScoutProfileDocsMany',
      cause: error,
      results,
    })
  }

  try {
    results.leagueTableRankScoutProfilesResult = await updateLeagueSeasonTableRankScoutProfilesSummary({
      ...payload,
      team,
      scoutProfilesSummary,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'updateLeagueSeasonTableRankScoutProfilesSummary',
      cause: error,
      results,
    })
  }

  try {
    results.teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary({
      ...payload,
      team,
      scoutProfilesSummary,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'updateTeamSeasonSearchIndexScoutProfilesSummary',
      cause: error,
      results,
    })
  }

  if (results.playerScoutProfileDocsResult.failedCount) {
    throw buildSyncError({
      stage: 'playerScoutProfileDocsPartialFailure',
      cause: new Error(
        `${results.playerScoutProfileDocsResult.failedCount} player documents failed to sync`
      ),
      results,
    })
  }

  return {
    ...results,
    rowsCount: results.playerSeasonIndexResult.rowsCount,
    syncStatus: 'complete',
  }
}
