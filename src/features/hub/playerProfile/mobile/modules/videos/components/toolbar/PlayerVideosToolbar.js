// playerProfile/mobile/modules/videos/components/toolbar/PlayerVideosToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Chip, Button } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../../../../ui/patterns/filters/index.js'

import { SortDrawerMobile } from '../../../../../../../../ui/patterns/sort/index.js'

import { toolbarSx as sx } from '../../sx/toolbar.sx.js'

import ToolbarFilterChip from './ToolbarFilterChip.js'
import PlayerVideosFilters from './PlayerVideosFilters.js'

import {
  buildToolbarState,
  clearToolbarIndicator,
  safeArray,
} from '../../../../../sharedLogic'

import {
  PLAYER_VIDEOS_SORT_OPTIONS,
  getPlayerVideosSortLabel,
  getPlayerVideosSortDirectionIcon,
} from '../../../../../sharedLogic'

export default function PlayerVideosToolbar({
  summary,
  filters,
  indicators = [],
  options = {},
  onChangeFilters,
  onResetFilters,
  sortBy = 'date',
  sortDirection = 'desc',
  onChangeSortBy,
  onChangeSortDirection,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

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

            <Button
              size="sm"
              variant="soft"
              color="neutral"
              onClick={() => setSortOpen(true)}
              endDecorator={iconUi({
                id: getPlayerVideosSortDirectionIcon(sortDirection),
                sx: { fontSize: 15, color: '#1ED760' },
              })}
              sx={sx.sortBut}
            >
              {getPlayerVideosSortLabel(sortBy)}
            </Button>
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

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון וידאו"
        sortBy={sortBy}
        sortDirection={sortDirection}
        sortOptions={PLAYER_VIDEOS_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}
