// playerProfile/mobile/modules/meetings/components/MeetingsToolbar.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'
import AddIcon from '@mui/icons-material/Add'
import FiltersTrigger from '../../../../../../../ui/patterns/filters/FiltersTrigger.js'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { listSx as sx } from './sx/list.sx'

function ActiveIndicators({ items, onClear }) {
  if (!items?.length) return null
  console.log(items)
  return (
    <Box sx={sx.indicatorsRow} className="dpScrollThin">
      {items.map((item) => (
        <Chip
          key={item.key}
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={iconUi({id: item.idIcon})}
          onDelete={() => onClear(item.key)}
        >
          {item.label}
        </Chip>
      ))}
    </Box>
  )
}

export default function MeetingsToolbar({
  filteredCount,
  meetingsCount,
  indicators,
  onOpenFilters,
  onClearFilter,
  onResetFilters,
  onAdd,
}) {
  const hasIndicators = Boolean(indicators?.length)

  return (
    <Box sx={sx.toolbarWrap}>
      <Box sx={sx.toolbarTopRow}>
        <FiltersTrigger
          hasActive={hasIndicators}
          onClick={onOpenFilters}
          label="פילטרים"
        />

        <ActiveIndicators items={indicators} onClear={onClearFilter} />

        <Box sx={{ flex: 1 }} />

        {hasIndicators ? (
          <Button size="sm" variant="plain" color="neutral" onClick={onResetFilters}>
            נקה הכול
          </Button>
        ) : null}
      </Box>

      <Box sx={sx.toolbarMetaRow}>
        <Typography level="body-xs" sx={{ opacity: 0.82 }}>
          {filteredCount === meetingsCount
            ? `${meetingsCount} פגישות`
            : `${filteredCount} מתוך ${meetingsCount} פגישות`}
        </Typography>
      </Box>
    </Box>
  )
}
