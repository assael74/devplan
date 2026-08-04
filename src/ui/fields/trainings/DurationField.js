// ui/fields/trainings/DurationField.js
import * as React from 'react';
import { FormControl, FormHelperText, FormLabel, Input } from '@mui/joy';
import { iconUi } from '../../core/icons/iconUi.js';

export default function DurationField({
  value,
  onChange,
  label = 'זמן',
  required = false,
  error = false,
  disabled = false,
  readOnly = false,
  helperText,
  placeholder = 'זמן אימון',
  size = 'sm',
  sx,
  slotProps = {},
}) {
  return (
    <FormControl error={error} required={required} disabled={disabled} sx={sx}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}> {label} </FormLabel>
      <Input
        value={value}
        type="number"
        size={size}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        startDecorator={iconUi({id: 'duration'})}
        min={0}
        step={1}
        disabled={disabled}
        readOnly={readOnly}
        slotProps={slotProps}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
