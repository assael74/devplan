// src/features/playersDatabase/services/audit/playerScout.repair.js

import {
  doc,
  serverTimestamp,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { trackedRunTransaction } from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildPlayerScoutRepairCost } from './playerScout.cost.js'
import {
  buildPlayerScoutRepairSelection,
} from './playerScoutRepair.selection.js'
import {
  canDirectRepairSearchIndexIssue,
  repairSearchIndexIssuesDirect,
} from './playerScoutSearchIndex.directRepair.js'
import {
  buildPlayerScoutMigrationPlan,
} from './playerScoutRepair.migrationPlan.js'
import {
  verifySelectedPlayerScoutRepair,
} from './playerScoutRepair.verification.js'
import { syncPlayerScoutProfileDocsMany } from '../write/players/index.js'
import { updatePlayerSeasonSearchIndexStatsMany } from '../write/searchIndex/index.js'
import {
  normalizeScoutingPlayerEvents,
  normalizeScoutingPlayerTracking,
  resolvePlayerTrackingReasons,
} from '../write/players/scoutingPlayerLifecycle.model.js'
import {
  normalizeScoutingPlayerVerification,
} from '../write/players/scoutingPlayerVerification.model.js'
import { buildPlayerScoutStatsLoadMeasurementHistory } from '../../model/playerScoutMeasurement.model.js'
import { buildPlayerBaseDoc } from '../write/players/playerDoc.model.js'
import { buildPlayerSeasonDoc } from '../write/players/playerSeason.model.js'
import { normalizeTeamPlayer } from '../write/teams/teamSeason.model.js'
import {
  alignTeamPlayerWithCatalogSchema,
} from './teamPlayerSchemaRepair.model.js'
import { normalizePlayerNameValue } from '../../model/playerIdentity.model.js'

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
  row.identityKey,
])

const normalizedPlayerName = source => normalizePlayerNameValue(
  source?.normalizedName || source?.fullName || ''
)

const samePlayer = ({ player, row }) => {
  const expected = playerKeys(row)
  const actual = unique([
    player?.playerId,
    player?.playerDocumentId,
    player?.externalPlayerId,
    player?.identityKey,
  ])

  return actual.some(value => expected.includes(value))
}

const findMatchingRow = ({ player, rows }) => {
  const sourceRows = Array.isArray(rows) ? rows : []
  const directMatches = sourceRows.filter(row => samePlayer({ player, row }))

  if (directMatches.length === 1) return directMatches[0]
  if (directMatches.length > 1) return null

  const playerName = normalizedPlayerName(player)
  if (!playerName) return null

  const nameMatches = sourceRows.filter(row => (
    normalizedPlayerName(row) === playerName
  ))

  return nameMatches.length === 1 ? nameMatches[0] : null
}

const findMatchingPlayer = ({ players, row }) => {
  const sourcePlayers = Array.isArray(players) ? players : []
  const directMatches = sourcePlayers.filter(player => samePlayer({ player, row }))

  if (directMatches.length === 1) return directMatches[0]
  if (directMatches.length > 1) return null

  const rowName = normalizedPlayerName(row)
  if (!rowName) return null

  const nameMatches = sourcePlayers.filter(player => (
    normalizedPlayerName(player) === rowName
  ))

  return nameMatches.length === 1 ? nameMatches[0] : null
}

const sameSeason = ({ season, seasonKey }) => (
  clean(season?.seasonKey || season?.seasonId) === clean(seasonKey)
)

const profileRepairIssueTypes = new Set([
  'missing_player_document',
  'missing_search_index',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'current_season_status_invalid',
  'history_season_status_invalid',
  'team_player_state_outdated',
  'team_player_schema_outdated',
  'team_stats_measurement_outdated',
  'search_index_schema_outdated',
  'search_index_scout_projection_mismatch',
  'search_index_season_status_mismatch',
])

const schemaRepairIssueTypes = new Set([
  'player_schema_outdated',
  'player_season_context_outdated',
  'player_tracking_mismatch',
  'player_measurement_history_outdated',
  'player_season_status_mismatch',
])

const hasRepairableSchemaIssue = issue => (
  (Array.isArray(issue?.missingFields) && issue.missingFields.length > 0) ||
  (Array.isArray(issue?.invalidTypes) && issue.invalidTypes.length > 0)
)


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

const repairNameScopeKey = row => [
  teamDocumentIdOf(row),
  seasonKeyOf(row),
  normalizedPlayerName(row),
].join('::')

const buildRepairNameCounts = rows => (
  (Array.isArray(rows) ? rows : []).reduce((counts, row) => {
    const normalizedName = normalizedPlayerName(row)
    if (!normalizedName) return counts

    const key = repairNameScopeKey(row)
    counts.set(key, (counts.get(key) || 0) + 1)
    return counts
  }, new Map())
)

const repairIdentityKeys = ({ row, nameCounts }) => {
  const keys = playerKeys(row).map(playerKey => [
    teamDocumentIdOf(row),
    seasonKeyOf(row),
    playerKey,
  ].join('::'))
  const nameKey = repairNameScopeKey(row)

  if (normalizedPlayerName(row) && nameCounts.get(nameKey) === 1) {
    keys.push(`name::${nameKey}`)
  }

  return unique(keys)
}

const buildAffectedRows = audit => {
  const issuesByKey = new Map()
  const nameCounts = buildRepairNameCounts(audit.recalculatedRows)

  audit.issues
    .filter(issue => {
      if (!profileRepairIssueTypes.has(issue.type)) return false
      if (issue.repairable === false) return false
      if (![
        'team_player_schema_outdated',
        'search_index_schema_outdated',
      ].includes(issue.type)) return true

      return hasRepairableSchemaIssue(issue)
    })
    .forEach(issue => {
      repairIdentityKeys({ row: issue, nameCounts }).forEach(key => {
        if (!issuesByKey.has(key)) issuesByKey.set(key, new Set())
        issuesByKey.get(key).add(issue.type)
      })
    })

  return audit.recalculatedRows
    .map(row => {
      const repairIssueTypes = unique(
        repairIdentityKeys({ row, nameCounts }).flatMap(key => (
          issuesByKey.has(key) ? [...issuesByKey.get(key)] : []
        ))
      )

      if (!repairIssueTypes.length) return null

      return {
        ...row,
        repairIssueTypes,
        sourceTarget: resolveScopeTarget({
          row,
          audit,
        }),
      }
    })
    .filter(Boolean)
}

const buildSchemaIssues = audit => (Array.isArray(audit?.issues)
  ? audit.issues.filter(issue => {
      if (!schemaRepairIssueTypes.has(issue.type)) return false
      if (issue.type !== 'player_schema_outdated') return true

      return hasRepairableSchemaIssue(issue)
    })
  : []
)

