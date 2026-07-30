// features/playersDatabase/services/read/searchPage.read.js

import {
  collection,
  getDocs,
  getCountFromServer,
  limit,
  or,
  orderBy,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { SCOUT_PROFILE_COMBINATIONS } from '../../../../shared/players/scouting/index.js'
import {
  SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT,
  SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT,
} from '../../catalog/genericObjects.catalog.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { toNumberOrZero } from '../../model/value.model.js'

const DEFAULT_SEARCH_RESULTS_LIMIT = 250
const FIRESTORE_IN_MAX_VALUES = 30

const SEARCH_INDEX_FIELDS_BY_ENTITY = {
  birthTeamSeason: new Set(Object.keys(SEARCHINDEX_BIRTH_TEAM_SEASON_GENERIC_OBJECT)),
  playerSeason: new Set(Object.keys(SEARCHINDEX_PLAYER_SEASON_GENERIC_OBJECT)),
}

const SEARCH_STAT_FIELD_MAP_BY_ENTITY = {
  playerSeason: {
    appearances: 'searchGames',
    games: 'searchGames',
    goals: 'searchGoals',
    minutes: 'searchMinutes',
    starts: 'searchStarts',
    subIns: 'substituteIn',
    subOuts: 'substitutedOut',
  },
  birthTeamSeason: {
    appearances: 'teamGamePlayed',
    games: 'teamGamePlayed',
    teamGamePlayed: 'teamGamePlayed',
    points: 'points',
    goalsFor: 'goalsFor',
    goalsAgainst: 'goalsAgainst',
    attackPerformance: 'attackPerformance',
    attackPerformanceRate: 'attackPerformanceRate',
    attackPriorityRate: 'attackScoutPriorityRate',
    attackScoutPriorityRate: 'attackScoutPriorityRate',
    defensePerformance: 'defensePerformance',
    defensePerformanceRate: 'defensePerformanceRate',
    defensePriorityRate: 'defenseScoutPriorityRate',
    defenseScoutPriorityRate: 'defenseScoutPriorityRate',
    tableRank: 'tableRank',
    tableAttackRank: 'tableAttackRank',
    tableDefenseRank: 'tableDefenseRank',
  },
}

const SCOUT_COMBINATION_BY_ID = SCOUT_PROFILE_COMBINATIONS.reduce((map, combination) => {
  map[combination.id] = combination
  return map
}, {})

const clean = value => String(value ?? '').trim()


const toUniqueCleanValues = values => (
  [...new Set((Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean))]
)

const toUniqueNumbers = values => (
  [...new Set((Array.isArray(values) ? values : [])
    .map(value => Number(value))
    .filter(Number.isFinite))]
)

const chunkValues = (values = [], size = FIRESTORE_IN_MAX_VALUES) => {
  const chunks = []

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }

  return chunks
}

const hasSearchIndexField = (entityType, field) => (
  SEARCH_INDEX_FIELDS_BY_ENTITY[entityType]?.has(field)
)

const buildValueConstraint = (field, values) => {
  if (!values.length) return null
  if (values.length === 1) return where(field, '==', values[0])

  return where(field, 'in', values.slice(0, FIRESTORE_IN_MAX_VALUES))
}

const buildArrayContainsAnyConstraint = (field, values) => {
  if (!values.length) return null

  return where(field, 'array-contains-any', values.slice(0, FIRESTORE_IN_MAX_VALUES))
}

const buildAnyFieldConstraint = ({ entityType, fields = [], values = [] } = {}) => {
  const safeFields = fields.filter(field => hasSearchIndexField(entityType, field))
  const safeValues = values.slice(0, FIRESTORE_IN_MAX_VALUES)
  if (!safeFields.length || !safeValues.length) return null

  const constraints = safeFields
    .map(field => buildValueConstraint(field, safeValues))
    .filter(Boolean)

  if (!constraints.length) return null
  if (constraints.length === 1) return constraints[0]

  return or(...constraints)
}

const normalizeSearchConditionField = ({ entityType, field } = {}) => (
  SEARCH_STAT_FIELD_MAP_BY_ENTITY[entityType]?.[field] || clean(field)
)

const buildConditionConstraint = ({ entityType, condition = {} } = {}) => {
  const field = normalizeSearchConditionField({ entityType, field: condition.field })
  const operator = clean(condition.operator)
  const value = Number(condition.value)

  if (!field || !hasSearchIndexField(entityType, field)) return null
  if (!Number.isFinite(value)) return null
  if (!['gte', 'lte', 'gt', 'lt', 'eq'].includes(operator)) return null

  const firestoreOperator = operator === 'eq' ? '==' : operator === 'gte'
    ? '>='
    : operator === 'lte'
      ? '<='
      : operator === 'gt'
        ? '>'
        : '<'

  return where(field, firestoreOperator, value)
}

