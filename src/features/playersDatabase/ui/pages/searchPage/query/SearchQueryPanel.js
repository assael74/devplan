// features/playersDatabase/ui/pages/searchPage/query/SearchQueryPanel.js

import * as React from 'react'
import { Box, Button, Stack } from '@mui/joy'

import { CollapseBox } from '../../../../../../ui/patterns/collapseBox/index.js'
import SearchContextQuery from './SearchContextQuery.js'
import SearchDocumentsSummary from './SearchDocumentsSummary.js'
import SearchModelsQuery from './SearchModelsQuery.js'
import SearchStatsQuery from './SearchStatsQuery.js'
import { searchQueryPanelSx as sx } from './sx/searchQueryPanel.sx.js'

export default function SearchQueryPanel({
  search,
  activeItems = [],
  count = 0,
  loading = false,
  error = null,
  onLoad,
  onReset,
}) {
  const [expanded, setExpanded] = React.useState(true)

  return (
    <Box sx={sx.panel}>
      <CollapseBox
        open={expanded}
        onToggle={() => setExpanded(current => !current)}
        title='בניית שאילתה'
        subtitle={
          activeItems.length
            ? `${activeItems.length} תנאים פעילים בחיפוש`
            : 'בחר הקשר, מודל חיפוש ותנאים סטטיסטיים.'
        }
        headerRight={
          activeItems.length > 0 ? (
            <Stack direction='row' sx={sx.headerActions}>
              <Button
                size='sm'
                variant='plain'
                sx={sx.resetButton}
                onClick={onReset}
              >
                איפוס חיפוש
              </Button>
            </Stack>
          ) : null
        }
        contentSx={sx.collapseContent}
        innerSx={sx.collapseInner}
      >
        <Box sx={sx.grid}>
          <Box
            className='dpScrollThin'
            sx={[sx.column, sx.contextColumn]}
          >
            <SearchContextQuery
              filters={search.queryFilters}
              onUpdate={search.updateQueryFilter}
              onToggle={search.toggleQueryArrayValue}
            />
          </Box>

          <Box
            className='dpScrollThin'
            sx={[sx.column, sx.modelsColumn]}
          >
            <SearchModelsQuery
              filters={search.queryFilters}
              onToggle={search.toggleQueryArrayValue}
            />
          </Box>

          <Box
            className='dpScrollThin'
            sx={[sx.column, sx.statsColumn]}
          >
            <SearchStatsQuery
              conditions={search.queryFilters.conditions}
              onSetCondition={search.setQueryPresetCondition}
            />
          </Box>

          <Box
            className='dpScrollThin'
            sx={[sx.column, sx.summaryColumn]}
          >
            <SearchDocumentsSummary
              count={count}
              activeItems={activeItems}
              loading={loading}
              error={error}
              onRemoveItem={search.removeQueryActiveItem}
              onLoad={onLoad}
            />
          </Box>
        </Box>
      </CollapseBox>
    </Box>
  )
}
