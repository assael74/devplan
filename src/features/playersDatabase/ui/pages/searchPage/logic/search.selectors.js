// features/playersDatabase/ui/pages/searchPage/logic/search.selectors.js

export function buildSearchSummary(rows = []) {
  return {
    total: rows.length,
    teams: new Set(rows.map(row => row.teamName).filter(Boolean)).size,
    leagues: new Set(rows.map(row => row.leagueName).filter(Boolean)).size,
    profiles: rows.filter(row => row.primaryProfile && row.primaryProfile !== '-').length,
  }
}

export function buildActiveFilterItems(filters, options) {
  const items = []

  if (filters.query) {
    items.push({
      key: 'query',
      type: 'scalar',
      field: 'query',
      label: `חיפוש: ${filters.query}`,
    })
  }

  if (filters.searchContext) {
    items.push({
      key: `context-${filters.searchContext}`,
      type: 'scalar',
      field: 'searchContext',
      label: filters.searchContext === 'team' ? 'קבוצה' : 'שחקן',
    })
  }

  filters.seasons.forEach(value => items.push({
    key: `season-${value}`,
    type: 'array',
    field: 'seasons',
    value,
    label: `עונה ${value}`,
  }))

  filters.birthYears.forEach(value => items.push({
    key: `year-${value}`,
    type: 'array',
    field: 'birthYears',
    value,
    label: `שנתון ${value}`,
  }))

  filters.leagueLevels.forEach(value => items.push({
    key: `level-${value}`,
    type: 'array',
    field: 'leagueLevels',
    value,
    label: `רמת ליגה ${value}`,
  }))

  filters.leagues.forEach(value => items.push({
    key: `league-${value}`,
    type: 'array',
    field: 'leagues',
    value,
    label: value,
  }))

  const isTeam = filters.searchContext === 'team'
  const profileField = isTeam ? 'teamScoutPriorities' : 'scoutProfiles'
  const profileValues = isTeam
    ? filters.teamScoutPriorities || []
    : filters.scoutProfiles || []
  const profileOptions = isTeam
    ? options.teamPriorities || []
    : options.profiles || []

  profileValues.forEach(value => {
    const option = profileOptions.find(item => item.value === value)

    items.push({
      key: `${isTeam ? 'team-priority' : 'profile'}-${value}`,
      type: 'array',
      field: profileField,
      value,
      label: option?.label || value,
    })
  })

  filters.conditions.forEach(condition => {
    const field = options.fields.find(item => item.value === condition.field)
    const operator = options.operators.find(item => item.value === condition.operator)

    if (condition.value !== '') {
      items.push({
        key: `condition-${condition.id}`,
        type: 'condition',
        conditionId: condition.id,
        label: `${field?.label || condition.field} ${operator?.label || ''} ${condition.value}`,
      })
    }
  })

  return items
}
