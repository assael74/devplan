// src/features/videoHub/components/mobile/toolbar/VideoMobileToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Button, Chip } from '@mui/joy'

import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../../ui/patterns/filters/index.js'
import { SortDrawerMobile } from '../../../../../ui/patterns/sort/index.js'

import { VIDEO_TAB } from '../../../logic/videoHub.model.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import VideoMobileFiltersContent, {
  ALL_ID,
} from './VideoMobileFiltersContent.js'
import VideoToolbarFilterChip from './VideoToolbarFilterChip.js'

import { toolbarSx as sx } from './toolbar.sx.js'

export const VIDEO_MOBILE_SORT_OPTIONS = [
  {
    id: 'updatedAt',
    label: 'עודכן לאחרונה',
    idIcon: 'time',
    defaultDirection: 'desc',
  },
  {
    id: 'createdAt',
    label: 'נוצר לאחרונה',
    idIcon: 'calendar',
    defaultDirection: 'desc',
  },
  {
    id: 'title',
    label: 'שם הסרטון',
    idIcon: 'text',
    defaultDirection: 'asc',
  },
  {
    id: 'name',
    label: 'שם',
    idIcon: 'text',
    defaultDirection: 'asc',
  },
]

function getSortLabel(sortBy) {
  const option = VIDEO_MOBILE_SORT_OPTIONS.find((item) => item.id === sortBy)
  return option?.label || 'מיון'
}

function getSortDirectionIcon(direction) {
  return direction === 'asc' ? 'sortAsc' : 'sortDesc'
}

function getModeTitle(mode) {
  return mode === VIDEO_TAB.ANALYSIS ? 'ניתוחי וידאו' : 'וידאו כללי'
}

function getDrawerEntity(mode) {
  return mode === VIDEO_TAB.ANALYSIS ? 'videoAnalysis' : 'videoGeneral'
}

export default function VideoMobileToolbar({
  mode,
  items = [],
  filters,
  filteredCount = 0,
  totalCount = 0,
  sortBy = 'updatedAt',
  sortDirection = 'desc',
  onChangeSource,
  onChangeTag,
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const sourceValue = filters?.source || ALL_ID
  const tagValue = filters?.parentTagId || filters?.tagId || ALL_ID

  const hasActiveFilters = sourceValue !== ALL_ID || tagValue !== ALL_ID

  const indicators = useMemo(() => {
    const next = []

    if (sourceValue !== ALL_ID) {
      next.push({
        id: 'source',
        label: sourceValue,
        idIcon: 'videoGeneral',
        color: 'primary',
        clearAction: 'source',
      })
    }

    if (tagValue !== ALL_ID) {
      next.push({
        id: 'tag',
        label: `תגית: ${tagValue}`,
        idIcon: 'tags',
        color: 'success',
        clearAction: 'tag',
      })
    }

    return next
  }, [sourceValue, tagValue])

  const handleClearIndicator = (item) => {
    if (item?.clearAction === 'source') {
      onChangeSource(ALL_ID)
    }

    if (item?.clearAction === 'tag') {
      onChangeTag(ALL_ID)
    }
  }

  return (
    <>
      <Box sx={sx.toolbarShell}>
        <Box sx={sx.toolbarMainRow}>
          <FiltersTrigger
            hasActive={hasActiveFilters}
            onClick={() => setFiltersOpen(true)}
            label="פילטרים"
          />

          <Chip
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={iconUi({ id: 'videos', size: 'sm' })}
            sx={sx.countChip}
          >
            {filteredCount} / {totalCount}
          </Chip>

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            onClick={() => setSortOpen(true)}
            endDecorator={iconUi({
              id: getSortDirectionIcon(sortDirection),
              sx: { fontSize: 15, color: '#1ED760' },
            })}
            sx={sx.sortButton}
          >
            {getSortLabel(sortBy)}
          </Button>
        </Box>

        {indicators.length ? (
          <Box sx={sx.indicatorsRow}>
            {indicators.map((item) => (
              <VideoToolbarFilterChip
                key={item.id}
                item={item}
                onClear={handleClearIndicator}
              />
            ))}
          </Box>
        ) : null}
      </Box>

      <MobileFiltersDrawerShell
        open={filtersOpen}
        entity={getDrawerEntity(mode)}
        onClose={() => setFiltersOpen(false)}
        title={`פילטרים · ${getModeTitle(mode)}`}
        subtitle="סינון לפי מקור ותגית"
        resultsText={`${filteredCount} מתוך ${totalCount} סרטונים`}
        onReset={onResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <VideoMobileFiltersContent
          items={items}
          filters={filters}
          onChangeSource={onChangeSource}
          onChangeTag={onChangeTag}
        />
      </MobileFiltersDrawerShell>

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title={`מיון · ${getModeTitle(mode)}`}
        sortBy={sortBy}
        sortDirection={sortDirection}
        sortOptions={VIDEO_MOBILE_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}
