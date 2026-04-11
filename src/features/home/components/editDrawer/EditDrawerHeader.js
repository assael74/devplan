// features/home/components/editDrawer/EditDrawerHeader.js

import React from 'react'
import { Box, Typography, DialogTitle, ModalClose, Chip } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import {
  getTaskStatusMeta,
  getTaskTypeMeta,
} from '../../../../shared/tasks/tasks.constants.js'

import { drawerSx as sx } from './sx/editDrawer.sx.js'

export default function EditDrawerHeader({ task }) {
  const statusMeta = getTaskStatusMeta(task?.status)
  const taskTypeMeta = getTaskTypeMeta(task?.workspace, task?.taskType)

  return (
    <DialogTitle sx={sx.headerRowSx}>
      <Box sx={sx.heroSx}>
        <Box sx={{ minWidth: 0, display: 'grid', gap: 0.2 }}>
          <Typography
            level="title-md"
            sx={sx.heroNameSx}
            startDecorator={
              taskTypeMeta?.idIcon ? iconUi({ id: taskTypeMeta.idIcon }) : iconUi({ id: 'task' })
            }
          >
            {task?.title || 'עריכת משימה'}
          </Typography>

          <Box sx={{ display: 'flex' , alignItems: 'center', gap: 1 }}>
            <Typography
              level="body-xs"
              sx={sx.heroMetaSx}
              startDecorator={iconUi({ id: 'tasks' })}
            >
              {taskTypeMeta?.label || 'משימה'} {task?.workspace ? `· ${task.workspace}` : ''}
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