const buildConditionConstraints = ({ entityType, filters = {} } = {}) => (
  (Array.isArray(filters.conditions) ? filters.conditions : [])
    .map(condition => buildConditionConstraint({ entityType, condition }))
    .filter(Boolean)
)

const matchesSearchCondition = ({ entityType, data = {}, condition = {} } = {}) => {
  const field = normalizeSearchConditionField({ entityType, field: condition.field })
  const operator = clean(condition.operator)
  const expectedValue = Number(condition.value)
  const actualValue = Number(data[field])

  if (!field || !hasSearchIndexField(entityType, field)) return true
  if (!Number.isFinite(expectedValue)) return true
  if (!['gte', 'lte', 'gt', 'lt', 'eq'].includes(operator)) return true
  if (!Number.isFinite(actualValue)) return false

  if (operator === 'gte') return actualValue >= expectedValue
  if (operator === 'lte') return actualValue <= expectedValue
  if (operator === 'gt') return actualValue > expectedValue
  if (operator === 'lt') return actualValue < expectedValue

  return actualValue === expectedValue
}

const matchesSearchConditions = ({ entityType, data = {}, filters = {} } = {}) => (
  (Array.isArray(filters.conditions) ? filters.conditions : [])
    .every(condition => matchesSearchCondition({ entityType, data, condition }))
)

const hasSearchConditions = filters => (
  (Array.isArray(filters.conditions) ? filters.conditions : []).length > 0
)

const getSearchEntityType = filters => (
  clean(filters.searchContext) === 'team'
    ? 'birthTeamSeason'
    : 'playerSeason'
)

const EXPECTED_LEVEL_CHANGE_DIRECTIONS = new Set([
  'relegation',
  'unchanged',
  'promotion',
  'unknown',
])

const getExpectedLevelChangeDirections = filters => (
  toUniqueCleanValues(filters.expectedLeagueLevelChanges)
    .filter(value => EXPECTED_LEVEL_CHANGE_DIRECTIONS.has(value))
)

const hasExpectedLevelChangeFilter = filters => (
  getSearchEntityType(filters) === 'birthTeamSeason'
  && getExpectedLevelChangeDirections(filters).length > 0
)

const buildExpectedLevelChange = ({ row = {}, sourceRow = null } = {}) => {
  const currentLevel = Number(row.leagueLevel)
  const nextSeasonLevel = Number(sourceRow?.leagueLevel)

  if (!Number.isFinite(currentLevel) || currentLevel <= 0
    || !Number.isFinite(nextSeasonLevel) || nextSeasonLevel <= 0) {
    return {
      currentLevel: Number.isFinite(currentLevel) ? currentLevel : null,
      nextSeasonLevel: null,
      levelGap: null,
      direction: 'unknown',
      sourceTeamId: clean(sourceRow?.birthTeamId || sourceRow?.teamId),
      sourceBirthYear: Number(sourceRow?.birthYear) || null,
      sourceTeamSlot: Number(sourceRow?.birthTeamSlot) || null,
    }
  }

  const levelGap = nextSeasonLevel - currentLevel
  const direction = levelGap > 0
    ? 'relegation'
    : levelGap < 0
      ? 'promotion'
      : 'unchanged'

  return {
    currentLevel,
    nextSeasonLevel,
    levelGap,
    direction,
    sourceTeamId: clean(sourceRow?.birthTeamId || sourceRow?.teamId),
    sourceBirthYear: Number(sourceRow?.birthYear) || null,
    sourceTeamSlot: Number(sourceRow?.birthTeamSlot) || null,
  }
}

const buildExpectedLevelSourceKey = ({
  seasonId,
  clubId,
  birthYear,
  birthTeamSlot,
} = {}) => [
  clean(seasonId),
  clean(clubId),
  Number(birthYear) || 0,
  Number(birthTeamSlot) || 1,
].join('::')

