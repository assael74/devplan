import * as React from 'react';
import { Input, FormControl, FormLabel, Typography } from '@mui/joy';

export default function PhoneField({
  value,
  onChange,
  label = 'מספר נייד',
  required = false,
  error = false,
  disabled = false,
  size = 'sm',
}) {

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const limited = raw.slice(0, 10);
    onChange(limited);
  };

  return (
    <FormControl error={error}>
      <FormLabel required={required}> {label} </FormLabel>
      <Input
        value={value}
        placeholder="טלפון"
        size={size}
        inputMode="numeric"
        variant="soft"
        onChange={handlePhoneChange}
      />
    </FormControl>
  );
}
