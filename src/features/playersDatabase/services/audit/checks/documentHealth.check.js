// src/features/playersDatabase/services/audit/checks/documentHealth.check.js

import { PLAYERS_DATABASE_COLLECTIONS } from '../../../constants/pdb.constants.js'
import {
  LEAGUES_DATABASE_GENERIC_OBJECTS_CATALOG,
  LEAGUE_DOCUMENT_NULLABLE_ARRAY_PATHS,
} from '../../../catalog/firestoreDocuments/leagueDocument.catalog.js'
import { BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG } from '../../../catalog/firestoreDocuments/birthTeamDocument.catalog.js'
import { PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG } from '../../../catalog/firestoreDocuments/playerDocument.catalog.js'
import { SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT } from '../../../catalog/firestoreDocuments/searchIndexBirthTeamSeason.catalog.js'
import { SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT } from '../../../catalog/firestoreDocuments/searchIndexPlayerSeason.catalog.js'

export const PLAYER_SCOUT_DATA_HEALTH_SCOPE = Object.freeze({
  LEAGUES: 'leagues',
  TEAMS: 'teams',
  PLAYERS: 'players',
  TEAM_INDEXES: 'teamIndexes',
  PLAYER_INDEXES: 'playerIndexes',
})

const SCOPE_CONFIG = Object.freeze({
  [PLAYER_SCOUT_DATA_HEALTH_SCOPE.LEAGUES]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.leagues,
    title: 'מסמכי ליגה',
    schema: LEAGUES_DATABASE_GENERIC_OBJECTS_CATALOG,
  },
  [PLAYER_SCOUT_DATA_HEALTH_SCOPE.TEAMS]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.teams,
    title: 'מסמכי קבוצות',
    schema: BIRTH_TEAMS_DATABASE_GENERIC_OBJECTS_CATALOG,
  },
  [PLAYER_SCOUT_DATA_HEALTH_SCOPE.PLAYERS]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.players,
    title: 'מסמכי שחקנים',
    schema: PLAYERS_DATABASE_GENERIC_OBJECTS_CATALOG,
  },
  [PLAYER_SCOUT_DATA_HEALTH_SCOPE.TEAM_INDEXES]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    title: 'אינדקסי קבוצות',
    schema: SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
    entityType: 'birthTeamSeason',
  },
  [PLAYER_SCOUT_DATA_HEALTH_SCOPE.PLAYER_INDEXES]: {
    collectionName: PLAYERS_DATABASE_COLLECTIONS.searchIndexes,
    title: 'אינדקסי שחקנים',
    schema: SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
    entityType: 'playerSeason',
  },
})

const clean = value => String(
  value === undefined || value === null ? '' : value
).trim()

const getValueType = value => {
  if (value === null) return 'ריק'
  if (Array.isArray(value)) return 'array'
  if (value instanceof Date) return 'date'
  if (value && typeof value.toDate === 'function') return 'timestamp'
  return typeof value
}

const isPlainObject = value => Boolean(
  value &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  !(value instanceof Date) &&
  typeof value.toDate !== 'function'
)

const NULLABLE_NUMBER_FIELDS = new Set([
  'attackAnomalyRate',
  'attackQualityRate',
  'attackRankingNormalized',
  'attackRankingRate',
  'attackScoutPriorityScore',
  'attackTargetNormalized',
  'attackTargetRate',
  'birthYear',
  'clubLevel',
  'clubStrengthLevel',
  'defenseAnomalyRate',
  'defenseQualityRate',
  'defenseRankingNormalized',
  'defenseRankingRate',
  'defenseScoutPriorityScore',
  'defenseTargetNormalized',
  'defenseTargetRate',
  'depth',
  'distance',
  'distanceDelta',
  'distanceDeltaPct',
  'distancePct',
  'expectedLevelDelta',
  'fromClubStrengthLevel',
  'fromLeagueLevel',
  'leagueLevel',
  'level',
  'levelGap',
  'nearScoutProfileDistancePct',
  'primaryScoutProfileStrengthDepthPct',
  'primaryScoutScore',
  'score',
  'scoutCompetitionGap',
  'secondaryScoutProfileStrengthDepthPct',
  'secondaryScoutScore',
  'teamAttackPerformance',
  'teamDefensePerformance',
  'teamRank',
  'toClubStrengthLevel',
  'toLeagueLevel',
])

