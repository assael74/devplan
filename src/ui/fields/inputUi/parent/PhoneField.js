// ui/fields/inputUi/parent/PhoneField.js

import * as React from 'react';
import { Input, FormControl, FormLabel, Typography } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { formatPhoneNumber } from '../../../../shared/format/contactUtiles.js'

export default function PhoneField({
  value,
  onChange,
  label = 'מספר נייד',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
  variant = 'outlined',
}) {

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, 10);
    onChange(limited);
  };

  return (
    <FormControl error={error}>
      <FormLabel sx={{ fontSize: '12px', fontWeight: 'md' }} required={required}> {label} </FormLabel>
      <Input
        value={formatPhoneNumber(value)}
        placeholder="טלפון"
        size={size}
        inputMode="numeric"
        variant={variant}
        startDecorator={iconUi({id: 'phone'})}
        onChange={handlePhoneChange}
      />
    </FormControl>
  );
}
