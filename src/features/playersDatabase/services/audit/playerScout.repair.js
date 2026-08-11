// src/features/playersDatabase/services/audit/playerScout.repair.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { syncPlayerScoutProfileDocsMany } from '../write/players/index.js'
import { updatePlayerSeasonSearchIndexStatsMany } from '../write/searchIndex/index.js'
import { buildPlayerScoutRulesAudit } from './playerScoutRules.audit.js'

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const seasonKeyOf = row => clean(row.seasonKey || row.seasonId)
const teamDocumentIdOf = row => clean(row.teamDocumentId)

const playerKeys = row => unique([
  row.playerId,
  row.playerDocumentId,
  row.externalPlayerId,
])

const samePlayer = ({ player, row }) => {
  const expected = playerKeys(row)
  const actual = unique([
    player?.playerId,
    player?.playerDocumentId,
    player?.externalPlayerId,
  ])

  return actual.some(value => expected.includes(value))
}

const sameSeason = ({ season, seasonKey }) => (
  clean(season?.seasonKey || season?.seasonId) === clean(seasonKey)
)

const repairableIssueTypes = new Set([
  'birth_team_mismatch',
  'birth_team_reliability_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
  'missing_player_document',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'history_season_status_invalid',
])

const scopeKeyOf = row => [
  teamDocumentIdOf(row),
  seasonKeyOf(row),
  clean(row.sourceTarget),
].join('::')

const resolveScopeTarget = ({ row, audit }) => {
  if (clean(row.sourceTarget)) return clean(row.sourceTarget)

  const isHistoryIssue = audit.issues.some(issue => (
    issue.type === 'history_season_status_invalid' &&
    clean(issue.teamDocumentId) === teamDocumentIdOf(row) &&
    clean(issue.seasonKey || issue.seasonId) === seasonKeyOf(row)
  ))

  return isHistoryIssue ? 'history' : 'current'
}

const buildAffectedRows = audit => {
  const issueKeys = new Set(
    audit.issues
      .filter(issue => repairableIssueTypes.has(issue.type))
      .map(issue => [
        clean(issue.teamDocumentId),
        clean(issue.seasonKey || issue.seasonId),
      ].join('::'))
  )

  return audit.recalculatedRows
    .filter(row => issueKeys.has([
      teamDocumentIdOf(row),
      seasonKeyOf(row),
    ].join('::')))
    .map(row => ({
      ...row,
      sourceTarget: resolveScopeTarget({
        row,
        audit,
      }),
    }))
}

const buildPreviewSummary = ({ audit, affectedRows }) => {
  const teamDocumentIds = unique(
    affectedRows.map(teamDocumentIdOf)
  )
  const scopes = unique(
    affectedRows.map(scopeKeyOf)
  )
  const missingPlayerDocumentIds = unique(
    audit.issues
      .filter(issue => issue.type === 'missing_player_document')
      .map(issue => issue.playerDocumentId)
  )
  const existingPlayerDocumentIds = unique(
    audit.issues
      .filter(issue => (
        issue.type === 'player_document_mismatch' ||
        issue.type === 'player_document_reliability_mismatch'
      ))
      .map(issue => issue.playerDocumentId)
  )
  const searchDocumentKeys = unique(
    audit.issues
      .filter(issue => (
        issue.type === 'search_index_mismatch' ||
        issue.type === 'search_index_reliability_mismatch'
      ))
      .map(issue => [
        clean(issue.playerId || issue.playerDocumentId),
        clean(issue.seasonKey || issue.seasonId),
        clean(issue.teamDocumentId),
      ].join('::'))
  )

  return {
    affectedTeamDocuments: teamDocumentIds.length,
    affectedTeamSeasonScopes: scopes.length,
    playerDocsMissingBeforeRepair: missingPlayerDocumentIds.length,
    playerDocsExistingWithDiff: existingPlayerDocumentIds.length,
    searchIndexDocumentsWithDiff: searchDocumentKeys.length,
    historyStatusIssues: audit.summary.historyStatusIssuesCount,
    profileDiffRows: audit.summary.rowsWithProfileDiff,
    reliabilityIssues: audit.summary.reliabilityIssuesCount,
  }
}

export async function buildPlayerScoutRepairPreview({ audit: sourceAudit } = {}) {
  const audit = sourceAudit || await buildPlayerScoutRulesAudit({
    includeRepairData: true,
  })
  const affectedRows = buildAffectedRows(audit)

  return {
    generatedAt: new Date().toISOString(),
    mode: 'preview',
    sourceOfTruth: PLAYERS_DATABASE_COLLECTIONS.teams,
    summary: buildPreviewSummary({
      audit,
      affectedRows,
    }),
    affectedScopes: unique(
      affectedRows.map(scopeKeyOf)
    ),
  }
}

const buildProfiledPlayer = ({ player, row }) => ({
  ...player,
  scoutSignals: Array.isArray(row.expectedScoutProfiles)
    ? row.expectedScoutProfiles
    : [],
  scoutProfiles: Array.isArray(row.expectedScoutProfiles)
    ? row.expectedScoutProfiles
    : [],
  scoutCombinations: Array.isArray(row.expectedScoutCombinations)
    ? row.expectedScoutCombinations
    : [],
})

