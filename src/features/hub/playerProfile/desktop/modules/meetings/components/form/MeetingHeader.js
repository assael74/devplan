// playerProfile/desktop/modules/meetings/components/form/MeetingHeader.js

import React from 'react'
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/joy'

import { MEETING_TYPES, MEETING_STATUSES } from '../../../../../../../../shared/meetings/meetings.constants.js'
import { getStatusId } from '../../../../../../../../shared/meetings/meetings.status.js'
import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { formSx as sx } from '../sx/form.sx'

const c = getEntityColors('players')

const getTypeLabel = (type) => MEETING_TYPES.find((item) => item.id === type)?.labelH || '—'
const getStatusLabel = (statusId) => MEETING_STATUSES.find((item) => item.id === statusId)?.labelH || '—'

export default function MeetingHeader({
  selected,
  isEditing,
  pending,
  isDirty,
  canSave,
  onStartEdit,
  onCancel,
  onReset,
  onSave,
}) {
  const statusId = getStatusId(selected.status)
  const typeLabel = getTypeLabel(selected.type)
  const statusLabel = getStatusLabel(statusId)

  return (
    <Box sx={sx.header}>
      <Box sx={sx.boxHead}>
        <Typography level="title-md" sx={sx.title} noWrap>
          {`פגישה ${selected?.title || typeLabel || 'מפגש'}`}
        </Typography>

        <Box sx={sx.metaRow}>
          <Chip size="sm" variant="soft">
            {selected?.meetingDate || selected?.date || 'ללא תאריך'}
            {(selected?.meetingHour || selected?.time) ? ` · ${selected?.meetingHour || selected?.time}` : ''}
          </Chip>
        </Box>
      </Box>

      <Stack direction="row" spacing={0.75} sx={{ flex: '0 0 auto', flexWrap: 'wrap', alignItems: 'center' }}>
        {!isEditing ? (
          <Tooltip title="ערוך מפגש">
            <IconButton size="sm" variant="soft" onClick={onStartEdit} sx={{ bgcolor: c.bg, color: c.text }}>
              {iconUi({ id: 'edit' })}
            </IconButton>
          </Tooltip>
        ) : (
          <Stack direction="row" spacing={0.5}>
            <Button
              size="sm"
              variant="solid"
              startDecorator={iconUi({ id: 'save', size: 'sm' })}
              loading={pending}
              disabled={!canSave}
              onClick={onSave}
              sx={{ bgcolor: c.bg, color: c.text }}
            >
              שמור
            </Button>

            <Button
              size="sm"
              variant="solid"
              color='neutral'
              startDecorator={iconUi({ id: 'reset', size: 'sm' })}
              loading={pending}
              disabled={!canSave}
              onClick={onReset}
            >
              איפוס
            </Button>

            <Button
              size="sm"
              variant="soft"
              startDecorator={iconUi({ id: 'close', size: 'sm' })}
              disabled={pending}
              onClick={onCancel}
            >
              ביטול
            </Button>

            <Chip size="sm" variant={isDirty ? 'soft' : 'outlined'}>
              {isDirty ? 'שינויים ממתינים' : 'אין שינויים'}
            </Chip>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
