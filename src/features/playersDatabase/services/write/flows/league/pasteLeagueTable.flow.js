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
import { updateLeagueTeamPlayersScoutContextMany } from '../../teams/index.js'
import { resolveTeamLookupKey } from '../../../../model/teamIdentity.model.js'
import {
  assertWriteResultClean,
  attachWriteFlowReport,
} from '../writeFlowReport.js'

const buildRowsWithScoutSummaries = ({ rows = [], contextResults = [] } = {}) => {
  const summaryByTeam = new Map(
    (Array.isArray(contextResults) ? contextResults : [])
      .filter(result => result?.updated)
      .map(result => [
        resolveTeamLookupKey(result.teamContext || {}),
        result.scoutProfilesSummary || {
          total: 0,
          profileCounts: {},
        },
      ])
      .filter(([teamId]) => teamId)
  )

  return (Array.isArray(rows) ? rows : []).map(row => {
    const summary = summaryByTeam.get(resolveTeamLookupKey(row))

    return summary
      ? {
          ...row,
          scoutProfilesSummary: summary,
        }
      : row
  })
}

const buildScoutSummaryRows = contextResults => (
  (Array.isArray(contextResults) ? contextResults : [])
    .filter(result => result?.updated)
    .map(result => ({
      team: result.teamContext || {},
      scoutProfilesSummary: result.scoutProfilesSummary || {
        total: 0,
        profileCounts: {},
      },
    }))
)

const syncPlayerDocumentsFromContext = async ({ payload = {}, contextResults = [] } = {}) => {
  const updatedResults = (Array.isArray(contextResults) ? contextResults : [])
    .filter(result => result?.updated)
  const allPlayers = updatedResults.flatMap(result => (
    Array.isArray(result.players) ? result.players : []
  ))
  const unknownPlayerDocuments = allPlayers.filter(player => (
    !hasPlayerScoutProfiles(player) &&
    !player.playerDocumentId
  ))
  const existingPlayerDocumentIds = await resolveExistingPlayerDocumentIds(unknownPlayerDocuments)
  const results = []
  const failures = []

  for (const contextResult of updatedResults) {
    const players = (Array.isArray(contextResult.players) ? contextResult.players : [])
      .filter(player => (
        hasPlayerScoutProfiles(player) ||
        Boolean(player.playerDocumentId) ||
        existingPlayerDocumentIds.has(buildPlayerDocumentId(player))
      ))
      .map(player => {
        if (player.playerDocumentId) return player

        const playerDocumentId = buildPlayerDocumentId(player)
        if (!existingPlayerDocumentIds.has(playerDocumentId)) return player

        return {
          ...player,
          playerDocumentId,
        }
      })

    try {
      const result = await syncPlayerScoutProfileDocsMany({
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
        players,
        teamDocument: contextResult.teamDocument || null,
      })

      results.push({
        teamDocumentId: contextResult.teamDocumentId,
        ...result,
      })
      failures.push(...(Array.isArray(result.failures) ? result.failures : []))
    } catch (error) {
      failures.push({
        teamDocumentId: contextResult.teamDocumentId,
        message: error?.message || 'Player document context sync failed',
      })
    }
  }

  return {
    rowsCount: results.reduce((total, result) => total + Number(result.rowsCount || 0), 0),
    createdCount: results.reduce((total, result) => total + Number(result.createdCount || 0), 0),
    clearedCount: results.reduce((total, result) => total + Number(result.clearedCount || 0), 0),
    skippedCount: results.reduce((total, result) => total + Number(result.skippedCount || 0), 0),
    failedCount: failures.length,
    failures,
    results,
  }
}

const syncPlayerIndexesFromContext = async ({ payload = {}, contextResults = [] } = {}) => {
  const results = []
  const failures = []

  for (const contextResult of Array.isArray(contextResults) ? contextResults : []) {
    if (!contextResult?.updated) continue

    try {
      const result = await updatePlayerSeasonSearchIndexScoutContextMany({
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
      })

      results.push({
        teamDocumentId: contextResult.teamDocumentId,
        ...result,
      })
    } catch (error) {
      failures.push({
        teamDocumentId: contextResult.teamDocumentId,
        message: error?.message || 'Player search-index context sync failed',
      })
    }
  }

  return {
    rowsCount: results.reduce((total, result) => total + Number(result.rowsCount || 0), 0),
    updatedCount: results.reduce((total, result) => total + Number(result.updatedCount || 0), 0),
    missingCount: results.reduce((total, result) => total + Number(result.missingCount || 0), 0),
    failedCount: failures.length,
    failures,
    results,
  }
}


const buildPlayerScoutContextReport = result => ({
  rowsCount: Number(result?.rowsCount) || 0,
  skippedCount: Number(result?.skippedCount) || 0,
  failedCount: Number(result?.failedCount) || 0,
  failures: Array.isArray(result?.failures) ? result.failures : [],
  teams: (Array.isArray(result?.results) ? result.results : []).map(teamResult => ({
    teamDocumentId: teamResult.teamDocumentId || '',
    seasonId: teamResult.seasonId || '',
    seasonKey: teamResult.seasonKey || '',
    target: teamResult.target || '',
    updated: teamResult.updated === true,
    skipped: teamResult.skipped === true,
    reason: teamResult.reason || '',
    playersCount: Number(teamResult.playersCount) || 0,
    scoutProfilesSummary: teamResult.scoutProfilesSummary || {
      total: 0,
      profileCounts: {},
    },
  })),
})

export async function pasteLeagueTableFlow(payload = {}) {
  const results = {}
  let stage = 'leagueDocument'

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

    stage = 'playerScoutContext'
    const playerScoutContextResult = await updateLeagueTeamPlayersScoutContextMany({
      league: payload.league || {},
      season: payload.season || {},
      target: payload.target || 'current',
      rows: payload.rows || [],
    })
    results.playerScoutContext = buildPlayerScoutContextReport(playerScoutContextResult)
    assertWriteResultClean({
      result: results.playerScoutContext,
      stage,
    })

    stage = 'playerDocuments'
    results.playerDocuments = await syncPlayerDocumentsFromContext({
      payload,
      contextResults: playerScoutContextResult.results,
    })
    assertWriteResultClean({
      result: results.playerDocuments,
      stage,
    })

    stage = 'playerIndexes'
    results.playerIndexes = await syncPlayerIndexesFromContext({
      payload,
      contextResults: playerScoutContextResult.results,
    })
    assertWriteResultClean({
      result: results.playerIndexes,
      stage,
    })

    stage = 'leagueScoutSummaries'
    results.leagueScoutSummaries = await updateLeagueSeasonTableRankScoutProfilesSummaries({
      league: payload.league || {},
      season: payload.season || {},
      target: payload.target || 'current',
      summaries: buildScoutSummaryRows(playerScoutContextResult.results),
    })

    const rowsWithScoutSummaries = buildRowsWithScoutSummaries({
      rows: payload.rows,
      contextResults: playerScoutContextResult.results,
    })

    stage = 'teamIndexes'
    results.teamIndexes = await upsertTeamSeasonSearchIndexMany({
      ...payload,
      rows: rowsWithScoutSummaries,
    })
    assertWriteResultClean({
      result: results.teamIndexes,
      stage,
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
      leagueResult: results.leagueTable,
      searchIndexResult: results.teamIndexes,
      results,
    }
  } catch (error) {
    throw attachWriteFlowReport({
      error,
      stage,
      results,
      flow: 'pasteLeagueTable',
    })
  }
}
