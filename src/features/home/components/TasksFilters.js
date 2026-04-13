// features/home/components/TasksFilters.js

import React, { useMemo } from 'react'
import {
  Box,
  IconButton,
  Option,
  Select,
  Sheet,
  Tooltip,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { filtersSx as sx } from '../sx/tasksFilters.sx.js'

import {
  TASK_STATUS,
  getTaskTypeOptionsByWorkspace,
  taskPriorityOptions,
  taskStatusOptions,
} from '../../../shared/tasks/tasks.constants.js'

import {
  ALL_ID,
  DEFAULT_STATUS_FILTER,
  normalizeFilterValue,
  normalizeMultiFilterValue,
  withCounts,
  withCountsOnly,
  findOpt,
  findManyOpts,
  areArraysEqual,
} from '../logic/tasksFilters.logic.js'

import TasksFilterSelectValue from './tasksFilters/TasksFilterSelectValue.js'

function renderStatusValue(selectedIds = [], statusOptions = []) {
  const selectedOptions = findManyOpts(statusOptions, selectedIds)

  if (!selectedOptions.length) {
    return (
      <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
        סטטוס
      </Typography>
    )
  }

  if (selectedOptions.length === 1) {
    return <TasksFilterSelectValue option={selectedOptions[0]} />
  }

  const doneSelected = selectedIds.includes(TASK_STATUS.DONE)
  const archivedSelected = selectedIds.includes(TASK_STATUS.ARCHIVED)
  const closedCount = Number(doneSelected) + Number(archivedSelected)

  return (
    <Typography level="body-sm" sx={{ whiteSpace: 'nowrap' }}>
      סטטוס: {selectedOptions.length} נבחרו{closedCount ? ` · ${closedCount} סגורות` : ''}
    </Typography>
  )
}

export default function TasksFilters({
  items = [],
  workspace = '',
  typeFilter = ALL_ID,
  statusFilter = DEFAULT_STATUS_FILTER,
  priorityFilter = ALL_ID,
  onChangeTypeFilter,
  onChangeStatusFilter,
  onChangePriorityFilter,
  onReset,
  filteredItems = [],
}) {
  const typeOptions = useMemo(() => {
    if (!workspace) return []

    return withCounts(
      getTaskTypeOptionsByWorkspace(workspace),
      items,
      'taskType',
      'סוג משימה',
      'task'
    )
  }, [workspace, items])

  const statusOptions = useMemo(() => {
    return withCountsOnly(taskStatusOptions, items, 'status')
  }, [items])

  const priorityOptions = useMemo(() => {
    return withCounts(taskPriorityOptions, items, 'priority', 'עדיפות', 'priorityMedium')
  }, [items])

  const normalizedStatusFilter = normalizeMultiFilterValue(statusFilter, DEFAULT_STATUS_FILTER)

  const handledCount = items.filter(
    (task) => task?.status === TASK_STATUS.DONE || task?.status === TASK_STATUS.ARCHIVED
  ).length

  const inProgressCount = items.filter(
    (task) => task?.status === TASK_STATUS.IN_PROGRESS
  ).length

  const isDirty =
    normalizeFilterValue(typeFilter) !== ALL_ID ||
    normalizeFilterValue(priorityFilter) !== ALL_ID ||
    !areArraysEqual(normalizedStatusFilter, DEFAULT_STATUS_FILTER)

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        {workspace ? (
          <Select
            size="sm"
            value={normalizeFilterValue(typeFilter)}
            onChange={(e, value) => onChangeTypeFilter(value || ALL_ID)}
            sx={{ width: 146, flex: '0 0 146px' }}
            renderValue={(selected) => (
              <TasksFilterSelectValue option={findOpt(typeOptions, selected?.value)} />
            )}
          >
            {typeOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                <TasksFilterSelectValue option={option} />
              </Option>
            ))}
          </Select>
        ) : null}

        <Select
          multiple
          size="sm"
          value={normalizedStatusFilter}
          onChange={(e, value) => onChangeStatusFilter(normalizeMultiFilterValue(value, []))}
          sx={{ width: 244, flex: '0 0 244px' }}
          renderValue={() => renderStatusValue(normalizedStatusFilter, statusOptions)}
        >
          {statusOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              <TasksFilterSelectValue option={option} />
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={normalizeFilterValue(priorityFilter)}
          onChange={(e, value) => onChangePriorityFilter(value || ALL_ID)}
          sx={{ width: 122, flex: '0 0 122px' }}
          renderValue={(selected) => (
            <TasksFilterSelectValue option={findOpt(priorityOptions, selected?.value)} />
          )}
        >
          {priorityOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              <TasksFilterSelectValue option={option} />
            </Option>
          ))}
        </Select>

        <Box sx={{ flex: 1, minWidth: 0 }} />

        <Tooltip title="איפוס פילטרים">
          <span>
            <IconButton
              disabled={!isDirty}
              size="sm"
              variant="outlined"
              sx={{ height: 36, width: 36, flexShrink: 0 }}
              onClick={onReset}
            >
              {iconUi({ id: 'reset', size: 'sm' })}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Box sx={sx.filtersBottomRowSx}>
        <Chip size="sm" variant="outlined" color="primary" sx={{ '--Chip-minHeight': '24px', fontWeight: 600 }}>
          מוצגות: {filteredItems.length} / {items.length}
        </Chip>

        <Chip size="sm" variant="outlined" color="success" sx={{ '--Chip-minHeight': '24px', fontWeight: 600 }}>
          טופלו: {handledCount}
        </Chip>

        <Chip size="sm" variant="outlined" color="warning" sx={{ '--Chip-minHeight': '24px', fontWeight: 600 }}>
          בתהליך: {inProgressCount}
        </Chip>
      </Box>
    </Sheet>
  )
}
