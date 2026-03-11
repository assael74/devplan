/// ui/fields/selectUi/meetings/MeetingStatusSelectField.js

import * as React from 'react'
import {
  Box,
  FormControl,
  FormLabel,
  Select,
  Option,
  Typography,
} from '@mui/joy'
import CheckRounded from '@mui/icons-material/CheckRounded'
import { MEETING_STATUSES } from '../../../../shared/meetings/meetings.constants.js'
import { iconUi } from '../../../core/icons/iconUi.js'

export default function MeetingStatusSelectField({
  label = 'סטטוס פגישה',
  value = '',
  currentId = '',
  onChange,
  size = 'sm',
  readOnly = false,
  placeholder = 'בחר סטטוס',
  slotProps = {},
}) {
  const steps = React.useMemo(
    () => (MEETING_STATUSES || []).filter((s) => !s.disabled && s.id !== ''),
    []
  )

  const selectedId = value || ''

  const selectedStep = React.useMemo(
    () => steps.find((s) => s.id === selectedId) || null,
    [steps, selectedId]
  )

  const handleChange = (_, newId) => {
    if (readOnly) return
    onChange?.(newId || '')
  }

  const baseListboxSx = { py: 0.5, zIndex: 2000 }

  return (
    <FormControl size={size} disabled={readOnly}>
      <FormLabel sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {label}
      </FormLabel>

      <Select
        value={selectedId || null}
        onChange={handleChange}
        placeholder={placeholder}
        variant="outlined"
        startDecorator={
          selectedStep ? (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
              {iconUi({ id: selectedStep.idIcon, size })}
            </Box>
          ) : null
        }
        endDecorator={
          selectedStep ? (
            <Typography level="body-xs" sx={{ opacity: 0.7 }}>
              ✓ נבחר
            </Typography>
          ) : null
        }
        slotProps={{
          ...slotProps,
          listbox: {
            ...slotProps.listbox,
            sx: { ...baseListboxSx, ...(slotProps.listbox?.sx || {}) },
          },
        }}
        sx={{
          minWidth: 220,
          borderRadius: 12,
          ...(readOnly ? { opacity: 0.75, pointerEvents: 'none' } : null),
        }}
      >
        {steps.map((s) => {
          const isSelected = s.id === selectedId
          const isCurrent = s.id === currentId

          return (
            <Option
              key={s.id}
              value={s.id}
              sx={{ borderRadius: 10, mx: 0.5, my: 0.25, py: 0.75 }}
            >
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    {iconUi({ id: s.idIcon, size: 'sm' })}
                  </Box>

                  <Typography level="body-sm" noWrap sx={{ fontWeight: isSelected ? 700 : 500 }}>
                    {s.labelH}
                  </Typography>
                </Box>

                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                  {isCurrent && !isSelected ? (
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: 99,
                        bgcolor: 'var(--joy-palette-neutral-solidBg)',
                        opacity: 0.7,
                      }}
                    />
                  ) : null}

                  {isSelected ? <CheckRounded fontSize="small" /> : null}
                </Box>
              </Box>
            </Option>
          )
        })}
      </Select>
    </FormControl>
  )
}
