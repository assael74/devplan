/// ui/fields/selectUi/meetings/MeetingTypeSelectField.js
import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { MEETING_TYPES } from '../../../../shared/meetings/meetings.constants.js';

export default function MeetingTypeSelect({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  readOnly = false,
  label = 'סוג פגישה',
  size = 'sm',
  slotProps = {},
}) {

  const baseListboxSx = { maxHeight: 240, width: '100%', zIndex: 2000 }

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        סוג פגישה
      </FormLabel>

      <Select
        value={value}
        size={size}
        readOnly={readOnly}
        onChange={(_, val) => onChange(val)}
        placeholder='בחר סוג פגישה'
        slotProps={{
          ...slotProps,
          listbox: {
            ...slotProps.listbox,
            sx: { ...baseListboxSx, ...(slotProps.listbox?.sx || {}) },
          },
        }}
      >
        {MEETING_TYPES.map((opt) => (
          <Option key={opt.id} value={opt.id} disabled={opt.disabled}>
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