const readExpectedLevelSourceRows = async rows => {
  const pairs = []
  const seen = new Set()

  rows.forEach(row => {
    const seasonId = clean(row.seasonId)
    const birthYear = Number(row.birthYear)
    if (!seasonId || !Number.isFinite(birthYear) || birthYear <= 0) return

    const key = `${seasonId}::${birthYear - 1}`
    if (seen.has(key)) return
    seen.add(key)
    pairs.push({ seasonId, birthYear: birthYear - 1 })
  })

  const snapshots = await Promise.all(pairs.map(({ seasonId, birthYear }) => getDocs(query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    where('entityType', '==', 'birthTeamSeason'),
    where('seasonId', '==', seasonId),
    where('birthYear', '==', birthYear)
  ))))

  return snapshots.flatMap(snapshot => snapshot.docs.map(item => ({
    id: item.id,
    ...item.data(),
  })))
}

const enrichRowsWithExpectedLevelChange = async rows => {
  if (!rows.length || !rows.some(row => row.entityType === 'birthTeamSeason')) return rows

  const sourceRows = await readExpectedLevelSourceRows(rows)
  const sourceByKey = new Map(sourceRows.map(row => [
    buildExpectedLevelSourceKey({
      seasonId: row.seasonId,
      clubId: row.clubId,
      birthYear: row.birthYear,
      birthTeamSlot: row.birthTeamSlot,
    }),
    row,
  ]))

  return rows.map(row => {
    if (row.entityType !== 'birthTeamSeason') return row

    const sourceRow = sourceByKey.get(buildExpectedLevelSourceKey({
      seasonId: row.seasonId,
      clubId: row.clubId,
      birthYear: Number(row.birthYear) - 1,
      birthTeamSlot: row.birthTeamSlot,
    })) || null

    return {
      ...row,
      expectedLeagueLevelChange: buildExpectedLevelChange({ row, sourceRow }),
    }
  })
}

const filterRowsByExpectedLevelChange = ({ rows = [], filters = {} } = {}) => {
  const directions = getExpectedLevelChangeDirections(filters)
  if (!directions.length) return rows

  return rows.filter(row => directions.includes(
    clean(row.expectedLeagueLevelChange?.direction) || 'unknown'
  ))
}

const shouldFilterConditionsClientSide = ({ filters = {} } = {}) => (
  hasSearchConditions(filters)
)

const getSingleScoutCombinationProfileIds = filters => {
  const scoutProfiles = toUniqueCleanValues(filters.scoutProfiles)
  const scoutCombinations = toUniqueCleanValues(filters.scoutCombinations)
  if (scoutProfiles.length || scoutCombinations.length !== 1) return []

  return SCOUT_COMBINATION_BY_ID[scoutCombinations[0]]?.profileIds || []
}

const buildSingleScoutCombinationConstraint = scoutCombinationId => {
  const profileIds = SCOUT_COMBINATION_BY_ID[scoutCombinationId]?.profileIds || []
  if (profileIds.length !== 2) return null

  return where('scoutProfileIds', 'array-contains', profileIds[0])
}

const matchesSingleScoutCombination = (data = {}, profileIds = []) => {
  if (profileIds.length !== 2) return true

  const scoutProfileIds = Array.isArray(data.scoutProfileIds) ? data.scoutProfileIds : []
  return profileIds.every(profileId => scoutProfileIds.includes(profileId))
}

const expandVariantsByValues = ({
  variants = [],
  field,
  values = [],
  valueKey,
} = {}) => {
  if (!values.length) return variants

  return variants.flatMap(variant => (
    values.map(value => ({
      ...variant,
      [valueKey || field]: value,
    }))
  ))
}


const buildExactFilterConstraints = ({ entityType, filters }) => {
  const constraints = []
  const exactFields = [
    ['seasonId', clean(filters.seasonId)],
    ['birthYear', Number(filters.birthYear)],
    ['leagueLevel', Number(filters.leagueLevel)],
    ['leagueId', clean(filters.leagueId)],
    ['attackPriorityLevel', clean(filters.attackPriorityLevel)],
    ['defensePriorityLevel', clean(filters.defensePriorityLevel)],
  ]

  exactFields.forEach(([field, value]) => {
    if (!hasSearchIndexField(entityType, field)) return
    if (value === '' || value === null || value === undefined) return
    if (typeof value === 'number' && !Number.isFinite(value)) return

    constraints.push(where(field, '==', value))
  })

  const favoriteEntityIds = toUniqueCleanValues(filters.favoriteEntityIds)
  const favoriteEntityField = entityType === 'birthTeamSeason'
    ? 'birthTeamId'
    : 'playerId'

  if (filters.favoritesOnly && favoriteEntityIds.length
    && hasSearchIndexField(entityType, favoriteEntityField)) {
    constraints.push(buildValueConstraint(favoriteEntityField, favoriteEntityIds))
  }

  if (entityType === 'playerSeason') {
    const scoutProfiles = toUniqueCleanValues(filters.scoutProfiles)
    const scoutCombinations = toUniqueCleanValues(filters.scoutCombinations)
    const singleCombinationConstraint = !scoutProfiles.length && scoutCombinations.length === 1
      ? buildSingleScoutCombinationConstraint(scoutCombinations[0])
      : null
    const scoutField = scoutProfiles.length && scoutCombinations.length
      ? 'scoutProfileSearchIds'
      : scoutCombinations.length
        ? 'scoutCombinationIds'
        : 'scoutProfileIds'
    const scoutValues = scoutProfiles.length && scoutCombinations.length
      ? [...scoutProfiles, ...scoutCombinations]
      : scoutCombinations.length
        ? scoutCombinations
        : scoutProfiles
    const scoutConstraint = singleCombinationConstraint || buildArrayContainsAnyConstraint(
      scoutField,
      scoutValues
    )

    if (scoutConstraint) constraints.push(scoutConstraint)
  }

  return constraints
}

