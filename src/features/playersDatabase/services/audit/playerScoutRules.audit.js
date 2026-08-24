// src/features/playersDatabase/services/audit/playerScoutRules.audit.js

import {
  collection,
  doc,
  limit,
  query,
  startAfter,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import {
  trackedGetDoc,
  trackedGetDocs,
  trackedGetDocsFromServer,
} from '../../../../services/firestore/usage/index.js'
import {
  buildPlayerScoutAuditCost,
  buildPlayerScoutRuntimeCostCheck,
} from './playerScout.cost.js'
import { buildPlayerScoutShadowComparison } from './playerScoutShadow.audit.js'
import {
  buildPlayerScoutAuditContractResult,
} from './playerScoutAudit.contract.js'
import {
  PLAYER_SCOUT_AUDIT_READ_BUDGETS,
  assertTeamSeasonScoutAuditReadPlan,
  buildTeamSeasonScoutAuditReadPlan,
} from './playerScoutAudit.readPlan.js'
import { buildPlayerScoutDocumentRewritePlan } from './playerScoutDocumentRewrite.audit.js'
import {
  PLAYER_DOCUMENT_SCHEMA_SCOPES,
  classifyUnexpectedSchemaFields,
  resolveSchemaMigrationAction,
} from './playerDocumentMigration.policy.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { buildPlayerScoutState } from '../../domain/orchestration/buildPlayerScoutState.js'
import { buildPlayerDocumentId } from '../../model/playerIdentity.model.js'
import { buildPlayerStatsSnapshot } from '../../model/playerStatsSnapshot.model.js'
import { buildScoutProfilesSummary } from '../../model/scoutProfilesSummary.model.js'
import {
  isSameSeason,
  normalizeSeasonLookupKey,
} from '../../model/season.model.js'
import {
  buildPlayerScoutStatsLoadMeasurementHistory,
  buildPlayerScoutStatsLoadMeasurements,
  normalizePlayerScoutStatsLoadMeasurement,
  normalizePlayerScoutStatsLoadMeasurementHistory,
  normalizePlayerScoutStatsLoadMeasurements,
} from '../../model/playerScoutMeasurement.model.js'
import { BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG } from '../../catalog/firestoreDocuments/birthTeamDocument.catalog.js'
import {
  PLAYER_SCOUT_NULLABLE_STRUCTURED_FIELDS,
  PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG,
} from '../../catalog/firestoreDocuments/playerDocument.catalog.js'
import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'
import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../catalog/leagues.catalog.js'
import { adaptTeamSearchIndexDocument } from '../../domain/index.js'
import {
  SCOUTING_PLAYER_TRACKING_REASONS,
  normalizeScoutingPlayerTracking,
  resolvePlayerTrackingReasons,
} from '../write/players/scoutingPlayerLifecycle.model.js'
import { buildPlayerScoutIndexFields } from '../write/searchIndex/player/playerSeasonIndex.scout.js'
import {
  normalizePlayerScoutStory as normalizePlayerScoutState,
} from '../write/players/playerDoc.model.js'


const PLAYER_SCOUT_AUDIT_READ_HARD_LIMIT = 50000
const PLAYER_SCOUT_AUDIT_READ_SAFETY_LIMIT = 49000

const estimateSnapshotReads = snapshot => Math.max(
  1,
  Array.isArray(snapshot?.docs) ? snapshot.docs.length : 0
)

const FIRESTORE_STRUCTURED_QUERY_MAX_LIMIT = 10000

const readAuditSnapshotWithinBudget = async ({
  source,
  metadata,
  budget,
  reservedReads = 0,
  label,
}) => {
  const availableReads = Math.max(
    0,
    Number(budget || 0) - Number(reservedReads || 0)
  )

  if (availableReads < 1) {
    throw new Error(
      `Audit stopped before ${label}: read safety budget exhausted. ` +
      `The audit is capped below ${PLAYER_SCOUT_AUDIT_READ_HARD_LIMIT} document reads.`
    )
  }

  const documents = []
  let readsUsed = 0
  let cursor = null

  while (readsUsed < availableReads) {
    const remainingAllowance = availableReads - readsUsed
    const pageLimit = Math.min(
      FIRESTORE_STRUCTURED_QUERY_MAX_LIMIT,
      remainingAllowance
    )
    const constraints = []

    if (cursor) constraints.push(startAfter(cursor))
    constraints.push(limit(pageLimit))

    const pageSnapshot = await trackedGetDocsFromServer(
      query(source, ...constraints),
      metadata
    )
    const pageReads = estimateSnapshotReads(pageSnapshot)

    readsUsed += pageReads
    documents.push(...pageSnapshot.docs)

    if (pageSnapshot.docs.length < pageLimit) {
      return {
        snapshot: { docs: documents },
        readsUsed,
      }
    }

    if (readsUsed >= availableReads) {
      throw new Error(
        `Audit stopped while reading ${label}: the source reached the ` +
        `${availableReads}-document safety allowance. No incomplete audit result was produced. ` +
        `The audit is capped below ${PLAYER_SCOUT_AUDIT_READ_HARD_LIMIT} document reads.`
      )
    }

    cursor = pageSnapshot.docs[pageSnapshot.docs.length - 1]
  }

  throw new Error(
    `Audit stopped while reading ${label}: read safety allowance exhausted.`
  )
}

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const hasOwn = (source, key) => Object.prototype.hasOwnProperty.call(
  source && typeof source === 'object' ? source : {},
  key
)

const PLAYER_SCOUT_AUDIT_GOVERNANCE = Object.freeze({
  operationalSourceOfTruth: PLAYERS_DATABASE_COLLECTIONS.teams,
  scoutProfileSourceOfTruth: PLAYERS_DATABASE_COLLECTIONS.players,
  projectionCollection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
  schemaSourceOfTruth: 'direct document catalogs',
})

const SCOUT_STATE_FIELD_NAMES = [
  'scoutCandidateSignals',
  'scoutSpotlights',
  'scoutOpportunity',
  'scoutVerification',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutTrajectory',
  'scoutTransferContext',
  'scoutEngineVersion',
]

const getScoutStateMissingFields = source => (
  SCOUT_STATE_FIELD_NAMES.filter(field => !hasOwn(source, field))
)


const OPTIONAL_TRANSFER_SCHEMA_FIELDS = new Set([
  'manualTransferDirection',
])

const withoutOptionalTransferFields = schema => Object.fromEntries(
  Object.entries(schema || {}).filter(
    ([field]) => !OPTIONAL_TRANSFER_SCHEMA_FIELDS.has(field)
  )
)

const TEAM_PLAYER_SCHEMA_TEMPLATE = withoutOptionalTransferFields(
  BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG.current?.[0]?.teamPlayers?.[0] || {}
)
const PLAYER_SEASON_SCHEMA_TEMPLATE = withoutOptionalTransferFields(
  PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG.current?.[0] || {}
)
const TEAM_PLAYER_ALLOWED_OPTIONAL_FIELDS = OPTIONAL_TRANSFER_SCHEMA_FIELDS
const PLAYER_SEASON_ALLOWED_OPTIONAL_FIELDS = OPTIONAL_TRANSFER_SCHEMA_FIELDS
const PLAYER_ROOT_ALLOWED_OPTIONAL_FIELDS = new Set([
  'scoutNarrative',
])
const PLAYER_ROOT_SCHEMA_TEMPLATE = Object.fromEntries(
  Object.entries(PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG).filter(
    ([field]) => field !== 'scoutNarrative'
  )
)
const PLAYER_NARRATIVE_SCHEMA_TEMPLATE = (
  PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG.scoutNarrative || {}
)
const getValueType = value => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'

  return typeof value
}

const isTimestampLike = value => Boolean(
  value &&
  typeof value === 'object' &&
  typeof value.toDate === 'function'
)

const NULLABLE_STRUCTURED_FIELD_SET = new Set(
  PLAYER_SCOUT_NULLABLE_STRUCTURED_FIELDS
)

const COMPUTED_SCOUT_NESTED_FIELDS = new Set([
  'scoutOpportunity',
  'scoutVerification',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutProfileCaseStrength',
  'scoutPlayerInterest',
  'scoutTrajectory',
  'scoutTransferContext',
  'futureCompetitionPath',
])

const isNullableStructuredField = fieldPath => (
  NULLABLE_STRUCTURED_FIELD_SET.has(clean(fieldPath).split('.').pop())
)

const isSchemaTypeValid = ({ actualValue, expectedValue, fieldPath = '' }) => {
  if (actualValue === null && isNullableStructuredField(fieldPath)) return true
  if (expectedValue === null) return true
  if (isTimestampLike(actualValue)) return expectedValue === null

  return getValueType(actualValue) === getValueType(expectedValue)
}

const isPlainObject = value => (
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !isTimestampLike(value)
)

const topLevelFieldOf = path => clean(path).split('.')[0]

const buildNestedSchemaDiff = ({
  source,
  schema,
  path = '',
  ignoredRootFields = new Set(),
} = {}) => {
  const missingFields = []
  const invalidTypes = []

  if (isPlainObject(schema)) {
    const actual = isPlainObject(source) ? source : {}

    Object.keys(schema).forEach(field => {
      const nextPath = path ? `${path}.${field}` : field
      const rootField = topLevelFieldOf(nextPath)

      if (path && ignoredRootFields.has(rootField)) return
      if (!hasOwn(actual, field)) {
        missingFields.push(nextPath)
        return
      }

      const expectedValue = schema[field]
      const actualValue = actual[field]
      if (!isSchemaTypeValid({
        actualValue,
        expectedValue,
        fieldPath: nextPath,
      })) {
        invalidTypes.push({
          field: nextPath,
          expectedType: getValueType(expectedValue),
          actualType: getValueType(actualValue),
        })
        return
      }

      if (
        isPlainObject(expectedValue) &&
        !(actualValue === null && isNullableStructuredField(nextPath))
      ) {
        const nested = buildNestedSchemaDiff({
          source: actualValue,
          schema: expectedValue,
          path: nextPath,
          ignoredRootFields,
        })
        missingFields.push(...nested.missingFields)
        invalidTypes.push(...nested.invalidTypes)
      }
    })
  }

  return {
    missingFields,
    invalidTypes,
  }
}

const hasNarrativeContentValue = content => (
  Boolean(clean(content?.title)) ||
  Boolean(clean(content?.summary)) ||
  Boolean(content?.conclusion) ||
  Boolean(clean(content?.whyInteresting)) ||
  Boolean(clean(content?.professionalContext)) ||
  (Array.isArray(content?.strengths) && content.strengths.length > 0) ||
  (Array.isArray(content?.unknowns) && content.unknowns.length > 0) ||
  Boolean(content?.action) ||
  (Array.isArray(content?.evidenceRefs) && content.evidenceRefs.length > 0)
)

const hasNarrativeSnapshotValue = snapshot => {
  if (!isPlainObject(snapshot)) return false

  return Boolean(
    clean(snapshot.inputHash) ||
    snapshot.generatedAt ||
    snapshot.approvedAt ||
    hasNarrativeContentValue(snapshot.content || snapshot)
  )
}

const hasPlayerNarrativeValue = narrative => {
  if (!isPlainObject(narrative)) return false
  if (hasNarrativeSnapshotValue(narrative.career)) return true

  return (Array.isArray(narrative.seasons) ? narrative.seasons : []).some(
    season => hasNarrativeSnapshotValue(season?.approved || season?.state?.approved)
  )
}

const buildTopLevelSchemaDiff = ({
  source = {},
  schema = {},
  ignoredNestedRootFields = new Set(),
  allowedUnexpectedFields = new Set(),
} = {}) => {
  const safeSource = isPlainObject(source) ? source : {}
  const safeSchema = isPlainObject(schema) ? schema : {}
  const sourceKeys = Object.keys(safeSource)
  const schemaKeys = Object.keys(safeSchema)
  const sourceKeySet = new Set(sourceKeys)
  const schemaKeySet = new Set(schemaKeys)
  const missingFields = schemaKeys.filter(field => !sourceKeySet.has(field))
  const unexpectedFields = sourceKeys.filter(field => (
    !schemaKeySet.has(field) &&
    !allowedUnexpectedFields.has(field)
  ))
  const invalidTypes = schemaKeys.reduce((result, field) => {
    if (!sourceKeySet.has(field)) return result
    if (isSchemaTypeValid({
      actualValue: safeSource[field],
      expectedValue: safeSchema[field],
      fieldPath: field,
    })) return result

    result.push({
      field,
      expectedType: getValueType(safeSchema[field]),
      actualType: getValueType(safeSource[field]),
    })
    return result
  }, [])

  const nestedSchemaDiff = buildNestedSchemaDiff({
    source,
    schema,
    ignoredRootFields: ignoredNestedRootFields,
  })
  const nestedMissingFields = nestedSchemaDiff.missingFields.filter(path => (
    path.includes('.')
  ))
  const nestedInvalidTypes = nestedSchemaDiff.invalidTypes.filter(item => (
    clean(item.field).includes('.')
  ))

  return {
    missingFields,
    unexpectedFields,
    invalidTypes,
    nestedMissingFields,
    nestedInvalidTypes,
  }
}

