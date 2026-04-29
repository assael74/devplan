// features/insightsHub/shared/components/catalogs/CatalogPanel.js

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'

import {
  buildCatalogFactsMap,
  resolveCatalogContexts,
} from '../../logic/catalog/index.js'

import CatalogContextSection from './CatalogContextSection.js'
import { catalogSx as sx } from '../sx/catalog.sx'

export default function CatalogPanel({
  title,
  subtitle,
  iconId,
  contexts = [],
  factsCatalog = [],
  metricsCatalog = [],
  benchmarksCatalog = [],
}) {
  const factsMap = useMemo(() => {
    return buildCatalogFactsMap(factsCatalog)
  }, [factsCatalog])
  
  const resolvedContexts = useMemo(() => {
    return resolveCatalogContexts({
      contexts,
      factsCatalog,
      metricsCatalog,
      benchmarksCatalog,
    })
  }, [contexts, factsCatalog, metricsCatalog, benchmarksCatalog])

  const visibleContexts = resolvedContexts.filter((context) => {
    const groups = Array.isArray(context.groups) ? context.groups : []

    return groups.some((group) => {
      const factsCount = Array.isArray(group.facts) ? group.facts.length : 0
      const metricsCount = Array.isArray(group.metrics) ? group.metrics.length : 0
      const benchmarksCount = Array.isArray(group.benchmarks) ? group.benchmarks.length : 0

      return factsCount > 0 || metricsCount > 0 || benchmarksCount > 0
    })
  })

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
        <Box sx={{ display: 'grid', alignContent: 'start', gap: 1.15, px: 0 }}>
          {visibleContexts.map((context, contextIndex) => (
            <CatalogContextSection
              key={context.id}
              context={context}
              contextIndex={contextIndex}
              factsMap={factsMap}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}
