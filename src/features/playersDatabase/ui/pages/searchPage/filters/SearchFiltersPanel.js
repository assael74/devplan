// features/playersDatabase/ui/pages/searchPage/filters/SearchFiltersPanel.js

import * as React from 'react'
import { Box, Button, Card, Chip, Stack, Typography } from '@mui/joy'

import SearchContextFilters from './SearchContextFilters.js'
import SearchScoutProfiles from './SearchScoutProfiles.js'
import SearchStatsConditions from './SearchStatsConditions.js'
import { searchFiltersSx as sx } from '../sx/searchFilters.sx.js'

export default function SearchFiltersPanel({ search, activeItems = [] }) {
  const [expanded, setExpanded] = React.useState(true)
  const visibleItems = activeItems.slice(0, 5)
  const hiddenItemsCount = Math.max(activeItems.length - visibleItems.length, 0)

  return (
    <Card sx={sx.panel}>
      <Box sx={sx.panelHeader}>
        <Box sx={sx.headerMain}>
          <Box sx={sx.headerCopy}>
            <Typography level='title-lg' sx={sx.panelTitle}>בניית שאילתה</Typography>
            <Typography level='body-xs' sx={sx.panelSubtitle}>
              {activeItems.length
                ? `${activeItems.length} תנאים פעילים בחיפוש`
                : 'בחר הקשר, פרופילים ותנאי סטטיסטיקה.'}
            </Typography>
          </Box>

          {!expanded && (
            <Box sx={sx.collapsedSummary}>
              {visibleItems.map(item => (
                <Chip key={item.key} size='sm' variant='soft' sx={sx.summaryChip}>
                  {item.label}
                </Chip>
              ))}

              {hiddenItemsCount > 0 && (
                <Chip size='sm' variant='outlined' sx={sx.moreChip}>
                  +{hiddenItemsCount}
                </Chip>
              )}
            </Box>
          )}
        </Box>

        <Stack direction='row' sx={sx.headerActions}>
          {activeItems.length > 0 && (
            <Button size='sm' variant='plain' sx={sx.resetButton} onClick={search.reset}>
              איפוס חיפוש
            </Button>
          )}

          <Button
            size='sm'
            variant='outlined'
            sx={sx.toggleButton}
            onClick={() => setExpanded(current => !current)}
          >
            {expanded ? 'סגירת פילטרים' : 'עריכת חיפוש'}
          </Button>
        </Stack>
      </Box>

      {expanded && (
        <Box className='dpScrollThin' sx={sx.panelContent}>
          <Box sx={sx.contextArea}>
            <SearchContextFilters
              filters={search.filters}
              onUpdate={search.updateFilter}
              onToggle={search.toggleArrayValue}
            />
          </Box>

          <Box sx={sx.profileArea}>
            <SearchScoutProfiles
              filters={search.filters}
              onUpdate={search.updateFilter}
              onToggle={search.toggleArrayValue}
            />
          </Box>

          <Stack sx={sx.statsArea}>
            <SearchStatsConditions
              conditions={search.filters.conditions}
              onAdd={search.addCondition}
              onUpdate={search.updateCondition}
              onRemove={search.removeCondition}
            />
          </Stack>
        </Box>
      )}
    </Card>
  )
}