const getSchemaRepairFields = schemaDiff => unique([
  ...(Array.isArray(schemaDiff?.missingFields) ? schemaDiff.missingFields : []),
  ...(Array.isArray(schemaDiff?.invalidTypes)
    ? schemaDiff.invalidTypes.map(item => item.field)
    : []),
  ...(Array.isArray(schemaDiff?.nestedMissingFields)
    ? schemaDiff.nestedMissingFields.map(topLevelFieldOf)
    : []),
  ...(Array.isArray(schemaDiff?.nestedInvalidTypes)
    ? schemaDiff.nestedInvalidTypes.map(item => topLevelFieldOf(item.field))
    : []),
])

export const buildPlayerScoutSchemaIssueState = ({
  scope = '',
  source = {},
} = {}) => {
  const configByScope = {
    [PLAYER_DOCUMENT_SCHEMA_SCOPES.TEAM_PLAYER]: {
      schema: TEAM_PLAYER_SCHEMA_TEMPLATE,
      ignoredNestedRootFields: COMPUTED_SCOUT_NESTED_FIELDS,
      allowedUnexpectedFields: TEAM_PLAYER_ALLOWED_OPTIONAL_FIELDS,
    },
    [PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_ROOT]: {
      schema: PLAYER_ROOT_SCHEMA_TEMPLATE,
      allowedUnexpectedFields: PLAYER_ROOT_ALLOWED_OPTIONAL_FIELDS,
    },
    [PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_SEASON]: {
      schema: PLAYER_SEASON_SCHEMA_TEMPLATE,
      ignoredNestedRootFields: COMPUTED_SCOUT_NESTED_FIELDS,
      allowedUnexpectedFields: PLAYER_SEASON_ALLOWED_OPTIONAL_FIELDS,
    },
    [PLAYER_DOCUMENT_SCHEMA_SCOPES.SEARCH_INDEX]: {
      schema: SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
    },
  }
  const config = configByScope[scope]

  if (!config) {
    return {
      supported: false,
      hasIssue: true,
      repairFields: [],
      unexpectedFields: [],
      invalidTypes: [],
    }
  }

  const schemaDiff = buildTopLevelSchemaDiff({
    source,
    schema: config.schema,
    ...(config.ignoredNestedRootFields
      ? { ignoredNestedRootFields: config.ignoredNestedRootFields }
      : {}),
    ...(config.allowedUnexpectedFields
      ? { allowedUnexpectedFields: config.allowedUnexpectedFields }
      : {}),
  })
  const repairFields = unique([
    ...getSchemaRepairFields(schemaDiff),
    ...(scope === PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_SEASON
      ? getScoutStateMissingFields(source)
      : []),
  ])
  const unexpected = classifyUnexpectedSchemaFields({
    scope,
    fields: schemaDiff.unexpectedFields,
  })

  return {
    supported: true,
    hasIssue: Boolean(
      repairFields.length || unexpected.unexpectedFields.length
    ),
    repairFields,
    unexpectedFields: unexpected.unexpectedFields,
    deprecatedFields: unexpected.deprecatedFields,
    reportOnlyUnexpectedFields: unexpected.reportOnlyUnexpectedFields,
    invalidTypes: Array.isArray(schemaDiff.invalidTypes)
      ? schemaDiff.invalidTypes
      : [],
  }
}


const normalizeComparableValue = value => {
  if (value === undefined) return null

  if (Array.isArray(value)) {
    return value.map(normalizeComparableValue)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalizeComparableValue(value[key])
        return result
      }, {})
  }

  return value
}

const normalizedJson = value => JSON.stringify(
  normalizeComparableValue(value)
)

const sameJson = (left, right) => normalizedJson(left) === normalizedJson(right)

const resolveCatalogClubName = clubId => {
  const match = PLAYERS_DATABASE_CLUBS_CATALOG.find(
    club => clean(club?.id) === clean(clubId)
  )

  return clean(match?.name || match?.displayName)
}

const resolveCatalogLeagueName = leagueId => {
  const match = PLAYERS_DATABASE_LEAGUES_CATALOG.find(
    league => clean(league?.id) === clean(leagueId)
  )

  return clean(match?.name)
}

const buildPlayerSeasonContextComparison = ({ row = {}, playerRow = {} } = {}) => {
  const stats = playerRow?.playerStats || {}
  const teamContext = row?.teamContext || {}
  const expected = {
    teamName: clean(row.teamName),
    clubName: clean(row.clubName),
    leagueName: clean(row.leagueName),
    leagueId: clean(row.leagueId),
    teamGames: Number(teamContext.teamGamePlayed) || 0,
    teamRank: teamContext.teamRank === null || teamContext.teamRank === undefined
      ? 0
      : Number(teamContext.teamRank),
    teamGoalsFor: Number(teamContext.goalsFor) || 0,
    teamGoalsAgainst: Number(teamContext.goalsAgainst) || 0,
    teamAttackPerformance: teamContext.teamAttackPerformance || null,
    teamDefensePerformance: teamContext.teamDefensePerformance || null,
  }
  const actual = {
    teamName: clean(playerRow.teamName),
    clubName: clean(playerRow.clubName),
    leagueName: clean(playerRow.leagueName),
    leagueId: clean(playerRow.leagueId),
    teamGames: Number(stats.teamGames) || 0,
    teamRank: stats.teamRank === null || stats.teamRank === undefined
      ? 0
      : Number(stats.teamRank),
    teamGoalsFor: Number(stats.teamGoalsFor) || 0,
    teamGoalsAgainst: Number(stats.teamGoalsAgainst) || 0,
    teamAttackPerformance: stats.teamAttackPerformance || null,
    teamDefensePerformance: stats.teamDefensePerformance || null,
  }
  const comparableFields = [
    'clubName',
    'leagueName',
    'leagueId',
    'teamGames',
    'teamRank',
    'teamGoalsFor',
    'teamGoalsAgainst',
    'teamAttackPerformance',
    'teamDefensePerformance',
  ]
  const mismatchedFields = comparableFields.filter(field => {
    if (['clubName', 'leagueName', 'leagueId'].includes(field)) {
      if (!expected[field]) return false
    }

    if (['teamAttackPerformance', 'teamDefensePerformance'].includes(field)) {
      if (!row.hasTeamIndexContext) return false
    }

    return !sameJson(actual[field], expected[field])
  })

  return {
    actual,
    expected,
    mismatchedFields,
  }
}

const fieldValue = (source, field) => (
  source && source[field] !== undefined ? source[field] : null
)

const getMismatchedFields = ({ actual = {}, expected = {} } = {}) => {
  const safeActual = isPlainObject(actual) ? actual : {}
  const safeExpected = isPlainObject(expected) ? expected : {}

  return Object.keys(safeExpected).filter(field => (
    !sameJson(safeActual[field], safeExpected[field])
  ))
}

const getTeamScoutStateMismatchedFields = ({ actual = {}, expected = {} } = {}) => (
  getMismatchedFields({ actual, expected })
    .filter(field => field !== 'scoutVerification')
)

const MEASUREMENT_AUDIT_FIELD_NAMES = [
  'snapshotKey',
  'capturedAt',
  'engineVersion',
  'primaryProfileId',
  'profileIds',
  'profileStates',
]

const buildMeasurementFieldDiff = ({ actual, expected } = {}) => {
  const normalizedActual = normalizePlayerScoutStatsLoadMeasurement(actual)
  const normalizedExpected = normalizePlayerScoutStatsLoadMeasurement(expected)

  return {
    actual: normalizedActual,
    expected: normalizedExpected,
    mismatchedFields: MEASUREMENT_AUDIT_FIELD_NAMES.filter(field => (
      !sameJson(
        fieldValue(normalizedActual, field),
        fieldValue(normalizedExpected, field)
      )
    )),
  }
}

const measurementIdentityKeys = history => (
  normalizePlayerScoutStatsLoadMeasurementHistory(history)
    .map(measurement => [
      clean(measurement.snapshotKey),
      clean(measurement.engineVersion),
    ].join('__'))
    .filter(Boolean)
)


const unique = values => [
  ...new Set(
    (Array.isArray(values) ? values : [])
      .map(clean)
      .filter(Boolean)
  ),
]

const resolvePreferredPlayerDocumentId = ({
  row = {},
  searchRow = null,
} = {}) => (
  clean(row.playerDocumentId) ||
  clean(searchRow?.playerDocumentId) ||
  clean(buildPlayerDocumentId(row)) ||
  clean(row.playerId)
)

const hasRealTransferContext = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const fromClubId = clean(value.fromClubId)
  const toClubId = clean(value.toClubId)

  return Boolean(
    fromClubId &&
    toClubId &&
    fromClubId !== toClubId
  )
}

const hasTransferTrackingEvidence = player => (
  hasRealTransferContext(player?.scoutTransferContext) ||
  hasRealTransferContext(player?.scoutTrajectory?.latestTransfer)
)

const resolveAuditTrackingReasons = player => unique([
  ...resolvePlayerTrackingReasons(player),
  hasTransferTrackingEvidence(player)
    ? SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER
    : '',
])

const sorted = values => unique(values).sort()

const firstDefined = (...values) => values.find(value => (
  value !== undefined &&
  value !== null &&
  value !== ''
))

const toNumber = (...values) => {
  const number = Number(firstDefined(...values))

  return Number.isFinite(number) ? number : 0
}

const toNullableNumber = (...values) => {
  const value = firstDefined(...values)
  if (value === undefined) return null

  const number = Number(value)

  return Number.isFinite(number) ? number : null
}

const toAuditTimestamp = value => {
  if (!value) return null

  if (typeof value?.toDate === 'function') {
    return value.toDate().toISOString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Number.isFinite(Number(value?.seconds))) {
    return new Date(Number(value.seconds) * 1000).toISOString()
  }

  const parsed = new Date(value)

  return Number.isNaN(parsed.getTime())
    ? clean(value) || null
    : parsed.toISOString()
}

const getProfiles = source => (
  Array.isArray(source?.scoutProfiles)
    ? source.scoutProfiles
    : Array.isArray(source?.scoutSignals)
      ? source.scoutSignals
      : []
)

const getProfileIds = source => sorted(
  getProfiles(source).map(profile => profile?.profileId)
)

const getProfessionalProfileIds = source => (
  sorted(source?.scoutProfileHierarchy?.professionalProfileIds)
)

const getProfileDetails = source => (
  getProfiles(source)
    .map(profile => ({
      profileId: clean(profile?.profileId || profile?.id),
      profileLabel: clean(profile?.profileLabel || profile?.label),
      profileIdentity: clean(profile?.profileIdentity || profile?.identity),
    }))
    .filter(profile => profile.profileId)
)

const getProfileReliability = source => getProfiles(source).reduce((result, profile) => {
  const profileId = clean(profile?.profileId)
  if (!profileId) return result

  result[profileId] = {
    level: clean(
      profile?.reliability?.level ||
      profile?.reliabilityLevel
    ),
    score: toNullableNumber(
      profile?.reliability?.score,
      profile?.reliabilityScore
    ),
    warnings: sorted(
      Array.isArray(profile?.warnings)
        ? profile.warnings
        : profile?.reliability?.warnings
    ),
  }

  return result
}, {})

const getSearchReliability = source => {
  const result = {}
  const addProfile = ({ profileId, level, warnings }) => {
    const id = clean(profileId)
    if (!id) return

    result[id] = {
      level: clean(level),
      warnings: sorted(warnings),
    }
  }

  addProfile({
    profileId: source?.primaryScoutProfileId,
    level: source?.primaryScoutReliabilityLevel,
    warnings: source?.primaryScoutWarnings,
  })
  addProfile({
    profileId: source?.secondaryScoutProfileId,
    level: source?.secondaryScoutReliabilityLevel,
    warnings: source?.secondaryScoutWarnings,
  })

  return result
}

const normalizeReliabilityMap = source => Object.keys(source || {})
  .sort()
  .reduce((result, profileId) => {
    const reliability = source[profileId] || {}

    result[profileId] = {
      level: clean(reliability.level),
      score: toNullableNumber(reliability.score),
      warnings: sorted(reliability.warnings),
    }

    return result
  }, {})

const sameReliability = (left = {}, right = {}) => (
  JSON.stringify(normalizeReliabilityMap(left)) ===
  JSON.stringify(normalizeReliabilityMap(right))
)

const normalizeSearchReliabilityMap = source => Object.keys(source || {})
  .sort()
  .reduce((result, profileId) => {
    const reliability = source[profileId] || {}

    result[profileId] = {
      level: clean(reliability.level),
      warnings: sorted(reliability.warnings),
    }

    return result
  }, {})

const pickReliabilityProfiles = ({ source = {}, profileIds = [] }) => (
  unique(profileIds).reduce((result, profileId) => {
    if (!source[profileId]) return result

    result[profileId] = source[profileId]
    return result
  }, {})
)

const sameSearchReliability = ({ expected = {}, actual = {} }) => {
  const profileIds = Object.keys(actual || {})
  const expectedSearchReliability = pickReliabilityProfiles({
    source: expected,
    profileIds,
  })

  return (
    JSON.stringify(normalizeSearchReliabilityMap(expectedSearchReliability)) ===
    JSON.stringify(normalizeSearchReliabilityMap(actual))
  )
}

const getCombinationIds = source => sorted(
  (Array.isArray(source?.scoutCombinations)
    ? source.scoutCombinations
    : []
  ).map(combination => combination?.id || combination?.combinationId)
)

const getSearchProfileIds = source => sorted(
  Array.isArray(source?.scoutProfileIds)
    ? source.scoutProfileIds
    : getProfileIds(source)
)