const NULLABLE_OBJECT_FIELDS = new Set([
  'action',
  'conclusion',
  'futureCompetitionPath',
  'latestTransfer',
  'nearestProfile',
  'nextBestCheck',
  'previous',
  'primarySignal',
  'scoutTransferContext',
])

const normalizeSchemaPath = path => String(path || '')
  .replace(/\[\d+\]/g, '[]')

const PATH_TYPE_RULES = Object.freeze([
  {
    pattern: /(?:^|\.)matchEvidence\[\]\.actual$/,
    types: ['null', 'number', 'boolean'],
  },
  {
    pattern: /(?:^|\.)matchEvidence\[\]\.threshold$/,
    types: ['null', 'number', 'boolean', 'array', 'object'],
  },
  {
    pattern: /(?:^|\.)scoutEvidence\[\]\.threshold$/,
    types: ['null', 'number'],
  },
  {
    pattern: /(?:^|\.)scoutNarrative\.(?:seasons\[\]\.approved|career)\.(?:generatedAt|approvedAt)$/,
    types: ['null', 'string'],
  },
  {
    pattern: /(?:^|\.)scoutOpportunity\.manualDecision\.decidedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^manualImmediacyDecision\.decidedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^manualImmediacyHistory\[\]\.decidedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^verification\.answers\[\]\.(?:answeredAt|reviewAfter)$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^verification\.updatedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^tracking\.firstTrackedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^events\[\]\.detectedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^playerReview\.[^.]+\.updatedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^(?:current|history)(?:\[\])?(?:\.teamPlayers\[\])?\.updatedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^(?:current|history)(?:\[\])?\.tableRank\[\]\.updatedAt$/,
    types: ['null', 'string'],
  },
  {
    pattern: /^(?:createdAt|updatedAt)$/,
    types: ['null', 'timestamp'],
  },
])

const getFieldNameFromPath = path => {
  const normalized = normalizeSchemaPath(path)
  const parts = normalized.split('.')
  return parts[parts.length - 1] || ''
}

const LEAGUE_NULLABLE_ARRAY_PATHS = new Set(
  LEAGUE_DOCUMENT_NULLABLE_ARRAY_PATHS
)


const isValidAuditDateValue = value => {
  if (value === null) return true
  if (value instanceof Date) return !Number.isNaN(value.getTime())
  if (value && typeof value.toDate === 'function') {
    try {
      const date = value.toDate()
      return date instanceof Date && !Number.isNaN(date.getTime())
    } catch (error) {
      return false
    }
  }
  if (typeof value === 'string') {
    const text = clean(value)
    if (!text) return false
    return !Number.isNaN(Date.parse(text))
  }
  return false
}

const isUpdatedAtPath = path => getFieldNameFromPath(path) === 'updatedAt'

const getPathAllowedTypes = path => {
  const normalizedPath = normalizeSchemaPath(path)
  if (LEAGUE_NULLABLE_ARRAY_PATHS.has(normalizedPath)) {
    return ['null', 'array']
  }
  const rule = PATH_TYPE_RULES.find(item => item.pattern.test(normalizedPath))
  return rule ? rule.types : null
}

const getNullableAllowedTypes = path => {
  const pathTypes = getPathAllowedTypes(path)
  if (pathTypes) return pathTypes

  const fieldName = getFieldNameFromPath(path)

  if (NULLABLE_NUMBER_FIELDS.has(fieldName)) return ['null', 'number']
  if (NULLABLE_OBJECT_FIELDS.has(fieldName)) return ['null', 'object']
  if (fieldName === 'legacyFilterPassed') return ['null', 'boolean']
  if (fieldName === 'birthDate') {
    return ['null', 'string', 'date', 'timestamp']
  }
  if (fieldName === 'value') {
    return ['null', 'number', 'string', 'boolean']
  }

  return ['null']
}

const isTypeCompatible = ({ actualValue, expectedValue, path }) => {
  if (isUpdatedAtPath(path)) {
    return isValidAuditDateValue(actualValue)
  }

  const pathTypes = getPathAllowedTypes(path)
  if (pathTypes) {
    return pathTypes.includes(getValueType(actualValue))
  }
  if (expectedValue === null) {
    return getNullableAllowedTypes(path).includes(getValueType(actualValue))
  }
  if (Array.isArray(expectedValue)) return Array.isArray(actualValue)
  if (isPlainObject(expectedValue)) {
    if (
      actualValue === null &&
      normalizeSchemaPath(path) === 'current'
    ) {
      return true
    }
    return isPlainObject(actualValue)
  }

  return typeof actualValue === typeof expectedValue
}


