import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Stack } from '@mui/joy';
import { iconUi } from '../../../b_styleObjects/icons/IconIndex.js';
import { STAFF_ROLE_OPTIONS } from '../../../x_utils/optionLists.js';

export default function RoleTypeSelect({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'תפקיד',
  size = 'sm'
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        תפקיד איש הצוות
      </FormLabel>

      <Select
        value={value}
        size={size}
        onChange={(_, val) => onChange(val)}
        placeholder='בחר תפקיד איש מקצוע'
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%'
            }
          }
        }}
      >
        {STAFF_ROLE_OPTIONS.map((opt) => (
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