const getSearchCombinationIds = source => sorted(
  Array.isArray(source?.scoutCombinationIds)
    ? source.scoutCombinationIds
    : getCombinationIds(source)
)

const sameValues = (left = [], right = []) => (
  left.length === right.length &&
  left.every((value, index) => value === right[index])
)

const difference = (left = [], right = []) => left.filter(
  value => !right.includes(value)
)

const seasonIds = row => unique([
  row?.seasonId,
  row?.seasonKey,
])

const teamIds = row => unique([
  row?.birthTeamDocumentId,
  row?.teamDocumentId,
  row?.birthTeamId,
  row?.teamId,
  row?.sourceDocumentId,
])

const playerIds = row => unique([
  row?.playerId,
  row?.playerDocumentId,
  row?.externalPlayerId,
])

const buildTeamKeys = row => teamIds(row).flatMap(teamId => (
  seasonIds(row).map(seasonId => `${teamId}::${seasonId}`)
))

const buildPlayerKeys = row => playerIds(row).flatMap(playerId => (
  seasonIds(row).flatMap(seasonId => (
    teamIds(row).map(teamId => `${playerId}::${seasonId}::${teamId}`)
  ))
))

const buildIndex = ({ rows = [], keyBuilder }) => {
  const index = new Map()

  rows.forEach(row => {
    unique(keyBuilder(row)).forEach(key => {
      if (!index.has(key)) index.set(key, [])
      index.get(key).push(row)
    })
  })

  return index
}

const findIndexed = ({ index, row, keyBuilder }) => {
  const keys = unique(keyBuilder(row))
  const matches = []

  keys.forEach(key => {
    ;(index.get(key) || []).forEach(match => {
      if (!matches.includes(match)) matches.push(match)
    })
  })

  return matches.length === 1 ? matches[0] : null
}

const flattenPlayerDocs = docs => docs.flatMap(snapshot => {
  const data = snapshot.data() || {}
  const rows = []
  const playerReview = data.playerReview && typeof data.playerReview === 'object'
    ? data.playerReview
    : null
  const manualImmediacyDecision = data.manualImmediacyDecision &&
    typeof data.manualImmediacyDecision === 'object'
    ? data.manualImmediacyDecision
    : null
  const rootSchemaDiff = buildTopLevelSchemaDiff({
    source: data,
    schema: PLAYER_ROOT_SCHEMA_TEMPLATE,
    allowedUnexpectedFields: PLAYER_ROOT_ALLOWED_OPTIONAL_FIELDS,
  })
  const rootSchemaMissingFields = unique([
    ...rootSchemaDiff.missingFields,
    ...rootSchemaDiff.nestedMissingFields,
  ])
  const narrativeSchemaDiff = hasPlayerNarrativeValue(data.scoutNarrative)
    ? buildTopLevelSchemaDiff({
        source: data.scoutNarrative,
        schema: PLAYER_NARRATIVE_SCHEMA_TEMPLATE,
      })
    : null
  const normalizedTracking = normalizeScoutingPlayerTracking(data.tracking)
  const expectedTrackingReasons = resolvePlayerTrackingReasons({
    ...data,
    tracking: normalizedTracking,
  })

  ;['current', 'history'].forEach(sourceTarget => {
    const seasons = Array.isArray(data[sourceTarget])
      ? data[sourceTarget]
      : []

    seasons.forEach(season => {
      const seasonSchemaDiff = buildTopLevelSchemaDiff({
        source: season,
        schema: PLAYER_SEASON_SCHEMA_TEMPLATE,
        ignoredNestedRootFields: COMPUTED_SCOUT_NESTED_FIELDS,
        allowedUnexpectedFields: PLAYER_SEASON_ALLOWED_OPTIONAL_FIELDS,
      })
      const seasonSchemaMissingFields = unique([
        ...seasonSchemaDiff.missingFields,
        ...seasonSchemaDiff.nestedMissingFields,
        ...getScoutStateMissingFields(season),
      ])

      rows.push({
        ...season,
        source: 'dbPlayers',
        sourceDocumentId: snapshot.id,
        sourceTarget,
        playerId: clean(data.playerId || season.playerId),
        playerDocumentId: snapshot.id,
        fullName: clean(data.fullName || season.fullName),
        playerDocumentCreatedAt: toAuditTimestamp(data.createdAt),
        playerDocumentUpdatedAt: toAuditTimestamp(data.updatedAt),
        playerSeasonUpdatedAt: toAuditTimestamp(season.updatedAt),
        profileIds: getProfileIds(season),
        combinationIds: getCombinationIds(season),
        reliabilityByProfile: getProfileReliability(season),
        scoutState: normalizePlayerScoutState(season),
        verificationAnswers: Array.isArray(data.verification?.answers)
          ? data.verification.answers
          : [],
        playerReview,
        manualImmediacyDecision,
        trackingReasons: normalizedTracking.trackingReasons,
        expectedTrackingReasons,
        scoutStatsLoadMeasurementHistory: normalizePlayerScoutStatsLoadMeasurementHistory(
          season.scoutStatsLoadMeasurementHistory
        ),
        rootSchemaMissingFields,
        rootSchemaUnexpectedFields: rootSchemaDiff.unexpectedFields,
        rootSchemaInvalidTypes: [
          ...rootSchemaDiff.invalidTypes,
          ...rootSchemaDiff.nestedInvalidTypes,
        ],
        narrativeSchemaMissingFields: narrativeSchemaDiff
          ? unique([
              ...narrativeSchemaDiff.missingFields,
              ...narrativeSchemaDiff.nestedMissingFields,
            ])
          : [],
        narrativeSchemaUnexpectedFields: narrativeSchemaDiff
          ? narrativeSchemaDiff.unexpectedFields
          : [],
        narrativeSchemaInvalidTypes: narrativeSchemaDiff
          ? [
              ...narrativeSchemaDiff.invalidTypes,
              ...narrativeSchemaDiff.nestedInvalidTypes,
            ]
          : [],
        seasonSchemaMissingFields,
        seasonSchemaUnexpectedFields: seasonSchemaDiff.unexpectedFields,
        seasonSchemaInvalidTypes: [
          ...seasonSchemaDiff.invalidTypes,
          ...seasonSchemaDiff.nestedInvalidTypes,
        ],
        schemaMissingFields: unique([
          ...rootSchemaMissingFields,
          ...seasonSchemaMissingFields.map(field => `season.${field}`),
        ]),
      })
    })
  })

  return rows
})

const flattenSearchPlayerDocs = docs => docs.map(snapshot => {
  const data = snapshot.data() || {}

  return {
    ...data,
    source: 'dbSearchIndexes',
    sourceDocumentId: snapshot.id,
    fullName: clean(data.displayName || data.fullName),
    searchIndexUpdatedAt: toAuditTimestamp(data.updatedAt),
    profileIds: getSearchProfileIds(data),
    combinationIds: getSearchCombinationIds(data),
    reliabilityByProfile: getSearchReliability(data),
    searchSchemaDiff: buildTopLevelSchemaDiff({
      source: data,
      schema: SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
    }),
  }
})

const flattenTeamIndexDocs = docs => docs.map(snapshot => ({
  ...(snapshot.data() || {}),
  sourceDocumentId: snapshot.id,
}))

const hasTeamPerformance = teamIndex => Boolean(
  clean(teamIndex?.attackPriorityLevel) ||
  clean(teamIndex?.defensePriorityLevel)
)

const buildTeamContext = ({ teamDoc, season, teamIndex }) => {
  const teamGamePlayed = toNumber(
    teamIndex.teamGamePlayed,
    season.teamStats?.teamGamePlayed
  )
  const goalsFor = toNumber(
    teamIndex.goalsFor,
    season.teamStats?.goalsFor
  )
  const goalsAgainst = toNumber(
    teamIndex.goalsAgainst,
    season.teamStats?.goalsAgainst
  )

  return {
    ...teamDoc,
    ...season,
    clubId: clean(teamIndex.clubId || teamDoc.clubId),
    clubLevel: teamIndex.clubLevel,
    birthTeamId: clean(
      teamIndex.birthTeamId ||
      teamDoc.birthTeamId ||
      teamDoc.teamId
    ),
    birthTeamDocumentId: clean(
      teamIndex.birthTeamDocumentId ||
      teamIndex.teamDocumentId ||
      teamDoc.sourceDocumentId
    ),
    birthTeamSlot: toNumber(
      teamIndex.birthTeamSlot,
      teamDoc.birthTeamSlot,
      1
    ),
    ageGroupId: clean(teamIndex.ageGroupId || season.ageGroupId),
    birthYear: toNullableNumber(
      teamIndex.birthYear,
      season.birthYear
    ),
    leagueTotalRound: toNumber(
      teamIndex.leagueTotalRound,
      season.leagueTotalRound
    ),
    teamGamePlayed,
    goalsFor,
    goalsAgainst,
    teamStats: {
      ...(season.teamStats || {}),
      teamGamePlayed,
      goalsFor,
      goalsAgainst,
    },
    offense: {
      priorityLevel: clean(teamIndex.attackPriorityLevel),
    },
    defense: {
      priorityLevel: clean(teamIndex.defensePriorityLevel),
    },
  }
}

const buildSeasonContext = ({ season, teamIndex, sourceTarget }) => ({
  ...season,
  seasonId: clean(season.seasonId || teamIndex.seasonId),
  seasonKey: clean(season.seasonKey || teamIndex.seasonKey),
  ageGroupId: clean(teamIndex.ageGroupId || season.ageGroupId),
  birthYear: toNullableNumber(
    teamIndex.birthYear,
    season.birthYear
  ),
  leagueTotalRound: toNumber(
    teamIndex.leagueTotalRound,
    season.leagueTotalRound
  ),
  seasonStatus: sourceTarget === 'history'
    ? 'completed'
    : clean(season.seasonStatus) || 'active',
})

const resolveAuditManualDecisionForSeason = ({ playerRow, seasonContext }) => {
  const decision = playerRow?.manualImmediacyDecision
  if (!decision || typeof decision !== 'object') return null

  const decisionSeasonKey = clean(decision.seasonKey)
  const currentSeasonKey = clean(
    seasonContext?.seasonKey ||
    seasonContext?.seasonId
  )

  if (!decisionSeasonKey || !currentSeasonKey) return null

  return decisionSeasonKey === currentSeasonKey ? decision : null
}

const buildAuditPlayerSeasonStints = ({ playerRows = [], playerRow = null, currentStint = {} } = {}) => {
  const playerDocumentId = clean(
    playerRow?.playerDocumentId ||
    playerRow?.sourceDocumentId ||
    currentStint.playerDocumentId
  )
  if (!playerDocumentId) return []

  const stints = playerRows
    .filter(row => (
      clean(row.playerDocumentId || row.sourceDocumentId) === playerDocumentId
    ))
    .map(row => ({ ...row }))
  const currentSeasonKey = clean(
    currentStint.seasonKey ||
    currentStint.seasonId
  )
  const currentTeamId = clean(
    currentStint.birthTeamDocumentId ||
    currentStint.teamDocumentId ||
    currentStint.birthTeamId ||
    currentStint.teamId
  )
  const currentIndex = stints.findIndex(stint => {
    const stintSeasonKey = clean(stint.seasonKey || stint.seasonId)
    const stintTeamId = clean(
      stint.birthTeamDocumentId ||
      stint.teamDocumentId ||
      stint.birthTeamId ||
      stint.teamId
    )

    return stintSeasonKey === currentSeasonKey && stintTeamId === currentTeamId
  })

  if (currentIndex >= 0) {
    stints[currentIndex] = {
      ...stints[currentIndex],
      ...currentStint,
    }
  } else if (currentSeasonKey) {
    stints.push(currentStint)
  }

  return stints
}

