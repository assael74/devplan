// features/playersDatabase/ui/pages/searchPage/hooks/useSearchPage.js

import * as React from 'react'

import {
  readSearchPageCount,
  readSearchPageRows,
} from '../../../../services/read/index.js'
import {
  createSearchFilters,
  SEARCH_OPERATORS,
  SEARCH_SCOUT_PROFILES,
  SEARCH_TEAM_SCOUT_PRIORITIES,
  SEARCH_STAT_FIELDS,
} from '../logic/search.constants.js'
import { normalizeSearchRows } from '../logic/search.model.js'
import {
  buildActiveFilterItems,
  buildSearchSummary,
} from '../logic/search.selectors.js'

const cloneSearchFilters = filters => ({
  ...filters,
  seasons: [...filters.seasons],
  birthYears: [...filters.birthYears],
  leagueLevels: [...filters.leagueLevels],
  leagues: [...filters.leagues],
  scoutProfiles: [...filters.scoutProfiles],
  teamScoutPriorities: [...(filters.teamScoutPriorities || [])],
  conditions: filters.conditions.map(condition => ({ ...condition })),
})

export default function useSearchPage() {
  const [queryFilters, setQueryFilters] = React.useState(createSearchFilters)
  const [previewCount, setPreviewCount] = React.useState(0)
  const [previewLoading, setPreviewLoading] = React.useState(true)
  const [previewError, setPreviewError] = React.useState(null)
  const [loadedFilters, setLoadedFilters] = React.useState(null)
  const [loadedRows, setLoadedRows] = React.useState([])
  const [loadLoading, setLoadLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState(null)
  const [loadRevision, setLoadRevision] = React.useState(0)
  const conditionId = React.useRef(1)

  const queryFiltersKey = React.useMemo(
    () => JSON.stringify(queryFilters),
    [queryFilters]
  )

  const loadedFiltersKey = React.useMemo(
    () => JSON.stringify(loadedFilters || null),
    [loadedFilters]
  )

  React.useEffect(() => {
    let active = true

    setPreviewLoading(true)
    setPreviewError(null)

    readSearchPageCount({ filters: queryFilters })
      .then(count => {
        if (!active) return
        setPreviewCount(count)
        setPreviewLoading(false)
      })
      .catch(error => {
        if (!active) return
        setPreviewCount(0)
        setPreviewError(error)
        setPreviewLoading(false)
      })

    return () => {
      active = false
    }
  }, [queryFiltersKey])

  React.useEffect(() => {
    if (!loadedFilters) {
      setLoadedRows([])
      return undefined
    }

    let active = true

    setLoadLoading(true)
    setLoadError(null)

    readSearchPageRows({ filters: loadedFilters })
      .then(rows => {
        if (!active) return
        setLoadedRows(normalizeSearchRows(rows))
        setLoadLoading(false)
      })
      .catch(error => {
        if (!active) return
        setLoadedRows([])
        setLoadError(error)
        setLoadLoading(false)
      })

    return () => {
      active = false
    }
  }, [loadedFiltersKey, loadRevision])

  const summary = React.useMemo(
    () => buildSearchSummary(loadedRows),
    [loadedRows]
  )

  const queryActiveItems = React.useMemo(() => buildActiveFilterItems(queryFilters, {
    profiles: SEARCH_SCOUT_PROFILES,
    teamPriorities: SEARCH_TEAM_SCOUT_PRIORITIES,
    fields: SEARCH_STAT_FIELDS,
    operators: SEARCH_OPERATORS,
  }), [queryFilters])

  const updateQueryFilter = (key, value) => {
    setQueryFilters(current => ({ ...current, [key]: value }))
  }

  const toggleQueryArrayValue = (key, value) => {
    setQueryFilters(current => {
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

  const setQueryPresetCondition = ({ field, operator, value }) => {
    setQueryFilters(current => {
      const existing = current.conditions.find(condition => condition.field === field)

      if (value === '') {
        return {
          ...current,
          conditions: current.conditions.filter(condition => condition.field !== field),
        }
      }

      if (existing) {
        return {
          ...current,
          conditions: current.conditions.map(condition => (
            condition.field === field
              ? { ...condition, operator, value }
              : condition
          )),
        }
      }

      const id = conditionId.current
      conditionId.current += 1

      return {
        ...current,
        conditions: [
          ...current.conditions,
          {
            id,
            field,
            operator,
            value,
          },
        ],
      }
    })
  }

  const removeQueryActiveItem = item => {
    if (!item) return

    setQueryFilters(current => {
      if (item.type === 'condition') {
        return {
          ...current,
          conditions: current.conditions.filter(
            condition => condition.id !== item.conditionId
          ),
        }
      }

      if (item.type === 'array') {
        const values = current[item.field] || []

        return {
          ...current,
          [item.field]: values.filter(value => value !== item.value),
        }
      }

      if (item.type === 'scalar') {
        return {
          ...current,
          [item.field]: '',
        }
      }

      return current
    })
  }

  const loadDocuments = () => {
    setLoadedFilters(cloneSearchFilters(queryFilters))
    setLoadRevision(current => current + 1)
  }

  return {
    queryFilters,
    rows: loadedRows,
    summary,
    hasLoaded: Boolean(loadedFilters),
    previewCount,
    previewLoading,
    previewError,
    loadLoading,
    loadError,
    queryActiveItems,
    updateQueryFilter,
    toggleQueryArrayValue,
    setQueryPresetCondition,
    removeQueryActiveItem,
    resetQuery: () => setQueryFilters(createSearchFilters()),
    loadDocuments,
  }
}
