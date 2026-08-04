// ui/forms/trainings/TrainingDayEditFields.js

import React from 'react'
import { Box } from '@mui/joy'

import HourInputField from '../../fields/core/HourInputField.js'
import DurationField from '../../fields/trainings/DurationField.js'
import TrainingLocationField from '../../fields/trainings/TrainingLocationField.js'
import TrainingStatusSelectField from '../../fields/trainings/TrainingStatusSelectField.js'
import TrainingTypeSelectField from '../../fields/trainings/TrainingTypeSelectField.js'

import { trainingDayEditFormSx as sx } from './sx/trainingDayEditForm.sx.js'

export default function TrainingDayEditFields({
  draft,
  layout,
  onDraft,
  readOnly = false,
}) {
  const setField = (field, value) => {
    onDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return (
    <Box sx={sx.root(layout)}>
      <Box sx={sx.grid(layout)}>
        <HourInputField
          value={draft.hour || ''}
          onChange={(value) => setField('hour', value || '')}
          readOnly={readOnly}
        />

        <DurationField
          value={draft.duration == null ? 0 : draft.duration}
          onChange={(value) => {
            setField('duration', value == null ? 0 : value)
          }}
          readOnly={readOnly}
        />
      </Box>

      <Box sx={sx.grid(layout)}>
        <TrainingTypeSelectField
          value={draft.type || ''}
          onChange={(value) => setField('type', value || '')}
          readOnly={readOnly}
        />

        <TrainingStatusSelectField
          value={draft.status || ''}
          onChange={(value) => setField('status', value || '')}
          readOnly={readOnly}
        />
      </Box>

      <TrainingLocationField
        value={draft.location || ''}
        placeholder="לדוגמה: מגרש סינטטי"
        onChange={(value) => setField('location', value || '')}
        readOnly={readOnly}
      />
    </Box>
  )
}