const buildRecalculatedRows = ({
  teamDocs,
  teamIndexRows,
  playerRows = [],
  searchRows = [],
  includeRepairData = false,
}) => {
  const teamIndex = buildIndex({
    rows: teamIndexRows,
    keyBuilder: buildTeamKeys,
  })
  const playerIndex = buildIndex({
    rows: playerRows,
    keyBuilder: buildPlayerKeys,
  })
  const searchIndex = buildIndex({
    rows: searchRows,
    keyBuilder: buildPlayerKeys,
  })
  const rows = []
  const skipped = []

  teamDocs.forEach(snapshot => {
    const data = snapshot.data() || {}
    const teamDoc = {
      ...data,
      sourceDocumentId: snapshot.id,
    }

    ;['current', 'history'].forEach(sourceTarget => {
      const seasons = Array.isArray(data[sourceTarget])
        ? data[sourceTarget]
        : []

      seasons.forEach(season => {
        const scope = {
          ...season,
          sourceDocumentId: snapshot.id,
          birthTeamDocumentId: snapshot.id,
          birthTeamId: clean(data.birthTeamId || data.teamId),
        }
        const teamIndexRow = findIndexed({
          index: teamIndex,
          row: scope,
          keyBuilder: buildTeamKeys,
        })
        const domainTeamIndex = teamIndexRow
          ? adaptTeamSearchIndexDocument(teamIndexRow)
          : null
        const teamPerformance = domainTeamIndex?.performance || {}
        const leagueId = clean(teamIndexRow?.leagueId || season.leagueId)
        const players = Array.isArray(season.teamPlayers)
          ? season.teamPlayers
          : []
        const canRecalculateScout = Boolean(
          teamIndexRow && hasTeamPerformance(teamIndexRow)
        )
        const team = buildTeamContext({
          teamDoc,
          season,
          teamIndex: teamIndexRow || {},
        })
        const seasonContext = buildSeasonContext({
          season,
          teamIndex: teamIndexRow || {},
          sourceTarget,
        })

        players.forEach(player => {
          const playerScope = {
            ...player,
            seasonId: clean(seasonContext.seasonId),
            seasonKey: clean(seasonContext.seasonKey),
            birthTeamId: clean(team.birthTeamId),
            birthTeamDocumentId: snapshot.id,
            teamId: clean(team.birthTeamId),
            teamDocumentId: snapshot.id,
            clubId: clean(team.clubId),
          }
          const playerRow = findIndexed({
            index: playerIndex,
            row: playerScope,
            keyBuilder: buildPlayerKeys,
          })
          const searchRow = findIndexed({
            index: searchIndex,
            row: playerScope,
            keyBuilder: buildPlayerKeys,
          })
          const scoutStatsLoadMeasurements = normalizePlayerScoutStatsLoadMeasurements(
            player.scoutStatsLoadMeasurements
          )
          const teamCalculated = canRecalculateScout
            ? buildPlayerScoutState({
                player,
                team,
                season: seasonContext,
                perspective: 'players_database_scout_rules_audit_team',
              })
            : null
          const verificationAnswers = Array.isArray(playerRow?.verificationAnswers)
            ? playerRow.verificationAnswers
            : []
          const playerSeasonStints = buildAuditPlayerSeasonStints({
            playerRows,
            playerRow,
            currentStint: playerScope,
          })
          const manualImmediacyDecision = resolveAuditManualDecisionForSeason({
            playerRow,
            seasonContext,
          })
          const playerCalculated = canRecalculateScout && playerRow
            ? buildPlayerScoutState({
                player: {
                  ...player,
                  playerSeasonStints,
                  playerReview: playerRow.playerReview,
                  manualImmediacyDecision,
                },
                team,
                season: seasonContext,
                perspective: 'players_database_scout_rules_audit_player',
                verificationAnswers,
                manualReview: playerRow.playerReview,
                manualImmediacyDecision,
              })
            : null
          const canonicalProjectionSource = playerCalculated
            ? {
                ...player,
                ...playerCalculated,
              }
            : teamCalculated
              ? {
                  ...player,
                  ...teamCalculated,
                }
              : player
          const expectedTeamScoutState = teamCalculated
            ? normalizePlayerScoutState(teamCalculated)
            : null
          const expectedPlayerScoutState = playerCalculated
            ? normalizePlayerScoutState(playerCalculated)
            : null

          if (!canRecalculateScout) {
            skipped.push({
              type: 'missing_team_performance_context',
              severity: 'warning',
              source: 'dbBirthTeams',
              playerId: clean(player.playerId),
              playerDocumentId: clean(player.playerDocumentId),
              externalPlayerId: clean(player.externalPlayerId),
              fullName: clean(player.fullName),
              seasonId: clean(season.seasonId),
              seasonKey: clean(season.seasonKey),
              teamDocumentId: snapshot.id,
              teamName: clean(
                teamIndexRow?.displayName ||
                data.displayName ||
                data.teamName ||
                data.name
              ),
            })
          }

          rows.push({
            source: 'dbBirthTeams',
            sourceDocumentId: snapshot.id,
            sourceTarget,
            canRecalculateScout,
            playerId: clean(player.playerId),
            playerDocumentId: clean(player.playerDocumentId),
            resolvedPlayerDocumentId: clean(
              playerRow?.playerDocumentId ||
              playerRow?.sourceDocumentId ||
              player.playerDocumentId
            ),
            externalPlayerId: clean(player.externalPlayerId),
            identityKey: clean(player.identityKey),
            normalizedName: clean(player.normalizedName),
            fullName: clean(player.fullName),
            primaryPosition: clean(
              player.primaryPosition ||
              player.position
            ),
            rosterStatus: clean(player.rosterStatus),
            statsStatus: clean(player.statsStatus),
            seasonId: clean(seasonContext.seasonId),
            seasonKey: clean(seasonContext.seasonKey),
            birthTeamId: clean(team.birthTeamId),
            birthTeamDocumentId: snapshot.id,
            teamId: clean(team.birthTeamId),
            teamDocumentId: snapshot.id,
            clubId: clean(team.clubId),
            clubName: resolveCatalogClubName(team.clubId),
            leagueId,
            leagueName: resolveCatalogLeagueName(leagueId),
            teamName: clean(
              teamIndexRow?.displayName ||
              data.displayName ||
              data.teamName ||
              data.name
            ),
            hasTeamIndexContext: Boolean(teamIndexRow),
            teamDocumentCreatedAt: toAuditTimestamp(data.createdAt),
            teamDocumentUpdatedAt: toAuditTimestamp(data.updatedAt),
            teamSeasonUpdatedAt: toAuditTimestamp(season.updatedAt),
            teamPlayerUpdatedAt: toAuditTimestamp(player.updatedAt),
            teamIndexUpdatedAt: toAuditTimestamp(teamIndexRow?.updatedAt),
            stats: {
              games: Number(player.playerStats?.games) || 0,
              goals: Number(player.playerStats?.goals) || 0,
              yellowCards: Number(player.playerStats?.yellowCards) || 0,
              minutes: Number(player.playerStats?.minutes) || 0,
              starts: Number(player.playerStats?.starts) || 0,
              substituteIn: Number(player.playerStats?.substituteIn) || 0,
              substitutedOut: Number(player.playerStats?.substitutedOut) || 0,
              teamGames: Number(player.playerStats?.teamGames) || 0,
            },
            teamContext: {
              attackPriorityLevel: clean(teamIndexRow?.attackPriorityLevel),
              defensePriorityLevel: clean(teamIndexRow?.defensePriorityLevel),
              teamGamePlayed: toNumber(
                teamIndexRow?.teamGamePlayed,
                season.teamStats?.teamGamePlayed
              ),
              goalsFor: toNumber(
                teamIndexRow?.goalsFor,
                season.teamStats?.goalsFor
              ),
              goalsAgainst: toNumber(
                teamIndexRow?.goalsAgainst,
                season.teamStats?.goalsAgainst
              ),
              ageGroupId: clean(teamIndexRow?.ageGroupId || season.ageGroupId),
              clubLevel: toNumber(teamIndexRow?.clubLevel, team.clubLevel),
              clubStrengthLevel: toNullableNumber(
                teamIndexRow?.clubStrengthLevel,
                teamIndexRow?.clubLevel,
                team.clubStrengthLevel,
                team.clubLevel
              ),
              leagueLevel: toNullableNumber(
                teamIndexRow?.leagueLevel,
                teamIndexRow?.level,
                team.leagueLevel
              ),
              teamRank: toNullableNumber(
                domainTeamIndex?.ranking?.tableRank,
                teamIndexRow?.tableRank
              ),
              teamAttackPerformance: teamPerformance.offense || null,
              teamDefensePerformance: teamPerformance.defense || null,
            },
            actualProfileIds: getProfileIds(player),
            actualCombinationIds: getCombinationIds(player),
            actualReliabilityByProfile: getProfileReliability(player),
            actualScoutProfiles: includeRepairData ? getProfiles(player) : undefined,
            actualScoutCombinations: includeRepairData
              ? (Array.isArray(player.scoutCombinations) ? player.scoutCombinations : [])
              : undefined,
            teamPlayerSchemaDiff: buildTopLevelSchemaDiff({
              source: player,
              schema: TEAM_PLAYER_SCHEMA_TEMPLATE,
              ignoredNestedRootFields: COMPUTED_SCOUT_NESTED_FIELDS,
              allowedUnexpectedFields: TEAM_PLAYER_ALLOWED_OPTIONAL_FIELDS,
            }),
            teamScoutStateMissingFields: getScoutStateMissingFields(player),
            teamScoutStatsLoadMeasurements: scoutStatsLoadMeasurements,
            actualScoutState: normalizePlayerScoutState(player),
            teamStatsSnapshotKey: buildPlayerStatsSnapshot({
              source: {
                ...player,
                teamGamePlayed: toNumber(
                  season.teamStats?.teamGamePlayed,
                  teamIndexRow?.teamGamePlayed,
                  player.playerStats?.teamGames
                ),
              },
            }).snapshotKey,
            expectedTeamProfileIds: teamCalculated ? getProfileIds(teamCalculated) : [],
            expectedTeamCombinationIds: teamCalculated ? getCombinationIds(teamCalculated) : [],
            expectedTeamReliabilityByProfile: teamCalculated
              ? getProfileReliability(teamCalculated)
              : {},
            expectedTeamScoutState,
            expectedPlayerProfileIds: playerCalculated
              ? getProfileIds(playerCalculated)
              : [],
            expectedPlayerCombinationIds: playerCalculated
              ? getCombinationIds(playerCalculated)
              : [],
            expectedPlayerReliabilityByProfile: playerCalculated
              ? getProfileReliability(playerCalculated)
              : {},
            expectedPlayerScoutState,
            searchIndexDocumentId: clean(searchRow?.sourceDocumentId),
            expectedSearchIndexScoutFields: buildPlayerScoutIndexFields(
              canonicalProjectionSource
            ),
            canonicalProjectionProfileIds: getProfileIds(canonicalProjectionSource),
            canonicalProjectionCombinationIds: getCombinationIds(canonicalProjectionSource),
            canonicalProjectionReliabilityByProfile: getProfileReliability(
              canonicalProjectionSource
            ),
            playerDocumentExists: Boolean(playerRow),
            expectedTrackingReasons: resolveAuditTrackingReasons({
              ...player,
              scoutProfiles: getProfiles(player),
              scoutSignals: getProfiles(player),
            }),
            playerDocumentTrackingRequired: resolveAuditTrackingReasons({
              ...player,
              scoutProfiles: getProfiles(player),
              scoutSignals: getProfiles(player),
            }).length > 0,
            expectedSeasonStatus: sourceTarget === 'history'
              ? 'completed'
              : clean(season.seasonStatus) || 'active',
            ...(includeRepairData
              ? {
                expectedTeamScoutProfiles: teamCalculated
                  ? getProfiles(teamCalculated)
                  : [],
                expectedTeamScoutCombinations: teamCalculated && Array.isArray(teamCalculated.scoutCombinations)
                  ? teamCalculated.scoutCombinations
                  : [],
                expectedPlayerScoutProfiles: playerCalculated
                  ? getProfiles(playerCalculated)
                  : [],
                expectedPlayerScoutCombinations: playerCalculated && Array.isArray(playerCalculated.scoutCombinations)
                  ? playerCalculated.scoutCombinations
                  : [],
                expectedScoutStatsLoadMeasurements: buildPlayerScoutStatsLoadMeasurements({
                  existingMeasurements: player.scoutStatsLoadMeasurements,
                  player: teamCalculated || player,
                  team,
                }),
              }
              : {}),
            storedSeasonStatus: clean(season.seasonStatus),
          })
        })
      })
    })
  })

  return {
    rows,
    skipped,
  }
}

const buildIssueTimestamps = ({ row, playerRow = null, searchRow = null }) => ({
  teamDocumentCreatedAt: row.teamDocumentCreatedAt,
  teamDocumentUpdatedAt: row.teamDocumentUpdatedAt,
  teamSeasonUpdatedAt: row.teamSeasonUpdatedAt,
  teamPlayerUpdatedAt: row.teamPlayerUpdatedAt,
  teamIndexUpdatedAt: row.teamIndexUpdatedAt,
  playerDocumentCreatedAt: playerRow?.playerDocumentCreatedAt || null,
  playerDocumentUpdatedAt: playerRow?.playerDocumentUpdatedAt || null,
  playerSeasonUpdatedAt: playerRow?.playerSeasonUpdatedAt || null,
  searchIndexUpdatedAt: searchRow?.searchIndexUpdatedAt || null,
})

const buildIssue = ({
  type,
  source,
  row,
  playerRow = null,
  searchRow = null,
  expectedProfiles = [],
  expectedCombinations = [],
  actualProfiles = [],
  actualCombinations = [],
}) => ({
  type,
  severity: 'high',
  source,
  playerId: row.playerId,
  playerDocumentId: row.playerDocumentId,
  externalPlayerId: row.externalPlayerId,
  identityKey: row.identityKey,
  normalizedName: row.normalizedName,
  fullName: row.fullName,
  rosterStatus: row.rosterStatus,
  seasonId: row.seasonId,
  seasonKey: row.seasonKey,
  teamDocumentId: row.teamDocumentId,
  teamName: row.teamName,
  expectedProfiles,
  actualProfiles,
  missingProfiles: difference(expectedProfiles, actualProfiles),
  extraProfiles: difference(actualProfiles, expectedProfiles),
  expectedCombinations,
  actualCombinations,
  stats: row.stats,
  teamContext: row.teamContext,
  timestamps: buildIssueTimestamps({
    row,
    playerRow,
    searchRow,
  }),
})

export const PLAYER_SCOUT_AUDIT_CATEGORY = Object.freeze({
  SCHEMA: 'schema',
  SYNCHRONIZATION: 'synchronization',
  ENGINE_DIAGNOSTIC: 'engine_diagnostic',
})

