// features/playersDatabase/components/profilesPage/list/PlayerNoteTooltip.js

import React from 'react'
import { Box, Tooltip, Typography } from '@mui/joy'

import { clean } from '../logic/utils.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { noteTooltipSx as sx } from './sx/noteTooltip.sx.js'

export default function PlayerNoteTooltip({ player }) {
  const notes = clean(
    player?.comments ||
    player?.comment ||
    player?.notes ||
    player?.searchDoc?.comments ||
    player?.statsDoc?.comments ||
    player?.playerSeason?.comments
  )
  const hasNotes = Boolean(notes)

  if (!hasNotes) {
    return (
      <Box component="span" sx={[sx.noteIconWrap, sx.noteIconWrapDisabled]} aria-disabled="true">
        {iconUi({
          id: 'notes',
          size: 'sm',
          sx: {
            ...sx.noteIcon,
            ...sx.noteIconNeutral,
          },
        })}
      </Box>
    )
  }

  return (
    <Tooltip
      arrow
      placement="top"
      variant="outlined"
      title={(
        <Box sx={sx.tooltip}>
          <Typography level="title-sm" sx={sx.title}>
            הערות שחקן
          </Typography>

          <Typography level="body-xs" sx={sx.noteText}>
            {notes}
          </Typography>
        </Box>
      )}
    >
      <Box component="span" sx={[sx.noteIconWrap, sx.noteIconWrapHasNotes]}>
        {iconUi({
          id: 'notes',
          size: 'sm',
          sx: {
            ...sx.noteIcon,
            ...sx.noteIconHasNotes,
          },
        })}
      </Box>
    </Tooltip>
  )
}
