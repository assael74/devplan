// playerProfile/desktop/modules/videos/components/toolbar/PlayerVideosBottomBar.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import PlayerVideosSortMenu from './PlayerVideosSortMenu.js'
import ToolbarFilterChip from './ToolbarFilterChip.js'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

const safeArray = (value) => (Array.isArray(value) ? value : [])

export default function PlayerVideosBottomBar({
  summary,
  indicators = [],
  totalVideos = 0,
  filteredVideos = 0,
  sortBy = 'date',
  sortDirection = 'desc',
  onChangeSortBy,
  onChangeSortDirection,
  onClearIndicator,
}) {
  return (
    <Box sx={sx.bottomRow}>
      <Chip
        size="sm"
        variant="soft"
        color="primary"
        startDecorator={iconUi({ id: 'videoAnalysis' })}
      >
        {filteredVideos} / {totalVideos} קטעים
      </Chip>

      {!!summary?.filteredVideos && summary?.filteredVideos !== summary?.totalVideos && (
        <Chip
          size="sm"
          variant="soft"
          color="success"
          startDecorator={iconUi({ id: 'done' })}
        >
          {summary.filteredVideos} מסוננים
        </Chip>
      )}

      {!!safeArray(indicators).length && (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {safeArray(indicators).map((item) => (
            <ToolbarFilterChip
              key={item.id || item.type}
              item={item}
              onClear={onClearIndicator}
            />
          ))}
        </Box>
      )}

      <Box sx={{ flex: 1 }} />

      <PlayerVideosSortMenu
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </Box>
  )
}
