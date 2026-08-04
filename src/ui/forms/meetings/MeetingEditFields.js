// ui/forms/meetings/MeetingEditFields.js

import React from 'react'
import { Box, Divider, Sheet } from '@mui/joy'

import DateInputField from '../../fields/core/DateInputField.js'
import HourInputField from '../../fields/core/HourInputField.js'
import MeetingStatusField from '../../fields/meetings/MeetingStatusField.js'
import MeetingStatusSelector from '../../fields/meetings/MeetingStatusSelector.js'
import MeetingTypeSelectField from '../../fields/meetings/MeetingTypeSelectField.js'
import VideoLinkField from '../../fields/videos/VideoLinkField.js'

import { editSx as sx } from './sx/edit.sx.js'

const getStatusId = (draft) => {
  return draft && draft.status && draft.status.current
    ? draft.status.current.id || ''
    : ''
}

const updateStatus = (draft, statusId) => {
  const status = draft && draft.status
    ? draft.status
    : { current: { id: '', time: 0 }, history: [] }

  const current = status.current
    ? status.current
    : { id: '', time: 0 }

  return {
    ...draft,
    status: {
      ...status,
      current: {
        ...current,
        id: statusId || '',
      },
    },
  }
}

export default function MeetingEditFields({
  draft,
  layout,
  onDraft,
  readOnly = false,
}) {
  const statusId = getStatusId(draft)
  const videoValue = draft.videoId || draft.videoLink || ''

  const setField = (field, value) => {
    onDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const setStatus = (value) => {
    const nextId = layout.statusMode === 'steps'
      ? value && value.id
      : value

    onDraft((current) => updateStatus(current, nextId))
  }

  return (
    <Sheet sx={sx.panel(layout)} variant="outlined">
      <Box sx={sx.grid(layout)}>
        <Box sx={sx.field}>
          <DateInputField
            label="תאריך הפגישה"
            disabled={readOnly}
            value={draft.meetingDate || ''}
            onChange={(value) => setField('meetingDate', value)}
            size="sm"
          />
        </Box>

        <Box sx={sx.field}>
          <HourInputField
            label="שעת הפגישה"
            disabled={readOnly}
            value={draft.meetingHour || ''}
            onChange={(value) => setField('meetingHour', value)}
            size="sm"
          />
        </Box>

        <Box sx={sx.field}>
          <MeetingTypeSelectField
            value={draft.type || ''}
            disabled={readOnly}
            onChange={(value) => setField('type', value || '')}
            size="sm"
          />
        </Box>

        {layout.showDivider ? (
          <Divider orientation="vertical" sx={sx.divider} />
        ) : null}

        <Box sx={sx.field}>
          {layout.statusMode === 'steps' ? (
            <MeetingStatusSelector
              value={{ id: statusId }}
              disabled={readOnly}
              onChange={setStatus}
              size="sm"
            />
          ) : (
            <MeetingStatusField
              value={statusId}
              disabled={readOnly}
              onChange={setStatus}
              size="sm"
            />
          )}
        </Box>
      </Box>

      <Box sx={sx.video}>
        <VideoLinkField
          label="קישור לוידאו"
          disabled={readOnly}
          value={videoValue}
          onChange={(value) => {
            const nextValue = value || ''

            onDraft((current) => ({
              ...current,
              videoId: nextValue,
              videoLink: nextValue,
            }))
          }}
          size="sm"
        />
      </Box>
    </Sheet>
  )
}
