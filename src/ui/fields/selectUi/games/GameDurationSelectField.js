// ui/fields/selectUi/games/GameDurationSelectField.js
import * as React from 'react';
import { FormControl, FormLabel, Select, Option, Typography, Stack } from '@mui/joy';
import { iconUi } from '../../../core/icons/iconUi.js';
import { gameSlot } from '../select.sx.js'

export default function GameDurationSelectField({
  value,
  onChange,
  error = false,
  disabled = false,
  required,
  label = 'זמן משחק',
  size = 'sm',
}) {
  return (
    <FormControl error={error} required={required} sx={{ width: '100%' }}>
      <FormLabel sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Select
        value={value}
        size={size}
        onChange={(_, val) => onChange(val)}
        placeholder='בחר זמן משחק'
        slotProps={gameSlot.listbox}
      >
        <Option value={70}>70 דקות</Option>
        <Option value={80}>80 דקות</Option>
        <Option value={90}>90 דקות</Option>
        <Option value={120}>120 דקות</Option>
      </Select>
    </FormControl>
  );
}
