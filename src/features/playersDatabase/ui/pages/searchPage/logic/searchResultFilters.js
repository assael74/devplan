// features/playersDatabase/ui/pages/searchPage/logic/searchResultFilters.js

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

export const createSearchResultFilters = () => ({
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
      attackLevels: uniqueOptions(
        rows,
        row => row.offense?.priorityLevel,
        row => row.offense?.priorityLevel
      ),
      defenseLevels: uniqueOptions(
        rows,
        row => row.defense?.priorityLevel,
        row => row.defense?.priorityLevel
      ),
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

export const filterSearchResultRows = ({
  rows = [],
  filters = createSearchResultFilters(),
  entityType = 'player',
} = {}) => (
  rows.filter(row => {
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
  Object.values(filters || {}).some(values => (
    Array.isArray(values) && values.length > 0
  ))
)
