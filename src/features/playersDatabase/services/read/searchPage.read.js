// features/playersDatabase/services/read/searchPage.read.js

import {
  collection,
  getDocs,
  getCountFromServer,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'

import { db } from '../../../../services/firebase/firebase.js'
import { PLAYERS_DATABASE_COLLECTIONS } from '../../constants/pdb.constants.js'
import { normalizePlayerNameValue } from '../../model/playerIdentity.model.js'
import { toNumberOrZero } from '../../model/value.model.js'

const DEFAULT_SEARCH_RESULTS_LIMIT = 250
const MAX_QUERY_VALUES = 30

const clean = value => String(value ?? '').trim()

const normalizeQueryValue = value =>
  normalizePlayerNameValue(value)
    .replace(/\s+/g, ' ')
    .trim()

const toUniqueCleanValues = values =>
  [...new Set((Array.isArray(values) ? values : [])
    .map(clean)
    .filter(Boolean))]

const toUniqueNumbers = values =>
  [...new Set((Array.isArray(values) ? values : [])
    .map(value => Number(value))
    .filter(Number.isFinite))]

const buildRangePrefixConstraints = value => {
  const safeValue = normalizeQueryValue(value)
  if (!safeValue) return []

  return [
    where('normalizedDisplayName', '>=', safeValue),
    where('normalizedDisplayName', '<=', `${safeValue}\uf8ff`),
  ]
}

const buildEqualFilters = filters => {
  const constraints = []
  const seasons = toUniqueCleanValues(filters.seasons)
  const birthYears = toUniqueNumbers(filters.birthYears)
  const leagueLevels = toUniqueNumbers(filters.leagueLevels)
  const leagues = toUniqueCleanValues(filters.leagues)
  const scoutProfiles = toUniqueCleanValues(filters.scoutProfiles).slice(0, MAX_QUERY_VALUES)

  if (seasons.length) {
    constraints.push(where('seasonKey', 'in', seasons.slice(0, MAX_QUERY_VALUES)))
  }

  if (birthYears.length) {
    constraints.push(where('birthYear', 'in', birthYears.slice(0, MAX_QUERY_VALUES)))
  }

  if (leagueLevels.length) {
    constraints.push(where('leagueLevel', 'in', leagueLevels.slice(0, MAX_QUERY_VALUES)))
  }

  if (leagues.length) {
    constraints.push(where('leagueId', 'in', leagues.slice(0, MAX_QUERY_VALUES)))
  }

  if (scoutProfiles.length) {
    constraints.push(where('primaryScoutProfileId', 'in', scoutProfiles))
  }

  return constraints
}

const buildConditionFilters = conditions => {
  const constraints = []
  const rangeFields = []

  ;(Array.isArray(conditions) ? conditions : []).forEach(condition => {
    const field = clean(condition.field)
    const operator = clean(condition.operator)
    const rawValue = clean(condition.value)
    if (!field || rawValue === '') return

    const numericValue = Number(rawValue)
    const value = Number.isFinite(numericValue) ? numericValue : rawValue

    if (operator === 'eq') {
      constraints.push(where(field, '==', value))
      return
    }

    if (operator === 'gte') {
      constraints.push(where(field, '>=', value))
      rangeFields.push(field)
      return
    }

    if (operator === 'lte') {
      constraints.push(where(field, '<=', value))
      rangeFields.push(field)
      return
    }

    if (operator === 'gt') {
      constraints.push(where(field, '>', value))
      rangeFields.push(field)
      return
    }

    if (operator === 'lt') {
      constraints.push(where(field, '<', value))
      rangeFields.push(field)
    }
  })

  return {
    constraints,
    rangeFields,
  }
}

const resolvePrimaryOrderField = ({
  queryText = '',
  rangeFields = [],
  hasProfileFilter = false,
} = {}) => {
  if (queryText) return 'normalizedDisplayName'
  if (rangeFields.length) return rangeFields[0]
  if (!hasProfileFilter) return 'primaryScoutProfileId'
  return ''
}

const buildSearchQuery = ({
  filters = {},
  includeLimit = false,
} = {}) => {
  const safeFilters = filters || {}
  const queryText = clean(safeFilters.query)
  const equalFilters = buildEqualFilters(safeFilters)
  const { constraints: conditionFilters, rangeFields } = buildConditionFilters(safeFilters.conditions)
  const hasProfileFilter = Array.isArray(safeFilters.scoutProfiles) && safeFilters.scoutProfiles.length > 0
  const constraints = [
    where('entityType', '==', 'playerSeason'),
    ...equalFilters,
    ...conditionFilters,
  ]

  if (queryText) {
    constraints.push(...buildRangePrefixConstraints(queryText))
  }

  if (!hasProfileFilter) {
    constraints.push(where('primaryScoutProfileId', '>', ''))
  }

  const orderField = resolvePrimaryOrderField({
    queryText,
    rangeFields,
    hasProfileFilter,
  })

  if (orderField) {
    constraints.push(orderBy(orderField))
  }

  if (includeLimit) {
    constraints.push(limit(Math.max(1, toNumberOrZero(safeFilters.maxRows) || DEFAULT_SEARCH_RESULTS_LIMIT)))
  }

  return query(
    collection(db, PLAYERS_DATABASE_COLLECTIONS.searchIndexes),
    ...constraints
  )
}

export async function readSearchPageData({
  filters = {},
  maxRows = DEFAULT_SEARCH_RESULTS_LIMIT,
} = {}) {
  const queryFilters = {
    ...filters,
    maxRows,
  }
  const baseQuery = buildSearchQuery({ filters: queryFilters })
  const limitedQuery = buildSearchQuery({ filters: queryFilters, includeLimit: true })

  const countSnapshot = await getCountFromServer(baseQuery)
  const snapshot = await getDocs(limitedQuery)

  return {
    totalCount: countSnapshot.data().count || 0,
    rows: snapshot.docs.map(item => ({
      id: item.id,
      ...item.data(),
    })),
  }
}
