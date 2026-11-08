// src/features/hub/playerProfile/sharedModules/performance/components/PerformanceMetrics.js

import React from 'react'
import { Box, Typography } from '@mui/joy'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import StatsParameterHelp from '../../../../../../ui/forms/gameStats/inputs/StatsParameterHelp.js'
import {
  formatPerformanceValue,
  getMetricGameValue,
} from '../../../sharedLogic/performance/performance.metrics.logic.js'
import { performanceSx as sx } from '../performance.sx.js'

function Value({ label, value, rate = false, metric }) {
  return (
    <Box>
      <Typography sx={sx.metricLabel}>{label}</Typography>
      <Typography sx={sx.metricValue}>{formatPerformanceValue(value, rate, metric)}</Typography>
    </Box>
  )
}

export function MetricCard({ metric, mode = 'summary' }) {
  const normalized = mode === 'normalized'
  const triplet = metric.type === 'triplet'
  const value = normalized ? metric.average : metric.value
  const success = normalized ? metric.successAverage : metric.success
  const coverage = mode === 'game' ? '' : [
    `נמדד ב־${metric.count} מתוך ${metric.totalGames} משחקים`,
    mode === 'summary' && triplet ? `ממוצע ${formatPerformanceValue(metric.average, false, metric)} למשחק` : '',
    triplet && metric.pairedCount < metric.count ? `אחוזים מ־${metric.pairedCount} משחקים` : '',
  ].filter(Boolean).join(' · ')
  return (
    <Box sx={sx.metricCard(metric.id)} title={coverage || undefined}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.actions}>
          {iconUi({ id: metric.totalKey, size: 'sm' })}
          <Typography sx={sx.metricTitle}>{metric.label}</Typography>
        </Box>
        <StatsParameterHelp label={metric.label} description={metric.description} />
      </Box>
      <Box sx={sx.metricValues(triplet ? 3 : mode === 'summary' ? 2 : 1)}>
        <Value label={normalized ? 'ממוצע מנורמל' : 'סה״כ'} value={value} metric={metric} />
        {triplet ? (
          <>
            <Value label={metric.id === 'shots' ? 'למסגרת' : 'הצלחות'} value={success} metric={metric} />
            <Value label="אחוז הצלחה" value={metric.rate} rate metric={metric} />
          </>
        ) : mode === 'summary' ? <Value label="ממוצע למשחק" value={metric.average} metric={metric} /> : null}
      </Box>
    </Box>
  )
}

export default function PerformanceMetrics({
  metrics,
  game = null,
  mode = 'summary',
  target = 'age',
}) {
  const cards = game
    ? metrics.map(metric => {
      const values = getMetricGameValue(game, metric, mode === 'normalized' ? target : null)
      return {
        ...metric, ...values, average: values.value, successAverage: values.success,
        count: values.value === null ? 0 : 1, totalGames: 1, pairedCount: values.rate === null ? 0 : 1,
      }
    })
    : metrics
  const visible = cards.filter(metric => metric.value !== null || metric.success !== null)
  if (!visible.length) {
    return <Typography sx={sx.notice}>{mode === 'normalized'
      ? 'אין בסיס לנרמול בתצוגה זו. יש לבדוק את דקות הניתוח ובסיס הזמן.'
      : 'אין מדדים שנמדדו לתצוגה זו. ניתן לערוך את הסטטיסטיקה של המשחק.'}</Typography>
  }
  return (
    <Box sx={sx.metricsGrid}>
      {visible.map(metric => <MetricCard key={metric.id} metric={metric} mode={game && mode !== 'normalized' ? 'game' : mode} />)}
    </Box>
  )
}
