// features/insightsHub/shared/components/catalogs/CatalogContextSection.js

import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import AccordionGroup from '@mui/joy/AccordionGroup'

import CatalogGroupBlock from './CatalogGroupBlock.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { sectionSx as sx } from '../sx/section.sx'

export default function CatalogContextSection({
  context,
  factsMap,
}) {
  if (!context) return null

  const groups = Array.isArray(context.groups)
    ? context.groups.filter((group) => {
        const factsCount = Array.isArray(group.facts) ? group.facts.length : 0
        const metricsCount = Array.isArray(group.metrics) ? group.metrics.length : 0
        const benchmarksCount = Array.isArray(group.benchmarks) ? group.benchmarks.length : 0

        return factsCount > 0 || metricsCount > 0 || benchmarksCount > 0
      })
    : []

  if (groups.length === 0) return null

  return (
    <Box sx={sx.root}>
      <Box sx={sx.header}>
        <Box sx={sx.titleWrap}>
          <Chip
            size="md"
            variant="soft"
            color={context.idColor || context.color || 'neutral'}
            startDecorator={context.idIcon ? iconUi({ id: context.idIcon }) : null}
          >
            {context.label}
          </Chip>

          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            {groups.length} שכבות מודל
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gap: 0.55 }}>
        {groups.map((group, groupIndex) => (
          <AccordionGroup
            variant="plain"
            transition="0.2s"
            key={group.id}
            sx={sx.accord}
          >
            <CatalogGroupBlock
              group={group}
              groupIndex={groupIndex}
              factsMap={factsMap}
            />
          </AccordionGroup>
        ))}
      </Box>
    </Box>
  )
}
