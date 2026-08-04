// ui/fields/games/GameViewTypeSelectField.js

import React from 'react';
import {
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
} from '@mui/joy';
import { iconUi } from '../../core/icons/iconUi.js';
import { statsViewTypeOptions } from '../../../shared/stats/stats.options.js';
import { gameSelectSlotProps } from './sx/gamesSelect.sx.js';

export default function GameViewTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  readOnly = false,
  label = '',
  size = 'sm',
}) {
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
        placeholder="בחר תצוגה"
        slotProps={gameSelectSlotProps}
      >
        {statsViewTypeOptions.map((option) => (
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
