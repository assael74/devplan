import React from 'react'
import { Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../../../../ui/core/icons/iconUi.js'
import { tableSx as sx } from '../sx/playerMeetingsTable.sx.js'

export default function PlayerMeetingsRow({ row, onEdit, onCreate }) {
  const noteTipText = row?.notes || 'לא נרשמו הערות'
  const noteIcon = row?.notes ? 'notes' : 'help'
  const videoTipText = row?.video ? 'יש וידאו' : 'לא מצורף וידאו - ניתן ליצור וידאו חדש'
  const colorStatus = row?.statusId === 'new' || row?.statusId === 'done' ? 'success' : 'neutral'
  const variantStatus = row?.statusId === 'new' ? 'solid' : 'soft'

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
        <Chip size="md" variant="soft" startDecorator={iconUi({ id: row?.typeIcon || 'meetings', size: 'sm' })}>
          {row?.typeLabel || '—'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Chip
          size="md"
          color={colorStatus}
          variant={variantStatus}
          startDecorator={iconUi({ id: row?.statusIcon || 'meetings', size: 'sm' })}
        >
          {row?.statusLabel || '—'}
        </Chip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title={videoTipText}>
          <IconButton color={row?.video ? 'success' : 'danger'} size="sm" variant="plain" onClick={() => onCreate(row)}>
            {iconUi({ id: 'addVideo', size: 'sm' })}
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title={noteTipText}>
          <Chip
            size="md"
            variant="plain"
            color={row?.notes ? 'success' : 'danger'}
            startDecorator={iconUi({ id: noteIcon, size: 'md' })}
          />
        </Tooltip>
      </Box>

      <Box sx={sx.centerCellSx}>
        <Tooltip title="עריכת מפגש">
          <IconButton size="sm" variant="soft" onClick={() => onEdit(row)}>
            {iconUi({ id: 'more', size: 'sm' })}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
