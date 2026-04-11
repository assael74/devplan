// features/home/components/TasksSectionCard.js

import React, { useMemo, useState } from 'react'
import { Box, Card, Divider, Typography, IconButton, Tooltip, Stack } from '@mui/joy'

import { homeSx as sx } from '../sx/home.sx.js'
import TaskRowCard from './TaskRowCard.js'
import TasksFilters from './TasksFilters.js'

import { iconUi } from '../../../ui/core/icons/iconUi.js'

function resolveWorkspaceBySectionId(id) {
  if (id === 'taskAnalyst') return 'analyst'
  if (id === 'taskApp') return 'app'
  return ''
}

function matchesFilter(value, filterValue) {
  if (!filterValue || filterValue === 'all') return true
  return String(value || '') === String(filterValue)
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
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')

  const tip = id === 'taskAnalyst' ? 'הוספת משימה לאנליסט' : 'הוספת משימה למפתח'
  const workspace = useMemo(() => resolveWorkspaceBySectionId(id), [id])

  const filteredItems = useMemo(() => {
    return items.filter((task) => {
      const passType = matchesFilter(task?.taskType, typeFilter)
      const passStatus = matchesFilter(task?.status, statusFilter)
      const passPriority = matchesFilter(task?.priority, priorityFilter)

      return passType && passStatus && passPriority
    })
  }, [items, typeFilter, statusFilter, priorityFilter])

  const handleReset = () => {
    setTypeFilter('all')
    setStatusFilter('all')
    setPriorityFilter('all')
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
          <Stack spacing={1}>
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
