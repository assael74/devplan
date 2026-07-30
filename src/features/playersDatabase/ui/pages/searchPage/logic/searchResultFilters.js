// features/playersDatabase/ui/pages/searchPage/logic/searchResultFilters.js

import { SCOUT_PRIORITY_DISPLAY } from '../../../logic/scout/scoutDisplay.constants.js'

const clean = value => String(value || '').trim()

const uniqueOptions = (rows, valueGetter, labelGetter = valueGetter) => {
  const map = new Map()

  rows.forEach(row => {
    const value = clean(valueGetter(row))
    if (!value || map.has(value)) return

    map.set(value, {
      value,
      label: clean(labelGetter(row)) || value,
    })
  })

  return [...map.values()].sort((first, second) => (
    first.label.localeCompare(second.label, 'he')
  ))
}

const TEAM_PRIORITY_LEVELS = [
  'elite',
  'high',
  'positive',
  'neutral',
  'low',
]

const TEAM_PRIORITY_OPTIONS = TEAM_PRIORITY_LEVELS.map(value => ({
  value,
  label: SCOUT_PRIORITY_DISPLAY[value]?.label || value,
  tone: SCOUT_PRIORITY_DISPLAY[value]?.tone || value,
}))

export const createSearchResultFilters = () => ({
  teamSearch: '',
  seasons: [],
  leagues: [],
  teams: [],
  profiles: [],
  attackLevels: [],
  defenseLevels: [],
})

export const buildSearchResultFilterOptions = ({
  rows = [],
  entityType = 'player',
} = {}) => {
  const common = {
    seasons: uniqueOptions(rows, row => row.seasonKey),
    leagues: uniqueOptions(rows, row => row.leagueName),
  }

  if (entityType === 'team') {
    return {
      ...common,
      teams: [],
      profiles: [],
      attackLevels: TEAM_PRIORITY_OPTIONS,
      defenseLevels: TEAM_PRIORITY_OPTIONS,
    }
  }

  return {
    ...common,
    teams: uniqueOptions(rows, row => row.teamName),
    profiles: uniqueOptions(rows, row => row.primaryProfile),
    attackLevels: [],
    defenseLevels: [],
  }
}

const includesAny = (selected, value) => (
  !selected.length || selected.includes(clean(value))
)

const includesSearch = (searchValue, value) => {
  const query = clean(searchValue).toLocaleLowerCase('he')
  if (!query) return true

  return clean(value).toLocaleLowerCase('he').includes(query)
}

export const filterSearchResultRows = ({
  rows = [],
  filters = createSearchResultFilters(),
  entityType = 'player',
} = {}) => (
  rows.filter(row => {
    if (!includesSearch(filters.teamSearch, row.teamName)) return false
    if (!includesAny(filters.seasons, row.seasonKey)) return false
    if (!includesAny(filters.leagues, row.leagueName)) return false

    if (entityType === 'team') {
      if (!includesAny(filters.attackLevels, row.offense?.priorityLevel)) return false
      if (!includesAny(filters.defenseLevels, row.defense?.priorityLevel)) return false
      return true
    }

    if (!includesAny(filters.teams, row.teamName)) return false
    if (!includesAny(filters.profiles, row.primaryProfile)) return false

    return true
  })
)

export const hasSearchResultFilters = filters => (
  Object.values(filters || {}).some(value => (
    Array.isArray(value)
      ? value.length > 0
      : Boolean(clean(value))
  ))
)
