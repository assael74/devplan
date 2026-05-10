// playerProfile/sharedUi/insights/playerGames/sections/shared/SectionMetricsGrid.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  MetricMiniCard,
} from '../../../../../../../../ui/patterns/insights/index.js'

import {
  normalizeColor,
  renderTooltip,
  safeArray,
} from './index.js'

import SectionEmptyState from './SectionEmptyState.js'

const resolveColumns = ({ cols, count }) => {
  const value = Number(cols || count)

  if (value === 2) {
    return {
      xs: '1fr',
      sm: '1fr 1fr',
    }
  }

  if (value === 3) {
    return {
      xs: '1fr',
      sm: '1fr 1fr 1fr',
    }
  }

  if (value >= 4) {
    return {
      xs: '1fr',
      sm: '1fr 1fr',
      md: 'repeat(4, minmax(0, 1fr))',
    }
  }

  return {
    xs: '1fr',
    sm: '1fr 1fr',
  }
}

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