const buildCompatibleRootTracking = data => {
  const current = normalizeScoutingPlayerTracking(data?.tracking)
  const favorite = data?.favorite === true || current.favorite
  const watchlist = data?.watchlist === true || current.watchlist
  const normalized = {
    ...current,
    favorite,
    watchlist,
  }

  return {
    ...normalized,
    trackingReasons: resolvePlayerTrackingReasons({
      ...data,
      favorite,
      watchlist,
      tracking: normalized,
    }),
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

const seasonTargetIdentifiers = ({ issue, row }) => ({
  issue: {
    seasonKey: seasonKeyOf(issue),
    birthTeamDocumentId: clean(issue?.birthTeamDocumentId),
    teamDocumentId: clean(issue?.teamDocumentId),
    birthTeamId: clean(issue?.birthTeamId),
    teamId: clean(issue?.teamId),
    clubId: clean(issue?.clubId),
    teamName: clean(issue?.teamName),
    clubName: clean(issue?.clubName),
  },
  row: {
    seasonKey: seasonKeyOf(row),
    birthTeamDocumentId: clean(row?.birthTeamDocumentId),
    teamDocumentId: clean(row?.teamDocumentId),
    birthTeamId: clean(row?.birthTeamId),
    teamId: clean(row?.teamId),
    clubId: clean(row?.clubId),
    teamName: clean(row?.teamName),
    clubName: clean(row?.clubName),
  },
  expectedTeamIds: issueTeamIds({ issue, row }),
  expectedClubId: clean(issue?.clubId || row?.clubId),
})

const seasonTargetCandidate = season => ({
  seasonKey: seasonKeyOf(season),
  birthTeamDocumentId: clean(season?.birthTeamDocumentId),
  teamDocumentId: clean(season?.teamDocumentId),
  birthTeamId: clean(season?.birthTeamId),
  teamId: clean(season?.teamId),
  clubId: clean(season?.clubId),
  teamName: clean(season?.teamName),
  clubName: clean(season?.clubName),
})

const findSchemaSeasonTarget = ({ seasons, issue, row }) => {
  const sameSeasonIndexes = seasons
    .map((season, index) => ({ season, index }))
    .filter(({ season }) => sameSeason({
      season,
      seasonKey: seasonKeyOf(issue),
    }))

  if (sameSeasonIndexes.length === 1) {
    return {
      index: sameSeasonIndexes[0].index,
      reason: '',
      candidates: sameSeasonIndexes.map(({ season }) => (
        seasonTargetCandidate(season)
      )),
      targetIdentifiers: seasonTargetIdentifiers({ issue, row }),
    }
  }
  if (!sameSeasonIndexes.length) {
    return {
      index: -1,
      reason: 'season_target_not_found',
      candidates: [],
      targetIdentifiers: seasonTargetIdentifiers({ issue, row }),
    }
  }

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

  return matched.length === 1
    ? {
        index: matched[0].index,
        reason: '',
        candidates: sameSeasonIndexes.map(({ season }) => (
          seasonTargetCandidate(season)
        )),
        targetIdentifiers: seasonTargetIdentifiers({ issue, row }),
      }
    : {
        index: -1,
        reason: 'season_target_ambiguous',
        candidates: sameSeasonIndexes.map(({ season }) => (
          seasonTargetCandidate(season)
        )),
        targetIdentifiers: seasonTargetIdentifiers({ issue, row }),
      }
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

const normalizeSchemaFieldPath = field => {
  if (typeof field === 'string') return clean(field)
  if (field && typeof field === 'object' && typeof field.field === 'string') {
    return clean(field.field)
  }

  return ''
}

const buildCanonicalRepairSeason = ({ season, row, target }) => {
  const teamContext = row?.teamContext || {}
  const hasExpectedPlayerState = isPlainObject(row?.expectedPlayerScoutState)
  const expectedState = hasExpectedPlayerState
    ? row.expectedPlayerScoutState
    : row?.expectedScoutState || {}
  const expectedProfiles = (
    hasExpectedPlayerState &&
    Array.isArray(row?.expectedPlayerScoutProfiles)
  )
    ? row.expectedPlayerScoutProfiles
    : season.scoutProfiles
  const expectedCombinations = (
    hasExpectedPlayerState &&
    Array.isArray(row?.expectedPlayerScoutCombinations)
  )
    ? row.expectedPlayerScoutCombinations
    : season.scoutCombinations
  const measurementHistory = buildPlayerScoutStatsLoadMeasurementHistory({
    existingHistory: season.scoutStatsLoadMeasurementHistory,
    measurements: (
      row?.expectedScoutStatsLoadMeasurements ||
      row?.teamScoutStatsLoadMeasurements
    ),
  })
  const playerStats = {
    ...(season.playerStats || {}),
    ...(row?.stats || {}),
  }
  const repairPlayer = {
    ...season,
    playerId: clean(row?.playerId || season.playerId),
    playerDocumentId: clean(row?.playerDocumentId || season.playerDocumentId),
    externalPlayerId: clean(row?.externalPlayerId || season.externalPlayerId),
    fullName: clean(row?.fullName || season.fullName),
    primaryPosition: clean(row?.primaryPosition || season.primaryPosition),
    playerStats,
    scoutSignals: expectedProfiles,
    scoutProfiles: expectedProfiles,
    scoutCombinations: expectedCombinations,
    scoutStatsLoadMeasurementHistory: measurementHistory,
    ...stripUndefined(expectedState),
  }
  const repairTeam = {
    clubId: clean(row?.clubId || season.clubId),
    clubName: clean(row?.clubName || season.clubName || row?.teamName || season.teamName),
    displayName: clean(row?.teamName || season.teamName),
    teamName: clean(row?.teamName || season.teamName),
    leagueId: clean(row?.leagueId || season.leagueId),
    leagueName: clean(row?.leagueName || season.leagueName),
    birthTeamId: clean(row?.birthTeamId || season.birthTeamId || season.teamId),
    birthTeamDocumentId: clean(
      row?.birthTeamDocumentId ||
      row?.teamDocumentId ||
      season.birthTeamDocumentId
    ),
    teamDocumentId: clean(row?.teamDocumentId || season.birthTeamDocumentId),
    birthTeamSlot: pickPresent(season.birthTeamSlot, 1),
    birthYear: pickPresent(season.birthYear, null),
    ageGroupId: clean(teamContext.ageGroupId || season.ageGroupId),
    ageGroupLabel: clean(season.ageGroupLabel || teamContext.ageGroupId),
    clubLevel: pickPresent(teamContext.clubLevel, season.clubLevel),
    clubStrengthLevel: pickPresent(
      teamContext.clubStrengthLevel,
      teamContext.clubLevel,
      season.clubStrengthLevel,
      season.clubLevel
    ),
    leagueLevel: pickPresent(teamContext.leagueLevel, season.leagueLevel),
    tableRank: pickPresent(
      teamContext.teamRank,
      season.playerStats?.teamRank,
      null
    ),
    offense: pickPresent(
      teamContext.teamAttackPerformance,
      season.playerStats?.teamAttackPerformance,
      null
    ),
    defense: pickPresent(
      teamContext.teamDefensePerformance,
      season.playerStats?.teamDefensePerformance,
      null
    ),
    teamStats: {
      teamGamePlayed: pickPresent(
        teamContext.teamGamePlayed,
        season.playerStats?.teamGames,
        0
      ),
      goalsFor: pickPresent(
        teamContext.goalsFor,
        season.playerStats?.teamGoalsFor,
        0
      ),
      goalsAgainst: pickPresent(
        teamContext.goalsAgainst,
        season.playerStats?.teamGoalsAgainst,
        0
      ),
    },
  }
  const repairSeason = {
    ...season,
    seasonId: clean(row?.seasonId || season.seasonId),
    seasonKey: clean(row?.seasonKey || season.seasonKey),
    leagueId: clean(row?.leagueId || season.leagueId),
    leagueName: clean(row?.leagueName || season.leagueName),
    seasonStatus: clean(target) === 'history'
      ? 'completed'
      : clean(row?.storedSeasonStatus || season.seasonStatus) || 'active',
    leagueLevel: pickPresent(teamContext.leagueLevel, season.leagueLevel),
  }
  const canonical = buildPlayerSeasonDoc({
    season: repairSeason,
    team: repairTeam,
    player: repairPlayer,
  })

  return canonical
}

const buildSchemaSeasonPatch = ({
  season,
  row,
  missingFields,
  invalidTypes,
  target,
}) => {
  const fields = new Set([
    ...(Array.isArray(missingFields) ? missingFields : []),
    ...(Array.isArray(invalidTypes) ? invalidTypes : []),
  ].map(normalizeSchemaFieldPath).filter(Boolean))
  const canonical = buildCanonicalRepairSeason({
    season,
    row,
    target,
  })
  const next = { ...season }

  fields.forEach(path => {
    const field = clean(path).replace(/^season\./, '')
    if (!field || !Object.prototype.hasOwnProperty.call(canonical, field)) return

    next[field] = stripUndefined(canonical[field])
  })

  return next
}

const buildPlayerSeasonContextPatch = ({ season, row, target }) => {
  const canonical = buildCanonicalRepairSeason({
    season,
    row,
    target,
  })

  return {
    ...season,
    leagueId: canonical.leagueId,
    leagueName: canonical.leagueName,
    clubName: canonical.clubName,
    teamName: canonical.teamName,
    playerStats: {
      ...(season.playerStats || {}),
      teamGames: canonical.playerStats?.teamGames,
      teamRank: canonical.playerStats?.teamRank,
      teamGoalsFor: canonical.playerStats?.teamGoalsFor,
      teamGoalsAgainst: canonical.playerStats?.teamGoalsAgainst,
      teamAttackPerformance: canonical.playerStats?.teamAttackPerformance,
      teamDefensePerformance: canonical.playerStats?.teamDefensePerformance,
    },
    updatedAt: canonical.updatedAt,
  }
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
    const diagnostics = []
    const rootIssues = issues.filter(issue => clean(issue.schemaScope) === 'root')

    if (rootIssues.length) {
      const rootRepairFields = new Set(
        rootIssues.flatMap(issue => ([
          ...(Array.isArray(issue.missingFields) ? issue.missingFields : []),
          ...(Array.isArray(issue.invalidTypes) ? issue.invalidTypes : []),
        ].map(normalizeSchemaFieldPath).filter(Boolean)))
      )
      const baseDoc = buildPlayerBaseDoc({
        ...data,
        playerDocumentId,
      }, data)

      rootRepairFields.forEach(field => {
        if (typeof field !== 'string' || field.includes('.')) return
        if (!Object.prototype.hasOwnProperty.call(baseDoc, field)) return

        patch[field] = baseDoc[field]
      })

      patch.favorite = data.favorite === true || data.tracking?.favorite === true
      patch.tracking = buildCompatibleRootTracking(data)
      patch.verification = normalizeScoutingPlayerVerification(data.verification)
      patch.events = normalizeScoutingPlayerEvents(data.events)
    }

    ;['current', 'history'].forEach(target => {
      const schemaTargetIssues = issues.filter(issue => {
        if (![
          'player_schema_outdated',
          'player_measurement_history_outdated',
        ].includes(issue.type)) return false
        if (clean(issue.schemaScope) !== 'season') return false
        const row = findAuditRowForIssue({ audit, issue })
        return (clean(row?.sourceTarget) || 'current') === target
      })
      const contextTargetIssues = issues.filter(issue => {
        if (issue.type !== 'player_season_context_outdated') return false
        const row = findAuditRowForIssue({ audit, issue })
        return (clean(row?.sourceTarget) || 'current') === target
      })
      const targetIssues = [...schemaTargetIssues, ...contextTargetIssues]
      if (!targetIssues.length) return

      const seasons = Array.isArray(data[target]) ? [...data[target]] : []
      let targetUpdated = false

      targetIssues.forEach(issue => {
        const row = findAuditRowForIssue({ audit, issue })
        const seasonTarget = findSchemaSeasonTarget({
          seasons,
          issue,
          row,
        })
        const seasonIndex = seasonTarget.index
        if (seasonIndex === -1) {
          const contextDiagnostic = issue.type === 'player_season_context_outdated'
            ? {
                candidateSeasonCount: (
                  Array.isArray(seasonTarget.candidates)
                    ? seasonTarget.candidates.length
                    : 0
                ),
                candidateSeasons: Array.isArray(seasonTarget.candidates)
                  ? seasonTarget.candidates
                  : [],
                targetIdentifiers: seasonTarget.targetIdentifiers || {},
              }
            : {}

          diagnostics.push({
            issueId: clean(issue?.issueId),
            issueType: clean(issue?.type),
            playerDocumentId,
            seasonKey: seasonKeyOf(issue),
            reason: seasonTarget.reason || 'season_target_not_found',
            ...contextDiagnostic,
          })
          return
        }

        seasons[seasonIndex] = issue.type === 'player_season_context_outdated'
          ? buildPlayerSeasonContextPatch({
              season: seasons[seasonIndex],
              row,
              target,
            })
          : buildSchemaSeasonPatch({
              season: seasons[seasonIndex],
              row,
              missingFields: issue.missingFields,
              invalidTypes: issue.invalidTypes,
              target,
            })
        targetUpdated = true
      })

      if (!targetUpdated) return
      patch[target] = seasons
    })

    if (!Object.keys(patch).length) {
      return { playerDocumentId, updated: false, diagnostics }
    }

    patch.updatedAt = serverTimestamp()
    transaction.set(ref, patch, { merge: true })

    return { playerDocumentId, updated: true, diagnostics }
  }, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.players,
    action: 'playerSchemaRepair',
    operationSubtype: 'maintenance-transaction',
  })
}

