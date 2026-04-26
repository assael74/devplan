// features/home/mobile/toolbar/TaskToolbar.js

import React, { useMemo, useState } from 'react'
import { Box, Button, Chip } from '@mui/joy'

import {
  FiltersTrigger,
  MobileFiltersDrawerShell,
} from '../../../../ui/patterns/filters/index.js'
import { SortDrawerMobile } from '../../../../ui/patterns/sort/index.js'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import TasksFiltersContent from './TasksFiltersContent.js'
import ToolbarFilterChip from './ToolbarFilterChip.js'

import {
  ALL_ID,
  DEFAULT_STATUS_FILTER,
  normalizeFilterValue,
  normalizeMultiFilterValue,
  areArraysEqual,
  findOpt,
  findManyOpts,
  withCounts,
  withCountsOnly,
} from '../../sharedLogic/tasksFilters.logic.js'

import {
  TASKS_SORT_OPTIONS,
} from '../../sharedLogic/home.tasksList.logic.js'

import {
  getTaskTypeOptionsByWorkspace,
  taskPriorityOptions,
  taskStatusOptions,
} from '../../../../shared/tasks/tasks.constants.js'

import { toolbarSx as sx } from './sx/toolbar.sx.js'

function getSortLabel(sortBy) {
  const option = TASKS_SORT_OPTIONS.find((item) => item.id === sortBy)
  return option?.label || 'מיון'
}

function getSortDirectionIcon(direction) {
  return direction === 'asc' ? 'sortAsc' : 'sortDesc'
}

export default function TaskToolbar({
  items = [],
  workspace = '',
  filters,
  filteredCount = 0,
  totalCount = 0,
  sortBy = 'updatedAt',
  sortDirection = 'desc',
  onChangeTypeFilter,
  onChangeStatusFilter,
  onChangePriorityFilter,
  onChangeSortBy,
  onChangeSortDirection,
  onResetFilters,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)

  const normalizedType = normalizeFilterValue(filters?.typeFilter)
  const normalizedPriority = normalizeFilterValue(filters?.priorityFilter)
  const normalizedStatus = normalizeMultiFilterValue(
    filters?.statusFilter,
    DEFAULT_STATUS_FILTER
  )

  const hasActiveFilters =
    normalizedType !== ALL_ID ||
    normalizedPriority !== ALL_ID ||
    !areArraysEqual(normalizedStatus, DEFAULT_STATUS_FILTER)

  const typeOptions = useMemo(() => {
    if (!workspace) return []

    return withCounts(
      getTaskTypeOptionsByWorkspace(workspace),
      items,
      'taskType',
      'כל הסוגים',
      'task'
    )
  }, [workspace, items])

  const statusOptions = useMemo(() => {
    return withCountsOnly(taskStatusOptions, items, 'status')
  }, [items])

  const priorityOptions = useMemo(() => {
    return withCounts(
      taskPriorityOptions,
      items,
      'priority',
      'כל העדיפויות',
      'priorityMedium'
    )
  }, [items])

  const indicators = useMemo(() => {
    const next = []

    const typeItem = findOpt(typeOptions, normalizedType)
    const priorityItem = findOpt(priorityOptions, normalizedPriority)
    const statusItems = findManyOpts(statusOptions, normalizedStatus)

    if (workspace && normalizedType !== ALL_ID && typeItem) {
      next.push({
        id: 'typeFilter',
        label: typeItem.label,
        idIcon: typeItem.idIcon || 'task',
        color: 'primary',
        clearAction: 'typeFilter',
      })
    }

    if (normalizedPriority !== ALL_ID && priorityItem) {
      next.push({
        id: 'priorityFilter',
        label: priorityItem.label,
        idIcon: priorityItem.idIcon || 'priorityMedium',
        color: 'danger',
        clearAction: 'priorityFilter',
      })
    }

    if (!areArraysEqual(normalizedStatus, DEFAULT_STATUS_FILTER)) {
      next.push({
        id: 'statusFilter',
        label: `סטטוס: ${statusItems.length} נבחרו`,
        idIcon: 'status',
        color: 'warning',
        clearAction: 'statusFilter',
      })
    }

    return next
  }, [
    workspace,
    typeOptions,
    priorityOptions,
    statusOptions,
    normalizedType,
    normalizedPriority,
    normalizedStatus,
  ])

  const handleClearIndicator = (item) => {
    if (item?.clearAction === 'typeFilter') onChangeTypeFilter(ALL_ID)
    if (item?.clearAction === 'priorityFilter') onChangePriorityFilter(ALL_ID)
    if (item?.clearAction === 'statusFilter') onChangeStatusFilter(DEFAULT_STATUS_FILTER)
  }

  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gap: 0.75,
          p: 0.75,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 16,
          bgcolor: 'background.surface',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <FiltersTrigger
            hasActive={hasActiveFilters}
            onClick={() => setFiltersOpen(true)}
            label="פילטרים"
          />

          <Chip
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={iconUi({ id: 'tasks', size: 'sm' })}
            sx={{ border: '1px solid', borderColor: 'divider' }}
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
            sx={sx.sortBut}
          >
            {getSortLabel(sortBy)}
          </Button>
        </Box>

        {!!indicators.length ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            {indicators.map((item) => (
              <ToolbarFilterChip
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
        entity="taskApp"
        onClose={() => setFiltersOpen(false)}
        title="פילטרים למשימות"
        subtitle="סינון לפי סוג, סטטוס ועדיפות"
        resultsText={`${filteredCount} מתוך ${totalCount} משימות`}
        onReset={onResetFilters}
        resetDisabled={!hasActiveFilters}
      >
        <TasksFiltersContent
          items={items}
          workspace={workspace}
          filters={filters}
          onChangeTypeFilter={onChangeTypeFilter}
          onChangeStatusFilter={onChangeStatusFilter}
          onChangePriorityFilter={onChangePriorityFilter}
        />
      </MobileFiltersDrawerShell>

      <SortDrawerMobile
        open={sortOpen}
        onClose={() => setSortOpen(false)}
        title="מיון משימות"
        sortBy={sortBy}
        sortDirection={sortDirection}
        sortOptions={TASKS_SORT_OPTIONS}
        onChangeSortBy={onChangeSortBy}
        onChangeSortDirection={onChangeSortDirection}
      />
    </>
  )
}
