// src/features/videoHub/components/filters/VideoFiltersBar.js

import React, { useMemo, useState, useCallback } from 'react'
import {
  Box,
  Button,
  IconButton,
  Input,
  Switch,
  Typography,
} from '@mui/joy'

import { filterSx as sx } from './filterRow.sx'

import useVideoFilterOptions from '../../../hooks/filters/useVideoFilterOptions.js'
import useVideoFiltersController from '../../../hooks/filters/useVideoFiltersController'

import VideoFiltersRow from './rows/VideoFiltersRow'
import VideoSortRow from './rows/VideoSortRow'
import ActiveFiltersChipsRow from './rows/ActiveFiltersChipsRow'

import {
  FiltersDrawer,
  FiltersTrigger,
} from '../../../../../ui/patterns/filters/index.js'

import {
  SortMenuButton,
} from '../../../../../ui/patterns/sort/index.js'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  VIDEO_GENERAL_SORT_OPTIONS,
} from '../../../sharedLogic/videoHubGeneralFilters.logic.js'

import {
  buildVideoGeneralDrawerFilters,
  buildVideoGeneralFilterGroups,
  hasVideoGeneralDrawerFilters,
  normalizeVideoGeneralDrawerFilterChange,
} from '../../../sharedLogic/videoHubFilterGroups.logic.js'

export default function VideoFiltersBar({
  tab,
  items = [],
  filters,
  onFilters,
  context,
  total = 0,
  shown = 0,

  selectionMode = false,
  selectedCount = 0,
  onStartSelection,
  onCancelSelection,
  onOpenDelete,
  cardView = 'full',
  onCardView,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const options = useVideoFilterOptions({ tab, context, filters, items })

  const {
    setCascade,
    clearAll,
    activeChips,
    removeChip,
    sortLabel,
  } = useVideoFiltersController({ tab, filters, onFilters, options })

  const isGeneral = tab === 'general'

  const drawerFilters = useMemo(() => {
    if (!isGeneral) return {}
    return buildVideoGeneralDrawerFilters(filters)
  }, [isGeneral, filters])

  const drawerGroups = useMemo(() => {
    if (!isGeneral) return []
    return buildVideoGeneralFilterGroups(options)
  }, [isGeneral, options])

  const hasDrawerActive = useMemo(() => {
    return hasVideoGeneralDrawerFilters(drawerFilters)
  }, [drawerFilters])

  const sortOptions = useMemo(() => {
    if (!isGeneral) return []
    return Array.isArray(options?.sortOptions) && options.sortOptions.length
      ? options.sortOptions
      : VIDEO_GENERAL_SORT_OPTIONS
  }, [isGeneral, options?.sortOptions])

  const handleDrawerChange = useCallback((key, value) => {
    setCascade(normalizeVideoGeneralDrawerFilterChange(key, value, options))
  }, [setCascade, options])

  const handleChangeSortBy = useCallback((nextSortBy) => {
    setCascade({ sortBy: nextSortBy || 'needs_tagging_first' })
  }, [setCascade])

  const handleChangeSortDirection = useCallback((nextDirection) => {
    setCascade({ sortDir: nextDirection || 'desc' })
  }, [setCascade])

  if (!isGeneral) {
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

  const controlSx = {
    minHeight: 32,
    height: 32,
  }

  const isMiniView = cardView === 'mini'

  const handleCardViewChange = event => {
    onCardView?.(event.target.checked ? 'mini' : 'full')
  }

  if (selectionMode) {
    return (
      <Box sx={{ display: 'grid', gap: 0.75 }}>
        <Box sx={sx.selectionToolbar}>
          <Box sx={sx.selectionInfo}>
            {iconUi({ id: 'delete' })}

            <Typography level="title-sm">
              נבחרו {selectedCount} קטעי וידאו
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            color="danger"
            variant="solid"
            disabled={!selectedCount}
            startDecorator={iconUi({ id: 'delete' })}
            onClick={onOpenDelete}
          >
            מחיקת {selectedCount || ''} מספר קטעי וידאו
          </Button>

          <Button
            size="sm"
            color="neutral"
            variant="soft"
            startDecorator={iconUi({ id: 'close' })}
            onClick={onCancelSelection}
          >
            ביטול
          </Button>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      <Box sx={sx.toolbar}>
        <Input
          size="sm"
          placeholder="חיפוש לפי שם / תיאור / קטגוריה / תגית…"
          value={filters.q || ''}
          onChange={(event) => setCascade({ q: event.target.value })}
          sx={{
            width: 360,
            maxWidth: '100%',
            minHeight: 32,
          }}
          startDecorator={iconUi({ id: 'search' })}
        />

        <FiltersTrigger
          hasActive={hasDrawerActive}
          onClick={() => setDrawerOpen(true)}
          label="פילטרים"
          minWidth={170}
          buttonSx={controlSx}
        />

        <IconButton
          size="sm"
          variant="soft"
          color="neutral"
          onClick={clearAll}
          disabled={activeChips.length === 0}
          sx={sx.reset}
        >
          {iconUi({ id: 'close' })}
        </IconButton>

        <Button
          size="sm"
          variant="soft"
          color="danger"
          startDecorator={iconUi({ id: 'delete' })}
          onClick={onStartSelection}
          sx={controlSx}
        >
          מחיקה
        </Button>

        <Box sx={{ flex: 1, minWidth: 24 }} />

        <Box sx={sx.viewToggle}>
          {iconUi({ id: isMiniView ? 'cardList' : 'tableList', size: 'sm' })}

          <Typography level="body-xs" sx={sx.viewToggleLabel}>
            תצוגה מוקטנת
          </Typography>

          <Switch
            size="sm"
            checked={isMiniView}
            onChange={handleCardViewChange}
            slotProps={{
              input: {
                'aria-label': 'תצוגה מוקטנת לכרטיסי וידאו',
              },
            }}
          />
        </Box>

        <SortMenuButton
          labelPrefix="מיון:"
          sortBy={filters.sortBy || 'needs_tagging_first'}
          sortDirection={filters.sortDir || 'desc'}
          sortOptions={sortOptions}
          onChangeSortBy={handleChangeSortBy}
          onChangeSortDirection={handleChangeSortDirection}
          width={200}
        />
      </Box>

      <ActiveFiltersChipsRow
        total={total}
        shown={shown}
        sortLabel={sortLabel}
        sortDir={filters.sortDir}
        activeChips={activeChips}
        onRemoveChip={removeChip}
      />

      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entity="videoGeneral"
        title="פילטרים לווידאו כללי"
        resultsText={`מציג ${shown} מתוך ${total}`}
        filters={drawerFilters}
        groups={drawerGroups}
        fields={[]}
        size="lg"
        panelSize="md"
        onChange={handleDrawerChange}
        onReset={() => {
          setCascade({
            source: '',
            primaryCategoryId: '',
            tagType: '',
            taggingStatus: '',
            tags: [],
            tagIds: [],
            onlyWithoutCategory: false,
            onlyWithoutTags: false,
          })
        }}
      />
    </Box>
  )
}
