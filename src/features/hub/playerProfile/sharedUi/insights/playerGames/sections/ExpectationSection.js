// playerProfile/sharedUi/insights/playerGames/sections/ExpectationSection.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import {
  buildExpectationView,
} from '../../../../sharedLogic/games/insightsDrawer/index.js'

import {
  SectionEmptyState,
  SectionMetricsGrid,
  SectionTakeaway,
} from './shared/index.js'

import { expectationSx as sx } from './sx/Expectation.sx.js'

function PositionChip({ chip }) {
  if (!chip?.label) return null

  return (
    <Chip
      size="sm"
      variant="soft"
      color="neutral"
      sx={sx.positionChip}
    >
      {chip.label}
    </Chip>
  )
}

function BlockHeader({ title, chip = null, }) {
  return (
    <Box sx={sx.blockHeader}>
      <Typography level="body-sm" sx={sx.blockTitle}>
        {title}
      </Typography>

      <PositionChip chip={chip} />
    </Box>
  )
}

function ExpectationBlock({ block }) {
  if (!block?.brief) return null

  return (
    <Sheet variant="soft" sx={sx.block}>
      <BlockHeader
        title={block.title}
        chip={block.chip}
      />

      <SectionMetricsGrid
        sx={sx}
        metrics={block.metrics}
        cols={block.cols}
        emptyTitle={block.emptyTitle}
        emptyText={block.emptyText}
      />

      <SectionTakeaway
        sx={sx}
        takeaway={block.takeaway}
      />
    </Sheet>
  )
}

export default function ExpectationSection({ briefs = {}, targets = {}, gamesData = null }) {
  const model = buildExpectationView({
    briefs,
    targets,
    gamesData
  })

  if (!model.hasAnyData) {
    return (
      <SectionEmptyState
        sx={sx}
        title="אין מספיק נתוני תפוקה"
        text="כדי לבדוק עמידה בציפייה צריך לחבר תפוקה ישירה ותרומה לפי עמדה."
      />
    )
  }

  return (
    <Box sx={sx.mainGrid(model.layout)}>
      {model.blocks.map((block) => (
        <ExpectationBlock
          key={block.id}
          block={block}
        />
      ))}
    </Box>
  )
}
