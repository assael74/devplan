// ui/fields/selectUi/trainings/TrainingsTypeSelectField.js

import * as React from 'react'
import { FormControl, FormLabel, Select, Option, Stack } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { TRAINING_STATUS_META } from '../../../../shared/trainings/trainingsWeek.model.js'
import TrainingSelectValue from './ui/TrainingSelectValue.js'


const STATUS_OPTIONS = Object.entries(TRAINING_STATUS_META).map(([id, meta]) => ({
  id,
  ...meta,
}))

export default function TrainingsStatusSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  readOnly = false,
  label = 'סטטוס אימון',
  size = 'sm',
  slotProps = {},
}) {
  const renderValue = (selected) => {
    const val = selected?.value || ''
    const opt = STATUS_OPTIONS.find((item) => item.id === val) || null

    return (
      <TrainingSelectValue
        opt={opt}
        placeholder="בחר סטטוס"
      />
    )
  }

  return (
    <FormControl error={error}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        value={value || null}
        size={size}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(_, val) => onChange(val || '')}
        placeholder="בחר סטטוס"
        renderValue={renderValue}
        slotProps={slotProps}
      >
        {STATUS_OPTIONS.map((opt) => (
          <Option key={opt.id} value={opt.id} disabled={opt.disabled}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: opt.idIcon })}
              {opt.labelH}
            </Stack>
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
