// playerProfile/mobile/modules/meetings/components/meetingForm/MeetingHeader.js

import React from 'react'
import { Box, Chip, IconButton, Stack, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import { MEETING_TYPES, MEETING_STATUSES } from '../../../../../../../../shared/meetings/meetings.constants.js'
import { getStatusId } from '../../../../../../../../shared/meetings/meetings.status.js'

import { formSx } from '../sx/form.sx.js'

const getType = (type) => MEETING_TYPES.find((t) => t.id === type) || null
const getStatus = (statusId) => MEETING_STATUSES.find((s) => s.id === statusId) || null

export default function MeetingHeader({
  selected,
  isEditing,
  pending,
  isDirty,
  canSave,
  onBack,
  onStartEdit,
  onCancel,
  onReset,
  onSave,
}) {
  const statusId = getStatusId(selected.status)
  const typeItem = getType(selected.type)
  const statusItem = getStatus(statusId)

  const isCanceled = statusItem?.id === 'canceled'

  return (
    <Box sx={formSx.header}>
      <Box sx={formSx.headerBox}>
        <Typography level="title-md" sx={{ fontWeight: 700 }} noWrap>
          {`פגישה ${selected?.title || typeItem?.labelH || 'מפגש'}`}
        </Typography>

        <Box sx={formSx.metaRow}>
          <Chip size="sm" variant="soft">
            {selected?.meetingDate || selected?.date || 'ללא תאריך'}
            {(selected?.meetingHour || selected?.time) ? ` · ${selected?.meetingHour || selected?.time}` : ''}
          </Chip>

          {typeItem ? (
            <Chip
              size="sm"
              variant="soft"
              startDecorator={iconUi({ id: typeItem.idIcon, size: 'sm' })}
            >
              {typeItem.labelH}
            </Chip>
          ) : null}

          {statusItem ? (
            <Chip
              size="sm"
              variant="soft"
              color={isCanceled ? 'danger' : statusItem.id === 'done' ? 'success' : 'primary'}
              startDecorator={iconUi({
                id: statusItem.idIcon,
                size: 'sm',
                color: isCanceled ? 'danger' : statusItem.id === 'done' ? 'success' : 'primary',
              })}
            >
              {statusItem.labelH}
            </Chip>
          ) : null}
        </Box>
      </Box>

      <Stack direction="row" spacing={0.75} sx={{ flex: '0 0 auto', flexWrap: 'wrap', alignItems: 'center' }}>
        {!isEditing ? (
          <>
            <IconButton size="sm" variant="soft" onClick={onBack}>
              {iconUi({ id: 'back', size: 'sm' })}
            </IconButton>

            <IconButton size="sm" variant="soft" onClick={onStartEdit}>
              {iconUi({ id: 'edit', size: 'sm' })}
            </IconButton>
          </>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
              <IconButton
                size="sm"
                variant="solid"
                loading={pending}
                disabled={!canSave}
                onClick={onSave}
              >
                {iconUi({ id: 'save', size: 'sm' })}
              </IconButton>

              <IconButton
                size="sm"
                variant="soft"
                disabled={pending}
                onClick={onReset}
              >
                {iconUi({ id: 'reset', size: 'sm' })}
              </IconButton>

              <IconButton
                size="sm"
                variant="soft"
                disabled={pending}
                onClick={onCancel}
              >
                {iconUi({ id: 'clear', size: 'sm' })}
              </IconButton>
            </Box>

            <Chip size="sm" variant={isDirty ? 'soft' : 'outlined'}>
              {isDirty ? 'שינויים ממתינים' : 'אין שינויים'}
            </Chip>
          </Box>
        )}
      </Stack>
    </Box>
  )
}
