// features/playersDatabase/ui/pages/searchPage/hooks/useSearchResults.js

import * as React from 'react'

import { readSearchPageRows } from '../../../../services/read/index.js'
import {
  adaptPlayerSearchIndexDocument,
  adaptTeamSearchIndexDocument,
} from '../../../../domain/index.js'
import { normalizeSearchRows } from '../logic/search.model.js'
import { buildSearchSummary } from '../logic/search.selectors.js'
import {
  buildSearchResultFilterOptions,
  createSearchResultFilters,
  filterSearchResultRows,
  hasSearchResultFilters,
} from '../logic/searchResultFilters.js'
import { cloneSearchFilters } from './useSearchQueryFilters.js'

const adaptSearchRow = row => (
  row?.entityType === 'birthTeamSeason'
    ? adaptTeamSearchIndexDocument(row)
    : adaptPlayerSearchIndexDocument(row)
)

export default function useSearchResults({ queryFilters }) {
  const [loadedFilters, setLoadedFilters] = React.useState(null)
  const [loadedRows, setLoadedRows] = React.useState([])
  const [loadLoading, setLoadLoading] = React.useState(false)
  const [loadError, setLoadError] = React.useState(null)
  const [loadRevision, setLoadRevision] = React.useState(0)
  const [loadCompletedRevision, setLoadCompletedRevision] = React.useState(0)
  const [resultFilters, setResultFilters] = React.useState(
    createSearchResultFilters
  )

  const loadedFiltersKey = React.useMemo(
    () => JSON.stringify(loadedFilters || null),
    [loadedFilters]
  )

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

        const domainRows = rows.map(adaptSearchRow)
        setLoadedRows(normalizeSearchRows(domainRows))
        setResultFilters(createSearchResultFilters())
        setLoadLoading(false)
        setLoadCompletedRevision(current => current + 1)
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
  }, [loadedFiltersKey, loadRevision, loadedFilters])

  const loadedEntityType = loadedFilters?.searchContext || ''

  const resultFilterOptions = React.useMemo(
    () => buildSearchResultFilterOptions({
      rows: loadedRows,
      entityType: loadedEntityType,
    }),
    [loadedRows, loadedEntityType]
  )

  const rows = React.useMemo(
    () => filterSearchResultRows({
      rows: loadedRows,
      filters: resultFilters,
      entityType: loadedEntityType,
    }),
    [loadedRows, resultFilters, loadedEntityType]
  )

  const summary = React.useMemo(
    () => buildSearchSummary(rows),
    [rows]
  )

  const updateResultFilter = React.useCallback((field, values) => {
    setResultFilters(current => ({
      ...current,
      [field]: Array.isArray(values) ? values : [],
    }))
  }, [])

  const resetResultFilters = React.useCallback(() => {
    setResultFilters(createSearchResultFilters())
  }, [])

  const loadDocuments = React.useCallback(() => {
    setLoadedFilters(cloneSearchFilters(queryFilters))
    setLoadRevision(current => current + 1)
  }, [queryFilters])

  return {
    rows,
    loadedRowsCount: loadedRows.length,
    resultFilters,
    resultFilterOptions,
    hasResultFilters: hasSearchResultFilters(resultFilters),
    summary,
    hasLoaded: Boolean(loadedFilters),
    loadedEntityType,
    loadLoading,
    loadError,
    loadCompletedRevision,
    updateResultFilter,
    resetResultFilters,
    loadDocuments,
  }
}
