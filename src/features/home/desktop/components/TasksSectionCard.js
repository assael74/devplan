// features/home/components/TasksSectionCard.js

import React, { useMemo, useState } from 'react'
import { Box, Card, Divider, Typography, IconButton, Tooltip, Stack } from '@mui/joy'

import { pageSx as sx } from '../page.sx.js'
import TaskRowCard from './TaskRowCard.js'
import TasksFilters from './TasksFilters.js'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  TASK_PRIORITY,
  TASK_STATUS,
} from '../../../../shared/tasks/tasks.constants.js'

import {
  ALL_ID,
  DEFAULT_STATUS_FILTER,
  matchesSingleFilter,
  matchesMultiFilter,
  normalizeMultiFilterValue,
} from '../../sharedLogic/tasksFilters.logic.js'

function resolveWorkspaceBySectionId(id) {
  if (id === 'taskAnalyst') return 'analyst'
  if (id === 'taskApp') return 'app'
  return ''
}

const statusRankMap = {
  [TASK_STATUS.IN_PROGRESS]: 0,
  [TASK_STATUS.WAITING]: 1,
  [TASK_STATUS.NEW]: 2,
  [TASK_STATUS.DONE]: 3,
  [TASK_STATUS.ARCHIVED]: 4,
}

const priorityRankMap = {
  [TASK_PRIORITY.HIGH]: 0,
  [TASK_PRIORITY.MEDIUM]: 1,
  [TASK_PRIORITY.LOW]: 2,
}

function sortTasks(a, b) {
  const statusDiff =
    (statusRankMap[a?.status] ?? 99) - (statusRankMap[b?.status] ?? 99)

  if (statusDiff !== 0) return statusDiff

  const priorityDiff =
    (priorityRankMap[a?.priority] ?? 99) - (priorityRankMap[b?.priority] ?? 99)

  if (priorityDiff !== 0) return priorityDiff

  const sortOrderDiff = (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0)
  if (sortOrderDiff !== 0) return sortOrderDiff

  const updatedDiff = (b?.updatedAt ?? 0) - (a?.updatedAt ?? 0)
  if (updatedDiff !== 0) return updatedDiff

  const createdDiff = (b?.createdAt ?? 0) - (a?.createdAt ?? 0)
  if (createdDiff !== 0) return createdDiff

  return String(a?.title || '').localeCompare(String(b?.title || ''), 'he')
}

export default function TasksSectionCard({
  id,
  title,
  subtitle,
  onEditTask,
  onCreateTask,
  items = [],
  icon = null,
}) {
  const [typeFilter, setTypeFilter] = useState(ALL_ID)
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER)
  const [priorityFilter, setPriorityFilter] = useState(ALL_ID)

  const tip = id === 'taskAnalyst' ? 'הוספת משימה לאנליסט' : 'הוספת משימה למפתח'
  const workspace = useMemo(() => resolveWorkspaceBySectionId(id), [id])

  const filteredItems = useMemo(() => {
    const normalizedStatuses = normalizeMultiFilterValue(statusFilter, DEFAULT_STATUS_FILTER)

    return items
      .filter((task) => {
        const passType = matchesSingleFilter(task?.taskType, typeFilter)
        const passStatus = matchesMultiFilter(task?.status, normalizedStatuses)
        const passPriority = matchesSingleFilter(task?.priority, priorityFilter)

        return passType && passStatus && passPriority
      })
      .sort(sortTasks)
  }, [items, typeFilter, statusFilter, priorityFilter])

  const handleReset = () => {
    setTypeFilter(ALL_ID)
    setStatusFilter(DEFAULT_STATUS_FILTER)
    setPriorityFilter(ALL_ID)
  }

  return (
    <Card variant="outlined" sx={sx.rootSection}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography level="title-lg" startDecorator={icon}>
            {title}
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Tooltip title={tip}>
            <IconButton
              size="md"
              variant="outlined"
              sx={sx.icoAddSx(id)}
              onClick={() => onCreateTask(id)}
            >
              {iconUi({ id: 'addTask', size: 'md' })}
            </IconButton>
          </Tooltip>
        </Box>

        {subtitle ? (
          <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
            {subtitle}
          </Typography>
        ) : null}

        <TasksFilters
          items={items}
          workspace={workspace}
          typeFilter={typeFilter}
          statusFilter={statusFilter}
          filteredItems={filteredItems}
          priorityFilter={priorityFilter}
          onChangeTypeFilter={setTypeFilter}
          onChangeStatusFilter={setStatusFilter}
          onChangePriorityFilter={setPriorityFilter}
          onReset={handleReset}
        />
      </Box>

      <Divider />

      <Box className="dpScrollThin" sx={sx.scrollBox}>
        {filteredItems.length ? (
          <Stack spacing={1} sx={{ pr: 0.2 }}>
            {filteredItems.map((task) => (
              <TaskRowCard
                key={task.id}
                task={task}
                id={id}
                onEditTask={onEditTask}
              />
            ))}
          </Stack>
        ) : (
          <Box sx={sx.emptyCenter}>
            <Typography level="title-md" sx={{ color: 'text.tertiary' }}>
              אין משימות תואמות לפילטרים
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  )
}