const repairPlayerSchemaIssues = async ({ audit, issues }) => {
  const byPlayerDocumentId = new Map()
  const missingPlayerDocumentId = []

  issues.forEach(issue => {
    const playerDocumentId = clean(issue.playerDocumentId)
    if (!playerDocumentId) {
      missingPlayerDocumentId.push({
        issueId: clean(issue.issueId),
        type: clean(issue.type),
        playerDocumentId,
        playerId: clean(issue.playerId),
        externalPlayerId: clean(issue.externalPlayerId),
        teamDocumentId: clean(issue.teamDocumentId),
        seasonKey: seasonKeyOf(issue),
      })
      return
    }

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

  return {
    results,
    telemetry: {
      schemaIssuesByType: (Array.isArray(issues) ? issues : []).reduce(
        (summary, issue) => ({
          ...summary,
          [clean(issue.type)]: Number(summary[clean(issue.type)] || 0) + 1,
        }),
        {}
      ),
      schemaIssuesMissingPlayerDocumentId: missingPlayerDocumentId,
      schemaIssuesGroupedByPlayerDocumentId: [...byPlayerDocumentId.entries()]
        .map(([playerDocumentId, playerIssues]) => ({
          playerDocumentId,
          issuesCount: playerIssues.length,
          issueIds: unique(playerIssues.map(issue => issue.issueId)),
          issueTypes: unique(playerIssues.map(issue => issue.type)),
        })),
      schemaResultsCount: results.length,
      playerSchemaDocumentsUpdated: results.filter(result => (
        result.updated
      )).length,
    },
  }
}

const countNonRepairableSchemaIssues = audit => (
  (Array.isArray(audit?.issues) ? audit.issues : []).filter(issue => (
    [
      'team_player_schema_outdated',
      'player_schema_outdated',
      'search_index_schema_outdated',
    ].includes(issue.type) &&
    Array.isArray(issue.reportOnlyUnexpectedFields) &&
    issue.reportOnlyUnexpectedFields.length > 0
  )).length
)

const REPAIR_ROUTE_BY_ISSUE_TYPE = Object.freeze({
  current_season_status_invalid: {
    source: 'Team Season lifecycle',
    target: 'dbBirthTeams',
  },
  history_season_status_invalid: {
    source: 'Team Season lifecycle',
    target: 'dbBirthTeams',
  },
  team_player_state_outdated: {
    source: 'Team operational calculation',
    target: 'dbBirthTeams',
  },
  team_player_schema_outdated: {
    source: 'direct document catalogs',
    target: 'dbBirthTeams',
  },
  team_stats_measurement_outdated: {
    source: 'Full Stats Load measurement',
    target: 'dbBirthTeams',
  },
  missing_player_document: {
    source: 'Team tracking evidence',
    target: 'dbPlayers',
  },
  player_schema_outdated: {
    source: 'direct document catalogs',
    target: 'dbPlayers',
  },
  player_season_context_outdated: {
    source: 'Team Season context already loaded by Audit',
    target: 'dbPlayers season context',
  },
  player_tracking_mismatch: {
    source: 'Player root facts + tracking lifecycle',
    target: 'dbPlayers.tracking',
  },
  player_measurement_history_outdated: {
    source: 'Team previous/current measurements',
    target: 'dbPlayers measurement history',
  },
  player_season_status_mismatch: {
    source: 'Team Season lifecycle',
    target: 'dbPlayers seasonStatus',
  },
  missing_search_index: {
    source: 'Team operational state',
    target: 'dbSearchIndexes',
  },
  search_index_mismatch: {
    source: 'Team operational state',
    target: 'dbSearchIndexes',
  },
  search_index_reliability_mismatch: {
    source: 'Team operational state',
    target: 'dbSearchIndexes',
  },
  search_index_schema_outdated: {
    source: 'direct document catalogs + Team projection',
    target: 'dbSearchIndexes',
  },
  search_index_scout_projection_mismatch: {
    source: 'Team operational state',
    target: 'dbSearchIndexes',
  },
  search_index_season_status_mismatch: {
    source: 'Team Season lifecycle',
    target: 'dbSearchIndexes seasonStatus',
  },
})

const isActionableRepairIssue = issue => {
  if (issue?.repairable === false) return false

  if ([
    'team_player_schema_outdated',
    'player_schema_outdated',
    'search_index_schema_outdated',
  ].includes(issue?.type)) {
    return hasRepairableSchemaIssue(issue)
  }

  return true
}

const buildRepairRoutes = audit => {
  const routeMap = new Map()

  ;(Array.isArray(audit?.issues) ? audit.issues : []).forEach(issue => {
    if (!isActionableRepairIssue(issue)) return

    const route = REPAIR_ROUTE_BY_ISSUE_TYPE[issue.type]
    if (!route) return

    const key = `${route.source}::${route.target}`
    const current = routeMap.get(key) || {
      ...route,
      issueTypes: [],
      issuesCount: 0,
    }

    routeMap.set(key, {
      ...current,
      issueTypes: unique([...current.issueTypes, issue.type]),
      issuesCount: current.issuesCount + 1,
    })
  })

  return [...routeMap.values()]
}

const countSelectedIssuesByType = ({
  issues = [],
  types = [],
} = {}) => {
  const typeSet = new Set(Array.isArray(types) ? types : [])

  return (Array.isArray(issues) ? issues : []).filter(issue => (
    typeSet.has(issue?.type)
  )).length
}

const countSelectedIssuesByPredicate = ({
  issues = [],
  predicate,
} = {}) => (
  typeof predicate === 'function'
    ? (Array.isArray(issues) ? issues : []).filter(predicate).length
    : 0
)

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
        issue.repairable !== false && (
          issue.type === 'player_schema_outdated' ||
          issue.type === 'player_season_context_outdated' ||
          issue.type === 'player_tracking_mismatch' ||
          issue.type === 'player_measurement_history_outdated' ||
          issue.type === 'player_season_status_mismatch'
        )
      ))
      .map(issue => issue.playerDocumentId)
  )
  const searchDocumentKeys = unique(
    audit.issues
      .filter(issue => (
        issue.type === 'missing_search_index' ||
        issue.type === 'search_index_mismatch' ||
        issue.type === 'search_index_reliability_mismatch' ||
        issue.type === 'search_index_scout_projection_mismatch' ||
        issue.type === 'search_index_season_status_mismatch' ||
        issue.type === 'team_search_index_scout_summary_mismatch'
      ))
      .map(issue => (
        issue.type === 'team_search_index_scout_summary_mismatch'
          ? clean(issue.searchIndexDocumentId)
          : [
              clean(issue.playerId || issue.playerDocumentId),
              clean(issue.seasonKey || issue.seasonId),
              clean(issue.teamDocumentId),
            ].join('::')
      ))
  )

  const selectedIssues = Array.isArray(audit?.issues)
    ? audit.issues
    : []
  const selectedBirthTeamIssues = selectedIssues.filter(issue => (
    issue.type === 'birth_team_mismatch'
  ))
  const selectedSeasonStatusIssues = selectedIssues.filter(issue => ([
    'current_season_status_invalid',
    'history_season_status_invalid',
    'player_season_status_mismatch',
    'search_index_season_status_mismatch',
  ].includes(issue.type)))
  const selectedSchemaIssues = selectedIssues.filter(issue => ([
    'team_player_schema_outdated',
    'player_schema_outdated',
    'search_index_schema_outdated',
    'player_narrative_schema_invalid',
  ].includes(issue.type)))
  const selectedMeasurementIssues = selectedIssues.filter(issue => ([
    'team_stats_measurement_outdated',
    'player_measurement_history_outdated',
  ].includes(issue.type)))
  const selectedTrackingIssues = selectedIssues.filter(issue => (
    issue.type === 'player_tracking_mismatch'
  ))
  const selectedProjectionIssues = selectedIssues.filter(issue => (
    issue.type === 'search_index_scout_projection_mismatch'
  ))
  const selectedStateIssues = selectedIssues.filter(issue => ([
    'team_scout_state_mismatch',
    'player_scout_state_mismatch',
  ].includes(issue.type)))
  const selectedReliabilityIssues = selectedIssues.filter(issue => (
    clean(issue.type).includes('reliability_mismatch')
  ))

  return {
    affectedTeamDocuments: teamDocumentIds.length,
    affectedTeamSeasonScopes: scopes.length,
    playerDocsMissingBeforeRepair: missingPlayerDocumentIds.length,
    playerDocsExistingWithDiff: existingPlayerDocumentIds.length,
    searchIndexDocumentsWithDiff: searchDocumentKeys.length,
    historyStatusIssues: selectedSeasonStatusIssues.length,
    schemaIssues: selectedSchemaIssues.length,
    nonRepairableSchemaIssues: countNonRepairableSchemaIssues(audit),
    measurementIssues: selectedMeasurementIssues.length,
    trackingIssues: selectedTrackingIssues.length,
    projectionIssues: selectedProjectionIssues.length,
    stateIssues: selectedStateIssues.length,
    profileDiffRows: selectedBirthTeamIssues.length,
    reliabilityIssues: selectedReliabilityIssues.length,
  }
}

