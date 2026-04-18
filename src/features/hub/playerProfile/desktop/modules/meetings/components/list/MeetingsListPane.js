// playerProfile/desktop/modules/meetings/components/list/MeetingsListPane.js

import React from 'react'
import { Box, Divider, Sheet, Typography } from '@mui/joy'

import MeetingsFilters from './MeetingsFilters'
import MeetingsList from './MeetingsList'

import { listSx as sx } from '../sx/list.sx'

export default function MeetingsListPane({
  filters,
  filterOptions,
  filteredCount,
  items,
  selectedId,
  onSelectId,
  onChange,
  onResetFilters,
}) {
  return (
    <Sheet sx={sx.rightPane} variant="outlined">
      <Box sx={sx.rightTop}>
        <MeetingsFilters
          filters={filters}
          filterOptions={filterOptions}
          onChange={onChange}
          onReset={onResetFilters}
        />
      </Box>

      <Box sx={sx.countBox}>
        <Typography level="body-xs" sx={{ opacity: 0.8 }}>
          {filteredCount} מפגשים
        </Typography>
      </Box>

      <Divider sx={{ mb: 0.5 }} />

      <MeetingsList
        items={items}
        selectedId={selectedId}
        onSelectId={onSelectId}
      />
    </Sheet>
  )
}
