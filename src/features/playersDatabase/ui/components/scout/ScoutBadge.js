// features/playersDatabase/ui/components/scout/ScoutBadge.js

import * as React from 'react'

import ScoutPriority from '../../../../../ui/patterns/scout/ScoutPriority.js'

/**
 * Compatibility adapter for existing playersDatabase consumers.
 * The shared presentation component now lives under ui/patterns/scout.
 */
export default function ScoutBadge({
  value,
  label,
  short = false,
  tooltip,
  fontSize = 13,
}) {
  return (
    <ScoutPriority
      value={value}
      label={label}
      short={short}
      tooltip={tooltip}
      fontSize={fontSize}
    />
  )
}