const splitSelectedDirectRepairIssues = ({
  selection,
} = {}) => {
  if (selection?.mode !== 'selected') {
    return {
      directIssues: [],
      legacyIssues: Array.isArray(selection?.audit?.issues)
        ? selection.audit.issues
        : [],
    }
  }

  const issues = Array.isArray(selection?.audit?.issues)
    ? selection.audit.issues
    : []
  const directIssues = issues.filter(canDirectRepairSearchIndexIssue)
  const directIssueIds = new Set(
    directIssues.map(issue => clean(issue.issueId))
  )

  return {
    directIssues,
    legacyIssues: issues.filter(issue => (
      !directIssueIds.has(clean(issue.issueId))
    )),
  }
}

const buildRepairAuditWithIssues = ({
  audit,
  issues = [],
} = {}) => ({
  ...audit,
  issues,
  auditIssues: (Array.isArray(audit?.auditIssues) ? audit.auditIssues : [])
    .filter(issue => issues.some(selected => (
      clean(selected.issueId) === clean(issue.issueId)
    ))),
  migrationIssues: (
    Array.isArray(audit?.migrationIssues) ? audit.migrationIssues : []
  ).filter(issue => issues.some(selected => (
    clean(selected.issueId) === clean(issue.issueId)
  ))),
  diagnostics: (Array.isArray(audit?.diagnostics) ? audit.diagnostics : [])
    .filter(issue => issues.some(selected => (
      clean(selected.issueId) === clean(issue.issueId)
    ))),
})

export async function buildPlayerScoutRepairPreview({
  audit: sourceAudit,
  selectedIssueIds,
} = {}) {
  if (!sourceAudit) {
    throw new Error('Player scout repair preview requires a source audit')
  }

  const selection = buildPlayerScoutRepairSelection({
    audit: sourceAudit,
    selectedIssueIds,
  })
  const split = splitSelectedDirectRepairIssues({
    selection,
  })
  const selectedAudit = selection.audit
  const audit = buildRepairAuditWithIssues({
    audit: selectedAudit,
    issues: split.legacyIssues,
  })
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
    sourceOfTruth: {
      operational: PLAYERS_DATABASE_COLLECTIONS.teams,
      scoutProfiles: PLAYERS_DATABASE_COLLECTIONS.players,
      projection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      schema: 'direct document catalogs',
    },
    selection: {
      mode: selection.mode,
      selectedIssueIds: selection.selectedIssueIds,
      ...selection.summary,
    },
    migrationPlan: buildPlayerScoutMigrationPlan({
      issues: selection.selectedIssues,
    }),
    summary: {
      ...buildPreviewSummary({
        audit: selectedAudit,
        affectedRows,
      }),
      selectedIssuesCount: selection.summary.selectedIssuesCount,
    },
    cost: {
      ...buildPlayerScoutRepairCost({
        audit,
        affectedRows,
        schemaIssues,
      }),
      directSearchIndex: {
        issuesCount: split.directIssues.length,
        readsMaximum: split.directIssues.length,
        writesMaximum: split.directIssues.length,
        verificationReadsMaximum: split.directIssues.length,
        processReadsMaximum: split.directIssues.length * 2,
        processWritesMaximum: split.directIssues.length,
      },
    },
    directRepairs: {
      searchIndexIssues: split.directIssues.map(issue => ({
        issueId: issue.issueId,
        repairType: issue.repair?.repairType,
        target: clean(issue?.repairData?.writer) === 'DIRECT_TEAM_SEARCH_INDEX'
          ? 'teamSearchIndex'
          : 'playerSearchIndex',
        searchIndexDocumentId: issue.searchIndexDocumentId,
        fields: Object.keys(issue.repairData?.fields || {}),
      })),
      playerSearchIndexIssues: split.directIssues
        .filter(issue => (
          clean(issue?.repairData?.writer) === 'DIRECT_PLAYER_SEARCH_INDEX'
        ))
        .map(issue => ({
          issueId: issue.issueId,
          searchIndexDocumentId: issue.searchIndexDocumentId,
          fields: Object.keys(issue.repairData?.fields || {}),
        })),
    },
    repairRoutes: buildRepairRoutes(audit),
    affectedScopes: unique(
      affectedRows.map(scopeKeyOf)
    ),
  }
}

const hasRepairAction = (row, type) => (
  Array.isArray(row?.repairIssueTypes) && row.repairIssueTypes.includes(type)
)

const TEAM_STATE_REPAIR_ISSUE_TYPES = new Set([
  'current_season_status_invalid',
  'history_season_status_invalid',
  'team_player_state_outdated',
  'team_player_schema_outdated',
  'team_stats_measurement_outdated',
])

