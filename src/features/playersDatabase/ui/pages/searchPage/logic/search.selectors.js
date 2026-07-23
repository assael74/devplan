// features/playersDatabase/ui/pages/searchPage/logic/search.selectors.js

export function buildSearchSummary(rows = []) {
  return {
    total: rows.length,
    teams: new Set(rows.map(row => row.teamName).filter(Boolean)).size,
    leagues: new Set(rows.map(row => row.leagueName).filter(Boolean)).size,
    profiles: rows.filter(row => row.primaryProfile && row.primaryProfile !== '—').length,
  }
}

export function buildActiveFilterItems(filters, options) {
  const items = []

  if (filters.query) items.push({ key: 'query', label: `חיפוש: ${filters.query}` })
  filters.seasons.forEach(value => items.push({ key: `season-${value}`, label: `עונה ${value}` }))
  filters.birthYears.forEach(value => items.push({ key: `year-${value}`, label: `שנתון ${value}` }))
  filters.leagueLevels.forEach(value => items.push({ key: `level-${value}`, label: `רמת ליגה ${value}` }))
  filters.leagues.forEach(value => items.push({ key: `league-${value}`, label: value }))
  filters.scoutProfiles.forEach(value => {
    const option = options.profiles.find(item => item.value === value)
    items.push({ key: `profile-${value}`, label: option?.label || value })
  })
  filters.conditions.forEach(condition => {
    const field = options.fields.find(item => item.value === condition.field)
    const operator = options.operators.find(item => item.value === condition.operator)
    if (condition.value !== '') {
      items.push({
        key: `condition-${condition.id}`,
        label: `${field?.label || condition.field} ${operator?.label || ''} ${condition.value}`,
      })
    }
  })

  return items
}
