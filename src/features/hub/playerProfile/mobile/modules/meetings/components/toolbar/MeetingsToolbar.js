// playerProfile/mobile/modules/meetings/components/toolbar/MeetingsToolbar.js

import React from 'react'
import { Box, Chip, IconButton } from '@mui/joy'

import {
  FiltersTrigger,
} from '../../../../../../../../ui/patterns/filters/index.js'

import ToolbarFilterChip from './ToolbarFilterChip.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { toolbarSx as sx } from '../sx/toolbar.sx'

const safeArray = (value) => (Array.isArray(value) ? value : [])

export default function MeetingsToolbar({
  filteredCount = 0,
  meetingsCount = 0,
  indicators = [],
  onOpenFilters,
  onClearFilter,
}) {
  const hasActiveFilters = safeArray(indicators).length > 0

  return (
    <Box sx={sx.toolbar}>
      <Box sx={{ display: 'grid', gap: 0.75 }}>
        <Box sx={sx.actionsRow}>
          <FiltersTrigger
            hasActive={hasActiveFilters}
            onClick={onOpenFilters}
            label="פילטרים"
          />

          <Box sx={{ flex: 1 }} />

          <Chip
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={iconUi({ id: 'meetings' })}
          >
            {filteredCount} / {meetingsCount} פגישות
          </Chip>
        </Box>

        {hasActiveFilters ? (
          <Box sx={sx.indicatorsRow}>
            {safeArray(indicators).map((item) => (
              <ToolbarFilterChip
                key={item.id || item.type || item.key}
                item={item}
                onClear={onClearFilter}
              />
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  )
}
