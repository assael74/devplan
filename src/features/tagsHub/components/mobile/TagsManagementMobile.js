// src/features/tagsHub/components/mobile/TagsManagementMobile.js

import React, { useMemo, useState } from 'react'
import { Box, Sheet, Typography, Button } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import FiltersTrigger from '../../../../ui/patterns/filters/FiltersTrigger'
import MobileFiltersDrawerShell from '../../../../ui/patterns/filters/MobileFiltersDrawerShell'
import SortDrawerMobile from '../../../../ui/patterns/sort/SortDrawerMobile'

import TagHubFabMenu from '../../sharedUi/TagHubFabMenu'
import TagsFiltersContent from './TagsFiltersContent'
import TagsListMobile from './TagsListMobile'
import TagEditorDrawer from '../../sharedUi/TagEditorDrawer.js'

import { hubSx as sx } from './sx/hub.sx'

function getActiveFiltersCount(filters) {
  const f = filters || {}
  let count = 0

  if (f.q) count += 1
  if (f.tagType && f.tagType !== 'all') count += 1
  if (f.hierarchy && f.hierarchy !== 'all') count += 1
  if (f.showArchived) count += 1

  return count
}

function hasActiveFilters(filters) {
  return getActiveFiltersCount(filters) > 0
}

export default function TagsManagementMobile({
  uiFilters,
  onChangeFilters,
  sections,
  tagsNorm,
  editTag,
  drawerOpen,
  onEdit,
  onCloseDrawer,
  onCreateTag,
  onAddTask,
  taskContext,
  sort,
  sortOptions,
  onChangeSortBy,
  onChangeSortDirection,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const activeFiltersCount = useMemo(() => {
    return getActiveFiltersCount(uiFilters)
  }, [uiFilters])

  const filtersActive = activeFiltersCount > 0

  const resetFilters = () => {
    onChangeFilters({
      q: '',
      tagType: 'all',
      showArchived: false,
      hierarchy: 'all',
    })
  }

  return (
    <Box sx={sx.root}>
      <Sheet variant="soft" sx={sx.sheet}>
        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-lg" noWrap startDecorator={iconUi({ id: 'tags' })}>
            ניהול תגים
          </Typography>

          <Typography level="body-xs" sx={{ color: 'neutral.500' }} noWrap>
            קטגוריות, תתי תגיות ושיוך לווידאו
          </Typography>
        </Box>
      </Sheet>

      <Box sx={sx.boxTrig}>
        <FiltersTrigger
          hasActive={filtersActive}
          onClick={() => setFiltersOpen(true)}
          label={filtersActive ? `פילטרים (${activeFiltersCount})` : 'פילטרים'}
        />

        <Box sx={{ flex: 1 }} />

        <Button
          size="sm"
          variant="soft"
          color="neutral"
          onClick={() => setSortOpen(true)}
          sx={sx.sortButt}
          endDecorator={iconUi({
            id: sort?.direction === 'desc' ? 'sortDown' : 'sortUp',
            sx: { fontSize: 15, color: '#1ED760' },
          })}
        >
          מיון
        </Button>
      </Box>

      <Box className="dpScrollThin" sx={sx.scroll}>
        <TagsListMobile sections={sections} onEdit={onEdit} />
      </Box>

      <MobileFiltersDrawerShell
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        entity="tags"
        title="סינון תגים"
        subtitle="סינון לפי סוג תג, היררכיה וארכיון"
        onReset={resetFilters}
        resetDisabled={!filtersActive}
      >
        <TagsFiltersContent
          value={uiFilters}
          onChange={onChangeFilters}
          layout="column"
        />
      </MobileFiltersDrawerShell>

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון תגים"
        sortBy={sort?.by}
        sortDirection={sort?.direction}
        sortOptions={sortOptions}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />

      <TagHubFabMenu
        onCreateTag={onCreateTag}
        onAddTask={onAddTask}
        taskContext={taskContext}
        entityType="tags"
      />

      <TagEditorDrawer
        open={drawerOpen}
        tag={editTag}
        isMobile={true}
        parentOptions={tagsNorm}
        onClose={onCloseDrawer}
      />
    </Box>
  )
}
