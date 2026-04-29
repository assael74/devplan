// features/insightsHub/shared/components/catalogs/CatalogItems.js

import React from 'react'
import {
  Box,
  Divider,
  Sheet,
  Tooltip,
  Typography,
  AccordionGroup,
  Accordion,
  AccordionDetails,
  AccordionSummary
} from '@mui/joy'

import {
  CATALOG_VALUE_TYPE_LABELS,
  CATALOG_UNIT_LABELS,
} from '../../logic/catalog/index.js'

import { catalogSx as sx } from '../sx/catalog.sx'

function getFactLabel(factsMap, factId) {
  return factsMap.get(factId)?.label || `לא נמצא בקטלוג: ${factId}`
}

function FactTooltip({ fact }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.25 }}>
      <Typography level="body-xs" sx={{ fontWeight: 700 }}>
        שדה מקור
      </Typography>

      <Typography level="body-xs" sx={sx.fieldText}>
        {fact?.field || '—'}
      </Typography>
    </Box>
  )
}

function MetricTooltip({ metric, factsMap }) {
  const requiredFacts = Array.isArray(metric?.requiredFacts)
    ? metric.requiredFacts
    : []

  return (
    <Box sx={{ display: 'grid', gap: 0.75, maxWidth: 280 }}>
      <Box sx={{ display: 'grid', gap: 0.25 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700 }}>
          פרטי מדד
        </Typography>

        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
          סוג: {CATALOG_VALUE_TYPE_LABELS[metric?.valueType] || metric?.valueType || '—'}
        </Typography>

        <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
          יחידה: {CATALOG_UNIT_LABELS[metric?.unit] || metric?.unit || '—'}
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ display: 'grid', gap: 0.4 }}>
        <Typography level="body-xs" sx={{ fontWeight: 700 }}>
          עובדות נדרשות לחישוב
        </Typography>

        {requiredFacts.length > 0 ? (
          requiredFacts.map((factId) => (
            <Typography
              key={factId}
              level="body-xs"
              sx={{
                color: factsMap.has(factId) ? 'text.secondary' : 'danger.plainColor',
                lineHeight: 1.45,
              }}
            >
              • {getFactLabel(factsMap, factId)}
            </Typography>
          ))
        ) : (
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            לא הוגדרו עובדות נדרשות.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

function BenchmarkTooltip({ benchmark }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.25, maxWidth: 280 }}>
      <Typography level="body-xs" sx={{ fontWeight: 700 }}>
        הסבר
      </Typography>

      <Typography level="body-xs" sx={{ color: 'text.secondary', lineHeight: 1.45 }}>
        {benchmark?.description || 'לא הוגדר הסבר לנקודת ייחוס זו.'}
      </Typography>
    </Box>
  )
}

function InfoIcon() {
  return (
    <Box sx={sx.infoIcon}>
      i
    </Box>
  )
}

function CatalogItemIndex({ index }) {
  return (
    <Typography level="body-xs" sx={sx.index}>
      {index + 1}
    </Typography>
  )
}

export function FactItem({ fact, index }) {
  return (
    <Sheet variant="soft" sx={sx.item}>
      <Box sx={sx.itemRow}>
        <CatalogItemIndex index={index} />

        <Typography level="body-xs" sx={sx.label}>
          {fact.label}
        </Typography>

        {fact.field ? (
          <Tooltip size="sm" variant="soft" title={<FactTooltip fact={fact} />}>
            <Box>
              <InfoIcon />
            </Box>
          </Tooltip>
        ) : null}
      </Box>
    </Sheet>
  )
}

export function MetricItem({ metric, index, factsMap }) {
  const valueTypeLabel = CATALOG_VALUE_TYPE_LABELS[metric?.valueType] || metric?.valueType || '—'
  const unitLabel = CATALOG_UNIT_LABELS[metric?.unit] || metric?.unit || '—'

  return (
    <Sheet variant="soft" sx={sx.item}>
      <Box sx={sx.itemRow}>
        <CatalogItemIndex index={index} />

        <Box sx={{ minWidth: 0, flex: 1, display: 'grid', gap: 0.15 }}>
          <Typography level="body-xs" sx={sx.label}>
            {metric.label}
          </Typography>

          <Typography
            level="body-xs"
            sx={{ color: 'text.tertiary', fontSize: 11, lineHeight: 1.2 }}
          >
            {valueTypeLabel} · {unitLabel}
          </Typography>
        </Box>

        <Tooltip
          size="sm"
          variant="soft"
          title={<MetricTooltip metric={metric} factsMap={factsMap} />}
        >
          <Box>
            <InfoIcon />
          </Box>
        </Tooltip>
      </Box>
    </Sheet>
  )
}

export function BenchmarkItem({ benchmark, index }) {
  const rows = Array.isArray(benchmark?.rows) ? benchmark.rows : []

  return (
    <AccordionGroup
      variant="plain"
      transition="0.2s"
      sx={sx.accordion}
    >
      <Accordion defaultExpanded>
        <AccordionSummary>
          <CatalogItemIndex index={index} />

          <Typography level="body-xs" sx={sx.label}>
            {benchmark.label}
          </Typography>

          <Tooltip
            size="sm"
            variant="soft"
            title={<BenchmarkTooltip benchmark={benchmark} />}
          >
            <Box>
              <InfoIcon />
            </Box>
          </Tooltip>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ minWidth: 0, flex: 1, display: 'grid', gap: 0.3 }}>
            {rows.length > 0 ? (
              <Box sx={{ display: 'grid', gap: 0.2, mt: 0.25 }}>
                {rows.map((row) => (
                  <Box
                    key={row.id}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
                  >
                    <Typography level="body-xs" sx={{ color: 'text.secondary', lineHeight: 1.35 }}>
                      {row.label}
                    </Typography>

                    <Typography level="body-xs" sx={{ color: 'text.primary', fontWeight: 700 }}>
                      {row.value}
                      {row.unit === 'percent' ? '%' : ''}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : null}
          </Box>
        </AccordionDetails>
      </Accordion>
    </AccordionGroup>
  )
}
