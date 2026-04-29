// features/insightsHub/shared/components/insights/InsightGroup.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { insightsSx as sx } from '../sx/insights.sx'
import { InsightItem } from './InsightItems.js'

export default function InsightGroup({ group, metricsMap }) {
  if (!group?.insights?.length) return null

  return (
    <Box sx={{ display: 'grid', gap: 0.5, px: 0.65 }}>
      <Box sx={sx.groupHeader}>
        <Chip size="sm" variant="soft" color="success">
          {group.label}
        </Chip>

        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          {group.insights.length} תובנות
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.45 }}>
        {group.insights.map((insight) => (
          <InsightItem
            key={insight.id}
            insight={insight}
            metricsMap={metricsMap}
          />
        ))}
      </Box>
    </Box>
  )
}
