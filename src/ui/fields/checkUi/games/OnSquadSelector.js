/// ui/fields/checkUi/games/OnSquadSelector.js

import React from 'react'
import { Chip, FormControl, FormLabel } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'

export default function OnSquadSelector({
  value = false,
  onChange,
  label = 'בסגל',
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
          id: value ? 'isSquad' : 'isNotSquad',
          size,
        })}
        onClick={handleToggle}
      >
        {value ? 'בסגל' : 'לא בסגל'}
      </Chip>
    </FormControl>
  )
}
