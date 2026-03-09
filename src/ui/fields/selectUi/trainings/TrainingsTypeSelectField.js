/// C:\projects\devplan\src\ui\fields\selectUi\trainings\TrainingsTypeSelectField.js
import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { TRAINING_TYPES } from '../../../../shared/trainings/trainingsWeek.model.js';

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

  return (
    <FormControl>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        סוג אימון
      </FormLabel>

      <Select
        value={value}
        size={size}
        readOnly={readOnly}
        disabled={disabled}
        onChange={(_, val) => onChange(val)}
        placeholder='בחר סוג אימון'
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
  );
}
