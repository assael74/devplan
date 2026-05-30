// src/ui/forms/gameStatsForm/inputs/StatsFieldRenderer.js

import React from 'react'

import StatsNumberInput from './StatsNumberInput.js'
import StatsBooleanInput from './StatsBooleanInput.js'
import StatsSelectInput from './StatsSelectInput.js'

export default function StatsFieldRenderer({ parm, value, onChange }) {
  const label = parm?.statsParmShortName || parm?.statsParmName || parm?.id

  if (parm?.statsParmFieldType === 'boolean') {
    return (
      <StatsBooleanInput
        label={label}
        value={value}
        onChange={onChange}
      />
    )
  }

  if (parm?.statsParmFieldType === 'select') {
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
