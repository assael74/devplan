import { PLAYERS_DATABASE_AGE_GROUPS_CATALOG } from '../../../catalog/ageGroups.catalog.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { getSeasonCatalogOptions } from '../../../catalog/seasons.catalog.js'
import { resolveSeasonLookupKey } from '../../shared/season.model.js'
import { cleanValue, toNumberOrZero } from '../../shared/value.model.js'
import { getLeagueSeasons, buildMasterLeagueDoc, LEAGUE_CENTER_ALL_SEASONS_KEY } from './leagueCenterRows.model.js'

const clean = cleanValue
const toNumber = toNumberOrZero

export const buildLeagueCenterSeasonOptions = leagueDocs => {
  const keys = new Set([
    LEAGUE_CENTER_ALL_SEASONS_KEY,
    ...getSeasonCatalogOptions().map(season => season.seasonKey),
  ])

  leagueDocs.forEach(league => {
    getLeagueSeasons(league).forEach(({ season }) => {
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

export const buildLeagueCenterBirthYearOptionsFromMasterDocument = ({
  leaguesMasterDoc = {},
} = {}) => {
  const years = (Array.isArray(leaguesMasterDoc?.leagues) ? leaguesMasterDoc.leagues : [])
    .flatMap(league => getLeagueSeasons(buildMasterLeagueDoc(league)))
    .map(({ season }) => toNumber(season?.birthYear))
    .filter(Boolean)
    .sort((a, b) => b - a)

  return Array.from(new Set(years))
}

export const buildLeagueCenterAgeGroupOptions = rows => {
  const map = new Map()

  PLAYERS_DATABASE_AGE_GROUPS_CATALOG.forEach(ageGroup => {
    const value = clean(ageGroup.id)
    const label = clean(ageGroup.label)
    if (!value || !label) return

    map.set(value, {
      value,
      label,
    })
  })

  rows.forEach(row => {
    const label = clean(row.ageGroupLabel)
    const value = clean(row.ageGroupId || label)

    if (!value || map.has(value)) return

    map.set(value, {
      value,
      label: label || value,
    })
  })

  return Array.from(map.values())
}

export const buildLeagueCenterLevelOptions = rows => (
  Array.from(new Set(
    rows
      .map(row => toNumber(row.level))
      .filter(Boolean)
  ))
    .sort((left, right) => left - right)
    .map(level => ({
      value: String(level),
      label: `רמה ${level}`,
    }))
)

export const buildLeagueCenterLeagueOptions = rows => {
  const map = new Map()

  PLAYERS_DATABASE_LEAGUES_CATALOG.forEach(league => {
    const label = clean(league.name || league.leagueName)
    if (!label || map.has(label)) return

    map.set(label, {
      value: label,
      label,
    })
  })

  rows.forEach(row => {
    const label = clean(row.leagueName)
    if (!label || map.has(label)) return

    map.set(label, {
      value: label,
      label,
    })
  })

  return Array.from(map.values())
}

