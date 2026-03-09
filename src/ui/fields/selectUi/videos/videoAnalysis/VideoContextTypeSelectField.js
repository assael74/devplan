/// fields/selectUi/videos/videoAnalysis/VideoContextTypeSelectField.js
import React, { useMemo } from 'react'
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  Option,
  Stack,
  Typography,
} from '@mui/joy'
import { iconUi } from '../../../../core/icons/iconUi.js'
import { VIDEOANALYSIS_CONTEXTTYPES } from '../../../../../shared/videoAnalysis/videoAnalysis.constants.js'

export default function VideoContextTypeSelectField({
  value,
  onChange,
  disabled,
  helperText,
  required,
  readOnly,
  size = 'sm',
  error,
  label = 'סוג קישור',
  placeholder = 'בחר סוג קישור',
  options,
}) {
  const opts =
    Array.isArray(options) && options.length
      ? options
      : VIDEOANALYSIS_CONTEXTTYPES

  const selectedOpt = useMemo(
    () => opts.find((o) => o.id === value) || null,
    [opts, value]
  )

  const handleChange = (_, newValue) => {
    if (!readOnly) onChange(newValue)
  }

  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: 12 }}>{label}</FormLabel>

      <Select
        size={size}
        disabled={disabled || readOnly}
        value={value || null}
        onChange={handleChange}
        placeholder={placeholder}
        renderValue={() =>
          selectedOpt ? (
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({id: selectedOpt.idIcon})}
              <Typography level="body-sm">
                {selectedOpt.labelH}
              </Typography>
            </Stack>
          ) : ''
        }
        slotProps={{ listbox: { sx: { maxHeight: 240 } } }}
      >
        {opts.map((opt) => {
          return (
            <Option key={opt.id} value={opt.id} disabled={opt.disabled}>
              <Stack direction="row" gap={1.5} alignItems="center">
                {iconUi({id: opt.idIcon})}
                <Typography level="body-sm">{opt.labelH}</Typography>
              </Stack>
            </Option>
          )
        })}
      </Select>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}
