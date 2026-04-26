// features/home/mobile/screens/InProgressTasksScreenMobile.js

import React, { useMemo, useState } from 'react'
import { Box, Card, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import MobileTaskCard from '../components/MobileTaskCard.js'
import TaskToolbar from '../toolbar/TaskToolbar.js'

import {
  createInitialTasksFilters,
  resolveTasksListDomain,
} from '../../sharedLogic/home.tasksList.logic.js'

import { workSpaceSx as sx } from './sx/workSpace.sx'

export default function InProgressTasksScreenMobile({ bucket, onBack, onEditTask }) {
  const tasks = bucket?.all || []

  const [filters, setFilters] = useState(() => {
    return createInitialTasksFilters({
      statusFilter: ['inProgress'],
    })
  })

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

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const resetFilters = () => {
    setFilters(createInitialTasksFilters({ statusFilter: ['inProgress'] }))
  }

  return (
    <Box sx={sx.root}>
      <Box sx={sx.spaceWraper}>
        <Box sx={sx.iconWraper('#6aa84f')}>
          {iconUi({ id: 'inProgressTask', size: 'md', sx: { color: '#ffffff' } })}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography level="h3" sx={{ fontWeight: 950 }}>
            משימות בתהליך
          </Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            כל המשימות שנמצאות בעבודה כרגע
          </Typography>
        </Box>

        <Box sx={{ flex: 1 }} />

        <Card variant="outlined" onClick={onBack} sx={sx.iconCard('warning.softBg')}>
          {iconUi({ id: 'back' })}
        </Card>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
        <Chip size="sm" color="warning" variant="soft" sx={sx.chipBord} startDecorator={iconUi({ id: 'tasks', size: 'sm' })}>
          סה״כ: {tasks.length}
        </Chip>
        <Chip size="sm" variant="soft" sx={sx.chipBord} startDecorator={iconUi({ id: 'Analyst', size: 'sm' })}>
          אנליסט: {bucket?.analyst?.length || 0}
        </Chip>
        <Chip size="sm" variant="soft" sx={sx.chipBord} startDecorator={iconUi({ id: 'app', size: 'sm' })}>
          אפליקציה: {bucket?.app?.length || 0}
        </Chip>
      </Box>

      <Box sx={sx.toolbarSticky}>
        <TaskToolbar
          items={tasks}
          workspace=""
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
