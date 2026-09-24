// src/features/playersDatabase/services/write/flows/team/pasteTeamPlayerStats.flow.js

import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { SCOUTING_SHADOW_ENGINE_VERSION } from '../../../../../../shared/scouting/scouting.version.js'
import {
  commitTeamStatsCanonical,
} from '../../teams/index.js'
import {
  activateTeamStatsProjectionJob,
  failTeamStatsProjectionJobFromClient,
} from '../../teamStatsProjectionJobs/index.js'
import { getTeamSeason } from '../../../read/entities/teamSeason.js'
import { buildPlayerScoutShadowAudit } from '../../../../domain/orchestration/buildPlayerScoutShadowAudit.js'



const buildCommittedProjectionFailure = ({
  stage,
  cause,
  results = {},
  teamSeasonPlayers = [],
} = {}) => buildWriteFlowSyncError({
  name: 'PlayerStatsProjectionSyncError',
  fallbackMessage: 'Player stats were saved, but projection synchronization failed',
  stage,
  cause,
  // The canonical Team Season has already committed.  This must be an error,
  // not a successful result: callers need a repair/retry path and must never
  // display a false "load completed" confirmation.
  results: {
    ...results,
    rowsCount: Array.isArray(teamSeasonPlayers) ? teamSeasonPlayers.length : 0,
    calculatedPlayersCount: Array.isArray(teamSeasonPlayers) ? teamSeasonPlayers.length : 0,
    syncedPlayersCount: Number.isFinite(
      Number(results.playerScoutProfileDocsResult?.rowsCount)
    )
      ? Number(results.playerScoutProfileDocsResult.rowsCount)
      : null,
    teamCanonicalCommitted: true,
    projectionsCompleted: false,
    completed: false,
    syncStatus: 'projection_failed',
    recoveryRequired: true,
    stoppedAt: stage,
    projectionError: String(cause?.message || `Projection sync failed at ${stage}`).trim(),
  },
})

const buildDeferredPlayerDocumentSyncResult = approvedPlan => {
  const entries = Array.isArray(approvedPlan?.entries) ? approvedPlan.entries : []
  const activeEntries = entries.filter(entry => entry?.approvedPlan?.skipped !== true)

  return {
    owner: 'functions',
    deferred: true,
    rowsCount: activeEntries.length,
    createdCount: entries.filter(entry => entry?.approvedPlan?.action === 'create').length,
    updatedCount: entries.filter(entry => entry?.approvedPlan?.action === 'update').length,
    unchangedCount: entries.filter(entry => entry?.approvedPlan?.action === 'retain').length,
    skippedCount: Number(approvedPlan?.skippedUntrackedCount || 0) +
      entries.filter(entry => entry?.approvedPlan?.action === 'skip').length,
    failedCount: 0,
    failures: [],
    scoutedPlayers: Array.isArray(approvedPlan?.scoutedPlayers)
      ? approvedPlan.scoutedPlayers
      : [],
  }
}


const resolvePlayerProjectionKey = player => String(
  player?.playerId ||
  player?.externalPlayerId ||
  player?.identityKey ||
  player?.playerDocumentId ||
  player?.fullName ||
  ''
).trim()

const mergeScoutedPlayerProjections = ({ players = [], scoutedPlayers = [] } = {}) => {
  const scoutedLookup = new Map(
    (Array.isArray(scoutedPlayers) ? scoutedPlayers : [])
      .map(player => [resolvePlayerProjectionKey(player), player])
      .filter(([key]) => key)
  )

  return (Array.isArray(players) ? players : []).map(player => {
    const key = resolvePlayerProjectionKey(player)
    const scoutedPlayer = key ? scoutedLookup.get(key) : null

    return scoutedPlayer ? { ...player, ...scoutedPlayer } : player
  })
}

const assertTeamSeasonUpdated = result => {
  if (!result?.teamDocumentId || !result?.seasonId) {
    throw new Error('Team season stats were not updated')
  }
}

