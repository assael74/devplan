// ui/fields/trainings/TrainingLocationField.js
import * as React from 'react';
import { iconUi } from '../../core/icons/iconUi.js';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import Input from '@mui/joy/Input';

export default function TrainingLocationField({
  required,
  error,
  value,
  onChange,
  disabled,
  helperText,
  readOnly,
  label = 'מיקום',
  placeholder,
  size = 'sm',
  sx,
  slotProps = {},
}) {
  return (
    <FormControl error={error} required={required} disabled={disabled} sx={sx}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>{label}</FormLabel>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        endDecorator={iconUi({id: 'addLocation'})}
        error={error}
        readOnly={readOnly}
        disabled={disabled}
        size={size}
        slotProps={slotProps}
      />
      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  );
}
