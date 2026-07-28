// features/playersDatabase/services/write/searchIndex/team/teamPerformanceSchema.audit.js

import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../../../constants/pdb.constants.js'

const TEAM_ENTITY_TYPE = 'birthTeamSeason'
const TARGET_SCHEMA_VERSION = 3
const SAMPLE_LIMIT = 20

const hasValue = value => (
  value !== undefined && value !== null && String(value).trim() !== ''
)

const SIDE_FIELDS = {
  attack: {
    current: [
      'attackQualityRate',
      'attackTargetRate',
      'attackTargetLevel',
      'attackRankingRate',
      'attackRankingLevel',
      'attackAnomalyRate',
      'attackAnomalyLevel',
      'attackScoutPriorityRate',
      'attackPriorityLevel',
      'attackOpportunityType',
    ],
    convertibleRequired: [
      'attackQualityRate',
      'attackPerformanceRate',
      'attackRankingRate',
      'attackCombinedRate',
      'attackPriorityRate',
    ],
    deprecated: [
      'attackPerformance',
      'attackPerformanceRate',
      'attackPerformanceLevel',
      'attackPositionAnomalyRate',
      'attackPositionAnomalyLevel',
      'attackCombinedRate',
      'attackCombinedLevel',
      'attackPriorityRate',
    ],
  },
  defense: {
    current: [
      'defenseQualityRate',
      'defenseTargetRate',
      'defenseTargetLevel',
      'defenseRankingRate',
      'defenseRankingLevel',
      'defenseAnomalyRate',
      'defenseAnomalyLevel',
      'defenseScoutPriorityRate',
      'defensePriorityLevel',
      'defenseOpportunityType',
    ],
    convertibleRequired: [
      'defenseQualityRate',
      'defensePerformanceRate',
      'defenseRankingRate',
      'defenseCombinedRate',
      'defensePriorityRate',
    ],
    deprecated: [
      'defensePerformance',
      'defensePerformanceRate',
      'defensePerformanceLevel',
      'defensePositionAnomalyRate',
      'defensePositionAnomalyLevel',
      'defenseCombinedRate',
      'defenseCombinedLevel',
      'defensePriorityRate',
    ],
  },
}

const hasAll = (data, fields) => fields.every(field => hasValue(data[field]))
const hasAny = (data, fields) => fields.some(field => hasValue(data[field]))

const resolveDocumentState = data => {
  const currentFields = [
    ...SIDE_FIELDS.attack.current,
    ...SIDE_FIELDS.defense.current,
  ]
  const convertibleFields = [
    ...SIDE_FIELDS.attack.convertibleRequired,
    ...SIDE_FIELDS.defense.convertibleRequired,
  ]
  const deprecatedFields = [
    ...SIDE_FIELDS.attack.deprecated,
    ...SIDE_FIELDS.defense.deprecated,
  ]
  const hasCompleteCurrentSchema = hasAll(data, currentFields)
  const hasCompleteConvertibleSource = hasAll(data, convertibleFields)
  const hasAnyPerformanceMetric = hasAny(data, [
    ...currentFields,
    ...convertibleFields,
    ...deprecatedFields,
  ])

  if (
    Number(data.teamPerformanceSchemaVersion) === TARGET_SCHEMA_VERSION &&
    hasCompleteCurrentSchema
  ) {
    return 'current'
  }

  if (hasCompleteConvertibleSource) return 'legacyConvertible'
  if (hasAnyPerformanceMetric) return 'partial'
  return 'missing'
}

const addSample = (samples, state, id) => {
  if (samples[state].length >= SAMPLE_LIMIT) return
  samples[state].push(id)
}

export async function auditTeamPerformanceSearchIndexSchema() {
  const rowsQuery = query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', TEAM_ENTITY_TYPE)
  )
  const snapshot = await getDocs(rowsQuery)
  const counts = {
    scannedRowsCount: snapshot.docs.length,
    currentRowsCount: 0,
    legacyConvertibleRowsCount: 0,
    partialRowsCount: 0,
    missingRowsCount: 0,
    rowsWithDeprecatedFieldsCount: 0,
  }
  const samples = {
    current: [],
    legacyConvertible: [],
    partial: [],
    missing: [],
  }
  const deprecatedFields = [
    ...SIDE_FIELDS.attack.deprecated,
    ...SIDE_FIELDS.defense.deprecated,
  ]

  snapshot.docs.forEach(indexDoc => {
    const data = indexDoc.data() || {}
    const state = resolveDocumentState(data)

    counts[`${state}RowsCount`] += 1
    addSample(samples, state, indexDoc.id)

    if (hasAny(data, deprecatedFields)) {
      counts.rowsWithDeprecatedFieldsCount += 1
    }
  })

  return {
    ...counts,
    targetSchemaVersion: TARGET_SCHEMA_VERSION,
    canMapWithoutRecalculationCount: counts.legacyConvertibleRowsCount,
    requiresSourceRecalculationCount:
      counts.partialRowsCount + counts.missingRowsCount,
    samples,
  }
}
