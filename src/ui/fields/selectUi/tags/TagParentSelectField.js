// ui/fields/selectUi/tags/TagParentSelectField.js
import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';

export default function TagParentSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  options = [],
  size = 'sm'
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        בחירת סוג התג
      </FormLabel>

      <Select
        value={value}
        size={size}
        disabled={disabled}
        onChange={(_, val) => onChange(val)}
        placeholder='בחר תג הורה'
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%'
            }
          }
        }}
      >
        {options.map((opt) => (
          <Option key={opt.id} value={opt.id}>
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
