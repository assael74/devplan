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

const clean = value => String(value ?? '').trim()

const normalizeQueryValue = value =>
  normalizePlayerNameValue(value)
    .replace(/\s+/g, ' ')
    .trim()

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

const buildTextConstraints = queryText => {
  const safeValue = normalizeQueryValue(queryText)
  if (!safeValue) return []

  return [
    where('normalizedDisplayName', '>=', safeValue),
    where('normalizedDisplayName', '<=', `${safeValue}\uf8ff`),
    orderBy('normalizedDisplayName'),
  ]
}

const buildExactFilterConstraints = filters => {
  const constraints = []
  const birthYears = toUniqueNumbers(filters.birthYears)
  const leagueLevels = toUniqueNumbers(filters.leagueLevels)
  const leagues = toUniqueCleanValues(filters.leagues)
  const scoutProfiles = toUniqueCleanValues(filters.scoutProfiles)

  if (birthYears.length === 1) {
    constraints.push(where('birthYear', '==', birthYears[0]))
  }

  if (leagueLevels.length === 1) {
    constraints.push(where('leagueLevel', '==', leagueLevels[0]))
  }

  if (leagues.length === 1) {
    constraints.push(where('leagueId', '==', leagues[0]))
  }

  if (scoutProfiles.length === 1) {
    constraints.push(where('primaryScoutProfileId', '==', scoutProfiles[0]))
  }

  return constraints
}

const buildSeasonQueryVariants = filters => {
  const seasons = toUniqueCleanValues(filters.seasons)

  if (!seasons.length) {
    return [{ ...filters }]
  }

  return seasons.map(seasonId => ({
    ...filters,
    seasonId,
  }))
}

const buildSearchQuery = ({
  filters = {},
  includeLimit = false,
} = {}) => {
  const safeFilters = filters || {}
  const searchContext = clean(safeFilters.searchContext)
  if (!searchContext) return null

  const entityType = searchContext === 'team'
    ? 'birthTeamSeason'
    : 'playerSeason'
  const constraints = [
    where('entityType', '==', entityType),
    ...(clean(safeFilters.seasonId)
      ? [where('seasonId', '==', clean(safeFilters.seasonId))]
      : []),
    ...buildExactFilterConstraints(safeFilters),
    ...buildTextConstraints(safeFilters.query),
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

export async function readSearchPageData({
  filters = {},
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
    maxRows,
  }
  const variants = buildSeasonQueryVariants(queryFilters)
  const countSnapshots = await Promise.all(
    variants
      .map(variant => buildSearchQuery({ filters: variant }))
      .filter(Boolean)
      .map(searchQuery => getCountFromServer(searchQuery))
  )
  const docSnapshots = await Promise.all(
    variants
      .map(variant => buildSearchQuery({ filters: { ...variant, maxRows }, includeLimit: true }))
      .filter(Boolean)
      .map(searchQuery => getDocs(searchQuery))
  )

  return {
    totalCount: countSnapshots.reduce((total, snapshot) => total + (snapshot.data().count || 0), 0),
    rows: mergeSnapshots(docSnapshots).slice(0, maxRows),
  }
}

export async function readSearchPageCount({
  filters = {},
} = {}) {
  if (!clean(filters.searchContext)) return 0

  const variants = buildSeasonQueryVariants(filters)
  const countSnapshots = await Promise.all(
    variants
      .map(variant => buildSearchQuery({ filters: variant }))
      .filter(Boolean)
      .map(searchQuery => getCountFromServer(searchQuery))
  )

  return countSnapshots.reduce((total, snapshot) => total + (snapshot.data().count || 0), 0)
}

export async function readSearchPageRows({
  filters = {},
  maxRows = DEFAULT_SEARCH_RESULTS_LIMIT,
} = {}) {
  if (!clean(filters.searchContext)) return []

  const queryFilters = {
    ...filters,
    maxRows,
  }
  const variants = buildSeasonQueryVariants(queryFilters)
  const snapshots = await Promise.all(
    variants
      .map(variant => buildSearchQuery({ filters: { ...variant, maxRows }, includeLimit: true }))
      .filter(Boolean)
      .map(searchQuery => getDocs(searchQuery))
  )

  return mergeSnapshots(snapshots).slice(0, maxRows)
}
