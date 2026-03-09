import * as React from 'react';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js'
import { FormControl, FormLabel, Input, Typography } from '@mui/joy';

export default function GenericInputField({
  id,
  label,
  value,
  onChange,
  readOnly,
  type = 'text',
  required = false,
  disabled = false,
  placeholder = '',
  onClick = () => {},
  iconId = '',
  variant = 'soft',
  size = 'sm'
}) {
  return (
    <FormControl sx={{ width: '100%' }}>
      {label && (
        <Typography sx={{ fontSize: '12px', lineHeight: 1.4, mb: 0.6, fontWeight: 500, textAlign: 'right', alignSelf: 'flex-end' }}>
          {label} {required && '*'}
        </Typography>
      )}
      <Input
        type={type}
        value={value ?? ''}
        startDecorator={iconUi({ id: iconId })}
        onChange={(e) => onChange(e.target.value)}
        onClick={onClick}
        placeholder={placeholder || label}
        required={required}
        autoComplete="off"
        disabled={disabled}
        variant={variant}
        size={size}
        readOnly={readOnly}
        sx={{
          direction: 'rtl',
          textAlign: 'right',
          '& input': {
            direction: 'rtl',
            textAlign: 'right',
          },
          '&:hover': { backgroundColor: '#eef4ff' },
        }}
      />
    </FormControl>
  );
}
