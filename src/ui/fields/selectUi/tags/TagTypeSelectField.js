// ui/fields/selectUi/tags/TagTypeSelectField.js
import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Stack, Divider, Box } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { getEntityColors } from '../../../core/theme/Colors'
import { TAG_TYPE_OPTIONS } from '../../../../shared/tags/tags.constants.js'

export default function TagTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'בחירת סוג תג',
  size = 'sm'
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        value={value}
        size={size}
        disabled={disabled}
        onChange={(_, val) => onChange(val)}
        placeholder='בחר סוג תג'
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%'
            }
          }
        }}
        renderValue={(selected) => {
          const id = selected?.value || ''
          const opt = TAG_TYPE_OPTIONS.find((o) => o.id === id)
          if (!opt) return selected?.label || ''
          return (
            <Stack direction="row" gap={1} alignItems="center">
              <Box
                sx={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  bgcolor: opt.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 auto',
                }}
              >
                {iconUi({
                  id: opt.idIcon,
                  sx: { fontSize: 12, color: '#fff', '& *': { fill: 'currentColor' } },
                })}
              </Box>
              {opt.labelH}
            </Stack>
          )
        }}
      >
        {TAG_TYPE_OPTIONS.map((opt) => (
          <Option key={opt.id} value={opt.id}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: opt.idIcon, sx:{ color: opt.color } })}
              {opt.labelH}
            </Stack>
            <Divider />
          </Option>
        ))}
      </Select>
    </FormControl>
  );
}
