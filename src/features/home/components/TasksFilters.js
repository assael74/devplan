// features/home/components/TasksFilters.js

import React, { useMemo } from 'react'
import { Box, IconButton, Option, Select, Sheet, Tooltip, Chip } from '@mui/joy'

import { iconUi } from '../../../ui/core/icons/iconUi.js'
import { filtersSx as sx } from '../sx/tasksFilters.sx.js'

import {
  getTaskTypeOptionsByWorkspace,
  taskPriorityOptions,
  taskStatusOptions,
} from '../../../shared/tasks/tasks.constants.js'

import {
  ALL_ID,
  normalizeFilterValue,
  withCounts,
  findOpt,
} from '../logic/tasksFilters.logic.js'

import TasksFilterSelectValue from './tasksFilters/TasksFilterSelectValue.js'

export default function TasksFilters({
  items = [],
  workspace = '',
  typeFilter = ALL_ID,
  statusFilter = ALL_ID,
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
    return withCounts(taskStatusOptions, items, 'status', 'סטטוס', 'tasks')
  }, [items])

  const priorityOptions = useMemo(() => {
    return withCounts(taskPriorityOptions, items, 'priority', 'עדיפות', 'priorityMedium')
  }, [items])

  const isDirty =
    normalizeFilterValue(typeFilter) !== ALL_ID ||
    normalizeFilterValue(statusFilter) !== ALL_ID ||
    normalizeFilterValue(priorityFilter) !== ALL_ID

  return (
    <Sheet variant="plain" sx={sx.filtersBoxSx}>
      <Box sx={sx.filtersTopRowSx}>
        {workspace ? (
          <Select
            size="sm"
            value={normalizeFilterValue(typeFilter)}
            onChange={(e, v) => onChangeTypeFilter(v || ALL_ID)}
            sx={{ width: 138, flex: '0 0 138px' }}
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
          size="sm"
          value={normalizeFilterValue(statusFilter)}
          onChange={(e, v) => onChangeStatusFilter(v || ALL_ID)}
          sx={{ width: 128, flex: '0 0 128px' }}
          renderValue={(selected) => (
            <TasksFilterSelectValue option={findOpt(statusOptions, selected?.value)} />
          )}
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
          onChange={(e, v) => onChangePriorityFilter(v || ALL_ID)}
          sx={{ width: 120, flex: '0 0 120px' }}
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

        <Box sx={{ flex: 1 }} />

        <Chip size="sm" variant="outlined">
          {filteredItems.length} / {items.length} משימות
        </Chip>
      </Box>
    </Sheet>
  )
}
