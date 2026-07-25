// features/playersDatabase/ui/components/modals/dataImport/DataImportStatusCell.js

import * as React from 'react'
import { Box, Tooltip } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { dataImportSx as sx } from '../sx/dataImport.sx.js'

export default function DataImportStatusCell({ valid, message }) {
  const content = (
    <Box sx={sx.statusCell}>
      {iconUi({
        id: valid ? 'completed' : 'warning',
        size: 'sm',
        sx: valid ? sx.statusIconValid : sx.statusIconInvalid,
      })}
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
