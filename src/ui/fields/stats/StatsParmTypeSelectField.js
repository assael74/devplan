// ui/fields/stats/StatsParmTypeSelectField.js

import React from 'react';
import {
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
} from '@mui/joy';
import { iconUi } from '../../core/icons/iconUi.js';
import { statsParmOptions } from '../../../shared/stats/stats.options.js';

export default function StatsParmTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  readOnly = false,
  label,
  size = 'sm',
}) {
  const fontSize = size === 'sm'
    ? '0.775rem'
    : '0.975rem';

  return (
    <FormControl
      error={error}
      required={required}
      disabled={disabled}
      sx={{ width: '100%' }}
    >
      {label ? (
        <FormLabel required={required} sx={{ fontSize: 12 }}>
          {label}
        </FormLabel>
      ) : null}

      <Select
        value={value}
        size={size}
        disabled={disabled || readOnly}
        onChange={(_, nextValue) => {
          if (typeof onChange !== 'function') return;
          onChange(nextValue);
        }}
        placeholder="סוג פרמטר"
        indicator="▼"
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%',
            },
          },
          button: {
            sx: {
              fontSize,
              fontWeight: 500,
              color: '#333',
            },
          },
        }}
      >
        {statsParmOptions.map((option) => (
          <Option key={option.id} value={option.id}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: option.idIcon })}
              {option.labelH}
            </Stack>
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
