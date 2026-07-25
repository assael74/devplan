// features/playersDatabase/ui/pages/searchPage/hooks/useSearchPage.js

import useSearchPreviewCount from './useSearchPreviewCount.js'
import useSearchQueryFilters from './useSearchQueryFilters.js'
import useSearchResults from './useSearchResults.js'

/**
 * Search page orchestration
 *
 * useSearchQueryFilters.js
 * - Owns editable query filters and active-filter actions.
 *
 * useSearchPreviewCount.js
 * - Reads the matching document count before loading rows.
 *
 * useSearchResults.js
 * - Stores the loaded filter snapshot and reads/adapts result rows.
 */
export default function useSearchPage() {
  const query = useSearchQueryFilters()
  const preview = useSearchPreviewCount({
    queryFilters: query.queryFilters,
    queryFiltersKey: query.queryFiltersKey,
  })
  const results = useSearchResults({
    queryFilters: query.queryFilters,
  })

  return {
    queryFilters: query.queryFilters,
    rows: results.rows,
    summary: results.summary,
    hasLoaded: results.hasLoaded,
    previewCount: preview.previewCount,
    previewLoading: preview.previewLoading,
    previewError: preview.previewError,
    loadLoading: results.loadLoading,
    loadError: results.loadError,
    queryActiveItems: query.queryActiveItems,
    updateQueryFilter: query.updateQueryFilter,
    toggleQueryArrayValue: query.toggleQueryArrayValue,
    setQueryPresetCondition: query.setQueryPresetCondition,
    resetQueryConditions: query.resetQueryConditions,
    removeQueryActiveItem: query.removeQueryActiveItem,
    resetQuery: query.resetQuery,
    loadDocuments: results.loadDocuments,
  }
}
