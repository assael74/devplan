// src/features/hub/controlCenter/shared/KpiRow.js

import React from 'react'
import { Box } from '@mui/joy'

import KpiCard from './KpiCard.js'

export default function KpiRow({ items, compact = false }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : []

  if (!list.length) return null

  return (
    <Box
      className={compact ? 'dpScrollThin' : undefined}
      sx={compact ? {
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 0.25,
      } : {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(132px, 1fr))',
        gap: 1,
      }}
    >
      {list.map((item, index) => (
        <KpiCard
          key={item?.id || `kpi-slot-${index}`}
          item={item}
          compact={compact}
        />
      ))}
    </Box>
  )
}