const repairSeason = ({ season, rows, target }) => {
  const nextPlayers = (Array.isArray(season.teamPlayers)
    ? season.teamPlayers
    : []
  ).map(player => {
    const row = rows.find(candidate => samePlayer({
      player,
      row: candidate,
    }))

    return row
      ? buildProfiledPlayer({
          player,
          row,
        })
      : player
  })

  return {
    ...season,
    seasonStatus: target === 'history'
      ? 'completed'
      : clean(season.seasonStatus) || 'active',
    teamPlayers: nextPlayers,
    updatedAt: new Date().toISOString(),
  }
}

const repairTeamDocument = async ({ teamDocumentId, rows }) => {
  const ref = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teams,
    teamDocumentId
  )

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      throw new Error(`Team document not found: ${teamDocumentId}`)
    }

    const data = snapshot.data() || {}
    const current = Array.isArray(data.current) ? [...data.current] : []
    const history = Array.isArray(data.history) ? [...data.history] : []
    const repairedScopes = []

    ;['current', 'history'].forEach(target => {
      const targetRows = rows.filter(row => row.sourceTarget === target)
      const seasonKeys = unique(targetRows.map(seasonKeyOf))
      const seasons = target === 'history' ? history : current

      seasonKeys.forEach(seasonKey => {
        const seasonIndex = seasons.findIndex(season => sameSeason({
          season,
          seasonKey,
        }))
        if (seasonIndex === -1) return

        const scopeRows = targetRows.filter(row => (
          seasonKeyOf(row) === seasonKey
        ))
        seasons[seasonIndex] = repairSeason({
          season: seasons[seasonIndex],
          rows: scopeRows,
          target,
        })
        repairedScopes.push({
          target,
          season: seasons[seasonIndex],
          players: seasons[seasonIndex].teamPlayers,
        })
      })
    })

    transaction.set(
      ref,
      {
        current,
        history,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    )

    return {
      team: {
        ...data,
        birthTeamDocumentId: teamDocumentId,
        teamDocumentId,
      },
      repairedScopes,
    }
  }, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.teams,
    action: 'playerScoutRepair-updateTeam',
    operationSubtype: 'maintenance-transaction',
  })
}

const syncScope = async ({ team, scope }) => {
  const season = scope.season
  const target = scope.target
  const players = scope.players
  const payload = {
    season,
    team,
    target,
    players,
    scoutSyncMode: 'replace',
  }
  const playerDocs = await syncPlayerScoutProfileDocsMany(payload)
  const searchIndex = await updatePlayerSeasonSearchIndexStatsMany(payload)

  if (playerDocs.failedCount) {
    throw new Error(
      `${playerDocs.failedCount} player scout documents failed to sync`
    )
  }
  if (searchIndex.failedCount) {
    throw new Error(
      `${searchIndex.failedCount} player search indexes failed to sync`
    )
  }

  return {
    teamDocumentId: clean(team.teamDocumentId),
    seasonKey: clean(season.seasonKey || season.seasonId),
    target,
    playersCount: players.length,
    playerDocs,
    searchIndex,
  }
}

export async function applyPlayerScoutRepair({
  confirmed = false,
  audit: sourceAudit,
} = {}) {
  if (!confirmed) {
    throw new Error('Player scout repair requires explicit confirmation')
  }

  const audit = sourceAudit || await buildPlayerScoutRulesAudit({
    includeRepairData: true,
  })
  const affectedRows = buildAffectedRows(audit)
  const teamDocumentIds = unique(
    affectedRows.map(teamDocumentIdOf)
  )
  const results = []

  for (const teamDocumentId of teamDocumentIds) {
    const rows = affectedRows.filter(row => (
      teamDocumentIdOf(row) === teamDocumentId
    ))
    const repaired = await repairTeamDocument({
      teamDocumentId,
      rows,
    })

    for (const scope of repaired.repairedScopes) {
      results.push(await syncScope({
        team: repaired.team,
        scope,
      }))
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: 'apply',
    teamDocumentsUpdated: teamDocumentIds.length,
    teamSeasonScopesSynced: results.length,
    playerDocumentsCreated: results.reduce((sum, result) => (
      sum + Number(result.playerDocs.createdCount || 0)
    ), 0),
    playerDocumentsUpdated: results.reduce((sum, result) => (
      sum + Number(result.playerDocs.rowsCount || 0) -
      Number(result.playerDocs.createdCount || 0)
    ), 0),
    searchIndexRowsCreated: results.reduce((sum, result) => (
      sum + Number(result.searchIndex.createdCount || 0)
    ), 0),
    searchIndexRowsUpdated: results.reduce((sum, result) => (
      sum + Number(result.searchIndex.updatedCount || 0)
    ), 0),
    searchIndexRowsDeleted: results.reduce((sum, result) => (
      sum + Number(result.searchIndex.deletedCount || 0)
    ), 0),
    results,
  }
}