const assertCurrentStatsProjectionRevision = async ({
  teamId = '',
  seasonKey = '',
  sourceRevision = '',
} = {}) => {
  const current = await getTeamSeason({
    birthTeamDocumentId: teamId,
    seasonKey,
    bypassCache: true,
  })
  if (String(current?.statsProjectionRevision || '') === String(sourceRevision || '')) return

  const error = new Error('Stats projection was superseded by a newer load')
  error.code = 'STATS_PROJECTION_SUPERSEDED'
  error.superseded = true
  throw error
}

export async function pasteTeamPlayerStatsFlow(payload = {}) {
  const results = {}
  const approvedStatsPlan = payload.approvedStatsPlan

  if (approvedStatsPlan?.planType !== 'approvedStatsPlan') {
    const error = new Error('Missing approved stats plan')
    error.code = 'APPROVED_STATS_PLAN_REQUIRED'
    throw error
  }

  const canonicalPlan = approvedStatsPlan.canonical || {}
  const canonicalCommit = canonicalPlan.canonicalCommit || {}
  const statsProjectionRevision = String(approvedStatsPlan.statsProjectionRevision || '').trim()
  const season = canonicalPlan.season || payload.season || {}
  const resolvedPlayers = Array.isArray(canonicalCommit.players)
    ? canonicalCommit.players
    : []
  const resolvedPayload = {
    ...payload,
    league: canonicalPlan.league || payload.league || {},
    season,
    target: canonicalCommit.target || payload.target,
    team: canonicalPlan.team || payload.team || {},
    players: resolvedPlayers,
  }
  const teamPerformance = approvedStatsPlan.teamPerformance || null
  const teamPoints = approvedStatsPlan.teamPoints

  if (!statsProjectionRevision) {
    const error = new Error('Missing stats projection revision in approved plan')
    error.code = 'APPROVED_STATS_PLAN_REVISION_REQUIRED'
    throw error
  }

  results.approvedStatsPlan = approvedStatsPlan
  results.approvedStatsCanonicalPlan = approvedStatsPlan.canonical
  results.approvedPlayerScoutPlan = approvedStatsPlan.playerScout
  results.approvedTeamScoutProjectionPlan = approvedStatsPlan.teamScout

  try {
    results.teamSeasonResult = await commitTeamStatsCanonical({
      approvedPlan: approvedStatsPlan.canonical,
      projectionManifest: approvedStatsPlan.projectionManifest,
      writeActionId: payload.writeActionId,
    })
    assertTeamSeasonUpdated(results.teamSeasonResult)
  } catch (error) {
    throw buildWriteFlowSyncError({
      name: 'PlayerStatsSyncError',
      fallbackMessage: 'Player stats sync failed',
      stage: 'updateTeamSeasonPlayerStats',
      cause: error,
      results,
    })
  }

  try {
    const projectionGuard = () => assertCurrentStatsProjectionRevision({
    teamId: results.teamSeasonResult.birthTeamDocumentId,
    seasonKey: results.teamSeasonResult.seasonKey,
    sourceRevision: statsProjectionRevision,
  })

  results.projectionJob = results.teamSeasonResult.projectionJob
  results.counterpartReconciliation = {
    owner: 'functions',
    deferred: true,
    movementOperationsCount: Array.isArray(
      results.approvedStatsPlan.projectionManifest?.operations?.counterpartMovement
    )
      ? results.approvedStatsPlan.projectionManifest.operations.counterpartMovement.length
      : 0,
    clubProjectionOperationsCount: Array.isArray(
      results.approvedStatsPlan.projectionManifest?.operations?.counterpartClubProjection
    )
      ? results.approvedStatsPlan.projectionManifest.operations.counterpartClubProjection.length
      : 0,
    clubsMasterOperationsCount: Array.isArray(
      results.approvedStatsPlan.projectionManifest?.operations?.counterpartClubsMaster
    )
      ? results.approvedStatsPlan.projectionManifest.operations.counterpartClubsMaster.length
      : 0,
  }

  const team = {
    ...(results.teamSeasonResult.canonicalTeamContext || payload.team || {}),
    birthTeamDocumentId: results.teamSeasonResult.birthTeamDocumentId,
    teamDocumentId: results.teamSeasonResult.teamDocumentId,
  }

  const teamSeasonPlayers = Array.isArray(results.teamSeasonResult.players)
    ? results.teamSeasonResult.players
    : []
  const syncedPlayers = teamSeasonPlayers
  const teamWithLoadStatus = {
    ...team,
    ...(results.approvedStatsPlan.teamLoadStatus || {}),
  }
  const syncedPayload = {
    ...resolvedPayload,
    team: teamWithLoadStatus,
    players: syncedPlayers,
    // Player hydration still owns its own migration in Patch 3.  The Team
    // writer now returns the direct season source rather than a synthetic
    // legacy multi-season Root container.
    teamSeasonDocument: results.teamSeasonResult.seasonDocument || null,
  }
  await projectionGuard()
  results.playerScoutProfileDocsResult = buildDeferredPlayerDocumentSyncResult(
    results.approvedPlayerScoutPlan
  )

  results.teamScoutProjectionResult = {
    owner: 'functions',
    deferred: true,
    changed: results.approvedTeamScoutProjectionPlan?.changed === true,
    players: Array.isArray(results.approvedTeamScoutProjectionPlan?.players)
      ? results.approvedTeamScoutProjectionPlan.players
      : teamSeasonPlayers,
  }

  const finalTeamSeasonPlayers = Array.isArray(
    results.approvedTeamScoutProjectionPlan?.players
  )
    ? results.approvedTeamScoutProjectionPlan.players
    : teamSeasonPlayers
  const scoutProfilesSummary = results.approvedStatsPlan.scoutProfilesSummary

  const searchIndexPlayers = mergeScoutedPlayerProjections({
    players: finalTeamSeasonPlayers,
    scoutedPlayers: results.playerScoutProfileDocsResult.scoutedPlayers,
  })
  const canonicalSearchIndexTeam = teamWithLoadStatus
  const searchIndexPayload = {
    ...syncedPayload,
    team: canonicalSearchIndexTeam,
    players: searchIndexPlayers,
  }

  const approvedPlayerSeasonIndexPlan = results.approvedStatsPlan.playerSeasonIndexes || {}
  const playerSeasonIndexOperations = Array.isArray(approvedPlayerSeasonIndexPlan.operations)
    ? approvedPlayerSeasonIndexPlan.operations
    : []
  results.playerSeasonIndexResult = {
    owner: 'functions',
    deferred: true,
    rowsCount: playerSeasonIndexOperations.filter(operation => operation?.changed === true).length,
    createdCount: playerSeasonIndexOperations.filter(operation => (
      operation?.action === 'set' && operation?.created === true && operation?.changed === true
    )).length,
    updatedCount: playerSeasonIndexOperations.filter(operation => (
      operation?.action === 'set' && operation?.created !== true && operation?.changed === true
    )).length,
    deletedCount: playerSeasonIndexOperations.filter(operation => operation?.action === 'delete').length,
    unchangedCount: playerSeasonIndexOperations.filter(operation => (
      operation?.action === 'set' && operation?.changed !== true
    )).length,
    failedCount: Array.isArray(approvedPlayerSeasonIndexPlan.failures)
      ? approvedPlayerSeasonIndexPlan.failures.length
      : 0,
    failures: Array.isArray(approvedPlayerSeasonIndexPlan.failures)
      ? approvedPlayerSeasonIndexPlan.failures
      : [],
    duplicates: Array.isArray(approvedPlayerSeasonIndexPlan.duplicates)
      ? approvedPlayerSeasonIndexPlan.duplicates
      : [],
    snapshotRows: Array.isArray(approvedPlayerSeasonIndexPlan.snapshotRows)
      ? approvedPlayerSeasonIndexPlan.snapshotRows
      : [],
  }

  if (results.playerSeasonIndexResult.failedCount) {
    throw buildCommittedProjectionFailure({
      stage: 'playerSeasonIndexPartialFailure',
      cause: new Error(
        `${results.playerSeasonIndexResult.failedCount} player SearchIndex rows failed to plan`
      ),
      results,
      teamSeasonPlayers,
    })
  }

  const approvedLeagueMetadataPlan = results.approvedStatsPlan.leagueMetadata || {}
  const leagueMetadataOperations = Array.isArray(approvedLeagueMetadataPlan.operations)
    ? approvedLeagueMetadataPlan.operations
    : []
  const leaguesMasterOperations = Array.isArray(approvedLeagueMetadataPlan.leaguesMasterOperations)
    ? approvedLeagueMetadataPlan.leaguesMasterOperations
    : []
  const leagueMetadataFailures = Array.isArray(approvedLeagueMetadataPlan.failures)
    ? approvedLeagueMetadataPlan.failures
    : []

  results.leagueTableRankTeamMetaResult = {
    owner: 'functions',
    deferred: true,
    operationsCount: leagueMetadataOperations.length,
    leaguesMasterOperationsCount: leaguesMasterOperations.length,
    failedCount: leagueMetadataFailures.length,
    failures: leagueMetadataFailures,
  }
  results.leagueTableRankLoadStatusResult = results.leagueTableRankTeamMetaResult
  results.leagueTableRankScoutProfilesResult = results.leagueTableRankTeamMetaResult

  if (leagueMetadataFailures.length) {
    throw buildCommittedProjectionFailure({
      stage: 'updateLeagueSeasonTableRankTeamMeta',
      cause: new Error(leagueMetadataFailures[0]?.reason || 'League metadata projection planning failed'),
      results,
      teamSeasonPlayers,
    })
  }

  results.teamSeasonIndexScoutProfilesResult = {
    updated: true,
    owner: 'functions',
    deferred: true,
    operationsCount: approvedStatsPlan.teamSeasonIndex?.operation ? 1 : 0,
  }


  results.clubProjectionResult = {
    updated: true,
    owner: 'functions',
    deferred: true,
    operationsCount: Array.isArray(approvedStatsPlan.mainClubProjection?.operations)
      ? approvedStatsPlan.mainClubProjection.operations.length
      : 0,
    clubsMasterOperationsCount: Array.isArray(
      approvedStatsPlan.mainClubProjection?.clubsMasterOperations
    )
      ? approvedStatsPlan.mainClubProjection.clubsMasterOperations.length
      : 0,
  }


  try {
    results.playerScoutShadowResult = buildPlayerScoutShadowAudit({
      players: syncedPlayers,
      league: payload.league || {},
      team: teamWithLoadStatus,
      season: payload.season || {},
      snapshotRows: results.playerSeasonIndexResult?.snapshotRows || [],
    })
  } catch (error) {
    results.playerScoutShadowResult = {
      engineVersion: SCOUTING_SHADOW_ENGINE_VERSION,
      mode: 'shadow',
      status: 'failed',
      error: error?.message || 'Shadow scout calculation failed',
    }
  }

  try {
    results.projectionJobActivation = await activateTeamStatsProjectionJob({
      jobId: results.projectionJob?.id,
      sourceRevision: statsProjectionRevision,
    })
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'activateTeamStatsProjectionJob',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  return {
    ...results,
    rowsCount: results.playerSeasonIndexResult.rowsCount,
    calculatedPlayersCount: teamSeasonPlayers.length,
    syncedPlayersCount: Number(
      results.playerScoutProfileDocsResult?.rowsCount || 0
    ),
    teamCanonicalCommitted: true,
    projectionsCompleted: false,
    completed: false,
    backgroundSyncPending: true,
    syncStatus: 'background_sync_pending',
    shadowStatus: results.playerScoutShadowResult?.status || 'complete',
  }
  } catch (error) {
    const failedStage = String(
      error?.stage ||
      error?.results?.stoppedAt ||
      error?.cause?.stage ||
      'clientProjection'
    ).trim()

    try {
      results.projectionJobFailure = await failTeamStatsProjectionJobFromClient({
        jobId: results.projectionJob?.id,
        sourceRevision: statsProjectionRevision,
        failedStage,
        error,
      })
    } catch (jobFailureError) {
      results.projectionJobFailure = {
        applied: false,
        reason: 'jobFailureUpdateFailed',
        error: String(jobFailureError?.message || 'Failed to mark stats projection job as failed'),
      }
    }

    throw error
  }
}