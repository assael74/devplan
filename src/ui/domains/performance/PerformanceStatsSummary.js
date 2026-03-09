// src/shared/performance/PerformanceStatsSummary.js
import React, { useMemo } from 'react'
import { Box, Sheet, Divider, Chip } from '@mui/joy'

import { buildPerformanceStatsModel } from '../../../shared/performance/logic/perf.cards.logic.js'
import StatCard from './StatCard'

export default function PerformanceStatsSummary({ fullStats, statsParm = [] }) {
  var model = useMemo(function () {
    return buildPerformanceStatsModel({ fullStats: fullStats, statsParm: statsParm })
  }, [fullStats, statsParm])

  const rmt = fullStats.recordedMinutesTotal
  const rcp = fullStats.recordedCoveragePct

  return (
    <Box sx={{ display: 'grid', gap: 1 }}>

      <Divider />

      <Box sx={{ display: 'grid', gap: 0.75, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' } }}>
        {model.cards.map(function (c) {
          return <StatCard key={c.key} iconId={c.iconId} label={c.label} value={c.value} sub={c.sub} />
        })}
      </Box>
    </Box>
  )
}

function safe(v) { return v == null ? '—' : String(v) }