const OPTIONAL_FIELD_NAMES = new Set([
  'manualTransferDirection',
  'scoutNarrative',
])

const getPathTokens = path => clean(path)
  .replace(/\[(\d+)\]/g, '.$1')
  .split('.')
  .map(clean)
  .filter(Boolean)

const getValueAtPath = ({ source, path, useSchemaArrayItem = false }) => {
  const tokens = getPathTokens(path)
  let current = source

  for (const token of tokens) {
    if (current === undefined || current === null) return undefined

    if (Array.isArray(current)) {
      const requestedIndex = Number(token)
      if (!Number.isInteger(requestedIndex)) return undefined
      const index = useSchemaArrayItem ? 0 : requestedIndex
      current = current[index]
      continue
    }

    if (!isPlainObject(current)) return undefined
    current = current[token]
  }

  return current
}

const formatValuePreview = value => {
  if (value === undefined) return 'לא קיים'
  if (value === null) return 'ריק'
  if (value && typeof value.toDate === 'function') return 'חותמת זמן של פיירסטור'
  if (value instanceof Date) return value.toISOString()

  if (typeof value === 'string') {
    const trimmed = value.length > 120 ? `${value.slice(0, 117)}...` : value
    return trimmed || 'מחרוזת ריקה'
  }

  if (typeof value === 'boolean') return value ? 'כן' : 'לא'
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return `רשימה עם ${value.length} פריטים`
  if (isPlainObject(value)) return `אובייקט עם ${Object.keys(value).length} שדות`

  return 'ערך מורכב'
}

const cleanSeasonValue = value => String(
  value === undefined || value === null ? '' : value
).trim()

const resolveSeasonFromValue = value => cleanSeasonValue(
  value?.seasonKey || value?.seasonId
)

const resolveDataHealthSeasonForPath = ({ source, path }) => {
  const safePath = String(path || '')
  const indexedSeasonMatch = safePath.match(/^(current|history)\[(\d+)\]/)

  if (indexedSeasonMatch) {
    const [, section, indexValue] = indexedSeasonMatch
    const index = Number(indexValue)
    const season = Array.isArray(source?.[section])
      ? resolveSeasonFromValue(source[section][index])
      : ''

    if (season) return season
  }

  if (safePath.startsWith('current.') && isPlainObject(source?.current)) {
    const season = resolveSeasonFromValue(source.current)
    if (season) return season
  }

  const directSeason = resolveSeasonFromValue(source)
  if (directSeason) return directSeason

  if (Array.isArray(source?.current) && source.current.length === 1) {
    const season = resolveSeasonFromValue(source.current[0])
    if (season) return season
  }

  if (isPlainObject(source?.current)) {
    const season = resolveSeasonFromValue(source.current)
    if (season) return season
  }

  return 'כל המסמך'
}

const DATA_HEALTH_REPAIR_ACTION = Object.freeze({
  SAFE_STRUCTURE: 'safe_structure',
  RECOMPUTE: 'recompute',
  IDENTITY_RECONCILIATION: 'identity_reconciliation',
  REVIEW_ONLY: 'review_only',
})

const isIdentityRepairPath = path => /(?:^|\.)(?:playerDocumentId|playerId|externalPlayerId|identityKey|birthTeamDocumentId|teamDocumentId|birthTeamId|teamId|leagueId|profileId|profileIds|sourceDocumentId|entityId|sourceTarget)$/.test(
  normalizeSchemaPath(path)
)

const isComputedScoutRepairPath = path => {
  const normalized = normalizeSchemaPath(path)
  return (
    /(?:^|\.)scout[A-Z]/.test(normalized) ||
    /(?:^|\.)(?:primaryScout|secondaryScout|nearScout)[A-Z]/.test(normalized) ||
    normalized.includes('.scoutProfiles') ||
    normalized.includes('.scoutCombinations') ||
    normalized === 'futureCompetitionPath' ||
    normalized.endsWith('.futureCompetitionPath')
  )
}

// Only paths explicitly proven to be harmless structural placeholders may be
// classified as safe_structure. Catalog defaults (null / {} / []) are not
// sufficient evidence that a missing persisted value is safe to synthesize.
const SAFE_STRUCTURAL_REPAIR_PATHS = new Set([
])