const shouldRepairTeamPlayer = row => (
  (Array.isArray(row?.repairIssueTypes) ? row.repairIssueTypes : []).some(
    type => TEAM_STATE_REPAIR_ISSUE_TYPES.has(type)
  )
)

const shouldWriteTeamScope = rows => (
  (Array.isArray(rows) ? rows : []).some(row => shouldRepairTeamPlayer(row))
)

const buildProfiledPlayer = ({ player, row }) => {
  const nextPlayer = {
    ...player,
  }

  if (hasRepairAction(row, 'team_player_state_outdated')) {
    Object.assign(
      nextPlayer,
      stripUndefined(row.expectedTeamScoutState || {})
    )
  }

  if (hasRepairAction(row, 'team_stats_measurement_outdated')) {
    nextPlayer.scoutStatsLoadMeasurements = stripUndefined(
      row.expectedScoutStatsLoadMeasurements ||
      player.scoutStatsLoadMeasurements ||
      {}
    )
  }

  return nextPlayer
}

const repairSeason = ({ season, rows, target }) => {
  const nextPlayers = (Array.isArray(season.teamPlayers)
    ? season.teamPlayers
    : []
  ).map(player => {
    const row = findMatchingRow({
      player,
      rows,
    })

    if (!row || !shouldRepairTeamPlayer(row)) return player

    const normalizedPlayer = normalizeTeamPlayer(buildProfiledPlayer({
      player,
      row,
    }), season)
    const nextPlayer = {
      ...player,
      ...normalizedPlayer,
    }

    return hasRepairAction(row, 'team_player_schema_outdated')
      ? alignTeamPlayerWithCatalogSchema({
          player: nextPlayer,
        })
      : nextPlayer
  })

  const shouldRepairCurrentSeasonStatus = rows.some(row => (
    hasRepairAction(row, 'current_season_status_invalid')
  ))

  return {
    ...season,
    seasonStatus: target === 'history'
      ? 'completed'
      : shouldRepairCurrentSeasonStatus
        ? 'active'
        : clean(season.seasonStatus) || 'active',
    teamPlayers: nextPlayers,
    updatedAt: new Date().toISOString(),
  }
}

export const repairTeamDocument = async ({ teamDocumentId, rows }) => {
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
    let shouldWriteTeam = false

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
        if (shouldWriteTeamScope(scopeRows)) {
          seasons[seasonIndex] = repairSeason({
            season: seasons[seasonIndex],
            rows: scopeRows,
            target,
          })
          shouldWriteTeam = true
        }
        const affectedPlayers = seasons[seasonIndex].teamPlayers.filter(
          player => Boolean(findMatchingRow({ player, rows: scopeRows }))
        )

        if (affectedPlayers.length) {
          repairedScopes.push({
            target,
            season: seasons[seasonIndex],
            players: affectedPlayers,
            rows: scopeRows,
            repairIssueTypes: unique(
              scopeRows.flatMap(row => row.repairIssueTypes || [])
            ),
          })
        }
      })
    })

    if (shouldWriteTeam) {
      transaction.set(
        ref,
        {
          current,
          history,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return {
      team: {
        ...data,
        birthTeamDocumentId: teamDocumentId,
        teamDocumentId,
      },
      repairedScopes,
      updated: shouldWriteTeam,
    }
  }, {
    feature: 'playersDatabase',
    collection: PLAYERS_DATABASE_COLLECTIONS.teams,
    action: 'playerScoutRepair-updateTeam',
    operationSubtype: 'maintenance-transaction',
  })
}

const PLAYER_DOCUMENT_SYNC_ISSUE_TYPES = new Set([
  'missing_player_document',
])

const SEARCH_INDEX_SYNC_ISSUE_TYPES = new Set([
  'missing_search_index',
  'search_index_mismatch',
  'search_index_reliability_mismatch',
  'search_index_schema_outdated',
  'search_index_scout_projection_mismatch',
  'search_index_season_status_mismatch',
])

const rowsForIssueTypes = ({ rows, issueTypes }) => (
  (Array.isArray(rows) ? rows : []).filter(row => (
    (Array.isArray(row?.repairIssueTypes) ? row.repairIssueTypes : []).some(
      type => issueTypes.has(type)
    )
  ))
)

const playersForRows = ({ players, rows }) => (
  (Array.isArray(rows) ? rows : [])
    .map(row => findMatchingPlayer({ players, row }))
    .filter(Boolean)
    .filter((player, index, all) => all.indexOf(player) === index)
)

const enrichPlayerTrackingReasonsForRepair = ({ player, row }) => {
  const expectedTrackingReasons = unique(row?.expectedTrackingReasons)
  if (!expectedTrackingReasons.length) return player

  return {
    ...player,
    tracking: {
      ...(player?.tracking || {}),
      trackingReasons: unique([
        ...(Array.isArray(player?.tracking?.trackingReasons)
          ? player.tracking.trackingReasons
          : []),
        ...expectedTrackingReasons,
      ]),
    },
  }
}

const playersForDocumentRows = ({ players, rows }) => (
  playersForRows({ players, rows })
    .map(player => {
      const row = findMatchingRow({ player, rows })
      return enrichPlayerTrackingReasonsForRepair({ player, row })
    })
)

const syncScope = async ({ team, scope }) => {
  const season = scope.season
  const target = scope.target
  const players = Array.isArray(scope.players) ? scope.players : []
  const rows = Array.isArray(scope.rows) ? scope.rows : []
  const repairIssueTypes = unique(
    rows.flatMap(row => row.repairIssueTypes || [])
  )
  const playerDocumentRows = rowsForIssueTypes({
    rows,
    issueTypes: PLAYER_DOCUMENT_SYNC_ISSUE_TYPES,
  })
  const searchIndexRows = rowsForIssueTypes({
    rows,
    issueTypes: SEARCH_INDEX_SYNC_ISSUE_TYPES,
  })
  const playerDocumentPlayers = playersForDocumentRows({
    players,
    rows: playerDocumentRows,
  })
  const searchIndexPlayers = playersForRows({
    players,
    rows: searchIndexRows,
  })
  const basePayload = {
    season,
    team,
    teamDocument: team,
    target,
  }
  const playerDocs = playerDocumentPlayers.length
    ? await syncPlayerScoutProfileDocsMany({
        ...basePayload,
        players: playerDocumentPlayers,
      })
    : {
        rowsCount: 0,
        createdCount: 0,
        failedCount: 0,
      }
  const searchIndex = searchIndexPlayers.length
    ? await updatePlayerSeasonSearchIndexStatsMany({
        ...basePayload,
        players: searchIndexPlayers,
      })
    : {
        rowsCount: 0,
        createdCount: 0,
        updatedCount: 0,
        deletedCount: 0,
        failedCount: 0,
      }

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
    playerDocumentPlayersCount: playerDocumentPlayers.length,
    searchIndexPlayersCount: searchIndexPlayers.length,
    repairIssueTypes,
    playerDocs,
    searchIndex,
  }
}


const ENGINE_REFRESH_STATE_FIELDS = [
  'scoutCandidateSignals',
  'scoutEvidence',
  'scoutSpotlights',
  'scoutOpportunity',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutProfileCaseStrength',
  'scoutPlayerInterest',
  'scoutTrajectory',
  'scoutTransferContext',
  'futureCompetitionPath',
  'scoutEngineVersion',
]

const ENGINE_REFRESH_VERIFICATION_FIELD = 'scoutVerification'

const ENGINE_REFRESH_READ_HARD_LIMIT = 50000
const ENGINE_REFRESH_READ_SAFETY_LIMIT = 49000

const teamEngineStateIssueTypes = new Set([
  'team_scout_state_mismatch',
  'birth_team_mismatch',
  'birth_team_reliability_mismatch',
])

const playerEngineStateIssueTypes = new Set([
  'player_scout_state_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
])

const searchEngineStateIssueTypes = new Set([
  'search_index_mismatch',
  'search_index_scout_projection_mismatch',
])

const getEngineRefreshFields = ({ issue, scope, expectedState }) => {
  const stateFields = unique(
    (Array.isArray(issue?.mismatchedFields) ? issue.mismatchedFields : [])
      .filter(field => ENGINE_REFRESH_STATE_FIELDS.includes(field))
  )
  const verificationFields = (
    scope === 'player' &&
    Array.isArray(issue?.mismatchedFields) &&
    issue.mismatchedFields.includes(ENGINE_REFRESH_VERIFICATION_FIELD) &&
    isPlainObject(expectedState) &&
    Object.prototype.hasOwnProperty.call(
      expectedState,
      ENGINE_REFRESH_VERIFICATION_FIELD
    )
  )
    ? [ENGINE_REFRESH_VERIFICATION_FIELD]
    : []
  const refreshFields = unique([
    ...stateFields,
    ...verificationFields,
  ])

  if (
    scope === 'team' &&
    (
      issue?.type === 'birth_team_mismatch' ||
      issue?.type === 'birth_team_reliability_mismatch'
    )
  ) {
    return unique([
      ...refreshFields,
      'scoutProfiles',
      'scoutCombinations',
    ])
  }

  if (
    scope === 'player' &&
    (
      issue?.type === 'player_document_mismatch' ||
      issue?.type === 'player_document_reliability_mismatch'
    )
  ) {
    return unique([
      ...refreshFields,
      'scoutProfiles',
      'scoutCombinations',
    ])
  }

  return refreshFields
}

