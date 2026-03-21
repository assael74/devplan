// src/features/calendar/components/drawer/EventHeaderDrawer.js

import React from 'react'
import { Box, Typography, DialogTitle, Chip, IconButton } from '@mui/joy'
import CloseRounded from '@mui/icons-material/CloseRounded'

import { CALENDAR_EVENT_TYPES } from '../../logic/calendarHub.constants.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { drawerSx as sx } from './sx/drawer.sx.js'

export default function EventHeaderDrawer({
  draft,
  mode = 'create',
  onClose,
}) {
  const meta = CALENDAR_EVENT_TYPES[draft?.type] || { label: 'אירוע', idIcon: 'calendar' }
  const title = mode === 'create' ? 'יצירת אירוע' : 'עריכת אירוע'

  return (
    <DialogTitle sx={sx.headerSx}>
      <Box sx={sx.headerMainSx}>
        <Box sx={sx.headerTitleWrapSx}>
          <Box sx={sx.headerIconSx}>
            {iconUi({ id: meta.idIcon || 'calendar' })}
          </Box>

          <Box>
            <Typography level="title-md">{title}</Typography>

            <Box sx={sx.headerMetaRowSx}>
              <Chip size="sm" variant="soft">
                {meta.label}
              </Chip>

              {draft?.date ? (
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {draft.date}
                  {draft?.time ? ` · ${draft.time}` : ''}
                </Typography>
              ) : null}
            </Box>
          </Box>
        </Box>

        <IconButton size="sm" variant="soft" onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </Box>
    </DialogTitle>
  )
}