const isSafeStructuralDefault = ({ path }) => {
  const normalized = normalizeSchemaPath(path)
  if (isIdentityRepairPath(normalized) || isComputedScoutRepairPath(normalized)) return false
  return SAFE_STRUCTURAL_REPAIR_PATHS.has(normalized)
}

const resolveDataHealthRepairDisposition = ({ kind, path, expectedValue }) => {
  if (kind === 'unexpected') {
    return {
      repairAction: DATA_HEALTH_REPAIR_ACTION.REVIEW_ONLY,
      repairLabel: 'דורש בדיקה לפני הסרה',
      repairReason: 'לא מוחקים שדה קיים אוטומטית בלי לוודא שאינו נדרש לתאימות או לשימוש קיים.',
    }
  }

  if (isIdentityRepairPath(path)) {
    return {
      repairAction: DATA_HEALTH_REPAIR_ACTION.IDENTITY_RECONCILIATION,
      repairLabel: 'דורש השלמת קישור או זהות',
      repairReason: 'הערך צריך להיקבע ממקור אמת ולא מערך ברירת מחדל.',
    }
  }

  if (isComputedScoutRepairPath(path)) {
    return {
      repairAction: DATA_HEALTH_REPAIR_ACTION.RECOMPUTE,
      repairLabel: 'דורש חישוב מחדש',
      repairReason: 'זהו מידע מחושב של מודל הסקאוט ולכן יש לבנות אותו מחדש ולא להשלים ערך ריק.',
    }
  }

  if (kind === 'missing' && isSafeStructuralDefault({ path })) {
    return {
      repairAction: DATA_HEALTH_REPAIR_ACTION.SAFE_STRUCTURE,
      repairLabel: 'אפשר להשלים מבנה בבטחה',
      repairReason: 'החוזה מגדיר ערך ריק מבני שאינו דורש חישוב או מקור אמת נוסף.',
    }
  }

  return {
    repairAction: DATA_HEALTH_REPAIR_ACTION.REVIEW_ONLY,
    repairLabel: 'דורש בדיקה לפני תיקון',
    repairReason: 'אין מספיק ודאות כדי לשנות את הערך אוטומטית בלי לבדוק את מקורו.',
  }
}

const buildFieldDetail = ({ source, schema, field, kind }) => {
  const path = typeof field === 'string' ? field : field?.field
  const actualValue = getValueAtPath({ source, path })
  const expectedValue = getValueAtPath({
    source: schema,
    path,
    useSchemaArrayItem: true,
  })
  const repairDisposition = resolveDataHealthRepairDisposition({
    kind,
    path,
    expectedValue,
  })

  if (kind === 'missing') {
    return {
      path,
      normalizedPath: normalizeSchemaPath(path),
      seasonKey: resolveDataHealthSeasonForPath({ source, path }),
      actualType: 'missing',
      expectedType: expectedValue === null
        ? getNullableAllowedTypes(path).join(' | ')
        : getValueType(expectedValue),
      actualValue: 'לא קיים',
      expectedValue: formatValuePreview(expectedValue),
      ...repairDisposition,
    }
  }

  if (kind === 'unexpected') {
    return {
      path,
      normalizedPath: normalizeSchemaPath(path),
      seasonKey: resolveDataHealthSeasonForPath({ source, path }),
      actualType: getValueType(actualValue),
      expectedType: 'לא אמור להופיע',
      actualValue: formatValuePreview(actualValue),
      expectedValue: 'השדה אינו חלק מהמבנה הנוכחי',
      ...repairDisposition,
    }
  }

  return {
    path,
    normalizedPath: normalizeSchemaPath(path),
    seasonKey: resolveDataHealthSeasonForPath({ source, path }),
    actualType: field?.actualType || getValueType(actualValue),
    expectedType: field?.expectedType || (
      expectedValue === null
        ? getNullableAllowedTypes(path).join(' | ')
        : getValueType(expectedValue)
    ),
    actualValue: formatValuePreview(actualValue),
    expectedValue: formatValuePreview(expectedValue),
    ...repairDisposition,
  }
}

