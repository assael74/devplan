/// ui/fields/games/GameTypeSelectField.js

import * as React from 'react'
import { FormControl, FormHelperText, FormLabel, Option, Select, Stack } from '@mui/joy'
import { iconUi } from '../../core/icons/iconUi.js'
import { GAME_TYPE } from '../../../shared/games/games.constants.js'
import { gameSelectSlotProps } from './sx/gamesSelect.sx.js'

export default function GameTypeSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required = false,
  readOnly = false,
  helperText,
  label = 'סוג משחק',
  placeholder = 'סוג משחק',
  size = 'sm',
  sx,
  slotProps = {},
}) {
  return (
    <FormControl
      error={error}
      required={required}
      disabled={disabled}
      sx={{ width: '100%', ...sx }}
    >
      <FormLabel required={required} sx={{ fontSize: '12px' }}>
        {label}
      </FormLabel>

      <Select
        value={value}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        onChange={(_, val) => onChange?.(val)}
        placeholder={placeholder}
        slotProps={{ ...gameSelectSlotProps, ...slotProps }}
      >
        {GAME_TYPE.map((opt) => (
          <Option key={opt.id} value={opt.id} disabled={opt.disabled}>
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
