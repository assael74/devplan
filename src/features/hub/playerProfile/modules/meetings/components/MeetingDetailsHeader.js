import React from 'react'
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/joy'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'

import { MEETING_TYPES, MEETING_STATUSES } from '../../../../../../shared/meetings/meetings.constants.js'
import { getStatusId } from '../../../../../../shared/meetings/meetings.status.js'

const getTypeLabel = (type) => MEETING_TYPES.find((t) => t.id === type)?.labelH || '—'
const getStatusLabel = (statusId) => MEETING_STATUSES.find((s) => s.id === statusId)?.labelH || '—'

export default function MeetingDetailsHeader({
  sx,
  selected,
  isEditing,
  pending,
  isDirty,
  canSave,
  onStartEdit,
  onCancel,
  onSave,
}) {
  const statusId = getStatusId(selected.status)
  const typeLabel = getTypeLabel(selected.type)
  const statusLabel = getStatusLabel(statusId)

  return (
    <Box sx={sx.header}>
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
        <Chip size="sm" variant="soft">{typeLabel}</Chip>
        <Chip size="sm" variant="soft">{statusLabel}</Chip>

        {!isEditing ? (
          <Tooltip title="ערוך מפגש">
            <IconButton size="sm" variant="soft" onClick={onStartEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Stack direction="row" spacing={0.5}>
            <Button
              size="sm"
              variant="solid"
              startDecorator={<SaveIcon />}
              loading={pending}
              disabled={!canSave}
              onClick={onSave}
            >
              שמור
            </Button>

            <Button
              size="sm"
              variant="soft"
              startDecorator={<CloseIcon />}
              disabled={pending}
              onClick={onCancel}
            >
              ביטול
            </Button>

            {/* חיווי dirty קטן כדי להבין “יש מה לשמור” */}
            <Chip size="sm" variant={isDirty ? 'soft' : 'outlined'}>
              {isDirty ? 'שינויים ממתינים' : 'אין שינויים'}
            </Chip>
          </Stack>
        )}
      </Stack>
    </Box>
  )
}
