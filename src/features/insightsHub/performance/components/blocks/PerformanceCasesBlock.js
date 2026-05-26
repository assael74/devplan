// features/insightsHub/performance/components/blocks/PerformanceCasesBlock.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import PerformanceCaseCard from './PerformanceCaseCard.js'
import PerformanceFormulaCard from './PerformanceFormulaCard.js'

import {
  blocksSx,
} from './sx/blocks.sx.js'

function FactsList({ items = [] }) {
  if (!items.length) return null

  return (
    <Box component="ul" sx={blocksSx.list}>
      {items.map(item => (
        <Box key={item} component="li" sx={blocksSx.listItem}>
          {item}
        </Box>
      ))}
    </Box>
  )
}

export default function PerformanceCasesBlock({ block }) {
  if (!block) return null

  return (
    <Box sx={blocksSx.body}>
      {block.intro ? (
        <Typography level="body-sm" sx={blocksSx.intro}>
          {block.intro}
        </Typography>
      ) : null}

      {block.formulas?.map(item => (
        <PerformanceFormulaCard key={item.id} item={item} />
      ))}

      {block.cases?.length ? (
        <Box sx={blocksSx.caseGrid}>
          {block.cases.map(item => (
            <PerformanceCaseCard key={item.id} item={item} />
          ))}
        </Box>
      ) : null}

      <FactsList items={block.facts} />
    </Box>
  )
}
