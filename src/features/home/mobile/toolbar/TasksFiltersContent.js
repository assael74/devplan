// features/home/mobile/toolbar/TasksFiltersContent.js

import React, { useMemo } from 'react'
import {
  Box,
  Chip,
  FormControl,
  FormLabel,
  ListItemDecorator,
  Option,
  Select,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  getTaskTypeOptionsByWorkspace,
  taskPriorityOptions,
  taskStatusOptions,
} from '../../../../shared/tasks/tasks.constants.js'

import {
  ALL_ID,
  DEFAULT_STATUS_FILTER,
  normalizeFilterValue,
  normalizeMultiFilterValue,
  withCounts,
  withCountsOnly,
  findOpt,
  findManyOpts,
} from '../../sharedLogic/tasksFilters.logic.js'

function SelectValue({ option, fallback = '' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, width: '100%' }}>
      {option?.idIcon ? iconUi({ id: option.idIcon, size: 'sm' }) : null}

      <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
        {option?.label || fallback}
      </Typography>

      <Chip size="sm" variant="soft" sx={{ flexShrink: 0 }}>
        {option?.count || 0}
      </Chip>
    </Box>
  )
}

function OptionRow({ option }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <ListItemDecorator>
        {iconUi({ id: option?.idIcon || 'task', size: 'sm' })}
      </ListItemDecorator>

      <Typography level="body-sm" noWrap sx={{ minWidth: 0, flex: 1 }}>
        {option?.label || ''}
      </Typography>

      <Chip size="sm" variant="soft" color="primary">
        {option?.count || 0}
      </Chip>
    </Box>
  )
}

export default function TasksFiltersContent({
  items = [],
  workspace = '',
  filters,
  onChangeTypeFilter,
  onChangeStatusFilter,
  onChangePriorityFilter,
}) {
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

  const normalizedType = normalizeFilterValue(filters?.typeFilter)
  const normalizedPriority = normalizeFilterValue(filters?.priorityFilter)
  const normalizedStatus = normalizeMultiFilterValue(
    filters?.statusFilter,
    DEFAULT_STATUS_FILTER
  )

  const selectedType = findOpt(typeOptions, normalizedType)
  const selectedPriority = findOpt(priorityOptions, normalizedPriority)
  const selectedStatuses = findManyOpts(statusOptions, normalizedStatus)

  return (
    <Box sx={{ display: 'grid', gap: 2, px: 2 }}>
      {workspace ? (
        <FormControl>
          <FormLabel>סוג משימה</FormLabel>
          <Select
            size="sm"
            value={normalizedType}
            onChange={(_, value) => onChangeTypeFilter(value || ALL_ID)}
            sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
            renderValue={() => (
              <SelectValue option={selectedType} fallback="כל הסוגים" />
            )}
          >
            {typeOptions.map((option) => (
              <Option key={option.id} value={option.id}>
                <OptionRow option={option} />
              </Option>
            ))}
          </Select>
        </FormControl>
      ) : null}

      <FormControl>
        <FormLabel>סטטוס</FormLabel>
        <Select
          multiple
          size="sm"
          value={normalizedStatus}
          onChange={(_, value) => {
            onChangeStatusFilter(normalizeMultiFilterValue(value, []))
          }}
          sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
          renderValue={() => (
            <Typography level="body-sm" noWrap>
              סטטוס: {selectedStatuses.length} נבחרו
            </Typography>
          )}
        >
          {statusOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              <OptionRow option={option} />
            </Option>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <FormLabel>עדיפות</FormLabel>
        <Select
          size="sm"
          value={normalizedPriority}
          onChange={(_, value) => onChangePriorityFilter(value || ALL_ID)}
          sx={{ minWidth: 0, width: '100%', bgcolor: 'background.surface' }}
          renderValue={() => (
            <SelectValue option={selectedPriority} fallback="כל העדיפויות" />
          )}
        >
          {priorityOptions.map((option) => (
            <Option key={option.id} value={option.id}>
              <OptionRow option={option} />
            </Option>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}
