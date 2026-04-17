/// ui/fields/selectUi/meetings/MeetingStatusSelectField.js

import * as React from 'react'
import { Box, FormControl, FormLabel, Option, Select, Typography } from '@mui/joy'
import { MEETING_STATUSES } from '../../../../shared/meetings/meetings.constants.js'
import { iconUi } from '../../../core/icons/iconUi.js'

function findStatus(value) {
  return MEETING_STATUSES.find((item) => item.id === value) || null
}

function getStatusColor(opt) {
  if (opt?.id === 'canceled') return 'danger'
  if (opt?.id === 'done') return 'success'
  return 'primary'
}

function renderStatusOption(opt) {
  const color = getStatusColor(opt)

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: opt?.id === 'canceled' ? 'danger.600' : 'inherit' }}>
      {iconUi({ id: opt.idIcon, size: 'sm', color })}
      <Typography level="body-sm">{opt.labelH}</Typography>
    </Box>
  )
}

function renderStatusValue(value, placeholder) {
  const selected = findStatus(value)
  if (!selected) return placeholder

  const isCanceled = selected.id === 'canceled'

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        minWidth: 0,
        color: isCanceled ? 'danger.600' : 'inherit',
      }}
    >
      {iconUi({
        id: selected.idIcon,
        size: 'sm',
        color: isCanceled ? 'danger' : selected.id === 'done' ? 'success' : 'primary',
      })}
      <Typography level="body-sm" noWrap>
        {selected.labelH}
      </Typography>
    </Box>
  )
}

export default function MeetingStatusSelectField({
  label = 'סטטוס פגישה',
  value = '',
  onChange,
  disabled,
  required,
  error,
  size = 'sm',
  readOnly = false,
  placeholder = 'בחר סטטוס',
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
        onChange={(_, val) => onChange?.(val || '')}
        placeholder={placeholder}
        renderValue={() => renderStatusValue(value, placeholder)}
        slotProps={{
          listbox: {
            sx: { maxHeight: 240, width: '100%', zIndex: 2000 },
          },
        }}
      >
        {MEETING_STATUSES.map((opt) => (
          <Option key={opt.id} value={opt.id} disabled={opt.disabled}>
            {renderStatusOption(opt)}
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
