// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterWorkArea.js

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { taskStatusOptions } from '../../../../../shared/tasks/tasks.constants.js'
import { PLAYERS_DATABASE_LEAGUES_CATALOG } from '../../../catalog/leagues.catalog.js'
import { leagueCenterWorkAreaSx as sx } from './sx/leagueCenterWorkArea.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()

function getStatusOption(status) {
  return taskStatusOptions.find(option => option.id === status) || null
}

function splitTaskMeta(value) {
  return clean(value)
    .split('·')
    .map(clean)
    .filter(Boolean)
}

function resolveTaskTeamName(task) {
  const context = task?.workContext || {}
  const directName = clean(
    context.teamName ||
    task?.teamName
  )

  if (directName) return directName
  if (clean(context.scope) !== 'team') return ''

  const titleParts = splitTaskMeta(task?.title)
  if (titleParts.length > 1) {
    return titleParts[1]
  }

  const descriptionParts = splitTaskMeta(task?.description)
  return descriptionParts[0] || ''
}

function getTaskActionLabel(task) {
  const action = clean(task?.workContext?.action)

  if (action === 'loadTeams') return 'הוספת קבוצות'
  if (action === 'loadRoster') return 'טעינת סגל'
  if (action === 'loadStats') return 'טעינת סטטיסטיקה'

  return clean(task?.title) || 'משימה'
}

function TaskMeta({ task }) {
  const context = task?.workContext || {}
  const catalogLeague = PLAYERS_DATABASE_LEAGUES_CATALOG.find(item => (
    clean(item.id) === clean(context.leagueId)
  )) || null
  const ageGroup = clean(
    context.ageGroupLabel ||
    context.ageGroup ||
    context.ageGroupId ||
    catalogLeague?.ageGroupLabel
  )
  const leagueName = clean(context.leagueName || catalogLeague?.name)
  const seasonKey = clean(context.seasonKey)
  const birthYear = clean(context.birthYear)
  const teamName = resolveTaskTeamName(task)

  return (
    <Box sx={sx.taskMeta}>
      <Box sx={sx.metaMainRow}>
        {teamName ? (
          <Typography level='body-xs' sx={sx.teamName}>
            {teamName}
          </Typography>
        ) : null}

        {teamName && ageGroup ? (
          <Typography level='body-xs' sx={sx.metaSeparator}>
            ·
          </Typography>
        ) : null}

        {ageGroup ? (
          <Typography level='body-xs' sx={sx.metaPrimary}>
            {ageGroup}
          </Typography>
        ) : null}

        {(teamName || ageGroup) && leagueName ? (
          <Typography level='body-xs' sx={sx.metaSeparator}>
            ·
          </Typography>
        ) : null}

        {leagueName ? (
          <Typography
            level='body-xs'
            title={leagueName}
            sx={sx.leagueName}
          >
            {leagueName}
          </Typography>
        ) : null}
      </Box>

      <Box sx={sx.metaSubRow}>
        {seasonKey ? (
          <Typography level='body-xs' sx={sx.metaText}>
            {`עונה ${seasonKey}`}
          </Typography>
        ) : null}

        {seasonKey && birthYear ? (
          <Typography level='body-xs' sx={sx.metaSeparator}>
            ·
          </Typography>
        ) : null}

        {birthYear ? (
          <Typography level='body-xs' sx={sx.metaText}>
            {`שנתון ${birthYear}`}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}

function TaskItem({
  task,
  onOpen,
  onEdit,
}) {
  const statusOption = getStatusOption(task.status)

  return (
    <Box sx={sx.taskItem}>
      <Box sx={sx.taskHeader}>
        <Typography sx={sx.taskTitle}>
          {getTaskActionLabel(task)}
        </Typography>

        <Box sx={sx.taskHeaderActions}>
          {statusOption ? (
            <Chip
              size='sm'
              variant='soft'
              sx={sx.statusChip(statusOption.color)}
            >
              {statusOption.label}
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

      <Button
        variant='plain'
        sx={sx.taskOpenButton}
        onClick={() => onOpen(task)}
      >
        <TaskMeta task={task} />
      </Button>
    </Box>
  )
}

export default function LeagueCenterWorkArea({
  tasks,
  loading,
  onOpenTask,
  onOpenTaskItem,
  onEditTask,
}) {
  return (
    <Stack spacing={1} sx={sx.workArea}>
      <Box sx={sx.sectionHeader}>
        <Typography level='title-sm' sx={sx.sectionTitle}>
          אזור עבודה
        </Typography>

        <Button
          size='sm'
          variant='solid'
          startDecorator={iconUi({id: 'add', size: 'sm'})}
          sx={sx.createButton}
          onClick={onOpenTask}
        >
          פתיחת משימה
        </Button>
      </Box>

      {loading ? (
        <Box sx={sx.stateBox}>
          <CircularProgress size='sm' />
          <Typography level='body-sm' sx={sx.stateText}>
            טוען משימות...
          </Typography>
        </Box>
      ) : null}

      {!loading && tasks.length === 0 ? (
        <Box sx={sx.emptyBox}>
          <Typography sx={sx.emptyTitle}>
            אין משימות פעילות
          </Typography>
          <Typography level='body-xs' sx={sx.emptyCaption}>
            משימה חדשה שתיפתח ממערכת השחקנים תופיע כאן.
          </Typography>
        </Box>
      ) : null}

      {!loading && tasks.length > 0 ? (
        <Stack
          className='dpScrollThin'
          spacing={0.75}
          sx={sx.taskList}
        >
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onOpen={onOpenTaskItem}
              onEdit={onEditTask}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