const buildSearchQueryVariants = filters => {
  let variants = [{ ...filters }]

  variants = expandVariantsByValues({
    variants,
    field: 'seasonId',
    values: toUniqueCleanValues(filters.seasons),
  })
  variants = expandVariantsByValues({
    variants,
    field: 'birthYear',
    values: toUniqueNumbers(filters.birthYears),
  })
  variants = expandVariantsByValues({
    variants,
    field: 'leagueLevel',
    values: toUniqueNumbers(filters.leagueLevels),
  })
  variants = expandVariantsByValues({
    variants,
    field: 'leagueId',
    values: toUniqueCleanValues(filters.leagues),
  })

  if (clean(filters.searchContext) === 'team') {
    const teamLevelFilters = [
      ['attackPriorityLevel', filters.teamAttackPriorityLevels],
      ['defensePriorityLevel', filters.teamDefensePriorityLevels],
    ]

    teamLevelFilters.forEach(([field, values]) => {
      variants = expandVariantsByValues({
        variants,
        field,
        values: toUniqueCleanValues(values),
      })
    })
  }

  if (filters.favoritesOnly) {
    const favoriteChunks = chunkValues(toUniqueCleanValues(filters.favoriteEntityIds))

    if (!favoriteChunks.length) return []

    variants = variants.flatMap(variant => (
      favoriteChunks.map(favoriteEntityIds => ({
        ...variant,
        favoriteEntityIds,
      }))
    ))
  }

  return variants
}

const buildSearchQuery = ({
  filters = {},
  includeLimit = false,
} = {}) => {
  const safeFilters = filters || {}
  const searchContext = clean(safeFilters.searchContext)
  if (!searchContext) return null

  const entityType = getSearchEntityType(safeFilters)
  const shouldUseClientSideConditions = shouldFilterConditionsClientSide({
    entityType,
    filters: safeFilters,
  })
  const constraints = [
    where('entityType', '==', entityType),
    ...buildExactFilterConstraints({ entityType, filters: safeFilters }),
    ...(shouldUseClientSideConditions
      ? []
      : buildConditionConstraints({ entityType, filters: safeFilters })),
  ]

  if (includeLimit) {
    constraints.push(limit(Math.max(1, toNumberOrZero(safeFilters.maxRows) || DEFAULT_SEARCH_RESULTS_LIMIT)))
  }

  return query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    ...constraints
  )
}

const mergeSnapshots = snapshots => {
  const seen = new Set()
  const rows = []

  snapshots.forEach(snapshot => {
    snapshot.docs.forEach(item => {
      if (seen.has(item.id)) return
      seen.add(item.id)
      rows.push({
        id: item.id,
        ...item.data(),
      })
    })
  })

  return rows
}

const finalizeSearchRows = async ({ rows = [], filters = {}, maxRows = null } = {}) => {
  const enrichedRows = await enrichRowsWithExpectedLevelChange(rows)
  const filteredRows = filterRowsByExpectedLevelChange({
    rows: enrichedRows,
    filters,
  })

  return Number.isFinite(Number(maxRows))
    ? filteredRows.slice(0, Number(maxRows))
    : filteredRows
}