const ENGINE_DIAGNOSTIC_ISSUE_TYPES = new Set([
  'missing_team_performance_context',
  'birth_team_mismatch',
  'birth_team_reliability_mismatch',
  'team_scout_state_mismatch',
  'player_document_mismatch',
  'player_document_reliability_mismatch',
  'player_scout_state_mismatch',
])

const SCHEMA_ISSUE_TYPES = new Set([
  'team_player_schema_outdated',
  'player_schema_outdated',
  'search_index_schema_outdated',
])

const resolveAuditCategory = issueType => {
  if (SCHEMA_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_AUDIT_CATEGORY.SCHEMA
  }
  if (ENGINE_DIAGNOSTIC_ISSUE_TYPES.has(issueType)) {
    return PLAYER_SCOUT_AUDIT_CATEGORY.ENGINE_DIAGNOSTIC
  }

  return PLAYER_SCOUT_AUDIT_CATEGORY.SYNCHRONIZATION
}

const normalizeScoutProfilesSummaryForAudit = summary => {
  const profileCounts = summary?.profileCounts &&
    typeof summary.profileCounts === 'object'
    ? summary.profileCounts
    : {}

  return {
    total: Number(summary?.total) || 0,
    profileCounts: Object.keys(profileCounts)
      .sort()
      .reduce((result, profileId) => {
        result[profileId] = Number(profileCounts[profileId]) || 0
        return result
      }, {}),
  }
}

const buildTeamSummaryScopeKey = row => [
  clean(row?.teamDocumentId || row?.birthTeamDocumentId || row?.teamId),
  clean(row?.seasonKey || row?.seasonId),
].join('::')

const collectTeamSearchIndexSummaryIssues = ({
  teamRows = [],
  teamIndexRows = [],
} = {}) => {
  const issues = []
  const groupedRows = (Array.isArray(teamRows) ? teamRows : []).reduce(
    (result, row) => {
      const scopeKey = buildTeamSummaryScopeKey(row)
      if (!scopeKey || scopeKey === '::') return result
      if (!result.has(scopeKey)) result.set(scopeKey, [])
      result.get(scopeKey).push(row)
      return result
    },
    new Map()
  )
  const teamIndex = buildIndex({
    rows: Array.isArray(teamIndexRows) ? teamIndexRows : [],
    keyBuilder: buildTeamKeys,
  })

  groupedRows.forEach(scopeRows => {
    const referenceRow = scopeRows[0]
    if (!referenceRow) return

    const expectedSummary = normalizeScoutProfilesSummaryForAudit(
      buildScoutProfilesSummary(scopeRows)
    )
    const teamIndexRow = findIndexed({
      index: teamIndex,
      row: referenceRow,
      keyBuilder: buildTeamKeys,
    })

    if (!teamIndexRow) {
      issues.push({
        type: 'missing_team_search_index',
        severity: 'medium',
        source: 'dbSearchIndexes',
        teamDocumentId: clean(referenceRow.teamDocumentId),
        seasonId: clean(referenceRow.seasonId),
        seasonKey: clean(referenceRow.seasonKey || referenceRow.seasonId),
        teamName: clean(referenceRow.teamName),
        expected: {
          scoutProfiledPlayersCount: expectedSummary.total,
          scoutProfilesSummary: expectedSummary,
        },
        actual: null,
        repairable: false,
      })
      return
    }

    const actualSummary = normalizeScoutProfilesSummaryForAudit(
      teamIndexRow.scoutProfilesSummary
    )
    const expected = {
      scoutProfiledPlayersCount: expectedSummary.total,
      scoutProfilesSummary: expectedSummary,
    }
    const actual = {
      scoutProfiledPlayersCount: Number(
        teamIndexRow.scoutProfiledPlayersCount
      ) || 0,
      scoutProfilesSummary: actualSummary,
    }

    if (!sameJson(expected, actual)) {
      issues.push({
        type: 'team_search_index_scout_summary_mismatch',
        severity: 'medium',
        source: 'dbSearchIndexes',
        teamDocumentId: clean(referenceRow.teamDocumentId),
        seasonId: clean(referenceRow.seasonId),
        seasonKey: clean(referenceRow.seasonKey || referenceRow.seasonId),
        teamName: clean(referenceRow.teamName),
        searchIndexDocumentId: clean(teamIndexRow.sourceDocumentId),
        expected,
        actual,
        mismatchedFields: Object.keys(expected).filter(field => (
          !sameJson(expected[field], actual[field])
        )),
        repairData: {
          writer: 'DIRECT_TEAM_SEARCH_INDEX',
          fields: expected,
        },
        repairable: true,
      })
    }
  })

  return issues
}

