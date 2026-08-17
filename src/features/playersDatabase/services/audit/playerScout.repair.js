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
  resolvePlayerTrackingReasons,
} from '../write/players/scoutingPlayerLifecycle.model.js'
import {
  normalizeScoutingPlayerVerification,
} from '../write/players/scoutingPlayerVerification.model.js'
import { buildPlayerScoutStatsLoadMeasurementHistory } from '../../model/playerScoutMeasurement.model.js'
import { buildPlayerBaseDoc } from '../write/players/playerDoc.model.js'
import { buildPlayerSeasonDoc } from '../write/players/playerSeason.model.js'
import { normalizeTeamPlayer } from '../write/teams/teamSeason.model.js'
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
  ])
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
    const rootIssues = issues.filter(issue => clean(issue.schemaScope) === 'root')

    if (rootIssues.length) {
      const rootRepairFields = new Set(
        rootIssues.flatMap(issue => ([
          ...(Array.isArray(issue.missingFields) ? issue.missingFields : []),
          ...(Array.isArray(issue.invalidTypes) ? issue.invalidTypes : []),
        ]))
      )
      const baseDoc = buildPlayerBaseDoc({
        ...data,
        playerDocumentId,
      }, data)

      rootRepairFields.forEach(field => {
        if (field.includes('.')) return
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
        if (issue.type !== 'player_schema_outdated') return false
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

      targetIssues.forEach(issue => {
        const row = findAuditRowForIssue({ audit, issue })
        const seasonIndex = findSchemaSeasonIndex({
          seasons,
          issue,
          row,
        })
        if (seasonIndex === -1) return

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
    source: 'genericObjects.catalog.js',
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
    source: 'genericObjects.catalog.js',
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
    source: 'genericObjects.catalog.js + Team projection',
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
        issue.type === 'search_index_season_status_mismatch'
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
    nonRepairableSchemaIssues: countNonRepairableSchemaIssues(audit),
    measurementIssues: audit.summary.measurementIssuesCount || 0,
    trackingIssues: audit.summary.trackingIssuesCount || 0,
    projectionIssues: audit.summary.projectionIssuesCount || 0,
    stateIssues: audit.summary.stateIssuesCount || 0,
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
    sourceOfTruth: {
      operational: PLAYERS_DATABASE_COLLECTIONS.teams,
      scoutProfiles: PLAYERS_DATABASE_COLLECTIONS.players,
      projection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      schema: 'genericObjects.catalog.js',
    },
    summary: buildPreviewSummary({
      audit,
      affectedRows,
    }),
    cost: buildPlayerScoutRepairCost({
      audit,
      affectedRows,
      schemaIssues,
    }),
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

    return {
      ...player,
      ...normalizedPlayer,
    }
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
  const playerDocumentPlayers = playersForRows({
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
  'scoutSpotlights',
  'scoutOpportunity',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutTrajectory',
  'scoutTransferContext',
  'scoutEngineVersion',
]

const engineStateIssueTypes = new Set([
  'player_scout_state_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
])

const playerDocumentIdOf = row => clean(
  row?.playerDocumentId || row?.sourceDocumentId
)

const getEngineRefreshIssues = audit => (
  (Array.isArray(audit?.issues) ? audit.issues : [])
    .filter(issue => engineStateIssueTypes.has(issue?.type))
)

const getEngineRefreshFields = issue => {
  const stateFields = unique(
    (Array.isArray(issue?.mismatchedFields) ? issue.mismatchedFields : [])
      .filter(field => ENGINE_REFRESH_STATE_FIELDS.includes(field))
  )

  if (
    issue?.type === 'player_document_mismatch' ||
    issue?.type === 'player_document_reliability_mismatch'
  ) {
    return unique([
      ...stateFields,
      'scoutProfiles',
      'scoutCombinations',
    ])
  }

  return stateFields
}

const buildEngineRefreshTargets = audit => {
  const targetsByDocument = new Map()

  getEngineRefreshIssues(audit).forEach(issue => {
    const fields = getEngineRefreshFields(issue)
    if (!fields.length) return

    const row = findAuditRowForIssue({ audit, issue })
    const playerDocumentId = clean(
      issue.playerDocumentId || row?.playerDocumentId
    )

    if (!row || !playerDocumentId || !isPlainObject(row.expectedPlayerScoutState)) {
      return
    }

    const current = targetsByDocument.get(playerDocumentId) || {
      playerDocumentId,
      seasonsByKey: new Map(),
    }
    const seasonKey = seasonKeyOf(issue)
    const teamDocumentId = clean(
      issue.teamDocumentId || row.teamDocumentId || row.birthTeamDocumentId
    )
    const birthTeamDocumentId = clean(
      row.birthTeamDocumentId || issue.teamDocumentId
    )
    const targetKey = [
      seasonKey,
      birthTeamDocumentId || teamDocumentId,
    ].join('::')
    const existing = current.seasonsByKey.get(targetKey) || {
      playerId: clean(issue.playerId || row.playerId),
      seasonKey,
      teamDocumentId,
      birthTeamDocumentId,
      fields: [],
      expectedState: row.expectedPlayerScoutState,
      expectedProfiles: Array.isArray(row.expectedPlayerScoutProfiles)
        ? row.expectedPlayerScoutProfiles
        : [],
      expectedCombinations: Array.isArray(row.expectedPlayerScoutCombinations)
        ? row.expectedPlayerScoutCombinations
        : [],
    }

    current.seasonsByKey.set(targetKey, {
      ...existing,
      fields: unique([...existing.fields, ...fields]),
    })
    targetsByDocument.set(playerDocumentId, current)
  })

  return [...targetsByDocument.values()].map(target => ({
    playerDocumentId: target.playerDocumentId,
    seasons: [...target.seasonsByKey.values()],
  }))
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

const patchEngineComputedState = ({ season, target }) => {
  const next = { ...season }

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

export function buildPlayerScoutEngineRefreshPreview({ audit } = {}) {
  if (!audit) {
    throw new Error('Player scout engine refresh preview requires a source audit')
  }

  if (audit.repairDataIncluded !== true) {
    throw new Error(
      'Player scout engine refresh requires an audit created with includeRepairData: true'
    )
  }

  const targets = buildEngineRefreshTargets(audit)
  const fieldCounts = {}

  targets.forEach(target => {
    target.seasons.forEach(season => {
      season.fields.forEach(field => {
        fieldCounts[field] = Number(fieldCounts[field] || 0) + 1
      })
    })
  })

  return {
    generatedAt: new Date().toISOString(),
    mode: 'engine-refresh-preview',
    summary: {
      affectedPlayerDocuments: targets.length,
      affectedPlayerSeasons: targets.reduce(
        (sum, target) => sum + target.seasons.length,
        0
      ),
      preservedHumanFields: ['scoutVerification'],
      fieldCounts,
    },
    cost: {
      readsMaximum: targets.length,
      writesMaximum: targets.length,
    },
    targets,
  }
}

export async function applyPlayerScoutEngineRefresh({ confirmed = false, audit } = {}) {
  if (!confirmed) {
    throw new Error('Player scout engine refresh requires explicit confirmation')
  }

  const preview = buildPlayerScoutEngineRefreshPreview({ audit })
  const results = []

  for (const target of preview.targets) {
    const playerRef = doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.players,
      target.playerDocumentId
    )

    const result = await trackedRunTransaction(
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
            season: container[index],
            target: seasonTarget,
          })
          seasonsUpdated += 1
        })

        if (!seasonsUpdated) {
          return {
            playerDocumentId: target.playerDocumentId,
            updated: false,
            skipped: ambiguousTargets ? 'season_not_uniquely_matched' : 'no_changes',
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
          skipped: '',
          seasonsUpdated,
          ambiguousTargets,
        }
      },
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'playerScoutEngineRefresh',
        operationSubtype: 'maintenance-transaction',
      }
    )

    results.push(result)
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: 'engine-refresh-apply',
    playerDocumentsUpdated: results.filter(result => result.updated).length,
    playerSeasonsUpdated: results.reduce(
      (sum, result) => sum + Number(result.seasonsUpdated || 0),
      0
    ),
    skippedDocuments: results.filter(result => !result.updated).length,
    preservedHumanFields: ['scoutVerification'],
    results,
  }
}

export async function applyPlayerScoutRepair({ confirmed = false, audit: sourceAudit } = {}) {
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
  const repairedTeamDocumentIds = []
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
    if (repaired.updated) repairedTeamDocumentIds.push(teamDocumentId)

    for (const scope of repaired.repairedScopes) {
      results.push(await syncScope({
        team: repaired.team,
        scope,
      }))
    }
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
    teamDocumentsUpdated: unique(repairedTeamDocumentIds).length,
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
    verificationScopes,
    results,
  }
}