const filterDocsBySearchVariant = ({ docs = [], filters = {} } = {}) => {
  const entityType = getSearchEntityType(filters)
  const profileIds = getSingleScoutCombinationProfileIds(filters)
  const shouldUseClientSideConditions = shouldFilterConditionsClientSide({
    entityType,
    filters,
  })

  if (profileIds.length !== 2 && !shouldUseClientSideConditions) return docs

  return docs.filter(item => {
    const data = item.data() || {}

    return matchesSingleScoutCombination(data, profileIds)
      && matchesSearchConditions({
        entityType,
        data,
        filters,
      })
  })
}

const getDocsForSearchVariant = async ({ filters = {}, includeLimit = false } = {}) => {
  const entityType = getSearchEntityType(filters)
  const profileIds = getSingleScoutCombinationProfileIds(filters)
  const shouldUseClientSideConditions = shouldFilterConditionsClientSide({
    entityType,
    filters,
  })
  const searchQuery = buildSearchQuery({
    filters,
    includeLimit: includeLimit && profileIds.length !== 2 && !shouldUseClientSideConditions,
  })
  if (!searchQuery) return []

  const snapshot = await getDocs(searchQuery)
  return filterDocsBySearchVariant({ docs: snapshot.docs, filters })
}

const countSearchVariant = async filters => {
  const entityType = getSearchEntityType(filters)
  const profileIds = getSingleScoutCombinationProfileIds(filters)
  const shouldUseClientSideConditions = shouldFilterConditionsClientSide({
    entityType,
    filters,
  })
  const searchQuery = buildSearchQuery({ filters })
  if (!searchQuery) return 0

  if (profileIds.length === 2 || shouldUseClientSideConditions) {
    const snapshot = await getDocs(searchQuery)
    return filterDocsBySearchVariant({ docs: snapshot.docs, filters }).length
  }

  const snapshot = await getCountFromServer(searchQuery)
  return snapshot.data().count || 0
}

export async function readSearchPageData({
  filters = {},
  favoriteEntityIds = [],
  maxRows = DEFAULT_SEARCH_RESULTS_LIMIT,
} = {}) {
  if (!clean(filters.searchContext)) {
    return {
      totalCount: 0,
      rows: [],
    }
  }

  const queryFilters = {
    ...filters,
    favoriteEntityIds,
    maxRows,
  }
  const variants = buildSearchQueryVariants(queryFilters)
  const counts = await Promise.all(
    variants
      .filter(Boolean)
      .map(variant => countSearchVariant(variant))
  )
  const docsByVariant = await Promise.all(
    variants
      .filter(Boolean)
      .map(variant => getDocsForSearchVariant({
        filters: { ...variant, maxRows },
        includeLimit: true,
      }))
  )

  const mergedRows = mergeSnapshots(docsByVariant.map(docs => ({ docs })))
  const rows = await finalizeSearchRows({
    rows: mergedRows,
    filters: queryFilters,
    maxRows,
  })

  return {
    totalCount: hasExpectedLevelChangeFilter(queryFilters)
      ? rows.length
      : counts.reduce((total, count) => total + count, 0),
    rows,
  }
}

export async function readSearchPageCount({
  filters = {},
  favoriteEntityIds = [],
} = {}) {
  if (!clean(filters.searchContext)) return 0

  const variants = buildSearchQueryVariants({
    ...filters,
    favoriteEntityIds,
  })
  if (hasExpectedLevelChangeFilter(filters)) {
    const docsByVariant = await Promise.all(
      variants
        .filter(Boolean)
        .map(variant => getDocsForSearchVariant({ filters: variant }))
    )
    const mergedRows = mergeSnapshots(docsByVariant.map(docs => ({ docs })))
    const rows = await finalizeSearchRows({
      rows: mergedRows,
      filters,
    })

    return rows.length
  }

  const counts = await Promise.all(
    variants
      .filter(Boolean)
      .map(variant => countSearchVariant(variant))
  )

  return counts.reduce((total, count) => total + count, 0)
}

export async function readSearchPageRows({
  filters = {},
  favoriteEntityIds = [],
  maxRows = DEFAULT_SEARCH_RESULTS_LIMIT,
} = {}) {
  if (!clean(filters.searchContext)) return []

  const queryFilters = {
    ...filters,
    favoriteEntityIds,
    maxRows,
  }
  const variants = buildSearchQueryVariants(queryFilters)
  const docsByVariant = await Promise.all(
    variants
      .filter(Boolean)
      .map(variant => getDocsForSearchVariant({
        filters: { ...variant, maxRows },
        includeLimit: true,
      }))
  )

  return finalizeSearchRows({
    rows: mergeSnapshots(docsByVariant.map(docs => ({ docs }))),
    filters: queryFilters,
    maxRows,
  })
}
