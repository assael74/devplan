// features/playersDatabase/ui/pages/searchPage/SearchWorkspace.js

import { Box } from '@mui/joy'

import SearchQueryPanel from './query/SearchQueryPanel.js'
import SearchResultsSection from './results/SearchResultsSection.js'
import SearchResultsSidebar from './resultsSidebar/SearchResultsSidebar.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

export default function SearchWorkspace({ search, onEntityOpen }) {
  const queryEntityType = search.queryFilters.searchContext || 'player'
  const resultsEntityType = search.loadedEntityType || queryEntityType

  return (
    <Box sx={sx.workspace}>
      <SearchQueryPanel
        search={search}
        activeItems={search.queryActiveItems}
        count={search.previewCount}
        loading={search.previewLoading}
        error={search.previewError}
        onLoad={search.loadDocuments}
        onReset={search.resetQuery}
      />

      <Box sx={sx.resultsWorkspace}>
        <SearchResultsSection
          rows={search.rows}
          loading={search.loadLoading}
          error={search.loadError}
          entityType={resultsEntityType}
          onEntityOpen={onEntityOpen}
        />

        <SearchResultsSidebar
          summary={search.summary}
          entityType={resultsEntityType}
          hasLoaded={search.hasLoaded}
          loading={search.loadLoading}
          filters={search.resultFilters}
          options={search.resultFilterOptions}
          hasFilters={search.hasResultFilters}
          onFilterChange={search.updateResultFilter}
          onResetFilters={search.resetResultFilters}
        />
      </Box>
    </Box>
  )
}