const collectIssues = ({
  teamRows,
  skippedRows,
  playerRows,
  searchRows,
  teamIndexRows = [],
}) => {
  const issues = [
    ...skippedRows,
    ...collectTeamSearchIndexSummaryIssues({
      teamRows,
      teamIndexRows,
    }),
  ]
  const playerIndex = buildIndex({
    rows: playerRows,
    keyBuilder: buildPlayerKeys,
  })
  const searchIndex = buildIndex({
    rows: searchRows,
    keyBuilder: buildPlayerKeys,
  })
  const reportedRootSchemaPlayerIds = new Set()
  const reportedNarrativePlayerIds = new Set()
  const reportedTrackingPlayerIds = new Set()

  teamRows.forEach(row => {
    const teamPlayerSchemaDiff = row.teamPlayerSchemaDiff || {}
    const teamPlayerRepairFields = getSchemaRepairFields(teamPlayerSchemaDiff)
    const teamPlayerUnexpected = classifyUnexpectedSchemaFields({
      scope: PLAYER_DOCUMENT_SCHEMA_SCOPES.TEAM_PLAYER,
      fields: teamPlayerSchemaDiff.unexpectedFields,
    })

    if (teamPlayerRepairFields.length || teamPlayerUnexpected.unexpectedFields.length) {
      const invalidTypes = Array.isArray(teamPlayerSchemaDiff.invalidTypes)
        ? teamPlayerSchemaDiff.invalidTypes
        : []
      issues.push({
        type: 'team_player_schema_outdated',
        severity: 'medium',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        birthTeamDocumentId: row.birthTeamDocumentId,
        birthTeamId: row.birthTeamId,
        clubId: row.clubId,
        teamName: row.teamName,
        missingFields: teamPlayerRepairFields.map(field => `teamPlayer.${field}`),
        unexpectedFields: teamPlayerUnexpected.unexpectedFields.map(
          field => `teamPlayer.${field}`
        ),
        deprecatedFields: teamPlayerUnexpected.deprecatedFields.map(
          field => `teamPlayer.${field}`
        ),
        reportOnlyUnexpectedFields: teamPlayerUnexpected.reportOnlyUnexpectedFields.map(
          field => `teamPlayer.${field}`
        ),
        invalidTypes,
        migrationAction: resolveSchemaMigrationAction({
          missingFields: teamPlayerRepairFields,
          invalidTypes,
          deprecatedFields: teamPlayerUnexpected.deprecatedFields,
          reportOnlyUnexpectedFields: teamPlayerUnexpected.reportOnlyUnexpectedFields,
        }),
      })
    }

    const storedMeasurements = row.teamScoutStatsLoadMeasurements || {}
    const currentMeasurement = storedMeasurements.current || null
    const expectedMeasurements = row.expectedScoutStatsLoadMeasurements || {}
    const measurementDiff = buildMeasurementFieldDiff({
      actual: currentMeasurement,
      expected: expectedMeasurements.current,
    })
    const hasExpectedMeasurement = Boolean(expectedMeasurements.current)
    const measurementOutdated = hasExpectedMeasurement
      ? measurementDiff.mismatchedFields.length > 0
      : (
          !currentMeasurement ||
          clean(currentMeasurement.snapshotKey) !== clean(row.teamStatsSnapshotKey)
        )

    if (
      row.statsStatus === 'loaded' &&
      measurementOutdated
    ) {
      issues.push({
        type: 'team_stats_measurement_outdated',
        severity: 'medium',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        expectedSnapshotKey: clean(
          expectedMeasurements.current?.snapshotKey ||
          row.teamStatsSnapshotKey
        ),
        actualSnapshotKey: clean(currentMeasurement?.snapshotKey),
        actualMeasurement: measurementDiff.actual,
        expectedMeasurement: measurementDiff.expected,
        mismatchedMeasurementFields: measurementDiff.mismatchedFields,
        mismatchedFields: measurementDiff.mismatchedFields,
      })
    }

    if (Array.isArray(row.teamScoutStateMissingFields) && row.teamScoutStateMissingFields.length) {
      issues.push({
        type: 'team_player_state_outdated',
        severity: 'medium',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        birthTeamDocumentId: row.birthTeamDocumentId,
        birthTeamId: row.birthTeamId,
        clubId: row.clubId,
        teamName: row.teamName,
        missingFields: row.teamScoutStateMissingFields.map(field => `teamPlayer.${field}`),
      })
    }

    const teamScoutStateMismatchFields = getTeamScoutStateMismatchedFields({
      actual: row.actualScoutState,
      expected: row.expectedTeamScoutState,
    })
    if (row.canRecalculateScout && teamScoutStateMismatchFields.length) {
      issues.push({
        type: 'team_scout_state_mismatch',
        severity: 'medium',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        mismatchedFields: teamScoutStateMismatchFields,
      })
    }

    if (
      row.canRecalculateScout && (
        !sameValues(row.expectedTeamProfileIds, row.actualProfileIds) ||
        !sameValues(row.expectedTeamCombinationIds, row.actualCombinationIds)
      )
    ) {
      const issue = buildIssue({
        type: 'birth_team_mismatch',
        source: 'dbBirthTeams',
        row,
        expectedProfiles: row.expectedTeamProfileIds,
        expectedCombinations: row.expectedTeamCombinationIds,
        actualProfiles: row.actualProfileIds,
        actualCombinations: row.actualCombinationIds,
      })

      issue.severity = issue.missingProfiles.length
        ? 'high'
        : 'medium'
      issues.push(issue)
    }

    if (
      row.sourceTarget === 'current' &&
      !['active', 'completed'].includes(row.storedSeasonStatus)
    ) {
      issues.push({
        type: 'current_season_status_invalid',
        severity: 'high',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        actualSeasonStatus: row.storedSeasonStatus || 'missing',
        expectedSeasonStatus: 'active',
      })
    }

    if (
      row.sourceTarget === 'history' &&
      row.storedSeasonStatus !== 'completed'
    ) {
      issues.push({
        type: 'history_season_status_invalid',
        severity: 'high',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        actualSeasonStatus: row.storedSeasonStatus || 'missing',
        expectedSeasonStatus: 'completed',
      })
    }

    if (
      row.canRecalculateScout &&
      sameValues(row.expectedTeamProfileIds, row.actualProfileIds) &&
      !sameReliability(
        row.expectedTeamReliabilityByProfile,
        row.actualReliabilityByProfile
      )
    ) {
      issues.push({
        type: 'birth_team_reliability_mismatch',
        severity: 'medium',
        source: 'dbBirthTeams',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        expectedReliability: row.expectedTeamReliabilityByProfile,
        actualReliability: row.actualReliabilityByProfile,
      })
    }

    const playerRow = findIndexed({
      index: playerIndex,
      row,
      keyBuilder: buildPlayerKeys,
    })
    const searchRow = findIndexed({
      index: searchIndex,
      row,
      keyBuilder: buildPlayerKeys,
    })

    if (playerRow) {
      const playerSeasonContext = buildPlayerSeasonContextComparison({
        row,
        playerRow,
      })

      if (playerSeasonContext.mismatchedFields.length) {
        issues.push({
          type: 'player_season_context_outdated',
          severity: 'medium',
          source: 'dbPlayers',
          playerId: row.playerId,
          playerDocumentId: clean(
            playerRow.playerDocumentId || row.playerDocumentId
          ),
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          birthTeamDocumentId: row.birthTeamDocumentId,
          birthTeamId: row.birthTeamId,
          clubId: row.clubId,
          teamName: row.teamName,
          mismatchedFields: playerSeasonContext.mismatchedFields,
          actualContext: playerSeasonContext.actual,
          expectedContext: playerSeasonContext.expected,
        })
      }

      const rootMissingFields = Array.isArray(
        playerRow.rootSchemaMissingFields
      ) ? playerRow.rootSchemaMissingFields : []
      const seasonMissingFields = Array.isArray(
        playerRow.seasonSchemaMissingFields
      ) ? playerRow.seasonSchemaMissingFields : []
      const rootUnexpected = classifyUnexpectedSchemaFields({
        scope: PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_ROOT,
        fields: playerRow.rootSchemaUnexpectedFields,
      })
      const seasonUnexpected = classifyUnexpectedSchemaFields({
        scope: PLAYER_DOCUMENT_SCHEMA_SCOPES.PLAYER_SEASON,
        fields: playerRow.seasonSchemaUnexpectedFields,
      })
      const rootUnexpectedFields = rootUnexpected.unexpectedFields
      const seasonUnexpectedFields = seasonUnexpected.unexpectedFields
      const rootInvalidTypes = Array.isArray(playerRow.rootSchemaInvalidTypes)
        ? playerRow.rootSchemaInvalidTypes
        : []
      const seasonInvalidTypes = Array.isArray(playerRow.seasonSchemaInvalidTypes)
        ? playerRow.seasonSchemaInvalidTypes
        : []
      const rootRepairFields = unique([
        ...rootMissingFields.map(topLevelFieldOf),
        ...rootInvalidTypes.map(item => topLevelFieldOf(item.field)),
      ])
      const seasonRepairFields = unique([
        ...seasonMissingFields.map(topLevelFieldOf),
        ...seasonInvalidTypes.map(item => topLevelFieldOf(item.field)),
      ])
      const rootPlayerKey = clean(
        playerRow.playerDocumentId ||
        playerRow.sourceDocumentId ||
        row.playerDocumentId ||
        row.playerId
      )

      if (
        (rootRepairFields.length || rootUnexpectedFields.length) &&
        rootPlayerKey &&
        !reportedRootSchemaPlayerIds.has(rootPlayerKey)
      ) {
        reportedRootSchemaPlayerIds.add(rootPlayerKey)
        issues.push({
          type: 'player_schema_outdated',
          severity: 'medium',
          source: 'dbPlayers',
          schemaScope: 'root',
          playerId: row.playerId,
          playerDocumentId: clean(
            playerRow.playerDocumentId || row.playerDocumentId
          ),
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          birthTeamDocumentId: row.birthTeamDocumentId,
          birthTeamId: row.birthTeamId,
          clubId: row.clubId,
          teamName: row.teamName,
          missingFields: rootRepairFields,
          unexpectedFields: rootUnexpectedFields,
          deprecatedFields: rootUnexpected.deprecatedFields,
          reportOnlyUnexpectedFields: rootUnexpected.reportOnlyUnexpectedFields,
          invalidTypes: rootInvalidTypes,
          migrationAction: resolveSchemaMigrationAction({
            missingFields: rootRepairFields,
            invalidTypes: rootInvalidTypes,
            deprecatedFields: rootUnexpected.deprecatedFields,
            reportOnlyUnexpectedFields: rootUnexpected.reportOnlyUnexpectedFields,
          }),
        })
      }

      const narrativeMissingFields = Array.isArray(
        playerRow.narrativeSchemaMissingFields
      )
        ? playerRow.narrativeSchemaMissingFields
        : []
      const narrativeUnexpectedFields = Array.isArray(
        playerRow.narrativeSchemaUnexpectedFields
      )
        ? playerRow.narrativeSchemaUnexpectedFields
        : []
      const narrativeInvalidTypes = Array.isArray(
        playerRow.narrativeSchemaInvalidTypes
      )
        ? playerRow.narrativeSchemaInvalidTypes
        : []

      if (
        (
          narrativeMissingFields.length ||
          narrativeUnexpectedFields.length ||
          narrativeInvalidTypes.length
        ) &&
        rootPlayerKey &&
        !reportedNarrativePlayerIds.has(rootPlayerKey)
      ) {
        reportedNarrativePlayerIds.add(rootPlayerKey)
        issues.push({
          type: 'player_narrative_schema_invalid',
          severity: 'low',
          source: 'dbPlayers',
          playerId: row.playerId,
          playerDocumentId: clean(
            playerRow.playerDocumentId || row.playerDocumentId
          ),
          fullName: row.fullName,
          missingFields: narrativeMissingFields.map(
            field => `scoutNarrative.${field}`
          ),
          unexpectedFields: narrativeUnexpectedFields.map(
            field => `scoutNarrative.${field}`
          ),
          invalidTypes: narrativeInvalidTypes.map(item => ({
            ...item,
            field: `scoutNarrative.${item.field}`,
          })),
          migrationAction: 'report_only',
          repairable: false,
        })
      }

      if (seasonRepairFields.length || seasonUnexpectedFields.length) {
        issues.push({
          type: 'player_schema_outdated',
          severity: 'medium',
          source: 'dbPlayers',
          schemaScope: 'season',
          playerId: row.playerId,
          playerDocumentId: clean(
            playerRow.playerDocumentId || row.playerDocumentId
          ),
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          birthTeamDocumentId: row.birthTeamDocumentId,
          birthTeamId: row.birthTeamId,
          clubId: row.clubId,
          teamName: row.teamName,
          missingFields: seasonRepairFields.map(
            field => `season.${field}`
          ),
          unexpectedFields: seasonUnexpectedFields.map(
            field => `season.${field}`
          ),
          deprecatedFields: seasonUnexpected.deprecatedFields.map(
            field => `season.${field}`
          ),
          reportOnlyUnexpectedFields: seasonUnexpected.reportOnlyUnexpectedFields.map(
            field => `season.${field}`
          ),
          invalidTypes: seasonInvalidTypes,
          migrationAction: resolveSchemaMigrationAction({
            missingFields: seasonRepairFields,
            invalidTypes: seasonInvalidTypes,
            deprecatedFields: seasonUnexpected.deprecatedFields,
            reportOnlyUnexpectedFields: seasonUnexpected.reportOnlyUnexpectedFields,
          }),
        })
      }

      if (
        rootPlayerKey &&
        !reportedTrackingPlayerIds.has(rootPlayerKey) &&
        !sameValues(
          sorted(playerRow.expectedTrackingReasons),
          sorted(playerRow.trackingReasons)
        )
      ) {
        reportedTrackingPlayerIds.add(rootPlayerKey)
        issues.push({
          type: 'player_tracking_mismatch',
          severity: 'medium',
          source: 'dbPlayers',
          schemaScope: 'root',
          playerId: row.playerId,
          playerDocumentId: clean(
            playerRow.playerDocumentId || row.playerDocumentId
          ),
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          teamName: row.teamName,
          expectedTrackingReasons: sorted(playerRow.expectedTrackingReasons),
          actualTrackingReasons: sorted(playerRow.trackingReasons),
          missingFields: ['tracking.trackingReasons'],
        })
      }

      const teamMeasurements = (
        row.expectedScoutStatsLoadMeasurements ||
        row.teamScoutStatsLoadMeasurements ||
        {}
      )
      const expectedMeasurementHistory = buildPlayerScoutStatsLoadMeasurementHistory({
        existingHistory: playerRow.scoutStatsLoadMeasurementHistory,
        measurements: teamMeasurements,
      })
      const actualMeasurementKeys = measurementIdentityKeys(
        playerRow.scoutStatsLoadMeasurementHistory
      )
      const expectedMeasurementKeys = measurementIdentityKeys(
        expectedMeasurementHistory
      )

      if (
        teamMeasurements.current &&
        !sameValues(expectedMeasurementKeys, actualMeasurementKeys)
      ) {
        issues.push({
          type: 'player_measurement_history_outdated',
          severity: 'medium',
          source: 'dbPlayers',
          schemaScope: 'season',
          playerId: row.playerId,
          playerDocumentId: clean(
            playerRow.playerDocumentId || row.playerDocumentId
          ),
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          birthTeamDocumentId: row.birthTeamDocumentId,
          birthTeamId: row.birthTeamId,
          clubId: row.clubId,
          teamName: row.teamName,
          expectedMeasurementKeys,
          actualMeasurementKeys,
          missingFields: ['season.scoutStatsLoadMeasurementHistory'],
        })
      }
    }

    if (row.playerDocumentTrackingRequired && !playerRow) {
      const computedTrackingReasons = sorted(row.expectedTrackingReasons)

      issues.push({
        ...buildIssue({
          type: 'missing_player_document',
          source: 'dbPlayers',
          row,
          playerRow,
          searchRow,
          expectedProfiles: row.actualProfileIds,
          expectedCombinations: row.actualCombinationIds,
        }),
        expectedTrackingReasons: row.expectedTrackingReasons,
        computedTrackingReasons,
        shouldHavePlayerDocument: true,
        scoutProfileIds: getProfileIds(row),
        scoutProfileDetails: getProfileDetails(row),
        professionalProfileIds: getProfessionalProfileIds(row),
        favorite: row.tracking?.favorite === true || row.favorite === true,
        watchlist: row.tracking?.watchlist === true || row.watchlist === true,
        manualTracking: computedTrackingReasons.includes(
          SCOUTING_PLAYER_TRACKING_REASONS.MANUAL
        ),
        transferTracking: computedTrackingReasons.includes(
          SCOUTING_PLAYER_TRACKING_REASONS.TRANSFER
        ),
      })
    } else if (
      playerRow &&
      clean(playerRow.seasonStatus) !== clean(row.expectedSeasonStatus)
    ) {
      issues.push({
        type: 'player_season_status_mismatch',
        severity: 'high',
        source: 'dbPlayers',
        schemaScope: 'season',
        playerId: row.playerId,
        playerDocumentId: clean(
          playerRow.playerDocumentId || row.playerDocumentId
        ),
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        birthTeamDocumentId: row.birthTeamDocumentId,
        birthTeamId: row.birthTeamId,
        clubId: row.clubId,
        teamName: row.teamName,
        actualSeasonStatus: clean(playerRow.seasonStatus) || 'missing',
        expectedSeasonStatus: row.expectedSeasonStatus,
        missingFields: ['season.seasonStatus'],
      })
    } else if (playerRow && row.canRecalculateScout && (
      !sameValues(row.expectedPlayerProfileIds, playerRow.profileIds) ||
      !sameValues(row.expectedPlayerCombinationIds, playerRow.combinationIds)
    )) {
      issues.push(buildIssue({
        type: 'player_document_mismatch',
        source: 'dbPlayers',
        row,
        playerRow,
        searchRow,
        expectedProfiles: row.expectedPlayerProfileIds,
        expectedCombinations: row.expectedPlayerCombinationIds,
        actualProfiles: playerRow.profileIds,
        actualCombinations: playerRow.combinationIds,
      }))
    }

    if (
      playerRow &&
      row.canRecalculateScout &&
      sameValues(row.expectedPlayerProfileIds, playerRow.profileIds) &&
      !sameReliability(
        row.expectedPlayerReliabilityByProfile,
        playerRow.reliabilityByProfile
      )
    ) {
      issues.push({
        type: 'player_document_reliability_mismatch',
        severity: 'medium',
        source: 'dbPlayers',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        expectedReliability: row.expectedPlayerReliabilityByProfile,
        actualReliability: playerRow.reliabilityByProfile,
      })
    }

    if (playerRow) {
      const playerScoutStateMismatchFields = getMismatchedFields({
        actual: playerRow.scoutState,
        expected: row.expectedPlayerScoutState,
      })

      if (row.canRecalculateScout && playerScoutStateMismatchFields.length) {
        issues.push({
          type: 'player_scout_state_mismatch',
          severity: 'medium',
          source: 'dbPlayers',
          playerId: row.playerId,
          playerDocumentId: clean(
            playerRow.playerDocumentId || row.playerDocumentId
          ),
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          teamName: row.teamName,
          mismatchedFields: playerScoutStateMismatchFields,
        })
      }
    }

    if (
      row.statsStatus === 'loaded' &&
      clean(row.rosterStatus) !== 'retired' &&
      !searchRow
    ) {
      issues.push(buildIssue({
        type: 'missing_search_index',
        source: 'dbSearchIndexes',
        row,
        playerRow,
        searchRow,
        expectedProfiles: row.canonicalProjectionProfileIds,
        expectedCombinations: row.canonicalProjectionCombinationIds,
      }))
    } else if (
      searchRow &&
      clean(searchRow.seasonStatus) !== clean(row.expectedSeasonStatus)
    ) {
      issues.push({
        type: 'search_index_season_status_mismatch',
        severity: 'high',
        source: 'dbSearchIndexes',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        searchIndexDocumentId: row.searchIndexDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        actualSeasonStatus: clean(searchRow.seasonStatus) || 'missing',
        expectedSeasonStatus: row.expectedSeasonStatus,
        missingFields: ['seasonStatus'],
        expected: {
          seasonStatus: row.expectedSeasonStatus,
        },
        actual: {
          seasonStatus: clean(searchRow.seasonStatus) || '',
        },
        repairData: {
          writer: 'DIRECT_PLAYER_SEARCH_INDEX',
          fields: {
            seasonStatus: row.expectedSeasonStatus,
          },
        },
      })
    } else if (searchRow && (
      !sameValues(row.canonicalProjectionProfileIds, searchRow.profileIds) ||
      !sameValues(row.canonicalProjectionCombinationIds, searchRow.combinationIds)
    )) {
      issues.push(buildIssue({
        type: 'search_index_mismatch',
        source: 'dbSearchIndexes',
        row,
        expectedProfiles: row.canonicalProjectionProfileIds,
        expectedCombinations: row.canonicalProjectionCombinationIds,
        playerRow,
        searchRow,
        actualProfiles: searchRow.profileIds,
        actualCombinations: searchRow.combinationIds,
      }))
    }

    if (
      searchRow &&
      sameValues(row.canonicalProjectionProfileIds, searchRow.profileIds) &&
      !sameSearchReliability({
        expected: row.canonicalProjectionReliabilityByProfile,
        actual: searchRow.reliabilityByProfile,
      })
    ) {
      issues.push({
        type: 'search_index_reliability_mismatch',
        severity: 'medium',
        source: 'dbSearchIndexes',
        playerId: row.playerId,
        playerDocumentId: row.playerDocumentId,
        fullName: row.fullName,
        seasonId: row.seasonId,
        seasonKey: row.seasonKey,
        teamDocumentId: row.teamDocumentId,
        teamName: row.teamName,
        expectedReliability: row.canonicalProjectionReliabilityByProfile,
        actualReliability: searchRow.reliabilityByProfile,
      })
    }


    if (searchRow) {
      const searchSchemaDiff = searchRow.searchSchemaDiff || {}
      const searchRepairFields = getSchemaRepairFields(searchSchemaDiff)
      const searchUnexpected = classifyUnexpectedSchemaFields({
        scope: PLAYER_DOCUMENT_SCHEMA_SCOPES.SEARCH_INDEX,
        fields: searchSchemaDiff.unexpectedFields,
      })
      const searchUnexpectedFields = searchUnexpected.unexpectedFields

      if (searchRepairFields.length || searchUnexpectedFields.length) {
        const invalidTypes = Array.isArray(searchSchemaDiff.invalidTypes)
          ? searchSchemaDiff.invalidTypes
          : []
        issues.push({
          type: 'search_index_schema_outdated',
          severity: 'medium',
          source: 'dbSearchIndexes',
          playerId: row.playerId,
          playerDocumentId: row.playerDocumentId,
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          teamName: row.teamName,
          missingFields: searchRepairFields,
          unexpectedFields: searchUnexpectedFields,
          deprecatedFields: searchUnexpected.deprecatedFields,
          reportOnlyUnexpectedFields: searchUnexpected.reportOnlyUnexpectedFields,
          invalidTypes,
          migrationAction: resolveSchemaMigrationAction({
            missingFields: searchRepairFields,
            invalidTypes,
            deprecatedFields: searchUnexpected.deprecatedFields,
            reportOnlyUnexpectedFields: searchUnexpected.reportOnlyUnexpectedFields,
          }),
        })
      }

      const mismatchedScoutFields = Object.keys(
        row.expectedSearchIndexScoutFields || {}
      ).filter(field => (
        !sameJson(
          searchRow[field],
          row.expectedSearchIndexScoutFields?.[field]
        )
      ))

      if (mismatchedScoutFields.length) {
        const expectedScoutFields = mismatchedScoutFields.reduce(
          (result, field) => {
            result[field] = row.expectedSearchIndexScoutFields?.[field]
            return result
          },
          {}
        )
        const actualScoutFields = mismatchedScoutFields.reduce(
          (result, field) => {
            result[field] = searchRow[field]
            return result
          },
          {}
        )

        issues.push({
          type: 'search_index_scout_projection_mismatch',
          severity: 'medium',
          source: 'dbSearchIndexes',
          playerId: row.playerId,
          playerDocumentId: row.playerDocumentId,
          searchIndexDocumentId: row.searchIndexDocumentId,
          fullName: row.fullName,
          seasonId: row.seasonId,
          seasonKey: row.seasonKey,
          teamDocumentId: row.teamDocumentId,
          teamName: row.teamName,
          missingFields: mismatchedScoutFields,
          expected: expectedScoutFields,
          actual: actualScoutFields,
          repairData: {
            writer: 'DIRECT_PLAYER_SEARCH_INDEX',
            fields: expectedScoutFields,
          },
        })
      }
    }
  })

  return issues.map(issue => {
    const auditCategory = resolveAuditCategory(issue.type)
    const repairable = issue?.repairable === false
      ? false
      : issue.migrationAction === 'report_only'
        ? false
        : auditCategory !== PLAYER_SCOUT_AUDIT_CATEGORY.ENGINE_DIAGNOSTIC

    return {
      ...issue,
      auditCategory,
      repairable,
    }
  })
}

