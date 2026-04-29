// features/insightsHub/shared/components/insights/InsightItems.js

import React from 'react'
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Tooltip,
  Typography,
} from '@mui/joy'

import { insightsSx as sx } from '../sx/insights.sx'

import {
  getMetricLabel,
  getInsightMeta,
  INSIGHT_USAGE_LABELS,
  INSIGHT_USAGE_COLORS,
  INSIGHT_READINESS_LABELS,
  INSIGHT_READINESS_COLORS,
} from '../../logic/insights/index.js'

function InsightTooltip({ insight, metricsMap }) {
  const {
    basedOnMetrics,
    missingMetrics,
    requiredNewFacts,
  } = getInsightMeta(insight)

  return (
    <Box sx={{ display: 'grid', gap: 0.75, maxWidth: 300 }}>
      <Box sx={{ display: 'grid', gap: 0.25 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700 }}>
          מדדים קיימים
        </Typography>

        {basedOnMetrics.length > 0 ? (
          basedOnMetrics.map((metricId) => (
            <Typography
              key={metricId}
              level="body-xs"
              sx={{ color: 'text.secondary', lineHeight: 1.45 }}
            >
              • {getMetricLabel(metricsMap, metricId)}
            </Typography>
          ))
        ) : (
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            לא הוגדרו מדדים קיימים.
          </Typography>
        )}
      </Box>

      {missingMetrics.length > 0 ? (
        <>
          <Divider />

          <Box sx={{ display: 'grid', gap: 0.25 }}>
            <Typography level="body-xs" sx={{ fontWeight: 700 }}>
              מדדים חסרים
            </Typography>

            {missingMetrics.map((metricId) => (
              <Typography
                key={metricId}
                level="body-xs"
                sx={{ color: 'warning.plainColor', lineHeight: 1.45 }}
              >
                • {metricId}
              </Typography>
            ))}
          </Box>
        </>
      ) : null}

      {requiredNewFacts.length > 0 ? (
        <>
          <Divider />

          <Box sx={{ display: 'grid', gap: 0.25 }}>
            <Typography level="body-xs" sx={{ fontWeight: 700 }}>
              דאטה חסר
            </Typography>

            {requiredNewFacts.map((factId) => (
              <Typography
                key={factId}
                level="body-xs"
                sx={{ color: 'danger.plainColor', lineHeight: 1.45 }}
              >
                • {factId}
              </Typography>
            ))}
          </Box>
        </>
      ) : null}
    </Box>
  )
}

export function InsightItem({ insight, metricsMap }) {
  const {
    usage,
    readiness,
  } = getInsightMeta(insight)

  return (
    <AccordionGroup
      variant="plain"
      transition="0.2s"
      sx={sx.itemAccordionGroup}
    >
      <Accordion>
        <AccordionSummary>
          <Box sx={sx.itemSummaryContent}>
            <Box sx={sx.itemTop}>
              <Typography level="body-sm" sx={sx.itemTitle}>
                {insight.label}
              </Typography>

              <Tooltip
                size="sm"
                variant="soft"
                title={<InsightTooltip insight={insight} metricsMap={metricsMap} />}
              >
                <Box sx={sx.infoIcon}>
                  i
                </Box>
              </Tooltip>
            </Box>

            <Box sx={sx.summaryChips}>
              <Chip
                size="sm"
                variant="soft"
                sx={{ fontSize: 10 }}
                color={INSIGHT_USAGE_COLORS[usage] || 'neutral'}
              >
                {INSIGHT_USAGE_LABELS[usage] || usage}
              </Chip>

              <Chip
                size="sm"
                variant="soft"
                sx={{ fontSize: 10 }}
                color={INSIGHT_READINESS_COLORS[readiness] || 'neutral'}
              >
                {INSIGHT_READINESS_LABELS[readiness] || readiness}
              </Chip>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Typography level="body-xs" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
            {insight.description || 'אין הסבר לתובנה זו.'}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  )
}
