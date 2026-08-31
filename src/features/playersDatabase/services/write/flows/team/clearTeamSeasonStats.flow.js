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
  clearTeamSeasonPlayerDocumentIds,
  clearTeamSeasonStats,
} from '../../teams/index.js'
import { attachWriteFlowReport } from '../writeFlowReport.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'
import { resolveLeagueSeasonStatus } from '../../shared/teamPerformanceProjection.js'

const FLOW = 'clearTeamSeasonStats'

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

  const playerDocumentsResult = await runStage({
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
    const teamRelationResult = await runStage({
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
  const playerSearchIndexesResult = await runStage({
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
  const leagueTeamMetaResult = await runStage({
    stage: 'updateLeagueSeasonTableRankTeamSyncMeta',
    results,
    action: () => updateLeagueSeasonTableRankTeamSyncMeta({
      ...payload,
      season,
      team: finalTeamWithLoadStatus,
      scoutProfilesSummary,
    }),
  })
  const teamSearchIndexResult = await runStage({
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

  return {
    ...results,
    completed: true,
    syncStatus: 'complete',
    clearedPlayersCount: players.length,
  }
}
