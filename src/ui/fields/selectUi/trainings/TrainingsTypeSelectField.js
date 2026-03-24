// ui/fields/selectUi/trainings/TrainingsTypeSelectField.js

import * as React from 'react'
import { FormControl, FormLabel, Select, Option, Stack } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { TRAINING_TYPES } from '../../../../shared/trainings/trainingsWeek.model.js'
import TrainingSelectValue from './ui/TrainingSelectValue.js'

export default function TrainingsTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  readOnly = false,
  label = 'סוג אימון',
  size = 'sm',
  slotProps = {},
}) {
  const renderValue = (selected) => {
    const val = selected?.value || ''
    const opt = TRAINING_TYPES.find((item) => item.id === val) || null

    return (
      <TrainingSelectValue
        opt={opt}
        placeholder="בחר סוג אימון"
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
        placeholder="בחר סוג אימון"
        renderValue={renderValue}
        slotProps={slotProps}
      >
        {TRAINING_TYPES.map((opt) => (
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
