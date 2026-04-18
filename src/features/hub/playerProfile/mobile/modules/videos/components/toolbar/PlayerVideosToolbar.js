// playerProfile/mobile/modules/videos/components/toolbar/PlayerVideosToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, IconButton } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ToolbarFilterChip from './ToolbarFilterChip.js'
import PlayerVideosFilters from './PlayerVideosFilters.js'

import {
  buildToolbarState,
  clearToolbarIndicator,
  safeArray,
} from '../../../../../sharedLogic'

export default function PlayerVideosToolbar({
  summary,
  filters,
  indicators = [],
  options = {},
  onOpenInsights,
  onChangeFilters,
  onResetFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const {
    totalVideos,
    filteredVideos,
    hasActiveFilters,
  } = useMemo(() => {
    return buildToolbarState({ summary, filters, options })
  }, [summary, filters, options])

  const handleClearIndicator = (item) => {
    onResetFilters(item, onChangeFilters)
  }

  return (
    <>
      <Box sx={sx.toolbar}>
        <Box sx={{ display: 'grid', gap: 0.75 }}>
          <Box sx={sx.actionsRow}>
            <FiltersTrigger
              hasActive={hasActiveFilters}
              onClick={() => setFiltersOpen(true)}
              label="פילטרים"
            />

            <Chip
              size="sm"
              variant="soft"
              color="primary"
              startDecorator={iconUi({ id: 'videoAnalysis' })}
            >
              {summary?.filteredVideos} / {summary?.totalVideos} ניתוחי וידאו
            </Chip>

            <Box sx={{ flex: 1 }} />

            <IconButton
              size="sm"
              variant="solid"
              onClick={onOpenInsights}
              sx={sx.createBtn}
            >
              {iconUi({ id: 'insights' })}
            </IconButton>
          </Box>
        </Box>

        {!!safeArray(indicators).length && (
          <Box sx={sx.indicatorsRow}>
            {safeArray(indicators).map((item) => (
              <ToolbarFilterChip
                key={item.id || item.type}
                item={item}
                onClear={handleClearIndicator}
              />
            ))}
          </Box>
        )}
      </Box>

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity='player'
        onClose={() => setFiltersOpen(false)}
        title="פילטרים לניתוחי וידאו"
        subtitle="סינון רשימת ניתוחי וידאו"
        resultsText={`${filteredVideos} מתוך ${totalVideos} ניתוחי וידאו`}
        onReset={onResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <PlayerVideosFilters
          entityType="videoAnalysis"
          summary={summary}
          filters={filters}
          indicators={indicators}
          options={options}
          onChangeFilters={onChangeFilters}
          onResetFilters={onResetFilters}
        />
      </MobileFiltersDrawerShell>
    </>
  )
}
