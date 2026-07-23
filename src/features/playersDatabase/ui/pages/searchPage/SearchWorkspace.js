// features/playersDatabase/ui/pages/searchPage/SearchWorkspace.js

import { Box } from '@mui/joy'

import SearchFiltersPanel from './filters/SearchFiltersPanel.js'
import SearchInsightsPanel from './SearchInsightsPanel.js'
import SearchResultsSection from './SearchResultsSection.js'
import { searchPageSx as sx } from './sx/searchPage.sx.js'

export default function SearchWorkspace({ search, onPlayerOpen }) {
  return (
    <Box sx={sx.workspace}>
      <SearchFiltersPanel
        search={search}
        activeItems={search.activeItems}
      />

      <Box sx={sx.resultsWorkspace}>
        <SearchResultsSection
          rows={search.rows}
          count={search.totalCount}
          onPlayerOpen={onPlayerOpen}
        />

        <SearchInsightsPanel
          rows={search.rows}
          summary={search.summary}
          activeItems={search.activeItems}
          onRemoveFilter={search.removeActiveItem}
          onReset={search.reset}
        />
      </Box>
    </Box>
  )
}
