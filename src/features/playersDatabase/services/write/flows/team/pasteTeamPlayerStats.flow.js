// src/features/playersDatabase/services/write/flows/team/pasteTeamPlayerStats.flow.js

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
  updateTeamSeasonPlayersScoutProjections,
  updateTeamSeasonPlayerStats,
} from '../../teams/index.js'
import { buildScoutProfilesSummary } from '../shared.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'
import { buildPlayerScoutShadowAudit } from '../../../../domain/orchestration/buildPlayerScoutShadowAudit.js'
import {
  buildLeagueTeamPerformanceProjection,
  resolveLeagueSeasonStatus,
} from '../../shared/teamPerformanceProjection.js'
import { validatePlayerStatsAgainstLeague } from '../../../../domain/validation/playerStatsLeague.validation.js'

const buildSyncError = ({ stage, cause, results = {} }) => {
  const error = new Error(cause?.message || `Player stats sync failed at ${stage}`)

  error.name = 'PlayerStatsSyncError'
  error.stage = stage
  error.cause = cause
  error.results = results

  return error
}


const buildCommittedProjectionFailure = ({
  stage,
  cause,
  results = {},
  teamSeasonPlayers = [],
} = {}) => ({
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
  completed: true,
  syncStatus: 'projection_failed',
  stoppedAt: stage,
  projectionError: String(cause?.message || `Projection sync failed at ${stage}`).trim(),
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

    return !['provided', 'matched'].includes(status) && !(status === 'created' && approvedNew)
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

export async function pasteTeamPlayerStatsFlow(payload = {}) {
  const results = {}
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
  const resolvedPlayers = await resolvePlayerIdentities({
    players: payload.players,
    season,
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
    throw buildSyncError({
      stage: 'validatePlayerStatsAgainstLeague',
      cause: new Error(validation.issues.map(issue => issue.message).join(' ')),
      results: { validation },
    })
  }

  try {
    results.teamSeasonResult = await updateTeamSeasonPlayerStats({
      ...resolvedPayload,
      team: payload.team || {},
      teamPerformance,
    })
    assertTeamSeasonUpdated(results.teamSeasonResult)
  } catch (error) {
    throw buildSyncError({
      stage: 'updateTeamSeasonPlayerStats',
      cause: error,
      results,
    })
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
    results.playerScoutProfileDocsResult = await syncPlayerScoutProfileDocsMany(syncedPayload)
  } catch (error) {
    return buildCommittedProjectionFailure({
      stage: 'syncPlayerScoutProfileDocsMany',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  if (results.playerScoutProfileDocsResult.failedCount) {
    return buildCommittedProjectionFailure({
      stage: 'playerScoutProfileDocsPartialFailure',
      cause: new Error(
        `${results.playerScoutProfileDocsResult.failedCount} player documents failed to sync`
      ),
      results,
      teamSeasonPlayers,
    })
  }

  try {
    results.teamScoutProjectionResult = await updateTeamSeasonPlayersScoutProjections({
      season: resolvedPayload.season || {},
      team,
      scoutedPlayers: results.playerScoutProfileDocsResult.scoutedPlayers,
    })
    if (!results.teamScoutProjectionResult?.updated) {
      return buildCommittedProjectionFailure({
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
    return buildCommittedProjectionFailure({
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
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexStatsMany(searchIndexPayload)
  } catch (error) {
    return buildCommittedProjectionFailure({
      stage: 'updatePlayerSeasonSearchIndexStatsMany',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  if (results.playerSeasonIndexResult?.failedCount) {
    return buildCommittedProjectionFailure({
      stage: 'playerSeasonIndexPartialFailure',
      cause: new Error(
        `${results.playerSeasonIndexResult.failedCount} player SearchIndex rows failed to sync`
      ),
      results,
      teamSeasonPlayers,
    })
  }

  try {
    results.leagueTableRankTeamMetaResult = await updateLeagueSeasonTableRankTeamSyncMeta({
      ...payload,
      team: teamWithLoadStatus,
      scoutProfilesSummary,
    })
    results.leagueTableRankLoadStatusResult = results.leagueTableRankTeamMetaResult
    results.leagueTableRankScoutProfilesResult = results.leagueTableRankTeamMetaResult

    if (!results.leagueTableRankTeamMetaResult?.updated) {
      return buildCommittedProjectionFailure({
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
    return buildCommittedProjectionFailure({
      stage: 'updateLeagueSeasonTableRankTeamMeta',
      cause: error,
      results,
      teamSeasonPlayers,
    })
  }

  try {
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
      return buildCommittedProjectionFailure({
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
    return buildCommittedProjectionFailure({
      stage: 'updateTeamSeasonSearchIndexScoutProfilesSummary',
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
      engineVersion: 'scouting-v2-shadow',
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
    projectionsCompleted: true,
    completed: true,
    syncStatus: 'complete',
    shadowStatus: results.playerScoutShadowResult?.status || 'complete',
  }
}
