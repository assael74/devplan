// ui/patterns/insights/ui/BenchmarkTooltip.js

import React from 'react'

import InsightTooltip from './InsightTooltip.js'

import {
  formatActual,
  formatStatus,
  formatTarget,
} from '../utils/index.js'

export default function BenchmarkTooltip({
  row,
  compact = false,
  sourceText = 'לפי יעד המיקום שהוגדר לקבוצה',
}) {
  if (!row) return null

  const rows = [
    {
      id: 'actual',
      label: 'בפועל',
      value: formatActual(row),
    },
    {
      id: 'target',
      label: 'יעד',
      value: formatTarget(row),
    },
    compact
      ? null
      : {
          id: 'source',
          label: 'מקור יעד',
          value: sourceText,
        },
    compact
      ? null
      : {
          id: 'status',
          label: 'סטטוס',
          value: formatStatus(row),
        },
  ].filter(Boolean)

  return (
    <InsightTooltip
      title={row?.label || 'מדד'}
      rows={rows}
    />
  )
}
