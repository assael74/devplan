// src/features/hub/playerProfile/sharedModules/performance/components/PerformanceTrend.js

import React from 'react'
import { Box, Option, Select, Typography } from '@mui/joy'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getFullDateIl } from '../../../../../../shared/format/dateUtils.js'
import { devPlanColors } from '../../../../../../ui/core/theme/Colors.js'
import { getMetricGameValue, formatPerformanceValue, usesWholePerformanceCounts } from '../../../sharedLogic/performance/performance.metrics.logic.js'
import { performanceSx as sx } from '../performance.sx.js'

export default function PerformanceTrend({
  games,
  metrics,
  target,
  metricId,
  onMetric,
}) {
  const available = metrics.filter(metric => games.some(game => getMetricGameValue(game, metric, target).value !== null))
  const metric = available.find(item => item.id === metricId) || available[0]
  if (!metric) return null
  const points = [...games].reverse().map(game => ({
    label: game.date ? getFullDateIl(game.date) : game.rival,
    rival: game.rival,
    value: getMetricGameValue(game, metric, target).value,
  }))
  if (points.filter(point => point.value !== null).length < 2) return null
  return (
    <Box sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Typography sx={sx.sectionTitle}>מגמה לפי משחק · נתונים מנורמלים</Typography>
        <Select size="sm" value={metric.id} onChange={(_, value) => onMetric(value)} sx={sx.filter} aria-label="מדד בגרף המגמה">
          {available.map(item => <Option key={item.id} value={item.id}>{item.label}</Option>)}
        </Select>
      </Box>
      <Box sx={sx.trend}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, bottom: 0, left: 0, right: 12 }}>
            <CartesianGrid vertical={false} stroke={devPlanColors.border} strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis width={38} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={!usesWholePerformanceCounts(metric)} tickFormatter={value => formatPerformanceValue(value, false, metric)} />
            <Tooltip formatter={value => [formatPerformanceValue(value, false, metric), metric.label]} labelFormatter={(_, items) => items[0]?.payload?.rival || ''} />
            <Line type="linear" dataKey="value" stroke={devPlanColors.tertiary} strokeWidth={2.5} connectNulls={false} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  )
}
