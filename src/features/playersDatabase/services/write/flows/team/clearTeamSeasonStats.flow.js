// features/playersDatabase/services/write/flows/team/clearTeamSeasonStats.flow.js

import {
  updateLeagueSeasonTableRankTeamSyncMeta,
} from '../../leagues/index.js'
import { clearExistingPlayerSeasonProfilesMany } from '../../players/index.js'
import {
  updateTeamSeasonSearchIndexRosterMeta,
  upsertPlayerSeasonSearchIndexMany,
} from '../../searchIndex/index.js'
import {
  ensureRequiredClubProjectionCompleted,
  syncClubProjectionFromTeamSeason,
} from '../../clubs/index.js'
import {
  clearTeamSeasonPlayerDocumentIds,
  clearTeamSeasonStats,
} from '../../teams/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'
import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import { resolveLeagueSeasonStatus } from '../../../../domain/projections/teamPerformance.projection.js'

const FLOW = 'clearTeamSeasonStats'

const buildCommittedProjectionFailure = ({
  stage,
  cause,
  results = {},
} = {}) => buildWriteFlowSyncError({
  name: 'ClearTeamSeasonStatsProjectionSyncError',
  fallbackMessage: 'Team stats were cleared, but projection synchronization failed',
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

    if (
      result?.updated === false ||
      (result?.failedCount || 0) > 0 ||
      (stage === 'clubProjection' && result?.completed !== true)
    ) {
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
    throw attachWriteFlowReport({ error, stage, results, flow: FLOW })
  }
}

export async function clearTeamSeasonStatsFlow(payload = {}) {
  const results = {}
  const seasonStatus = resolveLeagueSeasonStatus({
    league: payload.league,
    season: payload.season,
  })
  if (!['active', 'completed'].includes(seasonStatus)) {
    const error = new Error('League season lifecycle could not be resolved')
    error.code = 'LEAGUE_SEASON_LIFECYCLE_UNRESOLVED'
    throw attachWriteFlowReport({ error, stage: 'resolveLeagueSeasonStatus', results, flow: FLOW })
  }
  const resolvedSeason = {
    ...(payload.season || {}),
    seasonStatus,
  }
  const teamSeasonResult = await runStage({
    stage: 'clearTeamSeasonStats',
    results,
    action: () => clearTeamSeasonStats({
      ...payload,
      season: resolvedSeason,
    }),
  })
  if (!teamSeasonResult.updated) {
    const error = new Error('Team season stats clear target is missing')
    error.code = 'TEAM_SEASON_STATS_CLEAR_TARGET_MISSING'
    throw attachWriteFlowReport({ error, stage: 'clearTeamSeasonStats', results, flow: FLOW })
  }

  let players = Array.isArray(teamSeasonResult.players)
    ? teamSeasonResult.players
    : []
  const team = {
    ...(payload.team || {}),
    birthTeamDocumentId: teamSeasonResult.birthTeamDocumentId,
    teamDocumentId: teamSeasonResult.teamDocumentId,
    teamId: payload.team?.teamId || teamSeasonResult.teamDocumentId || teamSeasonResult.birthTeamDocumentId || '',
    birthTeamId: payload.team?.birthTeamId || teamSeasonResult.birthTeamDocumentId || teamSeasonResult.teamDocumentId || '',
  }
  const teamWithLoadStatus = {
    ...team,
    ...buildTeamLoadStatus(players),
  }
  const season = {
    ...resolvedSeason,
    seasonId: teamSeasonResult.seasonId,
    seasonKey: teamSeasonResult.seasonKey,
  }
  const scoutProfilesSummary = { total: 0, profileCounts: {} }

  const playerDocumentsResult = await runProjectionStage({
    stage: 'clearExistingPlayerSeasonProfilesMany',
    results,
    action: () => clearExistingPlayerSeasonProfilesMany({
      season,
      team: teamWithLoadStatus,
      target: teamSeasonResult.target,
      players,
    }),
  })
  const deletedPlayerDocumentIds = playerDocumentsResult.deletedPlayerDocumentIds || []
  if (deletedPlayerDocumentIds.length) {
    const teamRelationResult = await runProjectionStage({
      stage: 'clearTeamSeasonPlayerDocumentIds',
      results,
      action: () => clearTeamSeasonPlayerDocumentIds({
        ...payload,
        season,
        team: teamWithLoadStatus,
        playerDocumentIds: deletedPlayerDocumentIds,
      }),
    })
    players = Array.isArray(teamRelationResult.players)
      ? teamRelationResult.players
      : players
  }
  const finalTeamWithLoadStatus = {
    ...team,
    ...buildTeamLoadStatus(players),
  }
  const playerSearchIndexesResult = await runProjectionStage({
    stage: 'upsertPlayerSeasonSearchIndexMany',
    results,
    action: () => upsertPlayerSeasonSearchIndexMany({
      ...payload,
      season,
      team: finalTeamWithLoadStatus,
      target: teamSeasonResult.target,
      players,
      clearPlayerDocumentIds: deletedPlayerDocumentIds,
    }),
  })
  const leagueTeamMetaResult = await runProjectionStage({
    stage: 'updateLeagueSeasonTableRankTeamSyncMeta',
    results,
    action: () => updateLeagueSeasonTableRankTeamSyncMeta({
      ...payload,
      season,
      team: finalTeamWithLoadStatus,
      scoutProfilesSummary,
      teamTaskSignals: teamSeasonResult.teamBalance?.teamTaskSignals,
    }),
  })
  const teamSearchIndexResult = await runProjectionStage({
    stage: 'updateTeamSeasonSearchIndexRosterMeta',
    results,
    action: () => updateTeamSeasonSearchIndexRosterMeta({
      ...payload,
      season,
      team: finalTeamWithLoadStatus,
      target: teamSeasonResult.target,
      teamSeasonDocumentId: teamSeasonResult.teamSeasonDocumentId,
      playersCount: players.length,
      playerSeasonIndexCount: players.length,
      scoutProfilesSummary,
      teamBalance: teamSeasonResult.teamBalance,
      resetStatsDerived: true,
    }),
  })


  await runProjectionStage({
    stage: 'clubProjection',
    results,
    action: async () => ensureRequiredClubProjectionCompleted(await syncClubProjectionFromTeamSeason({
      league: payload.league || {},
      season,
      team: finalTeamWithLoadStatus,
      teamSeason: {
        ...(teamSeasonResult.seasonDocument || {}),
        teamPlayers: players,
        playersCount: players.length,
        scoutProfilesSummary,
      },
      canonicalCommitted: true,
      lastWriteAction: 'CLEAR_TEAM_SEASON_STATS',
    })),
  })

  return {
    ...results,
    completed: true,
    teamCanonicalCommitted: true,
    projectionsCompleted: true,
    recoveryRequired: false,
    syncStatus: 'complete',
    clearedPlayersCount: players.length,
  }
}
