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
  updateTeamSeasonPlayerStats,
} from '../../teams/index.js'
import { buildScoutProfilesSummary } from '../shared.js'
import { buildTeamLoadStatus } from '../../../../model/teamLoadStatus.model.js'
import { buildPlayerScoutShadowAudit } from '../../../../domain/orchestration/buildPlayerScoutShadowAudit.js'

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

export async function pasteTeamPlayerStatsFlow(payload = {}) {
  const results = {}
  const resolvedPlayers = await resolvePlayerIdentities({
    players: payload.players,
    season: payload.season || {},
  })
  const resolvedPayload = {
    ...payload,
    players: resolvedPlayers,
  }

  try {
    results.teamSeasonResult = await updateTeamSeasonPlayerStats({
      ...resolvedPayload,
      team: payload.team || {},
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
    ...(payload.team || {}),
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
    teamDocument: results.teamSeasonResult.teamDocument || null,
  }
  const scoutProfilesSummary = buildScoutProfilesSummary(teamSeasonPlayers)

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

  const searchIndexPlayers = mergeScoutedPlayerProjections({
    players: syncedPlayers,
    scoutedPlayers: results.playerScoutProfileDocsResult.scoutedPlayers,
  })
  const searchIndexPayload = {
    ...syncedPayload,
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
      playersCount: results.teamSeasonResult.playersCount,
      scoutProfilesSummary,
      teamBalance: results.teamSeasonResult.teamBalance,
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
