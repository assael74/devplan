// fields/selectUi/videos/videoAnalysis/VideoObjectTypeSelectField.js

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
import { VIDEOANALYSIS_OBJECTTYPES } from '../../../../../shared/videoAnalysis/videoAnalysis.constants.js'

const getOptionId = opt => {
  return opt?.id || opt?.value || ''
}

const getOptionKey = (opt, index) => {
  const id = getOptionId(opt)
  return id ? `${id}-${index}` : `object-type-${index}`
}

export default function VideoObjectTypeSelectField({
  value,
  onChange,
  disabled,
  helperText,
  required,
  readOnly,
  size = 'sm',
  error,
  label = 'שייך ל',
  placeholder = 'בחר ישות',
  options,
}) {
  const opts =
    Array.isArray(options) && options.length
      ? options
      : VIDEOANALYSIS_OBJECTTYPES

    const selectedOpt = useMemo(() => {
      return opts.find(opt => {
        const optionId = opt?.id || opt?.value || ''
        return optionId === value
      }) || null
    }, [opts, value])

  const handleChange = (_, newValue) => {
    if (readOnly) return
    onChange(newValue)
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
              {iconUi({ id: selectedOpt.idIcon })}
              <Typography level="body-sm">
                {selectedOpt.labelH}
              </Typography>
            </Stack>
          ) : ''
        }
        slotProps={{ listbox: { sx: { maxHeight: 240 } } }}
      >
      {opts.map((opt, index) => {
        const optionId = opt?.id || opt?.value || ''

        if (!optionId) return null

        return (
          <Option
            key={`${optionId}-${index}`}
            value={optionId}
            disabled={opt.disabled}
          >
            <Stack direction="row" gap={1.5} alignItems="center">
              {iconUi({ id: opt.idIcon })}
              <Typography level="body-sm">{opt.labelH}</Typography>
            </Stack>
          </Option>
        )
        })}
      </Select>

      {helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  )
}