const buildEngineSeasonTarget = ({
  issue,
  row,
  fields,
  expectedState,
  expectedProfiles,
  expectedCombinations,
}) => ({
  playerId: clean(issue.playerId || row.playerId),
  playerDocumentId: clean(
    issue.playerDocumentId ||
    row.playerDocumentId ||
    row.resolvedPlayerDocumentId
  ),
  externalPlayerId: clean(issue.externalPlayerId || row.externalPlayerId),
  identityKey: clean(issue.identityKey || row.identityKey),
  normalizedName: clean(issue.normalizedName || row.normalizedName),
  fullName: clean(issue.fullName || row.fullName),
  seasonKey: seasonKeyOf(issue),
  sourceTarget: clean(row.sourceTarget) === 'history' ? 'history' : 'current',
  teamDocumentId: clean(
    issue.teamDocumentId || row.teamDocumentId || row.birthTeamDocumentId
  ),
  birthTeamDocumentId: clean(
    row.birthTeamDocumentId || issue.teamDocumentId
  ),
  fields,
  expectedState,
  expectedProfiles: Array.isArray(expectedProfiles) ? expectedProfiles : [],
  expectedCombinations: Array.isArray(expectedCombinations)
    ? expectedCombinations
    : [],
})

const mergeEngineSeasonTarget = ({ current, next }) => ({
  ...current,
  ...next,
  fields: unique([
    ...(Array.isArray(current?.fields) ? current.fields : []),
    ...(Array.isArray(next?.fields) ? next.fields : []),
  ]),
})

const buildTeamEngineRefreshTargets = audit => {
  const targetsByDocument = new Map()

  ;(Array.isArray(audit?.issues) ? audit.issues : [])
    .filter(issue => teamEngineStateIssueTypes.has(issue?.type))
    .forEach(issue => {
      const row = findAuditRowForIssue({ audit, issue })
      if (!row || !isPlainObject(row.expectedTeamScoutState)) return

      const fields = getEngineRefreshFields({
        issue,
        scope: 'team',
        expectedState: row.expectedTeamScoutState,
      })
      if (!fields.length) return

      const teamDocumentId = clean(
        issue.teamDocumentId || row.teamDocumentId || row.birthTeamDocumentId
      )
      if (!teamDocumentId) return

      const target = buildEngineSeasonTarget({
        issue,
        row,
        fields,
        expectedState: row.expectedTeamScoutState,
        expectedProfiles: row.expectedTeamScoutProfiles,
        expectedCombinations: row.expectedTeamScoutCombinations,
      })
      const identity = (
        target.playerId ||
        target.playerDocumentId ||
        target.externalPlayerId ||
        target.identityKey ||
        target.normalizedName
      )
      if (!identity || !target.seasonKey) return

      const key = [
        target.sourceTarget,
        target.seasonKey,
        identity,
      ].join('::')
      const currentDocument = targetsByDocument.get(teamDocumentId) || {
        teamDocumentId,
        seasonsByKey: new Map(),
      }
      const currentTarget = currentDocument.seasonsByKey.get(key)

      currentDocument.seasonsByKey.set(
        key,
        currentTarget
          ? mergeEngineSeasonTarget({
              current: currentTarget,
              next: target,
            })
          : target
      )
      targetsByDocument.set(teamDocumentId, currentDocument)
    })

  return [...targetsByDocument.values()].map(target => ({
    teamDocumentId: target.teamDocumentId,
    seasons: [...target.seasonsByKey.values()],
  }))
}

const buildPlayerEngineRefreshTargets = audit => {
  const targetsByDocument = new Map()

  ;(Array.isArray(audit?.issues) ? audit.issues : [])
    .filter(issue => playerEngineStateIssueTypes.has(issue?.type))
    .forEach(issue => {
      const row = findAuditRowForIssue({ audit, issue })
      const fields = getEngineRefreshFields({
        issue,
        scope: 'player',
        expectedState: row?.expectedPlayerScoutState,
      })
      if (!fields.length) return

      const playerDocumentId = clean(
        issue.playerDocumentId ||
        row?.playerDocumentId ||
        row?.resolvedPlayerDocumentId
      )

      if (
        !row ||
        !playerDocumentId ||
        !isPlainObject(row.expectedPlayerScoutState)
      ) {
        return
      }

      const target = buildEngineSeasonTarget({
        issue,
        row,
        fields,
        expectedState: row.expectedPlayerScoutState,
        expectedProfiles: row.expectedPlayerScoutProfiles,
        expectedCombinations: row.expectedPlayerScoutCombinations,
      })
      const key = [
        target.sourceTarget,
        target.seasonKey,
        target.birthTeamDocumentId || target.teamDocumentId,
      ].join('::')
      const currentDocument = targetsByDocument.get(playerDocumentId) || {
        playerDocumentId,
        seasonsByKey: new Map(),
      }
      const currentTarget = currentDocument.seasonsByKey.get(key)

      currentDocument.seasonsByKey.set(
        key,
        currentTarget
          ? mergeEngineSeasonTarget({
              current: currentTarget,
              next: target,
            })
          : target
      )
      targetsByDocument.set(playerDocumentId, currentDocument)
    })

  return [...targetsByDocument.values()].map(target => ({
    playerDocumentId: target.playerDocumentId,
    seasons: [...target.seasonsByKey.values()],
  }))
}

const buildSearchEngineRefreshTargets = audit => {
  const targets = new Map()

  ;(Array.isArray(audit?.issues) ? audit.issues : [])
    .filter(issue => searchEngineStateIssueTypes.has(issue?.type))
    .forEach(issue => {
      const row = findAuditRowForIssue({ audit, issue })
      const searchIndexDocumentId = clean(row?.searchIndexDocumentId)

      if (
        !row ||
        !searchIndexDocumentId ||
        !isPlainObject(row.expectedSearchIndexScoutFields)
      ) {
        return
      }

      targets.set(searchIndexDocumentId, {
        searchIndexDocumentId,
        playerId: clean(row.playerId),
        playerDocumentId: clean(
          row.playerDocumentId || row.resolvedPlayerDocumentId
        ),
        seasonKey: seasonKeyOf(row),
        teamDocumentId: clean(row.teamDocumentId),
        expectedFields: row.expectedSearchIndexScoutFields,
      })
    })

  return [...targets.values()]
}

const findSeasonIndexForEngineRefresh = ({ seasons, target }) => {
  const source = Array.isArray(seasons) ? seasons : []
  const exact = source
    .map((season, index) => ({ season, index }))
    .filter(({ season }) => (
      sameSeason({ season, seasonKey: target.seasonKey }) &&
      clean(
        season.birthTeamDocumentId ||
        season.teamDocumentId ||
        season.birthTeamId
      ) === clean(
        target.birthTeamDocumentId || target.teamDocumentId
      )
    ))

  if (exact.length === 1) return exact[0].index
  if (exact.length > 1) return -1

  const bySeason = source
    .map((season, index) => ({ season, index }))
    .filter(({ season }) => sameSeason({ season, seasonKey: target.seasonKey }))

  return bySeason.length === 1 ? bySeason[0].index : -1
}

const patchEngineComputedState = ({ source, target }) => {
  const next = { ...source }

  target.fields.forEach(field => {
    if (field === 'scoutProfiles') {
      next.scoutProfiles = stripUndefined(target.expectedProfiles)
      return
    }

    if (field === 'scoutCombinations') {
      next.scoutCombinations = stripUndefined(target.expectedCombinations)
      return
    }

    if (!Object.prototype.hasOwnProperty.call(target.expectedState, field)) return
    next[field] = stripUndefined(target.expectedState[field])
  })

  return next
}

