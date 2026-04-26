// features/home/components/MobileTaskCard.js

import React from 'react'
import { Card, Chip, IconButton, Link, Stack, Typography, Box, Tooltip } from '@mui/joy'

import { cardSx as sx } from './sx/card.sx'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'

import {
  TASK_STATUS,
  getTaskStatusMeta,
  getTaskPriorityMeta,
  getTaskTypeMeta,
  getTaskComplexityMeta,
} from '../../../../shared/tasks/tasks.constants.js'

import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export default function TaskRowCard({ task, onEditTask }) {
  const taskTypeMeta = getTaskTypeMeta(task?.workspace, task?.taskType)
  const statusMeta = getTaskStatusMeta(task?.status)
  const priorityMeta = getTaskPriorityMeta(task?.priority)
  const complexityMeta = getTaskComplexityMeta(task?.complexity)
  const entity = task?.contextMode === 'analyst' ? 'taskAnalyst' : 'taskApp'

  const isInProgress = task?.status === TASK_STATUS.IN_PROGRESS
  const isHighPriority = task?.priority === 'high'
  const isHighComplexity = task?.complexity === 'high'

  const hasUrl = Boolean(task?.url)
  const hasDescription = Boolean(task?.description?.trim())

  return (
    <Card variant="soft" sx={sx.cardMob(entity)} onClick={() => onEditTask(task)}>
      <Stack sx={sx.cardContent} spacing={hasDescription ? 0.9 : 0.7}>
        <Box sx={sx.titleRow}>
          <Box sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
            <Typography
              level="title-sm"
              sx={{ lineHeight: 1.3, fontWeight: 600 }}
              startDecorator={taskTypeMeta?.idIcon ? iconUi({ id: taskTypeMeta.idIcon }) : null}
            >
              {task?.title || 'ללא כותרת'}
            </Typography>
          </Box>

          <IconButton
            size="sm"
            color="neutral"
            sx={sx.icoEdit(entity)}
            onClick={() => onEditTask(task)}
          >
            {iconUi({ id: 'edit', sx: { color: c(entity).textAcc } })}
          </IconButton>
        </Box>

        {hasDescription ? (
          <Typography level="body-sm" >
            {task.description}
          </Typography>
        ) : (
          <Typography level="body-sm">
            אין הסבר למשימה
          </Typography>
        )}

        <Stack direction="row" sx={sx.chipsRow}>
          {isInProgress && statusMeta ? (
            <Chip
              size="sm"
              variant={isInProgress ? "solid" : 'outlined'}
              color={isInProgress ? "success" : 'neutral'}
              startDecorator={iconUi({
                id: statusMeta.idIcon,
                size: 'sm',
                sx: { color: statusMeta.color },
              })}
              sx={isInProgress ? sx.chipProgres : sx.chip}
            >
              סטטוס:
              <Typography level="body-xs" sx={sx.typoChip(isInProgress ? '#ffffff' : statusMeta.color)}>
                {statusMeta.label}
              </Typography>
            </Chip>
          ) : null}

          {isHighPriority && priorityMeta ? (
            <Chip
              size="sm"
              variant="outlined"
              startDecorator={iconUi({
                id: priorityMeta.idIcon,
                size: 'sm',
                sx: { color: priorityMeta.color },
              })}
              sx={sx.chip}
            >
              עדיפות:
              <Typography level="body-xs" sx={sx.typoChip(priorityMeta.color)}>
                {priorityMeta.label}
              </Typography>
            </Chip>
          ) : null}

          {isHighComplexity && complexityMeta ? (
            <Chip
              size="sm"
              variant="outlined"
              startDecorator={iconUi({
                id: complexityMeta.idIcon,
                size: 'sm',
                sx: { color: complexityMeta.color },
              })}
              sx={sx.chip}
            >
              מורכבות:
              <Typography level="body-xs" sx={sx.typoChip(complexityMeta.color)}>
                {complexityMeta.label}
              </Typography>
            </Chip>
          ) : null}

          <Box sx={{ flex: 1 }} />

          {hasUrl ? (
            <Link
              href={task.url}
              target="_blank"
              rel="noreferrer"
              overlay={false}
              startDecorator={iconUi({ id: 'link' })}
              sx={sx.linkButton}
            >
              עבור לאזור המסומן
            </Link>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  )
}
