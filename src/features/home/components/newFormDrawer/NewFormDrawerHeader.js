// features/home/components/newFormDrawer/NewFormDrawerHeader.js

import React from 'react'
import { Box, Typography, DialogTitle, ModalClose, Chip } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import {
  getTaskStatusMeta,
  getTaskTypeMeta,
  getTaskWorkspaceMeta,
} from '../../../../shared/tasks/tasks.constants.js'

import { newDrawerSx as sx } from './sx/newFormDrawer.sx.js'

export default function NewFormDrawerHeader({ draft }) {
  const workspaceMeta = getTaskWorkspaceMeta(draft?.workspace)
  const statusMeta = getTaskStatusMeta(draft?.status)
  const taskTypeMeta = getTaskTypeMeta(draft?.workspace, draft?.taskType)

  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.heroSx}>
        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.2 }}>
          <Typography
            level="title-md"
            sx={sx.heroNameSx}
            startDecorator={
              taskTypeMeta?.idIcon
                ? iconUi({ id: taskTypeMeta.idIcon })
                : iconUi({ id: 'addTask' })
            }
          >
            משימה חדשה
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              level="body-xs"
              sx={sx.heroMetaSx}
              startDecorator={iconUi({ id: workspaceMeta?.idIcon || 'tasks' })}
            >
              {workspaceMeta?.label || 'אזור עבודה'} · {taskTypeMeta?.label || 'כללי'}
            </Typography>

            {statusMeta ? (
              <Chip
                size="sm"
                variant="soft"
                startDecorator={
                  statusMeta?.idIcon ? iconUi({ id: statusMeta.idIcon, size: 'sm' }) : null
                }
                sx={sx.headerChipSx(statusMeta.color)}
              >
                {statusMeta.label}
              </Chip>
            ) : null}
          </Box>
        </Box>
      </Box>

      <ModalClose />
    </DialogTitle>
  )
}
