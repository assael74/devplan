// teamProfile/sharedUi/insights/teamGames/sections/cards/DifficultyCards.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  buildDifficultyCardsModel,
} from '../../../../../sharedLogic/games/index.js'

import {
  CurrentMetricsCardView,
  InsightCardView,
  ProjectionCardView,
} from '../shared/index.js'

import { difficultySx as sx } from '../sx/difficulty.sx.js'

export default function DifficultyCards({ data, brief, isMobile }) {
  const model = buildDifficultyCardsModel({
    data,
    brief,
  })

  return (
    <Box sx={sx.grid}>
      <CurrentMetricsCardView
        model={model.current}
        isMobile={isMobile}
        sx={sx}
      />

      <InsightCardView
        model={model.insight}
        sx={sx}
      />

      <ProjectionCardView
        model={model.projection}
        sx={sx}
      />
    </Box>
  )
}
