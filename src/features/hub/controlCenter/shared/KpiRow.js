// src/features/hub/controlCenter/shared/KpiRow.js

import React from 'react'
import { Box } from '@mui/joy'

import KpiCard from './KpiCard.js'

const EMPTY_KPI_SLOTS = [null, null, null, null, null]

export default function KpiRow({ items, compact = false }) {
  const list = Array.isArray(items) && items.length ? items : EMPTY_KPI_SLOTS

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
        gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
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