const patchTeamEngineComputedState = ({ data, target }) => {
  const current = Array.isArray(data.current) ? [...data.current] : []
  const history = Array.isArray(data.history) ? [...data.history] : []
  let playerStatesUpdated = 0
  let ambiguousTargets = 0

  target.seasons.forEach(seasonTarget => {
    const seasons = seasonTarget.sourceTarget === 'history'
      ? history
      : current
    const seasonIndex = findSeasonIndexForEngineRefresh({
      seasons,
      target: seasonTarget,
    })

    if (seasonIndex < 0) {
      ambiguousTargets += 1
      return
    }

    const season = seasons[seasonIndex] || {}
    const players = Array.isArray(season.teamPlayers)
      ? [...season.teamPlayers]
      : []
    const matches = players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => samePlayer({
        player,
        row: seasonTarget,
      }))

    if (matches.length !== 1) {
      ambiguousTargets += 1
      return
    }

    const playerIndex = matches[0].index
    players[playerIndex] = patchEngineComputedState({
      source: players[playerIndex],
      target: seasonTarget,
    })
    seasons[seasonIndex] = {
      ...season,
      teamPlayers: players,
    }
    playerStatesUpdated += 1
  })

  return {
    current,
    history,
    playerStatesUpdated,
    ambiguousTargets,
  }
}

const buildEngineFieldCounts = ({ targets, nestedKey }) => {
  const fieldCounts = {}

  targets.forEach(target => {
    const nestedTargets = Array.isArray(target?.[nestedKey])
      ? target[nestedKey]
      : []

    nestedTargets.forEach(item => {
      ;(Array.isArray(item?.fields) ? item.fields : []).forEach(field => {
        fieldCounts[field] = Number(fieldCounts[field] || 0) + 1
      })
    })
  })

  return fieldCounts
}

const assertEngineRefreshReadSafety = readsMaximum => {
  if (readsMaximum > ENGINE_REFRESH_READ_SAFETY_LIMIT) {
    throw new Error(
      `Engine refresh requires up to ${readsMaximum} document reads, above the ` +
      `${ENGINE_REFRESH_READ_SAFETY_LIMIT} safety limit. No writes were started.`
    )
  }
}

export function buildPlayerScoutEngineRefreshPreview({ audit } = {}) {
  if (!audit) {
    throw new Error('Player scout engine refresh preview requires a source audit')
  }

  if (audit.repairDataIncluded !== true) {
    throw new Error(
      'Player scout engine refresh requires an audit created with includeRepairData: true'
    )
  }

  const teamTargets = buildTeamEngineRefreshTargets(audit)
  const playerTargets = buildPlayerEngineRefreshTargets(audit)
  const searchIndexTargets = buildSearchEngineRefreshTargets(audit)
  const readsMaximum = (
    teamTargets.length +
    playerTargets.length +
    searchIndexTargets.length
  )
  const writesMaximum = readsMaximum

  assertEngineRefreshReadSafety(readsMaximum)

  return {
    generatedAt: new Date().toISOString(),
    mode: 'engine-refresh-preview',
    order: [
      PLAYERS_DATABASE_COLLECTIONS.teams,
      PLAYERS_DATABASE_COLLECTIONS.players,
      PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    ],
    summary: {
      affectedTeamDocuments: teamTargets.length,
      affectedTeamPlayerStates: teamTargets.reduce(
        (sum, target) => sum + target.seasons.length,
        0
      ),
      affectedPlayerDocuments: playerTargets.length,
      affectedPlayerSeasons: playerTargets.reduce(
        (sum, target) => sum + target.seasons.length,
        0
      ),
      affectedSearchIndexes: searchIndexTargets.length,
      preservedHumanFields: [
        'tracking',
        'playerReview',
        'manualImmediacyDecision',
        'manualImmediacyHistory',
        'verification',
        'events',
        'scoutNarrative',
      ],
      teamFieldCounts: buildEngineFieldCounts({
        targets: teamTargets,
        nestedKey: 'seasons',
      }),
      playerFieldCounts: buildEngineFieldCounts({
        targets: playerTargets,
        nestedKey: 'seasons',
      }),
      searchIndexFieldCounts: searchIndexTargets.reduce((counts, target) => {
        Object.keys(target.expectedFields || {}).forEach(field => {
          counts[field] = Number(counts[field] || 0) + 1
        })
        return counts
      }, {}),
    },
    cost: {
      teamReadsMaximum: teamTargets.length,
      playerReadsMaximum: playerTargets.length,
      searchIndexReadsMaximum: searchIndexTargets.length,
      readsMaximum,
      teamWritesMaximum: teamTargets.length,
      playerWritesMaximum: playerTargets.length,
      searchIndexWritesMaximum: searchIndexTargets.length,
      writesMaximum,
      readSafety: {
        hardLimit: ENGINE_REFRESH_READ_HARD_LIMIT,
        safetyLimit: ENGINE_REFRESH_READ_SAFETY_LIMIT,
        remainingBudget: ENGINE_REFRESH_READ_SAFETY_LIMIT - readsMaximum,
      },
    },
    targets: {
      teams: teamTargets,
      players: playerTargets,
      searchIndexes: searchIndexTargets,
    },
  }
}

const applyTeamEngineRefreshTarget = async target => {
  const teamRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.teams,
    target.teamDocumentId
  )

  return trackedRunTransaction(
    db,
    async transaction => {
      const snapshot = await transaction.get(teamRef)

      if (!snapshot.exists()) {
        return {
          teamDocumentId: target.teamDocumentId,
          updated: false,
          skipped: 'missing_team_document',
          playerStatesUpdated: 0,
        }
      }

      const data = snapshot.data() || {}
      const patched = patchTeamEngineComputedState({
        data,
        target,
      })

      if (!patched.playerStatesUpdated) {
        return {
          teamDocumentId: target.teamDocumentId,
          updated: false,
          skipped: patched.ambiguousTargets
            ? 'team_player_not_uniquely_matched'
            : 'no_changes',
          playerStatesUpdated: 0,
        }
      }

      transaction.set(teamRef, {
        current: patched.current,
        history: patched.history,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      return {
        teamDocumentId: target.teamDocumentId,
        updated: true,
        playerStatesUpdated: patched.playerStatesUpdated,
        ambiguousTargets: patched.ambiguousTargets,
      }
    },
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.teams,
      action: 'playerScoutEngineRefresh-updateTeam',
      operationSubtype: 'maintenance-transaction',
    }
  )
}

const applyPlayerEngineRefreshTarget = async target => {
  const playerRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.players,
    target.playerDocumentId
  )

  return trackedRunTransaction(
    db,
    async transaction => {
      const snapshot = await transaction.get(playerRef)

      if (!snapshot.exists()) {
        return {
          playerDocumentId: target.playerDocumentId,
          updated: false,
          skipped: 'missing_player_document',
          seasonsUpdated: 0,
        }
      }

      const data = snapshot.data() || {}
      const current = Array.isArray(data.current) ? [...data.current] : []
      const history = Array.isArray(data.history) ? [...data.history] : []
      let seasonsUpdated = 0
      let ambiguousTargets = 0

      target.seasons.forEach(seasonTarget => {
        let container = current
        let index = findSeasonIndexForEngineRefresh({
          seasons: current,
          target: seasonTarget,
        })

        if (index < 0) {
          container = history
          index = findSeasonIndexForEngineRefresh({
            seasons: history,
            target: seasonTarget,
          })
        }

        if (index < 0) {
          ambiguousTargets += 1
          return
        }

        container[index] = patchEngineComputedState({
          source: container[index],
          target: seasonTarget,
        })
        seasonsUpdated += 1
      })

      if (!seasonsUpdated) {
        return {
          playerDocumentId: target.playerDocumentId,
          updated: false,
          skipped: ambiguousTargets
            ? 'season_not_uniquely_matched'
            : 'no_changes',
          seasonsUpdated: 0,
        }
      }

      transaction.set(playerRef, {
        current,
        history,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      return {
        playerDocumentId: target.playerDocumentId,
        updated: true,
        seasonsUpdated,
        ambiguousTargets,
      }
    },
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.players,
      action: 'playerScoutEngineRefresh-updatePlayer',
      operationSubtype: 'maintenance-transaction',
    }
  )
}

const applySearchIndexEngineRefreshTarget = async target => {
  const searchRef = doc(
    db,
    PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    target.searchIndexDocumentId
  )

  return trackedRunTransaction(
    db,
    async transaction => {
      const snapshot = await transaction.get(searchRef)

      if (!snapshot.exists()) {
        return {
          searchIndexDocumentId: target.searchIndexDocumentId,
          updated: false,
          skipped: 'missing_search_index',
        }
      }

      transaction.set(searchRef, {
        ...stripUndefined(target.expectedFields),
        updatedAt: serverTimestamp(),
      }, { merge: true })

      return {
        searchIndexDocumentId: target.searchIndexDocumentId,
        updated: true,
      }
    },
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerScoutEngineRefresh-updateSearchIndex',
      operationSubtype: 'maintenance-transaction',
    }
  )
}