const countValues = values => values.reduce((result, value) => {
  const key = clean(value) || 'unknown'
  result[key] = (result[key] || 0) + 1
  return result
}, {})

const buildSummary = ({
  teamRows,
  skippedRows,
  playerRows,
  searchRows,
  teamIndexRows,
  issues,
}) => {
  const birthTeamIssues = issues.filter(issue => (
    issue.type === 'birth_team_mismatch'
  ))
  const syncIssues = issues.filter(issue => (
    issue.auditCategory === PLAYER_SCOUT_AUDIT_CATEGORY.SYNCHRONIZATION
  ))
  const engineDiagnosticIssues = issues.filter(issue => (
    issue.auditCategory === PLAYER_SCOUT_AUDIT_CATEGORY.ENGINE_DIAGNOSTIC
  ))
  const reliabilityIssues = issues.filter(issue => (
    issue.type.includes('reliability_mismatch')
  ))
  const seasonStatusIssues = issues.filter(issue => ([
    'current_season_status_invalid',
    'history_season_status_invalid',
    'player_season_status_mismatch',
    'search_index_season_status_mismatch',
  ].includes(issue.type)))
  const schemaIssues = issues.filter(issue => [
    'team_player_schema_outdated',
    'player_schema_outdated',
    'search_index_schema_outdated',
    'player_narrative_schema_invalid',
  ].includes(issue.type))
  const schemaAutoRepairIssues = schemaIssues.filter(issue => (
    issue.migrationAction === 'auto_repair'
  ))
  const schemaSafeDeleteIssues = schemaIssues.filter(issue => (
    issue.migrationAction === 'safe_delete'
  ))
  const schemaReportOnlyIssues = schemaIssues.filter(issue => (
    issue.migrationAction === 'report_only'
  ))
  const measurementIssues = issues.filter(issue => [
    'team_stats_measurement_outdated',
    'player_measurement_history_outdated',
  ].includes(issue.type))
  const trackingIssues = issues.filter(issue => (
    issue.type === 'player_tracking_mismatch'
  ))
  const projectionIssues = issues.filter(issue => (
    issue.type === 'search_index_scout_projection_mismatch'
  ))

  const stateIssues = issues.filter(issue => [
    'team_scout_state_mismatch',
    'player_scout_state_mismatch',
  ].includes(issue.type))

  return {
    checkedTeamPlayerRows: teamRows.length,
    skippedRows: skippedRows.length,
    playerSeasonRows: playerRows.length,
    searchPlayerDocuments: searchRows.length,
    teamSeasonIndexes: teamIndexRows.length,
    rowsWithProfileDiff: birthTeamIssues.length,
    missingProfilesCount: birthTeamIssues.reduce(
      (sum, issue) => sum + issue.missingProfiles.length,
      0
    ),
    extraProfilesCount: birthTeamIssues.reduce(
      (sum, issue) => sum + issue.extraProfiles.length,
      0
    ),
    syncIssuesCount: syncIssues.length,
    engineDiagnosticIssuesCount: engineDiagnosticIssues.length,
    repairableIssuesCount: issues.filter(issue => issue.repairable !== false).length,
    reportOnlyIssuesCount: issues.filter(issue => issue.repairable === false).length,
    reliabilityIssuesCount: reliabilityIssues.length,
    historyStatusIssuesCount: seasonStatusIssues.length,
    seasonStatusIssuesCount: seasonStatusIssues.length,
    schemaIssuesCount: schemaIssues.length,
    schemaAutoRepairIssuesCount: schemaAutoRepairIssues.length,
    schemaSafeDeleteIssuesCount: schemaSafeDeleteIssues.length,
    schemaReportOnlyIssuesCount: schemaReportOnlyIssues.length,
    measurementIssuesCount: measurementIssues.length,
    trackingIssuesCount: trackingIssues.length,
    projectionIssuesCount: projectionIssues.length,
    stateIssuesCount: stateIssues.length,
    totalIssues: issues.length,
    missingProfilesById: countValues(
      birthTeamIssues.flatMap(issue => issue.missingProfiles)
    ),
    extraProfilesById: countValues(
      birthTeamIssues.flatMap(issue => issue.extraProfiles)
    ),
    issuesByType: countValues(issues.map(issue => issue.type)),
    issuesBySource: countValues(issues.map(issue => issue.source)),
  }
}

const buildAuditScopeStats = searchRows => {
  const scopes = new Map()

  ;(Array.isArray(searchRows) ? searchRows : []).forEach(row => {
    const teamDocumentId = clean(row.teamDocumentId)
    const seasonKey = clean(row.seasonKey || row.seasonId)
    if (!teamDocumentId || !seasonKey) return

    const scopeKey = `${teamDocumentId}::${seasonKey}`
    const current = scopes.get(scopeKey) || {
      scopeKey,
      teamDocumentId,
      seasonKey,
      clubIds: [],
      teamIds: [],
      playerSearchIndexes: 0,
    }

    current.clubIds = unique([
      ...current.clubIds,
      row.clubId,
    ])
    current.teamIds = unique([
      ...current.teamIds,
      row.teamId,
      row.birthTeamId,
    ])
    current.playerSearchIndexes += 1
    scopes.set(scopeKey, current)
  })

  return [...scopes.values()]
}

const buildRuntimeCost = ({ teamRows = [], playerRows = [], searchRows = [], teamIndexRows = [] } = {}) => {
  const playerIndex = buildIndex({
    rows: playerRows,
    keyBuilder: buildPlayerKeys,
  })
  const scopeKeys = unique(
    teamRows.map(row => [
      clean(row.teamDocumentId),
      clean(row.seasonKey || row.seasonId),
      clean(row.sourceTarget),
    ].join('::'))
  )
  const trackedPlayerDocumentIds = new Set()
  let profiledPlayers = 0
  let playerDocumentSyncPlayers = 0
  let untrackedLookupCandidates = 0
  let existingUntrackedPlayerDocuments = 0

  teamRows.forEach(row => {
    const playerRow = findIndexed({
      index: playerIndex,
      row,
      keyBuilder: buildPlayerKeys,
    })
    const hasProfiles = Array.isArray(row.actualProfileIds) && row.actualProfileIds.length > 0
    const hasLocalDocumentId = Boolean(clean(row.playerDocumentId))

    if (hasProfiles) profiledPlayers += 1
    if (playerRow?.playerDocumentId || playerRow?.sourceDocumentId) {
      trackedPlayerDocumentIds.add(
        clean(playerRow.playerDocumentId || playerRow.sourceDocumentId)
      )
    }
    if (hasProfiles || hasLocalDocumentId || playerRow) {
      playerDocumentSyncPlayers += 1
    }

    if (!hasProfiles && !hasLocalDocumentId) {
      untrackedLookupCandidates += 1
      if (playerRow) existingUntrackedPlayerDocuments += 1
    }
  })

  return buildPlayerScoutRuntimeCostCheck({
    teamSeasonScopes: scopeKeys.length,
    teamPlayers: teamRows.length,
    trackedPlayerDocuments: trackedPlayerDocumentIds.size,
    profiledPlayers,
    playerDocumentSyncPlayers,
    untrackedLookupCandidates,
    existingUntrackedPlayerDocuments,
    playerSearchIndexes: searchRows.length,
    teamSearchIndexes: teamIndexRows.length,
  })
}

const readAuditData = async ({ includeRepairData = false } = {}) => {
  let remainingReadBudget = PLAYER_SCOUT_AUDIT_READ_SAFETY_LIMIT

  const teamRead = await readAuditSnapshotWithinBudget({
    source: collection(db, PLAYERS_DATABASE_COLLECTIONS.teams),
    metadata: {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.teams,
      action: 'playerScoutRules-audit',
      operationSubtype: 'audit-read',
    },
    budget: remainingReadBudget,
    reservedReads: 2,
    label: 'team documents',
  })
  const teamSnapshot = teamRead.snapshot
  remainingReadBudget -= teamRead.readsUsed

  const playerRead = await readAuditSnapshotWithinBudget({
    source: collection(db, PLAYERS_DATABASE_COLLECTIONS.players),
    metadata: {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.players,
      action: 'playerScoutRules-audit',
      operationSubtype: 'audit-read',
    },
    budget: remainingReadBudget,
    reservedReads: 1,
    label: 'player documents',
  })
  const playerSnapshot = playerRead.snapshot
  remainingReadBudget -= playerRead.readsUsed

  const searchRead = await readAuditSnapshotWithinBudget({
    source: query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', 'in', ['playerSeason', 'birthTeamSeason'])
    ),
    metadata: {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerScoutRules-audit',
      operationSubtype: 'scout-index-query',
    },
    budget: remainingReadBudget,
    label: 'search index documents',
  })
  const searchSnapshot = searchRead.snapshot
  remainingReadBudget -= searchRead.readsUsed

  const playerSearchDocs = searchSnapshot.docs.filter(snapshot => (
    clean(snapshot.data()?.entityType) === 'playerSeason'
  ))
  const teamSearchDocs = searchSnapshot.docs.filter(snapshot => (
    clean(snapshot.data()?.entityType) === 'birthTeamSeason'
  ))
  const teamIndexRows = flattenTeamIndexDocs(teamSearchDocs)
  const playerRows = flattenPlayerDocs(playerSnapshot.docs)
  const searchRows = flattenSearchPlayerDocs(playerSearchDocs)
  const recalculated = buildRecalculatedRows({
    teamDocs: teamSnapshot.docs,
    teamIndexRows,
    playerRows,
    searchRows,
    includeRepairData,
  })

  const documentRewritePlan = includeRepairData
    ? buildPlayerScoutDocumentRewritePlan({
        teamSnapshots: teamSnapshot.docs,
        playerSnapshots: playerSnapshot.docs,
        playerSearchSnapshots: playerSearchDocs,
        teamSearchSnapshots: teamSearchDocs,
        recalculatedRows: recalculated.rows,
      })
    : null

  return {
    teamRows: recalculated.rows,
    skippedRows: recalculated.skipped,
    playerRows,
    searchRows,
    teamIndexRows,
    documentRewritePlan,
    cost: {
      audit: buildPlayerScoutAuditCost({
        teamDocuments: teamSnapshot.docs.length,
        playerDocuments: playerSnapshot.docs.length,
        playerSearchIndexes: playerSearchDocs.length,
        teamSearchIndexes: teamSearchDocs.length,
      }),
      runtime: buildRuntimeCost({
        teamRows: recalculated.rows,
        playerRows,
        searchRows,
        teamIndexRows,
      }),
      scopeStats: buildAuditScopeStats(searchRows),
      readSafety: {
        hardLimit: PLAYER_SCOUT_AUDIT_READ_HARD_LIMIT,
        safetyLimit: PLAYER_SCOUT_AUDIT_READ_SAFETY_LIMIT,
        readsUsed: PLAYER_SCOUT_AUDIT_READ_SAFETY_LIMIT - remainingReadBudget,
        remainingBudget: remainingReadBudget,
      },
    },
  }
}


