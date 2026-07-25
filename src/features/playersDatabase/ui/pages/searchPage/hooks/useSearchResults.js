// features/playersDatabase/ui/pages/searchPage/hooks/useSearchResults.js

import * as React from 'react'

import { readSearchPageRows } from '../../../../services/read/index.js'
import {
  adaptPlayerSearchIndexDocument,
  adaptTeamSearchIndexDocument,
} from '../../../../domain/index.js'
import { normalizeSearchRows } from '../logic/search.model.js'
import { buildSearchSummary } from '../logic/search.selectors.js'
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
  }, [loadedFiltersKey, loadRevision, loadedFilters])

  const summary = React.useMemo(
    () => buildSearchSummary(loadedRows),
    [loadedRows]
  )

  const loadDocuments = React.useCallback(() => {
    setLoadedFilters(cloneSearchFilters(queryFilters))
    setLoadRevision(current => current + 1)
  }, [queryFilters])

  return {
    rows: loadedRows,
    summary,
    hasLoaded: Boolean(loadedFilters),
    loadLoading,
    loadError,
    loadDocuments,
  }
}