const summarizeEngineRefreshResults = ({
  teamResults,
  playerResults,
  searchIndexResults,
}) => ({
  teamDocumentsUpdated: teamResults.filter(result => result.updated).length,
  teamPlayerStatesUpdated: teamResults.reduce(
    (sum, result) => sum + Number(result.playerStatesUpdated || 0),
    0
  ),
  playerDocumentsUpdated: playerResults.filter(result => result.updated).length,
  playerSeasonsUpdated: playerResults.reduce(
    (sum, result) => sum + Number(result.seasonsUpdated || 0),
    0
  ),
  searchIndexesUpdated: searchIndexResults.filter(result => result.updated).length,
  skipped: [
    ...teamResults,
    ...playerResults,
    ...searchIndexResults,
  ].filter(result => !result.updated).length,
})

export async function applyPlayerScoutEngineRefresh({
  confirmed = false,
  audit,
} = {}) {
  if (!confirmed) {
    throw new Error('Player scout engine refresh requires explicit confirmation')
  }

  const preview = buildPlayerScoutEngineRefreshPreview({ audit })
  assertEngineRefreshReadSafety(preview.cost.readsMaximum)

  const teamResults = []
  const playerResults = []
  const searchIndexResults = []

  try {
    for (const target of preview.targets.teams) {
      teamResults.push(await applyTeamEngineRefreshTarget(target))
    }

    for (const target of preview.targets.players) {
      playerResults.push(await applyPlayerEngineRefreshTarget(target))
    }

    for (const target of preview.targets.searchIndexes) {
      searchIndexResults.push(await applySearchIndexEngineRefreshTarget(target))
    }
  } catch (error) {
    const progress = summarizeEngineRefreshResults({
      teamResults,
      playerResults,
      searchIndexResults,
    })

    error.engineRefreshProgress = {
      ...progress,
      plannedReadsMaximum: preview.cost.readsMaximum,
      plannedWritesMaximum: preview.cost.writesMaximum,
    }
    throw error
  }

  const summary = summarizeEngineRefreshResults({
    teamResults,
    playerResults,
    searchIndexResults,
  })

  return {
    generatedAt: new Date().toISOString(),
    mode: 'engine-refresh-apply',
    order: preview.order,
    summary,
    cost: preview.cost,
    teamResults,
    playerResults,
    searchIndexResults,

    // Backward-compatible UI fields.
    playerDocumentsUpdated: summary.playerDocumentsUpdated,
    playerSeasonsUpdated: summary.playerSeasonsUpdated,
    skippedDocuments: summary.skipped,
  }
}

export async function applyPlayerScoutRepair({
  confirmed = false,
  audit: sourceAudit,
  selectedIssueIds,
  verifySelected = true,
  verificationReadSafetyLimit,
} = {}) {
  if (!confirmed) {
    throw new Error('Player scout repair requires explicit confirmation')
  }

  if (!sourceAudit) {
    throw new Error('Player scout repair requires a source audit')
  }

  const selection = buildPlayerScoutRepairSelection({
    audit: sourceAudit,
    selectedIssueIds,
  })
  const split = splitSelectedDirectRepairIssues({
    selection,
  })
  const audit = buildRepairAuditWithIssues({
    audit: selection.audit,
    issues: split.legacyIssues,
  })
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
  const directSearchIndexResult = await repairSearchIndexIssuesDirect({
    issues: split.directIssues,
  })
  const results = []
  const repairedTeamDocumentIds = []
  const schemaRepair = await repairPlayerSchemaIssues({
    audit,
    issues: schemaIssues,
  })
  const schemaResults = Array.isArray(schemaRepair?.results)
    ? schemaRepair.results
    : []
  const schemaTelemetry = schemaRepair?.telemetry || {}

  for (const teamDocumentId of teamDocumentIds) {
    const rows = affectedRows.filter(row => (
      teamDocumentIdOf(row) === teamDocumentId
    ))
    const repaired = await repairTeamDocument({
      teamDocumentId,
      rows,
    })
    if (repaired.updated) repairedTeamDocumentIds.push(teamDocumentId)

    for (const scope of repaired.repairedScopes) {
      results.push(await syncScope({
        team: repaired.team,
        scope,
      }))
    }
  }

  const migrationPlan = buildPlayerScoutMigrationPlan({
    issues: selection.selectedIssues,
  })
  const targetedVerification = (
    selection.mode === 'selected' &&
    verifySelected !== false
  )
    ? await verifySelectedPlayerScoutRepair({
        selectedIssues: selection.selectedIssues,
        readSafetyLimit: verificationReadSafetyLimit,
      })
    : {
        executed: false,
        reason: selection.mode === 'selected'
          ? 'verification_disabled'
          : 'legacy_full_repair_mode',
        scopesCount: 0,
        selectedIssuesCount: selection.summary.selectedIssuesCount,
        verifiedIssuesCount: 0,
        remainingIssuesCount: 0,
        remainingIssueIds: [],
        scopes: [],
      }

  const verificationScopes = unique([
    ...results.map(result => [
      clean(result.teamDocumentId),
      clean(result.seasonKey),
    ].join('::')),
    ...schemaIssues.map(issue => [
      clean(issue.teamDocumentId),
      clean(issue.seasonKey || issue.seasonId),
    ].join('::')),
  ])
    .map(scopeKey => {
      const [teamDocumentId, seasonKey] = scopeKey.split('::')
      return { teamDocumentId, seasonKey }
    })
    .filter(scope => scope.teamDocumentId && scope.seasonKey)

  return {
    generatedAt: new Date().toISOString(),
    mode: 'apply',
    selection: {
      mode: selection.mode,
      selectedIssueIds: selection.selectedIssueIds,
      ...selection.summary,
    },
    directSearchIndex: directSearchIndexResult,
    migrationPlan,
    targetedVerification,
    schemaIssuesByType: schemaTelemetry.schemaIssuesByType || {},
    schemaIssuesMissingPlayerDocumentId: Array.isArray(
      schemaTelemetry.schemaIssuesMissingPlayerDocumentId
    )
      ? schemaTelemetry.schemaIssuesMissingPlayerDocumentId
      : [],
    schemaIssuesGroupedByPlayerDocumentId: Array.isArray(
      schemaTelemetry.schemaIssuesGroupedByPlayerDocumentId
    )
      ? schemaTelemetry.schemaIssuesGroupedByPlayerDocumentId
      : [],
    schemaResultsCount: Number(schemaTelemetry.schemaResultsCount || 0),
    teamDocumentsUpdated: unique(repairedTeamDocumentIds).length,
    teamDocumentIdsUpdated: unique(repairedTeamDocumentIds),
    playerSchemaDocumentsUpdated: schemaResults.filter(
      result => result.updated
    ).length,
    playerSchemaDocumentIdsUpdated: unique(
      schemaResults
        .filter(result => result.updated)
        .map(result => result.playerDocumentId)
    ),
    playerSchemaDiagnostics: schemaResults.flatMap(result => (
      Array.isArray(result?.diagnostics) ? result.diagnostics : []
    )),
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
    playerDocumentIdsWritten: unique(
      results.flatMap(result => (
        Array.isArray(result.playerDocs?.writtenPlayerDocumentIds)
          ? result.playerDocs.writtenPlayerDocumentIds
          : []
      ))
    ),
    searchIndexDocumentIdsWritten: unique([
      ...results.flatMap(result => (
        Array.isArray(result.searchIndex?.writtenSearchIndexDocumentIds)
          ? result.searchIndex.writtenSearchIndexDocumentIds
          : []
      )),
      ...(Array.isArray(directSearchIndexResult?.results)
        ? directSearchIndexResult.results
          .filter(result => result?.changed === true)
          .map(result => clean(result.searchIndexDocumentId))
          .filter(Boolean)
        : []),
    ]),
    writeOperations: {
      teams: unique(repairedTeamDocumentIds).length,
      playerSchemas: schemaResults.filter(result => result.updated).length,
      players: results.reduce((sum, result) => (
        sum + (Array.isArray(result.playerDocs?.writtenPlayerDocumentIds)
          ? result.playerDocs.writtenPlayerDocumentIds.length
          : 0)
      ), 0),
      searchIndexes: results.reduce((sum, result) => (
        sum + Number(result.searchIndex?.rowsCount || 0)
      ), 0) + Number(directSearchIndexResult?.writes || 0),
    },
    verificationScopes,
    results,
  }
}