const buildSchemaDiff = ({ source, schema, path = '', depth = 0 }) => {
  if (!isPlainObject(source) || !isPlainObject(schema)) {
    return {
      missingFields: [],
      unexpectedFields: [],
      invalidTypes: [],
    }
  }

  const sourceKeys = Object.keys(source)
  const schemaKeys = Object.keys(schema)
  const sourceKeySet = new Set(sourceKeys)
  const schemaKeySet = new Set(schemaKeys)
  const missingFields = []
  const unexpectedFields = []
  const invalidTypes = []

  schemaKeys.forEach(field => {
    const fieldPath = path ? `${path}.${field}` : field

    if (!sourceKeySet.has(field)) {
      if (!OPTIONAL_FIELD_NAMES.has(field)) missingFields.push(fieldPath)
      return
    }

    const actualValue = source[field]
    const expectedValue = schema[field]

    if (!isTypeCompatible({
      actualValue,
      expectedValue,
      path: fieldPath,
    })) {
      invalidTypes.push({
        field: fieldPath,
        expectedType: getPathAllowedTypes(fieldPath)?.join(' | ') || (
          expectedValue === null
            ? getNullableAllowedTypes(fieldPath).join(' | ')
            : getValueType(expectedValue)
        ),
        actualType: getValueType(actualValue),
      })
      return
    }

    if (depth >= 6) return

    if (isPlainObject(expectedValue) && isPlainObject(actualValue)) {
      const nested = buildSchemaDiff({
        source: actualValue,
        schema: expectedValue,
        path: fieldPath,
        depth: depth + 1,
      })
      missingFields.push(...nested.missingFields)
      unexpectedFields.push(...nested.unexpectedFields)
      invalidTypes.push(...nested.invalidTypes)
      return
    }

    if (
      Array.isArray(expectedValue) &&
      expectedValue.length > 0 &&
      Array.isArray(actualValue)
    ) {
      actualValue.forEach((item, index) => {
        const itemPath = `${fieldPath}[${index}]`
        const expectedItem = expectedValue[0]

        if (!isTypeCompatible({
          actualValue: item,
          expectedValue: expectedItem,
          path: itemPath,
        })) {
          invalidTypes.push({
            field: itemPath,
            expectedType: getValueType(expectedItem),
            actualType: getValueType(item),
          })
          return
        }

        if (!isPlainObject(expectedItem) || !isPlainObject(item)) return

        const nested = buildSchemaDiff({
          source: item,
          schema: expectedItem,
          path: itemPath,
          depth: depth + 1,
        })
        missingFields.push(...nested.missingFields)
        unexpectedFields.push(...nested.unexpectedFields)
        invalidTypes.push(...nested.invalidTypes)
      })
    }
  })

  sourceKeys.forEach(field => {
    if (schemaKeySet.has(field) || OPTIONAL_FIELD_NAMES.has(field)) return
    const fieldPath = path ? `${path}.${field}` : field
    unexpectedFields.push(fieldPath)
  })

  return {
    missingFields,
    unexpectedFields,
    invalidTypes,
  }
}

const buildIdentityIssues = ({ scope, documentId, data }) => {
  const issues = []
  const id = clean(data?.id)

  if (id && id !== documentId) {
    issues.push({
      type: 'document_id_mismatch',
      title: 'מזהה המסמך אינו תואם',
      detail: `השדה id מכיל ${id} במקום ${documentId}.`,
    })
  }

  if (
    scope === PLAYER_SCOUT_DATA_HEALTH_SCOPE.TEAM_INDEXES &&
    clean(data?.entityType) !== 'birthTeamSeason'
  ) {
    issues.push({
      type: 'entity_type_mismatch',
      title: 'סוג אינדקס הקבוצה אינו תקין',
      detail: 'המסמך אינו מסומן כאינדקס קבוצה ועונה.',
    })
  }

  if (
    scope === PLAYER_SCOUT_DATA_HEALTH_SCOPE.PLAYER_INDEXES &&
    clean(data?.entityType) !== 'playerSeason'
  ) {
    issues.push({
      type: 'entity_type_mismatch',
      title: 'סוג אינדקס השחקן אינו תקין',
      detail: 'המסמך אינו מסומן כאינדקס שחקן ועונה.',
    })
  }

  if (
    scope === PLAYER_SCOUT_DATA_HEALTH_SCOPE.PLAYER_INDEXES &&
    !clean(data?.playerId)
  ) {
    issues.push({
      type: 'missing_identity',
      title: 'חסר מזהה שחקן',
      detail: 'באינדקס השחקן חסר playerId.',
    })
  }

  if (
    scope === PLAYER_SCOUT_DATA_HEALTH_SCOPE.TEAM_INDEXES &&
    !clean(data?.birthTeamDocumentId || data?.teamDocumentId)
  ) {
    issues.push({
      type: 'missing_identity',
      title: 'חסר מזהה מסמך קבוצה',
      detail: 'באינדקס הקבוצה חסר מזהה שמקשר למסמך הקבוצה.',
    })
  }

  return issues
}

