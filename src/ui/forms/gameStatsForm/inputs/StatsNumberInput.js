// src/ui/forms/gameStatsForm/inputs/StatsNumberInput.js

import React from 'react'
import { FormControl, FormLabel, Input } from '@mui/joy'

import { inputsSx as sx } from './sx/inputs.sx.js'

export default function StatsNumberInput({ label, value, onChange, readOnly = false }) {
  const inputRef = React.useRef(null);

  const blockNegativeInput = event => {
    if (event.key === '-' || event.key === 'Minus') {
      event.preventDefault()
    }
  }

  const blockNegativePaste = event => {
    const text = event.clipboardData.getData('text')

    if (text.includes('-')) {
      event.preventDefault()
    }
  }

  const isValidNonNegativeValue = value => {
    if (value === '') return true

    const num = Number(value)
    return Number.isFinite(num) && num >= 0
  }

  return (
    <FormControl size="sm" sx={sx.compactField}>
      <FormLabel>{label}</FormLabel>

      <Input
        type="number"
        value={value ?? ''}
        readOnly={readOnly}
        onChange={event => {
          const next = event.target.value
          if (isValidNonNegativeValue(next)) onChange(next)
        }}
        slotProps={{
          input: {
            ref: inputRef,
            min: 0,
          },
        }}
      />
    </FormControl>
  )
}
