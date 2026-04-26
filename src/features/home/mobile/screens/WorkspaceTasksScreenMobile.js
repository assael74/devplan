// features/home/mobile/screens/WorkspaceTasksScreenMobile.js

import React, { useMemo, useState } from 'react'
import { Box, Card, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import MobileTaskCard from '../components/MobileTaskCard.js'
import TaskToolbar from '../toolbar/TaskToolbar.js'

import {
  getInProgressTasks,
  getOpenTasksCount,
} from '../../sharedLogic/home.tasksSummary.js'

import {
  createInitialTasksFilters,
  resolveTasksListDomain,
} from '../../sharedLogic/home.tasksList.logic.js'

import { workSpaceSx as sx } from './sx/workSpace.sx'

import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

const WORKSPACE_META = {
  analyst: {
    title: 'משימות אנליסט',
    subtitle: 'מועדון, שחקנים, פגישות ואנליזה',
    chip: 'אנליסט',
    idIcon: 'analyst',
    colorId: 'taskAnalyst',
  },
  app: {
    title: 'משימות אפליקציה',
    subtitle: 'פיתוח, UX, דאטה וארכיטקטורה',
    chip: 'אפליקציה',
    idIcon: 'app',
    colorId: 'taskApp',
  },
}

export default function WorkspaceTasksScreenMobile({
  workspaceId,
  buckets,
  onBack,
  onEditTask,
}) {
  const safeWorkspaceId = workspaceId === 'app' ? 'app' : 'analyst'
  const meta = WORKSPACE_META[safeWorkspaceId]
  const tasks = buckets?.[safeWorkspaceId] || []

  const [filters, setFilters] = useState(() => createInitialTasksFilters())
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortDirection, setSortDirection] = useState('desc')

  const domain = useMemo(() => {
    return resolveTasksListDomain({
      items: tasks,
      filters,
      sortBy,
      sortDirection,
    })
  }, [tasks, filters, sortBy, sortDirection])

  const inProgressCount = getInProgressTasks(tasks).length
  const openCount = getOpenTasksCount(tasks)

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const resetFilters = () => {
    setFilters(createInitialTasksFilters())
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.spaceWraper}>
        <Box sx={sx.iconWraper(c(meta.colorId).bg)}>
          {iconUi({ id: meta.idIcon, size: 'lg', sx: { color: c(meta.colorId).text } })}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography level="h3" sx={{ fontWeight: 950 }}>
            {meta.title}
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            {meta.subtitle}
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Card variant="outlined" onClick={onBack} sx={sx.iconCard(c(meta.colorId).bg)}>
          {iconUi({ id: 'back' })}
        </Card>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
        <Chip size="sm" color="warning" variant="soft" sx={sx.chipBord} startDecorator={iconUi({ id: 'inProgressTask' })}>
          בתהליך: {inProgressCount}
        </Chip>
        <Chip size="sm" color="primary" variant="soft" sx={sx.chipBord} startDecorator={iconUi({ id: 'waitingTask' })}>
          פתוחות: {openCount}
        </Chip>
        <Chip size="sm" color="neutral" variant="soft" sx={sx.chipBord}>
          סה״כ: {tasks.length}
        </Chip>
      </Box>

      <Box sx={sx.toolbarSticky}>
      <TaskToolbar
        items={tasks}
        workspace={safeWorkspaceId}
        filters={filters}
        filteredCount={domain.filteredCount}
        totalCount={domain.totalCount}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onChangeTypeFilter={(value) => updateFilter('typeFilter', value)}
        onChangeStatusFilter={(value) => updateFilter('statusFilter', value)}
        onChangePriorityFilter={(value) => updateFilter('priorityFilter', value)}
        onChangeSortBy={setSortBy}
        onChangeSortDirection={setSortDirection}
        onResetFilters={resetFilters}
      />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {domain.filteredItems.map((task) => (
          <MobileTaskCard key={task.id} task={task} onEditTask={onEditTask} />
        ))}
      </Box>
    </Box>
  )
}
