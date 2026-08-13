// src/features/playersDatabase/services/audit/playerScout.repair.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildPlayerScoutRepairCost } from './playerScout.cost.js'
import { syncPlayerScoutProfileDocsMany } from '../write/players/index.js'
import { updatePlayerSeasonSearchIndexStatsMany } from '../write/searchIndex/index.js'
import {
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  SCOUTING_PLAYER_TRACKING_REASONS,
} from '../write/players/scoutingPlayerLifecycle.model.js'
import {
  normalizeScoutingPlayerVerification,
} from '../write/players/scoutingPlayerVerification.model.js'

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

const profileRepairIssueTypes = new Set([
  'birth_team_mismatch',
  'birth_team_reliability_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
  'missing_player_document',
  'missing_search_index',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'history_season_status_invalid',
])

const schemaRepairIssueType = 'player_schema_outdated'


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

const repairIdentityKeys = row => playerKeys(row).map(playerKey => [
  teamDocumentIdOf(row),
  seasonKeyOf(row),
  playerKey,
].join('::'))

const buildAffectedRows = audit => {
  const issueKeys = new Set()

  audit.issues
    .filter(issue => profileRepairIssueTypes.has(issue.type))
    .forEach(issue => {
      repairIdentityKeys(issue).forEach(key => issueKeys.add(key))
    })

  return audit.recalculatedRows
    .filter(row => repairIdentityKeys(row).some(key => issueKeys.has(key)))
    .map(row => ({
      ...row,
      sourceTarget: resolveScopeTarget({
        row,
        audit,
      }),
    }))
}

const buildSchemaIssues = audit => (Array.isArray(audit?.issues)
  ? audit.issues.filter(issue => issue.type === schemaRepairIssueType)
  : []
)

const hasStoredProfiles = data => {
  const rootProfiles = Array.isArray(data?.scoutProfiles)
    ? data.scoutProfiles
    : Array.isArray(data?.scoutSignals)
      ? data.scoutSignals
      : []
  if (rootProfiles.length) return true

  return ['current', 'history'].some(target => (
    (Array.isArray(data?.[target]) ? data[target] : []).some(season => (
      (Array.isArray(season?.scoutProfiles) && season.scoutProfiles.length) ||
      (Array.isArray(season?.scoutSignals) && season.scoutSignals.length)
    ))
  ))
}

const buildCompatibleRootTracking = data => {
  const current = normalizeScoutingPlayerTracking(data?.tracking)
  const reasons = [
    ...current.trackingReasons,
  ]

  if (data?.favorite === true || current.favorite) {
    reasons.push(SCOUTING_PLAYER_TRACKING_REASONS.FAVORITE)
  }
  if (data?.watchlist === true || current.watchlist) {
    reasons.push(SCOUTING_PLAYER_TRACKING_REASONS.WATCHLIST)
  }
  if (hasStoredProfiles(data)) {
    reasons.push(SCOUTING_PLAYER_TRACKING_REASONS.PROFILE)
  }

  return {
    ...current,
    favorite: data?.favorite === true || current.favorite,
    watchlist: data?.watchlist === true || current.watchlist,
    trackingReasons: [...new Set(reasons)],
  }
}

const seasonTeamIds = season => unique([
  season?.birthTeamDocumentId,
  season?.teamDocumentId,
  season?.sourceDocumentId,
  season?.birthTeamId,
  season?.teamId,
])

const issueTeamIds = ({ issue, row }) => unique([
  issue?.birthTeamDocumentId,
  issue?.teamDocumentId,
  issue?.birthTeamId,
  issue?.teamId,
  row?.birthTeamDocumentId,
  row?.teamDocumentId,
  row?.birthTeamId,
  row?.teamId,
])

