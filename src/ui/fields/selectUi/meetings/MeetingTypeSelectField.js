/// ui/fields/selectUi/meetings/MeetingTypeSelectField.js

import * as React from 'react'
import { Box, FormControl, FormLabel, Option, Select, Typography } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { MEETING_TYPES } from '../../../../shared/meetings/meetings.constants.js'

function findType(value) {
  return MEETING_TYPES.find((item) => item.id === value) || null
}

function renderTypeOption(opt) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      {iconUi({ id: opt.idIcon, size: 'sm' })}
      <Typography level="body-sm">{opt.labelH}</Typography>
    </Box>
  )
}

function renderTypeValue(value, placeholder) {
  const selected = findType(value)
  if (!selected) return placeholder

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
      {iconUi({ id: selected.idIcon, size: 'sm' })}
      <Typography level="body-sm" noWrap>
        {selected.labelH}
      </Typography>
    </Box>
  )
}

export default function MeetingTypeSelectField({
  value = '',
  onChange,
  error = false,
  disabled = false,
  required,
  readOnly = false,
  label = 'סוג פגישה',
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
        readOnly={readOnly}
        onChange={(_, val) => onChange(val || '')}
        placeholder="בחר סוג פגישה"
        renderValue={() => renderTypeValue(value, 'בחר סוג פגישה')}
        slotProps={{
          listbox: {
            sx: { maxHeight: 240, width: '100%', zIndex: 2000 },
          },
        }}
      >
        {MEETING_TYPES.map((opt) => (
          <Option key={opt.id} value={opt.id} disabled={opt.disabled}>
            {renderTypeOption(opt)}
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
