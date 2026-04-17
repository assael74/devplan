import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerPaymentsTable.sx.js'

export default function PlayerPaymentsRow({ row, onEdit, onCreate }) {
  return (
    <Box sx={sx.rowCardSx}>
      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.paymentFor}
        </Typography>
      </Box>

      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.onlyPriceLable}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography
          level="body-sm"
          sx={sx.mainValueSx}
          startDecorator={iconUi({id: row?.type.idIcon})}
        >
          {row?.type.labelH}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip
          size="md"
          color={row?.status.color}
          variant='solid'
          startDecorator={iconUi({id: row?.status.idIcon})}
        >
          {row?.status.labelH || '—'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography
          level="body-sm"
          sx={sx.subValueSx}
        >
          {row?.statusTime}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Typography
          level="body-sm"
          sx={sx.subValueSx}
        >
          {row?.priceVatLable}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת תשלום">
          <IconButton size="md" variant="soft" onClick={() => onEdit(row)}>
            {iconUi({ id: 'more' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
