// src/features/playersDatabase/model/league/center/leagueCenterOptions.model.js

import { PLAYERS_DATABASE_AGE_GROUPS_CATALOG } from '../../../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { getSeasonCatalogOptions } from '../../../catalog/seasons.catalog.js'
import { resolveSeasonLookupKey } from '../../shared/season.model.js'
import { cleanValue, toNumberOrZero } from '../../shared/value.model.js'
import { getLeagueSeasons, LEAGUE_CENTER_ALL_SEASONS_KEY } from './leagueCenterRows.model.js'

const clean = cleanValue
const toNumber = toNumberOrZero

const FILTER_FIELD_BY_KEY = {
  birthYear: 'birthYear',
  seasonKey: 'seasonKey',
  ageGroupId: 'ageGroupId',
  leagueLevel: 'level',
  leagueStatus: 'seasonWorkStatus',
}

const matchesFilter = (row, value, field) => {
  if (Array.isArray(value)) {
    return value.length === 0 || value.includes(String(row[field] || ''))
  }

  return value === 'all' || String(row[field] || '') === value
}

const filterFacetRows = (rows, filters, excludedKey) => (
  rows.filter(row => Object.entries(FILTER_FIELD_BY_KEY).every(([key, field]) => (
    key === excludedKey || matchesFilter(row, filters[key], field)
  )))
)

const buildFacetCounts = (rows, field) => {
  const counts = { all: rows.length }

  rows.forEach(row => {
    const value = String(row[field] || '')
    if (!value) return

    counts[value] = (counts[value] || 0) + 1
  })

  return counts
}

export const buildLeagueCenterSeasonOptions = leagueDocs => {
  const keys = new Set([
    LEAGUE_CENTER_ALL_SEASONS_KEY,
    ...getSeasonCatalogOptions().map(season => season.seasonKey),
  ])

  leagueDocs.forEach(item => {
    getLeagueSeasons(item?.projection).forEach(({ season }) => {
      const key = resolveSeasonLookupKey(season)
      if (key) keys.add(key)
    })
  })

  return Array.from(keys)
}

export const buildLeagueCenterBirthYearOptions = rows => {
  const years = rows
    .map(row => toNumber(row.birthYear))
    .filter(Boolean)
    .sort((a, b) => b - a)

  return Array.from(new Set(years))
}

export const buildLeagueCenterFilterCounts = ({
  allRows,
  rowsForSelectedSeason,
  birthYears = [],
  seasonKeys = [],
  ageGroupId,
  leagueLevel,
  leagueStatuses = [],
}) => {
  const filters = {
    birthYear: birthYears,
    seasonKey: seasonKeys,
    ageGroupId,
    leagueLevel,
    leagueStatus: leagueStatuses,
  }
  const rows = Array.isArray(rowsForSelectedSeason) ? rowsForSelectedSeason : []
  const allSeasonRows = Array.isArray(allRows) ? allRows : []

  return {
    birthYear: buildFacetCounts(
      filterFacetRows(rows, filters, 'birthYear'),
      FILTER_FIELD_BY_KEY.birthYear
    ),
    seasonKey: buildFacetCounts(
      filterFacetRows(allSeasonRows, filters, 'seasonKey'),
      FILTER_FIELD_BY_KEY.seasonKey
    ),
    ageGroupId: buildFacetCounts(
      filterFacetRows(rows, filters, 'ageGroupId'),
      FILTER_FIELD_BY_KEY.ageGroupId
    ),
    leagueLevel: buildFacetCounts(
      filterFacetRows(rows, filters, 'leagueLevel'),
      FILTER_FIELD_BY_KEY.leagueLevel
    ),
    leagueStatus: buildFacetCounts(
      filterFacetRows(rows, filters, 'leagueStatus'),
      FILTER_FIELD_BY_KEY.leagueStatus
    ),
  }
}

export const buildLeagueCenterAgeGroupOptions = rows => {
  const map = new Map()

  PLAYERS_DATABASE_AGE_GROUPS_CATALOG.forEach(ageGroup => {
    const value = clean(ageGroup.id)
    const label = clean(ageGroup.label)
    if (!value || !label) return

    map.set(value, { value, label })
  })

  rows.forEach(row => {
    const label = clean(row.ageGroupLabel)
    const value = clean(row.ageGroupId || label)
    if (!value || map.has(value)) return
    map.set(value, { value, label: label || value })
  })

  return Array.from(map.values())
}

export const buildLeagueCenterLevelOptions = rows => (
  Array.from(new Set(
    rows.map(row => toNumber(row.level)).filter(Boolean)
  ))
    .sort((left, right) => left - right)
    .map(level => ({ value: String(level), label: `רמה ${level}` }))
)

export const buildLeagueCenterLeagueOptions = rows => {
  const map = new Map()

  PLAYERS_DATABASE_LEAGUES_CATALOG.forEach(league => {
    const label = clean(league.name || league.leagueName)
    if (!label || map.has(label)) return
    map.set(label, { value: label, label })
  })

  rows.forEach(row => {
    const label = clean(row.leagueName)
    if (!label || map.has(label)) return
    map.set(label, { value: label, label })
  })

  return Array.from(map.values())
}

export const buildLeagueCenterOpenOptions = leagueDocs => {
  const projectionsByLeagueId = new Map(
    (Array.isArray(leagueDocs) ? leagueDocs : [])
      .map(item => [clean(item && item.leagueId), item && item.projection])
      .filter(([leagueId]) => Boolean(leagueId))
  )

  return PLAYERS_DATABASE_LEAGUES_CATALOG
    .map(league => ({
      value: clean(league.id),
      ageGroupId: clean(league.ageGroupId),
      ageGroupLabel: clean(league.ageGroupLabel),
      name: clean(league.name),
      region: clean(league.region),
      label: clean(league.name),
      level: toNumber(league.level) || '',
      existingSeasonIds: Object.keys(
        projectionsByLeagueId.get(clean(league.id))?.seasonsById || {}
      ).map(clean).filter(Boolean),
    }))
}

export const hasLeagueCenterSeason = ({
  leaguesCenterDoc,
  leagueId,
  seasonId,
} = {}) => Boolean(
  leaguesCenterDoc
  && leaguesCenterDoc.leaguesById
  && leaguesCenterDoc.leaguesById[clean(leagueId)]
  && leaguesCenterDoc.leaguesById[clean(leagueId)].seasonsById
  && leaguesCenterDoc.leaguesById[clean(leagueId)].seasonsById[clean(seasonId)]
)
