// features/home/components/TaskRowCard.js

import React from 'react'
import { Card, Chip, IconButton, Link, Stack, Typography, Box, Tooltip } from '@mui/joy'

import { homeSx as sx } from '../sx/home.sx.js'
import { iconUi } from '../../../ui/core/icons/iconUi.js'

import {
  TASK_STATUS,
  getTaskStatusMeta,
  getTaskPriorityMeta,
  getTaskTypeMeta,
  getTaskComplexityMeta,
} from '../../../shared/tasks/tasks.constants.js'

import { getEntityColors } from '../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export default function TaskRowCard({ task, id, onEditTask }) {
  const taskTypeMeta = getTaskTypeMeta(task?.workspace, task?.taskType)
  const statusMeta = getTaskStatusMeta(task?.status)
  const priorityMeta = getTaskPriorityMeta(task?.priority)
  const complexityMeta = getTaskComplexityMeta(task?.complexity)

  const hasUrl = Boolean(task?.url)
  const hasDescription = Boolean(task?.description?.trim())
  const isInProgress = task?.status === TASK_STATUS.IN_PROGRESS

  return (
    <Card
      variant="soft"
      sx={[
        sx.card(id),
        isInProgress ? sx.cardInProgress(id) : null,
      ]}
    >
      <Stack sx={sx.cardContent} spacing={hasDescription ? 0.9 : 0.7}>
        <Box sx={sx.titleRow}>
          <Box sx={{ flex: 1, minWidth: 0, gap: 0.5 }}>
            <Typography
              level="title-sm"
              sx={{ lineHeight: 1.3 }}
              startDecorator={
                taskTypeMeta?.idIcon ? iconUi({ id: taskTypeMeta.idIcon }) : null
              }
            >
              {task?.title || 'ללא כותרת'}
            </Typography>
          </Box>

          <IconButton
            size="sm"
            color="neutral"
            sx={sx.icoEdit(id)}
            onClick={() => onEditTask(task)}
          >
            {iconUi({ id: 'edit', sx: { color: c(id).textAcc } })}
          </IconButton>
        </Box>

        {hasDescription ? (
          <Tooltip
            variant="soft"
            arrow
            title={
              <Typography
                level="body-sm"
                sx={{ whiteSpace: 'pre-wrap', maxWidth: 320, lineHeight: 1.5 }}
              >
                {task.description}
              </Typography>
            }
          >
            <Typography level="body-sm" sx={sx.descriptionClamp}>
              {task.description}
            </Typography>
          </Tooltip>
        ) : null}

        <Stack direction="row" sx={sx.chipsRow}>
          {statusMeta ? (
            <Chip
              size="sm"
              variant="outlined"
              startDecorator={iconUi({
                id: statusMeta.idIcon,
                size: 'sm',
                sx: { color: statusMeta.color },
              })}
              sx={sx.chip}
            >
              סטטוס:
              <Typography level="body-xs" sx={sx.typoChip(statusMeta.color)}>
                {statusMeta.label}
              </Typography>
            </Chip>
          ) : null}

          {priorityMeta ? (
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

          {complexityMeta ? (
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
