// src/features/hub/playerProfile/sharedUi/insights/playerGames/sections/shared/SectionMetricsGrid.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  MetricMiniCard,
} from '../../../../../../../../ui/patterns/insights/index.js'

import { normalizeColor, safeArray } from './shared.utils.js'
import { renderTooltip } from './renderTooltip.js'

import SectionEmptyState from './SectionEmptyState.js'

export default function SectionMetricsGrid({
  sx,
  metrics = [],
  cols = null,
  emptyTitle,
  emptyText,
}) {
  const safeMetrics = safeArray(metrics)

  const gridSx =
    typeof sx?.metricsGrid === 'function'
      ? sx.metricsGrid(cols || safeMetrics.length)
      : sx?.metricsGrid

  if (!safeMetrics.length) {
    return (
      <SectionEmptyState
        sx={sx}
        title={emptyTitle}
        text={emptyText}
      />
    )
  }

  return (
    <Box sx={gridSx}>
      {safeMetrics.map((metric) => (
        <MetricMiniCard
          key={metric.id || metric.label}
          label={metric.label}
          value={metric.value}
          sub={metric.sub}
          icon={metric.icon || 'info'}
          color={normalizeColor(metric.color)}
          tooltip={renderTooltip(metric.tooltip)}
        />
      ))}
    </Box>
  )
}
