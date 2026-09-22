// src/features/playersDatabase/services/write/flows/team/pasteTeamPlayerStats.flow.js

import { buildWriteFlowSyncError } from '../writeFlowSyncError.js'
import { SCOUTING_SHADOW_ENGINE_VERSION } from '../../../../../../shared/scouting/scouting.version.js'
import {
  updateLeagueSeasonTableRankTeamSyncMeta,
} from '../../leagues/index.js'
import { syncPlayerScoutProfileDocsMany } from '../../players/index.js'
import {
  resolvePlayerIdentities,
  updatePlayerSeasonSearchIndexStatsMany,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  ensureRequiredClubProjectionCompleted,
  syncClubProjectionFromTeamSeason,
} from '../../clubs/index.js'
import {
  reconcileTeamSeasonMovementCounterpartsWithClubRefresh,
  updateTeamSeasonPlayersScoutProjections,
  commitTeamStatsCanonical,
} from '../../teams/index.js'
import { buildScoutProfilesSummary } from '../shared.js'
import {
  createTeamStatsProjectionRevision,
} from '../../teamStatsProjectionJobs/index.js'
import { readTeamSeasonRosterHistory } from '../../../read/entities/teamSeasonRosterHistory.js'
import { getTeamSeason } from '../../../read/entities/teamSeason.js'
import { resolveTeamLookupKey } from '../../../../model/team/teamIdentity.model.js'
import {
  ROSTER_IMPORT_MODE,
  mergeLocalAndResolvedPlayers,
  reconcileRosterMovement,
  resolveRosterPlayersLocally,
} from '../../../../domain/movement/index.js'
import { buildTeamLoadStatus } from '../../../../model/team/teamLoadStatus.model.js'
import { resolveInternalPlayerId } from '../../../../model/player/playerIdentity.model.js'
import { buildPlayerScoutShadowAudit } from '../../../../domain/orchestration/buildPlayerScoutShadowAudit.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
  resolveLeagueTeamPoints,
} from '../../../../domain/projections/teamPerformance.projection.js'
import { validatePlayerStatsAgainstLeague } from '../../../../domain/validation/playerStatsLeague.validation.js'



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

const assertStatsIdentityDecisions = players => {
  const unresolved = (Array.isArray(players) ? players : []).filter(player => {
    const status = String(player?.identityMatchStatus || '').trim()
    const approvedNew = String(player?.identityResolution || '').trim() === 'createNew'
    const hasCanonicalPlayerId = Boolean(resolveInternalPlayerId(player))

    return !hasCanonicalPlayerId &&
      !['provided', 'matched'].includes(status) &&
      !(status === 'created' && approvedNew)
  })

  if (!unresolved.length) return

  const error = new Error('כל שחקן שאינו מזוהה חייב התאמת מערכת או אישור מפורש ליצירת שחקן חדש')
  error.code = 'STATS_PLAYER_IDENTITY_DECISION_REQUIRED'
  error.players = unresolved.map(player => player.originalFullName || player.fullName || '')
  throw error
}

const deriveSeasonTarget = season => (
  String(season?.seasonStatus || '').trim() === 'completed'
    ? 'history'
    : 'current'
)

