// src/features/playersDatabase/services/audit/playerScoutRepair.verification.js

import { doc } from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
} from '../../../../services/firestore/usage/index.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import {
  normalizeSeasonLookupKey,
} from '../../model/season.model.js'
import {
  canDirectRepairSearchIndexIssue,
} from './playerScoutSearchIndex.directRepair.js'
import {
  buildPlayerScoutSchemaIssueState,
  buildScopedPlayerScoutRulesAudit,
} from './playerScoutRules.audit.js'
import {
  PLAYER_DOCUMENT_SCHEMA_SCOPES,
} from './playerDocumentMigration.policy.js'
import {
  normalizeScoutingPlayerTracking,
} from '../write/players/scoutingPlayerLifecycle.model.js'

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

const normalizeComparableValue = value => {
  if (value === undefined) return null

  if (Array.isArray(value)) return value.map(normalizeComparableValue)

  if (
    value &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const sameValue = (left, right) => (
  JSON.stringify(normalizeComparableValue(left)) ===
  JSON.stringify(normalizeComparableValue(right))
)

const scopeKeyOf = issue => [
  clean(issue?.teamDocumentId),
  clean(issue?.seasonKey || issue?.seasonId),
].join('::')

const playerKeys = issue => unique([
  issue?.playerDocumentId,
  issue?.playerId,
  issue?.externalPlayerId,
])


const TARGETED_DOCUMENT_ISSUE_TYPES = new Set([
  'team_player_schema_outdated',
  'player_schema_outdated',
  'player_tracking_mismatch',
  'player_season_status_mismatch',
  'current_season_status_invalid',
  'history_season_status_invalid',
  'missing_player_document',
  'missing_search_index',
  'missing_team_search_index',
])

const issueCollectionAndDocumentId = issue => {
  const type = clean(issue?.type)

  if (
    type === 'team_player_schema_outdated' ||
    type === 'current_season_status_invalid' ||
    type === 'history_season_status_invalid'
  ) {
    return {
      collectionName: PLAYERS_DATABASE_COLLECTIONS.teams,
      documentId: clean(issue?.teamDocumentId),
    }
  }

  if (
    type === 'player_schema_outdated' ||
    type === 'player_tracking_mismatch' ||
    type === 'player_season_status_mismatch' ||
    type === 'missing_player_document'
  ) {
    return {
      collectionName: PLAYERS_DATABASE_COLLECTIONS.players,
      documentId: clean(issue?.playerDocumentId),
    }
  }

  if (
    type === 'missing_search_index' ||
    type === 'missing_team_search_index'
  ) {
    return {
      collectionName: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      documentId: clean(issue?.searchIndexDocumentId),
    }
  }

  return {
    collectionName: '',
    documentId: '',
  }
}

const canTargetedVerifyDocumentIssue = issue => {
  if (!TARGETED_DOCUMENT_ISSUE_TYPES.has(clean(issue?.type))) return false
  const target = issueCollectionAndDocumentId(issue)
  return Boolean(target.collectionName && target.documentId)
}

const seasonMatchesIssue = ({ season, issue } = {}) => (
  normalizeSeasonLookupKey(clean(season?.seasonKey || season?.seasonId)) ===
  normalizeSeasonLookupKey(clean(issue?.seasonKey || issue?.seasonId))
)

const seasonTeamIds = season => unique([
  season?.birthTeamDocumentId,
  season?.teamDocumentId,
  season?.sourceDocumentId,
  season?.birthTeamId,
  season?.teamId,
])

const issueTeamIds = issue => unique([
  issue?.birthTeamDocumentId,
  issue?.teamDocumentId,
  issue?.birthTeamId,
  issue?.teamId,
])

const expectedSourceTarget = issue => {
  const explicit = clean(issue?.sourceTarget)
  if (explicit === 'current' || explicit === 'history') return explicit
  if (clean(issue?.type) === 'current_season_status_invalid') return 'current'
  if (clean(issue?.type) === 'history_season_status_invalid') return 'history'
  return ''
}

const findSeasonInDocument = ({
  data,
  issue,
  collectionName,
  documentId,
} = {}) => {
  const requestedTarget = expectedSourceTarget(issue)
  const candidates = []

  for (const sourceTarget of ['current', 'history']) {
    if (requestedTarget && sourceTarget !== requestedTarget) continue

    const seasons = Array.isArray(data?.[sourceTarget])
      ? data[sourceTarget]
      : []

    seasons.forEach(season => {
      if (!seasonMatchesIssue({ season, issue })) return
      candidates.push({ sourceTarget, season })
    })
  }

  if (!candidates.length) return null

  const expectedTeamIds = issueTeamIds(issue)
  const expectedClubId = clean(issue?.clubId)
  const targetTeamMatches = (
    clean(collectionName) === clean(PLAYERS_DATABASE_COLLECTIONS.teams) &&
    expectedTeamIds.includes(clean(documentId))
  )

  const narrowed = candidates.filter(({ season }) => {
    const actualTeamIds = seasonTeamIds(season)
    const teamMatches = targetTeamMatches || (
      expectedTeamIds.length > 0 &&
      actualTeamIds.some(value => expectedTeamIds.includes(value))
    )
    const clubMatches = (
      expectedClubId && clean(season?.clubId) === expectedClubId
    )

    return Boolean(teamMatches || clubMatches)
  })

  return narrowed.length === 1 ? narrowed[0] : null
}

const samePlayerIdentity = ({ player, issue } = {}) => {
  const expectedKeys = playerKeys(issue)
  if (!expectedKeys.length) return false

  const actualKeys = unique([
    player?.playerDocumentId,
    player?.playerId,
    player?.externalPlayerId,
  ])

  return actualKeys.some(key => expectedKeys.includes(key))
}

const findTeamPlayerInDocument = ({
  data,
  issue,
  collectionName,
  documentId,
} = {}) => {
  const seasonResult = findSeasonInDocument({
    data,
    issue,
    collectionName,
    documentId,
  })
  if (!seasonResult) return null

  const teamPlayers = Array.isArray(seasonResult.season?.teamPlayers)
    ? seasonResult.season.teamPlayers
    : []
  const matchedPlayers = teamPlayers.filter(candidate => samePlayerIdentity({
    player: candidate,
    issue,
  }))

  if (matchedPlayers.length !== 1) return null

  return {
    ...seasonResult,
    player: matchedPlayers[0],
  }
}

const sortedCleanValues = values => unique(values).sort()

const targetedIssueStillExists = ({
  issue,
  snapshot,
  collectionName,
  documentId,
} = {}) => {
  const type = clean(issue?.type)

  if (type === 'missing_player_document') return !snapshot.exists()
  if (type === 'missing_search_index') return !snapshot.exists()
  if (type === 'missing_team_search_index') return !snapshot.exists()
  if (!snapshot.exists()) return true

  const data = snapshot.data() || {}

  if (type === 'player_schema_outdated') {
    if (clean(issue?.schemaScope) === 'root') {
      return buildPlayerScoutSchemaIssueState({
        scope: PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_ROOT,
        source: data,
      }).hasIssue
    }

    if (clean(issue?.schemaScope) === 'season') {
      const seasonResult = findSeasonInDocument({
        data,
        issue,
        collectionName,
        documentId,
      })
      if (!seasonResult) return true

      return buildPlayerScoutSchemaIssueState({
        scope: PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_SEASON,
        source: seasonResult.season,
      }).hasIssue
    }

    return true
  }

  if (type === 'team_player_schema_outdated') {
    const playerResult = findTeamPlayerInDocument({
      data,
      issue,
      collectionName,
      documentId,
    })
    if (!playerResult) return true

    return buildPlayerScoutSchemaIssueState({
      scope: PLAYER_DOCUMENT_SCHEMA_SCOPES.TEAM_PLAYER,
      source: playerResult.player,
    }).hasIssue
  }

  if (type === 'player_tracking_mismatch') {
    if (!Array.isArray(issue?.expectedTrackingReasons)) return true

    const expected = sortedCleanValues(issue.expectedTrackingReasons)
    const actual = sortedCleanValues(
      normalizeScoutingPlayerTracking(data?.tracking).trackingReasons
    )
    return !sameValue(actual, expected)
  }

  if (type === 'player_season_status_mismatch') {
    const seasonResult = findSeasonInDocument({
        data,
        issue,
        collectionName,
        documentId,
      })
    if (!seasonResult) return true
    return clean(seasonResult.season?.seasonStatus) !== clean(
      issue?.expectedSeasonStatus
    )
  }

  if (
    type === 'current_season_status_invalid' ||
    type === 'history_season_status_invalid'
  ) {
    const seasonResult = findSeasonInDocument({
        data,
        issue,
        collectionName,
        documentId,
      })
    if (!seasonResult) return true
    return clean(seasonResult.season?.seasonStatus) !== clean(
      issue?.expectedSeasonStatus
    )
  }

  return true
}

const verifyTargetedDocumentIssues = async ({
  issues = [],
} = {}) => {
  const safeIssues = Array.isArray(issues) ? issues : []
  const snapshotCache = new Map()
  const remainingIssueIds = []
  const failures = []
  let readsUsed = 0

  for (const issue of safeIssues) {
    const issueId = clean(issue?.issueId)
    const target = issueCollectionAndDocumentId(issue)
    const cacheKey = `${target.collectionName}::${target.documentId}`
    let snapshot = snapshotCache.get(cacheKey)

    if (!snapshot) {
      const ref = doc(db, target.collectionName, target.documentId)
      snapshot = await trackedGetDoc(ref, {
        feature: 'playersDatabase',
        collection: target.collectionName,
        action: 'playerScoutRepair-targetedVerification',
        operationSubtype: 'verification-read',
      })
      snapshotCache.set(cacheKey, snapshot)
      readsUsed += 1
    }

    const remains = targetedIssueStillExists({
      issue,
      snapshot,
      collectionName: target.collectionName,
      documentId: target.documentId,
    })

    if (!remains) continue

    remainingIssueIds.push(issueId)
    failures.push({
      issueId,
      verificationMode: 'TARGETED_DOCUMENT',
      collection: target.collectionName,
      documentId: target.documentId,
      reason: snapshot.exists()
        ? 'issueStillPresent'
        : 'documentMissing',
    })
  }

  const selectedIssueIds = unique(safeIssues.map(issue => issue?.issueId))
  const remainingIds = unique(remainingIssueIds)

  return {
    executed: Boolean(safeIssues.length),
    verificationMode: 'TARGETED_DOCUMENT',
    selectedCount: selectedIssueIds.length,
    coveredIssueIds: selectedIssueIds,
    verifiedCount: Math.max(
      0,
      selectedIssueIds.length - remainingIds.length
    ),
    remainingCount: remainingIds.length,
    readsUsed,
    remainingIssueIds: remainingIds,
    failures,
  }
}

const sameIssueScope = ({
  expected,
  actual,
} = {}) => {
  if (clean(expected?.type) !== clean(actual?.type)) return false
  if (scopeKeyOf(expected) !== scopeKeyOf(actual)) return false

  const expectedPlayers = playerKeys(expected)
  if (!expectedPlayers.length) return true

  return playerKeys(actual).some(value => expectedPlayers.includes(value))
}

const buildScopes = issues => unique(
  (Array.isArray(issues) ? issues : [])
    .map(scopeKeyOf)
    .filter(scopeKey => scopeKey && scopeKey !== '::')
).map(scopeKey => {
  const [teamDocumentId, seasonKey] = scopeKey.split('::')
  return {
    teamDocumentId,
    seasonKey,
  }
})

const buildDirectDocumentMetadataMismatch = ({
  issue,
  data,
} = {}) => {
  const writer = clean(issue?.repairData?.writer)
  const expectedEntityType = writer === 'DIRECT_TEAM_SEARCH_INDEX'
    ? 'birthTeamSeason'
    : 'playerSeason'

  if (clean(data?.entityType) !== expectedEntityType) {
    return {
      field: 'entityType',
      expected: expectedEntityType,
      actual: clean(data?.entityType),
    }
  }

  const teamDocumentId = clean(issue?.teamDocumentId)
  if (
    teamDocumentId &&
    clean(data?.teamDocumentId) !== teamDocumentId
  ) {
    return {
      field: 'teamDocumentId',
      expected: teamDocumentId,
      actual: clean(data?.teamDocumentId),
    }
  }

  const expectedSeason = normalizeSeasonLookupKey(
    clean(issue?.seasonKey || issue?.seasonId)
  )
  const actualSeason = normalizeSeasonLookupKey(
    clean(data?.seasonKey || data?.seasonId)
  )

  if (
    expectedSeason &&
    actualSeason !== expectedSeason
  ) {
    return {
      field: 'seasonKey',
      expected: expectedSeason,
      actual: actualSeason,
    }
  }

  if (writer !== 'DIRECT_PLAYER_SEARCH_INDEX') return null

  const expectedPlayerKeys = playerKeys(issue)
  if (!expectedPlayerKeys.length) return null

  const actualPlayerKeys = unique([
    data?.playerDocumentId,
    data?.playerId,
    data?.externalPlayerId,
  ])

  if (!actualPlayerKeys.some(value => expectedPlayerKeys.includes(value))) {
    return {
      field: 'playerIdentity',
      expected: expectedPlayerKeys,
      actual: actualPlayerKeys,
    }
  }

  return null
}

const verifyDirectSearchIndexIssues = async ({
  issues = [],
} = {}) => {
  const safeIssues = Array.isArray(issues) ? issues : []
  const snapshotCache = new Map()
  const failures = []
  const remainingIssueIds = []
  let readsUsed = 0
  let verifiedCount = 0

  for (const issue of safeIssues) {
    const issueId = clean(issue?.issueId)
    const searchIndexDocumentId = clean(issue?.searchIndexDocumentId)

    let snapshot = snapshotCache.get(searchIndexDocumentId)

    if (!snapshot) {
      const ref = doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        searchIndexDocumentId
      )
      snapshot = await trackedGetDoc(ref, {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
        action: 'playerScoutRepair-directVerification',
        operationSubtype: 'verification-read',
      })
      snapshotCache.set(searchIndexDocumentId, snapshot)
      readsUsed += 1
    }

    if (!snapshot.exists()) {
      remainingIssueIds.push(issueId)
      failures.push({
        issueId,
        searchIndexDocumentId,
        verificationMode: 'DIRECT_DOCUMENT',
        reason: 'searchIndexDocumentMissing',
        mismatchedFields: [],
        expected: issue?.repairData?.fields || {},
        actual: null,
      })
      continue
    }

    const data = snapshot.data() || {}
    const metadataMismatch = buildDirectDocumentMetadataMismatch({
      issue,
      data,
    })

    if (metadataMismatch) {
      remainingIssueIds.push(issueId)
      failures.push({
        issueId,
        searchIndexDocumentId,
        verificationMode: 'DIRECT_DOCUMENT',
        reason: 'metadataMismatch',
        mismatchedFields: [metadataMismatch.field],
        expected: {
          [metadataMismatch.field]: metadataMismatch.expected,
        },
        actual: {
          [metadataMismatch.field]: metadataMismatch.actual,
        },
      })
      continue
    }

    const fields = issue?.repairData?.fields || {}
    const mismatchedFields = Object.keys(fields).filter(field => (
      !sameValue(data[field], fields[field])
    ))

    if (mismatchedFields.length) {
      remainingIssueIds.push(issueId)
      failures.push({
        issueId,
        searchIndexDocumentId,
        verificationMode: 'DIRECT_DOCUMENT',
        reason: 'fieldsMismatch',
        mismatchedFields,
        expected: mismatchedFields.reduce((result, field) => {
          result[field] = fields[field]
          return result
        }, {}),
        actual: mismatchedFields.reduce((result, field) => {
          result[field] = data[field]
          return result
        }, {}),
      })
      continue
    }

    verifiedCount += 1
  }

  return {
    verificationMode: 'DIRECT_DOCUMENT',
    selectedCount: safeIssues.length,
    coveredIssueIds: unique(safeIssues.map(issue => issue?.issueId)),
    verifiedCount,
    remainingCount: remainingIssueIds.length,
    readsUsed,
    remainingIssueIds: unique(remainingIssueIds),
    failures,
  }
}

const verifyScopedAuditIssues = async ({
  issues = [],
  readSafetyLimit,
} = {}) => {
  const safeIssues = Array.isArray(issues) ? issues : []
  const coveredIssues = safeIssues.filter(issue => {
    const scopeKey = scopeKeyOf(issue)
    return Boolean(scopeKey && scopeKey !== '::')
  })
  const uncoveredIssues = safeIssues.filter(issue => (
    !coveredIssues.includes(issue)
  ))
  const scopes = buildScopes(coveredIssues)
  const uncoveredIssueIds = unique(
    uncoveredIssues.map(issue => issue?.issueId)
  )

  if (!safeIssues.length) {
    return {
      executed: false,
      verificationMode: 'SCOPED_AUDIT',
      selectedCount: 0,
      coveredIssueIds: [],
      verifiedCount: 0,
      remainingCount: 0,
      readsUsed: 0,
      remainingIssueIds: [],
      scopes: [],
      failures: [],
    }
  }

  const scopeResults = []

  for (const scope of scopes) {
    const audit = await buildScopedPlayerScoutRulesAudit({
      ...scope,
      includeRepairData: false,
      ...(readSafetyLimit !== undefined
        ? { readSafetyLimit }
        : {}),
    })

    const selectedInScope = coveredIssues.filter(issue => (
      scopeKeyOf(issue) === [
        scope.teamDocumentId,
        scope.seasonKey,
      ].join('::')
    ))
    const remaining = selectedInScope.filter(selectedIssue => (
      (Array.isArray(audit?.issues) ? audit.issues : []).some(actualIssue => (
        sameIssueScope({
          expected: selectedIssue,
          actual: actualIssue,
        })
      ))
    ))

    scopeResults.push({
      ...scope,
      selectedIssuesCount: selectedInScope.length,
      remainingIssuesCount: remaining.length,
      remainingIssueIds: remaining.map(issue => clean(issue.issueId)),
      readsUsed: Number(audit?.cost?.readSafety?.readsUsed) || 0,
      readSafetyLimit: Number(audit?.cost?.readSafety?.safetyLimit) || null,
      coverage: audit?.contract?.coverage || null,
    })
  }

  const remainingIssueIds = unique([
    ...uncoveredIssueIds,
    ...scopeResults.flatMap(scope => scope.remainingIssueIds),
  ])
  const selectedIssueIds = unique(
    safeIssues.map(issue => issue.issueId)
  )
  const coveredIssueIds = unique(
    coveredIssues.map(issue => issue.issueId)
  )

  return {
    executed: Boolean(scopes.length),
    verificationMode: 'SCOPED_AUDIT',
    selectedCount: selectedIssueIds.length,
    coveredIssueIds,
    verifiedCount: Math.max(
      0,
      coveredIssueIds.length - unique(
        scopeResults.flatMap(scope => scope.remainingIssueIds)
      ).length
    ),
    remainingCount: remainingIssueIds.length,
    readsUsed: scopeResults.reduce(
      (sum, scope) => sum + Number(scope.readsUsed || 0),
      0
    ),
    remainingIssueIds,
    scopes: scopeResults,
    failures: uncoveredIssueIds.map(issueId => ({
      issueId,
      verificationMode: 'SCOPED_AUDIT',
      reason: 'verificationScopeMissing',
    })),
  }
}

export const verifySelectedPlayerScoutRepair = async ({
  selectedIssues = [],
  readSafetyLimit,
} = {}) => {
  const issues = Array.isArray(selectedIssues)
    ? selectedIssues
    : []

  if (!issues.length) {
    return {
      executed: false,
      reason: 'no_selected_issues',
      verificationMode: 'NONE',
      scopesCount: 0,
      selectedIssuesCount: 0,
      verifiedIssuesCount: 0,
      remainingIssuesCount: 0,
      remainingIssueIds: [],
      coveredIssueIds: [],
      verifiedIssueIds: [],
      readsUsed: 0,
      failures: [],
      directDocument: {
        verificationMode: 'DIRECT_DOCUMENT',
        selectedCount: 0,
        coveredIssueIds: [],
        verifiedCount: 0,
        remainingCount: 0,
        readsUsed: 0,
        remainingIssueIds: [],
        failures: [],
      },
      targetedDocument: {
        executed: false,
        verificationMode: 'TARGETED_DOCUMENT',
        selectedCount: 0,
        coveredIssueIds: [],
        verifiedCount: 0,
        remainingCount: 0,
        readsUsed: 0,
        remainingIssueIds: [],
        failures: [],
      },
      scopedAudit: {
        executed: false,
        verificationMode: 'SCOPED_AUDIT',
        selectedCount: 0,
        coveredIssueIds: [],
        verifiedCount: 0,
        remainingCount: 0,
        readsUsed: 0,
        remainingIssueIds: [],
        scopes: [],
      },
      scopes: [],
    }
  }

  const directIssues = issues.filter(canDirectRepairSearchIndexIssue)
  const targetedIssues = issues.filter(issue => (
    !canDirectRepairSearchIndexIssue(issue) &&
    canTargetedVerifyDocumentIssue(issue)
  ))
  const scopedIssues = issues.filter(issue => (
    !canDirectRepairSearchIndexIssue(issue) &&
    !canTargetedVerifyDocumentIssue(issue)
  ))

  const directDocument = await verifyDirectSearchIndexIssues({
    issues: directIssues,
  })
  const targetedDocument = await verifyTargetedDocumentIssues({
    issues: targetedIssues,
  })
  const scopedAudit = await verifyScopedAuditIssues({
    issues: scopedIssues,
    readSafetyLimit,
  })

  const remainingIssueIds = unique([
    ...directDocument.remainingIssueIds,
    ...targetedDocument.remainingIssueIds,
    ...scopedAudit.remainingIssueIds,
  ])
  const selectedIssueIds = unique(
    issues.map(issue => issue.issueId)
  )
  const verificationModes = [
    directIssues.length ? 'DIRECT_DOCUMENT' : '',
    targetedIssues.length ? 'TARGETED_DOCUMENT' : '',
    scopedIssues.length ? 'SCOPED_AUDIT' : '',
  ].filter(Boolean)
  const verificationMode = verificationModes.length > 1
    ? 'MIXED'
    : verificationModes[0] || 'NONE'
  const coveredIssueIds = unique([
    ...directDocument.coveredIssueIds,
    ...targetedDocument.coveredIssueIds,
    ...scopedAudit.coveredIssueIds,
  ])
  const verifiedIssueIds = coveredIssueIds.filter(issueId => (
    !remainingIssueIds.includes(issueId)
  ))

  return {
    executed: true,
    verificationMode,
    scopesCount: scopedAudit.scopes.length,
    selectedIssuesCount: selectedIssueIds.length,
    coveredIssueIds,
    verifiedIssueIds,
    verifiedIssuesCount: verifiedIssueIds.length,
    remainingIssuesCount: remainingIssueIds.length,
    remainingIssueIds,
    readsUsed: (
      Number(directDocument.readsUsed || 0) +
      Number(targetedDocument.readsUsed || 0) +
      Number(scopedAudit.readsUsed || 0)
    ),
    failures: [
      ...directDocument.failures,
      ...targetedDocument.failures,
      ...scopedAudit.failures,
    ],
    directDocument,
    targetedDocument,
    scopedAudit,
    scopes: scopedAudit.scopes,
  }
}
