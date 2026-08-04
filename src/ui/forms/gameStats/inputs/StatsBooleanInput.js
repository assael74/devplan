// src/ui/forms/gameStats/inputs/StatsBooleanInput.js

import React from 'react'
import { Checkbox } from '@mui/joy'

export default function StatsBooleanInput({ label, value, onChange }) {
  return (
    <Checkbox
      checked={!!value}
      onChange={event => onChange(event.target.checked)}
      label={label}
    />
  )
}
