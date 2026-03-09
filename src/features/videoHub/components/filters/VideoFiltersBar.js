// src/features/videoHub/components/filters/VideoFiltersBar.js
import React from 'react'
import { Box } from '@mui/joy'
import useVideoFilterOptions from './hooks/useVideoFilterOptions'
import useVideoFiltersController from './hooks/useVideoFiltersController'
import VideoFiltersRow from './rows/VideoFiltersRow'
import VideoSortRow from './rows/VideoSortRow'
import ActiveFiltersChipsRow from './rows/ActiveFiltersChipsRow'

export default function VideoFiltersBar({ tab, items = [], filters, onFilters, context, total = 0, shown = 0 }) {
  const options = useVideoFilterOptions({ tab, context, filters, items })

  const { setCascade, clearAll, activeChips, removeChip, sortLabel } =
    useVideoFiltersController({ tab, filters, onFilters, options })

  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      <VideoFiltersRow
        tab={tab}
        filters={filters}
        options={options}
        setCascade={setCascade}
      />

      <VideoSortRow
        filters={filters}
        setCascade={setCascade}
        clearAll={clearAll}
        clearDisabled={activeChips.length === 0}
      />

      <ActiveFiltersChipsRow
        total={total}
        shown={shown}
        sortLabel={sortLabel}
        sortDir={filters.sortDir}
        activeChips={activeChips}
        onRemoveChip={removeChip}
      />
    </Box>
  )
}
