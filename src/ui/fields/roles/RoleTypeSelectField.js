// ui/fields/roles/RoleTypeSelectField.js

import * as React from 'react'
import {
  FormControl,
  FormHelperText,
  FormLabel,
  Option,
  Select,
  Stack,
} from '@mui/joy'

import { iconUi } from '../../core/icons/iconUi.js'
import { STAFF_ROLE_OPTIONS } from '../../../shared/roles/roles.constants.js'

export default function RoleTypeSelectField({
  value,
  onChange,
  error = false,
  helperText = '',
  disabled = false,
  readOnly = false,
  required = false,
  label = 'תפקיד איש הצוות',
  placeholder = 'בחר תפקיד איש מקצוע',
  size = 'sm',
  sx,
  slotProps,
}) {
  const handleChange = (_, nextValue) => {
    if (readOnly || typeof onChange !== 'function') return
    onChange(nextValue)
  }

  return (
    <FormControl
      error={Boolean(error)}
      required={required}
      disabled={disabled}
      sx={{ width: '100%', ...sx }}
    >
      {label ? (
        <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>
      ) : null}

      <Select
        value={value || null}
        size={size}
        disabled={disabled || readOnly}
        onChange={handleChange}
        placeholder={placeholder}
        slotProps={{
          ...slotProps,
          listbox: {
            sx: {
              maxHeight: 240,
              width: '100%',
              ...slotProps?.listbox?.sx,
            },
            ...slotProps?.listbox,
          },
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

      {helperText ? <FormHelperText>{helperText}</FormHelperText> : null}
    </FormControl>
  )
}
