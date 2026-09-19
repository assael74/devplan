// src/features/playersDatabase/services/write/flows/league/pasteLeagueTable.flow.js

import {
  ensureLeagueDoc,
  syncLeaguesMasterDocument,
  updateLeagueSeasonTableRank,
  updateLeagueSeasonTableRankScoutProfilesSummaries,
} from '../../leagues/index.js'
import {
  buildPlayerDocumentId,
  hasPlayerScoutProfiles,
  resolveExistingPlayerDocumentIds,
  syncPlayerScoutProfileDocsMany,
} from '../../players/index.js'
import {
  updatePlayerSeasonSearchIndexScoutContextMany,
  upsertTeamSeasonSearchIndexMany,
} from '../../searchIndex/index.js'
import {
  syncLeagueClubSeasonIdentityIndex,
  syncClubProjectionsFromLeagueTable,
  syncClubsMasterDocument,
} from '../../clubs/index.js'
import { buildLeagueRowsWithScoutPerformance } from '../../shared/leagueTeamScoutContext.js'
import { updateLeagueTeamPlayersScoutContextMany } from '../../teams/index.js'
import { resolveTeamLookupKey } from '../../../../model/team/teamIdentity.model.js'
import {
  assertWriteResultClean,
  attachWriteFlowReport,
} from '../writeFlowReport.js'

const isNotStartedSeason = season => (
  String(season?.seasonStatus || '').trim() === 'not_started'
)

const buildSkippedWriteResult = reason => ({
  updated: true,
  changed: false,
  writeSkipped: true,
  skipped: true,
  reason,
  rowsCount: 0,
  failedCount: 0,
  failures: [],
})

const buildScoutSummaryRows = contextResults => (
  (Array.isArray(contextResults) ? contextResults : [])
    .filter(result => result?.updated && !result?.skipped)
    .map(result => ({
      team: result.teamContext || {},
      scoutProfilesSummary: result.scoutProfilesSummary || {
        total: 0,
        profileCounts: {},
      },
    }))
)

const withScoutSummaries = ({ rows = [], contextResults = [] } = {}) => {
  const summariesByTeam = new Map(buildScoutSummaryRows(contextResults).map(summary => [
    resolveTeamLookupKey(summary.team),
    summary.scoutProfilesSummary,
  ]))

  return (Array.isArray(rows) ? rows : []).map(row => (
    summariesByTeam.has(resolveTeamLookupKey(row))
      ? { ...row, scoutProfilesSummary: summariesByTeam.get(resolveTeamLookupKey(row)) }
      : row
  ))
}

const syncPlayerDocumentsFromContext = async ({ payload = {}, contextResults = [] } = {}) => {
  const updatedResults = (Array.isArray(contextResults) ? contextResults : [])
    .filter(result => result?.updated && !result?.skipped)
  const players = updatedResults.flatMap(result => Array.isArray(result.players) ? result.players : [])
  const existingPlayerDocumentIds = await resolveExistingPlayerDocumentIds(
    players.filter(player => !hasPlayerScoutProfiles(player) && !player.playerDocumentId)
  )
  const results = []
  const failures = []

  for (const contextResult of updatedResults) {
    const contextPlayers = (Array.isArray(contextResult.players) ? contextResult.players : [])
      .filter(player => (
        hasPlayerScoutProfiles(player) ||
        Boolean(player.playerDocumentId) ||
        existingPlayerDocumentIds.has(buildPlayerDocumentId(player))
      ))
      .map(player => {
        if (player.playerDocumentId) return player
        const playerDocumentId = buildPlayerDocumentId(player)
        return existingPlayerDocumentIds.has(playerDocumentId)
          ? { ...player, playerDocumentId }
          : player
      })
    try {
      results.push(await syncPlayerScoutProfileDocsMany({
        season: {
          ...(payload.season || {}),
          seasonId: contextResult.seasonId,
          seasonKey: contextResult.seasonKey,
          seasonStatus: contextResult.teamContext?.seasonStatus,
          leagueLevel: contextResult.teamContext?.leagueLevel,
          leagueTotalRound: contextResult.teamContext?.leagueTotalRound,
        },
        team: contextResult.teamContext || {},
        target: contextResult.target || payload.target || 'current',
        players: contextPlayers,
      }))
    } catch (error) {
      failures.push({
        teamDocumentId: contextResult.teamDocumentId,
        message: error?.message || 'Player document context sync failed',
      })
    }
  }

  return {
    rowsCount: results.reduce((total, result) => total + Number(result.rowsCount || 0), 0),
    failedCount: failures.length,
    failures,
    results,
  }
}

const syncPlayerIndexesFromContext = async ({ payload = {}, contextResults = [] } = {}) => {
  const results = []
  const failures = []
  for (const contextResult of Array.isArray(contextResults) ? contextResults : []) {
    if (!contextResult?.updated || contextResult?.skipped) continue
    try {
      results.push(await updatePlayerSeasonSearchIndexScoutContextMany({
        league: payload.league || {},
        season: {
          ...(payload.season || {}),
          seasonId: contextResult.seasonId,
          seasonKey: contextResult.seasonKey,
          seasonStatus: contextResult.teamContext?.seasonStatus,
          leagueLevel: contextResult.teamContext?.leagueLevel,
          leagueTotalRound: contextResult.teamContext?.leagueTotalRound,
        },
        team: contextResult.teamContext || {},
        players: contextResult.players || [],
      }))
    } catch (error) {
      failures.push({
        teamDocumentId: contextResult.teamDocumentId,
        message: error?.message || 'Player search-index context sync failed',
      })
    }
  }
  return {
    rowsCount: results.reduce((total, result) => total + Number(result.rowsCount || 0), 0),
    failedCount: failures.length,
    failures,
    results,
  }
}