const findSchemaSeasonIndex = ({ seasons, issue, row }) => {
  const sameSeasonIndexes = seasons
    .map((season, index) => ({ season, index }))
    .filter(({ season }) => sameSeason({
      season,
      seasonKey: seasonKeyOf(issue),
    }))

  if (sameSeasonIndexes.length === 1) {
    return sameSeasonIndexes[0].index
  }
  if (!sameSeasonIndexes.length) return -1

  const expectedTeamIds = issueTeamIds({ issue, row })
  const expectedClubId = clean(issue?.clubId || row?.clubId)
  const matched = sameSeasonIndexes.filter(({ season }) => {
    const actualTeamIds = seasonTeamIds(season)
    const teamMatches = expectedTeamIds.length && actualTeamIds.some(
      value => expectedTeamIds.includes(value)
    )
    const clubMatches = (
      expectedClubId && clean(season?.clubId) === expectedClubId
    )

    return teamMatches || clubMatches
  })

  return matched.length === 1 ? matched[0].index : -1
}

const findAuditRowForIssue = ({ audit, issue }) => (
  (Array.isArray(audit?.recalculatedRows) ? audit.recalculatedRows : [])
    .find(row => (
      clean(row.teamDocumentId) === clean(issue.teamDocumentId) &&
      seasonKeyOf(row) === seasonKeyOf(issue) &&
      playerKeys(row).some(key => playerKeys(issue).includes(key))
    )) || null
)

const pickPresent = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null) return value
  }

  return null
}

const isPlainObject = value => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype
)

const stripUndefined = value => {
  if (Array.isArray(value)) {
    return value
      .filter(item => item !== undefined)
      .map(stripUndefined)
  }

  if (!isPlainObject(value)) return value

  return Object.entries(value).reduce((result, [key, item]) => {
    if (item === undefined) return result

    result[key] = stripUndefined(item)
    return result
  }, {})
}

const buildSchemaSeasonPatch = ({ season, row, missingFields }) => {
  const fields = new Set(Array.isArray(missingFields) ? missingFields : [])
  const teamContext = row?.teamContext || {}
  const next = { ...season }

  if (fields.has('season.clubLevel')) {
    next.clubLevel = pickPresent(
      teamContext.clubLevel,
      season.clubLevel
    )
  }
  if (fields.has('season.clubStrengthLevel')) {
    next.clubStrengthLevel = pickPresent(
      teamContext.clubStrengthLevel,
      teamContext.clubLevel,
      season.clubStrengthLevel,
      season.clubLevel
    )
  }
  if (fields.has('season.leagueLevel')) {
    next.leagueLevel = pickPresent(
      teamContext.leagueLevel,
      season.leagueLevel
    )
  }

  return next
}

const repairPlayerSchemaDocument = async ({ audit, issues }) => {
  const playerDocumentId = clean(issues[0]?.playerDocumentId)
  if (!playerDocumentId) {
    throw new Error('Player schema repair requires playerDocumentId')
  }

  const ref = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.players,
    playerDocumentId
  )

  return trackedRunTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) {
      throw new Error(`Player document not found: ${playerDocumentId}`)
    }

    const data = snapshot.data() || {}
    const patch = {}
    const rootIssue = issues.find(issue => clean(issue.schemaScope) === 'root')

    if (rootIssue) {
      patch.favorite = data.favorite === true || data.tracking?.favorite === true
      patch.tracking = buildCompatibleRootTracking(data)
      patch.verification = normalizeScoutingPlayerVerification(data.verification)
      patch.events = normalizeScoutingPlayerEvents(data.events)
    }

    ;['current', 'history'].forEach(target => {
      const targetIssues = issues.filter(issue => {
        if (clean(issue.schemaScope) !== 'season') return false
        const row = findAuditRowForIssue({ audit, issue })
        return (clean(row?.sourceTarget) || 'current') === target
      })
      if (!targetIssues.length) return

      const seasons = Array.isArray(data[target]) ? [...data[target]] : []

      targetIssues.forEach(issue => {
        const row = findAuditRowForIssue({ audit, issue })
        const seasonIndex = findSchemaSeasonIndex({
          seasons,
          issue,
          row,
        })
        if (seasonIndex === -1) return

        seasons[seasonIndex] = buildSchemaSeasonPatch({
          season: seasons[seasonIndex],
          row,
          missingFields: issue.missingFields,
        })
      })

      patch[target] = seasons
    })

    if (!Object.keys(patch).length) {
      return { playerDocumentId, updated: false }
    }

    patch.updatedAt = serverTimestamp()
    transaction.set(ref, patch, { merge: true })

    return { playerDocumentId, updated: true }
  }, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    action: 'playerSchemaRepair',
    operationSubtype: 'maintenance-transaction',
  })
}

