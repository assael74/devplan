// features/playersDatabase/ui/pages/searchPage/resultFilters/SearchResultFiltersPanel.js

import { Box, Button, Card, Divider, Stack, Typography } from '@mui/joy'

import SearchContextQuery from '../query/SearchContextQuery.js'
import SearchModelsQuery from '../query/SearchModelsQuery.js'
import SearchStatsQuery from '../query/SearchStatsQuery.js'
import SearchActiveQuery from '../results/SearchActiveQuery.js'
import SearchResultSummary from './SearchResultSummary.js'
import { searchResultFiltersPanelSx as sx } from './sx/searchResultFiltersPanel.sx.js'

export default function SearchResultFiltersPanel({
  summary = {},
  activeItems = [],
  filters = {},
  entityType = 'player',
  onRemoveFilter,
  onReset,
  onUpdate,
  onToggle,
  onAddCondition,
  onUpdateCondition,
  onRemoveCondition,
}) {
  return (
    <Card sx={sx.panel}>
      <Box sx={sx.header}>
        <Box>
          <Typography level='title-md' sx={sx.title}>
            סינון תוצאות
          </Typography>
          <Typography level='body-xs' sx={sx.subtitle}>
            הסינון חל מקומית על המסמכים שכבר נטענו.
          </Typography>
        </Box>

        {activeItems.length > 0 && (
          <Button size='sm' variant='plain' sx={sx.resetButton} onClick={onReset}>
            איפוס
          </Button>
        )}
      </Box>

      <Stack className='dpScrollThin' sx={sx.scroll}>
        <SearchResultSummary summary={summary} entityType={entityType} />

        <Divider />

        <SearchActiveQuery
          compact
          items={activeItems}
          onRemove={onRemoveFilter}
          emptyLabel='לא הוגדרו פילטרים לתוצאות.'
        />

        <Box sx={sx.filterBlock}>
          <SearchContextQuery
            filters={filters}
            onUpdate={onUpdate}
            onToggle={onToggle}
          />
        </Box>

        <Box sx={sx.filterBlock}>
          <SearchModelsQuery
            filters={filters}
            onToggle={onToggle}
          />
        </Box>

        <Box sx={sx.filterBlock}>
          <SearchStatsQuery
            conditions={filters.conditions || []}
            onAdd={onAddCondition}
            onUpdate={onUpdateCondition}
            onRemove={onRemoveCondition}
          />
        </Box>
      </Stack>
    </Card>
  )
}
