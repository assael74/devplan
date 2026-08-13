// src/features/playersDatabase/services/write/flows/team/pasteTeamPlayerStats.flow.js

import {
  updateLeagueSeasonTableRankScoutProfilesSummary,
  updateLeagueSeasonTableRankTeamUrl,
} from '../../leagues/index.js'
import { syncPlayerScoutProfileDocsMany } from '../../players/index.js'
import {
  resolvePlayerIdentities,
  updatePlayerSeasonSearchIndexStatsMany,
  updateTeamSeasonSearchIndexScoutProfilesSummary,
} from '../../searchIndex/index.js'
import {
  ensureTeamDoc,
  updateTeamSeasonPlayerStats,
} from '../../teams/index.js'
import {
  buildScoutProfilesSummary,
  buildStatsPlayersWithScoutSignals,
  resolveScoutSyncMode,
} from '../shared.js'
import { buildPlayerMatchValues } from '../../../../model/playerIdentity.model.js'
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
  const scoutSyncMode = resolveScoutSyncMode({
    season: payload.season || {},
  })
  const calculatedPlayers = buildStatsPlayersWithScoutSignals({
    players: resolvedPlayers,
    team: payload.team || {},
    season: payload.season || {},
  })
  const resolvedPayload = {
    ...payload,
    players: calculatedPlayers,
    scoutSyncMode,
  }

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
      ...resolvedPayload,
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
    results.playerSeasonIndexResult = await updatePlayerSeasonSearchIndexStatsMany(syncedPayload)
  } catch (error) {
    throw buildSyncError({
      stage: 'updatePlayerSeasonSearchIndexStatsMany',
      cause: error,
      results,
    })
  }

  try {
    results.playerScoutProfileDocsResult = await syncPlayerScoutProfileDocsMany(syncedPayload)
  } catch (error) {
    throw buildSyncError({
      stage: 'syncPlayerScoutProfileDocsMany',
      cause: error,
      results,
    })
  }

  try {
    results.leagueTableRankLoadStatusResult = await updateLeagueSeasonTableRankTeamUrl({
      ...payload,
      team: teamWithLoadStatus,
    })
  } catch (error) {
    throw buildSyncError({
      stage: 'updateLeagueSeasonTableRankLoadStatus',
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
    calculatedPlayersCount: calculatedPlayers.length,
    syncedPlayersCount: syncedPlayers.length,
    scoutSyncMode,
    syncStatus: 'complete',
    shadowStatus: results.playerScoutShadowResult?.status || 'complete',
  }
}
