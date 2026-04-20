// ui/fields/selectUi/parent/ParentRoleSelectField.js

import * as React from 'react'
import { FormControl, FormLabel, Select, Option, Stack } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'

export default function ParentRoleSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  label = 'תפקיד ההורה',
  options = ['אבא', 'אמא'],
  size = 'sm',
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        value={value || null}
        size={size}
        disabled={disabled}
        onChange={(_, val) => onChange(val || '')}
        startDecorator={iconUi({ id: 'playerParents' })}
        placeholder="תפקיד"
        slotProps={{
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%',
            },
          },
        }}
      >
        {options.map((opt) => (
          <Option key={opt} value={opt}>
            <Stack direction="row" gap={1} alignItems="center">
              {opt}
            </Stack>
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
