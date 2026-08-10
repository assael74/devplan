// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskList.js

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/joy'

import { taskStatusOptions } from '../../../../../../shared/tasks/tasks.constants.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { workTaskListSx as sx } from './sx/workTaskList.sx.js'

function getStatusOption(status) {
  return taskStatusOptions.find(option => option.id === status) || null
}

function getTaskLabel(task) {
  const action = String(task?.workContext?.action || '').trim()

  if (action === 'loadTeams') return 'הוספת קבוצות'
  if (action === 'loadRoster') return 'טעינת סגל'
  if (action === 'loadStats') return 'טעינת סטטיסטיקה'

  return String(task?.title || 'משימה').trim()
}

function TaskItem({ task, onEdit }) {
  const status = getStatusOption(task.status)
  const context = task?.workContext || {}
  const teamName = String(context.teamName || '').trim()
  const ageGroupLabel = String(context.ageGroupLabel || '').trim()
  const leagueName = String(context.leagueName || '').trim()
  const seasonKey = String(context.seasonKey || '').trim()
  const birthYear = String(context.birthYear || '').trim()

  return (
    <Box sx={sx.item}>
      <Box sx={sx.itemTop}>
        <Typography sx={sx.itemTitle}>
          {getTaskLabel(task)}
        </Typography>

        <Box sx={sx.itemActions}>
          {status ? (
            <Chip
              size='sm'
              variant='soft'
              sx={sx.statusChip(status.color)}
            >
              {status.label}
            </Chip>
          ) : null}

          <Button
            size='sm'
            variant='plain'
            startDecorator={iconUi({id: 'edit', size: 'sm'})}
            sx={sx.editButton}
            onClick={() => onEdit(task)}
          >
            עריכה
          </Button>
        </Box>
      </Box>

      <Box sx={sx.itemMeta}>
        <Box sx={sx.metaPrimaryRow}>
          {teamName ? (
            <Typography level='body-xs' sx={sx.metaStrong}>
              {teamName}
            </Typography>
          ) : null}

          {ageGroupLabel ? (
            <Typography level='body-xs' sx={sx.metaText}>
              {ageGroupLabel}
            </Typography>
          ) : null}

          {leagueName ? (
            <Typography level='body-xs' sx={sx.metaLeague} title={leagueName}>
              {leagueName}
            </Typography>
          ) : null}
        </Box>

        <Box sx={sx.metaSecondaryRow}>
          {seasonKey ? (
            <Typography level='body-xs' sx={sx.metaText}>
              {`עונה ${seasonKey}`}
            </Typography>
          ) : null}

          {birthYear ? (
            <Typography level='body-xs' sx={sx.metaText}>
              {`שנתון ${birthYear}`}
            </Typography>
          ) : null}
        </Box>
      </Box>
    </Box>
  )
}

export default function WorkTaskList({
  tasks = [],
  loading,
  title,
  emptyText,
  onCreate,
  onEdit,
}) {
  const resolvedTitle = title || 'משימות לליגה'
  const resolvedEmptyText = emptyText || 'אין משימות פעילות לליגה ולעונה הנוכחית'

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleRow}>
          <Typography sx={sx.title}>
            {resolvedTitle}
          </Typography>

          <Chip size='sm' variant='soft' sx={sx.count}>
            {tasks.length}
          </Chip>
        </Box>

        {typeof onCreate === 'function' ? (
          <Button
            size='sm'
            variant='solid'
            startDecorator={iconUi({id: 'add', size: 'sm'})}
            sx={sx.createButton}
            onClick={onCreate}
          >
            פתיחת משימה
          </Button>
        ) : null}
      </Box>

      {loading ? (
        <Box sx={sx.state}>
          <CircularProgress size='sm' />
        </Box>
      ) : null}

      {!loading && tasks.length === 0 ? (
        <Box sx={sx.empty}>
          <Typography level='body-xs' sx={sx.emptyText}>
            {resolvedEmptyText}
          </Typography>
        </Box>
      ) : null}

      {!loading && tasks.length > 0 ? (
        <Stack
          className='dpScrollThin'
          spacing={0.5}
          sx={sx.list}
        >
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={onEdit}
            />
          ))}
        </Stack>
      ) : null}
    </Box>
  )
}
