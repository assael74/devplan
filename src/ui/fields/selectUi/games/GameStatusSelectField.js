// ui/fields/selectUi/games/GameStatusSelectField.js

import * as React from 'react'
import { FormControl, FormLabel, Select, Option, Stack } from '@mui/joy'

import { iconUi } from '../../../core/icons/iconUi.js'
import { GAME_STATUS } from '../../../../shared/games/games.constants.js'
import { gameSlot } from '../select.sx.js'

export default function GameStatusSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'סטטוס משחק',
  size = 'sm',
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Select
        value={value || 'scheduled'}
        size={size}
        disabled={disabled}
        onChange={(_, val) => onChange(val || 'scheduled')}
        placeholder="סטטוס משחק"
        slotProps={{ ...gameSlot.listbox, ...gameSlot.button }}
      >
        {GAME_STATUS.map((opt) => (
          <Option key={opt.id} value={opt.id} disabled={opt.disabled}>
            <Stack direction="row" gap={1} alignItems="center">
              {iconUi({ id: opt.idIcon, size: 'sm' })}
              {opt.labelH}
            </Stack>
          </Option>
        ))}
      </Select>
    </FormControl>
  )
}
