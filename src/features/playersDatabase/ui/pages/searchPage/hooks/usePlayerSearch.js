// features/playersDatabase/ui/pages/searchPage/hooks/usePlayerSearch.js

import * as React from 'react'

import { useSearchPage } from '../../../hooks/useSearchPage.js'
import {
  createSearchCondition,
  createSearchFilters,
  SEARCH_OPERATORS,
  SEARCH_SCOUT_PROFILES,
  SEARCH_STAT_FIELDS,
} from '../logic/search.constants.js'
import { filterSearchRows } from '../logic/search.model.js'
import {
  buildActiveFilterItems,
  buildSearchSummary,
} from '../logic/search.selectors.js'

export default function usePlayerSearch() {
  const [filters, setFilters] = React.useState(createSearchFilters)
  const source = useSearchPage(filters)
  const conditionId = React.useRef(1)

  const rows = React.useMemo(() => (
    filterSearchRows(source.rows || [], filters)
  ), [source.rows, filters])

  const summary = React.useMemo(() => ({
    ...buildSearchSummary(rows),
    total: source.totalCount || rows.length,
  }), [rows, source.totalCount])
  const activeItems = React.useMemo(() => buildActiveFilterItems(filters, {
    profiles: SEARCH_SCOUT_PROFILES,
    fields: SEARCH_STAT_FIELDS,
    operators: SEARCH_OPERATORS,
  }), [filters])

  const updateFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }))
  }

  const toggleArrayValue = (key, value) => {
    setFilters(current => {
      const values = current[key]
      const exists = values.includes(value)

      return {
        ...current,
        [key]: exists
          ? values.filter(item => item !== value)
          : [...values, value],
      }
    })
  }

  const addCondition = () => {
    const id = conditionId.current
    conditionId.current += 1

    setFilters(current => ({
      ...current,
      conditions: [...current.conditions, createSearchCondition(id)],
    }))
  }

  const updateCondition = (id, key, value) => {
    setFilters(current => ({
      ...current,
      conditions: current.conditions.map(condition => (
        condition.id === id ? { ...condition, [key]: value } : condition
      )),
    }))
  }

  const removeCondition = id => {
    setFilters(current => ({
      ...current,
      conditions: current.conditions.filter(condition => condition.id !== id),
    }))
  }

  const removeActiveItem = key => {
    if (key === 'query') return updateFilter('query', '')
    if (key.startsWith('season-')) return toggleArrayValue('seasons', key.replace('season-', ''))
    if (key.startsWith('year-')) return toggleArrayValue('birthYears', key.replace('year-', ''))
    if (key.startsWith('level-')) return toggleArrayValue('leagueLevels', key.replace('level-', ''))
    if (key.startsWith('league-')) return toggleArrayValue('leagues', key.replace('league-', ''))
    if (key.startsWith('profile-')) return toggleArrayValue('scoutProfiles', key.replace('profile-', ''))
    if (key.startsWith('condition-')) return removeCondition(Number(key.replace('condition-', '')))
  }

  return {
    source,
    filters,
    rows,
    summary,
    totalCount: source.totalCount || rows.length,
    activeItems,
    updateFilter,
    toggleArrayValue,
    addCondition,
    updateCondition,
    removeCondition,
    removeActiveItem,
    reset: () => setFilters(createSearchFilters()),
  }
}
