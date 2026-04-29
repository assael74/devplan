// features/insightsHub/shared/components/insights/InsightsPanel.js

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import EmptyInsights from '../EmptyInsights.js'
import InsightContextSection from './InsightContextSection.js'

import { catalogSx as sx } from '../sx/catalog.sx'

import {
  buildMetricsMap,
  resolveInsightsByContexts,
} from '../../logic/insights/index.js'

export default function InsightsPanel({
  title,
  subtitle,
  iconId = 'insights',
  contexts = [],
  insightsCatalog = [],
  metricsCatalog = [],
  insightsTitle,
  insightsSubtitle,
}) {
  const metricsMap = useMemo(() => {
    return buildMetricsMap(metricsCatalog)
  }, [metricsCatalog])

  const resolvedContexts = useMemo(() => {
    return resolveInsightsByContexts({
      contexts,
      insightsCatalog,
    })
  }, [contexts, insightsCatalog])

  const hasInsights = resolvedContexts.length > 0

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.iconWrap}>
          {iconUi({ id: iconId, size: 'sm' })}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        </Box>
      </Box>

      <Box className="dpScrollThin" sx={sx.body}>
        {hasInsights ? (
          <Box sx={{ display: 'grid', alignContent: 'start', gap: 1.15, px: 0 }}>
            {resolvedContexts.map((context) => (
              <InsightContextSection
                key={context.id}
                context={context}
                metricsMap={metricsMap}
              />
            ))}
          </Box>
        ) : (
          <EmptyInsights
            title={insightsTitle}
            subtitle={insightsSubtitle}
          />
        )}
      </Box>
    </Box>
  )
}
