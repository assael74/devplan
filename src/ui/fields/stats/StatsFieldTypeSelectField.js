// ui/fields/stats/StatsFieldTypeSelectField.js

import React from 'react';
import {
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
} from '@mui/joy';
import { iconUi } from '../../core/icons/iconUi.js';
import { statsParmTypeFieldOptions } from '../../../shared/stats/stats.options.js';

export default function StatsFieldTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  readOnly = false,
  label = 'סוג שדה',
  size = 'sm',
}) {
  return (
    <FormControl
      error={error}
      required={required}
      disabled={disabled}
      sx={{ width: '100%' }}
    >
      <FormLabel required={required} sx={{ fontSize: 12 }}>
        {label}
      </FormLabel>

      <Select
        value={value}
        size={size}
        disabled={disabled || readOnly}
        onChange={(_, nextValue) => {
          if (typeof onChange !== 'function') return;
          onChange(nextValue);
        }}
        placeholder="סוג שדה"
        indicator="▼"
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%',
            },
          },
        }}
      >
        {statsParmTypeFieldOptions.map((option) => (
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