const buildIssueSummary = issues => {
  const counts = issues.reduce((result, issue) => {
    result[issue.type] = (result[issue.type] || 0) + 1
    return result
  }, {})

  const titles = {
    schema_missing_fields: 'שדות נדרשים חסרים',
    schema_unexpected_fields: 'נמצאו שדות שאינם במבנה הנוכחי',
    schema_invalid_types: 'סוגי שדות אינם תואמים למבנה',
    document_id_mismatch: 'מזהה המסמך אינו תואם',
    entity_type_mismatch: 'סוג האינדקס אינו תקין',
    missing_identity: 'חסר מזהה נדרש',
  }

  return Object.entries(counts)
    .map(([type, count]) => ({
      type,
      count,
      title: titles[type] || 'פער במסמך',
    }))
    .sort((left, right) => right.count - left.count)
}

export async function buildDocumentHealthCheck({
  scope,
  documents: providedDocuments = null,
  readsUsed: providedReadsUsed = null,
} = {}) {
  const config = SCOPE_CONFIG[scope]

  if (!config) {
    throw new Error('סוג בדיקת הדאטה אינו נתמך.')
  }

  if (!Array.isArray(providedDocuments)) {
    throw new Error('בדיקת המסמכים דורשת Snapshot שהוכן על ידי Audit V2.')
  }

  const documents = providedDocuments
  const readsUsed = Number(providedReadsUsed || 0)
  const affectedDocumentIds = new Set()
  const issues = []

  documents.forEach(snapshot => {
    const data = snapshot.data() || {}
    const schemaDiff = buildSchemaDiff({
      source: data,
      schema: config.schema,
    })
    const documentIssues = buildIdentityIssues({
      scope,
      documentId: snapshot.id,
      data,
    })

    if (schemaDiff.missingFields.length) {
      documentIssues.push({
        type: 'schema_missing_fields',
        title: 'שדות נדרשים חסרים',
        detail: schemaDiff.missingFields.slice(0, 20).join(', '),
        fields: schemaDiff.missingFields,
        fieldDetails: schemaDiff.missingFields.map(field => buildFieldDetail({
          source: data,
          schema: config.schema,
          field,
          kind: 'missing',
        })),
      })
    }

    if (schemaDiff.unexpectedFields.length) {
      documentIssues.push({
        type: 'schema_unexpected_fields',
        title: 'נמצאו שדות שאינם במבנה הנוכחי',
        detail: schemaDiff.unexpectedFields.slice(0, 20).join(', '),
        fields: schemaDiff.unexpectedFields,
        fieldDetails: schemaDiff.unexpectedFields.map(field => buildFieldDetail({
          source: data,
          schema: config.schema,
          field,
          kind: 'unexpected',
        })),
      })
    }

    if (schemaDiff.invalidTypes.length) {
      documentIssues.push({
        type: 'schema_invalid_types',
        title: 'סוגי שדות אינם תואמים למבנה',
        detail: schemaDiff.invalidTypes
          .slice(0, 20)
          .map(item => item.field)
          .join(', '),
        fields: schemaDiff.invalidTypes,
        fieldDetails: schemaDiff.invalidTypes.map(field => buildFieldDetail({
          source: data,
          schema: config.schema,
          field,
          kind: 'invalid',
        })),
      })
    }

    if (!documentIssues.length) return

    affectedDocumentIds.add(snapshot.id)
    documentIssues.forEach(issue => {
      issues.push({
        ...issue,
        documentId: snapshot.id,
        collectionName: config.collectionName,
        seasonKey: resolveDataHealthSeasonForPath({
          source: data,
          path: '',
        }),
      })
    })
  })

  const checked = documents.length
  const affected = affectedDocumentIds.size
  const exact = Math.max(0, checked - affected)
  const exactRate = checked
    ? Math.round((exact / checked) * 1000) / 10
    : 100

  return {
    generatedAt: new Date().toISOString(),
    mode: 'read-only-collection-health',
    scope,
    title: config.title,
    collectionName: config.collectionName,
    checked,
    exact,
    affected,
    exactRate,
    readsUsed,
    issuesCount: issues.length,
    issueEntries: buildIssueSummary(issues),
    issues,
    coverage: {
      structure: true,
      internalIdentity: true,
      crossCollectionReconciliation: false,
    },
  }
}
