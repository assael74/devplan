// features/insightsHub/shared/components/catalogs/CatalogGroupBlock.js

import React from 'react'
import {
  Accordion,
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import AccordionDetails from '@mui/joy/AccordionDetails'
import AccordionSummary from '@mui/joy/AccordionSummary'

import { catalogSx as sx } from '../sx/catalog.sx'
import { FactItem, MetricItem, BenchmarkItem } from './CatalogItems.js'

function LayerBlock({ title, color, children }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.45, my: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
        <Chip
          size="sm"
          variant="soft"
          color={color}
          sx={{ border: '1px solid', borderColor: 'divider' }}
        >
          {title}
        </Chip>
      </Box>

      {children}
    </Box>
  )
}

export default function CatalogGroupBlock({ group, groupIndex, factsMap }) {
  const facts = Array.isArray(group.facts) ? group.facts : []
  const metrics = Array.isArray(group.metrics) ? group.metrics : []
  const benchmarks = Array.isArray(group.benchmarks) ? group.benchmarks : []

  return (
    <Accordion defaultExpanded={groupIndex === 0}>
      <AccordionSummary>
        <Box sx={sx.summaryInner}>
          <Typography level="body-sm" sx={{ color: 'text.primary' }}>
            {group.label}
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary', mr: 'auto', fontSize: 10 }}>
            {facts.length} עובדות · {metrics.length} מדדים
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={sx.layerStack}>
          {facts.length > 0 ? (
            <LayerBlock title="עובדות" color="danger">
              <Box sx={{ display: 'grid', gap: 0.4 }}>
                {facts.map((fact, index) => (
                  <FactItem key={fact.id} fact={fact} index={index} />
                ))}
              </Box>
            </LayerBlock>
          ) : null}

          {metrics.length > 0 ? (
            <LayerBlock title="מדדים" color="primary">
              <Box sx={{ display: 'grid', gap: 0.4 }}>
                {metrics.map((metric, index) => (
                  <MetricItem
                    key={metric.id}
                    metric={metric}
                    index={index}
                    factsMap={factsMap}
                  />
                ))}
              </Box>
            </LayerBlock>
          ) : null}

          {benchmarks.length > 0 ? (
            <LayerBlock title="כמה צריך לבצע" color="warning">
              <Box sx={{ display: 'grid', gap: 0.4 }}>
                {benchmarks.map((benchmark, index) => (
                  <BenchmarkItem
                    key={benchmark.id}
                    benchmark={benchmark}
                    index={index}
                  />
                ))}
              </Box>
            </LayerBlock>
          ) : null}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}