const readScopedAuditData = async ({
  teamDocumentId,
  seasonKey,
  includeRepairData = false,
  readSafetyLimit = PLAYER_SCOUT_AUDIT_READ_BUDGETS.TEAM_SEASON,
}) => {
  const safeTeamDocumentId = clean(teamDocumentId)
  const safeSeasonKey = clean(seasonKey)
  const searchIndexSeasonKey = normalizeSeasonLookupKey(safeSeasonKey)

  if (!safeTeamDocumentId) {
    throw new Error('Missing team document id for scoped scout audit')
  }
  if (!safeSeasonKey) {
    throw new Error('Missing season key for scoped scout audit')
  }

  const scopedReadSafetyLimit = Math.min(
    PLAYER_SCOUT_AUDIT_READ_BUDGETS.TEAM_SEASON,
    Math.max(1, Number(readSafetyLimit || 0))
  )
  let remainingReadBudget = scopedReadSafetyLimit

  if (remainingReadBudget < 3) {
    throw new Error(
      'Scoped player scout audit stopped: fewer than 3 reads remain in the shared safety budget.'
    )
  }

  const teamSnapshot = await trackedGetDoc(
    doc(
      db,
      PLAYERS_DATABASE_COLLECTIONS.teams,
      safeTeamDocumentId
    ),
    {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.teams,
      action: 'playerScoutRules-scopedAudit',
      operationSubtype: 'team-read',
    }
  )
  remainingReadBudget -= 1

  if (!teamSnapshot.exists()) {
    throw new Error(`Team document not found: ${safeTeamDocumentId}`)
  }

  const preflightRecalculated = buildRecalculatedRows({
    teamDocs: [teamSnapshot],
    teamIndexRows: [],
    includeRepairData: false,
  })
  const preflightTeamRows = preflightRecalculated.rows.filter(row => (
    isSameSeason(
      row,
      {
        seasonId: safeSeasonKey,
        seasonKey: safeSeasonKey,
      }
    )
  ))
  const readPlan = buildTeamSeasonScoutAuditReadPlan({
    teamPlayersCount: preflightTeamRows.length,
    requestedReadLimit: readSafetyLimit,
  })
  assertTeamSeasonScoutAuditReadPlan(readPlan)

  const playerSearchRead = await readAuditSnapshotWithinBudget({
    source: query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', '==', 'playerSeason'),
      where('teamDocumentId', '==', safeTeamDocumentId),
      where('seasonKey', '==', searchIndexSeasonKey)
    ),
    metadata: {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerScoutRules-scopedAudit',
      operationSubtype: 'player-index-query',
    },
    budget: remainingReadBudget,
    reservedReads: 1,
    label: 'scoped player search indexes',
  })
  remainingReadBudget -= playerSearchRead.readsUsed
  const playerSearchSnapshot = playerSearchRead.snapshot

  const teamSearchRead = await readAuditSnapshotWithinBudget({
    source: query(
      collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
      where('entityType', '==', 'birthTeamSeason'),
      where('teamDocumentId', '==', safeTeamDocumentId),
      where('seasonKey', '==', searchIndexSeasonKey)
    ),
    metadata: {
      feature: 'playersDatabase',
      collection: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
      action: 'playerScoutRules-scopedAudit',
      operationSubtype: 'team-index-query',
    },
    budget: remainingReadBudget,
    label: 'scoped team search indexes',
  })
  remainingReadBudget -= teamSearchRead.readsUsed
  const teamSearchSnapshot = teamSearchRead.snapshot

  const teamIndexRows = flattenTeamIndexDocs(teamSearchSnapshot.docs)
  const recalculatedAll = buildRecalculatedRows({
    teamDocs: [teamSnapshot],
    teamIndexRows,
    includeRepairData,
  })
  const teamRows = recalculatedAll.rows.filter(row => (
    isSameSeason(
      row,
      {
        seasonId: safeSeasonKey,
        seasonKey: safeSeasonKey,
      }
    )
  ))
  const scopedSearchRows = flattenSearchPlayerDocs(
    playerSearchSnapshot.docs
  )
  const scopedSearchIndex = buildIndex({
    rows: scopedSearchRows,
    keyBuilder: buildPlayerKeys,
  })
  const playerDocumentIds = unique(
    teamRows.map(row => {
      const searchRow = findIndexed({
        index: scopedSearchIndex,
        row,
        keyBuilder: buildPlayerKeys,
      })

      return resolvePreferredPlayerDocumentId({
        row,
        searchRow,
      })
    })
  )
  if (playerDocumentIds.length > remainingReadBudget) {
    throw new Error(
      `Scoped player scout audit stopped before player reads: ${playerDocumentIds.length} ` +
      `documents are required but only ${remainingReadBudget} reads remain in the safety budget.`
    )
  }

  const playerSnapshots = await Promise.all(
    playerDocumentIds.map(playerDocumentId => trackedGetDoc(
      doc(
        db,
        PLAYERS_DATABASE_COLLECTIONS.players,
        playerDocumentId
      ),
      {
        feature: 'playersDatabase',
        collection: PLAYERS_DATABASE_COLLECTIONS.players,
        action: 'playerScoutRules-scopedAudit',
        operationSubtype: 'player-read',
      }
    ))
  )
  remainingReadBudget -= playerDocumentIds.length
  const existingPlayerSnapshots = playerSnapshots.filter(snapshot => (
    snapshot.exists()
  ))
  const playerRows = flattenPlayerDocs(existingPlayerSnapshots)
  const verificationAwareRecalculated = buildRecalculatedRows({
    teamDocs: [teamSnapshot],
    teamIndexRows,
    playerRows,
    searchRows: flattenSearchPlayerDocs(playerSearchSnapshot.docs),
    includeRepairData,
  })
  const verificationAwareTeamRows = verificationAwareRecalculated.rows.filter(row => (
    isSameSeason(
      row,
      {
        seasonId: safeSeasonKey,
        seasonKey: safeSeasonKey,
      }
    )
  ))
  const verificationAwareSkippedRows = verificationAwareRecalculated.skipped.filter(row => (
    isSameSeason(
      row,
      {
        seasonId: safeSeasonKey,
        seasonKey: safeSeasonKey,
      }
    )
  ))

  const searchRows = flattenSearchPlayerDocs(
    playerSearchSnapshot.docs
  )
  const documentRewritePlan = includeRepairData
    ? buildPlayerScoutDocumentRewritePlan({
        teamSnapshots: [teamSnapshot],
        playerSnapshots: existingPlayerSnapshots,
        playerSearchSnapshots: playerSearchSnapshot.docs,
        teamSearchSnapshots: teamSearchSnapshot.docs,
        recalculatedRows: verificationAwareTeamRows,
      })
    : null

  return {
    teamRows: verificationAwareTeamRows,
    skippedRows: verificationAwareSkippedRows,
    playerRows,
    searchRows,
    teamIndexRows,
    documentRewritePlan,
    readPlan,
    cost: {
      audit: buildPlayerScoutAuditCost({
        teamDocuments: 1,
        playerDocuments: existingPlayerSnapshots.length,
        playerSearchIndexes: playerSearchSnapshot.docs.length,
        teamSearchIndexes: teamSearchSnapshot.docs.length,
        directPlayerLookups: playerDocumentIds.length,
        scoped: true,
      }),
      runtime: buildRuntimeCost({
        teamRows: verificationAwareTeamRows,
        playerRows,
        searchRows,
        teamIndexRows,
      }),
      scopeStats: buildAuditScopeStats(searchRows),
      readSafety: {
        hardLimit: PLAYER_SCOUT_AUDIT_READ_HARD_LIMIT,
        safetyLimit: scopedReadSafetyLimit,
        readsUsed: scopedReadSafetyLimit - remainingReadBudget,
        remainingBudget: remainingReadBudget,
      },
    },
  }
}

export async function buildScopedPlayerScoutRulesAudit({
  teamDocumentId,
  seasonKey,
  includeRepairData = false,
  readSafetyLimit = PLAYER_SCOUT_AUDIT_READ_BUDGETS.TEAM_SEASON,
} = {}) {
  const generatedAt = new Date().toISOString()
  const rows = await readScopedAuditData({
    teamDocumentId,
    seasonKey,
    includeRepairData,
    readSafetyLimit,
  })
  const rawIssues = collectIssues({
    teamRows: rows.teamRows,
    skippedRows: rows.skippedRows,
    playerRows: rows.playerRows,
    searchRows: rows.searchRows,
    teamIndexRows: rows.teamIndexRows,
  })
  const auditContract = buildPlayerScoutAuditContractResult(
    rawIssues,
    {
      teamRowsCount: rows.teamRows.length,
      skippedRowsCount: rows.skippedRows.length,
      playerRowsCount: rows.playerRows.length,
      searchRowsCount: rows.searchRows.length,
      teamIndexRowsCount: rows.teamIndexRows.length,
      readsUsed: rows.cost?.readSafety?.readsUsed,
      readSafetyLimit: rows.cost?.readSafety?.safetyLimit,
      scoped: true,
    }
  )
  const issues = auditContract.issues

  const audit = {
    generatedAt,
    mode: 'read-only-scoped',
    purpose: 'verify-player-scout-scope-after-write',
    governance: PLAYER_SCOUT_AUDIT_GOVERNANCE,
    contract: {
      version: auditContract.contractVersion,
      checks: auditContract.checks,
      coverage: auditContract.coverage,
    },
    auditIssues: auditContract.auditIssues,
    migrationIssues: auditContract.migrationIssues,
    diagnostics: auditContract.diagnostics,
    contractSummary: auditContract.contractSummary,
    scope: {
      teamDocumentId: clean(teamDocumentId),
      seasonKey: clean(seasonKey),
    },
    summary: buildSummary({
      ...rows,
      issues,
    }),
    cost: rows.cost,
    readPlan: rows.readPlan,
    issues,
    recalculatedRows: rows.teamRows,
    documentRewritePlan: rows.documentRewritePlan
      ? {
          ...rows.documentRewritePlan,
          sourceAuditGeneratedAt: generatedAt,
        }
      : null,
    repairDataIncluded: includeRepairData === true,
  }

  return {
    ...audit,
    shadow: buildPlayerScoutShadowComparison({ audit }),
  }
}

export async function buildPlayerScoutRulesAudit({ includeRepairData = false } = {}) {
  const generatedAt = new Date().toISOString()
  const rows = await readAuditData({
    includeRepairData,
  })
  const rawIssues = collectIssues({
    teamRows: rows.teamRows,
    skippedRows: rows.skippedRows,
    playerRows: rows.playerRows,
    searchRows: rows.searchRows,
    teamIndexRows: rows.teamIndexRows,
  })
  const auditContract = buildPlayerScoutAuditContractResult(
    rawIssues,
    {
      teamRowsCount: rows.teamRows.length,
      skippedRowsCount: rows.skippedRows.length,
      playerRowsCount: rows.playerRows.length,
      searchRowsCount: rows.searchRows.length,
      teamIndexRowsCount: rows.teamIndexRows.length,
      readsUsed: rows.cost?.readSafety?.readsUsed,
      readSafetyLimit: rows.cost?.readSafety?.safetyLimit,
      scoped: false,
    }
  )
  const issues = auditContract.issues

  const audit = {
    generatedAt,
    mode: 'read-only',
    purpose: 'recalculate-player-scout-with-current-rules-and-compare-stored-state',
    governance: PLAYER_SCOUT_AUDIT_GOVERNANCE,
    contract: {
      version: auditContract.contractVersion,
      checks: auditContract.checks,
      coverage: auditContract.coverage,
    },
    auditIssues: auditContract.auditIssues,
    migrationIssues: auditContract.migrationIssues,
    diagnostics: auditContract.diagnostics,
    contractSummary: auditContract.contractSummary,
    summary: buildSummary({
      ...rows,
      issues,
    }),
    cost: rows.cost,
    issues,
    recalculatedRows: rows.teamRows,
    documentRewritePlan: rows.documentRewritePlan
      ? {
          ...rows.documentRewritePlan,
          sourceAuditGeneratedAt: generatedAt,
        }
      : null,
    repairDataIncluded: includeRepairData === true,
  }

  return {
    ...audit,
    shadow: buildPlayerScoutShadowComparison({ audit }),
  }
}

export const downloadPlayerScoutRulesAudit = audit => {
  if (!audit) return

  const json = JSON.stringify(audit, null, 2)
  const blob = new Blob([json], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)

  link.href = url
  link.download = `player-scout-rules-audit-${date}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