const repairPlayerSchemaIssues = async ({ audit, issues }) => {
  const byPlayerDocumentId = new Map()

  issues.forEach(issue => {
    const playerDocumentId = clean(issue.playerDocumentId)
    if (!playerDocumentId) return

    const current = byPlayerDocumentId.get(playerDocumentId) || []
    byPlayerDocumentId.set(playerDocumentId, [...current, issue])
  })

  const results = []

  for (const playerIssues of byPlayerDocumentId.values()) {
    results.push(await repairPlayerSchemaDocument({
      audit,
      issues: playerIssues,
    }))
  }

  return results
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
        issue.type === 'missing_search_index' ||
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
    schemaIssues: audit.summary.schemaIssuesCount || 0,
    profileDiffRows: audit.summary.rowsWithProfileDiff,
    reliabilityIssues: audit.summary.reliabilityIssuesCount,
  }
}

export async function buildPlayerScoutRepairPreview({ audit: sourceAudit } = {}) {
  if (!sourceAudit) {
    throw new Error('Player scout repair preview requires a source audit')
  }

  const audit = sourceAudit
  const affectedRows = buildAffectedRows(audit)
  if (affectedRows.length && audit.repairDataIncluded !== true) {
    throw new Error(
      'Player scout repair requires an audit created with includeRepairData: true'
    )
  }

  const schemaIssues = buildSchemaIssues(audit)

  return {
    generatedAt: new Date().toISOString(),
    mode: 'preview',
    sourceOfTruth: PLAYERS_DATABASE_COLLECTIONS.teams,
    summary: buildPreviewSummary({
      audit,
      affectedRows,
    }),
    cost: buildPlayerScoutRepairCost({
      audit,
      affectedRows,
      schemaIssues,
    }),
    affectedScopes: unique(
      affectedRows.map(scopeKeyOf)
    ),
  }
}

const buildProfiledPlayer = ({ player, row }) => {
  if (!Array.isArray(row.expectedScoutProfiles)) {
    throw new Error(
      'Player scout repair requires audit repair data for profile updates'
    )
  }

  const scoutProfiles = stripUndefined(row.expectedScoutProfiles)
  const scoutCombinations = stripUndefined(
    Array.isArray(row.expectedScoutCombinations)
      ? row.expectedScoutCombinations
      : []
  )

  return {
    ...player,
    scoutSignals: scoutProfiles,
    scoutProfiles,
    scoutCombinations,
  }
}

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
        const affectedPlayers = seasons[seasonIndex].teamPlayers.filter(
          player => scopeRows.some(row => samePlayer({ player, row }))
        )

        if (affectedPlayers.length) {
          repairedScopes.push({
            target,
            season: seasons[seasonIndex],
            players: affectedPlayers,
          })
        }
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
    teamDocument: team,
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

  if (!sourceAudit) {
    throw new Error('Player scout repair requires a source audit')
  }

  const audit = sourceAudit
  const affectedRows = buildAffectedRows(audit)
  const schemaIssues = buildSchemaIssues(audit)

  if (affectedRows.length && audit.repairDataIncluded !== true) {
    throw new Error(
      'Player scout repair requires an audit created with includeRepairData: true'
    )
  }
  const teamDocumentIds = unique(
    affectedRows.map(teamDocumentIdOf)
  )
  const results = []
  const schemaResults = await repairPlayerSchemaIssues({
    audit,
    issues: schemaIssues,
  })

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
    playerSchemaDocumentsUpdated: schemaResults.filter(
      result => result.updated
    ).length,
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
