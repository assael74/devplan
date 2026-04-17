// playerProfile/mobile/modules/meetings/components/MeetingDetailsMobileHeader.js

import React from 'react'
import { Box, Button, Chip, IconButton, Stack, Typography } from '@mui/joy'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'

import { MEETING_TYPES, MEETING_STATUSES } from '../../../../../../../shared/meetings/meetings.constants.js'
import { getStatusId } from '../../../../../../../shared/meetings/meetings.status.js'

const getTypeLabel = (type) => {
  return MEETING_TYPES.find((t) => t.id === type)?.labelH || '—'
}

const getStatusLabel = (statusId) => {
  return MEETING_STATUSES.find((s) => s.id === statusId)?.labelH || '—'
}

export default function MeetingDetailsMobileHeader({
  sx,
  selected,
  isEditing,
  pending,
  isDirty,
  canSave,
  onBack,
  onStartEdit,
  onCancel,
  onSave,
}) {
  const statusId = getStatusId(selected?.status)
  const typeLabel = getTypeLabel(selected?.type)
  const statusLabel = getStatusLabel(statusId)

  return (
    <Box sx={sx.mobileHeader}>
      <Box sx={sx.mobileHeaderTop}>
        <IconButton size="sm" variant="soft" onClick={onBack}>
          <ArrowBackIosNewIcon />
        </IconButton>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography level="title-md" sx={sx.mobileHeaderTitle} noWrap>
            {selected?.title || typeLabel || 'פגישה'}
          </Typography>

          <Typography level="body-xs" sx={sx.mobileHeaderSubtitle} noWrap>
            {selected?.meetingDate || selected?.date || 'ללא תאריך'}
            {(selected?.meetingHour || selected?.time) ? ` · ${selected?.meetingHour || selected?.time}` : ''}
          </Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={0.75} sx={sx.mobileHeaderChips}>
        <Chip size="sm" variant="soft">
          {typeLabel}
        </Chip>

        <Chip size="sm" variant="soft">
          {statusLabel}
        </Chip>

        {isEditing ? (
          <Chip size="sm" variant={isDirty ? 'soft' : 'outlined'}>
            {isDirty ? 'שינויים ממתינים' : 'אין שינויים'}
          </Chip>
        ) : null}
      </Stack>

      <Box sx={sx.mobileHeaderActions}>
        {!isEditing ? (
          <Button
            size="sm"
            variant="soft"
            startDecorator={<EditIcon />}
            onClick={onStartEdit}
          >
            ערוך
          </Button>
        ) : (
          <>
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
          </>
        )}
      </Box>
    </Box>
  )
}
