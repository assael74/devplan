// src/features/playersDatabase/services/audit/teamPlayerSchemaRepair.model.js

import {
  BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG,
} from '../../catalog/firestoreDocuments/birthTeamDocument.catalog.js'

const isPlainObject = value => Boolean(
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype
)

const cloneValue = value => {
  if (Array.isArray(value)) {
    return value.map(cloneValue)
  }

  if (isPlainObject(value)) {
    return Object.keys(value).reduce((result, key) => {
      result[key] = cloneValue(value[key])
      return result
    }, {})
  }

  return value
}

const isCompatibleType = ({
  actual,
  expected,
} = {}) => {
  if (expected === null) return true
  if (Array.isArray(expected)) return Array.isArray(actual)
  if (isPlainObject(expected)) return isPlainObject(actual)

  return typeof actual === typeof expected
}

const PRESERVE_EXISTING_SCOUT_OBJECT_FIELDS = new Set([
  'scoutOpportunity',
  'scoutVerification',
  'scoutProfileProgression',
  'scoutProfileHierarchy',
  'scoutProfileCaseStrength',
  'scoutPlayerInterest',
  'scoutTrajectory',
  'scoutTransferContext',
  'futureCompetitionPath',
  'scoutStatsLoadMeasurements',
])

const PRESERVE_EXISTING_SCOUT_ARRAY_FIELDS = new Set([
  'scoutProfiles',
  'scoutCombinations',
  'scoutCandidateSignals',
  'scoutEvidence',
  'scoutSpotlights',
])

export const TEAM_PLAYER_SCHEMA_REPAIR_TEMPLATE = (
  BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG.current?.[0]?.teamPlayers?.[0] ||
  {}
)

const shouldPreserveExistingScoutField = field => (
  PRESERVE_EXISTING_SCOUT_OBJECT_FIELDS.has(field) ||
  PRESERVE_EXISTING_SCOUT_ARRAY_FIELDS.has(field)
)

const LEGACY_EMPTY_TRANSFER_CONTEXT = Object.freeze({
  type: 'transfer',
  seasonKey: '',
  fromClubId: '',
  fromClubName: '',
  fromBirthTeamId: '',
  fromBirthTeamDocumentId: '',
  fromTeamName: '',
  toClubId: '',
  toClubName: '',
  toBirthTeamId: '',
  toBirthTeamDocumentId: '',
  toTeamName: '',
  fromClubStrengthLevel: 0,
  toClubStrengthLevel: 0,
  fromLeagueLevel: 0,
  toLeagueLevel: 0,
  clubStrengthChange: 0,
  leagueLevelChange: 0,
  direction: '',
  moveType: '',
  sameSeason: false,
  fromPrimaryPosition: '',
  toPrimaryPosition: '',
  fromPositionLayer: '',
  toPositionLayer: '',
  impact: {
    minutesPctDelta: 0,
    startsPctDelta: 0,
    goalsPer90Delta: 0,
    roleChanged: false,
    positionLayerChanged: false,
    profileChange: {
      added: [],
      lost: [],
      retained: [],
    },
  },
})

const matchesLegacyEmptyTransferValue = ({
  actual,
  legacy,
} = {}) => {
  if (Array.isArray(legacy)) {
    return (
      Array.isArray(actual) &&
      actual.length === 0 &&
      legacy.length === 0
    )
  }

  if (isPlainObject(legacy)) {
    if (!isPlainObject(actual)) return false

    const actualKeys = Object.keys(actual)
    const legacyKeys = Object.keys(legacy)

    if (actualKeys.length !== legacyKeys.length) {
      return false
    }

    return legacyKeys.every(field => (
      Object.prototype.hasOwnProperty.call(actual, field) &&
      matchesLegacyEmptyTransferValue({
        actual: actual[field],
        legacy: legacy[field],
      })
    ))
  }

  return actual === legacy
}

const isLegacyEmptyTransferContext = value => (
  matchesLegacyEmptyTransferValue({
    actual: value,
    legacy: LEGACY_EMPTY_TRANSFER_CONTEXT,
  })
)

const alignNestedStructure = ({
  actual,
  expected,
} = {}) => {
  if (!isPlainObject(expected)) return actual
  if (!isPlainObject(actual)) return cloneValue(expected)

  return Object.keys(expected).reduce(
    (result, field) => {
      const expectedValue = expected[field]
      const hasValue = Object.prototype.hasOwnProperty.call(
        actual,
        field
      )

      if (!hasValue) {
        result[field] = cloneValue(expectedValue)
        return result
      }

      const actualValue = actual[field]

      if (!isCompatibleType({
        actual: actualValue,
        expected: expectedValue,
      })) {
        result[field] = cloneValue(expectedValue)
        return result
      }

      if (
        isPlainObject(expectedValue) &&
        isPlainObject(actualValue)
      ) {
        result[field] = alignNestedStructure({
          actual: actualValue,
          expected: expectedValue,
        })
      } else {
        result[field] = actualValue
      }

      return result
    },
    {
      ...actual,
    }
  )
}

export const alignTeamPlayerWithCatalogSchema = ({
  player = {},
  schema = TEAM_PLAYER_SCHEMA_REPAIR_TEMPLATE,
} = {}) => {
  const safePlayer = isPlainObject(player)
    ? player
    : {}
  const safeSchema = isPlainObject(schema)
    ? schema
    : {}

  return Object.keys(safeSchema).reduce(
    (result, field) => {
      const expectedValue = safeSchema[field]
      const hasValue = Object.prototype.hasOwnProperty.call(
        safePlayer,
        field
      )

      if (!hasValue) {
        result[field] = field === 'scoutTransferContext'
          ? null
          : cloneValue(expectedValue)
        return result
      }

      const actualValue = safePlayer[field]

      if (
        field === 'scoutTransferContext' &&
        isLegacyEmptyTransferContext(actualValue)
      ) {
        result[field] = null
        return result
      }

      if (!isCompatibleType({
        actual: actualValue,
        expected: expectedValue,
      })) {
        result[field] = cloneValue(expectedValue)
        return result
      }

      if (shouldPreserveExistingScoutField(field)) {
        result[field] = actualValue
        return result
      }

      if (
        isPlainObject(expectedValue) &&
        isPlainObject(actualValue)
      ) {
        result[field] = alignNestedStructure({
          actual: actualValue,
          expected: expectedValue,
        })
        return result
      }

      result[field] = actualValue
      return result
    },
    {
      ...safePlayer,
    }
  )
}
