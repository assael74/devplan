// features/playersDatabase/ui/pages/searchPage/query/SearchQueryPanel.js

import * as React from 'react'
import { Box, Button, Stack, Typography } from '@mui/joy'

import { CollapseBox } from '../../../../../../ui/patterns/collapseBox/index.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { getEntityColors } from '../../../../../../ui/core/theme/Colors.js'
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
  const entityType = search.queryFilters.searchContext || 'player'
  const entityColors = getEntityColors(entityType)

  React.useEffect(() => {
    if (search.loadCompletedRevision > 0) {
      setExpanded(false)
    }
  }, [search.loadCompletedRevision])

  return (
    <Box sx={sx.panel}>
      <CollapseBox
        open={expanded}
        onToggle={() => setExpanded(current => !current)}
        title={(
          <Box sx={sx.headerIdentity}>
            <Box sx={sx.headerIcon(entityColors)}>
              {iconUi({ id: 'search', size: 'sm' })}
            </Box>

            <Typography level='title-md' sx={sx.headerTitle}>
              בניית שאילתה
            </Typography>
          </Box>
        )}
        subtitle={
          activeItems.length
            ? `${activeItems.length} תנאים פעילים בחיפוש`
            : 'בחר הקשר, מודל חיפוש ותנאים סטטיסטיים.'
        }
        headerRight={(
          <Stack direction='row' sx={sx.headerActions}>
            {activeItems.length > 0 ? (
              <Button
                size='sm'
                variant='plain'
                sx={sx.resetButton}
                onClick={onReset}
              >
                איפוס חיפוש
              </Button>
            ) : null}
          </Stack>
        )}
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
              onResetTeamPerformance={search.resetTeamPerformanceFilters}
            />
          </Box>

          <Box
            className='dpScrollThin'
            sx={[sx.column, sx.statsColumn]}
          >
            <SearchStatsQuery
              entityType={search.queryFilters.searchContext || 'player'}
              conditions={search.queryFilters.conditions}
              onSetCondition={search.setQueryPresetCondition}
              onResetConditions={search.resetQueryConditions}
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