export async function pasteLeagueTableFlow(payload = {}) {
  const results = {}
  const notStartedSeason = isNotStartedSeason(payload.season)
  let stage = 'leagueDocument'
  let leagueCanonicalCommitted = false

  try {
    results.leagueDocument = await ensureLeagueDoc(
      payload.league || {},
      { syncMaster: false }
    )

    stage = 'leagueTable'
    results.leagueTable = await updateLeagueSeasonTableRank({
      ...payload,
      syncMaster: false,
    })
    leagueCanonicalCommitted = true

    const canonicalRows = results.leagueTable?.seasonDocument?.tableRank || []
    const canonicalSeason = results.leagueTable?.seasonDocument || payload.season || {}

    stage = 'clubSeasonIdentityIndex'
    results.clubSeasonIdentityIndex = await syncLeagueClubSeasonIdentityIndex({
      league: payload.league || {},
      season: canonicalSeason,
      rows: canonicalRows,
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
    })
    assertWriteResultClean({ result: results.clubSeasonIdentityIndex, stage })

    stage = 'teamSeasonProjections'
    results.teamSeasonProjections = await updateLeagueTeamPlayersScoutContextMany({
      league: payload.league || {},
      season: canonicalSeason,
      target: results.leagueTable?.target || payload.target || 'current',
      rows: canonicalRows,
    })
    assertWriteResultClean({
      result: results.teamSeasonProjections,
      stage,
    })

    stage = 'playerDocuments'
    results.playerDocuments = notStartedSeason
      ? buildSkippedWriteResult('seasonNotStarted')
      : await syncPlayerDocumentsFromContext({
        payload,
        contextResults: results.teamSeasonProjections.results,
      })
    assertWriteResultClean({ result: results.playerDocuments, stage })

    stage = 'playerIndexes'
    results.playerIndexes = notStartedSeason
      ? buildSkippedWriteResult('seasonNotStarted')
      : await syncPlayerIndexesFromContext({
        payload,
        contextResults: results.teamSeasonProjections.results,
      })
    assertWriteResultClean({ result: results.playerIndexes, stage })

    stage = 'leagueScoutSummaries'
    results.leagueScoutSummaries = notStartedSeason
      ? buildSkippedWriteResult('seasonNotStarted')
      : await updateLeagueSeasonTableRankScoutProfilesSummaries({
        league: payload.league || {},
        season: canonicalSeason,
        target: results.leagueTable?.target || payload.target || 'current',
        summaries: buildScoutSummaryRows(results.teamSeasonProjections.results),
      })

    const rowsWithScoutSummaries = withScoutSummaries({
      rows: canonicalRows,
      contextResults: results.teamSeasonProjections.results,
    })

    stage = 'teamIndexes'
    results.teamIndexes = await upsertTeamSeasonSearchIndexMany({
      ...payload,
      // The League table write resolves the canonical schedule. Index metrics
      // such as remainingTeamGames must use that committed season, not the
      // pre-import form values.
      season: canonicalSeason,
      rows: rowsWithScoutSummaries,
    })
    assertWriteResultClean({
      result: results.teamIndexes,
      stage,
    })

    stage = 'clubProjections'
    const clubProjectionRows = buildLeagueRowsWithScoutPerformance({
      league: payload.league || {},
      season: canonicalSeason,
      target: results.leagueTable?.target || payload.target || 'current',
      rows: rowsWithScoutSummaries,
    })
    results.clubProjections = await syncClubProjectionsFromLeagueTable({
      league: payload.league || {},
      season: payload.season || {},
      rows: clubProjectionRows,
      leagueSeasonDocument: results.leagueTable?.seasonDocument || {},
      teamSeasonsByKey: new Map(
        (results.teamSeasonProjections?.results || [])
          .filter(result => result?.seasonDocument && result?.teamDocumentId && result?.seasonKey)
          .flatMap(result => {
            const team = result.seasonDocument || {}
            const teamIds = [
              result.teamDocumentId,
              team.birthTeamDocumentId,
              team.birthTeamId,
              team.teamDocumentId,
              team.teamId,
            ].filter(Boolean)
            return teamIds.map(teamId => [`${teamId}::${result.seasonKey}`, team])
          })
      ),
      canonicalCommitted: true,
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
      syncMaster: false,
    })
    assertWriteResultClean({
      result: results.clubProjections,
      stage,
    })

    stage = 'clubsMaster'
    results.clubsMaster = await syncClubsMasterDocument({
      clubIds: (results.clubProjections?.results || []).map(result => result.clubId),
      lastWriteAction: 'PASTE_LEAGUE_TABLE',
    })

    stage = 'leaguesMaster'
    const masterSyncRequired = Boolean(
      results.leagueDocument?.changed ||
      results.leagueTable?.changed ||
      results.leagueScoutSummaries?.changed
    )

    results.leaguesMaster = masterSyncRequired
      ? await syncLeaguesMasterDocument({
          leagues: [payload.league || {}],
        })
      : {
          updated: true,
          changed: false,
          writeSkipped: true,
          masterSyncSkipped: true,
          reason: 'noMasterAffectingChanges',
        }

    return {
      status: 'complete',
      ...results.leagueTable,
      leagueCanonicalCommitted: true,
      projectionsCompleted: true,
      completed: true,
      recoveryRequired: false,
      leagueResult: results.leagueTable,
      searchIndexResult: results.teamIndexes,
      results,
    }
  } catch (error) {
    if (leagueCanonicalCommitted) {
      error.leagueCanonicalCommitted = true
      error.projectionsCompleted = false
      error.completed = false
      error.recoveryRequired = true
    }
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: 'pasteLeagueTable',
    })
  }
}
