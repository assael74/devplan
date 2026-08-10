// src/features/playersDatabase/ui/components/modals/paste/StatusCell.js

import * as React from 'react'
import {
  Box,
  Tooltip,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { statusCellSx as sx } from './sx/statusCell.sx.js'

export default function StatusCell({ valid, message }) {
  const content = (
    <Box sx={sx.statusCell}>
      {iconUi({id: valid ? 'completed' : 'warning', size: 'sm', sx: valid ? sx.statusIconValid : sx.statusIconInvalid})}
    </Box>
  )

  if (!message) return content

  return (
    <Tooltip
      title={message}
      arrow
    >
      {content}
    </Tooltip>
  )
}
