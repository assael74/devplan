import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerPaymentsTable.sx.js'

export default function PlayerPaymentsRow({ row, onEdit, onCreate }) {
  return (
    <Box sx={sx.rowCardSx}>
      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          1
        </Typography>

      </Box>

      <Box sx={sx.mainCellSx}>
        2
      </Box>

      <Box sx={sx.centerCellSx}>
        3
      </Box>

      <Box sx={sx.centerCellSx}>
      4
      </Box>

      <Box sx={sx.centerCellSx}>
      5
      </Box>

      <Box sx={sx.centerCellSx}>
        6
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת תשלום">
          <IconButton size="sm" variant="soft" onClick={() => onEdit(row)}>
            {iconUi({ id: 'more', size: 'sm' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
