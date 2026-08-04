// src/ui/forms/gameStats/inputs/StatsFieldRenderer.js

import React from 'react'

import StatsNumberInput from './StatsNumberInput.js'
import StatsBooleanInput from './StatsBooleanInput.js'
import StatsSelectInput from './StatsSelectInput.js'

export default function StatsFieldRenderer({ param, value, onChange }) {
  const label = param?.statsParmShortName || param?.statsParmName || param?.id

  if (param?.statsParmFieldType === 'boolean') {
    return (
      <StatsBooleanInput
        label={label}
        value={value}
        onChange={onChange}
      />
    )
  }

  if (param?.statsParmFieldType === 'select') {
    return (
      <StatsSelectInput
        label={label}
        value={value}
        onChange={onChange}
      />
    )
  }

  return (
    <StatsNumberInput
      label={label}
      value={value}
      onChange={onChange}
    />
  )
}
