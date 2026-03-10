import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerMeetingsTable.sx.js'

export default function PlayerMeetingsRow({ row, onEdit }) {
  return (
    <Box sx={sx.rowCardSx}>
      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.dateLabel || '—'}
        </Typography>
        {!!row?.hourRaw && <Typography sx={sx.subValueSx}>{row.hourRaw}</Typography>}
      </Box>

      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.meetingFor || '—'}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: row?.typeIcon || 'meetings', size: 'sm' })}>
          {row?.typeLabel || '—'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip size="sm" variant="soft" startDecorator={iconUi({ id: row?.statusIcon || 'meetings', size: 'sm' })}>
          {row?.statusLabel || '—'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        {iconUi({ id: 'video', size: 'sm' })}
      </Box>

      <Box sx={sx.mainCellSx}>
        <Typography level="body-sm" sx={sx.mainValueSx}>
          {row?.notes || '—'}
        </Typography>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת מפגש">
          <IconButton size="sm" variant="soft" onClick={onEdit}>
            {iconUi({ id: 'moreVertical', size: 'sm' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
