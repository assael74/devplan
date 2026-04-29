// features/insightsHub/shared/components/insights/InsightContextSection.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { insightsSx as sx } from '../sx/insights.sx'
import InsightGroup from './InsightGroup.js'

export default function InsightContextSection({ context, metricsMap }) {
  if (!context?.groups?.length) return null

  const insightsCount = context.groups.reduce((sum, group) => {
    return sum + (Array.isArray(group.insights) ? group.insights.length : 0)
  }, 0)

  return (
    <Box sx={sx.contextSection}>
      <Box sx={sx.contextHeader}>
        <Chip
          size="md"
          variant="soft"
          color={context.idColor || context.color || 'neutral'}
          startDecorator={context.idIcon ? iconUi({ id: context.idIcon }) : null}
        >
          {context.label}
        </Chip>

        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          {insightsCount} תובנות
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.8 }}>
        {context.groups.map((group) => (
          <InsightGroup
            key={group.id}
            group={group}
            metricsMap={metricsMap}
          />
        ))}
      </Box>
    </Box>
  )
}
