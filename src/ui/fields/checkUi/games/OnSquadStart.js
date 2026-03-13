/// ui/fields/checkUi/games/OnSquadStart.js

import React from 'react'
import { Chip, FormControl, FormLabel } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'

export default function OnSquadStart({
  value = false,
  onChange,
  label = 'פותח בהרכב',
  size = 'sm',
  disabled = false,
  required = false
}) {
  const handleToggle = () => {
    if (disabled) return
    onChange(!value)
  }

  return (
    <FormControl>
      <FormLabel required={required} sx={{ fontSize: '12px' }}>{label}</FormLabel>

      <Chip
        size={size}
        disabled={disabled}
        variant={value ? 'solid' : 'soft'}
        color={value ? 'success' : 'neutral'}
        startDecorator={iconUi({
          id: value ? 'isStart' : 'isNotStart',
          size,
        })}
        onClick={handleToggle}
      >
        {value ? 'פותח' : 'לא פותח'}
      </Chip>
    </FormControl>
  )
}