const resolveLeagueSeasonLifecycleOrThrow = ({ league, season } = {}) => {
  const seasonStatus = resolveLeagueSeasonStatus({ league, season })

  if (seasonStatus === 'active' || seasonStatus === 'completed') {
    return seasonStatus
  }

  const error = new Error('League season lifecycle could not be resolved')
  error.code = 'LEAGUE_SEASON_LIFECYCLE_UNRESOLVED'
  throw error
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
  const statsProjectionRevision = createTeamStatsProjectionRevision()
  const leagueSeasonStatus = resolveLeagueSeasonLifecycleOrThrow({
    league: payload.league,
    season: payload.season,
  })
  const season = {
    ...(payload.season || {}),
    seasonStatus: leagueSeasonStatus,
  }
  const derivedTarget = deriveSeasonTarget(season)
  const teamPerformance = buildLeagueTeamPerformanceProjection({
    league: payload.league,
    season,
    target: derivedTarget,
    team: payload.team,
  })
  const teamPoints = resolveLeagueTeamPoints({
    league: payload.league,
    season,
    target: derivedTarget,
    team: payload.team,
  })
  const rawPlayers = Array.isArray(payload.players) ? payload.players : []
  const birthTeamDocumentId = resolveTeamLookupKey(payload.team || {})
  const rosterHistory = await readTeamSeasonRosterHistory({
    birthTeamDocumentId,
    seasonKey: season.seasonKey || season.seasonId,
  })
  const currentKnownPlayers = [
    ...(Array.isArray(rosterHistory.currentSeason?.teamPlayers)
      ? rosterHistory.currentSeason.teamPlayers
      : []),
    ...(Array.isArray(rosterHistory.currentSeason?.pendingPlayers)
      ? rosterHistory.currentSeason.pendingPlayers
      : []),
  ]
  const previousPlayers = Array.isArray(rosterHistory.previousSeason?.teamPlayers)
    ? rosterHistory.previousSeason.teamPlayers
    : []
  const localResolution = resolveRosterPlayersLocally({
    players: rawPlayers,
    currentPlayers: currentKnownPlayers,
    previousPlayers,
  })
  const unresolvedPlayers = localResolution.unresolved.map(entry => entry.player)
  const broadResolvedPlayers = unresolvedPlayers.length
    ? await resolvePlayerIdentities({
        players: unresolvedPlayers,
        season,
      })
    : []
  const resolvedPlayers = mergeLocalAndResolvedPlayers({
    totalCount: rawPlayers.length,
    localResolved: localResolution.resolved,
    broadResolved: broadResolvedPlayers,
    unresolved: localResolution.unresolved,
  })
  const resolvedPayload = {
    ...payload,
    season,
    target: derivedTarget,
    players: resolvedPlayers,
  }
  assertStatsIdentityDecisions(resolvedPlayers)
  const validation = validatePlayerStatsAgainstLeague({
    players: resolvedPlayers,
    teamPerformance,
    ageGroupId: payload.season?.ageGroupId || payload.team?.ageGroupId,
  })

  if (!validation.valid) {
    throw buildWriteFlowSyncError({
      name: 'PlayerStatsSyncError',
      fallbackMessage: 'Player stats sync failed',
      stage: 'validatePlayerStatsAgainstLeague',
      cause: new Error(validation.issues.map(issue => issue.message).join(' ')),
      results: { validation },
    })
  }

  try {
    results.teamSeasonResult = await commitTeamStatsCanonical({
      ...resolvedPayload,
      team: payload.team || {},
      teamPerformance,
      teamPoints,
      statsProjectionRevision,
      writeActionId: payload.writeActionId,
      league: resolvedPayload.league || payload.league || {},
      reconcileMovement: ({ currentSeason, previousSeason }) => reconcileRosterMovement({
        seasonKey: season.seasonKey || season.seasonId,
        team: {
          ...(payload.team || {}),
          birthTeamDocumentId,
        },
        incomingPlayers: resolvedPlayers,
        currentSeason,
        previousSeason,
        rosterImport: {
          mode: ROSTER_IMPORT_MODE.PATCH,
          sourceSnapshotKey: currentSeason?.rosterImport?.sourceSnapshotKey ||
            `stats__${season.seasonKey || season.seasonId}`,
          contentHash: currentSeason?.rosterImport?.contentHash || '',
          effectiveAt: currentSeason?.rosterImport?.effectiveAt || null,
        },
      }),
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

  const projectionGuard = () => assertCurrentStatsProjectionRevision({
    teamId: results.teamSeasonResult.birthTeamDocumentId,
    seasonKey: results.teamSeasonResult.seasonKey,
    sourceRevision: statsProjectionRevision,
  })

  results.projectionJob = results.teamSeasonResult.projectionJob
  await projectionGuard()
  results.counterpartReconciliation = await reconcileTeamSeasonMovementCounterpartsWithClubRefresh({
    requests: results.teamSeasonResult.movementState?.counterpartRequests,
  })

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
    ...buildTeamLoadStatus(syncedPlayers),
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
  try {
    await projectionGuard()
    results.playerScoutProfileDocsResult = await syncPlayerScoutProfileDocsMany({
      ...syncedPayload,
      beforeEach: projectionGuard,
    })
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'syncPlayerScoutProfileDocsMany',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  if (results.playerScoutProfileDocsResult.failedCount) {
    throw buildCommittedProjectionFailure({
      stage: 'playerScoutProfileDocsPartialFailure',
      cause: new Error(
        `${results.playerScoutProfileDocsResult.failedCount} player documents failed to sync`
      ),
      results,
      teamSeasonPlayers,
    })
  }

  try {
    await projectionGuard()
    results.teamScoutProjectionResult = await updateTeamSeasonPlayersScoutProjections({
      season: resolvedPayload.season || {},
      team,
      scoutedPlayers: results.playerScoutProfileDocsResult.scoutedPlayers,
    })
    if (!results.teamScoutProjectionResult?.updated) {
      throw buildCommittedProjectionFailure({
        stage: 'updateTeamSeasonPlayersScoutProjections',
        cause: new Error(
          results.teamScoutProjectionResult?.reason ||
          'Team scout projection target is missing'
        ),
        results,
        teamSeasonPlayers,
      })
    }
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'updateTeamSeasonPlayersScoutProjections',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  const finalTeamSeasonPlayers = Array.isArray(
    results.teamScoutProjectionResult?.players
  )
    ? results.teamScoutProjectionResult.players
    : teamSeasonPlayers
  const scoutProfilesSummary = results.teamScoutProjectionResult?.scoutProfilesSummary ||
    buildScoutProfilesSummary(finalTeamSeasonPlayers)

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

  try {
    await projectionGuard()
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexStatsMany(searchIndexPayload)
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'updatePlayerSeasonSearchIndexStatsMany',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  if (results.playerSeasonIndexResult?.failedCount) {
    throw buildCommittedProjectionFailure({
      stage: 'playerSeasonIndexPartialFailure',
      cause: new Error(
        `${results.playerSeasonIndexResult.failedCount} player SearchIndex rows failed to sync`
      ),
      results,
      teamSeasonPlayers,
    })
  }

  try {
    await projectionGuard()
    results.leagueTableRankTeamMetaResult = await updateLeagueSeasonTableRankTeamSyncMeta({
      ...payload,
      team: teamWithLoadStatus,
      scoutProfilesSummary,
      teamTaskSignals: results.teamSeasonResult?.teamBalance?.teamTaskSignals,
    })
    results.leagueTableRankLoadStatusResult = results.leagueTableRankTeamMetaResult
    results.leagueTableRankScoutProfilesResult = results.leagueTableRankTeamMetaResult

    if (!results.leagueTableRankTeamMetaResult?.updated) {
      throw buildCommittedProjectionFailure({
        stage: 'updateLeagueSeasonTableRankTeamMeta',
        cause: new Error(
          results.leagueTableRankTeamMetaResult?.reason ||
          'League team metadata projection target is missing'
        ),
        results,
        teamSeasonPlayers,
      })
    }
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'updateLeagueSeasonTableRankTeamMeta',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  try {
    await projectionGuard()
    results.teamSeasonIndexScoutProfilesResult = await updateTeamSeasonSearchIndexScoutProfilesSummary({
      ...payload,
      team,
      teamSeasonDocumentId: results.teamSeasonResult.teamSeasonDocumentId,
      playersCount: results.teamSeasonResult.playersCount,
      scoutProfilesSummary,
      teamBalance: results.teamSeasonResult.teamBalance,
      teamPerformance,
    })
    if (!results.teamSeasonIndexScoutProfilesResult?.updated) {
      throw buildCommittedProjectionFailure({
        stage: 'updateTeamSeasonSearchIndexScoutProfilesSummary',
        cause: new Error(
          results.teamSeasonIndexScoutProfilesResult?.reason ||
          'Team season SearchIndex is missing'
        ),
        results,
        teamSeasonPlayers,
      })
    }
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'updateTeamSeasonSearchIndexScoutProfilesSummary',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }


  try {
    await projectionGuard()
    results.clubProjectionResult = ensureRequiredClubProjectionCompleted(await syncClubProjectionFromTeamSeason({
      league: resolvedPayload.league || payload.league || {},
      season: resolvedPayload.season || {},
      team: teamWithLoadStatus,
      teamSeason: results.teamSeasonResult?.seasonDocument || {},
      performance: teamPerformance,
      points: teamPoints,
      // The League row was refreshed immediately above from this exact
      // summary. Pass it into the Club projection as well, rather than
      // waiting for a future League-table reload to refresh Clubs Master.
      leagueScoutProfilesSummary: scoutProfilesSummary,
      canonicalCommitted: true,
      lastWriteAction: 'PASTE_TEAM_PLAYER_STATS',
    }))
  } catch (error) {
    throw buildCommittedProjectionFailure({
      stage: 'clubProjection',
      cause: error,
      results,
      teamSeasonPlayers,
    })
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
}